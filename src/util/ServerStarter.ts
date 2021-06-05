import _logger from "clear-logger";
import http from "http";
import chalk from "chalk";
import express, { Express, RequestHandler } from "express";
import getRoutes from "./getRoutes";
import ErrorHandler from "./ErrorHandler";

const logger = _logger.customName("EQB");

export function serverStarter(params: {
  port?: number;
  portStrict?: boolean;
  app?: Express;
  requestHandlers?: RequestHandler[];
  executes?: (() => any | Promise<() => any>)[];
  routePath?: string;
  customErrorHandler?: RequestHandler;
  customNotFoundHandler?: RequestHandler;
  appName?: string;
}) {
  logger.debug("EXPRESS-QUICK-BUILDER Server Starter is running", false);

  const app = params.app ? params.app : express();
  const server = http.createServer(app);
  const listenPort = listen(params.port || 61000, server, {
    portStrict: params.portStrict,
    appName:
      params.appName || "EXPRESS API SERVER powered by express-quick-builder",
  });

  let executeResult: any[] | undefined = undefined;

  if (params.executes) {
    executeResult = params.executes.map(async (f) => {
      return await f();
    });
  }

  if (params.requestHandlers) app.use(params.requestHandlers);

  getRoutes(params.routePath).forEach((data) => {
    app.use(data.path || "/", data.router);
  });

  app.use(
    params.customNotFoundHandler ||
      ((req) => {
        const err: any = new Error("Page not found");
        err.status = 404;
        err.code = "PAGE_NOT_FOUND";
        err.data = { directory: `${req.method} ${req.url}` };
        throw err;
      })
  );

  app.use(params.customErrorHandler ? params.customErrorHandler : ErrorHandler);

  return {
    port: listenPort,
    server,
    executeResult,
    app,
  };
}

function listen(
  port: number,
  server: http.Server,
  settings: Partial<{ portStrict: boolean; appName: string }>
): number {
  if (port <= 0 || port >= 65536) {
    logger.warn(`PORT Range is Invalid. Recieved port : ${port}`);

    if (settings.portStrict === true) {
      logger.error(
        "Set portStrict to false on your ServerStarter if you want to execute anyway."
      );
      throw new Error("PORT STRICT ERROR");
    }
    port = 20000;
    logger.info(`Retrying with Port ${port}`);
  }
  server.listen(port);

  let isError = false;
  server.once("error", (err: any) => {
    if (settings.portStrict === true) {
      logger.error(`Port ${port} is already in use.`);
      logger.info(
        "Set portStrict to false on your ServerStarter if you want to execute anyway."
      );
      throw new Error("PORT STRICT");
    }
    if (err.code === "EADDRINUSE") {
      logger.info(
        `Port ${port} is currently in use. Retrying with port ${port + 1}`
      );
      const newPort = port > 65535 ? 20000 : port + 1;
      listen(newPort, server, settings);
      isError = true;
    }
  });
  server.once("listening", () => {
    if (!isError) {
      logger.success(
        chalk.black.bgGreen(`${settings.appName} started on port `) +
          chalk.green.bold(` ${port}`)
      );
    }
  });
  return port;
}
