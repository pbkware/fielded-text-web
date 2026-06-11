import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';

/**
 * Abstract base class for all field formatters.
 * Concrete formatters handle type-specific formatting and parsing.
 * @public
 */
export abstract class FtFieldFormatter {
  private _culture: DotNetLocaleSettings | undefined;

  get culture(): DotNetLocaleSettings | undefined {
    return this._culture;
  }

  set culture(value: DotNetLocaleSettings | undefined) {
    this._culture = value;
  }
}
