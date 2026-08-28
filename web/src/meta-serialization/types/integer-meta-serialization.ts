// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class IntegerMetaSerialization {
  static serialize(value: bigint, defaultValue: bigint): string | undefined {
    if (value === defaultValue) {
      return undefined; // Default value
    } else {
      return value.toString(10);
    }
  }

  static deserialize(value: unknown, defaultValue: bigint, warnings: string[]): bigint {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`Integer: Type: ${typeof value}`);
        return defaultValue; // Default value
      } else {
        const trimmedValue = value.trim();

        let result: bigint;
        try {
          result = BigInt(trimmedValue);
        } catch (e) {
          if (e instanceof SyntaxError) {
            warnings.push(`Integer: Syntax: ${value}`);
          } else {
            if (e instanceof RangeError) {
              warnings.push(`Integer: Range: ${value}`);
            } else {
              if (e instanceof TypeError) {
                warnings.push(`Integer: TypeError: ${value}`);
              } else {
                throw e;
              }
            }
          }
          return defaultValue;
        }
        return result;
      }
    }
  }
}
