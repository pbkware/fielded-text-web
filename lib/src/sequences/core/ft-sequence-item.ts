import { FtFieldDefinitionList } from '../../fields/definitions/ft-field-definition-list.js';
import { FtFieldDefinition } from '../../fields/definitions/ft-field-definition.js';
import { FtMetaFieldList } from '../../meta/fields/ft-meta-field-list.js';
import { FtMetaSequenceItem } from '../../meta/sequences/core/ft-meta-sequence-item.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtSequenceRedirectList } from '../redirects/ft-sequence-redirect-list.js';
import { FtSequenceList } from './ft-sequence-list.js';

/**
 * Represents an item in a sequence.
 * Each sequence item references a field definition and has optional redirects.
 * @public
 */
export class FtSequenceItem {
  private _index: number;
  private _fieldDefinition: FtFieldDefinition | undefined;
  private _redirectList: FtSequenceRedirectList;

  constructor(index: number) {
    this._index = index;
    this._redirectList = new FtSequenceRedirectList();
  }

  get index(): number {
    return this._index;
  }

  get fieldDefinition(): FtFieldDefinition | undefined {
    return this._fieldDefinition;
  }

  get redirectList(): FtSequenceRedirectList {
    return this._redirectList;
  }

  /** @internal */
  loadMeta(metaSequenceItem: FtMetaSequenceItem, metaFieldList: FtMetaFieldList, fieldDefinitionList: FtFieldDefinitionList): void {
    const fieldIdx = metaFieldList.indexOf(metaSequenceItem.field);
    if (fieldIdx < 0) {
      throw new Error(`MetaSequenceItem field "${metaSequenceItem.field.name}" not found in MetaFieldList`);
    }
    // fieldDefinitions are in same order as Meta Fields
    this._fieldDefinition = fieldDefinitionList.get(fieldIdx);
  }

  /** @internal */
  loadMetaSequenceRedirects(metaSequenceItem: FtMetaSequenceItem, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    for (let i = 0; i < metaSequenceItem.redirectList.count; i++) {
      const metaRedirect = metaSequenceItem.redirectList.get(i);
      const redirect = this._redirectList.new(metaRedirect.type);
      redirect.loadMeta(metaRedirect, metaSequenceList, sequenceList);
    }
  }

  /** @internal */
  setFieldDefinition(definition: FtFieldDefinition): void {
    this._fieldDefinition = definition;
  }
}
