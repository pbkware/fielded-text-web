/**
 * @public
 */
export const FtHeadingConstraint = {
  /** No constraings on headings */
  None: 'None',
  /** All headings in the data must match the headings specified in the Meta */
  AllConstant: 'AllConstant',
  /** The heading in the main heading line in the data must match the corresponding heading specified in the Meta */
  MainConstant: 'MainConstant',
  /** The heading in the main heading line in the data must case-insensitively match the field's name */
  NameConstant: 'NameConstant',
  /** The field's name is set to the heading in the main heading line in the data */
  NameIsMain: 'NameIsMain',
} as const;

/**
 * @public
 */
export type FtHeadingConstraint = (typeof FtHeadingConstraint)[keyof typeof FtHeadingConstraint];
