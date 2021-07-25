import ErrorDictionary from './ErrorDictionary';
import _logger from 'clear-logger';
const logger = _logger.customName('EQB_DATA_VERIFIER');

export class DataVerifierBlueprint<PropertiesType = {}> {
  private __properties__: Partial<PropertiesType>;

  get properties() {
    return this.__properties__;
  }

  constructor(properties: Partial<PropertiesType> = {}) {
    this.__properties__ = properties;
  }
}

export interface DataVerifierInterface<T> {
  typeguard: (data: any) => data is T;
  transformer: (data: any, key: string) => T;
}

type nully = null | undefined;

export type ProcessorType = {
  [key: string]: ProcessorType | PureProcessorType;
};

export type PureProcessorType = ReturnType<ValueOf<typeof __DataTypes>>;

export type RecursiveVerifiedType<T> = {
  [P in keyof T]: T[P] extends DataVerifierInterface<any>
    ? TypeGuard<T[P]['typeguard']> extends null | undefined
      ? NonNullable<TypeGuard<T[P]['typeguard']>> | null
      : TypeGuard<T[P]['typeguard']>
    : T[P] extends Record<string, any>
    ? RecursiveVerifiedType<T[P]>
    : any;
};

function isPureProcessorType(
  processor: ProcessorType | PureProcessorType,
): processor is PureProcessorType {
  return (processor as any).__properties__ !== undefined;
}

function isObjectProcessorType(data: any): data is ProcessorType {
  // TODO : improve this type guard
  // maybe can use instanceof something
  if (typeof data === 'object') return true;
  return false;
}

function verifier<T>(
  data: any,
  dataVerifier: DataVerifierInterface<T>,
  key: string,
): T {
  return dataVerifier.transformer(data, key);
}

export function verificationWrapper(data: Record<string, any>) {
  return function verifyIterator<T>(
    processors: T extends Record<string, ProcessorType | PureProcessorType>
      ? T
      : any,
  ): RecursiveVerifiedType<T> {
    const returnData: RecursiveVerifiedType<any> = {};
    if (isObjectProcessorType(processors)) {
      Object.entries(processors).forEach(([key, processor]) => {
        if (!isPureProcessorType(processor)) {
          // Not Pure processor type
          if (!processor) {
            throw ErrorDictionary.data.parameterNull(key);
          }

          const _result = verifyIterator(processor);
          Object.assign(returnData, { [key]: _result });
          return;
        }
        // Pure Processor type
        const result = verifier(data[key], processor, key); //verifierBuilder(value)(data, key);
        Object.assign(returnData, { [key]: result });
      });
    } else {
      logger.debug('Verification Type is Invalid!');
      process.exit(1);
    }
    return returnData;
  };
}

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

function ArrayParser<T>(data: any, key: string): T[] {
  if (new ArrayVerifier().typeguard(data)) return data as T[];
  if (new StringVerifier().typeguard(data)) {
    logger.debug('String parsed to array, DO NOT USE THIS IN PRODUCTION!');
    return returnArray(data);
  }
  throw ErrorDictionary.data.parameterInvalid(key);
}

export class StringVerifier
  extends DataVerifierBlueprint
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
export class StringNullVerifier
  extends DataVerifierBlueprint
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

export class DateVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<Date>
{
  precise_typeguard(data: any): data is Date {
    if (this.rough_typeguard(data)) {
      try {
        new Date(data);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  rough_typeguard(data: any): data is Date {
    return typeof data === 'string';
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  transformer(data: any, key: string): Date {
    try {
      return new Date(data);
    } catch {
      throw ErrorDictionary.data.parameterInvalid(key);
    }
  }
}

export class DateNullVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<Date | nully>
{
  precise_typeguard(data: any): data is Date {
    if (isNully(data)) {
      return true;
    }
    if (typeof data === 'string') {
      try {
        new Date(data);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  rough_typeguard(data: any): data is Date {
    return typeof data === 'string' || isNully(data);
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

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

export class ObjectVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<Record<string, any>>
{
  rough_typeguard(data: any): data is Record<string, any> {
    return data !== null && typeof data === 'object';
  }

  precise_typeguard(data: any): data is Record<string, any> {
    if (this.rough_typeguard(data)) return true;
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  transformer(data: any, key: string): Record<string, any> {
    if (this.typeguard(data)) return data;
    const record = returnRecord(data);
    if (this.typeguard(record)) return record;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}
export class ObjectNullVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<Record<string, any> | nully>
{
  rough_typeguard(data: any): data is Record<string, any> | nully {
    return isNully(data) && typeof data === 'object';
  }

  precise_typeguard(data: any): data is Record<string, any> | nully {
    if (this.rough_typeguard(data)) return true;
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

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
export class ArrayVerifier<T = any>
  extends DataVerifierBlueprint<{
    arrayValueVerifier: DataVerifierInterface<T>;
    preciseTypeguard: boolean;
  }>
  implements DataVerifierInterface<Array<T>>
{
  precise_typeguard(data: any): data is Array<T> {
    if (this.rough_typeguard(data)) {
      return true;
    }
    try {
      data = ArrayParser(data, '');
      if (this.properties.arrayValueVerifier) {
        if (
          data.filter(
            (d: any) => !this.properties.arrayValueVerifier?.typeguard(d),
          ).length !== 0
        ) {
          return false;
        }
        return true;
      } else {
        return Array.isArray(data);
      }
    } catch {
      return false;
    }
  }

  rough_typeguard(data: any): data is Array<T> {
    return Array.isArray(data);
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  arrayVerifyingTransformer(data: any, key: string): Array<T> {
    data = ArrayParser(data, key);
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

  plainTransformer(data: any, key: string): Array<T> {
    data = ArrayParser(data, key);
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }

  transformer = this.properties.arrayValueVerifier
    ? this.arrayVerifyingTransformer
    : this.plainTransformer;
}

export class ArrayNullVerifier<T = any>
  extends DataVerifierBlueprint<{
    arrayValueVerifier: DataVerifierInterface<T>;
    preciseTypeguard: boolean;
  }>
  implements DataVerifierInterface<Array<T> | nully>
{
  precise_typeguard(data: any): data is Array<T> | nully {
    if (this.rough_typeguard(data)) {
      return true;
    }
    try {
      data = ArrayParser(data, '');
      if (this.properties.arrayValueVerifier) {
        if (
          data.filter(
            (d: any) => !this.properties.arrayValueVerifier?.typeguard(d),
          ).length !== 0
        ) {
          return false;
        }
        return true;
      } else {
        return Array.isArray(data);
      }
    } catch {
      return false;
    }
  }

  rough_typeguard(data: any): data is Array<T> | nully {
    return Array.isArray(data) || isNully(data);
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  arrayVerifyingTransformer(data: any, key: string): Array<T> | nully {
    if (isNully(data)) {
      return null;
    }
    data = ArrayParser(data, key);
    if (this.typeguard(data) && data) {
      if (
        data.filter((d) => !this.properties.arrayValueVerifier?.typeguard(d))
          .length !== 0
      ) {
        throw ErrorDictionary.data.parameterInvalid(key);
      }
      return data;
    }
  }

  plainTransformer(data: any, key: string): Array<T> | nully {
    if (isNully(data)) {
      return null;
    }
    data = ArrayParser(data, key);
    if (this.typeguard(data) && data) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }

  transformer = this.properties.arrayValueVerifier
    ? this.arrayVerifyingTransformer
    : this.plainTransformer;
}
export class BooleanVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<boolean>
{
  precise_typeguard(data: any): data is boolean {
    return this.rough_typeguard(data) || data === 'true' || data === 'false';
  }

  rough_typeguard(data: any): data is boolean {
    return typeof data === 'boolean';
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  transformer(data: any, key: string): boolean {
    if (this.typeguard(data)) return data;
    if (new StringVerifier().typeguard(data)) {
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
}

export class BooleanNullVerifier
  extends DataVerifierBlueprint<{ preciseTypeguard: boolean }>
  implements DataVerifierInterface<boolean | nully>
{
  precise_typeguard(data: any): data is boolean | nully {
    return this.rough_typeguard(data) || data === 'true' || data === 'false';
  }

  rough_typeguard(data: any): data is boolean | nully {
    return typeof data === 'boolean' || isNully(data);
  }

  typeguard = this.properties.preciseTypeguard
    ? this.precise_typeguard
    : this.rough_typeguard;

  transformer(data: any, key: string): boolean | nully {
    if (this.typeguard(data)) return data;
    if (new StringVerifier().typeguard(data)) {
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
}

export class NotNullVerifier
  extends DataVerifierBlueprint
  implements DataVerifierInterface<Some>
{
  typeguard(data: any): data is Some {
    return !isNully(data);
  }

  transformer(data: any, key: string): Some {
    if (this.typeguard(data)) return data;
    throw ErrorDictionary.data.parameterInvalid(key);
  }
}

export class AnyVerifier
  extends DataVerifierBlueprint
  implements DataVerifierInterface<any>
{
  typeguard(data: any): data is any {
    return true;
  }

  transformer(data: any, key: string): string {
    return data;
  }
}

const __DataTypes = {
  string(...props: ConstructorParameters<typeof StringVerifier>) {
    return new StringVerifier(...props);
  },
  stringNull(...props: ConstructorParameters<typeof StringNullVerifier>) {
    return new StringNullVerifier(...props);
  },
  date(...props: ConstructorParameters<typeof DateVerifier>) {
    return new DateVerifier(...props);
  },
  dateNull(...props: ConstructorParameters<typeof DateNullVerifier>) {
    return new DateNullVerifier(...props);
  },
  object(...props: ConstructorParameters<typeof ObjectVerifier>) {
    return new ObjectVerifier(...props);
  },
  objectNull(...props: ConstructorParameters<typeof ObjectNullVerifier>) {
    return new ObjectNullVerifier(...props);
  },
  array<T>(
    props: Partial<{
      arrayValueVerifier: DataVerifierInterface<T>;
      preciseTypeGuard: boolean;
    }>,
  ) {
    return new ArrayVerifier<T>(props);
  },
  arrayNull<T>(
    props: Partial<{
      arrayValueVerifier: DataVerifierInterface<T>;
      preciseTypeGuard: boolean;
    }>,
  ) {
    return new ArrayNullVerifier<T>(props);
  },
  boolean(...props: ConstructorParameters<typeof BooleanVerifier>) {
    return new BooleanVerifier(...props);
  },
  booleanNull(...props: ConstructorParameters<typeof BooleanNullVerifier>) {
    return new BooleanNullVerifier(...props);
  },
  notNull(...props: ConstructorParameters<typeof NotNullVerifier>) {
    return new NotNullVerifier(...props);
  },
  any(...props: ConstructorParameters<typeof AnyVerifier>) {
    return new AnyVerifier(...props);
  },
};

export default __DataTypes;
