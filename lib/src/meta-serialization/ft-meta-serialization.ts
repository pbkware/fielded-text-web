import { FtMeta } from '../meta/ft-meta.js';
import { FtMetaSerializationFormat } from '../types/enums/ft-meta-serialization-format.js';
import { FtJsonMetaSerialization } from './format/ft-json-meta-serialization.js';
import { FtXmlMetaSerialization } from './format/ft-xml-meta-serialization.js';
import { FtMetaSerializerOptions } from './format/meta-serializer-options.js';

/**
 * API for serializing and deserializing FtMeta objects.
 * Provides a unified interface for both XML and JSON formats.
 * @public
 */
export class FtMetaSerialization {
  /**
   * Deserialize an FtMeta object from a string.
   * @param content - The serialized meta content (XML or JSON)
   * @param format - The format of the content (default: auto-detect)
   * @param warnings - Optional array to collect warnings during deserialization
   * @returns The deserialized FtMeta object
   */
  deserialize(content: string, warnings?: string[], format?: FtMetaSerializationFormat): FtMeta {
    if (format === FtMetaSerializationFormat.JSON) {
      const jsonDeserializer = new FtJsonMetaSerialization();
      return jsonDeserializer.deserialize(content);
    } else {
      // XML deserialization
      const xmlDeserializer = new FtXmlMetaSerialization();
      return xmlDeserializer.deserialize(content, warnings);
    }
  }

  /**
   * Serialize an FtMeta object to a string.
   * @param meta - The FtMeta object to serialize
   * @param format - The output format (default: XML)
   * @returns The serialized string
   */
  serialize(meta: FtMeta, options?: FtMetaSerializerOptions, format?: FtMetaSerializationFormat): string {
    if (format === FtMetaSerializationFormat.JSON) {
      const jsonSerializer = new FtJsonMetaSerialization();
      return jsonSerializer.serialize(meta);
    } else {
      // XML serialization
      const xmlSerializer = new FtXmlMetaSerialization();
      return xmlSerializer.serialize(meta, options);
    }
  }
}

/** @public */
export namespace FtMetaSerialization {
  export function serialize(meta: FtMeta, options?: FtMetaSerializerOptions, format?: FtMetaSerializationFormat): string {
    const serialization = new FtMetaSerialization();
    return serialization.serialize(meta, options, format);
  }

  export function deserialize(content: string, warnings?: string[], format?: FtMetaSerializationFormat): FtMeta {
    const serialization = new FtMetaSerialization();
    return serialization.deserialize(content, warnings, format);
  }
}
