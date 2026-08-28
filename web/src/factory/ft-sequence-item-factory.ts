import { FtSequenceItem } from '../sequences/core/ft-sequence-item.js';
import { FtSequenceItemConstructor } from './ft-sequence-item-constructor.js';

/**
 * Factory for creating sequence items.
 * @public
 */
export class FtSequenceItemFactory {
  private static _constructor: FtSequenceItemConstructor = new FtSequenceItemConstructor();

  static getConstructor(): FtSequenceItemConstructor {
    return FtSequenceItemFactory._constructor;
  }

  static setConstructor(value: FtSequenceItemConstructor): void {
    FtSequenceItemFactory._constructor = value;
  }

  static createSequenceItem(index: number): FtSequenceItem {
    return FtSequenceItemFactory._constructor.createSequenceItem(index);
  }
}
