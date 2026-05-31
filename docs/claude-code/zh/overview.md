> ## 文档索引
> 获取完整文档索引请访问：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再深入探索。

# 概述

> Claude Code 是一款智能编程工具，可读取您的代码库、编辑文件、运行命令并与开发工具集成。支持在终端、IDE、桌面应用和浏览器中使用。

Claude Code 是一款由人工智能驱动的编程助手，可协助您构建功能、修复缺陷并自动化开发任务。它能理解您的整个代码库，并可跨多个文件与工具协同工作以完成任务。

## 快速开始

选择您的使用环境开始体验。大多数平台需要 [Claude 订阅](https://claude.com/pricing?utm_source=claude_code&medium=docs&utm_content=overview_pricing) 或 [Anthropic 控制台](https://console.anthropic.com/) 账户。终端 CLI 和 VS Code 还支持[第三方集成](/zh/third-party-integrations)。


    功能齐全的 CLI 工具，可直接在终端中使用 Claude Code。通过命令行编辑文件、运行命令以及管理整个项目。

    要安装 Claude Code，请使用以下其中一种方式：


        **macOS、Linux、WSL：**
        ```bash
        curl -fsSL https://claude.ai/install.sh | bash
        ```
        **Windows PowerShell：**
        ```powershell
        irm https://claude.ai/install.ps1 | iex
        ```
        **Windows CMD:**
        ```batch
        curl -L https://claude.ai/install.sh -o install-claude-code.bat && call install-claude-code.bat
        ```
        ```batch
        curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
        ```
        如果你看到 `The token '&&' is not a valid statement separator`，说明你正在 PowerShell 环境中，而非 CMD。如果你看到 `'irm' is not recognized as an internal or external command`，则说明你正在 CMD 环境中，而非 PowerShell。当你在 PowerShell 中时，提示符会显示 `PS C:\`，而在 CMD 中则只显示 `C:\` 且没有 `PS`。

        在原生 Windows 系统上，推荐安装 [Git for Windows](https://git-scm.com/downloads/win)，这样 Claude Code 就可以使用 Bash 工具。如果未安装 Git for Windows，Claude Code 将会使用 PowerShell 作为 Shell 工具。WSL 环境不需要安装 Git for Windows。

          原生安装会在后台自动更新，以确保您始终使用最新版本。




        ```bash
        brew install --cask claude-code
        ```
        Homebrew 提供两种安装包。`claude-code` 追踪稳定发布渠道，该渠道通常会滞后约一周，并跳过存在重大回归问题的版本。`claude-code@latest` 追踪最新发布渠道，新版本发布后立即获得。

          Homebrew 安装不会自动更新。请根据您安装的 cask 版本运行 `brew upgrade claude-code` 或 `brew upgrade claude-code@latest`，以获取最新功能和安全修复。




        ```powershell
        winget install Anthropic.ClaudeCode
        ```


          WinGet 安装不会自动更新。请定期运行 `winget upgrade Anthropic.ClaudeCode` 以获取最新功能和安全修复。



    您也可以通过[apt, dnf, 或 apk](/zh/setup#install-with-linux-package-managers)在 Debian、Fedora、RHEL 和 Alpine 上安装。

    然后，在任意项目中启动 Claude Code：
    ```bash
    cd your-project
    claude
    ```
    首次使用时，系统将提示您登录。就这样！[继续快速开始 →](/zh/quickstart)

      有关安装选项、手动更新或卸载说明，请参阅[高级设置](/zh/setup)。如果遇到问题，请访问[安装故障排除](/zh/troubleshoot-install)。




    VS Code 扩展在编辑器中提供内联差异、@-提及、方案审阅和对话历史记录功能。

    * [为 VS Code 安装](vscode:extension/anthropic.claude-code)
    * [为 Cursor 安装](cursor:extension/anthropic.claude-code)

    或在扩展视图中搜索 "Claude Code"（Mac 上按 `Cmd+Shift+X`，Windows/Linux 上按 `Ctrl+Shift+X`）。安装完成后，打开命令面板（`Cmd+Shift+P` / `Ctrl+Shift+P`），输入 "Claude Code"，然后选择 **在新标签页中打开**。

    [开始使用 VS Code →](/zh/vs-code#get-started)



    一款独立应用，可在您的 IDE 或终端之外运行 Claude Code。可视化查看差异，并行运行多个会话，安排定期任务，并启动云端会话。

    下载并安装：

    *   [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code\&utm_medium=docs)（Intel 和 Apple Silicon）
    *   [Windows](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs)（x64）
    *   [Windows ARM64](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs)

    安装完成后，启动 Claude，登录并点击 **Code** 选项卡开始编码。需要[付费订阅](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=overview_desktop_pricing)。

    [了解更多关于桌面应用 →](/zh/desktop-quickstart)



    在浏览器中直接运行 Claude Code，无需本地设置。可以启动长时间运行的任务并随时查看结果，操作本地未有的代码仓库，或并行运行多个任务。适用于桌面浏览器和 Claude iOS 应用。

    开始编程：[claude.ai/code](https://claude.ai/code)。

    [在网页端开始使用 →](/zh/web-quickstart)



    适用于 IntelliJ IDEA、PyCharm、WebStorm 及其他 JetBrains IDE 的插件，具备交互式差异查看与选区上下文共享功能。

    从 JetBrains Marketplace 安装 [Claude Code 插件](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) 并重启 IDE。

    [开始使用 JetBrains →](/zh/jetbrains)


## 你可以使用Claude Code完成以下任务：

以下是一些你可以使用Claude Code的方式：
-   使用**子代理**在不同的工作树中同时处理多个文件
-   将Claude Code集成到你的**工作流**和**自定义工具**中
-   使用**GitHub Actions**自动化你的开发任务
-   创建**自定义钩子**以在特定事件发生时执行操作
-   设置**计划任务**以自动运行Claude Code
-   创建**自定义斜杠命令**以扩展Claude Code的功能


    Claude Code 能处理那些消耗你时间的繁琐任务：为未测试的代码编写测试、修复项目中的 lint 错误、解决合并冲突、更新依赖项以及撰写发布说明。
    ```bash
    claude "write tests for the auth module, run them, and fix any failures"
    ```



    用通俗语言描述你的需求。Claude Code 会规划方案、跨多个文件编写代码，并验证其有效性。

    遇到错误时，可粘贴错误信息或描述症状。Claude Code 会在你的代码库中追踪问题，定位根本原因并实施修复。更多示例参见[常见工作流](/zh/common-workflows)。



    Claude Code 可以直接与 git 交互。它会暂存更改、写提交信息、创建分支并打开拉取请求。
    ```bash
    claude "commit my changes with a descriptive message"
    ```
    在CI中，你可以通过[GitHub Actions](/zh/github-actions)或[GitLab CI/CD](/zh/gitlab-ci-cd)实现代码审查和问题分类的自动化。



    [模型上下文协议（MCP）](/zh/mcp)是一项连接AI工具与外部数据源的开放标准。通过MCP，Claude Code可以读取Google Drive中的设计文档、更新Jira中的票据、从Slack提取数据，或使用您自定义的工具。



    [`CLAUDE.md`](/zh/memory) 是你添加到项目根目录的 Markdown 文件，Claude Code 会在每次会话开始时读取它。可以用它来设置编码标准、架构决策、首选库和审查清单。Claude 在工作过程中还会构建[自动记忆](/zh/memory#auto-memory)，在会话间保存构建命令和调试经验等学习成果，无需你手动编写任何内容。

    创建[技能](/zh/skills)可将可复用的工作流打包，供团队共享，例如 `/review-pr` 或 `/deploy-staging`。

    [钩子](/zh/hooks)允许你在 Claude Code 操作前后运行 shell 命令，例如在每次文件编辑后自动格式化，或在提交前运行 lint 检查。



    同时[生成多个Claude Code子代理](/zh/sub-agents)来协同处理任务的不同部分。主代理负责协调工作、分配子任务并合并结果。

    若要同时运行多个完整会话并在同一界面查看，请使用[后台代理](/zh/agent-view)。如需完全自定义的工作流，[Agent SDK](/zh/agent-sdk/overview)允许您基于Claude Code的工具与能力构建专属代理，并对编排流程、工具访问权限进行完全控制。



    Claude Code 是可组合的，并遵循 Unix 哲学。你可以将日志管道输入其中，在 CI 中运行它，或与其他工具链式组合：
    ```bash
    # Analyze recent log output
    tail -200 app.log | claude -p "Slack me if you see any anomalies"

    # Automate translations in CI
    claude -p "translate new strings into French and raise a PR for review"

    # Bulk operations across files
    git diff main --name-only | claude -p "review these changed files for security issues"
    ```
    有关命令和标志的完整列表，请参阅 [CLI 参考](/zh/cli-reference)。



    在定期计划中运行 Claude 以自动化重复工作：清晨的 PR 审查、过夜的 CI 失败分析、每周依赖项审计，或在 PR 合并后同步文档。

    * [例程](/zh/routines) 运行在 Anthropic 管理的基础设施上，因此即使您的计算机关闭也会持续运行。它们也可以通过 API 调用或 GitHub 事件触发。您可以通过网页、桌面应用或在 CLI 中运行 `/schedule` 来创建。
    * [桌面端定时任务](/zh/desktop-scheduled-tasks) 运行在您的机器上，可直接访问本地文件和工具。
    * [`/loop`](/zh/scheduled-tasks) 在 CLI 会话中重复提示词，以便快速轮询。



    会话不受单一界面限制。根据上下文变化，在不同环境间移动工作：

    * 离开工位后，可通过[远程控制](/zh/remote-control)从手机或任何浏览器继续工作
    * 在手机上向[Dispatch](/zh/desktop#sessions-from-dispatch)发送任务指令，即可打开其创建的桌面会话
    * 在[网页版](/zh/claude-code-on-the-web)或[iOS应用](https://apps.apple.com/app/claude-by-anthropic/id6473753684)启动耗时任务后，使用 `claude --teleport` 命令拉取到终端
    * 通过 `/desktop` 命令将终端会话转交至[桌面应用](/zh/desktop)，进行可视化差异审查
    * 从团队聊天中路由任务：在[Slack](/zh/slack)中提及 `@Claude` 并发送错误报告，即可获取对应的代码提交


## 在任何地方使用 Claude Code

每个界面都连接到同一个底层的 Claude Code 引擎，因此你的 CLAUDE.md 文件、设置和 MCP 服务器可以在所有界面中通用。

除了上面的 [终端](/zh/quickstart)、[VS Code](/zh/vs-code)、[JetBrains](/zh/jetbrains)、[桌面应用](/zh/desktop) 和 [网页版](/zh/claude-code-on-the-web) 环境外，Claude Code 还集成了 CI/CD、聊天和浏览器工作流：

| 我想要...                                                     | 最佳选项                                                                                                              |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 在手机或其他设备上继续本地会话                                | [远程控制](/zh/remote-control)                                                                                        |
| 将来自 Telegram、Discord、iMessage 或我自己 webhook 的事件推送到会话中 | [频道](/zh/channels)                                                                                                  |
| 在本地启动任务，在移动端继续                                  | [网页版](/zh/claude-code-on-the-web) 或 [Claude iOS 应用](https://apps.apple.com/app/claude-by-anthropic/id6473753684) |
| 在定期计划中运行 Claude                                       | [例程](/zh/routines) 或 [桌面计划任务](/zh/desktop-scheduled-tasks)                                                   |
| 自动化 PR 审查和问题分类                                      | [GitHub Actions](/zh/github-actions) 或 [GitLab CI/CD](/zh/gitlab-ci-cd)                                              |
| 在每个 PR 上获得自动代码审查                                  | [GitHub 代码审查](/zh/code-review)                                                                                    |
| 将 Slack 上的 bug 报告路由到拉取请求                          | [Slack](/zh/slack)                                                                                                    |
| 调试实时 Web 应用程序                                         | [Chrome](/zh/chrome)                                                                                                  |
| 为你自己的工作流构建自定义代理                                | [Agent SDK](/zh/agent-sdk/overview)                                                                                   |

## 后续步骤

安装好 Claude Code 后，这些指南可以帮助你深入了解。

*   [快速入门](/zh/quickstart)：引导你完成第一个真实任务，从探索代码仓库到提交修复
*   [存储指令和记忆](/zh/memory)：通过 CLAUDE.md 文件和自动记忆功能赋予 Claude 持久性指令
*   [常见工作流](/zh/common-workflows)和[最佳实践](/zh/best-practices)：充分利用 Claude Code 的模式
*   [设置](/zh/settings)：为你的工作流定制 Claude Code
*   [故障排除](/zh/troubleshooting)：常见问题的解决方案
*   [code.claude.com](https://code.claude.com/)：演示、定价和产品详情