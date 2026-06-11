import { FloatMetaSerialization } from './float-meta-serialization.js';

// Use same serialization as Float until JavaScript has a separate Decimal type
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DecimalMetaSerialization {
  static serialize(value: number, defaultValue: number): string | undefined {
    return FloatMetaSerialization.serialize(value, defaultValue);
  }

  static deserialize(value: unknown, defaultValue: number, warnings: string[]): number {
    return FloatMetaSerialization.deserialize(value, defaultValue, warnings);
  }
}
