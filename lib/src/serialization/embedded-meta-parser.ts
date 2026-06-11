/**
 * Parser for extracting embedded XML metadata from .ftx file headers.
 * Detects <?xml or <FieldedText and accumulates until </FieldedText>.
 * @internal
 */
export class EmbeddedMetaParser {
  private static readonly FIELDED_TEXT_ELEMENT_NAME = 'FieldedText';
  private static readonly XML_STARTING_TEXT = '<?xml ';
  private static readonly FIELDED_TEXT_STARTING_TEXT = '<' + EmbeddedMetaParser.FIELDED_TEXT_ELEMENT_NAME;
  private static readonly TERMINATING_TEXT = '</' + EmbeddedMetaParser.FIELDED_TEXT_ELEMENT_NAME + '>';
  private static readonly INVALID_BUILDER_INDEX = -1;

  private _builder: string[] = [];
  private _detected = false;
  private _nextCharIsComment = false;
  private _ready = false;

  private _xmlStartingPosition = 0;
  private _fieldedTextStartingPosition = 0;
  private _terminatingPosition = 0;

  private _fieldedTextStartingBuilderIndex = EmbeddedMetaParser.INVALID_BUILDER_INDEX;
  private _xmlStartingBuilderIndex = EmbeddedMetaParser.INVALID_BUILDER_INDEX;

  get ready(): boolean {
    return this._ready;
  }

  /**
   * Reset parser state for new parsing session.
   */
  reset(): void {
    this._detected = false;
    this._nextCharIsComment = false;
    this._ready = false;

    this._xmlStartingPosition = 0;
    this._fieldedTextStartingPosition = 0;
    this._terminatingPosition = 0;

    this._xmlStartingBuilderIndex = EmbeddedMetaParser.INVALID_BUILDER_INDEX;
    this._fieldedTextStartingBuilderIndex = EmbeddedMetaParser.INVALID_BUILDER_INDEX;

    this._builder = [];
  }

  /**
   * Parse a character before detection. Returns true if embedded meta detected.
   */
  parseNotYetDetectedChar(aChar: string): boolean {
    if (this._nextCharIsComment) {
      // Ignore start of line comment characters
      this._nextCharIsComment = false;
    } else {
      this._builder.push(aChar);

      // If XmlStartingText not yet match, see if char is part of match
      if (this._xmlStartingPosition < EmbeddedMetaParser.XML_STARTING_TEXT.length) {
        if (aChar === EmbeddedMetaParser.XML_STARTING_TEXT[this._xmlStartingPosition]) {
          if (this._xmlStartingPosition === 0) {
            this._xmlStartingBuilderIndex = this._builder.length - 1;
          }
          this._xmlStartingPosition++;
        }
      }

      // If FieldedTextStartingText not yet match, see if char is part of match
      if (aChar === EmbeddedMetaParser.FIELDED_TEXT_STARTING_TEXT[this._fieldedTextStartingPosition]) {
        if (this._fieldedTextStartingPosition === 0) {
          this._fieldedTextStartingBuilderIndex = this._builder.length;
        }

        this._fieldedTextStartingPosition++;

        if (this._fieldedTextStartingPosition >= EmbeddedMetaParser.FIELDED_TEXT_STARTING_TEXT.length) {
          const builderIndex =
            this._xmlStartingPosition >= EmbeddedMetaParser.XML_STARTING_TEXT.length
              ? this._xmlStartingBuilderIndex
              : this._fieldedTextStartingBuilderIndex;
          this._builder.splice(0, builderIndex);

          this._detected = true;
        }
      }
    }

    return this._detected;
  }

  /**
   * Called at the start of each line.
   */
  startLine(): void {
    // Matches cannot carry over line except for fully matched XmlStartingText
    if (!this._detected) {
      this._fieldedTextStartingPosition = 0;

      if (this._xmlStartingPosition >= EmbeddedMetaParser.XML_STARTING_TEXT.length) {
        this.appendLine();
      } else {
        this._xmlStartingPosition = 0;
        this._builder = [];
      }
    }

    this._nextCharIsComment = true;
    this._terminatingPosition = 0;
  }

  /**
   * Parse a character after detection (accumulating XML).
   */
  parseChar(aChar: string): void {
    if (!this._ready) {
      if (this._nextCharIsComment) {
        this._nextCharIsComment = false;
      } else {
        this._builder.push(aChar);

        if (aChar !== EmbeddedMetaParser.TERMINATING_TEXT[this._terminatingPosition]) {
          this._terminatingPosition = 0;
        } else {
          this._terminatingPosition++;
          if (this._terminatingPosition >= EmbeddedMetaParser.TERMINATING_TEXT.length) {
            this._ready = true;
          }
        }
      }
    }
  }

  /**
   * Append a newline to the builder.
   */
  appendLine(): void {
    this._builder.push('\n');
  }

  /**
   * Take the accumulated XML metadata as a string and clear the builder.
   */
  takeMetaAsString(): string {
    const result = this._builder.join('');
    this._builder = [];
    return result;
  }
}
