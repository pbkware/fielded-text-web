---
title: Reading
---

# Reading Fielded Text Files

This guide covers reading fielded text data using the FieldedText TypeScript library.

## Table of Contents

- [Basic Reading](#basic-reading)
- [FtTextReader interface](#the-fttextreader-interface)
- [Reading Files](#reading-files)
- [Reading Records](#reading-records)
- [Seeking Records](#seeking-records)
- [Accessing Field Values](#accessing-field-values)
- [Event Callbacks](#event-callbacks)
- [Reading Headings](#reading-headings)

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

In the above Basic Reading example, we use {@link api/ft-reader!FtReader FtReader} to read the data file. FtReader understands the structure of a Fielded Text file however it sources the data through a separate text reader. A text reader is a class which implements the {@link serialization/text-reader/ft-text-reader!FtTextReader FtTextReader} interface which reads one character at a time from the fielded text source.

```typescript
export interface FtTextReader {
  /**
   * Reads the next character from the text reader and advances the character position by one character.
   * @returns The character read as a number (charCode), or -1 if the end of the text has been reached.
   */
  read(): number;
}
```

The library has a built-in {@link serialization/text-reader/ft-string-reader!FtStringReader FtStringReader} class which implements FtTextReader for strings. Below is the above Basic Reading example expanded to explicitly create a `FtStringReader` which reads the CSV data and the FtReader using that `FtStringReader`.

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

## Reading records

{@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()} will read the next record in the data and load its fields. It will return `true` if a record was successfully read. It will return `false` if:

1. there are no more records in the data, or
1. {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} is false and the next record in the data is in a different table.

By default, {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} is `false`, so `read()` will normally read to the end of the table (after which record fields can change). Note that data will only contain one table unless the Meta contains sequence redirects. The use of tables is further discussed in [Tables](./tables.md)

Whenever `read()` is called, it will skip over any headers or comments in the data. The {@link serialization/ft-serialization-reader!FtSerializationReader.readHeader FtSerializationReader.readHeader()} method can be used to read heading information prior to reading and records. See [Reading Headings](#reading-headings) below for more information.

{@link serialization/ft-serialization-reader!FtSerializationReader.readRecord FtSerializationReader.readRecord()} is an alternative to `read()`. Like `read()`, it reads the next record however it ignores {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} and returns the enumerator {@link types/enums/ft-read-record-result!FtReadRecordResult:var FtReadRecordResult}. This enumerator indicators whether the record read was in the same table or a new table, or whether there were no more records to be read (at end of data). This is further discussed in [Tables](./tables.md).

Note that reading a record is not the same as reading a line of text from the data. It is possible for a record to span multiple lines if it contains new line character(s) within a field.

## Seeking records

The {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} {@link serialization/ft-serialization-reader!FtSerializationReader.seek seek} and {@link serialization/ft-serialization-reader!FtSerializationReader.seekEnd seekEnd} functions allow you to move forward in the data by either a certain number of records (seek) or to the end of the data (seekEnd).  They are similar to the {@link serialization/ft-serialization-reader!FtSerializationReader.read read} function however they do not parse the fields in the record and, accordingly, move through the data a lot faster.

While the seek functions do not parse fields or fire events related to fields, they still update record information in {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} and fire events related to lines and records. Accordingly, {@link serialization/ft-serialization-reader!FtSerializationReader.seekEnd seekEnd} is an ideal way to quickly count the number of records in fielded text data before actually parsing it.

Note that the seek functions ignore table boundaries in data.

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
- {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldIndexByName getFieldIndexByName(name: string)} - get index of field by name

### Getting a field's value

Once a {@link fields/instances/ft-field!FtField field} has been obtained, its value can be retrieved in several ways.

- [Checking](#field-null-value) if the field has a null value
- [Using](#using-asxxx-accessors) one of {@link fields/instances/ft-field!FtField FtField}'s asXXX where XXX is the {@link types/enums/ft-data-type!FtDataType data type} (eg. {@link fields/instances/ft-field!FtField.asFloat asFloat}) to retrieve the value without have to cast to the descendant field.
- [Using](#using-asnullablexxx-accessors) one of {@link fields/instances/ft-field!FtField FtField}'s asNullableXXX where XXX is the data type to retrive the value or null.
- [Using](#using-value-or-nullablevalue-accessor) {@link fields/instances/ft-field!FtField FtField}.{@link fields/instances/ft-field!FtField.value value} or {@link fields/instances/ft-field!FtField FtField}.{@link fields/instances/ft-field!FtField.nullableValue nullableValue} accessor to retrieve the value with unspecified type.
- [Casting](#casting-field-to-descendant-representing-data-type) the {@link fields/instances/ft-field!FtField field} to its concrete descendant type and using this class's {@link fields/instances/ft-generic-field!FtGenericField.value value} accessor.
- [Using](#using-ftserializationreaders-getfieldxxx-methods) {@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader}'s getFieldXXX() methods.
- [Using](#using-valuetext) {@link fields/instances/ft-field!FtField.valueText valueText} to get the formatted text representing that field value in the data.

These methods of getting a field's value are further discussed below:

#### Field Null value

Records in Fielded Text files can possibly have fields with no value.  For example, in the example data below, the record for "Jane Smith" is missing a value for the "Age" field.

```text
Name,Age,Studying
John Doe,30,true
Jane Smith,,false
```

Field Text flags that such fields (in these records) have a `null` value.  You can check whether a field's value is null by using the {@link fields/instances/ft-field!FtField field}.{@link fields/instances/ft-field!FtField.isNull isNull()} method.

```typescript
while (reader.read()) {
  const field = reader.fieldList.get(1);

  if (field.isNull()) {
    console.log('Field is null');
  } else {
    const value = field.asBigInt;
    console.log('Field value:', value);
  }
}
```

In the above code snippet, if a field is null, then without including the `isNull()` check first, `field.asBigInt` throw a `FtFieldNullError`. Note that {@link fields/instances/ft-field!FtField field} has various`asNullableXXX` accessors which return the value or null.

#### Using asXXX accessors

Fielded Text supports 6 different field {@link types/enums/ft-data-type!FtDataType data types}. For each data type, FtField has an asXXX accessor where XXX is the name of the data type. This accessor will return the field's value with the corresponding type. If the value is of a different type, a {@link types/errors/ft-field-type-error!FtFieldTypeError FtFieldTypeError} is thrown.

- String - {@link fields/instances/ft-field!FtField.asString asString}
- Boolean - {@link fields/instances/ft-field!FtField.asBoolean asBoolean}
- Integer - {@link fields/instances/ft-field!FtField.asInteger asInteger}
- Float - {@link fields/instances/ft-field!FtField.asFloat asFloat}
- Decimal - {@link fields/instances/ft-field!FtField.asDecimal asDecimal}
- DateTime - {@link fields/instances/ft-field!FtField.asDateTime asDateTime}

If a field's value is `null`, then a {@link types/errors/ft-field-null-error!FtFieldNullError FtFieldNullError} exception will be thrown.

#### Using asNullableXXX accessors

Same as asXXX accessors however returns `null` if the field value is null.

#### Using value or nullableValue accessor

{@link fields/instances/ft-field!FtField} has a {@link fields/instances/ft-field!FtField.value value} accessor which will the value for any data type field however with the generic/union {@link fields/instances/ft-field!FtField.Value} type.  {@link fields/instances/ft-field!FtField.nullableValue nullableValue} is similar to {@link fields/instances/ft-field!FtField.value value} however it returns `null` instead of throwing an exception if the field's value is null.

#### Casting field to descendant representing data type

{@link fields/instances/ft-field!FtField FtField} is actually an abstract class with a descendant class for each {@link types/enums/ft-data-type!FtDataType data type}. The descendands are:

- String - {@link fields/instances/ft-string-field!FtStringField FtStringField}
- Boolean - {@link fields/instances/ft-boolean-field!FtBooleanField FtBooleanField}
- Integer - {@link fields/instances/ft-integer-field!FtIntegerField FtIntegerField}
- Float - {@link fields/instances/ft-float-field!FtFloatField FtFloatField}
- Decimal - {@link fields/instances/ft-decimal-field!FtDecimalField FtDecimalField}
- DateTime - {@link fields/instances/ft-date-time-field!FtDateTimeField FtDateTimeField}

These descendant classes override the {@link fields/instances/ft-generic-field!FtGenericField.value value} accessor so that it returns a fields value with its actual type.  Each of these descendant field classes have a static type guard `cast` function (eg. {@link fields/instances/ft-string-field!FtStringField.cast FtStringField.cast()}) which can be used to attempt to cast {@link fields/instances/ft-field!FtField FtField} to that descendent.

#### Using FtSerializationReader's getFieldXXX() methods

{@link serialization/ft-serialization-reader!FtSerializationReader FtSerializationReader} has 4 methods which can be used to retrieve a field's value:

1. {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldValue getFieldValue(idx: number)}
1. {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldNullableValue getFieldNullableValue(idx: number)}
1. {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldValueByName getFieldValueByName(name: string)}
1. {@link serialization/ft-serialization-reader!FtSerializationReader.getFieldNullableValueByName getFieldNullableValueByName(name: string)}

These functions respectively get a field's value by using the field's {@link fields/instances/ft-field!FtField.value value} or {@link fields/instances/ft-field!FtField.nullableValue nullableValue} accessor. They retrieve the field as described in [Locating a field](#locating-a-field) above.

#### Using valueText

It is also possible to get a field's value as its formatted text representation in the data. This text representation may not be identical to how the field is actually represented in the data, as it does not include quoting and escaped character encoding.

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

## Reading Headings

The headings in the data can be read after the header in the data has been parsed. This can be done in the following ways:

1. Open the data with {@link serialization/ft-serialization-reader!FtSerializationReader.open FtSerializationReader.open()} with the `immediatelyReadHeader` parameter either not specified or true. The reader will immediately parse the header and load fields associated with headings into`FtSerializationReader` with their heading values.
1. Open the data with {@link serialization/ft-serialization-reader!FtSerializationReader.open FtSerializationReader.open()} with the `immediatelyReadHeader` parameter set to false. Then calling {@link serialization/ft-serialization-reader!FtSerializationReader.readHeader FtSerializationReader.readHeader()}. `readHeader()` will parse the header and load fields associated with headings into`FtSerializationReader` with their heading values.
1. Call {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()} at least once. When the first record is read, the header will also be parsed and heading information will be available in fields. Note that the fields associated with headings and fields associated with the first record may differ if sequence redirection is used. In this case not all headings may be available with this method.

### Accessing Field Heading values

If the meta specifies that the data [contains headings](./meta-data.md#headings) (headingLineCount > 0), then the {@link fields/instances/ft-field!FtField FtField}.{@link fields/instances/ft-field!FtField.headings headings} array property will be of length `headingLineCount`. Each element of the array will contain the heading in corresponding heading line for that field in the data.

```ts
import {
  FtReader,
  FtStringReader,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// CSV data with 3 heading lines
const csvData = `Inventory,Inventory,Pricing
Product,Quantity,Unit Price
Name,Count,USD
Widget,10,$19.99`;

// Meta describing the schema of the CSV data - includes 3 heading lines"
const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="3">
  <Field Name="Product" />
  <Field DataType="Integer" Name="Quantity" />
  <Field DataType="Decimal" Name="Price" Format="C2" />
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

const textReader = new FtStringReader(csvData);

// Create the serialization reader
const reader = new FtReader(meta);
// Open the text reader
// `true` indicates that header lines should be read immediately
reader.open(textReader, true); // true is default, but shown here for clarity

// Read and log the headings
const fields = reader.fieldList;
for (let i = 0; i < fields.count; i++) {
  const field = fields.get(i);
  const headings = field.headings; // array contains the headings for this field, in order from top to bottom
  console.log(`Field ${field.name} headings: ${headings.join(", ")}`);
}
```

### Heading Validation

When the header is parsed, the headings will also be validated against the {@link types/enums/ft-heading-constraint!FtHeadingConstraint:var heading constraints} specified by the meta. This may cause an exception to be thrown if the headings in the data do not match the headings specified in the meta, or it may dynamically change the field names to be the value of the field's main heading line.
