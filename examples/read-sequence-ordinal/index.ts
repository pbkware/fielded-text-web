// Read Sequence with Ordinals Example
// Demonstrates using field ordinals for faster reading of large files with sequences
// An ordinal is the index of a field in the current record

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

// Helper function to calculate ordinals for the current record
function calculateRecordOrdinals(reader: FtReader): number[] {
  const maxFieldCount = 7;
  const recOrdinals = new Array<number>(maxFieldCount);

  // Read root sequence fields
  const typeOrdinal = reader.getOrdinal(TypeFieldName);
  recOrdinals[0] = typeOrdinal;
  recOrdinals[1] = reader.getOrdinal(NameFieldName);

  let fieldCount: number;

  // Type field determines which sequence is active
  const type = reader.fieldList.get(typeOrdinal).asBigInt;
  if (type === CatType) {
    recOrdinals[2] = reader.getOrdinal(RunningSpeedFieldName);
    fieldCount = 3;
  } else if (type === DogType) {
    recOrdinals[2] = reader.getOrdinal(WalkDistanceFieldName);
    recOrdinals[3] = reader.getOrdinal(RunningSpeedFieldName);
    recOrdinals[4] = reader.getOrdinal(TrainingFieldName);
    const training = reader.fieldList.get(recOrdinals[4]).asBoolean;
    if (!training) {
      fieldCount = 5;
    } else {
      recOrdinals[5] = reader.getOrdinal(TrainerFieldName);
      recOrdinals[6] = reader.getOrdinal(SessionCostFieldName);
      fieldCount = 7;
    }
  } else if (type === GoldFishType) {
    recOrdinals[2] = reader.getOrdinal(ColorFieldName);
    recOrdinals[3] = reader.getOrdinal(ChineseClassificationFieldName);
    fieldCount = 4;
  } else {
    fieldCount = 2;
  }

  return recOrdinals.slice(0, fieldCount);
}

// Create reader
const reader = new FtReader(meta, csvData);

console.log("Reading pets with sequences using ordinals (faster):\n");

// Track ordinals - reset when table changes
let recOrdinals: number[] | null = null;

do {
  // Loop for each table in file
  while (reader.read()) {
    if (recOrdinals === null) {
      // Ordinals only need to be calculated for first row of each table
      // They remain valid for all records in the same table
      recOrdinals = calculateRecordOrdinals(reader);
    }

    // Access fields by ordinal (faster than by name)
    const values: unknown[] = [];
    for (const ordinal of recOrdinals) {
      values.push(reader.fieldList.get(ordinal).asUnknown);
    }

    console.log(
      `${reader.recordCount},${reader.tableCount}: ${values.join(",")}`,
    );
  }

  // Ordinals are no longer valid after table ends
  recOrdinals = null;
} while (reader.nextResult());

console.log(
  "\nNote: Using ordinals is faster than field names for large files",
);
console.log("because it avoids name lookup on every field access.");
