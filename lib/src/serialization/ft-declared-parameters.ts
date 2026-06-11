import { Err, isStringifiedInteger, Ok, Result } from '@pbkware/js-utils';
import { FtMetaReferenceType } from '../types/enums/ft-meta-reference-type.js';
import { FtUnreachableCaseError } from '../types/errors/ft-internal-error.js';

/**
 * Parameter record for declared parameters.
 * @public
 */
export interface FtDeclaredParameterRec {
  name: string;
  value: string;
}

/**
 * Container for declared parameters in .ftx file headers.
 * Manages version and meta reference parameters.
 * @public
 */
export class FtDeclaredParameters {
  private static readonly VERSION_PARAMETER_NAME = 'Version';
  private static readonly VERSION_PARTS_SEPARATOR = '.';
  private static readonly META_URL_PARAMETER_NAME = 'MetaUrl';
  private static readonly META_FILE_PARAMETER_NAME = 'MetaFile';
  private static readonly META_EMBEDDED_PARAMETER_NAME = 'MetaEmbedded';
  private static readonly META_EMBEDDED_PARAMETER_VALUE = 'True';

  private _list: FtDeclaredParameterRec[] = [];

  get count(): number {
    return this._list.length;
  }

  getName(idx: number): string {
    return this._list[idx].name;
  }

  getValue(idx: number): string {
    return this._list[idx].value;
  }

  add(name: string, value: string): void {
    const rec: FtDeclaredParameterRec = { name, value };
    const idx = this.indexOfName(name);
    if (idx < 0) {
      // Version must always be at index 0 per FTStd §4.3.3
      const isVersion = name.toLowerCase() === FtDeclaredParameters.VERSION_PARAMETER_NAME.toLowerCase();
      if (isVersion) {
        this._list.unshift(rec);
      } else {
        this._list.push(rec);
      }
    } else {
      this._list[idx] = rec;
    }
  }

  remove(name: string): void {
    const idx = this.indexOfName(name);
    if (idx >= 0) {
      this._list.splice(idx, 1);
    }
  }

  clear(): void {
    this._list = [];
  }

  indexOfName(name: string): number {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].name.toLowerCase() === name.toLowerCase()) {
        return i;
      }
    }
    return -1;
  }

  indexOfVersion(): number {
    return this.indexOfName(FtDeclaredParameters.VERSION_PARAMETER_NAME);
  }

  setVersion(major: number, minor: number, comment = ''): void {
    this.add(FtDeclaredParameters.VERSION_PARAMETER_NAME, this.versionToText(major, minor, comment));
  }

  tryGetVersion(): Result<Version, boolean> {
    const idx = this.indexOfVersion();
    if (idx >= 0) {
      return this.parseVersionValue(this._list[idx].value);
    } else {
      return new Err(false);
    }
  }

  getMetaReference(): { type: FtMetaReferenceType; reference: string } {
    let idx = this.indexOfName(FtDeclaredParameters.META_EMBEDDED_PARAMETER_NAME);
    if (idx >= 0) {
      return {
        type: FtMetaReferenceType.Embedded,
        reference: '', // Embedded meta has no external reference
      };
    }

    idx = this.indexOfName(FtDeclaredParameters.META_FILE_PARAMETER_NAME);
    if (idx >= 0) {
      return {
        type: FtMetaReferenceType.File,
        reference: this._list[idx].value,
      };
    }

    idx = this.indexOfName(FtDeclaredParameters.META_URL_PARAMETER_NAME);
    if (idx >= 0) {
      return {
        type: FtMetaReferenceType.Url,
        reference: this._list[idx].value,
      };
    }

    return { type: FtMetaReferenceType.None, reference: '' };
  }

  setMetaReference(type: FtMetaReferenceType, reference: string): void {
    this.remove(FtDeclaredParameters.META_FILE_PARAMETER_NAME);
    this.remove(FtDeclaredParameters.META_URL_PARAMETER_NAME);
    this.remove(FtDeclaredParameters.META_EMBEDDED_PARAMETER_NAME);

    switch (type) {
      case FtMetaReferenceType.Embedded:
        this.add(FtDeclaredParameters.META_EMBEDDED_PARAMETER_NAME, FtDeclaredParameters.META_EMBEDDED_PARAMETER_VALUE);
        break;
      case FtMetaReferenceType.File:
        this.add(FtDeclaredParameters.META_FILE_PARAMETER_NAME, reference);
        break;
      case FtMetaReferenceType.Url:
        this.add(FtDeclaredParameters.META_URL_PARAMETER_NAME, reference);
        break;
      case FtMetaReferenceType.None:
        break;
      default:
        throw new FtUnreachableCaseError('DPSMR22115', type);
    }
  }

  tryGetVersionRec(): { success: boolean; rec: FtDeclaredParameterRec } {
    const idx = this.indexOfName(FtDeclaredParameters.VERSION_PARAMETER_NAME);
    if (idx < 0) {
      return {
        success: false,
        rec: { name: FtDeclaredParameters.VERSION_PARAMETER_NAME, value: '' },
      };
    } else {
      return { success: true, rec: this._list[idx] };
    }
  }

  getAllRecsExceptVersion(): FtDeclaredParameterRec[] {
    const recs: FtDeclaredParameterRec[] = [];
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].name.toLowerCase() !== FtDeclaredParameters.VERSION_PARAMETER_NAME.toLowerCase()) {
        recs.push(this._list[i]);
      }
    }
    return recs;
  }

  private versionToText(major: number, minor: number, comment: string): string {
    const majorMinor = major.toString() + FtDeclaredParameters.VERSION_PARTS_SEPARATOR + minor.toString();

    if (comment.length === 0) {
      return majorMinor;
    } else {
      return majorMinor + FtDeclaredParameters.VERSION_PARTS_SEPARATOR + comment;
    }
  }

  private parseVersionValue(text: string): Result<Version, boolean> {
    const majorMinorSeparatorIdx = text.indexOf(FtDeclaredParameters.VERSION_PARTS_SEPARATOR);
    if (majorMinorSeparatorIdx <= 0 || majorMinorSeparatorIdx >= text.length - 1) {
      return new Err(false);
    }

    let minorCommentSeparatorIdx = text.indexOf(FtDeclaredParameters.VERSION_PARTS_SEPARATOR, majorMinorSeparatorIdx + 1);
    let comment: string;
    if (minorCommentSeparatorIdx < 0) {
      comment = '';
      minorCommentSeparatorIdx = text.length;
    } else {
      if (minorCommentSeparatorIdx >= text.length - 1) {
        comment = '';
      } else {
        comment = text.substring(minorCommentSeparatorIdx + 1);
      }
    }

    const majorText = text.substring(0, majorMinorSeparatorIdx);
    const majorResult = this.parseMajorMinorVersionText(majorText);
    if (majorResult.isErr()) {
      return majorResult.createType();
    }

    const minorText = text.substring(majorMinorSeparatorIdx + 1, minorCommentSeparatorIdx);
    const minorResult = this.parseMajorMinorVersionText(minorText);
    if (minorResult.isErr()) {
      return minorResult.createType();
    }

    return new Ok({
      major: majorResult.value,
      minor: minorResult.value,
      comment,
    });
  }

  private parseMajorMinorVersionText(text: string): Result<number, boolean> {
    if (!isStringifiedInteger(text)) {
      return new Err(false);
    } else {
      const result = parseInt(text, 10);
      if (Number.isNaN(result)) {
        return new Err(false);
      } else {
        return new Ok(result);
      }
    }
  }
}

export interface Version {
  major: number;
  minor: number;
  comment: string;
}
