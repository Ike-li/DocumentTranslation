# Codex App Server

Codex app-server 是 Codex 用于驱动富客户端（例如 Codex VS Code 扩展）的接口。当你希望在自己的产品中实现深度集成时可以使用它：身份验证、对话历史、审批和流式代理事件。app-server 的实现是开源的，位于 Codex GitHub 仓库（[openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server)）。完整的开源 Codex 组件列表请参阅[开源](https://developers.openai.com/codex/open-source)页面。

如果你要自动化任务或在 CI 中运行 Codex，请改用 <a href="/codex/sdk">Codex SDK</a>。

## 协议

与 [MCP](https://modelcontextprotocol.io/) 类似，`codex app-server` 支持使用 JSON-RPC 2.0 消息进行双向通信（线上传输时省略 `"jsonrpc":"2.0"` 头部）。

支持的传输方式：

- `stdio`（`--listen stdio://`，默认）：换行分隔的 JSON（JSONL）。
- `websocket`（`--listen ws://IP:PORT`，实验性且不受支持）：每个 WebSocket 文本帧一条 JSON-RPC 消息。
- Unix socket（`--listen unix://` 或 `--listen unix://PATH`）：通过 Codex 默认的 app-server 控制 socket 或自定义 Unix socket 路径进行 WebSocket 连接，使用标准 HTTP Upgrade 握手。
- `off`（`--listen off`）：不暴露本地传输。

当你使用 `--listen ws://IP:PORT` 运行时，同一个监听器还提供基本的 HTTP 健康探测：

- `GET /readyz` 在监听器接受新连接后返回 `200 OK`。
- `GET /healthz` 在请求不包含 `Origin` 头部时返回 `200 OK`。
- 带有 `Origin` 头部的请求会被拒绝，返回 `403 Forbidden`。

WebSocket 传输是实验性的且不受支持。`ws://127.0.0.1:PORT` 等本地监听器适用于 localhost 和 SSH 端口转发工作流。非回环 WebSocket 目前默认允许未认证连接（在推出期间），因此在远程暴露之前请配置 WebSocket 认证。

支持的 WebSocket 认证标志：

- `--ws-auth capability-token --ws-token-file /absolute/path`
- `--ws-auth capability-token --ws-token-sha256 HEX`
- `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`

对于签名 bearer token，你还可以设置 `--ws-issuer`、`--ws-audience` 和 `--ws-max-clock-skew-seconds`。客户端在 WebSocket 握手期间以 `Authorization: Bearer <token>` 的形式提交凭据，app-server 在 JSON-RPC `initialize` 之前强制执行认证。

建议使用 `--ws-token-file` 而非在命令行中传递原始 bearer token。仅当客户端将原始高熵 token 存储在单独的本地密钥库中时才使用 `--ws-token-sha256`；哈希只是一个验证器，客户端仍然需要原始 token。

在 WebSocket 模式下，app-server 使用有界队列。当请求入口已满时，服务器以 JSON-RPC 错误码 `-32001` 和消息 `"Server overloaded; retry later."` 拒绝新请求。客户端应以指数递增的延迟和抖动进行重试。

## 消息模式

请求包含 `method`、`params` 和 `id`：

```json
{ "method": "thread/start", "id": 10, "params": { "model": "gpt-5.4" } }
```

响应会回显 `id`，并包含 `result` 或 `error`：

```json
{ "id": 10, "result": { "thread": { "id": "thr_123" } } }
```

```json
{ "id": 10, "error": { "code": 123, "message": "Something went wrong" } }
```

通知省略 `id`，仅使用 `method` 和 `params`：

```json
{ "method": "turn/started", "params": { "turn": { "id": "turn_456" } } }
```

你可以从 CLI 生成 TypeScript 模式或 JSON Schema 包。每个输出都特定于你运行的 Codex 版本，因此生成的产物与该版本完全匹配：

```bash
codex app-server generate-ts --out ./schemas
codex app-server generate-json-schema --out ./schemas
```

## 快速开始

1. 使用 `codex app-server`（默认 stdio 传输）、`codex app-server --listen ws://127.0.0.1:4500`（TCP WebSocket）或 `codex app-server --listen unix://`（默认 Unix socket）启动服务器。
2. 通过选定的传输方式连接客户端，然后发送 `initialize`，接着发送 `initialized` 通知。
3. 启动一个线程和一个轮次，然后持续从活动传输流中读取通知。

示例（Node.js / TypeScript）：

```ts



const proc = spawn("codex", ["app-server"], {
  stdio: ["pipe", "pipe", "inherit"],
});
const rl = readline.createInterface({ input: proc.stdout });

const send = (message: unknown) => {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
};

let threadId: string | null = null;

rl.on("line", (line) => {
  const msg = JSON.parse(line) as any;
  console.log("server:", msg);

  if (msg.id === 1 && msg.result?.thread?.id && !threadId) {
    threadId = msg.result.thread.id;
    send({
      method: "turn/start",
      id: 2,
      params: {
        threadId,
        input: [{ type: "text", text: "Summarize this repo." }],
      },
    });
  }
});

send({
  method: "initialize",
  id: 0,
  params: {
    clientInfo: {
      name: "my_product",
      title: "My Product",
      version: "0.1.0",
    },
  },
});
send({ method: "initialized", params: {} });
send({ method: "thread/start", id: 1, params: { model: "gpt-5.4" } });
```

## 核心原语

- **线程（Thread）**：用户与 Codex 代理之间的对话。线程包含轮次。
- **轮次（Turn）**：单个用户请求及随后的代理工作。轮次包含项目并流式传输增量更新。
- **项目（Item）**：输入或输出的单元（用户消息、代理消息、命令运行、文件更改、工具调用等）。

使用线程 API 创建、列出或归档对话。使用轮次 API 驱动对话，并通过轮次通知流式传输进度。

## 生命周期概览

- **每个连接初始化一次**：打开传输连接后，立即发送包含客户端元数据的 `initialize` 请求，然后发出 `initialized`。服务器会拒绝该连接上在此握手之前的任何请求。
- **启动（或恢复）线程**：调用 `thread/start` 创建新对话，调用 `thread/resume` 继续现有对话，或调用 `thread/fork` 将历史记录分支到新的线程 id。
- **开始轮次**：调用 `turn/start`，指定目标 `threadId` 和用户输入。可选字段可以覆盖模型、个性、`cwd`、沙箱策略等。
- **引导活动轮次**：调用 `turn/steer` 将用户输入追加到当前正在进行的轮次，而无需创建新轮次。
- **流式传输事件**：`turn/start` 之后，持续从 stdout 读取通知：`thread/archived`、`thread/unarchived`、`item/started`、`item/completed`、`item/agentMessage/delta`、工具进度和其他更新。
- **完成轮次**：当模型完成或 `turn/interrupt` 取消后，服务器发出带有最终状态的 `turn/completed`。

## 初始化

客户端必须在调用该连接上的任何其他方法之前，对每个传输连接发送单个 `initialize` 请求，然后以 `initialized` 通知确认。初始化之前发送的请求会收到 `Not initialized` 错误，同一连接上重复的 `initialize` 调用会返回 `Already initialized`。

服务器返回它将呈现给上游服务的用户代理字符串，以及描述运行时目标的 `platformFamily` 和 `platformOs` 值。设置 `clientInfo` 以标识你的集成。

`initialize.params.capabilities` 还支持通过 `optOutNotificationMethods` 进行每连接通知退出，这是一个要为该连接抑制的精确方法名称列表。匹配是精确的（没有通配符/前缀）。未知方法名称会被接受并忽略。

**重要**：使用 `clientInfo.name` 为 OpenAI 合规日志平台标识你的客户端。如果你正在开发面向企业使用的新 Codex 集成，请联系 OpenAI 将其添加到已知客户端列表。更多上下文请参阅 [Codex 日志参考](https://chatgpt.com/admin/api-reference#tag/Logs:-Codex)。

示例（来自 Codex VS Code 扩展）：

```json
{
  "method": "initialize",
  "id": 0,
  "params": {
    "clientInfo": {
      "name": "codex_vscode",
      "title": "Codex VS Code Extension",
      "version": "0.1.0"
    }
  }
}
```

带通知退出的示例：

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true,
      "optOutNotificationMethods": ["thread/started", "item/agentMessage/delta"]
    }
  }
}
```

## 实验性 API 选择加入

某些 app-server 方法和字段有意设置在 `experimentalApi` 能力之后。

- 省略 `capabilities`（或将 `experimentalApi` 设置为 `false`）以保持在稳定 API 表面上，服务器会拒绝实验性方法/字段。
- 将 `capabilities.experimentalApi` 设置为 `true` 以启用实验性方法和字段。

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true
    }
  }
}
```

如果客户端在未选择加入的情况下发送实验性方法或字段，app-server 会拒绝并返回：

`<descriptor> requires experimentalApi capability`

## API 概览

- `thread/start` - 创建新线程；发出 `thread/started` 并自动订阅该线程的轮次/项目事件。
- `thread/resume` - 按 id 重新打开现有线程，以便后续 `turn/start` 调用追加到该线程。
- `thread/fork` - 通过复制存储的历史记录将线程 fork 到新的线程 id；为新线程发出 `thread/started`。返回的线程在可用时包含 `forkedFromId`。
- `thread/read` - 按 id 读取已存储的线程而不恢复它；设置 `includeTurns` 以返回完整的轮次历史。返回的 `thread` 对象包含运行时 `status`。
- `thread/list` - 分页浏览已存储的线程日志；支持基于游标的分页，以及 `modelProviders`、`sourceKinds`、`archived`、`cwd` 和 `searchTerm` 过滤器。返回的 `thread` 对象包含运行时 `status`。
- `thread/turns/list` - 分页浏览已存储线程的轮次历史而不恢复它。`itemsView` 控制轮次项目是被省略、摘要还是完全加载。
- `thread/turns/items/list` - 保留用于分页轮次项目加载；当前返回不支持。
- `thread/loaded/list` - 列出当前在内存中加载的线程 id。
- `thread/name/set` - 为已加载的线程或持久化推出的线程设置或更新面向用户的名称；发出 `thread/name/updated`。
- `thread/goal/set` - 设置线程的目标；发出 `thread/goal/updated`。
- `thread/goal/get` - 读取线程的当前目标。
- `thread/goal/clear` - 清除线程的目标；发出 `thread/goal/cleared`。
- `thread/metadata/update` - 修补 SQLite 支持的已存储线程元数据；当前支持持久化 `gitInfo`。
- `thread/archive` - 将线程的日志文件移入归档目录；成功时返回 `{}` 并发出 `thread/archived`。
- `thread/unsubscribe` - 取消此连接对线程轮次/项目事件的订阅。如果这是最后一个订阅者，服务器会在无订阅者不活动宽限期后卸载线程并发出 `thread/closed`。
- `thread/unarchive` - 将归档的线程推出恢复到活动会话目录；返回恢复的 `thread` 并发出 `thread/unarchived`。
- `thread/status/changed` - 当已加载线程的运行时 `status` 发生变化时发出的通知。
- `thread/compact/start` - 触发线程的对话历史压缩；立即返回 `{}`，同时进度通过 `turn/*` 和 `item/*` 通知流式传输。
- `thread/shellCommand` - 对线程运行用户发起的 shell 命令。这在沙箱外运行，具有完全访问权限，不继承线程沙箱策略。
- `thread/backgroundTerminals/clean` - 停止线程的所有运行中后台终端（实验性；需要 `capabilities.experimentalApi`）。
- `thread/rollback` - 从内存上下文中丢弃最后 N 个轮次并持久化回滚标记；返回更新后的 `thread`。
- `turn/start` - 将用户输入添加到线程并开始 Codex 生成；以初始 `turn` 响应并流式传输事件。对于 `collaborationMode`，`settings.developer_instructions: null` 表示"使用所选模式的内置指令"。
- `thread/inject_items` - 将原始 Responses API 项目追加到已加载线程的模型可见历史中，而不启动用户轮次。
- `turn/steer` - 将用户输入追加到线程的活动正在进行轮次；返回已接受的 `turnId`。
- `turn/interrupt` - 请求取消正在进行的轮次；成功返回 `{}`，轮次以 `status: "interrupted"` 结束。
- `review/start` - 为线程启动 Codex 审查器；发出 `enteredReviewMode` 和 `exitedReviewMode` 项目。
- `command/exec` - 在服务器沙箱下运行单个命令，无需创建线程/轮次。
- `command/exec/write` - 向正在运行的 `command/exec` 会话写入 `stdin` 字节或关闭 `stdin`。
- `command/exec/resize` - 调整正在运行的 PTY 支持的 `command/exec` 会话大小。
- `command/exec/terminate` - 停止正在运行的 `command/exec` 会话。
- `command/exec/outputDelta`（通知）- 为流式 `command/exec` 会话发出 base64 编码的 stdout/stderr 块。
- `process/spawn` - 在 Codex 沙箱外启动显式进程会话（实验性；需要 `capabilities.experimentalApi`）。
- `process/writeStdin` - 向正在运行的 `process/spawn` 会话写入 stdin 字节或关闭 stdin（实验性）。
- `process/resizePty` - 调整正在运行的 PTY 支持的进程会话大小（实验性）。
- `process/kill` - 终止正在运行的进程会话（实验性）。
- `process/outputDelta` 和 `process/exited`（通知）- 为流式进程输出和进程退出状态发出（实验性）。
- `model/list` - 列出可用模型（设置 `includeHidden: true` 以包含 `hidden: true` 的条目），包含 effort 选项、可选 `upgrade` 和 `inputModalities`。
- `modelProvider/capabilities/read` - 读取模型/提供者组合的提供者能力边界（实验性；需要 `capabilities.experimentalApi`）。
- `experimentalFeature/list` - 列出带有生命周期阶段元数据和游标分页的功能标志。
- `experimentalFeature/enablement/set` - 修补支持的功能键（如 `apps` 和 `plugins`）的内存中运行时设置。
- `collaborationMode/list` - 列出协作模式预设（实验性，无分页）。
- `skills/list` - 为一个或多个 `cwd` 值列出技能（支持 `forceReload` 和可选 `perCwdExtraUserRoots`）。
- `skills/changed`（通知）- 当被监视的本地技能文件发生变化时发出。
- `marketplace/add` - 添加远程插件市场并将其持久化到用户的市场配置中。
- `marketplace/upgrade` - 刷新已配置的 Git 市场，或在省略市场名称时刷新所有已配置的 Git 市场。
- `plugin/list` - 列出已发现的插件市场和插件状态，包括安装/认证策略元数据、市场加载错误、特色插件 id 以及本地、Git 或远程插件源元数据。
- `plugin/read` - 按市场路径或远程市场名称和插件名称读取一个插件，包括捆绑的技能、应用和 MCP 服务器名称（当这些详细信息可用时）。
- `plugin/install` - 从市场路径或远程市场名称安装插件。
- `plugin/uninstall` - 卸载已安装的插件。
- `app/list` - 列出可用应用（连接器），带分页以及可访问性/启用元数据。
- `skills/config/write` - 按路径启用或禁用技能。
- `mcpServer/oauth/login` - 为已配置的 MCP 服务器启动 OAuth 登录；返回授权 URL 并在完成时发出 `mcpServer/oauthLogin/completed`。
- `tool/requestUserInput` - 用 1-3 个简短问题提示用户进行工具调用（实验性）；问题可以设置 `isOther` 以提供自由格式选项。
- `config/mcpServer/reload` - 从磁盘重新加载 MCP 服务器配置并为已加载的线程排队刷新。
- `mcpServerStatus/list` - 列出 MCP 服务器、工具、资源和认证状态（游标 + 限制分页）。使用 `detail: "full"` 获取完整数据，或使用 `detail: "toolsAndAuthOnly"` 省略资源。
- `mcpServer/resource/read` - 通过已初始化的 MCP 服务器读取单个 MCP 资源。
- `mcpServer/tool/call` - 调用线程已配置的 MCP 服务器上的工具。
- `mcpServer/startupStatus/updated`（通知）- 当已加载线程的已配置 MCP 服务器启动状态发生变化时发出。
- `windowsSandbox/setupStart` - 为 `elevated` 或 `unelevated` 模式启动 Windows 沙箱设置；快速返回，稍后发出 `windowsSandbox/setupCompleted`。
- `feedback/upload` - 提交反馈报告（分类 + 可选原因/日志 + 对话 id，以及可选 `extraLogFiles` 附件）。
- `config/read` - 在解析配置分层后获取磁盘上的有效配置。
- `externalAgentConfig/detect` - 检测可通过 `includeHome` 和可选 `cwds` 迁移的外部代理产物；每个检测到的项目包含 `cwd`（主页为 `null`）。
- `externalAgentConfig/import` - 通过传递显式 `migrationItems`（含 `cwd`，主页为 `null`）应用选定的外部代理迁移项目。支持的项目类型包括配置、技能、`AGENTS.md`、插件、MCP 服务器配置、子代理、钩子、命令和会话；插件导入会发出 `externalAgentConfig/import/completed`。
- `config/value/write` - 将单个配置键/值写入磁盘上用户的 `config.toml`。
- `config/batchWrite` - 将配置编辑原子性地应用到磁盘上用户的 `config.toml`。
- `configRequirements/read` - 从 `requirements.toml` 和/或 MDM 获取需求，包括允许列表、固定 `featureRequirements` 以及驻留/网络需求（如果你没有设置任何需求，则为 `null`）。
- `fs/readFile`、`fs/writeFile`、`fs/createDirectory`、`fs/getMetadata`、`fs/readDirectory`、`fs/remove`、`fs/copy`、`fs/watch`、`fs/unwatch` 和 `fs/changed`（通知）- 通过 app-server v2 文件系统 API 操作绝对文件系统路径。

插件摘要包含一个 `source` 联合类型。本地插件返回 `{ "type": "local", "path": ... }`，Git 支持的市场条目返回 `{ "type": "git", "url": ..., "path": ..., "refName": ..., "sha": ... }`，远程目录条目返回 `{ "type": "remote" }`。对于仅远程目录条目，`PluginMarketplaceEntry.path` 可以为 `null`；在读取或安装这些插件时使用 `remoteMarketplaceName` 代替 `marketplacePath`。

## 模型

### 列出模型（`model/list`）

调用 `model/list` 在渲染模型或个性选择器之前发现可用模型及其能力。

```json
{ "method": "model/list", "id": 6, "params": { "limit": 20, "includeHidden": false } }
{ "id": 6, "result": {
  "data": [{
    "id": "gpt-5.4",
    "model": "gpt-5.4",
    "displayName": "GPT-5.4",
    "hidden": false,
    "defaultReasoningEffort": "medium",
    "supportedReasoningEfforts": [{
      "reasoningEffort": "low",
      "description": "Lower latency"
    }],
    "inputModalities": ["text", "image"],
    "supportsPersonality": true,
    "isDefault": true
  }],
  "nextCursor": null
} }
```

每个模型条目可以包含：

- `supportedReasoningEfforts` - 模型支持的 effort 选项。
- `defaultReasoningEffort` - 建议的客户端默认 effort。
- `upgrade` - 可选的推荐升级模型 id，用于客户端的迁移提示。
- `upgradeInfo` - 可选的升级元数据，用于客户端的迁移提示。
- `hidden` - 模型是否在默认选择器列表中隐藏。
- `inputModalities` - 模型支持的输入类型（例如 `text`、`image`）。
- `supportsPersonality` - 模型是否支持个性特定指令（如 `/personality`）。
- `isDefault` - 模型是否为推荐的默认值。

默认情况下，`model/list` 仅返回选择器可见的模型。如果你需要完整列表并希望在客户端使用 `hidden` 进行过滤，请设置 `includeHidden: true`。

当 `inputModalities` 缺失（较旧的模型目录）时，为向后兼容将其视为 `["text", "image"]`。

### 列出实验性功能（`experimentalFeature/list`）

使用此端点发现带有元数据和生命周期阶段的功能标志：

```json
{ "method": "experimentalFeature/list", "id": 7, "params": { "limit": 20 } }
{ "id": 7, "result": {
  "data": [{
    "name": "unified_exec",
    "stage": "beta",
    "displayName": "Unified exec",
    "description": "Use the unified PTY-backed execution tool.",
    "announcement": "Beta rollout for improved command execution reliability.",
    "enabled": false,
    "defaultEnabled": false
  }],
  "nextCursor": null
} }
```

`stage` 可以是 `beta`、`underDevelopment`、`stable`、`deprecated` 或 `removed`。对于非 beta 标志，`displayName`、`description` 和 `announcement` 可能为 `null`。

## 线程

- `thread/read` 读取已存储的线程而不订阅它；设置 `includeTurns` 以包含轮次。
- `thread/turns/list` 分页浏览已存储线程的轮次历史而不恢复它。使用 `itemsView` 选择轮次项目是被省略、摘要还是完全加载。
- `thread/list` 支持游标分页以及 `modelProviders`、`sourceKinds`、`archived`、`cwd` 和 `searchTerm` 过滤。
- `thread/loaded/list` 返回当前在内存中的线程 ID。
- `thread/archive` 将线程持久化的 JSONL 日志移入归档目录。
- `thread/metadata/update` 修补已存储的线程元数据，当前包括持久化 `gitInfo`。
- `thread/unsubscribe` 取消当前连接对已加载线程的订阅，并可在不活动宽限期后触发 `thread/closed`。
- `thread/unarchive` 将归档的线程推出恢复到活动会话目录。
- `thread/compact/start` 触发压缩并立即返回 `{}`。
- `thread/rollback` 从内存上下文中丢弃最后 N 个轮次，并在线程持久化的 JSONL 日志中记录回滚标记。
- `thread/inject_items` 将原始 Responses API 项目追加到已加载线程的模型可见历史中，而不启动用户轮次。

### 启动或恢复线程

当你需要新的 Codex 对话时启动一个新线程。

```json
{ "method": "thread/start", "id": 10, "params": {
  "model": "gpt-5.4",
  "cwd": "/Users/me/project",
  "approvalPolicy": "never",
  "sandbox": "workspaceWrite",
  "personality": "friendly",
  "serviceName": "my_app_server_client"
} }
{ "id": 10, "result": {
  "thread": {
    "id": "thr_123",
    "sessionId": "thr_123",
    "preview": "",
    "ephemeral": false,
    "modelProvider": "openai",
    "createdAt": 1730910000
  }
} }
{ "method": "thread/started", "params": { "thread": { "id": "thr_123" } } }
```

`serviceName` 是可选的。当你希望 app-server 用你的集成服务名称标记线程级指标时设置它。

`thread.sessionId` 标识当前活动会话树的根。根线程使用自己的线程 id 作为会话 id；fork 的线程保留其来源根的会话 id。客户端应从 `thread.sessionId` 读取会话 id，而不是从线程 id 推导。

要继续已存储的会话，使用你之前记录的 `thread.id` 调用 `thread/resume`。响应结构与 `thread/start` 匹配。你还可以传递 `thread/start` 支持的相同配置覆盖，例如 `personality`：

```json
{ "method": "thread/resume", "id": 11, "params": {
  "threadId": "thr_123",
  "personality": "friendly"
} }
{ "id": 11, "result": { "thread": { "id": "thr_123", "name": "Bug bash notes", "ephemeral": false } } }
```

恢复线程本身不会更新 `thread.updatedAt`（或推出文件的修改时间）。时间戳会在你启动轮次时更新。

如果你在配置中将已启用的 MCP 服务器标记为 `required`，并且该服务器初始化失败，`thread/start` 和 `thread/resume` 会失败而不是在没有它的情况下继续。

`thread/start` 上的 `dynamicTools` 是一个实验性字段（需要 `capabilities.experimentalApi = true`）。Codex 将这些动态工具持久化到线程推出元数据中，并在你未提供新动态工具时在 `thread/resume` 时恢复它们。

如果你使用与推出中记录的不同模型恢复，Codex 会发出警告并在下一个轮次应用一次性的模型切换指令。

### 管理线程目标

使用 `thread/goal/set`、`thread/goal/get` 和 `thread/goal/clear` 管理与 TUI 中 `/goal` 显示的相同的持久化目标状态。

```json
{ "method": "thread/goal/set", "id": 13, "params": {
  "threadId": "thr_123",
  "objective": "Finish the migration and keep tests green",
  "status": "active",
  "tokenBudget": 40000
} }
{ "id": 13, "result": { "goal": {
  "threadId": "thr_123",
  "objective": "Finish the migration and keep tests green",
  "status": "active",
  "tokenBudget": 40000,
  "tokensUsed": 0,
  "timeUsedSeconds": 0
} } }
{ "method": "thread/goal/updated", "params": {
  "threadId": "thr_123",
  "goal": {
    "threadId": "thr_123",
    "objective": "Finish the migration and keep tests green",
    "status": "active",
    "tokenBudget": 40000,
    "tokensUsed": 0,
    "timeUsedSeconds": 0
  }
} }
```

目标 objective 必须非空且最多 4,000 个字符。提供新的 objective 会替换目标并重置使用量统计。提供当前非终端 objective，或省略 `objective`，会更新状态或 token 预算同时保留使用历史。

要从已存储的会话分支，使用 `thread.id` 调用 `thread/fork`。这会创建一个新的线程 id 并为其发出 `thread/started` 通知：

```json
{ "method": "thread/fork", "id": 12, "params": { "threadId": "thr_123" } }
{ "id": 12, "result": { "thread": { "id": "thr_456", "sessionId": "thr_123", "forkedFromId": "thr_123" } } }
{ "method": "thread/started", "params": { "thread": { "id": "thr_456" } } }
```

当设置了面向用户的线程标题时，app-server 在 `thread/list`、`thread/read`、`thread/resume`、`thread/unarchive` 和 `thread/rollback` 响应中填充 `thread.name`。`thread/start` 和 `thread/fork` 可能省略 `name`（或返回 `null`），直到稍后设置标题。

### 读取已存储的线程（不恢复）

当你需要已存储的线程数据但不想恢复线程或订阅其事件时使用 `thread/read`。

- `includeTurns` - 当为 `true` 时，响应包含线程的轮次；当为 `false` 或省略时，你只获得线程摘要。
- 返回的 `thread` 对象包含运行时 `status`（`notLoaded`、`idle`、`systemError` 或带 `activeFlags` 的 `active`）。

```json
{ "method": "thread/read", "id": 19, "params": { "threadId": "thr_123", "includeTurns": true } }
{ "id": 19, "result": { "thread": { "id": "thr_123", "name": "Bug bash notes", "ephemeral": false, "status": { "type": "notLoaded" }, "turns": [] } } }
```

与 `thread/resume` 不同，`thread/read` 不会将线程加载到内存中，也不会发出 `thread/started`。

### 列出线程轮次

使用 `thread/turns/list` 分页浏览已存储线程的轮次历史而不恢复它。结果默认为最新优先，因此客户端可以使用 `nextCursor` 获取较旧的轮次。响应还包含 `backwardsCursor`；将其作为 `cursor` 配合 `sortDirection: "asc"` 传递，以获取比前一页第一个项目更新的轮次。

`itemsView` 控制响应包含多少轮次项目数据：

- `notLoaded` 省略项目。
- `summary` 返回摘要项目数据，省略时为默认值。
- `full` 返回完整项目数据。

```json
{ "method": "thread/turns/list", "id": 20, "params": {
  "threadId": "thr_123",
  "limit": 50,
  "sortDirection": "desc",
  "itemsView": "summary"
} }
{ "id": 20, "result": {
  "data": [],
  "nextCursor": "older-turns-cursor-or-null",
  "backwardsCursor": "newer-turns-cursor-or-null"
} }
```

`thread/turns/items/list` 保留用于分页轮次项目加载，但当前服务器返回不支持的方法错误。

### 列出线程（带分页和过滤）

`thread/list` 让你渲染历史 UI。结果默认按 `createdAt` 最新优先。过滤在分页之前应用。传递任意组合：

- `cursor` - 来自先前响应的不透明字符串；第一页省略。
- `limit` - 如果未设置，服务器默认为合理的页面大小。
- `sortKey` - `created_at`（默认）或 `updated_at`。
- `modelProviders` - 将结果限制为特定提供者；未设置、null 或空数组包含所有提供者。
- `sourceKinds` - 将结果限制为特定线程源。当省略或为 `[]` 时，服务器默认为仅交互式源：`cli` 和 `vscode`。
- `archived` - 当为 `true` 时，仅列出归档线程。当为 `false` 或省略时，列出非归档线程（默认）。
- `cwd` - 将结果限制为会话当前工作目录完全匹配此路径的线程。
- `searchTerm` - 在分页前搜索已存储的线程摘要和元数据。

`sourceKinds` 接受以下值：

- `cli`
- `vscode`
- `exec`
- `appServer`
- `subAgent`
- `subAgentReview`
- `subAgentCompact`
- `subAgentThreadSpawn`
- `subAgentOther`
- `unknown`

示例：

```json
{ "method": "thread/list", "id": 20, "params": {
  "cursor": null,
  "limit": 25,
  "sortKey": "created_at"
} }
{ "id": 20, "result": {
  "data": [
    { "id": "thr_a", "preview": "Create a TUI", "ephemeral": false, "modelProvider": "openai", "createdAt": 1730831111, "updatedAt": 1730831111, "name": "TUI prototype", "status": { "type": "notLoaded" } },
    { "id": "thr_b", "preview": "Fix tests", "ephemeral": true, "modelProvider": "openai", "createdAt": 1730750000, "updatedAt": 1730750000, "status": { "type": "notLoaded" } }
  ],
  "nextCursor": "opaque-token-or-null"
} }
```

当 `nextCursor` 为 `null` 时，你已到达最后一页。

### 更新已存储的线程元数据

使用 `thread/metadata/update` 在不恢复线程的情况下修补已存储的线程元数据。当前支持持久化 `gitInfo`；省略的字段保持不变，显式 `null` 清除已存储的值。

```json
{ "method": "thread/metadata/update", "id": 21, "params": {
  "threadId": "thr_123",
  "gitInfo": { "branch": "feature/sidebar-pr" }
} }
{ "id": 21, "result": {
  "thread": {
    "id": "thr_123",
    "gitInfo": { "sha": null, "branch": "feature/sidebar-pr", "originUrl": null }
  }
} }
```

### 跟踪线程状态变化

每当已加载线程的运行时状态变化时发出 `thread/status/changed`。有效负载包含 `threadId` 和新的 `status`。

```json
{
  "method": "thread/status/changed",
  "params": {
    "threadId": "thr_123",
    "status": { "type": "active", "activeFlags": ["waitingOnApproval"] }
  }
}
```

### 列出已加载的线程

`thread/loaded/list` 返回当前在内存中加载的线程 ID。

```json
{ "method": "thread/loaded/list", "id": 21 }
{ "id": 21, "result": { "data": ["thr_123", "thr_456"] } }
```

### 取消订阅已加载的线程

`thread/unsubscribe` 移除当前连接对线程的订阅。响应状态为以下之一：

- `unsubscribed` 当连接已订阅且现在已移除。
- `notSubscribed` 当连接未订阅该线程。
- `notLoaded` 当线程未加载。

如果这是最后一个订阅者，服务器会保持线程加载直到没有订阅者且线程活动持续 30 分钟。当宽限期到期时，app-server 卸载线程并发出 `thread/status/changed` 转换到 `notLoaded` 以及 `thread/closed`。

```json
{ "method": "thread/unsubscribe", "id": 22, "params": { "threadId": "thr_123" } }
{ "id": 22, "result": { "status": "unsubscribed" } }
```

如果线程稍后过期：

```json
{ "method": "thread/status/changed", "params": {
    "threadId": "thr_123",
    "status": { "type": "notLoaded" }
} }
{ "method": "thread/closed", "params": { "threadId": "thr_123" } }
```

### 归档线程

使用 `thread/archive` 将持久化的线程日志（以磁盘上的 JSONL 文件存储）移入归档会话目录。

```json
{ "method": "thread/archive", "id": 22, "params": { "threadId": "thr_b" } }
{ "id": 22, "result": {} }
{ "method": "thread/archived", "params": { "threadId": "thr_b" } }
```

归档线程不会出现在后续 `thread/list` 调用中，除非你传递 `archived: true`。

### 取消归档线程

使用 `thread/unarchive` 将归档的线程推出恢复到活动会话目录。

```json
{ "method": "thread/unarchive", "id": 24, "params": { "threadId": "thr_b" } }
{ "id": 24, "result": { "thread": { "id": "thr_b", "name": "Bug bash notes" } } }
{ "method": "thread/unarchived", "params": { "threadId": "thr_b" } }
```

### 触发线程压缩

使用 `thread/compact/start` 触发线程的手动历史压缩。请求立即返回 `{}`。

App-server 在同一 `threadId` 上以标准 `turn/*` 和 `item/*` 通知发出进度，包括 `contextCompaction` 项目生命周期（`item/started` 然后 `item/completed`）。

```json
{ "method": "thread/compact/start", "id": 25, "params": { "threadId": "thr_b" } }
{ "id": 25, "result": {} }
```

### 运行线程 shell 命令

使用 `thread/shellCommand` 运行属于线程的用户发起的 shell 命令。请求立即返回 `{}`，同时进度通过标准 `turn/*` 和 `item/*` 通知流式传输。

此 API 在沙箱外运行，具有完全访问权限，不继承线程沙箱策略。客户端应仅对显式用户发起的命令公开它。

如果线程已有活动轮次，命令作为该轮次的辅助操作运行，其格式化输出被注入轮次的消息流中。如果线程空闲，app-server 为 shell 命令启动一个独立轮次。

```json
{ "method": "thread/shellCommand", "id": 26, "params": { "threadId": "thr_b", "command": "git status --short" } }
{ "id": 26, "result": {} }
```

### 清理后台终端

使用 `thread/backgroundTerminals/clean` 停止与线程关联的所有运行中后台终端。此方法是实验性的，需要 `capabilities.experimentalApi = true`。

```json
{ "method": "thread/backgroundTerminals/clean", "id": 27, "params": { "threadId": "thr_b" } }
{ "id": 27, "result": {} }
```

### 回滚最近的轮次

使用 `thread/rollback` 从内存上下文中移除最后 `numTurns` 个条目，并在推出日志中持久化回滚标记。返回的 `thread` 包含回滚后填充的 `turns`。

```json
{ "method": "thread/rollback", "id": 28, "params": { "threadId": "thr_b", "numTurns": 1 } }
{ "id": 28, "result": { "thread": { "id": "thr_b", "name": "Bug bash notes", "ephemeral": false } } }
```

## 轮次

`input` 字段接受项目列表：

- `{ "type": "text", "text": "Explain this diff" }`
- `{ "type": "image", "url": "https://.../design.png" }`
- `{ "type": "localImage", "path": "/tmp/screenshot.png" }`

你可以覆盖每个轮次的配置设置（模型、effort、个性、`cwd`、沙箱策略、摘要）。当指定时，这些设置成为同一线程后续轮次的默认值。`outputSchema` 仅应用于当前轮次。对于 `sandboxPolicy.type = "externalSandbox"`，将 `networkAccess` 设置为 `restricted` 或 `enabled`；对于 `workspaceWrite`，`networkAccess` 保持布尔值。

对于 `turn/start.collaborationMode`，`settings.developer_instructions: null` 表示"使用所选模式的内置指令"，而不是清除模式指令。

### 沙箱读取访问（`ReadOnlyAccess`）

`sandboxPolicy` 支持显式读取访问控制：

- `readOnly`：可选 `access`（默认 `{ "type": "fullAccess" }`，或受限根）。
- `workspaceWrite`：可选 `readOnlyAccess`（默认 `{ "type": "fullAccess" }`，或受限根）。

受限读取访问结构：

```json
{
  "type": "restricted",
  "includePlatformDefaults": true,
  "readableRoots": ["/Users/me/shared-read-only"]
}
```

在 macOS 上，`includePlatformDefaults: true` 为受限读取会话追加精心策划的平台默认 Seatbelt 策略。这在不广泛允许所有 `/System` 的情况下提高了工具兼容性。

示例：

```json
{ "type": "readOnly", "access": { "type": "fullAccess" } }
```

```json
{
  "type": "workspaceWrite",
  "writableRoots": ["/Users/me/project"],
  "readOnlyAccess": {
    "type": "restricted",
    "includePlatformDefaults": true,
    "readableRoots": ["/Users/me/shared-read-only"]
  },
  "networkAccess": false
}
```

### 开始轮次

```json
{ "method": "turn/start", "id": 30, "params": {
  "threadId": "thr_123",
  "input": [ { "type": "text", "text": "Run tests" } ],
  "cwd": "/Users/me/project",
  "approvalPolicy": "unlessTrusted",
  "sandboxPolicy": {
    "type": "workspaceWrite",
    "writableRoots": ["/Users/me/project"],
    "networkAccess": true
  },
  "model": "gpt-5.4",
  "effort": "medium",
  "summary": "concise",
  "personality": "friendly",
  "outputSchema": {
    "type": "object",
    "properties": { "answer": { "type": "string" } },
    "required": ["answer"],
    "additionalProperties": false
  }
} }
{ "id": 30, "result": { "turn": { "id": "turn_456", "status": "inProgress", "items": [], "error": null } } }
```

### 向线程注入项目

使用 `thread/inject_items` 将预构建的 Responses API 项目追加到已加载线程的提示词历史中，而不启动用户轮次。这些项目被持久化到推出中，并包含在后续模型请求中。

```json
{ "method": "thread/inject_items", "id": 31, "params": {
  "threadId": "thr_123",
  "items": [
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Previously computed context." }]
    }
  ]
} }
{ "id": 31, "result": {} }
```

### 引导活动轮次

使用 `turn/steer` 将更多用户输入追加到活动的正在进行轮次。

- 包含 `expectedTurnId`；它必须匹配活动轮次 id。
- 如果线程上没有活动轮次，请求会失败。
- `turn/steer` 不会发出新的 `turn/started` 通知。
- `turn/steer` 不接受轮次级覆盖（`model`、`cwd`、`sandboxPolicy` 或 `outputSchema`）。

```json
{ "method": "turn/steer", "id": 32, "params": {
  "threadId": "thr_123",
  "input": [ { "type": "text", "text": "Actually focus on failing tests first." } ],
  "expectedTurnId": "turn_456"
} }
{ "id": 32, "result": { "turnId": "turn_456" } }
```

### 开始轮次（调用技能）

通过在文本输入中包含 `$<skill-name>` 并在旁边添加 `skill` 输入项目来显式调用技能。

```json
{ "method": "turn/start", "id": 33, "params": {
  "threadId": "thr_123",
  "input": [
    { "type": "text", "text": "$skill-creator Add a new skill for triaging flaky CI and include step-by-step usage." },
    { "type": "skill", "name": "skill-creator", "path": "/Users/me/.codex/skills/skill-creator/SKILL.md" }
  ]
} }
{ "id": 33, "result": { "turn": { "id": "turn_457", "status": "inProgress", "items": [], "error": null } } }
```

### 中断轮次

```json
{ "method": "turn/interrupt", "id": 31, "params": { "threadId": "thr_123", "turnId": "turn_456" } }
{ "id": 31, "result": {} }
```

成功后，轮次以 `status: "interrupted"` 完成。

## 审查

`review/start` 为线程运行 Codex 审查器并流式传输审查项目。目标包括：

- `uncommittedChanges`
- `baseBranch`（与分支的 diff）
- `commit`（审查特定提交）
- `custom`（自由格式指令）

使用 `delivery: "inline"`（默认）在现有线程上运行审查，或使用 `delivery: "detached"` fork 一个新的审查线程。

请求/响应示例：

```json
{ "method": "review/start", "id": 40, "params": {
  "threadId": "thr_123",
  "delivery": "inline",
  "target": { "type": "commit", "sha": "1234567deadbeef", "title": "Polish tui colors" }
} }
{ "id": 40, "result": {
  "turn": {
    "id": "turn_900",
    "status": "inProgress",
    "items": [
      { "type": "userMessage", "id": "turn_900", "content": [ { "type": "text", "text": "Review commit 1234567: Polish tui colors" } ] }
    ],
    "error": null
  },
  "reviewThreadId": "thr_123"
} }
```

对于分离审查，使用 `"delivery": "detached"`。响应结构相同，但 `reviewThreadId` 将是新审查线程的 id（与原始 `threadId` 不同）。服务器还会在流式传输审查轮次之前为该新线程发出 `thread/started` 通知。

Codex 流式传输通常的 `turn/started` 通知，然后是带有 `enteredReviewMode` 项目的 `item/started`：

```json
{
  "method": "item/started",
  "params": {
    "item": {
      "type": "enteredReviewMode",
      "id": "turn_900",
      "review": "current changes"
    }
  }
}
```

当审查器完成时，服务器发出 `item/started` 和 `item/completed`，包含带有最终审查文本的 `exitedReviewMode` 项目：

```json
{
  "method": "item/completed",
  "params": {
    "item": {
      "type": "exitedReviewMode",
      "id": "turn_900",
      "review": "Looks solid overall..."
    }
  }
}
```

使用此通知在客户端中渲染审查器输出。

## 进程执行

`process/*` 是一个实验性的显式进程控制 API。它需要 `capabilities.experimentalApi = true` 并在 Codex 的沙箱外运行。仅当你的客户端有意在没有沙箱的情况下公开本地进程控制时使用它。

使用 `process/spawn` 启动进程并提供 `processHandle`，然后使用该句柄进行 stdin、调整大小和终止请求。输出通过 `process/outputDelta` 通知流式传输，完成通过 `process/exited` 流式传输。

```json
{ "method": "process/spawn", "id": 48, "params": {
  "command": ["python3", "-m", "pytest", "-q"],
  "processHandle": "pytest-1",
  "cwd": "/Users/me/project",
  "tty": true
} }
{ "id": 48, "result": {} }
{ "method": "process/outputDelta", "params": {
  "processHandle": "pytest-1",
  "stream": "stdout",
  "deltaBase64": "Li4u"
} }
{ "method": "process/exited", "params": {
  "processHandle": "pytest-1",
  "exitCode": 0
} }
```

使用 `process/writeStdin` 配合 `deltaBase64`、`closeStdin` 或两者来发送输入。使用 `process/resizePty` 进行 PTY 调整大小事件，使用 `process/kill` 终止正在运行的进程。

## 命令执行

`command/exec` 在服务器沙箱下单个命令（`argv` 数组），无需创建线程。

```json
{ "method": "command/exec", "id": 50, "params": {
  "command": ["ls", "-la"],
  "cwd": "/Users/me/project",
  "sandboxPolicy": { "type": "workspaceWrite" },
  "timeoutMs": 10000
} }
{ "id": 50, "result": { "exitCode": 0, "stdout": "...", "stderr": "" } }
```

如果你已经对服务器进程进行了沙箱化并希望 Codex 跳过自己的沙箱强制执行，请使用 `sandboxPolicy.type = "externalSandbox"`。对于外部沙箱模式，将 `networkAccess` 设置为 `restricted`（默认）或 `enabled`。对于 `readOnly` 和 `workspaceWrite`，使用上面显示的相同可选 `access` / `readOnlyAccess` 结构。

注意事项：

- 服务器拒绝空的 `command` 数组。
- `sandboxPolicy` 接受与 `turn/start` 使用的相同结构（例如 `dangerFullAccess`、`readOnly`、`workspaceWrite`、`externalSandbox`）。
- 省略时，`timeoutMs` 回退到服务器默认值。
- 设置 `tty: true` 以获得 PTY 支持的会话，当你计划后续使用 `command/exec/write`、`command/exec/resize` 或 `command/exec/terminate` 时使用 `processId`。
- 设置 `streamStdoutStderr: true` 以在命令运行时接收 `command/exec/outputDelta` 通知。

### 读取管理员需求（`configRequirements/read`）

使用 `configRequirements/read` 检查从 `requirements.toml` 和/或 MDM 加载的有效管理员需求。

```json
{ "method": "configRequirements/read", "id": 52, "params": {} }
{ "id": 52, "result": {
  "requirements": {
    "allowedApprovalPolicies": ["onRequest", "unlessTrusted"],
    "allowedSandboxModes": ["readOnly", "workspaceWrite"],
    "featureRequirements": {
      "personality": true,
      "unified_exec": false
    },
    "network": {
      "enabled": true,
      "allowedDomains": ["api.openai.com"],
      "allowUnixSockets": ["/tmp/example.sock"],
      "dangerouslyAllowAllUnixSockets": false
    }
  }
} }
```

当没有配置需求时，`result.requirements` 为 `null`。支持的键和值的详细信息请参阅 [`requirements.toml`](https://developers.openai.com/codex/config-reference#requirementstoml) 文档。

### Windows 沙箱设置（`windowsSandbox/setupStart`）

自定义 Windows 客户端可以异步触发沙箱设置，而不是在启动检查时阻塞。

```json
{ "method": "windowsSandbox/setupStart", "id": 53, "params": { "mode": "elevated" } }
{ "id": 53, "result": { "started": true } }
```

App-server 在后台启动设置，稍后发出完成通知：

```json
{
  "method": "windowsSandbox/setupCompleted",
  "params": { "mode": "elevated", "success": true, "error": null }
}
```

模式：

- `elevated` - 运行提升的 Windows 沙箱设置路径。
- `unelevated` - 运行旧版设置/预检路径。

## 文件系统

v2 文件系统 API 操作绝对路径。当客户端需要在文件或目录更改后使 UI 状态无效时使用 `fs/watch`。

```json
{ "method": "fs/watch", "id": 54, "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1",
  "path": "/Users/me/project/.git/HEAD"
} }
{ "id": 54, "result": { "path": "/Users/me/project/.git/HEAD" } }
{ "method": "fs/changed", "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1",
  "changedPaths": ["/Users/me/project/.git/HEAD"]
} }
{ "method": "fs/unwatch", "id": 55, "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1"
} }
{ "id": 55, "result": {} }
```

监视文件会为该文件路径发出 `fs/changed`，包括通过替换或重命名操作传递的更新。

## 事件

事件通知是服务器发起的线程生命周期、轮次生命周期及其中项目的数据流。在你启动或恢复线程后，持续从活动传输流中读取 `thread/started`、`thread/archived`、`thread/unarchived`、`thread/closed`、`thread/status/changed`、`turn/*`、`item/*` 和 `serverRequest/resolved` 通知。

### 通知退出

客户端可以通过在 `initialize.params.capabilities.optOutNotificationMethods` 中发送精确方法名称来按连接抑制特定通知。

- 仅精确匹配：`item/agentMessage/delta` 仅抑制该方法。
- 未知方法名称被忽略。
- 应用于当前 `thread/*`、`turn/*`、`item/*` 和相关 v2 通知。
- 不应用于请求、响应或错误。

### 模糊文件搜索事件（实验性）

模糊文件搜索会话 API 发出每查询通知：

- `fuzzyFileSearch/sessionUpdated` - `{ sessionId, query, files }`，包含活动查询的当前匹配。
- `fuzzyFileSearch/sessionCompleted` - `{ sessionId }`，该查询的索引和匹配完成后。

### Windows 沙箱设置事件

- `windowsSandbox/setupCompleted` - `{ mode, success, error }`，在 `windowsSandbox/setupStart` 请求完成后发出。

### 轮次事件

- `turn/started` - `{ turn }`，包含轮次 id、空 `items` 和 `status: "inProgress"`。
- `turn/completed` - `{ turn }`，其中 `turn.status` 为 `completed`、`interrupted` 或 `failed`；失败时携带 `{ error: { message, codexErrorInfo?, additionalDetails? } }`。
- `turn/diff/updated` - `{ threadId, turnId, diff }`，包含轮次中每个文件更改的最新聚合统一 diff。
- `turn/plan/updated` - `{ turnId, explanation?, plan }`，当代理共享或更改其计划时发出；每个 `plan` 条目为 `{ step, status }`，其中 `status` 为 `pending`、`inProgress` 或 `completed`。
- `thread/tokenUsage/updated` - 活动线程的使用量更新。

`turn/diff/updated` 和 `turn/plan/updated` 当前即使在项目事件流式传输时也包含空 `items` 数组。使用 `item/*` 通知作为轮次项目的权威来源。

### 项目

`ThreadItem` 是轮次响应和 `item/*` 通知中携带的标记联合类型。常见项目类型包括：

- `userMessage` - `{id, content}`，其中 `content` 是用户输入列表（`text`、`image` 或 `localImage`）。
- `agentMessage` - `{id, text, phase?}`，包含累积的代理回复。当存在时，`phase` 使用 Responses API 线上值（`commentary`、`final_answer`）。
- `plan` - `{id, text}`，包含计划模式中的拟议计划文本。将 `item/completed` 中的最终 `plan` 项目视为权威。
- `reasoning` - `{id, summary, content}`，其中 `summary` 持有流式推理摘要，`content` 持有原始推理块。
- `commandExecution` - `{id, command, cwd, status, commandActions, aggregatedOutput?, exitCode?, durationMs?}`。
- `fileChange` - `{id, changes, status}`，描述拟议编辑；`changes` 列表 `{path, kind, diff}`。
- `mcpToolCall` - `{id, server, tool, status, arguments, result?, error?}`。
- `dynamicToolCall` - `{id, tool, arguments, status, contentItems?, success?, durationMs?}`，用于客户端执行的动态工具调用。
- `collabToolCall` - `{id, tool, status, senderThreadId, receiverThreadId?, newThreadId?, prompt?, agentStatus?}`。
- `webSearch` - `{id, query, action?}`，用于代理发出的网络搜索请求。
- `imageView` - `{id, path}`，当代理调用图像查看器工具时发出。
- `enteredReviewMode` - `{id, review}`，审查器启动时发送。
- `exitedReviewMode` - `{id, review}`，审查器完成时发出。
- `contextCompaction` - `{id}`，当 Codex 压缩对话历史时发出。

对于 `webSearch.action`，action `type` 可以是 `search`（`query?`、`queries?`）、`openPage`（`url?`）或 `findInPage`（`url?`、`pattern?`）。

app server 弃用了旧版 `thread/compacted` 通知；请改用 `contextCompaction` 项目。

所有项目发出两个共享生命周期事件：

- `item/started` - 当新工作单元开始时发出完整 `item`；`item.id` 与 deltas 使用的 `itemId` 匹配。
- `item/completed` - 工作完成后发送最终 `item`；将其视为权威状态。

### 项目增量

- `item/agentMessage/delta` - 追加代理消息的流式文本。
- `item/plan/delta` - 流式传输拟议计划文本。最终 `plan` 项目可能不完全等于连接的 deltas。
- `item/reasoning/summaryTextDelta` - 流式传输可读的推理摘要；当新摘要部分打开时 `summaryIndex` 递增。
- `item/reasoning/summaryPartAdded` - 标记推理摘要部分之间的边界。
- `item/reasoning/textDelta` - 流式传输原始推理文本（当模型支持时）。
- `item/commandExecution/outputDelta` - 流式传输命令的 stdout/stderr；按顺序追加 deltas。
- `item/fileChange/outputDelta` - 旧版 `apply_patch` 文本输出的弃用兼容性通知。当前 app-server 版本不再发出它；请改用 `fileChange` 项目和 `turn/diff/updated`。

## 错误

如果轮次失败，服务器发出带有 `{ error: { message, codexErrorInfo?, additionalDetails? } }` 的 `error` 事件，然后以 `status: "failed"` 完成轮次。当上游 HTTP 状态可用时，它出现在 `codexErrorInfo.httpStatusCode` 中。

常见 `codexErrorInfo` 值包括：

- `ContextWindowExceeded`
- `UsageLimitExceeded`
- `HttpConnectionFailed`（4xx/5xx 上游错误）
- `ResponseStreamConnectionFailed`
- `ResponseStreamDisconnected`
- `ResponseTooManyFailedAttempts`
- `BadRequest`、`Unauthorized`、`SandboxError`、`InternalServerError`、`Other`

当上游 HTTP 状态可用时，服务器在相关 `codexErrorInfo` 变体的 `httpStatusCode` 中转发它。

## 审批

根据用户的 Codex 设置，命令执行和文件更改可能需要审批。app-server 向客户端发送服务器发起的 JSON-RPC 请求，客户端以决策有效负载响应。

- 命令执行决策：`accept`、`acceptForSession`、`decline`、`cancel` 或 `{ "acceptWithExecpolicyAmendment": { "execpolicy_amendment": ["cmd", "..."] } }`。
- 文件更改决策：`accept`、`acceptForSession`、`decline`、`cancel`。

- 请求包含 `threadId` 和 `turnId` - 使用它们将 UI 状态限定到活动对话。
- 服务器恢复或拒绝工作，并以 `item/completed` 结束项目。

### 命令执行审批

消息顺序：

1. `item/started` 显示带有 `command`、`cwd` 和其他字段的待处理 `commandExecution` 项目。
2. `item/commandExecution/requestApproval` 包含 `itemId`、`threadId`、`turnId`、可选 `reason`、可选 `command`、可选 `cwd`、可选 `commandActions`、可选 `proposedExecpolicyAmendment`、可选 `networkApprovalContext` 和可选 `availableDecisions`。当 `initialize.params.capabilities.experimentalApi = true` 时，有效负载还可以包含实验性 `additionalPermissions`，描述请求的每命令沙箱访问。`additionalPermissions` 中的任何文件系统路径在线上是绝对的。
3. 客户端以上述命令执行审批决策之一响应。
4. `serverRequest/resolved` 确认待处理请求已得到回答或清除。
5. `item/completed` 返回带有 `status: completed | failed | declined` 的最终 `commandExecution` 项目。

当 `networkApprovalContext` 存在时，提示是针对受管网络访问（而不是一般的 shell 命令审批）。当前 v2 模式公开目标 `host` 和 `protocol`；客户端应渲染特定于网络的提示，而不是依赖 `command` 作为用户可理解的 shell 命令预览。

Codex 按目标（`host`、protocol 和 port）对并发网络审批提示进行分组。因此 app-server 可能发送一个提示来解除对同一目标的多个排队请求的阻塞，而同一主机上的不同端口被单独处理。

### 文件更改审批

消息顺序：

1. `item/started` 发出带有拟议 `changes` 和 `status: "inProgress"` 的 `fileChange` 项目。
2. `item/fileChange/requestApproval` 包含 `itemId`、`threadId`、`turnId`、可选 `reason` 和可选 `grantRoot`。
3. 客户端以上述文件更改审批决策之一响应。
4. `serverRequest/resolved` 确认待处理请求已得到回答或清除。
5. `item/completed` 返回带有 `status: completed | failed | declined` 的最终 `fileChange` 项目。

### `tool/requestUserInput`

当客户端响应 `item/tool/requestUserInput` 时，app-server 发出带有 `{ threadId, requestId }` 的 `serverRequest/resolved`。如果在客户端回答之前，待处理请求被轮次开始、轮次完成或轮次中断清除，服务器会为该清理发出相同的通知。

### 动态工具调用（实验性）

`thread/start` 上的 `dynamicTools` 和相应的 `item/tool/call` 请求或响应流是实验性 API。

动态工具名称和命名空间名称必须遵循 Responses API 命名约束。避免使用 Codex 内置工具使用的保留命名空间名称。

当轮次中调用动态工具时，app-server 发出：

1. `item/started`，包含 `item.type = "dynamicToolCall"`、`status = "inProgress"`，以及 `tool` 和 `arguments`。
2. `item/tool/call` 作为服务器对客户端的请求。
3. 客户端返回内容项目的响应有效负载。
4. `item/completed`，包含 `item.type = "dynamicToolCall"`、最终 `status`，以及任何返回的 `contentItems` 或 `success` 值。

### MCP 工具调用审批（应用）

应用（连接器）工具调用也可能需要审批。当应用工具调用有副作用时，服务器可能通过 `tool/requestUserInput` 和**接受**、**拒绝**和**取消**等选项征求审批。破坏性工具注解即使工具也宣传较低权限的提示也总是触发审批。如果用户拒绝或取消，相关的 `mcpToolCall` 项目会以错误完成而不是运行工具。

## 技能

通过在用户文本输入中包含 `$<skill-name>` 来调用技能。添加 `skill` 输入项目（推荐），以便服务器注入完整的技能指令，而不是依赖模型来解析名称。

```json
{
  "method": "turn/start",
  "id": 101,
  "params": {
    "threadId": "thread-1",
    "input": [
      {
        "type": "text",
        "text": "$skill-creator Add a new skill for triaging flaky CI."
      },
      {
        "type": "skill",
        "name": "skill-creator",
        "path": "/Users/me/.codex/skills/skill-creator/SKILL.md"
      }
    ]
  }
}
```

如果你省略 `skill` 项目，模型仍然会解析 `$<skill-name>` 标记并尝试定位技能，这可能会增加延迟。

示例：

```
$skill-creator Add a new skill for triaging flaky CI and include step-by-step usage.
```

使用 `skills/list` 获取可用技能（可选按 `cwds` 限定范围，支持 `forceReload`）。你还可以包含 `perCwdExtraUserRoots` 以扫描额外的绝对路径作为特定 `cwd` 值的 `user` 范围。App-server 忽略 `cwd` 不在 `cwds` 中的条目。`skills/list` 可能按 `cwd` 重用缓存结果；设置 `forceReload: true` 从磁盘刷新。当存在时，服务器从 `SKILL.json` 读取 `interface` 和 `dependencies`。

```json
{ "method": "skills/list", "id": 25, "params": {
  "cwds": ["/Users/me/project", "/Users/me/other-project"],
  "forceReload": true,
  "perCwdExtraUserRoots": [
    {
      "cwd": "/Users/me/project",
      "extraUserRoots": ["/Users/me/shared-skills"]
    }
  ]
} }
{ "id": 25, "result": {
  "data": [{
    "cwd": "/Users/me/project",
    "skills": [
      {
        "name": "skill-creator",
        "description": "Create or update a Codex skill",
        "enabled": true,
        "interface": {
          "displayName": "Skill Creator",
          "shortDescription": "Create or update a Codex skill"
        },
        "dependencies": {
          "tools": [
            {
              "type": "env_var",
              "value": "GITHUB_TOKEN",
              "description": "GitHub API token"
            },
            {
              "type": "mcp",
              "value": "github",
              "transport": "streamable_http",
              "url": "https://example.com/mcp"
            }
          ]
        }
      }
    ],
    "errors": []
  }]
} }
```

当被监视的本地技能文件发生变化时，服务器还会发出 `skills/changed` 通知。将其视为无效信号，并在需要时使用当前参数重新运行 `skills/list`。

按路径启用或禁用技能：

```json
{
  "method": "skills/config/write",
  "id": 26,
  "params": {
    "path": "/Users/me/.codex/skills/skill-creator/SKILL.md",
    "enabled": false
  }
}
```

## 应用（连接器）

使用 `app/list` 获取可用应用。在 CLI/TUI 中，`/apps` 是面向用户的选择器；在自定义客户端中，直接调用 `app/list`。每个条目包含 `isAccessible`（对用户可用）和 `isEnabled`（在 `config.toml` 中启用），以便客户端区分安装/访问和本地启用状态。应用条目还可以包含可选 `branding`、`appMetadata` 和 `labels` 字段。

```json
{ "method": "app/list", "id": 50, "params": {
  "cursor": null,
  "limit": 50,
  "threadId": "thread-1",
  "forceRefetch": false
} }
{ "id": 50, "result": {
  "data": [
    {
      "id": "demo-app",
      "name": "Demo App",
      "description": "Example connector for documentation.",
      "logoUrl": "https://example.com/demo-app.png",
      "logoUrlDark": null,
      "distributionChannel": null,
      "branding": null,
      "appMetadata": null,
      "labels": null,
      "installUrl": "https://chatgpt.com/apps/demo-app/demo-app",
      "isAccessible": true,
      "isEnabled": true
    }
  ],
  "nextCursor": null
} }
```

如果你提供 `threadId`，应用功能门控（`features.apps`）使用该线程的配置快照。省略时，app-server 使用最新的全局配置。

`app/list` 在可访问应用和目录应用都加载完成后返回。设置 `forceRefetch: true` 绕过应用缓存并获取新数据。缓存条目仅在刷新成功时替换。

当任一来源（可访问应用或目录应用）完成加载时，服务器还会发出 `app/list/updated` 通知。每个通知包含最新的合并应用列表。

```json
{
  "method": "app/list/updated",
  "params": {
    "data": [
      {
        "id": "demo-app",
        "name": "Demo App",
        "description": "Example connector for documentation.",
        "logoUrl": "https://example.com/demo-app.png",
        "logoUrlDark": null,
        "distributionChannel": null,
        "branding": null,
        "appMetadata": null,
        "labels": null,
        "installUrl": "https://chatgpt.com/apps/demo-app/demo-app",
        "isAccessible": true,
        "isEnabled": true
      }
    ]
  }
}
```

通过在文本输入中插入 `$<app-slug>` 并添加带有 `app://<id>` 路径的 `mention` 输入项目（推荐）来调用应用。

```json
{
  "method": "turn/start",
  "id": 51,
  "params": {
    "threadId": "thread-1",
    "input": [
      {
        "type": "text",
        "text": "$demo-app Pull the latest updates from the team."
      },
      {
        "type": "mention",
        "name": "Demo App",
        "path": "app://demo-app"
      }
    ]
  }
}
```

### 应用设置的配置 RPC 示例

使用 `config/read`、`config/value/write` 和 `config/batchWrite` 检查或更新 `config.toml` 中的应用控件。

读取有效的应用配置结构（包括 `_default` 和每工具覆盖）：

```json
{ "method": "config/read", "id": 60, "params": { "includeLayers": false } }
{ "id": 60, "result": {
  "config": {
    "apps": {
      "_default": {
        "enabled": true,
        "destructive_enabled": true,
        "open_world_enabled": true
      },
      "google_drive": {
        "enabled": true,
        "destructive_enabled": false,
        "default_tools_approval_mode": "prompt",
        "tools": {
          "files/delete": { "enabled": false, "approval_mode": "approve" }
        }
      }
    }
  }
} }
```

更新单个应用设置：

```json
{
  "method": "config/value/write",
  "id": 61,
  "params": {
    "keyPath": "apps.google_drive.default_tools_approval_mode",
    "value": "prompt",
    "mergeStrategy": "replace"
  }
}
```

原子性地应用多个应用编辑：

```json
{
  "method": "config/batchWrite",
  "id": 62,
  "params": {
    "edits": [
      {
        "keyPath": "apps._default.destructive_enabled",
        "value": false,
        "mergeStrategy": "upsert"
      },
      {
        "keyPath": "apps.google_drive.tools.files/delete.approval_mode",
        "value": "approve",
        "mergeStrategy": "upsert"
      }
    ]
  }
}
```

### 检测和导入外部代理配置

使用 `externalAgentConfig/detect` 发现可迁移的外部代理产物，然后将选定的条目传递给 `externalAgentConfig/import`。

检测示例：

```json
{ "method": "externalAgentConfig/detect", "id": 63, "params": {
  "includeHome": true,
  "cwds": ["/Users/me/project"]
} }
{ "id": 63, "result": {
  "items": [
    {
      "itemType": "AGENTS_MD",
      "description": "Import /Users/me/project/CLAUDE.md to /Users/me/project/AGENTS.md.",
      "cwd": "/Users/me/project"
    },
    {
      "itemType": "SKILLS",
      "description": "Copy skill folders from /Users/me/.claude/skills to /Users/me/.agents/skills.",
      "cwd": null
    }
  ]
} }
```

导入示例：

```json
{ "method": "externalAgentConfig/import", "id": 64, "params": {
  "migrationItems": [
    {
      "itemType": "AGENTS_MD",
      "description": "Import /Users/me/project/CLAUDE.md to /Users/me/project/AGENTS.md.",
      "cwd": "/Users/me/project"
    }
  ]
} }
{ "id": 64, "result": {} }
```

当请求包含插件导入时，服务器在导入完成后发出 `externalAgentConfig/import/completed`。此通知可能在响应之后立即到达，也可能在后台远程导入完成后到达。

支持的 `itemType` 值为 `AGENTS_MD`、`CONFIG`、`SKILLS`、`PLUGINS` 和 `MCP_SERVER_CONFIG`。对于 `PLUGINS` 项目，`details.plugins` 列出 Codex 可以尝试迁移的每个 `marketplaceName` 和 `pluginNames`。检测仅返回仍有工作要做的项目。例如，当 `AGENTS.md` 已存在且非空时，Codex 跳过 AGENTS 迁移，技能导入不会覆盖现有技能目录。

当从 `.claude/settings.json` 检测插件时，Codex 从 `extraKnownMarketplaces` 读取已配置的市场来源。如果 `enabledPlugins` 包含来自 `claude-plugins-official` 的插件但市场来源缺失，Codex 推断 `anthropics/claude-plugins-official` 为来源。

## 认证端点

JSON-RPC 认证/账户表面公开请求/响应方法以及服务器发起的通知（无 `id`）。使用这些来确定认证状态、启动或取消登录、注销、检查 ChatGPT 速率限制，以及通知工作区所有者关于额度耗尽或使用限制。

### 认证模式

Codex 支持以下认证模式。`account/updated.authMode` 显示活动模式，并在可用时包含当前 ChatGPT `planType`。`account/read` 还报告账户和计划详细信息。

- **API 密钥（`apikey`）** - 调用者提供带有 `type: "apiKey"` 的 OpenAI API 密钥，Codex 将其存储用于 API 请求。
- **ChatGPT 托管（`chatgpt`）** - Codex 拥有 ChatGPT OAuth 流程，持久化 token 并自动刷新。使用 `type: "chatgpt"` 启动浏览器流程，或使用 `type: "chatgptDeviceCode"` 启动设备代码流程。
- **ChatGPT 外部 token（`chatgptAuthTokens`）** - 实验性，适用于已拥有用户 ChatGPT 认证生命周期的宿主应用。宿主应用直接提供 `accessToken`、`chatgptAccountId` 和可选 `chatgptPlanType`，并在被要求时必须刷新 token。

### API 概览

- `account/read` - 获取当前账户信息；可选刷新 token。
- `account/login/start` - 开始登录（`apiKey`、`chatgpt`、`chatgptDeviceCode` 或实验性 `chatgptAuthTokens`）。
- `account/login/completed`（通知）- 登录尝试完成时发出（成功或错误）。
- `account/login/cancel` - 通过 `loginId` 取消待处理的托管 ChatGPT 登录。
- `account/logout` - 登出；触发 `account/updated`。
- `account/updated`（通知）- 每当认证模式变化时发出（`authMode`：`apikey`、`chatgpt`、`chatgptAuthTokens` 或 `null`），并在可用时包含 `planType`。
- `account/chatgptAuthTokens/refresh`（服务器请求）- 在授权错误后请求新的外部托管 ChatGPT token。
- `account/rateLimits/read` - 获取 ChatGPT 速率限制。
- `account/rateLimits/updated`（通知）- 每当用户的 ChatGPT 速率限制变化时发出。
- `account/sendAddCreditsNudgeEmail` - 请求 ChatGPT 向工作区所有者发送关于额度耗尽或达到使用限制的电子邮件。
- `mcpServer/oauthLogin/completed`（通知）- 在 `mcpServer/oauth/login` 流程完成后发出；有效负载包含 `{ name, success, error? }`。
- `mcpServer/startupStatus/updated`（通知）- 当已加载线程的已配置 MCP 服务器启动状态变化时发出；有效负载包含 `{ name, status, error }`。

### 1) 检查认证状态

请求：

```json
{ "method": "account/read", "id": 1, "params": { "refreshToken": false } }
```

响应示例：

```json
{ "id": 1, "result": { "account": null, "requiresOpenaiAuth": false } }
```

```json
{ "id": 1, "result": { "account": null, "requiresOpenaiAuth": true } }
```

```json
{
  "id": 1,
  "result": { "account": { "type": "apiKey" }, "requiresOpenaiAuth": true }
}
```

```json
{
  "id": 1,
  "result": {
    "account": {
      "type": "chatgpt",
      "email": "user@example.com",
      "planType": "pro"
    },
    "requiresOpenaiAuth": true
  }
}
```

字段说明：

- `refreshToken`（布尔值）：设置为 `true` 以在托管 ChatGPT 模式下强制刷新 token。在外部 token 模式（`chatgptAuthTokens`）下，app-server 忽略此标志。
- `requiresOpenaiAuth` 反映活动提供者；当为 `false` 时，Codex 可以在没有 OpenAI 凭据的情况下运行。

### 2) 使用 API 密钥登录

1. 发送：

   ```json
   {
     "method": "account/login/start",
     "id": 2,
     "params": { "type": "apiKey", "apiKey": "sk-..." }
   }
   ```

2. 期望：

   ```json
   { "id": 2, "result": { "type": "apiKey" } }
   ```

3. 通知：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": null, "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "apikey", "planType": null }
   }
   ```

### 3) 使用 ChatGPT 登录（浏览器流程）

1. 开始：

   ```json
   { "method": "account/login/start", "id": 3, "params": { "type": "chatgpt" } }
   ```

   ```json
   {
     "id": 3,
     "result": {
       "type": "chatgpt",
       "loginId": "<uuid>",
       "authUrl": "https://chatgpt.com/...&redirect_uri=http%3A%2F%2Flocalhost%3A<port>%2Fauth%2Fcallback"
     }
   }
   ```

2. 在浏览器中打开 `authUrl`；app-server 托管本地回调。
3. 等待通知：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": "<uuid>", "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgpt", "planType": "plus" }
   }
   ```

### 3b) 使用 ChatGPT 登录（设备代码流程）

当你的客户端拥有登录仪式或浏览器回调不稳定时使用此流程。

1. 开始：

   ```json
   {
     "method": "account/login/start",
     "id": 4,
     "params": { "type": "chatgptDeviceCode" }
   }
   ```

   ```json
   {
     "id": 4,
     "result": {
       "type": "chatgptDeviceCode",
       "loginId": "<uuid>",
       "verificationUrl": "https://auth.openai.com/codex/device",
       "userCode": "ABCD-1234"
     }
   }
   ```

2. 向用户显示 `verificationUrl` 和 `userCode`；前端拥有用户体验。
3. 等待通知：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": "<uuid>", "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgpt", "planType": "plus" }
   }
   ```

### 3c) 使用外部托管的 ChatGPT token 登录（`chatgptAuthTokens`）

仅当宿主应用拥有用户的 ChatGPT 认证生命周期并直接提供 token 时使用此实验性模式。客户端必须在 `initialize` 期间设置 `capabilities.experimentalApi = true` 才能使用此登录类型。

1. 发送：

   ```json
   {
     "method": "account/login/start",
     "id": 7,
     "params": {
       "type": "chatgptAuthTokens",
       "accessToken": "<jwt>",
       "chatgptAccountId": "org-123",
       "chatgptPlanType": "business"
     }
   }
   ```

2. 期望：

   ```json
   { "id": 7, "result": { "type": "chatgptAuthTokens" } }
   ```

3. 通知：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": null, "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgptAuthTokens", "planType": "business" }
   }
   ```

当服务器收到 `401 Unauthorized` 时，它可能向宿主应用请求刷新的 token：

```json
{
  "method": "account/chatgptAuthTokens/refresh",
  "id": 8,
  "params": { "reason": "unauthorized", "previousAccountId": "org-123" }
}
{ "id": 8, "result": { "accessToken": "<jwt>", "chatgptAccountId": "org-123", "chatgptPlanType": "business" } }
```

服务器在成功刷新响应后重试原始请求。请求在约 10 秒后超时。

### 4) 取消 ChatGPT 登录

```json
{ "method": "account/login/cancel", "id": 4, "params": { "loginId": "<uuid>" } }
{ "method": "account/login/completed", "params": { "loginId": "<uuid>", "success": false, "error": "..." } }
```

### 5) 注销

```json
{ "method": "account/logout", "id": 5 }
{ "id": 5, "result": {} }
{ "method": "account/updated", "params": { "authMode": null, "planType": null } }
```

### 6) 速率限制（ChatGPT）

```json
{ "method": "account/rateLimits/read", "id": 6 }
{ "id": 6, "result": {
  "rateLimits": {
    "limitId": "codex",
    "limitName": null,
    "primary": { "usedPercent": 25, "windowDurationMins": 15, "resetsAt": 1730947200 },
    "secondary": null,
    "rateLimitReachedType": null
  },
  "rateLimitsByLimitId": {
    "codex": {
      "limitId": "codex",
      "limitName": null,
      "primary": { "usedPercent": 25, "windowDurationMins": 15, "resetsAt": 1730947200 },
      "secondary": null,
      "rateLimitReachedType": null
    },
    "codex_other": {
      "limitId": "codex_other",
      "limitName": "codex_other",
      "primary": { "usedPercent": 42, "windowDurationMins": 60, "resetsAt": 1730950800 },
      "secondary": null,
      "rateLimitReachedType": null
    }
  }
} }
{ "method": "account/rateLimits/updated", "params": {
  "rateLimits": {
    "limitId": "codex",
    "primary": { "usedPercent": 31, "windowDurationMins": 15, "resetsAt": 1730948100 }
  }
} }
```

字段说明：

- `rateLimits` 是向后兼容的单桶视图。
- `rateLimitsByLimitId`（当存在时）是按计量 `limit_id`（例如 `codex`）键控的多桶视图。
- `limitId` 是计量桶标识符。
- `limitName` 是桶的可选面向用户标签。
- `usedPercent` 是配额窗口内的当前使用量。
- `windowDurationMins` 是配额窗口长度。
- `resetsAt` 是下次重置的 Unix 时间戳（秒）。
- `planType` 在服务器返回与桶关联的 ChatGPT 计划时包含。
- `credits` 在服务器返回剩余工作区额度详细信息时包含。
- `rateLimitReachedType` 在达到限制时标识服务器分类的限制状态。

### 7) 通知工作区所有者关于限制

使用 `account/sendAddCreditsNudgeEmail` 在额度耗尽或达到使用限制时请求 ChatGPT 向工作区所有者发送电子邮件。

```json
{ "method": "account/sendAddCreditsNudgeEmail", "id": 7, "params": { "creditType": "credits" } }
{ "id": 7, "result": { "status": "sent" } }
```

当工作区额度耗尽时使用 `creditType: "credits"`，当工作区使用限制已达到时使用 `creditType: "usage_limit"`。如果所有者最近已被通知，响应状态为 `cooldown_active`。
