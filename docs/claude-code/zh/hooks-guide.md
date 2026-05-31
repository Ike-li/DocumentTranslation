> ## 文档索引
> 在此获取完整文档索引: https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 使用钩子自动化工作流

> 当 Claude Code 编辑文件、完成任务或需要输入时，自动运行 shell 命令。格式化代码、发送通知、验证命令并强制执行项目规则。

钩子是用户定义的 shell 命令，在 Claude Code 生命周期的特定节点执行。它们对 Claude Code 的行为提供确定性控制，确保某些操作始终发生，而不是依赖 LLM 选择运行它们。使用钩子来强制执行项目规则、自动化重复性任务，并将 Claude Code 与现有工具集成。

对于需要判断而非确定性规则的决策，你也可以使用[基于提示词的钩子](#基于提示词的钩子)或[基于代理的钩子](#基于代理的钩子)，它们使用 Claude 模型来评估条件。

有关扩展 Claude Code 的其他方式，请参阅[技能](/zh/skills)以赋予 Claude 额外的指令和可执行命令、[子代理](/zh/sub-agents)以在隔离的上下文中运行任务，以及[插件](/zh/plugins)以打包扩展以便在项目间共享。

本指南涵盖常见用例和入门方法。有关完整的事件模式、JSON 输入/输出格式以及异步钩子和 MCP 工具钩子等高级功能，请参阅[钩子参考](/zh/hooks)。

## 设置你的第一个钩子

要创建钩子，请在[设置文件](#配置钩子位置)中添加 `hooks` 块。本教程将创建一个桌面通知钩子，这样当 Claude 等待你的输入时，你会收到提醒，而无需一直盯着终端。

**步骤 1：将钩子添加到设置中**

打开 `~/.claude/settings.json` 并添加 `Notification` 钩子。以下示例使用 macOS 的 `osascript`；Linux 和 Windows 命令请参阅[当 Claude 需要输入时获取通知](#当-claude-需要输入时获取通知)。

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

如果你的设置文件已有 `hooks` 键，请将 `Notification` 作为现有事件键的同级项添加，而不是替换整个对象。每个事件名称是单个 `hooks` 对象中的一个键：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'" }]
      }
    ]
  }
}
```

你也可以通过在 CLI 中描述需求来让 Claude 为你编写钩子。

**步骤 2：验证配置**

输入 `/hooks` 打开钩子浏览器。你会看到所有可用钩子事件的列表，已配置钩子的事件旁会显示计数。选择 `Notification` 确认你的新钩子出现在列表中。选择钩子可查看其详情：事件、匹配器、类型、源文件和命令。

**步骤 3：测试钩子**

按 `Esc` 返回 CLI。让 Claude 做一些需要权限的操作，然后切换离开终端。你应该会收到桌面通知。

`/hooks` 菜单是只读的。要添加、修改或删除钩子，请直接编辑你的设置 JSON 或让 Claude 来完成更改。

## 你可以自动化什么

钩子让你在 Claude Code 生命周期的关键节点运行代码：编辑后格式化文件、执行前阻止命令、Claude 需要输入时发送通知、会话开始时注入上下文等。完整的钩子事件列表请参阅[钩子参考](/zh/hooks#钩子生命周期)。

每个示例都包含一个可直接使用的配置块，你可以将其添加到[设置文件](#配置钩子位置)。最常见的模式：

* [当 Claude 需要输入时获取通知](#当-claude-需要输入时获取通知)
* [编辑后自动格式化代码](#编辑后自动格式化代码)
* [阻止对受保护文件的编辑](#阻止对受保护文件的编辑)
* [压缩后重新注入上下文](#压缩后重新注入上下文)
* [审计配置变更](#审计配置变更)
* [当目录或文件变更时重新加载环境](#当目录或文件变更时重新加载环境)
* [自动批准特定权限提示](#自动批准特定权限提示)

有关运行独立模型审查并将结果反馈到会话中的钩子生产示例，请参阅[`security-guidance` 插件如何与 Claude Code 集成](/zh/security-guidance#插件如何与-claude-code-集成)。

### 当 Claude 需要输入时获取通知

每当 Claude 完成工作需要你的输入时，获取桌面通知，这样你可以在不查看终端的情况下切换到其他任务。

此钩子使用 `Notification` 事件，该事件在 Claude 等待输入或权限时触发。以下每个标签使用平台的原生通知命令。将其添加到 `~/.claude/settings.json`：

**macOS：**

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

如果通知未出现：`osascript` 通过内置的脚本编辑器应用发送通知。如果脚本编辑器没有通知权限，命令会静默失败，macOS 也不会提示你授予。在终端中运行一次以下命令，使脚本编辑器出现在通知设置中：

```bash
osascript -e 'display notification "test"'
```

此时不会出现任何通知。打开**系统设置 > 通知**，在列表中找到**脚本编辑器**，并开启**允许通知**。再次运行命令确认测试通知出现。

**Linux：**

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
          }
        ]
      }
    ]
  }
}
```

**Windows (PowerShell)：**

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

空的 `matcher` 会在所有通知类型上触发。要仅在特定事件上触发，请将其设置为以下值之一：

| 匹配器                  | 触发时机                                   |
| :--------------------- | :----------------------------------------- |
| `permission_prompt`    | Claude 需要你批准工具使用                    |
| `idle_prompt`          | Claude 完成并等待你的下一个提示词              |
| `auth_success`         | 认证完成                                    |
| `elicitation_dialog`   | MCP 服务器打开一个引导表单                     |
| `elicitation_complete` | MCP 引导表单被提交或关闭                       |
| `elicitation_response` | MCP 引导响应被发回服务器                       |

输入 `/hooks` 并选择 `Notification` 确认钩子已注册。完整的事件模式请参阅[Notification 参考](/zh/hooks#notification)。

### 编辑后自动格式化代码

对 Claude 编辑的每个文件自动运行 [Prettier](https://prettier.io/)，无需手动干预即可保持格式一致。

此钩子使用 `PostToolUse` 事件和 `Edit|Write` 匹配器，因此仅在文件编辑工具之后运行。命令使用 [`jq`](https://jqlang.github.io/jq/) 提取编辑的文件路径并传递给 Prettier。将其添加到项目根目录的 `.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

本页的 Bash 示例使用 `jq` 进行 JSON 解析。通过 `brew install jq`（macOS）、`apt-get install jq`（Debian/Ubuntu）安装，或参见 [`jq` 下载](https://jqlang.github.io/jq/download/)。

### 阻止对受保护文件的编辑

防止 Claude 修改 `.env`、`package-lock.json` 或 `.git/` 中的任何内容等敏感文件。Claude 会收到解释编辑被阻止原因的反馈，以便调整其方法。

此示例使用一个单独的脚本文件供钩子调用。脚本根据受保护模式列表检查目标文件路径，并以退出码 2 阻止编辑。

**步骤 1：创建钩子脚本**

保存到 `.claude/hooks/protect-files.sh`：

```bash
#!/bin/bash
# protect-files.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

**步骤 2：使脚本可执行（macOS/Linux）**

钩子脚本必须可执行，Claude Code 才能运行它们：

```bash
chmod +x .claude/hooks/protect-files.sh
```

**步骤 3：注册钩子**

将 `PreToolUse` 钩子添加到 `.claude/settings.json`，在任何 `Edit` 或 `Write` 工具调用之前运行脚本：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### 压缩后重新注入上下文

当 Claude 的上下文窗口填满时，压缩会总结对话以释放空间。这可能会丢失重要细节。使用带有 `compact` 匹配器的 `SessionStart` 钩子，在每次压缩后重新注入关键上下文。

你的命令写入 stdout 的任何文本都会添加到 Claude 的上下文中。此示例提醒 Claude 项目约定和最近的工作。将其添加到项目根目录的 `.claude/settings.json`：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

你可以将 `echo` 替换为任何产生动态输出的命令，例如 `git log --oneline -5` 显示最近的提交。对于在每次会话开始时注入上下文，请考虑使用 [CLAUDE.md](/zh/memory)。有关环境变量，请参阅参考中的 [`CLAUDE_ENV_FILE`](/zh/hooks#持久化环境变量)。

### 审计配置变更

跟踪会话期间设置或技能文件何时发生变更。`ConfigChange` 事件在外部进程或编辑器修改配置文件时触发，因此你可以记录变更以供合规或阻止未授权的修改。

此示例将每次变更追加到审计日志。将其添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{timestamp: now | todate, source: .source, file: .file_path}' >> ~/claude-config-audit.log"
          }
        ]
      }
    ]
  }
}
```

匹配器按配置类型过滤：`user_settings`、`project_settings`、`local_settings`、`policy_settings` 或 `skills`。要阻止变更生效，请以退出码 2 退出或返回 `{"decision": "block"}`。完整的输入模式请参阅 [ConfigChange 参考](/zh/hooks#configchange)。

### 当目录或文件变更时重新加载环境

某些项目根据你所在的目录设置不同的环境变量。[direnv](https://direnv.net/) 等工具会在你的 shell 中自动执行此操作，但 Claude 的 Bash 工具不会自行获取这些更改。

将 `SessionStart` 钩子与 `CwdChanged` 钩子配对可以解决此问题。`SessionStart` 加载你启动目录的变量，`CwdChanged` 在每次 Claude 切换目录时重新加载它们。两者都写入 `CLAUDE_ENV_FILE`，Claude Code 在每个 Bash 命令之前将其作为脚本前导运行。将其添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash > \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ],
    "CwdChanged": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash > \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

在每个有 `.envrc` 的目录中运行一次 `direnv allow`，以便 direnv 被允许加载它。如果你使用 devbox 或 nix 而非 direnv，同样的模式适用于用 `devbox shellenv` 或 `devbox global shellenv` 替代 `direnv export bash`。

要对特定文件而非每个目录变更做出反应，请使用带有列出要监视的文件名（用 `|` 分隔）的 `matcher` 的 `FileChanged`。该值会被拆分为字面文件名，而不是作为正则表达式求值。有关同一值如何也过滤文件变更时运行的钩子组，请参阅 [FileChanged](/zh/hooks#filechanged)。此示例监视工作目录中的 `.envrc` 和 `.env`：

```json
{
  "hooks": {
    "FileChanged": [
      {
        "matcher": ".envrc|.env",
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash > \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

输入模式、`watchPaths` 输出和 `CLAUDE_ENV_FILE` 详情请参阅 [CwdChanged](/zh/hooks#cwdchanged) 和 [FileChanged](/zh/hooks#filechanged) 参考条目。

### 自动批准特定权限提示

跳过你始终允许的工具调用的批准对话框。此示例自动批准 `ExitPlanMode`——Claude 在完成展示计划并请求继续时调用的工具——这样你就不会在每次计划准备好时被提示。

与上面的退出码示例不同，自动批准需要你的钩子向 stdout 写入 JSON 决策。`PermissionRequest` 钩子在 Claude Code 即将显示权限对话框时触发，返回 `"behavior": "allow"` 可代你回答。

匹配器将钩子范围限定为仅 `ExitPlanMode`，因此不会影响其他提示。将其添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PermissionRequest\", \"decision\": {\"behavior\": \"allow\"}}}'"
          }
        ]
      }
    ]
  }
}
```

当钩子批准时，Claude Code 退出计划模式并恢复进入计划模式之前激活的权限模式。记录会显示"Allowed by PermissionRequest hook"代替对话框。钩子路径始终保持当前会话：它无法像对话框那样清除上下文并开始全新的实现会话。

要设置特定的权限模式，你的钩子输出可以包含带有 `setMode` 条目的 `updatedPermissions` 数组。`mode` 值是任何权限模式，如 `default`、`acceptEdits` 或 `bypassPermissions`，`destination: "session"` 仅对当前会话应用。

`bypassPermissions` 仅在会话已以绕过模式可用的方式启动时适用：`--dangerously-skip-permissions`、`--permission-mode bypassPermissions`、`--allow-dangerously-skip-permissions`，或设置中的 `permissions.defaultMode: "bypassPermissions"`，且未被 [`permissions.disableBypassPermissionsMode`](/zh/permissions#托管设置) 禁用。它永远不会作为 `defaultMode` 持久化。

要将会话切换到 `acceptEdits`，你的钩子向 stdout 写入以下 JSON：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedPermissions": [
        { "type": "setMode", "mode": "acceptEdits", "destination": "session" }
      ]
    }
  }
}
```

保持匹配器尽可能窄。匹配 `.*` 或留空匹配器会自动批准每个权限提示，包括文件写入和 shell 命令。完整的决策字段请参阅 [PermissionRequest 参考](/zh/hooks#permissionrequest-决策控制)。

## 钩子的工作原理

钩子事件在 Claude Code 的特定生命周期节点触发。当事件触发时，所有匹配的钩子并行运行，相同的钩子命令会自动去重。下表显示了每个事件及其触发时机：

| 事件                    | 触发时机                                                                                                                               |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`         | 会话开始或恢复时                                                                                                                        |
| `Setup`                | 使用 `--init-only` 启动 Claude Code 时，或在 `-p` 模式下使用 `--init` 或 `--maintenance` 时。用于 CI 或脚本中的一次性准备工作                                                  |
| `UserPromptSubmit`     | 你提交提示词时，在 Claude 处理之前                                                                                                        |
| `UserPromptExpansion`  | 用户输入的命令展开为提示词时，在到达 Claude 之前。可以阻止展开                                                                                  |
| `PreToolUse`           | 工具调用执行之前。可以阻止它                                                                                                              |
| `PermissionRequest`    | 权限对话框出现时                                                                                                                         |
| `PermissionDenied`     | 工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 告诉模型它可以重试被拒绝的工具调用                                                               |
| `PostToolUse`          | 工具调用成功之后                                                                                                                         |
| `PostToolUseFailure`   | 工具调用失败之后                                                                                                                         |
| `PostToolBatch`        | 整批并行工具调用解析之后，在下一次模型调用之前                                                                                               |
| `Notification`         | Claude Code 发送通知时                                                                                                                   |
| `MessageDisplay`       | 助手消息文本显示时                                                                                                                       |
| `SubagentStart`        | 子代理生成时                                                                                                                            |
| `SubagentStop`         | 子代理完成时                                                                                                                            |
| `TaskCreated`          | 通过 `TaskCreate` 创建任务时                                                                                                              |
| `TaskCompleted`        | 任务被标记为完成时                                                                                                                        |
| `Stop`                 | Claude 完成响应时                                                                                                                       |
| `StopFailure`         | 由于 API 错误导致轮次结束时。输出和退出码被忽略                                                                                            |
| `TeammateIdle`         | [代理团队](/zh/agent-teams)队友即将空闲时                                                                                                  |
| `InstructionsLoaded`   | CLAUDE.md 或 `.claude/rules/*.md` 文件被加载到上下文时。在会话开始和会话期间文件延迟加载时触发                                                       |
| `ConfigChange`         | 会话期间配置文件变更时                                                                                                                    |
| `CwdChanged`           | 工作目录变更时，例如 Claude 执行 `cd` 命令时。适用于使用 direnv 等工具的响应式环境管理                                                              |
| `FileChanged`          | 监视的文件在磁盘上变更时。`matcher` 字段指定要监视的文件名                                                                                     |
| `WorktreeCreate`       | 通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替代默认的 git 行为                                                                |
| `WorktreeRemove`       | 移除工作树时，无论是在会话退出时还是子代理完成时                                                                                             |
| `PreCompact`           | 上下文压缩之前                                                                                                                          |
| `PostCompact`          | 上下文压缩完成之后                                                                                                                       |
| `Elicitation`          | MCP 服务器在工具调用期间请求用户输入时                                                                                                      |
| `ElicitationResult`    | 用户响应 MCP 引导之后，在响应发回服务器之前                                                                                                  |
| `SessionEnd`           | 会话终止时                                                                                                                              |

每个钩子都有一个决定其运行方式的 `type`。大多数钩子使用 `"type": "command"`，即运行 shell 命令。还有四种其他类型可用：

* `"type": "http"`：将事件数据 POST 到 URL。参见 [HTTP 钩子](#http-钩子)。
* `"type": "mcp_tool"`：调用已连接的 MCP 服务器上的工具。参见 [MCP 工具钩子](/zh/hooks#mcp-工具钩子字段)。
* `"type": "prompt"`：单轮 LLM 评估。参见[基于提示词的钩子](#基于提示词的钩子)。
* `"type": "agent"`：带工具访问的多轮验证。代理钩子是实验性的，可能会发生变化。参见[基于代理的钩子](#基于代理的钩子)。

### 合并多个钩子的结果

当多个钩子匹配同一事件时，每个钩子的命令都会运行到完成，然后 Claude Code 合并结果。一个钩子返回 `deny` 不会阻止同级钩子执行。不要依赖一个钩子的 `deny` 来抑制另一个钩子的副作用。

所有匹配的钩子完成后，Claude Code 合并它们的输出。对于 `PreToolUse` 权限决策，最严格的答案胜出：`deny` 覆盖 `ask`，`ask` 覆盖 `allow`。每个钩子的 `additionalContext` 文本都会保留并一起传递给 Claude。

以下示例在 `Bash` 上注册了两个 `PreToolUse` 钩子。第一个将每个命令追加到日志文件并以退出码 0 退出。第二个运行脚本，当命令包含 `rm -rf` 时以退出码 2 拒绝：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r .tool_input.command >> ~/.claude/bash.log"
          },
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm-rf.sh"
          }
        ]
      }
    ]
  }
}
```

当 Claude 尝试运行 `rm -rf /tmp/build` 时，两个钩子并行执行。日志钩子将命令写入 `~/.claude/bash.log` 并以退出码 0 退出，报告无决策。防护钩子以退出码 2 退出，拒绝工具调用。拒绝胜出，因此 Claude Code 阻止命令并向 Claude 显示防护脚本的 stderr。日志条目仍然被写入，因为日志钩子已经运行了。

### 读取输入并返回输出

钩子通过 stdin、stdout、stderr 和退出码与 Claude Code 通信。当事件触发时，Claude Code 将事件特定的数据作为 JSON 传递给脚本的 stdin。脚本读取数据、执行操作，然后通过退出码告诉 Claude Code 接下来做什么。

#### 钩子输入

每个事件都包含 `session_id` 和 `cwd` 等公共字段，但每种事件类型会添加不同的数据。例如，当 Claude 运行 Bash 命令时，`PreToolUse` 钩子在 stdin 上收到类似这样的内容：

```json
{
  "session_id": "abc123",          // 此会话的唯一 ID
  "cwd": "/Users/sarah/myproject", // 事件触发时的工作目录
  "hook_event_name": "PreToolUse", // 触发此钩子的事件
  "tool_name": "Bash",             // Claude 即将使用的工具
  "tool_input": {                  // Claude 传递给工具的参数
    "command": "npm test"          // 对于 Bash，这是 shell 命令
  }
}
```

你的脚本可以解析该 JSON 并根据任何字段执行操作。`UserPromptSubmit` 钩子获取 `prompt` 文本，`SessionStart` 钩子获取 `source`（startup、resume、clear、compact）等。公共字段请参阅参考中的[公共输入字段](/zh/hooks#公共输入字段)，每个事件的部分有事件特定的模式。

#### 钩子输出

你的脚本通过写入 stdout 或 stderr 并以特定代码退出来告诉 Claude Code 接下来做什么。例如，一个想要阻止命令的 `PreToolUse` 钩子：

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "drop table"; then
  echo "Blocked: dropping tables is not allowed" >&2  # stderr 成为 Claude 的反馈
  exit 2                                               # 退出码 2 = 阻止操作
fi

exit 0  # 退出码 0 = 无决策；正常的权限流程仍然适用
```

退出码决定接下来发生什么：

* **退出码 0**：钩子不反对，操作正常进行。对于 `PreToolUse` 钩子，这不会批准工具调用：正常的[权限流程](/zh/permissions)仍然适用。对于 `UserPromptSubmit`、`UserPromptExpansion` 和 `SessionStart` 钩子，你写入 stdout 的任何内容都会添加到 Claude 的上下文中。
* **退出码 2**：操作被阻止。向 stderr 写入原因，Claude 会将其作为反馈收到以便调整。某些事件无法被阻止：对于 `SessionStart`、`Setup`、`Notification` 等，退出码 2 会向用户显示 stderr 并继续执行。每个事件的退出码 2 行为请参阅[退出码 2 行为](/zh/hooks#每个事件的退出码-2-行为)。
* **任何其他退出码**：操作继续。记录显示 `<hook name> hook error` 通知后跟 stderr 的第一行；完整的 stderr 进入[调试日志](/zh/hooks#调试钩子)。

#### 结构化 JSON 输出

退出码只能让你阻止或保持沉默。要获得更多控制，请以退出码 0 退出并向 stdout 打印 JSON 对象。

使用退出码 2 配合 stderr 消息来阻止，或使用退出码 0 配合 JSON 进行结构化控制。不要混合使用：当你以退出码 2 退出时，Claude Code 会忽略 JSON。

例如，`PreToolUse` 钩子可以拒绝工具调用并告诉 Claude 原因，或将其升级给用户批准：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

使用 `"deny"` 时，Claude Code 取消工具调用并将 `permissionDecisionReason` 反馈给 Claude。这些 `permissionDecision` 值特定于 `PreToolUse`：

* `"allow"`：跳过交互式权限提示。拒绝和询问规则，包括企业托管拒绝列表，仍然适用
* `"deny"`：取消工具调用并将原因发送给 Claude
* `"ask"`：正常向用户显示权限提示

第四个值 `"defer"` 可在使用 `-p` 标志的[非交互模式](/zh/headless)中使用。它退出进程并保留工具调用，以便 Agent SDK 包装器可以收集输入并恢复。参考中的[延迟工具调用以供稍后处理](/zh/hooks#延迟工具调用以供稍后处理)。

返回 `"allow"` 跳过交互式提示但不覆盖[权限规则](/zh/permissions#管理权限)。如果拒绝规则匹配工具调用，即使你的钩子返回 `"allow"`，调用也会被阻止。如果询问规则匹配，用户仍会被提示。这意味着任何设置范围的拒绝规则，包括[托管设置](/zh/settings#设置文件)，始终优先于钩子批准。

其他事件使用不同的决策模式。例如，`PostToolUse` 和 `Stop` 钩子使用顶层 `decision: "block"` 字段，而 `PermissionRequest` 使用 `hookSpecificOutput.decision.behavior`。参考中的[摘要表](/zh/hooks#决策控制)按事件进行了完整分解。

对于 `UserPromptSubmit` 钩子，改用 `additionalContext` 向 Claude 的上下文注入文本。基于提示词的钩子（`type: "prompt"`）处理输出的方式不同：参见[基于提示词的钩子](#基于提示词的钩子)。

### 使用匹配器过滤钩子

没有匹配器时，钩子在其事件每次出现时都会触发。匹配器让你缩小范围。例如，如果你想仅在文件编辑后（而不是每次工具调用后）运行格式化器，请为 `PostToolUse` 钩子添加匹配器：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write ..." }
        ]
      }
    ]
  }
}
```

`"Edit|Write"` 匹配器仅在 Claude 使用 `Edit` 或 `Write` 工具时触发，而不是在使用 `Bash`、`Read` 或其他工具时。普通名称和正则表达式的求值方式请参阅[匹配器模式](/zh/hooks#匹配器模式)。

Claude 也可以通过 `Bash` 工具运行 shell 命令来创建或修改文件。如果你的钩子必须看到每个文件变更，例如用于合规扫描或审计日志，请添加一个 [`Stop`](/zh/hooks#stop) 钩子，每轮扫描一次工作树。要改为每次调用覆盖，请同时匹配 `Bash` 并让脚本使用 `git status --porcelain` 列出已修改和未跟踪的文件。

每种事件类型匹配特定字段：

| 事件                                                                                                                                                            | 匹配器过滤的内容                                | 示例匹配器值                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`                                                                       | 工具名称                                       | `Bash`、`Edit\|Write`、`mcp__.*`                                                                                                                                   |
| `SessionStart`                                                                                                                                                  | 会话启动方式                                    | `startup`、`resume`、`clear`、`compact`                                                                                                                              |
| `Setup`                                                                                                                                                         | 触发设置的 CLI 标志                              | `init`、`maintenance`                                                                                                                                               |
| `SessionEnd`                                                                                                                                                    | 会话结束原因                                    | `clear`、`resume`、`logout`、`prompt_input_exit`、`bypass_permissions_disabled`、`other`                                                                              |
| `Notification`                                                                                                                                                  | 通知类型                                       | `permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`、`elicitation_complete`、`elicitation_response`                                                |
| `SubagentStart`                                                                                                                                                 | 代理类型                                       | `general-purpose`、`Explore`、`Plan` 或自定义代理名称                                                                                                                   |
| `PreCompact`、`PostCompact`                                                                                                                                     | 触发压缩的原因                                  | `manual`、`auto`                                                                                                                                                     |
| `SubagentStop`                                                                                                                                                  | 代理类型                                       | 与 `SubagentStart` 相同的值                                                                                                                                          |
| `ConfigChange`                                                                                                                                                  | 配置来源                                       | `user_settings`、`project_settings`、`local_settings`、`policy_settings`、`skills`                                                                                     |
| `StopFailure`                                                                                                                                                   | 错误类型                                       | `rate_limit`、`authentication_failed`、`oauth_org_not_allowed`、`billing_error`、`invalid_request`、`model_not_found`、`server_error`、`max_output_tokens`、`unknown`      |
| `InstructionsLoaded`                                                                                                                                            | 加载原因                                       | `session_start`、`nested_traversal`、`path_glob_match`、`include`、`compact`                                                                                            |
| `Elicitation`                                                                                                                                                   | MCP 服务器名称                                  | 你配置的 MCP 服务器名称                                                                                                                                               |
| `ElicitationResult`                                                                                                                                             | MCP 服务器名称                                  | 与 `Elicitation` 相同的值                                                                                                                                            |
| `FileChanged`                                                                                                                                                   | 要监视的字面文件名（参见 [FileChanged](/zh/hooks#filechanged)） | `.envrc\|.env`                                                                                                                                                       |
| `UserPromptExpansion`                                                                                                                                           | 命令名称                                       | 你的技能或命令名称                                                                                                                                                   |
| `UserPromptSubmit`、`PostToolBatch`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove`、`CwdChanged`、`MessageDisplay`       | 不支持匹配器                                    | 每次出现都触发                                                                                                                                                      |

更多展示不同事件类型匹配器的示例：

**记录每个 Bash 命令：**

仅匹配 `Bash` 工具调用并将每个命令记录到文件。`PostToolUse` 事件在命令完成后触发，因此 `tool_input.command` 包含已运行的内容。钩子通过 stdin 以 JSON 形式接收事件数据，`jq -r '.tool_input.command'` 仅提取命令字符串，`>>` 将其追加到日志文件：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

**匹配 MCP 工具：**

MCP 工具使用与内置工具不同的命名约定：`mcp__<server>__<tool>`，其中 `<server>` 是 MCP 服务器名称，`<tool>` 是它提供的工具。例如，`mcp__github__search_repositories` 或 `mcp__filesystem__read_file`。使用正则表达式匹配器来定位特定服务器的所有工具，或使用 `mcp__.*__write.*` 等模式跨服务器匹配。完整的示例列表请参阅参考中的[匹配 MCP 工具](/zh/hooks#匹配-mcp-工具)。

以下命令使用 `jq` 从钩子的 JSON 输入中提取工具名称并写入 stderr。写入 stderr 保持 stdout 清洁用于 JSON 输出，并将消息发送到[调试日志](/zh/hooks#调试钩子)：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

**会话结束时清理：**

`SessionEnd` 事件支持匹配会话结束原因的匹配器。此钩子仅在 `clear`（当你运行 `/clear` 时）触发，不在正常退出时触发：

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "clear",
        "hooks": [
          {
            "type": "command",
            "command": "rm -f /tmp/claude-scratch-*.txt"
          }
        ]
      }
    ]
  }
}
```

完整的匹配器语法请参阅[钩子参考](/zh/hooks#配置)。

#### 使用 `if` 字段按工具名称和参数过滤

`if` 字段需要 Claude Code v2.1.85 或更高版本。早期版本会忽略它并在每个匹配的调用上运行钩子。

`if` 字段使用[权限规则语法](/zh/permissions)按工具名称和参数一起过滤钩子，因此钩子进程仅在工具调用匹配时生成，或在 Bash 命令过于复杂无法解析时生成。这超越了 `matcher`，后者仅按工具名称在组级别过滤。

例如，要仅在 Claude 使用 `git` 命令而不是所有 Bash 命令时运行钩子：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-git-policy.sh"
          }
        ]
      }
    ]
  }
}
```

钩子进程仅在 Bash 命令的子命令匹配 `git *` 时生成，或在命令过于复杂无法解析为子命令时生成。对于 `npm test && git push` 等复合命令，Claude Code 评估每个子命令并触发钩子，因为 `git push` 匹配。`if` 字段接受与权限规则相同的模式：`"Bash(git *)"`、`"Edit(*.ts)"` 等。要匹配多个工具名称，请使用各自带有 `if` 值的单独处理器，或在支持管道交替的 `matcher` 级别匹配。

`if` 仅适用于工具事件：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest` 和 `PermissionDenied`。将其添加到任何其他事件会阻止钩子运行。

### 配置钩子位置

添加钩子的位置决定其范围：

| 位置                                                       | 范围                           | 可共享                             |
| :--------------------------------------------------------- | :----------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目                     | 否，本地于你的机器                    |
| `.claude/settings.json`                                    | 单个项目                        | 是，可以提交到仓库                    |
| `.claude/settings.local.json`                              | 单个项目                        | 否，被 gitignore 忽略                 |
| 托管策略设置                                                  | 组织范围                        | 是，管理员控制                        |
| [插件](/zh/plugins) `hooks/hooks.json`                       | 插件启用时                      | 是，随插件打包                        |
| [技能](/zh/skills) 或[子代理](/zh/sub-agents) frontmatter       | 技能或代理激活时                  | 是，在组件文件中定义                   |

在 Claude Code 中运行 [`/hooks`](/zh/hooks#钩子菜单) 可按事件分组浏览所有已配置的钩子。要禁用钩子，请在设置文件中设置 `"disableAllHooks": true`。托管设置中配置的钩子仍然运行，除非那里也设置了 `disableAllHooks`。

如果你在 Claude Code 运行时直接编辑设置文件，文件监视器通常会自动获取钩子更改。

## 基于提示词的钩子

对于需要判断而非确定性规则的决策，请使用 `type: "prompt"` 钩子。Claude Code 不运行 shell 命令，而是将你的提示词和钩子的输入数据发送给 Claude 模型（默认为 Haiku）来做出决策。如果需要更多能力，可以通过 `model` 字段指定不同的模型。

模型的唯一工作是返回是/否的 JSON 决策：

* `"ok": true`：操作继续
* `"ok": false`：发生什么取决于事件：
  * `Stop` 和 `SubagentStop`：`reason` 被反馈给 Claude 以便它继续工作
  * `PreToolUse`：工具调用被拒绝，`reason` 作为工具错误返回给 Claude，以便它调整并继续
  * `PostToolUse`、`PostToolBatch`、`UserPromptSubmit` 和 `UserPromptExpansion`：轮次结束，`reason` 作为警告行出现在聊天中

此示例使用 `Stop` 钩子询问模型所有请求的任务是否完成。如果模型返回 `"ok": false`，Claude 继续工作并使用 `reason` 作为其下一个指令：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains to be done\"}."
          }
        ]
      }
    ]
  }
}
```

完整的配置选项请参阅参考中的[基于提示词的钩子](/zh/hooks#基于提示词的钩子)。

## 基于代理的钩子

代理钩子是实验性的。行为和配置可能在未来版本中发生变化。对于生产工作流，推荐使用[命令钩子](/zh/hooks#命令钩子字段)。

当验证需要检查文件或运行命令时，请使用 `type: "agent"` 钩子。与进行单次 LLM 调用的提示词钩子不同，代理钩子生成一个子代理，它可以读取文件、搜索代码并使用其他工具来验证条件，然后再返回决策。

代理钩子使用与提示词钩子相同的 `"ok"` / `"reason"` 响应格式，但默认超时更长，为 60 秒，最多 50 轮工具使用。

此示例在允许 Claude 停止之前验证测试是否通过：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

当钩子输入数据本身足以做出决策时使用提示词钩子。当需要根据代码库的实际状态验证某些内容时使用代理钩子。

完整的配置选项请参阅参考中的[基于代理的钩子](/zh/hooks#基于代理的钩子)。

## HTTP 钩子

使用 `type: "http"` 钩子将事件数据 POST 到 HTTP 端点，而不是运行 shell 命令。端点接收与命令钩子在 stdin 上接收的相同 JSON，并通过 HTTP 响应体使用相同的 JSON 格式返回结果。

当你希望 Web 服务器、云函数或外部服务处理钩子逻辑时，HTTP 钩子很有用：例如，跨团队记录工具使用事件的共享审计服务。

此示例将每个工具使用发布到本地日志服务：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/tool-use",
            "headers": {
              "Authorization": "Bearer $MY_TOKEN"
            },
            "allowedEnvVars": ["MY_TOKEN"]
          }
        ]
      }
    ]
  }
}
```

端点应使用与命令钩子相同的[输出格式](/zh/hooks#json-输出)返回 JSON 响应体。要阻止工具调用，请返回 2xx 响应并包含适当的 `hookSpecificOutput` 字段。仅 HTTP 状态码无法阻止操作。

头部值支持使用 `$VAR_NAME` 或 `${VAR_NAME}` 语法的环境变量插值。仅 `allowedEnvVars` 数组中列出的变量会被解析；所有其他 `$VAR` 引用保持为空。

完整的配置选项和响应处理请参阅参考中的 [HTTP 钩子](/zh/hooks#http-钩子字段)。

## 限制和故障排除

### 限制

* 命令钩子仅通过 stdout、stderr 和退出码通信。它们无法触发 `/` 命令或工具调用。通过 `additionalContext` 返回的文本被注入为系统提醒，Claude 将其作为纯文本阅读。HTTP 钩子改为通过响应体通信。
* 钩子超时因类型而异。可通过每个钩子中的 `timeout` 字段（以秒为单位）覆盖。
  * `command`、`http`、`mcp_tool`：10 分钟。`UserPromptSubmit` 将这些降低到 30 秒。
  * `prompt`：30 秒。
  * `agent`：60 秒。
* `PostToolUse` 钩子无法撤消操作，因为工具已经执行。
* `PermissionRequest` 钩子在[非交互模式](/zh/headless)（`-p`）下不触发。使用 `PreToolUse` 钩子进行自动化权限决策。
* `Stop` 钩子在 Claude 完成响应时触发，不仅在任务完成时。它们不会在用户中断时触发。API 错误会改为触发 [StopFailure](/zh/hooks#stopfailure)。
* 当多个 PreToolUse 钩子返回 [`updatedInput`](/zh/hooks#pretooluse) 来重写工具的参数时，最后完成的获胜。由于钩子并行运行，顺序是非确定性的。避免让多个钩子修改同一工具的输入。

### 钩子和权限模式

PreToolUse 钩子在任何权限模式检查之前触发。返回 `permissionDecision: "deny"` 的钩子即使在 `bypassPermissions` 模式或使用 `--dangerously-skip-permissions` 时也会阻止工具。这让你可以强制执行用户无法通过更改权限模式绕过的策略。

反之则不成立：返回 `"allow"` 的钩子不会绕过设置中的拒绝规则。钩子可以收紧限制但不能超越权限规则允许的范围放宽它们。

### 钩子未触发

钩子已配置但从未执行。

* 运行 `/hooks` 并确认钩子出现在正确的事件下
* 检查匹配器模式是否与工具名称完全匹配（匹配器区分大小写）
* 验证你触发的是正确的事件类型（例如，`PreToolUse` 在工具执行前触发，`PostToolUse` 在之后触发）
* 如果在非交互模式（`-p`）下使用 `PermissionRequest` 钩子，请改为使用 `PreToolUse`

### 输出中的钩子错误

你在记录中看到类似"PreToolUse hook error: ..."的消息。

* 你的脚本意外以非零代码退出。通过管道传递样本 JSON 手动测试：
  ```bash
  echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
  echo $?  # 检查退出码
  ```
* 如果你看到"command not found"，请使用绝对路径或 `${CLAUDE_PROJECT_DIR}` 引用脚本。要完全避免 shell 引用问题，请添加 `"args": []` 切换到 [exec 形式](/zh/hooks#exec-形式和-shell-形式)，它直接生成脚本而不经过 shell
* 如果你看到"jq: command not found"，请安装 `jq` 或使用 Python/Node.js 进行 JSON 解析
* 如果脚本根本没有运行，请使其可执行：`chmod +x ./my-hook.sh`

### `/hooks` 显示未配置钩子

你编辑了设置文件但钩子未出现在菜单中。

* 文件编辑通常会自动被获取。如果几秒后仍未出现，文件监视器可能错过了更改：重启会话以强制重新加载
* 验证你的 JSON 是否有效（不允许尾随逗号和注释）
* 确认设置文件位于正确的位置：项目钩子在 `.claude/settings.json`，全局钩子在 `~/.claude/settings.json`

### Stop 钩子达到阻止上限

Claude 继续工作而不是停止，然后以 Stop 钩子连续阻止太多次的警告结束轮次。

Claude Code 在 Stop 钩子连续阻止 8 次且没有进展后会覆盖它。你的钩子脚本需要检查它是否已触发了继续。从 JSON 输入中解析 `stop_hook_active` 字段，如果为 `true` 则提前退出：

```bash
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # 允许 Claude 停止
fi
# ... 你的钩子逻辑的其余部分
```

如果你的钩子确实需要超过八次迭代才能收敛，请使用 [`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`](/zh/env-vars) 提高上限。

### JSON 验证失败

Claude Code 显示 JSON 解析错误，即使你的钩子脚本输出了有效的 JSON。

当 Claude Code 运行 shell 形式的命令钩子（没有 `args` 的钩子）时，它默认在 macOS 和 Linux 上生成 `sh -c`，或在 Windows 上生成 Git Bash。此 shell 是非交互式的，但 Git Bash 和某些配置（如 `BASH_ENV` 指向 `~/.bashrc`）仍然会 source 你的 profile。如果该 profile 包含无条件的 `echo` 语句，输出会被前置到你的钩子 JSON 中：

```text
Shell ready on arm64
{"decision": "block", "reason": "Not allowed"}
```

Claude Code 尝试将其解析为 JSON 并失败。要修复此问题，请在你的 shell profile 中包装 echo 语句，使其仅在交互式 shell 中运行：

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

`$-` 变量包含 shell 标志，`i` 表示交互式。钩子在非交互式 shell 中运行，因此 echo 被跳过。

### 调试技术

通过 `Ctrl+O` 切换的记录视图，为每个触发的钩子显示一行摘要：成功时静默，阻止错误显示 stderr，非阻止错误显示 `<hook name> hook error` 通知后跟 stderr 的第一行。

有关完整的执行细节，包括哪些钩子匹配、它们的退出码、stdout 和 stderr，请阅读调试日志。使用 `claude --debug-file /tmp/claude.log` 启动 Claude Code 以写入已知路径，然后在另一个终端中 `tail -f /tmp/claude.log`。如果你启动时没有使用该标志，请在会话中途运行 `/debug` 以启用日志记录并找到日志路径。

## 了解更多

* [钩子参考](/zh/hooks)：完整的事件模式、JSON 输出格式、异步钩子和 MCP 工具钩子
* [安全注意事项](/zh/hooks#安全注意事项)：在共享或生产环境部署钩子前请查阅
* [Bash 命令验证器示例](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)：完整的参考实现
