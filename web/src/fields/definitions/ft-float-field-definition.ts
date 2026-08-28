import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtFloatMetaField } from '../../meta/fields/ft-float-meta-field.js';
import { FtFloatFieldFormatter } from '../../serialization/formatting/ft-float-field-formatter.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtGenericFieldDefinition } from './ft-generic-field-definition.js';

/**
 * Field definition for float (number) fields.
 * @public
 */
export class FtFloatFieldDefinition extends FtGenericFieldDefinition<number> {
  static readonly AUTO_LEFT_PAD = true;

  declare protected formatter: FtFloatFieldFormatter;

  constructor(index: number) {
    const formatter = new FtFloatFieldFormatter();
    super(FtDataType.Float, 'number', formatter, FtFloatFieldDefinition.AUTO_LEFT_PAD, index);
  }

  get format(): string {
    return this.formatter.format;
  }

  get styles(): number {
    return this.formatter.styles;
  }

  override loadMeta(metaField: FtFloatMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    super.loadMeta(metaField, myCulture, myMainHeadingIndex);

    this.formatter.format = metaField.format;
    this.formatter.styles = metaField.styles;
  }

  formatValue(value: number): string {
    return this.formatter.toText(value);
  }

  parseValueText(text: string): number {
    return this.formatter.parse(text);
  }
}
