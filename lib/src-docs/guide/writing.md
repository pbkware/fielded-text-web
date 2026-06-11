---
title: Writing
---

# Writing Fielded Text Files

This guide covers writing fielded text files using the FieldedText TypeScript library.

## Table of Contents

- [Basic Writing](#basic-writing)
- [Writing to Strings](#writing-to-strings)
- [Writing to Streams](#writing-to-streams)
- [Writing to Node.js Files](#writing-to-nodejs-files)
- [Setting Field Values](#setting-field-values)
- [Heading Lines](#heading-lines)
- [Comment Lines](#comment-lines)
- [Declared Output](#declared-output)
- [Formatting Control](#formatting-control)
- [Event Callbacks](#event-callbacks)
- [Performance Tips](#performance-tips)

## Basic Writing

The basic pattern for writing fielded text:

```typescript
import { SerializationWriter, FtMeta } from 'fielded-text-web';

// 1. Create metadata
const meta = buildMetadata(); // See Metadata Guide

// 2. Create writer
const writer = new SerializationWriter();

// 3. Load metadata
writer.loadMeta(meta);

// 4. Open output sink
const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);

// 5. Write heading line (optional)
writer.writeHeader();

// 6. Write records
writer.fieldList.get(0).asString = 'John Doe';
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.write();

writer.fieldList.get(0).asString = 'Jane Smith';
writer.fieldList.get(1).asBigInt = BigInt(25);
writer.write();

// 7. Close writer
writer.close();

console.log(stringWriter.toString());
```

## Writing to Strings

For in-memory output:

```typescript
const writer = new SerializationWriter();
writer.loadMeta(meta);

// Accumulate output in a stringWriter
const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);

writer.writeHeader();

// Write records
writer.fieldList.get(0).asString = 'Alice';
writer.fieldList.get(1).asBigInt = BigInt(35);
writer.write();

writer.fieldList.get(0).asString = 'Bob';
writer.fieldList.get(1).asBigInt = BigInt(42);
writer.write();

writer.close();

console.log(stringWriter.toString());
// Output:
// Name,Age
// Alice,35
// Bob,42
```

## Writing to Streams

For large files or browser environments, use Web Streams:

```typescript
// Create a WritableStream
let output = '';
const stream = new WritableStream<string>({
  write(chunk) {
    output += chunk;
  },
  close() {
    console.log('Stream closed');
  },
});

// Get writer
const streamWriter = stream.getWriter();

// Use with SerializationWriter
const writer = new SerializationWriter();
writer.loadMeta(meta);
writer.openWriter(streamWriter);

writer.writeHeader();

writer.fieldList.get(0).asString = 'John';
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.write();

writer.close();
await streamWriter.close();

console.log(output);
```

## Writing to Node.js Files

For Node.js file system access:

```typescript
import { FtNodeWriter } from 'fielded-text-web';
import { createWriteStream } from 'node:fs';

const fileStream = createWriteStream('output.csv', { encoding: 'utf8' });

const writer = new FtNodeWriter();
writer.loadMeta(meta);
writer.openNodeStream(fileStream);

writer.writeHeader();

// Write records
writer.fieldList.get(0).asString = 'John Doe';
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.write();

writer.fieldList.get(0).asString = 'Jane Smith';
writer.fieldList.get(1).asBigInt = BigInt(25);
writer.write();

writer.close();
```

### Writing Large Files

For very large files, flush periodically:

```typescript
import { FtNodeWriter } from 'fielded-text-web';
import { createWriteStream } from 'node:fs';

const fileStream = createWriteStream('huge-output.csv', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024, // 64KB buffer
});

const writer = new FtNodeWriter();
writer.loadMeta(meta);
writer.openNodeStream(fileStream);

writer.writeHeader();

// Write many records
for (let i = 0; i < 1000000; i++) {
  writer.fieldList.get(0).asString = `Customer ${i}`;
  writer.fieldList.get(1).asBigInt = BigInt(i);
  writer.fieldList.get(2).asDecimal = i * 19.99;
  writer.write();

  // Log progress
  if (i % 10000 === 0) {
    console.log(`Written ${i} records...`);
  }
}

writer.close();
```

## Setting Field Values

### By Index

```typescript
writer.fieldList.get(0).asString = 'John Doe';
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.fieldList.get(2).asBoolean = true;
writer.fieldList.get(3).asFloat = 98.6;
writer.fieldList.get(4).asDecimal = 19.99;
writer.fieldList.get(5).asDateTime = new Date();
writer.write();
```

### Type-Safe Writing

```typescript
interface CustomerRecord {
  name: string;
  age: number;
  active: boolean;
}

function writeCustomerRecord(writer: SerializationWriter, record: CustomerRecord): void {
  writer.fieldList.get(0).asString = record.name;
  writer.fieldList.get(1).asBigInt = BigInt(record.age);
  writer.fieldList.get(2).asBoolean = record.active;
}

const customers: CustomerRecord[] = [
  { name: 'John Doe', age: 30, active: true },
  { name: 'Jane Smith', age: 25, active: false },
];

for (const customer of customers) {
  writeCustomerRecord(writer, customer);
  writer.write();
}
```

### Null Values

```typescript
// Set field to null
writer.fieldList.get(0).setNull();
writer.write();

// Equivalent when using value accessors
writer.fieldList.get(0).asString = null;
writer.write();

// Output: (depends on nullConstant)
// NULL,30,true  (if nullConstant = "NULL")
// ,30,true      (if nullConstant = "")
```

Use JavaScript `null` to represent a field null value in write APIs.

### Constant Fields

Fields with `constant` property don't need to be set:

```typescript
// In metadata
const versionField = meta.fieldList.new(FtDataType.String);
versionField.name = 'Version';
versionField.constant = '1.0'; // Always writes "1.0"

// No need to set value
writer.fieldList.get(0).asString = 'John Doe';
// versionField automatically writes "1.0"
writer.write();
```

## Heading Lines

### Automatic Heading Lines

```typescript
// Single heading line
meta.headingLineCount = 1;
field1.headings = ['Name'];
field2.headings = ['Age'];

writer.writeHeader();
// Output: Name,Age
```

### Multiple Heading Lines

```typescript
meta.headingLineCount = 3;
field1.headings = ['Customer', 'Full', 'Name'];
field2.headings = ['Customer', 'Age', 'Years'];

writer.writeHeader();
// Outputs all 3 lines
```

### Custom Heading Lines

```typescript
// Write custom heading without metadata
const writer = new SerializationWriter();
writer.loadMeta(meta);

const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);

// Manually write heading
output += 'Custom,Heading,Line\n';

// Then write data records
writer.fieldList.get(0).asString = 'Value1';
writer.write();
```

## Comment Lines

Add comment lines to output:

```typescript
meta.lineCommentChar = '#';

writer.loadMeta(meta);
const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);

// Write comment
writer.writeComment('This file was generated on ' + new Date().toISOString());
writer.writeComment('Contains customer data');

// Write heading
writer.writeHeader();

// Write data
writer.fieldList.get(0).asString = 'John';
writer.write();

// Output:
// # This file was generated on 2024-01-01T12:00:00.000Z
// # Contains customer data
// Name,Age
// John,30
```

## Declared Output

**Declared output** adds a header identifying the file as FieldedText:

```typescript
import { FtWriterSettings, FtMetaReferenceType } from 'fielded-text-web';

const settings: FtWriterSettings = {
  declared: true;
  metaReferenceType: FtMetaReferenceType.Embedded;
}

const writer = new SerializationWriter();
writer.loadMeta(meta);
writer.loadWriterSettings(settings);

const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);

writer.writeHeader();

writer.fieldList.get(0).asString = 'John';
writer.write();

writer.close();

console.log(stringWriter.toString());
// Output:
// |>Fielded Text<|1.1
// <embedded metadata XML here>
// Name,Age
// John,30
```

### Meta Reference Types

```typescript
// Embed metadata in file
settings.metaReferenceType = FtMetaReferenceType.Embedded;

// Reference external file
settings.metaReferenceType = FtMetaReferenceType.File;
settings.metaReference = 'schema.xml';

// Reference by URL
settings.metaReferenceType = FtMetaReferenceType.Url;
settings.metaReference = 'https://example.com/schema.xml';
```

### Embedding Metadata

```typescript
settings.declared = true;
settings.metaReferenceType = FtMetaReferenceType.Embedded;
settings.embeddedMetaIndent = true; // Indent XML
settings.embeddedMetaIndentChars = '  '; // 2-space indent

// Output includes formatted XML metadata
```

## Formatting Control

### Number Formatting

```typescript
// Set format in metadata
(field as FtDecimalMetaField).format = 'N2'; // 2 decimals, thousands separator

writer.fieldList.get(0).asDecimal = 12345.6789;
writer.write();
// Output: 12,345.68 (en-US)
// Output: 12.345,68 (de-DE)
```

### Date Formatting

```typescript
(field as FtDateTimeMetaField).format = 'yyyy-MM-dd';

writer.fieldList.get(0).asDateTime = new Date(2024, 0, 1);
writer.write();
// Output: 2024-01-01
```

### Boolean Formatting

```typescript
(field as FtBooleanMetaField).trueText = 'Yes';
(field as FtBooleanMetaField).falseText = 'No';

writer.fieldList.get(0).asBoolean = true;
writer.write();
// Output: Yes
```

### Quoting Control

```typescript
// Always quote
field.quotedType = FtQuotedType.Always;

writer.fieldList.get(0).asString = 'John';
writer.write();
// Output: "John",... (always quoted)

// Optional quoting (default)
field.quotedType = FtQuotedType.Optional;

writer.fieldList.get(0).asString = 'John';
writer.write();
// Output: John,... (not quoted, no special chars)

writer.fieldList.get(0).asString = 'John, Jr.';
writer.write();
// Output: "John, Jr.",... (quoted, contains delimiter)
```

## Event Callbacks

Track writing progress with event callbacks:

### Record Events

```typescript
let recordCount = 0;

writer.onRecordStarted = (args) => {
  recordCount++;
  console.log(`Starting record ${args.recordNumber}`);
};

writer.onRecordFinished = (args) => {
  if (recordCount % 1000 === 0) {
    console.log(`Written ${recordCount} records...`);
  }
};
```

### Field Events

```typescript
writer.onFieldValueReady = (args) => {
  console.log(`Field ${args.fieldIndex} (${args.field.name}): ${args.field.asString}`);
};
```

### Validation Example

```typescript
writer.onFieldValueReady = (args) => {
  // Validate before writing
  if (args.field.name === 'Age') {
    const age = Number(args.field.asBigInt);
    if (age < 0 || age > 150) {
      throw new Error(`Invalid age: ${age}`);
    }
  }
};
```

## Performance Tips

### 1. Reuse Metadata

```typescript
// Load metadata once
const meta = loadMetadataFromFile('schema.json');

// Reuse for multiple files
async function writeFile(data: any[], meta: FtMeta) {
  const writer = new FtNodeWriter();
  writer.loadMeta(meta); // Same metadata instance
  // ... write file
}

await writeFile(data1, meta);
await writeFile(data2, meta);
```

### 2. Batch Writing

Write multiple records before flushing:

```typescript
const BATCH_SIZE = 1000;

for (let i = 0; i < records.length; i++) {
  writer.fieldList.get(0).asString = records[i].name;
  writer.fieldList.get(1).asBigInt = BigInt(records[i].age);
  writer.write();

  // Flush periodically (if needed)
  if (i % BATCH_SIZE === 0) {
    // Some streams auto-flush, but you can force it if needed
  }
}
```

### 3. Avoid Event Callbacks if Not Needed

```typescript
// Faster (no events)
for (const record of records) {
  writer.fieldList.get(0).asString = record.name;
  writer.write();
}

// Slower (events add overhead)
writer.onFieldValueReady = (args) => {
  /* ... */
};
for (const record of records) {
  writer.fieldList.get(0).asString = record.name;
  writer.write();
}
```

### 4. Minimize Type Conversions

```typescript
// If your data is already in the right format, set it directly
writer.fieldList.get(0).asString = stringValue; // No conversion
writer.fieldList.get(1).asBigInt = BigInt(intValue); // Conversion needed
```

### 5. Pre-Allocate Objects

```typescript
// Reuse record objects
const record = {
  name: '',
  age: 0,
  active: false,
};

for (const data of dataSource) {
  record.name = data.customerName;
  record.age = data.customerAge;
  record.active = data.isActive;

  writeRecord(writer, record);
  writer.write();
}
```

## Complete Example

Putting it all together:

```typescript
import { FtNodeWriter, FtMeta, FtDataType } from 'fielded-text-web';
import { createWriteStream } from 'node:fs';

// Build metadata
const meta = new FtMeta();
meta.culture = 'en-US';
meta.delimiterChar = ',';
meta.headingLineCount = 1;

const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = 'Name';
nameField.headings = ['Customer Name'];

const amountField = meta.fieldList.new(FtDataType.Decimal);
amountField.name = 'Amount';
amountField.headings = ['Total Amount'];
(amountField as FtDecimalMetaField).format = 'C2'; // Currency

const dateField = meta.fieldList.new(FtDataType.DateTime);
dateField.name = 'Date';
dateField.headings = ['Order Date'];
(dateField as FtDateTimeMetaField).format = 'yyyy-MM-dd';

const rootSeq = meta.sequenceList.new();
rootSeq.name = 'Root';
rootSeq.root = true;
rootSeq.itemList.new().field = nameField;
rootSeq.itemList.new().field = amountField;
rootSeq.itemList.new().field = dateField;

// Create writer
const fileStream = createWriteStream('orders.csv', 'utf8');
const writer = new FtNodeWriter();
writer.loadMeta(meta);
writer.openNodeStream(fileStream);

// Write comment
writer.writeComment(`Generated ${new Date().toISOString()}`);

// Write heading
writer.writeHeader();

// Write data
const orders = [
  { name: 'Acme Corp', amount: 1234.56, date: new Date(2024, 0, 15) },
  { name: 'XYZ Inc', amount: 7890.12, date: new Date(2024, 0, 20) },
];

for (const order of orders) {
  writer.fieldList.get(0).asString = order.name;
  writer.fieldList.get(1).asDecimal = order.amount;
  writer.fieldList.get(2).asDateTime = order.date;
  writer.write();
}

writer.close();

console.log('File written successfully!');
```

## Next Steps

- **[Reading Guide](reading.md)** - Read fielded text files
- **[Metadata Guide](metadata.md)** - Define field types and formats
- **[Advanced Guide](advanced.md)** - Sequences, redirects, advanced topics
- **Examples** - Practical writing examples
