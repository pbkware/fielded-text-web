import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
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

  override setValue(newValue: FtField.Value): number {
    if (typeof newValue === 'string') {
      return super.setValue(newValue);
    } else {
      throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for string field: ${this.name}`);
    }
  }

  protected override getAsString(): string {
    return this.getValue();
  }

  protected override setAsString(newValue: string): void {
    super.setValue(newValue);
  }

  protected isValueEqual(left: string, right: string): boolean {
    return left === right;
  }
}
