import { FtStringFieldFormatter } from '../../serialization/formatting/ft-string-field-formatter.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtGenericFieldDefinition } from './ft-generic-field-definition.js';

/**
 * Field definition for string fields.
 * @public
 */
export class FtStringFieldDefinition extends FtGenericFieldDefinition<string> {
  static readonly AUTO_LEFT_PAD = false;

  declare protected formatter: FtStringFieldFormatter;

  constructor(index: number) {
    const formatter = new FtStringFieldFormatter();
    super(FtDataType.String, 'string', formatter, FtStringFieldDefinition.AUTO_LEFT_PAD, index);
  }

  formatValue(value: string): string {
    return this.formatter.toText(value);
  }

  parseValueText(text: string): string {
    return this.formatter.parse(text);
  }
}
