import { DotNetDateTimeStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for Date/Time values.
 * @public
 */
export class FtDateTimeMetaField extends FtGenericMetaField<Date> {
  static readonly DATA_TYPE = FtDataType.DateTime;

  static readonly DEFAULT_FORMAT = FtMetaDefaults.DateTimeField.Format;
  static readonly DEFAULT_STYLES = FtMetaDefaults.DateTimeField.Styles;
  static readonly DEFAULT_VALUE = FtMetaDefaults.DateTimeField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.DateTimeField.SequenceRedirectType;

  private _format: string = FtDateTimeMetaField.DEFAULT_FORMAT;
  private _styles: DotNetDateTimeStyles = FtDateTimeMetaField.DEFAULT_STYLES;

  constructor(headingCount = 0) {
    super(FtDateTimeMetaField.DATA_TYPE, headingCount, new Date(FtDateTimeMetaField.DEFAULT_VALUE));
  }

  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
  }

  get styles(): DotNetDateTimeStyles {
    return this._styles;
  }
  set styles(value: DotNetDateTimeStyles) {
    this._styles = value;
  }

  static isDateTimeMetaField(field: FtMetaField): field is FtDateTimeMetaField {
    return field.dataType === FtDateTimeMetaField.DATA_TYPE;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._format = FtDateTimeMetaField.DEFAULT_FORMAT;
    this._styles = FtDateTimeMetaField.DEFAULT_STYLES;
  }

  createCopy(): FtMetaField {
    const field = new FtDateTimeMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtDateTimeMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtDateTimeMetaField) {
      this._format = source._format;
      this._styles = source._styles;
    }
  }
}
