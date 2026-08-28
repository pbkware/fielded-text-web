import { FtMetaSerializerOptions } from '../meta-serialization/format/meta-serializer-options.js';
import { FtMetaReferenceType } from '../types/enums/ft-meta-reference-type.js';
import { FtMetaSerializationFormat } from '../types/enums/ft-meta-serialization-format.js';

/**
 * Settings for writing fielded text streams.
 * @public
 */
export interface FtWriterSettings {
  /**
   * Whether to write the |!Fielded Text^| declaration header.
   */
  declared?: boolean;

  /**
   * Type of meta reference to write.
   */
  metaReferenceType?: FtMetaReferenceType;

  /**
   * Meta reference (file path or URL).
   */
  metaReference?: string;

  /**
   * Format of embedded meta to write.
   */
  embeddedMetaFormat?: FtMetaSerializationFormat;

  /**
   * Whether to include explicit index attributes for fields in embedded meta.
   */
  embeddedMetaExplicitIndices?: boolean;

  /**
   * Whether to indent embedded XML metadata.
   */
  embeddedMetaIndent?: boolean;

  /**
   * Characters to use for indenting embedded XML metadata.
   */
  embeddedMetaIndentChars?: string;

  /**
   * Whether to write XML attributes on separate lines.
   */
  embeddedMetaNewLineOnAttributes?: boolean;
}

/** @public */
export namespace FtWriterSettings {
  export const DEFAULT_DECLARED = false;
  export const DEFAULT_META_REFERENCE_TYPE = FtMetaReferenceType.None;
  export const DEFAULT_META_REFERENCE = '';
  export const DEFAULT_EMBEDDED_META_FORMAT = FtMetaSerializationFormat.XML;
  export const DEFAULT_EMBEDDED_META_EXPLICIT_INDICES = FtMetaSerializerOptions.DEFAULT_EXPLICIT_INDICES;
  export const DEFAULT_EMBEDDED_META_INDENT = FtMetaSerializerOptions.DEFAULT_INDENT;
  export const DEFAULT_EMBEDDED_META_INDENT_CHARS = FtMetaSerializerOptions.DEFAULT_INDENT_CHARS;
  export const DEFAULT_EMBEDDED_META_NEW_LINE_ON_ATTRIBUTES = FtMetaSerializerOptions.DEFAULT_NEW_LINE_ON_ATTRIBUTES;

  export function loadMetaSerializerOptions(settings: FtWriterSettings, options: Partial<FtMetaSerializerOptions>): void {
    if (options.explicitIndices !== undefined) {
      settings.embeddedMetaExplicitIndices = options.explicitIndices;
    }
    if (options.indent !== undefined) {
      settings.embeddedMetaIndent = options.indent;
    }
    if (options.indentChars !== undefined) {
      settings.embeddedMetaIndentChars = options.indentChars;
    }
    if (options.newLineOnAttributes !== undefined) {
      settings.embeddedMetaNewLineOnAttributes = options.newLineOnAttributes;
    }
  }
}
