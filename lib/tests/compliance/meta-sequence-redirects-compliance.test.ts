/**
 * Compliance tests for FTStd0.9 section 4.13.3 - Sequence Redirect elements
 *
 * Tests verify that the implementation correctly implements the standard's
 * requirements for sequence redirects.
 */

import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaSequenceRedirect,
  FtCaseInsensitiveStringMetaSequenceRedirect,
  FtDataType,
  FtDateMetaSequenceRedirect,
  FtExactDateTimeMetaSequenceRedirect,
  FtExactDecimalMetaSequenceRedirect,
  FtExactFloatMetaSequenceRedirect,
  FtExactIntegerMetaSequenceRedirect,
  FtExactStringMetaSequenceRedirect,
  FtNullMetaSequenceRedirect,
} from '../../src/index.js';
import { FtMeta } from '../../src/meta/ft-meta.js';
import { FtSequenceInvokationDelay } from '../../src/types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../../src/types/enums/ft-sequence-redirect-type.js';

describe('FTStd0.9 §4.13.3 - Sequence Redirect Elements', () => {
  describe('Redirect properties (§4.13.3)', () => {
    it('should have sequence property', () => {
      const meta = new FtMeta();
      const targetSeq = meta.sequenceList.new();
      targetSeq.name = 'TargetSequence';

      const mainSeq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = mainSeq.itemList.new(field);
      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);

      redirect.sequence = targetSeq;
      expect(redirect.sequence).toBe(targetSeq);
    });

    it('should have invokation delay property', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);
      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);

      // Default should be AfterField
      expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterField);

      redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
      expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterSequence);
    });
  });

  describe('Multiple redirects per sequence item (§4.13.3)', () => {
    it('should support multiple redirects on a single sequence item', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect1 = item.redirectList.new(FtSequenceRedirectType.Null);
      const redirect2 = item.redirectList.new(FtSequenceRedirectType.Boolean);
      const redirect3 = item.redirectList.new(FtSequenceRedirectType.ExactString);

      expect(item.redirectList.count).toBe(3);
      expect(item.redirectList.get(0)).toBe(redirect1);
      expect(item.redirectList.get(1)).toBe(redirect2);
      expect(item.redirectList.get(2)).toBe(redirect3);
    });

    it('should maintain redirect order (implicit order)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirects = [];
      for (let i = 0; i < 5; i++) {
        redirects.push(item.redirectList.new(FtSequenceRedirectType.ExactString));
      }

      // Verify order is preserved
      for (let i = 0; i < 5; i++) {
        expect(item.redirectList.get(i)).toBe(redirects[i]);
      }
    });
  });

  describe('Redirect types (§4.13.3)', () => {
    it('should support ExactString redirect type (§4.13.3.a)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.ExactString) as FtExactStringMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.ExactString);
      expect(redirect).toBeInstanceOf(FtExactStringMetaSequenceRedirect);

      redirect.value = 'TestValue';
      expect(redirect.value).toBe('TestValue');
    });

    it('should support CaseInsensitiveString redirect type (§4.13.3.b)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.CaseInsensitiveString) as FtCaseInsensitiveStringMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.CaseInsensitiveString);
      expect(redirect).toBeInstanceOf(FtCaseInsensitiveStringMetaSequenceRedirect);

      redirect.value = 'TestValue';
      expect(redirect.value).toBe('TestValue');
    });

    it('should support Boolean redirect type (§4.13.3.c)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.Boolean) as FtBooleanMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.Boolean);
      expect(redirect).toBeInstanceOf(FtBooleanMetaSequenceRedirect);

      redirect.value = true;
      expect(redirect.value).toBe(true);
    });

    it('should support ExactInteger redirect type (§4.13.3.d)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.ExactInteger);
      expect(redirect).toBeInstanceOf(FtExactIntegerMetaSequenceRedirect);

      redirect.value = BigInt(42);
      expect(redirect.value).toBe(BigInt(42));
    });

    it('should support ExactFloat redirect type (§4.13.3.e)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.ExactFloat) as FtExactFloatMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.ExactFloat);
      expect(redirect).toBeInstanceOf(FtExactFloatMetaSequenceRedirect);

      redirect.value = 3.14159;
      expect(redirect.value).toBe(3.14159);
    });

    it('should support ExactDateTime redirect type (§4.13.3.f)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.ExactDateTime) as FtExactDateTimeMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.ExactDateTime);
      expect(redirect).toBeInstanceOf(FtExactDateTimeMetaSequenceRedirect);

      const testDate = new Date(2024, 0, 15, 14, 30, 0);
      redirect.value = testDate;
      expect(redirect.value).toEqual(testDate);
    });

    it('should support Date redirect type (§4.13.3.g)', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      const seq = meta.sequenceList.new();
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.Date) as FtDateMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.Date);
      expect(redirect).toBeInstanceOf(FtDateMetaSequenceRedirect);

      // Date redirect should ignore time portion
      const testDate = new Date(2024, 0, 15, 14, 30, 0);
      redirect.value = testDate;

      // Time should be stripped (set to midnight)
      const expected = new Date(2024, 0, 15, 0, 0, 0, 0);
      expect(redirect.value).toEqual(expected);
    });

    it('should support ExactDecimal redirect type (§4.13.3.h)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.ExactDecimal) as FtExactDecimalMetaSequenceRedirect;

      expect(redirect.type).toBe(FtSequenceRedirectType.ExactDecimal);
      expect(redirect).toBeInstanceOf(FtExactDecimalMetaSequenceRedirect);

      redirect.value = 123.456;
      expect(redirect.value).toBe(123.456);
    });

    it('should support Null redirect type (§4.13.3.i)', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);

      expect(redirect.type).toBe(FtSequenceRedirectType.Null);
      expect(redirect).toBeInstanceOf(FtNullMetaSequenceRedirect);
    });
  });

  describe('Invokation delay modes (§4.13.3)', () => {
    it('should support AfterField invokation delay', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      const seq = meta.sequenceList.new();
      const item = seq.itemList.new(field);
      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);

      redirect.invokationDelay = FtSequenceInvokationDelay.AfterField;
      expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterField);
    });

    it('should support AfterSequence invokation delay', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      const seq = meta.sequenceList.new();
      const item = seq.itemList.new(field);
      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);

      redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
      expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterSequence);
    });
  });

  describe('Redirect sequencing (§4.13.3)', () => {
    it('should allow redirect to reference another sequence', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      const targetSeq = meta.sequenceList.new();
      targetSeq.name = 'TargetSequence';

      const mainSeq = meta.sequenceList.new();
      mainSeq.name = 'MainSequence';
      const item = mainSeq.itemList.new(field);

      const redirect = item.redirectList.new(FtSequenceRedirectType.Null);
      redirect.sequence = targetSeq;

      expect(redirect.sequence).toBe(targetSeq);
      expect(redirect.sequence?.name).toBe('TargetSequence');
    });

    it('should support multiple sequences being invoked from different redirects', () => {
      const meta = new FtMeta();

      const seq1 = meta.sequenceList.new();
      seq1.name = 'Seq1';
      const seq2 = meta.sequenceList.new();
      seq2.name = 'Seq2';
      const seq3 = meta.sequenceList.new();
      seq3.name = 'Seq3';

      const mainSeq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = mainSeq.itemList.new(field);

      const redirect1 = item.redirectList.new(FtSequenceRedirectType.Null);
      redirect1.sequence = seq1;

      const redirect2 = item.redirectList.new(FtSequenceRedirectType.Boolean);
      redirect2.sequence = seq2;

      const redirect3 = item.redirectList.new(FtSequenceRedirectType.ExactString);
      redirect3.sequence = seq3;

      expect(redirect1.sequence).toBe(seq1);
      expect(redirect2.sequence).toBe(seq2);
      expect(redirect3.sequence).toBe(seq3);
    });
  });

  describe('Redirect metadata copy operations', () => {
    it('should correctly copy redirects when copying redirect lists', () => {
      const meta1 = new FtMeta();
      const seq1 = meta1.sequenceList.new();
      seq1.name = 'Seq1';
      const field1 = meta1.fieldList.new(FtDataType.String);
      const item1 = seq1.itemList.new(field1);

      const redirect1 = item1.redirectList.new(FtSequenceRedirectType.Boolean) as FtBooleanMetaSequenceRedirect;
      redirect1.value = true;
      redirect1.sequence = seq1;

      const meta2 = new FtMeta();
      const seq2 = meta2.sequenceList.new();
      seq2.name = 'Seq1';

      // Copy redirect list
      const field2 = meta2.fieldList.new(FtDataType.String);
      const item2 = seq2.itemList.new(field2);
      item2.redirectList.assign(item1.redirectList, meta2.sequenceList, meta1.sequenceList);

      // Verify redirect was copied
      expect(item2.redirectList.count).toBe(1);
      const copiedRedirect = item2.redirectList.get(0) as FtBooleanMetaSequenceRedirect;
      expect(copiedRedirect.type).toBe(FtSequenceRedirectType.Boolean);
      expect(copiedRedirect.value).toBe(true);
      expect(copiedRedirect.sequence).toBe(seq2); // Should map to equivalent sequence
    });
  });

  describe('Standard compliance summary (§4.13.3)', () => {
    it('should support all 9 standard redirect types', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      const seq = meta.sequenceList.new();
      const item = seq.itemList.new(field);

      const types = [
        FtSequenceRedirectType.Null,
        FtSequenceRedirectType.Boolean,
        FtSequenceRedirectType.ExactString,
        FtSequenceRedirectType.CaseInsensitiveString,
        FtSequenceRedirectType.ExactInteger,
        FtSequenceRedirectType.ExactFloat,
        FtSequenceRedirectType.ExactDecimal,
        FtSequenceRedirectType.ExactDateTime,
        FtSequenceRedirectType.Date,
      ];

      types.forEach((type) => {
        const redirect = item.redirectList.new(type);
        expect(redirect.type).toBe(type);
      });

      expect(item.redirectList.count).toBe(9);
    });

    it('should implement all required redirect properties', () => {
      const meta = new FtMeta();
      const targetSeq = meta.sequenceList.new();
      targetSeq.name = 'Target';

      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);
      const redirect = item.redirectList.new(FtSequenceRedirectType.Boolean);

      // All redirects must have:
      // 1. Type property
      expect(redirect.type).toBeDefined();

      // 2. Sequence property
      redirect.sequence = targetSeq;
      expect(redirect.sequence).toBeDefined();

      // 3. InvokationDelay property
      redirect.invokationDelay = FtSequenceInvokationDelay.AfterField;
      expect(redirect.invokationDelay).toBeDefined();

      // Value redirects must have:
      // 4. Value property (for non-Null redirects)
      if (redirect instanceof FtBooleanMetaSequenceRedirect) {
        redirect.value = true;
        expect(redirect.value).toBeDefined();
      }
    });
  });
});
