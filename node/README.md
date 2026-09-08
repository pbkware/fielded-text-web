# Fielded Text TypeScript Node Library

[![NPM version](https://img.shields.io/npm/v/@pbkware/fielded-text-node)](https://www.npmjs.com/package/@pbkware/fielded-text-node) [![License](https://img.shields.io/github/license/pbkware/fielded-text-node)](https://github.com/pbkware/fielded-text-node/blob/main/LICENSE)

This library allows you to read (parse) and write (generate) files with CSV like text data in manner similar to reading and writing from/to databases. It does this by associating a schema (called Meta) with the text data.

The schema supports a [wide variety](https://fieldedtext.org/introduction/capabilities/) of text data where lines consist of field values (not just CSV).  This includes data with lines that contain different fields depending on the value of key fields - where effectively the data is a database with multiple tables (each having records with different fields).

**Fielded Text is ideal for [reading](https://pbkware.github.io/fielded-text-ts/web/Guides/Reading/) and writing database like text files with complex schemas containing multiple [tables](https://pbkware.github.io/fielded-text-ts/web/Guides/Tables/)**.

Note that this library is built on top of the [@pbkware/fielded-text-web](https://pbkware.github.io/fielded-text-ts/Web/) library. It supports all the capabilities of `@pbkware/fielded-text-web` and adds the node run time - allowing reading and writing files.  *Do NOT import `@pbkware/fielded-text-web` if `@pbkware/fielded-text-node` is imported!* This is not necessary as `@pbkware/fielded-text-node` re-exports all types from `@pbkware/fielded-text-web`.

## How it works

The structure of this meta/schema is specified by the proposed [Fielded Text](https://fieldedtext.org/) standard. A schema can be created for text data using a [Fielded Text editor](https://fieldedtext.org/software/#applications) and then used by the library to read and write data in a similar fashion to reading and writing to/from database tables.

Below is a very simple parsing example:

### CSV File - data.csv

```text
Name,Age
John Doe,30
Jane Smith,25
```

### Meta File - meta.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name"/>
  <Field Name="Age" DataType="Integer"/>
</FieldedText>
```

### TypeScript parser app

```typescript
import { FtNodeFileReader, FtNodeXmlMetaSerialization } from "@pbkware/fielded-text-node";

// Load meta data from XML
const meta = FtNodeXmlMetaSerialization.deserializeFromFile(xmlMeta);
using reader = new FtNodeFileReader(csvFilePath, meta);

// Read and log the data
while (reader.read()) {
  console.log(
    reader.fieldList.get(0).asString,
    reader.fieldList.get(1).asBigInt,
  );
}
```

## Installation

```bash
npm install @pbkware/fielded-text-node
```

## Changes

See [Change Log](https://pbkware.github.io/fielded-text-ts/Change_Log/) for changes - including any breaking changes.

## More information

- **[Guides](https://pbkware.github.io/fielded-text-ts/Web/Guides/)**
  - [Getting Started](https://pbkware.github.io/fielded-text-ts/Web/Guides/Getting_Started/)
  - [Meta data](https://pbkware.github.io/fielded-text-ts/Web/Guides/Meta_data/)
  - [Reading](https://pbkware.github.io/fielded-text-ts/Web/Guides/Reading/)
  - [Tables](https://pbkware.github.io/fielded-text-ts/Web/Guides/Tables/)
- **[Files](https://pbkware.github.io/fielded-text-ts/Node/Files/)**
- **Examples** - Small examples that demonstrate various capabilities
  - [Web](https://pbkware.github.io/fielded-text-ts/Web/Guides/Examples/)
  - [Node](https://pbkware.github.io/fielded-text-ts/Node/Examples)
- **[Fielded Text Website](https://fieldedtext.org/)** - Overview of Fielded Text standard
- **[Fielded Text Standard](https://fieldedtext.org/standard/)** - The official specification (v0.9)
