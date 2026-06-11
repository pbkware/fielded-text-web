import { DotNetDateTimeFormatter, DotNetDateTimeStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtFieldFormatter } from './ft-field-formatter.js';

/**
 * Formatter for DateTime fields using .NET-compatible formatting.
 * Implementation delegates to DotNetDateTimeFormatter from dot-net-date-number-formatting package.
 * @public
 */
export class FtDateTimeFieldFormatter extends FtFieldFormatter {
  private _format: string = FtMetaDefaults.DateTimeField.Format;
  private _styles: DotNetDateTimeStyles = FtMetaDefaults.DateTimeField.Styles;
  private _formatter: DotNetDateTimeFormatter = new DotNetDateTimeFormatter();

  constructor() {
    super();
    // Initialize formatter with default format
    const result = this._formatter.trySetFormat(this._format);
    if (!result.isOk()) {
      throw new Error(`Failed to set default datetime format: ${this._format}`);
    }
  }

  get format(): string {
    return this._format;
  }

  set format(value: string) {
    this._format = value;
    const result = this._formatter.trySetFormat(value);
    if (!result.isOk()) {
      throw new Error(`Invalid datetime format: ${value}`);
    }
  }

  get styles(): DotNetDateTimeStyles {
    return this._styles;
  }

  set styles(value: DotNetDateTimeStyles) {
    this._styles = value;
  }

  toText(value: Date): string {
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    return this._formatter.toString(value);
  }

  parse(text: string): Date {
    if (this.culture) {
      this._formatter.localeSettings = this.culture;
    }
    const result = this._formatter.tryFromString(text);
    if (!result.isOk()) {
      throw new Error(`Failed to parse datetime: ${text}`);
    }
    return result.value;
  }
}
