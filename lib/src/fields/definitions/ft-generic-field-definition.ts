import { DotNetLocaleSettings } from '@pbkware/dot-net-date-number-formatting';
import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtFieldDefinition } from './ft-field-definition.js';

/**
 * Generic base class for field definitions with typed values.
 * Extends FtFieldDefinition to add type-specific value handling.
 * @public
 */
export abstract class FtGenericFieldDefinition<T> extends FtFieldDefinition {
  private _value!: T;

  get value(): T {
    return this._value;
  }

  /**
   * Load metadata from a meta field.
   * @param metaField - The meta field containing configuration
   * @param myCulture - The culture settings for formatting
   * @param myMainHeadingIndex - Index of the main heading
   */
  override loadMeta(metaField: FtMetaField, myCulture: DotNetLocaleSettings | undefined, myMainHeadingIndex: number): void {
    super.loadMeta(metaField, myCulture, myMainHeadingIndex);

    // Load constant value if applicable
    // The concrete generic meta field subclass will have typed value
    if (metaField.constant && !metaField.null) {
      const genericMetaField = metaField;
      if ('value' in genericMetaField) {
        this._value = genericMetaField.value as T;
      }
    }
  }

  /**
   * Convert a typed value to its text representation.
   * @param value - The value to convert
   * @returns The text representation
   */
  abstract getValueText(value: T): string;

  /**
   * Parse text into a typed value.
   * @param text - The text to parse
   * @returns The parsed value
   */
  abstract parseValueText(text: string): T;
}
