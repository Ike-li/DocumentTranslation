# 配置参考

将此页面作为 Codex 配置文件的可搜索参考。有关概念性指导和示例，请从[配置基础](https://developers.openai.com/codex/config-basic)和[高级配置](https://developers.openai.com/codex/config-advanced)开始。

## `config.toml`

用户级配置位于 `~/.codex/config.toml`。你还可以在 `.codex/config.toml` 文件中添加项目范围的覆盖配置。Codex 仅在你信任该项目时才会加载项目范围的配置文件。

项目范围的配置无法覆盖机器本地的 provider、认证、主机拥有的应用请求元数据、通知、配置 profile 选择或遥测路由键。当 `openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel` 出现在项目本地的 `.codex/config.toml` 中时，Codex 会忽略它们；请将 provider、通知和遥测键放在用户级配置中。配置 [profile 文件](https://developers.openai.com/codex/config-advanced#profiles)与 `config.toml` 位于同一目录，命名为 `$CODEX_HOME/profile-name.config.toml`；使用 `--profile profile-name` 选择一个。

关于沙箱和审批键（`approval_policy`、`sandbox_mode` 和 `sandbox_workspace_write.*`），请将此参考与[沙箱和审批](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)、[可写根目录中的受保护路径](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots)和[网络访问](https://developers.openai.com/codex/agent-approvals-security#network-access)结合使用。有关 beta 权限 profile，请参阅[权限](https://developers.openai.com/codex/permissions)。

### `config.toml` 配置项

| 键 | 类型 | 描述 |
|---|---|---|
| `model` | `string` | 要使用的模型（例如 `gpt-5.5`）。 |
| `review_model` | `string` | `/review` 使用的可选模型覆盖（默认为当前会话模型）。 |
| `model_provider` | `string` | 来自 `model_providers` 的 provider ID（默认：`openai`）。 |
| `openai_base_url` | `string` | 内置 `openai` 模型 provider 的基础 URL 覆盖。 |
| `model_context_window` | `number` | 活动模型可用的上下文窗口 token 数。 |
| `model_auto_compact_token_limit` | `number` | 触发自动历史压缩的 token 阈值（未设置则使用模型默认值）。 |
| `model_catalog_json` | `string (path)` | 启动时加载的可选 JSON 模型目录路径。已选择的 `$CODEX_HOME/profile-name.config.toml` profile 文件可以按 profile 覆盖此项。 |
| `oss_provider` | `lmstudio \| ollama` | 使用 `--oss` 运行时的默认本地 provider（未设置则默认提示选择）。 |
| `approval_policy` | `untrusted \| on-request \| never \| { granular = { sandbox_approval = bool, rules = bool, mcp_elicitations = bool, request_permissions = bool, skill_approval = bool } }` | 控制 Codex 在执行命令前何时暂停等待审批。你还可以使用 `approval_policy = { granular = { ... } }` 来允许或自动拒绝特定提示词类别，同时保持其他提示词为交互式。`on-failure` 已弃用；交互式运行使用 `on-request`，非交互式运行使用 `never`。 |
| `approval_policy.granular.sandbox_approval` | `boolean` | 设为 `true` 时，允许显示沙箱升级审批提示。 |
| `approval_policy.granular.rules` | `boolean` | 设为 `true` 时，允许显示由 execpolicy `prompt` 规则触发的审批。 |
| `approval_policy.granular.mcp_elicitations` | `boolean` | 设为 `true` 时，允许显示 MCP elicitation 提示而非自动拒绝。 |
| `approval_policy.granular.request_permissions` | `boolean` | 设为 `true` 时，允许显示来自 `request_permissions` 工具的提示。 |
| `approval_policy.granular.skill_approval` | `boolean` | 设为 `true` 时，允许显示技能脚本审批提示。 |
| `approvals_reviewer` | `user \| auto_review` | 在 `on-request` 或细粒度审批策略下，谁来审查符合条件的审批提示。默认为 `user`；`auto_review` 使用审查子代理。此设置不会更改沙箱内已允许的沙箱化或审查操作。 |
| `auto_review.policy` | `string` | 用于自动审查的本地 Markdown 策略指令。托管的 `guardian_policy_config` 优先。空值将被忽略。 |
| `allow_login_shell` | `boolean` | 允许基于 shell 的工具使用登录 shell 语义。默认为 `true`；设为 `false` 时，`login = true` 请求将被拒绝，省略的 `login` 默认为非登录 shell。 |
| `sandbox_mode` | `read-only \| workspace-write \| danger-full-access` | 命令执行期间文件系统和网络访问的沙箱策略。 |
| `sandbox_workspace_write.writable_roots` | `array<string>` | 当 `sandbox_mode = "workspace-write"` 时的额外可写根目录。 |
| `sandbox_workspace_write.network_access` | `boolean` | 允许在 workspace-write 沙箱内进行出站网络访问。 |
| `sandbox_workspace_write.exclude_tmpdir_env_var` | `boolean` | 在 workspace-write 模式下将 `$TMPDIR` 从可写根目录中排除。 |
| `sandbox_workspace_write.exclude_slash_tmp` | `boolean` | 在 workspace-write 模式下将 `/tmp` 从可写根目录中排除。 |
| `windows.sandbox` | `unelevated \| elevated` | 在 Windows 上原生运行 Codex 时的 Windows 专用原生沙箱模式。 |
| `windows.sandbox_private_desktop` | `boolean` | 在原生 Windows 上默认在私有桌面上运行最终的沙箱子进程。仅在需要兼容旧版 `Winsta0\\Default` 行为时才设为 `false`。 |
| `notify` | `array<string>` | 用于通知的命令；接收来自 Codex 的 JSON 负载。 |
| `check_for_update_on_startup` | `boolean` | 启动时检查 Codex 更新（仅在更新由集中管理时才设为 false）。 |
| `feedback.enabled` | `boolean` | 启用通过 `/feedback` 在所有 Codex 界面提交反馈（默认：true）。 |
| `analytics.enabled` | `boolean` | 启用或禁用此机器/profile 的分析。未设置时，使用客户端默认值。 |
| `instructions` | `string` | 预留供未来使用；推荐使用 `model_instructions_file` 或 `AGENTS.md`。 |
| `developer_instructions` | `string` | 注入会话的额外开发者指令（可选）。 |
| `log_dir` | `string (path)` | Codex 写入日志文件的目录；默认为 `$CODEX_HOME/log`。显式设置此项还会在该目录中启用可选的纯文本 TUI 日志 `codex-tui.log`。 |
| `sqlite_home` | `string (path)` | Codex 存储 SQLite 支持的状态数据库的目录，供代理任务和其他可恢复的运行时状态使用。 |
| `compact_prompt` | `string` | 历史压缩提示词的内联覆盖。 |
| `commit_attribution` | `string` | 启用 `[features].codex_git_commit` 时使用的提交共同作者 trailer。默认为 `Codex <noreply@openai.com>`；设为 `""` 可禁用。 |
| `model_instructions_file` | `string (path)` | 替代内置指令的文件，而非 `AGENTS.md`。 |
| `personality` | `none \| friendly \| pragmatic` | 支持 `supportsPersonality` 的模型的默认沟通风格；可按线程/轮次覆盖或通过 `/personality` 设置。 |
| `service_tier` | `string` | 新轮次的首选服务层级。内置值包括 `flex` 和 `fast`；旧版 `fast` 配置映射到请求值 `priority`，目录提供的层级 ID 也可以存储。 |
| `experimental_compact_prompt_file` | `string (path)` | 从文件加载压缩提示词覆盖（实验性）。 |
| `skills.config` | `array<object>` | 存储在 config.toml 中的按技能启用覆盖。 |
| `skills.config.<index>.path` | `string (path)` | 包含 `SKILL.md` 的技能文件夹路径。 |
| `skills.config.<index>.enabled` | `boolean` | 启用或禁用引用的技能。 |
| `apps.<id>.enabled` | `boolean` | 按 ID 启用或禁用特定应用/连接器（默认：true）。 |
| `apps._default.enabled` | `boolean` | 除非按应用覆盖，否则所有应用的默认启用状态。 |
| `apps._default.destructive_enabled` | `boolean` | 对于 `destructive_hint = true` 的应用工具，默认允许/拒绝。 |
| `apps._default.open_world_enabled` | `boolean` | 对于 `open_world_hint = true` 的应用工具，默认允许/拒绝。 |
| `apps.<id>.destructive_enabled` | `boolean` | 允许或阻止此应用中声明 `destructive_hint = true` 的工具。 |
| `apps.<id>.open_world_enabled` | `boolean` | 允许或阻止此应用中声明 `open_world_hint = true` 的工具。 |
| `apps.<id>.default_tools_enabled` | `boolean` | 此应用中工具的默认启用状态，除非存在按工具覆盖。 |
| `apps.<id>.default_tools_approval_mode` | `auto \| prompt \| approve` | 此应用中工具的默认审批行为，除非存在按工具覆盖。 |
| `apps.<id>.tools.<tool>.enabled` | `boolean` | 应用工具的按工具启用覆盖（例如 `repos/list`）。 |
| `apps.<id>.tools.<tool>.approval_mode` | `auto \| prompt \| approve` | 单个应用工具的按工具审批行为覆盖。 |
| `tool_suggest.discoverables` | `array<table>` | 允许为额外的可发现连接器或插件提供建议。每个条目使用 `type = "connector"` 或 `"plugin"` 以及一个 `id`。 |
| `tool_suggest.disabled_tools` | `array<table>` | 禁用特定可发现连接器或插件的建议。每个条目使用 `type = "connector"` 或 `"plugin"` 以及一个 `id`。 |
| `features.apps` | `boolean` | 启用 ChatGPT 应用/连接器支持（实验性）。 |
| `features.hooks` | `boolean` | 启用从 `hooks.json` 或内联 `[hooks]` 配置加载的生命周期钩子。`features.codex_hooks` 是已弃用的别名。 |
| `features.codex_git_commit` | `boolean` | 启用 Codex 生成的 git 提交。启用后，Codex 使用 `commit_attribution` 在生成的提交消息中附加 `Co-authored-by:` trailer。 |
| `hooks` | `table` | 在 `config.toml` 中内联配置的生命周期钩子。使用与 `hooks.json` 相同的事件 schema；有关示例和支持的事件，请参阅钩子指南。 |
| `hooks.<Event>` | `array<table>` | 钩子事件的匹配器组，如 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SubagentStart`、`SubagentStop`、`UserPromptSubmit` 或 `Stop`。 |
| `hooks.<Event>[].hooks` | `array<table>` | 匹配器组的钩子处理器。目前支持命令钩子；提示词和代理钩子处理器会被解析但跳过。 |
| `hooks.<Event>[].hooks[].commandWindows` | `string` | 命令钩子的 Windows 专用命令覆盖。TOML 别名 `command_windows` 也可接受。 |
| `features.memories` | `boolean` | 启用[记忆](https://developers.openai.com/codex/memories)（默认关闭）。 |
| `mcp_servers.<id>.command` | `string` | MCP stdio 服务器的启动命令。 |
| `mcp_servers.<id>.args` | `array<string>` | 传递给 MCP stdio 服务器命令的参数。 |
| `mcp_servers.<id>.env` | `map<string,string>` | 转发给 MCP stdio 服务器的环境变量。 |
| `mcp_servers.<id>.env_vars` | `array<string \| { name = string, source = "local" \| "remote" }>` | 为 MCP stdio 服务器白名单添加的额外环境变量。字符串条目默认为 `source = "local"`；仅在使用 executor 支持的远程 stdio 时才使用 `source = "remote"`。 |
| `mcp_servers.<id>.cwd` | `string` | MCP stdio 服务器进程的工作目录。 |
| `mcp_servers.<id>.url` | `string` | MCP 可流式传输 HTTP 服务器的端点。 |
| `mcp_servers.<id>.bearer_token_env_var` | `string` | 为 MCP HTTP 服务器提供 bearer token 的环境变量。 |
| `mcp_servers.<id>.http_headers` | `map<string,string>` | 每次 MCP HTTP 请求中包含的静态 HTTP 头。 |
| `mcp_servers.<id>.env_http_headers` | `map<string,string>` | 为 MCP HTTP 服务器从环境变量填充的 HTTP 头。 |
| `mcp_servers.<id>.enabled` | `boolean` | 在不删除配置的情况下禁用 MCP 服务器。 |
| `mcp_servers.<id>.required` | `boolean` | 设为 true 时，如果此已启用的 MCP 服务器无法初始化，则启动/恢复失败。 |
| `mcp_servers.<id>.startup_timeout_sec` | `number` | 覆盖 MCP 服务器默认的 10 秒启动超时。 |
| `mcp_servers.<id>.startup_timeout_ms` | `number` | `startup_timeout_sec` 的毫秒别名。 |
| `mcp_servers.<id>.tool_timeout_sec` | `number` | 覆盖 MCP 服务器默认的 60 秒单工具超时。 |
| `mcp_servers.<id>.enabled_tools` | `array<string>` | MCP 服务器公开的工具名称允许列表。 |
| `mcp_servers.<id>.disabled_tools` | `array<string>` | 在 `enabled_tools` 之后应用的 MCP 服务器拒绝列表。 |
| `mcp_servers.<id>.default_tools_approval_mode` | `auto \| prompt \| approve` | 此服务器上 MCP 工具的默认审批行为，除非存在按工具覆盖。 |
| `mcp_servers.<id>.tools.<tool>.approval_mode` | `auto \| prompt \| approve` | 此服务器上单个 MCP 工具的按工具审批行为覆盖。 |
| `mcp_servers.<id>.scopes` | `array<string>` | 向该 MCP 服务器进行身份验证时请求的 OAuth 作用域。 |
| `mcp_servers.<id>.oauth_resource` | `string` | MCP 登录期间包含的可选 RFC 8707 OAuth 资源参数。 |
| `mcp_servers.<id>.experimental_environment` | `local \| remote` | MCP 服务器的实验性放置。`remote` 通过远程 executor 环境启动 stdio 服务器；可流式传输 HTTP 的远程放置尚未实现。 |
| `agents.max_threads` | `number` | 可同时打开的最大代理线程数。未设置时默认为 `6`。 |
| `agents.max_depth` | `number` | 生成的代理线程允许的最大嵌套深度（根会话从深度 0 开始；默认：1）。 |
| `agents.job_max_runtime_seconds` | `number` | `spawn_agents_on_csv` 任务的默认每 worker 超时。未设置时，工具回退为每 worker 1800 秒。 |
| `agents.<name>.description` | `string` | 选择和生成该代理类型时向 Codex 显示的角色指导。 |
| `agents.<name>.config_file` | `string (path)` | 该角色的 TOML 配置层路径；相对路径从声明该角色的配置文件解析。 |
| `agents.<name>.nickname_candidates` | `array<string>` | 该角色生成代理的可选显示昵称池。 |
| `memories.generate_memories` | `boolean` | 设为 `false` 时，新创建的线程不会作为记忆生成输入存储。默认为 `true`。 |
| `memories.use_memories` | `boolean` | 设为 `false` 时，Codex 跳过将现有记忆注入未来会话。默认为 `true`。 |
| `memories.disable_on_external_context` | `boolean` | 设为 `true` 时，使用外部上下文（如 MCP 工具调用、网络搜索或工具搜索）的线程将被排除在记忆生成之外。默认为 `false`。旧版别名：`memories.no_memories_if_mcp_or_web_search`。 |
| `memories.max_raw_memories_for_consolidation` | `number` | 为全局整合保留的最大近期原始记忆数。默认为 `256`，上限为 `4096`。 |
| `memories.max_unused_days` | `number` | 记忆自上次使用以来的最大天数，超过后不再符合整合条件。默认为 `30`，范围限制在 `0`-`365`。 |
| `memories.max_rollout_age_days` | `number` | 考虑进行记忆生成的线程最大年龄。默认为 `30`，范围限制在 `0`-`90`。 |
| `memories.max_rollouts_per_startup` | `number` | 每次启动处理的最大 rollout 候选数。默认为 `16`，上限为 `128`。 |
| `memories.min_rollout_idle_hours` | `number` | 线程被视为符合记忆生成条件前的最小空闲时间。默认为 `6`，范围限制在 `1`-`48`。 |
| `memories.min_rate_limit_remaining_percent` | `number` | 记忆生成开始前 Codex 速率限制窗口中所需的最小剩余百分比。默认为 `25`，范围限制在 `0`-`100`。 |
| `memories.extract_model` | `string` | 按线程记忆提取的可选模型覆盖。 |
| `memories.consolidation_model` | `string` | 全局记忆整合的可选模型覆盖。 |
| `features.unified_exec` | `boolean` | 使用统一的 PTY 支持的 exec 工具（稳定；Windows 以外默认启用）。 |
| `features.shell_snapshot` | `boolean` | 快照 shell 环境以加速重复命令（稳定；默认开启）。 |
| `features.undo` | `boolean` | 启用撤销支持（稳定；默认关闭）。 |
| `features.multi_agent` | `boolean` | 启用多代理协作工具（`spawn_agent`、`send_input`、`resume_agent`、`wait_agent` 和 `close_agent`）（稳定；默认开启）。 |
| `features.personality` | `boolean` | 启用个性选择控制（稳定；默认开启）。 |
| `features.network_proxy` | `boolean \| table` | 启用沙箱化网络。设置网络策略选项（如 `domains`）时使用表格形式（实验性；默认关闭）。 |
| `features.network_proxy.enabled` | `boolean` | 启用沙箱化网络。默认为 `false`。 |
| `features.network_proxy.domains` | `map<string, allow \| deny>` | 沙箱化网络的域名策略。默认未设置，这意味着在添加 `allow` 规则之前不允许任何外部目标。支持精确主机、`*.example.com`（仅子域名）、`**.example.com`（顶级域名加子域名）和全局 `*` 允许规则；建议使用范围限定规则，因为 `*` 会广泛开放公共出站访问。添加 `deny` 规则以阻止目标；冲突时 `deny` 优先。 |
| `features.network_proxy.unix_sockets` | `map<string, allow \| deny>` | 沙箱化网络的 Unix 套接字策略。默认未设置；为允许的套接字添加 `allow` 条目。 |
| `features.network_proxy.allow_local_binding` | `boolean` | 允许更广泛的本地/私有网络访问。默认为 `false`；精确的本地 IP 字面量或 `localhost` 允许规则仍可允许特定本地目标。 |
| `features.network_proxy.enable_socks5` | `boolean` | 暴露 SOCKS5 支持。默认为 `true`。 |
| `features.network_proxy.enable_socks5_udp` | `boolean` | 允许通过 SOCKS5 进行 UDP。默认为 `true`。 |
| `features.network_proxy.allow_upstream_proxy` | `boolean` | 允许通过环境中的上游代理进行链接。默认为 `true`。 |
| `features.network_proxy.dangerously_allow_non_loopback_proxy` | `boolean` | 允许非回环监听地址。默认为 `false`；启用可能会将代理监听器暴露到 localhost 之外。 |
| `features.network_proxy.dangerously_allow_all_unix_sockets` | `boolean` | 允许任意 Unix 套接字目标而非仅允许列表访问。仅在严格控制的环境中使用。 |
| `features.network_proxy.proxy_url` | `string` | 沙箱化网络的 HTTP 监听 URL。默认为 `"http://127.0.0.1:3128"`。 |
| `features.network_proxy.socks_url` | `string` | SOCKS5 监听 URL。默认为 `"http://127.0.0.1:8081"`。 |
| `features.web_search` | `boolean` | 已弃用的旧版开关；推荐使用顶级 `web_search` 设置。 |
| `features.web_search_cached` | `boolean` | 已弃用的旧版开关。当 `web_search` 未设置时，true 映射为 `web_search = "cached"`。 |
| `features.web_search_request` | `boolean` | 已弃用的旧版开关。当 `web_search` 未设置时，true 映射为 `web_search = "live"`。 |
| `features.shell_tool` | `boolean` | 启用用于运行命令的默认 `shell` 工具（稳定；默认开启）。 |
| `features.enable_request_compression` | `boolean` | 在支持时使用 zstd 压缩流式请求体（稳定；默认开启）。 |
| `features.skill_mcp_dependency_install` | `boolean` | 允许提示并安装技能缺少的 MCP 依赖（稳定；默认开启）。 |
| `features.fast_mode` | `boolean` | 在 TUI 中启用模型目录服务层级选择，包括活动模型支持的 Fast 层级命令（稳定；默认开启）。 |
| `features.prevent_idle_sleep` | `boolean` | 在轮次运行时阻止机器进入睡眠（实验性；默认关闭）。 |
| `suppress_unstable_features_warning` | `boolean` | 禁用启用开发中功能标志时出现的警告。 |
| `model_providers.<id>` | `table` | 自定义 provider 定义。内置 provider ID（`openai`、`ollama` 和 `lmstudio`）为保留名称，无法覆盖。 |
| `model_providers.<id>.name` | `string` | 自定义模型 provider 的显示名称。 |
| `model_providers.<id>.base_url` | `string` | 模型 provider 的 API 基础 URL。 |
| `model_providers.<id>.env_key` | `string` | 提供 provider API 密钥的环境变量。 |
| `model_providers.<id>.env_key_instructions` | `string` | provider API 密钥的可选设置指导。 |
| `model_providers.<id>.experimental_bearer_token` | `string` | provider 的直接 bearer token（不推荐；使用 `env_key`）。 |
| `model_providers.<id>.requires_openai_auth` | `boolean` | provider 使用 OpenAI 身份验证（默认为 false）。 |
| `model_providers.<id>.wire_api` | `responses` | provider 使用的协议。`responses` 是唯一支持的值，省略时为默认值。 |
| `model_providers.<id>.query_params` | `map<string,string>` | 附加到 provider 请求的额外查询参数。 |
| `model_providers.<id>.http_headers` | `map<string,string>` | 添加到 provider 请求的静态 HTTP 头。 |
| `model_providers.<id>.env_http_headers` | `map<string,string>` | 存在时从环境变量填充的 HTTP 头。 |
| `model_providers.<id>.request_max_retries` | `number` | 对 provider 的 HTTP 请求重试次数（默认：4）。 |
| `model_providers.<id>.stream_max_retries` | `number` | SSE 流式中断的重试次数（默认：5）。 |
| `model_providers.<id>.stream_idle_timeout_ms` | `number` | SSE 流的空闲超时（毫秒）（默认：300000）。 |
| `model_providers.<id>.supports_websockets` | `boolean` | 该 provider 是否支持 Responses API WebSocket 传输。 |
| `model_providers.<id>.auth` | `table` | 自定义 provider 的命令驱动 bearer token 配置。不要与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。 |
| `model_providers.<id>.auth.command` | `string` | Codex 需要 bearer token 时运行的命令。该命令必须将 token 打印到 stdout。 |
| `model_providers.<id>.auth.args` | `array<string>` | 传递给 token 命令的参数。 |
| `model_providers.<id>.auth.timeout_ms` | `number` | token 命令的最大运行时间（毫秒）（默认：5000）。 |
| `model_providers.<id>.auth.refresh_interval_ms` | `number` | Codex 主动刷新 token 的频率（毫秒）（默认：300000）。设为 `0` 则仅在身份验证重试后刷新。 |
| `model_providers.<id>.auth.cwd` | `string (path)` | token 命令的工作目录。 |
| `model_providers.amazon-bedrock.aws.profile` | `string` | 内置 `amazon-bedrock` provider 使用的 AWS profile 名称。 |
| `model_providers.amazon-bedrock.aws.region` | `string` | 内置 `amazon-bedrock` provider 使用的 AWS 区域。 |
| `model_reasoning_effort` | `minimal \| low \| medium \| high \| xhigh` | 调整支持模型的推理努力程度（仅限 Responses API；`xhigh` 取决于模型）。 |
| `plan_mode_reasoning_effort` | `none \| minimal \| low \| medium \| high \| xhigh` | 计划模式专用的推理覆盖。未设置时，计划模式使用其内置预设默认值。 |
| `model_reasoning_summary` | `auto \| concise \| detailed \| none` | 选择推理摘要详细程度或完全禁用摘要。 |
| `model_verbosity` | `low \| medium \| high` | 可选的 GPT-5 Responses API 详细程度覆盖；未设置时，使用所选模型/预设默认值。 |
| `model_supports_reasoning_summaries` | `boolean` | 强制 Codex 发送或不发送推理元数据。 |
| `shell_environment_policy.inherit` | `all \| core \| none` | 生成子进程时的基线环境继承。 |
| `shell_environment_policy.ignore_default_excludes` | `boolean` | 在其他过滤器运行前保留包含 KEY/SECRET/TOKEN 的变量。 |
| `shell_environment_policy.exclude` | `array<string>` | 在默认值之后移除环境变量的 glob 模式。 |
| `shell_environment_policy.include_only` | `array<string>` | 模式白名单；设置后仅保留匹配的变量。 |
| `shell_environment_policy.set` | `map<string,string>` | 注入每个子进程的显式环境覆盖。 |
| `shell_environment_policy.experimental_use_profile` | `boolean` | 生成子进程时使用用户 shell profile。 |
| `project_root_markers` | `array<string>` | 项目根目录标记文件名列表；在搜索父目录查找项目根目录时使用。 |
| `project_doc_max_bytes` | `number` | 构建项目指令时从 `AGENTS.md` 读取的最大字节数。 |
| `project_doc_fallback_filenames` | `array<string>` | `AGENTS.md` 缺失时尝试的额外文件名。 |
| `history.persistence` | `save-all \| none` | 控制 Codex 是否将会话记录保存到 history.jsonl。 |
| `tool_output_token_limit` | `number` | 在历史记录中存储单个工具/函数输出的 token 预算。 |
| `background_terminal_max_timeout` | `number` | 空 `write_stdin` 轮询的最大轮询窗口（毫秒）（后台终端轮询）。默认：`300000`（5 分钟）。替代旧版 `background_terminal_timeout` 键。 |
| `history.max_bytes` | `number` | 设置后，通过丢弃最旧条目来限制历史文件大小（字节）。 |
| `file_opener` | `vscode \| vscode-insiders \| windsurf \| cursor \| none` | 用于打开 Codex 输出中引用的 URI 方案（默认：`vscode`）。 |
| `otel.environment` | `string` | 应用于发出的 OpenTelemetry 事件的环境标签（默认：`dev`）。 |
| `otel.exporter` | `none \| otlp-http \| otlp-grpc` | 选择 OpenTelemetry exporter 并提供端点元数据。 |
| `otel.trace_exporter` | `none \| otlp-http \| otlp-grpc` | 选择 OpenTelemetry 追踪 exporter 并提供端点元数据。 |
| `otel.metrics_exporter` | `none \| statsig \| otlp-http \| otlp-grpc` | 选择 OpenTelemetry 指标 exporter（默认为 `statsig`）。 |
| `otel.log_user_prompt` | `boolean` | 选择随 OpenTelemetry 日志导出原始用户提示词。 |
| `otel.exporter.<id>.endpoint` | `string` | OTEL 日志的 exporter 端点。 |
| `otel.exporter.<id>.protocol` | `binary \| json` | OTLP/HTTP exporter 使用的协议。 |
| `otel.exporter.<id>.headers` | `map<string,string>` | OTEL exporter 请求中包含的静态头。 |
| `otel.trace_exporter.<id>.endpoint` | `string` | OTEL 日志的追踪 exporter 端点。 |
| `otel.trace_exporter.<id>.protocol` | `binary \| json` | OTLP/HTTP 追踪 exporter 使用的协议。 |
| `otel.trace_exporter.<id>.headers` | `map<string,string>` | OTEL 追踪 exporter 请求中包含的静态头。 |
| `otel.exporter.<id>.tls.ca-certificate` | `string` | OTEL exporter TLS 的 CA 证书路径。 |
| `otel.exporter.<id>.tls.client-certificate` | `string` | OTEL exporter TLS 的客户端证书路径。 |
| `otel.exporter.<id>.tls.client-private-key` | `string` | OTEL exporter TLS 的客户端私钥路径。 |
| `otel.trace_exporter.<id>.tls.ca-certificate` | `string` | OTEL 追踪 exporter TLS 的 CA 证书路径。 |
| `otel.trace_exporter.<id>.tls.client-certificate` | `string` | OTEL 追踪 exporter TLS 的客户端证书路径。 |
| `otel.trace_exporter.<id>.tls.client-private-key` | `string` | OTEL 追踪 exporter TLS 的客户端私钥路径。 |
| `tui` | `table` | TUI 特定选项，如启用内联桌面通知。 |
| `tui.notifications` | `boolean \| array<string>` | 启用 TUI 通知；可选限制为特定事件类型。 |
| `tui.notification_method` | `auto \| osc9 \| bel` | 终端通知的通知方式（默认：auto）。 |
| `tui.notification_condition` | `unfocused \| always` | 控制 TUI 通知仅在终端未聚焦时触发还是无论聚焦与否都触发。默认为 `unfocused`。 |
| `tui.animations` | `boolean` | 启用终端动画（欢迎屏幕、微光、旋转指示器）（默认：true）。 |
| `tui.alternate_screen` | `auto \| always \| never` | 控制 TUI 的备用屏幕使用（默认：auto；在 Zellij 中 auto 会跳过以保留回滚）。 |
| `tui.vim_mode_default` | `boolean` | 以 Vim 普通模式而非插入模式启动编辑器（默认：false）。你仍可通过 `/vim` 按会话切换。 |
| `tui.raw_output_mode` | `boolean` | 以原始回滚模式启动 TUI，便于复制友好的终端选择（默认：false）。可通过 `/raw` 或默认的 `alt-r` 快捷键切换。 |
| `tui.show_tooltips` | `boolean` | 在 TUI 欢迎屏幕中显示引导提示（默认：true）。 |
| `tui.status_line` | `array<string> \| null` | TUI 底部状态行项标识符的有序列表。`null` 禁用状态行。 |
| `tui.terminal_title` | `array<string> \| null` | 终端窗口/标签页标题项标识符的有序列表。默认为 `["spinner", "project"]`；`null` 禁用标题更新。 |
| `tui.theme` | `string` | 语法高亮主题覆盖（kebab-case 主题名称）。 |
| `tui.keymap.<context>.<action>` | `string \| array<string>` | TUI 操作的键盘快捷键绑定。支持的上下文包括 `global`、`chat`、`composer`、`editor`、`pager`、`list` 和 `approval`；上下文特定绑定覆盖 `tui.keymap.global`。 |
| `tui.keymap.<context>.<action> = []` | `empty array` | 在该键映射上下文中解绑操作。键名使用规范化字符串，如 `ctrl-a`、`shift-enter`、`page-down` 或 `minus`。 |
| `plugins.<plugin>.mcp_servers.<server>.enabled` | `boolean` | 在不更改插件清单的情况下启用或禁用已安装插件捆绑的 MCP 服务器。 |
| `plugins.<plugin>.mcp_servers.<server>.default_tools_approval_mode` | `auto \| prompt \| approve` | 插件提供的 MCP 服务器上工具的默认审批行为。 |
| `plugins.<plugin>.mcp_servers.<server>.enabled_tools` | `array<string>` | 插件提供的 MCP 服务器公开的工具允许列表。 |
| `plugins.<plugin>.mcp_servers.<server>.disabled_tools` | `array<string>` | 在 `enabled_tools` 之后应用的插件提供的 MCP 服务器拒绝列表。 |
| `plugins.<plugin>.mcp_servers.<server>.tools.<tool>.approval_mode` | `auto \| prompt \| approve` | 插件提供的 MCP 工具的按工具审批行为覆盖。 |
| `tui.model_availability_nux.<model>` | `integer` | 按模型 slug 键控的内部启动提示状态。 |
| `hide_agent_reasoning` | `boolean` | 在 TUI 和 `codex exec` 输出中抑制推理事件。 |
| `show_raw_agent_reasoning` | `boolean` | 当活动模型发出原始推理内容时将其显示。 |
| `disable_paste_burst` | `boolean` | 禁用 TUI 中的突发粘贴检测。 |
| `windows_wsl_setup_acknowledged` | `boolean` | 跟踪 Windows 引导确认（仅限 Windows）。 |
| `chatgpt_base_url` | `string` | 覆盖 ChatGPT 登录流程中使用的基础 URL。 |
| `cli_auth_credentials_store` | `file \| keyring \| auto` | 控制 CLI 存储缓存凭据的位置（基于文件的 auth.json 与操作系统密钥链）。 |
| `mcp_oauth_credentials_store` | `auto \| file \| keyring` | MCP OAuth 凭据的首选存储。 |
| `mcp_oauth_callback_port` | `integer` | MCP OAuth 登录期间本地 HTTP 回调服务器的可选固定端口。未设置时，Codex 绑定到操作系统选择的临时端口。 |
| `mcp_oauth_callback_url` | `string` | MCP OAuth 登录的可选重定向 URI 覆盖（例如 devbox 入口 URL）。`mcp_oauth_callback_port` 仍控制回调监听端口。 |
| `experimental_use_unified_exec_tool` | `boolean` | 启用统一 exec 的旧版名称；推荐使用 `[features].unified_exec` 或 `codex --enable unified_exec`。 |
| `tools.web_search` | `boolean \| { context_size = "low\|medium\|high", allowed_domains = [string], location = { country, region, city, timezone } }` | 可选的网络搜索工具配置。旧版布尔形式仍可接受，但对象形式允许你设置搜索上下文大小、允许的域名和大致用户位置。 |
| `tools.view_image` | `boolean` | 启用本地图像附件工具 `view_image`。 |
| `web_search` | `disabled \| cached \| live` | 网络搜索模式（默认：`"cached"`；cached 使用 OpenAI 维护的索引，不获取实时页面；如果使用 `--yolo` 或其他完全访问沙箱设置，则默认为 `"live"`）。使用 `"live"` 从网络获取最新数据，使用 `"disabled"` 移除该工具。 |
| `default_permissions` | `string` | 应用于沙箱化工具调用的默认权限 profile 名称。内置值为 `:read-only`、`:workspace` 和 `:danger-full-access`；自定义 profile 名称需要匹配的 `[permissions.<name>]` 表。不要与 `sandbox_mode` 或 `[sandbox_workspace_write]` 组合使用。 |
| `permissions.<name>.description` | `string` | 此命名 profile 的人类可读描述。profile 不会通过 `extends` 继承其父级的描述。 |
| `permissions.<name>.extends` | `string` | 在此命名 profile 之前应用的可选父 profile。设为另一个命名 profile、`:read-only` 或 `:workspace`；`:danger-full-access`、未定义的父级和循环将被拒绝。 |
| `permissions.<name>.workspace_roots` | `table` | profile 定义的工作区根目录，与会话的运行时工作区根目录一起接收 `:workspace_roots` 文件系统规则。 |
| `permissions.<name>.workspace_roots.<path>` | `boolean` | 设为 `true` 时将路径纳入 profile 的工作区根目录集。禁用的条目保持非活动状态。 |
| `permissions.<name>.filesystem` | `table` | 命名文件系统权限 profile。每个键是绝对路径或特殊 token，如 `:minimal` 或 `:workspace_roots`。 |
| `permissions.<name>.filesystem.glob_scan_max_depth` | `number` | 在沙箱启动前快照匹配的平台上扩展拒绝读取 glob 模式的最大深度。设置时至少为 `1`。 |
| `permissions.<name>.filesystem.<path-or-glob>` | `"read" \| "write" \| "deny" \| table` | 为路径、glob 模式或特殊 token 授予直接访问权限，或在该根目录下限定嵌套条目。使用 `"deny"` 拒绝匹配路径的读取。 |
| `permissions.<name>.filesystem.":workspace_roots".<subpath-or-glob>` | `"read" \| "write" \| "deny"` | 相对于每个有效工作区根目录的限定文件系统访问。使用 `"."` 表示根目录本身；glob 子路径如 `"**/*.env"` 可使用 `"deny"` 拒绝读取。 |
| `permissions.<name>.network.enabled` | `boolean` | 为此命名权限 profile 启用网络访问。这会更改沙箱网络策略；它本身不会启动网络代理。 |
| `permissions.<name>.network.proxy_url` | `string` | 此权限 profile 启用沙箱化网络时使用的 HTTP 监听 URL。 |
| `permissions.<name>.network.enable_socks5` | `boolean` | 此权限 profile 启用沙箱化网络时暴露 SOCKS5 支持。 |
| `permissions.<name>.network.socks_url` | `string` | 此权限 profile 使用的 SOCKS5 代理端点。 |
| `permissions.<name>.network.enable_socks5_udp` | `boolean` | 启用时允许通过 SOCKS5 监听器进行 UDP。 |
| `permissions.<name>.network.allow_upstream_proxy` | `boolean` | 允许沙箱化网络通过另一个上游代理进行链接。 |
| `permissions.<name>.network.dangerously_allow_non_loopback_proxy` | `boolean` | 允许沙箱化网络监听器使用非回环绑定地址。启用可能会将监听器暴露到 localhost 之外。 |
| `permissions.<name>.network.dangerously_allow_all_unix_sockets` | `boolean` | 允许任意 Unix 套接字目标而非默认的受限集。仅在严格控制的环境中使用。 |
| `permissions.<name>.network.mode` | `limited \| full` | 用于子进程流量的网络代理模式。 |
| `permissions.<name>.network.domains` | `table` | 沙箱化网络的域名规则。支持精确主机、`*.example.com`（仅子域名）、`**.example.com`（顶级域名加子域名）和全局 `*` 允许规则。冲突时 `deny` 优先。 |
| `permissions.<name>.network.domains.<pattern>` | `allow \| deny` | 允许或拒绝精确主机或范围限定通配符模式，如 `*.example.com` 或 `**.example.com`。 |
| `permissions.<name>.network.unix_sockets` | `table` | 沙箱化网络的 Unix 套接字允许列表覆盖。使用套接字路径作为键；`allow` 添加路径，`deny` 拒绝。 |
| `permissions.<name>.network.unix_sockets.<path>` | `allow \| deny` | 使用 `allow` 将绝对 Unix 套接字路径添加到有效允许列表，或使用 `deny` 拒绝。被拒绝的条目将从有效允许列表中移除。 |
| `permissions.<name>.network.allow_local_binding` | `boolean` | 允许通过沙箱化网络进行更广泛的本地/私有网络访问。当此项保持 `false` 时，精确的本地 IP 字面量或 `localhost` 允许规则仍可允许特定本地目标。 |
| `projects.<path>.trust_level` | `string` | 将项目或工作树标记为受信任或不受信任（`"trusted"` \| `"untrusted"`）。不受信任的项目跳过项目范围的 `.codex/` 层，包括项目本地配置、钩子和规则。 |
| `notice.hide_full_access_warning` | `boolean` | 跟踪完全访问警告提示的确认。 |
| `notice.hide_world_writable_warning` | `boolean` | 跟踪 Windows 世界可写目录警告的确认。 |
| `notice.hide_rate_limit_model_nudge` | `boolean` | 跟踪速率限制模型切换提醒的退出。 |
| `notice.hide_gpt5_1_migration_prompt` | `boolean` | 跟踪 GPT-5.1 迁移提示的确认。 |
| `notice.hide_gpt-5.1-codex-max_migration_prompt` | `boolean` | 跟踪 gpt-5.1-codex-max 迁移提示的确认。 |
| `notice.model_migrations` | `map<string,string>` | 跟踪已确认的模型迁移为旧->新映射。 |
| `forced_login_method` | `chatgpt \| api` | 限制 Codex 使用特定身份验证方法。 |
| `forced_chatgpt_workspace_id` | `string (uuid)` | 将 ChatGPT 登录限制为特定工作区标识符。 |

你可以在[此处](https://developers.openai.com/codex/config-schema.json)找到 `config.toml` 的最新 JSON schema。

要在 VS Code 或 Cursor 中编辑 `config.toml` 时获得自动补全和诊断，可以安装 [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml) 扩展并将此行添加到 `config.toml` 的顶部：

```toml
#:schema https://developers.openai.com/codex/config-schema.json
```

注意：将 `experimental_instructions_file` 重命名为 `model_instructions_file`。Codex 弃用了旧键；请将现有配置更新为新名称。

## `requirements.toml`

`requirements.toml` 是管理员强制执行的配置文件，用于约束用户无法覆盖的安全敏感设置。有关详情、位置和示例，请参阅[管理员强制执行的要求](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

对于 ChatGPT Business 和 Enterprise 用户，Codex 还可以应用从云端获取的要求。有关优先级详情，请参阅安全页面。

在 `requirements.toml` 中使用 `[features]` 来固定功能标志，使用与 `config.toml` 相同的规范键。省略的键不受约束。

### `requirements.toml` 配置项

| 键 | 类型 | 描述 |
|---|---|---|
| `allowed_approval_policies` | `array<string>` | `approval_policy` 的允许值（例如 `untrusted`、`on-request`、`never` 和 `granular`）。 |
| `allowed_approvals_reviewers` | `array<string>` | `approvals_reviewer` 的允许值，如 `user` 和 `auto_review`。 |
| `guardian_policy_config` | `string` | 用于自动审查的托管 Markdown 疗略指令。优先于本地 `[auto_review].policy`。空值将被忽略。 |
| `allowed_sandbox_modes` | `array<string>` | `sandbox_mode` 的允许值。 |
| `remote_sandbox_config` | `array<table>` | 主机特定的沙箱要求。`hostname_patterns` 匹配已解析主机名的第一个条目会覆盖该要求源的顶级 `allowed_sandbox_modes`。主机特定条目目前仅覆盖沙箱模式。 |
| `remote_sandbox_config[].hostname_patterns` | `array<string>` | 不区分大小写的主机名模式。支持 `*` 匹配任意字符序列，`?` 匹配单个字符。 |
| `remote_sandbox_config[].allowed_sandbox_modes` | `array<string>` | 此主机特定条目匹配时应用的允许沙箱模式。 |
| `allowed_web_search_modes` | `array<string>` | `web_search` 的允许值（`disabled`、`cached`、`live`）。`disabled` 始终允许；空列表实际上仅允许 `disabled`。 |
| `allow_managed_hooks_only` | `boolean` | 设为 `true` 时，Codex 跳过用户、项目、会话和插件钩子，同时仍允许来自 `requirements.toml` 和其他托管配置层的托管钩子。 |
| `plugin_sharing` | `boolean` | 在云端托管的 `requirements.toml` 中设为 `false` 可禁用本地构建插件的工作区共享。 |
| `features` | `table` | 按 `config.toml` 的 `[features]` 表中的规范名称键控的固定功能值。 |
| `features.<name>` | `boolean` | 要求特定的规范功能键保持启用或禁用。 |
| `features.in_app_browser` | `boolean` | 在 `requirements.toml` 中设为 `false` 可禁用应用内浏览器面板。 |
| `features.browser_use` | `boolean` | 在 `requirements.toml` 中设为 `false` 可禁用 Browser Use 和 Browser Agent 可用性。 |
| `features.computer_use` | `boolean` | 在 `requirements.toml` 中设为 `false` 可禁用 Computer Use 可用性和相关安装或启用流程。 |
| `experimental_network` | `table` | 从 `requirements.toml` 强制执行的网络访问要求。这些约束与 `features.network_proxy` 分开，可以在没有用户功能标志的情况下配置沙箱化网络。 |
| `experimental_network.enabled` | `boolean` | 启用沙箱化网络要求。当活动沙箱保持命令网络关闭时，这不会授予网络访问权限。 |
| `experimental_network.http_port` | `integer` | 用于 `[experimental_network]` 要求的回环 HTTP 监听端口。 |
| `experimental_network.socks_port` | `integer` | 用于 `[experimental_network]` 要求的回环 SOCKS5 监听端口。 |
| `experimental_network.allow_upstream_proxy` | `boolean` | 允许沙箱化网络通过环境中的上游代理进行链接。 |
| `experimental_network.dangerously_allow_non_loopback_proxy` | `boolean` | 允许 `[experimental_network]` 要求使用非回环监听地址。启用可能会将监听器暴露到 localhost 之外。 |
| `experimental_network.dangerously_allow_all_unix_sockets` | `boolean` | 允许任意 Unix 套接字目标而非仅允许列表访问。仅在严格控制的环境中使用。 |
| `experimental_network.domains` | `map<string, allow \| deny>` | 沙箱化网络的 map 形式管理员域名策略。支持精确主机、`*.example.com`（仅子域名）、`**.example.com`（顶级域名加子域名）和全局 `*` 允许规则；建议使用范围限定规则，因为 `*` 会广泛开放公共出站访问。冲突时 `deny` 优先。不要与 `experimental_network.allowed_domains` 或 `experimental_network.denied_domains` 组合使用。 |
| `experimental_network.allowed_domains` | `array<string>` | 沙箱化网络的 list 形式管理员允许规则。不要与 `experimental_network.domains` 组合使用。 |
| `experimental_network.denied_domains` | `array<string>` | 沙箱化网络的 list 形式管理员拒绝规则。不要与 `experimental_network.domains` 组合使用。 |
| `experimental_network.managed_allowed_domains_only` | `boolean` | 设为 `true` 时，仅管理员管理的允许规则在沙箱化网络要求激活时保持有效；用户的允许列表添加将被忽略。没有托管允许规则时，用户添加的域名允许规则不会保持有效。 |
| `experimental_network.unix_sockets` | `map<string, allow \| deny>` | 沙箱化网络的管理员管理 Unix 套接字策略。 |
| `experimental_network.allow_local_binding` | `boolean` | 允许沙箱化网络进行更广泛的本地/私有网络访问。当此项保持 `false` 时，精确的本地 IP 字面量或 `localhost` 允许规则仍可允许特定本地目标。 |
| `hooks` | `table` | 管理员强制执行的托管生命周期钩子。需要托管钩子目录，使用与 `config.toml` 中内联 `[hooks]` 相同的事件 schema。 |
| `hooks.managed_dir` | `string (absolute path)` | macOS 和 Linux 上包含托管钩子脚本的目录。Codex 在加载托管钩子前验证其为绝对路径且存在。 |
| `hooks.windows_managed_dir` | `string (absolute path)` | Windows 上包含托管钩子脚本的目录。Codex 在加载托管钩子前验证其为绝对路径且存在。 |
| `hooks.<Event>` | `array<table>` | 钩子事件的匹配器组，如 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SubagentStart`、`SubagentStop`、`UserPromptSubmit` 或 `Stop`。 |
| `hooks.<Event>[].hooks` | `array<table>` | 匹配器组的钩子处理器。目前支持命令钩子；提示词和代理钩子处理器会被解析但跳过。 |
| `hooks.<Event>[].hooks[].commandWindows` | `string` | 命令钩子的 Windows 专用命令覆盖。TOML 别名 `command_windows` 也可接受。 |
| `permissions.filesystem.deny_read` | `array<string>` | 管理员强制执行的文件系统读取拒绝。条目可以是路径或 glob 模式，用户无法通过本地配置削弱它们。 |
| `mcp_servers` | `table` | 可启用的 MCP 服务器允许列表。服务器名称（`<id>`）和其标识必须匹配，MCP 服务器才能被启用。任何不在允许列表中（或标识不匹配）的已配置 MCP 服务器将被禁用。 |
| `mcp_servers.<id>.identity` | `table` | 单个 MCP 服务器的标识规则。设置 `command`（stdio）或 `url`（可流式传输 HTTP）。 |
| `mcp_servers.<id>.identity.command` | `string` | 当 MCP stdio 服务器的 `mcp_servers.<id>.command` 匹配此命令时允许。 |
| `mcp_servers.<id>.identity.url` | `string` | 当 MCP 可流式传输 HTTP 服务器的 `mcp_servers.<id>.url` 匹配此 URL 时允许。 |
| `rules` | `table` | 管理员强制执行的命令规则，与 `.rules` 文件合并。要求规则必须是限制性的。 |
| `rules.prefix_rules` | `array<table>` | 强制执行的前缀规则列表。每条规则必须包含 `pattern` 和 `decision`。 |
| `rules.prefix_rules[].pattern` | `array<table>` | 以模式 token 表示的命令前缀。每个 token 设置 `token` 或 `any_of`。 |
| `rules.prefix_rules[].pattern[].token` | `string` | 此位置的单个字面量 token。 |
| `rules.prefix_rules[].pattern[].any_of` | `array<string>` | 此位置允许的替代 token 列表。 |
| `rules.prefix_rules[].decision` | `prompt \| forbidden` | 必填。要求规则只能提示或禁止（不能允许）。 |
| `rules.prefix_rules[].justification` | `string` | 在审批提示或拒绝消息中显示的可选非空理由。 |
