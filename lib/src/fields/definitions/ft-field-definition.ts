import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtFieldFormatter } from '../../serialization/formatting/ft-field-formatter.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtHeadingConstraint } from '../../types/enums/ft-heading-constraint.js';
import { FtPadAlignment } from '../../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../../types/enums/ft-quoted-type.js';
import { FtTruncateType } from '../../types/enums/ft-truncate-type.js';
import { FtUnreachableCaseError } from '../../types/errors/ft-internal-error.js';

const InternalError = {
  FtFieldFieldDefinition_LoadMeta_UnsupportedHeadingPadAlignment: 'FtFieldFieldDefinition_LoadMeta_UnsupportedHeadingPadAlignment',
  FtFieldFieldDefinition_LoadMeta_UnsupportedValuePadAlignment: 'FtFieldFieldDefinition_LoadMeta_UnsupportedValuePadAlignment',
} as const;

type InternalError = (typeof InternalError)[keyof typeof InternalError];

/**
 * Abstract base class for all field definitions.
 * Field definitions hold metadata and configuration for fields in fielded text.
 * @public
 */
export abstract class FtFieldDefinition {
  readonly dataType: FtDataType;
  readonly valueType: string; // TypeScript doesn't have Type like C#, so we use string description
  readonly autoLeftPad: boolean;

  protected readonly formatter: FtFieldFormatter;

  private _index: number;
  private _id: number | undefined = undefined;
  private _metaName: string = FtMetaDefaults.Field.Name;
  private _metaHeadings: string[] = [];
  private _mainHeadingIndex: number = FtMetaDefaults.Root.MainHeadingLineIndex;
  private _culture: DotNetLocaleSettings | undefined = undefined;
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
  private _headingConstraint: FtHeadingConstraint = FtMetaDefaults.Field.RootOverriding.HeadingConstraint; // Note that field cannot override heading constraint
  private _headingQuotedType: FtQuotedType = FtMetaDefaults.Field.RootOverriding.HeadingQuotedType;
  private _headingAlwaysWriteOptionalQuote: boolean = FtMetaDefaults.Field.RootOverriding.HeadingAlwaysWriteOptionalQuote;
  private _headingWritePrefixSpace: boolean = FtMetaDefaults.Field.RootOverriding.HeadingWritePrefixSpace;
  private _headingPadAlignment: FtPadAlignment = FtMetaDefaults.Field.RootOverriding.HeadingPadAlignment;
  private _headingPadCharType: FtPadCharType = FtMetaDefaults.Field.RootOverriding.HeadingPadCharType;
  private _headingPadChar: string = FtMetaDefaults.Field.RootOverriding.HeadingPadChar;
  private _headingTruncateType: FtTruncateType = FtMetaDefaults.Field.RootOverriding.HeadingTruncateType;
  private _headingTruncateChar: string = FtMetaDefaults.Field.RootOverriding.HeadingTruncateChar;
  private _headingEndOfValueChar: string = FtMetaDefaults.Field.RootOverriding.HeadingEndOfValueChar;

  private _autoPadChar = ' ';

  private _headingLeftPad = false;
  private _valueLeftPad = false;
  private _fixedWidthNullValueText = '';

  protected constructor(dataType: FtDataType, valueType: string, formatter: FtFieldFormatter, autoLeftPad: boolean, index: number) {
    this.dataType = dataType;
    this.valueType = valueType;
    this.formatter = formatter;
    this.autoLeftPad = autoLeftPad;
    this._index = index;
  }

  // Public properties
  get index(): number {
    return this._index;
  }
  get id(): number | undefined {
    return this._id;
  }
  get metaName(): string {
    return this._metaName;
  }
  get metaHeadings(): string[] {
    return this._metaHeadings;
  }
  get metaHeadingCount(): number {
    return this._metaHeadings.length;
  }
  get mainHeadingIndex(): number {
    return this._mainHeadingIndex;
  }
  get culture(): DotNetLocaleSettings | undefined {
    return this._culture;
  }
  get fixedWidth(): boolean {
    return this._fixedWidth;
  }
  get width(): number {
    return this._width;
  }
  get constant(): boolean {
    return this._constant;
  }
  get null(): boolean {
    return this._null;
  }

  get valueQuotedType(): FtQuotedType {
    return this._valueQuotedType;
  }
  get valueAlwaysWriteOptionalQuote(): boolean {
    return this._valueAlwaysWriteOptionalQuote;
  }
  get valueWritePrefixSpace(): boolean {
    return this._valueWritePrefixSpace;
  }
  get valuePadAlignment(): FtPadAlignment {
    return this._valuePadAlignment;
  }
  get valuePadCharType(): FtPadCharType {
    return this._valuePadCharType;
  }
  get valuePadChar(): string {
    return this._valuePadChar;
  }
  get valueTruncateType(): FtTruncateType {
    return this._valueTruncateType;
  }
  get valueTruncateChar(): string {
    return this._valueTruncateChar;
  }
  get valueEndOfValueChar(): string {
    return this._valueEndOfValueChar;
  }
  get valueNullChar(): string {
    return this._valueNullChar;
  }

  get headingConstraint(): FtHeadingConstraint {
    return this._headingConstraint;
  }
  get headingQuotedType(): FtQuotedType {
    return this._headingQuotedType;
  }
  get headingAlwaysWriteOptionalQuote(): boolean {
    return this._headingAlwaysWriteOptionalQuote;
  }
  get headingWritePrefixSpace(): boolean {
    return this._headingWritePrefixSpace;
  }
  get headingPadAlignment(): FtPadAlignment {
    return this._headingPadAlignment;
  }
  get headingPadCharType(): FtPadCharType {
    return this._headingPadCharType;
  }
  get headingPadChar(): string {
    return this._headingPadChar;
  }
  get headingTruncateType(): FtTruncateType {
    return this._headingTruncateType;
  }
  get headingTruncateChar(): string {
    return this._headingTruncateChar;
  }
  get headingEndOfValueChar(): string {
    return this._headingEndOfValueChar;
  }

  get autoPadChar(): string {
    return this._autoPadChar;
  }
  get headingLeftPad(): boolean {
    return this._headingLeftPad;
  }
  get valueLeftPad(): boolean {
    return this._valueLeftPad;
  }
  get fixedWidthNullValueText(): string {
    return this._fixedWidthNullValueText;
  }

  /**
   * Load metadata from a meta field.
   * @param metaField - The meta field containing configuration
   * @param myCulture - The culture settings for formatting
   * @param myMainHeadingIndex - Index of the main heading
   */
  loadMeta(metaField: FtMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    this._id = metaField.id;
    this._metaName = metaField.name;
    this._metaHeadings = [...metaField.headings];
    this._mainHeadingIndex = myMainHeadingIndex;
    this._culture = myCulture;
    this._fixedWidth = metaField.fixedWidth;
    this._width = metaField.width;
    this._constant = metaField.constant;
    this._null = metaField.null;

    this._valueQuotedType = metaField.valueQuotedType;
    this._valueAlwaysWriteOptionalQuote = metaField.valueAlwaysWriteOptionalQuote;
    this._valueWritePrefixSpace = metaField.valueWritePrefixSpace;
    this._valuePadAlignment = metaField.valuePadAlignment;
    this._valuePadCharType = metaField.valuePadCharType;
    this._valuePadChar = metaField.valuePadChar;
    this._valueTruncateType = metaField.valueTruncateType;
    this._valueTruncateChar = metaField.valueTruncateChar;
    this._valueEndOfValueChar = metaField.valueEndOfValueChar;
    this._valueNullChar = metaField.valueNullChar;

    this._headingConstraint = metaField.headingConstraint;
    this._headingQuotedType = metaField.headingQuotedType;
    this._headingAlwaysWriteOptionalQuote = metaField.headingAlwaysWriteOptionalQuote;
    this._headingWritePrefixSpace = metaField.headingWritePrefixSpace;
    this._headingPadAlignment = metaField.headingPadAlignment;
    this._headingPadCharType = metaField.headingPadCharType;
    this._headingPadChar = metaField.headingPadChar;
    this._headingTruncateType = metaField.headingTruncateType;
    this._headingTruncateChar = metaField.headingTruncateChar;
    this._headingEndOfValueChar = metaField.headingEndOfValueChar;

    this.formatter.culture = this._culture;

    // Set meta name in headings if required
    if (
      (this._headingConstraint === FtHeadingConstraint.NameIsMain || this._headingConstraint === FtHeadingConstraint.NameConstant) &&
      myMainHeadingIndex >= 0 &&
      myMainHeadingIndex < this.metaHeadingCount
    ) {
      this._metaHeadings[myMainHeadingIndex] = this._metaName;
    }

    // Calculate heading left pad
    switch (this._headingPadAlignment) {
      case FtPadAlignment.Left:
        this._headingLeftPad = true;
        break;
      case FtPadAlignment.Right:
        this._headingLeftPad = false;
        break;
      case FtPadAlignment.Auto:
        this._headingLeftPad = this.autoLeftPad;
        break;
      default:
        throw new FtUnreachableCaseError('FDLM30915', this._headingPadAlignment);
    }

    // Calculate value left pad
    switch (this._valuePadAlignment) {
      case FtPadAlignment.Left:
        this._valueLeftPad = true;
        break;
      case FtPadAlignment.Right:
        this._valueLeftPad = false;
        break;
      case FtPadAlignment.Auto:
        this._valueLeftPad = this.autoLeftPad;
        break;
      default:
        throw new FtUnreachableCaseError('FDLM30911', this._valuePadAlignment);
    }

    // Build fixed width null value text
    if (this._fixedWidth) {
      this._fixedWidthNullValueText = this._valueNullChar.repeat(this._width);
    }
  }
}
