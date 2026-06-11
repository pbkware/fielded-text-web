import { InternalError, UnreachableCaseInternalError } from '@pbkware/js-utils';

/** @public */
export class FtAssertError extends InternalError {
  constructor(code: string, message?: string) {
    super(code, message, 'Ft:Assert');
  }
}

/** @public */
export class FtUnreachableCaseError extends UnreachableCaseInternalError {
  constructor(code: string, value: never) {
    super(code, value, undefined, 'Ft:UnreachableCase');
  }
}
