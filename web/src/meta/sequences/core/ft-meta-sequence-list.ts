// Meta sequence list - manages all sequences in metadata

import type { FtMetaFieldList } from '../../fields/ft-meta-field-list.js';
import type { FtMetaField } from '../../fields/ft-meta-field.js';
import { FtMetaSequence } from './ft-meta-sequence.js';

/**
 * @public
 */
export class FtMetaSequenceList {
  private readonly _list: FtMetaSequence[] = [];

  get count(): number {
    return this._list.length;
  }

  get(index: number): FtMetaSequence {
    return this._list[index];
  }

  getByName(name: string): FtMetaSequence | undefined {
    const index = this.indexOfName(name);
    if (index < 0) {
      return undefined;
    } else {
      return this._list[index];
    }
  }

  set(value: readonly FtMetaSequence[]): void {
    this.clear();
    const count = value.length;
    for (let i = 0; i < count; i++) {
      this.add(value[i]);
    }
  }

  new(name?: string): FtMetaSequence {
    const sequence = new FtMetaSequence();
    if (name !== undefined) {
      sequence.name = name;
    }
    this.add(sequence);
    return sequence;
  }

  removeAt(index: number): void {
    this.unbindSequenceEvents(this._list[index]);
    this._list.splice(index, 1);
  }

  remove(sequence: FtMetaSequence): void {
    const index = this._list.indexOf(sequence);
    if (index >= 0) {
      this.removeAt(index);
    }
  }

  clear(): void {
    for (const sequence of this._list) {
      this.unbindSequenceEvents(sequence);
    }
    this._list.length = 0;
  }

  removeField(field: FtMetaField): void {
    for (const sequence of this._list) {
      sequence.removeItemsWithField(field);
    }
  }

  removeAllFields(): void {
    for (const sequence of this._list) {
      sequence.removeAllItems();
    }
  }

  indexOf(sequence: FtMetaSequence): number {
    return this._list.indexOf(sequence);
  }

  indexOfName(name: string): number {
    for (let i = 0; i < this._list.length; i++) {
      if (FtMetaSequence.sameName(this._list[i].name, name)) {
        return i;
      }
    }
    return -1;
  }

  indexOfRoot(): number {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].root) {
        return i;
      }
    }
    return -1;
  }

  assign(source: FtMetaSequenceList, fieldList: FtMetaFieldList, sourceFieldList: FtMetaFieldList): void {
    this._list.length = 0;

    // Create copies of sequences (excluding redirects)
    for (let i = 0; i < source.count; i++) {
      const sequence = source.get(i).createCopyExcludingRedirects(fieldList, sourceFieldList);
      this.add(sequence);
    }

    // All sequences need to be created before we can assign redirects
    for (let i = 0; i < this.count; i++) {
      this._list[i].assignRedirects(this, source);
    }
  }

  isMoreThanOneRoot(): {
    found: boolean;
    firstRootSequenceName: string;
    secondRootSequenceName: string;
  } {
    let firstRootSequenceName = '';
    let secondRootSequenceName = '';
    let firstSequenceRootFound = false;

    for (let i = 0; i < this.count; i++) {
      if (this._list[i].root) {
        if (!firstSequenceRootFound) {
          firstRootSequenceName = this._list[i].name;
          firstSequenceRootFound = true;
        } else {
          secondRootSequenceName = this._list[i].name;
          return {
            found: true,
            firstRootSequenceName,
            secondRootSequenceName,
          };
        }
      }
    }

    return {
      found: false,
      firstRootSequenceName,
      secondRootSequenceName,
    };
  }

  hasDuplicateName(): { found: boolean; duplicateName: string } {
    for (let i = 0; i < this.count; i++) {
      if (this.indexOfName(this._list[i].name) !== i) {
        return {
          found: true,
          duplicateName: this._list[i].name,
        };
      }
    }

    return {
      found: false,
      duplicateName: '',
    };
  }

  anyItemWithUndefinedField(sequenceIndex: number): {
    found: boolean;
    itemIndex: number;
  } {
    if (sequenceIndex >= 0 && sequenceIndex < this.count) {
      return this._list[sequenceIndex].anyItemWithUndefinedField();
    }
    return { found: false, itemIndex: -1 };
  }

  anyItemWithConstantFieldHasRedirects(sequenceIndex: number): {
    found: boolean;
    itemIndex: number;
  } {
    if (sequenceIndex >= 0 && sequenceIndex < this.count) {
      return this._list[sequenceIndex].anyItemWithConstantFieldHasRedirects();
    }
    return { found: false, itemIndex: -1 };
  }

  private add(sequence: FtMetaSequence): void {
    this._list.push(sequence);
    this.bindSequenceEvents(sequence);
  }

  private bindSequenceEvents(sequence: FtMetaSequence): void {
    sequence.rootedEvent = (rootedSequence) => this.handleSequenceRootedEvent(rootedSequence);
  }

  private unbindSequenceEvents(sequence: FtMetaSequence): void {
    sequence.rootedEvent = undefined;
  }

  private handleSequenceRootedEvent(rootedSequence: FtMetaSequence): void {
    // When one sequence becomes root, all others must be unrooted
    for (const sequence of this._list) {
      if (sequence !== rootedSequence && sequence.root) {
        sequence.root = false;
      }
    }
  }
}
