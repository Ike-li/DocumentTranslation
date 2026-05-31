> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 授予 Claude 自定义工具

> 使用 Claude Agent SDK 的进程内 MCP 服务器定义自定义工具，使 Claude 能够调用您的函数、访问您的 API 并执行特定领域的操作。

自定义工具通过让您定义自己的函数来扩展 Agent SDK，Claude 可以在对话过程中调用这些函数。通过使用 SDK 的进程内 MCP 服务器，您可以授予 Claude 访问数据库、外部 API、特定领域逻辑或应用程序所需的任何其他功能。

本指南介绍如何定义带有输入模式和处理器的工具，如何将它们打包到 MCP 服务器中，如何将它们传递给 `query`，以及如何控制 Claude 可以访问哪些工具。本指南还涵盖了错误处理、工具注解以及返回图像等非文本内容。

## 快速参考

| 如果您想……                                      | 请执行此操作                                                                                                                                                                                                       |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 定义工具                                       | 使用 [`@tool`](/zh/agent-sdk/python#tool)（Python）或 [`tool()`](/zh/agent-sdk/typescript#tool)（TypeScript），并提供名称、描述、模式和处理器。参见[创建自定义工具](#创建自定义工具)。                           |
| 向 Claude 注册工具                              | 用 `create_sdk_mcp_server` / `createSdkMcpServer` 包装，并在 `query()` 中传递给 `mcpServers`。参见[调用自定义工具](#调用自定义工具)。                                                                          |
| 预先批准工具                                   | 将其添加到您的允许工具列表中。参见[配置允许的工具](#配置允许的工具)。                                                                                                                                      |
| 从 Claude 的上下文中移除内置工具                 | 传递一个仅列出您想要的内置工具的 `tools` 数组。参见[配置允许的工具](#配置允许的工具)。                                                                                                                     |
| 让 Claude 并行调用工具                          | 对没有副作用的工具设置 `readOnlyHint: true`。参见[添加工具注解](#添加工具标注)。                                                                                                                            |
| 处理错误而不停止循环                             | 返回 `isError: true` 而不是抛出异常。参见[处理错误](#处理错误)。                                                                                                                                             |
| 返回图像或文件                                  | 在内容数组中使用 `image` 或 `resource` 块。参见[返回图像和资源](#返回图像和资源)。                                                                                                                    |
| 返回机器可读的 JSON 结果                        | 在结果上设置 `structuredContent`。参见[返回结构化数据](#返回结构化数据)。                                                                                                                                  |
| 扩展到大量工具                                  | 使用[工具搜索](/zh/agent-sdk/tool-search)按需加载工具。                                                                                                                                                          |

## 创建自定义工具

一个工具由四个部分定义，作为参数传递给 TypeScript 中的 [`tool()`](/zh/agent-sdk/typescript#tool) 辅助函数或 Python 中的 [`@tool`](/zh/agent-sdk/python#tool) 装饰器：

*   **名称：** Claude 用来调用该工具的唯一标识符。
*   **描述：** 工具的功能。Claude 阅读此描述以决定何时调用它。
*   **输入模式：** Claude 必须提供的参数。在 TypeScript 中，这总是一个 [Zod 模式](https://zod.dev/)，处理器的 `args` 类型会自动从中推断。在 Python 中，这是一个将名称映射到类型的字典，例如 `{"latitude": float}`，SDK 会为您将其转换为 JSON Schema。当您需要枚举、范围、可选字段或嵌套对象时，Python 装饰器也直接接受完整的 [JSON Schema](https://json-schema.org/understanding-json-schema/about) 字典。
*   **处理器：** 当 Claude 调用工具时运行的异步函数。它接收经过验证的参数，并且必须返回一个包含以下内容的对象：
    *   `content`（必需）：一个结果块数组，每个块的 `type` 为 `"text"`、`"image"` 或 `"resource"`。有关非文本块，请参见[返回图像和资源](#返回图像和资源)。
    *   `structuredContent`（可选）：一个 JSON 对象，将结果作为机器可读数据保存，与 `content` 一起返回。参见[返回结构化数据](#返回结构化数据)。
    *   `isError`（可选）：设置为 `true` 以发出工具失败信号，以便 Claude 可以对此做出反应。参见[处理错误](#处理错误)。

定义工具后，使用 [`createSdkMcpServer`](/zh/agent-sdk/typescript#createsdkmcpserver)（TypeScript）或 [`create_sdk_mcp_server`](/zh/agent-sdk/python#create_sdk_mcp_server)（Python）将其包装在一个服务器中。该服务器在您的应用程序内部以进程内方式运行，而不是作为单独的进程。

### 天气工具示例

此示例定义了一个 `get_temperature` 工具并将其包装在 MCP 服务器中。它仅设置工具；要将其传递给 `query` 并运行它，请参阅下面的[调用自定义工具](#调用自定义工具)。

  ```python Python
  from typing import Any
  import httpx
  from claude_agent_sdk import tool, create_sdk_mcp_server


  # Define a tool: name, description, input schema, handler
  @tool(
      "get_temperature",
      "Get the current temperature at a location",
      {"latitude": float, "longitude": float},
  )
  async def get_temperature(args: dict[str, Any]) -> dict[str, Any]:
      async with httpx.AsyncClient() as client:
          response = await client.get(
              "https://api.open-meteo.com/v1/forecast",
              params={
                  "latitude": args["latitude"],
                  "longitude": args["longitude"],
                  "current": "temperature_2m",
                  "temperature_unit": "fahrenheit",
              },
          )
          data = response.json()

      # Return a content array - Claude sees this as the tool result
      return {
          "content": [
              {
                  "type": "text",
                  "text": f"Temperature: {data['current']['temperature_2m']}°F",
              }
          ]
      }


  # Wrap the tool in an in-process MCP server
  weather_server = create_sdk_mcp_server(
      name="weather",
      version="1.0.0",
      tools=[get_temperature],
  )
  ```

  ```typescript TypeScript
  import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
  import { z } from "zod";

  // Define a tool: name, description, input schema, handler
  const getTemperature = tool(
    "get_temperature",
    "Get the current temperature at a location",
    {
      latitude: z.number().describe("Latitude coordinate"), // .describe() adds a field description Claude sees
      longitude: z.number().describe("Longitude coordinate")
    },
    async (args) => {
      // args is typed from the schema: { latitude: number; longitude: number }
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m&temperature_unit=fahrenheit`
      );
      const data: any = await response.json();

      // Return a content array - Claude sees this as the tool result
      return {
        content: [{ type: "text", text: `Temperature: ${data.current.temperature_2m}°F` }]
      };
    }
  );

  // Wrap the tool in an in-process MCP server
  const weatherServer = createSdkMcpServer({
    name: "weather",
    version: "1.0.0",
    tools: [getTemperature]
  });
  ```

请参阅 [`tool()`](/zh/agent-sdk/typescript#tool) 的 TypeScript 参考文档或 [`@tool`](/zh/agent-sdk/python#tool) 的 Python 参考文档，以了解完整的参数详情，包括 JSON Schema 输入格式和返回值结构。

  要使参数变为可选：在 TypeScript 中，在 Zod 字段中添加 `.default()`。在 Python 中，字典模式将每个键视为必需，因此从模式中省略该参数，在描述字符串中提及它，并在处理器中使用 `args.get()` 读取它。下方的 [`get_precipitation_chance` 工具](#添加更多工具)展示了这两种模式。

### 调用自定义工具

通过 `mcpServers` 选项将您创建的 MCP 服务器传递给 `query`。`mcpServers` 中的键将成为每个工具完全限定名称中的 `{server_name}` 部分：`mcp__{server_name}__{tool_name}`。将该名称列在 `allowedTools` 中，以便工具运行时无需权限提示词。

这些代码片段复用了[上方示例](#天气工具示例)中的 `weatherServer` 来询问 Claude 特定位置的天气。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={"weather": weather_server},
          allowed_tools=["mcp__weather__get_temperature"],
      )

      async for message in query(
          prompt="What's the temperature in San Francisco?",
          options=options,
      ):
          # ResultMessage is the final message after all tool calls complete
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "What's the temperature in San Francisco?",
    options: {
      mcpServers: { weather: weatherServer },
      allowedTools: ["mcp__weather__get_temperature"]
    }
  })) {
    // "result" is the final message after all tool calls complete
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```

### 添加更多工具

一个服务器可以包含其 `tools` 数组中列出的任意数量的工具。当服务器有多个工具时，你可以在 `allowedTools` 中逐个列出每个工具，或使用通配符 `mcp__weather__*` 来覆盖服务器暴露的所有工具。

以下示例向 [天气工具示例](#天气工具示例) 中的 `weatherServer` 添加了第二个工具 `get_precipitation_chance`，并使用数组中的这两个工具重新构建了它。

  ```python Python
  # Define a second tool for the same server
  @tool(
      "get_precipitation_chance",
      "Get the hourly precipitation probability for a location. "
      "Optionally pass 'hours' (1-24) to control how many hours to return.",
      {"latitude": float, "longitude": float},
  )
  async def get_precipitation_chance(args: dict[str, Any]) -> dict[str, Any]:
      # 'hours' isn't in the schema - read it with .get() to make it optional
      hours = args.get("hours", 12)
      async with httpx.AsyncClient() as client:
          response = await client.get(
              "https://api.open-meteo.com/v1/forecast",
              params={
                  "latitude": args["latitude"],
                  "longitude": args["longitude"],
                  "hourly": "precipitation_probability",
                  "forecast_days": 1,
              },
          )
          data = response.json()
      chances = data["hourly"]["precipitation_probability"][:hours]

      return {
          "content": [
              {
                  "type": "text",
                  "text": f"Next {hours} hours: {'%, '.join(map(str, chances))}%",
              }
          ]
      }


  # Rebuild the server with both tools in the array
  weather_server = create_sdk_mcp_server(
      name="weather",
      version="1.0.0",
      tools=[get_temperature, get_precipitation_chance],
  )
  ```

  ```typescript TypeScript
  // Define a second tool for the same server
  const getPrecipitationChance = tool(
    "get_precipitation_chance",
    "Get the hourly precipitation probability for a location",
    {
      latitude: z.number(),
      longitude: z.number(),
      hours: z
        .number()
        .int()
        .min(1)
        .max(24)
        .default(12) // .default() makes the parameter optional
        .describe("How many hours of forecast to return")
    },
    async (args) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&hourly=precipitation_probability&forecast_days=1`
      );
      const data: any = await response.json();
      const chances = data.hourly.precipitation_probability.slice(0, args.hours);

      return {
        content: [{ type: "text", text: `Next ${args.hours} hours: ${chances.join("%, ")}%` }]
      };
    }
  );

  // Rebuild the server with both tools in the array
  const weatherServer = createSdkMcpServer({
    name: "weather",
    version: "1.0.0",
    tools: [getTemperature, getPrecipitationChance]
  });
  ```

此数组中的每个工具在每次交互中都会消耗上下文窗口空间。如果你定义了数十个工具，请参阅 [工具搜索](/zh/agent-sdk/tool-search) 了解如何按需加载它们。

### 添加工具标注

[工具标注](https://modelcontextprotocol.io/docs/concepts/tools#tool-annotations) 是可选的元数据，用于描述工具的行为。在 TypeScript 中，可作为第五个参数传递给 `tool()` 辅助函数；在 Python 中，可通过 `@tool` 装饰器的 `annotations` 关键字参数传入。所有提示字段均为布尔值。

| 字段              | 默认值  | 含义                                                                                               |
| :---------------- | :------ | :------------------------------------------------------------------------------------------------- |
| `readOnlyHint`    | `false` | 工具不会修改其环境。控制该工具是否可与其他只读工具并行调用。                                       |
| `destructiveHint` | `true`  | 工具可能执行破坏性更新。仅供参考。                                                                 |
| `idempotentHint`  | `false` | 使用相同参数重复调用不会产生额外效果。仅供参考。                                                   |
| `openWorldHint`   | `true`  | 工具会访问进程外的系统。仅供参考。                                                                 |

标注是元数据，而非强制约束。标记为 `readOnlyHint: true` 的工具，如果处理器逻辑需要，仍然可以写入磁盘。请确保标注与处理器行为保持一致。

此示例为 [天气工具示例](#天气工具示例) 中的 `get_temperature` 工具添加了 `readOnlyHint`。

  ```python Python
  from claude_agent_sdk import tool, ToolAnnotations


  @tool(
      "get_temperature",
      "Get the current temperature at a location",
      {"latitude": float, "longitude": float},
      annotations=ToolAnnotations(
          readOnlyHint=True
      ),  # Lets Claude batch this with other read-only calls
  )
  async def get_temperature(args):
      return {"content": [{"type": "text", "text": "..."}]}
  ```

  ```typescript TypeScript
  tool(
    "get_temperature",
    "Get the current temperature at a location",
    { latitude: z.number(), longitude: z.number() },
    async (args) => ({ content: [{ type: "text", text: `...` }] }),
    { annotations: { readOnlyHint: true } } // Lets Claude batch this with other read-only calls
  );
  ```

参见 [TypeScript](/zh/agent-sdk/typescript#toolannotations) 或 [Python](/zh/agent-sdk/python#toolannotations) 参考文档中的 `ToolAnnotations`。

## 控制工具访问

[天气工具示例](#天气工具示例)注册了一个服务器并在 `allowedTools` 中列出了工具。本节介绍工具名称的构造方式，以及当你拥有多个工具或希望限制内置工具时如何控制访问范围。

### 工具名称格式

当 MCP 工具暴露给 Claude 时，其名称遵循特定格式：

*   格式：`mcp__{server_name}__{tool_name}`
*   示例：服务器 `weather` 中名为 `get_temperature` 的工具变为 `mcp__weather__get_temperature`

### 配置允许的工具

`tools` 选项以及允许/禁止列表影响两个层面：**可用性**（控制工具是否出现在 Claude 的上下文中）和**权限**（控制 Claude 尝试调用后是否被批准）。`tools` 和不带范围的 `disallowedTools` 条目会改变可用性。`allowedTools` 和带范围的 `disallowedTools` 规则仅改变权限。

| 选项                    | 层面     | 效果                                                                                                                                                                                                          |
| :------------------------ | :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools: ["Read", "Grep"]` | 可用性 | 只有列出的内置工具会出现在 Claude 的上下文中。未列出的内置工具将被移除。MCP 工具不受影响。                                                                                                    |
| `tools: []`               | 可用性 | 所有内置工具将被移除。Claude 只能使用你的 MCP 工具。                                                                                                                                                  |
| 允许的工具             | 权限   | 列出的工具无需权限提示即可运行。未列出的工具仍然可用；调用将经过[权限流程](/zh/agent-sdk/permissions)。                                                               |
| 禁止的工具          | 两者         | 如 `"Bash"` 这样的裸工具名称会将其从 Claude 的上下文中移除，效果与从 `tools` 中省略它相同。如 `"Bash(rm *)"` 这样的带范围规则会保留工具在上下文中，仅禁止匹配的调用。 |

要完全移除某个内置工具，请将其从 `tools` 中省略，或在 `disallowedTools`（Python：`disallowed_tools`）中列出其裸名称；这两种方式都能将该工具移出上下文，因此 Claude 永远不会尝试调用它。带范围的 `disallowedTools` 规则会阻止匹配的调用，但会让工具保持可见，因此 Claude 可能会浪费一次调用机会尝试它。完整的评估顺序请参见[配置权限](/zh/agent-sdk/permissions)。

## 处理错误

你的处理程序如何报告错误决定了代理循环是继续还是停止：

| 发生情况                                                                             | 结果                                                                                                           |
| :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 处理程序抛出未捕获的异常                                                     | 代理循环停止。Claude 永远看不到错误，且 `query` 调用失败。                                       |
| 处理程序捕获错误并返回 `isError: true` (TS) / `"is_error": True` (Python) | 代理循环继续。Claude 将错误视为数据，并可重试、尝试不同的工具或解释失败原因。 |

下面的示例在处理程序内部捕获了两种失败情况，而不是让它们抛出异常。从响应中捕获非 200 的 HTTP 状态码并作为错误结果返回。网络错误或无效的 JSON 被外层的 `try/except`（Python）或 `try/catch`（TypeScript）捕获，同样作为错误结果返回。在这两种情况下，处理程序都会正常返回，代理循环继续。

  ```python Python
  import json
  import httpx
  from typing import Any


  @tool(
      "fetch_data",
      "Fetch data from an API",
      {"endpoint": str},  # Simple schema
  )
  async def fetch_data(args: dict[str, Any]) -> dict[str, Any]:
      try:
          async with httpx.AsyncClient() as client:
              response = await client.get(args["endpoint"])
              if response.status_code != 200:
                  # Return the failure as a tool result so Claude can react to it.
                  # is_error marks this as a failed call rather than odd-looking data.
                  return {
                      "content": [
                          {
                              "type": "text",
                              "text": f"API error: {response.status_code} {response.reason_phrase}",
                          }
                      ],
                      "is_error": True,
                  }

              data = response.json()
              return {"content": [{"type": "text", "text": json.dumps(data, indent=2)}]}
      except Exception as e:
          # Catching here keeps the agent loop alive. An uncaught exception
          # would end the whole query() call.
          return {
              "content": [{"type": "text", "text": f"Failed to fetch data: {str(e)}"}],
              "is_error": True,
          }
  ```

  ```typescript TypeScript
  tool(
    "fetch_data",
    "Fetch data from an API",
    {
      endpoint: z.string().url().describe("API endpoint URL")
    },
    async (args) => {
      try {
        const response = await fetch(args.endpoint);

        if (!response.ok) {
          // Return the failure as a tool result so Claude can react to it.
          // isError marks this as a failed call rather than odd-looking data.
          return {
            content: [
              {
                type: "text",
                text: `API error: ${response.status} ${response.statusText}`
              }
            ],
            isError: true
          };
        }

        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        // Catching here keeps the agent loop alive. An uncaught throw
        // would end the whole query() call.
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
  ```

## 返回图像和资源

工具结果中的 `content` 数组接受 `text`、`image` 和 `resource` 块。您可以在同一响应中混合使用它们。

### 图像

图像块以内联方式携带图像字节，编码为 Base64 格式。没有 URL 字段。要返回一个存储在 URL 的图像，需要在处理器中获取它，读取响应字节，并在返回前进行 Base64 编码。处理结果将作为视觉输入。

| 字段       | 类型      | 说明                                                                      |
| :--------- | :-------- | :------------------------------------------------------------------------- |
| `type`     | `"image"` |                                                                            |
| `data`     | `string`  | Base64编码的字节。仅使用原始 Base64，没有 `data:image/...;base64,` 前缀     |
| `mimeType` | `string`  | 必填。例如 `image/png`、`image/jpeg`、`image/webp`、`image/gif`             |

  ```python Python
  import base64
  import httpx


  # Define a tool that fetches an image from a URL and returns it to Claude
  @tool("fetch_image", "Fetch an image from a URL and return it to Claude", {"url": str})
  async def fetch_image(args):
      async with httpx.AsyncClient() as client:  # Fetch the image bytes
          response = await client.get(args["url"])

      return {
          "content": [
              {
                  "type": "image",
                  "data": base64.b64encode(response.content).decode(
                      "ascii"
                  ),  # Base64-encode the raw bytes
                  "mimeType": response.headers.get(
                      "content-type", "image/png"
                  ),  # Read MIME type from the response
              }
          ]
      }
  ```

  ```typescript TypeScript
  tool(
    "fetch_image",
    "Fetch an image from a URL and return it to Claude",
    {
      url: z.string().url()
    },
    async (args) => {
      const response = await fetch(args.url); // Fetch the image bytes
      const buffer = Buffer.from(await response.arrayBuffer()); // Read into a Buffer for base64 encoding
      const mimeType = response.headers.get("content-type") ?? "image/png";

      return {
        content: [
          {
            type: "image",
            data: buffer.toString("base64"), // Base64-encode the raw bytes
            mimeType
          }
        ]
      };
    }
  );
  ```

### 资源

资源块用于嵌入一段由 URI 标识的内容。URI 是供 Claude 引用的标签；实际内容存放在块的 `text` 或 `blob` 字段中。当你的工具生成的内容适合后续按名称引用时（例如生成的文件或来自外部系统的记录），可以使用此功能。

| 字段                | 类型         | 说明                                                              |
| :------------------ | :----------- | :---------------------------------------------------------------- |
| `type`              | `"resource"` |                                                                   |
| `resource.uri`      | `string`     | 内容的标识符。可以是任何 URI 方案                                 |
| `resource.text`     | `string`     | 如果内容是文本，则提供此字段。与 `blob` 二选一，不可同时使用      |
| `resource.blob`     | `string`     | 如果内容是二进制，则提供其 base64 编码的字符串。与 `text` 二选一  |
| `resource.mimeType` | `string`     | 可选                                                              |

此示例展示了从工具处理器内部返回的资源块。URI `file:///tmp/report.md` 是 Claude 后续可以引用的标签；SDK 不会从该路径读取文件。

  ```typescript TypeScript
  return {
    content: [
      {
        type: "resource",
        resource: {
          uri: "file:///tmp/report.md", // Label for Claude to reference, not a path the SDK reads
          mimeType: "text/markdown",
          text: "# Report\n..." // The actual content, inline
        }
      }
    ]
  };
  ```

  ```python Python
  return {
      "content": [
          {
              "type": "resource",
              "resource": {
                  "uri": "file:///tmp/report.md",  # Label for Claude to reference, not a path the SDK reads
                  "mimeType": "text/markdown",
                  "text": "# Report\n...",  # The actual content, inline
              },
          }
      ]
  }
  ```

这些块形状源自 MCP 的 `CallToolResult` 类型。完整定义请参阅 [MCP 规范](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)。

## 返回结构化数据

`structuredContent` 是结果中的一个可选 JSON 对象，与 `content` 数组是分开的。使用它可以返回原始值，Claude 可以将其读取为精确字段，而不是从文本字符串或图像中解析它们。

当设置了 `structuredContent` 时，Claude 会接收到该 JSON 以及 `content` 中的任何图像或资源块。`content` 中的文本块不会被转发，因为它们被假定为重复了结构化数据。下面的示例将图表渲染为图像块，并在同一个处理程序中，在 `structuredContent` 中返回其背后的数据点。
```typescript TypeScript
return {
  content: [
    {
      type: "image",
      data: chartPngBuffer.toString("base64"),
      mimeType: "image/png"
    }
  ],
  structuredContent: {
    series: "temperature_2m",
    unit: "fahrenheit",
    points: [62.1, 63.4, 65.0, 64.2]
  }
};
```


  Python 的 `@tool` 装饰器仅转发处理器返回字典中的 `content` 和 `is_error`。要从 Python 返回 `structuredContent`，请运行[独立的 MCP 服务器](/zh/agent-sdk/mcp)，而非使用进程内的 SDK 服务器。

## 示例：单位转换器

此工具可在长度、温度和重量的单位间进行数值转换。用户可以询问“将100公里转换为英里”或“72华氏度等于多少摄氏度”，Claude 会从请求中识别出合适的单位类型及单位。

它展示了两种模式：

* **枚举模式：** `unit_type` 被约束为一组固定的值。在 TypeScript 中，使用 `z.enum()`。在 Python 中，字典模式不支持枚举，因此需要完整的 JSON Schema 字典。
* **不支持输入处理：** 当未找到转换对时，处理程序返回 `isError: true`，这样 Claude 可以告知用户出了什么问题，而不是将失败视为正常结果。

  ```python Python
  from typing import Any
  from claude_agent_sdk import tool, create_sdk_mcp_server


  # z.enum() in TypeScript becomes an "enum" constraint in JSON Schema.
  # The dict schema has no equivalent, so full JSON Schema is required.
  @tool(
      "convert_units",
      "Convert a value from one unit to another",
      {
          "type": "object",
          "properties": {
              "unit_type": {
                  "type": "string",
                  "enum": ["length", "temperature", "weight"],
                  "description": "Category of unit",
              },
              "from_unit": {
                  "type": "string",
                  "description": "Unit to convert from, e.g. kilometers, fahrenheit, pounds",
              },
              "to_unit": {"type": "string", "description": "Unit to convert to"},
              "value": {"type": "number", "description": "Value to convert"},
          },
          "required": ["unit_type", "from_unit", "to_unit", "value"],
      },
  )
  async def convert_units(args: dict[str, Any]) -> dict[str, Any]:
      conversions = {
          "length": {
              "kilometers_to_miles": lambda v: v * 0.621371,
              "miles_to_kilometers": lambda v: v * 1.60934,
              "meters_to_feet": lambda v: v * 3.28084,
              "feet_to_meters": lambda v: v * 0.3048,
          },
          "temperature": {
              "celsius_to_fahrenheit": lambda v: (v * 9) / 5 + 32,
              "fahrenheit_to_celsius": lambda v: (v - 32) * 5 / 9,
              "celsius_to_kelvin": lambda v: v + 273.15,
              "kelvin_to_celsius": lambda v: v - 273.15,
          },
          "weight": {
              "kilograms_to_pounds": lambda v: v * 2.20462,
              "pounds_to_kilograms": lambda v: v * 0.453592,
              "grams_to_ounces": lambda v: v * 0.035274,
              "ounces_to_grams": lambda v: v * 28.3495,
          },
      }

      key = f"{args['from_unit']}_to_{args['to_unit']}"
      fn = conversions.get(args["unit_type"], {}).get(key)

      if not fn:
          return {
              "content": [
                  {
                      "type": "text",
                      "text": f"Unsupported conversion: {args['from_unit']} to {args['to_unit']}",
                  }
              ],
              "is_error": True,
          }

      result = fn(args["value"])
      return {
          "content": [
              {
                  "type": "text",
                  "text": f"{args['value']} {args['from_unit']} = {result:.4f} {args['to_unit']}",
              }
          ]
      }


  converter_server = create_sdk_mcp_server(
      name="converter",
      version="1.0.0",
      tools=[convert_units],
  )
  ```

  ```typescript TypeScript
  import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
  import { z } from "zod";

  const convert = tool(
    "convert_units",
    "Convert a value from one unit to another",
    {
      unit_type: z.enum(["length", "temperature", "weight"]).describe("Category of unit"),
      from_unit: z
        .string()
        .describe("Unit to convert from, e.g. kilometers, fahrenheit, pounds"),
      to_unit: z.string().describe("Unit to convert to"),
      value: z.number().describe("Value to convert")
    },
    async (args) => {
      type Conversions = Record<string, Record<string, (v: number) => number>>;

      const conversions: Conversions = {
        length: {
          kilometers_to_miles: (v) => v * 0.621371,
          miles_to_kilometers: (v) => v * 1.60934,
          meters_to_feet: (v) => v * 3.28084,
          feet_to_meters: (v) => v * 0.3048
        },
        temperature: {
          celsius_to_fahrenheit: (v) => (v * 9) / 5 + 32,
          fahrenheit_to_celsius: (v) => ((v - 32) * 5) / 9,
          celsius_to_kelvin: (v) => v + 273.15,
          kelvin_to_celsius: (v) => v - 273.15
        },
        weight: {
          kilograms_to_pounds: (v) => v * 2.20462,
          pounds_to_kilograms: (v) => v * 0.453592,
          grams_to_ounces: (v) => v * 0.035274,
          ounces_to_grams: (v) => v * 28.3495
        }
      };

      const key = `${args.from_unit}_to_${args.to_unit}`;
      const fn = conversions[args.unit_type]?.[key];

      if (!fn) {
        return {
          content: [
            {
              type: "text",
              text: `Unsupported conversion: ${args.from_unit} to ${args.to_unit}`
            }
          ],
          isError: true
        };
      }

      const result = fn(args.value);
      return {
        content: [
          {
            type: "text",
            text: `${args.value} ${args.from_unit} = ${result.toFixed(4)} ${args.to_unit}`
          }
        ]
      };
    }
  );

  const converterServer = createSdkMcpServer({
    name: "converter",
    version: "1.0.0",
    tools: [convert]
  });
  ```

定义好服务器后，将其传递给 `query` 方法，方式与天气示例相同。此示例在循环中发送三个不同的提示词，以展示同一工具如何处理不同单位类型。对于每个响应，程序会检查 `AssistantMessage` 对象（包含 Claude 在该轮次中发起的工具调用），并在打印最终 `ResultMessage` 文本前，逐一输出每个 `ToolUseBlock`。这样您就能清楚看到 Claude 何时在使用工具，何时在依靠自身知识回答问题。

  ```python Python
  import asyncio
  from claude_agent_sdk import (
      query,
      ClaudeAgentOptions,
      ResultMessage,
      AssistantMessage,
      ToolUseBlock,
  )


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={"converter": converter_server},
          allowed_tools=["mcp__converter__convert_units"],
      )

      prompts = [
          "Convert 100 kilometers to miles.",
          "What is 72°F in Celsius?",
          "How many pounds is 5 kilograms?",
      ]

      for prompt in prompts:
          async for message in query(prompt=prompt, options=options):
              if isinstance(message, AssistantMessage):
                  for block in message.content:
                      if isinstance(block, ToolUseBlock):
                          print(f"[tool call] {block.name}({block.input})")
              elif isinstance(message, ResultMessage) and message.subtype == "success":
                  print(f"Q: {prompt}\nA: {message.result}\n")


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const prompts = [
    "Convert 100 kilometers to miles.",
    "What is 72°F in Celsius?",
    "How many pounds is 5 kilograms?"
  ];

  for (const prompt of prompts) {
    for await (const message of query({
      prompt,
      options: {
        mcpServers: { converter: converterServer },
        allowedTools: ["mcp__converter__convert_units"]
      }
    })) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            console.log(`[tool call] ${block.name}`, block.input);
          }
        }
      } else if (message.type === "result" && message.subtype === "success") {
        console.log(`Q: ${prompt}\nA: ${message.result}\n`);
      }
    }
  }
  ```

## 后续步骤

自定义工具以标准接口包装异步函数。您可以在同一服务器中混合使用本页介绍的模式：单个服务器可以同时包含数据库工具、API 网关工具和图像渲染器。

接下来：

* 如果您的服务器扩展到数十个工具，请参阅 [工具搜索](/zh/agent-sdk/tool-search) 以将工具加载延迟到 Claude 需要时。
* 要连接到外部 MCP 服务器（文件系统、GitHub、Slack）而非自行构建，请参阅 [连接 MCP 服务器](/zh/agent-sdk/mcp)。
* 要控制哪些工具自动运行、哪些需要批准，请参阅 [配置权限](/zh/agent-sdk/permissions)。

## 相关文档

* [TypeScript SDK 参考](/zh/agent-sdk/typescript)
* [Python SDK 参考](/zh/agent-sdk/python)
* [MCP 文档](https://modelcontextprotocol.io)
* [SDK 概述](/zh/agent-sdk/overview)