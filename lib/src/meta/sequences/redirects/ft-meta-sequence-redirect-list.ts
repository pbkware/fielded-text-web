// Meta sequence redirect list - manages redirects for a sequence item

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import { FtUnreachableCaseError } from '../../../types/errors/ft-internal-error.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtBooleanMetaSequenceRedirect } from './ft-boolean-meta-sequence-redirect.js';
import { FtCaseInsensitiveStringMetaSequenceRedirect } from './ft-case-insensitive-string-meta-sequence-redirect.js';
import { FtDateMetaSequenceRedirect } from './ft-date-meta-sequence-redirect.js';
import { FtExactDateTimeMetaSequenceRedirect } from './ft-exact-date-time-meta-sequence-redirect.js';
import { FtExactDecimalMetaSequenceRedirect } from './ft-exact-decimal-meta-sequence-redirect.js';
import { FtExactFloatMetaSequenceRedirect } from './ft-exact-float-meta-sequence-redirect.js';
import { FtExactIntegerMetaSequenceRedirect } from './ft-exact-integer-meta-sequence-redirect.js';
import { FtExactStringMetaSequenceRedirect } from './ft-exact-string-meta-sequence-redirect.js';
import type { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';
import { FtNullMetaSequenceRedirect } from './ft-null-meta-sequence-redirect.js';

/**
 * List of meta sequence redirects for a sequence item.
 * Manages the collection of redirects that determine when to switch sequences.
 * @public
 */
export class FtMetaSequenceRedirectList {
  private readonly _list: FtMetaSequenceRedirect[] = [];

  get count(): number {
    return this._list.length;
  }

  get(index: number): FtMetaSequenceRedirect {
    return this._list[index];
  }

  set(redirects: readonly FtMetaSequenceRedirect[]): void {
    const count = redirects.length;
    this._list.length = count;
    for (let i = 0; i < count; i++) {
      this._list[i] = redirects[i];
    }
  }

  new(type: FtSequenceRedirectType): FtMetaSequenceRedirect {
    const redirect = this.createMetaSequenceRedirect(type);
    this.add(redirect);
    return redirect;
  }

  remove(redirect: FtMetaSequenceRedirect): void {
    const index = this._list.indexOf(redirect);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
  }

  removeAt(index: number): void {
    this._list.splice(index, 1);
  }

  clear(): void {
    this._list.length = 0;
  }

  assign(source: FtMetaSequenceRedirectList, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    this._list.length = 0;

    for (let i = 0; i < source.count; i++) {
      const redirect = source.get(i).createCopy(sequenceList, sourceSequenceList);
      this.add(redirect);
    }
  }

  private add(redirect: FtMetaSequenceRedirect): void {
    this._list.push(redirect);
  }

  private createMetaSequenceRedirect(type: FtSequenceRedirectType): FtMetaSequenceRedirect {
    switch (type) {
      case FtSequenceRedirectType.Null:
        return new FtNullMetaSequenceRedirect();
      case FtSequenceRedirectType.Boolean:
        return new FtBooleanMetaSequenceRedirect();
      case FtSequenceRedirectType.ExactString:
        return new FtExactStringMetaSequenceRedirect();
      case FtSequenceRedirectType.CaseInsensitiveString:
        return new FtCaseInsensitiveStringMetaSequenceRedirect();
      case FtSequenceRedirectType.ExactInteger:
        return new FtExactIntegerMetaSequenceRedirect();
      case FtSequenceRedirectType.ExactFloat:
        return new FtExactFloatMetaSequenceRedirect();
      case FtSequenceRedirectType.ExactDecimal:
        return new FtExactDecimalMetaSequenceRedirect();
      case FtSequenceRedirectType.ExactDateTime:
        return new FtExactDateTimeMetaSequenceRedirect();
      case FtSequenceRedirectType.Date:
        return new FtDateMetaSequenceRedirect();
      default:
        throw new FtUnreachableCaseError('MSRLCMSR22113', type);
    }
  }
}
