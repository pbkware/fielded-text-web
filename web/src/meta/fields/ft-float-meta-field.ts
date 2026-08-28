import { DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for float (number) values.
 * @public
 */
export class FtFloatMetaField extends FtGenericMetaField<number> {
  static readonly DATA_TYPE = FtDataType.Float;

  static readonly DEFAULT_FORMAT = FtMetaDefaults.FloatField.Format;
  static readonly DEFAULT_STYLES = FtMetaDefaults.FloatField.Styles;
  static readonly DEFAULT_VALUE = FtMetaDefaults.FloatField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.FloatField.SequenceRedirectType;

  private _format: string = FtFloatMetaField.DEFAULT_FORMAT;
  private _styles: DotNetNumberStyles = FtFloatMetaField.DEFAULT_STYLES;

  constructor(headingCount = 0) {
    super(FtFloatMetaField.DATA_TYPE, headingCount, FtFloatMetaField.DEFAULT_VALUE);
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

  static isFloatMetaField(field: FtMetaField): field is FtFloatMetaField {
    return field.dataType === FtFloatMetaField.DATA_TYPE;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._format = FtFloatMetaField.DEFAULT_FORMAT;
    this._styles = FtFloatMetaField.DEFAULT_STYLES;
  }

  createCopy(): FtMetaField {
    const field = new FtFloatMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtFloatMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtFloatMetaField) {
      this._format = source._format;
      this._styles = source._styles;
    }
  }
}
