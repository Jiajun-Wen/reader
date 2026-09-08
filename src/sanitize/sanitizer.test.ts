import { test } from "node:test";
import assert from "node:assert/strict";
import { toPlainText } from "./sanitizer.js";

test("块级元素以换行分隔", () => {
  const result = toPlainText("<p>第一段</p><p>第二段</p>");
  assert.equal(result, "第一段\n第二段");
});

test("移除脚本与样式", () => {
  const result = toPlainText("<p>正文<script>alert(1)</script>继续<style>.x{}</style>结束</p>");
  assert.equal(result, "正文继续结束");
});

test("图片替换为占位符", () => {
  assert.equal(toPlainText('<div>含 <img src="x" alt="示意图"> 图</div>'), "含 【图片】 图");
  assert.equal(toPlainText('<p>文字</p><figure><img src="x"><figcaption>说明</figcaption></figure>'), "文字\n【图片】");
});

test("列表项转为项目符号", () => {
  const result = toPlainText("<ul><li>甲</li><li>乙</li></ul>");
  assert.equal(result, "• 甲\n• 乙");
});

test("压缩多余空行与空白", () => {
  const result = toPlainText("<p>a</p>\n<p>b</p>\n<p>c</p>");
  assert.equal(result, "a\nb\nc");
});
