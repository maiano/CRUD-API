import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTestApp } from "./server.factory.js";

const validProduct = {
  name: "Laptop",
  description: "A powerful laptop",
  price: 999.99,
  category: "electronics",
  inStock: true,
};

let app: FastifyInstance;

beforeEach(async () => {
  app = await buildTestApp();
});

afterEach(async () => {
  await app.close();
});

async function createProduct(data = validProduct) {
  return app.inject({
    method: "POST",
    url: "/api/products",
    payload: data,
  });
}

describe("Scenario 1: full CRUD flow", () => {
  it("GET /api/products returns empty array initially", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("POST /api/products creates a new product", async () => {
    const res = await createProduct();
    const body = res.json();

    expect(res.statusCode).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(validProduct.name);
    expect(body.price).toBe(validProduct.price);
  });

  it("GET /api/products/:id returns created product", async () => {
    const created = (await createProduct()).json();

    const res = await app.inject({
      method: "GET",
      url: `/api/products/${created.id}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(created);
  });

  it("PUT /api/products/:id updates the product", async () => {
    const created = (await createProduct()).json();

    const res = await app.inject({
      method: "PUT",
      url: `/api/products/${created.id}`,
      payload: { price: 799.99, inStock: false },
    });
    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.price).toBe(799.99);
    expect(body.inStock).toBe(false);
    expect(body.name).toBe(created.name);
  });

  it("DELETE /api/products/:id deletes the product", async () => {
    const created = (await createProduct()).json();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/products/${created.id}`,
    });

    expect(res.statusCode).toBe(204);
  });

  it("GET /api/products/:id returns 404 after deletion", async () => {
    const created = (await createProduct()).json();

    await app.inject({
      method: "DELETE",
      url: `/api/products/${created.id}`,
    });

    const res = await app.inject({
      method: "GET",
      url: `/api/products/${created.id}`,
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("Scenario 2: input validation", () => {
  it("POST returns 400 if name is empty string", async () => {
    const res = await createProduct({ ...validProduct, name: "" });
    expect(res.statusCode).toBe(400);
  });

  it("POST returns 400 if price is negative", async () => {
    const res = await createProduct({ ...validProduct, price: -1 });
    expect(res.statusCode).toBe(400);
  });

  it("POST returns 400 if price is zero", async () => {
    const res = await createProduct({ ...validProduct, price: 0 });
    expect(res.statusCode).toBe(400);
  });

  it("POST returns 400 if required field is missing", async () => {
    const { description: _, ...withoutDescription } = validProduct;
    const res = await createProduct(withoutDescription as typeof validProduct);
    expect(res.statusCode).toBe(400);
  });

  it("POST returns 400 if inStock is not boolean", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/products",
      payload: { ...validProduct, inStock: "yes" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Scenario 3: id validation and not found", () => {
  it("GET with invalid uuid returns 400", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/products/not-a-uuid",
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().message).toContain("not a valid UUID");
  });

  it("PUT with invalid uuid returns 400", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/products/not-a-uuid",
      payload: { price: 100 },
    });
    expect(res.statusCode).toBe(400);
  });

  it("DELETE with invalid uuid returns 400", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/products/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });

  it("GET non-existent uuid returns 404", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/products/123e4567-e89b-12d3-a456-426614174000",
    });
    expect(res.statusCode).toBe(404);
  });

  it("PUT non-existent uuid returns 404", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/products/123e4567-e89b-12d3-a456-426614174000",
      payload: { price: 100 },
    });
    expect(res.statusCode).toBe(404);
  });

  it("DELETE non-existent uuid returns 404", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/products/123e4567-e89b-12d3-a456-426614174000",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("Scenario 4: unknown routes", () => {
  it("GET unknown route returns 404 with message", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/unknown/route",
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().message).toContain("not found");
  });

  it("POST unknown route returns 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/some/garbage",
      payload: {},
    });
    expect(res.statusCode).toBe(404);
  });
});
