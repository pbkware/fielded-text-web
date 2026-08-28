---
title: Architecture
---

# FieldedText TypeScript Library - Architecture

This document describes the design decisions, component relationships, and extension points of the FieldedText TypeScript library.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Core Components](#core-components)
- [Module Structure](#module-structure)
- [Streams Architecture](#streams-architecture)
- [Type System](#type-system)
- [Metadata System](#metadata-system)
- [Sequence System](#sequence-system)
- [Formatting System](#formatting-system)
- [Factory Pattern](#factory-pattern)
- [Event System](#event-system)
- [Extension Points](#extension-points)
- [Standards Compliance](#standards-compliance)

## Core Components

### Reader/Writer Hierarchy

```
SerializationCore (abstract base)
├── SerializationReader (reading)
└── SerializationWriter (writing)
```

**SerializationCore** provides:

- Metadata management (`loadMeta`, `saveMeta`)
- Field list access
- Sequence navigation
- Table boundary tracking

**SerializationReader** adds:

- Async `read(): Promise<boolean>` method
- Line parsing via `LineParser`
- Heading line parsing via `HeadingLineRecordParser`
- Embedded metadata detection
- Event callbacks: `onRecordStarted`, `onRecordFinished`, `onFieldValueReady`

**SerializationWriter** adds:

- Async `write(): Promise<void>` method
- Line generation via `LineParser`
- Declared output support
- Heading/comment helpers
- Event callbacks: `onRecordStarted`, `onRecordFinished`, `onFieldValueReady`

### Parser Components

Low-level parsing is delegated to specialized classes:

| Component                 | Responsibility                                |
| ------------------------- | --------------------------------------------- |
| `CharReader`              | Character-by-character reading with lookahead |
| `LineParser`              | Delimiter/fixed-width field extraction        |
| `HeadingLineRecordParser` | Heading line matching and extraction          |
| `DeclarationParser`       | `"\|>Fielded Text<\|"` header parsing         |
| `EmbeddedMetaParser`      | Embedded XML metadata extraction              |

### Metadata Components

```
FtMeta (runtime metadata)
├── FtMetaField (base field metadata)
│   ├── FtStringMetaField
│   ├── FtBooleanMetaField
│   ├── FtIntegerMetaField
│   ├── FtFloatMetaField
│   ├── FtDecimalMetaField
│   └── FtDateTimeMetaField
├── FtMetaSequence (sequence metadata)
│   └── FtMetaSequenceItem
└── FtMetaSequenceRedirect (redirect metadata)
    ├── FtExactStringMetaSequenceRedirect
    ├── FtExactBooleanMetaSequenceRedirect
    ├── FtExactIntegerMetaSequenceRedirect
    └── ... (other redirect types)
```

## Module Structure

### Source Organization

```
src/
├── index.ts                      # Public API barrel
├── ft-meta.ts                    # Core metadata classes
├── ft-field.ts                   # Field type hierarchy
├── ft-sequence.ts                # Sequence system
├── serialization/                # Reading/writing
│   ├── serialization-core.ts
│   ├── serialization-reader.ts
│   ├── serialization-writer.ts
│   ├── char-reader.ts
│   ├── line-parser.ts
│   ├── declaration-parser.ts
│   ├── embedded-meta-parser.ts
│   ├── heading-line-record-parser.ts
│   └── formatting/               # Field formatters
│       ├── field-formatter.ts
│       ├── string-field-formatter.ts
│       ├── boolean-field-formatter.ts
│       ├── integer-field-formatter.ts
│       ├── float-field-formatter.ts
│       ├── decimal-field-formatter.ts
│       ├── date-time-field-formatter.ts
│       └── number-field-formatter.ts
├── meta-serialization/           # XML/JSON serialization
│   ├── xml-meta-serialization-reader.ts
│   ├── xml-meta-serialization-writer.ts
│   ├── json-meta-serialization-reader.ts
│   ├── json-meta-serialization-writer.ts
│   └── types/enums/              # Element formatters
│       └── ... (one per enum type)
└── factory/                      # Factory classes
    ├── meta-factory.ts
    ├── field-factory.ts
    ├── sequence-factory.ts
    ├── sequence-item-factory.ts
    ├── sequence-redirect-factory.ts
    └── substitution-factory.ts
```

### Import Conventions

All imports use `.js` extensions (even for `.ts` sources):

```typescript
import { FtMeta } from './ft-meta.js';
import { SerializationReader } from './serialization/serialization-reader.js';
```

This is required by ESM with `"module": "NodeNext"`.

## Streams Architecture

### Web Streams API

The core library uses **Web Streams API** as the primary abstraction:

```typescript
// Reading
const stream = new ReadableStream<string>({ ... });
const reader = stream.getReader();

const serializationReader = new SerializationReader();
serializationReader.openReader(reader);

while (await serializationReader.read()) {
  // Process record
}
```

```typescript
// Writing
const writableStream = new WritableStream<string>({ ... });
const writer = writableStream.getWriter();

const serializationWriter = new SerializationWriter();
serializationWriter.openWriter(writer);

await serializationWriter.write();
```

### Node.js Adapters

For Node.js streams, use adapter classes:

```typescript
import { FtNodeReader, FtNodeWriter } from 'fielded-text-web';
import { createReadStream, createWriteStream } from 'node:fs';

// Reading
const nodeStream = createReadStream('data.csv', 'utf8');
const reader = new FtNodeReader();
reader.loadMeta(meta);
reader.openNodeStream(nodeStream);

while (await reader.read()) {
  // Process
}

// Writing
const nodeStream = createWriteStream('output.csv', 'utf8');
const writer = new FtNodeWriter();
writer.loadMeta(meta);
writer.openNodeStream(nodeStream);

await writer.write();
```

**Implementation**: `FtNodeReader` and `FtNodeWriter` are thin subclasses that convert Node.js `Readable`/`Writable` to Web Streams using the built-in `Readable.toWeb()` and `Writable.toWeb()` methods (Node.js 17+).

### String-Based I/O

For simple in-memory operations, use string-based methods:

```typescript
// Read from string
reader.open(csvString);

// Write to string
const stringWriter = new FtStringWriter();
writer.open(stringWriter, true);
```

## Type System

### Field Type Hierarchy

```text
FtField (abstract base)
├── FtStringField
├── FtBooleanField
├── FtIntegerField (bigint)
├── FtFloatField (number)
├── FtDecimalField (number with high precision)
├── FtDateTimeField (Date)
└── FtGenericField (unparsed string)
```

Each field type provides:

- `as<Type>` getters/setters (e.g., `asString`, `asBoolean`, `asBigInt`)
- `isNull()` method
- `clone()` method
- Type-specific formatting

### Null Handling

Fields support null values through:

- `isNull(): boolean` method
- `setNull(): void` method

```typescript
if (field.isNull()) {
  console.log('Field is null');
}

field.setNull();
```

## Metadata System

### FtMeta Structure

`FtMeta` is the central metadata class:

```typescript
class FtMeta {
  culture: DotNetLocaleSettings;
  delimiterChar: string | undefined; // Field delimiter
  lineCommentChar: string | undefined; // Comment prefix
  headingLineCount: number; // Number of heading lines
  mainHeadingLineIndex: number; // Which heading line to use

  fieldList: FtMetaFieldList; // Field definitions
  sequenceList: FtMetaSequenceList; // Sequence definitions
  substitutionList: FtMetaSubstitutionList; // Character substitutions

  // ... many other properties
}
```

### Metadata Sources

Metadata can come from three sources:

1. **Programmatic** - Build in code:

   ```typescript
   const meta = new FtMeta();
   meta.culture = 'en-US';
   meta.delimiterChar = ',';
   // ... define fields and sequences
   ```

2. **XML File** - Load from XML:

   ```typescript
   const reader = new XmlMetaSerializationReader();
   const meta = reader.load(xmlString);
   ```

3. **JSON File** - Load from JSON:

   ```typescript
   const reader = new JsonMetaSerializationReader();
   const meta = reader.deserialize(jsonString);
   ```

### Metadata Serialization

**XML Serialization** (`fast-xml-parser`):

- `XmlMetaSerializationReader.load(xml: string): FtMeta`
- `XmlMetaSerializationWriter.save(meta: FtMeta): string`

**JSON Serialization**:

- `JsonMetaSerializationReader.deserialize(json: string): FtMeta`
- `JsonMetaSerializationWriter.serialize(meta: FtMeta): string`

## Sequence System

### Purpose

Sequences define the order and grouping of fields in records. They enable:

- Simple flat records (one sequence, multiple fields)
- Repeating groups (parent-child relationships)
- Dynamic record structures (sequence redirects)

### Sequence Structure

```typescript
class FtMetaSequence {
  name: string;
  root: boolean; // Is this the root sequence?
  itemList: FtMetaSequenceItemList;
}

class FtMetaSequenceItem {
  field: FtMetaField | undefined;
  sequence: FtMetaSequence | undefined;
}
```

### Simple Sequence Example

```typescript
// Root sequence with 3 fields
const rootSequence = meta.sequenceList.new();
rootSequence.name = 'Root';
rootSequence.root = true;
rootSequence.itemList.new().field = nameField;
rootSequence.itemList.new().field = ageField;
rootSequence.itemList.new().field = cityField;
```

### Sequence Redirects

Redirects allow dynamic record structures based on field values:

```typescript
// Different record structures based on "Type" field
const rootSequence = meta.sequenceList.new();
rootSequence.name = 'Root';
rootSequence.root = true;
const typeItem = rootSequence.itemList.new();
typeItem.field = typeField;

// Create Person sequence
const personSequence = meta.sequenceList.new();
personSequence.name = 'Person';
personSequence.itemList.new().field = ageField;
personSequence.itemList.new().field = addressField;

// If Type == 'ExactString', redirect to PersonSequence
const redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactString) as FtExactStringMetaSequenceRedirect;
redirect.value = 'Person';
redirect.sequence = personSequence;
```

## Formatting System

### Field Formatters

Each field type has a corresponding formatter:

| Field Type | Formatter                | Delegates to                |
| ---------- | ------------------------ | --------------------------- |
| String     | `StringFieldFormatter`   | N/A (passthrough)           |
| Boolean    | `BooleanFieldFormatter`  | `FieldedTextLocaleSettings` |
| Integer    | `IntegerFieldFormatter`  | `DotNetIntegerFormatter`    |
| Float      | `FloatFieldFormatter`    | `DotNetDoubleFormatter`     |
| Decimal    | `DecimalFieldFormatter`  | `DotNetDecimalFormatter`    |
| DateTime   | `DateTimeFieldFormatter` | `DotNetDateTimeFormatter`   |

### .NET Compatibility

Number and date formatting delegates to the `dot-net-date-number-formatting` package, which provides .NET-compatible format strings:

```typescript
import { DotNetIntegerFormatter, FieldedTextLocaleSettings } from 'dot-net-date-number-formatting';

const formatter = new DotNetIntegerFormatter();
const settings = new FieldedTextLocaleSettings('en-US');
const formatted = formatter.format(12345, 'N0', settings); // "12,345"
```

This ensures **exact compatibility** with C# FieldedText files.

### Format Strings

- **Integer**: `"G"`, `"D"`, `"N"`, `"X"`, etc.
- **Float/Decimal**: `"G"`, `"F"`, `"N"`, `"E"`, `"P"`, etc.
- **DateTime**: `"d"`, `"D"`, `"t"`, `"T"`, `"g"`, `"G"`, custom patterns

See .NET documentation for complete format string reference.

## Factory Pattern

### Purpose

Factories allow library users to extend or replace default types:

- Custom field types
- Custom sequence types
- Custom redirect types
- Custom metadata types

### Factory Classes

| Factory                   | Purpose                        | Methods                                                |
| ------------------------- | ------------------------------ | ------------------------------------------------------ |
| `MetaFactory`             | Create `FtMeta` instances      | `createMeta()`, `getConstructor()`, `setConstructor()` |
| `FieldFactory`            | Create field instances by type | `createField(type)`                                    |
| `SequenceFactory`         | Create sequence instances      | `createSequence()`                                     |
| `SequenceItemFactory`     | Create sequence item instances | `createSequenceItem()`                                 |
| `SequenceRedirectFactory` | Create redirect instances      | `createSequenceRedirect(type)`                         |
| `SubstitutionFactory`     | Create substitution instances  | `createSubstitution()`, `createMetaSubstitution()`     |

### Example: Custom Field Type

```typescript
import { MetaFactory, FtMeta } from 'fielded-text-web';

class MyCustomMeta extends FtMeta {
  customProperty: string = '';
}

// Register custom constructor
MetaFactory.setConstructor(() => new MyCustomMeta());

// Now all meta creation uses custom type
const meta = FtMeta.create(); // Returns MyCustomMeta instance
console.log(meta instanceof MyCustomMeta); // true
```

## Event System

### Event Callbacks

Readers and writers expose event callbacks:

```typescript
reader.onRecordStarted = (args) => {
  console.log(`Record ${args.recordNumber} started`);
};

reader.onFieldValueReady = (args) => {
  console.log(`Field ${args.fieldIndex}: ${args.field.asString}`);
};

reader.onRecordFinished = (args) => {
  console.log(`Record ${args.recordNumber} finished`);
};
```

### Available Events

**Reader**:

- `onRecordStarted(RecordStartedEventArgs)`
- `onFieldHeadingReady(FieldHeadingReadyEventArgs)`
- `onFieldValueReady(FieldValueReadyEventArgs)`
- `onSequenceRedirected(SequenceRedirectedEventArgs)`
- `onRecordFinished(RecordFinishedEventArgs)`
- `onTableStarted(TableStartedEventArgs)`
- `onTableFinished(TableFinishedEventArgs)`

**Writer**:

- `onRecordStarted(RecordStartedEventArgs)`
- `onFieldValueReady(FieldValueReadyEventArgs)`
- `onRecordFinished(RecordFinishedEventArgs)`
- `onTableStarted(TableStartedEventArgs)`
- `onTableFinished(TableFinishedEventArgs)`

### Event Pattern

Events use a simple callback pattern:

```typescript
type EventCallback<TArgs> = ((args: TArgs) => void) | undefined;

class SerializationReader {
  onRecordStarted: EventCallback<RecordStartedEventArgs> = undefined;
  // ...

  private fireRecordStarted(recordNumber: number): void {
    if (this.onRecordStarted) {
      this.onRecordStarted({ recordNumber });
    }
  }
}
```

No complex event emitter infrastructure needed.

## Extension Points

### 1. Custom Field Types

Extend `FtField` and `FtMetaField`:

```typescript
class FtCustomField extends FtField {
  // Runtime field
}

class FtCustomMetaField extends FtMetaField {
  // Metadata
}
```

Register with `FieldFactory`.

### 2. Custom Sequence Redirects

Extend `FtSequenceRedirect` and `FtMetaSequenceRedirect`:

```typescript
class FtCustomRedirect extends FtSequenceRedirect {
  checkTriggered(field: FtField): boolean {
    // Custom logic
  }
}
```

Register with `SequenceRedirectFactory`.

### 3. Custom Formatters

Implement formatting/parsing for custom field types:

```typescript
class CustomFieldFormatter extends FieldFormatter {
  format(field: FtField): string {
    // Custom formatting
  }

  parse(value: string, field: FtField): void {
    // Custom parsing
  }
}
```

### 4. Custom Metadata Serialization

Extend `XmlMetaSerializationReader`/`Writer` or `JsonMetaSerializationReader`/`Writer` to handle custom metadata elements.

## Standards Compliance

### FieldedText Standard v0.9

This library implements the [FieldedText Standard v0.9](http://www.fieldedtext.org), which defines:

1. **File Structure**
   - Fielded text file format
   - Meta file format (XML)
   - Declared format headers

2. **Field Types**
   - String, Boolean, Integer, Float, Decimal, DateTime
   - Null values
   - Constant fields

3. **Delimiters and Quoting**
   - Delimiter characters
   - Quote characters
   - Embedded quotes (stuffing)
   - Escape sequences (substitutions)

4. **Sequences**
   - Field ordering
   - Repeating groups
   - Sequence redirects

5. **Metadata Properties**
   - Culture/locale
   - Formatting specifications
   - Heading line handling
   - Comment lines

### Compliance Testing

The `tests/compliance/` directory contains:

- Requirement-based tests
- Standard reference mapping
- Non-compliance tracking
- Automated compliance reporting

Run compliance tests:

```bash
npm run test:compliance
npm run compliance:baseline
```

### Known Deviations

This TypeScript port has minimal deviations from the standard:

- JavaScript Date limitations
- JavaScript does not have a native decimal type

## Performance Considerations

### Memory Efficiency

- **Streaming**: Reads/writes line-by-line, not entire file
- **Lazy parsing**: Fields parsed only when accessed
- **Reusable field instances**: Fields reused across records

### Optimization Strategies

1. **Use SerializationReader/Writer** directly for best performance
2. **Avoid event callbacks** if not needed (slight overhead)
3. **Reuse metadata instances** across multiple files
4. **Use streams** for large files (not string concatenation)

## Future Directions

Potential enhancements (not yet implemented):

- **CSV dialect detection** - Auto-detect delimiter, quote char
- **Schema validation** - Validate data against metadata
- **WASM formatting** - Faster number/date formatting
- **Worker threads** - Parallel processing for large files
- **Compression** - Gzip/Brotli streaming support

## References

- [FieldedText Standard v0.9](http://www.fieldedtext.org)
- [C# FieldedText Library](https://pbkware.klink.au/fielded-text/c-sharp-library/index.html)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Node.js Streams](https://nodejs.org/api/stream.html)
- [TypeScript ESM](https://www.typescriptlang.org/docs/handbook/esm-node.html)
