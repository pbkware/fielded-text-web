import { FtFieldFactory } from '../../factory/ft-field-factory.js';
import { FtField } from '../../fields/instances/ft-field.js';
import { FtSequenceInvokationDelay } from '../../types/enums/ft-sequence-invokation-delay.js';
import { FtSequence } from './ft-sequence.js';

/**
 * Delegate for sequence redirect events.
 * @public
 */
export type FtSequenceRedirectDelegate = (field: FtField, sequence: FtSequence | undefined, delay: FtSequenceInvokationDelay) => number; // fieldsAffectedFromIndex

/**
 * Represents an invokation of a sequence during reading or writing.
 * Manages the fields that make up an instance of a sequence pattern.
 * @public
 */
export class FtSequenceInvokation {
  sequenceRedirectEvent: FtSequenceRedirectDelegate | undefined;

  private _index: number;
  private _sequence: FtSequence;
  private _startFieldIndex: number;
  private _fieldList: FtField[];
  private _fieldsSidelinedFromIndex: number;
  private _redirectingField: FtField | undefined;

  constructor(index: number, sequence: FtSequence, startFieldIndex: number) {
    this._sequence = sequence;
    this._startFieldIndex = startFieldIndex;
    this._fieldList = [];
    if (index < 0) {
      // If index < 0, then sequence invokation that will only be used for creating previous copy.
      // This will only be used for comparison of sequence invokations, so the sequence and start field index are sufficient for that.
      // The field list will be empty in this case.
      this._index = -1;
      this._fieldList = [];
      this._fieldsSidelinedFromIndex = 0;
    } else {
      this._index = index;

      const sequenceItemCount = this._sequence.itemList.count;

      for (let i = 0; i < sequenceItemCount; i++) {
        const field = FtFieldFactory.createField(this, this._sequence.itemList.get(i));
        field.index = this._startFieldIndex + i;
        field.sequenceRedirectEvent = (aField, aSequence, delay) => this.handleSequenceRedirectEvent(aField, aSequence, delay);
        this._fieldList.push(field);
      }

      this._fieldsSidelinedFromIndex = sequenceItemCount;
    }
  }

  get index(): number {
    return this._index;
  }

  get sequence(): FtSequence {
    return this._sequence;
  }

  get startFieldIndex(): number {
    return this._startFieldIndex;
  }

  get fieldCount(): number {
    return this._fieldList.length;
  }

  get fieldsSidelinedFromIndex(): number {
    return this._fieldsSidelinedFromIndex;
  }

  get redirectingField(): FtField | undefined {
    return this._redirectingField;
  }

  getField(index: number): FtField {
    return this._fieldList[index];
  }

  /** @internal */
  createPreviousCopy(): FtSequenceInvokation {
    return new FtSequenceInvokation(-1, this._sequence, this._startFieldIndex);
  }

  /** @internal */
  matches(other: FtSequenceInvokation): boolean {
    return this._sequence === other._sequence && this._startFieldIndex === other._startFieldIndex;
  }

  /** @internal */
  resetFields(startFieldIndex: number): void {
    this._startFieldIndex = startFieldIndex;
    for (let i = 0; i < this._fieldList.length; i++) {
      const field = this._fieldList[i];
      field.index = this._startFieldIndex + i;
      if (i >= this._fieldsSidelinedFromIndex) {
        field.sidelined = false;
      }
      field.resetValue();
    }
  }

  /** @internal */
  sidelineFields(): void {
    this.sidelineFieldsFrom(0);
  }

  /** @internal */
  sidelineFieldsOverload(fromFieldIndex: number): void {
    this.sidelineFieldsFrom(fromFieldIndex - this._startFieldIndex);
  }

  /** @internal */
  unsidelineFields(): void {
    for (let i = this._fieldsSidelinedFromIndex; i < this._fieldList.length; i++) {
      const field = this._fieldList[i];
      field.index = this._startFieldIndex + i;
      field.sidelined = false;
      field.resetValue();
    }
    this._fieldsSidelinedFromIndex = this._fieldList.length;
  }

  /** @internal */
  restart(startFieldIndex: number): void {
    this._startFieldIndex = startFieldIndex;
    this.unsidelineFields();
  }

  private handleSequenceRedirectEvent(field: FtField, sequence: FtSequence | undefined, delay: FtSequenceInvokationDelay): number {
    if (field !== this._redirectingField) {
      if (sequence === undefined) {
        return FtField.NO_FIELDS_AFFECTED_INDEX;
      } else {
        if (this.sequenceRedirectEvent !== undefined) {
          return this.sequenceRedirectEvent(field, sequence, delay);
        } else {
          this._redirectingField = field;
          return FtField.NO_FIELDS_AFFECTED_INDEX;
        }
      }
    } else {
      if (this.sequenceRedirectEvent !== undefined) {
        return this.sequenceRedirectEvent(field, sequence, delay);
      } else {
        if (sequence === undefined) {
          this._redirectingField = undefined;
        }
        return FtField.NO_FIELDS_AFFECTED_INDEX;
      }
    }
  }

  private sidelineFieldsFrom(fromIndex: number): void {
    if (fromIndex >= this._fieldList.length) {
      this._fieldsSidelinedFromIndex = this._fieldList.length; // none
    } else {
      for (let i = fromIndex; i < this._fieldList.length; i++) {
        this._fieldList[i].sidelined = true;
      }
      this._fieldsSidelinedFromIndex = fromIndex;
    }
  }
}
