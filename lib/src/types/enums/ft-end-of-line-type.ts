/**
 * @public
 */
export const FtEndOfLineType = {
  Auto: 'Auto',
  Char: 'Char',
  CrLf: 'CrLf',
} as const;

/**
 * @public
 */
export type FtEndOfLineType = (typeof FtEndOfLineType)[keyof typeof FtEndOfLineType];
