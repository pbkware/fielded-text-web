// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StringMetaSerialization {
  static serialize(value: string, defaultValue?: string): string | undefined {
    if (value === defaultValue) {
      return undefined;
    } else {
      return value;
    }
  }

  static deserialize(value: unknown, defaultValue: string, warnings: string[]): string {
    if (typeof value === 'undefined') {
      return defaultValue; // Default value
    } else {
      if (typeof value !== 'string') {
        warnings.push(`String: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        return value;
      }
    }
  }

  static tryDeserialize(value: unknown, warnings: string[]): string | undefined {
    if (typeof value !== 'string') {
      warnings.push(`String: Type: ${typeof value}`);
      return undefined;
    } else {
      return value;
    }
  }
}
