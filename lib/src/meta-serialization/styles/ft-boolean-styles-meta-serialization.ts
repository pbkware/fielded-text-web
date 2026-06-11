import { FtBooleanMetaField } from '../../meta/fields/ft-boolean-meta-field.js';
import { FtBooleanStyles, noneBooleanStyles } from '../../types/enums/ft-boolean-styles.js';

/** @public */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtBooleanStylesMetaSerialization {
  static serialize(styles: FtBooleanStyles): string | undefined {
    if (styles === FtBooleanMetaField.DEFAULT_STYLES) {
      return undefined;
    } else {
      const result = new Array<string>(booleanStylesMetaInfoCount);
      let count = 0;
      for (const metaInfo of booleanStylesMetaInfoArray) {
        if ((styles & metaInfo.styles) === metaInfo.styles) {
          result[count++] = metaInfo.metaValue;
        }
      }
      result.length = count;
      return result.join(',');
    }
  }

  static deserialize(value: unknown, warnings: string[]): FtBooleanStyles {
    if (value === undefined) {
      return FtBooleanMetaField.DEFAULT_STYLES;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Boolean styles: Type: ${typeof value}`);
        return FtBooleanMetaField.DEFAULT_STYLES;
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
          return noneBooleanStyles;
        } else {
          let result: FtBooleanStyles = noneBooleanStyles;
          const lowerCasedValue = trimmedValue.toLowerCase();
          const styleStringArray = lowerCasedValue.split(',').map((s) => s.trim());
          for (const styleString of styleStringArray) {
            for (const metaInfo of booleanStylesMetaInfoArray) {
              if (styleString === metaInfo.lowerCaseMetaValue) {
                result |= metaInfo.styles;
              } else {
                warnings.push(`Unknown boolean style: '${styleString}'`);
              }
            }
          }
          return result;
        }
      }
    }
  }
}

interface BooleanStylesMetaInfo {
  styles: FtBooleanStyles;
  metaValue: string;
  lowerCaseMetaValue: string;
}

const ignoreCaseMetaValue = 'IgnoreCase';
const matchFirstCharOnlyMetaValue = 'MatchFirstCharOnly';
const ignoreTrailingCharsMetaValue = 'IgnoreTrailingChars';
const falseIfNotMatchTrueMetaValue = 'FalseIfNotMatchTrue';

const booleanStylesMetaInfoArray: BooleanStylesMetaInfo[] = [
  {
    styles: FtBooleanStyles.IgnoreCase,
    metaValue: ignoreCaseMetaValue,
    lowerCaseMetaValue: ignoreCaseMetaValue.toLowerCase(),
  },
  {
    styles: FtBooleanStyles.MatchFirstCharOnly,
    metaValue: matchFirstCharOnlyMetaValue,
    lowerCaseMetaValue: matchFirstCharOnlyMetaValue.toLowerCase(),
  },
  {
    styles: FtBooleanStyles.IgnoreTrailingChars,
    metaValue: ignoreTrailingCharsMetaValue,
    lowerCaseMetaValue: ignoreTrailingCharsMetaValue.toLowerCase(),
  },
  {
    styles: FtBooleanStyles.FalseIfNotMatchTrue,
    metaValue: falseIfNotMatchTrueMetaValue,
    lowerCaseMetaValue: falseIfNotMatchTrueMetaValue.toLowerCase(),
  },
];

const booleanStylesMetaInfoCount = booleanStylesMetaInfoArray.length;
