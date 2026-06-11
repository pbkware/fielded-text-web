import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtDataType } from '../../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import { FtUnreachableCaseError } from '../../../types/errors/ft-internal-error.js';

export namespace SequenceRedirectTypeMetaSerialization {
  export const stringDefaultValue = FtMetaDefaults.StringField.SequenceRedirectType;
  export const booleanDefaultValue = FtMetaDefaults.BooleanField.SequenceRedirectType;
  export const integerDefaultValue = FtMetaDefaults.IntegerField.SequenceRedirectType;
  export const floatDefaultValue = FtMetaDefaults.FloatField.SequenceRedirectType;
  export const decimalDefaultValue = FtMetaDefaults.DecimalField.SequenceRedirectType;
  export const dateTimeDefaultValue = FtMetaDefaults.DateTimeField.SequenceRedirectType;

  export function serialize(value: FtSequenceRedirectType, dataType: FtDataType): string | undefined {
    const defaultValue = calculateDefaultValue(dataType);
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, dataType: FtDataType, warnings: string[]): FtSequenceRedirectType {
    const defaultValue = calculateDefaultValue(dataType);
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`SequenceRedirectType: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`SequenceRedirectType: Value: ${value}`);
          return defaultValue; // Default value
        } else {
          return result;
        }
      }
    }
  }

  function calculateDefaultValue(dataType: FtDataType): FtSequenceRedirectType {
    switch (dataType) {
      case FtDataType.String:
        return stringDefaultValue;
      case FtDataType.Boolean:
        return booleanDefaultValue;
      case FtDataType.Integer:
        return integerDefaultValue;
      case FtDataType.Float:
        return floatDefaultValue;
      case FtDataType.Decimal:
        return decimalDefaultValue;
      case FtDataType.DateTime:
        return dateTimeDefaultValue;
      default:
        throw new FtUnreachableCaseError('SRTMSCDV99312', dataType);
    }
  }
}

const serializeMap: Record<FtSequenceRedirectType, string> = {
  [FtSequenceRedirectType.Null]: 'Null',
  [FtSequenceRedirectType.ExactString]: 'ExactString',
  [FtSequenceRedirectType.CaseInsensitiveString]: 'CaseInsensitiveString',
  [FtSequenceRedirectType.Boolean]: 'Boolean',
  [FtSequenceRedirectType.ExactInteger]: 'ExactInteger',
  [FtSequenceRedirectType.ExactFloat]: 'ExactFloat',
  [FtSequenceRedirectType.ExactDateTime]: 'ExactDateTime',
  [FtSequenceRedirectType.Date]: 'Date',
  [FtSequenceRedirectType.ExactDecimal]: 'ExactDecimal',
};

const deserializeMap: Record<string, FtSequenceRedirectType> = {
  Null: FtSequenceRedirectType.Null,
  ExactString: FtSequenceRedirectType.ExactString,
  CaseInsensitiveString: FtSequenceRedirectType.CaseInsensitiveString,
  Boolean: FtSequenceRedirectType.Boolean,
  ExactInteger: FtSequenceRedirectType.ExactInteger,
  ExactFloat: FtSequenceRedirectType.ExactFloat,
  ExactDateTime: FtSequenceRedirectType.ExactDateTime,
  Date: FtSequenceRedirectType.Date,
  ExactDecimal: FtSequenceRedirectType.ExactDecimal,
};
