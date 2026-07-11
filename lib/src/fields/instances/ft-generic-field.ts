import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtAssertError } from '../../types/errors/ft-internal-error.js';
import { FtGenericFieldDefinition } from '../definitions/ft-generic-field-definition.js';
import { FtField } from './ft-field.js';

/**
 * Generic base class for typed fields.
 * Provides type-safe value access and implements conversion methods.
 * @public
 */
export abstract class FtGenericField<T extends string | number | boolean | bigint | Date> extends FtField {
  private _value!: T;

  protected constructor(
    sequenceInvokation: FtSequenceInvokation,
    sequenceItem: FtSequenceItem,
    valueTextNullTrimmable: boolean,
    definition: FtGenericFieldDefinition<T>,
  ) {
    super(sequenceInvokation, sequenceItem, valueTextNullTrimmable);

    // Verify the sequenceItem's definition matches the provided definition
    if (sequenceItem.fieldDefinition !== definition) {
      throw new FtAssertError('FGC60112', `${definition.metaName}, ${sequenceItem.fieldDefinition?.metaName}`);
    } else {
      if (definition.constant && !definition.null) {
        this._value = definition.value;
      }
    }
  }

  override get definition_(): FtGenericFieldDefinition<T> {
    return super.definition_ as FtGenericFieldDefinition<T>;
  }

  get value(): T {
    return this.getValueOrThrowNull();
  }

  set value(val: T) {
    this.setValue(val); // ignore fieldsAffectedFromIndex for direct value sets, as sequence redirects are not expected in this case
  }

  get nullableValue(): T | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: T | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.setValue(value);
    }
  }

  setValue(val: T): number {
    if (this.constant) {
      throw new Error(`Cannot set constant field "${this.name}"`);
    } else {
      this.clearNonConstantNull();
      this._value = val;
      this._valueAssigned = true;
      return this.checkValueSequenceRedirect(); // returns fieldsAffectedFromIndex
    }
  }

  formatValue(): string {
    try {
      return this.definition_.formatValue(this._value);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to convert field "${this.name}" to text: ${message}`, { cause: error });
    }
  }

  protected getAsUnknown(): unknown {
    return this._value;
  }

  protected getAsRedirectBoolean(): boolean {
    return Boolean(this._value);
  }

  protected getAsRedirectInteger(): bigint {
    if (typeof this._value === 'bigint') {
      return this._value;
    }
    return BigInt(Number(this._value));
  }

  protected getAsRedirectFloat(): number {
    return Number(this._value);
  }

  protected getAsRedirectDateTime(): Date {
    if (this._value instanceof Date) {
      return this._value;
    }
    return new Date(Number(this._value));
  }

  protected getAsRedirectDecimal(): number {
    return Number(this._value);
  }

  protected override loadValueFromText(valueText: string): void {
    if (!this.constant) {
      this.clearNonConstantNull();
      this._value = this.definition_.parseValueText(valueText);
      this._valueAssigned = true;
      this.checkValueSequenceRedirect(); // ignore fieldsAffectedFromIndex for value loads, as sequence redirects are not expected in this case
    } else {
      if (this.isNull()) {
        throw new Error(`Constant field "${this.name}" expected null but got value: ${valueText}`);
      } else {
        const parsedValue = this.definition_.parseValueText(valueText);
        if (!this.isValueEqual(this._value, parsedValue)) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Constant field "${this.name}" value mismatch: expected ${this._value}, got ${valueText}`);
        }
      }
    }
  }

  private getValueOrThrowNull(): T {
    if (this.isNull()) {
      throw new Error(`Attempt to get value from null field "${this.name}"`);
    }
    return this._value;
  }

  private checkValueSequenceRedirect(): number {
    if (this.sequenceRedirectList.count > 0 && !this.sidelined) {
      let redirected = false;
      for (let i = 0; i < this.sequenceRedirectList.count; i++) {
        const redirect = this.sequenceRedirectList.get(i);
        if (redirect.type !== FtSequenceRedirectType.Null) {
          if (redirect.checkTriggered(this)) {
            if (redirect.sequence) {
              return this.onSequenceRedirect(redirect.sequence, redirect.invokationDelay); // returns fieldsAffectedFromIndex
            }
            redirected = true;
            break;
          }
        }
      }

      if (!redirected) {
        // In case was previously redirected
        return this.onSequenceRedirect(undefined, FtField.IGNORED_SEQUENCE_INVOKATION_DELAY); // returns fieldsAffectedFromIndex
      }
    }

    return FtField.NO_FIELDS_AFFECTED_INDEX;
  }

  /**
   * Check if two values are equal.
   * @param left - Left value
   * @param right - Right value
   * @returns true if values are equal
   */
  protected abstract isValueEqual(left: T, right: T): boolean;
}
