> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引
> 使用此文件发现所有可用页面，然后再进行深入探索。

# 使用会话

> 了解会话如何持久化代理对话历史，以及何时使用 continue、resume 和 fork 来返回到之前的运行。

会话是 SDK 在您的代理工作过程中积累的对话历史。它包含您的提示词、代理进行的每一次工具调用、每一个工具结果以及每一条响应。SDK 会自动将其写入磁盘，以便您稍后可以返回。

返回一个会话意味着代理拥有之前的完整上下文：它已读取的文件、已执行的分析、已做出的决定。您可以提出后续问题，从中断中恢复，或分支以尝试不同的方法。

  会话会保留 **对话**，但不会保留文件系统。若要对代理所做的文件更改进行快照和回退，请使用[文件检查点](/en/agent-sdk/file-checkpointing)。

本指南涵盖如何为应用选择合适的方法、自动跟踪会话的 SDK 接口、如何捕获会话 ID 并手动使用 `resume` 和 `fork`，以及跨主机恢复会话时需要注意的事项。

## 选择合适的方法

你需要多少会话处理取决于应用的形态。当你发送多个需要共享上下文的提示词时，会话管理就发挥作用了。在单次 `query()` 调用中，代理会自动进行多轮交互，权限提示和 `AskUserQuestion` 会[在循环内处理](/en/agent-sdk/user-input)（它们不会结束调用）。

| 你的构建内容                                                                 | 应使用的方案                                                                                                                                                      |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 单次任务：单个提示词，无后续交互                                             | 无需额外操作。单次 `query()` 调用即可处理。                                                                                                                       |
| 单进程中的多轮聊天                                                           | [`ClaudeSDKClient` (Python) 或 `continue: true` (TypeScript)](#automatic-session-management)。SDK 会自动跟踪会话，无需手动处理 ID。                                |
| 进程重启后从上次中断处继续                                                   | `continue_conversation=True` (Python) / `continue: true` (TypeScript)。恢复目录中最近的会话，无需 ID。                                                            |
| 恢复特定的历史会话（非最近会话）                                             | 捕获会话 ID 并传递给 `resume`。                                                                                                                                   |
| 尝试替代方案而不丢失原始内容                                                 | 分叉会话。                                                                                                                                                        |
| 无状态任务，不希望写入磁盘（仅限 TypeScript）                                | 设置 [`persistSession: false`](/en/agent-sdk/typescript#options)。会话仅在调用期间存在于内存中。Python 始终持久化到磁盘。                                          |

### 继续、恢复与分叉

继续、恢复和分叉是设置在 `query()` 上的选项字段（Python 中为 [`ClaudeAgentOptions`](/en/agent-sdk/python#claudeagentoptions)，TypeScript 中为 [`Options`](/en/agent-sdk/typescript#options)）。

**继续** 和 **恢复** 都是拾取现有会话并添加内容。区别在于它们如何找到该会话：

* **继续** 会在当前目录中查找最近的会话。你无需跟踪任何内容。适用于应用一次只运行一个对话的场景。
* **恢复** 需要一个特定的会话 ID。你需要跟踪该 ID。当你有多个会话（例如，多用户应用中每个用户一个）或想要返回到一个非最近会话时，这是必需的。

**分叉** 则不同：它会创建一个新会话，该会话以原始会话历史记录的副本开始。原始会话保持不变。使用分叉可以尝试不同的方向，同时保留返回的选项。

## 自动会话管理

两个 SDK 都提供了在调用之间自动跟踪会话状态的接口，因此你无需手动传递 ID。在单进程的多轮对话中使用这些接口。

### Python: `ClaudeSDKClient`

[`ClaudeSDKClient`](/en/agent-sdk/python#claudesdkclient) 在内部处理会话 ID。每次调用 `client.query()` 都会自动继续同一个会话。调用 [`client.receive_response()`](/en/agent-sdk/python#claudesdkclient) 以迭代当前查询的消息。客户端通常用作异步上下文管理器。

此示例通过同一个 `client` 运行两个查询。第一个要求代理分析一个模块；第二个要求代理重构该模块。由于两个调用都通过同一个客户端实例进行，因此第二个查询拥有第一个查询的完整上下文，无需显式 `resume` 或会话 ID：
```
```python Python
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ResultMessage,
    TextBlock,
)


def print_response(message):
    """Print only the human-readable parts of a message."""
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
    elif isinstance(message, ResultMessage):
        cost = (
            f"${message.total_cost_usd:.4f}"
            if message.total_cost_usd is not None
            else "N/A"
        )
        print(f"[done: {message.subtype}, cost: {cost}]")


async def main():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Edit", "Glob", "Grep"],
    )

    async with ClaudeSDKClient(options=options) as client:
        # First query: client captures the session ID internally
        await client.query("Analyze the auth module")
        async for message in client.receive_response():
            print_response(message)

        # Second query: automatically continues the same session
        await client.query("Now refactor it to use JWT")
        async for message in client.receive_response():
            print_response(message)


asyncio.run(main())
```
参阅 [Python SDK 参考文档](/en/agent-sdk/python#choosing-between-query-and-claudesdkclient)，了解何时使用 `ClaudeSDKClient` 与独立 `query()` 函数的详细对比。

### TypeScript：`continue: true`

TypeScript SDK 没有像 Python 的 `ClaudeSDKClient` 那样持有会话的客户端对象。取而代之的是，在每个后续的 `query()` 调用中传入 `continue: true`，SDK 会自动获取当前目录中最近的会话。无需跟踪 ID。

本示例进行了两次独立的 `query()` 调用。第一次调用创建一个全新会话；第二次调用设置 `continue: true`，这会指示 SDK 查找并恢复磁盘上最近的会话。代理拥有第一次调用的完整上下文：
```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

// First query: creates a new session
for await (const message of query({
  prompt: "Analyze the auth module",
  options: { allowedTools: ["Read", "Glob", "Grep"] }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

// Second query: continue: true resumes the most recent session
for await (const message of query({
  prompt: "Now refactor it to use JWT",
  options: {
    continue: true,
    allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```


  实验性的 [V2 会话 API](/en/agent-sdk/typescript-v2-preview)（该 API 提供了 `createSession()` 配合 `send` / `stream` 模式）已在 TypeScript Agent SDK 0.3.142 中移除。请改用 `query()` 函数以及本页所述的会话选项。

## 在 `query()` 中使用会话选项

### 捕获会话 ID

恢复和分叉操作需要一个会话 ID。从结果消息的 `session_id` 字段中读取它（Python 中是 [`ResultMessage`](/en/agent-sdk/python#resultmessage)，TypeScript 中是 [`SDKResultMessage`](/en/agent-sdk/typescript#sdkresultmessage)），该字段存在于每条结果消息中，无论成功或错误。在 TypeScript 中，该 ID 也更早地作为初始化 `SystemMessage` 的一个直接字段可用；在 Python 中，它嵌套在 `SystemMessage.data` 内部。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      session_id = None

      async for message in query(
          prompt="Analyze the auth module and suggest improvements",
          options=ClaudeAgentOptions(
              allowed_tools=["Read", "Glob", "Grep"],
          ),
      ):
          if isinstance(message, ResultMessage):
              session_id = message.session_id
              if message.subtype == "success":
                  print(message.result)

      print(f"Session ID: {session_id}")
      return session_id


  session_id = asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  let sessionId: string | undefined;

  for await (const message of query({
    prompt: "Analyze the auth module and suggest improvements",
    options: { allowedTools: ["Read", "Glob", "Grep"] }
  })) {
    if (message.type === "result") {
      sessionId = message.session_id;
      if (message.subtype === "success") {
        console.log(message.result);
      }
    }
  }

  console.log(`Session ID: ${sessionId}`);
  ```

### 通过 ID 恢复会话

将一个会话 ID 传递给 `resume` 即可返回到该特定会话。代理将从上次会话中断处继续，并保留完整的上下文。常见的恢复原因包括：

* **跟进已完成的任务。** 代理已经分析过某些内容；现在你希望它基于该分析采取行动，而无需重新读取文件。
* **从限制中恢复。** 第一次运行以 `error_max_turns` 或 `error_max_budget_usd` 结束（参见 [处理结果](/en/agent-sdk/agent-loop#handle-the-result)）；使用更高的限制恢复会话。
* **重启你的流程。** 你在关闭前捕获了会话 ID，并希望恢复对话。

以下示例使用跟进的提示词从 [捕获会话 ID](#capture-the-session-id) 处恢复会话。由于这是恢复，代理已在上下文中拥有先前的分析：

  ```python Python
  # Earlier session analyzed the code; now build on that analysis
  async for message in query(
      prompt="Now implement the refactoring you suggested",
      options=ClaudeAgentOptions(
          resume=session_id,
          allowed_tools=["Read", "Edit", "Write", "Glob", "Grep"],
      ),
  ):
      if isinstance(message, ResultMessage) and message.subtype == "success":
          print(message.result)
  ```

  ```typescript TypeScript
  // Earlier session analyzed the code; now build on that analysis
  for await (const message of query({
    prompt: "Now implement the refactoring you suggested",
    options: {
      resume: sessionId,
      allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"]
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```



  如果 `resume` 调用返回的是全新会话而非预期的历史记录，最常见原因是工作目录 (`cwd`) 不匹配。会话存储在 `~/.claude/projects/<encoded-cwd>/*.jsonl`，其中 `<encoded-cwd>` 是将绝对工作目录中的所有非字母数字字符替换为 `-` 后的值（例如 `/Users/me/proj` 变为 `-Users-me-proj`）。如果你的恢复调用是从不同目录运行的，SDK 就会在错误的位置查找。此外，会话文件必须存在于当前机器上。

要在不同机器或无服务器环境中恢复会话，可通过 [`SessionStore` 适配器](/en/agent-sdk/session-storage)将会话记录镜像至共享存储。

### 分叉以探索替代方案

分叉会创建一个新会话，该会话从原始会话历史记录的副本开始，但后续轨迹将独立发展。新分叉的会话拥有自己的会话 ID；原始会话的 ID 和历史记录保持不变。最终你将获得两个可独立恢复的独立会话。

  分叉会创建对话历史的分支，而非文件系统的分支。如果分叉代理编辑了文件，这些更改是真实存在的，并且对在同一目录中工作的任何会话都可见。若要创建分支并恢复文件更改，请使用[文件检查点](/en/agent-sdk/file-checkpointing)。

本示例建立在[捕获会话ID](#capture-the-session-id)基础上：您已在`session_id`中分析过认证模块，现希望在不丢失JWT相关讨论线索的前提下探索OAuth2。第一个代码块会分叉该会话并获取新会话的ID（`forked_id`）；第二个代码块恢复原始的`session_id`以继续沿着JWT路径推进。现在您拥有两个指向独立历史记录的会话ID：

  ```python Python
  # Fork: branch from session_id into a new session
  forked_id = None
  async for message in query(
      prompt="Instead of JWT, implement OAuth2 for the auth module",
      options=ClaudeAgentOptions(
          resume=session_id,
          fork_session=True,
      ),
  ):
      if isinstance(message, ResultMessage):
          forked_id = message.session_id  # The fork's ID, distinct from session_id
          if message.subtype == "success":
              print(message.result)

  print(f"Forked session: {forked_id}")

  # Original session is untouched; resuming it continues the JWT thread
  async for message in query(
      prompt="Continue with the JWT approach",
      options=ClaudeAgentOptions(resume=session_id),
  ):
      if isinstance(message, ResultMessage) and message.subtype == "success":
          print(message.result)
  ```

  ```typescript TypeScript
  // Fork: branch from sessionId into a new session
  let forkedId: string | undefined;

  for await (const message of query({
    prompt: "Instead of JWT, implement OAuth2 for the auth module",
    options: {
      resume: sessionId,
      forkSession: true
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      forkedId = message.session_id; // The fork's ID, distinct from sessionId
    }
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }

  console.log(`Forked session: ${forkedId}`);

  // Original session is untouched; resuming it continues the JWT thread
  for await (const message of query({
    prompt: "Continue with the JWT approach",
    options: { resume: sessionId }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

## 跨主机恢复会话

会话文件仅存储在创建它们的本地机器上。要在不同主机（CI 工作节点、临时容器、无服务器环境）上恢复会话，您有两个选择：

*   **移动会话文件。** 将首次运行时生成的 `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` 持久化保存，并在调用 `resume` 之前将其恢复到新主机的相同路径。`cwd` 必须匹配。
*   **不依赖会话恢复。** 将您需要的结果（分析输出、决策、文件差异）捕获为应用程序状态，并将其传递到新会话的提示词中。这通常比传输会话记录文件更可靠。

两个 SDK 都提供了用于枚举磁盘会话和读取其消息的函数：TypeScript 中的 [`listSessions()`](/en/agent-sdk/typescript#listsessions) 和 [`getSessionMessages()`](/en/agent-sdk/typescript#getsessionmessages)，以及 Python 中的 [`list_sessions()`](/en/agent-sdk/python#list_sessions) 和 [`get_session_messages()`](/en/agent-sdk/python#get_session_messages)。您可以使用它们来构建自定义会话选择器、清理逻辑或会话记录查看器。

两个 SDK 也都提供了用于查找和修改单个会话的函数：Python 中的 [`get_session_info()`](/en/agent-sdk/python#get_session_info)、[`rename_session()`](/en/agent-sdk/python#rename_session) 和 [`tag_session()`](/en/agent-sdk/python#tag_session)，以及 TypeScript 中的 [`getSessionInfo()`](/en/agent-sdk/typescript#getsessioninfo)、[`renameSession()`](/en/agent-sdk/typescript#renamesession) 和 [`tagSession()`](/en/agent-sdk/typescript#tagsession)。您可以使用它们通过标签组织会话或为其设置可读的标题。

## 相关资源

*   [代理循环如何工作](/en/agent-sdk/agent-loop)：了解会话内的轮次、消息和上下文累积
*   [文件检查点](/en/agent-sdk/file-checkpointing)：跨会话跟踪和回滚文件更改
*   [Python `ClaudeAgentOptions`](/en/agent-sdk/python#claudeagentoptions)：Python 的完整会话选项参考
*   [TypeScript `Options`](/en/agent-sdk/typescript#options)：TypeScript 的完整会话选项参考