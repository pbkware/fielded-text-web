import { FtSequenceRedirectFactory } from '../../factory/ft-sequence-redirect-factory.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * List of sequence redirects for a sequence item.
 * @public
 */
export class FtSequenceRedirectList {
  private _items: FtSequenceRedirect[] = [];

  get count(): number {
    return this._items.length;
  }

  /** @internal */
  get capacity(): number {
    return this._items.length;
  }
  set capacity(value: number) {
    // TypeScript arrays grow dynamically, but we can pre-allocate
    if (value > this._items.length) {
      this._items.length = value;
    }
  }

  get(index: number): FtSequenceRedirect {
    return this._items[index];
  }

  /** @internal */
  clear(): void {
    this._items = [];
  }

  /** @internal */
  new(type: FtSequenceRedirectType): FtSequenceRedirect {
    const redirect = FtSequenceRedirectFactory.createSequenceRedirect(this.count, type);
    this._items.push(redirect);
    return redirect;
  }
}
