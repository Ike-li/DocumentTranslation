> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 创建插件

> 创建自定义插件，通过技能、代理、钩子和 MCP 服务器扩展 Claude Code。

插件让你可以通过自定义功能扩展 Claude Code，这些功能可以在项目和团队之间共享。本指南介绍如何使用技能、代理、钩子和 MCP 服务器创建自己的插件。

想要安装现有插件？请参阅[发现和安装插件](/zh/discover-plugins)。完整技术规范请参阅[插件参考](/zh/plugins-reference)。

## 何时使用插件 vs 独立配置

Claude Code 支持两种添加自定义技能、代理和钩子的方式：

| 方式                                                        | 技能名称             | 最适用于                                                                                        |
| :---------------------------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------- |
| **独立配置**（`.claude/` 目录）                              | `/hello`             | 个人工作流、项目特定的自定义、快速实验                                                          |
| **插件**（包含 `.claude-plugin/plugin.json` 的目录）         | `/plugin-name:hello` | 与团队成员共享、分发到社区、版本化发布、跨项目复用                                              |

**在以下情况使用独立配置**：

* 你正在为单个项目自定义 Claude Code
* 配置是个人的，不需要共享
* 你正在将技能或钩子打包之前进行实验
* 你想要简短的技能名称，如 `/hello` 或 `/deploy`

**在以下情况使用插件**：

* 你想要与团队或社区共享功能
* 你需要在多个项目中使用相同的技能/代理
* 你想要版本控制和便捷的扩展更新
* 你正在通过市场分发
* 你可以接受带命名空间的技能，如 `/my-plugin:hello`（命名空间可防止插件之间的冲突）

先在 `.claude/` 中使用独立配置进行快速迭代，当你准备好共享时再[转换为插件](#将现有配置转换为插件)。

## 快速入门

本快速入门将引导你创建一个包含自定义技能的插件。你将创建一个清单（定义插件的配置文件）、添加一个技能，并使用 `--plugin-dir` 标志在本地测试。

### 前置条件

* Claude Code [已安装并完成身份验证](/zh/quickstart#step-1-install-claude-code)

如果你没有看到 `/plugin` 命令，请将 Claude Code 更新到最新版本。升级说明请参阅[故障排除](/zh/troubleshooting)。

### 创建你的第一个插件

**第 1 步：创建插件目录**

每个插件都位于自己的目录中，包含一个清单以及你的技能、代理或钩子。现在创建一个：

```bash
mkdir my-first-plugin
```

**第 2 步：创建插件清单**

`.claude-plugin/plugin.json` 清单文件定义了插件的身份：名称、描述和版本。Claude Code 使用这些元数据在插件管理器中显示你的插件。

在插件文件夹内创建 `.claude-plugin` 目录：

```bash
mkdir my-first-plugin/.claude-plugin
```

然后创建 `my-first-plugin/.claude-plugin/plugin.json`，内容如下：

```json my-first-plugin/.claude-plugin/plugin.json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| 字段          | 用途                                                                                                                                                                                                                                                         |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | 唯一标识符和技能命名空间。技能以此为前缀（例如 `/my-first-plugin:hello`）。                                                                                                                                                                                   |
| `description` | 在浏览或安装插件时显示在插件管理器中。                                                                                                                                                                                                                       |
| `version`     | 可选。如果设置了，用户只有在你更新此字段时才会收到更新。如果省略且你的插件通过 git 分发，则使用提交 SHA，每次提交都算作新版本。请参阅[版本管理](/zh/plugins-reference#version-management)。                                                                    |
| `author`      | 可选。有助于归属标注。                                                                                                                                                                                                                                       |

其他字段如 `homepage`、`repository` 和 `license`，请参阅[完整清单模式](/zh/plugins-reference#plugin-manifest-schema)。

**第 3 步：添加技能**

技能位于 `skills/` 目录中。每个技能是一个包含 `SKILL.md` 文件的文件夹。文件夹名称成为技能名称，并以插件的命名空间为前缀（在名为 `my-first-plugin` 的插件中，`hello/` 会创建 `/my-first-plugin:hello`）。

在插件文件夹中创建技能目录：

```bash
mkdir -p my-first-plugin/skills/hello
```

然后创建 `my-first-plugin/skills/hello/SKILL.md`，内容如下：

```markdown my-first-plugin/skills/hello/SKILL.md
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

**第 4 步：测试你的插件**

使用 `--plugin-dir` 标志运行 Claude Code 来加载你的插件：

```bash
claude --plugin-dir ./my-first-plugin
```

Claude Code 启动后，尝试你的新技能：

```shell
/my-first-plugin:hello
```

你将看到 Claude 以问候语回应。运行 `/help` 可以看到你的技能列在插件命名空间下。

**为什么使用命名空间？** 插件技能始终使用命名空间（如 `/my-first-plugin:hello`），以防止多个插件具有同名技能时发生冲突。

要更改命名空间前缀，请更新 `plugin.json` 中的 `name` 字段。

**第 5 步：添加技能参数**

通过接受用户输入使你的技能动态化。`$ARGUMENTS` 占位符捕获用户在技能名称后提供的任何文本。

更新你的 `SKILL.md` 文件：

```markdown my-first-plugin/skills/hello/SKILL.md
---
description: Greet the user with a personalized message
---

# Hello Skill

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today. Make the greeting personal and encouraging.
```

运行 `/reload-plugins` 以加载更改，然后用你的名字尝试技能：

```shell
/my-first-plugin:hello Alex
```

Claude 将以你的名字问候你。有关向技能传递参数的更多信息，请参阅[技能](/zh/skills#pass-arguments-to-skills)。

你已成功创建并测试了一个包含以下关键组件的插件：

* **插件清单**（`.claude-plugin/plugin.json`）：描述插件的元数据
* **技能目录**（`skills/`）：包含你的自定义技能
* **技能参数**（`$ARGUMENTS`）：捕获用户输入以实现动态行为

`--plugin-dir` 标志可用于开发和测试。当你准备好与他人分享插件时，请参阅[创建和分发插件市场](/zh/plugin-marketplaces)。

## 在技能目录中开发插件

你可以在技能目录中保留插件，让 Claude Code 自动加载它，而不必每次启动时都传递 `--plugin-dir`。`claude plugin init` 可以快速搭建一个：

```bash
claude plugin init my-tool
```

这会在 `~/.claude/skills/my-tool/` 创建一个包含 `.claude-plugin/plugin.json` 清单和入门 `SKILL.md` 的结构。在下一个会话中，它会作为 `my-tool@skills-dir` 加载，无需市场或安装步骤。

有关自动加载规则、个人 vs 项目范围、工作区信任要求，以及如何更新或删除，请参阅[技能目录插件](/zh/plugins-reference#skills-directory-plugins)。

## 插件结构概览

你已经创建了一个包含技能的插件，但插件可以包含更多内容：自定义代理、钩子、MCP 服务器、LSP 服务器和后台监视器。

**常见错误**：不要将 `commands/`、`agents/`、`skills/` 或 `hooks/` 放在 `.claude-plugin/` 目录内。只有 `plugin.json` 放在 `.claude-plugin/` 内。所有其他目录必须位于插件根级别。

| 目录              | 位置       | 用途                                                                       |
| :---------------- | :--------- | :------------------------------------------------------------------------- |
| `.claude-plugin/` | 插件根目录 | 包含 `plugin.json` 清单（如果组件使用默认位置则可选）                      |
| `skills/`         | 插件根目录 | 技能，以 `<name>/SKILL.md` 目录形式存放                                    |
| `commands/`       | 插件根目录 | 技能，以扁平 Markdown 文件形式存放。新插件请使用 `skills/`                 |
| `agents/`         | 插件根目录 | 自定义代理定义                                                             |
| `hooks/`          | 插件根目录 | `hooks.json` 中的事件处理器                                                |
| `.mcp.json`       | 插件根目录 | MCP 服务器配置                                                             |
| `.lsp.json`       | 插件根目录 | 用于代码智能的 LSP 服务器配置                                              |
| `monitors/`       | 插件根目录 | `monitors.json` 中的后台监视器配置                                         |
| `bin/`            | 插件根目录 | 插件启用期间添加到 Bash 工具 `PATH` 的可执行文件                           |
| `settings.json`   | 插件根目录 | 插件启用时应用的默认[设置](/zh/settings)                                   |

**下一步**：准备好添加更多功能？跳转到[开发更复杂的插件](#开发更复杂的插件)以添加代理、钩子、MCP 服务器和 LSP 服务器。所有插件组件的完整技术规范，请参阅[插件参考](/zh/plugins-reference)。

## 开发更复杂的插件

当你熟悉基本插件后，可以创建更复杂的扩展。

### 为插件添加技能

插件可以包含[代理技能](/zh/skills)来扩展 Claude 的能力。技能是模型调用的：Claude 会根据任务上下文自动使用它们。

在插件根目录添加 `skills/` 目录，其中包含 `SKILL.md` 文件的技能文件夹：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

每个 `SKILL.md` 包含 YAML frontmatter 和指令。包含 `description` 以便 Claude 知道何时使用该技能：

```yaml
---
description: Reviews code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
---

When reviewing code, check for:
1. Code organization and structure
2. Error handling
3. Security concerns
4. Test coverage
```

安装插件后，运行 `/reload-plugins` 以加载技能。完整的技能编写指南，包括渐进式披露和工具限制，请参阅[代理技能](/zh/skills)。

### 为插件添加 LSP 服务器

对于 TypeScript、Python 和 Rust 等常见语言，请从官方市场安装预构建的 LSP 插件。仅当你需要支持尚未覆盖的语言时才创建自定义 LSP 插件。

LSP（语言服务器协议）插件为 Claude 提供实时代码智能。如果你需要支持没有官方 LSP 插件的语言，可以通过在插件中添加 `.lsp.json` 文件来创建自己的：

```json .lsp.json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

安装你插件的用户必须在其机器上安装语言服务器二进制文件。

完整的 LSP 配置选项，请参阅 [LSP 服务器](/zh/plugins-reference#lsp-servers)。

### 为插件添加后台监视器

后台监视器让你的插件在后台监视日志、文件或外部状态，并在事件到达时通知 Claude。Claude Code 在插件激活时自动启动每个监视器，因此你不需要指示 Claude 启动监视。

在插件根目录添加 `monitors/monitors.json` 文件，其中包含监视器条目数组：

```json monitors/monitors.json
[
  {
    "name": "error-log",
    "command": "tail -F ./logs/error.log",
    "description": "Application error log"
  }
]
```

`command` 的每行 stdout 都会在会话期间作为通知发送给 Claude。完整模式，包括 `when` 触发器和变量替换，请参阅[监视器](/zh/plugins-reference#monitors)。

### 为插件附带默认设置

插件可以在插件根目录包含 `settings.json` 文件，以便在插件启用时应用默认配置。目前仅支持 `agent` 和 `subagentStatusLine` 键。

设置 `agent` 会将插件的某个[自定义代理](/zh/sub-agents)激活为主线程，应用其系统提示词、工具限制和模型。这使得插件可以在启用时更改 Claude Code 的默认行为。

```json settings.json
{
  "agent": "security-reviewer"
}
```

此示例激活了插件 `agents/` 目录中定义的 `security-reviewer` 代理。`settings.json` 中的设置优先于 `plugin.json` 中声明的 `settings`。未知键会被静默忽略。

### 组织复杂插件

对于包含多个组件的插件，按功能组织你的目录结构。完整的目录布局和组织模式，请参阅[插件目录结构](/zh/plugins-reference#plugin-directory-structure)。

### 在本地测试插件

使用 `--plugin-dir` 标志在开发期间测试插件。这将直接加载你的插件，无需安装。

```bash
claude --plugin-dir ./my-plugin
```

该标志也接受插件目录的 `.zip` 归档文件，需要 Claude Code v2.1.128 或更高版本。

```bash
claude --plugin-dir ./my-plugin.zip
```

当 `--plugin-dir` 插件与已安装的市场插件同名时，本地副本在该会话中优先。这让你可以在不先卸载的情况下测试已安装插件的更改。例外是托管设置强制启用或强制禁用的插件：`--plugin-dir` 无法覆盖这些设置。

当你对插件进行更改时，运行 `/reload-plugins` 以在不重新启动的情况下获取更新。这会重新加载插件、技能、代理、钩子、插件 MCP 服务器和插件 LSP 服务器。测试你的插件组件：

* 使用 `/plugin-name:skill-name` 尝试你的技能
* 检查代理是否出现在 `/agents` 中
* 验证钩子是否按预期工作

你可以通过多次指定标志来同时加载多个插件：

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

要测试已打包为 `.zip` 归档并托管在 URL 的插件（如 CI 构建产物），请改用 `--plugin-url`。Claude Code 在启动时获取归档文件并仅在该会话中加载。如果获取失败或归档无效，Claude Code 会报告插件加载错误并在没有它的情况下启动。与任何插件来源一样，适用相同的[信任考量](/zh/discover-plugins#security)：仅将此标志指向你控制或信任的归档。

要加载多个插件，对每个 URL 重复该标志：

```bash
claude --plugin-url https://example.com/my-plugin.zip --plugin-url https://example.com/other.zip
```

或以空格分隔的 URL 作为单个带引号的参数传递：

```bash
claude --plugin-url "https://example.com/my-plugin.zip https://example.com/other.zip"
```

### 调试插件问题

如果你的插件没有按预期工作：

1. **检查结构**：确保你的目录位于插件根目录，而不是在 `.claude-plugin/` 内
2. **单独测试组件**：分别检查每个技能、代理和钩子
3. **使用验证和调试工具**：请参阅[调试和开发工具](/zh/plugins-reference#debugging-and-development-tools)了解 CLI 命令和故障排除技术

### 分享你的插件

当你的插件准备好分享时：

1. **添加文档**：包含一个 `README.md`，提供安装和使用说明
2. **选择版本策略**：决定是设置显式 `version` 还是依赖 git 提交 SHA。请参阅[版本管理](/zh/plugins-reference#version-management)
3. **创建或使用市场**：通过[插件市场](/zh/plugin-marketplaces)分发以供安装
4. **与他人测试**：在更广泛分发之前让团队成员测试插件

一旦你的插件进入市场，其他人可以使用[发现和安装插件](/zh/discover-plugins)中的说明进行安装。要将插件保持在团队内部，请在[私有仓库](/zh/plugin-marketplaces#private-repositories)中托管市场。

### 将插件提交到社区市场

Anthropic 维护两个 Claude Code 插件的公共市场：

* **`claude-plugins-official`**：由 Anthropic 维护的精选插件集。在每个 Claude Code 安装中自动可用。
* **`claude-community`**：公共社区市场，第三方提交经审核后发布在此。用户通过 `/plugin marketplace add anthropics/claude-plugins-community` 添加，并以 `@claude-community` 身份从中安装。

要将插件提交到社区市场审核，请使用以下应用内表单之一：

* **Claude.ai**：[claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
* **Console**：[platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

在提交之前，在本地运行 `claude plugin validate`。审核流程会对每次提交运行相同的检查，以及自动安全筛选。

经批准的插件会被固定到 [`anthropics/claude-plugins-community`](https://github.com/anthropics/claude-plugins-community) 目录中的特定提交 SHA，当你向仓库推送新提交时，CI 会自动更新固定版本。公共目录每晚从审核流程同步，因此在批准和你的插件出现在 `marketplace.json` 之间可能会有延迟。要检查你的插件是否可以安装，请在[社区目录](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json)中搜索其名称。

官方市场 `claude-plugins-official` 是单独策展的。Anthropic 自行决定包含哪些插件。没有申请流程，提交表单不会将插件添加到官方市场。

如果 Anthropic 在官方市场中列出了你的插件，你的 CLI 可以提示 Claude Code 用户安装它。请参阅[从 CLI 推荐你的插件](/zh/plugin-hints)。

完整的技术规范、调试技术和分发策略，请参阅[插件参考](/zh/plugins-reference)。

## 将现有配置转换为插件

如果你在 `.claude/` 目录中已有技能或钩子，可以将它们转换为插件以便于共享和分发。

### 迁移步骤

**第 1 步：创建插件结构**

创建一个新的插件目录：

```bash
mkdir -p my-plugin/.claude-plugin
```

在 `my-plugin/.claude-plugin/plugin.json` 创建清单文件：

```json my-plugin/.claude-plugin/plugin.json
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
```

**第 2 步：复制现有文件**

将现有配置复制到插件目录：

```bash
# Copy commands
cp -r .claude/commands my-plugin/

# Copy agents (if any)
cp -r .claude/agents my-plugin/

# Copy skills (if any)
cp -r .claude/skills my-plugin/
```

**第 3 步：迁移钩子**

如果你的设置中有钩子，请创建 hooks 目录：

```bash
mkdir my-plugin/hooks
```

创建 `my-plugin/hooks/hooks.json`，包含你的钩子配置。从 `.claude/settings.json` 或 `settings.local.json` 复制 `hooks` 对象，因为格式相同。命令通过 stdin 以 JSON 形式接收钩子输入，因此使用 `jq` 提取文件路径：

```json my-plugin/hooks/hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

**第 4 步：测试迁移后的插件**

加载你的插件以验证一切正常：

```bash
claude --plugin-dir ./my-plugin
```

测试每个组件：运行你的命令、检查代理是否出现在 `/agents` 中，以及验证钩子是否正确触发。

### 迁移时的变化

| 独立配置（`.claude/`）        | 插件                             |
| :---------------------------- | :------------------------------- |
| 仅在一个项目中可用            | 可通过市场共享                   |
| 文件在 `.claude/commands/`    | 文件在 `plugin-name/commands/`   |
| 钩子在 `settings.json`        | 钩子在 `hooks/hooks.json`        |
| 必须手动复制才能共享          | 使用 `/plugin install` 安装      |

迁移后，你可以从 `.claude/` 中删除原始文件以避免重复。加载时插件版本将优先。

## 后续步骤

现在你已了解 Claude Code 的插件系统，以下是不同目标的建议路径：

### 对于插件用户

* [发现和安装插件](/zh/discover-plugins)：浏览市场并安装插件
* [配置团队市场](/zh/discover-plugins#configure-team-marketplaces)：为你的团队设置仓库级插件

### 对于插件开发者

* [创建和分发市场](/zh/plugin-marketplaces)：打包和分享你的插件
* [插件参考](/zh/plugins-reference)：完整技术规范
* 深入了解特定插件组件：
  * [技能](/zh/skills)：技能开发详情
  * [子代理](/zh/sub-agents)：代理配置和能力
  * [钩子](/zh/hooks)：事件处理和自动化
  * [MCP](/zh/mcp)：外部工具集成
