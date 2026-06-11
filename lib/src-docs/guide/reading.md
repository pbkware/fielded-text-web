---
title: Reading
---

# Reading Fielded Text Files

This guide covers reading fielded text files using the FieldedText TypeScript library.

## Table of Contents

- [Basic Reading](#basic-reading)
- [Reading from Strings](#reading-from-strings)
- [Reading from Streams](#reading-from-streams)
- [Reading from Node.js Files](#reading-from-nodejs-files)
- [Accessing Field Values](#accessing-field-values)
- [Event Callbacks](#event-callbacks)
- [Heading Lines](#heading-lines)
- [Comment Lines](#comment-lines)
- [Error Handling](#error-handling)
- [Performance Tips](#performance-tips)

## Basic Reading

The basic pattern for reading fielded text:

```typescript
import { SerializationReader, FtMeta } from 'fielded-text-web';

// 1. Create metadata (or load from file)
const meta = buildMetadata(); // See Metadata Guide

// 2. Create reader
const reader = new SerializationReader();

// 3. Load metadata
reader.loadMeta(meta);

// 4. Open data source
reader.open(csvData);

// 5. Read records in a loop
while (reader.read()) {
  // Access field values
  const name = reader.fieldList.get(0).asString;
  const age = Number(reader.fieldList.get(1).asBigInt);
  console.log(name, age);
}

// 6. Close reader
reader.close();
```

## Reading from Strings

For in-memory data or small files:

```typescript
const csvData = `Name,Age,City
John Doe,30,Seattle
Jane Smith,25,Portland`;

const reader = new SerializationReader();
reader.loadMeta(meta);
reader.open(csvData);

while (reader.read()) {
  // Process records
}

reader.close();
```

## Reading from Streams

For large files or browser environments, use Web Streams:

```typescript
// Create a ReadableStream
const stream = new ReadableStream<string>({
  async start(controller) {
    controller.enqueue('Name,Age\n');
    controller.enqueue('John,30\n');
    controller.enqueue('Jane,25\n');
    controller.close();
  },
});

// Get reader
const streamReader = stream.getReader();

// Use with SerializationReader
const reader = new SerializationReader();
reader.loadMeta(meta);
reader.openReader(streamReader);

while (await reader.read()) {
  console.log(reader.fieldList.get(0).asString);
}

reader.close();
```

## Reading from Node.js Files

For Node.js file system access:

```typescript
import { FtNodeReader } from 'fielded-text-web';
import { createReadStream } from 'node:fs';

const fileStream = createReadStream('data.csv', { encoding: 'utf8' });

const reader = new FtNodeReader();
reader.loadMeta(meta);
reader.openNodeStream(fileStream);

while (await reader.read()) {
  // Process records
}

reader.close();
```

### Reading Large Files

For very large files, streaming is efficient:

```typescript
import { FtNodeReader } from 'fielded-text-web';
import { createReadStream } from 'node:fs';

const fileStream = createReadStream('huge-file.csv', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024, // 64KB buffer
});

const reader = new FtNodeReader();
reader.loadMeta(meta);
reader.openNodeStream(fileStream);

let recordCount = 0;
let totalAmount = 0;

while (await reader.read()) {
  recordCount++;
  totalAmount += reader.fieldList.get(2).asDecimal;

  // Log progress
  if (recordCount % 10000 === 0) {
    console.log(`Processed ${recordCount} records...`);
  }
}

console.log(`Total records: ${recordCount}`);
console.log(`Total amount: ${totalAmount}`);

reader.close();
```

## Accessing Field Values

### By Index

```typescript
while (reader.read()) {
  const name = reader.fieldList.get(0).asString;
  const age = Number(reader.fieldList.get(1).asBigInt);
  const active = reader.fieldList.get(2).asBoolean;
}
```

### By Name

```typescript
// Find field index by name
function getFieldIndex(meta: FtMeta, name: string): number {
  return meta.fieldList.items.findIndex((f) => f.name === name);
}

const nameIndex = getFieldIndex(meta, 'CustomerName');
const ageIndex = getFieldIndex(meta, 'Age');

while (reader.read()) {
  const name = reader.fieldList.get(nameIndex).asString;
  const age = Number(reader.fieldList.get(ageIndex).asBigInt);
}
```

### Type-Safe Access

```typescript
// Create a typed record interface
interface CustomerRecord {
  name: string;
  age: number;
  active: boolean;
}

function readCustomerRecord(reader: SerializationReader): CustomerRecord {
  return {
    name: reader.fieldList.get(0).asString,
    age: Number(reader.fieldList.get(1).asBigInt),
    active: reader.fieldList.get(2).asBoolean,
  };
}

while (reader.read()) {
  const customer = readCustomerRecord(reader);
  console.log(customer.name, customer.age, customer.active);
}
```

### Null Handling

```typescript
while (reader.read()) {
  const field = reader.fieldList.get(0);

  if (field.isNull()) {
    console.log('Field is null');
  } else {
    const value = field.asString;
    console.log('Field value:', value);
  }
}
```

When a field is null, nullable value accessors return JavaScript `null`.

## Event Callbacks

Event callbacks provide hooks into the reading process:

### Record Events

```typescript
reader.onRecordStarted = (args) => {
  console.log(`Starting record ${args.recordNumber}`);
};

reader.onRecordFinished = (args) => {
  console.log(`Finished record ${args.recordNumber}`);
  console.log(`Table: ${args.tableNumber}`);
};
```

### Field Events

```typescript
reader.onFieldValueReady = (args) => {
  console.log(`Field ${args.fieldIndex} (${args.field.name}): ${args.field.asString}`);
};
```

### Heading Events

```typescript
reader.onFieldHeadingReady = (args) => {
  console.log(`Field ${args.fieldIndex} heading: ${args.heading}`);
};
```

### Sequence Redirect Events

```typescript
reader.onSequenceRedirected = (args) => {
  console.log(`Sequence redirected from ${args.fromSequence.name} to ${args.toSequence.name}`);
};
```

### Complete Event Example

```typescript
const reader = new SerializationReader();
reader.loadMeta(meta);

// Track statistics
let recordCount = 0;
let fieldCount = 0;

reader.onRecordStarted = (args) => {
  recordCount++;
};

reader.onFieldValueReady = (args) => {
  fieldCount++;

  // Validate field values
  if (args.fieldIndex === 1) {
    // Age field
    const age = Number(args.field.asBigInt);
    if (age < 0 || age > 150) {
      console.warn(`Invalid age: ${age} in record ${recordCount}`);
    }
  }
};

reader.onRecordFinished = (args) => {
  if (recordCount % 1000 === 0) {
    console.log(`Processed ${recordCount} records...`);
  }
};

reader.open(csvData);

while (reader.read()) {
  // Processing happens in event callbacks
}

console.log(`Total records: ${recordCount}, Total fields: ${fieldCount}`);
```

## Heading Lines

### Automatic Heading Parsing

When `headingLineCount > 0`, heading lines are automatically read and validated:

```typescript
const meta = new FtMeta();
meta.delimiterChar = ',';
meta.headingLineCount = 1; // One heading line

// Define expected headings
field1.headings = ['Name'];
field2.headings = ['Age'];
field3.headings = ['City'];

// Reader will validate headings match
reader.loadMeta(meta);
reader.open(csvData);

// Heading lines are skipped; read() returns first data record
while (reader.read()) {
  // Process data records
}
```

### Multiple Heading Lines

```typescript
meta.headingLineCount = 3; // Three heading lines
meta.mainHeadingLineIndex = 1; // Use second line for matching

field.headings = [
  'Primary', // Line 0
  'Secondary', // Line 1 (main)
  'Tertiary', // Line 2
];
```

### Heading Validation

```typescript
// Strict heading matching
meta.headingConstraint = FtHeadingConstraint.AllConstant;

// Headings must match exactly; reader throws error if mismatch
```

## Comment Lines

Skip comment lines by setting `lineCommentChar`:

```typescript
const meta = new FtMeta();
meta.delimiterChar = ',';
meta.lineCommentChar = '#'; // Lines starting with # are comments

const csvData = `# This is a comment
Name,Age
# Another comment
John,30
Jane,25`;

reader.loadMeta(meta);
reader.open(csvData);

while (reader.read()) {
  // Comments are automatically skipped
}
```

## Error Handling

### Try-Catch

```typescript
try {
  reader.loadMeta(meta);
  reader.open(csvData);

  while (reader.read()) {
    // Process
  }

  reader.close();
} catch (error) {
  console.error('Error reading file:', error);
  reader.close(); // Always close on error
}
```

### Field Parsing Errors

```typescript
while (reader.read()) {
  try {
    const age = Number(reader.fieldList.get(1).asBigInt);

    if (isNaN(age)) {
      console.warn('Invalid age value');
      continue;
    }

    // Process valid record
  } catch (error) {
    console.error('Error parsing record:', error);
    // Skip this record, continue to next
  }
}
```

### Validation

```typescript
function validateRecord(reader: SerializationReader): boolean {
  // Check required fields are not null
  if (reader.fieldList.get(0).isNull()) {
    console.warn('Name field is null');
    return false;
  }

  // Check value ranges
  const age = Number(reader.fieldList.get(1).asBigInt);
  if (age < 0 || age > 150) {
    console.warn('Age out of range');
    return false;
  }

  return true;
}

while (reader.read()) {
  if (!validateRecord(reader)) {
    continue; // Skip invalid record
  }

  // Process valid record
}
```

## Performance Tips

### 1. Reuse Metadata

```typescript
// Load metadata once
const meta = loadMetadataFromFile('schema.json');

// Reuse for multiple files
function processFile(filePath: string, meta: FtMeta) {
  const reader = new FtNodeReader();
  reader.loadMeta(meta); // Same metadata instance
  // ... read file
}

processFile('file1.csv', meta);
processFile('file2.csv', meta);
processFile('file3.csv', meta);
```

### 2. Avoid Event Callbacks if Not Needed

Event callbacks add overhead. If you don't need them, don't set them:

```typescript
// Faster (no events)
while (reader.read()) {
  const value = reader.fieldList.get(0).asString;
}

// Slower (events)
reader.onFieldValueReady = (args) => {
  /* ... */
};
while (reader.read()) {
  const value = reader.fieldList.get(0).asString;
}
```

### 3. Use Streaming for Large Files

Always use streaming for large files:

```typescript
// Good - streaming
const stream = createReadStream('huge.csv');
const reader = new FtNodeReader();
reader.openNodeStream(stream);

// Bad - loading entire file into memory
const content = await readFile('huge.csv', 'utf8');
reader.open(content);
```

### 4. Batch Processing

Process records in batches for better performance:

```typescript
const BATCH_SIZE = 1000;
let batch: CustomerRecord[] = [];

while (await reader.read()) {
  batch.push({
    name: reader.fieldList.get(0).asString,
    age: Number(reader.fieldList.get(1).asBigInt),
  });

  if (batch.length >= BATCH_SIZE) {
    await processBatch(batch);
    batch = [];
  }
}

// Process remaining records
if (batch.length > 0) {
  await processBatch(batch);
}

async function processBatch(records: CustomerRecord[]) {
  // Bulk insert to database, etc.
}
```

### 5. Minimize Type Conversions

```typescript
// Slower - converting on every access
while (reader.read()) {
  const age = Number(reader.fieldList.get(1).asBigInt); // Conversion
  const price = reader.fieldList.get(2).asDecimal; // No conversion
}

// Faster - access raw values when possible
while (reader.read()) {
  const ageField = reader.fieldList.get(1);
  // Use field methods directly when possible
}
```

## Next Steps

- **[Writing Guide](writing.md)** - Write fielded text files
- **[Metadata Guide](metadata.md)** - Define field types and formats
- **[Advanced Guide](advanced.md)** - Sequences, redirects, advanced topics
- **Examples** - Practical reading examples
