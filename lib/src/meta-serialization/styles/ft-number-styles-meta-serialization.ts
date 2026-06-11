import { DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtDataType, FtNumberDataType } from '../../types/enums/ft-data-type.js';
import { FtUnreachableCaseError } from '../../types/errors/ft-internal-error.js';

/** @public */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtNumberStylesMetaSerialization {
  static allowInnerWhiteMetaValue = 'AllowInnerWhite';
  static allowWhiteSpacesMetaValue = 'AllowWhiteSpaces'; // Not part of standard but supported as includes AllowInnerWhite in Dot Net.
  static lowerCaseAllowInnerWhiteMetaValue = FtNumberStylesMetaSerialization.allowInnerWhiteMetaValue.toLowerCase();
  static lowerCaseAllowWhiteSpacesMetaValue = FtNumberStylesMetaSerialization.allowWhiteSpacesMetaValue.toLowerCase();

  static serialize(styles: DotNetNumberStyles, dataType: FtNumberDataType): string | undefined {
    switch (dataType) {
      case FtDataType.Integer:
        if (styles === FtMetaDefaults.IntegerField.Styles) {
          return undefined;
        }
        break;
      case FtDataType.Float:
        if (styles === FtMetaDefaults.FloatField.Styles) {
          return undefined;
        }
        break;
      case FtDataType.Decimal:
        if (styles === FtMetaDefaults.DecimalField.Styles) {
          return undefined;
        }
        break;
      default:
        throw new FtUnreachableCaseError('NSMSS33997', dataType);
    }

    for (const compositeMetaInfo of compositeNumberStylesMetaInfoArray) {
      if (styles === compositeMetaInfo.styles) {
        return compositeMetaInfo.metaValue;
      }
    }

    const result = new Array<string>(flagNumberStylesMetaInfoCount);
    let count = 0;
    for (const flagMetaInfo of flagNumberStylesMetaInfoArray) {
      if ((styles & flagMetaInfo.styles) === flagMetaInfo.styles) {
        result[count++] = flagMetaInfo.metaValue;
      }
    }
    result.length = count;
    return result.join(',');
  }

  static deserialize(value: unknown, dataType: FtNumberDataType, warnings: string[]): DotNetNumberStyles {
    if (value === undefined) {
      return this.getDefaultNumberStyles(dataType);
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Number styles: Type: ${typeof value}`);
        return this.getDefaultNumberStyles(dataType);
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
          return DotNetNumberStyles.none;
        } else {
          let result: DotNetNumberStyles = DotNetNumberStyles.none;
          const lowerCasedValue = trimmedValue.toLowerCase();
          const styleStringArray = lowerCasedValue.split(',').map((s) => s.trim());
          for (const styleString of styleStringArray) {
            for (const compositeMetaInfo of compositeNumberStylesMetaInfoArray) {
              if (styleString === compositeMetaInfo.lowerCaseMetaValue) {
                result |= compositeMetaInfo.styles;
                continue;
              }
            }
            for (const flagMetaInfo of flagNumberStylesMetaInfoArray) {
              if (styleString === flagMetaInfo.lowerCaseMetaValue) {
                result |= flagMetaInfo.styles;
                continue;
              }
            }
            warnings.push(`Unrecognized number style: ${styleString}`);
          }
          return result;
        }
      }
    }
  }

  private static getDefaultNumberStyles(dataType: FtNumberDataType): DotNetNumberStyles {
    switch (dataType) {
      case FtDataType.Integer:
        return FtMetaDefaults.IntegerField.Styles;
      case FtDataType.Float:
        return FtMetaDefaults.FloatField.Styles;
      case FtDataType.Decimal:
        return FtMetaDefaults.DecimalField.Styles;
      default:
        throw new FtUnreachableCaseError('NSMSGDNS33999', dataType);
    }
  }
}

interface NumberStylesMetaInfo {
  styles: DotNetNumberStyles;
  metaValue: string;
  lowerCaseMetaValue: string;
}

const allowLeadingWhiteMetaValue = 'AllowLeadingWhite';
const allowTrailingWhiteMetaValue = 'AllowTrailingWhite';
const allowLeadingSignMetaValue = 'AllowLeadingSign';
const allowTrailingSignMetaValue = 'AllowTrailingSign';
const allowParenthesesMetaValue = 'AllowParentheses';
const allowDecimalPointMetaValue = 'AllowDecimalPoint';
const allowThousandsMetaValue = 'AllowThousands';
const allowExponentMetaValue = 'AllowExponent';
const allowCurrencySymbolMetaValue = 'AllowCurrencySymbol';
const allowHexSpecifierMetaValue = 'AllowHexSpecifier';

const noneMetaValue = 'None';
const anyMetaValue = 'Any';
const currencyMetaValue = 'Currency';
const floatMetaValue = 'Float';
const hexNumberMetaValue = 'HexNumber';
const integerMetaValue = 'Integer';

const flagNumberStylesMetaInfoArray: NumberStylesMetaInfo[] = [
  {
    styles: DotNetNumberStyles.allowLeadingWhite,
    metaValue: allowLeadingWhiteMetaValue,
    lowerCaseMetaValue: allowLeadingWhiteMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowTrailingWhite,
    metaValue: allowTrailingWhiteMetaValue,
    lowerCaseMetaValue: allowTrailingWhiteMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowLeadingSign,
    metaValue: allowLeadingSignMetaValue,
    lowerCaseMetaValue: allowLeadingSignMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowTrailingSign,
    metaValue: allowTrailingSignMetaValue,
    lowerCaseMetaValue: allowTrailingSignMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowParentheses,
    metaValue: allowParenthesesMetaValue,
    lowerCaseMetaValue: allowParenthesesMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowDecimalPoint,
    metaValue: allowDecimalPointMetaValue,
    lowerCaseMetaValue: allowDecimalPointMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowThousands,
    metaValue: allowThousandsMetaValue,
    lowerCaseMetaValue: allowThousandsMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowExponent,
    metaValue: allowExponentMetaValue,
    lowerCaseMetaValue: allowExponentMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowCurrencySymbol,
    metaValue: allowCurrencySymbolMetaValue,
    lowerCaseMetaValue: allowCurrencySymbolMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.allowHexSpecifier,
    metaValue: allowHexSpecifierMetaValue,
    lowerCaseMetaValue: allowHexSpecifierMetaValue.toLowerCase(),
  },
];

const flagNumberStylesMetaInfoCount = flagNumberStylesMetaInfoArray.length;

const compositeNumberStylesMetaInfoArray: NumberStylesMetaInfo[] = [
  {
    styles: DotNetNumberStyles.none,
    metaValue: noneMetaValue,
    lowerCaseMetaValue: noneMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.any,
    metaValue: anyMetaValue,
    lowerCaseMetaValue: anyMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.currency,
    metaValue: currencyMetaValue,
    lowerCaseMetaValue: currencyMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.float,
    metaValue: floatMetaValue,
    lowerCaseMetaValue: floatMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.hexNumber,
    metaValue: hexNumberMetaValue,
    lowerCaseMetaValue: hexNumberMetaValue.toLowerCase(),
  },
  {
    styles: DotNetNumberStyles.integer,
    metaValue: integerMetaValue,
    lowerCaseMetaValue: integerMetaValue.toLowerCase(),
  },
];
