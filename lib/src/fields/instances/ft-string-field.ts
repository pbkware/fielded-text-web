import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldNullError } from '../../types/errors/ft-field-null-error.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtStringFieldDefinition } from '../definitions/ft-string-field-definition.js';
import { FtField } from './ft-field.js';
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

  static cast(field: FtField): field is FtStringField {
    return field.dataType === FtDataType.String;
  }

  protected override getAsString(): string {
    if (this.isNull()) {
      throw new FtFieldNullError(`String field value is null: ${this.name}`);
    } else {
      return this.value;
    }
  }

  protected override setAsString(newValue: string): void {
    this.setValue(newValue);
  }

  protected setAsUnknown(newValue: unknown): void {
    switch (typeof newValue) {
      case 'string':
        this.setValue(newValue);
        break;
      case 'object':
        if (newValue === null) {
          throw new FtFieldNullError(`String field value is null: ${this.name}`);
        } else {
          throw new FtFieldTypeError(`Invalid unknown object for String field: ${this.name}`);
        }
      default:
        throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for string field: ${this.name}`);
    }
  }

  protected isValueEqual(left: string, right: string): boolean {
    return left === right;
  }
}
