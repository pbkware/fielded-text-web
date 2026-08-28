import { FtField } from '../../fields/instances/ft-field.js';
import { FtSequenceInvokationDelay } from '../../types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceInvokation, FtSequenceRedirectDelegate } from './ft-sequence-invokation.js';
import { FtSequence } from './ft-sequence.js';

/**
 * @public
 */
export class FtSequenceInvokationList {
  sequenceRedirectEvent?: FtSequenceRedirectDelegate;

  private list: FtSequenceInvokation[] = [];
  private _count = 0;

  get count(): number {
    return this._count;
  }

  get predictCount(): number {
    return this.list.length;
  }

  get(index: number): FtSequenceInvokation {
    return this.list[index];
  }

  new(sequence: FtSequence, fieldIndex: number): FtSequenceInvokation {
    const invokation = new FtSequenceInvokation(this._count, sequence, fieldIndex);
    invokation.sequenceRedirectEvent = (field: FtField, seq: FtSequence | undefined, delay: FtSequenceInvokationDelay) => {
      if (this.sequenceRedirectEvent) {
        return this.sequenceRedirectEvent(field, seq, delay);
      } else {
        return FtField.NO_FIELDS_AFFECTED_INDEX;
      }
    };
    this.list.push(invokation);
    this._count = this.list.length;
    return invokation;
  }

  clear(): void {
    for (let i = 0; i < this._count; i++) {
      this.list[i].sequenceRedirectEvent = undefined;
    }
    this.list = [];
    this._count = 0;
  }

  trim(fromIndex: number): void {
    if (fromIndex < this.list.length) {
      for (let i = fromIndex; i < this._count; i++) {
        this.list[i].sequenceRedirectEvent = undefined;
      }
      this.list = this.list.slice(0, fromIndex);
      this._count = this.list.length;
    }
  }

  tryPredictedNew(index: number, sequence: FtSequence, fieldIndex: number): FtSequenceInvokation | undefined {
    if (index >= this.predictCount || index !== this._count) {
      return undefined;
    }

    const predictedInvokation = this.list[index];

    if (predictedInvokation.sequence !== sequence) {
      return undefined;
    }

    if (predictedInvokation.startFieldIndex !== fieldIndex) {
      return undefined;
    }

    predictedInvokation.restart(fieldIndex);
    this._count++;
    return predictedInvokation;
  }

  predictTrim(fromIndex: number): void {
    for (let i = fromIndex; i < this._count; i++) {
      this.list[i].sidelineFields();
    }
    this._count = fromIndex;
  }

  matches(other: FtSequenceInvokationList): boolean {
    if (this._count !== other._count) {
      return false;
    }

    for (let i = 0; i < this._count; i++) {
      if (!this.list[i].matches(other.list[i])) {
        return false;
      }
    }

    return true;
  }

  assign(other: FtSequenceInvokationList): void {
    this.clear();
    for (let i = 0; i < other._count; i++) {
      const otherInvokation = other.list[i];
      const copyOfOtherInvokation = otherInvokation.createPreviousCopy();
      this.list.push(copyOfOtherInvokation);
    }
    this._count = this.list.length;
  }
}
