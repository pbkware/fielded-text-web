import { FtFieldDefinitionList } from '../../fields/definitions/ft-field-definition-list.js';
import { FtMetaFieldList } from '../../meta/fields/ft-meta-field-list.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtMetaSequence } from '../../meta/sequences/core/ft-meta-sequence.js';
import { FtSequenceItemList } from './ft-sequence-item-list.js';
import { FtSequenceList } from './ft-sequence-list.js';

/**
 * Represents a sequence of fielded text items.
 * A sequence defines a pattern of fields that can be repeated.
 * @public
 */
export class FtSequence {
  private static readonly AUTO_ROOT_NAME = 'AutoRoot';

  private _index: number;
  private _name = '';
  private _root = false;
  private _itemList: FtSequenceItemList;

  constructor(index: number) {
    this._index = index;
    this._itemList = new FtSequenceItemList();
  }

  get index(): number {
    return this._index;
  }

  get name(): string {
    return this._name;
  }

  get root(): boolean {
    return this._root;
  }

  get itemList(): FtSequenceItemList {
    return this._itemList;
  }

  /** @internal */
  setRoot(value: boolean): void {
    this._root = value;
  }

  /** @internal */
  loadMeta(metaSequence: FtMetaSequence, metaFieldList: FtMetaFieldList, fieldDefinitionList: FtFieldDefinitionList): void {
    this._name = metaSequence.name;
    this._root = metaSequence.root;

    for (let i = 0; i < metaSequence.itemList.count; i++) {
      const item = this._itemList.new();
      item.loadMeta(metaSequence.itemList.get(i), metaFieldList, fieldDefinitionList);
    }
  }

  /** @internal */
  loadMetaSequenceRedirects(metaSequence: FtMetaSequence, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    for (let i = 0; i < this._itemList.count; i++) {
      // Note that Sequence Items are in same order as MetaSequence Items
      this._itemList.get(i).loadMetaSequenceRedirects(metaSequence.itemList.get(i), metaSequenceList, sequenceList);
    }
  }

  /** @internal */
  loadRootFieldDefinitionList(fieldDefinitionList: FtFieldDefinitionList): void {
    this._name = FtSequence.AUTO_ROOT_NAME;
    this._root = true;
    for (let i = 0; i < fieldDefinitionList.count; i++) {
      const item = this._itemList.new();
      item.setFieldDefinition(fieldDefinitionList.get(i));
    }
  }
}
