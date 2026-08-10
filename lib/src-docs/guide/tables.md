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

If the Meta does not specify any sequences, then it uses an implicit (root) sequence which consists of all the fields in the Meta in their (resolved) order. The resolved order is relevant when loading Meta from XML in which case the order is resolved from both the order of the fields in the XML combined with any fields' explicit index value. In this case, all lines have the same fields and there essentially is only one table in the data.

To have more than one table in the data, it is necessary to specify multiple sequences.  One (and only one) sequence will be the **root** sequence. Each line begins with the fields specified in the **root** sequence. A Sequence actually consists of a list of **Sequence Items**, where each item specifies a field and, optionally, a **Sequence Redirect**.

A sequence redirect specifies a **value** and another sequence. If a field's value is equal to the value specified in the sequence redirect, then another sequence is invoked (either after that field or after the end of the sequence). The line then continues with the fields in the newly invoked sequence. This can cascade with subsequence fields invoking other sequences.

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

After stepping into a new table using {@link serialization/ft-serialization-reader!FtSerializationReader.nextTable FtSerializationReader.nextTable()}, it is possible to immediately access the fields in that table but **NOT** their value. This allows you to, for example, get the position of the fields using {@link serialization/ft-serialization-core!FtSerializationCore.getOrdinal FtSerializationCore.getOrdinal()} to confirm the fields exist and optimise parsing. In order to access a field's value you must first call {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()}.

It is possible to make {@link serialization/ft-serialization-reader!FtSerializationReader.read FtSerializationReader.read()} read to the end of data (ignoring tables) by setting {@link serialization/ft-serialization-reader!FtSerializationReader.autoNextTable autoNextTable} to `true`.  This can be useful in cases such as simply logging all records' fields' values to console using {@link fields/instances/ft-field!FtField.value FtField.value}.

### FtSerializationReader.readRecord()


## Writing

## Multiple Key/Redirect fields in a line

```csv
1,Misty,45
1,Oscar,35
2,Buddy,0.5,35,False
2,Charlie,2,48,True,John,32
2,Max,0.5,30,False
3,Bubbles,Orange,Wen
3,Flash,Yellow,Crucian
```


```xml
<?xml version="1.0" encoding="utf-8"?>
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
</FieldedText>
```
