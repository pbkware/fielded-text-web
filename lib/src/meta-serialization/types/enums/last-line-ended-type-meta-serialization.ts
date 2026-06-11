import { FtLastLineEndedType } from '../../../types/enums/ft-last-line-ended-type.js';

export namespace LastLineEndedTypeMetaSerialization {
  export const defaultValue = FtLastLineEndedType.Never;

  export function serialize(value: FtLastLineEndedType): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtLastLineEndedType {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`LastLineEndedType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`LastLineEndedType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtLastLineEndedType, string> = {
  [FtLastLineEndedType.Never]: 'Never',
  [FtLastLineEndedType.Always]: 'Always',
  [FtLastLineEndedType.Optional]: 'Optional',
};

const deserializeMap: Record<string, FtLastLineEndedType> = {
  Never: FtLastLineEndedType.Never,
  Always: FtLastLineEndedType.Always,
  Optional: FtLastLineEndedType.Optional,
};
