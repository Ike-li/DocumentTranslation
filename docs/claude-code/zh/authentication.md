> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件可发现所有可用页面，再进行深入探索。

# 认证

> 登录 Claude Code 并为个人、团队和组织配置认证。

Claude Code 支持多种认证方法，具体取决于您的设置。个人用户可以使用 Claude.ai 帐户登录，而团队则可以使用 Claude for Teams 或 Enterprise、Claude Console，或 Amazon Bedrock、Google Vertex AI、Microsoft Foundry 等云提供商。

## 登录 Claude Code

[安装 Claude Code](/zh/setup#install-claude-code) 后，在终端中运行 `claude`。首次启动时，Claude Code 会打开一个浏览器窗口供您登录。

如果浏览器未自动打开，请按 `c` 将登录 URL 复制到剪贴板，然后将其粘贴到浏览器中。

如果浏览器在您登录后显示登录代码而不是自动跳转回，请在终端的 `Paste code here if prompted` 提示处粘贴该代码。这种情况发生在浏览器无法访问 Claude Code 本地回调服务器时，常见于 WSL2、SSH 会话和容器中。

您可以使用以下任何一种帐户类型进行认证：

* **Claude Pro 或 Max 订阅**：使用您的 Claude.ai 帐户登录。在 [claude.com/pricing](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_pro_max) 订阅。
* **Claude for Teams 或 Enterprise**：使用您的团队管理员邀请您的 Claude.ai 帐户登录。
* **Claude Console**：使用您的 Console 凭据登录。您的管理员必须已[邀请您](#登录-claude-code)。
* **云提供商**：如果您的组织使用 [Amazon Bedrock](/zh/amazon-bedrock)、[Google Vertex AI](/zh/google-vertex-ai) 或 [Microsoft Foundry](/zh/microsoft-foundry)，请在运行 `claude` 前设置所需的环境变量。无需通过浏览器登录。

要注销并重新认证，请在 Claude Code 提示符处输入 `/logout`。

如果登录遇到问题，请参阅[认证故障排除](/zh/troubleshoot-install#login-and-authentication)。

## 设置团队认证

对于团队和组织，您可以通过以下方式之一配置 Claude Code 访问：

* [Claude for Teams 或 Enterprise](#claude-for-teams-或-enterprise)，适用于大多数团队
* [Claude Console](#登录-claude-code)
* [Amazon Bedrock](/zh/amazon-bedrock)
* [Google Vertex AI](/zh/google-vertex-ai)
* [Microsoft Foundry](/zh/microsoft-foundry)

### Claude for Teams 或 Enterprise

[Claude for Teams](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_teams#team-&-enterprise) 和 [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_enterprise) 为使用 Claude Code 的组织提供最佳体验。团队成员可以访问 Claude Code 和网页版 Claude，并享有集中计费和团队管理功能。

* **Claude for Teams**：自助式计划，包含协作功能、管理工具和计费管理。最适合小型团队。
* **Claude for Enterprise**：增加了 SSO、域名捕获、基于角色的权限、合规 API 和托管策略设置，用于组织范围的 Claude Code 配置。最适合有安全和合规要求的大型组织。


    订阅 [Claude 团队版](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_teams_step#team-&-enterprise) 或联系销售部门获取 [Claude 企业版](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=authentication_enterprise_step)。



    从管理控制板邀请团队成员。



    团队成员安装 Claude Code 并使用其 Claude.ai 账户登录。


### Claude 控制台认证

对于偏好基于 API 计费方式的组织，您可以通过 Claude 控制台设置访问权限。


    使用您现有的 Claude Console 账户或创建一个新账户。



    您可以通过以下任一方式添加用户：

    * 从控制台内批量邀请用户：设置 -> 成员 -> 邀请
    * [设置单点登录 (SSO)](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso)



    邀请用户时，请为他们分配以下角色之一：

    * **Claude Code** 角色：用户只能创建 Claude Code API 密钥
    * **Developer** 角色：用户可以创建任何类型的 API 密钥



    每位受邀用户需要：

    * 接受控制台邀请
    * [检查系统要求](/zh/setup#system-requirements)
    * [安装 Claude Code](/zh/setup#install-claude-code)
    * 使用控制台账户凭据登录


### 云服务提供商认证

对于使用 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 的团队：


    请参阅 [Bedrock 文档](/zh/amazon-bedrock)、[Vertex 文档](/zh/google-vertex-ai) 或 [Microsoft Foundry 文档](/zh/microsoft-foundry)。



    将环境变量和云凭证生成说明分发给您的用户。了解更多关于如何[管理配置](/zh/settings)的信息。



    用户可以[安装 Claude Code](/zh/setup#install-claude-code)。


## 凭据管理

Claude Code 安全地管理您的认证凭据：

* **存储位置**：
  * 在 macOS 上，凭据存储在加密的 macOS 钥匙串中。
  * 在 Linux 上，凭据存储在 `~/.claude/.credentials.json` 中，文件权限为 `0600`。
  * 在 Windows 上，凭据存储在 `%USERPROFILE%\.claude\.credentials.json` 中，并继承您的用户配置文件目录的访问控制权限，该权限默认将文件限制为仅您的用户账户可访问。
  * 如果您在 Linux 或 Windows 上设置了 `CLAUDE_CONFIG_DIR` 环境变量，则 `.credentials.json` 文件会位于该目录下。
  * Claude Code 通过 `/login` 和 `/logout` 管理 `.credentials.json`。要通过自定义 API 端点路由请求，请设置 [`ANTHROPIC_BASE_URL`](/zh/env-vars) 环境变量。
* **支持的认证类型**：Claude.ai 凭据、Claude API 凭据、Azure 认证、Bedrock 认证和 Vertex 认证。
* **自定义凭据脚本**：[`apiKeyHelper`](/zh/settings#available-settings) 设置可以配置为运行一个返回 API 密钥的 shell 脚本。
* **刷新间隔**：默认情况下，`apiKeyHelper` 在 5 分钟后或收到 HTTP 401 响应时被调用。设置 `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 环境变量可自定义刷新间隔。
* **助手响应缓慢提示**：如果 `apiKeyHelper` 返回密钥耗时超过 10 秒，Claude Code 会在提示栏中显示一条警告提示，展示已用时间。如果您经常看到此提示，请检查您的凭据脚本是否可以优化。

`apiKeyHelper`、`ANTHROPIC_API_KEY` 和 `ANTHROPIC_AUTH_TOKEN` 仅适用于终端 CLI 会话。Claude Desktop 和远程会话仅使用 OAuth，不调用 `apiKeyHelper` 或读取 API 密钥环境变量。

### 认证优先级

当存在多个凭据时，Claude Code 按以下顺序选择：

1.  云提供商凭据，当设置了 `CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_USE_VERTEX` 或 `CLAUDE_CODE_USE_FOUNDRY` 时。设置方法请参见[第三方集成](/zh/third-party-integrations)。
2.  `ANTHROPIC_AUTH_TOKEN` 环境变量。作为 `Authorization: Bearer` 标头发送。当通过[LLM 网关或代理](/zh/llm-gateway)路由且该网关/代理使用不记名令牌而非 Anthropic API 密钥进行认证时使用此变量。
3.  `ANTHROPIC_API_KEY` 环境变量。作为 `X-Api-Key` 标头发送。当使用来自 [Claude 控制台](https://platform.claude.com)的密钥直接访问 Anthropic API 时使用此变量。在交互模式下，系统会提示您一次以批准或拒绝该密钥，您的选择会被记住。要稍后更改，请在 `/config` 中使用“使用自定义 API 密钥”开关。在非交互模式 (`-p`) 下，如果密钥存在则始终使用。
4.  [`apiKeyHelper`](/zh/settings#available-settings) 脚本输出。用于动态或轮换凭据，例如从保险库获取的短期令牌。
5.  `CLAUDE_CODE_OAUTH_TOKEN` 环境变量。由 [`claude setup-token`](#生成长期令牌) 生成的长期 OAuth 令牌。用于无法进行浏览器登录的 CI 流水线和脚本。
6.  来自 `/login` 的订阅 OAuth 凭据。这是 Claude Pro、Max、Team 和 Enterprise 用户的默认选项。

如果您拥有有效的 Claude 订阅，但环境中同时设置了 `ANTHROPIC_API_KEY`，则在获得批准后 API 密钥将优先使用。如果该密钥属于已禁用或过期的组织，则可能导致认证失败。运行 `unset ANTHROPIC_API_KEY` 可回退到您的订阅，并使用 `/status` 确认当前生效的认证方法。

[网页版 Claude Code](/zh/claude-code-on-the-web) 始终使用您的订阅凭据。沙箱环境中的 `ANTHROPIC_API_KEY` 和 `ANTHROPIC_AUTH_TOKEN` 不会覆盖它们。

### 生成长期令牌

  自2026年6月15日起，订阅方案中使用Agent SDK和`claude -p`将从新的每月Agent SDK额度中扣除，该额度独立于您的交互使用限额。详见[将Claude Agent SDK与您的Claude计划配合使用](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)。

对于CI流水线、脚本或其他无法进行交互式浏览器登录的环境，请使用`claude setup-token`生成一个一年期的OAuth令牌：
```bash
claude setup-token
```
该命令会引导您完成 OAuth 授权流程，并在终端输出一个 token。它不会在任何地方保存该 token；请将其复制下来，并在您需要进行身份验证的任何地方将其设置为 `CLAUDE_CODE_OAUTH_TOKEN` 环境变量：
```bash
export CLAUDE_CODE_OAUTH_TOKEN=your-token
```
此令牌用于验证您的 Claude 订阅，需要 Pro、Max、Team 或 Enterprise 计划。它仅用于推理，无法建立 [Remote Control](/zh/remote-control) 会话。

[Bare 模式](/zh/headless#start-faster-with-bare-mode) 不会读取 `CLAUDE_CODE_OAUTH_TOKEN`。如果您的脚本传入 `--bare`，请改用 `ANTHROPIC_API_KEY` 或 `apiKeyHelper` 进行身份验证。