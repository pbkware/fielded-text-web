import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { describe, expect, it } from 'vitest';
import {
  FtAbortSerializationException,
  FtBooleanMetaField,
  FtBooleanStyles,
  FtDataType,
  FtIntegerMetaField,
  FtMeta,
  FtQuotedType,
  FtReader,
  FtSerialization,
  FtStringMetaField,
  FtStringWriter,
  FtWriter,
  FtWriterSettings,
} from '../src/index.js';

// Helper to create basic CSV meta
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
  (activeField as FtBooleanMetaField).styles = FtBooleanStyles.IgnoreCase;

  const rootSequence = meta.sequenceList.new();
  rootSequence.name = 'Root';
  rootSequence.root = true;
  rootSequence.itemList.new(nameField);
  rootSequence.itemList.new(ageField);
  rootSequence.itemList.new(activeField);

  return meta;
}

describe('FtReader', () => {
  const csvData = `Name,Age,Active
John Doe,30,true
Jane Smith,25,false`;

  it('should construct with meta only', () => {
    const meta = createBasicMeta();
    const reader = new FtReader(meta);

    expect(reader).toBeDefined();
    // Field count is 0 until a header is read or sequence is invoked
    expect(reader.fieldCount).toBe(0);
  });

  it('should construct with meta and input', () => {
    const meta = createBasicMeta();
    const reader = new FtReader(meta, csvData);

    expect(reader).toBeDefined();
    expect(reader.fieldCount).toBe(3);
  });

  it('should read records with constructor input', () => {
    const meta = createBasicMeta();
    const reader = new FtReader(meta, csvData);

    // Record 1
    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('John Doe');
    expect(Number(reader.fieldList.get(1).asBigInt)).toBe(30);
    expect(reader.fieldList.get(2).asBoolean).toBe(true);

    // Record 2
    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Jane Smith');
    expect(Number(reader.fieldList.get(1).asBigInt)).toBe(25);
    expect(reader.fieldList.get(2).asBoolean).toBe(false);

    // EOF
    expect(reader.read()).toBe(false);

    reader.close();
  });

  it('should support no-meta constructor with late meta loading', () => {
    //  No-parameter constructor, then loadMeta and open
    const reader = new FtReader();
    const meta = createBasicMeta();
    reader.loadMeta(meta);
    reader.open(csvData);

    // Should work with meta loaded after construction
    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('John Doe');

    reader.close();
  });

  it('should support no-parameter constructor', () => {
    const reader = new FtReader();
    const meta = createBasicMeta();
    reader.loadMeta(meta);
    reader.open(csvData);

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('John Doe');

    reader.close();
  });

  it('should skip header when immediatelyReadHeader is false', () => {
    const meta = createBasicMeta();
    const reader = new FtReader(meta, csvData, false);

    // Header wasn't read yet, so need to manually read it
    expect(reader.fieldCount).toBe(0);
    reader.readHeader();

    // After reading header, can read records
    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('John Doe');

    reader.close();
  });
});

describe('FtWriter', () => {
  it('should construct with meta only', () => {
    const meta = createBasicMeta();
    const writer = new FtWriter(meta);

    expect(writer).toBeDefined();
    // Field count is 0 until open() is called
    expect(writer.fieldCount).toBe(0);
  });

  it('should construct with meta and output', () => {
    const meta = createBasicMeta();
    const stringWriter = new FtStringWriter();
    const writer = new FtWriter(meta, stringWriter);

    expect(writer).toBeDefined();
    expect(writer.fieldCount).toBe(3);

    writer.close();
  });

  it('should write records', () => {
    const meta = createBasicMeta();
    const stringWriter = new FtStringWriter();
    const writer = new FtWriter(meta, stringWriter);

    writer.writeHeader();

    writer.setFieldValue(0, 'Alice');
    writer.setFieldValue(1, 28);
    writer.setFieldValue(2, true);
    writer.write();

    writer.setFieldValue(0, 'Bob');
    writer.setFieldValue(1, 35);
    writer.setFieldValue(2, false);
    writer.write();

    writer.close();

    const result = stringWriter.toString();
    expect(result).toContain('Name,Age,Active');
    expect(result).toContain('Alice,28,True');
    expect(result).toContain('Bob,35,False');
  });

  it('should support open() with settings', () => {
    const meta = createBasicMeta();
    const writer = new FtWriter(meta);
    const stringWriter = new FtStringWriter();
    const settings: FtWriterSettings = {
      declared: true,
    };

    writer.open(stringWriter, settings);
    writer.writeHeader();
    writer.close();

    const result = stringWriter.toString();
    expect(result).toContain('|!Fielded Text^|');
  });

  it('should handle three-parameter open() overload', () => {
    const meta = createBasicMeta();
    const writer = new FtWriter(meta);
    const stringWriter = new FtStringWriter();
    const settings: FtWriterSettings = {};

    writer.open(stringWriter, true, settings);
    writer.writeHeader();
    writer.close();

    const result = stringWriter.toString();
    expect(result).toContain('Name,Age,Active');
  });
});

describe('FtSerialization', () => {
  it('should construct with meta', () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);

    expect(serializer).toBeDefined();
    expect(FtSerialization.VERSION_MAJOR).toBe(1);
    expect(FtSerialization.VERSION_MINOR).toBe(1);
  });

  it('should deserialize with event hooks', async () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);
    const csvData = `Name,Age,Active
John Doe,30,true
Jane Smith,25,false`;

    const recordsRead: string[] = [];

    serializer.onRecordStarted = (args) => {
      recordsRead.push(`Record ${args.recordIndex} started`);
    };

    serializer.onFieldValueReadReady = (args) => {
      // Track field values as they're read
    };

    await serializer.deserialize(csvData);

    expect(recordsRead.length).toBe(2);
    expect(recordsRead[0]).toBe('Record 0 started');
    expect(recordsRead[1]).toBe('Record 1 started');
    expect(serializer.recordCount).toBe(2);
  });

  it('should deserialize with FtReader', async () => {
    const meta = createBasicMeta();
    const csvData = `Name,Age,Active
Alice,28,true`;

    const reader = new FtReader(meta, csvData);
    const serializer = new FtSerialization(meta);

    let recordCount = 0;
    serializer.onRecordFinished = () => {
      recordCount++;
    };

    await serializer.deserialize(reader);

    expect(recordCount).toBe(1);
  });

  it('should serialize with event hooks and abort', async () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);
    const stringWriter = new FtStringWriter();

    let recordsWritten = 0;

    serializer.onRecordStarted = (args) => {
      if (recordsWritten >= 3) {
        throw new FtAbortSerializationException('Limit reached');
      }
    };

    serializer.onFieldValueWriteReady = (args) => {
      const fieldName = args.field.name;
      if (fieldName === 'Name') {
        args.field.asString = `Person${recordsWritten + 1}`;
      } else if (fieldName === 'Age') {
        args.field.asBigInt = BigInt(20 + recordsWritten);
      } else if (fieldName === 'Active') {
        args.field.asBoolean = recordsWritten % 2 === 0;
      }
    };

    serializer.onRecordFinished = () => {
      recordsWritten++;
    };

    await serializer.serialize(stringWriter);

    expect(recordsWritten).toBe(3);

    const result = stringWriter.toString();
    expect(result).toContain('Person1');
    expect(result).toContain('Person2');
    expect(result).toContain('Person3');
  });

  it('should serialize with FtWriter', async () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);
    const stringWriter = new FtStringWriter();
    const writer = new FtWriter(meta, stringWriter);

    let count = 0;

    writer.writeHeader();

    serializer.onRecordStarted = () => {
      if (count >= 2) {
        throw new FtAbortSerializationException();
      }
    };

    serializer.onFieldValueWriteReady = (args) => {
      if (args.field.name === 'Name') {
        args.field.asString = `Test${count}`;
      } else if (args.field.name === 'Age') {
        args.field.asBigInt = BigInt(count * 10);
      } else {
        args.field.asBoolean = true;
      }
    };

    serializer.onRecordFinished = () => {
      count++;
    };

    await serializer.serialize(writer);

    const result = stringWriter.toString();
    expect(result).toContain('Test0');
    expect(result).toContain('Test1');
    expect(result).not.toContain('Test2');
  });

  it('should provide access to field lists', async () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);
    const csvData = `Name,Age,Active
Test,50,true`;

    await serializer.deserialize(csvData);

    expect(serializer.fieldList).not.toBeNull();
    expect(serializer.fieldList!.count).toBe(3);
    expect(serializer.fieldDefinitionList).not.toBeNull();
    expect(serializer.sequenceList).not.toBeNull();
    expect(serializer.rootSequence).not.toBeNull();
  });

  it('should track record and table counts', async () => {
    const meta = createBasicMeta();
    const serializer = new FtSerialization(meta);
    const csvData = `Name,Age,Active
A,1,true
B,2,false
C,3,true`;

    await serializer.deserialize(csvData);

    expect(serializer.recordCount).toBe(3);
    expect(serializer.tableCount).toBeGreaterThanOrEqual(1);
  });
});

describe('FtReader + FtWriter Integration', () => {
  it('should round-trip data through reader and writer', () => {
    const meta = createBasicMeta();

    // Write
    const stringWriter = new FtStringWriter();
    const writer = new FtWriter(meta, stringWriter);

    writer.writeHeader();
    writer.setFieldValue(0, 'Test User');
    writer.setFieldValue(1, 42);
    writer.setFieldValue(2, true);
    writer.write();
    writer.close();

    const csvText = stringWriter.toString();

    // Read
    const reader = new FtReader(meta, csvText);

    expect(reader.read()).toBe(true);
    expect(reader.fieldList.get(0).asString).toBe('Test User');
    expect(Number(reader.fieldList.get(1).asBigInt)).toBe(42);
    expect(reader.fieldList.get(2).asBoolean).toBe(true);

    reader.close();
  });
});
