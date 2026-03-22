# Product Catalog CRUD API

REST API for managing a product catalog. Built with Fastify and TypeScript, in-memory storage.

## Requirements

- Node.js 24.x
- npm

## Setup
```
git clone <repository-url>
cd crud-api
npm install
cp .env.example .env
```

## Running

**Development** (with hot reload):
```
npm run start:dev
```

**Production** (build + run):
```
npm run start:prod
```

**Cluster mode** (load balancer + multiple workers):
```
npm run start:multi
```

In cluster mode, the load balancer runs on `PORT` (default 4000) and distributes requests
across workers on ports 4001, 4002, 4003... using round-robin. State is synchronized
between workers via IPC.

## Tests
```
npm test
```

Covers 4 scenarios: full CRUD flow, input validation, id validation, unknown routes.

## API

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get product by id |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

### Product schema
```
{
  "id": "uuid (generated)",
  "name": "string, required",
  "description": "string, required",
  "price": "number, required, must be > 0",
  "category": "string, required",
  "inStock": "boolean, required"
}
```

## Quick test with curl

**Create a product:**
```
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "A powerful laptop",
    "price": 999.99,
    "category": "electronics",
    "inStock": true
  }'
```

**Get all products:**
```
curl http://localhost:4000/api/products
```

**Get by id** (replace with real id from create response):
```
curl http://localhost:4000/api/products/YOUR_PRODUCT_ID
```

**Update a product:**
```
curl -X PUT http://localhost:4000/api/products/YOUR_PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 799.99, "inStock": false}'
```

**Delete a product:**
```
curl -X DELETE http://localhost:4000/api/products/YOUR_PRODUCT_ID
```

**Error cases:**
```
# 400 — invalid uuid
curl http://localhost:4000/api/products/not-a-uuid

# 404 — product not found
curl http://localhost:4000/api/products/123e4567-e89b-12d3-a456-426614174000

# 404 — unknown route
curl http://localhost:4000/api/some/unknown/route

# 400 — missing required fields
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop"}'

# 400 — invalid price
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "A laptop",
    "price": -1,
    "category": "electronics",
    "inStock": true
  }'
```

## Project structure
```
src/
├── domain/entities/          # Product type
├── application/
│   ├── errors/               # Domain errors
│   ├── ports/                # Storage interface
│   ├── use-cases/            # Business logic
│   └── validation/           # Zod schemas
├── infrastructure/storage/   # In-memory storage
├── transport/http/           # Fastify handlers, routes, schemas
└── cluster/                  # Cluster mode, load balancer, IPC
```