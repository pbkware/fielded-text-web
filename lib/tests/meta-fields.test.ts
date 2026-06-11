// Comprehensive tests for meta field classes
import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtBooleanStyles,
  FtDataType,
  FtDateTimeMetaField,
  FtDecimalMetaField,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtMetaField,
  FtStringMetaField,
} from '../src/index.js';

describe('Meta Field Classes', () => {
  describe('FtStringMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtStringMetaField();
      expect(field.dataType).toBe(FtDataType.String);
    });

    it('should have default empty string value', () => {
      const field = new FtStringMetaField();
      expect(field.value).toBe('');
    });

    it('should accept heading count', () => {
      const field = new FtStringMetaField(3);
      expect(field.headingCount).toBe(3);
      expect(field.headings.length).toBe(3);
    });

    it('should allow setting and getting value', () => {
      const field = new FtStringMetaField();
      field.value = 'test value';
      expect(field.value).toBe('test value');
    });

    it('should create copy with same properties', () => {
      const field = new FtStringMetaField(2);
      field.name = 'TestField';
      field.value = 'test';
      field.width = 10;
      field.fixedWidth = true;

      const copy = field.createCopy();
      expect(copy).toBeInstanceOf(FtStringMetaField);
      expect(copy.name).toBe('TestField');
      expect((copy as FtStringMetaField).value).toBe('test');
      expect(copy.width).toBe(10);
      expect(copy.fixedWidth).toBe(true);
      expect(copy.headingCount).toBe(2);
    });

    it('should reset value on loadDefaults', () => {
      const field = new FtStringMetaField();
      field.value = 'changed';
      field.loadDefaults();
      expect(field.value).toBe('');
    });
  });

  describe('FtBooleanMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtBooleanMetaField();
      expect(field.dataType).toBe(FtDataType.Boolean);
    });

    it('should have default false value', () => {
      const field = new FtBooleanMetaField();
      expect(field.value).toBe(false);
    });

    it('should have default true/false text', () => {
      const field = new FtBooleanMetaField();
      expect(field.trueText).toBe('True');
      expect(field.falseText).toBe('False');
    });

    it('should have default styles', () => {
      const field = new FtBooleanMetaField();
      expect(field.styles).toBe(FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly);
    });

    it('should allow customizing true/false text', () => {
      const field = new FtBooleanMetaField();
      field.trueText = 'Yes';
      field.falseText = 'No';
      expect(field.trueText).toBe('Yes');
      expect(field.falseText).toBe('No');
    });

    it('should allow setting styles', () => {
      const field = new FtBooleanMetaField();
      field.styles = FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly;
      expect(field.styles).toBe(FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly);
    });

    it('should create copy with all properties', () => {
      const field = new FtBooleanMetaField(1);
      field.value = true;
      field.trueText = 'Y';
      field.falseText = 'N';
      field.styles = FtBooleanStyles.IgnoreCase;

      const copy = field.createCopy() as FtBooleanMetaField;
      expect(copy.value).toBe(true);
      expect(copy.trueText).toBe('Y');
      expect(copy.falseText).toBe('N');
      expect(copy.styles).toBe(FtBooleanStyles.IgnoreCase);
    });

    it('should reset to defaults on loadDefaults', () => {
      const field = new FtBooleanMetaField();
      field.value = true;
      field.trueText = 'Yes';
      field.styles = FtBooleanStyles.IgnoreCase;

      field.loadDefaults();

      expect(field.value).toBe(false);
      expect(field.trueText).toBe('True');
      expect(field.styles).toBe(FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly);
    });
  });

  describe('FtIntegerMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtIntegerMetaField();
      expect(field.dataType).toBe(FtDataType.Integer);
    });

    it('should have default value of 0', () => {
      const field = new FtIntegerMetaField();
      expect(field.value).toBe(BigInt(0));
    });

    it('should allow setting bigint values', () => {
      const field = new FtIntegerMetaField();
      field.value = BigInt(12345);
      expect(field.value).toBe(BigInt(12345));
    });

    it('should have default format G', () => {
      const field = new FtIntegerMetaField();
      expect(field.format).toBe('G');
    });

    it('should allow setting format', () => {
      const field = new FtIntegerMetaField();
      field.format = 'N0';
      expect(field.format).toBe('N0');
    });

    it('should copy format and styles', () => {
      const field = new FtIntegerMetaField();
      field.value = BigInt(999);
      field.format = 'X8';
      field.styles = 7; // NumberStyles flags

      const copy = field.createCopy() as FtIntegerMetaField;
      expect(copy.value).toBe(BigInt(999));
      expect(copy.format).toBe('X8');
      expect(copy.styles).toBe(7);
    });
  });

  describe('FtFloatMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtFloatMetaField();
      expect(field.dataType).toBe(FtDataType.Float);
    });

    it('should have default value of 0', () => {
      const field = new FtFloatMetaField();
      expect(field.value).toBe(0);
    });

    it('should allow setting number values', () => {
      const field = new FtFloatMetaField();
      field.value = 3.14159;
      expect(field.value).toBeCloseTo(3.14159);
    });

    it('should have default format G', () => {
      const field = new FtFloatMetaField();
      expect(field.format).toBe('G');
    });

    it('should allow setting format', () => {
      const field = new FtFloatMetaField();
      field.format = 'F2';
      expect(field.format).toBe('F2');
    });

    it('should copy all properties', () => {
      const field = new FtFloatMetaField();
      field.value = 123.456;
      field.format = 'E';

      const copy = field.createCopy() as FtFloatMetaField;
      expect(copy.value).toBeCloseTo(123.456);
      expect(copy.format).toBe('E');
    });
  });

  describe('FtDecimalMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtDecimalMetaField();
      expect(field.dataType).toBe(FtDataType.Decimal);
    });

    it('should have default value of 0', () => {
      const field = new FtDecimalMetaField();
      expect(field.value).toBe(0);
    });

    it('should handle decimal values', () => {
      const field = new FtDecimalMetaField();
      field.value = 99.99;
      expect(field.value).toBe(99.99);
    });

    it('should support format property', () => {
      const field = new FtDecimalMetaField();
      field.format = 'C2';
      expect(field.format).toBe('C2');
    });

    it('should copy value and format', () => {
      const field = new FtDecimalMetaField();
      field.value = 1234.56;
      field.format = 'N2';

      const copy = field.createCopy() as FtDecimalMetaField;
      expect(copy.value).toBe(1234.56);
      expect(copy.format).toBe('N2');
    });
  });

  describe('FtDateTimeMetaField', () => {
    it('should create with correct data type', () => {
      const field = new FtDateTimeMetaField();
      expect(field.dataType).toBe(FtDataType.DateTime);
    });

    it('should have default value of epoch', () => {
      const field = new FtDateTimeMetaField();
      const epochDateStamp = new Date().setUTCFullYear(1, 0, 1);
      const epochTimestamp = new Date(epochDateStamp).setUTCHours(0, 0, 0, 0);
      expect(field.value).toEqual(new Date(epochTimestamp));
    });

    it('should allow setting Date values', () => {
      const field = new FtDateTimeMetaField();
      const testDate = new Date(2024, 0, 15);
      field.value = testDate;
      expect(field.value).toEqual(testDate);
    });

    it('should have default format yyyyMMdd', () => {
      const field = new FtDateTimeMetaField();
      expect(field.format).toBe('yyyyMMdd');
    });

    it('should allow setting format', () => {
      const field = new FtDateTimeMetaField();
      field.format = 'yyyy-MM-dd';
      expect(field.format).toBe('yyyy-MM-dd');
    });

    it('should copy date and format', () => {
      const field = new FtDateTimeMetaField();
      const testDate = new Date(2024, 11, 25);
      field.value = testDate;
      field.format = 'd';

      const copy = field.createCopy() as FtDateTimeMetaField;
      expect(copy.value).toEqual(testDate);
      expect(copy.format).toBe('d');
    });
  });

  describe('Cross-field functionality', () => {
    it('should all support heading count', () => {
      const headings = 3;
      const fields: FtMetaField[] = [
        new FtStringMetaField(headings),
        new FtBooleanMetaField(headings),
        new FtIntegerMetaField(headings),
        new FtFloatMetaField(headings),
        new FtDecimalMetaField(headings),
        new FtDateTimeMetaField(headings),
      ];

      fields.forEach((field) => {
        expect(field.headingCount).toBe(headings);
        expect(field.headings.length).toBe(headings);
      });
    });

    it('should all support name property', () => {
      const name = 'TestField';
      const fields: FtMetaField[] = [
        new FtStringMetaField(),
        new FtBooleanMetaField(),
        new FtIntegerMetaField(),
        new FtFloatMetaField(),
        new FtDecimalMetaField(),
        new FtDateTimeMetaField(),
      ];

      fields.forEach((field) => {
        field.name = name;
        expect(field.name).toBe(name);
      });
    });

    it('should all support fixed width properties', () => {
      const fields: FtMetaField[] = [
        new FtStringMetaField(),
        new FtBooleanMetaField(),
        new FtIntegerMetaField(),
        new FtFloatMetaField(),
        new FtDecimalMetaField(),
        new FtDateTimeMetaField(),
      ];

      fields.forEach((field) => {
        field.fixedWidth = true;
        field.width = 10;
        expect(field.fixedWidth).toBe(true);
        expect(field.width).toBe(10);
      });
    });

    it('should all create independent copies', () => {
      const original = new FtStringMetaField();
      original.name = 'Original';
      original.value = 'test';

      const copy = original.createCopy();
      copy.name = 'Copy';
      (copy as FtStringMetaField).value = 'different';

      expect(original.name).toBe('Original');
      expect(original.value).toBe('test');
      expect(copy.name).toBe('Copy');
      expect((copy as FtStringMetaField).value).toBe('different');
    });
  });
});
