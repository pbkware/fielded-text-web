# FieldedText Examples

This directory contains practical examples demonstrating how to use the FieldedText TypeScript library.

## Prerequisites

Build the project before running examples:

```bash
npm run build
```

## Available Examples

### Basic Examples

#### [basic-read-build-meta](./basic-read-build-meta/)

Learn how to read CSV files by building metadata programmatically in code. Perfect for getting started with the library.

**Topics**: Field definition, meta creation, SerializationReader

#### [basic-read-load-meta](./basic-read-load-meta/)

Read CSV files by loading metadata from XML. Shows how to use external metadata files for reusability.

**Topics**: XML metadata, XmlMetaSerializationReader, metadata reusability

#### [basic-write](./basic-write/)

Write CSV data with automatic quoting and proper formatting. Demonstrates handling special characters like commas and quotes.

**Topics**: SerializationWriter, field types, automatic quoting, formatting

#### [count-records](./count-records/)

Efficiently count records in large files without parsing field values using `seekEnd()`.

**Topics**: Performance optimization, record counting, large file handling

### Event-Driven Examples

#### [read-events](./read-events/)

Use event callbacks during reading to track progress, validate data, and compute statistics on-the-fly.

**Topics**: Event callbacks, progress tracking, validation, statistics

#### [write-events](./write-events/)

Use event callbacks during writing to validate data and monitor progress as records are written.

**Topics**: Event callbacks, validation, progress tracking, quality assurance

### Sequence Examples (Advanced)

#### [build-meta-with-sequences](./build-meta-with-sequences/)

Build metadata for files with sequences (conditional field structures). Create metadata where different records have different fields based on values.

**Topics**: Sequence definition, redirects, conditional structures, metadata generation

#### [read-sequence](./read-sequence/)

Read files with sequences where records have different fields based on field values. Demonstrates accessing fields by name in sequence-based files.

**Topics**: Sequence reading, conditional fields, field access by name, autoNextTable

#### [read-sequence-ordinal](./read-sequence-ordinal/)

Read sequence files using field ordinals for maximum performance. Shows how to optimize large file processing.

**Topics**: Ordinal-based access, performance optimization, large file handling

#### [write-sequence](./write-sequence/)

Write files with sequences where different records have different field structures. Manual approach showing how redirects work.

**Topics**: Sequence writing, sequence invocation, redirect fields, conditional writes

#### [write-sequence-events](./write-sequence-events/)

Write sequence files using event-driven approach. Cleaner code when working with complex sequence structures.

**Topics**: Event-driven sequences, automatic redirect handling, data arrays

#### [sequences](./sequences/)

General introduction to working with repeating sequences for parent-child relationships in flat files.

**Topics**: Sequences, parent-child relationships, nested data

### Output Control Examples

#### [write-declared](./write-declared/)

Create fielded text files with declaration headers that identify the format and version. Useful for interchange and versioning.

**Topics**: Declared output, format signatures, versioning

#### [write-headings](./write-headings/)

Manually control heading line output, including multiple heading lines and data-only files.

**Topics**: Heading lines, multi-row headers, header control

#### [write-comments](./write-comments/)

Add comment lines to output files for documentation and organization.

**Topics**: Comment lines, file documentation, section markers

## Running Examples

### Using npm Scripts (Recommended)

The easiest way to run examples is using the provided npm scripts:

```bash
# Run all examples
npm run examples:all

# Run examples by category
npm run examples:basic       # Basic read/write examples
npm run examples:events      # Event-driven examples
npm run examples:sequences   # Sequence handling examples
npm run examples:output      # Output control examples

# Run individual examples
npm run example:basic-read-build-meta
npm run example:basic-read-load-meta
npm run example:basic-write
npm run example:build-meta-with-sequences
npm run example:count-records
npm run example:read-events
npm run example:read-sequence
npm run example:read-sequence-ordinal
npm run example:sequences
npm run example:write-comments
npm run example:write-declared
npm run example:write-events
npm run example:write-headings
npm run example:write-sequence
npm run example:write-sequence-events
```

### Using tsx Directly

Each example can also be run directly using `tsx`:

```bash
# Run any example
npx tsx examples/<example-name>/index.ts
```

For example:

```bash
npx tsx examples/basic-read-build-meta/index.ts
npx tsx examples/basic-write/index.ts
npx tsx examples/write-declared/index.ts
npx tsx examples/sequences/index.ts
npx tsx examples/read-sequence/index.ts
npx tsx examples/write-sequence-events/index.ts
```

### Compile and Run with Node

Alternatively, compile and run with node:

```bash
# Convert with TypeScript compiler
npx tsc examples/basic-read-build-meta/index.ts --module nodenext --moduleResolution nodenext --target ES2022

# Run with node
node examples/basic-read-build-meta/index.js
```

## Learning Path

**Beginners** - Start here:

1. [basic-read-build-meta](./basic-read-build-meta/) - Learn the fundamentals
2. [basic-write](./basic-write/) - Write your first CSV
3. [basic-read-load-meta](./basic-read-load-meta/) - Use XML metadata

**Intermediate** - Add features: 4. [read-events](./read-events/) - Event-driven reading 5. [write-events](./write-events/) - Event-driven writing 6. [write-headings](./write-headings/) - Control output format 7. [write-comments](./write-comments/) - Document your files 8. [count-records](./count-records/) - Optimize performance

**Advanced** - Master sequences: 9. [build-meta-with-sequences](./build-meta-with-sequences/) - Define complex structures 10. [read-sequence](./read-sequence/) - Read conditional fields 11. [write-sequence](./write-sequence/) - Write conditional fields 12. [write-sequence-events](./write-sequence-events/) - Event-driven sequences 13. [read-sequence-ordinal](./read-sequence-ordinal/) - Maximum performance

**Production** - Polish your output: 14. [write-declared](./write-declared/) - Add format headers 15. [sequences](./sequences/) - Handle complex relationships

## Example Structure

Each example contains:

- **index.ts** - Runnable code demonstrating the feature
- **README.md** - Detailed explanation and expected output

## Featured Capabilities

These examples demonstrate:

✅ **CSV Reading** - Parse delimited text files  
✅ **CSV Writing** - Generate properly formatted output  
✅ **XML Metadata** - Load/save metadata in standard XML format  
✅ **Type Safety** - Strong typing for field values  
✅ **Automatic Quoting** - Handle special characters transparently  
✅ **Number Formatting** - Locale-aware number and date formatting  
✅ **Event Callbacks** - Hook into read/write operations  
✅ **Sequences** - Repeating groups and nested structures  
✅ **Comments** - Add documentation to files  
✅ **Heading Control** - Single or multi-line headers  
✅ **Declared Format** - Self-describing files with version information

## Next Steps

After exploring these examples, check out:

- The [tests](../tests/) for more detailed usage patterns
- The [source code](../src/) for API documentation
- The main [README](../README.md) for project overview

## Contributing Examples

Have a useful example to share? Contributions are welcome! Please ensure:

- Code is well-commented and follows existing style
- Include a README.md explaining what the example demonstrates
- Test that the example runs correctly
