import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtCaseInsensitiveStringMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-case-insensitive-string-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field equals a specific string value (case-insensitive).
 * @public
 */
export class FtCaseInsensitiveStringSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.CaseInsensitiveString;

  private _value = '';

  constructor(index: number) {
    super(index, FtCaseInsensitiveStringSequenceRedirect.TYPE);
  }

  get value(): string {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectString.toLowerCase() === this._value.toLowerCase();
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(
    metaSequenceRedirect: FtCaseInsensitiveStringMetaSequenceRedirect,
    metaSequenceList: FtMetaSequenceList,
    sequenceList: FtSequenceList,
  ): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
