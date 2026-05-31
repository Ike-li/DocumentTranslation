> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 请使用此文件发现所有可用页面后再进行深入探索。

# Agent SDK 参考 - Python

> Python Agent SDK 的完整 API 参考，包含所有函数、类型和类。

## 安装
```bash
pip install claude-agent-sdk
```
## 在 `query()` 与 `ClaudeSDKClient` 之间选择

Python SDK 提供了两种与 Claude Code 交互的方式：

### 快速对比

| 功能             | `query()`                                      | `ClaudeSDKClient`                  |
| :--------------- | :--------------------------------------------- | :--------------------------------- |
| **会话**         | 默认创建新会话                                 | 复用同一会话                       |
| **对话**         | 单次交互                                       | 同一上下文中进行多次交互           |
| **连接**         | 自动管理                                       | 手动控制                           |
| **流式输入**     | ✅ 支持                                         | ✅ 支持                             |
| **中断**         | ❌ 不支持                                       | ✅ 支持                             |
| **钩子**         | ✅ 支持                                         | ✅ 支持                             |
| **自定义工具**   | ✅ 支持                                         | ✅ 支持                             |
| **继续对话**     | 通过 `continue_conversation` 或 `resume` 手动实现 | ✅ 自动                             |
| **适用场景**     | 一次性任务                                     | 持续对话                           |

### 何时使用 `query()`（一次性任务）

**最适合：**

* 不需要对话历史记录的一次性问题
* 无需先前交互上下文的独立任务
* 简单的自动化脚本
* 当您希望每次都从零开始时

### 何时使用 `ClaudeSDKClient`（持续对话）

**最适合：**

* **持续对话** - 当您需要 Claude 记住上下文时
* **追问** - 基于先前回答继续提问
* **交互式应用** - 聊天界面、REPL
* **响应驱动逻辑** - 当下一步操作取决于 Claude 的响应时
* **会话控制** - 显式管理对话生命周期

## 函数

### `query()`

默认情况下，为与 Claude Code 的每次交互创建一个新会话。返回一个异步迭代器，消息到达时逐条生成。除非您在 [`ClaudeAgentOptions`](#claudeagentoptions) 中传递 `continue_conversation=True` 或 `resume`，否则每次调用 `query()` 都会从头开始，不会记住先前的交互。请参阅[会话](/zh/agent-sdk/sessions)。
```python
async def query(
    *,
    prompt: str | AsyncIterable[dict[str, Any]],
    options: ClaudeAgentOptions | None = None,
    transport: Transport | None = None
) -> AsyncIterator[Message]
```
#### 参数

| 参数        | 类型                           | 描述                                                                        |
| :---------- | :--------------------------- | :------------------------------------------------------------------------- |
| `prompt`    | `str \| AsyncIterable[dict]` | 输入提示词，可以是字符串或用于流式模式的异步可迭代对象                            |
| `options`   | `ClaudeAgentOptions \| None` | 可选的配置对象（如果为 None 则默认使用 `ClaudeAgentOptions()`）                |
| `transport` | `Transport \| None`          | 可选的自定义传输对象，用于与 CLI 进程通信                                       |

#### 返回值

返回一个 `AsyncIterator[Message]`，它会生成对话中的消息。

#### 示例 - 带选项
```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    options = ClaudeAgentOptions(
        system_prompt="You are an expert Python developer",
        permission_mode="acceptEdits",
        cwd="/home/user/project",
    )

    async for message in query(prompt="Create a Python web server", options=options):
        print(message)


asyncio.run(main())
```
### `tool()`

用于定义 MCP 工具的装饰器，支持类型安全。
```python
def tool(
    name: str,
    description: str,
    input_schema: type | dict[str, Any],
    annotations: ToolAnnotations | None = None
) -> Callable[[Callable[[Any], Awaitable[dict[str, Any]]]], SdkMcpTool[Any]]
```
#### 参数

| 参数           | 类型                                            | 描述                                                         |
| :------------- | :---------------------------------------------- | :------------------------------------------------------------------ |
| `name`         | `str`                                           | 工具的唯一标识符                                      |
| `description`  | `str`                                           | 关于工具功能的、人类可读的描述                    |
| `input_schema` | `type \| dict[str, Any]`                        | 定义工具输入参数的模式（见下文）             |
| `annotations`  | [`ToolAnnotations`](#toolannotations)` \| None` | 可选的 MCP 工具注解，为客户端提供行为提示 |

#### 输入模式选项

1. **简单类型映射**（推荐）：
   ```python
   {"text": str, "count": int, "enabled": bool}
   ```
2. **JSON Schema 格式**（用于复杂验证）：
   ```python
   {
       "type": "object",
       "properties": {
           "text": {"type": "string"},
           "count": {"type": "integer", "minimum": 0},
       },
       "required": ["text"],
   }
   ```
#### 返回值

一个装饰器函数，用于包装工具实现并返回一个 `SdkMcpTool` 实例。

#### 示例
```python
from claude_agent_sdk import tool
from typing import Any


@tool("greet", "Greet a user", {"name": str})
async def greet(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": f"Hello, {args['name']}!"}]}
```
#### `ToolAnnotations`

从 `mcp.types` 重新导出（也可通过 `from claude_agent_sdk import ToolAnnotations` 获取）。所有字段均为可选提示；客户端不应依赖它们进行安全决策。

| 字段              | 类型           | 默认值  | 描述                                                                                                                             |
| :---------------- | :------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------- |
| `title`           | `str \| None`  | `None`  | 工具的可读标题                                                                                                                   |
| `readOnlyHint`    | `bool \| None` | `False` | 若为 `True`，则该工具不会修改其环境                                                                                              |
| `destructiveHint` | `bool \| None` | `True`  | 若为 `True`，则该工具可能执行破坏性更新（仅当 `readOnlyHint` 为 `False` 时有意义）                                               |
| `idempotentHint`  | `bool \| None` | `False` | 若为 `True`，则使用相同参数重复调用不会产生额外效果（仅当 `readOnlyHint` 为 `False` 时有意义）                                   |
| `openWorldHint`   | `bool \| None` | `True`  | 若为 `True`，则该工具与外部实体交互（例如网络搜索）。若为 `False`，则该工具的领域是封闭的（例如内存工具）                        |
```python
from claude_agent_sdk import tool, ToolAnnotations
from typing import Any


@tool(
    "search",
    "Search the web",
    {"query": str},
    annotations=ToolAnnotations(readOnlyHint=True, openWorldHint=True),
)
async def search(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": f"Results for: {args['query']}"}]}
```
### `create_sdk_mcp_server()`

创建一个在您的 Python 应用程序内运行的进程内 MCP 服务器。
```python
def create_sdk_mcp_server(
    name: str,
    version: str = "1.0.0",
    tools: list[SdkMcpTool[Any]] | None = None
) -> McpSdkServerConfig
```
#### 参数

| 参数 | 类型                            | 默认值    | 描述                                           |
| :-------- | :------------------------------ | :-------- | :---------------------------------------------------- |
| `name`    | `str`                           | -         | 服务器的唯一标识符                      |
| `version` | `str`                           | `"1.0.0"` | 服务器版本字符串                                 |
| `tools`   | `list[SdkMcpTool[Any]] \| None` | `None`    | 使用 `@tool` 装饰器创建的工具函数列表 |

#### 返回值

返回一个 `McpSdkServerConfig` 对象，该对象可传递给 `ClaudeAgentOptions.mcp_servers`。

#### 示例
```python
from claude_agent_sdk import tool, create_sdk_mcp_server


@tool("add", "Add two numbers", {"a": float, "b": float})
async def add(args):
    return {"content": [{"type": "text", "text": f"Sum: {args['a'] + args['b']}"}]}


@tool("multiply", "Multiply two numbers", {"a": float, "b": float})
async def multiply(args):
    return {"content": [{"type": "text", "text": f"Product: {args['a'] * args['b']}"}]}


calculator = create_sdk_mcp_server(
    name="calculator",
    version="2.0.0",
    tools=[add, multiply],  # Pass decorated functions
)

# Use with Claude
options = ClaudeAgentOptions(
    mcp_servers={"calc": calculator},
    allowed_tools=["mcp__calc__add", "mcp__calc__multiply"],
)
```
### `list_sessions()`

列出带元数据的过去会话。可按项目目录过滤或列出所有项目的会话。同步操作；立即返回。
```python
def list_sessions(
    directory: str | None = None,
    limit: int | None = None,
    include_worktrees: bool = True
) -> list[SDKSessionInfo]
```
#### 参数

| 参数                | 类型          | 默认值 | 描述                                                                                     |
| :------------------ | :------------ | :----- | :--------------------------------------------------------------------------------------- |
| `directory`         | `str \| None` | `None` | 要列出会话的目录。省略时，返回所有项目的会话                                             |
| `limit`             | `int \| None` | `None` | 要返回的最大会话数量                                                                     |
| `include_worktrees` | `bool`        | `True` | 当 `directory` 位于 git 仓库内时，是否包含来自所有工作树路径的会话                       |

#### 返回类型：`SDKSessionInfo`

| 属性            | 类型          | 描述                                                                 |
| :-------------- | :------------ | :------------------------------------------------------------------- |
| `session_id`    | `str`         | 唯一会话标识符                                                       |
| `summary`       | `str`         | 显示标题：自定义标题、自动生成的摘要或第一个提示词                   |
| `last_modified` | `int`         | 最后修改时间（自纪元起的毫秒数）                                     |
| `file_size`     | `int \| None` | 会话文件大小（字节）（远程存储后端时为 `None`）                      |
| `custom_title`  | `str \| None` | 用户设置的会话标题                                                   |
| `first_prompt`  | `str \| None` | 会话中的第一个有意义的用户提示词                                     |
| `git_branch`    | `str \| None` | 会话结束时的 Git 分支                                                |
| `cwd`           | `str \| None` | 会话的工作目录                                                       |
| `tag`           | `str \| None` | 用户设置的会话标签（参见 [`tag_session()`](#tag_session)）            |
| `created_at`    | `int \| None` | 会话创建时间（自纪元起的毫秒数）                                     |

#### 示例

打印某个项目最近的 10 个会话。结果按 `last_modified` 降序排序，因此第一项是最新的。省略 `directory` 则搜索所有项目。
```python
from claude_agent_sdk import list_sessions

for session in list_sessions(directory="/path/to/project", limit=10):
    print(f"{session.summary} ({session.session_id})")
```
### `get_session_messages()`

检索过往会话中的消息。同步执行；立即返回。
```python
def get_session_messages(
    session_id: str,
    directory: str | None = None,
    limit: int | None = None,
    offset: int = 0
) -> list[SessionMessage]
```
#### 参数

| 参数           | 类型            | 默认值   | 描述                                                         |
| :------------- | :-------------- | :------- | :----------------------------------------------------------- |
| `session_id`   | `str`           | 必填     | 要检索消息的会话 ID                                           |
| `directory`    | `str \| None`   | `None`   | 要查找的项目目录。省略时，将搜索所有项目                      |
| `limit`        | `int \| None`   | `None`   | 要返回的最大消息数量                                          |
| `offset`       | `int`           | `0`      | 从起始位置要跳过的消息数量                                    |

#### 返回类型：`SessionMessage`

| 属性                   | 类型                             | 描述                   |
| :--------------------- | :------------------------------- | :--------------------- |
| `type`                 | `Literal["user", "assistant"]`   | 消息角色               |
| `uuid`                 | `str`                            | 消息唯一标识符         |
| `session_id`           | `str`                            | 会话标识符             |
| `message`              | `Any`                            | 原始消息内容           |
| `parent_tool_use_id`   | `None`                           | 保留供将来使用         |

#### 示例
```python
from claude_agent_sdk import list_sessions, get_session_messages

sessions = list_sessions(limit=1)
if sessions:
    messages = get_session_messages(sessions[0].session_id)
    for msg in messages:
        print(f"[{msg.type}] {msg.uuid}")
```
### `get_session_info()`

通过会话ID读取单个会话的元数据，无需扫描整个项目目录。同步执行；立即返回。
```python
def get_session_info(
    session_id: str,
    directory: str | None = None,
) -> SDKSessionInfo | None
```
#### 参数

| 参数           | 类型            | 默认值   | 描述                                                                 |
| :------------- | :-------------- | :------- | :--------------------------------------------------------------------- |
| `session_id`   | `str`           | 必填     | 要查找的会话的 UUID                                                   |
| `directory`    | `str \| None`   | `None`   | 项目目录路径。省略时，将搜索所有项目目录                               |

返回 [`SDKSessionInfo`](#返回类型sdksessioninfo)，如果未找到会话则返回 `None`。

#### 示例

查找单个会话的元数据，无需扫描项目目录。当您已从前次运行中拥有会话 ID 时，此功能非常有用。
```python
from claude_agent_sdk import get_session_info

info = get_session_info("550e8400-e29b-41d4-a716-446655440000")
if info:
    print(f"{info.summary} (branch: {info.git_branch}, tag: {info.tag})")
```
### `rename_session()`

通过附加自定义标题条目来重命名会话。重复调用是安全的；最终使用最新的标题。同步的。
```python
def rename_session(
    session_id: str,
    title: str,
    directory: str | None = None,
) -> None
```
#### 参数

| 参数         | 类型          | 默认值  | 说明                                                                 |
| :----------- | :------------ | :------ | :------------------------------------------------------------------- |
| `session_id` | `str`         | 必填    | 要重命名的会话 UUID                                                  |
| `title`      | `str`         | 必填    | 新标题。去除空白字符后必须非空                                       |
| `directory`  | `str \| None` | `None`  | 项目目录路径。省略时将搜索所有项目目录                               |

如果 `session_id` 不是有效的 UUID 或 `title` 为空，将引发 `ValueError`；如果找不到会话，将引发 `FileNotFoundError`。

#### 示例

重命名最近的会话以便日后查找。后续读取时，新标题将显示在 [`SDKSessionInfo.custom_title`](#返回类型sdksessioninfo) 中。
```python
from claude_agent_sdk import list_sessions, rename_session

sessions = list_sessions(directory="/path/to/project", limit=1)
if sessions:
    rename_session(sessions[0].session_id, "Refactor auth module")
```

### `tag_session()`

```python
def tag_session(
    session_id: str,
    tag: str | None,
    directory: str | None = None,
) -> None
```
#### 参数

| 参数         | 类型          | 默认值   | 说明                                                                 |
| :----------- | :------------ | :------- | :------------------------------------------------------------------- |
| `session_id` | `str`         | required | 要标记的会话 UUID                                                    |
| `tag`        | `str \| None` | required | 标签字符串，或传入 `None` 以清除标签。存储前会进行 Unicode 清洗       |
| `directory`  | `str \| None` | `None`   | 项目目录路径。省略时，将搜索所有项目目录                              |

若 `session_id` 不是有效的 UUID 或 `tag` 经清洗后为空，将引发 `ValueError`；若找不到会话，将引发 `FileNotFoundError`。

#### 示例

标记一个会话，然后在后续读取时按该标签进行筛选。传入 `None` 可清除现有标签。
```python
from claude_agent_sdk import list_sessions, tag_session

# Tag a session
tag_session("550e8400-e29b-41d4-a716-446655440000", "needs-review")

# Later: find all sessions with that tag
for session in list_sessions(directory="/path/to/project"):
    if session.tag == "needs-review":
        print(session.summary)
```
## 类

### `ClaudeSDKClient`

**在多次交互中维持一个会话。** 这相当于 TypeScript SDK 的 `query()` 函数内部工作机制的 Python 版本 - 它创建一个可以继续对话的客户端对象。

#### 主要特性

* **会话延续**：在多次 `query()` 调用中维持对话上下文
* **同一会话**：会话会保留先前的消息
* **中断支持**：可以在任务执行过程中停止
* **显式生命周期**：您可以控制会话何时开始和结束
* **响应驱动流程**：可以对响应做出反应并发送后续消息
* **自定义工具和钩子**：支持自定义工具（使用 `@tool` 装饰器创建）和钩子
```python
class ClaudeSDKClient:
    def __init__(self, options: ClaudeAgentOptions | None = None, transport: Transport | None = None)
    async def connect(self, prompt: str | AsyncIterable[dict] | None = None) -> None
    async def query(self, prompt: str | AsyncIterable[dict], session_id: str = "default") -> None
    async def receive_messages(self) -> AsyncIterator[Message]
    async def receive_response(self) -> AsyncIterator[Message]
    async def interrupt(self) -> None
    async def set_permission_mode(self, mode: str) -> None
    async def set_model(self, model: str | None = None) -> None
    async def rewind_files(self, user_message_id: str) -> None
    async def get_mcp_status(self) -> McpStatusResponse
    async def reconnect_mcp_server(self, server_name: str) -> None
    async def toggle_mcp_server(self, server_name: str, enabled: bool) -> None
    async def stop_task(self, task_id: str) -> None
    async def get_server_info(self) -> dict[str, Any] | None
    async def disconnect(self) -> None
```
#### 方法

| 方法                                      | 描述                                                                                                                                                        |
| :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `__init__(options)`                       | 使用可选配置初始化客户端                                                                                                                                    |
| `connect(prompt)`                         | 连接到 Claude，可附带初始提示词或消息流                                                                                                                     |
| `query(prompt, session_id)`               | 在流式模式下发送新请求                                                                                                                                      |
| `receive_messages()`                      | 以异步迭代器形式接收来自 Claude 的所有消息                                                                                                                  |
| `receive_response()`                      | 接收消息直至（包含）结果消息                                                                                                                                |
| `interrupt()`                             | 发送中断信号（仅在流式模式下有效）                                                                                                                          |
| `set_permission_mode(mode)`               | 更改当前会话的权限模式                                                                                                                                      |
| `set_model(model)`                        | 更改当前会话使用的模型。传递 `None` 可重置为默认设置                                                                                                        |
| `rewind_files(user_message_id)`           | 将文件恢复至指定用户消息时的状态。需要设置 `enable_file_checkpointing=True`。详见 [文件检查点](/zh/agent-sdk/file-checkpointing)                             |
| `get_mcp_status()`                        | 获取所有已配置 MCP 服务器的状态。返回 [`McpStatusResponse`](#mcpstatusresponse)                                                                              |
| `reconnect_mcp_server(server_name)`       | 重试连接失败或已断开的 MCP 服务器                                                                                                                           |
| `toggle_mcp_server(server_name, enabled)` | 在会话中途启用或禁用某个 MCP 服务器。禁用将移除其工具                                                                                                       |
| `stop_task(task_id)`                      | 停止正在运行的后台任务。随后会在消息流中收到一条状态为 `"stopped"` 的 [`TaskNotificationMessage`](#tasknotificationmessage)                                  |
| `get_server_info()`                       | 获取服务器信息，包括会话 ID 和能力                                                                                                                          |
| `disconnect()`                            | 断开与 Claude 的连接                                                                                                                                        |

#### 上下文管理器支持

该客户端可作为异步上下文管理器使用，以实现自动连接管理：
```python
async with ClaudeSDKClient() as client:
    await client.query("Hello Claude")
    async for message in client.receive_response():
        print(message)
```
> **重要提示：** 迭代消息时，避免使用 `break` 提前退出，因为这可能导致异步IO清理问题。应让迭代自然完成，或使用标志来跟踪是否已找到所需内容。

#### 示例 - 继续对话
```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, AssistantMessage, TextBlock, ResultMessage


async def main():
    async with ClaudeSDKClient() as client:
        # First question
        await client.query("What's the capital of France?")

        # Process response
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

        # Follow-up question - the session retains the previous context
        await client.query("What's the population of that city?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

        # Another follow-up - still in the same conversation
        await client.query("What are some famous landmarks there?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")


asyncio.run(main())
```
#### 示例 - 使用ClaudeSDKClient的流式输入
```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient


async def message_stream():
    """Generate messages dynamically."""
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Analyze the following data:"},
    }
    await asyncio.sleep(0.5)
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Temperature: 25°C, Humidity: 60%"},
    }
    await asyncio.sleep(0.5)
    yield {
        "type": "user",
        "message": {"role": "user", "content": "What patterns do you see?"},
    }


async def main():
    async with ClaudeSDKClient() as client:
        # Stream input to Claude
        await client.query(message_stream())

        # Process response
        async for message in client.receive_response():
            print(message)

        # Follow-up in same session
        await client.query("Should we be concerned about these readings?")

        async for message in client.receive_response():
            print(message)


asyncio.run(main())
```
#### 示例 - 使用中断
```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, ResultMessage


async def interruptible_task():
    options = ClaudeAgentOptions(allowed_tools=["Bash"], permission_mode="acceptEdits")

    async with ClaudeSDKClient(options=options) as client:
        # Start a long-running task
        await client.query("Count from 1 to 100 slowly, using the bash sleep command")

        # Let it run for a bit
        await asyncio.sleep(2)

        # Interrupt the task
        await client.interrupt()
        print("Task interrupted!")

        # Drain the interrupted task's messages (including its ResultMessage)
        async for message in client.receive_response():
            if isinstance(message, ResultMessage):
                print(f"Interrupted task finished with subtype={message.subtype!r}")
                # subtype is "error_during_execution" for interrupted tasks

        # Send a new command
        await client.query("Just say hello instead")

        # Now receive the new response
        async for message in client.receive_response():
            if isinstance(message, ResultMessage) and message.subtype == "success":
                print(f"New result: {message.result}")


asyncio.run(interruptible_task())
```


  **中断后的缓冲区行为：** `interrupt()` 会发送停止信号，但不会清除消息缓冲区。被中断任务已产生的消息，包括其 `ResultMessage`（`subtype="error_during_execution"`），仍会保留在流中。你必须使用 `receive_response()` 将它们消耗完毕，才能读取对新查询的响应。如果你在 `interrupt()` 后立即发送新查询，并且只调用一次 `receive_response()`，你将收到的是被中断任务的消息，而不是新查询的响应。

#### 示例 - 高级权限控制
```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
from claude_agent_sdk.types import (
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)


async def custom_permission_handler(
    tool_name: str, input_data: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    """Custom logic for tool permissions."""

    # Block writes to system directories
    if tool_name == "Write" and input_data.get("file_path", "").startswith("/system/"):
        return PermissionResultDeny(
            message="System directory write not allowed", interrupt=True
        )

    # Redirect sensitive file operations
    if tool_name in ["Write", "Edit"] and "config" in input_data.get("file_path", ""):
        safe_path = f"./sandbox/{input_data['file_path']}"
        return PermissionResultAllow(
            updated_input={**input_data, "file_path": safe_path}
        )

    # Allow everything else
    return PermissionResultAllow(updated_input=input_data)


async def main():
    options = ClaudeAgentOptions(
        can_use_tool=custom_permission_handler, allowed_tools=["Read", "Write", "Edit"]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Update the system config file")

        async for message in client.receive_response():
            # Will use sandbox path instead
            print(message)


asyncio.run(main())
```
## 类型

  **`@dataclass` 与 `TypedDict`：** 此 SDK 使用了两种类型。使用 `@dataclass` 装饰的类（如 `ResultMessage`、`AgentDefinition`、`TextBlock`）在运行时是对象实例，支持属性访问：`msg.result`。使用 `TypedDict` 定义的类（如 `ThinkingConfigEnabled`、`McpStdioServerConfig`、`SyncHookJSONOutput`）在运行时**是普通字典**，需要通过键访问：`config["budget_tokens"]`，而非 `config.budget_tokens`。`ClassName(field=value)` 调用语法对两者均有效，但只有 dataclass 会生成具有属性的对象。

### `SdkMcpTool`

使用 `@tool` 装饰器创建的 SDK MCP 工具的定义。
```python
@dataclass
class SdkMcpTool(Generic[T]):
    name: str
    description: str
    input_schema: type[T] | dict[str, Any]
    handler: Callable[[T], Awaitable[dict[str, Any]]]
    annotations: ToolAnnotations | None = None
```
| 属性           | 类型                                       | 描述                                                                                                       |
| :------------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `name`         | `str`                                      | 工具的唯一标识符                                                                                           |
| `description`  | `str`                                      | 人类可读的描述                                                                                             |
| `input_schema` | `type[T] \| dict[str, Any]`                | 用于输入验证的 schema                                                                                      |
| `handler`      | `Callable[[T], Awaitable[dict[str, Any]]]` | 处理工具执行的异步函数                                                                                     |
| `annotations`  | `ToolAnnotations \| None`                  | 可选的 MCP 工具注解（例如，`readOnlyHint`、`destructiveHint`、`openWorldHint`）。来自 `mcp.types` |

### `Transport`

用于自定义传输实现的抽象基类。可以使用它来通过自定义通道（例如，远程连接而非本地子进程）与 Claude 进程通信。

  这是一个低级内部API。接口可能在未来版本中变更。自定义实现需要更新以匹配任何接口变更。


```python
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any


class Transport(ABC):
    @abstractmethod
    async def connect(self) -> None: ...

    @abstractmethod
    async def write(self, data: str) -> None: ...

    @abstractmethod
    def read_messages(self) -> AsyncIterator[dict[str, Any]]: ...

    @abstractmethod
    async def close(self) -> None: ...

    @abstractmethod
    def is_ready(self) -> bool: ...

    @abstractmethod
    async def end_input(self) -> None: ...
```
| 方法                | 描述                                                                        |
| :------------------ | :-------------------------------------------------------------------------- |
| `connect()`         | 连接传输层并准备通信                                                        |
| `write(data)`       | 向传输层写入原始数据（JSON + 换行符）                                       |
| `read_messages()`   | 异步迭代器，生成解析后的JSON消息                                            |
| `close()`           | 关闭连接并清理资源                                                          |
| `is_ready()`        | 如果传输层可以发送和接收则返回 `True`                                       |
| `end_input()`       | 关闭输入流（例如，对于子进程传输关闭标准输入）                              |

导入方式：`from claude_agent_sdk import Transport`

### `ClaudeAgentOptions`

Claude Code 查询的配置数据类。
```python
@dataclass
class ClaudeAgentOptions:
    tools: list[str] | ToolsPreset | None = None
    allowed_tools: list[str] = field(default_factory=list)
    system_prompt: str | SystemPromptPreset | None = None
    mcp_servers: dict[str, McpServerConfig] | str | Path = field(default_factory=dict)
    strict_mcp_config: bool = False
    permission_mode: PermissionMode | None = None
    continue_conversation: bool = False
    resume: str | None = None
    max_turns: int | None = None
    max_budget_usd: float | None = None
    disallowed_tools: list[str] = field(default_factory=list)
    model: str | None = None
    fallback_model: str | None = None
    betas: list[SdkBeta] = field(default_factory=list)
    output_format: dict[str, Any] | None = None
    permission_prompt_tool_name: str | None = None
    cwd: str | Path | None = None
    cli_path: str | Path | None = None
    settings: str | None = None
    add_dirs: list[str | Path] = field(default_factory=list)
    env: dict[str, str] = field(default_factory=dict)
    extra_args: dict[str, str | None] = field(default_factory=dict)
    max_buffer_size: int | None = None
    debug_stderr: Any = sys.stderr  # Deprecated
    stderr: Callable[[str], None] | None = None
    can_use_tool: CanUseTool | None = None
    hooks: dict[HookEvent, list[HookMatcher]] | None = None
    user: str | None = None
    include_partial_messages: bool = False
    include_hook_events: bool = False
    fork_session: bool = False
    agents: dict[str, AgentDefinition] | None = None
    setting_sources: list[SettingSource] | None = None
    sandbox: SandboxSettings | None = None
    plugins: list[SdkPluginConfig] = field(default_factory=list)
    max_thinking_tokens: int | None = None  # Deprecated: use thinking instead
    thinking: ThinkingConfig | None = None
    effort: EffortLevel | None = None
    enable_file_checkpointing: bool = False
    session_store: SessionStore | None = None
    session_store_flush: SessionStoreFlushMode = "batched"
```
| 属性                          | 类型                                                                                  | 默认值                               | 描述                                                                                                                                                                                                                                                                                                    |
| :---------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tools`                       | `list[str] \| ToolsPreset \| None`                                                    | `None`                               | 工具配置。使用 `{"type": "preset", "preset": "claude_code"}` 来获取 Claude Code 的默认工具                                                                                                                                                                                                             |
| `allowed_tools`               | `list[str]`                                                                           | `[]`                                 | 自动批准而无需提示的工具。这并不会将 Claude 限制为只能使用这些工具；未列出的工具将回退到 `permission_mode` 和 `can_use_tool` 处理。使用 `disallowed_tools` 来阻止工具。参见 [权限](/zh/agent-sdk/permissions#allow-and-deny-rules)                                                                            |
| `system_prompt`               | `str \| SystemPromptPreset \| None`                                                   | `None`                               | 系统提示词配置。传入一个字符串作为自定义提示词，或使用 `{"type": "preset", "preset": "claude_code"}` 来获取 Claude Code 的系统提示词。添加 `"append"` 以扩展预设内容                                                                                                                                 |
| `mcp_servers`                 | `dict[str, McpServerConfig] \| str \| Path`                                           | `{}`                                 | MCP 服务器配置或配置文件路径                                                                                                                                                                                                                                                                           |
| `strict_mcp_config`           | `bool`                                                                                | `False`                              | 当设为 `True` 时，仅使用 `mcp_servers` 中传入的服务器，并忽略项目的 `.mcp.json`、用户设置和插件提供的 MCP 服务器。对应 CLI 的 `--strict-mcp-config` 标志                                                                                                                                                |
| `permission_mode`             | `PermissionMode \| None`                                                              | `None`                               | 工具使用的权限模式                                                                                                                                                                                                                                                                                     |
| `continue_conversation`       | `bool`                                                                                | `False`                              | 继续最近一次对话                                                                                                                                                                                                                                                                                       |
| `resume`                      | `str \| None`                                                                         | `None`                               | 要恢复的会话 ID                                                                                                                                                                                                                                                                                        |
| `max_turns`                   | `int \| None`                                                                         | `None`                               | 最大代理轮次（工具使用往返次数）                                                                                                                                                                                                                                                                       |
| `max_budget_usd`              | `float \| None`                                                                       | `None`                               | 当客户端成本估算达到此美元值时停止查询。与 `total_cost_usd` 使用相同的估算进行比较；关于准确性说明，请参阅[追踪成本和使用情况](/zh/agent-sdk/cost-tracking)                                                                                                                                             |
| `disallowed_tools`            | `list[str]`                                                                           | `[]`                                 | 要拒绝的工具。一个裸名称如 `"Bash"` 会从 Claude 的上下文中移除该工具。一个带范围的规则如 `"Bash(rm *)"` 会使工具保持可用，但在所有权限模式下（包括 `bypassPermissions`）拒绝匹配的调用。参见[权限](/zh/agent-sdk/permissions#allow-and-deny-rules)                                                        |
| `enable_file_checkpointing`   | `bool`                                                                                | `False`                              | 启用用于回溯的文件更改跟踪。参见[文件检查点](/zh/agent-sdk/file-checkpointing)                                                                                                                                                                                                                          |
| `model`                       | `str \| None`                                                                         | `None`                               | 要使用的 Claude 模型                                                                                                                                                                                                                                                                                   |
| `fallback_model`              | `str \| None`                                                                         | `None`                               | 当主模型失败时使用的备用模型                                                                                                                                                                                                                                                                           |
| `betas`                       | `list[SdkBeta]`                                                                       | `[]`                                 | 要启用的测试版功能。参见 [`SdkBeta`](#sdkbeta) 了解可用选项                                                                                                                                                                                                                                            |
| `output_format`               | `dict[str, Any] \| None`                                                              | `None`                               | 结构化响应的输出格式（例如，`{"type": "json_schema", "schema": {...}}`）。详情参见[结构化输出](/zh/agent-sdk/structured-outputs)                                                                                                                                                                         |
| `permission_prompt_tool_name` | `str \| None`                                                                         | `None`                               | 用于权限提示的 MCP 工具名称                                                                                                                                                                                                                                                                            |
| `cwd`                         | `str \| Path \| None`                                                                 | `None`                               | 当前工作目录                                                                                                                                                                                                                                                                                           |
| `cli_path`                    | `str \| Path \| None`                                                                 | `None`                               | Claude Code CLI 可执行文件的自定义路径                                                                                                                                                                                                                                                                 |
| `settings`                    | `str \| None`                                                                         | `None`                               | 设置文件路径                                                                                                                                                                                                                                                                                           |
| `add_dirs`                    | `list[str \| Path]`                                                                   | `[]`                                 | Claude 可以访问的其他目录                                                                                                                                                                                                                                                                              |
| `env`                         | `dict[str, str]`                                                                      | `{}`                                 | 合并到继承的进程环境之上的环境变量。参见[环境变量](/zh/env-vars)了解底层 CLI 读取的变量，以及[处理缓慢或停滞的 API 响应](#systempromptpreset)了解超时相关变量                                                                                                                         |
| `extra_args`                  | `dict[str, str \| None]`                                                              | `{}`                                 | 直接传递给 CLI 的其他 CLI 参数                                                                                                                                                                                                                                                                         |
| `max_buffer_size`             | `int \| None`                                                                         | `None`                               | 缓冲 CLI 标准输出时的最大字节数                                                                                                                                                                                                                                                                        |
| `debug_stderr`                | `Any`                                                                                 | `sys.stderr`                         | *已弃用* - 用于调试输出的类文件对象。请使用 `stderr` 回调代替                                                                                                                                                                                                                                           |
| `stderr`                      | `Callable[[str], None] \| None`                                                       | `None`                               | 用于 CLI 标准错误输出的回调函数                                                                                                                                                                                                                                                                        |
| `can_use_tool`                | [`CanUseTool`](#canusetool) ` \| None`                                                | `None`                               | 工具权限回调函数。详情参见[权限类型](#canusetool)                                                                                                                                                                                                                                                       |
| `hooks`                       | `dict[HookEvent, list[HookMatcher]] \| None`                                          | `None`                               | 用于拦截事件的钩子配置                                                                                                                                                                                                                                                                                 |
| `user`                        | `str \| None`                                                                         | `None`                               | 用户标识符                                                                                                                                                                                                                                                                                             |
| `include_partial_messages`    | `bool`                                                                                | `False`                              | 包含部分消息流式事件。启用后，会生成 [`StreamEvent`](#streamevent) 消息                                                                                                                                                                                                                                 |
| `include_hook_events`         | `bool`                                                                                | `False`                              | 在消息流中包含钩子生命周期事件，作为 `HookEventMessage` 对象                                                                                                                                                                                                                                           |
| `fork_session`                | `bool`                                                                                | `False`                              | 使用 `resume` 恢复时，复刻到一个新的会话 ID，而不是继续原会话                                                                                                                                                                                                                                          |
| `agents`                      | `dict[str, AgentDefinition] \| None`                                                  | `None`                               | 以编程方式定义的子代理                                                                                                                                                                                                                                                                                 |
| `plugins`                     | `list[SdkPluginConfig]`                                                               | `[]`                                 | 从本地路径加载自定义插件。详情参见[插件](/zh/agent-sdk/plugins)                                                                                                                                                                                                                                         |
| `sandbox`                     | [`SandboxSettings`](#sandboxsettings) ` \| None`                                      | `None`                               | 以编程方式配置沙箱行为。详情参见[沙箱设置](#sandboxsettings)                                                                                                                                                                                                                                            |
| `setting_sources`             | `list[SettingSource] \| None`                                                         | `None`（CLI 默认值：所有来源）       | 控制要加载哪些文件系统设置。传入 `[]` 可禁用用户、项目和本地设置。托管策略设置无论如何都会加载。参见[使用 Claude Code 功能](/zh/agent-sdk/claude-code-features#what-settingSources-does-not-control)                                                                                                      |
| `skills`                      | `list[str] \| Literal["all"] \| None`                                                 | `None`                               | 会话可用的技能。传入 `"all"` 以启用所有发现的技能，或传入技能名称列表。设置后，SDK 会自动启用技能工具，而无需将其列在 `allowed_tools` 中。参见[技能](/zh/agent-sdk/skills)                                                                                                                               |
| `max_thinking_tokens`         | `int \| None`                                                                         | `None`                               | *已弃用* - 思考块的最大 token 数。请使用 `thinking` 代替                                                                                                                                                                                                                                               |
| `thinking`                    | [`ThinkingConfig`](#thinkingconfig) ` \| None`                                        | `None`                               | 控制扩展思考行为。优先于 `max_thinking_tokens`                                                                                                                                                                                                                                                         |
| `effort`                      | [`EffortLevel`](#effortlevel) ` \| None`                                              | `None`                               | 思考深度的努力等级                                                                                                                                                                                                                                                                                     |
| `session_store`               | [`SessionStore`](/zh/agent-sdk/session-storage#the-sessionstore-interface) ` \| None` | `None`                               | 将会话转录镜像到外部后端，以便任何主机都可以恢复它们。参见[将会话持久化到外部存储](/zh/agent-sdk/session-storage)                                                                                                                                                                                        |
| `session_store_flush`         | `Literal["batched", "eager"]`                                                         | `"batched"`                          | 何时将镜像的转录条目刷新到 `session_store`。`"batched"` 在每轮次或缓冲区填满时刷新一次；`"eager"` 在每帧后触发后台刷新。当 `session_store` 为 `None` 时忽略                                                                                                                                            |

#### 处理缓慢或停滞的 API 响应

CLI 子进程会读取几个环境变量来控制 API 超时和停滞检测。通过 `ClaudeAgentOptions.env` 传递它们：
```python
options = ClaudeAgentOptions(
    env={
        "API_TIMEOUT_MS": "120000",
        "CLAUDE_CODE_MAX_RETRIES": "2",
        "CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS": "120000",
    },
)
```
* `API_TIMEOUT_MS`：Anthropic 客户端的每请求超时时间，单位为毫秒。默认值 `600000`。适用于主循环及所有子代理。
* `CLAUDE_CODE_MAX_RETRIES`：最大 API 重试次数。默认值 `10`。每次重试都有其独立的 `API_TIMEOUT_MS` 时间窗口，因此最坏情况下的墙钟时间大约为 `API_TIMEOUT_MS × (CLAUDE_CODE_MAX_RETRIES + 1)` 再加上退避时间。
* `CLAUDE_ASYNC_AGENT_STAL
```python
# Expected dict shape for output_format
{
    "type": "json_schema",
    "schema": {...},  # Your JSON Schema definition
}
```
| 字段     | 是否必需 | 描述                                            |
| :------- | :------- | :---------------------------------------------- |
| `type`   | 是       | 用于 JSON Schema 验证时必须为 `"json_schema"`   |
| `schema` | 是       | 用于输出验证的 JSON Schema 定义                 |

### `SystemPromptPreset`

配置用于 Claude Code 的预设系统提示词并可选择性添加内容。
```python
class SystemPromptPreset(TypedDict):
    type: Literal["preset"]
    preset: Literal["claude_code"]
    append: NotRequired[str]
    exclude_dynamic_sections: NotRequired[bool]
```
| 字段                         | 必填 | 描述                                                                                                                                                                                                                                                                                                                         |
| :--------------------------- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                       | 是   | 必须为 `"preset"` 以使用预设系统提示词                                                                                                                                                                                                                                                                                       |
| `preset`                     | 是   | 必须为 `"claude_code"` 以使用 Claude Code 的系统提示词                                                                                                                                                                                                                                                                       |
| `append`                     | 否   | 要附加到预设系统提示词的额外指令                                                                                                                                                                                                                                                                                             |
| `exclude_dynamic_sections`   | 否   | 将每会话上下文（如工作目录、git-repo 标志和自动记忆路径）从系统提示词移至第一条用户消息。这可以提升跨用户和机器的提示词缓存复用率。参见 [修改系统提示词](/zh/agent-sdk/modifying-system-prompts#improve-prompt-caching-across-users-and-machines) |

### `SettingSource`

控制 SDK 从哪些基于文件系统的配置源加载设置。
```python
SettingSource = Literal["user", "project", "local"]
```
| 值             | 描述                                         | 位置                          |
| :---------- | :------------------------------------------- | :---------------------------- |
| `"user"`    | 全局用户设置                                 | `~/.claude/settings.json`     |
| `"project"` | 共享项目设置（受版本控制）                   | `.claude/settings.json`       |
| `"local"`   | 本地项目设置（已被git忽略）                  | `.claude/settings.local.json` |

#### 默认行为

当 `setting_sources` 被省略或为 `None` 时，`query()` 会加载与 Claude Code CLI 相同的文件系统设置：用户、项目和本地。托管策略设置在所有情况下都会被加载。请参阅[设置来源不控制哪些内容](/zh-cn/agent-sdk/claude-code-features#what-settingsources-does-not-control)了解哪些输入会在此选项之外被读取，以及如何禁用它们。

#### 为何使用 setting\_sources

**禁用文件系统设置：**
```python
# Do not load user, project, or local settings from disk
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Analyze this code",
    options=ClaudeAgentOptions(
        setting_sources=[]
    ),
):
    print(message)
```


  在 Python SDK 0.1.59 及更早版本中，空列表与省略该选项的效果相同，因此 `setting_sources=[]` 并不会禁用文件系统设置。若您需要空列表生效，请升级到新版本。TypeScript SDK 不受此影响。

**明确加载所有文件系统设置：**
```python
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Analyze this code",
    options=ClaudeAgentOptions(
        setting_sources=["user", "project", "local"]
    ),
):
    print(message)
```
**仅加载特定设置来源：**
```python
# Load only project settings, ignore user and local
async for message in query(
    prompt="Run CI checks",
    options=ClaudeAgentOptions(
        setting_sources=["project"]  # Only .claude/settings.json
    ),
):
    print(message)
```
**测试与CI环境：**
```python
# Ensure consistent behavior in CI by excluding local settings
async for message in query(
    prompt="Run tests",
    options=ClaudeAgentOptions(
        setting_sources=["project"],  # Only team-shared settings
        permission_mode="bypassPermissions",
    ),
):
    print(message)
```
**仅限SDK的应用程序：**
```python
# Define everything programmatically.
# Pass [] to opt out of filesystem setting sources.
async for message in query(
    prompt="Review this PR",
    options=ClaudeAgentOptions(
        setting_sources=[],
        agents={...},
        mcp_servers={...},
        allowed_tools=["Read", "Grep", "Glob"],
    ),
):
    print(message)
```
**正在加载 CLAUDE.md 项目指令：**
```python
# Load project settings to include CLAUDE.md files
async for message in query(
    prompt="Add a new feature following project conventions",
    options=ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",  # Use Claude Code's system prompt
        },
        setting_sources=["project"],  # Loads CLAUDE.md from project
        allowed_tools=["Read", "Write", "Edit"],
    ),
):
    print(message)
```
#### 设置优先级

当加载多个来源时，设置将按此优先级合并（从高到低）：

1. 本地设置（`.claude/settings.local.json`）
2. 项目设置（`.claude/settings.json`）
3. 用户设置（`~/.claude/settings.json`）

程序化选项（如 `agents` 和 `allowed_tools`）会覆盖用户、项目和本地文件系统的设置。托管策略设置优先于程序化选项。

### `AgentDefinition`

以程序化方式定义的子代理配置。
```python
@dataclass
class AgentDefinition:
    description: str
    prompt: str
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```
| 字段              | 必填 | 描述                                                                                                                                                           |
| :---------------- | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | 是   | 自然语言描述，说明何时使用此代理                                                                                                                               |
| `prompt`          | 是   | 代理的系统提示词                                                                                                                                               |
| `tools`           | 否   | 允许使用的工具名称数组。如果省略，则继承所有工具                                                                                                               |
| `disallowedTools` | 否   | 要从代理工具集中移除的工具名称数组                                                                                                                             |
| `model`           | 否   | 此代理的模型覆盖。可接受别名如 `"sonnet"`、`"opus"`、`"haiku"` 或 `"inherit"`，或完整的模型 ID。如果省略，则使用主模型                                           |
| `skills`          | 否   | 要在启动时预加载到代理上下文中的技能名称列表。未列出的技能仍可通过技能工具调用                                                                                 |
| `memory`          | 否   | 此代理的内存来源：`"user"`、`"project"` 或 `"local"`                                                                                                           |
| `mcpServers`      | 否   | 此代理可用的 MCP 服务器。每个条目是一个服务器名称或内联的 `{name: config}` 字典                                                                                |
| `initialPrompt`   | 否   | 当此代理作为主线程代理运行时，自动作为第一个用户轮次提交的内容                                                                                                 |
| `maxTurns`        | 否   | 代理停止前的最大代理轮次次数                                                                                                                                   |
| `background`      | 否   | 调用时将此代理作为非阻塞后台任务运行                                                                                                                           |
| `effort`          | 否   | 此代理的推理努力程度级别。接受命名级别或整数。参见 [`EffortLevel`](#effortlevel)                                                                                |
| `permissionMode`  | 否   | 此代理内工具执行的权限模式。参见 [`PermissionMode`](#canusetool)                                                                                           |

  `AgentDefinition` 字段名称使用驼峰命名法，例如 `disallowedTools`、`permissionMode` 和 `maxTurns`。这些名称直接映射到与 TypeScript SDK 共享的在线格式。这与 `ClaudeAgentOptions` 不同，后者对等效的顶层字段（如 `disallowed_tools` 和 `permission_mode`）使用 Python 的蛇形命名法。由于 `AgentDefinition` 是一个数据类，传递蛇形命名法的关键词会在构造时引发 `TypeError`。

### `权限模式`
用于控制工具执行的权限模式。
```python
PermissionMode = Literal[
    "default",  # Standard permission behavior
    "acceptEdits",  # Auto-accept file edits
    "plan",  # Planning mode - read-only tools only
    "dontAsk",  # Deny anything not pre-approved instead of prompting
    "bypassPermissions",  # Bypass all permission checks (use with caution)
]
```
### `EffortLevel`

用于引导思考深度的努力级别。
```python
EffortLevel = Literal[
    "low",  # Minimal thinking, fastest responses
    "medium",  # Moderate thinking
    "high",  # Deep reasoning
    "xhigh",  # Extended reasoning (Opus 4.7 only; falls back to "high" on other models)
    "max",  # Maximum effort
]
```
### `CanUseTool`

用于工具权限回调函数的类型别名。
```python
CanUseTool = Callable[
    [str, dict[str, Any], ToolPermissionContext], Awaitable[PermissionResult]
]
```
该回调函数接收：

* `tool_name`：被调用工具的名称
* `input_data`：工具的输入参数
* `context`：包含额外信息的 `ToolPermissionContext`

返回一个 `PermissionResult`（可以是 `PermissionResultAllow` 或 `PermissionResultDeny`）。

### `ToolPermissionContext`

传递给工具权限回调函数的上下文信息。
```python
@dataclass
class ToolPermissionContext:
    signal: Any | None = None  # Future: abort signal support
    suggestions: list[PermissionUpdate] = field(default_factory=list)
    blocked_path: str | None = None
    decision_reason: str | None = None
    title: str | None = None
    display_name: str | None = None
    description: str | None = None
```
| 字段              | 类型                     | 描述                                                                                                                                                                                                                                 |
| :---------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signal`          | `Any \| None`            | 为未来中断信号支持保留                                                                                                                                                                                                                |
| `suggestions`     | `list[PermissionUpdate]` | CLI 发出的权限更新建议。Bash 提示包含一条目标为 `localSettings` 的建议，因此在 `updated_permissions` 中返回它会将规则写入 `.claude/settings.local.json`，并在会话间持久化。                                                                |
| `blocked_path`    | `str \| None`            | 触发权限请求的文件路径（如适用）。例如，当 Bash 命令试图访问允许目录之外的路径时                                                                                                                                                       |
| `decision_reason` | `str \| None`            | 触发此权限请求的原因。当 PreToolUse 钩子返回 `"ask"` 时，会转发该钩子的 `permissionDecisionReason`                                                                                                                                     |
| `title`           | `str \| None`            | 完整的权限提示句子，例如 `Claude wants to read foo.txt`。存在时用作主要提示文本                                                                                                                                                         |
| `display_name`    | `str \| None`            | 工具操作的简短名词短语，例如 `Read file`，适合作为按钮标签                                                                                                                                                                             |
| `description`     | `str \| None`            | 权限 UI 的人类可读副标题                                                                                                                                                                                                               |

### `PermissionResult`

权限回调函数的联合类型。
```python
PermissionResult = PermissionResultAllow | PermissionResultDeny
```
### `PermissionResultAllow`

指示应允许工具调用的结果。
```python
@dataclass
class PermissionResultAllow:
    behavior: Literal["allow"] = "allow"
    updated_input: dict[str, Any] | None = None
    updated_permissions: list[PermissionUpdate] | None = None
```
| 字段                  | 类型                             | 默认值    | 描述                                      |
| :-------------------- | :------------------------------- | :-------- | :---------------------------------------- |
| `behavior`            | `Literal["allow"]`               | `"allow"` | 必须为 "allow"                            |
| `updated_input`       | `dict[str, Any] \| None`         | `None`    | 替换原始输入的修改后输入                  |
| `updated_permissions` | `list[PermissionUpdate] \| None` | `None`    | 要应用的权限更新                          |

### `PermissionResultDeny`

表示应拒绝工具调用的结果。
```python
@dataclass
class PermissionResultDeny:
    behavior: Literal["deny"] = "deny"
    message: str = ""
    interrupt: bool = False
```
| 字段        | 类型              | 默认值   | 描述                                |
| :---------- | :---------------- | :------- | :----------------------------------------- |
| `behavior`  | `Literal["deny"]` | `"deny"` | 必须为 "deny"                             |
| `message`   | `str`             | `""`     | 解释工具被拒绝原因的信息 |
| `interrupt` | `bool`            | `False`  | 是否中断当前执行 |

### `PermissionUpdate`

以编程方式更新权限的配置。
```python
@dataclass
class PermissionUpdate:
    type: Literal[
        "addRules",
        "replaceRules",
        "removeRules",
        "setMode",
        "addDirectories",
        "removeDirectories",
    ]
    rules: list[PermissionRuleValue] | None = None
    behavior: Literal["allow", "deny", "ask"] | None = None
    mode: PermissionMode | None = None
    directories: list[str] | None = None
    destination: (
        Literal["userSettings", "projectSettings", "localSettings", "session"] | None
    ) = None
```
| 字段          | 类型                                      | 描述                                            |
| :------------ | :---------------------------------------- | :---------------------------------------------- |
| `type`        | `Literal[...]`                            | 权限更新操作的类型                              |
| `rules`       | `list[PermissionRuleValue] \| None`       | 用于添加/替换/移除操作的规则                    |
| `behavior`    | `Literal["allow", "deny", "ask"] \| None` | 基于规则的操作行为                              |
| `mode`        | `PermissionMode \| None`                  | setMode 操作的模式                              |
| `directories` | `list[str] \| None`                       | 用于添加/移除目录操作的目录列表                 |
| `destination` | `Literal[...] \| None`                    | 权限更新的应用位置                              |

### `PermissionRuleValue`

在权限更新中需要添加、替换或移除的规则。
```python
@dataclass
class PermissionRuleValue:
    tool_name: str
    rule_content: str | None = None
```
### `ToolsPreset`

用于使用 Claude Code 默认工具集的预设工具配置。
```python
class ToolsPreset(TypedDict):
    type: Literal["preset"]
    preset: Literal["claude_code"]
```
### `ThinkingConfig`

控制扩展思考行为。这是三种配置的联合体：
```python
ThinkingDisplay = Literal["summarized", "omitted"]


class ThinkingConfigAdaptive(TypedDict):
    type: Literal["adaptive"]
    display: NotRequired[ThinkingDisplay]


class ThinkingConfigEnabled(TypedDict):
    type: Literal["enabled"]
    budget_tokens: int
    display: NotRequired[ThinkingDisplay]


class ThinkingConfigDisabled(TypedDict):
    type: Literal["disabled"]


ThinkingConfig = ThinkingConfigAdaptive | ThinkingConfigEnabled | ThinkingConfigDisabled
```
| 变体        | 字段                             | 描述                                        |
| :---------- | :------------------------------- | :------------------------------------------ |
| `adaptive`  | `type`, `display`                | Claude 自适应决定何时进行思考               |
| `enabled`   | `type`, `budget_tokens`, `display` | 启用思考功能并设定特定的 token 预算         |
| `disabled`  | `type`                           | 禁用思考功能                                |

可选的 `display` 字段控制思考文本是返回 `"summarized"`（汇总）还是 `"omitted"`（省略）。在 Claude Opus 4.7 及更高版本中，API 默认值为 `"omitted"`，因此请设置 `"summarized"` 以便在 [`ThinkingBlock`](#thinkingblock) 输出中接收思考内容。

由于这些是 `TypedDict` 类，它们在运行时是普通的字典。可以将它们构造为字典字面量或像构造函数一样调用类；两者都会生成一个 `dict`。使用 `config["budget_tokens"]` 访问字段，而不是 `config.budget_tokens`。
```python
from claude_agent_sdk import ClaudeAgentOptions, ThinkingConfigEnabled

# Option 1: dict literal (recommended, no import needed)
options = ClaudeAgentOptions(thinking={"type": "enabled", "budget_tokens": 20000})

# Option 2: constructor-style (returns a plain dict)
config = ThinkingConfigEnabled(type="enabled", budget_tokens=20000)
print(config["budget_tokens"])  # 20000
# config.budget_tokens would raise AttributeError
```
### `SdkBeta`

SDK 测试版功能的字面量类型。
```python
SdkBeta = Literal["context-1m-2025-08-07"]
```
与 `ClaudeAgentOptions` 中的 `betas` 字段配合使用，以启用 beta 功能。

  自2026年4月30日起，`context-1m-2025-08-07` beta 已退役。为 Claude Sonnet 4.5 或 Sonnet 4 传递此标头将无任何效果，超出标准 200k token 上下文窗口的请求将返回错误。要使用 1M token 上下文窗口，请迁移至 [Claude Sonnet 4.6、Claude Opus 4.6 或 Claude Opus 4.7](https://platform.claude.com/docs/en/about-claude/models/overview)，这些模型在标准定价下包含 1M 上下文，且无需 beta 标头。

### `McpSdkServerConfig`

通过 `create_sdk_mcp_server()` 创建的 SDK MCP 服务器的配置。
```python
class McpSdkServerConfig(TypedDict):
    type: Literal["sdk"]
    name: str
    instance: Any  # MCP Server instance
```
### `McpServerConfig`

用于MCP服务器配置的联合类型。
```python
McpServerConfig = (
    McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfig
)
```
#### `Mcp标准输入输出服务器配置`
```python
class McpStdioServerConfig(TypedDict):
    type: NotRequired[Literal["stdio"]]  # Optional for backwards compatibility
    command: str
    args: NotRequired[list[str]]
    env: NotRequired[dict[str, str]]
```
#### `McpSSEServerConfig`
```python
class McpSSEServerConfig(TypedDict):
    type: Literal["sse"]
    url: str
    headers: NotRequired[dict[str, str]]
```
#### `McpHttpServerConfig`
```python
class McpHttpServerConfig(TypedDict):
    type: Literal["http"]
    url: str
    headers: NotRequired[dict[str, str]]
```
### `McpServerStatusConfig`

由 [`get_mcp_status()`](#上下文管理器支持) 方法报告的 MCP 服务器配置。它是所有 [`McpServerConfig`](#mcpserverconfig) 传输变体的联合，外加一个仅输出的 `claudeai-proxy` 变体，用于通过 claude.ai 代理的服务器。
```python
McpServerStatusConfig = (
    McpStdioServerConfig
    | McpSSEServerConfig
    | McpHttpServerConfig
    | McpSdkServerConfigStatus
    | McpClaudeAIProxyServerConfig
)
```
`McpSdkServerConfigStatus` 是 [`McpSdkServerConfig`](#mcpsdkserverconfig) 的可序列化形式，仅包含 `type`（`"sdk"`）和 `name`（`str`）字段；进程内 `instance` 被省略。`McpClaudeAIProxyServerConfig` 具有 `type`（`"claudeai-proxy"`）、`url`（`str`）和 `id`（`str`）字段。

### `McpStatusResponse`

来自 [`ClaudeSDKClient.get_mcp_status()`](#上下文管理器支持) 的响应。在 `mcpServers` 键下封装了服务器状态列表。
```python
class McpStatusResponse(TypedDict):
    mcpServers: list[McpServerStatus]
```
### `McpServerStatus`

已连接MCP服务器的状态，包含在 [`McpStatusResponse`](#mcpstatusresponse) 中。
```python
class McpServerStatus(TypedDict):
    name: str
    status: McpServerConnectionStatus  # "connected" | "failed" | "needs-auth" | "pending" | "disabled"
    serverInfo: NotRequired[McpServerInfo]
    error: NotRequired[str]
    config: NotRequired[McpServerStatusConfig]
    scope: NotRequired[str]
    tools: NotRequired[list[McpToolInfo]]
```
| 字段         | 类型                                                         | 描述                                                                                                                                                                      |
| :----------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`       | `str`                                                        | 服务器名称                                                                                                                                                                |
| `status`     | `str`                                                        | 状态之一：`"connected"`（已连接）、`"failed"`（失败）、`"needs-auth"`（需要认证）、`"pending"`（待处理）或 `"disabled"`（已禁用）                                               |
| `serverInfo` | `dict` (可选)                                                | 服务器名称和版本 (`{"name": str, "version": str}`)                                                                                                                         |
| `error`      | `str` (可选)                                                 | 连接失败时的错误信息                                                                                                                                                      |
| `config`     | [`McpServerStatusConfig`](#mcpserverstatusconfig) (可选)     | 服务器配置。结构与 [`McpServerConfig`](#mcpserverconfig) 相同（stdio、SSE、HTTP 或 SDK），另外还包括一个用于通过 claude.ai 连接的服务器的 `claudeai-proxy` 变体                 |
| `scope`      | `str` (可选)                                                 | 配置作用域                                                                                                                                                                |
| `tools`      | `list` (可选)                                                | 此服务器提供的工具，每个工具包含 `name`、`description` 和 `annotations` 字段                                                                                               |

### `SdkPluginConfig`

用于在 SDK 中加载插件的配置。
```python
class SdkPluginConfig(TypedDict):
    type: Literal["local"]
    path: str
```
| 字段    | 类型               | 说明                                                     |
| :------ | :----------------- | :------------------------------------------------------- |
| `type`  | `Literal["local"]` | 必须为 `"local"`（当前仅支持本地插件）                   |
| `path`  | `str`              | 插件目录的绝对或相对路径                                 |

**示例：**
```python
plugins = [
    {"type": "local", "path": "./my-plugin"},
    {"type": "local", "path": "/absolute/path/to/plugin"},
]
```
有关创建和使用插件的完整信息，请参阅 [Plugins](/zh/agent-sdk/plugins)。

## 消息类型

### `Message`

所有可能消息的联合类型。
```python
Message = (
    UserMessage
    | AssistantMessage
    | SystemMessage
    | ResultMessage
    | StreamEvent
    | RateLimitEvent
)
```
### `UserMessage`

用户输入消息。
```python
@dataclass
class UserMessage:
    content: str | list[ContentBlock]
    uuid: str | None = None
    parent_tool_use_id: str | None = None
    tool_use_result: dict[str, Any] | None = None
```
| 字段                   | 类型                        | 描述                                             |
| :------------------- | :-------------------------- | :----------------------------------------------- |
| `content`            | `str \| list[ContentBlock]` | 消息内容，可为文本或内容块                             |
| `uuid`               | `str \| None`               | 唯一消息标识符                                     |
| `parent_tool_use_id` | `str \| None`               | 若此消息是工具结果响应，则为工具使用 ID                   |
| `tool_use_result`    | `dict[str, Any] \| None`    | 若适用，为工具结果数据                               |

### `AssistantMessage`

包含内容块的助手响应消息。
```python
@dataclass
class AssistantMessage:
    content: list[ContentBlock]
    model: str
    parent_tool_use_id: str | None = None
    error: AssistantMessageError | None = None
    usage: dict[str, Any] | None = None
    message_id: str | None = None
```
| 字段                  | 类型                                                         | 描述                                                                   |
| :-------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------- |
| `content`             | `list[ContentBlock]`                                         | 响应中的内容块列表                                                     |
| `model`               | `str`                                                        | 生成该响应的模型                                                       |
| `parent_tool_use_id`  | `str \| None`                                                | 如果是嵌套响应，则为工具使用 ID                                       |
| `error`               | [`AssistantMessageError`](#assistantmessageerror) ` \| None` | 如果响应遇到错误，则为错误类型                                         |
| `usage`               | `dict[str, Any] \| None`                                     | 每条消息的 token 用量（键与 [`ResultMessage.usage`](#resultmessage) 相同） |
| `message_id`          | `str \| None`                                                | API 消息 ID。一次对话中的多条消息共享相同的 ID                         |

### `AssistantMessageError`

助理消息可能的错误类型。
```python
AssistantMessageError = Literal[
    "authentication_failed",
    "billing_error",
    "rate_limit",
    "invalid_request",
    "server_error",
    "max_output_tokens",
    "unknown",
]
```
### `SystemMessage`

带有元数据的系统消息。
```python
@dataclass
class SystemMessage:
    subtype: str
    data: dict[str, Any]
```
### `ResultMessage`

最终结果消息，包含成本和用量信息。
```python
@dataclass
class ResultMessage:
    subtype: str
    duration_ms: int
    duration_api_ms: int
    is_error: bool
    num_turns: int
    session_id: str
    stop_reason: str | None = None
    total_cost_usd: float | None = None
    usage: dict[str, Any] | None = None
    result: str | None = None
    structured_output: Any = None
    model_usage: dict[str, Any] | None = None
    permission_denials: list[Any] | None = None
    deferred_tool_use: DeferredToolUse | None = None
    errors: list[str] | None = None
    api_error_status: int | None = None
    uuid: str | None = None
```
当存在时，`usage` 字典包含以下键：

| 键                              | 类型  | 描述                         |
| ------------------------------- | ----- | ---------------------------- |
| `input_tokens`                  | `int` | 消耗的总输入 token 数。      |
| `output_tokens`                 | `int` | 生成的总输出 token 数。      |
| `cache_creation_input_tokens`   | `int` | 用于创建新缓存条目的 token。 |
| `cache_read_input_tokens`       | `int` | 从现有缓存条目读取的 token。 |

`model_usage` 字典将模型名称映射到每个模型的使用量。内层字典的键使用驼峰式命名，因为其值是直接从底层 CLI 进程传递过来的，与 TypeScript 的 [`ModelUsage`](/zh/agent-sdk/typescript#modelusage) 类型一致：

| 键                           | 类型    | 描述                                                                                             |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `inputTokens`                | `int`   | 此模型的输入 token。                                                                             |
| `outputTokens`               | `int`   | 此模型的输出 token。                                                                             |
| `cacheReadInputTokens`       | `int`   | 此模型的缓存读取 token。                                                                         |
| `cacheCreationInputTokens`   | `int`   | 此模型的缓存创建 token。                                                                         |
| `webSearchRequests`          | `int`   | 此模型发起的网页搜索请求。                                                                       |
| `costUSD`                    | `float` | 此模型的估算费用（美元），由客户端计算。有关计费注意事项，请参见[跟踪成本和使用量](/zh/agent-sdk/cost-tracking)。 |
| `contextWindow`              | `int`   | 此模型的上下文窗口大小。                                                                         |
| `maxOutputTokens`            | `int`   | 此模型的最大输出 token 限制。                                                                    |

### `StreamEvent`

流式传输期间用于部分消息更新的流事件。仅当 `ClaudeAgentOptions` 中设置了 `include_partial_messages=True` 时才会收到。通过 `from claude_agent_sdk.types import StreamEvent` 导入。
```python
@dataclass
class StreamEvent:
    uuid: str
    session_id: str
    event: dict[str, Any]  # The raw Claude API stream event
    parent_tool_use_id: str | None = None
```
| 字段                 | 类型             | 描述                                               |
| :------------------- | :--------------- | :------------------------------------------------- |
| `uuid`               | `str`            | 此事件的唯一标识符                                 |
| `session_id`         | `str`            | 会话标识符                                         |
| `event`              | `dict[str, Any]` | 原始 Claude API 流式事件数据                       |
| `parent_tool_use_id` | `str \| None`    | 父级工具使用 ID（如果此事件来自子代理）             |

### `RateLimitEvent`

当速率限制状态发生变化时触发（例如，从 `"allowed"` 变为 `"allowed_warning"`）。可利用此事件在用户触及硬性限制前发出警告，或在状态为 `"rejected"` 时进行退避处理。
```python
@dataclass
class RateLimitEvent:
    rate_limit_info: RateLimitInfo
    uuid: str
    session_id: str
```
| 字段              | 类型                              | 描述              |
| :---------------- | :-------------------------------- | :----------------------- |
| `rate_limit_info` | [`RateLimitInfo`](#ratelimitinfo) | 当前速率限制状态 |
| `uuid`            | `str`                             | 唯一事件标识符  |
| `session_id`      | `str`                             | 会话标识符       |

### `RateLimitInfo`

[`RateLimitEvent`](#ratelimitevent) 携带的速率限制状态。
```python
RateLimitStatus = Literal["allowed", "allowed_warning", "rejected"]
RateLimitType = Literal[
    "five_hour", "seven_day", "seven_day_opus", "seven_day_sonnet", "overage"
]


@dataclass
class RateLimitInfo:
    status: RateLimitStatus
    resets_at: int | None = None
    rate_limit_type: RateLimitType | None = None
    utilization: float | None = None
    overage_status: RateLimitStatus | None = None
    overage_resets_at: int | None = None
    overage_disabled_reason: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)
```
| 字段                      | 类型                      | 描述                                                                                                |
| :------------------------ | :------------------------ | :-------------------------------------------------------------------------------------------------- |
| `status`                  | `RateLimitStatus`         | 当前状态。`"allowed_warning"` 表示接近限制；`"rejected"` 表示已达限制。                               |
| `resets_at`               | `int \| None`             | 速率限制窗口重置的 Unix 时间戳                                                                      |
| `rate_limit_type`         | `RateLimitType \| None`   | 适用的速率限制窗口类型                                                                              |
| `utilization`             | `float \| None`           | 已消耗的速率限制比例（0.0 到 1.0）                                                                  |
| `overage_status`          | `RateLimitStatus \| None` | 按使用量付费的超额使用状态（如适用）                                                                |
| `overage_resets_at`       | `int \| None`             | 超额使用窗口重置的 Unix 时间戳                                                                      |
| `overage_disabled_reason` | `str \| None`             | 当状态为 `"rejected"` 时，超额使用不可用的原因                                                       |
| `raw`                     | `dict[str, Any]`          | 来自 CLI 的完整原始字典，包括以上未建模的字段                                                       |

### `TaskStartedMessage`

在后台任务开始时发出。后台任务是指在主对话轮次之外被跟踪的任何内容：一个被置于后台的 Bash 命令、一个 [Monitor](#monitor) 监视、一个通过 Agent 工具生成的子代理或一个远程代理。`task_type` 字段会指明具体是哪一种。此命名与将 `Task` 工具重命名为 `Agent` 工具无关。
```python
@dataclass
class TaskStartedMessage(SystemMessage):
    task_id: str
    description: str
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    task_type: str | None = None
```
| 字段            | 类型          | 描述                                                                                                                 |
| :------------ | :------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| `task_id`     | `str`         | 任务的唯一标识符                                                                                              |
| `description` | `str`         | 任务描述                                                                                                     |
| `uuid`        | `str`         | 唯一消息标识符                                                                                                   |
| `session_id`  | `str`         | 会话标识符                                                                                                          |
| `tool_use_id` | `str \| None` | 关联的工具使用 ID                                                                                                      |
| `task_type`   | `str \| None` | 后台任务类型：`"local_bash"` 用于后台 Bash 和监控监视器，`"local_agent"`，或 `"remote_agent"` |

### `TaskUsage`

后台任务的 token 和时序数据。
```python
class TaskUsage(TypedDict):
    total_tokens: int
    tool_uses: int
    duration_ms: int
```
### `TaskProgressMessage`

定期发出，用于提供正在运行的后台任务的进度更新。
```python
@dataclass
class TaskProgressMessage(SystemMessage):
    task_id: str
    description: str
    usage: TaskUsage
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    last_tool_name: str | None = None
```
| 字段               | 类型            | 描述                           |
| :----------------- | :-------------- | :----------------------------- |
| `task_id`        | `str`         | 任务的唯一标识符               |
| `description`    | `str`         | 当前状态描述                   |
| `usage`          | `TaskUsage`   | 此任务迄今为止的 token 使用量 |
| `uuid`           | `str`         | 消息的唯一标识符               |
| `session_id`     | `str`         | 会话标识符                     |
| `tool_use_id`    | `str \| None` | 关联的工具使用 ID              |
| `last_tool_name` | `str \| None` | 任务最后使用的工具名称         |

### `TaskNotificationMessage`

当后台任务完成、失败或停止时发出通知。后台任务包括 `run_in_background` Bash 命令、Monitor 监视以及后台子代理。
```python
@dataclass
class TaskNotificationMessage(SystemMessage):
    task_id: str
    status: TaskNotificationStatus  # "completed" | "failed" | "stopped"
    output_file: str
    summary: str
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    usage: TaskUsage | None = None
```
| 字段            | 类型                     | 描述                                       |
| :------------ | :----------------------- | :----------------------------------------- |
| `task_id`     | `str`                    | 任务的唯一标识符                               |
| `status`      | `TaskNotificationStatus` | 状态，取值为 `"completed"`、`"failed"` 或 `"stopped"` 之一 |
| `output_file` | `str`                    | 任务输出文件的路径                              |
| `summary`     | `str`                    | 任务结果的摘要                                |
| `uuid`        | `str`                    | 唯一的消息标识符                               |
| `session_id`  | `str`                    | 会话标识符                                  |
| `tool_use_id` | `str \| None`            | 关联的工具使用 ID                             |
| `usage`       | `TaskUsage \| None`      | 任务的最终 token 使用量                        |

## 内容块类型

### `ContentBlock`

所有内容块的联合类型。
```python
ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock
```
### `TextBlock`

文本内容块。
```python
@dataclass
class TextBlock:
    text: str
```
### `ThinkingBlock`

思考内容区块（适用于具备思考能力的模型）。
```python
@dataclass
class ThinkingBlock:
    thinking: str
    signature: str
```
### `ToolUseBlock`

工具使用请求块。
```python
@dataclass
class ToolUseBlock:
    id: str
    name: str
    input: dict[str, Any]
```
### `ToolResultBlock`

工具执行结果块。
```python
@dataclass
class ToolResultBlock:
    tool_use_id: str
    content: str | list[dict[str, Any]] | None = None
    is_error: bool | None = None
```
## 错误类型

### `ClaudeSDKError`

所有 SDK 错误的基类异常类。
```python
class ClaudeSDKError(Exception):
    """Base error for Claude SDK."""
```
### `CLINotFoundError`

当 Claude Code CLI 未安装或未找到时抛出。
```python
class CLINotFoundError(CLIConnectionError):
    def __init__(
        self, message: str = "Claude Code not found", cli_path: str | None = None
    ):
        """
        Args:
            message: Error message (default: "Claude Code not found")
            cli_path: Optional path to the CLI that was not found
        """
```
### `CLIConnectionError`

当连接到 Claude Code 失败时抛出。
```python
class CLIConnectionError(ClaudeSDKError):
    """Failed to connect to Claude Code."""
```
### `ProcessError`

当Claude Code进程失败时抛出。
```python
class ProcessError(ClaudeSDKError):
    def __init__(
        self, message: str, exit_code: int | None = None, stderr: str | None = None
    ):
        self.exit_code = exit_code
        self.stderr = stderr
```
当 JSON 解析失败时引发。
```python
class CLIJSONDecodeError(ClaudeSDKError):
    def __init__(self, line: str, original_error: Exception):
        """
        Args:
            line: The line that failed to parse
            original_error: The original JSON decode exception
        """
        self.line = line
        self.original_error = original_error
```
## 钩子类型

有关使用钩子及常见模式的完整指南，请参阅[钩子指南](/zh/agent-sdk/hooks)。

### `HookEvent`
支持的钩子事件类型。
```python
HookEvent = Literal[
    "PreToolUse",  # Called before tool execution
    "PostToolUse",  # Called after tool execution
    "PostToolUseFailure",  # Called when a tool execution fails
    "UserPromptSubmit",  # Called when user submits a prompt
    "Stop",  # Called when stopping execution
    "SubagentStop",  # Called when a subagent stops
    "PreCompact",  # Called before message compaction
    "Notification",  # Called for notification events
    "SubagentStart",  # Called when a subagent starts
    "PermissionRequest",  # Called when a permission decision is needed
]
```


  TypeScript SDK 支持一些 Python 中尚不可用的额外钩子事件：`SessionStart`、`SessionEnd`、`Setup`、`TeammateIdle`、`TaskCompleted`、`ConfigChange`、`WorktreeCreate`、`WorktreeRemove`、`PostToolBatch` 和 `MessageDisplay`。

### `HookCallback`

钩子回调函数的类型定义。
```python
HookCallback = Callable[[HookInput, str | None, HookContext], Awaitable[HookJSONOutput]]
```
参数：

* `input`：强类型的钩子输入，基于 `hook_event_name` 带有可区分联合类型（参见 [`HookInput`](#hookinput)）
* `tool_use_id`：可选的工具使用标识符（用于与工具相关的钩子）
* `context`：包含额外信息的钩子上下文

返回一个 [`HookJSONOutput`](#hookjsonoutput)，可能包含：

* `decision`：`"block"` 用于阻止该操作
* `systemMessage`：显示给用户的警告消息
* `hookSpecificOutput`：钩子特定的输出数据

### `钩子上下文`

传递给钩子回调的上下文信息。
```python
class HookContext(TypedDict):
    signal: Any | None  # Future: abort signal support
```
### `HookMatcher`

用于将钩子匹配到特定事件或工具的配置。
```python
@dataclass
class HookMatcher:
    matcher: str | None = (
        None  # Tool name or pattern to match (e.g., "Bash", "Write|Edit")
    )
    hooks: list[HookCallback] = field(
        default_factory=list
    )  # List of callbacks to execute
    timeout: float | None = (
        None  # Timeout in seconds for all hooks in this matcher (default: 60)
    )
```
### `HookInput`

所有钩子输入类型的联合类型。实际类型取决于 `hook_event_name` 字段。
```python
HookInput = (
    PreToolUseHookInput
    | PostToolUseHookInput
    | PostToolUseFailureHookInput
    | UserPromptSubmitHookInput
    | StopHookInput
    | SubagentStopHookInput
    | PreCompactHookInput
    | NotificationHookInput
    | SubagentStartHookInput
    | PermissionRequestHookInput
)
```
### `BaseHookInput`

存在于所有钩子输入类型中的基础字段。
```python
class BaseHookInput(TypedDict):
    session_id: str
    transcript_path: str
    cwd: str
    permission_mode: NotRequired[str]
```
| 字段                | 类型             | 描述                               |
| :------------------ | :--------------- | :--------------------------------- |
| `session_id`        | `str`            | 当前会话标识符                     |
| `transcript_path`   | `str`            | 会话转录文件路径                   |
| `cwd`               | `str`            | 当前工作目录                       |
| `permission_mode`   | `str` (可选)     | 当前权限模式                       |

### `PreToolUseHookInput`

`PreToolUse` 钩子事件的输入数据。
```python
class PreToolUseHookInput(BaseHookInput):
    hook_event_name: Literal["PreToolUse"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_use_id: str
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```
| 字段                | 类型                      | 描述                                                  |
| :------------------ | :------------------------ | :---------------------------------------------------- |
| `hook_event_name`   | `Literal["PreToolUse"]`   | 始终为 "PreToolUse"                                   |
| `tool_name`         | `str`                     | 即将执行的工具名称                                    |
| `tool_input`        | `dict[str, Any]`          | 工具的输入参数                                        |
| `tool_use_id`       | `str`                     | 此次工具使用的唯一标识符                              |
| `agent_id`          | `str` (可选)              | 子代理标识符，当钩子在子代理内触发时存在              |
| `agent_type`        | `str` (可选)              | 子代理类型，当钩子在子代理内触发时存在                |

### `PostToolUseHookInput`

`PostToolUse` 钩子事件的输入数据。
```python
class PostToolUseHookInput(BaseHookInput):
    hook_event_name: Literal["PostToolUse"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_response: Any
    tool_use_id: str
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```
| 字段              | 类型                     | 描述                                                    |
| :---------------- | :----------------------- | :------------------------------------------------------- |
| `hook_event_name` | `Literal["PostToolUse"]` | 始终为 "PostToolUse"                                    |
| `tool_name`       | `str`                    | 已执行工具的名称                                         |
| `tool_input`      | `dict[str, Any]`         | 使用的输入参数                                           |
| `tool_response`   | `Any`                    | 工具执行后的响应                                         |
| `tool_use_id`     | `str`                    | 此次工具使用的唯一标识符                                 |
| `agent_id`        | `str` (可选)             | 子代理标识符，当钩子在子代理内触发时存在                 |
| `agent_type`      | `str` (可选)             | 子代理类型，当钩子在子代理内触发时存在                   |

### `PostToolUseFailureHookInput`

`PostToolUseFailure` 钩子事件的输入数据。在工具执行失败时调用。
```python
class PostToolUseFailureHookInput(BaseHookInput):
    hook_event_name: Literal["PostToolUseFailure"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_use_id: str
    error: str
    is_interrupt: NotRequired[bool]
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```
| 字段              | 类型                            | 描述                                                         |
| :---------------- | :------------------------------ | :----------------------------------------------------------- |
| `hook_event_name` | `Literal["PostToolUseFailure"]` | 始终为 "PostToolUseFailure"                                  |
| `tool_name`       | `str`                           | 失败的工具名称                                               |
| `tool_input`      | `dict[str, Any]`                | 使用的输入参数                                               |
| `tool_use_id`     | `str`                           | 此工具使用的唯一标识符                                       |
| `error`           | `str`                           | 来自失败执行的错误消息                                       |
| `is_interrupt`    | `bool` (可选)                   | 失败是否由中断引起                                           |
| `agent_id`        | `str` (可选)                    | 子代理标识符，当钩子在子代理内部触发时存在                   |
| `agent_type`      | `str` (可选)                    | 子代理类型，当钩子在子代理内部触发时存在                     |

### `UserPromptSubmitHookInput`

`UserPromptSubmit` 钩子事件的输入数据。
```python
class UserPromptSubmitHookInput(BaseHookInput):
    hook_event_name: Literal["UserPromptSubmit"]
    prompt: str
```
| 字段                | 类型                          | 描述                        |
| :---------------- | :---------------------------- | :-------------------------- |
| `hook_event_name` | `Literal["UserPromptSubmit"]` | 始终为 "UserPromptSubmit"   |
| `prompt`          | `str`                         | 用户提交的提示词              |

### `StopHookInput`

`Stop` 钩子事件的输入数据。
```python
class StopHookInput(BaseHookInput):
    hook_event_name: Literal["Stop"]
    stop_hook_active: bool
```
| 字段               | 类型              | 描述                     |
| :----------------- | :---------------- | :----------------------- |
| `hook_event_name`  | `Literal["Stop"]` | 始终为 "Stop"            |
| `stop_hook_active` | `bool`            | 是否激活停止钩子         |

### `SubagentStopHookInput`

`SubagentStop` 钩子事件的输入数据。
```python
class SubagentStopHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStop"]
    stop_hook_active: bool
    agent_id: str
    agent_transcript_path: str
    agent_type: str
```
| 字段                      | 类型                      | 描述                                   |
| :------------------------ | :------------------------ | :------------------------------------- |
| `hook_event_name`         | `Literal["SubagentStop"]` | 始终为 "SubagentStop"                  |
| `stop_hook_active`        | `bool`                    | 停止钩子是否处于活跃状态               |
| `agent_id`                | `str`                     | 子代理的唯一标识符                     |
| `agent_transcript_path`   | `str`                     | 子代理的转录文件路径                   |
| `agent_type`              | `str`                     | 子代理的类型                           |

### `PreCompactHookInput`

`PreCompact` 钩子事件的输入数据。
```python
class PreCompactHookInput(BaseHookInput):
    hook_event_name: Literal["PreCompact"]
    trigger: Literal["manual", "auto"]
    custom_instructions: str | None
```
| 字段                 | 类型                        | 描述                        |
| :-------------------- | :-------------------------- | :--------------------------------- |
| `hook_event_name`     | `Literal["PreCompact"]`     | 始终为 "PreCompact"                |
| `trigger`             | `Literal["manual", "auto"]` | 触发压缩的原因      |
| `custom_instructions` | `str \| None`               | 用于压缩的自定义指令 |

### `NotificationHookInput`

`Notification` 钩子事件的输入数据。
```python
class NotificationHookInput(BaseHookInput):
    hook_event_name: Literal["Notification"]
    message: str
    title: NotRequired[str]
    notification_type: str
```
| 字段                | 类型                      | 描述                        |
| :------------------ | :------------------------ | :-------------------------- |
| `hook_event_name`   | `Literal["Notification"]` | 始终为 "Notification"       |
| `message`           | `str`                     | 通知消息内容                |
| `title`             | `str` (可选)              | 通知标题                    |
| `notification_type` | `str`                     | 通知类型                    |

### `SubagentStartHookInput`

`SubagentStart` 钩子事件的输入数据。
```python
class SubagentStartHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStart"]
    agent_id: str
    agent_type: str
```
| 字段                | 类型                         | 描述                         |
| :---------------- | :------------------------- | :--------------------------------- |
| `hook_event_name` | `Literal["SubagentStart"]` | 始终为 "SubagentStart"             |
| `agent_id`        | `str`                      | 子代理的唯一标识符 |
| `agent_type`      | `str`                      | 子代理的类型               |

### `PermissionRequestHookInput`

`PermissionRequest` 钩子事件的输入数据。允许钩子以编程方式处理权限决策。
```python
class PermissionRequestHookInput(BaseHookInput):
    hook_event_name: Literal["PermissionRequest"]
    tool_name: str
    tool_input: dict[str, Any]
    permission_suggestions: NotRequired[list[Any]]
```
| 字段                       | 类型                             | 描述                                      |
| :------------------------- | :------------------------------- | :----------------------------------------- |
| `hook_event_name`          | `Literal["PermissionRequest"]`   | 始终为 "PermissionRequest"                 |
| `tool_name`                | `str`                            | 请求权限的工具名称                         |
| `tool_input`               | `dict[str, Any]`                 | 工具的输入参数                             |
| `permission_suggestions`   | `list[Any]` (可选)               | 来自 CLI 的建议权限更新                    |

### `HookJSONOutput`

钩子回调返回值的联合类型。
```python
HookJSONOutput = AsyncHookJSONOutput | SyncHookJSONOutput
```
#### `SyncHookJSONOutput`

带有控制和决策字段的同步钩子输出。
```python
class SyncHookJSONOutput(TypedDict):
    # Control fields
    continue_: NotRequired[bool]  # Whether to proceed (default: True)
    suppressOutput: NotRequired[bool]  # Hide stdout from transcript
    stopReason: NotRequired[str]  # Message when continue is False

    # Decision fields
    decision: NotRequired[Literal["block"]]
    systemMessage: NotRequired[str]  # Warning message for user
    reason: NotRequired[str]  # Feedback for Claude

    # Hook-specific output
    hookSpecificOutput: NotRequired[HookSpecificOutput]
```


  在 Python 代码中请使用 `continue_`（带下划线）。当发送至 CLI 时，它会自动转换为 `continue`。

#### `HookSpecificOutput`

包含钩子事件名称和事件特定字段的 `TypedDict`。具体结构取决于 `hookEventName` 的值。有关每个钩子事件可用字段的完整详情，请参阅[使用钩子控制执行](/zh/agent-sdk/hooks#outputs)。

这是一个由事件特定输出类型构成的可区分联合。`hookEventName` 字段决定了哪些字段是有效的。
```python
class PreToolUseHookSpecificOutput(TypedDict):
    hookEventName: Literal["PreToolUse"]
    permissionDecision: NotRequired[Literal["allow", "deny", "ask", "defer"]]
    permissionDecisionReason: NotRequired[str]
    updatedInput: NotRequired[dict[str, Any]]
    additionalContext: NotRequired[str]


class PostToolUseHookSpecificOutput(TypedDict):
    hookEventName: Literal["PostToolUse"]
    additionalContext: NotRequired[str]
    updatedToolOutput: NotRequired[Any]
    updatedMCPToolOutput: NotRequired[Any]  # Deprecated: use updatedToolOutput, which works for all tools


class PostToolUseFailureHookSpecificOutput(TypedDict):
    hookEventName: Literal["PostToolUseFailure"]
    additionalContext: NotRequired[str]


class UserPromptSubmitHookSpecificOutput(TypedDict):
    hookEventName: Literal["UserPromptSubmit"]
    additionalContext: NotRequired[str]


class NotificationHookSpecificOutput(TypedDict):
    hookEventName: Literal["Notification"]
    additionalContext: NotRequired[str]


class SubagentStartHookSpecificOutput(TypedDict):
    hookEventName: Literal["SubagentStart"]
    additionalContext: NotRequired[str]


class PermissionRequestHookSpecificOutput(TypedDict):
    hookEventName: Literal["PermissionRequest"]
    decision: dict[str, Any]


HookSpecificOutput = (
    PreToolUseHookSpecificOutput
    | PostToolUseHookSpecificOutput
    | PostToolUseFailureHookSpecificOutput
    | UserPromptSubmitHookSpecificOutput
    | NotificationHookSpecificOutput
    | SubagentStartHookSpecificOutput
    | PermissionRequestHookSpecificOutput
)
```
#### `AsyncHookJSONOutput`

异步钩子输出，用于延迟执行钩子。
```python
class AsyncHookJSONOutput(TypedDict):
    async_: Literal[True]  # Set to True to defer execution
    asyncTimeout: NotRequired[int]  # Timeout in milliseconds
```


  在 Python 代码中使用 `async_`（带下划线）。当发送到命令行界面时，它会自动转换为 `async`。

### 钩子使用示例

此示例注册了两个钩子：一个用于阻止 `rm -rf /` 等危险的 Bash 命令，另一个则记录所有工具使用情况以供审计。安全钩子仅对 Bash 命令生效（通过 `matcher` 匹配），而日志钩子则针对所有工具运行。
```python
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher, HookContext
from typing import Any


async def validate_bash_command(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """Validate and potentially block dangerous bash commands."""
    if input_data["tool_name"] == "Bash":
        command = input_data["tool_input"].get("command", "")
        if "rm -rf /" in command:
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Dangerous command blocked",
                }
            }
    return {}


async def log_tool_use(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """Log all tool usage for auditing."""
    print(f"Tool used: {input_data.get('tool_name')}")
    return {}


options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            HookMatcher(
                matcher="Bash", hooks=[validate_bash_command], timeout=120
            ),  # 2 min for validation
            HookMatcher(
                hooks=[log_tool_use]
            ),  # Applies to all tools (default 60s timeout)
        ],
        "PostToolUse": [HookMatcher(hooks=[log_tool_use])],
    }
)

async for message in query(prompt="Analyze this codebase", options=options):
    print(message)
```
## 工具输入/输出类型

所有内置 Claude Code 工具的输入/输出结构体文档。虽然 Python SDK 没有将这些类型导出，但它们代表了消息中工具输入和输出的结构。

### Agent

**工具名称：** `Agent`（原为 `Task`，后者仍作为别名接受）

**输入：**
```python
{
    "description": str,  # A short (3-5 word) description of the task
    "prompt": str,  # The task for the agent to perform
    "subagent_type": str,  # The type of specialized agent to use
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "result": str,  # Final result from the subagent
    "usage": dict | None,  # Token usage statistics
    "total_cost_usd": float | None,  # Estimated total cost in USD
    "duration_ms": int | None,  # Execution duration in milliseconds
}
```
### AskUserQuestion

**工具名称：** `AskUserQuestion`

在执行过程中向用户提出澄清问题。有关使用详情，请参阅[处理审批和用户输入](/zh/agent-sdk/user-input#handle-clarifying-questions)。

**输入：**
```python
{
    "questions": [  # Questions to ask the user (1-4 questions)
        {
            "question": str,  # The complete question to ask the user
            "header": str,  # Very short label displayed as a chip/tag (max 12 chars)
            "options": [  # The available choices (2-4 options)
                {
                    "label": str,  # Display text for this option (1-5 words)
                    "description": str,  # Explanation of what this option means
                }
            ],
            "multiSelect": bool,  # Set to true to allow multiple selections
        }
    ],
    "answers": dict[str, str | list[str]] | None,
    # User answers populated by the permission system. Multi-select
    # answers may be a list of labels or a comma-joined string
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "questions": [  # The questions that were asked
        {
            "question": str,
            "header": str,
            "options": [{"label": str, "description": str}],
            "multiSelect": bool,
        }
    ],
    "answers": dict[str, str],  # Maps question text to answer string
    # Multi-select answers are comma-separated
}
```
### Bash

**工具名称：** `Bash`

**输入：**
```python
{
    "command": str,  # The command to execute
    "timeout": int | None,  # Optional timeout in milliseconds (max 600000)
    "description": str | None,  # Clear, concise description (5-10 words)
    "run_in_background": bool | None,  # Set to true to run in background
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "output": str,  # Combined stdout and stderr output
    "exitCode": int,  # Exit code of the command
    "killed": bool | None,  # Whether command was killed due to timeout
    "shellId": str | None,  # Shell ID for background processes
}
```
### Monitor

**工具名称:** `Monitor`

运行后台脚本，并将每个标准输出行作为事件传递给 Claude，以便其无需轮询即可做出反应。Monitor 遵循与 Bash 相同的权限规则。有关行为和提供程序可用性，请参阅 [Monitor 工具参考](/zh/tools-reference#monitor-tool)。

**输入:**
```python
{
    "command": str,  # Shell script; each stdout line is an event, exit ends the watch
    "description": str,  # Short description shown in notifications
    "timeout_ms": int | None,  # Kill after this deadline (default 300000, max 3600000)
    "persistent": bool | None,  # Run for the lifetime of the session; stop with TaskStop
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "taskId": str,  # ID of the background monitor task
    "timeoutMs": int,  # Timeout deadline in milliseconds (0 when persistent)
    "persistent": bool | None,  # True when running until TaskStop or session end
}
```
### 编辑

**工具名称：** `Edit`

**输入：**
```python
{
    "file_path": str,  # The absolute path to the file to modify
    "old_string": str,  # The text to replace
    "new_string": str,  # The text to replace it with
    "replace_all": bool | None,  # Replace all occurrences (default False)
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Confirmation message
    "replacements": int,  # Number of replacements made
    "file_path": str,  # File path that was edited
}
```
### 读取

**工具名称:** `Read`

**输入:**
```python
{
    "file_path": str,  # The absolute path to the file to read
    "offset": int | None,  # The line number to start reading from
    "limit": int | None,  # The number of lines to read
}
```
**输出（文本文件）：**
```python
{
    "content": str,  # File contents with line numbers
    "total_lines": int,  # Total number of lines in file
    "lines_returned": int,  # Lines actually returned
}
```
**输出（图片）：**

以下输出专为图像生成模型设计。
```python
{
    "image": str,  # Base64 encoded image data
    "mime_type": str,  # Image MIME type
    "file_size": int,  # File size in bytes
}
```
### 写入

**工具名称：** `Write`

**输入：**
```python
{
    "file_path": str,  # The absolute path to the file to write
    "content": str,  # The content to write to the file
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Success message
    "bytes_written": int,  # Number of bytes written
    "file_path": str,  # File path that was written
}
```
### Glob

**工具名称:** `Glob`

**输入:**
```python
{
    "pattern": str,  # The glob pattern to match files against
    "path": str | None,  # The directory to search in (defaults to cwd)
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "matches": list[str],  # Array of matching file paths
    "count": int,  # Number of matches found
    "search_path": str,  # Search directory used
}
```
### Grep

**工具名称：** `Grep`

**输入：**
```python
{
    "pattern": str,  # The regular expression pattern
    "path": str | None,  # File or directory to search in
    "glob": str | None,  # Glob pattern to filter files
    "type": str | None,  # File type to search
    "output_mode": str | None,  # "content", "files_with_matches", or "count"
    "-i": bool | None,  # Case insensitive search
    "-n": bool | None,  # Show line numbers
    "-B": int | None,  # Lines to show before each match
    "-A": int | None,  # Lines to show after each match
    "-C": int | None,  # Lines to show before and after
    "head_limit": int | None,  # Limit output to first N lines/entries
    "multiline": bool | None,  # Enable multiline mode
}
```
**输出（内容模式）：**
```python
{
    "matches": [
        {
            "file": str,
            "line_number": int | None,
            "line": str,
            "before_context": list[str] | None,
            "after_context": list[str] | None,
        }
    ],
    "total_matches": int,
}
```
**输出（files\_with\_matches 模式）：**
```python
{
    "files": list[str],  # Files containing matches
    "count": int,  # Number of files with matches
}
```
### NotebookEdit

**工具名称:** `NotebookEdit`

**输入:**
```python
{
    "notebook_path": str,  # Absolute path to the Jupyter notebook
    "cell_id": str | None,  # The ID of the cell to edit
    "new_source": str,  # The new source for the cell
    "cell_type": "code" | "markdown" | None,  # The type of the cell
    "edit_mode": "replace" | "insert" | "delete" | None,  # Edit operation type
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Success message
    "edit_type": "replaced" | "inserted" | "deleted",  # Type of edit performed
    "cell_id": str | None,  # Cell ID that was affected
    "total_cells": int,  # Total cells in notebook after edit
}
```
### WebFetch

**工具名称：** `WebFetch`

**输入：**
```python
{
    "url": str,  # The URL to fetch content from
    "prompt": str,  # The prompt to run on the fetched content
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "bytes": int,  # Size of the fetched content in bytes
    "code": int,  # HTTP response code
    "codeText": str,  # HTTP response code text
    "result": str,  # Processed result from applying the prompt to the content
    "durationMs": int,  # Time to fetch and process the content, in milliseconds
    "url": str,  # URL that was fetched
}
```
### WebSearch

**工具名称：** `WebSearch`

**输入：**
`<e:search_query> [搜索查询] </e:search_query>`

**描述：**
使用 WebSearch 工具在互联网上搜索信息。当需要查找最新信息、验证事实或获取不在训练数据中的知识时，请使用此工具。
```python
{
    "query": str,  # The search query to use
    "allowed_domains": list[str] | None,  # Only include results from these domains
    "blocked_domains": list[str] | None,  # Never include results from these domains
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "query": str,  # The search query
    "results": list[str | {"tool_use_id": str, "content": list[{"title": str, "url": str}]}],
    "durationSeconds": float,  # Search duration in seconds
}
```
### 待办事项写入

**工具名称：** `TodoWrite`

  自 Claude Code v2.1.142 版本起，`TodoWrite` 默认禁用。请改用 `TaskCreate`、`TaskGet`、`TaskUpdate` 和 `TaskList`。请参阅[迁移至任务工具](/zh/agent-sdk/todo-tracking#migrate-to-task-tools)以更新您的监控代码，或设置 `CLAUDE_CODE_ENABLE_TASKS=0` 以恢复使用 `TodoWrite`。

请提供需要翻译的英文 Markdown 片段。
```python
{
    "todos": [
        {
            "content": str,  # The task description
            "status": "pending" | "in_progress" | "completed",  # Task status
            "activeForm": str,  # Active form of the description
        }
    ]
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Success message
    "stats": {"total": int, "pending": int, "in_progress": int, "completed": int},
}
```
### TaskCreate

**工具名称：** `TaskCreate`

**输入：**
```python
{
    "subject": str,  # Short task title
    "description": str,  # Detailed task body
    "activeForm": str | None,  # Present-tense label shown while in progress
    "metadata": dict | None,  # Arbitrary caller metadata
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "task": {"id": str, "subject": str},  # Created task with assigned ID
}
```
### 任务更新

**工具名称：** `TaskUpdate`

**输入：**
```python
{
    "taskId": str,  # ID of the task to patch
    "status": Literal["pending", "in_progress", "completed", "deleted"] | None,
    "subject": str | None,
    "description": str | None,
    "activeForm": str | None,
    "addBlocks": list[str] | None,  # Task IDs this task now blocks
    "addBlockedBy": list[str] | None,  # Task IDs that now block this task
    "owner": str | None,
    "metadata": dict | None,
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "success": bool,
    "taskId": str,
    "updatedFields": list[str],  # Names of fields that changed
    "error": str | None,
    "statusChange": {"from": str, "to": str} | None,
}
```
### TaskGet

**工具名称：** `TaskGet`

**输入：**
```python
{
    "taskId": str,  # ID of the task to read
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "task": {
        "id": str,
        "subject": str,
        "description": str,
        "status": Literal["pending", "in_progress", "completed"],
        "blocks": list[str],
        "blockedBy": list[str],
    } | None,  # None when the ID is not found
}
```
### 任务列表

**工具名称：** `TaskList`

**输入：**
```python
{}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "tasks": [
        {
            "id": str,
            "subject": str,
            "status": Literal["pending", "in_progress", "completed"],
            "owner": str | None,
            "blockedBy": list[str],
        }
    ],
}
```
### BashOutput

**工具名称：** `BashOutput`

**输入：**
```python
{
    "bash_id": str,  # The ID of the background shell
    "filter": str | None,  # Optional regex to filter output lines
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "output": str,  # New output since last check
    "status": "running" | "completed" | "failed",  # Current shell status
    "exitCode": int | None,  # Exit code when completed
}
```
### KillBash

**工具名称：** `KillBash`

**输入：**
```python
{
    "shell_id": str  # The ID of the background shell to kill
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Success message
    "shell_id": str,  # ID of the killed shell
}
```
### 退出规划模式

**工具名称：** `ExitPlanMode`

**输入：**
```python
{
    "plan": str  # The plan to run by the user for approval
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "message": str,  # Confirmation message
    "approved": bool | None,  # Whether user approved the plan
}
```
### ListMcpResources

**工具名称:** `ListMcpResources`

**输入:**
```python
{
    "server": str | None  # Optional server name to filter resources by
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "resources": [
        {
            "uri": str,
            "name": str,
            "description": str | None,
            "mimeType": str | None,
            "server": str,
        }
    ],
    "total": int,
}
```
### 读取 MCP 资源

**工具名称：** `ReadMcpResource`

**输入：**
*   **name:** (字符串，必填) - 要读取的 MCP 资源的名称。
*   **uri:** (字符串，必填) - MCP 资源的完整 URI。
```python
{
    "server": str,  # The MCP server name
    "uri": str,  # The resource URI to read
}
```
**输出：**

您应当输出以下内容：

1.  **代码输出**：运行该代码所生成的任何输出。
2.  **命令输出**：运行该命令所生成的任何输出。
3.  **沙箱路径**：沙箱的完整路径。
4.  **补丁**：您对文件所做的任何更改。
5.  **其他相关输出**：与执行此操作相关的任何其他输出。

输出应使用以下格式：
- 使用一个代码块（``` ... ```）来包裹代码。
- 使用另一个代码块（``` ... ```）来包裹命令输出。
- 使用一个代码块（``` ... ```）来包裹沙箱路径。
- 使用一个代码块（``` ... ```）来包裹补丁。
- 使用一个代码块（``` ... ```）来包裹任何其他相关输出。
```python
{
    "contents": [
        {"uri": str, "mimeType": str | None, "text": str | None, "blob": str | None}
    ],
    "server": str,
}
```
## 与 ClaudeSDKClient 相关的高级功能

### 构建连续对话界面
```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    TextBlock,
)
import asyncio


class ConversationSession:
    """Maintains a single conversation session with Claude."""

    def __init__(self, options: ClaudeAgentOptions | None = None):
        self.client = ClaudeSDKClient(options)
        self.turn_count = 0

    async def start(self):
        await self.client.connect()
        print("Starting conversation session. Claude will remember context.")
        print(
            "Commands: 'exit' to quit, 'interrupt' to stop current task, 'new' for new session"
        )

        while True:
            user_input = input(f"\n[Turn {self.turn_count + 1}] You: ")

            if user_input.lower() == "exit":
                break
            elif user_input.lower() == "interrupt":
                await self.client.interrupt()
                print("Task interrupted!")
                continue
            elif user_input.lower() == "new":
                # Disconnect and reconnect for a fresh session
                await self.client.disconnect()
                await self.client.connect()
                self.turn_count = 0
                print("Started new conversation session (previous context cleared)")
                continue

            # Send message - the session retains all previous messages
            await self.client.query(user_input)
            self.turn_count += 1

            # Process response
            print(f"[Turn {self.turn_count}] Claude: ", end="")
            async for message in self.client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(block.text, end="")
            print()  # New line after response

        await self.client.disconnect()
        print(f"Conversation ended after {self.turn_count} turns.")


async def main():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Write", "Bash"], permission_mode="acceptEdits"
    )
    session = ConversationSession(options)
    await session.start()


# Example conversation:
# Turn 1 - You: "Create a file called hello.py"
# Turn 1 - Claude: "I'll create a hello.py file for you..."
# Turn 2 - You: "What's in that file?"
# Turn 2 - Claude: "The hello.py file I just created contains..." (remembers!)
# Turn 3 - You: "Add a main function to it"
# Turn 3 - Claude: "I'll add a main function to hello.py..." (knows which file!)

asyncio.run(main())
```
### 使用钩子修改行为
```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    HookMatcher,
    HookContext,
)
import asyncio
from typing import Any


async def pre_tool_logger(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """Log all tool usage before execution."""
    tool_name = input_data.get("tool_name", "unknown")
    print(f"[PRE-TOOL] About to use: {tool_name}")

    # You can modify or block the tool execution here
    if tool_name == "Bash" and "rm -rf" in str(input_data.get("tool_input", {})):
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Dangerous command blocked",
            }
        }
    return {}


async def post_tool_logger(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """Log results after tool execution."""
    tool_name = input_data.get("tool_name", "unknown")
    print(f"[POST-TOOL] Completed: {tool_name}")
    return {}


async def user_prompt_modifier(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """Add context to user prompts."""
    original_prompt = input_data.get("prompt", "")

    # Add a timestamp as additional context for Claude to see
    from datetime import datetime

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": f"[Submitted at {timestamp}] Original prompt: {original_prompt}",
        }
    }


async def main():
    options = ClaudeAgentOptions(
        hooks={
            "PreToolUse": [
                HookMatcher(hooks=[pre_tool_logger]),
                HookMatcher(matcher="Bash", hooks=[pre_tool_logger]),
            ],
            "PostToolUse": [HookMatcher(hooks=[post_tool_logger])],
            "UserPromptSubmit": [HookMatcher(hooks=[user_prompt_modifier])],
        },
        allowed_tools=["Read", "Write", "Bash"],
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("List files in current directory")

        async for message in client.receive_response():
            # Hooks will automatically log tool usage
            pass


asyncio.run(main())
```
### 实时进度监控
```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ToolUseBlock,
    ToolResultBlock,
    TextBlock,
)
import asyncio


async def monitor_progress():
    options = ClaudeAgentOptions(
        allowed_tools=["Write", "Bash"], permission_mode="acceptEdits"
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Create 5 Python files with different sorting algorithms")

        # Monitor progress in real-time
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, ToolUseBlock):
                        if block.name == "Write":
                            file_path = block.input.get("file_path", "")
                            print(f"Creating: {file_path}")
                    elif isinstance(block, ToolResultBlock):
                        print("Completed tool execution")
                    elif isinstance(block, TextBlock):
                        print(f"Claude says: {block.text[:100]}...")

        print("Task completed!")


asyncio.run(monitor_progress())
```
## 使用示例

### 基本文件操作（使用查询）
```python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ToolUseBlock
import asyncio


async def create_project():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Write", "Bash"],
        permission_mode="acceptEdits",
        cwd="/home/user/project",
    )

    async for message in query(
        prompt="Create a Python project structure with setup.py", options=options
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, ToolUseBlock):
                    print(f"Using tool: {block.name}")


asyncio.run(create_project())
```
### 错误处理
```python
from claude_agent_sdk import query, CLINotFoundError, ProcessError, CLIJSONDecodeError

try:
    async for message in query(prompt="Hello"):
        print(message)
except CLINotFoundError:
    print(
        "Claude Code CLI not found. Try reinstalling: pip install --force-reinstall claude-agent-sdk"
    )
except ProcessError as e:
    print(f"Process failed with exit code: {e.exit_code}")
except CLIJSONDecodeError as e:
    print(f"Failed to parse response: {e}")
```
### 带客户端的流式模式
```python
from claude_agent_sdk import ClaudeSDKClient
import asyncio


async def interactive_session():
    async with ClaudeSDKClient() as client:
        # Send initial message
        await client.query("What's the weather like?")

        # Process responses
        async for msg in client.receive_response():
            print(msg)

        # Send follow-up
        await client.query("Tell me more about that")

        # Process follow-up response
        async for msg in client.receive_response():
            print(msg)


asyncio.run(interactive_session())
```
### 在 ClaudeSDKClient 中使用自定义工具
```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    tool,
    create_sdk_mcp_server,
    AssistantMessage,
    TextBlock,
)
import asyncio
from typing import Any


# Define custom tools with @tool decorator
@tool("calculate", "Perform mathematical calculations", {"expression": str})
async def calculate(args: dict[str, Any]) -> dict[str, Any]:
    try:
        result = eval(args["expression"], {"__builtins__": {}})
        return {"content": [{"type": "text", "text": f"Result: {result}"}]}
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Error: {str(e)}"}],
            "is_error": True,
        }


@tool("get_time", "Get current time", {})
async def get_time(args: dict[str, Any]) -> dict[str, Any]:
    from datetime import datetime

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {"content": [{"type": "text", "text": f"Current time: {current_time}"}]}


async def main():
    # Create SDK MCP server with custom tools
    my_server = create_sdk_mcp_server(
        name="utilities", version="1.0.0", tools=[calculate, get_time]
    )

    # Configure options with the server
    options = ClaudeAgentOptions(
        mcp_servers={"utils": my_server},
        allowed_tools=["mcp__utils__calculate", "mcp__utils__get_time"],
    )

    # Use ClaudeSDKClient for interactive tool usage
    async with ClaudeSDKClient(options=options) as client:
        await client.query("What's 123 * 456?")

        # Process calculation response
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Calculation: {block.text}")

        # Follow up with time query
        await client.query("What time is it now?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Time: {block.text}")


asyncio.run(main())
```
## 沙箱配置

### `SandboxSettings`

沙箱行为的配置。使用此项可启用命令沙箱功能并以编程方式配置网络限制。
```python
class SandboxSettings(TypedDict, total=False):
    enabled: bool
    autoAllowBashIfSandboxed: bool
    excludedCommands: list[str]
    allowUnsandboxedCommands: bool
    network: SandboxNetworkConfig
    ignoreViolations: SandboxIgnoreViolations
    enableWeakerNestedSandbox: bool
```
| 属性                    | 类型                                                  | 默认值  | 描述                                                                                                                                                                                                                             |
| :---------------------- | :---------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`               | `bool`                                                | `False` | 为命令执行启用沙箱模式                                                                                                                                                                                                           |
| `autoAllowBashIfSandboxed` | `bool`                                            | `True`  | 沙箱启用时自动批准 bash 命令                                                                                                                                                                                                     |
| `excludedCommands`      | `list[str]`                                           | `[]`    | 始终绕过沙箱限制的命令（例如 `["docker"]`）。这些命令会自动在非沙箱环境下运行，无需模型介入                                                                                                                                      |
| `allowUnsandboxedCommands` | `bool`                                            | `True`  | 允许模型请求在沙箱外运行命令。当设为 `True` 时，模型可以在工具输入中设置 `dangerouslyDisableSandbox`，这会回退到[权限系统](#非沙箱命令的权限回退)                                                        |
| `network`               | [`SandboxNetworkConfig`](#sandboxnetworkconfig)       | `None`  | 网络相关的沙箱配置                                                                                                                                                                                                               |
| `ignoreViolations`      | [`SandboxIgnoreViolations`](#sandboxignoreviolations) | `None`  | 配置忽略哪些沙箱违规行为                                                                                                                                                                                                         |
| `enableWeakerNestedSandbox` | `bool`                                            | `False` | 为兼容性启用更宽松的嵌套沙箱                                                                                                                                                                                                     |

  沙箱功能依赖于平台支持，在 Linux 系统上还需依赖 `bubblewrap` 和 `socat` 等工具。默认情况下，当 `enabled` 设置为 `True` 但沙箱无法启动时，命令将在非沙箱环境中运行，并在标准错误输出中显示警告。此默认行为与 TypeScript SDK 不同，后者默认将 `failIfUnavailable` 设置为 `true`。

  如需在沙箱不可用时改为停止，请在沙箱设置中配置 `"failIfUnavailable": True`。该字段尚未在 `SandboxSettings` 中声明，但 SDK 会将其转发给 Claude Code，并由 Claude Code 执行。随后 `query()` 将返回 `subtype="error_during_execution"` 的 `ResultMessage`，错误原因包含在 `errors` 中。请关注此子类型而非期望 `query()` 在生成消息前抛出异常。

#### 示例用法
```python
from claude_agent_sdk import query, ClaudeAgentOptions, SandboxSettings

sandbox_settings: SandboxSettings = {
    "enabled": True,
    "autoAllowBashIfSandboxed": True,
    "network": {"allowLocalBinding": True},
}

async for message in query(
    prompt="Build and test my project",
    options=ClaudeAgentOptions(sandbox=sandbox_settings),
):
    print(message)
```


  **Unix socket 安全性**：`allowUnixSockets` 选项可授予对强大系统服务的访问权限。例如，允许 `/var/run/docker.sock` 实际上会通过 Docker API 授予对主机系统的完全访问权限，从而绕过沙箱隔离。仅允许绝对必要的 Unix socket，并了解每个 socket 的安全影响。

### `SandboxNetworkConfig`

用于沙箱模式的网络专用配置。
```python
class SandboxNetworkConfig(TypedDict, total=False):
    allowedDomains: list[str]
    deniedDomains: list[str]
    allowManagedDomainsOnly: bool
    allowUnixSockets: list[str]
    allowAllUnixSockets: bool
    allowLocalBinding: bool
    allowMachLookup: list[str]
    httpProxyPort: int
    socksProxyPort: int
```
| 属性                      | 类型        | 默认值 | 描述                                                                                                                                                 |
| :------------------------ | :---------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedDomains`          | `list[str]` | `[]`    | 沙箱进程可访问的域名                                                                                                                                 |
| `deniedDomains`           | `list[str]` | `[]`    | 沙箱进程禁止访问的域名。优先级高于 `allowedDomains`                                                                                                  |
| `allowManagedDomainsOnly` | `bool`      | `False` | 仅托管设置：在托管设置中启用时，将忽略非托管设置来源中的 `allowedDomains`。通过 SDK 选项设置时无效                                                   |
| `allowUnixSockets`        | `list[str]` | `[]`    | 进程可访问的 Unix 套接字路径（例如 Docker 套接字）                                                                                                   |
| `allowAllUnixSockets`     | `bool`      | `False` | 允许访问所有 Unix 套接字                                                                                                                             |
| `allowLocalBinding`       | `bool`      | `False` | 允许进程绑定本地端口（例如用于开发服务器）                                                                                                           |
| `allowMachLookup`         | `list[str]` | `[]`    | 仅限 macOS：允许的 XPC/Mach 服务名称。支持尾部通配符                                                                                                |
| `httpProxyPort`           | `int`       | `None`  | 用于网络请求的 HTTP 代理端口                                                                                                                         |
| `socksProxyPort`          | `int`       | `None`  | 用于网络请求的 SOCKS 代理端口                                                                                                                        |

  内置沙箱代理根据请求的主机名强制执行网络白名单，并且不会终止或检查 TLS 流量，因此诸如[域前置](https://en.wikipedia.org/wiki/Domain_fronting)等技术可能会绕过它。详情请参见[沙箱安全限制](/zh/sandboxing#security-limitations)，关于配置 TLS 终止代理，请参见[安全部署](/zh/agent-sdk/secure-deployment#traffic-forwarding)。

### `SandboxIgnoreViolations`

用于忽略特定沙箱违规的配置。
```python
class SandboxIgnoreViolations(TypedDict, total=False):
    file: list[str]
    network: list[str]
```
| 属性      | 类型        | 默认值 | 说明                                       |
| :-------- | :---------- | :------ | :------------------------------------------ |
| `file`    | `list[str]` | `[]`    | 忽略违规的文件路径模式                      |
| `network` | `list[str]` | `[]`    | 忽略违规的网络模式                          |

### 非沙箱命令的权限回退

当启用 `allowUnsandboxedCommands` 时，模型可以通过在工具输入中设置 `dangerouslyDisableSandbox: True` 来请求在沙箱外运行命令。这些请求将回退到现有的权限系统，这意味着你的 `can_use_tool` 处理函数将被调用，从而允许你实现自定义的授权逻辑。

  **`excludedCommands` 与 `allowUnsandboxedCommands` 对比：**

  * `excludedCommands`：一个静态命令列表，其中的命令始终会自动绕过沙箱（例如 `["docker"]`）。模型对此没有控制权。
  * `allowUnsandboxedCommands`：允许模型在运行时决定是否请求非沙箱执行，方法是在工具输入中设置 `dangerouslyDisableSandbox: True`。


```python
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)


async def can_use_tool(
    tool: str, input: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    # Check if the model is requesting to bypass the sandbox
    if tool == "Bash" and input.get("dangerouslyDisableSandbox"):
        # The model is requesting to run this command outside the sandbox
        print(f"Unsandboxed command requested: {input.get('command')}")

        if is_command_authorized(input.get("command")):
            return PermissionResultAllow()
        return PermissionResultDeny(
            message="Command not authorized for unsandboxed execution"
        )
    return PermissionResultAllow()


# Required: dummy hook keeps the stream open for can_use_tool
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}


async def prompt_stream():
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Deploy my application"},
    }


async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            sandbox={
                "enabled": True,
                "allowUnsandboxedCommands": True,  # Model can request unsandboxed execution
            },
            permission_mode="default",
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        print(message)
```
此模式使您能够：

* **审核模型请求**：记录模型请求未在沙箱中执行的情况
* **实施允许列表**：仅允许特定命令在沙箱外运行
* **添加审批工作流**：要求对特权操作进行明确授权

  使用 `dangerouslyDisableSandbox: True` 运行的命令具有完全系统访问权限。请确保您的 `can_use_tool` 处理程序仔细验证这些请求。

  如果 `permission_mode` 设置为 `bypassPermissions` 且启用了 `allow_unsandboxed_commands`，模型可以自主在沙箱外部执行命令，无需任何批准提示。这种组合实际上允许模型静默逃脱沙箱隔离。

## 另请参阅

* [SDK 概述](/zh/agent-sdk/overview) - 通用 SDK 概念
* [TypeScript SDK 参考](/zh/agent-sdk/typescript) - TypeScript SDK 文档
* [CLI 参考](/zh/cli-reference) - 命令行界面
* [常见工作流程](/zh/common-workflows) - 分步指南