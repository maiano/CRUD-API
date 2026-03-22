import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "../../domain/entities/product.js";
import { InvalidIdError, ProductNotFoundError, ValidationError } from "../errors/errors.js";
import type { ProductStorage } from "../ports/storage.js";
import { CreateProductCommand } from "./create-product.command.js";
import { DeleteProductCommand } from "./delete-product.command.js";
import { GetAllProductsQuery } from "./get-all-products.query.js";
import { GetProductQuery } from "./get-product.query.js";

const mockStorage: ProductStorage = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const validId = "123e4567-e89b-12d3-a456-426614174000";
const invalidId = "not-a-uuid";

const sampleProduct: Product = {
  id: validId,
  name: "Laptop",
  description: "A laptop",
  price: 999,
  category: "electronics",
  inStock: true,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GetAllProductsQuery", () => {
  it("returns all products", async () => {
    vi.mocked(mockStorage.getAll).mockResolvedValue([sampleProduct]);
    const result = await new GetAllProductsQuery(mockStorage).execute();
    expect(result).toEqual([sampleProduct]);
  });
});

describe("GetProductQuery", () => {
  it("returns product by valid id", async () => {
    vi.mocked(mockStorage.getById).mockResolvedValue(sampleProduct);
    const result = await new GetProductQuery(mockStorage).execute(validId);
    expect(result).toEqual(sampleProduct);
  });

  it("throws InvalidIdError for non-uuid id", async () => {
    await expect(new GetProductQuery(mockStorage).execute(invalidId)).rejects.toThrow(
      InvalidIdError,
    );
  });

  it("throws ProductNotFoundError when not found", async () => {
    vi.mocked(mockStorage.getById).mockResolvedValue(null);
    await expect(new GetProductQuery(mockStorage).execute(validId)).rejects.toThrow(
      ProductNotFoundError,
    );
  });
});

describe("CreateProductCommand", () => {
  it("creates product with valid input", async () => {
    vi.mocked(mockStorage.create).mockResolvedValue(sampleProduct);
    const result = await new CreateProductCommand(mockStorage).execute({
      name: "Laptop",
      description: "A laptop",
      price: 999,
      category: "electronics",
      inStock: true,
    });
    expect(result).toEqual(sampleProduct);
  });

  it("throws ValidationError if price is negative", async () => {
    await expect(
      new CreateProductCommand(mockStorage).execute({
        ...sampleProduct,
        price: -1,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError if required field missing", async () => {
    await expect(new CreateProductCommand(mockStorage).execute({ name: "Laptop" })).rejects.toThrow(
      ValidationError,
    );
  });
});

describe("DeleteProductCommand", () => {
  it("throws InvalidIdError for non-uuid", async () => {
    await expect(new DeleteProductCommand(mockStorage).execute(invalidId)).rejects.toThrow(
      InvalidIdError,
    );
  });

  it("throws ProductNotFoundError when not found", async () => {
    vi.mocked(mockStorage.delete).mockResolvedValue(false);
    await expect(new DeleteProductCommand(mockStorage).execute(validId)).rejects.toThrow(
      ProductNotFoundError,
    );
  });
});
