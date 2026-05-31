> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 零数据保留

> 了解 Claude Code 在 Claude for Enterprise 上的零数据保留（ZDR），包括适用范围、被禁用的功能以及如何申请启用。

零数据保留（ZDR）适用于通过 Claude for Enterprise 使用的 Claude Code。启用 ZDR 后，Claude Code 会话中产生的提示词与模型响应将实时处理，响应返回后 Anthropic 不会再保存它们，除非出于法律合规或防止滥用的需要。

Claude for Enterprise 上的 ZDR 让企业客户可以在零数据保留的前提下使用 Claude Code，并享有以下管理能力：

* 按用户的成本控制
* [Analytics](/en/analytics) 仪表盘
* [服务器托管设置](/en/server-managed-settings)
* 审计日志

Claude for Enterprise 上的 Claude Code ZDR 仅适用于 Anthropic 的直接平台。对于在 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 上部署的 Claude，请参考这些平台各自的数据保留政策。

## ZDR 适用范围

ZDR 涵盖 Claude for Enterprise 上的 Claude Code 推理。


  ZDR 按组织启用。每个新组织都需要由你的 Anthropic 客户团队单独启用 ZDR。ZDR 不会自动应用到同一账号下新建的组织。如需为新组织启用 ZDR，请联系你的客户团队。


### ZDR 涵盖的内容

ZDR 涵盖通过 Claude for Enterprise 上的 Claude Code 发起的模型推理调用。当你在终端中使用 Claude Code 时，发送的提示词以及 Claude 生成的响应都不会被 Anthropic 保留。无论使用哪个 Claude 模型，这一点都适用。

### ZDR 不涵盖的内容

即便组织启用了 ZDR，下列项目也不在覆盖范围内。它们遵循[标准数据保留政策](/en/data-usage#data-retention)：

| 功能                  | 详情                                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| claude.ai 上的 Chat        | 通过 Claude for Enterprise 网页界面进行的 Chat 对话不在 ZDR 覆盖范围内。                                                                                                                                                                                                  |
| Cowork                   | Cowork 会话不在 ZDR 覆盖范围内。                                                                                                                                                                                                                     |
| Claude Code Analytics    | 不会存储提示词或模型响应，但会收集生产力元数据，例如账号邮箱与使用统计。ZDR 组织无法使用贡献度指标；[analytics 仪表盘](/en/analytics) 仅显示使用情况指标。 |
| 用户与席位管理 | 管理类数据，例如账号邮箱与席位分配，按标准政策保留。                                                                                                                                                                                                     |
| 第三方集成 | 第三方工具、MCP 服务器或其他外部集成处理的数据不在 ZDR 覆盖范围内。请独立审阅这些服务的数据处理实践。                                                                                       |

## 在 ZDR 下被禁用的功能

当 Claude for Enterprise 上的 Claude Code 组织启用 ZDR 后，某些需要存储提示词或补全的功能会在后端自动禁用：

| 功能                                                             | 原因                                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [Claude Code on the Web](/en/claude-code-on-the-web)                | 需要服务端存储对话历史。                   |
| 来自桌面应用的[远程会话](/en/desktop#remote-sessions) | 需要持久化包含提示词和补全的会话数据。 |
| 反馈提交（`/feedback`）                                   | 提交反馈会把对话数据发送到 Anthropic。               |

无论客户端是否显示，这些功能都会在后端被屏蔽。如果你在 Claude Code 终端启动期间看到某个被禁用的功能，尝试使用时会返回错误，提示该组织的策略不允许此操作。

如果未来出现的新功能也需要存储提示词或补全，可能同样会被禁用。

## 政策违规情况下的数据保留

即便启用了 ZDR，Anthropic 仍可能根据法律要求或为应对使用政策违规情况而保留数据。如果会话因政策违规被标记，Anthropic 可能会保留相关输入和输出最长 2 年，与 Anthropic 的标准 ZDR 政策一致。

## 申请 ZDR

如需为 Claude for Enterprise 上的 Claude Code 申请 ZDR，请[联系销售](https://www.anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=zero_data_retention_request)或你的 Anthropic 客户团队。客户团队会在内部提交申请，Anthropic 在确认资格后会为你的组织启用 ZDR。所有启用动作都有审计日志。

如果你目前是通过按量付费的 API 密钥使用 Claude Code 的 ZDR，可以转移到 Claude for Enterprise，以在保留 Claude Code ZDR 的同时获得管理类功能。请联系你的客户团队协调迁移。
