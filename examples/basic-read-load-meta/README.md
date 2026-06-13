---
title: Basic Read - Load Meta
---

# Basic Read with Load Meta Example

This [example](#code) demonstrates how to read a CSV file using metadata loaded from an XML string.

## What it does

1. Defines metadata in XML format (FieldedText standard format) with 2 heading lines
2. Loads the metadata using `XmlMetaSerializer.deserialize()`
3. Uses `FtReader` to parse CSV data
4. Gets field ordinals for efficient field access
5. Reads and displays each record using ordinal-based field access

## Running the example

```bash
npx tsx examples/basic-read-load-meta/index.ts
```

## Expected output

```
Loading metadata from XML...
Loaded metadata with 7 fields

Reading CSV data:
================

1: Rover, 4.5 years, Brown, received 2/12/2004, $80, walks: true, Dog
2: Charlie, null years, Gold, received 4/5/2007, $12.3, walks: false, Fish
3: Molly, 2 years, Black, received 12/25/2006, $25, walks: false, Cat
4: Gilly, null years, White, received 4/10/2007, $10, walks: false, Guinea Pig

Total records read: 4
```

## Key concepts

- **XML Metadata**: Standard format for defining fielded text structure
- **XmlMetaSerializer**: Serializes and deserializes metadata to/from XML
- **Field Ordinals**: Using `getOrdinal()` for efficient field access (faster than `getFieldByName()`)
- **Metadata Reusability**: XML metadata can be saved to files and reused
- **Standards Compliance**: XML format follows FieldedText Standard v0.9
- **FtReader**: High-level reader with `using` statement support

## Comparison with Build Meta

The `basic-read-build-meta` example builds metadata programmatically in code and uses `getFieldByName()` for field access. This example loads metadata from XML and uses field ordinals, which is useful for:

- Sharing metadata across different programs
- Version controlling metadata separately from code
- Interoperability with C# FieldedText library
- Complex metadata that's easier to manage in XML
- Better performance when accessing fields repeatedly (ordinal-based access is faster)

## Code

{@includeCode ./index.ts}
