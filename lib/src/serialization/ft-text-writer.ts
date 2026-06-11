/**
 * Writer interface for outputting text.
 * @public
 */
export interface FtTextWriter {
  write(text: string): void;
  flush(): void;
}

/**
 * Simple text writer that accumulates to a string array.
 * @public
 */
export class FtStringWriter implements FtTextWriter {
  private _parts: string[] = [];

  write(text: string): void {
    this._parts.push(text);
  }

  flush(): void {
    // No-op for string writer
  }

  toString(): string {
    return this._parts.join('');
  }

  clear(): void {
    this._parts = [];
  }

  close(): void {
    this.clear();
  }
}

/**
 * Callback-based text writer for simple output accumulation.
 * @public
 */
export class FtCallbackTextWriter implements FtTextWriter {
  constructor(
    private readonly callback: (text: string) => void,
    private readonly closeCallback?: () => void,
  ) {}

  write(text: string): void {
    this.callback(text);
  }

  flush(): void {
    // No-op
  }

  close(): void {
    if (this.closeCallback) {
      this.closeCallback();
    }
  }
}
