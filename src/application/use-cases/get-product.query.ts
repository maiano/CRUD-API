import type { Product } from "../../domain/entities/product.js";
import { ProductNotFoundError } from "../errors/errors.js";
import type { ProductStorage } from "../ports/storage.js";
import { parseUUID } from "../validation/parse-uuid.js";

export class GetProductQuery {
  constructor(private readonly storage: ProductStorage) {}

  async execute(id: string): Promise<Product> {
    parseUUID(id);
    const product = await this.storage.getById(id);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }
}
