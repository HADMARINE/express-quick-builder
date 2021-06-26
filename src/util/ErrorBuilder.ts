import { defaultMessage, defaultCode, codeData } from "./httpcode";
import logger from "clear-logger";

interface Options {
  log?: boolean;
  data?: object;
}

const optionsDefault = {
  log: false,
  data: {},
};

function errorBuilder(
  message: string | null,
  status: keyof typeof codeData = 500,
  code: string | null,
  options: Options = optionsDefault
): Error {
  const error: any = new Error(message || defaultMessage(status));
  error.status = status;
  error.code = code || defaultCode(status);

  error.data = options.data || {};

  if (options.log) {
    logger.debug(error, true);
  }

  return error;
}

export default errorBuilder;
