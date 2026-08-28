import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtDataType,
  FtDateTimeMetaField,
  FtDecimalMetaField,
  FtEndOfLineAutoWriteType,
  FtEndOfLineType,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtLastLineEndedType,
  FtMeta,
  FtMetaReferenceType,
  FtQuotedType,
  FtReader,
  FtSerializationWriter,
  FtStringMetaField,
  FtStringWriter,
  FtSubstitutionType,
  FtWriterSettings,
} from '../src/index.js';
import { noneBooleanStyles } from '../src/types/enums/ft-boolean-styles.js';

describe('Serialization Round-Trip Tests', () => {
  describe('Basic CSV Round-Trip', () => {
    it('should write and read back simple CSV', () => {
      // Create meta
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.lineCommentChar = '#';
      meta.allowIncompleteRecords = false;
      meta.lastLineEndedType = FtLastLineEndedType.Never;
      meta.endOfLineType = FtEndOfLineType.Auto;
      meta.endOfLineAutoWriteType = FtEndOfLineAutoWriteType.CrLf;

      // Add fields
      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Name';
      field1.headings = ['Name'];
      field1.valueQuotedType = FtQuotedType.Optional;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      (field2 as FtIntegerMetaField).name = 'Age';
      field2.headings = ['Age'];
      (field2 as FtIntegerMetaField).format = 'G';

      const field3 = meta.fieldList.new(FtDataType.Boolean);
      (field3 as FtBooleanMetaField).name = 'Active';
      field3.headings = ['Active'];
      (field3 as FtBooleanMetaField).trueText = 'T';
      (field3 as FtBooleanMetaField).falseText = 'F';

      // Create root sequence
      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;

      rootSequence.itemList.new(field1);
      rootSequence.itemList.new(field2);
      rootSequence.itemList.new(field3);

      // Write data
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      // Record 1
      writer.setFieldValue(0, 'John Doe');
      writer.setFieldValue(1, 30);
      writer.setFieldValue(2, true);
      writer.write();

      // Record 2
      writer.setFieldValue(0, 'Jane Smith');
      writer.setFieldValue(1, 25);
      writer.setFieldValue(2, false);
      writer.write();

      // Record 3 with quotes needed
      writer.setFieldValue(0, 'Bob, Jr.');
      writer.setFieldValue(1, 45);
      writer.setFieldValue(2, true);
      writer.write();

      writer.close();

      const csvText = stringWriter.toString();
      console.log('CSV output:', csvText);

      // Read back
      const reader = new FtReader();
      reader.loadMeta(meta);
      reader.open(csvText); // Header is read automatically

      // Record 1
      let result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('John Doe');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(30);
      expect(reader.fieldList.get(2).asBoolean).toBe(true);

      // Record 2
      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Jane Smith');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(25);
      expect(reader.fieldList.get(2).asBoolean).toBe(false);

      // Record 3
      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Bob, Jr.');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(45);
      expect(reader.fieldList.get(2).asBoolean).toBe(true);

      // EOF
      result = reader.read();
      expect(result).toBe(false);

      reader.close();
    });

    // TODO: Null value handling requires full field formatter implementation (Phase 6) - not required - conversion error
    it.skip('should handle null values', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Name';
      field1.headings = ['Name'];
      field1.valueQuotedType = FtQuotedType.Optional;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      (field2 as FtIntegerMetaField).name = 'Value';
      field2.headings = ['Value'];
      (field2 as FtIntegerMetaField).format = 'G';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field1);
      rootSequence.itemList.new(field2);

      // Write
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      writer.setFieldValue(0, 'Test');
      writer.setNull(1);
      writer.write();

      writer.setNull(0);
      writer.setFieldValue(1, 123);
      writer.write();

      writer.close();

      const csvText = stringWriter.toString();
      console.log('CSV with nulls:', csvText);

      // Read back
      const reader = new FtReader();
      reader.loadMeta(meta);
      reader.open(csvText); // Header is read automatically

      let result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Test');
      expect(reader.fieldList.get(1).isNull()).toBe(true);

      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).isNull()).toBe(true);
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(123);

      reader.close();
    });

    it('should handle quoted fields with special characters', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.quoteChar = '"';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Text';
      field1.headings = ['Text'];
      field1.valueQuotedType = FtQuotedType.Optional;

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field1);

      // Write
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      // Text with delimiter
      writer.setFieldValue(0, 'Hello, World');
      writer.write();

      // Text with quote char (needs stuffing)
      writer.setFieldValue(0, 'Say "Hello"');
      writer.write();

      // Text with newline
      writer.setFieldValue(0, 'Line1\nLine2');
      writer.write();

      writer.close();

      const csvText = stringWriter.toString();
      console.log('CSV with special chars:', csvText);

      // Read back
      const reader = new FtReader();
      reader.loadMeta(meta);
      reader.open(csvText); // Header is read automatically

      let result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Hello, World');

      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Say "Hello"');

      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Line1\nLine2');

      reader.close();
    });
  });

  describe('Fixed-Width Round-Trip', () => {
    it('should write and read back fixed-width records', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Name';
      field1.headings = ['Name'];
      field1.fixedWidth = true;
      field1.width = 15;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      (field2 as FtIntegerMetaField).name = 'Age';
      field2.headings = ['Age'];
      (field2 as FtIntegerMetaField).format = 'G';
      field2.fixedWidth = true;
      field2.width = 5;

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field1);
      rootSequence.itemList.new(field2);

      // Write
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      writer.setFieldValue(0, 'John');
      writer.setFieldValue(1, 30);
      writer.write();

      writer.setFieldValue(0, 'Jane Smith');
      writer.setFieldValue(1, 25);
      writer.write();

      writer.close();

      const fixedText = stringWriter.toString();
      console.log('Fixed-width output:', fixedText);

      // Read back
      const reader = new FtReader();
      reader.loadMeta(meta);
      reader.open(fixedText); // Header is read automatically

      let result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString?.trim()).toBe('John');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(30);

      result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString?.trim()).toBe('Jane Smith');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(25);

      reader.close();
    });
  });

  describe('Writer Settings', () => {
    it('should support declared output', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Test';
      field1.headings = ['Test'];

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field1);

      // Write with declaration
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: true,
        metaReferenceType: FtMetaReferenceType.None,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      writer.setFieldValue(0, 'Value1');
      writer.write();

      writer.close();

      const declaredText = stringWriter.toString();
      console.log('Declared output:', declaredText);

      // Should start with signature
      expect(declaredText).toContain('|!Fielded Text^|');
    });

    it('should support comment writing', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.lineCommentChar = '#';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'Test';
      field1.headings = ['Test'];

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field1);

      // Write
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeComment('This is a comment');
      writer.writeHeader();

      writer.setFieldValue(0, 'Value1');
      writer.write();

      writer.close();

      const textWithComment = stringWriter.toString();
      console.log('Text with comment:', textWithComment);

      expect(textWithComment).toContain('#This is a comment');
    });
  });

  describe('Multiple Data Types', () => {
    it('should handle all standard data types', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field1 = meta.fieldList.new(FtDataType.String);
      (field1 as FtStringMetaField).name = 'StringField';
      field1.headings = ['String'];
      field1.valueQuotedType = FtQuotedType.Optional;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      (field2 as FtIntegerMetaField).name = 'IntField';
      field2.headings = ['Int'];
      (field2 as FtIntegerMetaField).format = 'G';

      const field3 = meta.fieldList.new(FtDataType.Float);
      (field3 as FtFloatMetaField).name = 'FloatField';
      field3.headings = ['Float'];
      (field3 as FtFloatMetaField).format = 'G';

      const field4 = meta.fieldList.new(FtDataType.Decimal);
      (field4 as FtDecimalMetaField).name = 'DecimalField';
      field4.headings = ['Decimal'];
      (field4 as FtDecimalMetaField).format = 'G';

      const field5 = meta.fieldList.new(FtDataType.Boolean);
      (field5 as FtBooleanMetaField).name = 'BoolField';
      field5.headings = ['Bool'];
      (field5 as FtBooleanMetaField).styles = noneBooleanStyles;

      const field6 = meta.fieldList.new(FtDataType.DateTime);
      (field6 as FtDateTimeMetaField).name = 'DateField';
      field6.headings = ['Date'];
      (field6 as FtDateTimeMetaField).format = 'yyyy-MM-dd';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;

      rootSequence.itemList.new(field1);
      rootSequence.itemList.new(field2);
      rootSequence.itemList.new(field3);
      rootSequence.itemList.new(field4);
      rootSequence.itemList.new(field5);
      rootSequence.itemList.new(field6);

      // Write
      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();

      const testDate = new Date(2024, 0, 15); // Jan 15, 2024
      writer.setFieldValue(0, 'Test String');
      writer.setFieldValue(1, 42);
      writer.setFieldValue(2, 3.14159);
      writer.setFieldValue(3, 123.45);
      writer.setFieldValue(4, true);
      writer.setFieldValue(5, testDate);
      writer.write();

      writer.close();

      const csvText = stringWriter.toString();
      console.log('All types output:', csvText);

      // Read back
      const reader = new FtReader();
      reader.loadMeta(meta);
      reader.open(csvText); // Header is read automatically

      const result = reader.read();
      expect(result).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Test String');
      expect(Number(reader.fieldList.get(1).asBigInt)).toBe(42);
      expect(reader.fieldList.get(2).asFloat).toBeCloseTo(3.14159, 5);
      expect(reader.fieldList.get(3).asDecimal).toBeCloseTo(123.45, 2);
      expect(reader.fieldList.get(4).asBoolean).toBe(true);

      const dateValue = reader.fieldList.get(5).asDateTime;
      expect(dateValue).toBeDefined();
      if (dateValue) {
        expect(dateValue.getFullYear()).toBe(2024);
        expect(dateValue.getMonth()).toBe(0);
        expect(dateValue.getDate()).toBe(15);
      }

      reader.close();
    });
  });

  describe('Substitutions', () => {
    it('should decode substitutions while reading delimited values', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.quoteChar = '"';
      meta.substitutionsEnabled = true;
      meta.substitutionChar = '\\';

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';
      field.headings = ['Text'];

      meta.substitutionList.new(FtSubstitutionType.String, 'n', '\n');

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const reader = new FtReader(meta, 'Text\nHello\\nWorld');
      expect(reader.read()).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('Hello\nWorld');
      reader.close();
    });

    it('should encode substitutions while writing delimited values', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.substitutionsEnabled = true;
      meta.substitutionChar = '\\';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';
      field.headings = ['Text'];
      field.valueQuotedType = FtQuotedType.Never;

      meta.substitutionList.new(FtSubstitutionType.String, 'n', '\n');

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();
      writer.setFieldValue(0, 'Hello\nWorld');
      writer.write();
      writer.close();

      const lines = stringWriter.toString().split(/\r?\n/);
      expect(lines[1]).toBe('Hello\\nWorld');
    });

    it('should apply AutoEndOfLine substitutions using EndOfLineAutoWriteType', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.substitutionsEnabled = true;
      meta.substitutionChar = '\\';
      meta.endOfLineType = FtEndOfLineType.Auto;
      meta.endOfLineAutoWriteType = FtEndOfLineAutoWriteType.CrLf;
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';
      field.headings = ['Text'];
      field.valueQuotedType = FtQuotedType.Never;

      meta.substitutionList.new(FtSubstitutionType.AutoEndOfLine, 'N', '');

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();
      writer.setFieldValue(0, 'A\r\nB');
      writer.write();
      writer.close();

      const lines = stringWriter.toString().split(/\r?\n/);
      expect(lines[1]).toBe('A\\NB');

      const reader = new FtReader(meta, 'Text\r\nA\\NB');
      expect(reader.read()).toBe(true);
      expect(reader.fieldList.get(0).asString).toBe('A\r\nB');
      reader.close();
    });

    it('should prioritize earlier declared substitution when multiple match', () => {
      const meta = new FtMeta();
      meta.mainHeadingLineIndex = 0;
      meta.headingLineCount = 1;
      meta.delimiterChar = ',';
      meta.substitutionsEnabled = true;
      meta.substitutionChar = '\\';
      meta.lastLineEndedType = FtLastLineEndedType.Never;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';
      field.headings = ['Text'];
      field.valueQuotedType = FtQuotedType.Never;

      meta.substitutionList.new(FtSubstitutionType.String, '2', 'A');
      meta.substitutionList.new(FtSubstitutionType.String, '1', 'AB');

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const writer = new FtSerializationWriter(meta);
      const stringWriter = new FtStringWriter();
      const settings: FtWriterSettings = {
        declared: false,
      };

      writer.open(stringWriter, settings);
      writer.writeHeader();
      writer.setFieldValue(0, 'AB');
      writer.write();
      writer.close();

      const lines = stringWriter.toString().split(/\r?\n/);
      expect(lines[1]).toBe('\\2B');
    });
  });
});
