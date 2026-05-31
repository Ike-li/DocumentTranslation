> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 使用 OpenTelemetry 实现可观测性

> 使用 OpenTelemetry 将 Agent SDK 的轨迹、指标和事件导出到您的可观测性后端。

在生产环境中运行代理时，您需要了解它们执行了哪些操作：

* 它们调用了哪些工具
* 每个模型请求耗时多久
* 花费了多少 token
* 在哪里发生了故障

Agent SDK 可以将此数据作为 OpenTelemetry 轨迹、指标和日志事件导出到任何接受 OpenTelemetry 协议 (OTLP) 的后端，例如 Honeycomb、Datadog、Grafana、Langfuse 或自托管收集器。

本指南解释了 SDK 如何发出遥测数据、如何配置导出，以及数据到达后端后如何标记和过滤。若要从 SDK 响应流中直接读取 token 使用量和成本，而不是导出到后端，请参阅[跟踪成本和使用情况](/zh/agent-sdk/cost-tracking)。

## SDK 如何产生遥测数据流

Agent SDK 将 Claude Code CLI 作为子进程运行，并通过本地管道与其通信。该 CLI 内置了 OpenTelemetry 检测：它在每个模型请求和工具执行周围记录跨度，发出用于 token 和成本计数器的指标，并为提示词和工具结果发出结构化日志事件。SDK 本身不产生遥测数据。相反，它将配置传递给 CLI 进程，CLI 会直接导出到您的收集器。

配置通过环境变量传递。默认情况下，子进程会继承应用程序的环境，因此您可以在以下两个位置之一配置遥测：

* **进程环境：** 在应用程序启动之前，在您的 shell、容器或编排器中设置变量。每次 `query()` 调用都会自动获取这些变量，无需更改代码。这是生产环境部署的推荐方法。
* **逐次调用选项：** 在 `ClaudeAgentOptions.env`（Python）或 `options.env`（TypeScript）中设置变量。当同一进程中的不同代理需要不同的遥测设置时使用此方法。在 Python 中，`env` 会合并到继承的环境之上。在 TypeScript 中，`env` 会完全替换继承的环境，因此请在传递的对象中包含 `...process.env`。

CLI 导出三个独立的 OpenTelemetry 信号。每个信号都有自己的启用开关和导出器，因此您可以只启用需要的信号。

| 信号       | 包含内容                                                                    | 启用方式                                                            |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 指标       | 用于 token、成本、会话、代码行数和工具决策的计数器                           | `OTEL_METRICS_EXPORTER`                                             |
| 日志事件   | 每个提示词、API 请求、API 错误和工具结果的结构化记录                        | `OTEL_LOGS_EXPORTER`                                                |
| 轨迹       | 每个交互、模型请求、工具调用和钩子（测试版）的跨度                           | `OTEL_TRACES_EXPORTER` 加上 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` |

有关指标名称、事件名称和属性的完整列表，请参阅 Claude Code [监控](/zh/monitoring-usage)参考。Agent SDK 发出相同的数据，因为它运行相同的 CLI。跨度名称列在下方的[读取代理轨迹](#读取代理跟踪数据)中。

## 启用遥测导出

除非您设置 `CLAUDE_CODE_ENABLE_TELEMETRY=1` 并选择至少一个导出器，否则遥测是关闭的。最常见的配置是通过 OTLP HTTP 将所有三个信号发送到收集器。

以下示例在字典中设置变量并通过 `options.env` 传递。代理运行一个任务，当循环消费响应流时，CLI 将跨度、指标和事件导出到 `collector.example.com` 的收集器：

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions

  OTEL_ENV = {
      "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
      # Required for traces, which are in beta. Metrics and log events do not need this.
      "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
      # Choose an exporter per signal. Use otlp for the SDK; see the Note below.
      "OTEL_TRACES_EXPORTER": "otlp",
      "OTEL_METRICS_EXPORTER": "otlp",
      "OTEL_LOGS_EXPORTER": "otlp",
      # Standard OTLP transport configuration.
      "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
      "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.example.com:4318",
      "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer your-token",
  }


  async def main():
      options = ClaudeAgentOptions(env=OTEL_ENV)
      async for message in query(
          prompt="List the files in this directory", options=options
      ):
          print(message)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const otelEnv = {
    CLAUDE_CODE_ENABLE_TELEMETRY: "1",
    // Required for traces, which are in beta. Metrics and log events do not need this.
    CLAUDE_CODE_ENHANCED_TELEMETRY_BETA: "1",
    // Choose an exporter per signal. Use otlp for the SDK; see the Note below.
    OTEL_TRACES_EXPORTER: "otlp",
    OTEL_METRICS_EXPORTER: "otlp",
    OTEL_LOGS_EXPORTER: "otlp",
    // Standard OTLP transport configuration.
    OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://collector.example.com:4318",
    OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Bearer your-token",
  };

  for await (const message of query({
    prompt: "List the files in this directory",
    // env replaces the inherited environment in TypeScript, so spread
    // process.env first to keep PATH, ANTHROPIC_API_KEY, and other variables.
    options: { env: { ...process.env, ...otelEnv } },
  })) {
    console.log(message);
  }
  ```

由于子进程默认会继承应用程序的环境，因此你可以通过在 Dockerfile、Kubernetes 清单或 shell 配置文件中导出这些变量，并完全省略 `options.env`，来实现相同的结果。

  `console` 导出器会将遥测数据写入标准输出，该通道被 SDK 用作消息通道。当通过 SDK 运行时，请勿将 `console` 设置为导出器值。若要在本地检查遥测数据，请将 `OTEL_EXPORTER_OTLP_ENDPOINT` 指向本地收集器或一体化的 Jaeger 容器。

### 为短暂运行的命令刷新遥测数据

CLI 会批量处理遥测数据并定期导出。在进程正常退出时，它会尝试刷新待处理数据，但刷新操作受较短的超时限制，因此如果收集器响应缓慢，仍可能丢弃部分数据段。如果您的进程在 CLI 完全关闭前被终止，批量缓冲区中任何未发送的数据都将丢失。缩短导出间隔可以减少这两种情况的发生窗口。

默认情况下，指标每 60 秒导出一次，跟踪和日志每 5 秒导出一次。以下示例缩短了这三个间隔，以便在短暂任务运行期间数据能及时到达收集器：

  ```python Python
  OTEL_ENV = {
      # ... exporter configuration from the previous example ...
      "OTEL_METRIC_EXPORT_INTERVAL": "1000",
      "OTEL_LOGS_EXPORT_INTERVAL": "1000",
      "OTEL_TRACES_EXPORT_INTERVAL": "1000",
  }
  ```

  ```typescript TypeScript
  const otelEnv = {
    // ... exporter configuration from the previous example ...
    OTEL_METRIC_EXPORT_INTERVAL: "1000",
    OTEL_LOGS_EXPORT_INTERVAL: "1000",
    OTEL_TRACES_EXPORT_INTERVAL: "1000",
  };
  ```

## 读取代理跟踪数据

跟踪数据为您提供代理运行的最详细视图。当设置 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` 时，代理循环的每一步都会成为一个 span，您可以在跟踪后端中检查：

* **`claude_code.interaction`：** 封装代理循环的单次循环，从接收提示词到生成响应。
* **`claude_code.llm_request`：** 封装对 Claude API 的每次调用，包含模型名称、延迟和 token 计数等属性。
* **`claude_code.tool`：** 封装每次工具调用，包含用于权限等待的子级 span (`claude_code.tool.blocked_on_user`) 和执行本身的 span (`claude_code.tool.execution`)。
* **`claude_code.hook`：** 封装每次[钩子](/zh/agent-sdk/hooks)执行。除上述变量外，还需要详细的 beta 跟踪配置 (`ENABLE_BETA_TRACING_DETAILED=1` 和 `BETA_TRACING_ENDPOINT`)。

`llm_request`、`tool` 和 `hook` span 是外围 `claude_code.interaction` span 的子级。当代理通过 Task 工具生成子代理时，该子代理的 `llm_request` 和 `tool` span 将嵌套在父代理的 `claude_code.tool` span 下，因此整个委托链会显示为一个跟踪记录。

默认情况下，Span 会携带 `session.id` 属性。当您对同一个[会话](/zh/agent-sdk/sessions)进行多次 `query()` 调用时，在后端根据 `session.id` 进行筛选，即可将它们视为一条时间线。如果 `OTEL_METRICS_INCLUDE_SESSION_ID` 设置为假值，则该属性将被省略。

  追踪功能目前处于测试版。Span 名称和属性可能在版本更新时发生变化。请参阅监控参考中的[追踪（测试版）](/zh/monitoring-usage#traces-beta)部分，了解追踪导出器配置变量。

## 将链路追踪关联到您的应用

SDK 会自动将 W3C 追踪上下文传播到 CLI 子进程。当您在应用中存在活跃的 OpenTelemetry span 时调用 `query()`，SDK 会向子进程环境注入 `TRACEPARENT` 和 `TRACESTATE`，CLI 会读取这些信息使其 `claude_code.interaction` span 成为您 span 的子级。这样代理运行就会出现在您应用的追踪中，而非作为断开连接的根节点。

启用追踪上下文传播后，CLI 也会将 `TRACEPARENT` 转发给其运行的每个 Bash 和 PowerShell 命令。如果通过 Bash 工具启动的命令发出自身的 OpenTelemetry span，这些 span 会嵌套在包裹该命令的 `claude_code.tool.execution` span 下。

当您在 `options.env` 中显式设置 `TRACEPARENT` 时，自动注入会被跳过，因此您可以按需固定特定的父级上下文。交互式 CLI 会话会完全忽略传入的 `TRACEPARENT`；仅 Agent SDK 和 `claude -p` 运行会遵守它。完整的 span 和属性参考请查阅监控参考文档中的 [链路追踪（测试版）](/zh/monitoring-usage#traces-beta)。

## 为代理添加遥测标签

默认情况下，CLI 会将 `service.name` 报告为 `claude-code`。如果您运行多个代理，或与向同一收集器导出数据的其他服务一起运行 SDK，请覆盖服务名称并添加资源属性，以便在后端按代理筛选。

以下示例重命名服务并附加部署元数据。这些值将作为 OpenTelemetry 资源属性应用于代理发出的每个 span、指标和事件：

  ```python Python
  options = ClaudeAgentOptions(
      env={
          # ... exporter configuration ...
          "OTEL_SERVICE_NAME": "support-triage-agent",
          "OTEL_RESOURCE_ATTRIBUTES": "service.version=1.4.0,deployment.environment=production",
      },
  )
  ```

  ```typescript TypeScript
  const options = {
    env: {
      ...process.env,
      // ... exporter configuration ...
      OTEL_SERVICE_NAME: "support-triage-agent",
      OTEL_RESOURCE_ATTRIBUTES:
        "service.version=1.4.0,deployment.environment=production",
    },
  };
  ```

## 将操作归属于您的最终用户

CLI 会基于调用 Anthropic 所使用的凭据，为每个事件附加[身份属性](/zh/monitoring-usage#standard-attributes)。当您构建一个为来自单一部署的多个最终用户提供服务的应用程序时，这些属性标识的是您服务的凭据，而非代理所代表行动的最终用户。

为使工具调用和 MCP 活动可归属于您应用程序的最终用户，请在每次 `query()` 调用时，将最终用户身份作为资源属性注入。在插值之前，应对值进行百分比编码，因为 `OTEL_RESOURCE_ATTRIBUTES` [保留了逗号、空格和等号](/zh/monitoring-usage#multi-team-organization-support)。以下示例将请求用户和租户附加到单个请求产生的每个 span 和事件：

  ```python Python
  from urllib.parse import quote

  options = ClaudeAgentOptions(
      env={
          # ... exporter configuration ...
          "OTEL_RESOURCE_ATTRIBUTES": f"enduser.id={quote(request.user_id)},tenant.id={quote(request.tenant_id)}",
      },
  )
  ```

  ```typescript TypeScript
  const options = {
    env: {
      ...process.env,
      // ... exporter configuration ...
      OTEL_RESOURCE_ATTRIBUTES: `enduser.id=${encodeURIComponent(request.userId)},tenant.id=${encodeURIComponent(request.tenantId)}`,
    },
  };
  ```

附加最终用户身份后，`tool_decision`、`tool_result`、`mcp_server_connection` 和 `permission_mode_changed` 事件将形成可转发至安全信息与事件管理（SIEM）平台的每用户审计跟踪。请查阅监控参考文档中的 [审计安全事件](/zh/monitoring-usage#audit-security-events) 章节，获取完整的安全相关事件列表及其包含的属性。

## 在导出中控制敏感数据

默认情况下，遥测数据是结构化的。持续时间、模型名称和工具名称会记录在每个跨度中；当底层 API 请求返回用量数据时，还会记录 token 计数，因此失败或中止的请求对应的跨度可能会省略这些计数。您的代理读写的内容默认不会记录。以下变量可选择启用以将内容添加到导出数据中：

| 变量                      | 添加内容                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_LOG_USER_PROMPTS=1` | `claude_code.user_prompt` 事件及 `claude_code.interaction` 跨度上的提示词文本                                                                                                                                                                                                                                                                                                                                                                                |
| `OTEL_LOG_TOOL_DETAILS=1` | `claude_code.tool_result` 事件上的工具输入参数（文件路径、shell 命令、搜索模式）                                                                                                                                                                                                                                                                                                                                                                            |
| `OTEL_LOG_TOOL_CONTENT=1` | 作为 `claude_code.tool` 跨度事件的完整工具输入和输出主体，在 60 KB 处截断。需启用 [追踪](#读取代理跟踪数据) 功能                                                                                                                                                                                                                                                                                                                                            |
| `OTEL_LOG_RAW_API_BODIES` | 作为 `claude_code.api_request_body` 和 `claude_code.api_response_body` 日志事件的完整 Anthropic Messages API 请求和响应 JSON。设置为 `1` 表示在 60 KB 处截断的内联主体，或 `file:<dir>` 表示磁盘上未截断的主体并在事件中包含 `body_ref` 路径。主体包含整个对话历史，并且扩展思考内容会被编辑。启用此选项即表示同意显示上述三个变量会暴露的所有内容 |

除非您的可观测性管道被批准存储代理处理的数据，否则请勿设置这些变量。请查阅监控参考文档中的 [安全与隐私](/zh/monitoring-usage#security-and-privacy) 章节，获取完整的属性列表和编辑行为。

## 相关文档

以下指南涵盖了监控和部署代理的相关主题：

*   [跟踪成本与用量](/zh/agent-sdk/cost-tracking)：无需外部后端即可从消息流中读取 token 和成本数据。
*   [托管 Agent SDK](/zh/agent-sdk/hosting)：在容器中部署代理，您可以在环境层面设置 OpenTelemetry 变量。
*   [监控](/zh/monitoring-usage)：CLI 发出的每个环境变量、指标和事件的完整参考。