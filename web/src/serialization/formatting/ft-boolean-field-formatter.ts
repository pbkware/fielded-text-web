import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';
import { FtBooleanStyles } from '../../types/enums/ft-boolean-styles.js';
import { FtFieldFormatter } from './ft-field-formatter.js';

/**
 * Formatter for boolean fields.
 * Supports various parsing styles including case sensitivity, partial matching, and more.
 * @public
 */
export class FtBooleanFieldFormatter extends FtFieldFormatter {
  private _falseText: string = FtMetaDefaults.BooleanField.FalseText;
  private _trueText: string = FtMetaDefaults.BooleanField.TrueText;
  private _styles: FtBooleanStyles = FtMetaDefaults.BooleanField.Styles;

  get falseText(): string {
    return this._falseText;
  }

  set falseText(value: string) {
    this._falseText = value;
  }

  get trueText(): string {
    return this._trueText;
  }

  set trueText(value: string) {
    this._trueText = value;
  }

  get styles(): FtBooleanStyles {
    return this._styles;
  }

  set styles(value: FtBooleanStyles) {
    this._styles = value;
  }

  toText(value: boolean): string {
    return value ? this._trueText : this._falseText;
  }

  parse(text: string): boolean {
    if (this.compareText(text, this._trueText)) {
      return true;
    } else {
      if ((this._styles & FtBooleanStyles.FalseIfNotMatchTrue) !== 0) {
        return false;
      } else {
        if (this.compareText(text, this._falseText)) {
          return false;
        } else {
          throw new Error(`Boolean parse failed: text '${text}' does not match '${this._trueText}' or '${this._falseText}'`);
        }
      }
    }
  }

  private compareText(text: string, stateText: string): boolean {
    if (stateText === '') {
      if (text === '') {
        return true;
      } else {
        return (this._styles & FtBooleanStyles.IgnoreTrailingChars) !== 0;
      }
    } else {
      if (text === '') {
        return false;
      } else {
        const ignoreCase = (this._styles & FtBooleanStyles.IgnoreCase) !== 0;

        if ((this._styles & FtBooleanStyles.MatchFirstCharOnly) !== 0) {
          // Match only the first character
          const textChar = ignoreCase ? this.toUpperCaseChar(text[0]) : text[0];
          const stateChar = ignoreCase ? this.toUpperCaseChar(stateText[0]) : stateText[0];
          return textChar === stateChar;
        } else {
          // Full or partial match
          if ((this._styles & FtBooleanStyles.IgnoreTrailingChars) === 0) {
            // Exact match required
            if (ignoreCase) {
              return text.toUpperCase() === stateText.toUpperCase();
            } else {
              return text === stateText;
            }
          } else {
            // Match prefix, ignore trailing characters
            const textLength = text.length;
            const stateTextLength = stateText.length;
            if (textLength < stateTextLength) {
              return false;
            } else {
              const adjustedText = textLength === stateTextLength ? text : text.substring(0, stateTextLength);

              if (ignoreCase) {
                return adjustedText.toUpperCase() === stateText.toUpperCase();
              } else {
                return adjustedText === stateText;
              }
            }
          }
        }
      }
    }
  }

  private toUpperCaseChar(char: string): string {
    // Use culture-aware character case conversion if culture is available
    if (this.culture) {
      return this.culture.toUpperChar(char);
    }
    return char.toUpperCase();
  }
}
