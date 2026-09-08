// Basic Read Example
// Demonstrates reading CSV data with metadata loaded from XML

import {
  FtNodeFileReader,
  FtNodeXmlMetaSerialization,
} from "@pbkware/fielded-text-node";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get directory path for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Names of files containing the data and metadata
const csvFileName = "basic-read-example.csv";
const metaFileName = "meta.ftm";
const csvFilePath = path.join(__dirname, csvFileName);
const metaFilePath = path.join(__dirname, metaFileName);

// Define field names
const PetNameFieldName = "PetName";
const AgeFieldName = "Age";
const ColorFieldName = "Color";
const DateReceivedFieldName = "DateReceived";
const PriceFieldName = "Price";
const NeedsWalkingFieldName = "NeedsWalking";
const TypeFieldName = "Type";

// Load metadata from XML
console.log("Loading metadata from XML...");
const meta = FtNodeXmlMetaSerialization.deserializeFromFile(metaFilePath);

console.log(`Loaded metadata with ${meta.fieldList.count} fields\n`);

// Create reader and read CSV (automatically closed when it goes out of scope)
using reader = new FtNodeFileReader(csvFilePath, meta);

console.log("Reading CSV data:");
console.log("================\n");

// Get field ordinals for faster access (compared to calling getFieldByName() for each record)
const petNameFieldOrdinal = reader.getFieldIndexByName(PetNameFieldName)!;
const ageFieldOrdinal = reader.getFieldIndexByName(AgeFieldName)!;
const colorFieldOrdinal = reader.getFieldIndexByName(ColorFieldName)!;
const dateReceivedFieldOrdinal = reader.getFieldIndexByName(
  DateReceivedFieldName,
)!;
const priceFieldOrdinal = reader.getFieldIndexByName(PriceFieldName)!;
const needsWalkingFieldOrdinal = reader.getFieldIndexByName(
  NeedsWalkingFieldName,
)!;
const typeFieldOrdinal = reader.getFieldIndexByName(TypeFieldName)!;

let recordNumber = 0;
while (reader.read()) {
  recordNumber++;

  const petName = reader.fieldList.get(petNameFieldOrdinal).asString;
  const age = reader.fieldList.get(ageFieldOrdinal).asNullableFloat;
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
console.log(`Input read from: ${csvFilePath}`);
