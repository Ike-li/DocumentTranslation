> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 故障排除

> 修复 Claude Code 中的高 CPU 或内存使用、挂起、自动压缩抖动和搜索问题，并找到对应页面解决其他问题。

本页面涵盖 Claude Code 运行后的性能、稳定性和搜索问题。对于其他问题，请从与你卡住的位置匹配的页面开始：

| 症状 | 前往 |
| :--- | :--- |
| `command not found`、安装失败、PATH 问题、`EACCES`、TLS 错误 | [排查安装和登录问题](/zh/troubleshoot-install) |
| 登录循环、OAuth 错误、`403 Forbidden`、"organization disabled"、Bedrock/Vertex/Foundry 凭据 | [排查安装和登录问题](/zh/troubleshoot-install#login-and-authentication) |
| 设置未生效、钩子未触发、MCP 服务器未加载 | [调试你的配置](/zh/debug-your-config) |
| `API Error: 5xx`、`529 Overloaded`、`429`、请求验证错误 | [错误参考](/zh/errors) |
| `model not found` 或 `you may not have access to it` | [错误参考](/zh/errors#theres-an-issue-with-the-selected-model) |
| VS Code 扩展无法连接或检测到 Claude | [VS Code 集成](/zh/vs-code#fix-common-issues) |
| JetBrains 插件或 IDE 未检测到 | [JetBrains 集成](/zh/jetbrains#troubleshooting) |
| 高 CPU 或内存使用、响应缓慢、挂起、搜索找不到文件 | 下方的[性能与稳定性](#性能与稳定性) |

如果不确定哪个适用，请在 Claude Code 内运行 `/doctor` 来自动检查你的安装、设置、MCP 服务器和上下文使用情况。如果 `claude` 完全无法启动，请在 shell 中运行 `claude doctor`。

## 性能与稳定性

以下章节涵盖与资源使用、响应性和搜索行为相关的问题。

### 高 CPU 或内存使用

Claude Code 设计用于兼容大多数开发环境，但在处理大型代码库时可能会消耗大量资源。如果你遇到性能问题：

1. 定期使用 `/compact` 来减少上下文大小
2. 在主要任务之间关闭并重启 Claude Code
3. 考虑将大型构建目录添加到 `.gitignore` 文件中

如果执行上述步骤后内存使用仍然居高不下，请运行 `/heapdump` 将 JavaScript 堆快照和内存分解写入 `~/Desktop`。在没有 Desktop 文件夹的 Linux 系统上，文件将写入你的主目录。

分解显示驻留集大小、JS 堆、数组缓冲区和未计入的原生内存，这有助于确定增长是来自 JavaScript 对象还是原生代码。要检查保留器，请在 Chrome DevTools 的 Memory → Load 中打开 `.heapsnapshot` 文件。在 [GitHub](https://github.com/anthropics/claude-code/issues) 上报告内存问题时请附上这两个文件。

### 自动压缩因抖动错误而停止

如果你看到 `Autocompact is thrashing: the context refilled to the limit...`，说明自动压缩成功了，但某个文件或工具输出立即多次重新填满了上下文窗口。Claude Code 会停止重试，以避免在没有进展的循环中浪费 API 调用。

恢复方法：

1. 让 Claude 以更小的块读取超大文件，例如特定行范围或函数，而不是整个文件
2. 使用 `/compact` 并指定丢弃大型输出的焦点，例如 `/compact keep only the plan and the diff`
3. 将大文件工作移至[子代理](/zh/sub-agents)，使其在单独的上下文窗口中运行
4. 如果之前的对话不再需要，运行 `/clear`

### 命令挂起或冻结

如果 Claude Code 似乎无响应：

1. 按 Ctrl+C 尝试取消当前操作
2. 如果仍然无响应，你可能需要关闭终端并重启

重启不会丢失你的对话。在同一目录下运行 `claude --resume` 即可恢复会话。

### 搜索和发现问题

如果搜索工具、`@file` 引用、自定义代理或自定义技能找不到文件，可能是内置的 `ripgrep` 二进制文件无法在你的系统上运行。请安装你平台的 `ripgrep` 包，并告知 Claude Code 使用它：

#### macOS

```bash
brew install ripgrep
```

#### Ubuntu/Debian

```bash
sudo apt install ripgrep
```

#### Alpine

```bash
apk add ripgrep
```

#### Arch

```bash
pacman -S ripgrep
```

#### Windows

```powershell
winget install BurntSushi.ripgrep.MSVC
```

然后在你的[环境变量](/zh/env-vars)中设置 `USE_BUILTIN_RIPGREP=0`。

### WSL 上搜索结果缓慢或不完整

在 [WSL 上跨文件系统工作](https://learn.microsoft.com/en-us/windows/wsl/filesystems)时的磁盘读取性能损耗，可能导致在 WSL 上使用 Claude Code 时匹配结果少于预期。搜索仍然可用，但返回的结果比原生文件系统上少。

在这种情况下 `/doctor` 会显示搜索正常。

**解决方案：**

1. **提交更具体的搜索**：通过指定目录或文件类型来减少搜索的文件数量："在 auth-service 包中搜索 JWT 验证逻辑" 或 "查找 JS 文件中 md5 哈希的使用"。

2. **将项目移至 Linux 文件系统**：如果可能，确保你的项目位于 Linux 文件系统（`/home/`）上，而不是 Windows 文件系统（`/mnt/c/`）上。

3. **改用原生 Windows**：考虑在 Windows 上原生运行 Claude Code，而不是通过 WSL，以获得更好的文件系统性能。

## 获取更多帮助

如果你遇到此处未涵盖的问题：

1. 运行 `/doctor` 一次性检查安装健康状况、设置有效性、MCP 配置和上下文使用情况
2. 在 Claude Code 中使用 `/feedback` 命令直接向 Anthropic 报告问题
3. 查看 [GitHub 仓库](https://github.com/anthropics/claude-code)了解已知问题
4. 直接向 Claude 询问其功能和特性。Claude 内置了对其文档的访问。
