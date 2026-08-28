/**
 * Specifies substitution type
 * @public
 */
export const FtSubstitutionType = {
  /**
   * Substitution Type where Substitution Pair (Character and Token) are replaced by a string
   */
  String: 'String',
  AutoEndOfLine: 'AutoEndOfLine',
} as const;

/**
 * @public
 */
export type FtSubstitutionType = (typeof FtSubstitutionType)[keyof typeof FtSubstitutionType];
