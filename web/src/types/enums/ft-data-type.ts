/**
 * @public
 */
export const FtDataType = {
  String: 'String',
  Boolean: 'Boolean',
  Integer: 'Integer',
  Float: 'Float',
  Decimal: 'Decimal',
  DateTime: 'DateTime',
} as const;

/**
 * @public
 */
export type FtDataType = (typeof FtDataType)[keyof typeof FtDataType];

/**
 * @public
 */
export type FtNumberDataType = typeof FtDataType.Integer | typeof FtDataType.Float | typeof FtDataType.Decimal;
