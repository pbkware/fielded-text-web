import { CommaText } from '@pbkware/js-utils';
import XMLBuilder from 'fast-xml-builder';
import { XMLParser } from 'fast-xml-parser';
import { FtFieldFactory } from '../../factory/ft-field-factory.js';
import { FtBooleanMetaField } from '../../meta/fields/ft-boolean-meta-field.js';
import { FtDateTimeMetaField } from '../../meta/fields/ft-date-time-meta-field.js';
import { FtDecimalMetaField } from '../../meta/fields/ft-decimal-meta-field.js';
import { FtFloatMetaField } from '../../meta/fields/ft-float-meta-field.js';
import { FtIntegerMetaField } from '../../meta/fields/ft-integer-meta-field.js';
import { FtMetaFieldList } from '../../meta/fields/ft-meta-field-list.js';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtStringMetaField } from '../../meta/fields/ft-string-meta-field.js';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtMeta } from '../../meta/ft-meta.js';
import { FtMetaSequenceItem } from '../../meta/sequences/core/ft-meta-sequence-item.js';
import { FtMetaSequence } from '../../meta/sequences/core/ft-meta-sequence.js';
import { FtBooleanMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-boolean-meta-sequence-redirect.js';
import { FtCaseInsensitiveStringMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-case-insensitive-string-meta-sequence-redirect.js';
import { FtDateMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-date-meta-sequence-redirect.js';
import { FtExactDateTimeMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-date-time-meta-sequence-redirect.js';
import { FtExactDecimalMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-decimal-meta-sequence-redirect.js';
import { FtExactFloatMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-float-meta-sequence-redirect.js';
import { FtExactIntegerMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-integer-meta-sequence-redirect.js';
import { FtExactStringMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-string-meta-sequence-redirect.js';
import { FtMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-meta-sequence-redirect.js';
import { FtNullMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-null-meta-sequence-redirect.js';
import { FtMetaSubstitution } from '../../meta/substitutions/ft-meta-substitution-list.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtAssertError, FtUnreachableCaseError } from '../../types/errors/ft-internal-error.js';
import { FtBooleanStylesMetaSerialization } from '../styles/ft-boolean-styles-meta-serialization.js';
import { FtDateTimeStylesMetaSerialization } from '../styles/ft-date-time-styles-meta-serialization.js';
import { FtNumberStylesMetaSerialization } from '../styles/ft-number-styles-meta-serialization.js';
import { BooleanMetaSerialization } from '../types/boolean-meta-serialization.js';
import { CharMetaSerialization } from '../types/char-meta-serialization.js';
import { DateTimeMetaSerialization } from '../types/date-time-meta-serialization.js';
import { DecimalMetaSerialization } from '../types/decimal-meta-serialization.js';
import { DataTypeMetaSerialization } from '../types/enums/data-type-meta-serialisation.js';
import { EndOfLineAutoWriteTypeMetaSerialization } from '../types/enums/end-of-line-auto-write-type-meta-serialization.js';
import { EndOfLineTypeMetaSerialization } from '../types/enums/end-of-line-type-meta-serialization.js';
import { HeadingConstraintMetaSerialization } from '../types/enums/heading-constraint-meta-serialization.js';
import { LastLineEndedTypeMetaSerialization } from '../types/enums/last-line-ended-type-meta-serialization.js';
import { PadAlignmentMetaSerialization } from '../types/enums/pad-alignment-meta-serialization.js';
import { PadCharTypeMetaSerialization } from '../types/enums/pad-char-type-meta-serialization.js';
import { QuotedTypeMetaSerialization } from '../types/enums/quoted-type-meta-serialization.js';
import { SequenceInvokationDelayMetaSerialization } from '../types/enums/sequence-invokation-delay-meta-serialization.js';
import { SequenceRedirectTypeMetaSerialization } from '../types/enums/sequence-redirect-type-meta-serialisation.js';
import { SubstitutionTypeMetaSerialization } from '../types/enums/substitution-type-meta-serialization.js';
import { TruncateTypeMetaSerialization } from '../types/enums/truncate-type-meta-serialization.js';
import { FloatMetaSerialization } from '../types/float-meta-serialization.js';
import { IntegerFloatMetaSerialization } from '../types/integer-float-meta-serialization.js';
import { IntegerMetaSerialization } from '../types/integer-meta-serialization.js';
import { StringMetaSerialization } from '../types/string-meta-serialization.js';
import { ImplicitExplicitIndexSortRec } from '../utils/implicit-explicit-index-sorter.js';
import { MetaSerializationRedirectSequenceResolver } from '../utils/meta-serialization-redirect-sequence-resolver.js';
import { MetaSerializationSequenceNameResolver } from '../utils/meta-serialization-sequence-name-resolver.js';
import { SequenceItemFieldIndexSerialization } from '../utils/sequence-item-field-indices.js';
import { FtMetaSerializerOptions } from './meta-serializer-options.js';

/**
 * Serializes and deserializes FtMeta to/from XML format.
 * Compatible with the C# XmlMetaSerializationWriter/Reader implementation.
 *
 * Note: The "\@_" prefix is used by fast-xml-parser to distinguish XML attributes
 * from XML elements. Properties starting with "\@_" become XML attributes when
 * serialized, and XML attributes are prefixed with "\@_" when deserialized.
 * @public
 */
export class FtXmlMetaSerialization {
  /**
   * Serialize an FtMeta object to XML string.
   */
  serialize(meta: FtMeta, options?: FtMetaSerializerOptions): string {
    const explicitIndices = options?.explicitIndices ?? FtMetaSerializerOptions.DEFAULT_EXPLICIT_INDICES;

    const rootObj: Record<'FieldedText', Record<string, unknown>> = {
      FieldedText: {
        '@_Culture': StringMetaSerialization.serialize(meta.culture.name, FtMetaDefaults.Root.CultureName),
        '@_DelimiterChar': CharMetaSerialization.serialize(meta.delimiterChar, FtMetaDefaults.Root.DelimiterChar),
        '@_QuoteChar': CharMetaSerialization.serialize(meta.quoteChar, FtMetaDefaults.Root.QuoteChar),
        '@_LineCommentChar': CharMetaSerialization.serialize(meta.lineCommentChar, FtMetaDefaults.Root.LineCommentChar),
        '@_EndOfLineType': EndOfLineTypeMetaSerialization.serialize(meta.endOfLineType),
        '@_EndOfLineChar': CharMetaSerialization.serialize(meta.endOfLineChar, FtMetaDefaults.Root.EndOfLineChar),
        '@_EndOfLineAutoWriteType': EndOfLineAutoWriteTypeMetaSerialization.serialize(meta.endOfLineAutoWriteType),
        '@_LastLineEndedType': LastLineEndedTypeMetaSerialization.serialize(meta.lastLineEndedType),
        '@_AllowEndOfLineCharInQuotes': BooleanMetaSerialization.serialize(
          meta.allowEndOfLineCharInQuotes,
          FtMetaDefaults.Root.AllowEndOfLineCharInQuotes,
        ),
        '@_IgnoreBlankLines': BooleanMetaSerialization.serialize(meta.ignoreBlankLines, FtMetaDefaults.Root.IgnoreBlankLines),
        '@_IgnoreExtraChars': BooleanMetaSerialization.serialize(meta.ignoreExtraChars, FtMetaDefaults.Root.IgnoreExtraChars),
        '@_AllowIncompleteRecords': BooleanMetaSerialization.serialize(meta.allowIncompleteRecords, FtMetaDefaults.Root.AllowIncompleteRecords),
        '@_StuffedEmbeddedQuotes': BooleanMetaSerialization.serialize(meta.stuffedEmbeddedQuotes, FtMetaDefaults.Root.StuffedEmbeddedQuotes),
        '@_SubstitutionChar': CharMetaSerialization.serialize(meta.substitutionChar, FtMetaDefaults.Root.SubstitutionChar),
        '@_HeadingLineCount': IntegerFloatMetaSerialization.serialize(meta.headingLineCount, false, FtMetaDefaults.Root.HeadingLineCount),
        '@_MainHeadingLineIndex': IntegerFloatMetaSerialization.serialize(meta.mainHeadingLineIndex, false, FtMetaDefaults.Root.MainHeadingLineIndex),
        '@_HeadingConstraint': HeadingConstraintMetaSerialization.serialize(meta.headingConstraint, undefined),
        '@_HeadingQuotedType': QuotedTypeMetaSerialization.serialize(meta.headingQuotedType, true, undefined),
        '@_HeadingAlwaysWriteOptionalQuote': BooleanMetaSerialization.serialize(
          meta.headingAlwaysWriteOptionalQuote,
          FtMetaDefaults.Root.HeadingAlwaysWriteOptionalQuote,
        ),
        '@_HeadingWritePrefixSpace': BooleanMetaSerialization.serialize(meta.headingWritePrefixSpace, FtMetaDefaults.Root.HeadingWritePrefixSpace),
        '@_HeadingPadAlignment': PadAlignmentMetaSerialization.serialize(meta.headingPadAlignment, true, undefined),
        '@_HeadingPadCharType': PadCharTypeMetaSerialization.serialize(meta.headingPadCharType, true, undefined),
        '@_HeadingPadChar': CharMetaSerialization.serialize(meta.headingPadChar, FtMetaDefaults.Root.HeadingPadChar),
        '@_HeadingTruncateType': TruncateTypeMetaSerialization.serialize(meta.headingTruncateType, true, undefined),
        '@_HeadingTruncateChar': CharMetaSerialization.serialize(meta.headingTruncateChar, FtMetaDefaults.Root.HeadingTruncateChar),
        '@_HeadingEndOfValueChar': CharMetaSerialization.serialize(meta.headingEndOfValueChar, FtMetaDefaults.Root.HeadingEndOfValueChar),
      },
    };

    // Add substitutions
    const substitutionList = meta.substitutionList;
    const substitutionCount = substitutionList.count;
    if (substitutionCount > 0) {
      const substitutionObjs = new Array<Record<string, unknown>>(substitutionCount);
      for (let i = 0; i < substitutionCount; i++) {
        const sub = substitutionList.get(i);
        substitutionObjs[i] = this.serializeSubstitution(sub);
      }
      rootObj.FieldedText.Substitution = substitutionObjs;
    }

    const metaFieldList = meta.fieldList;
    const metaFieldCount = metaFieldList.count;

    // Add fields
    if (metaFieldCount > 0) {
      const fieldObjs = new Array<Record<string, unknown>>(metaFieldCount);
      for (let i = 0; i < metaFieldCount; i++) {
        const field = metaFieldList.get(i);
        const index = explicitIndices ? i : undefined;
        fieldObjs[i] = this.serializeField(field, index, meta);
      }
      rootObj.FieldedText.Field = fieldObjs;
    }

    // Add sequences
    const metaSequenceList = meta.sequenceList;
    const metaSequenceCount = metaSequenceList.count;
    if (metaSequenceCount > 0) {
      const seqObjs = new Array<Record<string, unknown>>(metaSequenceCount);

      for (let i = 0; i < metaSequenceCount; i++) {
        const seq = metaSequenceList.get(i);
        seqObjs[i] = this.serializeSequence(explicitIndices, seq, metaFieldList);
      }
      rootObj.FieldedText.Sequence = seqObjs;
    }

    const indent = options?.indent ?? FtMetaSerializerOptions.DEFAULT_INDENT;
    const indentChars = options?.indentChars ?? FtMetaSerializerOptions.DEFAULT_INDENT_CHARS;
    // Note: fast-xml-parser doesn't support newLineOnAttributes, so we ignore it

    const builder = new XMLBuilder({
      attributeNamePrefix: '@_',
      ignoreAttributes: false,
      format: indent,
      indentBy: indentChars,
      suppressEmptyNode: false,
      suppressBooleanAttributes: false,
    });

    const xmlContent = builder.build(rootObj);
    return '<?xml version="1.0" encoding="utf-8"?>\n' + xmlContent;
  }

  /**
   * Deserialize XML string to an FtMeta object.
   */
  deserialize(xml: string, warnings?: string[]): FtMeta {
    const parser = new XMLParser({
      attributeNamePrefix: '@_',
      ignoreAttributes: false,
      parseAttributeValue: false, // Keep as strings for proper type handling
      isArray: (name, jpath, isLeafNode, isAttribute) => {
        // These elements can appear multiple times
        return name === 'Substitution' || name === 'Field' || name === 'Sequence' || name === 'Item' || name === 'Heading';
      },
    });

    if (warnings === undefined) {
      warnings = new Array<string>();
    }
    const result = parser.parse(xml);
    const meta = new FtMeta();

    const ftObj = result.FieldedText;
    if (!ftObj) {
      throw new Error('Invalid XML: Missing FieldedText root element');
    }

    // Deserialize root properties
    this.deserializeRootProperties(meta, ftObj, warnings);

    // Deserialize substitutions
    if (ftObj.Substitution) {
      const subs = Array.isArray(ftObj.Substitution) ? ftObj.Substitution : [ftObj.Substitution];
      for (const subObj of subs) {
        const type = SubstitutionTypeMetaSerialization.deserialize(subObj['@_Type'], warnings);
        const token = StringMetaSerialization.tryDeserialize(subObj['@_Token'], warnings);
        const value = StringMetaSerialization.tryDeserialize(subObj['@_Value'], warnings);
        if (token === undefined || value === undefined) {
          warnings.push(`Substitution: Missing required attributes. Token: ${token}, Value: ${value}`);
          continue; // Skip this substitution if required attributes are missing
        } else {
          meta.substitutionList.new(type, token, value);
        }
      }
    }

    // Deserialize fields
    if (ftObj.Field) {
      const headingLineCount = meta.headingLineCount;
      const fieldObjs = Array.isArray(ftObj.Field) ? ftObj.Field : [ftObj.Field];
      const fieldCount = fieldObjs.length;
      const fieldSortRecs = new Array<ImplicitExplicitIndexSortRec<FtMetaField>>(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const fieldSortRec = this.deserializeField(fieldObjs[i], headingLineCount, meta, warnings);
        fieldSortRec.implicitIndex = i;
        fieldSortRecs[i] = fieldSortRec;
      }
      fieldSortRecs.sort((left, right) => ImplicitExplicitIndexSortRec.compare(left, right));
      ImplicitExplicitIndexSortRec.checkSortedArray(fieldSortRecs, 'Field', warnings);
      meta.fieldList.set(fieldSortRecs.map((rec) => rec.target));
    }

    const resolvedOrderedFieldList = meta.fieldList; // Field orders are resolved so can be used to resolve field references in sequences

    // Deserialize sequences
    const objSequence = ftObj.Sequence;
    if (objSequence) {
      const objSequences = Array.isArray(objSequence) ? objSequence : [objSequence];
      const sequenceCount = objSequences.length;
      const sequenceNameResolver = new MetaSerializationSequenceNameResolver();
      const redirectSequenceResolver = new MetaSerializationRedirectSequenceResolver(sequenceNameResolver);

      const redirectNames = new Array<MetaSerializationRedirectSequenceResolver.Rec>(sequenceCount); // We need to collect redirect names first before we can resolve them, so we create records with redirect names and resolve after deserializing all sequences
      const sequenceNameRecs = new Array<MetaSerializationSequenceNameResolver.Rec>(sequenceCount);

      for (let i = 0; i < sequenceCount; i++) {
        const seqObj = objSequences[i];
        const sequenceNameRec = this.deserializeSequence(seqObj, resolvedOrderedFieldList, redirectSequenceResolver, warnings);
        sequenceNameResolver.add(sequenceNameRec);
      }

      redirectSequenceResolver.resolve(warnings);
      const sequences = sequenceNameResolver.resolve(warnings);
      meta.sequenceList.set(sequences);
    }

    return meta;
  }

  private serializeSubstitution(sub: FtMetaSubstitution): Record<string, unknown> {
    return {
      '@_Token': StringMetaSerialization.serialize(sub.token),
      '@_Type': SubstitutionTypeMetaSerialization.serialize(sub.type),
      '@_Value': StringMetaSerialization.serialize(sub.value),
    };
  }

  private serializeField(field: FtMetaField, index: number | undefined, meta: FtMeta): Record<string, unknown> {
    const fieldId = field.id;
    const fieldHeadings = field.headings;
    const obj: Record<string, unknown> = {
      '@_DataType': DataTypeMetaSerialization.serialize(field.dataType),
      '@_Index': index === undefined ? undefined : IntegerFloatMetaSerialization.serialize(index, false),
      '@_Id': fieldId === undefined ? undefined : IntegerFloatMetaSerialization.serialize(fieldId, true, FtMetaDefaults.Field.Id),
      '@_Name': StringMetaSerialization.serialize(field.name, FtMetaDefaults.Field.Name),
      '@_FixedWidth': BooleanMetaSerialization.serialize(field.fixedWidth, FtMetaDefaults.Field.FixedWidth),
      '@_Width': IntegerFloatMetaSerialization.serialize(field.width, false, FtMetaDefaults.Field.Width),
      '@_Constant': BooleanMetaSerialization.serialize(field.constant, FtMetaDefaults.Field.Constant),
      '@_Null': BooleanMetaSerialization.serialize(field.null, FtMetaDefaults.Field.Null),
      '@_ValueQuotedType': QuotedTypeMetaSerialization.serialize(field.valueQuotedType, false, undefined),
      '@_ValueAlwaysWriteOptionalQuote': BooleanMetaSerialization.serialize(field.valueAlwaysWriteOptionalQuote, false),
      '@_ValueWritePrefixSpace': BooleanMetaSerialization.serialize(field.valueWritePrefixSpace, false),
      '@_ValuePadAlignment': PadAlignmentMetaSerialization.serialize(field.valuePadAlignment, false, undefined),
      '@_ValuePadCharType': PadCharTypeMetaSerialization.serialize(field.valuePadCharType, false, undefined),
      '@_ValuePadChar': CharMetaSerialization.serialize(field.valuePadChar, FtMetaDefaults.Field.ValuePadChar),
      '@_ValueTruncateType': TruncateTypeMetaSerialization.serialize(field.valueTruncateType, false, undefined),
      '@_ValueTruncateChar': CharMetaSerialization.serialize(field.valueTruncateChar, FtMetaDefaults.Field.ValueTruncateChar),
      '@_ValueEndOfValueChar': CharMetaSerialization.serialize(field.valueEndOfValueChar, FtMetaDefaults.Field.ValueEndOfValueChar),
      '@_ValueNullChar': CharMetaSerialization.serialize(field.valueNullChar, FtMetaDefaults.Field.ValueNullChar),
      '@_HeadingConstraint': HeadingConstraintMetaSerialization.serialize(field.headingConstraint, meta.headingConstraint),
      '@_HeadingQuotedType': QuotedTypeMetaSerialization.serialize(field.headingQuotedType, true, meta.headingQuotedType),
      '@_HeadingAlwaysWriteOptionalQuote': BooleanMetaSerialization.serialize(
        field.headingAlwaysWriteOptionalQuote,
        meta.headingAlwaysWriteOptionalQuote,
      ),
      '@_HeadingWritePrefixSpace': BooleanMetaSerialization.serialize(field.headingWritePrefixSpace, meta.headingWritePrefixSpace),
      '@_HeadingPadAlignment': PadAlignmentMetaSerialization.serialize(field.headingPadAlignment, true, meta.headingPadAlignment),
      '@_HeadingPadCharType': PadCharTypeMetaSerialization.serialize(field.headingPadCharType, true, meta.headingPadCharType),
      '@_HeadingPadChar': CharMetaSerialization.serialize(field.headingPadChar, meta.headingPadChar),
      '@_HeadingTruncateType': TruncateTypeMetaSerialization.serialize(field.headingTruncateType, true, meta.headingTruncateType),
      '@_HeadingTruncateChar': CharMetaSerialization.serialize(field.headingTruncateChar, meta.headingTruncateChar),
      '@_HeadingEndOfValueChar': CharMetaSerialization.serialize(field.headingEndOfValueChar, meta.headingEndOfValueChar),
      '@_Headings': fieldHeadings.length === 0 ? undefined : StringMetaSerialization.serialize(CommaText.fromStringArray(fieldHeadings)),
    };

    // Type-specific properties
    const fieldDataType = field.dataType;
    const valueSerializable = field.constant && !field.null;
    switch (fieldDataType) {
      case FtDataType.String: {
        const stringField = field as FtStringMetaField;
        if (valueSerializable) {
          obj['@_Value'] = StringMetaSerialization.serialize(stringField.value, FtStringMetaField.DEFAULT_VALUE);
        }
        break;
      }
      case FtDataType.Boolean: {
        const booleanField = field as FtBooleanMetaField;
        obj['@_Styles'] = FtBooleanStylesMetaSerialization.serialize(booleanField.styles);
        obj['@_TrueText'] = StringMetaSerialization.serialize(booleanField.trueText, FtBooleanMetaField.DEFAULT_TRUE_TEXT);
        obj['@_FalseText'] = StringMetaSerialization.serialize(booleanField.falseText, FtBooleanMetaField.DEFAULT_FALSE_TEXT);
        if (valueSerializable) {
          obj['@_Value'] = BooleanMetaSerialization.serialize(booleanField.value, FtBooleanMetaField.DEFAULT_VALUE);
        }
        break;
      }
      case FtDataType.Integer: {
        const integerField = field as FtIntegerMetaField;
        obj['@_Format'] = StringMetaSerialization.serialize(integerField.format, FtIntegerMetaField.DEFAULT_FORMAT);
        obj['@_Styles'] = FtNumberStylesMetaSerialization.serialize(integerField.styles, fieldDataType);
        if (valueSerializable) {
          obj['@_Value'] = IntegerMetaSerialization.serialize(integerField.value, FtIntegerMetaField.DEFAULT_VALUE);
        }
        break;
      }
      case FtDataType.Float: {
        const floatField = field as FtFloatMetaField;
        obj['@_Format'] = StringMetaSerialization.serialize(floatField.format, FtFloatMetaField.DEFAULT_FORMAT);
        obj['@_Styles'] = FtNumberStylesMetaSerialization.serialize(floatField.styles, fieldDataType);
        if (valueSerializable) {
          obj['@_Value'] = FloatMetaSerialization.serialize(floatField.value, FtFloatMetaField.DEFAULT_VALUE);
        }
        break;
      }
      case FtDataType.Decimal: {
        const decimalField = field as FtDecimalMetaField;
        obj['@_Format'] = StringMetaSerialization.serialize(decimalField.format, FtDecimalMetaField.DEFAULT_FORMAT);
        obj['@_Styles'] = FtNumberStylesMetaSerialization.serialize(decimalField.styles, fieldDataType);
        if (valueSerializable) {
          obj['@_Value'] = DecimalMetaSerialization.serialize(decimalField.value, FtDecimalMetaField.DEFAULT_VALUE);
        }
        break;
      }
      case FtDataType.DateTime: {
        const dateTimeField = field as FtDateTimeMetaField;
        obj['@_Format'] = StringMetaSerialization.serialize(dateTimeField.format, FtDateTimeMetaField.DEFAULT_FORMAT);
        obj['@_Styles'] = FtDateTimeStylesMetaSerialization.serialize(dateTimeField.styles);
        if (valueSerializable) {
          obj['@_Value'] = DateTimeMetaSerialization.serialize(dateTimeField.value, FtDateTimeMetaField.DEFAULT_VALUE);
        }
        break;
      }
    }

    return obj;
  }

  private serializeSequence(explicitIndices: boolean, seq: FtMetaSequence, metaFieldList: FtMetaFieldList) {
    // If explicitIndices is true, we can optimise serialization by including by specifying items using Meta field indices up until an item has redirects.
    const { commaTextFieldIndices, count: fieldIndicesCount } = explicitIndices
      ? SequenceItemFieldIndexSerialization.serializeUpToRedirect(seq, metaFieldList)
      : { commaTextFieldIndices: undefined, count: 0 };
    const seqObj: Record<string, unknown> = {
      '@_Name': StringMetaSerialization.serialize(seq.name),
      '@_Root': BooleanMetaSerialization.serialize(seq.root, FtMetaDefaults.Sequence.Root),
      '@_FieldIndices': commaTextFieldIndices,
    };

    const seqItemList = seq.itemList;
    const seqItemCount = seqItemList.count;
    if (fieldIndicesCount < seqItemCount) {
      // Add sequence items not included in field indices as separate elements
      const itemObjs = new Array<Record<string, unknown>>(seqItemCount - fieldIndicesCount);
      for (let i = fieldIndicesCount; i < seqItemCount; i++) {
        const item = seqItemList.get(i);
        const explicityItemIndex = explicitIndices ? i : undefined;
        itemObjs[i - fieldIndicesCount] = this.serializeSequenceItem(item, explicityItemIndex, metaFieldList);
      }
      seqObj.Item = itemObjs;
    }
    return seqObj;
  }

  private serializeSequenceItem(item: FtMetaSequenceItem, explicityItemIndex: number | undefined, metaFieldList: FtMetaFieldList) {
    const field = item.field;
    const itemObj: Record<string, unknown> = {
      '@_Index': explicityItemIndex == undefined ? undefined : IntegerFloatMetaSerialization.serialize(explicityItemIndex, false),
      '@_FieldIndex': SequenceItemFieldIndexSerialization.serializeField(field, metaFieldList),
    };

    const redirectList = item.redirectList;
    const redirectCount = redirectList.count;
    if (redirectCount > 0) {
      const redirectObjs = new Array<Record<string, unknown>>(redirectCount);
      for (let i = 0; i < redirectCount; i++) {
        const redirect = redirectList.get(i);
        const explicitRedirectIndex = explicityItemIndex === undefined ? undefined : i; // explicitRedirectIndex is defined when explicitIndices is true
        redirectObjs[i] = this.serializeRedirect(redirect, explicitRedirectIndex, field.dataType);
      }
      itemObj.Redirect = redirectObjs;
    }
    return itemObj;
  }

  private serializeRedirect(redirect: FtMetaSequenceRedirect, explicityRedirectIndex: number | undefined, fieldDataType: FtDataType) {
    const sequence = redirect.sequence;
    if (sequence === undefined) {
      throw new FtAssertError('XMSSR99312', 'Redirect sequence is undefined');
    } else {
      const redirectType = redirect.type;
      const redirectObj: Record<string, unknown> = {
        '@_Index': explicityRedirectIndex == undefined ? undefined : IntegerFloatMetaSerialization.serialize(explicityRedirectIndex, false),
        '@_SequenceName': StringMetaSerialization.serialize(sequence.name),
        '@_Type': SequenceRedirectTypeMetaSerialization.serialize(redirectType, fieldDataType),
        '@_InvokationDelay': SequenceInvokationDelayMetaSerialization.serialize(redirect.invokationDelay),
      };

      let value: unknown;
      switch (redirectType) {
        case FtSequenceRedirectType.Null:
          value = undefined; // Null redirects don't have a value
          break;
        case FtSequenceRedirectType.ExactString:
          value = StringMetaSerialization.serialize(
            (redirect as FtExactStringMetaSequenceRedirect).value,
            FtExactStringMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        case FtSequenceRedirectType.CaseInsensitiveString:
          value = StringMetaSerialization.serialize(
            (redirect as FtCaseInsensitiveStringMetaSequenceRedirect).value,
            FtCaseInsensitiveStringMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        case FtSequenceRedirectType.Boolean:
          value = BooleanMetaSerialization.serialize((redirect as FtBooleanMetaSequenceRedirect).value, FtBooleanMetaSequenceRedirect.DEFAULT_VALUE);
          break;
        case FtSequenceRedirectType.ExactInteger:
          value = IntegerMetaSerialization.serialize(
            (redirect as FtExactIntegerMetaSequenceRedirect).value,
            FtExactIntegerMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        case FtSequenceRedirectType.ExactFloat:
          value = FloatMetaSerialization.serialize(
            (redirect as FtExactFloatMetaSequenceRedirect).value,
            FtExactFloatMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        case FtSequenceRedirectType.ExactDateTime:
          value = DateTimeMetaSerialization.serialize(
            (redirect as FtExactDateTimeMetaSequenceRedirect).value,
            FtExactDateTimeMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        case FtSequenceRedirectType.Date:
          value = DateTimeMetaSerialization.serialize((redirect as FtDateMetaSequenceRedirect).value, FtDateMetaSequenceRedirect.DEFAULT_VALUE);
          break;
        case FtSequenceRedirectType.ExactDecimal:
          value = DecimalMetaSerialization.serialize(
            (redirect as FtExactDecimalMetaSequenceRedirect).value,
            FtExactDecimalMetaSequenceRedirect.DEFAULT_VALUE,
          );
          break;
        default:
          throw new FtUnreachableCaseError('XMSSR99313', redirectType);
      }

      redirectObj['@_Value'] = value;

      return redirectObj;
    }
  }

  private deserializeRootProperties(meta: FtMeta, obj: Record<string, unknown>, warnings: string[]): void {
    // Basic properties
    meta.delimiterChar = CharMetaSerialization.deserialize(obj['@_DelimiterChar'], FtMetaDefaults.Root.DelimiterChar, warnings);
    meta.quoteChar = CharMetaSerialization.deserialize(obj['@_QuoteChar'], FtMetaDefaults.Root.QuoteChar, warnings);
    meta.lineCommentChar = CharMetaSerialization.deserialize(obj['@_LineCommentChar'], FtMetaDefaults.Root.LineCommentChar, warnings);
    meta.endOfLineChar = CharMetaSerialization.deserialize(obj['@_EndOfLineChar'], FtMetaDefaults.Root.EndOfLineChar, warnings);
    meta.substitutionChar = CharMetaSerialization.deserialize(obj['@_SubstitutionChar'], FtMetaDefaults.Root.SubstitutionChar, warnings);
    meta.headingPadChar = CharMetaSerialization.deserialize(obj['@_HeadingPadChar'], FtMetaDefaults.Root.HeadingPadChar, warnings);
    meta.headingTruncateChar = CharMetaSerialization.deserialize(obj['@_HeadingTruncateChar'], FtMetaDefaults.Root.HeadingTruncateChar, warnings);
    meta.headingEndOfValueChar = CharMetaSerialization.deserialize(
      obj['@_HeadingEndOfValueChar'],
      FtMetaDefaults.Root.HeadingEndOfValueChar,
      warnings,
    );

    // Numeric properties
    meta.endOfLineType = EndOfLineTypeMetaSerialization.deserialize(obj['@_EndOfLineType'], warnings);
    meta.endOfLineAutoWriteType = EndOfLineAutoWriteTypeMetaSerialization.deserialize(obj['@_EndOfLineAutoWriteType'], warnings);
    meta.lastLineEndedType = LastLineEndedTypeMetaSerialization.deserialize(obj['@_LastLineEndedType'], warnings);
    meta.headingLineCount = IntegerFloatMetaSerialization.deserialize(
      obj['@_HeadingLineCount'],
      FtMetaDefaults.Root.HeadingLineCount,
      false,
      warnings,
    );
    meta.mainHeadingLineIndex = IntegerFloatMetaSerialization.deserialize(
      obj['@_MainHeadingLineIndex'],
      FtMetaDefaults.Root.MainHeadingLineIndex,
      false,
      warnings,
    );
    meta.headingConstraint = HeadingConstraintMetaSerialization.deserialize(obj['@_HeadingConstraint'], undefined, warnings);
    meta.headingQuotedType = QuotedTypeMetaSerialization.deserialize(obj['@_HeadingQuotedType'], true, undefined, warnings);
    meta.headingPadAlignment = PadAlignmentMetaSerialization.deserialize(obj['@_HeadingPadAlignment'], true, undefined, warnings);
    meta.headingPadCharType = PadCharTypeMetaSerialization.deserialize(obj['@_HeadingPadCharType'], true, undefined, warnings);
    meta.headingTruncateType = TruncateTypeMetaSerialization.deserialize(obj['@_HeadingTruncateType'], true, undefined, warnings);

    // Boolean properties
    meta.allowEndOfLineCharInQuotes = BooleanMetaSerialization.deserialize(
      obj['@_AllowEndOfLineCharInQuotes'],
      FtMetaDefaults.Root.AllowEndOfLineCharInQuotes,
      warnings,
    );
    meta.ignoreBlankLines = BooleanMetaSerialization.deserialize(obj['@_IgnoreBlankLines'], FtMetaDefaults.Root.IgnoreBlankLines, warnings);
    meta.ignoreExtraChars = BooleanMetaSerialization.deserialize(obj['@_IgnoreExtraChars'], FtMetaDefaults.Root.IgnoreExtraChars, warnings);
    meta.allowIncompleteRecords = BooleanMetaSerialization.deserialize(
      obj['@_AllowIncompleteRecords'],
      FtMetaDefaults.Root.AllowIncompleteRecords,
      warnings,
    );
    meta.stuffedEmbeddedQuotes = BooleanMetaSerialization.deserialize(
      obj['@_StuffedEmbeddedQuotes'],
      FtMetaDefaults.Root.StuffedEmbeddedQuotes,
      warnings,
    );
    meta.headingAlwaysWriteOptionalQuote = BooleanMetaSerialization.deserialize(
      obj['@_HeadingAlwaysWriteOptionalQuote'],
      FtMetaDefaults.Root.HeadingAlwaysWriteOptionalQuote,
      warnings,
    );
    meta.headingWritePrefixSpace = BooleanMetaSerialization.deserialize(
      obj['@_HeadingWritePrefixSpace'],
      FtMetaDefaults.Root.HeadingWritePrefixSpace,
      warnings,
    );
  }

  private deserializeField(
    obj: Record<string, unknown>,
    headingLineCount: number,
    meta: FtMeta,
    warnings: string[],
  ): ImplicitExplicitIndexSortRec<FtMetaField> {
    const dataType = DataTypeMetaSerialization.deserialize(obj['@_DataType'], warnings);
    const field = FtFieldFactory.createMetaField(dataType, headingLineCount);

    field.name = StringMetaSerialization.deserialize(obj['@_Name'], FtMetaDefaults.Field.Name, warnings);
    field.id = IntegerFloatMetaSerialization.deserialize(obj['@_Id'], FtMetaDefaults.Field.Id, true, warnings);
    field.fixedWidth = BooleanMetaSerialization.deserialize(obj['@_FixedWidth'], FtMetaDefaults.Field.FixedWidth, warnings);
    field.width = IntegerFloatMetaSerialization.deserialize(obj['@_Width'], FtMetaDefaults.Field.Width, false, warnings);
    field.constant = BooleanMetaSerialization.deserialize(obj['@_Constant'], FtMetaDefaults.Field.Constant, warnings);
    field.null = BooleanMetaSerialization.deserialize(obj['@_Null'], FtMetaDefaults.Field.Null, warnings);

    // Value formatting properties
    field.valueQuotedType = QuotedTypeMetaSerialization.deserialize(obj['@_ValueQuotedType'], false, undefined, warnings);
    field.valueAlwaysWriteOptionalQuote = BooleanMetaSerialization.deserialize(
      obj['@_ValueAlwaysWriteOptionalQuote'],
      FtMetaDefaults.Field.ValueAlwaysWriteOptionalQuote,
      warnings,
    );
    field.valueWritePrefixSpace = BooleanMetaSerialization.deserialize(
      obj['@_ValueWritePrefixSpace'],
      FtMetaDefaults.Field.ValueWritePrefixSpace,
      warnings,
    );
    field.valuePadAlignment = PadAlignmentMetaSerialization.deserialize(obj['@_ValuePadAlignment'], false, undefined, warnings);
    field.valuePadCharType = PadCharTypeMetaSerialization.deserialize(obj['@_ValuePadCharType'], false, undefined, warnings);
    field.valuePadChar = CharMetaSerialization.deserialize(obj['@_ValuePadChar'], FtMetaDefaults.Field.ValuePadChar, warnings);
    field.valueTruncateType = TruncateTypeMetaSerialization.deserialize(obj['@_ValueTruncateType'], false, undefined, warnings);
    field.valueTruncateChar = CharMetaSerialization.deserialize(obj['@_ValueTruncateChar'], FtMetaDefaults.Field.ValueTruncateChar, warnings);
    field.valueEndOfValueChar = CharMetaSerialization.deserialize(obj['@_ValueEndOfValueChar'], FtMetaDefaults.Field.ValueEndOfValueChar, warnings);

    field.headingConstraint = HeadingConstraintMetaSerialization.deserialize(obj['@_HeadingConstraint'], meta.headingConstraint, warnings);
    field.headingQuotedType = QuotedTypeMetaSerialization.deserialize(obj['@_HeadingQuotedType'], true, meta.headingQuotedType, warnings);
    field.headingAlwaysWriteOptionalQuote = BooleanMetaSerialization.deserialize(
      obj['@_HeadingAlwaysWriteOptionalQuote'],
      meta.headingAlwaysWriteOptionalQuote,
      warnings,
    );
    field.headingWritePrefixSpace = BooleanMetaSerialization.deserialize(obj['@_HeadingWritePrefixSpace'], meta.headingWritePrefixSpace, warnings);
    field.headingPadAlignment = PadAlignmentMetaSerialization.deserialize(obj['@_HeadingPadAlignment'], true, meta.headingPadAlignment, warnings);
    field.headingPadCharType = PadCharTypeMetaSerialization.deserialize(obj['@_HeadingPadCharType'], true, meta.headingPadCharType, warnings);
    field.headingPadChar = CharMetaSerialization.deserialize(obj['@_HeadingPadChar'], meta.headingPadChar, warnings);
    field.headingTruncateType = TruncateTypeMetaSerialization.deserialize(obj['@_HeadingTruncateType'], true, meta.headingTruncateType, warnings);
    field.headingTruncateChar = CharMetaSerialization.deserialize(obj['@_HeadingTruncateChar'], meta.headingTruncateChar, warnings);
    field.headingEndOfValueChar = CharMetaSerialization.deserialize(obj['@_HeadingEndOfValueChar'], meta.headingEndOfValueChar, warnings);

    // Headings
    if (headingLineCount > 0) {
      const headingsCommaText = StringMetaSerialization.deserialize(obj['@_Headings'], '', warnings);
      const headingsResult = CommaText.tryToStringArray(headingsCommaText, true);
      if (headingsResult.isErr()) {
        warnings.push(`Headings: Invalid: Field ${field.name}: Value: "${headingsCommaText}"`);
      } else {
        const headings = headingsResult.value;
        const deserializedCount = headings.length;
        if (deserializedCount !== headingLineCount) {
          headings.length = headingLineCount;
          if (deserializedCount < headingLineCount) {
            for (let i = deserializedCount; i < headingLineCount; i++) {
              headings[i] = '';
            }
          }
        }
        field.headings = headings;
      }
    }

    const fieldDataType = field.dataType;
    const valueDeserializable = field.constant && !field.null;
    const deserializableValue = valueDeserializable ? obj['@_Value'] : undefined;
    switch (fieldDataType) {
      case FtDataType.String: {
        const stringField = field as FtStringMetaField;
        stringField.value = StringMetaSerialization.deserialize(deserializableValue, FtStringMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      case FtDataType.Boolean: {
        const booleanField = field as FtBooleanMetaField;
        booleanField.styles = FtBooleanStylesMetaSerialization.deserialize(obj['@_Styles'], warnings);
        booleanField.trueText = StringMetaSerialization.deserialize(obj['@_TrueText'], FtBooleanMetaField.DEFAULT_TRUE_TEXT, warnings);
        booleanField.falseText = StringMetaSerialization.deserialize(obj['@_FalseText'], FtBooleanMetaField.DEFAULT_FALSE_TEXT, warnings);
        booleanField.value = BooleanMetaSerialization.deserialize(deserializableValue, FtBooleanMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      case FtDataType.Integer: {
        const integerField = field as FtIntegerMetaField;
        integerField.format = StringMetaSerialization.deserialize(obj['@_Format'], FtIntegerMetaField.DEFAULT_FORMAT, warnings);
        integerField.styles = FtNumberStylesMetaSerialization.deserialize(obj['@_Styles'], fieldDataType, warnings);
        integerField.value = IntegerMetaSerialization.deserialize(deserializableValue, FtIntegerMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      case FtDataType.Float: {
        const floatField = field as FtFloatMetaField;
        floatField.format = StringMetaSerialization.deserialize(obj['@_Format'], FtFloatMetaField.DEFAULT_FORMAT, warnings);
        floatField.styles = FtNumberStylesMetaSerialization.deserialize(obj['@_Styles'], fieldDataType, warnings);
        floatField.value = FloatMetaSerialization.deserialize(deserializableValue, FtFloatMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      case FtDataType.Decimal: {
        const decimalField = field as FtDecimalMetaField;
        decimalField.format = StringMetaSerialization.deserialize(obj['@_Format'], FtDecimalMetaField.DEFAULT_FORMAT, warnings);
        decimalField.styles = FtNumberStylesMetaSerialization.deserialize(obj['@_Styles'], fieldDataType, warnings);
        decimalField.value = DecimalMetaSerialization.deserialize(deserializableValue, FtDecimalMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      case FtDataType.DateTime: {
        const dateTimeField = field as FtDateTimeMetaField;
        dateTimeField.styles = FtDateTimeStylesMetaSerialization.deserialize(obj['@_Styles'], warnings);
        dateTimeField.format = StringMetaSerialization.deserialize(obj['@_Format'], FtDateTimeMetaField.DEFAULT_FORMAT, warnings);
        dateTimeField.value = DateTimeMetaSerialization.deserialize(deserializableValue, FtDateTimeMetaField.DEFAULT_VALUE, warnings);
        break;
      }
      default:
        throw new FtUnreachableCaseError('XMSDFP', fieldDataType);
    }

    const explicitIndex = IntegerFloatMetaSerialization.deserialize(obj['@_Index'], ImplicitExplicitIndexSortRec.INDEX_NOT_SET, false, warnings);
    return { target: field, implicitIndex: ImplicitExplicitIndexSortRec.INDEX_NOT_SET, explicitIndex };
  }

  private deserializeSequence(
    seqObj: Record<string, unknown>,
    resolvedOrderedFieldList: FtMetaFieldList,
    redirectSequenceResolver: MetaSerializationRedirectSequenceResolver,
    warnings: string[],
  ): MetaSerializationSequenceNameResolver.Rec {
    const sequence = new FtMetaSequence();
    const objName = seqObj['@_Name'];
    let result: MetaSerializationSequenceNameResolver.Rec;
    if (typeof objName === 'string') {
      result = { sequence, name: objName };
    } else {
      result = { sequence, name: undefined };
      if (objName === undefined) {
        warnings.push('Sequence: Missing required attribute: Name');
      } else {
        warnings.push(`Sequence: Invalid Name attribute: ${objName}`);
      }
    }
    sequence.name = result.name ?? '';
    sequence.root = BooleanMetaSerialization.deserialize(seqObj['@_Root'], FtMetaDefaults.Sequence.Root, warnings);

    // Deserialize sequence items
    if (seqObj.Item) {
      const itemObjs = Array.isArray(seqObj.Item) ? seqObj.Item : [seqObj.Item];
      const itemCount = itemObjs.length;
      const itemSortRecs = new Array<ImplicitExplicitIndexSortRec<FtMetaSequenceItem>>(itemCount);
      let count = 0;
      for (let i = 0; i < itemCount; i++) {
        const itemSortRec = this.deserializeSequenceItem(itemObjs[i], resolvedOrderedFieldList, redirectSequenceResolver, warnings);
        if (itemSortRec !== undefined) {
          const index = count++;
          itemSortRec.implicitIndex = index;
          itemSortRecs[index] = itemSortRec;
        }
      }
      itemSortRecs.length = count; // In case some items were skipped due to deserialization errors
      itemSortRecs.sort((left, right) => ImplicitExplicitIndexSortRec.compare(left, right));
      ImplicitExplicitIndexSortRec.checkSortedArray(itemSortRecs, 'Sequence Item', warnings);
      sequence.setItemList(itemSortRecs.map((rec) => rec.target));
    }

    return result;
  }

  private deserializeSequenceItem(
    itemObj: Record<string, unknown>,
    resolvedOrderedFieldList: FtMetaFieldList,
    redirectSequenceResolver: MetaSerializationRedirectSequenceResolver,
    warnings: string[],
  ): ImplicitExplicitIndexSortRec<FtMetaSequenceItem> | undefined {
    const field = SequenceItemFieldIndexSerialization.deserializeField(itemObj['@_FieldIndex'], resolvedOrderedFieldList, warnings);
    if (field === undefined) {
      return undefined; // We can't deserialize this item without a valid field reference, but we can continue deserializing other items and sequences, so we return undefined and log a warning instead of throwing an error
    } else {
      const item = new FtMetaSequenceItem(field);

      // Deserialize redirects
      if (itemObj.Redirect) {
        const redirectObjs = Array.isArray(itemObj.Redirect) ? itemObj.Redirect : [itemObj.Redirect];
        const redirectCount = redirectObjs.length;
        const redirectSortRecs = new Array<ImplicitExplicitIndexSortRec<MetaSerializationRedirectSequenceResolver.Rec>>(redirectCount);
        for (let i = 0; i < redirectCount; i++) {
          const redirectRec = this.deserializeRedirect(redirectObjs[i], field.dataType, warnings);
          redirectRec.implicitIndex = i;
          redirectSortRecs[i] = redirectRec;
        }
        redirectSortRecs.sort((left, right) => ImplicitExplicitIndexSortRec.compare(left, right));
        ImplicitExplicitIndexSortRec.checkSortedArray(redirectSortRecs, 'Sequence Redirect', warnings);

        const redirects = new Array<FtMetaSequenceRedirect>(redirectCount);
        for (let i = 0; i < redirectCount; i++) {
          const sortRec = redirectSortRecs[i];
          const redirectNameRec = sortRec.target;
          const redirect = redirectNameRec.redirect;
          const sequenceName = redirectNameRec.sequenceName;
          redirects[i] = redirect;

          redirectSequenceResolver.add(redirect, sequenceName);
        }
        item.setRedirectList(redirects);
      }

      const explicitIndex = IntegerFloatMetaSerialization.deserialize(
        itemObj['@_Index'],
        ImplicitExplicitIndexSortRec.INDEX_NOT_SET,
        false,
        warnings,
      );
      return { target: item, implicitIndex: ImplicitExplicitIndexSortRec.INDEX_NOT_SET, explicitIndex };
    }
  }

  private deserializeRedirect(
    redirectObj: Record<string, unknown>,
    fieldDataType: FtDataType,
    warnings: string[],
  ): ImplicitExplicitIndexSortRec<MetaSerializationRedirectSequenceResolver.Rec> {
    const explicitIndex = IntegerFloatMetaSerialization.deserialize(
      redirectObj['@_Index'],
      ImplicitExplicitIndexSortRec.INDEX_NOT_SET,
      false,
      warnings,
    );
    const objSequenceName = redirectObj['@_SequenceName'];
    const sequenceName = typeof objSequenceName === 'string' ? objSequenceName : undefined;
    const redirectType = SequenceRedirectTypeMetaSerialization.deserialize(redirectObj['@_Type'], fieldDataType, warnings);
    const invokationDelay = SequenceInvokationDelayMetaSerialization.deserialize(redirectObj['@_InvokationDelay'], warnings);

    let redirect: FtMetaSequenceRedirect;
    switch (redirectType) {
      case FtSequenceRedirectType.Null:
        redirect = new FtNullMetaSequenceRedirect();
        // Null redirects don't have a value
        break;
      case FtSequenceRedirectType.ExactString: {
        const exactStringRedirect = new FtExactStringMetaSequenceRedirect();
        exactStringRedirect.value = StringMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtExactStringMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = exactStringRedirect;
        break;
      }
      case FtSequenceRedirectType.CaseInsensitiveString: {
        const caseInsensitiveStringRedirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
        caseInsensitiveStringRedirect.value = StringMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtCaseInsensitiveStringMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = caseInsensitiveStringRedirect;
        break;
      }
      case FtSequenceRedirectType.Boolean: {
        const booleanRedirect = new FtBooleanMetaSequenceRedirect();
        booleanRedirect.value = BooleanMetaSerialization.deserialize(redirectObj['@_Value'], FtBooleanMetaSequenceRedirect.DEFAULT_VALUE, warnings);
        redirect = booleanRedirect;
        break;
      }
      case FtSequenceRedirectType.ExactInteger: {
        const exactIntegerRedirect = new FtExactIntegerMetaSequenceRedirect();
        exactIntegerRedirect.value = IntegerMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtExactIntegerMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = exactIntegerRedirect;
        break;
      }
      case FtSequenceRedirectType.ExactFloat: {
        const exactFloatRedirect = new FtExactFloatMetaSequenceRedirect();
        exactFloatRedirect.value = FloatMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtExactFloatMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = exactFloatRedirect;
        break;
      }
      case FtSequenceRedirectType.ExactDateTime: {
        const exactDateTimeRedirect = new FtExactDateTimeMetaSequenceRedirect();
        exactDateTimeRedirect.value = DateTimeMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtExactDateTimeMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = exactDateTimeRedirect;
        break;
      }
      case FtSequenceRedirectType.Date: {
        const dateRedirect = new FtDateMetaSequenceRedirect();
        dateRedirect.value = DateTimeMetaSerialization.deserialize(redirectObj['@_Value'], FtDateMetaSequenceRedirect.DEFAULT_VALUE, warnings);
        redirect = dateRedirect;
        break;
      }
      case FtSequenceRedirectType.ExactDecimal: {
        const exactDecimalRedirect = new FtExactDecimalMetaSequenceRedirect();
        exactDecimalRedirect.value = DecimalMetaSerialization.deserialize(
          redirectObj['@_Value'],
          FtExactDecimalMetaSequenceRedirect.DEFAULT_VALUE,
          warnings,
        );
        redirect = exactDecimalRedirect;
        break;
      }
      default:
        throw new FtUnreachableCaseError('XMSSR99315', redirectType);
    }

    redirect.invokationDelay = invokationDelay;
    const nameRec: MetaSerializationRedirectSequenceResolver.Rec = { redirect, sequenceName: sequenceName };

    return {
      target: nameRec,
      implicitIndex: ImplicitExplicitIndexSortRec.INDEX_NOT_SET,
      explicitIndex,
    };
  }
}

/** @public */
export namespace FtXmlMetaSerialization {
  export function serialize(meta: FtMeta, options?: FtMetaSerializerOptions): string {
    const serializer = new FtXmlMetaSerialization();
    return serializer.serialize(meta, options);
  }

  export function deserialize(xml: string, warnings?: string[]): FtMeta {
    const deserializer = new FtXmlMetaSerialization();
    return deserializer.deserialize(xml, warnings);
  }
}
