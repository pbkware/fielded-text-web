// Write Sequence with Events Example
// Demonstrates using events to simplify writing files with sequences
// Events automatically handle sequence redirects, making code cleaner

import {
  FtField,
  FtFieldValueReadyEventArgs,
  FtRecordFinishedEventArgs,
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Define Type values
const CatType = BigInt(1);
const DogType = BigInt(2);
const GoldFishType = BigInt(3);

// Data to write: [recordIndex][fieldId] = value
// null values indicate fields not used for that record
const values: FtField.NullableValue[][] = [
  // TypeFieldId, NameFieldId, RunningSpeedFieldId, WalkDistanceFieldId, TrainingFieldId, TrainerFieldId, SessionCostFieldId, ColorFieldId, ChineseClassificationFieldId
  [CatType, "Misty", 45.0, null, null, null, null, null, null],
  [CatType, "Oscar", 35.0, null, null, null, null, null, null],
  [DogType, "Buddy", 35.0, 0.5, false, null, null, null, null],
  [DogType, "Charlie", 48.0, 2.0, true, "John", 32.0, null, null],
  [DogType, "Max", 30.0, 0.5, false, null, null, null, null],
  [GoldFishType, "Bubbles", null, null, null, null, null, "Orange", "Wen"],
  [GoldFishType, "Flash", null, null, null, null, null, "Yellow", "Crucian"],
];

// Load metadata from XML string
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Id="1" Name="Name" />
  <Field DataType="Float" Id="2" Name="RunningSpeed" />
  <Field DataType="Float" Id="3" Name="WalkDistance" />
  <Field DataType="Boolean" Id="4" Name="Training" />
  <Field Id="5" Name="Trainer" />
  <Field DataType="Decimal" Id="6" Name="SessionCost" />
  <Field Id="7" Name="Color" />
  <Field Id="8" Name="ChineseClassification" />
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
      <Redirect SequenceName="Training" InvokationDelay="AfterField" Value="True" />
    </Item>
  </Sequence>
  <Sequence Name="GoldFish">
    <Item FieldIndex="7" />
    <Item FieldIndex="8" />
  </Sequence>
  <Sequence Name="Training">
    <Item FieldIndex="5" />
    <Item FieldIndex="6" />
  </Sequence>
</FieldedText>`;

const meta = FtXmlMetaSerialization.deserialize(metaXml);

// Track when to stop writing
let finished = false;

// Event handler for field value ready
function handleFieldValueWriteReady(args: FtFieldValueReadyEventArgs): void {
  const field = args.field;
  const recordIndex = args.recordIndex;

  const id = field.id;
  if (id === undefined) {
    throw new Error("Field id is undefined");
  } else {
    // Simply set the field value from our data array
    // The event fires for each field in the correct order,
    // automatically taking sequence redirects into account
    field.value = values[recordIndex][id];
  }
}

// Event handler for record finished
function handleRecordFinished(args: FtRecordFinishedEventArgs): void {
  if (args.recordIndex >= values.length - 1) {
    finished = true;
  }
}

// Create writer
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

// Wire up event handlers
writer.onFieldValueWriteReady = (args) => handleFieldValueWriteReady(args); // closure
writer.onRecordFinished = handleRecordFinished; // function

console.log("Writing pets with sequences using events:\n");

// Write records until finished
// The events handle all the complexity of sequence redirects
while (!finished) {
  writer.write();
}

console.log(stringWriter.toString());
console.log("\nSuccessfully wrote 7 records using event-driven approach");
console.log("\nAdvantages of using events:");
console.log("- No need to manually track which sequences are active");
console.log("- onFieldValueWriteReady fires for each field in correct order");
console.log("- Automatically handles sequence redirects");
console.log("- Simpler code when working with complex sequence structures");
