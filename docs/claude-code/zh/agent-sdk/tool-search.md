> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行进一步探索。

# 通过工具搜索扩展至多工具场景

> 通过按需发现和加载所需工具，使您的代理扩展至支持数千个工具。

工具搜索使您的代理能够通过动态发现和按需加载来处理数百甚至数千个工具。代理不再将所有工具定义预先加载到上下文窗口，而是搜索您的工具目录并仅加载所需的工具。

随着工具库规模的扩大，此方法解决了两个挑战：

* **上下文效率：** 工具定义可能占据上下文窗口的大部分空间（50个工具可能消耗10-20K个token），导致实际工作空间减少。
* **工具选择准确性：** 当同时加载超过30-50个工具时，工具选择的准确性会下降。

工具搜索默认启用。本页介绍[其工作原理](#工具搜索的工作原理)、如何[配置它](#配置工具搜索)以及如何[优化工具发现](#优化工具发现)。

## 工具搜索的工作原理

当工具搜索激活时，工具定义不会被放入上下文窗口。代理会收到可用工具的摘要，并在任务需要尚未加载的能力时搜索相关工具。3-5个最相关的工具会被加载到上下文中，并在后续轮次中保持可用。如果对话足够长，以至于SDK压缩了先前的消息以释放空间，之前发现的工具可能会被移除，并在需要时重新搜索。

工具搜索在Claude首次发现工具时（搜索步骤）会增加一次额外往返，但对于大型工具集，这可以通过每轮更少的上下文开销来抵消。对于少于约10个工具的情况，预先加载所有工具通常更快。

关于底层API机制的详细信息，请参阅[API中的工具搜索](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)。

  工具搜索需要 Claude Sonnet 4 或更高版本，或 Claude Opus 4 或更高版本。Haiku models 不支持工具搜索。

## 配置工具搜索

工具搜索默认处于开启状态。在 Vertex AI 上默认禁用，但支持 Claude Sonnet 4.5 及更高版本以及 Claude Opus 4.5 及更高版本。当 `ANTHROPIC_BASE_URL` 指向非官方主机时也会禁用，因为大多数代理不会转发 `tool_reference` 块。您可以通过 `ENABLE_TOOL_SEARCH` 环境变量覆盖任一默认设置：

| 值       | 行为                                                                                                                                                                                                                               |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (未设置) | 工具搜索开启。工具定义被延迟并按需发现。在 Vertex AI 或非官方 `ANTHROPIC_BASE_URL` 上回退到预先加载。                                                                                                                               |
| `true`   | 工具搜索始终开启。SDK 甚至在 Vertex AI 和通过代理时也会发送 beta 头。请求在早于 Sonnet 4.5 或 Opus 4.5 的 Vertex AI 模型上，或不支持 `tool_reference` 块的代理上会失败。                                                              |
| `auto`   | 检查所有工具定义的组合 token 计数是否超过模型的上下文窗口。如果超过 10%，工具搜索将激活。如果低于 10%，则正常将所有工具加载到上下文中。                                                                                              |
| `auto:N` | 与 `auto` 相同，但使用自定义百分比。`auto:5` 在工具定义超过上下文窗口的 5% 时激活。较低的值会更快激活。                                                                                                                              |
| `false`  | 工具搜索关闭。所有工具定义在每一轮对话中都会加载到上下文中。                                                                                                                                                                       |

工具搜索适用于所有已注册的工具，无论它们来自远程 MCP 服务器还是[自定义 SDK MCP 服务器](/en/agent-sdk/custom-tools)。使用 `auto` 时，阈值基于所有服务器上所有工具定义的组合大小。

在 `query()` 的 `env` 选项中设置该值。以下示例连接到一个暴露大量工具的远程 MCP 服务器，通过通配符预先批准所有工具，并使用 `auto:5`，以便在工具定义超过上下文窗口的 5% 时激活工具搜索：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Find and run the appropriate database query",
    options: {
      mcpServers: {
        "enterprise-tools": {
          // Connect to a remote MCP server
          type: "http",
          url: "https://tools.example.com/mcp"
        }
      },
      allowedTools: ["mcp__enterprise-tools__*"], // Wildcard pre-approves all tools from this server
      env: {
        ENABLE_TOOL_SEARCH: "auto:5" // Activate tool search when tools exceed 5% of context
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={
              "enterprise-tools": {
                  "type": "http",
                  "url": "https://tools.example.com/mcp",
              }
          },
          allowed_tools=[
              "mcp__enterprise-tools__*"
          ],  # Wildcard pre-approves all tools from this server
          env={
              "ENABLE_TOOL_SEARCH": "auto:5"  # Activate tool search when tools exceed 5% of context
          },
      )

      async for message in query(
          prompt="Find and run the appropriate database query",
          options=options,
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

将 `ENABLE_TOOL_SEARCH` 设置为 `"false"` 会禁用工具搜索，并在每一轮对话中将所有工具定义加载到上下文中。这将消除搜索往返时间，当工具集较小（少于约 10 个工具）且定义能轻松适配上文窗口时，可能提升速度。

## 优化工具发现

搜索机制通过匹配查询与工具名称及描述来运作。像 `search_slack_messages` 这样的名称比 `query_slack` 能匹配更广泛的请求。包含特定关键词的描述（例如“按关键词、频道或日期范围搜索 Slack 消息”）比通用描述（例如“查询 Slack”）能匹配更多查询。

您还可以添加一个系统提示词部分，列出可用的工具类别。这能让代理了解可以搜索哪些类型的工具：
```text
You can search for tools to interact with Slack, GitHub, and Jira.
```
## 限制条件

* **最大工具数量：** 您的目录中最多可有 10,000 个工具
* **搜索结果：** 每次搜索返回 3-5 个最相关的工具
* **模型支持：** Claude Sonnet 4 及更高版本、Claude Opus 4 及更高版本（不支持 Haiku）

## 相关文档

* [API 中的工具搜索](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)：工具搜索的完整 API 文档，包括自定义实现
* [连接 MCP 服务器](/en/agent-sdk/mcp)：通过 MCP 服务器连接外部工具
* [自定义工具](/en/agent-sdk/custom-tools)：使用 SDK MCP 服务器构建您自己的工具
* [TypeScript SDK 参考文档](/en/agent-sdk/typescript)：完整的 API 参考
* [Python SDK 参考文档](/en/agent-sdk/python)：完整的 API 参考