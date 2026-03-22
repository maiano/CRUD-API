import { InvalidIdError } from "../errors/errors.js";
import { UUIDSchema } from "./product.schema.js";

export function parseUUID(id: string): string {
  const parsed = UUIDSchema.safeParse(id);
  if (!parsed.success) {
    throw new InvalidIdError(id);
  }
  return id;
}
