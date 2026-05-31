/**
 * 翻译模块
 * 读取 docs/{id}/en/ 的 Markdown → 分段 → 翻译可翻译块（带缓存）→ 重组 → 写 docs/{id}/zh/
 *
 * ⚠️ 仅可使用「程序化」MIMO key，勿用交互套餐 key。
 *
 * CLI 用法：
 *   npm run translate                          # 翻译所有启用源
 *   npm run translate -- --source=xxx          # 指定源
 *   npm run translate -- --slugs=a,b/c         # 仅翻译指定 slug（增量）
 *
 * 并发：段级 SEG_CONCURRENCY 同源段并行（默认 8），文档级 DOC_CONCURRENCY 文档并行（默认 4）。
 * 通过 env 调整：SEG_CONCURRENCY、DOC_CONCURRENCY。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { DocSource } from './types.ts';
import { resolveTargetSources } from './utils/source-registry.ts';
import { docsDir, ensureDir, ROOT } from './utils/common.ts';
import { loadEnv } from './utils/load-env.ts';
import { MiMoClient, loadMiMoConfig } from './utils/api-client.ts';
import { TranslationCache } from './utils/cache-manager.ts';
import { segment, reassemble, normalizeBlockSpacing } from './markdown-parser.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadGlossary(): string {
  const path = join(__dirname, '..', 'config', 'glossary.common.json');
  if (!existsSync(path)) return '';
  const data = JSON.parse(readFileSync(path, 'utf-8')) as { terms: Record<string, string> };
  return Object.entries(data.terms)
    .map(([en, zh]) => `- ${en} → ${zh}`)
    .join('\n');
}

/** 递归列出 en 目录下所有 .md（排除 _manifest.json），返回 slug 列表 */
function listSlugs(source: DocSource): string[] {
  const base = docsDir(source.id, 'en');
  if (!existsSync(base)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.md')) {
        out.push(relative(base, full).replace(/\.md$/, ''));
      }
    }
  };
  walk(base);
  return out;
}

/** N 路 worker 并发执行，保留输入顺序的结果数组。 */
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  };
  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/** 翻译单个文档 */
async function translateDoc(
  client: MiMoClient,
  cache: TranslationCache,
  glossary: string,
  enPath: string,
  segConcurrency: number,
): Promise<string> {
  const md = readFileSync(enPath, 'utf-8');
  const segments = segment(md);
  const translations = new Map<number, string>();

  // 先把所有命中缓存与空白段处理掉，剩下的待 API 翻译段统一并发跑。
  const pending: { idx: number; content: string }[] = [];
  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    if (seg.type !== 'translatable') continue;
    if (!seg.content.trim()) {
      translations.set(idx, seg.content);
      continue;
    }
    const cached = cache.get(seg.content);
    if (cached !== null) {
      translations.set(idx, cached);
      continue;
    }
    pending.push({ idx, content: seg.content });
  }

  await mapWithConcurrency(pending, segConcurrency, async (item) => {
    const zh = await client.translate(item.content, glossary);
    cache.set(item.content, zh);
    translations.set(item.idx, zh);
  });

  return normalizeBlockSpacing(reassemble(segments, translations));
}

export async function translateSource(source: DocSource, slugs?: string[]): Promise<void> {
  const targets = slugs && slugs.length ? slugs : listSlugs(source);
  if (!targets.length) {
    console.log(`[${source.id}] 无可翻译文档（先运行 fetch-docs）`);
    return;
  }

  const client = new MiMoClient(loadMiMoConfig());
  const cache = new TranslationCache(source.id);
  const glossary = loadGlossary();
  const enBase = docsDir(source.id, 'en');
  const zhBase = docsDir(source.id, 'zh');
  const segConcurrency = Math.max(1, Number(process.env.SEG_CONCURRENCY ?? 8));
  const docConcurrency = Math.max(1, Number(process.env.DOC_CONCURRENCY ?? 4));

  console.log(
    `[${source.id}] 翻译 ${targets.length} 篇（doc 并发 ${docConcurrency}、段并发 ${segConcurrency}）`,
  );
  let done = 0;
  await mapWithConcurrency(targets, docConcurrency, async (slug) => {
    const enPath = join(enBase, `${slug}.md`);
    if (!existsSync(enPath)) {
      console.warn(`  跳过（英文原文不存在）：${slug}`);
      return;
    }
    const zh = await translateDoc(client, cache, glossary, enPath, segConcurrency);
    const zhPath = join(zhBase, `${slug}.md`);
    ensureDir(join(zhPath, '..'));
    writeFileSync(zhPath, zh, 'utf-8');
    cache.flush(source.id); // 每篇后落盘，崩溃可续
    done++;
    console.log(`  ✓ ${done}/${targets.length} ${slug}`);
  });

  const s = cache.stats();
  console.log(
    `[${source.id}] 完成。缓存命中率 ${(s.hitRate * 100).toFixed(0)}% | tokens ${client.stats.totalTokens}`,
  );
}

export async function translateAll(argv: string[]): Promise<void> {
  loadEnv();
  const sources = resolveTargetSources(argv);
  const slugArg = argv.find((a) => a.startsWith('--slugs='));
  const slugs = slugArg ? slugArg.slice('--slugs='.length).split(',').map((s) => s.trim()) : undefined;
  for (const source of sources) {
    await translateSource(source, slugs);
  }
  console.log('✅ 翻译完成');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  translateAll(process.argv.slice(2)).catch((err) => {
    console.error('❌ 翻译失败：', err);
    process.exit(1);
  });
}
