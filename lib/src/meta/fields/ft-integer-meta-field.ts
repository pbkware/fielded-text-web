import { DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for integer (bigint) values.
 * @public
 */
export class FtIntegerMetaField extends FtGenericMetaField<bigint> {
  static readonly DATA_TYPE = FtDataType.Integer;

  static readonly DEFAULT_FORMAT = FtMetaDefaults.IntegerField.Format;
  static readonly DEFAULT_STYLES = FtMetaDefaults.IntegerField.Styles;
  static readonly DEFAULT_VALUE = FtMetaDefaults.IntegerField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.IntegerField.SequenceRedirectType;

  private _format: string = FtIntegerMetaField.DEFAULT_FORMAT;
  private _styles: DotNetNumberStyles = FtIntegerMetaField.DEFAULT_STYLES;

  constructor(headingCount = 0) {
    super(FtIntegerMetaField.DATA_TYPE, headingCount, FtIntegerMetaField.DEFAULT_VALUE);
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

  static isIntegerMetaField(field: FtMetaField): field is FtIntegerMetaField {
    return field.dataType === FtIntegerMetaField.DATA_TYPE;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._format = FtIntegerMetaField.DEFAULT_FORMAT;
    this._styles = FtIntegerMetaField.DEFAULT_STYLES;
  }

  createCopy(): FtMetaField {
    const field = new FtIntegerMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtIntegerMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtIntegerMetaField) {
      this._format = source._format;
      this._styles = source._styles;
    }
  }
}
