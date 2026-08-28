export class StringBuilder {
  private static readonly _defaultInitialCapacity = 10;

  private _initialCapacity: number;
  private _count = 0;
  private _values: string[];

  constructor(initialCapacity: number = StringBuilder._defaultInitialCapacity) {
    this._initialCapacity = initialCapacity;
    this._values = new Array<string>(this._initialCapacity);
  }

  get capacity() {
    return this._values.length;
  }
  set capacity(newCapacity: number) {
    this._values.length = newCapacity;
    if (this._count > newCapacity) {
      this._count = newCapacity;
    }
  }

  toString() {
    this.capacity = this._count;
    return this._values.join('');
  }

  append(value: string) {
    if (this._count >= this.capacity) {
      this.growCapacity(1);
    }
    this._values[this._count++] = value;
  }

  appendLine(value = '') {
    this.append(value + '\n');
  }

  clear() {
    this._count = 0;
    this._values.length = this._initialCapacity;
  }

  private growCapacity(byAtLeast: number) {
    this._values.length += (this._values.length + byAtLeast) * 2;
  }
}
