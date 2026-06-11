import { FtField } from '../fields/instances/ft-field.js';
import { FtPadCharType } from '../types/enums/ft-pad-char-type.js';
import { FtAssertError, FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { CharReader } from './char-reader.js';
import { SerializationCore } from './serialization-core.js';

const State = {
  WaitingLeftEndOfValue: 'WaitingLeftEndOfValue',
  LeftPadding: 'LeftPadding',
  NoMorePadding: 'NoMorePadding',
  WaitingRightEndOfValue: 'WaitingRightEndOfValue',
  WaitingRightPadding: 'WaitingRightPadding',
  RightPadding: 'RightPadding',
  RestIsPadding: 'RestIsPadding',
} as const;

type State = (typeof State)[keyof typeof State];

/**
 * Parser for fixed-width fields.
 * Handles padding (left/right), end-of-value characters, and width validation.
 * @internal
 */
export class FixedWidthFieldParser {
  private readonly _headings: boolean;
  private readonly _charReader: CharReader;
  private readonly _core: SerializationCore;
  private _textBuilder: string[] = [];

  private _state: State = State.NoMorePadding;
  private _field: FtField | undefined = undefined;
  private _position = -1;
  private _fieldLength = 0;
  private _rawOffset = -1;
  private _rawLength = 0;

  // Cached field values
  private _fieldWidth = 0;
  private _fieldLeftPad = false;
  private _fieldPadCharType: FtPadCharType = FtPadCharType.Auto;
  private _fieldEndOfValueChar = '';
  private _fieldPadChar = '';
  private _rightPaddingCharCount = 0;

  constructor(core: SerializationCore, charReader: CharReader, forHeadings: boolean) {
    this._headings = forHeadings;
    this._charReader = charReader;
    this._core = core;
  }

  /**
   * Enter a new field for parsing.
   */
  enterField(field: FtField): void {
    this._field = field;

    // Cache field values
    this._fieldWidth = field.width;

    if (this._headings) {
      this._fieldLeftPad = field.definition_.headingLeftPad;
      this._fieldPadCharType = field.headingPadCharType;
      this._fieldEndOfValueChar = field.headingEndOfValueChar;
      this._fieldPadChar = field.headingPadChar;
    } else {
      this._fieldLeftPad = field.definition_.valueLeftPad;
      this._fieldPadCharType = field.valuePadCharType;
      this._fieldEndOfValueChar = field.valueEndOfValueChar;
      this._fieldPadChar = field.valuePadChar;
    }

    if (this._fieldLeftPad) {
      if (this._fieldPadCharType === FtPadCharType.EndOfValue) {
        this._state = State.WaitingLeftEndOfValue;
      } else {
        this._state = State.LeftPadding;
      }
    } else {
      if (this._fieldPadCharType === FtPadCharType.EndOfValue) {
        this._state = State.WaitingRightEndOfValue;
      } else {
        this._state = State.WaitingRightPadding;
      }
    }

    this._textBuilder = [];
    this._position = this._charReader.position;
    this._fieldLength = 0;
    this._rawOffset = 0;
    this._rawLength = 0;
    this._rightPaddingCharCount = 0;
  }

  /**
   * Exit the current field.
   */
  exitField(): void {
    this._textBuilder = [];
    this._field = undefined;
  }

  /**
   * Parse a single character.
   * @param aChar The character to parse.
   * @returns True if the previous field is finished (width reached), false otherwise.
   */
  parseChar(aChar: string): boolean {
    if (this._fieldLength >= this._fieldWidth) {
      return true;
    } else {
      this._fieldLength++;

      switch (this._state) {
        case State.WaitingLeftEndOfValue:
          if (aChar !== this._fieldEndOfValueChar) {
            this._textBuilder.push(aChar); // May not encounter any EndOfValue char
          } else {
            this._textBuilder = [];
            this._rawOffset = this._fieldLength;
            this._state = State.NoMorePadding;
          }
          break;

        case State.LeftPadding:
          if (aChar !== this._fieldPadChar) {
            this._textBuilder.push(aChar);
            this._rawOffset = this._fieldLength - 1;
            this._state = State.NoMorePadding;
          }
          break;

        case State.NoMorePadding:
          this._textBuilder.push(aChar);
          break;

        case State.WaitingRightEndOfValue:
          if (aChar !== this._fieldEndOfValueChar) {
            this._textBuilder.push(aChar); // May not encounter any EndOfValue char
          } else {
            this._state = State.RestIsPadding;
          }
          break;

        case State.WaitingRightPadding:
          if (aChar !== this._fieldPadChar) {
            this._textBuilder.push(aChar);
          } else {
            this._rightPaddingCharCount = 1;
            this._state = State.RightPadding;
          }
          break;

        case State.RightPadding:
          if (aChar === this._fieldPadChar) {
            this._rightPaddingCharCount++;
          } else {
            // Prematurely identified right padding previous start. Still not started
            this._textBuilder.push(this._fieldPadChar.repeat(this._rightPaddingCharCount));
            this._textBuilder.push(aChar);
            this._rightPaddingCharCount = 0;
            this._state = State.WaitingRightPadding;
          }
          break;

        case State.RestIsPadding:
          // Ignore remaining characters
          break;

        default:
          throw new FtUnreachableCaseError('FWFPPC93358', this._state);
      }

      return false;
    }
  }

  /**
   * Load the parsed heading into the field.
   */
  loadFieldHeading(headingLineIndex: number): void {
    if (!this._field) {
      throw new Error('No field to load heading into');
    }
    const headingText = this.finishText();
    this._field.loadPosition(this._position, this._fieldLength, this._rawOffset, this._rawLength);
    this._field.loadHeading(headingLineIndex, headingText);
  }

  /**
   * Load the parsed value into the field.
   */
  loadFieldValue(): void {
    if (!this._field) {
      throw new Error('No field to load value into');
    }
    const valueText = this.finishText();
    this._field.loadPosition(this._position, this._fieldLength, this._rawOffset, this._rawLength);
    this._field.loadFixedWidthValue(valueText);
  }

  private finishText(): string {
    this._rawLength = this._textBuilder.length;

    if (this._fieldLength < this._fieldWidth) {
      const errorType = this._headings ? 'HeadingWidthNotReached' : 'ValueWidthNotReached';
      throw new FtAssertError(
        'FWFPFTR22115',
        `${errorType}: Field width not reached in field ${this._field?.name ?? 'unknown'}: expected ${this._fieldWidth}, got ${this._fieldLength}`,
      );
    } else if (this._fieldLength > this._fieldWidth) {
      const errorType = this._headings ? 'HeadingWidthExceeded' : 'ValueWidthExceeded';
      throw new FtAssertError(
        'FWFPFTR22116',
        `${errorType}: Field width exceeded in field ${this._field?.name ?? 'unknown'}: expected ${this._fieldWidth}, got ${this._fieldLength}`,
      );
    } else {
      return this._textBuilder.join('');
    }
  }
}
