/**
 * @public
 */
export const FtSequenceInvokationDelay = {
  AfterField: 'AfterField',
  AfterSequence: 'AfterSequence',
} as const;

/**
 * @public
 */
export type FtSequenceInvokationDelay = (typeof FtSequenceInvokationDelay)[keyof typeof FtSequenceInvokationDelay];
