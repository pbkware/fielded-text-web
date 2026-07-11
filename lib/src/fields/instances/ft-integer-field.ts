import { FtDataType } from '../../index.js';
import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
import { FtFieldNullError } from '../../types/errors/ft-field-null-error.js';
import { FtFieldTypeError } from '../../types/errors/ft-field-type-error.js';
import { FtIntegerFieldDefinition } from '../definitions/ft-integer-field-definition.js';
import { FtField } from './ft-field.js';
import { FtGenericField } from './ft-generic-field.js';

/**
 * Field for integer (bigint) values.
 * @public
 */
export class FtIntegerField extends FtGenericField<bigint> {
  private static readonly VALUE_TEXT_NULL_TRIMMABLE = true;

  constructor(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem, definition: FtIntegerFieldDefinition) {
    super(sequenceInvokation, sequenceItem, FtIntegerField.VALUE_TEXT_NULL_TRIMMABLE, definition);
  }

  override get definition(): FtIntegerFieldDefinition {
    return super.definition_ as FtIntegerFieldDefinition;
  }

  get format(): string {
    return this.definition.format;
  }

  get styles(): number {
    return this.definition.styles;
  }

  static cast(field: FtField): field is FtIntegerField {
    return field.dataType === FtDataType.Integer;
  }

  protected override getAsBigInt(): bigint {
    if (this.isNull()) {
      throw new FtFieldNullError(`BigInt field value is null: ${this.name}`);
    } else {
      return this.value;
    }
  }

  protected override setAsBigInt(newValue: bigint): void {
    this.setValue(newValue);
  }

  protected override getAsInteger(): number {
    if (this.isNull()) {
      throw new FtFieldNullError(`BigInt field value is null: ${this.name}`);
    } else {
      return Number(this.value);
    }
  }

  protected override setAsInteger(newValue: number): void {
    this.setValue(BigInt(newValue));
  }

  protected setAsUnknown(newValue: unknown): void {
    switch (typeof newValue) {
      case 'bigint':
        this.setValue(newValue);
        break;
      case 'number':
        this.setValue(BigInt(newValue));
        break;
      case 'object':
        if (newValue === null) {
          throw new FtFieldNullError(`Integer field value is null: ${this.name}`);
        } else {
          throw new FtFieldTypeError(`Invalid unknown object for Integer field: ${this.name}`);
        }
      default:
        throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for integer field: ${this.name}`);
    }
  }

  protected isValueEqual(left: bigint, right: bigint): boolean {
    return left === right;
  }
}
