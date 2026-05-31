# 钩子

钩子是 Codex 的可扩展性框架。它们允许你将自己的脚本注入代理循环中，从而实现以下功能：

- 将对话发送到自定义日志/分析引擎
- 扫描团队的提示词，阻止意外粘贴 API 密钥
- 总结对话以自动创建持久记忆
- 在对话轮次停止时运行自定义验证检查，强制执行标准
- 在特定目录中自定义提示词

钩子默认启用。如果你需要在 `config.toml` 中关闭它们，请设置：

```toml
[features]
hooks = false
```

使用 `hooks` 作为规范的功能键。`codex_hooks` 仍作为已弃用的别名可用。

管理员可以在 `requirements.toml` 中以相同方式强制关闭钩子：`[features].hooks = false`。

需要了解的运行时行为：

- 匹配多个文件中的钩子都会运行。
- 同一事件的多个匹配命令钩子会并发启动，因此一个钩子无法阻止另一个匹配的钩子启动。
- 非托管命令钩子在运行前必须经过审查和信任。
- `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop` 和 `Stop` 在轮次范围内运行。`SessionStart` 和 `SubagentStart` 在线程或子代理启动范围内运行。

## Codex 查找钩子的位置

Codex 在活动配置层附近以以下两种形式发现钩子：

- `hooks.json`
- `config.toml` 内的内联 `[hooks]` 表

已安装的插件也可以通过其插件清单或默认的 `hooks/hooks.json` 文件捆绑生命周期配置。有关插件打包规则，请参阅[构建插件](https://developers.openai.com/codex/plugins/build#bundled-mcp-servers-and-lifecycle-config)。

实际上，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`

如果存在多个钩子源，Codex 会加载所有匹配的钩子。更高优先级的配置层不会替换较低优先级的钩子。如果单个层同时包含 `hooks.json` 和内联 `[hooks]`，Codex 会合并它们并在启动时发出警告。建议每层只使用一种表示形式。

Codex 还可以发现与已启用插件捆绑的钩子。插件捆绑的钩子与其他钩子源一起加载，并使用与其他非托管钩子相同的信任审查流程。

项目本地钩子仅在项目 `.codex/` 层受信任时加载。在不受信任的项目中，Codex 仍会从其自身的活动配置层加载用户和系统钩子。

## 审查和信任钩子

Codex 在决定哪些钩子可以运行之前会列出已配置的钩子。在非托管命令钩子可以运行之前，Codex 要求你审查并信任确切的钩子定义。Codex 根据钩子的当前哈希记录信任，因此新的或已更改的钩子会被标记为待审查，在获得信任之前会被跳过。

在 CLI 中使用 `/hooks` 来检查钩子源、审查新的或已更改的钩子、信任钩子或禁用单个非托管钩子。如果钩子在启动时需要审查，Codex 会打印警告，提示你打开 `/hooks`。

来自系统、MDM、云或 `requirements.toml` 源的托管钩子被标记为托管、按策略受信任，并且无法从用户钩子浏览器中禁用。

对于已在 Codex 外部审查钩子源的一次性自动化，请传递 `--dangerously-bypass-hook-trust` 来运行已启用的钩子，而无需该调用的持久钩子信任。

## 配置结构

钩子分为三个层级：

- 钩子事件，如 `PreToolUse`、`PostToolUse`、`PreCompact`、`SubagentStart` 或 `Stop`
- 匹配器组，决定事件何时匹配
- 一个或多个钩子处理器，在匹配器组匹配时运行

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.codex/hooks/session_start.py",
            "statusMessage": "Loading session notes"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py\"",
            "statusMessage": "Checking Bash command"
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/permission_request.py\"",
            "statusMessage": "Checking approval request"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py\"",
            "statusMessage": "Reviewing Bash output"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/user_prompt_submit_data_flywheel.py\""
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/stop_continue.py\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

注意事项：

- `timeout` 单位为秒。
- 如果省略 `timeout`，Codex 使用 `600` 秒。
- `statusMessage` 是可选的。
- `commandWindows` 是可选的仅 Windows 命令覆盖。在 TOML 中，使用 `command_windows` 或 `commandWindows`。
- `async` 会被解析，但异步命令钩子尚不支持。Codex 会跳过 `async: true` 的处理器。
- 目前只有 `type: "command"` 处理器会运行。`prompt` 和 `agent` 处理器会被解析但跳过。
- 命令以会话 `cwd` 作为工作目录运行。
- 对于仓库本地钩子，建议从 git 根目录解析，而不是使用相对路径如 `.codex/hooks/...`。Codex 可能从子目录启动，基于 git 根的路径可保持钩子位置稳定。

`config.toml` 中的等效内联 TOML：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"

[[hooks.PostToolUse]]
matcher = "^Bash$"

[[hooks.PostToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py"'
timeout = 30
statusMessage = "Reviewing Bash output"
```

## 来自 `requirements.toml` 的托管钩子

企业托管的需求也可以在 `[hooks]` 下内联定义钩子。当管理员想要强制执行钩子配置同时通过 MDM 或其他设备管理系统分发实际脚本时，这很有用。要为本地禁用钩子的用户强制执行托管钩子，请在 `requirements.toml` 中将 `[features].hooks = true` 与 `[hooks]` 一起固定。要忽略用户、项目、会话和插件钩子，同时仍允许管理员托管钩子，请设置 `allow_managed_hooks_only = true`。

```toml
allow_managed_hooks_only = true

[features]
hooks = true

[hooks]
managed_dir = "/enterprise/hooks"
windows_managed_dir = 'C:\enterprise\hooks'

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "python3 /enterprise/hooks/pre_tool_use_policy.py"
command_windows = 'py -3 C:\enterprise\hooks\pre_tool_use_policy.py'
timeout = 30
statusMessage = "Checking managed Bash command"
```

托管钩子注意事项：

- `managed_dir` 在 macOS 和 Linux 上使用。
- `windows_managed_dir` 在 Windows 上使用。
- Codex 不会分发 `managed_dir` 中的脚本；你的企业工具必须单独安装和更新它们。
- 托管钩子命令应使用配置的托管目录下的绝对脚本路径。
- `allow_managed_hooks_only = true` 会跳过来自用户、项目、会话和插件源的钩子，但仍会从 `requirements.toml` 和其他托管配置层加载托管钩子。

## 插件捆绑的钩子

当插件启用时，Codex 可以从该插件加载生命周期钩子，与用户、项目和托管钩子一起使用。

默认情况下，Codex 在插件根目录中查找 `hooks/hooks.json`。插件清单可以通过 `.codex-plugin/plugin.json` 中的 `hooks` 条目覆盖该默认值。清单条目可以是 `./` 前缀的路径、`./` 前缀路径的数组、内联钩子对象或内联钩子对象的数组。

```json
{
  "name": "repo-policy",
  "hooks": "./hooks/hooks.json"
}
```

清单钩子路径相对于插件根目录解析，且必须保持在该根目录内。如果清单定义了 `hooks`，Codex 使用这些清单条目而不是默认的 `hooks/hooks.json`。

插件钩子命令接收以下环境变量：

- `PLUGIN_ROOT` 是 Codex 特定的扩展，指向已安装的插件根目录。
- `PLUGIN_DATA` 是 Codex 特定的扩展，指向插件的可写数据目录。
- Codex 还设置了 `CLAUDE_PLUGIN_ROOT` 和 `CLAUDE_PLUGIN_DATA`，以兼容现有的插件钩子。

插件钩子使用与其他钩子相同的事件架构。安装或启用插件不会自动信任其钩子；Codex 会跳过插件捆绑的钩子，直到你审查并信任当前的钩子定义。

## 匹配器模式

`matcher` 字段是一个正则表达式字符串，用于过滤钩子何时触发。使用 `"*"`、`""` 或完全省略 `matcher` 来匹配受支持事件的每次出现。

只有部分当前 Codex 事件支持 `matcher`：

| 事件                | `matcher` 过滤的内容 | 备注                                                          |
| ------------------- | -------------------- | ------------------------------------------------------------- |
| `PermissionRequest` | 工具名称             | 支持包括 `Bash`、`apply_patch`\* 和 MCP 工具名称             |
| `PostToolUse`       | 工具名称             | 支持包括 `Bash`、`apply_patch`\* 和 MCP 工具名称             |
| `PostCompact`       | 压缩触发器           | 值为 `manual` 或 `auto`                                       |
| `PreCompact`        | 压缩触发器           | 值为 `manual` 或 `auto`                                       |
| `PreToolUse`        | 工具名称             | 支持包括 `Bash`、`apply_patch`\* 和 MCP 工具名称             |
| `SessionStart`      | 启动来源             | 值为 `startup`、`resume`、`clear` 和 `compact`                |
| `SubagentStart`     | 子代理类型           | 值取决于启动的子代理                                          |
| `SubagentStop`      | 子代理类型           | 值取决于停止的子代理                                          |
| `UserPromptSubmit`  | 不支持               | 此事件忽略任何已配置的 `matcher`                              |
| `Stop`              | 不支持               | 此事件忽略任何已配置的 `matcher`                              |

\*对于 `apply_patch`，`matcher` 值也可以使用 `Edit` 或 `Write`。

示例：

- `Bash`
- `^apply_patch$`
- `Edit|Write`
- `mcp__filesystem__read_file`
- `mcp__filesystem__.*`
- `startup|resume|clear|compact`
- `manual|auto`

## 常见输入字段

每个命令钩子通过 `stdin` 接收一个 JSON 对象。

以下是通常使用的共享字段：

| 字段              | 类型             | 含义                                                           |
| ----------------- | ---------------- | -------------------------------------------------------------- |
| `session_id`      | `string`         | 当前 Codex 会话 ID。子代理钩子使用父会话 ID。                 |
| `transcript_path` | `string \| null` | 会话记录文件的路径（如果有）                                   |
| `cwd`             | `string`         | 会话的工作目录                                                 |
| `hook_event_name` | `string`         | 当前钩子事件名称                                               |
| `model`           | `string`         | Codex 特定扩展。活动模型标识符                                 |

轮次范围的钩子在其事件特定表中将 `turn_id` 列为 Codex 特定扩展。

`SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop` 和 `Stop` 还包含 `permission_mode`，它描述当前权限模式为 `default`、`acceptEdits`、`plan`、`dontAsk` 或 `bypassPermissions`。

`transcript_path` 指向对话记录以供方便使用，但记录格式不是钩子的稳定接口，可能会随时间变化。

如果你需要完整的线路格式，请参阅[架构](#架构)。

## 常见输出字段

`SessionStart`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop` 和 `Stop` 支持这些共享 JSON 字段。`SubagentStart` 接受相同形状的 `systemMessage` 和钩子特定上下文，但 `continue: false` 不会停止子代理：

```json
{
  "continue": true,
  "stopReason": "optional",
  "systemMessage": "optional",
  "suppressOutput": false
}
```

| 字段             | 效果                                       |
| ---------------- | ------------------------------------------ |
| `continue`       | 如果为 `false`，标记该钩子运行为已停止     |
| `stopReason`     | 记录为停止原因                             |
| `systemMessage`  | 作为警告显示在 UI 或事件流中               |
| `suppressOutput` | 今天已解析但尚未实现                       |

退出码 `0` 且无输出被视为成功，Codex 继续执行。

`PreToolUse` 和 `PermissionRequest` 支持 `systemMessage`，但 `continue`、`stopReason` 和 `suppressOutput` 目前不支持这些事件。如果 `PreToolUse` 钩子返回这些不支持的字段之一，Codex 会将该钩子运行标记为失败，报告错误，并继续工具调用。

`PostToolUse` 支持 `systemMessage`、`continue: false` 和 `stopReason`。`suppressOutput` 已解析但目前不支持该事件。

## 钩子

### SessionStart

`matcher` 应用于此事件的 `source`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段     | 类型     | 含义                                                        |
| -------- | -------- | ----------------------------------------------------------- |
| `source` | `string` | 会话启动方式：`startup`、`resume`、`clear` 或 `compact`     |

`stdout` 上的纯文本作为额外的开发者上下文添加。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)和此钩子特定的形状：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load the workspace conventions before editing."
  }
}
```

`additionalContext` 文本作为额外的开发者上下文添加。

### SubagentStart

`matcher` 应用于此事件的 `agent_type`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段              | 类型     | 含义                                     |
| ----------------- | -------- | ---------------------------------------- |
| `turn_id`         | `string` | Codex 特定扩展。活动 Codex 轮次 ID      |
| `agent_id`        | `string` | 子代理的标识符                           |
| `agent_type`      | `string` | 子代理类型或配置文件                     |
| `permission_mode` | `string` | 当前权限模式                             |

`stdout` 上的纯文本作为子代理的额外开发者上下文添加。

`stdout` 上的 JSON 支持 `systemMessage` 和此钩子特定的形状：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Review the repository test conventions first."
  }
}
```

`additionalContext` 文本作为子代理的额外开发者上下文添加。`continue: false` 为兼容性而解析，但不会阻止子代理启动。

### PreToolUse

`PreToolUse` 可以拦截 Bash、通过 `apply_patch` 执行的文件编辑和 MCP 工具调用。它仍然是一个防护栏而非完整的强制边界，因为 Codex 通常可以通过另一个受支持的工具路径执行等效工作。

这尚不能拦截所有 shell 调用，只能拦截简单的调用。较新的 `unified_exec` 机制允许更丰富的流式 stdin/stdout shell 处理，但拦截尚不完整。同样，这不能拦截 `WebSearch` 或其他非 shell、非 MCP 工具调用。

`matcher` 应用于 `tool_name` 和匹配器别名。对于通过 `apply_patch` 的文件编辑，`matcher` 值可以使用 `apply_patch`、`Edit` 或 `Write`；钩子输入仍报告 `tool_name: "apply_patch"`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段          | 类型         | 含义                                                                                          |
| ------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `turn_id`     | `string`     | Codex 特定扩展。活动 Codex 轮次 ID                                                           |
| `tool_name`   | `string`     | 规范钩子工具名称，如 `Bash`、`apply_patch` 或 MCP 名称如 `mcp__fs__read`                     |
| `tool_use_id` | `string`     | 此调用的工具调用 ID                                                                           |
| `tool_input`  | `JSON value` | 工具特定输入。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP 工具发送所有参数。    |

`stdout` 上的纯文本被忽略。

`stdout` 上的 JSON 可以使用 `systemMessage`。要拒绝受支持的工具调用，请返回此钩子特定的形状：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by hook."
  }
}
```

Codex 也接受此旧版块形状：

```json
{
  "decision": "block",
  "reason": "Destructive command blocked by hook."
}
```

你也可以使用退出码 `2` 并将阻止原因写入 `stderr`。

要在不阻止的情况下添加模型可见的上下文，请返回 `hookSpecificOutput.additionalContext`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "The pending command touches generated files."
  }
}
```

要在不阻止的情况下重写受支持的工具调用，请返回 `permissionDecision: "allow"` 和 `updatedInput`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "command": "echo rewritten"
    }
  }
}
```

对于 Bash 命令和 `apply_patch`，`updatedInput` 必须包含字符串 `command` 字段。对于 MCP 工具，`updatedInput` 是替换参数对象。仅在 `permissionDecision: "allow"` 时返回 `updatedInput`；其他 `updatedInput` 形状被报告为错误。

`permissionDecision: "ask"`、旧版 `decision: "approve"`、`continue: false`、`stopReason` 和 `suppressOutput` 已解析但尚不支持。Codex 会将钩子运行标记为失败，报告错误，并继续工具调用。

### PermissionRequest

`PermissionRequest` 在 Codex 即将请求批准时运行，例如 shell 提权或托管网络批准。它可以允许请求、拒绝请求或拒绝决定并让正常的批准提示继续。对于不需要批准的命令，它不会运行。

`matcher` 应用于 `tool_name` 和匹配器别名。当前规范值包括 `Bash`、`apply_patch` 和 MCP 工具名称如 `mcp__server__tool`；`apply_patch` 也匹配 `Edit` 和 `Write`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段                     | 类型             | 含义                                                                                          |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------------------- |
| `turn_id`                | `string`         | Codex 特定扩展。活动 Codex 轮次 ID                                                           |
| `tool_name`              | `string`         | 规范钩子工具名称，如 `Bash`、`apply_patch` 或 MCP 名称如 `mcp__fs__read`                     |
| `tool_input`             | `JSON value`     | 工具特定输入。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP 工具发送所有参数。    |
| `tool_input.description` | `string \| null` | 人类可读的批准原因（如果 Codex 有的话）                                                       |

`stdout` 上的纯文本被忽略。

某些工具输入可能包含人类可读的描述，但不要依赖每个工具都有 `tool_input.description` 字段。

要批准请求，请返回：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow"
    }
  }
}
```

要拒绝请求，请返回：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "deny",
      "message": "Blocked by repository policy."
    }
  }
}
```

如果多个匹配的钩子返回决定，任何 `deny` 都会生效。否则，`allow` 会让请求继续而不显示批准提示。如果没有匹配的钩子做出决定，Codex 使用正常的批准流程。

不要为 `PermissionRequest` 返回 `updatedInput`、`updatedPermissions` 或 `interrupt`；这些字段保留用于未来行为，目前会失败关闭。

### PostToolUse

`PostToolUse` 在受支持的工具产生输出后运行，包括 Bash、`apply_patch` 和 MCP 工具调用。对于 Bash，它也在命令以非零状态退出后运行。它无法撤消已运行工具的副作用。

这尚不能拦截所有 shell 调用，只能拦截简单的调用。较新的 `unified_exec` 机制允许更丰富的流式 stdin/stdout shell 处理，但拦截尚不完整。同样，这不能拦截 `WebSearch` 或其他非 shell、非 MCP 工具调用。

`matcher` 应用于 `tool_name` 和匹配器别名。对于通过 `apply_patch` 的文件编辑，`matcher` 值可以使用 `apply_patch`、`Edit` 或 `Write`；钩子输入仍报告 `tool_name: "apply_patch"`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段            | 类型         | 含义                                                                                          |
| --------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `turn_id`       | `string`     | Codex 特定扩展。活动 Codex 轮次 ID                                                           |
| `tool_name`     | `string`     | 规范钩子工具名称，如 `Bash`、`apply_patch` 或 MCP 名称如 `mcp__fs__read`                     |
| `tool_use_id`   | `string`     | 此调用的工具调用 ID                                                                           |
| `tool_input`    | `JSON value` | 工具特定输入。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP 工具发送所有参数。    |
| `tool_response` | `JSON value` | 工具特定输出。对于 MCP 工具，这是 MCP 调用结果。                                              |

`stdout` 上的纯文本被忽略。

`stdout` 上的 JSON 可以使用 `systemMessage` 和此钩子特定的形状：

```json
{
  "decision": "block",
  "reason": "The Bash output needs review before continuing.",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "The command updated generated files."
  }
}
```

`additionalContext` 文本作为额外的开发者上下文添加。

对于此事件，`decision: "block"` 不会撤消已完成的 Bash 命令。相反，Codex 记录反馈，用该反馈替换工具结果，并从钩子提供的消息继续模型。

你也可以使用退出码 `2` 并将反馈原因写入 `stderr`。

要在命令已运行后停止正常处理原始工具结果，请返回 `continue: false`。Codex 将用你的反馈或停止文本替换工具结果，并从那里继续。

`updatedMCPToolOutput` 和 `suppressOutput` 已解析但尚不支持。Codex 会将钩子运行标记为失败，报告错误，并继续工具结果的正常处理。

### PreCompact

`PreCompact` 在 Codex 压缩对话之前运行。`matcher` 应用于 `trigger`，其值为 `manual` 和 `auto`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段      | 类型     | 含义                                     |
| --------- | -------- | ---------------------------------------- |
| `turn_id` | `string` | Codex 特定扩展。活动 Codex 轮次 ID      |
| `trigger` | `string` | 触发压缩的原因：`manual` 或 `auto`       |

`stdout` 上的纯文本被忽略。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)。如果匹配的 `PreCompact` 钩子返回 `continue: false`，Codex 会在压缩前停止。

### PostCompact

`PostCompact` 在 Codex 压缩对话后运行。`matcher` 应用于 `trigger`，其值为 `manual` 和 `auto`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段      | 类型     | 含义                                     |
| --------- | -------- | ---------------------------------------- |
| `turn_id` | `string` | Codex 特定扩展。活动 Codex 轮次 ID      |
| `trigger` | `string` | 触发压缩的原因：`manual` 或 `auto`       |

`stdout` 上的纯文本被忽略。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)。如果匹配的 `PostCompact` 钩子返回 `continue: false`，Codex 会在压缩后停止。

### UserPromptSubmit

`matcher` 目前不用于此事件。

除[常见输入字段](#常见输入字段)外的字段：

| 字段      | 类型     | 含义                                     |
| --------- | -------- | ---------------------------------------- |
| `turn_id` | `string` | Codex 特定扩展。活动 Codex 轮次 ID      |
| `prompt`  | `string` | 即将发送的用户提示词                     |

`stdout` 上的纯文本作为额外的开发者上下文添加。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)和此钩子特定的形状：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "Ask for a clearer reproduction before editing files."
  }
}
```

`additionalContext` 文本作为额外的开发者上下文添加。

要阻止提示词，请返回：

```json
{
  "decision": "block",
  "reason": "Ask for confirmation before doing that."
}
```

你也可以使用退出码 `2` 并将阻止原因写入 `stderr`。

### SubagentStop

`matcher` 应用于此事件的 `agent_type`。

除[常见输入字段](#常见输入字段)外的字段：

| 字段                     | 类型             | 含义                                          |
| ------------------------ | ---------------- | --------------------------------------------- |
| `turn_id`                | `string`         | Codex 特定扩展。活动 Codex 轮次 ID           |
| `agent_id`               | `string`         | 子代理的标识符                                |
| `agent_type`             | `string`         | 子代理类型或配置文件                          |
| `agent_transcript_path`  | `string \| null` | 子代理记录文件的路径（如果有）                |
| `stop_hook_active`       | `boolean`        | 此子代理是否已被继续                          |
| `last_assistant_message` | `string \| null` | 最新的子代理助手消息（如果可用）              |

`SubagentStop` 在退出 `0` 时期望 `stdout` 上有 JSON。纯文本输出对于此事件无效。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)。要请求 Codex 继续子代理流程，请返回：

```json
{
  "decision": "block",
  "reason": "Run one more focused pass inside the subagent."
}
```

你也可以使用退出码 `2` 并将继续原因写入 `stderr`。

如果任何匹配的 `SubagentStop` 钩子返回 `continue: false`，它优先于其他匹配 `SubagentStop` 钩子的继续决定。

### Stop

`matcher` 目前不用于此事件。

除[常见输入字段](#常见输入字段)外的字段：

| 字段                     | 类型             | 含义                                          |
| ------------------------ | ---------------- | --------------------------------------------- |
| `turn_id`                | `string`         | Codex 特定扩展。活动 Codex 轮次 ID           |
| `stop_hook_active`       | `boolean`        | 此轮次是否已被 `Stop` 继续                    |
| `last_assistant_message` | `string \| null` | 最新的助手消息文本（如果可用）                |

`Stop` 在退出 `0` 时期望 `stdout` 上有 JSON。纯文本输出对于此事件无效。

`stdout` 上的 JSON 支持[常见输出字段](#常见输出字段)。要让 Codex 继续运行，请返回：

```json
{
  "decision": "block",
  "reason": "Run one more pass over the failing tests."
}
```

你也可以使用退出码 `2` 并将继续原因写入 `stderr`。

对于此事件，`decision: "block"` 不会拒绝该轮次。相反，它告诉 Codex 继续，并自动创建一个新的继续提示词作为新的用户提示词，使用你的 `reason` 作为该提示词文本。

如果任何匹配的 `Stop` 钩子返回 `continue: false`，它优先于其他匹配 `Stop` 钩子的继续决定。

## 架构

链接的 `main` 分支架构可能包含当前版本中没有的钩子字段。请将此页面作为版本行为参考。

如果你需要确切的当前线路格式，请参阅 [Codex GitHub 仓库](https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated)中生成的架构。
