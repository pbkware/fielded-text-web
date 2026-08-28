import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtHeadingConstraint } from '../../types/enums/ft-heading-constraint.js';
import { FtPadAlignment } from '../../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../../types/enums/ft-quoted-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtTruncateType } from '../../types/enums/ft-truncate-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';

/**
 * Abstract base class for meta field definitions.
 * Meta fields define the structure and formatting of fields in a fielded text document.
 * @public
 */
export abstract class FtMetaField {
  // Event hooks for default heading properties
  onDefaultHeadingConstraintRequired: (() => FtHeadingConstraint) | undefined = undefined;
  onDefaultHeadingQuotedTypeRequired: (() => FtQuotedType) | undefined = undefined;
  onDefaultHeadingAlwaysWriteOptionalQuoteRequired: (() => boolean) | undefined = undefined;
  onDefaultHeadingWritePrefixSpaceRequired: (() => boolean) | undefined = undefined;
  onDefaultHeadingPadAlignmentRequired: (() => FtPadAlignment) | undefined = undefined;
  onDefaultHeadingPadCharTypeRequired: (() => FtPadCharType) | undefined = undefined;
  onDefaultHeadingPadCharRequired: (() => string) | undefined = undefined;
  onDefaultHeadingTruncateTypeRequired: (() => FtTruncateType) | undefined = undefined;
  onDefaultHeadingTruncateCharRequired: (() => string) | undefined = undefined;
  onDefaultHeadingEndOfValueCharRequired: (() => string) | undefined = undefined;

  private _index = 0;
  private _dataType: FtDataType;
  private _id: number | undefined;
  private _name: string = FtMetaDefaults.Field.Name;
  private _headings: string[];
  private _fixedWidth: boolean = FtMetaDefaults.Field.FixedWidth;
  private _width: number = FtMetaDefaults.Field.Width;
  private _constant: boolean = FtMetaDefaults.Field.Constant;
  private _null: boolean = FtMetaDefaults.Field.Null;

  // Value formatting properties
  private _valueQuotedType: FtQuotedType = FtMetaDefaults.Field.ValueQuotedType;
  private _valueAlwaysWriteOptionalQuote: boolean = FtMetaDefaults.Field.ValueAlwaysWriteOptionalQuote;
  private _valueWritePrefixSpace: boolean = FtMetaDefaults.Field.ValueWritePrefixSpace;
  private _valuePadAlignment: FtPadAlignment = FtMetaDefaults.Field.ValuePadAlignment;
  private _valuePadCharType: FtPadCharType = FtMetaDefaults.Field.ValuePadCharType;
  private _valuePadChar: string = FtMetaDefaults.Field.ValuePadChar;
  private _valueTruncateType: FtTruncateType = FtMetaDefaults.Field.ValueTruncateType;
  private _valueTruncateChar: string = FtMetaDefaults.Field.ValueTruncateChar;
  private _valueEndOfValueChar: string = FtMetaDefaults.Field.ValueEndOfValueChar;
  private _valueNullChar: string = FtMetaDefaults.Field.ValueNullChar;

  // Heading formatting properties
  private _headingConstraint: FtHeadingConstraint = FtMetaDefaults.Field.RootOverriding.HeadingConstraint;
  private _headingQuotedType: FtQuotedType = FtMetaDefaults.Field.RootOverriding.HeadingQuotedType;
  private _headingAlwaysWriteOptionalQuote: boolean = FtMetaDefaults.Field.RootOverriding.HeadingAlwaysWriteOptionalQuote;
  private _headingWritePrefixSpace: boolean = FtMetaDefaults.Field.RootOverriding.HeadingWritePrefixSpace;
  private _headingPadAlignment: FtPadAlignment = FtMetaDefaults.Field.RootOverriding.HeadingPadAlignment;
  private _headingPadCharType: FtPadCharType = FtMetaDefaults.Field.RootOverriding.HeadingPadCharType;
  private _headingPadChar: string = FtMetaDefaults.Field.RootOverriding.HeadingPadChar;
  private _headingTruncateType: FtTruncateType = FtMetaDefaults.Field.RootOverriding.HeadingTruncateType;
  private _headingTruncateChar: string = FtMetaDefaults.Field.RootOverriding.HeadingTruncateChar;
  private _headingEndOfValueChar: string = FtMetaDefaults.Field.RootOverriding.HeadingEndOfValueChar;

  protected constructor(dataType: FtDataType, headingCount: number) {
    this._dataType = dataType;
    this._headings = new Array<string>(headingCount).fill('');
  }

  get index(): number {
    return this._index;
  }
  set index(value: number) {
    this._index = value;
  }

  get dataType(): FtDataType {
    return this._dataType;
  }
  set dataType(value: FtDataType) {
    this._dataType = value;
  }

  get id(): number | undefined {
    return this._id;
  }
  set id(value: number | undefined) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  get headings(): string[] {
    return this._headings;
  }
  set headings(value: string[]) {
    this._headings = value;
  }

  get fixedWidth(): boolean {
    return this._fixedWidth;
  }
  set fixedWidth(value: boolean) {
    this._fixedWidth = value;
  }

  get width(): number {
    return this._width;
  }
  set width(value: number) {
    this._width = value;
  }

  get constant(): boolean {
    return this._constant;
  }
  set constant(value: boolean) {
    this._constant = value;
  }

  get null(): boolean {
    return this._null;
  }
  set null(value: boolean) {
    this._null = value;
  }

  get valueQuotedType(): FtQuotedType {
    return this._valueQuotedType;
  }
  set valueQuotedType(value: FtQuotedType) {
    this._valueQuotedType = value;
  }

  get valueAlwaysWriteOptionalQuote(): boolean {
    return this._valueAlwaysWriteOptionalQuote;
  }
  set valueAlwaysWriteOptionalQuote(value: boolean) {
    this._valueAlwaysWriteOptionalQuote = value;
  }

  get valueWritePrefixSpace(): boolean {
    return this._valueWritePrefixSpace;
  }
  set valueWritePrefixSpace(value: boolean) {
    this._valueWritePrefixSpace = value;
  }

  get valuePadAlignment(): FtPadAlignment {
    return this._valuePadAlignment;
  }
  set valuePadAlignment(value: FtPadAlignment) {
    this._valuePadAlignment = value;
  }

  get valuePadCharType(): FtPadCharType {
    return this._valuePadCharType;
  }
  set valuePadCharType(value: FtPadCharType) {
    this._valuePadCharType = value;
  }

  get valuePadChar(): string {
    return this._valuePadChar;
  }
  set valuePadChar(value: string) {
    this._valuePadChar = value;
  }

  get valueTruncateType(): FtTruncateType {
    return this._valueTruncateType;
  }
  set valueTruncateType(value: FtTruncateType) {
    this._valueTruncateType = value;
  }

  get valueTruncateChar(): string {
    return this._valueTruncateChar;
  }
  set valueTruncateChar(value: string) {
    this._valueTruncateChar = value;
  }

  get valueEndOfValueChar(): string {
    return this._valueEndOfValueChar;
  }
  set valueEndOfValueChar(value: string) {
    this._valueEndOfValueChar = value;
  }

  get valueNullChar(): string {
    return this._valueNullChar;
  }
  set valueNullChar(value: string) {
    this._valueNullChar = value;
  }

  get headingConstraint(): FtHeadingConstraint {
    return this._headingConstraint;
  }
  set headingConstraint(value: FtHeadingConstraint) {
    this._headingConstraint = value;
  }

  get headingQuotedType(): FtQuotedType {
    return this._headingQuotedType;
  }
  set headingQuotedType(value: FtQuotedType) {
    this._headingQuotedType = value;
  }

  get headingAlwaysWriteOptionalQuote(): boolean {
    return this._headingAlwaysWriteOptionalQuote;
  }
  set headingAlwaysWriteOptionalQuote(value: boolean) {
    this._headingAlwaysWriteOptionalQuote = value;
  }

  get headingWritePrefixSpace(): boolean {
    return this._headingWritePrefixSpace;
  }
  set headingWritePrefixSpace(value: boolean) {
    this._headingWritePrefixSpace = value;
  }

  get headingPadAlignment(): FtPadAlignment {
    return this._headingPadAlignment;
  }
  set headingPadAlignment(value: FtPadAlignment) {
    this._headingPadAlignment = value;
  }

  get headingPadCharType(): FtPadCharType {
    return this._headingPadCharType;
  }
  set headingPadCharType(value: FtPadCharType) {
    this._headingPadCharType = value;
  }

  get headingPadChar(): string {
    return this._headingPadChar;
  }
  set headingPadChar(value: string) {
    this._headingPadChar = value;
  }

  get headingTruncateType(): FtTruncateType {
    return this._headingTruncateType;
  }
  set headingTruncateType(value: FtTruncateType) {
    this._headingTruncateType = value;
  }

  get headingTruncateChar(): string {
    return this._headingTruncateChar;
  }
  set headingTruncateChar(value: string) {
    this._headingTruncateChar = value;
  }

  get headingEndOfValueChar(): string {
    return this._headingEndOfValueChar;
  }
  set headingEndOfValueChar(value: string) {
    this._headingEndOfValueChar = value;
  }

  get headingCount(): number {
    return this._headings.length;
  }

  getDefaultHeadings(): string[] {
    return new Array<string>(this.headingCount).fill('');
  }

  loadDefaults(leaveNameAsIs = true): void {
    if (!leaveNameAsIs) {
      this._name = '';
    }
    this._id = FtMetaDefaults.Field.Id;
    this._headings = this.getDefaultHeadings();
    this._fixedWidth = FtMetaDefaults.Field.FixedWidth;
    this._width = FtMetaDefaults.Field.Width;
    this._constant = FtMetaDefaults.Field.Constant;
    this._null = FtMetaDefaults.Field.Null;
    this._valueQuotedType = FtMetaDefaults.Field.ValueQuotedType;
    this._valueAlwaysWriteOptionalQuote = FtMetaDefaults.Field.ValueAlwaysWriteOptionalQuote;
    this._valueWritePrefixSpace = FtMetaDefaults.Field.ValueWritePrefixSpace;
    this._valuePadAlignment = FtMetaDefaults.Field.ValuePadAlignment;
    this._valuePadCharType = FtMetaDefaults.Field.ValuePadCharType;
    this._valuePadChar = FtMetaDefaults.Field.ValuePadChar;
    this._valueTruncateType = FtMetaDefaults.Field.ValueTruncateType;
    this._valueTruncateChar = FtMetaDefaults.Field.ValueTruncateChar;
    this._valueEndOfValueChar = FtMetaDefaults.Field.ValueEndOfValueChar;
    this._valueNullChar = FtMetaDefaults.Field.ValueNullChar;
    this._headingConstraint = FtMetaDefaults.Field.RootOverriding.HeadingConstraint;
    this._headingQuotedType = FtMetaDefaults.Field.RootOverriding.HeadingQuotedType;
    this._headingAlwaysWriteOptionalQuote = FtMetaDefaults.Field.RootOverriding.HeadingAlwaysWriteOptionalQuote;
    this._headingWritePrefixSpace = FtMetaDefaults.Field.RootOverriding.HeadingWritePrefixSpace;
    this._headingPadAlignment = FtMetaDefaults.Field.RootOverriding.HeadingPadAlignment;
    this._headingPadCharType = FtMetaDefaults.Field.RootOverriding.HeadingPadCharType;
    this._headingPadChar = FtMetaDefaults.Field.RootOverriding.HeadingPadChar;
    this._headingTruncateType = FtMetaDefaults.Field.RootOverriding.HeadingTruncateType;
    this._headingTruncateChar = FtMetaDefaults.Field.RootOverriding.HeadingTruncateChar;
    this._headingEndOfValueChar = FtMetaDefaults.Field.RootOverriding.HeadingEndOfValueChar;
  }

  /** @internal */
  setHeadingCount(value: number) {
    const existingCount = this._headings.length;
    if (value < existingCount) {
      this._headings.length = value;
    } else {
      if (value > existingCount) {
        this._headings.length = value;
        for (let i = existingCount; i < value; i++) {
          this._headings[i] = '';
        }
      }
    }
  }

  validateEndOfLineTypeChar(eolTypeChar: string, headingLineCount: number): { valid: boolean; errorMessage: string } {
    let errorMessage = '';

    // Only validate if field is fixed width
    if (!this._fixedWidth) {
      return { valid: true, errorMessage: '' };
    }

    if (this._valueNullChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': ValueNullChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this._valuePadChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': ValuePadChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this._valueTruncateChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': ValueTruncateChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this._valueEndOfValueChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': ValueEndOfValueChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (headingLineCount > 0 && this._headingPadChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': HeadingPadChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (headingLineCount > 0 && this._headingTruncateChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': HeadingTruncateChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (headingLineCount > 0 && this._headingEndOfValueChar === eolTypeChar) {
      errorMessage = `Field '${this._name}': HeadingEndOfValueChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    }

    return { valid: errorMessage === '', errorMessage };
  }

  protected assignFrom(source: FtMetaField): void {
    this._id = source._id;
    this._name = source._name;
    this._headings = [...source._headings];
    this._fixedWidth = source._fixedWidth;
    this._width = source._width;
    this._constant = source._constant;
    this._null = source._null;
    this._valueQuotedType = source._valueQuotedType;
    this._valueAlwaysWriteOptionalQuote = source._valueAlwaysWriteOptionalQuote;
    this._valueWritePrefixSpace = source._valueWritePrefixSpace;
    this._valuePadAlignment = source._valuePadAlignment;
    this._valuePadCharType = source._valuePadCharType;
    this._valuePadChar = source._valuePadChar;
    this._valueTruncateType = source._valueTruncateType;
    this._valueTruncateChar = source._valueTruncateChar;
    this._valueEndOfValueChar = source._valueEndOfValueChar;
    this._valueNullChar = source._valueNullChar;
    this._headingConstraint = source._headingConstraint;
    this._headingQuotedType = source._headingQuotedType;
    this._headingAlwaysWriteOptionalQuote = source._headingAlwaysWriteOptionalQuote;
    this._headingWritePrefixSpace = source._headingWritePrefixSpace;
    this._headingPadAlignment = source._headingPadAlignment;
    this._headingPadCharType = source._headingPadCharType;
    this._headingPadChar = source._headingPadChar;
    this._headingTruncateType = source._headingTruncateType;
    this._headingTruncateChar = source._headingTruncateChar;
    this._headingEndOfValueChar = source._headingEndOfValueChar;
  }

  private endOfLineTypeCharToString(eolTypeChar: string): string {
    const codePoint = eolTypeChar.charCodeAt(0);
    let result = `\\x${codePoint.toString(16).padStart(4, '0')}`;

    // Check if it's a control character
    if (codePoint < 32 || codePoint === 127) {
      // It's a control character, don't add the character itself
    } else {
      result += ` [${eolTypeChar}]`;
    }

    return result;
  }

  abstract createCopy(): FtMetaField;

  protected abstract getDefaultSequenceRedirectType(): FtSequenceRedirectType;
}
