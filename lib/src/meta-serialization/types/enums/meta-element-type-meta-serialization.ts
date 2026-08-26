import { FtMetaElementType } from '../../../types/enums/ft-meta-element-type.js';
import { FtErr, FtOk, FtResult } from '../../../utils/ft-result.js';

export namespace MetaElementTypeMetaSerialization {
  export function serialize(value: FtMetaElementType): string {
    return serializeMap[value];
  }

  export function deserialize(value: string): FtResult<FtMetaElementType> {
    const deserializedValue = deserializeMap[value.trim()];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (deserializedValue === undefined) {
      return new FtErr(`MetaElementType: Value: ${value}`);
    } else {
      return new FtOk(deserializedValue);
    }
  }
}

const serializeMap: Record<FtMetaElementType, string> = {
  [FtMetaElementType.FieldedText]: 'FieldedText',
  [FtMetaElementType.Substitution]: 'Substitution',
  [FtMetaElementType.Field]: 'Field',
  [FtMetaElementType.Sequence]: 'Sequence',
  [FtMetaElementType.SequenceItem]: 'Item',
  [FtMetaElementType.SequenceRedirect]: 'Redirect',
};

const deserializeMap: Record<string, FtMetaElementType> = {
  FieldedText: FtMetaElementType.FieldedText,
  Substitution: FtMetaElementType.Substitution,
  Field: FtMetaElementType.Field,
  Sequence: FtMetaElementType.Sequence,
  Item: FtMetaElementType.SequenceItem,
  Redirect: FtMetaElementType.SequenceRedirect,
};
