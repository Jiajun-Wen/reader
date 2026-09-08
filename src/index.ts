import { readFileSync } from "node:fs";
import { Fetcher } from "./fetch/fetcher.js";
import { buildAdapters } from "./adapters/registry.js";
import { Store } from "./store/store.js";
import { Server } from "./server/server.js";

const port = Number(process.env.READER_PORT ?? 3000);
const dbPath = process.env.READER_DB ?? "reader.db";
const cookie = process.env.READER_COOKIE ?? readCookieFile(process.env.READER_COOKIE_FILE);

function readCookieFile(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  return readFileSync(path, "utf8").trim();
}

const fetcher = new Fetcher({ cookie });
const adapters = buildAdapters(fetcher);
const store = new Store(dbPath);
const server = new Server({ store, adapters, port });

server.start();

process.on("SIGINT", () => {
  store.close();
  process.exit(0);
});
