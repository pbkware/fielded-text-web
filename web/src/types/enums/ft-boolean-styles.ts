/**
 * Flags enum for boolean parsing styles
 * @public
 */
export const FtBooleanStyles = {
  IgnoreCase: 1 << 0,
  MatchFirstCharOnly: 1 << 1,
  IgnoreTrailingChars: 1 << 2,
  FalseIfNotMatchTrue: 1 << 3,
} as const;

/**
 * @public
 */
export type FtBooleanStyles = (typeof FtBooleanStyles)[keyof typeof FtBooleanStyles];

export const noneBooleanStyles: FtBooleanStyles = 0;
