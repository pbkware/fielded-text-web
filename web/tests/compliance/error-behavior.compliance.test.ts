import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import { FtBooleanMetaField, FtDataType, FtIntegerMetaField, FtMeta, FtReader, FtStringMetaField } from '../../src/index.js';

function createBasicMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;

  const nameField = meta.fieldList.new(FtDataType.String);
  (nameField as FtStringMetaField).name = 'Name';
  nameField.headings = ['Name'];

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

describe('FTStd0.9 error behavior compliance', () => {
  it('[FT0.9-ERR-002] rejects extra trailing chars when IgnoreExtraChars=False', () => {
    const meta = createBasicMeta();
    meta.ignoreExtraChars = false;

    const reader = new FtReader(meta, 'Name,Age,Active\nAlice,28,True,EXTRA');

    expect(() => reader.read()).toThrow();
    reader.close();
  });

  it('[FT0.9-ERR-001] requires embedded meta section when MetaEmbedded parameter is present', () => {
    // Clause 4.4: if MetaEmbedded is declared, the embedded meta section must be present.
    // A declared file with MetaEmbedded="True" but no XML meta block should throw.
    const declaredText = '|!Fielded Text^| Version="1.1" MetaEmbedded="True"\r\n' + '|!Fielded Text^|\r\n' + 'Alice,28,True\r\n';

    const meta = createBasicMeta();
    // FtReader.open() reads the header immediately; missing embedded meta must throw.
    expect(() => new FtReader(meta, declaredText)).toThrow();
  });

  it('[FT0.9-ERR-003] allows incomplete records only when AllowIncompleteRecords=True', () => {
    // Clause 4.8: AllowIncompleteRecords controls whether short records are accepted.
    // With the default (false), a record with fewer fields than defined must throw.
    const meta = createBasicMeta();
    meta.allowIncompleteRecords = false;

    const readerStrict = new FtReader(
      meta,
      'Name,Age,Active\nAlice\n', // missing Age and Active
    );
    expect(() => readerStrict.read()).toThrow();
    readerStrict.close();

    // With AllowIncompleteRecords=True the same short record must NOT throw.
    const meta2 = createBasicMeta();
    meta2.allowIncompleteRecords = true;

    const readerPermissive = new FtReader(meta2, 'Name,Age,Active\nAlice\n');
    expect(() => readerPermissive.read()).not.toThrow();
    readerPermissive.close();
  });
});
