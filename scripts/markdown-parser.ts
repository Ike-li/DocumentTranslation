/**
 * Markdown 分段器
 * 把 Markdown 切成「可翻译文本块」和「保护块」（代码块、frontmatter）。
 * 翻译时只送可翻译块给 API，保护块原样保留。
 *
 * 设计：按行扫描，识别 frontmatter（--- 包裹）和围栏代码块（``` 或 ~~~）。
 * 行内代码、链接 URL 不在此拆分（交由 system prompt 约束模型保留），
 * 以「段落」为翻译单元，保持上下文完整、术语一致。
 */

export interface Segment {
  type: 'translatable' | 'protected';
  content: string;
  /** translatable 段内每行共享的前导空白；翻译时已从 content 剥离，reassemble 时给非空行加回。 */
  indent?: string;
}

const FENCE_RE = /^(\s*)(`{3,}|~{3,})/;
// 独占行的 PascalCase 组件标签（mintlify/MDX 风格）：<Note>, </Note>, <Step title="...">, <Card ... />。
// 这类标签必须配对、不可被翻译丢失，整行作为 protected 透传。
const COMPONENT_TAG_LINE_RE = /^\s*<\/?[A-Z][A-Za-z0-9]*\b.*>\s*$/;

/** 计算多行的最小公共前导空白（忽略空行）。用于 mintlify 嵌套块中保留缩进结构。 */
function commonLeadingIndent(lines: string[]): string {
  let indent: string | null = null;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const m = line.match(/^[ \t]*/)![0];
    if (indent === null) {
      indent = m;
    } else {
      let k = 0;
      const max = Math.min(indent.length, m.length);
      while (k < max && indent[k] === m[k]) k++;
      indent = indent.slice(0, k);
    }
    if (indent === '') break;
  }
  return indent ?? '';
}

/**
 * 移除标签行中的 JSX 表达式属性（mintlify→vitepress 兼容）。
 * 例：`<CardGroup cols={2}>` → `<CardGroup>`、`<div style={{...}}>` → `<div>`。
 * vue 解析 .md 时不接受 JSX `{expr}` 属性值，会报"Attribute name cannot contain..."。
 * 支持单层嵌套花括号（覆盖 `style={{...}}` 这种 JSX 写法）。
 */
function sanitizeJsxAttrs(tagLine: string): string {
  return tagLine.replace(
    /\s+[a-zA-Z][a-zA-Z0-9-]*=\{(?:[^{}]|\{[^{}]*\})*\}/g,
    '',
  );
}

/** 独占行的 HTML/组件标签（含 lowercase HTML 元素如 `<div>`、`<img />`）。 */
const HTML_TAG_LINE_RE = /^\s*<\/?[a-zA-Z][^>]*\/?>\s*$/;

export function segment(markdown: string): Segment[] {
  const lines = markdown.split('\n');
  const segments: Segment[] = [];

  let i = 0;
  const n = lines.length;

  // 1. frontmatter：文件开头的 --- ... ---
  if (lines[0]?.trim() === '---') {
    let j = 1;
    while (j < n && lines[j].trim() !== '---') j++;
    if (j < n) {
      segments.push({ type: 'protected', content: lines.slice(0, j + 1).join('\n') });
      i = j + 1;
    }
  }

  let buffer: string[] = [];
  const flushTranslatable = () => {
    if (buffer.length) {
      const indent = commonLeadingIndent(buffer);
      const stripped = indent
        ? buffer.map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
        : buffer;
      segments.push({ type: 'translatable', content: stripped.join('\n'), indent });
      buffer = [];
    }
  };

  while (i < n) {
    const fence = lines[i].match(FENCE_RE);
    if (fence) {
      flushTranslatable();
      const marker = fence[2][0]; // ` 或 ~
      const start = i;
      i++;
      // 找到对应数量的闭合围栏
      while (i < n) {
        const close = lines[i].match(FENCE_RE);
        if (close && close[2][0] === marker && close[2].length >= fence[2].length) {
          i++;
          break;
        }
        i++;
      }
      segments.push({ type: 'protected', content: lines.slice(start, i).join('\n') });
      continue;
    }
    if (COMPONENT_TAG_LINE_RE.test(lines[i])) {
      flushTranslatable();
      segments.push({ type: 'protected', content: sanitizeJsxAttrs(lines[i]) });
      i++;
      continue;
    }
    buffer.push(lines[i]);
    i++;
  }
  flushTranslatable();

  return segments;
}

/** 把翻译后的可翻译块按原顺序重组回完整 Markdown，恢复每段被剥离的前导空白。 */
export function reassemble(segments: Segment[], translations: Map<number, string>): string {
  return segments
    .map((seg, idx) => {
      if (seg.type !== 'translatable') return seg.content;
      const tr = translations.get(idx) ?? seg.content;
      const indent = seg.indent ?? '';
      if (!indent) return tr;
      return tr
        .split('\n')
        .map((l) => (l === '' ? '' : indent + l))
        .join('\n');
    })
    .join('\n');
}

/**
 * 在独占行的组件标签前后补空行（mintlify→vitepress 兼容），并清理 fence info string 中的 mintlify-only 标记。
 * 翻译过程偶发吞掉段落与 <Note>/<Tip> 之间的空行，导致 markdown 把标签当段落内联，
 * vue compiler 报"missing end tag"。fence info string 里的 `theme={null}` 也会让 vitepress
 * 的 markdown-it-attrs 误解析为属性，统一移除。
 */
/**
 * 在独占行的组件标签前后补空行，并把 mintlify-only 的 PascalCase 组件标签剥离为空行
 * （vitepress 不渲染这些组件，且嵌套结构会让 vue 模板解析失败）。fence info string 中
 * 的 `theme={null}` 也会让 markdown-it-attrs 误当属性，统一移除。剥离后内容仍保留，
 * 视觉效果（callout 框、卡片等）会降级为普通段落。
 */
export function normalizeBlockSpacing(md: string): string {
  // 1. 移除 fence 行末的 theme={...}（仅匹配独占 ``` / ~~~ 起始行，不影响代码内容）
  const fenceClean = md.replace(
    /^(\s*(?:`{3,}|~{3,})[^\n]*?)\s+theme=\{[^}]*\}(\s*)$/gm,
    '$1$2',
  );

  // 2. 对每行：若是独占的 HTML/组件标签行，清理 JSX 表达式属性（如 style={{...}}, cols={2}）
  let lines = fenceClean.split('\n').map((l) =>
    HTML_TAG_LINE_RE.test(l) ? sanitizeJsxAttrs(l) : l,
  );

  // 3. 剥离独占的 PascalCase 组件标签（vitepress 不渲染，留 tag 反而会让嵌套结构失败）
  // 同时移除独占行的 JSX 注释 `{/* ... */}`（mintlify 用法，markdown-it 会误解析）
  lines = lines.map((l) => {
    if (COMPONENT_TAG_LINE_RE.test(l)) return '';
    if (/^\s*\{\/\*[\s\S]*\*\/\}\s*$/.test(l)) return '';
    return l;
  });

  // 4. 行内的 JSX 注释 `{/* ... */}` 也清理（在表格 cell、段落末尾等位置常见）
  // 同时把转义 `\<` 替换为 HTML entity `&lt;`，避免 vue 把 `<path>` 当未闭合 tag。
  // 这两步都需要"跳过 fence 块内部"——围栏代码的字面内容不可改。
  let inFence = false;
  let marker = '';
  let fenceLen = 0;
  lines = lines.map((l) => {
    const m = l.match(FENCE_RE);
    if (m) {
      if (!inFence) {
        inFence = true;
        marker = m[2][0];
        fenceLen = m[2].length;
      } else if (m[2][0] === marker && m[2].length >= fenceLen) {
        inFence = false;
        marker = '';
        fenceLen = 0;
      }
      return l;
    }
    if (inFence) return l;
    return l
      .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
      .replace(/\\</g, '&lt;');
  });

  return lines.join('\n');
}
