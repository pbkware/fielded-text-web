/**
 * @public
 */
export const FtSequenceRedirectType = {
  Null: 'Null',
  ExactString: 'ExactString',
  CaseInsensitiveString: 'CaseInsensitiveString',
  Boolean: 'Boolean',
  ExactInteger: 'ExactInteger',
  ExactFloat: 'ExactFloat',
  ExactDateTime: 'ExactDateTime',
  Date: 'Date',
  ExactDecimal: 'ExactDecimal',
} as const;

/**
 * @public
 */
export type FtSequenceRedirectType = (typeof FtSequenceRedirectType)[keyof typeof FtSequenceRedirectType];
