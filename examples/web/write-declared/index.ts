// Declared Output Example
// Demonstrates writing fielded text with a declaration header

import {
  FtMetaReferenceType,
  FtStringWriter,
  FtWriter,
  FtWriterSettings,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Meta as XML
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="0" LineCommentChar="!">
  <Field Name="PetName" />
  <Field DataType="Float" Name="Age" />
  <Field Name="Color" />
  <Field DataType="DateTime" Name="DateReceived" Format="d MMM yyyy" />
  <Field DataType="Decimal" Name="Price" />
  <Field DataType="Boolean" Name="NeedsWalking" />
  <Field Name="Type" />
</FieldedText>
`;

// Define field names
const PetNameFieldName = "PetName";
const AgeFieldName = "Age";
const ColorFieldName = "Color";
const DateReceivedFieldName = "DateReceived";
const PriceFieldName = "Price";
const NeedsWalkingFieldName = "NeedsWalking";
const TypeFieldName = "Type";

// Load meta from XML string
const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create FtWriterSettings to flag we want Declared file written
const settings: FtWriterSettings = {
  declared: true,
  metaReferenceType: FtMetaReferenceType.Embedded,
};

// Create writer
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter, settings);

console.log("Writing declared fielded text:");
console.log("==============================\n");

// Write 1st Record
writer.setFieldValueByName(PetNameFieldName, "Rover");
writer.setFieldValueByName(AgeFieldName, 4.5);
writer.setFieldValueByName(ColorFieldName, "Brown");
writer.setFieldValueByName(DateReceivedFieldName, new Date(2004, 1, 12)); // Feb 12, 2004
writer.setFieldValueByName(PriceFieldName, 80);
writer.setFieldValueByName(NeedsWalkingFieldName, true);
writer.setFieldValueByName(TypeFieldName, "Dog");
writer.write();
console.log("Wrote record 1: Rover (Dog)");

// Write 2nd Record
writer.setFieldValueByName(PetNameFieldName, "Charlie");
writer.setFieldValueByName(AgeFieldName, null);
writer.setFieldValueByName(ColorFieldName, "Gold");
writer.setFieldValueByName(DateReceivedFieldName, new Date(2007, 3, 5)); // Apr 5, 2007
writer.setFieldValueByName(PriceFieldName, 12.3);
writer.setFieldValueByName(NeedsWalkingFieldName, false);
writer.setFieldValueByName(TypeFieldName, "Fish");
writer.write();
console.log("Wrote record 2: Charlie (Fish)");

// Display the generated output
console.log("\nGenerated declared fielded text:");
console.log("=================================");
console.log(stringWriter.toString());

console.log("\nNotice the !|!Fielded Text^| signature at the top!");
console.log(
  "This declares the file as FieldedText format version 1.1 with embedded meta.",
);
