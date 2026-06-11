// Comprehensive tests for meta sequence classes
import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaSequenceRedirect,
  FtCaseInsensitiveStringMetaSequenceRedirect,
  FtDateMetaSequenceRedirect,
  FtExactDateTimeMetaSequenceRedirect,
  FtExactDecimalMetaSequenceRedirect,
  FtExactFloatMetaSequenceRedirect,
  FtExactIntegerMetaSequenceRedirect,
  FtExactStringMetaSequenceRedirect,
  FtMetaField,
  FtMetaSequence,
  FtMetaSequenceItem,
  FtMetaSequenceItemList,
  FtMetaSequenceList,
  FtMetaSequenceRedirectList,
  FtNullMetaSequenceRedirect,
  FtSequenceInvokationDelay,
  FtSequenceRedirectType,
  FtStringMetaField,
} from '../src/index.js';

describe('Meta Sequence Classes', () => {
  describe('FtMetaSequence', () => {
    it('should create with default name and root', () => {
      const sequence = new FtMetaSequence();
      expect(sequence.name).toBe('');
      expect(sequence.root).toBe(false);
    });

    it('should allow setting name', () => {
      const sequence = new FtMetaSequence();
      sequence.name = 'TestSequence';
      expect(sequence.name).toBe('TestSequence');
    });

    it('should allow setting root', () => {
      const sequence = new FtMetaSequence();
      sequence.root = true;
      expect(sequence.root).toBe(true);
    });

    it('should trigger rooted event when becoming root', () => {
      const sequence = new FtMetaSequence();
      let eventFired = false;
      let eventSequence: FtMetaSequence | undefined;

      sequence.rootedEvent = (seq) => {
        eventFired = true;
        eventSequence = seq;
      };

      sequence.root = true;

      expect(eventFired).toBe(true);
      expect(eventSequence).toBe(sequence);
    });

    it('should have item list', () => {
      const sequence = new FtMetaSequence();
      expect(sequence.itemList).toBeInstanceOf(FtMetaSequenceItemList);
      expect(sequence.itemList.count).toBe(0);
    });

    it('should support sameName comparison (case insensitive)', () => {
      expect(FtMetaSequence.sameName('Test', 'test')).toBe(true);
      expect(FtMetaSequence.sameName('Test', 'TEST')).toBe(true);
      expect(FtMetaSequence.sameName('Test', 'Other')).toBe(false);
    });

    it('should detect item with undefined field', () => {
      const sequence = new FtMetaSequence();
      sequence.itemList.new(undefined as unknown as FtMetaField); // Explicitly set to undefined
      // Don't set field, leaving it undefined/null

      const result = sequence.anyItemWithUndefinedField();
      expect(result.found).toBe(true);
      expect(result.itemIndex).toBe(0);
    });

    it('should detect item with constant field that has redirects', () => {
      const sequence = new FtMetaSequence();
      const field = new FtStringMetaField();
      const item = sequence.itemList.new(field);
      field.constant = true;
      item.redirectList.new(FtSequenceRedirectType.Null);

      const result = sequence.anyItemWithConstantFieldHasRedirects();
      expect(result.found).toBe(true);
      expect(result.itemIndex).toBe(0);
    });

    it('should reset to defaults on loadDefaults', () => {
      const sequence = new FtMetaSequence();
      sequence.name = 'Changed';
      sequence.root = true;

      sequence.loadDefaults();

      expect(sequence.name).toBe('');
      expect(sequence.root).toBe(false);
    });
  });

  describe('FtMetaSequenceItem', () => {
    it('should create with undefined field', () => {
      const item = new FtMetaSequenceItem(undefined as unknown as FtMetaField); // Explicitly set to undefined
      expect(item.field).toBeUndefined();
    });

    it('should allow setting field', () => {
      const field1 = new FtStringMetaField();
      const item = new FtMetaSequenceItem(field1);
      const field2 = new FtStringMetaField();
      item.field = field2;
      expect(item.field).toBe(field2);
    });

    it('should have redirect list', () => {
      const field = new FtStringMetaField();
      const item = new FtMetaSequenceItem(field);
      expect(item.redirectList).toBeInstanceOf(FtMetaSequenceRedirectList);
      expect(item.redirectList.count).toBe(0);
    });

    it('should detect constant field with redirects', () => {
      const field = new FtStringMetaField();
      const item = new FtMetaSequenceItem(field);
      field.constant = true;
      item.redirectList.new(FtSequenceRedirectType.Null);

      expect(item.hasConstantFieldAndHasRedirects()).toBe(true);
    });

    it('should return false when field is not constant', () => {
      const field = new FtStringMetaField();
      const item = new FtMetaSequenceItem(field);
      field.constant = false;
      item.redirectList.new(FtSequenceRedirectType.Null);

      expect(item.hasConstantFieldAndHasRedirects()).toBe(false);
    });
  });

  describe('FtMetaSequenceItemList', () => {
    it('should start empty', () => {
      const list = new FtMetaSequenceItemList();
      expect(list.count).toBe(0);
    });

    it('should create new item', () => {
      const list = new FtMetaSequenceItemList();
      const field = new FtStringMetaField();
      const item = list.new(field);
      expect(list.count).toBe(1);
      expect(list.get(0)).toBe(item);
    });

    it('should remove item at index', () => {
      const list = new FtMetaSequenceItemList();
      const field1 = new FtStringMetaField();
      const field2 = new FtStringMetaField();
      list.new(field1);
      list.new(field2);
      expect(list.count).toBe(2);

      list.removeAt(0);
      expect(list.count).toBe(1);
    });

    it('should clear all items', () => {
      const list = new FtMetaSequenceItemList();
      const field1 = new FtStringMetaField();
      const field2 = new FtStringMetaField();
      const field3 = new FtStringMetaField();
      list.new(field1);
      list.new(field2);
      list.new(field3);

      list.clear();
      expect(list.count).toBe(0);
    });

    it('should move item to before position', () => {
      const list = new FtMetaSequenceItemList();
      const field1 = new FtStringMetaField();
      const field2 = new FtStringMetaField();
      const field3 = new FtStringMetaField();
      const item1 = list.new(field1);
      const item2 = list.new(field2);
      const item3 = list.new(field3);

      list.moveItemToBefore(2, 0); // Move item3 to before item1

      expect(list.get(0)).toBe(item3);
      expect(list.get(1)).toBe(item1);
      expect(list.get(2)).toBe(item2);
    });

    it('should move item to after position', () => {
      const list = new FtMetaSequenceItemList();
      const field1 = new FtStringMetaField();
      const field2 = new FtStringMetaField();
      const field3 = new FtStringMetaField();
      const item1 = list.new(field1);
      const item2 = list.new(field2);
      const item3 = list.new(field3);

      list.moveItemToAfter(0, 2); // Move item1 to after item3

      expect(list.get(0)).toBe(item2);
      expect(list.get(1)).toBe(item3);
      expect(list.get(2)).toBe(item1);
    });
  });

  describe('FtMetaSequenceList', () => {
    it('should start empty', () => {
      const list = new FtMetaSequenceList();
      expect(list.count).toBe(0);
    });

    it('should create new sequence', () => {
      const list = new FtMetaSequenceList();
      const sequence = list.new();
      expect(list.count).toBe(1);
      expect(list.get(0)).toBe(sequence);
    });

    it('should find sequence by name', () => {
      const list = new FtMetaSequenceList();
      const seq = list.new();
      seq.name = 'TestSeq';

      expect(list.indexOfName('TestSeq')).toBe(0);
      expect(list.indexOfName('TESTSEQ')).toBe(0); // Case insensitive
      expect(list.indexOfName('Missing')).toBe(-1);
    });

    it('should get sequence by name', () => {
      const list = new FtMetaSequenceList();
      const seq = list.new();
      seq.name = 'TestSeq';

      const found = list.getByName('TestSeq');
      expect(found).toBe(seq);
    });

    it('should throw when getting non-existent sequence by name', () => {
      const list = new FtMetaSequenceList();
      expect(() => list.getByName('Missing')).toThrow();
    });

    it('should find root sequence', () => {
      const list = new FtMetaSequenceList();
      list.new();
      const rootSeq = list.new();
      rootSeq.root = true;
      list.new();

      expect(list.indexOfRoot()).toBe(1);
    });

    it('should ensure only one root sequence', () => {
      const list = new FtMetaSequenceList();
      const seq1 = list.new();
      const seq2 = list.new();

      seq1.root = true;
      expect(seq1.root).toBe(true);
      expect(seq2.root).toBe(false);

      seq2.root = true;
      expect(seq1.root).toBe(false);
      expect(seq2.root).toBe(true);
    });

    it('should detect more than one root', () => {
      const list = new FtMetaSequenceList();
      const seq1 = list.new();
      seq1.name = 'First';
      seq1.root = true;

      const result = list.isMoreThanOneRoot();
      expect(result.found).toBe(false);
    });

    it('should detect duplicate names', () => {
      const list = new FtMetaSequenceList();
      const seq1 = list.new();
      seq1.name = 'Test';
      const seq2 = list.new();
      seq2.name = 'Test';

      const result = list.hasDuplicateName();
      expect(result.found).toBe(true);
      expect(result.duplicateName).toBe('Test');
    });

    it('should remove sequence', () => {
      const list = new FtMetaSequenceList();
      const seq = list.new();
      expect(list.count).toBe(1);

      list.remove(seq);
      expect(list.count).toBe(0);
    });

    it('should clear all sequences', () => {
      const list = new FtMetaSequenceList();
      list.new();
      list.new();
      list.new();

      list.clear();
      expect(list.count).toBe(0);
    });
  });

  describe('Meta Sequence Redirects', () => {
    describe('FtNullMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtNullMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.Null);
      });

      it('should have default invokation delay', () => {
        const redirect = new FtNullMetaSequenceRedirect();
        expect(redirect.invokationDelay).toBe(FtSequenceInvokationDelay.AfterField);
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
    });

    describe('FtExactStringMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactStringMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactString);
      });

      it('should have default empty string value', () => {
        const redirect = new FtExactStringMetaSequenceRedirect();
        expect(redirect.value).toBe('');
      });

      it('should allow setting value', () => {
        const redirect = new FtExactStringMetaSequenceRedirect();
        redirect.value = 'test';
        expect(redirect.value).toBe('test');
      });
    });

    describe('FtCaseInsensitiveStringMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.CaseInsensitiveString);
      });

      it('should have default empty string value', () => {
        const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
        expect(redirect.value).toBe('');
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

      it('should allow setting bigint value', () => {
        const redirect = new FtExactIntegerMetaSequenceRedirect();
        redirect.value = BigInt(42);
        expect(redirect.value).toBe(BigInt(42));
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

      it('should allow setting number value', () => {
        const redirect = new FtExactFloatMetaSequenceRedirect();
        redirect.value = 3.14;
        expect(redirect.value).toBeCloseTo(3.14);
      });
    });

    describe('FtExactDecimalMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactDecimalMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactDecimal);
      });

      it('should have default value of 0', () => {
        const redirect = new FtExactDecimalMetaSequenceRedirect();
        expect(redirect.value).toBe(0);
      });
    });

    describe('FtExactDateTimeMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactDateTimeMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactDateTime);
      });

      it('should have default epoch value', () => {
        const redirect = new FtExactDateTimeMetaSequenceRedirect();
        expect(redirect.value).toEqual(new Date(0));
      });

      it('should allow setting date value', () => {
        const redirect = new FtExactDateTimeMetaSequenceRedirect();
        const testDate = new Date(2024, 0, 15);
        redirect.value = testDate;
        expect(redirect.value).toEqual(testDate);
      });
    });

    describe('FtDateMetaSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtDateMetaSequenceRedirect();
        expect(redirect.type).toBe(FtSequenceRedirectType.Date);
      });

      it('should strip time component from value', () => {
        const redirect = new FtDateMetaSequenceRedirect();
        const dateWithTime = new Date(2024, 0, 15, 14, 30, 45);
        redirect.value = dateWithTime;

        // Should only have date part (midnight)
        expect(redirect.value.getHours()).toBe(0);
        expect(redirect.value.getMinutes()).toBe(0);
        expect(redirect.value.getSeconds()).toBe(0);
        expect(redirect.value.getMilliseconds()).toBe(0);
        expect(redirect.value.getDate()).toBe(15);
        expect(redirect.value.getMonth()).toBe(0);
        expect(redirect.value.getFullYear()).toBe(2024);
      });
    });

    describe('FtMetaSequenceRedirectList', () => {
      it('should start empty', () => {
        const list = new FtMetaSequenceRedirectList();
        expect(list.count).toBe(0);
      });

      it('should create redirects of specified type', () => {
        const list = new FtMetaSequenceRedirectList();

        const nullRedirect = list.new(FtSequenceRedirectType.Null);
        expect(nullRedirect).toBeInstanceOf(FtNullMetaSequenceRedirect);

        const boolRedirect = list.new(FtSequenceRedirectType.Boolean);
        expect(boolRedirect).toBeInstanceOf(FtBooleanMetaSequenceRedirect);

        const stringRedirect = list.new(FtSequenceRedirectType.ExactString);
        expect(stringRedirect).toBeInstanceOf(FtExactStringMetaSequenceRedirect);

        expect(list.count).toBe(3);
      });

      it('should remove redirect', () => {
        const list = new FtMetaSequenceRedirectList();
        const redirect = list.new(FtSequenceRedirectType.Null);
        expect(list.count).toBe(1);

        list.remove(redirect);
        expect(list.count).toBe(0);
      });

      it('should clear all redirects', () => {
        const list = new FtMetaSequenceRedirectList();
        list.new(FtSequenceRedirectType.Null);
        list.new(FtSequenceRedirectType.Boolean);
        list.new(FtSequenceRedirectType.ExactString);

        list.clear();
        expect(list.count).toBe(0);
      });
    });

    describe('Redirect copy functionality', () => {
      it('should copy boolean redirect with value', () => {
        const sourceList = new FtMetaSequenceList();
        const targetList = new FtMetaSequenceList();

        const sourceSeq = sourceList.new();
        const targetSeq = targetList.new();

        const original = new FtBooleanMetaSequenceRedirect();
        original.value = true;
        original.sequence = sourceSeq;

        const copy = original.createCopy(targetList, sourceList);
        expect(copy).toBeInstanceOf(FtBooleanMetaSequenceRedirect);
        expect((copy as FtBooleanMetaSequenceRedirect).value).toBe(true);
        expect(copy.sequence).toBe(targetSeq);
      });

      it('should copy string redirect with value', () => {
        const sourceList = new FtMetaSequenceList();
        const targetList = new FtMetaSequenceList();

        const original = new FtExactStringMetaSequenceRedirect();
        original.value = 'test';

        const copy = original.createCopy(targetList, sourceList);
        expect((copy as FtExactStringMetaSequenceRedirect).value).toBe('test');
      });

      it('should copy integer redirect with bigint value', () => {
        const sourceList = new FtMetaSequenceList();
        const targetList = new FtMetaSequenceList();

        const original = new FtExactIntegerMetaSequenceRedirect();
        original.value = BigInt(999);

        const copy = original.createCopy(targetList, sourceList);
        expect((copy as FtExactIntegerMetaSequenceRedirect).value).toBe(BigInt(999));
      });
    });
  });
});
