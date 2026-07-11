import { FtField } from '../fields/instances/ft-field.js';
import { FtMetaSerialization } from '../meta-serialization/ft-meta-serialization.js';
import { FtMeta } from '../meta/ft-meta.js';
import { FtLastLineEndedType } from '../types/enums/ft-last-line-ended-type.js';
import { FtLineType } from '../types/enums/ft-line-type.js';
import { FtMetaReferenceType } from '../types/enums/ft-meta-reference-type.js';
import { FtMetaSerializationFormat } from '../types/enums/ft-meta-serialization-format.js';
import { FtReadRecordResult } from '../types/enums/ft-read-record-result.js';
import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { FtSerializationErrorCode } from '../types/errors/ft-serialization-error-code.js';
import { FtSerializationError } from '../types/errors/ft-serialization-error.js';
import { CharReader } from './char-reader.js';
import { DeclarationParser } from './declaration-parser.js';
import { EmbeddedMetaParser } from './embedded-meta-parser.js';
import { FtDeclaredParameters } from './ft-declared-parameters.js';
import { FtTextReader } from './ft-text-reader.js';
import { HeadingLineRecordParser } from './heading-line-record-parser.js';
import { LineEndedType, LineParser } from './line-parser.js';
import { SerializationCore } from './serialization-core.js';

/**
 * Reader for fielded text streams. Coordinates all parsing components.
 * @public
 */
export class FtSerializationReader extends SerializationCore {
  /**
   * Event fired when seeking through records.
   */
  onRecordSeeked: FtSerializationReader.OnRecordSeeked | undefined = undefined;

  /**
   * Event fired when needing to access file to get meta. This library is browser-compatible and does not have direct file system access, so this event allows the consumer to provide file content as text.
   */
  onRequireFileMetaAsText: FtSerializationReader.OnRequireFileMetaAsText | undefined = undefined;
  /**
   * Event fired when needing to access URL to get meta. Deferred to consumer as need to handle encoding and also must be returned synchronously
   */
  onRequireUrlMetaAsText: FtSerializationReader.OnRequireUrlMetaAsText | undefined = undefined;

  private readonly _charReader: CharReader;
  private readonly _lineParser: LineParser;
  private readonly _declarationParser: DeclarationParser;
  private readonly _declaredParameters: FtDeclaredParameters;
  private readonly _embeddedMetaParser: EmbeddedMetaParser;
  private readonly _headingLineParser: HeadingLineRecordParser;
  private readonly _recordParser: HeadingLineRecordParser;
  private readonly _lineBuilder: string[] = [];

  private _headerRead = false;
  private _declarationRead = false;
  private _embeddedMetaRead = false;
  private _headingLineReadCount = 0;
  private _headingLinesRead = false;
  private _finished = false;

  private _declared = false;
  private _metaReferenceType: FtMetaReferenceType = FtMetaReferenceType.None;
  private _metaReference = '';
  private _metaEmbedded = false;
  private _newTableStarted = false;
  private _tableStartSuspended = false;
  private _tableStartRecordPeeked = false;
  private _lineType: FtLineType = FtLineType.Blank;

  private _autoNextTable = false;

  constructor() {
    super();
    this._charReader = new CharReader();
    this._declaredParameters = new FtDeclaredParameters();
    this._lineParser = new LineParser(this._charReader, this.endOfLineType, this.endOfLineChar);
    this._declarationParser = new DeclarationParser(this._charReader, this._declaredParameters);
    this._embeddedMetaParser = new EmbeddedMetaParser();
    this._headingLineParser = new HeadingLineRecordParser(this, this._charReader, true);
    this._recordParser = new HeadingLineRecordParser(this, this._charReader, false);
  }

  /**
   * Gets or sets whether Read() will automatically continue reading records when new tables begin.
   */
  get autoNextTable(): boolean {
    return this._autoNextTable;
  }
  set autoNextTable(value: boolean) {
    this._autoNextTable = value;
  }

  /**
   * Gets whether the fielded text stream was declared (has |!Fielded Text^| signature).
   */
  get declared(): boolean {
    return this._declared;
  }

  /**
   * Gets the number of heading lines read.
   */
  get headingLineReadCount(): number {
    return this._headingLineReadCount;
  }

  /**
   * Gets whether the header has been fully read.
   */
  get headerRead(): boolean {
    return this._headerRead;
  }

  /**
   * Gets the meta reference type.
   */
  get metaReferenceType(): FtMetaReferenceType {
    return this._metaReferenceType;
  }

  /**
   * Gets the meta reference (file path or URL).
   */
  get metaReference(): string {
    return this._metaReference;
  }

  /**
   * Gets the type of the last line read.
   */
  get lineType(): FtLineType {
    return this._lineType;
  }

  /**
   * Gets the last line read as a string.
   */
  get line(): string {
    return this._lineBuilder.join('');
  }

  /**
   * Gets whether the last record read was the start of a new table.
   */
  get newTableStarted(): boolean {
    return this._newTableStarted;
  }

  /**
   * Gets the number of records read (accounting for table start peeking).
   */
  override get recordCount(): number {
    return this._tableStartRecordPeeked ? this._recordCount - 1 : this._recordCount;
  }

  /**
   * Gets the number of tables read (accounting for table start suspension).
   */
  override get tableCount(): number {
    return this._tableStartSuspended ? this._tableCount - 1 : this._tableCount;
  }

  /**
   * Gets the active field index for the current line.
   */
  get activeFieldIndex(): number {
    switch (this._lineType) {
      case FtLineType.Heading:
        return this._headingLineParser.getActiveFieldIndex();
      case FtLineType.Record:
        return this._recordParser.getActiveFieldIndex();
      default:
        return -1;
    }
  }

  /**
   * Gets the line position where extra characters started being ignored.
   */
  get ignoreExtraCharsLinePosition(): number {
    switch (this._lineType) {
      case FtLineType.Heading:
        return this._headingLineParser.getIgnoreExtraCharsLinePosition();
      case FtLineType.Record:
        return this._recordParser.getIgnoreExtraCharsLinePosition();
      default:
        return -1;
    }
  }

  /**
   * Gets whether the reader is closed.
   */
  override get isClosed(): boolean {
    return this._charReader.isClosed;
  }

  /**
   * Close the reader and reset state.
   */
  override close(): void {
    this._charReader.close();
    this.reset();
  }

  /**
   * Read the header (declaration, embedded meta, heading lines).
   */
  readHeader(): void {
    if (this._declared && !this._declarationRead) {
      this.readDeclaration();
    }

    if (this._metaReferenceType === FtMetaReferenceType.Embedded && !this._embeddedMetaRead) {
      this.readEmbeddedMeta();
    }

    if (this.headingLineCount > 0 && !this._headingLinesRead) {
      this.readHeadingLines();
    }
  }

  /**
   * Read the next line from the stream.
   * Always reads regardless of table boundaries.
   * @returns true if a line was read, false if at end of stream.
   */
  readLine(): boolean {
    let result: boolean;
    if (!this._tableStartRecordPeeked) {
      result = this.internalReadLine();
    } else {
      this._tableStartRecordPeeked = false;
      result = true;
    }

    if (result && this._tableStartSuspended && this._lineType === FtLineType.Record) {
      this._tableStartSuspended = false;
    }

    return result;
  }

  /**
   * Read the next record from the stream.
   * Respects autoNextTable setting for table boundaries.
   * @returns true if a record was read, false otherwise.
   */
  read(): boolean {
    if (this._tableStartSuspended) {
      if (!this._autoNextTable) {
        return false;
      } else {
        this._tableStartSuspended = false;
        return this.read();
      }
    } else {
      if (this._tableStartRecordPeeked) {
        this._tableStartRecordPeeked = false;
        return true;
      } else {
        let lineRead: boolean;
        do {
          lineRead = this.internalReadLine();
        } while (lineRead && this._lineType !== FtLineType.Record);

        if (!lineRead) {
          return false;
        } else {
          if (!this._newTableStarted) {
            return true;
          } else {
            if (this._autoNextTable || this.recordCount === 1) {
              return true;
            } else {
              this._tableStartSuspended = true;
              this._tableStartRecordPeeked = true;
              return false;
            }
          }
        }
      }
    }
  }

  /**
   * Read all remaining records.
   * Normally used with event handlers.
   */
  readToEnd(): void {
    while (this.read()) {
      // Loop until no more records
    }
  }

  /**
   * Read the next record and indicate table boundaries.
   * Always reads regardless of table boundaries.
   * @returns Result indicating same table, new table, or no more records.
   */
  readRecord(): FtReadRecordResult {
    if (this._tableStartSuspended) {
      this._tableStartSuspended = false;
      if (this._tableStartRecordPeeked) {
        this._tableStartRecordPeeked = false;
      } else {
        // Should never happen
        this.readRecord();
      }
      return FtReadRecordResult.NewTable;
    } else {
      let lineRead: boolean;
      do {
        lineRead = this.internalReadLine();
      } while (lineRead && this._lineType !== FtLineType.Record);

      if (!lineRead) {
        return FtReadRecordResult.NoMoreRecords;
      } else {
        if (this._newTableStarted) {
          return FtReadRecordResult.NewTable;
        } else {
          return FtReadRecordResult.SameTable;
        }
      }
    }
  }

  /**
   * Move to the next table in the stream.
   * @returns true if a new table was found, false if at end of stream.
   */
  nextTable(): boolean {
    if (this._tableStartSuspended) {
      this._tableStartSuspended = false;
      return true;
    } else {
      let result: boolean;
      do {
        result = this.read();
      } while (result && !this._newTableStarted);

      if (result) {
        this._tableStartRecordPeeked = true;
      }
      return result;
    }
  }

  /**
   * Alias for nextTable() (IDataReader compatibility).
   * @returns true if a new table was found, false if at end of stream.
   */
  nextResult(): boolean {
    return this.nextTable();
  }

  /**
   * Seek to a specific record offset.
   * @param offset - The 1-based record offset to seek to.
   * @returns true if seek succeeded, false if offset beyond end.
   */
  seek(offset: number): boolean {
    let result = true;
    this.setSeeking(true);
    try {
      for (let i = 0; i < offset - 1; i++) {
        if (this.readRecord() !== FtReadRecordResult.NoMoreRecords) {
          if (this.onRecordSeeked) {
            this.onRecordSeeked();
          }
        } else {
          result = false;
          break;
        }
      }
    } finally {
      this.setSeeking(false);
    }

    if (result) {
      result = this.readRecord() !== FtReadRecordResult.NoMoreRecords;
    }

    return result;
  }

  /**
   * Seek to the end of the stream.
   */
  seekEnd(): void {
    this.setSeeking(true);
    try {
      while (this.readRecord() !== FtReadRecordResult.NoMoreRecords) {
        if (this.onRecordSeeked) {
          this.onRecordSeeked();
        }
      }
    } finally {
      this.setSeeking(false);
    }
  }

  /**
   * Get a field object by index.
   */
  getField(idx: number): FtField {
    return this.fieldList.get(idx);
  }

  /**
   * Get a field object by name.
   */
  getFieldByName(name: string): FtField | undefined {
    return this.fieldList.getByName(name);
  }

  /**
   * Get a field value by index. Returns `null` if the field value is null.
   */
  getFieldValue(idx: number): unknown {
    return this.fieldList.get(idx).asNullableUnknown;
  }

  /**
   * Get a field value by name. Returns `null` if the field value is null.
   */
  getFieldValueByName(name: string): unknown {
    const field = this.fieldList.getByName(name);
    if (!field) {
      throw new Error(`Field not found: ${name}`);
    }
    return field.asNullableUnknown;
  }

  /**
   * Load metadata from a pre-parsed FtMeta object.
   * @param meta - The metadata to load.
   */
  loadMetaFromObject(meta: FtMeta): void {
    this.loadMeta(meta);
  }

  protected override reset(): void {
    super.reset();

    this._declarationRead = false;
    this._embeddedMetaRead = false;
    this._headingLineReadCount = 0;
    this._headingLinesRead = false;
    this._headerRead = !this._declared && this.headingLineCount === 0;
    this._finished = false;

    this._declaredParameters.clear();
    this._lineParser.reset();
    this._embeddedMetaParser.reset();
    this._metaReferenceType = FtMetaReferenceType.None;
    this._metaReference = '';
    this._metaEmbedded = false;
    this._newTableStarted = false;
    this._tableStartSuspended = false;
    this._tableStartRecordPeeked = false;
    this._lineType = FtLineType.Blank;

    this._lineBuilder.length = 0;
  }

  /**
   * Open the reader with a TextReader.
   * @param textReader - The text reader to read from.
   * @param immediatelyReadHeader - Whether to immediately read the header.
   */
  protected open(textReader: FtTextReader, immediatelyReadHeader: boolean): void {
    this._charReader.setTextReader(textReader);
    const signature = this._charReader.peekSignature();
    this._declared = signature !== undefined;
    if (this._declared && signature !== undefined) {
      this._declarationParser.signature = signature;
    }

    this.reset();

    if (!this._headerRead && immediatelyReadHeader) {
      this.readHeader();
    }
  }

  protected getFileMetaAsText(fileMetaReference: string): FtSerializationReader.FileMetaAsTextResult | string {
    // Descendants can override this method. Clients can subscribe to onRequireFileMetaAsText event
    if (!this.onRequireFileMetaAsText) {
      throw new FtSerializationError(
        FtSerializationErrorCode.MetaReferenceFileNoHandler,
        'Meta reference is file but no handler provided to retrieve file content',
      );
    } else {
      return this.onRequireFileMetaAsText(fileMetaReference);
    }
  }

  protected getUrlMetaAsText(urlMetaReference: string): FtSerializationReader.FileMetaAsTextResult | string {
    // Descendants can override this method. Clients can subscribe to onRequireUrlMetaAsText event
    if (!this.onRequireUrlMetaAsText) {
      throw new FtSerializationError(
        FtSerializationErrorCode.MetaReferenceUrlNoHandler,
        'Meta reference is URL but no handler provided to retrieve URL content',
      );
    } else {
      return this.onRequireUrlMetaAsText(urlMetaReference);
    }
  }

  private internalReadLine(): boolean {
    let result = true;
    do {
      const readCharAsInt = this._charReader.read();
      if (readCharAsInt !== FtTextReader.EofReadResult) {
        this.parseChar(String.fromCharCode(readCharAsInt));
      } else {
        result = this.finish();
      }
    } while (this._lineParser.inLine);

    return result;
  }

  private parseChar(aChar: string): void {
    if (!this._lineParser.inLine) {
      // New line starting
      this._lineBuilder.length = 0;

      this._lineType = this.calculateStartLineType(aChar);
      switch (this._lineType) {
        case FtLineType.Signature:
          this._declarationParser.startLine();
          this.setLineCommentChar(aChar);
          break;
        case FtLineType.Declaration2:
          this._declarationParser.startLine();
          break;
        case FtLineType.Comment:
          if (!this._headerRead) {
            if (this._metaEmbedded && !this._embeddedMetaRead) {
              this._embeddedMetaParser.startLine();
            }
          }
          break;
        case FtLineType.EmbeddedMeta:
          this._embeddedMetaParser.startLine();
          break;
        case FtLineType.Heading: {
          this.invokeRootSequence();
          const headingLineReadIndex = this._headingLineReadCount++;
          this._headingLineParser.start(headingLineReadIndex);
          this.fireHeadingLineStarted(headingLineReadIndex);
          break;
        }
      }
    }

    const endOfLineToBeEmbedded = this._recordParser.isEndOfLineToBeEmbedded();
    const lineEndedType = this._lineParser.parseChar(aChar, endOfLineToBeEmbedded);

    if (lineEndedType !== LineEndedType.Continued) {
      const lineEndInitiated = lineEndedType === LineEndedType.Initiated;

      if (!lineEndInitiated) {
        this._lineBuilder.push(aChar);
      }

      switch (this._lineType) {
        case FtLineType.Signature:
          if (!lineEndInitiated) {
            this._declarationParser.parseSignatureLineChar(aChar);
          } else {
            this._declarationParser.finishSignatureLine();
          }
          break;

        case FtLineType.Declaration2:
          if (!lineEndInitiated) {
            this._declarationParser.parseDeclaration2LineChar(aChar);
          } else {
            this.finishDeclaration();
          }
          break;

        case FtLineType.Comment:
          if (!this._headerRead) {
            if (this._metaEmbedded && !this._embeddedMetaRead) {
              if (!lineEndInitiated) {
                const embeddedMetaPresent = this._embeddedMetaParser.parseNotYetDetectedChar(aChar);
                if (embeddedMetaPresent) {
                  this._lineType = FtLineType.EmbeddedMeta;
                }
              }
            }
          }
          break;

        case FtLineType.EmbeddedMeta:
          if (!lineEndInitiated) {
            this._embeddedMetaParser.parseChar(aChar);
          } else {
            this._embeddedMetaParser.appendLine();
            if (this._embeddedMetaParser.ready) {
              this.finishEmbeddedMeta();
            }
          }
          break;

        case FtLineType.Blank:
          if (!this._headerRead) {
            if (!lineEndInitiated) {
              // Must be a heading line
              this._lineType = FtLineType.Heading;
              if (this._metaEmbedded && !this._embeddedMetaRead) {
                throw new FtSerializationError(FtSerializationErrorCode.EmbeddedMetaNotFound, 'Embedded meta line not blank or comment');
              } else {
                if (!(this.headingLineCount > 0 && !this._headingLinesRead)) {
                  throw new Error('Unexpected heading line state');
                }
                this.invokeRootSequence();
                const headingLineReadIndex = this._headingLineReadCount++;
                this._headingLineParser.start(headingLineReadIndex);
                this.fireHeadingLineStarted(headingLineReadIndex);
                this._headingLineParser.parseChar(aChar);
              }
            }
          } else {
            if (!lineEndInitiated) {
              // Is actually a record line
              this._lineType = FtLineType.Record;
              if (this._newTableStarted) {
                // Copy previous invokation list
                this.previousRecordSequenceInvokationList.assign(this.sequenceInvokationList);
                this._newTableStarted = false;
              }
              this.invokeRootSequence();
              const recordIndex = this._recordCount++;
              this._recordParser.start(recordIndex);
              this.fireRecordStarted(recordIndex);
              this._recordParser.parseChar(aChar);
            } else {
              if (!this.ignoreBlankLines) {
                throw new FtSerializationError(FtSerializationErrorCode.RecordNotEnoughFields, 'Blank records not allowed');
              }
            }
          }
          break;

        case FtLineType.Heading:
          if (!lineEndInitiated) {
            this._headingLineParser.parseChar(aChar);
          } else {
            this.finishHeadingLine();
          }
          break;

        case FtLineType.Record:
          if (!lineEndInitiated) {
            this._recordParser.parseChar(aChar);
          } else {
            this.finishRecord();
          }
          break;

        default:
          throw new FtUnreachableCaseError('SRPC93356', this._lineType);
      }
    }
  }

  private calculateStartLineType(startChar: string): FtLineType {
    if (this._headerRead) {
      return startChar === this.lineCommentChar ? FtLineType.Comment : FtLineType.Blank;
    } else {
      if (this._declared && this._lineParser.lineCount < 2) {
        // Declaration Line Type
        switch (this._lineParser.lineCount) {
          case 0:
            return FtLineType.Signature;
          case 1:
            return FtLineType.Declaration2;
          default:
            throw new Error(`Unexpected declaration line count: ${this._lineParser.lineCount}`);
        }
      } else {
        if (this._metaEmbedded && !this._embeddedMetaRead) {
          // Expecting or in Embedded Meta lines
          if (this._lineType === FtLineType.EmbeddedMeta) {
            return FtLineType.EmbeddedMeta;
          } else {
            if (startChar === this.lineCommentChar) {
              return FtLineType.Comment;
            } else {
              return FtLineType.Blank;
            }
          }
        } else {
          // If Declaration done or not present and Embedded Meta done or not present,
          // then only reason still in header is to read heading lines.
          if (!(this.headingLineCount > 0 && !this._headingLinesRead)) {
            throw new Error('Unexpected header state');
          }

          if (this._lineType === FtLineType.Heading) {
            return FtLineType.Heading;
          } else {
            if (startChar === this.lineCommentChar) {
              return FtLineType.Comment;
            } else {
              return FtLineType.Blank; // assume this - may also be first heading line
            }
          }
        }
      }
    }
  }

  private finish(): boolean {
    let result: boolean;

    if (this._finished) {
      result = false;
    } else {
      if (this._lineParser.inLine) {
        this.finishLastLine();

        if (this.lastLineEndedType === FtLastLineEndedType.Always) {
          throw new FtSerializationError(FtSerializationErrorCode.LastLineEndedError, 'Always ended but in line');
        } else {
          this._lineParser.exitLine();
          result = true;
        }
      } else {
        if (this.lastLineEndedType !== FtLastLineEndedType.Never) {
          result = false;
        } else {
          if (!this.ignoreBlankLines) {
            throw new FtSerializationError(FtSerializationErrorCode.LastLineEndedError, 'Never ended but out of line');
          } else {
            // Since last line cannot be ended, there is another ignored blank line

            // Throw exception if blank line not allowed
            switch (this._lineType) {
              case FtLineType.Signature:
                throw new FtSerializationError(FtSerializationErrorCode.IncompleteDeclaration, 'Declaration missing second line');
              case FtLineType.Heading:
                if (!this._headingLinesRead) {
                  throw new FtSerializationError(FtSerializationErrorCode.InsufficientHeadingLines, '');
                }
                break;
            }

            // Set up blank line
            this._lineParser.addBlankLine();
            this._lineType = FtLineType.Blank;
            result = true;
          }
        }
      }

      this._finished = true;
    }

    if (!result) {
      this._newTableStarted = false;
      this.checkCompleteness();
    }

    return result;
  }

  private finishLastLine(): void {
    switch (this._lineType) {
      case FtLineType.Signature:
        this._declarationParser.finishSignatureLine();
        break;

      case FtLineType.Declaration2:
        this.finishDeclaration();
        break;

      case FtLineType.Comment:
        if (!this._headerRead) {
          if (this._metaEmbedded && !this._embeddedMetaRead) {
            throw new FtSerializationError(FtSerializationErrorCode.EmbeddedMetaNotFound, 'End of file encountered');
          }
        }
        break;

      case FtLineType.EmbeddedMeta:
        if (this._embeddedMetaParser.ready) {
          this.finishEmbeddedMeta();
        } else {
          throw new FtSerializationError(FtSerializationErrorCode.IncompleteEmbeddedMeta, 'End of file encountered');
        }
        break;

      case FtLineType.Blank:
        break; // nothing to do

      case FtLineType.Heading:
        this.finishHeadingLine();
        break;

      case FtLineType.Record:
        this.finishRecord();
        break;

      default:
        throw new FtUnreachableCaseError('SRFLL93357', this._lineType);
    }
  }

  private readDeclaration(): void {
    if (!this._declared) {
      throw new Error('ReadDeclaration called but not declared');
    }

    while (!this._declarationRead) {
      if (!this.internalReadLine()) {
        break;
      }
    }
  }

  private readEmbeddedMeta(): void {
    if (this._metaReferenceType !== FtMetaReferenceType.Embedded) {
      throw new Error('ReadEmbeddedMeta called but meta not embedded');
    }

    while (!this._embeddedMetaRead) {
      if (!this.internalReadLine()) {
        break;
      }
    }
  }

  private readHeadingLines(): void {
    if (!(this.headingLineCount > 0)) {
      throw new Error('ReadHeadingLines called but no headings');
    }

    while (!this._headingLinesRead) {
      if (!this.internalReadLine()) {
        break;
      }
    }
  }

  private finishDeclaration(): void {
    this._declarationParser.finish();

    const metaRefResult = this._declaredParameters.getMetaReference();
    this._metaReferenceType = metaRefResult.type;
    this._metaReference = metaRefResult.reference;

    switch (this._metaReferenceType) {
      case FtMetaReferenceType.Embedded:
        this._metaEmbedded = true;
        break;

      case FtMetaReferenceType.File: {
        const fileMetaAsText = this.getFileMetaAsText(this._metaReference);
        if (typeof fileMetaAsText === 'string') {
          this.loadMetaFromText(fileMetaAsText, FtMetaSerializationFormat.XML);
        } else {
          this.loadMetaFromText(fileMetaAsText.content, fileMetaAsText.format);
        }
        break;
      }
      case FtMetaReferenceType.Url: {
        const fileMetaAsText = this.getUrlMetaAsText(this._metaReference);
        if (typeof fileMetaAsText === 'string') {
          this.loadMetaFromText(fileMetaAsText, FtMetaSerializationFormat.XML);
        } else {
          this.loadMetaFromText(fileMetaAsText.content, fileMetaAsText.format);
        }
        break;
      }
    }

    this._declarationRead = true;

    if (!this._metaEmbedded && this.headingLineCount === 0) {
      this._headerRead = true;
    }
  }

  private finishEmbeddedMeta(): void {
    const metaAsString = this._embeddedMetaParser.takeMetaAsString();
    this.loadMetaFromText(metaAsString, FtMetaSerializationFormat.XML); // Currently only XML supported for embedded meta
    this._embeddedMetaRead = true;

    if (this.headingLineCount === 0) {
      this._headerRead = true;
    }
  }

  private finishHeadingLine(): void {
    this._headingLineParser.finish();
    this.fireHeadingLineFinished(this._headingLineReadCount - 1);

    if (this._headingLineReadCount >= this.headingLineCount) {
      this._headingLinesRead = true;
      this._headerRead = true;
    }
  }

  private finishRecord(): void {
    this._recordParser.finish();
    this.fireRecordFinished(this._recordCount - 1);

    if (!this.sequenceInvokationList.matches(this.previousRecordSequenceInvokationList)) {
      this._tableCount++;
      this._newTableStarted = true;
    }
  }

  private checkCompleteness(): void {
    if (!this._headerRead) {
      if (this._declared && !this._declarationRead) {
        throw new FtSerializationError(FtSerializationErrorCode.IncompleteDeclaration, '');
      } else {
        if (this._metaEmbedded && !this._embeddedMetaRead) {
          throw new FtSerializationError(FtSerializationErrorCode.IncompleteEmbeddedMeta, '');
        } else {
          if (this.headingLineCount > 0 && !this._headingLinesRead) {
            throw new FtSerializationError(FtSerializationErrorCode.InsufficientHeadingLines, this._headingLineReadCount.toString());
          }
        }
      }
    }
  }

  private loadMetaFromText(metaAsString: string, format: FtMetaSerializationFormat): void {
    const meta = FtMetaSerialization.deserialize(metaAsString, undefined, format);
    this.loadMeta(meta);
  }
}

/** @public */
export namespace FtSerializationReader {
  export type OnRecordSeeked = (this: void) => void;
  export type OnRequireFileMetaAsText = (this: void, filePath: string) => FtSerializationReader.FileMetaAsTextResult | string;
  export type OnRequireUrlMetaAsText = (this: void, url: string) => FtSerializationReader.UrlMetaAsTextResult | string;

  export interface FileMetaAsTextResult {
    content: string;
    format: FtMetaSerializationFormat;
  }

  export interface UrlMetaAsTextResult {
    content: string;
    format: FtMetaSerializationFormat;
  }
}
