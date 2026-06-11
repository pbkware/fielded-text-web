import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDateTimeFieldDefinition } from '../definitions/ft-date-time-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for DateTime values.
 * @public
 */
export class FtDateTimeField extends FtGenericField<Date> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtDateTimeFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtDateTimeField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtDateTimeFieldDefinition {
    return super.definition_ as FtDateTimeFieldDefinition;
  }

  get format(): string {
    return this.definition.format;
  }

  get styles(): number {
    return this.definition.styles;
  }

  get nullableValue(): Date | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: Date | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.value = value;
    }
  }

  protected isValueEqual(left: Date, right: Date): boolean {
    return left.getTime() === right.getTime();
  }
}
