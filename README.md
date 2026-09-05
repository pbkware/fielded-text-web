# Fielded Text TypeScript Library (for web)

[![Web NPM version](https://img.shields.io/npm/v/@pbkware/fielded-text-web)](https://www.npmjs.com/package/@pbkware/fielded-text-web) [![Web License](https://img.shields.io/github/license/pbkware/fielded-text-web)](https://github.com/pbkware/fielded-text-web/blob/main/LICENSE)\
[![Node NPM version](https://img.shields.io/npm/v/@pbkware/fielded-text-node)](https://www.npmjs.com/package/@pbkware/fielded-text-node) [![Node License](https://img.shields.io/github/license/pbkware/fielded-text-node)](https://github.com/pbkware/fielded-text-node/blob/main/LICENSE)

This repository contains 2 libraries for reading (parsing) and writing (generating) text data whose lines consists of fields (eg. CSV, TSV and text data with fixed length fields).  They work by associating a schema (called Meta) with the text data which allows reading and writing text data in a manner similar to reading and writing from/to databases.

The schema supports a [wide variety](https://fieldedtext.org/introduction/capabilities/) of field formatting and structure in text data.  This includes data with lines that contain different fields depending on the value of key fields - where effectively the data is a database with multiple tables (each having records with different fields).

**Fielded Text is ideal for [reading](https://pbkware.github.io/fielded-text-web/Guides/Reading/) and writing database like text data with complex schemas containing multiple [tables](https://pbkware.github.io/fielded-text-web/Guides/Tables/)**.

## How it works

The structure of this meta/schema is specified by the proposed [Fielded Text](https://fieldedtext.org/) standard. A schema can be created for text data using a [Fielded Text editor](https://fieldedtext.org/software/#applications) and then used by the library to read and write data in a similar fashion to reading and writing to/from database tables.

Below is a very simple parsing example:

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

const reader = new FtReader(meta, csvData);

// Read and log the data
while (reader.read()) {
  console.log(
    reader.fieldList.get(0).asString,
    reader.fieldList.get(1).asBigInt,
  );
}
```

## Browser and Node library

There are 2  separate libraries for browser and node environments:

- **[@pbkware/fielded-text-web](https://pbkware.github.io/fielded-text-ts/Web/)**\
Only includes "Browser" run time. Use in "Browser" applications.
- **[@pbkware/fielded-text-node](https://pbkware.github.io/fielded-text-ts/Node/)**\
Includes "Node" run time. Use in "Node" applications.\
*Note that you should NOT import `@pbkware/fielded-text-web` if `@pbkware/fielded-text-node` is imported!* This is not necessary as `@pbkware/fielded-text-node` re-exports all types from `@pbkware/fielded-text-web`.

## Changes

See [Change Log](https://pbkware.github.io/fielded-text-ts/Change_Log/) for changes - including any breaking changes.

## More information

- **[Guides](https://pbkware.github.io/fielded-text-ts/Web/Guides/)**
  - [Getting Started](https://pbkware.github.io/fielded-text-ts/Web/Guides/Getting_Started/)
  - [Meta data](https://pbkware.github.io/fielded-text-ts/Web/Guides/Meta_data/)
  - [Reading](https://pbkware.github.io/fielded-text-ts/Web/Guides/Reading/)
  - [Tables](https://pbkware.github.io/fielded-text-ts/Web/Guides/Tables/)
- **[Files](https://pbkware.github.io/fielded-text-ts/node/Files/)**
- **Examples** - Small examples that demonstrate various capabilities
  - [Web](https://pbkware.github.io/fielded-text-ts/Web/Guides/Examples/)
  - [Node](https://pbkware.github.io/fielded-text-ts/Node/Examples)
- **[Fielded Text Website](https://fieldedtext.org/)** - Overview of Fielded Text standard
- **[Fielded Text Standard](https://fieldedtext.org/standard/)** - The official specification (v0.9)
