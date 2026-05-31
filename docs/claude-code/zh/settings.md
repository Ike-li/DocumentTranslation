# Claude Code 设置

> 使用全局设置、项目级设置和环境变量配置 Claude Code。

Claude Code 提供了多种设置选项，以满足你的配置需求。你可以在交互式 REPL 中运行 `/config` 命令来配置 Claude Code，该命令会打开一个带标签页的设置界面，你可以查看状态信息并修改配置选项。

## 配置作用域

Claude Code 使用**作用域系统**来决定配置的适用范围和共享对象。了解作用域有助于你决定如何为个人使用、团队协作或企业部署配置 Claude Code。

### 可用作用域

| 作用域 | 位置 | 影响对象 | 是否与团队共享 |
| :--- | :--- | :--- | :--- |
| **托管** | 服务器管理的设置、plist / 注册表，或系统级 `managed-settings.json` | 机器上的所有用户 | 是（由 IT 部署） |
| **用户** | `~/.claude/` 目录 | 你在所有项目中的设置 | 否 |
| **项目** | 仓库中的 `.claude/` | 该仓库的所有协作者 | 是（提交到 git） |
| **本地** | `.claude/settings.local.json` | 仅你在当前仓库中的设置 | 否（已 gitignore） |

### 何时使用每个作用域

**托管作用域**适用于：

* 必须在全组织范围内强制执行的安全策略
* 不可覆盖的合规要求
* 由 IT/DevOps 部署的标准化配置

**用户作用域**最适合：

* 你希望在所有项目中使用的个人偏好（主题、编辑器设置）
* 你在所有项目中使用的工具和插件
* API 密钥和身份验证（安全存储）

**项目作用域**最适合：

* 团队共享的设置（权限、钩子、MCP 服务器）
* 整个团队应使用的插件
* 在协作者之间标准化工具配置

**本地作用域**最适合：

* 针对特定项目的个人覆盖
* 在与团队共享之前测试配置
* 仅适用于本机的设置，其他人无法使用

### 作用域如何交互

当同一设置出现在多个作用域中时，Claude Code 按优先级顺序应用：

1. **托管**（最高）— 不可被任何其他设置覆盖
2. **命令行参数** — 临时会话覆盖
3. **本地** — 覆盖项目和用户设置
4. **项目** — 覆盖用户设置
5. **用户**（最低） — 当没有其他设置指定时应用

例如，如果你的用户设置将 `spinnerTipsEnabled` 设为 `true`，而项目设置将其设为 `false`，则项目值生效。权限规则的行为有所不同，因为它们在作用域之间是合并而非覆盖。参见[设置优先级](#设置优先级)。

### 哪些功能使用作用域

作用域适用于许多 Claude Code 功能：

| 功能 | 用户位置 | 项目位置 | 本地位置 |
| :--- | :--- | :--- | :--- |
| **设置** | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| **子代理** | `~/.claude/agents/` | `.claude/agents/` | 无 |
| **MCP 服务器** | `~/.claude.json` | `.mcp.json` | `~/.claude.json`（按项目） |
| **插件** | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| **CLAUDE.md** | `~/.claude/CLAUDE.md` | `CLAUDE.md` 或 `.claude/CLAUDE.md` | `CLAUDE.local.md` |

在 Windows 上，显示为 `~/.claude` 的路径解析为 `%USERPROFILE%\.claude`。

---

## 设置文件

`settings.json` 文件是通过分层设置配置 Claude Code 的正式机制：

* **用户设置**定义在 `~/.claude/settings.json` 中，适用于所有项目。
* **项目设置**保存在项目目录中：
  * `.claude/settings.json` 用于提交到源代码控制并与团队共享的设置
  * `.claude/settings.local.json` 用于不提交的设置，适合个人偏好和实验。Claude Code 会在创建时配置 git 忽略 `.claude/settings.local.json`
* **托管设置**：对于需要集中控制的组织，Claude Code 支持多种托管设置的交付方式。所有方式使用相同的 JSON 格式，且不能被用户或项目设置覆盖：

  * **服务器托管设置**：通过 Claude.ai 管理控制台从 Anthropic 服务器交付。参见[服务器托管设置](/zh/server-managed-settings)。
  * **MDM/操作系统级策略**：通过 macOS 和 Windows 的原生设备管理交付：
    * macOS：`com.anthropic.claudecode` 托管偏好域。plist 的顶级键镜像 `managed-settings.json`，嵌套设置为字典，数组为 plist 数组。通过 Jamf、Iru (Kandji) 或类似 MDM 工具的配置文件部署。
    * Windows：`HKLM\SOFTWARE\Policies\ClaudeCode` 注册表项，包含一个 `Settings` 值（REG\_SZ 或 REG\_EXPAND\_SZ），其中包含 JSON（通过组策略或 Intune 部署）
    * Windows（用户级）：`HKCU\SOFTWARE\Policies\ClaudeCode`（最低策略优先级，仅在没有管理员级源时使用）
  * **基于文件**：`managed-settings.json` 和 `managed-mcp.json` 部署到系统目录：

    * macOS：`/Library/Application Support/ClaudeCode/`
    * Linux 和 WSL：`/etc/claude-code/`
    * Windows：`C:\Program Files\ClaudeCode\`

    旧版 Windows 路径 `C:\ProgramData\ClaudeCode\managed-settings.json` 自 v2.1.75 起不再支持。已将设置部署到该位置的管理员必须将文件迁移到 `C:\Program Files\ClaudeCode\managed-settings.json`。

    基于文件的托管设置还支持在与 `managed-settings.json` 相同的系统目录中使用 `managed-settings.d/` 附加目录。这允许不同团队部署独立的策略片段，而无需协调编辑单个文件。

    遵循 systemd 约定，`managed-settings.json` 首先作为基础合并，然后附加目录中的所有 `*.json` 文件按字母顺序排序并在其上合并。后面的文件覆盖前面的标量值；数组被连接并去重；对象被深度合并。以 `.` 开头的隐藏文件被忽略。

    使用数字前缀控制合并顺序，例如 `10-telemetry.json` 和 `20-security.json`。

  参见[托管设置](/zh/permissions#managed-only-settings)和[托管 MCP 配置](/zh/managed-mcp)了解详情。

  此[仓库](https://github.com/anthropics/claude-code/tree/main/examples/mdm)包含 Jamf、Iru (Kandji)、Intune 和组策略的入门部署模板。将它们作为起点，并根据需要进行调整。

  托管部署还可以使用 `strictKnownMarketplaces` 限制**插件市场的添加**。更多信息请参见[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions)。

* **其他配置**存储在 `~/.claude.json` 中。此文件包含你的 OAuth 会话、用户和本地作用域的 [MCP 服务器](/zh/mcp)配置、按项目状态（允许的工具、信任设置）和各种缓存。项目范围的 MCP 服务器单独存储在 `.mcp.json` 中。

Claude Code 会自动创建配置文件的时间戳备份，并保留最近的五个备份以防止数据丢失。

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },
  "companyAnnouncements": [
    "Welcome to Acme Corp! Review our code guidelines at docs.acme.com",
    "Reminder: Code reviews required for all PRs",
    "New security policy in effect"
  ]
}
```

上面示例中的 `$schema` 行指向 Claude Code 设置的[官方 JSON schema](https://json.schemastore.org/claude-code-settings.json)。将其添加到你的 `settings.json` 中可以在 VS Code、Cursor 和任何其他支持 JSON schema 验证的编辑器中启用自动完成和内联验证。

发布的 schema 会定期更新，可能不包含最新 CLI 版本中添加的设置，因此对最近文档化字段的验证警告并不一定意味着你的配置无效。

### 编辑何时生效

Claude Code 会监视你的设置文件，并在更改时重新加载它们，因此对大多数键的编辑会应用到正在运行的会话，无需重启。这包括 `permissions`、`hooks` 和凭证助手如 `apiKeyHelper`。重新加载涵盖用户、项目、本地和托管设置，且 [`ConfigChange` 钩子](/zh/hooks#configchange)会在每次检测到更改时触发。

少数键在会话启动时读取一次，更改将在下次重启时生效：

* `model`：使用 [`/model`](/zh/model-config#setting-your-model) 在会话中切换
* [`outputStyle`](/zh/output-styles)：系统提示词的一部分，在 `/clear` 或重启时重建

### 可用设置

`settings.json` 支持多个选项：

| 键 | 描述 | 示例 |
| :--- | :--- | :--- |
| `agent` | 将主线程作为命名子代理运行，并设置从 `claude agents` 派发的会话的默认代理。应用该子代理的系统提示词、工具限制和模型。参见[显式调用子代理](/zh/sub-agents#invoke-subagents-explicitly) | `"code-reviewer"` |
| `allowAllClaudeAiMcps` | （仅托管设置）在部署 `managed-mcp.json` 的同时加载 claude.ai 连接器，否则 `managed-mcp.json` 会独占控制并抑制它们。参见[托管 MCP 配置](/zh/managed-mcp) | `true` |
| `allowedChannelPlugins` | （仅托管设置）允许推送消息的频道插件白名单。设置后替换默认的 Anthropic 白名单。未定义 = 回退到默认值，空数组 = 阻止所有频道插件。需要 `channelsEnabled: true`。参见[限制可运行的频道插件](/zh/channels#restrict-which-channel-plugins-can-run) | `[{ "marketplace": "claude-plugins-official", "plugin": "telegram" }]` |
| `allowedHttpHookUrls` | HTTP 钩子可访问的 URL 模式白名单。支持 `*` 作为通配符。设置后，不匹配 URL 的钩子将被阻止。未定义 = 无限制，空数组 = 阻止所有 HTTP 钩子。数组在设置源之间合并。参见[钩子配置](#钩子配置) | `["https://hooks.example.com/*"]` |
| `allowedMcpServers` | 在 managed-settings.json 中设置时，用户可配置的 MCP 服务器白名单。未定义 = 无限制，空数组 = 锁定。适用于所有作用域。拒绝列表优先。参见[托管 MCP 配置](/zh/managed-mcp) | `[{ "serverName": "github" }]` |
| `allowManagedHooksOnly` | （仅托管设置）仅加载托管钩子、SDK 钩子和在托管设置 `enabledPlugins` 中强制启用的插件钩子。用户、项目和所有其他插件钩子被阻止。参见[钩子配置](#钩子配置) | `true` |
| `allowManagedMcpServersOnly` | （仅托管设置）仅遵循托管设置中的 `allowedMcpServers`。`deniedMcpServers` 仍从所有源合并。用户仍可添加 MCP 服务器，但仅管理员定义的白名单生效。参见[托管 MCP 配置](/zh/managed-mcp) | `true` |
| `allowManagedPermissionRulesOnly` | （仅托管设置）阻止用户和项目设置定义 `allow`、`ask` 或 `deny` 权限规则。仅托管设置中的规则生效。参见[仅托管设置](/zh/permissions#managed-only-settings) | `true` |
| `alwaysThinkingEnabled` | 默认为所有会话启用[扩展思考](/zh/model-config#extended-thinking)。通常通过 `/config` 命令配置而非直接编辑。要强制关闭思考，无论此设置如何，请在 `env` 中设置 [`CLAUDE_CODE_DISABLE_THINKING`](/zh/env-vars) | `true` |
| `apiKeyHelper` | 自定义脚本，在 `/bin/sh` 中执行，生成认证值。此值将作为模型请求的 `X-Api-Key` 和 `Authorization: Bearer` 头发送。使用 [`CLAUDE_CODE_API_KEY_HELPER_TTL_MS`](/zh/env-vars) 设置刷新间隔 | `/bin/generate_temp_api_key.sh` |
| `attribution` | 自定义 git 提交和拉取请求的归属。参见[归属设置](#归属设置) | `{"commit": "🤖 Generated with Claude Code", "pr": ""}` |
| `autoMemoryDirectory` | [自动记忆](/zh/memory#storage-location)存储的自定义目录。接受绝对路径或以 `~/` 为前缀的路径。从项目或本地设置中，此选项仅在你接受工作区信任对话框后才生效，因为克隆的仓库可能提供此文件 | `"~/my-memory-dir"` |
| `autoMemoryEnabled` | 启用[自动记忆](/zh/memory#enable-or-disable-auto-memory)。设为 `false` 时，Claude 不会读取或写入自动记忆目录。默认：`true`。你也可以在会话期间使用 `/memory` 切换。要通过环境变量禁用，请在 `env` 中设置 [`CLAUDE_CODE_DISABLE_AUTO_MEMORY`](/zh/env-vars) | `false` |
| `autoMode` | 自定义[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)分类器阻止和允许的内容。包含 `environment`、`allow`、`soft_deny` 和 `hard_deny` 数组，值为散文规则。在数组中包含字面字符串 `"$defaults"` 以在该位置继承内置规则。参见[配置自动模式](/zh/auto-mode-config)。不从共享项目设置中读取 | `{"soft_deny": ["$defaults", "Never run terraform apply"]}` |
| `autoScrollEnabled` | 在[全屏渲染](/zh/fullscreen)中，跟随新输出到对话底部。默认：`true`。在 `/config` 中显示为 **Auto-scroll**。关闭时权限提示仍会滚动到视图中 | `false` |
| `autoUpdatesChannel` | 更新的发布渠道。使用 `"stable"` 获取通常延迟约一周且跳过有重大回归的版本，或使用 `"latest"`（默认）获取最新发布。要完全禁用自动更新，请在 `env` 中设置 [`DISABLE_AUTOUPDATER`](/zh/setup#disable-auto-updates) | `"stable"` |
| `availableModels` | 限制用户可通过 `/model`、`--model` 或 `ANTHROPIC_MODEL` 选择的模型。不影响默认选项。参见[限制模型选择](/zh/model-config#restrict-model-selection) | `["sonnet", "haiku"]` |
| `awaySummaryEnabled` | 当你离开终端几分钟后返回时显示一行会话摘要。设为 `false` 或在 `/config` 中关闭 Session recap 以禁用。等同于 [`CLAUDE_CODE_ENABLE_AWAY_SUMMARY`](/zh/env-vars) | `true` |
| `awsAuthRefresh` | 修改 `.aws` 目录的自定义脚本（参见[高级凭证配置](/zh/amazon-bedrock#advanced-credential-configuration)） | `aws sso login --profile myprofile` |
| `awsCredentialExport` | 输出包含 AWS 凭证的 JSON 的自定义脚本（参见[高级凭证配置](/zh/amazon-bedrock#advanced-credential-configuration)） | `/bin/generate_aws_grant.sh` |
| `blockedMarketplaces` | （仅托管设置）市场来源的阻止列表。在市场添加和插件安装、更新、刷新及自动更新时强制执行，因此在策略设置之前添加的市场无法用于获取插件。阻止的来源在下载前检查，因此永远不会接触文件系统。参见[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions) | `[{ "source": "github", "repo": "untrusted/plugins" }]` |
| `channelsEnabled` | （仅托管设置）为组织允许[频道](/zh/channels)。在 claude.ai 团队版和企业版计划中，当未设置或为 `false` 时频道被阻止。对于使用 API 密钥认证的 [Anthropic Console](/zh/authentication#claude-console-authentication) 账户，除非你的组织部署了托管设置，否则默认允许频道，此时此键必须设为 `true` | `true` |
| `claudeMd` | （仅托管设置）作为组织管理的记忆注入的 CLAUDE.md 风格指令。仅在托管或策略设置中设置时生效，在用户、项目和本地设置中被忽略。参见[组织范围的 CLAUDE.md](/zh/memory#deploy-organization-wide-claude-md) | `"Always run make lint before committing."` |
| `claudeMdExcludes` | 加载[记忆](/zh/memory)时要跳过的 `CLAUDE.md` 文件的 glob 模式或绝对路径。模式与绝对文件路径匹配。仅适用于用户、项目和本地记忆；托管策略文件不能被排除 | `["**/vendor/**/CLAUDE.md"]` |
| `cleanupPeriodDays` | 超过此期限的会话文件在启动时被删除（默认：30 天，最小值 1）。设为 `0` 会被拒绝并返回验证错误。还控制启动时自动删除[孤立子代理工作树](/zh/worktrees#clean-up-worktrees)的期限。要完全禁用对话记录写入，请设置 [`CLAUDE_CODE_SKIP_PROMPT_HISTORY`](/zh/env-vars) 环境变量，或在非交互模式（`-p`）下使用 `--no-session-persistence` 标志或 `persistSession: false` SDK 选项 | `20` |
| `companyAnnouncements` | 启动时向用户显示的公告。如果提供多个公告，将随机循环显示 | `["Welcome to Acme Corp! Review our code guidelines at docs.acme.com"]` |
| `defaultShell` | 输入框 `!` 命令的默认 shell。接受 `"bash"`（默认）或 `"powershell"`。设为 `"powershell"` 时，Windows 上的交互式 `!` 命令通过 PowerShell 路由。需要 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`。参见 [PowerShell 工具](/zh/tools-reference#powershell-tool) | `"powershell"` |
| `deniedMcpServers` | 在 managed-settings.json 中设置时，明确阻止的 MCP 服务器拒绝列表。适用于所有作用域，包括托管服务器。拒绝列表优先于允许列表。参见[托管 MCP 配置](/zh/managed-mcp) | `[{ "serverName": "filesystem" }]` |
| `disableAgentView` | 设为 `true` 以关闭[后台代理和代理视图](/zh/agent-view)：`claude agents`、`--bg`、`/background` 和按需监督器。通常在[托管设置](/zh/permissions#managed-settings)中设置。等同于将 `CLAUDE_CODE_DISABLE_AGENT_VIEW` 设为 `1` | `true` |
| `disableAllHooks` | 禁用所有[钩子](/zh/hooks)和任何自定义[状态栏](/zh/statusline) | `true` |
| `disableAutoMode` | 设为 `"disable"` 以阻止[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)被激活。从 `Shift+Tab` 循环中移除 `auto` 并在启动时拒绝 `--permission-mode auto`。在[托管设置](/zh/permissions#managed-settings)中最有用，用户无法覆盖 | `"disable"` |
| `disableDeepLinkRegistration` | 设为 `"disable"` 以阻止 Claude Code 在启动时向操作系统注册 `claude-cli://` 协议处理器。[深度链接](/zh/deep-links)让外部工具可以打开带有预填提示词的 Claude Code 会话。在协议处理器注册受限或单独管理的环境中很有用 | `"disable"` |
| `disabledMcpjsonServers` | 要拒绝的来自 `.mcp.json` 文件的特定 MCP 服务器列表 | `["filesystem"]` |
| `disableRemoteControl` | {/* min-version: 2.1.128 */}禁用[远程控制](/zh/remote-control)：阻止 `claude remote-control`、`--remote-control` 标志、自动启动和会话内切换。通常放置在[托管设置](/zh/permissions#managed-settings)中用于按设备 MDM 强制执行，但适用于任何作用域。需要 Claude Code v2.1.128 或更高版本 | `true` |
| `disableSkillShellExecution` | 禁用[技能](/zh/skills)和来自用户、项目、插件或附加目录来源的自定义命令中 `` !`...` `` 和 ` ```! ` 块的内联 shell 执行。命令被替换为 `[shell command execution disabled by policy]` 而非运行。内置和托管技能不受影响。在[托管设置](/zh/permissions#managed-settings)中最有用，用户无法覆盖 | `true` |
| `disableWorkflows` | 禁用[动态工作流](/zh/workflows#turn-workflows-off)和内置工作流命令。默认：`false`。等同于将 `CLAUDE_CODE_DISABLE_WORKFLOWS` 设为 `1` | `true` |
| `editorMode` | 输入提示词的键绑定模式：`"normal"` 或 `"vim"`。默认：`"normal"`。在 `/config` 中显示为 **Editor mode** | `"vim"` |
| `effortLevel` | 跨会话持久化[努力级别](/zh/model-config#adjust-effort-level)。接受 `"low"`、`"medium"`、`"high"` 或 `"xhigh"`。当你使用这些值之一运行 `/effort` 时自动写入。`--effort` 和 [`CLAUDE_CODE_EFFORT_LEVEL`](/zh/env-vars) 为单次会话覆盖此设置。参见[调整努力级别](/zh/model-config#adjust-effort-level)了解支持的模型 | `"xhigh"` |
| `enableAllProjectMcpServers` | 自动批准项目 `.mcp.json` 文件中定义的所有 MCP 服务器 | `true` |
| `enabledMcpjsonServers` | 要批准的来自 `.mcp.json` 文件的特定 MCP 服务器列表 | `["memory", "github"]` |
| `env` | 应用于每个会话和 Claude Code 从中派生的子进程的环境变量。{/* min-version: 2.1.143 */}自 v2.1.143 起，此处设置的 `NO_COLOR` 和 `FORCE_COLOR` 会传递给子进程，但不会改变 Claude Code 自身的界面颜色。在启动 `claude` 之前在 shell 中设置这些以更改界面颜色 | `{"FOO": "bar"}` |
| `fastModePerSessionOptIn` | 设为 `true` 时，快速模式不会跨会话持久化。每个会话以快速模式关闭开始，需要用户使用 `/fast` 启用。用户的快速模式偏好仍会被保存。参见[要求每会话选择加入](/zh/fast-mode#require-per-session-opt-in) | `true` |
| `feedbackSurveyRate` | [会话质量调查](/zh/data-usage#session-quality-surveys)在符合条件时出现的概率（0-1）。设为 `0` 以完全抑制，或在 `env` 中设置 [`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY`](/zh/env-vars)。在使用 Bedrock、Vertex 或 Foundry 时很有用，因为默认采样率不适用 | `0.05` |
| `fileSuggestion` | 为 `@` 文件自动完成配置自定义脚本。参见[文件建议设置](#文件建议设置) | `{"type": "command", "command": "~/.claude/file-suggestion.sh"}` |
| `forceLoginMethod` | 使用 `claudeai` 限制登录到 Claude.ai 账户，`console` 限制登录到 Claude Console（API 用量计费）账户。在托管设置中设置时，通过 API 密钥、`apiKeyHelper` 或第三方提供商认证的会话在启动时被阻止，因为两种值都无法在没有第一方 OAuth 的情况下满足 | `claudeai` |
| `forceLoginOrgUUID` | 要求登录属于特定组织。接受单个 UUID 字符串（登录时也会预选该组织），或 UUID 数组（其中任何列出的组织都被接受而不预选）。在托管设置中设置时，如果认证账户不属于列出的组织，登录将失败，且通过 API 密钥、`apiKeyHelper` 或第三方提供商认证的会话在启动时被阻止，因为无法为其验证组织成员身份。空数组会失败关闭并以配置错误消息阻止登录 | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` 或 `["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"]` |
| `forceRemoteSettingsRefresh` | （仅托管设置）阻止 CLI 启动，直到从服务器重新获取远程托管设置。如果获取失败，CLI 退出而非使用缓存或无设置继续。未设置时，启动继续而不等待远程设置。参见[失败关闭强制执行](/zh/server-managed-settings#enforce-fail-closed-startup) | `true` |
| `gcpAuthRefresh` | 当 GCP Application Default Credentials 过期或无法加载时刷新它们的自定义脚本。参见[高级凭证配置](/zh/google-vertex-ai#advanced-credential-configuration) | `gcloud auth application-default login` |
| `hooks` | 配置在生命周期事件时运行的自定义命令。参见[钩子文档](/zh/hooks)了解格式 | 参见[钩子](/zh/hooks) |
| `httpHookAllowedEnvVars` | HTTP 钩子可插入头值的环境变量名称白名单。设置时，每个钩子的有效 `allowedEnvVars` 是与此列表的交集。未定义 = 无限制。数组在设置源之间合并。参见[钩子配置](#钩子配置) | `["MY_TOKEN", "HOOK_SECRET"]` |
| `includeCoAuthoredBy` | **已弃用**：请改用 `attribution`。是否在 git 提交和拉取请求中包含 `co-authored-by Claude` 署名（默认：`true`） | `false` |
| `includeGitInstructions` | 在 Claude 的系统提示词中包含内置提交和 PR 工作流指令以及 git 状态快照（默认：`true`）。设为 `false` 以移除两者，例如当你使用自己的 git 工作流技能时。`CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` 环境变量设置时优先于此设置 | `false` |
| `language` | 配置 Claude 的首选响应语言（例如 `"japanese"`、`"spanish"`、`"french"`）。Claude 默认将使用此语言响应。还设置[语音听写](/zh/voice-dictation#change-the-dictation-language)语言 | `"japanese"` |
| `maxSkillDescriptionChars` | {/* min-version: 2.1.105 */}每个技能在 Claude 每轮看到的[技能列表](/zh/skills#skill-descriptions-are-cut-short)中 `description` 和 `when_to_use` 文本的字符上限（默认：`1536`）。超过此长度的文本被截断。提高此值以保持长描述完整，但每轮消耗更多上下文；降低以在 [`skillListingBudgetFraction`](#可用设置) 下容纳更多技能。需要 Claude Code v2.1.105 或更高版本 | `2048` |
| `minimumVersion` | 阻止后台自动更新和 `claude update` 安装低于此版本的下限。通过 `/config` 从 `"latest"` 渠道切换到 `"stable"` 时，会提示你保持当前版本或允许降级。选择保持会设置此值。在[托管设置](/zh/permissions#managed-settings)中也很有用，用于固定组织范围的最低版本 | `"2.1.100"` |
| `model` | 覆盖 Claude Code 使用的默认模型。`--model` 和 [`ANTHROPIC_MODEL`](/zh/model-config#environment-variables) 为单次会话覆盖此设置 | `"claude-sonnet-4-6"` |
| `modelOverrides` | 将 Anthropic 模型 ID 映射到提供商特定的模型 ID，如 Bedrock 推理配置文件 ARN。每个模型选择器条目在调用提供商 API 时使用其映射值。参见[按版本覆盖模型 ID](/zh/model-config#override-model-ids-per-version) | `{"claude-opus-4-6": "arn:aws:bedrock:..."}` |
| `otelHeadersHelper` | 生成动态 OpenTelemetry 头的脚本。在启动时和定期运行。使用 [`CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS`](/zh/env-vars) 设置刷新间隔。参见[动态头](/zh/monitoring-usage#dynamic-headers) | `/bin/generate_otel_headers.sh` |
| `outputStyle` | 配置输出样式以调整系统提示词。参见[输出样式文档](/zh/output-styles) | `"Explanatory"` |
| `parentSettingsBehavior` | {/* min-version: 2.1.133 */}（仅托管设置）控制当管理员部署的托管层也存在时，由嵌入宿主进程（如 Agent SDK 或 IDE 扩展）以编程方式提供的托管设置是否适用。`"first-wins"`：父级提供的设置被丢弃，仅管理员层生效。`"merge"`：父级提供的设置在管理员层下适用，经过过滤以收紧策略但不能放松。当没有部署管理员层时无效。默认：`"first-wins"`。需要 Claude Code v2.1.133 或更高版本 | `"merge"` |
| `permissions` | 参见下表了解权限结构 |  |
| `plansDirectory` | 自定义计划文件的存储位置。路径相对于项目根目录。默认：`~/.claude/plans` | `"./plans"` |
| `pluginSuggestionMarketplaces` | （仅托管设置）其插件可作为上下文安装建议出现的市场名称（除官方市场外）。建议来自每个插件在其市场条目中的 `relevance` 声明。名称仅在机器上注册了该市场且其注册源也在托管设置中声明时才生效，无论是作为该名称的 `extraKnownMarketplaces` 条目还是 `strictKnownMarketplaces` 的条目。从不同源以白名单名称注册的市场被忽略 | `["acme-corp-plugins"]` |
| `pluginTrustMessage` | （仅托管设置）附加到安装前显示的插件信任警告的自定义消息。用于添加组织特定上下文，例如确认来自内部市场的插件已经过审查 | `"All plugins from our marketplace are approved by IT"` |
| `policyHelper` | {/* min-version: 2.1.136 */}管理员部署的可执行文件，在启动时动态计算托管设置。仅从 MDM 或系统 `managed-settings.json` 文件中生效。参见[使用策略助手计算托管设置](#使用策略助手计算托管设置)。需要 Claude Code v2.1.136 或更高版本 | `{"path": "/usr/local/bin/claude-policy"}` |
| `preferredNotifChannel` | 任务完成和权限提示通知的方式：`"auto"`、`"terminal_bell"`、`"iterm2"`、`"iterm2_with_bell"`、`"kitty"`、`"ghostty"` 或 `"notifications_disabled"`。默认：`"auto"`，在 iTerm2、Ghostty 和 Kitty 中发送桌面通知，在其他终端中不执行任何操作。设为 `"terminal_bell"` 以在任何终端中响铃。在 `/config` 中显示为 **Notifications**。参见[获取终端铃声或通知](/zh/terminal-config#get-a-terminal-bell-or-notification) | `"terminal_bell"` |
| `prefersReducedMotion` | 减少或禁用 UI 动画（旋转器、闪光效果）以提高可访问性 | `true` |
| `prUrlTemplate` | 在页脚和工具结果摘要中显示的 PR 徽章的 URL 模板。从 `gh` 报告的 PR URL 中替换 `{host}`、`{owner}`、`{repo}`、`{number}` 和 `{url}`。用于将 PR 链接指向内部代码审查工具而非 `github.com`。不影响 Claude 文本中的 `#123` 自动链接 | `"https://reviews.example.com/{owner}/{repo}/pull/{number}"` |
| `respectGitignore` | 控制 `@` 文件选择器是否遵循 `.gitignore` 模式。设为 `true`（默认）时，匹配 `.gitignore` 模式的文件被排除在建议之外 | `false` |
| `showClearContextOnPlanAccept` | 在计划接受屏幕上显示"清除上下文"选项。默认为 `false`。设为 `true` 以恢复该选项 | `true` |
| `showThinkingSummaries` | 在交互式会话中显示[扩展思考](/zh/model-config#extended-thinking)摘要。未设置或为 `false`（交互模式默认值）时，思考块被 API 编辑并显示为折叠存根。编辑仅改变你看到的内容，而非模型生成的内容：要减少思考支出，请[降低预算或禁用思考](/zh/model-config#extended-thinking)。此设置在非交互模式（`-p`）、Agent SDK 或 IDE 扩展（如 VS Code）中无效 | `true` |
| `showTurnDuration` | 在响应后显示轮次持续时间消息，例如 "Cooked for 1m 6s"。默认：`true`。在 `/config` 中显示为 **Show turn duration** | `false` |
| `skillListingBudgetFraction` | {/* min-version: 2.1.105 */}为 Claude 每轮看到的[技能列表](/zh/skills#skill-descriptions-are-cut-short)保留的模型上下文窗口比例（默认：`0.01` = 1%）。当列表超出预算时，最少使用的技能的描述被折叠为裸名称，以便 Claude 仍可调用但不会看到原因。提高此值以保持更多描述可见，但每轮消耗更多上下文。`/doctor` 显示当前截断计数和受影响的技能。需要 Claude Code v2.1.105 或更高版本 | `0.02` |
| `skillOverrides` | {/* min-version: 2.1.129 */}按技能名称键控的每技能可见性覆盖。值为 `"on"`、`"name-only"`、`"user-invocable-only"` 或 `"off"`。让你无需编辑 SKILL.md 即可隐藏或折叠技能。不适用于通过 `/plugin` 管理的插件技能。`/skills` 菜单将这些写入 `.claude/settings.local.json`。参见[从设置覆盖技能可见性](/zh/skills#override-skill-visibility-from-settings)。需要 Claude Code v2.1.129 或更高版本 | `{"legacy-context": "name-only", "deploy": "off"}` |
| `skipWebFetchPreflight` | 跳过在获取前将每个请求的主机名发送到 `api.anthropic.com` 的 [WebFetch 域安全检查](/zh/data-usage#webfetch-domain-safety-check)。在阻止到 Anthropic 流量的环境中设为 `true`，如 Bedrock、Vertex AI 或具有限制性出口的 Foundry 部署。跳过时，WebFetch 尝试任何 URL 而不咨询阻止列表 | `true` |
| `spinnerTipsEnabled` | 在 Claude 工作时在旋转器中显示提示。设为 `false` 以禁用提示（默认：`true`） | `false` |
| `spinnerTipsOverride` | 用自定义字符串覆盖旋转器提示。`tips`：提示字符串数组。`excludeDefault`：如果为 `true`，仅显示自定义提示；如果为 `false` 或不存在，自定义提示与内置提示合并 | `{ "excludeDefault": true, "tips": ["Use our internal tool X"] }` |
| `spinnerVerbs` | 自定义轮次进行时显示的动作动词。将 `mode` 设为 `"replace"` 以仅使用你的动词，或 `"append"` 以添加到默认动词 | `{"mode": "append", "verbs": ["Pondering", "Crafting"]}` |
| `sshConfigs` | 在[桌面版](/zh/desktop#pre-configure-ssh-connections-for-your-team)环境中显示的 SSH 连接。每个条目需要 `id`、`name` 和 `sshHost`；`sshPort`、`sshIdentityFile` 和 `startDirectory` 可选。在托管设置中设置时，连接对用户为只读。仅从托管和用户设置中读取 | `[{"id": "dev-vm", "name": "Dev VM", "sshHost": "user@dev.example.com"}]` |
| `statusLine` | 配置自定义状态栏以显示上下文。参见 [`statusLine` 文档](/zh/statusline) | `{"type": "command", "command": "~/.claude/statusline.sh"}` |
| `strictKnownMarketplaces` | （仅托管设置）插件市场来源的白名单。未定义 = 无限制，空数组 = 锁定。在市场添加和插件安装、更新、刷新及自动更新时强制执行，因此在策略设置之前添加的市场无法用于获取插件。参见[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions) | `[{ "source": "github", "repo": "acme-corp/plugins" }]` |
| `strictPluginOnlyCustomization` | （仅托管设置）阻止来自用户和项目来源的技能、代理、钩子和 MCP 服务器，因此它们只能来自插件或托管设置。`true` 锁定所有四个表面；数组仅锁定指定的表面。参见 [`strictPluginOnlyCustomization`](#strictpluginonlycustomization) | `["skills", "hooks"]` |
| `syntaxHighlightingDisabled` | 禁用差异、代码块和文件预览中的语法高亮 | `true` |
| `teammateMode` | [代理团队](/zh/agent-teams)队友的显示方式：`auto`（在 tmux 或 iTerm2 中选择分屏，否则在进程内）、`in-process` 或 `tmux`。`--teammate-mode` 为单次会话覆盖此设置。参见[选择显示模式](/zh/agent-teams#choose-a-display-mode) | `"in-process"` |
| `terminalProgressBarEnabled` | 在支持的终端中显示终端进度条：ConEmu、Ghostty 1.2.0+ 和 iTerm2 3.6.6+。默认：`true`。在 `/config` 中显示为 **Terminal progress bar** | `false` |
| `tui` | 终端 UI 渲染器。使用 `"fullscreen"` 获取无闪烁的[备用屏幕渲染器](/zh/fullscreen)，带虚拟化回滚。使用 `"default"` 获取经典主屏幕渲染器。通过 `/tui` 设置。你也可以设置 [`CLAUDE_CODE_NO_FLICKER`](/zh/env-vars) 环境变量 | `"fullscreen"` |
| `ultracode` | 为会话开启 [ultracode](/zh/workflows#let-claude-decide-with-ultracode)。仅会话有效，不从 `settings.json` 读取。通过 `/effort ultracode`、`--settings` 或 Agent SDK 控制请求设置 | `true` |
| `useAutoModeDuringPlan` | 计划模式在自动模式可用时是否使用自动模式语义。默认：`true`。不从共享项目设置中读取。在 `/config` 中显示为 "Use auto mode during plan" | `false` |
| `viewMode` | 启动时的默认对话记录视图模式：`"default"`、`"verbose"` 或 `"focus"`。设置时覆盖固定的 `/focus` 选择。`--verbose` 标志为单次会话覆盖此设置 | `"verbose"` |
| `voice` | [语音听写](/zh/voice-dictation)设置：`enabled` 开启听写，`mode` 选择 `"hold"` 或 `"tap"`，`autoSubmit` 在按住模式下释放按键时发送提示词。运行 `/voice` 时自动写入。需要 Claude.ai 账户 | `{ "enabled": true, "mode": "tap" }` |
| `voiceEnabled` | `voice.enabled` 的旧版别名。推荐使用 `voice` 对象 | `true` |
| `workflowKeywordTriggerEnabled` | {/* min-version: 2.1.157 */}提示词中的 `workflow` 一词是否触发[动态工作流](/zh/workflows#ask-for-a-workflow-in-your-prompt)。设为 `false` 以输入该词而不触发。Ultracode、`/workflows` 和保存的工作流命令不受影响。默认：`true`。在 `/config` 中显示为 **Workflow keyword trigger** | `false` |
| `wslInheritsWindowsSettings` | （仅 Windows 托管设置）设为 `true` 时，WSL 上的 Claude Code 除了 `/etc/claude-code` 外还从 Windows 策略链读取托管设置，Windows 源优先。仅在 HKLM 注册表项或 `C:\Program Files\ClaudeCode\managed-settings.json` 中设置时生效，两者都需要 Windows 管理员写入。要使 HKCU 策略也在 WSL 上适用，该标志还必须在 HKCU 本身中设置。对原生 Windows 无效 | `true` |

### 全局配置设置

这些设置存储在 `~/.claude.json` 而非 `settings.json` 中。将它们添加到 `settings.json` 会触发 schema 验证错误。

v2.1.119 之前的版本还将 `autoScrollEnabled`、`editorMode`、`showTurnDuration`、`teammateMode` 和 `terminalProgressBarEnabled` 存储在此处而非 `settings.json` 中。

| 键 | 描述 | 示例 |
| :--- | :--- | :--- |
| `autoConnectIde` | 当 Claude Code 从外部终端启动时自动连接到正在运行的 IDE。默认：`false`。在 VS Code 或 JetBrains 终端外部运行时在 `/config` 中显示为 **Auto-connect to IDE (external terminal)**。设置 [`CLAUDE_CODE_AUTO_CONNECT_IDE`](/zh/env-vars) 环境变量时覆盖此设置 | `true` |
| `autoInstallIdeExtension` | 从 VS Code 终端运行时自动安装 Claude Code IDE 扩展。默认：`true`。在 VS Code 或 JetBrains 终端内运行时在 `/config` 中显示为 **Auto-install IDE extension**。你也可以设置 [`CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL`](/zh/env-vars) 环境变量 | `false` |
| `externalEditorContext` | 当你使用 `Ctrl+G` 打开外部编辑器时，将 Claude 的上一个响应作为 `#` 注释的上下文前置。默认：`false`。在 `/config` 中显示为 **Show last response in external editor** | `true` |
| `teammateDefaultModel` | 当派发提示词未指定时，[代理团队](/zh/agent-teams)队友的默认模型。设为模型别名如 `"sonnet"`，或 `null` 以继承主代理当前的 `/model` 选择。在 `/config` 中显示为 **Default teammate model** | `"sonnet"` |

### 工作树设置

配置 `--worktree` 如何创建和管理工作树。

| 键 | 描述 | 示例 |
| :--- | :--- | :--- |
| `worktree.baseRef` | 新工作树从哪个引用分支。`"fresh"`（默认）从 `origin/<default-branch>` 分支以获得匹配远程的干净树。`"head"` 从你当前的本地 `HEAD` 分支，因此未推送的提交和功能分支状态存在于工作树中。适用于 `--worktree`、`EnterWorktree` 工具和子代理隔离 | `"head"` |
| `worktree.symlinkDirectories` | 从主仓库符号链接到每个工作树的目录，以避免在磁盘上重复大目录。默认不符号链接任何目录 | `["node_modules", ".cache"]` |
| `worktree.sparsePaths` | 通过 git sparse-checkout 在每个工作树中检出的目录。仅列出的目录和根级文件被写入磁盘，在大型 monorepo 中更快 | `["packages/my-app", "shared/utils"]` |
| `worktree.bgIsolation` | {/* min-version: 2.1.143 */}[后台会话](/zh/agent-view#how-file-edits-are-isolated)的隔离模式。`"worktree"`（默认）在调用 `EnterWorktree` 之前阻止在主检出中进行 `Edit`/`Write`。`"none"` 让后台作业直接编辑工作副本。需要 Claude Code v2.1.143 或更高版本 | `"none"` |

要将 `.env` 等 gitignore 的文件复制到新工作树中，请在项目根目录使用 [`.worktreeinclude` 文件](/zh/worktrees#copy-gitignored-files-into-worktrees)而非设置。

### 权限设置

| 键 | 描述 | 示例 |
| :--- | :--- | :--- |
| `allow` | 允许工具使用的权限规则数组。参见下面的[权限规则语法](#权限规则语法)了解模式匹配详情 | `[ "Bash(git diff *)" ]` |
| `ask` | 要求确认工具使用的权限规则数组。参见下面的[权限规则语法](#权限规则语法) | `[ "Bash(git push *)" ]` |
| `deny` | 拒绝工具使用的权限规则数组。用于排除 Claude Code 访问的敏感文件。参见[权限规则语法](#权限规则语法)和 [Bash 权限限制](/zh/permissions#tool-specific-permission-rules) | `[ "WebFetch", "Bash(curl *)", "Read(./.env)", "Read(./secrets/**)" ]` |
| `additionalDirectories` | 文件访问的附加[工作目录](/zh/permissions#working-directories)。大多数 `.claude/` 配置[不会从这些目录中发现](/zh/permissions#additional-directories-grant-file-access-not-configuration) | `[ "../docs/" ]` |
| `defaultMode` | 打开 Claude Code 时的默认[权限模式](/zh/permission-modes)。有效值：`default`、`acceptEdits`、`plan`、`auto`、`dontAsk`、`bypassPermissions`。{/* min-version: 2.1.142 */}自 Claude Code v2.1.142 起，当在项目或本地设置（`.claude/settings.json`、`.claude/settings.local.json`）中设置时 `auto` 被忽略，因此仓库不能为自己授予自动模式。请在 `~/.claude/settings.json` 中设置。`--permission-mode` CLI 标志为单次会话覆盖此设置 | `"acceptEdits"` |
| `disableBypassPermissionsMode` | 设为 `"disable"` 以阻止 `bypassPermissions` 模式被激活。这会禁用 `--dangerously-skip-permissions` 命令行标志。通常放置在[托管设置](/zh/permissions#managed-settings)中以强制执行组织策略，但适用于任何作用域 | `"disable"` |
| `skipDangerousModePermissionPrompt` | 跳过通过 `--dangerously-skip-permissions` 或 `defaultMode: "bypassPermissions"` 进入绕过权限模式前显示的确认提示。在项目设置（`.claude/settings.json`）中设置时被忽略，以防止不受信任的仓库自动绕过提示 | `true` |

### 权限规则语法

权限规则遵循 `Tool` 或 `Tool(specifier)` 格式。规则按顺序评估：首先是拒绝规则，然后是询问，最后是允许。第一个匹配的规则生效。

快速示例：

| 规则 | 效果 |
| :--- | :--- |
| `Bash` | 匹配所有 Bash 命令 |
| `Bash(npm run *)` | 匹配以 `npm run` 开头的命令 |
| `Read(./.env)` | 匹配读取 `.env` 文件 |
| `WebFetch(domain:example.com)` | 匹配到 example.com 的获取请求 |

有关完整的规则语法参考，包括通配符行为、Read、Edit、WebFetch、MCP 和 Agent 规则的特定工具模式，以及 Bash 模式的安全限制，请参见[权限规则语法](/zh/permissions#permission-rule-syntax)。

### 沙箱设置

配置高级沙箱行为。沙箱将 bash 命令与你的文件系统和网络隔离。参见[沙箱](/zh/sandboxing)了解详情。

| 键 | 描述 | 示例 |
| :--- | :--- | :--- |
| `enabled` | 启用 bash 沙箱（macOS、Linux 和 WSL2）。默认：false | `true` |
| `failIfUnavailable` | 如果 `sandbox.enabled` 为 true 但沙箱无法启动（缺少依赖或不支持的平台），则在启动时退出并报错。当为 false（默认）时，显示警告且命令在非沙箱环境下运行。适用于需要沙箱作为硬性门槛的托管设置部署 | `true` |
| `autoAllowBashIfSandboxed` | 沙箱化时自动批准 bash 命令。默认：true | `true` |
| `excludedCommands` | 应在沙箱外运行的命令 | `["docker *"]` |
| `allowUnsandboxedCommands` | 允许通过 `dangerouslyDisableSandbox` 参数在沙箱外运行命令。设为 `false` 时，`dangerouslyDisableSandbox` 逃生口被完全禁用，所有命令必须在沙箱中运行（或在 `excludedCommands` 中）。适用于要求严格沙箱的企业策略。默认：true | `false` |
| `filesystem.allowWrite` | 沙箱化命令可写入的附加路径。数组在所有设置作用域中合并：用户、项目和托管路径被组合而非替换。还与 `Edit(...)` 允许权限规则中的路径合并。参见下面的[路径前缀](#沙箱路径前缀) | `["/tmp/build", "~/.kube"]` |
| `filesystem.denyWrite` | 沙箱化命令不可写入的路径。数组在所有设置作用域中合并。还与 `Edit(...)` 拒绝权限规则中的路径合并 | `["/etc", "/usr/local/bin"]` |
| `filesystem.denyRead` | 沙箱化命令不可读取的路径。数组在所有设置作用域中合并。还与 `Read(...)` 拒绝权限规则中的路径合并 | `["~/.aws/credentials"]` |
| `filesystem.allowRead` | 在 `denyRead` 区域内重新允许读取的路径。优先于 `denyRead`。数组在所有设置作用域中合并。用于创建仅工作区的读取访问模式 | `["."]` |
| `filesystem.allowManagedReadPathsOnly` | （仅托管设置）仅遵循托管设置中的 `filesystem.allowRead` 路径。`denyRead` 仍从所有源合并。默认：false | `true` |
| `network.allowUnixSockets` | （仅 macOS）沙箱中可访问的 Unix 套接字路径。在 Linux 和 WSL2 上被忽略，因为 seccomp 过滤器无法检查套接字路径；请改用 `allowAllUnixSockets` | `["~/.ssh/agent-socket"]` |
| `network.allowAllUnixSockets` | 允许沙箱中的所有 Unix 套接字连接。在 Linux 和 WSL2 上，这是允许 Unix 套接字的唯一方式，因为它跳过了阻止 `socket(AF_UNIX, ...)` 调用的 seccomp 过滤器。默认：false | `true` |
| `network.allowLocalBinding` | 允许绑定到 localhost 端口（仅 macOS）。默认：false | `true` |
| `network.allowMachLookup` | 沙箱可查找的附加 XPC/Mach 服务名称（仅 macOS）。支持单个尾随 `*` 进行前缀匹配。通过 XPC 通信的工具（如 iOS 模拟器或 Playwright）需要此设置 | `["com.apple.coresimulator.*"]` |
| `network.allowedDomains` | 允许出站网络流量的域名数组。支持通配符（例如 `*.example.com`） | `["github.com", "*.npmjs.org"]` |
| `network.deniedDomains` | 阻止出站网络流量的域名数组。支持与 `allowedDomains` 相同的通配符语法。当两者都匹配时优先于 `allowedDomains`。无论 `allowManagedDomainsOnly` 如何，从所有设置源合并 | `["sensitive.cloud.example.com"]` |
| `network.allowManagedDomainsOnly` | （仅托管设置）仅遵循托管设置中的 `allowedDomains` 和 `WebFetch(domain:...)` 允许规则。用户、项目和本地设置中的域名被忽略。不允许的域名自动阻止而不提示用户。拒绝的域名仍从所有源遵循。默认：false | `true` |
| `network.httpProxyPort` | 如果你想使用自己的代理，使用的 HTTP 代理端口。如果未指定，Claude 将运行自己的代理 | `8080` |
| `network.socksProxyPort` | 如果你想使用自己的代理，使用的 SOCKS5 代理端口。如果未指定，Claude 将运行自己的代理 | `8081` |
| `enableWeakerNestedSandbox` | 为非特权 Docker 环境启用较弱的沙箱（仅 Linux 和 WSL2）。**降低安全性。** 默认：false | `true` |
| `enableWeakerNetworkIsolation` | （仅 macOS）允许访问沙箱中的系统 TLS 信任服务（`com.apple.trustd.agent`）。使用 `httpProxyPort` 配合 MITM 代理和自定义 CA 时，基于 Go 的工具（如 `gh`、`gcloud` 和 `terraform`）验证 TLS 证书需要此设置。通过打开潜在的数据泄露路径**降低安全性**。默认：false | `true` |
| `bwrapPath` | （仅托管设置，Linux/WSL2）bubblewrap（`bwrap`）二进制文件的绝对路径。覆盖通过 `PATH` 的自动检测。仅从[托管设置](/zh/settings#settings-precedence)中生效，不从用户或项目设置中生效。适用于在托管环境中 `bwrap` 安装在非标准位置的情况 | `/opt/admin/bwrap` |
| `socatPath` | （仅托管设置，Linux/WSL2）用于沙箱网络代理的 `socat` 二进制文件的绝对路径。覆盖通过 `PATH` 的自动检测。仅从托管设置中生效 | `/opt/admin/socat` |

#### 沙箱路径前缀

`filesystem.allowWrite`、`filesystem.denyWrite`、`filesystem.denyRead` 和 `filesystem.allowRead` 中的路径支持以下前缀：

| 前缀 | 含义 | 示例 |
| :--- | :--- | :--- |
| `/` | 从文件系统根目录的绝对路径 | `/tmp/build` 保持 `/tmp/build` |
| `~/` | 相对于主目录 | `~/.kube` 变为 `$HOME/.kube` |
| `./` 或无前缀 | 项目设置相对于项目根目录，用户设置相对于 `~/.claude` | `.claude/settings.json` 中的 `./output` 解析为 `<project-root>/output` |

旧的 `//path` 前缀仍可用于绝对路径。如果你之前使用单斜杠 `/path` 期望项目相对解析，请切换到 `./path`。此语法与[Read 和 Edit 权限规则](/zh/permissions#read-and-edit)不同，后者使用 `//path` 表示绝对路径，`/path` 表示项目相对路径。沙箱文件系统路径使用标准约定：`/tmp/build` 是绝对路径。

**配置示例：**

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker *"],
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"],
      "deniedDomains": ["uploads.github.com"],
      "allowUnixSockets": [
        "/var/run/docker.sock"
      ],
      "allowLocalBinding": true
    }
  }
}
```

**文件系统和网络限制**可以通过两种方式配置并合并在一起：

* **`sandbox.filesystem` 设置**（如上所示）：在操作系统级沙箱边界控制路径。这些限制适用于所有子进程命令（例如 `kubectl`、`terraform`、`npm`），而不仅仅是 Claude 的文件工具。
* **权限规则**：使用 `Edit` 允许/拒绝规则控制 Claude 的文件工具访问，`Read` 拒绝规则阻止读取，`WebFetch` 允许/拒绝规则控制网络域。这些规则中的路径也会合并到沙箱配置中。

### 归属设置

Claude Code 为 git 提交和拉取请求添加归属。这些是分开配置的：

* 提交使用 [git trailers](https://git-scm.com/docs/git-interpret-trailers)（如 `Co-Authored-By`），可自定义或禁用
* 拉取请求描述为纯文本

| 键 | 描述 |
| :--- | :--- |
| `commit` | git 提交的归属，包括任何 trailers。空字符串隐藏提交归属 |
| `pr` | 拉取请求描述的归属。空字符串隐藏拉取请求归属 |

**默认提交归属：**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**默认拉取请求归属：**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**示例：**

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": ""
  }
}
```

`attribution` 设置优先于已弃用的 `includeCoAuthoredBy` 设置。要隐藏所有归属，请将 `commit` 和 `pr` 设为空字符串。

### 文件建议设置

为 `@` 文件路径自动完成配置自定义命令。内置文件建议使用快速文件系统遍历，但大型 monorepo 可能受益于项目特定的索引，如预构建的文件索引或自定义工具。

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/file-suggestion.sh"
  }
}
```

该命令使用与[钩子](/zh/hooks)相同的环境变量运行，包括 `CLAUDE_PROJECT_DIR`。它通过 stdin 接收 JSON，包含 `query` 字段：

```json
{"query": "src/comp"}
```

输出以换行符分隔的文件路径到 stdout（当前限制为 15 个）：

```text
src/components/Button.tsx
src/components/Modal.tsx
src/components/Form.tsx
```

**示例：**

```bash
#!/bin/bash
query=$(cat | jq -r '.query')
your-repo-file-index --query "$query" | head -20
```

### 钩子配置

这些设置控制哪些钩子被允许运行以及 HTTP 钩子可以访问什么。`allowManagedHooksOnly` 设置只能在[托管设置](#设置文件)中配置。URL 和环境变量白名单可在任何设置级别设置，并在源之间合并。

**当 `allowManagedHooksOnly` 为 `true` 时的行为：**

* 托管钩子和 SDK 钩子被加载
* 在托管设置 `enabledPlugins` 中强制启用的插件钩子被加载。这允许管理员通过组织市场分发经过审查的钩子，同时阻止其他所有钩子。信任通过完整的 `plugin@marketplace` ID 授予，因此来自不同市场的同名插件仍被阻止
* 用户钩子、项目钩子和所有其他插件钩子被阻止

**限制 HTTP 钩子 URL：**

限制 HTTP 钩子可访问的 URL。支持 `*` 作为通配符匹配。当数组被定义时，针对不匹配 URL 的 HTTP 钩子被静默阻止。主机名匹配不区分大小写，并忽略尾随的 FQDN 点，匹配 DNS 语义。

```json
{
  "allowedHttpHookUrls": ["https://hooks.example.com/*", "http://localhost:*"]
}
```

**限制 HTTP 钩子环境变量：**

限制 HTTP 钩子可插入头值的环境变量名称。每个钩子的有效 `allowedEnvVars` 是其自身列表与此设置的交集。

```json
{
  "httpHookAllowedEnvVars": ["MY_TOKEN", "HOOK_SECRET"]
}
```

### 使用策略助手计算托管设置

`policyHelper` 设置指向一个可执行文件，在启动时计算托管设置，因此管理员可以从设备状态、身份或远程服务派生策略，而非使用静态文件。从 MDM 或系统 `managed-settings.json` 文件配置。当 `policyHelper` 出现在任何其他作用域（包括用户设置、项目设置、HKCU 注册表配置单元和[服务器托管设置](/zh/server-managed-settings)）时，Claude Code 会忽略它。

该设置接受以下键：

| 键 | 类型 | 描述 |
| :--- | :--- | :--- |
| `path` | string | 助手可执行文件的绝对路径 |
| `timeoutMs` | number | 等待助手的时间，超时则视为失败 |
| `refreshIntervalMs` | number | 后台重新运行助手的频率。设为 `0` 以禁用刷新，或至少设为 `60000` |

助手将 JSON 信封写入 stdout。将设置放在 `managedSettings` 键下而非顶级，因为裸设置对象解析时 `managedSettings` 为 undefined 且不应用任何内容：

```json
{
  "managedSettings": {
    "permissions": { "deny": ["Read(//etc/secrets/**)"] }
  },
  "claudeMd": "# Organization context\n...",
  "appendSystemPrompt": "Always cite the internal style guide."
}
```

当助手发出 `managedSettings` 时，该对象替换基于文件的托管设置用于本次运行。当助手在启动时以非零退出时，Claude Code 打印错误并拒绝启动，因此需要故障恢复能力的助手应从自己的缓存提供服务并退出 `0`。

### 设置优先级

设置按优先级顺序应用。从高到低：

1. **托管设置**（[服务器托管](/zh/server-managed-settings)、[MDM/操作系统级策略](#配置作用域)或[托管设置](/zh/settings#settings-files)）
   * IT 通过服务器交付、MDM 配置文件、注册表策略或托管设置文件部署的策略
   * 不能被任何其他级别覆盖，包括命令行参数
   * 在托管层内，优先级为：服务器托管 > MDM/操作系统级策略 > 基于文件（`managed-settings.d/*.json` + `managed-settings.json`）> HKCU 注册表（仅 Windows）。仅使用一个托管源；源不在层之间合并。在基于文件的层内，附加文件和基础文件合并在一起。
   * 嵌入宿主（如 Claude Desktop）可通过 SDK `managedSettings` 选项提供策略。默认情况下，当存在任何托管设置层时此选项被忽略。管理员可以通过将 [`parentSettingsBehavior`](#可用设置) 设为 `"merge"` 来选择加入。嵌入器的值经过过滤，可以收紧托管策略但不能放松。

2. **命令行参数**
   * 特定会话的临时覆盖。通过 `--settings <file-or-json>` 传递的 JSON 使用与其他层相同的规则与基于文件的设置合并：此处设置的键覆盖本地、项目或用户设置中的相同键，省略的键保留较低层的值

3. **本地项目设置**（`.claude/settings.local.json`）
   * 个人项目特定设置

4. **共享项目设置**（`.claude/settings.json`）
   * 源代码控制中的团队共享项目设置

5. **用户设置**（`~/.claude/settings.json`）
   * 个人全局设置

此层次结构确保组织策略始终被强制执行，同时仍允许团队和个人自定义其体验。无论你从 CLI、[VS Code 扩展](/zh/vs-code)还是 [JetBrains IDE](/zh/jetbrains) 运行 Claude Code，相同的优先级都适用。

例如，如果你的用户设置将 `permissions.defaultMode` 设为 `acceptEdits`，而项目的共享设置将其设为 `default`，则项目值生效。下面的示例介绍了数组值设置（如权限规则）如何组合。

**数组设置跨作用域合并。** 当相同的数组值设置（如 `sandbox.filesystem.allowWrite` 或 `permissions.allow`）出现在多个作用域中时，数组被**连接和去重**，而非替换。这意味着较低优先级的作用域可以添加条目而不会覆盖较高优先级作用域设置的条目，反之亦然。例如，如果托管设置将 `allowWrite` 设为 `["/opt/company-tools"]`，用户添加 `["~/.kube"]`，则两个路径都包含在最终配置中。

### 验证活动设置

在 Claude Code 中运行 `/status` 以查看哪些设置源处于活动状态。状态标签包含一个 `Setting sources` 行，列出 Claude Code 为当前会话加载的每个层，如 `User settings` 或 `Project local settings`。当[托管设置](/zh/managed-settings)生效时，条目在括号中显示交付渠道，例如 `Enterprise managed settings (remote)`、`(plist)`、`(HKLM)`、`(HKCU)` 或 `(file)`。层仅在该源加载了至少一个键时出现在列表中，因此空列表表示未找到设置源。

`Setting sources` 行确认正在读取的源。它不显示哪个层提供了每个单独的键。同一对话框中的 Config 标签是固定切换集的编辑器（如主题和详细输出），而非 `settings.json` 内容的视图。如果设置文件包含错误（如无效 JSON 或值验证失败），`/status` 会报告问题以便你修复。

### 关于配置系统的关键要点

* **记忆文件（`CLAUDE.md`）**：包含 Claude 在启动时加载的指令和上下文
* **设置文件（JSON）**：配置权限、环境变量和工具行为
* **技能**：可通过 `/skill-name` 调用或由 Claude 自动加载的自定义提示词
* **MCP 服务器**：使用附加工具和集成扩展 Claude Code
* **优先级**：较高层级的配置（托管）覆盖较低层级的（用户/项目）
* **继承**：设置跨作用域合并；来自较高优先级作用域的标量值覆盖，数组连接

### 系统提示词

Claude Code 的内部系统提示词不公开发布。要添加自定义指令，请使用 `CLAUDE.md` 文件或 `--append-system-prompt` 标志。

### 排除敏感文件

为防止 Claude Code 访问包含敏感信息的文件（如 API 密钥、密钥和环境文件），请在 `.claude/settings.json` 文件中使用 `permissions.deny` 设置：

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./build)"
    ]
  }
}
```

这取代了已弃用的 `ignorePatterns` 配置。匹配这些模式的文件被排除在文件发现和搜索结果之外，对这些文件的读取操作被拒绝。

## 子代理配置

Claude Code 支持可在用户和项目级别配置的自定义 AI 子代理。这些子代理存储为带有 YAML frontmatter 的 Markdown 文件：

* **用户子代理**：`~/.claude/agents/` — 在你所有项目中可用
* **项目子代理**：`.claude/agents/` — 特定于你的项目，可与团队共享

子代理文件定义了具有自定义提示词和工具权限的专用 AI 助手。在[子代理文档](/zh/sub-agents)中了解更多关于创建和使用子代理的信息。

## 插件配置

Claude Code 支持插件系统，让你可以通过技能、代理、钩子和 MCP 服务器扩展功能。插件通过市场分发，可在用户和仓库级别配置。

### 插件设置

`settings.json` 中的插件相关设置：

```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "deployer@acme-tools": true,
    "analyzer@security-plugins": false
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    }
  }
}
```

#### `enabledPlugins`

控制哪些插件被启用。格式：`"plugin-name@marketplace-name": true/false`。在任何作用域中没有条目的插件回退到其 [`defaultEnabled`](/zh/plugins-reference#default-enablement) 值。

**作用域**：

* **用户设置**（`~/.claude/settings.json`）：个人插件偏好
* **项目设置**（`.claude/settings.json`）：与团队共享的项目特定插件
* **本地设置**（`.claude/settings.local.json`）：按机器覆盖（不提交）
* **托管设置**（`managed-settings.json`）：组织范围的策略覆盖，阻止所有作用域的安装并从市场中隐藏插件

项目设置优先于用户设置，因此在 `~/.claude/settings.json` 中将插件设为 `false` 不会禁用项目 `.claude/settings.json` 启用的插件。要在你的机器上选择退出项目启用的插件，请在 `.claude/settings.local.json` 中将其设为 `false`。

由托管设置强制启用的插件无法以这种方式禁用，因为托管设置覆盖本地设置。

**示例**：

```json
{
  "enabledPlugins": {
    "code-formatter@team-tools": true,
    "deployment-tools@team-tools": true,
    "experimental-features@personal": false
  }
}
```

#### `extraKnownMarketplaces`

定义应为仓库提供的附加市场。通常在仓库级设置中使用，以确保团队成员可以访问所需的插件来源。

**当仓库包含 `extraKnownMarketplaces` 时**：

1. 团队成员在信任文件夹时会被提示安装市场
2. 然后团队成员会被提示安装该市场的插件
3. 用户可以跳过不需要的市场或插件（存储在用户设置中）
4. 安装遵循信任边界并需要明确同意

**示例**：

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    },
    "security-plugins": {
      "source": {
        "source": "git",
        "url": "https://git.example.com/security/plugins.git"
      }
    }
  }
}
```

**市场来源类型**：

* `github`：GitHub 仓库（使用 `repo`）
* `git`：任何 git URL（使用 `url`）
* `directory`：本地文件系统路径（使用 `path`，仅用于开发）
* `hostPattern`：匹配市场主机的正则表达式模式（使用 `hostPattern`）
* `settings`：直接在 settings.json 中声明的内联市场，无需单独的托管仓库（使用 `name` 和 `plugins`）

对于 `github` 和 `git` 来源，在 `source` 对象内（与 `repo` 或 `url` 并列）设置 `"skipLfs": true` 可在 Claude Code 克隆或更新市场仓库时跳过 Git LFS 下载。LFS 指针文件保持为指针而不下载其内容。当仓库包含与插件内容无关的大型 LFS 对象时使用此选项。{/* min-version: 2.1.153 */}需要 Claude Code v2.1.153 或更高版本。

每个市场条目还接受可选的 `autoUpdate` 布尔值。与 `source` 并列设置 `"autoUpdate": true` 可使 Claude Code 在启动时刷新该市场并更新其已安装的插件。省略时，官方 Anthropic 市场默认为 `true`，所有其他市场默认为 `false`。参见[配置自动更新](/zh/discover-plugins#configure-auto-updates)。

使用 `source: 'settings'` 以内联方式声明少量插件，无需设置托管市场仓库。此处列出的插件必须引用外部来源（如 GitHub 或 npm）。你仍需在 `enabledPlugins` 中单独启用每个插件。

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "settings",
        "name": "team-tools",
        "plugins": [
          {
            "name": "code-formatter",
            "source": {
              "source": "github",
              "repo": "acme-corp/code-formatter"
            }
          }
        ]
      }
    }
  }
}
```

#### `strictKnownMarketplaces`

**仅托管设置**：控制用户被允许添加和安装插件的市场来源。此设置只能在[托管设置](/zh/settings#settings-files)中配置，为管理员提供对市场来源的严格控制。

**托管设置文件位置**：

* **macOS**：`/Library/Application Support/ClaudeCode/managed-settings.json`
* **Linux 和 WSL**：`/etc/claude-code/managed-settings.json`
* **Windows**：`C:\Program Files\ClaudeCode\managed-settings.json`

**关键特性**：

* 仅在托管设置（`managed-settings.json`）中可用
* 不能被用户或项目设置覆盖（最高优先级）
* 在网络/文件系统操作之前强制执行（被阻止的来源从不执行）
* 对来源规范使用精确匹配（包括 git 来源的 `ref`、`path`），但 `hostPattern` 和 `pathPattern` 使用正则表达式匹配

**白名单行为**：

* `undefined`（默认）：无限制 — 用户可以添加任何市场
* 空数组 `[]`：完全锁定 — 用户不能添加任何新市场
* 来源列表：用户只能添加精确匹配的市场

**所有支持的来源类型**：

白名单支持多种市场来源类型。大多数来源使用精确匹配，而 `hostPattern` 和 `pathPattern` 分别对市场主机和文件系统路径使用正则表达式匹配。

1. **GitHub 仓库**：

```json
{ "source": "github", "repo": "acme-corp/approved-plugins" }
{ "source": "github", "repo": "acme-corp/security-tools", "ref": "v2.0" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main", "path": "marketplace" }
```

字段：`repo`（必需），`ref`（可选：分支/标签/SHA），`path`（可选：子目录）

2. **Git 仓库**：

```json
{ "source": "git", "url": "https://gitlab.example.com/tools/plugins.git" }
{ "source": "git", "url": "https://bitbucket.org/acme-corp/plugins.git", "ref": "production" }
{ "source": "git", "url": "ssh://git@git.example.com/plugins.git", "ref": "v3.1", "path": "approved" }
```

字段：`url`（必需），`ref`（可选：分支/标签/SHA），`path`（可选：子目录）

3. **基于 URL 的市场**：

```json
{ "source": "url", "url": "https://plugins.example.com/marketplace.json" }
{ "source": "url", "url": "https://cdn.example.com/marketplace.json", "headers": { "Authorization": "Bearer ${TOKEN}" } }
```

字段：`url`（必需），`headers`（可选：用于认证访问的 HTTP 头）

基于 URL 的市场仅下载 `marketplace.json` 文件。它们不从服务器下载插件文件。基于 URL 的市场中的插件必须使用外部来源（GitHub、npm 或 git URL）而非相对路径。对于使用相对路径的插件，请改用基于 Git 的市场。参见[故障排除](/zh/plugin-marketplaces#plugins-with-relative-paths-fail-in-url-based-marketplaces)了解详情。

4. **NPM 包**：

```json
{ "source": "npm", "package": "@acme-corp/claude-plugins" }
{ "source": "npm", "package": "@acme-corp/approved-marketplace" }
```

字段：`package`（必需，支持作用域包）

5. **文件路径**：

```json
{ "source": "file", "path": "/usr/local/share/claude/acme-marketplace.json" }
{ "source": "file", "path": "/opt/acme-corp/plugins/marketplace.json" }
```

字段：`path`（必需：marketplace.json 文件的绝对路径）

6. **目录路径**：

```json
{ "source": "directory", "path": "/usr/local/share/claude/acme-plugins" }
{ "source": "directory", "path": "/opt/acme-corp/approved-marketplaces" }
```

字段：`path`（必需：包含 `.claude-plugin/marketplace.json` 的目录的绝对路径）

7. **主机模式匹配**：

```json
{ "source": "hostPattern", "hostPattern": "^github\\.example\\.com$" }
{ "source": "hostPattern", "hostPattern": "^gitlab\\.internal\\.example\\.com$" }
```

字段：`hostPattern`（必需：与市场主机匹配的正则表达式模式）

当你想允许来自特定主机的所有市场而不逐一列举每个仓库时，使用主机模式匹配。这对于拥有内部 GitHub Enterprise 或 GitLab 服务器（开发者创建自己的市场）的组织很有用。

按来源类型的主机提取：

* `github`：始终匹配 `github.com`
* `git`：从 URL 提取主机名（支持 HTTPS 和 SSH 格式）
* `url`：从 URL 提取主机名
* `npm`、`file`、`directory`：不支持主机模式匹配

8. **路径模式匹配**：

```json
{ "source": "pathPattern", "pathPattern": "^/opt/approved/" }
{ "source": "pathPattern", "pathPattern": ".*" }
```

字段：`pathPattern`（必需：与 `file` 和 `directory` 来源的 `path` 字段匹配的正则表达式模式）

使用路径模式匹配来允许基于文件系统的市场，同时对网络来源使用 `hostPattern` 限制。设为 `".*"` 以允许所有本地路径，或使用更窄的模式限制到特定目录。

**配置示例**：

示例：仅允许特定市场：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme-corp/approved-plugins"
    },
    {
      "source": "github",
      "repo": "acme-corp/security-tools",
      "ref": "v2.0"
    },
    {
      "source": "url",
      "url": "https://plugins.example.com/marketplace.json"
    },
    {
      "source": "npm",
      "package": "@acme-corp/compliance-plugins"
    }
  ]
}
```

示例 — 禁用所有市场添加：

```json
{
  "strictKnownMarketplaces": []
}
```

示例：允许来自内部 git 服务器的所有市场：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

**精确匹配要求**：

市场来源必须**精确匹配**才能允许用户的添加。对于基于 git 的来源（`github` 和 `git`），这包括所有可选字段：

* `repo` 或 `url` 必须精确匹配
* `ref` 字段必须精确匹配（或两者都为 undefined）
* `path` 字段必须精确匹配（或两者都为 undefined）

**不匹配**的来源示例：

```json
// 这些是不同的来源：
{ "source": "github", "repo": "acme-corp/plugins" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main" }

// 这些也是不同的：
{ "source": "github", "repo": "acme-corp/plugins", "path": "marketplace" }
{ "source": "github", "repo": "acme-corp/plugins" }
```

**与 `extraKnownMarketplaces` 的比较**：

| 方面 | `strictKnownMarketplaces` | `extraKnownMarketplaces` |
| :--- | :--- | :--- |
| **目的** | 组织策略强制执行 | 团队便利性 |
| **设置文件** | 仅 `managed-settings.json` | 任何设置文件 |
| **行为** | 阻止非白名单的添加 | 自动安装缺失的市场 |
| **强制执行时机** | 在网络/文件系统操作之前 | 在用户信任提示之后 |
| **可覆盖** | 否（最高优先级） | 是（通过更高优先级设置） |
| **来源格式** | 直接来源对象 | 带嵌套来源的命名市场 |
| **用例** | 合规、安全限制 | 入职、标准化 |

**格式差异**：

`strictKnownMarketplaces` 使用直接来源对象：

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ]
}
```

`extraKnownMarketplaces` 需要命名市场：

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

**同时使用两者**：

`strictKnownMarketplaces` 是策略门：它控制用户可以添加什么但不注册任何市场。要同时限制并为所有用户预注册市场，请在 `managed-settings.json` 中同时设置：

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ],
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

仅设置 `strictKnownMarketplaces` 时，用户仍可通过 `/plugin marketplace add` 手动添加允许的市场，但它不会自动可用。

**重要说明**：

* 限制在任何网络请求或文件系统操作之前检查
* 被阻止时，用户会看到明确的错误消息，表明来源被托管策略阻止
* 限制在市场添加和插件安装、更新、刷新及自动更新时强制执行。在策略设置之前添加的市场，在其来源不再匹配白名单后无法用于安装或更新插件
* 托管设置具有最高优先级，不能被覆盖

参见[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions)了解面向用户的文档。

#### `strictPluginOnlyCustomization`

**仅托管设置**：阻止来自用户和项目的技能、代理、钩子和 MCP 服务器，因此它们只能来自插件或托管设置。将其与 `strictKnownMarketplaces` 结合使用以控制完整的自定义供应链：市场白名单控制用户可以安装哪些插件，此设置阻止不来自插件或托管设置的所有内容。

`strictPluginOnlyCustomization` 需要 Claude Code v2.1.82 或更高版本。早期版本忽略该键并继续加载用户和项目自定义，因此锁定在客户端更新之前不会强制执行。

值为 `true` 以锁定所有四个表面，或命名要锁定的表面的数组：

```json
{
  "strictPluginOnlyCustomization": ["skills", "hooks"]
}
```

对于每个锁定的表面，Claude Code 跳过用户级和项目级来源，仅加载插件提供的和托管的来源：

| 表面 | 锁定时阻止 | 仍加载 |
| :--- | :--- | :--- |
| `skills` | `~/.claude/skills/`、`.claude/skills/` | 插件技能、内置技能、托管策略目录中的技能 |
| `agents` | `~/.claude/agents/`、`.claude/agents/` | 插件代理、内置代理、托管策略目录中的代理 |
| `hooks` | 用户、项目和本地 `settings.json` 中的钩子 | 插件钩子、托管设置中的钩子 |
| `mcp` | `~/.claude.json` 和 `.mcp.json` 中的服务器 | 插件 MCP 服务器、[`managed-mcp.json`](/zh/managed-mcp) 服务器 |

Claude Code 版本不识别的表面名称被忽略而非导致设置文件失败，因此你可以在所有客户端更新之前添加新的表面名称。

### 管理插件

使用 `/plugin` 命令以交互方式管理插件：

* 浏览市场的可用插件
* 安装/卸载插件
* 启用/禁用插件
* 查看插件详情（提供的技能、代理、钩子）
* 添加/移除市场

在[插件文档](/zh/plugins)中了解更多关于插件系统的信息。

## 环境变量

环境变量让你无需编辑设置文件即可控制 Claude Code 行为。任何变量也可以在 [`settings.json`](#可用设置) 的 `env` 键下配置，以应用于每个会话或向团队推出。

参见[环境变量参考](/zh/env-vars)了解完整列表。

## Claude 可用的工具

Claude Code 可以访问一组用于读取、编辑、搜索、运行命令和协调子代理的工具。工具名称是你在权限规则和钩子匹配器中使用的确切字符串。

参见[工具参考](/zh/tools-reference)了解完整列表和 Bash 工具行为详情。

## 另请参阅

* [权限](/zh/permissions)：权限系统、规则语法、特定工具模式和托管策略
* [身份验证](/zh/authentication)：设置用户对 Claude Code 的访问
* [调试配置](/zh/debug-your-config)：诊断设置、钩子或 MCP 服务器未生效的原因
* [安装和登录故障排除](/zh/troubleshoot-install)：安装、身份验证和平台问题
