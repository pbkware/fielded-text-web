// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CharMetaSerialization {
  static serialize(value: string, defaultValue: string): string | undefined {
    if (value === defaultValue) {
      return undefined; // Default value
    } else {
      return value;
    }
  }

  static deserialize(value: unknown, defaultValue: string, warnings: string[]): string {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Char: Type: ${typeof value}`);
        return defaultValue;
      } else {
        if (value.length !== 1) {
          warnings.push(`Char: Length: ${value}`);
          return defaultValue;
        } else {
          return value;
        }
      }
    }
  }
}
