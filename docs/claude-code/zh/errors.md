> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进一步探索。

# 错误参考

> 查阅 Claude Code 运行时错误消息，了解每条消息的含义及修复方法。

本页面列出了 Claude Code 显示的运行时错误及其恢复方法，以及当响应看似异常但无错误提示时的排查要点。关于安装过程中的错误（例如 `command not found` 或 TLS 失败），请参阅[安装与登录故障排除](/zh/troubleshoot-install)。

这些错误及恢复命令适用于 CLI、[桌面应用](/zh/desktop)和[网页版 Claude Code](/zh/claude-code-on-the-web)，因为三者均封装了相同的 Claude Code CLI。特定平台的问题，请参考对应页面的故障排除部分。

  Claude Code 调用 Claude API 获取模型响应，因此大多数运行时错误都映射为底层 API 错误代码。本页介绍每种错误在 Claude Code 内部的含义以及恢复方法。有关原始 HTTP 状态代码定义，请参阅 [Claude 平台错误参考](https://platform.claude.com/docs/en/api/errors)。

## 找出错误原因

请将终端中看到的消息与下方各部分进行匹配。

| 消息                                                                                         | 章节                                                                                                                               |
| :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `API Error: 500 Internal server error`                                                       | [服务器错误](#api-error-500-internal-server-error)                                                                                 |
| `API Error: Repeated 529 Overloaded errors`                                                  | [服务器错误](#api-error-500-internal-server-error)                                                                            |
| `Request timed out`                                                                          | [服务器错误](#请求超时)，若消息提及网络连接问题则见[网络](#api-error-500-internal-server-error)                                    |
| `<model> is temporarily unavailable, so auto mode cannot determine the safety of...`         | [服务器错误](#自动模式无法判定操作安全性)                                                                 |
| `Auto mode could not evaluate this action and is blocking it for safety`                     | [服务器错误](#自动模式无法判定操作安全性)                                                                 |
| `Auto mode classifier transcript exceeded context window`                                    | [服务器错误](#自动模式无法判定操作安全性)                                                                 |
| `You've hit your session limit` / `You've hit your weekly limit`                             | [使用限制](#您已达到会话限制)                                                                                         |
| `Server is temporarily limiting requests`                                                    | [使用限制](#api-error-500-internal-server-error)                                                                               |
| `Request rejected (429)`                                                                     | [使用限制](#请求被拒绝-429)                                                                                                 |
| `Credit balance is too low`                                                                  | [使用限制](#信用额度过低)                                                                                             |
| `Not logged in · Please run /login`                                                          | [身份验证](#未登录)                                                                                                         |
| `Invalid API key`                                                                            | [身份验证](#api-error-500-internal-server-error)                                                                                                       |
| `This organization has been disabled`                                                        | [身份验证](#此组织已被禁用)                                                                                   |
| `Your organization has disabled Claude subscription access`                                  | [身份验证](#您的组织已禁用-claude-订阅访问权限)                                                             |
| `Routines are disabled by your organization's policy`                                        | [身份验证](#您的组织策略已禁用常规任务)                                                                    |
| `OAuth token revoked` / `OAuth token has expired`                                            | [身份验证](#oauth-令牌已撤销或过期)                                                                                        |
| `does not meet scope requirement user:profile`                                               | [身份验证](#oauth-令牌已撤销或过期)                                                                                               |
| `Unable to connect to API`                                                                   | [网络](#api-error-500-internal-server-error)                                                                                                  |
| `SSL certificate verification failed`                                                        | [网络](#ssl-证书错误)                                                                                                    |
| `403` with `x-deny-reason: host_not_allowed` in a cloud or routine session                   | [网络](#云会话中主机未获允许)                                                                                       |
| `Prompt is too long`                                                                         | [请求错误](#提示词过长)                                                                                                    |
| `Error during compaction: Conversation too long`                                             | [请求错误](#api-error-500-internal-server-error)                                                                         |
| `Request too large`                                                                          | [请求错误](#请求过大)                                                                                                     |
| `Image was too large`                                                                        | [请求错误](#图片过大)                                                                                                   |
| `Unable to resize image`                                                                     | [请求错误](#无法调整图片大小)                                                                                                |
| `PDF too large` / `PDF is password protected`                                                | [请求错误](#pdf-错误)                                                                                                            |
| `Extra inputs are not permitted`                                                             | [请求错误](#额外输入不被允许)                                                                                        |
| `There's an issue with the selected model`                                                   | [请求错误](#所选模型出现问题)                                                                               |
| `Claude Opus is not available with the Claude Pro plan`                                      | [请求错误](#claude-pro-计划不可使用-claude-opus)                                                                 |
| `thinking.type.enabled is not supported for this model`                                      | [请求错误]                                                                 |
| `max_tokens must be greater than thinking.budget_tokens`                                     | [请求错误](#思考预算超出输出限制)                                                                                  |
| `API Error: 400 due to tool use concurrency issues`                                          | [请求错误](#工具使用或思考块不匹配)                                                                                   |
| `Claude Code is unable to respond to this request, which appears to violate our Usage Policy` | [请求错误](#使用政策拒绝)                                                                                                  |
| 响应质量似乎低于平时                                                                         | [响应质量](#响应质量似乎低于平常)                                                                               |

## 自动重试

Claude Code 在显示错误之前会对瞬时故障进行自动重试。服务器错误、过载响应、请求超时、临时 429 限流以及连接中断都会被重试，最多重试 10 次，并采用指数退避策略。重试期间，旋转指示器会显示 `Retrying in Ns · attempt x/y` 的倒计时。

当你在本页看到错误时，这些重试机会已经用尽。你可以通过两个环境变量调整此行为：

| 变量                                      | 默认值  | 效果                                                                                                                               |
| :---------------------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| [`CLAUDE_CODE_MAX_RETRIES`](/zh/env-vars) | 10      | 重试尝试次数。降低此值可在脚本中更快暴露故障；升高此值可在较长时间的服务中断期间持续等待。                                         |
| [`API_TIMEOUT_MS`](/zh/env-vars)          | 600000  | 每个请求的超时时间（毫秒）。对于网络缓慢或使用代理的情况，可提高此值。                                                             |

## 服务器错误

这些错误来自推理提供商，而非你的账户或请求。在 Anthropic API 上，这指的是 Anthropic 基础设施。在 Bedrock、Vertex AI、Foundry 或自定义网关上，这指的是相应提供商的基础设施。

### API Error: 500 Internal server error

对于任何 5xx 响应，Claude Code 会显示状态码和 API 的错误消息。以下示例展示了 Anthropic API 上的 500 响应：
```text
API Error: 500 Internal server error. This is a server-side issue, usually temporary — try again in a moment. If it persists, check https://status.claude.com.
```
末尾的句子指明了检查服务状态的位置，并因提供商而异。Bedrock、Vertex AI 和 Foundry 配置会指明对应提供商的服务状态。自定义 `ANTHROPIC_BASE_URL` 则指明网关主机。

这表明 API 内部发生了意外故障。它并非由您的提示词、设置或账户引起。

**处理步骤：**

* 检查 [status.claude.com](https://status.claude.com)，或消息中提及的提供商状态页面，以查看是否有活跃事件
* 等待一分钟，然后重新发送您的消息。您的原始消息仍在对话中，因此对于较长的提示词，您可以输入 `try again` 而无需粘贴全部内容。
* 如果错误持续出现且没有发布相关事件，请运行 `/feedback`，以便 Anthropic 使用您的请求详情进行调查。如果您的环境中不可用 `/feedback`，请参阅 [报告错误](#api-error-500-internal-server-error)。

### API 错误：重复的 529 过载错误

API 目前对所有用户临时处于满负荷状态。Claude Code 在显示此消息之前已重试了数次：
```text
API Error: Repeated 529 Overloaded errors. The API is at capacity — this is usually temporary. Try again in a moment. If it persists, check https://status.claude.com.
```
尾部提示语因提供商而异，与上述 500 错误情况相同。529 错误并非您的使用限制，也不计入配额。

**应对措施：**

* 查看 [status.claude.com](https://status.claude.com) 或消息中指定的提供商状态页面，了解容量通知
* 几分钟后重试
* 运行 `/model` 并切换到其他模型以继续工作，因为容量按模型跟踪。当某个模型负载特别高时，Claude Code 会提示您执行此操作，例如 `Opus 正处于高负载状态，请使用 /model 切换至 Sonnet`。

### 请求超时

API 未在连接截止期限前响应。
```text
Request timed out
```
这种情况可能发生在负载较高时，或生成的响应过大时。默认请求超时时间为 10 分钟。

**应对方法：**

*   重试该请求
*   对于耗时较长的任务，将工作拆分为更小的提示词
*   若因网络缓慢或代理导致，可按[自动重试](#自动重试)所述提高 `API_TIMEOUT_MS` 值
*   若超时频繁且网络状况良好，请参阅下方的[网络与连接错误](#网络和连接错误)

### 自动模式无法判定操作安全性

用于动作分类的[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)模型无法做出决策，因此自动模式未自动批准该操作。您看到的消息取决于分类器失败的原因。

在工作目录内进行的读取、搜索和编辑操作会跳过分类器，因此在所有上述情况下仍能继续运行。

当分类器模型过载时：
```text
<model> is temporarily unavailable, so auto mode cannot determine the safety of <tool> right now. Wait briefly and then try this action again.
```
**操作建议：**

*   等待几秒后重试；Claude 会看到相同的消息，并通常会自动重试。
*   如果重试持续失败，请继续执行只读任务，稍后再回到被阻止的操作。
*   这种情况是暂时的，与[自动模式资格](/zh/permission-modes#eliminate-prompts-with-auto-mode)无关；您无需更改设置。

当分类器返回了一个无法解析的响应时：
```text
Auto mode could not evaluate this action and is blocking it for safety — run with --debug for details
```
**操作建议：**

* 重试该操作；通常在下一次尝试时会成功
* 运行 `claude --debug` 并重复操作，以在调试日志中查看底层分类器的响应

当对话内容超出分类器的上下文窗口时：
```text
Auto mode classifier transcript exceeded context window — falling back to manual approval (try /compact to reduce conversation size)
```
在交互式会话中，自动模式会为该操作回退到普通的权限提示，以便您手动批准或拒绝。在[非交互式模式](/zh/headless)下，运行将中止，因为记录只会持续增长，重试也无法成功。

**处理方式：**

* 在出现的提示中批准或拒绝该操作
* 运行 `/compact` 以减小对话大小，使后续操作重新适合分类器窗口

## 使用限制

这些错误意味着您的账户或计划相关的配额已耗尽。它们与影响所有人的[服务器错误](#api-error-500-internal-server-error)不同。

### 您已达到会话限制

订阅计划包含滚动使用额度。当额度用完时，您会看到以下其中一条消息：
```text
You've hit your session limit · resets 3:45pm
You've hit your weekly limit · resets Mon 12:00am
You've hit your Opus limit · resets 3:45pm
```
Claude Code 会阻止进一步请求，直到消息中显示的重置时间。

**处理建议：**

* 等待错误信息中显示的重置时间
* 运行 `/usage` 查看您的计划配额及其重置时间
* 在 Pro 和 Max 计划上运行 `/usage-credits` 购买额外使用额度，或在 Team 和 Enterprise 计划上向管理员申请。了解[付费计划的使用信用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)以获取计费详情。
* 若需升级计划以获得更高基础配额，请访问[claude.com/pricing](https://claude.com/pricing)

要在达到限制前监控剩余配额，可将 `rate_limits` 字段添加到[自定义状态行](/zh/statusline#rate-limit-usage)，或在桌面应用中点击模型选择器旁的[使用环](/zh/desktop#check-usage)。

### 服务器临时限制请求

API 应用了与您的计划配额无关的短期限流措施。
```text
API Error: Server is temporarily limiting requests (not your usage limit)
```
此错误[会自动重试](#自动重试)后才会显示。

**建议操作：**

* 请稍候后重试
* 若问题持续，请检查 [status.claude.com](https://status.claude.com)

### 请求被拒绝 (429)

您已触发 API 密钥、Amazon Bedrock 项目或 Google Vertex AI 项目配置的速率限制。
```text
API Error: Request rejected (429) · this may be a temporary capacity issue. If it persists, check https://status.claude.com.
```
尾部句子根据提供商不同而指定检查服务健康状态的位置。对于 Bedrock、Vertex AI 和 Foundry，配置中会列出该提供商的服务状态页面，而非 Anthropic 状态页面。自定义的 `ANTHROPIC_BASE_URL` 会指向网关主机。

**处理方法：**

* 运行 `/status` 并确认当前激活的凭据是您所期望的。环境中若有残留的 `ANTHROPIC_API_KEY`，可能会将请求路由至低层级密钥，而非您的订阅。
* 检查您的提供商控制台，查看当前激活的限额，如有需要可申请提升层级
* 对于 Anthropic API 密钥，请参阅 [速率限制参考](https://platform.claude.com/docs/en/api/rate-limits)，了解层级机制以及如何设置工作区级限额
* 降低并发度：减小 [`CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY`](/zh/env-vars) 的值，避免运行多个并行子代理，或在高吞吐量的脚本化运行中通过 `/model` 切换至较小的模型

### 信用额度过低

您的控制台组织预付信用额度已用尽。
```text
Credit balance is too low
```
**需执行的操作：**

* 在 [platform.claude.com/settings/billing](https://platform.claude.com/settings/billing) 添加额度，并建议在此处启用自动充值功能，以便在余额耗尽前自动续费
* 如果您拥有 Pro、Max、Team 或 Enterprise 计划，请通过 `/login` 切换至订阅认证方式
* 在控制台中为各工作区设置消费上限，以防止单一项目耗尽组织额度。详见[有效管理成本](/zh/costs)。

## 认证错误

这些错误表明 Claude Code 无法向 API 证明您的身份。您可随时运行 `/status` 查看当前活跃的凭证信息。

### 未登录

当前会话没有可用的有效凭证。
```text
Not logged in · Please run /login
```
**要做什么：**

*   运行 `/login` 以使用您的 Claude 订阅或 Console 账户进行身份验证
*   如果您期望通过环境变量进行身份验证，请确认 `ANTHROPIC_API_KEY` 已在您启动 `claude` 的 shell 中设置并导出
*   对于无法进行交互式登录的 CI 或自动化场景，可配置一个 [`apiKeyHelper`](/zh/settings#available-settings) 脚本，使其在启动时获取密钥
*   参见[认证优先级](/zh/authentication#authentication-precedence)以了解当存在多个凭据时哪一个会被采用

如果您被反复提示登录，请参阅[未登录或 token 已过期](/zh/troubleshoot-install#not-logged-in-or-token-expired)了解系统时钟和 macOS 钥匙串的修复方法。

### 无效的 API 密钥

`ANTHROPIC_API_KEY` 环境变量或 `apiKeyHelper` 脚本返回了一个被 API 拒绝的密钥。
```text
Invalid API key · Fix external API key
```
**排查步骤：**

* 检查是否有拼写错误，并在[控制台](https://platform.claude.com/settings/keys)确认密钥未被撤销
* 在同一终端运行 `env | grep ANTHROPIC`。类似 direnv、dotenv shell 插件和 IDE 终端的工具可能从项目中的 `.env` 文件加载了过期的密钥，而您并未显式设置它
* 取消设置 `ANTHROPIC_API_KEY` 并运行 `/login` 以使用订阅认证代替
* 若密钥来自 [`apiKeyHelper`](/zh/settings#available-settings) 脚本，请直接运行该脚本以确认其在标准输出打印出有效的密钥
* 运行 `/status` 以确认 Claude Code 实际使用的凭据来源

### 此组织已被禁用

一个来自被禁用控制台组织的过期 `ANTHROPIC_API_KEY` 正在覆盖您的订阅登录。
```text
Your ANTHROPIC_API_KEY belongs to a disabled organization · Unset the environment variable to use your other credentials
API Error: 400 ... This organization has been disabled.
```
环境变量的优先级高于 `/login`，因此即使您拥有有效的 Pro 或 Max 订阅，shell 配置文件或 `.env` 文件中导出的密钥仍会被使用。在非交互模式（`-p`）下，若存在密钥则始终使用。

**建议操作：**

* 在当前 shell 中取消设置 `ANTHROPIC_API_KEY` 并从 shell 配置文件中移除该变量，然后重新启动 `claude`
* 随后运行 `/status` 以确认当前激活的凭据是您的订阅
* 若未设置环境变量但错误仍然存在，说明被禁用的组织是您的 `/login` 所关联的账户。请联系支持团队或使用其他账户登录。

### 您的组织已禁用 Claude 订阅访问权限

您的 Claude 组织不允许使用订阅登录方式访问 Claude Code。使用同一账户再次运行 `/login` 将返回相同错误。
```text
Your organization has disabled Claude subscription access for Claude Code · Use an Anthropic API key instead, or ask your admin to enable access
```
这是一个服务端组织设置，因此无法通过本地设置、环境变量或 CLI 标志覆盖。Agent SDK 和 `-p` 非交互模式会将其显示为 `oauth_org_not_allowed` 错误代码。

**处理方法：**

* 请管理员为您的组织启用 Claude Code 访问权限
* 使用控制台 API 密钥（而非您的订阅）进行身份验证。设置详情请参阅 [Claude Console 身份验证](/zh/authentication#claude-console-authentication)。
* 如果您是管理员且未看到启用选项，请联系 [Anthropic 支持](https://support.claude.com)。

### 您的组织策略已禁用常规任务

您的团队或企业管理员已在组织层面关闭常规任务功能。当您尝试创建或运行常规任务（包括通过 `/schedule` 命令和 claude.ai/code 上的[常规任务](/zh/routines)界面）时，将出现此错误。
```text
Routines are disabled by your organization's policy.
```
这是服务器端设置，因此无法通过本地设置、环境变量或命令行标志覆盖。

**操作建议：**

* 请管理员在 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 启用 **Routines** 开关
* 对于不需要组织级例程的一次性计划任务，请参阅[计划任务](/zh/scheduled-tasks)

### OAuth 令牌已撤销或过期

您保存的登录信息已失效。令牌被撤销意味着您已在所有设备注销，或管理员已移除访问权限；令牌过期则表明会话期间自动刷新失败。
```text
OAuth token revoked · Please run /login
OAuth token has expired · Please run /login
API Error: 401 ... authentication_error
```
**操作步骤：**

* 运行 `/login` 重新登录
* 如果重新认证后错误在同一会话中再次出现，请先运行 `/logout` 完全清除已存储的 token，然后再运行 `/login`
* 若在多次启动中反复提示登录，请查看[故障排除](/zh/troubleshoot-install#not-logged-in-or-token-expired)中的系统时钟和 macOS 钥匙串检查项
* 其他故障（包括 `403 Forbidden` 和 OAuth 浏览器问题）请参阅[登录与认证](/zh/troubleshoot-install#login-and-authentication)

### OAuth 权限范围要求

已存储的 token 早于新功能所需的某个权限范围。您最可能在 `/usage` 命令和状态行的使用指标中看到此提示：
```text
OAuth token does not meet scope requirement: user:profile
```
**要执行的操作：**

* 运行 `/login` 以使用当前作用域铸造新 token。您无需先退出登录。

## 网络和连接错误

这些错误表示 Claude Code 发出的网络请求未能到达其目标。它们通常源于您的本地网络、代理或防火墙，或云环境的网络策略。

### 无法连接到 API

与 API 的 TCP 连接失败或从未完成。
```text
Unable to connect to API. Check your internet connection
Unable to connect to API (ECONNREFUSED)
Unable to connect to API (ECONNRESET)
Unable to connect to API (ETIMEDOUT)
fetch failed
Request timed out. Check your internet connection and proxy settings
```
常见原因包括无法访问互联网、VPN 阻断了 `api.anthropic.com`，或未配置必需的企业代理。

**解决方法：**

* 在相同 shell 环境中运行 `curl -I https://api.anthropic.com`，确认能否连接 API 主机。Windows PowerShell 环境请使用 `curl.exe -I https://api.anthropic.com`，以避免触发内置的 `Invoke-WebRequest` 别名。
* 若处于企业代理环境，请在启动 Claude Code 前设置 `HTTPS_PROXY`，详见[网络配置](/zh/network-config)。
* 若通过 LLM 网关或中继进行路由，请将 [`ANTHROPIC_BASE_URL`](/zh/env-vars) 设为对应地址。配置方法请参阅 [LLM 网关配置](/zh/llm-gateway)。
* 确保防火墙允许[网络访问要求](/zh/network-config#network-access-requirements)中列出的主机地址。
* 间歇性故障会[自动重试](#自动重试)；持续性故障则表明存在本地网络问题。

若 `curl` 可连接但 Claude Code 仍失败，问题通常不在网络本身，而在于运行时环境与网络之间的环节：

* 在 Linux 和 WSL 环境下，请检查 `/etc/resolv.conf` 中是否存在无法访问的域名服务器。WSL 特别容易从宿主机继承错误的解析配置。
* macOS 上，已断开连接或卸载的 VPN 客户端可能遗留隧道接口或路由规则。请通过 `ifconfig` 检查残留的 `utun` 接口，并在系统设置中移除 VPN 的网络扩展。
* Docker Desktop 等容器运行时可能拦截出站流量。尝试退出相关程序后重试以排除此因素。

### SSL 证书错误

您网络中的代理或安全设备正在使用自有证书拦截 TLS 流量，而 Claude Code 不信任该证书。
```text
Unable to connect to API: SSL certificate verification failed. Check your proxy or corporate SSL certificates
Unable to connect to API: Self-signed certificate detected
```
**要执行的操作：**

* 导出组织的 CA 证书包，并通过 `NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.pem` 令 Claude Code 指向它
* 详细设置说明请参见[网络配置](/zh/network-config#custom-ca-certificates)
* 请勿设置 `NODE_TLS_REJECT_UNAUTHORIZED=0`，该操作会完全禁用证书验证

### 云会话中主机未获允许

来自云会话或例程的出站 HTTP 请求被环境的网络策略阻止。
```text
HTTP 403
x-deny-reason: host_not_allowed
```
您还可能看到与目标服务器实际证书不匹配的 TLS 证书。云环境通过代理路由出站流量并执行网络策略，因此证书不匹配意味着代理终止了连接，而非目标服务器问题。

这并非客户端网络问题。云会话与[例程](/zh/routines)运行在沙箱环境中，其出站流量经过环境允许列表的过滤。**Default** 环境使用**Trusted**访问模式，该模式允许[默认允许列表](/zh/claude-code-on-the-web#default-allowed-domains)中的包注册表、云服务提供商 API、容器注册表及常见开发域名，同时阻止其他所有访问。

**处理方式：**

* 打开例程进行编辑，或启动云会话。点击显示环境名称的云图标（例如 **Default**）打开选择器。将鼠标悬停于环境上方并点击设置图标。
* 在**更新云环境**对话框中，将**网络访问**从 **Trusted** 改为 **Custom**，然后将被阻止的域名添加至**允许的域名**。每行输入一个域名。勾选**同时包含常用包管理器的默认列表**可在自定义域名基础上保留[默认允许列表](/zh/claude-code-on-the-web#default-allowed-domains)。若需完全不受限制的访问，请改为选择 **Full**。
* 点击**保存更改**。下次运行将使用更新后的允许列表。

详见[网络访问](/zh/claude-code-on-the-web#network-access)了解访问级别及默认允许列表。本地 CLI 会话不受此策略影响。

## 请求错误

此类错误表明 API 已接收您的请求但拒绝了其内容。

### 提示词过长

对话内容与附加文件总长度超过模型的上下文窗口。
```text
Prompt is too long
```
**操作指南：**

* 运行 `/compact` 以总结先前的对话轮次并释放空间，或运行 `/clear` 全新开始
* 运行 `/context` 查看消耗窗口空间的详情：系统提示词、工具、记忆文件和消息
* 使用 `/mcp disable <name>` 禁用未使用的 MCP 服务器，以移除其工具定义
* 精简过大的 `CLAUDE.md` 记忆文件，或将指令移入[路径限定规则](/zh/memory#path-specific-rules)，仅在相关时加载
* 子代理会从父会话继承所有 MCP 工具定义，这可能在第一轮对话前就填满其上下文窗口。生成子代理前，请禁用未使用的 MCP 服务器
* 自动压缩默认开启，通常可避免此错误。若设置了 [`DISABLE_AUTO_COMPACT`](/zh/env-vars)，请重新启用它，或在窗口填满前手动运行 `/compact`

参见[探索上下文窗口](/zh/context-window)获取上下文如何填满的交互式视图。

### 压缩时出错：对话过长

`/compact` 本身执行失败，因为没有足够的可用上下文来容纳其生成的摘要。
```text
Error during compaction: Conversation too long. Press esc twice to go up a few messages and try again.
```
当自动压缩触发时窗口已满，或看到 `Prompt is too long` 后运行 `/compact` 时，可能发生此情况。

**处理方法：**

* 按两次 Esc 打开消息列表并回退几步。这会从上下文中丢弃最近的消息。然后再次运行 `/compact`。
* 如果回退后仍没有足够空间，请运行 `/clear` 开始一个新会话。之前的对话会被保留，可通过 `/resume` 重新打开。

### 请求过大

在分词前，原始请求体已超过 API 的字节限制，通常是因为粘贴了大文件或附件。
```text
Request too large (max 30 MB). Double press esc to go back and remove or shrink the attached content.
```
这是对HTTP请求的大小限制，与[上下文窗口限制](#提示词过长)是分开的。

**处理方法：**

* 按两次Esc键，并回退到添加了过大内容的对话轮次
* 通过路径引用大文件，而不是粘贴其内容，这样Claude可以分块读取它们
* 对于图片，请参阅下方的[图片过大](#图片过大)

### 图片过大

粘贴或附加的图片超出了API的尺寸或维度限制。
```text
Image was too large. Double press esc to go back and try again with a smaller image.
API Error: 400 ... image dimensions exceed max allowed size
```
图片在出错后仍会保留在对话历史中，因此后续每条消息都会因相同错误而失败，直到您移除该图片。

**解决方法：**

* 按两次 Esc 键，回退到添加图片之前的对话轮次
* 粘贴前调整图片大小。API 单次接受单张图片最长边不超过 8000 像素，或上下文包含多张图片时不超过 2000 像素
* 截取相关区域的局部截图而非全屏截图

### 无法调整图片大小

Claude Code 无法在将附件图片发送至 API 前对其进行缩小处理。
```text
Unable to resize image — image processing is unavailable and dimensions could not be read from the file header. Please convert the image to PNG, JPEG, GIF, or WebP.
Unable to resize image — dimensions exceed the 2000x2000px limit and image processing failed. Please resize the image to reduce its pixel dimensions.
Unable to resize image (… raw, … base64). The image exceeds the … API limit and compression failed. Please resize the image manually or use a smaller image.
Unable to resize image — could not verify image dimensions are within the 2000x2000px API limit.
```
Claude Code 通常会自动调整过大的图像尺寸。这些错误意味着原生图像处理器加载失败或返回错误，导致图像无法被调整至API限制范围内。

**处理方法：**

* 如果提示要求转换图像格式，请将其转换为 PNG、JPEG、GIF 或 WebP 格式后重新附加。Claude Code 无需图像处理器即可验证这些格式的尺寸。
* 如果提示显示尺寸或大小限制，请在附加前将图像尺寸或压缩质量调整至该限制值以下。

### PDF 错误

您附加的 PDF 文件无法处理。
```text
PDF too large (max 100 pages, 32 MB). Try splitting it or extracting text first.
PDF is password protected. Try removing protection or extracting text first.
The PDF file was not valid. Try converting to a different format first.
```
**应采取的措施：**

* 对于超大尺寸的 PDF 文件，请让 Claude 使用 Read 工具读取指定页码范围，而不是附加整个文件，或者使用 `pdftotext` 之类的工具提取文本，然后通过路径引用输出文件。
* 对于受保护或无效的 PDF 文件，请移除密码或从其源应用程序重新导出文件，然后重试。

### 额外输入不被允许

Claude Code 与 API 之间的代理或 LLM 网关剥离了 `anthropic-beta` 请求头，因此 API 拒绝了依赖于该头的字段。
```text
API Error: 400 ... Extra inputs are not permitted ... context_management
API Error: 400 ... Extra inputs are not permitted ... tools.0.custom.input_examples
API Error: 400 ... Unexpected value(s) for the `anthropic-beta` header
```
Claude Code 发送 `context_management`、`effort` 等 beta 测试专属字段，以及工具中的 `input_examples`，同时附带一个 `anthropic-beta` 头来启用这些功能。如果网关转发了请求体但丢弃了该头，API 将会看到无法识别的字段。

**解决方法：**

* 配置你的网关以转发 `anthropic-beta` 头。请参阅 [LLM 网关配置](/zh/llm-gateway)。
* 作为备选方案，在启动前设置 [`CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`](/zh/env-vars)。这将禁用需要 beta 测试头的功能，从而确保请求能通过无法转发该头的网关成功发出。

### 所选模型出现问题

配置的模型名称未被识别，或者你的账户无权访问该模型。
```text
There's an issue with the selected model (claude-...). It may not exist or you may not have access to it. Run /model to select a different one.
```
**如何处理：**

*   运行 `/model` 命令，从您的账户可用模型中选择
*   使用 `sonnet` 或 `opus` 等别名，而非完整的版本 ID。别名会跟踪最新发布版本，因此不会过时。参见[模型配置](/zh/model-config)。
*   如果错误的模型持续出现，说明某个地方设置了过时的 ID。请按[优先级顺序](/zh/model-config#setting-your-model)检查：`--model` 标志、`ANTHROPIC_MODEL` 环境变量，然后依次检查 `.claude/settings.local.json`、您项目的 `.claude/settings.json` 以及 `~/.claude/settings.json` 中的 `model` 字段。移除过时的值，Claude Code 将回退到您的账户默认设置。
*   对于 Vertex AI 部署，请参阅 [Vertex AI 故障排除](/zh/google-vertex-ai#troubleshooting)。

### Claude Pro 计划不可使用 Claude Opus

您当前的有效订阅计划不包含您选择的模型。
```text
Claude Opus is not available with the Claude Pro plan · Select a different model in /model
```
**操作步骤：**

* 运行 `/model` 命令，并选择您计划包含的模型
* 如果您最近升级了计划但仍看到此提示，请先运行 `/logout` 再运行 `/login`。已存储的 token 反映的是您登录时对应的计划等级，因此在网页上升级计划不会影响现有会话，您需要重新认证才能生效。
* 各个计划包含哪些模型，请参见 [claude.com/pricing](https://claude.com/pricing)

### thinking.type.enabled 在此模型上不受支持

您的 Claude Code 版本低于 Opus 4.7 或 Opus 4.8 的最低要求。CLI 发送的模型已不再接受该思考配置。
```text
API Error: 400 ... "thinking.type.enabled" is not supported for this model. Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
```
**操作步骤：**

* 运行 `claude update` 并重启 Claude Code。Opus 4.7 需要 v2.1.111 或更高版本。Opus 4.8 需要 v2.1.154 或更高版本
* 如果无法升级，请运行 `/model` 并选择 Opus 4.6 或 Sonnet
* 如果在 Agent SDK 中遇到此问题，请参阅 [SDK 故障排除](/zh/agent-sdk/quickstart#troubleshooting)

### 思考预算超出输出限制

配置的扩展思考预算超出了最大响应长度，因此没有空间留给实际答案。
```text
API Error: 400 ... max_tokens must be greater than thinking.budget_tokens
```
Claude Code 会在 Anthropic API 上自动调整这些值。通常，当 [`MAX_THINKING_TOKENS`](/zh/env-vars) 设置得高于提供商的输出限制，或当规划模式提高了思考预算时，您会在 Amazon Bedrock 或 Google Vertex AI 上看到此错误。

**如何处理：**

*   降低 `MAX_THINKING_TOKENS`，或者将 [`CLAUDE_CODE_MAX_OUTPUT_TOKENS`](/zh/env-vars) 提高至思考预算以上
*   参阅[扩展思考](/zh/model-config#extended-thinking)以了解预算如何与输出长度相互作用

### 工具使用或思考块不匹配

会话历史记录到达 API 时处于不一致状态，通常发生在工具调用中断或轮次被中途编辑之后。
```text
API Error: 400 due to tool use concurrency issues. Run /rewind to recover the conversation.
API Error: 400 ... unexpected `tool_use_id` found in `tool_result` blocks
API Error: 400 ... thinking blocks ... cannot be modified
```
所有三种变体的含义相同：历史记录中的 `tool_use`、`tool_result` 和 `thinking` 块序列不再符合 API 预期。

**解决方案：**

*  如果您使用的是 Opus 4.7 或 Opus 4.8，请先运行 `claude update`。v2.1.156 之前的版本可能在正常使用工具期间触发此错误，且 `/rewind` 无法清除该错误。
* 运行 `/rewind`，或按两次 Esc 键，退回到损坏轮次之前的检查点并从该点继续。关于检查点的创建和恢复方式，请参阅[检查点](/zh/checkpointing)。

### 使用政策拒绝

API 拒绝响应，因为对话内容触发了[使用政策](https://www.anthropic.com/legal/aup)检查。消息中包含一个请求 ID，如果您认为拒绝有误，可引用该 ID 联系支持团队。
```text
API Error: Claude Code is unable to respond to this request, which appears to violate our Usage Policy (https://www.anthropic.com/legal/aup). Please double press esc to edit your last message or start a new session for Claude Code to assist with a different task.
```
该检查会评估整个对话历史，而不仅仅是你最新的提示词，因此在同一会话中发送新消息通常会触发相同的拒绝。退出并使用 `--continue` 或 `--resume` 重新打开会话后也是如此，因为磁盘上的记录仍包含触发内容。

**解决方法：**

*   按两次 Esc 或运行 `/rewind`，退回到触发拒绝之前的检查点，然后重新表述或采取不同的方法。参见 [检查点](/zh/checkpointing)。
*   如果无法确定是哪个环节导致的，请运行 `/clear`，在同一项目中开始一个全新的对话。你之前的对话已保存在磁盘上，仍可通过 `/resume` 访问。
*   在 [非交互模式](/zh/headless) (`-p`) 下，由于无法使用 rewind，请用重新表述的提示词重试，或不使用 `--continue` 开始新会话。

## 响应质量似乎低于平常

如果 Claude 的回答看起来比你预期的弱，但未显示错误，原因通常是对话状态而非模型本身。Claude Code 不会静默更改模型版本。但在特定情况下，如达到 Opus 配额上限或 Bedrock、Vertex AI 区域缺少你的模型时，它可以切换到备用模型；下面的“模型选择”检查可以识别这两种情况，且 [模型配置](/zh/model-config) 解释了何时适用备用模型。

首先检查以下几点：

*   **模型选择**：运行 `/model` 以确认你使用的是预期的模型。之前的 `/model` 选择或 `ANTHROPIC_MODEL` 环境变量可能让你使用了比预期更小的模型。
*   **努力级别**：运行 `/effort` 检查当前的推理级别，并在调试困难问题或设计工作时提高它。默认值因模型而异，因此在假设未达到最高级别前请先检查。参见 [调整努力级别](/zh/model-config#adjust-effort-level) 了解各模型的默认值及 `ultrathink` 快捷方式。
*   **上下文压力**：运行 `/context` 查看上下文窗口的使用情况。如果接近上限，请在自然断点处运行 `/compact` 或运行 `/clear` 重新开始。参见 [探索上下文窗口](/zh/context-window) 了解自动压缩如何影响之前的对话环节。
*   **过时的指令**：大型或过时的 `CLAUDE.md` 文件和 MCP 工具定义会消耗上下文并可能误导响应。`/doctor` 会标记过大的记忆文件和子代理定义；`/context` 会显示 MCP 工具的 token 使用情况。

当响应出错时，通常使用 rewind 比直接回复纠正更有效。按两次 Esc 或运行 `/rewind` 退到出错环节之前，然后用更具体的信息重新表述提示词。在会话线程中纠正会使错误尝试留在上下文中，这可能会让后续回答锚定在该错误上。参见 [检查点](/zh/checkpointing)。

如果检查以上几点后质量仍感觉不正常，请运行 `/feedback` 并描述你期望的结果与实际得到的结果。以这种方式提交的反馈会包含对话记录，这是 Anthropic 诊断真实回归的最快方法。如果你的环境中 `/feedback` 不可用，请参见 [报告错误](#api-error-500-internal-server-error)。

## 报告错误

本页涵盖来自 Claude API 的错误。有关其他 Claude Code 组件的错误，请参阅相关指南：

*   MCP 服务器连接或认证失败：[MCP](/zh/mcp)
*   钩子脚本失败或阻止了工具：[调试钩子](/zh/hooks#debug-hooks)
*   安装期间权限被拒绝或出现文件系统错误：[安装和登录故障排除](/zh/troubleshoot-install)

如果此处未列出某个错误，或建议的修复方法无效：

*   在 Claude Code 中运行 `/feedback`，将记录和描述发送给 Anthropic。该命令还会提供选项，打开预填写的 GitHub issue。在 Bedrock、Vertex AI、Foundry 和其他第三方提供商上，`/feedback` 会保存一个本地存档，你可以将其发送给你的 Anthropic 客户代表。
*   运行 `/doctor` 检查本地配置问题
*   检查 [status.claude.com](https://status.claude.com) 是否有活跃事件
*   在 GitHub 上搜索 [现有 issues](https://github.com/anthropics/claude-code/issues)