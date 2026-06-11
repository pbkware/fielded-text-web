import { FtFieldDefinitionList } from '../fields/definitions/ft-field-definition-list.js';
import { FtFieldList } from '../fields/instances/ft-field-list.js';
import { FtMeta } from '../meta/ft-meta.js';
import { FtSequenceInvokationList } from '../sequences/core/ft-sequence-invokation-list.js';
import { FtSequenceInvokation } from '../sequences/core/ft-sequence-invokation.js';
import { FtSequenceList } from '../sequences/core/ft-sequence-list.js';
import { FtSequence } from '../sequences/core/ft-sequence.js';
import { FtTextWriter } from '../serialization/ft-text-writer.js';
import { SerializationCore } from '../serialization/serialization-core.js';
import { FtSubstitutionList } from '../substitutions/ft-substitution-list.js';
import { FtFieldHeadingReadyEventArgs } from '../types/events/ft-field-heading-ready-event-args.js';
import { FtFieldValueReadyEventArgs } from '../types/events/ft-field-value-ready-event-args.js';
import { FtHeadingLineFinishedEventArgs } from '../types/events/ft-heading-line-finished-event-args.js';
import { FtHeadingLineStartedEventArgs } from '../types/events/ft-heading-line-started-event-args.js';
import { FtRecordFinishedEventArgs } from '../types/events/ft-record-finished-event-args.js';
import { FtRecordStartedEventArgs } from '../types/events/ft-record-started-event-args.js';
import { FtSequenceRedirectedEventArgs } from '../types/events/ft-sequence-redirected-event-args.js';
import { FtReader } from './ft-reader.js';
import { FtWriterSettings } from './ft-writer-settings.js';
import { FtWriter } from './ft-writer.js';

/**
 * Exception thrown to abort serialization from an event handler.
 * @public
 */
export class FtAbortSerializationException extends Error {
  constructor(message?: string) {
    super(message || 'Serialization aborted');
    this.name = 'FtAbortSerializationException';
  }
}

/**
 * High-level API for event-driven serialization and deserialization of fielded text.
 * Simplifies reading and writing by hooking into field and record events.
 * @public
 */
export class FtSerialization {
  static readonly VERSION_MAJOR = SerializationCore.VersionMajor;
  static readonly VERSION_MINOR = SerializationCore.VersionMinor;
  static readonly PREFIX_SPACE_CHAR = SerializationCore.PrefixSpaceChar;

  // Event hooks
  onFieldHeadingReadReady: ((args: FtFieldHeadingReadyEventArgs) => void) | undefined = undefined;
  onFieldHeadingWriteReady: ((args: FtFieldHeadingReadyEventArgs) => void) | undefined = undefined;
  onFieldValueReadReady: ((args: FtFieldValueReadyEventArgs) => void) | undefined = undefined;
  onFieldValueWriteReady: ((args: FtFieldValueReadyEventArgs) => void) | undefined = undefined;
  onHeadingLineStarted: ((args: FtHeadingLineStartedEventArgs) => void) | undefined = undefined;
  onHeadingLineFinished: ((args: FtHeadingLineFinishedEventArgs) => void) | undefined = undefined;
  onRecordStarted: ((args: FtRecordStartedEventArgs) => void) | undefined = undefined;
  onRecordFinished: ((args: FtRecordFinishedEventArgs) => void) | undefined = undefined;
  onSequenceRedirected: ((args: FtSequenceRedirectedEventArgs) => void) | undefined = undefined;

  private _meta: FtMeta;
  private _core: SerializationCore | undefined = undefined;

  constructor(meta: FtMeta) {
    this._meta = meta;
  }

  //  Proxied properties from core
  get fieldDefinitionList(): FtFieldDefinitionList | undefined {
    return this._core?.fieldDefinitionList;
  }

  get fieldList(): FtFieldList | undefined {
    return this._core?.fieldList;
  }

  get substitutionList(): FtSubstitutionList | undefined {
    return this._core?.substitutionList;
  }

  get sequenceList(): FtSequenceList | undefined {
    return this._core?.sequenceList;
  }

  get sequenceInvokationList(): FtSequenceInvokationList | undefined {
    return this._core?.sequenceInvokationList;
  }

  get rootSequence(): FtSequence | undefined {
    return this._core?.rootSequence;
  }

  get rootFieldCount(): number {
    return this._core?.rootFieldCount || 0;
  }

  get rootSequenceInvokation(): FtSequenceInvokation | undefined {
    return this._core?.rootSequenceInvokation;
  }

  get recordCount(): number {
    return this._core?.recordCount || 0;
  }

  get tableCount(): number {
    return this._core?.tableCount || 0;
  }

  /**
   * Read all records from a reader, invoking events for each field and record.
   * @param reader - The reader to deserialize from
   */
  deserialize(reader: FtReader): void;

  /**
   * Read all records from text input, invoking events for each field and record.
   * @param input - The text content to deserialize
   */
  deserialize(input: string): void;

  deserialize(readerOrInput: FtReader | string): void {
    const reader = typeof readerOrInput === 'string' ? new FtReader(this._meta, readerOrInput) : readerOrInput;

    this.setCore(reader);

    while (reader.read()) {
      // Events are fired during read()
    }
  }

  /**
   * Write records until aborted by throwing FtAbortSerializationException from an event handler.
   * @param writer - The writer to serialize to
   */
  serialize(writer: FtWriter): void;

  /**
   * Write records until aborted by throwing FtAbortSerializationException from an event handler.
   * @param output - The TextWriter to serialize to
   * @param settings - Optional writer settings
   */
  serialize(output: FtTextWriter, settings?: FtWriterSettings): void;

  serialize(writerOrOutput: FtWriter | FtTextWriter, settings?: FtWriterSettings): void {
    const writer = writerOrOutput instanceof FtWriter ? writerOrOutput : new FtWriter(this._meta, writerOrOutput, settings);

    this.setCore(writer);

    try {
      while (true) {
        writer.write();
        // The only way out is to throw FtAbortSerializationException in an event handler
      }
    } catch (e) {
      if (e instanceof FtAbortSerializationException) {
        // Normal exit
      } else {
        throw e;
      }
    } finally {
      writer.close();
    }
  }

  private setCore(core: SerializationCore): void {
    this._core = core;

    // Wire up event handlers
    core.onFieldHeadingReadReady = (args) => {
      if (this.onFieldHeadingReadReady) {
        this.onFieldHeadingReadReady(args);
      }
    };

    core.onFieldHeadingWriteReady = (args) => {
      if (this.onFieldHeadingWriteReady) {
        this.onFieldHeadingWriteReady(args);
      }
    };

    core.onFieldValueReadReady = (args) => {
      if (this.onFieldValueReadReady) {
        this.onFieldValueReadReady(args);
      }
    };

    core.onFieldValueWriteReady = (args) => {
      if (this.onFieldValueWriteReady) {
        this.onFieldValueWriteReady(args);
      }
    };

    core.onHeadingLineStarted = (args) => {
      if (this.onHeadingLineStarted) {
        this.onHeadingLineStarted(args);
      }
    };

    core.onHeadingLineFinished = (args) => {
      if (this.onHeadingLineFinished) {
        this.onHeadingLineFinished(args);
      }
    };

    core.onRecordStarted = (args) => {
      if (this.onRecordStarted) {
        this.onRecordStarted(args);
      }
    };

    core.onRecordFinished = (args) => {
      if (this.onRecordFinished) {
        this.onRecordFinished(args);
      }
    };

    core.onSequenceRedirected = (args) => {
      if (this.onSequenceRedirected) {
        this.onSequenceRedirected(args);
      }
    };
  }
}
