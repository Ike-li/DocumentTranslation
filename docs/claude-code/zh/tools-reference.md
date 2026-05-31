> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 工具参考

> Claude Code 可用工具的完整参考，包括权限要求和各工具的行为。

Claude Code 可以访问一组内置工具，帮助它理解和修改你的代码库。工具名称是你在[权限规则](/zh/permissions#tool-specific-permission-rules)、[子代理工具列表](/zh/sub-agents)和[钩子匹配器](/zh/hooks)中使用的精确字符串。要完全禁用某个工具，请将其名称添加到[权限设置](/zh/permissions#tool-specific-permission-rules)的 `deny` 数组中。

要添加自定义工具，请连接 [MCP 服务器](/zh/mcp)。要通过可复用的提示词工作流扩展 Claude，请编写[技能](/zh/skills)，它通过现有的 `Skill` 工具运行，而不是添加新的工具条目。

| 工具                   | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 需要权限 |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| `Agent`                | 生成一个拥有独立上下文窗口的[子代理](/zh/sub-agents)来处理任务。参见 [Agent 工具行为](#agent-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                            | 否                  |
| `AskUserQuestion`      | 提出多选问题以收集需求或澄清歧义                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 否                  |
| `Bash`                 | 在你的环境中执行 shell 命令。参见 [Bash 工具行为](#bash-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 是                 |
| `CronCreate`           | 在当前会话中调度一个循环或一次性提示词。任务是会话级别的，如果未过期，在 `--resume` 或 `--continue` 时会恢复。参见[定时任务](/zh/scheduled-tasks)                                                                                                                                                                                                                                                                                                                                                                            | 否                  |
| `CronDelete`           | 按 ID 取消定时任务                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 否                  |
| `CronList`             | 列出会话中的所有定时任务                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 否                  |
| `Edit`                 | 对特定文件进行精确编辑。参见 [Edit 工具行为](#edit-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 是                 |
| `EnterPlanMode`        | 切换到计划模式，在编码前设计方案                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 否                  |
| `EnterWorktree`        | 创建一个隔离的 [git 工作树](/zh/worktrees)并切换到其中。传入 `path` 可切换到当前仓库的现有工作树，而不是创建新的。在工作树会话内，或在固定工作目录的子代理中（如 [`isolation: worktree`](/zh/sub-agents#supported-frontmatter-fields)），只提供 `path` 形式，且目标必须在 `.claude/worktrees/` 下                                                                                                                                      | 否                  |
| `ExitPlanMode`         | 展示计划以供批准并退出计划模式                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 是                 |
| `ExitWorktree`         | 退出工作树会话并返回原始目录。不适用于已在自己工作目录中运行的子代理，如使用 [`isolation: worktree`](/zh/sub-agents#supported-frontmatter-fields) 的子代理                                                                                                                                                                                                                                                                                                                                                | 否                  |
| `Glob`                 | 基于模式匹配查找文件。参见 [Glob 工具行为](#glob-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 否                  |
| `Grep`                 | 在文件内容中搜索模式。参见 [Grep 工具行为](#grep-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 否                  |
| `ListMcpResourcesTool` | 列出已连接 [MCP 服务器](/zh/mcp)暴露的资源                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 否                  |
| `LSP`                  | 通过语言服务器提供代码智能：跳转到定义、查找引用、报告类型错误和警告。参见 [LSP 工具行为](#lsp-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                   | 否                  |
| `Monitor`              | 在后台运行命令并将每行输出反馈给 Claude，使其可以在对话过程中对日志条目、文件变化或轮询状态做出反应。参见 [Monitor 工具](#monitor-工具)                                                                                                                                                                                                                                                                                                                                                                               | 是                 |
| `NotebookEdit`         | 修改 Jupyter notebook 单元格。参见 [NotebookEdit 工具行为](#notebookedit-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 是                 |
| `PowerShell`           | 原生执行 PowerShell 命令。参见 [PowerShell 工具](#powershell-工具)了解可用性                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 是                 |
| `PushNotification`     | 发送桌面通知，当[远程控制](/zh/remote-control)已连接时还会发送手机推送，以便长时间运行的任务或[定时任务](/zh/scheduled-tasks)在你离开时能联系到你。{/* plan-availability: feature=push-notifications providers=anthropic */}推送传递通过 Anthropic 托管的基础设施运行，Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 无法访问                                                                                                                                            | 否                  |
| `Read`                 | 读取文件内容。参见 [Read 工具行为](#read-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 否                  |
| `ReadMcpResourceTool`  | 按 URI 读取特定的 MCP 资源                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 否                  |
| `RemoteTrigger`        | 在 claude.ai 上创建、更新、运行和列出[例程](/zh/routines)。支持 `/schedule` 命令。{/* plan-availability: feature=routines plans=pro,max,team,enterprise providers=anthropic */}例程存在于 claude.ai 上，需要 Pro、Max、Team 或 Enterprise 计划，因此 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 无法访问此工具                                                                                                                                                                                                 | 否                  |
| `ScheduleWakeup`       | 重新调度[自主 `/loop`](/zh/scheduled-tasks#let-claude-choose-the-interval)的下一次迭代。Claude 在每次迭代结束时调用此工具来选择下次运行时间，范围在 1 分钟到 1 小时之间；你不直接调用它。待处理的唤醒出现在[停止钩子输入](/zh/hooks#stop-input)的 `session_crons` 中。{/* plan-availability: feature=loop-dynamic providers=anthropic */}Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 不可用，在这些平台上，没有间隔的 `/loop` 提示词会按固定计划运行 | 否                  |
| `SendMessage`          | 向[代理团队](/zh/agent-teams)成员发送消息，或按代理 ID [恢复子代理](/zh/sub-agents#resume-subagents)。停止的子代理会在后台自动恢复。仅在设置了 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用                                                                                                                                                                                                                                                                                                                 | 否                  |
| `ShareOnboardingGuide` | {/* plan-availability: feature=onboarding-guide-share plans=pro,max,team,enterprise providers=anthropic */}上传 `ONBOARDING.md` 并返回一个分享链接，团队成员可以在 Claude Code 中打开。在指南编写后从 `/team-onboarding` 调用。适用于 Pro、Max、Team 和 Enterprise 计划的 claude.ai 订阅者                                                                                                                                                                                                                                         | 是                 |
| `Skill`                | 在主对话中执行[技能](/zh/skills#control-who-invokes-a-skill)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 是                 |
| `TaskCreate`           | 在任务列表中创建新任务                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 否                  |
| `TaskGet`              | 获取特定任务的完整详情                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 否                  |
| `TaskList`             | 列出所有任务及其当前状态                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 否                  |
| `TaskOutput`           | （已弃用）获取后台任务的输出。建议使用 `Read` 读取任务的输出文件路径                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 否                  |
| `TaskStop`             | 按 ID 终止正在运行的后台任务                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 否                  |
| `TaskUpdate`           | 更新任务状态、依赖、详情或删除任务                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 否                  |
| `TeamCreate`           | 创建一个包含多个成员的[代理团队](/zh/agent-teams)。仅在设置了 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用                                                                                                                                                                                                                                                                                                                                                                                                                                        | 否                  |
| `TeamDelete`           | 解散代理团队并清理成员进程。仅在设置了 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 否                  |
| `TodoWrite`            | {/* min-version: 2.1.142 */}管理会话任务清单。自 v2.1.142 起默认禁用，改用 `TaskCreate`、`TaskGet`、`TaskList` 和 `TaskUpdate`。设置 `CLAUDE_CODE_ENABLE_TASKS=0` 可重新启用                                                                                                                                                                                                                                                                                                                                                          | 否                  |
| `ToolSearch`           | 在启用[工具搜索](/zh/mcp#scale-with-mcp-tool-search)时搜索并加载延迟工具                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 否                  |
| `WaitForMcpServers`    | {/* min-version: 2.1.142 */}等待一个或多个仍在后台连接的 [MCP 服务器](/zh/mcp)，以便请求可以在不重启会话的情况下使用其工具。当所需服务器尚未连接时，Claude 会调用此工具。仅在禁用[工具搜索](/zh/mcp#scale-with-mcp-tool-search)时出现，因为启用后 `ToolSearch` 会处理等待                                                                                                                                                                                     | 否                  |
| `WebFetch`             | 从指定 URL 获取内容。参见 [WebFetch 工具行为](#webfetch-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 是                 |
| `WebSearch`            | 执行网络搜索。参见 [WebSearch 工具行为](#websearch-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 是                 |
| `Workflow`             | 运行[动态工作流](/zh/workflows)：一个在后台编排多个子代理并返回一个合并结果的脚本                                                                                                                                                                                                                                                                                                                                                                                                                                    | 是                 |
| `Write`                | 创建或覆盖文件。参见 [Write 工具行为](#write-工具行为)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 是                 |

## 使用权限规则和钩子配置工具

大多数情况下，Claude 会自行决定何时使用这些工具，你在与 Claude 交互时不需要指定工具名称。你在定义权限和其他配置时直接引用工具名称：

* 在设置中的 [`permissions.allow` 和 `permissions.deny`](/zh/settings#available-settings)，以及 `/permissions` 界面
* 在 `--allowedTools` 和 `--disallowedTools` [CLI 标志](/zh/cli-reference)
* 在 Agent SDK 的 [`allowedTools` 和 `disallowedTools`](/zh/agent-sdk/permissions#allow-and-deny-rules) 选项
* 在[子代理的 `tools` 或 `disallowedTools`](/zh/sub-agents#supported-frontmatter-fields) frontmatter 中
* 在[技能的 `allowed-tools`](/zh/skills#frontmatter-reference) frontmatter 中
* 在钩子的 [`if` 条件](/zh/hooks-guide#filter-by-tool-name-and-arguments-with-the-if-field)中

所有这些都接受相同的规则格式 `ToolName(specifier)`。说明符取决于工具，多个工具共享相同的格式：

| 规则格式                    | 适用于                | 详情                                                          |
| :----------------------------- | :------------------------ | :--------------------------------------------------------------- |
| `Bash(npm run *)`              | Bash, Monitor             | [命令模式匹配](/zh/permissions#bash)                 |
| `PowerShell(Get-ChildItem *)`  | PowerShell                | [命令模式匹配](/zh/permissions#powershell)           |
| `Read(~/secrets/**)`           | Read, Grep, Glob, LSP     | [路径模式匹配](/zh/permissions#read-and-edit)           |
| `Edit(/src/**)`                | Edit, Write, NotebookEdit | [路径模式匹配](/zh/permissions#read-and-edit)           |
| `Skill(deploy *)`              | Skill                     | [技能名称匹配](/zh/skills#restrict-claude's-skill-access) |
| `Agent(Explore)`               | Agent                     | [子代理类型匹配](/zh/permissions#agent-subagents)        |
| `WebFetch(domain:example.com)` | WebFetch                  | [域名匹配](/zh/permissions#webfetch)                      |
| `WebSearch`                    | WebSearch                 | 无说明符；整体允许或拒绝该工具                  |

此处未列出的工具，如 `ExitPlanMode` 或 `ShareOnboardingGuide`，只接受不带说明符的工具名称。

`Edit(...)` 允许规则也会授予对同一路径的读取权限，因此不需要匹配的 `Read(...)` 规则。

钩子的 `matcher` 字段使用不带括号的工具名称，而不是带括号的规则格式。参见[匹配器模式](/zh/hooks#matcher-patterns)了解匹配规则。有关每个工具传递给钩子中 `tool_input` 的字段名，请参见 [PreToolUse 输入参考](/zh/hooks#pretooluse-input)。

## Agent 工具行为

Agent 工具在独立的上下文窗口中生成子代理。子代理自主完成任务，然后向父对话返回单个文本结果。父对话看不到子代理的中间工具调用或输出，只看到最终结果。要限制子代理运行的轮数，请在[子代理定义](/zh/sub-agents#supported-frontmatter-fields)中设置 `maxTurns`。

同一个 Agent 工具在启用分叉模式时也会启动[分叉子代理](/zh/sub-agents#fork-the-current-conversation)。分叉继承完整的父对话而不是从头开始，始终在后台运行，并且仍然会在终端中显示权限提示。本节其余部分描述命名子代理。

命名子代理可以使用哪些工具取决于[子代理定义](/zh/sub-agents)中的 `tools` 和 `disallowedTools` 字段：

* **两个字段都未设置**：子代理继承父代理可用的所有工具。
* **仅设置 `tools`**：子代理只获得列出的工具。
* **仅设置 `disallowedTools`**：子代理获得除列出之外的所有父代理工具。
* **两个都设置**：`disallowedTools` 优先。同时列出在两个字段中的工具会被移除。

启动子代理本身不会提示权限。子代理自己的工具调用在运行时会根据你的权限规则进行检查：

* **前台子代理**显示与主对话中相同的权限提示，在每次工具调用发生时显示。
* **后台子代理**不显示提示。它们使用会话中已授予的权限运行，并自动拒绝需要提示的工具调用。拒绝后，子代理在没有该工具的情况下继续运行。

要从根本上限制子代理可访问的范围，请缩小其 `tools` 字段、不包含 Bash，或在设置中设置拒绝规则，如[控制子代理能力](/zh/sub-agents#control-subagent-capabilities)中所述。有关选择前台还是后台运行的更多信息，请参见[在前台或后台运行子代理](/zh/sub-agents#run-subagents-in-foreground-or-background)。

## Bash 工具行为

Bash 工具在单独的进程中运行每个命令，具有以下持久性行为：

* 当 Claude 在主会话中运行 `cd` 时，新的工作目录会延续到后续的 Bash 命令，只要它保持在项目目录或你通过 `--add-dir`、`/add-dir` 或设置中的 `additionalDirectories` 添加的[额外工作目录](/zh/permissions#working-directories)内。子代理会话永远不会延续工作目录更改。
  * 如果 `cd` 到这些目录之外，Claude Code 会重置到项目目录，并在工具结果中附加 `Shell cwd was reset to <dir>`。
  * 要禁用此延续，使每个 Bash 命令都从项目目录开始，请设置 `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`。
* 环境变量不会持久化。一个命令中的 `export` 在下一个命令中不可用。
* shell 启动文件中定义的别名和 shell 函数可用。会话启动时，Claude Code 会加载 `~/.zshrc`、`~/.bashrc` 或 `~/.profile`（取决于你的 shell），捕获结果的别名、函数和 shell 选项，并应用到每个 Bash 命令。

在启动 Claude Code 之前激活你的 virtualenv 或 conda 环境。要使环境变量在 Bash 命令间持久化，请在启动 Claude Code 前将 [`CLAUDE_ENV_FILE`](/zh/env-vars) 设置为 shell 脚本，或使用 [SessionStart 钩子](/zh/hooks#persist-environment-variables)动态填充。

两个限制约束每个命令：

* **超时**：默认两分钟。Claude 可以使用 `timeout` 参数请求每个命令最多 10 分钟。使用 [`BASH_DEFAULT_TIMEOUT_MS` 和 `BASH_MAX_TIMEOUT_MS`](/zh/env-vars) 覆盖默认值和上限。
* **输出长度**：默认 30,000 个字符。当命令产生超过此限制的输出时，Claude Code 会将完整输出保存到会话目录中的文件，并给 Claude 文件路径加上开头的简短预览。Claude 在需要其余内容时读取或搜索该文件。使用 [`BASH_MAX_OUTPUT_LENGTH`](/zh/env-vars) 提高限制，硬上限为 150,000 个字符。

对于长时间运行的进程（如开发服务器或监视构建），Claude 可以设置 `run_in_background: true` 将命令作为后台任务启动，并在其运行时继续工作。使用 `/tasks` 列出和停止后台任务。

## Edit 工具行为

Edit 工具执行精确字符串替换。它接受 `old_string` 和 `new_string`，用后者替换前者。不使用正则表达式或模糊匹配。

编辑应用前必须通过三个检查：

* **先读后编辑**：Claude 必须在当前对话中已读取该文件，且该文件在读取后未在磁盘上更改。此检查在任何字符串匹配之前首先运行。
* **匹配**：`old_string` 必须与文件中的内容完全一致。一个字符的空白或缩进差异就足以导致匹配失败。
* **唯一性**：`old_string` 必须恰好出现一次。当出现多次时，Claude 要么提供带有足够上下文的更长字符串来定位一次出现，要么设置 `replace_all: true` 替换所有出现。

使用 Bash 查看文件也满足先读后编辑的要求，当命令是 `cat`、`head`、`tail` 或 `sed -n 'X,Yp'` 且针对单个文件、无管道、重定向或其他标志时。管道输出和其他 Bash 命令不计入，在这些情况下 Claude 必须在编辑前使用 Read。

这只影响编辑资格，不影响权限。[Read 和 Edit 拒绝规则](/zh/permissions#tool-specific-permission-rules)也适用于 Claude Code 在 Bash 中识别的文件命令（如 `cat`、`head`、`tail` 和 `sed`），但不适用于间接读写文件的任意子进程（如自行打开文件的 Python 或 Node 脚本）。要获得覆盖每个进程的操作系统级强制，请[启用沙箱](/zh/sandboxing)。

## Glob 工具行为

Glob 工具通过名称模式查找文件。它支持标准 glob 语法，包括用于递归目录匹配的 `**`：

* `**/*.js` 匹配任意深度的所有 `.js` 文件
* `src/**/*.ts` 匹配 `src/` 下的所有 `.ts` 文件
* `*.{json,yaml}` 匹配当前目录中的 `.json` 和 `.yaml` 文件

结果按修改时间排序，上限为 100 个文件。如果达到上限，Claude 会在结果中看到截断标志，并可以缩小模式。

Glob 默认不遵循 `.gitignore`，因此它会同时找到被 gitignore 的文件和被跟踪的文件。这与 [Grep](#grep-工具行为)不同，Grep 会跳过被 gitignore 的文件。要使 Glob 遵循 `.gitignore`，请在启动 Claude Code 前设置 `CLAUDE_CODE_GLOB_NO_IGNORE=false`。

## Grep 工具行为

Grep 工具在文件内容中搜索模式。[Glob](#glob-工具行为)通过名称查找文件，而 Grep 在文件内部查找行。

Grep 基于 [ripgrep](https://github.com/BurntSushi/ripgrep) 构建，使用 ripgrep 的正则语法，而非 POSIX grep。包含正则元字符的模式需要转义。例如，在 Go 代码中查找 `interface{}` 需要模式 `interface\{\}`。

三种输出模式控制返回内容：

* `files_with_matches`：仅文件路径，无行内容。这是默认值。
* `content`：匹配行及文件名和行号。
* `count`：每个文件的匹配计数。

Claude 可以使用 `glob` 参数（如 `**/*.tsx`）按文件限定结果范围，或使用 `type` 参数（如 `py` 或 `rust`）按语言限定。默认情况下，模式在单行内匹配。Claude 可以设置 `multiline: true` 来跨行匹配。

Grep 遵循 `.gitignore`，因此会跳过被 gitignore 的文件。要搜索被 gitignore 的文件，Claude 直接传入其路径。

## LSP 工具行为

LSP 工具从运行中的语言服务器为 Claude 提供代码智能。每次文件编辑后，它自动报告类型错误和警告，使 Claude 无需单独的构建步骤即可修复问题。Claude 也可以直接调用它来导航代码：

* 跳转到符号的定义
* 查找符号的所有引用
* 获取某个位置的类型信息
* 列出文件或工作区中的符号
* 查找接口的实现
* 追踪调用层次

该工具在你为语言安装[代码智能插件](/zh/discover-plugins#code-intelligence)之前处于非活动状态。插件捆绑了语言服务器配置，你需要单独安装服务器二进制文件。

## Monitor 工具

Monitor 工具需要 Claude Code v2.1.98 或更高版本。

Monitor 工具让 Claude 在后台监视某些内容，并在变化时做出反应，而不会暂停对话。请 Claude：

* 跟踪日志文件并在出现错误时标记
* 轮询 PR 或 CI 作业并在状态变化时报告
* 监视目录中的文件变化
* 跟踪你指向的任何长时间运行的脚本的输出

Claude 为监视编写一个小脚本，在后台运行它，并在每行输出到达时接收。你在同一会话中继续工作，Claude 在事件到来时插入。通过请求 Claude 取消或结束会话来停止监视器。

Monitor 使用与 [Bash 相同的权限规则](/zh/permissions#tool-specific-permission-rules)，因此你为 Bash 设置的 `allow` 和 `deny` 模式也适用于此。Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 不可用。设置了 `DISABLE_TELEMETRY` 或 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 时也不可用。

插件可以声明在插件激活时自动启动的监视器，而不是请求 Claude 启动它们。参见[插件监视器](/zh/plugins-reference#monitors)。

## NotebookEdit 工具行为

NotebookEdit 一次修改一个 Jupyter notebook 单元格，通过 `cell_id` 定位单元格。它不像 [Edit](#edit-工具行为)对普通文件那样在整个 notebook 中执行字符串替换。

三种编辑模式控制对目标单元格的操作：

* `replace`：覆盖单元格的源代码。这是默认值。
* `insert`：在目标后添加新单元格。如果没有 `cell_id`，新单元格放在 notebook 开头。需要将 `cell_type` 设置为 `code` 或 `markdown`。
* `delete`：删除目标单元格。

权限规则使用 `Edit(...)` 路径格式。`Edit(notebooks/**)` 这样的规则覆盖该目录中文件的 NotebookEdit 调用。

## PowerShell 工具

PowerShell 工具让 Claude 原生运行 PowerShell 命令。在 Windows 上，这意味着命令在 PowerShell 中运行，而不是通过 Git Bash 路由。在没有 Git Bash 的 Windows 上，该工具自动启用。在安装了 Git Bash 的 Windows 上，该工具正在逐步推出。在 Linux、macOS 和 WSL 上，该工具是可选启用的。

### 启用 PowerShell 工具

在环境或 `settings.json` 中设置 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`：

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1"
  }
}
```

在 Windows 上，将变量设置为 `0` 可选择退出推出。在 Linux、macOS 和 WSL 上，该工具需要 PowerShell 7 或更高版本：安装 `pwsh` 并确保它在你的 `PATH` 上。

在 Windows 上，Claude Code 自动检测 PowerShell 7+ 的 `pwsh.exe`，并回退到 PowerShell 5.1 的 `powershell.exe`。启用该工具后，Claude 将 PowerShell 视为主 shell。当安装了 Git Bash 时，Bash 工具仍然可用于 POSIX 脚本。

Claude Code 使用 `-ExecutionPolicy Bypass` 生成 PowerShell，仅在进程范围内，因此 `.ps1` 脚本和模块导入在默认 Windows 安装上无需更改机器策略即可工作。进程范围的绕过不会覆盖组策略的 `MachinePolicy` 或 `UserPolicy`，因此企业锁定仍然适用。要改为尊重机器的有效执行策略，请设置 `CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY=1`。

### 设置、钩子和技能中的 shell 选择

三个额外设置控制 PowerShell 的使用位置：

* [`settings.json`](/zh/settings#available-settings) 中的 `"defaultShell": "powershell"`：通过 PowerShell 路由交互式 `!` 命令。需要启用 PowerShell 工具。
* 各个[命令钩子](/zh/hooks#command-hook-fields)上的 `"shell": "powershell"`：在 PowerShell 中运行该钩子。钩子直接生成 PowerShell，因此无论 `CLAUDE_CODE_USE_POWERSHELL_TOOL` 是否设置都能工作。
* [技能 frontmatter](/zh/skills#frontmatter-reference) 中的 `shell: powershell`：在 PowerShell 中运行 `` !`command` `` 块。需要启用 PowerShell 工具。

Bash 工具部分描述的相同主会话工作目录重置行为适用于 PowerShell 命令，包括 `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` 环境变量。

### 预览限制

PowerShell 工具在预览期间有以下已知限制：

* 不加载 PowerShell 配置文件
* 在 Windows 上不支持沙箱

## Read 工具行为

Read 工具接受文件路径并返回带行号的内容。Claude 被指示始终传入绝对路径。

默认情况下，Read 从文件开头返回。当整文件读取超过 token 限制时，Read 返回第一页并附带 `PARTIAL view` 通知，告诉 Claude 它收到了多少内容以及如何使用 `offset` 和 `limit` 读取更多。传入显式 `offset` 或 `limit` 后仍超过 token 限制的读取会返回错误。

Read 处理纯文本之外的多种文件类型：

* **图片**：PNG、JPG 和其他图片格式作为 Claude 可以看到的视觉内容返回，而不是原始字节。Claude Code 在发送前会调整大小并重新压缩大图片以适应模型的图片大小限制，因此 Claude 可能看到的是大截图的缩小版本。如果 Claude 在大图片中错过了精细的像素级细节，请先让它裁剪感兴趣的区域，例如通过 Bash 使用 ImageMagick。
* **PDF**：Claude 整体读取短的 `.pdf` 文件。对于超过 10 页的 PDF，使用 `pages` 参数按范围读取，如 `"1-5"`，每次最多 20 页。
* **Jupyter notebook**：`.ipynb` 文件返回所有单元格及其输出，包括代码、markdown 和可视化。

Read 只读取文件，不读取目录。Claude 使用 Bash 工具的 `ls` 列出目录内容。

## WebFetch 工具行为

WebFetch 接受一个 URL 和一个描述要提取什么的提示词。它获取页面，当服务器返回 HTML 时将响应转换为 Markdown，然后使用小型快速模型对内容运行提示词。对于大多数获取，Claude 接收的是该模型的回答，而不是原始页面。转换步骤不可配置。

这使得 WebFetch 本质上是有损的。提取提示词决定了什么传递给 Claude，因此结果说页面没有提到某事可能只是提示词没有要求它。请求 Claude 用更具体的提示词重新获取，或使用 Bash 的 `curl` 获取未处理的页面。

一些行为影响 Claude 收到的响应：

* HTTP URL 自动升级为 HTTPS。
* 大页面在处理前被截断到固定的字符限制。
* 响应缓存 15 分钟，因此重复获取同一 URL 会快速返回。
* 当 URL 重定向到不同主机时，WebFetch 返回一个文本结果，列出原始 URL 和重定向目标，而不是跟随它。Claude 然后通过第二次 WebFetch 调用获取新 URL。

在默认和 `acceptEdits` 权限模式下，WebFetch 在首次访问新域名时会提示。要在不提示的情况下预先允许某个域名，请添加类似 `WebFetch(domain:example.com)` 的权限规则。`auto` 和 `bypassPermissions` [权限模式](/zh/permissions#permission-modes)完全跳过提示。

WebFetch 设置以 `Claude-User` 开头的 `User-Agent` 头，以及偏好 Markdown 优于 HTML 的 `Accept` 头，以便支持内容协商的服务器可以直接返回 Markdown。[沙箱](/zh/sandboxing)网络规则是单独配置的，因此你希望沙箱进程访问的域名仍需要显式的沙箱权限规则。

## WebSearch 工具行为

WebSearch 对 Anthropic 的[网络搜索](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)后端运行查询并返回结果标题和 URL。它不获取结果页面。要读取 Claude 在搜索结果中找到的页面，它会使用 [WebFetch](#webfetch-工具行为)进行后续获取。

该工具每次调用可能发起最多八次后端搜索，在返回结果前内部优化搜索。Claude 可以使用 `allowed_domains` 限定结果范围以仅包含某些主机，或使用 `blocked_domains` 排除它们。两个列表不能在单次调用中组合使用。

搜索后端不可配置。要使用不同的提供商搜索，请添加暴露搜索工具的 [MCP 服务器](/zh/mcp)。

WebSearch 权限规则不接受说明符。`allow` 或 `deny` 中的裸 `WebSearch` 条目是唯一形式。

WebSearch 在 Claude API 和 Microsoft Foundry 上可用。在 Google Cloud Vertex AI 上适用于 Claude 4 模型，包括 Opus、Sonnet 和 Haiku。Amazon Bedrock 不暴露服务器端网络搜索工具。

## Write 工具行为

Write 工具创建新文件或用提供的完整内容覆盖现有文件。它不执行追加或合并。

如果目标路径已存在，Claude 必须在当前对话中至少读取过该文件一次才能覆盖。对未读取的现有文件执行 Write 会返回错误。此约束不适用于新文件。

使用 Bash 查看文件也满足此要求，规则与 [Edit 工具行为](#edit-工具行为)中描述的相同。

对于现有文件的部分更改，Claude 使用 Edit 而不是 Write。

## 检查哪些工具可用

你的确切工具集取决于你的提供商、平台和设置。要检查运行中的会话加载了哪些工具，直接问 Claude：

```text
你有哪些工具可用？
```

Claude 会给出对话式的总结。要获取确切的 MCP 工具名称，请运行 `/mcp`。

## 另请参阅

* [MCP 服务器](/zh/mcp)：通过连接外部服务器添加自定义工具
* [权限](/zh/permissions)：权限系统、规则语法和工具特定模式
* [子代理](/zh/sub-agents)：配置子代理的工具访问
* [钩子](/zh/hooks-guide)：在工具执行前后运行自定义命令
