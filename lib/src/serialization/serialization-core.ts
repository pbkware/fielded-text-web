import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtFieldDefinitionList } from '../fields/definitions/ft-field-definition-list.js';
import { FtFieldList } from '../fields/instances/ft-field-list.js';
import { FtField } from '../fields/instances/ft-field.js';
import { FtMetaDefaults } from '../meta/ft-meta-defaults.js';
import { FtMeta } from '../meta/ft-meta.js';
import { FtSequenceInvokationList } from '../sequences/core/ft-sequence-invokation-list.js';
import { FtSequenceInvokation } from '../sequences/core/ft-sequence-invokation.js';
import { FtSequenceList } from '../sequences/core/ft-sequence-list.js';
import { FtSequence } from '../sequences/core/ft-sequence.js';
import { FtSubstitutionList } from '../substitutions/ft-substitution-list.js';
import { FtEndOfLineAutoWriteType } from '../types/enums/ft-end-of-line-auto-write-type.js';
import { FtEndOfLineType } from '../types/enums/ft-end-of-line-type.js';
import { FtHeadingConstraint } from '../types/enums/ft-heading-constraint.js';
import { FtLastLineEndedType } from '../types/enums/ft-last-line-ended-type.js';
import { FtPadAlignment } from '../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../types/enums/ft-quoted-type.js';
import { FtSequenceInvokationDelay } from '../types/enums/ft-sequence-invokation-delay.js';
import { FtSubstitutionType } from '../types/enums/ft-substitution-type.js';
import { FtTruncateType } from '../types/enums/ft-truncate-type.js';
import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { FtFieldHeadingReadyEventArgs } from '../types/events/ft-field-heading-ready-event-args.js';
import { FtFieldValueReadyEventArgs } from '../types/events/ft-field-value-ready-event-args.js';
import { FtHeadingLineFinishedEventArgs } from '../types/events/ft-heading-line-finished-event-args.js';
import { FtHeadingLineStartedEventArgs } from '../types/events/ft-heading-line-started-event-args.js';
import { FtRecordFinishedEventArgs } from '../types/events/ft-record-finished-event-args.js';
import { FtRecordStartedEventArgs } from '../types/events/ft-record-started-event-args.js';
import { FtSequenceRedirectedEventArgs } from '../types/events/ft-sequence-redirected-event-args.js';
import { CharReader } from './char-reader.js';

/**
 * Base class for serialization (reading/writing).
 * Manages configuration, field lists, sequences, and events.
 * @public
 */
export abstract class SerializationCore {
  static readonly VersionMajor = 1;
  static readonly VersionMinor = 1;
  static readonly PrefixSpaceChar = ' ';

  protected static readonly Signature = CharReader.Signature;
  protected static readonly VersionLabel = 'Version';
  protected static readonly VersionSeparator = '.';
  protected static readonly CarriageReturnChar = CharReader.CarriageReturnChar;
  protected static readonly LineFeedChar = CharReader.LineFeedChar;
  protected static readonly CarriageReturnLineFeedString = CharReader.CarriageReturnLineFeedString;

  // Events
  onFieldHeadingReadReady?: (args: FtFieldHeadingReadyEventArgs) => void;
  onFieldHeadingWriteReady?: (args: FtFieldHeadingReadyEventArgs) => void;
  onFieldValueReadReady?: (args: FtFieldValueReadyEventArgs) => void;
  onFieldValueWriteReady?: (args: FtFieldValueReadyEventArgs) => void;
  onHeadingLineStarted?: (args: FtHeadingLineStartedEventArgs) => void;
  onHeadingLineFinished?: (args: FtHeadingLineFinishedEventArgs) => void;
  onRecordStarted?: (args: FtRecordStartedEventArgs) => void;
  onRecordFinished?: (args: FtRecordFinishedEventArgs) => void;
  onSequenceRedirected?: (args: FtSequenceRedirectedEventArgs) => void;

  protected _recordCount = 0;
  protected _tableCount = 0;

  private _fieldDefinitionList = new FtFieldDefinitionList();
  private _fieldList = new FtFieldList();
  private _substitutionList = new FtSubstitutionList();
  private _sequenceList = new FtSequenceList();

  private _culture: DotNetLocaleSettings = DotNetLocaleSettings.invariant;
  private _endOfLineType: FtEndOfLineType = FtMetaDefaults.Root.EndOfLineType;
  private _endOfLineChar = FtMetaDefaults.Root.EndOfLineChar;
  private _endOfLineAutoWriteType: FtEndOfLineAutoWriteType = FtMetaDefaults.Root.EndOfLineAutoWriteType;
  private _lastLineEndedType: FtLastLineEndedType = FtMetaDefaults.Root.LastLineEndedType;
  private _quoteChar = FtMetaDefaults.Root.QuoteChar;
  private _delimiterChar = FtMetaDefaults.Root.DelimiterChar;
  private _lineCommentChar = FtMetaDefaults.Root.LineCommentChar;
  private _allowEndOfLineCharInQuotes = FtMetaDefaults.Root.AllowEndOfLineCharInQuotes;
  private _ignoreBlankLines = FtMetaDefaults.Root.IgnoreBlankLines;
  private _ignoreExtraChars = FtMetaDefaults.Root.IgnoreExtraChars;
  private _allowIncompleteRecords = FtMetaDefaults.Root.AllowIncompleteRecords;
  private _stuffedEmbeddedQuotes = FtMetaDefaults.Root.StuffedEmbeddedQuotes;
  private _substitutionsEnabled = FtMetaDefaults.Root.SubstitutionsEnabled;
  private _substitutionChar = FtMetaDefaults.Root.SubstitutionChar;
  private _headingLineCount = FtMetaDefaults.Root.HeadingLineCount;
  private _mainHeadingLineIndex = FtMetaDefaults.Root.MainHeadingLineIndex;
  private _headingConstraint: FtHeadingConstraint = FtMetaDefaults.Root.HeadingConstraint;
  private _headingQuotedType: FtQuotedType = FtMetaDefaults.Root.HeadingQuotedType;
  private _headingAlwaysWriteOptionalQuote = FtMetaDefaults.Root.HeadingAlwaysWriteOptionalQuote;
  private _headingWritePrefixSpace = FtMetaDefaults.Root.HeadingWritePrefixSpace;
  private _headingPadAlignment: FtPadAlignment = FtMetaDefaults.Root.HeadingPadAlignment;
  private _headingPadCharType: FtPadCharType = FtMetaDefaults.Root.HeadingPadCharType;
  private _headingPadChar = FtMetaDefaults.Root.HeadingPadChar;
  private _headingTruncateType: FtTruncateType = FtMetaDefaults.Root.HeadingTruncateType;
  private _headingTruncateChar = FtMetaDefaults.Root.HeadingTruncateChar;
  private _headingEndOfValueChar = FtMetaDefaults.Root.HeadingEndOfValueChar;

  private _rootSequence: FtSequence | undefined = undefined;
  private _rootFieldCount = 0;

  // reset members
  private _sequenceInvokationList = new FtSequenceInvokationList();
  private _previousRecordSequenceInvokationList = new FtSequenceInvokationList();
  private _rootSequenceInvokation: FtSequenceInvokation | undefined = undefined;
  private _seeking = false;

  protected constructor() {
    this._sequenceInvokationList.sequenceRedirectEvent = (field, sequence, delay) => this.handleSequenceRedirectEvent(field, sequence, delay);
  }

  // Property getters
  get fieldDefinitionList(): FtFieldDefinitionList {
    return this._fieldDefinitionList;
  }
  get fieldList(): FtFieldList {
    return this._fieldList;
  }
  get substitutionList(): FtSubstitutionList {
    return this._substitutionList;
  }
  get sequenceList(): FtSequenceList {
    return this._sequenceList;
  }
  get sequenceInvokationList(): FtSequenceInvokationList {
    return this._sequenceInvokationList;
  }
  get previousRecordSequenceInvokationList(): FtSequenceInvokationList {
    return this._previousRecordSequenceInvokationList;
  }
  get rootSequence(): FtSequence | undefined {
    return this._rootSequence;
  }
  get rootFieldCount(): number {
    return this._rootFieldCount;
  }
  get rootSequenceInvokation(): FtSequenceInvokation | undefined {
    return this._rootSequenceInvokation;
  }
  get seeking(): boolean {
    return this._seeking;
  }
  get recordCount(): number {
    return this._recordCount;
  }
  get tableCount(): number {
    return this._tableCount;
  }

  // Configuration getters
  get culture(): DotNetLocaleSettings {
    return this._culture;
  }
  get endOfLineType(): FtEndOfLineType {
    return this._endOfLineType;
  }
  get endOfLineChar(): string {
    return this._endOfLineChar;
  }
  get endOfLineAutoWriteType(): FtEndOfLineAutoWriteType {
    return this._endOfLineAutoWriteType;
  }
  get lastLineEndedType(): FtLastLineEndedType {
    return this._lastLineEndedType;
  }
  get quoteChar(): string {
    return this._quoteChar;
  }
  get delimiterChar(): string {
    return this._delimiterChar;
  }
  get lineCommentChar(): string {
    return this._lineCommentChar;
  }
  get allowEndOfLineCharInQuotes(): boolean {
    return this._allowEndOfLineCharInQuotes;
  }
  get ignoreBlankLines(): boolean {
    return this._ignoreBlankLines;
  }
  get ignoreExtraChars(): boolean {
    return this._ignoreExtraChars;
  }
  get allowIncompleteRecords(): boolean {
    return this._allowIncompleteRecords;
  }
  get stuffedEmbeddedQuotes(): boolean {
    return this._stuffedEmbeddedQuotes;
  }
  get substitutionsEnabled(): boolean {
    return this._substitutionsEnabled;
  }
  get substitutionChar(): string {
    return this._substitutionChar;
  }
  get headingLineCount(): number {
    return this._headingLineCount;
  }
  get mainHeadingLineIndex(): number {
    return this._mainHeadingLineIndex;
  }
  get headingConstraint(): FtHeadingConstraint {
    return this._headingConstraint;
  }
  get headingQuotedType(): FtQuotedType {
    return this._headingQuotedType;
  }
  get headingAlwaysWriteOptionalQuote(): boolean {
    return this._headingAlwaysWriteOptionalQuote;
  }
  get headingWritePrefixSpace(): boolean {
    return this._headingWritePrefixSpace;
  }
  get headingPadAlignment(): FtPadAlignment {
    return this._headingPadAlignment;
  }
  get headingPadCharType(): FtPadCharType {
    return this._headingPadCharType;
  }
  get headingPadChar(): string {
    return this._headingPadChar;
  }
  get headingTruncateType(): FtTruncateType {
    return this._headingTruncateType;
  }
  get headingTruncateChar(): string {
    return this._headingTruncateChar;
  }
  get headingEndOfValueChar(): string {
    return this._headingEndOfValueChar;
  }

  // IDataReader-like interface
  get fieldCount(): number {
    return this._fieldList.count;
  }

  get depth(): number {
    return this._sequenceInvokationList.count;
  }

  abstract get isClosed(): boolean;

  getName(idx: number): string {
    return this._fieldList.get(idx).name;
  }

  getOrdinal(name: string): number {
    const result = this._fieldList.indexOfName(name);
    if (result >= 0) {
      return result;
    } else {
      throw new Error(`Field not found: ${name}`);
    }
  }

  getValueType(idx: number): string {
    return this._fieldList.get(idx).valueType;
  }

  isDBNull(idx: number): boolean {
    return this._fieldList.get(idx).isNull();
  }

  tryGetSubstitutionValue(token: string): { found: boolean; value: string } {
    return this._substitutionList.tryGetValue(token);
  }

  /**
   * Load configuration from FtMeta.
   */
  loadMeta(meta: FtMeta): void {
    this.internalLoadMeta(meta);
  }

  /**
   * Invoke the root sequence to begin reading/writing.
   * @internal For testing purposes, can be called to initialize field list.
   */
  invokeRootSequence(): void {
    if (!this._rootSequence) {
      throw new Error('No root sequence');
    }

    switch (this._sequenceInvokationList.count) {
      case 0:
        // First invokation
        if (this._fieldList.count !== 0) {
          throw new Error('FieldList.Count > 0 when no sequence invokations');
        }
        this._rootSequenceInvokation = this._sequenceInvokationList.new(this._rootSequence, 0);
        this._rootSequenceInvokation.sequenceRedirectEvent = (field, seq, delay) => this.handleSequenceRedirectEvent(field, seq, delay);

        for (let i = 0; i < this._rootSequenceInvokation.fieldCount; i++) {
          this._fieldList.add(this._rootSequenceInvokation.getField(i));
        }
        break;

      case 1:
        // Root is only invoked sequence, just reset values
        this.resetAllFieldValues();
        break;

      default: {
        // Multiple sequences, need to handle redirections
        const secondInvokation = this._sequenceInvokationList.get(1);
        this._fieldList.trim(secondInvokation.startFieldIndex);
        const fieldsWereSidelined = secondInvokation.startFieldIndex !== this._rootFieldCount;

        this._sequenceInvokationList.predictTrim(1);
        this.resetAllFieldValues();

        if (fieldsWereSidelined && this._rootSequenceInvokation) {
          // Root sequence was redirected before its end. Some fields will be sidelined
          for (let i = this._rootSequenceInvokation.fieldsSidelinedFromIndex; i < this._rootSequenceInvokation.fieldCount; i++) {
            this._fieldList.add(this._rootSequenceInvokation.getField(i));
          }
          this._rootSequenceInvokation.unsidelineFields();
        }
        break;
      }
    }
  }

  // Event triggers
  /** @internal */
  fireFieldHeadingReadReady(field: FtField, lineIndex: number): void {
    if (this.onFieldHeadingReadReady) {
      this.onFieldHeadingReadReady({ field, lineIndex });
    }
  }

  /** @internal */
  fireFieldValueReadReady(field: FtField, recordIndex: number): void {
    if (this.onFieldValueReadReady) {
      this.onFieldValueReadReady({ field, recordIndex });
    }
  }

  protected internalLoadMeta(meta: FtMeta): void {
    this._sequenceList.clear();
    this._substitutionList.clear();
    this._fieldList.clear();
    this._fieldDefinitionList.clear();

    const validation = meta.validate();
    if (!validation.valid) {
      throw new Error(`Invalid meta: ${validation.errorMessage}`);
    }

    // Copy all configuration from meta
    this._culture = meta.culture;
    this._endOfLineType = meta.endOfLineType;
    this._endOfLineChar = meta.endOfLineChar;
    this._endOfLineAutoWriteType = meta.endOfLineAutoWriteType;
    this._lastLineEndedType = meta.lastLineEndedType;
    this._quoteChar = meta.quoteChar;
    this._delimiterChar = meta.delimiterChar;
    this._lineCommentChar = meta.lineCommentChar;
    this._allowEndOfLineCharInQuotes = meta.allowEndOfLineCharInQuotes;
    this._ignoreBlankLines = meta.ignoreBlankLines;
    this._ignoreExtraChars = meta.ignoreExtraChars;
    this._allowIncompleteRecords = meta.allowIncompleteRecords;
    this._stuffedEmbeddedQuotes = meta.stuffedEmbeddedQuotes;
    this._substitutionsEnabled = meta.substitutionsEnabled;
    this._substitutionChar = meta.substitutionChar;
    this._headingLineCount = meta.headingLineCount;
    this._mainHeadingLineIndex = meta.mainHeadingLineIndex;
    this._headingConstraint = meta.headingConstraint;
    this._headingQuotedType = meta.headingQuotedType;
    this._headingAlwaysWriteOptionalQuote = meta.headingAlwaysWriteOptionalQuote;
    this._headingWritePrefixSpace = meta.headingWritePrefixSpace;
    this._headingPadAlignment = meta.headingPadAlignment;
    this._headingPadCharType = meta.headingPadCharType;
    this._headingPadChar = meta.headingPadChar;
    this._headingTruncateType = meta.headingTruncateType;
    this._headingTruncateChar = meta.headingTruncateChar;
    this._headingEndOfValueChar = meta.headingEndOfValueChar;

    // Load field definitions
    for (let i = 0; i < meta.fieldList.count; i++) {
      const fieldDefinition = this._fieldDefinitionList.new(meta.fieldList.get(i).dataType);
      fieldDefinition.loadMeta(meta.fieldList.get(i), this._culture, this._mainHeadingLineIndex);
    }

    // Load substitutions
    for (let i = 0; i < meta.substitutionList.count; i++) {
      const metaSubstitution = meta.substitutionList.get(i);
      const substitution = this._substitutionList.new();
      substitution.token = metaSubstitution.token;

      switch (metaSubstitution.type) {
        case FtSubstitutionType.String:
          substitution.value = metaSubstitution.value;
          break;
        case FtSubstitutionType.AutoEndOfLine:
          substitution.value = this.calculateAutoEndOfLineSubstitutionValue();
          break;
        default:
          substitution.value = metaSubstitution.value;
          break;
      }
    }

    // Load sequences
    if (meta.sequenceList.count === 0) {
      // Create a root sequence with all field definitions
      this._rootSequence = this._sequenceList.new();
      for (let i = 0; i < this._fieldDefinitionList.count; i++) {
        const item = this._rootSequence.itemList.new();
        item.setFieldDefinition(this._fieldDefinitionList.get(i));
      }
      this._rootSequence.setRoot(true);
    } else {
      this._rootSequence = undefined;
      for (let i = 0; i < meta.sequenceList.count; i++) {
        const sequence = this._sequenceList.new();
        sequence.loadMeta(meta.sequenceList.get(i), meta.fieldList, this._fieldDefinitionList);

        if (sequence.root) {
          this._rootSequence = sequence;
        }
      }

      if (this._rootSequence === undefined && this._sequenceList.count > 0) {
        this._rootSequence = this._sequenceList.get(0);
        this._rootSequence.setRoot(true);
      }

      // Must load redirects after ALL sequences are loaded
      for (let i = 0; i < this._sequenceList.count; i++) {
        this._sequenceList.get(i).loadMetaSequenceRedirects(meta.sequenceList.get(i), meta.sequenceList, this._sequenceList);
      }
    }

    if (this._rootSequence === undefined) {
      throw new Error('No root sequence defined');
    }

    this._rootFieldCount = this._rootSequence.itemList.count;
  }

  protected setSeeking(value: boolean): void {
    this._seeking = value;
  }

  protected setLineCommentChar(aChar: string): void {
    this._lineCommentChar = aChar;
  }

  protected redirect(redirectingField: FtField, invokedSequence: FtSequence, invokationDelay: FtSequenceInvokationDelay): number {
    const redirectingInvokation = redirectingField.sequenceInvokation;
    const newInvokationIndex = redirectingInvokation.index + 1;

    let fieldsAffectedFromIndex: number;
    let newInvokationStartFieldIndex: number;
    switch (invokationDelay) {
      case FtSequenceInvokationDelay.AfterField:
        newInvokationStartFieldIndex = redirectingField.index + 1;
        break;
      case FtSequenceInvokationDelay.AfterSequence:
        newInvokationStartFieldIndex = redirectingInvokation.startFieldIndex + redirectingInvokation.fieldCount;
        break;
      default:
        throw new FtUnreachableCaseError('RR22334', invokationDelay);
    }

    // Check if redirect causes any change
    let changeRequired: boolean;
    if (newInvokationIndex >= this._sequenceInvokationList.count) {
      changeRequired = true;
    } else {
      const nextExistingInvokation = this._sequenceInvokationList.get(newInvokationIndex);
      changeRequired = nextExistingInvokation.sequence !== invokedSequence || nextExistingInvokation.startFieldIndex !== newInvokationStartFieldIndex;
    }

    if (!changeRequired) {
      fieldsAffectedFromIndex = FtField.NO_FIELDS_AFFECTED_INDEX;
    } else {
      const existingRedirectingField = redirectingInvokation.redirectingField;
      let unredirectFieldsAffectedFromIndex: number;

      if (!existingRedirectingField) {
        unredirectFieldsAffectedFromIndex = redirectingInvokation.startFieldIndex + redirectingInvokation.fieldCount;
      } else {
        unredirectFieldsAffectedFromIndex = this.unredirect(existingRedirectingField);
        if (unredirectFieldsAffectedFromIndex < 0) {
          unredirectFieldsAffectedFromIndex = redirectingInvokation.startFieldIndex + redirectingInvokation.fieldCount;
        }
      }

      let newInvokation = this._sequenceInvokationList.tryPredictedNew(newInvokationIndex, invokedSequence, newInvokationStartFieldIndex);
      if (newInvokation === undefined) {
        this._sequenceInvokationList.trim(newInvokationIndex);
        newInvokation = this._sequenceInvokationList.new(invokedSequence, newInvokationStartFieldIndex);
      }

      this._fieldList.trim(newInvokationStartFieldIndex);
      for (let i = 0; i < newInvokation.fieldCount; i++) {
        this._fieldList.add(newInvokation.getField(i));
      }

      if (newInvokationStartFieldIndex < redirectingInvokation.startFieldIndex + redirectingInvokation.fieldCount) {
        redirectingInvokation.sidelineFieldsOverload(newInvokationStartFieldIndex);
      }

      if (unredirectFieldsAffectedFromIndex < newInvokationStartFieldIndex) {
        fieldsAffectedFromIndex = unredirectFieldsAffectedFromIndex;
      } else {
        fieldsAffectedFromIndex = newInvokationStartFieldIndex;
      }

      if (!this._seeking) {
        this.fireSequenceRedirected(redirectingField, fieldsAffectedFromIndex);
      }
    }

    return fieldsAffectedFromIndex;
  }

  protected unredirect(unredirectingField: FtField): number {
    const unredirectingInvokation = unredirectingField.sequenceInvokation;
    const unredirectingInvokationIndex = unredirectingInvokation.index;

    if (unredirectingInvokationIndex >= this._sequenceInvokationList.count - 1) {
      // unRedirectingInvokation is last. Nothing to do. (should never happen)
      return FtField.NO_FIELDS_AFFECTED_INDEX;
    } else {
      const nextInvokationIndex = unredirectingInvokationIndex + 1;
      this._sequenceInvokationList.predictTrim(nextInvokationIndex);

      const fieldsAffectedFromIndex = unredirectingInvokation.startFieldIndex + unredirectingInvokation.fieldsSidelinedFromIndex;
      this._fieldList.trim(fieldsAffectedFromIndex);

      for (let i = unredirectingInvokation.fieldsSidelinedFromIndex; i < unredirectingInvokation.fieldCount; i++) {
        this._fieldList.add(unredirectingInvokation.getField(i));
      }
      unredirectingInvokation.unsidelineFields();
      return fieldsAffectedFromIndex;
    }
  }

  // Event triggers
  protected fireFieldHeadingWriteReady(field: FtField, lineIndex: number): void {
    if (this.onFieldHeadingWriteReady) {
      this.onFieldHeadingWriteReady({ field, lineIndex });
    }
  }

  protected fireFieldValueWriteReady(field: FtField, recordIndex: number): void {
    if (this.onFieldValueWriteReady) {
      this.onFieldValueWriteReady({ field, recordIndex });
    }
  }

  protected fireHeadingLineStarted(lineIndex: number): void {
    if (this.onHeadingLineStarted) {
      this.onHeadingLineStarted({ lineIndex });
    }
  }

  protected fireHeadingLineFinished(lineIndex: number): void {
    if (this.onHeadingLineFinished) {
      this.onHeadingLineFinished({ lineIndex });
    }
  }

  protected fireRecordStarted(recordIndex: number): void {
    if (this.onRecordStarted) {
      this.onRecordStarted({ recordIndex });
    }
  }

  protected fireRecordFinished(recordIndex: number): void {
    if (this.onRecordFinished) {
      this.onRecordFinished({ recordIndex });
    }
  }

  protected fireSequenceRedirected(redirectingField: FtField, fieldsAffectedFromIndex: number): void {
    if (this.onSequenceRedirected) {
      this.onSequenceRedirected({ redirectingField, fieldsAffectedFromIndex });
    }
  }

  /**
   * Reset serialization state.
   */
  protected reset(): void {
    this._seeking = false;
    this._recordCount = 0;
    this._tableCount = 0;
    this._sequenceInvokationList.clear();
    this._previousRecordSequenceInvokationList.clear();
    this._rootSequenceInvokation = undefined;
    this._fieldList.clear();
  }

  private resetAllFieldValues(): void {
    for (let i = 0; i < this._fieldList.count; i++) {
      this._fieldList.get(i).resetValue();
    }
  }

  private resetFieldValues(fromIndex: number, count: number): void {
    for (let i = fromIndex; i < fromIndex + count; i++) {
      this._fieldList.get(i).resetValue();
    }
  }

  private handleSequenceRedirectEvent(field: FtField, sequence: FtSequence | undefined, delay: FtSequenceInvokationDelay): number {
    if (sequence !== undefined) {
      return this.redirect(field, sequence, delay); // returns fieldsAffectedFromIndex
    } else {
      return this.unredirect(field); // returns fieldsAffectedFromIndex
    }
  }

  private calculateAutoEndOfLineSubstitutionValue(): string {
    switch (this._endOfLineAutoWriteType) {
      case FtEndOfLineAutoWriteType.CrLf:
        return SerializationCore.CarriageReturnLineFeedString;
      case FtEndOfLineAutoWriteType.Cr:
        return SerializationCore.CarriageReturnChar;
      case FtEndOfLineAutoWriteType.Lf:
        return SerializationCore.LineFeedChar;
      case FtEndOfLineAutoWriteType.Local:
        return '\n';
      default:
        throw new FtUnreachableCaseError('SCASV22100', this._endOfLineAutoWriteType);
    }
  }

  abstract close(): void;
}
