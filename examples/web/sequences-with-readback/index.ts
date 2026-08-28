// Sequences Example
// Demonstrates sequence redirects for conditional field structures
// Models the C# BuildMetaWithSequences/WriteSequence examples

import {
  FtReader,
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

console.log("=== Sequence Redirects Example ===\n");
console.log(
  "Demonstrates conditional field structures using sequence redirects.",
);
console.log("Different pet types have different fields:\n");

// Load metadata from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Name="Name" />
  <Field DataType="Float" Name="RunningSpeed" />
  <Field DataType="Float" Name="WalkDistance" />
  <Field DataType="Boolean" Name="Training" />
  <Field Name="Trainer" />
  <Field DataType="Decimal" Name="SessionCost" />
  <Field Name="Color" />
  <Field Name="Classification" />
  <Sequence Name="Root" Root="True">
    <Item FieldIndex="0">
      <Redirect SequenceName="Cat" InvokationDelay="AfterSequence" Value="1" />
      <Redirect SequenceName="Dog" InvokationDelay="AfterSequence" Value="2" />
      <Redirect SequenceName="GoldFish" InvokationDelay="AfterSequence" Value="3" />
    </Item>
    <Item FieldIndex="1" />
  </Sequence>
  <Sequence Name="Cat">
    <Item FieldIndex="2" />
  </Sequence>
  <Sequence Name="Dog">
    <Item FieldIndex="3" />
    <Item FieldIndex="2" />
    <Item FieldIndex="4">
      <Redirect SequenceName="Training" Value="True" />
    </Item>
  </Sequence>
  <Sequence Name="Training">
    <Item FieldIndex="5" />
    <Item FieldIndex="6" />
  </Sequence>
  <Sequence Name="GoldFish">
    <Item FieldIndex="7" />
    <Item FieldIndex="8" />
  </Sequence>
</FieldedText>`;

const meta = FtXmlMetaSerialization.deserialize(metaXml);

console.log("Metadata structure:");
console.log("  Root: Type, Name");
console.log("  Cat (Type=1): RunningSpeed");
console.log("  Dog (Type=2): WalkDistance, RunningSpeed, Training");
console.log("    Training (Training=true): Trainer, SessionCost");
console.log("  GoldFish (Type=3): Color, Classification\n");

// Write sample data
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

// Track redirects
let redirectCount = 0;
writer.onSequenceRedirected = () => {
  redirectCount++;
};

// Cat records
writer.setFieldValueByName("Type", BigInt(1));
writer.setFieldValueByName("Name", "Misty");
writer.setFieldValueByName("RunningSpeed", 45);
writer.write();

writer.setFieldValueByName("Type", BigInt(1));
writer.setFieldValueByName("Name", "Oscar");
writer.setFieldValueByName("RunningSpeed", 35);
writer.write();

// Dog records (without training)
writer.setFieldValueByName("Type", BigInt(2));
writer.setFieldValueByName("Name", "Buddy");
writer.setFieldValueByName("WalkDistance", 0.5);
writer.setFieldValueByName("RunningSpeed", 35);
writer.setFieldValueByName("Training", false);
writer.write();

// Dog with training (nested redirect)
writer.setFieldValueByName("Type", BigInt(2));
writer.setFieldValueByName("Name", "Charlie");
writer.setFieldValueByName("WalkDistance", 2);
writer.setFieldValueByName("RunningSpeed", 48);
writer.setFieldValueByName("Training", true);
writer.setFieldValueByName("Trainer", "John");
writer.setFieldValueByName("SessionCost", 32);
writer.write();

// Another dog without training
writer.setFieldValueByName("Type", BigInt(2));
writer.setFieldValueByName("Name", "Max");
writer.setFieldValueByName("WalkDistance", 0.5);
writer.setFieldValueByName("RunningSpeed", 30);
writer.setFieldValueByName("Training", false);
writer.write();

// GoldFish records
writer.setFieldValueByName("Type", BigInt(3));
writer.setFieldValueByName("Name", "Bubbles");
writer.setFieldValueByName("Color", "Orange");
writer.setFieldValueByName("Classification", "Wen");
writer.write();

writer.setFieldValueByName("Type", BigInt(3));
writer.setFieldValueByName("Name", "Flash");
writer.setFieldValueByName("Color", "Yellow");
writer.setFieldValueByName("Classification", "Crucian");
writer.write();

// writer.close(); // Not necessary due to 'using' declaration

const csvText = stringWriter.toString();

console.log("=== Generated CSV ===");
console.log(csvText);
console.log(`Total redirects triggered: ${redirectCount}\n`);

// Read back and verify
console.log("=== Reading Back Records ===\n");

const reader = new FtReader(meta, csvText);
reader.autoNextTable = true; // Continue across table boundaries

let recordNum = 0;
while (reader.read()) {
  recordNum++;
  const type = reader.getFieldByName("Type")?.asBigInt;
  const name = reader.getFieldByName("Name")?.asString;

  console.log(`${recordNum}. ${name} (Type ${type}): `);

  if (type === BigInt(1)) {
    // Cat
    const speed = reader.getFieldByName("RunningSpeed")?.asFloat;
    console.log(`Running speed ${speed}`);
  } else if (type === BigInt(2)) {
    // Dog
    const walk = reader.getFieldByName("WalkDistance")?.asFloat;
    const speed = reader.getFieldByName("RunningSpeed")?.asFloat;
    const training = reader.getFieldByName("Training")?.asBoolean;
    if (training) {
      const trainer = reader.getFieldByName("Trainer")?.asString;
      const cost = reader.getFieldByName("SessionCost")?.asDecimal;
      console.log(
        `Walk ${walk}, Run ${speed}, Training with ${trainer} ($${cost})`,
      );
    } else {
      console.log(`Walk ${walk}, Run ${speed}, No training`);
    }
  } else if (type === BigInt(3)) {
    // GoldFish
    const color = reader.getFieldByName("Color")?.asString;
    const classification = reader.getFieldByName("Classification")?.asString;
    console.log(`${color} ${classification}`);
  }
}

console.log("\n=== Summary ===");
console.log("Sequence redirects allow different records to have different");
console.log("field structures based on field values. This is more flexible");
console.log("than having all records with the same fields.");
