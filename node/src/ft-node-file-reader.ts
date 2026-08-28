import { FtMeta, FtReader, FtTextReader } from '@pbkware/fielded-text-web';
import * as fs from 'fs';
import { StringDecoder } from 'string_decoder';

/**
 * Internal TextReader implementation for file I/O.
 * Handles synchronous file reading with configurable encoding.
 */
class NodeFileTextReader implements FtTextReader {
  private _filePath: string;
  private _encoding: BufferEncoding;
  private _fd: number | null = null;
  private _filePosition = 0;
  private _buffer = '';
  private _bufferPosition = 0;
  private _eof = false;
  private _disposed = false;
  private _opened = false;
  private readonly _chunkSize = 16 * 1024; // 16KB chunks
  private _decoder: StringDecoder | null = null;

  constructor(filePath: string, encoding: BufferEncoding) {
    this._filePath = filePath;
    this._encoding = encoding;
  }

  /**
   * Reads the next character from the file and advances the character position by one.
   * @returns The character read as a number (charCode), or -1 if the end of the file has been reached.
   */
  read(): number {
    if (this._disposed) {
      throw new Error('Cannot read from a disposed NodeFileReader');
    }

    this.ensureOpen();

    // If we've consumed all buffered data, try to read more
    if (this._bufferPosition >= this._buffer.length) {
      this.fillBuffer();

      // If still no data after reading, we're at EOF
      if (this._bufferPosition >= this._buffer.length) {
        return FtTextReader.EofReadResult;
      }
    }

    const charCode = this._buffer.charCodeAt(this._bufferPosition);
    this._bufferPosition++;
    return charCode;
  }

  /**
   * Disposes the FileTextReader and releases resources.
   */
  [Symbol.dispose](): void {
    if (this._disposed) {
      return;
    }

    this._disposed = true;

    if (this._fd !== null) {
      try {
        fs.closeSync(this._fd);
      } catch {
        // Ignore errors when closing
      }
      this._fd = null;
    }

    this._buffer = '';
    this._bufferPosition = 0;
    this._filePosition = 0;
    this._decoder = null;
  }

  /**
   * Opens the file if not already open.
   * Uses fs.openSync() for synchronous file access.
   */
  private ensureOpen(): void {
    if (this._opened) {
      return;
    }

    try {
      this._decoder = new StringDecoder(this._encoding);
      this._fd = fs.openSync(this._filePath, 'r');
      this._opened = true;
    } catch (err) {
      throw new Error(`Error opening file ${this._filePath}: ${(err as Error).message}`, { cause: err });
    }
  }

  /**
   * Fills the internal buffer with data from the file.
   * Uses fs.readSync() for synchronous reading.
   * Uses StringDecoder to handle multi-byte character boundaries correctly.
   */
  private fillBuffer(): void {
    if (this._fd === null || this._eof || !this._decoder) {
      return;
    }

    try {
      // Read a chunk from the file
      const buffer = Buffer.allocUnsafe(this._chunkSize);
      const bytesRead = fs.readSync(this._fd, buffer, 0, this._chunkSize, this._filePosition);

      if (bytesRead === 0) {
        // No more data to read - flush any remaining bytes from decoder
        this._eof = true;
        const remaining = this._decoder.end();
        if (remaining) {
          this._buffer += remaining;
        }
        return;
      }

      // Use StringDecoder to properly handle multi-byte character boundaries
      // It will buffer incomplete characters and emit them on the next call
      const chunk = this._decoder.write(buffer.subarray(0, bytesRead));
      this._buffer += chunk;
      this._filePosition += bytesRead;
    } catch (err) {
      throw new Error(`Error reading from file ${this._filePath}: ${(err as Error).message}`, { cause: err });
    }
  }
}

/**
 * High-level reader for fielded text files that reads directly from the file system.
 * Node.js-specific extension of FtReader that accepts a file path.
 * Provides a convenient single-class API for Node.js applications.
 * @public
 */
export class FtNodeFileReader extends FtReader {
  private _metaEncoding: BufferEncoding;
  /**
   * Creates a new FtNodeFileReader that reads from a file.
   * @param filePath - The path to the file to read
   * @param metaOrEncoding - The metadata defining the file structure or the character encoding of the file containing the meta (if meta is not provided)
   * @param encoding - The character encoding to use (default: 'utf-8')
   * @param immediatelyReadHeader - Whether to automatically read header lines (default: true)
   */
  constructor(filePath: string, metaOrEncoding: FtMeta | BufferEncoding = 'utf-8', encoding: BufferEncoding = 'utf-8', immediatelyReadHeader = true) {
    let meta: FtMeta | undefined;
    let metaEncoding: BufferEncoding;
    if (typeof metaOrEncoding === 'string') {
      metaEncoding = metaOrEncoding;
      meta = undefined;
    } else {
      meta = metaOrEncoding;
      metaEncoding = 'utf-8';
    }

    super(meta);
    this._metaEncoding = metaEncoding;

    // Create internal file reader
    const fileReader: FtTextReader = new NodeFileTextReader(filePath, encoding);

    this.open(fileReader, immediatelyReadHeader);
  }

  protected override getFileMetaAsText(fileMetaReference: string): string {
    const content = fs.readFileSync(fileMetaReference, this._metaEncoding);
    return content;
  }
}
