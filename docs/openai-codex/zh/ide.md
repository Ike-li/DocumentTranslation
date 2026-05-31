# Codex IDE 扩展

Codex 是 OpenAI 的编程代理，可以读取、编辑和运行代码。它帮助你更快地构建、修复 bug 并理解不熟悉的代码。通过 Codex VS Code 扩展，你可以在 IDE 中与 Codex 并排使用，或将任务委托给 Codex Cloud。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 套餐包含 Codex。了解更多关于[包含内容](https://developers.openai.com/codex/pricing)。

<br />

## 扩展安装

Codex IDE 扩展兼容 VS Code 的分支版本，如 Cursor 和 Windsurf。

你可以从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt) 获取 Codex 扩展，或为你的 IDE 下载：

- [下载 Visual Studio Code 版](vscode:extension/openai.chatgpt)
- [下载 Cursor 版](cursor:extension/openai.chatgpt)
- [下载 Windsurf 版](windsurf:extension/openai.chatgpt)
- [下载 Visual Studio Code Insiders 版](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
- [下载 JetBrains IDE 版](#jetbrains-ide-集成)

Codex IDE 集成支持 VS Code 兼容编辑器和 JetBrains IDE，可在 macOS、Windows 和 Linux 上使用。在 Windows 上，你可以使用 Windows 沙箱原生运行 Codex，或在需要 Linux 原生环境时使用 WSL2。有关设置详情，请参阅 <a href="/codex/windows">Windows 设置指南</a>。

安装后，你可以在编辑器侧边栏中找到 Codex。
在 VS Code 中，Codex 默认在右侧边栏打开。
如果你使用 VS Code，在没有立即看到 Codex 时请重启编辑器。

如果你使用 Cursor，活动栏默认水平显示。折叠的项目可能会隐藏 Codex，因此你可以将其固定并重新排列扩展的顺序。

<div class="not-prose max-w-56 mr-auto">
  <img src="https://cdn.openai.com/devhub/docs/codex-extension.webp"
    alt="Codex extension"
    class="block h-auto w-full mx-0!"
  />
</div>

## JetBrains IDE 集成

如果你想在 Rider、IntelliJ、PyCharm 或 WebStorm 等 JetBrains IDE 中使用 Codex，请安装 JetBrains IDE 集成。它支持使用 ChatGPT、API key 或 JetBrains AI 订阅登录。

### 将 Codex 移至右侧边栏 <a id="right-sidebar"></a>

在 VS Code 中，Codex 会自动出现在右侧边栏。
如果你更喜欢将其放在主（左侧）边栏，可以将 Codex 图标拖回左侧活动栏。

在 Cursor 等 VS Code 分支版本中，你可能需要手动将 Codex 移至右侧边栏。
为此，你可能需要先临时更改活动栏方向：

1. 打开编辑器设置并搜索 `activity bar`（在 Workbench 设置中）。
2. 将方向更改为 `vertical`。
3. 重启编辑器。

![codex-workbench-setting](https://cdn.openai.com/devhub/docs/codex-workbench-setting.webp)

现在将 Codex 图标拖至右侧边栏（例如，放在 Cursor 聊天旁边）。Codex 将作为侧边栏中的另一个标签页显示。

移动完成后，将活动栏方向重置为 `horizontal` 以恢复默认行为。
如果之后改变主意，你可以随时将 Codex 拖回主（左侧）边栏。

### 登录

安装扩展后，它会提示你使用 ChatGPT 账户或 API key 登录。你的 ChatGPT 套餐包含使用额度，因此你可以无需额外设置即可使用 Codex。了解更多请访问[定价页面](https://developers.openai.com/codex/pricing)。

### 更新扩展

扩展会自动更新，但你也可以在 IDE 中打开扩展页面检查更新。

### 设置键盘快捷键

Codex 包含可以在 IDE 设置中绑定为键盘快捷键的命令（例如，切换 Codex 聊天或向 Codex 上下文添加项目）。

要查看所有可用命令并将其绑定为键盘快捷键，请在 Codex 聊天中选择设置图标，然后选择 **Keyboard shortcuts**。
你也可以参考 [Codex IDE 扩展命令](https://developers.openai.com/codex/ide/commands)页面。
有关支持的斜杠命令列表，请参阅 [Codex IDE 扩展斜杠命令](https://developers.openai.com/codex/ide/slash-commands)。
如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

---

## 使用 Codex IDE 扩展

### 使用编辑器上下文进行提示

使用打开的文件、选区和 `@file` 引用，以更短的提示词获得更相关的结果。

### 切换模型

使用默认模型或切换到其他模型，以利用各自的优点。

### 调整推理力度

选择 `low`、`medium` 或 `high`，根据任务在速度和深度之间进行权衡。

### 图像生成

无需离开编辑器即可生成或编辑图像，并在需要迭代时使用参考素材。

### 选择审批模式

根据你希望 Codex 拥有的自主程度，在 `Chat`、`Agent` 和 `Agent (Full Access)` 之间切换。

### 委托到云端

将耗时较长的任务卸载到云端环境，然后无需离开 IDE 即可监控进度和查看结果。

### 跟进云端工作

预览云端更改，请求后续操作，并在本地应用生成的 diff 以进行测试和完成。

### IDE 扩展命令

浏览可从命令面板运行并绑定到键盘快捷键的完整命令列表。

### 斜杠命令

使用斜杠命令控制 Codex 的行为，并从聊天中快速更改常用设置。

### 扩展设置

通过编辑器设置调整模型、审批和其他默认值，将 Codex 调整为适合你的工作流。
