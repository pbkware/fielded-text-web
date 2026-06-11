import { FtField } from '../../fields/instances/ft-field.js';
import { FtSerializationError } from './ft-serialization-error.js';

/**
 * Exception thrown during fielded text serialization/deserialization.
 * @public
 */
export class FtSerializationException extends Error {
  private readonly _error: FtSerializationError;
  private readonly _fieldName: string | undefined;
  private readonly _fieldIndex: number;
  private readonly _sequenceName: string | undefined;
  private readonly _sequenceItemIndex: number;

  constructor(error: FtSerializationError, fieldOrMessage: FtField | string | undefined, messageOrInner?: string | Error, innerException?: Error) {
    let message: string;
    let field: FtField | undefined = undefined;
    let inner: Error | undefined = undefined;

    // Overload resolution
    if (typeof fieldOrMessage === 'string') {
      // (error, message) or (error, message, innerException)
      message = fieldOrMessage;
      if (messageOrInner instanceof Error) {
        inner = messageOrInner;
      }
    } else {
      // (error, field, message) or (error, field, innerException) or (error, field, message, innerException)
      field = fieldOrMessage;
      if (typeof messageOrInner === 'string') {
        message = messageOrInner;
        inner = innerException;
      } else if (messageOrInner instanceof Error) {
        message = messageOrInner.message;
        inner = messageOrInner;
      } else {
        message = '';
      }
    }

    const errorName = FtSerializationError[error];
    const fullMessage = errorName + (message ? ': ' + message : '');
    super(fullMessage);

    this.name = 'FtSerializationException';
    this._error = error;

    if (field === undefined) {
      this._fieldName = undefined;
      this._fieldIndex = -1;
      this._sequenceName = undefined;
      this._sequenceItemIndex = -1;
    } else {
      this._fieldName = field.name;
      this._fieldIndex = field.index;
      const sequence = field.sequence;
      this._sequenceName = sequence.name;
      const sequenceItem = field.sequenceItem;
      this._sequenceItemIndex = sequenceItem.index;
    }

    if (inner) {
      this.cause = inner;
    }
  }

  get error(): FtSerializationError {
    return this._error;
  }

  get fieldName(): string | undefined {
    return this._fieldName;
  }

  get fieldIndex(): number {
    return this._fieldIndex;
  }

  get sequenceName(): string | undefined {
    return this._sequenceName;
  }

  get sequenceItemIndex(): number {
    return this._sequenceItemIndex;
  }
}
