import { readFileSync } from "node:fs";
import { ZhihuFeedProvider } from "./feed/zhihu.js";
import { MockFeedProvider } from "./feed/mock.js";
import { PureTextFormatter } from "./format/pureText.js";
import { Server } from "./server/server.js";

const port = Number(process.env.READER_PORT ?? 3000);
const cookie = process.env.READER_COOKIE ?? readCookieFile(process.env.READER_COOKIE_FILE);

const provider =
  process.env.READER_MOCK_FEED === "1"
    ? new MockFeedProvider()
    : new ZhihuFeedProvider({ cookie: cookie ?? "" });

const formatter = new PureTextFormatter();
const server = new Server({ provider, formatter, port });
await server.start();

function readCookieFile(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  return readFileSync(path, "utf8").trim();
}
