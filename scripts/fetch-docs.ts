/**
 * 文档抓取模块
 * 遍历启用的数据源 → 解析 llms.txt → 下载所有 .md → 存到 docs/{id}/en/
 *
 * CLI 用法：
 *   npm run fetch-docs                    # 抓取所有启用源
 *   npm run fetch-docs -- --source=xxx    # 只抓取指定源
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DocSource, DocMetadata } from './types.ts';
import { resolveTargetSources } from './utils/source-registry.ts';
import { parseLlmsTxt } from './llms-parser.ts';
import { fetchText, docsDir, ensureDir, mapLimit } from './utils/common.ts';

const CONCURRENCY = 5;

/** 获取某个源的文档清单（解析 llms.txt） */
export async function fetchDocList(source: DocSource): Promise<DocMetadata[]> {
  const index = await fetchText(source.indexUrl);
  return parseLlmsTxt(index, source);
}

/** 抓取单个源的全部文档，落盘到 docs/{id}/en/，返回 slug -> 内容 */
export async function fetchSource(
  source: DocSource,
): Promise<Map<string, string>> {
  const docs = await fetchDocList(source);
  console.log(`[${source.id}] llms.txt 解析到 ${docs.length} 篇文档`);

  const outDir = docsDir(source.id, 'en');
  ensureDir(outDir);

  const contents = new Map<string, string>();
  let done = 0;

  await mapLimit(docs, CONCURRENCY, async (doc) => {
    const text = await fetchText(doc.url);
    // slug 可能含 / ，需要建子目录
    const filePath = join(outDir, `${doc.slug}.md`);
    ensureDir(join(filePath, '..'));
    writeFileSync(filePath, text, 'utf-8');
    contents.set(doc.slug, text);
    done++;
    if (done % 20 === 0 || done === docs.length) {
      console.log(`[${source.id}] 已下载 ${done}/${docs.length}`);
    }
  });

  // 保存清单（供构建侧边栏、调试用）
  const manifestPath = join(docsDir(source.id, 'en'), '_manifest.json');
  writeFileSync(manifestPath, JSON.stringify(docs, null, 2), 'utf-8');

  return contents;
}

/** 抓取所有目标源 */
export async function fetchAll(argv: string[]): Promise<void> {
  const sources = resolveTargetSources(argv);
  console.log(`准备抓取 ${sources.length} 个源：${sources.map((s) => s.id).join(', ')}`);
  for (const source of sources) {
    await fetchSource(source);
  }
  console.log('✅ 抓取完成');
}

// 直接运行时执行 CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAll(process.argv.slice(2)).catch((err) => {
    console.error('❌ 抓取失败：', err);
    process.exit(1);
  });
}
