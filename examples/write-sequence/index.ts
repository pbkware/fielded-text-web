/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Write Sequence Example
// Demonstrates writing a CSV file with sequences (conditional field structures)
// Uses the pet metadata from build-meta-with-sequences example

import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

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

// Create writer
const stringWriter = new FtStringWriter();
const writer = new FtWriter(meta, stringWriter);

console.log("Writing pets with sequences:\n");

// IMPORTANT: When writing with sequences, you must NOT set a field's value
// if its sequence has not yet been invoked by a redirect.
// When a sequence is invoked, its field values are initialized to null.
// The Root Sequence is always automatically invoked.

// Write 1st Record - Cat (Type=1 invokes Cat Sequence after Root Sequence)
writer.fieldList.getByName(TypeFieldName)!.asBigInt = CatType;
writer.fieldList.getByName(NameFieldName)!.asString = "Misty";
writer.fieldList.getByName(RunningSpeedFieldName)!.asFloat = 45.0;
writer.write();

// Write 2nd Record - Cat
writer.fieldList.getByName(TypeFieldName)!.asBigInt = CatType;
writer.fieldList.getByName(NameFieldName)!.asString = "Oscar";
writer.fieldList.getByName(RunningSpeedFieldName)!.asFloat = 35.0;
writer.write();

// Write 3rd Record - Dog without training (Type=2 invokes Dog Sequence)
writer.fieldList.getByName(TypeFieldName)!.asBigInt = DogType;
writer.fieldList.getByName(NameFieldName)!.asString = "Buddy";
writer.fieldList.getByName(WalkDistanceFieldName)!.asFloat = 0.5;
writer.fieldList.getByName(RunningSpeedFieldName)!.asFloat = 35.0;
writer.fieldList.getByName(TrainingFieldName)!.asBoolean = false;
writer.write();

// Write 4th Record - Dog with training (Training=true invokes Training Sequence)
writer.fieldList.getByName(TypeFieldName)!.asBigInt = DogType;
writer.fieldList.getByName(NameFieldName)!.asString = "Charlie";
writer.fieldList.getByName(WalkDistanceFieldName)!.asFloat = 2.0;
writer.fieldList.getByName(RunningSpeedFieldName)!.asFloat = 48.0;
writer.fieldList.getByName(TrainingFieldName)!.asBoolean = true; // This invokes Training Sequence
writer.fieldList.getByName(TrainerFieldName)!.asString = "John";
writer.fieldList.getByName(SessionCostFieldName)!.asDecimal = 32.0;
writer.write();

// Write 5th Record - Dog without training
writer.fieldList.getByName(TypeFieldName)!.asBigInt = DogType;
writer.fieldList.getByName(NameFieldName)!.asString = "Max";
writer.fieldList.getByName(WalkDistanceFieldName)!.asFloat = 0.5;
writer.fieldList.getByName(RunningSpeedFieldName)!.asFloat = 30.0;
writer.fieldList.getByName(TrainingFieldName)!.asBoolean = false;
writer.write();

// Write 6th Record - Goldfish (Type=3 invokes GoldFish Sequence)
writer.fieldList.getByName(TypeFieldName)!.asBigInt = GoldFishType;
writer.fieldList.getByName(NameFieldName)!.asString = "Bubbles";
writer.fieldList.getByName(ColorFieldName)!.asString = "Orange";
writer.fieldList.getByName(ChineseClassificationFieldName)!.asString = "Wen";
writer.write();

// Write 7th Record - Goldfish
writer.fieldList.getByName(TypeFieldName)!.asBigInt = GoldFishType;
writer.fieldList.getByName(NameFieldName)!.asString = "Flash";
writer.fieldList.getByName(ColorFieldName)!.asString = "Yellow";
writer.fieldList.getByName(ChineseClassificationFieldName)!.asString =
  "Crucian";
writer.write();

console.log(stringWriter.toString());
console.log("\nSuccessfully wrote 7 records with different sequences");
