import { FtMetaSequenceRedirect } from '../../meta/sequences/redirects/ft-meta-sequence-redirect.js';
import { MetaSerializationSequenceNameResolver } from './meta-serialization-sequence-name-resolver.js';

/** @internal */
export class MetaSerializationRedirectSequenceResolver {
  private _recs = new Array<MetaSerializationRedirectSequenceResolver.Rec>();

  constructor(private readonly _sequenceNameResolver: MetaSerializationSequenceNameResolver) {}

  add(redirect: FtMetaSequenceRedirect, sequenceName: string | undefined): void {
    this._recs.push({ redirect, sequenceName });
  }

  resolve(warnings: string[]): void {
    const count = this._recs.length;

    for (let i = 0; i < count; i++) {
      const redirectNameRec = this._recs[i];

      const sequenceName = redirectNameRec.sequenceName;
      if (sequenceName === undefined) {
        warnings.push(`Sequence redirect with undefined sequence name: ${JSON.stringify(redirectNameRec.redirect)}`);
        redirectNameRec.redirect.sequence = this._sequenceNameResolver.redirectUndefinedSequence;
      } else {
        const targetSequence = this._sequenceNameResolver.findDefinedNameSequence(sequenceName);
        if (targetSequence === undefined) {
          warnings.push(`Sequence redirect with unresolved sequence name: ${sequenceName}`);
          redirectNameRec.redirect.sequence = this._sequenceNameResolver.newRedirectUnresolvedSequence(sequenceName);
        } else {
          redirectNameRec.redirect.sequence = targetSequence;
        }
      }
    }
  }
}

/** @internal */
export namespace MetaSerializationRedirectSequenceResolver {
  export interface Rec {
    redirect: FtMetaSequenceRedirect;
    sequenceName: string | undefined;
  }
}
