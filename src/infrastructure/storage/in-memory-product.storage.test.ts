import { beforeEach, describe, expect, it } from "vitest";
import type { CreateProductDto } from "../../application/ports/storage.js";
import { InMemoryProductStorage } from "./in-memory-product.storage.js";

const sampleDto: CreateProductDto = {
  name: "Test Product",
  description: "A test product",
  price: 9.99,
  category: "electronics",
  inStock: true,
};

describe("InMemoryStorage", () => {
  let storage: InMemoryProductStorage;

  beforeEach(() => {
    storage = new InMemoryProductStorage();
  });

  it("getAll returns empty array initially", async () => {
    expect(await storage.getAll()).toEqual([]);
  });

  it("create stores a product and returns it with generated id", async () => {
    const product = await storage.create(sampleDto);

    expect(product.id).toBeDefined();
    expect(product.name).toBe(sampleDto.name);
    expect(product.price).toBe(sampleDto.price);
  });

  it("getById returns the product by id", async () => {
    const created = await storage.create(sampleDto);
    const found = await storage.getById(created.id);

    expect(found).toEqual(created);
  });

  it("getById returns null for unknown id", async () => {
    expect(await storage.getById("non-existent-id")).toBeNull();
  });

  it("update modifies existing product", async () => {
    const created = await storage.create(sampleDto);
    const updated = await storage.update(created.id, { price: 19.99 });

    expect(updated?.price).toBe(19.99);
    expect(updated?.name).toBe(sampleDto.name);
  });

  it("update returns null for unknown id", async () => {
    expect(await storage.update("non-existent-id", { price: 1 })).toBeNull();
  });

  it("delete removes product and returns true", async () => {
    const created = await storage.create(sampleDto);
    const result = await storage.delete(created.id);

    expect(result).toBe(true);
    expect(await storage.getById(created.id)).toBeNull();
  });

  it("delete returns false for unknown id", async () => {
    expect(await storage.delete("non-existent-id")).toBe(false);
  });
});
