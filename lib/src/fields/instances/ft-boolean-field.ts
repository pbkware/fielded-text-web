import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtBooleanStyles } from '../../types/enums/ft-boolean-styles.js';
import { FtBooleanFieldDefinition } from '../definitions/ft-boolean-field-definition.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for boolean values.
 * @public
 */
export class FtBooleanField extends FtGenericField<boolean> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtBooleanFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtBooleanField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtBooleanFieldDefinition {
    return super.definition_ as FtBooleanFieldDefinition;
  }

  get falseText(): string {
    return this.definition.falseText;
  }

  get trueText(): string {
    return this.definition.trueText;
  }

  get styles(): FtBooleanStyles {
    return this.definition.styles;
  }

  get nullableValue(): boolean | null {
    return this.isNull() ? null : this.value;
  }

  set nullableValue(value: boolean | null) {
    if (value === null) {
      this.setNull();
    } else {
      this.value = value;
    }
  }

  protected isValueEqual(left: boolean, right: boolean): boolean {
    return left === right;
  }
}
