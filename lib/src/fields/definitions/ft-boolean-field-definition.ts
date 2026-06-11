import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtBooleanMetaField } from '../../meta/fields/ft-boolean-meta-field.js';
import { FtBooleanFieldFormatter } from '../../serialization/formatting/ft-boolean-field-formatter.js';
import { FtBooleanStyles } from '../../types/enums/ft-boolean-styles.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtGenericFieldDefinition } from './ft-generic-field-definition.js';

/**
 * Field definition for boolean fields.
 * @public
 */
export class FtBooleanFieldDefinition extends FtGenericFieldDefinition<boolean> {
  static readonly AUTO_LEFT_PAD = false;

  declare protected formatter: FtBooleanFieldFormatter;

  constructor(index: number) {
    const formatter = new FtBooleanFieldFormatter();
    super(FtDataType.Boolean, 'boolean', formatter, FtBooleanFieldDefinition.AUTO_LEFT_PAD, index);
  }

  get falseText(): string {
    return this.formatter.falseText;
  }

  get trueText(): string {
    return this.formatter.trueText;
  }

  get styles(): FtBooleanStyles {
    return this.formatter.styles;
  }

  override loadMeta(metaField: FtBooleanMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    super.loadMeta(metaField, myCulture, myMainHeadingIndex);

    this.formatter.falseText = metaField.falseText;
    this.formatter.trueText = metaField.trueText;
    this.formatter.styles = metaField.styles;
  }

  getValueText(value: boolean): string {
    return this.formatter.toText(value);
  }

  parseValueText(text: string): boolean {
    return this.formatter.parse(text);
  }
}
