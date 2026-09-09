import { test } from "node:test";
import assert from "node:assert/strict";
import { Server } from "./server.js";
import type { FeedItem, FeedProvider } from "../feed/types.js";
import { PureTextFormatter } from "../format/pureText.js";

function stubProvider(items: FeedItem[]): FeedProvider {
  return {
    async nextPage(cursor: string | null) {
      if (cursor === null) {
        return { items, cursor: "next" };
      }
      return { items: [], cursor: null };
    },
  };
}

const formatter = new PureTextFormatter();

test("首页渲染瀑布流页面", async () => {
  const server = new Server({ provider: stubProvider([]), formatter, port: 0 });
  const port = await server.start();
  try {
    const response = await fetch(`http://localhost:${port}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /id="feed"/);
    assert.match(html, /IntersectionObserver/);
    assert.match(html, /\.card /);
  } finally {
    await server.close();
  }
});

test("feed API 返回分页数据与渲染后的 HTML", async () => {
  const server = new Server({
    provider: stubProvider([{ id: "1", type: "answer", title: "标题", author: "作者", content: "正文", url: "https://example.com" }]),
    formatter,
    port: 0,
  });
  const port = await server.start();
  try {
    const first = await (await fetch(`http://localhost:${port}/api/feed`)).json();
    assert.equal(first.items.length, 1);
    assert.equal(first.cursor, "next");
    assert.match(first.items[0].html, /article class="card"/);
    assert.match(first.items[0].html, /标题/);
    assert.match(first.items[0].html, /href="https:\/\/example.com"/);

    const second = await (await fetch(`http://localhost:${port}/api/feed?cursor=next`)).json();
    assert.equal(second.items.length, 0);
    assert.equal(second.cursor, null);
  } finally {
    await server.close();
  }
});

test("feed API 出错时返回 502", async () => {
  const server = new Server({
    provider: {
      async nextPage() {
        throw new Error("测试错误");
      },
    },
    formatter,
    port: 0,
  });
  const port = await server.start();
  try {
    const response = await fetch(`http://localhost:${port}/api/feed`);
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.error, "测试错误");
  } finally {
    await server.close();
  }
});
