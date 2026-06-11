/**
 * Interface for reading characters from a text source.
 * Mirrors .NET's TextReader for compatibility with C# implementation.
 * @public
 */
export interface FtTextReader {
  /**
   * Reads the next character from the text reader and advances the character position by one character.
   * @returns The character read as a number (charCode), or -1 if the end of the text has been reached.
   */
  read(): number;
}

/**
 * Namespace merged with TextReader interface to provide static constants.
 * @public
 */
export namespace FtTextReader {
  /**
   * Value returned by read() when the end of the text reader has been reached.
   * Matches .NET's TextReader behavior.
   */
  export const EofReadResult = -1;
}

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
