import { Err, Ok, Result } from '@pbkware/js-utils';
import { FtBooleanSequenceRedirect } from '../sequences/redirects/ft-boolean-sequence-redirect.js';
import { FtCaseInsensitiveStringSequenceRedirect } from '../sequences/redirects/ft-case-insensitive-string-sequence-redirect.js';
import { FtDateSequenceRedirect } from '../sequences/redirects/ft-date-sequence-redirect.js';
import { FtExactDateTimeSequenceRedirect } from '../sequences/redirects/ft-exact-date-time-sequence-redirect.js';
import { FtExactDecimalSequenceRedirect } from '../sequences/redirects/ft-exact-decimal-sequence-redirect.js';
import { FtExactFloatSequenceRedirect } from '../sequences/redirects/ft-exact-float-sequence-redirect.js';
import { FtExactIntegerSequenceRedirect } from '../sequences/redirects/ft-exact-integer-sequence-redirect.js';
import { FtExactStringSequenceRedirect } from '../sequences/redirects/ft-exact-string-sequence-redirect.js';
import { FtNullSequenceRedirect } from '../sequences/redirects/ft-null-sequence-redirect.js';
import { FtSequenceRedirect } from '../sequences/redirects/ft-sequence-redirect.js';
import { FtSequenceRedirectType } from '../types/enums/ft-sequence-redirect-type.js';
import { FtSequenceRedirectConstructor } from './ft-sequence-redirect-constructor.js';

// Concrete constructor implementations
class NullSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtNullSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtNullSequenceRedirect.TYPE;
  }
}

class BooleanSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtBooleanSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtBooleanSequenceRedirect.TYPE;
  }
}

class ExactStringSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtExactStringSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtExactStringSequenceRedirect.TYPE;
  }
}

class CaseInsensitiveStringSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtCaseInsensitiveStringSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtCaseInsensitiveStringSequenceRedirect.TYPE;
  }
}

class ExactIntegerSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtExactIntegerSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtExactIntegerSequenceRedirect.TYPE;
  }
}

class ExactFloatSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtExactFloatSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtExactFloatSequenceRedirect.TYPE;
  }
}

class ExactDecimalSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtExactDecimalSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtExactDecimalSequenceRedirect.TYPE;
  }
}

class ExactDateTimeSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtExactDateTimeSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtExactDateTimeSequenceRedirect.TYPE;
  }
}

class DateSequenceRedirectConstructor extends FtSequenceRedirectConstructor {
  createSequenceRedirect(index: number): FtSequenceRedirect {
    return new FtDateSequenceRedirect(index);
  }
  protected getSequenceRedirectType(): FtSequenceRedirectType {
    return FtDateSequenceRedirect.TYPE;
  }
}

/**
 * Factory for creating sequence redirects.
 * Manages a registry of redirect types and their constructors.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FtSequenceRedirectFactory {
  private static constructorList: FtSequenceRedirectConstructor[] = [];

  // Static initializer - register standard constructors
  private static initialized = (() => {
    FtSequenceRedirectFactory.constructorList = [];
    FtSequenceRedirectFactory.constructorList.push(new NullSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new BooleanSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new CaseInsensitiveStringSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new DateSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new ExactDateTimeSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new ExactDecimalSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new ExactFloatSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new ExactIntegerSequenceRedirectConstructor());
    FtSequenceRedirectFactory.constructorList.push(new ExactStringSequenceRedirectConstructor());
    return true;
  })();

  static registerConstructor(constructor: FtSequenceRedirectConstructor): void {
    if (FtSequenceRedirectFactory.tryFindConstructorByType(constructor.sequenceRedirectType)) {
      throw new Error(`SequenceRedirect type ${constructor.sequenceRedirectType} is already registered`);
    }
    if (FtSequenceRedirectFactory.tryFindConstructorByName(constructor.sequenceRedirectTypeName)) {
      throw new Error(`SequenceRedirect type name "${constructor.sequenceRedirectTypeName}" is already registered`);
    }
    FtSequenceRedirectFactory.constructorList.push(constructor);
  }

  static getRegisteredConstructors(): FtSequenceRedirectConstructor[] {
    return [...FtSequenceRedirectFactory.constructorList];
  }

  static unregisterAllConstructors(): void {
    FtSequenceRedirectFactory.constructorList = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  static unregisterConstructor(constructorOrType: FtSequenceRedirectConstructor | FtSequenceRedirectType | string): void {
    if (typeof constructorOrType === 'number') {
      const idx = FtSequenceRedirectFactory.constructorList.findIndex((c) => c.sequenceRedirectType === constructorOrType);
      if (idx >= 0) {
        FtSequenceRedirectFactory.constructorList.splice(idx, 1);
      }
    } else if (typeof constructorOrType === 'string') {
      const lowerName = constructorOrType.toLowerCase();
      const idx = FtSequenceRedirectFactory.constructorList.findIndex((c) => c.sequenceRedirectTypeName.toLowerCase() === lowerName);
      if (idx >= 0) {
        FtSequenceRedirectFactory.constructorList.splice(idx, 1);
      }
    } else {
      const idx = FtSequenceRedirectFactory.constructorList.indexOf(constructorOrType);
      if (idx >= 0) {
        FtSequenceRedirectFactory.constructorList.splice(idx, 1);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  static createSequenceRedirect(index: number, typeOrName: FtSequenceRedirectType | string): FtSequenceRedirect {
    const constructor =
      typeof typeOrName === 'number'
        ? FtSequenceRedirectFactory.tryFindConstructorByType(typeOrName)
        : FtSequenceRedirectFactory.tryFindConstructorByName(typeOrName);

    if (!constructor) {
      throw new Error(`No constructor found for sequence redirect type: ${typeOrName}`);
    }
    return constructor.createSequenceRedirect(index);
  }

  static getName(type: FtSequenceRedirectType): string {
    const constructor = FtSequenceRedirectFactory.tryFindConstructorByType(type);
    if (!constructor) {
      throw new Error(`No constructor found for type: ${type}`);
    }
    return constructor.sequenceRedirectTypeName;
  }

  static tryGetType(typeName: string): Result<FtSequenceRedirectType, boolean> {
    const constructor = FtSequenceRedirectFactory.tryFindConstructorByName(typeName);
    if (constructor) {
      return new Ok(constructor.sequenceRedirectType);
    }
    return new Err(false);
  }

  private static tryFindConstructorByType(type: FtSequenceRedirectType): FtSequenceRedirectConstructor | undefined {
    return FtSequenceRedirectFactory.constructorList.find((c) => c.sequenceRedirectType === type);
  }

  private static tryFindConstructorByName(typeName: string): FtSequenceRedirectConstructor | undefined {
    const lowerName = typeName.toLowerCase();
    return FtSequenceRedirectFactory.constructorList.find((c) => c.sequenceRedirectTypeName.toLowerCase() === lowerName);
  }
}
