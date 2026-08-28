import { FtMeta } from '../meta/ft-meta.js';

/**
 * Base constructor class for creating FtMeta instances.
 * Can be extended to provide custom meta creation logic.
 * @public
 */
export class FtMetaConstructor {
  /**
   * Create a new FtMeta instance.
   * Override this method in derived classes to provide custom initialization.
   */
  createMeta(): FtMeta {
    return new FtMeta();
  }
}
