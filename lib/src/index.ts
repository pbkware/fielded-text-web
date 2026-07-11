// Re-export formatting classes from dependency
export {
  DotNetDateTimeStyleFlags,
  DotNetDateTimeStyles,
  DotNetLocaleSettings,
  DotNetNumberStyleFlags,
  DotNetNumberStyles,
} from '@pbkware/dot-net-date-number-formatting';

export { Result } from '@pbkware/js-utils';

// Enums
export { FtBooleanStyles } from './types/enums/ft-boolean-styles.js';
export { FtEndOfLineAutoWriteType } from './types/enums/ft-end-of-line-auto-write-type.js';
export { FtEndOfLineType } from './types/enums/ft-end-of-line-type.js';
export { FtHeadingConstraint } from './types/enums/ft-heading-constraint.js';
export { FtLastLineEndedType } from './types/enums/ft-last-line-ended-type.js';
export { FtLineType } from './types/enums/ft-line-type.js';
export { FtMetaElementType } from './types/enums/ft-meta-element-type.js';
export { FtMetaReferenceType } from './types/enums/ft-meta-reference-type.js';
export { FtMetaSerializationFormat } from './types/enums/ft-meta-serialization-format.js';
export { FtPadAlignment } from './types/enums/ft-pad-alignment.js';
export { FtPadCharType } from './types/enums/ft-pad-char-type.js';
export { FtQuotedType } from './types/enums/ft-quoted-type.js';
export { FtReadRecordResult } from './types/enums/ft-read-record-result.js';
export { FtSequenceInvokationDelay } from './types/enums/ft-sequence-invokation-delay.js';
export { FtSubstitutionType } from './types/enums/ft-substitution-type.js';
export { FtTruncateType } from './types/enums/ft-truncate-type.js';

// Standard types with companion Info namespaces
export { FtDataType } from './types/enums/ft-data-type.js';
export { FtSequenceRedirectType } from './types/enums/ft-sequence-redirect-type.js';

// Core meta classes
export { FtBooleanMetaField } from './meta/fields/ft-boolean-meta-field.js';
export { FtDateTimeMetaField } from './meta/fields/ft-date-time-meta-field.js';
export { FtDecimalMetaField } from './meta/fields/ft-decimal-meta-field.js';
export { FtFloatMetaField } from './meta/fields/ft-float-meta-field.js';
export { FtGenericMetaField } from './meta/fields/ft-generic-meta-field.js';
export { FtIntegerMetaField } from './meta/fields/ft-integer-meta-field.js';
export { FtMetaFieldList } from './meta/fields/ft-meta-field-list.js';
export { FtMetaField } from './meta/fields/ft-meta-field.js';
export { FtStringMetaField } from './meta/fields/ft-string-meta-field.js';
export { FtMetaDefaults } from './meta/ft-meta-defaults.js';
export { FtMeta, FtMetaPropertyId } from './meta/ft-meta.js';
export { FtMetaSequenceItemList } from './meta/sequences/core/ft-meta-sequence-item-list.js';
export { FtMetaSequenceItem } from './meta/sequences/core/ft-meta-sequence-item.js';
export { FtMetaSequenceList } from './meta/sequences/core/ft-meta-sequence-list.js';
export { FtMetaSequence } from './meta/sequences/core/ft-meta-sequence.js';
export { FtBooleanMetaSequenceRedirect } from './meta/sequences/redirects/ft-boolean-meta-sequence-redirect.js';
export { FtCaseInsensitiveStringMetaSequenceRedirect } from './meta/sequences/redirects/ft-case-insensitive-string-meta-sequence-redirect.js';
export { FtDateMetaSequenceRedirect } from './meta/sequences/redirects/ft-date-meta-sequence-redirect.js';
export { FtExactDateTimeMetaSequenceRedirect } from './meta/sequences/redirects/ft-exact-date-time-meta-sequence-redirect.js';
export { FtExactDecimalMetaSequenceRedirect } from './meta/sequences/redirects/ft-exact-decimal-meta-sequence-redirect.js';
export { FtExactFloatMetaSequenceRedirect } from './meta/sequences/redirects/ft-exact-float-meta-sequence-redirect.js';
export { FtExactIntegerMetaSequenceRedirect } from './meta/sequences/redirects/ft-exact-integer-meta-sequence-redirect.js';
export { FtExactStringMetaSequenceRedirect } from './meta/sequences/redirects/ft-exact-string-meta-sequence-redirect.js';
export { FtMetaSequenceRedirectList } from './meta/sequences/redirects/ft-meta-sequence-redirect-list.js';
export { FtMetaSequenceRedirect } from './meta/sequences/redirects/ft-meta-sequence-redirect.js';
export { FtNullMetaSequenceRedirect } from './meta/sequences/redirects/ft-null-meta-sequence-redirect.js';
export { FtMetaSubstitution, FtMetaSubstitutionList } from './meta/substitutions/ft-meta-substitution-list.js';

// Substitutions
export { FtSubstitution } from './substitutions/ft-substitution-list.js';

// Sequence infrastructure
export { FtSequenceInvokation, FtSequenceRedirectDelegate } from './sequences/core/ft-sequence-invokation.js';
export { FtSequenceItemList } from './sequences/core/ft-sequence-item-list.js';
export { FtSequenceItem } from './sequences/core/ft-sequence-item.js';
export { FtSequenceList } from './sequences/core/ft-sequence-list.js';
export { FtSequence } from './sequences/core/ft-sequence.js';
export { FtSequenceRedirectList } from './sequences/redirects/ft-sequence-redirect-list.js';
export { FtSequenceRedirect } from './sequences/redirects/ft-sequence-redirect.js';

// Sequence redirects
export { FtBooleanSequenceRedirect } from './sequences/redirects/ft-boolean-sequence-redirect.js';
export { FtCaseInsensitiveStringSequenceRedirect } from './sequences/redirects/ft-case-insensitive-string-sequence-redirect.js';
export { FtDateSequenceRedirect } from './sequences/redirects/ft-date-sequence-redirect.js';
export { FtExactDateTimeSequenceRedirect } from './sequences/redirects/ft-exact-date-time-sequence-redirect.js';
export { FtExactDecimalSequenceRedirect } from './sequences/redirects/ft-exact-decimal-sequence-redirect.js';
export { FtExactFloatSequenceRedirect } from './sequences/redirects/ft-exact-float-sequence-redirect.js';
export { FtExactIntegerSequenceRedirect } from './sequences/redirects/ft-exact-integer-sequence-redirect.js';
export { FtExactStringSequenceRedirect } from './sequences/redirects/ft-exact-string-sequence-redirect.js';
export { FtNullSequenceRedirect } from './sequences/redirects/ft-null-sequence-redirect.js';

// Factories
export { FtFieldFactory } from './factory/ft-field-factory.js';
export { FtMetaConstructor } from './factory/ft-meta-constructor.js';
export { FtMetaFactory } from './factory/ft-meta-factory.js';
export { FtSequenceConstructor } from './factory/ft-sequence-constructor.js';
export { FtSequenceFactory } from './factory/ft-sequence-factory.js';
export { FtSequenceItemConstructor } from './factory/ft-sequence-item-constructor.js';
export { FtSequenceItemFactory } from './factory/ft-sequence-item-factory.js';
export { FtSequenceRedirectConstructor } from './factory/ft-sequence-redirect-constructor.js';
export { FtSequenceRedirectFactory } from './factory/ft-sequence-redirect-factory.js';
export { FtSubstitutionConstructor } from './factory/ft-substitution-constructor.js';
export { FtSubstitutionFactory } from './factory/ft-substitution-factory.js';

// Field definitions
export { FtBooleanFieldDefinition } from './fields/definitions/ft-boolean-field-definition.js';
export { FtDateTimeFieldDefinition } from './fields/definitions/ft-date-time-field-definition.js';
export { FtDecimalFieldDefinition } from './fields/definitions/ft-decimal-field-definition.js';
export { FtFieldDefinitionList } from './fields/definitions/ft-field-definition-list.js';
export { FtFieldDefinition } from './fields/definitions/ft-field-definition.js';
export { FtFloatFieldDefinition } from './fields/definitions/ft-float-field-definition.js';
export { FtGenericFieldDefinition } from './fields/definitions/ft-generic-field-definition.js';
export { FtIntegerFieldDefinition } from './fields/definitions/ft-integer-field-definition.js';
export { FtStringFieldDefinition } from './fields/definitions/ft-string-field-definition.js';

// Fields
export { FtBooleanField } from './fields/instances/ft-boolean-field.js';
export { FtDateTimeField } from './fields/instances/ft-date-time-field.js';
export { FtDecimalField } from './fields/instances/ft-decimal-field.js';
export { FtField } from './fields/instances/ft-field.js';
export { FtFloatField } from './fields/instances/ft-float-field.js';
export { FtGenericField } from './fields/instances/ft-generic-field.js';
export { FtIntegerField } from './fields/instances/ft-integer-field.js';
export { FtStringField } from './fields/instances/ft-string-field.js';

// Field formatters
export { FtBooleanFieldFormatter } from './serialization/formatting/ft-boolean-field-formatter.js';
export { FtDateTimeFieldFormatter } from './serialization/formatting/ft-date-time-field-formatter.js';
export { FtDecimalFieldFormatter } from './serialization/formatting/ft-decimal-field-formatter.js';
export { FtFieldFormatter } from './serialization/formatting/ft-field-formatter.js';
export { FtFloatFieldFormatter } from './serialization/formatting/ft-float-field-formatter.js';
export { FtIntegerFieldFormatter } from './serialization/formatting/ft-integer-field-formatter.js';
export { FtStringFieldFormatter } from './serialization/formatting/ft-string-field-formatter.js';

// Meta serialization
export { FtJsonMetaSerialization } from './meta-serialization/format/ft-json-meta-serialization.js';
export { FtXmlMetaSerialization } from './meta-serialization/format/ft-xml-meta-serialization.js';
export { FtMetaSerializerOptions } from './meta-serialization/format/meta-serializer-options.js';
export { FtMetaSerialization } from './meta-serialization/ft-meta-serialization.js';
export { FtDateTimeStylesMetaSerialization } from './meta-serialization/styles/ft-date-time-styles-meta-serialization.js';
export { FtNumberStylesMetaSerialization } from './meta-serialization/styles/ft-number-styles-meta-serialization.js';

// Serialization errors and exceptions
export { FtFieldNullError as FtNullError } from './types/errors/ft-field-null-error.js';
export { FtFieldTypeError as FtTypeError } from './types/errors/ft-field-type-error.js';
export { FtSerializationErrorCode } from './types/errors/ft-serialization-error-code.js';
export { FtSerializationError } from './types/errors/ft-serialization-error.js';

// Serialization reader
export { FtDeclaredParameterRec, FtDeclaredParameters } from './serialization/ft-declared-parameters.js';
export { FtSerializationReader } from './serialization/ft-serialization-reader.js';
export { FtStringReader, FtTextReader } from './serialization/ft-text-reader.js';

// Serialization writer
export { FtWriterSettings } from './api/ft-writer-settings.js';
export { FtDeclaredParametersFormatter } from './serialization/formatting/ft-declared-parameters-formatter.js';
export { FtSerializationWriter } from './serialization/ft-serialization-writer.js';
export { FtCallbackTextWriter, FtStringWriter, FtTextWriter } from './serialization/ft-text-writer.js';

// High-level API
export { FtReader } from './api/ft-reader.js';
export { FtAbortSerializationException, FtSerialization } from './api/ft-serialization.js';
export { FtWriter } from './api/ft-writer.js';

// Event args (type-only exports for interfaces)
/**
 * @public
 */
export type { FtFieldHeadingReadyEventArgs } from './types/events/ft-field-heading-ready-event-args.js';
/**
 * @public
 */
export type { FtFieldValueReadyEventArgs } from './types/events/ft-field-value-ready-event-args.js';
/**
 * @public
 */
export type { FtHeadingLineFinishedEventArgs } from './types/events/ft-heading-line-finished-event-args.js';
/**
 * @public
 */
export type { FtHeadingLineStartedEventArgs } from './types/events/ft-heading-line-started-event-args.js';
/**
 * @public
 */
export type { FtRecordFinishedEventArgs } from './types/events/ft-record-finished-event-args.js';
/**
 * @public
 */
export type { FtRecordStartedEventArgs } from './types/events/ft-record-started-event-args.js';
/**
 * @public
 */
export type { FtSequenceRedirectedEventArgs } from './types/events/ft-sequence-redirected-event-args.js';
