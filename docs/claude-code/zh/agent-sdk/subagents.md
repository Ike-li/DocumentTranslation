> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引。
> 在进一步探索前，请使用此文件发现所有可用页面。

# SDK 中的子代理

> 在您的 Claude Agent SDK 应用中，定义并调用子代理以隔离上下文、并行运行任务以及应用专门的指令。

子代理是您的主代理可以派生出来处理聚焦子任务的独立代理实例。
使用子代理来隔离聚焦子任务的上下文、并行运行多个分析，并在不膨胀主代理提示词的情况下应用专门的指令。

本指南解释了如何使用 `agents` 参数在 SDK 中定义和使用子代理。

## 概览

您可以通过三种方式创建子代理：

*   **编程方式**：在您的 `query()` 选项中使用 `agents` 参数 ([TypeScript](/en/agent-sdk/typescript#agentdefinition), [Python](/en/agent-sdk/python#agentdefinition))
*   **基于文件系统的方式**：将代理定义为 `.claude/agents/` 目录中的 Markdown 文件（参见[将子代理定义为文件](/en/sub-agents)）
*   **内置通用代理**：Claude 可以随时通过 Agent 工具调用内置的 `general-purpose` 子代理，无需您定义任何内容

本指南重点介绍编程方式，这是 SDK 应用程序的推荐方法。

当您定义子代理时，Claude 会根据每个子代理的 `description` 字段来决定是否调用它们。编写清晰的描述，解释何时应使用该子代理，Claude 将自动委派相应的任务。您也可以在提示词中显式地通过名称请求子代理（例如，“使用 code-reviewer 代理来...”）。

## 使用子代理的好处

### 上下文隔离

每个子代理都在其独立的新鲜会话中运行。中间的工具调用和结果保留在子代理内部；只有其最终消息会返回给父代理。有关子代理上下文中包含哪些内容的详细信息，请参阅[子代理继承什么](#what-subagents-inherit)。

**示例：** 一个 `research-assistant` 子代理可以探索数十个文件，而不会有任何这些内容累积在主对话中。父代理收到的是简洁的摘要，而不是子代理读取的每个文件。

### 并行化

多个子代理可以并发运行，显著加快复杂工作流程的速度。

**示例：** 在代码审查期间，您可以同时运行 `style-checker`、`security-scanner` 和 `test-coverage` 子代理，将审查时间从几分钟缩短到几秒。

### 专门的指令和知识

每个子代理都可以拥有量身定制的系统提示词，包含特定的专业知识、最佳实践和约束。

**示例：** 一个 `database-migration` 子代理可以拥有关于 SQL 最佳实践、回滚策略和数据完整性检查的详细知识，这些在主代理的指令中则是不必要的噪音。

### 工具限制

子代理可以被限制只能使用特定的工具，从而降低意外操作的风险。

**示例：** 一个 `doc-reviewer` 子代理可能只有 Read 和 Grep 工具的访问权限，确保它可以分析但永远不会意外修改您的文档文件。

## 创建子代理

### 编程定义（推荐）

使用 `agents` 参数在代码中直接定义子代理。此示例创建了两个子代理：一个具有只读访问权限的代码审查器和一个可以执行命令的测试运行器。Claude 通过 `Agent` 工具调用子代理，因此请将 `Agent` 包含在 `allowedTools` 中，以自动批准子代理调用，而无需权限提示。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


  async def main():
      async for message in query(
          prompt="Review the authentication module for security issues",
          options=ClaudeAgentOptions(
              # Auto-approve these tools, including Agent for subagent invocation
              allowed_tools=["Read", "Grep", "Glob", "Agent"],
              agents={
                  "code-reviewer": AgentDefinition(
                      # description tells Claude when to use this subagent
                      description="Expert code review specialist. Use for quality, security, and maintainability reviews.",
                      # prompt defines the subagent's behavior and expertise
                      prompt="""You are a code review specialist with expertise in security, performance, and best practices.

  When reviewing code:
  - Identify security vulnerabilities
  - Check for performance issues
  - Verify adherence to coding standards
  - Suggest specific improvements

  Be thorough but concise in your feedback.""",
                      # tools restricts what the subagent can do (read-only here)
                      tools=["Read", "Grep", "Glob"],
                      # model overrides the default model for this subagent
                      model="sonnet",
                  ),
                  "test-runner": AgentDefinition(
                      description="Runs and analyzes test suites. Use for test execution and coverage analysis.",
                      prompt="""You are a test execution specialist. Run tests and provide clear analysis of results.

  Focus on:
  - Running test commands
  - Analyzing test output
  - Identifying failing tests
  - Suggesting fixes for failures""",
                      # Bash access lets this subagent run test commands
                      tools=["Bash", "Read", "Grep"],
                  ),
              },
          ),
      ):
          if hasattr(message, "result"):
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Review the authentication module for security issues",
    options: {
      // Auto-approve these tools, including Agent for subagent invocation
      allowedTools: ["Read", "Grep", "Glob", "Agent"],
      agents: {
        "code-reviewer": {
          // description tells Claude when to use this subagent
          description:
            "Expert code review specialist. Use for quality, security, and maintainability reviews.",
          // prompt defines the subagent's behavior and expertise
          prompt: `You are a code review specialist with expertise in security, performance, and best practices.

  When reviewing code:
  - Identify security vulnerabilities
  - Check for performance issues
  - Verify adherence to coding standards
  - Suggest specific improvements

  Be thorough but concise in your feedback.`,
          // tools restricts what the subagent can do (read-only here)
          tools: ["Read", "Grep", "Glob"],
          // model overrides the default model for this subagent
          model: "sonnet"
        },
        "test-runner": {
          description:
            "Runs and analyzes test suites. Use for test execution and coverage analysis.",
          prompt: `You are a test execution specialist. Run tests and provide clear analysis of results.

  Focus on:
  - Running test commands
  - Analyzing test output
  - Identifying failing tests
  - Suggesting fixes for failures`,
          // Bash access lets this subagent run test commands
          tools: ["Bash", "Read", "Grep"]
        }
      }
    }
  })) {
    if ("result" in message) console.log(message.result);
  }
  ```

### AgentDefinition 配置

| 字段              | 类型                                                        | 必填 | 描述                                                                                                                                                           |
| :---------------- | :---------------------------------------------------------- | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | `string`                                                    | 是   | 使用此代理的场景的自然语言描述                                                                                                                                 |
| `prompt`          | `string`                                                    | 是   | 定义代理角色与行为的系统提示词                                                                                                                                 |
| `tools`           | `string[]`                                                  | 否   | 允许使用的工具名称数组。若省略，则继承所有工具                                                                                                                 |
| `disallowedTools` | `string[]`                                                  | 否   | 要从代理工具集中移除的工具名称数组                                                                                                                             |
| `model`           | `string`                                                    | 否   | 此代理的模型覆盖设置。接受别名如 `'sonnet'`、`'opus'`、`'haiku'`、`'inherit'`，或完整的模型 ID。若省略则使用主模型                                              |
| `skills`          | `string[]`                                                  | 否   | 启动时预加载到代理上下文的技能名称列表。未列出的技能仍可通过 Skill 工具调用                                                                                    |
| `memory`          | `'user' \| 'project' \| 'local'`                            | 否   | 此代理的记忆来源                                                                                                                                               |
| `mcpServers`      | `(string \| object)[]`                                      | 否   | 此代理可用的 MCP 服务器，可通过名称或内联配置指定                                                                                                              |
| `maxTurns`        | `number`                                                    | 否   | 代理停止前的最大代理回合数                                                                                                                                     |
| `background`      | `boolean`                                                   | 否   | 调用时是否将此代理作为非阻塞后台任务运行                                                                                                                       |
| `effort`          | `'low' \| 'medium' \| 'high' \| 'xhigh' \| 'max' \| number` | 否   | 此代理的推理努力级别                                                                                                                                           |
| `permissionMode`  | `PermissionMode`                                            | 否   | 此代理内工具执行的权限模式                                                                                                                                     |

在 Python SDK 中，这些字段名称使用 camelCase 以匹配传输格式。详情请参阅 [`AgentDefinition` 参考文档](/en/agent-sdk/python#agentdefinition)。

  子代理不能生成自己的子代理。不要在子代理的 `tools` 数组中包含 `Agent`。

### 基于文件系统的定义（替代方案）

您也可以通过在 `.claude/agents/` 目录中创建 Markdown 文件来定义子代理。有关此方法的详细信息，请参阅 [Claude Code 子代理文档](/en/sub-agents)。通过程序定义的代理优先于基于文件系统且同名的代理。

  即使不自定义子代理，Claude 也能调用内置的 `general-purpose` 子代理。这对于委托研究或探索任务非常有用，无需创建专门的代理。请在 `allowedTools` 中包含 `Agent`，这样这些调用将自动批准，无需权限提示。

## 子代理的继承规则

子代理的上下文窗口重新开始（不包含父会话的对话），但并非完全空白。从父代理到子代理的唯一通道是 Agent 工具的提示字符串，因此请将子代理所需的任何文件路径、错误消息或决策直接包含在该提示中。

| 子代理接收的内容                                                             | 子代理不接收的内容                                      |
| :--------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| 其自身的系统提示词（`AgentDefinition.prompt`）及 Agent 工具的提示             | 父代理的对话历史或工具调用结果                                      |
| 项目 CLAUDE.md 文件（通过 `settingSources` 加载）                             | 预加载的技能内容，除非列于 `AgentDefinition.skills` 中           |
| 工具定义（从父代理继承，或 `tools` 中指定的子集）                             | 父代理的系统提示词                                                |

  父代理会逐字接收子代理的最终消息作为**Agent**工具结果，但可能会在自身响应中进行总结。若需在面向用户的响应中保留子代理输出的原始内容，请在**主**`query()`调用中传递的提示词或`systemPrompt`选项中添加相关指令。

## 调用子代理

### 自动调用

Claude 会根据任务内容和每个子代理的 `description`（描述）自动决定何时调用子代理。例如，如果你定义了一个名为 `performance-optimizer` 的子代理，其描述为“查询调优的性能优化专家”，那么当你的提示词中提到优化查询时，Claude 就会调用它。

请撰写清晰、具体的描述，以便 Claude 将任务与正确的子代理匹配。

### 显式调用

要确保 Claude 使用特定的子代理，请在提示词中按名称提及它：
```text
"Use the code-reviewer agent to check the authentication module"
```
这会绕过自动匹配，直接调用命名的子代理。

### 动态代理配置

您可以基于运行时条件动态创建代理定义。以下示例创建了一个具有不同严格级别的安全审查员，其中严格审查会使用更强大的模型。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


  # Factory function that returns an AgentDefinition
  # This pattern lets you customize agents based on runtime conditions
  def create_security_agent(security_level: str) -> AgentDefinition:
      is_strict = security_level == "strict"
      return AgentDefinition(
          description="Security code reviewer",
          # Customize the prompt based on strictness level
          prompt=f"You are a {'strict' if is_strict else 'balanced'} security reviewer...",
          tools=["Read", "Grep", "Glob"],
          # Key insight: use a more capable model for high-stakes reviews
          model="opus" if is_strict else "sonnet",
      )


  async def main():
      # The agent is created at query time, so each request can use different settings
      async for message in query(
          prompt="Review this PR for security issues",
          options=ClaudeAgentOptions(
              allowed_tools=["Read", "Grep", "Glob", "Agent"],
              agents={
                  # Call the factory with your desired configuration
                  "security-reviewer": create_security_agent("strict")
              },
          ),
      ):
          if hasattr(message, "result"):
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query, type AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

  // Factory function that returns an AgentDefinition
  // This pattern lets you customize agents based on runtime conditions
  function createSecurityAgent(securityLevel: "basic" | "strict"): AgentDefinition {
    const isStrict = securityLevel === "strict";
    return {
      description: "Security code reviewer",
      // Customize the prompt based on strictness level
      prompt: `You are a ${isStrict ? "strict" : "balanced"} security reviewer...`,
      tools: ["Read", "Grep", "Glob"],
      // Key insight: use a more capable model for high-stakes reviews
      model: isStrict ? "opus" : "sonnet"
    };
  }

  // The agent is created at query time, so each request can use different settings
  for await (const message of query({
    prompt: "Review this PR for security issues",
    options: {
      allowedTools: ["Read", "Grep", "Glob", "Agent"],
      agents: {
        // Call the factory with your desired configuration
        "security-reviewer": createSecurityAgent("strict")
      }
    }
  })) {
    if ("result" in message) console.log(message.result);
  }
  ```

## 检测子代理调用

子代理通过 `Agent` 工具调用。要检测子代理何时被调用，请检查 `tool_use` 块，其中 `name` 字段为 `"Agent"`。来自子代理上下文的消息包含一个 `parent_tool_use_id` 字段。

  工具名称在 Claude Code v2.1.63 中已从 `"Task"` 更名为 `"Agent"`。当前 SDK 版本在 `tool_use` 块中会输出 `"Agent"`，但在 `system:init` 工具列表和 `result.permission_denials[].tool_name` 中仍使用 `"Task"`。在 `block.name` 中检查这两个值可确保跨 SDK 版本的兼容性。

此示例遍历流式消息，记录子代理被调用的时刻，以及后续消息源自该子代理执行上下文的时刻。

  不同 SDK 的消息结构有所差异。在 Python 中，内容块通过 `message.content` 直接访问。在 TypeScript 中，`SDKAssistantMessage` 封装了 Claude API 消息，因此需要通过 `message.message.content` 访问内容。



  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition, ToolUseBlock


  async def main():
      async for message in query(
          prompt="Use the code-reviewer agent to review this codebase",
          options=ClaudeAgentOptions(
              allowed_tools=["Read", "Glob", "Grep", "Agent"],
              agents={
                  "code-reviewer": AgentDefinition(
                      description="Expert code reviewer.",
                      prompt="Analyze code quality and suggest improvements.",
                      tools=["Read", "Glob", "Grep"],
                  )
              },
          ),
      ):
          # Check for subagent invocation. Match both names: older SDK
          # versions emitted "Task", current versions emit "Agent".
          if hasattr(message, "content") and message.content:
              for block in message.content:
                  if isinstance(block, ToolUseBlock) and block.name in (
                      "Task",
                      "Agent",
                  ):
                      print(f"Subagent invoked: {block.input.get('subagent_type')}")

          # Check if this message is from within a subagent's context
          if hasattr(message, "parent_tool_use_id") and message.parent_tool_use_id:
              print("  (running inside subagent)")

          if hasattr(message, "result"):
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Use the code-reviewer agent to review this codebase",
    options: {
      allowedTools: ["Read", "Glob", "Grep", "Agent"],
      agents: {
        "code-reviewer": {
          description: "Expert code reviewer.",
          prompt: "Analyze code quality and suggest improvements.",
          tools: ["Read", "Glob", "Grep"]
        }
      }
    }
  })) {
    const msg = message as any;

    // Check for subagent invocation. Match both names: older SDK versions
    // emitted "Task", current versions emit "Agent".
    for (const block of msg.message?.content ?? []) {
      if (block.type === "tool_use" && (block.name === "Task" || block.name === "Agent")) {
        console.log(`Subagent invoked: ${block.input.subagent_type}`);
      }
    }

    // Check if this message is from within a subagent's context
    if (msg.parent_tool_use_id) {
      console.log("  (running inside subagent)");
    }

    if ("result" in message) {
      console.log(message.result);
    }
  }
  ```

## 恢复子代理

子代理可以被恢复以继续之前中断的工作。恢复的子代理会保留其完整的对话历史，包括所有先前的工具调用、结果和推理过程。子代理会准确地从它停止的地方继续，而不是重新开始。

当子代理完成时，Claude 会在 Agent 工具结果中收到其代理 ID。要以编程方式恢复子代理：

1.  **捕获会话 ID**：在第一次查询过程中，从消息中提取 `session_id`
2.  **提取代理 ID**：从消息内容中解析 `agentId`
3.  **恢复会话**：在第二次查询的选项中传入 `resume: sessionId`，并在你的提示词中包含该代理 ID

  要访问子代理的转录内容，您必须延续同一个会话。默认情况下，每次 `query()` 调用都会启动新会话，因此请传递 `resume: sessionId` 以在原会话中继续操作。

  如果您使用的是自定义代理（而非内置代理），则需要在两次查询的 `agents` 参数中传递相同的代理定义。

以下示例展示了此流程：第一个查询运行一个子代理并捕获会话ID和代理ID，然后第二个查询恢复会话以提出需要第一个分析上下文的后续问题。

  ```typescript TypeScript
  import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

  // Helper to extract agentId from message content
  // Stringify to avoid traversing different block types (TextBlock, ToolResultBlock, etc.)
  function extractAgentId(message: SDKMessage): string | undefined {
    if (message.type !== "assistant" && message.type !== "user") return undefined;
    // Stringify the content so we can search it without traversing nested blocks
    const content = JSON.stringify(message.message.content);
    const match = content.match(/agentId:\s*([a-f0-9-]+)/);
    return match?.[1];
  }

  let agentId: string | undefined;
  let sessionId: string | undefined;

  // First invocation - use the Explore agent to find API endpoints
  for await (const message of query({
    prompt: "Use the Explore agent to find all API endpoints in this codebase",
    options: { allowedTools: ["Read", "Grep", "Glob", "Agent"] }
  })) {
    // Capture session_id from ResultMessage (needed to resume this session)
    if ("session_id" in message) sessionId = message.session_id;
    // Search message content for the agentId (appears in Agent tool results)
    const extractedId = extractAgentId(message);
    if (extractedId) agentId = extractedId;
    // Print the final result
    if ("result" in message) console.log(message.result);
  }

  // Second invocation - resume and ask follow-up
  if (agentId && sessionId) {
    for await (const message of query({
      prompt: `Resume agent ${agentId} and list the top 3 most complex endpoints`,
      options: { allowedTools: ["Read", "Grep", "Glob", "Agent"], resume: sessionId }
    })) {
      if ("result" in message) console.log(message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  import json
  import re
  from claude_agent_sdk import query, ClaudeAgentOptions


  def extract_agent_id(text: str) -> str | None:
      """Extract agentId from Agent tool result text."""
      match = re.search(r"agentId:\s*([a-f0-9-]+)", text)
      return match.group(1) if match else None


  async def main():
      agent_id = None
      session_id = None

      # First invocation - use the Explore agent to find API endpoints
      async for message in query(
          prompt="Use the Explore agent to find all API endpoints in this codebase",
          options=ClaudeAgentOptions(allowed_tools=["Read", "Grep", "Glob", "Agent"]),
      ):
          # Capture session_id from ResultMessage (needed to resume this session)
          if hasattr(message, "session_id"):
              session_id = message.session_id
          # Search message content for the agentId (appears in Agent tool results)
          if hasattr(message, "content"):
              # Stringify the content so we can search it without traversing nested blocks
              content_str = json.dumps(message.content, default=str)
              extracted = extract_agent_id(content_str)
              if extracted:
                  agent_id = extracted
          # Print the final result
          if hasattr(message, "result"):
              print(message.result)

      # Second invocation - resume and ask follow-up
      if agent_id and session_id:
          async for message in query(
              prompt=f"Resume agent {agent_id} and list the top 3 most complex endpoints",
              options=ClaudeAgentOptions(
                  allowed_tools=["Read", "Grep", "Glob", "Agent"], resume=session_id
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


  asyncio.run(main())
  ```

子代理的转录记录独立于主对话存在：

* **主对话压缩**：当主对话进行压缩时，子代理的转录记录不受影响。它们存储在独立的文件中。
* **会话持久性**：子代理的转录记录在其会话中持续存在。您可以通过恢复同一个会话，在重启 Claude Code 后继续使用子代理。
* **自动清理**：转录记录会根据 `cleanupPeriodDays` 设置（默认：30 天）自动清理。

## 工具限制

子代理的工具访问权限可通过 `tools` 字段进行限制：

* **省略该字段**：代理将继承所有可用工具（默认行为）
* **指定工具**：代理只能使用列出的工具

此示例创建了一个只读分析代理，该代理可以检查代码，但不能修改文件或运行命令。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


  async def main():
      async for message in query(
          prompt="Analyze the architecture of this codebase",
          options=ClaudeAgentOptions(
              allowed_tools=["Read", "Grep", "Glob", "Agent"],
              agents={
                  "code-analyzer": AgentDefinition(
                      description="Static code analysis and architecture review",
                      prompt="""You are a code architecture analyst. Analyze code structure,
  identify patterns, and suggest improvements without making changes.""",
                      # Read-only tools: no Edit, Write, or Bash access
                      tools=["Read", "Grep", "Glob"],
                  )
              },
          ),
      ):
          if hasattr(message, "result"):
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Analyze the architecture of this codebase",
    options: {
      allowedTools: ["Read", "Grep", "Glob", "Agent"],
      agents: {
        "code-analyzer": {
          description: "Static code analysis and architecture review",
          prompt: `You are a code architecture analyst. Analyze code structure,
  identify patterns, and suggest improvements without making changes.`,
          // Read-only tools: no Edit, Write, or Bash access
          tools: ["Read", "Grep", "Glob"]
        }
      }
    }
  })) {
    if ("result" in message) console.log(message.result);
  }
  ```

### 常见工具组合

| 用例               | 工具                                    | 描述                                                |
| :----------------- | :-------------------------------------- | :-------------------------------------------------- |
| 只读分析           | `Read`, `Grep`, `Glob`                  | 可检查代码但不能修改或执行                          |
| 测试执行           | `Bash`, `Read`, `Grep`                  | 可运行命令并分析输出                                |
| 代码修改           | `Read`, `Edit`, `Write`, `Grep`, `Glob` | 无命令执行权限的完整读写访问                        |
| 完全访问           | 所有工具                                | 继承父级的所有工具（省略 `tools` 字段）             |

## 通过动态工作流进行扩展

子代理适用于每轮委派少量任务。对于需要协调数十到数百个代理的运行，请使用 `Workflow` 工具，该工具将编排逻辑移入脚本中，由运行时在对话上下文之外执行。关于工作流与逐轮子代理委派的区别，请参阅[动态工作流](/en/workflows)。

`Workflow` 工具在 TypeScript Agent SDK v0.3.149 及更高版本中可用。在 `allowedTools` 中包含 `Workflow` 以自动批准工作流运行。工具输入和输出模式请参阅 [TypeScript 参考](/en/agent-sdk/typescript#workflow)。

## 故障排除

### Claude 未委派给子代理

如果 Claude 直接完成任务，而不是委派给你的子代理：

1.  **检查 Agent 调用是否已批准**：在 `allowedTools` 中包含 `Agent` 以自动批准子代理调用。如果没有此项，Agent 调用将回退到你的 `canUseTool` 回调，或在 `dontAsk` 模式下被拒绝。
2.  **使用明确的提示词**：在提示词中提及子代理的名称（例如，“使用 code-reviewer 代理来...”）。
3.  **编写清晰的描述**：明确说明应在何时使用子代理，以便 Claude 能够准确匹配任务。

### 基于文件系统的代理未加载

在 `.claude/agents/` 中定义的代理仅在启动时加载。如果你在 Claude Code 运行期间创建了新的代理文件，请重启会话以加载它。

### Windows：长提示词失败

在 Windows 上，带有很长提示词的子代理可能会因命令行长度限制（8191 字符）而失败。请保持提示词简洁，或对复杂指令使用基于文件系统的代理。

## 相关文档

*   [Claude Code 子代理](/en/sub-agents)：全面的子代理文档，包括基于文件系统的定义。
*   [动态工作流](/en/workflows)：通过脚本编排大量子代理，用于单个对话无法完成的大型任务。
*   [SDK 概述](/en/agent-sdk/overview)：Claude Agent SDK 入门指南。