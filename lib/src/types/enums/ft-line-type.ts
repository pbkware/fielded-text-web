/**
 * @public
 */
export const FtLineType = {
  Comment: 'Comment',
  Signature: 'Signature',
  Declaration2: 'Declaration2',
  EmbeddedMeta: 'EmbeddedMeta',
  Heading: 'Heading',
  Blank: 'Blank',
  Record: 'Record',
} as const;

/**
 * @public
 */
export type FtLineType = (typeof FtLineType)[keyof typeof FtLineType];
