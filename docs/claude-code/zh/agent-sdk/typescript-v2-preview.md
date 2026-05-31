> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# TypeScript SDK V2 会话 API（已移除）

> 关于已移除的 V2 TypeScript Agent SDK 会话 API 的参考，包含用于多轮对话的基于会话的 send/stream 模式。

  V2会话API已不再支持。TypeScript Agent SDK 0.3.142移除了`unstable_v2_createSession`、`unstable_v2_resumeSession`、`unstable_v2_prompt`以及`SDKSession`和`SDKSessionOptions`类型。

  迁移时请使用[`query()` API](/zh/agent-sdk/typescript)及其接受的[会话选项](/zh/agent-sdk/sessions)。对于多轮对话，可传递`AsyncIterable<SDKUserMessage>`；若需延续已保存的会话，则使用`options.resume`参数。若您仍在使用Agent SDK 0.2.x或更早版本维护代码，本页内容可作为参考依据。

V2 是一个实验性的会话 API，它移除了对异步生成器和 yield 协调的需求。该版本不再跨轮次管理生成器状态，而是将每一轮都作为一个独立的 `send()`/`stream()` 循环。其 API 表面缩减为三个概念：

* `createSession()` / `resumeSession()`：开始或继续一次对话
* `session.send()`：发送一条消息
* `session.stream()`：获取响应

## 安装

Agent SDK 0.2.x 是包含 V2 接口的最后一个版本。包版本从 0.2.x 直接跳到了 0.3.142，因此上文提到的移除版本和下方的安装固定版本描述的是同一个边界。要安装最后一个兼容 V2 的版本，请固定主次版本号：
```bash
npm install @anthropic-ai/claude-agent-sdk@0.2
```


  该 SDK 集成了您平台专属的本地 Claude Code 二进制文件作为可选依赖项，因此您无需单独安装 Claude Code。

## 快速开始

### 单次提示

对于不需要维持会话的简单单轮查询，请使用 `unstable_v2_prompt()`。此示例发送一个数学问题并记录答案：
```typescript
import { unstable_v2_prompt } from "@anthropic-ai/claude-agent-sdk";

const result = await unstable_v2_prompt("What is 2 + 2?", {
  model: "claude-opus-4-7"
});
if (result.subtype === "success") {
  console.log(result.result);
}
```
<details>
  <summary>查看V1中的相同操作</summary>
</details>
  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const q = query({
    prompt: "What is 2 + 2?",
    options: { model: "claude-opus-4-7" }
  });

  for await (const msg of q) {
    if (msg.type === "result" && msg.subtype === "success") {
      console.log(msg.result);
    }
  }
  ```
### 基础会话

对于超出单次提示词的交互，请创建会话。V2 版本将发送和流式传输分为独立步骤：

* `send()` 用于发送您的消息
* `stream()` 用于流式传回响应

这种显式分离使得在轮次之间添加逻辑（例如在发送后续消息前处理响应）变得更加容易。

以下示例创建一个会话，向 Claude 发送 "Hello!" 并打印文本响应。它使用 [`await using`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management)（TypeScript 5.2+）以在代码块退出时自动关闭会话。您也可以手动调用 `session.close()`。
```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-7"
});

await session.send("Hello!");
for await (const msg of session.stream()) {
  // Filter for assistant messages to get human-readable output
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}
```
<details>
  <summary>查看V1中的相同操作</summary>

  在V1中，输入和输出都通过单个异步生成器。对于基础提示词，这看起来类似，但添加多轮逻辑需要重构以使用输入生成器。
</details>
  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const q = query({
    prompt: "Hello!",
    options: { model: "claude-opus-4-7" }
  });

  for await (const msg of q) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log(text);
    }
  }
  ```
</details>

### 多轮对话

会话能在多轮交流中保持上下文。要继续对话，只需在同一会话对象上再次调用 `send()`。Claude 会记得之前的对话内容。

这个示例先提出一个数学问题，接着提出一个引用先前答案的追问：
```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-7"
});

// Turn 1
await session.send("What is 5 + 3?");
for await (const msg of session.stream()) {
  // Filter for assistant messages to get human-readable output
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}

// Turn 2
await session.send("Multiply that by 2");
for await (const msg of session.stream()) {
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}
```
<details>
  <summary>查看V1中的相同操作</summary>
</details>
  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Must create an async iterable to feed messages
  async function* createInputStream() {
    yield {
      type: "user",
      session_id: "",
      message: { role: "user", content: [{ type: "text", text: "What is 5 + 3?" }] },
      parent_tool_use_id: null
    };
    // Must coordinate when to yield next message
    yield {
      type: "user",
      session_id: "",
      message: { role: "user", content: [{ type: "text", text: "Multiply by 2" }] },
      parent_tool_use_id: null
    };
  }

  const q = query({
    prompt: createInputStream(),
    options: { model: "claude-opus-4-7" }
  });

  for await (const msg of q) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log(text);
    }
  }
  ```
</details>

### 会话恢复

如果您拥有之前交互的会话 ID，可以稍后恢复该会话。这对于长时间运行的工作流，或需要跨应用重启持久化对话的场景非常有用。

此示例演示了如何创建会话、存储其 ID、关闭会话，然后恢复对话：
```typescript
import {
  unstable_v2_createSession,
  unstable_v2_resumeSession,
  type SDKMessage
} from "@anthropic-ai/claude-agent-sdk";

// Helper to extract text from assistant messages
function getAssistantText(msg: SDKMessage): string | null {
  if (msg.type !== "assistant") return null;
  return msg.message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

// Create initial session and have a conversation
const session = unstable_v2_createSession({
  model: "claude-opus-4-7"
});

await session.send("Remember this number: 42");

// Get the session ID from any received message
let sessionId: string | undefined;
for await (const msg of session.stream()) {
  sessionId = msg.session_id;
  const text = getAssistantText(msg);
  if (text) console.log("Initial response:", text);
}

console.log("Session ID:", sessionId);
session.close();

// Later: resume the session using the stored ID
await using resumedSession = unstable_v2_resumeSession(sessionId!, {
  model: "claude-opus-4-7"
});

await resumedSession.send("What number did I ask you to remember?");
for await (const msg of resumedSession.stream()) {
  const text = getAssistantText(msg);
  if (text) console.log("Resumed response:", text);
}
```
<details>
  <summary>查看V1中的相同操作</summary>
</details>
  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Create initial session
  const initialQuery = query({
    prompt: "Remember this number: 42",
    options: { model: "claude-opus-4-7" }
  });

  // Get session ID from any message
  let sessionId: string | undefined;
  for await (const msg of initialQuery) {
    sessionId = msg.session_id;
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log("Initial response:", text);
    }
  }

  console.log("Session ID:", sessionId);

  // Later: resume the session
  const resumedQuery = query({
    prompt: "What number did I ask you to remember?",
    options: {
      model: "claude-opus-4-7",
      resume: sessionId
    }
  });

  for await (const msg of resumedQuery) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log("Resumed response:", text);
    }
  }
  ```
</details>

### 清理

会话可以手动关闭，也可以使用 [`await using`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) 自动关闭，这是 TypeScript 5.2+ 的一个用于自动资源清理的功能。如果您使用的是旧版本的 TypeScript 或遇到兼容性问题，请改用手动清理。

**自动清理（TypeScript 5.2+）：**
```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-7"
});
// Session closes automatically when the block exits
```
**手动清理：**
```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

const session = unstable_v2_createSession({
  model: "claude-opus-4-7"
});
// ... use the session ...
session.close();
```
## API 参考

### `unstable_v2_createSession()`

为多轮对话创建一个新的会话。
```typescript
function unstable_v2_createSession(options: {
  model: string;
  // Additional options supported
}): SDKSession;
```
### `unstable_v2_resumeSession()`

通过ID恢复现有会话。
```typescript
function unstable_v2_resumeSession(
  sessionId: string,
  options: {
    model: string;
    // Additional options supported
  }
): SDKSession;
```
### `unstable_v2_prompt()`

用于单轮查询的一次性便捷函数。
```typescript
function unstable_v2_prompt(
  prompt: string,
  options: {
    model: string;
    // Additional options supported
  }
): Promise<SDKResultMessage>;
```
### SDKSession 接口
```typescript
interface SDKSession {
  readonly sessionId: string;
  send(message: string | SDKUserMessage): Promise<void>;
  stream(): AsyncGenerator<SDKMessage, void>;
  close(): void;
}
```
## 功能可用性

V2 会话 API 并非支持所有 V1 功能。以下功能仍需使用 [V1 SDK](/en/agent-sdk/typescript)：

* 会话分叉（`forkSession` 选项）
* 部分高级流式输入模式

## 另请参阅

* [TypeScript SDK 参考 (V1)](/en/agent-sdk/typescript) - 完整的 V1 SDK 文档
* [SDK 概述](/en/agent-sdk/overview) - 通用 SDK 概念
* [GitHub 上的 V2 示例](https://github.com/anthropics/claude-agent-sdk-demos/tree/main/hello-world-v2) - 可运行的代码示例