// Exact decimal meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value exactly matches a specific decimal value.
 * Used in metadata to define sequence transitions based on decimal field values.
 * @public
 */
export class FtExactDecimalMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for exact decimal redirects */
  static readonly TYPE = FtSequenceRedirectType.ExactDecimal;
  /** Default decimal value */
  static readonly DEFAULT_VALUE = 0;

  private _value: number;

  constructor() {
    super(FtExactDecimalMetaSequenceRedirect.TYPE);
    this._value = FtExactDecimalMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The decimal value to match exactly for triggering the redirect */
  get value(): number {
    return this._value;
  }

  set value(val: number) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtExactDecimalMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtExactDecimalMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtExactDecimalMetaSequenceRedirect)._value;
  }
}
