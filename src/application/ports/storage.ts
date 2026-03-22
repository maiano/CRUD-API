import type { Product } from "../../domain/entities/product.js";

export type CreateProductDto = Omit<Product, "id">;

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductStorage {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(dto: CreateProductDto): Promise<Product>;
  update(id: string, dto: UpdateProductDto): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
