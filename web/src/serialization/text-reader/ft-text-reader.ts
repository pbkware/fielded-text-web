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
