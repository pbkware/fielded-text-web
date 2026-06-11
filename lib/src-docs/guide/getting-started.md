---
title: Getting Started
---

# Getting Started with FieldedText TypeScript

This guide will help you get started with the FieldedText TypeScript library, from installation to your first read and write operations.

## Table of Contents

- [Installation](#installation)
- [Basic Concepts](#basic-concepts)
- [Your First Read](#your-first-read)
- [Your First Write](#your-first-write)
- [Loading Meta data from XML](#loading-meta-data-from-xml)

## Installation

```bash
npm install fielded-text-web
```

## Basic Concepts

### Meta data (FtMeta)

**Meta data** defines the structure and format of your fielded text file. Think of it as a schema that describes:

- What fields (columns) exist
- What data type each field has (string, integer, date, etc.)
- How fields are separated (comma, tab, fixed-width)
- How to format/parse values (number formats, date formats)
- The order of fields in records

### Fields

**Fields** represent individual columns in your data. Each field has:

- A **name** (e.g., "CustomerName", "OrderDate")
- A **data type** (String, Boolean, Integer, Float, Decimal, DateTime)
- Optional **heading** text (column header)
- Optional **formatting** rules (e.g., "N2" for 2 decimal places)

### Sequences

**Sequences** define the order and grouping of fields. A simple file has one **root sequence** containing all fields in order. Advanced files can have nested sequences for repeating groups.

### Readers and Writers

- **FtSerializationReader**: Reads fielded text data, parsing it according to meta data
- **FtSerializationWriter**: Writes fielded text data, formatting it according to meta data

## Your First Read

Let's read a simple CSV file. We'll build the meta data in code:

```typescript
import { FtBooleanMetaField, FtBooleanStyles, FtDataType, FtMeta, FtReader } from "@pbkware/fielded-text-web";

// Sample CSV data
const csvData = `Name,Age,Active
John Doe,30,true
Jane Smith,25,false
Bob Johnson,45,true`;

// Step 1: Create meta data
const meta = new FtMeta();
meta.headingLineCount = 1; // One heading line

// Step 2: Define fields
const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = "Name";
nameField.headings = ["Name"];

const ageField = meta.fieldList.new(FtDataType.Integer);
ageField.name = "Age";
ageField.headings = ["Age"];

const activeField = meta.fieldList.new(FtDataType.Boolean);
activeField.name = "Active";
activeField.headings = ["Active"];
(activeField as FtBooleanMetaField).styles = FtBooleanStyles.IgnoreCase;

// Step 3: Define root sequence (field order)
const rootSequence = meta.sequenceList.new();
rootSequence.name = "Root";
rootSequence.root = true;
rootSequence.itemList.new(nameField);
rootSequence.itemList.new(ageField);
rootSequence.itemList.new(activeField);

// Step 4: Create reader and load meta data
const reader = new FtReader(meta, csvData);

// Step 5: Read records
console.log("Reading CSV data:");
console.log("================\n");

let recordNumber = 0;
while (reader.read()) {
  recordNumber++;

  // Access fields by index
  const name = reader.fieldList.get(0).asString;
  const age = Number(reader.fieldList.get(1).asBigInt);
  const active = reader.fieldList.get(2).asBoolean;

  console.log(
    `Record ${recordNumber}: ${name}, Age: ${age}, Active: ${active}`,
  );
}

console.log(`\nTotal records read: ${recordNumber}`);
```

**Output:**

```text
Reading CSV data:
================

Record 1: John Doe, Age: 30, Active: true
Record 2: Jane Smith, Age: 25, Active: false
Record 3: Bob Johnson, Age: 45, Active: true

Total records read: 3
```

### Breaking It Down

1. **Create meta data** (`FtMeta`) and set basic properties
2. **Define fields** using `meta.fieldList.new(dataType)`
3. **Set field properties** like name, headings, format
4. **Create root sequence** and add fields in order
5. **Create reader** which will load meta data and open file and read header
6. **Read in a loop** using `reader.read()`
7. **Access field values** via `reader.fieldList.get(index)`
8. **Close reader** when done

## Your First Write

Now let's write CSV data:

```typescript
import { FtDataType, FtIntegerMetaField, FtMeta, FtStringWriter, FtWriter } from "@pbkware/fielded-text-web";

// Step 1: Create meta data (same as reading)
const meta = new FtMeta();
meta.headingLineCount = 1;

const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = "Name";
nameField.headings = ["Name"];

const ageField = meta.fieldList.new(FtDataType.Integer);
(ageField as FtIntegerMetaField).name = "Age";
ageField.headings = ["Age"];

const rootSequence = meta.sequenceList.new();
rootSequence.name = "Root";
rootSequence.root = true;
rootSequence.itemList.new(nameField);
rootSequence.itemList.new(ageField);

// Step 2: Create writer and load meta data
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

// Step 3: Write records
writer.fieldList.get(0).asString = "John Doe";
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.write();

writer.fieldList.get(0).asString = "Jane Smith";
writer.fieldList.get(1).asBigInt = BigInt(25);
writer.write();

writer.fieldList.get(0).asString = "Bob Johnson";
writer.fieldList.get(1).asBigInt = BigInt(45);
writer.write();

// Step 4: Show output
console.log("Generated CSV:");
console.log("==============");
console.log(stringWriter.toString());
```

**Output:**

```
Generated CSV:
==============
Name,Age
John Doe,30
Jane Smith,25
Bob Johnson,45
```

### Breaking It Down

1. **Create meta data** (same as reading)
2. **Create writer** and load meta data with output sink
3. **Set field values** via `writer.fieldList.get(index)`
4. **Call `write()`** to output the record
5. **Repeat** for each record

### Important Notes

- **Field values**: Set values on `writer.fieldList.get(index)` before calling `write()`
- **Automatic quoting**: Fields containing delimiters or quotes are automatically quoted

## Loading Meta data from XML

Instead of building meta data in code, you can load it from an XML file:

```typescript
import { FtReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// XML format meta data string
const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name" Headings="Name"/>
  <Field Name="Age" DataType="Integer" Headings="Age"/>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

// Use it with FtReader to read CSV data
const csvData = `Name,Age
John Doe,30
Jane Smith,25`;

const reader = new FtReader(meta, csvData);

while (reader.read()) {
  console.log(
    reader.fieldList.get(0).asString,
    reader.fieldList.get(1).asBigInt,
  );
}
```

**Advantages of XML Meta data:**

- Reusable across files
- Version control friendly
- Easier to maintain for complex structures

See the [Meta data Guide](meta-data.md) for more XML format documentation.

### Getting Help

- **[Meta Data](./meta-data.md)**: Introduction to Meta data
- **Examples**: Check examples folder for small source applications that demonstrate more advanced capabilities
- **API Documentation**: Classes and modules under the top level module called API are the main ones used
- **Standard**: Read [FieldedText Standard](https://fieldedtext.org/standard/) for detailed specifications
- **Issues**: Report bugs or ask questions on GitHub

Happy parsing! 🎉
