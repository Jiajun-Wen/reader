import { createServer, type IncomingMessage, type ServerResponse, type Server as HttpServer } from "node:http";
import type { FeedProvider } from "../feed/types.js";
import type { Formatter } from "../format/types.js";
import { feedPage } from "./templates.js";

export interface ServerOptions {
  provider: FeedProvider;
  formatter: Formatter;
  port: number;
}

export class Server {
  private httpServer?: HttpServer;

  constructor(private readonly options: ServerOptions) {}

  start(): Promise<number> {
    const server = createServer((req, res) => {
      void this.handle(req, res);
    });
    return new Promise((resolve) => {
      server.listen(this.options.port, () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : this.options.port;
        this.httpServer = server;
        console.log(`Reader 已启动: http://localhost:${port}`);
        resolve(port);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.httpServer) {
        resolve();
        return;
      }
      this.httpServer.close(() => resolve());
    });
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = req.method ?? "GET";

    if (method === "GET" && url.pathname === "/") {
      return this.html(res, 200, feedPage(this.options.formatter.styles()));
    }

    if (method === "GET" && url.pathname === "/api/feed") {
      try {
        const page = await this.options.provider.nextPage(url.searchParams.get("cursor"));
        const items = page.items.map((item) => ({
          ...item,
          html: this.options.formatter.formatItem(item),
        }));
        return this.json(res, 200, { items, cursor: page.cursor });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return this.json(res, 502, { error: message });
      }
    }

    return this.html(res, 404, "Not found");
  }

  private html(res: ServerResponse, status: number, body: string): void {
    res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  }

  private json(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  }
}
