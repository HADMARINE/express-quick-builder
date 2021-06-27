import _logger from "clear-logger";
import http from "http";
import chalk from "chalk";
import express, { Express, RequestHandler } from "express";
import getRoutes from "./getRoutes";
import ErrorHandler from "./ErrorHandler";
const pkg = require("../../package.json");

const logger = _logger.customName("EQB");

export default function serverStarter(params: {
  port?: number;
  portStrict?: boolean;
  app?: Express;
  requestHandlers?: RequestHandler[];
  routePath?: string;
  customErrorHandler?: RequestHandler;
  customNotFoundHandler?: RequestHandler;
  appName?: string;
}): {
  port: number;
  server: http.Server;
  app: ReturnType<typeof express>;
} {
  logger.debug(`EQB ServerBuilder running (V.${pkg.version})`, false);

  const app = params.app ? params.app : express();
  const server = http.createServer(app);

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

  const listenPort = listen(params.port || 61000, server, {
    portStrict: params.portStrict,
    appName:
      params.appName || "EXPRESS API SERVER powered by express-quick-builder",
  });

  return {
    port: listenPort,
    server: server as http.Server,
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
      port = listen(newPort, server, settings);
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
