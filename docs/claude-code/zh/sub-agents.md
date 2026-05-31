# 创建自定义子代理

> 在 Claude Code 中创建和使用专门的 AI 子代理，用于特定任务的工作流和改进的上下文管理。

子代理是专门处理特定类型任务的 AI 助手。当一个附带任务会给你的主对话带来大量不会再引用的搜索结果、日志或文件内容时，请使用子代理：子代理在自己的上下文中完成该工作，只返回摘要。当你不断用相同的指示生成同类型的 worker 时，请定义自定义子代理。

每个子代理在自己的上下文窗口中运行，拥有自定义的系统提示词、特定的工具访问权限和独立的权限。当 Claude 遇到与子代理描述匹配的任务时，它会委托给该子代理，子代理独立工作并返回结果。若要直观了解上下文节省效果，[上下文窗口可视化](/zh/context-window) 展示了一个子代理在自己独立窗口中处理研究工作的会话过程。

子代理在单个会话内工作。若要并行运行多个独立会话并从一处监控它们，请参阅[后台代理](/zh/agent-view)。若要让会话之间相互通信，请参阅[代理团队](/zh/agent-teams)。

子代理帮助你：

* **保留上下文** — 将探索和实现工作从主对话中分离出来
* **强制约束** — 限制子代理可以使用的工具
* **复用配置** — 通过用户级子代理在项目间复用
* **专业化行为** — 为特定领域使用专注的系统提示词
* **控制成本** — 将任务路由到更快、更便宜的模型如 Haiku

Claude 使用每个子代理的描述来决定何时委托任务。创建子代理时，请编写清晰的描述，以便 Claude 知道何时使用它。

Claude Code 包含几个内置子代理，如 **Explore**、**Plan** 和 **general-purpose**。你也可以创建自定义子代理来处理特定任务。本页涵盖：

* [内置子代理](#内置子代理)
* [如何创建自己的子代理](#快速入门创建你的第一个子代理)
* [完整配置选项](#配置子代理)
* [子代理使用模式](#使用子代理)
* [Fork 子代理](#fork-当前对话)
* [示例子代理](#示例子代理)

## 内置子代理

Claude Code 包含内置子代理，Claude 会在适当时自动使用。每个子代理继承父会话的权限，并附加工具限制。

Explore 和 Plan 会跳过你的 CLAUDE.md 文件和父会话的 git 状态，以保持研究的快速和低成本。所有其他内置和[自定义子代理](#配置子代理)都会加载两者。有关子代理加载内容的完整说明，请参阅[启动时加载内容](#启动时加载内容)。

**Explore**

一个快速的只读代理，专为搜索和分析代码库而优化。

* **模型**：Haiku（快速、低延迟）
* **工具**：只读工具（拒绝访问 Write 和 Edit 工具）
* **用途**：文件发现、代码搜索、代码库探索

当 Claude 需要搜索或理解代码库而不做更改时，会委托给 Explore。这可以将探索结果从主对话上下文中分离出来。

调用 Explore 时，Claude 会指定详细程度：**quick** 用于定向查找，**medium** 用于平衡探索，**very thorough** 用于全面分析。

**Plan**

在[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)期间使用的研究代理，在呈现计划之前收集上下文。

* **模型**：继承主对话
* **工具**：只读工具（拒绝访问 Write 和 Edit 工具）
* **用途**：用于规划的代码库研究

当你处于计划模式且 Claude 需要理解你的代码库时，它会将研究委托给 Plan 子代理。这可以防止无限嵌套（子代理不能生成其他子代理），同时仍然收集必要的上下文。

**General-purpose**

一个功能强大的代理，适用于需要同时进行探索和操作的复杂多步骤任务。

* **模型**：继承主对话
* **工具**：所有工具
* **用途**：复杂研究、多步骤操作、代码修改

当任务需要同时进行探索和修改、需要复杂推理来解释结果、或需要多个依赖步骤时，Claude 会委托给 general-purpose。

**其他**

Claude Code 包含用于特定任务的额外辅助代理。这些通常自动调用，因此你不需要直接使用它们。

| 代理                  | 模型    | Claude 使用时机                                   |
| :------------------- | :------ | :----------------------------------------------- |
| statusline-setup     | Sonnet  | 当你运行 `/statusline` 配置状态栏时                |
| claude-code-guide    | Haiku   | 当你询问 Claude Code 功能相关问题时                |

除了这些内置子代理，你还可以使用自定义提示词、工具限制、权限模式、钩子和技能创建自己的子代理。以下各节展示如何开始和自定义子代理。

## 快速入门：创建你的第一个子代理

子代理在带有 YAML frontmatter 的 Markdown 文件中定义。你可以[手动创建](#编写子代理文件)或使用 `/agents` 命令。

本指南将引导你使用 `/agents` 命令创建一个用户级子代理。该子代理审查代码并为代码库提出改进建议。

1. **打开子代理界面**

   在 Claude Code 中运行：

   ```text
   /agents
   ```

2. **选择位置**

   切换到 **Library** 选项卡，选择 **Create new agent**，然后选择 **Personal**。这会将子代理保存到 `~/.claude/agents/`，使其在所有项目中可用。

3. **使用 Claude 生成**

   选择 **Generate with Claude**。出现提示时，描述子代理：

   ```text
   A code improvement agent that scans files and suggests improvements
   for readability, performance, and best practices. It should explain
   each issue, show the current code, and provide an improved version.
   ```

   Claude 会为你生成标识符、描述和系统提示词。

4. **选择工具**

   对于只读审查者，取消选择除 **Read-only tools** 之外的所有选项。如果你保留所有工具选中，子代理将继承主对话的所有可用工具。

5. **选择模型**

   选择子代理使用的模型。对于此示例代理，选择 **Sonnet**，它在分析代码模式时兼顾能力和速度。

6. **选择颜色**

   为子代理选择背景颜色。这有助于你在界面中识别哪个子代理正在运行。

7. **配置记忆**

   选择 **User scope** 为子代理提供[持久化记忆目录](#启用持久化记忆)，位于 `~/.claude/agent-memory/`。子代理使用它在对话间积累见解，如代码库模式和反复出现的问题。如果你不希望子代理持久化学习内容，请选择 **None**。

8. **保存并试用**

   查看配置摘要。按 `s` 或 `Enter` 保存，或按 `e` 保存并在编辑器中打开文件。子代理立即可用。试试：

   ```text
   Use the code-improver agent to suggest improvements in this project
   ```

   Claude 会委托给你的新子代理，子代理扫描代码库并返回改进建议。

你现在拥有了一个可以在机器上任何项目中使用的子代理，用于分析代码库并提出改进建议。

你也可以手动将子代理创建为 Markdown 文件、通过 CLI 标志定义它们，或通过插件分发它们。以下各节涵盖所有配置选项。

## 配置子代理

### 使用 /agents 命令

`/agents` 命令打开一个用于管理子代理的标签页界面。**Running** 选项卡显示正在运行的子代理并允许你打开或停止它们。**Library** 选项卡允许你：

* 查看所有可用的子代理（内置、用户、项目和插件）
* 使用引导设置或 Claude 生成创建新子代理
* 编辑现有子代理配置和工具访问
* 删除自定义子代理
* 当存在重复项时查看哪些子代理处于活动状态

这是创建和管理子代理的推荐方式。对于手动创建或自动化，你也可以直接添加子代理文件。

### 选择子代理作用域

子代理是带有 YAML frontmatter 的 Markdown 文件。根据作用域存储在不同的位置。当多个子代理共享相同名称时，优先级更高的位置获胜。

| 位置                         | 作用域                | 优先级      | 创建方式                                    |
| :--------------------------- | :------------------- | :---------- | :----------------------------------------- |
| 托管设置                      | 组织范围              | 1（最高）    | 通过[托管设置](/zh/settings)部署              |
| `--agents` CLI 标志           | 当前会话              | 2           | 启动 Claude Code 时传递 JSON                 |
| `.claude/agents/`             | 当前项目              | 3           | 交互式或手动                                 |
| `~/.claude/agents/`           | 你的所有项目           | 4           | 交互式或手动                                 |
| 插件的 `agents/` 目录          | 插件启用的位置         | 5（最低）    | 随[插件](/zh/plugins)安装                     |

**项目子代理**（`.claude/agents/`）非常适合特定于代码库的子代理。将它们签入版本控制，以便你的团队可以协作使用和改进它们。

项目子代理通过从当前工作目录向上遍历来发现。通过 `--add-dir` 添加的目录[仅授予文件访问权限](/zh/permissions#additional-directories-grant-file-access-not-configuration)，不会扫描子代理。要在项目间共享子代理，请使用 `~/.claude/agents/` 或[插件](/zh/plugins)。

**用户子代理**（`~/.claude/agents/`）是在你所有项目中可用的个人子代理。

Claude Code 递归扫描 `.claude/agents/` 和 `~/.claude/agents/`，因此你可以将定义组织到子文件夹中，如 `agents/review/` 或 `agents/research/`。子目录路径不影响子代理的标识或调用方式，因为标识仅来自 `name` frontmatter 字段。在整个树中保持 `name` 值唯一：如果同一作用域内的两个文件声明了相同的名称，Claude Code 会保留一个并丢弃另一个，且不发出警告。

插件的 `agents/` 目录也会递归扫描。与项目和用户作用域不同，插件 `agents/` 目录内的子文件夹成为[作用域标识符](#显式调用子代理)的一部分：插件 `my-plugin` 中位于 `agents/review/security.md` 的文件注册为 `my-plugin:review:security`。

**CLI 定义的子代理**在启动 Claude Code 时作为 JSON 传递。它们仅存在于该会话中，不会保存到磁盘，这使其适用于快速测试或自动化脚本。你可以在单个 `--agents` 调用中定义多个子代理：

macOS、Linux、WSL：

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

Windows PowerShell：

```powershell
claude --agents @'
{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}
'@
```

`--agents` 标志接受与基于文件的子代理相同的 [frontmatter](#支持的-frontmatter-字段) 字段的 JSON：`description`、`prompt`、`tools`、`disallowedTools`、`model`、`permissionMode`、`mcpServers`、`hooks`、`maxTurns`、`skills`、`initialPrompt`、`memory`、`effort`、`background`、`isolation` 和 `color`。使用 `prompt` 作为系统提示词，等同于基于文件的子代理中的 Markdown 正文。

**托管子代理**由组织管理员部署。将 Markdown 文件放在[托管设置目录](/zh/settings#settings-files)中的 `.claude/agents/` 内，使用与项目和用户子代理相同的 frontmatter 格式。托管定义优先于同名的项目和用户子代理。

**插件子代理**来自你安装的[插件](/zh/plugins)。它们与你的自定义子代理一起出现在 `/agents` 中。有关创建插件子代理的详情，请参阅[插件组件参考](/zh/plugins-reference#agents)。

出于安全原因，插件子代理不支持 `hooks`、`mcpServers` 或 `permissionMode` frontmatter 字段。从插件加载代理时，这些字段会被忽略。如果你需要它们，请将代理文件复制到 `.claude/agents/` 或 `~/.claude/agents/` 中。你也可以在 `settings.json` 或 `settings.local.json` 中向 [`permissions.allow`](/zh/settings#permission-settings) 添加规则，但这些规则适用于整个会话，而不仅仅是插件子代理。

来自这些作用域的子代理定义也可供[代理团队](/zh/agent-teams#use-subagent-definitions-for-teammates)使用：生成队友时，你可以引用子代理类型，队友使用其 `tools` 和 `model`，定义的正文作为附加指令附加到队友的系统提示词中。有关该路径适用的 frontmatter 字段，请参阅[代理团队](/zh/agent-teams#use-subagent-definitions-for-teammates)。

### 编写子代理文件

子代理文件使用 YAML frontmatter 进行配置，后跟 Markdown 中的系统提示词：

子代理在会话启动时加载。如果你直接在磁盘上添加或编辑子代理文件，请重启会话以加载它。通过 `/agents` 界面创建的子代理会立即生效，无需重启。

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

frontmatter 定义子代理的元数据和配置。正文成为指导子代理行为的系统提示词。子代理仅接收此系统提示词（加上基本环境详情如工作目录），而不是完整的 Claude Code 系统提示词。

子代理在主对话的当前工作目录中启动。在子代理内，`cd` 命令不会在 Bash 或 PowerShell 工具调用之间持久化，也不会影响主对话的工作目录。若要为子代理提供仓库的隔离副本，请设置 [`isolation: worktree`](#支持的-frontmatter-字段)。

#### 支持的 frontmatter 字段

以下字段可用于 YAML frontmatter。只有 `name` 和 `description` 是必需的。

| 字段               | 必需 | 描述                                                                                                                                                                                                                                                                                                                                     |
| :----------------- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | 是   | 使用小写字母和连字符的唯一标识符。[钩子](/zh/hooks#subagentstart)将此值作为 `agent_type` 接收。文件名不必匹配                                                                                                                                                                    |
| `description`      | 是   | Claude 何时应委托给此子代理                                                                                                                                                                                                                                                                                                               |
| `tools`            | 否   | 子代理可以使用的[工具](#可用工具)。如果省略则继承所有工具。若要将技能预加载到上下文中，请使用 `skills` 字段而非在此列出 `Skill`                                                                                                                                                                                                       |
| `disallowedTools`  | 否   | 要拒绝的工具，从继承或指定的列表中移除                                                                                                                                                                                                                                                                                                     |
| `model`            | 否   | 要使用的[模型](#选择模型)：`sonnet`、`opus`、`haiku`、完整模型 ID（例如 `claude-opus-4-8`）或 `inherit`。默认为 `inherit`                                                                                                                                                                                                             |
| `permissionMode`   | 否   | [权限模式](#权限模式)：`default`、`acceptEdits`、`auto`、`dontAsk`、`bypassPermissions` 或 `plan`。[插件子代理](#选择子代理作用域)忽略此字段                                                                                                                                                                                  |
| `maxTurns`         | 否   | 子代理停止前的最大代理轮数                                                                                                                                                                                                                                                                                                                  |
| `skills`           | 否   | 在启动时预加载到子代理上下文中的[技能](/zh/skills)。注入的是完整的技能内容，而非仅描述。子代理仍可通过 Skill 工具调用未列出的项目、用户和插件技能                                                                                                                                                                                               |
| `mcpServers`       | 否   | 此子代理可用的 [MCP 服务器](/zh/mcp)。每个条目是引用已配置服务器的服务器名称（如 `"slack"`）或以服务器名称为键、完整 [MCP 服务器配置](/zh/mcp#installing-mcp-servers)为值的内联定义。[插件子代理](#选择子代理作用域)忽略此字段                                                                                                              |
| `hooks`            | 否   | 限定于此子代理的[生命周期钩子](#为子代理定义钩子)。[插件子代理](#选择子代理作用域)忽略此字段                                                                                                                                                                                                                              |
| `memory`           | 否   | [持久化记忆作用域](#启用持久化记忆)：`user`、`project` 或 `local`。启用跨会话学习                                                                                                                                                                                                                                                  |
| `background`       | 否   | 设置为 `true` 以始终作为[后台任务](#在前台或后台运行子代理)运行此子代理。默认：`false`                                                                                                                                                                                                                                     |
| `effort`           | 否   | 此子代理活动时的努力级别。覆盖会话努力级别。默认：继承自会话。选项：`low`、`medium`、`high`、`xhigh`、`max`；可用级别取决于模型                                                                                                                                                                                                                 |
| `isolation`        | 否   | 设置为 `worktree` 以在临时 [git 工作树](/zh/worktrees)中运行子代理，为其提供仓库的隔离副本，默认从你的[默认分支](/zh/worktrees#choose-the-base-branch)分叉，而非父会话的 `HEAD`。如果子代理未做任何更改，工作树会自动清理                                                                                                                        |
| `color`            | 否   | 子代理在任务列表和转录中的显示颜色。接受 `red`、`blue`、`green`、`yellow`、`purple`、`orange`、`pink` 或 `cyan`                                                                                                                                                                                                                              |
| `initialPrompt`    | 否   | 当此代理作为主会话代理运行时（通过 `--agent` 或 `agent` 设置），自动提交为第一个用户轮次。会处理[命令](/zh/commands)和[技能](/zh/skills)。前置到任何用户提供的提示词之前                                                                                                                                                                         |

### 选择模型

`model` 字段控制子代理使用的 [AI 模型](/zh/model-config)：

* **模型别名**：使用可用别名之一：`sonnet`、`opus` 或 `haiku`
* **完整模型 ID**：使用完整模型 ID，如 `claude-opus-4-8` 或 `claude-sonnet-4-6`。接受与 `--model` 标志相同的值
* **inherit**：使用与主对话相同的模型
* **省略**：如果未指定，默认为 `inherit`（使用与主对话相同的模型）

当 Claude 调用子代理时，它还可以为该特定调用传递 `model` 参数。Claude Code 按以下顺序解析子代理的模型：

1. [`CLAUDE_CODE_SUBAGENT_MODEL`](/zh/model-config#environment-variables) 环境变量（如果已设置）
2. 每次调用的 `model` 参数
3. 子代理定义的 `model` frontmatter
4. 主对话的模型

### 控制子代理能力

你可以通过工具访问、权限模式和条件规则来控制子代理可以做什么。

#### 可用工具

子代理默认继承主对话中可用的[内部工具](/zh/tools-reference)和 MCP 工具。以下工具依赖于主对话的 UI 或会话状态，即使列在 `tools` 字段中也不可用于子代理：

* `Agent`
* `AskUserQuestion`
* `EnterPlanMode`
* `ExitPlanMode`，除非子代理的 [`permissionMode`](#权限模式) 为 `plan`
* `ScheduleWakeup`
* `WaitForMcpServers`

要限制工具，请使用 `tools` 字段（允许列表）或 `disallowedTools` 字段（拒绝列表）。此示例使用 `tools` 专门允许 Read、Grep、Glob 和 Bash。子代理不能编辑文件、写入文件或使用任何 MCP 工具：

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

此示例使用 `disallowedTools` 从主对话继承除 Write 和 Edit 之外的所有工具。子代理保留 Bash、MCP 工具和其他所有工具：

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

如果两者都设置了，`disallowedTools` 先被应用，然后 `tools` 针对剩余池进行解析。同时列在两者中的工具会被移除。

#### 限制可以生成哪些子代理

当代理使用 `claude --agent` 作为主线程运行时，它可以使用 Agent 工具生成子代理。要限制它可以生成哪些子代理类型，请在 `tools` 字段中使用 `Agent(agent_type)` 语法。

在 v2.1.63 版本中，Task 工具已重命名为 Agent。设置和代理定义中现有的 `Task(...)` 引用仍作为别名工作。

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

这是一个允许列表：只有 `worker` 和 `researcher` 子代理可以被生成。如果代理尝试生成任何其他类型，请求会失败，代理在其提示词中只看到允许的类型。要阻止特定代理同时允许所有其他代理，请改用 [`permissions.deny`](#禁用特定子代理)。

要允许无限制地生成任何子代理，请使用不带括号的 `Agent`：

```yaml
tools: Agent, Read, Bash
```

如果 `Agent` 完全省略在 `tools` 列表之外，代理不能生成任何子代理。此限制仅适用于使用 `claude --agent` 作为主线程运行的代理。子代理不能生成其他子代理，因此 `Agent(agent_type)` 在子代理定义中无效。

#### 将 MCP 服务器限定到子代理

使用 `mcpServers` 字段让子代理访问主对话中不可用的 [MCP](/zh/mcp) 服务器。此处定义的内联服务器在子代理启动时连接，完成时断开。字符串引用共享父会话的连接。

`mcpServers` 字段在代理文件可以运行的两种上下文中都适用：

* 作为子代理，通过 Agent 工具或 @-mention 生成
* 作为主会话，通过 [`--agent`](#显式调用子代理) 或 `agent` 设置启动

当代理是主会话时，内联服务器定义在启动时与来自 [`.mcp.json`](/zh/mcp) 和设置文件的服务器一起连接。

列表中的每个条目是内联服务器定义或引用会话中已配置的 MCP 服务器的字符串：

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # 内联定义：仅限定于此子代理
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 按名称引用：复用已配置的服务器
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

内联定义使用与 `.mcp.json` 服务器条目相同的模式（`stdio`、`http`、`sse`、`ws`），以服务器名称为键。

要将 MCP 服务器完全排除在主对话之外，避免其工具描述消耗上下文，请在此处内联定义而非在 `.mcp.json` 中定义。子代理获得工具；父对话则不会。

自 v2.1.153 起，适用于主会话的 MCP 限制也涵盖子代理 frontmatter 中声明的服务器：

* [`--strict-mcp-config`](/zh/cli-reference) 和 [`--bare`](/zh/cli-reference)
* [企业托管 MCP 配置](/zh/managed-mcp)
* [`allowedMcpServers` 和 `deniedMcpServers` 策略](/zh/managed-mcp#policy-based-control-with-allowlists-and-denylists)

当其中之一阻止服务器时，Claude Code 会跳过它并显示警告，指出被阻止的服务器。

托管设置限制适用于每个子代理，无论其如何定义。`--strict-mcp-config` 不会过滤你通过 `--agents` 或 SDK `agents` 选项内联传递的服务器，因为这些是显式的调用者输入。

#### 权限模式

`permissionMode` 字段控制子代理如何处理权限提示。子代理继承主对话的权限上下文并可以覆盖模式，除非父模式在如下所述情况下优先。

| 模式                 | 行为                                                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`            | 标准权限检查，带提示                                                                                                                          |
| `acceptEdits`        | 自动接受工作目录或 `additionalDirectories` 中路径的文件编辑和常见文件系统命令                                                                     |
| `auto`               | [自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)：后台分类器审查命令和受保护目录写入                                              |
| `dontAsk`            | 自动拒绝权限提示（显式允许的工具仍然工作）                                                                                                       |
| `bypassPermissions`  | 跳过权限提示                                                                                                                                   |
| `plan`               | 计划模式（只读探索）                                                                                                                            |

请谨慎使用 `bypassPermissions`。它跳过所有权限提示，允许子代理无需批准即可执行操作，包括写入 `.git`、`.claude`、`.vscode`、`.idea`、`.husky` 和 `.cargo`。根目录和主目录的删除操作（如 `rm -rf /`）仍会作为断路器提示。详情请参阅[权限模式](/zh/permission-modes#skip-all-checks-with-bypasspermissions-mode)。

如果父级使用 `bypassPermissions` 或 `acceptEdits`，这会优先且无法被覆盖。如果父级使用[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)，子代理继承自动模式，其 frontmatter 中的任何 `permissionMode` 都会被忽略：分类器使用与父会话相同的阻止和允许规则评估子代理的工具调用。

#### 将技能预加载到子代理中

使用 `skills` 字段在启动时将技能内容注入子代理的上下文。这为子代理提供领域知识，无需在执行过程中发现和加载技能。

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

列出的每个技能的完整内容在启动时注入子代理的上下文。此字段控制预加载哪些技能，而非子代理可以访问哪些技能：没有它，子代理仍可在执行过程中通过 Skill 工具发现和调用项目、用户和插件技能。要完全阻止子代理调用技能，请从 [`tools`](#可用工具) 列表中省略 `Skill` 或将其添加到 `disallowedTools`。

你不能预加载设置了 [`disable-model-invocation: true`](/zh/skills#control-who-invokes-a-skill) 的技能，因为预加载使用的是 Claude 可以调用的同一组技能。如果列出的技能缺失或被禁用，Claude Code 会跳过它并将警告记录到调试日志。

这与[在子代理中运行技能](/zh/skills#run-skills-in-a-subagent)相反。在子代理中使用 `skills` 时，子代理控制系统提示词并加载技能内容。在技能中使用 `context: fork` 时，技能内容注入到你指定的代理中。两者使用相同的底层系统。

#### 启用持久化记忆

`memory` 字段为子代理提供跨会话持久化的目录。子代理使用此目录随时间积累知识，如代码库模式、调试见解和架构决策。

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

根据记忆应适用的范围选择作用域：

| 作用域      | 位置                                             | 适用场景                                                                                   |
| :---------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `user`      | `~/.claude/agent-memory/<name-of-agent>/`        | 子代理应跨所有项目记住学习内容                                                              |
| `project`   | `.claude/agent-memory/<name-of-agent>/`          | 子代理的知识是项目特定的，可通过版本控制共享                                                  |
| `local`     | `.claude/agent-memory-local/<name-of-agent>/`    | 子代理的知识是项目特定的，但不应签入版本控制                                                  |

启用记忆时：

* 子代理的系统提示词包含读取和写入记忆目录的指示。
* 子代理的系统提示词还包含记忆目录中 `MEMORY.md` 的前 200 行或 25KB（以先到者为准），并附有在超出限制时整理 `MEMORY.md` 的指示。
* Read、Write 和 Edit 工具会自动启用，以便子代理管理其记忆文件。

##### 持久化记忆提示

* `project` 是推荐的默认作用域。它使子代理知识可通过版本控制共享。当子代理的知识广泛适用于各项目时使用 `user`，当知识不应签入版本控制时使用 `local`。
* 要求子代理在开始工作前查阅其记忆："审查此 PR，并检查你的记忆中是否有你之前见过的模式。"
* 要求子代理在完成任务后更新其记忆："完成后，将你学到的内容保存到你的记忆中。"随着时间推移，这会建立一个知识库，使子代理更加高效。
* 在子代理的 Markdown 文件中直接包含记忆指示，使其主动维护自己的知识库：

  ```markdown
  Update your agent memory as you discover codepaths, patterns, library
  locations, and key architectural decisions. This builds up institutional
  knowledge across conversations. Write concise notes about what you found
  and where.
  ```

#### 使用钩子的条件规则

要更动态地控制工具使用，请使用 `PreToolUse` 钩子在操作执行前验证它们。当你需要允许工具的某些操作同时阻止其他操作时，这很有用。

此示例创建一个仅允许只读数据库查询的子代理。`PreToolUse` 钩子在每个 Bash 命令执行前运行 `command` 中指定的脚本：

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

Claude Code [通过 stdin 以 JSON 格式传递钩子输入](/zh/hooks#pretooluse-input)给钩子命令。验证脚本读取此 JSON，提取 Bash 命令，并[以退出码 2 退出](/zh/hooks#exit-code-2-behavior-per-event)以阻止写入操作：

```bash
#!/bin/bash
# ./scripts/validate-readonly-query.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# 阻止 SQL 写入操作（不区分大小写）
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi

exit 0
```

有关完整输入模式，请参阅[钩子输入](/zh/hooks#pretooluse-input)，有关退出码如何影响行为，请参阅[退出码](/zh/hooks#exit-code-output)。在 Windows 上，用 PowerShell 编写钩子脚本，并在钩子条目中添加 `shell: powershell`，如[在 PowerShell 中运行钩子](/zh/hooks#windows-powershell-tool)所示。

#### 禁用特定子代理

你可以通过将特定子代理添加到[设置](/zh/settings#permission-settings)中的 `deny` 数组来阻止 Claude 使用它们。使用格式 `Agent(subagent-name)`，其中 `subagent-name` 与子代理的 name 字段匹配。

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

这对内置和自定义子代理都有效。你也可以使用 `--disallowedTools` CLI 标志：

```bash
claude --disallowedTools "Agent(Explore)"
```

有关权限规则的更多详情，请参阅[权限文档](/zh/permissions#tool-specific-permission-rules)。

### 为子代理定义钩子

子代理可以定义在子代理生命周期内运行的[钩子](/zh/hooks)。有两种配置钩子的方式：

1. **在子代理的 frontmatter 中**：定义仅在该子代理活动时运行的钩子
2. **在 `settings.json` 中**：定义在子代理启动或停止时在主会话中运行的钩子

#### 子代理 frontmatter 中的钩子

直接在子代理的 Markdown 文件中定义钩子。这些钩子仅在该特定子代理活动时运行，并在其完成后清理。

frontmatter 钩子在代理通过 Agent 工具或 @-mention 作为子代理生成时触发，以及通过 [`--agent`](#显式调用子代理) 或 `agent` 设置作为主会话运行时触发。在主会话情况下，它们与 [`settings.json`](/zh/hooks) 中定义的任何钩子一起运行。

所有[钩子事件](/zh/hooks#hook-events)都受支持。子代理最常见的事件是：

| 事件           | 匹配器输入 | 触发时机                                           |
| :------------- | :--------- | :------------------------------------------------- |
| `PreToolUse`   | 工具名称   | 子代理使用工具之前                                   |
| `PostToolUse`  | 工具名称   | 子代理使用工具之后                                   |
| `Stop`         | （无）     | 子代理完成时（运行时转换为 `SubagentStop`）            |

此示例使用 `PreToolUse` 钩子验证 Bash 命令，使用 `PostToolUse` 在文件编辑后运行 linter：

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

当代理作为子代理调用时，frontmatter 中的 `Stop` 钩子会自动转换为 `SubagentStop` 事件。

#### 子代理事件的项目级钩子

在 `settings.json` 中配置响应主会话中子代理生命周期事件的钩子。

| 事件              | 匹配器输入     | 触发时机                     |
| :---------------- | :------------- | :--------------------------- |
| `SubagentStart`   | 代理类型名称   | 子代理开始执行时              |
| `SubagentStop`    | 代理类型名称   | 子代理完成时                  |

两个事件都支持匹配器以按名称定位特定代理类型。此示例仅在 `db-agent` 子代理启动时运行设置脚本，在任何子代理停止时运行清理脚本：

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

有关完整的钩子配置格式，请参阅[钩子](/zh/hooks)。

## 使用子代理

### 理解自动委托

Claude 根据请求中的任务描述、子代理配置中的 `description` 字段和当前上下文自动委托任务。要鼓励主动委托，请在子代理的 description 字段中包含"use proactively"等短语。

### 显式调用子代理

当自动委托不够时，你可以自己请求子代理。三种模式从一次性建议升级到会话范围的默认值：

* **自然语言**：在提示词中命名子代理；Claude 决定是否委托
* **@-mention**：保证子代理为一个任务运行
* **会话范围**：整个会话使用该子代理的系统提示词、工具限制和模型，通过 `--agent` 标志或 `agent` 设置

对于自然语言，没有特殊语法。命名子代理，Claude 通常会委托：

```text
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**@-mention 子代理。** 输入 `@` 并从自动补全中选择子代理，与 @-mention 文件的方式相同。这确保运行的是特定子代理，而非将选择留给 Claude：

```text
@"code-reviewer (agent)" look at the auth changes
```

你的完整消息仍会发送给 Claude，Claude 根据你的请求编写子代理的任务提示词。@-mention 控制 Claude 调用哪个子代理，而非它接收什么提示词。

已启用[插件](/zh/plugins)提供的子代理在自动补全中以其作用域名称出现，如 `my-plugin:code-reviewer` 或当插件[将代理组织到子文件夹中](#选择子代理作用域)时为 `my-plugin:review:security`。当前在会话中运行的命名后台子代理也会出现在自动补全中，在名称旁边显示其状态。你也可以手动输入 mention 而不使用选择器：本地子代理使用 `@agent-<name>`，插件子代理使用 `@agent-` 后跟作用域名称，例如 `@agent-my-plugin:code-reviewer`。

**将整个会话作为子代理运行。** 传递 [`--agent <name>`](/zh/cli-reference) 以启动主线程本身采用该子代理的系统提示词、工具限制和模型的会话：

```bash
claude --agent code-reviewer
```

子代理的系统提示词完全替代默认的 Claude Code 系统提示词，与 [`--system-prompt`](/zh/cli-reference) 的方式相同。`CLAUDE.md` 文件和项目记忆仍通过正常消息流加载。代理名称在启动标题中显示为 `@<name>`，以便你确认其处于活动状态。

这适用于内置和自定义子代理，当你恢复会话时选择会持久化。

对于插件提供的子代理，你可以只传递代理名称，Claude Code 会找到它：

```bash
claude --agent security-reviewer
```

如果多个插件提供同名代理，请传递作用域名称以消除歧义：

```bash
claude --agent my-plugin:security-reviewer
```

如果插件将代理放在其 `agents/` 目录的子文件夹中，请在作用域名称中包含子文件夹，例如 `claude --agent my-plugin:review:security`。

要使其成为项目中每个会话的默认值，请在 `.claude/settings.json` 中设置 `agent`：

```json
{
  "agent": "code-reviewer"
}
```

如果两者都存在，CLI 标志会覆盖设置。

### 在前台或后台运行子代理

子代理可以在前台（阻塞）或后台（并发）运行：

* **前台子代理**阻塞主对话直到完成。权限提示在出现时传递给你。
* **后台子代理**在你继续工作时并发运行。它们使用会话中已授予的权限运行，自动拒绝任何原本会提示的工具调用。如果后台子代理需要提出澄清问题，该工具调用会失败但子代理继续运行。

如果后台子代理因缺少权限而失败，你可以启动一个新的前台子代理执行相同任务，以交互式提示重试。

Claude 根据任务决定在前台还是后台运行子代理。你也可以：

* 要求 Claude "在后台运行"
* 按 **Ctrl+B** 将正在运行的任务转到后台

要禁用所有后台任务功能，请将 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 环境变量设置为 `1`。请参阅[环境变量](/zh/env-vars)。

当启用 [fork 模式](#fork-当前对话)时，每次子代理生成都在后台运行，无论 `background` 字段如何。Fork 仍会在终端中出现权限提示；命名子代理如上所述自动拒绝任何会提示的内容。

### 常见模式

#### 隔离高流量操作

子代理最有效的用途之一是隔离产生大量输出的操作。运行测试、获取文档或处理日志文件会消耗大量上下文。通过将这些委托给子代理，冗长的输出保留在子代理的上下文中，只有相关摘要返回到你的主对话。

```text
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### 运行并行研究

对于独立调查，生成多个子代理同时工作：

```text
Research the authentication, database, and API modules in parallel using separate subagents
```

每个子代理独立探索其领域，然后 Claude 综合结果。当研究路径不相互依赖时效果最佳。

当子代理完成时，其结果返回到你的主对话。运行多个各自返回详细结果的子代理可能会消耗大量上下文。

对于需要持续并行性或超出上下文窗口的任务，[代理团队](/zh/agent-teams)为每个 worker 提供独立的上下文。

#### 链式子代理

对于多步骤工作流，要求 Claude 按顺序使用子代理。每个子代理完成其任务并将结果返回给 Claude，然后 Claude 将相关上下文传递给下一个子代理。

```text
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### 选择子代理还是主对话

使用**主对话**的场景：

* 任务需要频繁的来回交互或迭代改进
* 多个阶段共享大量上下文（规划 -> 实现 -> 测试）
* 你正在做快速、有针对性的更改
* 延迟很重要。子代理从头开始启动，可能需要时间收集上下文

使用**子代理**的场景：

* 任务产生你不需要在主上下文中的冗长输出
* 你想强制执行特定的工具限制或权限
* 工作是自包含的，可以返回摘要

当你想要可复用的提示词或在主对话上下文中而非隔离的子代理上下文中运行的工作流时，请考虑使用[技能](/zh/skills)。

对于对话中已有内容的快速问题，请使用 [`/btw`](/zh/interactive-mode#side-questions-with-%2Fbtw) 而非子代理。它可以看到你的完整上下文但没有工具访问权限，答案会被丢弃而非添加到历史记录中。

子代理不能生成其他子代理。如果你的工作流需要嵌套委托，请使用[技能](/zh/skills)或从主对话[链式调用子代理](#链式子代理)。

### 管理子代理上下文

#### 启动时加载内容

每个子代理以全新的隔离上下文窗口启动。它看不到你的对话历史、你已调用的技能或 Claude 已读取的文件。Claude 编写一个委托消息来总结任务，子代理由此开始工作。例外是 [fork](#fork-当前对话)，它继承父会话而非从头开始。

非 fork 子代理的初始上下文包含：

* **系统提示词**：代理自己的提示词加上 Claude Code 附加的环境详情，而非完整的 Claude Code 系统提示词。自定义子代理在 [markdown 正文](#编写子代理文件)或 `prompt` 字段中定义。内置代理有预定义的提示词。
* **任务消息**：Claude 在移交工作时编写的委托提示词。
* **CLAUDE.md 和记忆**：主对话加载的[记忆层次结构](/zh/memory#how-claude-md-files-load)的每个级别，包括 `~/.claude/CLAUDE.md`、项目规则、`CLAUDE.local.md` 和托管策略文件。内置的 Explore 和 Plan 代理跳过此项。
* **Git 状态**：在父会话开始时拍摄的快照。当工作目录不是 Git 仓库或 [`includeGitInstructions`](/zh/settings#available-settings) 为 `false` 时不存在。Explore 和 Plan 无论如何都跳过它。
* **预加载的技能**：代理 [`skills` 字段](#将技能预加载到子代理中)中命名的任何技能的完整内容。内置代理不预加载技能。

Explore 和 Plan 是唯一省略 CLAUDE.md 和 git 状态的子代理。没有 frontmatter 字段或每个代理的设置可以更改哪些代理跳过它们。

主对话使用完整的 CLAUDE.md 上下文读取 Explore 和 Plan 的结果，因此大多数规则不需要到达子代理本身。如果规则必须到达，如"忽略 `vendor/` 目录"，请在委托给 Claude 时在提示词中重述它。

#### 恢复子代理

每次子代理调用都会创建一个具有全新上下文的新实例。要继续现有子代理的工作而非从头开始，请要求 Claude 恢复它。

恢复的子代理保留其完整的对话历史，包括所有之前的工具调用、结果和推理。子代理从停止的地方继续，而非从头开始。

当子代理完成时，Claude 接收其代理 ID。Claude 使用 `SendMessage` 工具，以代理的 ID 作为 `to` 字段来恢复它。`SendMessage` 工具仅在通过 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 启用[代理团队](/zh/agent-teams)时可用。

要恢复子代理，请要求 Claude 继续之前的工作：

```text
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

如果停止的子代理收到 `SendMessage`，它会在后台自动恢复，无需新的 `Agent` 调用。

你也可以要求 Claude 获取代理 ID，如果你想显式引用它，或者在 `~/.claude/projects/{project}/{sessionId}/subagents/` 的转录文件中查找 ID。每个转录存储为 `agent-{agentId}.jsonl`。

子代理转录独立于主对话持久化：

* **主对话压缩**：当主对话压缩时，子代理转录不受影响。它们存储在单独的文件中。
* **会话持久性**：子代理转录在其会话内持久化。你可以通过恢复同一会话在重启 Claude Code 后[恢复子代理](#恢复子代理)。
* **自动清理**：转录根据 `cleanupPeriodDays` 设置进行清理（默认：30 天）。

#### 自动压缩

子代理支持使用与主对话相同逻辑的自动压缩。默认情况下，自动压缩在大约 95% 容量时触发。要更早触发压缩，请将 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 设置为较低的百分比（例如 `50`）。详情请参阅[环境变量](/zh/env-vars)。

压缩事件记录在子代理转录文件中：

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

`preTokens` 值显示压缩发生前使用了多少 token。

## Fork 当前对话

Fork 子代理是实验性的，需要 Claude Code v2.1.117 或更高版本。行为和配置可能在未来版本中更改。通过将 [`CLAUDE_CODE_FORK_SUBAGENT`](/zh/env-vars) 环境变量设置为 `1` 来启用。该变量在交互模式和通过 SDK 或 `claude -p` 时生效。

Fork 是一个继承到目前为止整个对话而非从头开始的子代理。这消除了子代理原本提供的输入隔离：fork 看到与主会话相同的系统提示词、工具、模型和消息历史，因此你可以交给它一个附带任务而无需重新解释情况。fork 自己的工具调用仍然不会进入你的对话，只有最终结果返回，因此你的主上下文窗口保持干净。当命名子代理需要太多背景信息才有效时，或当你想从同一起点并行尝试多种方法时使用 fork。

启用 fork 模式会以三种方式改变 Claude Code：

* 当 Claude 本应使用 [general-purpose](#内置子代理) 子代理时，它会生成一个 fork。命名子代理如 Explore 仍按之前的方式生成。
* 每次子代理生成都在[后台](#在前台或后台运行子代理)运行，无论是 fork 还是命名子代理。将 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 设置为 `1` 以保持生成同步。
* `/fork` 命令生成一个 fork，而非作为 [`/branch`](/zh/commands) 的别名。

你可以使用 `/fork` 后跟指令自己启动一个 fork。Claude Code 根据指令的前几个词命名 fork。以下示例 fork 对话来为到目前为止的解析器更改起草测试用例，同时你在主会话中继续实现：

```text
/fork draft unit tests for the parser changes so far
```

Fork 出现在提示输入下方的面板中，在后台运行时你可以继续工作。当它完成时，其结果作为消息到达你的主对话。下一节介绍在 fork 运行时监视和引导它们的面板控件。

### 观察和引导运行中的 fork

正在运行的 fork 出现在提示输入下方的面板中，主会话一行，每个 fork 一行。使用以下按键与面板交互：

| 按键        | 操作                                     |
| :---------- | :--------------------------------------- |
| `↑` / `↓`  | 在行之间移动                              |
| `Enter`     | 打开所选 fork 的转录并向其发送后续消息      |
| `x`         | 关闭已完成的 fork 或停止正在运行的 fork     |
| `Esc`       | 将焦点返回提示输入                         |

### fork 与命名子代理的区别

fork 在生成时继承主会话的所有内容。命名子代理从自己的定义开始。

|                           | Fork                         | 命名子代理                                                          |
| :------------------------ | :--------------------------- | :----------------------------------------------------------------- |
| 上下文                     | 完整对话历史                  | 使用你传递的提示词的全新上下文                                        |
| 系统提示词和工具            | 与主会话相同                  | 来自子代理的[定义文件](#编写子代理文件)                        |
| 模型                       | 与主会话相同                  | 来自子代理的 `model` 字段                                           |
| 权限                       | 提示在终端中显示              | 在后台运行时[自动拒绝](#在前台或后台运行子代理)   |
| 提示缓存                   | 与主会话共享                  | 独立缓存                                                           |

因为 fork 的系统提示词和工具定义与父级相同，它的第一个请求复用父级的[提示缓存](/zh/prompt-caching#subagents-and-the-cache)。这使得 fork 对于需要相同上下文的任务比生成新的子代理更便宜。

当 Claude 通过 Agent 工具生成 fork 时，它可以传递 `isolation: "worktree"`，以便 fork 的文件编辑写入单独的 git 工作树而非你的检出。

### 限制

设置 `CLAUDE_CODE_FORK_SUBAGENT=1` 可在交互会话、[非交互模式](/zh/headless)和 Agent SDK 中启用 fork 模式。fork 不能生成更多 fork。

## 示例子代理

这些示例展示了构建子代理的有效模式。将它们用作起点，或使用 Claude 生成自定义版本。

**最佳实践：**

* **设计专注的子代理**：每个子代理应擅长一个特定任务
* **编写详细的描述**：Claude 使用描述来决定何时委托
* **限制工具访问**：仅为安全和专注授予必要的权限
* **签入版本控制**：与团队共享项目子代理

### 代码审查器

一个只读子代理，审查代码而不修改它。此示例展示如何设计一个具有有限工具访问（无 Edit 或 Write）和详细提示的专注子代理，该提示指定要查找什么以及如何格式化输出。

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### 调试器

一个既能分析又能修复问题的子代理。与代码审查器不同，此代理包含 Edit，因为修复 bug 需要修改代码。提示提供了从诊断到验证的清晰工作流。

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### 数据科学家

一个用于数据分析工作的领域特定子代理。此示例展示如何为典型编码任务之外的专业化工作流创建子代理。它显式设置 `model: sonnet` 以获得更强大的分析能力。

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### 数据库查询验证器

一个允许 Bash 访问但验证命令以仅允许只读 SQL 查询的子代理。此示例展示如何在需要比 `tools` 字段提供的更精细控制时使用 `PreToolUse` 钩子进行条件验证。

```markdown
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.

When asked to analyze data:
1. Identify which tables contain the relevant data
2. Write efficient SELECT queries with appropriate filters
3. Present results clearly with context

You cannot modify data. If asked to INSERT, UPDATE, DELETE, or modify schema, explain that you only have read access.
```

Claude Code [通过 stdin 以 JSON 格式传递钩子输入](/zh/hooks#pretooluse-input)给钩子命令。验证脚本读取此 JSON，提取正在执行的命令，并根据 SQL 写入操作列表检查它。如果检测到写入操作，脚本[以退出码 2 退出](/zh/hooks#exit-code-2-behavior-per-event)以阻止执行，并通过 stderr 将错误消息返回给 Claude。

在项目中的任何位置创建验证脚本。路径必须与钩子配置中的 `command` 字段匹配：

```bash
#!/bin/bash
# 阻止 SQL 写入操作，允许 SELECT 查询

# 从 stdin 读取 JSON 输入
INPUT=$(cat)

# 使用 jq 从 tool_input 中提取 command 字段
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# 阻止写入操作（不区分大小写）
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

在 macOS 和 Linux 上，使脚本可执行：

```bash
chmod +x ./scripts/validate-readonly-query.sh
```

在 Windows 上，用 PowerShell 编写验证脚本，并在钩子条目中添加 `shell: powershell`。请参阅[在 PowerShell 中运行钩子](/zh/hooks#windows-powershell-tool)。

钩子通过 stdin 接收 JSON，Bash 命令在 `tool_input.command` 中。退出码 2 阻止操作并将错误消息反馈给 Claude。有关退出码的详情，请参阅[钩子](/zh/hooks#exit-code-output)，有关完整输入模式，请参阅[钩子输入](/zh/hooks#pretooluse-input)。

## 后续步骤

现在你了解了子代理，请探索这些相关功能：

* [使用插件分发子代理](/zh/plugins)以在团队或项目间共享子代理
* [使用 Agent SDK 以编程方式运行 Claude Code](/zh/headless)用于 CI/CD 和自动化
* [使用 MCP 服务器](/zh/mcp)让子代理访问外部工具和数据
