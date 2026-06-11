import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDecimalFieldDefinition } from '../definitions/ft-decimal-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for decimal values.
 * @public
 */
export class FtDecimalField extends FtGenericField<number> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtDecimalFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtDecimalField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtDecimalFieldDefinition {
    return super.definition_ as FtDecimalFieldDefinition;
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
