> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件查看所有可用页面。

# 为您的组织设置 Claude Code

> 一份为部署 Claude Code 的管理员准备的决策图，涵盖 API 提供商、托管设置、策略强制执行、使用情况监控和数据处理。

Claude Code 通过托管设置强制执行组织策略，这些设置的优先级高于本地开发人员配置。您可以通过 Claude 管理控制台、您的移动设备管理系统（MDM）或磁盘上的文件来传递这些设置。这些设置控制 Claude 可以访问哪些工具、命令、服务器和网络目标。

本页面将按顺序引导您了解部署决策。每一行都链接到下方相应部分以及该领域的参考页面。

  SSO、SCIM 配置和座位分配均在 Claude 账户层级进行配置。请参阅 [《Claude 企业管理员指南》](https://claude.com/resources/tutorials/claude-enterprise-administrator-guide) 以及 [座位分配指南](https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan) 了解相关操作步骤。

| 决策                                                                | 您正在选择的内容                                | 参考链接                                                                                                                                |
| :---------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [选择您的 API 提供商](#choose-your-api-provider)                   | Claude Code 在何处进行身份验证以及计费方式 | [身份验证](/en/authentication), [Bedrock](/en/amazon-bedrock), [Vertex AI](/en/google-vertex-ai), [Foundry](/en/microsoft-foundry) |
| [决定设置如何到达设备](#decide-how-settings-reach-devices)       | 管理策略如何传递到开发人员机器       | [服务器管理的设置](/en/server-managed-settings), [设置文件](/en/settings#settings-files)                                    |
| [决定要强制执行什么](#decide-what-to-enforce)                       | 允许使用哪些工具、命令和集成 | [权限](/en/permissions), [沙箱化](/en/sandboxing)                                                                             |
| [设置使用情况可见性](#set-up-usage-visibility)                     | 如何跟踪花费和采纳情况                    | [分析](/en/analytics), [监控使用情况](/en/monitoring-usage), [成本](/en/costs)                                                       |
| [审查数据处理](#review-data-handling)                           | 数据保留和合规状况               | [数据使用](/en/data-usage), [安全性](/en/security)                                                                                   |

## 选择您的 API 提供商

Claude Code 通过几个 API 提供商之一连接到 Claude。您的选择会影响计费、身份验证、您所继承的合规状况以及您的开发人员可以使用哪些 Claude Code 功能。

| 提供商                      | 在以下情况时选择此选项                                                                                                                      |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| Claude for Teams / Enterprise | 您希望将 Claude Code 和 claude.ai 纳入一个按席位订阅的套餐中，并且无需运行基础设施。这是默认推荐选项。 |
| Claude Console                | 您采用 API 优先策略或希望按使用量付费计费                                                                                        |
| Amazon Bedrock                | 您希望继承现有的 AWS 合规控制和计费                                                                      |
| Google Vertex AI              | 您希望继承现有的 GCP 合规控制和计费                                                                      |
| Microsoft Foundry             | 您希望继承现有的 Azure 合规控制和计费                                                                    |

某些 Claude Code 功能需要 Claude.ai 帐户。[网页版 Claude Code](/en/claude-code-on-the-web)、[例程](/en/routines)、[代码审查](/en/code-review)、[远程控制](/en/remote-control) 和 [Chrome 扩展程序](/en/chrome) 无法单独通过 Console API 密钥或云提供商凭据使用。如果您通过 Bedrock、Vertex 或 Foundry 进行部署，请规划开发人员是否还需要 Claude for Teams 或 Enterprise 席位。每个功能页面都列出了其计划要求。

有关涵盖身份验证、区域和功能对等的完整提供商比较，请参阅[企业部署概述](/en/third-party-integrations)。每个提供商的身份验证设置位于[身份验证](/en/authentication)部分。

[网络配置](/en/network-config)中的代理和防火墙要求适用于所有提供商。如果您希望在多个提供商前设置单一端点或集中化请求日志记录，请参阅 [LLM 网关](/en/llm-gateway)。

## 决定设置如何到达设备

托管设置定义了优先于本地开发人员配置的策略。Claude Code 在四个位置查找它们，并在给定设备上使用找到的第一个。

| 机制               | 交付方式                                                                                                                                                                                              | 优先级 | 平台      |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------- |
| 服务器管理          | Claude.ai 管理控制台                                                                                                                                                                               | 最高  | 全部            |
| plist / 注册表策略 | macOS: `com.anthropic.claudecode` plist<br />Windows: `HKLM\SOFTWARE\Policies\ClaudeCode`                                                                                                             | 高     | macOS, Windows |
| 基于文件的托管      | macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`<br />Linux 和 WSL: `/etc/claude-code/managed-settings.json`<br />Windows: `C:\Program Files\ClaudeCode\managed-settings.json` | 中等   | 全部            |
| Windows 用户注册表   | `HKCU\SOFTWARE\Policies\ClaudeCode`                                                                                                                                                                   | 最低   | 仅限 Windows   |

服务器管理的设置在身份验证时到达设备，并在活跃会话期间每小时刷新一次，无需端点基础设施。它们需要 Claude for Teams 或 Enterprise 计划，因此使用其他提供商的部署需要改用基于文件或操作系统级别的机制。

如果您的组织混合使用提供商，请为 Claude.ai 用户配置[服务器管理的设置](/en/server-managed-settings)，并设置[基于文件或 plist/注册表的后备方案](/en/settings#settings-files)，以便其他用户仍然接收托管策略。

plist 和 HKLM 注册表位置适用于任何提供商，并且由于需要管理员权限才能写入，因此具有防篡改性。HKCU 处的 Windows 用户注册表无需提升权限即可写入，因此将其视为便捷默认项而非强制执行渠道。

默认情况下，WSL 仅读取位于 `/etc/claude-code` 的 Linux 文件路径。要将您的 Windows 注册表和 `C:\Program Files\ClaudeCode` 策略扩展到同一台机器上的 WSL，请在任一仅限管理员的 Windows 来源中设置 [`wslInheritsWindowsSettings: true`](/en/settings#available-settings)。

无论您选择哪种机制，托管值都优先于用户和项目设置。诸如 `permissions.allow` 和 `permissions.deny` 之类的数组设置会合并来自所有来源的条目，因此开发人员可以扩展托管列表但不能从中删除。

请参阅[服务器管理的设置](/en/server-managed-settings)和[设置文件及优先级](/en/settings#settings-files)。

## 决定要强制执行什么

托管设置可以锁定工具、沙箱化执行、限制 MCP 服务器和插件来源，并控制运行哪些钩子。每一行都是一个控制面及其对应的设置键。

| 控制面                                                                                | 功能                                                                                                                       | 关键设置                                                                                                 |
| :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| [权限规则](/en/permissions)                                                    | 允许、询问或拒绝特定工具和命令                                                                                    | `permissions.allow`, `permissions.deny`                                                                      |
| [权限锁定](/en/permissions#managed-only-settings)                           | 仅应用托管的权限规则；禁用 `--dangerously-skip-permissions`                                                      | `allowManagedPermissionRulesOnly`, `permissions.disableBypassPermissionsMode`                                |
| [沙箱化](/en/sandboxing)                                                           | 操作系统级别的文件系统和网络隔离，带有域允许列表                                                                   | `sandbox.enabled`, `sandbox.network.allowedDomains`                                                          |
| [托管策略 CLAUDE.md](/en/memory#deploy-organization-wide-claude-md)              | 在每个会话中加载的组织范围指令，无法被排除                                                                  | 位于托管策略路径的文件                                                                              |
| [MCP 服务器控制](/en/managed-mcp)                                                  | 限制用户可以添加或连接到哪些 MCP 服务器，或部署一组固定的服务器                                                      | `allowedMcpServers`, `deniedMcpServers`, `allowManagedMcpServersOnly`，或已部署的 `managed-mcp.json` 文件 |
| [插件市场控制](/en/plugin-marketplaces#managed-marketplace-restrictions) | 限制用户可以添加和安装哪些市场来源                                                                  | `strictKnownMarketplaces`, `blockedMarketplaces`                                                             |
| [自定义锁定](/en/settings#strictpluginonlycustomization)                   | 阻止来自用户和项目来源的技能、代理、钩子和 MCP 服务器，使其只能来自插件或托管设置 | `strictPluginOnlyCustomization`                                                                              |
| [钩子限制](/en/settings#hook-configuration)                                   | 仅加载托管钩子；限制 HTTP 钩子 URL                                                                                   | `allowManagedHooksOnly`, `allowedHttpHookUrls`                                                               |
| [禁用代理视图](/en/agent-view#how-background-sessions-are-hosted)                | 关闭 `claude agents`、`--bg`、`/background` 和按需监督器                                                      | `disableAgentView`                                                                                           |
| [版本下限](/en/settings)                                                          | 防止自动更新安装低于组织范围最低版本的软件                                                                      | `minimumVersion`                                                                                             |

权限规则和沙箱化涵盖不同层面。拒绝 WebFetch 会阻止 Claude 的获取工具，但如果 Bash 被允许，`curl` 和 `wget` 仍然可以访问任何 URL。沙箱化通过在操作系统级别强制执行网络域允许列表来弥合这一差距。

有关这些控制措施所防御的威胁模型，请参阅[安全性](/en/security)。

## 设置使用情况可见性

根据您的报告需求选择监控方式。

| 功能          | 您获得的内容                                         | 可用性   | 从哪里开始                           |
| :------------------ | :--------------------------------------------------- | :------------- | :--------------------------------------- |
| 使用情况监控    | 会话、工具和 token 的 OpenTelemetry 导出  | 所有提供商  | [监控使用情况](/en/monitoring-usage) |
| 分析仪表板 | 按用户统计指标、贡献跟踪、排行榜 | 仅限 Anthropic | [分析](/en/analytics)               |
| 成本跟踪       | 支出限制、速率限制和使用情况归因     | 仅限 Anthropic | [成本](/en/costs)                       |

云提供商通过 AWS Cost Explorer、GCP Billing 或 Azure Cost Management 公开支出。Claude for Teams 和 Enterprise 计划在 [claude.ai/analytics/claude-code](https://claude.ai/analytics/claude-code) 提供使用情况仪表板。

## 审查数据处理

在 Team、Enterprise、Claude API 和云提供商计划上，Anthropic 不会使用您的代码或提示词来训练模型。您的 API 提供商决定了保留和合规状况。

| 主题                     | 需要了解的内容                                                                    | 从哪里开始                                 |
| :------------------------ | :------------------------------------------------------------------------------ | :--------------------------------------------- |
| 数据使用政策         | Anthropic 收集哪些数据、保留多长时间、哪些数据永远不会用于训练 | [数据使用](/en/data-usage)                   |
| 零数据保留 (ZDR) | 请求完成后不存储任何内容。适用于 Claude for Enterprise  | [零数据保留](/en/zero-data-retention) |
| 安全架构     | 网络模型、加密、身份验证、审计追踪                          | [安全性](/en/security)                       |

如果您需要请求级别的审计日志或根据数据敏感性路由流量，请在开发人员和您的提供商之间放置一个 [LLM 网关](/en/llm-gateway)。有关法规要求和认证，请参阅[法律与合规](/en/legal-and-compliance)。

## 验证和上手

配置托管设置后，让开发人员在 Claude Code 内部运行 `/status`。输出包含一行以 `Enterprise managed settings` 开头，后跟括号中的来源，可以是 `(remote)`、`(plist)`、`(HKLM)`、`(HKCU)` 或 `(file)` 中的一个。参见[验证活动设置](/en/settings#verify-active-settings)。

分享以下资源以帮助开发人员入门：

* [快速入门](/en/quickstart)：从安装到处理项目的首次会话演练
* [常见工作流](/en/common-workflows)：日常任务的模式，如代码审查、重构和调试
* [Claude 101](https://anthropic.skilljar.com/claude-101) 和 [Claude Code 实战](https://anthropic.skilljar.com/claude-code-in-action)：自定进度的 Anthropic 学院课程

对于登录问题，请引导开发人员查看[身份验证故障排除](/en/troubleshoot-install#login-and-authentication)。最常见的修复方法是：

* 运行 `/logout` 然后 `/login` 以切换帐户
* 如果缺少企业身份验证选项，请运行 `claude update`
* 更新后重启终端

如果开发人员看到“You haven't been added to your organization yet”，说明他们的席位不包含 Claude Code 访问权限，需要在管理控制台中进行更新。

## 后续步骤

选择提供商和交付机制后，继续进行详细配置：

* [服务器管理的设置](/en/server-managed-settings)：从 Claude 管理控制台交付托管策略
* [设置参考](/en/settings)：每个设置键、文件位置和优先级规则
* [Monorepos 和大型仓库](/en/large-codebases)：针对部署到 monorepo 的组织的按目录配置模式
* [Amazon Bedrock](/en/amazon-bedrock), [Google Vertex AI](/en/google-vertex-ai), [Microsoft Foundry](/en/microsoft-foundry)：特定提供商的部署
* [Claude 企业管理员指南](https://claude.com/resources/tutorials/claude-enterprise-administrator-guide)：SSO、SCIM、席位管理和推出策略手册