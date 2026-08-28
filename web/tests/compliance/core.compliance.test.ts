import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import { FtBooleanMetaField, FtDataType, FtIntegerMetaField, FtMeta, FtQuotedType, FtReader, FtStringMetaField } from '../../src/index.js';

function createBasicMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;

  const nameField = meta.fieldList.new(FtDataType.String);
  (nameField as FtStringMetaField).name = 'Name';
  nameField.headings = ['Name'];
  nameField.valueQuotedType = FtQuotedType.Optional;

  const ageField = meta.fieldList.new(FtDataType.Integer);
  (ageField as FtIntegerMetaField).name = 'Age';
  ageField.headings = ['Age'];
  (ageField as FtIntegerMetaField).format = 'G';

  const activeField = meta.fieldList.new(FtDataType.Boolean);
  (activeField as FtBooleanMetaField).name = 'Active';
  activeField.headings = ['Active'];

  const rootSequence = meta.sequenceList.new();
  rootSequence.name = 'Root';
  rootSequence.root = true;
  rootSequence.itemList.new(nameField);
  rootSequence.itemList.new(ageField);
  rootSequence.itemList.new(activeField);

  return meta;
}

describe('FTStd0.9 core compliance (provisional)', () => {
  it('[FT0.9-CSV-001] reads simple CSV with a heading line', () => {
    const meta = createBasicMeta();
    const reader = new FtReader(meta, 'Name,Age,Active\nAlice,28,True');

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Alice');
    expect(Number(reader.fieldList.get(1).asBigInt)).toBe(28);
    expect(reader.fieldList.get(2).asBoolean).toBe(true);

    expect(reader.read()).toBe(false);
    reader.close();
  });
});
