// Meta sequence item - links a field to a sequence position

import type { FtMetaFieldList } from '../../fields/ft-meta-field-list.js';
import type { FtMetaField } from '../../fields/ft-meta-field.js';
import { FtMetaSequenceRedirectList } from '../redirects/ft-meta-sequence-redirect-list.js';
import { FtMetaSequenceRedirect } from '../redirects/ft-meta-sequence-redirect.js';
import type { FtMetaSequenceList } from './ft-meta-sequence-list.js';

/**
 * @public
 */
export class FtMetaSequenceItem {
  private readonly _redirectList: FtMetaSequenceRedirectList;
  private _field: FtMetaField;

  constructor(field: FtMetaField) {
    this._redirectList = new FtMetaSequenceRedirectList();
    this._field = field;
  }

  get field(): FtMetaField {
    return this._field;
  }

  set field(value: FtMetaField) {
    this._field = value;
  }

  get redirectList(): FtMetaSequenceRedirectList {
    return this._redirectList;
  }

  setRedirectList(redirects: readonly FtMetaSequenceRedirect[]): void {
    this._redirectList.set(redirects);
  }

  loadDefaults(): void {
    // Nothing to do
  }

  createCopyExcludingRedirects(fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): FtMetaSequenceItem {
    const field = this.findSourceField(this, fieldList, sourceFieldList);
    const item = new FtMetaSequenceItem(field);
    // item.assignExcludingRedirects(this, fieldList, sourceFieldList);
    return item;
  }

  assignRedirects(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    this._redirectList.assign(this._redirectList, sequenceList, sourceSequenceList);
  }

  hasConstantFieldAndHasRedirects(): boolean {
    return !!this._field && this._field.constant && this._redirectList.count > 0;
  }

  private assignExcludingRedirects(source: FtMetaSequenceItem, fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): void {
    const fieldIndex = sourceFieldList.indexOf(source._field);
    if (fieldIndex < 0) {
      throw new Error('Source field not found in source field list'); // should never happen
    }
    if (fieldIndex >= fieldList.count) {
      throw new Error(`Field index ${fieldIndex} out of range`); // should never happen
    }
    this._field = fieldList.get(fieldIndex);
  }

  // Replaces assignExcludingRedirects so that we can get field before creating Sequence Item
  private findSourceField(source: FtMetaSequenceItem, fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): FtMetaField {
    const fieldIndex = sourceFieldList.indexOf(source._field);
    if (fieldIndex < 0) {
      throw new Error('Source field not found in source field list'); // should never happen
    }
    if (fieldIndex >= fieldList.count) {
      throw new Error(`Field index ${fieldIndex} out of range`); // should never happen
    }
    return fieldList.get(fieldIndex);
  }
}
