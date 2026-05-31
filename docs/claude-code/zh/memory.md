> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# Claude 如何记住您的项目

> 使用 CLAUDE.md 文件为 Claude 提供持久化指令，并让 Claude 通过自动记忆功能自动积累学习成果。

每个 Claude Code 会话都从一个全新的上下文窗口开始。有两种机制可以在会话间传递知识：

* **CLAUDE.md 文件**：您编写的指令，用于为 Claude 提供持久化上下文
* **自动记忆**：Claude 根据您的纠正和偏好自己编写的笔记

本页涵盖如何：

* [编写和组织 CLAUDE.md 文件](#claude-如何记住您的项目)
* [使用 `.claude/rules/` 将规则限定到特定文件类型]
* [配置自动记忆](#使用-memory-查看和编辑) 以便 Claude 自动记录笔记
* 当指令未被遵循时进行[故障排除](#使用-memory-查看和编辑)

## CLAUDE.md 与自动记忆

Claude Code 拥有两个互补的记忆系统。两者都会在每次对话开始时加载。Claude 将其视为上下文，而非强制配置。要阻止某个动作而不受 Claude 决策影响，请使用 [PreToolUse 钩子](/zh/hooks-guide)。您的指令越具体、简洁，Claude 遵循它们的一致性就越高。

|                      | CLAUDE.md 文件                                   | 自动记忆                                                      |
| :------------------- | :------------------------------------------------ | :--------------------------------------------------------------- |
| **谁编写**           | 您                                                | Claude                                                           |
| **包含内容**         | 指令和规则                                        | 学习成果和模式                                                   |
| **作用范围**         | 项目、用户或组织                                  | 每个仓库，在工作树间共享                                         |
| **加载到**           | 每个会话                                          | 每个会话（前 200 行或 25KB）                                     |
| **用途**             | 编码标准、工作流、项目架构                        | 构建命令、调试见解、Claude 发现的偏好                             |

当您希望引导 Claude 的行为时，请使用 CLAUDE.md 文件。自动记忆让 Claude 能从您的纠正中学习，无需手动操作。

子代理也可以维护自己的自动记忆。详情请参阅[子代理配置](/zh/sub-agents#enable-persistent-memory)。

## CLAUDE.md 文件

CLAUDE.md 文件是 Markdown 文件，用于为项目、您的个人工作流或整个组织提供持久化指令。您以纯文本形式编写这些文件；Claude 在每次会话开始时读取它们。

### 何时添加到 CLAUDE.md

将 CLAUDE.md 视为您记录那些否则需要重复解释内容的地方。在以下情况添加：

* Claude 第二次犯同样的错误
* 代码审查发现了 Claude 本应了解的关于此代码库的内容
* 您在聊天中输入了与上次会话相同的纠正或澄清
* 新队友需要相同的上下文才能高效工作

将其保持为 Claude 在每次会话中都应掌握的事实：构建命令、约定、项目布局、“始终执行 X”的规则。如果一个条目是多步骤过程或仅对代码库的某个部分重要，请将其移至[技能](/zh/skills)或[路径限定的规则]。[功能概述](/zh/features-overview#build-your-setup-over-time)涵盖了何时使用每种机制。

### 选择放置 CLAUDE.md 文件的位置

CLAUDE.md 文件可以存在于多个位置，每个位置具有不同的作用范围。下表按加载顺序列出，从最广泛到最具体，以便项目指令在用户指令之后出现在上下文中。

| 作用范围               | 位置                                                                                                                                                                 | 用途                                                     | 使用案例示例                                                       | 共享对象                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| **托管策略**           | • macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br />• Linux 和 WSL: `/etc/claude-code/CLAUDE.md`<br />• Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | 由 IT/DevOps 管理的组织范围指令                          | 公司编码标准、安全策略、合规要求                                   | 组织内的所有用户               |
| **用户指令**           | `~/.claude/CLAUDE.md`                                                                                                                                                | 所有项目的个人偏好                                       | 代码风格偏好、个人工具快捷方式                                     | 仅限您（所有项目）             |
| **项目指令**           | `./CLAUDE.md` 或 `./.claude/CLAUDE.md`                                                                                                                               | 项目团队共享的指令                                       | 项目架构、编码标准、常见工作流                                     | 通过源代码管理共享给团队成员   |
| **本地指令**           | `./CLAUDE.local.md`                                                                                                                                                  | 个人特定于项目的偏好；添加到 `.gitignore`                | 您的沙箱 URL、首选测试数据                                         | 仅限您（当前项目）             |

工作目录上方目录层次结构中的 CLAUDE.md 和 CLAUDE.local.md 文件会在启动时完整加载。子目录中的文件会在 Claude 读取该目录中的文件时按需加载。完整的解析顺序请参阅 [CLAUDE.md 文件如何加载](#claude-如何记住您的项目)。

对于大型项目，您可以使用[项目规则]将指令拆分为按主题划分的文件。规则让您可以将指令限定到特定的文件类型或子目录。

### 设置项目 CLAUDE.md

项目 CLAUDE.md 可以存储在 `./CLAUDE.md` 或 `./.claude/CLAUDE.md`。创建此文件并添加适用于任何参与项目人员的指令：构建和测试命令、编码标准、架构决策、命名约定和常见工作流。这些指令通过版本控制与您的团队共享，因此应专注于项目级别的标准，而非个人偏好。

  运行 `/init` 可自动生成初始的 CLAUDE.md 文件。Claude 会分析你的代码库，创建包含构建命令、测试说明和项目规范的文件。若 CLAUDE.md 已存在，`/init` 将建议改进而非覆盖原有内容。可通过补充 Claude 无法自行发现的指令进一步优化。

  设置 `CLAUDE_CODE_NEW_INIT=1` 以启用交互式多阶段流程。`/init` 会询问需要设置哪些组件：CLAUDE.md 文件、技能或钩子。随后通过子代理探索代码库，通过后续问题填补信息缺失，并在写入文件前呈现可审查的方案。

### 编写有效的指令

CLAUDE.md 文件在每个会话开始时被加载到上下文窗口中，会与你的对话一起消耗 token。[上下文窗口可视化](/zh/context-window) 显示了 CLAUDE.md 相对于其他启动上下文加载的位置。由于它们是上下文而非强制配置，因此你编写指令的方式会影响 Claude 遵循它们的可靠性。具体、简洁、结构清晰的指令效果最佳。

**大小**：每个 CLAUDE.md 文件目标控制在 200 行以内。过长的文件会消耗更多上下文并降低遵循度。如果你的指令内容增长过多，可以使用[路径作用域规则](#路径特定规则)，这样指令仅在 Claude 处理匹配文件时加载。你也可以将内容拆分到[导入](#导入额外文件)文件中以方便组织，但导入的文件在启动时仍会被加载并进入上下文窗口。

**结构**：使用 Markdown 标题和项目符号对相关指令进行分组。Claude 以与读者相同的方式扫描结构：有组织的章节比密集的段落更容易遵循。

**具体性**：编写具体到可以验证的指令。例如：
* “使用 2 个空格缩进” 优于 “正确格式化代码”
* “在提交前运行 `npm test`” 优于 “测试你的更改”
* “API 处理器位于 `src/api/handlers/`” 优于 “保持文件有序”

**一致性**：如果两条规则相互矛盾，Claude 可能会随意选择其一。请定期审查你的 CLAUDE.md 文件、子目录中嵌套的 CLAUDE.md 文件以及 [`.claude/rules/`]，以删除过时或冲突的指令。在 monorepo 中，使用 [`claudeMdExcludes`](#claude-如何记住您的项目) 来跳过其他团队且与你的工作无关的 CLAUDE.md 文件。

### 导入额外文件

CLAUDE.md 文件可以使用 `@path/to/import` 语法导入额外文件。导入的文件会在启动时与引用它们的 CLAUDE.md 一起展开并加载到上下文中。

允许使用相对路径和绝对路径。相对路径是相对于包含该导入的文件进行解析，而非工作目录。导入的文件可以递归导入其他文件，最大深度为四层。

要引入一个 README、package.json 和一个工作流指南，可以在你的 CLAUDE.md 中任意位置使用 `@` 语法引用它们：
```text
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```
对于不应提交到版本控制中的私人项目级偏好，请在项目根目录下创建 `CLAUDE.local.md` 文件。该文件将与 `CLAUDE.md` 同时加载，处理方式相同。请将 `CLAUDE.local.md` 添加到您的 `.gitignore` 中，以免它被提交；运行 `/init` 并选择个人选项即可自动完成此操作。

如果您在同一仓库的多个 git 工作树中工作，一个被 gitignore 的 `CLAUDE.local.md` 只会存在于您创建它的工作树中。要在各工作树之间共享个人指令，请改为从您的主目录导入一个文件：
```text
# Individual Preferences
- @~/.claude/my-project-instructions.md
```


  Claude Code 在项目中首次遇到外部导入时，会显示一个审批对话框，其中列出相关文件。如果拒绝，这些导入将保持禁用状态，且该对话框不会再次出现。

如需更结构化的指令组织方式，请参阅 [`.claude/rules/`]。

### AGENTS.md

Claude Code 读取的是 `CLAUDE.md`，而非 `AGENTS.md`。如果您的仓库已使用 `AGENTS.md` 为其他编码代理提供指令，请创建一个 `CLAUDE.md` 文件并导入该文件，以便两个工具读取相同指令，无需重复编写。您也可以在导入语句下方添加 Claude 专用的指令。Claude 会在会话开始时加载导入的文件，然后追加其余内容：
```markdown CLAUDE.md
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```
如果你不需要添加Claude特定的内容，符号链接同样适用。
```bash
ln -s AGENTS.md CLAUDE.md
```
在 Windows 上创建符号链接需要管理员权限或开发者模式，因此请改用 `@AGENTS.md` 导入方式。

在已存在 `AGENTS.md` 的仓库中运行 [`/init`](/zh/commands) 会读取该文件，并将相关部分整合到生成的 `CLAUDE.md` 中。它还会读取其他工具配置，如 `.cursorrules` 和 `.windsurfrules`。

### CLAUDE.md 文件的加载方式

Claude Code 通过从当前工作目录向上遍历目录树来读取 CLAUDE.md 文件，沿途检查每个目录是否存在 `CLAUDE.md` 和 `CLAUDE.local.md` 文件。这意味着，如果你在 `foo/bar/` 目录下运行 Claude Code，它会加载来自 `foo/bar/CLAUDE.md`、`foo/CLAUDE.md` 以及同级目录下任何 `CLAUDE.local.md` 文件中的指令。

所有发现的文件会被串联并添加到上下文中，而不是相互覆盖。在目录树中，内容按从文件系统根目录到你的工作目录的顺序排列。以 `foo/bar/` 为例，`foo/CLAUDE.md` 会出现在 `foo/bar/CLAUDE.md` 之前，因此靠近你启动 Claude 位置的指令会被最后读取。在每个目录内，`CLAUDE.local.md` 会被附加在 `CLAUDE.md` 之后，因此你在该级别的个人笔记是 Claude 在该层级最后读取的内容。

Claude 也会发现你当前工作目录下子目录中的 `CLAUDE.md` 和 `CLAUDE.local.md` 文件。这些文件不会在启动时加载，而是在 Claude 读取这些子目录中的文件时被包含进来。

如果你在一个大型单一代码库中工作，其中其他团队的 CLAUDE.md 文件会被识别到，请使用 [`claudeMdExcludes`](#claude-如何记住您的项目) 来跳过它们。关于根目录和各目录 CLAUDE.md 文件的完整布局规则，请参阅[单一代码库和大型仓库](/zh/large-codebases)。

CLAUDE.md 文件中的块级 HTML 注释（`<!-- maintainer notes -->`）会在内容注入 Claude 上下文之前被剥离。可以用它们为人类维护者留下笔记，而无需消耗上下文 token。代码块内的注释会被保留。当你直接用 Read 工具打开 CLAUDE.md 文件时，注释仍然是可见的。

#### 从附加目录加载

`--add-dir` 标志使 Claude 能够访问主工作目录之外的附加目录。默认情况下，这些目录中的 CLAUDE.md 文件不会被加载。

要同时加载来自附加目录的记忆文件，请设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` 环境变量：
```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```
这会从附加目录加载 `CLAUDE.md`、`.claude/CLAUDE.md`、`.claude/rules/*.md` 和 `CLAUDE.local.md`。如果从 [`--setting-sources`](/zh/cli-reference) 中排除了 `local`，则 `CLAUDE.local.md` 将被跳过。

### 使用 `.claude/rules/` 组织规则

对于大型项目，您可以使用 `.claude/rules/` 目录将指令组织到多个文件中。这使得指令模块化，更便于团队维护。规则还可以[限定到特定的文件路径](#路径特定规则)，这样只有在 Claude 处理匹配的文件时才会加载到上下文中，从而减少干扰并节省上下文空间。

  规则在每个会话中加载，或在打开匹配文件时加载。对于不需要始终在上下文中的特定任务指令，请改用[技能](/zh/skills)，它们仅在您调用时或当Claude确定它们与您的提示词相关时才会加载。

#### 设置规则

将 Markdown 文件放置在项目的 `.claude/rules/` 目录中。每个文件应涵盖一个主题，使用描述性文件名如 `testing.md` 或 `api-design.md`。所有 `.md` 文件会被递归发现，因此你可以将规则组织到子目录中，例如 `frontend/` 或 `backend/`：
```text
your-project/
├── .claude/
│   ├── CLAUDE.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```
没有 [`paths` 前置数据](#路径特定规则) 的规则会在启动时加载，其优先级与 `.claude/CLAUDE.md` 相同。

#### 路径特定规则

可以使用包含 `paths` 字段的 YAML 前置数据，将规则的作用域限定于特定文件。这些条件规则仅在 Claude 处理与指定模式匹配的文件时生效。
```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```
没有 `paths` 字段的规则会无条件地加载，并应用于所有文件。路径作用域的规则仅在 Claude 读取匹配该模式的文件时触发，而非在每次工具使用时都触发。

在 `paths` 字段中使用 glob 模式来按扩展名、目录或任意组合匹配文件：

| 模式                   | 匹配内容                               |
| ---------------------- | -------------------------------------- |
| `**/*.ts`              | 任意目录下的所有 TypeScript 文件       |
| `src/**/*`             | `src/` 目录下的所有文件                |
| `*.md`                 | 项目根目录下的 Markdown 文件           |
| `src/components/*.tsx` | 特定目录下的 React 组件                |

你可以指定多个模式，并使用花括号扩展在一个模式中匹配多种扩展名：
```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```
#### 通过符号链接跨项目共享规则

`.claude/rules/` 目录支持符号链接，因此您可以维护一套共享规则集并将其链接到多个项目中。符号链接会被正常解析和加载，并且循环符号链接会被检测并优雅处理。

以下示例演示了如何链接一个共享目录和一个单独文件：
```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```
#### 用户级规则

`~/.claude/rules/` 中的个人规则适用于您机器上的每个项目。请用它们来存储非项目特定的偏好设置：
```text
~/.claude/rules/
├── preferences.md    # Your personal coding preferences
└── workflows.md      # Your preferred workflows
```
用户级规则在项目规则之前加载，这使得项目规则具有更高优先级。

### 管理大型团队的 CLAUDE.md

对于在各团队部署 Claude Code 的组织，您可以集中管理指令并控制加载哪些 CLAUDE.md 文件。

#### 部署组织范围的 CLAUDE.md

组织可部署一个集中管理的 CLAUDE.md 文件，该文件将应用于机器上的所有用户。此文件无法通过个人设置排除。


    * macOS：`/Library/Application Support/ClaudeCode/CLAUDE.md`
    * Linux 和 WSL：`/etc/claude-code/CLAUDE.md`
    * Windows：`C:\Program Files\ClaudeCode\CLAUDE.md`



    使用 MDM、Group Policy、Ansible 或类似工具将该文件分发到开发者机器。其他组织范围的配置选项请参阅[托管设置](/zh/permissions#managed-settings)。


`claudeMd` 键允许您将托管的 CLAUDE.md 内容直接放入 `managed-settings.json` 中，而无需部署单独的文件。

**作用范围**：机器上的每个 Claude Code 会话，以及每个仓库。若需特定于仓库的指引，请改为提交一个项目 CLAUDE.md 文件。

**优先级**：与托管的 CLAUDE.md 文件相同。在用户和项目 CLAUDE.md 之前加载。

**生效场景**：仅限于托管和策略设置。在用户、项目或本地设置中设置 `claudeMd` 不会产生任何效果。

以下示例将行为指令直接添加到托管的设置文件中：
```json
{
  "claudeMd": "Always run `make lint` before committing.\nNever push directly to main."
}
```
管理式 CLAUDE.md 和 [管理式设置](/zh/settings#settings-files) 用途不同。设置用于技术强制执行，而 CLAUDE.md 用于行为指导：

| 关注点                                        | 配置位置                                                  |
| :--------------------------------------------- | :-------------------------------------------------------- |
| 阻止特定工具、命令或文件路径                     | 管理式设置: `permissions.deny`                              |
| 强制沙箱隔离                                    | 管理式设置: `sandbox.enabled`                              |
| 环境变量与 API 提供商路由                       | 管理式设置: `env`                                         |
| 认证方式与组织锁定                               | 管理式设置: `forceLoginMethod`, `forceLoginOrgUUID`        |
| 代码风格与质量准则                               | 管理式 CLAUDE.md                                          |
| 数据处理与合规提醒                               | 管理式 CLAUDE.md                                          |
| 针对 Claude 的行为指令                           | 管理式 CLAUDE.md                                          |

无论 Claude 如何决定，客户端都会强制执行设置规则。CLAUDE.md 指令会影响 Claude 的行为，但并非硬性强制执行层。

#### 排除特定的 CLAUDE.md 文件

在大型 monorepo 中，祖先 CLAUDE.md 文件可能包含与您工作无关的指令。`claudeMdExcludes` 设置允许您通过路径或 glob 模式跳过特定文件。

此示例排除了顶层 CLAUDE.md 和来自父文件夹的 rules 目录。将其添加到 `.claude/settings.local.json` 中，这样排除设置将仅限于您的本地机器：
```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```
模式通过 Glob 语法与绝对文件路径进行匹配。你可以在任何[设置层级](/zh/settings#settings-files)配置 `claudeMdExcludes`：用户、项目、本地或托管策略。数组会在各层级间合并。

托管策略的 CLAUDE.md 文件无法被排除。这确保了无论个人设置如何，组织范围内的指令始终适用。

## 自动记忆

自动记忆功能让 Claude 无需你手动记录，就能在多个会话间积累知识。Claude 在工作中为自己保存笔记：构建命令、调试经验、架构笔记、代码风格偏好和工作流程习惯。Claude 并非每个会话都保存内容。它会根据信息在未来对话中的实用性，决定哪些内容值得记忆。

  自动记忆需要 Claude Code v2.1.59 或更高版本。请使用 `claude --version` 检查您的版本。

### 启用或禁用自动记忆

自动记忆默认开启。要切换该功能，可在会话中打开 `/memory` 并使用自动记忆切换开关，或在项目设置中配置 `autoMemoryEnabled`：
```json
{
  "autoMemoryEnabled": false
}
```
要通过环境变量禁用自动记忆功能，请设置 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`。

### 存储位置

每个项目都有自己的记忆目录，位于 `~/.claude/projects/<project>/memory/`。`<project>` 路径由 Git 仓库派生而来，因此同一仓库内的所有工作树和子目录共享同一个自动记忆目录。在 Git 仓库外部，则使用项目根目录。

若需将自动记忆存储在其他位置，请在您的 `settings.json` 中设置 `autoMemoryDirectory`。该设置可从任何[设置作用域](/zh/settings#settings-precedence)读取：用户、项目、本地、策略或 `--settings`。
```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```
该值必须是绝对路径或以 `~/` 开头。当在项目的 `.claude/settings.json` 或 `.claude/settings.local.json` 中设置时，只有在您接受该文件夹的工作区信任对话框后（该对话框同样用于控制钩子），该值才会生效。

该目录包含一个 `MEMORY.md` 入口文件和可选的主题文件：
```text
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Concise index, loaded into every session
├── debugging.md       # Detailed notes on debugging patterns
├── api-conventions.md # API design decisions
└── ...                # Any other topic files Claude creates
```
`MEMORY.md` 作为记忆目录的索引。Claude 在整个会话期间会读取和写入此目录中的文件，并使用 `MEMORY.md` 来跟踪存储位置。

自动记忆是本地机器特有的。同一 Git 仓库内的所有工作树和子目录共享一个自动记忆目录。文件不会跨机器或云环境共享。

### 工作原理

`MEMORY.md` 的前 200 行或前 25KB（以先到者为准）会在每次对话开始时加载。超过此阈值的内容在会话开始时不会被加载。Claude 通过将详细笔记移至单独的主题文件来保持 `MEMORY.md` 的简洁性。

此限制仅适用于 `MEMORY.md`。无论长度如何，`CLAUDE.md` 文件都会被完整加载，不过较短的文件能获得更好的遵守效果。

像 `debugging.md` 或 `patterns.md` 这样的主题文件在启动时不会被加载。Claude 会在需要时使用其标准文件工具按需读取它们。

Claude 会在你的会话期间读取和写入记忆文件。当你在 Claude Code 界面中看到 "Writing memory" 或 "Recalled memory" 时，Claude 正在主动更新或读取 `~/.claude/projects/<project>/memory/`。

### 审计和编辑你的记忆

自动记忆文件是纯 Markdown 文件，你可以随时编辑或删除。在会话中运行 [`/memory`](#使用-memory-查看和编辑) 以浏览和打开记忆文件。

## 使用 `/memory` 查看和编辑

`/memory` 命令列出了当前会话中加载的所有 CLAUDE.md、CLAUDE.local.md 和规则文件，让你可以打开或关闭自动记忆，并提供一个链接以打开自动记忆文件夹。选择任何文件即可在编辑器中打开它。

当你要求 Claude 记住某些事情时，例如 "always use pnpm, not npm" 或 "remember that the API tests require a local Redis instance"，Claude 会将其保存到自动记忆中。若要将指令添加到 CLAUDE.md，请直接要求 Claude，例如 "add this to CLAUDE.md"，或者通过 `/memory` 自己编辑文件。

## 排查记忆问题

以下是 CLAUDE.md 和自动记忆最常见的问题，以及调试它们的步骤。

### Claude 没有遵循我的 CLAUDE.md

CLAUDE.md 的内容是在系统提示词之后作为用户消息传递的，而不是作为系统提示词本身的一部分。Claude 会读取并尝试遵循它，但无法保证严格遵守，特别是对于模糊或冲突的指令。

调试步骤：

*   运行 `/memory` 以验证你的 CLAUDE.md 和 CLAUDE.local.md 文件是否被加载。如果某个文件未列出，Claude 就无法看到它。
*   检查相关的 CLAUDE.md 文件是否位于为你的会话加载的位置（参见 [选择放置 CLAUDE.md 文件的位置](#claude-如何记住您的项目)）。
*   使指令更具体。"Use 2-space indentation" 比 "format code nicely" 效果更好。
*   检查跨 CLAUDE.md 文件是否存在冲突的指令。如果两个文件对同一行为给出了不同的指导，Claude 可能会任意选择其中一个。

如果指令是必须在特定点执行的，例如在每次提交之前或每次文件编辑之后，请将其编写为 [钩子](/zh/hooks-guide)。钩子在固定的生命周期事件时作为 shell 命令执行，并且无论 Claude 决定做什么都会应用。

对于你希望在系统提示词级别使用的指令，请使用 [`--append-system-prompt`](/zh/cli-reference#system-prompt-flags)。这必须在每次调用时传递，因此更适合脚本和自动化，而非交互式使用。

  使用 [`InstructionsLoaded` 钩子](/zh/hooks#instructionsloaded) 可以精确记录具体哪些指令文件被加载、加载时间以及加载原因。这对调试子目录中路径特定规则或延迟加载文件非常有用。

### 我不知道自动记忆保存了什么

运行 `/memory` 命令并选择自动记忆文件夹，即可浏览 Claude 已保存的内容。所有内容均为可读、可编辑或可删除的纯 Markdown 格式。

### 我的 CLAUDE.md 文件太大了

超过 200 行的文件会消耗更多上下文，可能导致指令遵从度下降。请使用[路径范围规则](#路径特定规则)，让 Claude 仅在处理匹配文件时加载相关指令；或者删减每次会话都非必需的内容。将内容拆分为 [`@path` 导入](#导入额外文件) 有助于组织结构，但不会减少上下文占用，因为导入的文件在启动时就会全部加载。

### `/compact` 后指令似乎丢失了

项目根目录的 CLAUDE.md 在压缩后仍会保留：执行 `/compact` 后，Claude 会从磁盘重新读取该文件并将其注入会话。子目录中嵌套的 CLAUDE.md 文件不会自动重新注入；它们会在 Claude 下次读取该子目录中的文件时重新加载。

如果指令在压缩后消失，那么它要么只在对话中给出，要么位于尚未重新加载的嵌套 CLAUDE.md 文件中。请将仅在对话中给出的指令添加到 CLAUDE.md 以使其持久化。完整说明请参阅[哪些内容会在压缩后保留](/zh/context-window#what-survives-compaction)。

关于大小、结构和具体性的指导，请参阅[编写有效指令](#编写有效的指令)。

## 相关资源

* [调试配置](/zh/debug-your-config)：诊断 CLAUDE.md 或设置未生效的原因
* [技能](/zh/skills)：封装可按需加载的可重复工作流
* [设置](/zh/settings)：通过设置文件配置 Claude Code 行为
* [子代理记忆](/zh/sub-agents#enable-persistent-memory)：让子代理维护自己的自动记忆