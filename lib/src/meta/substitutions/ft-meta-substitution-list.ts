import { FtSubstitutionFactory } from '../../factory/ft-substitution-factory.js';
import { FtSubstitutionType } from '../../types/enums/ft-substitution-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';

/**
 * @public
 */
export class FtMetaSubstitution {
  constructor(
    public id = 0,
    public token: string = FtMetaDefaults.Substitution.Token,
    public type: FtSubstitutionType = FtMetaDefaults.Substitution.Type,
    public value = '',
  ) {}
}

/**
 * @public
 */
export class FtMetaSubstitutionList {
  private substitutions: FtMetaSubstitution[] = [];

  get count(): number {
    return this.substitutions.length;
  }

  get(index: number): FtMetaSubstitution {
    return this.substitutions[index];
  }

  new(type: FtSubstitutionType = FtSubstitutionType.String, token = '\\', value = ''): FtMetaSubstitution {
    const sub = FtSubstitutionFactory.createMetaSubstitution();
    sub.id = this.substitutions.length;
    sub.type = type;
    sub.token = token;
    sub.value = value;
    this.substitutions.push(sub);
    return sub;
  }

  clear(): void {
    this.substitutions = [];
  }

  assign(source: FtMetaSubstitutionList): void {
    this.clear();

    for (let i = 0; i < source.count; i++) {
      const sourceSub = source.get(i);
      const targetSub = this.new(sourceSub.type, sourceSub.token, sourceSub.value);
      targetSub.id = sourceSub.id;
    }
  }
}
