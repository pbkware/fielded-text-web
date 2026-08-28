import { DotNetDecimalFormatter, DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtFieldFormatter } from './ft-field-formatter.js';

/**
 * Formatter for decimal fields using .NET-compatible formatting.
 * Implementation delegates to DotNetDecimalFormatter from dot-net-date-number-formatting package.
 * @public
 */
export class FtDecimalFieldFormatter extends FtFieldFormatter {
  private _styles: DotNetNumberStyles = FtMetaDefaults.DecimalField.Styles;
  private _format: string = FtMetaDefaults.DecimalField.Format;
  private _formatter: DotNetDecimalFormatter = new DotNetDecimalFormatter();

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
      throw new Error(`Invalid decimal format: ${value}`);
    }
  }

  toText(value: number): string {
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    return this._formatter.toString(value);
  }

  parse(text: string): number {
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    const result = this._formatter.tryFromString(text);
    if (!result.isOk()) {
      throw new Error(`Failed to parse decimal: ${text}`);
    }
    return result.value;
  }
}
