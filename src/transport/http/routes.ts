import type { FastifyInstance } from "fastify";
import {
  createProductSchema,
  deleteProductSchema,
  getAllProductsSchema,
  getProductSchema,
  updateProductSchema,
} from "../schemas/product.schemas.js";
import type { ProductHandlers } from "./handlers.js";

export async function registerRoutes(
  fastify: FastifyInstance,
  handlers: ProductHandlers,
): Promise<void> {
  fastify.get("/api/products", { schema: getAllProductsSchema }, handlers.getAll);
  fastify.get("/api/products/:productId", { schema: getProductSchema }, handlers.getById);
  fastify.post("/api/products", { schema: createProductSchema }, handlers.create);
  fastify.put("/api/products/:productId", { schema: updateProductSchema }, handlers.update);
  fastify.delete("/api/products/:productId", { schema: deleteProductSchema }, handlers.delete);

  fastify.get("/health", async () => ({ status: "ok" }));
}
