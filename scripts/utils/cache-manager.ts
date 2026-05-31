/**
 * 翻译缓存管理器
 * 以「源文本内容 hash」为键缓存译文，避免重复调用 API。
 * 每个源独立：cache/{id}/translation-cache.json
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cacheDir, ensureDir } from './common.ts';

export class TranslationCache {
  private map: Record<string, string>;
  private path: string;
  private hits = 0;
  private misses = 0;

  constructor(sourceId: string) {
    this.path = join(cacheDir(sourceId), 'translation-cache.json');
    this.map = existsSync(this.path)
      ? (JSON.parse(readFileSync(this.path, 'utf-8')) as Record<string, string>)
      : {};
  }

  private key(text: string): string {
    return createHash('sha256').update(text, 'utf-8').digest('hex');
  }

  get(text: string): string | null {
    const v = this.map[this.key(text)];
    if (v !== undefined) {
      this.hits++;
      return v;
    }
    this.misses++;
    return null;
  }

  set(text: string, translated: string): void {
    this.map[this.key(text)] = translated;
  }

  flush(sourceId: string): void {
    ensureDir(cacheDir(sourceId));
    writeFileSync(this.path, JSON.stringify(this.map, null, 2), 'utf-8');
  }

  stats(): { hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return { hits: this.hits, misses: this.misses, hitRate: total ? this.hits / total : 0 };
  }
}
