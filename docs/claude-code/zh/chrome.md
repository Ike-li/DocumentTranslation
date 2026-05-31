> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件可在深入探索前发现所有可用页面。

# 在Chrome中使用Claude Code（测试版）

> 将Claude Code连接到您的Chrome浏览器，以测试Web应用、使用控制台日志进行调试、自动填写表单以及从网页中提取数据。

Claude Code与[Chrome浏览器中的Claude扩展程序](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)集成，为您提供从CLI或[VS Code扩展](/zh/vs-code#automate-browser-tasks-with-chrome)控制浏览器自动化的能力。构建代码后，无需切换上下文即可在浏览器中进行测试和调试。

Claude会为浏览器任务打开新标签页，并共享您浏览器的登录状态，因此它可以访问您已登录的任何网站。浏览器操作会在一个可见的Chrome窗口中实时运行。当Claude遇到登录页面或验证码时，它会暂停并请求您手动处理。

  Chrome 集成目前处于测试版阶段，仅支持 Google Chrome 和 Microsoft Edge 浏览器。暂不支持 Brave、Arc 或其他基于 Chromium 的浏览器。WSL（Windows Subsystem for Linux）目前也不受支持。

## 功能

当 Chrome 浏览器连接后，您可以在单一工作流中将浏览器操作与编程任务串联：

* **实时调试**：直接读取控制台错误和 DOM 状态，然后修复导致错误的代码
* **设计验证**：根据 Figma 设计稿构建 UI，然后在浏览器中打开以验证是否匹配
* **网络应用测试**：测试表单验证、检查视觉回归或验证用户流程
* **需身份验证的网络应用**：与 Google Docs、Gmail、Notion 或任何您已登录的应用交互，无需 API 连接器
* **数据提取**：从网页中提取结构化信息并保存到本地
* **任务自动化**：自动化重复性浏览器任务，如数据录入、表单填写或多站点工作流
* **会话录制**：将浏览器交互录制为 GIF，用于记录或分享发生的事情

## 前提条件

在 Claude Code 中使用 Chrome 之前，您需要：

* [Google Chrome](https://www.google.com/chrome/) 或 [Microsoft Edge](https://www.microsoft.com/edge) 浏览器
* [Claude in Chrome 扩展](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) 1.0.36 或更高版本，这两款浏览器均可在 Chrome 应用商店获取
* [Claude Code](/zh/quickstart#step-1-install-claude-code) 2.0.73 或更高版本
* 直接的 Anthropic 计划（Pro、Max、Team 或 Enterprise）

  Chrome集成功能无法通过第三方提供商（如Amazon Bedrock、Google Cloud Vertex AI或Microsoft Foundry）获得。如果您仅通过第三方提供商访问Claude，则需要单独的claude.ai账户才能使用此功能。

## 开始使用命令行界面


    使用 `--chrome` 标志启动 Claude Code：
    ```bash
    claude --chrome
    ```
    你也可以在现有会话中通过运行 `/chrome` 来启用 Chrome。



    此示例演示了如何从您的终端或编辑器直接导航到页面、与之交互，并报告其发现内容：
    ```text
    Go to code.claude.com/docs, click on the search box,
    type "hooks", and tell me what results appear
    ```


随时运行 `/chrome` 可以检查连接状态、管理权限、重新连接扩展，或选择要使用的连接浏览器。如果在启动浏览器操作时连接了多个浏览器，Claude会提示您选择一个。

对于 VS Code，请参阅 [VS Code 中的浏览器自动化](/zh/vs-code#automate-browser-tasks-with-chrome)。

### 默认启用 Chrome

为了避免每次会话都传递 `--chrome`，请运行 `/chrome` 并选择“默认启用”。

在 [VS Code 扩展](/zh/vs-code#automate-browser-tasks-with-chrome) 中，只要安装了 Chrome 扩展，Chrome 就可用。无需额外标志。

  在 CLI 中默认启用 Chrome 会增加上下文使用量，因为浏览器工具会始终加载。若您发现上下文消耗增加，请禁用此设置，仅在需要时使用 `--chrome`。

### 管理网站权限

网站级权限继承自 Chrome 扩展。请在 Chrome 扩展设置中管理权限，以控制 Claude 可以在哪些网站上浏览、点击和输入。

## 工作流示例

这些示例展示了常见的浏览器操作与编码任务结合的方式。运行 `/mcp` 并选择 `claude-in-chrome` 以查看可用浏览器工具的完整列表。

### 测试本地 Web 应用

在开发 Web 应用时，请 Claude 验证您的更改是否正常运行：
```text
I just updated the login form validation. Can you open localhost:3000,
try submitting the form with invalid data, and check if the error
messages appear correctly?
```
Claude 导航至您的本地服务器，与表单进行交互，并报告其观察结果。

### 使用控制台日志进行调试

Claude 可以读取控制台输出以帮助诊断问题。请告诉 Claude 要查找什么模式，而不是要求获取所有控制台输出，因为日志可能非常冗长：
```text
Open the dashboard page and check the console for any errors when
the page loads.
```
Claude 可以读取控制台信息，并能根据特定模式或错误类型进行筛选。

### 自动化填写表单

加快重复性数据录入任务的速度：
```text
I have a spreadsheet of customer contacts in contacts.csv. For each row,
go to the CRM at crm.example.com, click "Add Contact", and fill in the
name, email, and phone fields.
```
Claude 读取您的本地文件，导航网页界面，并为每条记录输入数据。

### 在 Google Docs 中草拟内容

无需 API 设置，即可使用 Claude 直接在文档中撰写内容：
```text
Draft a project update based on the recent commits and add it to my
Google Doc at docs.google.com/document/d/abc123
```
Claude 打开文档，点击进入编辑器并输入内容。此功能适用于您已登录的任何网页应用：Gmail、Notion、Sheets 等。

### 从网页提取数据

从网站中拉取结构化信息：
```text
Go to the product listings page and extract the name, price, and
availability for each item. Save the results as a CSV file.
```
Claude 导航到页面，读取内容，并将数据编译成结构化格式。

### 运行多站点工作流

协调跨多个网站的任务：
```text
Check my calendar for meetings tomorrow, then for each meeting with
an external attendee, look up their company website and add a note
about what they do.
```
Claude 可跨标签页工作，以收集信息并完成工作流程。

### 录制演示 GIF

创建浏览器交互的可分享录制内容：
```text
Record a GIF showing how to complete the checkout flow, from adding
an item to the cart through to the confirmation page.
```
Claude 记录交互序列并将其保存为 GIF 文件。

## 故障排除

### 未检测到扩展

如果 Claude Code 显示"Chrome extension not detected"（未检测到 Chrome 扩展）：

1.  在 `chrome://extensions` 中确认 Chrome 扩展已安装并启用。
2.  通过运行 `claude --version` 确认 Claude Code 为最新版本。
3.  检查 Chrome 是否正在运行。
4.  运行 `/chrome` 并选择"Reconnect extension"以重新建立连接。
5.  如果问题仍然存在，请重启 Claude Code 和 Chrome。

首次启用 Chrome 集成时，Claude Code 会安装一个本地消息传递主机配置文件。Chrome 在启动时会读取此文件，因此如果第一次尝试时未检测到扩展，请重启 Chrome 以加载新配置。

如果连接仍然失败，请确认主机配置文件存在于以下位置：

对于 Chrome：

*   **macOS**: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
*   **Linux**: `~/.config/google-chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
*   **Windows**: 在 Windows 注册表中检查 `HKCU\Software\Google\Chrome\NativeMessagingHosts\`

对于 Edge：

*   **macOS**: `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
*   **Linux**: `~/.config/microsoft-edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
*   **Windows**: 在 Windows 注册表中检查 `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\`

### 浏览器无响应

如果 Claude 的浏览器命令停止工作：

1.  检查是否有模态对话框（alert、confirm、prompt）阻塞了页面。JavaScript 对话框会阻止浏览器事件并使 Claude 无法接收命令。请手动关闭对话框，然后指示 Claude 继续。
2.  要求 Claude 打开一个新标签页并重试。
3.  通过在 `chrome://extensions` 中禁用并重新启用 Chrome 扩展来重启它。

### 长时间会话期间连接中断

Chrome 扩展的服务工作线程可能会在长时间会话期间进入空闲状态，从而破坏连接。如果浏览器工具在一段时间不活动后停止工作，请运行 `/chrome` 并选择"Reconnect extension"。

### Windows 特定问题

在 Windows 上，您可能会遇到：

*   **命名管道冲突 (EADDRINUSE)**：如果有另一个进程正在使用相同的命名管道，请重启 Claude Code。关闭任何其他可能正在使用 Chrome 的 Claude Code 会话。
*   **本地消息传递主机错误**：如果本地消息传递主机在启动时崩溃，请尝试重新安装 Claude Code 以重新生成主机配置。

### 常见错误消息

这些是最常遇到的错误及其解决方法：

| 错误信息                           | 原因                                             | 解决方法                                                              |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| "Browser extension is not connected" | 本地消息传递主机无法连接到扩展                   | 重启 Chrome 和 Claude Code，然后运行 `/chrome` 进行重新连接            |
| "Extension not detected"             | Chrome 扩展未安装或已禁用                        | 在 `chrome://extensions` 中安装或启用扩展                              |
| "No tab available"                   | Claude 在标签页准备就绪之前尝试操作              | 要求 Claude 创建一个新标签页并重试                                      |
| "Receiving end does not exist"       | 扩展的服务工作线程进入空闲状态                   | 运行 `/chrome` 并选择"Reconnect extension"                             |

## 另请参阅

*   [计算机使用](/zh/computer-use)：当任务无法在浏览器中完成时控制原生 macOS 应用
*   [在 VS Code 中使用 Claude Code](/zh/vs-code#automate-browser-tasks-with-chrome)：VS Code 扩展中的浏览器自动化
*   [CLI 参考](/zh/cli-reference)：命令行标志，包括 `--chrome`
*   [常见工作流](/zh/common-workflows)：使用 Claude Code 的更多方法
*   [数据与隐私](/zh/data-usage)：Claude Code 如何处理您的数据
*   [在 Chrome 中使用 Claude 入门](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome)：Chrome 扩展的完整文档，包括快捷键、计划和权限