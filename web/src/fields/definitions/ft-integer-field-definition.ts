import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtIntegerMetaField } from '../../meta/fields/ft-integer-meta-field.js';
import { FtIntegerFieldFormatter } from '../../serialization/formatting/ft-integer-field-formatter.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtGenericFieldDefinition } from './ft-generic-field-definition.js';

/**
 * Field definition for integer (bigint) fields.
 * In TypeScript we use bigint for precision but also support number.
 * @public
 */
export class FtIntegerFieldDefinition extends FtGenericFieldDefinition<bigint> {
  static readonly AUTO_LEFT_PAD = true;

  declare protected formatter: FtIntegerFieldFormatter;

  constructor(index: number) {
    const formatter = new FtIntegerFieldFormatter();
    super(FtDataType.Integer, 'bigint', formatter, FtIntegerFieldDefinition.AUTO_LEFT_PAD, index);
  }

  get format(): string {
    return this.formatter.format;
  }

  get styles(): number {
    return this.formatter.styles;
  }

  override loadMeta(metaField: FtIntegerMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    super.loadMeta(metaField, myCulture, myMainHeadingIndex);

    this.formatter.format = metaField.format;
    this.formatter.styles = metaField.styles;
  }

  formatValue(value: bigint): string {
    return this.formatter.toText(value);
  }

  parseValueText(text: string): bigint {
    return this.formatter.parse(text);
  }
}
