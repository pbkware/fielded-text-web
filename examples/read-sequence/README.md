# Read Sequence Example

This example demonstrates reading CSV files with sequences, where different records have different field structures based on field values.

## What It Does

Deserializes sequence metadata from an XML string, then reads a pet database where each record type has different fields:

Reads a pet database where each record type (Cat, Dog, Goldfish) has different fields:

- **Cats (Type=1)**: Type, Name, RunningSpeed
- **Dogs (Type=2)**: Type, Name, WalkDistance, RunningSpeed, Training
  - If Training=true: also Trainer, SessionCost
- **Goldfish (Type=3)**: Type, Name, Color, ChineseClassification

## Key Concepts

1. **Sequences**: Define groups of fields that appear together
2. **Sequence Redirects**: Conditional field structures based on field values
3. **AutoNextTable**: Automatically continue reading across table boundaries
4. **Table Boundaries**: When sequence structure changes, a new "table" starts
5. **Field Access by Name**: Use `getFieldByName()` to access fields in active sequences
6. **Meta Deserialization**: Load metadata from XML text with `FtXmlMetaSerialization.deserialize()`

## Sample Data

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,false
2,Charlie,2,48,true,John,32
2,Max,0.5,30,false
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```

## Running

```bash
npx tsx examples/read-sequence/index.ts
```

## Output

```
Reading pets with sequences:

1: 1,Misty,45
2: 1,Oscar,35
3: 2,Buddy,0.5,35,false
4: 2,Charlie,2,48,true,John,32
5: 2,Max,0.5,30,false
6: 3,Bubbles,Orange,Wen
7: 3,Flash,Yellow,Crucian

Total records: 7
```

## Important Notes

- **autoNextTable = true**: Required to read across table boundaries automatically
- **Field Names**: Accessing fields by name works across all sequences
- **Conditional Logic**: Application must check redirect field values to know which fields are present

## Related Examples

- [build-meta-with-sequences](../build-meta-with-sequences/) - Create the metadata
- [read-sequence-ordinal](../read-sequence-ordinal/) - Faster reading using ordinals
- [write-sequence](../write-sequence/) - Write data with sequences
- [sequences](../sequences/) - General sequence handling
