# Reader

轻量文字阅读工具：打开即呈现知乎首页推荐流的瀑布流，下滑自动加载新的回答，剔除 UI / 广告 / 图片，以纯文字堆叠展示（图片处显示 `【图片】`）。

## 使用

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000 ，下滑即可不断加载新的回答。

## 配置

通过环境变量配置：

- `READER_PORT`：端口，默认 `3000`
- `READER_COOKIE`：知乎登录 Cookie。推荐流需要登录态（`z_c0`、`d_c0`、`_zap`）。
- `READER_COOKIE_FILE`：从文件读取 Cookie（适合 Cookie 很长的情况），内容为完整 Cookie 字符串。
- `READER_MOCK_FEED`：设为 `1` 时使用本地示例数据，方便无 Cookie 时预览瀑布流界面。

## 解决知乎 403 / 登录态

推荐流接口需要登录 Cookie。获取方式：

1. 浏览器登录 zhihu.com，按 F12 打开开发者工具。
2. 切到 Network（网络）面板，刷新页面，点任意一个 `www.zhihu.com` 请求。
3. 在请求头里复制完整的 `Cookie` 值（至少包含 `z_c0`、`d_c0`、`_zap`）。
4. 把 Cookie 写入文件，例如 `reader.cookie`，然后启动：

```bash
READER_COOKIE_FILE=reader.cookie npm run dev
```

Windows PowerShell 下等效：

```powershell
$env:READER_COOKIE_FILE="reader.cookie"; npm run dev
```

无 Cookie 时可先用示例数据预览界面：

```bash
READER_MOCK_FEED=1 npm run dev
```

## 命令

- `npm run dev`：开发模式（热重载）
- `npm run build`：编译到 `dist/`
- `npm run start`：直接运行
- `npm test`：运行测试

## 架构

```
src/
├── index.ts           入口：装配 provider + formatter 并启动服务
├── feed/              内容流：类型、游标、知乎客户端、示例数据
├── format/            格式排版：Formatter 接口与纯文字实现
├── zhihu/sign.ts      知乎 x-zse-96 请求签名
├── sanitize/sanitizer.ts 内容清洗（图片→【图片】、去脚本/广告、统一换行）
└── server/            本地 Web 服务与瀑布流页面
```

内容流与格式排版已解耦：

- **内容流**由 `feed/types.ts` 的 `FeedProvider` 接口定义，`zhihu.ts`、`mock.ts` 是其实现；换内容源只需替换 provider。
- **格式排版**由 `format/types.ts` 的 `Formatter` 接口定义，`pureText.ts` 是当前实现；换格式只需替换 formatter（`styles()` 提供样式、`formatItem()` 输出条目 HTML）。
- 服务端（`server/`）只负责把 provider 产出的数据交给 formatter 渲染，二者互不依赖。

推荐流通过 `https://www.zhihu.com/api/v3/feed/topstory/recommend` 获取，分页游标（`session_token` / `after_id`）编码在 `cursor` 参数中，前端用 `IntersectionObserver` 触底自动加载下一页。
