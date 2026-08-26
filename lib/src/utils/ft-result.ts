/** @public */
export type FtResult<T, E = string> = FtOk<T, E> | FtErr<T, E>;

/** @public */
export class FtOk<T, E> {
  constructor(public readonly value: T) {}

  public isOk(): this is FtOk<T, E> {
    return true;
  }

  public isErr(): this is FtErr<T, E> {
    return false;
  }
}

/** @public */
export namespace FtOk {
  export function createResolvedPromise<T, E>(value: T) {
    const ok = new FtOk<T, E>(value);
    return Promise.resolve(ok);
  }
}

/** @public */
export class FtErr<T = undefined, E = string> {
  constructor(public readonly error: E) {}

  public isOk(): this is FtOk<T, E> {
    return false;
  }

  public isErr(): this is FtErr<T, E> {
    return true;
  }

  createOuter<OuterT = undefined>(outerError: string) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new FtErr<OuterT>(outerError + ': ' + `${this.error}`);
  }

  createType<NewT>() {
    return new FtErr<NewT, E>(this.error);
  }

  createOuterResolvedPromise<OuterT = undefined>(outerError: string) {
    const err = this.createOuter<OuterT>(outerError);
    return Promise.resolve(err);
  }
}

/** @public */
export namespace FtErr {
  export function createResolvedPromise<T = undefined, E = string>(error: E) {
    const err = new FtErr<T, E>(error);
    return Promise.resolve(err);
  }
}
