import { FtSequenceItem } from '../sequences/core/ft-sequence-item.js';

/**
 * Constructor for creating sequence item instances.
 * @public
 */
export class FtSequenceItemConstructor {
  createSequenceItem(index: number): FtSequenceItem {
    return new FtSequenceItem(index);
  }
}
