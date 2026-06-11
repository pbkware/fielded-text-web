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

## More information

- **[Guides](https://pbkware.github.io/fielded-text-web/Guides/)**
  - [Getting Started](https://pbkware.github.io/fielded-text-web/Guides/Getting_Started/)
  - [Meta data](https://pbkware.github.io/fielded-text-web/Guides/Meta_data/)
- **[Examples](#examples)** - Small examples that demonstrate various capabilities
- **[Fielded Text Website](https://fieldedtext.org/)** - Overview of Fielded Text standard
- **[Fielded Text Standard](https://fieldedtext.org/standard/)** - The official specification (v0.9)

## Examples

The examples directory in the source repository contains practical demonstrations:

| Example                                                          | Description                                     |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| basic-read-build-meta                                            | Read CSV by building metadata in code           |
| basic-read-load- meta                                            | Read CSV by loading XML metadata                |
| basic-write                                                      | Write CSV with automatic quoting                |
| build-meta-with-sequences                                        | Build metadata for files with sequences         |
| count-records                                                    | Efficiently count records without reading data  |
| read-events                                                      | Use event hooks during reading                  |
| read-sequence                                                    | Read files with sequences (conditional fields)  |
| read-sequence-ordinal                                            | Read sequences using ordinals for performance   |
| sequences-with-readback                                          | Work with repeating groups                      |
| write-comments                                                   | Add comment lines to output                     |
| write-declared                                                   | Create files with declaration headers           |
| write-events                                                     | Use event hooks during writing                  |
| write-headings                                                   | Write heading lines                    |
| write-sequence                                                   | Write files with sequences (conditional fields) |
| write-sequence-events                                            | Write sequences using event-driven approach     |

### Running Examples

From within the examples directory:

```bash
# Run all examples
npm run all

# Run individual example
npm run basic-write
```
