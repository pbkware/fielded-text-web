// Exact float meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value exactly matches a specific float value.
 * Used in metadata to define sequence transitions based on floating-point field values.
 * @public
 */
export class FtExactFloatMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for exact float redirects */
  static readonly TYPE = FtSequenceRedirectType.ExactFloat;
  /** Default float value */
  static readonly DEFAULT_VALUE = 0;

  private _value: number;

  constructor() {
    super(FtExactFloatMetaSequenceRedirect.TYPE);
    this._value = FtExactFloatMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The float value to match exactly for triggering the redirect */
  get value(): number {
    return this._value;
  }

  set value(val: number) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtExactFloatMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtExactFloatMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtExactFloatMetaSequenceRedirect)._value;
  }
}
