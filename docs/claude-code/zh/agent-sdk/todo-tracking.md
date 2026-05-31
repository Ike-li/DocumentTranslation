> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 待办事项列表

> 使用 Claude Agent SDK 跟踪和显示待办事项，实现有序的任务管理

待办事项跟踪提供了一种结构化的方式来管理任务并向用户显示进度。Claude Agent SDK 包含内置的待办事项功能，有助于组织复杂的工作流程，并让用户随时了解任务进展。

  从 TypeScript Agent SDK 0.3.142 和 Claude Code v2.1.142 开始，会话使用结构化任务工具 `TaskCreate`、`TaskUpdate`、`TaskGet` 和 `TaskList` 替代 `TodoWrite`。关于监控代码变更的方式，请参阅 [迁移到任务工具](#migrate-to-task-tools)。本页中的示例设置了 `CLAUDE_CODE_ENABLE_TASKS=0`，以便在尚未迁移的会话中继续显示 `TodoWrite`。

### 待办事项生命周期

待办事项遵循可预测的生命周期：

1. 当任务被识别时，以`pending`状态**创建**
2. 当工作开始时，**激活**为`in_progress`状态
3. 当任务成功完成时，**完成**
4. 当组内所有任务都完成时，**移除**

### 何时使用待办事项

SDK 会自动为以下情况创建待办事项：

* **复杂的多步骤任务**：需要3个或以上不同操作
* **用户提供的任务列表**：当提到多个项目时
* **非平凡的操作**：需要进度跟踪
* **明确请求**：当用户要求进行待办事项组织时

## 示例

### 监控待办事项变化

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Optimize my React app performance and track progress with todos",
    // Re-enable TodoWrite, which this example monitors. Without it, the SDK uses
    // Task tools instead and these tool_use blocks never appear.
    options: { maxTurns: 15, env: { ...process.env, CLAUDE_CODE_ENABLE_TASKS: "0" } }
  })) {
    // Todo updates are reflected in the message stream
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "tool_use" && block.name === "TodoWrite") {
          const todos = block.input.todos;

          console.log("Todo Status Update:");
          todos.forEach((todo, index) => {
            const status =
              todo.status === "completed" ? "✅" : todo.status === "in_progress" ? "🔧" : "❌";
            console.log(`${index + 1}. ${status} ${todo.content}`);
          });
        }
      }
    }
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ToolUseBlock

  async for message in query(
      prompt="Optimize my React app performance and track progress with todos",
      # Re-enable TodoWrite, which this example monitors. Without it, the SDK uses
      # Task tools instead and these tool_use blocks never appear.
      options=ClaudeAgentOptions(max_turns=15, env={"CLAUDE_CODE_ENABLE_TASKS": "0"}),
  ):
      # Todo updates are reflected in the message stream
      if isinstance(message, AssistantMessage):
          for block in message.content:
              if isinstance(block, ToolUseBlock) and block.name == "TodoWrite":
                  todos = block.input["todos"]

                  print("Todo Status Update:")
                  for i, todo in enumerate(todos):
                      status = (
                          "✅"
                          if todo["status"] == "completed"
                          else "🔧"
                          if todo["status"] == "in_progress"
                          else "❌"
                      )
                      print(f"{i + 1}. {status} {todo['content']}")
  ```

### 实时进度显示

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  class TodoTracker {
    private todos: any[] = [];

    displayProgress() {
      if (this.todos.length === 0) return;

      const completed = this.todos.filter((t) => t.status === "completed").length;
      const inProgress = this.todos.filter((t) => t.status === "in_progress").length;
      const total = this.todos.length;

      console.log(`\nProgress: ${completed}/${total} completed`);
      console.log(`Currently working on: ${inProgress} task(s)\n`);

      this.todos.forEach((todo, index) => {
        const icon =
          todo.status === "completed" ? "✅" : todo.status === "in_progress" ? "🔧" : "❌";
        const text = todo.status === "in_progress" ? todo.activeForm : todo.content;
        console.log(`${index + 1}. ${icon} ${text}`);
      });
    }

    async trackQuery(prompt: string) {
      for await (const message of query({
        prompt,
        // Re-enable TodoWrite, which this tracker watches for.
        options: { maxTurns: 20, env: { ...process.env, CLAUDE_CODE_ENABLE_TASKS: "0" } }
      })) {
        if (message.type === "assistant") {
          for (const block of message.message.content) {
            if (block.type === "tool_use" && block.name === "TodoWrite") {
              this.todos = block.input.todos;
              this.displayProgress();
            }
          }
        }
      }
    }
  }

  // Usage
  const tracker = new TodoTracker();
  await tracker.trackQuery("Build a complete authentication system with todos");
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ToolUseBlock
  from typing import List, Dict


  class TodoTracker:
      def __init__(self):
          self.todos: List[Dict] = []

      def display_progress(self):
          if not self.todos:
              return

          completed = len([t for t in self.todos if t["status"] == "completed"])
          in_progress = len([t for t in self.todos if t["status"] == "in_progress"])
          total = len(self.todos)

          print(f"\nProgress: {completed}/{total} completed")
          print(f"Currently working on: {in_progress} task(s)\n")

          for i, todo in enumerate(self.todos):
              icon = (
                  "✅"
                  if todo["status"] == "completed"
                  else "🔧"
                  if todo["status"] == "in_progress"
                  else "❌"
              )
              text = (
                  todo["activeForm"]
                  if todo["status"] == "in_progress"
                  else todo["content"]
              )
              print(f"{i + 1}. {icon} {text}")

      async def track_query(self, prompt: str):
          async for message in query(
              prompt=prompt,
              # Re-enable TodoWrite, which this tracker watches for.
              options=ClaudeAgentOptions(max_turns=20, env={"CLAUDE_CODE_ENABLE_TASKS": "0"}),
          ):
              if isinstance(message, AssistantMessage):
                  for block in message.content:
                      if isinstance(block, ToolUseBlock) and block.name == "TodoWrite":
                          self.todos = block.input["todos"]
                          self.display_progress()


  # Usage
  tracker = TodoTracker()
  await tracker.track_query("Build a complete authentication system with todos")
  ```

## 迁移至任务工具

任务工具将单个 `TodoWrite` 调用拆分为针对每个新项目的 `TaskCreate` 和针对每次状态变更的 `TaskUpdate`，同时提供 `TaskList` 和 `TaskGet` 供模型读取当前列表。您的监控代码仍然会检查助手流中的 `tool_use` 块，但维护一个以任务ID为键的映射，而非在每次调用时替换整个列表。自 TypeScript Agent SDK 0.3.142 和 Claude Code v2.1.142 起，任务工具已成为默认设置，因此无需更改 `options.env`。

| 使用 `TodoWrite`                              | 使用任务工具                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 单次工具调用重写完整的 `todos` 数组 | `TaskCreate` 添加一个项目，`TaskUpdate` 通过 `taskId` 更新一个项目                                                                                                                                                                                                                               |
| 匹配 `block.name === "TodoWrite"`            | 匹配 `block.name === "TaskCreate"` 或 `"TaskUpdate"`                                                                                                                                                                                                                                               |
| 项目结构：`{ content, status, activeForm }` | `TaskCreate` 输入：`{ subject, description, activeForm?, metadata? }`。`TaskUpdate` 输入：`{ taskId, status?, subject?, description?, activeForm?, addBlocks?, addBlockedBy?, owner?, metadata? }`。`status` 为 `"pending"`、`"in_progress"` 或 `"completed"`；设置 `status: "deleted"` 以删除 |
| 直接渲染 `block.input.todos`           | 在多次调用间累积项目，或从 `TaskList` 工具结果中读取快照                                                                                                                                                                                                                     |

分配的任务 ID 不在 `TaskCreate` 输入中。它在匹配的 `tool_result` 中作为 `{ task: { id, subject } }` 返回，因此请从结果块中捕获它以作为您映射的键。以下示例展示了对[监控待办事项更改](#monitoring-todo-changes)循环的最小化更改。要渲染完整列表，请在流中关注 `TaskList` 工具结果，或将 `TaskCreate` 结果和 `TaskUpdate` 输入累积到一个映射中：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Optimize my React app performance",
  })) {
    if (message.type !== "assistant") continue;
    for (const block of message.message.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "TaskCreate") {
        const input = block.input as { subject: string };
        console.log(`+ ${input.subject}`);
      } else if (block.name === "TaskUpdate") {
        const input = block.input as { taskId: string; status?: string };
        if (input.status) console.log(`  ${input.taskId} -> ${input.status}`);
      }
    }
  }
  ```

  ```python Python
  from claude_agent_sdk import query, AssistantMessage, ToolUseBlock

  async for message in query(
      prompt="Optimize my React app performance",
  ):
      if not isinstance(message, AssistantMessage):
          continue
      for block in message.content:
          if not isinstance(block, ToolUseBlock):
              continue
          if block.name == "TaskCreate":
              print(f"+ {block.input['subject']}")
          elif block.name == "TaskUpdate" and block.input.get("status"):
              print(f"  {block.input['taskId']} -> {block.input['status']}")
  ```

## 相关文档

* [TypeScript SDK 参考](/en/agent-sdk/typescript)
* [Python SDK 参考](/en/agent-sdk/python)
* [流式模式与单次模式](/en/agent-sdk/streaming-vs-single-mode)
* [自定义工具](/en/agent-sdk/custom-tools)