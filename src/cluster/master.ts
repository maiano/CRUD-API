import "dotenv/config";
import type { Worker } from "node:cluster";
import cluster from "node:cluster";
import http from "node:http";
import os from "node:os";
import type { Product } from "../domain/entities/product.js";
import type { IpcMessage } from "./ipc.types.js";

const BASE_PORT = parseInt(process.env.PORT ?? "4000", 10);
const WORKER_COUNT = Math.max(1, os.availableParallelism() - 1);

if (!cluster.isPrimary) {
  await import("./worker.js");
} else {
  const masterDb = new Map<string, Product>();
  const workers: Worker[] = [];

  for (let i = 0; i < WORKER_COUNT; i++) {
    const workerPort = BASE_PORT + 1 + i;
    const worker = cluster.fork({ WORKER_PORT: String(workerPort) });
    workers.push(worker);

    console.log(`Forked worker ${worker.process.pid} on port ${workerPort}`);

    worker.on("message", (message: IpcMessage) => {
      switch (message.type) {
        case "DB_SYNC_REQUEST": {
          const products = Array.from(masterDb.values());
          worker.send({ type: "DB_SYNC_RESPONSE", products } satisfies IpcMessage);
          break;
        }
        case "DB_CREATE": {
          masterDb.set(message.product.id, message.product);
          broadcast(worker, { type: "DB_CREATE", product: message.product });
          break;
        }
        case "DB_UPDATE": {
          masterDb.set(message.product.id, message.product);
          broadcast(worker, { type: "DB_UPDATE", product: message.product });
          break;
        }
        case "DB_DELETE": {
          masterDb.delete(message.id);
          broadcast(worker, { type: "DB_DELETE", id: message.id });
          break;
        }
      }
    });

    worker.on("exit", (code) => {
      console.log(`Worker ${worker.process.pid} exited with code ${code}`);
    });
  }

  function broadcast(sender: Worker, message: IpcMessage): void {
    for (const worker of workers) {
      if (worker.id !== sender.id && worker.isConnected()) {
        worker.send(message);
      }
    }
  }

  let currentIndex = 0;

  function getNextPort(): number {
    const port = BASE_PORT + 1 + currentIndex;
    currentIndex = (currentIndex + 1) % WORKER_COUNT;
    return port;
  }

  const loadBalancer = http.createServer((req, res) => {
    const targetPort = getNextPort();

    const proxy = http.request(
      {
        hostname: "127.0.0.1",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (workerRes) => {
        res.writeHead(workerRes.statusCode ?? 500, workerRes.headers);
        workerRes.pipe(res);
      },
    );

    proxy.on("error", (err) => {
      console.error(`Proxy error to port ${targetPort}:`, err.message);
      res.writeHead(502);
      res.end(
        JSON.stringify({
          statusCode: 502,
          error: "Bad Gateway",
          message: "Worker unavailable",
        }),
      );
    });

    req.pipe(proxy);
  });

  loadBalancer.listen(BASE_PORT, () => {
    console.log(`Load balancer on :${BASE_PORT}`);
    console.log(`Workers on ports ${BASE_PORT + 1}–${BASE_PORT + WORKER_COUNT}`);
  });
}
