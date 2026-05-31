/**
 * 对 docs/{source}/zh/*.md 应用 normalizeBlockSpacing 后处理
 * 让所有翻译产物（无论 MIMO 脚本/子代理/手改）都过同一道清洗：
 * - 剥 mintlify PascalCase 组件标签
 * - 清 fence info 末 theme={null}
 * - 清独占 HTML 标签里的 JSX 表达式属性
 * - 删独占行 JSX 注释 {/* ... *\/}
 *
 * 用法：
 *   npm run sanitize -- --source=claude-code
 *   npm run sanitize  # 处理所有 enabled 源
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { resolveTargetSources } from './utils/source-registry.ts';
import { docsDir } from './utils/common.ts';
import { normalizeBlockSpacing } from './markdown-parser.ts';

function listMd(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.md')) out.push(full);
    }
  };
  walk(dir);
  return out;
}

function main(argv: string[]): void {
  const sources = resolveTargetSources(argv);
  let totalChanged = 0;
  let totalChecked = 0;
  for (const source of sources) {
    const zhDir = docsDir(source.id, 'zh');
    const files = listMd(zhDir);
    let changed = 0;
    for (const file of files) {
      const before = readFileSync(file, 'utf-8');
      const after = normalizeBlockSpacing(before);
      if (after !== before) {
        writeFileSync(file, after, 'utf-8');
        changed++;
        console.log(`  ✓ ${relative(zhDir, file)}`);
      }
    }
    console.log(`[${source.id}] 处理 ${files.length} 篇，修改 ${changed} 篇`);
    totalChanged += changed;
    totalChecked += files.length;
  }
  console.log(`\n总计：${totalChanged}/${totalChecked} 篇被修改`);
}

main(process.argv.slice(2));
