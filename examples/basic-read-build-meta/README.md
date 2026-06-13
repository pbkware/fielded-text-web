---
title: Basic Read - Build Meta
---

# Basic Read Example - Build Meta in Code

This [example](#code) demonstrates how to read a CSV file using the FieldedText library by building the metadata programmatically in code.

## What it does

1. Creates an `FtMeta` object and configures it for comma-delimited text with 2 heading lines
2. Defines seven fields: PetName (string), Age (float), Color (string), DateReceived (DateTime), Price (decimal), NeedsWalking (boolean), and Type (string)
3. Configures field-specific formatting (e.g., date format for DateReceived)
4. Creates a root sequence containing these fields
5. Uses `FtReader` to parse CSV data
6. Reads and displays each record using `getFieldByName()` for field access

## Running the example

```bash
npx tsx examples/basic-read-build-meta/index.ts
```

## Expected output

```
Reading CSV data:
================

1: Rover, 4.5 years, Brown, received 2/12/2004, $80, walks: true, Dog
2: Charlie, null years, Gold, received 4/5/2007, $12.3, walks: false, Fish
3: Molly, 2 years, Black, received 12/25/2006, $25, walks: false, Cat
4: Gilly, null years, White, received 4/10/2007, $10, walks: false, Guinea Pig

Total records read: 4
```

## Key concepts

- **Meta**: Defines the structure and format of the fielded text
- **Fields**: Individual columns with specific data types (String, Float, DateTime, Decimal, Boolean)
- **Field Formatting**: Custom formats for date/time fields
- **Sequences**: Define the order and grouping of fields
- **FtReader**: High-level reader for parsing fielded text with `using` statement support
- **Field Access**: Use `getFieldByName()` for convenient field access by name

## Code

{@includeCode ./index.ts}
