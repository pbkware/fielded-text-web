# Basic Write Example

This example demonstrates how to write CSV data using the FieldedText library.

## What it does

1. Creates metadata for a product inventory CSV file
2. Defines fields for Product name, Quantity, Price, and In Stock status
3. Uses `FtWriter` to generate CSV output
4. Writes multiple product records
5. Handles special characters (commas, quotes) automatically

## Running the example

```bash
npx tsx examples/basic-write/index.ts
```

## Expected output

```
Writing product data:
====================

Record 1: Widget, Small - $9.99
Record 2: Gadget Pro - $149.95
Record 3: Tool Set - $79.50
Record 4: Premium "Elite" Package - $299.00

Generated CSV:
==============
Product,Quantity,Price,In Stock
"Widget, Small",100,9.99,True
Gadget Pro,50,149.95,True
Tool Set,0,79.50,False
"Premium ""Elite"" Package",25,299.00,True
```

## Key features demonstrated

- **Automatic quoting**: Fields containing commas or quotes are automatically quoted
- **Quote stuffing**: Embedded quotes are duplicated (CSV standard)
- **Number formatting**: Prices formatted to 2 decimal places
- **Type safety**: Fields are strongly typed
