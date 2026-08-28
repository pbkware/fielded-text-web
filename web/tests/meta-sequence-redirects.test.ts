// Comprehensive tests for meta sequence redirect classes

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
} from '../src/index.js';
import { FtMeta } from '../src/meta/ft-meta.js';
import { FtSequenceInvokationDelay } from '../src/types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../src/types/enums/ft-sequence-redirect-type.js';

describe('FtNullMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtNullMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.Null);
  });

  it('should have default invokation delay', () => {
    const redirect = new FtNullMetaSequenceRedirect();
    expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterField);
  });

  it('should allow setting sequence', () => {
    const meta = new FtMeta();
    const seq = meta.sequenceList.new();
    seq.name = 'TestSeq';

    const redirect = new FtNullMetaSequenceRedirect();
    redirect.sequence = seq;

    expect(redirect.sequence).toBe(seq);
  });

  it('should create a copy', () => {
    const meta = new FtMeta();
    const seq1 = meta.sequenceList.new();
    seq1.name = 'Seq1';

    const redirect = new FtNullMetaSequenceRedirect();
    redirect.sequence = seq1;
    redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect(copy).toBeInstanceOf(FtNullMetaSequenceRedirect);
    expect(copy.sequence).toBe(seq1);
    expect(copy.invokationDelay).toBe(FtSequenceInvokationDelay.AfterSequence);
  });
});

describe('FtBooleanMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtBooleanMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.Boolean);
  });

  it('should have default value of false', () => {
    const redirect = new FtBooleanMetaSequenceRedirect();
    expect(redirect.value).toBe(false);
  });

  it('should allow setting value', () => {
    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.value = true;
    expect(redirect.value).toBe(true);
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.value = true;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtBooleanMetaSequenceRedirect).value).toBe(true);
  });

  it('should reset to defaults', () => {
    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.value = true;
    redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;

    redirect.loadDefaults();

    expect(redirect.value).toBe(false);
    expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterField);
  });
});

describe('FtExactStringMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtExactStringMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.ExactString);
  });

  it('should have default value of empty string', () => {
    const redirect = new FtExactStringMetaSequenceRedirect();
    expect(redirect.value).toBe('');
  });

  it('should allow setting value', () => {
    const redirect = new FtExactStringMetaSequenceRedirect();
    redirect.value = 'TestValue';
    expect(redirect.value).toBe('TestValue');
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtExactStringMetaSequenceRedirect();
    redirect.value = 'TestValue';

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtExactStringMetaSequenceRedirect).value).toBe('TestValue');
  });
});

describe('FtCaseInsensitiveStringMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.CaseInsensitiveString);
  });

  it('should allow setting value', () => {
    const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
    redirect.value = 'TestValue';
    expect(redirect.value).toBe('TestValue');
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
    redirect.value = 'TestValue';

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtCaseInsensitiveStringMetaSequenceRedirect).value).toBe('TestValue');
  });
});

describe('FtExactIntegerMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtExactIntegerMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.ExactInteger);
  });

  it('should have default value of 0', () => {
    const redirect = new FtExactIntegerMetaSequenceRedirect();
    expect(redirect.value).toBe(BigInt(0));
  });

  it('should allow setting value', () => {
    const redirect = new FtExactIntegerMetaSequenceRedirect();
    redirect.value = BigInt(42);
    expect(redirect.value).toBe(BigInt(42));
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtExactIntegerMetaSequenceRedirect();
    redirect.value = BigInt(42);

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtExactIntegerMetaSequenceRedirect).value).toBe(BigInt(42));
  });
});

describe('FtExactFloatMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtExactFloatMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.ExactFloat);
  });

  it('should have default value of 0', () => {
    const redirect = new FtExactFloatMetaSequenceRedirect();
    expect(redirect.value).toBe(0);
  });

  it('should allow setting value', () => {
    const redirect = new FtExactFloatMetaSequenceRedirect();
    redirect.value = 3.14;
    expect(redirect.value).toBe(3.14);
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtExactFloatMetaSequenceRedirect();
    redirect.value = 3.14;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtExactFloatMetaSequenceRedirect).value).toBe(3.14);
  });
});

describe('FtExactDecimalMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtExactDecimalMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.ExactDecimal);
  });

  it('should allow setting value', () => {
    const redirect = new FtExactDecimalMetaSequenceRedirect();
    redirect.value = 123.45;
    expect(redirect.value).toBe(123.45);
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtExactDecimalMetaSequenceRedirect();
    redirect.value = 123.45;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtExactDecimalMetaSequenceRedirect).value).toBe(123.45);
  });
});

describe('FtExactDateTimeMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtExactDateTimeMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.ExactDateTime);
  });

  it('should have default value of epoch', () => {
    const redirect = new FtExactDateTimeMetaSequenceRedirect();
    expect(redirect.value.getTime()).toBe(0);
  });

  it('should allow setting value', () => {
    const redirect = new FtExactDateTimeMetaSequenceRedirect();
    const date = new Date(2024, 0, 1, 12, 30, 0);
    redirect.value = date;
    expect(redirect.value).toEqual(date);
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtExactDateTimeMetaSequenceRedirect();
    const date = new Date(2024, 0, 1, 12, 30, 0);
    redirect.value = date;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect((copy as FtExactDateTimeMetaSequenceRedirect).value).toEqual(date);
  });
});

describe('FtDateMetaSequenceRedirect', () => {
  it('should have correct type', () => {
    const redirect = new FtDateMetaSequenceRedirect();
    expect(redirect.type).toBe(FtSequenceRedirectType.Date);
  });

  it('should strip time component when setting value', () => {
    const redirect = new FtDateMetaSequenceRedirect();
    const date = new Date(2024, 0, 1, 12, 30, 0);
    redirect.value = date;

    const expected = new Date(2024, 0, 1, 0, 0, 0, 0);
    expect(redirect.value).toEqual(expected);
  });

  it('should copy value when creating copy', () => {
    const meta = new FtMeta();
    const redirect = new FtDateMetaSequenceRedirect();
    const date = new Date(2024, 0, 1, 12, 30, 0);
    redirect.value = date;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    const expected = new Date(2024, 0, 1, 0, 0, 0, 0);
    expect((copy as FtDateMetaSequenceRedirect).value).toEqual(expected);
  });
});

describe('Redirect sequence mapping', () => {
  it('should map sequence correctly when copying between different lists', () => {
    const meta1 = new FtMeta();
    const seq1a = meta1.sequenceList.new();
    seq1a.name = 'Seq1';
    const seq1b = meta1.sequenceList.new();
    seq1b.name = 'Seq2';

    const meta2 = new FtMeta();
    const seq2a = meta2.sequenceList.new();
    seq2a.name = 'Seq1';
    const seq2b = meta2.sequenceList.new();
    seq2b.name = 'Seq2';

    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.sequence = seq1b; // Point to second sequence
    redirect.value = true;

    const copy = redirect.createCopy(meta2.sequenceList, meta1.sequenceList);

    // Should map to second sequence in target list
    expect(copy.sequence).toBe(seq2b);
    expect((copy as FtBooleanMetaSequenceRedirect).value).toBe(true);
  });

  it('should handle undefined sequence when copying', () => {
    const meta = new FtMeta();
    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.sequence = undefined;

    const copy = redirect.createCopy(meta.sequenceList, meta.sequenceList);

    expect(copy.sequence).toBeUndefined();
  });
});

describe('Redirect list operations', () => {
  it('should create redirect of correct type', () => {
    const meta = new FtMeta();
    const seq = meta.sequenceList.new();
    const field = meta.fieldList.new(FtDataType.String);
    const item = seq.itemList.new(field);

    const redirect = item.redirectList.new(FtSequenceRedirectType.Boolean);

    expect(redirect).toBeInstanceOf(FtBooleanMetaSequenceRedirect);
    expect(redirect.type).toBe(FtSequenceRedirectType.Boolean);
  });

  it('should maintain multiple redirects in order', () => {
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

  it('should support all standard redirect types', () => {
    const meta = new FtMeta();
    const seq = meta.sequenceList.new();
    const field = meta.fieldList.new(FtDataType.String);
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

    for (const type of types) {
      const redirect = item.redirectList.new(type);
      expect(redirect.type).toBe(type);
    }
  });
});
