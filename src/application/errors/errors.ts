export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with id '${id}' not found`);
    this.name = "ProductNotFoundError";
  }
}

export class InvalidIdError extends Error {
  constructor(id: string) {
    super(`'${id}' is not a valid UUID`);
    this.name = "InvalidIdError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
