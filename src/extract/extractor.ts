import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface Extracted {
  title: string;
  author: string;
  content: string;
}

export function extract(html: string, url: string): Extracted {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article) {
    throw new Error("无法从页面中抽取正文");
  }
  return {
    title: article.title ?? "",
    author: article.byline ?? "",
    content: article.content ?? "",
  };
}
