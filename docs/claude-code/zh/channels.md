> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索前发现所有可用页面。

# 通过通道向运行中的会话推送事件

> 使用通道从 MCP 服务器向你的 Claude Code 会话推送消息、警报和网络钩子。转发 CI 结果、聊天消息和监控事件，以便 Claude 在你离开时也能做出反应。

  频道处于[研究预览版](#研究预览)阶段，需要 Claude Code v2.1.80 或更高版本。这些功能需要通过 claude.ai 或 Console API 密钥进行 Anthropic 身份验证，且在 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 上不可用。团队和企业组织必须[明确启用此功能](#企业控制)。

通道是一个 MCP 服务器，它将事件推送到您正在运行的 Claude Code 会话中，因此当您不在终端前时，Claude 也能对发生的事件做出反应。通道可以是双向的：Claude 读取事件并通过同一通道回复，就像聊天桥接一样。事件仅在会话打开期间到达，因此若要实现始终在线设置，需在后台进程或持久化终端中运行 Claude。

与生成新云会话或等待轮询的集成方式不同，事件会直接到达您已打开的会话中：参见 [通道对比说明](#频道功能对比)。

您可将通道作为插件安装，并使用自己的凭据进行配置。Telegram、Discord 和 iMessage 已包含在研究预览版中。

当 Claude 通过通道回复时，您会在终端中看到传入消息，但看不到回复文本。终端会显示工具调用和确认信息（如“已发送”），实际回复则显示在另一平台上。

本页涵盖内容：

* [支持的通道](#支持的通道)：Telegram、Discord 和 iMessage 设置
* [使用 fakechat 安装并运行通道](#快速开始)（本地演示）
* [谁可以推送消息](#安全性)：发送者允许列表及配对方式
* [为您的组织启用通道](#企业控制)（适用于团队、企业或控制台组织管理者）
* [通道对比](#频道功能对比)（与网页会话、Slack、MCP 和远程控制的比较）

要构建自定义通道，请参阅 [通道参考文档](/zh/channels-reference)。

## 支持的通道

每个受支持的通道都是一个需要 [Bun](https://bun.sh) 的插件。在连接实际平台之前，如需体验插件流程的实操演示，请尝试 [fakechat 快速入门](#快速开始)。


    查看完整的 [Telegram 插件源码](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/telegram)。


        在 Telegram 中打开 [BotFather](https://t.me/BotFather) 并发送 `/newbot`。为机器人提供一个显示名称和一个以 `bot` 结尾的唯一用户名。复制 BotFather 返回的 token。



        在 Claude Code 中，请运行：
        ```
        /plugin install telegram@claude-plugins-official
        ```
        如果 Claude Code 提示在任何市场中找不到该插件，说明您的插件市场缺失或已过时。请运行 `/plugin marketplace update claude-plugins-official` 刷新市场，或者若您从未添加过，则运行 `/plugin marketplace add anthropics/claude-plugins-official`。然后重新尝试安装。

        安装完成后，运行 `/reload-plugins` 以激活插件的配置命令。



        使用来自BotFather的token运行配置命令：
        ```
        /telegram:configure <token>
        ```
        这会将其保存到 `~/.claude/channels/telegram/.env`。你也可以在启动 Claude Code 之前，在你的 shell 环境中设置 `TELEGRAM_BOT_TOKEN`。



        退出 Claude Code 并使用频道标志重新启动。这将启动 Telegram 插件，该插件开始轮询来自您机器人的消息：
        ```bash
        claude --channels plugin:telegram@claude-plugins-official
        ```



        打开 Telegram 并向您的机器人发送任意消息。该机器人将以配对码作为回复。

        回到 Claude Code，运行：
        ```
        /telegram:access pair <code>
        ```
        然后锁定访问权限，确保只有你的账户可以发送消息：
        ```
        /telegram:access policy allowlist
        ```





    查看完整的 [Discord插件源代码](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord)。


        前往 [Discord 开发者门户](https://discord.com/developers/applications)，点击 **新建应用**，并为其命名。在 **机器人** 部分，创建一个用户名，然后点击 **重置 Token** 并复制该 token。



        在你的机器人设置中，找到 **Privileged Gateway Intents** 并启用 **Message Content Intent**。



        前往 **OAuth2 > URL生成器**。选择 `bot` 作用域并启用以下权限：

        * 查看频道
        * 发送消息
        * 在话题中发送消息
        * 读取消息历史
        * 附加文件
        * 添加表情反应

        打开生成的URL将机器人添加到您的服务器。



        在 Claude Code 中，请运行：
        ```
        /plugin install discord@claude-plugins-official
        ```
        如果 Claude Code 提示在任何市场中找不到该插件，说明您的插件市场缺失或已过时。请运行 `/plugin marketplace update claude-plugins-official` 刷新市场，或者若您从未添加过，则运行 `/plugin marketplace add anthropics/claude-plugins-official`。然后重新尝试安装。

        安装完成后，运行 `/reload-plugins` 以激活插件的配置命令。



        使用您复制的 bot token 执行 configure 命令：
        ```
        /discord:configure <token>
        ```
        这会将其保存到 `~/.claude/channels/discord/.env`。你也可以在启动 Claude Code 之前，在你的 shell 环境中设置 `DISCORD_BOT_TOKEN`。



        退出 Claude Code 并使用 channel 参数重新启动。这会连接 Discord 插件，使您的机器人能够接收并响应消息：
        ```bash
        claude --channels plugin:discord@claude-plugins-official
        ```



        在 Discord 上给你的机器人发私信。机器人会回复一个配对码。

        回到 Claude Code，运行：
        ```
        /discord:access pair <code>
        ```
        然后锁定访问权限，确保只有你的账户可以发送消息：
        ```
        /discord:access policy allowlist
        ```





    查看完整的 [iMessage 插件源码](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/imessage)。

    该 iMessage 通道直接读取您的信息数据库并通过 AppleScript 发送回复。它需要 macOS 系统环境，无需机器人令牌或外部服务。


        `~/Library/Messages/chat.db` 中的消息数据库受 macOS 保护。服务器首次读取时，macOS 会提示请求访问权限：请点击 **允许**。提示中会显示启动 Bun 的应用程序名称，例如 Terminal、iTerm 或您的 IDE。

        如果提示未出现或您点击了**不允许**，请在 **系统设置 > 隐私与安全性 > 完全磁盘访问权限** 中手动授予访问权限，并添加您的终端。否则服务器将立即退出并显示 `authorization denied` 错误。



        在 Claude Code 中，请运行：
        ```
        /plugin install imessage@claude-plugins-official
        ```
        若 Claude Code 报告在所有市场中均未找到该插件，说明您本地的市场可能缺失或已过时。请运行 `/plugin marketplace update claude-plugins-official` 刷新市场，若此前未曾添加过，则运行 `/plugin marketplace add anthropics/claude-plugins-official`。然后重新尝试安装。



        退出 Claude Code 并使用 `--channel` 标志重启：
        ```
        claude --channel <channel-name>
        ```
        ```bash
        claude --channels plugin:imessage@claude-plugins-official
        ```



        在任何已登录您 Apple ID 的设备上打开信息应用，给自己发送一条消息。它立即到达 Claude：自我聊天绕过访问控制，无需设置。




        默认情况下，只有您自己的消息能通过。要让其他联系人能联系到 Claude，请添加他们的用户名：
        ```
        /imessage:access allow +15551234567
        ```
        句柄是 `+国家` 格式的电话号码或类似 `user@example.com` 的 Apple ID 电子邮箱。




你也可以[构建自己的通道](/zh/channels-reference)，用于尚无插件的系统。

## 快速开始

Fakechat 是官方支持的演示通道，它在本地主机上运行聊天界面，无需认证，也无需配置外部服务。

安装并启用 fakechat 后，你可以在浏览器中输入消息，消息将到达你的 Claude Code 会话。Claude 会回复，回复内容会显示回浏览器中。测试完 fakechat 界面后，可以尝试 [Telegram](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/telegram)、[Discord](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord) 或 [iMessage](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/imessage)。

要试用 fakechat 演示，你需要：

* 已[安装并认证](/zh/quickstart#step-1-install-claude-code) Claude Code，并拥有 claude.ai 账户或 Claude Console API 密钥
* 安装了 [Bun](https://bun.sh)。预构建的通道插件是 Bun 脚本。请使用 `bun --version` 检查；如果失败，请[安装 Bun](https://bun.sh/docs/installation)。
* **团队、企业版或受管 Console 组织**：你的管理员必须在受管设置中[启用通道](#企业控制)


    启动 Claude Code 会话并运行安装命令：
    ```text
    /plugin install fakechat@claude-plugins-official
    ```
    若 Claude Code 报告在所有市场中均未找到该插件，说明您本地的市场可能缺失或已过时。请运行 `/plugin marketplace update claude-plugins-official` 刷新市场，若此前未曾添加过，则运行 `/plugin marketplace add anthropics/claude-plugins-official`。然后重新尝试安装。



    退出 Claude Code，然后使用 `--channels` 重新启动，并传入您安装的 fakechat 插件：
    ```bash
    claude --channels plugin:fakechat@claude-plugins-official
    ```
    fakechat 服务器会自动启动。

      您可以向 `--channels` 传递多个插件，用空格分隔。




    打开位于 [http://localhost:8787](http://localhost:8787) 的 fakechat 界面并输入一条消息：
    ```text
    hey, what's in my working directory?
    ```
    消息以 `<channel source="fakechat">` 事件的形式到达您的 Claude Code 会话。Claude 读取它，执行工作，然后调用 fakechat 的 `reply` 工具。答案会显示在聊天界面中。


当您离开终端时，如果Claude遇到权限提示，会话将暂停直至您响应。声明了[权限中继能力](/zh/channels-reference#relay-permission-prompts)的频道服务器可以将这些提示转发给您，以便远程批准或拒绝。对于无人值守使用，[`--dangerously-skip-permissions`](/zh/permission-modes#skip-all-checks-with-bypasspermissions-mode)可完全绕过提示，但仅限在您信任的环境中使用。

当您使用 `-p` 以非交互模式运行频道时，需要终端输入的工具（如多项选择题和计划模式批准）将被禁用，因此会话永远不会因等待输入而停滞。

## 安全性

每个已批准的频道插件都维护一个发送者允许列表：只有您添加的ID才能发送消息，其他所有人将被静默丢弃。

Telegram和Discord通过配对过程初始化列表：

1. 在Telegram或Discord中找到您的机器人并向其发送任意消息
2. 机器人回复一个配对代码
3. 在您的Claude Code会话中，在提示时批准该代码
4. 您的发送者ID将被添加到允许列表

iMessage的工作方式不同：给自己发短信会自动绕过此限制，您可以通过 `/imessage:access allow` 命令按句柄添加其他联系人。

除此之外，您可以通过 `--channels` 控制每个会话启用的服务器，您的组织可以通过claude.ai团队版和企业版计划以及部署托管设置的Console组织中的 [`channelsEnabled`](#企业控制) 控制可用性。

存在于 `.mcp.json` 中并不足以发送消息：服务器还必须在 `--channels` 中被命名。

如果频道声明了[权限中继](/zh/channels-reference#relay-permission-prompts)，允许列表也会对其加以控制。任何能通过该频道回复的人都可以在您的会话中批准或拒绝工具使用，因此请只允许您信任具有该权限的发送者。

## 企业控制

管理员通过两个用户无法覆盖的[托管设置](/zh/settings)控制可用性。默认设置取决于您的身份验证方式：

* **claude.ai团队版和企业版**：频道被阻止，直至管理员启用。
* **使用API密钥身份验证的Anthropic Console**：频道默认允许。只有您的组织部署托管设置时才需要此设置。

在任何情况下，频道都不会运行，直到用户通过 `--channels` 在会话中选择加入。

| 设置                    | 用途                                                                                                                                                                                                                                                        | 未配置时行为                                                                                                                                                                         |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `channelsEnabled`       | 主开关。必须为 `true` 才能让任何频道传递消息。通过 [claude.ai 管理控制台](https://claude.ai/admin-settings/claude-code) 开关或直接在托管设置中设置。关闭时会阻止所有频道，包括开发标志。 | claude.ai 团队版和企业版：频道被阻止。Console：允许频道，除非您的组织部署托管设置，此时频道被阻止直至设置此键 |
| `allowedChannelPlugins` | 频道启用后可以注册哪些插件。设置后将替换Anthropic维护的列表。仅在 `channelsEnabled` 为 `true` 时适用。                                                                                                                                                       | 应用Anthropic默认列表                                                                                                                                                         |

没有组织的Pro和Max用户完全跳过这些检查：频道可用，用户可通过 `--channels` 在每个会话中选择加入。

### 为您的组织启用频道

管理员可以从 [**claude.ai → 管理设置 → Claude Code → 频道**](https://claude.ai/admin-settings/claude-code) 启用频道，或在托管设置中将 `channelsEnabled` 设置为 `true`。

启用后，您组织中的用户可以使用 `--channels` 将频道服务器选择加入单个会话。如果设置被禁用或未设置，MCP服务器仍会连接且其工具可工作，但频道消息不会到达。启动时会警告用户请管理员启用该设置。

### 限制可运行的频道插件

默认情况下，Anthropic维护的允许列表上的任何插件都可以注册为频道。团队版和企业版计划的管理员可以通过在托管设置中设置 `allowedChannelPlugins` 来用自己的列表替换该允许列表。使用此设置可以限制允许哪些官方插件、批准来自您自己内部市场的频道，或两者兼而有之。每个条目指定一个插件及其来源的市场。
```json
{
  "channelsEnabled": true,
  "allowedChannelPlugins": [
    { "marketplace": "claude-plugins-official", "plugin": "telegram" },
    { "marketplace": "claude-plugins-official", "plugin": "discord" },
    { "marketplace": "acme-corp-plugins", "plugin": "internal-alerts" }
  ]
}
```
当设置了 `allowedChannelPlugins` 时，它会完全取代 Anthropic 的允许列表：仅有所列的插件可以注册。将其保持未设置状态，则会回退到默认的 Anthropic 允许列表。空数组会阻止所有频道插件进入允许列表，但 `--dangerously-load-development-channels` 仍可绕过它进行本地测试。若要完全阻止频道，包括开发标志，请保持 `channelsEnabled` 未设置。

此设置需要 `channelsEnabled: true`。如果用户传递了一个不在您列表中的插件给 `--channels`，Claude Code 会正常启动，但该频道不会注册，且启动通知会说明该插件不在组织的批准列表中。

## 研究预览

频道是研究预览功能。可用性正逐步推出，`--channels` 标志的语法和协议规范可能会根据反馈进行更改。

在预览期间，`--channels` 仅接受来自 Anthropic 维护的允许列表或您组织允许列表（如果管理员已设置 [`allowedChannelPlugins`](#限制可运行的频道插件)）的插件。[claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins) 中的频道插件是默认的批准集。如果您传递了不在有效允许列表中的内容，Claude Code 会正常启动，但该频道不会注册，启动通知会告知您原因。

要测试您正在构建的频道，请使用 `--dangerously-load-development-channels`。有关测试您自定义构建的频道的信息，请参阅[在研究预览期间测试](/zh/channels-reference#test-during-the-research-preview)。

请在 [Claude Code GitHub 仓库](https://github.com/anthropics/claude-code/issues) 报告问题或提供反馈。

## 频道功能对比

Claude Code 有几项功能连接到终端外部的系统，每种适用于不同类型的工作：

| 功能                                               | 作用                                                                 | 适用场景                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Web 版 Claude Code](/zh/claude-code-on-the-web)   | 在全新的云端沙箱中运行任务，从 GitHub 克隆                           | 委派独立的异步工作，稍后检查                                 |
| [Slack 中的 Claude](/zh/slack)                     | 在频道或线程中通过 `@Claude` 提及启动一个网络会话                   | 直接从团队对话上下文启动任务                                 |
| 标准 [MCP 服务器](/zh/mcp)                        | Claude 在任务期间查询它；不会向会话推送任何内容                     | 让 Claude 按需访问以读取或查询系统                           |
| [远程控制](/zh/remote-control)                     | 您通过 claude.ai 或 Claude 移动应用驱动您的本地会话                 | 在离开办公桌时，引导正在进行的会话                           |

频道填补了该列表中的空白，它将来自非 Claude 源的事件推送到您已运行的本地会话中。

* **聊天桥接**：通过 Telegram、Discord 或 iMessage 从手机向 Claude 提问，答案会在同一个聊天中返回，而任务在您的机器上针对您的真实文件运行。
* **[Webhook 接收器](/zh/channels-reference#example-build-a-webhook-receiver)**：来自 CI、错误跟踪器、部署管道或其他外部服务的 webhook 会在 Claude 已打开您的文件并记得您正在调试的内容时到达。

## 后续步骤

频道运行后，请探索这些相关功能：

* [构建您自己的频道](/zh/channels-reference)，用于尚未有插件的系统
* [远程控制](/zh/remote-control)，通过手机驱动本地会话，而不是将事件转发到其中
* [定时任务](/zh/scheduled-tasks)，使用定时器轮询而不是响应推送的事件