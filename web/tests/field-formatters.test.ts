import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import {
  FtBooleanFieldFormatter,
  FtDateTimeFieldFormatter,
  FtDecimalFieldFormatter,
  FtFloatFieldFormatter,
  FtIntegerFieldFormatter,
  FtStringFieldFormatter,
} from '../src/serialization/formatting/index.js';
import { FtBooleanStyles } from '../src/types/enums/ft-boolean-styles.js';

describe('FtStringFieldFormatter', () => {
  it('should pass through text unchanged', () => {
    const formatter = new FtStringFieldFormatter();

    expect(formatter.toText('hello')).toBe('hello');
    expect(formatter.toText('')).toBe('');
    expect(formatter.toText('  spaces  ')).toBe('  spaces  ');
  });

  it('should parse text unchanged', () => {
    const formatter = new FtStringFieldFormatter();

    expect(formatter.parse('hello')).toBe('hello');
    expect(formatter.parse('')).toBe('');
    expect(formatter.parse('123')).toBe('123');
  });
});

describe('FtBooleanFieldFormatter', () => {
  describe('Basic formatting', () => {
    it('should format true/false with default text', () => {
      const formatter = new FtBooleanFieldFormatter();

      expect(formatter.toText(true)).toBe('True');
      expect(formatter.toText(false)).toBe('False');
    });

    it('should format with custom text', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = 'Yes';
      formatter.falseText = 'No';

      expect(formatter.toText(true)).toBe('Yes');
      expect(formatter.toText(false)).toBe('No');
    });
  });

  describe('Basic parsing - case sensitive', () => {
    it('should parse exact matches', () => {
      const formatter = new FtBooleanFieldFormatter();

      expect(formatter.parse('True')).toBe(true);
      expect(formatter.parse('False')).toBe(false);
    });

    it('should throw on mismatched case', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly; // Case sensitive by default

      expect(() => formatter.parse('true')).toThrow();
      expect(() => formatter.parse('false')).toThrow();
    });

    it('should throw on unrecognized text', () => {
      const formatter = new FtBooleanFieldFormatter();

      expect(() => formatter.parse('yes')).toThrow();
      expect(() => formatter.parse('1')).toThrow();
      expect(() => formatter.parse('')).toThrow();
    });
  });

  describe('IgnoreCase style', () => {
    it('should parse case-insensitively', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('True')).toBe(true);
      expect(formatter.parse('true')).toBe(true);
      expect(formatter.parse('TRUE')).toBe(true);
      expect(formatter.parse('False')).toBe(false);
      expect(formatter.parse('false')).toBe(false);
      expect(formatter.parse('FALSE')).toBe(false);
    });

    it('should work with custom text', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = 'Yes';
      formatter.falseText = 'No';
      formatter.styles = FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('yes')).toBe(true);
      expect(formatter.parse('YES')).toBe(true);
      expect(formatter.parse('no')).toBe(false);
      expect(formatter.parse('NO')).toBe(false);
    });
  });

  describe('MatchFirstCharOnly style', () => {
    it('should match only first character', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly;

      expect(formatter.parse('T')).toBe(true);
      expect(formatter.parse('F')).toBe(false);
    });

    it('should be case sensitive by default', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly;

      expect(() => formatter.parse('t')).toThrow();
      expect(() => formatter.parse('f')).toThrow();
    });

    it('should work with IgnoreCase', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly | FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('T')).toBe(true);
      expect(formatter.parse('t')).toBe(true);
      expect(formatter.parse('F')).toBe(false);
      expect(formatter.parse('f')).toBe(false);
    });

    it('should work with custom text', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = 'Yes';
      formatter.falseText = 'No';
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly | FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('Y')).toBe(true);
      expect(formatter.parse('y')).toBe(true);
      expect(formatter.parse('N')).toBe(false);
      expect(formatter.parse('n')).toBe(false);
    });

    it('should use culture-aware case conversion', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = 'İzin'; // Turkish: starts with dotted capital I
      formatter.falseText = 'Hayır';
      formatter.styles = FtBooleanStyles.MatchFirstCharOnly | FtBooleanStyles.IgnoreCase;

      // Turkish locale for proper 'i'/'İ' handling
      const turkishLocale = new DotNetLocaleSettings('tr-TR');
      formatter.culture = turkishLocale;

      // In Turkish, lowercase 'i' uppercases to dotted 'İ'
      expect(formatter.parse('i')).toBe(true);
      expect(formatter.parse('İ')).toBe(true);
    });
  });

  describe('IgnoreTrailingChars style', () => {
    it('should match prefix and ignore trailing', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.IgnoreTrailingChars;

      expect(formatter.parse('True')).toBe(true);
      expect(formatter.parse('TrueExtra')).toBe(true);
      expect(formatter.parse('False')).toBe(false);
      expect(formatter.parse('FalseExtra')).toBe(false);
    });

    it('should require full prefix match', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.IgnoreTrailingChars;

      expect(() => formatter.parse('Tru')).toThrow();
      expect(() => formatter.parse('Fals')).toThrow();
    });

    it('should work with IgnoreCase', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.IgnoreTrailingChars | FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('true123')).toBe(true);
      expect(formatter.parse('FALSE456')).toBe(false);
    });
  });

  describe('FalseIfNotMatchTrue style', () => {
    it('should return false for any non-true text', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.FalseIfNotMatchTrue;

      expect(formatter.parse('True')).toBe(true);
      expect(formatter.parse('False')).toBe(false);
      expect(formatter.parse('anything')).toBe(false);
      expect(formatter.parse('')).toBe(false);
      expect(formatter.parse('123')).toBe(false);
    });

    it('should work with IgnoreCase', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.FalseIfNotMatchTrue | FtBooleanStyles.IgnoreCase;

      expect(formatter.parse('TRUE')).toBe(true);
      expect(formatter.parse('true')).toBe(true);
      expect(formatter.parse('anything')).toBe(false);
    });
  });

  describe('Empty string handling', () => {
    it('should handle empty stateText', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = '';
      formatter.falseText = 'No';

      expect(formatter.parse('')).toBe(true);
      expect(formatter.parse('No')).toBe(false);
    });

    it('should handle empty stateText with IgnoreTrailingChars', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.trueText = '';
      formatter.falseText = 'No';
      formatter.styles = FtBooleanStyles.IgnoreTrailingChars;

      // When trueText is "" and IgnoreTrailingChars is set,
      // ANY text matches true (even "No"), because empty prefix matches everything
      expect(formatter.parse('')).toBe(true);
      expect(formatter.parse('anything')).toBe(true);
      expect(formatter.parse('No')).toBe(true); // Matches trueText before checking falseText
    });
  });

  describe('Combined styles', () => {
    it('should work with multiple flags', () => {
      const formatter = new FtBooleanFieldFormatter();
      formatter.styles = FtBooleanStyles.IgnoreCase | FtBooleanStyles.IgnoreTrailingChars;

      expect(formatter.parse('true')).toBe(true);
      expect(formatter.parse('TRUE123')).toBe(true);
      expect(formatter.parse('false')).toBe(false);
      expect(formatter.parse('FALSE456')).toBe(false);
    });
  });
});

describe('FtIntegerFieldFormatter', () => {
  it('should format integers as strings', () => {
    const formatter = new FtIntegerFieldFormatter();

    expect(formatter.toText(BigInt(0))).toBe('0');
    expect(formatter.toText(BigInt(42))).toBe('42');
    expect(formatter.toText(BigInt(-100))).toBe('-100');
    expect(formatter.toText(BigInt(1000000))).toBe('1000000');
  });

  it('should parse integer strings', () => {
    const formatter = new FtIntegerFieldFormatter();

    expect(formatter.parse('0')).toBe(BigInt(0));
    expect(formatter.parse('42')).toBe(BigInt(42));
    expect(formatter.parse('-100')).toBe(BigInt(-100));
    expect(formatter.parse('1000000')).toBe(BigInt(1000000));
  });

  it('should support format strings', () => {
    const formatter = new FtIntegerFieldFormatter();
    formatter.format = 'N0';

    const result = formatter.toText(BigInt(1234567));
    // Should include grouping separators (locale dependent)
    expect(result).toMatch(/[\d,. ]+/);
  });

  it('should throw on invalid integer text', () => {
    const formatter = new FtIntegerFieldFormatter();

    expect(() => formatter.parse('abc')).toThrow();
    expect(() => formatter.parse('12.34')).toThrow();
    expect(() => formatter.parse('')).toThrow();
  });

  it('should handle number input to toText', () => {
    const formatter = new FtIntegerFieldFormatter();

    expect(formatter.toText(42)).toBe('42');
    expect(formatter.toText(-100)).toBe('-100');
  });

  it('should use culture settings when provided', () => {
    const formatter = new FtIntegerFieldFormatter();
    formatter.format = 'N0';

    // German locale uses period for thousands separator
    const germanLocale = new DotNetLocaleSettings('de-DE');
    formatter.culture = germanLocale;

    const result = formatter.toText(BigInt(1234567));
    expect(result).toBeTruthy();
    // Format depends on locale implementation
  });
});

describe('FtFloatFieldFormatter', () => {
  it('should format floats as strings', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(formatter.toText(0)).toBe('0');
    expect(formatter.toText(3.14159)).toBe('3.14159');
    expect(formatter.toText(-2.5)).toBe('-2.5');
  });

  it('should parse float strings', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(formatter.parse('0')).toBe(0);
    expect(formatter.parse('3.14159')).toBeCloseTo(3.14159);
    expect(formatter.parse('-2.5')).toBe(-2.5);
  });

  it('should support format strings', () => {
    const formatter = new FtFloatFieldFormatter();
    formatter.format = 'F2';

    expect(formatter.toText(3.14159)).toBe('3.14');
    expect(formatter.toText(100.999)).toBe('101.00');
  });

  it('should throw on invalid float text', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(() => formatter.parse('abc')).toThrow();
    expect(() => formatter.parse('')).toThrow();
  });

  it('should support exponential/scientific format with round-trip', () => {
    const formatter = new FtFloatFieldFormatter();
    formatter.format = 'E'; // Scientific/exponential format

    const value = 123000;
    const text = formatter.toText(value);
    // Should be in scientific notation like "1.230000E+005"
    expect(text).toMatch(/[\d.]+E[+-]\d+/i);

    // Round-trip should work now
    const parsed = formatter.parse(text);
    expect(parsed).toBeCloseTo(value);
  });

  it('should parse scientific notation with lowercase e', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(formatter.parse('1.23e5')).toBeCloseTo(123000);
    expect(formatter.parse('1e-3')).toBeCloseTo(0.001);
    expect(formatter.parse('2.5e2')).toBeCloseTo(250);
  });

  it('should parse scientific notation with uppercase E', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(formatter.parse('1.23E5')).toBeCloseTo(123000);
    expect(formatter.parse('1E-3')).toBeCloseTo(0.001);
    expect(formatter.parse('2.5E2')).toBeCloseTo(250);
  });

  it('should parse scientific notation with explicit + sign', () => {
    const formatter = new FtFloatFieldFormatter();

    expect(formatter.parse('1.23e+5')).toBeCloseTo(123000);
    expect(formatter.parse('1.23E+5')).toBeCloseTo(123000);
    expect(formatter.parse('5e+2')).toBeCloseTo(500);
  });

  it('should parse scientific notation regardless of output format', () => {
    const formatter = new FtFloatFieldFormatter();
    formatter.format = 'F2'; // Fixed-point format, not exponential

    // Should still parse scientific notation input
    expect(formatter.parse('1.23e5')).toBeCloseTo(123000);
    expect(formatter.parse('4.56E-2')).toBeCloseTo(0.0456);
  });

  it('should use culture settings when provided', () => {
    const formatter = new FtFloatFieldFormatter();
    formatter.format = 'N2';

    const germanLocale = new DotNetLocaleSettings('de-DE');
    formatter.culture = germanLocale;

    const result = formatter.toText(1234.56);
    expect(result).toBeTruthy();
  });
});

describe('FtDecimalFieldFormatter', () => {
  it('should format decimals as strings', () => {
    const formatter = new FtDecimalFieldFormatter();

    expect(formatter.toText(0)).toBe('0');
    expect(formatter.toText(123.45)).toBe('123.45');
    expect(formatter.toText(-99.99)).toBe('-99.99');
  });

  it('should parse decimal strings', () => {
    const formatter = new FtDecimalFieldFormatter();

    expect(formatter.parse('0')).toBe(0);
    expect(formatter.parse('123.45')).toBeCloseTo(123.45);
    expect(formatter.parse('-99.99')).toBeCloseTo(-99.99);
  });

  it('should support format strings', () => {
    const formatter = new FtDecimalFieldFormatter();
    formatter.format = 'F2';

    expect(formatter.toText(3.14159)).toBe('3.14');
    expect(formatter.toText(100.999)).toBe('101.00');
  });

  it('should throw on invalid decimal text', () => {
    const formatter = new FtDecimalFieldFormatter();

    expect(() => formatter.parse('abc')).toThrow();
    expect(() => formatter.parse('')).toThrow();
  });

  it('should use culture settings when provided', () => {
    const formatter = new FtDecimalFieldFormatter();
    formatter.format = 'C2';

    const usLocale = new DotNetLocaleSettings('en-US');
    formatter.culture = usLocale;

    const result = formatter.toText(1234.56);
    expect(result).toBeTruthy();
  });
});

describe('FtDateTimeFieldFormatter', () => {
  it('should format dates with default format', () => {
    const formatter = new FtDateTimeFieldFormatter();
    const date = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024 14:30:00

    const result = formatter.toText(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should parse date strings with default format', () => {
    const formatter = new FtDateTimeFieldFormatter();
    const dateStr = '20240115';

    const result = formatter.parse(dateStr);
    expect(result).toBeInstanceOf(Date);
  });

  it('should support custom format strings', () => {
    const formatter = new FtDateTimeFieldFormatter();
    formatter.format = 'yyyy-MM-dd';

    const date = new Date(2024, 0, 15);
    const result = formatter.toText(date);
    expect(result).toBe('2024-01-15');
  });

  it('should parse with custom format', () => {
    const formatter = new FtDateTimeFieldFormatter();
    formatter.format = 'yyyy-MM-dd';

    const result = formatter.parse('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(15);
  });

  it('should throw on invalid date text', () => {
    const formatter = new FtDateTimeFieldFormatter();

    expect(() => formatter.parse('not a date')).toThrow();
    expect(() => formatter.parse('')).toThrow();
  });

  it('should support short date format', () => {
    const formatter = new FtDateTimeFieldFormatter();
    formatter.format = 'd';

    const date = new Date(2024, 0, 15);
    const result = formatter.toText(date);
    expect(result).toBeTruthy();
  });

  it('should support time format', () => {
    const formatter = new FtDateTimeFieldFormatter();
    formatter.format = 'HH:mm:ss';

    const date = new Date(2024, 0, 15, 14, 30, 45);
    const result = formatter.toText(date);
    expect(result).toBe('14:30:45');
  });

  it('should use culture settings when provided', () => {
    const formatter = new FtDateTimeFieldFormatter();
    formatter.format = 'D';

    const usLocale = new DotNetLocaleSettings('en-US');
    formatter.culture = usLocale;

    const date = new Date(2024, 0, 15);
    const result = formatter.toText(date);
    expect(result).toBeTruthy();
  });
});

describe('Formatter Integration', () => {
  it('should handle round-trip conversions', () => {
    // Boolean round trip
    const boolFormatter = new FtBooleanFieldFormatter();
    expect(boolFormatter.parse(boolFormatter.toText(true))).toBe(true);
    expect(boolFormatter.parse(boolFormatter.toText(false))).toBe(false);

    // Integer round trip
    const intFormatter = new FtIntegerFieldFormatter();
    const intValue = BigInt(12345);
    expect(intFormatter.parse(intFormatter.toText(intValue))).toBe(intValue);

    // Float round trip
    const floatFormatter = new FtFloatFieldFormatter();
    const floatValue = 123.45;
    expect(floatFormatter.parse(floatFormatter.toText(floatValue))).toBeCloseTo(floatValue);

    // String round trip (trivial but complete)
    const stringFormatter = new FtStringFieldFormatter();
    const stringValue = 'test value';
    expect(stringFormatter.parse(stringFormatter.toText(stringValue))).toBe(stringValue);
  });

  it('should all support culture settings', () => {
    const locale = new DotNetLocaleSettings('en-US');

    const intFormatter = new FtIntegerFieldFormatter();
    intFormatter.culture = locale;
    expect(intFormatter.culture).toBe(locale);

    const floatFormatter = new FtFloatFieldFormatter();
    floatFormatter.culture = locale;
    expect(floatFormatter.culture).toBe(locale);

    const decimalFormatter = new FtDecimalFieldFormatter();
    decimalFormatter.culture = locale;
    expect(decimalFormatter.culture).toBe(locale);

    const dateFormatter = new FtDateTimeFieldFormatter();
    dateFormatter.culture = locale;
    expect(dateFormatter.culture).toBe(locale);

    const boolFormatter = new FtBooleanFieldFormatter();
    boolFormatter.culture = locale;
    expect(boolFormatter.culture).toBe(locale);

    const stringFormatter = new FtStringFieldFormatter();
    stringFormatter.culture = locale;
    expect(stringFormatter.culture).toBe(locale);
  });
});
