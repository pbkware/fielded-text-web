import { DotNetDateTimeStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';

/** @public */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtDateTimeStylesMetaSerialization {
  static allowInnerWhiteMetaValue = 'AllowInnerWhite';
  static allowWhiteSpacesMetaValue = 'AllowWhiteSpaces'; // Not part of standard but supported as includes AllowInnerWhite in Dot Net.
  static lowerCaseAllowInnerWhiteMetaValue = FtDateTimeStylesMetaSerialization.allowInnerWhiteMetaValue.toLowerCase();
  static lowerCaseAllowWhiteSpacesMetaValue = FtDateTimeStylesMetaSerialization.allowWhiteSpacesMetaValue.toLowerCase();

  static serialize(styles: DotNetDateTimeStyles): string | undefined {
    if (styles === FtMetaDefaults.DateTimeField.Styles) {
      return undefined;
    } else {
      if ((styles & DotNetDateTimeStyles.allowInnerWhite) === DotNetDateTimeStyles.allowInnerWhite) {
        return this.allowInnerWhiteMetaValue;
      } else {
        return undefined;
      }
    }
  }

  static deserialize(value: unknown, warnings: string[]): DotNetDateTimeStyles {
    if (value === undefined) {
      return FtMetaDefaults.DateTimeField.Styles;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`DateTime styles: Type: ${typeof value}`);
        return FtMetaDefaults.DateTimeField.Styles;
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
          return DotNetDateTimeStyles.none;
        } else {
          const lowerCasedValue = trimmedValue.toLowerCase();
          const styleStringArray = lowerCasedValue.split(',').map((s) => s.trim());
          for (const styleString of styleStringArray) {
            if (styleString === this.lowerCaseAllowInnerWhiteMetaValue || styleString === this.lowerCaseAllowWhiteSpacesMetaValue) {
              return DotNetDateTimeStyles.allowInnerWhite;
            } else {
              warnings.push(`Unrecognized date/time style: ${styleString}`);
            }
          }
          return DotNetDateTimeStyles.none;
        }
      }
    }
  }
}
