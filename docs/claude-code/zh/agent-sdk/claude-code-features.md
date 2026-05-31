> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件发现所有可用页面。

# 在 SDK 中使用 Claude Code 功能

> 将项目指令、技能、钩子及其他 Claude Code 功能加载到您的 SDK 代理中。

Agent SDK 构建在与 Claude Code 相同的基础之上，这意味着您的 SDK 代理可以访问相同的基于文件系统的功能：项目指令（`CLAUDE.md` 和规则）、技能、钩子等。

当您省略 `settingSources` 时，`query()` 会读取与 Claude Code CLI 相同的文件系统设置：用户、项目和本地设置、CLAUDE.md 文件以及 `.claude/` 目录下的技能、代理和命令。若要在没有这些的情况下运行，请传递 `settingSources: []`，这将限制代理仅能使用您以编程方式配置的内容。托管策略设置和全局 `~/.claude.json` 配置不受此选项影响，始终会被读取。请参阅[settingSources 不控制的内容](#settingsources-不控制的内容)。

关于每项功能的作用及使用时机的概念性概述，请参阅[扩展 Claude Code](/zh/features-overview)。

## 使用 settingSources 控制文件系统设置

设置来源选项（Python 中的 [`setting_sources`](/zh/agent-sdk/python#claudeagentoptions)，TypeScript 中的 [`settingSources`](/zh/agent-sdk/typescript#settingsource)）控制 SDK 加载哪些基于文件系统的设置。传递一个显式列表以选择启用特定来源，或传递一个空数组以禁用用户、项目和本地设置。

此示例通过将 `settingSources` 设置为 `["user", "project"]` 来加载用户级和项目级设置：

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage

  async for message in query(
      prompt="Help me refactor the auth module",
      options=ClaudeAgentOptions(
          # "user" loads from ~/.claude/, "project" loads from ./.claude/ in cwd.
          # Together they give the agent access to CLAUDE.md, skills, hooks, and
          # permissions from both locations.
          setting_sources=["user", "project"],
          allowed_tools=["Read", "Edit", "Bash"],
      ),
  ):
      if isinstance(message, AssistantMessage):
          for block in message.content:
              if hasattr(block, "text"):
                  print(block.text)
      if isinstance(message, ResultMessage) and message.subtype == "success":
          print(f"\nResult: {message.result}")
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Help me refactor the auth module",
    options: {
      // "user" loads from ~/.claude/, "project" loads from ./.claude/ in cwd.
      // Together they give the agent access to CLAUDE.md, skills, hooks, and
      // permissions from both locations.
      settingSources: ["user", "project"],
      allowedTools: ["Read", "Edit", "Bash"]
    }
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") console.log(block.text);
      }
    }
    if (message.type === "result" && message.subtype === "success") {
      console.log(`\nResult: ${message.result}`);
    }
  }
  ```

每个设置源从特定位置加载设置，其中 `<cwd>` 是你通过 `cwd` 选项传递的工作目录，如果未设置则为进程的当前目录。完整的类型定义请参阅 [`SettingSource`](/zh/agent-sdk/typescript#settingsource)（TypeScript）或 [`SettingSource`](/zh/agent-sdk/python#settingsource)（Python）。

| 设置源      | 加载内容                                                                                   | 位置                                                                                                                                                                            |
| :---------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"project"` | 项目的 CLAUDE.md、`.claude/rules/*.md`、项目技能、项目钩子、项目 `settings.json`            | `settings.json` 和钩子位于 `<cwd>/.claude/`；CLAUDE.md 和规则位于 `<cwd>` 及所有父目录；技能位于 `<cwd>` 及所有向上直至仓库根目录的父目录                                      |
| `"user"`    | 用户的 CLAUDE.md、`~/.claude/rules/*.md`、用户技能、用户设置                                | `~/.claude/`                                                                                                                                                                    |
| `"local"`   | CLAUDE.local.md、`.claude/settings.local.json`                                             | `settings.local.json` 位于 `<cwd>/.claude/`；CLAUDE.local.md 位于 `<cwd>` 及所有父目录                                                                                        |

省略 `settingSources` 等同于 `["user", "project", "local"]`。

`cwd` 选项决定了 SDK 在何处查找项目级输入。CLAUDE.md 和规则从 `<cwd>` 及所有父目录加载。技能从 `<cwd>` 及所有向上直至仓库根目录的父目录加载。项目的 `settings.json` 和钩子仅从 `<cwd>/.claude/` 加载，不回退到父目录。

### settingSources 不控制的内容

`settingSources` 涵盖用户、项目和本地设置。但有几个输入的读取不受其值影响：

| 输入                                                  | 行为                               | 如何禁用                                                                                  |
| :---------------------------------------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------- |
| 托管策略设置                                          | 当主机上存在时，总是加载           | 移除托管设置文件                                                                          |
| `~/.claude.json` 全局配置                             | 总是读取                           | 通过 `env` 中的 `CLAUDE_CONFIG_DIR` 进行重定位                                            |
| 位于 `~/.claude/projects/<project>/memory/` 的自动记忆 | 默认加载到系统提示词中             | 在设置中设置 `autoMemoryEnabled: false`，或在 `env` 中设置 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` |

  不要依赖默认的 `query()` 选项进行多租户隔离。由于无论 `settingSources` 如何设置，上述输入都会被读取，SDK 进程可能会拾取主机级配置和每目录记忆功能。对于多租户部署，请在各自的文件系统中运行每个租户，并在 `env` 中设置 `settingSources: []` 以及 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`。参见[《安全部署》](/zh/agent-sdk/secure-deployment)。

## 项目指令（CLAUDE.md 和规则）

`CLAUDE.md` 文件和 `.claude/rules/*.md` 文件为您的代理提供了关于项目的持久化上下文：编码规范、构建命令、架构决策和指令。当 `settingSources` 包含 `"project"`（如上例所示）时，SDK 会在会话开始时将这些文件加载到上下文中。代理随后将遵循您的项目规范，无需您在每个提示词中重复它们。

### CLAUDE.md 加载位置

| 级别                   | 位置                                                                          | 何时加载                                                                                         |
| :------------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| 项目（根目录）         | `<cwd>/CLAUDE.md` 或 `<cwd>/.claude/CLAUDE.md`                                | `settingSources` 包含 `"project"`                                                               |
| 项目规则              | `<cwd>/.claude/rules/*.md` 以及所有父目录中的 `.claude/rules/*.md`                  | `settingSources` 包含 `"project"`                                                               |
| 项目（父目录）         | `cwd` 上方目录中的 `CLAUDE.md` 文件                                            | `settingSources` 包含 `"project"`，在会话开始时加载                                                |
| 项目（子目录）         | `cwd` 子目录中的 `CLAUDE.md` 文件                                              | `settingSources` 包含 `"project"`，当代理读取该子树中的文件时按需加载                                   |
| 本地                  | `<cwd>/CLAUDE.local.md` 以及所有父目录中的 `CLAUDE.local.md`                   | `settingSources` 包含 `"local"`                                                                 |
| 用户                  | `~/.claude/CLAUDE.md`                                                         | `settingSources` 包含 `"user"`                                                                  |
| 用户规则              | `~/.claude/rules/*.md`                                                        | `settingSources` 包含 `"user"`                                                                  |

所有级别是累加的：如果项目级和用户级的 CLAUDE.md 文件都存在，代理会同时看到它们。各级别之间没有硬性的优先级规则；如果指令冲突，结果取决于 Claude 如何解释它们。请编写不冲突的规则，或在更具体的文件中明确说明优先级（例如：“这些项目指令覆盖任何冲突的用户级默认值”）。

  您也可以直接通过 `systemPrompt` 注入上下文，而无需使用 CLAUDE.md 文件。详见 [修改系统提示词](/zh/agent-sdk/modifying-system-prompts)。如果您希望相同的上下文在交互式 Claude Code 会话和您的 SDK 代理之间共享，请使用 CLAUDE.md。

关于如何构建和组织 CLAUDE.md 内容，请参阅[管理 Claude 的记忆](/zh/memory)。

## 技能

技能是赋予你的代理专业知识和可调用工作流的 Markdown 文件。与 `CLAUDE.md`（每次会话都会加载）不同，技能是按需加载的。代理在启动时会收到技能描述，并在相关时加载完整内容。

技能通过 `settingSources` 从文件系统中发现。当 `query()` 中的 `skills` 选项被省略时，发现的用户和项目技能将被启用，且 Skill 工具可用，这与 CLI 行为一致。要控制启用哪些技能，可以将 `skills` 设置为 `"all"`、技能名称列表，或 `[]` 来禁用所有技能。SDK 在设置 `skills` 时会自动启用 Skill 工具，因此你无需将其添加到 `allowedTools` 中。

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

  # Skills in .claude/skills/ are discovered automatically
  # when settingSources includes "project"
  async for message in query(
      prompt="Review this PR using our code review checklist",
      options=ClaudeAgentOptions(
          setting_sources=["user", "project"],
          skills="all",
          allowed_tools=["Read", "Grep", "Glob"],
      ),
  ):
      if isinstance(message, ResultMessage) and message.subtype == "success":
          print(message.result)
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Skills in .claude/skills/ are discovered automatically
  // when settingSources includes "project"
  for await (const message of query({
    prompt: "Review this PR using our code review checklist",
    options: {
      settingSources: ["user", "project"],
      skills: "all",
      allowedTools: ["Read", "Grep", "Glob"]
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```



  技能必须作为文件系统构件（`.claude/skills/<name>/SKILL.md`）创建。SDK 没有用于注册技能的编程接口。完整详情请参阅 [Agent Skills in the SDK（SDK中的智能体技能）](/zh/agent-sdk/skills)。

有关创建和使用技能的更多信息，请参阅[SDK中的代理技能](/zh/agent-sdk/skills)。

## 钩子

SDK支持两种定义钩子的方式，它们并行运行：

* **文件系统钩子：** 在 `settings.json` 中定义的shell命令，当 `settingSources` 包含相关源时加载。这些与您为[交互式Claude Code会话](/zh/hooks-guide)配置的钩子相同。
* **程序化钩子：** 直接传递给 `query()` 的回调函数。它们在您的应用程序进程中运行，并可以返回结构化决策。请参阅[使用钩子控制执行](/zh/agent-sdk/hooks)。

两种类型都在相同的钩子生命周期中执行。如果您的项目的 `.claude/settings.json` 中已有钩子，并且您设置了 `settingSources: ["project"]`，这些钩子会自动在SDK中运行，无需额外配置。

钩子回调接收工具输入并返回一个决策字典。返回 `{}`（空字典）表示允许工具继续执行。返回 `{"decision": "block", "reason": "..."}` 会阻止执行，并且原因将作为工具结果发送给Claude。完整的回调签名和返回类型请参阅[钩子指南](/zh/agent-sdk/hooks)。

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher, ResultMessage


  # PreToolUse hook callback. Positional args:
  #   input_data: HookInput dict with tool_name, tool_input, hook_event_name
  #   tool_use_id: str | None, the ID of the tool call being intercepted
  #   context: HookContext, carries session metadata
  async def audit_bash(input_data, tool_use_id, context):
      command = input_data.get("tool_input", {}).get("command", "")
      if "rm -rf" in command:
          return {"decision": "block", "reason": "Destructive command blocked"}
      return {}  # Empty dict: allow the tool to proceed


  # Filesystem hooks from .claude/settings.json run automatically
  # when settingSources loads them. You can also add programmatic hooks:
  async for message in query(
      prompt="Refactor the auth module",
      options=ClaudeAgentOptions(
          setting_sources=["project"],  # Loads hooks from .claude/settings.json
          hooks={
              "PreToolUse": [
                  HookMatcher(matcher="Bash", hooks=[audit_bash]),
              ]
          },
      ),
  ):
      if isinstance(message, ResultMessage) and message.subtype == "success":
          print(message.result)
  ```

  ```typescript TypeScript
  import { query, type HookInput, type HookJSONOutput } from "@anthropic-ai/claude-agent-sdk";

  // PreToolUse hook callback. HookInput is a discriminated union on
  // hook_event_name, so narrowing on it gives TypeScript the right
  // tool_input shape for this event.
  const auditBash = async (input: HookInput): Promise<HookJSONOutput> => {
    if (input.hook_event_name !== "PreToolUse") return {};
    const toolInput = input.tool_input as { command?: string };
    if (toolInput.command?.includes("rm -rf")) {
      return { decision: "block", reason: "Destructive command blocked" };
    }
    return {}; // Empty object: allow the tool to proceed
  };

  // Filesystem hooks from .claude/settings.json run automatically
  // when settingSources loads them. You can also add programmatic hooks:
  for await (const message of query({
    prompt: "Refactor the auth module",
    options: {
      settingSources: ["project"], // Loads hooks from .claude/settings.json
      hooks: {
        PreToolUse: [{ matcher: "Bash", hooks: [auditBash] }]
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

### 不同钩子类型的使用场景

| 钩子类型                                  | 最佳应用场景                                                                                                                                                                                                                                                                                              |
| :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **文件系统** (`settings.json`)            | 在 CLI 和 SDK 会话间共享钩子。支持 `"command"`（Shell 脚本）、`"http"`（向端点发送 POST 请求）、`"mcp_tool"`（调用已连接的 MCP 服务器工具）、`"prompt"`（由大语言模型评估提示词）以及 `"agent"`（生成验证代理）。这些钩子会在主代理及其生成的任何子代理中触发。 |
| **编程式**（`query()` 中的回调）          | 应用特定逻辑；返回结构化决策；进程内集成。仅作用于主会话。                                                                                                                                                                                                                                                |

  TypeScript SDK 支持比 Python 更多的钩子事件，包括 `SessionStart`、`SessionEnd`、`TeammateIdle` 和 `TaskCompleted`。完整的事件兼容性表请参阅[钩子指南](/zh/agent-sdk/hooks)。

关于编程式钩子的完整详情，请参阅[使用钩子控制执行](/zh/agent-sdk/hooks)。关于文件系统钩子语法，请参阅[钩子](/zh/hooks)。

## 选择合适的功能

Agent SDK 提供了多种方式来扩展您的代理行为。如果您不确定该使用哪种方式，下表将常见目标映射到合适的方法。

| 您想要...                                                                                           | 使用                                          | SDK 接口                                                                                                                                                       |
| :-------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 设置您的代理始终遵循的项目惯例                                                                        | [CLAUDE.md](/zh/memory)                       | `settingSources: ["project"]` 会自动加载它                                                                                                                       |
| 在相关时给代理加载参考资料                                                                            | [技能](/zh/agent-sdk/skills)                  | `settingSources` + `skills` 选项                                                                                                                               |
| 运行可复用的工作流（部署、审查、发布）                                                                  | [用户可调用的技能](/zh/agent-sdk/skills)       | `settingSources` + `skills` 选项                                                                                                                               |
| 将独立的子任务委派给新的上下文（研究、审查）                                                              | [子代理](/zh/agent-sdk/subagents)              | `agents` 参数 + `allowedTools: ["Agent"]`                                                                                                                      |
| 通过共享任务列表和直接的代理间消息传递来协调多个 Claude Code 实例                                          | [代理团队](/zh/agent-teams)                    | 不直接通过 SDK 选项配置。代理团队是 CLI 功能，其中一个会话作为团队领导，协调独立队友的工作                                                                              |
| 在工具调用上运行确定性逻辑（审计、阻止、转换）                                                            | [钩子](/zh/agent-sdk/hooks)                   | `hooks` 参数配合回调，或通过 `settingSources` 加载的 shell 脚本                                                                                                 |
| 为 Claude 提供对外部服务的结构化工具访问                                                                | [MCP](/zh/agent-sdk/mcp)                      | `mcpServers` 参数                                                                                                                                              |

  **子代理与代理团队对比：** 子代理具有临时性和隔离性：全新会话、单一任务、汇总结果返回父代理。代理团队则协调多个独立的 Claude Code 实例，它们共享任务列表并可直接相互通信。代理团队是 CLI 功能。详见[子代理继承内容](/zh/agent-sdk/subagents#what-subagents-inherit)和[代理团队对比说明](/zh/agent-teams#compare-with-subagents)。

您启用的每个功能都会增加智能体的上下文窗口。有关每个功能的成本以及这些功能如何叠加使用，请参阅[扩展 Claude Code](/zh/features-overview#understand-context-costs)。

## 相关资源

* [扩展 Claude Code](/zh/features-overview)：所有扩展功能的概念概览，包含比较表格和上下文成本分析
* [SDK 中的技能](/zh/agent-sdk/skills)：以编程方式使用技能的完整指南
* [子代理](/zh/agent-sdk/subagents)：为隔离的子任务定义和调用子代理
* [钩子](/zh/agent-sdk/hooks)：在关键执行点拦截和控制智能体行为
* [权限](/zh/agent-sdk/permissions)：通过模式、规则和回调查控制工具访问
* [系统提示词](/zh/agent-sdk/modifying-system-prompts)：无需 CLAUDE.md 文件即可注入上下文