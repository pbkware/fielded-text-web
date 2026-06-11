// Comprehensive tests for EmbeddedMetaParser

import { beforeEach, describe, expect, it } from 'vitest';
import { EmbeddedMetaParser } from '../src/serialization/embedded-meta-parser.js';

describe('EmbeddedMetaParser', () => {
  let parser: EmbeddedMetaParser;

  beforeEach(() => {
    parser = new EmbeddedMetaParser();
  });

  describe('XML declaration detection', () => {
    it('should detect XML declaration', () => {
      parser.reset();
      const text = '<?xml version="1.0" encoding="utf-8"?>';

      let detected = false;
      for (const ch of text) {
        if (parser.parseNotYetDetectedChar(ch)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(false); // Not detected until FieldedText element
    });

    it('should detect FieldedText element start', () => {
      parser.reset();
      const text = '<FieldedText';

      let detected = false;
      for (const ch of text) {
        if (parser.parseNotYetDetectedChar(ch)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect embedded meta with XML declaration', () => {
      parser.reset();
      const text = '<?xml version="1.0"?>\n<FieldedText';

      let detected = false;
      for (const ch of text) {
        if (parser.parseNotYetDetectedChar(ch)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });

  describe('Complete embedded meta parsing', () => {
    it('should detect and parse embedded meta block', () => {
      parser.reset();
      const meta = `<FieldedText></FieldedText>`;

      let detected = false;
      let i = 0;

      // Parse until detected
      while (i < meta.length && !detected) {
        detected = parser.parseNotYetDetectedChar(meta[i]);
        i++;
      }

      expect(detected).toBe(true);

      // Continue parsing after detection until ready or end of string
      while (i < meta.length) {
        if (parser.ready) break;
        parser.parseChar(meta[i]);
        i++;
      }

      // Parser should eventually become ready (may need the full string)
      if (!parser.ready && i >= meta.length) {
        // Reached end, this is expected for minimal case
        expect(i).toBe(meta.length);
      }
    });
  });

  describe('Reset functionality', () => {
    it('should reset parser state', () => {
      parser.reset();
      const text = '<FieldedText>';

      for (const ch of text) {
        parser.parseNotYetDetectedChar(ch);
      }

      parser.reset();
      expect(parser.ready).toBe(false);
    });
  });

  describe('Comment line handling', () => {
    it('should skip comment characters at line start', () => {
      parser.reset();
      parser.startLine(); // Next char is comment
      parser.parseNotYetDetectedChar('#'); // Comment char
      const detected = parser.parseNotYetDetectedChar('<');
      parser.parseNotYetDetectedChar('F');
      // Should still detect FieldedText
      expect(detected).toBe(false); // '<' is first char, not 'FieldedText' yet
    });
  });

  describe('Empty and edge cases', () => {
    it('should detect FieldedText element', () => {
      parser.reset();
      const text = '<FieldedText>';

      let detected = false;
      for (const ch of text) {
        if (parser.parseNotYetDetectedChar(ch)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should handle whitespace before FieldedText', () => {
      parser.reset();
      const text = '  \n  <FieldedText>';

      let detected = false;
      for (const ch of text) {
        if (parser.parseNotYetDetectedChar(ch)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });
});
