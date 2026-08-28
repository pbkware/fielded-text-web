import { DotNetDateTimeStyles, DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtDateTimeMetaField } from '../../meta/fields/ft-date-time-meta-field.js';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtDateTimeFieldFormatter } from '../../serialization/formatting/ft-date-time-field-formatter.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtGenericFieldDefinition } from './ft-generic-field-definition.js';

/**
 * Field definition for DateTime fields.
 * @public
 */
export class FtDateTimeFieldDefinition extends FtGenericFieldDefinition<Date> {
  static readonly AUTO_LEFT_PAD = true;

  declare protected formatter: FtDateTimeFieldFormatter;

  private _constantValue: Date = new Date(FtDateTimeMetaField.DEFAULT_VALUE);

  constructor(index: number) {
    const formatter = new FtDateTimeFieldFormatter();
    super(FtDataType.DateTime, 'Date', formatter, FtDateTimeFieldDefinition.AUTO_LEFT_PAD, index);
  }

  get format(): string {
    return this.formatter.format;
  }

  get styles(): DotNetDateTimeStyles {
    return this.formatter.styles;
  }

  get constantValue(): Date {
    return this._constantValue;
  }

  override loadMeta(metaField: FtMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    super.loadMeta(metaField, myCulture, myMainHeadingIndex);

    const dateTimeMetaField = metaField as FtDateTimeMetaField;
    this.formatter.format = dateTimeMetaField.format;
    this.formatter.styles = dateTimeMetaField.styles;
    this._constantValue = dateTimeMetaField.value;
  }

  formatValue(value: Date): string {
    return this.formatter.toText(value);
  }

  parseValueText(text: string): Date {
    return this.formatter.parse(text);
  }
}
