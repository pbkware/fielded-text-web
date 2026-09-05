import { FtDataType, FtMeta, FtQuotedType, FtStringMetaField } from '@pbkware/fielded-text-web';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FtNodeFileReader } from '../src/ft-node-file-reader.js';
import { FtNodeFileWriter } from '../src/ft-node-file-writer.js';

describe('Node.js File I/O', () => {
  let tempDir: string;
  let testFilePath: string;

  beforeEach(() => {
    // Create a temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-node-test-'));
    testFilePath = path.join(tempDir, 'test.csv');
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('FtNodeFileWriter', () => {
    it('should write CSV data to a file with default UTF-8 encoding', () => {
      // Create meta
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 1;

      const nameField = meta.fieldList.new(FtDataType.String);
      (nameField as FtStringMetaField).name = 'Name';
      nameField.headings = ['Name'];
      nameField.valueQuotedType = FtQuotedType.Optional;

      const ageField = meta.fieldList.new(FtDataType.String);
      (ageField as FtStringMetaField).name = 'Age';
      ageField.headings = ['Age'];

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(nameField);
      rootSequence.itemList.new(ageField);

      // Write to file using single-class API
      const writer = new FtNodeFileWriter(testFilePath, meta);

      writer.writeHeader();

      writer.setFieldValueByName('Name', 'Alice');
      writer.setFieldValueByName('Age', '30');
      writer.write();

      writer.setFieldValueByName('Name', 'Bob');
      writer.setFieldValueByName('Age', '25');
      writer.write();

      writer.close();

      // Verify file was created and has correct content
      expect(fs.existsSync(testFilePath)).toBe(true);

      const content = fs.readFileSync(testFilePath, 'utf-8');
      const lines = content.split(/\r?\n/);

      expect(lines[0]).toBe('Name,Age');
      expect(lines[1]).toBe('Alice,30');
      expect(lines[2]).toBe('Bob,25');
    });

    it('should support custom encoding', () => {
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 0;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      // Write with latin1 encoding
      const writer = new FtNodeFileWriter(testFilePath, meta, 'latin1');

      writer.setFieldValueByName('Text', 'café');
      writer.write();

      writer.close();

      // Read back with latin1 encoding
      const content = fs.readFileSync(testFilePath, 'latin1');
      expect(content.trim()).toBe('café');
    });

    it('should dispose properly and close file descriptor', () => {
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 0;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const writer = new FtNodeFileWriter(testFilePath, meta);
      writer.setFieldValueByName('Text', 'test');
      writer.write();
      writer.close();

      // Should not throw when disposed again
      expect(() => writer.close()).not.toThrow();

      // Verify file was written
      expect(fs.existsSync(testFilePath)).toBe(true);
    });

    it('should handle Unicode characters correctly', () => {
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 0;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const writer = new FtNodeFileWriter(testFilePath, meta);

      // Write Unicode characters
      writer.setFieldValueByName('Text', 'Hello 世界 🌍');
      writer.write();

      writer.close();

      const content = fs.readFileSync(testFilePath, 'utf-8');
      expect(content.trim()).toBe('Hello 世界 🌍');
    });
  });

  describe('FtNodeFileReader', () => {
    it('should read CSV data from a file with default UTF-8 encoding', () => {
      // Create meta
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 1;

      const nameField = meta.fieldList.new(FtDataType.String);
      (nameField as FtStringMetaField).name = 'Name';
      nameField.headings = ['Name'];

      const ageField = meta.fieldList.new(FtDataType.String);
      (ageField as FtStringMetaField).name = 'Age';
      ageField.headings = ['Age'];

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(nameField);
      rootSequence.itemList.new(ageField);

      // Create test file
      const csvContent = 'Name,Age\nAlice,30\nBob,25\n';
      fs.writeFileSync(testFilePath, csvContent, 'utf-8');

      // Read file using single-class API
      const reader = new FtNodeFileReader(testFilePath, meta);

      const records: Array<{ name: string; age: string }> = [];

      while (reader.read()) {
        const name = reader.fieldList.get(0).asString ?? '';
        const age = reader.fieldList.get(1).asString ?? '';
        records.push({ name, age });
      }

      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({ name: 'Alice', age: '30' });
      expect(records[1]).toEqual({ name: 'Bob', age: '25' });

      reader.close();
    });

    it('should support custom encoding', () => {
      // Create meta
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 0;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      // Write file with latin1 encoding
      fs.writeFileSync(testFilePath, 'café', 'latin1');

      // Read with latin1 encoding
      const reader = new FtNodeFileReader(testFilePath, meta, 'latin1');

      expect(reader.read()).toBe(true);
      const text = reader.fieldList.get(0).asString;
      expect(text).toBe('café');

      reader.close();
    });

    it('should handle Unicode characters correctly', () => {
      // Create meta
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 0;

      const field = meta.fieldList.new(FtDataType.String);
      (field as FtStringMetaField).name = 'Text';

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(field);

      const unicodeText = 'Hello 世界 🌍';
      fs.writeFileSync(testFilePath, unicodeText, 'utf-8');

      const reader = new FtNodeFileReader(testFilePath, meta);

      expect(reader.read()).toBe(true);
      const text = reader.fieldList.get(0).asString;
      expect(text).toBe(unicodeText);

      reader.close();
    });
  });

  describe('Round-trip File I/O', () => {
    it('should write and read back CSV data correctly', () => {
      // Create meta
      const meta = new FtMeta();
      meta.delimiterChar = ',';
      meta.headingLineCount = 1;

      const nameField = meta.fieldList.new(FtDataType.String);
      (nameField as FtStringMetaField).name = 'Name';
      nameField.headings = ['Name'];
      nameField.valueQuotedType = FtQuotedType.Optional;

      const cityField = meta.fieldList.new(FtDataType.String);
      (cityField as FtStringMetaField).name = 'City';
      cityField.headings = ['City'];
      cityField.valueQuotedType = FtQuotedType.Optional;

      const rootSequence = meta.sequenceList.new();
      rootSequence.name = 'Root';
      rootSequence.root = true;
      rootSequence.itemList.new(nameField);
      rootSequence.itemList.new(cityField);

      // Write data using single-class API
      const writer = new FtNodeFileWriter(testFilePath, meta);

      writer.writeHeader();

      writer.setFieldValueByName('Name', 'Alice');
      writer.setFieldValueByName('City', 'New York');
      writer.write();

      writer.setFieldValueByName('Name', 'Bob');
      writer.setFieldValueByName('City', 'San Francisco');
      writer.write();

      writer.close();

      // Read back the data using single-class API
      const reader = new FtNodeFileReader(testFilePath, meta);

      const records: Array<{ name: string; city: string }> = [];

      while (reader.read()) {
        const name = reader.getFieldValueByName('Name') as string;
        const city = reader.getFieldValueByName('City') as string;
        records.push({ name, city });
      }

      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({ name: 'Alice', city: 'New York' });
      expect(records[1]).toEqual({ name: 'Bob', city: 'San Francisco' });

      reader.close();
    });
  });
});
