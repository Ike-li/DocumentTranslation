> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 安全

> 了解 Claude Code 的安全保障措施和安全使用的最佳实践。

## 我们的安全方法

### 安全基础

代码安全至关重要。Claude Code 以安全为核心构建，按照 Anthropic 全面的安全计划进行开发。更多信息和资源（SOC 2 Type 2 报告、ISO 27001 证书等）请访问 [Anthropic 信任中心](https://trust.anthropic.com)。

### 基于权限的架构

Claude Code 默认使用严格的只读权限。当需要执行额外操作（编辑文件、运行测试、执行命令）时，Claude Code 会请求明确的权限。用户可以选择批准单次操作或允许自动执行。

我们设计 Claude Code 时注重透明和安全。例如，执行 bash 命令前需要获得批准，让你直接掌控。这种方法使用户和组织能够直接配置权限。

详细的权限配置请参阅[权限](/zh/permissions)。

### 内置防护

为降低智能体系统中的风险：

* **沙箱 bash 工具**：通过文件系统和网络隔离对 bash 命令进行[沙箱](/zh/sandboxing)化，减少权限提示的同时保持安全性。使用 `/sandbox` 启用，定义 Claude Code 可自主工作的边界
* **写入访问限制**：Claude Code 只能写入启动文件夹及其子文件夹——未经明确许可，无法修改父目录中的文件。虽然 Claude Code 可以读取工作目录外的文件（用于访问系统库和依赖项），但写入操作严格限制在项目范围内，形成明确的安全边界
* **提示词疲劳缓解**：支持按用户、按代码库或按组织设置常用安全命令的允许列表
* **接受编辑模式**：自动批准文件编辑和一组固定的文件系统 Bash 命令，如 `mkdir`、`touch`、`rm`、`mv`、`cp` 和 `sed`，适用于工作目录中的路径。其他 Bash 命令和超出范围的路径仍会提示

### 用户责任

Claude Code 只拥有你授予的权限。你有责任在批准前审查提议的代码和命令以确保安全。

## 防范提示词注入

提示词注入是一种攻击技术，攻击者试图通过插入恶意文本来覆盖或操控 AI 助手的指令。Claude Code 包含多项针对此类攻击的防护措施：

### 核心防护

* **权限系统**：敏感操作需要明确批准
* **上下文感知分析**：通过分析完整请求来检测潜在有害指令
* **输入清洗**：通过处理用户输入防止命令注入
* **命令黑名单**：默认阻止从网络获取任意内容的高风险命令，如 `curl` 和 `wget`。当明确允许时，请注意[权限模式限制](/zh/permissions#tool-specific-permission-rules)

### 隐私保障

我们实施了多项保障措施来保护你的数据，包括：

* 敏感信息的有限保留期（详见[隐私中心](https://privacy.anthropic.com/en/articles/10023548-how-long-do-you-store-my-data)）
* 对用户会话数据的受限访问
* 用户对数据训练偏好的控制。个人用户可随时更改[隐私设置](https://claude.ai/settings/privacy)

完整详情请查阅我们的[商业服务条款](https://www.anthropic.com/legal/commercial-terms)（适用于团队、企业和 API 用户）或[消费者条款](https://www.anthropic.com/legal/consumer-terms)（适用于免费、Pro 和 Max 用户）以及[隐私政策](https://www.anthropic.com/legal/privacy)。

### 额外保障

* **网络请求审批**：发出网络请求的工具默认需要用户批准
* **隔离上下文窗口**：网页抓取使用独立的上下文窗口，避免注入潜在恶意提示词
* **信任验证**：首次运行代码库和新的 MCP 服务器需要信任验证
  * 注意：使用 `-p` 标志非交互式运行时，信任验证会被禁用。[`--worktree`](/zh/worktrees) 是例外，仍要求目录信任已被接受
  * 注意：直接在主目录启动 Claude Code 时，信任接受仅对当前会话有效，不会写入磁盘，因此每次启动都会重新出现提示。没有持久化设置。请改为从项目子目录启动 Claude Code，信任接受会按目录保存
* **命令注入检测**：可疑的 bash 命令即使已被加入允许列表，仍需手动批准
* **未匹配默认拒绝**：未匹配的命令默认要求手动批准
* **自然语言描述**：复杂的 bash 命令包含解释，便于用户理解
* **安全凭证存储**：API 密钥和令牌已加密。参见[凭证管理](/zh/authentication#credential-management)

**警告 — Windows WebDAV 安全风险**：在 Windows 上运行 Claude Code 时，我们建议不要启用 WebDAV 或允许 Claude Code 访问可能包含 WebDAV 子目录的路径（如 `\\*`）。[WebDAV 已被 Microsoft 弃用](https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features#:~:text=The%20Webclient%20\(WebDAV\)%20service%20is%20deprecated)，存在安全风险。启用 WebDAV 可能让 Claude Code 触发对远程主机的网络请求，绕过权限系统。

**处理不受信任内容的最佳实践**：

1. 批准前审查建议的命令
2. 避免将不受信任的内容直接管道传输给 Claude
3. 验证对关键文件的提议更改
4. 使用虚拟机（VM）运行脚本和调用工具，特别是在与外部 Web 服务交互时
5. 使用 `/feedback` 报告可疑行为

**警告**：虽然这些防护措施显著降低了风险，但没有系统能完全免受所有攻击。使用任何 AI 工具时，请始终保持良好的安全实践。

## MCP 安全

Claude Code 允许用户配置模型上下文协议（MCP）服务器。允许的 MCP 服务器列表在源代码中配置，作为工程师提交到源码控制的 Claude Code 设置的一部分。

我们鼓励编写自己的 MCP 服务器或使用你信任的提供商的 MCP 服务器。你可以为 MCP 服务器配置 Claude Code 权限。Anthropic 会根据其[列出标准](https://claude.com/docs/connectors/building/review-criteria)审查连接器后再添加到 [Anthropic 目录](https://claude.ai/directory)，但不对任何 MCP 服务器进行安全审计或管理。

## IDE 安全

有关在 IDE 中运行 Claude Code 的更多信息，请参阅 [VS Code 安全与隐私](/zh/vs-code#security-and-privacy)。

## 云执行安全

使用 [Web 版 Claude Code](/zh/claude-code-on-the-web) 时，额外的安全控制已就位：

* **隔离虚拟机**：每个云会话在隔离的、由 Anthropic 管理的 VM 中运行
* **网络访问控制**：网络访问默认受限，可配置为禁用或仅允许特定域名
* **凭证保护**：身份验证通过安全代理处理，在沙箱内使用范围限定的凭证，然后转换为你的实际 GitHub 身份验证令牌
* **分支限制**：Git 推送操作限制为当前工作分支
* **审计日志**：云环境中的所有操作均被记录，用于合规和审计
* **自动清理**：云环境在会话完成后自动终止

更多云执行详情，请参阅 [Web 版 Claude Code](/zh/claude-code-on-the-web)。

[远程控制](/zh/remote-control)会话的工作方式不同：Web 界面连接到在本地机器上运行的 Claude Code 进程。所有代码执行和文件访问都在本地进行，与任何本地 Claude Code 会话相同的数据通过 TLS 经 Anthropic API 传输。不涉及云 VM 或沙箱化。连接使用多个短期、范围限定的凭证，每个凭证限于特定用途并独立过期，以限制任何单个凭证泄露的影响范围。

## 安全最佳实践

### 处理敏感代码

* 批准前审查所有建议的更改
* 为敏感仓库使用项目特定的权限设置
* 考虑使用[开发容器](/zh/devcontainer)进行额外隔离
* 使用 `/permissions` 定期审计权限设置

### 团队安全

* 使用[托管设置](/zh/settings#settings-files)强制执行组织标准
* 通过版本控制共享已批准的权限配置
* 培训团队成员安全最佳实践
* 通过 [OpenTelemetry 指标](/zh/monitoring-usage)监控 Claude Code 使用情况
* 使用 [`ConfigChange` 钩子](/zh/hooks#configchange)审计或阻止会话期间的设置更改

### 报告安全问题

如果你发现 Claude Code 的安全漏洞：

1. 不要公开披露
2. 通过我们的 [HackerOne 计划](https://hackerone.com/4f1f16ba-10d3-4d09-9ecc-c721aad90f24/embedded_submissions/new)报告
3. 包含详细的复现步骤
4. 在公开披露前留出时间让我们处理该问题

## 相关资源

* [安全指导插件](/zh/security-guidance)：让 Claude 在会话期间审查和修复其自身代码更改中的漏洞
* [沙箱环境](/zh/sandbox-environments)：比较隔离方法并为你的威胁模型选择合适的方案
* [沙箱化](/zh/sandboxing)：Bash 命令的文件系统和网络隔离
* [权限](/zh/permissions)：配置权限和访问控制
* [监控使用](/zh/monitoring-usage)：跟踪和审计 Claude Code 活动
* [开发容器](/zh/devcontainer)：安全、隔离的环境
* [Anthropic 信任中心](https://trust.anthropic.com)：安全认证和合规
