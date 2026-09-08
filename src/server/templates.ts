const BASE_STYLE = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Georgia, "Songti SC", "SimSun", serif;
    color: #1a1a1a;
    background: #fafafa;
    line-height: 1.7;
  }
  main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 6rem; }
  h1 { font-size: 1.5rem; font-weight: normal; letter-spacing: .02em; margin: 0 0 .3rem; }
  .subtitle { color: #777; font-size: .9rem; margin: 0; }
  .card { margin-top: 2.5rem; padding-top: 1.6rem; border-top: 1px solid #e5e5e5; }
  .card h2 { font-size: 1.12rem; font-weight: normal; margin: 0 0 .4rem; line-height: 1.5; }
  .card .meta { color: #777; font-size: .85rem; margin-bottom: .9rem; }
  .card .content { white-space: pre-wrap; word-wrap: break-word; }
  .card .source { display: inline-block; margin-top: .8rem; font-size: .85rem; color: #1a1a1a; text-decoration: none; }
  .card .source:hover { text-decoration: underline; }
  #status { color: #777; margin-top: 2rem; text-align: center; }
`;

export function feedPage(): string {
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
  <p class="subtitle">知乎首页推荐 · 纯文字阅读</p>
  <div id="feed"></div>
  <div id="sentinel"></div>
  <div id="status">加载中…</div>
</main>
<script>
(() => {
  const feed = document.getElementById("feed");
  const sentinel = document.getElementById("sentinel");
  const status = document.getElementById("status");
  let cursor = null;
  let loading = false;
  let ended = false;

  function renderItem(item) {
    const card = document.createElement("article");
    card.className = "card";
    if (item.title) {
      const title = document.createElement("h2");
      title.textContent = item.title;
      card.appendChild(title);
    }
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.author || "未知作者";
    card.appendChild(meta);
    const content = document.createElement("div");
    content.className = "content";
    content.textContent = item.content;
    card.appendChild(content);
    if (item.url) {
      const source = document.createElement("a");
      source.className = "source";
      source.href = item.url;
      source.target = "_blank";
      source.rel = "noopener";
      source.textContent = "查看原文";
      card.appendChild(source);
    }
    return card;
  }

  async function loadMore() {
    if (loading || ended) return;
    loading = true;
    status.textContent = "加载中…";
    try {
      const query = cursor ? "?cursor=" + encodeURIComponent(cursor) : "";
      const response = await fetch("/api/feed" + query);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      for (const item of data.items || []) {
        feed.appendChild(renderItem(item));
      }
      cursor = data.cursor ?? null;
      if (cursor === null) {
        ended = true;
        status.textContent = "已到末尾";
      } else {
        status.textContent = "";
      }
    } catch (error) {
      status.textContent = "加载失败：" + error.message;
    } finally {
      loading = false;
    }
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMore();
  });
  observer.observe(sentinel);
  loadMore();
})();
</script>
</body>
</html>`;
}
