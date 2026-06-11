import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtBooleanStyles,
  FtDataType,
  FtDateTimeMetaField,
  FtDecimalMetaField,
  FtEndOfLineType,
  FtFloatMetaField,
  FtHeadingConstraint,
  FtIntegerMetaField,
  FtJsonMetaSerialization,
  FtMeta,
  FtPadAlignment,
  FtQuotedType,
  FtStringMetaField,
  FtTruncateType,
} from '../src/index.js';

describe('FtJsonMetaSerialization', () => {
  it('should serialize and deserialize basic meta', () => {
    const meta = new FtMeta();
    meta.culture = meta.culture; // Use default
    meta.delimiterChar = ',';
    meta.headingLineCount = 1;

    const json = FtJsonMetaSerialization.serialize(meta);
    expect(json).toContain('"delimiterChar"');
    expect(json).toContain('","');

    const deserialized = FtJsonMetaSerialization.deserialize(json);
    expect(deserialized.delimiterChar).toBe(',');
    expect(deserialized.headingLineCount).toBe(1);
  });

  it('should round-trip string field', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.String) as FtStringMetaField;
    field.name = 'TestString';
    field.headings = ['Test', 'String'];
    field.fixedWidth = false;
    field.valueQuotedType = FtQuotedType.Optional;

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    expect(deserialized.fieldList.count).toBe(1);
    const deserializedField = deserialized.fieldList.get(0) as FtStringMetaField;
    expect(deserializedField.name).toBe('TestString');
    expect(deserializedField.headings).toEqual(['Test', 'String']);
    expect(deserializedField.fixedWidth).toBe(false);
    expect(deserializedField.valueQuotedType).toBe(FtQuotedType.Optional);
  });

  it('should round-trip boolean field with styles', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
    field.name = 'Active';
    field.styles = FtBooleanStyles.IgnoreCase;
    field.trueText = 'Yes';
    field.falseText = 'No';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    const deserializedField = deserialized.fieldList.get(0) as FtBooleanMetaField;
    expect(deserializedField.name).toBe('Active');
    expect(deserializedField.styles).toBe(FtBooleanStyles.IgnoreCase);
    expect(deserializedField.trueText).toBe('Yes');
    expect(deserializedField.falseText).toBe('No');
  });

  it('should round-trip integer field with format', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
    field.name = 'Count';
    field.format = 'D5';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    const deserializedField = deserialized.fieldList.get(0) as FtIntegerMetaField;
    expect(deserializedField.name).toBe('Count');
    expect(deserializedField.format).toBe('D5');
  });

  it('should round-trip float field with format', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.Float) as FtFloatMetaField;
    field.name = 'Price';
    field.format = 'F2';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    const deserializedField = deserialized.fieldList.get(0) as FtFloatMetaField;
    expect(deserializedField.name).toBe('Price');
    expect(deserializedField.format).toBe('F2');
  });

  it('should round-trip decimal field with format', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.Decimal) as FtDecimalMetaField;
    field.name = 'Amount';
    field.format = 'C';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    const deserializedField = deserialized.fieldList.get(0) as FtDecimalMetaField;
    expect(deserializedField.name).toBe('Amount');
    expect(deserializedField.format).toBe('C');
  });

  it('should round-trip datetime field with format', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.DateTime) as FtDateTimeMetaField;
    field.name = 'CreatedDate';
    field.format = 'yyyy-MM-dd';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    const deserializedField = deserialized.fieldList.get(0) as FtDateTimeMetaField;
    expect(deserializedField.name).toBe('CreatedDate');
    expect(deserializedField.format).toBe('yyyy-MM-dd');
  });

  it('should round-trip multiple fields', () => {
    const meta = new FtMeta();

    const nameField = meta.fieldList.new(FtDataType.String) as FtStringMetaField;
    nameField.name = 'Name';
    nameField.headings = ['Name'];

    const ageField = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
    ageField.name = 'Age';
    ageField.headings = ['Age'];
    ageField.format = 'G';

    const activeField = meta.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
    activeField.name = 'Active';
    activeField.headings = ['Active'];
    activeField.styles = FtBooleanStyles.IgnoreCase;

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    expect(deserialized.fieldList.count).toBe(3);
    expect(deserialized.fieldList.get(0).name).toBe('Name');
    expect(deserialized.fieldList.get(1).name).toBe('Age');
    expect(deserialized.fieldList.get(2).name).toBe('Active');
  });

  it('should round-trip substitutions', () => {
    const meta = new FtMeta();
    meta.substitutionsEnabled = true;
    meta.substitutionChar = '\\';

    const sub1 = meta.substitutionList.new();
    sub1.token = 'n';
    sub1.value = '\n';

    const sub2 = meta.substitutionList.new();
    sub2.token = 't';
    sub2.value = '\t';

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    expect(deserialized.substitutionsEnabled).toBe(true);
    expect(deserialized.substitutionList.count).toBe(2);
    expect(deserialized.substitutionList.get(0).token).toBe('n');
    expect(deserialized.substitutionList.get(0).value).toBe('\n');
    expect(deserialized.substitutionList.get(1).token).toBe('t');
    expect(deserialized.substitutionList.get(1).value).toBe('\t');
  });

  it('should round-trip sequences', () => {
    const meta = new FtMeta();

    const field1 = meta.fieldList.new(FtDataType.String);
    field1.name = 'Field1';

    const field2 = meta.fieldList.new(FtDataType.Integer);
    field2.name = 'Field2';

    const sequence = meta.sequenceList.new();
    sequence.name = 'MainSequence';
    sequence.root = true;

    sequence.itemList.new(field1);
    sequence.itemList.new(field2);

    const json = FtJsonMetaSerialization.serialize(meta);

    const deserialized = FtJsonMetaSerialization.deserialize(json);

    expect(deserialized.sequenceList.count).toBe(1);
    const seq = deserialized.sequenceList.get(0);
    expect(seq.name).toBe('MainSequence');
    expect(seq.root).toBe(true);
    expect(seq.itemList.count).toBe(2);
    expect(seq.itemList.get(0).field?.name).toBe('Field1');
    expect(seq.itemList.get(1).field?.name).toBe('Field2');
  });

  it('should round-trip complex meta with all features', () => {
    const meta = new FtMeta();
    meta.delimiterChar = '|';
    meta.quoteChar = '"';
    meta.lineCommentChar = '#';
    meta.endOfLineType = FtEndOfLineType.CrLf;
    meta.headingLineCount = 2;
    meta.mainHeadingLineIndex = 1;
    meta.headingConstraint = FtHeadingConstraint.NameIsMain;
    meta.headingQuotedType = FtQuotedType.Optional;
    meta.ignoreBlankLines = true;
    meta.allowIncompleteRecords = false;
    meta.stuffedEmbeddedQuotes = true;

    // Add fields with various properties
    const stringField = meta.fieldList.new(FtDataType.String) as FtStringMetaField;
    stringField.name = 'Description';
    stringField.headings = ['Desc', 'Description'];
    stringField.fixedWidth = false;
    stringField.valueQuotedType = FtQuotedType.Always;
    stringField.valuePadAlignment = FtPadAlignment.Left;
    stringField.valueTruncateType = FtTruncateType.Right;

    const intField = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
    intField.name = 'Quantity';
    intField.headings = ['Qty'];
    intField.format = 'D5';
    intField.fixedWidth = true;
    intField.width = 5;
    intField.valuePadAlignment = FtPadAlignment.Right;

    // Add sequence
    const rootSeq = meta.sequenceList.new();
    rootSeq.name = 'Root';
    rootSeq.root = true;
    rootSeq.itemList.new(stringField);
    rootSeq.itemList.new(intField);

    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    // Verify core properties
    expect(deserialized.delimiterChar).toBe('|');
    expect(deserialized.quoteChar).toBe('"');
    expect(deserialized.lineCommentChar).toBe('#');
    expect(deserialized.endOfLineType).toBe(FtEndOfLineType.CrLf);
    expect(deserialized.headingLineCount).toBe(2);
    expect(deserialized.mainHeadingLineIndex).toBe(1);
    expect(deserialized.headingConstraint).toBe(FtHeadingConstraint.NameIsMain);

    // Verify fields
    expect(deserialized.fieldList.count).toBe(2);

    const deserializedString = deserialized.fieldList.get(0) as FtStringMetaField;
    expect(deserializedString.name).toBe('Description');
    expect(deserializedString.headings).toEqual(['Desc', 'Description']);
    expect(deserializedString.valueQuotedType).toBe(FtQuotedType.Always);
    expect(deserializedString.valuePadAlignment).toBe(FtPadAlignment.Left);
    expect(deserializedString.valueTruncateType).toBe(FtTruncateType.Right);

    const deserializedInt = deserialized.fieldList.get(1) as FtIntegerMetaField;
    expect(deserializedInt.name).toBe('Quantity');
    expect(deserializedInt.format).toBe('D5');
    expect(deserializedInt.fixedWidth).toBe(true);
    expect(deserializedInt.width).toBe(5);

    // Verify sequence
    expect(deserialized.sequenceList.count).toBe(1);
    expect(deserialized.sequenceList.get(0).root).toBe(true);
    expect(deserialized.sequenceList.get(0).itemList.count).toBe(2);
  });

  it('should handle empty meta', () => {
    const meta = new FtMeta();
    const json = FtJsonMetaSerialization.serialize(meta);
    const deserialized = FtJsonMetaSerialization.deserialize(json);

    expect(deserialized.fieldList.count).toBe(0);
    expect(deserialized.substitutionList.count).toBe(0);
    expect(deserialized.sequenceList.count).toBe(0);
  });

  it('should produce valid JSON', () => {
    const meta = new FtMeta();
    const field = meta.fieldList.new(FtDataType.String);
    field.name = 'Test';

    const json = FtJsonMetaSerialization.serialize(meta);

    // Should not throw
    expect(() => JSON.parse(json)).not.toThrow();

    // Should be prettified (contain newlines)
    expect(json).toContain('\n');
  });
});
