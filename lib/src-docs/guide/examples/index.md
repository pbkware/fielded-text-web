---
title: Examples
children:
    - ../../../../examples/basic-read-build-meta/README.md
    - ../../../../examples/basic-read-load-meta/README.md
    - ../../../../examples/basic-write/README.md
    - ../../../../examples/build-meta-with-sequences/README.md
    - ../../../../examples/count-records/README.md
    - ../../../../examples/read-events/README.md
    - ../../../../examples/read-sequence/README.md
    - ../../../../examples/read-sequence-ordinal/README.md
    - ../../../../examples/sequences-with-readback/README.md
    - ../../../../examples/write-comments/README.md
    - ../../../../examples/write-declared/README.md
    - ../../../../examples/write-events/README.md
    - ../../../../examples/write-headings/README.md
    - ../../../../examples/write-sequence/README.md
    - ../../../../examples/write-sequence-events/README.md
---

# Examples

The examples directory in the source repository contains practical demonstrations:

| Example                                                                               | Description                                     |
| ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [basic-read-build-meta](../../../../examples/basic-read-build-meta/README.md)         | Read CSV by building metadata in code           |
| [basic-read-load-meta](../../../../examples/basic-read-load-meta/README.md)           | Read CSV by loading XML metadata                |
| [basic-write](../../../../examples/basic-write/README.md)                             | Write CSV with automatic quoting                |
| [build-meta-with-sequences](../../../../examples/build-meta-with-sequences/README.md) | Build metadata for files with sequences         |
| [count-records](../../../../examples/count-records/README.md)                         | Efficiently count records without reading data  |
| [read-events](../../../../examples/read-events/README.md)                             | Use event hooks during reading                  |
| [read-sequence](../../../../examples/read-sequence/README.md)                         | Read files with sequences (conditional fields)  |
| [read-sequence-ordinal](../../../../examples/read-sequence-ordinal/README.md)         | Read sequences using ordinals for performance   |
| [sequences-with-readback](../../../../examples/sequences-with-readback/README.md)     | Work with repeating groups                      |
| [write-comments](../../../../examples/write-comments/README.md)                       | Add comment lines to output                     |
| [write-declared](../../../../examples/write-declared/README.md)                       | Create files with declaration headers           |
| [write-events](../../../../examples/write-events/README.md)                           | Use event hooks during writing                  |
| [write-headings](../../../../examples/write-headings/README.md)                       | Write heading lines                             |
| [write-sequence](../../../../examples/write-sequence/README.md)                       | Write files with sequences (conditional fields) |
| [write-sequence-events](../../../../examples/write-sequence-events/README.md)         | Write sequences using event-driven approach     |

## Running Examples

From within the examples directory:

```bash
# Run all examples
npm run all

# Run individual example
npm run basic-write
```
