/**
 * 数据源注册表加载器
 * 读取 config/sources.config.json，提供查询能力
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { DocSource } from '../types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '..', '..', 'config', 'sources.config.json');

interface SourcesConfigFile {
  sources: DocSource[];
}

let cache: DocSource[] | null = null;

/** 读取全部数据源配置 */
export function loadSources(): DocSource[] {
  if (cache) return cache;
  const raw = readFileSync(CONFIG_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as SourcesConfigFile;
  if (!Array.isArray(parsed.sources)) {
    throw new Error('sources.config.json 格式错误：缺少 sources 数组');
  }
  cache = parsed.sources;
  return cache;
}

/** 仅返回 enabled 的源 */
export function getEnabledSources(): DocSource[] {
  return loadSources().filter((s) => s.enabled);
}

/** 按 id 查找源 */
export function getSourceById(id: string): DocSource {
  const found = loadSources().find((s) => s.id === id);
  if (!found) {
    const ids = loadSources().map((s) => s.id).join(', ');
    throw new Error(`未找到数据源 "${id}"，可用源：${ids}`);
  }
  return found;
}

/** 用 slug 拼接完整 .md URL */
export function resolveDocUrl(source: DocSource, slug: string): string {
  return source.docUrlPattern.replace('{slug}', slug);
}

/** 从完整 .md URL 反解出 slug（去前缀、去 .md 后缀） */
export function extractSlug(source: DocSource, url: string): string | null {
  if (!url.startsWith(source.docUrlPrefix)) return null;
  const rest = url.slice(source.docUrlPrefix.length);
  return rest.replace(/\.md$/, '');
}

/** 解析命令行 --source=xxx 参数，返回要处理的源列表 */
export function resolveTargetSources(argv: string[]): DocSource[] {
  const arg = argv.find((a) => a.startsWith('--source='));
  if (!arg) return getEnabledSources();
  const id = arg.slice('--source='.length);
  return [getSourceById(id)];
}
