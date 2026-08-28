---
title: Build Meta With Sequences
---

# Build Meta With Sequences Example

This [example](#code) demonstrates how to programmatically build metadata that uses sequences (repeating groups and conditional structures).

## What It Does

Creates a metadata definition for a CSV file that describes three types of pets with different fields for each type:

### Root Sequence (All Records)

- **Type**: Integer (1=Cat, 2=Dog, 3=Goldfish)
- **Name**: String

### Cat Sequence (Type = 1)

- **RunningSpeed**: Float

### Dog Sequence (Type = 2)

- **WalkDistance**: Float
- **RunningSpeed**: Float
- **Training**: Boolean
  - If `Training = true`, includes Training Sequence:
    - **Trainer**: String
    - **SessionCost**: Decimal

### GoldFish Sequence (Type = 3)

- **Color**: String
- **ChineseClassification**: String

## Key Concepts

1. **Sequences**: Groups of fields that appear together
2. **Sequence Redirects**: Conditional inclusion of sequences based on field values
3. **ExactInteger Redirect**: Invokes a sequence when a field matches a specific integer value
4. **Boolean Redirect**: Invokes a sequence when a boolean field is true
5. **Invokation Delay**: Controls when a sequence is invoked (after field or after sequence)

## Running

```bash
npx tsx examples/build-meta-with-sequences/index.ts
```

## Output

Generates and displays the XML metadata definition that can be saved to a `.ftm` file and used with readers/writers.

## Code

{@includeCode ./index.ts}
