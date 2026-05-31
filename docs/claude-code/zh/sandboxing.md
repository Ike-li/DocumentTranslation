> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 配置沙箱化 Bash 工具

> 了解 Claude Code 的沙箱化 Bash 工具如何提供文件系统和网络隔离，以实现更安全、更自主的代理执行。

Bash 沙箱让 Claude 可以运行大多数 shell 命令而无需停下来请求权限。你无需逐一审批每条命令，而是定义命令可以访问哪些文件和网络域名，操作系统会为每条 Bash 命令及其子进程强制执行这些边界。

本页涵盖以下内容：

* [启用沙箱](#快速开始)并选择沙箱化命令的审批方式
* [配置](#配置沙箱)命令可访问的路径和网络域名
* [将沙箱与权限规则和权限模式结合使用](#沙箱与权限和权限模式的关系)
* [通过托管设置在整个组织中强制执行沙箱](#为组织配置沙箱)

要比较其他隔离方法（如开发容器、自定义容器和虚拟机），请参阅[沙箱环境](/zh/sandbox-environments)。要减少 Bash 以外工具的权限提示，请参阅[权限模式](/zh/permission-modes)。

## 快速开始

沙箱内置于 Claude Code 中，可在 macOS、Linux 和 WSL2 上运行。不支持原生 Windows。在 Windows 上，请在 WSL2 发行版内运行 Claude Code。

在 macOS 上无需安装任何东西：沙箱使用内置的 Seatbelt 框架。在 Linux 和 WSL2 上，沙箱依赖两个软件包，详见[设置 Linux 和 WSL2](#设置-linux-和-wsl2)。即使你尚未安装它们，也可以从 `/sandbox` 开始，因为其面板会显示是否缺少任何依赖。

**步骤 1：运行 /sandbox**

启动 Claude Code 会话并运行 `/sandbox` 命令：

```text
/sandbox
```

这将打开沙箱面板，包含三个标签页：

* **模式**：选择沙箱化命令的审批方式，详见下一步
* **覆盖**：选择在沙箱中失败的命令是否可以回退到非沙箱化运行。这就是 [`allowUnsandboxedCommands`](/zh/settings#sandbox-settings) 设置
* **配置**：查看已解析的沙箱设置

如果面板仅显示"依赖项"标签页，说明缺少必需的软件包。请按照[设置 Linux 和 WSL2](#设置-linux-和-wsl2)中的说明安装，然后重启 Claude Code 并再次运行 `/sandbox`。

**步骤 2：选择模式**

在"模式"标签页上，选择自动允许或常规权限。自动允许在沙箱化命令运行时无需提示，常规权限即使在命令被沙箱化时也会保留常规权限提示。有关自动允许模式下哪些命令仍会提示的信息，请参阅[沙箱模式](#沙箱模式)。

**步骤 3：运行 Bash 命令**

要求 Claude 运行命令，例如构建或测试套件。默认情况下，沙箱内的命令只能写入工作目录。当命令首次需要新的网络域名时，Claude Code 会提示你批准。

无法在沙箱中运行的命令会回退到常规权限流程。要扩大或缩小这些边界，请参阅[配置沙箱](#配置沙箱)。

在面板中选择模式会写入项目本地设置 `.claude/settings.local.json`，该设置适用于当前项目且不会提交到 git。要在所有项目中启用沙箱，请在用户设置 `~/.claude/settings.json` 中将 [`sandbox.enabled`](/zh/settings#sandbox-settings) 设置为 `true`。要为组织中的每位开发者强制执行沙箱，请使用[托管设置](#通过托管设置强制执行沙箱)。

默认情况下，如果沙箱因缺少依赖或平台不受支持而无法启动，Claude Code 会显示警告并在不使用沙箱的情况下运行命令。要将其设为硬性失败，请将 [`sandbox.failIfUnavailable`](/zh/settings#sandbox-settings) 设置为 `true`。这适用于需要将沙箱作为安全门控的托管部署。

### 设置 Linux 和 WSL2

在 Linux 和 WSL2 上，沙箱依赖两个软件包：

* [`bubblewrap`](https://github.com/containers/bubblewrap)：用于强制文件系统隔离的非特权沙箱工具
* [`socat`](http://www.dest-unreach.org/socat/)：用于通过沙箱代理路由网络流量的中继

使用你的发行版包管理器安装它们：

**Ubuntu/Debian**

```bash
sudo apt-get install bubblewrap socat
```

**Fedora**

```bash
sudo dnf install bubblewrap socat
```

安装后，`/sandbox` 中的"依赖项"标签页会显示 `ripgrep`、`bubblewrap`、`socat` 和 seccomp 过滤器在你的平台上是否可用。Ripgrep 与原生 Claude Code 二进制文件捆绑在一起。seccomp 过滤器是可选的，用于添加 Unix 域套接字阻止功能。如果缺少，请运行 `npm install -g @anthropic-ai/sandbox-runtime` 进行安装。

当缺少必需依赖时，"依赖项"标签页是唯一显示的标签页，直到你安装完成。依赖检查在启动时运行，因此安装软件包后请重启 Claude Code，以便 `/sandbox` 能够检测到它们。

**Ubuntu 24.04 及更高版本：允许 bubblewrap 创建用户命名空间**

在 Ubuntu 24.04 及更高版本上，默认的 AppArmor 策略会阻止 bubblewrap 创建其隔离所需的用户命名空间。

要检查你的环境是否强制执行此限制（包括 WSL2 内部），请运行 `sysctl kernel.apparmor_restrict_unprivileged_userns`。如果该键不存在或返回 `0`，请跳过此步骤。如果返回 `1`，请添加一个授予 `bwrap` 此能力的 AppArmor 配置文件：

```bash
sudo tee /etc/apparmor.d/bwrap > /dev/null <<'EOF'
abi <abi/4.0>,
include <tunables/global>

profile bwrap /usr/bin/bwrap flags=(unconfined) {
  userns,
  include if exists <local/bwrap>
}
EOF
```

该配置文件仅适用于 `bwrap` 本身，不适用于它在沙箱内运行的命令。重新加载 AppArmor 以使其生效：

```bash
sudo systemctl reload apparmor
```

**WSL2 注意事项**

从 PowerShell 使用 `wsl -l -v` 检查你的 WSL 版本。如果你看到 `Sandboxing requires WSL2`，说明你的发行版正在运行 WSL1。请将其升级到 WSL2 或在不使用沙箱的情况下运行 Claude Code。

在 WSL2 上，沙箱化命令无法启动 Windows 二进制文件，如 `cmd.exe`、`powershell.exe` 或 `/mnt/c/` 下的任何内容。WSL 通过 Unix 套接字将这些请求传递给 Windows 主机，而沙箱会阻止此操作。如果命令需要调用 Windows 二进制文件，请将其添加到 [`excludedCommands`](/zh/settings#sandbox-settings)，使其在沙箱外运行。

### 沙箱模式

Claude Code 提供两种沙箱模式：

**自动允许模式**：Bash 命令将尝试在沙箱内运行，并自动获得允许而无需请求权限。无法被沙箱化的命令（如需要访问非允许主机的网络命令）会回退到常规权限流程，Claude Code 会检查你的[权限规则](/zh/permissions)并对规则尚未允许的任何命令进行提示。

即使在自动允许模式下，以下规则仍然适用：

* 显式[拒绝规则](/zh/permissions)始终被尊重
* 以 `/`、你的主目录或其他关键系统路径为目标的 `rm` 或 `rmdir` 命令仍会触发权限提示
* [询问规则](/zh/permissions)适用于回退到常规权限流程的命令

**常规权限模式**：所有 Bash 命令都经过常规权限流程，即使已被沙箱化。这提供了更多控制但需要更多审批。

在两种模式下，沙箱强制执行相同的文件系统和网络限制。区别仅在于沙箱化命令是自动批准还是需要显式权限。

某些命令根本无法在沙箱内运行，例如与沙箱不兼容的工具或需要访问你未允许的主机的工具。Claude Code 包含一个应急机制，而不是让任务失败或要求你关闭沙箱：当命令因沙箱限制而失败时，Claude 会分析失败原因，并可能使用 `dangerouslyDisableSandbox` 参数重试该命令。重试的命令在沙箱外运行，因此它会经过常规权限流程并需要你的批准。

你可以通过在[沙箱设置](/zh/settings#sandbox-settings)中设置 `"allowUnsandboxedCommands": false` 来禁用此应急机制。禁用后（`/sandbox` 的"覆盖"标签页显示为**严格沙箱模式**），`dangerouslyDisableSandbox` 参数将被完全忽略，所有命令必须在沙箱内运行或在 `excludedCommands` 中明确列出。

自动允许模式独立于你的权限模式设置。即使你不在"接受编辑"模式下，启用自动允许后沙箱化 Bash 命令也会自动运行。这意味着在沙箱边界内修改文件的 Bash 命令将无需提示即可执行，即使文件编辑工具通常需要审批。

## 配置沙箱

通过 `settings.json` 文件自定义沙箱行为。完整配置参考请参阅[设置](/zh/settings#sandbox-settings)。

默认情况下，沙箱化命令只能写入当前工作目录。如果 `kubectl`、`terraform` 或 `npm` 等子进程命令需要写入项目目录外部，请使用 `sandbox.filesystem.allowWrite` 授予对特定路径的访问权限：

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowWrite": ["~/.kube", "/tmp/build"]
    }
  }
}
```

这些路径在操作系统级别强制执行，因此沙箱内运行的所有命令（包括其子进程）都会遵守。当工具需要对特定位置的写入访问权限时，建议使用此方法，而不是使用 `excludedCommands` 将工具完全排除在沙箱之外。

当同一文件系统数组在多个[设置作用域](/zh/settings#settings-precedence)中定义时，数组会合并：每个作用域的路径会组合而非替换。

路径前缀控制路径的解析方式：

| 前缀              | 含义                                                         | 示例                                                                      |
| :---------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------ |
| `/`               | 文件系统根目录的绝对路径                                     | `/tmp/build` 保持 `/tmp/build`                                            |
| `~/`              | 相对于主目录                                                 | `~/.kube` 变为 `$HOME/.kube`                                              |
| `./` 或无前缀     | 项目设置中相对于项目根目录，用户设置中相对于 `~/.claude`     | `.claude/settings.json` 中的 `./output` 解析为 `<project-root>/output`    |

此语法不同于[读取和编辑权限规则](/zh/permissions#read-and-edit)，后者使用 `//path` 表示绝对路径，`/path` 表示项目相对路径。沙箱文件系统路径使用标准约定：`/tmp/build` 是绝对路径。

你还可以使用 `sandbox.filesystem.denyWrite` 和 `sandbox.filesystem.denyRead` 来拒绝写入或读取访问，并使用 `sandbox.filesystem.allowRead` 在被拒绝的区域内重新允许特定路径。

以下示例阻止读取整个主目录，同时仍允许读取当前项目。请将其放在项目的 `.claude/settings.json` 中，因为相对路径 `.` 仅在配置位于项目设置中时才解析为项目根目录：

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyRead": ["~/"],
      "allowRead": ["."]
    }
  }
}
```

`allowRead` 中的 `.` 解析为项目根目录，因为此配置位于项目设置中。如果你将相同的配置放在 `~/.claude/settings.json` 中，`.` 将解析为 `~/.claude`，项目文件仍将被 `denyRead` 规则阻止。

## 沙箱工作原理

### 文件系统隔离

沙箱化 Bash 工具将文件系统访问限制在特定目录：

* **默认写入行为**：对当前工作目录及其子目录的读写访问
* **默认读取行为**：对整个计算机的读取访问，某些被拒绝的目录除外。请注意，此默认值仍允许读取 `~/.aws/credentials` 和 `~/.ssh/` 等凭据文件。将它们添加到 `denyRead` 以阻止访问。
* **被阻止的访问**：未经显式许可无法修改当前工作目录外的文件，包括 `~/.bashrc` 等 shell 配置文件和 `/bin/` 中的系统二进制文件
* **Git 工作树**：当工作目录是[链接的 git 工作树](/zh/worktrees)时，沙箱还允许写入主仓库的共享 `.git` 目录，以便 `git commit` 等命令可以更新引用和索引。对该目录中 `hooks/` 和 `config` 的写入仍然被拒绝。
* **可配置**：通过设置定义自定义允许和拒绝路径

你可以使用设置中的 `sandbox.filesystem.allowWrite` 授予对额外路径的写入访问权限。这些限制在操作系统级别强制执行，因此适用于所有子进程命令，包括 `kubectl`、`terraform` 和 `npm` 等工具，而不仅仅是 Claude 的文件工具。

### 网络隔离

网络访问通过在沙箱外运行的代理服务器控制：

* **域名限制**：没有预先允许的域名。当命令首次需要新的域名时，Claude Code 会提示你批准。使用 [`allowedDomains`](/zh/settings#sandbox-settings) 预先允许域名以避免提示。
* **托管锁定**：如果在托管设置中设置了 [`allowManagedDomainsOnly`](/zh/settings#sandbox-settings)，非允许的域名将被自动阻止而不是提示，并且只接受托管设置中的 `allowedDomains`。
* **自定义代理支持**：高级用户可以对传出流量实现自定义规则
* **全面覆盖**：限制适用于命令生成的所有脚本、程序和子进程

内置代理基于请求的主机名强制执行允许列表，不会终止或检查 TLS 流量。有关此设计的影响，请参阅[安全限制](#安全限制)。如果你的威胁模型需要 TLS 检查，请参阅[自定义代理配置](#自定义代理配置)。

### 操作系统级强制执行

沙箱化 Bash 工具利用操作系统安全原语：

* **macOS**：使用 Seatbelt 进行沙箱强制执行
* **Linux**：使用 [bubblewrap](https://github.com/containers/bubblewrap) 进行隔离
* **WSL2**：使用 bubblewrap，与 Linux 相同

不支持 WSL1，因为 bubblewrap 需要仅在 WSL2 中可用的内核功能。这些操作系统级限制确保 Claude Code 命令生成的所有子进程继承相同的安全边界。

这些相同的原语可作为独立的 [`@anthropic-ai/sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime) 包使用，[沙箱环境](/zh/sandbox-environments#sandbox-runtime)页面将其作为包装整个 Claude Code 进程的单独方法进行了介绍。

## 沙箱与权限和权限模式的关系

沙箱、[权限规则](/zh/permissions)和[权限模式](/zh/permission-modes)是互补的层次。以下各节介绍沙箱如何与每个部分交互。

### 权限规则

权限规则和沙箱控制不同的内容：

* **权限规则**控制 Claude Code 可以使用哪些工具，并在任何工具运行之前进行评估。它们适用于所有工具：Bash、Read、Edit、WebFetch、MCP 等。
* **沙箱**提供操作系统级强制执行，限制 Bash 命令在文件系统和网络层面的访问。它仅适用于 Bash 命令及其子进程。

两个层次在强制执行方式上也有所不同。Claude Code 在命令运行之前评估权限决策，基于命令字符串以及在自动模式下由单独的分类器判断命令是否安全。操作系统在运行中的进程上强制执行沙箱边界，因此无论模型选择运行什么内容，甚至当允许的命令做了超出其名称所暗示的事情时，该边界都有效。

文件系统和网络限制通过沙箱设置和权限规则进行配置：

| 设置或规则                                                       | 功能                                                                                              |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `sandbox.filesystem.allowWrite`                                  | 授予子进程对工作目录外路径的写入访问权限                                                         |
| `sandbox.filesystem.denyWrite` 和 `sandbox.filesystem.denyRead`  | 阻止子进程对特定路径的访问                                                                       |
| `sandbox.filesystem.allowRead`                                   | 在 `denyRead` 区域内重新允许读取特定路径                                                         |
| `Edit` 允许规则                                                  | 授予对特定路径的写入访问权限，与 `sandbox.filesystem.allowWrite` 相同                            |
| `Read` 和 `Edit` 拒绝规则                                        | 阻止对特定文件或目录的访问                                                                       |
| `WebFetch` 允许和拒绝规则                                        | 控制域名访问                                                                                      |
| 沙箱 `allowedDomains`                                            | 控制 Bash 命令可访问的域名                                                                       |
| 沙箱 `deniedDomains`                                             | 即使更广泛的 `allowedDomains` 通配符允许，也阻止特定域名                                         |

来自 `sandbox.filesystem` 设置和权限规则的路径会合并到最终的沙箱配置中。

[claude-code 仓库的示例目录](https://github.com/anthropics/claude-code/tree/main/examples/settings)包含常见部署场景的入门设置配置，包括沙箱特定的示例。将它们作为起点并根据需要进行调整。

### 权限模式

`/sandbox` 不是一种[权限模式](/zh/permission-modes)。权限模式决定工具调用是否运行以及是否先提示你，而沙箱限制 Bash 命令运行后可访问的内容。它们在控制内容和替代逐操作提示的方式上有所不同：

|                                                                    | 控制内容                                    | 替代提示的内容                                                                                                                        |
| :----------------------------------------------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/sandbox`                                                         | Bash 命令运行后可访问的内容                 | 沙箱边界本身，在[自动允许模式](#沙箱模式)下                                                                                              |
| [自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)  | 每个工具调用是否运行                        | 审查操作的分类器                                                                                                                              |
| `--dangerously-skip-permissions`                                   | 每个工具调用是否运行                        | 无。[受保护路径](/zh/permission-modes#protected-paths)检查也会被跳过；只有删除 `/` 或主目录仍会提示                                           |

沙箱的[自动允许模式](#沙箱模式)与[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)是分开的：自动允许因为沙箱边界包含 Bash 命令而批准它们，而自动模式使用分类器审查操作。两者独立工作，可以组合使用。要为无人值守运行选择隔离边界，请参阅[沙箱环境](/zh/sandbox-environments#how-isolation-relates-to-permission-modes)。

## 为组织配置沙箱

管理员可以为每位用户要求使用沙箱，防止开发者扩大策略，并将沙箱流量路由到企业代理。

### 通过托管设置强制执行沙箱

要为每位开发者要求使用沙箱，请通过[托管设置](/zh/settings#settings-files)提供 `sandbox` 键，可以是 MDM 管理的文件，也可以通过 Claude.ai 上的[服务器托管设置](/zh/server-managed-settings)。

以下托管设置配置启用沙箱，如果沙箱无法初始化则拒绝启动 Claude Code，并防止模型在沙箱外重试命令：

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

`enabled` 之外的两个键控制沙箱无法运行命令时的行为：

* **`failIfUnavailable`**：缺少 bubblewrap 等 Linux 依赖会阻止 Claude Code 启动，而不是显示警告并回退到非沙箱化执行
* **`allowUnsandboxedCommands: false`**：`dangerouslyDisableSandbox` 应急机制被忽略，因此在沙箱中失败的命令无法在其外部重试

除了它们之外，还有两个补充项值得考虑。为任何组织批准的必须在无隔离环境中运行的工具添加 `excludedCommands`。为 `~/.aws` 和 `~/.ssh` 等凭据目录添加 [`denyRead`](#文件系统隔离) 条目，因为默认读取策略仍然允许它们。

沙箱不在原生 Windows 上运行，因此如果你的设备包含 Windows 主机，请将此配置限定在 macOS 和 Linux 上，或让这些用户在 WSL2 或容器内运行 Claude Code。

### 防止开发者扩大策略

对于 `enabled` 和 `failIfUnavailable` 等布尔键，Claude Code 使用托管值并忽略开发者在本地设置的任何内容。对于 `excludedCommands` 和 `allowRead` 等数组键，Claude Code 会合并每个作用域的条目，因此开发者可以添加扩大策略的条目。

在托管设置中将 `allowManagedReadPathsOnly` 设置为 `true`，以便只接受托管设置中的 `allowRead` 条目。用户、项目和本地 `allowRead` 条目将被忽略。这可以防止开发者将读取访问扩大到超出组织批准的路径。要以相同方式将网络域名锁定为托管值，请设置 [`allowManagedDomainsOnly`](/zh/settings#sandbox-settings)。

`excludedCommands` 没有等效的仅托管锁定，因此开发者始终可以添加在沙箱外运行额外命令的条目。请保持托管列表范围较小。

### 自定义代理配置

对于需要高级网络安全的组织，你可以实现自定义代理来：

* 解密和检查 HTTPS 流量
* 应用自定义过滤规则
* 记录所有网络请求
* 与现有安全基础设施集成

要将 Claude Code 指向你的代理，请在[沙箱设置](/zh/settings#sandbox-settings)中设置代理端口：

```json
{
  "sandbox": {
    "network": {
      "httpProxyPort": 8080,
      "socksProxyPort": 8081
    }
  }
}
```

## 故障排除

某些命令在沙箱内失败但在沙箱外正常工作。以下修复涵盖了最常见的情况。

* **命令因主机未允许错误而失败**：许多 CLI 工具需要访问特定主机。在提示时授予权限会将该主机添加到你的允许列表中，以便该工具将来在沙箱内运行。
* **`jest` 挂起或失败**：`watchman` 与沙箱不兼容。请改用 `jest --no-watchman`。
* **基于 Go 的 CLI 在 macOS 上 TLS 验证失败**：`gh`、`gcloud` 和 `terraform` 等工具可能在 Seatbelt 下 TLS 验证失败。将这些工具列在 `excludedCommands` 中，使其在沙箱外运行。如果你正在使用 `httpProxyPort` 配合 MITM 代理和自定义 CA，请改为将 [`enableWeakerNetworkIsolation`](/zh/settings#sandbox-settings) 设置为 `true`。
* **`docker` 命令失败**：`docker` 与沙箱不兼容。将 `docker *` 添加到 `excludedCommands`，使其在沙箱外运行。
* **Bubblewrap 在容器内无法启动**：在非特权容器中，bubblewrap 无法挂载全新的 `/proc` 文件系统。将 [`enableWeakerNestedSandbox`](/zh/settings#sandbox-settings) 设置为 `true`，使内部沙箱绑定挂载容器现有的 `/proc`。仅在外部容器已提供你需要的隔离边界时使用此设置，因为它会向沙箱化命令暴露全新的 `/proc` 挂载会隐藏的进程信息。
* **Linux 上的 seccomp 过滤器**：seccomp 过滤器用于阻止 Unix 域套接字。`/sandbox` 中的"依赖项"标签页会显示其是否可用。如果缺少，请运行 `npm install -g @anthropic-ai/sandbox-runtime` 安装帮助程序。
* **`--dangerously-skip-permissions` 以 root 身份失败**：在 Linux 和 macOS 上以 root 或通过 sudo 运行时，此标志会被阻止，因为 root 访问权限加上无权限提示可以修改系统上的任何文件或服务。在受认可的沙箱内会自动跳过此检查。要在容器中自主运行，请使用[开发容器](/zh/devcontainer)配置，它以非 root 用户身份运行 Claude Code。

## 限制

沙箱降低风险但不是完整的隔离边界。在将其作为硬性安全控制依赖之前，请查看以下限制。

### 安全限制

* **网络过滤**：网络过滤系统通过限制进程允许连接的域名来运行。内置代理不终止或对出站流量执行 TLS 检查，因此加密连接的内容不会被检查。你有责任确保策略中只允许受信任的域名。

允许 `github.com` 等广泛域名可能会为数据泄露创造路径。因为代理根据客户端提供的主机名做出允许决定而不检查 TLS，沙箱内运行的代码可能使用[域前置](https://en.wikipedia.org/wiki/Domain_fronting)或类似技术访问允许列表外的主机。如果你的威胁模型需要更强的保证，请配置一个终止 TLS 并检查流量的[自定义代理](#自定义代理配置)，并在沙箱内安装其 CA 证书。更强的 TLS 感知网络隔离是正在积极开发的领域。

* **通过 Unix 套接字的权限提升**：`allowUnixSockets` 配置可能会无意中授予对可能导致沙箱绕过的强大系统服务的访问。例如，允许访问 `/var/run/docker.sock` 实际上通过 Docker 套接字授予了对主机系统的访问权限。请仔细考虑你通过沙箱允许的任何 Unix 套接字。
* **文件系统权限提升**：过于宽泛的文件系统写入权限可能启用权限提升攻击。允许写入 `$PATH` 中包含可执行文件的目录、系统配置目录或 `.bashrc` 或 `.zshrc` 等用户 shell 配置文件，当其他用户或系统进程访问这些文件时，可能导致在不同安全上下文中执行代码。
* **Linux 沙箱强度**：Linux 实现提供强大的文件系统和网络隔离，但包含一个 `enableWeakerNestedSandbox` 模式，使其能够在没有特权命名空间的 Docker 环境中工作，或在通过 sysctl 禁用非特权用户命名空间的 Linux 主机上工作。此选项会显著降低安全性，仅在有其他隔离措施强制执行时才应使用。
* **设置文件受保护**：沙箱自动拒绝写入每个作用域的 Claude Code `settings.json` 文件和托管设置目录，因此沙箱化命令无法修改自身的策略。

### 平台和工具兼容性

* **平台支持**：支持 macOS、Linux 和 WSL2。不支持 WSL1 和原生 Windows。
* **性能开销**：最小，但某些文件系统操作可能稍慢。
* **工具兼容性**：某些需要特定系统访问模式的工具可能需要调整配置，或需要在沙箱外运行。

### 范围

沙箱隔离 Bash 子进程。其他工具在不同的边界下运行：

* **内置文件工具**：Read、Edit 和 Write 直接使用权限系统而非通过沙箱运行。请参阅[权限](/zh/permissions)。
* **计算机使用**：当 Claude 打开应用并控制你的屏幕时，它在你的实际桌面上运行而非在隔离环境中。每个应用的权限提示控制每个应用程序。请参阅 [CLI 中的计算机使用](/zh/computer-use)或[桌面端的计算机使用](/zh/desktop#let-claude-use-your-computer)。
* **环境变量**：沙箱化 Bash 命令默认继承父进程环境，包括其中设置的任何凭据。要从子进程中剥离 Anthropic 和云提供商凭据，请设置 [`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`](/zh/env-vars)。
* **子代理**：[子代理](/zh/sub-agents)在与父会话相同的进程中运行，并使用相同的沙箱配置。当父会话中启用沙箱时，子代理内的 Bash 命令会被沙箱化。

有效的沙箱需要同时具备文件系统和网络隔离。没有网络隔离，被入侵的代理可能会泄露 SSH 密钥等敏感文件。没有文件系统隔离，被入侵的代理可能会对系统资源植入后门以获取网络访问权限。当你扩大默认值时，请检查 `allowWrite` 路径、广泛的 `allowedDomains` 条目或 `excludedCommands` 例外是否取消了另一侧的限制。

## 另请参阅

* [沙箱环境](/zh/sandbox-environments)：将内置沙箱与开发容器、容器和虚拟机进行比较
* [安全](/zh/security)：全面的安全功能和最佳实践
* [权限](/zh/permissions)：权限配置和访问控制
* [设置](/zh/settings)：完整配置参考
* [CLI 参考](/zh/cli-reference)：命令行选项
