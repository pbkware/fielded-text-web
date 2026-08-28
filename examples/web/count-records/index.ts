// Count Records Example
// Simple example of counting records in a CSV file efficiently

import { FtReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// Sample CSV data
const csvData = `Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,45,Chicago
Alice Williams,35,Houston
Charlie Brown,28,Phoenix
Diana Prince,42,Philadelphia
Eve Davis,31,San Antonio
Frank Miller,39,San Diego
Grace Lee,27,Dallas
Henry Wilson,33,San Jose`;

// Load meta from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name" />
  <Field DataType="Integer" Name="Age" />
  <Field Name="City" />
</FieldedText>`;

const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Create reader
const reader = new FtReader(meta, csvData);

// Use seekEnd() instead of reading all records
// seekEnd() is much faster for large files as it doesn't parse field values
reader.seekEnd();

console.log(`Record count: ${reader.recordCount}`);
