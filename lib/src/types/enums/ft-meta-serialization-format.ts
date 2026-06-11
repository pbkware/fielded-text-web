/**
 * Meta serialization format.
 * @public
 */
export const FtMetaSerializationFormat = {
  /**
   * XML format (compatible with Standard 0.9).
   */
  XML: 'XML',
  /**
   * JSON format (Alternative for experimental use).
   */
  JSON: 'JSON',
} as const;

/**
 * @public
 */
export type FtMetaSerializationFormat = (typeof FtMetaSerializationFormat)[keyof typeof FtMetaSerializationFormat];
