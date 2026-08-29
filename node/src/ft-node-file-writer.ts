import { FtMeta, FtTextWriter, FtWriter, FtWriterSettings } from '@pbkware/fielded-text-web';
import * as fs from 'fs';

/**
 * Internal TextWriter implementation for file I/O.
 * Handles synchronous file writing with configurable encoding.
 */
class NodeFileTextWriter implements FtTextWriter {
  private _fd: number | null = null;
  private _disposed = false;
  private _opened = false;

  constructor(
    private readonly _filePath: fs.PathLike,
    private readonly _encoding: BufferEncoding,
    private readonly _append: boolean,
  ) {}

  write(text: string): void {
    if (this._disposed) {
      throw new Error('Cannot write to a disposed FileTextWriter');
    }

    this.ensureOpen();

    if (this._fd === null) {
      throw new Error('File descriptor is null');
    }

    try {
      const buffer = Buffer.from(text, this._encoding);
      fs.writeSync(this._fd, buffer);
    } catch (err) {
      throw new Error(`Error writing to file ${this._filePath}: ${(err as Error).message}`, { cause: err });
    }
  }

  flush(): void {
    if (this._disposed) {
      throw new Error('Cannot flush a disposed FileTextWriter');
    }

    if (!this._opened || this._fd === null) {
      return;
    }

    try {
      fs.fsyncSync(this._fd);
    } catch (err) {
      throw new Error(`Error flushing file ${this._filePath}: ${(err as Error).message}`, { cause: err });
    }
  }

  [Symbol.dispose](): void {
    if (this._disposed) {
      return;
    }

    this._disposed = true;

    if (this._fd !== null) {
      try {
        fs.fsyncSync(this._fd);
        fs.closeSync(this._fd);
      } catch {
        // Suppress errors on close
      } finally {
        this._fd = null;
      }
    }
  }

  private ensureOpen(): void {
    if (this._opened) {
      return;
    }

    try {
      const flags = this._append ? 'a' : 'w';
      this._fd = fs.openSync(this._filePath, flags);
      this._opened = true;
    } catch (err) {
      throw new Error(`Error opening file ${this._filePath}: ${(err as Error).message}`, { cause: err });
    }
  }
}

/**
 * High-level writer for fielded text files that writes directly to the file system.
 * Node.js-specific extension of FtWriter that accepts a file path.
 * Provides a convenient single-class API for Node.js applications.
 * @public
 */
export class FtNodeFileWriter extends FtWriter {
  /**
   * Creates a new FtNodeFileWriter that writes to a file.
   * @param filePath - The path to the file to write
   * @param meta - The metadata defining the file structure
   * @param encoding - The character encoding to use (default: 'utf-8')
   * @param settings - Optional writer settings
   */
  constructor(filePath: fs.PathLike, meta: FtMeta, encoding: BufferEncoding = 'utf-8', settings?: FtWriterSettings) {
    super(meta);

    // Create internal file writer
    const fileWriter: FtTextWriter = new NodeFileTextWriter(filePath, encoding, false);

    this.open(fileWriter, settings);
  }
}
