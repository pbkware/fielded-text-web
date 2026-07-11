import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtDateTimeFieldDefinition } from '../definitions/ft-date-time-field-definition.js';
import { FtField } from './ft-field.js';
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

  static cast(field: FtField): field is FtDateTimeField {
    return field.dataType === FtDataType.DateTime;
  }

  override setValue(newValue: FtField.Value): number {
    switch (typeof newValue) {
      case 'string':
      case 'number':
        return super.setValue(new Date(newValue));
        break;
      case 'object':
        if (newValue instanceof Date) {
          return super.setValue(newValue);
        } else {
          throw new FtFieldTypeError(`Invalid object for DateTime field: ${this.name}`);
        }
        break;
      default:
        throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for date-time field: ${this.name}`);
    }
  }

  protected override getAsDateTime(): Date {
    return this.getValue();
  }

  protected override setAsDateTime(newValue: Date): void {
    super.setValue(newValue);
  }

  protected isValueEqual(left: Date, right: Date): boolean {
    return left.getTime() === right.getTime();
  }
}
