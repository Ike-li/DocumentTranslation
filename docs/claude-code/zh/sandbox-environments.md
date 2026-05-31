> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 选择沙箱环境

> 比较 Claude Code 沙箱选项：内置沙箱 Bash 工具、沙箱运行时、开发容器、Docker 和虚拟机。根据您的威胁模型选择合适的隔离方案。

隔离 Claude Code 可以限制会话在文件系统和网络上的读写和访问范围。当您希望 Claude 在更少的权限提示下工作、无人值守运行它，或将其指向您不完全信任的代码时，这一点尤为重要。

Claude Code 可以在多种隔离环境中运行，从轻量级的按命令沙箱到完全独立的虚拟机。本页介绍如何：

* [比较](#比较沙箱方案)可用的隔离方案，包括它们隔离的内容、所需条件以及涉及的设置工作量
* [选择](#选择方案)适合您目标和威胁模型的方案
* [开始使用](#沙箱-bash-工具)您选择的方案，从内置 Bash 沙箱到专用虚拟机
* [强制执行](#在组织内强制执行隔离)组织内每个开发者的隔离

**信息**：有关更广泛的安全模型，请参阅[安全](/zh/security)。有关 Agent SDK 部署，请参阅[安全部署](/zh/agent-sdk/secure-deployment)。

## 比较沙箱方案

下表中的前两种方案在宿主操作系统上运行，不使用容器。其余方案将 Claude Code 放置在容器或虚拟机内部。

| 方案 | 隔离内容 | 需要 Docker | 设置工作量 |
| :--- | :--- | :--- | :--- |
| [沙箱 Bash 工具](#沙箱-bash-工具) | Bash 命令及其子进程 | 否 | macOS 上最低；Linux 和 WSL2 上较低 |
| [沙箱运行时](#沙箱运行时) | 整个 Claude Code 进程，包括文件工具、MCP 服务器和钩子 | 否 | 低 |
| [开发容器](#开发容器) | 完整开发环境 | 是 | 中等 |
| [自定义容器](#自定义容器) | 完整开发环境 | 是 | 中到高 |
| [虚拟机](#虚拟机) | 完整操作系统 | 否 | 高 |
| [网页版 Claude Code](#网页版-claude-code) | 完整操作系统，由 Anthropic 托管 | 否 | 无需设置；需要 Claude 订阅和 GitHub |

[沙箱 Bash 工具](/zh/sandboxing)内置于 Claude Code 中，仅限制 Bash 命令。内置文件工具、MCP 服务器和钩子仍然直接在您的宿主上运行。表中的其他方案都将整个 Claude Code 进程放在隔离边界内，因此文件工具、MCP 服务器和钩子也会受到限制。

**警告**：沙箱隔离可以减少漏洞的影响，但不能消除风险。任何允许网络出口的方案仍可能泄露代理可以读取的数据，任何挂载项目目录为可写的方案仍可能修改该代码。在依赖沙箱作为硬控制之前，请查看[安全限制](/zh/sandboxing#security-limitations)。

隔离也不会改变发送给模型的内容。您的提示词和 Claude 读取的文件无论是否有沙箱都会传输到 Anthropic API 或您配置的提供商。有关 Claude Code 发送的内容以及如何减少它，请参阅[数据使用](/zh/data-usage)。

## 选择方案

将您的目标与下表中的行匹配，然后阅读后面的详细部分。

| 您想要 | 从这里开始 |
| :--- | :--- |
| 在日常工作中减少自己机器上的权限提示 | [沙箱 Bash 工具](/zh/sandboxing)，使用 `/sandbox` 启用 |
| 让 Claude 使用 `--dangerously-skip-permissions` 或自动模式无人值守工作 | 预配置的[开发容器](/zh/devcontainer)、任何容器或虚拟机，或[沙箱运行时](#沙箱运行时) |
| 隔离 MCP 服务器和钩子以及 Bash，无需 Docker | 沙箱运行时 |
| 处理不受信任的仓库 | 专用虚拟机，或如果您有 Claude 订阅和已连接的 GitHub 账户，则使用[网页版 Claude Code](/zh/claude-code-on-the-web) |
| 在团队中标准化沙箱环境 | 预配置的[开发容器](/zh/devcontainer)，复制到您的仓库中 |
| 从无需本地设置的设备使用 Claude Code | [网页版 Claude Code](/zh/claude-code-on-the-web)，需要 Claude 订阅和已连接的 GitHub 账户 |
| 要求组织内每个开发者都进行隔离 | [在组织内强制执行隔离](#在组织内强制执行隔离) |
| 在原生 Windows 宿主上工作 | 容器或虚拟机，或在 WSL2 中运行 Bash 沙箱 |

### 隔离与权限模式的关系

[权限模式](/zh/permission-modes)决定工具调用是否运行以及是否首先提示您。隔离限制命令运行后可以访问的内容。两者协同工作：当权限模式允许操作在不询问您的情况下运行时，隔离边界限制这些操作可以访问的范围。

`--dangerously-skip-permissions` 完全移除了逐操作审查，因此隔离边界是限制 Claude 行为的唯一手段。请始终在容器、虚拟机或[沙箱运行时](#沙箱运行时)中运行它，以便文件工具、MCP 服务器和钩子也在边界内。

[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)用分类器替代提示，分类器会审查操作并阻止超出请求范围、目标为未识别基础设施或似乎由 Claude 读取的敌意内容驱动的操作。分类器是逐操作控制，不是隔离边界，因此隔离边界仍然为无人值守运行增加纵深防御，但不像 `--dangerously-skip-permissions` 那样是必需的。

[沙箱 Bash 工具](#沙箱-bash-工具)本身只约束 Bash，因此对于两种模式的完全无人值守运行都不够。您可以叠加方案：在容器或虚拟机中运行沙箱 Bash 工具可以在外部环境边界之上提供操作系统级的命令限制。有关 Bash 沙箱本身如何与权限规则和模式交互，请参阅[沙箱与权限和权限模式的关系](/zh/sandboxing#how-sandboxing-relates-to-permissions-and-permission-modes)。

## 沙箱 Bash 工具

**注意**：此选项不支持原生 Windows。在 Windows 宿主上，请使用 WSL2 或下面的容器或虚拟机方案。

沙箱 Bash 工具内置于 Claude Code 中。它使用操作系统原语来限制 Claude 运行的每个 Bash 命令的文件系统和网络访问：macOS 上使用内置沙箱 Seatbelt，Linux 和 WSL2 上使用 [bubblewrap](https://github.com/containers/bubblewrap)。默认情况下，它允许写入工作目录，并在命令首次需要新的网络域时提示。

使用 `/sandbox` 命令启用它。[沙箱](/zh/sandboxing)指南介绍了审批模式、默认边界以及如何扩大或缩小它。

按命令沙箱不涵盖会话中运行的所有内容：

* 其他[内置工具](/zh/tools-reference)（如 Read、Edit 和 WebFetch）在 Claude Code 进程内运行，不会生成任意代码。[权限规则](/zh/permissions)通过路径或域来控制它们。
* [MCP](/zh/mcp) 服务器和钩子是独立进程，在宿主上不受约束地运行。

要将内置工具、MCP 服务器和钩子都放在一个操作系统边界后面，请在[沙箱运行时](#沙箱运行时)、[开发容器](#开发容器)或[自定义容器](#自定义容器)中运行整个 Claude Code 进程。

## 沙箱运行时

[`@anthropic-ai/sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime) 包使用与内置 Bash 沙箱相同的 Seatbelt 或 bubblewrap 隔离来包装整个进程。通过它运行 Claude Code 会限制会话中的每个工具、钩子和 MCP 服务器，而不仅仅是 Bash。该运行时是测试版研究预览，其配置格式可能会随着包的发展而变化。

该运行时默认拒绝所有写入和网络访问，因此在通过它启动 Claude Code 之前需要进行配置。在 `~/.srt-settings.json` 或您通过 `--settings` 传递的文件中，至少允许对项目目录以及 Claude Code 的配置路径 `~/.claude` 和 `~/.claude.json` 的写入访问。允许会话所需的网络域，包括 `api.anthropic.com` 或您配置的提供商端点。有关完整的配置架构，请参阅包的 [README](https://github.com/anthropic-experimental/sandbox-runtime)。

配置文件就绪后，使用 `npx` 启动 Claude Code 并将 `claude` 作为要包装的命令传递：

```bash
npx @anthropic-ai/sandbox-runtime claude
```

Claude Code 将在您配置的文件系统和网络边界内的沙箱中启动。相同的命令也适用于沙箱化独立的 MCP 服务器或其他辅助进程。

## 开发容器

开发容器在 VS Code 或兼容编辑器管理的 Docker 容器中运行 Claude Code，并挂载您的项目。您可以在仓库中使用 `.devcontainer/` 目录定义自己的容器。

claude-code 仓库发布了一个[示例开发容器](/zh/devcontainer)，其中包含默认拒绝的 iptables 防火墙作为起点。将其复制到您的仓库中，并调整防火墙允许列表、基础镜像和固定的 Claude Code 版本以适应您的环境。由于防火墙阻止未批准的出口，此类配置支持使用 `--dangerously-skip-permissions` 进行无人值守工作。

## 自定义容器

您可以在任何 Docker 或 OCI 容器镜像中运行 Claude Code，并使用自己的网络策略、挂载卷和 seccomp 配置文件。这是拥有现有容器基础设施或 CI 运行器的组织最常见的路径。

多个托管沙箱和远程执行服务可以为您托管容器。与您操作的任何容器相同的检查清单适用：审查哪些内容以可写方式挂载、哪些凭据和令牌在其中可达，以及网络出口策略允许的内容。

您可以在容器内叠加内置 Bash 沙箱以进行按命令限制。非特权容器需要[沙箱故障排除](/zh/sandboxing#troubleshooting)中描述的嵌套沙箱设置。

## 虚拟机

专用虚拟机提供最强的隔离，拥有自己的内核，并且在云或微虚拟机部署中拥有自己的虚拟化硬件。选项包括云实例、本地虚拟机管理程序和微虚拟机（如 Firecracker）。

当您评估不受信任的代码时、当您的安全策略要求代理与宿主之间进行内核级隔离时，或当宿主级方案无法满足您的合规要求时，请使用此方案。Docker Desktop 的[沙箱功能](https://docs.docker.com/ai/sandboxes/)提供了一个拥有自己的 Docker 守护进程和工作区同步的微虚拟机，可以在已有 Docker Desktop 的宿主上运行 Claude Code。

## 网页版 Claude Code

[网页版 Claude Code](/zh/claude-code-on-the-web) 在 Anthropic 管理的隔离虚拟机中运行每个会话。网络代理强制执行默认允许列表，单独的代理在沙箱外部持有您的 GitHub 令牌，同时在沙箱内发放范围受限的仓库访问凭据。

当您想要完整的虚拟机隔离而无需自行配置基础设施时，或当您从没有本地开发环境的设备委派任务时，请使用此方案。它需要 Claude 订阅和已连接的 GitHub 账户，会话从 GitHub 克隆您的仓库。有关计划可用性和 GitHub 身份验证选项，请参阅[网页版 Claude Code](/zh/claude-code-on-the-web)。

## 在组织内强制执行隔离

个别开发者可以选择上述任何方案。组织可以强制执行的内容以及使用的工具取决于方案：

* **内置 Bash 沙箱**：Claude Code 自身强制执行的唯一方案。通过[托管设置](/zh/settings#settings-files)提供 `sandbox` 设置键，可以是由您的 MDM 管理的文件，也可以通过 Claude.ai 上的[服务器托管设置](/zh/server-managed-settings)。有关要部署的键以及如何防止开发者扩大策略，请参阅[使用托管设置强制执行沙箱](/zh/sandboxing#enforce-sandboxing-with-managed-settings)。
* **开发容器**：将[示例开发容器](/zh/devcontainer)提交到您的仓库以在团队中标准化环境。这是约定而非强制执行边界，因为 Claude Code 不要求容器。如果开发者不应在其外部运行 Claude Code，请使用组织的设备管理或软件允许列表工具来强制执行。
* **自定义容器和虚拟机**：通过批准的镜像分发 Claude Code，并使用组织的设备管理或软件允许列表工具防止在其外部安装。

## 另请参阅

这些页面涵盖上述方案的配置和策略详情。

* [沙箱](/zh/sandboxing)：配置内置沙箱 Bash 工具
* [开发容器](/zh/devcontainer)：预配置的 Docker 开发容器
* [安全](/zh/security)：完整的 Claude Code 安全模型
* [安全部署](/zh/agent-sdk/secure-deployment)：Agent SDK 应用的隔离指南
* [设置](/zh/settings#sandbox-settings)：所有沙箱配置键，包括托管设置交付
