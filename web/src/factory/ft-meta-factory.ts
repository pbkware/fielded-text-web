import { FtMeta } from '../meta/ft-meta.js';
import { FtMetaConstructor } from './ft-meta-constructor.js';

/**
 * Factory for creating FtMeta instances.
 * Provides a global constructor that can be replaced to customize meta creation.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtMetaFactory {
  private static _constructor: FtMetaConstructor = new FtMetaConstructor();

  /**
   * Get the current meta constructor.
   */
  static getConstructor(): FtMetaConstructor {
    return FtMetaFactory._constructor;
  }

  /**
   * Set a custom meta constructor.
   * Use this to provide custom initialization logic for all meta instances.
   */
  static setConstructor(value: FtMetaConstructor): void {
    FtMetaFactory._constructor = value;
  }

  /**
   * Create a new FtMeta instance using the current constructor.
   */
  static createMeta(): FtMeta {
    return FtMetaFactory._constructor.createMeta();
  }
}
