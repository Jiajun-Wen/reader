import type { FeedItem, FeedPage, FeedProvider } from "./types.js";

const PAGE_SIZE = 5;
const TOTAL_PAGES = 3;

export class MockFeedProvider implements FeedProvider {
  async nextPage(cursor: string | null): Promise<FeedPage> {
    const page = cursor ? Number(cursor) : 0;
    const items: FeedItem[] = [];
    for (let index = 0; index < PAGE_SIZE; index += 1) {
      const number = page * PAGE_SIZE + index + 1;
      items.push({
        id: `mock-${number}`,
        type: "answer",
        title: `示例问题 ${number}`,
        author: `作者${number}`,
        content: `这是第 ${number} 条示例回答的正文。\n\n包含多段文字，用于验证瀑布流布局与【图片】占位显示。`,
        url: "https://www.zhihu.com/question/1/answer/1",
      });
    }
    const cursor2 = page + 1 < TOTAL_PAGES ? String(page + 1) : null;
    return { items, cursor: cursor2 };
  }
}
