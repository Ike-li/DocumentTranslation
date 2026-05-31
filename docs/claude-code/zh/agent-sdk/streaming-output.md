# 实时流式响应

> 当文本和工具调用流式传入时，从 Agent SDK 获取实时响应

默认情况下，Agent SDK 会在 Claude 完成生成每个响应后，生成完整的 `AssistantMessage` 对象。要在文本和工具调用生成时接收增量更新，请在选项中设置 `include_partial_messages`（Python）或 `includePartialMessages`（TypeScript）为 `true`，以启用部分消息流式传输。

  本页面介绍输出流式传输（实时接收token）。关于输入模式（如何发送消息），请参阅[向代理发送消息](/en/agent-sdk/streaming-vs-single-mode)。您也可以[通过命令行界面使用 Agent SDK 流式处理响应](/en/headless)。

## 启用流式输出

要启用流式输出，请在选项中将 `include_partial_messages`（Python）或 `includePartialMessages`（TypeScript）设为 `true`。这将使 SDK 除了常规的 `AssistantMessage` 和 `ResultMessage` 外，还会在原始 API 事件到达时即时生成包含这些事件的 `StreamEvent` 消息。

随后，您的代码需要：

1.  检查每条消息的类型，以区分 `StreamEvent` 和其他消息类型
2.  对于 `StreamEvent`，提取 `event` 字段并检查其 `type`
3.  查找 `delta.type` 为 `text_delta` 的 `content_block_delta` 事件，这些事件包含实际的文本块

以下示例启用了流式输出，并在文本块到达时打印它们。请注意其中的嵌套类型检查：首先检查 `StreamEvent`，然后是 `content_block_delta`，最后是 `text_delta`：

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions
  from claude_agent_sdk.types import StreamEvent
  import asyncio


  async def stream_response():
      options = ClaudeAgentOptions(
          include_partial_messages=True,
          allowed_tools=["Bash", "Read"],
      )

      async for message in query(prompt="List the files in my project", options=options):
          if isinstance(message, StreamEvent):
              event = message.event
              if event.get("type") == "content_block_delta":
                  delta = event.get("delta", {})
                  if delta.get("type") == "text_delta":
                      print(delta.get("text", ""), end="", flush=True)


  asyncio.run(stream_response())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "List the files in my project",
    options: {
      includePartialMessages: true,
      allowedTools: ["Bash", "Read"]
    }
  })) {
    if (message.type === "stream_event") {
      const event = message.event;
      if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          process.stdout.write(event.delta.text);
        }
      }
    }
  }
  ```

## StreamEvent 参考

当启用部分消息时，您会收到包裹在对象中的原始 Claude API 流式事件。该类型在不同 SDK 中有不同的名称：

* **Python**: `StreamEvent`（从 `claude_agent_sdk.types` 导入）
* **TypeScript**: `SDKPartialAssistantMessage`，其中 `type: 'stream_event'`

两者都包含原始的 Claude API 事件，而非累积后的文本。您需要自行提取并累积文本增量。以下是每种类型的结构：

  ```python Python
  @dataclass
  class StreamEvent:
      uuid: str  # Unique identifier for this event
      session_id: str  # Session identifier
      event: dict[str, Any]  # The raw Claude API stream event
      parent_tool_use_id: str | None  # Parent tool ID if from a subagent
  ```

  ```typescript TypeScript
  type SDKPartialAssistantMessage = {
    type: "stream_event";
    event: BetaRawMessageStreamEvent; // From Anthropic SDK
    parent_tool_use_id: string | null;
    uuid: UUID;
    session_id: string;
  };
  ```

`event` 字段包含来自 [Claude API](https://platform.claude.com/docs/en/build-with-claude/streaming#event-types) 的原始流式事件。常见的事件类型包括：

| 事件类型              | 描述                                             |
| :-------------------- | :----------------------------------------------- |
| `message_start`       | 新消息的开始                                     |
| `content_block_start` | 新内容块（文本或工具使用）的开始                 |
| `content_block_delta` | 对内容的增量更新                                 |
| `content_block_stop`  | 一个内容块的结束                                 |
| `message_delta`       | 消息级别的更新（停止原因、使用情况）             |
| `message_stop`        | 消息的结束                                       |

## 消息流

启用部分消息后，您将按以下顺序接收消息：
```text
StreamEvent (message_start)
StreamEvent (content_block_start) - text block
StreamEvent (content_block_delta) - text chunks...
StreamEvent (content_block_stop)
StreamEvent (content_block_start) - tool_use block
StreamEvent (content_block_delta) - tool input chunks...
StreamEvent (content_block_stop)
StreamEvent (message_delta)
StreamEvent (message_stop)
AssistantMessage - complete message with all content
... tool executes ...
... more streaming events for next turn ...
ResultMessage - final result
```
如果不启用部分消息（Python 中为 `include_partial_messages`，TypeScript 中为 `includePartialMessages`），您将收到除 `StreamEvent` 外的所有消息类型。常见类型包括 `SystemMessage`（会话初始化）、`AssistantMessage`（完整响应）、`ResultMessage`（最终结果），以及一个用于指示对话历史何时被压缩的紧凑边界消息（TypeScript 中为 `SDKCompactBoundaryMessage`；Python 中为 `SystemMessage`，子类型为 `"compact_boundary"`）。

## 流式文本响应

要在生成时显示文本，请查找 `content_block_delta` 事件中 `delta.type` 为 `text_delta` 的项。这些包含增量的文本块。以下示例在每个块到达时将其打印出来：

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions
  from claude_agent_sdk.types import StreamEvent
  import asyncio


  async def stream_text():
      options = ClaudeAgentOptions(include_partial_messages=True)

      async for message in query(prompt="Explain how databases work", options=options):
          if isinstance(message, StreamEvent):
              event = message.event
              if event.get("type") == "content_block_delta":
                  delta = event.get("delta", {})
                  if delta.get("type") == "text_delta":
                      # Print each text chunk as it arrives
                      print(delta.get("text", ""), end="", flush=True)

      print()  # Final newline


  asyncio.run(stream_text())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Explain how databases work",
    options: { includePartialMessages: true }
  })) {
    if (message.type === "stream_event") {
      const event = message.event;
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        process.stdout.write(event.delta.text);
      }
    }
  }

  console.log(); // Final newline
  ```

## 流式工具调用

工具调用也会增量地进行流式传输。您可以跟踪工具何时开始、在其生成时接收输入、并查看其何时完成。以下示例跟踪当前正在调用的工具，并在流式输入时累积 JSON 输入。它使用了三种事件类型：

* `content_block_start`：工具开始
* `content_block_delta` 伴随 `input_json_delta`：输入数据块到达
* `content_block_stop`：工具调用完成

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions
  from claude_agent_sdk.types import StreamEvent
  import asyncio


  async def stream_tool_calls():
      options = ClaudeAgentOptions(
          include_partial_messages=True,
          allowed_tools=["Read", "Bash"],
      )

      # Track the current tool and accumulate its input JSON
      current_tool = None
      tool_input = ""

      async for message in query(prompt="Read the README.md file", options=options):
          if isinstance(message, StreamEvent):
              event = message.event
              event_type = event.get("type")

              if event_type == "content_block_start":
                  # New tool call is starting
                  content_block = event.get("content_block", {})
                  if content_block.get("type") == "tool_use":
                      current_tool = content_block.get("name")
                      tool_input = ""
                      print(f"Starting tool: {current_tool}")

              elif event_type == "content_block_delta":
                  delta = event.get("delta", {})
                  if delta.get("type") == "input_json_delta":
                      # Accumulate JSON input as it streams in
                      chunk = delta.get("partial_json", "")
                      tool_input += chunk
                      print(f"  Input chunk: {chunk}")

              elif event_type == "content_block_stop":
                  # Tool call complete - show final input
                  if current_tool:
                      print(f"Tool {current_tool} called with: {tool_input}")
                      current_tool = None


  asyncio.run(stream_tool_calls())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Track the current tool and accumulate its input JSON
  let currentTool: string | null = null;
  let toolInput = "";

  for await (const message of query({
    prompt: "Read the README.md file",
    options: {
      includePartialMessages: true,
      allowedTools: ["Read", "Bash"]
    }
  })) {
    if (message.type === "stream_event") {
      const event = message.event;

      if (event.type === "content_block_start") {
        // New tool call is starting
        if (event.content_block.type === "tool_use") {
          currentTool = event.content_block.name;
          toolInput = "";
          console.log(`Starting tool: ${currentTool}`);
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "input_json_delta") {
          // Accumulate JSON input as it streams in
          const chunk = event.delta.partial_json;
          toolInput += chunk;
          console.log(`  Input chunk: ${chunk}`);
        }
      } else if (event.type === "content_block_stop") {
        // Tool call complete - show final input
        if (currentTool) {
          console.log(`Tool ${currentTool} called with: ${toolInput}`);
          currentTool = null;
        }
      }
    }
  }
  ```

## 构建流式 UI

此示例将文本和工具流组合成一个连贯的 UI。它会跟踪代理是否正在执行工具（使用 `in_tool` 标志），以便在工具运行时显示状态指示符，如 `[正在使用 Read...]`。当不处于工具执行状态时，文本正常流式传输；工具完成则会触发“完成”消息。这种模式适用于需要在多步骤代理任务期间显示进度的聊天界面。

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
  from claude_agent_sdk.types import StreamEvent
  import asyncio
  import sys


  async def streaming_ui():
      options = ClaudeAgentOptions(
          include_partial_messages=True,
          allowed_tools=["Read", "Bash", "Grep"],
      )

      # Track whether we're currently in a tool call
      in_tool = False

      async for message in query(
          prompt="Find all TODO comments in the codebase", options=options
      ):
          if isinstance(message, StreamEvent):
              event = message.event
              event_type = event.get("type")

              if event_type == "content_block_start":
                  content_block = event.get("content_block", {})
                  if content_block.get("type") == "tool_use":
                      # Tool call is starting - show status indicator
                      tool_name = content_block.get("name")
                      print(f"\n[Using {tool_name}...]", end="", flush=True)
                      in_tool = True

              elif event_type == "content_block_delta":
                  delta = event.get("delta", {})
                  # Only stream text when not executing a tool
                  if delta.get("type") == "text_delta" and not in_tool:
                      sys.stdout.write(delta.get("text", ""))
                      sys.stdout.flush()

              elif event_type == "content_block_stop":
                  if in_tool:
                      # Tool call finished
                      print(" done", flush=True)
                      in_tool = False

          elif isinstance(message, ResultMessage):
              # Agent finished all work
              print(f"\n\n--- Complete ---")


  asyncio.run(streaming_ui())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Track whether we're currently in a tool call
  let inTool = false;

  for await (const message of query({
    prompt: "Find all TODO comments in the codebase",
    options: {
      includePartialMessages: true,
      allowedTools: ["Read", "Bash", "Grep"]
    }
  })) {
    if (message.type === "stream_event") {
      const event = message.event;

      if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          // Tool call is starting - show status indicator
          process.stdout.write(`\n[Using ${event.content_block.name}...]`);
          inTool = true;
        }
      } else if (event.type === "content_block_delta") {
        // Only stream text when not executing a tool
        if (event.delta.type === "text_delta" && !inTool) {
          process.stdout.write(event.delta.text);
        }
      } else if (event.type === "content_block_stop") {
        if (inTool) {
          // Tool call finished
          console.log(" done");
          inTool = false;
        }
      }
    } else if (message.type === "result") {
      // Agent finished all work
      console.log("\n\n--- Complete ---");
    }
  }
  ```

## 已知限制

部分 SDK 功能与流式输出不兼容：

* **扩展思考**：当您显式设置 `max_thinking_tokens`（Python）或 `maxThinkingTokens`（TypeScript）时，不会发出 `StreamEvent` 消息。您只会在每轮结束后收到完整消息。请注意，SDK 默认禁用思考功能，因此除非您启用它，否则流式输出可以正常工作。
* **结构化输出**：JSON 结果仅出现在最终的 `ResultMessage.structured_output` 中，而非作为流式增量。详情请参见 [结构化输出](/en/agent-sdk/structured-outputs)。

## 后续步骤

既然您已经了解如何实时流式传输文本和工具调用，可以探索以下相关主题：

* [交互式与一次性查询](/en/agent-sdk/streaming-vs-single-mode)：根据您的用例选择输入模式
* [结构化输出](/en/agent-sdk/structured-outputs)：从代理获取类型化的 JSON 响应
* [权限](/en/agent-sdk/permissions)：控制代理可以使用哪些工具