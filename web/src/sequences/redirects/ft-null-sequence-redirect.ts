import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtNullMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-null-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field is null.
 * @public
 */
export class FtNullSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.Null;

  constructor(index: number) {
    super(index, FtNullSequenceRedirect.TYPE);
  }

  checkTriggered(field: FtField): boolean {
    return field.isNull();
  }

  /** @internal */
  override loadMeta(metaSequenceRedirect: FtNullMetaSequenceRedirect, metaSequenceList: FtMetaSequenceList, sequenceList: FtSequenceList): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);
  }
}
