import { FtFieldFactory } from '../../factory/ft-field-factory.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtHeadingConstraint } from '../../types/enums/ft-heading-constraint.js';
import { FtPadAlignment } from '../../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../../types/enums/ft-quoted-type.js';
import { FtTruncateType } from '../../types/enums/ft-truncate-type.js';
import { FtMetaDefaults } from '../ft-meta-defaults.js';
import type { FtMetaField } from './ft-meta-field.js';

/**
 * @public
 */
export class FtMetaFieldList {
  // Event hooks
  /** @internal */
  onBeforeRemove: ((fieldIdx: number) => void) | undefined = undefined;
  /** @internal */
  onBeforeClear: (() => void) | undefined = undefined;
  /** @internal */
  onDefaultHeadingConstraintRequired: (() => FtHeadingConstraint) | undefined = undefined;
  /** @internal */
  onDefaultHeadingQuotedTypeRequired: (() => FtQuotedType) | undefined = undefined;
  /** @internal */
  onDefaultHeadingAlwaysWriteOptionalQuoteRequired: (() => boolean) | undefined = undefined;
  /** @internal */
  onDefaultHeadingWritePrefixSpaceRequired: (() => boolean) | undefined = undefined;
  /** @internal */
  onDefaultHeadingPadAlignmentRequired: (() => FtPadAlignment) | undefined = undefined;
  /** @internal */
  onDefaultHeadingPadCharTypeRequired: (() => FtPadCharType) | undefined = undefined;
  /** @internal */
  onDefaultHeadingPadCharRequired: (() => string) | undefined = undefined;
  /** @internal */
  onDefaultHeadingTruncateTypeRequired: (() => FtTruncateType) | undefined = undefined;
  /** @internal */
  onDefaultHeadingTruncateCharRequired: (() => string) | undefined = undefined;
  /** @internal */
  onDefaultHeadingEndOfValueCharRequired: (() => string) | undefined = undefined;

  /** @internal */
  private fields: FtMetaField[] = [];
  /** @internal */
  private _headingCount: number = FtMetaDefaults.Root.HeadingLineCount;

  get count(): number {
    return this.fields.length;
  }

  get headingCount(): number {
    return this._headingCount;
  }

  set headingCount(value: number) {
    this._headingCount = value;
    // Update all existing fields
    for (const field of this.fields) {
      field.setHeadingCount(value);
    }
  }

  get(index: number): FtMetaField {
    return this.fields[index];
  }

  indexOf(field: FtMetaField): number {
    return this.fields.indexOf(field);
  }

  findById(id: number): FtMetaField | undefined {
    return this.fields.find((f) => f.id === id);
  }

  find(name: string): FtMetaField | undefined {
    return this.fields.find((f) => f.name === name);
  }

  new(dataType: FtDataType): FtMetaField {
    const field = FtFieldFactory.createMetaField(dataType, this._headingCount);
    this.add(field);
    return field;
  }

  removeAt(index: number): void {
    if (this.onBeforeRemove) {
      this.onBeforeRemove(index);
    }
    this.unbindFieldEvents(this.fields[index]);
    this.fields.splice(index, 1);
  }

  remove(field: FtMetaField): void {
    const index = this.fields.indexOf(field);
    if (index >= 0) {
      this.removeAt(index);
    }
  }

  clear(): void {
    if (this.onBeforeClear) {
      this.onBeforeClear();
    }
    for (const field of this.fields) {
      this.unbindFieldEvents(field);
    }
    this.fields = [];
  }

  set(value: FtMetaField[]): void {
    this.clear();
    const count = value.length;
    for (let i = 0; i < count; i++) {
      this.add(value[i]);
    }
  }

  assign(source: FtMetaFieldList): void {
    this.clear();

    for (let i = 0; i < source.count; i++) {
      const sourceField = source.get(i);
      const field = sourceField.createCopy();
      this.add(field);
    }
  }

  private add(field: FtMetaField): void {
    this.fields.push(field);
    field.setHeadingCount(this._headingCount);
    this.bindFieldEvents(field);
  }

  private bindFieldEvents(field: FtMetaField): void {
    field.onDefaultHeadingConstraintRequired = () => {
      if (this.onDefaultHeadingConstraintRequired) {
        return this.onDefaultHeadingConstraintRequired();
      }
      return FtMetaDefaults.Root.HeadingConstraint;
    };
    field.onDefaultHeadingQuotedTypeRequired = () => {
      if (this.onDefaultHeadingQuotedTypeRequired) {
        return this.onDefaultHeadingQuotedTypeRequired();
      }
      return FtMetaDefaults.Root.HeadingQuotedType;
    };
    field.onDefaultHeadingAlwaysWriteOptionalQuoteRequired = () => {
      if (this.onDefaultHeadingAlwaysWriteOptionalQuoteRequired) {
        return this.onDefaultHeadingAlwaysWriteOptionalQuoteRequired();
      }
      return FtMetaDefaults.Root.HeadingAlwaysWriteOptionalQuote;
    };
    field.onDefaultHeadingWritePrefixSpaceRequired = () => {
      if (this.onDefaultHeadingWritePrefixSpaceRequired) {
        return this.onDefaultHeadingWritePrefixSpaceRequired();
      }
      return FtMetaDefaults.Root.HeadingWritePrefixSpace;
    };
    field.onDefaultHeadingPadAlignmentRequired = () => {
      if (this.onDefaultHeadingPadAlignmentRequired) {
        return this.onDefaultHeadingPadAlignmentRequired();
      }
      return FtMetaDefaults.Root.HeadingPadAlignment;
    };
    field.onDefaultHeadingPadCharTypeRequired = () => {
      if (this.onDefaultHeadingPadCharTypeRequired) {
        return this.onDefaultHeadingPadCharTypeRequired();
      }
      return FtMetaDefaults.Root.HeadingPadCharType;
    };
    field.onDefaultHeadingPadCharRequired = () => {
      if (this.onDefaultHeadingPadCharRequired) {
        return this.onDefaultHeadingPadCharRequired();
      }
      return FtMetaDefaults.Root.HeadingPadChar;
    };
    field.onDefaultHeadingTruncateTypeRequired = () => {
      if (this.onDefaultHeadingTruncateTypeRequired) {
        return this.onDefaultHeadingTruncateTypeRequired();
      }
      return FtMetaDefaults.Root.HeadingTruncateType;
    };
    field.onDefaultHeadingTruncateCharRequired = () => {
      if (this.onDefaultHeadingTruncateCharRequired) {
        return this.onDefaultHeadingTruncateCharRequired();
      }
      return FtMetaDefaults.Root.HeadingTruncateChar;
    };
    field.onDefaultHeadingEndOfValueCharRequired = () => {
      if (this.onDefaultHeadingEndOfValueCharRequired) {
        return this.onDefaultHeadingEndOfValueCharRequired();
      }
      return FtMetaDefaults.Root.HeadingEndOfValueChar;
    };
  }

  private unbindFieldEvents(field: FtMetaField): void {
    field.onDefaultHeadingConstraintRequired = undefined;
    field.onDefaultHeadingQuotedTypeRequired = undefined;
    field.onDefaultHeadingAlwaysWriteOptionalQuoteRequired = undefined;
    field.onDefaultHeadingWritePrefixSpaceRequired = undefined;
    field.onDefaultHeadingPadAlignmentRequired = undefined;
    field.onDefaultHeadingPadCharTypeRequired = undefined;
    field.onDefaultHeadingPadCharRequired = undefined;
    field.onDefaultHeadingTruncateTypeRequired = undefined;
    field.onDefaultHeadingTruncateCharRequired = undefined;
    field.onDefaultHeadingEndOfValueCharRequired = undefined;
  }
}
