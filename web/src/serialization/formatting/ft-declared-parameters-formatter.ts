import { FtDeclaredParameterRec, FtDeclaredParameters } from '../ft-declared-parameters.js';

/**
 * Formatter for declared parameters in .ftx file headers.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtDeclaredParametersFormatter {
  private static readonly NAME_VALUE_SEPARATOR = '=';
  private static readonly QUOTE_CHAR = '"';
  private static readonly DOUBLE_QUOTE_STRING = '""';
  private static readonly SPACE_CHARACTER = ' ';

  /**
   * Format the signature line (first declaration line with version).
   */
  static toSignatureLineText(parameters: FtDeclaredParameters): string {
    const versionRecResult = parameters.tryGetVersionRec();
    if (!versionRecResult.success) {
      throw new Error('Version not specified in declared parameters');
    }

    const recArray: FtDeclaredParameterRec[] = [versionRecResult.rec];
    return FtDeclaredParametersFormatter.toText(recArray);
  }

  /**
   * Format the second declaration line (all parameters except version).
   */
  static toLine2Text(parameters: FtDeclaredParameters): string {
    const recs = parameters.getAllRecsExceptVersion();
    return FtDeclaredParametersFormatter.toText(recs);
  }

  /**
   * Convert parameter records to text format.
   */
  private static toText(recs: FtDeclaredParameterRec[]): string {
    const parts: string[] = [];
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      if (rec.name.includes(FtDeclaredParametersFormatter.NAME_VALUE_SEPARATOR)) {
        throw new Error(`Parameter name contains separator character: ${rec.name}`);
      }

      const value = rec.value.replace(FtDeclaredParametersFormatter.QUOTE_CHAR, FtDeclaredParametersFormatter.DOUBLE_QUOTE_STRING);

      if (i > 0) {
        parts.push(FtDeclaredParametersFormatter.SPACE_CHARACTER);
      }
      parts.push(rec.name);
      parts.push(FtDeclaredParametersFormatter.NAME_VALUE_SEPARATOR);
      parts.push(FtDeclaredParametersFormatter.QUOTE_CHAR);
      parts.push(value);
      parts.push(FtDeclaredParametersFormatter.QUOTE_CHAR);
    }

    return parts.join('');
  }
}
