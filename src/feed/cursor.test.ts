import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeCursor, encodeCursor } from "./cursor.js";

test("游标编码与解码往返一致", () => {
  const cursor = { sessionToken: "tok", afterId: "123", pageNumber: 2 };
  const decoded = decodeCursor(encodeCursor(cursor));
  assert.deepEqual(decoded, cursor);
});
