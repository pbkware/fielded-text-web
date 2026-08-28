// Date meta sequence redirect

import { FtSequenceRedirectType } from '../../../types/enums/ft-sequence-redirect-type.js';
import type { FtMetaSequenceList } from '../core/ft-meta-sequence-list.js';
import { FtMetaSequenceRedirect } from './ft-meta-sequence-redirect.js';

/**
 * Meta sequence redirect that triggers when a field's date part matches a specific date (ignoring time).
 * Used in metadata to define sequence transitions based on date field values (time component ignored).
 * @public
 */
export class FtDateMetaSequenceRedirect extends FtMetaSequenceRedirect {
  /** The standard type identifier for date redirects */
  static readonly TYPE = FtSequenceRedirectType.Date;
  /** Default date value (Unix epoch) */
  static readonly DEFAULT_VALUE = new Date(0);

  private _value: Date;

  constructor() {
    super(FtDateMetaSequenceRedirect.TYPE);
    this._value = new Date(FtDateMetaSequenceRedirect.DEFAULT_VALUE);
  }

  /** The date value to match (time component ignored) for triggering the redirect */
  get value(): Date {
    return this._value;
  }

  set value(val: Date) {
    // Store only the date part (set time to midnight)
    const dateOnly = new Date(val);
    dateOnly.setHours(0, 0, 0, 0);
    this._value = dateOnly;
  }

  override loadDefaults(): void {
    super.loadDefaults();
    const dateOnly = new Date(FtDateMetaSequenceRedirect.DEFAULT_VALUE);
    dateOnly.setHours(0, 0, 0, 0);
    this._value = dateOnly;
  }

  createCopy(sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): FtMetaSequenceRedirect {
    const redirect = new FtDateMetaSequenceRedirect();
    redirect.assign(this, sequenceList, sourceSequenceList);
    return redirect;
  }

  protected override assign(source: FtMetaSequenceRedirect, sequenceList: FtMetaSequenceList, sourceSequenceList: FtMetaSequenceList): void {
    super.assign(source, sequenceList, sourceSequenceList);
    this._value = new Date((source as FtDateMetaSequenceRedirect)._value);
  }
}
