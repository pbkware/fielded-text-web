// Comprehensive tests for DeclarationParser

import { assert, beforeEach, describe, expect, it } from 'vitest';
import { CharReader } from '../src/serialization/char-reader.js';
import { DeclarationParser } from '../src/serialization/declaration-parser.js';
import { FtDeclaredParameters } from '../src/serialization/ft-declared-parameters.js';
import { FtStringReader, FtTextReader } from '../src/serialization/ft-text-reader.js';

describe('DeclarationParser', () => {
  let charReader: CharReader;
  let parameters: FtDeclaredParameters;
  let parser: DeclarationParser;

  beforeEach(() => {
    charReader = new CharReader();
    parameters = new FtDeclaredParameters();
  });

  describe('Signature line parsing', () => {
    it('should parse modern signature with version parameter', () => {
      const text = '|!Fielded Text^| Version="1.1"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        parser.parseSignatureLineChar(ch);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getName(0)).toBe('Version');
      expect(parameters.getValue(0)).toBe('1.1');
    });

    it('should parse legacy signature', () => {
      const text = '|>Fielded Text<| Version="1.0"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.LegacySignature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getValue(0)).toBe('1.0');
    });

    it('should parse multiple parameters', () => {
      const text = '|!Fielded Text^| Version="1.1" Culture="en-US" MainHeadingLine="0"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      expect(parameters.count).toBe(3);
      expect(parameters.indexOfName('Version')).toBeGreaterThanOrEqual(0);
      expect(parameters.indexOfName('Culture')).toBeGreaterThanOrEqual(0);
      expect(parameters.indexOfName('MainHeadingLine')).toBeGreaterThanOrEqual(0);
    });

    it('should handle parameter values with spaces', () => {
      const text = '|!Fielded Text^| Comment="This is a comment"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getValue(0)).toBe('This is a comment');
    });

    it('should handle stuffed quotes in parameter values', () => {
      const text = '|!Fielded Text^| Comment="She said ""Hello"""';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      // Use charReader.read() to advance its position so peek() works correctly
      let readResult = charReader.read();
      while (readResult !== FtTextReader.EofReadResult) {
        parser.parseSignatureLineChar(String.fromCharCode(readResult));
        readResult = charReader.read();
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getValue(0)).toBe('She said "Hello"');
    });
  });

  describe('MetaFile reference parsing', () => {
    it('should parse MetaFile parameter', () => {
      const text = '|!Fielded Text^| Version="1.1" MetaFile="myfile.ftm"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      const metaRef = parameters.getMetaReference();
      expect(metaRef.reference).toBe('myfile.ftm');
    });

    it('should parse MetaUrl parameter', () => {
      const text = '|!Fielded Text^| MetaUrl="http://example.com/meta.ftm"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      const metaRef = parameters.getMetaReference();
      expect(metaRef.reference).toBe('http://example.com/meta.ftm');
    });

    it('should detect embedded meta', () => {
      const text = '|!Fielded Text^| MetaEmbedded="True"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      // Use charReader.read() to advance its position
      let readResult = charReader.read();
      while (readResult !== FtTextReader.EofReadResult) {
        parser.parseSignatureLineChar(String.fromCharCode(readResult));
        readResult = charReader.read();
      }

      const metaRef = parameters.getMetaReference();
      expect(metaRef.reference).toBe('');
    });
  });

  describe('Declaration2 line parsing', () => {
    it('should parse second declaration line', () => {
      const text = '#AdditionalParam="Value1"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseDeclaration2LineChar(text[i]);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getName(0)).toBe('AdditionalParam');
      expect(parameters.getValue(0)).toBe('Value1');
    });
  });

  describe('Version parameter handling', () => {
    it('should parse version 1.1', () => {
      parameters.setVersion(1, 1);
      const result = parameters.tryGetVersion();
      if (!result.isOk()) {
        assert.fail('Expected version to be parsed successfully');
      } else {
        const value = result.value;
        expect(value.major).toBe(1);
        expect(value.minor).toBe(1);
      }
    });

    it('should parse version with comment', () => {
      parameters.setVersion(2, 0, 'beta');
      const result = parameters.tryGetVersion();
      if (!result.isOk()) {
        assert.fail('Expected version with comment to be parsed successfully');
      } else {
        const value = result.value;
        expect(value.major).toBe(2);
        expect(value.minor).toBe(0);
        expect(value.comment).toBe('beta');
      }
    });
  });

  describe('Parameter name handling', () => {
    it('should be case-insensitive for parameter names', () => {
      parameters.add('version', '1.0');
      expect(parameters.indexOfName('Version')).toBeGreaterThanOrEqual(0);
      expect(parameters.indexOfName('VERSION')).toBeGreaterThanOrEqual(0);
      expect(parameters.indexOfName('version')).toBeGreaterThanOrEqual(0);
    });

    it('should replace parameter if name already exists', () => {
      parameters.add('Version', '1.0');
      parameters.add('Version', '1.1');
      expect(parameters.count).toBe(1);
      expect(parameters.getValue(0)).toBe('1.1');
    });

    it('should remove parameter by name', () => {
      parameters.add('Version', '1.0');
      parameters.add('Culture', 'en-US');
      expect(parameters.count).toBe(2);

      parameters.remove('Version');
      expect(parameters.count).toBe(1);
      expect(parameters.getName(0)).toBe('Culture');
    });

    it('should clear all parameters', () => {
      parameters.add('Version', '1.0');
      parameters.add('Culture', 'en-US');
      parameters.add('Comment', 'Test');
      expect(parameters.count).toBe(3);

      parameters.clear();
      expect(parameters.count).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should throw on zero-length parameter name', () => {
      const text = '|!Fielded Text^| ="value"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      expect(() => {
        for (let i = 0; i < text.length; i++) {
          parser.parseSignatureLineChar(text[i]);
        }
      }).toThrow(/zero length/);
    });

    it('should throw on unquoted parameter value', () => {
      const text = '|!Fielded Text^| Version=1.1';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      expect(() => {
        for (let i = 0; i < text.length; i++) {
          parser.parseSignatureLineChar(text[i]);
        }
      }).toThrow(/not quoted/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty parameter value', () => {
      const text = '|!Fielded Text^| Comment=""';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getValue(0)).toBe('');
    });

    it('should handle whitespace around equals sign', () => {
      const text = '|!Fielded Text^| Version = "1.1"';
      charReader.setTextReader(new FtStringReader(text), true);
      parser = new DeclarationParser(charReader, parameters);
      parser.signature = CharReader.Signature;
      parser.startLine();

      for (let i = 0; i < text.length; i++) {
        parser.parseSignatureLineChar(text[i]);
      }

      expect(parameters.count).toBe(1);
      expect(parameters.getName(0)).toBe('Version');
      expect(parameters.getValue(0)).toBe('1.1');
    });
  });
});
