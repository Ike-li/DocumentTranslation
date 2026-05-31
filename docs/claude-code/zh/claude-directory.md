## 文档索引
在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
使用此文件来发现所有可用页面，然后再进行进一步探索。

# 探索 .claude 目录

> Claude Code 从这里读取 CLAUDE.md、settings.json、钩子、技能、命令、子代理、工作流、规则和自动记忆。探索您项目中的 .claude 目录和您主目录中的 ~/.claude。

export const ClaudeExplorer = () => {
  // ... 组件代码保持原样 ...
};

Claude Code 从您的项目目录和主目录中的 `~/.claude` 读取指令、设置、技能、子代理和记忆。将项目文件提交到 git 以便与团队共享；`~/.claude` 中的文件是适用于所有项目的个人配置。

在 Windows 上，`~/.claude` 解析为 `%USERPROFILE%\.claude`。如果您设置了 [`CLAUDE_CONFIG_DIR`](/zh/env-vars)，本页面上的所有 `~/.claude` 路径都将位于该目录下。

大多数用户只编辑 `CLAUDE.md` 和 `settings.json`。目录的其余部分是可选的：根据需要添加技能、规则或子代理。

## 探索目录

点击树形图中的文件可查看每个文件的作用、加载时间以及示例。

## 未显示的内容

资源管理器涵盖了您编写和编辑的文件。少数相关文件位于其他位置：

| 文件                    | 位置                       | 目的                                                                                                                                                                                                                                                            |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `managed-settings.json` | 系统级，因操作系统而异     | 您无法覆盖的企业强制设置。请参阅[服务器托管设置](/zh/server-managed-settings)。                                                                                                                                                  |
| `CLAUDE.local.md`       | 项目根目录                 | 您对此项目的私人偏好设置，与 CLAUDE.md 一同加载。请手动创建并将其添加到 `.gitignore`。                                                                                                                                              |
| 已安装的插件             | `~/.claude/plugins`        | 已克隆的市场、已安装的插件版本以及每个插件的数据，由 `claude plugin` 命令管理。插件更新或卸载后 7 天将删除孤立版本。请参阅[插件缓存](/zh/plugins-reference#plugin-caching-and-file-resolution)。 |

`~/.claude` 目录还包含 Claude Code 在您工作时写入的数据：对话记录、提示词历史、文件快照、缓存和日志。请参阅下方的[应用数据]。

## 选择正确的文件

不同类型的自定义设置位于不同的文件中。使用此表查找某项更改应属于哪个文件。

| 您想要                                             | 编辑                                     | 作用域             | 参考文档                                          |
| :------------------------------------------------- | :--------------------------------------- | :---------------- | :------------------------------------------------- |
| 为 Claude 提供项目上下文和约定                     | `CLAUDE.md`                              | 项目或全局         | [记忆](/zh/memory)                               |
| 允许或阻止特定工具调用                             | `settings.json` `permissions` 或 `hooks` | 项目或全局         | [权限](/zh/permissions), [钩子](/zh/hooks) |
| 在工具调用之前或之后运行脚本                       | `settings.json` `hooks`                  | 项目或全局         | [钩子](/zh/hooks)                                 |
| 为会话设置环境变量                                 | `settings.json` `env`                    | 项目或全局         | [设置](/zh/settings#available-settings)        |
| 将个人覆盖配置排除在版本控制之外                   | `settings.local.json`                    | 仅项目             | [设置作用域](/zh/settings#settings-files)     |
| 添加可通过 `/name` 调用的提示词或功能              | `skills/<name>/SKILL.md`                 | 项目或全局         | [技能](/zh/skills)                               |
| 定义拥有自己工具的专用子代理                       | `agents/*.md`                            | 项目或全局         | [子代理](/zh/sub-agents)                        |
| 通过脚本编排多个子代理                             | `workflows/*.js`                         | 项目或全局         | [动态工作流](/zh/workflows)                 |
| 通过 MCP 连接外部工具                              | `.mcp.json`                              | 仅项目             | [MCP](/zh/mcp)                                     |
| 更改 Claude 格式化响应的方式                       | `output-styles/*.md`                     | 项目或全局         | [输出风格](/zh/output-styles)                 |

## 文件参考

此表列出了资源管理器涵盖的每个文件。项目作用域文件位于您仓库中的 `.claude/` 目录下（对于 `CLAUDE.md`、`.mcp.json` 和 `.worktreeinclude` 则位于根目录）。全局作用域文件位于 `~/.claude/` 目录下，并适用于所有项目。

  有几种情况会覆盖你在这些文件中的设置：

  * 你的组织部署的[托管设置](/zh/server-managed-settings)优先级最高
  * CLI标志如 `--permission-mode` 或 `--settings` 会覆盖该[会话](/zh/settings#settings-precedence)的 `settings.json`
  * 部分环境变量的优先级高于对应的设置项，但具体机制各不相同：请查阅[环境变量参考](/zh/env-vars)了解详情

  完整的优先级顺序请参见[设置优先级](/zh/settings#settings-precedence)。

点击文件名即可在上方的资源管理器中打开该节点。

| 文件                                                | 作用域             | 提交 | 功能说明                                                                                                      | 参考链接                                                        |
| --------------------------------------------------- | ------------------ | ---- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`CLAUDE.md`](#探索-claude-目录)                        | 项目和全局         | ✓    | 每次会话加载的指令                                                                                            | [记忆](/zh/memory)                                            |
| [`rules/*.md`]                           | 项目和全局         | ✓    | 主题范围的指令，可选择路径限制                                                                                | [规则](/zh/memory#organize-rules-with-claude/rules/)           |
| [`settings.json`]                | 项目和全局         | ✓    | 权限、钩子、环境变量、模型默认值                                                                              | [设置](/zh/settings)                                        |
| [`settings.local.json`]    | 仅限项目           |      | 个人覆盖设置，自动添加到gitignore                                                                             | [设置作用域](/zh/settings#settings-files)                  |
| [`.mcp.json`]                         | 仅限项目           | ✓    | 团队共享的MCP服务器                                                                                           | [MCP作用域](/zh/mcp#mcp-installation-scopes)                   |
| [`.worktreeinclude`]           | 仅限项目           | ✓    | 需复制到新工作树中的、已添加到gitignore的文件                                                                 | [工作树](/zh/worktrees#copy-gitignored-files-into-worktrees) |
| [`skills/<name>/SKILL.md`]              | 项目和全局         | ✓    | 可复用的提示词，通过 `/name` 调用或自动触发                                                                   | [技能](/zh/skills)                                            |
| [`commands/*.md`]                     | 项目和全局         | ✓    | 单文件提示词；机制与技能相同                                                                                  | [技能](/zh/skills)                                            |
| [`output-styles/*.md`]           | 项目和全局         | ✓    | 自定义系统提示词部分                                                                                          | [输出样式](/zh/output-styles)                              |
| [`agents/*.md`]                         | 项目和全局         | ✓    | 子代理定义，包含其自身的提示词和工具                                                                          | [子代理](/zh/sub-agents)                                     |
| [`workflows/*.js`]                   | 项目和全局         | ✓    | 由Claude编写并通过 `/workflows` 保存的动态工作流脚本；每个文件成为一个 `/<name>` 命令                         | [动态工作流](/zh/workflows)                              |
| [`agent-memory/<name>/`]          | 项目和全局         | ✓    | 子代理的持久记忆                                                                                              | [持久记忆](/zh/sub-agents#enable-persistent-memory)    |
| [`~/.claude.json`](#探索-claude-目录)                 | 仅限全局           |      | 应用状态、OAuth、UI开关、个人MCP服务器                                                                        | [全局配置](/zh/settings#global-config-settings)            |
| [`projects/<project>/memory/`] | 仅限全局           |      | 自动记忆：Claude跨会话的自注释                                                                                | [自动记忆](/zh/memory#auto-memory)                           |
| [`keybindings.json`]               | 仅限全局           |      | 自定义键盘快捷键                                                                                              | [快捷键绑定](/zh/keybindings)                                  |
| [`themes/*.json`]                       | 仅限全局           |      | 自定义颜色主题                                                                                                | [自定义主题](/zh/terminal-config#create-a-custom-theme)      |

## 配置问题排查

如果设置、钩子或文件未生效，请参阅[调试你的配置](/zh/debug-your-config)，了解检查命令和按症状查找问题的表格。

## 应用数据

除了你编写的配置外，`~/.claude` 目录还保存了Claude Code在会话期间写入的数据。这些文件是纯文本。任何通过工具的内容都会记录在磁盘的对话记录中：文件内容、命令输出、粘贴的文本。

### 自动清理

以下路径中的文件在启动时，如果已超过 [`cleanupPeriodDays`](/zh/settings#available-settings) 指定的天数（默认为30天），将被删除。

| `~/.claude/` 下的路径                      | 内容                                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `projects/<project>/<session>.jsonl`      | 完整对话记录：每条消息、工具调用和工具结果                                                                            |
| `projects/<project>/<session>/subagents/` | [子代理](/zh/sub-agents)对话记录，当其随父会话记录过期时一并删除                                                      |
| `projects/<project>/<session>/tool-results/` | 大型工具输出溢出到单独文件                                                                                            |
| `file-history/<session>/`                 | Claude修改的文件的编辑前快照，用于[检查点恢复](/zh/checkpointing)                                                     |
| `plans/`                                  | [计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)期间编写的计划文件                             |
| `debug/`                                  | 每个会话的调试日志，仅在启动时使用 `--debug` 或运行 `/debug` 时写入                                                  |
| `paste-cache/`、`image-cache/`            | 大段粘贴内容和附加图片的内容                                                                                          |
| `session-env/`                            | 每个会话的环境元数据                                                                                                  |
| `tasks/`                                  | 任务工具为每个会话编写的任务列表                                                                                      |
| `shell-snapshots/`                        | Bash工具捕获的shell环境。正常退出时删除。清理过程会清除崩溃后残留的文件。                                             |
| `backups/`                                | 配置迁移前创建的带时间戳的 `~/.claude.json` 副本                                                                      |
| `feedback-bundles/`                       | 由第三方提供商的 `/feedback` 编写的、经过脱敏的对话记录存档，用于发送给你的Anthropic账户团队                          |
| `todos/`、`statsig/`、`logs/`             | 来自旧版本的遗留目录。不再写入。清理过程会先删除其内容，然后删除空目录。                                              |

### 保留直到手动删除

以下路径不包含在自动清理范围内，将无限期保留。

| `~/.claude/` 下的路径 | 内容                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `history.jsonl`       | 你输入过的每个提示词，带时间戳和项目路径。用于上箭头历史召回。                                                                                                              |
| `stats-cache.json`    | `/usage` 命令显示的聚合token和成本计数                                                                                                                                      |
| `remote-settings.json` | 你的组织的[服务器管理设置](/zh/server-managed-settings)的缓存副本。仅在你的组织配置了它们时存在。每次启动时刷新。                                                          |

根据你使用的功能，会出现其他小型缓存和锁文件，可以安全删除。

### 纯文本存储

对话记录和历史记录在静态存储时不加密。操作系统文件权限是唯一的保护措施。如果工具读取了 `.env` 文件或命令打印了凭据，该值将被写入 `projects/<project>/<session>.jsonl`。为减少暴露：

*   降低 `cleanupPeriodDays` 以缩短对话记录的保留时间
*   设置 [`CLAUDE_CODE_SKIP_PROMPT_HISTORY`](/zh/env-vars) 环境变量，以跳过在任何模式下写入对话记录和提示词历史。在非交互模式下，你也可以在 `-p` 旁传递 `--no-session-persistence`，或在 Agent SDK 中设置 `persistSession: false`。
*   使用[权限规则](/zh/permissions)拒绝读取凭据文件

### 清除本地数据

运行 `claude project purge` 可以删除Claude Code为某个项目持有的状态：

*   `projects/` 下的对话记录和自动记忆
*   每个会话的 `tasks/`、`debug/` 和 `file-history/` 条目
*   `history.jsonl` 中匹配的提示词行
*   `~/.claude.json` 中该项目的条目

该命令会打印完整的删除计划，并在删除前请求确认。

预览计划而不删除任何内容：
```bash
claude project purge ~/work/my-repo --dry-run
```
使用单个确认提示进行删除：
```bash
claude project purge ~/work/my-repo
```
省略路径以从交互式列表中选择项目。

在脚本中使用时跳过确认提示：
```bash
claude project purge ~/work/my-repo --yes
```
使用 `--all` 替代路径可一次性清除所有项目的状态，这将直接删除 `history.jsonl` 而不是进行过滤。使用 `-i` 可逐项确认删除计划。

该命令会保留 `shell-snapshots/` 和 `backups/` 目录，因为它们不属于项目范围，并在计划输出中对此发出警告。如果没有任何状态匹配给定路径，将以状态码 1 退出。

您也可以手动删除上述任何应用数据路径。新建会话不受影响。下表显示了删除对过往会话的影响。

| 删除                                                                                                                                                                                       | 您将失去                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `~/.claude/projects/`                                                                                                                                                                        | 往期会话的恢复、继续与回溯功能                               |
| `~/.claude/history.jsonl`                                                                                                                                                                    | 上箭头提示词历史记录                                         |
| `~/.claude/file-history/`                                                                                                                                                                    | 往期会话的检查点恢复功能                                     |
| `~/.claude/stats-cache.json`                                                                                                                                                                 | `/usage` 命令显示的历史统计总数                              |
| `~/.claude/remote-settings.json`                                                                                                                                                             | 无影响。下次启动时会重新获取。                               |
| `~/.claude/debug/`, `~/.claude/plans/`, `~/.claude/paste-cache/`, `~/.claude/image-cache/`, `~/.claude/session-env/`, `~/.claude/tasks/`, `~/.claude/shell-snapshots/`, `~/.claude/backups/` | 无用户可见内容                                               |
| `~/.claude/todos/`, `~/.claude/statsig/`, `~/.claude/logs/`                                                                                                                                  | 无影响。当前版本不再写入这些遗留目录。                       |

请勿删除 `~/.claude.json`、`~/.claude/settings.json` 或 `~/.claude/plugins/`：这些文件保存了您的认证信息、偏好设置和已安装的插件。

## 相关资源

* [管理 Claude 的记忆](/zh/memory)：编写和组织 CLAUDE.md、规则及自动记忆
* [配置设置](/zh/settings)：设置权限、钩子、环境变量和模型默认值
* [创建技能](/zh/skills)：构建可复用的提示词和工作流
* [配置子代理](/zh/sub-agents)：定义拥有独立上下文的专业代理