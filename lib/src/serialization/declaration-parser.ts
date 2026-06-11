import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { CharReader } from './char-reader.js';
import { FtDeclaredParameters } from './ft-declared-parameters.js';

const State = {
  CommentChar: 'CommentChar',
  Signature: 'Signature',
  WaitingParameter: 'WaitingParameter',
  ParameterName: 'ParameterName',
  WaitingValue: 'WaitingValue',
  Value: 'Value',
  ValueStuffedQuote: 'ValueStuffedQuote',
} as const;

type State = (typeof State)[keyof typeof State];

/**
 * Parser for .ftx file declaration headers.
 * Parses lines like: |!Fielded Text^| Version="1.1" MetaFile="myfile.ftm"
 * @internal
 */
export class DeclarationParser {
  private static readonly NAME_VALUE_SEPARATOR_CHAR = '=';
  private static readonly VALUE_QUOTE_CHAR = '"';

  private readonly _charReader: CharReader;
  private readonly _parameters: FtDeclaredParameters;

  private _nameBuilder: string[] = [];
  private _valueBuilder: string[] = [];

  private _state: State = State.CommentChar;
  private _linePosition = -1;
  private _signature = '';

  constructor(charReader: CharReader, parameters: FtDeclaredParameters) {
    this._charReader = charReader;
    this._parameters = parameters;
  }

  get signature(): string {
    return this._signature;
  }

  set signature(value: string) {
    this._signature = value;
  }

  /**
   * Start parsing a new line.
   */
  startLine(): void {
    this._linePosition = -1;
    this._state = State.CommentChar;
  }

  /**
   * Parse a character from the signature line (first declaration line).
   */
  parseSignatureLineChar(aChar: string): void {
    this._linePosition++;

    switch (this._state) {
      case State.CommentChar:
        // Ignore character (line comment char)
        this._state = State.Signature;
        break;
      case State.Signature:
        // Ignore signature characters
        if (this._linePosition >= this._signature.length) {
          this._state = State.WaitingParameter;
        }
        break;
      default:
        this.parseChar(aChar);
        break;
    }
  }

  /**
   * Parse a character from the second declaration line (if exists).
   */
  parseDeclaration2LineChar(aChar: string): void {
    this._linePosition++;

    if (this._state === State.CommentChar) {
      // Ignore character (line comment char)
      this._state = State.WaitingParameter;
    } else {
      this.parseChar(aChar);
    }
  }

  /**
   * Finish parsing the signature line.
   */
  finishSignatureLine(): void {
    this.finishLine();
  }

  /**
   * Finish parsing all declaration lines and validate.
   */
  finish(): void {
    this.finishLine();

    const versionIdx = this._parameters.indexOfVersion();
    if (versionIdx < 0) {
      throw new Error('Declared parameters missing version');
    }

    if (versionIdx !== 0) {
      throw new Error('Declared parameters version is not first');
    }

    const versionResult = this._parameters.tryGetVersion();
    if (versionResult.isErr()) {
      throw new Error(`Declared parameters invalid version value: ${this._parameters.getValue(versionIdx)}`);
    }
  }

  private parseChar(aChar: string): void {
    switch (this._state) {
      case State.WaitingParameter:
        // Ignore whitespace
        if (!/\s/.test(aChar)) {
          if (aChar === DeclarationParser.NAME_VALUE_SEPARATOR_CHAR) {
            throw new Error(`Declaration parameter name is zero length at parameter ${this._parameters.count}`);
          } else {
            this._nameBuilder = [aChar];
            this._state = State.ParameterName;
          }
        }
        break;

      case State.ParameterName:
        if (aChar !== DeclarationParser.NAME_VALUE_SEPARATOR_CHAR) {
          this._nameBuilder.push(aChar);
        } else {
          this._state = State.WaitingValue;
        }
        break;

      case State.WaitingValue:
        // Ignore initial whitespace
        if (!/\s/.test(aChar)) {
          if (aChar !== DeclarationParser.VALUE_QUOTE_CHAR) {
            throw new Error(`Declaration parameter value not quoted: ${this._nameBuilder.join('')}`);
          } else {
            this._valueBuilder = [];
            this._state = State.Value;
          }
        }
        break;

      case State.Value:
        if (aChar !== DeclarationParser.VALUE_QUOTE_CHAR) {
          this._valueBuilder.push(aChar);
        } else {
          if (this._charReader.peek() === DeclarationParser.VALUE_QUOTE_CHAR.charCodeAt(0)) {
            this._state = State.ValueStuffedQuote;
          } else {
            this._parameters.add(this._nameBuilder.join('').trim(), this._valueBuilder.join(''));
            this._state = State.WaitingParameter;
          }
        }
        break;

      case State.ValueStuffedQuote:
        this._valueBuilder.push(DeclarationParser.VALUE_QUOTE_CHAR);
        this._state = State.Value;
        break;

      default:
        throw new Error(`Unsupported state: ${this._state}`);
    }
  }

  private finishLine(): void {
    switch (this._state) {
      case State.CommentChar:
      case State.Signature:
      case State.ValueStuffedQuote:
        throw new Error(`Unexpected state at end of line: ${this._state}`);

      case State.ParameterName:
        throw new Error(`Declaration parameter name not terminated: ${this._nameBuilder.join('')}`);

      case State.WaitingValue:
        throw new Error(`Declaration parameter missing value: ${this._nameBuilder.join('')}`);

      case State.Value:
        throw new Error(`Declaration parameter value not terminated: ${this._nameBuilder.join('')}`);

      case State.WaitingParameter:
        // All good
        break;

      default:
        throw new FtUnreachableCaseError('DPFL54482', this._state);
    }
  }
}
