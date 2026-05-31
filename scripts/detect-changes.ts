/**
 * 变更检测模块
 * 对比官方最新文档与上次缓存的 hash，找出 新增/修改/删除。
 *
 * CLI 用法：
 *   npm run detect-changes                 # 检测所有启用源
 *   npm run detect-changes -- --source=xxx # 只检测指定源
 *
 * 输出：
 *   - 控制台变更摘要
 *   - changes.md（供 GitHub Issue 使用）
 *   - 若有变更，设置环境输出 has_changes=true（写入 $GITHUB_OUTPUT）
 *   - 更新 cache/{id}/doc-hashes.json
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DocSource, ChangeReport } from './types.ts';
import { resolveTargetSources } from './utils/source-registry.ts';
import { fetchDocList } from './fetch-docs.ts';
import { fetchText, cacheDir, ensureDir, mapLimit, ROOT } from './utils/common.ts';

const CONCURRENCY = 5;

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex');
}

function hashCachePath(sourceId: string): string {
  return join(cacheDir(sourceId), 'doc-hashes.json');
}

function loadHashCache(sourceId: string): Record<string, string> {
  const path = hashCachePath(sourceId);
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, string>;
}

function saveHashCache(sourceId: string, hashes: Record<string, string>): void {
  ensureDir(cacheDir(sourceId));
  writeFileSync(hashCachePath(sourceId), JSON.stringify(hashes, null, 2), 'utf-8');
}

/** 检测单个源的变更（下载最新文档计算 hash 对比） */
export async function detectSource(source: DocSource): Promise<{
  report: ChangeReport;
  newHashes: Record<string, string>;
}> {
  const docs = await fetchDocList(source);
  const oldHashes = loadHashCache(source.id);
  const newHashes: Record<string, string> = {};

  await mapLimit(docs, CONCURRENCY, async (doc) => {
    const text = await fetchText(doc.url);
    newHashes[doc.slug] = sha256(text);
  });

  const oldSlugs = new Set(Object.keys(oldHashes));
  const newSlugs = new Set(Object.keys(newHashes));

  const added: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];
  for (const slug of newSlugs) {
    if (!oldSlugs.has(slug)) added.push(slug);
    else if (oldHashes[slug] !== newHashes[slug]) modified.push(slug);
    else unchanged.push(slug);
  }
  const deleted = [...oldSlugs].filter((s) => !newSlugs.has(s));

  return {
    report: { sourceId: source.id, added, modified, deleted, unchanged },
    newHashes,
  };
}

function hasChanges(r: ChangeReport): boolean {
  return r.added.length > 0 || r.modified.length > 0 || r.deleted.length > 0;
}

function renderReport(r: ChangeReport): string {
  const lines: string[] = [];
  lines.push(`### ${r.sourceId}`);
  lines.push('');
  if (!hasChanges(r)) {
    lines.push('- 无变更');
  } else {
    if (r.added.length) {
      lines.push(`**新增 (${r.added.length})**`);
      r.added.forEach((s) => lines.push(`- \`${s}\``));
    }
    if (r.modified.length) {
      lines.push(`**修改 (${r.modified.length})**`);
      r.modified.forEach((s) => lines.push(`- \`${s}\``));
    }
    if (r.deleted.length) {
      lines.push(`**删除 (${r.deleted.length})**`);
      r.deleted.forEach((s) => lines.push(`- \`${s}\``));
    }
  }
  lines.push('');
  return lines.join('\n');
}

export async function detectAll(argv: string[]): Promise<void> {
  const sources = resolveTargetSources(argv);
  const reports: ChangeReport[] = [];
  // 是否写回 hash 缓存（检测+提醒场景写回；纯预览可加 --dry-run）
  const dryRun = argv.includes('--dry-run');

  for (const source of sources) {
    const { report, newHashes } = await detectSource(source);
    reports.push(report);
    const c = report;
    console.log(
      `[${c.sourceId}] +${c.added.length} ~${c.modified.length} -${c.deleted.length} =${c.unchanged.length}`,
    );
    if (!dryRun) saveHashCache(source.id, newHashes);
  }

  const anyChange = reports.some(hasChanges);

  // 生成 changes.md（供 GitHub Issue）
  const md = ['# 📢 官方文档更新检测报告', '', ...reports.map(renderReport)].join('\n');
  writeFileSync(join(ROOT, 'changes.md'), md, 'utf-8');

  // GitHub Actions 输出
  const ghOut = process.env.GITHUB_OUTPUT;
  if (ghOut) {
    appendFileSync(ghOut, `has_changes=${anyChange ? 'true' : 'false'}\n`);
  }

  console.log(anyChange ? '⚠️  检测到变更，详见 changes.md' : '✅ 无变更');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  detectAll(process.argv.slice(2)).catch((err) => {
    console.error('❌ 检测失败：', err);
    process.exit(1);
  });
}
