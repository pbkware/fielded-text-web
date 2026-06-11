// Basic Read Example
// Demonstrates reading a CSV file by building meta in code

import {
  DotNetLocaleSettings,
  FtDataType,
  FtDateTimeMetaField,
  FtMeta,
  FtReader,
} from "@pbkware/fielded-text-web";

// Sample CSV data - matches C# BasicExample.csv
const csvData = `"Pet Name","Age","Color","Date Received","Price","Needs Walking","Type"
"","(Years)","","","(Dollars)","",""
Rover,4.5,Brown,12 Feb 2004,80,True,Dog
Charlie,,Gold,5 Apr 2007,12.3,False,Fish
Molly,2,Black,25 Dec 2006,25,False,Cat
Gilly,,White,10 Apr 2007,10,False,Guinea Pig`;

// Build meta in code
const meta = new FtMeta();
meta.culture = DotNetLocaleSettings.createInvariant();
meta.delimiterChar = ",";
meta.headingLineCount = 2; // CSV has 2 heading lines

// Define field names
const petNameFieldName = "PetName";
const ageFieldName = "Age";
const colorFieldName = "Color";
const dateReceivedFieldName = "DateReceived";
const priceFieldName = "Price";
const needsWalkingFieldName = "NeedsWalking";
const typeFieldName = "Type";

// Add fields - headings will be read from the CSV file
const petNameField = meta.fieldList.new(FtDataType.String);
petNameField.name = petNameFieldName;

const ageField = meta.fieldList.new(FtDataType.Float);
ageField.name = ageFieldName;

const colorField = meta.fieldList.new(FtDataType.String);
colorField.name = colorFieldName;

const dateReceivedField = meta.fieldList.new(
  FtDataType.DateTime,
) as FtDateTimeMetaField;
dateReceivedField.name = dateReceivedFieldName;
dateReceivedField.format = "d MMM yyyy";

const priceField = meta.fieldList.new(FtDataType.Decimal);
priceField.name = priceFieldName;

const needsWalkingField = meta.fieldList.new(FtDataType.Boolean);
needsWalkingField.name = needsWalkingFieldName;

const typeField = meta.fieldList.new(FtDataType.String);
typeField.name = typeFieldName;

// Define root sequence
const rootSequence = meta.sequenceList.new();
rootSequence.name = "Root";
rootSequence.root = true;
rootSequence.itemList.new(petNameField);
rootSequence.itemList.new(ageField);
rootSequence.itemList.new(colorField);
rootSequence.itemList.new(dateReceivedField);
rootSequence.itemList.new(priceField);
rootSequence.itemList.new(needsWalkingField);
rootSequence.itemList.new(typeField);

// Create reader and read records
const reader = new FtReader(meta, csvData);

console.log("Reading CSV data:");
console.log("================\n");

let recordNumber = 0;
while (reader.read()) {
  recordNumber++;
  const petName = reader.getFieldByName(petNameFieldName)?.asString;
  const age = reader.getFieldByName(ageFieldName)?.asFloat;
  const color = reader.getFieldByName(colorFieldName)?.asString;
  const dateReceived = reader.getFieldByName(dateReceivedFieldName)?.asDateTime;
  const price = reader.getFieldByName(priceFieldName)?.asDecimal;
  const needsWalking = reader.getFieldByName(needsWalkingFieldName)?.asBoolean;
  const type = reader.getFieldByName(typeFieldName)?.asString;

  console.log(
    `${recordNumber}: ${petName}, ${age} years, ${color}, received ${dateReceived?.toLocaleDateString()}, $${price}, walks: ${needsWalking}, ${type}`,
  );
}

console.log(`\nTotal records read: ${recordNumber}`);
