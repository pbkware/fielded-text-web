---
title: Write Events
---

# Write Events Example

This [example](#code) demonstrates how to use event callbacks during writing to validate data, track progress, and compute statistics.

## What it does

1. Creates metadata for a product list (Product, Quantity, Price)
2. Sets up event callbacks on `SerializationWriter`:
   - `onRecordStarted` - Fires when starting to write a record
   - `onFieldValueReady` - Fires when each field value is set and ready to write
   - `onRecordFinished` - Fires when a record is completely written
3. Writes CSV data while events validate values and calculate totals
4. Displays warnings for invalid data (negative quantities/prices)
5. Displays statistics and generated CSV output

## Running the example

```bash
npx tsx examples/write-events/index.ts
```

## Expected output

```text
Writing CSV with event callbacks:
=================================

[Event] Record 1 started
[Event] Field 0 (Product) value ready: Widget
[Event] Field 1 (Quantity) value ready: 10
[Event] Field 2 (Price) value ready: 19.99
  → Line total: 10 × 19.99 = 199.90
[Event] Record 1 finished

[Event] Record 2 started
[Event] Field 0 (Product) value ready: Gadget
[Event] Field 1 (Quantity) value ready: 5
[Event] Field 2 (Price) value ready: 29.99
  → Line total: 5 × 29.99 = 149.95
[Event] Record 2 finished

[Event] Record 3 started
[Event] Field 0 (Product) value ready: Doohickey
[Event] Field 1 (Quantity) value ready: 8
[Event] Field 2 (Price) value ready: 14.99
  → Line total: 8 × 14.99 = 119.92
[Event] Record 3 finished

[Event] Record 4 started
[Event] Field 0 (Product) value ready: Thingamajig
[Event] Field 1 (Quantity) value ready: -2
  ⚠ Warning: Negative quantity detected: -2
[Event] Field 2 (Price) value ready: 9.99
  → Line total: -2 × 9.99 = -19.98
[Event] Record 4 finished

[Event] Record 5 started
[Event] Field 0 (Product) value ready: Whatsit
[Event] Field 1 (Quantity) value ready: 12
[Event] Field 2 (Price) value ready: -5
  ⚠ Warning: Negative price detected: -5
  → Line total: 12 × -5.00 = -60.00
[Event] Record 5 finished

=================================
Statistics:
  Total records written: 5
  Total fields written: 15
  Total order value: 389.79

=================================
Generated CSV:
=================================
Product,Quantity,Price
Widget,10,19.99
Gadget,5,29.99
Doohickey,8,14.99
Thingamajig,-2,9.99
Whatsit,12,-5.00
```

## Key concepts

- **Event Callbacks**: Hook into the writing process at specific points
- **Data Validation**: Check field values before they're written
- **Progress Tracking**: Monitor writing progress
- **Statistics**: Calculate running totals and metrics
- **Quality Assurance**: Detect and log invalid data
- **NameConstant Heading Constraint**: Demonstrates generating headings from field name

## Use Cases for Events

Events are useful for:

- **Validation**: Ensure data quality before writing
- **Progress reporting**: Display progress for large exports
- **Logging**: Record what data was written
- **Auditing**: Track changes and data flow
- **Statistics**: Calculate aggregates during export
- **Error detection**: Identify data issues early

## Code

{@includeCode ./index.ts}
