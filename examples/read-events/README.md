# Read Events Example

This example demonstrates how to use event callbacks during reading to track progress, validate data, and compute statistics.

## What it does

1. Deserializes metadata from an XML string for a product list (Product, Quantity, Price)
2. Sets up event callbacks on `SerializationReader`:
   - `onRecordStarted` - Fires when a new record begins
   - `onFieldHeadingReady` - Fires when heading is read
   - `onFieldValueReady` - Fires when each field value is ready
   - `onRecordFinished` - Fires when a record completes
3. Reads CSV data while events track progress and calculate totals
4. Displays statistics after reading completes

## Running the example

```bash
npx tsx examples/read-events/index.ts
```

## Expected output

```
Reading CSV with event callbacks:
=================================
[Event] Field 0 heading ready: "Product"
[Event] Field 1 heading ready: "Quantity"
[Event] Field 2 heading ready: "Price"

[Event] Record 1 started
[Event] Field 0 (Product) value ready: Widget
[Event] Field 1 (Quantity) value ready: 10
[Event] Field 2 (Price) value ready: 19.99
  → Line total: 10 × $19.99 = $199.90
[Event] Record 1 finished

[Event] Record 2 started
[Event] Field 0 (Product) value ready: Gadget
[Event] Field 1 (Quantity) value ready: 5
[Event] Field 2 (Price) value ready: 29.99
  → Line total: 5 × $29.99 = $149.95
[Event] Record 2 finished

[Event] Record 3 started
[Event] Field 0 (Product) value ready: Doohickey
[Event] Field 1 (Quantity) value ready: 8
[Event] Field 2 (Price) value ready: 14.99
  → Line total: 8 × $14.99 = $119.92
[Event] Record 3 finished

=================================
Statistics:
  Total records: 3
  Total fields: 9
  Total order value: $469.77
```

## Key concepts

- **Event Callbacks**: Hook into the reading process at specific points
- **Meta Deserialization**: Load metadata from XML text with `FtXmlMetaSerialization.deserialize()`
- **Progress Tracking**: Monitor record and field processing
- **Validation**: Check field values as they're read
- **Statistics**: Calculate running totals and metrics
- **Debugging**: Event callbacks help debug parsing issues

## Use Cases for Events

Events are useful for:

- **Progress reporting**: Display progress for large files
- **Data validation**: Validate field values immediately
- **Statistics**: Calculate aggregates without storing all records
- **Logging**: Record parsing activity for debugging
- **Conditional processing**: Handle different record types differently
