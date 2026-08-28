import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtExactStringMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-string-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field exactly equals a specific string value (case-sensitive).
 * @public
 */
export class FtExactStringSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.ExactString;

  private _value = '';

  constructor(index: number) {
    super(index, FtExactStringSequenceRedirect.TYPE);
  }

  get value(): string {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectString === this._value;
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(
    metaSequenceRedirect: FtExactStringMetaSequenceRedirect,
    metaSequenceList: FtMetaSequenceList,
    sequenceList: FtSequenceList,
  ): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
