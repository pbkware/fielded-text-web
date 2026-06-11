// Exact integer meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value exactly matches a specific integer value.
 * Used in metadata to define sequence transitions based on integer field values.
 * @public
 */
export class FtExactIntegerMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for exact integer redirects */
  static readonly TYPE = FtSequenceRedirectType.ExactInteger;
  /** Default integer value */
  static readonly DEFAULT_VALUE = 0n;

  private _value: bigint;

  constructor() {
    super(FtExactIntegerMetaSequenceRedirect.TYPE);
    this._value = FtExactIntegerMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The integer value to match exactly for triggering the redirect */
  get value(): bigint {
    return this._value;
  }

  set value(val: bigint) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtExactIntegerMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtExactIntegerMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtExactIntegerMetaSequenceRedirect)._value;
  }
}
