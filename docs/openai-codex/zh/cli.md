# Codex CLI

Codex CLI 是 OpenAI 的编码代理，你可以在本地终端中运行。它能在选定目录中读取、修改和运行代码。
它是[开源的](https://github.com/openai/codex)，使用 Rust 构建，速度和效率都很高。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 套餐都包含 Codex。了解[具体内容](https://developers.openai.com/codex/pricing)。

Codex CLI 概述
<br />

## CLI 设置

Codex CLI 可在 macOS、Windows 和 Linux 上使用。在 Windows 上，可以在 PowerShell 中使用 Windows 沙箱原生运行 Codex，或者在需要 Linux 原生环境时使用 WSL2。设置详情请参阅 <a href="/codex/windows">Windows 设置指南</a>。

如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

---

## 使用 Codex CLI

### 交互式运行 Codex

运行 `codex` 启动交互式终端 UI (TUI) 会话。

### 控制模型和推理

使用 `/model` 在 GPT-5.4、GPT-5.3-Codex 和其他可用模型之间切换，或调整推理级别。

### 图像输入

附加截图或设计规范，让 Codex 在处理你的提示词时同时读取它们。

### 图像生成

直接在 CLI 中生成或编辑图像，并在你想让 Codex 迭代现有素材时附加参考。

### 运行本地代码审查

在提交或推送更改之前，让单独的 Codex 代理审查你的代码。

### 使用子代理

使用子代理并行化复杂任务。

### 网络搜索

使用 Codex 搜索网络，获取任务的最新信息。

### Codex Cloud 任务

启动 Codex Cloud 任务，选择环境，并在不离开终端的情况下应用生成的 diff。

### 脚本化 Codex

使用 `exec` 命令脚本化 Codex，自动化可重复的工作流程。

### Model Context Protocol

通过 Model Context Protocol (MCP) 让 Codex 访问额外的第三方工具和上下文。

### 审批模式

在 Codex 编辑或运行命令之前，选择适合你舒适程度的审批模式。
