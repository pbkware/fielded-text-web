// Read Events Example
// Demonstrates using event callbacks during reading

import {
  FtFieldHeadingReadyEventArgs,
  FtFieldValueReadyEventArgs,
  FtReader,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Sample CSV data
const csvData = `Product,Quantity,Price
Widget,10,19.99
Gadget,5,29.99
Doohickey,8,14.99`;

// Load metadata from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Product" />
  <Field DataType="Integer" Name="Quantity" />
  <Field DataType="Decimal" Name="Price" Format="C2" />
</FieldedText>`;

const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create reader
const reader = new FtReader(meta);

// Track statistics
let recordCount = 0;
let fieldCount = 0;
let totalValue = 0;

// Set up event callbacks
reader.onRecordStarted = () => {
  recordCount++;
  console.log(`\n[Event] Record ${recordCount} started`);
};

reader.onFieldHeadingReadReady = (args: FtFieldHeadingReadyEventArgs) => {
  const heading = args.field.headings[args.lineIndex] || args.field.name;
  const fieldIndex = reader.fieldList.indexOf(args.field);
  console.log(`[Event] Field ${fieldIndex} heading ready: "${heading}"`);
};

reader.onFieldValueReadReady = (args: FtFieldValueReadyEventArgs) => {
  fieldCount++;
  const fieldIndex = reader.fieldList.indexOf(args.field);
  console.log(
    `[Event] Field ${fieldIndex} (${args.field.name}) value ready: ${args.field.asString}`,
  );

  // Calculate running total
  if (args.field.name === "Quantity" || args.field.name === "Price") {
    if (args.field.name === "Price") {
      const quantity = Number(reader.fieldList.get(1).asBigInt);
      const price = reader.fieldList.get(2).asDecimal;
      const lineTotal = quantity * price;
      totalValue += lineTotal;
      console.log(
        `  → Line total: ${quantity} × $${price.toFixed(2)} = $${lineTotal.toFixed(2)}`,
      );
    }
  }
};

reader.onRecordFinished = () => {
  console.log(`[Event] Record ${recordCount} finished\n`);
};

// Read the data
console.log("Reading CSV with event callbacks:");
console.log("=================================");

reader.open(csvData);

while (reader.read()) {
  // Processing happens in event callbacks
}

// Print statistics
console.log("\n=================================");
console.log("Statistics:");
console.log(`  Total records: ${recordCount}`);
console.log(`  Total fields: ${fieldCount}`);
console.log(`  Total order value: $${totalValue.toFixed(2)}`);
