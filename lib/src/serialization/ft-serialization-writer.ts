import { FtWriterSettings } from '../api/ft-writer-settings.js';
import { FtFieldDefinition } from '../fields/definitions/ft-field-definition.js';
import { FtBooleanField } from '../fields/instances/ft-boolean-field.js';
import { FtDateTimeField } from '../fields/instances/ft-date-time-field.js';
import { FtDecimalField } from '../fields/instances/ft-decimal-field.js';
import { FtField } from '../fields/instances/ft-field.js';
import { FtFloatField } from '../fields/instances/ft-float-field.js';
import { FtIntegerField } from '../fields/instances/ft-integer-field.js';
import { FtStringField } from '../fields/instances/ft-string-field.js';
import { FtXmlMetaSerialization } from '../meta-serialization/format/ft-xml-meta-serialization.js';
import { FtMeta } from '../meta/ft-meta.js';
import { FtDataType } from '../types/enums/ft-data-type.js';
import { FtEndOfLineAutoWriteType } from '../types/enums/ft-end-of-line-auto-write-type.js';
import { FtEndOfLineType } from '../types/enums/ft-end-of-line-type.js';
import { FtLastLineEndedType } from '../types/enums/ft-last-line-ended-type.js';
import { FtMetaReferenceType } from '../types/enums/ft-meta-reference-type.js';
import { FtPadAlignment } from '../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../types/enums/ft-quoted-type.js';
import { FtTruncateType } from '../types/enums/ft-truncate-type.js';
import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { FtSerializationError } from '../types/errors/ft-serialization-error.js';
import { FtSerializationException } from '../types/errors/ft-serialization-exception.js';
import { FtDeclaredParametersFormatter } from './formatting/ft-declared-parameters-formatter.js';
import { FtDeclaredParameters } from './ft-declared-parameters.js';
import { FtTextWriter } from './ft-text-writer.js';
import { SerializationCore } from './serialization-core.js';

/**
 * Writer for fielded text streams. Coordinates all writing logic.
 * @public
 */
export class FtSerializationWriter extends SerializationCore {
  private static readonly DECLARATION_LINE2_BEFORE_COMMENT_CHARS = ' ';
  private static readonly EMBEDDED_META_BEFORE_COMMENT_CHARS = ' ';

  private _loadedMeta: FtMeta | undefined = undefined;
  private _writer: FtTextWriter | undefined = undefined;
  private _settings: FtWriterSettings | undefined = undefined;

  private readonly _encodeBuilder: string[] = [];
  private readonly _matchBuilder: string[] = [];

  private _endOfLineText = '';
  private _lastLineEnded = false;

  private _headerWritten = false;
  private _endOfLinePending = false;
  private _activeFieldIndex = -1;

  constructor(meta: FtMeta) {
    super();
    this.internalLoadMeta(meta);
  }

  /**
   * Gets the underlying text writer.
   */
  get baseWriter(): FtTextWriter | undefined {
    return this._writer;
  }

  /**
   * Gets whether the writer is closed.
   */
  override get isClosed(): boolean {
    return this._writer === undefined;
  }

  /**
   * Open the writer with a FtTextWriter and optional settings.
   * @param textWriter - The FtTextWriter to write to
   * @param settings - Optional writer settings (default: \{\})
   */
  open(textWriter: FtTextWriter, settings: FtWriterSettings = {}): void {
    if (this._writer !== undefined) {
      this._writer = undefined;
    }

    this._writer = textWriter;
    this._settings = settings;

    this.reset();
    this.invokeRootSequence();
  }

  /**
   * Close the writer.
   */
  override close(): void {
    if (this._writer !== undefined) {
      this._writer = undefined;
    }
    this._settings = undefined;
    this.reset();
  }

  /**
   * Write the header (declaration, embedded meta, heading lines).
   */
  writeHeader(): void {
    if (this._headerWritten) {
      throw new FtSerializationException(FtSerializationError.HeaderAlreadyWritten, 'Header already written');
    }

    if (this._settings?.declared) {
      this.writeDeclaration();
    }

    if (this._settings && this._settings.metaReferenceType === FtMetaReferenceType.Embedded) {
      this.writeEmbeddedMeta();
    }

    this.writeHeadingLines();
    this._headerWritten = true;
  }

  /**
   * Write a record.
   */
  write(): void {
    if (!this._headerWritten) {
      this.writeHeader();
    }

    this.writeRecord();
    this.finishRecord();
  }

  /**
   * Write a comment line.
   */
  writeComment(comment: string, beforeCommentChars = ''): void {
    this.writeCommentWithChar(this.lineCommentChar, comment, beforeCommentChars);
  }

  /**
   * Flush the writer.
   */
  flush(): void {
    this._writer?.flush();
  }

  /**
   * Set a field value by index.
   */
  setFieldValue(idx: number, value: unknown): void {
    this.fieldList.get(idx).asObject = value;
  }

  /**
   * Set a field value by name.
   */
  setFieldValueByName(name: string, value: unknown): void {
    const field = this.fieldList.getByName(name);
    if (!field) {
      throw new Error(`Field not found: ${name}`);
    }
    field.asObject = value;
  }

  /**
   * Set a field to null.
   */
  setNull(idx: number): void {
    this.fieldList.get(idx).setNull();
  }

  /**
   * Set a boolean field.
   */
  setBoolean(idx: number, value: boolean): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.Boolean) {
      throw new Error(`Invalid cast: field ${idx} is not boolean`);
    }
    (field as FtBooleanField).value = value;
  }

  /**
   * Set a date/time field.
   */
  setDateTime(idx: number, value: Date): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.DateTime) {
      throw new Error(`Invalid cast: field ${idx} is not datetime`);
    }
    (field as FtDateTimeField).value = value;
  }

  /**
   * Set a decimal field.
   */
  setDecimal(idx: number, value: number): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.Decimal) {
      throw new Error(`Invalid cast: field ${idx} is not decimal`);
    }
    (field as FtDecimalField).value = value;
  }

  /**
   * Set a float field.
   */
  setFloat(idx: number, value: number): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.Float) {
      throw new Error(`Invalid cast: field ${idx} is not float`);
    }
    (field as FtFloatField).value = value;
  }

  /**
   * Set an integer field.
   */
  setInteger(idx: number, value: number | bigint): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.Integer) {
      throw new Error(`Invalid cast: field ${idx} is not integer`);
    }
    (field as FtIntegerField).value = typeof value === 'bigint' ? value : BigInt(value);
  }

  /**
   * Set a string field.
   */
  setString(idx: number, value: string): void {
    const field = this.fieldList.get(idx);
    if (field.dataType !== FtDataType.String) {
      throw new Error(`Invalid cast: field ${idx} is not string`);
    }
    (field as FtStringField).value = value;
  }

  /**
   * Set multiple field values.
   */
  setValues(values: unknown[]): void {
    if (values.length > this.fieldCount) {
      throw new Error(`Values length ${values.length} exceeds field count ${this.fieldCount}`);
    }

    for (let i = 0; i < values.length; i++) {
      this.fieldList.get(i).asObject = values[i];
    }
  }

  protected override reset(): void {
    super.reset();

    this._encodeBuilder.length = 0;
    this._matchBuilder.length = 0;

    this._headerWritten = false;
    this._endOfLinePending = false;
    this._activeFieldIndex = -1;
  }

  /**
   * Internal load metadata. Override from SerializationCore.
   */
  protected override internalLoadMeta(meta: FtMeta): void {
    super.internalLoadMeta(meta);
    this._loadedMeta = meta.createCopy();
    this._endOfLineText = this.calculateEndOfLineText();
    this._lastLineEnded = this.lastLineEndedType !== FtLastLineEndedType.Never;
  }

  /**
   * Write a single heading line by index.
   * @param headingLineIndex - The 0-based index of the heading line to write.
   */
  private writeHeadingLine(headingLineIndex?: number): void {
    const lineIndex = headingLineIndex ?? 0;
    this.checkWritePendingEndOfLine();

    this.fireHeadingLineStarted(lineIndex);

    let field: FtField | undefined = undefined;
    this._activeFieldIndex = 0;
    while (this._activeFieldIndex < this.fieldList.count) {
      // field points to previous field
      if (field !== undefined && !field.fixedWidth) {
        this._writer?.write(this.delimiterChar);
      }
      field = this.fieldList.get(this._activeFieldIndex);

      this.fireFieldHeadingWriteReady(field, lineIndex);

      this.writeHeadingField(field, lineIndex);

      this._activeFieldIndex++;
    }

    this._activeFieldIndex = -1;

    this.writeOrPendEndOfLine();

    this.fireHeadingLineFinished(lineIndex);
  }

  /**
   * Write a comment line with a specific comment character.
   * @internal
   */
  private writeCommentWithChar(commentChar: string, comment: string, beforeCommentChars = ''): void {
    this.checkWritePendingEndOfLine();

    this._writer?.write(commentChar);

    if (comment !== '') {
      if (beforeCommentChars.length > 0) {
        this._writer?.write(beforeCommentChars);
      }
      this._writer?.write(comment);
    }
    this.writeOrPendEndOfLine();
  }

  private calculateEndOfLineText(): string {
    switch (this.endOfLineType) {
      case FtEndOfLineType.Char:
        return this.endOfLineChar;
      case FtEndOfLineType.CrLf:
        return SerializationCore.CarriageReturnLineFeedString;
      case FtEndOfLineType.Auto:
        switch (this.endOfLineAutoWriteType) {
          case FtEndOfLineAutoWriteType.CrLf:
            return SerializationCore.CarriageReturnLineFeedString;
          case FtEndOfLineAutoWriteType.Cr:
            return SerializationCore.CarriageReturnChar;
          case FtEndOfLineAutoWriteType.Lf:
            return SerializationCore.LineFeedChar;
          case FtEndOfLineAutoWriteType.Local:
            return '\n'; // Use platform default
          default:
            throw new FtUnreachableCaseError('SWCEOLT22110', this.endOfLineAutoWriteType);
        }
      default:
        throw new FtUnreachableCaseError('SWCEOLT22111', this.endOfLineType);
    }
  }

  private finishRecord(): void {
    if (!this.sequenceInvokationList.matches(this.previousRecordSequenceInvokationList)) {
      this._tableCount++;
      this.previousRecordSequenceInvokationList.assign(this.sequenceInvokationList);
    }
    this.invokeRootSequence();
  }

  private doesTextRequireQuotes(text: string, willBeSpacePrefixed: boolean): boolean {
    const startTrimmedText = text.trimStart();
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (startTrimmedText.length > 0 && startTrimmedText[0] === this.quoteChar) {
      return true;
    }

    if (willBeSpacePrefixed && (text.length === 0 || /\s/.test(text[0]))) {
      return true;
    }

    // When stuffed-quote encoding is active, a field containing the quote char
    // must be quoted so that embedded quotes can be doubled (§5.1.6).
    if (this.stuffedEmbeddedQuotes && text.includes(this.quoteChar)) {
      return true;
    }

    const searchChars: string[] = [this.delimiterChar];
    if (!this.allowEndOfLineCharInQuotes) {
      // No additional chars
    } else {
      switch (this.endOfLineType) {
        case FtEndOfLineType.Auto:
        case FtEndOfLineType.CrLf:
          searchChars.push(SerializationCore.CarriageReturnChar);
          searchChars.push(SerializationCore.LineFeedChar);
          break;
        case FtEndOfLineType.Char:
          searchChars.push(this.endOfLineChar);
          break;
        default:
          throw new FtUnreachableCaseError('SWCEOLT22112', this.endOfLineType);
      }
    }

    for (const searchChar of searchChars) {
      if (startTrimmedText.includes(searchChar)) {
        return true;
      }
    }
    return false;
  }

  private checkWritePendingEndOfLine(): void {
    if (this._endOfLinePending) {
      this._writer?.write(this._endOfLineText);
      this._endOfLinePending = false;
    }
  }

  private writeOrPendEndOfLine(): void {
    if (this._lastLineEnded) {
      this._writer?.write(this._endOfLineText);
    } else {
      this._endOfLinePending = true;
    }
  }

  private writeDeclaration(): void {
    if (!this._settings) {
      throw new Error('Writer settings not set');
    }

    const parameters = new FtDeclaredParameters();
    parameters.setVersion(SerializationCore.VersionMajor, SerializationCore.VersionMinor);
    const metaReferenceType = this._settings.metaReferenceType ?? FtWriterSettings.DEFAULT_META_REFERENCE_TYPE;
    const metaReference = this._settings.metaReference ?? FtWriterSettings.DEFAULT_META_REFERENCE;
    parameters.setMetaReference(metaReferenceType, metaReference);

    this.writeComment(SerializationCore.Signature + ' ' + FtDeclaredParametersFormatter.toSignatureLineText(parameters), '');
    this.writeComment(FtDeclaredParametersFormatter.toLine2Text(parameters), FtSerializationWriter.DECLARATION_LINE2_BEFORE_COMMENT_CHARS);
  }

  private writeEmbeddedMeta(): void {
    if (!this._loadedMeta) {
      throw new Error('Meta not loaded');
    }

    // Serialize meta to XML with formatting options from settings
    const xmlMetaSerialization = new FtXmlMetaSerialization();
    const xml = xmlMetaSerialization.serialize(this._loadedMeta, {
      indent: this._settings?.embeddedMetaIndent ?? FtWriterSettings.DEFAULT_EMBEDDED_META_INDENT,
      indentChars: this._settings?.embeddedMetaIndentChars ?? FtWriterSettings.DEFAULT_EMBEDDED_META_INDENT_CHARS,
      newLineOnAttributes: this._settings?.embeddedMetaNewLineOnAttributes ?? FtWriterSettings.DEFAULT_EMBEDDED_META_NEW_LINE_ON_ATTRIBUTES,
    });

    // Split into lines
    const lines = xml.split('\n');

    // Write each line as a comment (including empty lines)
    for (const line of lines) {
      this.writeComment(line, FtSerializationWriter.EMBEDDED_META_BEFORE_COMMENT_CHARS);
    }
  }

  private writeHeadingLines(): void {
    for (let i = 0; i < this.headingLineCount; i++) {
      this.writeHeadingLine(i);
    }
  }

  private writeHeadingField(field: FtField, headingLineIndex: number): void {
    let headingText = field.headings[headingLineIndex];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (headingText === undefined) {
      headingText = '';
    }

    if (field.fixedWidth) {
      const rawText = this.encodeFixedWidthHeadingText(headingText, field);
      this._writer?.write(rawText);
    } else {
      let fieldQuoted: boolean;
      switch (field.headingQuotedType) {
        case FtQuotedType.Never:
          fieldQuoted = false;
          break;
        case FtQuotedType.Always:
          fieldQuoted = true;
          break;
        case FtQuotedType.Optional:
          if (field.headingAlwaysWriteOptionalQuote) {
            fieldQuoted = true;
          } else {
            fieldQuoted = this.doesTextRequireQuotes(headingText, field.headingWritePrefixSpace);
          }
          break;
        default:
          throw new FtUnreachableCaseError('SWCQTT22113', field.headingQuotedType);
      }

      if (field.headingWritePrefixSpace) {
        this._writer?.write(SerializationCore.PrefixSpaceChar);
      }

      if (fieldQuoted) {
        this._writer?.write(this.quoteChar);
      }

      const rawText = this.encodeDelimitedValueHeadingText(headingText, fieldQuoted);
      this._writer?.write(rawText);

      if (fieldQuoted) {
        this._writer?.write(this.quoteChar);
      }
    }
  }

  private writeRecord(): void {
    this.checkWritePendingEndOfLine();

    const recordIndex = this._recordCount;
    this._recordCount++;

    this.fireRecordStarted(recordIndex);

    let field: FtField | undefined = undefined;
    this._activeFieldIndex = 0;
    while (this._activeFieldIndex < this.fieldList.count) {
      // field points to previous field
      if (field !== undefined && !field.fixedWidth) {
        this._writer?.write(this.delimiterChar);
      }
      field = this.fieldList.get(this._activeFieldIndex);
      this.writeRecordField(field, recordIndex);

      this._activeFieldIndex++;
    }

    this._activeFieldIndex = -1;

    this.writeOrPendEndOfLine();

    this.fireRecordFinished(recordIndex);
  }

  private writeRecordField(field: FtField, recordIndex: number): void {
    this.fireFieldValueWriteReady(field, recordIndex);

    if (field.fixedWidth) {
      if (field.isNull()) {
        this._writer?.write(field.definition.fixedWidthNullValueText);
      } else {
        const valueText = field.getValueText();
        const rawText = this.encodeFixedWidthValueText(valueText, field);
        this._writer?.write(rawText);
      }
    } else {
      if (field.isNull()) {
        this._writer?.write('');
      } else {
        const valueText = field.getValueText();

        let fieldQuoted: boolean;
        switch (field.valueQuotedType) {
          case FtQuotedType.Never:
            fieldQuoted = false;
            break;
          case FtQuotedType.Always:
            fieldQuoted = true;
            break;
          case FtQuotedType.Optional:
            if (field.valueAlwaysWriteOptionalQuote) {
              fieldQuoted = true;
            } else {
              fieldQuoted = this.doesTextRequireQuotes(valueText, field.valueWritePrefixSpace);
            }
            break;
          default:
            throw new FtUnreachableCaseError('SWCQTT22114', field.valueQuotedType);
        }

        if (field.valueWritePrefixSpace) {
          this._writer?.write(SerializationCore.PrefixSpaceChar);
        }

        if (fieldQuoted) {
          this._writer?.write(this.quoteChar);
        }

        const rawText = this.encodeDelimitedValueHeadingText(valueText, fieldQuoted);
        this._writer?.write(rawText);

        if (fieldQuoted) {
          this._writer?.write(this.quoteChar);
        }
      }
    }

    if (!field.constant && !field.isValueAssigned()) {
      // Field was not assigned a value, check null sequence redirects
      if (!field.isNull()) {
        throw new Error('Field value not assigned');
      }
      const ignoredfieldsAffectedFromIndex = field.checkNullSequenceRedirect();
      // fieldsAffectedFromIndex.value can be used if needed
    }
  }

  private encodeDelimitedValueHeadingText(text: string, quoted: boolean): string {
    this._encodeBuilder.length = 0;

    if (!this.substitutionsEnabled) {
      this.appendToEncodeBuilder(text, quoted);
    } else {
      this.appendToEncodeBuilder(this.applySubstitutions(text), quoted);
    }

    return this._encodeBuilder.join('');
  }

  private applySubstitutions(text: string): string {
    if (this.substitutionList.count === 0 || text.length === 0) {
      return text;
    }

    const result: string[] = [];
    let index = 0;

    while (index < text.length) {
      const match = this.substitutionList.tryGetFirstMatching(text, index);
      if (match.found) {
        result.push(this.substitutionChar);
        result.push(match.token);
        index += match.valueLength;
      } else {
        result.push(text[index]);
        index++;
      }
    }

    return result.join('');
  }

  private appendToEncodeBuilder(text: string, quoted: boolean): void {
    if (!quoted || !this.stuffedEmbeddedQuotes) {
      this._encodeBuilder.push(text);
    } else {
      for (let i = 0; i < text.length; i++) {
        const textChar = text[i];
        this._encodeBuilder.push(textChar);
        if (textChar === this.quoteChar) {
          this._encodeBuilder.push(textChar);
        }
      }
    }
  }

  private encodeFixedWidthValueText(text: string, field: FtField): string {
    const textLength = text.length;
    if (textLength === field.width) {
      return text;
    } else if (textLength < field.width) {
      return this.padFixedWidthText(
        text,
        field.definition,
        field.valuePadAlignment,
        field.valuePadCharType,
        field.valuePadChar,
        field.valueEndOfValueChar,
      );
    } else {
      return this.truncateFixedWidthText(text, field.definition, field.valueTruncateType, field.valueTruncateChar, field.valueNullChar);
    }
  }

  private encodeFixedWidthHeadingText(text: string, field: FtField): string {
    const textLength = text.length;
    if (textLength === field.width) {
      return text;
    } else if (textLength < field.width) {
      return this.padFixedWidthText(
        text,
        field.definition,
        field.headingPadAlignment,
        field.headingPadCharType,
        field.headingPadChar,
        field.headingEndOfValueChar,
      );
    } else {
      return this.truncateFixedWidthText(
        text,
        field.definition,
        field.headingTruncateType,
        field.headingTruncateChar,
        field.headingTruncateChar, // Headings should never null truncate
      );
    }
  }

  private padFixedWidthText(
    text: string,
    definition: FtFieldDefinition,
    padAlignment: FtPadAlignment,
    padCharType: FtPadCharType,
    padChar: string,
    endOfValueChar: string,
  ): string {
    let leftPad: boolean;
    switch (padAlignment) {
      case FtPadAlignment.Auto:
        leftPad = definition.autoLeftPad;
        break;
      case FtPadAlignment.Left:
        leftPad = true;
        break;
      case FtPadAlignment.Right:
        leftPad = false;
        break;
      default:
        throw new FtUnreachableCaseError('SWCPAT22115', padAlignment);
    }

    let result: string;

    switch (padCharType) {
      case FtPadCharType.Auto:
      case FtPadCharType.Specified: {
        const usePadChar = padCharType === FtPadCharType.Auto ? definition.autoPadChar : padChar;
        const padLength = definition.width - text.length;
        const padText = usePadChar.repeat(padLength);

        if (leftPad) {
          result = padText + text;
        } else {
          result = text + padText;
        }
        break;
      }
      case FtPadCharType.EndOfValue: {
        const padLength = definition.width - text.length - 1;
        const padText = padChar.repeat(padLength);
        if (leftPad) {
          result = padText + endOfValueChar + text;
        } else {
          result = text + endOfValueChar + padText;
        }
        break;
      }
      default:
        throw new FtUnreachableCaseError('SWCPCT22116', padCharType);
    }

    return result;
  }

  private truncateFixedWidthText(
    text: string,
    definition: FtFieldDefinition,
    truncateType: FtTruncateType,
    truncateChar: string,
    nullChar: string,
  ): string {
    switch (truncateType) {
      case FtTruncateType.Left:
        return text.substring(0, definition.width);
      case FtTruncateType.Right:
        return text.substring(text.length - definition.width, text.length);
      case FtTruncateType.TruncateChar:
        return truncateChar.repeat(definition.width);
      case FtTruncateType.NullChar:
        return nullChar.repeat(definition.width);
      case FtTruncateType.Exception:
        throw new FtSerializationException(FtSerializationError.FieldTruncated, `Text truncation: ${text}`);
      default:
        throw new FtUnreachableCaseError('SWCTTT22117', truncateType);
    }
  }
}
