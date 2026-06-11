import { FtBooleanFieldDefinition } from '../fields/definitions/ft-boolean-field-definition.js';
import { FtDateTimeFieldDefinition } from '../fields/definitions/ft-date-time-field-definition.js';
import { FtDecimalFieldDefinition } from '../fields/definitions/ft-decimal-field-definition.js';
import { FtFieldDefinition } from '../fields/definitions/ft-field-definition.js';
import { FtFloatFieldDefinition } from '../fields/definitions/ft-float-field-definition.js';
import { FtIntegerFieldDefinition } from '../fields/definitions/ft-integer-field-definition.js';
import { FtStringFieldDefinition } from '../fields/definitions/ft-string-field-definition.js';
import { FtBooleanField } from '../fields/instances/ft-boolean-field.js';
import { FtDateTimeField } from '../fields/instances/ft-date-time-field.js';
import { FtDecimalField } from '../fields/instances/ft-decimal-field.js';
import { FtField } from '../fields/instances/ft-field.js';
import { FtFloatField } from '../fields/instances/ft-float-field.js';
import { FtIntegerField } from '../fields/instances/ft-integer-field.js';
import { FtStringField } from '../fields/instances/ft-string-field.js';
import { FtBooleanMetaField } from '../meta/fields/ft-boolean-meta-field.js';
import { FtDateTimeMetaField } from '../meta/fields/ft-date-time-meta-field.js';
import { FtDecimalMetaField } from '../meta/fields/ft-decimal-meta-field.js';
import { FtFloatMetaField } from '../meta/fields/ft-float-meta-field.js';
import { FtIntegerMetaField } from '../meta/fields/ft-integer-meta-field.js';
import type { FtMetaField } from '../meta/fields/ft-meta-field.js';
import { FtStringMetaField } from '../meta/fields/ft-string-meta-field.js';
import { FtSequenceInvokation } from '../sequences/core/ft-sequence-invokation.js';
import { FtSequenceItem } from '../sequences/core/ft-sequence-item.js';
import { FtDataType } from '../types/enums/ft-data-type.js';
import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';

/**
 * Factory for creating field instances based on their definitions.
 * @public
 */
export class FtFieldFactory {
  static createFieldDefinition(dataType: FtDataType, index: number): FtFieldDefinition {
    switch (dataType) {
      case FtDataType.String:
        return new FtStringFieldDefinition(index);
      case FtDataType.Boolean:
        return new FtBooleanFieldDefinition(index);
      case FtDataType.Integer:
        return new FtIntegerFieldDefinition(index);
      case FtDataType.Float:
        return new FtFloatFieldDefinition(index);
      case FtDataType.Decimal:
        return new FtDecimalFieldDefinition(index);
      case FtDataType.DateTime:
        return new FtDateTimeFieldDefinition(index);
      default:
        throw new FtUnreachableCaseError('FFCFD34499', dataType);
    }
  }

  static createField(sequenceInvokation: FtSequenceInvokation, sequenceItem: FtSequenceItem): FtField {
    const definition = sequenceItem.fieldDefinition;
    if (!definition) {
      throw new Error('SequenceItem must have a field definition');
    }

    // Create field based on data type
    switch (definition.dataType) {
      case FtDataType.String:
        return new FtStringField(sequenceInvokation, sequenceItem, definition as FtStringFieldDefinition);
      case FtDataType.Boolean:
        return new FtBooleanField(sequenceInvokation, sequenceItem, definition as FtBooleanFieldDefinition);
      case FtDataType.Integer:
        return new FtIntegerField(sequenceInvokation, sequenceItem, definition as FtIntegerFieldDefinition);
      case FtDataType.Float:
        return new FtFloatField(sequenceInvokation, sequenceItem, definition as FtFloatFieldDefinition);
      case FtDataType.Decimal:
        return new FtDecimalField(sequenceInvokation, sequenceItem, definition as FtDecimalFieldDefinition);
      case FtDataType.DateTime:
        return new FtDateTimeField(sequenceInvokation, sequenceItem, definition as FtDateTimeFieldDefinition);
      default:
        throw new FtUnreachableCaseError('FFCFD34499', definition.dataType);
    }
  }

  static createMetaField(dataType: FtDataType, headingCount: number): FtMetaField {
    switch (dataType) {
      case FtDataType.String:
        return new FtStringMetaField(headingCount);
      case FtDataType.Boolean:
        return new FtBooleanMetaField(headingCount);
      case FtDataType.Integer:
        return new FtIntegerMetaField(headingCount);
      case FtDataType.Float:
        return new FtFloatMetaField(headingCount);
      case FtDataType.Decimal:
        return new FtDecimalMetaField(headingCount);
      case FtDataType.DateTime:
        return new FtDateTimeMetaField(headingCount);
      default:
        throw new FtUnreachableCaseError('FFCMF34499', dataType);
    }
  }
}
