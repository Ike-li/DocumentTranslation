# 代理技能

使用代理技能为 Codex 扩展特定任务的能力。技能将指令、资源和可选脚本打包在一起，使 Codex 能够可靠地执行工作流。技能基于[开放代理技能标准](https://agentskills.io)构建。

技能是可复用工作流的创作格式。插件是 Codex 中可复用技能和应用的可安装分发单元。使用技能来设计工作流本身，然后在希望其他开发者安装时将其打包为[插件](https://developers.openai.com/codex/plugins/build)。

技能可在 Codex CLI、IDE 扩展和 Codex 应用中使用。

技能使用**渐进式披露**来高效管理上下文：Codex 首先加载每个技能的名称、描述和文件路径，仅在决定使用某个技能时才加载完整的 `SKILL.md` 指令。

Codex 会在上下文中包含一份初始可用技能列表，以便为任务选择合适的技能。为避免挤占提示词的其余内容，该列表上限约为模型上下文窗口的 2%，在上下文窗口未知时为 8,000 个字符。如果安装了大量技能，Codex 会优先缩短技能描述。对于非常大的技能集，部分技能可能会从初始列表中省略，Codex 会显示警告。

此预算仅适用于初始技能列表。当 Codex 选择某个技能时，仍会读取该技能的完整 SKILL.md 指令。

技能是一个包含 `SKILL.md` 文件以及可选脚本和引用的目录。`SKILL.md` 文件必须包含 `name` 和 `description`。

```
my-skill/
├── SKILL.md          # 必需：指令 + 元数据
├── scripts/          # 可选：可执行代码
├── references/       # 可选：文档
├── assets/           # 可选：模板、资源
└── agents/
    └── openai.yaml   # 可选：外观和依赖
```

## Codex 如何使用技能

Codex 可以通过两种方式激活技能：

1. **显式调用：** 在提示词中直接包含技能。在 CLI/IDE 中，运行 `/skills` 或输入 `$` 来提及技能。
2. **隐式调用：** 当你的任务匹配技能的 `description` 时，Codex 可以自动选择该技能。

由于隐式匹配依赖于 `description`，请编写简洁的描述，明确范围和边界。将关键用例和触发词前置，这样即使描述被缩短，Codex 仍能匹配该技能。

## 创建技能

首先使用内置创建器：

```text
$skill-creator
```

创建器会询问技能的功能、触发条件，以及是仅包含指令还是包含脚本。仅包含指令是默认选项。

你也可以手动创建技能，方法是创建一个包含 `SKILL.md` 文件的文件夹：

```md
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---

Skill instructions for Codex to follow.
```

Codex 会自动检测技能变更。如果更新未显示，请重启 Codex。

## 技能保存位置

Codex 从仓库、用户、管理员和系统位置读取技能。对于仓库，Codex 会从当前工作目录向上扫描到仓库根目录的每个目录中的 `.agents/skills`。如果两个技能共享相同的 `name`，Codex 不会合并它们；两者都可能出现在技能选择器中。

| 技能作用域 | 位置 | 建议用途 |
| :---------- | :--- | :------- |
| `REPO` | `$CWD/.agents/skills` <br /> 当前工作目录：你启动 Codex 的位置。 | 如果你在仓库或代码环境中，团队可以签入与工作文件夹相关的技能。例如，仅与微服务或模块相关的技能。 |
| `REPO` | `$CWD/../.agents/skills` <br /> 在 Git 仓库中启动 Codex 时 CWD 上方的文件夹。 | 如果你在包含嵌套文件夹的仓库中，组织可以签入与父文件夹中共享区域相关的技能。 |
| `REPO` | `$REPO_ROOT/.agents/skills` <br /> 在 Git 仓库中启动 Codex 时的最顶层根文件夹。 | 如果你在包含嵌套文件夹的仓库中，组织可以签入对仓库中所有人相关的技能。这些作为根技能，对仓库中的任何子文件夹可用。 |
| `USER` | `$HOME/.agents/skills` <br /> 签入用户个人文件夹的技能。 | 用于策划与用户相关的技能，适用于用户可能工作的任何仓库。 |
| `ADMIN` | `/etc/codex/skills` <br /> 签入机器或容器中共享系统位置的技能。 | 用于 SDK 脚本、自动化，以及签入机器上每个用户可用的默认管理员技能。 |
| `SYSTEM` | 由 OpenAI 与 Codex 捆绑。 | 适用于广大受众的有用技能，如 skill-creator 和 plan 技能。用户启动 Codex 时对所有人可用。 |

Codex 支持符号链接的技能文件夹，并在扫描这些位置时跟踪符号链接目标。

这些位置用于创作和本地发现。当你想要在单个仓库之外分发可复用技能，或可选地将其与应用集成捆绑时，请使用[插件](https://developers.openai.com/codex/plugins/build)。

## 使用插件分发技能

直接技能文件夹最适合本地创作和仓库范围的工作流。如果你想要分发可复用技能、将两个或更多技能捆绑在一起，或随应用集成一起发布技能，请将它们打包为[插件](https://developers.openai.com/codex/plugins/build)。

插件可以包含一个或多个技能。它们还可以可选地将应用映射、MCP 服务器配置和展示资源捆绑在一个包中。

## 安装精选技能供本地使用

要为你的本地 Codex 设置添加超出内置范围的精选技能，请使用 `$skill-installer`。例如，安装 `$linear` 技能：

```bash
$skill-installer linear
```

你还可以提示安装器从其他仓库下载技能。Codex 会自动检测新安装的技能；如果某个技能未显示，请重启 Codex。

将此用于本地设置和实验。要分发你自己的可复用技能，请优先使用插件。

## 启用或禁用技能

在 `~/.codex/config.toml` 中使用 `[[skills.config]]` 条目来禁用技能而不删除它：

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

更改 `~/.codex/config.toml` 后请重启 Codex。

## 可选元数据

添加 `agents/openai.yaml` 来配置 [Codex 应用](https://developers.openai.com/codex/app)中的 UI 元数据、设置调用策略，以及声明工具依赖，以获得更流畅的技能使用体验。

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

`allow_implicit_invocation`（默认：`true`）：设为 `false` 时，Codex 不会根据用户提示词隐式调用该技能；显式 `$skill` 调用仍然有效。

## 最佳实践

- 保持每个技能专注于一项工作。
- 优先使用指令而非脚本，除非你需要确定性行为或外部工具。
- 以祈使句编写步骤，明确输入和输出。
- 针对技能描述测试提示词，以确认正确的触发行为。

更多示例请参阅 [github.com/openai/skills](https://github.com/openai/skills) 和[代理技能规范](https://agentskills.io/specification)。
