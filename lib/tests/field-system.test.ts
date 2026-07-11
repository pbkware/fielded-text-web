import { describe, expect, it } from 'vitest';
import {
  FtBooleanField,
  FtBooleanFieldDefinition,
  FtBooleanStyles,
  FtDataType,
  FtDateTimeField,
  FtDateTimeFieldDefinition,
  FtDecimalField,
  FtDecimalFieldDefinition,
  FtFieldDefinitionList,
  FtFloatField,
  FtFloatFieldDefinition,
  FtIntegerField,
  FtIntegerFieldDefinition,
  FtSequence,
  FtSequenceInvokation,
  FtStringField,
  FtStringFieldDefinition,
} from '../src/index.js';

describe('Field Definitions', () => {
  describe('FtStringFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtStringFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('string');
      expect(def.autoLeftPad).toBe(false);
      expect(def.dataType).toBe(FtDataType.String);
    });

    it('should format and parse string values', () => {
      const def = new FtStringFieldDefinition(0);
      const text = def['formatValue']('test');
      expect(text).toBe('test');
      const parsed = def['parseValueText']('hello');
      expect(parsed).toBe('hello');
    });
  });

  describe('FtBooleanFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtBooleanFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('boolean');
      expect(def.autoLeftPad).toBe(false);
      expect(def.dataType).toBe(FtDataType.Boolean);
    });

    it('should have default true/false text', () => {
      const def = new FtBooleanFieldDefinition(0);
      expect(def.falseText).toBe('False');
      expect(def.trueText).toBe('True');
      expect(def.styles).toBe(FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly);
    });

    it('should format and parse boolean values', () => {
      const def = new FtBooleanFieldDefinition(0);
      expect(def['formatValue'](true)).toBe('True');
      expect(def['formatValue'](false)).toBe('False');
      expect(def['parseValueText']('True')).toBe(true);
      expect(def['parseValueText']('False')).toBe(false);
    });
  });

  describe('FtIntegerFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtIntegerFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('bigint');
      expect(def.autoLeftPad).toBe(true);
      expect(def.dataType).toBe(FtDataType.Integer);
    });

    it('should format and parse integer values', () => {
      const def = new FtIntegerFieldDefinition(0);
      const value = BigInt(12345);
      const text = def['formatValue'](value);
      expect(text).toMatch(/12345/);
      const parsed = def['parseValueText']('67890');
      expect(parsed).toBe(BigInt(67890));
    });
  });

  describe('FtFloatFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtFloatFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('number');
      expect(def.autoLeftPad).toBe(true);
      expect(def.dataType).toBe(FtDataType.Float);
    });

    it('should format and parse float values', () => {
      const def = new FtFloatFieldDefinition(0);
      const value = 123.45;
      const text = def['formatValue'](value);
      expect(text).toMatch(/123\.45/);
      const parsed = def['parseValueText']('678.90');
      expect(parsed).toBeCloseTo(678.9);
    });
  });

  describe('FtDecimalFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtDecimalFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('number');
      expect(def.autoLeftPad).toBe(true);
      expect(def.dataType).toBe(FtDataType.Decimal);
    });

    it('should format and parse decimal values', () => {
      const def = new FtDecimalFieldDefinition(0);
      const value = 123.456;
      const text = def['formatValue'](value);
      expect(text).toMatch(/123\.456/);
      const parsed = def['parseValueText']('678.901');
      expect(parsed).toBeCloseTo(678.901);
    });
  });

  describe('FtDateTimeFieldDefinition', () => {
    it('should create with correct properties', () => {
      const def = new FtDateTimeFieldDefinition(0);
      expect(def.index).toBe(0);
      expect(def.valueType).toBe('Date');
      expect(def.autoLeftPad).toBe(true);
      expect(def.dataType).toBe(FtDataType.DateTime);
    });

    it('should format and parse datetime values', () => {
      const def = new FtDateTimeFieldDefinition(0);
      const value = new Date(2024, 0, 1, 12, 30, 45);
      const text = def['formatValue'](value);
      expect(text.length).toBeGreaterThan(0);
      // Parsing will depend on format - just check it doesn't throw
      const parsed = def['parseValueText'](text);
      expect(parsed).toBeInstanceOf(Date);
    });
  });
});

describe('Field Instances', () => {
  function createTestSequenceInvokation(definition: any): FtSequenceInvokation {
    const fieldDefs = new FtFieldDefinitionList();
    fieldDefs['add'](definition);
    const sequence = new FtSequence(0);
    sequence.loadRootFieldDefinitionList(fieldDefs);
    return new FtSequenceInvokation(0, sequence, 0);
  }

  describe('FtStringField', () => {
    it('should hold string values', () => {
      const def = new FtStringFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtStringField(invokation, item, def);

      expect(field.isNull()).toBe(true);
      field.value = 'test';
      expect(field.isNull()).toBe(false);
      expect(field.value).toBe('test');
      expect(field.nullableValue).toBe('test');
    });

    it('should handle null values', () => {
      const def = new FtStringFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtStringField(invokation, item, def);

      field.value = 'test';
      field.setNull();
      expect(field.isNull()).toBe(true);
      expect(field.nullableValue).toBeNull();
    });

    it('should support As* conversion properties', () => {
      const def = new FtStringFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtStringField(invokation, item, def);

      field.value = 'hello';
      expect(field.asString).toBe('hello');
      expect(field.asUnknown).toBe('hello');
    });
  });

  describe('FtBooleanField', () => {
    it('should hold boolean values', () => {
      const def = new FtBooleanFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtBooleanField(invokation, item, def);

      expect(field.isNull()).toBe(true);
      field.value = true;
      expect(field.isNull()).toBe(false);
      expect(field.value).toBe(true);
      expect(field.nullableValue).toBe(true);
    });

    it('should expose definition properties', () => {
      const def = new FtBooleanFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtBooleanField(invokation, item, def);

      expect(field.falseText).toBe('False');
      expect(field.trueText).toBe('True');
      expect(field.styles).toBe(FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly);
    });
  });

  describe('FtIntegerField', () => {
    it('should hold bigint values', () => {
      const def = new FtIntegerFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtIntegerField(invokation, item, def);

      expect(field.isNull()).toBe(true);
      field.value = BigInt(12345);
      expect(field.isNull()).toBe(false);
      expect(field.value).toBe(BigInt(12345));
      expect(field.nullableValue).toBe(BigInt(12345));
    });

    it('should expose formatter properties', () => {
      const def = new FtIntegerFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtIntegerField(invokation, item, def);

      expect(field.format).toBe('G');
      expect(typeof field.styles).toBe('number');
    });
  });

  describe('FtFloatField', () => {
    it('should hold number values', () => {
      const def = new FtFloatFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtFloatField(invokation, item, def);

      expect(field.isNull()).toBe(true);
      field.value = 123.45;
      expect(field.isNull()).toBe(false);
      expect(field.value).toBe(123.45);
      expect(field.nullableValue).toBe(123.45);
    });
  });

  describe('FtDecimalField', () => {
    it('should hold number values', () => {
      const def = new FtDecimalFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtDecimalField(invokation, item, def);

      expect(field.isNull()).toBe(true);
      field.value = 123.456;
      expect(field.isNull()).toBe(false);
      expect(field.value).toBe(123.456);
      expect(field.nullableValue).toBe(123.456);
    });
  });

  describe('FtDateTimeField', () => {
    it('should hold Date values', () => {
      const def = new FtDateTimeFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtDateTimeField(invokation, item, def);

      const testDate = new Date(2024, 0, 1, 12, 30, 45);
      expect(field.isNull()).toBe(true);
      field.value = testDate;
      expect(field.isNull()).toBe(false);
      expect(field.value.getTime()).toBe(testDate.getTime());
      expect(field.nullableValue).toEqual(testDate);
    });

    it('should compare dates by time value', () => {
      const def = new FtDateTimeFieldDefinition(0);
      const invokation = createTestSequenceInvokation(def);
      const item = invokation.sequence.itemList.get(0);
      const field = new FtDateTimeField(invokation, item, def);

      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 1);
      field.value = date1;
      // isValueEqual should return true for same timestamp
      expect(field['isValueEqual'](date1, date2)).toBe(true);
    });
  });
});

describe('Field System Integration', () => {
  function createTestSequenceInvokation(definition: any): FtSequenceInvokation {
    const fieldDefs = new FtFieldDefinitionList();
    fieldDefs['add'](definition);
    const sequence = new FtSequence(0);
    sequence.loadRootFieldDefinitionList(fieldDefs);
    return new FtSequenceInvokation(0, sequence, 0);
  }

  it('should handle constant fields', () => {
    const def = new FtStringFieldDefinition(0);
    const invokation = createTestSequenceInvokation(def);
    const item = invokation.sequence.itemList.get(0);
    const field = new FtStringField(invokation, item, def);

    // Non-constant field should allow value changes
    field.value = 'first';
    field.value = 'second';
    expect(field.value).toBe('second');
  });

  it('should track valueAssigned flag', () => {
    const def = new FtStringFieldDefinition(0);
    const invokation = createTestSequenceInvokation(def);
    const item = invokation.sequence.itemList.get(0);
    const field = new FtStringField(invokation, item, def);

    expect(field.valueAssigned).toBe(false);
    field.value = 'test';
    expect(field.valueAssigned).toBe(true);
  });

  it('should provide field definition properties', () => {
    const def = new FtStringFieldDefinition(0);
    const invokation = createTestSequenceInvokation(def);
    const item = invokation.sequence.itemList.get(0);
    const field = new FtStringField(invokation, item, def);

    expect(field.definition).toBe(def);
    expect(field.sequence).toBe(invokation.sequence);
    expect(field.sequenceItem).toBe(item);
    expect(field.index).toBe(0);
  });

  it('should handle type equality checks correctly', () => {
    const stringDef = new FtStringFieldDefinition(0);
    const stringInv = createTestSequenceInvokation(stringDef);
    const stringItem = stringInv.sequence.itemList.get(0);
    const stringField = new FtStringField(stringInv, stringItem, stringDef);

    expect(stringField['isValueEqual']('test', 'test')).toBe(true);
    expect(stringField['isValueEqual']('test', 'other')).toBe(false);

    const boolDef = new FtBooleanFieldDefinition(0);
    const boolInv = createTestSequenceInvokation(boolDef);
    const boolItem = boolInv.sequence.itemList.get(0);
    const boolField = new FtBooleanField(boolInv, boolItem, boolDef);

    expect(boolField['isValueEqual'](true, true)).toBe(true);
    expect(boolField['isValueEqual'](true, false)).toBe(false);

    const intDef = new FtIntegerFieldDefinition(0);
    const intInv = createTestSequenceInvokation(intDef);
    const intItem = intInv.sequence.itemList.get(0);
    const intField = new FtIntegerField(intInv, intItem, intDef);

    expect(intField['isValueEqual'](BigInt(100), BigInt(100))).toBe(true);
    expect(intField['isValueEqual'](BigInt(100), BigInt(200))).toBe(false);
  });
});
