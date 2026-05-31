# Model Context Protocol

Model Context Protocol (MCP) 将模型连接到工具和上下文。你可以使用它让 Codex 访问第三方文档，或者让它与浏览器或 Figma 等开发者工具进行交互。

Codex 在 CLI 和 IDE 扩展中均支持 MCP 服务器。

## 支持的 MCP 功能

- **STDIO 服务器**：作为本地进程运行的服务器（由命令启动）。
  - 环境变量
- **Streamable HTTP 服务器**：通过地址访问的服务器。
  - Bearer token 认证
  - OAuth 认证（对支持 OAuth 的服务器运行 `codex mcp login <server-name>`）
- **服务器指令**：Codex 读取初始化时返回的 MCP `instructions` 字段，并将其作为服务器级别的指导，与服务器的工具一起使用。

如果你为 Codex 构建或维护 MCP 服务器，请使用 `instructions` 来定义跨工具的工作流、约束和适用于整个服务器的速率限制。将前 512 个字符保持自包含，这样在 Codex 决定如何使用服务器时，最重要的指导信息就能被获取到。

## 将 Codex 连接到 MCP 服务器

Codex 将 MCP 配置存储在 `config.toml` 中，与其他 Codex 配置设置放在一起。默认路径为 `~/.codex/config.toml`，但你也可以通过 `.codex/config.toml` 将 MCP 服务器限定在项目范围内（仅限受信任的项目）。

CLI 和 IDE 扩展共享此配置。配置好 MCP 服务器后，你可以在两个 Codex 客户端之间切换，无需重新设置。

要配置 MCP 服务器，选择以下方式之一：

1. **使用 CLI**：运行 `codex mcp` 来添加和管理服务器。
2. **编辑 `config.toml`**：直接更新 `~/.codex/config.toml`（或受信任项目中的项目级 `.codex/config.toml`）。

### 使用 CLI 配置

#### 添加 MCP 服务器

```bash
codex mcp add <server-name> --env VAR1=VALUE1 --env VAR2=VALUE2 -- <stdio server-command>
```

例如，要添加 Context7（一个免费的开发者文档 MCP 服务器），你可以运行以下命令：

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

#### 其他 CLI 命令

要查看所有可用的 MCP 命令，可以运行 `codex mcp --help`。

#### 终端 UI (TUI)

在 `codex` TUI 中，使用 `/mcp` 查看你活跃的 MCP 服务器。

### 使用 config.toml 配置

要对 MCP 服务器选项进行更精细的控制，请编辑 `~/.codex/config.toml`（或项目级 `.codex/config.toml`）。在 IDE 扩展中，从齿轮菜单中选择 **MCP settings** > **Open config.toml**。

在配置文件中使用 `[mcp_servers.<server-name>]` 表来配置每个 MCP 服务器。

#### STDIO 服务器

- `command`（必需）：启动服务器的命令。
- `args`（可选）：传递给服务器的参数。
- `env`（可选）：为服务器设置的环境变量。
- `env_vars`（可选）：允许并转发的环境变量。
- `cwd`（可选）：启动服务器时的工作目录。
- `experimental_environment`（可选）：设置为 `remote` 可在远程执行器环境可用时通过其启动 stdio 服务器。

`env_vars` 可以包含纯变量名或带有 source 的对象：

```toml
env_vars = ["LOCAL_TOKEN", { name = "REMOTE_TOKEN", source = "remote" }]
```

字符串条目和 `source = "local"` 从 Codex 的本地环境读取。
`source = "remote"` 从远程执行器环境读取，并需要远程 MCP stdio。

#### Streamable HTTP 服务器

- `url`（必需）：服务器地址。
- `bearer_token_env_var`（可选）：用于在 `Authorization` 中发送 bearer token 的环境变量名。
- `http_headers`（可选）：请求头名称到静态值的映射。
- `env_http_headers`（可选）：请求头名称到环境变量名的映射（值从环境中获取）。

#### 其他配置选项

- `startup_timeout_sec`（可选）：服务器启动超时时间（秒）。默认值：`10`。
- `tool_timeout_sec`（可选）：服务器运行工具的超时时间（秒）。默认值：`60`。
- `enabled`（可选）：设置为 `false` 可在不删除服务器的情况下禁用它。
- `required`（可选）：设置为 `true` 可在该已启用的服务器无法初始化时使启动失败。
- `enabled_tools`（可选）：工具允许列表。
- `disabled_tools`（可选）：工具拒绝列表（在 `enabled_tools` 之后应用）。
- `default_tools_approval_mode`（可选）：此服务器工具的默认审批行为。支持的值为 `auto`、`prompt` 和 `approve`。
- `tools.<tool>.approval_mode`（可选）：每个工具的审批行为覆盖。

如果你的 OAuth 提供商需要固定的回调端口，请在 `config.toml` 中设置顶层的 `mcp_oauth_callback_port`。如果未设置，Codex 会绑定到临时端口。

如果你的 MCP OAuth 流程必须使用特定的回调 URL（例如远程 Devbox 入口 URL 或自定义回调路径），请设置 `mcp_oauth_callback_url`。Codex 将此值用作 OAuth `redirect_uri`，同时仍然使用 `mcp_oauth_callback_port` 作为回调监听端口。本地回调 URL（例如 `localhost`）绑定在本地接口上；非本地回调 URL 绑定在 `0.0.0.0` 上，以便回调能够到达主机。

如果 MCP 服务器公布了 `scopes_supported`，Codex 会在 OAuth 登录期间优先使用这些服务器公布的 scopes。否则，Codex 会回退到 `config.toml` 中配置的 scopes。

#### config.toml 示例

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
env_vars = ["LOCAL_TOKEN"]

[mcp_servers.context7.env]
MY_ENV_VAR = "MY_ENV_VALUE"
```

```toml
# 可选的 MCP OAuth 回调覆盖（由 `codex mcp login` 使用）
mcp_oauth_callback_port = 5555
mcp_oauth_callback_url = "https://devbox.example.internal/callback"
```

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
```

```toml
[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled_tools = ["open", "screenshot"]
disabled_tools = ["screenshot"] # applied after enabled_tools
default_tools_approval_mode = "prompt"
startup_timeout_sec = 20
tool_timeout_sec = 45
enabled = true

[mcp_servers.chrome_devtools.tools.open]
approval_mode = "approve"
```

### 插件提供的 MCP 服务器

已安装的插件可以在其插件清单中捆绑 MCP 服务器。这些服务器从插件启动，因此用户配置不会设置其传输命令。用户配置仍然可以在 `plugins.<plugin>.mcp_servers.<server>` 下控制开关状态和工具策略。

```toml
[plugins."sample@test".mcp_servers.sample]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["read", "search"]

[plugins."sample@test".mcp_servers.sample.tools.search]
approval_mode = "approve"
```

## 实用 MCP 服务器示例

MCP 服务器的列表在不断增长。以下是一些常见的服务器：

- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)：搜索和阅读 OpenAI 开发者文档。
- [Context7](https://github.com/upstash/context7)：连接到最新的开发者文档。
- Figma [本地](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/) 和 [远程](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)：访问你的 Figma 设计。
- [Playwright](https://www.npmjs.com/package/@playwright/mcp)：使用 Playwright 控制和检查浏览器。
- [Chrome Developer Tools](https://github.com/ChromeDevTools/chrome-devtools-mcp/)：控制和检查 Chrome。
- [Sentry](https://docs.sentry.io/product/sentry-mcp/#codex)：访问 Sentry 日志。
- [GitHub](https://github.com/github/github-mcp-server)：管理 `git` 之外的 GitHub 功能（例如 pull requests 和 issues）。
