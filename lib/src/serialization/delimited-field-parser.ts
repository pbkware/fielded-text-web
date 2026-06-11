import { FtField } from '../fields/instances/ft-field.js';
import { FtQuotedType } from '../types/enums/ft-quoted-type.js';
import { CharReader } from './char-reader.js';
import { SerializationCore } from './serialization-core.js';

const QuotedState = {
  NeverOpen: 'NeverOpen',
  CanOpen: 'CanOpen',
  MustOpen: 'MustOpen',
  Opened: 'Opened',
  Open: 'Open',
  Stuffed: 'Stuffed',
  Closed: 'Closed',
} as const;

type QuotedState = (typeof QuotedState)[keyof typeof QuotedState];

/**
 * Parser for delimited (CSV-like) fields.
 * Handles quote characters, substitutions, and delimiter detection.
 * @internal
 */
export class DelimitedFieldParser {
  private readonly _headings: boolean;
  private readonly _charReader: CharReader;
  private readonly _core: SerializationCore;
  private _textBuilder: string[] = [];

  private _field: FtField | undefined = undefined;
  private _fieldQuotedType: FtQuotedType = FtQuotedType.Optional;
  private _fieldSubstitutionsEnabled = false;
  private _fieldSubstitutionChar = '';
  private _fieldDelimiterChar = '';
  private _fieldQuoteChar = '';

  private _quotedState: QuotedState = QuotedState.CanOpen;
  private _substitutionActive = false;
  private _position = -1;
  private _rawOffset = -1;
  private _rawLength = 0;

  constructor(core: SerializationCore, charReader: CharReader, forHeadings: boolean) {
    this._headings = forHeadings;
    this._charReader = charReader;
    this._core = core;
  }

  /**
   * Check if end-of-line should be embedded (not treated as line break).
   */
  isEndOfLineToBeEmbedded(): boolean {
    switch (this._quotedState) {
      case QuotedState.Opened:
      case QuotedState.Open:
      case QuotedState.Stuffed:
        return this._core.allowEndOfLineCharInQuotes;
      default:
        return false;
    }
  }

  /**
   * Enter a new field for parsing.
   */
  enterField(field: FtField): void {
    this._field = field;

    // Cache field values
    this._fieldSubstitutionsEnabled = this._core.substitutionsEnabled;
    this._fieldSubstitutionChar = this._core.substitutionChar;
    this._fieldDelimiterChar = this._core.delimiterChar;
    this._fieldQuoteChar = this._core.quoteChar;

    if (this._headings) {
      this._fieldQuotedType = field.headingQuotedType;
    } else {
      this._fieldQuotedType = field.valueQuotedType;
    }

    switch (this._fieldQuotedType) {
      case FtQuotedType.Never:
        this._quotedState = QuotedState.NeverOpen;
        break;
      case FtQuotedType.Optional:
        this._quotedState = QuotedState.CanOpen;
        break;
      case FtQuotedType.Always:
        this._quotedState = QuotedState.MustOpen;
        break;
      default:
        throw new Error(`Unsupported quoted type: ${String(this._fieldQuotedType)}`);
    }

    this._textBuilder = [];
    this._position = this._charReader.position;
    this._rawOffset = -1;
    this._rawLength = 0;
    this._substitutionActive = false;
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
   * @returns True if the field is finished, false otherwise.
   */
  parseChar(aChar: string): boolean {
    if (this._substitutionActive) {
      this.appendSubstitution(aChar);
      this._substitutionActive = false;
      this._rawLength++;
      return false;
    } else {
      if (this._fieldSubstitutionsEnabled && aChar === this._fieldSubstitutionChar) {
        this._substitutionActive = true;
        this._rawLength++;
        return false;
      } else {
        switch (this._quotedState) {
          case QuotedState.NeverOpen:
            if (aChar === this._fieldDelimiterChar) {
              return true;
            } else {
              this.appendValueChar(aChar);
              return false;
            }

          case QuotedState.CanOpen:
            if (aChar === this._fieldQuoteChar) {
              this._quotedState = QuotedState.Opened;
              return false;
            } else {
              if (this.isWhiteSpace(aChar)) {
                this._rawLength++;
                this._textBuilder.push(aChar);
                return false;
              } else {
                this._quotedState = QuotedState.NeverOpen;
                return this.parseChar(aChar);
              }
            }

          case QuotedState.MustOpen:
            if (this.isWhiteSpace(aChar)) {
              return false; // Ignore white space before quote is opened
            } else {
              if (aChar === this._fieldDelimiterChar) {
                return true; // null
              } else {
                if (aChar === this._fieldQuoteChar) {
                  this._quotedState = QuotedState.Opened;
                  return false;
                } else {
                  const errorType = this._headings ? 'HeadingNonWhiteSpaceCharBeforeQuotesOpened' : 'ValueNonWhiteSpaceCharBeforeQuotesOpened';
                  throw new Error(`${errorType}: Non-whitespace character before quotes opened in field ${this._field?.name ?? 'unknown'}`);
                }
              }
            }

          case QuotedState.Opened:
            this._rawOffset = this._charReader.position - this._position;
            this._rawLength = 0;
            this._quotedState = QuotedState.Open;
            return this.parseChar(aChar);

          case QuotedState.Open:
            if (aChar !== this._fieldQuoteChar) {
              this.appendValueChar(aChar);
              return false;
            } else {
              if (this._charReader.peek() === this._fieldQuoteChar.charCodeAt(0)) {
                this._rawLength++;
                this._quotedState = QuotedState.Stuffed;
                return false;
              } else {
                this._rawLength = this._charReader.position - this._position + this._rawOffset;
                this._quotedState = QuotedState.Closed;
                return false;
              }
            }

          case QuotedState.Stuffed:
            this.appendValueChar(this._fieldQuoteChar);
            this._quotedState = QuotedState.Open;
            return false;

          case QuotedState.Closed:
            if (aChar === this._fieldDelimiterChar) {
              return true;
            } else {
              if (this.isWhiteSpace(aChar)) {
                return false;
              } else {
                const errorType = this._headings ? 'HeadingNonWhiteSpaceCharAfterQuotesClosed' : 'ValueNonWhiteSpaceCharAfterQuotesClosed';
                throw new Error(`${errorType}: Non-whitespace character after quotes closed in field ${this._field?.name ?? 'unknown'}`);
              }
            }

          default:
            throw new Error(`Unsupported quoted state: ${String(this._quotedState)}`);
        }
      }
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
    this._field.loadPosition(this._position, this._charReader.position - this._position, this._rawOffset, this._rawLength);
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
    this._field.loadPosition(this._position, this._charReader.position - this._position, this._rawOffset, this._rawLength);
    this._field.loadDelimitedValue(valueText, this._quotedState === QuotedState.Closed);
  }

  private appendValueChar(aChar: string): void {
    this._rawLength++;
    if (this._fieldSubstitutionsEnabled && aChar === this._fieldSubstitutionChar) {
      this._substitutionActive = true;
    } else {
      this._textBuilder.push(aChar);
    }
  }

  private appendSubstitution(tokenChar: string): void {
    const substitutionValue = this._core.tryGetSubstitutionValue(tokenChar);
    if (substitutionValue.found) {
      this._textBuilder.push(substitutionValue.value);
    } else {
      this._textBuilder.push(tokenChar);
    }
  }

  private isWhiteSpace(aChar: string): boolean {
    return /\s/.test(aChar);
  }

  private finishText(): string {
    let text: string;

    switch (this._quotedState) {
      case QuotedState.MustOpen:
        text = ''; // is null
        break;

      case QuotedState.Opened:
        if (this._fieldQuotedType === FtQuotedType.Always) {
          const errorType = this._headings ? 'HeadingQuotedFieldMissingEndQuoteChar' : 'ValueQuotedFieldMissingEndQuoteChar';
          throw new Error(`${errorType}: Quoted field missing end quote in field ${this._field?.name ?? 'unknown'}`);
        } else {
          text = this._fieldQuoteChar;
          this._rawOffset--;
          this._rawLength++;
        }
        break;

      case QuotedState.Open:
        if (this._fieldQuotedType === FtQuotedType.Always) {
          const errorType = this._headings ? 'HeadingQuotedFieldMissingEndQuoteChar' : 'ValueQuotedFieldMissingEndQuoteChar';
          throw new Error(`${errorType}: Quoted field missing end quote in field ${this._field?.name ?? 'unknown'}`);
        } else {
          text = this._fieldQuoteChar + this._textBuilder.join('');
          this._rawOffset--;
          this._rawLength++;
        }
        break;

      default:
        text = this._textBuilder.join('');
        break;
    }

    return text;
  }
}
