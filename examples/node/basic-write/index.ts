// Basic Write Example
// Demonstrates writing CSV data using the FieldedText library
// This example matches the C# BasicWrite example - it loads meta from BasicExampleMeta.ftm

import {
  FtNodeFileWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-node";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get directory path for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Name of file containing Meta
const metaFileName = "BasicExampleMeta.ftm";
// Name of file to be written
const csvFileName = "BasicExample.csv";

// Define FieldNames
const PetNameFieldName = "PetName";
const AgeFieldName = "Age";
const ColorFieldName = "Color";
const DateReceivedFieldName = "DateReceived";
const PriceFieldName = "Price";
const NeedsWalkingFieldName = "NeedsWalking";
const TypeFieldName = "Type";

// Load meta from file
const metaFilePath = path.join(__dirname, metaFileName);
const metaXml = fs.readFileSync(metaFilePath, "utf-8");
const meta = FtXmlMetaSerialization.deserialize(metaXml);
meta.headingLineCount = 0; // Is set to 2 in meta file. Change to 0 as we do not want any heading lines in this example

// Create output file path in temp directory
const tmpDir = os.tmpdir();
const fieldedTextTmpDir = path.join(tmpDir, "fielded-text/examples");
const outputPath = path.join(fieldedTextTmpDir, csvFileName);

// Ensure the directory exists
fs.mkdirSync(fieldedTextTmpDir, { recursive: true });

// Create writer - single class instantiation!
const writer = new FtNodeFileWriter(outputPath, meta, "utf-8", {
  declared: true,
});

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

writer.close();

// Read and display the generated CSV
const csvContent = fs.readFileSync(outputPath, "utf-8");

console.log("\nGenerated CSV:");
console.log("==============");
console.log(csvContent);

console.log(`\nOutput written to: ${outputPath}`);
