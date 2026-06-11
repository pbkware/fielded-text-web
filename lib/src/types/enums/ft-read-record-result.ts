/**
 * @public
 */
export const FtReadRecordResult = {
  SameTable: 'SameTable',
  NewTable: 'NewTable',
  NoMoreRecords: 'NoMoreRecords',
} as const;

/**
 * @public
 */
export type FtReadRecordResult = (typeof FtReadRecordResult)[keyof typeof FtReadRecordResult];
