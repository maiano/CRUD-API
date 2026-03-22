import type { FastifyInstance } from "fastify";
import {
  InvalidIdError,
  ProductNotFoundError,
  ValidationError,
} from "../../application/errors/errors.js";

export function setupErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error, request, reply) => {
    if (
      error instanceof ProductNotFoundError ||
      error instanceof InvalidIdError ||
      error instanceof ValidationError
    ) {
      request.log.warn({ err: error }, "Client error");
    } else {
      request.log.error({ err: error }, "Unexpected server error");
    }

    if (error instanceof InvalidIdError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (error instanceof ValidationError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (error instanceof ProductNotFoundError) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: error.message,
      });
    }

    return reply.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
}
