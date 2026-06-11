import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtBooleanMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-boolean-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field equals a specific boolean value.
 * @public
 */
export class FtBooleanSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.Boolean;

  private _value = false;

  constructor(index: number) {
    super(index, FtBooleanSequenceRedirect.TYPE);
  }

  get value(): boolean {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectBoolean === this._value;
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(metaSequenceRedirect: FtBooleanMetaSequenceRedirect, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
