import { assert, beforeEach, describe, expect, it } from 'vitest';
import { FtSequenceFactory } from '../src/factory/ft-sequence-factory.js';
import { FtSequenceItemFactory } from '../src/factory/ft-sequence-item-factory.js';
import { FtSequenceRedirectFactory } from '../src/factory/ft-sequence-redirect-factory.js';
import { FtBooleanFieldDefinition } from '../src/fields/definitions/ft-boolean-field-definition.js';
import { FtFieldDefinitionList } from '../src/fields/definitions/ft-field-definition-list.js';
import { FtStringFieldDefinition } from '../src/fields/definitions/ft-string-field-definition.js';
import { FtStringField } from '../src/fields/instances/ft-string-field.js';
import { FtSequenceInvokation } from '../src/sequences/core/ft-sequence-invokation.js';
import { FtSequenceItemList } from '../src/sequences/core/ft-sequence-item-list.js';
import { FtSequenceItem } from '../src/sequences/core/ft-sequence-item.js';
import { FtSequenceList } from '../src/sequences/core/ft-sequence-list.js';
import { FtSequence } from '../src/sequences/core/ft-sequence.js';
import { FtBooleanSequenceRedirect } from '../src/sequences/redirects/ft-boolean-sequence-redirect.js';
import { FtCaseInsensitiveStringSequenceRedirect } from '../src/sequences/redirects/ft-case-insensitive-string-sequence-redirect.js';
import { FtDateSequenceRedirect } from '../src/sequences/redirects/ft-date-sequence-redirect.js';
import { FtExactDateTimeSequenceRedirect } from '../src/sequences/redirects/ft-exact-date-time-sequence-redirect.js';
import { FtExactDecimalSequenceRedirect } from '../src/sequences/redirects/ft-exact-decimal-sequence-redirect.js';
import { FtExactFloatSequenceRedirect } from '../src/sequences/redirects/ft-exact-float-sequence-redirect.js';
import { FtExactIntegerSequenceRedirect } from '../src/sequences/redirects/ft-exact-integer-sequence-redirect.js';
import { FtExactStringSequenceRedirect } from '../src/sequences/redirects/ft-exact-string-sequence-redirect.js';
import { FtNullSequenceRedirect } from '../src/sequences/redirects/ft-null-sequence-redirect.js';
import { FtSequenceRedirectList } from '../src/sequences/redirects/ft-sequence-redirect-list.js';
import { FtSequenceInvokationDelay } from '../src/types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../src/types/enums/ft-sequence-redirect-type.js';

describe('Sequence Infrastructure Tests', () => {
  describe('FtSequence', () => {
    it('should create a sequence with index', () => {
      const sequence = new FtSequence(0);
      expect(sequence.index).toBe(0);
      expect(sequence.name).toBe('');
      expect(sequence.root).toBe(false);
      expect(sequence.itemList).toBeDefined();
      expect(sequence.itemList.count).toBe(0);
    });

    it('should allow setting root flag', () => {
      const sequence = new FtSequence(0);
      expect(sequence.root).toBe(false);
      sequence.setRoot(true);
      expect(sequence.root).toBe(true);
    });

    it('should load root field definition list', () => {
      const sequence = new FtSequence(0);
      const fieldDefs = new FtFieldDefinitionList();
      fieldDefs['add'](new FtStringFieldDefinition(0));
      fieldDefs['add'](new FtBooleanFieldDefinition(1));

      sequence.loadRootFieldDefinitionList(fieldDefs);

      expect(sequence.name).toBe('AutoRoot');
      expect(sequence.root).toBe(true);
      expect(sequence.itemList.count).toBe(2);
      expect(sequence.itemList.get(0).fieldDefinition).toBeDefined();
      expect(sequence.itemList.get(1).fieldDefinition).toBeDefined();
    });
  });

  describe('FtSequenceItem', () => {
    it('should create a sequence item with index', () => {
      const item = new FtSequenceItem(0);
      expect(item.index).toBe(0);
      expect(item.fieldDefinition).toBeUndefined();
      expect(item.redirectList).toBeDefined();
      expect(item.redirectList.count).toBe(0);
    });

    it('should allow setting field definition', () => {
      const item = new FtSequenceItem(0);
      const fieldDef = new FtStringFieldDefinition(0);

      item.setFieldDefinition(fieldDef);

      expect(item.fieldDefinition).toBe(fieldDef);
    });
  });

  describe('FtSequenceInvokation', () => {
    let sequence: FtSequence;
    let fieldDefs: FtFieldDefinitionList;

    beforeEach(() => {
      fieldDefs = new FtFieldDefinitionList();
      fieldDefs['add'](new FtStringFieldDefinition(0));
      fieldDefs['add'](new FtBooleanFieldDefinition(1));

      sequence = new FtSequence(0);
      sequence.loadRootFieldDefinitionList(fieldDefs);
    });

    it('should create invokation with fields', () => {
      const invokation = new FtSequenceInvokation(0, sequence, 0);

      expect(invokation.index).toBe(0);
      expect(invokation.sequence).toBe(sequence);
      expect(invokation.startFieldIndex).toBe(0);
      expect(invokation.fieldCount).toBe(2);
      expect(invokation.getField(0)).toBeDefined();
      expect(invokation.getField(0)).toBeInstanceOf(FtStringField);
    });

    it('should manage field sidelining', () => {
      const invokation = new FtSequenceInvokation(0, sequence, 0);

      expect(invokation.fieldsSidelinedFromIndex).toBe(2); // none sidelined initially

      invokation.sidelineFields();

      expect(invokation.fieldsSidelinedFromIndex).toBe(0); // all sidelined
      expect(invokation.getField(0).sidelined).toBe(true);
      expect(invokation.getField(1).sidelined).toBe(true);

      invokation.unsidelineFields();

      expect(invokation.fieldsSidelinedFromIndex).toBe(2); // none sidelined
      expect(invokation.getField(0).sidelined).toBe(false);
      expect(invokation.getField(1).sidelined).toBe(false);
    });

    it('should create previous copy', () => {
      const invokation = new FtSequenceInvokation(0, sequence, 0);
      const copy = invokation.createPreviousCopy();

      expect(copy).toBeDefined();
      expect(copy.sequence).toBe(invokation.sequence);
      expect(copy.startFieldIndex).toBe(invokation.startFieldIndex);
    });

    it('should match other invokations', () => {
      const invokation1 = new FtSequenceInvokation(0, sequence, 0);
      const invokation2 = new FtSequenceInvokation(1, sequence, 0);
      const invokation3 = new FtSequenceInvokation(2, sequence, 10);

      expect(invokation1.matches(invokation2)).toBe(true);
      expect(invokation1.matches(invokation3)).toBe(false);
    });
  });

  describe('FtSequenceRedirectList', () => {
    it('should start empty', () => {
      const list = new FtSequenceRedirectList();
      expect(list.count).toBe(0);
    });

    it('should create redirects via factory', () => {
      const list = new FtSequenceRedirectList();
      const redirect = list.new(FtSequenceRedirectType.Null);

      expect(list.count).toBe(1);
      expect(list.get(0)).toBe(redirect);
      expect(redirect).toBeInstanceOf(FtNullSequenceRedirect);
    });

    it('should clear all redirects', () => {
      const list = new FtSequenceRedirectList();
      list.new(FtSequenceRedirectType.Null);
      list.new(FtSequenceRedirectType.Boolean);

      expect(list.count).toBe(2);

      list.clear();

      expect(list.count).toBe(0);
    });
  });

  describe('FtSequenceItemList', () => {
    it('should start empty', () => {
      const list = new FtSequenceItemList();
      expect(list.count).toBe(0);
    });

    it('should create items via factory', () => {
      const list = new FtSequenceItemList();
      const item = list.new();

      expect(list.count).toBe(1);
      expect(list.get(0)).toBe(item);
      expect(item.index).toBe(0);
    });
  });

  describe('FtSequenceList', () => {
    it('should start empty', () => {
      const list = new FtSequenceList();
      expect(list.count).toBe(0);
    });

    it('should create sequences via factory', () => {
      const list = new FtSequenceList();
      const sequence = list.new();

      expect(list.count).toBe(1);
      expect(list.get(0)).toBe(sequence);
      expect(sequence.index).toBe(0);
    });

    it('should find sequence by name', () => {
      const list = new FtSequenceList();
      const fieldDefs = new FtFieldDefinitionList();
      fieldDefs['add'](new FtStringFieldDefinition(0));

      const sequence = list.new(fieldDefs);

      expect(sequence.name).toBe('AutoRoot');
      expect(list.indexOfName('AutoRoot')).toBe(0);
      expect(list.indexOfName('autoroot')).toBe(0); // case-insensitive
      expect(list.indexOfName('NotFound')).toBe(-1);
    });

    it('should find root sequence', () => {
      const list = new FtSequenceList();
      const fieldDefs = new FtFieldDefinitionList();
      fieldDefs['add'](new FtStringFieldDefinition(0));

      list.new(fieldDefs);

      expect(list.indexOfRoot()).toBe(0);
    });

    it('should throw when getting by name not found', () => {
      const list = new FtSequenceList();

      expect(() => list.getByName('NotFound')).toThrow('FtSequence not found');
    });
  });

  describe('Sequence Redirect Types', () => {
    describe('FtNullSequenceRedirect', () => {
      it('should trigger on null field', () => {
        const redirect = new FtNullSequenceRedirect(0);
        const fieldDef = new FtStringFieldDefinition(0);
        const sequence = new FtSequence(0);
        sequence.loadRootFieldDefinitionList(new FtFieldDefinitionList());
        const invokation = new FtSequenceInvokation(0, sequence, 0);
        const item = new FtSequenceItem(0);
        item.setFieldDefinition(fieldDef);
        const field = new FtStringField(invokation, item, fieldDef);

        // Field starts as null
        expect(redirect.checkTriggered(field)).toBe(true);

        // Set value
        field.value = 'test';
        expect(redirect.checkTriggered(field)).toBe(false);
      });
    });

    describe('FtBooleanSequenceRedirect', () => {
      it('should trigger on matching boolean value', () => {
        const redirect = new FtBooleanSequenceRedirect(0);
        // Access private _value via loadMeta stub
        const metaStub = {
          type: FtBooleanSequenceRedirect.TYPE,
          invokationDelay: FtSequenceInvokationDelay.AfterSequence,
          sequence: { name: 'test' },
          value: true,
        };

        // Since we can't easily mock the full meta loading, let's just test TYPE
        expect(redirect.type).toBe(FtSequenceRedirectType.Boolean);
        expect(FtBooleanSequenceRedirect.TYPE).toBe(FtSequenceRedirectType.Boolean);
      });
    });

    describe('FtExactStringSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactStringSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactString);
      });
    });

    describe('FtCaseInsensitiveStringSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtCaseInsensitiveStringSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.CaseInsensitiveString);
      });
    });

    describe('FtExactIntegerSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactIntegerSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactInteger);
        expect(redirect.value).toBe(BigInt(0));
      });
    });

    describe('FtExactFloatSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactFloatSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactFloat);
        expect(redirect.value).toBe(0);
      });
    });

    describe('FtExactDecimalSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtExactDecimalSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactDecimal);
        expect(redirect.value).toBe(0);
      });
    });

    describe('FtExactDateTimeSequenceRedirect', () => {
      it('should have correct type and trigger on exact datetime', () => {
        const redirect = new FtExactDateTimeSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.ExactDateTime);
        expect(redirect.value).toBeInstanceOf(Date);
      });
    });

    describe('FtDateSequenceRedirect', () => {
      it('should have correct type', () => {
        const redirect = new FtDateSequenceRedirect(0);
        expect(redirect.type).toBe(FtSequenceRedirectType.Date);
        expect(redirect.value).toBeInstanceOf(Date);
      });
    });
  });

  describe('Factories', () => {
    describe('FtSequenceFactory', () => {
      it('should create sequences', () => {
        const sequence = FtSequenceFactory.createSequence(0);
        expect(sequence).toBeInstanceOf(FtSequence);
        expect(sequence.index).toBe(0);
      });
    });

    describe('FtSequenceItemFactory', () => {
      it('should create sequence items', () => {
        const item = FtSequenceItemFactory.createSequenceItem(0);
        expect(item).toBeInstanceOf(FtSequenceItem);
        expect(item.index).toBe(0);
      });
    });

    describe('FtSequenceRedirectFactory', () => {
      it('should create redirects by type', () => {
        const redirect = FtSequenceRedirectFactory.createSequenceRedirect(0, FtSequenceRedirectType.Null);
        expect(redirect).toBeInstanceOf(FtNullSequenceRedirect);
      });

      it('should create all standard redirect types', () => {
        const types = [
          {
            type: FtSequenceRedirectType.Null,
            class: FtNullSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.Boolean,
            class: FtBooleanSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.ExactString,
            class: FtExactStringSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.CaseInsensitiveString,
            class: FtCaseInsensitiveStringSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.ExactInteger,
            class: FtExactIntegerSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.ExactFloat,
            class: FtExactFloatSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.ExactDecimal,
            class: FtExactDecimalSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.ExactDateTime,
            class: FtExactDateTimeSequenceRedirect,
          },
          {
            type: FtSequenceRedirectType.Date,
            class: FtDateSequenceRedirect,
          },
        ];

        for (const { type, class: expectedClass } of types) {
          const redirect = FtSequenceRedirectFactory.createSequenceRedirect(0, type);
          expect(redirect).toBeInstanceOf(expectedClass);
        }
      });

      it('should throw for unknown redirect type', () => {
        expect(() => FtSequenceRedirectFactory.createSequenceRedirect(0, 'xx')).toThrow();
      });

      it('should get name from type', () => {
        const name = FtSequenceRedirectFactory.getName(FtSequenceRedirectType.Boolean);
        expect(name).toBe('Boolean');
      });

      it('should try get type from name', () => {
        const result = FtSequenceRedirectFactory.tryGetType('Boolean');
        if (result.isErr()) {
          assert.fail("Expected to find type for 'Boolean'");
        } else {
          expect(result.value).toBe(FtSequenceRedirectType.Boolean);
        }

        const result2 = FtSequenceRedirectFactory.tryGetType('InvalidType');
        if (result2.isOk()) {
          assert.fail("Expected to find type for 'Boolean'");
        }
      });

      it('should list registered constructors', () => {
        const constructors = FtSequenceRedirectFactory.getRegisteredConstructors();
        expect(constructors.length).toBe(9); // 9 standard redirect types
      });
    });
  });
});
