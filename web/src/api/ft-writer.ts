import { FtMeta } from '../meta/ft-meta.js';
import { FtSerializationWriter } from '../serialization/ft-serialization-writer.js';
import { FtTextWriter } from '../serialization/ft-text-writer.js';
import { FtWriterSettings } from './ft-writer-settings.js';

/**
 * High-level writer for fielded text files.
 * Provides a convenient API for writing CSV and other delimited/fixed-width text.
 * This is a thin wrapper around SerializationWriter with simpler constructors.
 * @public
 */
export class FtWriter extends FtSerializationWriter {
  /**
   * Create a writer with metadata and output writer.
   * @param meta - The metadata defining the file structure
   * @param textWriter - The FtTextWriter to write to. If not provided, FtWriter will be created but not opened (you must call open() before writing).
   * @param settings - Optional writer settings
   */
  constructor(meta: FtMeta, textWriter?: FtTextWriter, settings?: FtWriterSettings) {
    super(meta);

    if (textWriter) {
      this.open(textWriter, settings);
    }
  }
}
