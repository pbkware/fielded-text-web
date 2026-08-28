import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtPadAlignment } from '../../../types/enums/ft-pad-alignment.js';

export namespace PadAlignmentMetaSerialization {
  export const headingDefaultValue = FtMetaDefaults.Root.HeadingPadAlignment;
  export const valueDefaultValue = FtMetaDefaults.Field.ValuePadAlignment;

  export function serialize(value: FtPadAlignment, isHeading: boolean, overridingHeadingDefault: FtPadAlignment | undefined): string | undefined {
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
    overridingHeadingDefault: FtPadAlignment | undefined,
    warnings: string[],
  ): FtPadAlignment {
    const defaultValue = isHeading ? (overridingHeadingDefault ?? headingDefaultValue) : valueDefaultValue;
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`PadAlignment: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`PadAlignment: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtPadAlignment, string> = {
  [FtPadAlignment.Auto]: 'Auto',
  [FtPadAlignment.Left]: 'Left',
  [FtPadAlignment.Right]: 'Right',
};

const deserializeMap: Record<string, FtPadAlignment> = {
  Auto: FtPadAlignment.Auto,
  Left: FtPadAlignment.Left,
  Right: FtPadAlignment.Right,
};
