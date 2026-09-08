export interface Article {
  id: string;
  url: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
}

export type ArticleDraft = Omit<Article, "id" | "createdAt">;
