> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进行进一步探索。

# 控制组织的 MCP 服务器访问

> 使用托管配置文件、允许列表和拒绝列表来限制用户可以添加或连接哪些 MCP 服务器。

默认情况下，任何运行 Claude Code 的用户都可以连接他们选择的任何 [MCP 服务器](/zh/mcp)。Anthropic 会根据其[列出标准](https://claude.com/docs/connectors/building/review-criteria)审查连接器，然后再将其添加到 [Anthropic Directory](https://claude.ai/directory)，但不会安全审计或管理任何 MCP 服务器。作为管理员，你可以限制哪些服务器在你的组织中运行，从部署固定的已批准集合到完全禁用 MCP。

本页涵盖以下内容：

* [选择模式](#选择模式)以匹配你需要的控制程度
* [使用 `managed-mcp.json` 部署固定服务器集合](#控制组织的-mcp-服务器访问)，包括如何[完全禁用 MCP](#控制组织的-mcp-服务器访问)
* [使用允许列表和拒绝列表控制服务器](#使用允许列表和拒绝列表进行策略控制)
* [告知用户当限制阻止服务器时的预期表现](#限制对用户的表现)
* [监控组织实际使用的服务器](#控制组织的-mcp-服务器访问)

[安全](/zh/security)页面涵盖了 MCP 威胁模型以及如何在批准服务器之前对其进行评估。[决定要执行什么](/zh/admin-setup#decide-what-to-enforce)涵盖了 MCP 限制以及其他管理控制。

## 选择模式

Claude Code 支持多种限制级别。每种模式使用下面涵盖的一个或两个机制：`managed-mcp.json` 用于部署固定集合，`allowedMcpServers`/`deniedMcpServers` 用于过滤用户配置的内容。

| 模式                     | 功能说明                                                                                   | 配置方式                                                                                             |
| :---------------------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **禁用 MCP**             | 任何地方都不加载服务器                                                                       | `managed-mcp.json` 包含空的服务器映射                                                                    |
| **固定部署**              | 每个用户获得相同的服务器，无法添加其他服务器                                                   | `managed-mcp.json` 包含你想要的服务器                                                                    |
| **已批准目录**            | 发布已批准的服务器列表；用户添加他们想要的，其他任何内容都会被阻止                               | `allowedMcpServers` + `allowManagedMcpServersOnly: true`                                              |
| **仅插件服务器**          | 服务器只能来自插件；用户无法添加自己的服务器                                                    | [`strictPluginOnlyCustomization`](/zh/settings#strictpluginonlycustomization) 列表中包含 `mcp`          |
| **软允许列表**            | 执行允许列表，用户可以在自己的设置中扩展                                                      | `allowedMcpServers` 不设置 `allowManagedMcpServersOnly`                                               |
| **仅拒绝列表**            | 阻止已知的不良服务器，允许其他所有内容                                                        | `deniedMcpServers`                                                                                    |
| **无限制**               | 用户可以添加任何内容                                                                         | 不部署任何托管 MCP 配置                                                                                |

Claude Code 没有内置的 MCP 服务器注册表供用户浏览和安装。对于已批准目录模式，请在用户能找到的地方（如内部 wiki）分享已批准的列表及其 `claude mcp add` 命令，或者通过[托管插件市场](/zh/plugin-marketplaces#managed-marketplace-restrictions)将服务器作为插件分发，这样用户可以从 `/plugin` 浏览和安装它们。

## 使用 managed-mcp.json 进行独占控制

如果你部署 `managed-mcp.json` 文件，Claude Code 只会加载该文件定义的服务器。用户无法添加、修改或使用任何其他 MCP 服务器，包括插件提供的服务器。该文件还会抑制 claude.ai 连接器，除非你[允许它们与托管集合一起加载](#使用-managed-mcpjson-进行独占控制)。

另外两个设置可以进一步过滤托管集合：

* `allowedMcpServers` 和 `deniedMcpServers` 也适用于托管服务器，因此未通过这些检查的托管服务器将不会加载。
* 用户自己的 `deniedMcpServers` 会从他们的设置中合并，因此用户可以为自己阻止托管服务器。

参见[服务器如何被评估](#服务器如何被评估)了解完整的检查顺序。

`managed-mcp.json` 是独立文件，因此无法通过[服务器托管设置](/zh/server-managed-settings)传递。任何能够以管理员权限写入系统路径的进程都可以部署它。大规模部署时，通常通过设备管理工具完成，例如 macOS 上的 Jamf 或配置文件，Windows 上的组策略或 Intune，或 Linux 上你选择的设备管理方案。Claude Code 在以下路径之一查找该文件：

| 平台          | 路径                                                         |
| :------------ | :--------------------------------------------------------- |
| macOS         | `/Library/Application Support/ClaudeCode/managed-mcp.json` |
| Linux 和 WSL  | `/etc/claude-code/managed-mcp.json`                        |
| Windows       | `C:\Program Files\ClaudeCode\managed-mcp.json`             |

该文件使用与项目 [`.mcp.json`](/zh/mcp#project-scope) 文件相同的格式：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "company-internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server",
      "args": ["--config", "/etc/company/mcp-config.json"],
      "env": {
        "COMPANY_API_URL": "https://internal.example.com"
      }
    }
  }
}
```

### 使用每用户凭据进行身份验证

机器上的任何用户都可以读取此文件，因此不要在 `env` 块中存储 API 密钥或其他凭据。请改用以下方式之一传递每用户凭据：

* [`${VAR}` 展开](/zh/mcp#environment-variable-expansion-in-mcp-json)从每个用户的环境中读取密钥。
* [OAuth 或每用户请求头](/zh/mcp#authenticate-with-remote-mcp-servers)让每个用户以自己的身份进行身份验证。
* [`headersHelper`](/zh/mcp#use-dynamic-headers-for-custom-authentication)在连接时生成凭据。

### 验证配置

要确认文件已生效，请在托管机器上运行两项检查：

1. `claude mcp list` 只显示 `managed-mcp.json` 中的服务器。如果用户自己的服务器仍然出现，说明文件未被读取；请检查路径和权限。
2. `claude mcp add --transport http test https://example.com/mcp` 失败并显示 `Cannot add MCP server: enterprise MCP configuration is active and has exclusive control over MCP servers`。URL 不需要是真实服务器，因为策略检查会在联系任何内容之前拒绝该命令。

### 完全禁用 MCP

部署包含空服务器映射的 `managed-mcp.json` 以阻止所有 MCP 服务器：

```json
{
  "mcpServers": {}
}
```

用户在 `/mcp` 中看不到任何 MCP 服务器，`claude mcp add` 会因上述企业策略错误而失败。用户之前配置的服务器在下次启动会话时停止加载，且不会警告是策略原因。

### 允许 claude.ai 连接器与托管集合一起加载

部署 `managed-mcp.json` 默认会抑制 [claude.ai 连接器](/zh/mcp#use-mcp-servers-from-claude-ai)，包括管理员在 claude.ai 管理控制台中为组织配置的连接器。要将这些连接器与 `managed-mcp.json` 中的服务器一起加载，请在[托管设置源](/zh/admin-setup#decide-how-settings-reach-devices)中设置 `"allowAllClaudeAiMcps": true`。需要 Claude Code v2.1.149 或更高版本。

启用该设置后，Claude Code 会加载与未部署 `managed-mcp.json` 时相同的 claude.ai 连接器。[允许列表和拒绝列表](#使用允许列表和拒绝列表进行策略控制)仍然适用于这些连接器，因此你可以使用 `deniedMcpServers` 阻止特定连接器。该设置仅影响 claude.ai 连接器；插件提供的服务器仍会被抑制。

Claude Code 仅从管理员控制的策略层读取此设置：服务器托管设置、MDM 部署的 plist 或 HKLM 注册表项，或系统 `managed-settings.json` 文件。将其放在用户或项目设置中无效，因此用户无法重新启用独占控制抑制的连接器。

## 使用允许列表和拒绝列表进行策略控制

允许列表和拒绝列表过滤哪些已配置的服务器被允许加载。它们不是注册表：服务器仍然需要由用户、插件或 `managed-mcp.json` 添加后，允许列表或拒绝列表才会对其生效。要向用户部署服务器，请使用 [`managed-mcp.json`](#控制组织的-mcp-服务器访问)。

要使允许列表具有权威性，请在[托管设置源](/zh/admin-setup#decide-how-settings-reach-devices)中同时设置 `allowedMcpServers` 和 `allowManagedMcpServersOnly: true`，例如服务器托管设置或部署的 `managed-settings.json` 文件。[将允许列表限制为仅托管设置](#使用-managed-mcpjson-进行独占控制)展示了该配置。如果不设置 `allowManagedMcpServersOnly`，来自每个设置源的允许列表会合并，包括用户自己的 `~/.claude/settings.json`，因此用户可以扩展你的允许列表所允许的内容。拒绝列表始终从所有源合并。

`allowManagedMcpServersOnly` 与 `allowManagedPermissionRulesOnly` 是分开的，后者仅锁定[权限规则](/zh/permissions#managed-settings)。设置该标志不会强制执行 MCP 允许列表。

### 通过 URL、命令或名称匹配服务器

`allowedMcpServers` 和 `deniedMcpServers` 是条目列表。每个条目是一个对象，包含一个键，通过 URL、命令或名称标识服务器：

| 键              | 匹配方式                                                               | 用途                                    |
| :-------------- | :-------------------------------------------------------------------- | :------------------------------------- |
| `serverUrl`     | 远程服务器 URL，精确匹配或使用 `*` 通配符                               | HTTP 和 SSE 服务器                      |
| `serverCommand` | 启动 stdio 服务器的精确命令和参数                                       | Stdio 服务器                            |
| `serverName`    | 用户分配的标签。仅精确匹配；不展开通配符                                 | 两种类型，但参见下方警告                  |

不设置 `allowedMcpServers` 与将其设置为空数组是不同的：

| 设置                | 未设置（默认）        | 空数组 `[]`        | 已填充                      |
| :------------------ | :------------------ | :----------------- | :---------------------------- |
| `allowedMcpServers` | 允许所有服务器       | 不允许任何服务器    | 仅允许匹配的服务器            |
| `deniedMcpServers`  | 不阻止任何服务器     | 不阻止任何服务器    | 阻止匹配的服务器              |

仅使用 `serverName` 条目的允许列表不是安全控制。名称是用户运行 `claude mcp add` 或编辑配置文件时分配的标签，而非底层服务器，因此用户可以将任何服务器命名为 `github`。要强制执行实际运行的服务器，请添加 `serverCommand` 或 `serverUrl` 条目。

### 服务器如何被评估

在加载服务器之前（包括来自 `managed-mcp.json` 的服务器），Claude Code 按顺序运行三项检查：

1. **合并列表。** 来自每个设置源的允许列表和拒绝列表条目合并为一个允许列表和一个拒绝列表。当 `allowManagedMcpServersOnly` 为 `true` 时，仅保留托管允许列表；拒绝列表始终从所有源合并。
2. **检查拒绝列表。** 匹配任何拒绝列表条目（按 URL、命令或名称）的服务器会被阻止。任何内容都无法覆盖拒绝列表匹配。
3. **检查允许列表。** 如果在任何地方都没有设置 `allowedMcpServers`，则通过拒绝列表的每个服务器都会加载。如果已设置，服务器必须匹配的内容取决于其类型，如下表所示。

| 服务器类型             | 匹配时允许加载的条件                                                                                             |
| :------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 远程（HTTP 或 SSE）   | 匹配 `serverUrl` 条目。仅当允许列表不包含 `serverUrl` 条目时，`serverName` 匹配才有效                               |
| Stdio                | 匹配 `serverCommand` 条目。仅当允许列表不包含 `serverCommand` 条目时，`serverName` 匹配才有效                        |

这些检查内部适用两条匹配规则：

* **命令精确匹配。** 每个参数，按顺序。`["npx", "-y", "server"]` 不匹配 `["npx", "server"]` 或 `["npx", "-y", "server", "--flag"]`。
* **URL 支持 `*` 通配符**，可出现在模式中的任何位置，包括协议方案。主机名匹配不区分大小写并忽略尾部的 FQDN 点，因此 `https://Mcp.Example.com/*` 匹配 `https://mcp.example.com/api`。路径保持区分大小写。

| 模式                        | 允许内容                                                                |
| :-------------------------- | :--------------------------------------------------------------------- |
| `https://mcp.example.com/*` | 特定域上的所有路径                                                      |
| `https://mcp.example.com`   | 同样是该域上的所有路径。没有路径的模式匹配任何路径                         |
| `https://*.example.com/*`   | `example.com` 的任何子域名                                              |
| `http://localhost:*/*`      | localhost 上的任何端口                                                   |
| `*://mcp.example.com/*`     | 任何协议方案到特定域                                                     |

### 示例配置

以下配置设置了一个带有拒绝列表的硬允许列表。高亮行改变了列表其余部分的评估方式，代码块后的说明解释了每一行：

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://api.githubcopilot.com/*" },
    { "serverUrl": "https://mcp.sentry.dev/*" },
    { "serverCommand": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "."] },
    { "serverCommand": ["python", "/usr/local/bin/approved-server.py"] },
    { "serverUrl": "https://mcp.example.com/*" },
    { "serverUrl": "https://*.internal.example.com/*" }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" },
    { "serverCommand": ["npx", "-y", "unapproved-package"] },
    { "serverUrl": "https://*.untrusted.example.com/*" }
  ]
}
```

* **第 3 行**：第一个 `serverUrl` 条目。一旦存在该条目，每个远程服务器都必须匹配 URL 模式，因此用户无法通过给未列出的远程服务器一个允许的名称来通过。
* **第 5 行**：第一个 `serverCommand` 条目。对 stdio 服务器有相同效果，因此每个本地服务器都必须精确匹配列出的命令。
* **第 11 行**：拒绝列表中的 `serverName` 条目。拒绝列表条目始终生效，因此任何名为 `dangerous-server` 的服务器都会被阻止，无论其 URL 或命令如何。

此允许列表中的 `serverName` 条目永远不会匹配任何内容，因为两种传输类型已有更严格的条目。

下方的手风琴展示了服务器如何针对其他允许列表和拒绝列表组合进行评估。

**仅 URL 允许列表**

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://mcp.example.com/*" },
    { "serverUrl": "https://*.internal.example.com/*" }
  ]
}
```

| 服务器                                                 | 结果                                       |
| :---------------------------------------------------- | :------------------------------------------- |
| 位于 `https://mcp.example.com/api` 的 HTTP 服务器       | 允许：匹配 URL 模式                          |
| 位于 `https://api.internal.example.com/mcp` 的 HTTP 服务器 | 允许：匹配通配符子域名                        |
| 位于 `https://external.example.com/mcp` 的 HTTP 服务器  | 阻止：不匹配任何 URL 模式                     |
| 使用任何命令的 Stdio 服务器                              | 阻止：没有名称或命令条目可匹配                 |

**仅命令允许列表**

```json
{
  "allowedMcpServers": [
    { "serverCommand": ["npx", "-y", "approved-package"] }
  ]
}
```

| 服务器                                                 | 结果                            |
| :---------------------------------------------------- | :-------------------------------- |
| 使用 `["npx", "-y", "approved-package"]` 的 Stdio 服务器 | 允许：匹配命令                     |
| 使用 `["node", "server.js"]` 的 Stdio 服务器            | 阻止：不匹配命令                   |
| 名为 `my-api` 的 HTTP 服务器                             | 阻止：没有名称条目可匹配           |

**混合名称和命令允许列表**

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverCommand": ["npx", "-y", "approved-package"] }
  ]
}
```

| 服务器                                                                    | 结果                                                                |
| :----------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| 名为 `local-tool` 且使用 `["npx", "-y", "approved-package"]` 的 Stdio 服务器 | 允许：匹配命令                                                       |
| 名为 `local-tool` 且使用 `["node", "server.js"]` 的 Stdio 服务器             | 阻止：命令条目存在但不匹配                                            |
| 名为 `github` 且使用 `["node", "server.js"]` 的 Stdio 服务器                 | 阻止：存在命令条目时 stdio 服务器必须匹配命令                           |
| 名为 `github` 的 HTTP 服务器                                               | 允许：匹配名称                                                        |
| 名为 `other-api` 的 HTTP 服务器                                            | 阻止：名称不匹配                                                      |

**仅名称允许列表**

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverName": "internal-tool" }
  ]
}
```

| 服务器                                               | 结果                           |
| :-------------------------------------------------- | :------------------------------- |
| 名为 `github` 且使用任何命令的 Stdio 服务器            | 允许：无命令限制                 |
| 名为 `internal-tool` 且使用任何命令的 Stdio 服务器     | 允许：无命令限制                 |
| 名为 `github` 的 HTTP 服务器                          | 允许：匹配名称                  |
| 名为 `other` 的任何服务器                             | 阻止：名称不匹配                |

**带拒绝列表覆盖的允许列表**

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://*.example.com/*" }
  ],
  "deniedMcpServers": [
    { "serverUrl": "https://staging.example.com/*" }
  ]
}
```

| 服务器                                            | 结果                                                    |
| :----------------------------------------------- | :-------------------------------------------------------- |
| 位于 `https://mcp.example.com/api` 的 HTTP 服务器  | 允许：匹配允许列表 URL 模式，无拒绝列表匹配                |
| 位于 `https://staging.example.com/api` 的 HTTP 服务器 | 阻止：两者都匹配，但拒绝列表优先                           |
| 位于 `https://other.com/mcp` 的 HTTP 服务器        | 阻止：不匹配允许列表                                      |

### 将允许列表限制为仅托管设置

要使托管允许列表成为唯一生效的允许列表，请在托管设置文件中设置 `allowManagedMcpServersOnly`：

```json
{
  "allowManagedMcpServersOnly": true,
  "allowedMcpServers": [
    { "serverUrl": "https://api.githubcopilot.com/*" },
    { "serverUrl": "https://*.internal.example.com/*" }
  ]
}
```

当 `allowManagedMcpServersOnly` 为 `true` 时，来自用户、项目和本地设置的允许列表会被忽略。拒绝列表仍然从所有源合并，因此用户始终可以为自己阻止服务器。

## 限制对用户的表现

当限制阻止服务器时，用户要么看到 `claude mcp add` 的错误，要么服务器静默停止加载。使用此表格识别这些报告，并在推出更改之前告知用户预期情况：

| 限制情况                                                              | 用户看到的内容                                                                                          |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| 存在 `managed-mcp.json` 且用户运行 `claude mcp add`                    | `Cannot add MCP server: enterprise MCP configuration is active and has exclusive control over MCP servers` |
| 服务器在拒绝列表上且用户运行 `claude mcp add`                           | `Cannot add MCP server "<name>": server is explicitly blocked by enterprise policy`                        |
| 服务器不在允许列表上且用户运行 `claude mcp add`                          | `Cannot add MCP server "<name>": not allowed by enterprise policy`                                         |
| 之前配置的服务器现在被策略阻止                                           | 服务器从 `/mcp` 和 `claude mcp list` 中静默消失，无警告                                                      |

在最后一种情况下，用户不会收到任何信号表明策略是其服务器消失的原因，因此在推出新限制时，请告知受影响的用户哪些服务器被阻止。

## 监控 MCP 使用情况

当配置了 [OpenTelemetry 导出](/zh/monitoring-usage)时，Claude Code 可以记录用户调用的 MCP 服务器和工具。设置 `OTEL_LOG_TOOL_DETAILS=1` 以在工具事件中包含 MCP 服务器和工具名称，然后在收集器中聚合它们以查看用户实际连接的服务器。参见[监控](/zh/monitoring-usage)设置导出器和完整事件架构。

## 配置摘要

本页涵盖的每个文件和设置、其控制内容以及传递方式：

| 配置项                       | 控制内容                                                                    | 存放位置                                                                                                               | 传递方式                                                                                                                                                                  |
| :--------------------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `managed-mcp.json`           | 固定服务器集合、独占控制                                                            | 系统路径：`/Library/Application Support/ClaudeCode/`、`/etc/claude-code/` 或 `C:\Program Files\ClaudeCode\`                  | MDM、GPO、设备管理或任何具有管理员权限的进程。无法通过服务器托管设置设置                                                                                                      |
| `allowedMcpServers`          | 允许的服务器列表                                                                    | 任何[设置文件](/zh/settings#settings-files)；除非设置了 `allowManagedMcpServersOnly`，否则来自每个源的条目会合并                | 用于执行时，使用[托管设置源](/zh/admin-setup#decide-how-settings-reach-devices)：服务器托管设置、`managed-settings.json`、MDM 配置文件或注册表                                   |
| `deniedMcpServers`           | 阻止的服务器列表                                                                    | 任何设置文件；来自每个源的条目会合并                                                                                            | 与 `allowedMcpServers` 相同                                                                                                                                                  |
| `allowManagedMcpServersOnly` | 将允许列表锁定为仅托管源                                                            | 仅托管设置源；该设置在其他地方无效                                                                                            | 与 `allowedMcpServers` 相同                                                                                                                                                  |
| `allowAllClaudeAiMcps`       | 加载 claude.ai 连接器与 `managed-mcp.json` 一起而非抑制它们                          | 仅托管设置源；该设置在其他地方无效                                                                                            | 与 `allowedMcpServers` 相同                                                                                                                                                  |

## 相关资源

* [决定要执行什么](/zh/admin-setup#decide-what-to-enforce)：MCP 限制以及权限规则、沙箱和其他管理控制
* [通过 MCP 将 Claude Code 连接到工具](/zh/mcp)：完整的 MCP 参考，包括传输、作用域和身份验证
* [设置](/zh/settings)：设置层次结构以及托管设置如何优先
* [服务器托管设置](/zh/server-managed-settings)：从 Claude.ai 管理控制台传递 `allowedMcpServers` 和 `deniedMcpServers`
* [安全](/zh/security)：这些控制所防御的威胁模型
* [Claude 企业管理员指南](https://claude.com/resources/tutorials/claude-enterprise-administrator-guide)：SSO、SCIM、席位管理和推出计划
