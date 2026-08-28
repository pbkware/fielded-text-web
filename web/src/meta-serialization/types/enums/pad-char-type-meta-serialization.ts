import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtPadCharType } from '../../../types/enums/ft-pad-char-type.js';

export namespace PadCharTypeMetaSerialization {
  export const headingDefaultValue = FtMetaDefaults.Root.HeadingPadCharType;
  export const valueDefaultValue = FtMetaDefaults.Field.ValuePadCharType;

  export function serialize(value: FtPadCharType, isHeading: boolean, overridingHeadingDefault: FtPadCharType | undefined): string | undefined {
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
    overridingHeadingDefault: FtPadCharType | undefined,
    warnings: string[],
  ): FtPadCharType {
    const defaultValue = isHeading ? (overridingHeadingDefault ?? headingDefaultValue) : valueDefaultValue;
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`PadCharType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`PadCharType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtPadCharType, string> = {
  [FtPadCharType.Auto]: 'Auto',
  [FtPadCharType.Specified]: 'Specified',
  [FtPadCharType.EndOfValue]: 'EndOfValue',
};

const deserializeMap: Record<string, FtPadCharType> = {
  Auto: FtPadCharType.Auto,
  Specified: FtPadCharType.Specified,
  EndOfValue: FtPadCharType.EndOfValue,
};
