import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BooleanMetaSerialization {
  static lowerCaseTrueText = FtMetaDefaults.BooleanField.TrueText.toLowerCase();
  static lowerCaseFalseText = FtMetaDefaults.BooleanField.FalseText.toLowerCase();

  static serialize(value: boolean, defaultValue: boolean): string | undefined {
    if (value === defaultValue) {
      return undefined; // Default value
    } else {
      return value ? FtMetaDefaults.BooleanField.TrueText : FtMetaDefaults.BooleanField.FalseText;
    }
  }

  static deserialize(value: unknown, defaultValue: boolean, warnings: string[]): boolean {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Boolean: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const trimmedValue = value.trim().toLowerCase();
        if (trimmedValue === BooleanMetaSerialization.lowerCaseTrueText) {
          return true;
        } else if (trimmedValue === BooleanMetaSerialization.lowerCaseFalseText) {
          return false;
        } else {
          warnings.push(`Boolean: Invalid: ${value}`);
          return defaultValue;
        }
      }
    }
  }
}
