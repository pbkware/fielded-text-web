import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtBooleanStyles } from '../../types/enums/ft-boolean-styles.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtBooleanFieldDefinition } from '../definitions/ft-boolean-field-definition.js';
import { FtField } from './ft-field.js';
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

  static cast(field: FtField): field is FtBooleanField {
    return field.dataType === FtDataType.Boolean;
  }

  override setValue(newValue: FtField.Value): number {
    if (typeof newValue === 'boolean') {
      return super.setValue(newValue);
    } else {
      throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for boolean field: ${this.name}`);
    }
  }

  protected override getAsBoolean(): boolean {
    return this.getValue();
  }

  protected override setAsBoolean(newValue: boolean): void {
    super.setValue(newValue);
  }

  protected isValueEqual(left: boolean, right: boolean): boolean {
    return left === right;
  }
}
