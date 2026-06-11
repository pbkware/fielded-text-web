import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtExactIntegerMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-integer-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field exactly equals a specific integer value.
 * @public
 */
export class FtExactIntegerSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.ExactInteger;

  private _value = 0n;

  constructor(index: number) {
    super(index, FtExactIntegerSequenceRedirect.TYPE);
  }

  get value(): bigint {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectInteger === this._value;
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(
    metaSequenceRedirect: FtExactIntegerMetaSequenceRedirect,
    metaSequenceList: FtMetaSequenceList,
    sequenceList: FtSequenceList,
  ): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
