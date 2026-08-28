/**
 * @public
 */
export const FtMetaReferenceType = {
  None: 'None',
  Embedded: 'Embedded',
  File: 'File',
  Url: 'Url',
} as const;

/**
 * @public
 */
export type FtMetaReferenceType = (typeof FtMetaReferenceType)[keyof typeof FtMetaReferenceType];
