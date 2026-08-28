import { DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for decimal values.
 * @public
 */
export class FtDecimalMetaField extends FtGenericMetaField<number> {
  static readonly DATA_TYPE = FtDataType.Decimal;

  static readonly DEFAULT_FORMAT = FtMetaDefaults.DecimalField.Format;
  static readonly DEFAULT_STYLES = FtMetaDefaults.DecimalField.Styles;
  static readonly DEFAULT_VALUE = FtMetaDefaults.DecimalField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.DecimalField.SequenceRedirectType;

  private _format: string = FtDecimalMetaField.DEFAULT_FORMAT;
  private _styles: DotNetNumberStyles = FtDecimalMetaField.DEFAULT_STYLES;

  constructor(headingCount = 0) {
    super(FtDecimalMetaField.DATA_TYPE, headingCount, FtDecimalMetaField.DEFAULT_VALUE);
  }

  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
  }

  get styles(): DotNetNumberStyles {
    return this._styles;
  }
  set styles(value: DotNetNumberStyles) {
    this._styles = value;
  }

  static isDecimalMetaField(field: FtMetaField): field is FtDecimalMetaField {
    return field.dataType === FtDecimalMetaField.DATA_TYPE;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._format = FtDecimalMetaField.DEFAULT_FORMAT;
    this._styles = FtDecimalMetaField.DEFAULT_STYLES;
  }

  createCopy(): FtMetaField {
    const field = new FtDecimalMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtDecimalMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtDecimalMetaField) {
      this._format = source._format;
      this._styles = source._styles;
    }
  }
}
