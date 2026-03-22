import type { Product } from "../domain/entities/product.js";

export type IpcMessage =
  | { type: "DB_CREATE"; product: Product }
  | { type: "DB_UPDATE"; product: Product }
  | { type: "DB_DELETE"; id: string }
  | { type: "DB_SYNC_REQUEST" }
  | { type: "DB_SYNC_RESPONSE"; products: Product[] };
