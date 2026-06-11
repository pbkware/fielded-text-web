/**
 * @public
 */
export const FtQuotedType = {
  Never: 'Never',
  Always: 'Always',
  Optional: 'Optional',
} as const;

/**
 * @public
 */
export type FtQuotedType = (typeof FtQuotedType)[keyof typeof FtQuotedType];
