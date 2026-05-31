# 配置示例

将此示例配置作为起点。它包含了 Codex 从 `config.toml` 中读取的大部分键，以及默认行为、推荐值（如有帮助）和简要说明。

有关解释和指南，请参阅：

- [配置基础](https://developers.openai.com/codex/config-basic)
- [高级配置](https://developers.openai.com/codex/config-advanced)
- [配置参考](https://developers.openai.com/codex/config-reference)
- [沙箱和审批](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)
- [托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)

将以下代码片段作为参考。仅将所需的键和部分复制到 `~/.codex/config.toml`（或项目级 `.codex/config.toml`），然后根据您的设置调整值。

```toml
# Codex 示例配置 (config.toml)
#
# 此文件列出了 Codex 从 config.toml 中读取的主要键，以及默认行为、
# 推荐示例和简要说明。根据需要进行调整。
#
# 注意
# - 在 TOML 中，根键必须出现在表之前。
# - 默认为"未设置"的可选键以注释形式显示并附带说明。
# - MCP 服务器、配置文件和模型提供者仅为示例；可移除或编辑。

################################################################################

# 核心模型选择

################################################################################

# Codex 使用的主模型。大多数用户的推荐示例："gpt-5.5"。

model = "gpt-5.5"

# 支持模型的沟通风格。允许值：none | friendly | pragmatic

# personality = "pragmatic"

# /review 的可选模型覆盖。默认：未设置（使用当前会话模型）。

# review_model = "gpt-5.5"

# 从 [model_providers] 中选择的提供者 ID。默认："openai"。

model_provider = "openai"

# --oss 会话的默认 OSS 提供者。未设置时，Codex 会提示。默认：未设置。

# oss_provider = "ollama"

# 首选服务层级。内置示例：fast | flex；模型目录可添加更多。

# service_tier = "flex"

# 可选的手动模型元数据。未设置时，Codex 使用模型或预设默认值。

# model_context_window = 128000 # tokens；默认：模型自动设置

# model_auto_compact_token_limit = 64000 # tokens；未设置时使用模型默认值

# tool_output_token_limit = 12000 # 每个工具输出存储的 tokens

# model_catalog_json = "/absolute/path/to/models.json" # 可选的仅启动时模型目录覆盖

# background_terminal_max_timeout = 300000 # 毫秒；最大空闲 write_stdin 轮询窗口（默认 5 分钟）

# log_dir = "/absolute/path/to/codex-logs" # 日志目录；显式设置可启用 codex-tui.log；默认："$CODEX_HOME/log"

# sqlite_home = "/absolute/path/to/codex-state" # 可选的 SQLite 支持的运行时状态目录

################################################################################

# 推理和详细程度（Responses API 兼容模型）

################################################################################

# 推理力度：minimal | low | medium | high | xhigh

# model_reasoning_effort = "medium"

# Codex 在规划模式下运行时的可选覆盖：none | minimal | low | medium | high | xhigh

# plan_mode_reasoning_effort = "high"

# 推理摘要：auto | concise | detailed | none

# model_reasoning_summary = "auto"

# GPT-5 系列的文本详细程度（Responses API）：low | medium | high

# model_verbosity = "medium"

# 强制启用或禁用当前模型的推理摘要。

# model_supports_reasoning_summaries = true

################################################################################

# 指令覆盖

################################################################################

# 在 AGENTS.md 之前注入的附加用户指令。默认：未设置。

# developer_instructions = ""

# 历史压缩提示词的内联覆盖。默认：未设置。

# compact_prompt = ""

# 覆盖默认的提交合作者标注。仅在 [features].codex_git_commit 启用时生效。
# 启用且未设置时，Codex 使用 "Codex <noreply@openai.com>"。设为 "" 可禁用。

# commit_attribution = "Jane Doe <jane@example.com>"

# 使用文件路径覆盖内置基础指令。默认：未设置。

# model_instructions_file = "/absolute/or/relative/path/to/instructions.txt"

# 从文件加载压缩提示词覆盖。默认：未设置。

# experimental_compact_prompt_file = "/absolute/or/relative/path/to/compact_prompt.txt"

################################################################################

# 通知

################################################################################

# 外部通知程序（argv 数组）。未设置时：禁用。

# notify = ["notify-send", "Codex"]

################################################################################

# 审批和沙箱

################################################################################

# 何时要求命令审批：

# - untrusted：仅已知安全的只读命令自动运行；其他命令提示

# - on-request：模型决定何时询问（默认）

# - never：从不提示（有风险）

# - { granular = { ... } }：允许或自动拒绝选定的提示类别

approval_policy = "on-request"

# 谁来审查符合条件的审批提示：user（默认）| auto_review

# approvals_reviewer = "user"

# 细粒度策略示例：

# approval_policy = { granular = {

# sandbox_approval = true,

# rules = true,

# mcp_elicitations = true,

# request_permissions = false,

# skill_approval = false

# } }

# 当 shell 工具请求 `login = true` 时，允许登录 shell 语义。
# 默认：true。设为 false 可强制非登录 shell 并拒绝显式登录 shell 请求。

allow_login_shell = true

# 工具调用的文件系统/网络沙箱策略：

# - read-only（默认）

# - workspace-write

# - danger-full-access（无沙箱；极其危险）

sandbox_mode = "read-only"

# 默认应用的命名权限配置文件。内置：

# :read-only | :workspace | :danger-full-access

# 仅在同时定义 [permissions.workspace] 时使用自定义名称，如 "workspace"。

# default_permissions = ":workspace"

################################################################################

# 认证和登录

################################################################################

# CLI 登录凭据的持久化位置：file（默认）| keyring | auto

cli_auth_credentials_store = "file"

# ChatGPT 认证流程的基础 URL（非 OpenAI API）。

chatgpt_base_url = "https://chatgpt.com/backend-api/"

# 内置 OpenAI 提供者的可选基础 URL 覆盖。

# openai_base_url = "https://us.api.openai.com/v1"

# 将 ChatGPT 登录限制到特定工作区 ID。默认：未设置。

# forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"

# 当 Codex 通常会自动选择时，强制登录机制。默认：未设置。

# 允许值：chatgpt | api

# forced_login_method = "chatgpt"

# MCP OAuth 凭据的首选存储：auto（默认）| file | keyring

mcp_oauth_credentials_store = "auto"

# MCP OAuth 回调的可选固定端口：1-65535。默认：未设置。

# mcp_oauth_callback_port = 4321

# MCP OAuth 登录的可选重定向 URI 覆盖（例如远程开发箱入口）。
# 支持自定义回调路径。`mcp_oauth_callback_port` 仍控制监听端口。

# mcp_oauth_callback_url = "https://devbox.example.internal/callback"

################################################################################

# 项目文档控制

################################################################################

# 从 AGENTS.md 嵌入首轮指令的最大字节数。默认：32768

project_doc_max_bytes = 32768

# 目录级别缺少 AGENTS.md 时的有序回退。默认：[]

project_doc_fallback_filenames = []

# 搜索父目录时使用的项目根标记文件名。默认：[".git"]

# project_root_markers = [".git"]

################################################################################

# 历史和文件打开器

################################################################################

# 可点击引用的 URI 方案：vscode（默认）| vscode-insiders | windsurf | cursor | none

file_opener = "vscode"

################################################################################

# UI、通知和杂项

################################################################################

# 从输出中抑制内部推理事件。默认：false

hide_agent_reasoning = false

# 可用时显示原始推理内容。默认：false

show_raw_agent_reasoning = false

# 在 TUI 中禁用粘贴突发检测。默认：false

disable_paste_burst = false

# 跟踪 Windows 引导弹出确认（仅 Windows）。默认：false

windows_wsl_setup_acknowledged = false

# 启动时检查更新。默认：true

check_for_update_on_startup = true

################################################################################

# 网络搜索

################################################################################

# 网络搜索模式：disabled | cached | live。默认："cached"

# cached 从网络搜索缓存（OpenAI 维护的索引）提供结果。

# cached 返回预索引结果；live 获取最新数据。

# 如果使用 --yolo 或其他完全访问沙箱设置，网络搜索默认为 live。

web_search = "cached"

# 配置文件是 CODEX_HOME 下的独立文件。

# 示例：~/.codex/ci.config.toml，通过 codex --profile ci 选择。

# 抑制启用开发中功能标志时显示的警告。

# suppress_unstable_features_warning = true

################################################################################

# 代理（多代理角色和限制）

################################################################################

[agents]

# 最大并发打开的代理线程数。默认：6

# max_threads = 6

# 最大嵌套生成深度。根会话从深度 0 开始。默认：1

# max_depth = 1

# spawn_agents_on_csv 作业的每个工作进程默认超时。未设置时，工具默认为 1800 秒。

# job_max_runtime_seconds = 1800

# [agents.reviewer]

# description = "查找代码中的正确性、安全性和测试风险。"

# config_file = "./agents/reviewer.toml" # 相对于定义它的 config.toml

# nickname_candidates = ["Athena", "Ada"]

################################################################################

# 技能（每技能覆盖）

################################################################################

# 禁用或重新启用特定技能而不删除它。

[[skills.config]]

# path = "/path/to/skill/SKILL.md"

# enabled = false

################################################################################

# 沙箱设置（表）

################################################################################

# 仅在 sandbox_mode = "workspace-write" 时使用的额外设置。

[sandbox_workspace_write]

# 工作区（cwd）之外的额外可写根目录。默认：[]

writable_roots = []

# 允许沙箱内的出站网络访问。默认：false

network_access = false

# 从可写根目录中排除 $TMPDIR。默认：false

exclude_tmpdir_env_var = false

# 从可写根目录中排除 /tmp。默认：false

exclude_slash_tmp = false

################################################################################

# 生成进程的 Shell 环境策略（表）

################################################################################

[shell_environment_policy]

# 继承：all（默认）| core | none

inherit = "all"

# 跳过包含 KEY/SECRET/TOKEN 名称的默认排除（不区分大小写）。默认：false

ignore_default_excludes = false

# 要移除的不区分大小写 glob 模式（例如 "AWS*\*"、"AZURE*\*"）。默认：[]

exclude = []

# 显式键/值覆盖（始终优先）。默认：{}

set = {}

# 白名单；如果非空，仅保留匹配的变量。默认：[]

include_only = []

# 实验性：通过用户 shell 配置文件运行。默认：false

experimental_use_profile = false

################################################################################

# 沙箱网络设置

################################################################################

# 在配置沙箱网络规则之前启用此功能。

# [features.network_proxy]

# enabled = true

# domains = { "api.openai.com" = "allow", "example.com" = "deny" }

#

# 精确主机仅匹配自身。

# "\*.example.com" 仅匹配子域名；"\*\*.example.com" 匹配顶点加子域名。

# "\*" 允许任何未被拒绝的公共主机，因此尽可能使用范围限定规则。

# `allow_local_binding = false` 默认阻止回环和私有目标。
# 为单个目标添加精确的本地 IP 字面量或 `localhost` 允许规则，
# 或仅在需要更广泛的本地访问时将其设为 true。

#

# 启用此配置文件前设置 `default_permissions = "workspace"`。

# 继承此配置文件的 `:workspace_roots` 文件系统规则的额外工作区根目录示例。

# [permissions.workspace.workspace_roots]

# "~/code/app" = true

# "~/code/shared-lib" = true

#

# 文件系统配置文件示例。使用 `"deny"` 拒绝精确路径或 glob 模式的读取。
# 在需要预展开 glob 匹配的平台上，使用无界模式（如 `\*\*`）时设置 glob_scan_max_depth。

# [permissions.workspace.filesystem]

# glob_scan_max_depth = 3

# ":workspace_roots" = { "." = "write", "\*\*/\*.env" = "deny" }

# "/absolute/path/to/secrets" = "deny"

#

# [permissions.workspace.network]

# enabled = true

# proxy_url = "http://127.0.0.1:43128"

# admin_url = "http://127.0.0.1:43129"

# enable_socks5 = false

# socks_url = "http://127.0.0.1:43130"

# enable_socks5_udp = false

# allow_upstream_proxy = false

# dangerously_allow_non_loopback_proxy = false

# dangerously_allow_non_loopback_admin = false

# dangerously_allow_all_unix_sockets = false

# mode = "limited" # limited | full

# allow_local_binding = false

#

# [permissions.workspace.network.domains]

# "api.openai.com" = "allow"

# "example.com" = "deny"

#

# [permissions.workspace.network.unix_sockets]

# "/var/run/docker.sock" = "allow"

################################################################################

# 历史（表）

################################################################################

[history]

# save-all（默认）| none

persistence = "save-all"

# 历史文件的最大字节数；超过时修剪最旧的条目。示例：5242880

# max_bytes = 5242880

################################################################################

# UI、通知和杂项（表）

################################################################################

[tui]

# TUI 的桌面通知：布尔值或过滤列表。默认：true

# 示例：false | ["agent-turn-complete", "approval-requested"]

notifications = false

# 终端警报的通知机制：auto | osc9 | bel。默认："auto"

# notification_method = "auto"

# 通知触发时机：unfocused（默认）| always

# notification_condition = "unfocused"

# 启用欢迎/状态/旋转器动画。默认：true

animations = true

# 在欢迎屏幕中显示引导工具提示。默认：true

show_tooltips = true

# 控制备用屏幕使用（auto 在 Zellij 中跳过以保留回滚）。

# alternate_screen = "auto"

# 页脚状态行项目 ID 的有序列表。未设置时，Codex 使用：
# ["model-with-reasoning", "context-remaining", "current-dir"]。
# 设为 [] 可隐藏页脚。

# status_line = ["model", "context-remaining", "git-branch"]

# 终端窗口/标签标题项目 ID 的有序列表。未设置时，Codex 使用：
# ["spinner", "project"]。设为 [] 可清除标题。
# 可用 ID 包括 app-name、project、spinner、status、thread、git-branch、model 和 task-progress。

# terminal_title = ["spinner", "project"]

# 语法高亮主题（kebab-case）。在 TUI 中使用 /theme 预览和保存。
# 也可以在 $CODEX_HOME/themes 下添加自定义 .tmTheme 文件。

# theme = "catppuccin-mocha"

# 自定义键绑定。上下文特定绑定覆盖 [tui.keymap.global]。
# 使用 [] 可解除绑定。

# [tui.keymap.global]

# open_transcript = "ctrl-t"

# open_external_editor = []

#

# [tui.keymap.composer]

# submit = ["enter", "ctrl-m"]

# 按模型 slug 键控的内部工具提示状态。通常由 Codex 管理。

# [tui.model_availability_nux]

# "gpt-5.4" = 1

# 启用或禁用此机器的分析。未设置时，Codex 使用其默认行为。

[analytics]
enabled = true

# 控制用户是否可以从 `/feedback` 提交反馈。默认：true

[feedback]
enabled = true

# 产品内通知（主要由 Codex 自动设置）。

[notice]

# hide_full_access_warning = true

# hide_world_writable_warning = true

# hide_rate_limit_model_nudge = true

# hide_gpt5_1_migration_prompt = true

# "hide_gpt-5.1-codex-max_migration_prompt" = true

# model_migrations = { "gpt-5.3-codex" = "gpt-5.4" }

################################################################################

# 集中功能标志（首选）

################################################################################

[features]

# 留空此表以接受默认值。设置显式布尔值以选择启用/禁用。

# shell_tool = true

# apps = false

# hooks = false

# codex_git_commit = false

# unified_exec = true

# shell_snapshot = true

# multi_agent = true

# personality = true

# network_proxy = false

# fast_mode = true

# enable_request_compression = true

# skill_mcp_dependency_install = true

# prevent_idle_sleep = false

################################################################################

# 记忆（表）

################################################################################

# 使用 [features].memories 启用记忆，然后在此处调整记忆行为。

# [memories]

# generate_memories = true

# use_memories = true

# disable_on_external_context = false # 旧版别名：no_memories_if_mcp_or_web_search

################################################################################

# 生命周期钩子可在此处内联配置或在同级 hooks.json 中配置。

################################################################################

# [hooks]

# [[hooks.PreToolUse]]

# matcher = "^Bash$"

#

# [[hooks.PreToolUse.hooks]]

# type = "command"

# command = 'python3 "/absolute/path/to/pre_tool_use_policy.py"'

# timeout = 30

# statusMessage = "Checking Bash command"

################################################################################

# 在此表下定义 MCP 服务器。留空以禁用。

################################################################################

[mcp_servers]

# --- 示例：STDIO 传输 ---

# [mcp_servers.docs]

# enabled = true # 可选；默认 true

# required = true # 可选；如果此服务器无法初始化，则启动/恢复失败

# command = "docs-server" # 必需

# args = ["--port", "4000"] # 可选

# env = { "API_KEY" = "value" } # 可选键/值对，按原样复制

# env_vars = ["ANOTHER_SECRET"] # 可选：转发本地父环境变量

# env_vars = ["LOCAL_TOKEN", { name = "REMOTE_TOKEN", source = "remote" }]

# cwd = "/path/to/server" # 可选工作目录覆盖

# experimental_environment = "remote" # 实验性：通过远程执行器运行 stdio

# startup_timeout_sec = 10.0 # 可选；默认 10.0 秒

# # startup_timeout_ms = 10000 # 启动超时的可选别名（毫秒）

# tool_timeout_sec = 60.0 # 可选；默认 60.0 秒

# enabled_tools = ["search", "summarize"] # 可选允许列表

# disabled_tools = ["slow-tool"] # 可选拒绝列表（在允许列表之后应用）

# scopes = ["read:docs"] # 可选 OAuth 作用域

# oauth_resource = "https://docs.example.com/" # 可选 OAuth 资源

# --- 示例：可流式 HTTP 传输 ---

# [mcp_servers.github]

# enabled = true # 可选；默认 true

# required = true # 可选；如果此服务器无法初始化，则启动/恢复失败

# url = "https://github-mcp.example.com/mcp" # 必需

# bearer_token_env_var = "GITHUB_TOKEN" # 可选；Authorization: Bearer <token>

# http_headers = { "X-Example" = "value" } # 可选静态头

# env_http_headers = { "X-Auth" = "AUTH_ENV" } # 可选从环境变量填充的头

# startup_timeout_sec = 10.0 # 可选

# tool_timeout_sec = 60.0 # 可选

# enabled_tools = ["list_issues"] # 可选允许列表

# disabled_tools = ["delete_issue"] # 可选拒绝列表

# scopes = ["repo"] # 可选 OAuth 作用域

################################################################################

# 模型提供者

################################################################################

# 内置包括：

# - openai

# - ollama

# - lmstudio

# - amazon-bedrock

# 这些 ID 是保留的。自定义提供者请使用不同的 ID。

[model_providers]

# --- 示例：内置 Amazon Bedrock 提供者选项 ---

# model_provider = "amazon-bedrock"

# model = "<bedrock-model-id>"

# [model_providers.amazon-bedrock.aws]

# profile = "default"

# region = "eu-central-1"

# --- 示例：OpenAI 数据驻留，带显式基础 URL 或头 ---

# [model_providers.openaidr]

# name = "OpenAI Data Residency"

# base_url = "https://us.api.openai.com/v1" # 带 'us' 域名前缀的示例

# wire_api = "responses" # 唯一支持的值

# # requires_openai_auth = true # 仅用于 OpenAI 认证支持的提供者

# # request_max_retries = 4 # 默认 4；最大 100

# # stream_max_retries = 5 # 默认 5；最大 100

# # stream_idle_timeout_ms = 300000 # 默认 300_000（5 分钟）

# # supports_websockets = true # 可选

# # experimental_bearer_token = "sk-example" # 可选的仅开发直接 bearer token

# # http_headers = { "X-Example" = "value" }

# # env_http_headers = { "OpenAI-Organization" = "OPENAI_ORGANIZATION", "OpenAI-Project" = "OPENAI_PROJECT" }

# --- 示例：Azure/OpenAI 兼容提供者 ---

# [model_providers.azure]

# name = "Azure"

# base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"

# wire_api = "responses"

# query_params = { api-version = "2025-04-01-preview" }

# env_key = "AZURE_OPENAI_API_KEY"

# env_key_instructions = "Set AZURE_OPENAI_API_KEY in your environment"

# # supports_websockets = false

# --- 示例：命令支持的 bearer token 认证 ---

# [model_providers.proxy]

# name = "OpenAI using LLM proxy"

# base_url = "https://proxy.example.com/v1"

# wire_api = "responses"

#

# [model_providers.proxy.auth]

# command = "/usr/local/bin/fetch-codex-token"

# args = ["--audience", "codex"]

# timeout_ms = 5000

# refresh_interval_ms = 300000

# --- 示例：本地 OSS（例如 Ollama 兼容） ---

# [model_providers.local_ollama]

# name = "Ollama"

# base_url = "http://localhost:11434/v1"

# wire_api = "responses"

################################################################################

# 应用/连接器

################################################################################

# 可选的每应用控制。

[apps]

# [_default] 适用于所有应用，除非每应用覆盖。

# [apps._default]

# enabled = true

# destructive_enabled = true

# open_world_enabled = true

#

# [apps.google_drive]

# enabled = false

# destructive_enabled = false # 阻止此应用的 destructive-hint 工具

# default_tools_enabled = true

# default_tools_approval_mode = "prompt" # auto | prompt | approve

#

# [apps.google_drive.tools."files/delete"]

# enabled = false

# approval_mode = "approve"

# 连接器或插件 Codex 可提供安装的可选工具建议白名单。

# [tool_suggest]

# discoverables = [

# { type = "connector", id = "gmail" },

# { type = "plugin", id = "figma@openai-curated" },

# ]

# disabled_tools = [

# { type = "plugin", id = "slack@openai-curated" },

# { type = "connector", id = "connector_googlecalendar" },

# ]

################################################################################

# 配置文件（独立文件）

################################################################################

# 要创建配置文件，请将覆盖放在 $CODEX_HOME 下的独立配置文件中。
# 使用 codex --profile ci 选择。
# 例如，CI 配置文件可以位于 $CODEX_HOME/ci.config.toml：

# model = "gpt-5.4"

# approval_policy = "on-request"

# sandbox_mode = "read-only"

# service_tier = "flex" # 或其他支持的服务层级 ID

# oss_provider = "ollama"

# model_reasoning_effort = "medium"

# plan_mode_reasoning_effort = "high"

# model_reasoning_summary = "auto"

# model_verbosity = "medium"

# personality = "pragmatic" # 或 "friendly" 或 "none"

# chatgpt_base_url = "https://chatgpt.com/backend-api/"

# model_catalog_json = "./models.json"

# model_instructions_file = "/absolute/or/relative/path/to/instructions.txt"

# experimental_compact_prompt_file = "./compact_prompt.txt"

# tools_view_image = true

# features = { unified_exec = false }

################################################################################

# 项目（信任级别）

################################################################################

[projects]

# 将特定工作树标记为受信任或不受信任。

# [projects."/absolute/path/to/project"]

# trust_level = "trusted" # 或 "untrusted"

################################################################################

# 工具

################################################################################

[tools]

# view_image = true

################################################################################

# OpenTelemetry (OTEL) - 默认禁用

################################################################################

[otel]

# 在日志中包含用户提示词文本。默认：false

log_user_prompt = false

# 应用于遥测的环境标签。默认："dev"

environment = "dev"

# 导出器：none（默认）| otlp-http | otlp-grpc

exporter = "none"

# 跟踪导出器：none（默认）| otlp-http | otlp-grpc

trace_exporter = "none"

# 指标导出器：none | statsig | otlp-http | otlp-grpc

metrics_exporter = "statsig"

# OTLP/HTTP 导出器配置示例

# [otel.exporter."otlp-http"]

# endpoint = "https://otel.example.com/v1/logs"

# protocol = "binary" # "binary" | "json"

# [otel.exporter."otlp-http".headers]

# "x-otlp-api-key" = "${OTLP_TOKEN}"

# [otel.exporter."otlp-http".tls]

# ca-certificate = "certs/otel-ca.pem"

# client-certificate = "/etc/codex/certs/client.pem"

# client-private-key = "/etc/codex/certs/client-key.pem"

# OTLP/gRPC 跟踪导出器配置示例

# [otel.trace_exporter."otlp-grpc"]

# endpoint = "https://otel.example.com:4317"

# headers = { "x-otlp-meta" = "abc123" }

################################################################################

# Windows

################################################################################

[windows]

# 原生 Windows 沙箱模式（仅 Windows）：unelevated | elevated

sandbox = "unelevated"
```
