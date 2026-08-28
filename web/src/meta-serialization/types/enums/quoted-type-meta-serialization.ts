import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtQuotedType } from '../../../types/enums/ft-quoted-type.js';

export namespace QuotedTypeMetaSerialization {
  export const headingDefaultValue = FtMetaDefaults.Root.HeadingQuotedType;
  export const valueDefaultValue = FtMetaDefaults.Field.ValueQuotedType;

  export function serialize(value: FtQuotedType, isHeading: boolean, overridingHeadingDefault: FtQuotedType | undefined): string | undefined {
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
    overridingHeadingDefault: FtQuotedType | undefined,
    warnings: string[],
  ): FtQuotedType {
    const defaultValue = isHeading ? (overridingHeadingDefault ?? headingDefaultValue) : valueDefaultValue;
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`QuotedType: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`QuotedType: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtQuotedType, string> = {
  [FtQuotedType.Never]: 'Never',
  [FtQuotedType.Always]: 'Always',
  [FtQuotedType.Optional]: 'Optional',
};

const deserializeMap: Record<string, FtQuotedType> = {
  Never: FtQuotedType.Never,
  Always: FtQuotedType.Always,
  Optional: FtQuotedType.Optional,
};
