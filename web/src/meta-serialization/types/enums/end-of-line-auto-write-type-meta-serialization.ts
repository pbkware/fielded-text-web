import { FtEndOfLineAutoWriteType } from '../../../types/enums/ft-end-of-line-auto-write-type.js';

export namespace EndOfLineAutoWriteTypeMetaSerialization {
  export const defaultValue = FtEndOfLineAutoWriteType.CrLf;

  export function serialize(value: FtEndOfLineAutoWriteType): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtEndOfLineAutoWriteType {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`EndOfLineAutoWriteType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`EndOfLineAutoWriteType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtEndOfLineAutoWriteType, string> = {
  [FtEndOfLineAutoWriteType.CrLf]: 'CrLf',
  [FtEndOfLineAutoWriteType.Cr]: 'Cr',
  [FtEndOfLineAutoWriteType.Lf]: 'Lf',
  [FtEndOfLineAutoWriteType.Local]: 'Local',
};

const deserializeMap: Record<string, FtEndOfLineAutoWriteType> = {
  CrLf: FtEndOfLineAutoWriteType.CrLf,
  Cr: FtEndOfLineAutoWriteType.Cr,
  Lf: FtEndOfLineAutoWriteType.Lf,
  Local: FtEndOfLineAutoWriteType.Local,
};
