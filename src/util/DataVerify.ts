import ErrorDictionary from './ErrorDictionary';

class DataVerifierBlueprint<PropertiesType> {
  properties: PropertiesType;

  constructor(properties: PropertiesType) {
    this.properties = properties;
  }

  public setProperties(properties: PropertiesType): this {
    return this;
  }
}

interface DataVerifierInterface<T> {
  typeguard: (data: any) => data is T;
  transformer: (data: any, key: string) => T;
}

type nully = null | undefined;

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
  extends DataVerifierBlueprint<{ verifyArrayValues: boolean }>
  implements DataVerifierInterface<Array<T>>
{
  typeguard(data: any): data is Array<T> {
    if (this.properties.verifyArrayValues) {
    }
    return typeof data === 'string';
  }

  transformer(data: any, key: string): string {
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
class ArrayNullVerifier
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
