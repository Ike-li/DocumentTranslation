> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# SDK 中的斜杠命令

> 学习如何通过 SDK 使用斜杠命令控制 Claude Code 会话

斜杠命令提供了一种通过以 `/` 开头的特殊命令来控制 Claude Code 会话的方式。这些命令可以通过 SDK 发送，以执行压缩上下文、列出上下文使用情况或调用自定义命令等操作。只有无需交互式终端即可工作的命令才能通过 SDK 分派；`system/init` 消息会列出您的会话中可用的命令。

## 发现可用的斜杠命令

Claude Agent SDK 在系统初始化消息中提供关于可用斜杠命令的信息。在您的会话开始时访问此信息：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Hello Claude",
    options: { maxTurns: 1 }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log("Available slash commands:", message.slash_commands);
      // Example output: ["clear", "compact", "context", "usage"]
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


  async def main():
      async for message in query(prompt="Hello Claude", options=ClaudeAgentOptions(max_turns=1)):
          if isinstance(message, SystemMessage) and message.subtype == "init":
              print("Available slash commands:", message.data["slash_commands"])
              # Example output: ["clear", "compact", "context", "usage"]


  asyncio.run(main())
  ```

## 发送斜杠命令

通过将斜杠命令包含在提示词字符串中来发送它们，就像发送普通文本一样：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Send a slash command
  for await (const message of query({
    prompt: "/compact",
    options: { maxTurns: 1 }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log("Command executed:", message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      # Send a slash command
      async for message in query(prompt="/compact", options=ClaudeAgentOptions(max_turns=1)):
          if isinstance(message, ResultMessage):
              print("Command executed:", message.result)


  asyncio.run(main())
  ```

## 常用斜杠命令

### `/compact` - 压缩对话历史

`/compact` 命令通过总结较早的消息来减少对话历史的大小，同时保留重要的上下文：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "/compact",
    options: { maxTurns: 1 }
  })) {
    if (message.type === "system" && message.subtype === "compact_boundary") {
      console.log("Compaction completed");
      console.log("Pre-compaction tokens:", message.compact_metadata.pre_tokens);
      console.log("Trigger:", message.compact_metadata.trigger);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


  async def main():
      async for message in query(prompt="/compact", options=ClaudeAgentOptions(max_turns=1)):
          if isinstance(message, SystemMessage) and message.subtype == "compact_boundary":
              print("Compaction completed")
              print("Pre-compaction tokens:", message.data["compact_metadata"]["pre_tokens"])
              print("Trigger:", message.data["compact_metadata"]["trigger"])


  asyncio.run(main())
  ```

### `/clear` - 重置会话上下文

`/clear` 命令将会话重置为空上下文，因此后续提示词将不包含任何先前的会话历史记录。之前的会话内容仍保留在磁盘上，并可通过将其会话 ID 传递给 [`resume` 选项](/zh/agent-sdk/sessions#resume-by-id) 来恢复。

这在[流式输入模式](/zh/agent-sdk/streaming-vs-single-mode)中非常有用，该模式下您可以通过单个连接发送多个提示词。对于一次性的 `query()` 调用，每次调用本身已是从空上下文开始，因此发送 `/clear` 没有实际效果；此时应启动一个新的 `query()` 调用。

  SDK 中的 `/clear` 命令需要 Claude Code v2.1.117 或更高版本。在更早的版本中，该命令会从 `slash_commands` 列表中被省略。

## 创建自定义斜杠命令

除了使用内置斜杠命令外，您还可以创建自己通过SDK可用的自定义命令。自定义命令定义为特定目录中的markdown文件，类似于子代理的配置方式。

  `.claude/commands/` 目录属于旧格式。推荐格式为 `.claude/skills/<name>/SKILL.md`，它支持相同的斜杠命令调用（`/name`），并支持由 Claude 进行自主调用。请参阅 [技能](/zh/agent-sdk/skills) 了解当前格式。CLI 仍支持两种格式，以下示例对 `.claude/commands/` 依然适用。

### 文件位置

自定义斜杠命令根据其作用范围存储在指定目录中：

* **项目命令**：`.claude/commands/` - 仅在当前项目中可用（旧版；推荐使用 `.claude/skills/`）
* **个人命令**：`~/.claude/commands/` - 在您的所有项目中可用（旧版；推荐使用 `~/.claude/skills/`）

### 文件格式

每个自定义命令都是一个 Markdown 文件，其中：

* 文件名（不包含 `.md` 扩展名）成为命令名称
* 文件内容定义了命令的功能
* 可选的 YAML 元数据提供配置

#### 基本示例

创建 `.claude/commands/refactor.md`：
```markdown
Refactor the selected code to improve readability and maintainability.
Focus on clean code principles and best practices.
```
这将创建可通过 SDK 使用的 `/refactor` 命令。

#### 包含前置数据

创建 `.claude/commands/security-check.md`：
```markdown
---
allowed-tools: Read, Grep, Glob
description: Run security vulnerability scan
model: claude-opus-4-7
---

Analyze the codebase for security vulnerabilities including:
- SQL injection risks
- XSS vulnerabilities
- Exposed credentials
- Insecure configurations
```
### 在 SDK 中使用自定义命令

一旦在文件系统中定义，自定义命令即可通过 SDK 自动使用：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Use a custom command
  for await (const message of query({
    prompt: "/refactor src/auth/login.ts",
    options: { maxTurns: 3 }
  })) {
    if (message.type === "assistant") {
      console.log("Refactoring suggestions:", message.message);
    }
  }

  // Custom commands appear in the slash_commands list
  for await (const message of query({
    prompt: "Hello",
    options: { maxTurns: 1 }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      // Will include both built-in and custom commands
      console.log("Available commands:", message.slash_commands);
      // Example: ["clear", "compact", "context", "usage", "refactor", "security-check"]
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, SystemMessage


  async def main():
      # Use a custom command
      async for message in query(
          prompt="/refactor src/auth/login.py", options=ClaudeAgentOptions(max_turns=3)
      ):
          if isinstance(message, AssistantMessage):
              for block in message.content:
                  if hasattr(block, "text"):
                      print("Refactoring suggestions:", block.text)

      # Custom commands appear in the slash_commands list
      async for message in query(prompt="Hello", options=ClaudeAgentOptions(max_turns=1)):
          if isinstance(message, SystemMessage) and message.subtype == "init":
              # Will include both built-in and custom commands
              print("Available commands:", message.data["slash_commands"])
              # Example: ["clear", "compact", "context", "usage", "refactor", "security-check"]


  asyncio.run(main())
  ```

### 高级功能

#### 参数和占位符

自定义命令支持使用占位符的动态参数：

创建 `.claude/commands/fix-issue.md`：
```markdown
---
argument-hint: [issue-number] [priority]
description: Fix a GitHub issue
---

Fix issue #$1 with priority $2.
Check the issue description and implement the necessary changes.
```
在SDK中使用：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Pass arguments to custom command
  for await (const message of query({
    prompt: "/fix-issue 123 high",
    options: { maxTurns: 5 }
  })) {
    // Command will process with $1="123" and $2="high"
    if (message.type === "result" && message.subtype === "success") {
      console.log("Issue fixed:", message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      # Pass arguments to custom command
      async for message in query(prompt="/fix-issue 123 high", options=ClaudeAgentOptions(max_turns=5)):
          # Command will process with $1="123" and $2="high"
          if isinstance(message, ResultMessage):
              print("Issue fixed:", message.result)


  asyncio.run(main())
  ```

#### Bash 命令执行

自定义命令可以执行 bash 命令并包含其输出：

创建 `.claude/commands/git-commit.md`：
```markdown
---
allowed-tools: Bash(git add *), Bash(git status *), Bash(git commit *)
description: Create a git commit
---

## Context

- Current status: !`git status`
- Current diff: !`git diff HEAD`

## Task

Create a git commit with appropriate message based on the changes.
```
#### 文件引用

使用 `@` 前缀来包含文件内容：

创建 `.claude/commands/review-config.md`：
```markdown
---
description: Review configuration files
---

Review the following configuration files for issues:
- Package config: @package.json
- TypeScript config: @tsconfig.json
- Environment config: @.env

Check for security issues, outdated dependencies, and misconfigurations.
```
### 通过命名空间进行组织

将命令组织到子目录中以获得更好的结构：
```bash
.claude/commands/
├── frontend/
│   ├── component.md      # Creates /component (project:frontend)
│   └── style-check.md     # Creates /style-check (project:frontend)
├── backend/
│   ├── api-test.md        # Creates /api-test (project:backend)
│   └── db-migrate.md      # Creates /db-migrate (project:backend)
└── review.md              # Creates /review (project)
```
子目录会出现在命令描述中，但不影响命令名称本身。

### 实用示例

#### 代码审查命令

创建 `.claude/commands/code-review.md`：
```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff *)
description: Comprehensive code review
---

## Changed Files
!`git diff --name-only HEAD~1`

## Detailed Changes
!`git diff HEAD~1`

## Review Checklist

Review the above changes for:
1. Code quality and readability
2. Security vulnerabilities
3. Performance implications
4. Test coverage
5. Documentation completeness

Provide specific, actionable feedback organized by priority.
```
#### 测试运行器命令

创建 `.claude/commands/test.md`：
```markdown
---
allowed-tools: Bash, Read, Edit
argument-hint: [test-pattern]
description: Run tests with optional pattern
---

Run tests matching pattern: $ARGUMENTS

1. Detect the test framework (Jest, pytest, etc.)
2. Run tests with the provided pattern
3. If tests fail, analyze and fix them
4. Re-run to verify fixes
```
通过 SDK 使用这些命令：
</s>

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Run code review
  for await (const message of query({
    prompt: "/code-review",
    options: { maxTurns: 3 }
  })) {
    // Process review feedback
  }

  // Run specific tests
  for await (const message of query({
    prompt: "/test auth",
    options: { maxTurns: 5 }
  })) {
    // Handle test results
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions


  async def main():
      # Run code review
      async for message in query(prompt="/code-review", options=ClaudeAgentOptions(max_turns=3)):
          # Process review feedback
          pass

      # Run specific tests
      async for message in query(prompt="/test auth", options=ClaudeAgentOptions(max_turns=5)):
          # Handle test results
          pass


  asyncio.run(main())
  ```

## 另请参阅

* [斜杠命令](/zh/skills) - 完整的斜杠命令文档
* [SDK 中的子代理](/zh/agent-sdk/subagents) - 子代理基于文件系统的类似配置
* [TypeScript SDK 参考](/zh/agent-sdk/typescript) - 完整的 API 文档
* [SDK 概览](/zh/agent-sdk/overview) - SDK 的通用概念
* [命令行接口参考](/zh/cli-reference) - 命令行接口