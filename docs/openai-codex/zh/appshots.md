# Appshots

Appshot 让你可以将当前最前面的应用窗口发送到 Codex 线程中。当你正在电脑上的其他应用中工作，并希望向 Codex 提供当前上下文以帮助你完成任务时，可以使用 Appshot。

Appshot 功能在 macOS 上的 Codex 应用中可用。按下两个 Command 键，或你自定义的 Appshot 快捷键，即可截取。

## Appshot 捕获的内容

Appshot 仅捕获最前面的窗口。它可以包含：

- 可见窗口的图像。
- 该窗口中的可用文本，包括可见文本以及应用在可见滚动区域之外提供的文本。

将 Appshot 添加到线程后，它的行为与 Codex 附件相同。Codex 将 Appshot 本地存储在会话文件中，就像你手动附加的文件或图像一样。

## 何时使用 Appshot

当 Codex 需要来自 Mac 应用的上下文才能采取行动时，使用 Appshot。

示例：

- 分享一个 API 参考页面，让 Codex 编写使用该 API 的脚本。
- 分享电子邮件或日历视图，让 Codex 起草下一步操作。
- 分享图像编辑器、设计或预览窗口，让 Codex 修改相关资源或代码。
- 分享错误信息、设置面板或难以描述但易于展示的应用状态。

## 截取 Appshot

1. 在 Mac 上打开 Codex 应用。
2. 打开你想分享的应用和窗口。
3. 按下两个 Command 键，或你在 Codex 设置中配置的自定义快捷键。
4. 如果 Codex 请求 macOS 权限，请予以允许。
5. 让 Codex 对 Appshot 执行任务。

默认情况下，Codex 会为 Appshot 启动一个新线程。如果你在最近 60 秒内与某个 Codex 线程进行过交互，Codex 会将 Appshot 添加到该最近的线程中。连续截取的 Appshot 会被添加到同一线程。

你可以在 Codex 设置中更改 Appshot 快捷键。

## 权限与安全

Codex 在截取 Appshot 之前可能会请求权限：

- **屏幕与系统音频录制** 允许 Codex 捕获最前面窗口的图像。
- **辅助功能** 允许 Codex 读取最前面窗口中的可用文本。

截取 Appshot 会将捕获的图像和可用文本与 Codex 共享。除非任务需要，否则请避免对敏感内容截取 Appshot。

请以与向 Codex 共享截图和文档相同的方式来审查 Appshot。

## 限制与故障排除

Appshot 是 Codex 应用的功能。请在 macOS 上的 Codex 应用中创建它们。如果你在 CLI 中恢复一个已包含 Appshot 的线程，该附件仍属于线程历史的一部分，但 CLI 无法创建新的 Appshot。

对于某些应用和网站，包括 Google Docs、Gmail、Google Sheets 和 Google Slides，Codex 可能仅接收到可见的截图，而无法获取完整文档或屏幕外的文本。如果你安装了对应的插件，Codex 可以使用该插件来访问相关应用内容并协助处理你的请求。

如果 Appshot 无法正常工作：

1. 打开 **系统设置 > 隐私与安全性**。
2. 检查 Codex Computer Use 的 **屏幕与系统音频录制** 和 **辅助功能** 权限。
3. 重启 Codex 并重试。
