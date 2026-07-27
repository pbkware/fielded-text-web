// Comprehensive tests for CharReader

import { beforeEach, describe, expect, it } from 'vitest';
import { CharReader } from '../src/serialization/char-reader.js';
import { FtStringReader } from '../src/serialization/text-reader/ft-string-reader.js';
import { FtTextReader } from '../src/serialization/text-reader/ft-text-reader.js';

describe('CharReader', () => {
  let reader: CharReader;

  beforeEach(() => {
    reader = new CharReader();
  });

  describe('Basic read operations', () => {
    it('should read characters sequentially', () => {
      reader.setTextReader(new FtStringReader('ABC'));
      expect(reader.read()).toBe('A'.charCodeAt(0));
      expect(reader.read()).toBe('B'.charCodeAt(0));
      expect(reader.read()).toBe('C'.charCodeAt(0));
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
    });

    it('should update position during reading', () => {
      reader.setTextReader(new FtStringReader('Test'));
      expect(reader.position).toBe(-1);
      reader.read();
      expect(reader.position).toBe(0);
      reader.read();
      expect(reader.position).toBe(1);
    });

    it('should handle empty string', () => {
      reader.setTextReader(new FtStringReader(''));
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
      expect(reader.position).toBe(0);
    });

    it('should return EOF consistently after reaching end', () => {
      reader.setTextReader(new FtStringReader('A'));
      reader.read();
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
    });
  });

  describe('Peek operations', () => {
    it('should peek without consuming character', () => {
      reader.setTextReader(new FtStringReader('ABC'));
      expect(reader.peek()).toBe('A'.charCodeAt(0));
      expect(reader.peek()).toBe('A'.charCodeAt(0));
      expect(reader.read()).toBe('A'.charCodeAt(0));
      expect(reader.peek()).toBe('B'.charCodeAt(0));
    });

    it('should peek at EOF', () => {
      reader.setTextReader(new FtStringReader('A'));
      reader.read();
      expect(reader.peek()).toBe(FtTextReader.EofReadResult);
      expect(reader.peek()).toBe(FtTextReader.EofReadResult);
    });

    it('should allow read after peek', () => {
      reader.setTextReader(new FtStringReader('XY'));
      const peeked = reader.peek();
      const read = reader.read();
      expect(peeked).toBe(read);
      expect(peeked).toBe('X'.charCodeAt(0));
    });

    it('should peek line feed correctly', () => {
      reader.setTextReader(new FtStringReader('A\nB'));
      reader.read(); // 'A'
      expect(reader.peekNextIsLineFeed()).toBe(true);
      reader.read(); // '\n'
      expect(reader.peekNextIsLineFeed()).toBe(false);
    });
  });

  describe('Signature detection', () => {
    it('should detect modern signature', () => {
      const text = CharReader.Signature + ' Version="1.1"';
      reader.setTextReader(new FtStringReader(text));
      const sig = reader.peekSignature();
      expect(sig).toBe(CharReader.Signature);
    });

    it('should detect legacy signature', () => {
      const text = CharReader.LegacySignature + ' Version="1.0"';
      reader.setTextReader(new FtStringReader(text));
      const sig = reader.peekSignature();
      expect(sig).toBe(CharReader.LegacySignature);
    });

    it('should return undefined when no signature present', () => {
      reader.setTextReader(new FtStringReader('Regular text without signature'));
      const sig = reader.peekSignature();
      expect(sig).toBeUndefined();
    });

    it('should allow reading signature characters after peekSignature', () => {
      const text = CharReader.Signature + 'ABC';
      reader.setTextReader(new FtStringReader(text));
      const sig = reader.peekSignature();
      expect(sig).toBe(CharReader.Signature);

      // Read the signature
      for (let i = 0; i < CharReader.Signature.length; i++) {
        expect(reader.read()).toBe(CharReader.Signature.charCodeAt(i));
      }
      // Then read following characters
      expect(reader.read()).toBe('A'.charCodeAt(0));
    });

    it('should handle signature at EOF', () => {
      reader.setTextReader(new FtStringReader(CharReader.Signature));
      const sig = reader.peekSignature();
      expect(sig).toBe(CharReader.Signature);
      // Read through
      for (let i = 0; i < CharReader.Signature.length; i++) {
        reader.read();
      }
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
    });

    it('should handle partial signature match', () => {
      reader.setTextReader(new FtStringReader('|!Fielded ABC')); // Not the full signature
      const sig = reader.peekSignature();
      expect(sig).toBeUndefined();
      // Should be able to read the characters
      expect(reader.read()).toBe('|'.charCodeAt(0));
      expect(reader.read()).toBe('!'.charCodeAt(0));
    });
  });

  describe('Reset and close', () => {
    it('should allow setTextReader to reset the reader', () => {
      reader.setTextReader(new FtStringReader('ABC'));
      reader.read();
      reader.read();
      expect(reader.position).toBe(1);

      reader.setTextReader(new FtStringReader('XYZ'));
      expect(reader.position).toBe(-1);
      expect(reader.read()).toBe('X'.charCodeAt(0));
    });

    it('should mark reader as closed after close()', () => {
      reader.setTextReader(new FtStringReader('Test'));
      expect(reader.isClosed).toBe(false);
      reader.close();
      expect(reader.isClosed).toBe(true);
    });

    it('should clear text on close', () => {
      reader.setTextReader(new FtStringReader('ABC'));
      reader.close();
      // Reader should be empty after close
      expect(reader.isClosed).toBe(true);
    });
  });

  describe('Line ending characters', () => {
    it('should recognize carriage return', () => {
      reader.setTextReader(new FtStringReader('A\rB'));
      expect(reader.read()).toBe('A'.charCodeAt(0));
      expect(reader.read()).toBe(CharReader.CarriageReturnChar.charCodeAt(0));
      expect(reader.read()).toBe('B'.charCodeAt(0));
    });

    it('should recognize line feed', () => {
      reader.setTextReader(new FtStringReader('A\nB'));
      expect(reader.read()).toBe('A'.charCodeAt(0));
      expect(reader.read()).toBe(CharReader.LineFeedChar.charCodeAt(0));
      expect(reader.read()).toBe('B'.charCodeAt(0));
    });

    it('should handle CRLF sequence', () => {
      reader.setTextReader(new FtStringReader('A\r\nB'));
      expect(reader.read()).toBe('A'.charCodeAt(0));
      expect(reader.read()).toBe(CharReader.CarriageReturnChar.charCodeAt(0));
      expect(reader.read()).toBe(CharReader.LineFeedChar.charCodeAt(0));
      expect(reader.read()).toBe('B'.charCodeAt(0));
    });
  });

  describe('Edge cases', () => {
    it('should handle single character', () => {
      reader.setTextReader(new FtStringReader('X'));
      expect(reader.read()).toBe('X'.charCodeAt(0));
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
    });

    it('should handle Unicode characters', () => {
      reader.setTextReader(new FtStringReader('Hello 世界'));
      expect(reader.read()).toBe('H'.charCodeAt(0));
      // Skip to Unicode chars
      for (let i = 0; i < 5; i++) reader.read();
      expect(reader.read()).toBe('世'.charCodeAt(0));
      expect(reader.read()).toBe('界'.charCodeAt(0));
    });

    it('should handle special characters', () => {
      reader.setTextReader(new FtStringReader('\t\n\r'));
      expect(reader.read()).toBe('\t'.charCodeAt(0));
      expect(reader.read()).toBe('\n'.charCodeAt(0));
      expect(reader.read()).toBe('\r'.charCodeAt(0));
      expect(reader.read()).toBe(FtTextReader.EofReadResult);
    });
  });
});
