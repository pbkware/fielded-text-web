/**
 * @public
 */
export const FtTruncateType = {
  Left: 'Left',
  Right: 'Right',
  TruncateChar: 'TruncateChar',
  NullChar: 'NullChar',
  Exception: 'Exception',
} as const;

/**
 * @public
 */
export type FtTruncateType = (typeof FtTruncateType)[keyof typeof FtTruncateType];
