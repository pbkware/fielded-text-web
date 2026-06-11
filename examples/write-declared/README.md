# Write Declared Example

This example demonstrates how to write fielded text with a declaration header that includes embedded metadata, loading the meta definition from an XML file.

## What it does

1. Loads field metadata from `BasicExampleMeta.ftm` XML file
2. Modifies the meta to set comment character and disable heading lines
3. Configures `FtWriterSettings` to enable declared output with embedded metadata
4. Writes pet data with a `!|!Fielded Text^|` signature header
5. Includes the complete metadata XML embedded in the output file as comment lines

## Running the example

```bash
npx tsx examples/write-declared/index.ts
```

## Expected output

```
Writing declared fielded text:
==============================

Wrote record 1: Rover (Dog)
Wrote record 2: Charlie (Fish)

Generated declared fielded text:
=================================
!|!Fielded Text^| Version="1.1"
! MetaEmbedded="True"
! <?xml version="1.0" encoding="utf-8"?>
! <FieldedText ...>
!   <Field Id="0" Name="PetName" ...></Field>
!   <Field Id="1" Name="Age" DataType="Float" ...></Field>
!   ...
! </FieldedText>
!
Rover,4.5,Brown,12 Feb 2004,80,True,Dog
Charlie,,Gold,5 Apr 2007,12.3,False,Fish

Notice the !|!Fielded Text^| signature at the top!
This declares the file as FieldedText format version 1.1 with embedded meta.
```

## Key concepts

- **Loading meta from XML**: Uses `XmlMetaSerializer.deserialize()` to load field definitions
- **Declared output**: Files start with `!|!Fielded Text^|` signature (comment character can be customized)
- **Embedded metadata**: Complete field definitions embedded as comment lines in the output
- **Self-describing**: The file contains all information needed to parse it
- **Meta modification**: Loaded meta can be modified before use (e.g., changing comment character)

## Use cases

- **Standalone files**: No external .ftm file needed - all metadata is embedded
- **Interchange**: Files can be read without access to original meta files
- **Version compatibility**: Readers can check format version before parsing
- **Meta embedding**: Metadata can be embedded in the file for portability
