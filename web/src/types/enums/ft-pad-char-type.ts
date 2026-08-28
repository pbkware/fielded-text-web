/**
 * @public
 */
export const FtPadCharType = {
  Auto: 'Auto',
  Specified: 'Specified',
  EndOfValue: 'EndOfValue',
} as const;

/**
 * @public
 */
export type FtPadCharType = (typeof FtPadCharType)[keyof typeof FtPadCharType];
