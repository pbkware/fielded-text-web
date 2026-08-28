import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtDataType,
  FtDateTimeMetaField,
  FtDecimalMetaField,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtMeta,
  FtReader,
} from '../../src/index.js';

function createScalarTypesMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;

  const boolField = meta.fieldList.new(FtDataType.Boolean);
  (boolField as FtBooleanMetaField).name = 'Bool';
  boolField.headings = ['Bool'];

  const intField = meta.fieldList.new(FtDataType.Integer);
  (intField as FtIntegerMetaField).name = 'Int';
  intField.headings = ['Int'];
  (intField as FtIntegerMetaField).format = 'G';

  const floatField = meta.fieldList.new(FtDataType.Float);
  (floatField as FtFloatMetaField).name = 'Float';
  floatField.headings = ['Float'];
  (floatField as FtFloatMetaField).format = 'G';

  const decimalField = meta.fieldList.new(FtDataType.Decimal);
  (decimalField as FtDecimalMetaField).name = 'Decimal';
  decimalField.headings = ['Decimal'];
  (decimalField as FtDecimalMetaField).format = 'G';

  const rootSequence = meta.sequenceList.new();
  rootSequence.name = 'Root';
  rootSequence.root = true;
  rootSequence.itemList.new(boolField);
  rootSequence.itemList.new(intField);
  rootSequence.itemList.new(floatField);
  rootSequence.itemList.new(decimalField);

  return meta;
}

function createDateTimeMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;

  const dateField = meta.fieldList.new(FtDataType.DateTime);
  (dateField as FtDateTimeMetaField).name = 'Date';
  dateField.headings = ['Date'];
  (dateField as FtDateTimeMetaField).format = 'yyyy-MM-dd';

  const rootSequence = meta.sequenceList.new();
  rootSequence.name = 'Root';
  rootSequence.root = true;
  rootSequence.itemList.new(dateField);

  return meta;
}

describe('FTStd0.9 data type compliance', () => {
  it('[FT0.9-TYPES-001] parses Boolean Integer Float Decimal values', () => {
    const meta = createScalarTypesMeta();
    const reader = new FtReader(meta, 'Bool,Int,Float,Decimal\nTrue,42,3.5,9.25');

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asBoolean).toBe(true);
    expect(Number(reader.fieldList.get(1).asBigInt)).toBe(42);
    expect(reader.fieldList.get(2).asFloat).toBeCloseTo(3.5, 7);
    expect(reader.fieldList.get(3).asDecimal).toBeCloseTo(9.25, 7);

    expect(reader.read()).toBe(false);
    reader.close();
  });

  it('[FT0.9-TYPES-002] parses DateTime values with configured format and culture', () => {
    const meta = createDateTimeMeta();
    const reader = new FtReader(meta, 'Date\n2024-01-15');

    expect(reader.read()).toBe(true);
    const value = reader.fieldList.get(0).asDateTime;
    expect(value.getFullYear()).toBe(2024);
    expect(value.getMonth()).toBe(0);
    expect(value.getDate()).toBe(15);

    expect(reader.read()).toBe(false);
    reader.close();
  });
});
