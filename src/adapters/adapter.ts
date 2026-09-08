import type { ArticleDraft } from "../model/article.js";

export interface Adapter {
  readonly name: string;
  match(url: string): boolean;
  fetch(url: string): Promise<ArticleDraft>;
}
