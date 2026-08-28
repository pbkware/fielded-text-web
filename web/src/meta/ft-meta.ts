import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaFactory } from '../factory/ft-meta-factory.js';
import { FtEndOfLineAutoWriteType } from '../types/enums/ft-end-of-line-auto-write-type.js';
import { FtEndOfLineType } from '../types/enums/ft-end-of-line-type.js';
import { FtHeadingConstraint } from '../types/enums/ft-heading-constraint.js';
import { FtLastLineEndedType } from '../types/enums/ft-last-line-ended-type.js';
import { FtPadAlignment } from '../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../types/enums/ft-quoted-type.js';
import { FtTruncateType } from '../types/enums/ft-truncate-type.js';
import { FtMetaFieldList } from './fields/ft-meta-field-list.js';
import { FtMetaDefaults } from './ft-meta-defaults.js';
import { FtMetaSequenceList } from './sequences/core/ft-meta-sequence-list.js';
import { FtMetaSubstitutionList } from './substitutions/ft-meta-substitution-list.js';

/**
 * @public
 */
export const FtMetaPropertyId = {
  Culture: 'Culture',
  EndOfLineType: 'EndOfLineType',
  EndOfLineChar: 'EndOfLineChar',
  EndOfLineAutoWriteType: 'EndOfLineAutoWriteType',
  LastLineEndedType: 'LastLineEndedType',
  QuoteChar: 'QuoteChar',
  DelimiterChar: 'DelimiterChar',
  LineCommentChar: 'LineCommentChar',
  AllowEndOfLineCharInQuotes: 'AllowEndOfLineCharInQuotes',
  IgnoreBlankLines: 'IgnoreBlankLines',
  IgnoreExtraChars: 'IgnoreExtraChars',
  AllowIncompleteRecords: 'AllowIncompleteRecords',
  StuffedEmbeddedQuotes: 'StuffedEmbeddedQuotes',
  SubstitutionsEnabled: 'SubstitutionsEnabled',
  SubstitutionChar: 'SubstitutionChar',
  HeadingLineCount: 'HeadingLineCount',
  MainHeadingLineIndex: 'MainHeadingLineIndex',
  HeadingConstraint: 'HeadingConstraint',
  HeadingQuotedType: 'HeadingQuotedType',
  HeadingAlwaysWriteOptionalQuote: 'HeadingAlwaysWriteOptionalQuote',
  HeadingWritePrefixSpace: 'HeadingWritePrefixSpace',
  HeadingPadAlignment: 'HeadingPadAlignment',
  HeadingPadCharType: 'HeadingPadCharType',
  HeadingPadChar: 'HeadingPadChar',
  HeadingTruncateType: 'HeadingTruncateType',
  HeadingTruncateChar: 'HeadingTruncateChar',
  HeadingEndOfValueChar: 'HeadingEndOfValueChar',
  LegacyEndOfLineIsSeparator: 'LegacyEndOfLineIsSeparator',
  LegacyIncompleteRecordsAllowed: 'LegacyIncompleteRecordsAllowed',
} as const;

/**
 * @public
 */
export type FtMetaPropertyId = (typeof FtMetaPropertyId)[keyof typeof FtMetaPropertyId];

/**
 * @public
 */
export class FtMeta {
  // Default constants
  static readonly DefaultCultureName = FtMetaDefaults.Root.CultureName;
  static readonly DefaultEndOfLineType = FtMetaDefaults.Root.EndOfLineType;
  static readonly DefaultEndOfLineChar = FtMetaDefaults.Root.EndOfLineChar;
  static readonly DefaultEndOfLineAutoWriteType = FtMetaDefaults.Root.EndOfLineAutoWriteType;
  static readonly DefaultLastLineEndedType = FtMetaDefaults.Root.LastLineEndedType;
  static readonly DefaultQuoteChar = FtMetaDefaults.Root.QuoteChar;
  static readonly DefaultDelimiterChar = FtMetaDefaults.Root.DelimiterChar;
  static readonly DefaultLineCommentChar = FtMetaDefaults.Root.LineCommentChar;
  static readonly DefaultAllowEndOfLineCharInQuotes = FtMetaDefaults.Root.AllowEndOfLineCharInQuotes;
  static readonly DefaultIgnoreBlankLines = FtMetaDefaults.Root.IgnoreBlankLines;
  static readonly DefaultIgnoreExtraChars = FtMetaDefaults.Root.IgnoreExtraChars;
  static readonly DefaultAllowIncompleteRecords = FtMetaDefaults.Root.AllowIncompleteRecords;
  static readonly DefaultStuffedEmbeddedQuotes = FtMetaDefaults.Root.StuffedEmbeddedQuotes;
  static readonly DefaultSubstitutionsEnabled = FtMetaDefaults.Root.SubstitutionsEnabled;
  static readonly DefaultSubstitutionChar = FtMetaDefaults.Root.SubstitutionChar;
  static readonly DefaultHeadingLineCount = FtMetaDefaults.Root.HeadingLineCount;
  static readonly DefaultMainHeadingLineIndex = FtMetaDefaults.Root.MainHeadingLineIndex;
  static readonly DefaultHeadingQuotedType = FtMetaDefaults.Root.HeadingQuotedType;
  static readonly DefaultHeadingAlwaysWriteOptionalQuote = FtMetaDefaults.Root.HeadingAlwaysWriteOptionalQuote;
  static readonly DefaultHeadingWritePrefixSpace = FtMetaDefaults.Root.HeadingWritePrefixSpace;
  static readonly DefaultHeadingConstraint = FtMetaDefaults.Root.HeadingConstraint;
  static readonly DefaultHeadingPadAlignment = FtMetaDefaults.Root.HeadingPadAlignment;
  static readonly DefaultHeadingPadCharType = FtMetaDefaults.Root.HeadingPadCharType;
  static readonly DefaultHeadingPadChar = FtMetaDefaults.Root.HeadingPadChar;
  static readonly DefaultHeadingTruncateType = FtMetaDefaults.Root.HeadingTruncateType;
  static readonly DefaultHeadingTruncateChar = FtMetaDefaults.Root.HeadingTruncateChar;
  static readonly DefaultHeadingEndOfValueChar = FtMetaDefaults.Root.HeadingEndOfValueChar;

  // Public properties
  culture: DotNetLocaleSettings;
  endOfLineType: FtEndOfLineType;
  endOfLineChar: string;
  endOfLineAutoWriteType: FtEndOfLineAutoWriteType;
  lastLineEndedType: FtLastLineEndedType;
  quoteChar: string;
  delimiterChar: string;
  lineCommentChar: string;
  allowEndOfLineCharInQuotes: boolean;
  ignoreBlankLines: boolean;
  ignoreExtraChars: boolean;
  allowIncompleteRecords: boolean;
  stuffedEmbeddedQuotes: boolean;
  substitutionsEnabled: boolean;
  substitutionChar: string;
  mainHeadingLineIndex: number;
  headingConstraint: FtHeadingConstraint;
  headingQuotedType: FtQuotedType;
  headingAlwaysWriteOptionalQuote: boolean;
  headingWritePrefixSpace: boolean;
  headingPadAlignment: FtPadAlignment;
  headingPadCharType: FtPadCharType;
  headingPadChar: string;
  headingTruncateType: FtTruncateType;
  headingTruncateChar: string;
  headingEndOfValueChar: string;

  private _fieldList: FtMetaFieldList;
  private _sequenceList: FtMetaSequenceList;
  private _substitutionList: FtMetaSubstitutionList;
  private _headingLineCount: number;

  constructor() {
    this._fieldList = new FtMetaFieldList();
    this._fieldList.onBeforeRemove = (fieldIdx) => this.handleFieldListBeforeRemove(fieldIdx);
    this._fieldList.onBeforeClear = () => this.handleFieldListBeforeClear();
    this._fieldList.onDefaultHeadingConstraintRequired = () => this.headingConstraint;
    this._fieldList.onDefaultHeadingQuotedTypeRequired = () => this.headingQuotedType;
    this._fieldList.onDefaultHeadingAlwaysWriteOptionalQuoteRequired = () => this.headingAlwaysWriteOptionalQuote;
    this._fieldList.onDefaultHeadingWritePrefixSpaceRequired = () => this.headingWritePrefixSpace;
    this._fieldList.onDefaultHeadingPadAlignmentRequired = () => this.headingPadAlignment;
    this._fieldList.onDefaultHeadingPadCharTypeRequired = () => this.headingPadCharType;
    this._fieldList.onDefaultHeadingPadCharRequired = () => this.headingPadChar;
    this._fieldList.onDefaultHeadingTruncateTypeRequired = () => this.headingTruncateType;
    this._fieldList.onDefaultHeadingTruncateCharRequired = () => this.headingTruncateChar;
    this._fieldList.onDefaultHeadingEndOfValueCharRequired = () => this.headingEndOfValueChar;

    this._substitutionList = new FtMetaSubstitutionList();
    this._sequenceList = new FtMetaSequenceList();

    // Initialize properties to defaults
    this.culture = DotNetLocaleSettings.invariant;
    this.endOfLineType = FtMeta.DefaultEndOfLineType;
    this.endOfLineChar = FtMeta.DefaultEndOfLineChar;
    this.endOfLineAutoWriteType = FtMeta.DefaultEndOfLineAutoWriteType;
    this.lastLineEndedType = FtMeta.DefaultLastLineEndedType;
    this.quoteChar = FtMeta.DefaultQuoteChar;
    this.delimiterChar = FtMeta.DefaultDelimiterChar;
    this.lineCommentChar = FtMeta.DefaultLineCommentChar;
    this.allowEndOfLineCharInQuotes = FtMeta.DefaultAllowEndOfLineCharInQuotes;
    this.ignoreBlankLines = FtMeta.DefaultIgnoreBlankLines;
    this.ignoreExtraChars = FtMeta.DefaultIgnoreExtraChars;
    this.allowIncompleteRecords = FtMeta.DefaultAllowIncompleteRecords;
    this.stuffedEmbeddedQuotes = FtMeta.DefaultStuffedEmbeddedQuotes;
    this.substitutionsEnabled = FtMeta.DefaultSubstitutionsEnabled;
    this.substitutionChar = FtMeta.DefaultSubstitutionChar;
    this.mainHeadingLineIndex = FtMeta.DefaultMainHeadingLineIndex;
    this._headingLineCount = FtMeta.DefaultHeadingLineCount;
    this.headingQuotedType = FtMeta.DefaultHeadingQuotedType;
    this.headingAlwaysWriteOptionalQuote = FtMeta.DefaultHeadingAlwaysWriteOptionalQuote;
    this.headingWritePrefixSpace = FtMeta.DefaultHeadingWritePrefixSpace;
    this.headingConstraint = FtMeta.DefaultHeadingConstraint;
    this.headingPadAlignment = FtMeta.DefaultHeadingPadAlignment;
    this.headingPadCharType = FtMeta.DefaultHeadingPadCharType;
    this.headingPadChar = FtMeta.DefaultHeadingPadChar;
    this.headingTruncateType = FtMeta.DefaultHeadingTruncateType;
    this.headingTruncateChar = FtMeta.DefaultHeadingTruncateChar;
    this.headingEndOfValueChar = FtMeta.DefaultHeadingEndOfValueChar;

    this.reset();
  }

  get fieldList(): FtMetaFieldList {
    return this._fieldList;
  }

  get sequenceList(): FtMetaSequenceList {
    return this._sequenceList;
  }

  get substitutionList(): FtMetaSubstitutionList {
    return this._substitutionList;
  }

  get headingLineCount(): number {
    return this._headingLineCount;
  }

  set headingLineCount(value: number) {
    this._headingLineCount = value;
    this._fieldList.headingCount = value;
  }

  static create(): FtMeta {
    return FtMetaFactory.createMeta();
  }

  reset(): void {
    this._sequenceList.clear();
    this._fieldList.clear();
    this._substitutionList.clear();

    this.culture = DotNetLocaleSettings.invariant;

    this.endOfLineType = FtMeta.DefaultEndOfLineType;
    this.endOfLineChar = FtMeta.DefaultEndOfLineChar;
    this.endOfLineAutoWriteType = FtMeta.DefaultEndOfLineAutoWriteType;
    this.lastLineEndedType = FtMeta.DefaultLastLineEndedType;

    this.quoteChar = FtMeta.DefaultQuoteChar;
    this.delimiterChar = FtMeta.DefaultDelimiterChar;
    this.lineCommentChar = FtMeta.DefaultLineCommentChar;

    this.allowEndOfLineCharInQuotes = FtMeta.DefaultAllowEndOfLineCharInQuotes;
    this.ignoreBlankLines = FtMeta.DefaultIgnoreBlankLines;
    this.ignoreExtraChars = FtMeta.DefaultIgnoreExtraChars;
    this.allowIncompleteRecords = FtMeta.DefaultAllowIncompleteRecords;

    this.stuffedEmbeddedQuotes = FtMeta.DefaultStuffedEmbeddedQuotes;

    this.substitutionsEnabled = FtMeta.DefaultSubstitutionsEnabled;
    this.substitutionChar = FtMeta.DefaultSubstitutionChar;

    this.mainHeadingLineIndex = FtMeta.DefaultMainHeadingLineIndex;
    this.headingLineCount = FtMeta.DefaultHeadingLineCount;

    this.headingQuotedType = FtMeta.DefaultHeadingQuotedType;
    this.headingAlwaysWriteOptionalQuote = FtMeta.DefaultHeadingAlwaysWriteOptionalQuote;
    this.headingWritePrefixSpace = FtMeta.DefaultHeadingWritePrefixSpace;

    this.headingConstraint = FtMeta.DefaultHeadingConstraint;
    this.headingPadAlignment = FtMeta.DefaultHeadingPadAlignment;
    this.headingPadCharType = FtMeta.DefaultHeadingPadCharType;
    this.headingPadChar = FtMeta.DefaultHeadingPadChar;
    this.headingTruncateType = FtMeta.DefaultHeadingTruncateType;
    this.headingTruncateChar = FtMeta.DefaultHeadingTruncateChar;
    this.headingEndOfValueChar = FtMeta.DefaultHeadingEndOfValueChar;
  }

  createCopy(): FtMeta {
    const meta = FtMeta.create();
    meta.assign(this);
    return meta;
  }

  assign(source: FtMeta): void {
    this.culture = source.culture;

    this.endOfLineType = source.endOfLineType;
    this.endOfLineChar = source.endOfLineChar;
    this.endOfLineAutoWriteType = source.endOfLineAutoWriteType;
    this.lastLineEndedType = source.lastLineEndedType;

    this.quoteChar = source.quoteChar;
    this.delimiterChar = source.delimiterChar;
    this.lineCommentChar = source.lineCommentChar;

    this.allowEndOfLineCharInQuotes = source.allowEndOfLineCharInQuotes;
    this.ignoreBlankLines = source.ignoreBlankLines;
    this.ignoreExtraChars = source.ignoreExtraChars;
    this.allowIncompleteRecords = source.allowIncompleteRecords;

    this.stuffedEmbeddedQuotes = source.stuffedEmbeddedQuotes;

    this.substitutionsEnabled = source.substitutionsEnabled;
    this.substitutionChar = source.substitutionChar;

    this.mainHeadingLineIndex = source.mainHeadingLineIndex;
    this.headingLineCount = source.headingLineCount;

    this.headingQuotedType = source.headingQuotedType;
    this.headingAlwaysWriteOptionalQuote = source.headingAlwaysWriteOptionalQuote;
    this.headingWritePrefixSpace = source.headingWritePrefixSpace;

    this.headingConstraint = source.headingConstraint;
    this.headingPadAlignment = source.headingPadAlignment;
    this.headingPadCharType = source.headingPadCharType;
    this.headingPadChar = source.headingPadChar;
    this.headingTruncateType = source.headingTruncateType;
    this.headingTruncateChar = source.headingTruncateChar;
    this.headingEndOfValueChar = source.headingEndOfValueChar;

    this._fieldList.assign(source._fieldList);
    this._sequenceList.assign(source._sequenceList, this._fieldList, source._fieldList);
    this._substitutionList.assign(source._substitutionList);
  }

  validate(): { valid: boolean; errorMessage: string } {
    let errorMessage = '';

    // QuoteChar validation - check character conflicts first
    if (this.quoteChar === this.delimiterChar) {
      errorMessage = 'QuoteChar and DelimiterChar must be different';
    }

    if (errorMessage === '' && this.quoteChar === this.lineCommentChar) {
      errorMessage = 'QuoteChar and LineCommentChar must be different';
    }

    if (errorMessage === '' && this.lineCommentChar === this.delimiterChar) {
      errorMessage = 'LineCommentChar and DelimiterChar must be different';
    }

    // SubstitutionChar validation
    if (errorMessage === '' && this.substitutionsEnabled) {
      if (this.quoteChar === this.substitutionChar) {
        errorMessage = 'QuoteChar and SubstitutionChar must be different';
      } else if (this.delimiterChar === this.substitutionChar) {
        errorMessage = 'DelimiterChar and SubstitutionChar must be different';
      } else if (this.lineCommentChar === this.substitutionChar) {
        errorMessage = 'LineCommentChar and SubstitutionChar must be different';
      }
    }

    // Substitution token validation (FTStd0.9: token is a character)
    if (errorMessage === '') {
      for (let i = 0; i < this._substitutionList.count; i++) {
        const substitution = this._substitutionList.get(i);
        if (substitution.token.length !== 1) {
          errorMessage = `Substitution token at index ${i} must be a single character`;
          break;
        }
      }
    }

    // FieldList validation - check after character validation
    if (errorMessage === '' && this._fieldList.count === 0) {
      errorMessage = 'Must have at least one field';
    }

    // EndOfLineType validation
    if (errorMessage === '') {
      const CarriageReturnChar = '\r';
      const LineFeedChar = '\n';

      switch (this.endOfLineType) {
        case FtEndOfLineType.CrLf:
        case FtEndOfLineType.Auto:
          if (!this.validateEndOfLineTypeChar(CarriageReturnChar).valid) {
            errorMessage = this.validateEndOfLineTypeChar(CarriageReturnChar).errorMessage;
          } else {
            const lfValidation = this.validateEndOfLineTypeChar(LineFeedChar);
            if (!lfValidation.valid) {
              errorMessage = lfValidation.errorMessage;
            }
          }
          break;
        case FtEndOfLineType.Char: {
          const validation = this.validateEndOfLineTypeChar(this.endOfLineChar);
          if (!validation.valid) {
            errorMessage = validation.errorMessage;
          }
          break;
        }
      }
    }

    // Sequence validations
    if (errorMessage === '') {
      const rootCheck = this._sequenceList.isMoreThanOneRoot();
      if (rootCheck.found) {
        errorMessage = `More than one root sequence: ${rootCheck.firstRootSequenceName}, ${rootCheck.secondRootSequenceName}`;
      }
    }

    if (errorMessage === '') {
      const duplicateCheck = this._sequenceList.hasDuplicateName();
      if (duplicateCheck.found) {
        errorMessage = `Duplicate sequence name: ${duplicateCheck.duplicateName}`;
      }
    }

    // Sequence item validations
    if (errorMessage === '') {
      for (let i = 0; i < this._sequenceList.count; i++) {
        const nullFieldCheck = this._sequenceList.anyItemWithUndefinedField(i);
        if (nullFieldCheck.found) {
          errorMessage = `Sequence ${this._sequenceList.get(i).name} has item ${nullFieldCheck.itemIndex} with null field`;
          break;
        }
      }
    }

    if (errorMessage === '') {
      for (let i = 0; i < this._sequenceList.count; i++) {
        const constantRedirectCheck = this._sequenceList.anyItemWithConstantFieldHasRedirects(i);
        if (constantRedirectCheck.found) {
          errorMessage = `Sequence ${this._sequenceList.get(i).name} has item ${constantRedirectCheck.itemIndex} with constant field that has redirects`;
          break;
        }
      }
    }

    return { valid: errorMessage === '', errorMessage };
  }

  private handleFieldListBeforeRemove(fieldIdx: number): void {
    this._sequenceList.removeField(this._fieldList.get(fieldIdx));
  }

  private handleFieldListBeforeClear(): void {
    this._sequenceList.removeAllFields();
  }

  private validateEndOfLineTypeChar(eolTypeChar: string): {
    valid: boolean;
    errorMessage: string;
  } {
    let errorMessage = '';

    if (this.quoteChar === eolTypeChar) {
      errorMessage = `QuoteChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.lineCommentChar === eolTypeChar) {
      errorMessage = `LineCommentChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.delimiterChar === eolTypeChar) {
      errorMessage = `DelimiterChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.substitutionsEnabled && this.substitutionChar === eolTypeChar) {
      errorMessage = `SubstitutionChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.headingLineCount > 0 && this.headingPadChar === eolTypeChar) {
      errorMessage = `HeadingPadChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.headingLineCount > 0 && this.headingTruncateChar === eolTypeChar) {
      errorMessage = `HeadingTruncateChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    } else if (this.headingLineCount > 0 && this.headingEndOfValueChar === eolTypeChar) {
      errorMessage = `HeadingEndOfValueChar cannot be an EndOfLine char: ${this.endOfLineTypeCharToString(eolTypeChar)}`;
    }

    // Validate each field
    if (errorMessage === '') {
      for (let i = 0; i < this._fieldList.count; i++) {
        const fieldValidation = this._fieldList.get(i).validateEndOfLineTypeChar(eolTypeChar, this.headingLineCount);
        if (!fieldValidation.valid) {
          errorMessage = fieldValidation.errorMessage;
          break;
        }
      }
    }

    return { valid: errorMessage === '', errorMessage };
  }

  private endOfLineTypeCharToString(eolTypeChar: string): string {
    const codePoint = eolTypeChar.charCodeAt(0);
    let result = `\\x${codePoint.toString(16).padStart(4, '0')}`;

    // Check if it's a control character
    if (codePoint < 32 || codePoint === 127) {
      // It's a control character, don't add the character itself
    } else {
      result += ` [${eolTypeChar}]`;
    }

    return result;
  }
}
