/**
 * 全局类型定义
 */

/** 数据源配置（来自 config/sources.config.json） */
export interface DocSource {
  /** 唯一标识，用作 docs/ 和 cache/ 下的目录名 */
  id: string;
  /** 英文名（站点导航） */
  name: string;
  /** 中文名 */
  name_zh: string;
  /** llms.txt 索引地址 */
  indexUrl: string;
  /** .md 文档 URL 模板，{slug} 为占位符 */
  docUrlPattern: string;
  /** .md 文档 URL 公共前缀，用于反解 slug */
  docUrlPrefix: string;
  /** 站点导航排序 */
  navOrder: number;
  /** 是否启用 */
  enabled: boolean;
  /** 需排除的 slug（聚合文件、机器手册等），可选 */
  excludeSlugs?: string[];
}

/** 单篇文档的元信息（解析 llms.txt 得到） */
export interface DocMetadata {
  /** 所属数据源 id */
  sourceId: string;
  /** 文档 slug，如 "agent-sdk/overview" */
  slug: string;
  /** 完整 .md URL */
  url: string;
  /** 文档标题（llms.txt 链接文本） */
  title: string;
  /** 分类（llms.txt 的 ## 小节标题） */
  category: string;
  /** 描述（llms.txt 链接后的说明文字） */
  description: string;
}

/** 变更检测结果 */
export interface ChangeReport {
  sourceId: string;
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}
