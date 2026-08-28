import { FtField } from '../../fields/instances/ft-field.js';
import type { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import type { FtMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-meta-sequence-redirect.js';
import { FtSequenceInvokationDelay } from '../../types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import type { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequence } from '../core/ft-sequence.js';

/**
 * Abstract base class for sequence redirects.
 * Redirects determine when to switch from one sequence to another based on field values.
 * These are the runtime instances that use metadata definitions to perform actual redirections.
 * @public
 */
export abstract class FtSequenceRedirect {
  private _index: number;
  private _type: FtSequenceRedirectType;
  private _sequence: FtSequence | undefined;
  private _invokationDelay: FtSequenceInvokationDelay;

  protected constructor(index: number, type: FtSequenceRedirectType) {
    this._index = index;
    this._type = type;
    this._invokationDelay = FtSequenceInvokationDelay.AfterSequence;
  }

  get index(): number {
    return this._index;
  }

  get type(): FtSequenceRedirectType {
    return this._type;
  }

  // get typeName(): string {
  //   return FtSequenceRedirectTypeInfo.toName(this._type);
  // }

  get sequence(): FtSequence | undefined {
    return this._sequence;
  }

  get invokationDelay(): FtSequenceInvokationDelay {
    return this._invokationDelay;
  }

  /** @internal */
  loadMeta(metaSequenceRedirect: FtMetaSequenceRedirect, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    this._type = metaSequenceRedirect.type;
    this._invokationDelay = metaSequenceRedirect.invokationDelay;

    if (metaSequenceRedirect.sequence) {
      const sequenceIdx = metaSequenceList.indexOf(metaSequenceRedirect.sequence);
      if (sequenceIdx < 0) {
        throw new Error(`MetaSequenceRedirect sequence "${metaSequenceRedirect.sequence.name}" not found in MetaSequenceList`);
      }
      // sequenceList are in same order as Meta Sequence List
      this._sequence = sequenceList.get(sequenceIdx);
    }
  }

  /**
   * Check if this redirect is triggered based on the field's current state.
   * @param field - The field to check
   * @returns true if redirect should be triggered
   */
  abstract checkTriggered(field: FtField): boolean;
}
