import "dotenv/config";

import { CreateProductCommand } from "./application/use-cases/create-product.command.js";
import { DeleteProductCommand } from "./application/use-cases/delete-product.command.js";
import { GetAllProductsQuery } from "./application/use-cases/get-all-products.query.js";
import { GetProductQuery } from "./application/use-cases/get-product.query.js";
import { UpdateProductCommand } from "./application/use-cases/update-product.command.js";
import { InMemoryProductStorage } from "./infrastructure/storage/in-memory-product.storage.js";

import { ProductHandlers } from "./transport/http/handlers.js";
import { FastifyServer } from "./transport/http/server.js";

async function bootstrap() {
  const port = parseInt(process.env.PORT ?? "4000", 10);

  // Infrastructure
  const storage = new InMemoryProductStorage();

  // Application
  const getAllProducts = new GetAllProductsQuery(storage);
  const getProduct = new GetProductQuery(storage);
  const createProduct = new CreateProductCommand(storage);
  const updateProduct = new UpdateProductCommand(storage);
  const deleteProduct = new DeleteProductCommand(storage);

  // Transport
  const handlers = new ProductHandlers(
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  );

  // Server
  const server = new FastifyServer(port, handlers);

  try {
    await server.start();
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down...`);
    try {
      await server.stop();
      console.log("Server stopped");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Unhandled bootstrap error:", error);
  process.exit(1);
});
