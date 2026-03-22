import Fastify, { type FastifyInstance } from "fastify";
import { setupErrorHandler } from "./error-handler.js";
import type { ProductHandlers } from "./handlers.js";
import { registerRoutes } from "./routes.js";

export class FastifyServer {
  private readonly fastify: FastifyInstance;

  constructor(
    private readonly port: number,
    handlers: ProductHandlers,
  ) {
    this.fastify = Fastify({
      logger: {
        level: process.env.LOG_LEVEL ?? "info",
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
      },
    });

    setupErrorHandler(this.fastify);
    registerRoutes(this.fastify, handlers);
  }

  async start(): Promise<void> {
    await this.fastify.listen({ port: this.port, host: "0.0.0.0" });
  }

  async stop(): Promise<void> {
    await this.fastify.close();
  }

  getApp(): FastifyInstance {
    return this.fastify;
  }
}
