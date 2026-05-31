> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 用技能扩展 Claude

> 创建、管理和分享技能以扩展 Claude Code 中 Claude 的能力。包括自定义命令和内置技能。

技能扩展了 Claude 的能力。创建一个 `SKILL.md` 文件并写入指令，Claude 会将其添加到工具箱中。Claude 会在相关时使用技能，或者你也可以通过 `/skill-name` 直接调用。

当你反复向聊天中粘贴相同的指令、检查清单或多步骤流程时，或者当 CLAUDE.md 中的某个部分已经膨胀为流程而非事实时，就应该创建技能。与 CLAUDE.md 内容不同，技能的正文只在使用时才加载，因此冗长的参考材料几乎不会产生开销，直到你需要它为止。

对于内置命令如 `/help` 和 `/compact`，以及内置技能如 `/debug` 和 `/code-review`，请参阅[命令参考](/zh/commands)。

**自定义命令已合并到技能中。** `.claude/commands/deploy.md` 中的文件和 `.claude/skills/deploy/SKILL.md` 中的技能都会创建 `/deploy` 并以相同方式工作。你现有的 `.claude/commands/` 文件继续有效。技能增加了可选功能：用于支持文件的目录、[控制调用者](#控制谁可以调用技能)的 frontmatter，以及 Claude 在相关时自动加载它们的能力。

Claude Code 技能遵循 [Agent Skills](https://agentskills.io) 开放标准，该标准适用于多个 AI 工具。Claude Code 通过[调用控制](#控制谁可以调用技能)、[子代理执行](#在子代理中运行技能)和[动态上下文注入](#注入动态上下文)等附加功能扩展了该标准。

## 内置技能

Claude Code 包含一组在每个会话中都可用的内置技能，包括 `/code-review`、`/batch`、`/debug`、`/loop` 和 `/claude-api`。与大多数直接执行固定逻辑的内置命令不同，内置技能是基于提示词的：它们给 Claude 详细的指令，让其使用工具来编排工作。你调用它们的方式与任何其他技能相同，输入 `/` 后跟技能名称。

内置技能与内置命令一起列在[命令参考](/zh/commands)中，在"用途"列中标记为 **Skill**。

### 运行和验证你的应用

三个内置技能协同工作，启动你的应用并根据运行中的应用（而非仅测试）来确认更改：

| 技能                   | 用途                                                                                                               |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `/run`                 | 启动并驱动你的应用以查看更改效果                                                                                   |
| `/verify`              | 构建并运行你的应用，确认代码更改是否按预期工作，不回退到测试或类型检查                                               |
| `/run-skill-generator` | 教会 `/run` 和 `/verify` 如何构建和启动你的项目                                                                    |

{/* min-version: 2.1.145 */}这三个技能都需要 Claude Code v2.1.145 或更高版本。

`/run` 和 `/verify` 无需设置即可工作。它们根据你的项目类型（CLI、服务器、TUI、浏览器驱动）以及 README、`package.json` 或 `Makefile` 中的内容来推断启动方式。对于需要标准启动之外的任何内容的项目（数据库、环境文件、图形会话、多步骤构建），这种推断会变得不可靠。

`/run-skill-generator` 则记录构建方案。它从干净环境启动你的应用，捕获成功的方法（安装命令、环境变量、启动脚本），并将其作为按项目技能提交到 `.claude/skills/run-<name>/`。之后，`/run`、`/verify` 和仓库中的任何其他代理都会遵循记录的方案，而不是重新发现。每个项目运行一次 `/run-skill-generator`，如果构建或启动过程发生变化则再次运行。

## 快速开始

### 创建你的第一个技能

此示例创建一个技能，用于总结 git 仓库中未提交的更改并标记任何风险。它在 Claude 读取之前将实时 diff 拉入提示词中，因此响应基于你的实际工作树，而非 Claude 从打开的文件中猜测的内容。Claude 会在你询问更改时自动加载该技能，或者你可以通过 `/summarize-changes` 直接调用它。

**创建技能目录**

在你的个人技能文件夹中为技能创建一个目录。个人技能在你的所有项目中都可用。

```bash
mkdir -p ~/.claude/skills/summarize-changes
```

**编写 SKILL.md**

每个技能都需要一个 `SKILL.md` 文件，包含两个部分：`---` 标记之间的 YAML frontmatter，告诉 Claude 何时使用该技能；以及 markdown 内容，包含技能运行时 Claude 遵循的指令。目录名称成为你输入的命令，`description` 帮助 Claude 决定何时自动加载技能。

保存到 `~/.claude/skills/summarize-changes/SKILL.md`：

```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks you notice such as missing error handling, hardcoded values, or tests that need updating. If the diff is empty, say there are no uncommitted changes.
```

`` !`git diff HEAD` `` 行使用了[动态上下文注入](#注入动态上下文)：Claude Code 运行命令并在 Claude 看到技能内容之前用输出替换该行，因此指令到达时已经内联了当前 diff。

**测试技能**

打开一个 git 项目，对任何文件进行小编辑，然后运行 `claude` 启动 Claude Code。你可以通过两种方式测试技能。

**让 Claude 自动调用它**，通过提出与描述匹配的问题：

```text
What did I change?
```

**或者直接调用它**，使用技能名称：

```text
/summarize-changes
```

无论哪种方式，Claude 都应该回复你编辑的简要摘要和风险列表。

### 技能存放位置

存储技能的位置决定了谁可以使用它：

| 位置       | 路径                                                | 适用范围                       |
| :--------- | :-------------------------------------------------- | :----------------------------- |
| 企业       | 参见[托管设置](/zh/settings#settings-files)          | 组织中的所有用户               |
| 个人       | `~/.claude/skills/<skill-name>/SKILL.md`            | 你的所有项目                   |
| 项目       | `.claude/skills/<skill-name>/SKILL.md`              | 仅限此项目                     |
| 插件       | `<plugin>/skills/<skill-name>/SKILL.md`             | 插件启用的地方                 |

当技能在不同层级共享相同名称时，企业覆盖个人，个人覆盖项目。插件技能使用 `plugin-name:skill-name` 命名空间，因此不会与其他层级冲突。如果你在 `.claude/commands/` 中有文件，它们以相同方式工作，但如果技能和命令共享相同名称，技能优先。

在技能文件夹中添加 `.claude-plugin/plugin.json`，它将作为名为 `<name>@skills-dir` 的[插件](/zh/plugins-reference#skills-directory-plugins)加载，因此可以捆绑代理、钩子和 MCP 服务器。在项目的 `.claude/skills/` 中，这需要先接受工作区信任对话框。

#### 实时更改检测

Claude Code 监视技能目录的文件更改。在 `~/.claude/skills/`、项目的 `.claude/skills/` 或 `--add-dir` 目录内的 `.claude/skills/` 下添加、编辑或删除技能，会在当前会话内生效，无需重启。创建会话启动时不存在的顶级技能目录需要重启 Claude Code，以便新目录被监视。

实时更改检测仅覆盖 `SKILL.md` 文本。对于同时也是[插件](/zh/plugins-reference#skills-directory-plugins)的技能文件夹，对 `hooks/`、`.mcp.json`、`agents/` 和 `output-styles/` 的更改需要 `/reload-plugins` 才能生效。

#### 从父目录和嵌套目录自动发现

项目技能从启动目录及向上直到仓库根目录的每个父目录中的 `.claude/skills/` 加载，因此在子目录中启动 Claude 仍然会获取在根目录定义的技能。当你在启动目录以下的子目录中处理文件时，Claude Code 还会按需从嵌套的 `.claude/skills/` 目录中发现技能。例如，如果你正在编辑 `packages/frontend/` 中的文件，Claude Code 还会在 `packages/frontend/.claude/skills/` 中查找技能。这支持 monorepo 设置，其中各个包有自己的技能。

每个技能是一个以 `SKILL.md` 作为入口点的目录：

```text
my-skill/
├── SKILL.md           # 主要指令（必需）
├── template.md        # 供 Claude 填写的模板
├── examples/
│   └── sample.md      # 展示预期格式的示例输出
└── scripts/
    └── validate.sh    # Claude 可以执行的脚本
```

`SKILL.md` 包含主要指令，是必需的。其他文件是可选的，让你可以构建更强大的技能：供 Claude 填写的模板、展示预期格式的示例输出、Claude 可以执行的脚本或详细的参考文档。从你的 `SKILL.md` 中引用这些文件，以便 Claude 知道它们包含什么以及何时加载它们。详见[添加支持文件](#添加支持文件)。

`.claude/commands/` 中的文件仍然有效，并支持相同的 [frontmatter](#frontmatter-参考)。推荐使用技能，因为它们支持支持文件等附加功能。

#### 来自附加目录的技能

`--add-dir` 标志和 `/add-dir` 命令[授予文件访问权限](/zh/permissions#附加目录授予文件访问权限而非配置)而非配置发现，但技能是个例外：附加目录内的 `.claude/skills/` 会自动加载。此例外仅适用于 `--add-dir` 和 `/add-dir`。`settings.json` 中的 `permissions.additionalDirectories` 设置仅授予文件访问权限，不加载技能。有关编辑如何在会话中生效，请参阅[实时更改检测](#实时更改检测)。

其他 `.claude/` 配置（如子代理、命令和输出样式）不会从附加目录加载。有关加载和不加载内容的完整列表，以及跨项目共享配置的推荐方式，请参阅[例外表](/zh/permissions#附加目录授予文件访问权限而非配置)。

`--add-dir` 目录中的 CLAUDE.md 文件默认不加载。要加载它们，请设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`。参见[从附加目录加载](/zh/memory#load-from-additional-directories)。

## 配置技能

技能通过 `SKILL.md` 顶部的 YAML frontmatter 和后续的 markdown 内容进行配置。

### 技能内容类型

技能文件可以包含任何指令，但思考你想要如何调用它们有助于指导要包含的内容：

**参考内容**添加 Claude 应用到当前工作的知识。约定、模式、风格指南、领域知识。此内容内联运行，以便 Claude 可以将其与你的会话上下文一起使用。

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**任务内容**给 Claude 提供特定操作的分步指令，如部署、提交或代码生成。这些通常是你想通过 `/skill-name` 直接调用的操作，而不是让 Claude 决定何时运行它们。添加 `disable-model-invocation: true` 以防止 Claude 自动触发它。

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

你的 `SKILL.md` 可以包含任何内容，但思考你希望技能如何被调用（由你、由 Claude，或两者）以及你希望它在哪里运行（内联或在子代理中）有助于指导要包含的内容。对于复杂的技能，你还可以[添加支持文件](#添加支持文件)以保持主技能的专注。

正文本身保持简洁。一旦技能加载，其内容[在各轮之间保持在上下文中](#技能内容生命周期)，因此每一行都是循环 token 成本。说明要做什么，而不是叙述如何或为什么，并应用与 [CLAUDE.md 内容](/zh/best-practices#write-an-effective-claude-md)相同的简洁标准。

### Frontmatter 参考

除了 markdown 内容，你可以使用 `SKILL.md` 文件顶部 `---` 标记之间的 YAML frontmatter 字段来配置技能行为：

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

所有字段都是可选的。仅推荐 `description`，以便 Claude 知道何时使用该技能。

| 字段                       | 必需        | 描述                                                                                                                                                                                                                                                                                                               |
| :------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                     | 否          | 在技能列表中显示的名称。默认为目录名称。有关这与你输入调用技能的名称有何不同，请参阅[技能如何获取命令名称](#技能如何获取命令名称)。                                                                                                                                                                                 |
| `description`              | 推荐       | 技能的功能以及何时使用它。Claude 使用此字段来决定何时应用该技能。如果省略，则使用 markdown 内容的第一段。将关键用例放在前面：技能列表中的 `description` 和 `when_to_use` 组合文本在 1,536 个字符处截断，以减少上下文使用。                                                                                         |
| `when_to_use`              | 否          | Claude 应何时调用技能的附加上下文，如触发短语或示例请求。附加到技能列表中的 `description` 并计入 1,536 字符上限。                                                                                                                                                                                                     |
| `argument-hint`            | 否          | 自动完成期间显示的提示，指示预期参数。示例：`[issue-number]` 或 `[filename] [format]`。                                                                                                                                                                                                                             |
| `arguments`                | 否          | 技能内容中 [`$name` 替换](#可用字符串替换)的命名位置参数。接受空格分隔的字符串或 YAML 列表。名称按顺序映射到参数位置。                                                                                                                                                                                               |
| `disable-model-invocation` | 否          | 设置为 `true` 以防止 Claude 自动加载此技能。用于你想通过 `/name` 手动触发的工作流。还防止技能被[预加载到子代理](/zh/sub-agents#preload-skills-into-subagents)中。默认值：`false`。                                                                                                                                    |
| `user-invocable`           | 否          | 设置为 `false` 以从 `/` 菜单中隐藏。用于用户不应直接调用的背景知识。默认值：`true`。                                                                                                                                                                                                                                |
| `allowed-tools`            | 否          | 此技能激活时 Claude 无需请求权限即可使用的工具。接受空格或逗号分隔的字符串，或 YAML 列表。                                                                                                                                                                                                                          |
| `disallowed-tools`         | 否          | 此技能激活时从 Claude 可用池中移除的工具。用于不应调用某些工具的自主技能，例如后台循环中的 `AskUserQuestion`。接受空格或逗号分隔的字符串，或 YAML 列表。限制在你发送下一条消息时清除。                                                                                                                                |
| `model`                    | 否          | 此技能激活时使用的模型。覆盖应用于当前轮次的剩余部分，不会保存到设置中；会话模型在你的下一个提示词后恢复。接受与 [`/model`](/zh/model-config) 相同的值，或 `inherit` 以保持活动模型。                                                                                                                                 |
| `effort`                   | 否          | 此技能激活时的[努力级别](/zh/model-config#adjust-effort-level)。覆盖会话努力级别。默认值：从会话继承。选项：`low`、`medium`、`high`、`xhigh`、`max`；可用级别取决于模型。                                                                                                                                            |
| `context`                  | 否          | 设置为 `fork` 以在分叉的子代理上下文中运行。                                                                                                                                                                                                                                                                       |
| `agent`                    | 否          | 设置 `context: fork` 时使用哪种子代理类型。                                                                                                                                                                                                                                                                        |
| `hooks`                    | 否          | 限定在此技能生命周期内的钩子。有关配置格式，请参阅[技能和代理中的钩子](/zh/hooks#hooks-in-skills-and-agents)。                                                                                                                                                                                                      |
| `paths`                    | 否          | 限制此技能何时激活的 glob 模式。接受逗号分隔的字符串或 YAML 列表。设置后，Claude 仅在处理匹配模式的文件时自动加载技能。使用与[路径特定规则](/zh/memory#path-specific-rules)相同的格式。                                                                                                                              |
| `shell`                    | 否          | 此技能中 `` !`command` `` 和 ` ```! ` 块使用的 shell。接受 `bash`（默认）或 `powershell`。设置 `powershell` 在 Windows 上通过 PowerShell 运行内联 shell 命令。需要 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`。                                                                                                              |

#### 技能如何获取命令名称

你输入调用技能的命令来自技能文件的位置。Frontmatter 的 `name` 字段设置技能列表中显示的标签，除了插件根目录的 `SKILL.md` 外，不会改变你在 `/` 后输入的内容。

下表显示了每种布局中命令名称的来源：

| 技能位置                                                   | 命令名称来源                                                   | 示例                                                                                                                             |
| :--------------------------------------------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `~/.claude/skills/` 或 `.claude/skills/` 下的技能目录       | 目录名称                                                       | `.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging`                                                                     |
| `.claude/commands/` 下的文件                                | 不带扩展名的文件名                                              | `.claude/commands/deploy.md` → `/deploy`                                                                                         |
| 插件 `skills/` 子目录                                      | 目录名称，带插件命名空间                                        | `my-plugin/skills/review/SKILL.md` → `/my-plugin:review`                                                                         |
| 插件根目录 `SKILL.md`                                       | Frontmatter `name`，以插件目录名称作为后备                      | `my-plugin/SKILL.md` 且 `name: review` → `/my-plugin:review`。参见[路径行为规则](/zh/plugins-reference#path-behavior-rules)       |

插件根目录的情况是 `name` 设置命令名称的唯一位置，因为没有技能目录可以从中获取。如果 frontmatter 中未设置 `name`，则使用插件的目录名称。

#### 可用字符串替换

技能支持技能内容中动态值的字符串替换：

| 变量                   | 描述                                                                                                                                                                                                                                                                                 |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ARGUMENTS`           | 调用技能时传递的所有参数。如果内容中没有 `$ARGUMENTS`，参数将以 `ARGUMENTS: <value>` 附加。                                                                                                                                                                                          |
| `$ARGUMENTS[N]`        | 通过从 0 开始的索引访问特定参数，如 `$ARGUMENTS[0]` 表示第一个参数。                                                                                                                                                                                                                 |
| `$N`                   | `$ARGUMENTS[N]` 的简写，如 `$0` 表示第一个参数，`$1` 表示第二个。                                                                                                                                                                                                                    |
| `$name`                | [`arguments`](#frontmatter-参考) frontmatter 列表中声明的命名参数。名称按顺序映射到位置，因此 `arguments: [issue, branch]` 时占位符 `$issue` 展开为第一个参数，`$branch` 展开为第二个参数。                                                                                            |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID。用于日志记录、创建会话特定文件或将技能输出与会话关联。                                                                                                                                                                                                                  |
| `${CLAUDE_EFFORT}`     | 当前努力级别：`low`、`medium`、`high`、`xhigh` 或 `max`。Ultracode 不是独立级别，报告为 `xhigh`。使用此变量根据活动努力设置调整技能指令。                                                                                                                                            |
| `${CLAUDE_SKILL_DIR}`  | 包含技能 `SKILL.md` 文件的目录。对于插件技能，这是插件内技能的子目录，而非插件根目录。在 bash 注入命令中使用此变量来引用与技能捆绑的脚本或文件，无论当前工作目录是什么。                                                                                                               |

索引参数使用 shell 风格的引号，因此将多词值用引号括起来作为单个参数传递。例如，`/my-skill "hello world" second` 使 `$0` 展开为 `hello world`，`$1` 展开为 `second`。`$ARGUMENTS` 占位符始终展开为输入的完整参数字符串。

**使用替换的示例：**

```yaml
---
name: session-logger
description: Log activity for this session
---

Log the following to logs/${CLAUDE_SESSION_ID}.log:

$ARGUMENTS
```

### 添加支持文件

技能可以在其目录中包含多个文件。这使 `SKILL.md` 专注于要点，同时让 Claude 仅在需要时访问详细的参考材料。大型参考文档、API 规范或示例集合不需要每次技能运行时都加载到上下文中。

```text
my-skill/
├── SKILL.md（必需 - 概述和导航）
├── reference.md（详细 API 文档 - 需要时加载）
├── examples.md（使用示例 - 需要时加载）
└── scripts/
    └── helper.py（实用脚本 - 执行，不加载）
```

从 `SKILL.md` 中引用支持文件，以便 Claude 知道每个文件包含什么以及何时加载它：

```markdown
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

将 `SKILL.md` 保持在 500 行以内。将详细的参考材料移到单独的文件中。

### 控制谁可以调用技能

默认情况下，你和 Claude 都可以调用任何技能。你可以输入 `/skill-name` 直接调用它，Claude 可以在与你的会话相关时自动加载它。两个 frontmatter 字段让你可以限制这一点：

* **`disable-model-invocation: true`**：只有你可以调用该技能。用于有副作用或你想控制时机的工作流，如 `/commit`、`/deploy` 或 `/send-slack-message`。你不希望 Claude 因为你的代码看起来准备好了就决定部署。

* **`user-invocable: false`**：只有 Claude 可以调用该技能。用于不能作为命令操作的背景知识。`legacy-system-context` 技能解释旧系统如何工作。Claude 应在相关时知道这一点，但 `/legacy-system-context` 对用户来说不是一个有意义的操作。

此示例创建一个只有你可以触发的部署技能。`disable-model-invocation: true` 字段防止 Claude 自动运行它：

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

以下是两个字段如何影响调用和上下文加载：

| Frontmatter                      | 你可以调用 | Claude 可以调用 | 何时加载到上下文中                                       |
| :------------------------------- | :--------- | :-------------- | :------------------------------------------------------- |
| （默认）                          | 是         | 是              | 描述始终在上下文中，调用时加载完整技能                    |
| `disable-model-invocation: true` | 是         | 否              | 描述不在上下文中，你调用时加载完整技能                    |
| `user-invocable: false`          | 否         | 是              | 描述始终在上下文中，调用时加载完整技能                    |

在常规会话中，技能描述会加载到上下文中以便 Claude 知道有哪些可用，但完整技能内容仅在调用时加载。[预加载技能的子代理](/zh/sub-agents#preload-skills-into-subagents)的工作方式不同：完整技能内容在启动时注入。

### 技能内容生命周期

当你或 Claude 调用技能时，渲染的 `SKILL.md` 内容作为单条消息进入会话，并在会话的剩余时间里保持在那里。Claude Code 不会在后续轮次中重新读取技能文件，因此将应贯穿整个任务的指导写为常设指令，而非一次性步骤。

[自动压缩](/zh/how-claude-code-works#when-context-fills-up)在 token 预算内将调用的技能向前携带。当会话被总结以释放上下文时，Claude Code 在总结后重新附加每个技能的最近一次调用，保留每个技能的前 5,000 个 token。重新附加的技能共享 25,000 个 token 的组合预算。Claude Code 从最近调用的技能开始填充此预算，因此如果你在一个会话中调用了多个技能，较旧的技能可能在压缩后被完全丢弃。

如果技能似乎在第一次响应后停止影响行为，内容通常仍然存在，模型正在选择其他工具或方法。加强技能的 `description` 和指令，使模型继续优先选择它，或使用[钩子](/zh/hooks)来确定性地强制行为。如果技能较大或你在它之后调用了其他几个技能，请在压缩后重新调用它以恢复完整内容。

### 为技能预批准工具

`allowed-tools` 字段在技能激活时授予列出的工具权限，因此 Claude 无需提示你批准即可使用它们。它不限制哪些工具可用：每个工具仍然可调用，你的[权限设置](/zh/permissions)仍然管理未列出的工具。

对于签入项目 `.claude/skills/` 目录的技能，`allowed-tools` 在你接受该文件夹的工作区信任对话框后生效，与 `.claude/settings.json` 中的权限规则相同。在信任仓库之前审查项目技能，因为技能可以授予自己广泛的工具访问权限。

此技能让你在调用时无需逐次批准即可运行 git 命令：

```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
```

要阻止技能使用某些工具，请在[权限设置](/zh/permissions)中添加拒绝规则。

### 向技能传递参数

你和 Claude 都可以在调用技能时传递参数。参数可通过 `$ARGUMENTS` 占位符使用。

此技能按编号修复 GitHub issue。`$ARGUMENTS` 占位符会被技能名称后的任何内容替换：

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

当你运行 `/fix-issue 123` 时，Claude 收到"Fix GitHub issue 123 following our coding standards..."

如果你使用参数调用技能但技能不包含 `$ARGUMENTS`，Claude Code 会将 `ARGUMENTS: <your input>` 附加到技能内容末尾，以便 Claude 仍然看到你输入的内容。

要按位置访问单个参数，使用 `$ARGUMENTS[N]` 或更短的 `$N`：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $ARGUMENTS[0] component from $ARGUMENTS[1] to $ARGUMENTS[2].
Preserve all existing behavior and tests.
```

运行 `/migrate-component SearchBar React Vue` 将 `$ARGUMENTS[0]` 替换为 `SearchBar`，`$ARGUMENTS[1]` 替换为 `React`，`$ARGUMENTS[2]` 替换为 `Vue`。使用 `$N` 简写的同一技能：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

## 高级模式

### 注入动态上下文

`` !`<command>` `` 语法在技能内容发送给 Claude 之前运行 shell 命令。命令输出替换占位符，因此 Claude 接收实际数据，而非命令本身。

此技能通过使用 GitHub CLI 获取实时 PR 数据来总结拉取请求。`` !`gh pr diff` `` 和其他命令先运行，其输出被插入到提示词中：

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

当此技能运行时：

1. 每个 `` !`<command>` `` 立即执行（在 Claude 看到任何内容之前）
2. 输出替换技能内容中的占位符
3. Claude 接收带有实际 PR 数据的完整渲染提示词

这是预处理，不是 Claude 执行的内容。Claude 只看到最终结果。

替换在原始文件上运行一次。命令输出作为纯文本插入，不会重新扫描以查找进一步的 `` !`<command>` `` 占位符，因此命令无法发出占位符供后续遍历展开。

内联形式仅在 `!` 出现在行首或紧跟空白字符时被识别。如果 `!` 跟在另一个字符后面，如 `` KEY=!`cmd` ``，占位符保留为字面文本且命令不会运行。

对于多行命令，使用以 ` ```! ` 开头的围栏代码块代替内联形式：

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

要为来自用户、项目、插件或[附加目录](#来自附加目录的技能)来源的技能和自定义命令禁用此行为，请在[设置](/zh/settings)中设置 `"disableSkillShellExecution": true`。每个命令被替换为 `[shell command execution disabled by policy]` 而非运行。内置和托管技能不受影响。此设置在[托管设置](/zh/permissions#managed-settings)中最有用，用户无法覆盖它。

要在技能运行时请求更深入的推理，在技能内容的任何位置包含 `ultrathink`。参见[使用 ultrathink 进行一次性深度推理](/zh/model-config#use-ultrathink-for-one-off-deep-reasoning)。

### 在子代理中运行技能

当你想让技能在隔离环境中运行时，在 frontmatter 中添加 `context: fork`。技能内容成为驱动子代理的提示词。它无法访问你的会话历史。

`context: fork` 仅对有明确指令的技能有意义。如果你的技能包含"使用这些 API 约定"等指南而没有任务，子代理会收到指南但没有可操作的提示词，并在没有有意义的输出的情况下返回。

技能和[子代理](/zh/sub-agents)在两个方向上协同工作：

| 方式                          | 系统提示词                 | 任务                        | 同时加载                                                |
| :---------------------------- | :------------------------- | :-------------------------- | :------------------------------------------------------ |
| 使用 `context: fork` 的技能    | 来自代理类型                | SKILL.md 内容               | CLAUDE.md，除非代理是 Explore 或 Plan                   |
| 使用 `skills` 字段的子代理     | 子代理的 markdown 正文      | Claude 的委派消息            | 预加载的技能 + CLAUDE.md                                |

使用 `context: fork` 时，你在技能中编写任务并选择代理类型来执行它。内置的 Explore 和 Plan 代理[跳过 CLAUDE.md 和 git 状态](/zh/sub-agents#what-loads-at-startup)以保持其上下文较小，因此使用 `agent: Explore` 的分叉技能只看到 SKILL.md 内容和代理自己的系统提示词。对于相反的情况，即你定义一个使用技能作为参考材料的自定义子代理，请参阅[子代理](/zh/sub-agents#preload-skills-into-subagents)。

#### 示例：使用 Explore 代理的研究技能

此技能在分叉的 Explore 代理中运行研究。技能内容成为任务，代理提供针对代码库探索优化的只读工具：

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

当此技能运行时：

1. 创建一个新的隔离上下文
2. 子代理接收技能内容作为其提示词（"Research \$ARGUMENTS thoroughly..."）
3. `agent` 字段决定执行环境（模型、工具和权限）
4. 结果被总结并返回到你的主会话

`agent` 字段指定使用哪种子代理配置。选项包括内置代理（`Explore`、`Plan`、`general-purpose`）或 `.claude/agents/` 中的任何自定义子代理。如果省略，使用 `general-purpose`。

### 限制 Claude 的技能访问

默认情况下，Claude 可以调用任何未设置 `disable-model-invocation: true` 的技能。定义了 `allowed-tools` 的技能在激活时授予 Claude 无需逐次批准即可使用这些工具的权限。你的[权限设置](/zh/permissions)仍然管理所有其他工具的基线批准行为。一些内置命令也可通过 Skill 工具使用，包括 `/init`、`/review` 和 `/security-review`。其他内置命令如 `/compact` 则不可用。

三种控制 Claude 可以调用哪些技能的方式：

**禁用所有技能**，在 `/permissions` 中拒绝 Skill 工具：

```text
# 添加到拒绝规则：
Skill
```

**允许或拒绝特定技能**，使用[权限规则](/zh/permissions)：

```text
# 仅允许特定技能
Skill(commit)
Skill(review-pr *)

# 拒绝特定技能
Skill(deploy *)
```

权限语法：`Skill(name)` 精确匹配，`Skill(name *)` 带任意参数的前缀匹配。

**隐藏单个技能**，在其 frontmatter 中添加 `disable-model-invocation: true`。这会将技能从 Claude 的上下文中完全移除。

`user-invocable` 字段仅控制菜单可见性，而非 Skill 工具访问。使用 `disable-model-invocation: true` 来阻止程序化调用。

### 从设置覆盖技能可见性

`skillOverrides` 设置从你的[设置](/zh/settings)而非技能自身的 frontmatter 控制技能可见性。用于你不想编辑其 SKILL.md 的技能，如签入共享项目仓库或由 MCP 服务器提供的技能。`/skills` 菜单为你编写它：高亮显示技能并按 `Space` 循环状态，然后按 `Enter` 保存到 `.claude/settings.local.json`。

每个键是技能名称，每个值是四种状态之一：

| 值                      | 列示给 Claude        | 在 `/` 菜单中 |
| :---------------------- | :------------------- | :------------ |
| `"on"`                  | 名称和描述            | 是            |
| `"name-only"`           | 仅名称               | 是            |
| `"user-invocable-only"` | 隐藏                 | 是            |
| `"off"`                 | 隐藏                 | 隐藏          |

`skillOverrides` 中不存在的技能被视为 `"on"`。以下示例将一个技能折叠为仅名称，另一个完全关闭：

```json
{
  "skillOverrides": {
    "legacy-context": "name-only",
    "deploy": "off"
  }
}
```

插件技能不受 `skillOverrides` 影响。通过 `/plugin` 管理它们。

## 分享技能

技能可以根据你的受众在不同的范围分发：

* **项目技能**：将 `.claude/skills/` 提交到版本控制
* **插件**：在你的[插件](/zh/plugins)中创建 `skills/` 目录
* **托管**：通过[托管设置](/zh/settings#settings-files)组织范围内部署

### 生成可视化输出

技能可以捆绑和运行任何语言的脚本，赋予 Claude 超越单个提示词所能实现的能力。一个强大的模式是生成可视化输出：在浏览器中打开的交互式 HTML 文件，用于探索数据、调试或创建报告。

此示例创建一个代码库浏览器：一个交互式树形视图，你可以在其中展开和折叠目录、一目了然地查看文件大小，并通过颜色识别文件类型。

创建技能目录：

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

保存到 `~/.claude/skills/codebase-visualizer/SKILL.md`。描述告诉 Claude 何时激活此技能，指令告诉 Claude 运行捆绑的脚本。脚本路径使用 [`${CLAUDE_SKILL_DIR}`](#可用字符串替换)，因此无论技能安装在个人、项目还是插件级别，都能正确解析：

````yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python3 *)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure with collapsible directories.

## Usage

Run the visualization script from your project root:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/visualize.py .
```

This creates `codebase-map.html` in the current directory and opens it in your default browser.

## What the visualization shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Colors**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
````

保存到 `~/.claude/skills/codebase-visualizer/scripts/visualize.py`。此脚本扫描目录树并生成一个自包含的 HTML 文件，包含：

* **摘要侧边栏**，显示文件数、目录数、总大小和文件类型数
* **条形图**，按文件类型分解代码库（按大小排序的前 8 个）
* **可折叠树**，你可以在其中展开和折叠目录，带有颜色编码的文件类型指示器

该脚本需要 Python 3 但仅使用内置库，因此无需安装任何包：

```python expandable
#!/usr/bin/env python3
"""Generate an interactive collapsible tree visualization of a codebase."""

import json
import sys
import webbrowser
from html import escape
from pathlib import Path
from collections import Counter

IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build'}

def scan(path: Path, stats: dict) -> dict:
    result = {"name": path.name, "children": [], "size": 0}
    try:
        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                result["children"].append({"name": item.name, "size": size, "ext": ext})
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
    }
    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="width:{(size/total_size)*100}%;background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )
    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Explorer</title>
  <style>
    body {{ font: 14px/1.5 system-ui, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }}
    .container {{ display: flex; height: 100vh; }}
    .sidebar {{ width: 280px; background: #252542; padding: 20px; border-right: 1px solid #3d3d5c; overflow-y: auto; flex-shrink: 0; }}
    .main {{ flex: 1; padding: 20px; overflow-y: auto; }}
    h1 {{ margin: 0 0 10px 0; font-size: 18px; }}
    h2 {{ margin: 20px 0 10px 0; font-size: 14px; color: #888; text-transform: uppercase; }}
    .stat {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3d3d5c; }}
    .stat-value {{ font-weight: bold; }}
    .bar-row {{ display: flex; align-items: center; margin: 6px 0; }}
    .bar-label {{ width: 55px; font-size: 12px; color: #aaa; }}
    .bar {{ height: 18px; border-radius: 3px; }}
    .bar-pct {{ margin-left: 8px; font-size: 12px; color: #666; }}
    .tree {{ list-style: none; padding-left: 20px; }}
    details {{ cursor: pointer; }}
    summary {{ padding: 4px 8px; border-radius: 4px; }}
    summary:hover {{ background: #2d2d44; }}
    .folder {{ color: #ffd700; }}
    .file {{ display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }}
    .file:hover {{ background: #2d2d44; }}
    .size {{ color: #888; margin-left: auto; font-size: 12px; }}
    .dot {{ width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <h1>📊 Summary</h1>
      <div class="stat"><span>Files</span><span class="stat-value">{stats["files"]:,}</span></div>
      <div class="stat"><span>Directories</span><span class="stat-value">{stats["dirs"]:,}</span></div>
      <div class="stat"><span>Total size</span><span class="stat-value">{fmt(data["size"])}</span></div>
      <div class="stat"><span>File types</span><span class="stat-value">{len(stats["extensions"])}</span></div>
      <h2>By file type</h2>
      {lang_bars}
    </div>
    <div class="main">
      <h1>📁 {escape(data["name"])}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};
    function fmt(b) {{ if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }}
    function esc(s) {{ return s.replace(/[&<>"']/g, c => ({{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}}[c])); }}
    function render(node, parent) {{
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        det.innerHTML = `<summary><span class="folder">📁 ${{esc(node.name)}}</span><span class="size">${{fmt(node.size)}}</span></summary>`;
        const ul = document.createElement('ul'); ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul));
        det.appendChild(ul);
        const li = document.createElement('li'); li.appendChild(det); parent.appendChild(li);
      }} else {{
        const li = document.createElement('li'); li.className = 'file';
        li.innerHTML = `<span class="dot" style="background:${{colors[node.ext]||'#6b7280'}}"></span>${{esc(node.name)}}<span class="size">${{fmt(node.size)}}</span>`;
        parent.appendChild(li);
      }}
    }}
    data.children.forEach(c => render(c, document.getElementById('root')));
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-map.html')
    generate_html(data, stats, out)
    print(f'Generated {out.absolute()}')
    webbrowser.open(f'file://{out.absolute()}')
```

要测试，在任何项目中打开 Claude Code 并询问"Visualize this codebase."Claude 运行脚本，生成 `codebase-map.html`，并在浏览器中打开它。

此模式适用于任何可视化输出：依赖图、测试覆盖率报告、API 文档或数据库架构可视化。捆绑的脚本完成工作，而 Claude 处理编排。

## 故障排除

### 技能未触发

如果 Claude 在预期时未使用你的技能：

1. 检查描述是否包含用户自然会说的关键词
2. 验证技能是否出现在 `What skills are available?` 中
3. 尝试重新表述你的请求以更接近描述
4. 如果技能是用户可调用的，通过 `/skill-name` 直接调用它

### 技能触发过于频繁

如果 Claude 在你不想要时使用了你的技能：

1. 使描述更具体
2. 如果你只想要手动调用，添加 `disable-model-invocation: true`

### 技能描述被截断

技能描述会加载到上下文中以便 Claude 知道有哪些可用。所有技能名称始终包含在内，但如果你有很多技能，描述会被缩短以适应字符预算，这可能会剥离 Claude 匹配请求所需的关键词。预算按模型上下文窗口的 1% 缩放。当溢出时，你最少调用的技能的描述会先被丢弃，因此你实际使用的技能保留完整文本。运行 `/doctor` 以查看预算是否溢出以及哪些技能受到影响。

要提高预算，设置 [`skillListingBudgetFraction`](/zh/settings#available-settings) 设置（例如 `0.02` = 2%）或将 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 环境变量设置为固定的字符数。要为其他技能释放预算，在 [`skillOverrides`](#从设置覆盖技能可见性) 中将低优先级条目设置为 `"name-only"`，以便它们列出时不带描述。你也可以在源文件中精简 `description` 和 `when_to_use` 文本：将关键用例放在前面，因为每个条目的组合文本上限为 1,536 个字符，无论预算如何。上限可通过 [`maxSkillDescriptionChars`](/zh/settings#available-settings) 配置。

## 相关资源

* **[调试你的配置](/zh/debug-your-config)**：诊断技能未出现或未触发的原因
* **[子代理](/zh/sub-agents)**：将任务委派给专业代理
* **[插件](/zh/plugins)**：将技能与其他扩展一起打包和分发
* **[钩子](/zh/hooks)**：围绕工具事件自动化工作流
* **[记忆](/zh/memory)**：管理 CLAUDE.md 文件以获取持久上下文
* **[命令](/zh/commands)**：内置命令和内置技能的参考
* **[权限](/zh/permissions)**：控制工具和技能访问
