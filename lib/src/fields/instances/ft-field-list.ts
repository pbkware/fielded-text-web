import { FtField } from './ft-field.js';

/**
 * @public
 */
export class FtFieldList {
  private list: FtField[] = [];

  get count(): number {
    return this.list.length;
  }

  get(index: number): FtField {
    return this.list[index];
  }

  getByName(name: string): FtField | undefined {
    const idx = this.indexOfName(name);
    if (idx >= 0) {
      return this.list[idx];
    }
    return undefined;
  }

  indexOf(field: FtField): number {
    return this.list.indexOf(field);
  }

  indexOfName(name: string): number {
    // Try case-sensitive first
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].name === name) {
        return i;
      }
    }

    // Try case-insensitive
    const lowerName = name.toLowerCase();
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].name.toLowerCase() === lowerName) {
        return i;
      }
    }

    return -1;
  }

  indexOfId(id: number): number {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  clear(): void {
    this.list = [];
  }

  trim(fromIndex: number): void {
    this.list = this.list.slice(0, fromIndex);
  }

  add(field: FtField): void {
    this.list.push(field);
  }
}
