import type { Article } from "../model/article.js";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BASE_STYLE = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Georgia, "Songti SC", "SimSun", serif;
    color: #1a1a1a;
    background: #fafafa;
    line-height: 1.7;
  }
  main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  h1 { font-size: 1.5rem; font-weight: normal; letter-spacing: .02em; }
  a { color: #1a1a1a; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .bar { display: flex; gap: .5rem; margin: 1.5rem 0; }
  input[type=url], input[type=text] {
    flex: 1; padding: .6rem .8rem; font-size: 1rem;
    border: 1px solid #ccc; border-radius: 2px; background: #fff;
  }
  button {
    padding: .6rem 1.1rem; font-size: 1rem; cursor: pointer;
    border: 1px solid #1a1a1a; border-radius: 2px; background: #1a1a1a; color: #fff;
  }
  .error { color: #b00020; margin: .5rem 0; }
  ul.articles { list-style: none; padding: 0; margin: 2rem 0 0; }
  ul.articles li { border-top: 1px solid #e5e5e5; padding: .9rem 0; }
  ul.articles .meta { color: #777; font-size: .85rem; }
  article { white-space: pre-wrap; word-wrap: break-word; }
  .meta { color: #777; font-size: .85rem; margin: .5rem 0 2rem; }
  .tools { margin-bottom: 1rem; }
  .tools form { display: inline; }
  .tools button { padding: .3rem .7rem; font-size: .85rem; background: #fff; color: #1a1a1a; }
`;

function articleItem(a: Article): string {
  return `<li><a href="/read/${escapeHtml(a.id)}">${escapeHtml(a.title || a.url)}</a><div class="meta">${escapeHtml(a.author || "未知作者")} · ${escapeHtml(a.createdAt.slice(0, 10))}</div></li>`;
}

export function indexPage(articles: Article[], error?: string): string {
  const list = articles.map(articleItem).join("");
  const errorHtml = error ? `<p class="error">${escapeHtml(error)}</p>` : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reader</title>
<style>${BASE_STYLE}</style>
</head>
<body>
<main>
  <h1>Reader</h1>
  <p>粘贴链接，抓取正文，以纯文字阅读。</p>
  <form class="bar" method="post" action="/fetch">
    <input type="url" name="url" placeholder="https://zhuanlan.zhihu.com/p/..." required>
    <button type="submit">阅读</button>
  </form>
  ${errorHtml}
  <ul class="articles">${list}</ul>
</main>
</body>
</html>`;
}

export function readerPage(article: Article): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(article.title)}</title>
<style>${BASE_STYLE}</style>
</head>
<body>
<main>
  <div class="tools">
    <a href="/">← 返回</a>
    <form method="post" action="/delete/${escapeHtml(article.id)}" onsubmit="return confirm('删除这篇文章？')">
      <button type="submit">删除</button>
    </form>
  </div>
  <h1>${escapeHtml(article.title)}</h1>
  <div class="meta">${escapeHtml(article.author || "未知作者")} · ${escapeHtml(article.createdAt)} · <a href="${escapeHtml(article.url)}">原文</a></div>
  <article>${escapeHtml(article.content)}</article>
</main>
</body>
</html>`;
}

export function notFoundPage(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>未找到</title><style>${BASE_STYLE}</style></head>
<body><main><h1>未找到</h1><p><a href="/">返回首页</a></p></main></body>
</html>`;
}
