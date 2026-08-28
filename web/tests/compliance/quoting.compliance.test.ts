import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import { FtDataType, FtMeta, FtQuotedType, FtReader, FtStringMetaField, FtStringWriter, FtWriter } from '../../src/index.js';

function createQuotedStringMeta(): FtMeta {
  const meta = new FtMeta();
  meta.culture = new DotNetLocaleSettings('en-US');
  meta.delimiterChar = ',';
  meta.headingLineCount = 1;
  meta.stuffedEmbeddedQuotes = true;

  const textField = meta.fieldList.new(FtDataType.String);
  (textField as FtStringMetaField).name = 'Text';
  textField.headings = ['Text'];
  textField.valueQuotedType = FtQuotedType.Optional;

  const rootSequence = meta.sequenceList.new();
  rootSequence.name = 'Root';
  rootSequence.root = true;
  rootSequence.itemList.new(textField);

  return meta;
}

describe('FTStd0.9 quoting compliance', () => {
  it('[FT0.9-QUOTE-002] parses stuffed embedded quotes when enabled', () => {
    const meta = createQuotedStringMeta();
    const reader = new FtReader(meta, 'Text\n"She said ""Hello"""');

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('She said "Hello"');
    expect(reader.read()).toBe(false);
    reader.close();
  });

  it('[FT0.9-QUOTE-001] parses quoted field containing delimiter per clause 4.10.7', () => {
    const meta = createQuotedStringMeta();
    const reader = new FtReader(meta, 'Text\n"Alpha, Beta"');

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Alpha, Beta');
    expect(reader.read()).toBe(false);
    reader.close();
  });

  it('[FT0.9-QUOTE-003] writer applies standard string quoting per clause 5.1.6', () => {
    const meta = createQuotedStringMeta();
    const output = new FtStringWriter();
    const writer = new FtWriter(meta, output);

    writer.writeHeader();
    writer.setFieldValue(0, 'Say "Hello"');
    writer.write();
    writer.close();

    const text = output.toString();
    expect(text).toContain('"Say ""Hello"""');
  });
});
