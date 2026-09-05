---
title: Basic Write
---

# Basic Write Example

This example demonstrates how to write CSV data using the FieldedText library.

## What it does

1. Creates metadata for a product inventory CSV file
2. Defines fields for Product name, Quantity, Price, and In Stock status
3. Uses `SerializationWriter` to generate CSV output
4. Writes multiple product records
5. Handles special characters (commas, quotes) automatically

## Running the example

```bash
npx tsx examples/basic-write/index.ts
```

{@includeCode ./index.ts}
