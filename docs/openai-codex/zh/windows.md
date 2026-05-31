# Windows

在 Windows 上使用 Codex，可通过原生 [Codex 应用](https://developers.openai.com/codex/app/windows)、[CLI](https://developers.openai.com/codex/cli) 或 [IDE 扩展](https://developers.openai.com/codex/ide)。

Windows 上的 Codex 应用支持核心工作流，包括并行代理线程、工作树、自动化、Git 功能、应用内浏览器、制品预览、插件和技能。

<div class="mb-8">
  <CodexCallout
    href="/codex/app/windows"
    title="在 Windows 上使用 Codex 应用"
    description="通过原生 Windows 应用跨项目工作、运行并行代理线程并在一处查看结果。"
    iconSrc="/images/codex/codex-banner-icon.webp"
  />
</div>

根据平台和配置的不同，Codex 可以通过三种方式在 Windows 上运行：

- 在 Windows 上原生运行，使用更强的 `elevated` 沙箱；
- 在 Windows 上原生运行，使用回退的 `unelevated` 沙箱；
- 或在 [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install)（WSL2）中运行，使用 Linux 沙箱实现。

## Windows 沙箱

在 Windows 上原生运行 Codex 时，代理模式使用 Windows 沙箱来阻止工作目录之外的文件系统写入，并在未经你明确批准的情况下阻止网络访问。

原生 Windows 沙箱支持两种模式，可在 `config.toml` 中配置：

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` 是首选的原生 Windows 沙箱。它使用专用的低权限沙箱用户、文件系统权限边界、防火墙规则，以及在沙箱中运行命令所需的本地策略更改。

`unelevated` 是回退的原生 Windows 沙箱。它使用从当前用户派生的受限 Windows 令牌运行命令，应用基于 ACL 的文件系统边界，并使用环境级离线控制代替专用的离线用户防火墙规则。它比 `elevated` 弱，但在管理员批准的设置被本地或企业策略阻止时仍然有用。

如果两种模式都可用，请使用 `elevated`。如果默认的原生沙箱在你的环境中无法工作，请在排查设置问题期间使用 `unelevated` 作为回退。

默认情况下，两种沙箱模式还使用私有桌面来实现更强的 UI 隔离。仅在需要旧版 `Winsta0\\Default` 行为以兼容时，才设置 `windows.sandbox_private_desktop = false`。

### 沙箱权限

以完全访问模式运行 Codex 意味着 Codex 不限于项目目录，可能会执行意外的破坏性操作，导致数据丢失。为了更安全的自动化，请保持沙箱边界，并使用[规则](https://developers.openai.com/codex/rules)处理特定例外情况，或将[审批策略设置为永不](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 根据你的[审批和安全设置](https://developers.openai.com/codex/agent-approvals-security)尝试自行解决问题，而无需请求提升权限。

### Windows 版本矩阵

| Windows 版本                      | 支持级别   | 说明                                                                                                                                                                                   |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                        | 推荐       | Codex 在 Windows 上的最佳基线。如果你正在进行企业部署标准化，请使用此版本。                                                                                                             |
| 最近的、完全更新的 Windows 10     | 尽力支持   | 可以工作，但不如 Windows 11 可靠。对于 Windows 10，Codex 依赖现代控制台支持，包括 ConPTY。实际上需要 Windows 10 版本 1809 或更高版本。                                                  |
| 较旧的 Windows 10 版本            | 不推荐     | 更可能缺少所需的控制台组件（如 ConPTY），在企业部署中更容易失败。                                                                                                                       |

其他环境假设：

- `winget` 应该可用。如果缺失，请在设置 Codex 之前更新 Windows 或安装 Windows Package Manager。
- 推荐的原生沙箱依赖于管理员批准的设置。
- 某些企业托管设备即使操作系统版本本身可接受，也会阻止所需的设置步骤。

### 授予沙箱读取权限

当命令因 Windows 沙箱无法读取目录而失败时，请使用：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

路径必须是已存在的绝对目录。命令成功后，在当前会话中后续在沙箱中运行的命令将可以读取该目录。

默认使用原生 Windows 沙箱。原生 Windows 沙箱在保持相同安全性的同时提供最佳性能和最高速度。当你需要 Windows 上的 Linux 原生环境、工作流已在 WSL2 中、或两种原生 Windows 沙箱模式都无法满足需求时，请选择 WSL2。

## Windows Subsystem for Linux

如果你选择 WSL2，Codex 将在 Linux 环境中运行，而不是使用原生 Windows 沙箱。当你需要在 Windows 上使用 Linux 原生工具、代码仓库和开发工作流已在 WSL2 中、或两种原生 Windows 沙箱模式都不适合你的环境时，这很有用。

WSL1 在 Codex `0.114` 中受支持。从 Codex `0.115` 开始，Linux 沙箱迁移到了 `bubblewrap`，因此不再支持 WSL1。

### 从 WSL 内部启动 VS Code

分步说明请参阅[官方 VS Code WSL 教程](https://code.visualstudio.com/docs/remote/wsl-tutorial)。

#### 前提条件

- 已安装 WSL 的 Windows。要安装 WSL，请以管理员身份打开 PowerShell，然后运行 `wsl --install`（Ubuntu 是常见选择）。
- 已安装 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 的 VS Code。

#### 从 WSL 终端打开 VS Code

```bash
# 在 WSL shell 中
cd ~/code/your-project
code .
```

这将打开 WSL 远程窗口，根据需要安装 VS Code Server，并确保集成终端在 Linux 中运行。

#### 确认你已连接到 WSL

- 查看显示 `WSL: <distro>` 的绿色状态栏。
- 集成终端应显示 Linux 路径（如 `/home/...`）而不是 `C:\`。
- 你可以通过以下方式验证：

  ```bash
  echo $WSL_DISTRO_NAME
  ```

  这将打印你的发行版名称。

如果状态栏中没有显示 "WSL: ..."，请按 `Ctrl+Shift+P`，选择 `WSL: Reopen Folder in WSL`，并将代码仓库放在 `/home/...` 下（而不是 `C:\`）以获得最佳性能。

如果 Windows 应用或项目选择器未显示你的 WSL 代码仓库，请在文件选择器或资源管理器中输入 <code>\\wsl$</code>，然后导航到你的发行版主目录。

### 在 WSL 中使用 Codex CLI

在提升权限的 PowerShell 或 Windows Terminal 中运行以下命令：

```powershell
# 安装默认 Linux 发行版（如 Ubuntu）
wsl --install

# 启动 Windows Subsystem for Linux 中的 shell
wsl
```

然后在 WSL shell 中运行以下命令：

```bash
# 在 WSL 中安装并运行 Codex
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex
```

### 在 WSL 中编写代码

- 在 Windows 挂载路径（如 <code>/mnt/c/...</code>）中工作可能比在 Windows 原生路径中慢。将代码仓库放在 Linux 主目录下（如 <code>~/code/my-app</code>）以获得更快的 I/O 和更少的符号链接及权限问题：
  ```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
  ```
- 如果需要从 Windows 访问文件，它们位于资源管理器中的 <code>\\wsl$\Ubuntu\home\&lt;user&gt;</code> 下。

## 故障排除与常见问题

如果你正在排查托管 Windows 机器的问题，请从原生沙箱模式、Windows 版本以及 Codex 显示的任何策略错误开始。大多数原生 Windows 支持问题来自沙箱设置、登录权限或文件系统权限，而非编辑器本身。

我的原生沙箱设置失败了

如果 Codex 无法完成 `elevated` 沙箱设置，最常见的原因是：

- Windows UAC 或管理员提示被拒绝；
- 机器不允许创建本地用户或组；
- 机器不允许更改防火墙规则；
- 机器阻止了沙箱用户所需的登录权限；
- 或其他企业策略阻止了部分设置流程。

尝试方法：

1. 再次尝试 `elevated` 沙箱设置，如果你的环境允许，请批准管理员提示。
2. 如果公司笔记本电脑阻止此操作，请咨询 IT 团队，确认机器是否允许管理员批准的本地用户/组创建、防火墙配置和所需的沙箱用户登录权限设置。
3. 如果默认设置仍然失败，请使用 `unelevated` 沙箱，以便在调查问题期间继续工作。

Codex 将我切换到了 unelevated 沙箱

这意味着 Codex 无法在你的机器上完成更强的 `elevated` 沙箱设置。

- Codex 仍然可以在沙箱模式下运行。
- 它仍然应用基于 ACL 的文件系统边界，但不使用 `elevated` 的独立沙箱用户边界，网络隔离也更弱。
- 这是一个有用的回退方案，但不是首选的长期企业配置。

如果你使用的是托管企业笔记本电脑，最佳的长期解决方案通常是借助 IT 团队使 `elevated` 沙箱正常工作。

我看到 Windows 错误 1385

如果沙箱命令失败并显示错误 `1385`，表示 Windows 拒绝了沙箱用户启动命令所需的登录类型。

实际上，这通常意味着 Codex 已成功创建了沙箱用户，但 Windows 策略仍然阻止这些用户启动沙箱命令。

处理方法：

1. 咨询 IT 团队，确认设备策略是否向 Codex 创建的沙箱用户授予了所需的登录权限。
2. 如果问题仅影响某些机器或团队，请比较组策略或 OU 差异。
3. 如果需要立即继续工作，请在调查策略问题期间使用 `unelevated` 沙箱。
4. 发送 `CODEX_HOME/.sandbox/sandbox.log` 以及你的 Windows 版本和故障简要描述。

Codex 警告某些文件夹可被 Everyone 写入

Codex 可能会警告某些文件夹可被 `Everyone` 写入。

如果看到此警告，这些文件夹上的 Windows 权限过于宽泛，沙箱无法完全保护它们。

处理方法：

1. 查看 Codex 在警告中列出的文件夹。
2. 如果在你的环境中合适，请从这些文件夹中移除 `Everyone` 写入权限。
3. 更正权限后重启 Codex 或重新运行沙箱设置。

如果你不确定如何更改这些权限，请咨询 IT 团队寻求帮助。

沙箱命令无法访问网络

根据使用的权限模式，某些 Codex 任务会故意在没有出站网络访问的情况下运行。

如果任务因无法访问网络而失败：

1. 检查该任务是否应在禁用网络的情况下运行。
2. 如果你期望有网络访问，请重启 Codex 并重试。
3. 如果问题持续发生，请收集沙箱日志，以便团队检查机器是否处于部分或损坏的沙箱状态。

沙箱之前正常工作，后来停止了

这可能在以下情况后发生：

- 移动了代码仓库或工作区；
- 更改了机器权限；
- 更改了 Windows 策略；
- 或其他系统配置更改。

尝试方法：

1. 重启 Codex。
2. 再次尝试 `elevated` 沙箱设置。
3. 如果仍无法修复，请使用 `unelevated` 沙箱作为临时回退。
4. 收集沙箱日志以供审查。

我需要向 OpenAI 发送诊断信息

如果仍有问题，请发送：

- `CODEX_HOME/.sandbox/sandbox.log`

附带以下信息也会有所帮助：

- 你正在尝试做什么的简要描述；
- `elevated` 沙箱是否失败或使用了 `unelevated` 沙箱；
- 应用中显示的任何错误消息；
- 你是否看到了 `1385` 或其他 Windows 或 PowerShell 错误；
- 以及你使用的是 Windows 11 还是 Windows 10。

不要发送：

- `CODEX_HOME/.sandbox-secrets/` 的内容

IDE 扩展已安装但无响应

你的系统可能缺少 C++ 开发工具，某些原生依赖项需要这些工具：

- Visual Studio Build Tools（C++ 工作负载）
- Microsoft Visual C++ Redistributable（x64）
- 使用 `winget`，运行 `winget install --id Microsoft.VisualStudio.2022.BuildTools -e`

安装后请完全重启 VS Code。

WSL 中的大型代码仓库感觉很慢

- 确保你不在 <code>/mnt/c</code> 下工作。将代码仓库移到 WSL 中（例如 <code>~/code/...</code>）。
- 如有必要，增加 WSL 的内存和 CPU；将 WSL 更新到最新版本：
  ```powershell
  wsl --update
  wsl --shutdown
  ```

WSL 中的 VS Code 找不到 codex

验证二进制文件是否存在并在 WSL 的 PATH 中：

```bash
which codex || echo "codex not found"
```

如果找不到二进制文件，请按照上面的[说明](#在-wsl-中使用-codex-cli)进行安装。
