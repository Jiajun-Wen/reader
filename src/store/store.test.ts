import { test } from "node:test";
import assert from "node:assert/strict";
import { Store } from "./store.js";
import type { ArticleDraft } from "../model/article.js";

const draft: ArticleDraft = {
  url: "https://www.zhihu.com/question/1",
  title: "标题",
  author: "作者",
  content: "正文内容",
};

test("保存、列表、读取与删除", () => {
  const store = new Store(":memory:");
  const saved = store.save(draft);

  assert.ok(saved.id);
  assert.equal(saved.title, "标题");

  const list = store.list();
  assert.equal(list.length, 1);

  const got = store.get(saved.id);
  assert.equal(got?.content, "正文内容");

  assert.equal(store.delete(saved.id), true);
  assert.equal(store.get(saved.id), undefined);
  assert.equal(store.delete(saved.id), false);

  store.close();
});
