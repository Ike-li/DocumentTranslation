> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引。
> 在进一步探索前，请使用此文件发现所有可用页面。

# Claude Code 最佳实践

> 获取最大化利用 Claude Code 效益的提示和模式，涵盖从环境配置到跨并行会话扩展的方方面面。

Claude Code 是一个代理式编码环境。与回答问题并等待的聊天机器人不同，Claude Code 可以读取您的文件、运行命令、进行更改，并在您观察、重定向或完全离开时自主解决问题。

这改变了您的工作方式。您无需自己编写代码并请 Claude 审阅，而是描述您想要什么，Claude 会想办法构建它。Claude 会进行探索、规划和实施。

但这种自主性仍伴随着学习曲线。Claude 在您需要理解的某些约束下工作。

本指南涵盖了在 Anthropic 内部团队以及在不同代码库、语言和环境中使用 Claude Code 的工程师们已被证明有效的模式。有关代理循环底层工作原理，请参阅 [Claude Code 工作原理](/zh/how-claude-code-works)。

***

大多数最佳实践基于一个约束：Claude 的上下文窗口会很快被填满，并且随着窗口被填满，其性能会下降。

Claude 的上下文窗口容纳了您的整个对话，包括每条消息、Claude 读取的每个文件以及每个命令的输出。然而，这可能会很快被填满。一次调试会话或代码库探索可能就会生成和消耗数万 tokens。

这很重要，因为随着上下文被填满，LLM 的性能会下降。当上下文窗口快要满时，Claude 可能会开始“忘记”早期指令或犯更多错误。上下文窗口是需要管理的最重要资源。若想了解会话在实践中是如何被填满的，[请观看一个交互式演示](/zh/context-window)，了解启动时加载的内容以及读取每个文件的代价。使用[自定义状态行](/zh/statusline)持续跟踪上下文使用情况，并查看[减少 token 用量](/zh/costs#reduce-token-usage)以获取减少 token 用量的策略。

***

## 为 Claude 提供验证其工作的方法

  给Claude一个它可运行的检查：测试、构建、截图对比。这正是一个需要你观察的会话与你可以放心离开的会话之间的区别。

当工作看起来完成时，Claude 就会停止。如果没有可运行的检查，"看起来完成" 就是唯一可用的信号，而你会成为验证循环：每个错误都等着你去发现。给 Claude 一个能产生通过或失败结果的东西，这个循环就能自行闭合。Claude 完成工作，运行检查，读取结果，并迭代直到检查通过。

这个检查可以是任何能在对话中产生 Claude 可读取信号的东西：一个测试套件、一个构建退出码、一个 linter、一个将输出与预期结果进行对比的脚本，或者一张与设计对比的 [浏览器截图](/zh/chrome)。

| 策略 | 之前 | 之后 |
| --- | --- | --- |
| **提供验证标准** | *"实现一个验证邮箱地址的函数"* | *"编写一个 `validateEmail` 函数。测试用例示例：[user@example.com](mailto:user@example.com) 为真，invalid 为假，[user@.com](mailto:user@.com) 为假。实现后运行测试"* |
| **目视验证 UI 变更** | *"让仪表盘更好看"* | *"（[粘贴截图]）实现这个设计。对结果截图并与原图对比。列出差异并修复"* |
| **解决根本原因，而非症状** | *"构建失败了"* | *"构建失败并出现此错误：[粘贴错误]。修复它并验证构建成功。解决根本原因，不要抑制错误"* |

一旦检查存在，就决定它在阻止停止时的严格程度：

*   **在单次提示词中**：要求 Claude 在同一条消息中运行检查并进行迭代，如上表所示。
*   **跨会话**：将检查设置为 [`/goal` 条件](/zh/goal)。一个独立的评估器会在每一轮后重新检查，Claude 会持续工作直到条件满足。
*   **作为确定性门控**：一个 [停止钩子](/zh/hooks#stop) 将你的检查作为脚本运行，并阻止当前轮次结束直到它通过。Claude Code 会在连续 8 次阻止后覆盖钩子并结束轮次。
*   **通过第二种意见**：一个[验证子代理](/zh/sub-agents)或一个[动态工作流](/zh/workflows)会检查其自身的发现，并让一个新模型尝试反驳结果，这样工作的代理就不是评分的那个。

每一步都用设置投入换取注意力节省。提示词版本今天适用于任何任务。`/goal` 和停止钩子版本则能让你在无人值守时正确地完成运行。

让 Claude 展示证据而不是断言成功：测试输出、它运行的命令及返回结果，或者结果的截图。审查证据比自己重新运行验证更快，也适用于你未观察的会话。

***

## 先探索，再规划，再编码

  将研究规划与实现分开，避免解决错误的问题。

让 Claude 直接开始编码可能会产生解决错误问题的代码。请使用[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)将探索与执行分离开来。

推荐的工作流程包含四个阶段：
探索 → 计划 → 执行 → 验证


    进入计划模式。Claude 会读取文件并回答问题，但不会进行任何更改。
    ```txt claude (plan mode)
    read /src/auth and understand how we handle sessions and login.
    also look at how we manage environment variables for secrets.
    ```



    请求 Claude 创建详细的实现计划。
    ```txt claude (plan mode)
    I want to add Google OAuth. What files need to change?
    What's the session flow? Create a plan.
    ```
    按下 `Ctrl+G` 可在文本编辑器中打开计划进行直接编辑，之后 Claude 才会继续执行。



    切换出计划模式，让 Claude Code 按照其计划进行验证。
    ```txt claude (default mode)
    implement the OAuth flow from your plan. write tests for the
    callback handler, run the test suite and fix any failures.
    ```



    要求Claude提交代码并附上描述信息，然后创建PR请求。
    ```txt claude (default mode)
    commit with a descriptive message and open a PR
    ```




  规划模式很有用，但也会增加开销。

  对于范围明确且修改较小的任务（比如修正拼写错误、添加一行日志或重命名变量），可以直接让 Claude 执行。

  当你对实现方式不确定、修改涉及多个文件，或者不熟悉要修改的代码时，规划模式最为有用。如果你能用一句话描述代码差异，就跳过规划。

## 在提示词中提供具体上下文

通常，您可以给 `Claude Code` 提供更具体的信息来获得更好的结果。例如，不是简单地要求“修复这个错误”，而是告诉它需要修复的具体错误，以及它可能在哪个文件或函数中。

  你的指令越精确，所需的修正就越少。

Claude 可以推断意图，但它无法读取你的心思。请引用具体文件、提及约束条件，并指向示例模式。

| 策略                                                                                             | 之前示例                                             | 之后示例                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **限定任务范围。** 指定具体文件、场景和测试偏好。                                                  | *"add tests for foo.py"*                             | *"write a test for foo.py covering the edge case where the user is logged out. avoid mocks."*                                                                                                                                                                                                                                                                    |
| **指向信息源。** 将 Claude 引导至能回答问题的信息源。                                              | *"why does ExecutionFactory have such a weird api?"* | *"look through ExecutionFactory's git history and summarize how its api came to be"*                                                                                                                                                                                                                                                                             |
| **参考现有模式。** 将 Claude 指向代码库中的现有模式。                                              | *"add a calendar widget"*                            | *"look at how existing widgets are implemented on the home page to understand the patterns. HotDogWidget.php is a good example. follow the pattern to implement a new calendar widget that lets the user select a month and paginate forwards/backwards to pick a year. build from scratch without libraries other than the ones already used in the codebase."* |
| **描述症状。** 提供问题症状、可能的位置以及“修复”的样子。                                          | *"fix the login bug"*                                | *"users report that login fails after session timeout. check the auth flow in src/auth/, especially token refresh. write a failing test that reproduces the issue, then fix it"*                                                                                                                                                                                 |

当你在探索阶段，且能够承受调整方向的风险时，模糊的提示词可能很有用。像 `"what would you improve in this file?"` 这样的提示词可以挖掘出你原本没想到要问的问题。

### 提供丰富内容

  使用 `@` 引用文件、粘贴截图或图像，或直接通过管道传输数据。

您可以通过以下几种方式为 Claude 提供丰富的数据：

* **使用 `@` 引用文件**，而不是描述代码位置。Claude 会在回答前读取文件。
* **直接粘贴图片**。将图片复制/粘贴或拖放到提示词中。
* **提供文档和 API 参考的 URL**。使用 `/permissions` 将常用域名加入允许列表。
* **通过管道传入数据**，例如运行 `cat error.log | claude` 直接发送文件内容。
* **让 Claude 自行获取所需内容**。告诉 Claude 通过 Bash 命令、MCP 工具或读取文件来获取上下文。

***

## 配置您的环境

一些简单的设置步骤可以显著提升 Claude Code 在您所有会话中的效能。要全面了解扩展功能及其适用场景，请参阅 [扩展 Claude Code](/zh/features-overview)。

### 编写高效的 CLAUDE.md

  运行 `/init` 命令基于当前项目结构生成初始的 CLAUDE.md 文件，随后可随着时间的推移逐步优化其内容。

CLAUDE.md 是一个特殊文件，Claude 会在每次对话开始时读取它。请在其中包含 Bash 命令、代码风格和工作流程规则。这能为 Claude 提供仅凭代码无法推断的持久上下文。

`/init` 命令会分析您的代码库，检测构建系统、测试框架和代码模式，为您提供一个坚实的基础以便后续优化。

CLAUDE.md 文件没有必需的格式，但应保持简洁且易于阅读。例如：
```markdown CLAUDE.md
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```
CLAUDE.md 在每次会话时都会加载，因此只应包含具有普适性的内容。对于仅在特定情境下适用的领域知识或工作流，请使用[技能](/zh/skills)。Claude 会按需加载它们，而不会让每次对话都变得臃肿。

保持简洁。对于每一行，请思考：*“删除它会导致 Claude 犯错吗？”* 如果不会，就删除它。臃肿的 CLAUDE.md 文件会让 Claude 忽略你真正的指令！

| ✅ 应包含                                                | ❌ 应排除                                           |
| ---------------------------------------------------- | -------------------------------------------------- |
| Claude 无法猜到的 Bash 命令                              | 任何 Claude 通过阅读代码就能弄明白的内容                 |
| 与默认设置不同的代码风格规则                                  | Claude 已经了解的标准语言惯例                            |
| 测试指令和首选的测试运行程序                                 | 详细的 API 文档（改为链接到文档）                        |
| 仓库礼仪（分支命名、PR 约定）                               | 经常变动的信息                                        |
| 你项目特有的架构决策                                      | 冗长的解释或教程                                       |
| 开发环境怪癖（必需的环境变量）                                 | 代码库的逐文件描述                                      |
| 常见的陷阱或非显而易见的行为                                  | “编写简洁代码”之类不言而喻的做法                         |

如果尽管有相关规则，Claude 仍然持续做出你不想要的行为，那么文件可能太长，规则被淹没了。如果 Claude 向你询问 CLAUDE.md 中已经回答的问题，可能是措辞不够明确。将 CLAUDE.md 当作代码来对待：出错时要审查它，定期精简，并通过观察 Claude 的行为是否真正改变来测试更改。

你可以通过添加强调（例如 "IMPORTANT" 或 "YOU MUST"）来微调指令，以提高遵守度。将 CLAUDE.md 提交到 git，以便你的团队可以贡献。文件的价值会随时间累积。

CLAUDE.md 文件可以使用 `@path/to/import` 语法导入其他文件。
```markdown CLAUDE.md
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```
你可以在多个位置放置 CLAUDE.md 文件：

* **主文件夹 (`~/.claude/CLAUDE.md`)**：适用于所有 Claude 会话
* **项目根目录 (`./CLAUDE.md`)**：提交到 git 以与团队共享
* **项目根目录 (`./CLAUDE.local.md`)**：个人的项目特定笔记；将此文件添加到你的 `.gitignore` 中，以避免与团队共享
* **父目录**：适用于单体仓库，其中 `root/CLAUDE.md` 和 `root/foo/CLAUDE.md` 会被自动加载
* **子目录**：当 Claude 在这些目录中读取文件时，会按需加载子目录的 CLAUDE.md 文件

### 配置权限

  使用[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)让分类器处理审批，使用 `/permissions` 允许列表指定命令，或使用 `/sandbox` 实现操作系统级隔离。每种方式都能在保持您控制权的同时减少中断。

默认情况下，Claude Code 会对可能修改您系统的操作请求权限：文件写入、Bash 命令、MCP 工具等。这很安全但很繁琐。到了第十次确认时，您就不再真正审阅了，只是机械地点确认。有三种方法可以减少这些中断：

* **自动模式**：一个独立的分类器模型会审阅命令，仅阻止那些看起来有风险的操作：如权限范围升级、未知基础设施或恶意内容驱动的操作。最适合当您信任任务的大致方向但不想逐步点确认时使用
* **权限允许列表**：允许您已知安全的特定工具，例如 `npm run lint` 或 `git commit`
* **沙箱**：启用操作系统级别的隔离，限制文件系统和网络访问，让 Claude 可以在定义好的边界内更自由地工作

阅读更多关于[权限模式](/zh/permission-modes)、[权限规则](/zh/permissions)和[沙箱](/zh/sandboxing)的信息。

### 使用 CLI 工具

  请指示 Claude Code 在与外部服务交互时使用 `gh`、`aws`、`gcloud` 和 `sentry-cli` 等命令行工具。

CLI工具是与外部服务交互时上下文效率最高的方式。如果你使用GitHub，请安装 `gh` CLI。Claude知道如何用它创建议题、发起拉取请求和读取评论。没有 `gh` 的话，Claude仍可使用GitHub API，但未经身份验证的请求常会触及速率限制。

Claude也善于学习它尚不熟悉的CLI工具。可尝试类似提示词：`使用 'foo-cli-tool --help' 了解foo工具功能，然后用它解决A、B、C问题。`

### 连接MCP服务器

  运行 `claude mcp add` 来连接 Notion、Figma 或数据库等外部工具。

通过 [MCP 服务器](/zh/mcp)，你可以让 Claude 根据问题跟踪器实现功能、查询数据库、分析监控数据、集成 Figma 设计以及自动化工作流。

### 设置钩子

  钩子用于执行必须无条件执行的操作。

[钩子](/zh/hooks-guide) 可在 Claude 工作流程的特定节点自动运行脚本。与作为建议性指令的 CLAUDE.md 不同，钩子是确定性的，能够确保操作必定执行。

Claude 可以为您编写钩子。尝试使用如下提示词：*"编写一个钩子，在每次编辑文件后运行 eslint"* 或 *"编写一个阻止写入迁移文件夹的钩子"*。您也可以直接编辑 `.claude/settings.json` 文件手动配置钩子，或运行 `/hooks` 命令查看已配置的钩子。

### 创建技能

  在 `.claude/skills/` 中创建 `SKILL.md` 文件，为 Claude 提供领域知识和可重用工作流程。

[技能](/zh/skills) 通过添加您项目、团队或领域的特定信息来扩展 Claude 的知识。当相关内容出现时，Claude 会自动应用它们，或者您也可以通过 `/skill-name` 直接调用它们。

要创建技能，请将包含 `SKILL.md` 的目录添加到 `.claude/skills/`：
```markdown .claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: REST API design conventions for our services
---
# API Conventions
- Use kebab-case for URL paths
- Use camelCase for JSON properties
- Always include pagination for list endpoints
- Version APIs in the URL path (/v1/, /v2/)
```
技能还可以定义可直接调用的重复性工作流：
```markdown .claude/skills/fix-issue/SKILL.md
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```
运行`/fix-issue 1234`来调用它。对于具有副作用且希望手动触发的工作流，请使用`disable-model-invocation: true`。

### 创建自定义子代理

  在 `.claude/agents/` 目录下定义专用助手，供 Claude 委托处理隔离任务。

[子代理](/zh/sub-agents)运行在独立上下文中，拥有自己允许的工具集。它们适用于需要读取大量文件或专注处理特定任务的场景，且不会污染主对话。
```markdown .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```
明确要求 Claude 使用子代理：*"Use a subagent to review this code for security issues."*

### 安装插件

  运行 `/plugin` 以浏览市场。插件可以添加技能、工具和集成，无需配置。

[插件](/zh/plugins)将技能、钩子、子代理和 MCP 服务器打包成单一可安装单元，由社区和 Anthropic 提供。若您使用类型化语言，请安装[代码智能插件](/zh/discover-plugins#code-intelligence)，以便为 Claude 提供精确的符号导航和编辑后自动错误检测功能。

关于如何在技能、子代理、钩子和 MCP 之间进行选择的指导，请参阅[扩展 Claude Code](/zh/features-overview#match-features-to-your-goal)。

***

## 有效沟通

您与 Claude Code 沟通的方式会显著影响结果质量。

### 询问代码库问题

  向 Claude 提出你通常会向高级工程师请教的问题。

在接触新的代码库时，可以使用 Claude Code 来学习和探索。你可以向 Claude 提出与向其他工程师提出的相同类型的问题：

* 日志记录是如何工作的？
* 如何创建一个新的 API 端点？
* `foo.rs` 文件第 134 行的 `async move { ... }` 是做什么的？
* `CustomerOnboardingFlowImpl` 处理了哪些边界情况？
* 为什么这段代码在第 333 行调用了 `foo()` 而不是 `bar()`？

以这种方式使用 Claude Code 是一种高效的入职流程，可以加快上手速度并减轻其他工程师的工作负担。不需要特别的提示词：直接提问即可。

### 让 Claude 来“面试”你

  对于更复杂的功能，建议让 Claude 先与您进行需求确认。以一条简明的提示词开始，并请 Claude 使用 `AskUserQuestion` 工具向您提问。

Claude 会询问您可能尚未考虑到的事情，包括技术实现、UI/UX、边界情况和权衡取舍。
```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```
一旦规范制定完成，请启动一个全新会话来执行它。新会话拥有干净的上下文，完全专注于实现，并且你有一份书面规范可供参考。

最有用的规范是自成一体的：它们指明所涉及的文件和接口，说明哪些内容不在范围内，并以一个端到端验证步骤结束，该步骤能证明功能有效。在使规范精确上花费的时间，比花在观察实现过程上更有回报。

***

## 管理你的会话

对话是持久且可逆的。善用这一特性！

### 尽早并经常进行修正

  一发现Claude偏离正轨就立即纠正它。

紧密的反馈循环能带来最佳效果。虽然Claude偶尔能在首次尝试时完美解决问题，但及时修正通常能更快产出更优方案。

* **`Esc`键**：在操作过程中按`Esc`键可中途暂停Claude。上下文将保留，以便您重新指引。
* **`Esc + Esc` 或 `/rewind`**：连续按两次`Esc`键或执行`/rewind`命令，可打开回退菜单，恢复之前的对话和代码状态，或从选定消息处总结。
* **`"撤销那个"`**：让Claude撤回其所做的更改。
* **`/clear`**：在不相关的任务之间重置上下文。包含无关上下文的冗长会话可能降低性能。

若在同一会话中就同一问题已修正Claude超过两次，说明上下文中已充满了失败的尝试。请运行`/clear`，并以一个更具体的提示词重新开始，该提示词应融入您所学到的内容。使用更佳提示词的新会话，几乎总是比积累了多次修正的冗长会话表现更出色。

### 积极管理上下文

  在不相关的任务之间运行 `/clear` 以重置上下文。

Claude Code 会在接近上下文限制时自动压缩对话历史，在释放空间的同时保留重要的代码和决策。

在长时间会话中，Claude 的上下文窗口可能会被无关的对话、文件内容和命令填满，这可能会降低性能，有时还会分散 Claude 的注意力。

*   在不同任务之间频繁使用 `/clear` 命令来完全重置上下文窗口。
*   当自动压缩触发时，Claude 会总结最重要的内容，包括代码模式、文件状态和关键决策。
*   若要获得更多控制权，可以运行 `/compact <指令>`，例如 `/compact 专注于 API 更改`。
*   要仅压缩对话的一部分，请使用 `Esc + Esc` 或 `/rewind`，选择一个消息检查点，然后选择 **从此处总结** 或 **总结至此处**。前者会压缩从该点之后的消息，同时保持较早的上下文不变；后者会压缩较早的消息，同时完整保留最近的消息。请参阅 [恢复与总结](/zh/checkpointing#restore-vs-summarize)。
*   在 CLAUDE.md 中自定义压缩行为，添加类似 `"压缩时，始终保留完整的修改文件列表和任何测试命令"` 的指令，以确保关键上下文在总结后得以保留。
*   对于不需要保留在上下文中的快速问题，可以使用 [`/btw`](/zh/interactive-mode#side-questions-with-%2Fbtw)。答案会显示在可关闭的覆盖层中，并且永远不会进入对话历史记录，因此您可以在不增长上下文的情况下查看细节。

### 使用子代理进行调查

  使用 `"委派子代理调查 X"` 来委派研究任务。他们会在独立的上下文环境中进行探索，使你的主对话保持清晰以便专注于实现。

由于上下文是你的根本约束，子代理因此成为你最强大的工具之一。当Claude研究代码库时会读取大量文件，这些都会消耗你的上下文。子代理在独立的上下文窗口中运行，并返回摘要：
```text
Use subagents to investigate how our authentication system handles token
refresh, and whether we have any existing OAuth utilities I should reuse.
```
子代理会探索代码库、读取相关文件并向主会话汇报结果，全程不会干扰您的主要对话。

您还可以在 Claude 实现功能后使用子代理进行验证：
```text
use a subagent to review this code for edge cases
```
### 回溯与检查点

  您发送的每个提示词都会创建一个检查点。您可以将对话、代码或两者恢复到任意历史检查点。

Claude 会在每次更改前自动对文件进行快照，以便通过检查点恢复。双击 `Escape` 或运行 `/rewind` 可以打开回溯菜单。您可以选择仅恢复对话、仅恢复代码、两者都恢复，或者从选定消息开始总结。详见[检查点](/zh/checkpointing)。

与其仔细规划每一步，您可以让 Claude 尝试一些有风险的操作。如果行不通，回溯并尝试不同的方法。检查点在会话之间持久保存，因此即使关闭终端，您仍然可以稍后进行回溯。

  检查点仅追踪 *Claude* 执行的修改，不包含外部进程。这并不能替代 git。

### 恢复会话

  使用`/rename`命令为会话命名，并像对待分支一样管理它们：每个工作流拥有独立的持久化上下文。

Claude Code 将对话保存在本地，因此当任务跨越多次会话时，您无需重新解释上下文。运行 `claude --continue` 可以恢复最近的会话，或者运行 `claude --resume` 从列表中选择。为会话起一些描述性的名称，例如 `oauth-migration`，以便日后查找。有关完整的恢复、分支和命名控制功能，请参阅[管理会话](/zh/sessions)。

***

## 自动化与规模化

一旦您能熟练使用单个 Claude，就可以通过并行会话、非交互模式和扇出模式来倍增您的产出。

到目前为止的所有内容都假设一个人、一个 Claude 和一个对话。但 Claude Code 可以水平扩展。本节中的技术将向您展示如何完成更多工作。

### 运行非交互模式

  在 CI、预提交钩子或脚本中使用 `claude -p "提示词"`。添加 `--output-format stream-json --verbose` 以获得流式 JSON 输出。

通过 `claude -p "your prompt"`，你可以以非交互方式运行 Claude，无需会话。[非交互式模式](/zh/headless)是你将 Claude 集成到 CI 流水线、预提交钩子或任何自动化工作流的方式。输出格式允许你以编程方式解析结果：纯文本、JSON 或流式 JSON。
```bash
# One-off queries
claude -p "Explain what this project does"

# Structured output for scripts
claude -p "List all API endpoints" --output-format json

# Streaming for real-time processing
claude -p "Analyze this log file" --output-format stream-json --verbose
```
### 运行多个 Claude 会话

  并行运行多个 Claude 会话，以加速开发、运行隔离实验或启动复杂工作流。

选择适合你期望协调程度的并行方案：

* [工作树](/zh/worktrees)：在隔离的 git 检出中运行独立的 CLI 会话，避免编辑冲突
* [桌面应用](/zh/desktop#work-in-parallel-with-sessions)：可视化管理多个本地会话，每个会话在独立的工作树中运行
* [网页版 Claude Code](/zh/claude-code-on-the-web)：在 Anthropic 管理的云基础设施隔离虚拟机中运行会话
* [代理团队](/zh/agent-teams)：通过共享任务、消息传递和团队负责人自动协调多个会话

除了工作并行化，多个会话还能支持质量优先的工作流程。全新上下文有助于代码审查，因为 Claude 不会偏向自己刚编写的代码。

例如，使用编写者/审查者模式：

| 会话 A（编写者）                                                        | 会话 B（审查者）                                                                                                                                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `为我们的 API 端点实现限流器`                                           |                                                                                                                                                                        |
|                                                                         | `审查 @src/middleware/rateLimiter.ts 中的限流器实现。检查边界条件、竞态条件以及与现有中间件模式的一致性。` |
| `以下是审查反馈：[会话 B 输出]。请解决这些问题。`                       |                                                                                                                                                                        |

你可以在测试中采用类似方法：让一个 Claude 编写测试，另一个编写代码使其通过。

### 跨文件扇出

  循环处理任务，为每个任务调用 `claude -p`。使用 `--allowedTools` 限定批量操作的权限范围。

对于大型迁移或分析任务，您可以将工作分配到多个并行的 Claude 调用中：


    让Claude列出所有需要迁移的文件（例如，`列出所有2,000个需要迁移的Python文件`）



    ```bash
    for file in $(cat files.txt); do
      claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
        --allowedTools "Edit,Bash(git commit *)"
    done
    ```



    根据前2-3个文件的错误情况完善提示词，然后对全部文件运行。`--allowedTools` 标志限制了 Claude 的操作范围，这在无人值守运行时很重要。


你还可以将Claude集成到现有的数据/处理管道中：
```bash
claude -p "<your prompt>" --output-format json | your_command
```
开发调试时可使用 `--verbose`，生产环境请关闭此参数。

### 以自动模式运行

若需不间断执行且后台自动进行安全检查，请使用[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)。分类器模型会在命令执行前进行审查，阻止权限范围扩大、未知基础设施操作及恶意内容驱动行为，同时允许常规工作无需提示即可继续。
```bash
claude --permission-mode auto -p "fix all lint errors"
```
对于使用 `-p` 标志的非交互式运行，如果分类器反复阻止操作，自动模式会中止，因为无法回退到用户。关于阈值，请参阅[自动模式回退条件](/zh/permission-modes#when-auto-mode-falls-back)。

### 添加对抗性审查步骤

  在将任务视为完成之前，请让子代理在全新上下文中审查差异并报告遗漏。

Claude 在无人值守下工作的时间越长，在您将工作视为完成之前进行独立检查就越重要。在全新[子代理](/zh/sub-agents)上下文中运行的审查程序只能看到差异和您提供的标准，而不会看到产生该变更的推理过程，因此它会基于自身标准来评估结果。

要进行正确性检查，可以运行捆绑的 [`/code-review` 技能](/zh/commands)，它会在一个全新的子代理中审查当前的差异以查找缺陷，并将发现返回给会话。如果您想根据您的计划检查差异，请自行编写审查提示词。具体说明要检查的工作、对照的计划，以及什么样的内容算作发现。
```text
Use a subagent to review the rate limiter diff against PLAN.md. Check that
every requirement is implemented, the listed edge cases have tests, and
nothing outside the task's scope changed. Report gaps, not style preferences.
```
由于审查器作为子代理运行，实施会话会直接接收到差距并能进行修复和重新审查，无需你在窗口间复制发现。对于更长的自主运行，[代理团队](/zh/agent-teams)可以跨多项任务保持此循环进行，同时你可以抽查记录的发现。

  一位被要求寻找缺陷的审查者通常会报告一些缺陷，即使作品质量尚可，因为这是被委派的任务。追逐每个发现会导致过度工程化：额外的抽象层、防御性代码，以及针对不可能发生情况的测试。请审查者仅标记影响正确性或既定要求的缺陷，并将其余视为可选改进。

***

## 避免常见的失败模式

这些是常见错误。尽早识别它们可以节省时间：

* **大杂烩式会话。** 你从一个任务开始，然后问 Claude 一些不相关的事情，接着又回到第一个任务。上下文中充满了无关信息。
  > **修正方法**：在不相关的任务之间使用 `/clear`。
* **反复纠正。** Claude 做错了什么，你纠正它，它还是错的，你再次纠正。上下文被失败的方法污染了。
  > **修正方法**：两次纠正失败后，使用 `/clear` 并编写一个更好的初始提示词，融入你学到的经验。
* **过度指定的 CLAUDE.md。** 如果你的 CLAUDE.md 太长，Claude 会忽略其中一半，因为重要规则在噪音中丢失了。
  > **修正方法**：无情地精简。如果 Claude 没有指令也能正确完成某事，就删除它或将其转换为钩子。
* **信任但不验证的差距。** Claude 生成了一个看起来合理的实现，但没有处理边界情况。
  > **修正方法**：始终提供验证（测试、脚本、截图）。如果你无法验证，就不要发布它。
* **无限探索。** 你要求 Claude "调查"某事而没有限定范围。Claude 读取了数百个文件，填满了上下文。
  > **修正方法**：将调查范围限定得狭窄，或使用子代理，这样探索就不会消耗你的主要上下文。

***

## 培养你的直觉

本指南中的模式并非一成不变。它们通常是效果不错的起点，但可能并非在所有情况下都是最优的。

有时你*应该*让上下文累积，因为你正深入一个复杂问题，历史记录很有价值。有时你应该跳过计划，让 Claude 自己解决，因为任务具有探索性。有时一个模糊的提示词恰恰是正确的，因为你想先看看 Claude 如何解释问题，然后再加以限制。

注意什么有效。当 Claude 产生出色输出时，注意你做了什么：提示词结构、你提供的上下文、你当时所处的模式。当 Claude 遇到困难时，问问为什么。是上下文太嘈杂了吗？提示词太模糊了吗？任务太大，一次无法完成？

随着时间的推移，你将培养出任何指南都无法捕捉的直觉。你会知道何时该具体、何时该开放，何时该计划、何时该探索，何时该清除上下文、何时该让其累积。

## 相关资源

* [Claude Code 工作原理](/zh/how-claude-code-works)：智能体循环、工具和上下文管理
* [扩展 Claude Code](/zh/features-overview)：技能、钩子、MCP、子代理和插件
* [常见工作流程](/zh/common-workflows)：调试、测试、PR 等的逐步指南
* [CLAUDE.md](/zh/memory)：存储项目规范和持久上下文