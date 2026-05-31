> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，使用此文件查看所有可用页面。

# 通过钩子拦截和控制代理行为

> 通过钩子在关键执行点拦截和定制代理行为

钩子是响应代理事件（如工具调用、会话开始或执行停止）而运行您代码的回调函数。通过钩子，您可以：

* **阻止危险操作**在执行前发生，如破坏性 shell 命令或未授权的文件访问
* **记录和审计**每次工具调用，用于合规性、调试或分析
* **转换输入和输出**以清理数据、注入凭据或重定向文件路径
* **要求人工批准**敏感操作，如数据库写入或 API 调用
* **跟踪会话生命周期**以管理状态、清理资源或发送通知

本指南涵盖钩子的工作原理、如何配置钩子，并为常见模式（如阻止工具、修改输入和转发通知）提供示例。

## 钩子工作原理


    在代理执行过程中，某些事件发生时 SDK 会触发相应事件：工具即将被调用（`PreToolUse`）、工具返回结果（`PostToolUse`）、子代理启动或停止、代理处于闲置状态，或执行完成。请参阅[完整事件列表](#available-hooks)。



    该 SDK 会检查为该事件类型注册的钩子。这包括通过 `options.hooks` 传入的回调钩子，以及当对应的 [`settingSources`](/en/agent-sdk/typescript#settingsource) 或 [`setting_sources`](/en/agent-sdk/python#settingsource) 条目启用时（默认的 `query()` 选项会启用这些条目），从设置文件中加载的 shell 命令钩子。



    如果一个钩子拥有 [`matcher`](#matchers) 匹配模式（如 `"Write|Edit"`），SDK 会针对事件的目标（例如工具名称）进行测试。没有匹配模式的钩子会对该类型的每个事件都运行。



    每个匹配的钩子的[回调函数](#callback-functions)会接收关于正在发生什么的输入：工具名称、其参数、会话 ID，以及其他事件特定细节。



    在执行任何操作（日志记录、API 调用、验证）后，您的回调会返回一个[输出对象](#outputs)，该对象指示代理应执行的操作：允许操作、阻止操作、修改输入或向对话中注入上下文。


以下示例将这些步骤整合在一起。它注册了一个 `PreToolUse` 钩子（步骤 1），并设置了一个 `"Write|Edit"` 匹配器（步骤 3），这样回调函数就只针对文件写入工具触发。当触发时，回调函数会接收工具的输入（步骤 4），检查文件路径是否指向 `.env` 文件，并返回 `permissionDecision: "deny"` 以阻止该操作（步骤 5）：

  ```python Python
  import asyncio
  from claude_agent_sdk import (
      AssistantMessage,
      ClaudeSDKClient,
      ClaudeAgentOptions,
      HookMatcher,
      ResultMessage,
  )


  # Define a hook callback that receives tool call details
  async def protect_env_files(input_data, tool_use_id, context):
      # Extract the file path from the tool's input arguments
      file_path = input_data["tool_input"].get("file_path", "")
      file_name = file_path.split("/")[-1]

      # Block the operation if targeting a .env file
      if file_name == ".env":
          return {
              "hookSpecificOutput": {
                  "hookEventName": input_data["hook_event_name"],
                  "permissionDecision": "deny",
                  "permissionDecisionReason": "Cannot modify .env files",
              }
          }

      # Return empty object to allow the operation
      return {}


  async def main():
      options = ClaudeAgentOptions(
          hooks={
              # Register the hook for PreToolUse events
              # The matcher filters to only Write and Edit tool calls
              "PreToolUse": [HookMatcher(matcher="Write|Edit", hooks=[protect_env_files])]
          }
      )

      async with ClaudeSDKClient(options=options) as client:
          await client.query("Update the database configuration")
          async for message in client.receive_response():
              # Filter for assistant and result messages
              if isinstance(message, (AssistantMessage, ResultMessage)):
                  print(message)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query, HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

  // Define a hook callback with the HookCallback type
  const protectEnvFiles: HookCallback = async (input, toolUseID, { signal }) => {
    // Cast input to the specific hook type for type safety
    const preInput = input as PreToolUseHookInput;

    // Cast tool_input to access its properties (typed as unknown in the SDK)
    const toolInput = preInput.tool_input as Record<string, unknown>;
    const filePath = toolInput?.file_path as string;
    const fileName = filePath?.split("/").pop();

    // Block the operation if targeting a .env file
    if (fileName === ".env") {
      return {
        hookSpecificOutput: {
          hookEventName: preInput.hook_event_name,
          permissionDecision: "deny",
          permissionDecisionReason: "Cannot modify .env files"
        }
      };
    }

    // Return empty object to allow the operation
    return {};
  };

  for await (const message of query({
    prompt: "Update the database configuration",
    options: {
      hooks: {
        // Register the hook for PreToolUse events
        // The matcher filters to only Write and Edit tool calls
        PreToolUse: [{ matcher: "Write|Edit", hooks: [protectEnvFiles] }]
      }
    }
  })) {
    // Filter for assistant and result messages
    if (message.type === "assistant" || message.type === "result") {
      console.log(message);
    }
  }
  ```

## 可用钩子

SDK 为代理执行的不同阶段提供了钩子。一些钩子在两种 SDK 中均可用，而另一些则仅限于 TypeScript。

| 钩子事件             | Python SDK | TypeScript SDK | 触发条件                                                                              | 示例用例                                                              |
| -------------------- | ---------- | -------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `PreToolUse`         | 是         | 是             | 工具调用请求（可阻止或修改）                                                          | 阻止危险的 shell 命令                                                 |
| `PostToolUse`        | 是         | 是             | 工具执行结果                                                                          | 将所有文件更改记录到审计跟踪                                          |
| `PostToolUseFailure` | 是         | 是             | 工具执行失败                                                                          | 处理或记录工具错误                                                    |
| `PostToolBatch`      | 否         | 是             | 一批完整的工具调用解析完成，每批次在下一个模型调用前触发一次                          | 为整个批次注入一次约定                                                |
| `UserPromptSubmit`   | 是         | 是             | 用户提示词提交                                                                        | 向提示词中注入额外上下文                                              |
| `MessageDisplay`     | 否         | 是             | 包含文本的助手消息完成，每条消息以完整文本触发一次                                    | 编辑或重新格式化显示的文本而不更改记录                                |
| `Stop`               | 是         | 是             | 代理执行停止                                                                          | 退出前保存会话状态                                                    |
| `SubagentStart`      | 是         | 是             | 子代理初始化                                                                          | 跟踪并行任务的生成                                                    |
| `SubagentStop`       | 是         | 是             | 子代理完成                                                                            | 聚合并行任务的结果                                                    |
| `PreCompact`         | 是         | 是             | 对话压缩请求                                                                          | 在总结前归档完整记录                                                  |
| `PermissionRequest`  | 是         | 是             | 将显示权限对话框                                                                      | 自定义权限处理                                                        |
| `SessionStart`       | 否         | 是             | 会话初始化                                                                            | 初始化日志和遥测                                                      |
| `SessionEnd`         | 否         | 是             | 会话终止                                                                              | 清理临时资源                                                          |
| `Notification`       | 是         | 是             | 代理状态消息                                                                          | 将代理状态更新发送至 Slack 或 PagerDuty                               |
| `Setup`              | 否         | 是             | 会话设置/维护                                                                         | 运行初始化任务                                                        |
| `TeammateIdle`       | 否         | 是             | 队友变为空闲状态                                                                      | 重新分配工作或通知                                                    |
| `TaskCompleted`      | 否         | 是             | 后台任务完成                                                                          | 聚合并行任务的结果                                                    |
| `ConfigChange`       | 否         | 是             | 配置文件更改                                                                          | 动态重新加载设置                                                      |
| `WorktreeCreate`     | 否         | 是             | Git 工作树创建                                                                        | 跟踪隔离的工作区                                                      |
| `WorktreeRemove`     | 否         | 是             | Git 工作树移除                                                                        | 清理工作区资源                                                        |

## 配置钩子

要配置钩子，请在代理选项的 `hooks` 字段中传递它（Python 中是 `ClaudeAgentOptions`，TypeScript 中是 `options` 对象）：

  ```python Python
  options = ClaudeAgentOptions(
      hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[my_callback])]}
  )

  async with ClaudeSDKClient(options=options) as client:
      await client.query("Your prompt")
      async for message in client.receive_response():
          print(message)
  ```

  ```typescript TypeScript
  for await (const message of query({
    prompt: "Your prompt",
    options: {
      hooks: {
        PreToolUse: [{ matcher: "Bash", hooks: [myCallback] }]
      }
    }
  })) {
    console.log(message);
  }
  ```

`hooks` 选项是一个字典（Python）或对象（TypeScript），其中：

* **键**是[钩子事件名称](#available-hooks)（例如 `'PreToolUse'`、`'PostToolUse'`、`'Stop'`）
* **值**是[匹配器](#matchers)的数组，每个匹配器包含一个可选的过滤模式和你的[回调函数](#callback-functions)

### 匹配器

使用匹配器来控制回调函数何时触发。`matcher` 字段是一个正则表达式字符串，根据钩子事件类型匹配不同的值。例如，基于工具的钩子会匹配工具名称，而 `Notification` 钩子会匹配通知类型。请参阅 [Claude Code 钩子参考](/en/hooks#matcher-patterns) 以获取每种事件类型的匹配器值完整列表。

| 选项      | 类型             | 默认值      | 描述                                                                                                                                                                                                                                                                                                                                                |
| --------- | ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matcher` | `string`         | `undefined` | 与事件过滤字段匹配的正则表达式模式。对于工具钩子，即为工具名称。内置工具包括 `Bash`、`Read`、`Write`、`Edit`、`Glob`、`Grep`、`WebFetch`、`Agent` 等（完整列表请参阅[工具输入类型](/en/agent-sdk/typescript#tool-input-types)）。MCP 工具使用模式 `mcp__<server>__<action>`。 |
| `hooks`   | `HookCallback[]` | -           | 必需。当模式匹配时要执行的回调函数数组                                                                                                                                                                                                                                                                                                              |
| `timeout` | `number`         | `60`        | 超时时间（秒）                                                                                                                                                                                                                                                                                                                                      |

尽可能使用 `matcher` 模式来针对特定工具。使用 `'Bash'` 的匹配器仅对 Bash 命令运行，而省略该模式则会为每次事件的发生运行你的回调函数。请注意，对于基于工具的钩子，匹配器仅按**工具名称**过滤，而非按文件路径或其他参数过滤。要按文件路径过滤，请在回调内部检查 `tool_input.file_path`。

  **发现工具名称：** 请参阅 [工具输入类型](/en/agent-sdk/typescript#tool-input-types) 以获取内置工具名称的完整列表，或者添加一个没有匹配条件的钩子来记录会话中进行的所有工具调用。

  **MCP 工具命名：** MCP 工具的名称始终以 `mcp__` 开头，后跟服务器名称和操作：`mcp__<server>__<action>`。例如，如果你配置了一个名为 `playwright` 的服务器，其工具将被命名为 `mcp__playwright__browser_screenshot`、`mcp__playwright__browser_click` 等。服务器名称来自你在 `mcpServers` 配置中使用的键。

### 回调函数

#### 输入参数

每个钩子回调接收三个参数：

* **输入数据：** 包含事件详情的类型化对象。每种钩子类型都有其特定的输入结构（例如，`PreToolUseHookInput` 包含 `tool_name` 和 `tool_input`，而 `NotificationHookInput` 包含 `message`）。完整的类型定义请参阅 [TypeScript](/en/agent-sdk/typescript#hookinput) 和 [Python](/en/agent-sdk/python#hookinput) 的 SDK 参考文档。
  * 所有钩子输入都共享 `session_id`、`cwd` 和 `hook_event_name`。
  * 当钩子在子代理内部触发时，`agent_id` 和 `agent_type` 会被填充。在 TypeScript 中，它们位于基础钩子输入上，可供所有钩子类型使用。在 Python 中，它们仅存在于 `PreToolUse`、`PostToolUse` 和 `PostToolUseFailure` 中。
* **工具使用 ID** (`str | None` / `string | undefined`)：用于关联同一工具调用的 `PreToolUse` 和 `PostToolUse` 事件。
* **上下文：** 在 TypeScript 中，包含一个 `signal` 属性（`AbortSignal`）用于取消操作。在 Python 中，此参数保留供将来使用。

#### 输出

你的回调返回一个对象，包含两类字段：

* **顶层字段** 在每个事件上作用相同：`systemMessage` 用于向用户显示消息，而 `continue`（在 Python 中为 `continue_`）决定在此钩子之后代理是否继续运行。
* **`hookSpecificOutput`** 控制当前操作。其中的字段取决于钩子事件类型。对于 `PreToolUse` 钩子，你可以在此设置 `permissionDecision`（`"allow"`、`"deny"`、`"ask"` 或 `"defer"`）、`permissionDecisionReason` 和 `updatedInput`。返回 `"defer"` 会结束查询，以便你可以[稍后恢复它](/en/hooks#defer-a-tool-call-for-later)。对于 `PostToolUse` 钩子，你可以设置 `additionalContext` 将信息追加到工具结果，或设置 `updatedToolOutput` 在 Claude 看到之前完全替换工具的输出。

返回 `{}` 允许操作不做更改。SDK 回调钩子使用与 [Claude Code shell 命令钩子](/en/hooks#json-output)相同的 JSON 输出格式，该文档记录了所有字段和特定于事件的选项。SDK 类型定义请参阅 [TypeScript](/en/agent-sdk/typescript#synchookjsonoutput) 和 [Python](/en/agent-sdk/python#synchookjsonoutput) 的 SDK 参考文档。

  当多个钩子或权限规则同时适用时，**拒绝**优先于**延迟**，**延迟**优先于**询问**，**询问**优先于**允许**。如果任一钩子返回 `deny`，则无论其他钩子如何，操作都将被阻止。

#### 异步输出

默认情况下，代理会等待您的钩子返回后再继续执行。如果您的钩子仅执行副作用操作（如记录日志、发送 webhook）且无需影响代理行为，您可以返回一个异步输出。这将告诉代理立即继续执行，而无需等待钩子完成：

  ```python Python
  async def async_hook(input_data, tool_use_id, context):
      # Start a background task, then return immediately
      asyncio.create_task(send_to_logging_service(input_data))
      return {"async_": True, "asyncTimeout": 30000}
  ```

  ```typescript TypeScript
  const asyncHook: HookCallback = async (input, toolUseID, { signal }) => {
    // Start a background task, then return immediately
    sendToLoggingService(input).catch(console.error);
    return { async: true, asyncTimeout: 30000 };
  };
  ```

| 字段             | 类型     | 描述                                                                                                           |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `async`          | `true`   | 表示异步模式。代理无需等待即可继续执行。在 Python 中，为避免使用保留关键字，请使用 `async_` 作为参数名。        |
| `asyncTimeout`   | `number` | 可选参数，指定后台操作的超时时间（单位为毫秒）                                                                 |

  异步输出不能阻塞、修改或注入上下文到操作中，因为代理已经继续执行了。仅应将它们用于副作用，例如日志记录、指标统计或通知。

## 示例

### 修改工具输入

此示例拦截 Write 工具调用，并重写 `file_path` 参数，在路径前前置 `/sandbox`，从而将所有文件写入重定向到沙箱目录。回调函数返回包含修改后路径的 `updatedInput` 和 `permissionDecision: 'allow'` 以自动批准重写后的操作：

  ```python Python
  async def redirect_to_sandbox(input_data, tool_use_id, context):
      if input_data["hook_event_name"] != "PreToolUse":
          return {}

      if input_data["tool_name"] == "Write":
          original_path = input_data["tool_input"].get("file_path", "")
          return {
              "hookSpecificOutput": {
                  "hookEventName": input_data["hook_event_name"],
                  "permissionDecision": "allow",
                  "updatedInput": {
                      **input_data["tool_input"],
                      "file_path": f"/sandbox{original_path}",
                  },
              }
          }
      return {}
  ```

  ```typescript TypeScript
  const redirectToSandbox: HookCallback = async (input, toolUseID, { signal }) => {
    if (input.hook_event_name !== "PreToolUse") return {};

    const preInput = input as PreToolUseHookInput;
    const toolInput = preInput.tool_input as Record<string, unknown>;
    if (preInput.tool_name === "Write") {
      const originalPath = toolInput.file_path as string;
      return {
        hookSpecificOutput: {
          hookEventName: preInput.hook_event_name,
          permissionDecision: "allow",
          updatedInput: {
            ...toolInput,
            file_path: `/sandbox${originalPath}`
          }
        }
      };
    }
    return {};
  };
  ```



  使用 `updatedInput` 时，还必须包含 `permissionDecision: 'allow'` 以自动批准修改后的输入，或 `permissionDecision: 'ask'` 以向用户展示。若为 `'defer'`，则 `updatedInput` 会被忽略。始终返回新对象，而非修改原始的 `tool_input`。

### 添加上下文并阻止工具

此示例会阻止对 `/etc` 目录的写入操作，并向模型和用户解释原因：

* `permissionDecision: 'deny'` 会停止工具调用。
* `permissionDecisionReason` 会告知模型原因，以避免其重试。
* `systemMessage` 会向用户显示发生了什么。

  ```python Python
  async def block_etc_writes(input_data, tool_use_id, context):
      file_path = input_data["tool_input"].get("file_path", "")

      if file_path.startswith("/etc"):
          return {
              # Top-level field: message shown to the user
              "systemMessage": "Remember: system directories like /etc are protected.",
              # hookSpecificOutput: block the operation
              "hookSpecificOutput": {
                  "hookEventName": input_data["hook_event_name"],
                  "permissionDecision": "deny",
                  "permissionDecisionReason": "Writing to /etc is not allowed",
              },
          }
      return {}
  ```

  ```typescript TypeScript
  const blockEtcWrites: HookCallback = async (input, toolUseID, { signal }) => {
    const preInput = input as PreToolUseHookInput;
    const toolInput = preInput.tool_input as Record<string, unknown>;
    const filePath = toolInput?.file_path as string;

    if (filePath?.startsWith("/etc")) {
      return {
        // Top-level field: message shown to the user
        systemMessage: "Remember: system directories like /etc are protected.",
        // hookSpecificOutput: block the operation
        hookSpecificOutput: {
          hookEventName: preInput.hook_event_name,
          permissionDecision: "deny",
          permissionDecisionReason: "Writing to /etc is not allowed"
        }
      };
    }
    return {};
  };
  ```

### 自动批准特定工具

默认情况下，代理在使用某些工具前可能会提示用户授权。本示例通过返回 `permissionDecision: 'allow'`，自动批准只读文件系统工具（Read、Glob、Grep），使其无需用户确认即可运行，而所有其他工具仍需经过常规权限检查：

  ```python Python
  async def auto_approve_read_only(input_data, tool_use_id, context):
      if input_data["hook_event_name"] != "PreToolUse":
          return {}

      read_only_tools = ["Read", "Glob", "Grep"]
      if input_data["tool_name"] in read_only_tools:
          return {
              "hookSpecificOutput": {
                  "hookEventName": input_data["hook_event_name"],
                  "permissionDecision": "allow",
                  "permissionDecisionReason": "Read-only tool auto-approved",
              }
          }
      return {}
  ```

  ```typescript TypeScript
  const autoApproveReadOnly: HookCallback = async (input, toolUseID, { signal }) => {
    if (input.hook_event_name !== "PreToolUse") return {};

    const preInput = input as PreToolUseHookInput;
    const readOnlyTools = ["Read", "Glob", "Grep"];
    if (readOnlyTools.includes(preInput.tool_name)) {
      return {
        hookSpecificOutput: {
          hookEventName: preInput.hook_event_name,
          permissionDecision: "allow",
          permissionDecisionReason: "Read-only tool auto-approved"
        }
      };
    }
    return {};
  };
  ```

### 注册多个钩子

当事件触发时，所有匹配的钩子会并行运行。在权限决策场景中，最严格的决定生效：单个 `deny` 会阻止工具调用，无论其他钩子返回什么结果。由于执行顺序是非确定性的，请将每个钩子编写为独立运行，而不是依赖另一个钩子先执行。

以下示例为每次工具调用注册了三个独立的检查：

  ```python Python
  options = ClaudeAgentOptions(
      hooks={
          "PreToolUse": [
              HookMatcher(hooks=[authorization_check]),
              HookMatcher(hooks=[input_validator]),
              HookMatcher(hooks=[audit_logger]),
          ]
      }
  )
  ```

  ```typescript TypeScript
  const options = {
    hooks: {
      PreToolUse: [
        { hooks: [authorizationCheck] },
        { hooks: [inputValidator] },
        { hooks: [auditLogger] }
      ]
    }
  };
  ```

### 使用正则表达式匹配器进行过滤

使用正则表达式模式来匹配多个工具。此示例注册了三个具有不同作用域的匹配器：第一个仅为文件修改工具触发 `file_security_hook`，第二个为任何 MCP 工具（工具名称以 `mcp__` 开头的工具）触发 `mcp_audit_hook`，第三个则无论工具名称如何，都会为每次工具调用触发 `global_logger`：

  ```python Python
  options = ClaudeAgentOptions(
      hooks={
          "PreToolUse": [
              # Match file modification tools
              HookMatcher(matcher="Write|Edit|Delete", hooks=[file_security_hook]),
              # Match all MCP tools
              HookMatcher(matcher="^mcp__", hooks=[mcp_audit_hook]),
              # Match everything (no matcher)
              HookMatcher(hooks=[global_logger]),
          ]
      }
  )
  ```

  ```typescript TypeScript
  const options = {
    hooks: {
      PreToolUse: [
        // Match file modification tools
        { matcher: "Write|Edit|Delete", hooks: [fileSecurityHook] },

        // Match all MCP tools
        { matcher: "^mcp__", hooks: [mcpAuditHook] },

        // Match everything (no matcher)
        { hooks: [globalLogger] }
      ]
    }
  };
  ```

### 跟踪子代理活动

使用 `SubagentStop` 钩子来监控子代理完成工作的时间。完整的输入类型请参见 [TypeScript](/en/agent-sdk/typescript#hookinput) 和 [Python](/en/agent-sdk/python#hookinput) SDK 参考文档。此示例在每次子代理完成时记录一条摘要：

  ```python Python
  async def subagent_tracker(input_data, tool_use_id, context):
      # Log subagent details when it finishes
      print(f"[SUBAGENT] Completed: {input_data['agent_id']}")
      print(f"  Transcript: {input_data['agent_transcript_path']}")
      print(f"  Tool use ID: {tool_use_id}")
      print(f"  Stop hook active: {input_data.get('stop_hook_active')}")
      return {}


  options = ClaudeAgentOptions(
      hooks={"SubagentStop": [HookMatcher(hooks=[subagent_tracker])]}
  )
  ```

  ```typescript TypeScript
  import { HookCallback, SubagentStopHookInput } from "@anthropic-ai/claude-agent-sdk";

  const subagentTracker: HookCallback = async (input, toolUseID, { signal }) => {
    // Cast to SubagentStopHookInput to access subagent-specific fields
    const subInput = input as SubagentStopHookInput;

    // Log subagent details when it finishes
    console.log(`[SUBAGENT] Completed: ${subInput.agent_id}`);
    console.log(`  Transcript: ${subInput.agent_transcript_path}`);
    console.log(`  Tool use ID: ${toolUseID}`);
    console.log(`  Stop hook active: ${subInput.stop_hook_active}`);
    return {};
  };

  const options = {
    hooks: {
      SubagentStop: [{ hooks: [subagentTracker] }]
    }
  };
  ```

### 从钩子中发出 HTTP 请求

钩子可以执行像 HTTP 请求这样的异步操作。请在钩子内部捕获错误，而不是让它们传播，因为未处理的异常可能会中断代理。

以下示例会在每个工具执行完毕后发送一个 webhook，记录执行了哪个工具以及何时执行。该钩子会捕获错误，以避免 webhook 失败中断代理：

  ```python Python
  import asyncio
  import json
  import urllib.request
  from datetime import datetime


  def _send_webhook(tool_name):
      """Synchronous helper that POSTs tool usage data to an external webhook."""
      data = json.dumps(
          {
              "tool": tool_name,
              "timestamp": datetime.now().isoformat(),
          }
      ).encode()
      req = urllib.request.Request(
          "https://api.example.com/webhook",
          data=data,
          headers={"Content-Type": "application/json"},
          method="POST",
      )
      urllib.request.urlopen(req)


  async def webhook_notifier(input_data, tool_use_id, context):
      # Only fire after a tool completes (PostToolUse), not before
      if input_data["hook_event_name"] != "PostToolUse":
          return {}

      try:
          # Run the blocking HTTP call in a thread to avoid blocking the event loop
          await asyncio.to_thread(_send_webhook, input_data["tool_name"])
      except Exception as e:
          # Log the error but don't raise. A failed webhook shouldn't stop the agent
          print(f"Webhook request failed: {e}")

      return {}
  ```

  ```typescript TypeScript
  import { query, HookCallback, PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

  const webhookNotifier: HookCallback = async (input, toolUseID, { signal }) => {
    // Only fire after a tool completes (PostToolUse), not before
    if (input.hook_event_name !== "PostToolUse") return {};

    try {
      await fetch("https://api.example.com/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: (input as PostToolUseHookInput).tool_name,
          timestamp: new Date().toISOString()
        }),
        // Pass signal so the request cancels if the hook times out
        signal
      });
    } catch (error) {
      // Handle cancellation separately from other errors
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Webhook request cancelled");
      }
      // Don't re-throw. A failed webhook shouldn't stop the agent
    }

    return {};
  };

  // Register as a PostToolUse hook
  for await (const message of query({
    prompt: "Refactor the auth module",
    options: {
      hooks: {
        PostToolUse: [{ hooks: [webhookNotifier] }]
      }
    }
  })) {
    console.log(message);
  }
  ```

### 将通知转发至 Slack

使用 `Notification` 钩子来接收来自代理的系统通知，并将其转发至外部服务。通知会针对特定事件类型触发：`permission_prompt`（Claude 需要权限）、`idle_prompt`（Claude 正在等待输入）、`auth_success`（认证完成）、`elicitation_dialog`（Claude 正在提示用户）、`elicitation_response`（用户回应了引导提示）以及 `elicitation_complete`（引导提示已关闭）。每条通知都包含一个 `message` 字段，其中包含人类可读的描述，并可选地包含一个 `title`。

此示例将每条通知都转发到一个 Slack 频道。它需要一个 [Slack 传入 Webhook URL](https://api.slack.com/messaging/webhooks)，您可以通过在您的 Slack 工作区中添加一个应用并启用传入 Webhook 来创建：

  ```python Python
  import asyncio
  import json
  import urllib.request

  from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher


  def _send_slack_notification(message):
      """Synchronous helper that sends a message to Slack via incoming webhook."""
      data = json.dumps({"text": f"Agent status: {message}"}).encode()
      req = urllib.request.Request(
          "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
          data=data,
          headers={"Content-Type": "application/json"},
          method="POST",
      )
      urllib.request.urlopen(req)


  async def notification_handler(input_data, tool_use_id, context):
      try:
          # Run the blocking HTTP call in a thread to avoid blocking the event loop
          await asyncio.to_thread(_send_slack_notification, input_data.get("message", ""))
      except Exception as e:
          print(f"Failed to send notification: {e}")

      # Return empty object. Notification hooks don't modify agent behavior
      return {}


  async def main():
      options = ClaudeAgentOptions(
          hooks={
              # Register the hook for Notification events (no matcher needed)
              "Notification": [HookMatcher(hooks=[notification_handler])],
          },
      )

      async with ClaudeSDKClient(options=options) as client:
          await client.query("Analyze this codebase")
          async for message in client.receive_response():
              print(message)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query, HookCallback, NotificationHookInput } from "@anthropic-ai/claude-agent-sdk";

  // Define a hook callback that sends notifications to Slack
  const notificationHandler: HookCallback = async (input, toolUseID, { signal }) => {
    // Cast to NotificationHookInput to access the message field
    const notification = input as NotificationHookInput;

    try {
      // POST the notification message to a Slack incoming webhook
      await fetch("https://hooks.slack.com/services/YOUR/WEBHOOK/URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Agent status: ${notification.message}`
        }),
        // Pass signal so the request cancels if the hook times out
        signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Notification cancelled");
      } else {
        console.error("Failed to send notification:", error);
      }
    }

    // Return empty object. Notification hooks don't modify agent behavior
    return {};
  };

  // Register the hook for Notification events (no matcher needed)
  for await (const message of query({
    prompt: "Analyze this codebase",
    options: {
      hooks: {
        Notification: [{ hooks: [notificationHandler] }]
      }
    }
  })) {
    console.log(message);
  }
  ```

## 常见问题修复

### 钩子未触发

* 确认钩子事件名称正确且区分大小写（应为 `PreToolUse` 而非 `preToolUse`）
* 检查匹配器模式是否与工具名称精确匹配
* 确保钩子位于 `options.hooks` 下正确的事件类型中
* 对于 `Stop` 和 `SubagentStop` 等非工具钩子，匹配器针对不同字段进行匹配（详见[匹配器模式](/en/hooks#matcher-patterns)）
* 当智能体达到 [`max_turns`](/en/agent-sdk/python#claudeagentoptions) 限制时，由于会话在钩子执行前结束，钩子可能不会触发

### 匹配器未按预期过滤

匹配器**仅匹配工具名称**，而非文件路径或其他参数。若要按文件路径过滤，请在钩子内检查 `tool_input.file_path`：
```
```typescript
const myHook: HookCallback = async (input, toolUseID, { signal }) => {
  const preInput = input as PreToolUseHookInput;
  const toolInput = preInput.tool_input as Record<string, unknown>;
  const filePath = toolInput?.file_path as string;
  if (!filePath?.endsWith(".md")) return {}; // Skip non-markdown files
  // Process markdown files...
  return {};
};
```
### 钩子超时

* 在 `HookMatcher` 配置中增加 `timeout` 值
* 使用第三个回调参数中的 `AbortSignal` 在 TypeScript 中优雅处理取消操作

### 工具意外被阻止

* 检查所有 `PreToolUse` 钩子中 `permissionDecision: 'deny'` 的返回值
* 为钩子添加日志记录以查看其返回的 `permissionDecisionReason`
* 验证匹配器模式是否过于宽泛（空的匹配器会匹配所有工具）

### 修改的输入未生效

* 确保 `updatedInput` 位于 `hookSpecificOutput` 内部，而非顶层：
  ```typescript
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: { command: "new command" }
    }
  };
  ```
* 您还必须返回 `permissionDecision: 'allow'` 或 `'ask'`，输入修改才能生效。

* 在 `hookSpecificOutput` 中包含 `hookEventName` 以标识输出所属的钩子类型。

### Python 中不可用的会话钩子

`SessionStart` 和 `SessionEnd` 可以在 TypeScript 中注册为 SDK 回调钩子，但在 Python SDK 中不可用（`HookEvent` 未包含它们）。在 Python 中，它们仅作为在配置文件（例如 `.claude/settings.json`）中定义的 [shell 命令钩子](/en/hooks#hook-events) 可用。要从您的 SDK 应用程序加载 shell 命令钩子，请通过 [`setting_sources`](/en/agent-sdk/python#settingsource) 或 [`settingSources`](/en/agent-sdk/typescript#settingsource) 包含相应的设置源：

  ```python Python
  options = ClaudeAgentOptions(
      setting_sources=["project"],  # Loads .claude/settings.json including hooks
  )
  ```

  ```typescript TypeScript
  const options = {
    settingSources: ["project"] // Loads .claude/settings.json including hooks
  };
  ```

要将初始化逻辑作为 Python SDK 回调运行，请使用 `client.receive_response()` 的第一条消息作为触发条件。

### 子代理权限提示叠加

当生成多个子代理时，每个子代理可能会单独请求权限。子代理不会自动继承父代理的权限。为避免重复提示，请使用 `PreToolUse` 钩子来自动批准特定工具，或配置应用于子代理会话的权限规则。

### 子代理的递归钩子循环

生成子代理的 `UserPromptSubmit` 钩子如果触发相同的钩子，可能会创建无限循环。为防止这种情况：

* 在生成前检查钩子输入中的子代理指示符
* 使用共享变量或会话状态来跟踪是否已处于子代理内部
* 将钩子的作用域限定为仅对顶级代理会话运行

### systemMessage 未出现在输出中

`systemMessage` 字段显示给用户而非模型的消息。默认情况下，SDK 不会在消息流中显示钩子输出，因此除非设置 `includeHookEvents`（Python 中为 `include_hook_events`），否则消息可能不会出现。若要向模型传递上下文，请返回 [`additionalContext`](/en/hooks#add-context-for-claude)。

如果您需要可靠地将钩子决策呈现给应用程序，请单独记录它们或使用专用输出通道。

## 相关资源

* [Claude Code 钩子参考](/en/hooks)：完整的 JSON 输入/输出模式、事件文档和匹配器模式
* [Claude Code 钩子指南](/en/hooks-guide)：Shell 命令钩子示例和演练
* [TypeScript SDK 参考](/en/agent-sdk/typescript)：钩子类型、输入/输出定义和配置选项
* [Python SDK 参考](/en/agent-sdk/python)：钩子类型、输入/输出定义和配置选项
* [权限](/en/agent-sdk/permissions)：控制您的代理可以执行的操作
* [自定义工具](/en/agent-sdk/custom-tools)：构建工具以扩展代理能力