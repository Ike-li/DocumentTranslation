> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 平台与集成

> 选择在哪里运行 Claude Code 以及将其连接到什么。比较 CLI、桌面端、VS Code、JetBrains、Web、移动端，以及 Chrome、Slack 和 CI/CD 等集成。

Claude Code 在每个平台上运行相同的底层引擎，但每个界面都针对不同的工作方式进行了调整。此页面帮助你为工作流选择合适的平台，并连接你已经使用的工具。

## 在哪里运行 Claude Code

根据你喜欢的工作方式和项目所在位置选择平台。

| 平台                              | 最适合                                                                                             | 提供的功能                                                                                                                                                                                  |
| :-------------------------------- | :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CLI](/zh/quickstart)             | 终端工作流、脚本编写、远程服务器                                                                   | 完整功能集、[Agent SDK](/zh/headless)、macOS 上的[计算机使用](/zh/computer-use)（Pro 和 Max）、第三方提供商                                                                                 |
| [桌面端](/zh/desktop)             | 可视化审查、并行会话、托管设置                                                                     | 差异查看器、应用预览、Pro 和 Max 上的[计算机使用](/zh/desktop#let-claude-use-your-computer)和 [Dispatch](/zh/desktop#sessions-from-dispatch)                                                  |
| [VS Code](/zh/vs-code)            | 在 VS Code 内工作，无需切换到终端                                                                  | 内联差异、集成终端、文件上下文                                                                                                                                                              |
| [JetBrains](/zh/jetbrains)        | 在 IntelliJ、PyCharm、WebStorm 或其他 JetBrains IDE 内工作                                         | 差异查看器、选择共享、终端会话                                                                                                                                                              |
| [Web](/zh/claude-code-on-the-web) | 不需要太多干预的长时间运行任务，或离线时应继续执行的工作                                           | Anthropic 托管的云服务，断开连接后继续运行                                                                                                                                                  |
| 移动端                            | 在离开电脑时启动和监控任务                                                                         | iOS 和 Android 版 Claude 应用的云会话、本地会话的[远程控制](/zh/remote-control)、Pro 和 Max 上到桌面端的 [Dispatch](/zh/desktop#sessions-from-dispatch)                                       |

CLI 是终端原生工作最完整的界面：脚本编写和 Agent SDK 仅在 CLI 中可用。第三方提供商也可在 [VS Code](/zh/vs-code#use-third-party-providers) 中使用。企业[桌面端](/zh/desktop)部署支持 Vertex AI 和网关提供商；如需使用 Bedrock 或 Foundton，请使用 CLI 或 VS Code 而非桌面端。桌面端和 IDE 扩展用部分 CLI 专有功能换取了可视化审查和更紧密的编辑器集成。Web 在 Anthropic 的云中运行，因此任务在断开连接后仍会继续。移动端是这些云会话或通过远程控制连接的本地会话的轻量客户端，并可通过 Dispatch 将任务发送到桌面端。

你可以在同一项目上混合使用不同界面。配置、项目记忆和 MCP 服务器在所有本地界面间共享。

## 连接你的工具

集成让 Claude 能够与代码库之外的服务协作。

| 集成                               | 功能                                                   | 适用场景                                                       |
| :--------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------- |
| [Chrome](/zh/chrome)               | 使用你已登录的会话控制浏览器                           | 测试 Web 应用、填写表单、无需 API 即可自动化网站               |
| [GitHub Actions](/zh/github-actions) | 在你的 CI 流水线中运行 Claude                         | 自动化 PR 审查、问题分类、定时维护                              |
| [GitLab CI/CD](/zh/gitlab-ci-cd)   | 与 GitHub Actions 相同，适用于 GitLab                  | GitLab 上的 CI 驱动自动化                                      |
| [代码审查](/zh/code-review)        | 自动审查每个 PR                                        | 在人工审查前捕获 Bug                                           |
| [Slack](/zh/slack)                 | 响应频道中的 `@Claude` 提及                            | 将团队聊天中的 Bug 报告转化为拉取请求                          |

对于此处未列出的集成，[MCP 服务器](/zh/mcp)和[连接器](/zh/desktop#connect-external-tools)让你几乎可以连接任何服务：Linear、Notion、Google Drive 或你自己的内部 API。

## 离开终端时继续工作

Claude Code 提供了多种在你不在终端时继续工作的方式。它们在触发方式、Claude 运行位置以及需要多少设置方面有所不同。

|                                                | 触发方式                                                                                       | Claude 运行位置                                                                              | 设置                                                                                                                                 | 最适合                                                      |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| [Dispatch](/zh/desktop#sessions-from-dispatch) | 从 Claude 移动应用发送任务消息                                                                | 你的机器（桌面端）                                                                           | [将移动应用与桌面端配对](https://support.claude.com/en/articles/13947068)                                                              | 离开时委派工作，最少设置                                      |
| [远程控制](/zh/remote-control)                 | 从 [claude.ai/code](https://claude.ai/code) 或 Claude 移动应用驱动正在运行的会话              | 你的机器（CLI 或 VS Code）                                                                   | 运行 `claude remote-control`                                                                                                         | 从其他设备引导进行中的工作                                    |
| [渠道](/zh/channels)                           | 从 Telegram 或 Discord 等聊天应用或你自己的服务器推送事件                                      | 你的机器（CLI）                                                                              | [安装渠道插件](/zh/channels#quickstart)或[构建你自己的渠道](/zh/channels-reference)                                                    | 响应外部事件，如 CI 失败或聊天消息                            |
| [Slack](/zh/slack)                             | 在团队频道中提及 `@Claude`                                                                   | Anthropic 云                                                                                 | [安装 Slack 应用](/zh/slack#setting-up-claude-code-in-slack)并启用 [Web 版 Claude Code](/zh/claude-code-on-the-web)                    | 来自团队聊天的 PR 和审查                                      |
| [定时任务](/zh/scheduled-tasks)                | 设置时间表                                                                                   | [CLI](/zh/scheduled-tasks)、[桌面端](/zh/desktop-scheduled-tasks) 或[云](/zh/routines)       | 选择频率                                                                                                                             | 定期自动化，如每日审查                                        |

如果不确定从哪里开始，[安装 CLI](/zh/quickstart) 并在项目目录中运行它。如果你不想使用终端，[桌面端](/zh/desktop-quickstart)为你提供相同的引擎和图形界面。

## 相关资源

### 平台

* [CLI 快速入门](/zh/quickstart)：在终端中安装并运行你的第一个命令
* [桌面端](/zh/desktop)：可视化差异审查、并行会话、计算机使用和 Dispatch
* [VS Code](/zh/vs-code)：编辑器内的 Claude Code 扩展
* [JetBrains](/zh/jetbrains)：适用于 IntelliJ、PyCharm 和其他 JetBrains IDE 的扩展
* [Web 版 Claude Code](/zh/claude-code-on-the-web)：断开连接后继续运行的云会话
* 移动端：适用于 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 和 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) 的 Claude 应用，用于在离开电脑时启动和监控任务

### 集成

* [Chrome](/zh/chrome)：使用你已登录的会话自动化浏览器任务
* [计算机使用](/zh/computer-use)：让 Claude 在 macOS 上打开应用并控制屏幕
* [GitHub Actions](/zh/github-actions)：在 CI 流水线中运行 Claude
* [GitLab CI/CD](/zh/gitlab-ci-cd)：适用于 GitLab 的相同功能
* [代码审查](/zh/code-review)：每个拉取请求的自动审查
* [Slack](/zh/slack)：从团队聊天发送任务，获得 PR 回复

### 远程访问

* [Dispatch](/zh/desktop#sessions-from-dispatch)：从手机发送任务消息，可以生成桌面端会话
* [远程控制](/zh/remote-control)：从手机或浏览器驱动正在运行的会话
* [渠道](/zh/channels)：将聊天应用或你自己服务器的事件推送到会话中
* [定时任务](/zh/scheduled-tasks)：按定期计划运行提示词
