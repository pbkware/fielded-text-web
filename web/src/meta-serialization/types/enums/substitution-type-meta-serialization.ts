import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtSubstitutionType } from '../../../types/enums/ft-substitution-type.js';

export namespace SubstitutionTypeMetaSerialization {
  export const defaultValue = FtMetaDefaults.Substitution.Type;

  export function serialize(value: FtSubstitutionType): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtSubstitutionType {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`SubstitutionType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`SubstitutionType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtSubstitutionType, string> = {
  [FtSubstitutionType.String]: 'String',
  [FtSubstitutionType.AutoEndOfLine]: 'AutoEndOfLine',
};

const deserializeMap: Record<string, FtSubstitutionType> = {
  String: FtSubstitutionType.String,
  AutoEndOfLine: FtSubstitutionType.AutoEndOfLine,
};
