// Meta sequence - defines a repeating sequence of fields

import type { FtMetaFieldList } from '../../fields/ft-meta-field-list.js';
import type { FtMetaField } from '../../fields/ft-meta-field.js';
import { FtMetaSequenceItemList } from './ft-meta-sequence-item-list.js';
import { FtMetaSequenceItem } from './ft-meta-sequence-item.js';
import type { FtMetaSequenceList } from './ft-meta-sequence-list.js';

/**
 * @public
 */
export const DEFAULT_SEQUENCE_NAME = '';
/**
 * @public
 */
export const DEFAULT_ROOT = false;

/**
 * @public
 */
export type RootedEventHandler = (sequence: FtMetaSequence) => void;

/**
 * @public
 */
export class FtMetaSequence {
  // Event handler for when this sequence becomes root
  rootedEvent: RootedEventHandler | undefined;

  private readonly _itemList: FtMetaSequenceItemList;
  private _name: string;
  private _root: boolean;

  constructor() {
    this._itemList = new FtMetaSequenceItemList();
    this._name = DEFAULT_SEQUENCE_NAME;
    this._root = DEFAULT_ROOT;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get root(): boolean {
    return this._root;
  }

  set root(value: boolean) {
    this._root = value;
    if (this._root && this.rootedEvent) {
      this.rootedEvent(this);
    }
  }

  get itemList(): FtMetaSequenceItemList {
    return this._itemList;
  }

  static sameName(left: string, right: string): boolean {
    return left.toLowerCase() === right.toLowerCase();
  }

  setItemList(items: readonly FtMetaSequenceItem[]): void {
    this._itemList.set(items);
  }

  loadDefaults(): void {
    this._name = DEFAULT_SEQUENCE_NAME;
    this._root = DEFAULT_ROOT;
  }

  removeItemsWithField(field: FtMetaField): void {
    for (let i = this._itemList.count - 1; i >= 0; i--) {
      if (this._itemList.get(i).field === field) {
        this._itemList.removeAt(i);
      }
    }
  }

  removeAllItems(): void {
    this._itemList.clear();
  }

  createCopyExcludingRedirects(fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): FtMetaSequence {
    const sequence = new FtMetaSequence();
    sequence.assignExcludingRedirects(this, fieldList, sourceFieldList);
    return sequence;
  }

  assignExcludingRedirects(source: FtMetaSequence, fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): void {
    this._name = source._name;
    this._root = source._root;
    this._itemList.assignExcludingRedirects(source._itemList, fieldList, sourceFieldList);
  }

  assignRedirects(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    this._itemList.assignRedirects(sequenceList, sourceSequenceList);
  }

  anyItemWithUndefinedField(): { found: boolean; itemIndex: number } {
    for (let i = 0; i < this._itemList.count; i++) {
      const item = this._itemList.get(i);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!item.field) {
        return { found: true, itemIndex: i };
      }
    }
    return { found: false, itemIndex: -1 };
  }

  anyItemWithConstantFieldHasRedirects(): {
    found: boolean;
    itemIndex: number;
  } {
    for (let i = 0; i < this._itemList.count; i++) {
      const item = this._itemList.get(i);
      if (item.hasConstantFieldAndHasRedirects()) {
        return { found: true, itemIndex: i };
      }
    }
    return { found: false, itemIndex: -1 };
  }
}
