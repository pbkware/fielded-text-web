// Exact date-time meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field value exactly matches a specific date-time value.
 * Used in metadata to define sequence transitions based on exact date-time field values (including time component).
 * @public
 */
export class FtExactDateTimeMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for exact date-time redirects */
  static readonly TYPE = FtSequenceRedirectType.ExactDateTime;
  /** Default date-time value (Unix epoch) */
  static readonly DEFAULT_VALUE = new Date(0);

  private _value: Date;

  constructor() {
    super(FtExactDateTimeMetaSequenceRedirect.TYPE);
    this._value = new Date(FtExactDateTimeMetaSequenceRedirect.DEFAULT_VALUE);
  }

  /** The date-time value to match exactly for triggering the redirect */
  get value(): Date {
    return this._value;
  }

  set value(val: Date) {
    this._value = val;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    this._value = new Date(FtExactDateTimeMetaSequenceRedirect.DEFAULT_VALUE);
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtExactDateTimeMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = new Date((source as FtExactDateTimeMetaSequenceRedirect)._value);
  }
}
