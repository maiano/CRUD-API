import type { FastifyInstance } from "fastify";
import { CreateProductCommand } from "../../application/use-cases/create-product.command.js";
import { DeleteProductCommand } from "../../application/use-cases/delete-product.command.js";
import { GetAllProductsQuery } from "../../application/use-cases/get-all-products.query.js";
import { GetProductQuery } from "../../application/use-cases/get-product.query.js";
import { UpdateProductCommand } from "../../application/use-cases/update-product.command.js";
import { InMemoryProductStorage } from "../../infrastructure/storage/in-memory-product.storage.js";
import { ProductHandlers } from "./handlers.js";
import { FastifyServer } from "./server.js";

export async function buildTestApp(): Promise<FastifyInstance> {
  const storage = new InMemoryProductStorage();

  const handlers = new ProductHandlers(
    new GetAllProductsQuery(storage),
    new GetProductQuery(storage),
    new CreateProductCommand(storage),
    new UpdateProductCommand(storage),
    new DeleteProductCommand(storage),
  );

  const server = new FastifyServer(0, handlers);
  const app = server.getApp();

  await app.ready();

  return app;
}
