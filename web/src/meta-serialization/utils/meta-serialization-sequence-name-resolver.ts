import { FtMetaSequence } from '../../meta/sequences/core/ft-meta-sequence.js';

/** @internal */
export class MetaSerializationSequenceNameResolver {
  private static _baseRedirectUndefinedSequenceName = '---REDIRECT-UNDEFINED';
  private static _baseRedirectUnresolvedSequenceName = '---REDIRECT-UNRESOLVED-';

  private _recs = new Array<MetaSerializationSequenceNameResolver.Rec>();

  private _redirectUndefinedSequence: FtMetaSequence | undefined;

  get redirectUndefinedSequence(): FtMetaSequence {
    if (this._redirectUndefinedSequence !== undefined) {
      return this._redirectUndefinedSequence;
    } else {
      const name = this.generateUniqueName(MetaSerializationSequenceNameResolver._baseRedirectUndefinedSequenceName);
      const sequence = new FtMetaSequence();
      sequence.name = name;
      this._redirectUndefinedSequence = sequence;
      this.add({ sequence, name });
      return sequence;
    }
  }

  add(rec: MetaSerializationSequenceNameResolver.Rec): void {
    this._recs.push(rec);
  }

  resolve(warnings: string[]): FtMetaSequence[] {
    const recs = this._recs;
    const count = recs.length;
    const sequences = new Array<FtMetaSequence>(count);

    let rootSequence: FtMetaSequence | undefined;

    for (let i = 0; i < count; i++) {
      const rec = recs[i];
      const sequence = rec.sequence;
      if (sequence.root) {
        if (rootSequence === undefined) {
          rootSequence = sequence;
        } else {
          warnings.push(`Multiple root sequences found: ${rootSequence.name} and ${sequence.name}`);
          sequence.root = false;
        }
      }
      sequences[i] = sequence;
      const sequenceName = rec.name;
      if (sequenceName === undefined) {
        warnings.push(`Sequence with undefined name: ${JSON.stringify(rec.sequence)}`);
      } else {
        const existingRec = this._recs.find((r, findIndex) => findIndex !== i && r.name === sequenceName);
        if (existingRec !== undefined) {
          warnings.push(`Duplicate sequence name: ${sequenceName}`);
        }
        this._recs.push(rec);
      }
    }

    if (rootSequence === undefined) {
      warnings.push(`No root sequence found. Setting the first sequence as root: ${sequences[0].name}`);
      sequences[0].root = true;
    } else {
      const rootIndex = sequences.indexOf(rootSequence);
      if (rootIndex > 0) {
        // Make sure the root sequence is first in the list
        sequences.splice(rootIndex, 1);
        sequences.unshift(rootSequence);
      }
    }
    return sequences;
  }

  newRedirectUnresolvedSequence(unresolvedName: string): FtMetaSequence {
    const baseName = `${MetaSerializationSequenceNameResolver._baseRedirectUnresolvedSequenceName}${unresolvedName}`;
    const name = this.generateUniqueName(baseName);
    const sequence = new FtMetaSequence();
    sequence.name = name;
    this.add({ sequence, name });
    return sequence;
  }

  findDefinedNameSequence(name: string): FtMetaSequence | undefined {
    const rec = this._recs.find((aRec) => aRec.name === name);
    return rec?.sequence;
  }

  private generateUniqueName(baseName: string): string {
    let suffix = 1;
    let name = baseName;
    while (this.findDefinedNameSequence(name) !== undefined) {
      suffix++;
      name = `${baseName}-${suffix}`;
    }
    return name;
  }
}

/** @internal */
export namespace MetaSerializationSequenceNameResolver {
  export interface Rec {
    sequence: FtMetaSequence;
    name: string | undefined;
  }
}

/** @internal */
export namespace SequenceNameRec {}
