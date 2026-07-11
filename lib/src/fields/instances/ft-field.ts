import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtSequenceInvokation, FtSequenceRedirectDelegate } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtSequence } from '../../sequences/core/ft-sequence.js';
import { FtSequenceRedirectList } from '../../sequences/redirects/ft-sequence-redirect-list.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtHeadingConstraint } from '../../types/enums/ft-heading-constraint.js';
import { FtPadAlignment } from '../../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../../types/enums/ft-quoted-type.js';
import { FtSequenceInvokationDelay } from '../../types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtTruncateType } from '../../types/enums/ft-truncate-type.js';
import { FtFieldNullError } from '../../types/errors/ft-field-null-error.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtUnreachableCaseError } from '../../types/errors/ft-internal-error.js';
import { FtFieldDefinition } from '../definitions/ft-field-definition.js';

/**
 * Abstract base class for all field instances.
 * Fields represent runtime field values during reading or writing.
 * @public
 */
export abstract class FtField {
  static readonly NO_FIELDS_AFFECTED_INDEX = -1;

  protected static readonly IGNORED_SEQUENCE_INVOKATION_DELAY = FtSequenceInvokationDelay.AfterSequence;

  sequenceRedirectEvent: FtSequenceRedirectDelegate | undefined;

  protected _valueAssigned = false;
  protected quoted = false;

  private _index = 0;
  private _definition: FtFieldDefinition;

  private _sequence: FtSequence;
  private _sequenceItem: FtSequenceItem;
  private _sequenceRedirectList: FtSequenceRedirectList;
  private _sequenceInvokation: FtSequenceInvokation;
  private _sidelined = false;

  private _name: string;
  private _headings: string[];
  private _valueTextNullTrimmable: boolean;

  private _valueIsNull: boolean;

  private _loadedPosition = 0;
  private _loadedLength = 0;
  private _loadedRawOffset = 0;
  private _loadedRawLength = 0;
  private _valueText = '';

  protected constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, valueTextNullTrimmable: boolean) {
    if (!sequenceItem.fieldDefinition) {
      throw new Error('SequenceItem must have a field definition');
    }

    this._definition = sequenceItem.fieldDefinition;
    this._sequence = sequenceInvokation.sequence;
    this._sequenceItem = sequenceItem;
    this._sequenceRedirectList = sequenceItem.redirectList;
    this._sequenceInvokation = sequenceInvokation;
    this._valueTextNullTrimmable = valueTextNullTrimmable;

    this._name = this._definition.metaName;
    this._headings = [...this._definition.metaHeadings];

    if (this._definition.constant) {
      this._valueIsNull = this._definition.null;
    } else {
      this._valueIsNull = true;
    }
  }

  // Public properties
  get definition_(): FtFieldDefinition {
    return this._definition;
  }

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  get sidelined(): boolean {
    return this._sidelined;
  }

  set sidelined(value: boolean) {
    this._sidelined = value;
  }

  get definition(): FtFieldDefinition {
    return this._definition;
  }

  get sequence(): FtSequence {
    return this._sequence;
  }

  get sequenceItem(): FtSequenceItem {
    return this._sequenceItem;
  }

  get sequenceRedirectList(): FtSequenceRedirectList {
    return this._sequenceRedirectList;
  }

  get sequenceInvokation(): FtSequenceInvokation {
    return this._sequenceInvokation;
  }

  get headingCount(): number {
    return this._headings.length;
  }

  get headings(): string[] {
    return this._headings;
  }

  /**
   * Indicates whether a value has been assigned to the field.
   */
  get valueAssigned(): boolean {
    return this._valueAssigned;
  }

  /**
   * The formatted text of the field value as loaded from the data or via {@link (FtField:class).loadValueText}.
   */
  get valueText(): string {
    return this._valueText;
  }

  // Properties delegating to definition
  get dataType(): FtDataType {
    return this._definition.dataType;
  }

  get id(): number | undefined {
    return this._definition.id;
  }

  get name(): string {
    return this._name;
  }

  get metaHeadings(): string[] {
    return this._definition.metaHeadings;
  }

  get mainHeadingIndex(): number {
    return this._definition.mainHeadingIndex;
  }

  get culture(): DotNetLocaleSettings | undefined {
    return this._definition.culture;
  }

  get fixedWidth(): boolean {
    return this._definition.fixedWidth;
  }

  get width(): number {
    return this._definition.width;
  }

  get constant(): boolean {
    return this._definition.constant;
  }

  get valueQuotedType(): FtQuotedType {
    return this._definition.valueQuotedType;
  }

  get valueAlwaysWriteOptionalQuote(): boolean {
    return this._definition.valueAlwaysWriteOptionalQuote;
  }

  get valueWritePrefixSpace(): boolean {
    return this._definition.valueWritePrefixSpace;
  }

  get valuePadAlignment(): FtPadAlignment {
    return this._definition.valuePadAlignment;
  }

  get valuePadCharType(): FtPadCharType {
    return this._definition.valuePadCharType;
  }

  get valuePadChar(): string {
    return this._definition.valuePadChar;
  }

  get valueTruncateType(): FtTruncateType {
    return this._definition.valueTruncateType;
  }

  get valueTruncateChar(): string {
    return this._definition.valueTruncateChar;
  }

  get valueEndOfValueChar(): string {
    return this._definition.valueEndOfValueChar;
  }

  get valueNullChar(): string {
    return this._definition.valueNullChar;
  }

  get headingConstraint(): FtHeadingConstraint {
    return this._definition.headingConstraint;
  }

  get headingQuotedType(): FtQuotedType {
    return this._definition.headingQuotedType;
  }

  get headingAlwaysWriteOptionalQuote(): boolean {
    return this._definition.headingAlwaysWriteOptionalQuote;
  }

  get headingWritePrefixSpace(): boolean {
    return this._definition.headingWritePrefixSpace;
  }

  get headingPadAlignment(): FtPadAlignment {
    return this._definition.headingPadAlignment;
  }

  get headingPadCharType(): FtPadCharType {
    return this._definition.headingPadCharType;
  }

  get headingPadChar(): string {
    return this._definition.headingPadChar;
  }

  get headingTruncateType(): FtTruncateType {
    return this._definition.headingTruncateType;
  }

  get headingTruncateChar(): string {
    return this._definition.headingTruncateChar;
  }

  get headingEndOfValueChar(): string {
    return this._definition.headingEndOfValueChar;
  }

  get valueType(): string {
    return this._definition.valueType;
  }

  /** @internal */
  get asRedirectString(): string {
    return this.formatValue();
  }

  /** @internal */
  get asRedirectBoolean(): boolean {
    return this.getAsRedirectBoolean();
  }

  /** @internal */
  get asRedirectInteger(): bigint {
    return this.getAsRedirectInteger();
  }

  /** @internal */
  get asRedirectFloat(): number {
    return this.getAsRedirectFloat();
  }

  /** @internal */
  get asRedirectDateTime(): Date {
    return this.getAsRedirectDateTime();
  }

  /** @internal */
  get asRedirectDecimal(): number {
    return this.getAsRedirectDecimal();
  }

  /**
   * The field value as an unspecified type.
   *
   * When setting the value, the actual type must be compatible with the field's expected type.
   *
   * @throws FtTypeError if the value being set is not of the field's expected type.
   * @throws FtNullError if the field is `null`.
   */
  get value(): FtField.Value {
    if (this.isNull()) {
      throw new FtFieldNullError(`Field value is null: ${this.name}`);
    } else {
      return this.getValue();
    }
  }

  set value(value: FtField.Value) {
    this.setValue(value);
  }

  /**
   * The field value as a string.
   *
   * @throws FtTypeError if the field is not of data type `String`.
   * @throws FtNullError if the field is `null`.
   */
  get asString(): string {
    if (this.isNull()) {
      throw new FtFieldNullError(`String field value is null: ${this.name}`);
    } else {
      return this.getAsString();
    }
  }

  set asString(value: string) {
    this.setAsString(value);
  }

  /**
   * The field value as a boolean.
   *
   * @throws FtTypeError if the field is not of data type `Boolean`.
   * @throws FtNullError if the field is `null`.
   */
  get asBoolean(): boolean {
    if (this.isNull()) {
      throw new FtFieldNullError(`Boolean field value is null: ${this.name}`);
    } else {
      return this.getAsBoolean();
    }
  }

  set asBoolean(value: boolean) {
    this.setAsBoolean(value);
  }

  /**
   * The field value as an integer.

   * @throws FtTypeError if the field is not of data type `Integer`.
   * @throws FtNullError if the field is `null`.
   */
  get asInteger(): number {
    if (this.isNull()) {
      throw new FtFieldNullError(`Integer field value is null: ${this.name}`);
    } else {
      return this.getAsInteger();
    }
  }

  set asInteger(value: number) {
    this.setAsInteger(value);
  }

  /**
   * The field value as a bigint.
   *
   * @throws FtTypeError if the field is not of data type `BigInt`.
   * @throws FtNullError if the field is `null`.
   */
  get asBigInt(): bigint {
    if (this.isNull()) {
      throw new FtFieldNullError(`Integer field value is null: ${this.name}`);
    } else {
      return this.getAsBigInt();
    }
  }

  set asBigInt(value: bigint) {
    this.setAsBigInt(value);
  }

  /**
   * The field value as a float.
   *
   * @throws FtTypeError if the field is not of data type `Float`.
   * @throws FtNullError if the field is `null`.
   */
  get asFloat(): number {
    if (this.isNull()) {
      throw new FtFieldNullError(`Float field value is null: ${this.name}`);
    } else {
      return this.getAsFloat();
    }
  }

  set asFloat(value: number) {
    this.setAsFloat(value);
  }

  /**
   * The field value as a DateTime.
   *
   * @throws FtTypeError if the field is not of data type `DateTime`.
   * @throws FtNullError if the field is `null`.
   */
  get asDateTime(): Date {
    if (this.isNull()) {
      throw new FtFieldNullError(`DateTime field value is null: ${this.name}`);
    } else {
      return this.getAsDateTime();
    }
  }

  set asDateTime(value: Date) {
    this.setAsDateTime(value);
  }

  /**
   * The field value as a number (decimal).
   *
   * @throws FtTypeError if the field is not of data type `Decimal`.
   * @throws FtNullError if the field is `null`.
   */
  get asDecimal(): number {
    if (this.isNull()) {
      throw new FtFieldNullError(`Decimal field value is null: ${this.name}`);
    } else {
      return this.getAsDecimal();
    }
  }

  set asDecimal(value: number) {
    this.setAsDecimal(value);
  }

  /**
   * The field value as an unspecified type or null.

   * Use with caution, as this bypasses type safety. Ensure that the value being set is compatible with the field's expected type.
   */
  get nullableValue(): FtField.Value | null {
    return this.isNull() ? null : this.getValue();
  }

  set nullableValue(value: FtField.Value | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setValue(value);
    }
  }

  /**
   * The field value as a string or null.
   *
   * @throws FtTypeError if the field is not of data type `String`.
   */
  get asNullableString(): string | null {
    return this.isNull() ? null : this.getAsString();
  }

  set asNullableString(value: string | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsString(value);
    }
  }

  /**
   * The field value as a boolean or null.
   *
   * @throws FtTypeError if the field is not of data type `Boolean`.
   */
  get asNullableBoolean(): boolean | null {
    return this.isNull() ? null : this.getAsBoolean();
  }

  set asNullableBoolean(value: boolean | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsBoolean(value);
    }
  }

  /**
   * The field value as an integer or null.
   *
   * @throws FtTypeError if the field is not of data type `BigInt`.
   */
  get asNullableInteger(): number | null {
    return this.isNull() ? null : this.getAsInteger();
  }

  set asNullableInteger(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsInteger(value);
    }
  }

  /**
   * The field value as a bigint or null.
   *
   * @throws FtTypeError if the field is not of data type `BigInt`.
   */
  get asNullableBigInt(): bigint | null {
    return this.isNull() ? null : this.getAsBigInt();
  }

  set asNullableBigInt(value: bigint | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsBigInt(value);
    }
  }

  /**
   * The field value as a float or null.
   *
   * @throws FtTypeError if the field is not of data type `Float`.
   */
  get asNullableFloat(): number | null {
    return this.isNull() ? null : this.getAsFloat();
  }

  set asNullableFloat(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsFloat(value);
    }
  }

  /**
   * The field value as a Date or null.
   *
   * @throws FtTypeError if the field is not of data type `DateTime`.
   */
  get asNullableDateTime(): Date | null {
    return this.isNull() ? null : this.getAsDateTime();
  }

  set asNullableDateTime(value: Date | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsDateTime(value);
    }
  }

  /**
   * The field value as a number (decimal) or null.
   *
   * @throws FtTypeError if the field is not of data type `Decimal`.
   */
  get asNullableDecimal(): number | null {
    return this.isNull() ? null : this.getAsDecimal();
  }

  set asNullableDecimal(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsDecimal(value);
    }
  }

  /**
   * Checks if the field value is null.
   * @returns True if the field value is null, false otherwise.
   */
  isNull(): boolean {
    return this._valueIsNull;
  }

  /**
   * Sets the field value to null.
   *
   * Checks for sequence redirects that may be triggered by setting the field to null.
   *
   * @returns If this setting of field to null caused a sequence redirect, returns the index of the first field affected by the redirect. If no redirect occurred, returns FtField.NO_FIELDS_AFFECTED_INDEX.
   * @throws Error if the field is constant and cannot be set to null.
   */
  setNull(): number {
    if (this.constant) {
      throw new Error(`Cannot set constant field "${this.name}" to null`);
    } else {
      this._valueIsNull = true;
      this._valueAssigned = true;

      return this.checkNullSequenceRedirect(); // returns fieldsAffectedFromIndex
    }
  }

  /**
   * Loads the field value from its formatted text representation.
   * @param valueText - Formatted text representation of field value. Formatting only includes data type formatting and not text formatting such as quoting, padding, truncating etc.
   */
  loadValueText(valueText: string): void {
    this._valueText = valueText;
    this.loadValueFromText(valueText);
  }

  /**
   * Loads the field headings from an array of strings.
   *
   * The headings are loaded according to the field's heading constraint. See {@link (FtField:class).loadHeading} for more information.
   *
   * @param value - An array of headings. The length of the array should be equal to {@link (FtField:class).headingCount}. Extra headings are ignored and missing headings are set to empty strings.
   */
  loadHeadings(value: string[]): void {
    const valueCount = value.length;
    for (let i = 0; i < valueCount; i++) {
      this.loadHeading(i, value[i]);
    }

    const headingCount = this._headings.length;
    if (valueCount < headingCount) {
      for (let i = valueCount; i < headingCount; i++) {
        this.loadHeading(i, '');
      }
    }
  }

  /**
   * Loads a heading into one of the field's heading lines.
   *
   * The heading is loaded according to the field's heading constraint.
   *
   * @param idx - Index of the heading to load.
   * @param headingText - Text of the heading.
   */

  loadHeading(idx: number, headingText: string): void {
    if (idx >= 0 && idx < this._headings.length) {
      switch (this._definition.headingConstraint) {
        case FtHeadingConstraint.None:
          this._headings[idx] = headingText;
          break;
        case FtHeadingConstraint.AllConstant:
          if (headingText !== this._headings[idx]) {
            throw new Error(`Heading constraint violation: AllConstant at index ${idx} in field ${this.name}`);
          }
          break;
        case FtHeadingConstraint.MainConstant:
          if (idx !== this._definition.mainHeadingIndex) {
            this._headings[idx] = headingText;
          } else {
            if (headingText !== this._headings[idx]) {
              throw new Error(`Heading constraint violation: MainConstant in field ${this.name}`);
            }
          }
          break;
        case FtHeadingConstraint.NameConstant:
          if (idx !== this._definition.mainHeadingIndex) {
            this._headings[idx] = headingText;
          } else {
            if (headingText.toLowerCase() === this._definition.metaName.toLowerCase()) {
              this._headings[idx] = headingText;
            } else {
              throw new Error(`Heading constraint violation: NameConstant in field ${this.name}`);
            }
          }
          break;
        case FtHeadingConstraint.NameIsMain:
          this._headings[idx] = headingText;
          if (idx === this._definition.mainHeadingIndex) {
            this._name = headingText;
          }
          break;
        default:
          throw new FtUnreachableCaseError('FLH30773', this._definition.headingConstraint);
      }
    }
  }

  /**
   * Checks if setting the field to null triggers a sequence redirect.
   * @internal
   */
  checkNullSequenceRedirect(): number {
    if (this._sequenceRedirectList.count > 0 && !this._sidelined) {
      let redirected = false;
      for (let i = 0; i < this._sequenceRedirectList.count; i++) {
        const redirect = this._sequenceRedirectList.get(i);
        if (redirect.type === FtSequenceRedirectType.Null) {
          if (redirect.sequence) {
            return this.onSequenceRedirect(redirect.sequence, redirect.invokationDelay); // returns fieldsAffectedFromIndex
          }
          redirected = true;
          break;
        }
      }

      if (!redirected) {
        // In case was previously redirected
        return this.onSequenceRedirect(undefined, FtField.IGNORED_SEQUENCE_INVOKATION_DELAY); // returns fieldsAffectedFromIndex
      }
    }

    return FtField.NO_FIELDS_AFFECTED_INDEX;
  }

  /** @internal */
  resetValue(): void {
    if (!this.constant) {
      this._valueIsNull = true;
    }
    this._valueAssigned = false;
  }

  // Loading methods (used by parsers)

  /** @internal */
  loadPosition(position: number, length: number, rawOffset: number, rawLength: number): void {
    this._loadedPosition = position;
    this._loadedLength = length;
    this._loadedRawOffset = rawOffset;
    this._loadedRawLength = rawLength;
  }

  /** @internal */
  loadDelimitedValue(valueText: string, quoted: boolean): void {
    this._valueText = valueText;

    try {
      if (quoted) {
        this.loadValueFromText(valueText);
      } else {
        if (this._valueTextNullTrimmable) {
          valueText = valueText.trim();
          if (valueText.length === 0) {
            this.loadNullValue();
          } else {
            this.loadValueFromText(valueText);
          }
        } else {
          if (valueText.length !== 0) {
            this.loadValueFromText(valueText);
          } else {
            switch (this.valueQuotedType) {
              case FtQuotedType.Never:
              case FtQuotedType.Optional:
                this.loadValueFromText(valueText);
                break;
              case FtQuotedType.Always:
                this.loadNullValue();
                break;
              default:
                throw new FtUnreachableCaseError('FLDV30774', this.valueQuotedType);
            }
          }
        }
      }
    } catch (e) {
      throw new Error(`Error loading delimited value for field ${this.name}: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
    }
  }

  /** @internal */
  loadFixedWidthValue(valueText: string): void {
    this._valueText = valueText;
    if (valueText === this._definition.fixedWidthNullValueText) {
      this.loadNullValue();
    } else {
      try {
        this.loadValueFromText(valueText);
      } catch (e) {
        throw new Error(`Error loading fixed-width value for field ${this.name}: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
      }
    }
  }

  /** @internal */
  loadNullValue(): void {
    if (!this.constant) {
      this._valueIsNull = true;
      this._valueAssigned = true;
      this.checkNullSequenceRedirect();
    } else {
      if (!this._valueIsNull) {
        throw new Error(`Constant field ${this.name} has non-null value but null was loaded`);
      }
    }
  }

  // get dataTypeName(): string {
  //   return this._definition.dataTypeName;
  // }

  protected onSequenceRedirect(sequence: FtSequence | undefined, delay: FtSequenceInvokationDelay): number {
    if (this.sequenceRedirectEvent) {
      return this.sequenceRedirectEvent(this, sequence, delay); // returns fieldsAffectedFromIndex
    } else {
      return FtField.NO_FIELDS_AFFECTED_INDEX;
    }
  }

  protected clearNonConstantNull(): void {
    this._valueIsNull = false;
  }

  protected getAsString(): string {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsString`);
  }
  protected getAsBoolean(): boolean {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsBoolean`);
  }
  protected getAsInteger(): number {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsInteger`);
  }
  protected getAsBigInt(): bigint {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsBigInt`);
  }
  protected getAsFloat(): number {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsFloat`);
  }
  protected getAsDateTime(): Date {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsDateTime`);
  }
  protected getAsDecimal(): number {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsDecimal`);
  }

  protected setAsString(_newValue: string): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsString`);
  }
  protected setAsBoolean(_newValue: boolean): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsBoolean`);
  }
  protected setAsInteger(_newValue: number): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsInteger`);
  }
  protected setAsBigInt(_newValue: bigint): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsBigInt`);
  }
  protected setAsFloat(_newValue: number): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsFloat`);
  }
  protected setAsDateTime(_newValue: Date): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsDateTime`);
  }
  protected setAsDecimal(_newValue: number): void {
    throw new FtFieldTypeError(`Field ${this.name} does not support AsDecimal`);
  }

  // Abstract methods for subclasses
  /**
   * Formats the field value to a string.
   *
   * The formatting includes data type formatting but not text formatting such as quoting, padding, truncating etc. This formatted string typically
   * is identical to the string value in the field's {@link (FtField:class).valueText} property (unless the field value has been modified after loading).
   */
  abstract formatValue(): string;
  protected abstract loadValueFromText(valueText: string): void;

  protected abstract getValue(): FtField.Value;
  protected abstract setValue(newValue: FtField.Value): number;

  protected abstract getAsRedirectBoolean(): boolean;
  protected abstract getAsRedirectInteger(): bigint;
  protected abstract getAsRedirectFloat(): number;
  protected abstract getAsRedirectDateTime(): Date;
  protected abstract getAsRedirectDecimal(): number;
}

/** @public */
export namespace FtField {
  export type Value = string | boolean | number | bigint | Date;
  export type NullableValue = Value | null;
}
