# Fielded Text TypeScript Library (for web)

[![NPM version](https://img.shields.io/npm/v/@pbkware/fielded-text-web)](https://www.npmjs.com/package/@pbkware/fielded-text-web) [![License](https://img.shields.io/github/license/pbkware/fielded-text-web)](https://github.com/pbkware/fielded-text-web/blob/main/LICENSE)

This library allows you to parse and generate CSV like text data in manner similar to reading and writing from/to databases. It does this by associating a schema (called Meta) with the text data.

The schema supports a [wide variety](https://fieldedtext.org/introduction/capabilities/) of text data where lines consist of field values (not just CSV).  This includes data with lines that contain different fields depending on the value of key fields - where effectively the data is a database with multiple tables (each having records with different fields). Fielded Text is ideal for [reading](https://pbkware.github.io/fielded-text-web/Guides/Reading/) and writing [database](https://pbkware.github.io/fielded-text-web/Guides/Tables/) like text data.

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

## Installation

```bash
npm install @pbkware/fielded-text-web
```

## Breaking Changes

See [Change Log](https://pbkware.github.io/fielded-text-web/Change_Log/) for any breaking changes.

## More information

- **[Guides](https://pbkware.github.io/fielded-text-web/Guides/)**
  - [Getting Started](https://pbkware.github.io/fielded-text-web/Guides/Getting_Started/)
  - [Meta data](https://pbkware.github.io/fielded-text-web/Guides/Meta_data/)
  - [Reading](https://pbkware.github.io/fielded-text-web/Guides/Reading/)
  - [Tables](https://pbkware.github.io/fielded-text-web/Guides/Tables/)
- **[Examples](https://pbkware.github.io/fielded-text-web/Guides/Examples/)** - Small examples that demonstrate various capabilities
- **[Fielded Text Website](https://fieldedtext.org/)** - Overview of Fielded Text standard
- **[Fielded Text Standard](https://fieldedtext.org/standard/)** - The official specification (v0.9)
