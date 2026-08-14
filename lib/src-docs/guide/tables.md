---
title: Tables
---

## Tables in Fielded Text files

CSV files and other types of fielded text files can hold multiple tables of records similarly to a database. Typically this is done by having a key field specify the table. For example, consider a database of pets with three tables for different types of pets:

### Cats

| Name  | Running Speed |
| ----- | ------------- |
| Misty | 45            |
| Oscar | 35            |

### Dogs

| Name    | Walking Distance | Running Speed |
| ------- | ---------------- | ------------- |
| Buddy   | 0.5              | 35            |
| Charlie | 2                | 48            |
| Max     | 0.5              | 30            |

### Gold Fish

| Name    | Color  | Chinese Classification |
| ------- | ------ | ---------------------- |
| Bubbles | Orange | Wen                    |
| Flash   | Yellow | Crucian                |

These can be represented in the following CSV file, where the first field is the key field specifying the table (1: cats, 2: dogs and 3: gold fish):

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35
2,Charlie,2,48
2,Max,0.5,30
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```

The difficulty with reading (and writing) this type of CSV file is that the fields in the lines change when a new table start. This library addresses this with readers having special handling for the start of new tables and writers automatically reconfiguring fields as values in key fields are updated.

## Sequences and Sequence Redirects

Before discussing readers and writers, let's review how Fielded Text describes the structure of text data with lines whose fields depend on the value in key fields. *(Note, that the word "line" is not quite correct.  It actually should be "record" as a record can span multiple lines if any of the fields contain new line character(s). However for ease of comprehension, we will continue with "line" in this description.)*

A Fielded Text schema, called Meta, describes a data structure in terms of **fields** and **sequences**.  The Meta lists all the possible fields in the data and then, optionally, defines the order of the fields with sequences.

If the Meta does not specify any sequences, then it uses an implicit (root) sequence which consists of all the fields in the Meta in their **resolved** order. The resolved order is relevant when loading Meta from XML in which case the order is resolved from both the order of the fields in the XML combined with any fields' explicit index value. In this case, all lines have the same fields and there essentially is only one table in the data.

To have more than one table in the data, it is necessary to specify multiple sequences.  One (and only one) sequence will be the **root** sequence. Each line begins with the fields specified in the **root** sequence. A Sequence actually consists of a list of **Sequence Items**, where each item specifies a field and, optionally, a **Sequence Redirect**.

A sequence redirect specifies a **value** and another sequence. If a field's value matches the value specified in the sequence redirect, then another sequence is invoked (either after that field or after the end of the sequence). The line then continues with the fields in the newly invoked sequence. This can cascade with subsequence fields invoking other sequences.

Below is the XML representation of the Meta (schema) for the above CSV file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Name="Name" />
  <Field DataType="Float" Name="RunningSpeed" />
  <Field DataType="Float" Name="WalkDistance" />
  <Field Name="Color" />
  <Field Name="ChineseClassification" />
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
  </Sequence>
  <Sequence Name="GoldFish">
    <Item FieldIndex="4" />
    <Item FieldIndex="5" />
  </Sequence>
</FieldedText>
```

As can be seen, the Meta contains 4 sequences. The **"Root"** sequence has 2 fields:

1. "Type" (the key field), and
1. "Name" (common to all lines).

The "Type" field has 3 **redirect**s which map a Pet type's sequence to the key field value. When the value in the "Type" field matches one of these values, the fields in the corresponding sequence are added to the line **after** the root sequence is completed.

When reading and writing, for each line, the library compares the invokation of sequences. If the invokations differ, then a new table has started.

## Reading

### FtSerializationReader.read()

By default, {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()} (and its overrides), will read to the end of the current table when it will return `false`. To step into the next table, call {@link serialization/ft-serialization-reader!FtSerializationReader.nextTable FtSerializationReader.nextTable()} which will return `true` if there is a subsequent table or will return `false` if at the end of the data.

After stepping into a new table using {@link serialization/ft-serialization-reader!FtSerializationReader.nextTable FtSerializationReader.nextTable()}, it is possible to immediately access the fields in that table but **NOT** their value. This allows you to, for example, get the position of the fields using {@link serialization/ft-serialization-core!FtSerializationCore.getFieldIndexByName FtSerializationCore.getFieldIndexByName()} to confirm the fields exist and optimise parsing. In order to access a field's value you must first call {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()}.

It is possible to make {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()} read to the end of data (ignoring tables) by setting {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} to `true`.  This can be useful in cases such as simply logging all records' fields' values to console using {@link fields/instances/ft-field!FtField.value FtField.value}.

See [read-sequence](../../../examples/read-sequence/README.md) and [read-sequence-ordinal](../../../examples/read-sequence-ordinal/README.md) examples which demonstrate using {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()}, {@link serialization/ft-serialization-reader!FtSerializationReader.nextTable FtSerializationReader.nextTable()} and {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} when reading data with key fields and sequences (ie contains multiple tables).

### FtSerializationReader.readRecord()

{@link serialization/ft-serialization-reader!FtSerializationReader.readRecord FtSerializationReader.readRecord()} is an alternative to `read()`. Like `read()`, it reads the next record however it ignores {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} and, instead, returns one of the following enumerations of {@link types/enums/ft-read-record-result!FtReadRecordResult:var FtReadRecordResult}:

* **FtReadRecordResult.SameTable**: Got record in same table - same as `read()` returning `true`
* **FtReadRecordResult.NewTable**: Got record but in new table - same as `read()` returning `false`, then `nextTable()` returning `true`, then calling `read()` again (which will return `true`)
* **FtReadRecordResult.NoMoreRecords**: No more records in data - same as `read()` returning `false` and then `nextTable()` returning `false`

Below is an example of how the tables in the above CSV data can be read using {@link serialization/ft-serialization-reader!FtSerializationReader.readRecord FtSerializationReader.readRecord()}:

```ts
import {
  FtReader,
  FtReadRecordResult,
  FtStringReader,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

const csvData = `1,Misty,45
1,Oscar,35
2,Buddy,0.5,35
2,Charlie,2,48
2,Max,0.5,30
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian`;

const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Name="Name" />
  <Field DataType="Float" Name="RunningSpeed" />
  <Field DataType="Float" Name="WalkDistance" />
  <Field Name="Color" />
  <Field Name="ChineseClassification" />
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
  </Sequence>
  <Sequence Name="GoldFish">
    <Item FieldIndex="4" />
    <Item FieldIndex="5" />
  </Sequence>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

// Create a reader for the CSV data
const textReader = new FtStringReader(csvData);
const reader = new FtReader(meta, textReader);

// Read first record
let readResult = reader.readRecord();

// The ordinal of the first key field in root sequence and any prior field will remain the same across all tables
const typeOrdinal = reader.getOrdinal("Type");

while (readResult !== FtReadRecordResult.NoMoreRecords) {
  // This is the first record in a table. The value of its "Type" field will determine which table it belongs to.
  const typeField = reader.getField(typeOrdinal);
  const recordType = typeField.asInteger;
  switch (recordType) {
    case 1:
      readResult = readCatTable(reader);
      break;
    case 2:
      readResult = readDogTable(reader);
      break;
    case 3:
      readResult = readGoldFishTable(reader);
      break;
    default:
      throw new Error(`Unknown record type: ${recordType}`);
  }

  // Have finished reading all records in this table. The next record will be the first record of a new table or end of data.
}

console.log("Finished reading all tables.");

function readCatTable(reader: FtReader): FtReadRecordResult {
  // We already have read the first record of the table
  // Get ordinals of fields. They will remain the same across all records in this table.
  const nameOrdinal = reader.getOrdinal("Name");
  const runningSpeedOrdinal = reader.getOrdinal("RunningSpeed");

  let readResult: FtReadRecordResult;
  do {
    // Get value of fields in record and write to console
    const nameField = reader.getField(nameOrdinal);
    const runningSpeedField = reader.getField(runningSpeedOrdinal);

    console.log(
      `Cat: ${nameField.asString}, Running Speed: ${runningSpeedField.asFloat}`,
    );

    // Read next record. Repeat if in same table
    readResult = reader.readRecord();
  } while (readResult === FtReadRecordResult.SameTable);

  // Either next record is in new table or we are at end of data. The caller will handle it.
  return readResult;
}

function readDogTable(reader: FtReader): FtReadRecordResult {
  // Similar to readCatTable, but for Dog table
}

function readGoldFishTable(reader: FtReader): FtReadRecordResult {
  // Similar to readCatTable, but for GoldFish table
}
```

### Read Events

Data can also be read using events. See the [read-events](../../../examples/read-events/README.md) example which demonstrates for data without any redirects (ie only one table).

After {@link serialization/ft-serialization-reader!FtSerializationCore.onRecordStarted onRecordStarted} event has fired, the {@link serialization/ft-serialization-reader!FtSerializationCore.onFieldValueReadReady onFieldValueReadReady} events will fire in the same order as the fields in the line/record. If the record contains fields with redirects, you need to monitor the value of the redirecting field ("Type" in the above example). The subsequent fields supplied by the {@link serialization/ft-serialization-reader!FtSerializationCore.onFieldValueReadReady onFieldValueReadReady} event, will be according to the new sequence invoked (either after the redirecting field or after the current sequence).

## Writing

### FtSerializationWriter.write()

The main way to create Fielded Text data is with {@link serialization/ft-serialization-writer!FtSerializationWriter.write FtSerializationWriter.write()}. As shown in the [basic-write](../../../examples/basic-write/README.md) example, when using {@link serialization/ft-serialization-writer!FtSerializationWriter FtSerializationWriter}, the fields are first set and then {@link serialization/ft-serialization-writer!FtSerializationWriter.write FtSerializationWriter.write()} is called. When there are no redirects, this is straight forward as all fields are available in their implicit (no sequences) or specified order (only root sequence).

When a line/record has redirects, initially only the fields in the root sequence are available. When the value of a field with sequence redirects is set, the fields in the invoked sequence are dynamically generated - possibly replacing existing fields.  So the key point when writing records with redirect fields is:

> Do not access fields that come after fields with redirects until the field with redirects has had its value set.

The safest way to do this is to set the field values in the order of the field index (ie. in the order the fields occur in the record).

Below is an example writing out the above Fielded Text data:

```ts
import {
  FtStringWriter,
  FtWriter,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Name="Name" />
  <Field DataType="Float" Name="RunningSpeed" />
  <Field DataType="Float" Name="WalkDistance" />
  <Field Name="Color" />
  <Field Name="ChineseClassification" />
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
  </Sequence>
  <Sequence Name="GoldFish">
    <Item FieldIndex="4" />
    <Item FieldIndex="5" />
  </Sequence>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);

// Create a reader for the CSV data
const textWriter = new FtStringWriter();
const writer = new FtWriter(meta, textWriter);

// Write tables
writeCatTable(writer);
writeDogTable(writer);
writeGoldFishTable(writer);

// Write the CSV output to console
const csvOutput = textWriter.toString();
console.log(csvOutput);

function writeCatTable(writer: FtWriter): void {
  const recordDatas: { name: string; runningSpeed: number }[] = [
    { name: "Misty", runningSpeed: 45 },
    { name: "Oscar", runningSpeed: 35 },
  ];

  const fieldList = writer.fieldList;
  for (const recordData of recordDatas) {
    fieldList.getByName("Type")!.asInteger = 1; // This invokes the Cat sequence after the Root sequence
    fieldList.getByName("Name")!.asString = recordData.name;
    fieldList.getByName("RunningSpeed")!.asFloat = recordData.runningSpeed;
    writer.write(); // Write the record to the CSV output
  }
}

function writeDogTable(writer: FtWriter): void {
  const recordDatas: {
    name: string;
    walkDistance: number;
    runningSpeed: number;
  }[] = [
    { name: "Buddy", walkDistance: 0.5, runningSpeed: 35 },
    { name: "Charlie", walkDistance: 2, runningSpeed: 48 },
    { name: "Max", walkDistance: 0.5, runningSpeed: 30 },
  ];

  const fieldList = writer.fieldList;
  const typeFieldIndex = fieldList.indexOfName("Type");

  // Fields and their positions in the field list will not change while in same table so get
  // them once and use them for all records in the table
  fieldList.get(typeFieldIndex).asInteger = 2; // This invokes the Dog sequence after the Root sequence
  const nameFieldIndex = fieldList.indexOfName("Name");
  const runningSpeedFieldIndex = fieldList.indexOfName("RunningSpeed");
  const walkDistanceFieldIndex = fieldList.indexOfName("WalkDistance");

  for (const recordData of recordDatas) {
    fieldList.get(typeFieldIndex).asInteger = 2; // This invokes the Dog sequence after the Root sequence
    fieldList.get(nameFieldIndex).asString = recordData.name;
    fieldList.get(walkDistanceFieldIndex).asFloat = recordData.walkDistance;
    fieldList.get(runningSpeedFieldIndex).asFloat = recordData.runningSpeed;
    writer.write(); // Write the record to the CSV output
  }
}

function writeGoldFishTable(writer: FtWriter): void {
  // As per writeCai need ontTable() or writeDogTable()
}
```

Note that `writeCatTable()` and `writeDogTable()` use slightly different approaches for writing data. `writeCatTable()` looks up every field from its name every time. `writeDogTable()` takes advantage of the fact that in a table (ie all records having the same sequence invokations), the fields will have the same position/index in all records. Accordingly, the indices need only be looked up once. This optimisation may be helpful when writing out a large amount of data.

### Write Events

An alternative way to write data is to use events (mainly {@link serialization/ft-serialization-reader!FtSerializationCore.onRecordStarted onRecordStarted} and {@link serialization/ft-serialization-reader!FtSerializationCore.onFieldValueWriteReady onFieldValueWriteReady}). The [write-events](../../../examples/write-events/README.md) example demonstrates this for data without any redirects (ie only one table).

Using events when there is more than one sequence, works in a similar way. After the {@link serialization/ft-serialization-reader!FtSerializationCore.onRecordStarted onRecordStarted} event has fired, the {@link serialization/ft-serialization-reader!FtSerializationCore.onFieldValueWriteReady onFieldValueWriteReady} event will begin firing for the fields in the root sequence in the order of their index. If the handler sets the value of a field with redirects and invokes a new sequence, the event will then fire for all the fields in the invoked sequence (either after the current field or current sequence).  This will be repeated if any further redirects occur to other sequences.

The advantage of using events is that the application does not need to track what fields are to be written when a redirect invokes a new sequence. The {@link serialization/ft-serialization-reader!FtSerializationCore.onFieldValueWriteReady onFieldValueWriteReady} simply sets the value of the field passed to it.

## Multiple Key/Redirect fields in a line

Lines can have more than one *key* field with redirects. In the above CSV example, let's say that dogs may undergo training. A boolean field specifies whether a dog is being trained and if this is true, the trainer and session cost is specified. Let's say that `charlie` is being trained. The CSV now looks like:

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,False
2,Charlie,2,48,True,John,32
2,Max,0.5,30,False
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```

This CSV now has 5 tables:

| Table Number | Records (Animal names) | Description            |
|--------------|------------------------|------------------------|
| 1            | Misty, Oscar           | Cats                   |
| 2            | Buddy                  | Dogs not being trained |
| 3            | Charlie                | Dogs being trained     |
| 4            | Max                    | Dogs not being trained |
| 5            | Bubbles, Flash         | Gold Fish              |

Note that the 2 "Dogs not being trained" tables have the same sequence invokations (and, accordingly, same fields). So if rearrange the CSV placing the line for Max directly after Buddy, these would be in the same table and the CSV would only have 4 tables:

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,False
2,Max,0.5,30,False
2,Charlie,2,48,True,John,32
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```

| Table Number | Records (Animal names) | Description            |
|--------------|------------------------|------------------------|
| 1            | Misty, Oscar           | Cats                   |
| 2            | Buddy, Max             | Dogs not being trained |
| 3            | Charlie                | Dogs being trained     |
| 4            | Bubbles, Flash         | Gold Fish              |

The XML Meta for this CSV data is as follows:

```xml
<?xml version="1.0" encoding="utf-8"?>
<FieldedText>
  <Field DataType="Integer" Name="Type" />
  <Field Name="Name" />
  <Field DataType="Float" Name="RunningSpeed" />
  <Field DataType="Float" Name="WalkDistance" />
  <Field DataType="Boolean" Name="Training" />
  <Field Name="Trainer" />
  <Field DataType="Decimal" Name="SessionCost" />
  <Field Name="Color" />
  <Field Name="ChineseClassification" />
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
</FieldedText>
```

Note the new fields: "Training", "Trainer" and "SessionCost". Also note that the "Dog" sequence now includes the "Training" field which has a redirect. Finally note the new "Training" sequence which contains the "Trainer" and "SessionCost" fields. The "Training" sequence is invoked whenever the "Training" field has a value of `True`.

The reading and writing of Fielded Text data with multiple redirect fields in a line is similar to when there is just one redirect. You just need to monitor the extra redirect fields in a similar fashion. For example, the above write example could have the following `writeDogWithTrainingTable()` function added to handle the "Dogs being trained" table which is generated with 2 redirects.

```ts
function writeDogWithTrainingTable(writer: FtWriter): void {
  const recordDatas: {
    name: string;
    walkDistance: number;
    runningSpeed: number;
    trainer: string;
    sessionCost: number;
  }[] = [
    {
      name: "Charlie",
      walkDistance: 2,
      runningSpeed: 48,
      // training: true, // Always true for this table, so no need to set it
      trainer: "John",
      sessionCost: 32.0,
    },
  ];

  const fieldList = writer.fieldList;
  const typeFieldIndex = fieldList.indexOfName("Type");

  // Fields and their positions in the field list will not change while in same table so get them once and use them for all records in the table
  fieldList.get(typeFieldIndex).asInteger = 2; // This invokes the Dog sequence after the Root sequence
  const nameFieldIndex = fieldList.indexOfName("Name");
  const runningSpeedFieldIndex = fieldList.indexOfName("RunningSpeed");
  const walkDistanceFieldIndex = fieldList.indexOfName("WalkDistance");
  const trainingFieldIndex = fieldList.indexOfName("Training");
  fieldList.get(trainingFieldIndex).asBoolean = true; // This invokes the Training sequence
  const trainerFieldIndex = fieldList.indexOfName("Trainer");
  const sessionCostFieldIndex = fieldList.indexOfName("SessionCost");

  for (const recordData of recordDatas) {
    fieldList.get(typeFieldIndex).asInteger = 2; // This invokes the Dog sequence after the Root sequence
    fieldList.get(nameFieldIndex).asString = recordData.name;
    fieldList.get(walkDistanceFieldIndex).asFloat = recordData.walkDistance;
    fieldList.get(runningSpeedFieldIndex).asFloat = recordData.runningSpeed;
    fieldList.get(trainingFieldIndex).asBoolean = true; // This invokes the Training sequence
    fieldList.get(trainerFieldIndex).asString = recordData.trainer;
    fieldList.get(sessionCostFieldIndex).asDecimal = recordData.sessionCost;
    writer.write(); // Write the record to the CSV output
  }
}
```