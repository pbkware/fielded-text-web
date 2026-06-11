// Comprehensive tests for FtXmlMetaSerialization

import { describe, expect, it } from 'vitest';
import { FtMetaSerialization, FtMetaSerializationFormat, FtSubstitutionType, FtXmlMetaSerialization } from '../src/index.js';
import { FtBooleanMetaField } from '../src/meta/fields/ft-boolean-meta-field.js';
import { FtDateTimeMetaField } from '../src/meta/fields/ft-date-time-meta-field.js';
import { FtDecimalMetaField } from '../src/meta/fields/ft-decimal-meta-field.js';
import { FtFloatMetaField } from '../src/meta/fields/ft-float-meta-field.js';
import { FtIntegerMetaField } from '../src/meta/fields/ft-integer-meta-field.js';
import { FtMeta } from '../src/meta/ft-meta.js';
import { FtBooleanStyles } from '../src/types/enums/ft-boolean-styles.js';
import { FtDataType } from '../src/types/enums/ft-data-type.js';
import { FtEndOfLineType } from '../src/types/enums/ft-end-of-line-type.js';
import { FtQuotedType } from '../src/types/enums/ft-quoted-type.js';

describe('FtXmlMetaSerialization', () => {
  describe('Basic serialization', () => {
    it('should serialize empty meta to valid XML', () => {
      const meta = new FtMeta();
      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<FieldedText');
      expect(xml).toContain('</FieldedText>');
    });

    it('should serialize meta with basic properties', () => {
      const meta = new FtMeta();
      meta.delimiterChar = '|';
      meta.quoteChar = "'";
      meta.lineCommentChar = '#';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('DelimiterChar="|"');
      expect(xml).toContain('QuoteChar="&apos;"');
      expect(xml).toContain('LineCommentChar="#"');
    });

    it('should serialize meta with numeric configuration', () => {
      const meta = new FtMeta();
      meta.endOfLineType = FtEndOfLineType.CrLf;
      meta.headingLineCount = 2;
      meta.mainHeadingLineIndex = 1;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('EndOfLineType="CrLf"');
      expect(xml).toContain('HeadingLineCount="2"');
      expect(xml).toContain('MainHeadingLineIndex="1"');
    });

    it('should serialize meta with boolean flags', () => {
      const meta = new FtMeta();
      meta.ignoreBlankLines = false;
      meta.allowIncompleteRecords = true;
      meta.stuffedEmbeddedQuotes = false;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('IgnoreBlankLines="False"');
      expect(xml).toContain('AllowIncompleteRecords="True"');
      expect(xml).toContain('StuffedEmbeddedQuotes="False"');
    });
  });

  describe('Field serialization', () => {
    it('should serialize string field', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      field.name = 'TestField';
      field.fixedWidth = false;
      field.width = 20;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('<Field');
      expect(xml).toContain('Name="TestField"');
      expect(xml).toContain('Width="20"');
    });

    it('should serialize boolean field with format', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
      field.name = 'IsActive';
      field.trueText = 'Yes';
      field.falseText = 'No';
      field.styles = 1;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="IsActive"');
      expect(xml).toContain('DataType="Boolean"');
      expect(xml).toContain('TrueText="Yes"');
      expect(xml).toContain('FalseText="No"');
      expect(xml).toContain('Styles="IgnoreCase"');
    });

    it('should serialize integer field with format', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      field.name = 'Age';
      field.format = 'D3';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Age"');
      expect(xml).toContain('DataType="Integer"');
      expect(xml).toContain('Format="D3"');
    });

    it('should serialize float field with format', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.Float) as FtFloatMetaField;
      field.name = 'Price';
      field.format = 'F2';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Price"');
      expect(xml).toContain('DataType="Float"');
      expect(xml).toContain('Format="F2"');
    });

    it('should serialize decimal field with format', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.Decimal) as FtDecimalMetaField;
      field.name = 'Amount';
      field.format = 'C';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Amount"');
      expect(xml).toContain('DataType="Decimal"');
      expect(xml).toContain('Format="C"');
    });

    it('should serialize datetime field with format', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.DateTime) as FtDateTimeMetaField;
      field.name = 'Created';
      field.format = 'yyyy-MM-dd';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Created"');
      expect(xml).toContain('DataType="DateTime"');
      expect(xml).toContain('Format="yyyy-MM-dd"');
    });

    it('should serialize field with headings', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      field.name = 'MultiHeading';
      field.headings = ['Heading1', 'Heading2', 'Heading3'];

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Headings="Heading1,Heading2,Heading3"');
    });

    it('should serialize field with value formatting options', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      field.name = 'Formatted';
      field.valueQuotedType = FtQuotedType.Always;
      field.valueAlwaysWriteOptionalQuote = true;
      field.valueWritePrefixSpace = true;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('ValueQuotedType="');
      expect(xml).toContain('ValueAlwaysWriteOptionalQuote="True"');
      expect(xml).toContain('ValueWritePrefixSpace="True"');
    });

    it('should serialize multiple fields', () => {
      const meta = new FtMeta();

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';

      const field2 = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      field2.name = 'Age';
      field2.format = 'G';

      const field3 = meta.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
      field3.name = 'IsActive';

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Name"');
      expect(xml).toContain('Name="Age"');
      expect(xml).toContain('Name="IsActive"');
      expect(xml).toMatch(/<Field[\s\S]*<Field[\s\S]*<Field/); // Three Field elements
    });
  });

  describe('Substitution serialization', () => {
    it('should serialize substitutions', () => {
      const meta = new FtMeta();

      const sub1 = meta.substitutionList.new();
      sub1.token = 'TODAY';
      sub1.value = '2024-01-01';
      sub1.type = FtSubstitutionType.String;

      const sub2 = meta.substitutionList.new();
      sub2.token = 'USER';
      sub2.value = 'admin';
      sub2.type = FtSubstitutionType.AutoEndOfLine;

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('<Substitution');
      expect(xml).toContain('Token="TODAY"');
      expect(xml).toContain('Value="2024-01-01"');
      expect(xml).toContain('Token="USER"');
      expect(xml).toContain('Value="admin"');
    });
  });

  describe('Sequence serialization', () => {
    it('should serialize simple sequence', () => {
      const meta = new FtMeta();

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';

      const field2 = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      field2.name = 'Age';
      field2.format = 'G';

      const sequence = meta.sequenceList.new();
      sequence.name = 'PersonSeq';
      sequence.root = true;

      sequence.itemList.new(field1);
      sequence.itemList.new(field2);

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('<Sequence');
      expect(xml).toContain('Name="PersonSeq"');
      expect(xml).toContain('Root="True"');
      expect(xml).toContain('FieldIndex="0"');
      expect(xml).toContain('FieldIndex="1"');
    });

    it('should serialize multiple sequences', () => {
      const meta = new FtMeta();

      const field = meta.fieldList.new(FtDataType.String);
      field.name = 'Data';

      const seq1 = meta.sequenceList.new();
      seq1.name = 'Sequence1';
      seq1.root = true;
      const item1 = seq1.itemList.new(field);

      const seq2 = meta.sequenceList.new();
      seq2.name = 'Sequence2';
      seq2.root = false;
      const item2 = seq2.itemList.new(field);

      const xml = FtXmlMetaSerialization.serialize(meta);

      expect(xml).toContain('Name="Sequence1"');
      expect(xml).toContain('Root="True"');
      expect(xml).toContain('Name="Sequence2"');
      expect(xml).not.toContain('Name="Sequence2" Root="True"');
    });
  });

  describe('Deserialization', () => {
    it('should deserialize basic XML', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText DelimiterChar="," QuoteChar="&quot;" LineCommentChar="#">
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.delimiterChar).toBe(',');
      expect(meta.quoteChar).toBe('"');
      expect(meta.lineCommentChar).toBe('#');
    });

    it('should deserialize fields', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText DelimiterChar=",">
  <Field Id="1" Name="TestField" DataType="String" FixedWidth="false" Width="20" />
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.fieldList.count).toBe(1);
      const field = meta.fieldList.get(0);
      expect(field.name).toBe('TestField');
      expect(field.dataType).toBe(FtDataType.String);
      expect(field.fixedWidth).toBe(false);
      expect(field.width).toBe(20);
    });

    it('should deserialize boolean field with format', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field Name="IsActive" DataType="Boolean" TrueText="Yes" FalseText="No" Styles="IgnoreCase" />
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.fieldList.count).toBe(1);
      const field = meta.fieldList.get(0) as FtBooleanMetaField;
      expect(field.name).toBe('IsActive');
      expect(field.trueText).toBe('Yes');
      expect(field.falseText).toBe('No');
      expect(field.styles).toBe(FtBooleanStyles.IgnoreCase);
    });

    it('should deserialize integer field with format', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field Name="Age" DataType="Integer" Format="D3" />
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      const field = meta.fieldList.get(0) as FtIntegerMetaField;
      expect(field.name).toBe('Age');
      expect(field.format).toBe('D3');
    });

    it('should deserialize field with headings', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="2">
  <Field Name="MultiHeading" DataType="String">
    <Heading>Heading1</Heading>
    <Heading>Heading2</Heading>
  </Field>
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      const field = meta.fieldList.get(0);
      expect(field.headings.length).toBe(2);
    });

    it('should deserialize substitutions', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Substitution Token="TODAY" Type="0" Value="2024-01-01" />
  <Substitution Token="USER" Type="1" Value="admin" />
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.substitutionList.count).toBe(2);

      const sub1 = meta.substitutionList.get(0);
      expect(sub1.token).toBe('TODAY');
      expect(sub1.value).toBe('2024-01-01');

      const sub2 = meta.substitutionList.get(1);
      expect(sub2.token).toBe('USER');
      expect(sub2.value).toBe('admin');
    });

    it('should deserialize sequences', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field Name="Name" DataType="String" />
  <Field Name="Age" DataType="Integer" Format="G" />
  <Sequence Name="PersonSeq" Root="true">
    <Item FieldIndex="0" />
    <Item FieldIndex="1" />
  </Sequence>
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.fieldList.count).toBe(2);
      expect(meta.sequenceList.count).toBe(1);

      const sequence = meta.sequenceList.get(0);
      expect(sequence.name).toBe('PersonSeq');
      expect(sequence.root).toBe(true);
      expect(sequence.itemList.count).toBe(2);

      expect(sequence.itemList.get(0).field?.name).toBe('Name');
      expect(sequence.itemList.get(1).field?.name).toBe('Age');
    });

    it('should handle boolean attributes correctly', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText IgnoreBlankLines="true" StuffedEmbeddedQuotes="false">
  <Field Name="Test" DataType="String" FixedWidth="true" Constant="false" />
</FieldedText>`;

      const meta = FtXmlMetaSerialization.deserialize(xml);

      expect(meta.ignoreBlankLines).toBe(true);
      expect(meta.stuffedEmbeddedQuotes).toBe(false);

      const field = meta.fieldList.get(0);
      expect(field.fixedWidth).toBe(true);
      expect(field.constant).toBe(false);
    });
  });

  describe('Round-trip serialization', () => {
    it('should round-trip empty meta', () => {
      const original = new FtMeta();
      const xml = FtXmlMetaSerialization.serialize(original);
      const restored = FtXmlMetaSerialization.deserialize(xml);

      expect(restored.delimiterChar).toBe(original.delimiterChar);
      expect(restored.quoteChar).toBe(original.quoteChar);
      expect(restored.fieldList.count).toBe(0);
    });

    it('should round-trip meta with fields', () => {
      const original = new FtMeta();
      original.delimiterChar = ';';
      original.headingLineCount = 1;

      const field1 = original.fieldList.new(FtDataType.String);
      field1.name = 'Name';
      field1.headings = ['Full Name'];

      const field2 = original.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      field2.name = 'Age';
      field2.format = 'G';

      const xml = FtXmlMetaSerialization.serialize(original);
      const restored = FtXmlMetaSerialization.deserialize(xml);

      expect(restored.delimiterChar).toBe(';');
      expect(restored.fieldList.count).toBe(2);

      const restoredField1 = restored.fieldList.get(0);
      expect(restoredField1.name).toBe('Name');
      expect(restoredField1.headings.length).toBe(1);

      const restoredField2 = restored.fieldList.get(1) as FtIntegerMetaField;
      expect(restoredField2.name).toBe('Age');
      expect(restoredField2.format).toBe('G');
    });

    it('should round-trip meta with sequences', () => {
      const original = new FtMeta();

      const field = original.fieldList.new(FtDataType.String);
      field.name = 'Data';

      const sequence = original.sequenceList.new();
      sequence.name = 'TestSeq';
      sequence.root = true;

      const item = sequence.itemList.new(field);

      const xml = FtXmlMetaSerialization.serialize(original);
      const restored = FtXmlMetaSerialization.deserialize(xml);

      expect(restored.sequenceList.count).toBe(1);
      const restoredSeq = restored.sequenceList.get(0);
      expect(restoredSeq.name).toBe('TestSeq');
      expect(restoredSeq.root).toBe(true);
      expect(restoredSeq.itemList.count).toBe(1);
      expect(restoredSeq.itemList.get(0).field?.name).toBe('Data');
    });

    it('should round-trip complex meta', () => {
      const original = new FtMeta();
      original.delimiterChar = ',';
      original.quoteChar = '"';
      original.ignoreBlankLines = true;
      original.headingLineCount = 1;

      // Add substitution
      const sub = original.substitutionList.new();
      sub.token = 'TEST';
      sub.value = 'value';

      // Add multiple fields of different types
      const stringField = original.fieldList.new(FtDataType.String);
      stringField.name = 'Name';
      stringField.headings = ['Person Name'];

      const intField = original.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      intField.name = 'Age';
      intField.format = 'G';

      const boolField = original.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
      boolField.name = 'Active';
      boolField.trueText = 'Y';
      boolField.falseText = 'N';

      // Add sequence
      const sequence = original.sequenceList.new();
      sequence.name = 'MainSeq';
      sequence.root = true;

      sequence.itemList.new(stringField);
      sequence.itemList.new(intField);
      sequence.itemList.new(boolField);

      const xml = FtXmlMetaSerialization.serialize(original);
      const restored = FtXmlMetaSerialization.deserialize(xml);

      // Verify all properties
      expect(restored.delimiterChar).toBe(',');
      expect(restored.quoteChar).toBe('"');
      expect(restored.ignoreBlankLines).toBe(true);
      expect(restored.headingLineCount).toBe(1);

      // Verify substitution
      expect(restored.substitutionList.count).toBe(1);
      expect(restored.substitutionList.get(0).token).toBe('TEST');

      // Verify fields
      expect(restored.fieldList.count).toBe(3);
      expect(restored.fieldList.get(0).name).toBe('Name');
      expect(restored.fieldList.get(1).name).toBe('Age');
      expect(restored.fieldList.get(2).name).toBe('Active');

      // Verify sequence
      expect(restored.sequenceList.count).toBe(1);
      const restoredSeq = restored.sequenceList.get(0);
      expect(restoredSeq.name).toBe('MainSeq');
      expect(restoredSeq.root).toBe(true);
      expect(restoredSeq.itemList.count).toBe(3);
    });
  });

  describe('FtMetaSerialization unified API with XML', () => {
    it('should serialize using XML format through unified API', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      field.name = 'Test';

      const xml = FtMetaSerialization.serialize(meta, undefined, FtMetaSerializationFormat.XML);

      expect(xml).toContain('<?xml version');
      expect(xml).toContain('<FieldedText');
      expect(xml).toContain('Name="Test"');
    });

    it('should deserialize using XML format through unified API', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText DelimiterChar=",">
  <Field Name="TestField" DataType="String" />
</FieldedText>`;

      const meta = FtMetaSerialization.deserialize(xml, undefined, FtMetaSerializationFormat.XML);

      expect(meta.fieldList.count).toBe(1);
      expect(meta.fieldList.get(0).name).toBe('TestField');
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid XML', () => {
      const invalidXml = 'not xml at all';

      expect(() => FtXmlMetaSerialization.deserialize(invalidXml)).toThrow();
    });

    it('should throw error for XML missing FieldedText root', () => {
      const xml = '<?xml version="1.0"?><SomeOtherRoot />';

      expect(() => FtXmlMetaSerialization.deserialize(xml)).toThrow('Invalid XML: Missing FieldedText root element');
    });

    it('should serialize meta even without validation', () => {
      // Serializers don't validate - they serialize whatever meta they're given
      // Validation should be done by the caller before serializing
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.Boolean) as FtBooleanMetaField;
      field.name = ''; // Empty name - invalid but serializer doesn't care

      // Should not throw - serializer will serialize the invalid meta
      expect(() => FtXmlMetaSerialization.serialize(meta)).not.toThrow();
    });
  });
});
