# Sequences Example

This example demonstrates **sequence redirects**, which allow different records to have different field structures based on field values.

## What it does

1. Deserializes metadata from an XML string with multiple sequences for different pet types (Cat, Dog, GoldFish)
2. Uses sequence redirects to include different fields based on a Type field
3. Demonstrates nested redirects (Dog training fields only appear if Training=true)
4. Writes sample data for different pet types
5. Reads the data back and displays appropriate fields for each type

## Running the example

```bash
npx tsx examples/sequences/index.ts
```

## Expected output

```text
=== Sequence Redirects Example ===

Demonstrates conditional field structures using sequence redirects.
Different pet types have different fields:

Metadata structure:
  Root: Type, Name
  Cat (Type=1): RunningSpeed
  Dog (Type=2): WalkDistance, RunningSpeed, Training
    Training (Training=true): Trainer, SessionCost
  GoldFish (Type=3): Color, Classification

=== Generated CSV ===
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,False
2,Charlie,2,48,True,John,32
2,Max,0.5,30,False
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian

Total redirects triggered: 8

=== Reading Back Records ===

1. Misty (Type 1): Running speed 45
2. Oscar (Type 1): Running speed 35
3. Buddy (Type 2): Walk 0.5, Run 35, No training
4. Charlie (Type 2): Walk 2, Run 48, Training with John ($32)
5. Max (Type 2): Walk 0.5, Run 30, No training
6. Bubbles (Type 3): Orange Wen
7. Flash (Type 3): Yellow Crucian
```

## Key concepts

- **Meta deserialization**: Load metadata from XML text with `FtXmlMetaSerialization.deserialize()`
- **Sequence redirects**: Change field structure based on field values
- **Root sequence**: Always present at the start of each record
- **Redirect conditions**: Match field values (ExactInteger, Boolean, ExactString, etc.)
- **Invokation delay**: Fields added immediately (AfterField) or after sequence ends (AfterSequence)
- **Nested redirects**: Redirects within redirected sequences

## Use cases

- **Variable record types**: Different fields for different record types in one file
- **Optional field groups**: Include fields only when needed
- **Type-based layouts**: Client records vs Transaction records
- **Conditional data**: Survey responses with follow-up questions
- **Polymorphic data**: Different attributes based on entity type
