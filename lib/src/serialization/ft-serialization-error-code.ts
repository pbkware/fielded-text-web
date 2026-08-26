/**
 * Enumeration of serialization error codes.
 * @public
 */
export const FtSerializationErrorCode = {
  Abort: 'Abort',
  DeclarationParameterNameIsZeroLength: 'DeclarationParameterNameIsZeroLength',
  DeclaredParameterNameContainsSeparator: 'DeclaredParameterNameContainsSeparator',
  DeclarationParameterNameNotTerminated: 'DeclarationParameterNameNotTerminated',
  DeclarationParameterMissingValue: 'DeclarationParameterMissingValue',
  DeclarationParameterValueNotQuoted: 'DeclarationParameterValueNotQuoted',
  DeclarationParameterValueNotTerminated: 'DeclarationParameterValueNotTerminated',
  DeclarationParametersMissingVersion: 'DeclarationParametersMissingVersion',
  DeclarationParameterVersionIsNotFirst: 'DeclarationParameterVersionIsNotFirst',
  DeclarationParameterInvalidVersion: 'DeclarationParameterInvalidVersion',
  EmbeddedMetaNotFound: 'EmbeddedMetaNotFound',
  IncompleteEmbeddedMeta: 'IncompleteEmbeddedMeta',
  HeadingLineNotEnoughFields: 'HeadingLineNotEnoughFields',
  RecordNotEnoughFields: 'RecordNotEnoughFields',
  HeadingLineTooManyFields: 'HeadingLineTooManyFields',
  RecordTooManyFields: 'RecordTooManyFields',
  HeadingQuotedFieldMissingEndQuoteChar: 'HeadingQuotedFieldMissingEndQuoteChar',
  ValueQuotedFieldMissingEndQuoteChar: 'ValueQuotedFieldMissingEndQuoteChar',
  HeadingNonWhiteSpaceCharBeforeQuotesOpened: 'HeadingNonWhiteSpaceCharBeforeQuotesOpened',
  ValueNonWhiteSpaceCharBeforeQuotesOpened: 'ValueNonWhiteSpaceCharBeforeQuotesOpened',
  HeadingNonWhiteSpaceCharAfterQuotesClosed: 'HeadingNonWhiteSpaceCharAfterQuotesClosed',
  ValueNonWhiteSpaceCharAfterQuotesClosed: 'ValueNonWhiteSpaceCharAfterQuotesClosed',
  HeadingWidthNotReached: 'HeadingWidthNotReached',
  ValueWidthNotReached: 'ValueWidthNotReached',
  HeadingWidthExceeded: 'HeadingWidthExceeded',
  ValueWidthExceeded: 'ValueWidthExceeded',
  FieldValueToText: 'FieldValueToText',
  FieldTruncated: 'FieldTruncated',
  FieldConstantValueMismatch: 'FieldConstantValueMismatch',
  FieldConstNameHeadingMismatch: 'FieldConstNameHeadingMismatch',
  FieldTextParse: 'FieldTextParse',
  MoreThanOneRootSequence: 'MoreThanOneRootSequence',
  HeaderAlreadyWritten: 'HeaderAlreadyWritten',
  LastLineEndedError: 'LastLineEndedError',
  IncompleteDeclaration: 'IncompleteDeclaration',
  InsufficientHeadingLines: 'InsufficientHeadingLines',
  InvalidMeta: 'InvalidMeta',
  LoadMetaFromText: 'LoadMetaFromText',
  MetaReferenceFileNoHandler: 'MetaReferenceFileNoHandler',
  LoadMetaFromFile: 'LoadMetaFromFile',
  MetaReferenceUrlNoHandler: 'MetaReferenceUrlNoHandler',
  LoadMetaFromUrl: 'LoadMetaFromUrl',
} as const;

/**
 * @public
 */
export type FtSerializationErrorCode = (typeof FtSerializationErrorCode)[keyof typeof FtSerializationErrorCode];
