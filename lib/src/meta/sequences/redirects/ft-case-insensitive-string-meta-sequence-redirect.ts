// Case-insensitive string meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value matches a specific string (case-insensitive).
 * Used in metadata to define sequence transitions based on string field values without case sensitivity.
 * @public
 */
export class FtCaseInsensitiveStringMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for case-insensitive string redirects */
  static readonly TYPE = FtSequenceRedirectType.CaseInsensitiveString;
  /** Default string value */
  static readonly DEFAULT_VALUE = '';

  private _value: string;

  constructor() {
    super(FtCaseInsensitiveStringMetaSequenceRedirect.TYPE);
    this._value = FtCaseInsensitiveStringMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The string value to match (case-insensitive) for triggering the redirect */
  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtCaseInsensitiveStringMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtCaseInsensitiveStringMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtCaseInsensitiveStringMetaSequenceRedirect)._value;
  }
}
