# Write Sequence with Events Example

This example demonstrates using **events** to simplify writing files with sequences. Events automatically handle sequence redirects, making the code much cleaner.

## What It Does

Writes the same pet data as [write-sequence](../write-sequence/), but uses an event-driven approach that's easier to work with when dealing with complex sequence structures.

## Key Concepts

1. **onFieldValueWriteReady**: Fires for each field before it's written
2. **Automatic Sequence Handling**: Events fire in the correct order, accounting for redirects
3. **Declarative Data**: Define data in an array, let events map it to fields
4. **onRecordFinished**: Fires after each record is written

## Advantages Over Manual Approach

### Manual (write-sequence example):

```typescript
// Must manually set each field and track active sequences
writer.getFieldByName('Type')!.asBigInt = CatType; // Invokes Cat Sequence
writer.getFieldByName('Name')!.asString = 'Misty';
writer.getFieldByName('RunningSpeed')!.asFloat = 45.0;
writer.write();
```

### Event-Driven (this example):

```typescript
// Events fire for each field automatically
writer.onFieldValueWriteReady = (args) => {
  args.field.asObject = values[args.recordIndex][args.field.id];
};

while (!finished) {
  writer.write(); // Events handle everything
}
```

## How It Works

1. **Define data** in a 2D array: `values[recordIndex][fieldId]`
2. **Wire event handler**: `onFieldValueWriteReady` fires for each field
3. **Set field value** from the data array using field ID as index
4. **Writer handles redirects**: When you set a redirect field value, the writer:
   - Detects the redirect condition
   - Invokes the appropriate sequence
   - Fires subsequent events for the new sequence's fields
5. **No manual tracking needed**: You don't need to know which sequence is active

## Event Flow Example

For a Dog record with training:

```
1. onFieldValueWriteReady(Type) → Set Type=2 → Dog Sequence invoked
2. onFieldValueWriteReady(Name) → Set Name
3. onFieldValueWriteReady(WalkDistance) → Set WalkDistance
4. onFieldValueWriteReady(RunningSpeed) → Set RunningSpeed
5. onFieldValueWriteReady(Training) → Set Training=true → Training Sequence invoked
6. onFieldValueWriteReady(Trainer) → Set Trainer
7. onFieldValueWriteReady(SessionCost) → Set SessionCost
8. onRecordFinished → Record complete
```

## Running

```bash
npx tsx examples/write-sequence-events/index.ts
```

## Output

```
Writing pets with sequences using events:

1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,false
2,Charlie,2,48,true,John,32
2,Max,0.5,30,false
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian

Successfully wrote 7 records using event-driven approach

Advantages of using events:
- No need to manually track which sequences are active
- onFieldValueWriteReady fires for each field in correct order
- Automatically handles sequence redirects
- Simpler code when working with complex sequence structures
```

## When to Use Events

✅ **Use events when:**

- Working with complex sequence structures
- Data is in arrays or database results
- You want cleaner, more maintainable code
- Multiple sequences with many redirects

✅ **Use manual approach when:**

- Simple data without sequences
- One-off records with unique values
- Direct mapping from objects to fields

## Related Examples

- [write-sequence](../write-sequence/) - Manual approach for comparison
- [write-events](../write-events/) - Events without sequences
- [read-sequence](../read-sequence/) - Reading with sequences
- [build-meta-with-sequences](../build-meta-with-sequences/) - Create the metadata
