/**
 * 极简 .env 加载器（不引入 dotenv 依赖）
 * 在脚本入口调用 loadEnv()，把 .env 的键值注入 process.env。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './common.ts';

export function loadEnv(): void {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // 去掉成对引号
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
