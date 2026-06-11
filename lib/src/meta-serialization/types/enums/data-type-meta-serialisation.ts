import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtDataType } from '../../../types/enums/ft-data-type.js';

export namespace DataTypeMetaSerialization {
  export const defaultValue = FtMetaDefaults.Field.DataType;

  export function serialize(value: FtDataType): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtDataType {
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`DataType: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`DataType: Value: ${value}`);
          return defaultValue; // Default value
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtDataType, string> = {
  [FtDataType.String]: 'String',
  [FtDataType.Boolean]: 'Boolean',
  [FtDataType.Integer]: 'Integer',
  [FtDataType.Float]: 'Float',
  [FtDataType.Decimal]: 'Decimal',
  [FtDataType.DateTime]: 'DateTime',
};

const deserializeMap: Record<string, FtDataType> = {
  String: FtDataType.String,
  Boolean: FtDataType.Boolean,
  Integer: FtDataType.Integer,
  Float: FtDataType.Float,
  Decimal: FtDataType.Decimal,
  DateTime: FtDataType.DateTime,
};
