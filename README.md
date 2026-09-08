# Reader

轻量文字阅读工具：粘贴网站链接，抓取正文，剔除 UI / 广告 / 图片，以纯文字形式展示并保存。目前支持知乎（问题、回答、专栏文章）。

## 使用

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000 ，粘贴知乎链接后点击「阅读」。

## 配置

通过环境变量配置：

- `READER_PORT`：端口，默认 `3000`
- `READER_DB`：SQLite 数据库路径，默认 `reader.db`
- `READER_COOKIE`：知乎 Cookie（可选）。知乎对未登录抓取常返回 403，提供 Cookie 后可正常抓取。
- `READER_COOKIE_FILE`：从文件读取 Cookie（适合 Cookie 很长的情况），内容为完整 Cookie 字符串。

## 解决知乎 403

未登录抓取知乎时，服务端会因缺少 `d_c0`/`_zap` 等设备 Cookie 返回 403。推荐用登录后的 Cookie：

1. 浏览器登录 zhihu.com，按 F12 打开开发者工具。
2. 切到 Network（网络）面板，刷新页面，点任意一个 `www.zhihu.com` 请求。
3. 在请求头里复制完整的 `Cookie` 值（至少包含 `z_c0`、`d_c0`、`_zap`）。
4. 把 Cookie 写入文件，例如 `reader.cookie`，然后启动：

```bash
READER_COOKIE_FILE=reader.cookie npm run dev
```

Windows 下等效：

```powershell
$env:READER_COOKIE_FILE="reader.cookie"; npm run dev
```

只想匿名抓取公开内容时，也可以只复制浏览器里的 `d_c0` 和 `_zap` 两个值拼成 Cookie。

## 命令

- `npm run dev`：开发模式（热重载）
- `npm run build`：编译到 `dist/`
- `npm run start`：直接运行
- `npm test`：运行测试

## 架构

```
src/
├── index.ts           入口：装配依赖并启动服务
├── model/article.ts   数据模型
├── fetch/fetcher.ts   HTTP 抓取（浏览器 UA、重试）
├── extract/extractor.ts 正文抽取（@mozilla/readability）
├── sanitize/sanitizer.ts 纯文字清洗（去图/脚本/广告，统一换行）
├── adapters/          站点适配器（按 host 分发，当前仅 zhihu）
├── store/store.ts     SQLite 存取（node:sqlite）
└── server/            本地 Web 服务与极简文字页面
```

新增站点时，实现 `adapters/adapter.ts` 中的 `Adapter` 接口，并在 `adapters/registry.ts` 注册即可。
