// Basic Read with Load Meta Example
// Demonstrates reading a CSV file by loading metadata from XML

import { FtReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// Sample CSV data - matches C# BasicExample.csv
const csvData = `"Pet Name","Age","Color","Date Received","Price","Needs Walking","Type"
"","(Years)","","","(Dollars)","",""
Rover,4.5,Brown,12 Feb 2004,80,True,Dog
Charlie,,Gold,5 Apr 2007,12.3,False,Fish
Molly,2,Black,25 Dec 2006,25,False,Cat
Gilly,,White,10 Apr 2007,10,False,Guinea Pig`;

// Meta XML - matches C# BasicExampleMeta.ftm
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="2">
  <Field Name="PetName" />
  <Field DataType="Float" Name="Age" />
  <Field Name="Color" />
  <Field DataType="DateTime" Name="DateReceived" Format="d MMM yyyy" />
  <Field DataType="Decimal" Name="Price" />
  <Field DataType="Boolean" Name="NeedsWalking" />
  <Field Name="Type" />
</FieldedText>`;

// Define field names
const petNameFieldName = "PetName";
const ageFieldName = "Age";
const colorFieldName = "Color";
const dateReceivedFieldName = "DateReceived";
const priceFieldName = "Price";
const needsWalkingFieldName = "NeedsWalking";
const typeFieldName = "Type";

// Load metadata from XML
console.log("Loading metadata from XML...");
const meta = FtXmlMetaSerialization.deserialize(metaXml);

console.log(`Loaded metadata with ${meta.fieldList.count} fields\n`);

// Create reader and read CSV
const reader = new FtReader(meta, csvData);

console.log("Reading CSV data:");
console.log("================\n");

// Get field ordinals for faster access (compared to calling getFieldByName() for each record)
const petNameFieldOrdinal = reader.getOrdinal(petNameFieldName);
const ageFieldOrdinal = reader.getOrdinal(ageFieldName);
const colorFieldOrdinal = reader.getOrdinal(colorFieldName);
const dateReceivedFieldOrdinal = reader.getOrdinal(dateReceivedFieldName);
const priceFieldOrdinal = reader.getOrdinal(priceFieldName);
const needsWalkingFieldOrdinal = reader.getOrdinal(needsWalkingFieldName);
const typeFieldOrdinal = reader.getOrdinal(typeFieldName);

let recordNumber = 0;
while (reader.read()) {
  recordNumber++;

  const petName = reader.fieldList.get(petNameFieldOrdinal).asString;
  const age = reader.fieldList.get(ageFieldOrdinal).asNullableFloat; // Use asNullableFloat to handle null values
  const color = reader.fieldList.get(colorFieldOrdinal).asString;
  const dateReceived = reader.fieldList.get(
    dateReceivedFieldOrdinal,
  ).asDateTime;
  const price = reader.fieldList.get(priceFieldOrdinal).asDecimal;
  const needsWalking = reader.fieldList.get(needsWalkingFieldOrdinal).asBoolean;
  const type = reader.fieldList.get(typeFieldOrdinal).asString;

  console.log(
    `${recordNumber}: ${petName}, ${age} years, ${color}, received ${dateReceived.toLocaleDateString()}, $${price}, walks: ${needsWalking}, ${type}`,
  );
}

console.log(`\nTotal records read: ${recordNumber}`);
