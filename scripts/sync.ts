/**
 * sync 编排器：本地一条命令完成「抓取 → 变更检测 → 仅翻译变更」
 *
 * ⚠️ 翻译环节需「程序化」MIMO key，勿用交互套餐 key。
 *
 * CLI 用法：
 *   npm run sync                       # 处理所有启用源
 *   npm run sync -- --source=xxx       # 指定源
 *   npm run sync -- --all              # 强制全量翻译（忽略变更检测）
 */
import { resolveTargetSources } from './utils/source-registry.ts';
import { loadEnv } from './utils/load-env.ts';
import { fetchSource } from './fetch-docs.ts';
import { detectSource } from './detect-changes.ts';
import { translateSource } from './translate.ts';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cacheDir, ensureDir } from './utils/common.ts';

export async function sync(argv: string[]): Promise<void> {
  loadEnv();
  const sources = resolveTargetSources(argv);
  const forceAll = argv.includes('--all');

  for (const source of sources) {
    console.log(`\n=== [${source.id}] 同步开始 ===`);

    // 1. 抓取最新英文文档
    await fetchSource(source);

    // 2. 变更检测
    const { report, newHashes } = await detectSource(source);
    const changed = [...report.added, ...report.modified];
    console.log(
      `[${source.id}] 变更：+${report.added.length} ~${report.modified.length} -${report.deleted.length}`,
    );

    // 3. 翻译
    const toTranslate = forceAll ? undefined : changed;
    if (!forceAll && changed.length === 0) {
      console.log(`[${source.id}] 无变更，跳过翻译`);
    } else {
      await translateSource(source, toTranslate);
    }

    // 4. 翻译成功后更新 hash 缓存（确保下次只翻新变更）
    ensureDir(cacheDir(source.id));
    writeFileSync(
      join(cacheDir(source.id), 'doc-hashes.json'),
      JSON.stringify(newHashes, null, 2),
      'utf-8',
    );
    console.log(`=== [${source.id}] 同步完成 ===`);
  }

  console.log('\n✅ 全部同步完成。可运行 npm run dev 预览，确认后 git push 部署。');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sync(process.argv.slice(2)).catch((err) => {
    console.error('❌ 同步失败：', err);
    process.exit(1);
  });
}
