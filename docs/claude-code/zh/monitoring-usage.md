> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索之前发现所有可用页面。

# 监控

> 了解如何为 Claude Code 启用和配置 OpenTelemetry。

通过 OpenTelemetry (OTel) 导出遥测数据，跟踪整个组织的 Claude Code 使用情况、成本和工具活动。Claude Code 通过标准指标协议将指标作为时间序列数据导出，通过日志/事件协议导出事件，并可选择性地通过 [traces 协议](#追踪beta) 导出分布式追踪。根据您的监控需求配置指标、日志和追踪后端。

## 快速开始

使用环境变量配置 OpenTelemetry：

```bash
# 1. 启用遥测
export CLAUDE_CODE_ENABLE_TELEMETRY=1

# 2. 选择导出器（两者都是可选的 - 仅配置您需要的）
export OTEL_METRICS_EXPORTER=otlp       # 选项：otlp, prometheus, console, none
export OTEL_LOGS_EXPORTER=otlp          # 选项：otlp, console, none

# 3. 配置 OTLP 端点（用于 OTLP 导出器）
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# 4. 设置认证（如果需要）
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"

# 5. 调试用途：缩短导出间隔
export OTEL_METRIC_EXPORT_INTERVAL=10000  # 10 秒（默认：60000ms）
export OTEL_LOGS_EXPORT_INTERVAL=5000     # 5 秒（默认：5000ms）

# 6. 运行 Claude Code
claude
```

默认的导出间隔为指标 60 秒、日志 5 秒。在设置期间，您可能需要使用更短的间隔用于调试目的。请记住在生产使用时重置这些值。

有关完整的配置选项，请参阅 [OpenTelemetry 规范](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)。

## 管理员配置

管理员可以通过[托管设置文件](/zh/settings#settings-files)为所有用户配置 OpenTelemetry 设置。这允许在整个组织范围内集中控制遥测设置。有关设置如何应用的更多信息，请参阅[设置优先级](/zh/settings#settings-precedence)。

托管设置配置示例：

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "grpc",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://collector.example.com:4317",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer example-token"
  }
}
```

托管设置可以通过 MDM（移动设备管理）或其他设备管理解决方案分发。托管设置文件中定义的环境变量具有高优先级，用户无法覆盖。

Claude Code 不会将 `OTEL_*` 环境变量传递给它生成的子进程，包括 Bash 工具、钩子、MCP 服务器和语言服务器。通过 Bash 工具运行的 OpenTelemetry 检测应用程序不会继承 Claude Code 的导出器端点或请求头，因此如果该应用程序需要导出自己的遥测数据，请直接在命令中设置这些变量。

## 配置详情

### 常用配置变量

| 环境变量                                                | 描述                                                                                                                                                                                                                                                                                                                                | 示例值                                                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_ENABLE_TELEMETRY`                         | 启用遥测收集（必需）                                                                                                                                                                                                                                                                                                                  | `1`                                                                                                                             |
| `OTEL_METRICS_EXPORTER`                                | 指标导出器类型，逗号分隔。使用 `none` 禁用                                                                                                                                                                                                                                                                                             | `console`, `otlp`, `prometheus`, `none`                                                                                         |
| `OTEL_LOGS_EXPORTER`                                   | 日志/事件导出器类型，逗号分隔。使用 `none` 禁用                                                                                                                                                                                                                                                                                        | `console`, `otlp`, `none`                                                                                                       |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                          | OTLP 导出器协议，适用于所有信号                                                                                                                                                                                                                                                                                                         | `grpc`, `http/json`, `http/protobuf`                                                                                            |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                          | 所有信号的 OTLP 收集器端点                                                                                                                                                                                                                                                                                                             | `http://localhost:4317`                                                                                                         |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`                  | 指标协议，覆盖通用设置                                                                                                                                                                                                                                                                                                                 | `grpc`, `http/json`, `http/protobuf`                                                                                            |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`                  | OTLP 指标端点，覆盖通用设置                                                                                                                                                                                                                                                                                                            | `http://localhost:4318/v1/metrics`                                                                                              |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`                     | 日志协议，覆盖通用设置                                                                                                                                                                                                                                                                                                                 | `grpc`, `http/json`, `http/protobuf`                                                                                            |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`                     | OTLP 日志端点，覆盖通用设置                                                                                                                                                                                                                                                                                                            | `http://localhost:4318/v1/logs`                                                                                                 |
| `OTEL_EXPORTER_OTLP_HEADERS`                           | OTLP 认证请求头                                                                                                                                                                                                                                                                                                                       | `Authorization=Bearer token`                                                                                                    |
| `OTEL_METRIC_EXPORT_INTERVAL`                          | 导出间隔（毫秒）（默认：60000）                                                                                                                                                                                                                                                                                                        | `5000`, `60000`                                                                                                                 |
| `OTEL_LOGS_EXPORT_INTERVAL`                            | 日志导出间隔（毫秒）（默认：5000）                                                                                                                                                                                                                                                                                                     | `1000`, `10000`                                                                                                                 |
| `OTEL_LOG_USER_PROMPTS`                                | 启用用户提示词内容日志记录（默认：禁用）                                                                                                                                                                                                                                                                                                | `1` 以启用                                                                                                                      |
| `OTEL_LOG_TOOL_DETAILS`                                | 启用工具参数和输入参数在工具事件和追踪 span 属性中的日志记录：Bash 命令、MCP 服务器和工具名称、技能名称以及工具输入。同时在 `user_prompt` 事件上启用自定义、插件和 MCP 命令名称（默认：禁用）                                                                                                                                            | `1` 以启用                                                                                                                      |
| `OTEL_LOG_TOOL_CONTENT`                                | 启用 span 事件中工具输入和输出内容的日志记录（默认：禁用）。需要[追踪](#追踪beta)。内容在 60 KB 处截断                                                                                                                                                                                                                               | `1` 以启用                                                                                                                      |
| `OTEL_LOG_RAW_API_BODIES`                              | 将完整的 Anthropic Messages API 请求和响应 JSON 作为 `api_request_body` / `api_response_body` 日志事件发出（默认：禁用）。请求体包含整个对话历史。启用此选项即表示同意 `OTEL_LOG_USER_PROMPTS`、`OTEL_LOG_TOOL_DETAILS` 和 `OTEL_LOG_TOOL_CONTENT` 会暴露的所有内容                                                                        | `1` 表示内联截断至 60 KB，或 `file:<dir>` 表示未截断的请求体写入磁盘，事件中包含 `body_ref` 指针                                |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`    | 指标时间性偏好（默认：`delta`）。如果后端期望累积时间性，设置为 `cumulative`                                                                                                                                                                                                                                                             | `delta`, `cumulative`                                                                                                           |
| `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS`          | 刷新动态请求头的间隔（默认：1740000ms / 29 分钟）                                                                                                                                                                                                                                                                                      | `900000`                                                                                                                        |

### mTLS 认证

如何为 OTLP 导出器配置客户端证书取决于该信号使用的 OTLP 协议，通过 `OTEL_EXPORTER_OTLP_PROTOCOL` 或每信号覆盖设置。相同的配置适用于指标、日志和追踪。

| 协议                       | 客户端证书变量                                                                                                                                                                       | 通过以下方式信任收集器的 CA          |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
| `http/protobuf`, `http/json` | `CLAUDE_CODE_CLIENT_CERT`、`CLAUDE_CODE_CLIENT_KEY`，以及可选的 `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE`。参见[网络配置](/zh/network-config#mtls-authentication)                                 | `NODE_EXTRA_CA_CERTS`                |
| `grpc`                       | `OTEL_EXPORTER_OTLP_CLIENT_KEY` 和 `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`，或每信号变体如 `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY` 以使用不同的证书                                      | `OTEL_EXPORTER_OTLP_CERTIFICATE`     |

对于 `grpc`，OpenTelemetry SDK 直接读取标准 OTLP 变量，因此设置每信号指标变量的现有配置继续有效。

### 指标基数控制

以下环境变量控制哪些属性包含在指标中以管理基数：

| 环境变量                            | 描述                                                   | 默认值   | 禁用示例 |
| ----------------------------------- | ------------------------------------------------------ | -------- | -------- |
| `OTEL_METRICS_INCLUDE_SESSION_ID`   | 在指标中包含 session.id 属性                           | `true`   | `false`  |
| `OTEL_METRICS_INCLUDE_VERSION`      | 在指标中包含 app.version 属性                          | `false`  | `true`   |
| `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` | 在指标中包含 user.account\_uuid 和 user.account\_id 属性 | `true`   | `false`  |
| `OTEL_METRICS_INCLUDE_ENTRYPOINT`   | 在指标中包含 app.entrypoint 属性                       | `false`  | `true`   |

这些变量有助于控制指标的基数，这会影响指标后端的存储需求和查询性能。较低的基数通常意味着更好的性能和更低的存储成本，但分析数据的粒度也更低。

### 追踪（beta）

分布式追踪导出的 span 将每个用户提示词链接到其触发的 API 请求和工具执行，因此您可以在追踪后端将完整的请求视为单个追踪。

追踪默认关闭。要启用它，设置 `CLAUDE_CODE_ENABLE_TELEMETRY=1` 和 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`，然后设置 `OTEL_TRACES_EXPORTER` 选择 span 发送位置。追踪复用[通用 OTLP 配置](#常用配置变量)的端点、协议、请求头和 [mTLS](#mtls-认证)。

| 环境变量                              | 描述                                                                               | 示例值                             |
| ------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | 启用 span 追踪（必需）。`ENABLE_ENHANCED_TELEMETRY_BETA` 也可接受                    | `1`                                |
| `OTEL_TRACES_EXPORTER`                | 追踪导出器类型，逗号分隔。使用 `none` 禁用                                           | `console`, `otlp`, `none`          |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`  | 追踪协议，覆盖 `OTEL_EXPORTER_OTLP_PROTOCOL`                                        | `grpc`, `http/json`, `http/protobuf` |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`  | OTLP 追踪端点，覆盖 `OTEL_EXPORTER_OTLP_ENDPOINT`                                   | `http://localhost:4318/v1/traces`  |
| `OTEL_TRACES_EXPORT_INTERVAL`         | Span 批量导出间隔（毫秒）（默认：5000）                                               | `1000`, `10000`                    |

Span 默认会编辑用户提示词文本、工具输入详情和工具内容。设置 `OTEL_LOG_USER_PROMPTS=1`、`OTEL_LOG_TOOL_DETAILS=1` 和 `OTEL_LOG_TOOL_CONTENT=1` 以包含它们。

当追踪激活时，Bash 和 PowerShell 子进程会自动继承包含活动工具执行 span 的 W3C 追踪上下文的 `TRACEPARENT` 环境变量。这使得任何读取 `TRACEPARENT` 的子进程可以将其自身的 span 置于同一追踪下，实现通过 Claude 运行的脚本和命令进行端到端分布式追踪。

当追踪激活且 Claude Code 直接连接到 Anthropic API 时，每个模型请求携带设置为 `claude_code.llm_request` span 上下文的 W3C `traceparent` 请求头，API 的 `traceresponse` 请求头被记录为 span 链接。两者共同将 Claude Code 的客户端 span 通过任何合规中间件连接到服务器端追踪。出站 HTTP MCP 请求同样携带 `traceparent`。该请求头不会发送给第三方提供商。

默认情况下，模型和 HTTP MCP 请求上的 `traceparent` 请求头仅在 `ANTHROPIC_BASE_URL` 未设置或指向 Anthropic API 时发送，因为某些代理会拒绝无法识别的请求头。子进程 `TRACEPARENT` 变量由相同的开关控制以保持一致性。如果您通过自定义 `ANTHROPIC_BASE_URL` 代理运行 Claude Code 并希望传播追踪上下文，请设置 `CLAUDE_CODE_PROPAGATE_TRACEPARENT=1`。

在 Agent SDK 和使用 `-p` 启动的非交互式会话中，Claude Code 在开始每个交互 span 时也会从自身环境中读取 `TRACEPARENT` 和 `TRACESTATE`。这允许嵌入进程将其活动的 W3C 追踪上下文传递给子进程，使 Claude Code 的 span 作为调用方分布式追踪的子级出现。交互式会话会忽略传入的 `TRACEPARENT` 以避免意外继承来自 CI 或容器环境的上下文值。

#### Span 层级

每个用户提示词启动一个 `claude_code.interaction` 根 span。API 调用、工具调用和钩子执行记录为其子级。工具 span 有两个子 span：一个用于等待权限决策的时间，一个用于执行本身。当 Agent 工具或旧版 Task 工具生成子代理时，子代理的 API 和工具 span 嵌套在父级的 `claude_code.tool` span 下。

```text
claude_code.interaction
├── claude_code.llm_request
├── claude_code.hook                    (需要详细的 beta 追踪)
└── claude_code.tool
    ├── claude_code.tool.blocked_on_user
    ├── claude_code.tool.execution
    └── (Agent 工具) 子代理 claude_code.llm_request / claude_code.tool span
```

在 Agent SDK 和 `claude -p` 会话中，当环境设置了 `TRACEPARENT` 时，`claude_code.interaction` 本身成为调用方 span 的子级。

#### Span 属性

每个 span 携带[标准属性](#标准属性)加上与其名称匹配的 `span.type` 属性。下表列出了在每个 span 上设置的附加属性。`llm_request`、`tool.execution` 和 `hook` span 在记录失败时设置 OpenTelemetry 状态 `ERROR`；其他 span 始终以状态 `UNSET` 结束。

**`claude_code.interaction`**

| 属性                      | 描述                                            | 受限于                  |
| ------------------------- | ----------------------------------------------- | ----------------------- |
| `user_prompt`             | 提示词文本。除非设置了门控，否则值为 `<REDACTED>` | `OTEL_LOG_USER_PROMPTS` |
| `user_prompt_length`      | 提示词长度（字符数）                              |                         |
| `interaction.sequence`    | 本次会话中交互的从 1 开始的计数器                  |                         |
| `interaction.duration_ms` | 该轮次的挂钟持续时间                              |                         |

**`claude_code.llm_request`**

| 属性                             | 描述                                                                                                               | 受限于 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| `model`                          | 模型标识符                                                                                                          |        |
| `gen_ai.system`                  | 始终为 `anthropic`。OpenTelemetry GenAI 语义规范                                                                     |        |
| `gen_ai.request.model`           | 与 `model` 相同的值。OpenTelemetry GenAI 语义规范                                                                    |        |
| `query_source`                   | 发出请求的子系统，如 `repl_main_thread` 或子代理名称                                                                  |        |
| `agent_id`                       | 发出请求的子代理或队友的标识符。主会话上不存在                                                                         |        |
| `parent_agent_id`                | 生成此代理的代理的标识符。主会话和从中直接生成的代理上不存在                                                            |        |
| `speed`                          | `fast` 或 `normal`                                                                                                  |        |
| `llm_request.context`            | 根据父 span 为 `interaction`、`tool` 或 `standalone`                                                                 |        |
| `duration_ms`                    | 包含重试在内的挂钟持续时间                                                                                           |        |
| `ttft_ms`                        | 首个 token 的时间（毫秒）                                                                                            |        |
| `input_tokens`                   | 来自 API usage 块的输入 token 数量                                                                                   |        |
| `output_tokens`                  | 输出 token 数量                                                                                                     |        |
| `cache_read_tokens`              | 从提示词缓存读取的 token 数量                                                                                        |        |
| `cache_creation_tokens`          | 写入提示词缓存的 token 数量                                                                                          |        |
| `request_id`                     | 来自 `request-id` 响应头的 Anthropic API 请求 ID                                                                     |        |
| `gen_ai.response.id`             | 与 `request_id` 相同的值。OpenTelemetry GenAI 语义规范                                                                |        |
| `client_request_id`              | 最终尝试的客户端生成的 `x-client-request-id`                                                                         |        |
| `attempt`                        | 此请求的总尝试次数                                                                                                   |        |
| `success`                        | `true` 或 `false`                                                                                                   |        |
| `status_code`                    | 请求失败时的 HTTP 状态码                                                                                             |        |
| `error`                          | 请求失败时的错误消息                                                                                                 |        |
| `response.has_tool_call`         | 当响应包含工具使用块时为 `true`                                                                                      |        |
| `stop_reason`                    | API 响应的 `stop_reason`，如 `end_turn`、`tool_use`、`max_tokens`、`stop_sequence`、`pause_turn` 或 `refusal`         |        |
| `gen_ai.response.finish_reasons` | 与 `stop_reason` 相同的值，包装在字符串数组中。OpenTelemetry GenAI 语义规范                                            |        |

每次重试尝试也会记录为 `gen_ai.request.attempt` span 事件，包含 `attempt` 和 `client_request_id` 属性。

**`claude_code.tool`**

| 属性              | 描述                                                                                                           | 受限于                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `tool_name`       | 工具名称                                                                                                        |                         |
| `duration_ms`     | 包含权限等待和执行在内的挂钟持续时间                                                                              |                         |
| `result_tokens`   | 工具结果的近似 token 大小                                                                                        |                         |
| `agent_id`        | 运行工具的子代理或队友的标识符。主会话上不存在                                                                     |                         |
| `parent_agent_id` | 生成此代理的代理的标识符。主会话和从中直接生成的代理上不存在                                                        |                         |
| `file_path`       | Read、Edit 和 Write 工具的目标文件路径                                                                            | `OTEL_LOG_TOOL_DETAILS` |
| `full_command`    | Bash 工具的命令字符串                                                                                            | `OTEL_LOG_TOOL_DETAILS` |
| `skill_name`      | Skill 工具的技能名称                                                                                             | `OTEL_LOG_TOOL_DETAILS` |
| `subagent_type`   | Agent 工具或旧版 Task 工具的子代理类型                                                                            | `OTEL_LOG_TOOL_DETAILS` |

当 `OTEL_LOG_TOOL_CONTENT=1` 时，此 span 还会记录一个 `tool.output` span 事件，其属性包含工具的输入和输出内容，每个属性在 60 KB 处截断。

**`claude_code.tool.blocked_on_user`**

| 属性          | 描述                                                               | 受限于 |
| ------------- | ------------------------------------------------------------------ | ------ |
| `duration_ms` | 等待权限决策所花费的时间                                              |        |
| `decision`    | `accept` 或 `reject`                                               |        |
| `source`      | 决策来源，匹配[工具决策事件](#工具决策事件)                   |        |

**`claude_code.tool.execution`**

| 属性          | 描述                                                                                                                                         | 受限于                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `duration_ms` | 运行工具主体所花费的时间                                                                                                                      |                         |
| `success`     | `true` 或 `false`                                                                                                                            |                         |
| `error`       | 执行失败时的错误类别字符串，如 `Error:ENOENT` 或 `ShellError`。设置了门控时包含完整的错误消息                                                    | `OTEL_LOG_TOOL_DETAILS` |

**`claude_code.hook`**

此 span 仅在详细的 beta 追踪激活时发出，这除了上述追踪导出器配置外还需要 `ENABLE_BETA_TRACING_DETAILED=1` 和 `BETA_TRACING_ENDPOINT`。在交互式 CLI 会话中，这还要求您的组织被列入该功能的白名单。Agent SDK 和非交互式 `-p` 会话不受此限制。当仅设置 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` 时不会发出。

| 属性                     | 描述                                        | 受限于                  |
| ------------------------ | ------------------------------------------- | ----------------------- |
| `hook_event`             | 钩子事件类型，如 `PreToolUse`                |                         |
| `hook_name`              | 完整的钩子名称，如 `PreToolUse:Write`        |                         |
| `num_hooks`              | 执行的匹配钩子命令数量                        |                         |
| `hook_definitions`       | JSON 序列化的钩子配置                        | `OTEL_LOG_TOOL_DETAILS` |
| `duration_ms`            | 所有匹配钩子的挂钟持续时间                    |                         |
| `num_success`            | 成功完成的钩子数量                            |                         |
| `num_blocking`           | 返回阻塞决策的钩子数量                        |                         |
| `num_non_blocking_error` | 未阻塞但失败的钩子数量                        |                         |
| `num_cancelled`          | 完成前被取消的钩子数量                        |                         |

`new_context`、`system_prompt_preview`、`user_system_prompt`、`tool_input` 和 `response.model_output` 等附加内容属性仅在详细的 beta 追踪激活时发出。它们不属于稳定的 span 模式。`user_system_prompt` 还需要 `OTEL_LOG_USER_PROMPTS=1`。它仅携带您通过 `systemPrompt` SDK 选项或 `--system-prompt` 和 `--append-system-prompt` 标志提供的系统提示词文本，在 60 KB 处截断，每个会话发出一次而非每次请求。

### 动态请求头

对于需要动态认证的企业环境，您可以配置脚本动态生成请求头。动态请求头仅适用于 `http/protobuf` 和 `http/json` 协议。`grpc` 导出器仅使用静态的 `OTEL_EXPORTER_OTLP_HEADERS` 值。

#### 设置配置

添加到您的 `.claude/settings.json`：

```json
{
  "otelHeadersHelper": "/bin/generate_opentelemetry_headers.sh"
}
```

该值可以是可执行文件的路径（包含空格的路径也可以），也可以是带参数的 shell 命令行。在 Windows 上，该值始终通过 shell 运行，因此在 JSON 值中为包含空格的路径加上引号。

#### 脚本要求

脚本必须输出有效的 JSON，包含表示 HTTP 请求头的字符串键值对：

```bash
#!/bin/bash
# 示例：多个请求头
echo "{\"Authorization\": \"Bearer $(get-token.sh)\", \"X-API-Key\": \"$(get-api-key.sh)\"}"
```

如果辅助脚本失败或输出不符合这些要求，Claude Code 会在以下位置报告错误：

* `/doctor` 输出
* 调试日志，当使用 [`--debug`](/zh/cli-reference#cli-flags) 运行或在会话中运行 `/debug` 后
* 标准错误输出，在使用 `-p` 启动的非交互式会话中

#### 刷新行为

请求头辅助脚本在启动时运行，此后定期运行以支持 token 刷新。默认情况下，脚本每 29 分钟运行一次。使用 `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` 环境变量自定义间隔。

### 多团队组织支持

拥有多个团队或部门的组织可以使用 `OTEL_RESOURCE_ATTRIBUTES` 环境变量添加自定义属性来区分不同的组：

```bash
# 添加用于团队标识的自定义属性
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=platform,cost_center=eng-123"
```

这些自定义属性将包含在所有指标和事件中，允许您：

* 按团队或部门筛选指标
* 按成本中心跟踪成本
* 创建特定团队的仪表板
* 为特定团队设置告警

**OTEL\_RESOURCE\_ATTRIBUTES 的重要格式要求：**

`OTEL_RESOURCE_ATTRIBUTES` 环境变量使用逗号分隔的 key=value 对，有严格的格式要求：

* **不允许空格**：值不能包含空格。例如，`user.organizationName=My Company` 无效
* **格式**：必须是逗号分隔的 key=value 对：`key1=value1,key2=value2`
* **允许的字符**：仅限 US-ASCII 字符，不包括控制字符、空格、双引号、逗号、分号和反斜杠
* **特殊字符**：超出允许范围的字符必须进行百分比编码

**示例：**

```bash
# ❌ 无效 - 包含空格
export OTEL_RESOURCE_ATTRIBUTES="org.name=John's Organization"

# ✅ 有效 - 使用下划线或驼峰命名代替
export OTEL_RESOURCE_ATTRIBUTES="org.name=Johns_Organization"
export OTEL_RESOURCE_ATTRIBUTES="org.name=JohnsOrganization"

# ✅ 有效 - 如需要可对特殊字符进行百分比编码
export OTEL_RESOURCE_ATTRIBUTES="org.name=John%27s%20Organization"
```

注意：用引号包裹值不会转义空格。例如，`org.name="My Company"` 的结果是字面值 `"My Company"`（包含引号），而不是 `My Company`。

### 配置示例

在运行 `claude` 之前设置这些环境变量。每个代码块展示了不同导出器或部署场景的完整配置：

```bash
# 控制台调试（1 秒间隔）
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=console
export OTEL_METRIC_EXPORT_INTERVAL=1000

# OTLP/gRPC
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# Prometheus
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=prometheus

# 多个导出器
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=console,otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/json

# 指标和日志使用不同的端点/后端
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://metrics.example.com:4318
export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://logs.example.com:4317

# 仅指标（无事件/日志）
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# 仅事件/日志（无指标）
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## 可用指标和事件

### 标准属性

所有指标和事件共享以下标准属性：

| 属性                | 描述                                                                                                      | 控制方式                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `session.id`        | 唯一会话标识符                                                                                              | `OTEL_METRICS_INCLUDE_SESSION_ID`（默认：true）      |
| `app.version`       | 当前 Claude Code 版本                                                                                      | `OTEL_METRICS_INCLUDE_VERSION`（默认：false）        |
| `app.entrypoint`    | 会话的启动方式，如 `cli`、`sdk-cli`、`sdk-ts`、`sdk-py` 或 `claude-vscode`                                  | `OTEL_METRICS_INCLUDE_ENTRYPOINT`（默认：false）     |
| `organization.id`   | 组织 UUID（已认证时）                                                                                        | 可用时始终包含                                       |
| `user.account_uuid` | 账户 UUID（已认证时）                                                                                        | `OTEL_METRICS_INCLUDE_ACCOUNT_UUID`（默认：true）    |
| `user.account_id`   | 与 Anthropic 管理 API 匹配的标签格式的账户 ID（已认证时），如 `user_01BWBeN28...`                             | `OTEL_METRICS_INCLUDE_ACCOUNT_UUID`（默认：true）    |
| `user.id`           | 匿名设备/安装标识符，每个 Claude Code 安装生成一个                                                           | 始终包含                                             |
| `user.email`        | 用户电子邮件地址（通过 OAuth 认证时）                                                                        | 可用时始终包含                                       |
| `terminal.type`     | 终端类型，如 `iTerm.app`、`vscode`、`cursor` 或 `tmux`                                                      | 检测到时始终包含                                     |

事件还包含以下属性。这些属性永远不会附加到指标上，因为它们会导致无界基数：

* `prompt.id`：将用户提示词与所有后续事件关联的 UUID，直到下一个提示词。参见[事件关联属性](#事件关联属性)。
* `workspace.host_paths`：在桌面应用中选择的主机工作区目录，字符串数组。

### 指标

Claude Code 导出以下指标：

| 指标名称                              | 描述                           | 单位   |
| ------------------------------------- | ------------------------------ | ------ |
| `claude_code.session.count`           | 启动的 CLI 会话计数             | count  |
| `claude_code.lines_of_code.count`     | 修改的代码行数计数              | count  |
| `claude_code.pull_request.count`      | 创建的 pull request 数量       | count  |
| `claude_code.commit.count`            | 创建的 git 提交数量            | count  |
| `claude_code.cost.usage`              | Claude Code 会话的成本         | USD    |
| `claude_code.token.usage`             | 使用的 token 数量              | tokens |
| `claude_code.code_edit_tool.decision` | 代码编辑工具权限决策计数        | count  |
| `claude_code.active_time.total`       | 总活跃时间（秒）               | s      |

### 指标详情

每个指标包含上面列出的标准属性。下面标注了具有额外上下文特定属性的指标。

#### 会话计数器

在每个会话开始时递增。

**属性**：

* 所有[标准属性](#标准属性)
* `start_type`：会话的启动方式。`"fresh"`、`"resume"` 或 `"continue"` 之一

#### 代码行数计数器

在添加或删除代码时递增。

**属性**：

* 所有[标准属性](#标准属性)
* `type`：（`"added"`、`"removed"`）

#### Pull request 计数器

在 Claude Code 通过 shell 命令或 MCP 工具创建 pull request 或 merge request 时递增。

**属性**：

* 所有[标准属性](#标准属性)

#### 提交计数器

在通过 Claude Code 创建 git 提交时递增。

**属性**：

* 所有[标准属性](#标准属性)

#### 成本计数器

在每次 API 请求后递增。

**属性**：

* 所有[标准属性](#标准属性)
* `model`：模型标识符（例如 "claude-sonnet-4-6"）
* `query_source`：发出请求的子系统类别。`"main"`、`"subagent"` 或 `"auxiliary"` 之一
* `speed`：当请求使用快速模式时为 `"fast"`。否则不存在
* `effort`：应用于请求的[努力级别](/zh/model-config#adjust-effort-level)：`"low"`、`"medium"`、`"high"`、`"xhigh"` 或 `"max"`。当模型不支持努力级别时不存在。
* `agent.name`：发出请求的子代理类型。内置代理名称和官方市场插件中的代理按原样显示。其他用户定义的代理名称替换为 `"custom"`。当请求不是由命名子代理类型发出时不存在。
* `skill.name`：请求激活的技能，由 Skill 工具、`/` 命令设置，或由生成的子代理继承。内置、捆绑、用户定义和官方市场插件的技能名称按原样显示。第三方插件技能名称替换为 `"third-party"`。当没有技能激活时不存在。
* `plugin.name`：当激活的技能或子代理由插件提供时的所属插件。官方市场插件名称按原样显示。第三方插件名称替换为 `"third-party"`。当技能和子代理都没有所属插件时不存在。
* `marketplace.name`：安装所属插件的市场。仅对官方市场插件发出。否则不存在。
* `mcp_server.name`：产生此请求的轮次中运行了其工具的 MCP 服务器。内置、claude.ai 代理和官方注册表的服务器名称按原样显示。用户配置的服务器名称替换为 `"custom"`。当没有 MCP 工具运行时不存在。
* `mcp_tool.name`：产生此请求的轮次中运行的 MCP 工具，编辑规则与 `mcp_server.name` 相同。当没有 MCP 工具运行时不存在。

#### Token 计数器

在每次 API 请求后递增。

**属性**：

* 所有[标准属性](#标准属性)
* `type`：（`"input"`、`"output"`、`"cacheRead"`、`"cacheCreation"`）
* `model`：模型标识符（例如 "claude-sonnet-4-6"）
* `query_source`：发出请求的子系统类别。`"main"`、`"subagent"` 或 `"auxiliary"` 之一
* `speed`：当请求使用快速模式时为 `"fast"`。否则不存在
* `effort`：应用于请求的[努力级别](/zh/model-config#adjust-effort-level)。详情参见[成本计数器](#成本计数器)。
* `agent.name`、`skill.name`、`plugin.name`、`marketplace.name`、`mcp_server.name`、`mcp_tool.name`：请求的技能、插件、代理和 MCP 归因。定义和编辑行为参见[成本计数器](#成本计数器)。

#### 代码编辑工具决策计数器

在用户接受或拒绝 Edit、Write 或 NotebookEdit 工具使用时递增。

**属性**：

* 所有[标准属性](#标准属性)
* `tool_name`：工具名称（`"Edit"`、`"Write"`、`"NotebookEdit"`）
* `decision`：用户决策（`"accept"`、`"reject"`）
* `source`：决策来源。`"config"`、`"hook"`、`"user_permanent"`、`"user_temporary"`、`"user_abort"` 或 `"user_reject"` 之一。各值含义参见[工具决策事件](#工具决策事件)。
* `language`：被编辑文件的编程语言，如 `"TypeScript"`、`"Python"`、`"JavaScript"` 或 `"Markdown"`。无法识别的文件扩展名返回 `"unknown"`。

#### 活跃时间计数器

跟踪实际活跃使用 Claude Code 的时间，不包括空闲时间。此指标在用户交互（输入、阅读响应）和 CLI 处理（工具执行、AI 响应生成）期间递增。

**属性**：

* 所有[标准属性](#标准属性)
* `type`：`"user"` 表示键盘交互，`"cli"` 表示工具执行和 AI 响应

### 事件

Claude Code 通过 OpenTelemetry 日志/事件导出以下事件（当配置了 `OTEL_LOGS_EXPORTER` 时）：

#### 事件关联属性

当用户提交提示词时，Claude Code 可能会进行多次 API 调用并运行多个工具。`prompt.id` 属性允许您将所有这些事件关联回触发它们的单个提示词。

| 属性        | 描述                                                                |
| ----------- | ------------------------------------------------------------------- |
| `prompt.id` | UUID v4 标识符，链接处理单个用户提示词时产生的所有事件                 |

要跟踪单个提示词触发的所有活动，请按特定的 `prompt.id` 值筛选事件。这将返回 user\_prompt 事件、任何 api\_request 事件以及处理该提示词时发生的任何 tool\_result 事件。

`prompt.id` 被有意排除在指标之外，因为每个提示词都会生成一个唯一的 ID，这将创建不断增长的时间序列数量。仅将其用于事件级分析和审计跟踪。

#### 用户提示词事件

在用户提交提示词时记录。

**事件名称**：`claude_code.user_prompt`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"user_prompt"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `prompt_length`：提示词长度
* `prompt`：提示词内容（默认编辑，通过 `OTEL_LOG_USER_PROMPTS=1` 启用）
* `command_name`：当提示词调用命令时的命令名称。内置和捆绑的命令名称如 `compact` 或 `debug` 按原样发出；别名如 `reset` 按输入方式发出而非规范名称。自定义、插件和 MCP 命令名称折叠为 `custom` 或 `mcp`，除非设置了 `OTEL_LOG_TOOL_DETAILS=1`
* `command_source`：当存在时命令的来源：`builtin`、`custom` 或 `mcp`。插件提供的命令报告为 `custom`

#### 工具结果事件

在工具完成执行时记录。如果工具调用被拒绝则不发出；拒绝参见[工具决策事件](#工具决策事件)。

**事件名称**：`claude_code.tool_result`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"tool_result"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `tool_name`：工具名称
* `tool_use_id`：此工具调用的唯一标识符。与传递给钩子的 `tool_use_id` 匹配，允许在 OTel 事件和钩子捕获的数据之间进行关联。
* `success`：`"true"` 或 `"false"`
* `duration_ms`：执行时间（毫秒）
* `error_type`：工具失败时的错误类别字符串，如 `"Error:ENOENT"` 或 `"ShellError"`
* `error`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：工具失败时的完整错误消息
* `decision_type`：始终为 `"accept"`，因为此事件仅在工具运行后发出（被拒绝的调用不会产生工具结果）
* `decision_source`：权限决策来源。`"config"`、`"hook"`、`"user_permanent"` 或 `"user_temporary"` 之一。各值含义参见[工具决策事件](#工具决策事件)。仅拒绝的来源 `"user_abort"` 和 `"user_reject"` 永远不会出现在此事件上。
* `tool_input_size_bytes`：JSON 序列化的工具输入大小（字节）
* `tool_result_size_bytes`：工具结果大小（字节）
* `mcp_server_scope`：MCP 服务器范围标识符（用于 MCP 工具）
* `tool_parameters`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：包含工具特定参数的 JSON 字符串：
  * Bash 工具：包含 `bash_command`、`full_command`、`timeout`、`description`、`dangerouslyDisableSandbox` 和 `git_commit_id`（提交 SHA，当 `git commit` 命令成功时）
  * WorkspaceBash 工具：包含 `bash_command`、`full_command`、`timeout`
  * MCP 工具：包含 `mcp_server_name`、`mcp_tool_name`
  * Skill 工具：包含 `skill_name`
  * Agent 工具或旧版 Task 工具：包含 `subagent_type`
* `tool_input`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：JSON 序列化的工具参数。超过 512 个字符的单个值会被截断，完整负载限制在约 4K 个字符。适用于所有工具包括 MCP 工具。

#### API 请求事件

每次向 Claude 发送 API 请求时记录。

**事件名称**：`claude_code.api_request`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"api_request"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `model`：使用的模型（例如 "claude-sonnet-4-6"）
* `cost_usd`：以美元计的估计成本
* `duration_ms`：请求持续时间（毫秒）
* `input_tokens`：输入 token 数量
* `output_tokens`：输出 token 数量
* `cache_read_tokens`：从缓存读取的 token 数量
* `cache_creation_tokens`：用于缓存创建的 token 数量
* `request_id`：来自响应 `request-id` 头的 Anthropic API 请求 ID，如 `"req_011..."`。仅当 API 返回时存在。
* `speed`：`"fast"` 或 `"normal"`，指示快速模式是否激活
* `query_source`：发出请求的子系统，如 `"repl_main_thread"`、`"compact"` 或子代理名称
* `effort`：应用于请求的[努力级别](/zh/model-config#adjust-effort-level)：`"low"`、`"medium"`、`"high"`、`"xhigh"` 或 `"max"`。当模型不支持努力级别时不存在。
* `agent.name`、`skill.name`、`plugin.name`、`marketplace.name`、`mcp_server.name`、`mcp_tool.name`：请求的技能、插件、代理和 MCP 归因。定义和编辑行为参见[成本计数器](#成本计数器)。

#### API 错误事件

当向 Claude 的 API 请求失败时记录。

**事件名称**：`claude_code.api_error`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"api_error"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `model`：使用的模型（例如 "claude-sonnet-4-6"）
* `error`：错误消息
* `status_code`：HTTP 状态码（数字）。非 HTTP 错误（如连接失败）时不存在。
* `duration_ms`：请求持续时间（毫秒）
* `attempt`：总尝试次数，包括初始请求（`1` 表示未发生重试）
* `request_id`：来自响应 `request-id` 头的 Anthropic API 请求 ID，如 `"req_011..."`。仅当 API 返回时存在。
* `speed`：`"fast"` 或 `"normal"`，指示快速模式是否激活
* `query_source`：发出请求的子系统，如 `"repl_main_thread"`、`"compact"` 或子代理名称
* `effort`：应用于请求的[努力级别](/zh/model-config#adjust-effort-level)。当模型不支持努力级别时不存在。
* `agent.name`、`skill.name`、`plugin.name`、`marketplace.name`、`mcp_server.name`、`mcp_tool.name`：请求的技能、插件、代理和 MCP 归因。定义和编辑行为参见[成本计数器](#成本计数器)。

#### API 请求体事件

当设置了 `OTEL_LOG_RAW_API_BODIES` 时，每次 API 请求尝试记录一次。每次尝试发出一个事件，因此使用调整参数的重试各自产生自己的事件。

**事件名称**：`claude_code.api_request_body`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"api_request_body"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `body`：JSON 序列化的 Messages API 请求参数（系统提示词、消息、工具等），在 60 KB 处截断。先前助手轮次中的扩展思考内容被编辑。仅在内联模式下发出（`OTEL_LOG_RAW_API_BODIES=1`）。
* `body_ref`：包含未截断请求体的 `<dir>/<uuid>.request.json` 文件的绝对路径。仅在文件模式下发出（`OTEL_LOG_RAW_API_BODIES=file:<dir>`）。
* `body_length`：未截断的请求体长度。`OTEL_LOG_RAW_API_BODIES=file:<dir>` 时为 UTF-8 字节，`=1` 时为 UTF-16 代码单元
* `body_truncated`：内联截断发生时为 `"true"`。文件模式和未发生截断时不存在。
* `model`：来自请求参数的模型标识符
* `query_source`：发出请求的子系统（例如 `"compact"`）

#### API 响应体事件

当设置了 `OTEL_LOG_RAW_API_BODIES` 时，每次成功的 API 响应记录一次。

**事件名称**：`claude_code.api_response_body`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"api_response_body"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `body`：JSON 序列化的 Messages API 响应（id、内容块、usage、停止原因），在 60 KB 处截断。扩展思考内容被编辑。仅在内联模式下发出（`OTEL_LOG_RAW_API_BODIES=1`）。
* `body_ref`：包含未截断响应体的 `<dir>/<request_id>.response.json` 文件的绝对路径。仅在文件模式下发出（`OTEL_LOG_RAW_API_BODIES=file:<dir>`）。
* `body_length`：未截断的响应体长度。`OTEL_LOG_RAW_API_BODIES=file:<dir>` 时为 UTF-8 字节，`=1` 时为 UTF-16 代码单元
* `body_truncated`：内联截断发生时为 `"true"`。文件模式和未发生截断时不存在。
* `model`：模型标识符
* `query_source`：发出请求的子系统
* `request_id`：来自响应 `request-id` 头的 Anthropic API 请求 ID，如 `"req_011..."`。仅当 API 返回时存在。

#### 工具决策事件

在做出工具权限决策（接受/拒绝）时记录。

**事件名称**：`claude_code.tool_decision`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"tool_decision"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `tool_name`：工具名称（例如 "Read"、"Edit"、"Write"、"NotebookEdit"）
* `tool_use_id`：此工具调用的唯一标识符。与传递给钩子的 `tool_use_id` 匹配，允许在 OTel 事件和钩子捕获的数据之间进行关联。
* `decision`：`"accept"` 或 `"reject"`
* `source`：决策来源：
  * `"config"`：基于项目设置、用户个人设置中的允许或拒绝规则、企业管理策略、`--allowedTools` 或 `--disallowedTools` 标志、活动权限模式、同一交互式 CLI 会话中早期提示词的会话范围授权，或因为工具本身是安全的而自动决定，无需提示。事件不指示匹配了这些来源中的哪一个。
  * `"hook"`：`PreToolUse` 或 `PermissionRequest` 钩子返回了决策。
  * `"user_permanent"`：当用户在权限提示中选择"是，并且不再询问..."时发出，这会将允许规则保存到其个人设置中。在交互式 CLI 中，仅对该选择本身发出此值；后来匹配保存规则的调用发出 `"config"`。在 Agent SDK 或非交互式 `-p` 会话中，初始选择和后续规则匹配都发出 `"user_permanent"`。视为接受。
  * `"user_temporary"`：当用户在权限提示中选择"是"进行一次性批准，或在文件编辑或读取提示中选择"在本次会话期间..."选项时发出。在交互式 CLI 中，仅对该选择本身发出此值；后来被该会话范围授权允许的调用发出 `"config"`。在 Agent SDK 或非交互式 `-p` 会话中，选择和后续匹配都发出 `"user_temporary"`。视为接受。
  * `"user_abort"`：当用户在未回答的情况下关闭权限提示时发出。视为拒绝。
  * `"user_reject"`：当用户在提示中选择"否"时发出。在交互式 CLI 中，仅对该选择本身发出此值；匹配用户个人设置中拒绝规则的调用发出 `"config"`。在 Agent SDK 或非交互式 `-p` 会话中，匹配个人设置中拒绝规则的调用发出 `"user_reject"`。视为拒绝。
* `tool_parameters`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：包含工具特定参数的 JSON 字符串。与[工具结果事件](#工具结果事件)相同的格式，减去执行后字段如 `git_commit_id`。当权限决策通过 `updatedInput` 重写工具输入时，对于接受的调用，值可能与 `tool_result` 不同。当 `decision` 为 `"reject"` 时，使用此属性查看被拒绝的命令。
  * Bash 工具：包含 `bash_command`、`full_command`、`timeout`、`description`、`dangerouslyDisableSandbox`
  * WorkspaceBash 工具：包含 `bash_command`、`full_command`、`timeout`
  * MCP 工具：包含 `mcp_server_name`、`mcp_tool_name`
  * Skill 工具：包含 `skill_name`
  * Agent 工具或旧版 Task 工具：包含 `subagent_type`

#### 权限模式更改事件

在权限模式更改时记录，例如通过 `Shift+Tab` 切换、退出计划模式或自动模式门控检查。

**事件名称**：`claude_code.permission_mode_changed`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"permission_mode_changed"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `from_mode`：先前的权限模式，例如 `"default"`、`"plan"`、`"acceptEdits"`、`"auto"` 或 `"bypassPermissions"`
* `to_mode`：新的权限模式
* `trigger`：导致更改的原因。`"shift_tab"`、`"exit_plan_mode"`、`"auto_gate_denied"` 或 `"auto_opt_in"` 之一。当转换源自 SDK 或桥接时不存在。

#### 认证事件

在 `/login` 或 `/logout` 完成时记录。

**事件名称**：`claude_code.auth`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"auth"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `action`：`"login"` 或 `"logout"`
* `success`：`"true"` 或 `"false"`
* `auth_method`：认证方法，如 `"oauth"`
* `error_category`：操作失败时的分类错误类型。原始错误消息永远不会包含
* `status_code`：操作因 HTTP 错误失败时的 HTTP 状态码（字符串）

#### MCP 服务器连接事件

在 MCP 服务器连接、断开或连接失败时记录。

**事件名称**：`claude_code.mcp_server_connection`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"mcp_server_connection"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `status`：`"connected"`、`"failed"` 或 `"disconnected"`
* `transport_type`：服务器传输方式，如 `"stdio"`、`"sse"` 或 `"http"`
* `server_scope`：服务器配置的范围，如 `"user"`、`"project"` 或 `"local"`
* `duration_ms`：连接尝试持续时间（毫秒）
* `error_code`：连接失败时的错误代码
* `server_name`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：配置的服务器名称
* `error`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：连接失败时的完整错误消息

#### 内部错误事件

在 Claude Code 捕获意外内部错误时记录。仅记录错误类名称和 errno 风格的代码。错误消息和堆栈跟踪永远不会包含。在 Bedrock、Vertex 或 Foundry 上运行或设置了 `DISABLE_ERROR_REPORTING` 时不发出此事件。

**事件名称**：`claude_code.internal_error`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"internal_error"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `error_name`：错误类名称，如 `"TypeError"` 或 `"SyntaxError"`
* `error_code`：Node.js errno 代码，如错误上存在时的 `"ENOENT"`

#### 插件安装事件

在插件安装完成时记录，来自 `claude plugin install` CLI 命令和交互式 `/plugin` UI。

**事件名称**：`claude_code.plugin_installed`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"plugin_installed"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `marketplace.is_official`：如果市场是官方 Anthropic 市场则为 `"true"`，否则为 `"false"`
* `install.trigger`：`"cli"` 或 `"ui"`
* `plugin.name`：安装的插件名称。对于第三方市场，仅当 `OTEL_LOG_TOOL_DETAILS=1` 时包含
* `plugin.version`：在市场条目中声明的插件版本。对于第三方市场，仅当 `OTEL_LOG_TOOL_DETAILS=1` 时包含
* `marketplace.name`：安装插件的市场。对于第三方市场，仅当 `OTEL_LOG_TOOL_DETAILS=1` 时包含

#### 插件加载事件

在会话开始时为每个启用的插件记录一次。使用此事件来清点您的整个集群中哪些插件处于活动状态，作为记录安装操作本身的 `plugin_installed` 的补充。

**事件名称**：`claude_code.plugin_loaded`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"plugin_loaded"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `plugin.name`：插件名称。对于官方市场和内置捆绑包之外的插件，除非 `OTEL_LOG_TOOL_DETAILS=1`，否则值为 `"third-party"`
* `marketplace.name`：安装插件的市场（已知时）。在与 `plugin.name` 相同的条件下编辑为 `"third-party"`
* `plugin.version`：来自插件清单的版本。仅当名称未被编辑且清单声明了版本时包含
* `plugin.scope`：插件的来源类别：`"official"`、`"org"`、`"user-local"` 或 `"default-bundle"`
* `enabled_via`：插件启用方式：`"default-enable"`、`"org-policy"`、`"seed-mount"` 或 `"user-install"`
* `plugin_id_hash`：插件名称和市场的确定性哈希，仅发送到您配置的导出器。允许您计算整个集群中加载了多少不同的第三方插件，而不记录它们的名称
* `has_hooks`：插件是否贡献钩子
* `has_mcp`：插件是否贡献 MCP 服务器
* `skill_path_count`：插件声明的技能目录数量
* `command_path_count`：插件声明的命令目录数量
* `agent_path_count`：插件声明的代理目录数量

#### 技能激活事件

在调用技能时记录，无论是 Claude 通过 Skill 工具调用还是您将其作为 `/` 命令运行。

**事件名称**：`claude_code.skill_activated`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"skill_activated"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `skill.name`：技能名称。对于用户定义和第三方插件技能，除非 `OTEL_LOG_TOOL_DETAILS=1`，否则值为占位符 `"custom_skill"`
* `invocation_trigger`：技能的触发方式（`"user-slash"`、`"claude-proactive"` 或 `"nested-skill"`）
* `skill.source`：技能的加载来源（例如 `"bundled"`、`"userSettings"`、`"projectSettings"`、`"plugin"`）
* `plugin.name`（当 `OTEL_LOG_TOOL_DETAILS=1` 或插件来自官方市场时）：当技能由插件提供时的所属插件名称
* `marketplace.name`（当 `OTEL_LOG_TOOL_DETAILS=1` 或插件来自官方市场时）：当技能由插件提供时所属插件的安装市场

#### @ 提及事件

在 Claude Code 解析提示词中的 `@` 提及时记录。并非每次提及都会发出事件：权限拒绝、超大文件、PDF 引用附件和目录列表失败等提前退出路径会在不记录的情况下返回。

**事件名称**：`claude_code.at_mention`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"at_mention"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `mention_type`：提及类型（`"file"`、`"directory"`、`"agent"`、`"mcp_resource"`）
* `success`：提及是否成功解析（`"true"` 或 `"false"`）

#### API 重试耗尽事件

当 API 请求在多次尝试后失败时记录一次。与最终的 `api_error` 事件一起发出。

**事件名称**：`claude_code.api_retries_exhausted`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"api_retries_exhausted"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `model`：使用的模型
* `error`：最终错误消息
* `status_code`：HTTP 状态码（数字）。非 HTTP 错误时不存在。
* `total_attempts`：总尝试次数
* `total_retry_duration_ms`：所有尝试的总挂钟时间
* `speed`：`"fast"` 或 `"normal"`

#### 钩子注册事件

在会话开始时为每个配置的钩子记录一次。使用此事件来清点您的整个集群中哪些钩子处于活动状态，作为每次执行的 `hook_execution_start` 和 `hook_execution_complete` 事件的补充。

**事件名称**：`claude_code.hook_registered`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"hook_registered"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `hook_event`：钩子事件类型，如 `"PreToolUse"` 或 `"PostToolUse"`
* `hook_type`：钩子实现类型：`"command"`、`"prompt"`、`"mcp_tool"`、`"http"` 或 `"agent"`
* `hook_source`：钩子定义位置：`"userSettings"`、`"projectSettings"`、`"localSettings"`、`"flagSettings"`、`"policySettings"` 或 `"pluginHook"`
* `hook_matcher`（当 `OTEL_LOG_TOOL_DETAILS=1` 时）：钩子配置中的匹配器字符串（设置了时）
* `plugin.name`（当 `hook_source` 为 `"pluginHook"` 时）：贡献插件的名称。对于官方市场和内置捆绑包之外的插件，除非 `OTEL_LOG_TOOL_DETAILS=1`，否则值为 `"third-party"`
* `plugin_id_hash`（当 `hook_source` 为 `"pluginHook"` 时）：插件名称和市场的确定性哈希，仅发送到您配置的导出器。允许您计算不同的贡献插件而不记录它们的名称

#### 钩子执行开始事件

在一个或多个钩子开始为钩子事件执行时记录。

**事件名称**：`claude_code.hook_execution_start`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"hook_execution_start"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `hook_event`：钩子事件类型，如 `"PreToolUse"` 或 `"PostToolUse"`
* `hook_name`：包含匹配器的完整钩子名称，如 `"PreToolUse:Write"`
* `num_hooks`：匹配的钩子命令数量
* `managed_only`：当仅允许托管策略钩子时为 `"true"`
* `hook_source`：`"policySettings"` 或 `"merged"`
* `hook_definitions`：JSON 序列化的钩子配置。仅当详细的 beta 追踪和 `OTEL_LOG_TOOL_DETAILS=1` 都启用时包含

#### 钩子执行完成事件

在钩子事件的所有钩子完成时记录。

**事件名称**：`claude_code.hook_execution_complete`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"hook_execution_complete"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `hook_event`：钩子事件类型
* `hook_name`：包含匹配器的完整钩子名称
* `num_hooks`：匹配的钩子命令数量
* `num_success`：成功完成的数量
* `num_blocking`：返回阻塞决策的数量
* `num_non_blocking_error`：未阻塞但失败的数量
* `num_cancelled`：完成前被取消的数量
* `total_duration_ms`：所有匹配钩子的挂钟持续时间
* `managed_only`：当仅允许托管策略钩子时为 `"true"`
* `hook_source`：`"policySettings"` 或 `"merged"`
* `hook_definitions`：JSON 序列化的钩子配置。仅当详细的 beta 追踪和 `OTEL_LOG_TOOL_DETAILS=1` 都启用时包含

#### 钩子插件指标事件

当官方市场插件钩子发出每次调用指标时记录。仅从官方 Anthropic 市场安装的插件可以发出这些。第三方市场插件和用户配置的钩子不会发出此事件。使用此事件从您自己的可观测性栈中监控插件行为，如发现率、成本和持续时间。

**事件名称**：`claude_code.hook_plugin_metrics`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"hook_plugin_metrics"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `plugin_id`：`<name>@<marketplace>` 形式的插件标识符
* `hook_event`：发出指标的钩子事件类型
* 最多 20 个插件发出的指标键。名称匹配 `^[a-z][a-z0-9_]{0,39}$`。值为布尔或数字。

#### 压缩事件

在对话压缩完成时记录。

**事件名称**：`claude_code.compaction`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"compaction"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `trigger`：`"auto"` 或 `"manual"`
* `success`：`"true"` 或 `"false"`
* `duration_ms`：压缩持续时间
* `pre_tokens`：压缩前的近似 token 数量
* `post_tokens`：压缩后的近似 token 数量
* `error`：压缩失败时的错误消息
* `precompute_reuse`：仅当 `trigger` 为 `"manual"` 时设置。自动压缩可以在上下文窗口填满之前在后台准备摘要，此属性记录 `/compact` 是否重用了该准备好的摘要。`"hit"` 表示已重用；`"miss_custom_instructions"`、`"miss_hook"` 和 `"miss_not_ready"` 给出了计算新摘要的原因。{/* min-version: 2.1.153 */}需要 Claude Code v2.1.153 或更高版本

#### 反馈调查事件

在会话质量调查显示或回答时记录。有关调查收集的内容和控制方式，参见[会话质量调查](/zh/data-usage#session-quality-surveys)。

**事件名称**：`claude_code.feedback_survey`

**属性**：

* 所有[标准属性](#标准属性)
* `event.name`：`"feedback_survey"`
* `event.timestamp`：ISO 8601 时间戳
* `event.sequence`：会话内事件排序的单调递增计数器
* `event_type`：调查生命周期事件，例如 `"appeared"`、`"responded"` 或 `"transcript_prompt_appeared"`
* `appearance_id`：链接为一个调查实例发出的事件的唯一 ID
* `survey_type`：产生事件的调查。`"session"` 是"Claude 表现如何？"评分提示
* `response`：用户在 `responded` 事件上的选择
* `enabled_via_override`：当设置了 [`CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL`](/zh/env-vars) 时为 `true`。作为布尔值而非字符串发出。出现在 `session` 调查事件上。在此属性上筛选以确认覆盖在您的整个集群中已应用

## 解释指标和事件数据

导出的指标和事件支持一系列分析：

### 使用监控

| 指标                                                          | 分析机会                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `claude_code.token.usage`                                     | 按 `type`（输入/输出）、用户、团队、模型、`skill.name`、`plugin.name` 或 `agent.name` 分解   |
| `claude_code.session.count`                                   | 跟踪一段时间内的采用和参与度                                                                 |
| `claude_code.lines_of_code.count`                             | 通过跟踪代码添加/删除来衡量生产力                                                            |
| `claude_code.commit.count` 和 `claude_code.pull_request.count` | 了解对开发工作流程的影响                                                                     |

### 成本监控

`claude_code.cost.usage` 指标有助于：

* 跟踪团队或个人的使用趋势
* 识别高使用量会话以进行优化
* 通过 `skill.name`、`plugin.name` 和 `agent.name` 属性将支出归因于特定技能、插件或子代理类型

成本指标是近似值。有关官方计费数据，请参考您的 API 提供商（Claude Console、Amazon Bedrock 或 Google Cloud Vertex）。

### 告警和细分

需要考虑的常见告警：

* 成本飙升
* 异常 token 消耗
* 特定用户的高会话量

所有指标都可以按 `user.account_uuid`、`user.account_id`、`organization.id`、`session.id`、`model` 和 `app.version` 进行细分。

### 检测重试耗尽

Claude Code 在内部重试失败的 API 请求，仅在放弃后发出单个 `claude_code.api_error` 事件，因此该事件本身就是该请求的终止信号。中间的重试尝试不会作为单独的事件记录。

事件上的 `attempt` 属性记录了总共进行了多少次尝试。大于 `CLAUDE_CODE_MAX_RETRIES`（默认 `10`）的值表示请求在瞬态错误上耗尽了所有重试。较低的值表示不可重试的错误，如 `400` 响应。

要区分已恢复的会话和停滞的会话，按 `session.id` 分组事件并检查错误之后是否存在后续的 `api_request` 事件。

### 事件分析

事件数据提供了对 Claude Code 交互的详细洞察：

**工具使用模式**：分析工具结果事件以识别：

* 最常用的工具
* 工具成功率
* 平均工具执行时间
* 按工具类型的错误模式

**性能监控**：跟踪 API 请求持续时间和工具执行时间以识别性能瓶颈。

## 审计安全事件

OpenTelemetry 事件是 Claude Code 活动的审计数据源。每个事件携带身份属性，将工具调用、MCP 活动和权限决策关联回触发它们的用户，OTLP 日志导出器可以将这些事件传送到任何具有 OTLP 接收器的安全信息和事件管理 (SIEM) 平台，或转发到您的 SIEM 的 OpenTelemetry Collector。

### 将操作归因于用户

每个事件上的[标准属性](#标准属性)包含已认证用户的身份：使用 Claude 账户登录时的 `user.email`、`user.account_uuid`、`user.account_id` 和 `organization.id`，加上安装范围的 `user.id` 和每会话的 `session.id`。

因此，MCP 工具调用、Bash 命令和文件编辑都归因于启动会话的开发者。Claude Code 不会使用单独的服务账户运行；每个事件上记录的身份是开发者自己的 Claude 账户。

当 Claude Code 使用直接 API key 认证，或针对 Bedrock、Vertex AI 或 Microsoft Foundry 认证时，会话中没有 Claude 账户，仅填充 `user.id` 和 `session.id`。在这些部署中，通过 `OTEL_RESOURCE_ATTRIBUTES` 自己附加用户身份，通过[托管设置](#管理员配置)文件或启动包装器为每个用户设置：

```bash
export OTEL_RESOURCE_ATTRIBUTES="enduser.id=jdoe@example.com,enduser.directory_id=S-1-5-21-..."
```

### 审计 MCP 活动

要捕获 MCP 服务器活动的完整调用详情，启用日志导出器并设置 `OTEL_LOG_TOOL_DETAILS=1`。然后每个 MCP 操作产生结构化事件，携带服务器名称、工具名称和调用参数以及标准身份属性：

| 事件                    | MCP 记录内容                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mcp_server_connection` | 服务器连接、断开和连接失败，包含 `server_name`、`transport_type`、`server_scope` 和错误详情                                                                                         |
| `tool_result`           | 每次 MCP 工具调用，包含 `tool_name` 和 `mcp_server_scope`、包含 `mcp_server_name` 和 `mcp_tool_name` 的 `tool_parameters` 负载，以及包含调用参数的 `tool_input` 负载                   |
| `tool_decision`         | 调用是否被允许或拒绝，决策来自配置、钩子还是用户，以及包含 `mcp_server_name` 和 `mcp_tool_name` 的 `tool_parameters` 负载                                                            |

没有 `OTEL_LOG_TOOL_DETAILS` 时，这些事件会丢弃识别详情：

* `tool_result`：保留 `tool_name` 和 `mcp_server_scope`，省略 `mcp_server_name`、`mcp_tool_name` 和参数
* `tool_decision`：保留 `tool_name`，省略 `tool_parameters`
* `mcp_server_connection`：省略 `server_name` 和错误消息

### 将安全问题映射到事件

构建检测规则时，查找您要监控的信号，并在后端查询相应的事件和属性：

| 信号                                    | 事件                                                                                    | 关键属性                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 工具调用被允许或拒绝，以及由谁            | `tool_decision`                                                                         | `decision`、`source`、`tool_name`、`tool_parameters`          |
| 权限模式升级                              | `permission_mode_changed`                                                               | `from_mode`、`to_mode`、`trigger`                             |
| 策略钩子阻止了操作                         | `hook_execution_complete`                                                               | `hook_event`、`num_blocking`                                  |
| 登录、注销和认证失败                       | `auth`                                                                                  | `action`、`success`、`error_category`                         |
| MCP 服务器连接或失败                       | `mcp_server_connection`                                                                 | `status`、`server_name`、`error_code`                         |
| 插件安装及其来源                           | `plugin_installed`                                                                      | `plugin.name`、`marketplace.name`、`marketplace.is_official`  |
| 运行的命令和涉及的文件                     | `tool_result`（已执行）或 `tool_decision`（已拒绝），需设置 `OTEL_LOG_TOOL_DETAILS=1`    | `tool_parameters`；`tool_input`（仅 `tool_result`）           |

Claude Code 仅发出原始事件流。异常检测、基线建立、跨会话关联和告警是您的 SIEM 或可观测性后端的职责。

### 将事件发送到 SIEM

将 `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` 指向您的 SIEM 的 OTLP 接收器，或指向转发到您的 SIEM 原生摄取 API 的 OpenTelemetry Collector。以下托管设置示例仅导出事件，并为 MCP 和 Bash 审计启用了完整的工具详情：

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_LOG_TOOL_DETAILS": "1",
    "OTEL_EXPORTER_OTLP_LOGS_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_LOGS_ENDPOINT": "https://siem.example.com:4318/v1/logs",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer your-siem-token"
  }
}
```

## 后端考量

您选择的指标、日志和追踪后端决定了您可以执行的分析类型：

### 指标

* **时间序列数据库（例如 Prometheus）**：速率计算、聚合指标
* **列式存储（例如 ClickHouse）**：复杂查询、唯一用户分析
* **全功能可观测性平台（例如 Honeycomb、Datadog）**：高级查询、可视化、告警

### 事件/日志

* **日志聚合系统（例如 Elasticsearch、Loki）**：全文搜索、日志分析
* **列式存储（例如 ClickHouse）**：结构化事件分析
* **全功能可观测性平台（例如 Honeycomb、Datadog）**：指标和事件之间的关联

### 追踪

选择支持分布式追踪存储和 span 关联的后端：

* **分布式追踪系统（例如 Jaeger、Zipkin、Grafana Tempo）**：span 可视化、请求瀑布图、延迟分析
* **全功能可观测性平台（例如 Honeycomb、Datadog）**：追踪搜索以及与指标和日志的关联

对于需要每日/每周/每月活跃用户 (DAU/WAU/MAU) 指标的组织，考虑支持高效唯一值查询的后端。

## 服务信息

所有指标和事件都带有以下资源属性导出：

* `service.name`：`claude-code`
* `service.version`：当前 Claude Code 版本
* `os.type`：操作系统类型（例如 `linux`、`darwin`、`windows`）
* `os.version`：操作系统版本字符串
* `host.arch`：主机架构（例如 `amd64`、`arm64`）
* `wsl.version`：WSL 版本号（仅在 Windows Subsystem for Linux 上运行时存在）
* 计量器名称：`com.anthropic.claude_code`

## ROI 测量资源

有关衡量 Claude Code 投资回报率的综合指南，包括遥测设置、成本分析、生产力指标和自动化报告，请参阅 [Claude Code ROI 测量指南](https://github.com/anthropics/claude-code-monitoring-guide)。该仓库提供即用型 Docker Compose 配置、Prometheus 和 OpenTelemetry 设置，以及与 Linear 等工具集成的生产力报告模板。

## 安全和隐私

* 向您的后端导出 OpenTelemetry 是可选加入的，需要显式配置。有关 Anthropic 单独的运营遥测及其禁用方式，参见[数据使用](/zh/data-usage#telemetry-services)
* 原始文件内容和代码片段不包含在指标或事件中。追踪 span 是单独的数据路径：参见下面的 `OTEL_LOG_TOOL_CONTENT` 条目
* 通过 OAuth 认证时，`telemetry 属性中包含 `user.email`。如果这对您的组织有顾虑，请与您的遥测后端合作过滤或编辑此字段
* 用户提示词内容默认不收集。仅记录提示词长度。要包含提示词内容，设置 `OTEL_LOG_USER_PROMPTS=1`
* 工具输入参数默认不记录。要包含它们，设置 `OTEL_LOG_TOOL_DETAILS=1`。此数据仅发送到您配置的 OTEL 端点，永远不会发送到 Anthropic。参数可能仍包含敏感值，因此请根据需要配置遥测后端过滤或编辑这些属性。启用时：
  * `tool_result` 和 `tool_decision` 事件包含带有 Bash 命令、MCP 服务器和工具名称以及技能名称的 `tool_parameters` 属性。`full_command` 等字段不截断发出
  * `tool_result` 事件还包含带有文件路径、URL、搜索模式和其他参数的 `tool_input` 属性。超过 512 个字符的单个值会被截断，总大小限制在约 4K 个字符
  * `user_prompt` 事件包含自定义、插件和 MCP 命令的逐字 `command_name`
  * 追踪 span 包含相同的 `tool_input` 属性和从输入派生的属性如 `file_path`，截断规则与 `tool_input` 相同
* 工具输入和输出内容默认不记录在追踪 span 中。要包含它，设置 `OTEL_LOG_TOOL_CONTENT=1`。启用时，span 事件包含完整的工具输入和输出内容，每个 span 在 60 KB 处截断。这可能包含来自 Read 工具结果的原始文件内容和 Bash 命令输出。请根据需要配置遥测后端过滤或编辑这些属性
* 原始 Anthropic Messages API 请求和响应体默认不记录。要包含它们，设置 `OTEL_LOG_RAW_API_BODIES`。使用 `=1` 时，每次 API 调用发出 `api_request_body` 和 `api_response_body` 日志事件，其 `body` 属性是 JSON 序列化的负载，在 60 KB 处截断。使用 `=file:<dir>` 时，未截断的请求体写入该目录下的 `.request.json` 和 `.response.json` 文件，事件携带 `body_ref` 路径而非内联请求体。使用日志收集器或 sidecar 而非遥测流来传输目录。在这两种模式下，请求体包含完整的对话历史（系统提示词、每个先前的用户和助手轮次、工具结果），因此启用此选项即表示同意其他 `OTEL_LOG_*` 内容标志会暴露的所有内容。Claude 的扩展思考内容始终从这些请求体中编辑，无论其他设置如何

## 在 Amazon Bedrock 上监控 Claude Code

有关 Amazon Bedrock 的详细 Claude Code 使用监控指南，请参阅 [Claude Code 监控实施 (Bedrock)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock/blob/main/assets/docs/MONITORING.md)。
