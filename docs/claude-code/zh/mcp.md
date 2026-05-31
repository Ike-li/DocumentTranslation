> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件发现所有可用页面。

# 通过 MCP 将 Claude Code 连接到工具

> 了解如何通过模型上下文协议将 Claude Code 连接到您的工具。

Claude Code 可以通过[模型上下文协议 (MCP)](https://modelcontextprotocol.io/introduction)（一种用于 AI 工具集成的开源标准）连接到数百个外部工具和数据源。MCP 服务器让 Claude Code 能够访问您的工具、数据库和 API。

当您发现自己从另一个工具（如问题跟踪器或监控仪表盘）将数据复制粘贴到聊天中时，可以连接一个服务器。连接后，Claude 可以直接读取该系统并采取行动，而不是基于您粘贴的内容进行工作。

## 通过 MCP 可以做什么

连接 MCP 服务器后，您可以要求 Claude Code：

* **根据问题跟踪器实现功能**：“添加 JIRA 问题 ENG-4521 中描述的功能，并在 GitHub 上创建 PR。”
* **分析监控数据**：“检查 Sentry 和 Statsig，了解 ENG-4521 描述功能的使用情况。”
* **查询数据库**：“根据我们的 PostgreSQL 数据库，找出 10 位使用过 ENG-4521 功能的随机用户的电子邮件。”
* **集成设计**：“根据 Slack 中发布的新 Figma 设计更新我们的标准电子邮件模板。”
* **自动化工作流**：“创建 Gmail 草稿，邀请这 10 位用户参加关于新功能的反馈会议。”
* **响应外部事件**：MCP 服务器也可以作为一个[渠道](/zh/channels)，将消息推送至您的会话，以便在您离开时，Claude 能对 Telegram 消息、Discord 聊天或 webhook 事件做出反应。

## 查找和构建 MCP 服务器

在 [Anthropic 目录](https://claude.ai/directory)中浏览经过审查的连接器。目录连接器使用与 Claude Code 相同的 MCP 基础设施，因此您可以使用 `claude mcp add` 命令添加其中列出的任何远程服务器。

  在连接每个服务器前，请先验证您是否信任该服务器。获取外部内容的服务器可能会让您面临[提示词注入风险](/zh/security#protect-against-prompt-injection)。

要构建您自己的服务器，请参阅 [MCP 服务器指南](https://modelcontextprotocol.io/docs/develop/build-server) 了解协议基础，并查看 [Claude 连接器构建文档](https://claude.com/docs/connectors/building) 获取认证、测试及目录提交的相关信息。

您也可以让 Claude 使用官方 [`mcp-server-dev` 插件](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/mcp-server-dev) 为您搭建服务器框架。


    在 Claude Code 会话中，运行：
    ```
    /plugin install mcp-server-dev@claude-plugins-official
    ```
    如果 Claude Code 报告市场未找到，请先运行 `/plugin marketplace add anthropics/claude-plugins-official`，然后重试安装。一旦安装完成，运行 `/reload-plugins` 以在当前会话中激活它。



    ```
    /mcp-server-dev:build-mcp-server
    ```
    Claude 会询问您的使用场景，并搭建一个远程 HTTP 或本地标准输入输出服务器。


## 安装 MCP 服务器

MCP 服务器可根据您的需求通过多种方式进行配置：

### 选项 1：添加远程 HTTP 服务器

HTTP 服务器是连接到远程 MCP 服务器的推荐选项。这是基于云的服务最广泛支持的传输方式。
```bash
# Basic syntax
claude mcp add --transport http <name> <url>

# Real example: Connect to Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Example with Bearer token
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```
通过 `.mcp.json`、`~/.claude.json` 或 `claude mcp add-json` 中的 JSON 配置 MCP 服务器时，`type` 字段接受 `streamable-http` 作为 `http` 的别名。MCP 规范为该传输方式使用了 `streamable-http` 这一名称，因此从服务器文档复制的配置无需修改即可使用。

### 选项 2：添加远程 SSE 服务器

  SSE (Server-Sent Events) 传输已弃用。在可用的情况下，请改用 HTTP 服务器替代。


```bash
# Basic syntax
claude mcp add --transport sse <name> <url>

# Real example: Connect to Asana
claude mcp add --transport sse asana https://mcp.asana.com/sse

# Example with authentication header
claude mcp add --transport sse private-api https://api.company.com/sse \
  --header "X-API-Key: your-key-here"
```
### 选项 3：添加本地 stdio 服务器

Stdio 服务器在您机器上作为本地进程运行。它们非常适合需要直接系统访问权限或自定义脚本的工具。

Claude Code 会在生成的服务器环境中将 `CLAUDE_PROJECT_DIR` 设置为项目根目录，因此您的服务器可以解析项目相对路径，而不依赖于工作目录。这与钩子在其 `CLAUDE_PROJECT_DIR` 变量中接收到的目录相同。您可以在服务器进程内读取它，例如在 Node 中使用 `process.env.CLAUDE_PROJECT_DIR`，在 Python 中使用 `os.environ["CLAUDE_PROJECT_DIR"]`。您的服务器也可以调用 MCP `roots/list` 请求，该请求会返回 Claude Code 启动时的目录。

此变量在服务器环境中设置，而非在 Claude Code 自身环境中设置，因此，在项目或用户作用域的 `.mcp.json` 的 `command` 或 `args` 中通过 `${VAR}` 展开来引用它时，需要设置一个默认值，例如 `${CLAUDE_PROJECT_DIR:-.}`。插件提供的 MCP 配置会直接替换 `${CLAUDE_PROJECT_DIR}`，不需要默认值。
```bash
# Basic syntax
claude mcp add [options] <name> -- <command> [args...]

# Real example: Add Airtable server
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```


  **重要：选项顺序**

  所有选项（`--transport`、`--env`、`--scope`、`--header`）都必须置于服务器名称**之前**。然后使用 `--`（双连字符）将服务器名称与传递给 MCP 服务器的命令和参数分隔开。

  例如：

  * `claude mcp add --transport stdio myserver -- npx server` → 运行 `npx server`
  * `claude mcp add --transport stdio --env KEY=value myserver -- python server.py --port 8080` → 运行 `python server.py --port 8080`，并在环境中设置 `KEY=value`

  这样做可以防止 Claude 的命令行标志与服务器的命令行标志发生冲突。

### 选项 4：添加远程 WebSocket 服务器

WebSocket 服务器维持持久的双向连接，适用于需要未经请求就向 Claude 推送事件的远程 MCP 服务器。如果您的服务器仅响应请求，请改用 HTTP，因为 HTTP 支持 OAuth 和 `claude mcp add --transport` 标志，而 WebSocket 两者均不支持。

在 `.mcp.json` 中配置 WebSocket 服务器或使用 `claude mcp add-json`：
```bash
claude mcp add-json events-server \
  '{"type":"ws","url":"wss://mcp.example.com/socket","headers":{"Authorization":"Bearer YOUR_TOKEN"}}'
```
`type: "ws"` 条目接受与 `http` 相同的 `url`、`headers`、`headersHelper`、`timeout` 和 `alwaysLoad` 字段。身份验证仅限于头部，因此请在 `headers` 中传递静态 token，或在连接时使用 [`headersHelper`](#使用动态头部实现自定义认证) 生成。`claude mcp add --transport` 标志不接受 `ws`。

### 管理你的服务器

配置完成后，你可以使用以下命令管理你的 MCP 服务器：
```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get github

# Remove a server
claude mcp remove github

# (within Claude Code) Check server status
/mcp
```
来自 `.mcp.json` 的项目作用域服务器中，那些等待您批准的会显示在 `claude mcp list` 中，状态为 `⏸ Pending approval`。请交互式运行 `claude` 来查看并批准它们。`claude mcp get <name>` 会显示待处理服务器为 `⏸ Pending approval`，已拒绝服务器为 `✗ Rejected`。

`/mcp` 面板会在每个已连接服务器旁边显示工具数量，并对那些宣告拥有工具能力但未暴露任何工具的服务器进行标记。

如果您的请求需要使用某个仍在后台连接的服务器上的工具，Claude 会等待该服务器就绪后再继续。在启用了[工具搜索](#通过-mcp-将-claude-code-连接到工具)（默认设置）的情况下，等待过程发生在 `ToolSearch` 调用内部。在没有工具搜索的配置中，例如 Vertex AI、自定义 `ANTHROPIC_BASE_URL` 或 `ENABLE_TOOL_SEARCH=false`，Claude 会改用 `WaitForMcpServers` 工具。

服务器名称 `workspace` 保留供内部使用。如果您的配置中定义了同名服务器，Claude Code 会在加载时跳过它，并显示警告信息要求您重命名。

### 动态工具更新

Claude Code 支持 MCP 的 `list_changed` 通知，允许 MCP 服务器动态更新其可用的工具、提示词和资源，而无需您断开连接并重新连接。当 MCP 服务器发送 `list_changed` 通知时，Claude Code 会自动刷新来自该服务器的可用能力。

### 自动重连

如果 HTTP 或 SSE 服务器在会话中断开连接，Claude Code 会自动进行指数退避重连：最多五次尝试，从一秒延迟开始，每次延迟时间翻倍。在 `/mcp` 中，服务器在重连过程中显示为待处理状态。五次尝试失败后，服务器将标记为失败，您可以从 `/mcp` 手动重试。Stdio 服务器是本地进程，不会自动重连。

同样的退避策略也适用于 HTTP 或 SSE 服务器在启动时初次连接失败的情况。从 v2.1.121 版本开始，Claude Code 会在遇到瞬态错误（如 5xx 响应、连接被拒绝或超时）时，最多重试初始连接三次，如果仍无法连接，则将服务器标记为失败。认证和未找到错误不会被重试，因为它们需要更改配置才能解决。

### 通过通道推送消息

MCP 服务器也可以直接向您的会话推送消息，以便 Claude 能够响应外部事件，如 CI 结果、监控警报或聊天消息。要启用此功能，您的服务器需要声明 `claude/channel` 能力，并在启动时使用 `--channels` 标志将其纳入。请参阅[通道](/zh/channels)以使用官方支持的通道，或查阅[通道参考](/zh/channels-reference)以构建您自己的通道。

  提示：

  * 使用 `--scope` 标志指定配置存储位置：
    * `local`（默认）：仅对当前项目中的您可用（旧版本中称为 `project`）
    * `project`：通过 `.mcp.json` 文件与项目中的所有人共享
    * `user`：跨所有项目对您可用（旧版本中称为 `global`）
  * 使用 `--env` 标志设置环境变量（例如 `--env KEY=value`）
  * 通过 `MCP_TIMEOUT` 环境变量配置 MCP 服务器启动超时时间（例如 `MCP_TIMEOUT=10000 claude` 设置 10 秒超时）
  * 通过在服务器的 `.mcp.json` 条目中添加以毫秒为单位的 `timeout` 字段来设置每个服务器的工具执行超时时间，例如 `"timeout": 600000` 表示十分钟。此设置仅覆盖该服务器的 `MCP_TOOL_TIMEOUT` 环境变量
  * 当 MCP 工具输出超过 10,000 tokens 时，Claude Code 会显示警告。要增加此限制，请设置 `MAX_MCP_OUTPUT_TOKENS` 环境变量（例如 `MAX_MCP_OUTPUT_TOKENS=50000`）
  * 使用 `/mcp` 对需要 OAuth 2.0 认证的远程服务器进行身份验证

每个服务器的 `timeout` 是针对每次工具调用的硬性墙钟时间限制，服务器发送的进度通知不会延长此时间。低于 1000 的值将被强制调整为至少 1 秒。对于 HTTP 和 SSE 服务器，无论此值如何，首次字节获取请求的最低预算为 60 秒，因此只有工具调用监视器会响应较小的值。

### 插件提供的 MCP 服务器

[插件](/zh/plugins) 可以在启用时自动提供工具和集成，它们能够打包 MCP 服务器。插件 MCP 服务器的工作方式与用户配置的服务器完全相同。

**插件 MCP 服务器的工作原理**：

* 插件在插件根目录的 `.mcp.json` 中或在 `plugin.json` 内联定义 MCP 服务器
* 当插件被启用时，其 MCP 服务器会自动启动
* 插件 MCP 工具会与手动配置的 MCP 工具一同显示
* 插件服务器通过插件安装进行管理（而非 `/mcp` 命令）

**插件 MCP 配置示例**：

在插件根目录的 `.mcp.json` 中：
```json
{
  "mcpServers": {
    "database-tools": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```
或内联于 `plugin.json`：
```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```
**插件 MCP 功能**：

* **自动生命周期**：会话启动时，已启用插件的服务器会自动连接。如果在会话期间启用或禁用某个插件，请运行 `/reload-plugins` 来连接或断开其 MCP 服务器。
* **环境变量**：使用 `${CLAUDE_PLUGIN_ROOT}` 引用捆绑的插件文件，使用 `${CLAUDE_PLUGIN_DATA}` 引用[持久化状态目录](/zh/plugins-reference#persistent-data-directory)（该目录在插件更新后仍保留），使用 `${CLAUDE_PROJECT_DIR}` 引用稳定的项目根目录。
* **用户环境访问权限**：可访问与手动配置服务器相同的环境变量。
* **多种传输类型**：支持 stdio、SSE、HTTP 和 WebSocket 传输（传输支持可能因服务器而异）。

**查看插件 MCP 服务器**：
```bash
# Within Claude Code, see all MCP servers including plugin ones
/mcp
```
插件服务器在列表中显示时带有表明其来自插件的标识。

**插件 MCP 服务器的优势**：

* **捆绑分发**：工具和服务器打包在一起
* **自动设置**：无需手动 MCP 配置
* **团队一致性**：安装插件后每个人获得相同的工具

关于将 MCP 服务器与插件捆绑的详情，请参阅 [插件组件参考](/zh/plugins-reference#mcp-servers)。

## MCP 安装作用域

MCP 服务器可以在三个作用域中进行配置。您选择的作用域控制服务器在哪些项目中加载以及配置是否与团队共享。管理员还可以通过 [托管配置](#通过-mcp-将-claude-code-连接到工具) 在企业级别部署服务器。

| 作用域                  | 加载范围               | 与团队共享               | 存储位置                    |
| ----------------------- | ---------------------- | ------------------------ | --------------------------- |
| [本地](#本地作用域)    | 仅限当前项目           | 否                       | `~/.claude.json`            |
| [项目](#项目范围)  | 仅限当前项目           | 是，通过版本控制         | 项目根目录下的 `.mcp.json` |
| [用户](#用户级)     | 您的所有项目           | 否                       | `~/.claude.json`            |

### 本地作用域

本地作用域是默认设置。本地作用域的服务器仅在您添加它的项目中加载，并且对您私有。Claude Code 将其存储在 `~/.claude.json` 中该项目的路径下，因此相同的服务器不会出现在您的其他项目中。本地作用域适用于个人开发服务器、实验性配置或您不希望纳入版本控制的包含凭据的服务器。

  MCP 服务器中的"本地作用域"概念与常规本地设置不同。MCP 本地作用域的服务器存储于 `~/.claude.json`（用户主目录），而常规本地设置使用 `.claude/settings.local.json`（项目目录内）。具体设置文件位置详情请参阅 [设置](/zh/settings#settings-files)。


```bash
# Add a local-scoped server (default)
claude mcp add --transport http stripe https://mcp.stripe.com

# Explicitly specify local scope
claude mcp add --transport http stripe --scope local https://mcp.stripe.com
```
该命令将服务器写入 `~/.claude.json` 中当前项目的条目内。以下示例展示了从 `/path/to/your/project` 运行命令后的结果：
```json
{
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "stripe": {
          "type": "http",
          "url": "https://mcp.stripe.com"
        }
      }
    }
  }
}
```
### 项目范围

项目范围服务器通过将配置存储在项目根目录的 `.mcp.json` 文件中，实现团队协作。此文件设计用于检入版本控制，确保所有团队成员都能访问相同的 MCP 工具和服务。当您添加项目范围服务器时，Claude Code 会自动创建或更新此文件，并采用相应的配置结构。
```bash
# Add a project-scoped server
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp
```
生成的 `.mcp.json` 文件遵循标准化格式：
```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```
出于安全原因，Claude Code 在使用来自 `.mcp.json` 文件的项目级服务器前会提示用户进行批准。如需重置这些批准选项，请使用 `claude mcp reset-project-choices` 命令。

### 用户级

用户级服务器存储在 `~/.claude.json` 中，提供跨项目可访问性，使其在您机器上的所有项目中可用，同时保持对用户账户的私密性。此范围适用于个人工具服务器、开发工具或您频繁在不同项目中使用的服务。
```bash
# Add a user server
claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```
### 作用域层次与优先级

当同一服务器在多个位置被定义时，Claude Code 仅连接一次，采用优先级最高的来源中的定义。将使用该来源中的完整服务器条目；字段不会跨作用域合并。

1.  本地作用域
2.  项目作用域
3.  用户作用域
4.  [插件提供的服务器](/zh/plugins)
5.  [来自 claude.ai 的连接器](#通过-mcp-将-claude-code-连接到工具)

前三个作用域通过名称匹配重复项。插件和连接器通过端点匹配，因此一个指向与上方服务器相同 URL 或命令的条目将被视为重复项。

### `.mcp.json` 中的环境变量扩展

Claude Code 支持在 `.mcp.json` 文件中进行环境变量扩展，这使得团队可以共享配置，同时保持针对特定机器的路径和敏感值（如 API 密钥）的灵活性。

**支持的语法：**

*   `${VAR}` - 扩展为环境变量 `VAR` 的值
*   `${VAR:-default}` - 如果设置了 `VAR` 则扩展为其值，否则使用 `default`

**可进行扩展的位置：**
环境变量可以在以下位置进行扩展：

*   `command` - 服务器可执行文件路径
*   `args` - 命令行参数
*   `env` - 传递给服务器的环境变量
*   `url` - 用于 HTTP 服务器类型
*   `headers` - 用于 HTTP 服务器认证

**使用变量扩展示例：**
```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```
如果必需环境变量未设置且没有默认值，Claude Code 将无法解析配置。

## 实用示例


```bash
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```
然后编写并运行浏览器测试：
```text
Test if the login flow works with test@example.com
```
```text
Take a screenshot of the checkout page on mobile
```
```text
Verify that the search feature returns results
``` */}
### 示例：使用 Sentry 监控错误
```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```
使用你的 Sentry 账户进行身份验证：
```text
/mcp
```
然后调试生产环境的问题：
```text
What are the most common errors in the last 24 hours?
```

```text
Show me the stack trace for error ID abc123
```

```text
Which deployment introduced these new errors?
```
### 示例：连接 GitHub 进行代码审查

GitHub 的远程 MCP 服务器通过一个作为请求头传递的 GitHub 个人访问令牌进行身份验证。要获取令牌，请打开您的 [GitHub 令牌设置](https://github.com/settings/personal-access-tokens)，生成一个具有访问您希望 Claude 操作的仓库权限的新细粒度令牌，然后添加服务器：
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```
接下来与GitHub协作：
```text
Review PR #456 and suggest improvements
```

```text
Create a new issue for the bug we just found
```

```text
Show me all open PRs assigned to me
```
### 示例：查询您的 PostgreSQL 数据库
```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```
然后自然地查询您的数据库：
```text
What's our total revenue this month?
```

```text
Show me the schema for the orders table
```

```text
Find customers who haven't made a purchase in 90 days
```
## 远程 MCP 服务器身份验证

许多云端 MCP 服务器需要身份验证。Claude Code 支持 OAuth 2.0 以实现安全连接。

当服务器返回 `401 Unauthorized` 或 `403 Forbidden` 响应时，Claude Code 会将该远程服务器标记为需要身份验证。任一状态码都会在 `/mcp` 中标记服务器，以便您完成 OAuth 流程。如果自定义服务器返回指向其授权服务器的 `WWW-Authenticate` 头，也会像其他远程服务器一样获得自动发现。

如果您为服务器配置了 `headers.Authorization` 且服务器拒绝该头，Claude Code 会将连接报告为失败，而不会回退到 OAuth。请检查该 token 是否对 MCP 端点有效，或者移除该头以使用 OAuth 流程。


    例如：
    ```bash
    claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
    ```



    在 Claude Code 中，使用命令：
    ```text
    /mcp
    ```
    然后按照浏览器中的步骤登录。




  提示：

  * 认证令牌已安全存储并自动刷新
  * 使用 `/mcp` 菜单中的"清除认证"选项可撤销访问权限
  * 若浏览器未自动打开，请复制提供的URL并手动打开
  * 如果浏览器在认证后重定向时出现连接错误，请将浏览器地址栏中的完整回调URL粘贴到Claude Code中出现的URL提示符处
  * OAuth认证适用于HTTP服务器

### 使用固定的 OAuth 回调端口

部分 MCP 服务器要求预先注册特定的重定向 URI。默认情况下，Claude Code 会为 OAuth 回调选择一个随机可用端口。使用 `--callback-port` 可以固定该端口，使其匹配预先注册的 `http://localhost:PORT/callback` 形式的重定向 URI。

`--callback-port` 可以单独使用（配合动态客户端注册），也可以与 `--client-id` 一起使用（配合预先配置的凭据）。
```bash
# Fixed callback port with dynamic client registration
claude mcp add --transport http \
  --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```
### 使用预先配置的 OAuth 凭据

一些 MCP 服务器不支持通过动态客户端注册自动设置 OAuth。如果你看到类似 "Incompatible auth server: does not support dynamic client registration" 的错误，则表明该服务器需要预先配置的凭据。Claude Code 也支持使用客户端ID元数据文档（CIMD）而非动态客户端注册的服务器，并且会自动发现这些服务器。如果自动发现失败，请先通过该服务器的开发者门户注册一个 OAuth 应用，然后在添加服务器时提供凭据。


    通过服务器的开发者门户创建一个应用，记下你的客户端ID和客户端密钥。

    许多服务器还需要一个重定向URI。如果需要，请选择一个端口，并注册格式为 `http://localhost:PORT/callback` 的重定向URI。在下一步中，使用相同的端口配合 `--callback-port` 参数。



    选择以下方法之一。用于 `--callback-port` 的端口可以是任何可用端口，只需与您在上一步注册的重定向 URI 相匹配即可。


        使用 `--client-id` 来传递您应用的客户端 ID。`--client-secret` 标志会以掩码输入的方式提示输入密钥：
        ```bash
        claude mcp add --transport http \
          --client-id your-client-id --client-secret --callback-port 8080 \
          my-server https://mcp.example.com/mcp
        ```



        在 JSON 配置中包含 `oauth` 对象，并通过单独的标志传递 `--client-secret`：
        ```bash
        claude mcp add-json my-server \
          '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' \
          --client-secret
        ```



        使用 `--callback-port` 时不指定客户端 ID，以在动态客户端注册期间固定端口：
        ```bash
        claude mcp add-json my-server \
          '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"callbackPort":8080}}'
        ```



        通过环境变量设置 secret 以跳过交互式提示：
        ```bash
        MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
          --client-id your-client-id --client-secret --callback-port 8080 \
          my-server https://mcp.example.com/mcp
        ```





    在 Claude Code 中运行 `/mcp` 并按照浏览器登录流程进行操作。




  提示：

  * 客户端密钥会安全地存储在您的系统密钥串（macOS）或凭据文件中，而非配置文件里
  * 若服务器使用无需密钥的公共 OAuth 客户端，只需使用 `--client-id` 参数，无需配合 `--client-secret`
  * `--callback-port` 参数可单独使用，也可与 `--client-id` 配合使用
  * 以上标志仅适用于 HTTP 和 SSE 传输方式，对 stdio 服务器无效
  * 使用 `claude mcp get <name>` 命令可验证服务器的 OAuth 凭据是否已配置

### 覆盖 OAuth 元数据发现

将 Claude Code 指向特定的 OAuth 授权服务器元数据 URL，以绕过默认的发现链。当 MCP 服务器的标准端点出错，或需要通过内部代理路由发现请求时，请设置 `authServerMetadataUrl`。默认情况下，Claude Code 会首先检查 `/.well-known/oauth-protected-resource` 处的 RFC 9728 受保护资源元数据，然后回退到 `/.well-known/oauth-authorization-server` 处的 RFC 8414 授权服务器元数据。

请在 `.mcp.json` 文件中服务器配置的 `oauth` 对象中设置 `authServerMetadataUrl`：
```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "authServerMetadataUrl": "https://auth.example.com/.well-known/openid-configuration"
      }
    }
  }
}
```
URL 必须使用 `https://`。`authServerMetadataUrl` 要求 Claude Code v2.1.64 或更高版本。元数据 URL 中的 `scopes_supported` 会覆盖上游服务器声明的范围。

### 限制 OAuth 范围

将 `oauth.scopes` 设置为固定 Claude Code 在授权流程中请求的范围。当上游授权服务器声明了超出您希望授予范围的更多范围时，这是将 MCP 服务器限制为安全团队批准的子集的支持方式。该值是一个由空格分隔的字符串，符合 RFC 6749 §3.3 中的 `scope` 参数格式。
```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/mcp",
      "oauth": {
        "scopes": "channels:read chat:write search:read"
      }
    }
  }
}
```
`oauth.scopes` 优先级高于 `authServerMetadataUrl` 和服务器在 `/.well-known` 路径发现的作用域。若不设置此字段，将由 MCP 服务器决定请求的作用域集合。

如果授权服务器在 `scopes_supported` 中声明了 `offline_access`，Claude Code 会将其附加到固定作用域中，使得访问令牌无需重新浏览器登录即可刷新。

若服务器后续因工具调用返回 403 `insufficient_scope` 错误，Claude Code 将使用相同的固定作用域重新认证。当所需工具要求超出固定范围的作用域时，请扩大 `oauth.scopes` 设置。

### 使用动态头部实现自定义认证

若你的 MCP 服务器采用 OAuth 以外的认证方案（例如 Kerberos、短期令牌或内部 SSO），请使用 `headersHelper` 在连接时生成请求头部。Claude Code 会执行该命令并将其输出合并到连接头部中。
```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "/opt/bin/get-mcp-auth-headers.sh"
    }
  }
}
```
该命令也可以内联使用：
```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "echo '{\"Authorization\": \"Bearer '\"$(get-token)\"'\"}'"
    }
  }
}
```
**要求：**

* 命令必须向标准输出 (stdout) 写入一个键值对均为字符串的 JSON 对象
* 命令在一个超时时间为 10 秒的 shell 中运行
* 动态头部会覆盖任何同名的静态 `headers`

该辅助程序在每次连接时（会话开始时及重连时）都会重新运行。没有缓存机制，因此您的脚本需要负责任何 token 的重用。

Claude Code 在执行辅助程序时会设置以下环境变量：

| 变量                          | 值                      |
| :---------------------------- | :------------------------- |
| `CLAUDE_CODE_MCP_SERVER_NAME` | MCP 服务器的名称 |
| `CLAUDE_CODE_MCP_SERVER_URL`  | MCP 服务器的 URL  |

使用这些变量来编写一个可以为多个 MCP 服务器提供服务的单一辅助脚本。

  `headersHelper` 执行任意 shell 命令。当在项目或本地作用域中定义时，它仅在您接受工作区信任对话框后才运行。

## 从 JSON 配置添加 MCP 服务器

如果您拥有 MCP 服务器的 JSON 配置，可以直接添加：


    ```bash
    # Basic syntax
    claude mcp add-json <name> '<json>'

    # Example: Adding an HTTP server with JSON configuration
    claude mcp add-json weather-api '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

    # Example: Adding a stdio server with JSON configuration
    claude mcp add-json local-weather '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'

    # Example: Adding an HTTP server with pre-configured OAuth credentials
    claude mcp add-json my-server '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' --client-secret
    ```



    ```bash
    claude mcp get weather-api
    ```




  提示：

  * 确保 JSON 在您的 Shell 中正确转义
  * JSON 必须符合 MCP 服务器配置模式
  * 您可以使用 `--scope user` 将服务器添加到用户配置而非项目特定的配置

## 从Claude Desktop导入MCP服务器

如果您已在Claude Desktop中配置了MCP服务器，则可以将其导入：


    ```bash
    # Basic syntax 
    claude mcp add-from-claude-desktop 
    ```



    运行命令后，你会看到一个交互式对话框，允许你选择要导入哪些服务器。



    ```bash
    claude mcp list 
    ```




  提示：

  * 此功能仅适用于 macOS 和 Windows Subsystem for Linux (WSL)
  * 它从这些平台上的标准位置读取 Claude Desktop 配置文件
  * 使用 `--scope user` 标志将服务器添加到您的用户配置中
  * 导入的服务器将使用与 Claude Desktop 中相同的名称
  * 如果已存在同名服务器，它们将被添加数字后缀（例如 `server_1`）

## 在 Claude.ai 中使用 MCP 服务器

如果您使用 [Claude.ai](https://claude.ai) 账户登录了 Claude Code，那么您在 Claude.ai 中添加的 MCP 服务器将自动在 Claude Code 中可用：


    在 [claude.ai/customize/connectors](https://claude.ai/customize/connectors) 添加服务器。在 Team 和 Enterprise 套餐中，只有管理员可以添加服务器。



    完成 Claude.ai 中任何所需的认证步骤。



    在Claude Code中，使用命令：
    ```text
    /mcp
    ```
    Claude.ai 服务器出现在列表中，并带有标识表明它们来自 Claude.ai。


仅当您当前的[身份验证方法](/zh/authentication#authentication-precedence)是您的 Claude.ai 订阅时，才会拉取 Claude.ai 连接器。当 `ANTHROPIC_API_KEY`、`ANTHROPIC_AUTH_TOKEN`、`apiKeyHelper` 或第三方提供商（如 Bedrock 或 Vertex）处于活动状态时，即使您之前运行过 `/login`，也不会加载这些连接器。如果 `/mcp` 未列出您添加的连接器，请运行 `/status` 以确认当前活动的身份验证方法，取消设置该环境变量或移除 `apiKeyHelper` 设置，然后运行 `/login` 以选择您的 Claude.ai 账户。

您在 Claude Code 中添加的服务器，如果其 URL 与某个 claude.ai 连接器指向的地址相同，则具有更高的[优先级](#作用域层次与优先级)。发生这种情况时，`/mcp` 会将该连接器列为隐藏，并显示如何移除重复项，以便您更倾向于使用该连接器。

要禁用 Claude Code 中的 claude.ai MCP 服务器，请将环境变量 `ENABLE_CLAUDEAI_MCP_SERVERS` 设置为 `false`：
```bash
ENABLE_CLAUDEAI_MCP_SERVERS=false claude
```
## 将 Claude Code 作为 MCP 服务器使用

您可以将 Claude Code 本身作为 MCP 服务器使用，让其他应用程序可以连接到它：
```bash
# Start Claude as a stdio MCP server
claude mcp serve
```
您可以在 Claude Desktop 中通过将此配置添加到 claude_desktop_config.json 文件来使用此功能：
```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```


  **配置可执行路径**：`command` 字段必须指向 Claude Code 的可执行文件。如果 `claude` 命令不在您系统的 PATH 中，则需要指定该可执行文件的完整路径。

  要查找完整路径：
  ```bash
  which claude
  ```
  然后在配置中使用完整路径：
  ```json
  {
    "mcpServers": {
      "claude-code": {
        "type": "stdio",
        "command": "/full/path/to/claude",
        "args": ["mcp", "serve"],
        "env": {}
      }
    }
  }
  ```
  如果没有正确的可执行路径，你将遇到类似 `spawn claude ENOENT` 的错误。



  提示：

  * 该服务器提供对 Claude 工具（如 View、Edit、LS 等）的访问。
  * 在 Claude Desktop 中，可尝试让 Claude 读取目录中的文件、进行编辑等操作。
  * 请注意，此 MCP 服务器仅将 Claude Code 的工具暴露给您的 MCP 客户端，因此您的客户端需负责为每个工具调用实施用户确认。

## MCP 输出限制与警告

当 MCP 工具产生大量输出时，Claude Code 会协助管理 token 使用量，以避免会话上下文过载：

* **输出警告阈值**：当任何 MCP 工具输出超过 10,000 tokens 时，Claude Code 会显示警告
* **可配置限制**：您可以使用 `MAX_MCP_OUTPUT_TOKENS` 环境变量调整允许的 MCP 最大输出 tokens 数
* **默认限制**：默认最大值为 25,000 tokens
* **作用范围**：该环境变量适用于未声明自身限制的工具。设置了 [`anthropic/maxResultSizeChars`](#为特定工具提高限制) 的工具会将其值用于文本内容，而无论 `MAX_MCP_OUTPUT_TOKENS` 设置为何值。返回图像数据的工具仍受 `MAX_MCP_OUTPUT_TOKENS` 约束

要为产生大量输出的工具提高限制：
```bash
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```
这在使用以下类型的MCP服务器时特别有用：

* 查询大型数据集或数据库
* 生成详细报告或文档
* 处理大量日志文件或调试信息

### 为特定工具提高限制

如果您正在构建MCP服务器，可以通过在工具的 `tools/list` 响应条目中设置 `_meta["anthropic/maxResultSizeChars"]`，允许单个工具返回超过默认持久化到磁盘阈值的结果。Claude Code 会将该工具的阈值提高到注释值，最高不超过500,000个字符的硬性上限。

这对于返回本质上很大但必要的输出的工具非常有用，例如数据库架构或完整的文件树。如果不进行注释，超过默认阈值的结果将被持久化到磁盘，并在对话中替换为文件引用。
```json
{
  "name": "get_schema",
  "description": "Returns the full database schema",
  "_meta": {
    "anthropic/maxResultSizeChars": 200000
  }
}
```
该注解独立于 `MAX_MCP_OUTPUT_TOKENS` 对文本内容生效，因此用户无需为声明了该注解的工具提高环境变量。返回图像数据的工具仍受 token 限制约束。

  如果您经常遇到无法控制的特定 MCP 服务器的输出警告，可以考虑提高 `MAX_MCP_OUTPUT_TOKENS` 的限制。您也可以要求服务器作者添加 `anthropic/maxResultSizeChars` 注解或对响应进行分页。该注解对返回图像内容的工具无效；对于这些工具，提高 `MAX_MCP_OUTPUT_TOKENS` 是唯一的选择。

## 响应 MCP 信息请求

MCP 服务器可以在任务中途通过信息请求向您索取结构化输入。当服务器需要其自身无法获取的信息时，Claude Code 会显示一个交互式对话框，并将您的响应传递回服务器。您无需进行任何配置：当服务器发起请求时，信息请求对话框会自动出现。

服务器可以通过两种方式请求输入：

* **表单模式**：Claude Code 会显示一个由服务器定义的表单字段的对话框（例如，用户名和密码提示）。填写字段并提交。
* **URL 模式**：Claude Code 会打开一个用于认证或授权的浏览器 URL。在浏览器中完成流程，然后在 CLI 中确认。

若想在不显示对话框的情况下自动响应信息请求，请使用 [`Elicitation` 钩子](/zh/hooks#elicitation)。

如果您正在构建使用信息请求功能的 MCP 服务器，请参阅 [MCP 信息请求规范](https://modelcontextprotocol.io/docs/learn/client-concepts#elicitation) 以了解协议详情和 schema 示例。

## 使用 MCP 资源

MCP 服务器可以公开资源，您可以通过 @ 提及来引用这些资源，类似于引用文件的方式。

### 引用 MCP 资源


    在提示词中输入 `@` 即可查看所有已连接 MCP 服务器的可用资源。这些资源会与文件一同显示在自动补全菜单中。



    使用 `@server:protocol://resource/path` 格式来引用资源：
    ```text
    Can you analyze @github:issue://123 and suggest a fix?
    ```

    ```text
    Please review the API documentation at @docs:file://api/authentication
    ```



    您可以在单个提示词中引用多个资源：
    ```text
    Compare @postgres:schema://users with @docs:file://database/user-model
    ```




  * 当资源被引用时，会自动获取并作为附件包含
  * 资源路径在 @ 提及的自动补全中支持模糊搜索
  * 当服务器支持时，Claude Code 会自动提供工具来列出和读取 MCP 资源
  * 资源可以包含 MCP 服务器提供的任何类型内容（文本、JSON、结构化数据等）

## 使用 MCP 工具搜索实现扩展

工具搜索通过延迟工具定义直到 Claude 需要它们时才加载，从而保持较低的 MCP 上下文使用量。会话启动时仅加载工具名称，因此添加更多 MCP 服务器对你的上下文窗口影响极小。

### 工作原理

工具搜索默认启用。MCP 工具被延迟加载而非预先载入上下文，当任务需要时，Claude 使用搜索工具来发现相关的工具。只有 Claude 实际使用的工具才会进入上下文。从你的角度来看，MCP 工具的工作方式与之前完全一样。

如果你偏好基于阈值的加载方式，请设置 `ENABLE_TOOL_SEARCH=auto`，以便在工具模式符合上下文窗口 10% 的范围内时预先加载，仅延迟加载溢出的部分。所有选项请参见[配置工具搜索](#配置工具搜索)。

### 致 MCP 服务器开发者

如果你正在构建 MCP 服务器，启用工具搜索后，服务器指令字段会变得更有用。服务器指令帮助 Claude 了解何时搜索你的工具，这与[技能](/zh/skills)的工作方式类似。

请添加清晰、描述性的服务器指令，以说明：

* 你的工具处理哪类任务
* Claude 何时应该搜索你的工具
* 你的服务器提供的关键能力

Claude Code 会将工具描述和服务器指令各自截断至 2KB。请保持简洁以避免截断，并将关键细节放在开头附近。

### 配置工具搜索

工具搜索默认启用：MCP 工具被延迟并按需发现。在 Vertex AI 上，Claude Code 默认禁用此功能。当 `ANTHROPIC_BASE_URL` 指向非第一方主机时也会禁用，因为大多数代理不会转发 `tool_reference` 块。请显式设置 `ENABLE_TOOL_SEARCH` 以覆盖任一回退行为。

工具搜索需要支持 `tool_reference` 块的模型：Sonnet 4 及更高版本，或 Opus 4 及更高版本。Haiku 模型不支持此功能。在 Vertex AI 上，工具搜索支持 Claude Sonnet 4.5 及更高版本以及 Claude Opus 4.5 及更高版本。

使用 `ENABLE_TOOL_SEARCH` 环境变量控制工具搜索行为：

| 值       | 行为                                                                                                                                                                                                                             |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (未设置) | 所有 MCP 工具延迟加载并按需发现。在 Vertex AI 或 `ANTHROPIC_BASE_URL` 为非第一方主机时回退到预先加载                                                                                                                              |
| `true`   | 所有 MCP 工具延迟加载。即使在 Vertex AI 和通过代理时，Claude Code 也会发送 beta 头。请求在早于 Sonnet 4.5 或 Opus 4.5 的 Vertex AI 模型上，或在不支持 `tool_reference` 块的代理上会失败                                            |
| `auto`   | 阈值模式：如果工具符合上下文窗口 10% 的范围，则预先加载，否则延迟加载                                                                                                                                                            |
| `auto:N` | 带有自定义百分比的阈值模式，其中 `N` 为 0-100。例如，`auto:5` 表示 5%                                                                                                                                                           |
| `false`  | 所有 MCP 工具预先加载，不延迟加载                                                                                                                                                                                              |
```bash
# Use a custom 5% threshold
ENABLE_TOOL_SEARCH=auto:5 claude

# Disable tool search entirely
ENABLE_TOOL_SEARCH=false claude
```
或者在你的 [settings.json `env` 字段](/zh/settings#available-settings) 中设置该值。

你也可以特别禁用 `ToolSearch` 工具：
```json
{
  "permissions": {
    "deny": ["ToolSearch"]
  }
}
```
### 将服务器从延迟加载中豁免

如果某个服务器的工具应始终对Claude可见（无需搜索步骤），请在该服务器的配置中将 `alwaysLoad` 设置为 `true`。这样，无论 `ENABLE_TOOL_SEARCH` 设置如何，该服务器的所有工具都会在会话开始时加载到上下文中。由于每个预先加载的工具都会占用原本可用于对话的上下文，请仅对Claude每回合都需要的少量工具使用此设置。

以下 `.mcp.json` 条目示例将一个HTTP服务器设为豁免，而其他服务器保持延迟加载状态：
```json
{
  "mcpServers": {
    "core-tools": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "alwaysLoad": true
    }
  }
}
```
`alwaysLoad` 字段适用于所有服务器类型，且要求 Claude Code v2.1.121 或更高版本。MCP 服务器也可以通过在工具的 `_meta` 对象中包含 `"anthropic/alwaysLoad": true`，将单个工具标记为始终加载，这仅对该特定工具生效。

设置 `alwaysLoad: true` 还会阻塞启动过程，直到服务器连接成功，上限为标准的 5 秒连接超时。尽管 MCP 启动在其他情况下[默认是非阻塞的](/zh/env-vars)，但此设置仍然适用，因为工具必须在构建第一个提示词时可用。其他服务器将继续在后台连接。

## 将 MCP 提示词用作命令

MCP 服务器可以公开提示词，这些提示词可以作为 Claude Code 中的命令使用。

### 执行 MCP 提示词


    键入 `/` 可以查看所有可用命令，包括来自 MCP 服务器的命令。MCP 提示词会显示为 `/mcp__servername__promptname` 的格式。



    ```text
    /mcp__github__list_prs
    ```



    许多提示词接受参数。通过命令后空格分隔的方式传递它们：
    ```text
    /mcp__github__pr_review 456
    ```

    ```text
    /mcp__jira__create_issue "Bug in login flow" high
    ```




  * MCP提示词是动态发现的，来自已连接的服务器
  * 参数基于提示词定义的参数进行解析
  * 提示词结果会直接注入到对话中
  * 服务器和提示词名称会被规范化（空格变为下划线）

## 托管 MCP 配置

对于需要集中控制用户可连接哪些 MCP 服务器的组织，请参阅 [托管 MCP 配置](/zh/managed-mcp)。该部分涵盖如何使用 `managed-mcp.json` 部署固定的服务器集，如何通过 `allowedMcpServers` 和 `deniedMcpServers` 限制服务器，以及当服务器被阻止时用户将看到的内容。