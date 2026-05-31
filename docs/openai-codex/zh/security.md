# Codex 安全

<CtaPillLink
  href="https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4"
  label="Install plugin in Codex App"
  icon="external"
  class="my-8"
/>

有关安装步骤、支持的技能和审查边界，请参阅
[Codex 安全插件指南](https://developers.openai.com/codex/security/plugin)。

### 探索插件用例

- [运行深度安全扫描](https://developers.openai.com/codex/use-cases/deep-security-scan)以执行更高召回率的仓库级审计。
- [扫描代码变更的安全性](https://developers.openai.com/codex/use-cases/scan-code-changes-for-security)，在合并 Pull Request 或分支之前进行检查。
- [修复漏洞积压](https://developers.openai.com/codex/use-cases/remediate-vulnerability-backlog)，对已批准的发现进行有界的修复。

该插件在你的 Codex 线程中运行。Codex 安全云通过 Codex Web 扫描已连接的
GitHub 仓库。有关 Codex 沙箱、审批、网络控制和管理设置，请参阅[代理审批与安全](https://developers.openai.com/codex/agent-approvals-security)。

## Codex 安全云

Codex 安全云目前处于研究预览阶段。它扫描已连接的 GitHub 仓库以发现可能的安全问题。

它帮助团队：

1. **发现可能的漏洞**，通过使用仓库特定的威胁模型和真实代码上下文。
2. **减少噪音**，在你审查之前先验证发现。
3. **推动发现向修复迈进**，通过排序结果、证据和建议的补丁选项。

## Codex 安全云的工作原理

Codex 安全逐个提交地扫描已连接的仓库。它从你的仓库构建扫描上下文，根据该上下文检查可能的漏洞，并在隔离环境中验证高信号问题后再呈现给你。

你获得的工作流专注于：

- 基于仓库特定的上下文，而非通用签名
- 验证证据，帮助减少误报
- 可在 GitHub 中审查的建议修复

## Codex 安全云的访问与前提条件

Codex 安全适用于 ChatGPT Enterprise、Edu、Business 和 Pro 用户。它通过 Codex Web 与已连接的 GitHub 仓库配合使用。如果你需要访问权限或某个仓库不可见，请确认该仓库在你的 Codex Web 工作区中可用，或联系你的 OpenAI 客户团队。

## 相关文档

- [Codex 安全插件指南](https://developers.openai.com/codex/security/plugin)涵盖 Codex 中的本地仓库和差异审查工作流。
- [Codex 安全云设置](https://developers.openai.com/codex/security/setup)涵盖设置、扫描和发现审查。
- [改进威胁模型](https://developers.openai.com/codex/security/threat-model)解释如何调整范围、攻击面和关键性假设。
- [常见问题](https://developers.openai.com/codex/security/faq)涵盖常见产品问题。
