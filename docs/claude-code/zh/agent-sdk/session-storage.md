> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后进一步探索。

# 将会话持久化到外部存储

> 将会话记录同步到 S3、Redis 或您自己的后端，以便任何主机都能恢复会话。

默认情况下，SDK 将会话记录以 JSONL 文件的形式写入本地文件系统的 `~/.claude/projects/` 目录下。通过 `SessionStore` 适配器，您可以将这些记录同步到您自己的后端（如 S3、Redis 或数据库），从而实现在一台主机上创建的会话可以在另一台主机上恢复。

使用会话存储的常见原因：

* **多主机部署。** 无服务器函数、自动扩缩的 Worker 和 CI 运行器不共享文件系统。共享存储允许任何副本恢复任何会话。
* **持久性。** 本地容器是临时的。由 S3 或数据库支持的存储可以在重启和重新部署后继续存在。
* **合规与审计。** 将记录保存在您已有管控的存储中，并应用您自己的保留规则、加密和访问控制。

## `SessionStore` 接口

`SessionStore` 是一个对象，包含两个必需方法 `append` 和 `load`，以及三个可选方法。SDK 在查询期间调用 `append` 来写入记录条目，并在恢复时调用 `load` 来读取它们。

  ```typescript TypeScript
  // Exported from @anthropic-ai/claude-agent-sdk as
  // SessionStore, SessionKey, SessionStoreEntry.

  type SessionKey = {
    projectKey: string;
    sessionId: string;
    subpath?: string;
  };

  type SessionStore = {
    // Required
    append(key: SessionKey, entries: SessionStoreEntry[]): Promise<void>;
    load(key: SessionKey): Promise<SessionStoreEntry[] | null>;

    // Optional
    listSessions?(
      projectKey: string,
    ): Promise<Array<{ sessionId: string; mtime: number }>>;
    delete?(key: SessionKey): Promise<void>;
    listSubkeys?(key: {
      projectKey: string;
      sessionId: string;
    }): Promise<string[]>;
  };
  ```

  ```python Python
  # Exported from claude_agent_sdk as
  # SessionStore, SessionKey, SessionStoreEntry.

  class SessionKey(TypedDict):
      project_key: str
      session_id: str
      subpath: NotRequired[str]

  class SessionStore(Protocol):
      # Required
      async def append(
          self, key: SessionKey, entries: list[SessionStoreEntry]
      ) -> None: ...
      async def load(self, key: SessionKey) -> list[SessionStoreEntry] | None: ...

      # Optional — omit or raise NotImplementedError
      async def list_sessions(
          self, project_key: str
      ) -> list[SessionStoreListEntry]: ...
      async def delete(self, key: SessionKey) -> None: ...
      async def list_subkeys(self, key: SessionListSubkeysKey) -> list[str]: ...
  ```

`SessionKey` 用于标识一条记录。`projectKey` 是工作目录的稳定且文件系统安全的编码，`sessionId` 是会话 UUID，而 `subpath` 在记录属于子代理记录或侧车文件而非主对话时被设置。将 `subpath` 视为不透明的密钥后缀；它遵循磁盘上的布局，例如 `subagents/agent-<id>`。当 `subpath` 未定义时，该密钥指向主记录。

| 方法             | 是否必需 | 调用时机                                                                                                                                                     |
| :--------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `append`         | 是       | 在每批记录条目写入本地后调用。条目是 JSON 安全的对象，在本地 JSONL 文件中每行一条。                                                                          |
| `load`           | 是       | 在子进程生成前调用一次，当设置了 `resume` 时。如果会话未知则返回 `null`。                                                                                     |
| `listSessions`   | 否       | 由 `listSessions({ sessionStore })` 以及设置了 `continue: true` 的 `query()`/`startup()` 调用。如果未定义，这些调用会抛出异常。                               |
| `delete`         | 否       | 由 `deleteSession({ sessionStore })` 调用。删除主密钥（没有 `subpath`）必须级联删除该会话的所有子密钥。如果未定义，删除操作为空操作，适用于只追加的后端。 |
| `listSubkeys`    | 否       | 在恢复过程中，用于发现子代理记录。如果未定义，则仅恢复主记录。                                                                                               |

## 快速开始

SDK 附带了一个用于开发和测试的 `InMemorySessionStore`。下面的示例运行了一个附加了该存储的查询，从结果消息中捕获了会话 ID，然后在第二次 `query()` 调用中从该存储恢复。第二次调用传递了相同的存储实例加上 `resume`，因此 SDK 会从存储而非本地文件系统加载记录：

  ```typescript TypeScript
  import { query, InMemorySessionStore } from "@anthropic-ai/claude-agent-sdk";

  const store = new InMemorySessionStore();

  let sessionId: string | undefined;
  for await (const message of query({
    prompt: "List the TypeScript files under src/",
    options: { sessionStore: store },
  })) {
    if (message.type === "result") {
      sessionId = message.session_id;
    }
  }

  // Resume from the store. The agent has full context from the first call.
  for await (const message of query({
    prompt: "Summarize what those files do",
    options: { sessionStore: store, resume: sessionId },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import (
      ClaudeAgentOptions,
      InMemorySessionStore,
      ResultMessage,
      query,
  )

  store = InMemorySessionStore()


  async def main():
      session_id = None
      async for message in query(
          prompt="List the Python files under src/",
          options=ClaudeAgentOptions(session_store=store),
      ):
          if isinstance(message, ResultMessage):
              session_id = message.session_id

      # Resume from the store. The agent has full context from the first call.
      async for message in query(
          prompt="Summarize what those files do",
          options=ClaudeAgentOptions(session_store=store, resume=session_id),
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

## 编写你自己的适配器

针对你的后端实现 `append` 和 `load`。如果你希望 `listSessions()`、`deleteSession()` 和子代理恢复功能能在该存储上正常工作，还需要添加 `listSessions`、`delete` 和 `listSubkeys`。

传递给 `append` 的条目类型为 `SessionStoreEntry`（一个 `{ type: string; ... }` 对象）。将其视为不透明的 JSON 安全值：按顺序持久化它们，并以相同的顺序从 `load` 返回。`load` 返回的条目必须与追加的条目深度相等；不要求字节级序列化相等，因此像 Postgres `jsonb` 这样会重排对象键的后端是可行的。

## 参考实现

TypeScript SDK 仓库在 [`examples/session-stores/`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores) 下包含了 S3、Redis 和 Postgres 的可运行参考适配器。它们未发布到 npm；将你所需的 `src/` 文件复制到你的项目中，并安装相应的后端客户端。

| 适配器                                                                                                                         | 后端客户端            | 存储模型                                                                 |
| :----------------------------------------------------------------------------------------------------------------------------- | :------------------- | :----------------------------------------------------------------------- |
| [`S3SessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/s3)             | `@aws-sdk/client-s3` | 每个 `append()` 对应一个 JSONL 部分文件；`load()` 列出、排序并连接。         |
| [`RedisSessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/redis)       | `ioredis`            | 每个对话记录使用 `RPUSH`/`LRANGE` 列表，外加一个排序集合的会话索引。         |
| [`PostgresSessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/postgres) | `pg`                 | 在 `jsonb` 表中每个条目一行，按 `BIGSERIAL` 排序。                         |

每个适配器都接受一个预先配置好的客户端实例，因此你可以控制凭证、TLS、区域和连接池配置。例如，使用 S3 时：
```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { S3Client } from "@aws-sdk/client-s3";
import { S3SessionStore } from "./S3SessionStore"; // copied from examples/session-stores/s3

const store = new S3SessionStore({
  bucket: "my-claude-sessions",
  prefix: "transcripts",
  client: new S3Client({ region: "us-east-1" }),
});

for await (const message of query({
  prompt: "Hello!",
  options: { sessionStore: store },
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

// Later, possibly on a different host:
for await (const message of query({
  prompt: "Continue where we left off",
  options: { sessionStore: store, resume: "previous-session-id" },
})) {
  // ...
}
```
### 验证你的适配器

两个 SDK 都附带了协议套件，用于断言 `append`、`load` 以及可选方法必须满足的行为契约。当这些可选方法未实现时，相关测试会自动跳过。

在 TypeScript 中，请将示例目录中的 [`shared/conformance.ts`](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/examples/session-stores/shared/conformance.ts) 文件复制到你的测试套件中。在 Python 中，该套件已内置在包中：
```python Python
import pytest
from claude_agent_sdk.testing import run_session_store_conformance


@pytest.mark.asyncio
async def test_my_store_conformance():
    await run_session_store_conformance(MyRedisStore)
```
## 行为说明

### 双写架构

存储层是镜像，而非替代。Claude Code 子进程始终先写入本地磁盘；随后 SDK 将每个批次转发至 `append()`。若希望本地副本为临时性质，可在 `options.env` 中将 `CLAUDE_CONFIG_DIR` 指向临时目录。由于镜像依赖本地写入，`sessionStore` 无法与 `persistSession: false` 组合使用；若同时设置两者，SDK 会抛出异常。它也无法与 `enableFileCheckpointing` 组合使用，因为文件历史备份对象会直接写入本地磁盘，而不会镜像至存储层。

### 镜像写入采用尽力机制

若 `append()` 拒绝或超时，错误将被记录，迭代器中会收到 `{ type: "system", subtype: "mirror_error" }` 消息，查询继续执行。本地对话记录已持久化在磁盘上，因此存储层中断不会中断代理运行或导致本地数据丢失。失败的批次不会被重试，因此若需检测存储层数据丢失，请监控 `mirror_error`。

### `getSessionMessages` 返回压缩后的消息链

`getSessionMessages({ sessionStore })` 返回代理恢复时将看到的关联消息链。自动压缩后，较早的轮次会被摘要替换，因此一个存储层保存了 503 条原始记录的会话，`getSessionMessages` 可能仅返回 18 条消息。若需获取完整的原始历史记录（包括压缩前的轮次和元数据条目），请直接调用 `store.load(key)`。

### `forkSession` 不是字节级复制

`forkSession({ sessionStore })` 读取源条目，重写每个 `sessionId` 字段并重新映射消息 UUID，然后在新键下追加转换后的条目。适配器级别的复制或 `CopyObject` 快捷方式会产生仍引用旧会话 ID 的对话记录，因此 SDK 未采用此类方式。

### 子代理对话记录

子代理对话记录镜像存储在 `subpath: "subagents/agent-<id>"` 下。`listSubagents({ sessionStore })` 要求适配器实现 `listSubkeys`；`getSubagentMessages({ sessionStore })` 在可用时会使用它，若未定义则回退到直接子路径。恢复过程也会调用 `listSubkeys` 以还原子代理文件；若无此功能，则仅主对话记录会被具体化。

### 数据保留

SDK 绝不会自行删除您存储中的数据。保留策略由适配器负责：请根据您的合规要求实施 TTL、S3 生命周期策略或定期清理。`CLAUDE_CONFIG_DIR` 下的本地对话记录由 `cleanupPeriodDays` 设置独立清理。

## 支持函数

以下 SDK 函数接受 `sessionStore` 选项，并在提供时针对存储层（而非本地文件系统）操作：

* [`query()`](/en/agent-sdk/typescript#query)
* [`startup()`](/en/agent-sdk/typescript#startup)
* [`listSessions()`](/en/agent-sdk/typescript#listsessions)
* [`getSessionInfo()`](/en/agent-sdk/typescript#getsessioninfo)
* [`getSessionMessages()`](/en/agent-sdk/typescript#getsessionmessages)
* [`renameSession()`](/en/agent-sdk/typescript#renamesession)
* [`tagSession()`](/en/agent-sdk/typescript#tagsession)
* [`deleteSession()`](/en/agent-sdk/typescript)
* [`forkSession()`](/en/agent-sdk/typescript)
* [`listSubagents()`](/en/agent-sdk/typescript)
* [`getSubagentMessages()`](/en/agent-sdk/typescript)

## 相关资源

* [使用会话](/en/agent-sdk/sessions)：无需自定义存储层即可继续、恢复和分叉会话
* [托管 SDK](/en/agent-sdk/hosting)：多主机环境的部署模式
* [TypeScript `Options`](/en/agent-sdk/typescript#options)：完整选项参考
* [`examples/session-stores/`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores)：可运行的 S3、Redis 和 Postgres 参考适配器