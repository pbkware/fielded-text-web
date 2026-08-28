// Tests for FtMeta class
import { beforeEach, describe, expect, it } from 'vitest';
import {
  FtDataType,
  FtEndOfLineAutoWriteType,
  FtEndOfLineType,
  FtLastLineEndedType,
  FtMeta,
  FtQuotedType,
  FtSubstitutionType,
} from '../src/index.js';

describe('FtMeta', () => {
  let meta: FtMeta;

  beforeEach(() => {
    meta = new FtMeta();
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      expect(meta).toBeDefined();
      expect(meta.endOfLineType).toBe(FtEndOfLineType.Auto);
      expect(meta.quoteChar).toBe('"');
      expect(meta.delimiterChar).toBe(',');
      expect(meta.lineCommentChar).toBe('\x04');
      expect(meta.allowEndOfLineCharInQuotes).toBe(true);
      expect(meta.ignoreBlankLines).toBe(true);
      expect(meta.stuffedEmbeddedQuotes).toBe(true);
      expect(meta.headingLineCount).toBe(0);
    });

    it('should initialize field, sequence, and substitution lists', () => {
      expect(meta.fieldList).toBeDefined();
      expect(meta.sequenceList).toBeDefined();
      expect(meta.substitutionList).toBeDefined();
      expect(meta.fieldList.count).toBe(0);
      expect(meta.sequenceList.count).toBe(0);
      expect(meta.substitutionList.count).toBe(0);
    });
  });

  describe('static create', () => {
    it('should create new instance', () => {
      const created = FtMeta.create();
      expect(created).toBeInstanceOf(FtMeta);
      expect(created.quoteChar).toBe('"');
    });
  });

  describe('reset', () => {
    it('should reset all properties to defaults', () => {
      // Modify some properties
      meta.quoteChar = "'";
      meta.delimiterChar = ';';
      meta.headingLineCount = 5;
      meta.ignoreBlankLines = false;

      // Reset
      meta.reset();

      // Verify defaults restored
      expect(meta.quoteChar).toBe('"');
      expect(meta.delimiterChar).toBe(',');
      expect(meta.headingLineCount).toBe(0);
      expect(meta.ignoreBlankLines).toBe(true);
    });

    it('should clear all lists', () => {
      // Reset should clear lists (even though they're empty already)
      meta.reset();
      expect(meta.fieldList.count).toBe(0);
      expect(meta.sequenceList.count).toBe(0);
      expect(meta.substitutionList.count).toBe(0);
    });
  });

  describe('createCopy', () => {
    it('should create deep copy of meta', () => {
      meta.quoteChar = "'";
      meta.delimiterChar = ';';
      meta.headingLineCount = 2;

      const copy = meta.createCopy();

      expect(copy).toBeInstanceOf(FtMeta);
      expect(copy.quoteChar).toBe("'");
      expect(copy.delimiterChar).toBe(';');
      expect(copy.headingLineCount).toBe(2);

      // Modifying original should not affect copy
      meta.quoteChar = '"';
      expect(copy.quoteChar).toBe("'");
    });
  });

  describe('assign', () => {
    it('should copy all properties from source', () => {
      const source = new FtMeta();
      source.quoteChar = "'";
      source.delimiterChar = '|';
      source.endOfLineType = FtEndOfLineType.Char;
      source.endOfLineChar = ';';
      source.headingLineCount = 3;
      source.allowIncompleteRecords = true;

      meta.assign(source);

      expect(meta.quoteChar).toBe("'");
      expect(meta.delimiterChar).toBe('|');
      expect(meta.endOfLineType).toBe(FtEndOfLineType.Char);
      expect(meta.endOfLineChar).toBe(';');
      expect(meta.headingLineCount).toBe(3);
      expect(meta.allowIncompleteRecords).toBe(true);
    });

    it('should deep-copy substitutions from source', () => {
      const source = new FtMeta();
      const sourceSub = source.substitutionList.new(FtSubstitutionType.String, 'n', '\n');

      meta.assign(source);

      expect(meta.substitutionList.count).toBe(1);
      expect(meta.substitutionList.get(0).token).toBe('n');
      expect(meta.substitutionList.get(0).value).toBe('\n');

      sourceSub.token = 't';
      sourceSub.value = '\t';
      source.substitutionList.clear();

      expect(meta.substitutionList.count).toBe(1);
      expect(meta.substitutionList.get(0).token).toBe('n');
      expect(meta.substitutionList.get(0).value).toBe('\n');
    });
  });

  describe('validate', () => {
    it('should pass validation with default values (except needs at least one field)', () => {
      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('at least one field');
    });

    it('should fail if quoteChar equals delimiterChar', () => {
      meta.quoteChar = ',';
      meta.delimiterChar = ',';

      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('QuoteChar and DelimiterChar');
    });

    it('should fail if quoteChar equals lineCommentChar', () => {
      meta.quoteChar = '#';
      meta.lineCommentChar = '#';

      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('QuoteChar and LineCommentChar');
    });

    it('should fail if lineCommentChar equals delimiterChar', () => {
      meta.lineCommentChar = ',';
      meta.delimiterChar = ',';

      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('LineCommentChar and DelimiterChar');
    });

    it('should fail if substitutionChar conflicts when substitutions enabled', () => {
      meta.substitutionsEnabled = true;
      meta.substitutionChar = '"';
      meta.quoteChar = '"';

      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('QuoteChar and SubstitutionChar');
    });

    it('should fail if substitution token is not a single character', () => {
      meta.fieldList.new(FtDataType.String);
      meta.substitutionList.new(FtSubstitutionType.String, 'NL', '\n');

      const result = meta.validate();
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toContain('must be a single character');
    });
  });

  describe('headingLineCount property', () => {
    it('should update fieldList.headingCount when set', () => {
      meta.headingLineCount = 5;
      expect(meta.headingLineCount).toBe(5);
      expect(meta.fieldList.headingCount).toBe(5);
    });
  });

  describe('default constants', () => {
    it('should have correct default constants', () => {
      expect(FtMeta.DefaultQuoteChar).toBe('"');
      expect(FtMeta.DefaultDelimiterChar).toBe(',');
      expect(FtMeta.DefaultLineCommentChar).toBe('\x04');
      expect(FtMeta.DefaultEndOfLineType).toBe(FtEndOfLineType.Auto);
      expect(FtMeta.DefaultEndOfLineAutoWriteType).toBe(FtEndOfLineAutoWriteType.Local);
      expect(FtMeta.DefaultLastLineEndedType).toBe(FtLastLineEndedType.Optional);
      expect(FtMeta.DefaultHeadingQuotedType).toBe(FtQuotedType.Optional);
      expect(FtMeta.DefaultAllowEndOfLineCharInQuotes).toBe(true);
      expect(FtMeta.DefaultIgnoreBlankLines).toBe(true);
      expect(FtMeta.DefaultStuffedEmbeddedQuotes).toBe(true);
    });
  });
});
