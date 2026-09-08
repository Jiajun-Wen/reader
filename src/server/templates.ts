const BASE_STYLE = `
  * { box-sizing: border-box; }
  :root { --content-size: 17px; }
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
  .card .content { white-space: pre-wrap; word-wrap: break-word; font-size: var(--content-size); }
  .card .source { display: inline-block; margin-top: .8rem; font-size: .85rem; color: #1a1a1a; text-decoration: none; }
  .card .source:hover { text-decoration: underline; }
  #status { color: #777; margin-top: 2rem; text-align: center; }

  .settings-button {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    color: #444;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
  }
  .settings-button:hover { background: #f5f5f5; }
  .settings-menu {
    position: fixed;
    top: 4rem;
    right: 1rem;
    z-index: 10;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, .1);
    padding: 1rem 1.1rem;
    min-width: 15rem;
    display: none;
  }
  .settings-menu.open { display: block; }
  .settings-menu .row { display: flex; align-items: center; gap: .75rem; }
  .settings-menu .row label { font-size: .9rem; color: #333; white-space: nowrap; }
  .settings-menu input[type=range] { flex: 1; }
  .settings-menu .value { font-size: .85rem; color: #777; min-width: 3rem; text-align: right; }
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
<button class="settings-button" id="settingsButton" aria-label="设置" title="设置">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
</button>
<div class="settings-menu" id="settingsMenu">
  <div class="row">
    <label for="fontSize">字号</label>
    <input type="range" id="fontSize" min="14" max="28" step="1" value="17">
    <span class="value" id="fontSizeValue">17px</span>
  </div>
</div>
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

  const settingsButton = document.getElementById("settingsButton");
  const settingsMenu = document.getElementById("settingsMenu");
  const fontSize = document.getElementById("fontSize");
  const fontSizeValue = document.getElementById("fontSizeValue");

  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsMenu.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!settingsMenu.contains(event.target) && !settingsButton.contains(event.target)) {
      settingsMenu.classList.remove("open");
    }
  });

  fontSize.addEventListener("input", () => {
    document.documentElement.style.setProperty("--content-size", fontSize.value + "px");
    fontSizeValue.textContent = fontSize.value + "px";
  });
})();
</script>
</body>
</html>`;
}
