// Meta sequence item list - manages items in a sequence

import type { FtMetaFieldList } from '../../fields/ft-meta-field-list.js';
import { FtMetaField } from '../../fields/ft-meta-field.js';
import { FtMetaSequenceItem } from './ft-meta-sequence-item.js';
import type { FtMetaSequenceList } from './ft-meta-sequence-list.js';

/**
 * @public
 */
export class FtMetaSequenceItemList {
  private readonly _list: FtMetaSequenceItem[] = [];

  get count(): number {
    return this._list.length;
  }

  get(index: number): FtMetaSequenceItem {
    return this._list[index];
  }

  set(items: readonly FtMetaSequenceItem[]): void {
    const count = items.length;
    this._list.length = count;
    for (let i = 0; i < count; i++) {
      this._list[i] = items[i];
    }
  }

  new(field: FtMetaField): FtMetaSequenceItem {
    const item = new FtMetaSequenceItem(field);
    this.add(item);
    return item;
  }

  remove(item: FtMetaSequenceItem): void {
    const index = this._list.indexOf(item);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
  }

  removeAt(index: number): void {
    this._list.splice(index, 1);
  }

  clear(): void {
    this._list.length = 0;
  }

  moveItemToBefore(fromIndex: number, beforeIndex: number): void {
    if (beforeIndex !== fromIndex && beforeIndex !== fromIndex + 1) {
      const item = this._list[fromIndex];
      this._list.splice(fromIndex, 1);
      let insertIndex: number;
      if (beforeIndex < fromIndex) {
        insertIndex = beforeIndex;
      } else {
        insertIndex = beforeIndex - 1;
      }
      this._list.splice(insertIndex, 0, item);
    }
  }

  moveItemToAfter(fromIndex: number, afterIndex: number): void {
    if (afterIndex !== fromIndex && afterIndex !== fromIndex - 1) {
      const item = this._list[fromIndex];
      this._list.splice(fromIndex, 1);
      let insertIndex: number;
      if (afterIndex > fromIndex) {
        insertIndex = afterIndex;
      } else {
        insertIndex = afterIndex + 1;
      }
      this._list.splice(insertIndex, 0, item);
    }
  }

  assignExcludingRedirects(source: FtMetaSequenceItemList, fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): void {
    this._list.length = 0;

    for (let i = 0; i < source.count; i++) {
      const item = source.get(i).createCopyExcludingRedirects(fieldList, sourceFieldList);
      this.add(item);
    }
  }

  assignRedirects(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    for (let i = 0; i < this.count; i++) {
      this._list[i].assignRedirects(sequenceList, sourceSequenceList);
    }
  }

  private add(item: FtMetaSequenceItem): void {
    this._list.push(item);
  }
}
