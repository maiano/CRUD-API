import type { FastifyInstance } from "fastify";
import type { ProductHandlers } from "./handlers.js";

export async function registerRoutes(
  fastify: FastifyInstance,
  handlers: ProductHandlers,
): Promise<void> {
  fastify.get("/api/products", handlers.getAll);
  fastify.get("/api/products/:productId", handlers.getById);
  fastify.post("/api/products", handlers.create);
  fastify.put("/api/products/:productId", handlers.update);
  fastify.delete("/api/products/:productId", handlers.delete);
}
