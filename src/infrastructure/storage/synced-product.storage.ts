import type { CreateProductDto, UpdateProductDto } from "../../application/ports/storage.js";
import type { IpcMessage } from "../../cluster/ipc.types.js";
import type { Product } from "../../domain/entities/product.js";
import { InMemoryProductStorage } from "./in-memory-product.storage.js";

export class SyncedProductStorage extends InMemoryProductStorage {
  async create(dto: CreateProductDto): Promise<Product> {
    const product = await super.create(dto);
    this.broadcast({ type: "DB_CREATE", product });
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product | null> {
    const product = await super.update(id, dto);
    if (product) this.broadcast({ type: "DB_UPDATE", product });
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const result = await super.delete(id);
    if (result) this.broadcast({ type: "DB_DELETE", id });
    return result;
  }

  applyRemoteCreate(product: Product): void {
    this.store.set(product.id, product);
  }

  applyRemoteUpdate(product: Product): void {
    this.store.set(product.id, product);
  }

  applyRemoteDelete(id: string): void {
    this.store.delete(id);
  }

  applySync(products: Product[]): void {
    this.store.clear();
    for (const product of products) {
      this.store.set(product.id, product);
    }
  }

  private broadcast(message: IpcMessage): void {
    if (process.send) {
      process.send(message);
    }
  }
}
