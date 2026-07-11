import { FtDataType } from '../../index.js';
import { FtSequenceInvokation } from '../../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../../sequences/core/ft-sequence-item.js';
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

  override setValue(newValue: FtField.Value): number {
    switch (typeof newValue) {
      case 'bigint':
        return super.setValue(newValue);
      case 'number':
        return super.setValue(BigInt(newValue));
      default:
        throw new FtFieldTypeError(`Invalid type (${typeof newValue}) for integer field: ${this.name}`);
    }
  }

  protected override getAsBigInt(): bigint {
    return this.getValue();
  }

  protected override setAsBigInt(newValue: bigint): void {
    super.setValue(newValue);
  }

  protected override getAsInteger(): number {
    return Number(this.getValue());
  }

  protected override setAsInteger(newValue: number): void {
    super.setValue(BigInt(newValue));
  }

  protected isValueEqual(left: bigint, right: bigint): boolean {
    return left === right;
  }
}
