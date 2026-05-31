> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索前，了解所有可用页面。

# 修改系统提示

> 在 `claude_code` 预设和自定义系统提示之间选择，并通过 CLAUDE.md、输出样式、`append` 或完全自定义的提示来定制行为。

系统提示定义了 Claude 的行为、能力和响应风格。对于人类观察并引导工作的 CLI 或类似 IDE 的编码工具，可以从 `claude_code` 预设开始。为具有不同界面、身份或权限模型的代理编写你自己的提示。

本页面涵盖：

* [系统提示如何工作](#系统提示如何工作)，包含一个决策表，用于在预设、带 `append` 的预设和自定义提示之间进行选择
* [定制代理行为](#定制代理行为)，使用 CLAUDE.md 文件、输出样式、`append` 或自定义字符串
* [比较四种方法](#比较四种方法)，从持久性、作用范围和保留内容进行比较
* [组合方法](#组合使用方法)以分层定制方法

## 系统提示如何工作

系统提示是塑造 Claude 在整个对话过程中行为的初始指令集。Agent SDK 为其提供了三个起点：

* **最小默认值**：当你在 TypeScript 中未设置 `systemPrompt` 或在 Python 中未设置 `system_prompt` 时，SDK 使用一个最小的提示，涵盖工具调用，但省略了 Claude Code 的编码指南、响应风格和项目上下文。这与默认使用完整 Claude Code 提示的 `claude -p` 不同。如果你从 CLI 迁移并希望获得匹配的行为，请设置 `claude_code` 预设。
* **`claude_code` 预设**：Claude Code CLI 使用的完整系统提示，包含工具使用说明、代码风格和格式指南、响应语气和详细程度规则、安全和安保指令，以及关于工作目录和环境的上下文。在 TypeScript 中设置 `systemPrompt: { type: "preset", preset: "claude_code" }`，或在 Python 中设置 `system_prompt={"type": "preset", preset": "claude_code"}`，可选地使用 `append` 在末尾添加你自己的指令。
* **自定义字符串**：你自己编写的提示。SDK 仅发送你提供的内容。

### 确定起点

决定性因素是你的代理与 Claude Code 的相似程度：一个在仓库中运行、人类观察流式输出并引导工作的编码代理。你的产品与此相差越远，你就越需要编写自己的提示。

| 你正在构建的                                                                                               | 使用                                | 你得到的内容                                                                                                                  |
| :--------------------------------------------------------------------------------------------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| 一个 CLI 或类似 IDE 的编码工具，人类观察并引导，且你希望使用 Claude Code 的默认设置                       | `claude_code` 预设               | 完整的 Claude Code 提示：工具指导、安全规则、终端友好的响应、仓库惯例感知              |
| 同类工具，加上产品特定规则，如编码标准、输出格式或领域上下文                                             | `claude_code` 预设加 `append` | 上述所有内容，并在预设之后添加了你的指令。没有内容被移除，因此这是风险最低的定制 |
| 具有不同界面、身份或权限模型的代理，或非编码代理                                                         | 自定义提示字符串               | 仅包含你编写的内容。你需要负责替换你的代理仍然需要的工具指导和安全指令   |
| 一个没有代理身份的轻量工具调用循环，你在用户提示中提供所有行为                                           | 不使用 `systemPrompt` 选项           | 最小默认值：仅工具调用支持，别无其他                                                                    |

"不同于 Claude Code" 通常意味着以下情况之一：

* **不同的界面**：输出并非由触发它的人在终端中阅读。聊天 UI、结构化输出消费者和非编码自动化各自需要一个与其输出渲染和审查方式相匹配的提示。无人值守的编码自动化（如修复 lint 错误或审查差异的 CI 作业）仍然适合预设，因为其工作本身正是预设所针对的。
* **不同的身份**：代理不应将自己呈现为 Claude Code。支持机器人、数据分析助手或任何特定领域的代理需要自己的名称、范围和人设。
* **不同的权限模型**：代理自主运行，无需人类批准每一步，或在有限的资源集上运行。Claude Code 的提示假设有人类参与并拥有完整的工具集。
* **非编码任务**：Claude Code 的大部分提示是编码指导。对于研究、内容或运营代理，这些指导会与你实际需要的指令相冲突。

[比较表](#比较四种方法)展示了每种定制方法所保留的内容。

## 定制代理行为

输出样式、`append` 和自定义提示字符串都会直接更改系统提示。CLAUDE.md 采用不同的路径：SDK 读取它并将其内容作为项目上下文注入到对话中，而不是注入到系统提示中，因此它会与你选择的任何系统提示一起塑造行为。[技能](/zh/agent-sdk/skills)、[钩子](/zh/agent-sdk/hooks)和[权限](/zh/agent-sdk/permissions)也在系统提示之外塑造行为，它们各自有专门的页面介绍。

### 使用 CLAUDE.md 文件提供项目级指令

CLAUDE.md 文件为 Claude 提供持久的项目上下文和指令。SDK 将它们的内容注入到对话中，而不是注入到系统提示中，因此它们与任何系统提示配置一起工作。关于在 CLAUDE.md 中写什么、放在哪里以及如何编写有效指令，请参阅 [Claude 如何记住你的项目](/zh/memory)。本节涵盖 SDK 特有的内容：CLAUDE.md 如何加载。

当匹配的设置源启用时，SDK 会读取 CLAUDE.md：`'project'` 从工作目录加载 `CLAUDE.md` 或 `.claude/CLAUDE.md`，`'user'` 加载 `~/.claude/CLAUDE.md`。默认的 `query()` 选项会启用这两个源，因此 CLAUDE.md 会自动加载。如果你在 TypeScript 中显式设置 `settingSources` 或在 Python 中设置 `setting_sources`，请包含你需要的源。CLAUDE.md 加载受设置源控制，而非 `claude_code` 预设。

#### 使用 SDK 加载 CLAUDE.md

要加载 CLAUDE.md，请将 `settingSources` 设置为包含你的 CLAUDE.md 所在的级别。以下示例在加载 `claude_code` 预设的同时加载项目级的 CLAUDE.md，因此 Claude 同时拥有完整的编码代理提示和你项目的惯例：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const messages = [];

  for await (const message of query({
    prompt: "Add a new React component for user profiles",
    options: {
      systemPrompt: {
        type: "preset",
        preset: "claude_code" // Use Claude Code's system prompt
      },
      settingSources: ["project"] // Loads CLAUDE.md from project
    }
  })) {
    messages.push(message);
  }

  // Now Claude has access to your project guidelines from CLAUDE.md
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  messages = []

  async for message in query(
      prompt="Add a new React component for user profiles",
      options=ClaudeAgentOptions(
          system_prompt={
              "type": "preset",
              "preset": "claude_code",  # Use Claude Code's system prompt
          },
          setting_sources=["project"],  # Loads CLAUDE.md from project
      ),
  ):
      messages.append(message)

  # Now Claude has access to your project guidelines from CLAUDE.md
  ```

CLAUDE.md 跨项目中的所有会话持久化，通过 git 与团队共享，并且无需代码更改即可自动发现。如果你传递一个空的 `settingSources` 数组，它将不会被加载。

### 持久化配置的输出样式

输出样式是修改 Claude 系统提示词的已保存配置。它们作为 Markdown 文件存储，可在不同会话和项目中重复使用。

#### 创建输出样式

一个输出样式是一个包含[frontmatter](/zh/output-styles#frontmatter) 元数据的 Markdown 文件，后跟提示词内容。将其保存到 `~/.claude/output-styles/` 可创建一个用户级别的样式，在所有项目中可用；或保存到你仓库中的 `.claude/output-styles/` 目录，以创建一个可提交并与团队共享的项目级别样式。

默认情况下，自定义输出样式会用你自己的指示替换 `claude_code` 预设的软件工程指示。要保留它们并将你的指示叠加在上面，请在 frontmatter 中设置 `keep-coding-instructions: true`。当你的代理仍在进行软件工程工作时保留它们。当你完全替换角色时，则不保留。

下面的示例定义了一个保留编码指示的代码审查角色，因为审查代码仍然受益于 Claude Code 的安全性和代码质量指导。将其保存为 `~/.claude/output-styles/code-reviewer.md` 即可在项目中使用：
```markdown ~/.claude/output-styles/code-reviewer.md
---
name: Code Reviewer
description: Thorough code review assistant
keep-coding-instructions: true
---

You are an expert code reviewer.

For every code submission:
1. Check for bugs and security issues
2. Evaluate performance
3. Suggest improvements
4. Rate code quality (1-10)
```
#### 激活输出样式

创建后，可通过以下方式激活输出样式：

* **CLI**：运行 `/config` 并选择输出样式
* **设置**：在 `.claude/settings.local.json` 中设置 `outputStyle`
* **TypeScript SDK**：在传递给 `query()` 的内联 `settings` 对象中设置 `outputStyle`，或将 `settings` 指向一个设置了该字段的设置文件。`outputStyle` 不是顶级 `Options` 字段。

Python SDK 没有提供以编程方式选择输出样式的选项。对于无法写入 `.claude/settings.local.json` 的纯代码部署，请改用 `append` 或自定义提示词字符串。

**SDK 用户注意：** 当您在选项中包含 `settingSources: ['user']` 或 `settingSources: ['project']`（TypeScript）/ `setting_sources=["user"]` 或 `setting_sources=["project"]`（Python）时，输出样式会被加载。

### 追加到 `claude_code` 预设

您可以使用带有 `append` 属性的 Claude Code 预设来添加自定义指令，同时保留所有内置功能。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const messages = [];

  for await (const message of query({
    prompt: "Help me write a Python function to calculate fibonacci numbers",
    options: {
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: "Always include detailed docstrings and type hints in Python code."
      }
    }
  })) {
    messages.push(message);
    if (message.type === "assistant") {
      console.log(message.message.content);
    }
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage

  messages = []

  async for message in query(
      prompt="Help me write a Python function to calculate fibonacci numbers",
      options=ClaudeAgentOptions(
          system_prompt={
              "type": "preset",
              "preset": "claude_code",
              "append": "Always include detailed docstrings and type hints in Python code.",
          }
      ),
  ):
      messages.append(message)
      if isinstance(message, AssistantMessage):
          print(message.content)
  ```

#### 优化跨用户与机器的提示词缓存

默认情况下，即使两个会话使用相同的 `claude_code` 预设和 `append` 文本，若运行在不同的工作目录中，它们仍无法共享提示词缓存条目。这是因为预设会在系统提示中、你的 `append` 文本之前嵌入每个会话的上下文信息：工作目录、是否为 Git 仓库、平台类型、当前活动的 Shell、操作系统版本以及自动记忆路径。这些上下文中的任何差异都会产生不同的系统提示，从而导致缓存未命中。CLAUDE.md 的内容不会影响系统提示缓存，因为 SDK 会将其注入对话历史，而非系统提示中。

要使不同会话的系统提示保持一致，请在 TypeScript 中设置 `excludeDynamicSections: true`，或在 Python 中设置 `"exclude_dynamic_sections": True`。这样，每个会话的上下文信息会被移至第一条用户消息中，系统提示仅保留静态预设和你的 `append` 文本，从而使相同配置能够在不同用户和机器间共享缓存条目。

  `excludeDynamicSections` 要求 `@anthropic-ai/claude-agent-sdk` v0.2.98 或更高版本，或 Python 版的 `claude-agent-sdk` v0.1.58 或更高版本。它仅适用于预设对象形式，当 `systemPrompt` 为字符串时无效。

以下示例将共享的 `append` 代码块与 `excludeDynamicSections` 结合使用，使得从不同目录运行的一系列代理可以复用相同的缓存系统提示词：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Triage the open issues in this repo",
    options: {
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: "You operate Acme's internal triage workflow. Label issues by component and severity.",
        excludeDynamicSections: true
      }
    }
  })) {
    // ...
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  async for message in query(
      prompt="Triage the open issues in this repo",
      options=ClaudeAgentOptions(
          system_prompt={
              "type": "preset",
              "preset": "claude_code",
              "append": "You operate Acme's internal triage workflow. Label issues by component and severity.",
              "exclude_dynamic_sections": True,
          },
      ),
  ):
      ...
  ```

**权衡取舍：** 工作目录、`git-repo` 标志、平台、活跃的 Shell、操作系统版本以及自动记忆路径仍会传达给 Claude，但它们是作为第一条用户消息的一部分而非系统提示词。用户消息中的指令在推理当前目录或自动记忆路径时，其效力略低于系统提示词中的相同文本。当跨会话缓存复用比获取最权威的环境上下文更重要时，请启用此选项。

关于非交互式 CLI 模式中的等效标志，请参见 [`--exclude-dynamic-system-prompt-sections`](/zh/cli-reference)。

### 自定义系统提示词

你可以提供一个自定义字符串作为 `systemPrompt`，用你自己的指令完全替换默认提示词。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const customPrompt = `You are a Python coding specialist.
  Follow these guidelines:
  - Write clean, well-documented code
  - Use type hints for all functions
  - Include comprehensive docstrings
  - Prefer functional programming patterns when appropriate
  - Always explain your code choices`;

  const messages = [];

  for await (const message of query({
    prompt: "Create a data processing pipeline",
    options: {
      systemPrompt: customPrompt
    }
  })) {
    messages.push(message);
    if (message.type === "assistant") {
      console.log(message.message.content);
    }
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage

  custom_prompt = """You are a Python coding specialist.
  Follow these guidelines:
  - Write clean, well-documented code
  - Use type hints for all functions
  - Include comprehensive docstrings
  - Prefer functional programming patterns when appropriate
  - Always explain your code choices"""

  messages = []

  async for message in query(
      prompt="Create a data processing pipeline",
      options=ClaudeAgentOptions(system_prompt=custom_prompt),
  ):
      messages.append(message)
      if isinstance(message, AssistantMessage):
          print(message.content)
  ```

## 比较四种方法

四种自定义方法的区别在于它们的存储位置、共享方式，以及它们对 `claude_code` 预设的保留程度。

| 特性                     | CLAUDE.md         | 输出样式                    | 带追加的 `systemPrompt`      | 自定义 `systemPrompt`      |
| ------------------------ | ----------------- | --------------------------- | ---------------------------- | -------------------------- |
| **持久性**               | 项目内文件        | 保存为文件                  | 仅会话期间                   | 仅会话期间                 |
| **可复用性**             | 项目内            | 跨项目                      | 代码重复                     | 代码重复                   |
| **管理方式**             | 在文件系统上      | CLI + 文件                  | 在代码中                     | 在代码中                   |
| **默认工具**             | 保留              | 保留                        | 保留                         | 丢失（除非手动包含）       |
| **内置安全**             | 维持              | 维持                        | 维持                         | 必须手动添加               |
| **环境上下文**           | 自动              | 自动                        | 自动                         | 必须手动提供               |
| **自定义级别**           | 仅追加            | 替换或扩展默认设置          | 仅追加                       | 完全控制                   |
| **版本控制**             | 随项目            | 是                          | 随代码                       | 随代码                     |
| **作用域**               | 项目特定          | 用户或项目                  | 代码会话                     | 代码会话                   |

"带追加" 指的是在 TypeScript 中使用 `systemPrompt: { type: "preset", preset: "claude_code", append: "..." }` 或在 Python 中使用 `system_prompt={"type": "preset", "preset": "claude_code", "append": "..."}`。CLAUDE.md 本身不改变系统提示词：SDK 将其内容作为项目上下文注入到对话中。

## 用例与最佳实践

### 何时使用 CLAUDE.md

使用 CLAUDE.md 来存放应适用于项目中每个会话（无论该会话使用何种系统提示词）的指令：编码规范、常用命令、架构上下文和团队约定。CLAUDE.md 会被提交到你的仓库，因此它会与其描述的代码保持同步。完整指南请参见 [何时添加到 CLAUDE.md](/zh/memory#when-to-add-to-claude-md)。

当 `project` 设置源启用时（对于默认的 `query()` 选项），CLAUDE.md 文件会被加载。如果你在 TypeScript 中显式设置了 `settingSources` 或在 Python 中设置了 `setting_sources`，请包含 `'project'` 以保持加载项目级别的 CLAUDE.md。

### 何时使用输出样式

输出样式适用于你希望在 CLI 和 SDK 间复用而无需更改应用代码的"角色"。因为它们作为文件存储在 `.claude/output-styles` 中，所以同一个角色可以从 CLI 的 `/config` 命令和任何加载了匹配设置源的 SDK 会话中访问。

**最适合：**

*   跨会话的持久行为更改
*   团队共享配置
*   专门化的助手，如代码审查员、数据科学家或 DevOps 助手
*   需要版本控制的复杂提示词修改

**示例：**

*   创建一个专门的 SQL 优化助手
*   构建一个专注于安全的代码审查员
*   开发一个具有特定教学方法的助教

### 何时使用带追加的 `systemPrompt`

当 `claude_code` 预设已经适合你的产品，并且你只需要叠加额外指令时，使用 `append`。你可以保留预设的工具指导、安全规则和编码约定，而无需重新实现它们。

**最适合：**

*   添加特定的编码规范或偏好
*   自定义输出格式
*   添加领域特定知识
*   修改响应详细程度
*   在不丢失工具指令的情况下增强 Claude Code 的默认行为

### 何时使用自定义 `systemPrompt`

当你的代理的表面、身份或权限模型与 Claude Code 不同时，使用自定义提示词，如 [确定起点](#确定起点) 中所述。你定义完整的指令集，包括你的代理所需的任何工具指导和安全规则。

**最适合：**

*   完全控制 Claude 的行为
*   专门化的单会话任务
*   测试新的提示词策略
*   默认工具不需要的情况
*   构建具有独特行为的专业代理

## 组合使用方法

这些方法可以组合使用。一个持久的输出样式或 CLAUDE.md 设定了长期行为，而 `append` 在其上叠加特定于会话的指令，且不会触动保存的配置。

### 将输出样式与特定于会话的追加相结合

下面的示例假设一个“代码审查员”输出样式已经激活。`append` 块在该角色之上叠加了特定于会话的重点关注领域，因此单个审查会话可以优先处理 OAuth 和 token 存储，而无需更改已保存的输出样式：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Assuming "Code Reviewer" output style is active (via /config or settings)
  // Add session-specific focus areas
  const messages = [];

  for await (const message of query({
    prompt: "Review this authentication module",
    options: {
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: `
          For this review, prioritize:
          - OAuth 2.0 compliance
          - Token storage security
          - Session management
        `
      }
    }
  })) {
    messages.push(message);
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  # Assuming "Code Reviewer" output style is active (via /config or settings)
  # Add session-specific focus areas
  messages = []

  async for message in query(
      prompt="Review this authentication module",
      options=ClaudeAgentOptions(
          system_prompt={
              "type": "preset",
              "preset": "claude_code",
              "append": """
              For this review, prioritize:
              - OAuth 2.0 compliance
              - Token storage security
              - Session management
              """,
          }
      ),
  ):
      messages.append(message)
  ```

## 另请参阅

* [输出样式](/zh/output-styles)：创建、管理和共享 CLI 的输出样式，包括文件格式和存储位置
* [Claude 如何记忆您的项目](/zh/memory)：在 CLAUDE.md 中应包含什么、放置位置以及如何编写有效的项目指令
* [TypeScript SDK 参考](/zh/agent-sdk/typescript)：完整的 `Options` 类型，包括 `systemPrompt`、`settingSources` 和 `settings`
* [Python SDK 参考](/zh/agent-sdk/python)：完整的 `ClaudeAgentOptions` 类型，包括 `system_prompt` 和 `setting_sources`
* [设置](/zh/settings)：`settings.json` 参考，包括输出样式和其他配置的存储位置