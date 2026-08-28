import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtDateMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-date-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field's date component equals a specific date value (time ignored).
 * @public
 */
export class FtDateSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.Date;

  private _value: Date = new Date(0);

  constructor(index: number) {
    super(index, FtDateSequenceRedirect.TYPE);
  }

  get value(): Date {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      const fieldDate = field.asRedirectDateTime;
      // Compare only the date portion (ignore time)
      return (
        fieldDate.getFullYear() === this._value.getFullYear() &&
        fieldDate.getMonth() === this._value.getMonth() &&
        fieldDate.getDate() === this._value.getDate()
      );
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(metaSequenceRedirect: FtDateMetaSequenceRedirect, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
