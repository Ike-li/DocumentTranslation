> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 在 VS Code 中使用 Claude Code

> 安装和配置 VS Code 的 Claude Code 扩展。获取 AI 编程辅助，包括内联差异对比、@-提及、计划审查和键盘快捷键。

<img src="https://mintcdn.com/claude-code/-YhHHmtSxwr7W8gy/images/vs-code-extension-interface.jpg?fit=max&auto=format&n=-YhHHmtSxwr7W8gy&q=85&s=300652d5678c63905e6b0ea9e50835f8" alt="VS Code editor with the Claude Code extension panel open on the right side, showing a conversation with Claude" width="2500" height="1155" data-path="images/vs-code-extension-interface.jpg" />

VS Code 扩展为 Claude Code 提供了原生图形界面，直接集成到你的 IDE 中。这是在 VS Code 中使用 Claude Code 的推荐方式。

使用该扩展，你可以在接受之前审查和编辑 Claude 的计划、在编辑时自动接受更改、从选中内容中 @-提及特定行范围的文件、访问对话历史记录，以及在单独的标签页或窗口中打开多个对话。

## 前提条件

安装前，请确保你已具备：

* VS Code 1.98.0 或更高版本
* Anthropic 账户（首次打开扩展时需要登录）。如果你使用 Amazon Bedrock 或 Google Vertex AI 等第三方提供商，请参阅[使用第三方提供商](#使用第三方提供商)。

> **提示**
> 该扩展包含 CLI（命令行界面），你可以从 VS Code 的集成终端访问它以使用高级功能。详情请参阅 [VS Code 扩展与 Claude Code CLI 对比](#vs-code-扩展与-claude-code-cli-对比)。

## 安装扩展

点击下方链接直接为你的 IDE 安装：

* [为 VS Code 安装](vscode:extension/anthropic.claude-code)
* [为 Cursor 安装](cursor:extension/anthropic.claude-code)

或者在 VS Code 中按 `Cmd+Shift+X`（Mac）或 `Ctrl+Shift+X`（Windows/Linux）打开扩展视图，搜索 "Claude Code"，然后点击 **Install**。

该扩展也可在其他 VS Code 分支（如 Windsurf 或 Kiro）中安装。在编辑器的扩展视图中搜索 "Claude Code"，或从 [Open VSX 注册表](https://open-vsx.org/extension/Anthropic/claude-code) 安装。如果你的编辑器无法安装扩展，请在其集成终端中运行 `claude`。[CLI](/zh/quickstart) 可在任何终端中运行。

> **注意**
> 如果安装后扩展未显示，请重启 VS Code 或从命令面板运行 "Developer: Reload Window"。

## 快速上手

安装完成后，你可以通过 VS Code 界面开始使用 Claude Code：

1. **打开 Claude Code 面板**
    在 VS Code 中，Spark 图标表示 Claude Code：<img src="https://mintcdn.com/claude-code/c5r9_6tjPMzFdDDT/images/vs-code-spark-icon.svg?fit=max&auto=format&n=c5r9_6tjPMzFdDDT&q=85&s=3ca45e00deadec8c8f4b4f807da94505" alt="Spark icon" style={{display: "inline", height: "0.85em", verticalAlign: "middle"}} width="16" height="16" data-path="images/vs-code-spark-icon.svg" />

    打开 Claude 最快的方式是点击 **Editor Toolbar**（编辑器右上角）中的 Spark 图标。该图标仅在你打开文件时才会显示。

    <img src="https://mintcdn.com/claude-code/mfM-EyoZGnQv8JTc/images/vs-code-editor-icon.png?fit=max&auto=format&n=mfM-EyoZGnQv8JTc&q=85&s=eb4540325d94664c51776dbbfec4cf02" alt="VS Code editor showing the Spark icon in the Editor Toolbar" width="2796" height="734" data-path="images/vs-code-editor-icon.png" />

    打开 Claude Code 的其他方式：

    * **Activity Bar**：点击左侧边栏中的 Spark 图标打开会话列表。点击任意会话将其作为完整的编辑器标签页打开，或开始新的会话。该图标始终在 Activity Bar 中可见。
    * **Command Palette**：`Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows/Linux），输入 "Claude Code"，然后选择 "Open in New Tab" 等选项。
    * **Status Bar**：点击窗口右下角的 **✱ Claude Code**。即使没有打开文件也可以使用。

    你可以拖动 Claude 面板将其重新定位到 VS Code 中的任意位置。详情请参阅[自定义工作流](#自定义工作流)。

2. **登录**
    首次打开面板时，会显示登录界面。点击 **Sign in** 并在浏览器中完成授权。

    如果之后看到 **Not logged in · Please run /login**，扩展会自动重新打开登录界面。如果未出现，请从命令面板中使用 **Developer: Reload Window** 重新加载窗口。

    如果你在 shell 中设置了 `ANTHROPIC_API_KEY` 但仍看到登录提示，VS Code 可能没有继承你的 shell 环境。使用 `code .` 从终端启动 VS Code 以继承环境变量，或改用 Claude 账户登录。

    登录后，会出现 **Learn Claude Code** 清单。点击 **Show me** 逐项学习，或点击 X 关闭。如需再次打开，在 VS Code 设置中的 Extensions → Claude Code 下取消勾选 **Hide Onboarding**。

3. **发送提示词**
    请 Claude 帮助处理你的代码或文件，无论是解释工作原理、调试问题还是进行修改。

    > **提示**
    > Claude 会自动看到你选中的文本。按 `Option+K`（Mac）/ `Alt+K`（Windows/Linux）还可以在提示词中插入 @-提及引用（如 `@file.ts#5-10`）。

    以下是询问文件中特定行的示例：

    <img src="https://mintcdn.com/claude-code/FVYz38sRY-VuoGHA/images/vs-code-send-prompt.png?fit=max&auto=format&n=FVYz38sRY-VuoGHA&q=85&s=ede3ed8d8d5f940e01c5de636d009cfd" alt="VS Code editor with lines 2-3 selected in a Python file, and the Claude Code panel showing a question about those lines with an @-mention reference" width="3288" height="1876" data-path="images/vs-code-send-prompt.png" />

4. **审查更改**
    当 Claude 想要编辑文件时，会显示原始内容和拟议更改的并排比较，然后请求权限。你可以接受、拒绝或告诉 Claude 改做其他操作。如果你在接受之前直接在差异视图中编辑了拟议内容，Claude 会知道你修改了它，因此不会假设文件与其原始拟议一致。

    <img src="https://mintcdn.com/claude-code/FVYz38sRY-VuoGHA/images/vs-code-edits.png?fit=max&auto=format&n=FVYz38sRY-VuoGHA&q=85&s=e005f9b41c541c5c7c59c082f7c4841c" alt="VS Code showing a diff of Claude's proposed changes with a permission prompt asking whether to make the edit" width="3292" height="1876" data-path="images/vs-code-edits.png" />

有关使用 Claude Code 的更多想法，请参阅[常见工作流](/zh/common-workflows)。

> **提示**
> 从命令面板运行 "Claude Code: Open Walkthrough" 获取基础知识的引导之旅。

## 使用提示词框

提示词框支持多种功能：

* **权限模式**：点击提示词框底部的模式指示器切换模式。在普通模式下，Claude 在每次操作前都会请求权限。在计划模式下，Claude 描述将要执行的操作并等待批准后再进行更改。VS Code 会自动将计划作为完整的 Markdown 文档打开，你可以在其中添加行内注释以在 Claude 开始之前提供反馈。在自动接受模式下，Claude 无需询问即可进行编辑。在 VS Code 设置中的 `claudeCode.initialPermissionMode` 中设置默认值。
* **命令菜单**：点击 `/` 或输入 `/` 打开命令菜单。选项包括附加文件、切换模型、切换扩展思维、查看计划使用量（`/usage`）和启动 [Remote Control](/zh/remote-control) 会话（`/remote-control`）。自定义部分提供对 MCP 服务器、钩子、内存、权限和插件的访问。带有终端图标的项目在集成终端中打开。
* **上下文指示器**：提示词框显示你正在使用的 Claude 上下文窗口的比例。Claude 会在需要时自动压缩，你也可以手动运行 `/compact`。
* **扩展思维**：让 Claude 花更多时间推理复杂问题。通过命令菜单（`/`）切换开启。Claude 的推理以折叠块的形式出现在对话中：点击块可阅读，或按 `Ctrl+O` 展开或折叠会话中的所有思维块。详情请参阅[扩展思维](/zh/model-config#extended-thinking)。
* **多行输入**：按 `Shift+Enter` 添加新行而不发送。这在问题对话框的"Other"自由文本输入中也同样有效。

### 引用文件和文件夹

使用 @-提及为 Claude 提供特定文件或文件夹的上下文。当你输入 `@` 后跟文件或文件夹名时，Claude 会读取该内容并可以回答相关问题或进行更改。Claude Code 支持模糊匹配，因此你可以输入部分名称来查找所需内容：

```text
> Explain the logic in @auth (fuzzy matches auth.js, AuthService.ts, etc.)
> What's in @src/components/ (include a trailing slash for folders)
```

对于大型 PDF，你可以让 Claude 阅读特定页面而非整个文件：单页、页面范围（如 1-10 页）或开放范围（如第 3 页起）。

当你在编辑器中选中文本时，Claude 可以自动看到你高亮的代码。提示词框底部会显示选中的行数。按 `Option+K`（Mac）/ `Alt+K`（Windows/Linux）插入包含文件路径和行号的 @-提及（如 `@app.ts#5-10`）。点击选择指示器可切换 Claude 是否能看到你高亮的文本 — 眼睛划线图标表示选中内容对 Claude 隐藏。

你也可以在将文件拖入提示词框时按住 `Shift` 以将其作为附件添加。点击附件上的 X 可将其从上下文中移除。

### 恢复过去的对话

点击 Claude Code 面板顶部的 **Session history** 按钮访问你的对话历史记录。你可以按关键字搜索或按时间浏览（今天、昨天、过去 7 天等）。点击任意对话可使用完整的消息历史记录恢复。新会话会根据你的第一条消息生成 AI 标题。将鼠标悬停在会话上可显示重命名和移除操作：重命名以给它一个描述性标题，或移除以从列表中删除。有关恢复会话的更多信息，请参阅[管理会话](/zh/sessions)。

### 从 Claude.ai 恢复远程会话

如果你使用 [Web 版 Claude Code](/zh/claude-code-on-the-web)，可以直接在 VS Code 中恢复这些远程会话。这需要使用 **Claude.ai Subscription** 登录，而非 Anthropic Console。

1. **打开会话历史记录**
    点击 Claude Code 面板顶部的 **Session history** 按钮。

2. **选择 Remote 标签页**
    对话框显示两个标签页：Local 和 Remote。点击 **Remote** 查看来自 claude.ai 的会话。

3. **选择要恢复的会话**
    浏览或搜索你的远程会话。点击任意会话可将其下载并在本地继续对话。

> **注意**
> 只有使用 GitHub 仓库启动的 Web 会话才会出现在 Remote 标签页中。恢复会在本地加载对话历史记录；更改不会同步回 claude.ai。

## 自定义工作流

一旦你开始运行，可以重新定位 Claude 面板、运行多个会话或切换到终端模式。

### 选择 Claude 的位置

你可以拖动 Claude 面板将其重新定位到 VS Code 中的任意位置。抓住面板的标签页或标题栏并将其拖动到：

* **Secondary sidebar**：窗口右侧。在你编码时保持 Claude 可见。
* **Primary sidebar**：左侧边栏，包含 Explorer、Search 等图标。
* **Editor area**：将 Claude 作为标签页与你的文件并排打开。适合辅助任务。

> **提示**
> 将边栏用于你的主 Claude 会话，并打开额外的标签页用于辅助任务。Claude 会记住你的首选位置。Activity Bar 中的会话列表图标与 Claude 面板是分开的：会话列表始终在 Activity Bar 中可见，而 Claude 面板图标仅在面板停靠在左侧边栏时才会出现在那里。

### 运行多个对话

从命令面板使用 **Open in New Tab** 或 **Open in New Window** 启动额外的对话。每个对话维护自己的历史记录和上下文，允许你并行处理不同任务。

使用标签页时，Spark 图标上的小色点表示状态：蓝色表示权限请求待处理，橙色表示 Claude 在标签页隐藏时完成了任务。

### 切换到终端模式

默认情况下，扩展会打开图形聊天面板。如果你更喜欢 CLI 风格的界面，请打开 [Use Terminal 设置](vscode://settings/claudeCode.useTerminal) 并勾选复选框。

你也可以打开 VS Code 设置（Mac 上 `Cmd+,` 或 Windows/Linux 上 `Ctrl+,`），进入 Extensions → Claude Code，然后勾选 **Use Terminal**。

## 管理插件

VS Code 扩展包含用于安装和管理[插件](/zh/plugins)的图形界面。在提示词框中输入 `/plugins` 打开 **Manage plugins** 界面。

### 安装插件

插件对话框显示两个标签页：**Plugins** 和 **Marketplaces**。

在 Plugins 标签页中：

* **Installed plugins** 显示在顶部，带有启用或禁用的切换开关
* 来自你配置的市场的 **Available plugins** 显示在下方
* 搜索以按名称或描述过滤插件
* 点击任意可用插件的 **Install**

安装插件时，选择安装范围：

* **Install for you**：在你的所有项目中可用（用户范围）
* **Install for this project**：与项目协作者共享（项目范围）
* **Install locally**：仅限你使用，仅限此仓库（本地范围）

### 管理市场

切换到 **Marketplaces** 标签页以添加或移除插件来源：

* 输入 GitHub 仓库、URL 或本地路径以添加新市场
* 点击刷新图标更新市场的插件列表
* 点击垃圾桶图标移除市场

更改后，横幅会提示你重启 Claude Code 以应用更新。

> **注意**
> VS Code 中的插件管理在底层使用相同的 CLI 命令。你在扩展中配置的插件和市场在 CLI 中也可用，反之亦然。

有关插件系统的更多信息，请参阅[插件](/zh/plugins)和[插件市场](/zh/plugin-marketplaces)。

## 使用 Chrome 自动化浏览器任务

将 Claude 连接到你的 Chrome 浏览器，以测试 Web 应用、使用控制台日志调试以及自动化浏览器工作流，无需离开 VS Code。这需要 [Claude in Chrome 扩展](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) 1.0.36 或更高版本。

在提示词框中输入 `@browser` 后跟你希望 Claude 执行的操作：

```text
@browser go to localhost:3000 and check the console for errors
```

你也可以打开附件菜单选择特定的浏览器工具，如打开新标签页或读取页面内容。

Claude 会为浏览器任务打开新标签页并共享你浏览器的登录状态，因此它可以访问你已登录的任何网站。

有关设置说明、完整功能列表和故障排除，请参阅[在 Chrome 中使用 Claude Code](/zh/chrome)。

## VS Code 命令和快捷键

打开命令面板（Mac 上 `Cmd+Shift+P` 或 Windows/Linux 上 `Ctrl+Shift+P`）并输入 "Claude Code" 查看 Claude Code 扩展的所有可用 VS Code 命令。

某些快捷键取决于哪个面板处于"聚焦"状态（接收键盘输入）。当光标在代码文件中时，编辑器处于聚焦状态。当光标在 Claude 的提示词框中时，Claude 处于聚焦状态。使用 `Cmd+Esc` / `Ctrl+Esc` 在两者之间切换。

> **注意**
> 这些是用于控制扩展的 VS Code 命令。并非所有内置 Claude Code 命令都在扩展中可用。详情请参阅 [VS Code 扩展与 Claude Code CLI 对比](#vs-code-扩展与-claude-code-cli-对比)。

| 命令                       | 快捷键                                                    | 描述                                                                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus Input                | `Cmd+Esc` (Mac) / `Ctrl+Esc` (Windows/Linux)             | 在编辑器和 Claude 之间切换焦点                                                                                                                                                                        |
| Open in Side Bar           | -                                                        | 在左侧边栏中打开 Claude                                                                                                                                                                               |
| Open in Terminal           | -                                                        | 在终端模式下打开 Claude                                                                                                                                                                                  |
| Open in New Tab            | `Cmd+Shift+Esc` (Mac) / `Ctrl+Shift+Esc` (Windows/Linux) | 将新对话作为编辑器标签页打开                                                                                                                                                                      |
| Open in New Window         | -                                                        | 在单独的窗口中打开新对话                                                                                                                                                                  |
| New Conversation           | `Cmd+N` (Mac) / `Ctrl+N` (Windows/Linux)                 | 开始新对话。需要 Claude 处于聚焦状态且 `enableNewConversationShortcut` 设为 `true`                                                                                                     |
| Reopen Closed Session      | `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Windows/Linux)     | 重新打开最近关闭的 Claude 会话标签页。当最后关闭的标签页不是 Claude 会话时，会转到 VS Code 的正常重新打开已关闭编辑器命令。使用 `enableReopenClosedSessionShortcut` 禁用 |
| Insert @-Mention Reference | `Option+K` (Mac) / `Alt+K` (Windows/Linux)               | 插入对当前文件和选中内容的引用（需要编辑器处于聚焦状态）                                                                                                                          |
| Show Logs                  | -                                                        | 查看扩展调试日志                                                                                                                                                                                     |
| Logout                     | -                                                        | 退出 Anthropic 账户                                                                                                                                                                            |

### 从其他工具启动 VS Code 标签页

该扩展在 `vscode://anthropic.claude-code/open` 注册了一个 URI 处理器。使用它从你自己的工具（shell 别名、浏览器书签或任何可以打开 URL 的脚本）打开新的 Claude Code 标签页。如果 VS Code 尚未运行，打开 URL 会先启动它。如果 VS Code 已经运行，URL 会在当前聚焦的窗口中打开。

使用操作系统的 URL 打开器调用处理器。

**macOS:**

```bash
open "vscode://anthropic.claude-code/open"
```

**Linux:**

```bash
xdg-open "vscode://anthropic.claude-code/open"
```

**Windows:**

在 PowerShell 中：

```powershell
Start-Process "vscode://anthropic.claude-code/open"
```

在 `cmd.exe` 中，`start` 将其第一个带引号的参数视为窗口标题，因此在 URL 之前传递一个空标题：

```cmd
start "" "vscode://anthropic.claude-code/open"
```

处理器接受两个可选查询参数：

| 参数      | 描述                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`  | 预填在提示词框中的文本。必须进行 URL 编码。提示词会被预填但不会自动提交。                                                                                                                                                                                                                                                             |
| `session` | 要恢复的会话 ID，而非开始新对话。该会话必须属于当前在 VS Code 中打开的工作区。如果未找到该会话，则会开始新的对话。如果该会话已在标签页中打开，则会聚焦该标签页。要以编程方式获取会话 ID，请参阅[继续对话](/zh/headless#continue-conversations)。 |

例如，打开一个预填了 "review my changes" 的标签页：

```text
vscode://anthropic.claude-code/open?prompt=review%20my%20changes
```

要启动终端会话而非 VS Code 标签页，请使用 CLI 的 `claude-cli://` 处理器。参阅[从链接启动会话](/zh/deep-links)。

## 配置设置

扩展有两种类型的设置：

* **VS Code 中的扩展设置**：控制扩展在 VS Code 中的行为。使用 `Cmd+,`（Mac）或 `Ctrl+,`（Windows/Linux）打开，然后进入 Extensions → Claude Code。你也可以输入 `/` 并选择 **General Config** 打开设置。
* **`~/.claude/settings.json` 中的 Claude Code 设置**：在扩展和 CLI 之间共享。用于允许的命令、环境变量、钩子和 MCP 服务器。详情请参阅[设置](/zh/settings)。

> **提示**
> 在你的 `settings.json` 中添加 `"$schema": "https://json.schemastore.org/claude-code-settings.json"` 以在 VS Code 中直接获取所有可用设置的自动完成和内联验证。

### 扩展设置

| 设置                              | 默认值    | 描述                                                                                                                                                                                                                   |
| --------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useTerminal`                     | `false`   | 以终端模式而非图形面板启动 Claude                                                                                                                                                                     |
| `initialPermissionMode`          | `default` | 控制新对话的审批提示：`default`、`plan`、`acceptEdits` 或 `bypassPermissions`。参阅[权限模式](/zh/permission-modes)。                                                                      |
| `preferredLocation`              | `panel`   | Claude 打开的位置：`sidebar`（右侧）或 `panel`（新标签页）                                                                                                                                                                    |
| `autosave`                       | `true`    | 在 Claude 读取或写入文件之前自动保存                                                                                                                                                                            |
| `useCtrlEnterToSend`             | `false`   | 使用 Ctrl/Cmd+Enter 而非 Enter 发送提示词                                                                                                                                                                           |
| `enableNewConversationShortcut`  | `false`   | 启用 Cmd/Ctrl+N 开始新对话                                                                                                                                                                                 |
| `enableReopenClosedSessionShortcut` | `true` | 使用 Cmd/Ctrl+Shift+T 重新打开最近关闭的 Claude 会话标签页。当最后关闭的标签页不是 Claude 会话时，快捷键会运行 VS Code 的正常重新打开已关闭编辑器命令。                        |
| `hideOnboarding`                 | `false`   | 隐藏入门清单（毕业帽图标）                                                                                                                                                                           |
| `respectGitIgnore`               | `true`    | 从文件搜索中排除 .gitignore 模式                                                                                                                                                                                |
| `usePythonEnvironment`           | `true`    | 运行 Claude 时激活工作区的 Python 环境。需要 Python 扩展。                                                                                                                               |
| `environmentVariables`           | `[]`      | 为 Claude 进程设置环境变量。共享配置请使用 Claude Code 设置。                                                                                                                         |
| `disableLoginPrompt`             | `false`   | 跳过认证提示（用于第三方提供商设置）                                                                                                                                                                 |
| `allowDangerouslySkipPermissions` | `false`  | 在模式选择器中添加 Bypass permissions。仅在没有互联网访问的沙箱中使用。                                                                                                                               |
| `claudeProcessWrapper`           | -         | 用于启动 Claude 进程的可执行文件。存在时会将捆绑的二进制路径作为参数传递。如果扩展构建未包含你平台的二进制文件，请将其设置为单独安装的 `claude` 二进制文件。 |

## VS Code 扩展与 Claude Code CLI 对比

Claude Code 同时提供 VS Code 扩展（图形面板）和 CLI（终端中的命令行界面）。某些功能仅在 CLI 中可用。如果你需要仅限 CLI 的功能，请在 VS Code 的集成终端中运行 `claude`。

| 功能                | CLI                 | VS Code 扩展                                                                    |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| 命令和技能          | [全部](/zh/commands) | 子集（输入 `/` 查看可用项）                                                   |
| MCP 服务器配置       | 是                  | 部分（通过 CLI 添加服务器；在聊天面板中使用 `/mcp` 管理现有服务器） |
| 检查点              | 是                  | 是                                                                                  |
| `!` bash 快捷方式    | 是                  | 否                                                                                   |
| Tab 补全            | 是                  | 否                                                                                   |

### 使用检查点回退

VS Code 扩展支持检查点，它跟踪 Claude 的文件编辑并允许你回退到之前的状态。将鼠标悬停在任何消息上可显示回退按钮，然后从三个选项中选择：

* **Fork conversation from here**：从此消息开始新的对话分支，同时保持所有代码更改不变
* **Rewind code to here**：将文件更改恢复到对话中的此点，同时保留完整的对话历史
* **Fork conversation and rewind code**：开始新的对话分支并将文件更改恢复到此点

有关检查点工作原理及其限制的完整详情，请参阅[检查点](/zh/checkpointing)。

### 在 VS Code 中运行 CLI

要在 VS Code 中使用 CLI，请打开集成终端（Windows/Linux 上 `` Ctrl+` `` 或 Mac 上 `` Cmd+` ``）并运行 `claude`。CLI 会自动与你的 IDE 集成，提供差异查看和诊断共享等功能。

如果使用外部终端，请在 Claude Code 中运行 `/ide` 以将其连接到 VS Code。

### 在扩展和 CLI 之间切换

扩展和 CLI 共享相同的对话历史记录。要在 CLI 中继续扩展对话，请在终端中运行 `claude --resume`。这会打开一个交互式选择器，你可以在其中搜索并选择对话。

### 在提示词中包含终端输出

使用 `@terminal:name` 在提示词中引用终端输出，其中 `name` 是终端的标题。这让 Claude 可以看到命令输出、错误消息或日志，无需复制粘贴。

### 监控后台进程

当 Claude 运行长时间运行的命令时，扩展会 在状态栏中显示进度。但是，与 CLI 相比，后台任务的可见性有限。为了更好的可见性，请让 Claude 输出命令以便你可以在 VS Code 的集成终端中运行它。

### 使用 MCP 连接外部工具

MCP（Model Context Protocol）服务器为 Claude 提供对外部工具、数据库和 API 的访问。

要添加 MCP 服务器，请打开集成终端（`` Ctrl+` `` 或 `` Cmd+` ``）并运行 `claude mcp add`。以下示例添加了 GitHub 的远程 MCP 服务器，它使用作为头部传递的[个人访问令牌](https://github.com/settings/personal-access-tokens)进行认证：

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

配置完成后，让 Claude 使用这些工具（例如 "Review PR #456"）。

要在不离开 VS Code 的情况下管理 MCP 服务器，请在聊天面板中输入 `/mcp`。MCP 管理对话框允许你启用或禁用服务器、重新连接到服务器以及管理 OAuth 认证。有关可用服务器，请参阅 [MCP 文档](/zh/mcp)。

## 使用 git

Claude Code 与 git 集成，帮助你在 VS Code 中直接进行版本控制工作流。让 Claude 提交更改、创建拉取请求或跨分支工作。

### 创建提交和拉取请求

Claude 可以暂存更改、编写提交消息并根据你的工作创建拉取请求：

```text
> commit my changes with a descriptive message
> create a pr for this feature
> summarize the changes I've made to the auth module
```

创建拉取请求时，Claude 会根据实际代码更改生成描述，并可以添加有关测试或实现决策的上下文。

### 使用 git worktree 进行并行任务

使用 `--worktree`（`-w`）标志在具有自己文件和分支的隔离工作树中启动 Claude：

```bash
claude --worktree feature-auth
```

每个工作树维护独立的文件状态，同时共享 git 历史记录。这可以防止 Claude 实例在处理不同任务时相互干扰。有关更多详情，请参阅[使用 Git 工作树运行并行会话](/zh/worktrees)。

## 使用第三方提供商

默认情况下，Claude Code 直接连接到 Anthropic 的 API。如果你的组织使用 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 来访问 Claude，请配置扩展以使用你的提供商：

1. **禁用登录提示**
    打开 [Disable Login Prompt 设置](vscode://settings/claudeCode.disableLoginPrompt) 并勾选复选框。

    你也可以打开 VS Code 设置（Mac 上 `Cmd+,` 或 Windows/Linux 上 `Ctrl+,`），搜索 "Claude Code login"，然后勾选 **Disable Login Prompt**。

2. **配置你的提供商**
    按照你提供商的设置指南操作：

    * [在 Amazon Bedrock 上使用 Claude Code](/zh/amazon-bedrock)
    * [在 Google Vertex AI 上使用 Claude Code](/zh/google-vertex-ai)
    * [在 Microsoft Foundry 上使用 Claude Code](/zh/microsoft-foundry)

    这些指南涵盖了在 `~/.claude/settings.json` 中配置你的提供商，确保你的设置在 VS Code 扩展和 CLI 之间共享。

## 安全和隐私

你的代码保持私密。Claude Code 处理你的代码以提供协助，但不会使用它来训练模型。有关数据处理和如何退出日志记录的详情，请参阅[数据和隐私](/zh/data-usage)。

启用自动编辑权限后，Claude Code 可以修改 VS Code 配置文件（如 `settings.json` 或 `tasks.json`），VS Code 可能会自动执行这些文件。为了在处理不受信任的代码时降低风险：

* 为不受信任的工作区启用 [VS Code 受限模式](https://code.visualstudio.com/docs/editor/workspace-trust#_restricted-mode)
* 使用手动审批模式而非自动接受进行编辑
* 在接受之前仔细审查更改

### 内置 IDE MCP 服务器

当扩展处于活动状态时，它会运行一个本地 MCP 服务器，CLI 会自动连接到该服务器。这是 CLI 在 VS Code 的原生差异查看器中打开差异、读取你当前选中内容用于 `@`-提及，以及在你使用 Jupyter notebook 时请求 VS Code 执行单元格的方式。

该服务器名为 `ide`，在 `/mcp` 中隐藏，因为没有可配置的内容。但是，如果你的组织使用 `PreToolUse` 钩子来允许列表 MCP 工具，你需要知道它的存在。

**选中内容和打开文件上下文。** 连接时，CLI 会在你发送的每个提示词中包含你当前的编辑器选中内容和活动文件的路径作为上下文。发生这种情况时，记录会显示 `⧉ Selected N lines from <file>` 行。要排除敏感文件（如 `.env`），请为其路径添加 [`Read` 拒绝规则](/zh/permissions#read-and-edit)。匹配的拒绝规则会阻止选中文本和打开文件通知到达 Claude。

**传输和认证。** 服务器绑定到 `127.0.0.1` 的随机高端口，无法从其他机器访问。每次扩展激活都会生成一个新的随机认证令牌，CLI 必须出示该令牌才能连接。该令牌写入 `~/.claude/ide/` 下的锁定文件，权限为 `0600`，目录权限为 `0700`，因此只有运行 VS Code 的用户才能读取它。

**暴露给模型的工具。** 服务器托管了十几个工具，但只有两个对模型可见。其余是 CLI 用于自身 UI 的内部 RPC — 打开差异、读取选中内容、保存文件 — 并在工具列表到达 Claude 之前被过滤掉。

| 工具名称（钩子所见）             | 功能                                                                                                              | 是否写入？ |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------- |
| `mcp__ide__getDiagnostics`   | 返回语言服务器诊断 — VS Code Problems 面板中的错误和警告。可选择限定到单个文件。 | 否      |
| `mcp__ide__executeCode`      | 在活动 Jupyter notebook 的内核中运行 Python 代码。参阅下方的确认流程。                                    | 是     |

**Jupyter 执行始终先询问。** `mcp__ide__executeCode` 无法静默运行任何内容。每次调用时，代码会作为新单元格插入活动 notebook 的末尾，VS Code 会将其滚动到视图中，并且原生 Quick Pick 会要求你 **Execute** 或 **Cancel**。取消 — 或使用 `Esc` 关闭选择器 — 会向 Claude 返回错误且不会运行任何内容。当没有活动 notebook、未安装 Jupyter 扩展（`ms-toolsai.jupyter`）或内核不是 Python 时，该工具也会直接拒绝。

> **注意**
> Quick Pick 确认与 `PreToolUse` 钩子是分开的。`mcp__ide__executeCode` 的允许列表条目让 Claude *提议*运行单元格；VS Code 中的 Quick Pick 是让它 *实际*运行的机制。

<a id="troubleshooting" />

## 修复常见问题

### 扩展无法安装

* 确保你拥有兼容版本的 VS Code（1.98.0 或更高版本）
* 检查 VS Code 是否有安装扩展的权限
* 尝试直接从 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) 安装

### Spark 图标不可见

当你打开文件时，Spark 图标会出现在 **Editor Toolbar**（编辑器右上角）。如果你看不到它：

1. **打开文件**：该图标需要打开文件才能显示。仅打开文件夹是不够的。
2. **检查 VS Code 版本**：需要 1.98.0 或更高版本（Help → About）
3. **重启 VS Code**：从命令面板运行 "Developer: Reload Window"
4. **禁用冲突的扩展**：暂时禁用其他 AI 扩展（Cline、Continue 等）
5. **检查工作区信任**：该扩展在受限模式下不工作

或者，点击 **Status Bar**（右下角）中的 "✱ Claude Code"。即使没有打开文件也可以使用。你也可以使用 **Command Palette**（`Cmd+Shift+P` / `Ctrl+Shift+P`）并输入 "Claude Code"。

### macOS 上 Cmd+Esc 无响应

在 macOS Tahoe 及更高版本上，系统游戏覆盖快捷键默认绑定到 `Cmd+Esc`，并在按键到达 VS Code 之前拦截它。要释放该快捷键：

1. 打开系统设置
2. 进入键盘，然后键盘快捷键，然后游戏控制器
3. 取消勾选游戏覆盖复选框

或者，将扩展重新绑定到不同的按键：打开 VS Code [键盘快捷键编辑器](https://code.visualstudio.com/docs/configure/keybindings)（`Cmd+K Cmd+S`），搜索 `Claude Code: Focus input`，然后分配新的绑定。

### Claude Code 无响应

如果 Claude Code 没有响应你的提示词：

1. **检查互联网连接**：确保你有稳定的互联网连接
2. **开始新对话**：尝试开始新的对话以查看问题是否持续
3. **尝试 CLI**：从终端运行 `claude` 以查看是否有更详细的错误消息

如果问题持续存在，请在 [GitHub 上提交 issue](https://github.com/anthropics/claude-code/issues) 并附上错误详情。

## 卸载扩展

要卸载 Claude Code 扩展：

1. 打开扩展视图（Mac 上 `Cmd+Shift+X` 或 Windows/Linux 上 `Ctrl+Shift+X`）
2. 搜索 "Claude Code"
3. 点击 **Uninstall**

要同时移除扩展数据并重置所有设置：

```bash
rm -rf ~/.vscode/globalStorage/anthropic.claude-code
```

有关更多帮助，请参阅[故障排除指南](/zh/troubleshooting)。

## 后续步骤

现在你已在 VS Code 中设置了 Claude Code：

* [探索常见工作流](/zh/common-workflows)以充分利用 Claude Code
* [设置 MCP 服务器](/zh/mcp)以使用外部工具扩展 Claude 的功能。使用 CLI 添加服务器，然后在聊天面板中使用 `/mcp` 管理它们。
* [配置 Claude Code 设置](/zh/settings)以自定义允许的命令、钩子等。这些设置在扩展和 CLI 之间共享。
