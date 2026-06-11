import { FtSequenceRedirect } from '../sequences/redirects/ft-sequence-redirect.js';
import { FtSequenceRedirectType } from '../types/enums/ft-sequence-redirect-type.js';

/**
 * Abstract base class for sequence redirect constructors.
 * @public
 */
export abstract class FtSequenceRedirectConstructor {
  get sequenceRedirectType(): FtSequenceRedirectType {
    return this.getSequenceRedirectType();
  }

  get sequenceRedirectTypeName(): string {
    return this.sequenceRedirectType;
  }

  abstract createSequenceRedirect(index: number): FtSequenceRedirect;
  protected abstract getSequenceRedirectType(): FtSequenceRedirectType;
}
