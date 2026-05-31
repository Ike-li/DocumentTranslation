> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# 高级设置

> Claude Code 的系统要求、平台特定安装、版本管理和卸载说明。

本页涵盖系统要求、平台特定安装细节、更新和卸载。若需首次会话的引导式入门，请参阅 [快速入门](/zh/quickstart)。如果你从未使用过终端，请参阅 [终端指南](/zh/terminal-guide)。

## 系统要求

Claude Code 支持以下平台和配置：

* **操作系统**：
  * macOS 13.0+
  * Windows 10 1809+ 或 Windows Server 2019+
  * Ubuntu 20.04+
  * Debian 10+
  * Alpine Linux 3.19+
* **硬件**：4 GB+ 内存，x64 或 ARM64 处理器
* **网络**：需要互联网连接。请参阅 [网络配置](/zh/network-config#network-access-requirements)。
* **Shell**：Bash、Zsh、PowerShell 或 CMD。
* **地区**：[Anthropic 支持的国家/地区](https://www.anthropic.com/supported-countries)

### 额外依赖

* **ripgrep**：通常已包含在 Claude Code 中。如果搜索失败，请参阅 [搜索故障排除](/zh/troubleshooting#search-and-discovery-issues)。

## 安装 Claude Code

  喜欢图形界面？[桌面应用](/zh/desktop-quickstart)能让您无需终端即可使用 Claude Code。下载 [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code\&utm_medium=docs) 或 [Windows](https://claude.com/download?utm_source=claude_code\&utm_medium=docs) 版本。

  终端新手？请参阅[终端指南](/zh/terminal-guide)获取分步操作说明。

安装 Claude Code，请使用以下任一方法：


    **macOS、Linux、WSL：**
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```
    **Windows PowerShell：**
    ```powershell
    irm https://claude.ai/install.ps1 | iex
    ```
    **Windows CMD:**
    ```batch
    curl -L https://claude.ai/install.sh -o install-claude-code.bat && call install-claude-code.bat
    ```
    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```
    如果你看到 `The token '&&' is not a valid statement separator`，说明你正在 PowerShell 环境中，而非 CMD。如果你看到 `'irm' is not recognized as an internal or external command`，则说明你正在 CMD 环境中，而非 PowerShell。当你在 PowerShell 中时，提示符会显示 `PS C:\`，而在 CMD 中则只显示 `C:\` 且没有 `PS`。

    在原生 Windows 系统上，推荐安装 [Git for Windows](https://git-scm.com/downloads/win)，这样 Claude Code 就可以使用 Bash 工具。如果未安装 Git for Windows，Claude Code 将会使用 PowerShell 作为 Shell 工具。WSL 环境不需要安装 Git for Windows。

      原生安装会在后台自动更新，以确保您始终使用最新版本。




    ```bash
    brew install --cask claude-code
    ```
    Homebrew 提供两种安装包。`claude-code` 追踪稳定发布渠道，该渠道通常会滞后约一周，并跳过存在重大回归问题的版本。`claude-code@latest` 追踪最新发布渠道，新版本发布后立即获得。

      Homebrew 安装不会自动更新。请根据您安装的 cask 版本运行 `brew upgrade claude-code` 或 `brew upgrade claude-code@latest`，以获取最新功能和安全修复。




    ```powershell
    winget install Anthropic.ClaudeCode
    ```


      WinGet 安装不会自动更新。请定期运行 `winget upgrade Anthropic.ClaudeCode` 以获取最新功能和安全修复。



您也可以在 Debian、Fedora、RHEL 和 Alpine 上通过 [apt, dnf, 或 apk](/zh/setup#install-with-linux-package-managers) 进行安装。

安装完成后，在您想工作的项目中打开一个终端，然后启动 Claude Code：
```bash
claude
```
如果在安装过程中遇到任何问题，请参阅[故障排查安装与登录](/zh/troubleshoot-install)。

### 在 Windows 上设置

您可以在 Windows 原生环境或 WSL 内运行 Claude Code。请根据您的项目位置和所需功能来选择：

| 选项           | 要求                                                                   | [沙箱功能](/zh/sandboxing) | 适用场景                                        |
| -------------- | ---------------------------------------------------------------------- | ------------------------ | ----------------------------------------------- |
| 原生 Windows   | 无要求；[Git for Windows](https://git-scm.com/downloads/win) 可选      | 不支持                   | Windows 原生项目和工具                           |
| WSL 2          | 需启用 WSL 2                                                           | 支持                     | Linux 工具链或需要沙箱命令执行                   |
| WSL 1          | 需启用 WSL 1                                                           | 不支持                   | 当 WSL 2 不可用时                                |

**选项 1：原生 Windows**

在 PowerShell 或 CMD 中运行安装命令。您不需要以管理员身份运行。安装 [Git for Windows](https://git-scm.com/downloads/win) 是可选的。它通过提供 Git Bash 来启用 [Bash 工具](/zh/tools-reference#bash-tool-behavior)。

从 PowerShell 还是 CMD 安装仅影响您运行的安装命令。在 PowerShell 中，您的提示符显示为 `PS C:\Users\YourName>`，而在 CMD 中则显示为 `C:\Users\YourName>`，没有 `PS`。如果您是终端新手，[终端指南](/zh/terminal-guide#windows) 会逐步指导每个步骤。

安装完成后，从任意终端启动 `claude`。

* **未安装 Git for Windows** 时，Claude Code 通过 [PowerShell 工具](/zh/tools-reference#powershell-tool) 运行 shell 命令。
* **安装了 Git for Windows** 后，Claude Code 会使用 Git Bash 来运行 [Bash 工具](/zh/tools-reference#bash-tool-behavior)。如果 Claude Code 找不到 Git Bash，请在您的 [settings.json 文件](/zh/settings) 中设置路径。
  ```json
  {
    "env": {
      "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
    }
  }
  ```
当安装 Git for Windows 后，PowerShell 工具正作为与 Bash 并列的额外选项逐步推出。设置 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` 以选择加入，或设置为 `0` 以选择退出。有关设置和限制，请参阅 [PowerShell 工具](/zh/tools-reference#powershell-tool)。

**选项 2：WSL**

打开您的 WSL 发行版，并按照上方的[安装说明](#安装-claude-code)运行 Linux 安装程序。您是在 WSL 终端内安装和启动 `claude`，而不是在 PowerShell 或 CMD 中。

### Alpine Linux 和基于 musl 的发行版

在 Alpine 及其他基于 musl/uClibc 的发行版上，原生安装程序需要 `libgcc`、`libstdc++` 和 `ripgrep`。请使用您发行版的包管理器安装这些依赖项，然后设置 `USE_BUILTIN_RIPGREP=0`。

此示例在 Alpine 上安装所需的包：
```bash
apk add libgcc libstdc++ ripgrep
```
请在你的 [`settings.json`](/zh/settings#available-settings) 文件中将 `USE_BUILTIN_RIPGREP` 设置为 `0`：
```json
{
  "env": {
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```
## 验证安装

安装完成后，确认 Claude Code 是否正常工作：
```bash
claude --version
```
如果执行失败并显示 `command not found` 或其他错误，请参阅[故障排除安装和登录](/zh/troubleshoot-install)。

要对安装和配置进行更详细的检查，请运行 [`claude doctor`](/zh/troubleshooting#get-more-help)：
```bash
claude doctor
```
## 认证

Claude Code 需要 Pro、Max、Team、Enterprise 或 Console 账户。免费的 Claude.ai 计划不包含 Claude Code 访问权限。您也可以使用 [Amazon Bedrock](/zh/amazon-bedrock)、[Google Vertex AI](/zh/google-vertex-ai) 或 [Microsoft Foundry](/zh/microsoft-foundry) 等第三方 API 提供商来使用 Claude Code。

安装完成后，通过运行 `claude` 并按照浏览器提示登录。请参阅[认证](/zh/authentication)了解所有账户类型和团队设置选项。

## 更新 Claude Code

原生安装会在后台自动更新。您可以[配置发布渠道](#配置发布渠道)来控制是立即接收更新还是延迟按稳定计划更新，或者[完全禁用自动更新](#禁用自动更新)。Homebrew、WinGet 和 [Linux 软件包管理器](#alpine-linux-和基于-musl-的发行版) 安装方式默认需要手动更新。

### 自动更新

Claude Code 会在启动时以及运行期间定期检查更新。更新会在后台下载和安装，然后在您下次启动 Claude Code 时生效。

运行 `claude doctor` 可查看最近一次更新尝试的结果。

如果由于 npm 全局目录不可写而导致 npm 全局安装无法自动更新，Claude Code 会在启动时显示一次性通知，并且 `claude doctor` 会列出可用的修复方法。详见[安装过程中的权限错误](/zh/troubleshoot-install#permission-errors-during-installation)。

  Homebrew、WinGet、apt、dnf 和 apk 安装方式默认不会自动更新；如需为 Homebrew 和 WinGet 启用自动更新，请参阅下文。要手动升级 Homebrew，请根据您安装的 cask 类型运行 `brew upgrade claude-code` 或 `brew upgrade claude-code@latest`。对于 WinGet，请运行 `winget upgrade Anthropic.ClaudeCode`。有关 Linux 包管理器，请参阅 [使用 Linux 包管理器安装](#alpine-linux-和基于-musl-的发行版) 中的升级命令。

  若要让 Claude Code 为您在 Homebrew 或 WinGet 上运行升级命令，请将 [`CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE`](/zh/env-vars) 设置为 `1`。随后，当有新版本可用时，Claude Code 会在后台运行升级，并在成功时显示重新启动提示。该升级仅针对 Claude Code 软件包，不会影响您安装的其他软件。

  在 WinGet 上，当 Claude Code 正在运行时升级可能会失败，因为 Windows 会锁定可执行文件。在这种情况下，Claude Code 会改为显示手动升级命令。apt、dnf 和 apk 仍然需要手动升级，因为这些命令需要提升权限。

  **已知问题：** Claude Code 可能会在新版本于这些包管理器中可用之前就通知您有更新。如果升级失败，请稍后重试。

  Homebrew 在升级后会在磁盘上保留旧版本。请定期运行 `brew cleanup` 以回收磁盘空间。

### 配置发布渠道

通过 `autoUpdatesChannel` 设置项，控制 Claude Code 自动更新及 `claude update` 命令所遵循的发布渠道：

* `"latest"`（默认值）：新功能发布后立即获取
* `"stable"`：使用通常约一周前发布的版本，跳过存在重大回退的发布

可通过 `/config` → **自动更新渠道** 进行配置，或将其添加至您的 [settings.json 文件](/zh/settings)：
```json
{
  "autoUpdatesChannel": "stable"
}
```
对于企业部署，您可以通过[托管设置](/zh/permissions#managed-settings)在整个组织中强制使用一致的发布渠道。

Homebrew 安装方式通过 cask 名称选择渠道，而非此设置：`claude-code` 跟踪稳定版，`claude-code@latest` 跟踪最新版。

### 锁定最低版本

`minimumVersion` 设置设定了一个下限。后台自动更新和 `claude update` 命令会拒绝安装任何低于此值的版本，因此即使您当前使用的是更新的 `"latest"` 构建版本，切换到 `"stable"` 渠道也不会导致版本降级。

通过 `/config` 从 `"latest"` 切换到 `"stable"` 时，系统会提示您选择保持当前版本还是允许降级。选择保持当前版本会将 `minimumVersion` 设置为该版本。切换回 `"latest"` 则会清除该设置。

请将其添加到您的 [settings.json 文件](/zh/settings) 中以显式锁定最低版本：
```json
{
  "autoUpdatesChannel": "stable",
  "minimumVersion": "2.1.100"
}
```
在[托管设置](/zh/permissions#managed-settings)中，这会强制执行一个组织范围的最低要求，用户和项目设置无法覆盖该要求。

### 禁用自动更新

在 [`settings.json`](/zh/settings#available-settings) 文件的 `env` 键中，将 `DISABLE_AUTOUPDATER` 设置为 `"1"`：
```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```
`DISABLE_AUTOUPDATER` 只会停止后台检查；`claude update` 和 `claude install` 仍然有效。要阻止所有更新路径，包括手动更新，请设置 [`DISABLE_UPDATES`](/zh/env-vars)。当你通过自己的渠道分发 Claude Code 并且需要用户停留在你提供的版本时，使用此选项。

### 手动更新

要立即应用更新而不等待下一次后台检查，请运行：
```bash
claude update
```
## 高级安装选项

这些选项适用于版本锁定、Linux 包管理器、npm 以及验证二进制文件的完整性。

### 安装特定版本

原生安装程序接受特定版本号或发布通道（`latest` 或 `stable`）。您在安装时选择的通道将成为自动更新的默认通道。有关更多信息，请参阅[配置发布通道](#配置发布渠道)。

要安装最新版本（默认）：


    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```



    ```powershell
    irm https://claude.ai/install.ps1 | iex
    ```



    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```


安装稳定版：


    ```bash
    curl -fsSL https://claude.ai/install.sh | bash -s stable
    ```



    ```powershell
    & ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable
    ```



    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd stable && del install.cmd
    ```


若要安装特定版本号：


    ```bash
    curl -fsSL https://claude.ai/install.sh | bash -s 2.1.89
    ```



    ```powershell
    & ([scriptblock]::Create((irm https://claude.ai/install.ps1))) 2.1.89
    ```



    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd 2.1.89 && del install.cmd
    ```


### 使用 Linux 包管理器安装

Claude Code 发布了经过签名的 apt、dnf 和 apk 仓库。要使用滚动通道，请将 `stable` 替换为 `latest`。通过包管理器安装的版本不会通过 Claude Code 自动更新；更新会随您常规的系统升级流程送达。

所有仓库均使用 [Claude Code 发布签名密钥](#安装-claude-code) 进行签名。在信任该密钥之前，请按照每个选项卡中的说明进行验证。


    针对Debian和Ubuntu系统。如需使用滚动版渠道，请将`deb`行中的两处`stable`均予修改：一处是URL路径，另一处是套件名称。
    ```bash
    sudo install -d -m 0755 /etc/apt/keyrings
    sudo curl -fsSL https://downloads.claude.ai/keys/claude-code.asc \
      -o /etc/apt/keyrings/claude-code.asc
    echo "deb [signed-by=/etc/apt/keyrings/claude-code.asc] https://downloads.claude.ai/claude-code/apt/stable stable main" \
      | sudo tee /etc/apt/sources.list.d/claude-code.list
    sudo apt update
    sudo apt install claude-code
    ```
    在信任之前验证 GPG 密钥指纹：运行 `gpg --show-keys /etc/apt/keyrings/claude-code.asc` 应显示 `31DD DE24 DDFA B679 F42D 7BD2 BAA9 29FF 1A7E CACE`。

    若要稍后升级，请运行 `sudo apt update && sudo apt upgrade claude-code`。



    针对 Fedora 和 RHEL 系统：

    Claude Code 使用 `sdk` 进行 Claude 调用，该 `sdk` 在 Fedora 和 RHEL 上有 **原生支持**。这包括：

    - **原生二进制文件**：无需手动安装额外的二进制文件（如通过 `sdk add`）。
    - **自动配置**：`sdk` 会自动检测并配置 Fedora 和 RHEL 环境。
    - **无缝集成**：您的 Claude Code 会话、子代理和钩子将正常工作，无需特殊设置。
    ```bash
    sudo tee /etc/yum.repos.d/claude-code.repo <<'EOF'
    [claude-code]
    name=Claude Code
    baseurl=https://downloads.claude.ai/claude-code/rpm/stable
    enabled=1
    gpgcheck=1
    gpgkey=https://downloads.claude.ai/keys/claude-code.asc
    EOF
    sudo dnf install claude-code
    ```
    dnf 会在首次安装时下载密钥，并提示您确认指纹。在确认前，请验证其是否匹配 `31DD DE24 DDFA B679 F42D 7BD2 BAA9 29FF 1A7E CACE`。

    若需后续升级，请运行 `sudo dnf upgrade claude-code`。



    对于Alpine Linux：
    ```sh
    wget -O /etc/apk/keys/claude-code.rsa.pub \
      https://downloads.claude.ai/keys/claude-code.rsa.pub
    echo "https://downloads.claude.ai/claude-code/apk/stable" >> /etc/apk/repositories
    apk add claude-code
    ```
    使用 `sha256sum /etc/apk/keys/claude-code.rsa.pub` 验证下载的密钥，应该报告 `395759c1f7449ef4cdef305a42e820f3c766d6090d142634ebdb049f113168b6`。

    要稍后升级，运行 `apk update && apk upgrade claude-code`。


### 使用 npm 安装

您也可以通过将 Claude Code 安装为全局 npm 包来使用。该包要求 [Node.js 18 或更高版本](https://nodejs.org/en/download)。
```bash
npm install -g @anthropic-ai/claude-code
```
该 npm 包安装的原生二进制文件与独立安装程序相同。npm 通过如 `@anthropic-ai/claude-code-darwin-arm64` 这样的平台可选依赖来拉取二进制文件，并通过后安装步骤将其链接到位。安装的 `claude` 二进制文件本身不会调用 Node。

支持的 npm 安装平台包括 `darwin-arm64`、`darwin-x64`、`linux-x64`、`linux-arm64`、`linux-x64-musl`、`linux-arm64-musl`、`win32-x64` 和 `win32-arm64`。您的包管理器必须允许可选依赖。如果安装后缺少二进制文件，请参阅[故障排除](/zh/troubleshoot-install#native-binary-not-found-after-npm-install)。

要升级 npm 安装，请运行 `npm install -g @anthropic-ai/claude-code@latest`。请避免使用 `npm update -g`，因为它会遵循原始安装时的 semver 范围，可能无法更新到最新版本。

  请勿使用 `sudo npm install -g`，因为这可能导致权限问题和安全风险。如果遇到权限错误，请参阅[故障排除权限错误](/zh/troubleshoot-install#permission-errors-during-installation)。

### 二进制完整性与代码签名

每次发布都会提供一个 `manifest.json` 文件，其中包含各平台二进制文件的 SHA256 校验和。该 manifest 文件经 Anthropic GPG 密钥签名，因此验证 manifest 的签名即可间接验证其列出的所有二进制文件。

#### 验证 manifest 签名

步骤 1-3 需要具备 `gpg` 和 `curl` 工具的 POSIX shell 环境。在 Windows 系统中，可在 Git Bash 或 WSL 中执行。步骤 4 提供了 PowerShell 的操作方式。


    发布签名密钥在固定URL上发布。
    ```bash
    curl -fsSL https://downloads.claude.ai/keys/claude-code.asc | gpg --import
    ```
    显示已导入密钥的指纹。
    ```bash
    gpg --fingerprint security@anthropic.com
    ```
    确认输出包含此指纹：
    ```text
    31DD DE24 DDFA B679 F42D  7BD2 BAA9 29FF 1A7E CACE
    ```



    将 `VERSION` 设置为您想要验证的发行版。
    ```bash
    REPO=https://downloads.claude.ai/claude-code-releases
    VERSION=2.1.89
    curl -fsSLO "$REPO/$VERSION/manifest.json"
    curl -fsSLO "$REPO/$VERSION/manifest.json.sig"
    ```



    验证清单文件对应的分离数字签名。
    ```bash
    gpg --verify manifest.json.sig manifest.json
    ```
    一个有效的结果会报告 `Good signature from "Anthropic Claude Code Release Signing <security@anthropic.com>"`。

    对于任何新导入的密钥，`gpg` 也会打印 `WARNING: This key is not certified with a trusted signature!`。这是预期的行为。`Good signature` 这行确认了密码学检查已通过。而步骤1中的指纹比较则确认了密钥本身是真实的。



    将下载的二进制文件的SHA256校验和与 `manifest.json` 中 `platforms.<platform>.checksum` 下列出的值进行比对。


        ```bash
        sha256sum claude
        ```



        ```bash
        shasum -a 256 claude
        ```



        ```powershell
        (Get-FileHash claude.exe -Algorithm SHA256).Hash.ToLower()
        ```






  从 `2.1.89` 版本开始，发布版本提供了清单签名。早期版本仅在 `manifest.json` 中发布校验和，不提供分离式签名。

#### 平台代码签名

除了签名清单外，每个二进制文件在支持的平台上都带有平台原生代码签名。

* **macOS**：由"Anthropic PBC"签名并经苹果公司公证。可通过 `codesign --verify --verbose ./claude` 进行验证。
* **Windows**：由"Anthropic, PBC"签名。可通过 `Get-AuthenticodeSignature .\claude.exe` 进行验证。
* **Linux**：二进制文件没有单独的代码签名。如果你直接从 `claude-code-releases` 存储桶下载或使用原生安装程序，请使用上述清单签名验证完整性。如果你通过 [apt、dnf 或 apk](#使用-linux-包管理器安装) 安装，你的包管理器会使用仓库签名密钥自动验证签名。

## 卸载 Claude Code

要移除 Claude Code，请根据你的安装方法遵循相应说明。如果之后 `claude` 仍能运行，你可能还有第二个安装版本或来自旧版安装程序的残留 shell 别名。请参阅[检查冲突的安装](/zh/troubleshoot-install#check-for-conflicting-installations)以查找并移除它。

### 原生安装

移除 Claude Code 二进制文件和版本文件：


    ```bash
    rm -f ~/.local/bin/claude
    rm -rf ~/.local/share/claude
    ```



    ```powershell
    Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force
    Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force
    ```


### Homebrew 安装

卸载已安装的 Homebrew cask。如果您安装了稳定版 cask：
```bash
brew uninstall --cask claude-code
```
如果您安装了最新的cask：
```bash
brew uninstall --cask claude-code@latest
```
### WinGet 安装

移除 WinGet 包：
```powershell
winget uninstall Anthropic.ClaudeCode
```
#### apt / dnf / apk

移除软件包及其仓库配置：


    ```bash
    sudo apt remove claude-code
    sudo rm /etc/apt/sources.list.d/claude-code.list /etc/apt/keyrings/claude-code.asc
    ```



    ```bash
    sudo dnf remove claude-code
    sudo rm /etc/yum.repos.d/claude-code.repo
    ```



    ```sh
    apk del claude-code
    sed -i '\|downloads.claude.ai/claude-code/apk|d' /etc/apk/repositories
    rm /etc/apk/keys/claude-code.rsa.pub
    ```


### npm

移除全局npm包：
```bash
npm uninstall -g @anthropic-ai/claude-code
```
### 删除配置文件

  删除配置文件将会移除所有您的设置、已允许的工具、MCP 服务器配置以及会话历史记录。

VS Code 扩展、JetBrains 插件和桌面应用同样会写入 `~/.claude/` 目录。如果其中任何一个仍然安装，该目录会在下次运行时被重新创建。若要完全移除 Claude Code，请在删除这些文件前，先卸载 [VS Code 扩展](/zh/vs-code#uninstall-the-extension)、JetBrains 插件和桌面应用。

要移除 Claude Code 的设置和缓存数据：


    ```bash
    # Remove user settings and state
    rm -rf ~/.claude
    rm ~/.claude.json

    # Remove project-specific settings (run from your project directory)
    rm -rf .claude
    rm -f .mcp.json
    ```



    ```powershell
    # Remove user settings and state
    Remove-Item -Path "$env:USERPROFILE\.claude" -Recurse -Force
    Remove-Item -Path "$env:USERPROFILE\.claude.json" -Force

    # Remove project-specific settings (run from your project directory)
    Remove-Item -Path ".claude" -Recurse -Force
    Remove-Item -Path ".mcp.json" -Force
    ```


