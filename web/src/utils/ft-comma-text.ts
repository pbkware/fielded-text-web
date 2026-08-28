import { FtUnreachableCaseError } from './ft-internal-error.js';
import { FtErr, FtOk, FtResult } from './ft-result.js';
import { StringBuilder } from './string-builder.js';

/** @public */
export namespace FtCommaText {
  const enum InQuotes {
    NotIn,
    In,
    CheckingStuffed,
  }

  export const delimiterChar = ',';
  export const quoteChar = '"';
  export const pairQuoteChar = quoteChar + quoteChar;
  const quoteCharGlobalRegEx = /"/g;
  const pairQuoteCharGlobalRegEx = /""/g;

  export function from2Values(value1: string, value2: string): string {
    const array: string[] = new Array<string>(2);
    array[0] = value1;
    array[1] = value2;
    return fromStringArray(array);
  }

  export function from3Values(value1: string, value2: string, value3: string): string {
    const array: string[] = new Array<string>(3);
    array[0] = value1;
    array[1] = value2;
    array[2] = value3;
    return fromStringArray(array);
  }

  export function from4Values(value1: string, value2: string, value3: string, value4: string): string {
    const array: string[] = new Array<string>(4);
    array[0] = value1;
    array[1] = value2;
    array[2] = value3;
    array[3] = value4;
    return fromStringArray(array);
  }

  export function fromStringArray(value: readonly string[]): string {
    function appendQuotedString(unquotedValue: string) {
      resultBldr.append(quoteChar);
      const quoteStuffedValue = unquotedValue.replace(quoteCharGlobalRegEx, pairQuoteChar);
      resultBldr.append(quoteStuffedValue);
      resultBldr.append(quoteChar);
    }

    const resultBldr = new StringBuilder();

    for (let i = 0; i < value.length; i++) {
      if (i > 0) {
        resultBldr.append(delimiterChar);
      }

      const element = value[i];

      if (element.includes(delimiterChar)) {
        appendQuotedString(element);
      } else {
        const trimmedValue = element.trim();
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        if (trimmedValue.length > 0 && trimmedValue[0] === quoteChar) {
          appendQuotedString(element);
        } else {
          resultBldr.append(element);
        }
      }
    }

    return resultBldr.toString();
  }

  export function fromIntegerArray(value: number[]): string {
    const strArray = new Array<string>(value.length);
    for (let i = 0; i < value.length; i++) {
      strArray[i] = value[i].toString(10);
    }
    return fromStringArray(strArray);
  }

  export function toStringArray(value: string): string[] {
    const toResult = tryToStringArray(value, false);
    if (toResult.isOk()) {
      return toResult.value;
    } else {
      const errorIdPlusExtra = toResult.error;
      const errorId = errorIdPlusExtra.errorId;
      const message = `CommaText error: ${errorIdToEnglish(errorId)}: ${value}`;
      throw new Error(message, errorId, errorIdPlusExtra.extraInfo);
    }
  }

  export function tryToStringArray(
    value: string,
    strict = true,
  ): FtResult<string[], ErrorIdPlusExtra<typeof ErrorId.QuotesNotClosedInLastElement | typeof ErrorId.UnexpectedCharAfterQuotedElement>> {
    function addElement(endPos: number, removeStuffedQuotes: boolean) {
      let elemStr = value.substring(startPos, endPos + 1);
      if (removeStuffedQuotes) {
        elemStr = elemStr.replace(pairQuoteCharGlobalRegEx, quoteChar);
      }
      resultArray.push(elemStr.trim());
    }

    const resultArray: string[] = [];
    let inQuotes = InQuotes.NotIn;
    let waitingForDelimiter = false;
    let startPos = 0;
    const valueLength = value.length;

    for (let i = 0; i < valueLength; i++) {
      const valueChar = value[i];
      if (waitingForDelimiter) {
        if (valueChar === delimiterChar) {
          waitingForDelimiter = false;
          startPos = i + 1;
        } else {
          if (strict && !/\s/.test(valueChar)) {
            return new FtErr({ errorId: ErrorId.UnexpectedCharAfterQuotedElement, extraInfo: `${i}` });
          }
        }
      } else {
        switch (inQuotes) {
          case InQuotes.NotIn:
            switch (valueChar) {
              case delimiterChar:
                addElement(i - 1, false);
                startPos = i + 1;
                break;
              case quoteChar:
                if (value.substring(startPos, i).trim().length === 0) {
                  inQuotes = InQuotes.In;
                  startPos = i + 1;
                }
                break;
            }
            break;
          case InQuotes.In:
            if (valueChar === quoteChar) {
              inQuotes = InQuotes.CheckingStuffed;
            }
            break;
          case InQuotes.CheckingStuffed:
            switch (valueChar) {
              case quoteChar:
                inQuotes = InQuotes.In;
                break;
              case delimiterChar:
                inQuotes = InQuotes.NotIn;
                addElement(i - 2, true);
                startPos = i + 1;
                break;
              default:
                inQuotes = InQuotes.NotIn;
                addElement(i - 2, true);
                waitingForDelimiter = true;

                if (strict && !/\s/g.test(valueChar)) {
                  return new FtErr({ errorId: ErrorId.UnexpectedCharAfterQuotedElement, extraInfo: `${i}` });
                }
            }
            break;
          default:
            throw new FtUnreachableCaseError('CTTTSA66699', inQuotes);
        }
      }
    }

    if (!waitingForDelimiter) {
      switch (inQuotes) {
        case InQuotes.NotIn:
          if (startPos <= valueLength) {
            addElement(valueLength, false);
          }
          break;
        case InQuotes.In:
          if (!strict) {
            addElement(valueLength, true);
          } else {
            return new FtErr({ errorId: ErrorId.QuotesNotClosedInLastElement, extraInfo: value });
          }
          break;
        case InQuotes.CheckingStuffed:
          addElement(valueLength - 2, true);
          break;
        default:
          throw new FtUnreachableCaseError('CTTSAWR24240', inQuotes);
      }
    }

    return new FtOk(resultArray);
  }

  export interface ToIntegerArrayResult {
    success: boolean;
    array: number[];
    errorText: string;
  }

  export function toIntegerArrayWithResult(
    value: string,
  ): FtResult<
    number[],
    ErrorIdPlusExtra<
      typeof ErrorId.QuotesNotClosedInLastElement | typeof ErrorId.UnexpectedCharAfterQuotedElement | typeof ErrorId.InvalidIntegerString
    >
  > {
    const strResult = tryToStringArray(value, true);
    if (strResult.isErr()) {
      return strResult.createType();
    } else {
      const strArray = strResult.value;
      const intResult = new Array<number>(strArray.length);
      for (let i = 0; i < strArray.length; i++) {
        intResult[i] = +strArray[i];
        if (isNaN(intResult[i])) {
          return new FtErr({ errorId: ErrorId.InvalidIntegerString, extraInfo: `${i}, ${strArray[i]}` });
        }
      }

      return new FtOk(intResult);
    }
  }

  export interface StrictValidateResult {
    success: boolean;
    errorText: string;
  }

  export function strictValidate(
    value: string,
  ): FtResult<boolean, ErrorIdPlusExtra<typeof ErrorId.QuotesNotClosedInLastElement | typeof ErrorId.UnexpectedCharAfterQuotedElement>> {
    const stringResult = tryToStringArray(value, true);
    if (stringResult.isErr()) {
      return stringResult.createType();
    } else {
      return new FtOk(true);
    }
  }

  export const ErrorId = {
    UnexpectedCharAfterQuotedElement: 'UnexpectedCharAfterQuotedElement',
    QuotesNotClosedInLastElement: 'QuotesNotClosedInLastElement',
    InvalidIntegerString: 'InvalidIntegerString',
  } as const;

  export type ErrorId = (typeof ErrorId)[keyof typeof ErrorId];

  export function errorIdToEnglish(errorId: ErrorId) {
    switch (errorId) {
      case ErrorId.UnexpectedCharAfterQuotedElement:
        return 'Unexpected char after quoted element';
      case ErrorId.QuotesNotClosedInLastElement:
        return 'Quotes not closed in last element';
      case ErrorId.InvalidIntegerString:
        return 'Invalid integer string';
      default:
        throw new FtUnreachableCaseError('CTEOITE98114', errorId);
    }
  }

  export interface ErrorIdPlusExtra<T extends ErrorId> {
    readonly errorId: T;
    readonly extraInfo: string;
  }

  export namespace ErrorIdPlusExtra {
    export function toEnglish(errorIdPlusExtra: ErrorIdPlusExtra<ErrorId>) {
      return `${errorIdToEnglish(errorIdPlusExtra.errorId)}: ${errorIdPlusExtra.extraInfo}`;
    }
  }

  export class Error extends globalThis.Error {
    constructor(
      message: string,
      readonly errorId: ErrorId,
      readonly extraInfo: string,
    ) {
      super(message);
    }
  }
}
