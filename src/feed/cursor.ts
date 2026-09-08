export interface FeedCursor {
  sessionToken: string;
  afterId: string;
  pageNumber: number;
}

export function encodeCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCursor(value: string): FeedCursor {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as FeedCursor;
  return {
    sessionToken: parsed.sessionToken ?? "",
    afterId: parsed.afterId ?? "",
    pageNumber: parsed.pageNumber ?? 0,
  };
}
