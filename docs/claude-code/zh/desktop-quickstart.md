> ## 文档索引
> 请访问以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# 开始使用桌面应用

> 在桌面端安装 Claude Code 并开启您的首个编码会话

桌面应用为您提供带有图形界面的 Claude Code，专为并行运行多个会话而设计：通过侧边栏管理并行工作，采用可拖放的布局并集成终端与文件编辑器，支持可视化差异审查、实时应用预览、GitHub PR 监控及自动合并，并可设置定时任务。无需使用终端。


    适用于 Intel 和 Apple Silicon 的通用构建



    适用于 x64 处理器


对于 Windows ARM64 系统，请下载 [ARM64 安装程序](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs)。桌面应用在 Linux 上不受支持；请改用 [CLI](/zh/quickstart)。

  Claude Code 需要 [Pro、Max、Team 或 Enterprise 订阅](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=desktop_quickstart_pricing)。

本页面将引导您完成应用的安装并启动您的首次会话。如果您已完成设置，请参阅 [使用 Claude Code 桌面版](/zh/desktop) 获取完整参考。

桌面版应用包含三个标签页：

*   **聊天**：通用对话，无文件访问权限，类似于 claude.ai。
*   **协作**：一个自主运行的后台代理，在具有独立环境的云虚拟机中处理任务。它可以在您处理其他工作时独立运行。
*   **代码**：一个可直接访问您本地文件的交互式编码助手。您可以实时审查和批准每一次更改。

聊天和协作功能在 [Claude 桌面版支持文章](https://support.claude.com/en/collections/16163169-claude-desktop) 中有介绍。本页面将重点介绍 **代码** 标签页。

## 安装


    从上方链接下载适合您平台的安装程序并运行它。在macOS上从应用程序文件夹中启动Claude，或在Windows上从开始菜单启动，然后使用您的Anthropic账户登录。



    点击顶部中央的 **Code** 标签页。如果点击 Code 后提示升级，你需要先[订阅付费方案](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=desktop_quickstart_upgrade)。如果提示在线登录，请完成登录并重启应用。如果出现 403 错误，请参阅[认证故障排除](/zh/desktop#403-or-authentication-errors-in-the-code-tab)。


桌面应用已包含 Claude Code，无需单独安装 Node.js 或命令行界面。若要在终端使用 `claude`，需单独安装命令行界面。详见 [命令行界面入门指南](/zh/quickstart)。

## 开始首次会话

在“代码”标签页中，选择一个项目并给 Claude 布置任务。


    选择**本地**以直接使用您的文件在您的计算机上运行 Claude。点击**选择文件夹**并选择您的项目目录。

      从你熟悉的小项目开始。这是最快了解 Claude Code 能力的方式。在 Windows 上，必须安装 [Git](https://git-scm.com/downloads/win) 才能使用本地会话。大多数 Mac 默认已包含 Git。

    你也可以选择：

    * **远程**：在 Anthropic 的云基础设施上运行会话，即使关闭应用后会话仍会继续。远程会话使用的基础设施与 [网络版 Claude Code](/zh/claude-code-on-the-web) 相同。
    * **SSH**：通过 SSH 连接到远程机器，例如你自己的服务器、云虚拟机或开发容器。首次连接时，桌面版会自动在远程机器上安装 Claude Code。



    在发送按钮旁边的下拉菜单中选择一个模型。请查看[模型](/zh/model-config#available-models)页面，了解Opus、Sonnet和Haiku的对比。稍后您可以从同一处下拉菜单中修改所选模型。



    输入您想让 Claude 执行的操作：

    * `找到 TODO 注释并修复它`
    * `为主函数添加测试`
    * `创建一份包含此代码库指令的 CLAUDE.md 文件`

    一个[会话](/zh/desktop#work-in-parallel-with-sessions)是您与 Claude 关于代码的一次对话。每个会话都会跟踪其自身的上下文和更改，因此您可以同时处理多个任务而不会相互干扰。



    默认情况下，代码标签页处于[询问权限模式](/zh/desktop#choose-a-permission-mode)，Claude 会提出更改建议并等待您批准后才应用。您将看到：

    1. 显示每个文件具体变更内容的[差异视图](/zh/desktop#review-changes-with-diff-view)
    2. 用于批准或拒绝每项更改的接受/拒绝按钮
    3. Claude 处理请求时的实时更新

    如果您拒绝某项更改，Claude 会询问您希望如何调整。在您接受之前，您的文件不会被修改。


## 接下来做什么？

您已完成了首次编辑。要全面了解桌面版的所有功能，请参阅[使用 Claude Code 桌面版](/zh/desktop)。以下是一些可以尝试的后续操作。

**随时中断和引导。** 您可以在任何时候重定向 Claude。点击停止按钮立即中断，或者输入纠正内容并按 **Enter** 键发送，而不会停止正在运行的操作。无论哪种方式，您都不必等待它完成或重新开始。

**为 Claude 提供更多上下文。** 在提示框中输入 `@文件名` 可以将特定文件拉入对话，使用附件按钮附加图像和 PDF，或直接将文件拖放到提示框中。Claude 获得的上下文越多，结果就越好。请参阅[添加文件和上下文](/zh/desktop#add-files-and-context-to-prompts)。

**使用技能处理可重复的任务。** 输入 `/` 或点击 **+** → **斜杠命令** 可以浏览[内置命令](/zh/commands)、[自定义技能](/zh/skills)和插件技能。技能是可重用的提示词，您可以在需要时调用它们，例如代码审查检查清单或部署步骤。

**提交前审查更改。** 在 Claude 编辑文件后，会出现一个 `+12 -1` 指示器。点击它可以打开[差异视图](/zh/desktop#review-changes-with-diff-view)，逐文件审查修改，并对特定行进行评论。Claude 会阅读您的评论并进行修改。点击 **审查代码** 可以让 Claude 自己评估差异并留下内联建议。

**调整您的控制程度。** 您的[权限模式](/zh/desktop#choose-a-permission-mode)控制着平衡。请求权限（默认）模式要求在每次编辑前获得批准。自动接受编辑模式会自动接受文件编辑以实现更快的迭代。规划模式让 Claude 制定方法而不触碰任何文件，这在大型重构前很有用。

**添加插件以获得更多功能。** 点击提示框旁边的 **+** 按钮并选择 **插件** 来浏览和安装[插件](/zh/desktop#install-plugins)，这些插件可添加技能、代理、MCP 服务器等。

**安排您的工作区。** 将聊天、差异、终端、文件和预览窗格拖放到您喜欢的任何布局中。使用 **Ctrl+\`** 打开终端，在会话的同时运行命令，或点击文件路径在文件窗格中打开它。请参阅[安排您的工作区](/zh/desktop#arrange-your-workspace)。

**预览您的应用。** 点击 **预览** 下拉菜单可以直接在桌面版中运行您的开发服务器。Claude 可以查看正在运行的应用、测试端点、检查日志并根据所见内容进行迭代。请参阅[预览您的应用](/zh/desktop#preview-your-app)。

**跟踪您的拉取请求。** 打开 PR 后，Claude Code 会监控 CI 检查结果，并可以自动修复失败或在所有检查通过后合并 PR。请参阅[监控拉取请求状态](/zh/desktop#monitor-pull-request-status)。

**让 Claude 按计划执行。** 设置[定时任务](/zh/desktop-scheduled-tasks)以定期自动运行 Claude：每天早上的代码审查、每周的依赖审计，或从您连接的工具中提取信息的简报。

**准备就绪时扩大规模。** 从侧边栏打开[并行会话](/zh/desktop#work-in-parallel-with-sessions)可以同时处理多个任务，每个任务都在其自己的 Git 工作树中进行，打开[任务窗格](/zh/desktop#watch-background-tasks)可以查看会话正在运行的子代理和后台命令。打开[侧边聊天](/zh/desktop#ask-a-side-question-without-derailing-the-session)可以在不影响主线程的情况下提问。将[长时间运行的工作发送到云端](/zh/desktop#run-long-running-tasks-remotely)，这样即使您关闭应用程序，工作也会继续，或者如果任务耗时超过预期，可以在[网页或 IDE 中继续会话](/zh/desktop#continue-in-another-surface)。[连接外部工具](/zh/desktop#extend-claude-code)如 GitHub、Slack 和 Linear，将您的工作流程整合在一起。

## 来自 CLI？

桌面版使用与 CLI 相同的引擎，但提供了图形界面。您可以在同一项目上同时运行两者，并且它们共享配置（CLAUDE.md 文件、MCP 服务器、钩子、技能和设置）。要了解功能、标志等效项以及桌面版中不可用的内容的完整比较，请参阅[CLI 对比](/zh/desktop#coming-from-the-cli)。

## 后续内容

* [使用 Claude Code 桌面版](/zh/desktop)：权限模式、并行会话、差异视图、连接器和企业配置
* [故障排除](/zh/desktop#troubleshooting)：常见错误和设置问题的解决方案
* [最佳实践](/zh/best-practices)：编写有效提示词并充分利用 Claude Code 的技巧
* [常见工作流](/zh/common-workflows)：调试、重构、测试等教程