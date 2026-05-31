> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 的工作原理

> 了解代理循环、内置工具，以及 Claude Code 如何与你的项目交互。

Claude Code 是一个运行在终端中的代理助手。虽然它擅长编程，但可以帮助你完成任何能在命令行中做的事情：编写文档、运行构建、搜索文件、研究主题等等。

本指南涵盖核心架构、内置功能，以及[高效使用 Claude Code 的技巧](#高效使用-claude-code)。有关分步教程，请参阅[常见工作流](/zh/common-workflows)。有关技能、MCP 和钩子等可扩展功能，请参阅[扩展 Claude Code](/zh/features-overview)。

## 代理循环

当你给 Claude 一个任务时，它会经历三个阶段：**收集上下文**、**采取行动**和**验证结果**。这三个阶段相互交织。Claude 在整个过程中都会使用工具，无论是搜索文件以理解代码、进行编辑以做出更改，还是运行测试以检查工作成果。

<img src="https://mintcdn.com/claude-code/c5r9_6tjPMzFdDDT/images/agentic-loop.svg?fit=max&auto=format&n=c5r9_6tjPMzFdDDT&q=85&s=5f1827dec8539f38adee90ead3a85a38" alt="代理循环：你的提示词引导 Claude 收集上下文、采取行动、验证结果，并重复直到任务完成。你可以在任何时刻中断。" width="720" height="280" data-path="images/agentic-loop.svg" />

循环会根据你的请求进行调整。关于代码库的问题可能只需要收集上下文。Bug 修复会反复经历所有三个阶段。重构可能涉及大量的验证。Claude 根据从前一步学到的内容决定每一步需要什么，将数十个操作串联在一起，并在过程中进行修正。

你也是这个循环的一部分。你可以在任何时候中断，引导 Claude 转向不同的方向、提供额外的上下文，或要求它尝试不同的方法。Claude 自主工作，但始终保持对你的输入的响应。

代理循环由两个组件驱动：负责推理的[模型](#模型)和负责执行的[工具](#工具)。Claude Code 充当 Claude 周围的**代理框架**：它提供工具、上下文管理和执行环境，将语言模型转变为强大的编程代理。

### 模型

Claude Code 使用 Claude 模型来理解你的代码并对任务进行推理。Claude 可以阅读任何语言的代码，理解组件之间的连接方式，并找出实现目标需要做出哪些更改。对于复杂任务，它会将工作分解为步骤，执行它们，并根据所学到的内容进行调整。

有[多种模型](/zh/model-config)可供选择，各有不同的权衡。Sonnet 能很好地处理大多数编程任务。Opus 为复杂的架构决策提供更强的推理能力。在会话中使用 `/model` 切换，或使用 `claude --model <name>` 启动。

当本指南说"Claude 选择"或"Claude 决定"时，指的是模型在进行推理。

### 工具

工具是使 Claude Code 成为代理的关键。没有工具，Claude 只能以文本形式响应。有了工具，Claude 就能采取行动：读取代码、编辑文件、运行命令、搜索网页以及与外部服务交互。每次工具使用都会返回信息，反馈到循环中，为 Claude 的下一步决策提供依据。

内置工具大致分为五类，每类代表不同类型的代理能力。

| 类别                  | Claude 可以做什么                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **文件操作**          | 读取文件、编辑代码、创建新文件、重命名和重组                                                                                                                   |
| **搜索**              | 按模式查找文件、使用正则表达式搜索内容、探索代码库                                                                                                             |
| **执行**              | 运行 shell 命令、启动服务器、运行测试、使用 git                                                                                                                |
| **Web**               | 搜索网页、获取文档、查找错误信息                                                                                                                               |
| **代码智能**          | 查看编辑后的类型错误和警告、跳转到定义、查找引用（需要[代码智能插件](/zh/discover-plugins#code-intelligence)）                                                   |

这些是主要功能。Claude 还有用于生成子代理、向你提问和其他编排任务的工具。完整列表请参阅[Claude 可用的工具](/zh/tools-reference)。

Claude 根据你的提示词和沿途学到的信息选择使用哪些工具。当你说"修复失败的测试"时，Claude 可能会：

1. 运行测试套件查看哪些测试失败
2. 读取错误输出
3. 搜索相关的源文件
4. 读取这些文件以理解代码
5. 编辑文件以修复问题
6. 再次运行测试以验证

每次工具使用都会给 Claude 提供新信息，为下一步决策提供依据。这就是代理循环的实际运作。

**扩展基础能力：** 内置工具是基础。你可以使用[技能](/zh/skills)扩展 Claude 的知识，使用 [MCP](/zh/mcp) 连接外部服务，使用[钩子](/zh/hooks)自动化工作流，以及将任务委派给[子代理](/zh/sub-agents)。这些扩展在核心代理循环之上形成一层。有关选择合适扩展的指南，请参阅[扩展 Claude Code](/zh/features-overview)。

## Claude 可以访问什么

本指南重点介绍终端。Claude Code 也运行在 [VS Code](/zh/vs-code)、[JetBrains IDE](/zh/jetbrains) 和其他环境中。

当你在目录中运行 `claude` 时，Claude Code 可以访问：

* **你的项目。** 目录和子目录中的文件，以及在你许可下其他位置的文件。
* **你的终端。** 你能运行的任何命令：构建工具、git、包管理器、系统工具、脚本。如果你能在命令行中完成，Claude 也能。
* **你的 git 状态。** 当前分支、未提交的更改和最近的提交历史。
* **你的 [CLAUDE.md](/zh/memory)。** 一个 markdown 文件，用于存储 Claude 在每次会话中都应了解的项目特定指令、约定和上下文。
* **[自动记忆](/zh/memory#auto-memory)。** Claude 在你工作时自动保存的学习成果，如项目模式和你的偏好。MEMORY.md 的前 200 行或 25KB（以先到者为准）会在每次会话开始时加载。
* **你配置的扩展。** 用于外部服务的 [MCP 服务器](/zh/mcp)、用于工作流的[技能](/zh/skills)、用于委派工作的[子代理](/zh/sub-agents)，以及用于浏览器交互的 [Chrome 中的 Claude](/zh/chrome)。

因为 Claude 能看到你的整个项目，所以它可以跨项目工作。当你要求 Claude "修复认证 bug"时，它会搜索相关文件，读取多个文件以理解上下文，在它们之间进行协调编辑，运行测试以验证修复，并在你要求时提交更改。这与只能看到当前文件的内联代码助手不同。

## 环境和接口

上面描述的代理循环、工具和功能在你使用 Claude Code 的任何地方都是相同的。变化的是代码在哪里执行以及你如何与它交互。

### 执行环境

Claude Code 运行在三种环境中，每种环境对代码在哪里执行有不同的权衡。

| 环境             | 代码运行位置                   | 用例                                                       |
| ---------------- | ------------------------------ | ---------------------------------------------------------- |
| **本地**         | 你的机器                       | 默认。完全访问你的文件、工具和环境                         |
| **云端**         | Anthropic 管理的虚拟机         | 委派任务，处理你本地没有的仓库                             |
| **远程控制**     | 你的机器，从浏览器控制         | 使用 Web UI，同时保持一切在本地                            |

### 接口

你可以通过终端、[桌面应用](/zh/desktop)、[IDE 扩展](/zh/vs-code)、[claude.ai/code](https://claude.ai/code)、[远程控制](/zh/remote-control)、[Slack](/zh/slack) 和 [CI/CD 流水线](/zh/github-actions)访问 Claude Code。接口决定了你如何看到和与 Claude 交互，但底层的代理循环是相同的。完整列表请参阅[在任何地方使用 Claude Code](/zh/overview#use-claude-code-everywhere)。

## 使用会话

Claude Code 在你工作时将对话保存在本地。每条消息、工具使用和结果都会写入 `~/.claude/projects/` 下的纯文本 JSONL 文件，这使得[回退](#使用检查点撤销更改)、[恢复和分叉](#恢复或分叉会话)会话成为可能。在 Claude 进行代码更改之前，它还会对受影响的文件创建快照，以便你在需要时可以恢复。有关路径、保留时间和清除数据的方式，请参阅 [`~/.claude` 中的应用数据](/zh/claude-directory#application-data)。

**会话是独立的。** 每个新会话都从一个全新的上下文窗口开始，没有来自之前会话的对话历史。Claude 可以使用[自动记忆](/zh/memory#auto-memory)跨会话持久化学习成果，你也可以在 [CLAUDE.md](/zh/memory) 中添加自己的持久化指令。

### 跨分支工作

每个 Claude Code 对话都是绑定到当前目录的会话。`/resume` 选择器默认显示当前工作树中的会话，有键盘快捷键可以将列表扩展到其他工作树或项目。有关选择器快捷键和名称解析方式的完整列表，请参阅[管理会话](/zh/sessions#use-the-session-picker)。

Claude 看到的是当前分支的文件。当你切换分支时，Claude 看到的是新分支的文件，但你的对话历史保持不变。即使切换后 Claude 也会记住你们讨论的内容。

由于会话绑定到目录，你可以使用 [git 工作树](/zh/worktrees)运行并行的 Claude 会话，它会为每个分支创建独立的目录。

### 恢复或分叉会话

使用 `claude --continue` 或 `claude --resume` 恢复会话会在相同的会话 ID 下重新打开它，并将新消息追加到现有对话中。使用 `--fork-session` 或 `/branch` 分叉会将历史记录复制到一个新的会话 ID 中，保持原始会话不变。

<img src="https://mintcdn.com/claude-code/c5r9_6tjPMzFdDDT/images/session-continuity.svg?fit=max&auto=format&n=c5r9_6tjPMzFdDDT&q=85&s=fa41d12bfb57579cabfeece907151d30" alt="会话连续性：恢复继续同一个会话，分叉创建一个带有新 ID 的新分支。" width="560" height="280" data-path="images/session-continuity.svg" />

有关恢复标志、`/resume` 选择器、命名以及同一会话在两个终端中打开时的情况，请参阅[管理会话](/zh/sessions)。

### 上下文窗口

Claude 的上下文窗口包含你的对话历史、文件内容、命令输出、[CLAUDE.md](/zh/memory)、[自动记忆](/zh/memory#auto-memory)、已加载的技能和系统指令。随着你工作，上下文会被填满。Claude 会自动压缩，但对话早期的指令可能会丢失。将持久化规则放在 CLAUDE.md 中，运行 `/context` 查看什么在占用空间。

有关加载内容和加载时机的交互式演练，请参阅[探索上下文窗口](/zh/context-window)。

#### 当上下文填满时

Claude Code 在接近限制时自动管理上下文。它首先清除较早的工具输出，然后在需要时总结对话。你的请求和关键代码片段会被保留；对话早期的详细指令可能会丢失。将持久化规则放在 CLAUDE.md 中，而不是依赖对话历史。

要控制压缩期间保留的内容，在 CLAUDE.md 中添加 "Compact Instructions" 部分，或使用焦点运行 `/compact`（如 `/compact focus on the API changes`）。

如果单个文件或工具输出太大，导致每次总结后上下文立即重新填满，Claude Code 会在几次尝试后停止自动压缩，并显示错误而不是循环。有关恢复步骤，请参阅[自动压缩因抖动错误而停止](/zh/troubleshooting#auto-compaction-stops-with-a-thrashing-error)。

运行 `/context` 查看什么在占用空间。MCP 工具定义默认是延迟加载的，通过[工具搜索](/zh/mcp#scale-with-mcp-tool-search)按需加载，因此在 Claude 使用特定工具之前，只有工具名称会消耗上下文。运行 `/mcp` 检查每个服务器的开销。

#### 使用技能和子代理管理上下文

除了压缩，你还可以使用其他功能来控制加载到上下文中的内容。

[技能](/zh/skills)按需加载。Claude 在会话开始时能看到技能描述，但完整内容只在技能被使用时加载。对于你手动调用的技能，设置 `disable-model-invocation: true` 可以在你需要之前将描述排除在上下文之外。对于你没有编写的技能，使用 [`skillOverrides`](/zh/skills#override-skill-visibility-from-settings) 从设置中实现同样的效果。

[子代理](/zh/sub-agents)有自己的全新上下文，与你的主对话完全分离。它们的工作不会膨胀你的上下文。完成后，它们返回一个摘要。这种隔离性是子代理有助于长会话的原因。

有关每个功能的开销，请参阅[上下文成本](/zh/features-overview#understand-context-costs)；有关管理上下文的技巧，请参阅[减少 token 使用量](/zh/costs#reduce-token-usage)。

## 使用检查点和权限保持安全

Claude 有两个安全机制：检查点让你可以撤销文件更改，权限控制 Claude 无需询问即可执行的操作。

### 使用检查点撤销更改

**每次文件编辑都是可逆的。** 在 Claude 编辑任何文件之前，它会快照当前内容。如果出现问题，按两次 `Esc` 回退到之前的状态，或要求 Claude 撤销。

检查点在你的会话中本地存储，与 git 分离。它们只涵盖文件更改。影响远程系统（数据库、API、部署）的操作无法创建检查点，这就是为什么 Claude 在运行有外部副作用的命令之前会询问。

### 控制 Claude 可以做什么

按 `Shift+Tab` 循环切换权限模式：

* **默认**：Claude 在文件编辑和 shell 命令前询问
* **自动接受编辑**：Claude 编辑文件和运行常见的文件系统命令（如 `mkdir` 和 `mv`）时无需询问，其他命令仍然询问
* **计划模式**：Claude 仅使用只读工具，创建一个你可以在执行前审批的计划
* **自动模式**：Claude 使用后台安全检查评估所有操作。目前为研究预览版

你还可以在 `.claude/settings.json` 中允许特定命令，这样 Claude 就不会每次都询问。这对于可信命令（如 `npm test` 或 `git status`）很有用。设置的范围可以从组织级策略到个人偏好。详情请参阅[权限](/zh/permissions)。

***

## 高效使用 Claude Code

这些技巧帮助你从 Claude Code 获得更好的结果。

### 向 Claude Code 寻求帮助

Claude Code 可以教你如何使用它。问一些问题，比如"我如何设置钩子？"或"构建 CLAUDE.md 的最佳方式是什么？"Claude 会解释。

内置命令也会引导你完成设置：

* `/init` 引导你为项目创建 CLAUDE.md
* `/agents` 帮助你配置自定义子代理
* `/doctor` 诊断安装中的常见问题

### 这是一场对话

Claude Code 是对话式的。你不需要完美的提示词。从你想要的开始，然后细化：

```text
修复登录 bug
```

\[Claude 调查，尝试了一些方法]

```text
那不太对。问题在会话处理中。
```

\[Claude 调整方法]

当第一次尝试不正确时，你不需要重新开始。你可以迭代。

#### 中断和引导

你可以在任何时刻重定向 Claude，无需等待轮次完成或重新开始：

* **按 `Esc`** 立即停止 Claude。正在运行的工具调用被取消，Claude 等待你的下一步指令。
* **输入修正并按 `Enter`** 发送而不停止正在运行的工具。Claude 在当前操作完成后立即读取它，并在决定下一步之前进行调整。

### 前期要具体

你的初始提示词越精确，需要的修正就越少。引用具体的文件，提到约束，并指向示例模式。

```text
结账流程对卡片过期的用户失效。
检查 src/payments/ 中的问题，特别是 token 刷新。
先编写一个失败的测试，然后修复它。
```

模糊的提示词也能用，但你会花更多时间引导。像上面这样具体的提示词通常在第一次尝试时就能成功。

### 给 Claude 提供验证依据

当 Claude 能检查自己的工作时，它表现得更好。包含测试用例，粘贴预期 UI 的截图，或定义你想要的输出。

```text
实现 validateEmail。测试用例：'user@example.com' → true，
'invalid' → false，'user@.com' → false。之后运行测试。
```

对于视觉工作，粘贴设计的截图，要求 Claude 将其实施与之对比。

### 先探索再实现

对于复杂问题，将研究与编码分开。使用计划模式（按两次 `Shift+Tab`）先分析代码库：

```text
阅读 src/auth/ 并了解我们如何处理会话。
然后创建一个添加 OAuth 支持的计划。
```

审查计划，通过对话细化，然后让 Claude 实施。这种两阶段方法比直接跳到代码能产生更好的结果。

### 委派，而非指挥

像委派给一位能干的同事一样。给出上下文和方向，然后信任 Claude 来处理细节：

```text
结账流程对卡片过期的用户失效。
相关代码在 src/payments/ 中。你能调查并修复它吗？
```

你不需要指定读取哪些文件或运行什么命令。Claude 会自己解决。

## 下一步

- **使用功能扩展**：添加技能、MCP 连接和自定义命令 — [了解更多](/zh/features-overview)
- **常见工作流**：典型任务的分步指南 — [了解更多](/zh/common-workflows)
