/**
 * @public
 */
export const FtPadAlignment = {
  Auto: 'Auto',
  Left: 'Left',
  Right: 'Right',
} as const;

/**
 * @public
 */
export type FtPadAlignment = (typeof FtPadAlignment)[keyof typeof FtPadAlignment];
