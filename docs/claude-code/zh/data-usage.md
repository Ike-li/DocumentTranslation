> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件可在进一步探索前发现所有可用页面。

# 数据使用

> 了解 Anthropic 关于 Claude 的数据使用政策

## 数据政策

### 数据训练政策

**个人用户（免费、专业和高级套餐）**：
我们允许您选择是否让您的数据用于改进未来的 Claude 模型。当此设置开启时（包括当您从这些账户使用 Claude Code 时），我们将使用免费、专业和高级账户的数据来训练新模型。

**商业用户**：（团队和企业套餐、API、第三方平台以及 Claude Gov）维持现有政策：在商业条款下，Anthropic 不会使用发送至 Claude Code 的代码或提示词来训练生成式模型，除非客户选择提供其数据给我们用于模型改进（例如，[开发者合作伙伴计划](https://support.claude.com/en/articles/11174108-about-the-development-partner-program)）。

### 开发者合作伙伴计划

如果您明确选择加入向我们提供训练材料的方法，例如通过[开发者合作伙伴计划](https://support.claude.com/en/articles/11174108-about-the-development-partner-program)，我们可能会使用所提供的这些材料来训练我们的模型。组织管理员可以为其组织明确选择加入开发者合作伙伴计划。请注意，此计划仅适用于 Anthropic 第一方 API，不适用于 Bedrock 或 Vertex 用户。

### 使用 `/feedback` 命令反馈

如果您选择使用 `/feedback` 命令向我们发送关于 Claude Code 的反馈，我们可能会使用您的反馈来改进我们的产品和服务。通过 `/feedback` 共享的对话记录将保留 5 年。

### 会话质量调查

当您在 Claude Code 中看到“这个会话中 Claude 表现如何？”的提示时，对此调查的回应（包括选择“忽略”）仅记录您的评分。作为评分提示本身的一部分，我们不会收集或存储任何对话记录、输入、输出或其他会话数据。与点赞/点踩反馈或 `/feedback` 报告不同，此会话质量调查是一个简单的产品满意度指标。

在评分提示之后，您可能会看到一个单独的后续问题：“Anthropic 能否查看您的会话记录以帮助我们改进 Claude Code？”这是一个可选的第二步，与评分不同：

* **是**：将您的对话记录、任何子代理对话记录以及来自磁盘的原始会话日志文件上传到 Anthropic。上传前会隐去已知的 API 密钥和 token 模式。源代码、文件内容和其他对话内容按原样上传。共享的记录保留最多 6 个月。
* **否**：拒绝上传，不发送任何内容。
* **不再询问**：拒绝并阻止此后续问题在未来会话中出现

除非您明确选择**是**，否则不会上传任何内容。设置了[零数据保留](/zh/zero-data-retention)的组织、或根据组织策略禁用了产品反馈的组织、或设置了 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRASSION` 的组织，永远不会看到此后续问题。您对此调查的回应，包括在评分提示后提交的会话记录，不会影响您的数据训练偏好，也不能用于训练我们的 AI 模型。

要禁用这些调查，请设置 `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1`。当设置了 `DISABLE_TELEMETRY`、`DO_NOT_TRACK` 或 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 时，调查也会被禁用。那些阻止非必要流量但通过其自身的 [OpenTelemetry 收集器](/zh/monitoring-usage)捕获调查响应的组织，可以通过设置 `CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL=1` 来重新启用调查。然后调查仅将评分记录到配置的收集器。转录共享的后续问题以及所有其他面向 Anthropic 的反馈流量保持禁用状态。若要控制频率而非禁用，请在您的设置文件中将 [`feedbackSurveyRate`](/zh/settings#available-settings) 设置为介于 `0` 和 `1` 之间的概率值。

### 数据保留

Anthropic 根据您的账户类型和偏好保留 Claude Code 数据。

**个人用户（免费、专业和高级套餐）**：

* 允许数据用于模型改进的用户：5 年保留期，以支持模型开发和安全改进
* 不允许数据用于模型改进的用户：30 天保留期
* 隐私设置可随时在 [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls) 更改。

**商业用户（团队、企业和 API）**：

* 标准：30 天保留期
* [零数据保留](/zh/zero-data-retention)：适用于 Claude for Enterprise 上的 Claude Code。ZDR 按组织启用；每个新组织必须由您的客户团队单独启用 ZDR
* 本地缓存：Claude Code 客户端默认将会话记录以纯文本形式存储在本地 `~/.claude/projects/` 目录下，为期 30 天，以便恢复会话。可通过 `cleanupPeriodDays` 调整此期限。有关存储的内容以及清除方法，请参阅[应用程序数据](/zh/claude-directory#application-data)。

您可以随时删除网络版 Claude Code 的单个会话。删除会话将永久移除该会话的事件数据。有关如何删除会话的说明，请参阅[删除会话](/zh/claude-code-on-the-web#delete-sessions)。

在我们的[隐私中心](https://privacy.anthropic.com/)了解更多关于数据保留实践的信息。

欲了解完整详情，请参阅我们的[商业服务条款](https://www.anthropic.com/legal/commercial-terms)（适用于团队、企业和 API 用户）或[消费者条款](https://www.anthropic.com/legal/consumer-terms)（适用于免费、专业和高级用户）以及[隐私政策](https://www.anthropic.com/legal/privacy)。

## 数据访问

对于所有第一方用户，您可以了解更多关于[本地 Claude Code](#本地-claude-code数据流和依赖) 和[远程 Claude Code] 所记录的数据。[远程控制](/zh/remote-control)会话遵循本地数据流，因为所有执行都发生在您的机器上。请注意，对于远程 Claude Code，Claude 会访问您启动 Claude Code 会话所在的仓库。Claude 不会访问您已连接但尚未开始会话的仓库。

## 本地 Claude Code：数据流和依赖

下图展示了 Claude Code 在安装和正常操作期间如何连接到外部服务。实线表示必需连接，虚线表示可选或用户发起的数据流。

<img src="https://mintcdn.com/claude-code/RcOyXc06Ja8cuvMZ/images/claude-code-data-flow.svg?fit=max&auto=format&n=RcOyXc06Ja8cuvMZ&q=85&s=b5be40abf333defe984993af89546c19" alt="图示 Claude Code 的外部连接：安装/更新连接到分发服务器，用户请求连接到 Anthropic 服务，包括控制台认证、公共 API，以及可选的指标、Sentry 和错误报告" width="720" height="520" data-path="images/claude-code-data-flow.svg" />

Claude Code 在本地运行。要与大语言模型交互，Claude Code 通过网络发送数据。此数据包括所有用户提示和模型输出，并通过 TLS 1.2+ 加密传输。Claude Code 与大多数流行的 VPN 和大语言模型代理兼容。

静态加密取决于您的模型提供商：

| 提供商               | 静态加密                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic API        | 基础设施级别的磁盘加密 (AES-256)。启用[零数据保留](/zh/zero-data-retention)可实现无服务器端持久化。                                                  |
| Amazon Bedrock       | 使用 AWS 管理的密钥进行 AES-256 加密。可通过 AWS KMS 提供客户管理的密钥。                                                                       |
| Google Cloud Vertex AI | Google 管理的加密密钥。支持 CMEK。                                                                                                          |
| Microsoft Foundry    | 请求路由到采用 AES-256 磁盘加密的 Anthropic 基础设施。                                                                                        |

Claude Code 基于 Anthropic 的 API 构建。有关 API 安全控制的详情，包括 API 日志记录程序，请参阅 [Anthropic 信任中心](https://trust.anthropic.com)中的合规文档。

### 云执行：数据流和依赖

当使用[网络版 Claude Code](/zh/claude-code-on-the-web) 时，会话运行在 Anthropic 管理的虚拟机中，而非本地。在云环境中：

* **代码和数据存储：** 您的仓库被克隆到一个隔离的虚拟机中。代码和会话数据受您账户类型的保留和使用政策约束（见上方数据保留部分）
* **凭证：** GitHub 身份验证通过安全代理处理；您的 GitHub 凭证永远不会进入沙箱
* **网络流量：** 所有出站流量都通过安全代理，用于审计日志和防止滥用
* **会话数据：** 提示、代码更改和输出遵循与本地 Claude Code 使用相同的数据政策

有关云执行的安全详情，请参阅[安全性](/zh/security#cloud-execution-security)。

## 遥测服务

Claude Code 从用户机器连接到 Anthropic 以记录操作指标，如延迟、可靠性和使用模式。此日志记录不包含任何代码或文件路径。数据在传输和静态存储时均加密。要退出遥测，请设置 `DISABLE_TELEMETRY` 环境变量。

Claude Code 从用户机器连接到 Sentry 以记录操作错误。数据在传输时使用 TLS 加密，静态存储时使用 256 位 AES 加密。了解更多关于 [Sentry 安全文档](https://sentry.io/security/) 的信息。要退出错误日志记录，请设置 `DISABLE_ERROR_REPORTING` 环境变量。

当您运行 `/feedback` 命令时，您的对话历史记录（包括代码）的副本会发送给 Anthropic。在提交前，您可以选择包含多少历史记录：仅当前会话（默认），或者也包含过去 24 小时或 7 天内同一项目的其他会话。数据通过 TLS 加密传输。可选地，会在公共仓库中创建一个 GitHub issue。要退出，请将 `DISABLE_FEEDBACK_COMMAND` 环境变量设置为 `1`。

当您使用 Bedrock 或 Vertex 等第三方提供商，或未配置 Anthropic 凭证时，`/feedback` 会将报告写入本地 `~/.claude/feedback-bundles/` 下的存档文件中，而不是发送给 Anthropic。在写入存档前会隐去已知的 API 密钥和 token 模式。除非您将该文件发送给您的 Anthropic 客户代表或附加到支持请求中，否则任何信息都不会离开您的机器。

## 按 API 提供商划分的默认行为

默认情况下，当使用 Bedrock、Vertex、Foundry 或 AWS 上的 Claude Platform 时，错误报告、遥测和错误报告是禁用的。会话质量调查和 WebFetch 域名安全检查是例外，无论使用哪个提供商都会运行。您可以通过设置 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 一次性退出所有非必要流量，包括调查。此变量不影响 WebFetch 检查，该检查有自己的退出选项。以下是完整的默认行为：

| 服务                                   | Claude API                                                                                     | Vertex API                                                                                   | Bedrock API                                                                                  | Foundry API                                                                                  | AWS 上的 Claude Platform                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Anthropic（指标）**                  | 默认开启。<br />`DISABLE_TELEMETRY=1` 可禁用。                                                  | 默认关闭。<br />`CLAUDE_CODE_USE_VERTEX` 必须为 1。                                           | 默认关闭。<br />`CLAUDE_CODE_USE_BEDROCK` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_FOUNDRY` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_ANTHROPIC_AWS` 必须为 1。                                     |
| **Sentry（错误）**                     | 默认开启。<br />`DISABLE_ERROR_REPORTING=1` 可禁用。                                           | 默认关闭。<br />`CLAUDE_CODE_USE_VERTEX` 必须为 1。                                           | 默认关闭。<br />`CLAUDE_CODE_USE_BEDROCK` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_FOUNDRY` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_ANTHROPIC_AWS` 必须为 1。                                     |
| **Claude API（`/feedback` 报告）**     | 默认开启。<br />`DISABLE_FEEDBACK_COMMAND=1` 可禁用。                                           | 默认关闭。<br />`CLAUDE_CODE_USE_VERTEX` 必须为 1。                                           | 默认关闭。<br />`CLAUDE_CODE_USE_BEDROCK` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_FOUNDRY` 必须为 1。                                          | 默认关闭。<br />`CLAUDE_CODE_USE_ANTHROPIC_AWS` 必须为 1。                                     |
| **会话质量调查**                       | 默认开启。<br />`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` 可禁用。                               | 默认开启。<br />`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` 可禁用。                              | 默认开启。<br />`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` 可禁用。                              | 默认开启。<br />`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` 可禁用。                              | 默认开启。<br />`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` 可禁用。                               |
| **WebFetch 域名安全检查**              | 默认开启。<br />在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true` 可禁用。             | 默认开启。<br />在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true` 可禁用。           | 默认开启。<br />在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true` 可禁用。           | 默认开启。<br />在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true` 可禁用。           | 默认开启。<br />在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true` 可禁用。             |

所有环境变量均可检入 `settings.json`（参见[设置参考](/zh/settings)）。

从 v2.1.126 开始，当宿主平台设置了 `CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST` 时，Vertex、Bedrock 和 Foundry 的指标默认为开启，并遵循标准的 `DISABLE_TELEMETRY` 退出选项。这些提供商上的 Sentry 错误报告和 `/feedback` 报告仍然默认关闭。

### WebFetch 域名安全检查

在获取 URL 之前，WebFetch 工具会将请求的主机名发送到 `api.anthropic.com`，以检查其是否在 Anthropic 维护的安全阻止列表中。仅发送主机名，不发送完整的 URL、路径或页面内容。结果按主机名缓存五分钟。

无论您使用哪个模型提供商，此检查都会运行，并且不受 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 的影响。如果您的网络阻止了 `api.anthropic.com`，WebFetch 请求将会失败，直到您将该域名加入白名单或在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true`。禁用此检查意味着 WebFetch 将尝试检索任何 URL 而不咨询阻止列表，因此如果您需要限制 Claude 可以访问的域名，请将其与 [`WebFetch` 权限规则](/zh/permissions#webfetch)结合使用。