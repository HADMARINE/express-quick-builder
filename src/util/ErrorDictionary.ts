import errorBuilder from './ErrorBuilder';
import { codeData } from './httpcode';

export default {
  custom: (
    message: string,
    status: keyof typeof codeData,
    code: string,
  ): Error => errorBuilder(message, status, code),
  test: (): Error => errorBuilder(null, 418, null),
  action: {
    unsafe: (): Error =>
      errorBuilder(
        "Handling unsafe actions without 'unsafe' props is not allowed. This error is usually occurs when the action removes all datas of db or stops operation of server.",
        403,
        'UNSAFE_NOT_HANDLED',
      ),
  },
  connection: {
    pageNotFound(directory = ''): Error {
      const data: any = {};
      if (directory) {
        data.directory = directory;
      }
      return errorBuilder(
        `Page Not Found. REQURI:${directory}`,
        404,
        'PAGE_NOT_FOUND',
        { data },
      );
    },
    tooManyRequests: (): Error =>
      errorBuilder('Too many requests', 429, 'TOO_MANY_REQUESTS'),
  },
  password: {
    encryption: (): Error =>
      errorBuilder(
        'Password Encryption failed',
        500,
        'PASSWORD_ENCRYTION_FAIL',
      ),
  },
  auth: {
    tokenInvalid: (): Error =>
      errorBuilder('Token Invalid', 403, 'TOKEN_INVALID'),
    tokenExpired: (): Error =>
      errorBuilder('Token Expired', 403, 'TOKEN_EXPIRED'),
    tokenRenewNeeded: (): Error =>
      errorBuilder('Token renew needed', 403, 'TOKEN_RENEW_NEEDED'),
    fail: (): Error => errorBuilder('Login Failed', 403, 'LOGIN_FAIL'),
    access: {
      lackOfAuthority: (): Error =>
        errorBuilder(
          'Authority is not enough to access',
          403,
          'LACK_OF_AUTHORITY',
        ),
    },
  },
  data: {
    parameterNull: (col: any = ''): Error =>
      errorBuilder(
        `Necessary parameter${col ? ` ${col}` : ``} is not provided.`,
        400,
        'PARAMETER_NOT_PROVIDED',
      ),
    parameterInvalid: (col: any = ''): Error =>
      errorBuilder(
        `Parameter${col ? ` ${col}` : ``} is invalid.`,
        400,
        'PARAMETER_INVALID',
      ),
    dataNull: (col: any = ''): Error =>
      errorBuilder(`Data${col ? ` ${col}` : ``} is null`, 500, 'DATA_NULL'),
  },
  db: {
    create(collection: string | null = null): Error {
      return errorBuilder(
        `Failed to save data${
          collection ? ` of ${collection}` : ``
        } to Database.`,
        500,
        'DATABASE_SAVE_FAIL',
      );
    },
    exists(collection: string | null = null): Error {
      return errorBuilder(
        `${collection ? `${collection} ` : ``}Data Already exists.`,
        409,
        `UNIQUE_DATA_CONFLICT`,
      );
    },
    notfound(): Error {
      return errorBuilder(`Data not found.`, 404, `DATA_NOT_FOUND`);
    },
    partial: (action: string, successCount: number): Error =>
      errorBuilder(
        `Partial success of ${action}. Only ${successCount} of document succeeded.`,
        500,
        `PARTIAL_SUCCESS`,
      ),
    error: (): Error =>
      errorBuilder(
        `Failed to resolve database process`,
        500,
        `DATABASE_PROCESS_FAIL`,
      ),
  },
  endpoint: {
    rules: {
      deprecatedSoon: (): Error =>
        errorBuilder(
          `This endpoint will be deprecateds soon.`,
          200,
          `OK_DEPRECATED_SOON`,
        ),
      deprecated: (): Error =>
        errorBuilder(
          `This endpoint has been deprecated.`,
          400,
          `API_DEPRECATED`,
        ),
    },
  },
};
