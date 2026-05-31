/**
 * 通用工具：带重试的下载、并发控制、路径助手
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** 项目根目录 */
export const ROOT = join(__dirname, '..', '..');

export function docsDir(sourceId: string, lang: 'en' | 'zh'): string {
  return join(ROOT, 'docs', sourceId, lang);
}

export function cacheDir(sourceId: string): string {
  return join(ROOT, 'cache', sourceId);
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

/** 带重试的文本下载（指数退避） */
export async function fetchText(
  url: string,
  retries = 3,
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'dev-docs-zh-bot/0.1 (+docs translation)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = 500 * 2 ** attempt;
        await sleep(delay);
      }
    }
  }
  throw new Error(`下载失败（重试 ${retries} 次）：${url}\n${String(lastErr)}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 并发执行（限制并发数），保留输入顺序返回结果
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
