import { FtMetaSubstitution } from '../meta/substitutions/ft-meta-substitution-list.js';
import { FtSubstitution } from '../substitutions/ft-substitution-list.js';
import { FtSubstitutionConstructor } from './ft-substitution-constructor.js';

/**
 * Factory for creating substitution instances.
 * Provides a global constructor that can be replaced to customize substitution creation.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtSubstitutionFactory {
  private static _constructor: FtSubstitutionConstructor = new FtSubstitutionConstructor();

  /**
   * Get the current substitution constructor.
   */
  static getConstructor(): FtSubstitutionConstructor {
    return FtSubstitutionFactory._constructor;
  }

  /**
   * Set a custom substitution constructor.
   * Use this to provide custom initialization logic for all substitution instances.
   */
  static setConstructor(value: FtSubstitutionConstructor): void {
    FtSubstitutionFactory._constructor = value;
  }

  /**
   * Create a new FtSubstitution instance using the current constructor.
   * @param index - The index of the substitution in the list
   */
  static createSubstitution(index: number): FtSubstitution {
    return FtSubstitutionFactory._constructor.createSubstitution(index);
  }

  /**
   * Create a new FtMetaSubstitution instance using the current constructor.
   */
  static createMetaSubstitution(): FtMetaSubstitution {
    return FtSubstitutionFactory._constructor.createMetaSubstitution();
  }
}
