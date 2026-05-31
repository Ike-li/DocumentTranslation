> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整的文档索引。
> 在进一步探索之前，请使用此文件发现所有可用页面。

# Agent SDK 参考 - TypeScript

> TypeScript Agent SDK 的完整 API 参考，包含所有函数、类型和接口。

<script src="/components/typescript-sdk-type-links.js" defer />

## 安装
```bash
npm install @anthropic-ai/claude-agent-sdk
```


  SDK 为您的平台捆绑了一个原生 Claude Code 二进制文件作为可选依赖，例如 `@anthropic-ai/claude-agent-sdk-darwin-arm64`。您无需单独安装 Claude Code。如果您的包管理器跳过了可选依赖，SDK 会抛出错误 `Native CLI binary for <platform> not found`；此时请将 [`pathToClaudeCodeExecutable`](#options) 设置为单独安装的 `claude` 二进制文件路径。

### 编译为单文件可执行程序

当您使用 `bun build --compile` 将应用程序编译为单文件可执行程序时，SDK 无法在运行时解析打包后的 CLI 二进制文件。`require.resolve` 在编译后可执行程序的 `$bunfs` 虚拟文件系统中不起作用，因此 SDK 会抛出错误 `Native CLI binary for <platform> not found`。

要解决此问题，请将平台二进制文件作为文件资产嵌入，在启动时使用 `extractFromBunfs()` 将其提取到真实路径，并将该路径传递给 [`pathToClaudeCodeExecutable`](#options)。

`extractFromBunfs()` 辅助函数需要 `@anthropic-ai/claude-agent-sdk` v0.3.144 或更高版本。以下示例为在 Apple Silicon 的 macOS 上构建：
```typescript
import binPath from "@anthropic-ai/claude-agent-sdk-darwin-arm64/claude" with { type: "file" };
import { extractFromBunfs } from "@anthropic-ai/claude-agent-sdk/extract";
import { query } from "@anthropic-ai/claude-agent-sdk";

const cliPath = extractFromBunfs(binPath);

for await (const message of query({
  prompt: "Hello",
  options: { pathToClaudeCodeExecutable: cliPath },
})) {
  console.log(message);
}
```
`extractFromBunfs()` 函数将嵌入的二进制文件从编译后的可执行文件的虚拟文件系统中复制出来，存放到每个用户的临时目录，并返回实际路径。在非编译后的可执行文件环境中，该函数会直接返回输入路径，因此相同的代码无需修改即可在开发中运行。

每个编译后的可执行文件仅嵌入单一平台的二进制文件。请确保导入中的平台包与你的 `--target` 匹配：

*   要进行交叉编译，需安装不匹配的平台包，例如 `npm install @anthropic-ai/claude-agent-sdk-linux-x64 --force`。
*   在 Windows 上，二进制文件的子路径为 `claude.exe`，例如 `@anthropic-ai/claude-agent-sdk-win32-x64/claude.exe`。

## 函数

### `query()`

用于与 Claude Code 交互的主要函数。它创建一个异步生成器，以流式方式传输收到的消息。
```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;
```
#### 参数

| 参数 | 类型 | 描述 |
| :--- | :--- | :--- |
| `prompt` | `string \| AsyncIterable<`[`SDKUserMessage`](#sdkusermessage)`>` | 作为字符串或流式模式异步可迭代对象的输入提示词 |
| `options` | [`Options`](#options) | 可选配置对象（参见下方的 Options 类型） |

#### 返回值

返回一个 [`Query`](#query-对象) 对象，它扩展了 `AsyncGenerator<`[`SDKMessage`](#sdkmessage)`, void>` 并附加了额外方法。

### `startup()`

通过在提示词可用前生成 CLI 子进程并完成初始化握手来预热该子进程。返回的 [`WarmQuery`](#warmquery) 句柄稍后接受提示词并将其写入已准备就绪的进程，这样首次 `query()` 调用就能解析完成，无需在调用时同步承担子进程生成和初始化的成本。
```typescript
function startup(params?: {
  options?: Options;
  initializeTimeoutMs?: number;
}): Promise<WarmQuery>;
```
#### 参数

| 参数                  | 类型                  | 描述                                                                                                                                                              |
| :-------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | [`Options`](#options) | 可选配置对象。与 `query()` 的 `options` 参数相同                                                                                                                  |
| `initializeTimeoutMs` | `number`              | 等待子进程初始化完成的最大时间（毫秒）。默认为 `60000`。如果初始化未能在规定时间内完成，Promise 将因超时错误而被拒绝 |

#### 返回值

返回一个 `Promise<`[`WarmQuery`](#warmquery)`>` 对象，当子进程生成并完成初始化握手后，该 Promise 解析。

#### 示例

尽早调用 `startup()`，例如在应用启动时，然后当准备好提示词时，在返回的句柄上调用 `.query()`。这样可以将子进程的生成和初始化移出关键路径。
```typescript
import { startup } from "@anthropic-ai/claude-agent-sdk";

// Pay startup cost upfront
const warm = await startup({ options: { maxTurns: 3 } });

// Later, when a prompt is ready, this is immediate
for await (const message of warm.query("What files are here?")) {
  console.log(message);
}
```
### `tool()`

为 SDK MCP 服务器创建类型安全的 MCP 工具定义。
```typescript
function tool<Schema extends AnyZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  handler: (args: InferShape<Schema>, extra: unknown) => Promise<CallToolResult>,
  extras?: { annotations?: ToolAnnotations }
): SdkMcpToolDefinition<Schema>;
```
#### 参数

| 参数           | 类型                                                              | 描述                                                                               |
| :------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `name`         | `string`                                                          | 工具的名称                                                                         |
| `description`  | `string`                                                          | 工具功能的描述                                                                     |
| `inputSchema`  | `Schema extends AnyZodRawShape`                                   | 定义工具输入参数的 Zod 模式（同时支持 Zod 3 和 Zod 4）                             |
| `handler`      | `(args, extra) => Promise<`[`CallToolResult`](#calltoolresult)`>` | 执行工具逻辑的异步函数                                                             |
| `extras`       | `{ annotations?: `[`ToolAnnotations`](#toolannotations)` }`       | 可选的 MCP 工具注解，用于向客户端提供行为提示                                      |

#### `ToolAnnotations`

从 `@modelcontextprotocol/sdk/types.js` 重新导出。所有字段均为可选提示；客户端不应依赖它们进行安全决策。

| 字段              | 类型      | 默认值      | 描述                                                                                               |
| :---------------- | :-------- | :---------- | :------------------------------------------------------------------------------------------------- |
| `title`           | `string`  | `undefined` | 工具的人类可读标题                                                                                 |
| `readOnlyHint`    | `boolean` | `false`     | 如果为 `true`，则该工具不会修改其环境                                                              |
| `destructiveHint` | `boolean` | `true`      | 如果为 `true`，则该工具可能执行破坏性更新（仅在 `readOnlyHint` 为 `false` 时有意义）               |
| `idempotentHint`  | `boolean` | `false`     | 如果为 `true`，则使用相同参数重复调用不会产生额外效果（仅在 `readOnlyHint` 为 `false` 时有意义）   |
| `openWorldHint`   | `boolean` | `true`      | 如果为 `true`，则该工具与外部实体交互（例如网络搜索）。如果为 `false`，则该工具的领域是封闭的（例如内存工具） |
```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const searchTool = tool(
  "search",
  "Search the web",
  { query: z.string() },
  async ({ query }) => {
    return { content: [{ type: "text", text: `Results for: ${query}` }] };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
```
### `createSdkMcpServer()`

创建一个与应用程序在同一进程中运行的 MCP 服务器实例。
```typescript
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance;
```
#### 参数

| 参数名            | 类型                          | 描述                                                       |
| :---------------- | :---------------------------- | :------------------------------------------------------- |
| `options.name`    | `string`                      | MCP 服务器的名称                                           |
| `options.version` | `string`                      | 可选的版本字符串                                           |
| `options.tools`   | `Array<SdkMcpToolDefinition>` | 使用 [`tool()`](#tool) 创建的工具定义数组                  |

### `listSessions()`

发现并列出历史会话及其轻量级元数据。可按项目目录进行筛选，或列出所有项目的会话。
```typescript
function listSessions(options?: ListSessionsOptions): Promise<SDKSessionInfo[]>;
```
#### 参数

| 参数                       | 类型      | 默认值      | 描述                                                                       |
| :------------------------- | :-------- | :---------- | :------------------------------------------------------------------------- |
| `options.dir`              | `string`  | `undefined` | 要列出会话的目录。省略时返回所有项目的会话                                 |
| `options.limit`            | `number`  | `undefined` | 返回的最大会话数量                                                         |
| `options.includeWorktrees` | `boolean` | `true`      | 当 `dir` 位于 Git 仓库内时，是否包含所有工作树路径下的会话                 |

#### 返回类型：`SDKSessionInfo`

| 属性           | 类型                  | 描述                                                                 |
| :------------- | :-------------------- | :------------------------------------------------------------------- |
| `sessionId`    | `string`              | 唯一会话标识符（UUID）                                               |
| `summary`      | `string`              | 显示标题：自定义标题、自动生成的摘要或第一个提示词                   |
| `lastModified` | `number`              | 最后修改时间（自纪元以来的毫秒数）                                   |
| `fileSize`     | `number \| undefined` | 会话文件大小（字节）。仅对本地 JSONL 存储有效                        |
| `customTitle`  | `string \| undefined` | 用户设置的会话标题（通过 `/rename` 命令设置）                        |
| `firstPrompt`  | `string \| undefined` | 会话中第一个有意义的用户提示词                                       |
| `gitBranch`    | `string \| undefined` | 会话结束时的 Git 分支                                                |
| `cwd`          | `string \| undefined` | 会话的工作目录                                                       |
| `tag`          | `string \| undefined` | 用户设置的会话标签（参见 [`tagSession()`](#tagsession)）             |
| `createdAt`    | `number \| undefined` | 创建时间（自纪元以来的毫秒数），取自第一个条目的时间戳               |

#### 示例

打印某个项目的最近 10 个会话。结果按 `lastModified` 降序排序，因此第一项是最新会话。省略 `dir` 可搜索所有项目。
```typescript
import { listSessions } from "@anthropic-ai/claude-agent-sdk";

const sessions = await listSessions({ dir: "/path/to/project", limit: 10 });

for (const session of sessions) {
  console.log(`${session.summary} (${session.sessionId})`);
}
```
### `getSessionMessages()`

从过往的会话记录中读取用户和助手消息。
```typescript
function getSessionMessages(
  sessionId: string,
  options?: GetSessionMessagesOptions
): Promise<SessionMessage[]>;
```
#### 参数

| 参数               | 类型       | 默认值       | 描述                                                                          |
| :----------------- | :--------- | :----------- | :---------------------------------------------------------------------------- |
| `sessionId`        | `string`   | 必需         | 要读取的会话 UUID（参见 `listSessions()`）                                    |
| `options.dir`      | `string`   | `undefined`  | 用于查找会话的项目目录。省略时搜索所有项目                                    |
| `options.limit`    | `number`   | `undefined`  | 返回的最大消息数量                                                            |
| `options.offset`   | `number`   | `undefined`  | 从开头跳过的消息数量                                                          |

#### 返回类型：`SessionMessage`

| 属性                 | 类型                    | 描述                                                                                                                          |
| :------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `type`               | `"user" \| "assistant"` | 消息角色                                                                                                                      |
| `uuid`               | `string`                | 唯一消息标识符                                                                                                                |
| `session_id`         | `string`                | 此消息所属的会话                                                                                                              |
| `message`            | `unknown`               | 来自对话记录的原始消息负载                                                                                                    |
| `parent_tool_use_id` | `string \| null`        | 对于子代理消息，是生成该消息的 `Agent` 工具调用的 `tool_use_id`。对于主会话消息和早期会话，此值为 `null`                       |

#### 示例
```typescript
import { listSessions, getSessionMessages } from "@anthropic-ai/claude-agent-sdk";

const [latest] = await listSessions({ dir: "/path/to/project", limit: 1 });

if (latest) {
  const messages = await getSessionMessages(latest.sessionId, {
    dir: "/path/to/project",
    limit: 20
  });

  for (const msg of messages) {
    console.log(`[${msg.type}] ${msg.uuid}`);
  }
}
```
### `getSessionInfo()`

通过ID读取单个会话的元数据，无需扫描整个项目目录。
```typescript
function getSessionInfo(
  sessionId: string,
  options?: GetSessionInfoOptions
): Promise<SDKSessionInfo | undefined>;
```
#### 参数

| 参数          | 类型     | 默认值      | 说明                                                                   |
| :------------ | :------- | :---------- | :--------------------------------------------------------------------- |
| `sessionId`   | `string` | required    | 要查找的会话 UUID                                                      |
| `options.dir` | `string` | `undefined` | 项目目录路径。省略时将搜索所有项目目录                                 |

返回 [`SDKSessionInfo`](#返回类型sdksessioninfo)，若会话未找到则返回 `undefined`。

### `renameSession()`

通过追加自定义标题条目来重命名会话。可安全重复调用，最新标题生效。
```typescript
function renameSession(
  sessionId: string,
  title: string,
  options?: SessionMutationOptions
): Promise<void>;
```
#### 参数

| 参数          | 类型     | 默认值      | 描述                                                                   |
| :------------ | :------- | :---------- | :--------------------------------------------------------------------- |
| `sessionId`   | `string` | 必填        | 要重命名的会话的 UUID                                                  |
| `title`       | `string` | 必填        | 新标题。去除空白后必须非空                                             |
| `options.dir` | `string` | `undefined` | 项目目录路径。省略时将搜索所有项目目录                                 |

### `tagSession()`

为会话添加标签。传入 `null` 可清除标签。可安全重复调用；最新标签生效。
```typescript
function tagSession(
  sessionId: string,
  tag: string | null,
  options?: SessionMutationOptions
): Promise<void>;
```
#### 参数

| 参数          | 类型             | 默认值      | 说明                                                                 |
| :------------ | :--------------- | :---------- | :------------------------------------------------------------------- |
| `sessionId`   | `string`         | required    | 需要标记的会话 UUID                                                  |
| `tag`         | `string \| null` | required    | 标签字符串，或使用 `null` 清除标签                                   |
| `options.dir` | `string`         | `undefined` | 项目目录路径。省略时，将搜索所有项目目录                             |

### `resolveSettings()`

为给定目录解析有效的 Claude Code 配置设置，使用与命令行界面相同的合并引擎，但无需启动 Claude 命令行界面。可用于在调用 `query()` 前，检查该调用会看到何种配置。

  此功能处于 alpha 阶段，其 API 在稳定前可能会发生变化。它会读取 MDM 来源（包括 macOS plist 和 Windows HKLM/HKCU），以便与 CLI 启动保持一致，但不会执行管理员配置的 `policyHelper` 子进程。`permissions.defaultMode` 字段会原样返回自所有层级（包括项目设置）的数据。CLI 在响应升级权限模式之前应用的信任过滤器在此不会应用。


```typescript
function resolveSettings(
  options?: ResolveSettingsOptions
): Promise<ResolvedSettings>;
```
#### 参数

`resolveSettings()` 接受一个选项对象。所有字段均为可选。

| 参数                          | 类型                                  | 默认值          | 描述                                                                                                                                                                                                                                                                                                                                                     |
| :---------------------------- | :------------------------------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options.cwd`                 | `string`                              | `process.cwd()` | 用于解析项目和本地设置的相对目录                                                                                                                                                                                                                                                                                                                         |
| `options.settingSources`      | [`SettingSource`](#settingsource)`[]` | 所有源          | 要加载哪些文件系统源。传递 `[]` 以跳过用户、项目和本地设置。托管策略设置在任何情况下都会加载                                                                                                                                                                                                                                                             |
| `options.managedSettings`     | `Settings`                            | `undefined`     | 由嵌入宿主提供的限制性策略层设置。默认情况下，当存在管理员部署的托管层时会被丢弃；当 [`parentSettingsBehavior`](/zh/settings#available-settings) 为 `"merge"` 时，会在该层下合并。非限制性键（如 `model`）会被静默丢弃，因此此选项只能收紧托管策略，不能放松。                                                                                              |
| `options.serverManagedSettings` | `Settings`                            | `undefined`     | 来自 `/api/claude_code/settings` 的服务器托管设置负载。非限制性键会不经过滤地传递。                                                                                                                                                                                                                                                                      |

#### 返回类型：`ResolvedSettings`

`resolveSettings()` 返回一个描述合并后设置以及每个键来源的对象。

| 属性         | 类型                                                | 描述                                               |
| :----------- | :-------------------------------------------------- | :------------------------------------------------- |
| `effective`  | `Settings`                                          | 按照优先顺序应用所有启用源后的合并设置             |
| `provenance` | `Partial<Record<keyof Settings, ProvenanceEntry>>`  | 对于 `effective` 中的每个顶层键，指出哪个源提供了值 |
| `sources`    | `Array<{ source, settings, path?, policyOrigin? }>` | 按源列出的原始设置，从最低到最高优先级排序         |

#### 示例

下面的示例解析了一个项目目录的设置，并打印控制清理周期的源。
```typescript
import { resolveSettings } from "@anthropic-ai/claude-agent-sdk";

const { effective, provenance } = await resolveSettings({
  cwd: "/path/to/project",
  settingSources: ["user", "project", "local"],
});

console.log(`Cleanup period: ${effective.cleanupPeriodDays} days`);
console.log(`Set by: ${provenance.cleanupPeriodDays?.source}`);
```
## 类型

### `Options`

`query()` 函数的配置对象。

| 属性 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `abortController` | `AbortController` | `new AbortController()` | 用于取消操作的控制器 |
| `additionalDirectories` | `string[]` | `[]` | Claude 可以访问的额外目录 |
| `agent` | `string` | `undefined` | 主线程的代理名称。代理必须在 `agents` 选项或设置中定义 |
| `agents` | `Record<string, [`AgentDefinition`](#代理定义)>` | `undefined` | 以编程方式定义子代理 |
| `agentProgressSummaries` | `boolean` | `false` | 当为 `true` 时，为子代理生成单行进度摘要，并通过 [`task_progress`](#sdktaskprogressmessage) 事件的 `summary` 字段进行转发。适用于前台和后台子代理 |
| `allowDangerouslySkipPermissions` | `boolean` | `false` | 启用绕过权限。当使用 `permissionMode: 'bypassPermissions'` 时必须设置此项 |
| `allowedTools` | `string[]` | `[]` | 自动批准而无需提示的工具。这并不限制 Claude 只能使用这些工具；未列出的工具将遵循 `permissionMode` 和 `canUseTool`。使用 `disallowedTools` 来阻止工具。参见 [权限](/zh/agent-sdk/permissions#allow-and-deny-rules) |
| `betas` | [`SdkBeta`](#sdkbeta)`[]` | `[]` | 启用 Beta 功能 |
| `canUseTool` | [`CanUseTool`](#canusetool) | `undefined` | 用于工具使用的自定义权限函数 |
| `continue` | `boolean` | `false` | 继续最近的对话 |
| `cwd` | `string` | `process.cwd()` | 当前工作目录 |
| `debug` | `boolean` | `false` | 为 Claude Code 进程启用调试模式 |
| `debugFile` | `string` | `undefined` | 将调试日志写入指定的文件路径。隐式启用调试模式 |
| `disallowedTools` | `string[]` | `[]` | 要拒绝的工具。像 `"Bash"` 这样的纯名称会从 Claude 的上下文中移除该工具。像 `"Bash(rm *)"` 这样的作用域规则会让该工具保持可用，并在所有权限模式（包括 `bypassPermissions`）中拒绝匹配的调用。参见 [权限](/zh/agent-sdk/permissions#allow-and-deny-rules) |
| `effort` | `'low' \| 'medium' \| 'high' \| 'xhigh' \| 'max'` | `'high'` | 控制 Claude 在其响应中投入多少努力。与自适应思维配合使用以指导思考深度 |
| `enableFileCheckpointing` | `boolean` | `false` | 启用用于回退的文件更改跟踪。参见 [文件检查点](/zh/agent-sdk/file-checkpointing) |
| `env` | `Record<string, string \| undefined>` | `process.env` | 环境变量。设置时，它会替换子进程环境，而不是与 `process.env` 合并，因此请传递 `{ ...process.env, YOUR_VAR: 'value' }` 以保留像 `PATH` 这样的继承变量。有关此模式的示例，请参见 [处理缓慢或停滞的 API 响应](#处理缓慢或停滞的-api-响应)，有关底层 CLI 读取的变量，请参见 [环境变量](/zh/env-vars)。设置 `CLAUDE_AGENT_SDK_CLIENT_APP` 以在 User-Agent 标头中标识您的应用 |
| `executable` | `'bun' \| 'deno' \| 'node'` | 自动检测 | 要使用的 JavaScript 运行时 |
| `executableArgs` | `string[]` | `[]` | 传递给可执行文件的参数 |
| `extraArgs` | `Record<string, string \| null>` | `{}` | 附加参数 |
| `fallbackModel` | `string` | `undefined` | 如果主模型失败则使用的模型 |
| `forkSession` | `boolean` | `false` | 使用 `resume` 恢复时，分叉到新的会话 ID 而不是继续原始会话 |
| `forwardSubagentText` | `boolean` | `false` | 将子代理的文本和思考块作为设置了 `parent_tool_use_id` 的助手和用户消息进行转发，以便消费者可以渲染嵌套的转录。默认情况下，只发出子代理的 `tool_use` 和 `tool_result` 块 |
| `hooks` | `Partial<Record<`[`HookEvent`](#hookevent)`, `[`HookCallbackMatcher`](#hookcallbackmatcher)`[]>>` | `{}` | 事件的钩子回调 |
| `includeHookEvents` | `boolean` | `false` | 在消息流中包含钩子生命周期事件，作为 [`SDKHookStartedMessage`](#sdkhookstartedmessage)、[`SDKHookProgressMessage`](#sdkhookprogressmessage) 和 [`SDKHookResponseMessage`](#sdkhookresponsemessage) |
| `includePartialMessages` | `boolean` | `false` | 包含部分消息事件 |
| `loadTimeoutMs` | `number` | `60000` | *Alpha。* 恢复实体化期间，对每个 `sessionStore.load()` 和 `sessionStore.listSubkeys()` 调用的超时时间（毫秒）。如果适配器在此时间窗口内未完成，则查询失败而不是挂起。当未设置 `sessionStore` 时忽略 |
| `managedSettings` | `Settings` | `undefined` | 由生成父进程提供的策略层设置。如果机器上已存在 IT 控制的托管设置层，则会被丢弃，除非管理员选择 `parentSettingsBehavior: 'merge'`。无论怎样，都会过滤为仅限限制性的键 |
| `maxBudgetUsd` | `number` | `undefined` | 当客户端成本估算达到此美元值时停止查询。与 `total_cost_usd` 的相同估算值进行比较；有关准确性的注意事项，请参见 [跟踪成本和使用情况](/zh/agent-sdk/cost-tracking) |
| `maxThinkingTokens` | `number` | `undefined` | *已弃用：* 请使用 `thinking` 代替。思考过程的最大 token 数 |
| `maxTurns` | `number` | `undefined` | 最大的智能体回合数（工具使用的往返次数） |
| `mcpServers` | `Record<string, [`McpServerConfig`](#mcpserverconfig)>` | `{}` | MCP 服务器配置 |
| `model` | `string` | 来自 CLI 的默认值 | 要使用的 Claude 模型 |
| `onElicitation` | `(request: ElicitationRequest, options: { signal: AbortSignal }) => Promise<ElicitationResult>` | `undefined` | 处理 MCP 引导请求的回调。当 MCP 服务器请求用户输入且没有钩子首先处理时调用。如果未提供，未处理的引导请求将被自动拒绝 |
| `outputFormat` | `{ type: 'json_schema', schema: JSONSchema }` | `undefined` | 定义代理结果的输出格式。详情请参见 [结构化输出](/zh/agent-sdk/structured-outputs) |
| `outputStyle` | `string` | `undefined` | 不是 `Options` 字段。请在内联 [`settings`](/zh/settings) 对象或设置文件中设置 `outputStyle`。参见 [激活输出样式](/zh/agent-sdk/modifying-system-prompts#activate-an-output-style) |
| `pathToClaudeCodeExecutable` | `string` | 从捆绑的原生二进制文件自动解析 | Claude Code 可执行文件的路径。仅在安装期间跳过了可选依赖项或您的平台不在支持集中时才需要 |
| `permissionMode` | [`PermissionMode`](#permissionmode) | `'default'` | 会话的权限模式 |
| `permissionPromptToolName` | `string` | `undefined` | 用于权限提示的 MCP 工具名称 |
| `persistSession` | `boolean` | `true` | 当为 `false` 时，禁用将会话持久化到磁盘。会话将无法在以后恢复 |
| `planModeInstructions` | `string` | `undefined` | 计划模式的自定义工作流指令。当 `permissionMode` 为 `'plan'` 时，此字符串替换默认的计划模式工作流正文。CLI 仍会用只读强制前言和 ExitPlanMode 协议页脚来包装它 |
| `plugins` | [`SdkPluginConfig`](#sdkpluginconfig)`[]` | `[]` | 从本地路径加载自定义插件。详情请参见 [插件](/zh/agent-sdk/plugins) |
| `promptSuggestions` | `boolean` | `false` | 启用提示建议。在每轮对话后发出一个 `prompt_suggestion` 消息，包含预测的下一个用户提示 |
| `resume` | `string` | `undefined` | 要恢复的会话 ID |
| `resumeSessionAt` | `string` | `undefined` | 在特定的消息 UUID 处恢复会话 |
| `sandbox` | [`SandboxSettings`](#sandboxsettings) | `undefined` | 以编程方式配置沙箱行为。详情请参见 [沙箱设置](#sandboxsettings) |
| `sessionId` | `string` | 自动生成 | 使用特定的 UUID 作为会话 ID，而不是自动生成 |
| `sessionStore` | [`SessionStore`](/zh/agent-sdk/session-storage#the-sessionstore-interface) | `undefined` | 将会话转录镜像到外部后端，以便任何主机都可以恢复它们。参见 [将会话持久化到外部存储](/zh/agent-sdk/session-storage) |
| `sessionStoreFlush` | `'batched' \| 'eager'` | `'batched'` | *Alpha。* `sessionStore` 的刷新模式。当未设置 `sessionStore` 时忽略 |
| `settings` | `string \| Settings` | `undefined` | 内联 [设置](/zh/settings) 对象或设置文件路径。填充 [优先顺序](/zh/settings#settings-precedence) 中的标志设置层。通过 [`applyFlagSettings()`](#applyflagsettings) 在运行时更改 |
| `settingSources` | [`SettingSource`](#settingsource)`[]` | CLI 默认值（所有来源） | 控制要加载哪些文件系统设置。传递 `[]` 以禁用用户、项目和本地设置。托管策略设置无论如何都会加载。参见 [使用 Claude Code 功能](/zh/agent-sdk/claude-code-features#what-settingsources-does-not-control) |
| `skills` | `string[] \| 'all'` | `undefined` | 会话可用的技能。传递 `'all'` 以启用所有已发现的技能，或技能名称列表。设置后，SDK 会自动启用技能工具，而无需将其列在 `allowedTools` 中。参见 [技能](/zh/agent-sdk/skills) |
| `spawnClaudeCodeProcess` | `(options: SpawnOptions) => SpawnedProcess` | `undefined` | 用于生成 Claude Code 进程的自定义函数。用于在虚拟机、容器或远程环境中运行 Claude Code |
| `stderr` | `(data: string) => void` | `undefined` | 处理 stderr 输出的回调 |
| `strictMcpConfig` | `boolean` | `false` | 仅使用 `mcpServers` 中传入的服务器，并忽略项目的 `.mcp.json`、用户设置和插件提供的 MCP 服务器 |
| `systemPrompt` | `string \| { type: 'preset'; preset: 'claude_code'; append?: string; excludeDynamicSections?: boolean }` | `undefined` (最小提示词) | 系统提示词配置。传递字符串作为自定义提示词，或传递 `{ type: 'preset', preset: 'claude_code' }` 以使用 Claude Code 的系统提示词。当使用预设对象形式时，添加 `append` 以扩展它并附加指令，并设置 `excludeDynamicSections: true` 以将每次会话的上下文移到第一条用户消息中，以实现 [跨机器更好的提示缓存重用](/zh/agent-sdk/modifying-system-prompts#improve-prompt-caching-across-users-and-machines) |
| `taskBudget` | `{ total: number }` | `undefined` | *Alpha。* API 端的任务 token 预算。设置后，模型会被告知其剩余的 token 预算，以便它可以调整工具使用并在限制前完成任务 |
| `thinking` | [`ThinkingConfig`](#thinkingconfig) | 支持的模型为 `{ type: 'adaptive' }` | 控制 Claude 的思考/推理行为。有关选项，请参见 [`ThinkingConfig`](#thinkingconfig) |
| `title` | `string` | `undefined` | 会话的显示标题。当通过 `resume` 或 `continue` 恢复时，恢复的会话的持久化标题优先；使用 [`renameSession()`](#renamesession) 为现有会话重命名 |
| `toolAliases` | `Record<string, string>` | `undefined` | 将内置工具名称映射到 MCP 工具名称，以便 Claude 调用您的 MCP 实现来代替内置实现。例如，`{ Bash: 'mcp__workspace__bash' }` |
| `toolConfig` | [`ToolConfig`](#toolconfig) | `undefined` | 内置工具行为的配置。详情请参见 [`ToolConfig`](#toolconfig) |
| `tools` | `string[] \| { type: 'preset'; preset: 'claude_code' }` | `undefined` | 工具配置。传递工具名称数组或使用预设来获取 Claude Code 的默认工具 |

#### 处理缓慢或停滞的 API 响应

CLI 子进程读取几个控制 API 超时和停滞检测的环境变量。通过 `env` 选项传递它们：
```typescript
const result = query({
  prompt: "Analyze this code",
  options: {
    env: {
      ...process.env,
      API_TIMEOUT_MS: "120000",
      CLAUDE_CODE_MAX_RETRIES: "2",
      CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS: "120000",
    },
  },
});
```
* `API_TIMEOUT_MS`：对 Anthropic 客户端的单次请求超时时间，单位为毫秒。默认值为 `600000`。此设置适用于主循环及所有子代理。
* `CLAUDE_CODE_MAX_RETRIES`：最大 API 重试次数。默认值为 `10`。每次重试都会获得其独立的 `API_TIMEOUT_MS` 时间窗口，因此最坏情况下的总耗时大约为 `API_TIMEOUT_MS × (CLAUDE_CODE_MAX_RETRIES + 1)` 加上退避时间。
* `CLAUDE_ASYNC_AGENT_STAL_TIMEOUT_MS`：针对通过 `run_in_background` 启动的子代理的停滞监视器。默认值为 `600000`。每当接收到流事件时会重置计时；如果发生停滞，它会中止子代理，将任务标记为失败，并将错误连同任何部分结果一起上报给父代理。此设置不适用于同步子代理。
* `CLAUDE_ENABLE_STREAM_WATCHDOG=1` 配合 `CLAUDE_STREAM_IDLE_TIMEOUT_MS` 使用：当响应头已收到但响应体停止流式传输时，中止请求。默认关闭。`CLAUDE_STREAM_IDLE_TIMEOUT_MS` 默认值为 `300000`，且最小值被限制为此值。被中止的请求会进入正常的重试路径。

### `Query` 对象

由 `query()` 函数返回的接口。
```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  rewindFiles(
    userMessageId: string,
    options?: { dryRun?: boolean }
  ): Promise<RewindFilesResult>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;
  applyFlagSettings(settings: { [K in keyof Settings]?: Settings[K] | null }): Promise<void>;
  initializationResult(): Promise<SDKControlInitializeResponse>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  supportedAgents(): Promise<AgentInfo[]>;
  mcpServerStatus(): Promise<McpServerStatus[]>;
  accountInfo(): Promise<AccountInfo>;
  reconnectMcpServer(serverName: string): Promise<void>;
  toggleMcpServer(serverName: string, enabled: boolean): Promise<void>;
  setMcpServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult>;
  streamInput(stream: AsyncIterable<SDKUserMessage>): Promise<void>;
  stopTask(taskId: string): Promise<void>;
  close(): void;
}
```
#### 方法

| 方法                                 | 描述                                                                                                                                                                                                   |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `interrupt()`                          | 中断查询（仅在流式输入模式下可用）                                                                                                                                                 |
| `rewindFiles(userMessageId, options?)` | 将文件恢复到指定用户消息时的状态。传入 `{ dryRun: true }` 可预览更改。需要 `enableFileCheckpointing: true`。参见 [文件检查点](/zh/agent-sdk/file-checkpointing) |
| `setPermissionMode()`                  | 更改权限模式（仅在流式输入模式下可用）                                                                                                                                          |
| `setModel()`                           | 更改模型（仅在流式输入模式下可用）                                                                                                                                                    |
| `setMaxThinkingTokens()`               | *已弃用：*请改用 `thinking` 选项。更改最大思考 token 数                                                                                                                          |
| `applyFlagSettings(settings)`          | 在运行时将设置合并到会话的标志设置层（仅在流式输入模式下可用）。参见 [`applyFlagSettings()`](#applyflagsettings)                                                   |
| `initializationResult()`               | 返回完整的初始化结果，包括支持的命令、模型、账户信息和输出样式配置                                                                                     |
| `supportedCommands()`                  | 返回可用的斜杠命令                                                                                                                                                                              |
| `supportedModels()`                    | 返回可用的模型及其显示信息                                                                                                                                                                    |
| `supportedAgents()`                    | 返回可用的子代理，作为 [`AgentInfo`](#agentinfo)`[]`                                                                                                                                                  |
| `mcpServerStatus()`                    | 返回已连接 MCP 服务器的状态                                                                                                                                                                       |
| `accountInfo()`                        | 返回账户信息                                                                                                                                                                                   |
| `reconnectMcpServer(serverName)`       | 按名称重新连接 MCP 服务器                                                                                                                                                                               |
| `toggleMcpServer(serverName, enabled)` | 按名称启用或禁用 MCP 服务器                                                                                                                                                                       |
| `setMcpServers(servers)`               | 动态替换此会话的 MCP 服务器集合。返回有关添加、移除了哪些服务器以及任何错误的信息                                                                             |
| `streamInput(stream)`                  | 向查询流式输入消息以进行多轮对话                                                                                                                                               |
| `stopTask(taskId)`                     | 通过 ID 停止正在运行的后台任务                                                                                                                                                                          |
| `close()`                              | 关闭查询并终止底层进程。强制结束查询并清理所有资源                                                                                                   |

#### `applyFlagSettings()`

在不重启查询的情况下更改正在运行的会话[设置](/zh/settings)。当某个没有专用设置器的设置需要在会话中途更改时使用此函数，例如在代理读取不可信输入后收紧 `permissions`。`setModel()` 和 `setPermissionMode()` 是针对这两个键的专用设置器；`applyFlagSettings()` 是接受任何设置键子集的通用形式，在此处传递 `model` 的效果与 `setModel()` 相同。

只有部分键在会话中途生效：

* **在下一轮生效**：`model`、`effortLevel`、`ultracode`、`permissions`、`hooks`、`skillOverrides`、`fastMode`、`awaySummaryEnabled`
* **在会话中途无效**：`agent` 和系统提示词选项。这些在启动时解析一次，因此运行中的会话始终保持原始值，即使调用成功。要更改它们，请启动一个新会话。

这些值被写入标志设置层，这与 `query()` 的内联 `settings` 选项在启动时填充的是同一层。标志设置位于[设置优先级顺序](/zh/settings#settings-precedence)的较高层：它们覆盖用户、项目和本地设置，只有托管策略设置才能覆盖它们。这与[页面内优先级部分](#设置优先级)所称的程序化选项属于同一层级。

后续调用会浅合并顶层键。第二次调用时使用 `{ permissions: {...} }` 将替换先前调用中的整个 `permissions` 对象，而不是与其深度合并。要从标志层中清除某个键并回退到优先级较低的来源，请为该键传递 `null`。传递 `undefined` 无效，因为 JSON 序列化会丢弃它。

仅在流式输入模式下可用，与 `setModel()` 和 `setPermissionMode()` 的限制相同。

下面的示例在会话中途切换活动模型，然后清除覆盖，使模型回退到用户或项目设置指定的值。
```typescript
const q = query({ prompt: messageStream });

// Override the model for the rest of the session
await q.applyFlagSettings({ model: "claude-opus-4-6" });

// Later: clear the override and fall back to lower-precedence settings
await q.applyFlagSettings({ model: null });
```


  `applyFlagSettings()` 是 TypeScript 专用方法。Python SDK 未提供等效方法。

### `WarmQuery`

由 [`startup()`](#startup) 返回的句柄。子进程已经生成并初始化，因此对此句柄调用 `query()` 可以直接向就绪进程写入提示词，没有启动延迟。
```typescript
interface WarmQuery extends AsyncDisposable {
  query(prompt: string | AsyncIterable<SDKUserMessage>): Query;
  close(): void;
}
```
#### 方法

| 方法            | 描述                                                                                                               |
| :-------------- | :----------------------------------------------------------------------------------------------------------------- |
| `query(prompt)` | 将提示词发送到预热的子进程并返回一个 [`Query`](#query-对象)。每个 `WarmQuery` 实例只能调用一次                   |
| `close()`       | 关闭子进程但不发送提示词。可用于丢弃不再需要的预热查询                                                             |

`WarmQuery` 实现了 `AsyncDisposable` 接口，因此可以与 `await using` 一起使用以实现自动清理。

### `SDKControlInitializeResponse`

`initializationResult()` 的返回类型。包含会话初始化数据。
```typescript
type SDKControlInitializeResponse = {
  commands: SlashCommand[];
  agents: AgentInfo[];
  output_style: string;
  available_output_styles: string[];
  models: ModelInfo[];
  account: AccountInfo;
  fast_mode_state?: "off" | "cooldown" | "on";
};
```
### `代理定义`

以编程方式定义的子代理配置。
```typescript
type AgentDefinition = {
  description: string;
  tools?: string[];
  disallowedTools?: string[];
  prompt: string;
  model?: string;
  mcpServers?: AgentMcpServerSpec[];
  skills?: string[];
  initialPrompt?: string;
  maxTurns?: number;
  background?: boolean;
  memory?: "user" | "project" | "local";
  effort?: "low" | "medium" | "high" | "xhigh" | "max" | number;
  permissionMode?: PermissionMode;
  criticalSystemReminder_EXPERIMENTAL?: string;
};
```
| 字段                                  | 必填 | 描述                                                                                                                                                                     |
| :------------------------------------ | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`                         | 是   | 自然语言描述，说明何时使用该代理                                                                                                                                             |
| `tools`                               | 否   | 允许使用的工具名称数组。若省略，则继承父级所有工具。要将技能预加载到代理上下文中，请使用 `skills` 字段，而非在此处列出 `'Skill'`                                                |
| `disallowedTools`                     | 否   | 此代理明确禁止使用的工具名称数组                                                                                                                                             |
| `prompt`                              | 是   | 代理的系统提示词                                                                                                                                                           |
| `model`                               | 否   | 此代理的模型覆盖设置。可接受别名如 `'sonnet'`、`'opus'`、`'haiku'`、`'inherit'`，或完整的模型ID。若省略或使用 `'inherit'`，则采用主模型                                         |
| `mcpServers`                          | 否   | 此代理的 MCP 服务器配置                                                                                                                                                  |
| `skills`                              | 否   | 要预加载到代理上下文中的技能名称数组                                                                                                                                         |
| `initialPrompt`                       | 否   | 当此代理作为主线程代理运行时，自动提交为首轮用户消息                                                                                                                          |
| `maxTurns`                            | 否   | 停止前的最大代理轮次（API 往返）次数                                                                                                                                         |
| `background`                          | 否   | 调用时，将此代理作为非阻塞后台任务运行                                                                                                                                       |
| `memory`                              | 否   | 此代理的记忆源：`'user'`、`'project'` 或 `'local'`                                                                                                                           |
| `effort`                              | 否   | 此代理的推理努力等级。可接受命名级别或整数                                                                                                                                    |
| `permissionMode`                      | 否   | 此代理内工具执行的权限模式。参见 [`PermissionMode`](#permissionmode)                                                                                                         |
| `criticalSystemReminder_EXPERIMENTAL` | 否   | 实验性：添加到系统提示词中的关键提醒                                                                                                                                         |

### `AgentMcpServerSpec`

指定子代理可用的 MCP 服务器。可以是一个服务器名称（字符串，引用父级 `mcpServers` 配置中的服务器），也可以是一个内联服务器配置记录，将服务器名称映射到配置。
```typescript
type AgentMcpServerSpec = string | Record<string, McpServerConfigForProcessTransport>;
```
其中 `McpServerConfigForProcessTransport` 为 `McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfig`。

### `SettingSource`

控制 SDK 从哪些基于文件系统的配置源加载设置。
```typescript
type SettingSource = "user" | "project" | "local";
```
| 值          | 描述                                   | 位置                           |
| :---------- | :------------------------------------- | :----------------------------- |
| `'user'`    | 全局用户设置                           | `~/.claude/settings.json`      |
| `'project'` | 共享项目设置（版本控制）               | `.claude/settings.json`        |
| `'local'`   | 本地项目设置（git 忽略）               | `.claude/settings.local.json`  |

#### 默认行为

当 `settingSources` 省略或为 `undefined` 时，`query()` 会加载与 Claude Code 命令行相同的文件系统设置：用户设置、项目设置和本地设置。托管策略设置在所有情况下都会加载。关于无论此选项如何都会读取的输入以及如何禁用它们，请参阅 [settingSources 不控制什么](/zh/agent-sdk/claude-code-features#what-settingsources-does-not-control)。

#### 为何使用 settingSources

**禁用文件系统设置：**
```typescript
// Do not load user, project, or local settings from disk
const result = query({
  prompt: "Analyze this code",
  options: { settingSources: [] }
});
```
**明确加载所有文件系统设置：**
```typescript
const result = query({
  prompt: "Analyze this code",
  options: {
    settingSources: ["user", "project", "local"] // Load all settings
  }
});
```
**仅加载特定设置来源：**
```typescript
// Load only project settings, ignore user and local
const result = query({
  prompt: "Run CI checks",
  options: {
    settingSources: ["project"] // Only .claude/settings.json
  }
});
```
**测试与CI环境：**
```typescript
// Ensure consistent behavior in CI by excluding local settings
const result = query({
  prompt: "Run tests",
  options: {
    settingSources: ["project"], // Only team-shared settings
    permissionMode: "bypassPermissions"
  }
});
```
**仅限SDK的应用程序：**
```typescript
// Define everything programmatically.
// Pass [] to opt out of filesystem setting sources.
const result = query({
  prompt: "Review this PR",
  options: {
    settingSources: [],
    agents: {
      /* ... */
    },
    mcpServers: {
      /* ... */
    },
    allowedTools: ["Read", "Grep", "Glob"]
  }
});
```
**正在加载 CLAUDE.md 项目指令：**
```typescript
// Load project settings to include CLAUDE.md files
const result = query({
  prompt: "Add a new feature following project conventions",
  options: {
    systemPrompt: {
      type: "preset",
      preset: "claude_code" // Use Claude Code's system prompt
    },
    settingSources: ["project"], // Loads CLAUDE.md from project directory
    allowedTools: ["Read", "Write", "Edit"]
  }
});
```
#### 设置优先级

当加载多个来源时，设置将按以下优先级合并（从高到低）：

1. 本地设置 (`.claude/settings.local.json`)
2. 项目设置 (`.claude/settings.json`)
3. 用户设置 (`~/.claude/settings.json`)

编程选项（如 `agents`、`allowedTools` 和 `settings`）会覆盖用户、项目和本地文件系统设置。托管策略设置优先于编程选项。

### `PermissionMode`
```typescript
type PermissionMode =
  | "default" // Standard permission behavior
  | "acceptEdits" // Auto-accept file edits
  | "bypassPermissions" // Bypass all permission checks
  | "plan" // Planning mode - read-only tools only
  | "dontAsk" // Don't prompt for permissions, deny if not pre-approved
  | "auto"; // Use a model classifier to approve or deny each tool call
```
### `CanUseTool`

用于控制工具使用的自定义权限函数类型。
```typescript
type CanUseTool = (
  toolName: string,
  input: Record<string, unknown>,
  options: {
    signal: AbortSignal;
    suggestions?: PermissionUpdate[];
    blockedPath?: string;
    decisionReason?: string;
    toolUseID: string;
    agentID?: string;
  }
) => Promise<PermissionResult>;
```
| 选项             | 类型                                        | 描述                                                                                                                                                                                                                                                                                                    |
| :--------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signal`         | `AbortSignal`                               | 如果操作应被中止，则发出信号                                                                                                                                                                                                                                                                            |
| `suggestions`    | [`PermissionUpdate`](#permissionupdate)`[]` | 建议的权限更新，以便用户无需再次为此工具进行提示。Bash 提示包含带有 `localSettings` [目标](#权限规则值) 的建议，因此在 `updatedPermissions` 中返回它会将规则写入 `.claude/settings.local.json` 并在会话间持久保存。 |
| `blockedPath`    | `string`                                    | 触发权限请求的文件路径（如果适用）                                                                                                                                                                                                                                                                      |
| `decisionReason` | `string`                                    | 解释触发此权限请求的原因                                                                                                                                                                                                                                                                                |
| `toolUseID`      | `string`                                    | 助手消息中此特定工具调用的唯一标识符                                                                                                                                                                                                                                                                    |
| `agentID`        | `string`                                    | 如果在子代理内运行，则为子代理的 ID                                                                                                                                                                                                                                                                     |

### `PermissionResult`

权限检查的结果。
```typescript
type PermissionResult =
  | {
      behavior: "allow";
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: PermissionUpdate[];
      toolUseID?: string;
    }
  | {
      behavior: "deny";
      message: string;
      interrupt?: boolean;
      toolUseID?: string;
    };
```
### `ToolConfig`

内置工具行为的配置。
```typescript
type ToolConfig = {
  askUserQuestion?: {
    previewFormat?: "markdown" | "html";
  };
};
```
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `askUserQuestion.previewFormat` | `'markdown' \| 'html'` | 启用 [`AskUserQuestion`](/zh/agent-sdk/user-input#question-format) 选项中的 `preview` 字段，并设置其内容格式。未设置时，Claude 不会生成预览 |

### `McpServerConfig`

MCP 服务器的配置。
```typescript
type McpServerConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfigWithInstance;
```
#### `Mcp标准输入输出服务器配置`
```typescript
type McpStdioServerConfig = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
};
```
#### `McpSSEServerConfig`
```typescript
type McpSSEServerConfig = {
  type: "sse";
  url: string;
  headers?: Record<string, string>;
};
```
#### `McpHttpServerConfig`
```typescript
type McpHttpServerConfig = {
  type: "http";
  url: string;
  headers?: Record<string, string>;
};
```
#### `McpSdk服务器配置（带实例）`
```typescript
type McpSdkServerConfigWithInstance = {
  type: "sdk";
  name: string;
  instance: McpServer;
};
```
#### `McpClaudeAIProxyServerConfig`
```typescript
type McpClaudeAIProxyServerConfig = {
  type: "claudeai-proxy";
  url: string;
  id: string;
};
```
### `SdkPluginConfig`

在SDK中加载插件的配置。
```typescript
type SdkPluginConfig = {
  type: "local";
  path: string;
};
```
| 字段   | 类型      | 描述                                                       |
| :----- | :-------- | :--------------------------------------------------------- |
| `type` | `'local'` | 必须为 `'local'` (当前仅支持本地插件)                      |
| `path` | `string`  | 插件目录的绝对路径或相对路径                               |

**Example:**
```typescript
plugins: [
  { type: "local", path: "./my-plugin" },
  { type: "local", path: "/absolute/path/to/plugin" }
];
```
有关创建和使用插件的完整信息，请参阅 [插件](/zh/agent-sdk/plugins)。

## 消息类型

### `SDKMessage`

查询返回的所有可能消息的联合类型。
```typescript
type SDKMessage =
  | SDKAssistantMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKResultMessage
  | SDKSystemMessage
  | SDKPartialAssistantMessage
  | SDKCompactBoundaryMessage
  | SDKStatusMessage
  | SDKLocalCommandOutputMessage
  | SDKHookStartedMessage
  | SDKHookProgressMessage
  | SDKHookResponseMessage
  | SDKPluginInstallMessage
  | SDKToolProgressMessage
  | SDKAuthStatusMessage
  | SDKTaskNotificationMessage
  | SDKTaskStartedMessage
  | SDKTaskProgressMessage
  | SDKTaskUpdatedMessage
  | SDKSessionStateChangedMessage
  | SDKNotificationMessage
  | SDKFilesPersistedEvent
  | SDKToolUseSummaryMessage
  | SDKMemoryRecallMessage
  | SDKRateLimitEvent
  | SDKElicitationCompleteMessage
  | SDKPermissionDeniedMessage
  | SDKPromptSuggestionMessage
  | SDKAPIRetryMessage
  | SDKMirrorErrorMessage;
```
### `SDKAssistantMessage`

助手响应消息。
```typescript
type SDKAssistantMessage = {
  type: "assistant";
  uuid: UUID;
  session_id: string;
  message: BetaMessage; // From Anthropic SDK
  parent_tool_use_id: string | null;
  error?: SDKAssistantMessageError;
};
```
`message` 字段是来自 Anthropic SDK 的 [`BetaMessage`](https://platform.claude.com/docs/en/api/messages/create)。它包含 `id`、`content`、`model`、`stop_reason` 和 `usage` 等字段。

`SDKAssistantMessageError` 是以下之一：`'authentication_failed'`、`'oauth_org_not_allowed'`、`'billing_error'`、`'rate_limit'`、`'invalid_request'`、`'model_not_found'`、`'server_error'`、`'max_output_tokens'` 或 `'unknown'`。`'model_not_found'` 表示所选模型不存在，或对您的账户或部署不可用。

### `SDKUserMessage`

用户输入消息。
```typescript
type SDKUserMessage = {
  type: "user";
  uuid?: UUID;
  session_id?: string;
  message: MessageParam; // From Anthropic SDK
  parent_tool_use_id: string | null;
  isSynthetic?: boolean;
  shouldQuery?: boolean;
  tool_use_result?: unknown;
  origin?: SDKMessageOrigin;
};
```
将 `shouldQuery` 设置为 `false` 可将消息追加到对话记录中而不触发助手响应轮次。该消息会被保留，并合并到下一个触发轮次的用户消息中。此功能可用于注入上下文信息（例如带外运行的命令输出），且无需消耗模型调用。

### `SDKUserMessageReplay`

带有必需 UUID 的重放用户消息。
```typescript
type SDKUserMessageReplay = {
  type: "user";
  uuid: UUID;
  session_id: string;
  message: MessageParam;
  parent_tool_use_id: string | null;
  isSynthetic?: boolean;
  tool_use_result?: unknown;
  origin?: SDKMessageOrigin;
  isReplay: true;
};
```
### `SDKResultMessage`

最终结果消息。
```typescript
type SDKResultMessage =
  | {
      type: "result";
      subtype: "success";
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      api_error_status?: number | null;
      num_turns: number;
      result: string;
      stop_reason: string | null;
      ttft_ms?: number;
      total_cost_usd: number;
      usage: NonNullableUsage;
      modelUsage: { [modelName: string]: ModelUsage };
      permission_denials: SDKPermissionDenial[];
      structured_output?: unknown;
      deferred_tool_use?: { id: string; name: string; input: Record<string, unknown> };
      terminal_reason?: TerminalReason;
      fast_mode_state?: FastModeState;
      origin?: SDKMessageOrigin;
    }
  | {
      type: "result";
      subtype:
        | "error_max_turns"
        | "error_during_execution"
        | "error_max_budget_usd"
        | "error_max_structured_output_retries";
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      stop_reason: string | null;
      total_cost_usd: number;
      usage: NonNullableUsage;
      modelUsage: { [modelName: string]: ModelUsage };
      permission_denials: SDKPermissionDenial[];
      errors: string[];
      terminal_reason?: TerminalReason;
      fast_mode_state?: FastModeState;
      origin?: SDKMessageOrigin;
    };
```
结果中的多个字段携带了超越 `subtype` 的诊断细节：

* `api_error_status`：导致会话终止的 API 错误的 HTTP 状态码。当轮次未因 API 错误而结束时，此字段缺失或为 `null`。
* `tt_ft_ms`：首 token 时间，以毫秒为单位。仅出现在成功分支中。
* `terminal_reason`：循环结束的原因。为 `"completed"`、`"max_turns"`、`"tool_deferred"`、`"aborted_streaming"`、`"aborted_tools"`、`"hook_stopped"`、`"stop_hook_prevented"`、`"blocking_limit"`、`"rapid_refill_breaker"`、`"prompt_too_long"`、`"image_error"` 或 `"model_error"` 之一。
* `fast_mode_state`：为 `"on"`、`"off"` 或 `"cooldown"` 之一。

`origin` 字段转发了触发此结果的用户消息的 [`SDKMessageOrigin`](#sdkmessageorigin)。当后台任务完成且 SDK 注入一个合成的后续轮次时，生成的 `SDKResultMessage` 会携带 `origin: { kind: "task-notification" }`。检查此字段以区分是响应您提示词的结果，还是为后台任务后续步骤发出的结果，以便您可以路由或抑制后者。对于在任何用户轮次之前发出的结果（例如启动错误），此字段缺失。

当 `PreToolUse` 钩子返回 `permissionDecision: "defer"` 时，结果将具有 `stop_reason: "tool_deferred"`，并且 `deferred_tool_use` 携带待处理工具的 `id`、`name` 和 `input`。读取此字段以在您自己的 UI 中显示请求，然后使用相同的 `session_id` 恢复以继续。完整的往返过程请参阅 [延后工具调用](/zh/hooks#defer-a-tool-call-for-later)。

### `SDKSystemMessage`

系统初始化消息。
```typescript
type SDKSystemMessage = {
  type: "system";
  subtype: "init";
  uuid: UUID;
  session_id: string;
  agents?: string[];
  apiKeySource: ApiKeySource;
  betas?: string[];
  claude_code_version: string;
  cwd: string;
  tools: string[];
  mcp_servers: {
    name: string;
    status: string;
  }[];
  model: string;
  permissionMode: PermissionMode;
  slash_commands: string[];
  output_style: string;
  skills: string[];
  plugins: { name: string; path: string }[];
};
```
### `SDKPartialAssistantMessage`

流式部分消息（仅当 `includePartialMessages` 为 true 时）。
```typescript
type SDKPartialAssistantMessage = {
  type: "stream_event";
  event: BetaRawMessageStreamEvent; // From Anthropic SDK
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
};
```
#### `SDKCompactBoundaryMessage`

指示会话压缩边界的消息。
```typescript
type SDKCompactBoundaryMessage = {
  type: "system";
  subtype: "compact_boundary";
  uuid: UUID;
  session_id: string;
  compact_metadata: {
    trigger: "manual" | "auto";
    pre_tokens: number;
  };
};
```
### `SDKPluginInstallMessage`

插件安装进度事件。当设置 [`CLAUDE_CODE_SYNC_PLUGIN_INSTALL`](/zh/env-vars) 时触发，使你的 Agent SDK 应用能在首次对话前跟踪插件市场的安装过程。`started` 和 `completed` 状态标志整体安装过程的开始和结束，而 `installed` 和 `failed` 状态则报告各个插件市场的安装情况，并包含 `name`（插件名称）。
```typescript
type SDKPluginInstallMessage = {
  type: "system";
  subtype: "plugin_install";
  status: "started" | "installed" | "failed" | "completed";
  name?: string;
  error?: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKPermissionDeniedMessage`

当权限系统自动拒绝工具调用且未通过交互式提示时，会触发此流式事件。请在事件发生时用其在 UI 中渲染拒绝状态，而不是仅依赖后续工具结果中的 `is_error` 属性。交互式询问路径将通过 [`canUseTool`](#canusetool) 回调单独传递至您的应用程序。由 `PreToolUse` 钩子触发的拒绝操作不会通过此事件报告。

此事件需要 Claude Code v2.1.136 或更高版本。
```typescript
type SDKPermissionDeniedMessage = {
  type: "system";
  subtype: "permission_denied";
  tool_name: string;
  tool_use_id: string;
  agent_id?: string;
  decision_reason_type?: string;
  decision_reason?: string;
  message: string;
  uuid: UUID;
  session_id: string;
};
```
| 字段                   | 类型     | 描述                                                                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `tool_name`            | `string` | 被拒绝使用的工具名称                                                                                                     |
| `tool_use_id`          | `string` | 此拒绝所对应的 `tool_use` 块的 ID                                                                                       |
| `agent_id`             | `string` | 当被拒绝的调用源自子代理内部时的子代理 ID。此字段与 `can_use_tool` 上的字段相对应，用于宿主端的路由                         |
| `decision_reason_type` | `string` | 做出决定的组件的标识符，例如 `"rule"`、`"mode"`、`"classifier"` 或 `"asyncAgent"`                                        |
| `decision_reason`      | `string` | 来自决定组件的、人类可读的原因（如果可用）                                                                               |
| `message`              | `string` | 在 `tool_result` 中返回给模型的拒绝消息                                                                                  |

### `SDKPermissionDenial`

关于被拒绝工具使用的信息。
```typescript
type SDKPermissionDenial = {
  tool_name: string;
  tool_use_id: string;
  tool_input: Record<string, unknown>;
};
```
### `SDKMessageOrigin`

用户角色消息的出处。它出现在 [`SDKUserMessage`](#sdkusermessage) 的 `origin` 字段中，并会被转发给对应的 [`SDKResultMessage`](#sdkresultmessage)，以便您能确定是什么触发了特定轮次。
```typescript
type SDKMessageOrigin =
  | { kind: "human" }
  | { kind: "channel"; server: string }
  | { kind: "peer"; from: string; name?: string }
  | { kind: "task-notification" }
  | { kind: "coordinator" };
```
| `kind`              | 含义                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `human`             | 终端用户的直接输入。在用户消息中，若缺少 `origin` 也表示人类输入。                                                                            |
| `channel`           | 来自[频道](/zh/channels)的消息。`server` 是源 MCP 服务器名称。                                                  |
| `peer`              | 通过 `SendMessage` 来自其他代理会话的消息。`from` 为发送方地址；`name` 为可用时发送方的显示名称。 |
| `task-notification` | 后台任务完成后注入的合成回合。参见 [`SDKTaskNotificationMessage`](#sdktasknotificationmessage)。              |
| `coordinator`       | 来自[代理团队](/zh/agent-teams)中团队协调员的消息。                                                                    |

## 钩子类型

有关使用钩子的完整指南，包含示例和常见模式，请参阅[钩子指南](/zh/agent-sdk/hooks)。

### `HookEvent`

可用的钩子事件。
```typescript
type HookEvent =
  | "PreToolUse"
  | "PostToolUse"
  | "PostToolUseFailure"
  | "PostToolBatch"
  | "Notification"
  | "UserPromptSubmit"
  | "SessionStart"
  | "SessionEnd"
  | "Stop"
  | "SubagentStart"
  | "SubagentStop"
  | "PreCompact"
  | "PermissionRequest"
  | "Setup"
  | "TeammateIdle"
  | "TaskCompleted"
  | "ConfigChange"
  | "WorktreeCreate"
  | "WorktreeRemove"
  | "MessageDisplay";
```
### `HookCallback`

钩子回调函数类型。
```typescript
type HookCallback = (
  input: HookInput, // Union of all hook input types
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;
```
### `HookCallbackMatcher`

带可选匹配器的钩子配置。
```typescript
interface HookCallbackMatcher {
  matcher?: string;
  hooks: HookCallback[];
  timeout?: number; // Timeout in seconds for all hooks in this matcher
}
```
### `HookInput`

所有钩子输入类型的联合类型。
```typescript
type HookInput =
  | PreToolUseHookInput
  | PostToolUseHookInput
  | PostToolUseFailureHookInput
  | PostToolBatchHookInput
  | NotificationHookInput
  | UserPromptSubmitHookInput
  | SessionStartHookInput
  | SessionEndHookInput
  | StopHookInput
  | SubagentStartHookInput
  | SubagentStopHookInput
  | PreCompactHookInput
  | PermissionRequestHookInput
  | SetupHookInput
  | TeammateIdleHookInput
  | TaskCompletedHookInput
  | ConfigChangeHookInput
  | WorktreeCreateHookInput
  | WorktreeRemoveHookInput
  | MessageDisplayHookInput;
```
### `BaseHookInput`

所有钩子输入类型都继承的基础接口。
```typescript
type BaseHookInput = {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode?: string;
  effort?: { level: string };
  agent_id?: string;
  agent_type?: string;
};
```
#### `PreToolUseHookInput`
```typescript
type PreToolUseHookInput = BaseHookInput & {
  hook_event_name: "PreToolUse";
  tool_name: string;
  tool_input: unknown;
  tool_use_id: string;
};
```
#### `PostToolUseHookInput`
```typescript
type PostToolUseHookInput = BaseHookInput & {
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: unknown;
  tool_response: unknown;
  tool_use_id: string;
  duration_ms?: number;
};
```
#### `PostToolUseFailureHookInput`
```typescript
type PostToolUseFailureHookInput = BaseHookInput & {
  hook_event_name: "PostToolUseFailure";
  tool_name: string;
  tool_input: unknown;
  tool_use_id: string;
  error: string;
  is_interrupt?: boolean;
  duration_ms?: number;
};
```
#### `PostToolBatchHookInput`

在批次中的每次工具调用解析完成后触发一次，发生在下一次模型请求之前。`tool_response` 携带模型所见的序列化 `tool_result` 内容；其结构与 `PostToolUseHookInput` 的结构化 `Output` 对象不同。
```typescript
type PostToolBatchHookInput = BaseHookInput & {
  hook_event_name: "PostToolBatch";
  tool_calls: PostToolBatchToolCall[];
};

type PostToolBatchToolCall = {
  tool_name: string;
  tool_input: unknown;
  tool_use_id: string;
  tool_response?: unknown;
};
```
#### `NotificationHookInput`
```typescript
type NotificationHookInput = BaseHookInput & {
  hook_event_name: "Notification";
  message: string;
  title?: string;
  notification_type: string;
};
```
#### `用户提示词提交钩子输入`
```typescript
type UserPromptSubmitHookInput = BaseHookInput & {
  hook_event_name: "UserPromptSubmit";
  prompt: string;
};
```
#### `会话开始钩子输入`
```typescript
type SessionStartHookInput = BaseHookInput & {
  hook_event_name: "SessionStart";
  source: "startup" | "resume" | "clear" | "compact";
  agent_type?: string;
  model?: string;
};
```
#### `SessionEndHookInput`
```typescript
type SessionEndHookInput = BaseHookInput & {
  hook_event_name: "SessionEnd";
  reason: ExitReason; // String from EXIT_REASONS array
};
```
#### `StopHookInput`
```typescript
type StopHookInput = BaseHookInput & {
  hook_event_name: "Stop";
  stop_hook_active: boolean;
  last_assistant_message?: string;
  background_tasks?: BackgroundTaskSummary[];
  session_crons?: SessionCronSummary[];
};
```
#### `子代理启动钩子输入`
```typescript
type SubagentStartHookInput = BaseHookInput & {
  hook_event_name: "SubagentStart";
  agent_id: string;
  agent_type: string;
};
```
#### `子代理停止钩子输入`
```typescript
type SubagentStopHookInput = BaseHookInput & {
  hook_event_name: "SubagentStop";
  stop_hook_active: boolean;
  agent_id: string;
  agent_transcript_path: string;
  agent_type: string;
  last_assistant_message?: string;
  background_tasks?: BackgroundTaskSummary[];
  session_crons?: SessionCronSummary[];
};

type BackgroundTaskSummary = {
  id: string;
  type: string;
  status: string;
  description: string;
  command?: string;
  agent_type?: string;
  server?: string;
  tool?: string;
  name?: string;
};

type SessionCronSummary = {
  id: string;
  schedule: string;
  recurring: boolean;
  prompt: string;
};
```
#### `压缩前钩子输入`
```typescript
type PreCompactHookInput = BaseHookInput & {
  hook_event_name: "PreCompact";
  trigger: "manual" | "auto";
  custom_instructions: string | null;
};
```
#### `PermissionRequest钩子输入`
```typescript
type PermissionRequestHookInput = BaseHookInput & {
  hook_event_name: "PermissionRequest";
  tool_name: string;
  tool_input: unknown;
  permission_suggestions?: PermissionUpdate[];
};
```
#### `SetupHookInput`
```typescript
type SetupHookInput = BaseHookInput & {
  hook_event_name: "Setup";
  trigger: "init" | "maintenance";
};
```
#### `队友空闲钩子输入`
```typescript
type TeammateIdleHookInput = BaseHookInput & {
  hook_event_name: "TeammateIdle";
  teammate_name: string;
  team_name: string;
};
```
#### `任务完成钩子输入`
```typescript
type TaskCompletedHookInput = BaseHookInput & {
  hook_event_name: "TaskCompleted";
  task_id: string;
  task_subject: string;
  task_description?: string;
  teammate_name?: string;
  team_name?: string;
};
```
#### `ConfigChangeHookInput`
```typescript
type ConfigChangeHookInput = BaseHookInput & {
  hook_event_name: "ConfigChange";
  source:
    | "user_settings"
    | "project_settings"
    | "local_settings"
    | "policy_settings"
    | "skills";
  file_path?: string;
};
```
`工作树创建钩子输入`
```typescript
type WorktreeCreateHookInput = BaseHookInput & {
  hook_event_name: "WorktreeCreate";
  name: string;
};
```
#### `工作树移除钩子输入`
```typescript
type WorktreeRemoveHookInput = BaseHookInput & {
  hook_event_name: "WorktreeRemove";
  worktree_path: string;
};
```
#### `MessageDisplayHookInput`
```typescript
type MessageDisplayHookInput = BaseHookInput & {
  hook_event_name: "MessageDisplay";
  turn_id: string;
  message_id: string;
  index: number;
  final: boolean;
  delta: string;
};
```
### `HookJSONOutput`

钩子的返回值。
```typescript
type HookJSONOutput = AsyncHookJSONOutput | SyncHookJSONOutput;
```
#### `AsyncHookJSONOutput`
```typescript
type AsyncHookJSONOutput = {
  async: true;
  asyncTimeout?: number;
};
```
#### `SyncHookJSONOutput`
```typescript
type SyncHookJSONOutput = {
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: "approve" | "block";
  systemMessage?: string;
  reason?: string;
  hookSpecificOutput?:
    | {
        hookEventName: "PreToolUse";
        permissionDecision?: "allow" | "deny" | "ask" | "defer";
        permissionDecisionReason?: string;
        updatedInput?: Record<string, unknown>;
        additionalContext?: string;
      }
    | {
        hookEventName: "UserPromptSubmit";
        additionalContext?: string;
      }
    | {
        hookEventName: "SessionStart";
        additionalContext?: string;
      }
    | {
        hookEventName: "Setup";
        additionalContext?: string;
      }
    | {
        hookEventName: "SubagentStart";
        additionalContext?: string;
      }
    | {
        hookEventName: "PostToolUse";
        additionalContext?: string;
        updatedToolOutput?: unknown;
        /** @deprecated Use `updatedToolOutput`, which works for all tools. */
        updatedMCPToolOutput?: unknown;
      }
    | {
        hookEventName: "PostToolUseFailure";
        additionalContext?: string;
      }
    | {
        hookEventName: "PostToolBatch";
        additionalContext?: string;
      }
    | {
        hookEventName: "Notification";
        additionalContext?: string;
      }
    | {
        hookEventName: "PermissionRequest";
        decision:
          | {
              behavior: "allow";
              updatedInput?: Record<string, unknown>;
              updatedPermissions?: PermissionUpdate[];
            }
          | {
              behavior: "deny";
              message?: string;
              interrupt?: boolean;
            };
      };
};
```
## 工具输入类型

所有内置 Claude Code 工具的输入模式文档。这些类型从 `@anthropic-ai/claude-agent-sdk` 中导出，可用于类型安全的工具交互。

### `ToolInputSchemas`

所有工具输入类型的联合，从 `@anthropic-ai/claude-agent-sdk` 中导出。
```typescript
type ToolInputSchemas =
  | AgentInput
  | AskUserQuestionInput
  | BashInput
  | TaskOutputInput
  | EnterWorktreeInput
  | ExitPlanModeInput
  | FileEditInput
  | FileReadInput
  | FileWriteInput
  | GlobInput
  | GrepInput
  | ListMcpResourcesInput
  | McpInput
  | MonitorInput
  | NotebookEditInput
  | ReadMcpResourceInput
  | SubscribeMcpResourceInput
  | SubscribePollingInput
  | TaskCreateInput
  | TaskGetInput
  | TaskListInput
  | TaskStopInput
  | TaskUpdateInput
  | TodoWriteInput
  | UnsubscribeMcpResourceInput
  | UnsubscribePollingInput
  | WebFetchInput
  | WebSearchInput
  | WorkflowInput;
```
### Agent

**工具名称：** `Agent`（此前称为 `Task`，该别名目前仍被接受）
```typescript
type AgentInput = {
  description: string;
  prompt: string;
  subagent_type: string;
  model?: "sonnet" | "opus" | "haiku";
  resume?: string;
  run_in_background?: boolean;
  max_turns?: number;
  name?: string;
  team_name?: string;
  mode?: "acceptEdits" | "bypassPermissions" | "default" | "dontAsk" | "plan";
  isolation?: "worktree";
};
```
启动一个新的代理来自主处理复杂的多步骤任务。

### AskUserQuestion

**工具名称:** `AskUserQuestion`
```typescript
type AskUserQuestionInput = {
  questions: Array<{
    question: string;
    header: string;
    options: Array<{ label: string; description: string; preview?: string }>;
    multiSelect: boolean;
  }>;
};
```
在执行期间向用户提出澄清性问题。有关用法详情，请参阅[处理审批和用户输入](/zh/agent-sdk/user-input#handle-clarifying-questions)。

### Bash

**工具名称：** `Bash`
```typescript
type BashInput = {
  command: string;
  timeout?: number;
  description?: string;
  run_in_background?: boolean;
  dangerouslyDisableSandbox?: boolean;
};
```
在持久化 shell 会话中执行 bash 命令，支持可选的超时和后台执行。

### 监控器

**工具名称：** `Monitor`
```typescript
type MonitorInput = {
  command: string;
  description: string;
  timeout_ms?: number;
  persistent?: boolean;
};
```
运行后台脚本，并将每行标准输出作为事件发送给 Claude，以便其无需轮询即可响应。设置 `persistent: true` 可实现会话级监控，例如日志尾随。监控遵循与 Bash 相同的权限规则。有关行为和提供商可用性，请参阅 [监控工具参考](/zh/tools-reference#monitor-tool)。

### TaskOutput

**工具名称：** `TaskOutput`
```typescript
type TaskOutputInput = {
  task_id: string;
  block: boolean;
  timeout: number;
};
```
从正在运行或已完成的后台任务中获取输出。

### 编辑
**工具名称：** `Edit`
```typescript
type FileEditInput = {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
};
```
在文件中执行精确的字符串替换。

### 读取

**工具名称：** `Read`
```typescript
type FileReadInput = {
  file_path: string;
  offset?: number;
  limit?: number;
  pages?: string;
};
```
从本地文件系统中读取文件，支持文本、图像、PDF 和 Jupyter notebooks。使用 `pages` 参数指定 PDF 页码范围（例如 `"1-5"`）。

### 写入

**工具名称：** `Write`
```typescript
type FileWriteInput = {
  file_path: string;
  content: string;
};
```
将文件写入本地文件系统，如文件已存在则覆盖同名文件。

### Glob

**工具名称：** `Glob`
```typescript
type GlobInput = {
  pattern: string;
  path?: string;
};
```
快速文件模式匹配功能，适用于任意大小的代码库。

### Grep

**工具名称：** `Grep`
```typescript
type GrepInput = {
  pattern: string;
  path?: string;
  glob?: string;
  type?: string;
  output_mode?: "content" | "files_with_matches" | "count";
  "-i"?: boolean;
  "-n"?: boolean;
  "-B"?: number;
  "-A"?: number;
  "-C"?: number;
  context?: number;
  head_limit?: number;
  offset?: number;
  multiline?: boolean;
};
```
基于 ripgrep 的强大搜索工具，支持正则表达式。

### TaskStop

**工具名称：** `TaskStop`
```typescript
type TaskStopInput = {
  task_id?: string;
  shell_id?: string; // Deprecated: use task_id
};
```
通过 ID 停止一个正在运行的后台任务或 shell。

### NotebookEdit

**工具名称：** `NotebookEdit`
```typescript
type NotebookEditInput = {
  notebook_path: string;
  cell_id?: string;
  new_source: string;
  cell_type?: "code" | "markdown";
  edit_mode?: "replace" | "insert" | "delete";
};
```
编辑Jupyter笔记本文件中的单元格。

### WebFetch

**工具名称：** `WebFetch`
```typescript
type WebFetchInput = {
  url: string;
  prompt: string;
};
```
从 URL 获取内容并用 AI 模型进行处理。

### WebSearch

**工具名称：** `WebSearch`
```typescript
type WebSearchInput = {
  query: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
};
```
搜索网络并返回格式化结果。

### Workflow

**工具名称：** `Workflow`
```typescript
type WorkflowInput = {
  script?: string;
  name?: string;
  scriptPath?: string;
  args?: unknown;
  resumeFromRunId?: string;
};
```
运行一个[动态工作流](/zh/workflows)：一个在后台编排多个子代理并返回一个整合结果的脚本。`Workflow` 工具在 Agent SDK v0.3.149 及更高版本中可用。`script`、`name` 或 `scriptPath` 中至少需要提供一个。

| 字段              | 类型      | 描述                                                                                                                                                                                                                                  |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `script`          | `string`  | 内联工作流脚本。必须以 `export const meta = { name, description, phases }` 作为字面量开头，接着是使用 `agent()`、`parallel()`、`pipeline()` 和 `phase()` 的脚本主体。                                                                 |
| `name`            | `string`  | 内置工作流的名称或保存在 `.claude/workflows/` 中的工作流名称。将解析为脚本。                                                                                                                                                         |
| `scriptPath`      | `string`  | 磁盘上工作流脚本文件的路径。优先级高于 `script` 和 `name`。每次调用都会持久化其脚本并在结果中返回该路径，因此您可以编辑该文件并使用相同的 `scriptPath` 重新调用以进行迭代。                                                            |
| `args`            | `unknown` | 暴露给脚本作为全局 `args` 的输入值，用于参数化的命名工作流（例如研究问题或文件路径列表）。传递数组和对象时应使用实际的 JSON 值，而不是 JSON 编码的字符串。                                                                             |
| `resumeFromRunId` | `string`  | 要恢复的先前 `Workflow` 调用的运行 ID。输入未更改的已完成 `agent()` 调用将返回缓存的结果；只有更改或新的调用才会实时运行。仅限同一会话。                                                                                               |

### TodoWrite

**工具名称：** `TodoWrite`
```typescript
type TodoWriteInput = {
  todos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
};
```
创建并管理一个结构化任务列表以跟踪进度。

  自 TypeScript Agent SDK 0.3.142 版本起，`TodoWrite` 功能默认处于禁用状态。建议改用 `TaskCreate`、`TaskGet`、`TaskUpdate` 和 `TaskList`。请参阅[迁移至任务工具](/zh-CN/agent-sdk/todo-tracking#migrate-to-task-tools)以更新您的监控代码，或设置 `CLAUDE_CODE_ENABLE_TASKS=0` 以恢复使用 `TodoWrite`。

### 任务创建

**工具名称：** `TaskCreate`
```typescript
type TaskCreateInput = {
  subject: string;
  description: string;
  activeForm?: string;
  metadata?: Record<string, unknown>;
};
```
创建单个任务并返回其分配的 ID。

### 任务更新

**工具名称：** `TaskUpdate`
```typescript
type TaskUpdateInput = {
  taskId: string;
  status?: "pending" | "in_progress" | "completed" | "deleted";
  subject?: string;
  description?: string;
  activeForm?: string;
  addBlocks?: string[];
  addBlockedBy?: string[];
  owner?: string;
  metadata?: Record<string, unknown>;
};
```
按 ID 修补一个任务。将 `status` 设置为 `"deleted"` 可将其删除。

### TaskGet

**工具名称：** `TaskGet`
```typescript
type TaskGetInput = {
  taskId: string;
};
```
返回单个任务的完整详细信息，当未找到该 ID 时返回 `null`。

### TaskList

**工具名称：** `TaskList`
```typescript
type TaskListInput = {};
```
返回当前列表中所有任务的快照。

### ExitPlanMode

**工具名称：** `ExitPlanMode`
```typescript
type ExitPlanModeInput = {
  allowedPrompts?: Array<{
    tool: "Bash";
    prompt: string;
  }>;
};
```
退出规划模式。可选地指定实施计划所需的基于提示词的权限。

### ListMcpResources

**工具名称：** `ListMcpResources`
```typescript
type ListMcpResourcesInput = {
  server?: string;
};
```
列出已连接的 MCP 服务器中可用的资源。

### ReadMcpResource

**工具名称:** `ReadMcpResource`
```typescript
type ReadMcpResourceInput = {
  server: string;
  uri: string;
};
```
从服务器读取特定的 MCP 资源。

### EnterWorktree

**工具名称：** `EnterWorktree`
```typescript
type EnterWorktreeInput = {
  name?: string;
  path?: string;
};
```
创建并进入一个临时的 git 工作树以实现隔离工作。传递 `path` 参数可切换到当前仓库的现有工作树，而非创建新工作树。`name` 与 `path` 参数互斥。

## 工具输出类型

所有内置 Claude Code 工具的输出结构文档。这些类型从 `@anthropic-ai/claude-agent-sdk` 导出，代表每个工具返回的实际响应数据。

### `ToolOutputSchemas`

所有工具输出类型的联合集合。
```typescript
type ToolOutputSchemas =
  | AgentOutput
  | AskUserQuestionOutput
  | BashOutput
  | EnterWorktreeOutput
  | ExitPlanModeOutput
  | FileEditOutput
  | FileReadOutput
  | FileWriteOutput
  | GlobOutput
  | GrepOutput
  | ListMcpResourcesOutput
  | MonitorOutput
  | NotebookEditOutput
  | ReadMcpResourceOutput
  | TaskCreateOutput
  | TaskGetOutput
  | TaskListOutput
  | TaskStopOutput
  | TaskUpdateOutput
  | TodoWriteOutput
  | WebFetchOutput
  | WebSearchOutput
  | WorkflowOutput;
```
### Agent

**工具名称：** `Agent`（此前称为 `Task`，该别名目前仍被接受）
```typescript
type AgentOutput =
  | {
      status: "completed";
      agentId: string;
      content: Array<{ type: "text"; text: string }>;
      totalToolUseCount: number;
      totalDurationMs: number;
      totalTokens: number;
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_creation_input_tokens: number | null;
        cache_read_input_tokens: number | null;
        server_tool_use: {
          web_search_requests: number;
          web_fetch_requests: number;
        } | null;
        service_tier: ("standard" | "priority" | "batch") | null;
        cache_creation: {
          ephemeral_1h_input_tokens: number;
          ephemeral_5m_input_tokens: number;
        } | null;
      };
      prompt: string;
    }
  | {
      status: "async_launched";
      agentId: string;
      description: string;
      prompt: string;
      outputFile: string;
      canReadOutputFile?: boolean;
    }
  | {
      status: "sub_agent_entered";
      description: string;
      message: string;
    };
```
根据 `status` 字段区分返回结果：`"completed"` 表示已完成的任务，`"async_launched"` 表示后台任务，`"sub_agent_entered"` 表示交互式子代理。

### 向用户提问

**工具名称:** `AskUserQuestion`
```typescript
type AskUserQuestionOutput = {
  questions: Array<{
    question: string;
    header: string;
    options: Array<{ label: string; description: string; preview?: string }>;
    multiSelect: boolean;
  }>;
  answers: Record<string, string>;
  response?: string;
};
```
返回所提问的问题和用户答案。当用户输入自由格式回复而非回答结构化问题时，会设置 `response`；若存在此字段，Claude 将收到“用户回复：...”而非逐题答案列表。

### Bash

**工具名称：** `Bash`
```typescript
type BashOutput = {
  stdout: string;
  stderr: string;
  rawOutputPath?: string;
  interrupted: boolean;
  isImage?: boolean;
  backgroundTaskId?: string;
  backgroundedByUser?: boolean;
  dangerouslyDisableSandbox?: boolean;
  returnCodeInterpretation?: string;
  structuredContent?: unknown[];
  persistedOutputPath?: string;
  persistedOutputSize?: number;
};
```
返回命令输出，其中 stdout/stderr 已分离。后台命令会包含一个 `backgroundTaskId`。

### Monitor

**工具名称:** `Monitor`
```typescript
type MonitorOutput = {
  taskId: string;
  timeoutMs: number;
  persistent?: boolean;
};
```
返回正在运行的监控的后台任务 ID。使用此 ID 配合 `TaskStop` 可提前取消监控。

### Edit

**工具名称：** `Edit`
```typescript
type FileEditOutput = {
  filePath: string;
  oldString: string;
  newString: string;
  originalFile: string;
  structuredPatch: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
  }>;
  userModified: boolean;
  replaceAll: boolean;
  gitDiff?: {
    filename: string;
    status: "modified" | "added";
    additions: number;
    deletions: number;
    changes: number;
    patch: string;
  };
};
```
返回编辑操作的结构化差异。

### Read

**工具名称：** `Read`
```typescript
type FileReadOutput =
  | {
      type: "text";
      file: {
        filePath: string;
        content: string;
        numLines: number;
        startLine: number;
        totalLines: number;
      };
    }
  | {
      type: "image";
      file: {
        base64: string;
        type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        originalSize: number;
        dimensions?: {
          originalWidth?: number;
          originalHeight?: number;
          displayWidth?: number;
          displayHeight?: number;
        };
      };
    }
  | {
      type: "notebook";
      file: {
        filePath: string;
        cells: unknown[];
      };
    }
  | {
      type: "pdf";
      file: {
        filePath: string;
        base64: string;
        originalSize: number;
      };
    }
  | {
      type: "parts";
      file: {
        filePath: string;
        originalSize: number;
        count: number;
        outputDir: string;
      };
    };
```
根据文件类型返回适当格式的内容。基于 `type` 字段进行区分。

### 写入

**工具名称：** `Write`
```typescript
type FileWriteOutput = {
  type: "create" | "update";
  filePath: string;
  content: string;
  structuredPatch: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
  }>;
  originalFile: string | null;
  gitDiff?: {
    filename: string;
    status: "modified" | "added";
    additions: number;
    deletions: number;
    changes: number;
    patch: string;
  };
};
```
返回包含结构化差异信息的写入结果。

### Glob

**工具名称：** `Glob`
```typescript
type GlobOutput = {
  durationMs: number;
  numFiles: number;
  filenames: string[];
  truncated: boolean;
};
```
返回匹配 Glob 模式的文件路径，按修改时间排序。

### Grep

**工具名称：** `Grep`
```typescript
type GrepOutput = {
  mode?: "content" | "files_with_matches" | "count";
  numFiles: number;
  filenames: string[];
  content?: string;
  numLines?: number;
  numMatches?: number;
  appliedLimit?: number;
  appliedOffset?: number;
};
```
返回搜索结果。具体格式随 `mode` 参数变化：文件列表、带匹配项的内容，或匹配项计数。

### TaskStop

**工具名称:** `TaskStop`
```typescript
type TaskStopOutput = {
  message: string;
  task_id: string;
  task_type: string;
  command?: string;
};
```
停止后台任务后返回确认信息。

### NotebookEdit

**工具名称：** `NotebookEdit`
```typescript
type NotebookEditOutput = {
  new_source: string;
  cell_id?: string;
  cell_type: "code" | "markdown";
  language: string;
  edit_mode: string;
  error?: string;
  notebook_path: string;
  original_file: string;
  updated_file: string;
};
```
返回笔记本编辑的结果，包含原始和更新的文件内容。

### WebFetch

**工具名称：** `WebFetch`
```typescript
type WebFetchOutput = {
  bytes: number;
  code: number;
  codeText: string;
  result: string;
  durationMs: number;
  url: string;
};
```
返回带有HTTP状态和元数据的获取内容。

### WebSearch

**工具名称：** `WebSearch`
```typescript
type WebSearchOutput = {
  query: string;
  results: Array<
    | {
        tool_use_id: string;
        content: Array<{ title: string; url: string }>;
      }
    | string
  >;
  durationSeconds: number;
};
```
从网络返回搜索结果。

### 工作流程

**工具名称：** `Workflow`
```typescript
type WorkflowOutput = {
  status: "async_launched";
  taskId: string;
  runId?: string;
  summary?: string;
  transcriptDir?: string;
  scriptPath?: string;
  error?: string;
};
```
工具接受调用后会立即返回。最终结果随后以任务完成的形式到达。在视运行已开始前请检查 `error` 字段：脚本若语法检查失败，会返回 `status: "async_launched"` 且 `error` 有值，且脚本永远不会运行。

| 字段            | 类型               | 描述                                                                                                                               |
| --------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `status`        | `"async_launched"` | 工具已接受调用。这是该字段唯一会取的值                                                                                             |
| `taskId`        | `string`           | 用于本次运行的后台任务标识符                                                                                                       |
| `runId`         | `string`           | 工作流运行标识符，可在后续调用中作为 `resumeFromRunId` 传递                                                                        |
| `summary`       | `string`           | 工作流所执行操作的一行简述                                                                                                         |
| `transcriptDir` | `string`           | 执行期间子代理对话记录写入的目录                                                                                                   |
| `scriptPath`    | `string`           | 本次运行持久化工作流脚本的路径。可编辑此脚本并将其作为 `scriptPath` 传回以重新运行，无需重新发送脚本                                 |
| `error`         | `string`           | 当脚本语法检查失败时设置。若此字段存在，即使状态为 `async_launched`，运行也并未开始                                                  |

### TodoWrite

**工具名称：** `TodoWrite`
```typescript
type TodoWriteOutput = {
  oldTodos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
  newTodos: Array<{
    content: string;
    status: "pending" | "in_progress" | "completed";
    activeForm: string;
  }>;
};
```
返回之前和更新后的任务列表。

  自 TypeScript Agent SDK 0.3.142 版本起，`TodoWrite` 功能默认处于禁用状态。建议改用 `TaskCreate`、`TaskGet`、`TaskUpdate` 和 `TaskList`。请参阅[迁移至任务工具](/zh-CN/agent-sdk/todo-tracking#migrate-to-task-tools)以更新您的监控代码，或设置 `CLAUDE_CODE_ENABLE_TASKS=0` 以恢复使用 `TodoWrite`。

### 任务创建

**工具名称：** `TaskCreate`
```typescript
type TaskCreateOutput = {
  task: {
    id: string;
    subject: string;
  };
};
```
返回已创建的任务及其已分配的 ID。

### TaskUpdate

**工具名称:** `TaskUpdate`
```typescript
type TaskUpdateOutput = {
  success: boolean;
  taskId: string;
  updatedFields: string[];
  error?: string;
  statusChange?: {
    from: string;
    to: string;
  };
};
```
返回更新结果，包括哪些字段发生了变化。

### TaskGet

**工具名称:** `TaskGet`
```typescript
type TaskGetOutput = {
  task: {
    id: string;
    subject: string;
    description: string;
    status: "pending" | "in_progress" | "completed";
    blocks: string[];
    blockedBy: string[];
  } | null;
};
```
当 ID 未找到时，返回 `null`。

### TaskList

**Tool name:** `TaskList`
```typescript
type TaskListOutput = {
  tasks: Array<{
    id: string;
    subject: string;
    status: "pending" | "in_progress" | "completed";
    owner?: string;
    blockedBy: string[];
  }>;
};
```
返回当前列表中所有任务的快照。

### ExitPlanMode

**工具名称：** `ExitPlanMode`
```typescript
type ExitPlanModeOutput = {
  plan: string | null;
  isAgent: boolean;
  filePath?: string;
  hasTaskTool?: boolean;
  awaitingLeaderApproval?: boolean;
  requestId?: string;
};
```
退出计划模式后返回计划状态。

### ListMcpResources

**工具名称：** `ListMcpResources`
```typescript
type ListMcpResourcesOutput = Array<{
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
  server: string;
}>;
```
返回可用 MCP 资源的数组。

### ReadMcpResource

**工具名称：** `ReadMcpResource`
```typescript
type ReadMcpResourceOutput = {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
  }>;
};
```
返回请求的 MCP 资源的内容。

### EnterWorktree

**工具名称：** `EnterWorktree`
```typescript
type EnterWorktreeOutput = {
  worktreePath: string;
  worktreeBranch?: string;
  message: string;
};
```
返回有关 git 工作树的信息。

## 权限类型

### `PermissionUpdate`

用于更新权限的操作。
```typescript
type PermissionUpdate =
  | {
      type: "addRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "replaceRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "removeRules";
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "setMode";
      mode: PermissionMode;
      destination: PermissionUpdateDestination;
    }
  | {
      type: "addDirectories";
      directories: string[];
      destination: PermissionUpdateDestination;
    }
  | {
      type: "removeDirectories";
      directories: string[];
      destination: PermissionUpdateDestination;
    };
```
### `PermissionBehavior`
```typescript
type PermissionBehavior = "allow" | "deny" | "ask";
```
### `权限更新目的地`
```typescript
type PermissionUpdateDestination =
  | "userSettings" // Global user settings
  | "projectSettings" // Per-directory project settings
  | "localSettings" // Gitignored local settings
  | "session" // Current session only
  | "cliArg"; // CLI argument
```
### `权限规则值`
```typescript
type PermissionRuleValue = {
  toolName: string;
  ruleContent?: string;
};
```
## 其他类型

### `ApiKeySource`
```typescript
type ApiKeySource = "user" | "project" | "org" | "temporary" | "oauth";
```
### `SdkBeta`

可通过 `betas` 选项启用的 Beta 功能。参阅 [Beta 头信息](https://platform.claude.com/docs/en/api/beta-headers)了解详情。
```typescript
type SdkBeta = "context-1m-2025-08-07";
```


  `context-1m-2025-08-07` 测试版已于2026年4月30日退役。将此参数与 Claude Sonnet 4.5 或 Sonnet 4 一起使用不会产生任何效果，超过标准200k token 上下文窗口的请求将返回错误。如需使用100万 token 上下文窗口，请迁移至 [Claude Sonnet 4.6、Claude Opus 4.6 或 Claude Opus 4.7](https://platform.claude.com/docs/en/about-claude/models/overview)，这些模型在标准定价中已包含100万上下文窗口，无需 beta 标头。

### `SlashCommand`

关于可用斜杠命令的信息。
```typescript
type SlashCommand = {
  name: string;
  description: string;
  argumentHint: string;
  aliases?: string[];
};
```
### `ModelInfo`

关于可用模型的信息。
```typescript
type ModelInfo = {
  value: string;
  displayName: string;
  description: string;
  supportsEffort?: boolean;
  supportedEffortLevels?: ("low" | "medium" | "high" | "xhigh" | "max")[];
  supportsAdaptiveThinking?: boolean;
  supportsFastMode?: boolean;
};
```
### `AgentInfo`

关于通过Agent工具可调用的可用子代理的信息。
```typescript
type AgentInfo = {
  name: string;
  description: string;
  model?: string;
};
```
| 字段          | 类型                  | 描述                                                         |
| :------------ | :-------------------- | :----------------------------------------------------------- |
| `name`        | `string`              | 代理类型标识符（例如：`"Explore"`、`"general-purpose"`）     |
| `description` | `string`              | 何时使用此代理的描述                                         |
| `model`       | `string \| undefined` | 此代理使用的模型别名。如果省略，则继承父代理的模型 |

### `McpServerStatus`

已连接的MCP服务器的状态。
```typescript
type McpServerStatus = {
  name: string;
  status: "connected" | "failed" | "needs-auth" | "pending" | "disabled";
  serverInfo?: {
    name: string;
    version: string;
  };
  error?: string;
  config?: McpServerStatusConfig;
  scope?: string;
  tools?: {
    name: string;
    description?: string;
    annotations?: {
      readOnly?: boolean;
      destructive?: boolean;
      openWorld?: boolean;
    };
  }[];
};
```
### `McpServerStatusConfig`

由 `mcpServerStatus()` 报告的 MCP 服务器配置。这是所有 MCP 服务器传输类型的联合。
```typescript
type McpServerStatusConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfig
  | McpClaudeAIProxyServerConfig;
```
参见 [`McpServerConfig`](#mcpserverconfig) 了解每种传输类型的详细信息。

### `AccountInfo`

已认证用户的账户信息。
```typescript
type AccountInfo = {
  email?: string;
  organization?: string;
  subscriptionType?: string;
  tokenSource?: string;
  apiKeySource?: string;
};
```
### `ModelUsage`

在结果消息中返回的按模型划分的使用统计。`costUSD` 值为客户端估算。请参阅[跟踪成本和使用情况](/zh/agent-sdk/cost-tracking)了解计费注意事项。
```typescript
type ModelUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
  contextWindow: number;
  maxOutputTokens: number;
};
```
### `ConfigScope`
```typescript
type ConfigScope = "local" | "user" | "project";
```
### `NonNullableUsage`

[`Usage`](#usage) 的一个版本，所有可空字段都变为非空。
```typescript
type NonNullableUsage = {
  [K in keyof Usage]: NonNullable<Usage[K]>;
};
```
### `Usage`

Token 用量统计。这是 `@anthropic-ai/sdk` 中的 `BetaUsage` 类型。
```typescript
type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number | null;
  cache_read_input_tokens: number | null;
  cache_creation: {
    ephemeral_5m_input_tokens: number;
    ephemeral_1h_input_tokens: number;
  } | null;
  server_tool_use: BetaServerToolUsage | null;
  service_tier: "standard" | "priority" | "batch" | null;
  speed: "standard" | "fast" | null;
  inference_geo: string | null;
  iterations: BetaIterationsUsage | null;
};
```
`BetaServerToolUsage` 和 `BetaIterationsUsage` 定义于 `@anthropic-ai/sdk`。

### `CallToolResult`

MCP 工具结果类型（来自 `@modelcontextprotocol/sdk/types.js`）。`structuredContent` 是一个可与 `content` 一起返回的 JSON 对象，支持包含图片块。请参阅 [返回结构化数据](/zh/agent-sdk/custom-tools#return-structured-data)。
```typescript
type CallToolResult = {
  content: Array<{
    type: "text" | "image" | "resource";
    // Additional fields vary by type
  }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};
```
### `ThinkingConfig`

控制 Claude 的思考/推理行为。优先级高于已弃用的 `maxThinkingTokens`。
```typescript
type ThinkingDisplay = "summarized" | "omitted";

type ThinkingConfig =
  | { type: "adaptive"; display?: ThinkingDisplay } // The model determines when and how much to reason (Opus 4.6+)
  | { type: "enabled"; budgetTokens?: number; display?: ThinkingDisplay } // Fixed thinking token budget
  | { type: "disabled" }; // No extended thinking
```
可选的 `display` 字段控制是否返回 `"summarized"` 或 `"omitted"` 的思考文本。在 Claude Opus 4.7 及更高版本上，API 默认值为 `"omitted"`，因此请设置 `"summarized"` 以在 `thinking` 块中接收思考内容。

### `SpawnedProcess`

用于自定义进程生成的接口（与 `spawnClaudeCodeProcess` 选项配合使用）。`ChildProcess` 已满足此接口要求。
```typescript
interface SpawnedProcess {
  stdin: Writable;
  stdout: Readable;
  readonly killed: boolean;
  readonly exitCode: number | null;
  kill(signal: NodeJS.Signals): boolean;
  on(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  on(event: "error", listener: (error: Error) => void): void;
  once(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  once(event: "error", listener: (error: Error) => void): void;
  off(
    event: "exit",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): void;
  off(event: "error", listener: (error: Error) => void): void;
}
```
### `SpawnOptions`

传递给自定义生成函数的选项。
```typescript
interface SpawnOptions {
  command: string;
  args: string[];
  cwd?: string;
  env: Record<string, string | undefined>;
  signal: AbortSignal;
}
```


  `signal` 字段用于告知你的 spawn 函数何时终止进程。你可以将其作为 `signal` 选项传递给 Node.js 的 `spawn()`，或将其传递给你的虚拟机或容器拆卸处理器。

  该信号并不会在 [`Options.abortController`](#options) 中止的瞬间立即触发。SDK 会首先关闭进程的标准输入（stdin），并等待大约两秒钟以便 CLI 能够正常关闭，然后才会中止该信号。如果你想在调用方中止的瞬间立即做出反应，请监听你自己的 `Options.abortController.signal`，你的 spawn 函数可以从其外部作用域引用它。

### `McpSetServersResult`

`setMcpServers()` 操作的结果。
```typescript
type McpSetServersResult = {
  added: string[];
  removed: string[];
  errors: Record<string, string>;
};
```
### `RewindFilesResult`

`rewindFiles()` 操作的结果。
```typescript
type RewindFilesResult = {
  canRewind: boolean;
  error?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
};
```
### `SDKStatusMessage`

状态更新消息（例如，压缩中）。
```typescript
type SDKStatusMessage = {
  type: "system";
  subtype: "status";
  status: "compacting" | null;
  permissionMode?: PermissionMode;
  uuid: UUID;
  session_id: string;
};
```
### `SDKTaskNotificationMessage`

当后台任务完成、失败或停止时发出的通知。后台任务包括 `run_in_background` Bash 命令、[监控项](#monitor) 监视以及后台子代理。
```typescript
type SDKTaskNotificationMessage = {
  type: "system";
  subtype: "task_notification";
  task_id: string;
  tool_use_id?: string;
  status: "completed" | "failed" | "stopped";
  output_file: string;
  summary: string;
  usage?: {
    total_tokens: number;
    tool_uses: number;
    duration_ms: number;
  };
  uuid: UUID;
  session_id: string;
};
```
### `SDKToolUseSummaryMessage`

会话中工具使用情况的摘要。
```typescript
type SDKToolUseSummaryMessage = {
  type: "tool_use_summary";
  summary: string;
  preceding_tool_use_ids: string[];
  uuid: UUID;
  session_id: string;
};
```
### `SDKHookStartedMessage`

当钩子开始执行时发出。
```typescript
type SDKHookStartedMessage = {
  type: "system";
  subtype: "hook_started";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKHookProgressMessage`

在钩子运行期间发出，包含标准输出（stdout）和标准错误输出（stderr）内容。
```typescript
type SDKHookProgressMessage = {
  type: "system";
  subtype: "hook_progress";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  stdout: string;
  stderr: string;
  output: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKHookResponseMessage`

当钩子执行完成时发出。
```typescript
type SDKHookResponseMessage = {
  type: "system";
  subtype: "hook_response";
  hook_id: string;
  hook_name: string;
  hook_event: string;
  output: string;
  stdout: string;
  stderr: string;
  exit_code?: number;
  outcome: "success" | "error" | "cancelled";
  uuid: UUID;
  session_id: string;
};
```
### `SDKToolProgressMessage`

在工具执行期间定期发出以指示进度。
```typescript
type SDKToolProgressMessage = {
  type: "tool_progress";
  tool_use_id: string;
  tool_name: string;
  parent_tool_use_id: string | null;
  elapsed_time_seconds: number;
  task_id?: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKAuthStatusMessage`

在认证流程期间发出。
```typescript
type SDKAuthStatusMessage = {
  type: "auth_status";
  isAuthenticating: boolean;
  output: string[];
  error?: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKTaskStartedMessage`

当后台任务开始时发出。`task_type` 字段为 `"local_bash"` 时代表后台 Bash 命令和 [Monitor](#monitor) 监视，为 `"local_agent"` 时代表子代理，或为 `"remote_agent"`。
```typescript
type SDKTaskStartedMessage = {
  type: "system";
  subtype: "task_started";
  task_id: string;
  tool_use_id?: string;
  description: string;
  task_type?: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKTaskProgressMessage`

在子代理或后台任务运行期间周期性发出。仅当启用 [`agentProgressSummaries`](#options) 时，`summary` 字段才会被填充。
```typescript
type SDKTaskProgressMessage = {
  type: "system";
  subtype: "task_progress";
  task_id: string;
  tool_use_id?: string;
  description: string;
  subagent_type?: string;
  usage: {
    total_tokens: number;
    tool_uses: number;
    duration_ms: number;
  };
  last_tool_name?: string;
  summary?: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKTaskUpdatedMessage`

当后台任务的状态发生变化时（例如从 `running` 变为 `completed`）会发出此消息。将 `patch` 合并到以 `task_id` 为键的本地任务映射中。`end_time` 字段是 Unix 纪元时间戳（毫秒），可与 `Date.now()` 进行比较。
```typescript
type SDKTaskUpdatedMessage = {
  type: "system";
  subtype: "task_updated";
  task_id: string;
  patch: {
    status?: "pending" | "running" | "completed" | "failed" | "killed";
    description?: string;
    end_time?: number;
    total_paused_ms?: number;
    error?: string;
    is_backgrounded?: boolean;
  };
  uuid: UUID;
  session_id: string;
};
```
### `SDKFilesPersistedEvent`

当文件检查点被持久化到磁盘时触发。
```typescript
type SDKFilesPersistedEvent = {
  type: "system";
  subtype: "files_persisted";
  files: { filename: string; file_id: string }[];
  failed: { filename: string; error: string }[];
  processed_at: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKRateLimitEvent`

当会话遇到速率限制时触发。
```typescript
type SDKRateLimitEvent = {
  type: "rate_limit_event";
  rate_limit_info: {
    status: "allowed" | "allowed_warning" | "rejected";
    resetsAt?: number;
    utilization?: number;
  };
  uuid: UUID;
  session_id: string;
};
```
### `SDKLocalCommandOutputMessage`

本地斜杠命令（例如 `/voice` 或 `/usage`）的输出。在对话记录中显示为助手风格的文本。
```typescript
type SDKLocalCommandOutputMessage = {
  type: "system";
  subtype: "local_command_output";
  content: string;
  uuid: UUID;
  session_id: string;
};
```
### `SDKPromptSuggestionMessage`

当启用 `promptSuggestions` 时，在每轮对话结束后发出。包含预测的下一个用户提示词。
```typescript
type SDKPromptSuggestionMessage = {
  type: "prompt_suggestion";
  suggestion: string;
  uuid: UUID;
  session_id: string;
};
```
### `AbortError`

用于中止操作的自定义错误类。
```typescript
class AbortError extends Error {}
```
## 沙箱配置

### `SandboxSettings`

沙箱行为的配置。使用此项可启用命令沙箱功能并以编程方式配置网络限制。
```typescript
type SandboxSettings = {
  enabled?: boolean;
  failIfUnavailable?: boolean;
  autoAllowBashIfSandboxed?: boolean;
  excludedCommands?: string[];
  allowUnsandboxedCommands?: boolean;
  network?: SandboxNetworkConfig;
  filesystem?: SandboxFilesystemConfig;
  ignoreViolations?: Record<string, string[]>;
  enableWeakerNestedSandbox?: boolean;
  ripgrep?: { command: string; args?: string[] };
};
```
| 属性                          | 类型                                                  | 默认值      | 描述                                                                                                                                                                                                                                   |
| :---------------------------- | :---------------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                     | `boolean`                                             | `false`     | 为命令执行启用沙箱模式                                                                                                                                                                                                                 |
| `failIfUnavailable`           | `boolean`                                             | `true`      | 若 `enabled` 为 `true` 但沙箱无法启动，则在启动时停止。设置为 `false` 可回退到无沙箱执行，并在 stderr 上显示警告                                                                                                                        |
| `autoAllowBashIfSandboxed`    | `boolean`                                             | `true`      | 沙箱启用时自动批准 bash 命令                                                                                                                                                                                                            |
| `excludedCommands`            | `string[]`                                            | `[]`        | 始终绕过沙箱限制的命令（例如 `['docker']`）。这些命令将自动以无沙箱模式运行，无需模型参与                                                                                                                                              |
| `allowUnsandboxedCommands`    | `boolean`                                             | `true`      | 允许模型请求在沙箱外运行命令。当为 `true` 时，模型可在工具输入中设置 `dangerouslyDisableSandbox`，这将回退到[权限系统](#未沙箱化命令的权限回退)                                                                                      |
| `network`                     | [`SandboxNetworkConfig`](#sandboxnetworkconfig)       | `undefined` | 特定于网络的沙箱配置                                                                                                                                                                                                                   |
| `filesystem`                  | [`SandboxFilesystemConfig`](#sandboxfilesystemconfig) | `undefined` | 特定于文件系统的沙箱配置，用于读写限制                                                                                                                                                                                                 |
| `ignoreViolations`            | `Record<string, string[]>`                            | `undefined` | 违规类别到忽略模式的映射（例如 `{ file: ['/tmp/*'], network: ['localhost'] }`）                                                                                                                                                          |
| `enableWeakerNestedSandbox`   | `boolean`                                             | `false`     | 为兼容性启用较弱的嵌套沙箱                                                                                                                                                                                                             |
| `ripgrep`                     | `{ command: string; args?: string[] }`                | `undefined` | 沙箱环境中自定义的 ripgrep 二进制文件配置                                                                                                                                                                                              |

  沙箱功能依赖于平台支持，在 Linux 系统上还需依赖 `bubblewrap` 和 `socat` 等工具。当 `enabled` 设为 `true` 且沙箱无法启动时，`query()` 会返回带有 `subtype: "error_during_execution"` 的 `result` 消息，并将原因记录在 `errors` 中，随后停止执行。请留意该子类型而非期望 `query()` 在产生消息前抛出异常。

  若需以非沙箱模式运行，请设置 `failIfUnavailable: false`。

#### 示例用法
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Build and test my project",
  options: {
    sandbox: {
      enabled: true,
      autoAllowBashIfSandboxed: true,
      network: {
        allowLocalBinding: true
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```


  **Unix 套接字安全：** `allowUnixSockets` 选项可以授予对强大系统服务的访问权限。例如，允许访问 `/var/run/docker.sock` 实际上通过 Docker API 授予了对整个主机系统的完全访问权限，从而绕过了沙箱隔离。只应允许那些绝对必要的 Unix 套接字，并理解每条允许规则所带来的安全影响。

### `SandboxNetworkConfig`

用于沙箱模式的网络专用配置。
```typescript
type SandboxNetworkConfig = {
  allowedDomains?: string[];
  deniedDomains?: string[];
  allowManagedDomainsOnly?: boolean;
  allowLocalBinding?: boolean;
  allowUnixSockets?: string[];
  allowAllUnixSockets?: boolean;
  httpProxyPort?: number;
  socksProxyPort?: number;
};
```
| 属性                        | 类型       | 默认值      | 描述                                                                                                                                                                                                                                                           |
| :------------------------ | :--------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedDomains`          | `string[]` | `[]`        | 沙箱进程可访问的域名                                                                                                                                                                                                                                           |
| `deniedDomains`           | `string[]` | `[]`        | 沙箱进程不可访问的域名。优先级高于 `allowedDomains`                                                                                                                                                                                                            |
| `allowManagedDomainsOnly` | `boolean`  | `false`     | 仅限托管设置。在[托管设置](/zh/permissions#managed-settings)中设定后，仅生效托管设置中的 `allowedDomains` 条目，用户、项目或本地设置中的条目将被忽略。通过 SDK 选项设置时无效                                                                                      |
| `allowLocalBinding`       | `boolean`  | `false`     | 允许进程绑定到本地端口（例如用于开发服务器）                                                                                                                                                                                                                   |
| `allowUnixSockets`        | `string[]` | `[]`        | 进程可访问的 Unix socket 路径（例如 Docker socket）                                                                                                                                                                                                           |
| `allowAllUnixSockets`     | `boolean`  | `false`     | 允许访问所有 Unix socket                                                                                                                                                                                                                                       |
| `httpProxyPort`           | `number`   | `undefined` | 网络请求的 HTTP 代理端口                                                                                                                                                                                                                                       |
| `socksProxyPort`          | `number`   | `undefined` | 网络请求的 SOCKS 代理端口                                                                                                                                                                                                                                      |

  内置的沙箱代理根据请求的主机名强制执行 `allowedDomains`，不会终止或检查 TLS 流量，因此诸如 [域前置](https://en.wikipedia.org/wiki/Domain_fronting) 等技术可能绕过它。详情请参阅 [沙箱安全限制](/zh/sandboxing#security-limitations)，以及 [安全部署](/zh/agent-sdk/secure-deployment#traffic-forwarding) 以了解如何配置 TLS 终止代理。

### `SandboxFilesystemConfig`

沙箱模式的文件系统配置。
```typescript
type SandboxFilesystemConfig = {
  allowWrite?: string[];
  denyWrite?: string[];
  denyRead?: string[];
};
```
| 属性           | 类型       | 默认值 | 描述                                  |
| :------------- | :--------- | :------ | :------------------------------------ |
| `allowWrite`   | `string[]` | `[]`    | 允许写入访问的文件路径模式            |
| `denyWrite`    | `string[]` | `[]`    | 拒绝写入访问的文件路径模式            |
| `denyRead`     | `string[]` | `[]`    | 拒绝读取访问的文件路径模式            |

### 未沙箱化命令的权限回退

当 `allowUnsandboxedCommands` 启用时，模型可以通过在工具输入中设置 `dangerouslyDisableSandbox: true` 来请求在沙箱外运行命令。这些请求会回退到现有的权限系统，即你的 `canUseTool` 处理程序将被调用，从而允许你实现自定义的授权逻辑。

  **`excludedCommands` 与 `allowUnsandboxedCommands` 对比：**

  *   `excludedCommands`：一个静态的命令列表，这些命令始终会自动绕过沙箱（例如 `['docker']`）。模型对此没有控制权。
  *   `allowUnsandboxedCommands`：允许模型在运行时决定是否请求非沙箱执行，方法是在工具输入中设置 `dangerouslyDisableSandbox: true`。


```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Deploy my application",
  options: {
    sandbox: {
      enabled: true,
      allowUnsandboxedCommands: true // Model can request unsandboxed execution
    },
    permissionMode: "default",
    canUseTool: async (tool, input) => {
      // Check if the model is requesting to bypass the sandbox
      if (tool === "Bash" && input.dangerouslyDisableSandbox) {
        // The model is requesting to run this command outside the sandbox
        console.log(`Unsandboxed command requested: ${input.command}`);

        if (isCommandAuthorized(input.command)) {
          return { behavior: "allow" as const, updatedInput: input };
        }
        return {
          behavior: "deny" as const,
          message: "Command not authorized for unsandboxed execution"
        };
      }
      return { behavior: "allow" as const, updatedInput: input };
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```
此模式使你能够：

* **审计模型请求：** 记录模型请求未沙箱化执行的时机
* **实施允许列表：** 仅允许特定命令在未沙箱化的环境下运行
* **添加审批工作流：** 要求对特权操作进行明确授权

  运行时设置了 `dangerouslyDisableSandbox: true` 的命令拥有完整的系统访问权限。请确保你的 `canUseTool` 处理程序对此类请求进行严格验证。

  若将 `permissionMode` 设置为 `bypassPermissions` 并同时启用 `allowUnsandboxedCommands`，模型将无需任何批准提示词即可自主执行沙箱外的命令。此组合配置实质上允许模型静默逃脱沙箱隔离。

## 另请参阅

* [SDK概述](/zh/agent-sdk/overview) - 通用SDK概念
* [Python SDK参考](/zh/agent-sdk/python) - Python SDK文档
* [CLI参考](/zh/cli-reference) - 命令行界面
* [常见工作流程](/zh/common-workflows) - 分步指南