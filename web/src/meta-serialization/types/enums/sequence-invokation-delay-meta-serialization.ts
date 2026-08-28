import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtSequenceInvokationDelay } from '../../../types/enums/ft-sequence-invokation-delay.js';

export namespace SequenceInvokationDelayMetaSerialization {
  export const defaultValue = FtMetaDefaults.SequenceRedirect.InvokationDelay;

  export function serialize(value: FtSequenceInvokationDelay): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, warnings: string[]): FtSequenceInvokationDelay {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`SequenceInvokationDelay: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`SequenceInvokationDelay: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtSequenceInvokationDelay, string> = {
  [FtSequenceInvokationDelay.AfterField]: 'AfterField',
  [FtSequenceInvokationDelay.AfterSequence]: 'AfterSequence',
};

const deserializeMap: Record<string, FtSequenceInvokationDelay> = {
  AfterField: FtSequenceInvokationDelay.AfterField,
  AfterSequence: FtSequenceInvokationDelay.AfterSequence,
};
