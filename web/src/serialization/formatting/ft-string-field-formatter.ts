import { FtFieldFormatter } from './ft-field-formatter.js';

/**
 * Formatter for string fields.
 * @public
 */
export class FtStringFieldFormatter extends FtFieldFormatter {
  toText(value: string): string {
    return value;
  }

  parse(text: string): string {
    return text;
  }
}
