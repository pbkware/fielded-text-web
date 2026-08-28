import { FtMetaSubstitution } from '../meta/substitutions/ft-meta-substitution-list.js';
import { FtSubstitution } from '../substitutions/ft-substitution-list.js';

/**
 * Base constructor class for creating substitution instances.
 * Can be extended to provide custom substitution creation logic.
 * @public
 */
export class FtSubstitutionConstructor {
  /**
   * Create a new FtSubstitution instance for runtime use.
   * @param index - The index of the substitution in the list
   */
  createSubstitution(index: number): FtSubstitution {
    return new FtSubstitution(index);
  }

  /**
   * Create a new FtMetaSubstitution instance for metadata definition.
   */
  createMetaSubstitution(): FtMetaSubstitution {
    return new FtMetaSubstitution();
  }
}
