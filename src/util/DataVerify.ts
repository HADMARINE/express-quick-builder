import ErrorDictionary from './ErrorDictionary';

class DataVerifierBlueprint<PropertiesType> {
  properties: Partial<PropertiesType>;

  constructor() {
    this.properties = {};
  }

  public setProperties(properties: Partial<PropertiesType>): this {
    this.properties = properties;
    return this;
  }
}

interface DataVerifierInterface<T> {
  typeguard: (data: any) => data is T;
  transformer: (data: any, key: string) => T;
}

type nully = null | undefined;

type ProcessorType = {
  [key: string]: ProcessorType | PureProcessorType;
};

type PureProcessorType = null;

function isNully(data: any): boolean {
  if (data === null || data === undefined) {
    return true;
  }
  return false;
}

function returnRecord(data: any): Record<any, any> | null {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
}

function returnArray<T>(data: any): T[] {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = JSON.parse(`[${data}]`);
    }
  }
  return data;
}

class StringVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<string>
{
  typeguard(data: any): data is string {
    return typeof data === 'string';
  }

  transformer(data: any, key: string): string {
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class StringNullVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<string | nully>
{
  typeguard(data: any): data is string | nully {
    return typeof data === 'string' || isNully(data);
  }

  transformer(data: any, key: string): string | nully {
    if (isNully(data)) {
      return null;
    }
    if (data) if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}

class DateVerifier
  extends DataVerifierBlueprint<{ verifyDateOnTypeGuard: boolean }>
  implements DataVerifierInterface<Date>
{
  typeguard(data: any): data is Date {
    if (this.properties.verifyDateOnTypeGuard) {
      if (typeof data === 'string') {
        try {
          new Date(data);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    } else {
      return typeof data === 'string';
    }
  }

  transformer(data: any, key: string): Date {
    try {
      return new Date(data);
    } catch {
      throw ErrorDictionary.data.parameterInvalid(key);
    }
  }
}

class DateNullVerifier
  extends DataVerifierBlueprint<{ verifyDateOnTypeGuard: boolean }>
  implements DataVerifierInterface<Date | nully>
{
  typeguard(data: any): data is Date {
    if (this.properties.verifyDateOnTypeGuard) {
      if (typeof data === 'string') {
        try {
          new Date(data);
          return true;
        } catch {
          return false;
        }
      } else if (isNully(data)) {
        return true;
      }
      return false;
    } else {
      return typeof data === 'string' || isNully(data);
    }
  }

  transformer(data: any, key: string): Date | nully {
    if (isNully(data)) {
      return null;
    }
    try {
      return new Date(data);
    } catch {
      throw ErrorDictionary.data.parameterInvalid(key);
    }
  }
}

class ObjectVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<Record<string, any>>
{
  typeguard(data: any): data is Record<string, any> {
    return data !== null && typeof data === 'object';
  }

  transformer(data: any, key: string): Record<string, any> {
    if (this.typeguard(data)) return data;
    const record = returnRecord(data);
    if (this.typeguard(record)) return record;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class ObjectNullVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<Record<string, any> | nully>
{
  typeguard(data: any): data is Record<string, any> | nully {
    return isNully(data) || typeof data === 'object';
  }

  transformer(data: any, key: string): Record<string, any> | nully {
    if (isNully(data)) {
      return null;
    }
    if (this.typeguard(data)) return data;
    const record = returnRecord(data);
    if (this.typeguard(record)) return record;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class ArrayVerifier<T>
  extends DataVerifierBlueprint<{
    arrayValueVerifier: DataVerifierInterface<any>;
  }>
  implements DataVerifierInterface<Array<T>>
{
  typeguard(data: any): data is Array<T> {
    return Array.isArray(data);
  }

  transformer(data: any, key: string): Array<T> {
    if (this.properties.arrayValueVerifier) {
      if (this.typeguard(data) && data) {
        if (
          data.filter((d) => !this.properties.arrayValueVerifier?.typeguard(d))
            .length !== 0
        ) {
          throw ErrorDictionary.data.parameterInvalid(key);
        }
        return data;
      }
      throw ErrorDictionary.data.parameterInvalid(key);
    }
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class ArrayNullVerifier<T>
  extends DataVerifierBlueprint<{
    arrayValueVerifier: DataVerifierInterface<T>;
  }>
  implements DataVerifierInterface<Array<T> | nully>
{
  typeguard(data: any): data is Array<T> | nully {
    return Array.isArray(data) || isNully(data);
  }

  transformer(data: any, key: string): Array<T> | nully {
    if (isNully(data)) {
      return null;
    }
    if (this.properties.arrayValueVerifier) {
      if (this.typeguard(data) && data) {
        if (
          data.filter((d) => !this.properties.arrayValueVerifier?.typeguard(d))
            .length !== 0
        ) {
          throw ErrorDictionary.data.parameterInvalid(key);
        }
        return data;
      }
      throw ErrorDictionary.data.parameterInvalid(key);
    }
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class BooleanVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<boolean>
{
  typeguard(data: any): data is boolean {
    return typeof data === 'boolean';
  }

  transformer(data: any, key: string): boolean {
    if (this.typeguard(data)) return data
    if ((new StringVerifier()).typeguard(data)) {
      switch (data) {
        case 'true':
          return true;
        case 'false':
          return false;
        default:
          throw ErrorDictionary.data.parameterInvalid(key);
      }
    }
    throw ErrorDictionary.data.parameterInvalid(key);
}
class StringVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<string>
{
  typeguard(data: any): data is string {
    return typeof data === 'boolean';
  }

  transformer(data: any, key: string): string {
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class StringVerifier
  extends DataVerifierBlueprint<null>
  implements DataVerifierInterface<string>
{
  typeguard(data: any): data is string {
    return typeof data === 'string';
  }

  transformer(data: any, key: string): string {
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
