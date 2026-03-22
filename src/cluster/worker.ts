import "dotenv/config";
import { CreateProductCommand } from "../application/use-cases/create-product.command.js";
import { DeleteProductCommand } from "../application/use-cases/delete-product.command.js";
import { GetAllProductsQuery } from "../application/use-cases/get-all-products.query.js";
import { GetProductQuery } from "../application/use-cases/get-product.query.js";
import { UpdateProductCommand } from "../application/use-cases/update-product.command.js";
import { SyncedProductStorage } from "../infrastructure/storage/synced-product.storage.js";
import { ProductHandlers } from "../transport/http/handlers.js";
import { FastifyServer } from "../transport/http/server.js";
import type { IpcMessage } from "./ipc.types.js";

const port = parseInt(process.env.WORKER_PORT ?? "4001", 10);
const storage = new SyncedProductStorage();

process.on("message", (message: IpcMessage) => {
  switch (message.type) {
    case "DB_CREATE":
      storage.applyRemoteCreate(message.product);
      break;
    case "DB_UPDATE":
      storage.applyRemoteUpdate(message.product);
      break;
    case "DB_DELETE":
      storage.applyRemoteDelete(message.id);
      break;
    case "DB_SYNC_RESPONSE":
      storage.applySync(message.products);
      break;
  }
});

if (process.send) {
  process.send({ type: "DB_SYNC_REQUEST" } satisfies IpcMessage);
}

const handlers = new ProductHandlers(
  new GetAllProductsQuery(storage),
  new GetProductQuery(storage),
  new CreateProductCommand(storage),
  new UpdateProductCommand(storage),
  new DeleteProductCommand(storage),
);

const server = new FastifyServer(port, handlers);
await server.start();

console.log(`Worker ${process.pid} listening on port ${port}`);
