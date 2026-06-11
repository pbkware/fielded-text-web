import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtFloatFieldDefinition } from '../definitions/ft-float-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for float (number) values.
 * @public
 */
export class FtFloatField extends FtGenericField<number> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtFloatFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtFloatField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtFloatFieldDefinition {
    return super.definition_ as FtFloatFieldDefinition;
  }

  get format(): string {
    return this.definition.format;
  }

  get styles(): number {
    return this.definition.styles;
  }

  get nullableValue(): number | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: number | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.value = value;
    }
  }

  protected isValueEqual(left: number, right: number): boolean {
    return left === right;
  }
}
