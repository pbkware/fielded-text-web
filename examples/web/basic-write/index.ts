// Basic Write Example
// Demonstrates writing CSV data using the FieldedText library
// This example matches the C# BasicWrite example - it loads meta from BasicExampleMeta.ftm

import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Meta as XML
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field Name="PetName" />
  <Field DataType="Float" Name="Age" />
  <Field Name="Color" />
  <Field DataType="DateTime" Name="DateReceived" Format="d MMM yyyy" />
  <Field DataType="Decimal" Name="Price" />
  <Field DataType="Boolean" Name="NeedsWalking" />
  <Field Name="Type" />
</FieldedText>
`;

// Define FieldNames
const PetNameFieldName = "PetName";
const AgeFieldName = "Age";
const ColorFieldName = "Color";
const DateReceivedFieldName = "DateReceived";
const PriceFieldName = "Price";
const NeedsWalkingFieldName = "NeedsWalking";
const TypeFieldName = "Type";

// Load meta
const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create output file path in temp directory
const output = new FtStringWriter();

// Create writer - single class instantiation!
const writer = new FtWriter(meta, output);

console.log("Writing pet data:");
console.log("=================\n");

// Write 1st Record
writer.setFieldValueByName(PetNameFieldName, "Rover");
writer.setFieldValueByName(AgeFieldName, 4.5);
writer.setFieldValueByName(ColorFieldName, "Brown");
writer.setFieldValueByName(DateReceivedFieldName, new Date(2004, 1, 12)); // Feb 12, 2004
writer.setFieldValueByName(PriceFieldName, 80);
writer.setFieldValueByName(NeedsWalkingFieldName, true);
writer.setFieldValueByName(TypeFieldName, "Dog");
writer.write();
console.log("Record 1: Rover (Dog)");

// Write 2nd Record
writer.setFieldValueByName(PetNameFieldName, "Charlie");
writer.setFieldValueByName(AgeFieldName, null);
writer.setFieldValueByName(ColorFieldName, "Gold");
writer.setFieldValueByName(DateReceivedFieldName, new Date(2007, 3, 5)); // Apr 5, 2007
writer.setFieldValueByName(PriceFieldName, 12.3);
writer.setFieldValueByName(NeedsWalkingFieldName, false);
writer.setFieldValueByName(TypeFieldName, "Fish");
writer.write();
console.log("Record 2: Charlie (Fish)");

// Read and display the generated CSV

console.log("\nGenerated CSV:");
console.log("==============");
console.log(output.toString());
