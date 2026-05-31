# 代理审批与安全

Codex 帮助保护你的代码和数据，降低误用风险。

本页介绍如何安全地操作 Codex，包括沙箱、审批和网络访问。如果你在寻找用于扫描已连接 GitHub 仓库的 Codex Security 产品，请参阅 [Codex Security](https://developers.openai.com/codex/security)。

默认情况下，代理运行时网络访问处于关闭状态。在本地，Codex 使用操作系统强制执行的沙箱来限制其可触及的范围（通常限于当前工作区），外加一套审批策略来控制它在何时必须停下来向你请示。

有关沙箱在 Codex 应用、IDE 扩展和 CLI 中工作方式的高层说明，请参阅[沙箱](https://developers.openai.com/codex/concepts/sandboxing)。
有关更广泛的企业安全概述，请参阅 [Codex 安全白皮书](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

## 沙箱与审批

Codex 的安全控制来自两个协同工作的层次：

- **沙箱模式**：Codex 在技术上能做什么（例如，它可以写入哪些位置以及是否可以访问网络），当它执行模型生成的命令时。
- **审批策略**：Codex 在执行某个操作之前何时必须向你请示（例如，离开沙箱、使用网络或运行受信集合之外的命令）。

Codex 根据运行位置使用不同的沙箱模式：

- **Codex 云端**：在隔离的 OpenAI 托管容器中运行，防止访问你的宿主系统或无关数据。采用两阶段运行时模型：setup 阶段在代理阶段之前运行，可以访问网络以安装指定的依赖项，然后代理阶段默认离线运行，除非你为该环境启用了互联网访问。为云端环境配置的密钥仅在 setup 阶段可用，并在代理阶段开始前被移除。
- **Codex CLI / IDE 扩展**：操作系统级别的机制强制执行沙箱策略。默认设置包括无网络访问以及写入权限限于活动工作区。你可以根据风险承受能力配置沙箱、审批策略和网络设置。

在 `Auto` 预设中（例如 `--sandbox workspace-write --ask-for-approval on-request`），Codex 可以自动读取文件、进行编辑并在工作目录中运行命令。

Codex 会在编辑工作区外的文件或运行需要网络访问的命令时请求审批。如果你只想聊天或规划而不做任何更改，可以使用 `/permissions` 命令切换到 `read-only` 模式。

Codex 还会对声明具有副作用的应用（连接器）工具调用发起审批请求，即使该操作不是 shell 命令或文件更改。当工具声明了破坏性注解时，破坏性的应用/MCP 工具调用始终需要审批，即使它同时声明了其他提示（例如只读提示）。

## 网络访问 <ElevatedRiskBadge class="ml-2" />

有关 Codex 云端，请参阅[代理互联网访问](https://developers.openai.com/codex/cloud/internet-access)以启用完全互联网访问或域名允许列表。

对于 Codex 应用、CLI 或 IDE 扩展，默认的 `workspace-write` 沙箱模式会关闭网络访问，除非你在配置中启用它：

```toml
[sandbox_workspace_write]
network_access = true
```

### 网络隔离

网络访问通过目标规则进行控制，这些规则适用于命令生成的脚本、程序和子进程。当命令网络访问已启用时，开启 `network_proxy` 功能可将该流量限制为你配置的网络策略。

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "example.com" = "deny" }
```

对于一次性 CLI 会话，当你只需要开关时使用布尔简写，当你还需要设置策略选项时使用表单形式：

```bash
codex \
  -c 'features.network_proxy=true' \
  -c 'sandbox_workspace_write.network_access=true'

codex \
  -c 'features.network_proxy.enabled=true' \
  -c 'features.network_proxy.domains={ "api.openai.com" = "allow", "example.com" = "deny" }' \
  -c 'sandbox_workspace_write.network_access=true'
```

该功能改变了已启用网络访问的强制执行方式；它本身并不授予网络访问权限。使用 `sandbox_workspace_write.network_access` 配合 `workspace-write` 配置来决定命令是否拥有网络访问：

- 网络关闭 + `network_proxy` 开启：网络保持关闭，该功能不起作用。
- 网络开启 + `network_proxy` 关闭：网络保持开启，不受限制的直接出站访问。
- 网络开启 + `network_proxy` 开启：网络保持开启，出站流量受配置的网络策略约束。

管理员管理的 `experimental_network` 需求与用户功能开关是分开的。它们可以在没有 `features.network_proxy` 的情况下配置和启动沙箱网络，但当活动沙箱关闭网络访问时，它们不会开启网络访问。有关管理员端的 `requirements.toml` 结构，请参阅[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration#configure-network-access-requirements)。

#### 网络策略

域名规则采用允许列表优先：

- 精确主机仅匹配自身。
- `*.example.com` 匹配子域名如 `api.example.com`，但不匹配 `example.com`。
- `**.example.com` 同时匹配顶级域名和子域名。
- 全局 `*` 允许规则匹配任何未被拒绝的公共主机。将 `*` 视为广泛的网络访问，在可能时优先使用范围限定规则。
- `deny` 始终优先于 `allow`，全局 `*` 仅对允许规则有效。

#### 本地和私有目标

默认情况下，`allow_local_binding = false` 会阻止环回、链路本地和私有目标：

- 特定例外：当命令需要某个本地目标时，添加精确的本地 IP 字面量或 `localhost` 允许规则。
- 更广泛的访问：仅当你有意想要更广泛的本地/私有访问范围时，才设置 `allow_local_binding = true`。
- 通配符：通配符规则不算作显式的本地例外。
- 已解析地址：解析到本地/私有 IP 的主机名即使匹配允许列表也会被阻止。

#### DNS 重绑定保护

在允许主机名之前，Codex 会执行尽力而为的 DNS 和 IP 分类检查：

- 失败或超时的查询会被阻止。
- 解析到非公共地址的主机名会被阻止。
- 该检查降低了 DNS 重绑定风险，但不能完全消除。完全防止重绑定需要通过传输层固定已解析的 IP。

如果恶意 DNS 在威胁范围内，请在更低层也强制执行出站控制。

#### 危险设置

有两个设置会刻意扩大信任边界：

- `dangerously_allow_non_loopback_proxy = true` 可以将代理监听器暴露到环回之外。
- `dangerously_allow_all_unix_sockets = true` 绕过 Unix 套接字允许列表。

仅在严格控制的环境中使用它们。当 Unix 套接字代理启用时，即使请求了非环回绑定，监听器也保持仅环回模式，因此沙箱网络不会成为远程桥接到本地守护进程的通道。

`network_proxy` 默认关闭。当你启用它时：

| 设置                                   | 默认值  | 行为                                                                                                                                                                                  |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                              | `false` | 仅在命令网络访问已开启时才启动沙箱网络。                                                                                                                                              |
| `domains`                              | 未设置  | 使用允许列表行为，因此在你添加 `allow` 规则之前不允许任何外部目标。支持精确主机、范围通配符和全局 `*` 允许规则；`deny` 始终优先。                                                      |
| `unix_sockets`                         | 未设置  | 在你添加显式 `allow` 规则之前不允许任何 Unix 套接字目标。                                                                                                                              |
| `allow_local_binding`                  | `false` | 阻止本地和私有网络目标，除非你添加精确的本地 IP 字面量或 `localhost` 允许规则，或显式选择更广泛的本地/私有访问。                                                                        |
| `enable_socks5`                        | `true`  | 当策略允许时暴露 SOCKS5 支持。                                                                                                                                                        |
| `enable_socks5_udp`                    | `true`  | 当 SOCKS5 可用时允许通过 SOCKS5 的 UDP。                                                                                                                                              |
| `allow_upstream_proxy`                 | `true`  | 让沙箱网络遵循来自环境的上游代理。                                                                                                                                                    |
| `dangerously_allow_non_loopback_proxy` | `false` | 除非你刻意将监听器端点暴露到 localhost 之外，否则保持在环回上。                                                                                                                        |
| `dangerously_allow_all_unix_sockets`   | `false` | 除非你刻意绕过该保护，否则保持基于允许列表的 Unix 套接字访问。                                                                                                                         |

你也可以在不向生成的命令授予完全网络访问的情况下控制 [web search 工具](https://platform.openai.com/docs/guides/tools-web-search)。Codex 默认使用 web search 缓存来访问结果。该缓存是 OpenAI 维护的 web 结果索引，因此缓存模式返回预索引的结果而不是获取实时页面。这降低了来自任意实时内容的提示词注入风险，但你仍应将 web 结果视为不受信任的。如果你使用 `--yolo` 或其他[完全访问沙箱设置](#常见沙箱和审批组合)，web search 默认使用实时结果。使用 `--search` 或设置 `web_search = "live"` 来允许实时浏览，或设置为 `"disabled"` 来关闭该工具：

```toml
web_search = "cached"  # 默认
# web_search = "disabled"
# web_search = "live"  # 等同于 --search
```

在 Codex 中启用网络访问或 web search 时请谨慎。提示词注入可能导致代理获取并遵循不受信任的指令。

## 默认值与建议

- 启动时，Codex 会检测文件夹是否受版本控制，并推荐：
  - 受版本控制的文件夹：`Auto`（工作区写入 + 按需审批）
  - 非版本控制的文件夹：`read-only`
- 根据你的设置，Codex 也可能以 `read-only` 模式启动，直到你显式信任工作目录（例如通过入职提示或 `/permissions`）。
- 工作区包括当前目录和临时目录如 `/tmp`。使用 `/status` 命令查看哪些目录在工作区内。
- 要接受默认值，运行 `codex`。
- 你可以显式设置：
  - `codex --sandbox workspace-write --ask-for-approval on-request`
  - `codex --sandbox read-only --ask-for-approval on-request`

### 可写根目录中的受保护路径

在默认的 `workspace-write` 沙箱策略中，可写根目录仍然包含受保护路径：

- `<writable_root>/.git` 以只读方式受保护，无论它作为目录还是文件出现。
- 如果 `<writable_root>/.git` 是指针文件（`gitdir: ...`），解析后的 Git 目录路径也以只读方式受保护。
- `<writable_root>/.agents` 当作为目录存在时以只读方式受保护。
- `<writable_root>/.codex` 当作为目录存在时以只读方式受保护。
- 保护是递归的，因此这些路径下的所有内容都是只读的。

### 无审批提示运行

你可以使用 `--ask-for-approval never` 或 `-a never`（简写）来禁用审批提示。

该选项适用于所有 `--sandbox` 模式，因此你仍然控制 Codex 的自主程度。Codex 在你设定的约束范围内尽力而为。

如果你需要 Codex 在无审批提示的情况下读取文件、进行编辑并运行带网络访问的命令，使用 `--sandbox danger-full-access`（或 `--dangerously-bypass-approvals-and-sandbox` 标志）。在这样做之前请谨慎考虑。

作为折中方案，`approval_policy = { granular = { ... } }` 允许你保持特定审批提示类别为交互式，同时自动拒绝其他类别。细粒度策略涵盖沙箱审批、execpolicy 规则提示、MCP 提示、`request_permissions` 提示和技能脚本审批。

### 自动审批审查

默认情况下，审批请求会路由给你：

```toml
approvals_reviewer = "user"
```

自动审批审查在审批为交互式时生效，例如 `approval_policy = "on-request"` 或细粒度审批策略。设置 `approvals_reviewer = "auto_review"` 可在 Codex 运行请求之前将符合条件的审批请求路由到审查代理：

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

有关完整的审查者生命周期、触发条件、配置优先级和失败行为，请参阅[自动审查](https://developers.openai.com/codex/concepts/sandboxing/auto-review)。

审查者仅评估已需要审批的操作，例如沙箱升级、被阻止的网络请求、`request_permissions` 提示或具有副作用的应用和 MCP 工具调用。保持在沙箱内的操作无需额外审查步骤即可继续。

审查者策略检查数据泄露、凭证探测、持久性安全削弱和破坏性操作。低风险和中风险操作在策略允许时可以继续。策略会拒绝关键风险操作。高风险操作需要足够的用户授权且没有匹配的拒绝规则。提示词构建、审查会话和解析失败会以关闭方式处理。超时会单独显示，但操作仍然不会运行。

[默认审查者策略](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)在开源 Codex 仓库中。企业可以在托管需求中使用 `guardian_policy_config` 替换其租户特定部分。本地 `[auto_review].policy` 文本也受支持，但托管需求优先。有关设置详情，请参阅[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

在 Codex 应用中，这些审查显示为自动审查项，带有状态如审查中、已批准、已拒绝、已中止或已超时。它们还可以包含所审查请求的风险级别和用户授权评估。

自动审查使用额外的模型调用，因此可能增加 Codex 用量。管理员可以使用 `allowed_approvals_reviewers` 来约束它。

### 常见沙箱和审批组合

| 意图                                                              | 标志 / 配置                                                                                                                         | 效果                                                                                                                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto（预设）                                                      | _无需标志_ 或 `--sandbox workspace-write --ask-for-approval on-request`                                                             | Codex 可以在工作区中读取文件、进行编辑和运行命令。Codex 在编辑工作区外或访问网络时需要审批。                                                          |
| 安全只读浏览                                                      | `--sandbox read-only --ask-for-approval on-request`                                                                                 | Codex 可以读取文件和回答问题。Codex 在进行编辑、运行命令或访问网络时需要审批。                                                                        |
| 只读非交互式（CI）                                                | `--sandbox read-only --ask-for-approval never`                                                                                      | Codex 只能读取文件；从不请求审批。                                                                                                                   |
| 自动编辑但运行不受信任命令时请求审批                              | `--sandbox workspace-write --ask-for-approval untrusted`                                                                            | Codex 可以读取和编辑文件，但在运行不受信任的命令前请求审批。                                                                                         |
| 自动审查模式                                                      | `--sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review` 或 `approvals_reviewer = "auto_review"` | 与标准按需模式相同的沙箱边界，但符合条件的审批请求由自动审查代替呈现给用户进行审查。                                                                  |
| 危险完全访问                                                      | `--dangerously-bypass-approvals-and-sandbox`（别名：`--yolo`）                                                                      | <ElevatedRiskBadge /> 无沙箱；无审批 _（不推荐）_                                                                                                    |

对于非交互式运行，使用 `codex exec --sandbox workspace-write`；Codex 保留旧版 `codex exec --full-auto` 调用作为已弃用的兼容路径并打印警告。

使用 `--ask-for-approval untrusted` 时，Codex 仅自动运行已知安全的读取操作。可能改变状态或触发外部执行路径的命令（例如破坏性 Git 操作或 Git 输出/配置覆盖标志）需要审批。

#### `config.toml` 中的配置

有关更广泛的配置工作流，请参阅[配置基础](https://developers.openai.com/codex/config-basic)、[高级配置](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes)和[配置参考](https://developers.openai.com/codex/config-reference)。

```toml
# 始终请求审批模式
approval_policy = "untrusted"
sandbox_mode    = "read-only"
allow_login_shell = false # 可选加固：禁止 shell 工具使用登录 shell

# 可选：在 workspace-write 模式中允许网络
[sandbox_workspace_write]
network_access = true

# 可选：细粒度审批策略
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }
```

你也可以将预设保存为[配置文件](https://developers.openai.com/codex/config-advanced#profiles)，然后使用 `codex --profile profile-name` 选择它们：

```toml
# ~/.codex/full_auto.config.toml
approval_policy = "on-request"
sandbox_mode    = "workspace-write"
```

```toml
# ~/.codex/readonly_quiet.config.toml
approval_policy = "never"
sandbox_mode    = "read-only"
```

### 本地测试沙箱

要查看命令在 Codex 沙箱下运行时会发生什么，使用以下 Codex CLI 命令：

```bash
# macOS
codex sandbox macos [--permissions-profile <name>] [--log-denials] [COMMAND]...
# Linux
codex sandbox linux [--permissions-profile <name>] [COMMAND]...
# Windows
codex sandbox windows [--permissions-profile <name>] [COMMAND]...
```

`sandbox` 命令也可以作为 `codex debug` 使用，平台辅助工具有别名（例如 `codex sandbox seatbelt` 和 `codex sandbox landlock`）。

## 操作系统级沙箱

Codex 根据你的操作系统以不同方式强制执行沙箱：

- **macOS** 使用 Seatbelt 策略，并使用与你选择的 `--sandbox` 模式对应的配置文件（`-p`）通过 `sandbox-exec` 运行命令。当受限读取访问启用平台默认值时，Codex 会附加一个精选的 macOS 平台策略（而不是广泛允许 `/System`）以保持常见工具兼容性。
- **Linux** 默认使用 `bwrap` 加 `seccomp`。
- **Windows** 在 [Windows Subsystem for Linux 2 (WSL2)](https://developers.openai.com/codex/windows#windows-subsystem-for-linux) 中运行时使用 Linux 沙箱实现。WSL1 在 Codex `0.114` 之前受支持；从 `0.115` 开始，Linux 沙箱迁移到 `bwrap`，因此不再支持 WSL1。在 Windows 上原生运行时，Codex 使用 [Windows 沙箱](https://developers.openai.com/codex/windows#windows-sandbox)实现。

如果你在 Windows 上使用 Codex IDE 扩展，它直接支持 WSL2。在 VS Code 设置中添加以下配置，以在 WSL2 可用时始终在其中运行代理：

```json
{
  "chatgpt.runCodexInWindowsSubsystemForLinux": true
}
```

这确保 IDE 扩展即使在宿主操作系统为 Windows 时也能继承 Linux 沙箱语义用于命令、审批和文件系统访问。详情请参阅 [Windows 设置指南](https://developers.openai.com/codex/windows)。

在 Windows 上原生运行时，在 `config.toml` 中配置原生沙箱模式：

```toml
[windows]
sandbox = "unelevated" # 或 "elevated"
# sandbox_private_desktop = true  # 默认；仅在兼容性需要时设为 false
```

详情请参阅 [Windows 设置指南](https://developers.openai.com/codex/windows#windows-sandbox)。

在 Docker 等容器化环境中运行 Linux 时，如果宿主或容器配置阻止了 Codex 所需的命名空间、setuid `bwrap` 或 `seccomp` 操作，沙箱可能无法工作。

在这种情况下，配置你的 Docker 容器以提供所需的隔离，然后在容器内使用 `--sandbox danger-full-access`（或 `--dangerously-bypass-approvals-and-sandbox` 标志）运行 `codex`。

### 在 Dev Containers 中运行 Codex

如果你的宿主无法直接运行 Linux 沙箱，或者你的组织已经标准化使用容器化开发，可以使用 Dev Containers 运行 Codex，让 Docker 提供外部隔离边界。这适用于 Visual Studio Code Dev Containers 和兼容工具。

使用 [Codex 安全 devcontainer 示例](https://github.com/openai/codex/tree/main/.devcontainer)作为参考实现。该示例安装了 Codex、常见开发工具、`bubblewrap` 和基于防火墙的出站控制。

Devcontainers 提供了实质性保护，但并不能防止所有攻击。如果你在容器内使用 `--sandbox danger-full-access` 或 `--dangerously-bypass-approvals-and-sandbox` 运行 Codex，恶意项目可以泄露 devcontainer 内可用的任何内容，包括 Codex 凭据。仅对受信任的仓库使用此模式，并像在任何其他提权环境中一样监控 Codex 活动。

参考实现包括：

- 一个安装了 Codex 和常见开发工具的 Ubuntu 24.04 基础镜像；
- 一个基于允许列表的出站访问防火墙配置；
- VS Code 设置和扩展推荐，用于在容器中重新打开工作区；
- 用于命令历史和 Codex 配置的持久挂载；
- `bubblewrap`，以便 Codex 在容器授予所需能力时仍可使用其 Linux 沙箱。

要试用：

1. 安装 Visual Studio Code 和 [Dev Containers 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)。
2. 将 Codex 示例 `.devcontainer` 设置复制到你的仓库，或直接从 Codex 仓库开始。
3. 在 VS Code 中，运行 **Dev Containers: Open Folder in Container...** 并选择 `.devcontainer/devcontainer.secure.json`。
4. 容器启动后，打开终端并运行 `codex`。

你也可以从 CLI 启动容器：

```bash
devcontainer up --workspace-folder . --config .devcontainer/devcontainer.secure.json
```

该示例有三个主要部分：

- `.devcontainer/devcontainer.secure.json` 控制容器设置、能力、挂载、环境变量和 VS Code 扩展。
- `.devcontainer/Dockerfile.secure` 定义基于 Ubuntu 的镜像和安装的工具。
- `.devcontainer/init-firewall.sh` 应用出站网络策略。

参考防火墙故意作为一个起点。如果你依赖域名允许列表进行隔离，请实现适合你环境的 DNS 重绑定和 DNS 刷新保护，例如 TTL 感知刷新或 DNS 感知防火墙。

在容器内，选择以下模式之一：

- 如果 Dev Container 配置文件授予了 `bwrap` 创建内部沙箱所需的能力，则保持 Codex 的 Linux 沙箱启用。
- 如果容器是你预期的安全边界，在容器内使用 `--sandbox danger-full-access` 运行 Codex，这样 Codex 就不会尝试创建第二层沙箱。

## 版本控制

Codex 在版本控制工作流中效果最佳：

- 在功能分支上工作，并在委托之前保持 `git status` 干净。这使 Codex 补丁更容易隔离和回退。
- 优先使用基于补丁的工作流（例如 `git diff`/`git apply`）而不是直接编辑跟踪的文件。频繁提交以便可以小幅回退。
- 将 Codex 建议视为任何其他 PR：运行有针对性的验证、审查差异，并在提交消息中记录决策以供审计。

## 监控与遥测

Codex 支持通过 OpenTelemetry (OTel) 进行可选监控，帮助团队审计使用情况、调查问题并满足合规要求，同时不削弱本地安全默认值。遥测默认关闭；请在配置中显式启用。

### 概述

- Codex 默认关闭 OTel 导出，以保持本地运行的自包含性。
- 启用后，Codex 发出结构化日志事件，涵盖对话、API 请求、SSE/WebSocket 流活动、用户提示词（默认脱敏）、工具审批决策和工具结果。
- Codex 使用 `service.name`（发起者）、CLI 版本和环境标签标记导出的事件，以区分开发/预发/生产流量。

### 启用 OTel（可选）

在 Codex 配置（通常是 `~/.codex/config.toml`）中添加 `[otel]` 块，选择导出器和是否记录提示词文本。

```toml
[otel]
environment = "staging"   # dev | staging | prod
exporter = "none"          # none | otlp-http | otlp-grpc
log_user_prompt = false     # 除非策略允许，否则脱敏提示词文本
```

- `exporter = "none"` 保持检测活动但不向任何地方发送数据。
- 要将事件发送到你自己的收集器，选择以下之一：

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

Codex 批量处理事件并在关闭时刷新。Codex 仅导出其 OTel 模块产生的遥测数据。

### 事件类别

代表性事件类型包括：

- `codex.conversation_starts`（模型、推理设置、沙箱/审批策略）
- `codex.api_request`（尝试、状态/成功、持续时间和错误详情）
- `codex.sse_event`（流事件类型、成功/失败、持续时间，以及 `response.completed` 上的 token 计数）
- `codex.websocket_request` 和 `codex.websocket_event`（请求持续时间加上每条消息的类型/成功/错误）
- `codex.user_prompt`（长度；内容默认脱敏除非显式启用）
- `codex.tool_decision`（批准/拒绝，来源：配置 vs. 用户）
- `codex.tool_result`（持续时间、成功、输出片段）

关联的 OTel 指标（计数器加持续时间直方图对）包括 `codex.api_request`、`codex.sse_event`、`codex.websocket.request`、`codex.websocket.event` 和 `codex.tool.call`（带有对应的 `.duration_ms` 仪器）。

有关完整的事件目录和配置参考，请参阅 [GitHub 上的 Codex 配置文档](https://github.com/openai/codex/blob/main/docs/config.md#otel)。

### 安全与隐私指南

- 保持 `log_user_prompt = false`，除非策略显式允许存储提示词内容。提示词可能包含源代码和敏感数据。
- 仅将遥测路由到你控制的收集器；应用符合合规要求的保留限制和访问控制。
- 将工具参数和输出视为敏感数据。尽可能在收集器或 SIEM 中进行脱敏处理。
- 如果你不希望 Codex 在 `CODEX_HOME` 下保存会话记录，请检查本地数据保留设置（例如 `history.persistence` / `history.max_bytes`）。请参阅[高级配置](https://developers.openai.com/codex/config-advanced#history-persistence)和[配置参考](https://developers.openai.com/codex/config-reference)。
- 如果你在网络访问关闭的情况下运行 CLI，OTel 导出将无法到达你的收集器。要导出，请在 `workspace-write` 模式中为 OTel 端点允许网络访问，或从 Codex 云端导出并将收集器域名添加到你的批准列表中。
- 定期审查事件以发现审批/沙箱更改和意外的工具执行。

OTel 是可选的，旨在补充而非替代上述沙箱和审批保护。

## 托管配置

企业管理员可以在[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)中为其工作区配置 Codex 安全设置。请参阅该页面了解设置和策略详情。
