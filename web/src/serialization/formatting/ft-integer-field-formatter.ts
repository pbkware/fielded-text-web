import { DotNetIntegerFormatter, DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtFieldFormatter } from './ft-field-formatter.js';

/**
 * Formatter for integer (long) fields using .NET-compatible formatting.
 * Implementation delegates to DotNetIntegerFormatter from dot-net-date-number-formatting package.
 * @public
 */
export class FtIntegerFieldFormatter extends FtFieldFormatter {
  private _styles: DotNetNumberStyles = FtMetaDefaults.IntegerField.Styles;
  private _format: string = FtMetaDefaults.IntegerField.Format;
  private _formatter: DotNetIntegerFormatter = new DotNetIntegerFormatter();

  get styles(): DotNetNumberStyles {
    return this._styles;
  }

  set styles(value: DotNetNumberStyles) {
    this._styles = value;
  }

  get format(): string {
    return this._format;
  }

  set format(value: string) {
    this._format = value;
    const result = this._formatter.trySetFormat(value);
    if (!result.isOk()) {
      throw new Error(`Invalid integer format: ${value}`);
    }
  }

  toText(value: bigint | number): string {
    const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    return this._formatter.toString(bigintValue);
  }

  parse(text: string): bigint {
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    const result = this._formatter.tryFromString(text);
    if (!result.isOk()) {
      throw new Error(`Failed to parse integer: ${text}`);
    }
    return result.value;
  }
}
