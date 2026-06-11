import { isDigitCharCode } from '@pbkware/js-utils';
import { FtAssertError } from '../../types/errors/ft-internal-error.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FloatMetaSerialization {
  static serialize(value: number, defaultValue: number): string | undefined {
    if (value === defaultValue) {
      return undefined; // Default value
    } else {
      if (!Number.isFinite(value)) {
        throw new FtAssertError('FMSS99312');
      } else {
        return value.toString(10);
      }
    }
  }

  static deserialize(value: unknown, defaultValue: number, warnings: string[]): number {
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Float: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const trimmedValue = value.trim();

        if (!this.isStringValid(trimmedValue)) {
          warnings.push(`Float: Invalid: ${value}`);
          return defaultValue; // Default value
        } else {
          const result = parseFloat(trimmedValue);
          if (isNaN(result)) {
            warnings.push(`Float: NaN: ${value}`);
            return defaultValue; // Default value
          } else {
            return result;
          }
        }
      }
    }
  }

  private static isStringValid(trimmedValue: string): boolean {
    const length = trimmedValue.length;

    let gotDecimal = false;
    let gotDigit = false;
    let gotE = false;
    let previousWasE = false;

    for (let i = 0; i < length; i++) {
      const char = trimmedValue[i];

      switch (char) {
        case '+':
        case '-': {
          if (i !== 0 && !previousWasE) {
            return false;
          } else {
            previousWasE = false;
            break;
          }
        }
        case '.': {
          if (gotDecimal || gotE) {
            return false;
          } else {
            gotDecimal = true;
            break;
          }
        }
        case 'e':
        case 'E': {
          if (!gotDigit || gotE) {
            return false;
          } else {
            gotE = true;
            previousWasE = true;
            break;
          }
        }
        default: {
          if (!isDigitCharCode(char.charCodeAt(0))) {
            return false;
          } else {
            gotDigit = true;
            previousWasE = false;
          }
        }
      }
    }

    return gotDigit;
  }
}
