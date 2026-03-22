const productBodySchema = {
  type: "object",
  required: ["name", "description", "price", "category", "inStock"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    price: { type: "number", exclusiveMinimum: 0 },
    category: { type: "string", minLength: 1 },
    inStock: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

const productResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    category: { type: "string" },
    inStock: { type: "boolean" },
  },
} as const;

const errorSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const getAllProductsSchema = {
  response: {
    200: {
      type: "array",
      items: productResponseSchema,
    },
  },
} as const;

export const getProductSchema = {
  params: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "string" },
    },
  },
  response: {
    200: productResponseSchema,
    400: errorSchema,
    404: errorSchema,
  },
} as const;

export const createProductSchema = {
  body: productBodySchema,
  response: {
    201: productResponseSchema,
    400: errorSchema,
  },
} as const;

export const updateProductSchema = {
  params: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "string" },
    },
  },

  body: {
    type: "object",
    properties: productBodySchema.properties,
    additionalProperties: false,
    minProperties: 1,
  },
  response: {
    200: productResponseSchema,
    400: errorSchema,
    404: errorSchema,
  },
} as const;

export const deleteProductSchema = {
  params: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "string" },
    },
  },
  response: {
    204: { type: "null" },
    400: errorSchema,
    404: errorSchema,
  },
} as const;
