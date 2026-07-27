import type { FtTextReader } from './ft-text-reader.js';

/**
 * A TextReader implementation that reads from a string.
 * @public
 */
export class FtStringReader implements FtTextReader {
  private _text: string;
  private _position: number;

  /**
   * Creates a new FtStringReader.
   * @param text - The string to read from.
   */
  constructor(text: string) {
    this._text = text;
    this._position = 0;
  }

  /**
   * Reads the next character from the string and advances the character position by one.
   * @returns The character read as a number (charCode), or -1 if the end of the string has been reached.
   */
  read(): number {
    if (this._position >= this._text.length) {
      return -1;
    }

    const charCode = this._text.charCodeAt(this._position);
    this._position++;
    return charCode;
  }

  /**
   * Closes the FtStringReader and releases resources.
   */
  close(): void {
    this._text = '';
    this._position = 0;
  }
}
