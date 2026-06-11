import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtIntegerFieldDefinition } from '../definitions/ft-integer-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for integer (bigint) values.
 * @public
 */
export class FtIntegerField extends FtGenericField<bigint> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtIntegerFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtIntegerField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtIntegerFieldDefinition {
    return super.definition_ as FtIntegerFieldDefinition;
  }

  get format(): string {
    return this.definition.format;
  }

  get styles(): number {
    return this.definition.styles;
  }

  get nullableValue(): bigint | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: bigint | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.value = value;
    }
  }

  protected isValueEqual(left: bigint, right: bigint): boolean {
    return left === right;
  }
}
