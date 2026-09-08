import { signRequest } from "../zhihu/sign.js";
import { toPlainText } from "../sanitize/sanitizer.js";
import type { FeedItem, FeedItemType, FeedPage, FeedProvider } from "./types.js";
import { decodeCursor, encodeCursor, type FeedCursor } from "./cursor.js";

const RECOMMEND_URL = "https://www.zhihu.com/api/v3/feed/topstory/recommend";
const API_VERSION = "3.0.91";
const ZSE93 = "101_3_3.0";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface RecommendResponse {
  data?: RecommendItem[];
  paging?: { is_end?: boolean; session_token?: string; next?: string };
}

interface RecommendItem {
  id?: string | number;
  type?: string;
  ad?: unknown;
  target?: {
    type?: string;
    id?: string | number;
    title?: string;
    content?: string;
    excerpt?: string;
    url?: string;
    author?: { name?: string };
    question?: { id?: string | number; title?: string };
  };
}

export interface ZhihuFeedOptions {
  cookie: string;
}

export class ZhihuFeedProvider implements FeedProvider {
  constructor(private readonly options: ZhihuFeedOptions) {}

  async nextPage(cursor: string | null): Promise<FeedPage> {
    if (!this.options.cookie.trim()) {
      throw new Error("请先配置 READER_COOKIE 或 READER_COOKIE_FILE");
    }
    const state: FeedCursor = cursor
      ? decodeCursor(cursor)
      : { sessionToken: "", afterId: "", pageNumber: 0 };
    const pageNumber = state.pageNumber + 1;
    const query = new URLSearchParams({
      action: "down",
      ad_interval: "-10",
      after_id: state.afterId,
      desktop: "true",
      page_number: String(pageNumber),
      session_token: state.sessionToken,
    });
    const url = `${RECOMMEND_URL}?${query.toString()}`;

    const response = await fetch(url, {
      headers: {
        cookie: this.options.cookie,
        "user-agent": BROWSER_UA,
        "x-api-version": API_VERSION,
        "x-zse-93": ZSE93,
        "x-zse-96": signRequest(url, this.dc0(), null, ZSE93),
        "x-requested-with": "fetch",
        referer: "https://www.zhihu.com/",
      },
    });
    if (!response.ok) {
      throw new Error(`知乎推荐流请求失败: HTTP ${response.status}`);
    }

    const json = (await response.json()) as RecommendResponse;
    const rawItems = Array.isArray(json.data) ? json.data : [];
    const items = rawItems
      .map(toFeedItem)
      .filter((item): item is FeedItem => item !== null);

    const paging = json.paging;
    const nextCursor = paging?.is_end
      ? null
      : encodeCursor({
          sessionToken: paging?.session_token ?? state.sessionToken,
          afterId: lastItemId(rawItems) ?? state.afterId,
          pageNumber,
        });

    return { items, cursor: nextCursor };
  }

  private dc0(): string {
    const match = /(?:^|;\s*)d_c0=([^;]+)/.exec(this.options.cookie);
    return match?.[1] ?? "";
  }
}

function toFeedItem(item: RecommendItem): FeedItem | null {
  if (item.ad) {
    return null;
  }
  const target = item.target;
  if (!target) {
    return null;
  }
  const type = target.type ?? "";
  if (type !== "answer" && type !== "article") {
    return null;
  }
  const raw = target.content ?? target.excerpt ?? "";
  const content = toPlainText(raw);
  if (!content) {
    return null;
  }
  const title = type === "answer" ? target.question?.title ?? "" : target.title ?? "";
  return {
    id: String(target.id ?? item.id ?? ""),
    type: type as FeedItemType,
    title,
    author: target.author?.name ?? "",
    content,
    url: target.url ?? "",
  };
}

function lastItemId(items: RecommendItem[]): string | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const id = items[index]?.id ?? items[index]?.target?.id;
    if (id !== undefined && id !== null) {
      return String(id);
    }
  }
  return undefined;
}
