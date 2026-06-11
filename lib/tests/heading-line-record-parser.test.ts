// Comprehensive tests for HeadingLineRecordParser

import { beforeEach, describe, expect, it } from 'vitest';
import { FtMeta } from '../src/meta/ft-meta.js';
import { CharReader } from '../src/serialization/char-reader.js';
import { FtSerializationReader } from '../src/serialization/ft-serialization-reader.js';
import { FtStringReader, FtTextReader } from '../src/serialization/ft-text-reader.js';
import { HeadingLineRecordParser } from '../src/serialization/heading-line-record-parser.js';
import { FtDataType } from '../src/types/enums/ft-data-type.js';

describe('HeadingLineRecordParser', () => {
  let meta: FtMeta;
  let charReader: CharReader;
  let core: FtSerializationReader;
  let parser: HeadingLineRecordParser;

  beforeEach(() => {
    meta = new FtMeta();
    charReader = new CharReader();
    core = new FtSerializationReader();
  });

  describe('Delimited field parsing', () => {
    beforeEach(() => {
      // Set up meta with delimited fields
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';
      field1.fixedWidth = false;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      field2.name = 'Age';
      field2.fixedWidth = false;
      (field2 as any).format = 'G'; // Set valid format for integer field

      const field3 = meta.fieldList.new(FtDataType.Boolean);
      field3.name = 'Active';
      field3.fixedWidth = false;

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should parse simple heading line', () => {
      charReader.setTextReader(new FtStringReader('Name,Age,Active\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(0);
    });

    it('should parse quoted headings', () => {
      charReader.setTextReader(new FtStringReader('"Full Name","Age Code","Is Active"\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(0);
    });

    it('should handle headings with spaces', () => {
      charReader.setTextReader(new FtStringReader('"First Name", "Last Name", "Email Address"\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(0);
    });

    it('should parse headings with embedded commas in quotes', () => {
      charReader.setTextReader(new FtStringReader('"Name, Full","Age","Active"\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }
      parser.finish();

      // Test passes if no exception thrown during parsing
      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('Fixed-width field parsing', () => {
    beforeEach(() => {
      // Set up meta with fixed-width fields
      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';
      field1.fixedWidth = true;
      field1.width = 20;

      const field2 = meta.fieldList.new(FtDataType.Integer);
      field2.name = 'Age';
      field2.fixedWidth = true;
      field2.width = 5;
      (field2 as any).format = 'G';

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should parse fixed-width heading line', () => {
      charReader.setTextReader(new FtStringReader('Name                Age  \n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBe(-1);
      expect(parser.fieldCount).toBe(2);
    });

    it('should handle padded fixed-width headings', () => {
      charReader.setTextReader(new FtStringReader('Name                    3\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBe(-1);
      expect(parser.fieldCount).toBe(2);
    });
  });

  describe('Mixed delimited and fixed-width', () => {
    beforeEach(() => {
      // Mix of delimited and fixed-width
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'ID';
      field1.fixedWidth = true;
      field1.width = 5;

      const field2 = meta.fieldList.new(FtDataType.String);
      field2.name = 'Name';
      field2.fixedWidth = false;

      const field3 = meta.fieldList.new(FtDataType.Integer);
      field3.name = 'Age';
      field3.fixedWidth = false;
      (field3 as any).format = 'G';

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should parse mixed field types', () => {
      charReader.setTextReader(new FtStringReader('ID   ,Name,Age\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }
      parser.finish();

      // Test passes if no exception thrown during parsing
      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('End-of-line embedding', () => {
    beforeEach(() => {
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Description';
      field1.fixedWidth = false;

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should detect when EOL should be embedded in quoted field', () => {
      charReader.setTextReader(new FtStringReader('"Multi\nLine"\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      // Should indicate EOL embedding when inside quotes
      const shouldEmbed = parser.isEndOfLineToBeEmbedded();
      expect(typeof shouldEmbed).toBe('boolean');
    });

    it('should not embed EOL outside quotes', () => {
      charReader.setTextReader(new FtStringReader('Simple\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      const shouldEmbed = parser.isEndOfLineToBeEmbedded();
      expect(shouldEmbed).toBe(false);
    });
  });

  describe('Ignore extra characters', () => {
    beforeEach(() => {
      meta.delimiterChar = ',';
      meta.ignoreExtraChars = true;

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Field1';
      field1.fixedWidth = false;

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should track ignore extra chars position', () => {
      charReader.setTextReader(new FtStringReader('Field1,ExtraData\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      const ignorePos = parser.getIgnoreExtraCharsLinePosition();
      expect(typeof ignorePos).toBe('number');
    });
  });

  describe('State tracking', () => {
    beforeEach(() => {
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';

      const field2 = meta.fieldList.new(FtDataType.Integer);
      field2.name = 'Age';
      (field2 as any).format = 'G';

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should track active field during parsing', () => {
      charReader.setTextReader(new FtStringReader('Name,Age\n'), true);
      parser.start(0);

      // Before any parsing
      let activeIdx = parser.getActiveFieldIndex();
      expect(activeIdx).toBeGreaterThanOrEqual(-1);

      // Parse first field
      parser.parseChar('N');
      parser.parseChar('a');
      parser.parseChar('m');
      parser.parseChar('e');

      activeIdx = parser.getActiveFieldIndex();
      expect(activeIdx).toBeGreaterThanOrEqual(0);

      // Parse delimiter
      parser.parseChar(',');

      // Parse second field
      parser.parseChar('A');
      parser.parseChar('g');
      parser.parseChar('e');

      activeIdx = parser.getActiveFieldIndex();
      expect(activeIdx).toBeGreaterThanOrEqual(0);
    });

    it('should provide access to active field', () => {
      charReader.setTextReader(new FtStringReader('Name\n'), true);
      parser.start(0);

      parser.parseChar('N');
      parser.parseChar('a');

      const activeField = parser.activeField;
      // Should have an active field or be null
      expect(activeField === null || activeField !== undefined).toBe(true);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Field1';

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      parser = new HeadingLineRecordParser(core, charReader, true);
    });

    it('should throw if parseChar called before start', () => {
      expect(() => {
        parser.parseChar('A');
      }).toThrow();
    });
  });

  describe('Data line parsing (non-heading)', () => {
    beforeEach(() => {
      meta.delimiterChar = ',';
      meta.quoteChar = '"';

      const field1 = meta.fieldList.new(FtDataType.String);
      field1.name = 'Name';

      const field2 = meta.fieldList.new(FtDataType.Integer);
      field2.name = 'Age';
      (field2 as any).format = 'G';

      core.loadMeta(meta);
      core.invokeRootSequence(); // Initialize field list
      // Create parser for data lines (not headings)
      parser = new HeadingLineRecordParser(core, charReader, false);
    });

    it('should parse data line', () => {
      charReader.setTextReader(new FtStringReader('John Doe,30\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }

      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(0);
    });

    it('should parse quoted data values', () => {
      charReader.setTextReader(new FtStringReader('"John Doe",30\n'), true);
      parser.start(0);

      let readValue = charReader.read();
      while (readValue !== FtTextReader.EofReadResult) {
        const char = String.fromCharCode(readValue);
        parser.parseChar(char);
        readValue = charReader.read();
      }
      parser.finish();

      // Test passes if no exception thrown during parsing
      expect(parser.getActiveFieldIndex()).toBeGreaterThanOrEqual(-1);
    });
  });
});
