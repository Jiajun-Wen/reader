import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import type { Article, ArticleDraft } from "../model/article.js";

interface ArticleRow {
  id: string;
  url: string;
  title: string;
  author: string;
  content: string;
  created_at: string;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

export class Store {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  save(draft: ArticleDraft): Article {
    const article: Article = {
      id: randomUUID(),
      ...draft,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO articles (id, url, title, author, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        article.id,
        article.url,
        article.title,
        article.author,
        article.content,
        article.createdAt,
      );
    return article;
  }

  list(): Article[] {
    const rows = this.db
      .prepare("SELECT * FROM articles ORDER BY created_at DESC")
      .all() as unknown as ArticleRow[];
    return rows.map(rowToArticle);
  }

  get(id: string): Article | undefined {
    const row = this.db
      .prepare("SELECT * FROM articles WHERE id = ?")
      .get(id) as ArticleRow | undefined;
    return row ? rowToArticle(row) : undefined;
  }

  delete(id: string): boolean {
    const result = this.db.prepare("DELETE FROM articles WHERE id = ?").run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}
