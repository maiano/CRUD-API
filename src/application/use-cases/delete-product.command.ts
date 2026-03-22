import { ProductNotFoundError } from "../errors/errors.js";
import type { ProductStorage } from "../ports/storage.js";
import { parseUUID } from "../validation/parse-uuid.js";

export class DeleteProductCommand {
  constructor(private readonly storage: ProductStorage) {}

  async execute(id: string): Promise<void> {
    parseUUID(id);
    const deleted = await this.storage.delete(id);
    if (!deleted) throw new ProductNotFoundError(id);
  }
}
