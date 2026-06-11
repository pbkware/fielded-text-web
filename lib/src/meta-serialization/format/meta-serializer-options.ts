/**
 * Options for serialization formatting.
 * @public
 */
export interface FtMetaSerializerOptions {
  explicitIndices?: boolean; // Whether to include explicit index attributes for fields.
  indent?: boolean;
  indentChars?: string;
  newLineOnAttributes?: boolean;
}

/**
 * Default values for meta serialization formatting.
 * @public
 */
export namespace FtMetaSerializerOptions {
  export const DEFAULT_EXPLICIT_INDICES = false;
  export const DEFAULT_INDENT = true;
  export const DEFAULT_INDENT_CHARS = '  ';
  export const DEFAULT_NEW_LINE_ON_ATTRIBUTES = false;
}
