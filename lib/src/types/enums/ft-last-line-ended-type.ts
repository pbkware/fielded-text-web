/**
 * @public
 */
export const FtLastLineEndedType = {
  Never: 'Never',
  Always: 'Always',
  Optional: 'Optional',
} as const;

/**
 * @public
 */
export type FtLastLineEndedType = (typeof FtLastLineEndedType)[keyof typeof FtLastLineEndedType];
