// Abstract base class for meta sequence redirects

import { FtSequenceInvokationDelay } from '../../../types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import type { FtMetaSequence } from '../core/ft-meta-sequence.js';

/**
 * Default invokation delay for sequence redirects.
 * @public
 */
export const DEFAULT_INVOKATION_DELAY = FtSequenceInvokationDelay.AfterField;

/**
 * Abstract base class for meta sequence redirects.
 * Sequence redirects define conditional transitions from one sequence to another
 * based on field values in the metadata.
 * @public
 */
export abstract class FtMetaSequenceRedirect {
  private readonly _type: FtSequenceRedirectType;
  private _sequence: FtMetaSequence | undefined;
  private _invokationDelay: FtSequenceInvokationDelay;

  protected constructor(type: FtSequenceRedirectType) {
    this._type = type;
    this._invokationDelay = DEFAULT_INVOKATION_DELAY;
  }

  /** The type identifier for this redirect */
  get type(): FtSequenceRedirectType {
    return this._type;
  }

  /** The target sequence to redirect to when this redirect is triggered */
  get sequence(): FtMetaSequence | undefined {
    return this._sequence;
  }

  set sequence(value: FtMetaSequence | undefined) {
    this._sequence = value;
  }

  /** When the redirect should be invoked relative to field processing */
  get invokationDelay(): FtSequenceInvokationDelay {
    return this._invokationDelay;
  }

  set invokationDelay(value: FtSequenceInvokationDelay) {
    this._invokationDelay = value;
  }

  /** Reset this redirect to default values */
  loadDefaults(): void {
    this._invokationDelay = DEFAULT_INVOKATION_DELAY;
  }

  /**
   * Assign values from another redirect to this one.
   * @param source - The source redirect to copy from
   * @param sequenceList - The destination sequence list
   * @param sourceSequenceList - The source sequence list
   * @internal
   */
  protected assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    this._invokationDelay = source._invokationDelay;

    if (source._sequence) {
      const sequenceIndex = sourceSequenceList.indexOf(source._sequence);
      if (sequenceIndex < 0) {
        throw new Error('Source sequence not found in source sequence list');
      }
      if (sequenceIndex >= sequenceList.count) {
        throw new Error(`Sequence index ${sequenceIndex} out of range`);
      }
      this._sequence = sequenceList.get(sequenceIndex);
    } else {
      this._sequence = undefined;
    }
  }

  /**
   * Create a deep copy of this redirect.
   * @param sequenceList - The destination sequence list
   * @param sourceSequenceList - The source sequence list
   * @returns A new redirect instance with copied values
   */
  abstract createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect;
}
