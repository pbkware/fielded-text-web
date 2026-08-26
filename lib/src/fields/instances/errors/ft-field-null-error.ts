/**
 * Thrown when a field value is null and an operation is attempted that requires a non-null value.
 * @public
 */
export class FtFieldNullError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FtFieldNullError';
  }
}
