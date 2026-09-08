import type { Adapter } from "./adapter.js";
import type { Fetcher } from "../fetch/fetcher.js";
import { ZhihuAdapter } from "./zhihu.js";

export function buildAdapters(fetcher: Fetcher): Adapter[] {
  return [new ZhihuAdapter(fetcher)];
}

export function resolveAdapter(adapters: Adapter[], url: string): Adapter | undefined {
  return adapters.find((adapter) => adapter.match(url));
}
