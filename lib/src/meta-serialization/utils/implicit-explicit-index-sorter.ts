export interface ImplicitExplicitIndexSortRec<T> {
  target: T;
  implicitIndex: number;
  explicitIndex: number;
}

export namespace ImplicitExplicitIndexSortRec {
  export const INDEX_NOT_SET = -1;

  export function compare(left: ImplicitExplicitIndexSortRec<unknown>, right: ImplicitExplicitIndexSortRec<unknown>): number {
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

  export function checkSortedArray(arr: ImplicitExplicitIndexSortRec<unknown>[], targetType: string, warnings: string[]): void {
    let negativeWarned = false;
    let outOfBoundsWarned = false;
    let duplicateWarned = false;

    const count = arr.length;
    for (let i = 1; i < arr.length; i++) {
      const rec = arr[i];
      if (rec.explicitIndex !== i) {
        if (rec.explicitIndex < 0) {
          if (!negativeWarned) {
            warnings.push(`One or more negative explicit index: ${targetType}`);
            negativeWarned = true;
          }
        } else {
          if (rec.explicitIndex >= count) {
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
