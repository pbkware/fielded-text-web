// Null meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value is null.
 * Used in metadata to define sequence transitions based on null field values.
 * @public
 */
export class FtNullMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for null redirects */
  static readonly TYPE = FtSequenceRedirectType.Null;

  constructor() {
    super(FtNullMetaSequenceRedirect.TYPE);
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtNullMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }
}
