---
title: Count Records
---

# Count Records Example

This [example](#code) demonstrates how to efficiently count records in a CSV file without reading the full data.

## What It Does

Counts the number of records in a CSV file using the `seekEnd()` method, which is much faster than reading all records because it doesn't parse field values.
The example deserializes metadata from an XML string before creating the reader.

## Key Concepts

1. **seekEnd()**: Fast-forward to the end of the file to get record count
2. **Performance**: Much faster than `read()` loop for large files
3. **Record counting**: Get total records without processing data
4. **Meta deserialization**: Load metadata from XML text via `FtXmlMetaSerialization.deserialize()`

## Running

```bash
npx tsx examples/count-records/index.ts
```

## Output

```
Record count: 10
```

## When to Use

Use `seekEnd()` when you:

- Only need to know the total number of records
- Want to display progress indicators (e.g., "Processing record X of Y")
- Need to pre-allocate arrays or buffers based on record count
- Want to validate file size before processing

## Alternative Approach

If you need to process records AND count them, use a regular `read()` loop and check `reader.recordCount` after reading all records:

```typescript
while (reader.read()) {
  // Process record
}
console.log(`Total records: ${reader.recordCount}`);
```

## Code

{@includeCode ./index.ts}
