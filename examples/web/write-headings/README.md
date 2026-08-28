---
title: Write Headings
---

# Write Headings Example

This [example](#code) demonstrates how to write multiple heading lines by configuring field headings in metadata.

## What it does

1. Deserializes metadata from an XML string
2. Sets `meta.headingLineCount = 3` to output three heading rows
3. Assigns per-field heading arrays for Product, Quantity, and Price
4. Writes a sample record and shows the generated output

## Running the example

```bash
npx tsx examples/write-headings/index.ts
```

## Expected output

```text
==============================
Inventory,Inventory,Pricing
Product,Quantity,Unit Price
Name,Count,USD
Widget,10,$19.99
```

## Key concepts

- **Heading line count**: Controls how many heading rows are emitted
- **Per-field headings**: Each field can provide one heading value per heading row
- **Writer header behavior**: Headings are written automatically before the first record

## Code

{@includeCode ./index.ts}
