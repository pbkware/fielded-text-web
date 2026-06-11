# Write Sequence Example

This example demonstrates writing CSV files with sequences, where different records have different field structures.

## What It Does

Writes pet data where each pet type has different fields:

- **Cats (Type=1)**: Type, Name, RunningSpeed
- **Dogs (Type=2)**: Type, Name, WalkDistance, RunningSpeed, Training
  - If Training=true: also Trainer, SessionCost
- **Goldfish (Type=3)**: Type, Name, Color, ChineseClassification

## Key Concepts

1. **Sequence Invocation**: Setting a redirect field value automatically invokes the corresponding sequence
2. **Field Availability**: Only set fields that belong to currently active sequences
3. **Root Sequence**: Always active and invoked automatically
4. **Conditional Sequences**: Additional sequences are invoked based on field values

## Important Rules

When writing with sequences:

❌ **DON'T** set field values for sequences that haven't been invoked yet
✅ **DO** set redirect field values first to invoke sequences
✅ **DO** set only fields that belong to active sequences

## Sample Output

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,false
2,Charlie,2,48,true,John,32
2,Max,0.5,30,false
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```

## How Sequence Invocation Works

```typescript
// Step 1: Set Type field (Root Sequence)
writer.getFieldByName('Type')!.asBigInt = DogType; // This invokes Dog Sequence

// Step 2: Set other Root Sequence fields
writer.getFieldByName('Name')!.asString = 'Charlie';

// Step 3: Set Dog Sequence fields
writer.getFieldByName('WalkDistance')!.asFloat = 2.0;
writer.getFieldByName('RunningSpeed')!.asFloat = 48.0;

// Step 4: Set Training field which invokes Training Sequence
writer.getFieldByName('Training')!.asBoolean = true; // Invokes Training Sequence!

// Step 5: Now Training Sequence fields are available
writer.getFieldByName('Trainer')!.asString = 'John';
writer.getFieldByName('SessionCost')!.asDecimal = 32.0;

// Step 6: Write the complete record
writer.write();
```

## Running

```bash
npx tsx examples/write-sequence/index.ts
```

## Output

```
Writing pets with sequences:

1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,false
2,Charlie,2,48,true,John,32
2,Max,0.5,30,false
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian

Successfully wrote 7 records with different sequences
```

## Related Examples

- [build-meta-with-sequences](../build-meta-with-sequences/) - Create the metadata
- [read-sequence](../read-sequence/) - Read data with sequences
- [write-sequence-events](../write-sequence-events/) - Easier writing with events
- [sequences](../sequences/) - General sequence handling
