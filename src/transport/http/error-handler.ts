import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchemaValidationError,
} from "fastify";

interface FastifyValidationError extends FastifyError {
  validation: FastifySchemaValidationError[];
}

function isFastifyValidationError(error: FastifyError): error is FastifyValidationError {
  return "validation" in error && Array.isArray((error as FastifyValidationError).validation);
}

export function setupErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (isFastifyValidationError(error)) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (error.name === "InvalidIdError") {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.message,
      });
    }

    if (error.name === "ProductNotFoundError") {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: error.message,
      });
    }

    request.log.error({ err: error }, "Unexpected server error");
    return reply.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  });

  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
}
