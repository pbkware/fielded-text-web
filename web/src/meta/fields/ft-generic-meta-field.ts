import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtMetaField } from './ft-meta-field.js';

/**
 * Generic base class for typed meta fields.
 * Provides value storage and management for fields with a specific value type.
 * @public
 */
export abstract class FtGenericMetaField<T> extends FtMetaField {
  private _defaultValue: T;
  private _value: T;

  protected constructor(dataType: FtDataType, headingCount: number, defaultValue: T) {
    super(dataType, headingCount);
    this._defaultValue = defaultValue;
    this._value = defaultValue;
  }

  get value(): T {
    return this._value;
  }

  set value(val: T) {
    this._value = val;
  }

  override loadDefaults(leaveNameAsIs = true): void {
    super.loadDefaults(leaveNameAsIs);
    this._value = this._defaultValue;
  }

  protected override assignFrom(source: FtMetaField): void {
    super.assignFrom(source);
    if (source instanceof FtGenericMetaField) {
      this._value = (source as FtGenericMetaField<T>)._value;
    }
  }
}
