import { FtMeta, FtMetaSerializerOptions, FtXmlMetaSerialization } from '@pbkware/fielded-text-web';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'node:fs';

/**
 * API for serializing and deserializing {@link FtMeta} objects to and from XML files.
 *
 * Extends {@link FtXmlMetaSerialization} with Node.js file system access.
 * @public
 */
export class FtNodeXmlMetaSerialization extends FtXmlMetaSerialization {
  /**
   * Deserialize an {@link FtMeta} object from an XML file.
   * @param filePath - The path or file descriptor of the XML file.
   * @param warnings - An optional array to receive deserialization warnings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @returns The deserialized meta object.
   */
  deserializeFromFile(filePath: PathOrFileDescriptor, warnings?: string[], encoding: BufferEncoding = 'utf-8'): FtMeta {
    const content = readFileSync(filePath, encoding);
    return this.deserialize(content, warnings);
  }

  /**
   * Serialize an {@link FtMeta} object to an XML file.
   * @param meta - The meta object to serialize.
   * @param filePath - The output path or file descriptor.
   * @param options - Optional serialization settings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   */
  serializeToFile(meta: FtMeta, filePath: PathOrFileDescriptor, options?: FtMetaSerializerOptions, encoding: BufferEncoding = 'utf-8'): void {
    const content = this.serialize(meta, options);
    writeFileSync(filePath, content, encoding);
  }
}

/**
 * Convenience functions for serializing and deserializing {@link FtMeta} objects to and from XML files.
 * @public
 */
export namespace FtNodeXmlMetaSerialization {
  /**
   * Deserialize an {@link FtMeta} object from an XML file.
   * @param filePath - The path or file descriptor of the XML file.
   * @param warnings - An optional array to receive deserialization warnings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @returns The deserialized meta object.
   */
  export function deserializeFromFile(filePath: PathOrFileDescriptor, warnings?: string[], encoding: BufferEncoding = 'utf-8'): FtMeta {
    const deserializer = new FtNodeXmlMetaSerialization();
    return deserializer.deserializeFromFile(filePath, warnings, encoding);
  }

  /**
   * Serialize an {@link FtMeta} object to an XML file.
   * @param meta - The meta object to serialize.
   * @param filePath - The output path or file descriptor.
   * @param options - Optional serialization settings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   */
  export function serializeToFile(
    meta: FtMeta,
    filePath: PathOrFileDescriptor,
    options?: FtMetaSerializerOptions,
    encoding: BufferEncoding = 'utf-8',
  ): void {
    const serializer = new FtNodeXmlMetaSerialization();
    serializer.serializeToFile(meta, filePath, options, encoding);
  }
}
