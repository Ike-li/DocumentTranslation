> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 通过远程控制在任意设备上继续本地会话

> 使用远程控制从手机、平板或任意浏览器继续本地 Claude Code 会话。支持 claude.ai/code 和 Claude 移动应用。

远程控制处于研究预览阶段，适用于所有套餐。在团队版和企业版中，默认关闭，需要管理员在 [Claude Code 管理设置](https://claude.ai/admin-settings/claude-code) 中启用远程控制开关。

远程控制将 [claude.ai/code](https://claude.ai/code) 或 Claude 应用（[iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 和 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)）连接到你机器上运行的 Claude Code 会话。在办公桌前启动任务，然后在沙发上用手机或在另一台电脑的浏览器上继续。

当你在机器上启动远程控制会话时，Claude 始终在本地运行，因此不会有任何内容转移到云端。通过远程控制，你可以：

* **远程使用完整的本地环境**：你的文件系统、[MCP 服务器](/zh/mcp)、工具和项目配置都保持可用，输入 `@` 可自动补全本地项目的文件路径
* **同时在多个端工作**：对话在所有已连接设备间保持同步，你可以从终端、浏览器和手机交替发送消息
* **抵御中断**：如果你的笔记本电脑休眠或网络断开，当机器恢复上线时会话会自动重连

与运行在云基础设施上的 [网页版 Claude Code](/zh/claude-code-on-the-web) 不同，远程控制会话直接在你的机器上运行，并与你的本地文件系统交互。网页和移动界面只是该本地会话的一个窗口。

远程控制需要 Claude Code v2.1.51 或更高版本。使用 `claude --version` 检查你的版本。

本页面涵盖设置、如何启动和连接会话，以及远程控制与网页版 Claude Code 的对比。

## 要求

使用远程控制之前，请确认你的环境满足以下条件：

* **订阅**：适用于 Pro、Max、团队版和企业版套餐。不支持 API 密钥。在团队版和企业版中，管理员需要先在 [Claude Code 管理设置](https://claude.ai/admin-settings/claude-code) 中启用远程控制开关。
* **认证**：运行 `claude` 并使用 `/login` 通过 claude.ai 登录（如果尚未登录）。
* **工作区信任**：在项目目录中至少运行一次 `claude` 以接受工作区信任对话框。

## 启动远程控制会话

你可以从 CLI 或 VS Code 扩展启动远程控制会话。CLI 提供三种调用模式；VS Code 使用 `/remote-control` 命令。

### 服务器模式

导航到你的项目目录并运行：

```bash
claude remote-control
```

该进程以服务器模式在终端中持续运行，等待远程连接。它会显示一个会话 URL，你可以使用它从[另一台设备连接](#从另一台设备连接)，按空格键可显示二维码以便从手机快速访问。当远程会话处于活动状态时，终端会显示连接状态和工具活动。

可用标志：

| 标志                                            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name "My Project"`                           | 设置自定义会话标题，在 claude.ai/code 的会话列表中可见。                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `--remote-control-session-name-prefix <prefix>` | 未设置显式名称时自动生成会话名称的前缀。默认为你的机器主机名，生成类似 `myhost-graceful-unicorn` 的名称。设置 `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` 具有相同效果。                                                                                                                                                                                                                                                                                                                                                                                    |
| `--spawn <mode>`                                | 服务器创建会话的方式。<br />• `same-dir`（默认）：所有会话共享当前工作目录，编辑相同文件时可能冲突。<br />• `worktree`：每个按需会话拥有自己的 [git 工作树](/zh/worktrees)。需要 git 仓库。<br />• `session`：单会话模式。仅服务一个会话，拒绝额外连接。仅在启动时设置。<br />运行时按 `w` 在 `same-dir` 和 `worktree` 之间切换。 |
| `--capacity <N>`                                | 最大并发会话数。默认为 32。不能与 `--spawn=session` 一起使用。                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `--verbose`                                     | 显示详细的连接和会话日志。                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `--sandbox` / `--no-sandbox`                    | 启用或禁用文件系统和网络隔离的[沙箱](/zh/sandboxing)。默认关闭。                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 交互式会话

要启动一个启用了远程控制的普通交互式 Claude Code 会话，使用 `--remote-control` 标志（或 `--rc`）：

```bash
claude --remote-control
```

可选地传入会话名称：

```bash
claude --remote-control "My Project"
```

这会在终端中提供一个完整的交互式会话，你也可以从 claude.ai 或 Claude 应用控制它。与 `claude remote-control`（服务器模式）不同，你可以在本地输入消息，同时会话也可远程访问。

### 从现有会话启动

如果你已经在 Claude Code 会话中并想远程继续它，使用 `/remote-control`（或 `/rc`）命令：

```text
/remote-control
```

传入名称作为参数来设置自定义会话标题：

```text
/remote-control My Project
```

这会启动一个远程控制会话，延续你当前的对话历史，并显示会话 URL 和二维码，你可以使用它从[另一台设备连接](#从另一台设备连接)。`--verbose`、`--sandbox` 和 `--no-sandbox` 标志不适用于此命令。

### VS Code

在 [Claude Code VS Code 扩展](/zh/vs-code)中，在提示框中输入 `/remote-control` 或 `/rc`，或用 `/` 打开命令菜单并选择它。需要 Claude Code v2.1.79 或更高版本。

```text
/remote-control
```

提示框上方会出现一个横幅，显示连接状态。连接后，点击横幅中的 **Open in browser** 直接跳转到会话，或在 [claude.ai/code](https://claude.ai/code) 的会话列表中找到它。会话 URL 也会发布在对话中。

要断开连接，点击横幅上的关闭图标或再次运行 `/remote-control`。

与 CLI 不同，VS Code 命令不接受名称参数，也不显示二维码。会话标题来自你的对话历史或第一条提示词。

### 从另一台设备连接

远程控制会话激活后，你有几种方式从另一台设备连接：

* **打开会话 URL**：在任意浏览器中打开会话 URL，直接跳转到 [claude.ai/code](https://claude.ai/code) 上的会话。
* **扫描二维码**：扫描会话 URL 旁显示的二维码，直接在 Claude 应用中打开。使用 `claude remote-control` 时，按空格键切换二维码显示。
* **打开 [claude.ai/code](https://claude.ai/code) 或 Claude 应用**：在会话列表中按名称找到会话。在 Claude 移动应用中，点击导航栏中的 **Code** 进入会话列表。远程控制会话在线时会显示带绿色状态点的电脑图标。

远程会话标题按以下顺序选择：

1. 你传给 `--name`、`--remote-control` 或 `/remote-control` 的名称
2. 你通过 `/rename` 设置的标题
3. 现有对话历史中最后一条有意义的消息
4. 自动生成的名称，如 `myhost-graceful-unicorn`，其中 `myhost` 是你的机器主机名或你通过 `--remote-control-session-name-prefix` 设置的前缀

如果你没有设置显式名称，发送提示词后标题会更新以反映你的提示词。从 claude.ai 或 Claude 应用重命名会话也会更新 `claude --resume` 中显示的本地标题。

如果环境中已有活动会话，系统会询问你是继续该会话还是启动新会话。

如果你还没有 Claude 应用，在 Claude Code 中使用 `/mobile` 命令显示 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 或 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) 的下载二维码。

### 为所有会话启用远程控制

默认情况下，远程控制仅在你明确运行 `claude remote-control`、`claude --remote-control` 或 `/remote-control` 时激活。要为每个交互式会话自动启用它，在 Claude Code 中运行 `/config` 并将 **Enable Remote Control for all sessions** 设置为 `true`。设置回 `false` 可禁用。在桌面应用中，你也可以从 **Settings → Claude Code → Enable remote control by default** 切换此设置。

启用此设置后，每个交互式 Claude Code 进程会注册一个远程会话。如果你运行多个实例，每个实例都有自己的环境和会话。要从单个进程运行多个并发会话，请改用[服务器模式](#启动远程控制会话)。

## 连接和安全

你的本地 Claude Code 会话仅发出出站 HTTPS 请求，永远不会在你的机器上打开入站端口。启动远程控制时，它会向 Anthropic API 注册并轮询工作。当你从另一台设备连接时，服务器通过流式连接在 Web 或移动客户端与你的本地会话之间路由消息。

所有流量通过 TLS 经由 Anthropic API 传输，与任何 Claude Code 会话的传输安全性相同。连接使用多个短期凭证，每个凭证限定于单一用途并独立过期。

## 远程控制与网页版 Claude Code 的对比

远程控制和[网页版 Claude Code](/zh/claude-code-on-the-web) 都使用 claude.ai/code 界面。关键区别在于会话运行的位置：远程控制在你的机器上执行，因此你的本地 MCP 服务器、工具和项目配置保持可用。网页版 Claude Code 在 Anthropic 管理的云基础设施中执行。

当你正在进行本地工作并想从另一台设备继续时，使用远程控制。当你想在没有任何本地设置的情况下启动任务、处理未克隆的仓库，或并行运行多个任务时，使用网页版 Claude Code。

## 移动推送通知

当远程控制处于活动状态时，Claude 可以向你的手机发送推送通知。

Claude 决定何时推送。通常在长时间运行的任务完成或需要你做出决定以继续时发送。你也可以在提示词中请求推送，例如 `notify me when the tests finish`。除了下面的开/关切换外，没有按事件的配置。

移动推送通知需要 Claude Code v2.1.110 或更高版本。

设置移动推送通知：

1. **安装 Claude 移动应用**
   下载 Claude 应用：[iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 或 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)。

2. **使用你的 Claude Code 账户登录**
   使用你在终端中用于 Claude Code 的相同账户和组织。

3. **允许通知**
   接受操作系统的通知权限提示。

4. **在 Claude Code 中启用推送**
   在终端中运行 `/config` 并启用 **Push when Claude decides**。

如果通知未到达：

* 如果 `/config` 显示 **No mobile registered**，在手机上打开 Claude 应用以刷新推送令牌。下次远程控制连接时警告会消失。
* 在 iOS 上，专注模式和通知摘要可能会抑制或延迟推送。检查 Settings → Notifications → Claude。
* 在 Android 上，激进的电池优化可能会延迟送达。在系统设置中将 Claude 应用从电池优化中豁免。

## 限制

* **每个交互式进程一个远程会话**：在服务器模式之外，每个 Claude Code 实例一次只支持一个远程会话。使用[服务器模式](#启动远程控制会话)从单个进程运行多个并发会话。
* **本地进程必须保持运行**：远程控制作为本地进程运行。如果你关闭终端、退出 VS Code 或以其他方式停止 `claude` 进程，会话将结束。
* **长时间网络中断**：如果你的机器处于唤醒状态但无法连接网络超过大约 10 分钟，会话将超时且进程退出。再次运行 `claude remote-control` 以启动新会话。
* **Ultraplan 会断开远程控制**：启动 [ultraplan](/zh/ultraplan) 会话会断开任何活动的远程控制会话，因为两个功能都占用 claude.ai/code 界面，一次只能连接一个。
* **部分命令仅限本地**：在终端中打开交互式选择器的命令，如 `/mcp`、`/plugin` 或 `/resume`，仅在本地 CLI 中可用。产生文本输出的命令，包括 `/compact`、`/clear`、`/context`、`/usage`、`/exit`、`/usage-credits`、`/recap` 和 `/reload-plugins`，可从移动端和网页端使用。

## 故障排除

### "Remote Control requires a claude.ai subscription"

你未使用 claude.ai 账户进行认证。运行 `claude auth login` 并选择 claude.ai 选项。如果你的环境中设置了 `ANTHROPIC_API_KEY`，请先取消设置。

### "Remote Control requires a full-scope login token"

你使用的是来自 `claude setup-token` 或 `CLAUDE_CODE_OAUTH_TOKEN` 环境变量的长期令牌进行认证。这些令牌仅限推理使用，无法建立远程控制会话。运行 `claude auth login` 以使用全范围会话令牌进行认证。

### "Unable to determine your organization for Remote Control eligibility"

你的缓存账户信息已过期或不完整。运行 `claude auth login` 以刷新。

### "Remote Control is not yet enabled for your account"

资格检查在某些环境变量存在时可能失败：

* `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 或 `DISABLE_TELEMETRY`：取消设置后重试。
* `CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_USE_VERTEX` 或 `CLAUDE_CODE_USE_FOUNDRY`：远程控制需要 claude.ai 认证，不适用于第三方提供商。

如果以上都未设置，运行 `/logout` 然后 `/login` 以刷新。

### "Remote Control is disabled by your organization's policy"

此错误有四个不同的原因。先运行 `/status` 查看你使用的登录方法和订阅。

* **你使用 API 密钥或 Console 账户进行认证**：远程控制需要 claude.ai OAuth。运行 `/login` 并选择 claude.ai 选项。如果你的环境中设置了 `ANTHROPIC_API_KEY`，请取消设置。
* **你的团队版或企业版管理员未启用**：远程控制在这些套餐中默认关闭。管理员可以在 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 中启用 **Remote Control** 开关。此开关是服务端的组织设置。
* **管理员开关为灰色**：你的组织具有与远程控制不兼容的数据保留或合规配置。这无法从管理面板更改。联系 Anthropic 支持以讨论选项。
* **错误提到 `disableRemoteControl`**：你的 IT 管理员通过[托管设置](/zh/settings#settings-files)在此设备上禁用了远程控制，与组织范围的开关无关。

### "Remote credentials fetch failed"

Claude Code 无法从 Anthropic API 获取短期凭证以建立连接。使用 `--verbose` 重新运行以查看完整错误：

```bash
claude remote-control --verbose
```

常见原因：

* 未登录：运行 `claude` 并使用 `/login` 通过 claude.ai 账户进行认证。远程控制不支持 API 密钥认证。
* 网络或代理问题：防火墙或代理可能阻止了出站 HTTPS 请求。远程控制需要访问端口 443 上的 Anthropic API。
* 会话创建失败：如果你还看到 `Session creation failed — see debug log`，则故障发生在设置的早期阶段。检查你的订阅是否处于活动状态。

## 选择正确的方式

Claude Code 提供了多种在你不在终端前时工作的方式。它们在触发工作的条件、Claude 运行的位置以及需要多少设置方面有所不同。

|                                                | 触发方式                                                                                        | Claude 运行位置                                                                               | 设置                                                                                                                                | 最佳用途                                                      |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| [Dispatch](/zh/desktop#sessions-from-dispatch) | 从 Claude 移动应用发送任务消息                                                      | 你的机器（桌面版）                                                                       | [将移动应用与桌面版配对](https://support.claude.com/en/articles/13947068)                                                  | 离开时委派工作，最少设置              |
| [远程控制](/zh/remote-control)           | 从 [claude.ai/code](https://claude.ai/code) 或 Claude 移动应用驱动正在运行的会话 | 你的机器（CLI 或 VS Code）                                                                | 运行 `claude remote-control`                                                                                                          | 从另一台设备引导进行中的工作                 |
| [Channels](/zh/channels)                       | 从 Telegram 或 Discord 等聊天应用或你自己的服务器推送事件                       | 你的机器（CLI）                                                                           | [安装 channel 插件](/zh/channels#quickstart) 或[构建你自己的](/zh/channels-reference)                                      | 响应外部事件如 CI 失败或聊天消息 |
| [Slack](/zh/slack)                             | 在团队频道中提及 `@Claude`                                                            | Anthropic 云                                                                              | [安装 Slack 应用](/zh/slack#setting-up-claude-code-in-slack) 并启用[网页版 Claude Code](/zh/claude-code-on-the-web) | 从团队聊天中处理 PR 和审查                                |
| [定时任务](/zh/scheduled-tasks)         | 设置时间表                                                                                 | [CLI](/zh/scheduled-tasks)、[桌面版](/zh/desktop-scheduled-tasks) 或[云端](/zh/routines) | 选择频率                                                                                                                     | 定期自动化如每日审查                       |

## 相关资源

* [网页版 Claude Code](/zh/claude-code-on-the-web)：在 Anthropic 管理的云环境中运行会话，而非在你的机器上
* [Ultraplan](/zh/ultraplan)：从终端启动云规划会话，并在浏览器中审查计划
* [Channels](/zh/channels)：将 Telegram、Discord 或 iMessage 转发到会话中，让 Claude 在你离开时响应消息
* [Dispatch](/zh/desktop#sessions-from-dispatch)：从手机发送任务消息，它可以生成桌面会话来处理
* [认证](/zh/authentication)：设置 `/login` 并管理 claude.ai 的凭证
* [CLI 参考](/zh/cli-reference)：包括 `claude remote-control` 在内的完整标志和命令列表
* [安全](/zh/security)：远程控制会话如何融入 Claude Code 安全模型
* [数据使用](/zh/data-usage)：本地和远程会话期间哪些数据流经 Anthropic API
