import { FtSequenceItemFactory } from '../../factory/ft-sequence-item-factory.js';
import { FtSequenceItem } from './ft-sequence-item.js';

/**
 * List of sequence items.
 * @public
 */
export class FtSequenceItemList {
  private _list: FtSequenceItem[] = [];

  get count(): number {
    return this._list.length;
  }

  /** @internal */
  get capacity(): number {
    return this._list.length;
  }
  set capacity(value: number) {
    if (value > this._list.length) {
      this._list.length = value;
    }
  }

  get(index: number): FtSequenceItem {
    return this._list[index];
  }

  /** @internal */
  clear(): void {
    this._list = [];
  }

  /** @internal */
  new(): FtSequenceItem {
    const item = FtSequenceItemFactory.createSequenceItem(this.count);
    this._list.push(item);
    return item;
  }
}
