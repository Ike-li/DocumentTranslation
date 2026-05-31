> ## 文档索引
> 访问 https://code.claude.com/docs/llms.txt 获取完整文档索引
> 使用此文件在进一步探索前发现所有可用页面。

# 跟踪成本和使用情况

> 了解如何跟踪 token 使用情况、估算成本以及通过 Claude Agent SDK 配置提示词缓存。

Claude Agent SDK 为每次与 Claude 的交互提供详细的 token 使用信息。本指南说明了如何正确跟踪使用情况并理解成本报告，尤其是在处理并行工具使用和多步骤对话时。

有关完整的 API 文档，请参阅 [TypeScript SDK 参考](/zh/agent-sdk/typescript) 和 [Python SDK 参考](/zh/agent-sdk/python)。

  `total_cost_usd` 和 `costUSD` 字段是客户端估算值，并非权威计费数据。SDK 在本地根据构建时绑定的价格表计算这些字段，因此在以下情况下它们可能与实际计费金额存在偏差：

  * 定价调整时
  * 已安装的 SDK 版本无法识别某个模型时
  * 存在客户端无法建模的计费规则时

  这些字段可用于开发洞察和预算估算。如需获取权威计费数据，请使用 [Usage and Cost API](https://platform.claude.com/docs/en/build-with-claude/usage-cost-api) 或 [Claude Console](https://platform.claude.com/usage) 中的用量页面。不得依据这些字段向终端用户计费或触发财务决策。

## 理解 token 使用情况

TypeScript 和 Python SDK 暴露相同的使用数据，但字段名称不同：

* **TypeScript** 在每个助手消息上提供逐步的 token 分解（`message.message.id`, `message.message.usage`），通过结果消息上的 `modelUsage` 提供按模型统计的成本，并在结果消息上提供累计总计。
* **Python** 在每个助手消息上提供逐步的 token 分解（`message.usage`, `message.message_id`），通过结果消息上的 `model_usage` 提供按模型统计的成本，并在结果消息上提供累计总计（`total_cost_usd` 和 `usage` 字典）。

两个 SDK 使用相同的底层成本模型并暴露相同粒度的数据。差异在于字段命名和逐步使用数据的嵌套位置。

成本追踪取决于理解 SDK 如何界定使用数据的范围：

* **`query()` 调用：** 对 SDK `query()` 函数的一次调用。一次调用可能涉及多个步骤（Claude 响应、使用工具、获取结果、再次响应）。每次调用在结束时都会生成一个 [`result`](/zh/agent-sdk/typescript#sdkresultmessage) 消息。
* **步骤：** 在 `query()` 调用内部的一个单一的请求/响应周期。每个步骤都会生成带有 token 使用信息的助手消息。
* **会话：** 一系列通过会话 ID（使用 `resume` 选项）关联的 `query()` 调用。会话中的每个 `query()` 调用独立报告其自身的成本。

下图展示了一次 `query()` 调用产生的消息流，在每个步骤报告 token 使用情况，并在最后给出累计估算：

<img src="https://mintcdn.com/claude-code/Dujg43sxTkuhSELI/images/agent-sdk/message-usage-flow.svg?fit=max&auto=format&n=Dujg43sxTkuhSELI&q=85&s=c542f51ff58547ef9c0e57b16d03f33c" alt="展示一次查询产生两步消息的图表。步骤1有四条共享相同ID和使用量的助手消息（只计算一次），步骤2有一条使用新ID的助手消息，最终结果消息显示估算的总成本美元。" width="760" height="520" data-path="images/agent-sdk/message-usage-flow.svg" />


    当 Claude 响应时，会发送一条或多条助手消息。在 TypeScript 中，每条助手消息都包含一个嵌套的 `BetaMessage`（通过 `message.message` 访问），其中包含 `id` 和一个 [`usage`](https://platform.claude.com/docs/en/api/messages) 对象，该对象带有 token 计数（`input_tokens`、`output_tokens`）。在 Python 中，`AssistantMessage` 数据类通过 `message.usage` 和 `message.message_id` 直接暴露相同的数据。当 Claude 在单次交互中使用多个工具时，该交互中的所有消息共享相同的 ID，因此请通过 ID 进行去重以避免重复计数。



    当 `query()` 调用完成时，SDK 会发出包含 `total_cost_usd` 和累计 `usage` 的结果消息。该消息在 TypeScript（[`SDKResultMessage`](/zh/agent-sdk/typescript#sdkresultmessage)）和 Python（[`ResultMessage`](/zh/agent-sdk/python#resultmessage)）中均可用。如果您执行多次 `query()` 调用（例如在多轮会话中），每次结果仅反映该次调用的成本。若您只需要预估总成本，可以忽略分步使用量，直接读取此单一数值。


## 获取查询的总成本

结果消息（[TypeScript](/zh/agent-sdk/typescript#sdkresultmessage), [Python](/zh/agent-sdk/python#resultmessage)）标志着 `query()` 调用的代理循环结束。它包含 `total_cost_usd`，即该调用中所有步骤的累计预估成本。此功能适用于成功和错误的结果。如果你使用会话进行多次 `query()` 调用，每个结果仅反映该单次调用的成本。

以下示例遍历 `query()` 调用产生的消息流，并在 `result` 消息到达时打印总成本：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({ prompt: "Summarize this project" })) {
    if (message.type === "result") {
      console.log(`Total cost: $${message.total_cost_usd}`);
    }
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ResultMessage
  import asyncio


  async def main():
      async for message in query(prompt="Summarize this project"):
          if isinstance(message, ResultMessage):
              print(f"Total cost: ${message.total_cost_usd or 0}")


  asyncio.run(main())
  ```

## 跟踪每一步和每个模型的使用情况

本节示例中使用 TypeScript 字段名称。在 Python 中，对应的字段为 [`AssistantMessage.usage`](/zh/agent-sdk/python#assistantmessage) 和 `AssistantMessage.message_id` 用于跟踪每一步的使用情况，[`ResultMessage.model_usage`](/zh/agent-sdk/python#resultmessage) 用于按模型分组统计。

### 跟踪每一步的使用情况

每个助手消息包含一个嵌套的 `BetaMessage`（通过 `message.message` 访问），其中包含一个 `id` 和带有 token 计数的 `usage` 对象。当 Claude 并行使用工具时，多个消息会共享相同的 `id` 和完全相同的使用数据。请跟踪已计数的 ID 并跳过重复项，以避免统计膨胀。

  并行工具调用会产生多条助手消息，这些消息嵌套的 `BetaMessage` 共享相同的 `id` 和完全一致的用量数据。务必根据 ID 进行去重，才能获得准确的逐步 token 计数。

以下示例跨所有步骤累计输入和输出的 token，对每个唯一消息 ID 仅计数一次：
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const seenIds = new Set<string>();
let totalInputTokens = 0;
let totalOutputTokens = 0;

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type === "assistant") {
    const msgId = message.message.id;

    // Parallel tool calls share the same ID, only count once
    if (!seenIds.has(msgId)) {
      seenIds.add(msgId);
      totalInputTokens += message.message.usage.input_tokens;
      totalOutputTokens += message.message.usage.output_tokens;
    }
  }
}

console.log(`Steps: ${seenIds.size}`);
console.log(`Input tokens: ${totalInputTokens}`);
console.log(`Output tokens: ${totalOutputTokens}`);
```
### 按模型分析使用情况

结果消息包含 [`modelUsage`](/zh/agent-sdk/typescript#modelusage)，这是一个映射，将模型名称映射到每个模型的 token 数量和成本。当您运行多个模型（例如，子代理使用 Haiku，主代理使用 Opus）并希望查看 token 分配情况时，此功能非常有用。

以下示例执行查询并打印所使用的每个模型的成本和 token 细分情况：
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type !== "result") continue;

  for (const [modelName, usage] of Object.entries(message.modelUsage)) {
    console.log(`${modelName}: $${usage.costUSD.toFixed(4)}`);
    console.log(`  Input tokens: ${usage.inputTokens}`);
    console.log(`  Output tokens: ${usage.outputTokens}`);
    console.log(`  Cache read: ${usage.cacheReadInputTokens}`);
    console.log(`  Cache creation: ${usage.cacheCreationInputTokens}`);
  }
}
```
## 跨多次调用累计成本

每次 `query()` 调用都会返回其各自的 `total_cost_usd`。SDK 不提供会话级别的总数，因此如果您的应用程序进行多次 `query()` 调用（例如，在多轮会话中或跨不同用户），您需要自行累计这些总额。

以下示例顺序运行两次 `query()` 调用，将每次调用的 `total_cost_usd` 累加到累计总和中，并打印每次调用的成本和合并后的总成本：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Track cumulative cost across multiple query() calls
  let totalSpend = 0;

  const prompts = [
    "Read the files in src/ and summarize the architecture",
    "List all exported functions in src/auth.ts"
  ];

  for (const prompt of prompts) {
    for await (const message of query({ prompt })) {
      if (message.type === "result") {
        totalSpend += message.total_cost_usd;
        console.log(`This call: $${message.total_cost_usd}`);
      }
    }
  }

  console.log(`Total spend: $${totalSpend.toFixed(4)}`);
  ```

  ```python Python
  from claude_agent_sdk import query, ResultMessage
  import asyncio


  async def main():
      # Track cumulative cost across multiple query() calls
      total_spend = 0.0

      prompts = [
          "Read the files in src/ and summarize the architecture",
          "List all exported functions in src/auth.ts",
      ]

      for prompt in prompts:
          async for message in query(prompt=prompt):
              if isinstance(message, ResultMessage):
                  cost = message.total_cost_usd or 0
                  total_spend += cost
                  print(f"This call: ${cost}")

      print(f"Total spend: ${total_spend:.4f}")


  asyncio.run(main())
  ```

## 处理错误、缓存和 token 差异

为确保成本跟踪的准确性，需考虑失败的对话、缓存 token 定价以及偶尔出现的报告不一致情况。

### 解决输出 token 差异

在极少数情况下，你可能会观察到相同 ID 的消息具有不同的 `output_tokens` 值。当这种情况发生时：

1.  **使用最高值：** 一组消息中的最后一条通常包含准确的总数。
2.  **优先采用结果消息：** 结果消息中的 `total_cost_usd` 反映了 SDK 在所有步骤中累积的估计值，因此比你自己逐步求和更可靠。这仍然是一个估计值，可能与你的实际账单有所不同。
3.  **报告不一致问题：** 在 [Claude Code GitHub 仓库](https://github.com/anthropics/claude-code/issues) 提交问题。

### 跟踪失败对话的成本

成功和错误的结果消息都包含 `usage` 和 `total_cost_usd`。如果对话中途失败，你仍然在失败点之前消耗了 token。始终从结果消息中读取成本数据，无论其 `subtype` 如何。

### 跟踪缓存 token

Agent SDK 会自动使用[提示词缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)来减少重复内容的成本。你无需自行配置缓存。usage 对象包含两个用于缓存跟踪的附加字段：

*   `cache_creation_input_tokens`：用于创建新缓存条目的 token（费率高于标准输入 token）。
*   `cache_read_input_tokens`：从现有缓存条目读取的 token（费率较低）。

将这些字段与 `input_tokens` 分开跟踪，以了解缓存节省的成本。在 TypeScript 中，这些字段在 [`Usage`](/zh/agent-sdk/typescript#usage) 对象上定义了类型。在 Python 中，它们作为键出现在 [`ResultMessage.usage`](/zh/agent-sdk/python#resultmessage) 字典中（例如，`message.usage.get("cache_read_input_tokens", 0)`）。

### 将提示词缓存 TTL 延长至一小时

当你使用 API 密钥进行身份验证，或在 Amazon Bedrock、Google Cloud Vertex AI 或 Microsoft Foundry 上运行时，SDK 缓存写入的条目默认使用 5 分钟的 TTL。如果你的工作负载针对相同的系统提示词和上下文运行许多短会话，且会话间隔超过 5 分钟，则缓存会在会话间过期，每个新会话都需要支付全额输入价格。

若要请求缓存写入的 TTL 为 1 小时，请设置 [`ENABLE_PROMPT_CACHING_1H`](/zh/env-vars) 环境变量。你可以在 shell 或容器环境中导出它，或者通过 `options.env` 传递。

以下示例为在 Bedrock 上运行的代理启用 1 小时 TTL：

  ```python Python
  options = ClaudeAgentOptions(
      env={
          "CLAUDE_CODE_USE_BEDROCK": "1",
          "ENABLE_PROMPT_CACHING_1H": "1",
      },
  )
  ```

  ```typescript TypeScript
  const options = {
    env: {
      ...process.env,
      CLAUDE_CODE_USE_BEDROCK: "1",
      ENABLE_PROMPT_CACHING_1H: "1",
    },
  };
  ```

带有1小时TTL的缓存写入比5分钟写入的计费更高，因此启用此选项会以更高的写入成本换取更多的缓存读取。详情请参阅[提示词缓存定价](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)。Claude订阅用户已自动获得1小时TTL，无需设置此变量。

## 相关文档

* [TypeScript SDK参考文档](/zh/agent-sdk/typescript) - 完整的API文档
* [SDK概述](/zh/agent-sdk/overview) - SDK入门指南
* [SDK权限](/zh/agent-sdk/permissions) - 管理工具权限