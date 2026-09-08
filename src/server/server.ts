import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Adapter } from "../adapters/adapter.js";
import { resolveAdapter } from "../adapters/registry.js";
import type { Store } from "../store/store.js";
import { indexPage, notFoundPage, readerPage } from "./templates.js";

export interface ServerOptions {
  store: Store;
  adapters: Adapter[];
  port: number;
}

export class Server {
  constructor(private readonly options: ServerOptions) {}

  start(): void {
    const server = createServer((req, res) => {
      void this.handle(req, res);
    });
    server.listen(this.options.port, () => {
      console.log(`Reader 已启动: http://localhost:${this.options.port}`);
    });
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const method = req.method ?? "GET";
      const path = url.pathname;

      if (method === "GET" && path === "/") {
        return this.html(res, 200, indexPage(this.options.store.list()));
      }

      if (method === "POST" && path === "/fetch") {
        await this.handleFetch(req, res);
        return;
      }

      if (method === "POST" && path.startsWith("/delete/")) {
        const id = path.slice("/delete/".length);
        this.options.store.delete(id);
        return this.redirect(res, "/");
      }

      if (method === "GET" && path.startsWith("/read/")) {
        const id = path.slice("/read/".length);
        const article = this.options.store.get(id);
        if (!article) {
          return this.html(res, 404, notFoundPage());
        }
        return this.html(res, 200, readerPage(article));
      }

      if (method === "GET" && path === "/api/articles") {
        return this.json(res, 200, this.options.store.list());
      }

      if (method === "GET" && path.startsWith("/api/articles/")) {
        const id = path.slice("/api/articles/".length);
        const article = this.options.store.get(id);
        if (!article) {
          return this.json(res, 404, { error: "not found" });
        }
        return this.json(res, 200, article);
      }

      return this.html(res, 404, notFoundPage());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.html(res, 500, indexPage(this.options.store.list(), message));
    }
  }

  private async handleFetch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await readBody(req);
    const url = new URLSearchParams(body).get("url")?.trim() ?? "";
    if (!url) {
      return this.html(res, 400, indexPage(this.options.store.list(), "请输入链接"));
    }
    const adapter = resolveAdapter(this.options.adapters, url);
    if (!adapter) {
      return this.html(res, 400, indexPage(this.options.store.list(), "暂不支持该站点，目前仅支持知乎"));
    }
    const draft = await adapter.fetch(url);
    const article = this.options.store.save(draft);
    return this.redirect(res, `/read/${article.id}`);
  }

  private html(res: ServerResponse, status: number, body: string): void {
    res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  }

  private json(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  }

  private redirect(res: ServerResponse, location: string): void {
    res.writeHead(302, { Location: location });
    res.end();
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
