/**
 * 小米 MiMo API 客户端（OpenAI 兼容 /chat/completions）
 *
 * ⚠️ 合规：必须使用「程序化 / 按量计费」key（MIMO_API_KEY），
 * 不可使用交互套餐 key。详见 .env.example 与架构设计 §5.1。
 *
 * 不引入额外 SDK，直接 fetch OpenAI 兼容端点。
 */
import { sleep } from './common.ts';

export interface MiMoConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/** 从环境变量读取配置，缺失则抛错（提示去配 .env） */
export function loadMiMoConfig(): MiMoConfig {
  const apiKey = process.env.MIMO_API_KEY;
  const baseUrl = process.env.MIMO_BASE_URL;
  const model = process.env.MIMO_MODEL;
  const missing = [
    !apiKey && 'MIMO_API_KEY',
    !baseUrl && 'MIMO_BASE_URL',
    !model && 'MIMO_MODEL',
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(
      `缺少环境变量：${missing.join(', ')}。\n` +
        '请复制 .env.example 为 .env 并填入「程序化」API 配置（勿用交互套餐 key）。',
    );
  }
  return { apiKey: apiKey!, baseUrl: baseUrl!, model: model! };
}

const SYSTEM_PROMPT = [
  '你是专业的技术文档翻译。将用户提供的英文 Markdown 片段翻译为简体中文。',
  '严格遵守：',
  '1. 只输出译文，不要任何解释、不要包裹代码块。',
  '2. 保留所有 Markdown 标记：标题井号、列表符号、表格、加粗/斜体、行内代码 `...`。',
  '3. 保留所有链接 URL、图片路径、HTML 标签、占位符不变。',
  '4. 行内代码、产品名、API 名、命令、参数名保持英文原样。',
  '5. 保持原有的换行和段落结构。',
].join('\n');

export interface TranslateStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class MiMoClient {
  private cfg: MiMoConfig;
  public stats: TranslateStats = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  constructor(cfg: MiMoConfig) {
    this.cfg = cfg;
  }

  /** 翻译一段文本，带重试。429 触发更长指数退避；其它错误用普通退避。 */
  async translate(text: string, glossary = '', retries = 10): Promise<string> {
    const system = glossary ? `${SYSTEM_PROMPT}\n\n术语表（须遵循）：\n${glossary}` : SYSTEM_PROMPT;
    const body = {
      model: this.cfg.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
    };

    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${this.cfg.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cfg.apiKey}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errText = await res.text();
          const err = new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
          (err as { status?: number }).status = res.status;
          throw err;
        }
        const data = (await res.json()) as {
          choices: { message: { content: string } }[];
          usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        };
        if (data.usage) {
          this.stats.promptTokens += data.usage.prompt_tokens;
          this.stats.completionTokens += data.usage.completion_tokens;
          this.stats.totalTokens += data.usage.total_tokens;
        }
        return data.choices[0]?.message?.content ?? '';
      } catch (err) {
        lastErr = err;
        if (attempt >= retries) break;
        const status = (err as { status?: number }).status;
        // 429：限速命中，退避基数 3s，最长 10min（cap），让重试覆盖到限速窗口结束。
        // 其它错误：1s 起常规指数退避。
        const base = status === 429 ? 3000 : 1000;
        const jitter = Math.floor(Math.random() * 500);
        const wait = Math.min(base * 2 ** attempt, 600000) + jitter;
        await sleep(wait);
      }
    }
    throw new Error(`翻译请求失败（重试 ${retries} 次）：${String(lastErr)}`);
  }
}
