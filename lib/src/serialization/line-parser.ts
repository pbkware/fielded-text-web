import { FtEndOfLineType } from '../types/enums/ft-end-of-line-type.js';
import { FtAssertError, FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';
import { CharReader } from './char-reader.js';

const FtLineState = {
  Out: 'Out',
  In: 'In',
  InNextTextOut: 'InNextTextOut',
  InTextOut: 'InTextOut',
  InPendingNextLineFeed: 'InPendingNextLineFeed',
} as const;

type FtLineState = (typeof FtLineState)[keyof typeof FtLineState];

/**
 * @public
 */
export const LineEndedType = {
  Not: 'Not',
  Initiated: 'Initiated',
  Continued: 'Continued',
} as const;

/**
 * @public
 */
export type LineEndedType = (typeof LineEndedType)[keyof typeof LineEndedType];

/**
 * Parses characters into lines with end-of-line awareness.
 * Manages line state and handles different end-of-line types.
 * @internal
 */
export class LineParser {
  private static readonly CarriageReturnChar = CharReader.CarriageReturnChar;
  private static readonly LineFeedChar = CharReader.LineFeedChar;
  private static readonly CarriageReturnLineFeedString = CharReader.CarriageReturnLineFeedString;

  private _charReader: CharReader;
  private _endOfLineType: FtEndOfLineType;
  private _endOfLineChar: string;

  private _textLineCount = 0;
  private _textLineLength = 0;
  private _lineCount = 0;
  private _lineLength = 0;
  private _inLineState: FtLineState = FtLineState.Out;

  constructor(charReader: CharReader, endOfLineType: FtEndOfLineType, endOfLineChar: string) {
    this._charReader = charReader;
    this._endOfLineType = endOfLineType;
    this._endOfLineChar = endOfLineChar;
  }

  get lineCount(): number {
    return this._lineCount;
  }

  get lineLength(): number {
    return this._lineLength;
  }

  get inLine(): boolean {
    return this._inLineState !== FtLineState.Out;
  }

  /**
   * Update the end-of-line configuration.
   */
  setEndOfLine(endOfLineType: FtEndOfLineType, endOfLineChar: string): void {
    this._endOfLineType = endOfLineType;
    this._endOfLineChar = endOfLineChar;
  }

  /**
   * Reset the line parser state.
   */
  reset(): void {
    this._textLineCount = 0;
    this._textLineLength = 0;
    this._lineCount = 0;
    this._lineLength = 0;
    this._inLineState = FtLineState.Out;
  }

  /**
   * Parse a single character and update line state.
   * @param aChar The character to parse.
   * @param endOfLineToBeEmbedded Whether end-of-line should be embedded (not treated as line break).
   * @returns The line ended type.
   */
  parseChar(aChar: string, endOfLineToBeEmbedded: boolean): LineEndedType {
    let lineEndedType: LineEndedType;

    switch (this._inLineState) {
      case FtLineState.InNextTextOut:
        // Assert: aChar === LineFeedChar && endOfLineToBeEmbedded
        this._inLineState = FtLineState.InTextOut;
        lineEndedType = LineEndedType.Not;
        break;

      case FtLineState.InTextOut:
        this._textLineCount++;
        this._textLineLength = 0;
        this._inLineState = FtLineState.In;
        lineEndedType = this.parseInChar(aChar, endOfLineToBeEmbedded);
        break;

      case FtLineState.In:
        lineEndedType = this.parseInChar(aChar, endOfLineToBeEmbedded);
        break;

      case FtLineState.InPendingNextLineFeed:
        // Assert: aChar === LineFeedChar && !endOfLineToBeEmbedded
        this._inLineState = FtLineState.Out;
        lineEndedType = LineEndedType.Continued;
        break;

      case FtLineState.Out:
        this._lineCount++;
        this._lineLength = 0;
        this._textLineCount++;
        this._textLineLength = 0;
        this._inLineState = FtLineState.In;
        lineEndedType = this.parseInChar(aChar, endOfLineToBeEmbedded);
        break;

      default:
        throw new FtUnreachableCaseError('LPPC54122', this._inLineState);
    }

    this._lineLength++;
    this._textLineLength++;

    return lineEndedType;
  }

  /**
   * Exit the current line state.
   */
  exitLine(): void {
    if (!this.inLine) {
      throw new FtAssertError('LPPEL54124', 'LineParser.exitLine() called when not In Line');
    }
    this._inLineState = FtLineState.Out;
  }

  /**
   * Add a blank line to the count.
   */
  addBlankLine(): void {
    this._textLineCount++;
    this._textLineLength = 0;
    this._lineCount++;
    this._lineLength = 0;
  }

  private parseInChar(aChar: string, embedEndOfLine: boolean): LineEndedType {
    const crChar = LineParser.CarriageReturnChar;
    const lfChar = LineParser.LineFeedChar;

    switch (this._endOfLineType) {
      case FtEndOfLineType.Auto:
        switch (aChar) {
          case crChar:
            if (embedEndOfLine) {
              if (this._charReader.peekNextIsLineFeed()) {
                this._inLineState = FtLineState.InNextTextOut;
              } else {
                this._inLineState = FtLineState.InTextOut;
              }
              return LineEndedType.Not;
            } else {
              this._inLineState = this._charReader.peekNextIsLineFeed() ? FtLineState.InPendingNextLineFeed : FtLineState.Out;
              return LineEndedType.Initiated;
            }

          case lfChar:
            if (embedEndOfLine) {
              this._inLineState = FtLineState.InTextOut;
              return LineEndedType.Not;
            } else {
              this._inLineState = FtLineState.Out;
              return LineEndedType.Initiated;
            }

          default:
            this._lineLength++;
            this._textLineLength++;
            return LineEndedType.Not;
        }

      case FtEndOfLineType.CrLf:
        if (aChar !== crChar) {
          return LineEndedType.Not;
        } else {
          if (embedEndOfLine) {
            if (this._charReader.peekNextIsLineFeed()) {
              this._inLineState = FtLineState.InNextTextOut;
            } else {
              this._inLineState = FtLineState.InTextOut;
            }
            return LineEndedType.Not;
          } else {
            if (!this._charReader.peekNextIsLineFeed()) {
              return LineEndedType.Not;
            } else {
              this._inLineState = FtLineState.InPendingNextLineFeed;
              return LineEndedType.Initiated;
            }
          }
        }

      case FtEndOfLineType.Char:
        if (aChar !== this._endOfLineChar) {
          return LineEndedType.Not;
        } else {
          if (embedEndOfLine) {
            this._inLineState = FtLineState.InTextOut;
            return LineEndedType.Not;
          } else {
            this._inLineState = FtLineState.Out;
            return LineEndedType.Initiated;
          }
        }

      default:
        throw new FtUnreachableCaseError('LPPIC54123', this._endOfLineType);
    }
  }
}
