import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import { FtGenericMetaField } from './ft-generic-meta-field.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Meta field for string values.
 * @public
 */
export class FtStringMetaField extends FtGenericMetaField<string> {
  static readonly DATA_TYPE = FtDataType.String;

  static readonly DEFAULT_VALUE = FtMetaDefaults.StringField.Value;
  static readonly DEFAULT_SEQUENCE_REDIRECT_TYPE = FtMetaDefaults.StringField.SequenceRedirectType;

  constructor(headingCount = 0) {
    super(FtStringMetaField.DATA_TYPE, headingCount, FtStringMetaField.DEFAULT_VALUE);
  }

  static isStringMetaField(field: FtMetaField): field is FtStringMetaField {
    return field.dataType === FtStringMetaField.DATA_TYPE;
  }

  createCopy(): FtMetaField {
    const field = new FtStringMetaField(this.headingCount);
    field.assignFrom(this);
    return field;
  }

  protected getDefaultSequenceRedirectType(): FtSequenceRedirectType {
    return FtStringMetaField.DEFAULT_SEQUENCE_REDIRECT_TYPE;
  }
}
