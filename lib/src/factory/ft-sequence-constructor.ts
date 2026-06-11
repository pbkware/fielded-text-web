import { FtSequence } from '../sequences/core/ft-sequence.js';

/**
 * Constructor for creating sequence instances.
 * @public
 */
export class FtSequenceConstructor {
  createSequence(index: number): FtSequence {
    return new FtSequence(index);
  }
}
