import { randomUUID } from "node:crypto";
import type {
  CreateProductDto,
  ProductStorage,
  UpdateProductDto,
} from "../../application/ports/storage.js";
import type { Product } from "../../domain/entities/product.js";

export class InMemoryProductStorage implements ProductStorage {
  protected readonly store = new Map<string, Product>();

  async getAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      ...dto,
    };
    this.store.set(product.id, product);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: Product = { ...existing, ...dto };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
