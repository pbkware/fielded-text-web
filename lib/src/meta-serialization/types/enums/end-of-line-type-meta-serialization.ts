import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtEndOfLineType } from '../../../types/enums/ft-end-of-line-type.js';

export namespace EndOfLineTypeMetaSerialization {
  export const defaultValue = FtMetaDefaults.Root.EndOfLineType;

  export function serialize(value: FtEndOfLineType): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtEndOfLineType {
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`EndOfLineType: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`EndOfLineType: Value: ${value}`);
          return defaultValue; // Default value
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtEndOfLineType, string> = {
  [FtEndOfLineType.Auto]: 'Auto',
  [FtEndOfLineType.Char]: 'Char',
  [FtEndOfLineType.CrLf]: 'CrLf',
};

const deserializeMap: Record<string, FtEndOfLineType> = {
  Auto: FtEndOfLineType.Auto,
  Char: FtEndOfLineType.Char,
  CrLf: FtEndOfLineType.CrLf,
};
