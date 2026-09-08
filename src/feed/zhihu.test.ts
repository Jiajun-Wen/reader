import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ZhihuFeedProvider } from "./zhihu.js";
import { decodeCursor } from "./cursor.js";

const here = dirname(fileURLToPath(import.meta.url));

function stubFetch(payload: unknown, status = 200): void {
  globalThis.fetch = async () => new Response(JSON.stringify(payload), { status });
}

test("解析推荐流：保留回答与文章，跳过视频和广告", async () => {
  const json = JSON.parse(await readFile(join(here, "../../testdata/zhihu_feed.json"), "utf8"));
  stubFetch(json);
  try {
    const provider = new ZhihuFeedProvider({ cookie: "z_c0=xyz; d_c0=abc" });
    const page = await provider.nextPage(null);

    assert.equal(page.items.length, 2);
    assert.equal(page.items[0].type, "answer");
    assert.equal(page.items[0].title, "如何高效学习？");
    assert.equal(page.items[0].author, "李四");
    assert.match(page.items[0].content, /制定计划/);
    assert.match(page.items[0].content, /【图片】/);
    assert.match(page.items[0].content, /坚持执行/);
    assert.equal(page.items[1].type, "article");
    assert.equal(page.items[1].title, "一篇文章标题");

    assert.equal(page.cursor, null);
  } finally {
    delete (globalThis as { fetch?: unknown }).fetch;
  }
});

test("分页：未结束时返回下一游标", async () => {
  stubFetch({
    data: [
      {
        id: "1001",
        target: { type: "answer", id: 2001, question: { title: "标题" }, content: "<p>正文</p>", author: { name: "作者" } },
      },
    ],
    paging: { is_end: false, session_token: "next-token" },
  });
  try {
    const provider = new ZhihuFeedProvider({ cookie: "z_c0=xyz" });
    const page = await provider.nextPage(null);
    assert.notEqual(page.cursor, null);
    const cursor = decodeCursor(page.cursor as string);
    assert.equal(cursor.sessionToken, "next-token");
    assert.equal(cursor.afterId, "1001");
    assert.equal(cursor.pageNumber, 1);
  } finally {
    delete (globalThis as { fetch?: unknown }).fetch;
  }
});

test("未配置 Cookie 时给出明确错误", async () => {
  const provider = new ZhihuFeedProvider({ cookie: "" });
  await assert.rejects(() => provider.nextPage(null), /READER_COOKIE/);
});
