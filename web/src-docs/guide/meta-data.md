---
title: Meta data
---

# Meta data Guide

This guide covers the FieldedText meta data system: what it is, how to create it, and how to work with field types and sequences.

## Table of Contents

- [What is Meta data?](#what-is-meta-data)
- [Creating Meta data](#creating-meta-data)
- [Field](#field)
- [Sequences](#sequences)
- [Meta data Serialization](#meta-data-serialization)

## What is Meta data?

**Meta data** (represented by the `FtMeta` class) is a schema that defines how to parse and format fielded text files. It describes:

- **Structure**: What fields exist, in what order
- **Types**: Data types (string, integer, date, etc.)
- **Formatting**: How to display and parse values
- **Locale**: Culture-specific formatting rules
- **Delimiters**: Character separating fields
- **Quoting**: Quote characters and escaping rules
- **Headings**: Column header lines
- **Comments**: Comment line markers

Think of meta data as a "recipe" for reading/writing fielded text files.

## Creating Meta data

There are 3 ways ways to create meta data:

1. [Build Programmatically](#1-build-programmatically)
1. [Load From XML](#2-load-from-xml)
1. [Use an editor](#3-use-an-editor)

In both cases, the Meta and its elements (such as Fields) will first be initialised with {@link meta/ft-meta-defaults!FtMetaDefaults default values}. So it is only necessary to specify properties which do not hold default values.

### 1. Build Programmatically

Create `FtMeta` and set properties in code:

```typescript
import { FtDataType, FtDecimalMetaField, FtMeta } from "@pbkware/fielded-text-web";

const meta = new FtMeta();

// Set properties which are not default
meta.lineCommentChar = "#";
meta.headingLineCount = 1;

// Define fields
const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = "CustomerName";
nameField.headings = ["Name"];

const amountField = meta.fieldList.new(FtDataType.Decimal);
amountField.name = "Amount";
amountField.headings = ["Amount"];
(amountField as FtDecimalMetaField).format = "N2"; // 2 decimal places

// Define root sequence
const rootSeq = meta.sequenceList.new();
rootSeq.name = "Root";
rootSeq.root = true;
rootSeq.itemList.new(nameField);
rootSeq.itemList.new(amountField);
```

**When to use:**

- Simple schemas
- Programmatically generated meta data
- Testing and prototyping

### 2. Load from XML

Load meta data from an XML string:

```typescript
import { FtXmlMetaSerialization } from "@pbkware/fielded-text-web";

const xmlMeta = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name" Headings="Name"/>
  <Field Name="Age" DataType="Integer" Headings="Age"/>
</FieldedText>`;

// Load meta data from XML
const metaReader = new FtXmlMetaSerialization();
const meta = metaReader.deserialize(xmlMeta);
```

**When to use:**

- Complex schemas
- Reusable meta data across projects
- Standards compliance

### 3. Use an editor

A fielded text editor normally has the capability to interactively develop the Meta for a text file and getting immediate visual feedback on its correctness. Once the Meta is completed, it can be saved as an XML file for use with other applications.

Fielded text editors are listed at [https://fieldedtext.org/software/](https://fieldedtext.org/software/)

## Structure

The diagram shows the elements within a Meta:

```text
Root / Main 
├──Fields
├──Substitutions
├──Sequences
   ├──Sequence Items
      ├──Sequence Redirects
```

A sequence item references a field. Note that a field can be referenced by more than one sequence item.

A sequence redirect references a sequence.  Note that a sequence can be referenced by more than one sequence redirect.

## Root / Main

The root of a Meta ({@link meta/ft-meta!FtMeta FtMeta}) specifies properties globally applicable to the Meta.

## Field

### Types

FieldedText supports six standard data types:

1. String: {@link meta/fields/ft-string-meta-field!FtStringMetaField FtStringMetaField }
1. Boolean: {@link meta/fields/ft-boolean-meta-field!FtBooleanMetaField FtBooleanMetaField }
1. Float (floating point number): {@link meta/fields/ft-float-meta-field!FtFloatMetaField FtFloatMetaField }
1. Integer: {@link meta/fields/ft-integer-meta-field!FtIntegerMetaField FtIntegerMetaField }
1. Decimal (base 10 number): {@link meta/fields/ft-decimal-meta-field!FtDecimalMetaField FtDecimalMetaField }
1. DateTime: {@link meta/fields/ft-date-time-meta-field!FtDateTimeMetaField FtDateTimeMetaField }

These correspond to {@link types/enums/ft-data-type!FtDataType:var FtDataType} const object. The meta field types all descend from {@link meta/fields/ft-meta-field!FtMetaField FtMetaField }.

Programmatically, you create a new field of a particular type using the {@link meta/fields/ft-meta-field-list!FtMetaFieldList.new FtMetaFieldList.new()} function. For example:

```typescript
const field = meta.fieldList.new(FtDataType.String);
```

### Properties

The properties on a {@link meta/fields/ft-meta-field!FtMetaField Meta field } define how a corresponding {@link fields/instances/ft-field!FtField field instance} in a record is read or written. The properties are accessed as:

```typescript
field.name = 'CustomerName';
field.headings = ['Name'];
const dataType = field.dataType;
```

#### Casting descendants

Some properties only exist on the type descendant. To access these it is necessary to cast:

```typescript
const field = meta.fieldList.new(FtDataType.Boolean);
field.name = 'IsActive';
(field as FtBooleanMetaField).styles = FtBooleanStyles.IgnoreCase;
(field as FtBooleanMetaField).trueText = 'Yes';
(field as FtBooleanMetaField).falseText = 'No';
```

#### Styles and Format

{@link meta/fields/ft-float-meta-field!FtFloatMetaField Float }, {@link meta/fields/ft-integer-meta-field!FtIntegerMetaField Integer } and {@link meta/fields/ft-decimal-meta-field!FtDecimalMetaField Decimal } fields have a `styles` and `format` property which determines how the numbers are formatted (and parsed) in the text file.

```typescript
const field = meta.fieldList.new(FtDataType.Integer);
field.name = "Quantity";
(field as FtIntegerMetaField).styles = DotNetNumberStyles.integer;
(field as FtIntegerMetaField).format = "N0"; // No decimals, with thousands separator
```

Likewise, DateTime fields also have a {@link meta/fields/ft-date-time-meta-field!FtDateTimeMetaField.styles `styles`} and a {@link meta/fields/ft-date-time-meta-field!FtDateTimeMetaField.format `format`} property.

```typescript
const field = meta.fieldList.new(FtDataType.DateTime);
field.name = 'OrderDate';
(field as FtDateTimeMetaField).styles = DotNetDateTimeStyles.allowInnerWhite;
(field as FtDateTimeMetaField).format = 'yyyy-MM-dd';
```

#### Constant values

The {@link meta/fields/ft-meta-field!FtMetaField.constant `FtMetaField.constant`} property allows you to specify that a field contains a constant value. When set to `true`, the record/instance field ({@link fields/instances/ft-field!FtField `FtField`} not {@link meta/fields/ft-meta-field!FtMetaField `FtMetaField`}), will be initialised with the `value` (or {@link meta/fields/ft-meta-field!FtMetaField.null `null`}) specified in the {@link meta/fields/ft-meta-field!FtMetaField `FtMetaField`}. Accordingly, this record/instance {@link fields/instances/ft-field!FtField field} does not need to be assigned a value when writing records.

```typescript
const field = meta.fieldList.new(FtDataType.String);
field.name = "Currency Symbol"; // always US
(field as FtStringMetaField).value = "$";
```

#### Fixed or delimited

By default, fields are delimited. That is they are separated by a delimiter character (specified by {@link meta/ft-meta!FtMeta.delimiterChar FtMeta.delimiterChar}).  Delimited fields can have variable widths. However fields can also be specified as having a fixed width ({@link meta/fields/ft-meta-field!FtMetaField.fixedWidth `FtMetaField.fixedWidth`}).  In this case, the field's value will be padded or truncated to ensure it has the width specified by the property {@link meta/fields/ft-meta-field!FtMetaField.width `FtMetaField.width`}

```typescript
const field = meta.fieldList.new(FtDataType.String);
field.width = 8;
field.fixedWidth = true;
field.valueTruncateType = FtTruncateType.TruncateChar;
field.valueTruncateChar = 'X';
field.valuePadCharType = FtPadCharType.Specified;
field.valuePadChar = ' ';
```

#### Quoting

If a field is delimited, then it can be quoted - that is, its text representation is surrounded by a quote character (specified by {@link meta/ft-meta!FtMeta.quoteChar FtMeta.quoteChar}). This is necessary, when text representation contains delimiter character or new line character(s). The way the field is quoted is specified by {@link meta/fields/ft-meta-field!FtMetaField.valueQuotedType `FtMetaField.valueQuotedType`}. By default, this is set to {@link types/enums/ft-quoted-type!FtQuotedType FtQuotedType}.Optional, meaning it is optional when reading records and when writing records, it will only be included if necessary.

```typescript
const field = meta.fieldList.new(FtDataType.String);
field.valueQuotedType = FtQuotedType.Always;
```

#### Headings

The number of headings a field has is specified by the readonly property {@link meta/fields/ft-meta-field!FtMetaField.headingCount `FtMetaField.headingCount`}. This will always reflect the value specified in {@link meta/ft-meta!FtMeta.headingLineCount FtMeta.headingLineCount}. The actual headings are set in the meta with the {@link meta/fields/ft-meta-field!FtMetaField.headings `FtMetaField.headings`} property. This property accepts an array of strings where each element represents the field's heading at the heading line corresponding to the element's index.  The array will be truncated or padded with empty strings to ensure its length matches {@link meta/fields/ft-meta-field!FtMetaField.headingCount `headingCount`}.

```typescript
const field = meta.fieldList.new(FtDataType.String);
meta.headingLineCount = 3;
const headingCount = field.headingCount; // headingCount will be 3, as set in the meta
field.headings = ["Line 1", "Line 2", "Line 3"];
field.headings = ["Line 1"]; // Heading lines 2 and 3 will be auto-filled with empty strings for this field
field.headings = ["Line 1", "Line 2", "Line 3", "Line 4"]; // Extra heading lines will be ignored for this field
```

#### Heading related properties

Many of the heading related properties specified at the Meta level can also be specified at the field level (eg. {@link meta/fields/ft-meta-field!FtMetaField.headingQuotedType `headingQuotedType`}).  If they are specified at field level, they override the value specified at the Meta level for that field.

## Sequences

Meta Sequences ({@link meta/sequences/core/ft-meta-sequence!FtMetaSequence FtMetaSequence}) define the order and grouping of fields in records.  A record always has one root sequence (specified by the sequence's {@link meta/sequences/core/ft-meta-sequence!FtMetaSequence.root root} property set to true).  However it can contain extra sequences if these are invoked by sequence redirects.

### Sequence Items

A meta sequence consists of list of meta sequence items ({@link meta/sequences/core/ft-meta-sequence-item!FtMetaSequenceItem FtMetaSequenceItem}). Each item references a Meta Field ({@link meta/fields/ft-meta-field!FtMetaField FtMetaField}). It is the order of the sequence items in the sequence which determines the order of the fields in the record for that sequence.

For example, in the code snippet below, the fields will appear in records with the order: field2, field3, field1.

```typescript
const field1 = meta.fieldList.new(FtDataType.Integer);
const field2 = meta.fieldList.new(FtDataType.String);
const field3 = meta.fieldList.new(FtDataType.Boolean);

const rootSequence = meta.sequenceList.new();
rootSequence.name = "Root";
rootSequence.root = true; // Mark as root sequence

// Add fields in order
rootSequence.itemList.new(field2);
rootSequence.itemList.new(field3);
rootSequence.itemList.new(field1);
```

A sequence item can also specify sequence redirects.

Note that in XML format, the root sequence does not need to be specified if there are no redirects. Instead it will be inferred from the list of fields in the XML and the order of those fields in the XML.

### Sequence Redirects (Conditional Field Structures)

A sequence redirect allows a record to contain different fields based on the value contained in a key field.

See the [Advanced Guide](advanced.md) for details on sequence redirects.

## Meta data Serialization

Meta can be serialized/deserialized to/from XML with the {@link meta-serialization/format/ft-xml-meta-serialization!FtXmlMetaSerialization FtXmlMetaSerialization} class.

### Serialize

The {@link meta-serialization/format/ft-xml-meta-serialization!FtXmlMetaSerialization.serialize serialize()} function generates a XML string from a {@link meta/ft-meta!FtMeta FtMeta}. The optional {@link meta-serialization/format/meta-serializer-options!FtMetaSerializerOptions:interface `options`} parameter provides some control over formatting of the XML. It also has an option {@link meta-serialization/format/meta-serializer-options!FtMetaSerializerOptions.explicitIndices `explicitIndicies`}.

By default, the position (or index) of a sequence item is inferred from its position/order in the XML string.  Likewise, the index of a field when inferring the root index, is normally determined by its position/order in the XML string.  However the \<Field> and \<Item> XML elements can have an `Index` attribute. This explicitly specifies the index of the item (or field) in a sequence.  When an XML string is deserialized, the deserialization will honour the value in index attributes as much as possible.  To include these `Index` attributes, set {@link meta-serialization/format/meta-serializer-options!FtMetaSerializerOptions.explicitIndices `explicitIndicies`} to true.

```typescript
const options: FtMetaSerializerOptions = {
  explicitIndices: true,
  indentChars: " "
}
const xml = FtXmlMetaSerialization.serialize(meta, options);
```

### Deserialize

The {@link meta-serialization/format/ft-xml-meta-serialization!FtXmlMetaSerialization.deserialize deserialize()} function converts from an XML string to {@link meta/ft-meta!FtMeta FtMeta}. If it finds any errors in the XML, it will add warnings in the (optional) `warnings` parameter and attempt to work around them. For example, if an invalid property value is specified, it will use the default value for that property instead.

```typescript
const metaXml = `<?xml version="1.0" encoding="utf-8"?>
<FieldedText HeadingLineCount="1">
  <Field Name="Name" Headings="Name"/>
  <Field Name="Age" DataType="Integer" Headings="Age"/>
</FieldedText>`;

const warnings = new Array<string>();
const meta = FtXmlMetaSerialization.deserialize(metaXml, warnings);
const noErrors = warnings.length === 0
```
