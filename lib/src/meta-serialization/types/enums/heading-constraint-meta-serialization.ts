import { FtMetaDefaults } from '../../../meta/ft-meta-defaults.js';
import { FtHeadingConstraint } from '../../../types/enums/ft-heading-constraint.js';

export namespace HeadingConstraintMetaSerialization {
  export const headingDefaultValue = FtMetaDefaults.Root.HeadingConstraint;

  export function serialize(value: FtHeadingConstraint, overridingHeadingDefault: FtHeadingConstraint | undefined): string | undefined {
    const defaultValue = overridingHeadingDefault ?? headingDefaultValue;
    if (value === defaultValue) {
      return undefined;
    } else {
      return serializeMap[value];
    }
  }

  export function deserialize(value: unknown, overridingHeadingDefault: FtHeadingConstraint | undefined, warnings: string[]): FtHeadingConstraint {
    const defaultValue = overridingHeadingDefault ?? headingDefaultValue;
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`HeadingConstraint: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const result = deserializeMap[value.trim()];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result === undefined) {
          warnings.push(`HeadingConstraint: Value: ${value}`);
          return defaultValue;
        } else {
          return result;
        }
      }
    }
  }
}

const serializeMap: Record<FtHeadingConstraint, string> = {
  [FtHeadingConstraint.None]: 'None',
  [FtHeadingConstraint.AllConstant]: 'AllConstant',
  [FtHeadingConstraint.MainConstant]: 'MainConstant',
  [FtHeadingConstraint.NameConstant]: 'NameConstant',
  [FtHeadingConstraint.NameIsMain]: 'NameIsMain',
};

const deserializeMap: Record<string, FtHeadingConstraint> = {
  None: FtHeadingConstraint.None,
  AllConstant: FtHeadingConstraint.AllConstant,
  MainConstant: FtHeadingConstraint.MainConstant,
  NameConstant: FtHeadingConstraint.NameConstant,
  NameIsMain: FtHeadingConstraint.NameIsMain,
};
