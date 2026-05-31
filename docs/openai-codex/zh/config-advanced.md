# 高级配置

当你需要对提供商、策略和集成进行更多控制时，请使用这些选项。快速入门请参阅[配置基础](https://developers.openai.com/codex/config-basic)。

有关项目指引、可复用能力、自定义斜杠命令、子代理工作流和集成的背景信息，请参阅[自定义](https://developers.openai.com/codex/concepts/customization)。配置键请参阅[配置参考](https://developers.openai.com/codex/config-reference)。

## 配置文件

配置文件允许你保存命名的配置层，并在 CLI 中切换。当你传入 `--profile profile-name` 时，Codex 会加载 `~/.codex/config.toml`，然后叠加 `~/.codex/profile-name.config.toml`。配置文件名可以包含字母、数字、连字符和下划线。

为每个配置文件创建单独的 TOML 文件。在配置文件中使用顶层配置键；不要将它们嵌套在 `[profiles.profile-name]` 下。

```toml
# ~/.codex/deep-review.config.toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
model_catalog_json = "/Users/me/.codex/model-catalogs/deep-review.json"
```

```shell
codex --profile deep-review
codex exec --profile deep-review "review this change"
```

由于配置文件是在基础用户配置之上、项目和 CLI 配置之下的一个层，它只需要包含与基础配置不同的值。配置文件也可以覆盖 `model_catalog_json`；当两个文件都设置了该值时，Codex 使用配置文件中的值。

在 Codex 0.134.0 及更高版本中，`--profile` 不再从 `config.toml` 读取 `[profiles.profile-name]`，顶层的 `profile = "profile-name"` 选择器也不再支持。请将旧版配置文件设置移至 `~/.codex/profile-name.config.toml`，然后从 `config.toml` 中删除对应的 `[profiles.profile-name]` 表和 `profile = "profile-name"` 选择器。

## CLI 中的一次性覆盖

除了编辑 `~/.codex/config.toml` 外，你还可以在单次运行中通过 CLI 覆盖配置：

- 优先使用专用标志（例如 `--model`）。
- 当需要覆盖任意键时，使用 `-c` / `--config`。

示例：

```shell
# 专用标志
codex --model gpt-5.4

# 通用键/值覆盖（值是 TOML，不是 JSON）
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

注意事项：

- 键可以使用点表示法来设置嵌套值（例如 `mcp_servers.context7.enabled=false`）。
- `--config` 的值会被解析为 TOML。如有疑问，请用引号包裹值，以免 shell 在空格处分割。
- 如果值无法解析为 TOML，Codex 会将其视为字符串。

## 配置和状态存储位置

Codex 将本地状态存储在 `CODEX_HOME` 下（默认为 `~/.codex`）。

你可能会看到的常见文件：

- `config.toml`（你的本地配置）
- `auth.json`（如果你使用基于文件的凭证存储）或你的操作系统钥匙链/密钥环
- `history.jsonl`（如果启用了历史持久化）
- 其他用户状态，如日志和缓存

认证详情（包括凭证存储模式）请参阅[认证](https://developers.openai.com/codex/auth)。完整配置键列表请参阅[配置参考](https://developers.openai.com/codex/config-reference)。

关于提交到仓库或系统路径中的共享默认值、规则和技能，请参阅[团队配置](https://developers.openai.com/codex/enterprise/admin-setup#team-config)。

如果你只是需要将内置 OpenAI 提供商指向 LLM 代理、路由器或启用了数据驻留的项目，请在 `config.toml` 中设置 `openai_base_url`，而不是定义新的提供商。这会更改内置 `openai` 提供商的基础 URL，无需单独的 `model_providers.<id>` 条目。

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

## 项目配置文件 (`.codex/config.toml`)

除了用户配置外，Codex 还会从仓库内的 `.codex/config.toml` 文件中读取项目范围的覆盖。Codex 从项目根目录遍历到当前工作目录，加载找到的每个 `.codex/config.toml`。如果多个文件定义了相同的键，距离工作目录最近的文件优先。

出于安全考虑，Codex 仅在项目受信任时才加载项目范围的配置文件。如果项目不受信任，Codex 会忽略项目 `.codex/` 层，包括 `.codex/config.toml`、项目本地钩子和项目本地规则。用户层和系统层仍然独立加载。

项目配置中的相对路径（例如 `model_instructions_file`）是相对于包含 `config.toml` 的 `.codex/` 文件夹解析的。

项目配置文件不能覆盖会重定向凭证、更改主机拥有的应用请求元数据、更改提供商认证、选择配置文件或运行机器本地通知/遥测命令的设置。Codex 会在项目本地 `.codex/config.toml` 中忽略以下键，并在检测到时打印启动警告：`openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel`。请在用户级 `~/.codex/config.toml` 中设置提供商、通知和遥测键；使用 `--profile profile-name` 和 `~/.codex/profile-name.config.toml` 选择配置文件。

## 钩子

Codex 还可以从活动配置层旁边的 `hooks.json` 文件或 `config.toml` 中的内联 `[hooks]` 表加载生命周期钩子。

实际上，最有用的四个位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`

项目本地钩子仅在项目 `.codex/` 层受信任时加载。用户级钩子独立于项目信任状态。

内联 TOML 钩子使用与 `hooks.json` 相同的事件结构：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

如果单个层同时包含 `hooks.json` 和内联 `[hooks]`，Codex 会同时加载两者并发出警告。建议每层只使用一种表示方式。

有关当前事件列表、输入字段、输出行为和限制，请参阅[钩子](https://developers.openai.com/codex/hooks)。

## 代理角色（`config.toml` 中的 `[agents]`）

关于子代理角色配置（`config.toml` 中的 `[agents]`），请参阅[子代理](https://developers.openai.com/codex/subagents)。

## 项目根目录检测

Codex 通过从工作目录向上遍历来发现项目配置（例如 `.codex/` 层和 `AGENTS.md`），直到到达项目根目录。

默认情况下，Codex 将包含 `.git` 的目录视为项目根目录。要自定义此行为，请在 `config.toml` 中设置 `project_root_markers`：

```toml
# 当目录包含以下任一标记时，将其视为项目根目录。
project_root_markers = [".git", ".hg", ".sl"]
```

设置 `project_root_markers = []` 可跳过搜索父目录，并将当前工作目录视为项目根目录。

## 自定义模型提供商

模型提供商定义了 Codex 如何连接到模型（基础 URL、线路 API、认证和可选 HTTP 头）。自定义提供商不能复用保留的内置提供商 ID：`openai`、`ollama` 和 `lmstudio`。

定义额外的提供商并将 `model_provider` 指向它们：

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"

[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

需要时添加请求头：

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

当提供商需要 Codex 从外部凭证帮助器获取 bearer token 时，使用命令支持的认证：

```toml
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
wire_api = "responses"

[model_providers.proxy.auth]
command = "/usr/local/bin/fetch-codex-token"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

认证命令不接收 `stdin`，必须将 token 打印到 stdout。Codex 会修剪周围空白，将空 token 视为错误，并在 `refresh_interval_ms` 时主动刷新；设置 `refresh_interval_ms = 0` 可仅在认证重试后刷新。不要将 `[model_providers.<id>.auth]` 与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。

### Amazon Bedrock 提供商

Codex 包含内置的 `amazon-bedrock` 模型提供商。直接将其设置为 `model_provider`；与自定义提供商不同，此内置提供商仅支持嵌套的 AWS 配置文件和区域覆盖。

```toml
model_provider = "amazon-bedrock"
model = "<bedrock-model-id>"

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

如果省略 `profile`，Codex 使用标准 AWS 凭证链。设置 `region` 为应处理请求的受支持 Bedrock 区域。

## OSS 模式（本地提供商）

当你传入 `--oss` 时，Codex 可以在本地"开源"提供商（例如 Ollama 或 LM Studio）上运行。如果你传入 `--oss` 但未指定提供商，Codex 默认使用 `oss_provider`。

```toml
# 使用 `--oss` 时的默认本地提供商
oss_provider = "ollama" # 或 "lmstudio"
```

## Azure 提供商和每提供商调优

```toml
[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

要更改内置 OpenAI 提供商的基础 URL，请使用 `openai_base_url`；不要创建 `[model_providers.openai]`，因为你无法覆盖内置提供商 ID。

## 使用数据驻留的 ChatGPT 客户

启用了[数据驻留](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt)创建的项目可以创建模型提供商，使用[正确的前缀](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency)更新 base_url。

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # 将 'us' 替换为域名前缀
```

## 模型推理、详细程度和限制

```toml
model_reasoning_summary = "none"          # 禁用摘要
model_verbosity = "low"                   # 缩短响应
model_supports_reasoning_summaries = true # 强制推理
model_context_window = 128000             # 上下文窗口大小
```

`model_verbosity` 仅适用于使用 Responses API 的提供商。Chat Completions 提供商会忽略此设置。

## 审批策略和沙箱模式

选择审批严格程度（影响 Codex 何时暂停）和沙箱级别（影响文件/网络访问）。

编辑 `config.toml` 时需要注意的操作细节，请参阅[常见沙箱和审批组合](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)、[可写根目录中的受保护路径](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots)和[网络访问](https://developers.openai.com/codex/agent-approvals-security#network-access)。

关于同时配置文件系统和网络访问的 beta 权限配置文件，请参阅[权限](https://developers.openai.com/codex/permissions)。

你还可以使用细粒度审批策略（`approval_policy = { granular = { ... } }`）来允许或自动拒绝特定提示词类别。当你希望某些情况使用正常交互审批，但希望其他情况（如 `request_permissions` 或技能脚本提示词）自动以关闭方式失败时，这很有用。

设置 `approvals_reviewer = "auto_review"` 可将符合条件的交互审批请求路由到自动审核。这会更改审核者，而不是沙箱边界。

使用 `[auto_review].policy` 设置本地审核者策略指令。托管的 `guardian_policy_config` 优先级更高。

```toml
approval_policy = "untrusted"   # 其他选项：on-request、never 或 { granular = { ... } }
approvals_reviewer = "user"     # 或 "auto_review" 进行自动审核
sandbox_mode = "workspace-write"
allow_login_shell = false       # 可选加固：禁止 shell 工具使用登录 shell

# 示例细粒度审批策略：
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }

[sandbox_workspace_write]
exclude_tmpdir_env_var = false  # 允许 $TMPDIR
exclude_slash_tmp = false       # 允许 /tmp
writable_roots = ["/Users/YOU/.pyenv/shims"]
network_access = false          # 选择启用出站网络

[auto_review]
policy = """
Use your organization's automatic review policy.
"""
```

### 命名权限配置文件

关于内置配置文件、自定义配置文件语法以及完整的文件系统和网络配置模型，请参阅[权限](https://developers.openai.com/codex/permissions)。

完整键列表和需求约束请参阅[配置参考](https://developers.openai.com/codex/config-reference)和[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)。

在 workspace-write 模式下，某些环境会将 `.git/` 和 `.codex/` 保持为只读，即使工作区的其余部分可写。这就是为什么 `git commit` 等命令在沙箱外运行仍可能需要审批。如果你希望 Codex 跳过特定命令（例如阻止在沙箱外执行 `git commit`），请使用[规则](/codex/rules)。

完全禁用沙箱（仅在你的环境已经隔离进程时使用）：

```toml
sandbox_mode = "danger-full-access"
```

## Shell 环境策略

`shell_environment_policy` 控制 Codex 将哪些环境变量传递给它启动的任何子进程（例如，运行模型提出的工具命令时）。从干净启动开始（`inherit = "none"`）或使用精简集（`inherit = "core"`），然后叠加排除、包含和覆盖，以避免泄露密钥，同时仍提供任务所需的路径、键或标志。

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

模式是不区分大小写的通配符（`*`、`?`、`[A-Z]`）；`ignore_default_excludes = false` 会在你的 include/exclude 运行之前保留自动的 KEY/SECRET/TOKEN 过滤器。

## MCP 服务器

配置详情请参阅专门的 [MCP 文档](https://developers.openai.com/codex/mcp)。

## 可观测性和遥测

启用 OpenTelemetry (OTel) 日志导出以跟踪 Codex 运行（API 请求、SSE/事件、提示词、工具审批/结果）。默认禁用；通过 `[otel]` 选择启用：

```toml
[otel]
environment = "staging"   # 默认为 "dev"
exporter = "none"         # 设置为 otlp-http 或 otlp-grpc 以发送事件
log_user_prompt = false   # 除非明确启用，否则编辑用户提示词
```

选择导出器：

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

如果 `exporter = "none"`，Codex 记录事件但不发送任何内容。导出器异步批处理并在关闭时刷新。事件元数据包括服务名、CLI 版本、环境标签、会话 ID、模型、沙箱/审批设置和每事件字段（参见[配置参考](https://developers.openai.com/codex/config-reference)）。

### 发出的内容

Codex 为运行和工具使用发出结构化日志事件。代表性事件类型包括：

- `codex.conversation_starts`（模型、推理设置、沙箱/审批策略）
- `codex.api_request`（尝试、状态/成功、持续时间和错误详情）
- `codex.sse_event`（流式事件类型、成功/失败、持续时间，以及 `response.completed` 时的 token 计数）
- `codex.websocket_request` 和 `codex.websocket_event`（请求持续时间加上每消息类型/成功/错误）
- `codex.user_prompt`（长度；除非明确启用，否则内容被编辑）
- `codex.tool_decision`（批准/拒绝以及决策来自配置还是用户）
- `codex.tool_result`（持续时间、成功、输出片段）

### 发出的 OTel 指标

当 OTel 指标管道启用时，Codex 为 API、流式和工具活动发出计数器和持续时间直方图。

以下每个指标还包含默认元数据标签：`auth_mode`、`originator`、`session_source`、`model` 和 `app.version`。

| 指标                                  | 类型      | 字段                | 描述                                                          |
| ------------------------------------- | --------- | ------------------- | ------------------------------------------------------------- |
| `codex.api_request`                   | counter   | `status`, `success` | 按 HTTP 状态和成功/失败统计的 API 请求计数。                  |
| `codex.api_request.duration_ms`       | histogram | `status`, `success` | API 请求持续时间（毫秒）。                                    |
| `codex.sse_event`                     | counter   | `kind`, `success`   | 按事件类型和成功/失败统计的 SSE 事件计数。                    |
| `codex.sse_event.duration_ms`         | histogram | `kind`, `success`   | SSE 事件处理持续时间（毫秒）。                                |
| `codex.websocket.request`             | counter   | `success`           | 按成功/失败统计的 WebSocket 请求计数。                        |
| `codex.websocket.request.duration_ms` | histogram | `success`           | WebSocket 请求持续时间（毫秒）。                              |
| `codex.websocket.event`               | counter   | `kind`, `success`   | 按类型和成功/失败统计的 WebSocket 消息/事件计数。             |
| `codex.websocket.event.duration_ms`   | histogram | `kind`, `success`   | WebSocket 消息/事件处理持续时间（毫秒）。                     |
| `codex.tool.call`                     | counter   | `tool`, `success`   | 按工具名称和成功/失败统计的工具调用计数。                     |
| `codex.tool.call.duration_ms`         | histogram | `tool`, `success`   | 按工具名称和结果统计的工具执行持续时间（毫秒）。              |

有关遥测的安全和隐私指导，请参阅[安全](https://developers.openai.com/codex/agent-approvals-security#monitoring-and-telemetry)。

### 指标

默认情况下，Codex 会定期向 OpenAI 发送少量匿名使用和健康数据。这有助于检测 Codex 何时无法正常工作，并显示正在使用的功能和配置选项，以便 Codex 团队专注于最重要的事情。这些指标不包含任何个人身份信息 (PII)。指标收集独立于 OTel 日志/追踪导出。

如果你想在机器上完全禁用 Codex 各界面的指标收集，请在配置中设置分析标志：

```toml
[analytics]
enabled = false
```

每个指标包含其自身的字段以及以下默认上下文字段。

#### 默认上下文字段（适用于每个事件/指标）

- `auth_mode`：`swic` | `api` | `unknown`。
- `model`：使用的模型名称。
- `app.version`：Codex 版本。

#### 指标目录

每个指标包含必填字段加上上述默认上下文字段。以下指标名称省略了 `codex.` 前缀。
大多数指标名称集中在 `codex-rs/otel/src/metrics/names.rs` 中；在该文件之外发出的特定功能指标也包含在此处。
如果指标包含 `tool` 字段，它反映的是使用的内部工具（例如 `apply_patch` 或 `shell`），不包含 `codex` 尝试应用的实际 shell 命令或补丁。

#### 运行时和模型传输

| 指标                                              | 类型      | 字段                 | 描述                                                     |
| ------------------------------------------------- | --------- | -------------------- | -------------------------------------------------------- |
| `api_request`                                     | counter   | `status`, `success`  | 按 HTTP 状态和成功/失败统计的 API 请求计数。             |
| `api_request.duration_ms`                         | histogram | `status`, `success`  | API 请求持续时间（毫秒）。                               |
| `sse_event`                                       | counter   | `kind`, `success`    | 按事件类型和成功/失败统计的 SSE 事件计数。               |
| `sse_event.duration_ms`                           | histogram | `kind`, `success`    | SSE 事件处理持续时间（毫秒）。                           |
| `websocket.request`                               | counter   | `success`            | 按成功/失败统计的 WebSocket 请求计数。                   |
| `websocket.request.duration_ms`                   | histogram | `success`            | WebSocket 请求持续时间（毫秒）。                         |
| `websocket.event`                                 | counter   | `kind`, `success`    | 按类型和成功/失败统计的 WebSocket 消息/事件计数。        |
| `websocket.event.duration_ms`                     | histogram | `kind`, `success`    | WebSocket 消息/事件处理持续时间（毫秒）。                |
| `responses_api_overhead.duration_ms`              | histogram |                      | 来自 WebSocket 响应的 Responses API 开销计时。           |
| `responses_api_inference_time.duration_ms`        | histogram |                      | 来自 WebSocket 响应的 Responses API 推理计时。           |
| `responses_api_engine_iapi_ttft.duration_ms`      | histogram |                      | Responses API 引擎 IAPI 首 token 时间计时。              |
| `responses_api_engine_service_ttft.duration_ms`   | histogram |                      | Responses API 引擎服务首 token 时间计时。                |
| `responses_api_engine_iapi_tbt.duration_ms`       | histogram |                      | Responses API 引擎 IAPI token 间隔时间计时。             |
| `responses_api_engine_service_tbt.duration_ms`    | histogram |                      | Responses API 引擎服务 token 间隔时间计时。              |
| `transport.fallback_to_http`                      | counter   | `from_wire_api`      | WebSocket 到 HTTP 回退计数。                             |
| `remote_models.fetch_update.duration_ms`          | histogram |                      | 获取远程模型定义的时间。                                 |
| `remote_models.load_cache.duration_ms`            | histogram |                      | 加载远程模型缓存的时间。                                 |
| `startup_prewarm.duration_ms`                     | histogram | `status`             | 按结果统计的启动预热持续时间。                           |
| `startup_prewarm.age_at_first_turn_ms`            | histogram | `status`             | 第一个真实轮次解析时的启动预热时间。                     |
| `cloud_requirements.fetch.duration_ms`            | histogram |                      | 工作区托管的云需求获取持续时间。                         |
| `cloud_requirements.fetch_attempt`                | counter   | 见注释               | 工作区托管的云需求获取尝试。                             |
| `cloud_requirements.fetch_final`                  | counter   | 见注释               | 最终工作区托管的云需求获取结果。                         |
| `cloud_requirements.load`                         | counter   | `trigger`, `outcome` | 工作区托管的云需求加载结果。                             |

`cloud_requirements.fetch_attempt` 指标包含 `trigger`、`attempt`、`outcome` 和 `status_code` 字段。`cloud_requirements.fetch_final` 指标包含 `trigger`、`outcome`、`reason`、`attempt_count` 和 `status_code` 字段。

#### 轮次和工具活动

| 指标                                   | 类型      | 字段                                                                      | 描述                                                                                                   |
| -------------------------------------- | --------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `turn.e2e_duration_ms`                 | histogram |                                                                           | 完整轮次的端到端时间。                                                                                 |
| `turn.ttft.duration_ms`                | histogram |                                                                           | 轮次的首 token 时间。                                                                                  |
| `turn.ttfm.duration_ms`                | histogram |                                                                           | 轮次的首个模型输出项时间。                                                                             |
| `turn.network_proxy`                   | counter   | `active`, `tmp_mem_enabled`                                               | 托管网络代理是否在该轮次处于活动状态。                                                                 |
| `turn.memory`                          | counter   | `read_allowed`, `feature_enabled`, `config_use_memories`, `has_citations` | 每轮次内存读取可用性和内存引用使用。                                                                   |
| `turn.tool.call`                       | histogram | `tmp_mem_enabled`                                                         | 轮次中的工具调用次数。                                                                                 |
| `turn.token_usage`                     | histogram | `token_type`, `tmp_mem_enabled`                                           | 按 token 类型统计的每轮次 token 使用量（`total`、`input`、`cached_input`、`output` 或 `reasoning_output`）。 |
| `tool.call`                            | counter   | `tool`, `success`                                                         | 按工具名称和成功/失败统计的工具调用计数。                                                              |
| `tool.call.duration_ms`                | histogram | `tool`, `success`                                                         | 按工具名称和结果统计的工具执行持续时间（毫秒）。                                                       |
| `tool.unified_exec`                    | counter   | `tty`                                                                     | 按 TTY 模式统计的统一执行工具调用。                                                                    |
| `approval.requested`                   | counter   | `tool`, `approved`                                                        | 工具审批请求结果（`approved`、`approved_with_amendment`、`approved_for_session`、`denied`、`abort`）。   |
| `mcp.call`                             | counter   | 见注释                                                                    | MCP 工具调用结果。                                                                                     |
| `mcp.call.duration_ms`                 | histogram | 见注释                                                                    | MCP 工具调用持续时间。                                                                                 |
| `mcp.tools.list.duration_ms`           | histogram | `cache`                                                                   | MCP 工具列表持续时间，包括缓存命中/未命中状态。                                                        |
| `mcp.tools.fetch_uncached.duration_ms` | histogram |                                                                           | 缓存未命中的 MCP 工具获取持续时间。                                                                    |
| `mcp.tools.cache_write.duration_ms`    | histogram |                                                                           | Codex Apps MCP 工具缓存写入持续时间。                                                                  |
| `hooks.run`                            | counter   | `hook_name`, `source`, `status`                                           | 按钩子名称、来源和状态统计的钩子运行计数。                                                             |
| `hooks.run.duration_ms`                | histogram | `hook_name`, `source`, `status`                                           | 钩子运行持续时间（毫秒）。                                                                             |

`mcp.call` 和 `mcp.call.duration_ms` 指标包含 `status`；正常工具调用发出时还包含 `tool`，以及可用时的 `connector_id` 和 `connector_name`。被阻止的 Codex Apps MCP 调用可能仅发出包含 `status` 的 `mcp.call`。

#### 线程、任务和功能

| 指标                              | 类型      | 字段                  | 描述                                                           |
| --------------------------------- | --------- | --------------------- | -------------------------------------------------------------- |
| `feature.state`                   | counter   | `feature`, `value`    | 与默认值不同的功能值（每个非默认值发出一行）。                 |
| `status_line`                     | counter   |                       | 使用配置的状态行启动的会话。                                   |
| `model_warning`                   | counter   |                       | 发送给模型的警告。                                             |
| `thread.started`                  | counter   | `is_git`              | 创建的新线程，按工作目录是否在 Git 仓库中标记。                |
| `conversation.turn.count`         | counter   |                       | 每个线程的用户/助手轮次，在线程结束时记录。                    |
| `thread.fork`                     | counter   | `source`              | 通过分叉现有线程创建的新线程。                                 |
| `thread.rename`                   | counter   |                       | 线程重命名。                                                   |
| `thread.side`                     | counter   | `source`              | 创建的旁路对话。                                               |
| `thread.skills.enabled_total`     | histogram |                       | 新线程启用的技能数量。                                         |
| `thread.skills.kept_total`        | histogram |                       | 提示词渲染后保留的启用技能数量。                               |
| `thread.skills.truncated`         | histogram |                       | 技能渲染是否截断了启用技能列表（`1` 或 `0`）。                 |
| `task.compact`                    | counter   | `type`                | 按类型（`remote` 或 `local`）统计的压缩次数，包括手动和自动。  |
| `task.review`                     | counter   |                       | 触发的审核次数。                                               |
| `task.undo`                       | counter   |                       | 触发的撤销操作次数。                                           |
| `task.user_shell`                 | counter   |                       | 用户 shell 操作次数（例如 TUI 中的 `!`）。                     |
| `shell_snapshot`                  | counter   | 见注释                | shell 快照是否成功。                                           |
| `shell_snapshot.duration_ms`      | histogram | `success`             | shell 快照耗时。                                               |
| `skill.injected`                  | counter   | `status`, `skill`     | 按技能统计的技能注入结果。                                     |
| `plugins.startup_sync`            | counter   | `transport`, `status` | 精选插件启动同步尝试。                                         |
| `plugins.startup_sync.final`      | counter   | `transport`, `status` | 最终精选插件启动同步结果。                                     |
| `multi_agent.spawn`               | counter   | `role`                | 按角色统计的代理生成。                                         |
| `multi_agent.resume`              | counter   |                       | 代理恢复。                                                     |
| `multi_agent.nickname_pool_reset` | counter   |                       | 代理昵称池重置。                                               |

`shell_snapshot` 指标包含 `success`，失败时包含 `failure_reason`。

#### 内存和本地状态

| 指标                           | 类型      | 字段                      | 描述                                                  |
| ------------------------------ | --------- | ------------------------- | ----------------------------------------------------- |
| `memory.phase1`                | counter   | `status`                  | 按状态统计的内存阶段 1 作业计数。                     |
| `memory.phase1.e2e_ms`         | histogram |                           | 内存阶段 1 的端到端持续时间。                         |
| `memory.phase1.output`         | counter   |                           | 内存阶段 1 写入的输出。                               |
| `memory.phase1.token_usage`    | histogram | `token_type`              | 按 token 类型统计的内存阶段 1 token 使用量。          |
| `memory.phase2`                | counter   | `status`                  | 按状态统计的内存阶段 2 作业计数。                     |
| `memory.phase2.e2e_ms`         | histogram |                           | 内存阶段 2 的端到端持续时间。                         |
| `memory.phase2.input`          | counter   |                           | 内存阶段 2 的输入计数。                               |
| `memory.phase2.token_usage`    | histogram | `token_type`              | 按 token 类型统计的内存阶段 2 token 使用量。          |
| `memories.usage`               | counter   | `kind`, `tool`, `success` | 按类型、工具和成功/失败统计的内存使用。               |
| `external_agent_config.detect` | counter   | 见注释                    | 按迁移项类型统计的外部代理配置检测。                  |
| `external_agent_config.import` | counter   | 见注释                    | 按迁移项类型统计的外部代理配置导入。                  |
| `db.backfill`                  | counter   | `status`                  | 初始状态 DB 回填结果（`upserted`、`failed`）。        |
| `db.backfill.duration_ms`      | histogram | `status`                  | 初始状态 DB 回填持续时间。                            |
| `db.error`                     | counter   | `stage`                   | 状态 DB 操作期间的错误。                              |

`external_agent_config.detect` 和 `external_agent_config.import` 指标包含 `migration_type`；技能迁移还包含 `skills_count`。

#### Windows 沙箱

| 指标                                             | 类型      | 字段                                      | 描述                                              |
| ------------------------------------------------ | --------- | ----------------------------------------- | ------------------------------------------------- |
| `windows_sandbox.setup_success`                  | counter   | `originator`, `mode`                      | Windows 沙箱设置成功。                            |
| `windows_sandbox.setup_failure`                  | counter   | `originator`, `mode`                      | Windows 沙箱设置失败。                            |
| `windows_sandbox.setup_duration_ms`              | histogram | `result`, `originator`, `mode`            | Windows 沙箱设置持续时间。                        |
| `windows_sandbox.elevated_setup_success`         | counter   |                                           | 提升权限的 Windows 沙箱设置成功。                 |
| `windows_sandbox.elevated_setup_failure`         | counter   | 见注释                                    | 提升权限的 Windows 沙箱设置失败。                 |
| `windows_sandbox.elevated_setup_canceled`        | counter   | 见注释                                    | 取消的提升权限 Windows 沙箱设置尝试。             |
| `windows_sandbox.elevated_setup_duration_ms`     | histogram | `result`                                  | 提升权限的 Windows 沙箱设置持续时间。             |
| `windows_sandbox.elevated_prompt_shown`          | counter   |                                           | 显示的提升权限沙箱设置提示。                      |
| `windows_sandbox.elevated_prompt_accept`         | counter   |                                           | 接受的提升权限沙箱设置提示。                      |
| `windows_sandbox.elevated_prompt_use_legacy`     | counter   |                                           | 用户在提升权限提示中选择了旧版沙箱。              |
| `windows_sandbox.elevated_prompt_quit`           | counter   |                                           | 用户从提升权限提示中退出。                        |
| `windows_sandbox.fallback_prompt_shown`          | counter   |                                           | 显示的回退沙箱提示。                              |
| `windows_sandbox.fallback_retry_elevated`        | counter   |                                           | 用户从回退提示中重试提升权限设置。                |
| `windows_sandbox.fallback_use_legacy`            | counter   |                                           | 用户从回退提示中选择了旧版沙箱。                  |
| `windows_sandbox.fallback_prompt_quit`           | counter   |                                           | 用户从回退提示中退出。                            |
| `windows_sandbox.legacy_setup_preflight_failed`  | counter   | 见注释                                    | 旧版 Windows 沙箱设置预检失败。                   |
| `windows_sandbox.setup_elevated_sandbox_command` | counter   |                                           | 调用的提升权限沙箱设置命令。                      |
| `windows_sandbox.createprocessasuserw_failed`    | counter   | `error_code`, `path_kind`, `exe`, `level` | Windows `CreateProcessAsUserW` 失败。             |

提升权限设置失败指标在 Windows 设置失败详情可用时包含 `code` 和 `message`，从共享设置路径发出时可能包含 `originator`。`windows_sandbox.legacy_setup_preflight_failed` 指标从共享设置路径发出时包含 `originator`，但回退提示预检失败可能不包含任何字段。

### 反馈控制

默认情况下，Codex 允许用户通过 `/feedback` 发送反馈。要在机器上禁用 Codex 各界面的反馈收集，请更新你的配置：

```toml
[feedback]
enabled = false
```

禁用后，`/feedback` 会显示禁用消息，Codex 会拒绝反馈提交。

### 隐藏或显示推理事件

如果你想减少嘈杂的"推理"输出（例如在 CI 日志中），可以将其抑制：

```toml
hide_agent_reasoning = true
```

如果你想在模型发出原始推理内容时将其显示：

```toml
show_raw_agent_reasoning = true
```

仅在你的工作流可以接受时才启用原始推理。某些模型/提供商（如 `gpt-oss`）不发出原始推理；在这种情况下，此设置没有可见效果。

## 通知

使用 `notify` 在 Codex 发出支持的事件（目前仅 `agent-turn-complete`）时触发外部程序。这对于桌面通知、聊天 webhook、CI 更新或内置 TUI 通知未涵盖的任何旁路警报非常有用。

```toml
notify = ["python3", "/path/to/notify.py"]
```

响应 `agent-turn-complete` 的示例 `notify.py`（截断）：

```python
#!/usr/bin/env python3
import json, subprocess, sys

def main() -> int:
    notification = json.loads(sys.argv[1])
    if notification.get("type") != "agent-turn-complete":
        return 0
    title = f"Codex: {notification.get('last-assistant-message', 'Turn Complete!')}"
    message = " ".join(notification.get("input-messages", []))
    subprocess.check_output([
        "terminal-notifier",
        "-title", title,
        "-message", message,
        "-group", "codex-" + notification.get("thread-id", ""),
        "-activate", "com.googlecode.iterm2",
    ])
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

该脚本接收一个 JSON 参数。常见字段包括：

- `type`（目前为 `agent-turn-complete`）
- `thread-id`（会话标识符）
- `turn-id`（轮次标识符）
- `cwd`（工作目录）
- `input-messages`（导致该轮次的用户消息）
- `last-assistant-message`（最后一条助手消息文本）

将脚本放在磁盘上的某个位置，并将 `notify` 指向它。

#### `notify` 与 `tui.notifications` 的区别

- `notify` 运行外部程序（适用于 webhook、桌面通知器、CI 钩子）。
- `tui.notifications` 内置于 TUI 中，可以选择按事件类型过滤（例如 `agent-turn-complete` 和 `approval-requested`）。
- `tui.notification_method` 控制 TUI 如何发出终端通知（`auto`、`osc9` 或 `bel`）。
- `tui.notification_condition` 控制 TUI 通知是仅在终端`未聚焦`时触发还是`始终`触发。

在 `auto` 模式下，Codex 优先使用 OSC 9 通知（某些终端将其解释为桌面通知的终端转义序列），否则回退到 BEL（`\x07`）。

确切的键请参阅[配置参考](https://developers.openai.com/codex/config-reference)。

## 历史持久化

默认情况下，Codex 将本地会话记录保存在 `CODEX_HOME` 下（例如 `~/.codex/history.jsonl`）。要禁用本地历史持久化：

```toml
[history]
persistence = "none"
```

要限制历史文件大小，请设置 `history.max_bytes`。当文件超过限制时，Codex 会删除最旧的条目并压缩文件，同时保留最新的记录。

```toml
[history]
max_bytes = 104857600 # 100 MiB
```

## 可点击引用

如果你使用的终端/编辑器集成支持此功能，Codex 可以将文件引用渲染为可点击链接。配置 `file_opener` 以选择 Codex 使用的 URI 方案：

```toml
file_opener = "vscode" # 或 cursor、windsurf、vscode-insiders、none
```

示例：像 `/home/user/project/main.py:42` 这样的引用可以被重写为可点击的 `vscode://file/...:42` 链接。

## 项目指令发现

Codex 读取 `AGENTS.md`（及相关文件）并在会话的第一轮中包含有限数量的项目指引。两个旋钮控制此行为：

- `project_doc_max_bytes`：从每个 `AGENTS.md` 文件中读取多少内容
- `project_doc_fallback_filenames`：当目录级别缺少 `AGENTS.md` 时要尝试的额外文件名

详细操作指南请参阅[使用 AGENTS.md 的自定义指令](https://developers.openai.com/codex/guides/agents-md)。

## TUI 选项

不带子命令运行 `codex` 会启动交互式终端 UI (TUI)。Codex 在 `[tui]` 下提供一些 TUI 特定配置，包括：

- `tui.notifications`：启用/禁用通知（或限制为特定类型）
- `tui.notification_method`：选择 `auto`、`osc9` 或 `bel` 用于终端通知
- `tui.notification_condition`：选择 `unfocused` 或 `always` 控制通知触发时机
- `tui.animations`：启用/禁用 ASCII 动画和闪光效果
- `tui.alternate_screen`：控制备用屏幕使用（设置为 `never` 以保留终端回滚）
- `tui.show_tooltips`：在欢迎屏幕上显示或隐藏入门工具提示

`tui.notification_method` 默认为 `auto`。在 `auto` 模式下，当终端看起来支持时，Codex 优先使用 OSC 9 通知（某些终端将其解释为桌面通知的终端转义序列），否则回退到 BEL（`\x07`）。

完整键列表请参阅[配置参考](https://developers.openai.com/codex/config-reference)。
