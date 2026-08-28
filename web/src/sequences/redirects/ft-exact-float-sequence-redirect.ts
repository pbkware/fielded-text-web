import { FtField } from '../../fields/instances/ft-field.js';
import { FtMetaSequenceList } from '../../meta/sequences/core/ft-meta-sequence-list.js';
import { FtExactFloatMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-exact-float-meta-sequence-redirect.js';
import { FtSequenceRedirectType } from '../../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceList } from '../core/ft-sequence-list.js';
import { FtSequenceRedirect } from './ft-sequence-redirect.js';

/**
 * Sequence redirect that triggers when a field exactly equals a specific float (number) value.
 * @public
 */
export class FtExactFloatSequenceRedirect extends FtSequenceRedirect {
  static readonly TYPE = FtSequenceRedirectType.ExactFloat;

  private _value = 0;

  constructor(index: number) {
    super(index, FtExactFloatSequenceRedirect.TYPE);
  }

  get value(): number {
    return this._value;
  }

  checkTriggered(field: FtField): boolean {
    if (field.isNull()) {
      return false;
    }
    try {
      return field.asRedirectFloat === this._value;
    } catch {
      return false;
    }
  }

  /** @internal */
  override loadMeta(
    metaSequenceRedirect: FtExactFloatMetaSequenceRedirect,
    metaSequenceList: FtMetaSequenceList,
    sequenceList: FtSequenceList,
  ): void {
    super.loadMeta(metaSequenceRedirect, metaSequenceList, sequenceList);

    this._value = metaSequenceRedirect.value;
  }
}
