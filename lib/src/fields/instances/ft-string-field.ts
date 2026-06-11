import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtStringFieldDefinition } from '../definitions/ft-string-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for string values.
 * @public
 */
export class FtStringField extends FtGenericField<string> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = false;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtStringFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtStringField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  get nullableValue(): string | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: string | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.value = value;
    }
  }

  override setValue(value: string | null): number {
    if (value === null) {
      return this.setNull(); // returns fieldsAffectedFromIndex
    } else {
      return super.setValue(value); // returns fieldsAffectedFromIndex
    }
  }

  protected isValueEqual(left: string, right: string): boolean {
    return left === right;
  }
}
