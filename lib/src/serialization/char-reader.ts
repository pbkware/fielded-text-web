import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { FtTextReader } from './ft-text-reader.js';

const State = {
  Read: 'Read',
  SignaturePeekReread: 'SignaturePeekReread',
  SignaturePeekRereadThenEof: 'SignaturePeekRereadThenEof',
  TextReaderPeeked: 'TextReaderPeeked',
  EofPeeked: 'EofPeeked',
  Eof: 'Eof',
} as const;

type State = (typeof State)[keyof typeof State];

/**
 * Low-level character reader with buffering and peek support.
 * Wraps a TextReader source and provides character-by-character reading.
 * @internal
 */
export class CharReader {
  static readonly Signature = '|!Fielded Text^|';
  static readonly LegacySignature = '|>Fielded Text<|';
  static readonly CarriageReturnChar = '\x0D';
  static readonly LineFeedChar = '\x0A';
  static readonly CarriageReturnLineFeedString = '\x0D\x0A';

  private _textReader: FtTextReader | undefined = undefined;
  private _position = -1;
  private _state: State = State.Read;
  private _signaturePeekBuffer = '';
  private _signaturePeekBufferPosition = 0;
  private _peekedChar = -1;

  get position(): number {
    return this._position;
  }

  get isClosed(): boolean {
    return this._textReader === undefined;
  }

  get textReader(): FtTextReader | undefined {
    return this._textReader;
  }

  /**
   * Set the TextReader source for reading.
   * @param textReader The TextReader to read from.
   */
  setTextReader(textReader: FtTextReader): void {
    this.close();

    this._textReader = textReader;
    this._state = State.Read;
    this._signaturePeekBuffer = '';
    this._signaturePeekBufferPosition = 0;
    this._position = -1;
  }

  /**
   * Close the reader.
   */
  close(): void {
    if (this._textReader !== undefined) {
      this._textReader = undefined;
    }
  }

  /**
   * Read the next character.
   * @returns The character code point, or EofReadResult if at end.
   */
  read(): number {
    switch (this._state) {
      case State.Read: {
        const readResult = this._textReader?.read() ?? FtTextReader.EofReadResult;
        this._position++;
        if (readResult !== FtTextReader.EofReadResult) {
          return readResult;
        } else {
          this._state = State.Eof;
          return FtTextReader.EofReadResult;
        }
      }

      case State.SignaturePeekReread:
      case State.SignaturePeekRereadThenEof: {
        const aChar = this._signaturePeekBuffer.charCodeAt(this._signaturePeekBufferPosition);
        this._signaturePeekBufferPosition++;
        if (this._signaturePeekBufferPosition === this._signaturePeekBuffer.length) {
          this._state = this._state === State.SignaturePeekRereadThenEof ? State.EofPeeked : State.Read;
        }
        this._position++;
        return aChar;
      }

      case State.TextReaderPeeked: {
        const peekResult = this._peekedChar;
        this._state = State.Read;
        this._position++;
        return peekResult;
      }

      case State.EofPeeked:
        this._position++;
        this._state = State.Eof;
        return FtTextReader.EofReadResult;

      case State.Eof:
        return FtTextReader.EofReadResult;

      default:
        throw new FtUnreachableCaseError('CRR34490', this._state);
    }
  }

  /**
   * Peek ahead for the signature string.
   * Checks if the stream starts with the FieldedText signature.
   * @returns The signature if found, undefined otherwise.
   */
  peekSignature(): string | undefined {
    if (this._state !== State.Read) {
      throw new Error('CharReader.peekSignature not in Read state');
    }

    let result: string | undefined = undefined;
    let activeSignature = CharReader.Signature;
    this._signaturePeekBuffer = '';

    do {
      const readCharAsInt = this._textReader?.read() ?? FtTextReader.EofReadResult;

      if (readCharAsInt === FtTextReader.EofReadResult) {
        this._state = this._signaturePeekBuffer.length === 0 ? State.EofPeeked : State.SignaturePeekRereadThenEof;
      } else {
        const readChar = String.fromCharCode(readCharAsInt);
        this._signaturePeekBuffer += readChar;

        if (this._signaturePeekBuffer.length > 1) {
          // Check if we should switch to legacy signature (at position 1, char is '>')
          if (this._signaturePeekBuffer.length === 2 && readChar === CharReader.LegacySignature[1]) {
            activeSignature = CharReader.LegacySignature;
          }

          if (readChar !== activeSignature[this._signaturePeekBuffer.length - 1]) {
            this._state = State.SignaturePeekReread;
          } else {
            if (this._signaturePeekBuffer.length === activeSignature.length) {
              result = activeSignature;
              this._state = State.SignaturePeekReread;
            }
          }
        }
      }
    } while (this._state === State.Read);

    this._signaturePeekBufferPosition = 0;
    return result;
  }

  /**
   * Peek at the next character without consuming it.
   * @returns The character code point, or EofReadResult if at end.
   */
  peek(): number {
    switch (this._state) {
      case State.Read: {
        const readChar = this._textReader?.read() ?? FtTextReader.EofReadResult;
        if (readChar === FtTextReader.EofReadResult) {
          this._state = State.EofPeeked;
          return FtTextReader.EofReadResult;
        } else {
          this._peekedChar = readChar;
          this._state = State.TextReaderPeeked;
          return this._peekedChar;
        }
      }

      case State.SignaturePeekReread:
      case State.SignaturePeekRereadThenEof:
        return this._signaturePeekBuffer.charCodeAt(this._signaturePeekBufferPosition);

      case State.TextReaderPeeked:
        return this._peekedChar;

      case State.EofPeeked:
      case State.Eof:
        return FtTextReader.EofReadResult;

      default:
        throw new FtUnreachableCaseError('CRP34499', this._state);
    }
  }

  /**
   * Check if the next character is a line feed.
   * @returns True if the next character is \n, false otherwise.
   */
  peekNextIsLineFeed(): boolean {
    return this.peek() === CharReader.LineFeedChar.charCodeAt(0);
  }
}
