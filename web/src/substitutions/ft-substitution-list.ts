import { FtSubstitutionFactory } from '../factory/ft-substitution-factory.js';

/**
 * @public
 */
export class FtSubstitution {
  constructor(
    public id: number,
    public token = '',
    public value = '',
  ) {}
}

/**
 * @public
 */
export class FtSubstitutionList {
  private list: FtSubstitution[] = [];

  get count(): number {
    return this.list.length;
  }

  get(index: number): FtSubstitution {
    return this.list[index];
  }

  clear(): void {
    this.list = [];
  }

  new(): FtSubstitution {
    const substitution = FtSubstitutionFactory.createSubstitution(this.list.length);
    this.list.push(substitution);
    return substitution;
  }

  tryGetValue(token: string): { found: boolean; value: string } {
    for (const sub of this.list) {
      if (sub.token === token) {
        return { found: true, value: sub.value };
      }
    }
    return { found: false, value: '' };
  }

  tryGetFirstMatching(text: string, startIndex: number): { found: boolean; token: string; valueLength: number } {
    for (const sub of this.list) {
      if (sub.token.length === 0 || sub.value.length === 0) {
        continue;
      }

      if (text.startsWith(sub.value, startIndex)) {
        return { found: true, token: sub.token, valueLength: sub.value.length };
      }
    }

    return { found: false, token: '', valueLength: 0 };
  }
}
