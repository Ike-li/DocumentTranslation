> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，使用此文件查找所有可用页面。

# 通道参考

> 构建一个将网络钩子、警报和聊天消息推送到 Claude Code 会话中的 MCP 服务器。通道契约参考：能力声明、通知事件、回复工具、发送方控制和权限中继。

  渠道处于[研究预览](/en/channels#research-preview)阶段，需要 Claude Code v2.1.80 或更高版本。团队和企业版组织必须[明确启用](/en/channels#enterprise-controls)此功能。

通道是一个 MCP 服务器，它将事件推送到 Claude Code 会话中，以便 Claude 能够对终端外发生的事情做出反应。

你可以构建单向或双向通道。单向通道转发警报、Webhook 或监控事件供 Claude 处理。双向通道（如聊天桥接）还会[暴露一个回复工具](#暴露回复工具)，以便 Claude 能够发回消息。具有可信发送者路径的通道也可以选择[中继权限提示](#中继权限提示)，从而让你能够远程批准或拒绝工具使用。

本页涵盖：

* [概述](#概述)：通道的工作原理
* [所需条件](#所需条件)：要求和一般步骤
* [示例：构建 Webhook 接收器](#示例构建-webhook-接收器)：一个最小化的单向演练
* [服务器选项](#服务器选项)：构造函数字段
* [通知格式](#通知格式)：事件负载和传递行为
* [暴露回复工具](#暴露回复工具)：让 Claude 能够发回消息
* [控制入站消息](#控制入站消息)：发送者检查以防止提示词注入
* [中继权限提示](#中继权限提示)：将工具批准提示转发到远程通道

如果要使用现有通道而非构建自己的通道，请参阅[通道](/en/channels)。研究预览版中包含 Telegram、Discord、iMessage 和 fakechat。

## 概述

通道是一个 [MCP](https://modelcontextprotocol.io) 服务器，它运行在与 Claude Code 相同的机器上。Claude Code 将其生成为一个子进程，并通过 stdio 进行通信。你的通道服务器是外部系统与 Claude Code 会话之间的桥梁：

* **聊天平台**（Telegram、Discord）：你的插件在本地运行，并轮询平台的 API 以获取新消息。当有人私信你的机器人时，插件会收到消息并将其转发给 Claude。无需暴露任何 URL。
* **Webhook**（CI、监控）：你的服务器在本地 HTTP 端口上监听。外部系统向该端口 POST 数据，你的服务器将负载推送给 Claude。

<img src="https://mintcdn.com/claude-code/zbUxPYi8065L3Y_P/en/images/channel-architecture.svg?fit=max&auto=format&n=zbUxPYi8065L3Y_P&q=85&s=fd6b6b949eab38264043d2a96285a57c" alt="架构图显示外部系统连接到你的本地通道服务器，该服务器通过 stdio 与 Claude Code 通信" width="600" height="220" data-path="en/images/channel-architecture.svg" />

## 所需条件

唯一硬性要求是 [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) 包和一个兼容 Node.js 的运行时。[Bun](https://bun.sh)、[Node](https://nodejs.org) 和 [Deno](https://deno.com) 都可以工作。研究预览版中的预构建插件使用 Bun，但你的通道不一定需要。

你的服务器需要：

1. 声明 `claude/channel` 能力，以便 Claude Code 注册一个通知监听器
2. 当发生事情时触发 `notifications/claude/channel` 事件
3. 通过 [stdio 传输](https://modelcontextprotocol.io/docs/concepts/transports#standard-io) 连接（Claude Code 会将你的服务器生成为子进程）

[服务器选项](#服务器选项)和[通知格式](#通知格式)部分详细介绍了这些内容。请参阅[示例：构建 Webhook 接收器](#示例构建-webhook-接收器)获取完整演练。

在研究预览期间，自定义通道不在[批准的允许列表](/en/channels#supported-channels)上。使用 `--dangerously-load-development-channels` 在本地进行测试。有关详细信息，请参阅[在研究预览期间测试](#在研究预览期间测试)。

## 示例：构建 Webhook 接收器

本演练构建了一个单文件服务器，它监听 HTTP 请求并将其转发到你的 Claude Code 会话中。完成后，任何能够发送 HTTP POST 的内容（例如 CI 管道、监控警报或 `curl` 命令）都可以将事件推送给 Claude。

此示例使用 [Bun](https://bun.sh) 作为运行时，因为它内置了 HTTP 服务器并支持 TypeScript。你可以改用 [Node](https://nodejs.org) 或 [Deno](https://deno.com)；唯一的要求是 [MCP SDK](https://www.npmjs.com/package/@modelcontextprotocol/sdk)。


    创建新目录并安装 MCP SDK：
    ```bash
    mkdir webhook-channel && cd webhook-channel
    bun add @modelcontextprotocol/sdk
    ```



    创建一个名为 `webhook.ts` 的文件。这是你的整个通道服务器：它通过 stdio 连接到 Claude Code，并监听 8788 端口的 HTTP POST 请求。当请求到达时，它会将请求体作为通道事件推送给 Claude。
    ```ts title="webhook.ts"
    #!/usr/bin/env bun
    import { Server } from '@modelcontextprotocol/sdk/server/index.js'
    import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

    // Create the MCP server and declare it as a channel
    const mcp = new Server(
      { name: 'webhook', version: '0.0.1' },
      {
        // this key is what makes it a channel — Claude Code registers a listener for it
        capabilities: { experimental: { 'claude/channel': {} } },
        // added to Claude's system prompt so it knows how to handle these events
        instructions: 'Events from the webhook channel arrive as <channel source="webhook" ...>. They are one-way: read them and act, no reply expected.',
      },
    )

    // Connect to Claude Code over stdio (Claude Code spawns this process)
    await mcp.connect(new StdioServerTransport())

    // Start an HTTP server that forwards every POST to Claude
    Bun.serve({
      port: 8788,  // any open port works
      // localhost-only: nothing outside this machine can POST
      hostname: '127.0.0.1',
      async fetch(req) {
        const body = await req.text()
        await mcp.notification({
          method: 'notifications/claude/channel',
          params: {
            content: body,  // becomes the body of the <channel> tag
            // each key becomes a tag attribute, e.g. <channel path="/" method="POST">
            meta: { path: new URL(req.url).pathname, method: req.method },
          },
        })
        return new Response('ok')
      },
    })
    ```
    该文件按顺序执行三项操作：

    * **服务器配置**：创建一个在能力中包含 `claude/channel` 的 MCP 服务器，用于告知 Claude Code 这是一个通道。[`instructions`](#server-options) 字符串将被写入 Claude 的系统提示词中：告诉 Claude 应该预期哪些事件、是否需要回复，以及如果需要回复应如何路由回复。
    * **标准输入输出连接**：通过标准输入输出连接到 Claude Code。这是任何 [MCP 服务器](https://modelcontextprotocol.io/docs/concepts/transports#standard-io) 的标准做法：Claude Code 将其作为子进程启动。
    * **HTTP 监听器**：在端口 8788 上启动一个本地 Web 服务器。每个 POST 请求体都会通过 `mcp.notification()` 转发给 Claude 作为一个通道事件。`content` 成为事件主体，每个 `meta` 条目都会成为 `<channel>` 标签上的一个属性。监听器需要访问 `mcp` 实例，因此它在同一个进程中运行。对于更大的项目，你可以将其拆分为独立的模块。



    将服务器添加到您的 MCP 配置中，以便 Claude Code 知道如何启动它。对于位于同一目录中的项目级 `.mcp.json`，请使用相对路径。对于位于 `~/.claude.json` 的用户级配置，请使用完整绝对路径，这样服务器就能从任何项目中被找到：
    ```json title=".mcp.json"
    {
      "mcpServers": {
        "webhook": { "command": "bun", "args": ["./webhook.ts"] }
      }
    }
    ```
    Claude Code 在启动时读取您的 MCP 配置，并以子进程形式启动每个服务器。



    在研究预览期间，自定义频道未被加入白名单，因此需要使用开发标志启动 Claude Code：
    ```bash
    claude --dangerously-load-development-channels server:webhook
    ```
    当 Claude Code 启动时，它会读取您的 MCP 配置，将您的 `webhook.ts` 作为子进程启动，HTTP 监听器会自动在您配置的端口上运行（本例中为 8788）。您无需自行运行服务器。

    如果您看到“被组织策略阻止”的提示，您的组织管理员需要先[启用频道](/en/channels#enterprise-controls)。

    在另一个终端中，通过向您的服务器发送一条包含消息的 HTTP POST 请求来模拟 webhook。此示例将一个 CI 失败警报发送到端口 8788（或您配置的其他端口）：
    ```bash
    curl -X POST localhost:8788 -d "build failed on main: https://ci.example.com/run/1234"
    ```
    你在 Claude Code 会话中接收到的有效载荷，是以一个 `<channel>` 标签的形式存在的：
    ```text
    <channel source="webhook" path="/" method="POST">build failed on main: https://ci.example.com/run/1234</channel>
    ```
    在你的 Claude Code 终端中，你会看到 Claude 接收到消息并开始响应：读取文件、运行命令，或者执行消息所要求的操作。这是一个单向通道，因此 Claude 在你的会话中执行操作，但不会通过 webhook 发送任何内容。若要添加回复，请参阅 [暴露一个回复工具](#expose-a-reply-tool)。

    如果事件未到达，诊断结果取决于 `curl` 返回的内容：

    * **`curl` 成功但 Claude 未收到任何内容**：在你的会话中运行 `/mcp` 以检查服务器的状态。"连接失败"通常意味着你的服务器文件中存在依赖项或导入错误；请检查 `~/.claude/debug/<session-id>.txt` 处的调试日志以获取 stderr 追踪信息。
    * **`curl` 失败并显示"connection refused"**：端口可能尚未绑定，或者之前的运行残留了一个遗留进程占用了该端口。使用 `lsof -i :<port>` 查看正在监听的进程；在重新启动会话之前，`kill` 掉该遗留进程。


[fakechat 服务器](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/fakechat)通过添加 Web UI、文件附件和用于双向聊天的回复工具，扩展了此模式。

## 研究预览期间的测试

在研究预览期间，每个频道都必须在[批准的允许列表](/en/channels#research-preview)上才能注册。开发标志在确认提示后可为特定条目绕过允许列表。此示例展示了两种条目类型：
```bash
# Testing a plugin you're developing
claude --dangerously-load-development-channels plugin:yourplugin@yourmarketplace

# Testing a bare .mcp.json server (no plugin wrapper yet)
claude --dangerously-load-development-channels server:webhook
```
绕过是针对每个条目单独生效的。将此标志与 `--channels` 结合使用不会将绕过扩展到 `--channels` 条目。在研究预览期间，经批准的白名单由 Anthropic 策划，因此在您构建和测试期间，您的通道会保持开发标志状态。

  此标志仅跳过允许列表。`channelsEnabled` 组织策略仍然适用。请勿使用它来运行来自不可信来源的频道。

## 服务器选项

通道在 [`Server`](https://modelcontextprotocol.io/docs/concepts/servers) 构造函数中设置这些选项。`instructions` 和 `capabilities.tools` 字段是[标准 MCP](https://modelcontextprotocol.io/docs/concepts/servers)；`capabilities.experimental['claude/channel']` 和 `capabilities.experimental['claude/channel/permission']` 是通道特定的新增字段：

| 字段                                                       | 类型     | 描述                                                                                                                                                                                                                                                                 |
| :------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capabilities.experimental['claude/channel']`            | `object` | 必需。始终为 `{}`。存在此字段会注册通知监听器。                                                                                                                                                                                                                       |
| `capabilities.experimental['claude/channel/permission']` | `object` | 可选。始终为 `{}`。声明此通道可以接收权限中继请求。当声明后，Claude Code 会将工具审批提示词转发到你的通道，以便你远程批准或拒绝它们。参见[中继权限提示词](#relay-permission-prompts)。                                                                                     |
| `capabilities.tools`                                     | `object` | 仅限双向。始终为 `{}`。标准 MCP 工具能力。参见[暴露回复工具](#expose-a-reply-tool)。                                                                                                                                                                                  |
| `instructions`                                           | `string` | 推荐。会添加到 Claude 的系统提示词中。告知 Claude 预期哪些事件、`<channel>` 标签属性的含义、是否需要回复，如果回复则应使用哪个工具以及传递回哪个属性（例如 `chat_id`）。                                                                                                    |

要创建单向通道，请省略 `capabilities.tools`。此示例展示了一个设置了通道能力、工具和指令的双向设置：
```ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

const mcp = new Server(
  { name: 'your-channel', version: '0.0.1' },
  {
    capabilities: {
      experimental: { 'claude/channel': {} },  // registers the channel listener
      tools: {},  // omit for one-way channels
    },
    // added to Claude's system prompt so it knows how to handle your events
    instructions: 'Messages arrive as <channel source="your-channel" ...>. Reply with the reply tool.',
  },
)
```
要推送事件，请调用 `mcp.notification()` 并使用方法 `notifications/claude/channel`。参数将在下一节中说明。

## 通知格式

您的服务器通过 `notifications/claude/channel` 发出通知，该方法包含两个参数：

| 字段      | 类型                     | 描述                                                                                                                                                                                                                                                            |
| :-------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content` | `string`                 | 事件正文。作为 `<channel>` 标签的内容进行传递。                                                                                                                                                                                                                   |
| `meta`    | `Record<string, string>` | 可选。每一项将成为 `<channel>` 标签的属性，用于路由上下文，例如聊天ID、发送者名称或警报严重级别。键必须是标识符：仅限字母、数字和下划线。包含连字符或其他字符的键将被静默忽略。                                                                                                |

您的服务器通过在 `Server` 实例上调用 `mcp.notification()` 来推送事件。此示例推送了一个带有两个 `meta` 键的 CI 失败警报：
```ts
await mcp.notification({
  method: 'notifications/claude/channel',
  params: {
    content: 'build failed on main: https://ci.example.com/run/1234',
    meta: { severity: 'high', run_id: '1234' },
  },
})
```
事件到达Claude上下文时会被包裹在`<channel>`标签中。`source`属性会根据你服务器配置的名称自动设置：
```text
<channel source="your-channel" severity="high" run_id="1234">
build failed on main: https://ci.example.com/run/1234
</channel>
```
通知不会被确认。对 `mcp.notification()` 的 `await` 会在消息写入传输层时解析完成，而非在 Claude 处理完该消息时。如果会话未将您的服务器加载为通道，或者组织策略阻止了该操作，事件会被静默丢弃，不会向您的服务器返回任何错误。

如果您需要投递确认，请在您的服务器中跟踪事件状态，并暴露一个[回复工具](#expose-a-reply-tool)，以便 Claude 可以调用它来回报状态。

事件会排队进入会话并按顺序处理。如果多个通知在 Claude 繁忙时到达，它们会在下一轮对话中一起投递，由 Claude 作为一组进行处理。要并发处理独立的事件流，请运行单独的会话。

## 暴露一个回复工具

如果您的通道是双向的（例如聊天桥接而非警报转发器），可以暴露一个标准的 [MCP 工具](https://modelcontextprotocol.io/docs/concepts/tools)，让 Claude 可以调用它来回传消息。工具注册本身与通道无关。一个回复工具包含三个组件：

1.  在您的 `Server` 构造函数能力中设置一个 `tools: {}` 条目，以便 Claude Code 能发现该工具
2.  定义工具 schema 并实现发送逻辑的工具处理程序
3.  在您的 `Server` 构造函数中添加一条 `instructions` 字符串，告诉 Claude 何时以及如何调用该工具

要将这些添加到[上面的 webhook 接收器](#example-build-a-webhook-receiver)中：


    在你的 `Server` 构造函数中，在 `webhook.ts` 中，添加 `tools: {}` 到能力中，以便 Claude Code 知道你的服务器提供工具：
    ```ts
    capabilities: {
      experimental: { 'claude/channel': {} },
      tools: {},  // enables tool discovery
    },
    ```



    在 `webhook.ts` 中添加以下内容。`import` 语句放在文件顶部与其他导入一起；两个处理函数放在 `Server` 构造函数和 `mcp.connect()` 之间。这将注册一个 Claude 可以使用 `chat_id` 和 `text` 调用的 `reply` 工具：
    ```ts
    // Add this import at the top of webhook.ts
    import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

    // Claude queries this at startup to discover what tools your server offers
    mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'reply',
        description: 'Send a message back over this channel',
        // inputSchema tells Claude what arguments to pass
        inputSchema: {
          type: 'object',
          properties: {
            chat_id: { type: 'string', description: 'The conversation to reply in' },
            text: { type: 'string', description: 'The message to send' },
          },
          required: ['chat_id', 'text'],
        },
      }],
    }))

    // Claude calls this when it wants to invoke a tool
    mcp.setRequestHandler(CallToolRequestSchema, async req => {
      if (req.params.name === 'reply') {
        const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
        // send() is your outbound: POST to your chat platform, or for local
        // testing the SSE broadcast shown in the full example below.
        send(`Reply to ${chat_id}: ${text}`)
        return { content: [{ type: 'text', text: 'sent' }] }
      }
      throw new Error(`unknown tool: ${req.params.name}`)
    })
    ```



    更新 `Server` 构造函数中的 `instructions` 字符串，以便 Claude 知道通过该工具路由回复。此示例指示 Claude 从入站标签中传递 `chat_id`：
    ```ts
    instructions: 'Messages arrive as <channel source="webhook" chat_id="...">. Reply with the reply tool, passing the chat_id from the tag.'
    ```


这是支持双向通信的完整 `webhook.ts` 文件。出站回复通过 [服务器发送事件](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) (SSE) 在 `GET /events` 端点进行流式传输，因此可以使用 `curl -N localhost:8788/events` 实时查看；入站聊天则通过 `POST /` 端点接收：
```ts title="Full webhook.ts with reply tool" expandable
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// --- Outbound: write to any curl -N listeners on /events --------------------
// A real bridge would POST to your chat platform instead.
const listeners = new Set<(chunk: string) => void>()
function send(text: string) {
  const chunk = text.split('\n').map(l => `data: ${l}\n`).join('') + '\n'
  for (const emit of listeners) emit(chunk)
}

const mcp = new Server(
  { name: 'webhook', version: '0.0.1' },
  {
    capabilities: {
      experimental: { 'claude/channel': {} },
      tools: {},
    },
    instructions: 'Messages arrive as <channel source="webhook" chat_id="...">. Reply with the reply tool, passing the chat_id from the tag.',
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'reply',
    description: 'Send a message back over this channel',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string', description: 'The conversation to reply in' },
        text: { type: 'string', description: 'The message to send' },
      },
      required: ['chat_id', 'text'],
    },
  }],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  if (req.params.name === 'reply') {
    const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
    send(`Reply to ${chat_id}: ${text}`)
    return { content: [{ type: 'text', text: 'sent' }] }
  }
  throw new Error(`unknown tool: ${req.params.name}`)
})

await mcp.connect(new StdioServerTransport())

let nextId = 1
Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  idleTimeout: 0,  // don't close idle SSE streams
  async fetch(req) {
    const url = new URL(req.url)

    // GET /events: SSE stream so curl -N can watch Claude's replies live
    if (req.method === 'GET' && url.pathname === '/events') {
      const stream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(': connected\n\n')  // so curl shows something immediately
          const emit = (chunk: string) => ctrl.enqueue(chunk)
          listeners.add(emit)
          req.signal.addEventListener('abort', () => listeners.delete(emit))
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    // POST: forward to Claude as a channel event
    const body = await req.text()
    const chat_id = String(nextId++)
    await mcp.notification({
      method: 'notifications/claude/channel',
      params: {
        content: body,
        meta: { chat_id, path: url.pathname, method: req.method },
      },
    })
    return new Response('ok')
  },
})
```
[fakechat 服务器](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/fakechat)展示了一个更完整的示例，包含文件附件和消息编辑功能。

## 过滤入站消息

一个未受控的渠道是一个提示词注入途径。任何能访问到您的端点的人都可以将文本置于 Claude 之前。监听聊天平台或公共端点的渠道在发出任何信息之前，需要进行真正的发送者检查。

在调用 `mcp.notification()` 之前，需要根据允许列表检查发送者身份。此示例会丢弃任何不在允许集合中的发送者的消息：
```ts
const allowed = new Set(loadAllowlist())  // from your access.json or equivalent

// inside your message handler, before emitting:
if (!allowed.has(message.from.id)) {  // sender, not room
  return  // drop silently
}
await mcp.notification({ ... })
```
基于发送者的身份而非聊天或房间身份进行访问控制：在示例中是 `message.from.id`，而非 `message.chat.id`。在群组聊天中，两者可能不同，若基于房间身份进行访问控制，将允许任何人在已加入白名单的群组中向会话注入消息。

[Telegram](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/telegram) 和 [Discord](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord) 通道以相同方式基于发送者白名单进行访问控制。它们通过配对来初始化白名单：用户私信机器人，机器人回复一个配对码，用户在其 Claude Code 会话中批准该配对码，其平台 ID 随即被添加。可查看任一实现以了解完整的配对流程。[iMessage](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/imessage) 通道采用不同方式：它在启动时从消息数据库中检测用户自身的地址并自动放行，其他发送者则通过句柄添加。

## 中继权限提示

  权限中继需要 Claude Code v2.1.81 或更高版本。早期版本会忽略 `claude/channel/permission` 能力。

当 Claude 调用需要批准的工具时，本地终端对话框会打开，会话进入等待状态。双向通道可以选择同时接收相同的提示词，并将其转发到你的另一台设备上。两端保持活动状态：你可以在终端或手机上应答，Claude Code 将采用最先到达的答案，并关闭另一端的等待。

中继覆盖了 `Bash`、`Write` 和 `Edit` 等工具的使用批准。项目信任和 MCP 服务器同意对话框不进行中继；这些仅出现在本地终端。

### 中继工作原理

当权限提示打开时，中继循环包含四个步骤：

1.  Claude Code 生成一个简短的请求 ID 并通知你的服务器
2.  你的服务器将提示词和 ID 转发到你的聊天应用
3.  远程用户回复是或否以及该 ID
4.  你的入站处理器将回复解析为裁决，Claude Code 仅在该 ID 与一个未完成的请求匹配时应用此裁决

在此过程中，本地终端对话框始终保持打开状态。如果终端用户在远程裁决到达之前应答，则应用该答案，并丢弃未完成的远程请求。

<img src="https://mintcdn.com/claude-code/DsZvsJII1OmzIjIs/en/images/channel-permission-relay.svg?fit=max&auto=format&n=DsZvsJII1OmzIjIs&q=85&s=c1d75f6ee34c2757983e2cca899b90d1" alt="序列图：Claude Code 发送一个 permission_request 通知到通道服务器，服务器格式化并发送提示词到聊天应用，人类用一个裁决回复，服务器将该回复解析为一个权限通知返回给 Claude Code" width="600" height="230" data-path="en/images/channel-permission-relay.svg" />

### 权限请求字段

Claude Code 的出站通知是 `notifications/claude/channel/permission_request`。与[通道通知](#notification-format)类似，传输采用标准 MCP，但方法和模式是 Claude Code 的扩展。`params` 对象包含四个字符串字段，你的服务器将其格式化为发出的提示词：

| 字段            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request_id`    | 从 `a`-`z`（不含 `l`）中抽取的五个小写字母，使其在手机上输入时不会被读作 `1` 或 `I`。将其包含在你发出的提示词中，以便可以在回复中回显。Claude Code 只接受携带其签发 ID 的裁决。本地终端对话框不显示此 ID，因此你的出站处理器是获取它的唯一途径。                                                                                                                                                                                   |
| `tool_name`     | Claude 想要使用的工具名称，例如 `Bash` 或 `Write`。                                                                                                                                                                                                                                                                                                                                                                     |
| `description`   | 关于此特定工具调用用途的人类可读摘要，与本地终端对话框显示的文本相同。对于 Bash 调用，这是 Claude 对命令的描述，或者如果未提供描述则是命令本身。                                                                                                                                                                                                                                                                          |
| `input_preview` | 工具的参数，以 JSON 字符串形式表示，截断至 200 个字符。对于 Bash，这是命令；对于 Write，它是文件路径和内容的前缀。如果你的消息空间有限，只能放一行，可以在你的提示词中省略它。由你的服务器决定显示什么。                                                                                                                                                                                                                   |

你的服务器发回的裁决是 `notifications/claude/channel/permission`，包含两个字段：`request_id` 回显上面的 ID，`behavior` 设置为 `'allow'` 或 `'deny'`。允许让工具调用继续；拒绝则终止它，与在本地对话框中回答“否”相同。任何裁决都不影响未来的调用。

### 为聊天桥接添加中继

为双向通道添加权限中继需要三个组件：

1.  在你的 `Server` 构造函数中 `experimental` 能力下添加 `claude/channel/permission: {}` 条目，以便 Claude Code 知道转发提示词
2.  为 `notifications/claude/channel/permission_request` 添加一个通知处理器，该处理器格式化提示词并通过你的平台 API 发送出去
3.  在你的入站消息处理器中添加一个检查，识别 `yes <id>` 或 `no <id>`，并发出 `notifications/claude/channel/permission` 裁决，而不是将文本转发给 Claude

仅在你的通道[认证发送者](#gate-inbound-messages)时才声明此能力，因为任何能够通过你的通道回复的人都可以在你的会话中批准或拒绝工具使用。

要将这些添加到双向聊天桥接（如[暴露一个回复工具](#expose-a-reply-tool)中组装的桥接）中：


    在你的 `Server` 构造函数中，在 `experimental` 下的 `claude/channel` 旁边添加 `claude/channel/permission: {}`：
    ```ts
    capabilities: {
      experimental: {
        'claude/channel': {},
        'claude/channel/permission': {},  // opt in to permission relay
      },
      tools: {},
    },
    ```



    在你的 `Server` 构造函数与 `mcp.connect()` 之间注册一个通知处理程序。当权限对话框打开时，Claude Code 会调用该处理程序，并传递[四个请求字段](#permission-request-fields)。你的处理程序应为你的平台格式化提示词，并包含用 ID 进行回复的说明：
    ```ts
    import { z } from 'zod'

    // setNotificationHandler routes by z.literal on the method field,
    // so this schema is both the validator and the dispatch key
    const PermissionRequestSchema = z.object({
      method: z.literal('notifications/claude/channel/permission_request'),
      params: z.object({
        request_id: z.string(),     // five lowercase letters, include verbatim in your prompt
        tool_name: z.string(),      // e.g. "Bash", "Write"
        description: z.string(),    // human-readable summary of this call
        input_preview: z.string(),  // tool args as JSON, truncated to ~200 chars
      }),
    })

    mcp.setNotificationHandler(PermissionRequestSchema, async ({ params }) => {
      // send() is your outbound: POST to your chat platform, or for local
      // testing the SSE broadcast shown in the full example below.
      send(
        `Claude wants to run ${params.tool_name}: ${params.description}\n\n` +
        // the ID in the instruction is what your inbound handler parses in Step 3
        `Reply "yes ${params.request_id}" or "no ${params.request_id}"`,
      )
    })
    ```



    你的入站处理程序是从平台接收消息的循环或回调函数：在这里你可以[根据发送者过滤](#gate-inbound-messages)并发出 `notifications/claude/channel` 以将聊天转发给 Claude。在转发聊天的调用之前添加一个检查，识别裁决格式并发出权限通知。

    该正则表达式匹配 Claude Code 生成的 ID 格式：五个字母，且不包含 `l`。使用 `/i` 标志可以容忍手机自动大写回复的情况；在发送回捕获的 ID 前，请将其转换为小写。
    ```ts
    // matches "y abcde", "yes abcde", "n abcde", "no abcde"
    // [a-km-z] is the ID alphabet Claude Code uses (lowercase, skips 'l')
    // /i tolerates phone autocorrect; lowercase the capture before sending
    const PERMISSION_REPLY_RE = /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i

    async function onInbound(message: PlatformMessage) {
      if (!allowed.has(message.from.id)) return  // gate on sender first

      const m = PERMISSION_REPLY_RE.exec(message.text)
      if (m) {
        // m[1] is the verdict word, m[2] is the request ID
        // emit the verdict notification back to Claude Code instead of chat
        await mcp.notification({
          method: 'notifications/claude/channel/permission',
          params: {
            request_id: m[2].toLowerCase(),  // normalize in case of autocorrect caps
            behavior: m[1].toLowerCase().startsWith('y') ? 'allow' : 'deny',
          },
        })
        return  // handled as verdict, don't also forward as chat
      }

      // didn't match verdict format: fall through to the normal chat path
      await mcp.notification({
        method: 'notifications/claude/channel',
        params: { content: message.text, meta: { chat_id: String(message.chat.id) } },
      })
    }
    ```


Claude Code 同时保持本地终端对话窗口开放，因此您可以在任意位置进行回复，先到达的回复将被采纳。不符合预期格式的远程回复会以两种方式之一失败，且在这两种情况下对话窗口均保持打开：

* **格式不同**：您入站处理器的正则表达式匹配失败，因此像 `approve it` 或 `yes` 这样没有附带 ID 的文本会作为普通消息传递给 Claude。
* **格式正确，但 ID 错误**：您的服务器发出了裁定结果，但 Claude Code 找不到具有该 ID 的开放请求，因此会静默丢弃该结果。

### 完整示例

下面的 `webhook.ts` 汇集了本页的所有三个扩展功能：回复工具、发送方限制和权限中继。如果您从这里开始，还需要参考[初始演练中的项目设置和 `.mcp.json` 条目](#example-build-a-webhook-receiver)。

为了使两个方向都能通过 curl 进行测试，HTTP 监听器服务两个路径：

* **`GET /events`**：保持一个 SSE 流连接打开，并将每条出站消息作为一行 `data:` 推送，因此 `curl -N` 可以实时观察 Claude 的回复和权限提示。
* **`POST /`**：入站端，与之前的处理器相同，现在在聊天转发分支之前插入了对裁定格式的检查。
```ts title="Full webhook.ts with permission relay" expandable
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// --- Outbound: write to any curl -N listeners on /events --------------------
// A real bridge would POST to your chat platform instead.
const listeners = new Set<(chunk: string) => void>()
function send(text: string) {
  const chunk = text.split('\n').map(l => `data: ${l}\n`).join('') + '\n'
  for (const emit of listeners) emit(chunk)
}

// Sender allowlist. For the local walkthrough we trust the single X-Sender
// header value "dev"; a real bridge would check the platform's user ID.
const allowed = new Set(['dev'])

const mcp = new Server(
  { name: 'webhook', version: '0.0.1' },
  {
    capabilities: {
      experimental: {
        'claude/channel': {},
        'claude/channel/permission': {},  // opt in to permission relay
      },
      tools: {},
    },
    instructions:
      'Messages arrive as <channel source="webhook" chat_id="...">. ' +
      'Reply with the reply tool, passing the chat_id from the tag.',
  },
)

// --- reply tool: Claude calls this to send a message back -------------------
mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'reply',
    description: 'Send a message back over this channel',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string', description: 'The conversation to reply in' },
        text: { type: 'string', description: 'The message to send' },
      },
      required: ['chat_id', 'text'],
    },
  }],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  if (req.params.name === 'reply') {
    const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
    send(`Reply to ${chat_id}: ${text}`)
    return { content: [{ type: 'text', text: 'sent' }] }
  }
  throw new Error(`unknown tool: ${req.params.name}`)
})

// --- permission relay: Claude Code (not Claude) calls this when a dialog opens
const PermissionRequestSchema = z.object({
  method: z.literal('notifications/claude/channel/permission_request'),
  params: z.object({
    request_id: z.string(),
    tool_name: z.string(),
    description: z.string(),
    input_preview: z.string(),
  }),
})

mcp.setNotificationHandler(PermissionRequestSchema, async ({ params }) => {
  send(
    `Claude wants to run ${params.tool_name}: ${params.description}\n\n` +
    `Reply "yes ${params.request_id}" or "no ${params.request_id}"`,
  )
})

await mcp.connect(new StdioServerTransport())

// --- HTTP on :8788: GET /events streams outbound, POST routes inbound -------
const PERMISSION_REPLY_RE = /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i
let nextId = 1

Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  idleTimeout: 0,  // don't close idle SSE streams
  async fetch(req) {
    const url = new URL(req.url)

    // GET /events: SSE stream so curl -N can watch replies and prompts live
    if (req.method === 'GET' && url.pathname === '/events') {
      const stream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(': connected\n\n')  // so curl shows something immediately
          const emit = (chunk: string) => ctrl.enqueue(chunk)
          listeners.add(emit)
          req.signal.addEventListener('abort', () => listeners.delete(emit))
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    // everything else is inbound: gate on sender first
    const body = await req.text()
    const sender = req.headers.get('X-Sender') ?? ''
    if (!allowed.has(sender)) return new Response('forbidden', { status: 403 })

    // check for verdict format before treating as chat
    const m = PERMISSION_REPLY_RE.exec(body)
    if (m) {
      await mcp.notification({
        method: 'notifications/claude/channel/permission',
        params: {
          request_id: m[2].toLowerCase(),
          behavior: m[1].toLowerCase().startsWith('y') ? 'allow' : 'deny',
        },
      })
      return new Response('verdict recorded')
    }

    // normal chat: forward to Claude as a channel event
    const chat_id = String(nextId++)
    await mcp.notification({
      method: 'notifications/claude/channel',
      params: { content: body, meta: { chat_id, path: url.pathname } },
    })
    return new Response('ok')
  },
})
```
在三个终端中测试 verdict 路径。第一个是你的 Claude Code 会话，使用[开发标志](#test-during-the-research-preview)启动，以便它启动 `webhook.ts`：
```bash
claude --dangerously-load-development-channels server:webhook
```
其次，流式处理出站端，以便实时查看 Claude 的回复和任何触发的权限提示：
```bash
curl -N localhost:8788/events
```
在第三步中，发送一条消息以使Claude尝试运行一个命令：
```bash
curl -d "list the files in this directory" -H "X-Sender: dev" localhost:8788
```
本地权限对话框会在 Claude Code 终端中打开。片刻之后，提示词会出现在 `/events` 流中，包含五字母 ID。从远程端批准它：
```bash
curl -d "yes <id>" -H "X-Sender: dev" localhost:8788
```
本地对话框关闭后工具运行。Claude 的回复通过 `reply` 工具返回，并同样落入流中。

此文件中三个通道特定部分：

* **`Server` 构造函数中的能力声明**：`claude/channel` 注册通知监听器，`claude/channel/permission` 启用权限中继，`tools` 使 Claude 能够发现回复工具。
* **出站路径**：`reply` 工具处理器是 Claude 调用以生成对话回复的部分；`PermissionRequestSchema` 通知处理器是 Claude Code 在权限对话框打开时调用的部分。两者都调用 `send()` 通过 `/events` 进行广播，但它们由系统的不同部分触发。
* **HTTP 处理器**：`GET /events` 保持一个 SSE 流打开，以便 curl 可以实时观察出站信息；`POST` 是入站路径，受 `X-Sender` 头信息限制。`yes <id>` 或 `no <id>` 的请求体将作为判决通知发送给 Claude Code，且永远不会到达 Claude；其他任何内容都将作为通道事件转发给 Claude。

## 以插件形式打包

要使您的通道可安装和可共享，请将其封装为[插件](/en/plugins)并发布到[插件市场](/en/plugin-marketplaces)。用户使用 `/plugin install` 安装它，然后在每个会话中使用 `--channels plugin:<name>@<marketplace>` 启用它。

发布到您自己市场的通道仍需要 `--dangerously-load-development-channels` 才能运行，因为它不在[批准的白名单](/en/channels#supported-channels)上。默认白名单是 `claude-plugins-official` 中的通道插件，由 Anthropic 自行酌情策展。[应用内提交表单](/en/plugins#submit-your-plugin-to-the-community-marketplace)将插件添加到社区市场，该市场不在通道白名单上。

如果您正在与 Anthropic 合作伙伴联系人合作，请联系他们以协调官方市场列表。在团队和企业计划中，管理员可以改为将您的插件包含在组织自己的 [`allowedChannelPlugins`](/en/channels#restrict-which-channel-plugins-can-run) 列表中，该列表将替换默认的 Anthropic 白名单。

## 另请参阅

* [通道](/en/channels) 以安装和使用 Telegram、Discord、iMessage 或 fakechat 演示，并为团队或企业组织启用通道
* [工作通道实现](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins) 包含配对流程、回复工具和文件附件的完整服务器代码
* [MCP](/en/mcp) 通道服务器实现所基于的底层协议
* [插件](/en/plugins) 用于打包您的通道，以便用户可以通过 `/plugin install` 安装它