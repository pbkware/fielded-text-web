import { FtSequenceFactory } from '../../factory/ft-sequence-factory.js';
import { FtFieldDefinitionList } from '../../fields/definitions/ft-field-definition-list.js';
import { FtSequence } from './ft-sequence.js';

/**
 * List of sequences.
 * @public
 */
export class FtSequenceList {
  private _list: FtSequence[] = [];

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

  get(index: number): FtSequence {
    return this._list[index];
  }

  getByName(name: string): FtSequence {
    const idx = this.indexOfName(name);
    if (idx >= 0) {
      return this._list[idx];
    }
    throw new Error(`FtSequence not found: ${name}`);
  }

  /** @internal */
  clear(): void {
    this._list = [];
  }

  /** @internal */
  new(fieldDefinitionList?: FtFieldDefinitionList): FtSequence {
    const sequence = FtSequenceFactory.createSequence(this.count);
    if (fieldDefinitionList) {
      sequence.loadRootFieldDefinitionList(fieldDefinitionList);
    }
    this._list.push(sequence);
    return sequence;
  }

  indexOfName(name: string): number {
    // Case-insensitive comparison matching C# FtMetaSequence.SameName
    const lowerName = name.toLowerCase();
    for (let i = 0; i < this.count; i++) {
      if (this._list[i].name.toLowerCase() === lowerName) {
        return i;
      }
    }
    return -1;
  }

  indexOfRoot(): number {
    for (let i = 0; i < this.count; i++) {
      if (this._list[i].root) {
        return i;
      }
    }
    return -1;
  }
}
