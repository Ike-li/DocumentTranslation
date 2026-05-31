> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 术语表

> Claude Code 术语定义。了解 agentic loop、compaction、CLAUDE.md、钩子、子代理、MCP 及其他核心概念的含义。

本术语表定义了 Claude Code 的术语。每个条目都链接到深入介绍该概念的页面。关于 token、temperature 和 RAG 等模型层面的概念，请参阅[平台术语表](https://platform.claude.com/docs/en/about-claude/glossary)。

## A

### Agent 团队

多个独立的 Claude Code 会话由团队领导协调，共享任务列表并支持点对点消息传递。与[子代理](#子代理)不同（子代理在单个会话内运行且仅向父级汇报），团队成员各自拥有独立的上下文窗口，你可以直接与任何一个交互。Agent 团队是实验性功能，需设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 启用。

了解更多：[运行 agent 团队](/zh/agent-teams)

### Agentic 编码

一种工作流，AI 可以自主读取文件、运行命令和进行修改，同时你可以观察、重定向或离开，而非仅以聊天形式回复文本由你手动应用。Claude Code 是 agentic 的，因为它拥有[工具](#工具)可以执行操作，而非仅仅提供建议。

了解更多：[Claude Code 工作原理](/zh/how-claude-code-works)

### Agentic 框架

将语言模型转变为强大编码 agent 的工具、上下文管理和执行环境。Claude Code 是框架；Claude 是其中的模型。框架提供文件访问、shell 执行、权限控制、记忆加载以及将操作串联在一起的循环。

了解更多：[Claude Code 工作原理](/zh/how-claude-code-works)

### Agentic 循环

Claude 处理每个任务的周期：收集上下文、执行操作、验证结果，然后重复直到完成。每次工具调用返回的信息都会影响下一步决策。你可以在任何时候中断循环进行重定向。大多数扩展点，包括[钩子](#钩子)、[技能](#技能) 和 [MCP](#mcp-工具搜索)，都接入此循环的特定阶段。

了解更多：[Claude Code 工作原理](/zh/how-claude-code-works#the-agentic-loop)

### 自动记忆

Claude 根据你的纠正和偏好为自己编写的笔记，按 git 仓库存储在 `~/.claude/projects/` 下。同一仓库的所有工作树共享一个自动记忆目录。每次会话开始时会加载 `MEMORY.md` 索引的前 200 行或 25 KB。自动记忆是 Claude 编写的，与你编写的 [CLAUDE.md](#claude-目录) 互为补充。

了解更多：[自动记忆](/zh/memory#auto-memory)

### 自动模式

一种[权限模式](#权限模式)，由独立的分类器模型在后台审查每个操作，而非显示审批提示。分类器会阻止范围升级、不受信任的基础设施和[提示词注入](#提示词注入)。它不会看到工具结果，因此注入的指令无法影响其决策。自动模式是研究预览版，对所有 Anthropic API 用户开放。

了解更多：[使用自动模式消除提示](/zh/permission-modes#eliminate-prompts-with-auto-mode)

## B

### 精简模式

启动标志 `--bare`，跳过自动发现钩子、技能、插件、MCP 服务器、自动记忆和 CLAUDE.md。只有显式传递的标志才会生效。推荐用于 CI 和脚本调用，确保跨机器行为一致，不受本地配置影响。

了解更多：[使用精简模式快速启动](/zh/headless#start-faster-with-bare-mode)

### 内置技能

Claude Code 附带的基于提示词的剧本，如 `/batch`、`/code-review`、`/debug` 和 `/loop`。与执行固定逻辑的内置命令不同，内置技能为 Claude 提供详细的提示词并让其编排工作，因此可以生成代理、读取文件并适应你的代码库。

了解更多：[内置技能](/zh/skills#bundled-skills)

## C

### Channel

一种 [MCP 服务器](#mcp-工具搜索)，将事件推送进你正在运行的会话中，使 Claude 能够在你离开终端时对发生的事件做出反应。Channel 可以是双向的：Claude 读取入站事件并通过同一通道回复。Telegram、Discord 和 iMessage 已包含在研究预览版中。

了解更多：[Channel](/zh/channels)

### 检查点

在你发送的每条提示词处创建的恢复点。Claude Code 在每次编辑前快照文件，以便检查点可以恢复它们。按两次 `Esc` 或运行 `/rewind` 可将代码、对话或两者恢复到之前的状态，或从选定消息开始总结部分对话。检查点仅在会话内有效，与 git 分离，且不跟踪通过 Bash 工具所做的更改。

了解更多：[检查点](/zh/checkpointing)

### `.claude` 目录

Claude Code 读取项目级配置的目录：设置、钩子、技能、子代理、规则和自动记忆。项目根目录下有 `.claude/`；用户级默认配置位于 `~/.claude/`。

了解更多：[`.claude` 目录](/zh/claude-directory)

### CLAUDE.md

你为 Claude 编写的持久指令的 markdown 文件，在每次会话开始时作为用户消息在系统提示词之后加载。在此放置项目约定、架构说明和"始终执行 X"的规则。CLAUDE.md 在[压缩](#压缩)后仍然保留，并在之后从磁盘重新读取。

你可以将 CLAUDE.md 放在项目级 `./CLAUDE.md` 或 `./.claude/CLAUDE.md`，用户级 `~/.claude/CLAUDE.md`，或作为组织的[托管策略](#托管设置)。更具体的位置优先级更高。

了解更多：[CLAUDE.md 文件](/zh/memory#claude-md-files)

### 命令

通过在提示词中输入 `/name` 调用的可复用指令。内置命令如 `/clear`、`/model` 和 `/compact` 控制会话。你可以在 `.claude/commands/` 中定义自己的命令，或从[插件](#插件)安装。[技能](#技能)是打包多步骤命令的推荐方式。

了解更多：[命令](/zh/commands) · [技能](/zh/skills)

### 压缩

当[上下文窗口](#上下文窗口)接近其限制时，自动对对话进行总结。较旧的工具输出会先被清除，然后对话被总结。项目根目录的 CLAUDE.md 和自动记忆在压缩后仍然保留并从磁盘重新加载；仅在对话中给出的指令可能会丢失。运行 `/compact` 可手动触发，可选择附带焦点如 `/compact focus on the API changes`。

了解更多：[压缩后的保留内容](/zh/context-window#what-survives-compaction) · [上下文窗口满时](/zh/how-claude-code-works#when-context-fills-up)

### 上下文窗口

会话的工作内存，保存对话历史、文件内容、命令输出、CLAUDE.md、自动记忆、已加载的技能和系统指令。随着工作的进行，上下文会被填满，直到[压缩](#压缩)对其进行总结。运行 `/context` 可查看占用空间的内容。关于底层模型概念，请参阅[平台术语表](https://platform.claude.com/docs/en/about-claude/glossary#context-window)。

了解更多：[探索上下文窗口](/zh/context-window)

## D

### Dispatch

一种从手机发起的任务路由器，当你从 Claude 移动应用发送编码任务时，在桌面应用中生成一个 Claude Code 会话。你的提示词会自动路由到正确的工具。适用于 Pro 和 Max 套餐。

了解更多：[来自 Dispatch 的会话](/zh/desktop#sessions-from-dispatch)

## E

### 推理强度

控制 Claude 在每轮对话中使用多少自适应推理思维预算的设置。更高的推理强度意味着更多的思维 token 和更深入的推理；更低的推理强度更快且更节省。推理强度支持 Opus 4.6 及更高版本，以及 Sonnet 4.6。

了解更多：[调整推理强度](/zh/model-config#adjust-effort-level)

### 扩展思维

模型在响应前进行的可见的逐步推理。你可以通过 `MAX_THINKING_TOKENS` 限制思维 token 或调整[推理强度](#推理强度)。思维内容以灰色斜体显示在终端中。

了解更多：[使用扩展思维](/zh/model-config#extended-thinking)

## H

### 钩子

在 Claude Code 生命周期的特定点自动执行的用户定义处理程序，例如在工具运行前、文件编辑后或会话开始时。处理程序可以是 shell 命令、HTTP 端点、MCP 工具、LLM 提示词或子代理。钩子是确定性的：它们在固定的生命周期点触发，而非由模型自行决定。

钩子配置有三个层级：

* **钩子事件**：生命周期点
* **匹配器**：筛选哪些事件触发它
* **钩子处理程序**：运行的内容

了解更多：[钩子入门](/zh/hooks-guide) · [钩子参考](/zh/hooks)

## M

### 托管设置

由 IT 或 DevOps 在整个组织范围内强制执行的设置文件，放置在 `~/.claude` 之外的操作系统级路径。用户无法覆盖或排除托管设置。用于安全策略、合规要求或整个团队的标准化工具配置。

了解更多：[服务器托管设置](/zh/server-managed-settings)

### MCP（模型上下文协议）

将 AI 工具连接到外部数据源和服务的开放标准。MCP 服务器为 Claude 提供用于 Slack、Jira、数据库、浏览器和数百种其他集成的新工具。你可以通过 `/mcp` 或将其添加到 `.mcp.json` 来连接服务器。关于协议本身，请参阅[平台术语表](https://platform.claude.com/docs/en/about-claude/glossary#mcp-model-context-protocol)。

了解更多：[模型上下文协议](/zh/mcp)

### MCP 工具搜索

一种节省上下文的机制，将 MCP 工具架构延迟到需要时才加载。启动时仅加载工具名称；当 Claude 决定使用特定工具时，会按需获取完整架构。这使空闲的 MCP 服务器不会消耗过多上下文。

了解更多：[使用 MCP 工具搜索进行扩展](/zh/mcp#scale-with-mcp-tool-search)

## N

### 非交互模式

执行单条提示词后退出而无需对话会话的模式，通过 `-p` 或 `--print` 调用。用于 CI、脚本和管道。[Agent SDK](/zh/agent-sdk/overview) 是 Python 和 TypeScript 的等效方案。以前称为 headless 模式。

了解更多：[以编程方式运行 Claude Code](/zh/headless)

## O

### 输出风格

修改 Claude 系统提示词以改变响应行为、语气或格式的配置。输出风格会关闭默认系统提示词中软件工程特定的部分，而 [CLAUDE.md](#claude-目录) 是作为系统提示词之后的用户消息传递的。内置风格包括默认、主动、解释和学习。

了解更多：[输出风格](/zh/output-styles)

## P

### 权限模式

会话的基本审批行为。在 CLI 中使用 `Shift+Tab` 切换，或在 VS Code、桌面应用和 claude.ai 中使用模式选择器。可用模式包括 `default`、`acceptEdits`、`plan`、`auto`、`dontAsk` 和 `bypassPermissions`。

了解更多：[选择权限模式](/zh/permission-modes)

### 权限规则

根据工具名称和参数模式允许、询问或拒绝工具调用的设置条目。规则按 拒绝→询问→允许 的顺序评估，首次匹配生效。权限规则是在更广泛的[权限模式](#权限模式)之上的细粒度控制。

了解更多：[配置权限](/zh/permissions)

### 计划模式

一种[权限模式](#权限模式)，Claude 在其中研究和提议更改而不编辑你的源文件。它可以读取、搜索和运行探索命令，然后在接触任何内容之前提出计划供你审批。通过 `/plan` 或按 `Shift+Tab` 进入计划模式。

了解更多：[使用计划模式先分析再编辑](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)

### 插件

将技能、钩子、子代理和 MCP 服务器打包为单一可安装单元的集合。插件技能使用 `plugin-name:skill-name` 命名空间，以便多个插件共存。通过[市场](/zh/plugin-marketplaces)在团队间分发插件。

了解更多：[插件](/zh/plugins)

### 项目信任

在 Claude Code 加载配置之前接受目录的对话框。接受状态按项目目录保存，但主目录除外——主目录的信任仅在当前会话有效，每次启动时都会重新出现提示。信任控制市场插件的自动安装和项目定义钩子的执行。信任一个目录意味着其 `.claude/settings.json`、`.mcp.json` 和其他配置文件将生效。

了解更多：[`.claude` 目录](/zh/claude-directory)

### 提示词注入

嵌入在文件、网页或工具结果中的恶意指令，试图将 Claude 重定向到你从未要求的操作。Claude Code 的防御包括权限系统、命令黑名单和信任验证。[自动模式](#自动模式)添加了服务器端探测器来扫描工具结果中的可疑内容，以及一个永远不查看工具结果的分类器，因此注入的文本无法影响其审批决策。

了解更多：[防范提示词注入](/zh/security#protect-against-prompt-injection)

## R

### 远程控制

通过 claude.ai 从手机或浏览器继续本地 Claude Code 会话的方式。你的代码保留在你的机器上；只有 UI 是远程的。与在 Web 上运行的 Claude Code（在云沙箱中运行）不同。

了解更多：[远程控制](/zh/remote-control)

### 规则

`.claude/rules/` 中的模块化指令文件，与 CLAUDE.md 一起加载。规则可以通过 YAML `paths:` frontmatter 设置路径范围，仅在 Claude 读取匹配文件时加载，从而在相关之前保持上下文精简。

了解更多：[使用 `.claude/rules/` 组织规则](/zh/memory#organize-rules-with-claude/rules/)

## S

### 沙箱

为 Bash 工具提供的操作系统级文件系统和网络隔离。命令在你预先定义的边界内运行，因此 Claude 可以在其中自由工作而无需逐条命令审批提示。沙箱是与[权限规则](#权限规则)分离的独立层。

了解更多：[沙箱](/zh/sandboxing)

### 会话

绑定到当前目录的对话，拥有独立的[上下文窗口](#上下文窗口)。会话可通过 `claude -c` 恢复，通过 `--fork-session` 在新会话 ID 下保留历史记录进行分叉，或跨终端并行运行。运行 `/clear` 开始新会话；之前的会话保持存储状态，可通过 `/resume` 访问。每个会话的记录存储在 `~/.claude/projects/` 下。

了解更多：[使用会话](/zh/how-claude-code-works#work-with-sessions)

### 设置层级

Claude Code 读取配置的层级结构，按优先级从高到低排列：[托管策略](#托管设置)、命令行参数、`.claude/settings.local.json` 的本地设置、`.claude/settings.json` 的项目设置，然后是 `~/.claude/settings.json` 的用户设置。数组跨层合并；更高层级的标量值覆盖更低层级。

了解更多：[设置文件](/zh/settings#settings-files)

### 技能

包含指令、知识或工作流的 `SKILL.md` 文件，Claude 将其添加到自己的工具包中。Claude 在相关时自动加载技能，或你通过 `/skill-name` 直接调用。技能遵循 Agent Skills 开放标准；Claude Code 扩展了调用控制和子代理执行。

技能是自定义命令的推荐替代方案。`.claude/commands/deploy.md` 和 `.claude/skills/deploy/SKILL.md` 都会创建 `/deploy` 且工作方式相同；现有的命令文件继续有效。

了解更多：[使用技能扩展 Claude](/zh/skills)

### 子代理

在自己的上下文窗口中运行的专用 AI 助手，拥有自定义系统提示词、特定工具访问权限和独立的权限。它处理委派的任务并向主对话返回摘要。使用子代理可将大量探索保持在主上下文之外，或并行运行研究。与 [agent 团队](#agent-团队)不同，后者每个 agent 都是你可以直接对话的完整独立会话。

内置子代理包括 Explore、Plan 和通用型。

了解更多：[创建自定义子代理](/zh/sub-agents)

### 界面

你访问 Claude Code 的任何地方：CLI、VS Code、JetBrains、桌面应用或 claude.ai。所有界面共享相同的引擎，因此你的 CLAUDE.md、设置和技能在各界面间的工作方式相同。Slack 和 Chrome 扩展是连接到界面的集成，而非界面本身。

了解更多：[平台和集成](/zh/platforms)

## T

### Teleport

一个命令 `/teleport`，将云端 Claude Code 会话拉取到你的本地终端。Claude 获取分支、加载对话历史并从 Web 会话的最后状态恢复。反向操作是 `--remote`，将本地任务发送到 Web 上运行。

了解更多：[从 Web 到终端](/zh/claude-code-on-the-web#from-web-to-terminal)

### 工具

Claude 可以执行的操作：读取文件、编辑代码、运行 shell 命令、搜索网络、生成子代理。工具使 Claude Code 具有 agentic 能力。没有它们，Claude 只能以文本回复。每次工具调用返回的结果会影响 Claude 在 [agentic 循环](#agentic-编码)中的下一步决策。

了解更多：[Claude 可用的工具](/zh/tools-reference)

### 轮次

[会话](#会话)中 Claude 的一次完整响应。轮次从你发送消息开始，到 Claude 完成响应结束，中间可以有任何数量的[工具](#工具)调用。[停止钩子](#钩子)在每轮结束时触发。会话由多个轮次组成，[agentic 循环](#agentic-编码)描述了轮次内部发生的事情。

了解更多：[Claude Code 工作原理](/zh/how-claude-code-works#the-agentic-loop)

## V

### 验证循环

会话如何知道工作确实完成而非只是看起来合理的方式。你给 Claude 一个可以运行的检查，如测试套件、构建或截图比较，Claude 会迭代直到检查通过，而不是一次尝试后就停止。验证循环是 [`/goal`](/zh/goal)、无人值守运行和[动态工作流](/zh/workflows)的前提：没有它，判断 agent 完成工作的唯一依据就是 agent 自身。

了解更多：[为 Claude 提供验证工作的方式](/zh/best-practices#give-claude-a-way-to-verify-its-work)

## W

### 工作树隔离

一种隔离模式，在 `.claude/worktrees/` 下的独立 git 工作树中运行 Claude，通过 `-w` 标志或子代理配置中的 `isolation: worktree` 启用。更改保留在独立目录的独立分支上，因此并行 agent 不会互相覆盖文件。

了解更多：[使用 git 工作树运行并行会话](/zh/worktrees)

***

## 已弃用和已重命名的术语

这些术语出现在较旧的文档、博客文章和社区内容中。在搜索本站时请使用当前名称。

| 旧术语          | 当前名称                                      | 备注                                 |
| --------------- | --------------------------------------------- | ------------------------------------ |
| Headless mode   | [非交互模式](#非交互模式)           | 同一 `-p` 标志，相同行为             |
| Custom commands | [技能](#技能)                                | `.claude/commands/` 文件仍然有效     |
| Slash commands  | 命令                                          | 产品文档中已去掉"斜杠"               |
