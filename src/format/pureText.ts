import type { FeedItem } from "../feed/types.js";
import type { Formatter } from "./types.js";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STYLE = `
  .card { margin-top: 2.5rem; padding-top: 1.6rem; border-top: 1px solid #e5e5e5; }
  .card h2 { font-size: 1.12rem; font-weight: normal; margin: 0 0 .4rem; line-height: 1.5; }
  .card .meta { color: #777; font-size: .85rem; margin-bottom: .9rem; }
  .card .content { white-space: pre-wrap; word-wrap: break-word; font-size: var(--content-size); }
  .card .source { display: inline-block; margin-top: .8rem; font-size: .85rem; color: #1a1a1a; text-decoration: none; }
  .card .source:hover { text-decoration: underline; }
`;

export class PureTextFormatter implements Formatter {
  readonly name = "pure-text";

  styles(): string {
    return STYLE;
  }

  formatItem(item: FeedItem): string {
    const title = item.title ? `<h2>${escapeHtml(item.title)}</h2>` : "";
    const meta = `<div class="meta">${escapeHtml(item.author || "未知作者")}</div>`;
    const content = `<div class="content">${escapeHtml(item.content)}</div>`;
    const source = item.url
      ? `<a class="source" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">查看原文</a>`
      : "";
    return `<article class="card">${title}${meta}${content}${source}</article>`;
  }
}
