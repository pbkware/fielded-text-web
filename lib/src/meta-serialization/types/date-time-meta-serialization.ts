import { parseIntStrict } from '@pbkware/js-utils';
import { FtMetaDefaults } from '../../meta/ft-meta-defaults.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DateTimeMetaSerialization {
  static serialize(date: Date, defaultValue: Date): string | undefined {
    if (date.getTime() === defaultValue.getTime()) {
      return undefined; // Default value
    } else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();
      const millisecond = date.getMilliseconds();

      let result = year.toString().padStart(4, '0') + month.toString().padStart(2, '0') + day.toString().padStart(2, '0');

      if (hour !== 0 || minute !== 0 || second !== 0 || millisecond !== 0) {
        result += hour.toString().padStart(2, '0') + minute.toString().padStart(2, '0') + second.toString().padStart(2, '0');
        if (millisecond !== 0) {
          result += FtMetaDefaults.DateTimeField.TimeAndFractionSeparatorChar + millisecond.toString().padStart(3, '0');
        }
      }

      return result;
    }
  }

  static deserialize(value: unknown, defaultValue: Date, warnings: string[]): Date {
    if (typeof value === 'undefined') {
      return defaultValue;
    } else {
      if (typeof value !== 'string') {
        warnings.push(`DateTime: Type: ${typeof value}`);
        return defaultValue;
      } else {
        const trimmedValue = value.trim();
        const length = trimmedValue.length;
        if (length < FtMetaDefaults.DateTimeField.TimeFormatLength) {
          warnings.push(`DateTime: Too short: ${value}`);
          return defaultValue;
        } else {
          if (length === FtMetaDefaults.DateTimeField.TimeFormatLength) {
            return DateTimeMetaSerialization.deserializeTime(trimmedValue, false, defaultValue, warnings);
          } else {
            if (trimmedValue[FtMetaDefaults.DateTimeField.TimeFormatLength] === FtMetaDefaults.DateTimeField.TimeAndFractionSeparatorChar) {
              return DateTimeMetaSerialization.deserializeTime(trimmedValue, true, defaultValue, warnings);
            } else {
              if (length === FtMetaDefaults.DateTimeField.DateFormatLength) {
                return DateTimeMetaSerialization.deserializeDate(trimmedValue, defaultValue, warnings);
              } else {
                if (length === FtMetaDefaults.DateTimeField.DateTimeFormatLength) {
                  return DateTimeMetaSerialization.deserializeDateTime(trimmedValue, false, defaultValue, warnings);
                } else {
                  if (
                    length > FtMetaDefaults.DateTimeField.DateTimeFormatLength &&
                    trimmedValue[FtMetaDefaults.DateTimeField.DateTimeFormatLength] === FtMetaDefaults.DateTimeField.TimeAndFractionSeparatorChar
                  ) {
                    return DateTimeMetaSerialization.deserializeDateTime(trimmedValue, true, defaultValue, warnings);
                  } else {
                    warnings.push(`DateTime: Invalid format: ${value}`);
                    return defaultValue;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private static deserializeYearMonthDay(text: string, warnings: string[]): YearMonthDay | undefined {
    const year = parseIntStrict(text.substring(0, 4));
    if (year === undefined || Number.isNaN(year)) {
      warnings.push(`DateTime: Invalid year: ${text}`);
    } else {
      if (year < 1 || year > 9999) {
        warnings.push(`DateTime: Year out of range: ${text}`);
      } else {
        const month = parseIntStrict(text.substring(4, 6));
        if (month === undefined || Number.isNaN(month)) {
          warnings.push(`DateTime: Invalid month: ${text}`);
        } else {
          if (month < 1 || month > 12) {
            warnings.push(`DateTime: Month out of range: ${text}`);
          } else {
            const day = parseIntStrict(text.substring(6, 8));
            if (day === undefined || Number.isNaN(day)) {
              warnings.push(`DateTime: Invalid day: ${text}`);
            } else {
              if (day < 1 || day > 31) {
                warnings.push(`DateTime: Day out of range: ${text}`);
              } else {
                return { year, month, day };
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private static deserializeHourMinuteSecond(text: string, hasFraction: boolean, warnings: string[]): HourMinuteSecondMilli | undefined {
    const hour = parseIntStrict(text.substring(0, 2));
    if (hour === undefined || Number.isNaN(hour)) {
      warnings.push(`DateTime: Invalid hour: ${text}`);
    } else {
      if (hour < 0 || hour > 23) {
        warnings.push(`DateTime: Hour out of range: ${text}`);
      } else {
        const minute = parseIntStrict(text.substring(2, 4));
        if (minute === undefined || Number.isNaN(minute)) {
          warnings.push(`DateTime: Invalid minute: ${text}`);
        } else {
          if (minute < 0 || minute > 59) {
            warnings.push(`DateTime: Minute out of range: ${text}`);
          } else {
            const second = parseIntStrict(text.substring(4, 6));
            if (second === undefined || Number.isNaN(second)) {
              warnings.push(`DateTime: Invalid second: ${text}`);
            } else {
              if (second < 0 || second > 59) {
                warnings.push(`DateTime: Second out of range: ${text}`);
              } else {
                if (!hasFraction) {
                  return { hour, minute, second, millisecond: 0 };
                } else {
                  const fractionText = text.substring(FtMetaDefaults.DateTimeField.TimeFormatLength + 1);
                  const fractionLength = fractionText.length;
                  if (fractionLength > FtMetaDefaults.DateTimeField.MaxFractionLength) {
                    warnings.push(`DateTime: Too long fraction: ${text}`);
                  } else {
                    const fractionValue = parseIntStrict(fractionText);
                    if (fractionValue === undefined || Number.isNaN(fractionValue)) {
                      warnings.push(`DateTime: Invalid fraction: ${text}`);
                    } else {
                      const millisecond = Math.round(fractionValue * Math.pow(10, 3 - fractionLength));
                      return { hour, minute, second, millisecond };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private static deserializeDate(text: string, defaultValue: Date, warnings: string[]): Date {
    const ymd = this.deserializeYearMonthDay(text, warnings);
    if (ymd === undefined) {
      return new Date(defaultValue);
    } else {
      let result: Date;
      try {
        result = new Date(ymd.year, ymd.month - 1, ymd.day);
      } catch {
        warnings.push(`DateTime: Invalid date: ${text}`);
        return new Date(defaultValue);
      }
      return result;
    }
  }

  private static deserializeTime(text: string, hasFraction: boolean, defaultValue: Date, warnings: string[]): Date {
    const hms = this.deserializeHourMinuteSecond(text, hasFraction, warnings);
    if (hms === undefined) {
      return new Date(defaultValue);
    } else {
      let result: Date;
      try {
        result = new Date(1, 0, 1, hms.hour, hms.minute, hms.second, hms.millisecond);
      } catch {
        warnings.push(`DateTime: Invalid time: ${text}`);
        return new Date(defaultValue);
      }
      return result;
    }
  }

  private static deserializeDateTime(text: string, hasFraction: boolean, defaultValue: Date, warnings: string[]): Date {
    const ymd = this.deserializeYearMonthDay(text, warnings);
    if (ymd === undefined) {
      return new Date(defaultValue);
    } else {
      const hms = this.deserializeHourMinuteSecond(text, hasFraction, warnings);
      if (hms === undefined) {
        return new Date(defaultValue);
      } else {
        let result: Date;
        try {
          result = new Date(ymd.year, ymd.month - 1, ymd.day, hms.hour, hms.minute, hms.second, hms.millisecond);
        } catch {
          warnings.push(`DateTime: Invalid date-time: ${text}`);
          return new Date(defaultValue);
        }
        return result;
      }
    }
  }
}

interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

interface HourMinuteSecondMilli {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}
