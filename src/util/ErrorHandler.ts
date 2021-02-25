import { Request, Response, NextFunction } from "express";
import { defaultMessage, defaultCode } from "./httpcode";
import logger from "clear-logger";

export interface MiddlewareError {
  status?: number;
  message?: string;
  code?: string;
  data?: Record<string, any>;
}

export default (
  error: MiddlewareError | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = error.status || 500;
  const message = error.message || defaultMessage(status);
  const code = error.code || defaultCode(status);
  const data = error.data || {};

  logger.debug(error);

  res
    .status(status)
    .json({
      status,
      message,
      code,
      result: false,
      ...data,
    })
    .end();
};
