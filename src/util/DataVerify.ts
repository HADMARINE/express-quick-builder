import ErrorDictionary from './ErrorDictionary';
import logger from 'clear-logger';

type nully = null;

function isObject(data: any): data is Record<string, any> {
  return data !== null && typeof data === 'object';
}

function isObjectNullable(data: any): data is Record<string, any> | nully {
  return data === undefined || data === null || data === 'object';
}

function isNumber(data: any): data is number {
  return typeof data === 'number';
}

function isNumberNullable(data: any): data is number | nully {
  return data === undefined || data === null || isNumber(data);
}

function isDate(data: any): data is Date {
  return typeof data === 'string';
}
function isDateNullable(data: any): data is Date | nully {
  return typeof data === 'string' || data == null;
}

function isNotNull<T>(data: T | nully): data is T {
  return data !== undefined && data !== null;
}

function isAny<T = any>(data: any): data is T {
  return true;
}

function isFunction(data: any): data is Function {
  return typeof data === 'function';
}

function isFunctionNullable(data: any): data is Function | nully {
  return data === undefined || data === null || isFunction(data);
}

function isString(data: any): data is string {
  return typeof data === 'string';
}

function isStringNullable(data: any): data is string | nully {
  return data === undefined || data === null || isString(data);
}

function isArray<T>(data: any): data is T[] {
  return Array.isArray(data);
}

function isArrayNullable<T>(data: any): data is T[] | nully {
  return data === undefined || data === null || isArray(data);
}

function isBoolean(data: any): data is boolean {
  return typeof data === 'boolean';
}

function isBooleanNullable(data: any): data is boolean | nully {
  return data === undefined || data === null || isBoolean(data);
}

export type ProcessorType = {
  [key: string]:
    | ProcessorType
    | typeof isObject
    | typeof isObjectNullable
    | typeof isNumber
    | typeof isNumberNullable
    | typeof isDate
    | typeof isDateNullable
    | typeof isNotNull
    | typeof isAny
    | typeof isFunction
    | typeof isFunctionNullable
    | typeof isString
    | typeof isStringNullable
    | typeof isArray
    | typeof isArrayNullable
    | typeof isBoolean
    | typeof isBooleanNullable
    | ((data: any) => data is unknown);
};

export type PureProcessorType =
  | typeof isObject
  | typeof isObjectNullable
  | typeof isNumber
  | typeof isNumberNullable
  | typeof isDate
  | typeof isDateNullable
  | typeof isNotNull
  | typeof isAny
  | typeof isFunction
  | typeof isFunctionNullable
  | typeof isString
  | typeof isStringNullable
  | typeof isArray
  | typeof isArrayNullable
  | typeof isBoolean
  | typeof isBooleanNullable
  | ((data: any) => data is unknown);

export const DataTypes = {
  object: isObject,
  objectNull: isObjectNullable,
  number: isNumber,
  numberNull: isNumberNullable,
  notnull: isNotNull,
  any: isAny,
  function: isFunction,
  functionNull: isFunctionNullable,
  string: isString,
  stringNull: isStringNullable,
  date: isDate,
  dateNull: isDateNullable,
  array:
    <T>() =>
    (data: any): data is T[] =>
      isArray<T>(data),
  arrayNull:
    <T>() =>
    (data: any): data is T[] | nully =>
      isArrayNullable<T>(data),
  boolean: isBoolean,
  booleanNull: isBooleanNullable,
};

function ArrayParser<T>(data: any, key: string): T[] {
  if (isArray(data)) return data as T[];
  if (isString(data)) {
    logger.debug('String parsed to array, DO NOT USE THIS IN PRODUCTION!');
    return returnArray(data);
  }
  throw ErrorDictionary.data.parameterInvalid(key);
}

function verifier<T>(
  data: any,
  dataVerifyFunction: (data: any) => data is T,
  key: string,
): T {
  if (dataVerifyFunction === isAny) {
    return data;
  }

  if (data === undefined || data === null) {
    if (
      [
        isFunctionNullable,
        isStringNullable,
        isArrayNullable,
        isBooleanNullable,
        isObjectNullable,
        isNumberNullable,
        isDateNullable,
      ].find((d) => d === dataVerifyFunction) !== undefined
    ) {
      return null as unknown as T;
    }
    throw ErrorDictionary.data.parameterNull(key);
  }

  switch (dataVerifyFunction) {
    case isNotNull:
      return data;
    case isObject:
    case isObjectNullable:
      if (isObject(data)) return data as unknown as T;
      const record = returnRecord(data);
      if (isObject(record)) return record as unknown as T;
      throw ErrorDictionary.data.parameterInvalid(key);
    case isBoolean as unknown:
    case isBooleanNullable as unknown:
      if (isBoolean(data)) return data as unknown as T;
      if (isString(data)) {
        switch (data) {
          case 'true':
            return true as unknown as T;
          case 'false':
            return false as unknown as T;
          default:
            throw ErrorDictionary.data.parameterInvalid(key);
        }
      }
      throw ErrorDictionary.data.parameterInvalid(key);
    case isString as unknown:
    case isStringNullable as unknown:
      if (isString(data) && data) return data as unknown as T;
      throw ErrorDictionary.data.parameterInvalid(key);
    case isNumber as unknown:
    case isNumberNullable as unknown:
      if (isNumber(data)) return data as unknown as T;
      if (isNaN(data)) throw ErrorDictionary.data.parameterInvalid(key);
      return parseFloat(data) as unknown as T;
    case isArrayNullable as unknown: {
      try {
        const arr = ArrayParser(data, key);
        return arr as unknown as T;
      } catch {
        return [] as unknown as T;
      }
    }
    case isArray as unknown: {
      const arr = ArrayParser(data, key);
      if (arr.length === 0) throw ErrorDictionary.data.parameterInvalid(key);
      return arr as unknown as T;
    }
    case isDate as unknown:
    case isDateNullable as unknown:
      try {
        return new Date(data) as unknown as T;
      } catch {
        throw ErrorDictionary.data.parameterInvalid(key);
      }
    default:
      if (dataVerifyFunction(data)) {
        return data;
      }
      throw ErrorDictionary.data.parameterInvalid(key);
  }
}

function verifierBuilder<T>(type: (data: any) => data is T) {
  return function (rawData: Record<string, any>, key: string): T {
    return verifier<T>(rawData[key], type, key);
  };
}

function isObjectProcessorType(data: any): data is ProcessorType {
  // TODO : improve this type guard
  if (typeof data === 'object') return true;
  return false;
}

export type RecursiveVerifiedTypes<T> = {
  [P in keyof T]: T[P] extends (args: string) => args is any
    ? TypeGuard<T[P]> extends null | undefined
      ? NonNullable<TypeGuard<T[P]>> | null
      : TypeGuard<T[P]>
    : T[P] extends Record<string, any>
    ? RecursiveVerifiedTypes<T[P]>
    : any;
};

export type VerifyIteratorFunction<T> = (
  processors: T extends Record<string, ProcessorType> ? T : any,
) => RecursiveVerifiedTypes<T>;

function isPureProcessorType(
  processor: ProcessorType | PureProcessorType,
): processor is PureProcessorType {
  return typeof processor !== 'object';
}

export function verificationWrapper(data: Record<string, any>) {
  return function verifyIterator<T>(
    processors: T extends Record<string, ProcessorType | PureProcessorType>
      ? T
      : any,
  ): RecursiveVerifiedTypes<T> {
    const returnData: RecursiveVerifiedTypes<any> = {};
    if (isObjectProcessorType(processors)) {
      Object.entries(processors).forEach(([key, value]) => {
        if (!isPureProcessorType(value)) {
          if (!value) {
            throw ErrorDictionary.data.parameterNull(key);
          }

          const _result = verifyIterator(value);
          Object.assign(returnData, { [key]: _result });
          return;
        }

        const result = verifierBuilder(value)(data, key);
        Object.assign(returnData, { [key]: result });
      });
    } else {
      throw ErrorDictionary.custom(
        'Verification type is invalid!',
        500,
        'VERIFICATION_TYPE_INVALID',
      );
    }
    return returnData;
  };
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
