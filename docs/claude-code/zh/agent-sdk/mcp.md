> ## 文档索引
> 通过此链接获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件发现所有可用页面。

# 通过 MCP 连接外部工具

> 配置 MCP 服务器以使用外部工具扩展你的代理。涵盖传输类型、大型工具集的工具搜索、身份验证及错误处理。

[模型上下文协议 (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) 是一个用于将 AI 代理连接到外部工具和数据源的开放标准。借助 MCP，你的代理可以查询数据库、集成 Slack 和 GitHub 等 API，并连接其他服务，而无需编写自定义工具实现。

MCP 服务器可以作为本地进程运行、通过 HTTP 连接，或直接在你的 SDK 应用程序内执行。

  本页涵盖 Agent SDK 的 MCP 配置。如需将 MCP 服务器添加至 Claude Code 命令行工具以便在每个项目中加载，请参阅 [MCP 安装作用域](/zh/mcp#mcp-installation-scopes)。

## 快速入门

此示例使用 [HTTP 传输](#httpsse-服务器) 连接到 [Claude Code 文档](https://code.claude.com/docs) MCP 服务器，并使用 [`allowedTools`](#允许使用-mcp-工具) 配合通配符来允许服务器上的所有工具。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Use the docs MCP server to explain what hooks are in Claude Code",
    options: {
      mcpServers: {
        "claude-code-docs": {
          type: "http",
          url: "https://code.claude.com/docs/mcp"
        }
      },
      allowedTools: ["mcp__claude-code-docs__*"]
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
              "claude-code-docs": {
                  "type": "http",
                  "url": "https://code.claude.com/docs/mcp",
              }
          },
          allowed_tools=["mcp__claude-code-docs__*"],
      )

      async for message in query(
          prompt="Use the docs MCP server to explain what hooks are in Claude Code",
          options=options,
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

代理连接至文档服务器，搜索钩子相关信息并返回结果。

## 添加 MCP 服务器

您可以在调用 `query()` 时通过代码配置 MCP 服务器，或通过从[配置文件加载](#从配置文件加载)的 `.mcp.json` 文件进行配置。

### 通过代码配置

在 `mcpServers` 选项中直接传入 MCP 服务器：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "List files in my project",
    options: {
      mcpServers: {
        filesystem: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
        }
      },
      allowedTools: ["mcp__filesystem__*"]
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
              "filesystem": {
                  "command": "npx",
                  "args": [
                      "-y",
                      "@modelcontextprotocol/server-filesystem",
                      "/Users/me/projects",
                  ],
              }
          },
          allowed_tools=["mcp__filesystem__*"],
      )

      async for message in query(prompt="List files in my project", options=options):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

### 从配置文件加载

在项目根目录创建一个 `.mcp.json` 文件。当 `project` 设置源启用时，系统会读取此文件，这对于默认的 `query()` 选项是启用的。如果你明确设置了 `settingSources`，请包含 `"project"` 以便加载此文件：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    }
  }
}
```
## 允许使用 MCP 工具

MCP 工具在 Claude 可以使用之前需要明确授权。未经许可，Claude 会看到工具可用，但无法调用它们。

### 工具命名约定

MCP 工具遵循 `mcp__<server-name>__<tool-name>` 的命名模式。例如，一个名为 `"github"` 的 GitHub 服务器上有一个 `list_issues` 工具，它将显示为 `mcp__github__list_issues`。

### 使用 allowedTools 进行自动批准

使用 `allowedTools` 可以自动批准特定的 MCP 工具，这样 Claude 就可以在无需权限提示的情况下使用它们：
```typescript hidelines={1,-1}
const _ = {
  options: {
    mcpServers: {
      // your servers
    },
    allowedTools: [
      "mcp__github__*", // All tools from the github server
      "mcp__db__query", // Only the query tool from db server
      "mcp__slack__send_message" // Only send_message from slack server
    ]
  }
};
```
通配符（`*`）允许您无需逐一列出即可启用服务器上的所有工具。

  **推荐使用 `allowedTools` 而非权限模式来管理 MCP 访问。** `permissionMode: "acceptEdits"` 不会自动批准 MCP 工具（仅自动批准文件编辑和文件系统 Bash 命令）。`permissionMode: "bypassPermissions"` 虽然会自动批准 MCP 工具，但同时也会禁用所有其他安全提示，其作用范围超出了必要。在 `allowedTools` 中使用通配符可精确授权您所需的 MCP 服务器，而不影响其他权限。完整的比较请参阅 [权限模式](/zh/agent-sdk/permissions#permission-modes)。

### 发现可用工具

要了解 MCP 服务器提供了哪些工具，请查阅服务器文档，或者连接到服务器并检查 `system` 初始化消息。
```typescript
for await (const message of query({ prompt: "...", options })) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Available MCP tools:", message.mcp_servers);
  }
}
```
## 传输类型

MCP 服务器通过不同的传输协议与你的代理进行通信。请查阅服务器文档以了解其支持的传输类型：

* 如果文档提供了**要运行的命令**（例如 `npx @modelcontextprotocol/server-github`），请使用 stdio
* 如果文档提供了 **URL**，请使用 HTTP 或 SSE
* 如果你正在代码中构建自己的工具，请使用 SDK MCP 服务器

### stdio 服务器

通过 stdin/stdout 进行通信的本地进程。适用于在同一台机器上运行的 MCP 服务器：



      ```typescript TypeScript hidelines={1,-1}
      const _ = {
        options: {
          mcpServers: {
            github: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-github"],
              env: {
                GITHUB_TOKEN: process.env.GITHUB_TOKEN
              }
            }
          },
          allowedTools: ["mcp__github__list_issues", "mcp__github__search_issues"]
        }
      };
      ```

      ```python Python
      options = ClaudeAgentOptions(
          mcp_servers={
              "github": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-github"],
                  "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
              }
          },
          allowed_tools=["mcp__github__list_issues", "mcp__github__search_issues"],
      )
      ```




    ```json
    {
      "mcpServers": {
        "github": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-github"],
          "env": {
            "GITHUB_TOKEN": "${GITHUB_TOKEN}"
          }
        }
      }
    }
    ```


### HTTP/SSE 服务器

针对云托管的 MCP 服务器和远程 API，可使用 HTTP 或 SSE：



      ```typescript TypeScript hidelines={1,-1}
      const _ = {
        options: {
          mcpServers: {
            "remote-api": {
              type: "sse",
              url: "https://api.example.com/mcp/sse",
              headers: {
                Authorization: `Bearer ${process.env.API_TOKEN}`
              }
            }
          },
          allowedTools: ["mcp__remote-api__*"]
        }
      };
      ```

      ```python Python
      options = ClaudeAgentOptions(
          mcp_servers={
              "remote-api": {
                  "type": "sse",
                  "url": "https://api.example.com/mcp/sse",
                  "headers": {"Authorization": f"Bearer {os.environ['API_TOKEN']}"},
              }
          },
          allowed_tools=["mcp__remote-api__*"],
      )
      ```




    ```json
    {
      "mcpServers": {
        "remote-api": {
          "type": "sse",
          "url": "https://api.example.com/mcp/sse",
          "headers": {
            "Authorization": "Bearer ${API_TOKEN}"
          }
        }
      }
    }
    ```


对于流式HTTP传输，请改用 `"type": "http"`。在 `.mcp.json` 和其他JSON配置文件中，`"streamable-http"` 可作为 `"http"` 的别名。编程方式使用的 `mcpServers` 选项仅接受 `"http"`。

### SDK MCP服务器

在应用程序代码中直接定义自定义工具，而无需运行单独的服务器进程。实现细节请参阅[自定义工具指南](/zh/agent-sdk/custom-tools)。

## MCP工具搜索

当配置了大量MCP工具时，工具定义可能会占用上下文窗口的很大一部分。工具搜索通过暂时不将工具定义加载到上下文中，并仅加载每轮对话中Claude所需的工具来解决此问题。

工具搜索默认启用。配置选项和详细信息请参阅[工具搜索](/zh/agent-sdk/tool-search)。

有关更多详情，包括最佳实践以及如何将工具搜索与自定义SDK工具结合使用，请参阅[工具搜索指南](/zh/agent-sdk/tool-search)。

## 认证

大多数MCP服务器需要认证才能访问外部服务。通过服务器配置中的环境变量传递凭据。

### 通过环境变量传递凭据

使用 `env` 字段将API密钥、token及其他凭据传递给MCP服务器：



      ```typescript TypeScript hidelines={1,-1}
      const _ = {
        options: {
          mcpServers: {
            github: {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-github"],
              env: {
                GITHUB_TOKEN: process.env.GITHUB_TOKEN
              }
            }
          },
          allowedTools: ["mcp__github__list_issues"]
        }
      };
      ```

      ```python Python
      options = ClaudeAgentOptions(
          mcp_servers={
              "github": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-github"],
                  "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
              }
          },
          allowed_tools=["mcp__github__list_issues"],
      )
      ```




    ```json
    {
      "mcpServers": {
        "github": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-github"],
          "env": {
            "GITHUB_TOKEN": "${GITHUB_TOKEN}"
          }
        }
      }
    }
    ```
    `${GITHUB_TOKEN}` 语法在运行时展开环境变量。


有关包含调试日志的完整工作示例，请参阅[列出仓库的问题](#列出仓库的-issues)。

### 远程服务器的 HTTP 头

对于 HTTP 和 SSE 服务器，可在服务器配置中直接传递身份验证头：



      ```typescript TypeScript hidelines={1,-1}
      const _ = {
        options: {
          mcpServers: {
            "secure-api": {
              type: "http",
              url: "https://api.example.com/mcp",
              headers: {
                Authorization: `Bearer ${process.env.API_TOKEN}`
              }
            }
          },
          allowedTools: ["mcp__secure-api__*"]
        }
      };
      ```

      ```python Python
      options = ClaudeAgentOptions(
          mcp_servers={
              "secure-api": {
                  "type": "http",
                  "url": "https://api.example.com/mcp",
                  "headers": {"Authorization": f"Bearer {os.environ['API_TOKEN']}"},
              }
          },
          allowed_tools=["mcp__secure-api__*"],
      )
      ```




    ```json
    {
      "mcpServers": {
        "secure-api": {
          "type": "http",
          "url": "https://api.example.com/mcp",
          "headers": {
            "Authorization": "Bearer ${API_TOKEN}"
          }
        }
      }
    }
    ```
    `${API_TOKEN}` 语法在运行时展开环境变量。


### OAuth2 认证

[MCP 规范支持 OAuth 2.1](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) 用于授权。该 SDK 不会自动处理 OAuth 流程，但您可以在应用程序中完成 OAuth 流程后，通过请求头传递访问令牌：

  ```typescript TypeScript
  // After completing OAuth flow in your app
  const accessToken = await getAccessTokenFromOAuthFlow();

  const options = {
    mcpServers: {
      "oauth-api": {
        type: "http",
        url: "https://api.example.com/mcp",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    },
    allowedTools: ["mcp__oauth-api__*"]
  };
  ```

  ```python Python
  # After completing OAuth flow in your app
  access_token = await get_access_token_from_oauth_flow()

  options = ClaudeAgentOptions(
      mcp_servers={
          "oauth-api": {
              "type": "http",
              "url": "https://api.example.com/mcp",
              "headers": {"Authorization": f"Bearer {access_token}"},
          }
      },
      allowed_tools=["mcp__oauth-api__*"],
  )
  ```

## 示例

### 列出仓库的 issues

此示例连接到 [GitHub MCP 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/github) 以列出最近的 issues。该示例包含调试日志，用于验证 MCP 连接和工具调用。

运行前，请创建一个具有 `repo` 作用域的 [GitHub 个人访问令牌](https://github.com/settings/tokens) 并将其设置为环境变量：
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```


  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "List the 3 most recent issues in anthropics/claude-code",
    options: {
      mcpServers: {
        github: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          env: {
            GITHUB_TOKEN: process.env.GITHUB_TOKEN
          }
        }
      },
      allowedTools: ["mcp__github__list_issues"]
    }
  })) {
    // Verify MCP server connected successfully
    if (message.type === "system" && message.subtype === "init") {
      console.log("MCP servers:", message.mcp_servers);
    }

    // Log when Claude calls an MCP tool
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "tool_use" && block.name.startsWith("mcp__")) {
          console.log("MCP tool called:", block.name);
        }
      }
    }

    // Print the final result
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  import os
  from claude_agent_sdk import (
      query,
      ClaudeAgentOptions,
      ResultMessage,
      SystemMessage,
      AssistantMessage,
  )


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={
              "github": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-github"],
                  "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
              }
          },
          allowed_tools=["mcp__github__list_issues"],
      )

      async for message in query(
          prompt="List the 3 most recent issues in anthropics/claude-code",
          options=options,
      ):
          # Verify MCP server connected successfully
          if isinstance(message, SystemMessage) and message.subtype == "init":
              print("MCP servers:", message.data.get("mcp_servers"))

          # Log when Claude calls an MCP tool
          if isinstance(message, AssistantMessage):
              for block in message.content:
                  if hasattr(block, "name") and block.name.startswith("mcp__"):
                      print("MCP tool called:", block.name)

          # Print the final result
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

### 查询数据库

本示例使用 [Postgres MCP 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) 来查询数据库。连接字符串作为参数传递给服务器。代理会自动发现数据库模式、编写 SQL 查询并返回结果：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Connection string from environment variable
  const connectionString = process.env.DATABASE_URL;

  for await (const message of query({
    // Natural language query - Claude writes the SQL
    prompt: "How many users signed up last week? Break it down by day.",
    options: {
      mcpServers: {
        postgres: {
          command: "npx",
          // Pass connection string as argument to the server
          args: ["-y", "@modelcontextprotocol/server-postgres", connectionString]
        }
      },
      // Allow only read queries, not writes
      allowedTools: ["mcp__postgres__query"]
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

  ```python Python
  import asyncio
  import os
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      # Connection string from environment variable
      connection_string = os.environ["DATABASE_URL"]

      options = ClaudeAgentOptions(
          mcp_servers={
              "postgres": {
                  "command": "npx",
                  # Pass connection string as argument to the server
                  "args": [
                      "-y",
                      "@modelcontextprotocol/server-postgres",
                      connection_string,
                  ],
              }
          },
          # Allow only read queries, not writes
          allowed_tools=["mcp__postgres__query"],
      )

      # Natural language query - Claude writes the SQL
      async for message in query(
          prompt="How many users signed up last week? Break it down by day.",
          options=options,
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

## 错误处理

MCP服务器连接失败可能有多种原因：服务器进程可能未安装、凭证可能无效，或远程服务器可能无法访问。

SDK会在每次查询开始时发出一条类型为`init`的`system`消息。该消息包含每个MCP服务器的连接状态。请检查`status`字段，以便在代理开始工作前检测连接故障：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Process data",
    options: {
      mcpServers: {
        "data-processor": dataServer
      }
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      const failedServers = message.mcp_servers.filter((s) => s.status !== "connected");

      if (failedServers.length > 0) {
        console.warn("Failed to connect:", failedServers);
      }
    }

    if (message.type === "result" && message.subtype === "error_during_execution") {
      console.error("Execution failed");
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage, ResultMessage


  async def main():
      options = ClaudeAgentOptions(mcp_servers={"data-processor": data_server})

      async for message in query(prompt="Process data", options=options):
          if isinstance(message, SystemMessage) and message.subtype == "init":
              failed_servers = [
                  s
                  for s in message.data.get("mcp_servers", [])
                  if s.get("status") != "connected"
              ]

              if failed_servers:
                  print(f"Failed to connect: {failed_servers}")

          if (
              isinstance(message, ResultMessage)
              and message.subtype == "error_during_execution"
          ):
              print("Execution failed")


  asyncio.run(main())
  ```

## 故障排除

### 服务器显示“失败”状态

检查 `init` 消息，查看哪些服务器连接失败：
```typescript
if (message.type === "system" && message.subtype === "init") {
  for (const server of message.mcp_servers) {
    if (server.status === "failed") {
      console.error(`Server ${server.name} failed to connect`);
    }
  }
}
```
常见原因：

* **缺少环境变量**：确保已设置所需的 token 和凭据。对于 stdio 服务器，请检查 `env` 字段是否与服务器预期匹配。
* **服务器未安装**：对于 `npx` 命令，请验证包是否存在且 Node.js 已在您的 PATH 中。
* **无效的连接字符串**：对于数据库服务器，请验证连接字符串的格式以及数据库是否可访问。
* **网络问题**：对于远程 HTTP/SSE 服务器，请检查 URL 是否可达以及防火墙是否允许连接。

### 工具未被调用

如果 Claude 看到工具但未使用它们，请检查您是否已通过 `allowedTools` 授予权限：
```typescript hidelines={1,-1}
const _ = {
  options: {
    mcpServers: {
      // your servers
    },
    allowedTools: ["mcp__servername__*"] // Auto-approve calls from this server
  }
};
```
### 连接超时

MCP SDK 对服务器连接的默认超时时间为 60 秒。如果您的服务器启动时间更长，连接将会失败。对于需要更多启动时间的服务器，请考虑：

* 如果可用，使用更轻量级的服务器
* 在启动您的代理之前预热服务器
* 检查服务器日志以了解初始化缓慢的原因

## 相关资源

* **[自定义工具指南](/zh/agent-sdk/custom-tools)**: 构建您自己的 MCP 服务器，该服务器可与您的 SDK 应用程序进程内运行
* **[权限](/zh/agent-sdk/permissions)**: 使用 `allowedTools` 和 `disallowedTools` 控制您的代理可以使用哪些 MCP 工具
* **[TypeScript SDK 参考](/zh/agent-sdk/typescript)**: 包含 MCP 配置选项的完整 API 参考
* **[Python SDK 参考](/zh/agent-sdk/python)**: 包含 MCP 配置选项的完整 API 参考
* **[MCP 服务器目录](https://github.com/modelcontextprotocol/servers)**: 浏览适用于数据库、API 等的可用 MCP 服务器