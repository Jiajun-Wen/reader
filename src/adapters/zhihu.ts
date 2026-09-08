import { load } from "cheerio";
import type { Adapter } from "./adapter.js";
import type { Fetcher } from "../fetch/fetcher.js";
import { extract } from "../extract/extractor.js";
import { toPlainText } from "../sanitize/sanitizer.js";
import type { ArticleDraft } from "../model/article.js";

const ZHIHU_NOISE_SELECTOR = [
  ".ContentItem-actions",
  ".RichContent-actions",
  ".CornerButtons",
  ".Card",
  ".ContentItem-time",
  ".ContentItem-more",
  ".QuestionFollowStatus",
  ".AppBanner",
  ".GlobalSideBar",
  ".Modal",
].join(", ");

export class ZhihuAdapter implements Adapter {
  readonly name = "zhihu";

  constructor(private readonly fetcher: Fetcher) {}

  match(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      if (host === "zhuanlan.zhihu.com") {
        return /^\/p\/\d+/.test(parsed.pathname);
      }
      if (host === "www.zhihu.com" || host === "zhihu.com") {
        return /^\/question\/\d+/.test(parsed.pathname);
      }
      return false;
    } catch {
      return false;
    }
  }

  async fetch(url: string): Promise<ArticleDraft> {
    const html = await this.fetcher.get(url);
    const cleanedHtml = this.removeNoise(html);
    const extracted = extract(cleanedHtml, url);
    return {
      url,
      title: extracted.title,
      author: extracted.author,
      content: toPlainText(extracted.content),
    };
  }

  private removeNoise(html: string): string {
    const $ = load(html, null, false);
    $(ZHIHU_NOISE_SELECTOR).remove();
    return $.html() ?? html;
  }
}
