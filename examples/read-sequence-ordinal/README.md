# Read Sequence with Ordinals Example

This example demonstrates using field ordinals (indices) for faster reading of large files with sequences.

## What It Does

Deserializes sequence metadata from an XML string and reads the same pet data as [read-sequence](../read-sequence/), but uses **ordinals** instead of field names for better performance.

### What is an Ordinal?

An ordinal is the **index** of a field in the current record. For example, in a record with fields `[Type, Name, RunningSpeed]`, the ordinals are:

- Type = 0
- Name = 1
- RunningSpeed = 2

## Why Use Ordinals?

When accessing fields by name (e.g., `reader.getFieldByName("Type")`), the library must:

1. Search the field list for a matching name
2. Return the field at that index

When using ordinals (e.g., `reader.fieldList.get(0)`), you:

1. Access the field directly by index ✅

For large files with many records, this performance difference adds up significantly.

## Key Concepts

1. **getOrdinal(fieldName)**: Look up a field's index by name (once per table)
2. **Ordinal Caching**: Calculate ordinals once, reuse for all records in a table
3. **Table Boundaries**: Ordinals become invalid when table changes (new sequence structure)
4. **nextResult()**: Move to next table and recalculate ordinals
5. **Meta Deserialization**: Load metadata from XML text with `FtXmlMetaSerialization.deserialize()`

## Running

```bash
npx tsx examples/read-sequence-ordinal/index.ts
```

## Output

```
Reading pets with sequences using ordinals (faster):

1,1: 1,Misty,45
2,1: 1,Oscar,35
3,2: 2,Buddy,0.5,35,false
4,3: 2,Charlie,2,48,true,John,32
5,4: 2,Max,0.5,30,false
6,5: 3,Bubbles,Orange,Wen
7,5: 3,Flash,Yellow,Crucian

Note: Using ordinals is faster than field names for large files
because it avoids name lookup on every field access.
```

The first number is record count, second is table count.

## When to Use

Use ordinals when:

- ✅ Processing large files (millions of records)
- ✅ Performance is critical
- ✅ You can calculate ordinals once per table

Use field names when:

- ✅ File is small
- ✅ Code readability is more important than performance
- ✅ Prototyping or one-off scripts

## Pattern

```typescript
let recOrdinals: number[] | null = null;

do {
  while (reader.read()) {
    if (recOrdinals === null) {
      // Calculate ordinals once per table
      recOrdinals = calculateRecordOrdinals(reader);
    }

    // Use ordinals for fast access
    const value = reader.fieldList.get(recOrdinals[i]).asObject;
  }

  // Reset ordinals when table changes
  recOrdinals = null;
} while (reader.nextResult());
```

## Related Examples

- [read-sequence](../read-sequence/) - Same logic using field names
- [build-meta-with-sequences](../build-meta-with-sequences/) - Create the metadata
- [count-records](../count-records/) - Another performance optimization
