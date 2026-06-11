import { FtMeta } from '../meta/ft-meta.js';
import { FtSerializationReader } from '../serialization/ft-serialization-reader.js';
import { FtStringReader, FtTextReader } from '../serialization/ft-text-reader.js';

/**
 * High-level reader for fielded text files.
 * Provides a convenient API for reading CSV and other delimited/fixed-width text.
 * This is a thin wrapper around SerializationReader with simpler constructors.
 * @public
 */
export class FtReader extends FtSerializationReader {
  /**
   * Create a reader with or without metadata.
   * If metadata is provided, it will be loaded immediately. If not, you must call loadMeta() before reading.
   * You must call open() before reading.
   * @param meta - The metadata defining the file structure
   */
  constructor(meta?: FtMeta);

  /**
   * Create a reader with metadata and input text.
   * You must call open() before reading.
   * @param meta - The metadata defining the file structure
   * @param input - The text content to read
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  constructor(meta: FtMeta, input: string, immediatelyReadHeader?: boolean);

  /**
   * Create a reader with metadata and a TextReader.
   * @param meta - The metadata defining the file structure
   * @param textReader - The TextReader to read from
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  constructor(meta: FtMeta, textReader: FtTextReader, immediatelyReadHeader?: boolean);

  /**
   * Create a reader with input text but no metadata.
   * You must call loadMeta() before reading.
   * @param input - The text content to read
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  constructor(input: string, immediatelyReadHeader?: boolean);

  /**
   * Create a reader with a TextReader but no metadata.
   * You must call loadMeta() before reading.
   * @param textReader - The TextReader to read from
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  constructor(textReader: FtTextReader, immediatelyReadHeader?: boolean);

  constructor(
    metaOrInputOrTextReader?: FtMeta | string | FtTextReader,
    inputOrTextReaderOrImmediatelyReadHeader?: string | FtTextReader | boolean,
    immediatelyReadHeader = true,
  ) {
    super();

    if (metaOrInputOrTextReader instanceof FtMeta) {
      // Constructor with meta
      this.loadMeta(metaOrInputOrTextReader);

      if (typeof inputOrTextReaderOrImmediatelyReadHeader === 'string') {
        // FtReader(meta, input, immediatelyReadHeader)
        this.open(inputOrTextReaderOrImmediatelyReadHeader, immediatelyReadHeader);
      } else if (
        inputOrTextReaderOrImmediatelyReadHeader &&
        typeof inputOrTextReaderOrImmediatelyReadHeader === 'object' &&
        'read' in inputOrTextReaderOrImmediatelyReadHeader
      ) {
        // FtReader(meta, textReader, immediatelyReadHeader)
        this.open(inputOrTextReaderOrImmediatelyReadHeader, immediatelyReadHeader);
      } else {
        // FtReader(meta) - just reset, no open
        this.reset();
      }
    } else if (typeof metaOrInputOrTextReader === 'string') {
      // FtReader(input, immediatelyReadHeader)
      const shouldReadHeader = typeof inputOrTextReaderOrImmediatelyReadHeader === 'boolean' ? inputOrTextReaderOrImmediatelyReadHeader : true;
      this.open(metaOrInputOrTextReader, shouldReadHeader);
    } else if (metaOrInputOrTextReader && typeof metaOrInputOrTextReader === 'object' && 'read' in metaOrInputOrTextReader) {
      // FtReader(textReader, immediatelyReadHeader)
      const shouldReadHeader = typeof inputOrTextReaderOrImmediatelyReadHeader === 'boolean' ? inputOrTextReaderOrImmediatelyReadHeader : true;
      this.open(metaOrInputOrTextReader, shouldReadHeader);
    }
  }

  /**
   * Open the reader with a text string.
   * @param textReaderOrText - Text reader or string providing the data to read
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  override open(textReaderOrText: FtTextReader | string, immediatelyReadHeader = true): void {
    let textReader: FtTextReader;
    if (typeof textReaderOrText === 'string') {
      // String input - create StringReader
      textReader = new FtStringReader(textReaderOrText);
    } else {
      textReader = textReaderOrText;
    }
    super.open(textReader, immediatelyReadHeader);
  }
}
