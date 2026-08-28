// Read Sequence Example
// Demonstrates reading a CSV file with sequences (conditional field structures)
// Uses the pet metadata from build-meta-with-sequences example

import { FtReader, FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

// Sample CSV data with sequences
const csvData = `1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,False
2,Charlie,2,48,True,John,32
2,Max,0.5,30,False
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian`;

// Define Type values
const CatType = BigInt(1);
const DogType = BigInt(2);
const GoldFishType = BigInt(3);

// Define Field Names
const TypeFieldName = "Type";
const NameFieldName = "Name";
const RunningSpeedFieldName = "RunningSpeed";
const WalkDistanceFieldName = "WalkDistance";
const TrainingFieldName = "Training";
const TrainerFieldName = "Trainer";
const SessionCostFieldName = "SessionCost";
const ColorFieldName = "Color";
const ChineseClassificationFieldName = "ChineseClassification";

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

// Create reader
const reader = new FtReader(meta, csvData);

// Set AutoNextTable to true so read() continues across table boundaries
// (Tables change when sequences redirect to a different structure)
reader.autoNextTable = true;

console.log("Reading pets with sequences:\n");

// Read each record
let recNumber = 0;
while (reader.read()) {
  recNumber++;

  // Read root sequence fields (always present)
  const type = reader.getFieldByName(TypeFieldName)?.asBigInt;
  const name = reader.getFieldByName(NameFieldName)?.asString;

  const values: unknown[] = [type, name];

  // Type field determines which sequence is active and what fields are available
  if (type === CatType) {
    const runningSpeed = reader.getFieldByName(RunningSpeedFieldName)?.asFloat;
    values.push(runningSpeed);
  } else if (type === DogType) {
    const walkDistance = reader.getFieldByName(WalkDistanceFieldName)?.asFloat;
    const runningSpeed = reader.getFieldByName(RunningSpeedFieldName)?.asFloat;
    const training = reader.getFieldByName(TrainingFieldName)?.asBoolean;
    values.push(walkDistance, runningSpeed, training);

    if (training) {
      const trainer = reader.getFieldByName(TrainerFieldName)?.asString;
      const sessionCost =
        reader.getFieldByName(SessionCostFieldName)?.asDecimal;
      values.push(trainer, sessionCost);
    }
  } else if (type === GoldFishType) {
    const color = reader.getFieldByName(ColorFieldName)?.asString;
    const classification = reader.getFieldByName(
      ChineseClassificationFieldName,
    )?.asString;
    values.push(color, classification);
  }

  console.log(`${recNumber}: ${values.join(",")}`);
}

console.log(`\nTotal records: ${recNumber}`);
