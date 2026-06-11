/**
 * @public
 */
export const FtMetaElementType = {
  FieldedText: 'FieldedText',
  Substitution: 'Substitution',
  Field: 'Field',
  Sequence: 'Sequence',
  SequenceItem: 'SequenceItem',
  SequenceRedirect: 'SequenceRedirect',
} as const;

/**
 * @public
 */
export type FtMetaElementType = (typeof FtMetaElementType)[keyof typeof FtMetaElementType];
