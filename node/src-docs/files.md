---
title: Files
---

# Files (Node)

The Node Fielded Text library extends several classes in [@pbkware/fielded-text-web](https://pbkware.github.io/fielded-text-ts/Web/) so that they support reading and writing to files with the `Node` runtime.

- {@link ft-node-file-reader!FtNodeFileReader FtNodeFileReader} - extends [FtReader](/fielded-text-ts/Web/api/ft-reader/FtReader/)
- {@link ft-node-file-writer!FtNodeFileWriter FtNodeFileWriter} - extends [FtWriter](/fielded-text-ts/Web/api/ft-writer/FtWriter/)
- {@link ft-node-meta-serialization!FtNodeMetaSerialization FtNodeMetaSerialization} - extends [FtMetaSerialization](/fielded-text-ts/Web/meta-serialization/ft-meta-serialization/FtMetaSerialization-1/)
- {@link ft-node-xml-meta-serialization!FtNodeXmlMetaSerialization FtNodeXmlMetaSerialization} - extends [FtXmlMetaSerialization](/fielded-text-ts/Web/meta-serialization/format/ft-xml-meta-serialization/FtXmlMetaSerialization-1/)

## FtNodeFileReader & FtNodeFileWriter

The following constructors are added to the corresponding classes which enable Fielded Text data to be read or written to/from files.

```ts
new FtNodeFileReader(
    filePath: PathLike,
    metaOrEncoding?: BufferEncoding | FtMeta,
    encoding?: BufferEncoding,
    immediatelyReadHeader?: boolean,
): FtNodeFileReader

new FtNodeFileWriter(
    filePath: PathLike,
    meta: FtMeta,
    encoding?: BufferEncoding,
    settings?: FtWriterSettings,
): FtNodeFileWriter
```

When reading data, it is necessary to have the [Meta](/fielded-text-ts/Web/Guides/Meta_data/) associated with the data. This can be provided to the function in 2 ways:

1. Specified by a parameter in the constructor (the 2nd `metaOrEncoding` parameter)
1. Specified by within the [declaration](https://fieldedtext.org/introduction/file-structure/) part of the Fielded Text data. In this case, the 2nd `metaOrEncoding` parameter specifies the encoding of the file specified in the declaration. If this parameter is not included (or undefined), the encoding defaults to `utf-8`.

For both reading and writing, the 3rd parameter (`encoding`) specifies the encoding of the specified file data (`filePath` parameter). If this value is not included or undefined, the encoding defaults to `utf-8`.

## FtNodeMetaSerialization & FtNodeXmlMetaSerialization

The following methods are added to [FtMetaSerialization](/fielded-text-ts/Web/meta-serialization/ft-meta-serialization/FtMetaSerialization-1/) & [FtXmlMetaSerialization](/fielded-text-ts/Web/meta-serialization/format/ft-xml-meta-serialization/FtXmlMetaSerialization-1/) which enable reading and writing of Meta to/from files.

```ts
serializeToFile(
    meta: FtMeta,
    filePath: PathOrFileDescriptor,
    options?: FtMetaSerializerOptions,
    encoding?: BufferEncoding,
    format?: FtMetaSerializationFormat, // not included in FtNodeXmlMetaSerialization as always `XML`
): void

deserializeFromFile(
    filePath: PathOrFileDescriptor,
    warnings?: string[],
    encoding?: BufferEncoding,
    format?: FtMetaSerializationFormat, // not included in FtNodeXmlMetaSerialization as always `XML`
): FtMeta
```

The `encoding` parameter specifies the encoding of the data in the file. If not present or undefined, it defaults to `utf-8`.

## Examples
