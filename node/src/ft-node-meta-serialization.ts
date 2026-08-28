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
   * @param filePath - The path to the meta file
   * @param format - The format of the file (default: auto-detect from extension)
   * @returns The deserialized FtMeta object
   */
  deserializeFromFile(
    filePath: PathOrFileDescriptor,
    warnings?: string[],
    encoding: BufferEncoding = 'utf-8',
    format?: FtMetaSerializationFormat,
  ): FtMeta {
    // Dynamically import Node.js fs module
    // const { readFile } = await import("node:fs/promises");

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
   * @param meta - The FtMeta object to serialize
   * @param filePath - The output file path
   * @param options - Optional serialization options
   * @param format - The output format (default: auto-detect from extension)
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
