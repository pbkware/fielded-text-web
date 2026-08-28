import { FtBooleanStyles } from '../../types/enums/ft-boolean-styles.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for boolean values.
 * @public
 */
export class FtBooleanMetaField extends FtGenericMetaField<boolean> {
  static readonly DATA_TYPE = FtDataType.Boolean;

  static readonly DEFAULT_FALSE_TEXT = FtMetaDefaults.BooleanField.FalseText;
  static readonly DEFAULT_TRUE_TEXT = FtMetaDefaults.BooleanField.TrueText;
  static readonly DEFAULT_STYLES = FtMetaDefaults.BooleanField.Styles;
  static readonly DEFAULT_VALUE = FtMetaDefaults.BooleanField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.BooleanField.SequenceRedirectType;

  private _falseText: string = FtBooleanMetaField.DEFAULT_FALSE_TEXT;
  private _trueText: string = FtBooleanMetaField.DEFAULT_TRUE_TEXT;
  private _styles: FtBooleanStyles = FtBooleanMetaField.DEFAULT_STYLES;

  constructor(headingCount = 0) {
    super(FtBooleanMetaField.DATA_TYPE, headingCount, FtBooleanMetaField.DEFAULT_VALUE);
  }

  get falseText(): string {
    return this._falseText;
  }
  set falseText(value: string) {
    this._falseText = value;
  }

  get trueText(): string {
    return this._trueText;
  }
  set trueText(value: string) {
    this._trueText = value;
  }

  get styles(): FtBooleanStyles {
    return this._styles;
  }
  set styles(value: FtBooleanStyles) {
    this._styles = value;
  }

  static isBooleanMetaField(field: FtMetaField): field is FtBooleanMetaField {
    return field.dataType === FtBooleanMetaField.DATA_TYPE;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._falseText = FtBooleanMetaField.DEFAULT_FALSE_TEXT;
    this._trueText = FtBooleanMetaField.DEFAULT_TRUE_TEXT;
    this._styles = FtBooleanMetaField.DEFAULT_STYLES;
  }

  createCopy(): FtMetaField {
    const field = new FtBooleanMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtBooleanMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtBooleanMetaField) {
      this._falseText = source._falseText;
      this._trueText = source._trueText;
      this._styles = source._styles;
    }
  }
}
