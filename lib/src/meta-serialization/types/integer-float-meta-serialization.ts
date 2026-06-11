import { parseIntStrict } from '@pbkware/js-utils';
import { FtAssertError } from '../../types/errors/ft-internal-error.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class IntegerFloatMetaSerialization {
  static serialize(value: number, allowNegative: boolean, defaultValue?: number): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      if (!Number.isSafeInteger(value)) {
        throw new FtAssertError('IFMSS99312');
      } else {
        if (!allowNegative && value < 0) {
          throw new FtAssertError('IFMSS99313');
        } else {
          return value.toString(10);
        }
      }
    }
  }

  static deserialize(value: unknown, defaultValue: number, allowNegative: boolean, warnings: string[]): number {
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Integer Float: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const trimmedValue = value.trim();
        const result = parseIntStrict(trimmedValue);
        if (result === undefined) {
          warnings.push(`Integer Float: Invalid: ${value}`);
          return defaultValue; // Default value
        } else {
          if (!allowNegative && result < 0) {
            warnings.push(`Integer Float: Negative value: ${result}`);
            return defaultValue;
          } else {
            return result;
          }
        }
      }
    }
  }
}
