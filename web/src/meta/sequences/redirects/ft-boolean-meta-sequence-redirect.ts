// Boolean meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value matches a specific boolean value.
 * Used in metadata to define sequence transitions based on boolean field values.
 * @public
 */
export class FtBooleanMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for boolean redirects */
  static readonly TYPE = FtSequenceRedirectType.Boolean;
  /** Default boolean value */
  static readonly DEFAULT_VALUE = false;

  private _value: boolean;

  constructor() {
    super(FtBooleanMetaSequenceRedirect.TYPE);
    this._value = FtBooleanMetaSequenceRedirect.DEFAULT_VALUE;
  }

  /** The boolean value to match for triggering the redirect */
  get value(): boolean {
    return this._value;
  }

  set value(val: boolean) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = FtBooleanMetaSequenceRedirect.DEFAULT_VALUE;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtBooleanMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = (source as FtBooleanMetaSequenceRedirect)._value;
  }
}
