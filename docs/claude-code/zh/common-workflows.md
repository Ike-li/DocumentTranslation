> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引。
> 在进一步探索前，请使用此文件查看所有可用页面。

# 常见工作流

> 本指南逐步介绍如何使用 Claude Code 探索代码库、修复错误、重构、测试及其他日常任务。

本页收集了日常开发的简明指南。关于提示词和上下文管理的更高层次指导，请参阅 [最佳实践](/en/best-practices)。

本页涵盖：

* [提示词配方](#prompt-recipes)，用于探索代码、修复错误、重构、测试、PR 和文档编写
* [恢复之前的会话](#resume-previous-conversations)，以便任务可以跨越多个时间段
* [使用工作树运行并行会话](#run-parallel-sessions-with-worktrees)，避免并发编辑冲突
* [编辑前先规划](#plan-before-editing)，在更改写入磁盘前进行审阅
* [将研究委托给子代理](#delegate-research-to-subagents)，保持主上下文清晰
* [将 Claude 管道输入脚本](#pipe-claude-into-scripts)，用于 CI 和批处理

## 提示词配方

这些是用于探索陌生代码、调试、重构、编写测试和创建 PR 等日常任务的提示词模式。它们适用于任何 Claude Code 界面；可根据您的项目调整措辞。

### 理解新代码库

关于在 monorepo 或大型代码库中配置 Claude Code，请参阅 [Monorepo 与大型仓库](/en/large-codebases)。

#### 快速概览代码库

假设您刚加入一个新项目，需要快速了解其结构。


    ```bash
    cd /path/to/project 
    ```



    ```bash
    claude 
    ```



    ```text
    give me an overview of this codebase
    ```



    ```text
    explain the main architecture patterns used here
    ```

    ```text
    what are the key data models?
    ```

    ```text
    how is authentication handled?
    ```




  技巧：

  * 从宽泛问题开始，然后缩小到特定领域
  * 询问项目中使用的编码规范和模式
  * 请求项目特定术语的词汇表

#### 查找相关代码

假设你需要定位与特定功能或特性相关的代码。


    ```text
    find the files that handle user authentication
    ```



    ```text
    how do these authentication files work together?
    ```



    ```text
    trace the login process from front-end to database
    ```




  小贴士：

  * 具体说明您要查找的内容
  * 使用项目中的领域语言
  * 为您的编程语言安装[代码智能插件](/en/discover-plugins#code-intelligence)，让Claude能够精确进行“转到定义”和“查找引用”导航

### 高效修复错误

假设您遇到一条错误消息，需要找到并修复其源头。


    ```text
    I'm seeing an error when I run npm test
    ```



    ```text
    suggest a few ways to fix the @ts-ignore in user.ts
    ```



    ```text
    update user.ts to add the null check you suggested
    ```




  提示：

  * 告诉 Claude 命令以重现问题并获取堆栈跟踪
  * 提及重现错误所需的步骤
  * 让 Claude 知道错误是间歇性还是持续性的

***

### 重构代码

假设你需要将旧代码更新为使用现代模式和实践。


    ```text
    find deprecated API usage in our codebase
    ```



    ```text
    suggest how to refactor utils.js to use modern JavaScript features
    ```



    ```text
    refactor utils.js to use ES2024 features while maintaining the same behavior
    ```



    ```text
    run tests for the refactored code
    ```




  提示：

  * 让Claude说明现代方法的好处
  * 要求在需要时保持更改的向后兼容性
  * 以可测试的小增量进行重构

### 使用测试

假设您需要为未覆盖的代码添加测试。


    ```text
    find functions in NotificationsService.swift that are not covered by tests
    ```



    ```text
    add tests for the notification service
    ```



    ```text
    add test cases for edge conditions in the notification service
    ```



    ```text
    run the new tests and fix any failures
    ```


Claude 能够生成符合你项目现有模式和规范的测试。要求生成测试时，请具体说明你想要验证的行为。Claude 会检查你现有的测试文件，以匹配正在使用的风格、框架和断言模式。

为获得全面覆盖，可以让 Claude 识别你可能遗漏的边界情况。Claude 能分析你的代码路径，并针对容易忽略的错误条件、边界值和意外输入建议测试。

***

### 创建拉取请求

你可以直接要求 Claude 创建拉取请求（“为我的更改创建一个 PR”），也可以引导 Claude 逐步完成：


    ```text
    summarize the changes I've made to the authentication module
    ```



    ```text
    create a pr
    ```



    ```text
    enhance the PR description with more context about the security improvements
    ```


当你使用 `gh pr create` 创建 PR 时，该会话会自动关联到该 PR。若需稍后返回此会话，可运行 `claude --from-pr <number>` 或将 PR URL 粘贴到 [`/resume` 选择器](/en/sessions#use-the-session-picker) 的搜索栏中。

  在提交前审查 Claude 生成的 PR（拉取请求），并请 Claude 突出显示潜在风险或注意事项。

### 处理文档

假设你需要为代码添加或更新文档。


    ```text
    find functions without proper JSDoc comments in the auth module
    ```



    ```text
    add JSDoc comments to the undocumented functions in auth.js
    ```



    ```text
    improve the generated documentation with more context and examples
    ```



    ```text
    check if the documentation follows our project standards
    ```




  提示：

  * 明确指定所需的文档风格（例如 JSDoc、docstrings 等）
  * 要求在文档中提供示例
  * 要求为公开的 API、接口和复杂逻辑编写文档

***

### 在笔记和非代码文件夹中工作

Claude Code 可在任何目录中运行。在笔记库、文档文件夹或任何 markdown 文件集合中运行它，以像处理代码一样搜索、编辑和重组内容。

`.claude/` 目录和 `CLAUDE.md` 可以与其他工具的配置目录并存而不冲突。Claude 在每次工具调用时都会重新读取文件，因此它在下次读取该文件时会看到您在其他应用程序中所做的编辑。

***

### 处理图片

假设您需要在代码库中处理图片，并且希望 Claude 帮助您分析图像内容。


    你可以使用以下任意方法：

    1. 将图像拖放到 Claude Code 窗口
    2. 复制图像并使用 ctrl+v 粘贴到命令行界面（请勿使用 cmd+v）
    3. 向 Claude 提供图像路径。例如："分析此图像：/path/to/your/image.png"



    ```text
    What does this image show?
    ```

    ```text
    Describe the UI elements in this screenshot
    ```

    ```text
    Are there any problematic elements in this diagram?
    ```



    ```text
    Here's a screenshot of the error. What's causing it?
    ```

    ```text
    This is our current database schema. How should we modify it for the new feature?
    ```



    ```text
    Generate CSS to match this design mockup
    ```

    ```text
    What HTML structure would recreate this component?
    ```




  提示：

  * 当文字描述可能不够清晰或过于繁琐时，请使用图片
  * 包含错误截图、UI设计或图表以提供更好的上下文
  * 您可以在一次对话中处理多张图片
  * 图像分析支持图表、截图、模型等多种形式
  * 当 Claude 引用图片时（例如 `[Image #1]`），使用 `Cmd+Click`（Mac）或 `Ctrl+Click`（Windows/Linux）点击链接，可在默认查看器中打开图片

### 引用文件和目录

使用 @ 符号可以快速包含文件或目录，无需等待 Claude 读取它们。


    ```text
    Explain the logic in @src/utils/auth.js
    ```
    这包括了文件在对话中的全部内容。



    ```text
    What's the structure of @src/components?
    ```
    这提供包含文件信息的目录列表。



    ```text
    Show me the data from @github:repos/owner/repo/issues
    ```
    这通过格式 @server:resource 从已连接的 MCP 服务器获取数据。详见 [MCP 资源](/en/mcp#use-mcp-resources)。




  小贴士：

  * 文件路径可以是相对路径或绝对路径
  * @文件引用会将目标文件所在目录及父目录的 `CLAUDE.md` 添加到上下文中
  * 目录引用会显示文件列表而非内容
  * 您可以在单条消息中引用多个文件（例如："@file1.js 和 @file2.js"）

### 定时运行 Claude

假设您希望 Claude 自动定期处理任务，例如每天早晨审查待处理的 PR、每周审计依赖项，或在夜间检查 CI 失败。

根据您希望任务运行的位置，选择一个调度选项：

| 选项                                                 | 运行位置                     | 最适用于                                                                                                                                                                                                 |
| :----------------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [例程](/en/routines)                               | Anthropic 管理的基础设施  | 即使在电脑关闭时也应运行的任务。除了定时计划外，还可以在 API 调用或 GitHub 事件时触发。配置网址：[claude.ai/code/routines](https://claude.ai/code/routines)。 |
| [桌面定时任务](/en/desktop-scheduled-tasks) | 您的机器，通过桌面应用 | 需要直接访问本地文件、工具或未提交更改的任务。                                                                                                                             |
| [GitHub Actions](/en/github-actions)                   | 您的 CI 管道                  | 与仓库事件（如已打开的 PR）绑定的任务，或应与您的工作流配置一起存放的定时任务。                                                                                            |
| [`/loop`](/en/scheduled-tasks)                         | 当前的 CLI 会话           | 会话保持打开状态时的快速轮询。当您开始新对话时任务会停止；`--resume` 和 `--continue` 可恢复未过期的任务。                                                                 |

  为定时任务编写提示词时，需明确指定任务成功的具体标准以及结果的处理方式。任务会自主运行，因此无法主动询问澄清问题。例如："审查标记为 `needs-review` 的开放 PR，对任何问题添加行内注释，并在 Slack 的 `#eng-reviews` 频道发布总结。"

### 向 Claude 询问其功能

Claude 拥有内置文档访问能力，可以回答关于其自身功能和局限性的问题。

#### 示例问题
```text
can Claude Code create pull requests?
```

```text
how does Claude Code handle permissions?
```

```text
what skills are available?
```

```text
how do I use MCP with Claude Code?
```

```text
how do I configure Claude Code for Amazon Bedrock?
```

```text
what are the limitations of Claude Code?
```


  Claude 提供基于文档的答案来回应这些问题。如需动手演示，请运行 `/powerup` 获取带动画演示的交互式课程，或参阅上方的具体工作流部分。



  技巧：

  *   无论您使用的是哪个版本，Claude 始终能访问最新的 Claude Code 文档。
  *   提出具体问题以获得详细解答。
  *   Claude 可以解释复杂功能，例如 MCP 集成、企业配置和高级工作流。

***

## 恢复之前的对话

当任务跨越多个时间段时，从中断处继续，无需重新解释上下文。Claude Code 会在本地保存每次对话。
```bash
claude --continue
```
这将恢复当前目录中最近的会话；如果尚未存在，它会打印 `No conversation found to continue` 并退出。使用 `claude --resume` 可以从列表中选择，或在运行中的会话内使用 `/resume`。请参阅[管理会话](/en/sessions)了解命名、分支以及完整的选取器参考。

## 使用工作树运行并行会话

在一个终端中处理功能特性，同时让 Claude 在另一个终端中修复错误，而不会产生编辑冲突。每个工作树都是独立分支上的独立检出。
```bash
claude --worktree feature-auth
```
在第二个终端中使用不同名称运行相同命令，以启动一个隔离的并行会话。关于清理、`.worktreeinclude` 及非 Git VCS 支持，请参阅[工作树](/en/worktrees)。要在一个屏幕中监控并行会话而非使用多个终端，请参阅[后台代理](/en/agent-view)。

## 编辑前先规划

对于您希望在写入磁盘前进行审查的更改，请切换到规划模式。Claude 会读取文件并提出计划，但在您批准之前不会进行任何编辑。
```bash
claude --permission-mode plan
```
你也可以在会话中按 `Shift+Tab` 切换至计划模式。关于审批流程和在文本编辑器中编辑计划，请参阅[计划模式](/en/permission-modes#analyze-before-you-edit-with-plan-mode)。

## 将研究任务委托给子代理

探索大型代码库会让上下文充满文件读取内容。将探索工作委托出去，这样只有发现结果会被返回。
```text
use a subagent to investigate how our auth system handles token refresh
```
子代理在自身上下文窗口中读取文件并汇报摘要。如需定义自带工具和提示词的自定义代理，请参阅 [Subagents](/en/sub-agents)。

## 将 Claude 管道化集成到脚本

以非交互式方式运行 Claude，适用于 CI、预提交钩子或批量处理场景。标准输入输出如同任意 Unix 工具般运作。
```bash
git log --oneline -20 | claude -p "summarize these recent commits"
```
参阅[非交互模式](/en/headless)了解输出格式、权限标志和扇出模式。

## 下一步


    充分利用 Claude Code 的模式



    恢复、命名和分支会话



    运行隔离的并行会话



    添加技能、钩子、MCP、子代理和插件


