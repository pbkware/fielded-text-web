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

  protected valueAssigned = false;
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
  private _loadedValueText = '';

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

  get valueAssigned_(): boolean {
    return this.valueAssigned;
  }

  get loadedValueText(): string {
    return this._loadedValueText;
  }

  // Properties delegating to definition
  get dataType(): FtDataType {
    return this._definition.dataType;
  }

  get id(): number | undefined {
    return this._definition.id;
  }

  get name(): string {
    return this._definition.metaName;
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
    return this.getAsNonNullValueText();
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

  // Public property accessors
  get asValueText(): string | null {
    return this.isNull() ? null : this.getAsNonNullValueText();
  }

  set asValueText(value: string | null) {
    this.setAsValueText(value);
  }

  get asObject(): unknown {
    return this.isNull() ? null : this.getAsNonNullObject();
  }

  set asObject(value: unknown) {
    this.setAsObject(value);
  }

  get asString(): string | null {
    return this.isNull() ? null : this.getAsNonNullString();
  }

  set asString(value: string | null) {
    this.setAsString(value);
  }

  get asBoolean(): boolean {
    return this.getAsBoolean();
  }

  set asBoolean(value: boolean) {
    this.setAsBoolean(value);
  }

  get asInteger(): number {
    return this.getAsInteger();
  }

  set asInteger(value: number) {
    this.setAsInteger(value);
  }

  get asBigInt(): bigint {
    return this.getAsBigInt();
  }

  set asBigInt(value: bigint) {
    this.setAsBigInt(value);
  }

  get asFloat(): number {
    return this.getAsFloat();
  }

  set asFloat(value: number) {
    this.setAsFloat(value);
  }

  get asDateTime(): Date {
    return this.getAsDateTime();
  }

  set asDateTime(value: Date) {
    this.setAsDateTime(value);
  }

  get asDecimal(): number {
    return this.getAsDecimal();
  }

  set asDecimal(value: number) {
    this.setAsDecimal(value);
  }

  // Nullable property accessors
  get asNullableBoolean(): boolean | null {
    return this.isNull() ? null : this.asBoolean;
  }

  set asNullableBoolean(value: boolean | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsBoolean(value);
    }
  }

  get asNullableInteger(): number | null {
    return this.isNull() ? null : this.asInteger;
  }

  set asNullableInteger(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsInteger(value);
    }
  }

  get asNullableBigInt(): bigint | null {
    return this.isNull() ? null : this.asBigInt;
  }

  set asNullableBigInt(value: bigint | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsBigInt(value);
    }
  }

  get asNullableFloat(): number | null {
    return this.isNull() ? null : this.asFloat;
  }

  set asNullableFloat(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsFloat(value);
    }
  }

  get asNullableDateTime(): Date | null {
    return this.isNull() ? null : this.asDateTime;
  }

  set asNullableDateTime(value: Date | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsDateTime(value);
    }
  }

  get asNullableDecimal(): number | null {
    return this.isNull() ? null : this.asDecimal;
  }

  set asNullableDecimal(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setAsDecimal(value);
    }
  }

  // Null handling
  isNull(): boolean {
    return this._valueIsNull;
  }

  setNull(): number {
    if (this.constant) {
      throw new Error(`Cannot set constant field "${this.name}" to null`);
    } else {
      this._valueIsNull = true;
      this.valueAssigned = true;

      return this.checkNullSequenceRedirect(); // returns fieldsAffectedFromIndex
    }
  }

  loadHeadings(value: string[]): void {
    for (let i = 0; i < value.length; i++) {
      this.loadHeading(i, value[i]);
    }
  }

  loadHeading(idx: number, headingText: string): void {
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

  /** @internal */
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
    this.valueAssigned = false;
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
    this._loadedValueText = valueText;

    try {
      if (quoted) {
        this.loadNonNullValue(valueText);
      } else {
        if (this._valueTextNullTrimmable) {
          valueText = valueText.trim();
          if (valueText.length === 0) {
            this.loadNullValue();
          } else {
            this.loadNonNullValue(valueText);
          }
        } else {
          if (valueText.length !== 0) {
            this.loadNonNullValue(valueText);
          } else {
            switch (this.valueQuotedType) {
              case FtQuotedType.Never:
              case FtQuotedType.Optional:
                this.loadNonNullValue(valueText);
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
    this._loadedValueText = valueText;
    if (valueText === this._definition.fixedWidthNullValueText) {
      this.loadNullValue();
    } else {
      try {
        this.loadNonNullValue(valueText);
      } catch (e) {
        throw new Error(`Error loading fixed-width value for field ${this.name}: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
      }
    }
  }

  /** @internal */
  loadNullValue(): void {
    if (!this.constant) {
      this._valueIsNull = true;
      this.valueAssigned = true;
      this.checkNullSequenceRedirect();
    } else {
      if (!this._valueIsNull) {
        throw new Error(`Constant field ${this.name} has non-null value but null was loaded`);
      }
    }
  }

  /**
   * Get the field value as text (for writing). Public accessor for protected method.
   * @internal
   */
  getValueText(): string {
    return this.getAsNonNullValueText();
  }

  /**
   * Check if the field value has been assigned. Public accessor for protected property.
   * @internal
   */
  isValueAssigned(): boolean {
    return this.valueAssigned;
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

  private setAsNonNullValueText(newValue: string): void {
    try {
      this.loadNonNullValue(newValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to set field "${this.name}" value: ${message}`, { cause: error });
    }
  }

  private setAsValueText(newValue: string | null): void {
    if (newValue === null) {
      this.setNull();
    } else {
      this.setAsNonNullValueText(newValue);
    }
  }

  private setAsObject(newValue: unknown): void {
    if (newValue === null || newValue === undefined) {
      this.setNull();
    } else {
      this.setAsNonNullObject(newValue);
    }
  }

  private setAsString(newValue: string | null): void {
    if (newValue === null) {
      this.setNull();
    } else {
      this.setAsNonNullString(newValue);
    }
  }

  // Abstract methods for subclasses
  protected abstract getAsNonNullValueText(): string;
  protected abstract loadNonNullValue(valueText: string): void;

  protected abstract getAsNonNullObject(): unknown;
  protected abstract getAsNonNullString(): string;
  protected abstract getAsBoolean(): boolean;
  protected abstract getAsInteger(): number;
  protected abstract getAsBigInt(): bigint;
  protected abstract getAsFloat(): number;
  protected abstract getAsDateTime(): Date;
  protected abstract getAsDecimal(): number;

  protected abstract setAsNonNullObject(newValue: unknown): void;
  protected abstract setAsNonNullString(newValue: string): void;
  protected abstract setAsBoolean(newValue: boolean): void;
  protected abstract setAsInteger(newValue: number): void;
  protected abstract setAsBigInt(newValue: bigint): void;
  protected abstract setAsFloat(newValue: number): void;
  protected abstract setAsDateTime(newValue: Date): void;
  protected abstract setAsDecimal(newValue: number): void;

  protected abstract getAsRedirectBoolean(): boolean;
  protected abstract getAsRedirectInteger(): bigint;
  protected abstract getAsRedirectFloat(): number;
  protected abstract getAsRedirectDateTime(): Date;
  protected abstract getAsRedirectDecimal(): number;
}
