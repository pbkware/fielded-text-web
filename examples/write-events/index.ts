// Write Events Example
// Demonstrates using event callbacks during writing

import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Meta XML for writing data
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1" HeadingConstraint="NameConstant">
  <Field Name="Product" />
  <Field DataType="Integer" Name="Quantity" />
  <Field DataType="Decimal" Name="Price" Format="N2" />
</FieldedText>`;

// Load metadata from XML
const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create writer
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

// Track statistics
let recordCount = 0;
let fieldCount = 0;
let totalValue = 0;

// Set up event callbacks
writer.onRecordStarted = (args) => {
  recordCount++;
  console.log(`[Event] Record ${args.recordIndex} started`);
};

writer.onFieldValueWriteReady = (args) => {
  fieldCount++;
  const fieldIndex = writer.fieldList.indexOf(args.field);
  console.log(
    `[Event] Field ${fieldIndex} (${args.field.name}) value ready: ${args.field.value}`,
  );

  // Validate data before writing
  if (args.field.name === "Quantity") {
    const quantity = Number(args.field.asBigInt);
    if (quantity < 0) {
      console.warn(`  ⚠ Warning: Negative quantity detected: ${quantity}`);
    }
  }

  if (args.field.name === "Price") {
    const price = args.field.asDecimal;
    if (price < 0) {
      console.warn(`  ⚠ Warning: Negative price detected: ${price}`);
    }

    // Calculate line total
    const quantity = Number(writer.fieldList.get(1).asBigInt);
    const lineTotal = quantity * price;
    totalValue += lineTotal;
    console.log(
      `  → Line total: ${quantity} × ${price.toFixed(2)} = ${lineTotal.toFixed(2)}`,
    );
  }
};

writer.onRecordFinished = (args) => {
  console.log(`[Event] Record ${args.recordIndex} finished`);
};

console.log("Writing CSV with event callbacks:");
console.log("=================================\n");

writer.writeHeader();

// Write some products
const products = [
  { product: "Widget", quantity: 10, price: 19.99 },
  { product: "Gadget", quantity: 5, price: 29.99 },
  { product: "Doohickey", quantity: 8, price: 14.99 },
  { product: "Thingamajig", quantity: -2, price: 9.99 }, // Invalid quantity!
  { product: "Whatsit", quantity: 12, price: -5.0 }, // Invalid price!
];

for (const item of products) {
  console.log(); // Blank line between records
  writer.fieldList.get(0).asString = item.product;
  writer.fieldList.get(1).asBigInt = BigInt(item.quantity);
  writer.fieldList.get(2).asDecimal = item.price;
  writer.write();
}

// Print statistics and output
console.log("\n=================================");
console.log("Statistics:");
console.log(`  Total records written: ${recordCount}`);
console.log(`  Total fields written: ${fieldCount}`);
console.log(`  Total order value: ${totalValue.toFixed(2)}`);

console.log("\n=================================");
console.log("Generated CSV:");
console.log("=================================");
console.log(stringWriter.toString());
