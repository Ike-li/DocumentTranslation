> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 开发容器

> 在开发容器中运行 Claude Code，为团队提供一致、隔离的环境。

[开发容器](https://containers.dev/)（dev container）让你定义一个完全相同的隔离环境，团队中的每位工程师都可以运行。在该容器中安装 Claude Code 后，Claude 执行的命令在容器内运行而非宿主机上，同时对项目文件的编辑会实时反映到本地仓库中。

本页面涵盖[在开发容器中安装 Claude Code](#将-claude-code-添加到开发容器) 及后续的配置主题。每个主题都是独立的，可根据需要跳转到相应部分：

* [跨重建持久化认证和设置](#将-claude-code-添加到开发容器)
* [强制执行组织策略](#跨重建持久化认证和设置)
* [限制网络出口流量]
* [无权限提示运行](#限制网络出口流量)

虽然开发容器提供了实质性保护，但没有任何系统能完全抵御所有攻击。使用 `--dangerously-skip-permissions` 执行时，开发容器无法阻止恶意项目泄露容器内可访问的任何内容，包括存储在 [`~/.claude`](/zh/claude-directory) 中的 Claude Code 凭据。仅在使用受信任的仓库进行开发时使用开发容器，并监控 Claude 的活动。避免将宿主机密钥（如 `~/.ssh` 或云凭据文件）挂载到容器中；优先使用仓库范围或短期有效的令牌。

#### 开发容器如何与编辑器协作

<img src="https://mintcdn.com/claude-code/YvJyjZfd9yMihr0i/images/devcontainer-architecture.svg?fit=max&auto=format&n=YvJyjZfd9yMihr0i&q=85&s=9017b1d16a446c6cc37ba562f35b9aae" className="dark:hidden" alt="Diagram showing an editor on the host connecting to a Docker dev container. Claude Code, the terminal, and build tools run inside the container. The host repository is bind-mounted into the container as the workspace." width="640" height="300" data-path="images/devcontainer-architecture.svg" />

<img src="https://mintcdn.com/claude-code/YvJyjZfd9yMihr0i/images/devcontainer-architecture-dark.svg?fit=max&auto=format&n=YvJyjZfd9yMihr0i&q=85&s=ef00c8e25b1ea7a3a152895f1488831b" className="hidden dark:block" alt="Diagram showing an editor on the host connecting to a Docker dev container. Claude Code, the terminal, and build tools run inside the container. The host repository is bind-mounted into the container as the workspace." width="640" height="300" data-path="images/devcontainer-architecture-dark.svg" />

开发容器以 Docker 容器的形式运行，可以运行在本地机器或云主机（如 GitHub Codespaces）上。支持 Dev Containers 规范的编辑器（如 VS Code、GitHub Codespaces、JetBrains IDE 或 Cursor）连接到该容器：你可以在编辑器中照常浏览和编辑文件，但集成终端、语言服务器和构建工具都在容器内而非宿主机上运行。不支持开发容器的编辑器（如纯 Vim）不在此工作流中。

Claude Code 在容器内运行，因此它看到的文件、依赖和工具与项目工具链中的其他部分完全一致。在 VS Code 中，你可以使用 [Claude Code 扩展面板](/zh/vs-code) 或在集成终端中运行 `claude`；两者都在容器内运行并共享相同的 `~/.claude` 配置。

## 将 Claude Code 添加到开发容器

Claude Code 通过 [Claude Code Dev Container Feature](https://github.com/anthropics/devcontainer-features/tree/main/src/claude-code) 安装到任何开发容器中。

这些设置适用于任何支持 Dev Containers 规范的工具，如 VS Code、GitHub Codespaces 或 JetBrains IDE。以下步骤以 VS Code 为例。

在 VS Code 或 Codespaces 中打开容器时，该功能还会添加 Claude Code VS Code 扩展；其他编辑器会忽略该部分。

刚接触开发容器？[VS Code Dev Containers 教程](https://code.visualstudio.com/docs/devcontainers/tutorial) 指导你安装 Docker、扩展并打开第一个容器。要了解包含防火墙和持久卷的更完整加固示例，请参阅[试用参考容器](#无权限提示运行)。

1. **创建或更新 devcontainer.json**

   将以下内容保存为仓库中的 `.devcontainer/devcontainer.json`，或将 `features` 块添加到现有文件中。

   末尾的版本标签（如 `:1.0`）固定的是功能的安装脚本，而非 Claude Code 版本。该功能安装最新的 Claude Code，且 Claude Code 默认在容器内自动更新。

   要固定 CLI 版本或禁用自动更新，请参阅[强制执行组织策略](#跨重建持久化认证和设置)。

   ```json .devcontainer/devcontainer.json
   {
     "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
     "features": {
       "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}
     }
   }
   ```

   将 `image` 行替换为项目的基础镜像，或者如果现有文件使用 Dockerfile 则删除该行。

2. **重建容器**

   在 Mac 上按 `Cmd+Shift+P`，在 Windows 和 Linux 上按 `Ctrl+Shift+P` 打开 VS Code 命令面板，运行 **Dev Containers: Rebuild Container**。

   对于其他工具，请执行该工具的重建操作：参阅 [GitHub Codespaces 中的重建](https://docs.github.com/en/codespaces/developing-in-a-codespace/rebuilding-the-container-in-a-codespace)、[Dev Containers CLI](https://github.com/devcontainers/cli) 或 IDE 的开发容器文档。

3. **登录 Claude Code**

   在重建后的容器中打开终端，运行 `claude`，然后按照认证提示操作。

认证提示的显示内容取决于你的提供商：

* **Anthropic**：通过浏览器使用 Claude 或 Anthropic Console 账户登录
* **[Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry](/zh/third-party-integrations)**：Claude Code 使用云提供商凭据，无浏览器提示

对于云提供商，通过 `containerEnv`、Codespaces 机密或云工作负载身份将凭据作为环境变量传入容器，而非从宿主机挂载凭据文件。参阅 [Amazon Bedrock](/zh/amazon-bedrock)、[Google Vertex AI](/zh/google-vertex-ai) 或 [Microsoft Foundry](/zh/microsoft-foundry) 了解 Claude Code 读取的凭据链。

参阅[选择 API 提供商](/zh/admin-setup#choose-your-api-provider) 决定适合组织的路径。

如果浏览器登录完成但回调未到达容器，请复制浏览器中显示的代码，粘贴到终端的 `Paste code here if prompted` 提示处。这种情况可能在编辑器的端口转发未路由本地回调时发生。

## 跨重建持久化认证和设置

默认情况下，容器的主目录在重建时会被丢弃，因此工程师每次都需要重新登录。Claude Code 在 [`~/.claude`](/zh/claude-directory) 下存储认证令牌、用户设置和会话历史。在该路径挂载命名卷可以在重建时保留这些状态。

以下示例在 `node` 用户的主目录挂载卷：

```json devcontainer.json
"mounts": [
  "source=claude-code-config,target=/home/node/.claude,type=volume"
]
```

将 `/home/node` 替换为容器的 `remoteUser` 的主目录。如果将卷挂载到 `~/.claude` 以外的位置，请设置 [`CLAUDE_CONFIG_DIR`](/zh/env-vars) 为挂载路径，以便 Claude Code 在该位置读写。

要按项目隔离状态而非在所有仓库间共享一个卷，请在源名称中包含 `${devcontainerId}` 变量。[参考配置](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json) 使用 `source=claude-code-config-${devcontainerId}` 实现此目的。

在 GitHub Codespaces 中，`~/.claude` 在停止和启动 codespace 之间会持久化，但在重建容器时仍会被清除，因此上述卷挂载同样适用。要在 codespace 之间携带认证，请将 `ANTHROPIC_API_KEY` 或来自 [`claude setup-token`](/zh/authentication#generate-a-long-lived-token) 的 `CLAUDE_CODE_OAUTH_TOKEN` 存储为 [Codespaces 机密](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-your-account-specific-secrets-for-github-codespaces)；Codespaces 会自动将机密作为环境变量在容器内可用。

## 强制执行组织策略

开发容器是应用组织策略的便捷方式，因为相同的镜像和配置在每位工程师的机器上运行。

Claude Code 读取 Linux 上的 `/etc/claude-code/managed-settings.json`，并在[设置层级](/zh/settings#how-scopes-interact) 中以最高优先级应用，因此其中的值会覆盖工程师在 `~/.claude` 或项目的 `.claude/` 目录中设置的任何内容。从 Dockerfile 中将该文件复制到位：

```dockerfile Dockerfile
RUN mkdir -p /etc/claude-code
COPY managed-settings.json /etc/claude-code/managed-settings.json
```

由于 Dockerfile 位于仓库中，任何有写入权限的人都可以更改或删除此步骤。对于工程师无法通过编辑仓库文件绕过的策略，请通过[服务器托管设置](/zh/server-managed-settings) 或 MDM 交付托管设置。参阅[托管设置文件](/zh/settings#settings-files) 了解可用键及其他交付路径。

要设置适用于容器中每个 Claude Code 会话的[环境变量](/zh/env-vars)，请将它们添加到 `devcontainer.json` 中的 `containerEnv`。以下示例退出遥测和错误报告，并阻止 Claude Code 在安装后自动更新：

```json devcontainer.json
"containerEnv": {
  "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
  "DISABLE_AUTOUPDATER": "1"
}
```

Dev Container Feature 始终安装最新的 Claude Code 版本。要为可重复构建固定特定的 Claude Code 版本，请从 Dockerfile 中使用 `npm install -g @anthropic-ai/claude-code@X.Y.Z` 安装，而不是使用该功能，并按上述方式设置 `DISABLE_AUTOUPDATER`。

有关策略控制的完整列表（包括权限规则、工具限制和 MCP 服务器允许列表），请参阅[为组织设置 Claude Code](/zh/admin-setup)。

要在容器内使用 [MCP 服务器](/zh/mcp)，请在仓库根目录的 `.mcp.json` 文件中以[项目范围](/zh/mcp#mcp-installation-scopes) 定义它们，以便它们与开发容器配置一起提交。在 Dockerfile 中安装本地 stdio 服务器所依赖的二进制文件，并将远程服务器域名添加到网络允许列表。

## 限制网络出口流量

你可以将容器的出站流量限制为仅 Claude Code 所需的域名。参阅[网络访问要求](/zh/network-config#network-access-requirements) 了解推理和认证域名，参阅[遥测服务](/zh/data-usage#telemetry-services) 了解可选的遥测和错误报告连接以及如何禁用它们。

参考容器包含一个 [`init-firewall.sh`](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh) 脚本，阻止除 Claude Code 和开发工具所需域名外的所有出站流量。在容器内运行防火墙需要额外权限，因此参考通过 `runArgs` 添加 `NET_ADMIN` 和 `NET_RAW` 能力。防火墙脚本和这些能力并非 Claude Code 本身必需：你可以省略它们，转而使用自己的网络控制。

## 无权限提示运行

由于容器以非 root 用户运行 Claude Code，并将命令执行限制在容器内，因此可以传入 `--dangerously-skip-permissions` 以实现无人值守操作。CLI 在以 root 身份启动时会拒绝此标志，因此请确认 `remoteUser` 设置为非 root 账户。

跳过权限提示会移除你在工具调用运行前审查的机会。Claude 仍然可以修改绑定挂载工作区中的任何文件（这些文件直接出现在宿主机上），并访问容器网络策略允许的任何内容。将此标志与上述[网络出口限制] 配合使用，以限制被绕过的会话可以访问的范围。

如果你希望减少提示而不禁用安全检查，请考虑使用[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)，它会在操作运行前由分类器进行审查。要完全阻止工程师使用 `--dangerously-skip-permissions`，请在[托管设置](/zh/settings#permission-settings) 中将 `permissions.disableBypassPermissionsMode` 设置为 `"disable"`。

## 试用参考容器

[`anthropics/claude-code`](https://github.com/anthropics/claude-code/tree/main/.devcontainer) 仓库包含一个示例开发容器，结合了 CLI、出口防火墙、持久卷和基于 Zsh 的 shell。它作为工作示例提供，而非维护的基础镜像；在应用到自己的配置之前，可以用它来了解各部分如何组合在一起。

1. **安装前置条件**

   安装 VS Code 和 [Dev Containers 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)。

2. **克隆参考仓库**

   克隆 [Claude Code 仓库](https://github.com/anthropics/claude-code) 并在 VS Code 中打开。

3. **在容器中重新打开**

   出现提示时点击 **Reopen in Container**，或从命令面板运行 **Dev Containers: Reopen in Container**。

4. **启动 Claude Code**

   容器构建完成后，按 `` Ctrl+` `` 打开终端，运行 `claude` 登录并开始第一个会话。

要将此配置用于自己的项目，请将 `.devcontainer/` 目录复制到仓库中并调整 Dockerfile 以适配你的工具链，或者返回[将 Claude Code 添加到开发容器](#将-claude-code-添加到开发容器) 仅将功能添加到已有配置中。

参考配置由三个文件组成。当你通过功能将 Claude Code 添加到自己的开发容器时，这些文件都不是必需的，但它们展示了一种组合各部分的方式。

| 文件                                                                                                       | 用途                                                                       |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`devcontainer.json`](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json) | 卷挂载、`runArgs` 能力、VS Code 扩展和 `containerEnv` |
| [`Dockerfile`](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile)               | 基础镜像、开发工具和 Claude Code 安装                    |
| [`init-firewall.sh`](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh)   | 阻止除允许域名外的所有出站网络流量                |

## 后续步骤

Claude Code 在开发容器中运行后，以下页面涵盖组织部署的其余部分：选择认证路径、在仓库外交付托管策略、监控使用情况以及了解 Claude Code 的存储和发送内容。

* [为组织设置 Claude Code](/zh/admin-setup)：选择认证提供商、决定策略如何到达设备并规划部署
* [服务器托管设置](/zh/server-managed-settings)：从 Claude.ai 管理控制台交付托管策略，工程师无法通过编辑仓库文件绕过
* [监控使用和审计活动](/zh/monitoring-usage)：导出 OpenTelemetry 指标并查看团队运行的内容
* [网络访问要求](/zh/network-config#network-access-requirements)：代理和防火墙的完整域名允许列表
* [遥测服务和退出选项](/zh/data-usage#telemetry-services)：Claude Code 默认发送的内容以及禁用它的环境变量
* [探索 `.claude` 目录](/zh/claude-directory)：卷挂载包含的内容，包括凭据、设置和会话历史
* [沙箱环境](/zh/sandbox-environments)：将开发容器与内置 Bash 沙箱、自定义容器和虚拟机进行比较
* [安全模型](/zh/security)：Claude Code 的权限系统、沙箱和提示词注入防护如何协同工作
* [权限模式](/zh/permission-modes)：从计划模式到自动模式再到绕过的完整范围，以及何时使用每种模式
