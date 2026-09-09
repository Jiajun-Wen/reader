import { test } from "node:test";
import assert from "node:assert/strict";
import { PureTextFormatter, escapeHtml } from "./pureText.js";

const formatter = new PureTextFormatter();

test("转义 HTML 特殊字符", () => {
  assert.equal(escapeHtml('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
});

test("格式化条目为卡片 HTML 并转义正文", () => {
  const html = formatter.formatItem({
    id: "1",
    type: "answer",
    title: "标题",
    author: "作者",
    content: "第一行\n<script>alert(1)</script>",
    url: "https://example.com?a=1&b=2",
  });

  assert.match(html, /<article class="card">/);
  assert.match(html, /<h2>标题<\/h2>/);
  assert.match(html, /<div class="meta">作者<\/div>/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert/);
  assert.match(html, /href="https:\/\/example.com\?a=1&amp;b=2"/);
});

test("空标题与空链接可省略", () => {
  const html = formatter.formatItem({
    id: "2",
    type: "article",
    title: "",
    author: "",
    content: "正文",
    url: "",
  });
  assert.doesNotMatch(html, /<h2>/);
  assert.match(html, /未知作者/);
  assert.doesNotMatch(html, /class="source"/);
});
