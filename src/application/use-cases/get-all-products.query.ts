import type { Product } from "../../domain/entities/product.js";
import type { ProductStorage } from "../ports/storage.js";

export class GetAllProductsQuery {
  constructor(private readonly storage: ProductStorage) {}

  async execute(): Promise<Product[]> {
    return this.storage.getAll();
  }
}
