export type FeedItemType = "answer" | "article" | "other";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  author: string;
  content: string;
  url: string;
}

export interface FeedPage {
  items: FeedItem[];
  cursor: string | null;
}

export interface FeedProvider {
  nextPage(cursor: string | null): Promise<FeedPage>;
}
