# 权限

Beta。权限配置文件正在积极开发中，可能会发生变化。

权限配置文件与旧版沙箱设置不兼容。请配置 `default_permissions` 和 `[permissions]`，或配置 `sandbox_mode` / `sandbox_workspace_write`，但不要同时配置两者。如果 `sandbox_mode` 出现在任何活动配置层中、你传递了 `--sandbox`，或配置配置文件设置了 `sandbox_mode`，Codex 将使用这些旧版沙箱设置而非 `default_permissions`。

权限配置文件让你可以为 Codex 代表你运行的本地命令应用最小权限边界。配置文件是一个命名策略，结合了定义命令可读写内容的文件系统规则与定义命令可访问目标的网络规则。

使用配置文件为 Codex 提供当前任务所需的足够访问权限，而无需授予对你机器或网络的广泛访问。例如，只读配置文件可以让 Codex 检查项目而不进行编辑，而可写配置文件可以将编辑限制在选定的工作区根目录内。

本地权限配置文件在 macOS、Linux、WSL 和原生 Windows 上受支持。平台特定的执行细节和注意事项在[安全限制]中说明。

有关 Codex 云端网络设置，请参阅[互联网访问](https://developers.openai.com/codex/cloud/internet-access)。

## 定义和选择配置文件

Codex 包含三个内置权限配置文件：

- `:read-only` 保持本地命令执行为只读。
- `:workspace` 允许在活动工作区根目录内写入。
- `:danger-full-access` 移除本地沙箱限制，仅在确实需要广泛访问时使用。

在 `[permissions.<name>]` 下创建命名配置文件，然后将顶层 `default_permissions` 键设置为该配置文件名称或上述内置配置文件之一。在此示例中，`project-edit` 是用户定义的配置文件名称，不是内置值。

自定义配置文件使用两个相关概念：

- `[permissions.<name>.workspace_roots]` 添加应作为该配置文件工作区根目录的具体目录。
- `[permissions.<name>.filesystem.":workspace_roots"]` 定义 Codex 在每个有效工作区根目录内应用的文件系统规则：当前会话的运行时工作区根目录加上上面配置文件定义的根目录。

配置文件还使用常规的配置层模型。更高优先级的层可以在不重新声明整个配置文件的情况下添加或替换同名配置文件下的条目。

例如，组织级配置和用户级配置可以独立扩展同一配置文件：

```toml
# /etc/codex/config.toml
[permissions.server.workspace_roots]
"~/code/server" = true
```

```toml
# ~/.codex/config.toml
[permissions.server.workspace_roots]
"~/code/mobile-app" = true
```

当 `server` 活动时，两个工作区根目录都参与有效配置文件。

```toml
default_permissions = "project-edit"

[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true

[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"

[permissions.project-edit.network]
enabled = true

[permissions.project-edit.network.domains]
"api.openai.com" = "allow"
"objects.githubusercontent.com" = "allow"
"*.github.com" = "allow"
"tracking.example.com" = "deny"
```

此配置文件：

- 读取常用开发工具所需的最小运行时路径。
- 将相同的工作区根目录规则应用于当前会话和配置文件定义的根目录。
- 在每个根目录下保持 IDE 相关设置（如 `.devcontainer/`）为只读。
- 使用 glob 规则拒绝匹配的环境文件。
- 仅允许通过配置的域名策略进行网络访问。

在活动配置文件内，更具体的拒绝规则即使在更广泛路径可读或可写时仍然生效。例如，配置文件可以使工作区根目录可写，同时仍将匹配的 `.env` 路径设置为 `deny`。

## 扩展配置文件

当配置文件与内置配置文件或另一个命名配置文件大部分相同时，请使用 `extends`。优先扩展内置配置文件而非从头开始，这样基线保护可以延续。例如，扩展 `:workspace` 会保持工作区根目录的 `.codex` 目录为只读，除非你显式覆盖。设置一次父级，然后仅添加或覆盖不同的规则。

```toml
default_permissions = "project-edit"

[permissions.project-edit]
description = "Project editing with OpenAI API access."
extends = ":workspace"

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"

[permissions.project-edit.network]
enabled = true

[permissions.project-edit.network.domains]
"api.openai.com" = "allow"
```

此配置文件从 `:workspace` 开始，保持匹配的 `.env` 文件被拒绝，并允许对 `api.openai.com` 的请求。配置文件可以扩展 `:read-only`、`:workspace` 或另一个命名配置文件。它不能扩展 `:danger-full-access`；Codex 也会拒绝未知的父级和继承循环。

## 配置规范

| 条目 | 类型/值 | 默认值 | 详情 |
| --- | --- | --- | --- |
| `default_permissions` | 字符串配置文件名称 | 无 | 指定 Codex 默认应用的权限配置文件。值必须匹配 `[permissions]` 下的配置文件或内置配置文件（如 `:workspace`）。权限配置文件激活时为必填。如果旧版沙箱设置处于活动状态，Codex 将使用那些旧版沙箱设置。 |
| `[permissions.<name>]` | 表 | 无 | 定义配置文件及其标识符。`default_permissions` 选择一个配置文件作为默认值；其他权限配置文件选择器也使用配置文件名称。 |
| `permissions.<name>.description` | 字符串 | 无 | 为配置文件提供人类可读的描述。配置文件不会通过 `extends` 继承父级的描述。 |
| `permissions.<name>.extends` | 字符串配置文件名称 | 无 | 从另一个命名配置文件或内置 `:read-only` 或 `:workspace` 配置文件开始。Codex 拒绝 `:danger-full-access`、未知父级和继承循环。 |
| `[permissions.<name>.workspace_roots]` | 表 | 无 | 添加配置文件定义的工作区根目录，与当前会话的运行时工作区根目录一起接收 `:workspace_roots` 文件系统规则。 |
| `permissions.<name>.workspace_roots."<path>"` | 布尔值 | `false` | 为 `true` 时将路径添加到配置文件的工作区根目录集合。设为 `false` 的条目保持非活动状态。 |
| `[permissions.<name>.filesystem]` | 表 | 无 | 将文件系统路径映射到访问值或作用域子路径映射。缺失或空的文件系统表会限制文件系统访问并发出启动警告。 |
| `permissions.<name>.filesystem.glob_scan_max_depth` | 数字 | 无 | 在 Linux、WSL 和原生 Windows 上限制 Codex 在沙箱启动前快照匹配时的拒绝读取 glob 展开。较大的值会增加启动扫描工作量。当无界 `**` 模式需要有界预展开时，使用至少为 `1` 的值。 |
| `[permissions.<name>.filesystem]."<path>"` | `read`、`write` 或 `deny` | 无 | 为支持的路径授予直接访问权限。`deny` 拒绝访问并优先于相同具体的 `write` 或 `read` 条目。Codex 拒绝活动运行时无法执行的直接写入规则。 |
| `[permissions.<name>.filesystem."<path>"]."<subpath>"` | `read`、`write` 或 `deny` | 无 | 授予对 `<path>` 后代的访问权限。使用 `.` 表示基础路径。其他子路径必须是相对后代，不能包含 `.` 或 `..` 组件。 |
| `[permissions.<name>.network]` | 表 | 无 | 为配置文件配置网络沙箱代理和沙箱网络策略。 |
| `permissions.<name>.network.enabled` | 布尔值 | `false` | 为配置文件中的沙箱命令启用网络访问。这会更改沙箱网络策略；它本身不会启动网络代理。 |
| `[permissions.<name>.network.domains]` | 表 | 无 | 将主机模式映射到 `allow` 或 `deny`。如果没有 `allow` 条目，域名请求将被阻止。Deny 条目覆盖 allow 条目。 |
| `permissions.<name>.network.domains."<pattern>"` | `allow` 或 `deny` | 无 | 支持精确主机、`*.example.com` 用于子域名、`**.example.com` 用于顶域加子域名、`*` 作为仅允许的全局通配符。主机模式通过修剪、小写化、去除尾随点以及去除简单端口或括号进行规范化。 |
| `[permissions.<name>.network.unix_sockets]` | 表 | 无 | 映射 Unix socket 允许列表覆盖。仅用于 Docker 等本地集成。 |
| `permissions.<name>.network.unix_sockets."<path>"` | `allow` 或 `deny` | 无 | 使用 `allow` 将绝对 Unix socket 路径添加到有效允许列表，或使用 `deny` 拒绝。被拒绝的条目从有效允许列表中移除。 |
| `permissions.<name>.network.proxy_url` | URL 字符串 | `http://127.0.0.1:3128` | 用于 `HTTP_PROXY`、`HTTPS_PROXY`、websocket 代理变量和相关工具代理环境变量的 HTTP 代理监听器。 |
| `permissions.<name>.network.enable_socks5` | 布尔值 | `true` | 启用用于 `ALL_PROXY` 和 FTP 代理变量的 SOCKS5 监听器。 |
| `permissions.<name>.network.socks_url` | URL 字符串 | `http://127.0.0.1:8081` | SOCKS5 监听器地址。 |
| `permissions.<name>.network.enable_socks5_udp` | 布尔值 | `true` | 启用 SOCKS5 监听器时启用 SOCKS5 UDP 支持。 |
| `permissions.<name>.network.allow_upstream_proxy` | 布尔值 | `true` | 允许网络沙箱代理为出站请求遵循上游 `HTTP(S)_PROXY` 和 `ALL_PROXY` 设置。 |
| `permissions.<name>.network.allow_local_binding` | 布尔值 | `false` | 为 `true` 时禁用本地/私有网络保护。为 `false` 时，`localhost` 或 `127.0.0.1` 等精确本地字面量必须显式列入允许列表，解析为本地或私有 IP 的主机名仍被阻止。 |
| `permissions.<name>.network.dangerously_allow_non_loopback_proxy` | 布尔值 | `false` | 允许代理监听器绑定非回环地址。普通本地开发请保持未设置。 |
| `permissions.<name>.network.dangerously_allow_all_unix_sockets` | 布尔值 | `false` | 在支持 Unix socket 代理的地方绕过 Unix socket 允许列表。这是一个广泛的本地逃生出口。 |

## 文件系统权限

文件系统条目使用 `read`、`write` 或 `deny`：

| 访问 | 含义 |
| --- | --- |
| `read` | 允许命令读取路径下的文件和列出目录。命令不能在该路径下创建、修改、重命名或删除文件。 |
| `write` | 允许命令读取和修改路径下的文件，包括在操作系统允许时创建、重命名和删除文件。 |
| `deny` | 拒绝路径下的读取和写入。用于从更广泛的 `read` 或 `write` 授权中划出被拒绝的子路径。 |

更具体的条目覆盖更广泛的条目。当两个条目针对同一路径时，`deny` 优先于 `write`，`write` 优先于 `read`。

此优先级让配置文件可以先描述广泛的工作区域，然后划出应保持不可读的文件或目录：

```toml
[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"
```

在此示例中，工作区根目录保持可写，`.devcontainer/` 保持可读但不可写，匹配的环境文件对沙箱命令保持不可用。

更具体的路径也可以在更广泛的 deny 内重新打开更窄的子树：

```toml
[permissions.project-edit.filesystem]
"~/Documents" = "deny"
"~/Documents/codex" = "write"
```

支持的路径形式：

| 路径 | 含义 | 作用域子路径 |
| --- | --- | --- |
| `:root` | 文件系统根目录 | 仅 `.` |
| `:minimal` | 常用工具所需的平台和运行时路径 | 仅 `.` |
| `:workspace_roots` | 当前会话的工作区根目录加上任何启用的配置文件定义的工作区根目录 | 是 |
| `:tmpdir` | `$TMPDIR` 位置（如果可用） | 仅 `.` |
| `/absolute/path` | 平台绝对路径，如 macOS/Linux/WSL 上的 `/path` 或原生 Windows 上的 `C:\path` | 是 |
| `~/path` | 当前用户主目录下的路径 | 是 |

在原生 Windows 上，主目录相对路径也可以使用反斜杠，如 `~\work`。

仅在配置文件确实需要广泛读取覆盖时使用 `:root`：

```toml
[permissions.audit.filesystem]
":root" = "read"
```

在 `:workspace_roots` 下使用嵌套条目将访问范围限定为工作区根目录的相对子路径：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"          # 每个工作区根目录
"docs" = "read"        # 每个工作区根目录的 docs 目录
"generated" = "deny"   # 每个工作区根目录的 generated 目录
```

嵌套子路径必须保持在其工作区根目录内。像 `../other-repo` 这样的父目录遍历会被拒绝。

### 使用精确路径或 glob 拒绝读取

对 Codex 不应读取的文件或子树使用 `deny`，即使更广泛的配置文件规则在附近授予了访问权限。精确路径适用于 `~/.ssh` 等稳定位置。当配置文件需要覆盖跨仓库位置变化的一系列敏感文件时，glob 模式效果更好。

当 glob 位于 `:workspace_roots` 下时，Codex 将其相对于每个有效工作区根目录进行解释。例如：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

此规则拒绝读取在每个运行时或配置文件定义的工作区根目录下找到的匹配 `.env` 文件。当你想保留正常的工作区写入同时保持环境文件、生成的密钥或类似的凭据承载文件不可读时使用它。

`deny` glob 模式作为拒绝读取规则受支持。`read` 或 `write` glob 在 Linux、WSL 和原生 Windows 沙箱上可移植性较差，因此尽可能优先使用精确路径或子树规则（如 `"docs/**" = "read"`）。

在 Linux、WSL 和原生 Windows 上，无界的 `**` 拒绝读取模式可能需要在沙箱启动前进行有界预展开。使用无界模式（如 `"**/*.env" = "deny"`）时设置 `glob_scan_max_depth`：

```toml
[permissions.project-edit.filesystem]
glob_scan_max_depth = 3

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

`glob_scan_max_depth` 必须至少为 `1`。较高的值在沙箱启动前扫描更深，这可能会在 Linux、WSL 和原生 Windows 上增加启动工作量。如果你不想使用有界展开，请枚举显式深度，如 `*.env`、`*/*.env` 和 `*/*/*.env`。

当相同规则应应用于当前会话根目录之外的内容时，向配置文件添加可重用的工作区根目录：

```toml
[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true
```

当此配置文件活动时，Codex 将 `:workspace_roots` 规则应用于当前会话的运行时工作区根目录和每个启用的配置文件定义的工作区根目录。

在原生 Windows 上，驱动器号路径（如 `D:\work`）和 UNC 路径（如 `\\server\share`）作为绝对路径受支持。

## 网络权限

设置 `enabled = true` 以允许所选配置文件的网络访问：

```toml
[permissions.project-edit.network]
enabled = true
```

启用网络访问后，Codex 默认使用完整的网络行为。大多数配置文件还应定义域名规则：

```toml
[permissions.project-edit.network.domains]
"example.com" = "allow"      # 精确主机
"*.example.com" = "allow"    # 仅子域名
"**.example.com" = "allow"   # 顶域和子域名
"ads.example.com" = "deny"   # deny 优先于 allow
```

网络沙箱代理默认绑定到本地监听器：

```toml
[permissions.project-edit.network]
enabled = true
proxy_url = "http://127.0.0.1:3128"
enable_socks5 = true
socks_url = "http://127.0.0.1:8081"
enable_socks5_udp = true
```

除非你正在与特定运行时集成，否则请将这些监听器设置保持为默认值。`dangerously_*` 网络键是用于特殊环境的逃生出口，不应用于普通本地开发。

### 本地和私有网络

Codex 默认应用本地/私有网络保护，作为防止 DNS 重绑定和意外访问本地服务的防御措施。要故意允许精确的本地目标，请将确切的主机或 IP 字面量列入允许列表：

```toml
[permissions.project-edit.network.domains]
"localhost" = "allow"
"127.0.0.1" = "allow"
```

仅当配置文件必须访问解析为本地或私有地址的已列入允许列表的主机名时，才设置 `allow_local_binding = true`：

```toml
[permissions.project-edit.network]
enabled = true
allow_local_binding = true

[permissions.project-edit.network.domains]
"localhost" = "allow"
```

### Unix socket

Unix socket 代理是用于 Docker 等工具的本地逃生出口。谨慎使用：

```toml
[permissions.project-edit.network.unix_sockets]
"/var/run/docker.sock" = "allow"
"/tmp/old.sock" = "deny"
```

使用 `deny` 拒绝 socket 路径，包括继承的 allow 条目。被拒绝的 socket 路径从有效允许列表中移除。

启用 Unix socket 时，请保持代理监听器绑定到回环地址。

## 从旧版沙箱设置迁移

当你希望一个可重用的配置文件同时描述文件系统和网络行为时，权限配置文件取代了 `sandbox_mode` 和 `sandbox_workspace_write` 的旧版组合。一次会话使用其中一个系统，不要同时使用。

建议的起点：

- 对于只读工作流，使用内置 `:read-only` 配置文件或定义仅在需要时具有读取访问权限的自定义配置文件。
- 对于工作区编辑，使用内置 `:workspace` 配置文件或定义通过 `:workspace_roots` 写入并仅添加工作流所需的额外临时或缓存路径的自定义配置文件。
- 对于不受限制的本地执行，仅在确实需要最广泛的本地访问模型时使用 `:danger-full-access`。

配置文件描述会话的本地默认姿态。组织管理的要求仍可添加用户配置不应扩大的限制。请参阅[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)了解管理员强制执行的文件系统和网络约束。

## 范围和执行

权限配置文件定义了本地沙箱命令执行的边界。将它们与审批策略和其他 Codex 界面的单独控制一起使用。

### 配置文件控制的内容

- **本地命令执行：** 权限配置文件管理在你机器上运行的沙箱命令。应用连接器、MCP 服务器、浏览器或计算机使用界面、Codex 云环境设置和已批准的升级使用各自的控制。
- **文件系统写入：** 可写配置文件可以创建持久更改。将对脚本、构建步骤、包管理器钩子、shell 启动文件和共享目录的写入视为敏感操作，因为后续工具或用户可以在原始沙箱上下文之外执行这些文件。
- **出站目标：** 网络域名规则约束沙箱命令流量可以通过网络代理去往何处。它们不决定允许的目标是否可信，通配符 allow 规则保持广泛。
- **本地服务：** 本地和私有网络目标默认被阻止。将 `localhost`、私有 IP、Unix socket 列入允许列表或设置 `allow_local_binding = true` 会显式打开对本地服务的访问。

### 执行方式

- 在 macOS 上，Codex 使用 Seatbelt 沙箱配置文件。如果所选策略无法由平台沙箱执行，Codex 会拒绝运行命令，而不是静默地在非沙箱环境中运行。
- 在 Linux 和 WSL 上，Codex 使用 [bubblewrap](https://github.com/containers/bubblewrap) 和 [seccomp](https://www.kernel.org/doc/html/latest/userspace-api/seccomp_filter.html)，Landlock 可用于兼容性回退路径。最强的执行路径取决于用户命名空间和内核支持；受限的容器主机可能强制使用兼容性路径，不支持的分离策略会被拒绝。
- 在原生 Windows 上，[提升的沙箱](https://developers.openai.com/codex/windows#windows-sandbox)最强，因为它可以使用专用的低权限沙箱用户、文件系统权限边界和防火墙规则。未提升的沙箱是网络隔离较弱的回退方案，无法执行每个分离的读写划分，因此不支持的策略会被拒绝。需要 Linux 沙箱模型时请使用 WSL。

### 操作指导

选择仍能让任务完成的最窄配置文件，尤其是在你授予写入或出站网络访问权限时。保持审批策略、密钥处理和 allow 规则与该访问级别一致。

## 常用配置文件

### 带网络允许列表的只读

```toml
default_permissions = "readonly-net"

[permissions.readonly-net.filesystem]
":minimal" = "read"

[permissions.readonly-net.filesystem.":workspace_roots"]
"." = "read"

[permissions.readonly-net.network]
enabled = true

[permissions.readonly-net.network.domains]
"api.openai.com" = "allow"
```

### 无网络的工作区写入

```toml
default_permissions = "project-edit"

[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"

[permissions.project-edit.network]
enabled = false
```

### 带公共网络访问的工作区写入

```toml
default_permissions = "workspace-net"

[permissions.workspace-net.filesystem]
":minimal" = "read"

[permissions.workspace-net.filesystem.":workspace_roots"]
"." = "write"

[permissions.workspace-net.network]
enabled = true

[permissions.workspace-net.network.domains]
"*" = "allow"
```

仅在你打算允许公共网络访问时使用全局 `"*"` allow 规则。Deny 规则可以缩小广泛的允许列表。
