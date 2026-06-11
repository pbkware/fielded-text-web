import { CommaText } from '@pbkware/js-utils';
import { FtMetaFieldList } from '../../meta/fields/ft-meta-field-list.js';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtMetaSequence } from '../../meta/sequences/core/ft-meta-sequence.js';
import { IntegerFloatMetaSerialization } from '../types/integer-float-meta-serialization.js';

export namespace SequenceItemFieldIndexSerialization {
  export interface SerializeUpToRedirectResult {
    commaTextFieldIndices: string | undefined;
    count: number;
  }

  export function serializeUpToRedirect(sequenceItem: FtMetaSequence, indexOrderedFieldList: FtMetaFieldList): SerializeUpToRedirectResult {
    const itemList = sequenceItem.itemList;
    const listCount = itemList.count;
    const fieldIndices = new Array<number>(listCount);
    let count = 0;
    for (let i = 0; i < listCount; i++) {
      const item = itemList.get(i);
      if (item.redirectList.count > 0) {
        break; // We can only use field indices
      } else {
        const field = item.field;
        const index = indexOrderedFieldList.indexOf(field);
        fieldIndices[count++] = index;
      }
    }
    fieldIndices.length = count; // Trim to actual count

    const commaTextFieldIndices = count > 0 ? CommaText.fromIntegerArray(fieldIndices) : undefined;

    return {
      commaTextFieldIndices,
      count: count,
    };
  }

  export function serializeField(field: FtMetaField, indexOrderedFieldList: FtMetaFieldList): string {
    const index = indexOrderedFieldList.indexOf(field);
    if (index < 0) {
      throw new Error(`Field not found in field list: ${field.name}`);
    } else {
      const fieldIndex = IntegerFloatMetaSerialization.serialize(index, false);
      if (fieldIndex === undefined) {
        throw new Error(`Field index is undefined for field: ${field.name}`);
      } else {
        return fieldIndex;
      }
    }
  }

  export function deserializeField(
    serializedFieldIndex: unknown,
    resolvedOrderedFieldList: FtMetaFieldList,
    warnings: string[],
  ): FtMetaField | undefined {
    if (serializedFieldIndex === undefined) {
      warnings.push(`Undefined field index value`);
      return undefined;
    } else {
      const fieldIndex = IntegerFloatMetaSerialization.deserialize(serializedFieldIndex, -1, false, warnings);
      if (fieldIndex < 0) {
        return undefined;
      } else {
        const field = resolvedOrderedFieldList.get(fieldIndex);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (field === undefined) {
          warnings.push(`Field not found at index ${fieldIndex} in field list`);
          return undefined;
        } else {
          return field;
        }
      }
    }
  }
}
