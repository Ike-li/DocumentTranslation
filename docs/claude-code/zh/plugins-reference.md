> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进一步探索。

# 插件参考

> Claude Code 插件系统的完整技术参考，包括 schema、CLI 命令和组件规范。

想安装插件？请参阅[发现和安装插件](/zh/discover-plugins)。要创建插件，请参阅[插件](/zh/plugins)。要分发插件，请参阅[插件市场](/zh/plugin-marketplaces)。

本参考文档提供 Claude Code 插件系统的完整技术规范，包括组件 schema、CLI 命令和开发工具。

**插件**是一个自包含的组件目录，通过自定义功能扩展 Claude Code。插件组件包括技能、代理、钩子、MCP 服务器、LSP 服务器和监视器。

## 插件组件参考

### 技能

插件为 Claude Code 添加技能，创建 `/name` 快捷方式，你或 Claude 可以调用。

**位置**：插件根目录下的 `skills/` 或 `commands/` 目录，或插件根目录下的单个 `SKILL.md` 文件

**文件格式**：技能是包含 `SKILL.md` 的目录；命令是简单的 Markdown 文件

**技能结构**：

```text
skills/
├── pdf-processor/
│   ├── SKILL.md
│   ├── reference.md (optional)
│   └── scripts/ (optional)
└── code-reviewer/
    └── SKILL.md
```

**集成行为**：

* 技能和命令在插件安装时自动被发现
* Claude 可以根据任务上下文自动调用它们
* 技能可以在 SKILL.md 旁边包含支持文件

完整详情请参阅[技能](/zh/skills)。

### 代理

插件可以提供专门的子代理来处理特定任务，Claude 可以在适当时自动调用。

**位置**：插件根目录下的 `agents/` 目录

**文件格式**：描述代理能力的 Markdown 文件

**代理结构**：

```markdown
---
name: agent-name
description: What this agent specializes in and when Claude should invoke it
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---

Detailed system prompt for the agent describing its role, expertise, and behavior.
```

插件代理支持 `name`、`description`、`model`、`effort`、`maxTurns`、`tools`、`disallowedTools`、`skills`、`memory`、`background` 和 `isolation` frontmatter 字段。唯一有效的 `isolation` 值是 `"worktree"`。出于安全原因，插件发布的代理不支持 `hooks`、`mcpServers` 和 `permissionMode`。

**集成点**：

* 代理出现在 `/agents` 界面中
* Claude 可以根据任务上下文自动调用代理
* 用户可以手动调用代理
* 插件代理与内置 Claude 代理协同工作

完整详情请参阅[子代理](/zh/sub-agents)。

### 钩子

插件可以提供事件处理器，自动响应 Claude Code 事件。

**位置**：插件根目录下的 `hooks/hooks.json`，或内联在 plugin.json 中

**格式**：包含事件匹配器和操作的 JSON 配置

**钩子配置**：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

插件钩子响应与[用户定义钩子](/zh/hooks)相同的生命周期事件：

| 事件                  | 触发时机                                                                                                                                                 |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | 会话开始或恢复时                                                                                                                                         |
| `Setup`               | 使用 `--init-only` 启动 Claude Code 时，或在 `-p` 模式下使用 `--init` 或 `--maintenance` 时。用于 CI 或脚本中的一次性准备工作                             |
| `UserPromptSubmit`    | 提交提示词时，在 Claude 处理之前                                                                                                                         |
| `UserPromptExpansion` | 用户输入的命令展开为提示词时，在到达 Claude 之前。可以阻止展开                                                                                           |
| `PreToolUse`          | 工具调用执行之前。可以阻止调用                                                                                                                           |
| `PermissionRequest`   | 权限对话框出现时                                                                                                                                         |
| `PermissionDenied`    | 工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 告诉模型可以重试被拒绝的工具调用                                                                     |
| `PostToolUse`         | 工具调用成功后                                                                                                                                           |
| `PostToolUseFailure`  | 工具调用失败后                                                                                                                                           |
| `PostToolBatch`       | 一批并行工具调用全部完成后，在下一次模型调用之前                                                                                                         |
| `Notification`        | Claude Code 发送通知时                                                                                                                                   |
| `MessageDisplay`      | 助手消息文本显示时                                                                                                                                       |
| `SubagentStart`       | 子代理启动时                                                                                                                                             |
| `SubagentStop`        | 子代理完成时                                                                                                                                             |
| `TaskCreated`         | 通过 `TaskCreate` 创建任务时                                                                                                                             |
| `TaskCompleted`       | 任务标记为完成时                                                                                                                                         |
| `Stop`                | Claude 完成响应时                                                                                                                                        |
| `StopFailure`         | 由于 API 错误导致轮次结束时。输出和退出码被忽略                                                                                                         |
| `TeammateIdle`        | [代理团队](/zh/agent-teams)中的队友即将空闲时                                                                                                            |
| `InstructionsLoaded`  | CLAUDE.md 或 `.claude/rules/*.md` 文件加载到上下文中时。在会话开始和会话期间懒加载文件时触发                                                              |
| `ConfigChange`        | 会话期间配置文件更改时                                                                                                                                   |
| `CwdChanged`          | 工作目录更改时，例如 Claude 执行 `cd` 命令时。适用于使用 direnv 等工具进行响应式环境管理                                                                  |
| `FileChanged`         | 监视的文件在磁盘上更改时。`matcher` 字段指定要监视的文件名                                                                                               |
| `WorktreeCreate`      | 通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替换默认的 git 行为                                                                           |
| `WorktreeRemove`      | 工作树被移除时，无论是在会话退出时还是子代理完成时                                                                                                       |
| `PreCompact`          | 上下文压缩之前                                                                                                                                           |
| `PostCompact`         | 上下文压缩完成后                                                                                                                                         |
| `Elicitation`         | MCP 服务器在工具调用期间请求用户输入时                                                                                                                   |
| `ElicitationResult`   | 用户响应 MCP 引导后，在响应发回服务器之前                                                                                                                |
| `SessionEnd`          | 会话终止时                                                                                                                                               |

**钩子类型**：

* `command`：执行 shell 命令或脚本
* `http`：将事件 JSON 作为 POST 请求发送到 URL
* `mcp_tool`：调用已配置的 [MCP 服务器](/zh/mcp)上的工具
* `prompt`：使用 LLM 评估提示词（使用 `$ARGUMENTS` 占位符作为上下文）
* `agent`：运行带有工具的代理验证器，用于复杂的验证任务

### MCP 服务器

插件可以捆绑 Model Context Protocol (MCP) 服务器，将 Claude Code 与外部工具和服务连接。

**位置**：插件根目录下的 `.mcp.json`，或内联在 plugin.json 中

**格式**：标准 MCP 服务器配置

**MCP 服务器配置**：

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

**集成行为**：

* 插件 MCP 服务器在插件启用时自动启动
* 服务器作为标准 MCP 工具出现在 Claude 的工具集中
* 服务器能力与 Claude 现有工具无缝集成
* 插件服务器可以独立于用户 MCP 服务器进行配置

### LSP 服务器

想使用 LSP 插件？从官方市场安装：在 `/plugin` 发现选项卡中搜索 "lsp"。本节记录如何为官方市场未涵盖的语言创建 LSP 插件。

插件可以提供 [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (LSP) 服务器，在 Claude 处理你的代码库时提供实时代码智能。

LSP 集成提供：

* **即时诊断**：Claude 在每次编辑后立即看到错误和警告
* **代码导航**：跳转到定义、查找引用和悬停信息
* **语言感知**：代码符号的类型信息和文档

**位置**：插件根目录下的 `.lsp.json`，或内联在 `plugin.json` 中

**格式**：将语言服务器名称映射到其配置的 JSON 配置

**`.lsp.json` 文件格式**：

```json
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

**内联在 `plugin.json` 中**：

```json
{
  "name": "my-plugin",
  "lspServers": {
    "go": {
      "command": "gopls",
      "args": ["serve"],
      "extensionToLanguage": {
        ".go": "go"
      }
    }
  }
}
```

**必填字段：**

| 字段                  | 描述                                       |
| :-------------------- | :----------------------------------------- |
| `command`             | 要执行的 LSP 二进制文件（必须在 PATH 中）  |
| `extensionToLanguage` | 将文件扩展名映射到语言标识符               |

**可选字段：**

| 字段                    | 描述                                                      |
| :---------------------- | :-------------------------------------------------------- |
| `args`                  | LSP 服务器的命令行参数                                    |
| `transport`             | 通信传输：`stdio`（默认）或 `socket`                      |
| `env`                   | 启动服务器时设置的环境变量                                |
| `initializationOptions` | 初始化期间传递给服务器的选项                              |
| `settings`              | 通过 `workspace/didChangeConfiguration` 传递的设置        |
| `workspaceFolder`       | 服务器的工作区文件夹路径                                  |
| `startupTimeout`        | 等待服务器启动的最长时间（毫秒）                          |
| `shutdownTimeout`       | 等待优雅关闭的最长时间（毫秒）                            |
| `restartOnCrash`        | 服务器崩溃时是否自动重启                                  |
| `maxRestarts`           | 放弃前的最大重启尝试次数                                  |

**你必须单独安装语言服务器二进制文件。** LSP 插件配置 Claude Code 如何连接到语言服务器，但不包含服务器本身。如果在 `/plugin` 错误选项卡中看到 `Executable not found in $PATH`，请为你的语言安装所需的二进制文件。

**可用的 LSP 插件：**

| 插件                | 语言服务器                   | 安装命令                                                                                 |
| :------------------ | :--------------------------- | :--------------------------------------------------------------------------------------- |
| `pyright-lsp`       | Pyright (Python)             | `pip install pyright` 或 `npm install -g pyright`                                        |
| `typescript-lsp`    | TypeScript Language Server   | `npm install -g typescript-language-server typescript`                                   |
| `rust-analyzer-lsp` | rust-analyzer                | [参见 rust-analyzer 安装](https://rust-analyzer.github.io/manual.html#installation)      |

先安装语言服务器，然后从市场安装插件。

### 监视器

插件可以声明后台监视器，Claude Code 在插件激活时自动启动。每个监视器在会话生命周期内运行一个 shell 命令，并将每行 stdout 作为通知传递给 Claude，使 Claude 可以对日志条目、状态更改或轮询事件做出响应，而无需被请求启动监视。

插件监视器使用与[监视器工具](/zh/tools-reference#monitor-tool)相同的机制，并共享其可用性约束。它们仅在交互式 CLI 会话中运行，以与[钩子](#钩子)相同的信任级别在非沙箱环境中运行，并且在监视器工具不可用的主机上会被跳过。

插件监视器需要 Claude Code v2.1.105 或更高版本。

**位置**：插件根目录下的 `monitors/monitors.json`，或内联在 `plugin.json` 中

**格式**：监视器条目的 JSON 数组

以下 `monitors/monitors.json` 监视部署状态端点和本地错误日志：

```json
[
  {
    "name": "deploy-status",
    "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/poll-deploy.sh ${user_config.api_endpoint}",
    "description": "Deployment status changes"
  },
  {
    "name": "error-log",
    "command": "tail -F ./logs/error.log",
    "description": "Application error log",
    "when": "on-skill-invoke:debug"
  }
]
```

要内联声明监视器，请将 `plugin.json` 中的 `experimental.monitors` 设置为相同的数组。要从非默认路径加载，请将 `experimental.monitors` 设置为相对路径字符串，例如 `"./config/monitors.json"`。监视器是[实验性组件](#实验性组件)。

**必填字段：**

| 字段          | 描述                                                                                                                    |
| :------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `name`        | 插件内唯一的标识符。防止插件重新加载或技能再次调用时产生重复进程                                                        |
| `command`     | 作为持久后台进程在会话工作目录中运行的 shell 命令                                                                       |
| `description` | 正在监视的内容的简短摘要。显示在任务面板和通知摘要中                                                                    |

**可选字段：**

| 字段   | 描述                                                                                                                                                                                                                   |
| :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `when` | 控制监视器启动时机。`"always"` 在会话开始和插件重新加载时启动，这是默认值。`"on-skill-invoke:<skill-name>"` 在本插件中指定的技能首次被调度时启动                                                                      |

`command` 值支持与 MCP 和 LSP 服务器配置相同的[变量替换](#环境变量)：`${CLAUDE_PLUGIN_ROOT}`、`${CLAUDE_PLUGIN_DATA}`、`${CLAUDE_PROJECT_DIR}`、`${user_config.*}`，以及环境中的任何 `${ENV_VAR}`。如果脚本需要从插件自身的目录运行，请在命令前加上 `cd "${CLAUDE_PLUGIN_ROOT}" && `。

在会话中禁用插件不会停止已经在运行的监视器。它们在会话结束时停止。

### 主题

插件可以附带颜色主题，这些主题与内置预设和用户的本地主题一起出现在 `/theme` 中。主题是 `themes/` 中的 JSON 文件，包含 `base` 预设和稀疏的 `overrides` 颜色 token 映射。主题是[实验性组件](#实验性组件)。

```json
{
  "name": "Dracula",
  "base": "dark",
  "overrides": {
    "claude": "#bd93f9",
    "error": "#ff5555",
    "success": "#50fa7b"
  }
}
```

选择插件主题会在用户配置中持久化 `custom:<plugin-name>:<slug>`。插件主题是只读的；在 `/theme` 中按 `Ctrl+E` 会将其复制到 `~/.claude/themes/`，以便用户可以编辑副本。

***

## 插件安装范围

安装插件时，你选择一个**范围**来决定插件在哪里可用以及谁可以使用：

| 范围      | 设置文件                                        | 用例                                                       |
| :-------- | :---------------------------------------------- | :--------------------------------------------------------- |
| `user`    | `~/.claude/settings.json`                       | 个人插件，在所有项目中可用（默认）                         |
| `project` | `.claude/settings.json`                         | 通过版本控制共享的团队插件                                 |
| `local`   | `.claude/settings.local.json`                   | 特定于项目的插件，被 gitignore 忽略                        |
| `managed` | [托管设置](/zh/settings#settings-files)          | 托管插件（只读，仅更新）                                   |

插件使用与其他 Claude Code 配置相同的范围系统。有关安装说明和范围标志，请参阅[安装插件](/zh/discover-plugins#install-plugins)。有关范围的完整说明，请参阅[配置范围](/zh/settings#configuration-scopes)。

***

## 技能目录插件

技能目录下任何包含 `.claude-plugin/plugin.json` 清单的文件夹都会在下一次会话中作为名为 `<name>@skills-dir` 的插件加载，无需市场和安装步骤。使用 [`plugin init`](#plugin-init) 创建脚手架。与市场安装不同，插件在原位被发现，而不是复制到插件缓存中。

技能目录树支持三种不同的内容：

| 你拥有的内容                                    | 它是什么                                                                              |
| :-------------------------------------------- | :---------------------------------------------------------------------------------- |
| `<skills-dir>/foo/SKILL.md`（没有清单）       | 一个名为 `foo` 的普通[技能](/zh/skills)                                             |
| `<skills-dir>/foo/.claude-plugin/plugin.json` | 插件 `foo@skills-dir`，可以捆绑自己的技能、代理、钩子等                              |
| `<plugin>/skills/bar/SKILL.md`                | 插件内打包的技能 `bar`                                                              |

### 选择插件加载位置

| 技能目录                | 范围     | 加载条件                                                                            |
| :---------------------- | :------- | :---------------------------------------------------------------------------------- |
| `~/.claude/skills/`     | 个人     | 在每个项目中，因为该位置仅属于你                                                    |
| `<cwd>/.claude/skills/` | 项目     | 仅在接受该文件夹的工作区[信任对话框](/zh/settings)后                                |

项目范围的插件被检入仓库，对每个克隆它的协作者可用。因为该内容来自仓库而不是来自你，它只有在与管理 `.claude/settings.json` 相同的信任门控之后才会加载，并且运行代码的组件会受到进一步限制：

* 它声明的 MCP 服务器经过与项目 `.mcp.json` 相同的[逐服务器批准](/zh/mcp)
* LSP 服务器仅在你信任工作区后启动
* [后台监视器](#监视器)不加载

个人范围的插件没有这些限制。

项目范围的 `@skills-dir` 插件仅从你启动 Claude Code 的目录的 `.claude/skills/` 加载。它们不会像普通技能和命令那样[向上遍历到仓库根目录](/zh/skills#automatic-discovery-from-parent-and-nested-directories)，因此从子目录启动会错过位于仓库根目录的插件。请从仓库根目录启动，或在更改目录后运行 `/reload-plugins`。

### 编辑、重新加载和禁用技能目录插件

对技能的 `SKILL.md` 所做的更改在当前会话中立即生效。对插件其他组件的更改（如 `hooks/`、`.mcp.json`、`agents/` 和 `output-styles/`）则不会。运行 `/reload-plugins` 或重启 Claude Code 以加载这些更改。请参阅[实时更改检测](/zh/skills#live-change-detection)。

要停止加载技能目录插件，请删除其文件夹或按名称禁用它。没有 `uninstall` 步骤，因为没有从市场安装任何内容。

```bash
claude plugin disable my-tool@skills-dir
```

***

## 插件清单 schema

`.claude-plugin/plugin.json` 文件定义你的插件的元数据和配置。本节记录所有支持的字段和选项。

清单是可选的。如果省略，Claude Code 会在[默认位置](#文件位置参考)自动发现组件，并从目录名派生插件名称。当你需要提供元数据或自定义组件路径时使用清单。

### 完整 schema

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "agents": ["./custom/agents/reviewer.md"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "experimental": {
    "themes": "./themes/",
    "monitors": "./monitors.json"
  },
  "dependencies": [
    "helper-lib",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

### 必填字段

如果你包含清单，`name` 是唯一的必填字段。

| 字段   | 类型   | 描述                               | 示例                 |
| :----- | :----- | :--------------------------------- | :------------------- |
| `name` | string | 唯一标识符（kebab-case，无空格）   | `"deployment-tools"` |

此名称用于组件的命名空间。例如，在 UI 中，名为 `plugin-dev` 的插件的代理 `agent-creator` 将显示为 `plugin-dev:agent-creator`。

### 未识别的字段

Claude Code 忽略它不识别的顶层字段。你可以在 `plugin.json` 中保留来自其他生态系统的元数据，插件仍然会加载。这使得维护一个同时作为 VS Code 或 Cursor 扩展清单、npm `package.json` 或 MCPB/DXT 包清单的清单变得实用。

`claude plugin validate` 将未识别的字段报告为警告而非错误。如果某个字段与已识别的字段相差一两个字符，警告会建议可能的预期名称。只有未识别字段警告的插件仍然通过验证并在运行时加载。

类型错误的字段仍然会失败。例如，`keywords` 值是字符串而不是数组会导致加载错误，`claude plugin validate` 会将其报告为错误。

传递 `--strict` 将警告视为错误。在 CI 中使用它来捕获拼写错误的字段名或在发布前从其他工具清单遗留的字段，即使插件在运行时仍然会加载。

```bash
claude plugin validate ./my-plugin --strict
```

### 元数据字段

| 字段             | 类型    | 描述                                                                                                                                                                                                                                                                                                                               | 示例                                                              |
| :--------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `$schema`        | string  | 用于编辑器自动完成和验证的 JSON Schema URL。Claude Code 在加载时忽略此字段。                                                                                                                                                                                                                                                        | `"https://json.schemastore.org/claude-code-plugin-manifest.json"` |
| `displayName`    | string  | {/* min-version: 2.1.143 */}在 `/plugin` 选择器和其他 UI 界面中显示的人类可读名称。省略时回退到 `name`。与 `name` 不同，可以包含空格和任意大小写。不用于命名空间或查找。需要 Claude Code v2.1.143 或更高版本。                                                                                                                   | `"Deployment Tools"`                                              |
| `version`        | string  | 可选。语义化版本。设置此项会将插件固定到该版本字符串，因此用户只有在你更新版本时才会收到更新。如果省略，Claude Code 回退到 git commit SHA，因此每次提交都被视为新版本。如果在市场条目中也设置了，`plugin.json` 优先。请参阅[版本管理](#版本管理)。                                                                            | `"2.1.0"`                                                         |
| `description`    | string  | 插件用途的简要说明                                                                                                                                                                                                                                                                                                                 | `"Deployment automation tools"`                                   |
| `author`         | object  | 作者信息                                                                                                                                                                                                                                                                                                                           | `{"name": "Dev Team", "email": "dev@company.com"}`                |
| `homepage`       | string  | 文档 URL                                                                                                                                                                                                                                                                                                                           | `"https://docs.example.com"`                                      |
| `repository`     | string  | 源代码 URL                                                                                                                                                                                                                                                                                                                         | `"https://github.com/user/plugin"`                                |
| `license`        | string  | 许可证标识符                                                                                                                                                                                                                                                                                                                       | `"MIT"`, `"Apache-2.0"`                                           |
| `keywords`       | array   | 发现标签                                                                                                                                                                                                                                                                                                                           | `["deployment", "ci-cd"]`                                         |
| `defaultEnabled` | boolean | {/* min-version: 2.1.154 */}当用户未设置时，插件是否以启用状态启动。默认为 `true`。请参阅[默认启用](#默认启用)。需要 Claude Code v2.1.154 或更高版本。                                                                                                                                                                     | `false`                                                           |

### 默认启用

在 `plugin.json` 中设置 `defaultEnabled: false` 可以发布一个安装时处于禁用状态的插件。用户可以通过 `claude plugin enable <plugin>` 或 `/plugin` 界面来启用它。用于添加成本或需要用户选择加入的插件，例如连接到外部服务的插件。这需要 Claude Code v2.1.154 或更高版本。早期版本忽略此字段并在安装时启用插件。

`defaultEnabled` 是在没有其他因素决定插件状态时的回退值。两件事优先于它：

* **用户的设置**：在任何设置范围的 `enabledPlugins` 中有该插件的条目。一旦写入，它在插件更新和重新安装后仍然持久，因此在后续版本中更改 `defaultEnabled` 不会翻转现有用户的状态。
* **依赖要求**：当插件被另一个活跃的插件需要时，Claude Code 在安装或启用时为其写入 `true`。这给了它一个显式设置，因此它自己的默认值不再适用。请参阅[启用或禁用有依赖的插件](/zh/plugin-dependencies#enable-or-disable-a-plugin-with-dependencies)。

同一字段可以出现在插件的市场条目中，优先于 `plugin.json` 中的值。请参阅[可选插件字段](/zh/plugin-marketplaces#optional-plugin-fields)。

### 组件路径字段

| 字段                    | 类型                  | 描述                                                                                                                                            | 示例                                                   |
| :---------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| `skills`                | string\|array         | 包含 `<name>/SKILL.md` 的自定义技能目录（除默认的 `skills/` 外）                                                                                | `"./custom/skills/"`                                 |
| `commands`              | string\|array         | 自定义扁平 `.md` 技能文件或目录（替换默认的 `commands/`）                                                                                       | `"./custom/cmd.md"` 或 `["./cmd1.md"]`               |
| `agents`                | string\|array         | 自定义代理文件（替换默认的 `agents/`）                                                                                                          | `"./custom/agents/reviewer.md"`                      |
| `hooks`                 | string\|array\|object | 钩子配置路径或内联配置                                                                                                                          | `"./my-extra-hooks.json"`                            |
| `mcpServers`            | string\|array\|object | MCP 配置路径或内联配置                                                                                                                          | `"./my-extra-mcp-config.json"`                       |
| `outputStyles`          | string\|array         | 自定义输出样式文件/目录（替换默认的 `output-styles/`）                                                                                          | `"./styles/"`                                        |
| `lspServers`            | string\|array\|object | [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) 配置，用于代码智能（跳转到定义、查找引用等）                    | `"./.lsp.json"`                                      |
| `experimental.themes`   | string\|array         | 颜色主题文件/目录（替换默认的 `themes/`）。请参阅[主题](#主题)                                                                                | `"./themes/"`                                        |
| `experimental.monitors` | string\|array         | 后台[监视器](/zh/tools-reference#monitor-tool)配置，在插件激活时自动启动。请参阅[监视器](#监视器)                                               | `"./monitors.json"`                                  |
| `userConfig`            | object                | 用户可配置的值，在启用时提示。请参阅[用户配置](#用户配置)                                                                              | 见下文                                                 |
| `channels`              | array                 | 消息注入的通道声明（Telegram、Slack、Discord 风格）。请参阅[通道](#通道)                                                                     | 见下文                                                 |
| `dependencies`          | array                 | 此插件需要的其他插件，可选带 semver 版本约束。请参阅[约束插件依赖版本](/zh/plugin-dependencies)                                                  | `[{ "name": "secrets-vault", "version": "~2.1.0" }]` |

### 实验性组件

`experimental` 键下的组件（`themes` 和 `monitors`）具有在稳定之前可能在版本之间更改的清单 schema。你声明它们的位置是单独的迁移：顶层仍然有效，`claude plugin validate` 会发出警告，未来版本将要求使用 `experimental.*`。

### 用户配置

`userConfig` 字段声明 Claude Code 在插件启用时提示用户的值。使用此方式代替要求用户手动编辑 `settings.json`。

```json
{
  "userConfig": {
    "api_endpoint": {
      "type": "string",
      "title": "API endpoint",
      "description": "Your team's API endpoint"
    },
    "api_token": {
      "type": "string",
      "title": "API token",
      "description": "API authentication token",
      "sensitive": true
    }
  }
}
```

键必须是有效的标识符。每个选项支持以下字段：

| 字段          | 必填 | 描述                                                                |
| :------------ | :--- | :------------------------------------------------------------------ |
| `type`        | 是   | `string`、`number`、`boolean`、`directory` 或 `file` 之一          |
| `title`       | 是   | 配置对话框中显示的标签                                              |
| `description` | 是   | 字段下方显示的帮助文本                                              |
| `sensitive`   | 否   | 如果为 `true`，遮蔽输入并将值存储在安全存储中而不是 `settings.json` |
| `required`    | 否   | 如果为 `true`，字段为空时验证失败                                   |
| `default`     | 否   | 用户未提供时使用的值                                                |
| `multiple`    | 否   | 对于 `string` 类型，允许字符串数组                                  |
| `min` / `max` | 否   | `number` 类型的边界                                                 |

每个值都可以作为 `${user_config.KEY}` 在 MCP 和 LSP 服务器配置、钩子命令和监视器命令中进行替换。非敏感值还可以在技能和代理内容中替换。所有值都作为 `CLAUDE_PLUGIN_OPTION_<KEY>` 环境变量导出到插件子进程。

非敏感值存储在 `settings.json` 的 `pluginConfigs[<plugin-id>].options` 下。敏感值存储到系统钥匙串（或在钥匙串不可用时存储到 `~/.claude/.credentials.json`）。钥匙串存储与 OAuth token 共享，总限制约为 2 KB，因此请保持敏感值较小。

### 通道

`channels` 字段允许插件声明一个或多个将内容注入对话的消息通道。每个通道绑定到插件提供的一个 MCP 服务器。

```json
{
  "channels": [
    {
      "server": "telegram",
      "userConfig": {
        "bot_token": {
          "type": "string",
          "title": "Bot token",
          "description": "Telegram bot token",
          "sensitive": true
        },
        "owner_id": {
          "type": "string",
          "title": "Owner ID",
          "description": "Your Telegram user ID"
        }
      }
    }
  ]
}
```

`server` 字段是必填的，必须与插件 `mcpServers` 中的键匹配。可选的逐通道 `userConfig` 使用与顶层字段相同的 schema，允许插件在启用时提示输入 bot token 或 owner ID。

### 路径行为规则

自定义路径是替换还是扩展插件的默认目录取决于字段：

* **替换默认值**：`commands`、`agents`、`outputStyles`、`experimental.themes`、`experimental.monitors`。例如，当清单指定 `commands` 时，不会扫描默认的 `commands/` 目录。要保留默认值并添加更多，请显式列出：`"commands": ["./commands/", "./extras/"]`
* **添加到默认值**：`skills`。默认的 `skills/` 目录始终被扫描，`skills` 中列出的目录与之一起加载
* **自己的合并规则**：[钩子](#钩子)、[MCP 服务器](#mcp-服务器)和 [LSP 服务器](#lsp-服务器)。请参阅各节了解多个源如何组合

当插件同时拥有默认文件夹和匹配的清单键时，Claude Code v2.1.140 及更高版本会在 `/doctor`、`claude plugin list` 和 `/plugin` 详细视图中标记被忽略的文件夹。插件仍然使用清单路径加载。当清单键指向默认文件夹内部时，例如 `"commands": ["./commands/deploy.md"]`，不会显示警告，因为在这种情况下文件夹被显式引用。

对于所有路径字段：

* 所有路径必须相对于插件根目录并以 `./` 开头
* 自定义路径的组件使用相同的命名和命名空间规则
* 多个路径可以指定为数组
* 当技能路径指向直接包含 `SKILL.md` 的目录时，例如 `"skills": ["./"]` 指向插件根目录，SKILL.md 中的 frontmatter `name` 字段决定技能的调用名称。这提供了与安装目录无关的稳定名称。如果 frontmatter 中未设置 `name`，则使用目录基本名称作为回退。

在插件根目录有 `SKILL.md`、没有 `skills/` 子目录且没有 `skills` 清单字段的插件，在 Claude Code v2.1.142 及更高版本中会自动作为单技能插件加载。对于此布局，你不需要在 `plugin.json` 中设置 `"skills": ["./"]`。技能的调用名称遵循与上述相同的规则：frontmatter `name` 字段，或目录基本名称作为回退。

**路径示例**：

```json
{
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch-process.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

### 环境变量

Claude Code 提供三个变量用于引用路径。所有变量在技能内容、代理内容、钩子命令、监视器命令以及 MCP 或 LSP 服务器配置中出现的任何位置都进行内联替换。所有变量也作为环境变量导出到钩子进程和 MCP 或 LSP 服务器子进程。

**`${CLAUDE_PLUGIN_ROOT}`**：插件安装目录的绝对路径。使用此路径引用与插件捆绑的脚本、二进制文件和配置文件。在钩子命令中，使用[执行形式](/zh/hooks#exec-form-and-shell-form)配合 `args`，使路径作为一个参数传递而不带引号。在 shell 形式的钩子和监视器命令中，用双引号包装，如 `"${CLAUDE_PLUGIN_ROOT}"`。此路径在插件更新时会更改。先前版本的目录在更新后大约七天内保留在磁盘上，然后才清理，但将其视为临时的，不要在此处写入状态。

当插件在会话中更新时，钩子命令、监视器、MCP 服务器和 LSP 服务器继续使用先前版本的路径。运行 `/reload-plugins` 将钩子、MCP 服务器和 LSP 服务器切换到新路径；监视器需要会话重启。

**`${CLAUDE_PLUGIN_DATA}`**：一个持久目录，用于存储在更新后仍然存在的插件状态。使用此目录存储已安装的依赖项（如 `node_modules` 或 Python 虚拟环境）、生成的代码、缓存以及任何其他应在插件版本之间持久化的文件。该目录在首次引用此变量时自动创建。

**`${CLAUDE_PROJECT_DIR}`**：项目根目录。这与钩子在 `CLAUDE_PROJECT_DIR` 变量中接收的目录相同。使用此路径引用项目本地的脚本或配置文件。用引号包装以处理带空格的路径，例如 `"${CLAUDE_PROJECT_DIR}/scripts/server.sh"`。MCP 服务器也可以调用 MCP `roots/list` 请求，它返回 Claude Code 启动时所在的目录。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/process.sh"
          }
        ]
      }
    ]
  }
}
```

#### 持久数据目录

`${CLAUDE_PLUGIN_DATA}` 目录解析为 `~/.claude/plugins/data/{id}/`，其中 `{id}` 是插件标识符，`a-z`、`A-Z`、`0-9`、`_` 和 `-` 以外的字符被替换为 `-`。对于安装为 `formatter@my-marketplace` 的插件，目录为 `~/.claude/plugins/data/formatter-my-marketplace/`。

一个常见的用法是一次性安装语言依赖并在会话和插件更新之间重用它们。因为数据目录的寿命超过任何单个插件版本，仅检查目录存在无法检测更新何时更改了插件的依赖清单。推荐的模式是将捆绑的清单与数据目录中的副本进行比较，并在它们不同时重新安装。

此 `SessionStart` 钩子在首次运行时安装 `node_modules`，并在插件更新包含更改的 `package.json` 时再次安装：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "diff -q \"${CLAUDE_PLUGIN_ROOT}/package.json\" \"${CLAUDE_PLUGIN_DATA}/package.json\" >/dev/null 2>&1 || (cd \"${CLAUDE_PLUGIN_DATA}\" && cp \"${CLAUDE_PLUGIN_ROOT}/package.json\" . && npm install) || rm -f \"${CLAUDE_PLUGIN_DATA}/package.json\""
          }
        ]
      }
    ]
  }
}
```

`diff` 在存储的副本缺失或与捆绑的不同时退出非零，覆盖首次运行和依赖更改的更新。如果 `npm install` 失败，末尾的 `rm` 会删除复制的清单，以便下一次会话重试。

`${CLAUDE_PLUGIN_ROOT}` 中捆绑的脚本可以针对持久化的 `node_modules` 运行：

```json
{
  "mcpServers": {
    "routines": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
      "env": {
        "NODE_PATH": "${CLAUDE_PLUGIN_DATA}/node_modules"
      }
    }
  }
}
```

数据目录在你从最后一个安装范围卸载插件时自动删除。`/plugin` 界面会显示目录大小并在删除前提示。CLI 默认删除；传递 [`--keep-data`](#plugin-uninstall) 以保留它。

***

## 插件缓存和文件解析

插件通过以下两种方式之一指定：

* 通过 `claude --plugin-dir` 或 `claude --plugin-url`，在会话期间有效。
* 通过市场，安装以供未来会话使用。

出于安全和验证目的，Claude Code 将*市场*插件复制到用户的本地**插件缓存**（`~/.claude/plugins/cache`）而不是就地使用。在开发引用外部文件的插件时，理解此行为很重要。

每个已安装的版本是缓存中的一个单独目录。当你更新或卸载插件时，先前版本的目录被标记为孤立，并在 7 天后自动删除。宽限期让已加载旧版本的并发 Claude Code 会话可以继续运行而不出错。

Claude 的 Glob 和 Grep 工具在搜索时跳过孤立的版本目录，因此文件结果不包含过时的插件代码。

### 路径遍历限制

已安装的插件无法引用其目录之外的文件。遍历插件根目录之外的路径（如 `../shared-utils`）在安装后不起作用，因为那些外部文件不会被复制到缓存中。

### 使用符号链接在市场内共享文件

如果你的插件需要与同一市场的其他部分共享文件，你可以在插件目录内创建符号链接。当插件被复制到缓存时，符号链接的处理方式取决于其目标解析的位置：

* **在插件自身的目录内：** 符号链接作为相对符号链接保留在缓存中，因此它在运行时继续解析到复制的目标。
* **在同一市场内的其他位置：** 符号链接被解引用。目标的内容被复制到缓存中替代它。这允许元插件的 `skills/` 目录链接到市场中其他插件定义的技能。
* **在市场之外：** 出于安全原因，符号链接被跳过。这防止插件将任意主机文件（如系统路径）拉入缓存。

对于使用 `--plugin-dir` 或从本地路径安装的插件，只有解析在插件自身目录内的符号链接才会保留。所有其他符号链接都被跳过。

以下命令从市场插件内部创建到兄弟插件定义的共享技能的链接。在 Windows 上，使用提升权限的命令提示符中的 `mklink /D` 或启用开发者模式：

```bash
ln -s ../../shared-plugin/skills/foo ./skills/foo
```

这在维护缓存系统安全优势的同时提供了灵活性。

***

## 插件目录结构

### 标准插件布局

一个完整的插件遵循以下结构：

```text
enterprise-plugin/
├── .claude-plugin/           # 元数据目录（可选）
│   └── plugin.json             # 插件清单
├── skills/                   # 技能
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── commands/                 # 扁平 .md 格式的技能
│   ├── status.md
│   └── logs.md
├── agents/                   # 子代理定义
│   ├── security-reviewer.md
│   ├── performance-tester.md
│   └── compliance-checker.md
├── output-styles/            # 输出样式定义
│   └── terse.md
├── themes/                   # 颜色主题定义
│   └── dracula.json
├── monitors/                 # 后台监视器配置
│   └── monitors.json
├── hooks/                    # 钩子配置
│   ├── hooks.json           # 主钩子配置
│   └── security-hooks.json  # 附加钩子
├── bin/                      # 添加到 PATH 的插件可执行文件
│   └── my-tool               # 可在 Bash 工具中作为裸命令调用
├── settings.json            # 插件的默认设置
├── .mcp.json                # MCP 服务器定义
├── .lsp.json                # LSP 服务器配置
├── scripts/                 # 钩子和实用脚本
│   ├── security-scan.sh
│   ├── format-code.py
│   └── deploy.js
├── LICENSE                  # 许可证文件
└── CHANGELOG.md             # 版本历史
```

`.claude-plugin/` 目录包含 `plugin.json` 文件。所有其他目录（commands/、agents/、skills/、output-styles/、themes/、monitors/、hooks/）必须在插件根目录下，而不是在 `.claude-plugin/` 内。

插件根目录的 `CLAUDE.md` 文件不会作为项目上下文加载。插件通过技能、代理和钩子贡献上下文，而不是通过 CLAUDE.md。要发布加载到 Claude 上下文中的指令，请将它们放在[技能](#技能)中。

### 文件位置参考

| 组件          | 默认位置                     | 用途                                                                                                                                                                                             |
| :------------ | :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **清单**      | `.claude-plugin/plugin.json` | 插件元数据和配置（可选）                                                                                                                                                                         |
| **技能**      | `skills/`                    | 具有 `<name>/SKILL.md` 结构的技能                                                                                                                                                                |
| **命令**      | `commands/`                  | 扁平 Markdown 文件格式的技能。新插件请使用 `skills/`                                                                                                                                             |
| **代理**      | `agents/`                    | 子代理 Markdown 文件                                                                                                                                                                             |
| **输出样式**  | `output-styles/`             | 输出样式定义                                                                                                                                                                                     |
| **主题**      | `themes/`                    | 颜色主题定义                                                                                                                                                                                     |
| **钩子**      | `hooks/hooks.json`           | 钩子配置                                                                                                                                                                                         |
| **MCP 服务器**| `.mcp.json`                  | MCP 服务器定义                                                                                                                                                                                   |
| **LSP 服务器**| `.lsp.json`                  | 语言服务器配置                                                                                                                                                                                   |
| **监视器**    | `monitors/monitors.json`     | 后台监视器配置                                                                                                                                                                                   |
| **可执行文件**| `bin/`                       | 添加到 Bash 工具 `PATH` 的可执行文件。此处的文件在插件启用时可在任何 Bash 工具调用中作为裸命令调用                                                                                               |
| **设置**      | `settings.json`              | 插件启用时应用的默认配置。目前仅支持 [`agent`](/zh/sub-agents) 和 [`subagentStatusLine`](/zh/statusline#subagent-status-lines) 键                                                                |

***

## CLI 命令参考

Claude Code 提供用于非交互式插件管理的 CLI 命令，适用于脚本和自动化。

### plugin init

在 `~/.claude/skills/<name>/` 创建新插件脚手架。在下一次 Claude Code 会话中，它自动作为 `<name>@skills-dir` 加载，并出现在 `/plugin` 和 `claude plugin list` 中，无需安装步骤。

请参阅[技能目录插件](#技能目录插件)了解范围和信任要求。

```bash
claude plugin init <name> [options]
```

**参数：**

* `<name>`：插件名称。成为技能命名空间和 `~/.claude/skills/` 下的目录名，因此不能包含空格或路径分隔符。

**选项：**

| 选项                     | 描述                                                                                                             | 默认值                  |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `--description <text>`   | 清单描述                                                                                                         |                         |
| `--author <name>`        | 作者名称                                                                                                         | `git config user.name`  |
| `--author-email <email>` | 作者邮箱                                                                                                         | `git config user.email` |
| `--with <components...>` | 同时创建组件文件夹脚手架。有效值：`skills`、`agents`、`hooks`、`mcp`、`lsp`、`output-style`、`channel`            |                         |
| `-f, --force`            | 覆盖目标位置现有的 `.claude-plugin/`                                                                             |                         |
| `-h, --help`             | 显示命令帮助                                                                                                     |                         |

**别名：** `new`

每个 `--with` 值为该组件添加一个入门文件，可直接编辑：

| 组件           | 创建的脚手架                                                                                              |
| :------------- | :-------------------------------------------------------------------------------------------------------- |
| `skills`       | 除默认技能外的额外命名空间 `<name>:example` 技能                                                         |
| `agents`       | `agents/` 子代理定义                                                                                      |
| `hooks`        | 带有示例事件处理器的 `hooks/hooks.json`                                                                   |
| `mcp`          | 带有 HTTP 和 stdio 服务器示例的 `.mcp.json`                                                               |
| `lsp`          | `.lsp.json` 语言服务器示例                                                                                |
| `output-style` | 插件启用时自动应用的 `output-styles/<name>.md`                                                            |
| `channel`      | 基于 MCP 的[通道](/zh/channels)：stdio 服务器（`server.ts`）、其 `.mcp.json` 和 `package.json`            |

脚手架插件使用 `@skills-dir` 源而非市场。管理员可以通过 `strictKnownMarketplaces` 或在[托管设置](/zh/plugin-marketplaces#managed-marketplace-restrictions)中添加 `{"source": "skills-dir"}` 到 `blockedMarketplaces` 来阻止此源。被阻止时，`plugin init` 在写入前失败。

**示例：**

```bash
# 创建最小插件脚手架
claude plugin init my-helper

# 创建带有技能和钩子文件夹的脚手架
claude plugin init my-helper --with skills hooks

# 覆盖现有脚手架
claude plugin init my-helper --force
```

### plugin install

从可用市场安装插件。

```bash
claude plugin install <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name` 指定特定市场

**选项：**

| 选项                  | 描述                                       | 默认值  |
| :-------------------- | :----------------------------------------- | :------ |
| `-s, --scope <scope>` | 安装范围：`user`、`project` 或 `local`     | `user`  |
| `-h, --help`          | 显示命令帮助                               |         |

范围决定已安装插件添加到哪个设置文件。例如，`--scope project` 写入 .claude/settings.json 中的 `enabledPlugins`，使插件对克隆项目仓库的每个人可用。

**示例：**

```bash
# 安装到用户范围（默认）
claude plugin install formatter@my-marketplace

# 安装到项目范围（与团队共享）
claude plugin install formatter@my-marketplace --scope project

# 安装到本地范围（gitignore 忽略）
claude plugin install formatter@my-marketplace --scope local
```

### plugin uninstall

移除已安装的插件。

```bash
claude plugin uninstall <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                  | 描述                                                                                             | 默认值  |
| :-------------------- | :----------------------------------------------------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 从哪个范围卸载：`user`、`project` 或 `local`                                                     | `user`  |
| `--keep-data`         | 保留插件的[持久数据目录](#持久数据目录)                                             |         |
| `--prune`             | 同时移除不再被任何插件需要的自动安装依赖。请参阅 [plugin prune](#plugin-prune)                    |         |
| `-y, --yes`           | 跳过 `--prune` 确认提示。当 stdin 或 stdout 不是 TTY 时需要                                     |         |
| `-h, --help`          | 显示命令帮助                                                                                     |         |

**别名：** `remove`、`rm`

默认情况下，从最后一个剩余范围卸载也会删除插件的 `${CLAUDE_PLUGIN_DATA}` 目录。使用 `--keep-data` 保留它，例如在测试新版本后重新安装时。

### plugin prune

移除不再被任何已安装插件需要的自动安装插件依赖。Claude Code 为满足另一个插件的 [`dependencies`](/zh/plugin-dependencies) 字段而引入的依赖会被移除；你直接安装的插件永远不会被触及。

```bash
claude plugin prune [options]
```

**选项：**

| 选项                  | 描述                                                             | 默认值  |
| :-------------------- | :--------------------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 在哪个范围修剪：`user`、`project` 或 `local`                     | `user`  |
| `--dry-run`           | 列出将被移除的内容但不实际移除                                   |         |
| `-y, --yes`           | 跳过确认提示。当 stdin 或stdout 不是 TTY 时需要                  |         |
| `-h, --help`          | 显示命令帮助                                                     |         |

**别名：** `autoremove`

该命令列出孤立的依赖并在移除前请求确认。要一步移除插件并清理其依赖，请运行 `claude plugin uninstall <plugin> --prune`。

`claude plugin prune` 需要 Claude Code v2.1.121 或更高版本。

### plugin enable

启用已禁用的插件。如果插件声明了[依赖](/zh/plugin-dependencies)，Claude Code 在同一范围传递性地启用它们，当依赖未安装时命令失败。

```bash
claude plugin enable <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                  | 描述                                    | 默认值  |
| :-------------------- | :-------------------------------------- | :------ |
| `-s, --scope <scope>` | 要启用的范围：`user`、`project` 或 `local` | `user`  |
| `-h, --help`          | 显示命令帮助                            |         |

### plugin disable

禁用插件而不卸载它。当另一个已启用的插件[依赖于](/zh/plugin-dependencies#enable-or-disable-a-plugin-with-dependencies)目标时失败。错误消息包含一个链式命令，先禁用每个依赖项。

```bash
claude plugin disable <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                  | 描述                                     | 默认值  |
| :-------------------- | :--------------------------------------- | :------ |
| `-s, --scope <scope>` | 要禁用的范围：`user`、`project` 或 `local` | `user`  |
| `-h, --help`          | 显示命令帮助                             |         |

### plugin update

将插件更新到最新版本。

```bash
claude plugin update <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                  | 描述                                                | 默认值  |
| :-------------------- | :-------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 要更新的范围：`user`、`project`、`local` 或 `managed` | `user`  |
| `-h, --help`          | 显示命令帮助                                        |         |

***

### plugin list

列出已安装的插件及其版本、来源市场和启用状态。

```bash
claude plugin list [options]
```

**选项：**

| 选项          | 描述                                                       | 默认值  |
| :------------ | :--------------------------------------------------------- | :------ |
| `--json`      | 以 JSON 格式输出                                           |         |
| `--available` | 包含市场中可用的插件。需要 `--json`                        |         |
| `-h, --help`  | 显示命令帮助                                               |         |

### plugin details

显示插件的组件清单和预估 token 成本。输出列出插件贡献的所有组件，按技能、代理、钩子、MCP 服务器和 LSP 服务器分组，以及它为每个会话添加多少 token 的估算。技能组包括 `skills/` 和 `commands/` 条目。

```bash
claude plugin details <name>
```

**参数：**

* `<name>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项          | 描述               | 默认值  |
| :------------ | :----------------- | :------ |
| `-h, --help`  | 显示命令帮助       |         |

输出显示每个组件的两个成本数字：

* **始终开启：** 插件列表文本为每个会话添加的 token，例如技能描述、代理描述和命令名称，无论是否有组件触发。
* **调用时：** 组件触发时消耗的 token。按组件显示，而非插件总计，因为典型会话仅调用组件的子集。

以下示例显示了一个包含两个技能的插件的输出：

```
dependency-guard 1.2.0
  Dependency analysis for Claude Code sessions
  Source: dependency-guard@example-marketplace

Component inventory
  Skills (2)  scan-dependencies, review-changes
  Agents (0)
  Hooks (1)  (harness-only — no model context cost)
  MCP servers (0)
  LSP servers (0)

Projected token cost
  Always-on:   ~180 tok   added to every session

Per-component (rounded)
  component            always-on  on-invoke
  scan-dependencies        ~100      ~2400
  review-changes            ~80      ~1800

  On-invoke cost is paid each time a skill or agent fires.
  Token counts are estimates and may differ from actual usage.
```

始终开启的总计通过活动模型的 `count_tokens` API 计算。每个组件的数字按比例从该总计缩放。如果 API 不可达，命令回退到基于字符的估算。

### plugin tag

在当前目录中为插件创建发布 git 标签。从插件文件夹内运行。请参阅[为插件发布打标签](/zh/plugin-dependencies#tag-plugin-releases-for-version-resolution)。

```bash
claude plugin tag [options]
```

**选项：**

| 选项          | 描述                                                               | 默认值  |
| :------------ | :----------------------------------------------------------------- | :------ |
| `--push`      | 创建后将标签推送到远程                                             |         |
| `--dry-run`   | 打印将要标记的内容但不创建标签                                     |         |
| `-f, --force` | 即使工作树有更改或标签已存在也创建标签                             |         |
| `-h, --help`  | 显示命令帮助                                                       |         |

***

## 调试和开发工具

### 调试命令

使用 `claude --debug` 查看插件加载详情：

这显示：

* 正在加载哪些插件
* 插件清单中的任何错误
* 技能、代理和钩子注册
* MCP 服务器初始化

### 常见问题

| 问题                                | 原因                            | 解决方案                                                                                                                                                          |
| :---------------------------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 插件未加载                          | 无效的 `plugin.json`            | 运行 `claude plugin validate` 或 `/plugin validate` 检查 `plugin.json`、skill/agent/command frontmatter 和 `hooks/hooks.json` 的语法和 schema 错误              |
| 技能未出现                          | 错误的目录结构                  | 确保 `skills/` 或 `commands/` 在插件根目录下，而不是在 `.claude-plugin/` 内                                                                                       |
| 钩子未触发                          | 脚本不可执行                    | 运行 `chmod +x script.sh`                                                                                                                                        |
| MCP 服务器失败                      | 缺少 `${CLAUDE_PLUGIN_ROOT}`   | 对所有插件路径使用变量                                                                                                                                            |
| 路径错误                            | 使用了绝对路径                  | 所有路径必须是相对的并以 `./` 开头                                                                                                                                |
| LSP `Executable not found in $PATH` | 语言服务器未安装                | 安装二进制文件（例如 `npm install -g typescript-language-server typescript`）                                                                                     |

### 示例错误消息

**清单验证错误**：

* `Invalid JSON syntax: Unexpected token } in JSON at position 142`：检查缺少的逗号、多余的逗号或未加引号的字符串
* `Plugin has an invalid manifest file at .claude-plugin/plugin.json. Validation errors: name: Required`：缺少必填字段
* `Plugin has a corrupt manifest file at .claude-plugin/plugin.json. JSON parse error: ...`：JSON 语法错误

**插件加载错误**：

* `Warning: No commands found in plugin my-plugin custom directory: ./cmds. Expected .md files or SKILL.md in subdirectories.`：命令路径存在但不包含有效的命令文件
* `Plugin directory not found at path: ./plugins/my-plugin. Check that the marketplace entry has the correct path.`：marketplace.json 中的 `source` 路径指向不存在的目录
* `Plugin my-plugin has conflicting manifests: both plugin.json and marketplace entry specify components.`：移除重复的组件定义或移除 market 条目中的 `strict: false`

### 钩子故障排除

**钩子脚本未执行**：

1. 检查脚本是否可执行：`chmod +x ./scripts/your-script.sh`
2. 验证 shebang 行：第一行应为 `#!/bin/bash` 或 `#!/usr/bin/env bash`
3. 检查路径是否使用 `${CLAUDE_PLUGIN_ROOT}`：`"command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/your-script.sh"`
4. 手动测试脚本：`./scripts/your-script.sh`

**钩子未在预期事件上触发**：

1. 验证事件名称是否正确（区分大小写）：`PostToolUse`，而不是 `postToolUse`
2. 检查匹配器模式是否匹配你的工具：`"matcher": "Write|Edit"` 用于文件操作
3. 确认钩子类型有效：`command`、`http`、`mcp_tool`、`prompt` 或 `agent`

### MCP 服务器故障排除

**服务器未启动**：

1. 检查命令是否存在且可执行
2. 验证所有路径使用 `${CLAUDE_PLUGIN_ROOT}` 变量
3. 检查 MCP 服务器日志：`claude --debug` 显示初始化错误
4. 在 Claude Code 之外手动测试服务器

**服务器工具未出现**：

1. 确保服务器在 `.mcp.json` 或 `plugin.json` 中正确配置
2. 验证服务器正确实现了 MCP 协议
3. 检查调试输出中的连接超时

### 目录结构错误

**症状**：插件加载但组件（技能、代理、钩子）缺失。

**正确结构**：组件必须在插件根目录下，而不是在 `.claude-plugin/` 内。只有 `plugin.json` 属于 `.claude-plugin/`。

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      ← 仅清单在此
├── commands/            ← 在根级别
├── agents/              ← 在根级别
└── hooks/               ← 在根级别
```

如果你的组件在 `.claude-plugin/` 内，请将它们移到插件根目录。

**调试清单**：

1. 运行 `claude --debug` 并查找 "loading plugin" 消息
2. 检查每个组件目录是否列在调试输出中
3. 验证文件权限允许读取插件文件

***

## 分发和版本管理参考

### 版本管理

Claude Code 使用插件的版本作为缓存键来决定是否有可用更新。当你运行 `/plugin update` 或自动更新触发时，Claude Code 计算当前版本，如果与已安装的匹配则跳过更新。

版本从以下第一个设置的值解析：

1. 插件 `plugin.json` 中的 `version` 字段
2. 插件在 `marketplace.json` 中的市场条目的 `version` 字段
3. 插件源的 git commit SHA，适用于 git 托管市场中的 `github`、`url`、`git-subdir` 和相对路径源
4. `unknown`，适用于 `npm` 源或不在 git 仓库内的本地目录

这给你两种为插件版本化的方式：

| 方式                   | 方法                                                           | 更新行为                                                                                                                                                        | 最适合                                                |
| :--------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| **显式版本**           | 在 `plugin.json` 中设置 `"version": "2.1.0"`                  | 用户仅在你更新此字段时收到更新。推送新提交而不更新它没有效果，`/plugin update` 报告 "already at the latest version"。                                           | 具有稳定发布周期的已发布插件                          |
| **Commit-SHA 版本**    | 在 `plugin.json` 和市场条目中都省略 `version`                  | 用户在每次对插件 git 源的新提交时收到更新                                                                                                                      | 积极开发中的内部或团队插件                            |

如果你在 `plugin.json` 中设置了 `version`，你必须在每次希望用户收到更改时更新它。仅推送新提交是不够的，因为 Claude Code 看到相同的版本字符串并保留缓存副本。如果你在快速迭代，请不设置 `version`，以便使用 git commit SHA 代替。

如果使用显式版本，请遵循[语义化版本](https://semver.org)（`MAJOR.MINOR.PATCH`）：破坏性更改更新 MAJOR，新功能更新 MINOR，错误修复更新 PATCH。在 `CHANGELOG.md` 中记录更改。

***

## 另请参阅

* [插件](/zh/plugins) - 教程和实际用法
* [插件市场](/zh/plugin-marketplaces) - 创建和管理市场
* [技能](/zh/skills) - 技能开发详情
* [子代理](/zh/sub-agents) - 代理配置和能力
* [钩子](/zh/hooks) - 事件处理和自动化
* [MCP](/zh/mcp) - 外部工具集成
* [设置](/zh/settings) - 插件的配置选项
