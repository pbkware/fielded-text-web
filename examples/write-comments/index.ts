// Write Comments Example
// Demonstrates adding comment lines to output

import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Load metadata from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText LineCommentChar="#" HeadingLineCount="1">
  <Field Name="Name" Headings="Customer Name" />
  <Field DataType="Integer" Name="Age" Format="G" Headings="Age" />
</FieldedText>`;

const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create writer
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

console.log("Writing CSV with comments:");
console.log("=========================\n");

// Write file header comments
writer.writeComment("====================================");
writer.writeComment("Customer Data Export");
writer.writeComment("====================================");
writer.writeComment("");
writer.writeComment(`Generated: ${new Date().toISOString()}`);
writer.writeComment("Generator: FieldedText TypeScript Library");
writer.writeComment("Format: CSV (Comma-Separated Values)");
writer.writeComment("");

// Write section comment
writer.writeComment("--- Active Customers ---");

// Write header
writer.writeHeader(); // Write header manually. Otherwise cannot include comments between header and first record

// Write section comment
writer.writeComment("--- Data Records ---");

// Write data records
writer.fieldList.get(0).asString = "John Doe";
writer.fieldList.get(1).asBigInt = BigInt(30);
writer.write();

writer.fieldList.get(0).asString = "Jane Smith";
writer.fieldList.get(1).asBigInt = BigInt(25);
writer.write();

// Write another section comment
writer.writeComment("");
writer.writeComment("--- Inactive Customers ---");

writer.fieldList.get(0).asString = "Bob Johnson";
writer.fieldList.get(1).asBigInt = BigInt(45);
writer.write();

// Write footer comments
writer.writeComment("");
writer.writeComment("End of customer data");
writer.writeComment("Total records: 3");

console.log("Generated CSV:");
console.log("==============");
console.log(stringWriter.toString());

console.log("\nKey observations:");
console.log("- Comments start with # (defined by lineCommentChar)");
console.log("- Comments can appear anywhere in the file");
console.log("- Comments are ignored when reading");
console.log("- Comments are useful for documentation and metadata");
