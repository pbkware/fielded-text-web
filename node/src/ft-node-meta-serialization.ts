import { FtMeta, FtMetaSerialization, FtMetaSerializationFormat, FtMetaSerializerOptions } from '@pbkware/fielded-text-web';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'node:fs';

/**
 * API for serializing and deserializing FtMeta objects into/from files.
 * Provides a unified interface for both XML and JSON formats.
 * @public
 */
export class FtNodeMetaSerialization extends FtMetaSerialization {
  /**
   * Deserialize an FtMeta object from a file path (Node.js only).
   * The format is detected from the file extension when `format` is not provided.
   * @param filePath - The path or file descriptor of the meta file.
   * @param warnings - An optional array to receive deserialization warnings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @param format - The format of the file. Defaults to the format detected from the file extension.
   * @returns The deserialized FtMeta object
   */
  deserializeFromFile(
    filePath: PathOrFileDescriptor,
    warnings?: string[],
    encoding: BufferEncoding = 'utf-8',
    format?: FtMetaSerializationFormat,
  ): FtMeta {
    // Auto-detect format from extension if not specified
    let actualFormat: FtMetaSerializationFormat;
    if (format !== undefined) {
      actualFormat = format;
    } else {
      actualFormat = this.resolveFormat(filePath);
    }

    const content = readFileSync(filePath, encoding);
    return this.deserialize(content, warnings, actualFormat);
  }

  /**
   * Serialize an FtMeta object to a file (Node.js only).
   * The format is detected from the file extension when `format` is not provided.
   * @param meta - The FtMeta object to serialize.
   * @param filePath - The output path or file descriptor.
   * @param options - Optional serialization options.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @param format - The output format. Defaults to the format detected from the file extension.
   */
  serializeToFile(
    meta: FtMeta,
    filePath: PathOrFileDescriptor,
    options?: FtMetaSerializerOptions,
    encoding: BufferEncoding = 'utf-8',
    format?: FtMetaSerializationFormat,
  ): void {
    let actualFormat: FtMetaSerializationFormat;
    if (format !== undefined) {
      actualFormat = format;
    } else {
      actualFormat = this.resolveFormat(filePath);
    }

    const content = this.serialize(meta, options, actualFormat);
    writeFileSync(filePath, content, encoding);
  }

  private resolveFormat(filePath: PathOrFileDescriptor) {
    if (typeof filePath === 'string') {
      if (filePath.endsWith('.json')) {
        return FtMetaSerializationFormat.JSON;
      } else if (filePath.endsWith('.xml') || filePath.endsWith('.ftm')) {
        return FtMetaSerializationFormat.XML;
      } else {
        return FtMetaSerializationFormat.XML;
      }
    } else {
      return FtMetaSerializationFormat.XML;
    }
  }
}

/**
 * Convenience functions for serializing and deserializing {@link FtMeta} objects to and from files.
 * Supports the XML and JSON formats handled by {@link FtMetaSerialization}.
 * @public
 */
export namespace FtNodeMetaSerialization {
  /**
   * Deserialize an {@link FtMeta} object from a file.
   * The format is detected from the file extension when `format` is not provided.
   * @param filePath - The path or file descriptor of the meta file.
   * @param warnings - An optional array to receive deserialization warnings.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @param format - The format of the file. Defaults to the format detected from the file extension.
   * @returns The deserialized meta object.
   */
  export function deserializeFromFile(
    filePath: PathOrFileDescriptor,
    warnings?: string[],
    encoding: BufferEncoding = 'utf-8',
    format?: FtMetaSerializationFormat,
  ): FtMeta {
    const serialization = new FtNodeMetaSerialization();
    return serialization.deserializeFromFile(filePath, warnings, encoding, format);
  }

  /**
   * Serialize an {@link FtMeta} object to a file.
   * The format is detected from the file extension when `format` is not provided.
   * @param meta - The meta object to serialize.
   * @param filePath - The output path or file descriptor.
   * @param options - Optional serialization options.
   * @param encoding - The encoding of the file. Defaults to `utf-8`.
   * @param format - The output format. Defaults to the format detected from the file extension.
   */
  export function serializeToFile(
    meta: FtMeta,
    filePath: PathOrFileDescriptor,
    options?: FtMetaSerializerOptions,
    encoding: BufferEncoding = 'utf-8',
    format?: FtMetaSerializationFormat,
  ): void {
    const serialization = new FtNodeMetaSerialization();
    return serialization.serializeToFile(meta, filePath, options, encoding, format);
  }
}
