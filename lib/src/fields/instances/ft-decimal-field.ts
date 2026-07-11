import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldNullError } from '../../types/errors/ft-field-null-error.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtDecimalFieldDefinition } from '../definitions/ft-decimal-field-definition.js';
import { FtField } from './ft-field.js';
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

  static cast(field: FtField): field is FtDecimalField {
    return field.dataType === FtDataType.Decimal;
  }

  protected override getAsDecimal(): number {
    if (this.isNull()) {
      throw new FtFieldNullError(`Decimal field value is null: ${this.name}`);
    } else {
      return this.value;
    }
  }

  protected override setAsDecimal(newValue: number): void {
    this.setValue(newValue);
  }

  protected setAsUnknown(newValue: unknown): void {
    switch (typeof newValue) {
      case 'number':
        this.setValue(newValue);
        break;
      case 'object':
        if (newValue === null) {
          throw new FtFieldNullError(`Decimal field value is null: ${this.name}`);
        } else {
          throw new FtFieldTypeError(`Invalid unknown object for Decimal field: ${this.name}`);
        }
      default:
        throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for decimal field: ${this.name}`);
    }
  }

  protected isValueEqual(left: number, right: number): boolean {
    return left === right;
  }
}
