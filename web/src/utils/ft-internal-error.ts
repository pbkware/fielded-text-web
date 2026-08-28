/** @public */
export abstract class FtInternalError extends Error {
  constructor(
    readonly code: string,
    message: string | undefined,
    errorType: string,
  ) {
    super(message === undefined || message === '' ? `${errorType}: ${code}` : `${errorType}: ${code}: ${message}`);
  }
}

/** @public */
export namespace FtInternalError {
  export const AssertErrorType = 'FtAssert';
  export const UnreachableCaseErrorType = 'FtUnreachableCase';

  export const ExtraFormatting = {
    Ignore: 'Ignore',
    PrependWithColonSpace: 'PrependWithColonSpace',
    PrependWithColonSpaceQuoteError: 'PrependWithColonSpaceQuoteError',
    Postpend: 'Postpend',
    PostpendColonSpace: 'PostpendColonSpace',
    PostpendColonSpaceQuoted: 'PostpendColonSpaceQuoted',
  } as const;

  export type ExtraFormatting = (typeof ExtraFormatting)[keyof typeof ExtraFormatting];

  export function formatExtra(existingMessage: string, extraMessage: string, extraFormatting: ExtraFormatting) {
    switch (extraFormatting) {
      case ExtraFormatting.Ignore:
        return existingMessage;
      case ExtraFormatting.PrependWithColonSpace:
        return `${extraMessage}: ${existingMessage}`;
      case ExtraFormatting.PrependWithColonSpaceQuoteError:
        return `${extraMessage}: "${existingMessage}"`;
      case ExtraFormatting.Postpend:
        return `${existingMessage}${extraMessage}`;
      case ExtraFormatting.PostpendColonSpace:
        return `${existingMessage}: ${extraMessage}`;
      case ExtraFormatting.PostpendColonSpaceQuoted:
        return `${existingMessage}: "${extraMessage}"`;
      default:
        throw new FtUnreachableCaseError('IEAIECINE87339', extraFormatting);
    }
  }

  export function appendToErrorMessage(e: unknown, appendText: string) {
    if (e instanceof Error) {
      e.message += appendText;
      return e;
    } else {
      if (typeof e === 'string') {
        e += appendText;
        return e;
      } else {
        return e; // Do not know how to append
      }
    }
  }

  export function prependErrorMessage(e: unknown, prependText: string) {
    if (e instanceof Error) {
      e.message = prependText + e.message;
      return e;
    } else {
      if (typeof e === 'string') {
        e = prependText + e;
        return e;
      } else {
        return e; // Do not know how to prepend
      }
    }
  }

  export function createTypeIfNotError<E extends Error>(
    e: unknown,
    code: string,
    errorConstructor: new (code: string, message?: string) => E,
    extraMessage?: string,
    extraFormatting?: FtInternalError.ExtraFormatting,
  ): Error | E {
    if (e instanceof Error) {
      let message: string;
      if (extraMessage === undefined) {
        message = `${code}: ${e.message}`;
      } else {
        if (extraFormatting === undefined) {
          extraFormatting = FtInternalError.ExtraFormatting.PostpendColonSpaceQuoted;
        }
        const formattedMessage = FtInternalError.formatExtra(e.message, extraMessage, extraFormatting);
        if (formattedMessage.length === 0) {
          message = code;
        } else {
          message = `${code}: ${formattedMessage}`;
        }
      }
      e.message = message;
      return e;
    } else {
      if (typeof e === 'string' && extraFormatting !== undefined) {
        if (extraMessage === undefined) {
          extraMessage = code;
        }
        const message = FtInternalError.formatExtra(e, extraMessage, extraFormatting);
        return new errorConstructor(code, message);
      } else {
        return new errorConstructor(code, extraMessage);
      }
    }
  }

  export function throwErrorTypeIfPromiseRejected<T>(
    promise: Promise<T>,
    code: string,
    errorConstructor: new (code: string, message?: string) => Error,
    extraMessage?: string,
    extraFormatting?: FtInternalError.ExtraFormatting,
  ): void {
    promise.then(
      () => {
        /**/
      },
      (reason: unknown) => {
        throw FtInternalError.createTypeIfNotError(reason, code, errorConstructor, extraMessage, extraFormatting);
      },
    );
  }
}

/** @public */
export class FtAssertError extends FtInternalError {
  constructor(code: string, message?: string) {
    super(code, message, 'FtAssert');
  }
}

/** @public */
export class FtUnreachableCaseError extends FtInternalError {
  constructor(code: string, value: never) {
    const errorText = `"${String(value)}"`;
    super(code, errorText, 'FtUnreachableCase');
  }
}
