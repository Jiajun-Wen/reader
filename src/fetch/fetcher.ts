const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface FetcherOptions {
  cookie?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class Fetcher {
  private readonly cookie?: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: FetcherOptions = {}) {
    this.cookie = options.cookie;
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  async get(url: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": DEFAULT_USER_AGENT,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            Referer: `${new URL(url).origin}/`,
            ...(this.cookie ? { Cookie: this.cookie } : {}),
          },
          signal: AbortSignal.timeout(this.timeoutMs),
          redirect: "follow",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`抓取失败: ${url} (${message})`);
  }
}
