// Declared Output Example
// Demonstrates writing fielded text with a declaration header

import {
  FtMetaReferenceType,
  FtNodeFileWriter,
  FtNodeXmlMetaSerialization,
  FtWriterSettings,
} from "@pbkware/fielded-text-node";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get directory path for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Name of file containing Meta
const metaFileName = "meta.ftm";
// Name of file to be written
const outputFileName = "node-declared-example.csv";
const metaFilePath = path.join(__dirname, metaFileName);

// Define field names
const PetNameFieldName = "PetName";
const AgeFieldName = "Age";
const ColorFieldName = "Color";
const DateReceivedFieldName = "DateReceived";
const PriceFieldName = "Price";
const NeedsWalkingFieldName = "NeedsWalking";
const TypeFieldName = "Type";

// Load meta from file
const meta = FtNodeXmlMetaSerialization.deserializeFromFile(metaFilePath);
meta.headingLineCount = 0; // Change to 0 as we do not want any heading lines in this example

// Create output file path in temp directory
const tmpDir = os.tmpdir();
const fieldedTextTmpDir = path.join(tmpDir, "fielded-text/examples");
const outputPath = path.join(fieldedTextTmpDir, outputFileName);

// Ensure the directory exists
fs.mkdirSync(fieldedTextTmpDir, { recursive: true });

// Create FtWriterSettings to flag we want Declared file written
const settings: FtWriterSettings = {
  declared: true,
  metaReferenceType: FtMetaReferenceType.Embedded,
};

// Create writer
const writer = new FtNodeFileWriter(outputPath, meta, undefined, settings);

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

writer.close();

console.log(`\nOutput written to: ${outputPath}`);

console.log("\nNotice the !|!Fielded Text^| signature at the top!");
console.log(
  "This declares the file as FieldedText format version 1.1 with embedded meta.",
);
