# 插件

## 概述

插件将技能、应用集成和 MCP 服务器打包成可复用的工作流，供 Codex 使用。

扩展 Codex 的能力，例如：

- 安装 Codex Security 插件，扫描已授权的代码并确认可疑的漏洞发现。
- 安装 Gmail 插件，让 Codex 读取和管理 Gmail。
- 安装 Google Drive 插件，跨 Drive、Docs、Sheets 和 Slides 工作。
- 安装 Slack 插件，总结频道内容或起草回复。

一个插件可以包含：

- **技能：** 针对特定类型工作的可复用指令。Codex 可以在需要时加载它们，以便按照正确的步骤并使用正确的参考或辅助脚本来完成任务。
- **应用：** 与 GitHub、Slack 或 Google Drive 等工具的连接，使 Codex 可以从这些工具中读取信息并在其中执行操作。
- **MCP 服务器：** 为 Codex 提供更多工具或共享信息的服务，通常来自本地项目之外的系统。

你可以通过市场来源发布插件来共享它们，例如项目或团队的仓库市场。有关市场设置、打包和分发指南，请参阅[构建插件](https://developers.openai.com/codex/plugins/build)。

## 使用和安装插件

### Codex 应用中的插件目录

在 Codex 应用中打开 **Plugins**，浏览并安装精选插件。

<CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/directory.webp"
  darkSrc="/images/codex/plugins/directory-dark.webp"
/>

插件目录将插件分为以下类别：

- **由 OpenAI 精选：** 面向所有 Codex 用户的推荐插件。
- **与你共享：** 由 ChatGPT 工作区中的其他成员共享的插件。
- **由你创建：** 你创建或添加到自己工作区的插件。

### CLI 中的插件目录

在 Codex CLI 中，运行以下命令打开插件列表：

```text
codex
/plugins
```

<CodexScreenshot
  alt="Plugins list in Codex CLI"
  lightSrc="/images/codex/plugins/cli_light.png"
  darkSrc="/images/codex/plugins/codex-plugin-cli.png"
/>

CLI 插件浏览器按市场分组显示插件。使用市场标签页切换来源，打开插件查看详情，安装或卸载市场条目，并在已安装的插件上按 <kbd>Space</kbd> 键切换其启用状态。

### 安装和使用插件

打开插件目录后：

1. 搜索或浏览插件，然后打开其详情。
2. 选择安装按钮。在应用中，选择加号按钮或 **Add to Codex**。在 CLI 中，选择 `Install plugin`。
3. 如果插件需要外部应用，请在提示时进行连接。某些插件会在安装过程中要求你进行身份验证。其他插件则会等到你首次使用时再要求。
4. 安装完成后，开启新会话并让 Codex 使用该插件。

安装插件后，你可以直接在提示词窗口中使用它：

<CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/plugin-github-invoke.png"
  darkSrc="/images/codex/plugins/plugin-github-invoke-dark.png"
/>

<div class="not-prose mt-4 grid gap-4 md:grid-cols-2">
  <div class="rounded-xl border border-subtle bg-surface px-5 py-4">
    <p class="text-sm font-semibold text-default">直接描述任务</p>
    <p class="mt-2 text-sm text-secondary">
      说明你想要的结果，例如"总结今天未读的 Gmail 会话"或"从 Google Drive 获取最新的发布说明"。
    </p>
    <p class="mt-3 text-sm text-secondary">
      当你希望 Codex 为任务选择合适的已安装工具时，使用此方式。
    </p>
  </div>

  <div class="rounded-xl border border-subtle bg-surface px-5 py-4">
    <p class="text-sm font-semibold text-default">选择特定插件</p>
    <p class="mt-2 text-sm text-secondary">
      输入 <code>@</code> 以显式调用插件或其打包的技能之一。
    </p>
    <p class="mt-3 text-sm text-secondary">
      当你想明确指定 Codex 应使用哪个插件或技能时，使用此方式。请参阅 <a href="/codex/app/commands">Codex 应用命令</a>和
      <a href="/codex/skills">技能</a>。
    </p>
  </div>
</div>

### 权限和数据共享的工作方式

安装插件会使其工作流在 Codex 中可用，但你现有的[审批设置](https://developers.openai.com/codex/agent-approvals-security)仍然适用。任何已连接的外部服务仍受其自身的身份验证、隐私和数据共享政策约束。

- 打包的技能在你安装插件后即可使用。
- 如果插件包含应用，Codex 可能会在设置过程中或你首次使用时提示你在 ChatGPT 中安装或登录这些应用。
- 如果插件包含 MCP 服务器，它们可能需要额外的设置或身份验证才能使用。
- 当 Codex 通过打包的应用发送数据时，该应用的条款和隐私政策适用。

### 移除或关闭插件

要移除插件，请从插件浏览器中重新打开它并选择 **Uninstall plugin**。

卸载插件会从 Codex 中移除插件包，但打包的应用会保持安装状态，直到你在 ChatGPT 中管理它们。

如果你想保留插件但将其关闭，请在 `~/.codex/config.toml` 中将其条目设置为 `enabled = false`，然后重启 Codex：

```toml
[plugins."gmail@openai-curated"]
enabled = false
```

## 构建自己的插件

如果你想创建、测试或分发自己的插件，请参阅[构建插件](https://developers.openai.com/codex/plugins/build)。该页面涵盖本地脚手架、手动市场设置、工作区共享、插件清单和打包指南。

## 插件指南

- [Codex Security 插件](https://developers.openai.com/codex/security/plugin)：扫描已授权的代码，确认发现，并准备已审查的修复。
