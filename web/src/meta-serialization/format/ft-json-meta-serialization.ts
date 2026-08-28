/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtBooleanMetaField } from '../../meta/fields/ft-boolean-meta-field.js';
import { FtDateTimeMetaField } from '../../meta/fields/ft-date-time-meta-field.js';
import { FtDecimalMetaField } from '../../meta/fields/ft-decimal-meta-field.js';
import { FtFloatMetaField } from '../../meta/fields/ft-float-meta-field.js';
import { FtIntegerMetaField } from '../../meta/fields/ft-integer-meta-field.js';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtStringMetaField } from '../../meta/fields/ft-string-meta-field.js';
import { FtMeta } from '../../meta/ft-meta.js';
import { DataTypeMetaSerialization } from '../types/enums/data-type-meta-serialisation.js';
import { EndOfLineAutoWriteTypeMetaSerialization } from '../types/enums/end-of-line-auto-write-type-meta-serialization.js';
import { EndOfLineTypeMetaSerialization } from '../types/enums/end-of-line-type-meta-serialization.js';
import { HeadingConstraintMetaSerialization } from '../types/enums/heading-constraint-meta-serialization.js';
import { LastLineEndedTypeMetaSerialization } from '../types/enums/last-line-ended-type-meta-serialization.js';
import { PadAlignmentMetaSerialization } from '../types/enums/pad-alignment-meta-serialization.js';
import { PadCharTypeMetaSerialization } from '../types/enums/pad-char-type-meta-serialization.js';
import { QuotedTypeMetaSerialization } from '../types/enums/quoted-type-meta-serialization.js';
import { TruncateTypeMetaSerialization } from '../types/enums/truncate-type-meta-serialization.js';
import { FtMetaSerializerOptions } from './meta-serializer-options.js';

/**
 * Serializes and deserializes FtMeta to/from JSON format.
 * This provides a simpler alternative to XML serialization.
 * @public
 */
export class FtJsonMetaSerialization {
  /**
   * Serialize an FtMeta object to JSON string.
   */
  serialize(meta: FtMeta, _options?: FtMetaSerializerOptions): string {
    const obj: any = {
      culture: meta.culture.name,
      delimiterChar: meta.delimiterChar,
      quoteChar: meta.quoteChar,
      lineCommentChar: meta.lineCommentChar,
      endOfLineType: EndOfLineTypeMetaSerialization.serialize(meta.endOfLineType),
      endOfLineChar: meta.endOfLineChar,
      endOfLineAutoWriteType: EndOfLineAutoWriteTypeMetaSerialization.serialize(meta.endOfLineAutoWriteType),
      lastLineEndedType: LastLineEndedTypeMetaSerialization.serialize(meta.lastLineEndedType),
      allowEndOfLineCharInQuotes: meta.allowEndOfLineCharInQuotes,
      ignoreBlankLines: meta.ignoreBlankLines,
      ignoreExtraChars: meta.ignoreExtraChars,
      allowIncompleteRecords: meta.allowIncompleteRecords,
      stuffedEmbeddedQuotes: meta.stuffedEmbeddedQuotes,
      substitutionsEnabled: meta.substitutionsEnabled,
      substitutionChar: meta.substitutionChar,
      headingLineCount: meta.headingLineCount,
      mainHeadingLineIndex: meta.mainHeadingLineIndex,
      headingConstraint: HeadingConstraintMetaSerialization.serialize(meta.headingConstraint, undefined),
      headingQuotedType: QuotedTypeMetaSerialization.serialize(meta.headingQuotedType, true, undefined),
      headingAlwaysWriteOptionalQuote: meta.headingAlwaysWriteOptionalQuote,
      headingWritePrefixSpace: meta.headingWritePrefixSpace,
      headingPadAlignment: PadAlignmentMetaSerialization.serialize(meta.headingPadAlignment, true, undefined),
      headingPadCharType: PadCharTypeMetaSerialization.serialize(meta.headingPadCharType, true, undefined),
      headingPadChar: meta.headingPadChar,
      headingTruncateType: TruncateTypeMetaSerialization.serialize(meta.headingTruncateType, true, undefined),
      headingTruncateChar: meta.headingTruncateChar,
      headingEndOfValueChar: meta.headingEndOfValueChar,
    };

    // Serialize fields
    const fields: any[] = [];
    for (let i = 0; i < meta.fieldList.count; i++) {
      const field = meta.fieldList.get(i);
      fields.push(this.serializeField(field, meta));
    }
    obj.fields = fields;

    // Serialize substitutions
    const substitutions: any[] = [];
    for (let i = 0; i < meta.substitutionList.count; i++) {
      const sub = meta.substitutionList.get(i);
      substitutions.push({
        token: sub.token,
        value: sub.value,
        type: sub.type,
      });
    }
    obj.substitutions = substitutions;

    // Serialize sequences (simplified - just names and root status)
    const sequences: any[] = [];
    for (let i = 0; i < meta.sequenceList.count; i++) {
      const seq = meta.sequenceList.get(i);
      const seqObj: any = {
        name: seq.name,
        root: seq.root,
      };

      // Serialize items (field references)
      const items: any[] = [];
      for (let j = 0; j < seq.itemList.count; j++) {
        const item = seq.itemList.get(j);
        // Store field ID or index to reconstruct later
        const field = item.field;
        items.push({
          fieldId: field.id,
          fieldName: field.name,
        });
      }
      seqObj.items = items;

      sequences.push(seqObj);
    }
    obj.sequences = sequences;

    return JSON.stringify(obj, null, 2);
  }

  /**
   * Deserialize JSON string to an FtMeta object.
   */
  deserialize(json: string, _warnings?: string[]): FtMeta {
    const warnings = new Array<string>();
    const obj = JSON.parse(json) as Record<string, any>;
    const meta = new FtMeta();

    // Deserialize core properties
    if (obj.culture) {
      // Try to set locale from culture name
      try {
        meta.culture = DotNetLocaleSettings.createInvariant(); // Keep default if not parseable
      } catch {
        // Ignore culture parsing errors
      }
    }
    meta.delimiterChar = obj.delimiterChar;
    meta.quoteChar = obj.quoteChar;
    meta.lineCommentChar = obj.lineCommentChar;
    meta.endOfLineType = EndOfLineTypeMetaSerialization.deserialize(obj.endOfLineType, warnings);
    meta.endOfLineChar = obj.endOfLineChar;
    meta.endOfLineAutoWriteType = EndOfLineAutoWriteTypeMetaSerialization.deserialize(obj.endOfLineAutoWriteType, warnings);
    meta.lastLineEndedType = LastLineEndedTypeMetaSerialization.deserialize(obj.lastLineEndedType, warnings);
    meta.allowEndOfLineCharInQuotes = obj.allowEndOfLineCharInQuotes;
    meta.ignoreBlankLines = obj.ignoreBlankLines;
    meta.ignoreExtraChars = obj.ignoreExtraChars;
    meta.allowIncompleteRecords = obj.allowIncompleteRecords;
    meta.stuffedEmbeddedQuotes = obj.stuffedEmbeddedQuotes;
    meta.substitutionsEnabled = obj.substitutionsEnabled;
    meta.substitutionChar = obj.substitutionChar;
    meta.headingLineCount = obj.headingLineCount;
    meta.mainHeadingLineIndex = obj.mainHeadingLineIndex;
    meta.headingConstraint = HeadingConstraintMetaSerialization.deserialize(obj.headingConstraint, undefined, warnings);
    meta.headingQuotedType = QuotedTypeMetaSerialization.deserialize(obj.headingQuotedType, true, undefined, warnings);
    meta.headingAlwaysWriteOptionalQuote = obj.headingAlwaysWriteOptionalQuote;
    meta.headingWritePrefixSpace = obj.headingWritePrefixSpace;
    meta.headingPadAlignment = PadAlignmentMetaSerialization.deserialize(obj.headingPadAlignment, true, undefined, warnings);
    meta.headingPadCharType = PadCharTypeMetaSerialization.deserialize(obj.headingPadCharType, true, undefined, warnings);
    meta.headingPadChar = obj.headingPadChar;
    meta.headingTruncateType = TruncateTypeMetaSerialization.deserialize(obj.headingTruncateType, true, undefined, warnings);
    meta.headingTruncateChar = obj.headingTruncateChar;
    meta.headingEndOfValueChar = obj.headingEndOfValueChar;

    // Deserialize fields
    if (obj.fields) {
      for (const fieldObj of obj.fields) {
        const dataType = DataTypeMetaSerialization.deserialize(fieldObj.dataType, warnings);
        const field = meta.fieldList.new(dataType);
        this.deserializeFieldProperties(field, fieldObj, meta, warnings);
      }
    }

    // Deserialize substitutions
    if (obj.substitutions) {
      for (const subObj of obj.substitutions) {
        const sub = meta.substitutionList.new(subObj.type, subObj.token, subObj.value);
      }
    }

    // Deserialize sequences
    if (obj.sequences) {
      for (const seqObj of obj.sequences) {
        const sequence = meta.sequenceList.new();
        sequence.name = seqObj.name;
        sequence.root = seqObj.root;

        if (seqObj.items) {
          for (const itemObj of seqObj.items) {
            // Find field by name first (more reliable), then by ID
            let field: FtMetaField | undefined;
            if (itemObj.fieldName) {
              field = meta.fieldList.find(itemObj.fieldName);
            } else if (itemObj.fieldId !== undefined && itemObj.fieldId !== 0) {
              field = meta.fieldList.findById(itemObj.fieldId);
            }
            if (field !== undefined) {
              const item = sequence.itemList.new(field);
            } else {
              warnings.push(`Field for sequence item not found: ${itemObj.fieldName || 'ID ' + itemObj.fieldId}`);
            }
          }
        }
      }
    }

    return meta;
  }

  private serializeField(field: FtMetaField, _meta: FtMeta): Record<string, any> {
    // some meta root properties are default for their corresponding field property
    const obj: Record<string, any> = {
      id: field.id,
      name: field.name,
      dataType: DataTypeMetaSerialization.serialize(field.dataType),
      headings: field.headings,
      fixedWidth: field.fixedWidth,
      width: field.width,
      constant: field.constant,
      null: field.null,
      valueQuotedType: QuotedTypeMetaSerialization.serialize(field.valueQuotedType, false, undefined),
      valueAlwaysWriteOptionalQuote: field.valueAlwaysWriteOptionalQuote,
      valueWritePrefixSpace: field.valueWritePrefixSpace,
      valuePadAlignment: PadAlignmentMetaSerialization.serialize(field.valuePadAlignment, false, undefined),
      valuePadCharType: PadCharTypeMetaSerialization.serialize(field.valuePadCharType, false, undefined),
      valuePadChar: field.valuePadChar,
      valueTruncateType: TruncateTypeMetaSerialization.serialize(field.valueTruncateType, false, undefined),
      valueTruncateChar: field.valueTruncateChar,
      valueEndOfValueChar: field.valueEndOfValueChar,
    };

    // Type-specific fields
    if (field instanceof FtStringMetaField) {
      // String fields have no additional properties
    } else if (field instanceof FtBooleanMetaField) {
      obj.styles = field.styles;
      obj.trueText = field.trueText;
      obj.falseText = field.falseText;
    } else if (field instanceof FtIntegerMetaField || field instanceof FtFloatMetaField || field instanceof FtDecimalMetaField) {
      obj.style = field.styles;
      obj.format = field.format;
    } else if (field instanceof FtDateTimeMetaField) {
      obj.style = field.styles;
      obj.format = field.format;
    }

    return obj;
  }

  private deserializeFieldProperties(field: FtMetaField, obj: Record<string, any>, meta: FtMeta, warnings: string[]): void {
    // meta already has root properties deserialized, so can be used when root property is default
    field.name = obj.name;
    field.headings = obj.headings || [];
    field.fixedWidth = obj.fixedWidth;
    field.width = obj.width;
    field.constant = obj.constant;
    field.null = obj.null;
    field.valueQuotedType = QuotedTypeMetaSerialization.deserialize(obj.valueQuotedType, false, undefined, warnings);
    field.valueAlwaysWriteOptionalQuote = obj.valueAlwaysWriteOptionalQuote;
    field.valueWritePrefixSpace = obj.valueWritePrefixSpace;
    field.valuePadAlignment = PadAlignmentMetaSerialization.deserialize(obj.valuePadAlignment, false, undefined, warnings);
    field.valuePadCharType = PadCharTypeMetaSerialization.deserialize(obj.valuePadCharType, false, undefined, warnings);
    field.valuePadChar = obj.valuePadChar;
    field.valueTruncateType = TruncateTypeMetaSerialization.deserialize(obj.valueTruncateType, false, undefined, warnings);
    field.valueTruncateChar = obj.valueTruncateChar;
    field.valueEndOfValueChar = obj.valueEndOfValueChar;

    // Type-specific properties
    if (field instanceof FtBooleanMetaField && obj.styles !== undefined) {
      if (obj.styles) field.styles = obj.styles;
      if (obj.trueText) field.trueText = obj.trueText;
      if (obj.falseText) field.falseText = obj.falseText;
    } else if (field instanceof FtIntegerMetaField || field instanceof FtFloatMetaField || field instanceof FtDecimalMetaField) {
      if (obj.styles) field.styles = obj.styles;
      if (obj.format) field.format = obj.format;
    } else if (field instanceof FtDateTimeMetaField) {
      if (obj.styles) field.styles = obj.styles;
      if (obj.format) field.format = obj.format;
    }
  }
}

/** @public */
export namespace FtJsonMetaSerialization {
  export function serialize(meta: FtMeta, options?: FtMetaSerializerOptions): string {
    const serializer = new FtJsonMetaSerialization();
    return serializer.serialize(meta, options);
  }

  export function deserialize(json: string, warnings?: string[]): FtMeta {
    const deserializer = new FtJsonMetaSerialization();
    return deserializer.deserialize(json, warnings);
  }
}
