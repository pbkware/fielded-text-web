// Write Header Example
// Demonstrates manually writing heading lines

import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Load metadata from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field Name="Product" />
  <Field DataType="Integer" Name="Quantity" />
  <Field DataType="Decimal" Name="Price" Format="C2" />
</FieldedText>`;

const productFieldName = "Product";
const quantityFieldName = "Quantity";
const priceFieldName = "Price";

// Load metadata from XML
const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Meta does not include any heading lines, so we set them here for the writer to use
meta.headingLineCount = 3;

// Get Meta fields
const productField = meta.fieldList.find(productFieldName);
const quantityField = meta.fieldList.find(quantityFieldName);
const priceField = meta.fieldList.find(priceFieldName);

// Set headings for each field
productField!.headings = ["Inventory", "Product", "Name"];
quantityField!.headings = ["Inventory", "Quantity", "Count"];
priceField!.headings = ["Pricing", "Unit Price", "USD"];

// Create writer
const textWriter = new FtStringWriter();
const writer = new FtWriter(meta, textWriter);

console.log("==============================");

// Write data
writer.fieldList.get(0).asString = "Widget";
writer.fieldList.get(1).asBigInt = BigInt(10);
writer.fieldList.get(2).asDecimal = 19.99;
writer.write(); // The write of first record will first write header (including headings), if header has not yet been written

console.log(textWriter.toString());
console.log();
