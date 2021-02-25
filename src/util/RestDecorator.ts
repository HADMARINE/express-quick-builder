import { RequestHandler, Router } from "express";
import { WrappedRequest, ResponseOptions, Wrapper } from "./ControllerUtil";
import ErrorDictionary from "./ErrorDictionary";

export type EndpointProcessProperties = Partial<{
  method: METHODS;
  useCustomHandler: boolean;
  returnRawData: boolean;
  path: string | RegExp | (string | RegExp)[];
  successMessage: string;
  noErrorOnNull: boolean;
}>;

interface MappersDataTransferInterface {
  handlers: RequestHandler[];
  properties: EndpointProcessProperties;
}

export enum METHODS {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
  HEAD = "head",
  ALL = "all",
}

const validateUnsureValue = (value: any): MappersDataTransferInterface => {
  const valueType = typeof value;
  if (valueType === "object") {
    return value;
  } else {
    return {
      handlers: [value],
      properties: {},
    };
  }
};

const processHandlers = (
  descriptionValue: MappersDataTransferInterface | RequestHandler,
  middleware: RequestHandler[],
  properties: EndpointProcessProperties
): { handlers: RequestHandler[]; properties: EndpointProcessProperties } => {
  const v = validateUnsureValue(descriptionValue);
  const settings: EndpointProcessProperties = properties;
  Object.assign(settings, v.properties);

  v.handlers.unshift(...middleware);

  if (!properties.useCustomHandler) {
    const preHandler = (v.handlers[v.handlers.length - 1] as unknown) as (
      req: WrappedRequest
    ) => any;

    const responseOptions: ResponseOptions = {};

    if (properties.successMessage) {
      responseOptions.message = properties.successMessage;
    }

    v.handlers[v.handlers.length - 1] = Wrapper(async (req, res) => {
      const preResult = await preHandler(req);

      if (properties.returnRawData) {
        res.send(preResult).status(200);
      } else {
        if (preResult === null && !properties.noErrorOnNull) {
          throw ErrorDictionary.data.dataNull();
        }
        res.strict(200, preResult, responseOptions);
      }
    });
  }

  return { handlers: v.handlers, properties: settings };
};

const MappingFactory = (method: METHODS) => {
  return (
    dir: string | RegExp | (string | RegExp)[] = "/",
    ...middleware: RequestHandler[]
  ): MethodDecorator => {
    return (target, propertyKey, descriptor: PropertyDescriptor): void => {
      if (!descriptor.value) return;
      const { handlers, properties } = processHandlers(
        descriptor.value,
        middleware,
        { method, path: dir }
      );
      descriptor.value = {
        type: "controller",
        handlers,
        properties,
      };
    };
  };
};

export const Mappings = {
  get: MappingFactory(METHODS.GET),
  post: MappingFactory(METHODS.POST),
  patch: MappingFactory(METHODS.PATCH),
  delete: MappingFactory(METHODS.DELETE),
  put: MappingFactory(METHODS.PUT),
  head: MappingFactory(METHODS.HEAD),
  all: MappingFactory(METHODS.ALL),
};

export const SetMiddleware = (middleware: RequestHandler) => {
  return (
    target: any,
    propName: string,
    description: PropertyDescriptor
  ): void => {
    const v = validateUnsureValue(description.value);

    v.handlers.unshift(middleware);

    description.value = v;
  };
};

export const UseCustomHandler = (
  target: any,
  propName: string,
  description: PropertyDescriptor
): void => {
  const v = validateUnsureValue(description.value);

  v.properties.useCustomHandler = true;

  description.value = v;
};

export const SetSuccessMessage = (message: string) => {
  return (
    target: any,
    propName: string,
    description: PropertyDescriptor
  ): void => {
    const v = validateUnsureValue(description.value);

    v.properties.successMessage = message;

    description.value = v;
  };
};

export const NoErrorOnNull = (value = true) => {
  return (
    target: any,
    propName: string,
    description: PropertyDescriptor
  ): void => {
    const v = validateUnsureValue(description.value);

    v.properties.noErrorOnNull = value;

    description.value = v;
  };
};

export const SetEndpointProperties = (value: EndpointProcessProperties) => {
  return (
    target: any,
    propName: string,
    description: PropertyDescriptor
  ): void => {
    const v = validateUnsureValue(description.value);

    v.properties = value;

    description.value = v;
  };
};

export const ReturnRawData = (value = true) => {
  return (
    target: any,
    propName: string,
    description: PropertyDescriptor
  ): void => {
    const v = validateUnsureValue(description.value);

    v.properties.returnRawData = value;

    description.value = v;
  };
};

export const Controller = <T extends new (...args: any[]) => {}>(
  target: T
): {
  new (...args: any[]): { router: Router } & any;
  prototype: { router: Router };
} => {
  return class ControllerClass extends target {
    public router = Router();

    constructor(...args: any[]) {
      super();
      for (const key of Object.getOwnPropertyNames(target.prototype)) {
        if (key === "constructor") continue;
        const value = target.prototype[key];
        if (value?.type !== "controller") continue;

        const { handlers, properties } = value as {
          handlers: RequestHandler[];
          properties: EndpointProcessProperties;
        };

        if (!properties.method) {
          throw new Error("METHOD NOT DECORATED - " + key);
        }

        this.router[properties.method](properties.path || "/", ...handlers);
      }
    }
  };
};

export default {
  controller: Controller,
  middleware: SetMiddleware,
  useCustomHandler: UseCustomHandler,
  setSuccessMessage: SetSuccessMessage,
  noErrorOnNull: NoErrorOnNull,
  setEndpointProperties: SetEndpointProperties,
  returnRawData: ReturnRawData,
  mappings: Mappings,
};
