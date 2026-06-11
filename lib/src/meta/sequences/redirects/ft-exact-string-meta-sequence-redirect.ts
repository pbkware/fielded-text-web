// Exact string meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value exactly matches a specific string (case-sensitive).
 * Used in metadata to define sequence transitions based on exact string field values.
 * @public
 */
export class FtExactStringMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for exact string redirects */
  static readonly TYPE = FtSequenceRedirectType.ExactString;
  /** Default string value */
  static readonly DEFAULT_VALUE = '';

  private _value: string;

  constructor() {
    super(FtExactStringMetaSequenceRedirect.TYPE);
    this._value = FtExactStringMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The string value to match exactly for triggering the redirect */
  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtExactStringMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtExactStringMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtExactStringMetaSequenceRedirect)._value;
  }
}
