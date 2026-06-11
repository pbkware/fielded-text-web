---
title: Advanced
---

# Advanced Topics

This guide covers advanced features of the FieldedText TypeScript library, including sequences, redirects, substitutions, and extensibility.

## Table of Contents

- [Sequences](#sequences)
- [Sequence Redirects](#sequence-redirects)
- [Substitutions](#substitutions)
- [Factory Customization](#factory-customization)
- [Table Boundaries](#table-boundaries)
- [Fixed-Width Fields](#fixed-width-fields)
- [Mixed Delimiter and Fixed-Width](#mixed-delimiter-and-fixed-width)
- [Custom Field Types](#custom-field-types)

## Sequences

**Sequences** define the order and grouping of fields, enabling complex data structures in flat files.

### Simple Sequence

Most files have one root sequence:

```typescript
const rootSeq = meta.sequenceList.new();
rootSeq.name = 'Root';
rootSeq.root = true; // Mark as root sequence

rootSeq.itemList.new().field = field1;
rootSeq.itemList.new().field = field2;
rootSeq.itemList.new().field = field3;
```

### Sequence Redirects (Conditional Field Structures)

**Redirects** enable dynamic record structures where different records have different fields based on a key field value. This is the standard-compliant way to handle variable record layouts.

**Example: Different record types in one file**

```typescript
// Root sequence (common fields for all records)
const rootSeq = meta.sequenceList.new();
rootSeq.name = 'Root';
rootSeq.root = true;
const typeItem = rootSeq.itemList.new();
typeItem.field = typeField; // Type: 1=Person, 2=Company
rootSeq.itemList.new().field = nameField;

// Person sequence (Type = 1)
const personSeq = meta.sequenceList.new();
personSeq.name = 'Person';
personSeq.itemList.new().field = ageField;
personSeq.itemList.new().field = addressField;

// Company sequence (Type = 2)
const companySeq = meta.sequenceList.new();
companySeq.name = 'Company';
companySeq.itemList.new().field = industryField;
companySeq.itemList.new().field = employeeCountField;

// Add redirects to type field
let redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger);
redirect.sequence = personSeq;
redirect.value = BigInt(1);
redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;

redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger);
redirect.sequence = companySeq;
redirect.value = BigInt(2);
redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
```

**Example data:**

```
Type,Name,Age,Address
1,John Doe,30,123 Main St
Type,Name,Industry,EmployeeCount
2,Acme Corp,Manufacturing,500
1,Jane Smith,25,456 Oak Ave
```

**Reading with redirects:**

```typescript
reader.loadMeta(meta);
reader.open(csvData);

while (reader.read()) {
  const type = reader.getFieldByName('Type')!.asBigInt;
  const name = reader.getFieldByName('Name')!.asString;

  if (type === BigInt(1)) {
    const age = reader.getFieldByName('Age')!.asBigInt;
    const address = reader.getFieldByName('Address')!.asString;
    console.log(`Person: ${name}, ${age}, ${address}`);
  } else if (type === BigInt(2)) {
    const industry = reader.getFieldByName('Industry')!.asString;
    const employees = reader.getFieldByName('EmployeeCount')!.asBigInt;
    console.log(`Company: ${name}, ${industry}, ${employees} employees`);
  }
}
```

### Redirect Types

Multiple redirect types are supported (see {@link types/enums/ft-sequence-redirect-type!FtSequenceRedirectType:var FtSequenceRedirectType}):

- `ExactString` - Exact string match (case-sensitive)
- `CaseInsensitiveString` - String match (case-insensitive)
- `ExactInteger` - Exact integer match
- `Boolean` - Boolean value match
- `ExactFloat` - Exact float match
- `ExactDecimal` - Exact decimal match
- `ExactDateTime` - Exact date/time match
- `Date` - Date portion match (ignore time)
- `Null` - Field value is null

### Sequence Invocations

Control how many times a sequence repeats:

```typescript
// Add sequence item with invocations
const item = orderSeq.itemList.new();
item.sequence = lineItemSeq;

// Create invocations
const invocation = item.invocationList.new();
invocation.count = 5; // Repeat 5 times

// Or: Variable count based on a field
invocation.count = 0; // 0 = unlimited (until redirect or table boundary)
```

## Advanced Redirects

### Nested Redirects

Redirects can trigger other redirects for complex conditional logic:

```typescript
// Dog sequence has a Training field that can redirect
const dogSeq = meta.sequenceList.new();
dogSeq.name = 'Dog';
const trainingItem = dogSeq.itemList.new();
trainingItem.field = trainingField; // Boolean

// Training sequence (only if training=true)
const trainingSeq = meta.sequenceList.new();
trainingSeq.name = 'Training';
trainingSeq.itemList.new().field = trainerField;
trainingSeq.itemList.new().field = costField;

// Nested redirect
const nestedRedirect = trainingItem.redirectList.new(FtSequenceRedirectType.Boolean);
nestedRedirect.sequence = trainingSeq;
nestedRedirect.value = true;
nestedRedirect.invokationDelay = FtSequenceInvokationDelay.AfterField;
```

### Exact String Redirect

Redirect based on exact string match:

```typescript
// Define sequences
const personSeq = meta.sequenceList.new();
personSeq.name = 'Person';
personSeq.itemList.new().field = nameField;
personSeq.itemList.new().field = ageField;

const companySeq = meta.sequenceList.new();
companySeq.name = 'Company';
companySeq.itemList.new().field = companyNameField;
companySeq.itemList.new().field = employeeCountField;

// Define root sequence with type field
const rootSeq = meta.sequenceList.new();
rootSeq.name = 'Root';
rootSeq.root = true;
rootSeq.itemList.new().field = typeField;

// Add redirect on typeField
const personRedirect = typeField.sequenceRedirectList.new(FtSequenceRedirectType.ExactString) as FtExactStringMetaSequenceRedirect;
personRedirect.value = 'Person';
personRedirect.sequence = personSeq;

const companyRedirect = typeField.sequenceRedirectList.new(FtSequenceRedirectType.ExactString) as FtExactStringMetaSequenceRedirect;
companyRedirect.value = 'Company';
companyRedirect.sequence = companySeq;
```

**Example data:**

```
Type,Name,Age
Person,John Doe,30
Person,Jane Smith,25
Type,CompanyName,EmployeeCount
Company,Acme Corp,500
Company,XYZ Inc,1200
```

### Exact Boolean Redirect

```typescript
const activeRedirect = isActiveField.sequenceRedirectList.new(FtSequenceRedirectType.ExactBoolean) as FtExactBooleanMetaSequenceRedirect;
activeRedirect.value = true;
activeRedirect.sequence = activeCustomerSeq;

const inactiveRedirect = isActiveField.sequenceRedirectList.new(FtSequenceRedirectType.ExactBoolean) as FtExactBooleanMetaSequenceRedirect;
inactiveRedirect.value = false;
inactiveRedirect.sequence = inactiveCustomerSeq;
```

### Exact Integer Redirect

```typescript
const statusRedirect = statusCodeField.sequenceRedirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;
statusRedirect.value = BigInt(100);
statusRedirect.sequence = successSeq;
```

### Contains Redirect

Redirect if field contains substring:

```typescript
const containsRedirect = codeField.sequenceRedirectList.new(FtSequenceRedirectType.Contains) as FtContainsMetaSequenceRedirect;
containsRedirect.value = 'ERROR';
containsRedirect.ignoreCase = true;
containsRedirect.sequence = errorSeq;
```

### Pattern Match Redirect

Redirect based on regular expression:

```typescript
const patternRedirect = codeField.sequenceRedirectList.new(FtSequenceRedirectType.RegularExpression) as FtRegularExpressionMetaSequenceRedirect;
patternRedirect.pattern = '^[A-Z]{3}-\\d{4}$';
patternRedirect.sequence = validCodeSeq;
```

### Null Redirect

Redirect if field is null:

```typescript
const nullRedirect = optionalField.sequenceRedirectList.new(FtSequenceRedirectType.Null) as FtNullMetaSequenceRedirect;
nullRedirect.sequence = nullHandlingSeq;
```

### Redirect Events

Track redirects during reading:

```typescript
reader.onSequenceRedirected = (args) => {
  console.log(`Redirected from ${args.fromSequence.name} to ${args.toSequence.name}`);
  console.log(`Triggered by field: ${args.field.name}`);
  console.log(`Field value: ${args.field.asString}`);
};
```

## Substitutions

**Substitutions** are escape sequences for special characters.

### Define Substitutions

```typescript
// Define substitution: \n → newline
const nlSub = meta.substitutionList.new(0);
nlSub.token = '\\n';
nlSub.value = '\n';

// Define substitution: \t → tab
const tabSub = meta.substitutionList.new(1);
tabSub.token = '\\t';
tabSub.value = '\t';

// Define substitution: \\ → backslash
const bsSub = meta.substitutionList.new(2);
bsSub.token = '\\\\';
bsSub.value = '\\';
```

### Reading with Substitutions

When reading, tokens are replaced with values:

**Data:**

```
Name,Description
Widget,Includes\\nMultiple\\nLines
```

**Reading:**

```typescript
reader.read();
const description = reader.fieldList.get(1).asString;
console.log(description);
// Output:
// Includes
// Multiple
// Lines
```

### Writing with Substitutions

When writing, values are replaced with tokens:

```typescript
writer.fieldList.get(0).asString = 'Widget';
writer.fieldList.get(1).asString = 'Includes\nMultiple\nLines';
await writer.write();

// Output:
// Widget,Includes\\nMultiple\\nLines
```

### Auto-Substitution

Set `substitutionChar` for automatic substitution:

```typescript
meta.substitutionChar = '\\';
```

## Factory Customization

Factories allow library extension.

### Custom Meta Class

```typescript
import { MetaFactory, FtMeta } from 'fielded-text-web';

class MyCustomMeta extends FtMeta {
  customProperty: string = '';

  customMethod(): void {
    console.log('Custom logic');
  }
}

// Register custom constructor
MetaFactory.setConstructor(() => new MyCustomMeta());

// Now all meta creation uses custom type
const meta = FtMeta.create();
console.log(meta instanceof MyCustomMeta); // true

// Access custom property
(meta as MyCustomMeta).customProperty = 'value';
```

### Custom Field Class

```typescript
import { FieldFactory, FtStringField, FtDataType } from 'fielded-text-web';

class MyCustomStringField extends FtStringField {
  trimValue(): string {
    return this.asString.trim();
  }
}

// Register custom constructor for String type
const originalConstructor = FieldFactory.getConstructor(FtDataType.String);
FieldFactory.setConstructor(FtDataType.String, () => new MyCustomStringField());

// All String fields now use custom type
const meta = new FtMeta();
const field = meta.fieldList.new(FtDataType.String);
console.log(field instanceof MyCustomStringField); // true
```

### Custom Sequence Redirect

```typescript
import { SequenceRedirectFactory } from 'fielded-text-web';

class MyCustomRedirect extends FtSequenceRedirect {
  checkTriggered(field: FtField): boolean {
    // Custom redirect logic
    const value = field.asString;
    return value.length > 10 && value.startsWith('SPECIAL');
  }
}

// Register (requires extending FtSequenceRedirectType enum)
```

## Table Boundaries

**Tables** are groups of records. Table boundaries occur when:

- Reading starts (table 0)
- Sequence redirects return to root sequence
- End of file

### Detect Table Boundaries

```typescript
reader.onTableStarted = (args) => {
  console.log(`Table ${args.tableNumber} started`);
};

reader.onTableFinished = (args) => {
  console.log(`Table ${args.tableNumber} finished`);
  console.log(`Records in table: ${args.recordCount}`);
};
```

### Table Count

```typescript
reader.open(csvData);

while (reader.read()) {
  // Process records
}

console.log(`Total tables: ${reader.tableCount}`);
```

## Fixed-Width Fields

Fields can have fixed widths instead of delimiters:

```typescript
// No delimiter for fixed-width
meta.delimiterChar = undefined;

// Define field widths
const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = 'Name';
nameField.fixed = true;
nameField.width = 20;

const ageField = meta.fieldList.new(FtDataType.Integer);
ageField.name = 'Age';
ageField.fixed = true;
ageField.width = 3;

const cityField = meta.fieldList.new(FtDataType.String);
cityField.name = 'City';
cityField.fixed = true;
cityField.width = 15;
```

**Example data:**

```
John Doe            30 Seattle
Jane Smith          25 Portland
```

### Alignment

```typescript
// Left-aligned (default for strings)
field.fixedWidthAlignment = FtFixedWidthAlignment.Left;

// Right-aligned (default for numbers)
field.fixedWidthAlignment = FtFixedWidthAlignment.Right;

// Centered
field.fixedWidthAlignment = FtFixedWidthAlignment.Center;
```

### Pad Character

```typescript
// Pad with spaces (default)
field.fixedWidthPadChar = ' ';

// Pad with zeros
field.fixedWidthPadChar = '0';
```

## Mixed Delimiter and Fixed-Width

You can mix delimited and fixed-width fields:

```typescript
meta.delimiterChar = ',';

// Delimited field
const idField = meta.fieldList.new(FtDataType.Integer);
idField.name = 'ID';
idField.fixed = false; // Delimited

// Fixed-width field
const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = 'Name';
nameField.fixed = true;
nameField.width = 20;

// Another delimited field
const statusField = meta.fieldList.new(FtDataType.String);
statusField.name = 'Status';
statusField.fixed = false;
```

**Example data:**

```
ID,Name                ,Status
1,John Doe            ,Active
2,Jane Smith          ,Inactive
```

## Custom Field Types

Extend the library with custom field types:

### 1. Define Metadata Class

```typescript
import { FtMetaField, FtDataType } from 'fielded-text-web';

class FtEmailMetaField extends FtMetaField {
  dataType = FtDataType.String; // Base on String
  validateDomain: boolean = false;

  constructor() {
    super();
  }
}
```

### 2. Define Runtime Field Class

```typescript
import { FtField } from 'fielded-text-web';

class FtEmailField extends FtField {
  private _email: string = '';

  get asString(): string {
    return this._email;
  }

  set asString(value: string) {
    // Validation
    if (!this.isValidEmail(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this._email = value;
  }

  private isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  clone(): FtEmailField {
    const clone = new FtEmailField();
    clone.asString = this._email;
    return clone;
  }
}
```

### 3. Register with Factory

```typescript
import { FieldFactory } from 'fielded-text-web';

// Extend data type enum (or use String type)
// Then register factory
FieldFactory.setConstructor(
  FtDataType.String, // Or custom type
  () => new FtEmailField(),
);
```

### 4. Use Custom Field

```typescript
const meta = new FtMeta();
const emailField = meta.fieldList.new(FtDataType.String);
emailField.name = 'Email';

// Field now validates emails
writer.fieldList.get(0).asString = 'user@example.com'; // Valid
writer.fieldList.get(0).asString = 'invalid-email'; // Throws error
```

## Next Steps

- **[Reading Guide](reading.md)** - Read fielded text files
- **[Writing Guide](writing.md)** - Write fielded text files
- **[Metadata Guide](metadata.md)** - Define field types and formats
- **Examples** - Practical examples of advanced features
- **[FieldedText Standard](https://fieldedtext.org/standard/)** - Complete specification
