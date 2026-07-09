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

The basic pattern for reading fielded text data is:

```typescript
import { FtReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// CSV data to be read
const csvData = `Name,Age
John Doe,30
Jane Smith,25`;

// Meta describing the schema of the CSV data
const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name"/>
  <Field Name="Age" DataType="Integer"/>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

// Create a reader to read the CSV data
const reader = new FtReader(meta, csvData);

// Read and log the data
while (reader.read()) {
  console.log(
    reader.fieldList.get(0).asString,
    reader.fieldList.get(1).asBigInt,
  );
}
```

## The FtTextReader interface

In the above Basic Reading example, we use {@link meta/ft-meta!FtReader FtReader} to read the data file. FtReader understands the structure of a Fielded Text file however it sources the data through a separate text reader. A text reader is a class which implements the {@link meta/ft-meta!FtTextReader FtTextReader} interface which reads one character at a time from the fielded text source.

```typescript
export interface FtTextReader {
  /**
   * Reads the next character from the text reader and advances the character position by one character.
   * @returns The character read as a number (charCode), or -1 if the end of the text has been reached.
   */
  read(): number;
}
```

The library has a built-in {@link meta/ft-meta!FtStringReader FtStringReader} class which implements FtTextReader for strings. Below is the above Basic Reading example expanded to explicitly create a `FtStringReader` which reads the CSV data and the FtReader using that `FtStringReader`.

```typescript
import { FtReader, FtStringReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// CSV data to be read
const csvData = `Name,Age
John Doe,30
Jane Smith,25`;

// Meta describing the schema of the CSV data
const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name"/>
  <Field Name="Age" DataType="Integer"/>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

const textReader = new FtStringReader(csvData);

// Create the serialization reader
const reader = new FtReader();
// Load the meta into the serialization reader
reader.loadMeta(meta);
// Open the text reader
// `true` indicates that header lines should be read immediately
// and the reader will be positioned at the first data line
reader.open(textReader, true); // true is default, but shown here for clarity

// Read and log the data
while (reader.read()) {
  console.log(
    reader.fieldList.get(0).asString,
    reader.fieldList.get(1).asBigInt,
  );
}
```

Custom `FtTextReader`s can be created to read other types of data sources however currently reading asynchronous data sources is not supported.

## Reading Files

Use the `fielded-text-node` npm package to read and write files using node.

## Accessing Field Values

After a record has been read, the values of the fields in that record are then available in {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} (or its descendants - including {@link api/ft-reader!FtReader FtReader}). Two steps are required to read the field values:

1. Locate the {@link fields/instances/ft-field!FtField field}(s)
1. Getting the field value

### Locating a field

A record's fields are stored in {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader}.{@link serialization/ft-serialization-reader!FtSerializationReader.fieldList fieldList}. This {@link fields/instances/ft-field-list!FtFieldList class} contains all the field instances for this record.  The total number of fields is specified by the {@link fields/instances/ft-field-list!FtFieldList.count count} accessor.  Individual fields can be accessed either by:

- index (or ordinal) - using the {@link fields/instances/ft-field-list!FtFieldList.get get(index: number)} function;
- field name - using the {@link fields/instances/ft-field-list!FtFieldList.getByName getByName(name: string)} function;
- field id - using the {@link fields/instances/ft-field-list!FtFieldList.indexOfId indexOfId(id: number)} and {@link fields/instances/ft-field-list!FtFieldList.get get(index: number)} functions;

You can use the following {@link fields/instances/ft-field-list!FtFieldList FtFieldList} functions to get the index of a field: {@link fields/instances/ft-field-list!FtFieldList.indexOf indexOf(field: FtField)}, {@link fields/instances/ft-field-list!FtFieldList.indexOfName indexOfName(name: string)} and {@link fields/instances/ft-field-list!FtFieldList.indexOfId indexOfId(id: number)}. The index of a field will remain the same for records within the same `table` within the data. This is further discussed in [Tables](tables.md).

{@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} has 3 convenience functions which also can be used to access a field:

- {@link serialization/ft-serialization-reader!FtSerializationReader.getField getField(idx: number)} - get field by index
- {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldByName getFieldByName(name: string)} - get field by name
- {@link serialization/ft-serialization-reader!FtSerializationReader.getOrdinal getOrdinal(name: string)} - get index of field by name

### Getting a field's value

Once a {@link fields/instances/ft-field!FtField field} has been obtained, its value can be retrieved in several ways.

- Checking if the field has a null value
- Casting the {@link fields/instances/ft-field!FtField field} to its concrete descendant type and using this class's {@link fields/instances/ft-generic-field!FtGenericField.value value} accessor.
- Using one of {@link fields/instances/ft-field!FtField FtField}'s asXXX (eg. {@link fields/instances/ft-field!FtField.asFloat asFloat}) accessors to coerce the field's value to a particular type.
- Using {@link fields/instances/ft-field!FtField.loadedValueText loadedValueText} to get the text representing that field value in the data.

These methods of getting a field's value are further discussed below:

#### Field Null value

#### Casting field to descendant representing data type

#### Using asXXX accessors

#### Using loadedValueText





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

## Read record

## Seek

The {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} {@link serialization/ft-serialization-reader!FtSerializationReader.seek seek} and {@link serialization/ft-serialization-reader!FtSerializationReader.seekEnd seekEnd} functions allow you to move forward in the data by either a certain number of records (seek) or to the end of the data (seekEnd).  They are similar to the {@link serialization/ft-serialization-reader!FtSerializationReader.read read} function however they do not parse the fields in the record and, accordingly, move through the data a lot faster.

While the seek functions do not parse fields or fire events related to fields, they still update record information in {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} and fire events related to lines and records. Accordingly, {@link serialization/ft-serialization-reader!FtSerializationReader.seekEnd seekEnd} is an ideal way to quickly count the number of records in fielded text data before actually parsing it.

Note that the seek functions ignore table boundaries in data.

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
