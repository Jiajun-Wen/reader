import { test } from "node:test";
import assert from "node:assert/strict";
import { encryptZseV4, signRequest } from "./sign.js";

test("encryptZseV4 与参考实现一致", () => {
  assert.equal(encryptZseV4("hello"), "+6xPvLM9SJjT+GToL9YAivj/");
});

test("signRequest 与参考实现一致", () => {
  const url =
    "https://www.zhihu.com/api/v3/feed/topstory/recommend?action=down&ad_interval=-10&after_id=5&desktop=true&page_number=2&session_token=abc123";
  assert.equal(
    signRequest(url, "d0c0value", null, "101_3_3.0"),
    "2.0_zOI5aoA1GSNz3ax2lMfrjNb5B+5iIWCys8I54CrbU6lIka4P0IJlJhC/+1/JePnM",
  );
});
