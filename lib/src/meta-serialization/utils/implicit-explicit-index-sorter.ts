import { FtMetaField } from '../../meta/fields/ft-meta-field.js';
import { FtMetaSequenceItem } from '../../meta/sequences/core/ft-meta-sequence-item.js';
import { MetaSerializationRedirectSequenceResolver } from './meta-serialization-redirect-sequence-resolver.js';

export interface ImplicitExplicitIndexSortRec<T extends FtMetaField | FtMetaSequenceItem | MetaSerializationRedirectSequenceResolver.Rec> {
  target: T;
  implicitIndex: number;
  explicitIndex: number;
}

export namespace ImplicitExplicitIndexSortRec {
  export const INDEX_NOT_SET = -1;

  export function compare<T extends FtMetaField | FtMetaSequenceItem | MetaSerializationRedirectSequenceResolver.Rec>(
    left: ImplicitExplicitIndexSortRec<T>,
    right: ImplicitExplicitIndexSortRec<T>,
  ): number {
    const leftHasExplicit = left.explicitIndex !== INDEX_NOT_SET;
    const rightHasExplicit = right.explicitIndex !== INDEX_NOT_SET;

    const leftIndex = leftHasExplicit ? left.explicitIndex : left.implicitIndex;
    const rightIndex = rightHasExplicit ? right.explicitIndex : right.implicitIndex;

    const result = leftIndex - rightIndex;
    if (result === 0) {
      // If indices are equal, explicit indices take precedence
      if (leftHasExplicit && !rightHasExplicit) {
        return -1; // left comes before right
      } else {
        if (!leftHasExplicit && rightHasExplicit) {
          return 1; // left comes after right
        }
      }
    }
    return result;
  }

  export function checkSortedArray<T extends FtMetaField | FtMetaSequenceItem | MetaSerializationRedirectSequenceResolver.Rec>(
    arr: ImplicitExplicitIndexSortRec<T>[],
    targetType: string,
    warnings: string[],
  ): void {
    let outOfBoundsWarned = false;
    let duplicateWarned = false;

    const count = arr.length;
    for (let i = 1; i < arr.length; i++) {
      const rec = arr[i];
      const explicitIndex = rec.explicitIndex;
      if (explicitIndex >= 0) {
        if (explicitIndex !== i) {
          if (explicitIndex >= count) {
            if (!outOfBoundsWarned) {
              warnings.push(`One or more explicit index out of bounds: ${targetType}`);
              outOfBoundsWarned = true;
            }
          } else {
            if (!duplicateWarned) {
              warnings.push(`One or more duplicate explicit index: ${targetType}`);
              duplicateWarned = true;
            }
          }
        }
      }
    }
  }
}
