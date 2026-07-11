import { FtField } from '../fields/instances/ft-field.js';
import { FtAssertError, FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { FtSerializationErrorCode } from '../types/errors/ft-serialization-error-code.js';
import { FtSerializationError } from '../types/errors/ft-serialization-error.js';
import { CharReader } from './char-reader.js';
import { DelimitedFieldParser } from './delimited-field-parser.js';
import { FixedWidthFieldParser } from './fixed-width-field-parser.js';
import { SerializationCore } from './serialization-core.js';

const State = {
  Out: 'Out',
  InOutField: 'InOutField',
  InDelimitedField: 'InDelimitedField',
  InFixedWidthField: 'InFixedWidthField',
  OutIgnoreChars: 'OutIgnoreChars',
} as const;

type State = (typeof State)[keyof typeof State];

/**
 * Parses a single heading or data record line.
 * Uses DelimitedFieldParser or FixedWidthFieldParser depending on field type.
 * @internal
 */
export class HeadingLineRecordParser {
  private readonly _core: SerializationCore;
  private readonly _charReader: CharReader;
  private readonly _headingLines: boolean;

  private readonly _delimitedFieldParser: DelimitedFieldParser;
  private readonly _fixedWidthFieldParser: FixedWidthFieldParser;

  private _index = -1;
  private _state: State = State.Out;
  private _fieldCount = 0;
  private _activeField: FtField | undefined = undefined;

  private _startPosition = -1;
  private _ignoreExtraCharsStartPosition = -1;

  constructor(core: SerializationCore, charReader: CharReader, forHeadingLines: boolean) {
    this._core = core;
    this._charReader = charReader;
    this._headingLines = forHeadingLines;

    this._delimitedFieldParser = new DelimitedFieldParser(core, charReader, forHeadingLines);
    this._fixedWidthFieldParser = new FixedWidthFieldParser(core, charReader, forHeadingLines);
  }

  get activeField(): FtField | undefined {
    return this._activeField;
  }

  get fieldCount(): number {
    return this._fieldCount;
  }

  getActiveFieldIndex(): number {
    switch (this._state) {
      case State.Out:
      case State.OutIgnoreChars:
        return -1;
      default:
        return this._fieldCount - 1;
    }
  }

  getIgnoreExtraCharsLinePosition(): number {
    if (this._ignoreExtraCharsStartPosition < 0) {
      return -1;
    } else {
      return this._ignoreExtraCharsStartPosition - this._startPosition;
    }
  }

  isEndOfLineToBeEmbedded(): boolean {
    if (this._state === State.InDelimitedField) {
      return this._delimitedFieldParser.isEndOfLineToBeEmbedded();
    } else {
      return false;
    }
  }

  /**
   * Start parsing a new record.
   */
  start(index: number): void {
    if (this._state !== State.Out) {
      throw new Error(`Unexpected RecordParser Start State: ${this._state}`);
    }

    this._index = index;
    this._fieldCount = 0;
    this._state = State.InOutField;

    this._startPosition = this._charReader.position;
    this._ignoreExtraCharsStartPosition = -1;
  }

  /**
   * Parse a single character.
   */
  parseChar(aChar: string): void {
    switch (this._state) {
      case State.Out:
        throw new Error('HeadingLineRecordParser parseChar called in Out state');

      case State.InOutField:
        if (this._fieldCount < this._core.fieldList.count) {
          this.enterField(this._core.fieldList.get(this._fieldCount));
        } else {
          const error = this._headingLines ? FtSerializationErrorCode.HeadingLineTooManyFields : FtSerializationErrorCode.RecordTooManyFields;
          const message = this._headingLines
            ? `Heading line has too many fields. Expected ${this._core.fieldList.count}`
            : `Record has too many fields. Expected ${this._core.fieldList.count}`;
          throw new FtSerializationError(error, message);
        }
        this.parseChar(aChar);
        break;

      case State.InFixedWidthField: {
        const previousFieldFinished = this._fixedWidthFieldParser.parseChar(aChar);
        if (previousFieldFinished) {
          if (!this._core.seeking) {
            this.loadFixedWidthHeadingValue();
          }

          this.exitActiveField();

          if (this._fieldCount < this._core.fieldList.count || !this._core.ignoreExtraChars) {
            this._state = State.InOutField;
          } else {
            this._state = State.OutIgnoreChars;
            this._ignoreExtraCharsStartPosition = this._charReader.position;
          }
          this.parseChar(aChar);
        }
        break;
      }

      case State.InDelimitedField: {
        const fieldFinished = this._delimitedFieldParser.parseChar(aChar);
        if (fieldFinished) {
          // aChar was delimiter
          if (!this._core.seeking) {
            this.loadDelimitedHeadingValue();
          }

          this.exitActiveField();

          if (this._fieldCount < this._core.fieldList.count || !this._core.ignoreExtraChars) {
            this._state = State.InOutField;
          } else {
            this._state = State.OutIgnoreChars;
            this._ignoreExtraCharsStartPosition = this._charReader.position;
          }
        }
        break;
      }

      case State.OutIgnoreChars:
        // nothing to do
        break;

      default:
        throw new FtUnreachableCaseError('HLRPPC44556', this._state);
    }
  }

  /**
   * Finish parsing the record.
   */
  finish(): void {
    switch (this._state) {
      case State.Out:
        // nothing to do
        break;

      case State.InOutField:
        this._state = State.Out;
        break;

      case State.InFixedWidthField:
        if (!this._core.seeking) {
          this.loadFixedWidthHeadingValue();
        }
        this.exitActiveField();
        this._state = State.Out;
        break;

      case State.InDelimitedField:
        if (!this._core.seeking) {
          this.loadDelimitedHeadingValue();
        }
        this.exitActiveField();
        this._state = State.Out;
        break;

      case State.OutIgnoreChars:
        this._state = State.Out;
        break;

      default:
        throw new FtUnreachableCaseError('HLRPF44556', this._state);
    }

    if (this._fieldCount < this._core.fieldList.count) {
      if (!this._core.allowIncompleteRecords) {
        const error = this._headingLines ? FtSerializationErrorCode.HeadingLineNotEnoughFields : FtSerializationErrorCode.RecordNotEnoughFields;
        const message = this._headingLines
          ? `Heading line has not enough fields. Got ${this._fieldCount}, expected ${this._core.fieldList.count}`
          : `Record has not enough fields. Got ${this._fieldCount}, expected ${this._core.fieldList.count}`;
        throw new FtSerializationError(error, message);
      } else {
        for (let i = this._fieldCount; i < this._core.fieldList.count; i++) {
          const field = this._core.fieldList.get(i);
          field.loadPosition(-1, -1, -1, -1);
          if (this._headingLines) {
            field.loadHeading(this._index, '');
          } else {
            field.loadNullValue();
          }
        }
      }
    }
  }

  private loadFixedWidthHeadingValue(): void {
    if (this._activeField === undefined) {
      throw new Error('Active field is null');
    }

    if (this._headingLines) {
      this._fixedWidthFieldParser.loadFieldHeading(this._index);
      this._core.fireFieldHeadingReadReady(this._activeField, this._index);
    } else {
      this._fixedWidthFieldParser.loadFieldValue();
      this._core.fireFieldValueReadReady(this._activeField, this._index);
    }
  }

  private loadDelimitedHeadingValue(): void {
    if (this._activeField === undefined) {
      throw new Error('Active field is null');
    }

    if (this._headingLines) {
      this._delimitedFieldParser.loadFieldHeading(this._index);
      this._core.fireFieldHeadingReadReady(this._activeField, this._index);
    } else {
      this._delimitedFieldParser.loadFieldValue();
      this._core.fireFieldValueReadReady(this._activeField, this._index);
    }
  }

  private enterField(field: FtField): void {
    this._activeField = field;
    this._fieldCount++;
    if (this._activeField.fixedWidth) {
      this._state = State.InFixedWidthField;
      this._fixedWidthFieldParser.enterField(this._activeField);
    } else {
      this._state = State.InDelimitedField;
      this._delimitedFieldParser.enterField(this._activeField);
    }
  }

  private exitActiveField(): void {
    switch (this._state) {
      case State.InFixedWidthField:
        this._fixedWidthFieldParser.exitField();
        break;
      case State.InDelimitedField:
        this._delimitedFieldParser.exitField();
        break;
      case State.InOutField:
      case State.Out:
      case State.OutIgnoreChars:
        throw new FtAssertError(`Unsupported state in exitActiveField: ${this._state}`);
      default:
        throw new FtUnreachableCaseError('HLRPEAF44558', this._state);
    }
    this._activeField = undefined;
  }
}
