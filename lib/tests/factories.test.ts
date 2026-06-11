import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtBooleanMetaSequenceRedirect,
  FtDataType,
  FtDateTimeMetaField,
  FtDecimalMetaField,
  FtExactStringMetaSequenceRedirect,
  FtFieldFactory,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtMeta,
  FtMetaConstructor,
  FtMetaFactory,
  FtMetaSequence,
  FtMetaSequenceItem,
  FtMetaSubstitution,
  FtSequenceRedirectType,
  FtStringMetaField,
  FtSubstitution,
  FtSubstitutionConstructor,
  FtSubstitutionFactory,
  FtSubstitutionType,
} from '../src/index.js';

describe('Factory Classes', () => {
  describe('FtMetaFactory', () => {
    let originalConstructor: FtMetaConstructor;

    beforeEach(() => {
      originalConstructor = FtMetaFactory.getConstructor();
    });

    afterEach(() => {
      FtMetaFactory.setConstructor(originalConstructor);
    });

    it('should create default FtMeta instance', () => {
      const meta = FtMetaFactory.createMeta();
      expect(meta).toBeInstanceOf(FtMeta);
      expect(meta.culture.name).toBe('en-US');
      expect(meta.delimiterChar).toBe(',');
    });

    it('should use FtMeta.create() to create meta via factory', () => {
      const meta = FtMeta.create();
      expect(meta).toBeInstanceOf(FtMeta);
      expect(meta.fieldList.count).toBe(0);
    });

    it('should allow custom constructor', () => {
      class CustomMetaConstructor extends FtMetaConstructor {
        createMeta(): FtMeta {
          const meta = super.createMeta();
          meta.delimiterChar = ';';
          meta.quoteChar = "'";
          return meta;
        }
      }

      FtMetaFactory.setConstructor(new CustomMetaConstructor());
      const meta = FtMetaFactory.createMeta();

      expect(meta.delimiterChar).toBe(';');
      expect(meta.quoteChar).toBe("'");
    });

    it('should use custom constructor with FtMeta.create()', () => {
      class CustomMetaConstructor extends FtMetaConstructor {
        createMeta(): FtMeta {
          const meta = super.createMeta();
          meta.lineCommentChar = '#';
          return meta;
        }
      }

      FtMetaFactory.setConstructor(new CustomMetaConstructor());
      const meta = FtMeta.create();

      expect(meta.lineCommentChar).toBe('#');
    });
  });

  describe('FtSubstitutionFactory', () => {
    let originalConstructor: FtSubstitutionConstructor;

    beforeEach(() => {
      originalConstructor = FtSubstitutionFactory.getConstructor();
    });

    afterEach(() => {
      FtSubstitutionFactory.setConstructor(originalConstructor);
    });

    it('should create FtSubstitution instance', () => {
      const sub = FtSubstitutionFactory.createSubstitution(0);
      // FtSubstitution is a simple data class
      expect(sub.id).toBe(0);
      expect(sub.token).toBe('');
      expect(sub.value).toBe('');
    });

    it('should create FtMetaSubstitution instance', () => {
      const metaSub = FtSubstitutionFactory.createMetaSubstitution();
      expect(metaSub).toBeInstanceOf(FtMetaSubstitution);
      expect(metaSub.id).toBe(0);
    });

    it('should use factory in FtSubstitutionList.new()', () => {
      const meta = new FtMeta();
      const sub1 = meta.substitutionList.new(FtSubstitutionType.String, 'NAME', 'John');
      sub1.token = 'NAME';
      sub1.value = 'John';

      const sub2 = meta.substitutionList.new(FtSubstitutionType.String, 'AGE', '30');
      sub2.token = 'AGE';
      sub2.value = '30';

      expect(meta.substitutionList.count).toBe(2);
      expect(sub1.id).toBe(0);
      expect(sub2.id).toBe(1);
    });

    it('should use factory in FtMetaSubstitutionList.new()', () => {
      const meta = new FtMeta();
      const metaSub = meta.substitutionList.new(FtSubstitutionType.String, 'TEST', 'Value');
      metaSub.token = 'TEST';

      expect(meta.substitutionList.count).toBe(1);
      expect(metaSub.token).toBe('TEST');
    });

    it('should allow custom constructor', () => {
      class CustomSubstitutionConstructor extends FtSubstitutionConstructor {
        createSubstitution(index: number): FtSubstitution {
          const sub = super.createSubstitution(index);
          sub.token = `AUTO_${index}`;
          return sub;
        }

        createMetaSubstitution(): FtMetaSubstitution {
          const metaSub = super.createMetaSubstitution();
          metaSub.token = 'AUTO_META';
          return metaSub;
        }
      }

      FtSubstitutionFactory.setConstructor(new CustomSubstitutionConstructor());

      const sub = FtSubstitutionFactory.createSubstitution(5);
      expect(sub.token).toBe('AUTO_5');

      const metaSub = FtSubstitutionFactory.createMetaSubstitution();
      expect(metaSub.token).toBe('AUTO_META');
    });
  });

  describe('FtFieldFactory', () => {
    it('should create field definitions for all data types', () => {
      const stringDef = FtFieldFactory.createFieldDefinition(FtDataType.String, 0);
      expect(stringDef.dataType).toBe(FtDataType.String);
      expect(stringDef.index).toBe(0);

      const boolDef = FtFieldFactory.createFieldDefinition(FtDataType.Boolean, 1);
      expect(boolDef.dataType).toBe(FtDataType.Boolean);
      expect(boolDef.index).toBe(1);

      const intDef = FtFieldFactory.createFieldDefinition(FtDataType.Integer, 2);
      expect(intDef.dataType).toBe(FtDataType.Integer);
      expect(intDef.index).toBe(2);

      const floatDef = FtFieldFactory.createFieldDefinition(FtDataType.Float, 3);
      expect(floatDef.dataType).toBe(FtDataType.Float);
      expect(floatDef.index).toBe(3);

      const decimalDef = FtFieldFactory.createFieldDefinition(FtDataType.Decimal, 4);
      expect(decimalDef.dataType).toBe(FtDataType.Decimal);
      expect(decimalDef.index).toBe(4);

      const dateDef = FtFieldFactory.createFieldDefinition(FtDataType.DateTime, 5);
      expect(dateDef.dataType).toBe(FtDataType.DateTime);
      expect(dateDef.index).toBe(5);
    });

    it('should create meta fields for all data types', () => {
      const stringMeta = FtFieldFactory.createMetaField(FtDataType.String, 1);
      expect(stringMeta).toBeInstanceOf(FtStringMetaField);

      const boolMeta = FtFieldFactory.createMetaField(FtDataType.Boolean, 1);
      expect(boolMeta).toBeInstanceOf(FtBooleanMetaField);

      const intMeta = FtFieldFactory.createMetaField(FtDataType.Integer, 1);
      expect(intMeta).toBeInstanceOf(FtIntegerMetaField);

      const floatMeta = FtFieldFactory.createMetaField(FtDataType.Float, 1);
      expect(floatMeta).toBeInstanceOf(FtFloatMetaField);

      const decimalMeta = FtFieldFactory.createMetaField(FtDataType.Decimal, 1);
      expect(decimalMeta).toBeInstanceOf(FtDecimalMetaField);

      const dateMeta = FtFieldFactory.createMetaField(FtDataType.DateTime, 1);
      expect(dateMeta).toBeInstanceOf(FtDateTimeMetaField);
    });

    it('should be used by FtMetaFieldList.new()', () => {
      const meta = new FtMeta();
      const field = meta.fieldList.new(FtDataType.String);
      expect(field).toBeInstanceOf(FtStringMetaField);
      expect(meta.fieldList.count).toBe(1);
    });
  });

  describe('FtSequenceFactory', () => {
    it('should  not be needed for meta sequences', () => {
      // FtMetaSequenceList creates FtMetaSequence instances directly
      // FtSequenceFactory is for runtime FtSequence creation during deserialization
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      expect(seq).toBeInstanceOf(FtMetaSequence);
      expect(meta.sequenceList.count).toBe(1);
    });
  });

  describe('FtSequenceItemFactory', () => {
    it('should not be needed for meta sequence items', () => {
      // FtMetaSequenceItemList creates FtMetaSequenceItem instances directly
      // FtSequenceItemFactory is for runtime FtSequenceItem creation during deserialization
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.String);
      const item = seq.itemList.new(field);
      expect(item).toBeInstanceOf(FtMetaSequenceItem);
      expect(seq.itemList.count).toBe(1);
    });
  });

  describe('FtSequenceRedirectFactory', () => {
    it('should create meta sequence redirects via redirect list', () => {
      const meta = new FtMeta();
      const seq = meta.sequenceList.new();
      const field = meta.fieldList.new(FtDataType.Decimal);
      const item = seq.itemList.new(field);

      // Redirect list is on the sequence item, not sequence
      const boolRedirect = item.redirectList.new(FtSequenceRedirectType.Boolean);
      expect(boolRedirect).toBeInstanceOf(FtBooleanMetaSequenceRedirect);

      const stringRedirect = item.redirectList.new(FtSequenceRedirectType.ExactString);
      expect(stringRedirect).toBeInstanceOf(FtExactStringMetaSequenceRedirect);

      expect(item.redirectList.count).toBe(2);
    });
  });

  describe('Factory Integration', () => {
    it('should work together to build complete meta', () => {
      const meta = FtMetaFactory.createMeta();
      meta.delimiterChar = '|';

      // Add fields using FtFieldFactory (via FtMetaFieldList.new)
      const nameField = meta.fieldList.new(FtDataType.String) as FtStringMetaField;
      nameField.name = 'Name';

      const ageField = meta.fieldList.new(FtDataType.Integer) as FtIntegerMetaField;
      ageField.name = 'Age';

      // Add sequence
      const sequence = meta.sequenceList.new();
      sequence.name = 'Person';
      sequence.root = true;

      // Add sequence items
      const item1 = sequence.itemList.new(nameField);

      const item2 = sequence.itemList.new(ageField);

      // Add sequence redirect (on item, not sequence)
      const redirect = item1.redirectList.new(FtSequenceRedirectType.Boolean) as FtBooleanMetaSequenceRedirect;
      redirect.value = true;

      // Add substitution using FtSubstitutionFactory
      const sub = meta.substitutionList.new(FtSubstitutionType.String, 'DEFAULT_NAME', 'Unknown');

      // Verify everything was created correctly
      expect(meta.fieldList.count).toBe(2);
      expect(meta.sequenceList.count).toBe(1);
      expect(sequence.itemList.count).toBe(2);
      expect(item1.redirectList.count).toBe(1);
      expect(meta.substitutionList.count).toBe(1);
    });

    it('should allow complete customization via factory constructors', () => {
      // Custom meta with different defaults
      class CustomMetaConstructor extends FtMetaConstructor {
        createMeta(): FtMeta {
          const meta = super.createMeta();
          meta.delimiterChar = '\t';
          meta.quoteChar = "'";
          return meta;
        }
      }

      FtMetaFactory.setConstructor(new CustomMetaConstructor());

      const meta = FtMeta.create();
      const field = meta.fieldList.new(FtDataType.String);
      const seq = meta.sequenceList.new();

      expect(meta.delimiterChar).toBe('\t');
      expect(meta.quoteChar).toBe("'");
      expect(field).toBeInstanceOf(FtStringMetaField);
      expect(seq).toBeInstanceOf(FtMetaSequence);

      // Restore defaults
      FtMetaFactory.setConstructor(new FtMetaConstructor());
    });
  });
});
