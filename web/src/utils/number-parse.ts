export function parseIntStrict(value: string) {
  return isStringifiedInteger(value) ? parseInt(value, 10) : undefined;
}

export function isStringifiedInteger(value: string) {
  const length = value.length;

  let gotDigit = false;

  for (let i = 0; i < length; i++) {
    const char = value[i];
    switch (char) {
      case '-': {
        if (i !== 0) {
          return false;
        } else {
          break;
        }
      }
      default: {
        if (!isDigitCharCode(char.charCodeAt(0))) {
          return false;
        } else {
          gotDigit = true;
        }
      }
    }
  }

  return gotDigit;
}

export function isDigitCharCode(charCode: number) {
  return charCode >= 48 && charCode <= 57;
}
