import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtFloatFieldDefinition } from '../definitions/ft-float-field-definition.js';
import { FtField } from './ft-field.js';
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

  static cast(field: FtField): field is FtFloatField {
    return field.dataType === FtDataType.Float;
  }

  override setValue(newValue: FtField.Value): number {
    if (typeof newValue === 'number') {
      return super.setValue(newValue);
    } else {
      throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for float field: ${this.name}`);
    }
  }

  protected override getAsFloat(): number {
    return this.getValue();
  }

  protected override setAsFloat(newValue: number): void {
    super.setValue(newValue);
  }

  protected isValueEqual(left: number, right: number): boolean {
    return left === right;
  }
}
