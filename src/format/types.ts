import type { FeedItem } from "../feed/types.js";

export interface Formatter {
  readonly name: string;
  styles(): string;
  formatItem(item: FeedItem): string;
}
