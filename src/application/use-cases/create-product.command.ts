import type { Product } from "../../domain/entities/product.js";
import { ValidationError } from "../errors/errors.js";
import type { ProductStorage } from "../ports/storage.js";
import { CreateProductSchema } from "../validation/product.schema.js";

export class CreateProductCommand {
  constructor(private readonly storage: ProductStorage) {}

  async execute(input: unknown): Promise<Product> {
    const parsed = CreateProductSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(message);
    }
    return this.storage.create(parsed.data);
  }
}
