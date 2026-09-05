---
title: Basic Read
---

# Basic Read Example

This example demonstrates reading a CSV file with the Node.js FieldedText library while loading metadata from a local XML file.

## What it does

1. Loads field metadata from the local `meta.ftm` file using `FtNodeXmlMetaSerialization`
2. Opens the local CSV file with `FtNodeFileReader`
3. Reads records using field ordinals
4. Displays typed field values and the total record count

## Running the example

```bash
npm run node-basic-read
```

The command should be run from the `examples` directory. The example reads `basic-read-example.csv` from this directory and reports the file path after processing.

## Node-specific APIs

- **`FtNodeXmlMetaSerialization`**: Loads the XML metadata from a file.
- **`FtNodeFileReader`**: Reads fielded text directly from a file path.
- **Field ordinals**: `getFieldIndexByName()` provides efficient typed field access.

{@includeCode ./index.ts}
