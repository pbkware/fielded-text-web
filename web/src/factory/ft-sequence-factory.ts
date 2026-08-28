import { FtSequence } from '../sequences/core/ft-sequence.js';
import { FtSequenceConstructor } from './ft-sequence-constructor.js';

/**
 * Factory for creating sequences.
 * @public
 */
export class FtSequenceFactory {
  private static _constructor: FtSequenceConstructor = new FtSequenceConstructor();

  static getConstructor(): FtSequenceConstructor {
    return FtSequenceFactory._constructor;
  }

  static setConstructor(value: FtSequenceConstructor): void {
    FtSequenceFactory._constructor = value;
  }

  static createSequence(index: number): FtSequence {
    return FtSequenceFactory._constructor.createSequence(index);
  }
}
