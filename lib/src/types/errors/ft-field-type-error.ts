/**
 * Thrown when a field value is of an unexpected type.
 * @public
 */
export class FtFieldTypeError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'FtFieldTypeError';
  }
}
