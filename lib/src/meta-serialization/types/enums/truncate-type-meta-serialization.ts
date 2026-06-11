import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtTruncateType } from '../../../types/enums/ft-truncate-type.js';

export namespace TruncateTypeMetaSerialization {
  export const headingDefaultValue = FtMetaDefaults.Root.HeadingTruncateType;
  export const valueDefaultValue = FtMetaDefaults.Field.ValueTruncateType;

  export function serialize(value: FtTruncateType, isHeading: boolean, overridingHeadingDefault: FtTruncateType | undefined): string | undefined {
    const defaultValue = isHeading ? (overridingHeadingDefault ?? headingDefaultValue) : valueDefaultValue;
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(
    value: unknown,
    isHeading: boolean,
    overridingHeadingDefault: FtTruncateType | undefined,
    warnings: string[],
  ): FtTruncateType {
    const defaultValue = isHeading ? (overridingHeadingDefault ?? headingDefaultValue) : valueDefaultValue;
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`TruncateType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`TruncateType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtTruncateType, string> = {
  [FtTruncateType.Left]: 'Left',
  [FtTruncateType.Right]: 'Right',
  [FtTruncateType.TruncateChar]: 'TruncateChar',
  [FtTruncateType.NullChar]: 'NullChar',
  [FtTruncateType.Exception]: 'Exception',
};

const deserializeMap: Record<string, FtTruncateType> = {
  Left: FtTruncateType.Left,
  Right: FtTruncateType.Right,
  TruncateChar: FtTruncateType.TruncateChar,
  NullChar: FtTruncateType.NullChar,
  Exception: FtTruncateType.Exception,
};
