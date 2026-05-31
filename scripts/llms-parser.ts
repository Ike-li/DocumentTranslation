/**
 * llms.txt 解析器
 * 格式：
 *   ## 分类标题
 *   - [文档标题](https://.../slug.md): 描述文字
 */
import type { DocSource, DocMetadata } from './types.ts';
import { extractSlug } from './utils/source-registry.ts';

// 匹配 markdown 链接行：- [title](url): description
const LINK_RE = /^\s*-\s*\[([^\]]+)\]\(([^)]+)\)\s*:?\s*(.*)$/;
// 匹配二级标题作为分类
const HEADING_RE = /^##\s+(.+?)\s*$/;

/**
 * 解析 llms.txt 内容，提取属于该源的所有 .md 文档
 * 只保留 docUrlPrefix 前缀、且以 .md 结尾的链接（过滤 llms-full.txt 等聚合文件）
 */
export function parseLlmsTxt(content: string, source: DocSource): DocMetadata[] {
  const lines = content.split('\n');
  const docs: DocMetadata[] = [];
  const seen = new Set<string>();
  let category = 'General';

  for (const line of lines) {
    const heading = line.match(HEADING_RE);
    if (heading) {
      category = heading[1].trim();
      continue;
    }

    const m = line.match(LINK_RE);
    if (!m) continue;

    const [, title, url, description] = m;
    // 只要属于本源、且是 .md 文档
    if (!url.startsWith(source.docUrlPrefix) || !url.endsWith('.md')) continue;

    const slug = extractSlug(source, url);
    if (!slug) continue;
    // 跳过聚合/特殊文件
    if (slug.includes('llms-full') || slug.endsWith('llms')) continue;
    // 跳过配置中显式排除的 slug
    if (source.excludeSlugs?.includes(slug)) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    docs.push({
      sourceId: source.id,
      slug,
      url,
      title: title.trim(),
      category,
      description: description.trim(),
    });
  }

  return docs;
}
