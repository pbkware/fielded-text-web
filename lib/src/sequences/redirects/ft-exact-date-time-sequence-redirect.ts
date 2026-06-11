import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtExactDateTimeMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-date-time-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field exactly equals a specific datetime value.
 * @public
 */
export class FtExactDateTimeSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.ExactDateTime;

  private _value: Date = new Date(0);

  constructor(index: number) {
    super(index, FtExactDateTimeSequenceRedirect.TYPE);
  }

  get value(): Date {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectDateTime.getTime() === this._value.getTime();
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(
    metaSequenceRedirect: FtExactDateTimeMetaSequenceRedirect,
    metaSequenceList: FtMetaSequenceList,
    sequenceList: FtSequenceList,
  ): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
