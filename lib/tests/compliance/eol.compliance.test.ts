import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtDataType,
  FtEndOfLineType,
  FtIntegerMetaField,
  FtLastLineEndedType,
  FtMeta,
  FtQuotedType,
  FtReader,
  FtStringMetaField,
  FtStringWriter,
  FtWriter,
} from '../../src/index.js';

function createCrLfMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;
  meta.endOfLineType = FtEndOfLineType.CrLf;

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

describe('FTStd0.9 end-of-line compliance', () => {
  it('[FT0.9-EOL-001] parses records with EndOfLineType=CrLf', () => {
    const meta = createCrLfMeta();
    const input = 'Name,Age,Active\r\nAlice,28,True\r\nBob,35,False\r\n';
    const reader = new FtReader(meta, input);

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Alice');

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Bob');

    expect(reader.read()).toBe(false);
    reader.close();
  });

  it('[FT0.9-EOL-003] treats EOL chars as value text in quoted fields when enabled', () => {
    const meta = createCrLfMeta();
    meta.allowEndOfLineCharInQuotes = true;

    // Reconfigure to a single string field to isolate quoted multiline behavior.
    meta.fieldList.clear();
    meta.sequenceList.clear();

    const textField = meta.fieldList.new(FtDataType.String);
    (textField as FtStringMetaField).name = 'Text';
    textField.headings = ['Text'];
    textField.valueQuotedType = FtQuotedType.Optional;

    const rootSequence = meta.sequenceList.new();
    rootSequence.name = 'Root';
    rootSequence.root = true;
    rootSequence.itemList.new(textField);

    const input = 'Text\r\n"Line1\r\nLine2"\r\n';
    const reader = new FtReader(meta, input);

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toMatch(/Line1\r?\nLine2/);
    expect(reader.read()).toBe(false);
    reader.close();
  });

  it('[FT0.9-EOL-002] enforces LastLineEndedType semantics per clause 3.7.1.3', () => {
    const meta = createCrLfMeta();
    meta.lastLineEndedType = FtLastLineEndedType.Always;

    const alwaysOutput = new FtStringWriter();
    const alwaysWriter = new FtWriter(meta, alwaysOutput);
    alwaysWriter.writeHeader();
    alwaysWriter.setFieldValue(0, 'Alice');
    alwaysWriter.setFieldValue(1, 28);
    alwaysWriter.setFieldValue(2, true);
    alwaysWriter.write();
    alwaysWriter.close();

    meta.lastLineEndedType = FtLastLineEndedType.Never;

    const neverOutput = new FtStringWriter();
    const neverWriter = new FtWriter(meta, neverOutput);
    neverWriter.writeHeader();
    neverWriter.setFieldValue(0, 'Alice');
    neverWriter.setFieldValue(1, 28);
    neverWriter.setFieldValue(2, true);
    neverWriter.write();
    neverWriter.close();

    expect(alwaysOutput.toString().endsWith('\r\n')).toBe(true);
    expect(neverOutput.toString().endsWith('\r\n')).toBe(false);
  });
});
