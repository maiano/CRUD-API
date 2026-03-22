import type { Product } from "../../domain/entities/product.js";
import { ProductNotFoundError, ValidationError } from "../errors/errors.js";
import type { ProductStorage } from "../ports/storage.js";
import { parseUUID } from "../validation/parse-uuid.js";
import { UpdateProductSchema } from "../validation/product.schema.js";

export class UpdateProductCommand {
  constructor(private readonly storage: ProductStorage) {}

  async execute(id: string, input: unknown): Promise<Product> {
    parseUUID(id);
    const parsed = UpdateProductSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(message);
    }
    const updated = await this.storage.update(id, parsed.data);
    if (!updated) throw new ProductNotFoundError(id);
    return updated;
  }
}
