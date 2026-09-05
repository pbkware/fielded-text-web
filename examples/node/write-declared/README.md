---
title: Write Declared
---

# Write Declared Example

This example demonstrates how to write fielded text to a file with a declaration header that includes embedded metadata, loading the meta definition from a local XML file.

## What it does

1. Loads field metadata from the local `meta.ftm` XML file
2. Modifies the meta to disable heading lines
3. Configures `FtWriterSettings` to enable declared output with embedded metadata
4. Uses `FtNodeFileWriter` to write pet data with a `!|!Fielded Text^|` signature header
5. Writes the complete metadata XML embedded in the output file as comment lines

## Running the example

```bash
npm run node-write-declared
```

The command should be run from the `examples` directory. The output file is written to the temporary directory and its path is printed when the example completes.

{@includeCode ./index.ts}
