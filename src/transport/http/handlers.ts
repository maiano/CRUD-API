import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateProductCommand } from "../../application/use-cases/create-product.command.js";
import type { DeleteProductCommand } from "../../application/use-cases/delete-product.command.js";
import type { GetAllProductsQuery } from "../../application/use-cases/get-all-products.query.js";
import type { GetProductQuery } from "../../application/use-cases/get-product.query.js";
import type { UpdateProductCommand } from "../../application/use-cases/update-product.command.js";

type IdParams = { productId: string };

export class ProductHandlers {
  constructor(
    private readonly getAllProducts: GetAllProductsQuery,
    private readonly getProduct: GetProductQuery,
    private readonly createProduct: CreateProductCommand,
    private readonly updateProduct: UpdateProductCommand,
    private readonly deleteProduct: DeleteProductCommand,
  ) {}

  getAll = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const products = await this.getAllProducts.execute();
    reply.status(200).send(products);
  };

  getById = async (
    req: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const product = await this.getProduct.execute(req.params.productId);
    reply.status(200).send(product);
  };

  create = async (req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply): Promise<void> => {
    const product = await this.createProduct.execute(req.body);
    reply.status(201).send(product);
  };

  update = async (
    req: FastifyRequest<{ Params: IdParams; Body: unknown }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const product = await this.updateProduct.execute(req.params.productId, req.body);
    reply.status(200).send(product);
  };

  delete = async (
    req: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.deleteProduct.execute(req.params.productId);
    reply.status(204).send();
  };
}
