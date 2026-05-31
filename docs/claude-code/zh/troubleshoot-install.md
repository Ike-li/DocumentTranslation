# 安装和登录故障排除

> 修复安装或登录 Claude Code 时出现的命令未找到、PATH、权限、网络和身份验证错误。

如果安装失败或无法登录，请在下方查找对应的错误信息。有关 Claude Code 运行后的运行时问题，请参阅[故障排除](/zh/troubleshooting)。有关配置问题（如设置未生效或钩子未触发），请参阅[调试配置](/zh/debug-your-config)。

## 查找错误

将您看到的错误消息或症状与修复方法对应：

| 看到的信息                                                                                    | 解决方案                                                                                                                |
| :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `command not found: claude` 或 `'claude' is not recognized`                                 | [修复 PATH](#安装后找不到-claude-命令)                                                           |
| `syntax error near unexpected token '<'`                                                    | [安装脚本返回 HTML](#安装脚本返回-html-而非-shell-脚本)                                   |
| `curl: (22) The requested URL returned error: 403`                                          | [安装脚本返回 403](#安装脚本返回-html-而非-shell-脚本)                                   |
| `curl: (23)` 或 `curl: (56) Failure writing output to destination`                          | [检查连接或使用替代安装程序](#curl-56-写入输出到目标失败)                    |
| Linux 安装过程中出现 `Killed`                                                               | [为低内存服务器添加交换空间](#低内存-linux-服务器安装被终止)                                    |
| `TLS connect error` 或 `SSL/TLS secure channel`                                             | [更新 CA 证书](#tls-或-ssl-连接错误)                                                                 |
| `Failed to fetch version` 或无法连接下载服务器                                                  | [检查网络和代理设置](#检查网络连接)                                                         |
| `irm is not recognized` 或 `&& is not valid`                                                | [使用正确的 shell 命令](#windows-上的错误安装命令)                                               |
| `'bash' is not recognized as the name of a cmdlet`                                          | [使用 Windows 安装命令](#windows-上的错误安装命令)                                                  |
| `Claude Code on Windows requires either Git for Windows (for bash) or PowerShell`           | [安装 shell](#windows-上的-claude-code-需要-git-for-windows-或-powershell)                       |
| `Claude Code does not support 32-bit Windows`                                               | [打开 Windows PowerShell，而非 x86 条目](#claude-code-不支持-32-位-windows)                              |
| `The process cannot access the file ... because it is being used by another process`        | [清除下载文件夹并重试](#windows-安装期间无法访问文件)                      |
| `Error loading shared library`                                                              | [系统使用了错误的二进制变体](#linux-musl-或-glibc-二进制不匹配)                                            |
| `Illegal instruction`                                                                       | [架构或 CPU 指令集不匹配](#非法指令)                                                    |
| WSL 中出现 `cannot execute binary file: Exec format error`                                  | [WSL1 原生二进制回归问题](#wsl1-上的-exec-format-error)                                                             |
| PowerShell 安装完成但找不到 `claude` 或显示旧版本                                               | [重启终端并验证 PATH](#验证-path)                                                              |
| macOS 上出现 `dyld: cannot load`、`dyld: Symbol not found` 或 `Abort trap`                  | [二进制不兼容](#macos-上的-dyld-cannot-load)                                                                    |
| `Invoke-Expression: Missing argument in parameter list`                                     | [安装脚本返回 HTML](#安装脚本返回-html-而非-shell-脚本)                                   |
| `App unavailable in region`                                                                 | Claude Code 在您所在的国家/地区不可用。请参阅[支持的国家/地区](https://www.anthropic.com/supported-countries)。 |
| `unable to get local issuer certificate`                                                    | [配置企业 CA 证书](#tls-或-ssl-连接错误)                                                    |
| `OAuth error` 或 `403 Forbidden`                                                            | [修复身份验证](#登录和身份验证)                                                                         |
| `Could not load the default credentials` 或 `Could not load credentials from any providers` | [Bedrock、Vertex 或 Foundry 凭据](#bedrockvertex-或-foundry-凭据未加载)                           |
| `ChainedTokenCredential authentication failed` 或 `CredentialUnavailableError`              | [Bedrock、Vertex 或 Foundry 凭据](#bedrockvertex-或-foundry-凭据未加载)                           |
| `API Error: 500`、`529 Overloaded`、`429` 或其他未列出的 4xx 和 5xx 错误                        | 请参阅[错误参考](/zh/errors)                                                                                   |

如果您的问题未列出，请按照下面的诊断检查逐步缩小原因范围。

如果您不想使用终端，[Claude Code 桌面应用](/zh/desktop-quickstart)允许您通过图形界面安装和使用 Claude Code。下载 [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code\&utm_medium=docs) 或 [Windows](https://claude.com/download?utm_source=claude_code\&utm_medium=docs) 版本，无需任何命令行设置即可开始编码。

## 运行诊断检查

### 检查网络连接

安装程序从 `downloads.claude.ai` 下载。验证您是否可以访问：

```bash
curl -sI https://downloads.claude.ai/claude-code-releases/latest
```

看到 `HTTP/2 200` 行表示您已连接到服务器。如果看不到任何输出、显示 `Could not resolve host` 或连接超时，则您的网络阻止了连接。常见原因：

* 企业防火墙或代理阻止了 `downloads.claude.ai`
* 区域网络限制：尝试使用 VPN 或其他网络
* TLS/SSL 问题：更新系统的 CA 证书，或检查是否配置了 `HTTPS_PROXY`

如果您在企业代理后面，请在安装前将 `HTTPS_PROXY` 和 `HTTP_PROXY` 设置为代理地址。如果您不知道代理 URL，请咨询 IT 团队或检查浏览器的代理设置。

以下示例设置两个代理变量，然后通过代理运行安装程序：

macOS/Linux：

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell：

```powershell
$env:HTTP_PROXY = 'http://proxy.example.com:8080'
$env:HTTPS_PROXY = 'http://proxy.example.com:8080'
irm https://claude.ai/install.ps1 | iex
```

### 验证 PATH

如果安装成功但运行 `claude` 时出现 `command not found` 或 `not recognized` 错误，则安装目录不在您的 PATH 中。Shell 会在 PATH 列出的目录中搜索程序，安装程序将 `claude` 放在 macOS/Linux 的 `~/.local/bin/claude` 或 Windows 的 `%USERPROFILE%\.local\bin\claude.exe`。

通过列出 PATH 条目并过滤 `local/bin` 来检查安装目录是否在 PATH 中：

macOS/Linux：

```bash
echo $PATH | tr ':' '\n' | grep -Fx "$HOME/.local/bin"
```

如果输出 `/Users/you/.local/bin` 或 `/home/you/.local/bin`，则目录已在 PATH 中，可以跳到[检查冲突安装](#检查冲突安装)。如果没有输出，请将其添加到 shell 配置中。

对于 macOS 上默认的 Zsh：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

对于大多数 Linux 发行版默认的 Bash：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

或者，关闭并重新打开终端。

对于其他 shell（如 fish 或 Nushell），请使用 shell 自身的配置语法将 `~/.local/bin` 添加到 PATH，然后重启终端。

验证修复是否成功：

```bash
claude --version
```

Windows PowerShell：

```powershell
$env:PATH -split ';' | Select-String '\.local\\bin'
```

如果没有输出，将安装目录添加到用户 PATH：

```powershell
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
```

重启终端使更改生效。

验证修复是否成功：

```powershell
claude --version
```

Windows CMD：

```batch
echo %PATH% | findstr /i "local\bin"
```

如果没有输出，打开系统设置，转到环境变量，将 `%USERPROFILE%\.local\bin` 添加到用户 PATH 变量。重启终端。

验证修复是否成功：

```batch
claude --version
```

### 检查冲突安装

多个 Claude Code 安装可能导致版本不匹配或意外行为。检查已安装的内容：

macOS/Linux：

列出 PATH 中找到的所有 `claude` 二进制文件：

```bash
which -a claude
```

如果没有任何输出，说明 PATH 中还没有 `claude`。请返回[验证 PATH](#验证-path)。

检查 `claude` 二进制文件可能来自的三个位置。`~/.local/bin/claude` 是原生安装程序，`~/.claude/local/` 是旧版 Claude Code 创建的本地 npm 安装，npm 全局列表显示 `-g` 安装：

```bash
ls -la ~/.local/bin/claude
```

```bash
ls -la ~/.claude/local/
```

```bash
npm -g ls @anthropic-ai/claude-code 2>/dev/null
```

Windows PowerShell：

列出 PATH 中找到的所有 `claude` 二进制文件：

```powershell
where.exe claude
```

检查原生安装程序是否放置了二进制文件：

```powershell
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
```

如果发现多个安装，请只保留一个。建议使用 macOS/Linux 上的 `~/.local/bin/claude` 或 Windows 上的 `%USERPROFILE%\.local\bin\claude.exe` 的原生安装。删除多余的：

卸载 npm 全局安装：

```bash
npm uninstall -g @anthropic-ai/claude-code
```

删除旧版本地 npm 安装：

```bash
rm -rf ~/.claude/local
```

在 Windows 上，使用 PowerShell：

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\local"
```

删除 macOS 上的 Homebrew 安装。如果安装了 `claude-code@latest` cask，请替换名称：

```bash
brew uninstall --cask claude-code
```

删除 Windows 上的 WinGet 安装：

```powershell
winget uninstall Anthropic.ClaudeCode
```

### 检查目录权限

安装程序需要对 macOS 和 Linux 上的 `~/.local/bin/` 和 `~/.claude/` 拥有写入权限。在 Windows 上，安装位置在 `%USERPROFILE%` 下，该目录默认可由用户写入，因此本节很少适用。

检查目录是否可写：

```bash
test -w ~/.local/bin && echo "writable" || echo "not writable"
test -w ~/.claude && echo "writable" || echo "not writable"
```

如果任一目录不可写，请创建安装目录并将用户设为所有者：

```bash
sudo mkdir -p ~/.local/bin
sudo chown -R $(whoami) ~/.local
```

### 验证二进制文件是否正常工作

如果 `claude --version` 能打印版本但 `claude` 启动时崩溃或挂起，请运行以下检查缩小原因范围。如果 `claude --version` 显示命令未找到，请先转到[验证 PATH](#验证-path)；以下命令假设 `claude` 已在 PATH 中。

确认二进制文件存在且可执行：

```bash
ls -la "$(command -v claude)"
```

在 Windows 上，使用 PowerShell：

```powershell
Get-Command claude | Select-Object Source
```

在 Linux 上，检查缺失的共享库。如果 `ldd` 显示缺失的库，可能需要安装系统包。在 Alpine Linux 和其他基于 musl 的发行版上，请参阅 [Alpine Linux 设置](/zh/setup#alpine-linux-和基于-musl-的发行版)。

```bash
ldd "$(command -v claude)" | grep "not found"
```

确认二进制文件可以执行：

```bash
claude --version
```

## 常见安装问题

以下是最常见的安装问题及其解决方案。

### 安装脚本返回 HTML 而非 shell 脚本

运行安装命令时，可能会看到以下错误之一：

```text
bash: line 1: syntax error near unexpected token `<'
bash: line 1: `<!DOCTYPE html>'
```

在 PowerShell 上，同样的问题表现为：

```text
Invoke-Expression: Missing argument in parameter list.
```

根据请求的路由方式，您可能会看到没有 HTML 内容的 403 错误：

```text
curl: (22) The requested URL returned error: 403
```

这些都意味着安装 URL 返回了 HTML 页面或错误状态，而非安装脚本。如果 HTML 页面显示"App unavailable in region"，则 Claude Code 在您所在的国家/地区不可用。请参阅[支持的国家/地区](https://www.anthropic.com/supported-countries)。

没有内容的 403 通常也是同样原因，但也可能是企业代理或防火墙阻止下载造成的。如果您在受支持的国家/地区仍然看到 403，请在尝试下面的替代安装程序之前先执行[检查网络连接](#检查网络连接)，因为这些安装程序访问相同的主机。

否则，这可能是由于网络问题、区域路由或临时服务中断造成的。

**解决方案：**

1. **使用替代安装方法**：

   在 macOS 上，通过 Homebrew 安装：

   ```bash
   brew install --cask claude-code
   ```

   在 Windows 上，通过 WinGet 安装：

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

2. **几分钟后重试**：问题通常是暂时的。等待后再次尝试原始命令。

### 安装后找不到 claude 命令

安装完成但 `claude` 不起作用。具体错误因平台而异：

| 平台        | 错误消息                                                          |
| :---------- | :--------------------------------------------------------------------- |
| macOS       | `zsh: command not found: claude`                                       |
| Linux       | `bash: claude: command not found`                                      |
| Windows CMD | `'claude' is not recognized as an internal or external command`        |
| PowerShell  | `claude : The term 'claude' is not recognized as the name of a cmdlet` |

这意味着安装目录不在 shell 的搜索路径中。有关各平台的修复方法，请参阅[验证 PATH](#验证-path)。

### curl: (56) 写入输出到目标失败

`curl ... | bash` 命令下载脚本并通过管道传递给 Bash 执行。此错误以及相关的 `curl: (23) Failure writing output to destination` 意味着 Bash 没有接收到完整的脚本。退出代码 56 表示下载本身被中断，退出代码 23 表示 curl 无法将接收到的内容写入管道，通常是因为 Bash 提前退出。

**解决方案：**

1. **检查网络稳定性**：Claude Code 二进制文件托管在 `downloads.claude.ai`。测试是否可以访问：
   ```bash
   curl -sI https://downloads.claude.ai/claude-code-releases/latest
   ```
   看到 `HTTP/2 200` 行表示已连接服务器，原始失败可能是间歇性的；重试安装命令。如果看到 `Could not resolve host` 或连接超时，则网络阻止了下载。

2. **尝试替代安装方法**：

   在 macOS 上：

   ```bash
   brew install --cask claude-code
   ```

   在 Windows 上：

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

### TLS 或 SSL 连接错误

`curl: (35) TLS connect error`、`schannel: next InitializeSecurityContext failed` 或 PowerShell 的 `Could not establish trust relationship for the SSL/TLS secure channel` 等错误表明 TLS 握手失败。

**解决方案：**

1. **更新系统 CA 证书**：

   在 Ubuntu/Debian 上：

   ```bash
   sudo apt-get update && sudo apt-get install ca-certificates
   ```

   在 macOS 上，系统 curl 使用钥匙串信任存储；更新 macOS 本身会更新根证书。

2. **在 Windows 上，在运行安装程序前启用 TLS 1.2**：
   ```powershell
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   irm https://claude.ai/install.ps1 | iex
   ```

3. **检查代理或防火墙干扰**：执行 TLS 检查的企业代理可能导致这些错误，包括 `unable to get local issuer certificate` 和 `SELF_SIGNED_CERT_IN_CHAIN`。对于安装步骤，使用 `--cacert` 将 curl 指向企业 CA 包：
   ```bash
   curl --cacert /path/to/corporate-ca.pem -fsSL https://claude.ai/install.sh | bash
   ```
   对于安装后的 Claude Code，设置 `NODE_EXTRA_CA_CERTS` 以便 API 请求信任相同的证书包：
   ```bash
   export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
   ```
   如果没有证书文件，请咨询 IT 团队。您也可以尝试直接连接以确认代理是问题原因。

4. **在 Windows 上，绕过证书吊销检查**：如果看到 `CRYPT_E_NO_REVOCATION_CHECK (0x80092012)` 或 `CRYPT_E_REVOCATION_OFFLINE (0x80092013)`，表示 curl 已连接到服务器但网络阻止了证书吊销查询，这在企业防火墙后面很常见。在安装命令中添加 `--ssl-revoke-best-effort`：
   ```batch
   curl --ssl-revoke-best-effort -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
   ```
   或者，使用 `winget install Anthropic.ClaudeCode` 安装，完全避免使用 curl。

### 无法从 downloads.claude.ai 获取版本

安装程序无法连接到下载服务器。通常意味着 `downloads.claude.ai` 在您的网络上被阻止。

**解决方案：**

1. **直接测试连接**：
   ```bash
   curl -sI https://downloads.claude.ai/claude-code-releases/latest
   ```

2. **如果在代理后面**，设置 `HTTPS_PROXY` 以便安装程序通过代理路由。详情请参阅[代理配置](/zh/network-config#代理配置)。
   ```bash
   export HTTPS_PROXY=http://proxy.example.com:8080
   curl -fsSL https://claude.ai/install.sh | bash
   ```

3. **如果在受限网络上**，尝试其他网络或 VPN，或使用替代安装方法：

   在 macOS 上：

   ```bash
   brew install --cask claude-code
   ```

   在 Windows 上：

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

### Windows 上的错误安装命令

如果看到 `'irm' is not recognized`、`The token '&&' is not valid` 或 `'bash' is not recognized as the name of a cmdlet`，说明您复制了适用于其他 shell 或操作系统的安装命令。

* **`irm` 未识别**：您在 CMD 中，而非 PowerShell。有两个选择：

  在开始菜单中搜索"PowerShell"打开 PowerShell，然后运行原始安装命令：

  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

  或者留在 CMD 中，使用 CMD 安装程序：

  ```batch
  curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
  ```

* **`&&` 无效**：您在 PowerShell 中但运行了 CMD 安装命令。使用 PowerShell 安装程序：
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

* **`bash` 未识别**：您在 Windows 上运行了 macOS/Linux 安装程序。请改用 PowerShell 安装程序：
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```

### Windows 安装期间无法访问文件

如果 PowerShell 安装程序失败并显示 `Failed to download binary: The process cannot access the file ... because it is being used by another process`，说明安装程序无法写入 `%USERPROFILE%\.claude\downloads`。通常意味着之前的安装尝试仍在运行，或者防病毒软件正在扫描该文件夹中部分下载的二进制文件。

关闭任何其他运行安装程序的 PowerShell 窗口，等待防病毒扫描释放文件。然后删除下载文件夹并重新运行安装程序：

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\downloads"
irm https://claude.ai/install.ps1 | iex
```

### 低内存 Linux 服务器安装被终止

如果在 VPS 或云实例上安装时看到 `Killed`：

```text
Setting up Claude Code...
Installing Claude Code native build latest...
bash: line 142: 34803 Killed    "$binary_path" install ${TARGET:+"$TARGET"}
```

Linux OOM killer 终止了进程，因为系统内存不足。Claude Code 至少需要 4 GB 可用内存。

**解决方案：**

1. **添加交换空间**（如果服务器内存有限）。交换空间使用磁盘空间作为溢出内存，即使物理内存较低也能完成安装。

   创建 2 GB 交换文件并启用：

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

   然后重试安装：

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

2. **关闭其他进程**以在安装前释放内存。

3. **使用更大的实例**（如果可能）。Claude Code 至少需要 4 GB 内存。

### Docker 中安装挂起

在 Docker 容器中安装 Claude Code 时，以 root 身份安装到 `/` 可能导致挂起。

**解决方案：**

1. **设置工作目录**后再运行安装程序。从 `/` 运行时，安装程序会扫描整个文件系统，导致内存使用过高。设置 `WORKDIR` 可将扫描限制在小目录中：
   ```dockerfile
   WORKDIR /tmp
   RUN curl -fsSL https://claude.ai/install.sh | bash
   ```

2. **增加 Docker 内存限制**（如果使用 Docker Desktop）：
   ```bash
   docker build --memory=4g .
   ```

### Claude Desktop 在 Windows 上覆盖 claude 命令

如果安装了旧版 Claude Desktop，它可能在 `WindowsApps` 目录中注册了一个 `Claude.exe`，其 PATH 优先级高于 Claude Code CLI。运行 `claude` 会打开桌面应用而非 CLI。

将 Claude Desktop 更新到最新版本即可修复此问题。

### Windows 上的 Claude Code 需要 Git for Windows 或 PowerShell

Git for Windows 是可选的。Claude Code 在没有 Git Bash 时使用 [PowerShell 工具](/zh/tools-reference#powershell-tool)，因此此错误意味着两者都未找到。

**如果 PATH 中缺少 PowerShell**，其默认位置是 `C:\Windows\System32\WindowsPowerShell\v1.0\`。将该目录添加到 PATH，或安装提供 `pwsh` 的 [PowerShell 7](https://aka.ms/powershell)。

**如果要安装 Git for Windows**，从 [git-scm.com/downloads/win](https://git-scm.com/downloads/win) 下载。安装过程中选择"Add to PATH"。安装后重启终端。安装后可启用 Bash 工具，在使用基于 Bash 的脚本和工具时很有用。

**如果 Git 已安装**但 Claude Code 找不到，请在 [settings.json 文件](/zh/settings)中设置路径：

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

如果 Git 安装在其他位置，在 PowerShell 中运行 `where.exe git` 找到路径，使用该目录下的 `bin\bash.exe` 路径。

### Claude Code 不支持 32 位 Windows

Windows 在开始菜单中有两个 PowerShell 条目：`Windows PowerShell` 和 `Windows PowerShell (x86)`。x86 条目以 32 位进程运行，即使在 64 位机器上也会触发此错误。要检查您的情况，在产生错误的同一窗口中运行：

```powershell
[Environment]::Is64BitOperatingSystem
```

如果输出 `True`，操作系统没有问题。关闭窗口，打开不带 x86 后缀的 `Windows PowerShell`，然后再次运行安装命令。

如果输出 `False`，您使用的是 32 位 Windows。Claude Code 需要 64 位操作系统。请参阅[系统要求](/zh/setup#系统要求)。

### Linux musl 或 glibc 二进制不匹配

如果安装后看到关于缺失共享库（如 `libstdc++.so.6` 或 `libgcc_s.so.1`）的错误，安装程序可能下载了错误的二进制变体。

```text
Error loading shared library libstdc++.so.6: No such file or directory
```

这可能发生在安装了 musl 交叉编译包的基于 glibc 的系统上，导致安装程序误检测系统为 musl。

**解决方案：**

1. **检查系统使用的 libc**：
   ```bash
   ldd --version 2>&1 | head -1
   ```
   输出提到 `GNU libc` 或 `GLIBC` 表示 glibc。输出提到 `musl` 表示 musl。

2. **如果使用 glibc 但得到了 musl 二进制文件**，删除安装并重新安装。您也可以使用 `https://downloads.claude.ai/claude-code-releases/{VERSION}/manifest.json` 中的清单手动下载正确的二进制文件。提交 [GitHub issue](https://github.com/anthropics/claude-code/issues)，附上 `ldd --version` 和 `ls /lib/libc.musl*` 的输出。

3. **如果确实使用 musl**（如 Alpine Linux），安装所需包：
   ```bash
   apk add libgcc libstdc++ ripgrep
   ```

### 非法指令

如果运行 `claude` 或安装程序打印 `Illegal instruction`，说明原生二进制文件使用了处理器不支持的 CPU 指令。有两种不同的原因。

**架构不匹配。** 安装程序下载了错误的二进制文件，例如在 ARM 服务器上下载了 x86。在 macOS 或 Linux 上使用 `uname -m` 检查，或在 PowerShell 中使用 `$env:PROCESSOR_ARCHITECTURE` 检查。如果结果与收到的二进制文件不匹配，请[提交 GitHub issue](https://github.com/anthropics/claude-code/issues) 并附上输出。

**缺少 AVX 指令集。** 如果架构正确但仍然看到 `Illegal instruction`，CPU 可能缺少 AVX 或二进制文件需要的其他指令。这大约影响 2013 年之前的 Intel 和 AMD 处理器，以及虚拟机监控程序未将 AVX 传递给客户机的虚拟机。

在 VPS 或 VM 上，运行 `grep -m1 -ow avx /proc/cpuinfo`；空结果表示客户机不可用 AVX。

没有原生二进制文件的解决方法；跟踪 [issue #50384](https://github.com/anthropics/claude-code/issues/50384) 了解状态，报告时请附上 Linux 上的 `grep -m1 "model name" /proc/cpuinfo` 或 macOS 上的 `sysctl -n machdep.cpu.brand_string` 的 CPU 型号。

替代安装方法下载相同的原生二进制文件，无法解决上述任一原因。

### macOS 上的 dyld: cannot load

如果在安装过程中看到 `dyld: cannot load`、`dyld: Symbol not found` 或 `Abort trap: 6`，说明二进制文件与您的 macOS 版本或硬件不兼容。

```text
dyld: cannot load 'claude-2.1.42-darwin-x64' (load command 0x80000034 is unknown)
Abort trap: 6
```

引用 `libicucore` 的 `Symbol not found` 错误也表明 macOS 版本低于二进制文件支持的版本：

```text
dyld: Symbol not found: _ubrk_clone
  Referenced from: claude-darwin-x64 (which was built for Mac OS X 13.0)
  Expected in: /usr/lib/libicucore.A.dylib
```

**解决方案：**

1. **检查 macOS 版本**：Claude Code 需要 macOS 13.0 或更高版本。打开 Apple 菜单选择"关于本机"查看版本。

2. **更新 macOS**（如果版本较旧）。二进制文件使用旧版 macOS 不支持的加载命令和系统库。Homebrew 等替代安装方法下载相同的二进制文件，无法解决此错误。

### WSL1 上的 Exec format error

如果在 WSL 中运行 `claude` 打印 `cannot execute binary file: Exec format error`，说明您在 WSL1 上遇到了已知的原生二进制回归问题，跟踪于 [issue #38788](https://github.com/anthropics/claude-code/issues/38788)。二进制文件的程序头以 WSL1 加载器无法处理的方式发生了更改。

最简单的修复方法是从 PowerShell 将发行版转换为 WSL2：

```powershell
wsl --set-version <DistroName> 2
```

如果需要留在 WSL1 上，通过动态链接器调用二进制文件。将以下函数添加到 WSL 内的 `~/.bashrc`，如果主目录不同请替换路径：

```bash
claude() {
  /lib64/ld-linux-x86-64.so.2 "$(readlink -f "$HOME/.local/bin/claude")" "$@"
}
```

然后运行 `source ~/.bashrc` 并重试 `claude`。

### WSL 中的 npm install 错误

如果您在 WSL 内使用 `npm install -g` 安装了 Claude Code，这些问题适用。如果使用[原生安装程序](/zh/setup)，请跳过本节。

**操作系统或平台检测问题。** 如果 npm 在安装期间报告平台不匹配，WSL 可能正在使用 Windows 的 `npm`。先运行 `npm config set os linux`，然后使用 `npm install -g @anthropic-ai/claude-code --force` 安装。不要使用 `sudo`。

**运行 claude 时出现 `exec: node: not found`。** WSL 环境可能正在使用 Windows 安装的 Node.js。使用 `which npm` 和 `which node` 确认：以 `/mnt/c/` 开头的路径是 Windows 二进制文件，而 Linux 路径以 `/usr/` 开头。要修复此问题，通过 Linux 发行版的包管理器或 [`nvm`](https://github.com/nvm-sh/nvm) 安装 Node。

**nvm 版本冲突。** 如果在 WSL 和 Windows 中都安装了 nvm，在 WSL 中切换 Node 版本可能会失败，因为 WSL 默认导入 Windows PATH 且 Windows nvm 优先级更高。最常见的原因是 nvm 未在 shell 中加载。将 nvm 加载器添加到 `~/.bashrc` 或 `~/.zshrc`：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

或在当前会话中加载：

```bash
source ~/.nvm/nvm.sh
```

如果 nvm 已加载但 Windows 路径仍优先，请显式前置 Linux Node 路径：

```bash
export PATH="$HOME/.nvm/versions/node/$(node -v)/bin:$PATH"
```

避免通过 `appendWindowsPath = false` 禁用 Windows PATH 导入，因为这会破坏从 WSL 调用 Windows 可执行文件的能力。同样，如果将 Node.js 用于 Windows 开发，避免从 Windows 卸载 Node.js。

### 安装期间的权限错误

如果原生安装程序因权限错误而失败，目标目录可能不可写。请参阅[检查目录权限](#检查目录权限)。

如果之前使用 npm 安装并遇到 npm 特定的权限错误，请切换到原生安装程序：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### npm 安装后找不到原生二进制文件

`@anthropic-ai/claude-code` npm 包通过平台可选依赖项（如 `@anthropic-ai/claude-code-darwin-arm64`）引入原生二进制文件。如果安装后运行 `claude` 打印 `Could not find native binary package "@anthropic-ai/claude-code-<platform>"`，请检查以下原因：

* **可选依赖项被禁用。** 从 npm install 命令中移除 `--omit=optional`，从 pnpm 中移除 `--no-optional`，从 yarn 中移除 `--ignore-optional`，并检查 `.npmrc` 是否设置了 `optional=false`。然后重新安装。原生二进制文件仅作为可选依赖项提供，如果被跳过则没有 JavaScript 回退。
* **不支持的平台。** 预构建二进制文件发布于 `darwin-arm64`、`darwin-x64`、`linux-x64`、`linux-arm64`、`linux-x64-musl`、`linux-arm64-musl`、`win32-x64` 和 `win32-arm64`。Claude Code 不为其他平台提供二进制文件；请参阅[系统要求](/zh/setup#系统要求)。
* **企业 npm 镜像缺少平台包。** 确保您的注册表镜像了所有八个 `@anthropic-ai/claude-code-*` 平台包以及元包。

使用 `--ignore-scripts` 安装不会触发此错误。将二进制文件链接到位的 postinstall 步骤被跳过，因此 Claude Code 回退到在每次启动时定位和生成平台二进制文件的包装器。这可以正常工作但启动较慢；重新启用脚本安装以获得直接执行。

## 登录和身份验证

以下部分解决登录失败、OAuth 错误和令牌问题。

### 重置登录

当登录失败且原因不明显时，重新进行身份验证可解决大多数情况：

1. 运行 `/logout` 完全退出登录
2. 关闭 Claude Code
3. 使用 `claude` 重新启动并再次完成身份验证过程

如果登录期间浏览器未自动打开，按 `c` 将 OAuth URL 复制到剪贴板，然后手动粘贴到浏览器中。当 URL 在窄终端或 SSH 终端中跨行显示且无法直接点击时，此方法也适用。

### OAuth 错误：无效代码

如果看到 `OAuth error: Invalid code. Please make sure the full code was copied`，说明登录代码已过期或在复制粘贴时被截断。

**解决方案：**

* 按 Enter 重试，并在浏览器打开后快速完成登录
* 如果浏览器未自动打开，输入 `c` 复制完整 URL
* 如果使用远程/SSH 会话，浏览器可能在错误的机器上打开。复制终端中显示的 URL 并在本地浏览器中打开。

### 登录后 403 Forbidden

如果登录后看到 `API Error: 403 {"error":{"type":"forbidden","message":"Request not allowed"}}`：

* **Claude Pro/Max 用户**：在 [claude.ai/settings](https://claude.ai/settings) 验证订阅是否有效
* **Anthropic Console 用户**：确认账户具有"Claude Code"或"Developer"角色。管理员在 Anthropic Console 的"设置 → 成员"中分配此角色。
* **在代理后面**：企业代理可能干扰 API 请求。有关代理设置，请参阅[网络配置](/zh/network-config)。

### 此组织已被禁用但有活跃订阅

如果看到 `API Error: 400 ... "This organization has been disabled"` 但拥有有效的 Claude 订阅，说明 `ANTHROPIC_API_KEY` 环境变量覆盖了您的订阅。这通常发生在旧雇主或项目的 API 密钥仍在 shell 配置文件中设置时。

当存在 `ANTHROPIC_API_KEY` 且您已批准时，Claude Code 使用该密钥而非订阅的 OAuth 凭据。在使用 `-p` 标志的非交互模式下，存在密钥时始终使用。有关完整的解析顺序，请参阅[身份验证优先级](/zh/authentication#身份验证优先级)。

要使用订阅，请取消设置环境变量并从 shell 配置文件中删除：

```bash
unset ANTHROPIC_API_KEY
claude
```

检查 `~/.zshrc`、`~/.bashrc` 或 `~/.profile` 中的 `export ANTHROPIC_API_KEY=...` 行并删除以使更改永久生效。在 Windows 上，检查 `$PROFILE` 处的 PowerShell 配置文件和用户环境变量中的 `ANTHROPIC_API_KEY`。在 Claude Code 内运行 `/status` 确认当前活跃的身份验证方法。

### WSL2、SSH 或容器中的 OAuth 登录失败

当 Claude Code 在 WSL2 中、通过 SSH 在远程机器上或在容器内运行时，浏览器通常在不同的主机上打开，其重定向无法到达 Claude Code 的本地回调服务器。登录后，浏览器显示登录代码而非自动重定向。在终端的 `Paste code here if prompted` 提示处粘贴该代码以完成登录。

如果浏览器在 WSL2 中完全不打开，将 `BROWSER` 环境变量设置为 Windows 浏览器路径：

```bash
export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
claude
```

或者，在交互式登录提示处按 `c` 复制 OAuth URL，或复制 `claude auth login` 打印的 URL，在本地机器上的浏览器中打开。

如果将代码粘贴到交互式提示中没有反应，终端的粘贴绑定可能未到达输入字段。尝试终端的替代粘贴快捷键（在 Windows Terminal 中通常是右键单击或 Shift+Insert），或使用 `claude auth login`，它从标准输入读取粘贴的代码：

```bash
claude auth login
```

此回退方法也适用于原生 Windows 或任何粘贴到交互式提示失败的终端。

### 未登录或令牌已过期

如果 Claude Code 在会话后提示重新登录，OAuth 令牌可能已过期。

运行 `/login` 重新进行身份验证。如果频繁发生，请检查系统时钟是否准确，因为令牌验证依赖于正确的时间戳。

在 macOS 上，登录也可能在钥匙串被锁定或其密码与账户密码不同步时失败，这会阻止 Claude Code 保存凭据。运行 `claude doctor` 检查钥匙串访问。要手动解锁钥匙串，运行 `security unlock-keychain ~/Library/Keychains/login.keychain-db`。如果解锁没有帮助，打开钥匙串访问，选择 `login` 钥匙串，选择"编辑 > 更改钥匙串'login'的密码"以与账户密码重新同步。

### Bedrock、Vertex 或 Foundry 凭据未加载

如果配置 Claude Code 使用云提供商并在 Bedrock 上看到 `Could not load credentials from any providers`、在 Vertex 上看到 `Could not load the default credentials` 或在 Foundry 上看到 `ChainedTokenCredential authentication failed`，说明云提供商 CLI 可能在当前 shell 中未进行身份验证。

对于 Bedrock，确认 AWS 凭据有效：

```bash
aws sts get-caller-identity
```

对于 Vertex AI，确认 shell 中设置了 `ANTHROPIC_VERTEX_PROJECT_ID` 和 `CLOUD_ML_REGION`，然后设置应用默认凭据：

```bash
gcloud auth application-default login
```

对于 Microsoft Foundry，确认设置了 `ANTHROPIC_FOUNDRY_API_KEY`，或使用 Azure CLI 登录以便默认凭据链可以找到您的账户：

```bash
az login
```

如果凭据在终端中有效但在 VS Code 或 JetBrains 扩展中无效，IDE 进程可能未继承 shell 环境。在 IDE 自身的设置中设置提供程序环境变量，或从已导出这些变量的终端启动 IDE。

有关完整的提供程序设置，请参阅 [Amazon Bedrock](/zh/amazon-bedrock)、[Google Vertex AI](/zh/google-vertex-ai) 或 [Microsoft Foundry](/zh/microsoft-foundry)。

## 仍未解决

如果以上方法均未解决您的问题：

1. 检查 [GitHub 仓库](https://github.com/anthropics/claude-code/issues) 了解已知问题，或提交新 issue 并附上操作系统、运行的安装命令和完整的错误输出
2. 如果 `claude --version` 有效但其他地方有问题，运行 `claude doctor` 获取自动化诊断报告
3. 如果可以启动会话，在 Claude Code 内使用 `/feedback` 报告问题
