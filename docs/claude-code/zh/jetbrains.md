> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# JetBrains IDE

> 在 JetBrains IDE 中使用 Claude Code，包括 IntelliJ、PyCharm、WebStorm 等

Claude Code 通过专用插件与 JetBrains IDE 集成，提供交互式 diff 查看、选区上下文共享等功能。

## 支持的 IDE

Claude Code 插件可在大多数 JetBrains IDE 上使用，包括：

* IntelliJ IDEA
* PyCharm
* Android Studio
* WebStorm
* PhpStorm
* GoLand

## 功能

* **快速启动**：使用 `Cmd+Esc`（Mac）或 `Ctrl+Esc`（Windows/Linux）从编辑器直接打开 Claude Code，或点击界面上的 Claude Code 按钮
* **Diff 查看**：代码变更可以直接显示在 IDE 的 diff 查看器中，而不是在终端
* **选区上下文**：IDE 中当前选中或打开的标签会自动共享给 Claude Code。匹配的文件可由 [`Read` deny 规则](/zh/permissions#read-and-edit) 阻止此共享
* **文件引用快捷键**：使用 `Cmd+Option+K`（Mac）或 `Alt+Ctrl+K`（Linux/Windows）插入文件引用，例如 `@src/auth.ts#L1-99`
* **诊断共享**：来自 IDE 的诊断错误（例如 lint 与语法错误）会在你工作时自动共享给 Claude

## 安装

### 在 marketplace 安装

在 JetBrains marketplace 找到并安装 [Claude Code 插件](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-)，然后重启 IDE。

如果还未安装 Claude Code，请参阅[快速入门指南](/zh/quickstart)。


  安装插件后，可能需要完全重启 IDE 才能生效。


## 使用

### 从 IDE 中

在 IDE 的集成终端中运行 `claude`，所有集成功能都会激活。

### 从外部终端

在任意外部终端使用 `/ide` 命令将 Claude Code 连接到你的 JetBrains IDE 并激活全部功能：

```bash
claude
```

```text
/ide
```

如果希望 Claude 访问与 IDE 相同的文件，请从 IDE 项目根目录启动 Claude Code。

## 配置

### Claude Code 设置

通过 Claude Code 的设置配置 IDE 集成：

1. 运行 `claude`
2. 输入 `/config` 命令
3. 把 diff 工具设置为 `auto` 在 IDE 中显示 diff，或设置为 `terminal` 让其留在终端

### 插件设置

通过 **Settings → Tools → Claude Code \[Beta]** 配置 Claude Code 插件：

#### 通用设置

* **Claude command**：指定运行 Claude 的自定义命令，例如 `claude`、`/usr/local/bin/claude` 或 `npx @anthropic-ai/claude-code`
* **Suppress notification for Claude command not found**：跳过找不到 Claude 命令时的通知
* **Enable using Option+Enter for multi-line prompts**：仅 macOS。启用后 Option+Enter 会在 Claude Code 提示中插入换行。如果 Option 键被意外捕获请关闭。需要重启终端。
* **Enable automatic updates**：自动检查并安装插件更新，重启时应用


  WSL 用户：将 Claude command 设置为 `wsl -d Ubuntu -- bash -lic "claude"`（把 `Ubuntu` 替换为你的 WSL 发行版名称）


#### ESC 键配置

如果 ESC 键无法在 JetBrains 终端中中断 Claude Code 操作：

1. 进入 **Settings → Tools → Terminal**
2. 选择以下任一操作：
   * 取消勾选 "Move focus to the editor with Escape"，或者
   * 点击 "Configure terminal keybindings" 并删除 "Switch focus to Editor" 快捷键
3. 应用更改

这样 ESC 键就能正常中断 Claude Code 操作。

## 特殊配置

### 远程开发


  使用 JetBrains Remote Development 时，必须通过 **Settings → Plugin (Host)** 在远程主机上安装该插件。


插件必须安装在远程主机上，而不是本地客户端机器上。

### WSL 配置

如果你在 WSL2 上使用 Claude Code 配合 JetBrains IDE 看到 "No available IDEs detected"，原因通常是 WSL2 的 NAT 网络或 Windows 防火墙阻塞了 WSL2 与运行在 Windows 主机上的 IDE 之间的连接。WSL1 直接使用主机网络，不受影响。

#### 让 WSL2 流量穿过 Windows 防火墙

这是推荐的修复方式，因为它保留了你现有的 WSL2 网络模式。


  
    在 WSL shell 内运行：

    ```bash
    hostname -I
    ```

    记下子网，例如 `172.21.123.45` 属于 `172.21.0.0/16`。
  

  
    以管理员身份打开 PowerShell 并运行下面的命令，根据你的子网调整 IP 范围：

    ```powershell
    New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" -Direction Inbound -Protocol TCP -Action Allow -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
    ```
  

  
    关闭并重新打开两者以使新规则生效。
  


#### 把 WSL2 切换到 mirrored networking

Mirrored networking 需要 Windows 11 22H2 或更高版本。如果在 Windows 10 上，请改用上面的防火墙规则。

把以下内容加入 Windows 用户目录中的 `.wslconfig`：

```ini
[wsl2]
networkingMode=mirrored
```

然后在 PowerShell 中运行 `wsl --shutdown` 重启 WSL。

## 故障排查

### 插件不工作

如果插件已安装，但 IDE 中没有出现 Claude Code 功能：

* 确保从项目根目录运行 Claude Code
* 检查 IDE 设置中已启用 JetBrains 插件
* 完全重启 IDE（可能需要多次）
* 对于 Remote Development，确保插件已安装在远程主机上

### 未检测到 IDE

如果运行 `claude` 显示 "No available IDEs detected"：

* 验证插件已安装并启用
* 完全重启 IDE
* 检查是否在集成终端中运行 Claude Code
* WSL 用户请参考上文 [WSL 配置](#wsl-配置)

### 找不到命令

如果点击 Claude 图标后显示 "command not found"：

1. 在终端运行 `claude --version` 验证 Claude Code 已安装
2. 在插件设置中配置 Claude 命令路径
3. WSL 用户请使用配置部分提到的 WSL 命令格式

## 安全注意事项

当 Claude Code 在 JetBrains IDE 中以 auto-edit 权限运行时，它可能能修改 IDE 自动执行的配置文件，这会增加在 auto-edit 模式下运行 Claude Code 的风险，并可能绕过 Claude Code 对 bash 执行的权限提示。

在 JetBrains IDE 中运行时，请考虑：

* 对编辑使用手动批准模式
* 额外注意，仅对受信任的提示词使用 Claude
* 留意 Claude Code 可以修改哪些文件

如果遇到 IDE 之外的 Claude Code 安装或登录问题，请参阅 [安装与登录故障排查](/zh/troubleshoot-install)。
