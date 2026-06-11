/**
 * @public
 */
export const FtEndOfLineAutoWriteType = {
  CrLf: 'CrLf',
  Cr: 'Cr',
  Lf: 'Lf',
  Local: 'Local',
} as const;

/**
 * @public
 */
export type FtEndOfLineAutoWriteType = (typeof FtEndOfLineAutoWriteType)[keyof typeof FtEndOfLineAutoWriteType];
