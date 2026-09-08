import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ZhihuAdapter } from "./zhihu.js";
import type { Fetcher } from "../fetch/fetcher.js";

const here = dirname(fileURLToPath(import.meta.url));

function stubFetcher(html: string): Fetcher {
  return { get: async () => html } as unknown as Fetcher;
}

test("匹配知乎问题、回答与文章链接", () => {
  const adapter = new ZhihuAdapter(stubFetcher(""));
  assert.equal(adapter.match("https://www.zhihu.com/question/123456"), true);
  assert.equal(adapter.match("https://www.zhihu.com/question/123456/answer/789"), true);
  assert.equal(adapter.match("https://zhuanlan.zhihu.com/p/123456"), true);
  assert.equal(adapter.match("https://www.zhihu.com/people/foo"), false);
  assert.equal(adapter.match("https://example.com/question/123"), false);
  assert.equal(adapter.match("not a url"), false);
});

test("抓取并清洗知乎正文", async () => {
  const html = await readFile(join(here, "../../testdata/zhihu_question.html"), "utf8");
  const adapter = new ZhihuAdapter(stubFetcher(html));
  const article = await adapter.fetch("https://www.zhihu.com/question/123456");

  assert.match(article.content, /Go 语言学习路径/);
  assert.match(article.content, /第一阶段掌握基础语法/);
  assert.doesNotMatch(article.content, /推荐阅读广告卡片/);
  assert.doesNotMatch(article.content, /赞同/);
  assert.equal(article.url, "https://www.zhihu.com/question/123456");
});
