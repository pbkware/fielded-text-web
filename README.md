# Fielded Text TypeScript Library (for web)

[![NPM version](https://img.shields.io/npm/v/@pbkware/fielded-text-web)](https://www.npmjs.com/package/@pbkware/fielded-text-web) [![License](https://img.shields.io/github/license/pbkware/fielded-text-web)](https://github.com/pbkware/fielded-text-web/blob/main/LICENSE)

This library allows you to parse and generate CSV like text data in manner similar to reading and writing from/to databases. It does this by associating a schema (called Meta) with the text data.

## How it works

The structure of this meta/schema is specified by the proposed [Fielded Text](https://fieldedtext.org/) standard.  Note that this standard is not limited to CSV data but handles a [wide variety](https://fieldedtext.org/introduction/capabilities/) of text data where lines consist of field values. For example it can also be used with lines having fixed width fields and also with lines containing different fields based on the value of key fields.

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
- **[Examples](https://pbkware.github.io/fielded-text-web/Guides/Examples/)** - Small examples that demonstrate various capabilities
- **[Fielded Text Website](https://fieldedtext.org/)** - Overview of Fielded Text standard
- **[Fielded Text Standard](https://fieldedtext.org/standard/)** - The official specification (v0.9)
