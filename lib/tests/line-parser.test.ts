// Comprehensive tests for LineParser

import { beforeEach, describe, expect, it } from 'vitest';
import { CharReader } from '../src/serialization/char-reader.js';
import { FtStringReader } from '../src/serialization/ft-text-reader.js';
import { LineEndedType, LineParser } from '../src/serialization/line-parser.js';
import { FtEndOfLineType } from '../src/types/enums/ft-end-of-line-type.js';

describe('LineParser', () => {
  let charReader: CharReader;
  let parser: LineParser;

  beforeEach(() => {
    charReader = new CharReader();
  });

  describe('Line counting with Auto EOL', () => {
    beforeEach(() => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
    });

    it('should count lines with LF endings', () => {
      parser.reset();
      expect(parser.lineCount).toBe(0);
      expect(parser.inLine).toBe(false);

      parser.parseChar('A', false);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(true);

      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(false);

      parser.parseChar('B', false);
      expect(parser.lineCount).toBe(2);
    });

    it('should count lines with CR endings', () => {
      parser.reset();
      parser.parseChar('A', false);
      expect(parser.lineCount).toBe(1);

      parser.parseChar('\r', false);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(false);

      parser.parseChar('B', false);
      expect(parser.lineCount).toBe(2);
    });

    it('should handle CRLF as single line ending', () => {
      charReader.setTextReader(new FtStringReader('A\r\nB'), true);
      parser.reset();

      // Use charReader.read() to advance position for peek() to work
      let readResult = charReader.read();
      parser.parseChar(String.fromCharCode(readResult), false);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(true);

      // In Auto mode, CR ends the line (but inLine stays true in InPendingNextLineFeed state)
      readResult = charReader.read();
      const crResult = parser.parseChar(String.fromCharCode(readResult), false);
      expect(crResult).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(true); // InPendingNextLineFeed state

      // LF after CR continues the line ending (consuming the LF)
      readResult = charReader.read();
      const lfResult = parser.parseChar(String.fromCharCode(readResult), false);
      expect(lfResult).toBe(LineEndedType.Continued);
      expect(parser.inLine).toBe(false); // Now Out state

      // Next character starts line 2
      readResult = charReader.read();
      parser.parseChar(String.fromCharCode(readResult), false);
      expect(parser.lineCount).toBe(2);
      expect(parser.inLine).toBe(true);
    });
  });

  describe('Line ending types', () => {
    it('should handle Auto mode with CR', () => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
      parser.reset();

      parser.parseChar('A', false);
      const result = parser.parseChar('\r', false);
      expect(result).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(false);
    });

    it('should handle Auto mode with LF', () => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
      parser.reset();

      parser.parseChar('A', false);
      const result = parser.parseChar('\n', false);
      expect(result).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(false);
    });

    it('should handle CRLF line endings', () => {
      charReader.setTextReader(new FtStringReader('A\r\nB'), true);
      parser = new LineParser(charReader, FtEndOfLineType.CrLf, ';');
      parser.reset();

      // Use charReader.read() to advance position for peek() to work
      let readResult = charReader.read();
      parser.parseChar(String.fromCharCode(readResult), false);

      readResult = charReader.read();
      const crResult = parser.parseChar(String.fromCharCode(readResult), false);
      // In CRLF mode, CR initiates the line end (but inLine stays true in InPendingNextLineFeed state)
      expect(crResult).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(true); // InPendingNextLineFeed state

      readResult = charReader.read();
      const lfResult = parser.parseChar(String.fromCharCode(readResult), false);
      // LF continues/completes the CRLF sequence
      expect(lfResult).toBe(LineEndedType.Continued);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(false); // Now Out state
    });

    it('should handle custom char line endings', () => {
      parser = new LineParser(charReader, FtEndOfLineType.Char, ';');
      parser.reset();

      parser.parseChar('A', false);
      parser.parseChar(',', false);
      expect(parser.inLine).toBe(true);

      const result = parser.parseChar(';', false);
      expect(result).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(false);
    });
  });

  describe('Embedded end-of-line characters', () => {
    beforeEach(() => {
      charReader.setTextReader(new FtStringReader('A\nB'), true);
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
    });

    it('should embed EOL when flag is true', () => {
      parser.reset();
      parser.parseChar('A', false);
      expect(parser.lineCount).toBe(1);

      // Embed the line feed
      const result = parser.parseChar('\n', true);
      expect(result).toBe(LineEndedType.Not);
      expect(parser.inLine).toBe(true);
      expect(parser.lineCount).toBe(1);

      parser.parseChar('B', false);
      expect(parser.lineCount).toBe(1); // Still same line
    });

    it('should not embed EOL when flag is false', () => {
      parser.reset();
      parser.parseChar('A', false);

      const result = parser.parseChar('\n', false);
      expect(result).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(false);

      parser.parseChar('B', false);
      expect(parser.lineCount).toBe(2); // New line
    });
  });

  describe('Reset and reconfiguration', () => {
    beforeEach(() => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
    });

    it('should reset to initial state', () => {
      parser.parseChar('A', false);
      parser.parseChar('B', false);
      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(1);
      expect(parser.inLine).toBe(false);

      parser.reset();
      expect(parser.lineCount).toBe(0);
      expect(parser.lineLength).toBe(0);
      expect(parser.inLine).toBe(false);
    });

    it('should allow reconfiguration of EOL type', () => {
      parser.parseChar('A', false);
      parser.parseChar(';', false);
      expect(parser.inLine).toBe(true); // ';' is not EOL yet

      parser.setEndOfLine(FtEndOfLineType.Char, ';');
      parser.reset();

      parser.parseChar('A', false);
      const result = parser.parseChar(';', false);
      expect(result).toBe(LineEndedType.Initiated);
      expect(parser.inLine).toBe(false);
    });
  });

  describe('Multiple lines', () => {
    beforeEach(() => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
    });

    it('should count multiple lines correctly', () => {
      parser.reset();

      // Line 1
      parser.parseChar('F', false);
      parser.parseChar('i', false);
      parser.parseChar('r', false);
      parser.parseChar('s', false);
      parser.parseChar('t', false);
      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(1);

      // Line 2
      parser.parseChar('S', false);
      parser.parseChar('e', false);
      parser.parseChar('c', false);
      parser.parseChar('o', false);
      parser.parseChar('n', false);
      parser.parseChar('d', false);
      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(2);

      // Line 3
      parser.parseChar('T', false);
      parser.parseChar('h', false);
      parser.parseChar('i', false);
      parser.parseChar('r', false);
      parser.parseChar('d', false);
      expect(parser.lineCount).toBe(3);
      expect(parser.inLine).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty lines', () => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
      parser.reset();

      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(1);
      expect(parser.lineLength).toBe(1);

      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(2);
      expect(parser.lineLength).toBe(1);
    });

    it('should handle lines with only whitespace', () => {
      parser = new LineParser(charReader, FtEndOfLineType.Auto, ';');
      parser.reset();

      parser.parseChar(' ', false);
      parser.parseChar(' ', false);
      parser.parseChar('\n', false);
      expect(parser.lineCount).toBe(1);
    });
  });
});
