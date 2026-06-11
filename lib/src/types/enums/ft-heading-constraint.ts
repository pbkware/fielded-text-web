/**
 * @public
 */
export const FtHeadingConstraint = {
  None: 'None',
  AllConstant: 'AllConstant',
  MainConstant: 'MainConstant',
  NameConstant: 'NameConstant',
  NameIsMain: 'NameIsMain',
} as const;

/**
 * @public
 */
export type FtHeadingConstraint = (typeof FtHeadingConstraint)[keyof typeof FtHeadingConstraint];
