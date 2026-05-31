> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件发现所有可用页面。

# 钩子参考

> 本文档涵盖 Claude Code 的钩子事件、配置模式、JSON 输入/输出格式、退出码、异步钩子、HTTP 钩子、提示词钩子以及 MCP 工具钩子的相关参考信息。

  有关包含示例的快速入门指南，请参阅[使用钩子自动化工作流](/zh/hooks-guide)。

钩子是用户定义的 Shell 命令、HTTP 端点或 LLM 提示词，它们在 Claude Code 生命周期的特定节点自动执行。您可参考此文档查阅事件模式、配置选项、JSON 输入/输出格式，以及异步钩子、HTTP 钩子和 MCP 工具钩子等高级功能。如果您是首次设置钩子，请先阅读[指南](/zh/hooks-guide)。

## 钩子生命周期

钩子在 Claude Code 会话的特定节点触发。当事件触发且匹配器匹配时，Claude Code 会将事件的 JSON 上下文传递给您的钩子处理器。对于命令钩子，输入通过 stdin 传递；对于 HTTP 钩子，输入作为 POST 请求体传递。随后处理器可检查输入、执行操作，并可选择返回决策。事件分为三种频率：每次会话触发一次（`SessionStart`、`SessionEnd`）、每轮对话触发一次（`UserPromptSubmit`、`Stop`、`StopFailure`），以及代理循环中每次工具调用时触发（`PreToolUse`、`PostToolUse`）：

<div>

    <img src="https://mintcdn.com/claude-code/uLsR38F1U_5zPppm/images/hooks-lifecycle.svg?fit=max&auto=format&n=uLsR38F1U_5zPppm&q=85&s=fbdbd78ad9f474da7d344879341341f0" alt="钩子生命周期图：显示可选的启动步骤馈入SessionStart，然后是包含每轮循环的循环过程。该循环包含UserPromptSubmit、用于斜杠命令的UserPromptExpansion、嵌套的代理循环（PreToolUse、PermissionRequest、PostToolUse、PostToolUseFailure、PostToolBatch、SubagentStart/Stop、TaskCreated、TaskCompleted），以及Stop或StopFailure。随后是TeammateIdle、PreCompact、PostCompact和SessionEnd。Elicitation和ElicitationResult嵌套在MCP工具执行中，PermissionDenied作为PermissionRequest的侧分支用于自动模式的拒绝。WorktreeCreate、WorktreeRemove、Notification、ConfigChange、InstructionsLoaded、CwdChanged和FileChanged是独立的异步事件，而MessageDisplay是一个仅用于显示的事件，在助手消息文本流式传输期间运行" width="520" height="1228" data-path="images/hooks-lifecycle.svg" />

</div>

下表总结了每个事件的触发时机。[钩子事件](#钩子事件)部分详细记录了每个事件的完整输入架构和决策控制选项。

| 事件                  | 触发时机                                                                                                                                               |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | 当会话开始或恢复时                                                                                                                                     |
| `Setup`               | 当使用 `--init-only` 参数，或在 `-p` 模式下使用 `--init` 或 `--maintenance` 参数启动 Claude Code 时。用于 CI 或脚本中的一次性准备工作                           |
| `UserPromptSubmit`    | 当您提交提示词时，在 Claude 处理它之前                                                                                                                 |
| `UserPromptExpansion` | 当用户输入的命令扩展为提示词时，在它到达 Claude 之前。可以阻止该扩展                                                                                     |
| `PreToolUse`          | 在工具调用执行之前。可以阻止该调用                                                                                                                      |
| `PermissionRequest`   | 当权限对话框出现时                                                                                                                                     |
| `PermissionDenied`    | 当工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 可告知模型它可以重试被拒绝的工具调用                                                                |
| `PostToolUse`         | 在工具调用成功之后                                                                                                                                     |
| `PostToolUseFailure`  | 在工具调用失败之后                                                                                                                                     |
| `PostToolBatch`       | 在一整批并行工具调用解析完成后，在下一次模型调用之前                                                                                                     |
| `Notification`        | 当 Claude Code 发送通知时                                                                                                                              |
| `MessageDisplay`      | 在助手消息文本显示期间                                                                                                                                 |
| `SubagentStart`       | 当生成一个子代理时                                                                                                                                     |
| `SubagentStop`        | 当一个子代理完成时                                                                                                                                     |
| `TaskCreated`         | 当通过 `TaskCreate` 创建任务时                                                                                                                         |
| `TaskCompleted`       | 当任务被标记为已完成时                                                                                                                                 |
| `Stop`                | 当 Claude 完成响应时                                                                                                                                   |
| `StopFailure`         | 当轮次因 API 错误而结束时。输出和退出码将被忽略                                                                                                         |
| `TeammateIdle`        | 当一个[代理团队](/zh/agent-teams)队友即将闲置时                                                                                                         |
| `InstructionsLoaded`  | 当 CLAUDE.md 或 `.claude/rules/*.md` 文件被加载到上下文中时。在会话开始时以及在会话期间文件被延迟加载时触发                                                 |
| `ConfigChange`        | 当会话期间配置文件发生变化时                                                                                                                           |
| `CwdChanged`          | 当工作目录发生变化时，例如当 Claude 执行 `cd` 命令时。对于使用 direnv 等工具进行响应式环境管理很有用                                                        |
| `FileChanged`         | 当被监视的文件在磁盘上发生变化时。`matcher` 字段指定要监视哪些文件名                                                                                    |
| `WorktreeCreate`      | 当通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替换默认的 git 行为                                                                        |
| `WorktreeRemove`      | 当工作树被移除时，无论是在会话退出时还是在子代理完成时                                                                                                   |
| `PreCompact`          | 在上下文压缩之前                                                                                                                                       |
| `PostCompact`         | 在上下文压缩完成后                                                                                                                                     |
| `Elicitation`         | 当 MCP 服务器在工具调用期间请求用户输入时                                                                                                               |
| `ElicitationResult`   | 在用户响应 MCP 的请求之后，在响应被发送回服务器之前                                                                                                     |
| `SessionEnd`          | 当会话终止时                                                                                                                                           |

### 钩子如何解析

要了解这些部分如何协同工作，请考虑以下这个阻止破坏性 shell 命令的 `PreToolUse` 钩子。`matcher` 将范围缩小到 Bash 工具调用，而 `if` 条件进一步缩小到匹配 `rm *` 的 Bash 子命令，因此 `block-rm.sh` 仅在两个过滤器都匹配时才会生成：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```
该脚本从 stdin 读取 JSON 输入，提取命令，若其中包含 `rm -rf`，则返回一个值为 `"deny"` 的 `permissionDecision`：
```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # no decision; normal permission flow applies
fi
```
现在假设 Claude Code 决定运行 `Bash "rm -rf /tmp/build"`。以下是会发生的情况：

  <img src="https://mintcdn.com/claude-code/-tYw1BD_DEqfyyOZ/images/hook-resolution.svg?fit=max&auto=format&n=-tYw1BD_DEqfyyOZ&q=85&s=c73ebc1eeda2037570427d7af1e0a891" alt="钩子解析流程：触发PreToolUse事件，匹配器检查Bash匹配，条件检查Bash(rm *)匹配，钩子处理器运行，结果返回Claude Code" width="930" height="290" data-path="images/hook-resolution.svg" />




    `PreToolUse` 事件触发。Claude Code 通过 stdin 以 JSON 格式将工具输入发送给钩子：
    ```json
    { "tool_name": "Bash", "tool_input": { "command": "rm -rf /tmp/build" }, ... }
    ```



    匹配器 `"Bash"` 匹配工具名称，因此该钩子组会被激活。如果省略匹配器或使用 `"*"`，该组将在每次事件发生时激活。



    `if` 条件 `"Bash(rm *)"` 会匹配成功，因为 `rm -rf /tmp/build` 是匹配 `rm *` 的子命令，因此该处理程序会被生成。如果命令是 `npm test`，`if` 检查将会失败，`block-rm.sh` 将永远不会运行，从而避免了进程生成的开销。`if` 字段是可选的；如果没有它，匹配组中的每个处理程序都会运行。



    脚本检查了完整命令并发现 `rm -rf`，于是向标准输出打印了一个决策：
    ```json
    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Destructive command blocked by hook"
      }
    }
    ```
    如果命令是更安全的 `rm` 变体（例如 `rm file.txt`），脚本将执行到 `exit 0`。退出代码为 0 且无输出表示钩子无需报告决策，因此工具调用将继续进行正常的[权限流程](/zh/permissions)。钩子可以拒绝调用，但保持静默并不代表批准。



    Claude Code 读取 JSON 决策，阻止工具调用，并向 Claude 显示原因。


下面的[配置](#配置)部分记录了完整的架构，每个[钩子事件](#钩子事件)部分则记录了你的命令会接收什么输入，以及可以返回什么输出。

## 配置

钩子在 JSON 设置文件中定义。配置包含三层嵌套：

1.  选择一个要响应的[钩子事件](#钩子事件)，如 `PreToolUse` 或 `Stop`
2.  添加一个[匹配器组](#匹配器模式)来过滤其触发条件，例如“仅针对 Bash 工具”
3.  定义一个或多个[钩子处理器](#钩子事件)，以便在匹配成功时运行

要了解完整的、带注解的示例，请参阅上方的[钩子如何解析](#钩子事件)部分。

  本页面对每个层级使用特定术语：**钩子事件**指生命周期点，**匹配器组**指过滤器，**钩子处理器**指运行的 Shell 命令、HTTP 端点、MCP 工具、提示词或智能体。单独的“钩子”则指该功能本身。

### 钩子位置

你定义钩子的位置决定了其作用域：

| 位置                                                       | 作用域                        | 可共享性                           |
| :--------------------------------------------------------- | :---------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目                  | 否，本地于你的机器                 |
| `.claude/settings.json`                                    | 单个项目                      | 是，可提交至仓库                   |
| `.claude/settings.local.json`                              | 单个项目                      | 否，被忽略（gitignore）            |
| 托管策略设置                                               | 组织范围                      | 是，由管理员控制                   |
| [插件](/zh/plugins) `hooks/hooks.json`                     | 当插件启用时                  | 是，随插件一同打包                 |
| [技能](/zh/skills) 或 [代理](/zh/sub-agents) 前言部分 | 当组件激活时 | 是，定义在组件文件中 |

关于设置文件解析的详细信息，请参见 [设置](/zh/settings)。企业管理员可以使用 `allowManagedHooksOnly` 来阻止用户、项目和插件钩子。在托管设置 `enabledPlugins` 中强制启用的插件钩子可以豁免，因此管理员可以通过组织市场分发经过审查的钩子。参见 [钩子配置](/zh/settings#hook-configuration)。

### 匹配器模式

`matcher` 字段用于过滤钩子何时触发。匹配器的评估方式取决于其包含的字符：

| 匹配器值                              | 评估为                                            | 示例                                                                                                     |
| :------------------------------------ | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `"*"`、`""` 或省略                    | 匹配所有                                              | 在事件每次发生时触发                                                                                             |
| 仅包含字母、数字、`_` 和 `\|`         | 精确字符串，或由 `\|` 分隔的精确字符串列表            | `Bash` 仅匹配 Bash 工具；`Edit\|Write` 精确匹配任一工具                                                         |
| 包含任何其他字符                      | JavaScript 正则表达式                                 | `^Notebook` 匹配任何以 Notebook 开头的工具；`mcp__memory__.*` 匹配 `memory` 服务器中的每个工具                  |

在构建其监视列表时，`FileChanged` 事件不遵循这些规则。参见 [FileChanged]。

每种事件类型根据不同的字段进行匹配：

| 事件                                                                                                                                             | 匹配器过滤的内容                                      | 示例匹配器值                                                                                                                                                |
| :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`                                                        | 工具名称                                                    | `Bash`、`Edit\|Write`、`mcp__.*`                                                                                                                                      |
| `SessionStart`                                                                                                                                    | 会话启动的方式                                      | `startup`、`resume`、`clear`、`compact`                                                                                                                               |
| `Setup`                                                                                                                                           | 哪个 CLI 标志触发了设置                               | `init`、`maintenance`                                                                                                                                                 |
| `SessionEnd`                                                                                                                                      | 会话结束的原因                                        | `clear`、`resume`、`logout`、`prompt_input_exit`、`bypass_permissions_disabled`、`other`                                                                              |
| `Notification`                                                                                                                                    | 通知类型                                            | `permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`、`elicitation_complete`、`elicitation_response`                                              |
| `SubagentStart`                                                                                                                                   | 代理类型                                                   | `general-purpose`、`Explore`、`Plan` 或自定义代理名称                                                                                                           |
| `PreCompact`、`PostCompact`                                                                                                                       | 触发压缩的原因                                    | `manual`、`auto`                                                                                                                                                      |
| `SubagentStop`                                                                                                                                    | 代理类型                                                   | 与 `SubagentStart` 相同的值                                                                                                                                        |
| `ConfigChange`                                                                                                                                    | 配置来源                                         | `user_settings`、`project_settings`、`local_settings`、`policy_settings`、`skills`                                                                                    |
| `CwdChanged`                                                                                                                                      | 不支持匹配器                                           | 在每次目录更改时始终触发                                                                                                                                |
| `FileChanged`                                                                                                                                     | 要监视的字面文件名 (参见 [FileChanged]) | `.envrc\|.env`                                                                                                                                                        |
| `StopFailure`                                                                                                                                     | 错误类型                                                   | `rate_limit`、`authentication_failed`、`oauth_org_not_allowed`、`billing_error`、`invalid_request`、`model_not_found`、`server_error`、`max_output_tokens`、`unknown` |
| `InstructionsLoaded`                                                                                                                              | 加载原因                                                  | `session_start`、`nested_traversal`、`path_glob_match`、`include`、`compact`                                                                                          |
| `UserPromptExpansion`                                                                                                                             | 命令名称                                                 | 你的技能或命令名称                                                                                                                                           |
| `Elicitation`                                                                                                                                     | MCP 服务器名称                                              | 你配置的 MCP 服务器名称                                                                                                                                      |
| `ElicitationResult`                                                                                                                               | MCP 服务器名称                                              | 与 `Elicitation` 相同的值                                                                                                                                          |
| `UserPromptSubmit`、`PostToolBatch`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove`、`MessageDisplay` | 不支持匹配器                                           | 在每次发生时始终触发                                                                                                                                      |

匹配器会针对 Claude Code 通过 stdin 发送到你的钩子的 [JSON 输入](#钩子事件) 中的某个字段进行评估。对于工具事件，该字段是 `tool_name`。每个 [钩子事件](#钩子事件) 部分列出了该事件的完整匹配器值集合和输入 schema。

此示例仅在 Claude 写入或编辑文件时运行一个代码检查脚本：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```
`UserPromptSubmit`、`PostToolBatch`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove` 和 `CwdChanged` 不支持匹配器，每次发生时都会触发。如果您为这些事件添加 `matcher` 字段，它将被静默忽略。

对于工具事件，您可以通过在各个钩子处理器上设置 [`if` 字段](#通用字段) 来进行更精细的过滤。`if` 使用 [权限规则语法](/zh/permissions) 来同时匹配工具名称和参数，因此 `"Bash(git *)"` 会在 Bash 输入的任何子命令匹配 `git *` 时运行，而 `"Edit(*.ts)"` 仅对 TypeScript 文件运行。

#### 匹配 MCP 工具

[MCP](/zh/mcp) 服务器工具在工具事件（`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`）中显示为常规工具，因此您可以像匹配任何其他工具名称一样匹配它们。

MCP 工具遵循命名模式 `mcp__<server>__<tool>`，例如：

* `mcp__memory__create_entities`：Memory 服务器的创建实体工具
* `mcp__filesystem__read_file`：Filesystem 服务器的读取文件工具
* `mcp__github__search_repositories`：GitHub 服务器的搜索工具

要匹配某个服务器的所有工具，请在服务器前缀后附加 `.*`。`.*` 是必需的：像 `mcp__memory` 这样的匹配器仅包含字母和下划线，因此它会被作为精确字符串进行比较，不匹配任何工具。

* `mcp__memory__.*` 匹配来自 `memory` 服务器的所有工具
* `mcp__.*__write.*` 匹配任何服务器中名称以 `write` 开头的任何工具

此示例记录所有 memory 服务器操作，并验证来自任何 MCP 服务器的写入操作：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"
          }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```
### 钩子处理器字段

内层 `hooks` 数组中的每个对象都是一个钩子处理器：当匹配器匹配时运行的 Shell 命令、HTTP 端点、MCP 工具、LLM 提示词或代理。共有五种类型：

* **[命令钩子](#钩子事件)** (`type: "command"`)：运行一个 Shell 命令。你的脚本通过标准输入接收事件的 [JSON 输入](#钩子事件)，并通过退出代码和标准输出回传结果。
* **[HTTP 钩子](#http-钩子字段)** (`type: "http"`)：将事件的 JSON 输入作为 HTTP POST 请求发送到一个 URL。端点通过响应体回传结果，使用与命令钩子相同的 [JSON 输出格式](#json-输出)。
* **[MCP 工具钩子](#匹配-mcp-工具)** (`type: "mcp_tool"`)：调用一个已连接 [MCP 服务器](/zh/mcp) 上的工具。该工具的文本输出将被视为命令钩子的标准输出。
* **[提示词钩子](#agent)** (`type: "prompt"`)：将提示词发送给 Claude 模型进行单轮评估。模型返回一个 JSON 格式的是/否决定。参见 [基于提示词的钩子](#hooks-菜单)。
* **[代理钩子](#agent)** (`type: "agent"`)：生成一个子代理，该子代理可以使用类似 Read、Grep 和 Glob 的工具来验证条件，然后返回决定。代理钩子是实验性的，可能会发生变化。参见 [基于代理的钩子](#hooks-菜单)。

#### 通用字段

这些字段适用于所有钩子类型：

| 字段            | 必需 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :-------------- | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | 是   | `"command"`, `"http"`, `"mcp_tool"`, `"prompt"`, 或 `"agent"`                                                                                                                                                                                                                                                                                                                                                                                   |
| `if`            | 否   | 用于过滤钩子何时运行的权限规则语法，例如 `"Bash(git *)"` 或 `"Edit(*.ts)"`。仅当工具调用匹配该模式，或当 Bash 命令过于复杂难以解析时，钩子才会触发。仅在工具事件上评估：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest` 和 `PermissionDenied`。在其他事件上，设置了 `if` 的钩子永不运行。使用与[权限规则](/zh/permissions)相同的语法 |
| `timeout`       | 否   | 取消前的秒数。默认值：`command`、`http` 和 `mcp_tool` 为 600；`prompt` 为 30；`agent` 为 60。[`UserPromptSubmit`](#userpromptsubmit) 会将 `command`、`http` 和 `mcp_tool` 的默认值降低到 30                                                                                                                                                                                                                                         |
| `statusMessage` | 否   | 钩子运行时显示的自定义加载提示消息                                                                                                                                                                                                                                                                                                                                                                                                               |
| `once`          | 否   | 如果为 `true`，则每个会话只运行一次，然后被移除。仅对在[技能前置信息](#hooks-菜单)中声明的钩子生效；在设置文件和代理前置信息中会被忽略                                                                                                                                                                                                                                                                                               |

`if` 字段恰好包含一个权限规则。没有用于组合规则的 `&&`、`||` 或列表语法；要应用多个条件，请为每个条件定义一个单独的钩子处理器。对于 Bash，规则在去掉开头的 `VAR=value` 赋值后，会与工具输入的每个子命令进行匹配，因此 `if: "Bash(git push *)"` 既匹配 `FOO=bar git push`，也匹配 `npm test && git push`。如果任何子命令匹配，钩子就会运行，并且当命令过于复杂无法解析时，钩子总会运行。

#### 命令钩子字段

除了[通用字段](#通用字段)外，命令钩子还接受以下字段：

| 字段          | 必需 | 描述                                                                                                                                                                                                                                                        |
| :------------ | :--- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`     | 是   | 要执行的 Shell 命令。如果设置了 `args`，则作为要直接生成的可执行文件。参见 [Exec 形式和 Shell 形式](#exec-形式和-shell-形式)                                                                                                                                |
| `args`        | 否   | 参数列表。存在时，`command` 被解析为可执行文件，并使用 `args` 作为参数向量直接生成，不涉及 Shell。参见 [Exec 形式和 Shell 形式](#exec-形式和-shell-形式)                                                                                                    |
| `async`       | 否   | 如果为 `true`，则在后台运行而不阻塞。参见[在后台运行钩子](#钩子事件)                                                                                                                                                                      |
| `asyncRewake` | 否   | 如果为 `true`，则在后台运行，并在退出代码为 2 时唤醒 Claude。隐含 `async`。钩子的 stderr，如果 stderr 为空则为 stdout，会作为系统提醒显示给 Claude，以便其能对长时间运行的后台故障做出反应                                                                    |
| `shell`       | 否   | 用于此钩子的 Shell。接受 `"bash"`（默认）或 `"powershell"`。设置 `"powershell"` 将在 Windows 上通过 PowerShell 运行命令。由于钩子直接生成 PowerShell，不需要设置 `CLAUDE_CODE_USE_POWERSHELL_TOOL`。当设置 `args` 时此字段被忽略                                  |

<a id="exec-form-and-shell-form" />

##### Exec 形式和 Shell 形式

当设置了 `args` 时，命令钩子以 Exec 形式运行；当省略 `args` 时，则以 Shell 形式运行。每当钩子引用[路径占位符](#通过路径引用脚本)时，应设置 `args`，因为每个元素都作为一个参数传递，不带引号。当需要 Shell 功能（如管道或 `&&`）或两者都不相关时，省略 `args`。

**Exec 形式** 在存在 `args` 时运行。Claude Code 将 `command` 解析为 `PATH` 上的可执行文件，并使用 `args` 作为参数向量直接生成它。没有 Shell，因此 `args` 的每个元素都是一个参数，完全按原样书写，而类似 `${CLAUDE_PLUGIN_ROOT}` 的路径占位符会作为纯字符串替换到 `command` 和每个 `args` 元素中。特殊字符（如单引号、`$` 和反引号）会原样传递，因为没有 Shell 来解释它们。在任何平台上都不会发生 Shell 词法分析。

**Shell 形式** 在省略 `args` 时运行。`command` 字符串被传递给 Shell：在 macOS 和 Linux 上是 `sh -c`，在 Windows 上是 Git Bash，如果未安装 Git Bash 则是 PowerShell。设置 `shell` 字段可以明确选择。Shell 会对字符串进行词法分析、展开变量，并解释管道、`&&`、重定向和通配符。

  在 Windows 系统上，执行形式要求 `command` 必须解析为一个真实的可执行文件，例如 `.exe` 文件。而 npm、npx、eslint 等工具在 `node_modules/.bin` 目录下安装的 `.cmd` 和 `.bat` 垫片文件并非可执行文件，若没有 shell 的支持则无法直接生成进程。要在执行形式下运行它们，需直接使用 `node` 调用底层脚本，例如 `"command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/node_modules/eslint/bin/eslint.js"]`。`node` 加脚本路径的组合模式适用于所有平台，因为 `node.exe` 是真实的二进制文件。若想通过名称运行 `.cmd` 或 `.bat` 垫片文件，请使用 shell 形式。

此示例运行一个与插件捆绑的Node脚本。exec形式会将解析后的脚本路径作为单个参数传递，且不加引号：
```json
{
  "type": "command",
  "command": "node",
  "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/format.js", "--fix"]
}
```
等效的 shell 命令形式需要使用引号来处理包含空格或特殊字符的路径：
```json
{
  "type": "command",
  "command": "node \"${CLAUDE_PLUGIN_ROOT}\"/scripts/format.js --fix"
}
```
两种形式都支持相同的[路径占位符](#通过路径引用脚本)，并且都会在生成的进程中将其导出为环境变量 `CLAUDE_PROJECT_DIR`、`CLAUDE_PLUGIN_ROOT` 和 `CLAUDE_PLUGIN_DATA`，因此无论脚本是如何启动的，都可以通过 `process.env.CLAUDE_PLUGIN_ROOT` 来读取这些值。插件钩子还会额外替换 `${user_config.*}` 的值；详情请参阅[用户配置](/zh/plugins-reference#user-configuration)。

  在 exec 形式中，`command` 仅为可执行文件的名称或路径。如果 `command` 是不带路径分隔符的裸名，并且与 `args` 一起包含空格，Claude Code 会记录一条警告，因为生成过程将失败：不存在名为 `node script.js` 的可执行文件。请将多余的 token 移入 `args`。带空格的绝对路径（如 `C:\Program Files\nodejs\node.exe`）是单个有效的可执行文件，不会触发此警告。

#### HTTP 钩子字段

除了[通用字段](#通用字段)，HTTP 钩子还接受以下字段：

| 字段             | 必需 | 描述                                                                                                                                                             |
| :--------------- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | 是   | 发送 POST 请求的 URL                                                                                                                                             |
| `headers`        | 否   | 附加的 HTTP 头信息，以键值对形式提供。值支持使用 `$VAR_NAME` 或 `${VAR_NAME}` 语法进行环境变量插值。仅 `allowedEnvVars` 中列出的变量会被解析                               |
| `allowedEnvVars` | 否   | 允许插值到头信息值中的环境变量名称列表。对未列出变量的引用将被替换为空字符串。任何环境变量插值生效均需要此字段 |

Claude Code 会将钩子的 [JSON 输入](#钩子事件) 作为 `Content-Type: application/json` 的 POST 请求体发送。响应体使用与命令钩子相同的 [JSON 输出格式](#json-输出)。

错误处理与命令钩子不同：非2xx响应、连接失败和超时都会产生非阻塞错误，允许执行继续进行。要阻止工具调用或拒绝权限，请返回一个2xx响应，其JSON体包含 `decision: "block"` 或一个包含 `permissionDecision: "deny"` 的 `hookSpecificOutput`。

此示例将 `PreToolUse` 事件发送到一个本地验证服务，并使用来自 `MY_TOKEN` 环境变量的令牌进行身份验证：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/pre-tool-use",
            "timeout": 30,
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
#### MCP 工具钩子字段

除了[公共字段](#通用字段)外，MCP 工具钩子还接受以下字段：

| 字段     | 必需 | 描述                                                                                                                                                          |
| :------- | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | 是   | 已配置的 MCP 服务器的名称。该服务器必须已连接；钩子永远不会触发 OAuth 或连接流程                                                                                 |
| `tool`   | 是   | 要在该服务器上调用的工具的名称                                                                                                                                |
| `input`  | 否   | 传递给工具的参数。字符串值支持通过钩子的 [JSON 输入](#钩子事件) 进行 `${path}` 替换，例如 `"${tool_input.file_path}"`                               |

工具的文本内容将被视为命令钩子的标准输出：如果其能解析为有效的 [JSON 输出](#json-输出)，则将其作为决策处理；否则，将其显示为纯文本。如果指定的服务器未连接，或工具返回 `isError: true`，则钩子会产生一个非阻塞错误，并继续执行。

一旦 Claude Code 连接到您的 MCP 服务器，MCP 工具钩子在所有钩子事件上均可用。`SessionStart` 和 `Setup` 通常在服务器完成连接之前触发，因此这些事件上的钩子在首次运行时应预期出现“未连接”错误。

此示例在每次 `Write` 或 `Edit` 之后，调用 `my_server` MCP 服务器上的 `security_scan` 工具，并传递被编辑文件的路径：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "mcp_tool",
            "server": "my_server",
            "tool": "security_scan",
            "input": { "file_path": "${tool_input.file_path}" }
          }
        ]
      }
    ]
  }
}
```
#### 提示词和代理钩子字段

除了[公共字段]外，提示词和代理钩子还接受以下字段：

| 字段     | 必填 | 描述                                                                                           |
| :------- | :--- | :--------------------------------------------------------------------------------------------- |
| `prompt` | 是   | 发送给模型的提示词文本。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符                           |
| `model`  | 否   | 用于评估的模型。默认为一个快速模型                                                             |

所有匹配的钩子并行运行，相同的处理器会自动去重。命令钩子通过命令字符串和 `args` 去重，HTTP 钩子通过 URL 去重。处理器在当前目录下使用 Claude Code 的环境运行。在远程 web 环境中，`$CLAUDE_CODE_REMOTE` 环境变量被设置为 `"true"`，而在本地 CLI 中则不设置。

### 通过路径引用脚本

使用这些占位符来引用相对于项目或插件根目录的钩子脚本，无论钩子运行时的当前工作目录是什么：

* `${CLAUDE_PROJECT_DIR}`：项目根目录。Claude Code 也会在 [stdio MCP 服务器](/zh/mcp#option-3-add-a-local-stdio-server) 和插件 LSP 服务器的环境中设置此变量。
* `${CLAUDE_PLUGIN_ROOT}`：插件的安装目录，用于与[插件](/zh/plugins)捆绑的脚本。每次插件更新时都会改变。
* `${CLAUDE_PLUGIN_DATA}`：插件的[持久数据目录](/zh/plugins-reference#persistent-data-directory)，用于存放依赖项和在插件更新后应保留的状态。

对于任何引用路径占位符的钩子，优先使用 [exec 形式](#exec-形式和-shell-形式)。Exec 形式将每个 `args` 元素作为单独的参数传递，不进行 shell 分词，因此包含空格或特殊字符的路径无需加引号。在 shell 形式中，需用双引号将每个占位符包裹起来。


    此示例使用 `${CLAUDE_PROJECT_DIR}` 在任意 `Write` 或 `Edit` 工具调用后，从项目的 `.claude/hooks/` 目录运行样式检查器：
    ```json
    {
      "hooks": {
        "PostToolUse": [
          {
            "matcher": "Write|Edit",
            "hooks": [
              {
                "type": "command",
                "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-style.sh",
                "args": []
              }
            ]
          }
        ]
      }
    }
    ```



    在 `hooks/hooks.json` 中定义插件钩子，可选配置顶层的 `description` 字段。当插件启用时，其钩子将与您的用户钩子和项目钩子合并。

    此示例运行插件附带的格式化脚本：
    ```json
    {
      "description": "Automatic code formatting",
      "hooks": {
        "PostToolUse": [
          {
            "matcher": "Write|Edit",
            "hooks": [
              {
                "type": "command",
                "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
                "args": [],
                "timeout": 30
              }
            ]
          }
        ]
      }
    }
    ```
    有关创建插件钩子的详细信息，请参阅[插件组件参考](/zh/plugins-reference#hooks)。


### 技能和代理中的钩子

除了设置文件和插件外，还可以使用 frontmatter 在[技能](/zh/skills)和[子代理](/zh/sub-agents)中直接定义钩子。这些钩子的作用域限定在组件的生命周期内，仅在该组件处于活动状态时运行。

所有钩子事件均受支持。对于子代理，`Stop` 钩子会自动转换为 `SubagentStop`，因为这是子代理完成时触发的事件。

钩子使用与基于设置的钩子相同的配置格式，但作用域限定在组件的生命周期内，并在完成时清理。

此技能定义了一个 `PreToolUse` 钩子，在每次 `Bash` 命令执行前运行安全验证脚本：
```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```
代理在其 YAML 前置数据中使用相同的格式。

### `/hooks` 菜单

在 Claude Code 中输入 `/hooks` 可以打开一个只读浏览器，查看您已配置的钩子。该菜单显示每个钩子事件及其已配置钩子的数量，允许您深入查看匹配器，并展示每个钩子处理程序的完整详细信息。可用它来验证配置、检查某个钩子来自哪个设置文件，或检查钩子的命令、提示词或 URL。

菜单显示所有五种钩子类型：`command`、`prompt`、`agent`、`http` 和 `mcp_tool`。每个钩子都带有 `[type]` 前缀和一个表示其定义来源的标签：

* `User`：来自 `~/.claude/settings.json`
* `Project`：来自 `.claude/settings.json`
* `Local`：来自 `.claude/settings.local.json`
* `Plugin`：来自插件的 `hooks/hooks.json`
* `Session`：在内存中为当前会话注册
* `Built-in`：由 Claude Code 内部注册

选择一个钩子会打开一个详细视图，显示其事件、匹配器、类型、源文件以及完整的命令、提示词或 URL。该菜单是只读的：要添加、修改或移除钩子，请直接编辑设置 JSON 文件，或让 Claude 进行更改。

### 禁用或移除钩子

要移除钩子，请从设置 JSON 文件中删除其条目。

要暂时禁用所有钩子而不移除它们，请在您的设置文件中设置 `"disableAllHooks": true`。无法在保留配置的情况下禁用单个钩子。

`disableAllHooks` 设置遵循托管设置的层级结构。如果管理员已通过托管策略设置配置了钩子，那么在用户、项目或本地设置中设置的 `disableAllHooks` 无法禁用这些托管钩子。只有设置在托管设置层级的 `disableAllHooks` 才能禁用托管钩子。

对设置文件中钩子的直接编辑通常会被文件监视器自动检测到。

## 钩子输入和输出

命令钩子通过 stdin 接收 JSON 数据，并通过退出码、stdout 和 stderr 传递结果。HTTP 钩子接收相同的 JSON 作为 POST 请求体，并通过 HTTP 响应体传递结果。本节介绍所有事件通用的字段和行为。[钩子事件](#钩子事件)下每个事件的小节包含了其特定的输入 schema 和决策控制选项。

在 macOS 和 Linux 上，命令钩子自 v2.1.139 起在它们自己的会话中运行，没有控制终端。钩子进程及其任何子进程无法打开 `/dev/tty` 或直接向 Claude Code 界面发送转义序列。Windows 没有 `/dev/tty`。要在任何平台上向用户显示消息，请在 JSON 输出中返回 [`systemMessage`](#json-输出)。要触发桌面通知、设置窗口标题或响铃，请改为返回 [`terminalSequence`](#发送终端通知)。

### 通用输入字段

钩子事件除了在每个[钩子事件](#钩子事件)小节中记录的特定事件字段外，还通过 JSON 接收这些字段。对于命令钩子，该 JSON 通过 stdin 传递。对于 HTTP 钩子，它作为 POST 请求体传递。

| 字段              | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session_id`      | 当前会话标识符                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `transcript_path` | 对话 JSON 文件的路径                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `cwd`             | 钩子被调用时的当前工作目录                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `permission_mode` | 当前[权限模式](/zh/permissions#permission-modes)：`"default"`、`"plan"`、`"acceptEdits"`、`"auto"`、`"dontAsk"` 或 `"bypassPermissions"`。并非所有事件都接收此字段：请查看下面每个事件的 JSON 示例以确认                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `effort`          | 一个对象，包含一个 `level` 字段，持有本轮次的活动[努力级别](/zh/model-config#adjust-effort-level)：`"low"`、`"medium"`、`"high"`、`"xhigh"` 或 `"max"`。如果请求的模型努力级别超过当前模型支持的范围，此处是模型实际使用的降级级别。Ultracode 不是一个独立的级别，会报告为 `"xhigh"`。该对象与[状态行](/zh/statusline#available-data) `effort` 字段匹配。当事件在工具使用上下文中触发时出现，例如 `PreToolUse`、`PostToolUse`、`Stop` 和 `SubagentStop`，前提是当前模型支持 effort 参数。该级别也可供钩子命令和 Bash 工具作为 `$CLAUDE_EFFORT` 环境变量使用。 |
| `hook_event_name` | 触发的事件名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

当使用 `--agent` 或在子代理内运行时，会包含两个额外字段：

| 字段         | 描述                                                                                                                                                                                                                                                                                                                                                      |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent_id`   | 子代理的唯一标识符。仅当钩子在子代理调用内触发时出现。用于区分子代理钩子调用与主线程调用。                                                                                                                                                                                                                                                                |
| `agent_type` | 代理名称（例如 `"Explore"` 或 `"security-reviewer"`）。当会话使用 `--agent` 或钩子在子代理内触发时出现。对于子代理，子代理的类型优先于会话的 `--agent` 值。对于[自定义子代理](/zh/sub-agents)，这是来自代理前置数据的 `name` 字段，而不是文件名。 |

只有 [`SessionStart`](#sessionstart) 钩子接收 `model` 字段。没有 `$CLAUDE_MODEL` 环境变量。钩子进程继承父环境，因此如果您在 shell 中设置了它，可以读取 `$ANTHROPIC_MODEL`，但该值在您使用 `/model` 在会话中切换模型时不会改变。

例如，一个用于 Bash 命令的 `PreToolUse` 钩子在 stdin 上接收如下内容：
```json
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```
`tool_name` 和 `tool_input` 字段是事件特定的。每个[钩子事件](#钩子事件)章节都记录了该事件的附加字段。

### 退出码输出

您的钩子命令的退出码会告诉 Claude Code 操作应继续执行、被阻止还是被忽略。

**退出码 0** 表示成功。Claude Code 会解析标准输出中的 [JSON 输出字段](#json-输出)。JSON 输出仅在退出码为 0 时才会被处理。对于大多数事件，标准输出会写入调试日志，但不会显示在会话记录中。例外情况是 `UserPromptSubmit`、`UserPromptExpansion` 和 `SessionStart`，在这些事件中，标准输出会作为上下文添加，供 Claude 查看并据此行动。

**退出码 2** 表示阻塞错误。Claude Code 会忽略标准输出及其包含的任何 JSON。相反，标准错误的文本会作为错误消息反馈给 Claude。其效果取决于事件类型：`PreToolUse` 会阻止工具调用，`UserPromptSubmit` 会拒绝提示词，依此类推。有关完整列表，请参见[退出码 2 在每个事件中的行为](#每个事件的退出码-2-行为)。

**任何其他退出码**对于大多数钩子事件来说都是非阻塞错误。会话记录会显示一条 `<钩子名称> hook error` 通知，后跟标准错误的第一行，因此您无需 `--debug` 就能识别原因。执行会继续，完整的标准错误信息会写入调试日志。

例如，一个阻止危险 Bash 命令的钩子命令脚本：
```bash
#!/bin/bash
# Reads JSON input from stdin, checks the command
command=$(jq -r '.tool_input.command' < /dev/stdin)

if [[ "$command" == rm* ]]; then
  echo "Blocked: rm commands are not allowed" >&2
  exit 2  # Blocking error: tool call is prevented
fi

exit 0  # No decision: the normal permission flow applies
```


  对于大多数钩子事件，只有退出码 2 会阻断操作。Claude Code 将退出码 1 视为非阻断错误并继续执行操作，尽管 1 是标准的 Unix 失败代码。如果你的钩子旨在强制执行某项策略，请使用 `exit 2`。例外情况是 `WorktreeCreate`，任何非零退出码都会中止工作树的创建。

#### 每个事件的退出码 2 行为

退出码 2 是钩子表示"停止，不要执行此操作"的方式。其效果取决于事件，因为有些事件代表可以阻止的操作（如尚未发生的工具调用），而另一些则代表已经发生或无法阻止的事情。

| 钩子事件              | 可以阻止？ | 退出码 2 时发生的情况                                                                                                                 |
| :-------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`          | 是         | 阻止工具调用                                                                                                                         |
| `PermissionRequest`   | 是         | 拒绝权限                                                                                                                             |
| `UserPromptSubmit`    | 是         | 阻止提示词处理并清除提示词                                                                                                            |
| `UserPromptExpansion` | 是         | 阻止扩展                                                                                                                             |
| `Stop`                | 是         | 阻止 Claude 停止，继续对话                                                                                                            |
| `SubagentStop`        | 是         | 阻止子代理停止                                                                                                                       |
| `TeammateIdle`        | 是         | 阻止队友进入空闲状态（队友继续工作）                                                                                                  |
| `TaskCreated`         | 是         | 回滚任务创建                                                                                                                         |
| `TaskCompleted`       | 是         | 阻止任务被标记为完成                                                                                                                 |
| `ConfigChange`        | 是         | 阻止配置更改生效（`policy_settings` 除外）                                                                                           |
| `StopFailure`         | 否         | 输出和退出码被忽略                                                                                                                   |
| `PostToolUse`         | 否         | 向 Claude 显示标准错误（工具已运行）                                                                                                 |
| `PostToolUseFailure`  | 否         | 向 Claude 显示标准错误（工具已失败）                                                                                                 |
| `PostToolBatch`       | 是         | 在下一次模型调用前停止智能体循环                                                                                                      |
| `PermissionDenied`    | 否         | 退出码和标准错误被忽略（拒绝已发生）。使用 JSON `hookSpecificOutput.retry: true` 告诉模型可以重试                                      |
| `Notification`        | 否         | 仅向用户显示标准错误                                                                                                                 |
| `SubagentStart`       | 否         | 仅向用户显示标准错误                                                                                                                 |
| `SessionStart`        | 否         | 仅向用户显示标准错误                                                                                                                 |
| `Setup`               | 否         | 仅向用户显示标准错误                                                                                                                 |
| `SessionEnd`          | 否         | 仅向用户显示标准错误                                                                                                                 |
| `CwdChanged`          | 否         | 仅向用户显示标准错误                                                                                                                 |
| `FileChanged`         | 否         | 仅向用户显示标准错误                                                                                                                 |
| `PreCompact`          | 是         | 阻止压缩                                                                                                                             |
| `PostCompact`         | 否         | 仅向用户显示标准错误                                                                                                                 |
| `Elicitation`         | 是         | 拒绝引导                                                                                                                             |
| `ElicitationResult`   | 是         | 阻止响应（操作变为拒绝）                                                                                                              |
| `WorktreeCreate`      | 是         | 任何非零退出码都会导致工作树创建失败                                                                                                  |
| `WorktreeRemove`      | 否         | 失败仅在调试模式下记录                                                                                                               |
| `InstructionsLoaded`  | 否         | 退出码被忽略                                                                                                                         |
| `MessageDisplay`      | 否         | 显示原始文本                                                                                                                         |

### HTTP 响应处理

HTTP 钩子使用 HTTP 状态码和响应体代替退出码和标准输出：

* **2xx 且响应体为空**：成功，相当于退出码 0 且无输出
* **2xx 且响应体为纯文本**：成功，文本作为上下文添加
* **2xx 且响应体为 JSON**：成功，使用与命令钩子相同的 [JSON 输出](#json-输出) 模式进行解析
* **非 2xx 状态码**：非阻塞错误，执行继续
* **连接失败或超时**：非阻塞错误，执行继续

与命令钩子不同，HTTP 钩子无法仅通过状态码发出阻塞错误信号。要阻止工具调用或拒绝权限，请返回 2xx 响应，其 JSON 响应体包含相应的决策字段。

### JSON 输出

退出码仅允许您阻止或保持沉默，但 JSON 输出为您提供了更精细的控制。您可以退出码 0 并将 JSON 对象打印到标准输出，而不是用退出码 2 来阻止。Claude Code 会读取该 JSON 中的特定字段来控制行为，包括用于阻止、允许或升级给用户的[决策控制](#决策控制)。

  每个钩子必须选择一种方式，不能两者兼用：要么仅使用退出码进行信号传递，要么退出码设为 0 并输出 JSON 实现结构化控制。Claude Code 仅处理退出码为 0 时的 JSON 输出。若退出码为 2，任何 JSON 输出都将被忽略。

钩子的标准输出必须仅包含 JSON 对象。如果您的 shell 配置文件在启动时打印文本，可能会干扰 JSON 解析。请参阅故障排除指南中的 [JSON 验证失败](/zh/hooks-guide#json-validation-failed) 部分。

钩子的输出字符串，包括 `additionalContext`、`systemMessage` 和普通标准输出，长度上限为 10,000 个字符。超过此限制的输出将被保存到一个文件，并替换为预览和文件路径，其处理方式与大型工具结果的处理方式相同。

JSON 对象支持三类字段：

*   **通用字段**，如 `continue`，适用于所有事件。这些字段在下面的表格中列出。
*   **顶层 `decision` 和 `reason`** 被某些事件用于阻止操作或提供反馈。
*   **`hookSpecificOutput`** 是一个嵌套对象，用于需要更丰富控制的事件。它需要一个 `hookEventName` 字段，设置为事件名称。

| 字段               | 默认值  | 描述                                                                                                                                                                                                                                                                |
| :----------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `continue`         | `true`  | 如果为 `false`，Claude 会在钩子运行后完全停止处理。优先级高于任何事件特定的 decision 字段                                                                                                                                                                                                           |
| `stopReason`       | 无      | 当 `continue` 为 `false` 时向用户显示的消息。不会向 Claude 显示                                                                                                                                                                                                                                                            |
| `suppressOutput`   | `false` | 如果为 `true`，则从记录中隐藏钩子的标准输出。标准输出仍会出现在调试日志中                                                                                                                                                                                                                                        |
| `systemMessage`    | 无      | 向用户显示的警告消息                                                                                                                                                                                                                                                                                                    |
| `terminalSequence` | 无      | 一个终端转义序列，让 Claude Code 为您发出，例如桌面通知、窗口标题或提示音。仅限 OSC `0`/`1`/`2`/`9`/`99`/`777` 和 BEL。如果值包含允许列表之外的任何内容，则该字段将被忽略。请使用此字段而不是写入 `/dev/tty`，因为钩子无法访问该文件 |

要完全停止 Claude（不考虑事件类型）：
```json
{ "continue": false, "stopReason": "Build failed, fix errors before continuing" }
```
#### 发送终端通知

`terminalSequence` 字段需要 Claude Code v2.1.141 或更高版本。

钩子运行时没有控制终端，因此直接向 `/dev/tty` 写入转义序列会失败。取而代之的是在 `terminalSequence` 字段中返回转义序列，Claude Code 会通过其自身的终端写入路径为你发出。此方法无竞争问题，在 tmux 和 GNU screen 内部有效，并且在没有 `/dev/tty` 的 Windows 系统上也能工作。

该字段接受一个包含一个或多个允许列表转义序列的字符串：

* OSC `0`、`1`、`2`：窗口和图标标题
* OSC `9`：iTerm2、ConEmu、Windows Terminal 和 WezTerm 通知，包括 `9;4` 任务栏进度
* OSC `99`：Kitty 通知
* OSC `777`：urxvt、Ghostty 和 Warp 通知
* 裸 BEL

序列可以用 BEL 或 ST 终止。任何不在允许列表中的内容，包括 CSI 光标和颜色序列、OSC 调色板序列、OSC 8 超链接、OSC 52 剪贴板写入和 OSC 1377，都会被拒绝，该字段将被忽略。

下面的示例从一个 `Notification` 钩子触发桌面通知。转义序列使用 `printf` 八进制转义构建，这样控制字节永远不会出现在 shell 命令行上，并且 `jq -n --arg` 构建 JSON 输出，以确保通知消息中的引号、反斜杠和换行符被正确转义：
```bash
#!/bin/bash
# Notification hook: ping the desktop when Claude Code needs attention.
input=$(cat)
title="Claude Code"
body=$(jq -r '.message // "Needs your attention"' <<<"$input")
seq=$(printf '\033]777;notify;%s;%s\007' "$title" "$body")
jq -nc --arg seq "$seq" '{terminalSequence: $seq}'
```
无论使用哪种 Shell 或语言，`{ "terminalSequence": "..." }` 的格式都是相同的。在 Windows 上，可以在 PowerShell 或脚本中构建转义字符串，并输出相同的 JSON 对象。

  `terminalSequence` 是之前直接向 `/dev/tty` 写入转义序列的钩子的受支持替代方案。其允许列表仅限于那些无法移动光标或更改颜色的序列，因此钩子绝不会破坏屏幕上的提示词。

#### 为 Claude 添加上下文

`additionalContext` 字段会将钩子中的一个字符串传递给 Claude 的上下文窗口。Claude Code 会将该字符串包裹在系统提醒中，并在钩子触发的位置插入对话中。Claude 会在下一次模型请求时读取此提醒，但它不会作为聊天消息显示在界面中。

在 `hookSpecificOutput` 内返回 `additionalContext`，与事件名称一起：
```json
{
  "hookSpecificOutput": {
    "additionalContext": "Context string to pass to Claude",
    "hookEventName": "PreToolUse"
  }
}
```
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "This file is generated. Edit src/schema.ts and run `bun generate` instead."
  }
}
```
提醒出现的位置取决于事件类型：

* [SessionStart](#sessionstart)、[Setup](#初始化设置) 和 [SubagentStart]：在对话开始时，在第一个提示词之前
* [UserPromptSubmit](#userpromptsubmit) 和 [UserPromptExpansion](#userpromptexpansion-输入)：与提交的提示词一起出现
* [PreToolUse](#pretooluse)、[PostToolUse](#posttooluse)、[PostToolUseFailure](#钩子事件) 和 [PostToolBatch](#钩子事件)：出现在工具结果旁边

当多个钩子为同一事件返回 `additionalContext` 时，Claude 会接收到所有的值。如果某个值超过 10,000 个字符，Claude Code 会将完整文本写入会话目录中的一个文件，并传递给 Claude 该文件路径和一个简短预览，而不是原始文本。

使用 `additionalContext` 来传递 Claude 需要了解的关于当前环境状态或刚刚运行的操作的信息：

* **环境状态**：当前分支、部署目标或活动的功能标志
* **条件项目规则**：刚刚编辑的文件适用哪个测试命令，此工作树中哪些目录是只读的
* **外部数据**：分配给你的未解决问题、最近的 CI 结果、从内部服务获取的内容

对于永远不会改变的指令，请优先使用 [CLAUDE.md](/zh/memory)。它无需运行脚本即可加载，是存放静态项目约定的标准位置。

请将文本撰写为事实陈述，而不是祈使句式的系统指令。使用“部署目标是生产环境”或“此仓库使用 `bun test`”这类措辞，读起来像是项目信息。将文本框定为带外系统指令可能会触发 Claude 的提示词注入防御机制，这会导致 Claude 将文本呈现给你，而不是将其视为上下文。

一旦注入，文本将保存在会话记录中。对于 `PostToolUse` 或 `UserPromptSubmit` 等会话中期事件，使用 `--continue` 或 `--resume` 恢复时，会重放保存的文本，而不是为过去的轮次重新运行钩子，因此像时间戳或提交 SHA 这样的值在恢复后会变得陈旧。`SessionStart` 钩子在恢复时会再次运行，其 `source` 设置为 `"resume"`，因此它们可以刷新其上下文。

#### 决策控制

并非所有事件都支持通过 JSON 阻止或控制行为。支持该功能的事件各自使用不同的字段集来表达该决策。在编写钩子之前，请使用此表作为快速参考：

| 事件                                                                                                                                | 决策模式                      | 关键字段                                                                                                                                                                                                                          |
| :---------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UserPromptSubmit, UserPromptExpansion, PostToolUse, PostToolUseFailure, PostToolBatch, Stop, SubagentStop, ConfigChange, PreCompact | 顶层 `decision`               | `decision: "block"`, `reason`                                                                                                                                                                                                       |
| TeammateIdle, TaskCreated, TaskCompleted                                                                                            | 退出码或 `continue: false`    | 退出码 2 阻止该操作并提供 stderr 反馈。JSON `{"continue": false, "stopReason": "..."}` 也会完全停止队友，行为与 `Stop` 钩子匹配                                                                                                     |
| PreToolUse                                                                                                                          | `hookSpecificOutput`          | `permissionDecision` (allow/deny/ask/defer), `permissionDecisionReason`                                                                                                                                                             |
| PermissionRequest                                                                                                                   | `hookSpecificOutput`          | `decision.behavior` (allow/deny)                                                                                                                                                                                                    |
| PermissionDenied                                                                                                                    | `hookSpecificOutput`          | `retry: true` 告知模型它可以重试被拒绝的工具调用                                                                                                                                                                                    |
| WorktreeCreate                                                                                                                      | 路径返回                      | 命令钩子在 stdout 打印路径；HTTP 钩子返回 `hookSpecificOutput.worktreePath`。钩子失败或缺少路径会导致创建失败                                                                                                                       |
| Elicitation                                                                                                                         | `hookSpecificOutput`          | `action` (accept/decline/cancel), `content` (用于 accept 的表单字段值)                                                                                                                                                              |
| ElicitationResult                                                                                                                   | `hookSpecificOutput`          | `action` (accept/decline/cancel), `content` (覆盖表单字段值)                                                                                                                                                                        |
| MessageDisplay                                                                                                                      | `hookSpecificOutput`          | `displayContent` 替换屏幕上显示的文本。仅用于显示：记录和 Claude 看到的内容保持原始不变                                                                                                                                             |
| SessionStart, Setup, SubagentStart                                                                                                  | 仅上下文                      | `hookSpecificOutput.additionalContext` 为 Claude 添加上下文。SessionStart 还接受 [`initialUserMessage`, `watchPaths`, `sessionTitle`, and `reloadSkills`](#sessionstart)。无阻止或决策控制                          |
| WorktreeRemove, Notification, SessionEnd, PostCompact, InstructionsLoaded, StopFailure, CwdChanged, FileChanged                     | 无                            | 无决策控制。用于记录日志或清理等副作用                                                                                                                                                                                              |

以下是每种模式的实际示例：


    供 `UserPromptSubmit`、`UserPromptExpansion`、`PostToolUse`、`PostToolUseFailure`、`PostToolBatch`、`Stop`、`SubagentStop`、`ConfigChange` 和 `PreCompact` 使用。唯一有效的值为 `"block"`。要允许操作继续执行，请从 JSON 中省略 `decision` 字段，或直接返回退出码 0 且不输出任何 JSON：
    ```json
    {
      "decision": "block",
      "reason": "Test suite must pass before proceeding"
    }
    ```



    使用 `hookSpecificOutput` 可实现更精细的控制：允许、拒绝或升级给用户。您还可以在运行前修改工具输入，或为 Claude 注入额外上下文。完整选项请参阅 [PreToolUse 决策控制](#pretooluse)。
    ```json
    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Database writes are not allowed"
      }
    }
    ```



    使用 `hookSpecificOutput` 来代表用户允许或拒绝权限请求。允许时，您还可以修改工具输入或应用权限规则，从而避免用户再次收到提示。完整的选项集请参阅[PermissionRequest 决策控制](#permissionrequest)。
    ```json
    {
      "hookSpecificOutput": {
        "hookEventName": "PermissionRequest",
        "decision": {
          "behavior": "allow",
          "updatedInput": {
            "command": "npm run lint"
          }
        }
      }
    }
    ```


关于包含 Bash 命令验证、提示词过滤和自动批准脚本的扩展示例，请参阅指南中的[可自动化操作](/zh/hooks-guide#what-you-can-automate)以及 [Bash 命令验证器参考实现](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)。

## 钩子事件

每个事件都对应 Claude Code 生命周期中可以运行钩子的一个节点。以下各节的顺序与生命周期相匹配：从会话设置开始，经过智能体循环，直至会话结束。每个小节都会描述事件何时触发、它支持哪些匹配器、它接收的 JSON 输入，以及如何通过输出来控制行为。

### SessionStart

当 Claude Code 启动新会话或恢复现有会话时运行。适用于加载开发上下文，例如现有问题或代码库的最新更改，或设置环境变量。对于不需要脚本的静态上下文，请改用 [CLAUDE.md](/zh/memory)。

SessionStart 会在每个会话上运行，因此请保持这些钩子快速。仅支持 `type: "command"` 和 `type: "mcp_tool"` 钩子。

匹配器的值对应会话的启动方式：

| 匹配器    | 触发时机                               |
| :-------- | :------------------------------------- |
| `startup` | 新会话                                 |
| `resume`  | `--resume`、`--continue` 或 `/resume` |
| `clear`   | `/clear`                               |
| `compact` | 自动或手动压缩                         |

#### SessionStart 输入

除了[通用输入字段](#钩子事件)外，SessionStart 钩子还会接收 `source`、`model`，以及可选的 `agent_type` 和 `session_title`。`source` 字段指示会话的启动方式：`"startup"` 表示新会话，`"resume"` 表示恢复的会话，`"clear"` 表示 `/clear` 之后，`"compact"` 表示压缩之后。`model` 字段包含模型标识符。如果您使用 `claude --agent <name>` 启动 Claude Code，则 `agent_type` 字段包含智能体名称。`session_title` 字段携带当前会话标题（如果已设置，例如通过 `--name` 或 `/rename`）。一个发出 `sessionTitle` 的钩子可以先检查 `session_title` 以避免覆盖用户明确设置的标题。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionStart",
  "source": "startup",
  "model": "claude-sonnet-4-6"
}
```
#### 会话启动决策控制

您的钩子脚本打印到标准输出（stdout）的任何文本都将作为上下文提供给 Claude。除了所有钩子可用的 [JSON 输出字段](#json-输出) 外，您还可以返回以下特定于事件的字段：

| 字段                 | 描述                                                                                                                                                                                                                                                                                                                         |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `additionalContext`  | 一个字符串，将在会话开始时、第一个提示词之前添加到 Claude 的上下文中。有关该文本的传递方式和应包含的内容，请参阅[为 Claude 添加上下文](#为-claude-添加上下文)。                                                                                                                                                             |
| `initialUserMessage` | 用作会话中第一条用户消息的字符串。适用于[非交互模式](/zh/headless)（`-p`），在此模式下，即使未提供提示词，它也会成为第一轮对话。如果提供了提示词，它将作为下一轮对话。与附加到现有对话轮次的 `additionalContext` 不同，此字段会创建一个新的对话轮次。                                                                     |
| `sessionTitle`       | 设置会话标题，效果与 `/rename` 相同。可用于从启动文件夹、Git 分支或工作树名称自动命名会话。仅在 `source` 为 `"startup"` 或 `"resume"` 时生效；在 `"clear"` 和 `"compact"` 时忽略。                                                                                                                                         |
| `watchPaths`         | 要在此会话期间监视的[FileChanged 事件]的绝对路径数组。                                                                                                                                                                                                                                                         |
| `reloadSkills`       | 布尔值。当为 `true` 时，Claude Code 会在会话启动钩子完成后重新扫描[技能](/zh/skills)和命令目录，以便钩子安装的技能在同一会话中即可用，从第一个提示词开始。                                                                                                                                                                   |
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Current branch: feat/auth-refactor\nUncommitted changes: src/auth.ts, src/login.tsx\nActive issue: #4211 Migrate to OAuth2",
    "sessionTitle": "auth-refactor"
  }
}
```
由于标准输出本身就会被 Claude 接收，仅用于加载上下文的钩子可以直接向标准输出打印信息，无需构建 JSON。当您需要将上下文与其他字段（如 `suppressOutput` 或 `sessionTitle`）结合时，请使用 JSON 格式。

当 SessionStart 钩子安装或更新技能时，请使用 `reloadSkills`。技能发现通常在 SessionStart 钩子完成前运行，因此钩子写入 `~/.claude/skills/` 或 `.claude/skills/` 的文件默认只会在下一个会话中生效。以下示例同步了共享技能仓库并请求重新扫描：
```bash
#!/bin/bash

git -C ~/.claude/skills/team-skills pull --quiet 2>/dev/null || \
  git clone --quiet https://git.example.com/your-org/team-skills.git ~/.claude/skills/team-skills

echo '{"hookSpecificOutput": {"hookEventName": "SessionStart", "reloadSkills": true}}'
```
#### 持久化环境变量

SessionStart 钩子可以访问 `CLAUDE_ENV_FILE` 环境变量，它提供了一个文件路径，您可以在其中持久化环境变量供后续的 Bash 命令使用。

要设置单个环境变量，请将 `export` 语句写入 `CLAUDE_ENV_FILE`。使用追加写入（`>>`）以保留其他钩子设置的变量：
```bash
#!/bin/bash

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```
要捕获设置命令带来的所有环境变更，请比较设置前后的导出变量：
```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Run your setup commands that modify the environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```
写入此文件的任何变量，在会话期间 Claude Code 执行的所有后续 Bash 命令中都可用。

  `CLAUDE_ENV_FILE` 适用于 SessionStart、[Setup](#初始化设置)、[CwdChanged] 和 [FileChanged] 钩子。其他钩子类型无法访问此变量。

### 初始化设置

仅当使用 `--init-only` 参数启动 Claude Code，或在打印模式 (`-p`) 下使用 `--init` 或 `--maintenance` 参数时触发。正常启动时不会触发。可用于从 CI 或脚本中显式触发的一次性依赖安装或计划清理任务，与常规会话启动流程分离。若需会话级别的初始化，请改用 [SessionStart](#sessionstart)。

匹配器值对应触发钩子的 CLI 参数：

| 匹配器          | 触发条件                                   |
| :------------ | :----------------------------------------- |
| `init`        | `claude --init-only` 或 `claude -p --init` |
| `maintenance` | `claude -p --maintenance`                  |

`--init-only` 会执行初始化设置钩子和带 `startup` 匹配器的 `SessionStart` 钩子，随后退出且不启动对话。`--init` 和 `--maintenance` 仅在与 `-p`（打印模式）组合使用时才会触发初始化设置钩子；在交互式会话中，这两个参数当前不会触发初始化设置钩子。

由于初始化设置钩子并非每次启动都触发，需要依赖安装的插件不能仅依赖此钩子。实用模式是在首次使用时检查依赖项，缺失时再进行安装——例如钩子或技能可检测 `${CLAUDE_PLUGIN_DATA}/node_modules` 是否存在，若不存在则执行 `npm install`。已安装依赖的存储位置请参阅[持久化数据目录](/zh/plugins-reference#persistent-data-directory)。

#### 初始化设置输入

除[通用输入字段](#钩子事件)外，初始化设置钩子还会接收一个 `trigger` 字段，其值为 `"init"` 或 `"maintenance"`：
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "Setup",
  "trigger": "init"
}
```
#### 设置决策控制

设置钩子无法阻断执行。当退出码为 2 时，stderr 会显示给用户；当退出码为任何其他非零值时，stderr 仅在使用 `--verbose` 参数启动时显示。在两种情况下，执行都会继续。要将信息传递到 Claude 的上下文中，需在 JSON 输出中返回 `additionalContext`；普通 stdout 仅写入调试日志。除了所有钩子可用的 [JSON 输出字段](#json-输出) 外，您还可以返回以下事件特定字段：

| 字段                | 描述                                                                       |
| :------------------ | :------------------------------------------------------------------------- |
| `additionalContext` | 添加到 Claude 上下文中的字符串。多个钩子的值会被拼接                     |
```json
{
  "hookSpecificOutput": {
    "hookEventName": "Setup",
    "additionalContext": "Dependencies installed: node_modules, .venv"
  }
}
```
设置钩子可以访问 `CLAUDE_ENV_FILE`。写入该文件的变量会持久化到该会话后续的 Bash 命令中，与 [会话开始钩子](#持久化环境变量) 相同。仅支持 `type: "command"` 和 `type: "mcp_tool"` 类型的钩子。

### InstructionsLoaded

在 `CLAUDE.md` 或 `.claude/rules/*.md` 文件被加载到上下文时触发。此事件会在会话开始时为预加载的文件触发，也会在文件被延迟加载时再次触发，例如当 Claude 访问包含嵌套 `CLAUDE.md` 的子目录，或当带 `paths:` 前置元数据的条件规则匹配时。此钩子不支持阻塞或决策控制。它异步运行以用于可观测性目的。

匹配器根据 `load_reason` 运行。例如，使用 `"matcher": "session_start"` 仅对在会话开始时加载的文件触发，或使用 `"matcher": "path_glob_match|nested_traversal"` 仅对延迟加载触发。

#### InstructionsLoaded 输入

除了[通用输入字段](#钩子事件)外，InstructionsLoaded 钩子还会接收以下字段：

| 字段                 | 描述                                                                                                                                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file_path`          | 已加载的指令文件的绝对路径                                                                                                                                                                               |
| `memory_type`        | 文件的范围：`"User"`、`"Project"`、`"Local"` 或 `"Managed"`                                                                                                                                             |
| `load_reason`        | 文件被加载的原因：`"session_start"`、`"nested_traversal"`、`"path_glob_match"`、`"include"` 或 `"compact"`。当压缩事件后重新加载指令文件时，`"compact"` 值触发                                             |
| `globs`              | 来自文件 `paths:` 前置元数据的路径 glob 模式（如果有的话）。仅在 `path_glob_match` 加载时存在                                                                                                            |
| `trigger_file_path`  | 触发此次加载的文件路径，用于延迟加载                                                                                                                                                                     |
| `parent_file_path`  | 包含此文件的父指令文件路径，用于 `include` 加载                                                                                                                                                          |
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "InstructionsLoaded",
  "file_path": "/Users/my-project/CLAUDE.md",
  "memory_type": "Project",
  "load_reason": "session_start"
}
```
#### InstructionsLoaded 决策控制

InstructionsLoaded 钩子不具有决策控制功能。它们无法阻止或修改指令的加载。请将此事件用于审计日志记录、合规性跟踪或可观察性分析。

### UserPromptSubmit

在用户提交提示词且 Claude 处理该提示词之前运行。此钩子允许您根据提示词/对话内容添加额外的上下文、验证提示词，或阻止特定类型的提示词。

对于 `command`、`http` 和 `mcp_tool` 类型，`UserPromptSubmit` 钩子的默认超时时间为 30 秒，比这些类型在其他事件上的 600 秒默认值要短。因为此钩子在每次提交提示词前运行，并会阻塞模型处理直至其完成，所以一个卡住的钩子会使会话停滞。如果您的钩子需要更多时间，请在钩子条目中设置 `timeout` 字段。

#### UserPromptSubmit 输入

除了[通用输入字段](#钩子事件)之外，UserPromptSubmit 钩子还会接收包含用户提交文本的 `prompt` 字段。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "Write a function to calculate the factorial of a number"
}
```
#### UserPromptSubmit 决策控制

`UserPromptSubmit` 钩子可以控制是否处理用户提示词并添加上下文。所有 [JSON 输出字段](#json-输出) 均可用。

在退出码为 0 时，有两种方式可以为对话添加上下文：

* **纯文本标准输出**：任何写入标准输出的非 JSON 文本都会作为上下文添加
* **包含 `additionalContext` 的 JSON**：使用下方 JSON 格式以获得更精细的控制。`additionalContext` 字段将作为上下文添加

纯文本标准输出会显示为会话记录中的钩子输出。`additionalContext` 字段的添加方式更为隐蔽。

要阻止提示词处理，请返回一个 `decision` 字段设置为 `"block"` 的 JSON 对象：

| 字段                     | 描述                                                                                                                  |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `decision`               | `"block"` 会阻止提示词的处理并将其从上下文中删除。省略此字段则允许提示词继续处理                                       |
| `reason`                 | 当 `decision` 为 `"block"` 时向用户显示。不会添加到上下文中                                                           |
| `additionalContext`      | 与提交的提示词一起添加到 Claude 上下文中的字符串。参见 [为 Claude 添加上下文](#为-claude-添加上下文)                |
| `sessionTitle`           | 设置会话标题。可用于根据提示词内容自动命名会话                                                                        |
| `suppressOriginalPrompt` | 如果为 `true` 且 `decision` 为 `"block"`，则会向用户显示的阻止消息中忽略原始提示词文本                               |
```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "My additional context here",
    "sessionTitle": "My session title"
  }
}
```


  对于简单用例，并不需要JSON格式。要添加上下文，您可以通过退出码0向标准输出打印纯文本。当您需要阻止提示词或进行更结构化的控制时，请使用JSON。

### 用户提示词扩展

当用户输入的斜杠命令在发送至 Claude 前扩展为提示词时触发。可用于阻止特定命令被直接调用、为特定技能注入上下文，或记录用户调用了哪些命令。例如，匹配 `deploy` 的钩子可在没有审批文件时阻止 `/deploy` 执行，或匹配某个代码审查技能的钩子可以将团队的审查清单作为 `additionalContext` 追加。

此事件覆盖了 `PreToolUse` 未涵盖的路径：`PreToolUse` 钩子仅在 Claude 调用工具时触发（如匹配 `Skill` 工具的钩子），但直接输入 `/skillname` 会绕过 `PreToolUse`。`UserPromptExpansion` 则在该直接路径上触发。

根据 `command_name` 进行匹配。若留空匹配器，则会在每个提示词类型的斜杠命令上触发。

#### UserPromptExpansion 输入

除了 [通用输入字段](#钩子事件) 外，UserPromptExpansion 钩子还会接收 `expansion_type`、`command_name`、`command_args`、`command_source` 以及原始的 `prompt` 字符串。`expansion_type` 字段对于技能和自定义命令是 `slash_command`，对于 MCP 服务器提示词则是 `mcp_prompt`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../00893aaf.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptExpansion",
  "expansion_type": "slash_command",
  "command_name": "example-skill",
  "command_args": "arg1 arg2",
  "command_source": "plugin",
  "prompt": "/example-skill arg1 arg2"
}
```
#### UserPromptExpansion 决策控制

`UserPromptExpansion` 钩子可以阻止扩展或添加上下文。所有[JSON 输出字段](#json-输出)均可用。

| 字段                | 描述                                                                                                                  |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------- |
| `decision`          | `"block"` 可阻止斜杠命令扩展。省略此字段则允许继续执行                                                                |
| `reason`            | 当 `decision` 为 `"block"` 时，将向用户显示此内容                                                                     |
| `additionalContext` | 字符串，将与扩展后的提示词一同添加至 Claude 的上下文中。参见[为 Claude 添加上下文](#为-claude-添加上下文)            |
```json
{
  "decision": "block",
  "reason": "This slash command is not available",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptExpansion",
    "additionalContext": "Additional context for this expansion"
  }
}
```
### MessageDisplay

当助手消息流式传输到屏幕时运行。Claude Code 以增量方式显示消息：每当一批新完成的行准备好渲染时，钩子会运行一次并提供这些行，Claude Code 则用钩子的替换文本替换它们进行渲染。长消息会产生多次调用；短消息可能仅产生一次调用。利用此钩子，可以在 Claude 的回应出现在屏幕上时重新格式化、编辑或精简它们。

MessageDisplay 仅用于显示：替换文本只改变屏幕上渲染的内容。对话记录和 Claude 所看到的仍保留原始文本，因此 Claude 永远不会看到替换内容，并且详细模式会显示原始文本。MessageDisplay 不支持匹配器，并为每一个流式传输文本的助手消息触发；不含文本的消息（例如仅工具调用的响应）不会触发它。

在非交互式运行中，包括 Agent SDK 查询和 `claude -p`，MessageDisplay 对每个助手消息运行一次，而不是对每批行运行一次。单次调用在消息完成后到达，并携带完整的消息文本：`index` 为 `0`，`final` 为 `true`，`delta` 包含整个消息。一个为每条消息收集 `delta` 文本的钩子在两种模式下都会接收到相同的总文本。

#### MessageDisplay 输入

除了[通用输入字段](#钩子事件)，MessageDisplay 钩子还会接收当前轮次和消息的标识符、本次调用在消息中的位置以及 `delta` 中的新文本。批处理边界取决于文本流式传输的方式，因此请使用 `index` 和 `final` 来跟踪消息处理进度，而不是期望行以特定方式分组。

| 字段         | 描述                                                                                                                                                                                                                                                                                                                                                                                               |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `turn_id`    | 当前轮次的 UUID                                                                                                                                                                                                                                                                                                                                                                                    |
| `message_id` | 正在显示的助手消息的 UUID。在同一消息的每个批次中保持稳定。这不是 API 的 `msg_…` ID，因此无法与对话记录中的消息 ID 关联                                                                                                                                                                                                                                                                     |
| `index`      | 此批次在消息中的从零开始的索引                                                                                                                                                                                                                                                                                                                                                                     |
| `final`      | 在消息的最后一个批次时为 `true`。每条消息恰好有一个最终批次                                                                                                                                                                                                                                                                                                                                        |
| `delta`      | 自上一批次以来新完成的行，包括尾部换行符。始终是整行，但最后一批次可能在行中间结束。在交互式运行中，如果消息以换行符结束，最后一批次的 `delta` 为空，因此应将 `final`（而非非空的 `delta`）视为消息结束的信号。在 Agent SDK 和 `claude -p` 运行中，单次调用携带整个消息。                                                               |
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "MessageDisplay",
  "turn_id": "0c9e6a2f-7d41-4f4e-9a15-3f4f7c2b8d10",
  "message_id": "5b2a9c8e-1f63-4d8a-b7c4-9e0d2a6f1c3b",
  "index": 0,
  "final": false,
  "delta": "Here is the plan:\n"
}
```
#### MessageDisplay 输出

除了所有钩子均可使用的[JSON输出字段](#json-输出)外，MessageDisplay钩子可以返回 `displayContent` 以替换屏幕上的增量内容：

| 字段             | 描述                                                               |
| :--------------- | :----------------------------------------------------------------- |
| `displayContent` | 用于替换增量内容的显示文本。省略则显示原始内容。                   |

MessageDisplay钩子没有决策控制权。它们无法阻止消息，也无法更改存储于对话记录或发送给Claude的内容。

### PreToolUse

在Claude创建工具参数之后、处理工具调用之前运行。根据工具名称进行匹配：`Bash`、`Edit`、`Write`、`Read`、`Glob`、`Grep`、`Agent`、`WebFetch`、`WebSearch`、`AskUserQuestion`、`ExitPlanMode`，以及任何[MCP工具名称](#匹配-mcp-工具)。

使用[PreToolUse决策控制](#pretooluse)来允许、拒绝、询问或推迟工具调用。

#### PreToolUse 输入

除了[公共输入字段](#钩子事件)外，PreToolUse钩子接收 `tool_name`、`tool_input` 和 `tool_use_id`。`tool_input` 的字段取决于具体工具：

##### Bash

执行shell命令。

| 字段                | 类型    | 示例               | 描述                         |
| :------------------ | :------ | :----------------- | :--------------------------- |
| `command`           | string  | `"npm test"`       | 要执行的shell命令            |
| `description`       | string  | `"Run test suite"` | 可选，命令功能描述           |
| `timeout`           | number  | `120000`           | 可选，超时时间（毫秒）       |
| `run_in_background` | boolean | `false`            | 是否在后台运行命令           |

##### Write

创建或覆盖文件。

| 字段        | 类型   | 示例                | 描述               |
| :---------- | :----- | :------------------ | :----------------- |
| `file_path` | string | `"/path/to/file.txt"` | 要写入文件的绝对路径 |
| `content`   | string | `"file content"`      | 要写入文件的内容     |

##### Edit

替换现有文件中的字符串。

| 字段          | 类型    | 示例                | 描述                     |
| :------------ | :------ | :------------------ | :----------------------- |
| `file_path`   | string  | `"/path/to/file.txt"` | 要编辑文件的绝对路径     |
| `old_string`  | string  | `"original text"`     | 要查找并替换的文本       |
| `new_string`  | string  | `"replacement text"`  | 替换文本                 |
| `replace_all` | boolean | `false`               | 是否替换所有匹配项       |

##### Read

读取文件内容。

| 字段        | 类型   | 示例                | 描述                     |
| :---------- | :----- | :------------------ | :----------------------- |
| `file_path` | string | `"/path/to/file.txt"` | 要读取文件的绝对路径     |
| `offset`    | number | `10`                  | 可选，开始读取的行号     |
| `limit`     | number | `50`                  | 可选，要读取的行数       |

##### Glob

查找匹配glob模式的文件。

| 字段      | 类型   | 示例           | 描述                                               |
| :-------- | :----- | :------------- | :------------------------------------------------- |
| `pattern` | string | `"**/*.ts"`    | 用于匹配文件的glob模式                             |
| `path`    | string | `"/path/to/dir"` | 可选，搜索目录。默认为当前工作目录                 |

##### Grep

使用正则表达式搜索文件内容。

| 字段          | 类型    | 示例           | 描述                                                 |
| :------------ | :------ | :------------- | :--------------------------------------------------- |
| `pattern`     | string  | `"TODO.*fix"`  | 要搜索的正则表达式模式                               |
| `path`        | string  | `"/path/to/dir"` | 可选，要搜索的文件或目录                             |
| `glob`        | string  | `"*.ts"`       | 可选，用于过滤文件的glob模式                         |
| `output_mode` | string  | `"content"`    | `"content"`、`"files_with_matches"` 或 `"count"`。默认为 `"files_with_matches"` |
| `-i`          | boolean | `true`         | 不区分大小写搜索                                     |
| `multiline`   | boolean | `false`        | 启用多行匹配                                         |

##### WebFetch

获取并处理网页内容。

| 字段     | 类型   | 示例                        | 描述                     |
| :------- | :----- | :-------------------------- | :----------------------- |
| `url`    | string | `"https://example.com/api"`   | 要获取内容的URL          |
| `prompt` | string | `"Extract the API endpoints"` | 要对获取内容执行的提示词 |

##### WebSearch

搜索网络。

| 字段              | 类型   | 示例                         | 描述                             |
| :---------------- | :----- | :--------------------------- | :------------------------------- |
| `query`           | string | `"react hooks best practices"` | 搜索查询                         |
| `allowed_domains` | array  | `["docs.example.com"]`         | 可选：仅包含来自这些域名的结果   |
| `blocked_domains` | array  | `["spam.example.com"]`         | 可选：排除来自这些域名的结果     |

##### Agent

生成一个[子代理](/zh/sub-agents)。

| 字段            | 类型   | 示例                     | 描述                             |
| :-------------- | :----- | :----------------------- | :------------------------------- |
| `prompt`        | string | `"Find all API endpoints"` | 代理要执行的任务                 |
| `description`   | string | `"Find API endpoints"`     | 任务的简短描述                   |
| `subagent_type` | string | `"Explore"`                | 要使用的专门化代理类型           |
| `model`         | string | `"sonnet"`                 | 可选，覆盖默认设置的模型别名     |

在 `PostToolUse` 中，已完成的Agent调用的 `tool_response` 包含子代理的最终文本以及使用情况遥测数据。通过钩子读取这些字段以记录每个子代理的成本：

| 字段                | 类型   | 示例                                                | 描述                                                                                       |
| :------------------ | :----- | :-------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `status`            | string | `"completed"`                                       | 同步调用为 `"completed"`，`run_in_background: true` 时为 `"async_launched"`                |
| `agentId`           | string | `"a4d2c8f1e0b3a297"`                                | 子代理运行的标识符                                                                         |
| `content`           | array  | `[{"type": "text", "text": "Found 12 endpoints..."}]` | 子代理的最终文本块                                                                         |
| `totalTokens`       | number | `12450`                                             | 子代理所有轮次总计的计费token数                                                            |
| `totalDurationMs`   | number | `48211`                                             | 子代理运行的挂钟持续时间（毫秒）                                                           |
| `totalToolUseCount` | number | `7`                                                 | 子代理进行的工具调用次数                                                                   |
| `usage`             | object | `{"input_tokens": 8320, ...}`                       | 按类型划分的token明细：`input_tokens`、`output_tokens`、`cache_creation_input_tokens`、`cache_read_input_tokens` |

对于 `run_in_background: true` 的调用，工具会在启动子代理后立即返回，因此 `tool_response` 不包含使用情况字段。它包含 `status: "async_launched"`、`agentId`、`description`、`prompt` 和 `outputFile`。

##### AskUserQuestion

向用户提出一到四个选择题。

| 字段        | 类型   | 示例                                                                                                             | 描述                                                                                                                                       |
| :---------- | :----- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `questions` | array  | `[{"question": "Which framework?", "header": "Framework", "options": [{"label": "React"}], "multiSelect": false}]` | 要呈现的问题，每个问题包含 `question` 字符串、简短 `header`、`options` 数组，以及可选的 `multiSelect` 标志                                |
| `answers`   | object | `{"Which framework?": "React"}`                                                                                  | 可选。将问题文本映射到所选选项标签。多选答案用逗号连接标签。Claude不设置此字段；通过 `updatedInput` 提供它以编程方式回答                   |

##### ExitPlanMode

呈现一个计划，并在Claude离开[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)前要求用户批准。Claude在调用工具前将计划写入磁盘文件，因此来自模型的实际 `tool_input` 仅携带 `allowedPrompts`。Claude Code在将输入传递给钩子之前，会注入计划内容和文件路径。

| 字段             | 类型   | 示例                                      | 描述                                                                                                                               |
| :--------------- | :----- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `plan`           | string | `"## Refactor auth\n1. Extract..."`       | Markdown格式的计划内容。从磁盘上的计划文件注入                                                                                     |
| `planFilePath`   | string | `"/Users/.../plans/refactor-auth.md"`     | 计划文件的路径。已注入                                                                                                             |
| `allowedPrompts` | array  | `[{"tool": "Bash", "prompt": "run tests"}]` | 可选。Claude为实现该计划请求的基于提示词的权限，每个权限包含一个 `tool` 名称和一个描述操作类别的 `prompt`                           |

在 `PostToolUse` 中，`tool_response` 是一个包含 `plan` 和 `filePath` 字段的对象，其中保存已批准的计划，以及内部状态标志。读取 `tool_response.plan` 来获取计划内容，而不是从磁盘重新读取文件。

#### PreToolUse 决策控制

`PreToolUse` 钩子可以控制是否继续执行工具调用。与其他使用顶层 `decision` 字段的钩子不同，PreToolUse将其决策放在 `hookSpecificOutput` 对象中返回。这使其具有更丰富的控制权：四种结果（允许、拒绝、询问或推迟），以及能够在执行前修改工具输入。

| 字段                         | 描述                                                                                                                                                                                                               |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permissionDecision`         | `"allow"` 跳过权限提示。`"deny"` 阻止工具调用。`"ask"` 提示用户确认。`"defer"` 正常退出以便稍后恢复工具。[拒绝和询问规则](/zh/permissions#manage-permissions) 无论钩子返回什么都会被评估。                            |
| `permissionDecisionReason`   | 对于 `"allow"` 和 `"ask"`，向用户显示但不向Claude显示。对于 `"deny"`，向Claude显示。对于 `"defer"`，被忽略。                                                                                                       |
| `updatedInput`               | 在执行前修改工具的输入参数。替换整个输入对象，因此需在修改字段的同时包含未更改的字段。与 `"allow"` 结合使用可自动批准，或与 `"ask"` 结合使用可向用户显示修改后的输入。对于 `"defer"`，被忽略。                |
| `additionalContext`          | 与工具结果一起添加到Claude上下文中的字符串。当 `permissionDecision` 为 `"defer"` 时被忽略。参见[为Claude添加上下文](#为-claude-添加上下文)。                                                                    |

当多个PreToolUse钩子返回不同决策时，优先顺序为 `deny` > `defer` > `ask` > `allow`。

当钩子返回 `"ask"` 时，显示给用户的权限提示包含一个标识钩子来源的标签：例如 `[User]`、`[Project]`、`[Plugin]` 或 `[Local]`。这有助于用户了解哪个配置源正在请求确认。
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "My reason here",
    "updatedInput": {
      "field_to_modify": "new value"
    },
    "additionalContext": "Current environment: production. Proceed with caution."
  }
}
```
`AskUserQuestion` 和 `ExitPlanMode` 需要用户交互，通常在使用 `-p` 标志的[非交互模式](/zh/headless)下会被阻塞。返回 `permissionDecision: "allow"` 并同时提供 `updatedInput` 即可满足此要求：钩子从标准输入读取工具的输入，通过您自己的用户界面收集答案，并将其返回到 `updatedInput` 中，从而使工具无需提示即可运行。仅返回 `"allow"` 对于这些工具是不够的。对于 `AskUserQuestion`，请回显原始 `questions` 数组，并添加一个 [`answers`](#askuserquestion) 对象，将每个问题的文本映射到所选的答案。

  PreToolUse 事件之前使用的顶层 `decision` 和 `reason` 字段已弃用，请改用 `hookSpecificOutput.permissionDecision` 和 `hookSpecificOutput.permissionDecisionReason`。弃用的 `"approve"` 和 `"block"` 值分别映射为 `"allow"` 和 `"deny"`。而 PostToolUse 和 Stop 等其他事件仍使用当前格式的顶层 `decision` 和 `reason` 字段。

#### 延迟工具调用

`"defer"` 专为将 `claude -p` 作为子进程运行并读取其 JSON 输出的集成场景设计，例如基于 Agent SDK 的应用程序或在 Claude Code 之上构建的自定义界面。它允许调用进程在工具调用处暂停 Claude，通过自身界面收集输入，然后从暂停处继续执行。Claude Code 仅在使用 `-p` 标志的[非交互模式](/zh/headless)下遵循此值。在交互式会话中，它会记录警告并忽略钩子结果。

  `defer` 值需要 Claude Code v2.1.89 或更高版本。早期版本无法识别该值，工具会按正常权限流程执行。

`AskUserQuestion` 工具是典型场景：Claude 需要向用户提问，但没有可用的终端来接收回答。完整交互流程如下：

1. Claude 调用 `AskUserQuestion`。`PreToolUse` 钩子触发。
2. 钩子返回 `permissionDecision: "defer"`。工具不执行。进程以 `stop_reason: "tool_deferred"` 退出，并在对话记录中保留待处理的工具调用。
3. 调用进程从 SDK 结果中读取 `deferred_tool_use`，在其自身界面中展示问题，并等待用户回答。
4. 调用进程执行 `claude -p --resume <session-id>`。同一工具调用再次触发 `PreToolUse` 钩子。
5. 钩子返回 `permissionDecision: "allow"` 并在 `updatedInput` 中包含答案。工具执行，Claude 继续运行。

`deferred_tool_use` 字段包含工具的 `id`、`name` 和 `input`。其中 `input` 是 Claude 为工具调用生成的参数，在执行前被捕获：
```json
{
  "type": "result",
  "subtype": "success",
  "stop_reason": "tool_deferred",
  "session_id": "abc123",
  "deferred_tool_use": {
    "id": "toolu_01abc",
    "name": "AskUserQuestion",
    "input": { "questions": [{ "question": "Which framework?", "header": "Framework", "options": [{"label": "React"}, {"label": "Vue"}], "multiSelect": false }] }
  }
}
```
没有超时或重试限制。会话会保留在磁盘上，直到您恢复它，但受 [`cleanupPeriodDays`](/zh/settings#available-settings) 保留策略的约束，默认会在 30 天后删除会话文件。如果在恢复时答案尚未准备就绪，钩子可以再次返回 `"defer"`，进程会以相同方式退出。调用进程通过最终从钩子返回 `"allow"` 或 `"deny"` 来控制何时中断循环。

`"defer"` 仅当 Claude 在轮次中执行单次工具调用时有效。如果 Claude 同时执行多次工具调用，`"defer"` 将被忽略并显示警告，工具将按照正常权限流继续。此限制存在是因为恢复只能重新运行一个工具：无法在不遗留其他调用未解决的情况下，从一批调用中延迟单个调用。

如果在恢复时被延迟的工具不再可用，进程将在钩子触发前退出，并返回 `stop_reason: "tool_deferred_unavailable"` 和 `is_error: true`。当提供该工具的 MCP 服务器在恢复的会话中未连接时，就会发生这种情况。`deferred_tool_use` 载荷仍会包含在内，以便您识别哪个工具缺失了。

  `--resume` 会恢复工具被延迟时处于活动状态的权限模式，因此您无需再次传递 `--permission-mode`。例外情况是 `plan` 和 `bypassPermissions`，它们永远不会被继承。在恢复时显式传递 `--permission-mode` 会覆盖已恢复的值。

### PermissionRequest

当用户看到权限对话框时运行。
使用 [PermissionRequest 决策控制](#permissionrequest) 来代表用户允许或拒绝。

基于工具名称匹配，其值与 PreToolUse 相同。

#### PermissionRequest 输入

PermissionRequest 钩子接收 `tool_name` 和 `tool_input` 字段，与 PreToolUse 钩子类似，但不包含 `tool_use_id`。一个可选的 `permission_suggestions` 数组包含用户通常在权限对话框中看到的“始终允许”选项。区别在于钩子触发时机：PermissionRequest 钩子在权限对话框即将向用户显示时运行，而 PreToolUse 钩子无论权限状态如何都在工具执行前运行。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf node_modules",
    "description": "Remove node_modules directory"
  },
  "permission_suggestions": [
    {
      "type": "addRules",
      "rules": [{ "toolName": "Bash", "ruleContent": "rm -rf node_modules" }],
      "behavior": "allow",
      "destination": "localSettings"
    }
  ]
}
```
#### 权限请求决策控制

`PermissionRequest` 钩子可以允许或拒绝权限请求。除了所有钩子都可用的 [JSON 输出字段](#json-输出)外，您的钩子脚本还可以返回一个包含以下事件特定字段的 `decision` 对象：

| 字段                 | 描述                                                                                                                                                                                                                              |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `behavior`           | `"allow"` 授予权限，`"deny"` 拒绝权限。[拒绝和询问规则](/zh/permissions#manage-permissions)仍会被评估，因此返回 `"allow"` 的钩子不会覆盖匹配的拒绝规则                                                                               |
| `updatedInput`       | 仅适用于 `"allow"`：在执行前修改工具的输入参数。会替换整个输入对象，因此需将未修改字段与修改后的字段一同包含。修改后的输入会重新针对拒绝和询问规则进行评估                                                                          |
| `updatedPermissions` | 仅适用于 `"allow"`：要应用的[权限更新条目]数组，例如添加允许规则或更改会话权限模式                                                                                                                       |
| `message`            | 仅适用于 `"deny"`：告知 Claude 权限被拒绝的原因                                                                                                                                                                                    |
| `interrupt`          | 仅适用于 `"deny"`：如果为 `true`，则停止 Claude                                                                                                                                                                                    |
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```
#### 权限更新条目

`updatedPermissions` 输出字段和 [`permission_suggestions` 输入字段](#permissionrequest) 使用相同的条目对象数组。每个条目都有一个 `type` 字段决定其其他字段，以及一个 `destination` 字段控制更改的写入目标。

| `type`              | 字段                               | 效果                                                                                                                                                                      |
| :------------------ | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addRules`          | `rules`, `behavior`, `destination` | 添加权限规则。`rules` 是一个 `{toolName, ruleContent?}` 对象数组。省略 `ruleContent` 可匹配整个工具。`behavior` 为 `"allow"`、`"deny"` 或 `"ask"` |
| `replaceRules`      | `rules`, `behavior`, `destination` | 用提供的 `rules` 替换 `destination` 处所有具有给定 `behavior` 的规则                                                                                   |
| `removeRules`       | `rules`, `behavior`, `destination` | 移除匹配给定 `behavior` 的规则                                                                                                                              |
| `setMode`           | `mode`, `destination`              | 更改权限模式。有效模式为 `default`、`auto`、`acceptEdits`、`dontAsk`、`bypassPermissions` 和 `plan`                                                   |
| `addDirectories`    | `directories`, `destination`       | 添加工作目录。`directories` 是一个路径字符串数组                                                                                                         |
| `removeDirectories` | `directories`, `destination`       | 移除工作目录                                                                                                                                                 |

  当会话以绕过模式启动时，`setMode` 配合 `bypassPermissions` 参数才会生效：即通过 `--dangerously-skip-permissions`、`--permission-mode bypassPermissions`、`--allow-dangerously-skip-permissions` 启动，或在设置中配置 `permissions.defaultMode: "bypassPermissions"`，且该模式未被 [`permissions.disableBypassPermissionsMode`](/zh/permissions#managed-settings) 禁用。否则更新将无操作。无论 `destination` 如何设置，`bypassPermissions` 永远不会被持久化为 `defaultMode`。

每个条目的 `destination` 字段决定更改是保持在内存中还是持久化到设置文件。

| `destination`     | 写入目标                                       |
| :---------------- | :---------------------------------------------- |
| `session`         | 仅内存，会话结束时丢弃                          |
| `localSettings`   | `.claude/settings.local.json`                   |
| `projectSettings` | `.claude/settings.json`                         |
| `userSettings`    | `~/.claude/settings.json`                       |

一个钩子可以将其接收到的某个 `permission_suggestions` 作为自身的 `updatedPermissions` 输出回显，这等同于用户在对话框中选择该“始终允许”选项。

### PostToolUse

在工具成功完成后立即运行。

按工具名称匹配，可选值与 PreToolUse 相同。

#### PostToolUse 输入

`PostToolUse` 钩子在工具成功执行后触发。输入包括 `tool_input`（发送给工具的参数）和 `tool_response`（工具返回的结果）。两者的具体模式取决于所用工具。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123...",
  "duration_ms": 12
}
```
| 字段         | 描述                                                                                                   |
| :------------ | :------------------------------------------------------------------------------------------------------------ |
| `duration_ms` | 可选。工具执行时间（毫秒）。不包括在权限提示和 PreToolUse 钩子中花费的时间 |

#### PostToolUse 决策控制

`PostToolUse` 钩子可以在工具执行后向 Claude 提供反馈。除了所有钩子均可用的 [JSON 输出字段](#json-输出) 外，您的钩子脚本还可以返回以下事件特定字段：

| 字段                  | 描述                                                                                                                        |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `decision`             | `"block"` 会将 `reason` 附加到工具结果旁边。Claude 仍然可以看到原始输出；要替换它，请使用 `updatedToolOutput` |
| `reason`               | 当 `decision` 为 `"block"` 时，向 Claude 显示的解释                                                                           |
| `additionalContext`    | 与工具结果一起添加到 Claude 上下文中的字符串。参见[为 Claude 添加上下文](#为-claude-添加上下文)                  |
| `updatedToolOutput`    | 在发送给 Claude 之前，用提供的值替换工具的输出。该值必须匹配工具的输出结构       |
| `updatedMCPToolOutput` | 仅替换 [MCP 工具](#匹配-mcp-工具) 的输出。首选 `updatedToolOutput`，它适用于所有工具                  |

下面的示例替换了一个 `Bash` 调用的输出。替换值匹配 `Bash` 工具的输出结构：
```
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Additional information for Claude",
    "updatedToolOutput": {
      "stdout": "[redacted]",
      "stderr": "",
      "interrupted": false,
      "isImage": false
    }
  }
}
```


  `updatedToolOutput` 仅改变 Claude 所看到的内容。当钩子触发时，工具已经运行完毕，因此任何已写入的文件、执行的命令或发送的网络请求都已生效。遥测数据（如 OpenTelemetry 工具跨度和分析事件）也会在钩子运行前捕获原始输出。要在工具运行前阻止或修改工具调用，请改用 [PreToolUse](#pretooluse) 钩子。

  替换值必须与工具的输出结构匹配。内置工具返回的是结构化对象而非纯字符串。例如，`Bash` 返回一个包含 `stdout`、`stderr`、`interrupted` 和 `isImage` 字段的对象。对于内置工具，不符合工具输出模式的值会被忽略，并使用原始输出。MCP 工具的输出会直接传递，不进行模式验证。剥离 Claude 需要的错误详情可能导致其基于错误假设继续操作。

### PostToolUseFailure

当工具执行失败时运行。此事件适用于抛出错误或返回失败结果的工具调用。可用于记录失败、发送警报或向 Claude 提供纠正反馈。

匹配工具名称，值与 `PreToolUse` 相同。

#### PostToolUseFailure 输入

PostToolUseFailure 钩子接收与 `PostToolUse` 相同的 `tool_name` 和 `tool_input` 字段，以及作为顶级字段的错误信息：
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  },
  "tool_use_id": "toolu_01ABC123...",
  "error": "Command exited with non-zero status code 1",
  "is_interrupt": false,
  "duration_ms": 4187
}
```
| 字段             | 描述                                                                                                      |
| :--------------- | :-------------------------------------------------------------------------------------------------------- |
| `error`          | 描述错误的字符串                                                                                          |
| `is_interrupt`   | 可选布尔值，指示失败是否由用户中断引起                                                                    |
| `duration_ms`    | 可选。工具执行时间（毫秒）。不包括权限提示和 PreToolUse 钩子中花费的时间                                  |

#### PostToolUseFailure 决策控制

`PostToolUseFailure` 钩子可在工具失败后为 Claude 提供上下文。除了所有钩子均可使用的 [JSON 输出字段](#json-输出)，您的钩子脚本还可以返回这些特定于事件的字段：

| 字段                | 描述                                                                                                  |
| :------------------ | :---------------------------------------------------------------------------------------------------- |
| `additionalContext` | 添加到 Claude 上下文中与错误并列的字符串。参见[为 Claude 添加上下文](#为-claude-添加上下文)         |
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUseFailure",
    "additionalContext": "Additional information about the failure for Claude"
  }
}
```
### PostToolBatch

在批次中的每个工具调用都解析完毕后、Claude Code 向模型发送下一个请求之前运行一次。`PostToolUse` 每个工具触发一次，这意味着当 Claude 进行并行工具调用时，它会同时触发。`PostToolBatch` 对整个批次只精确触发一次，因此它是注入依赖于所运行工具集合（而非任何单个工具）的上下文信息的合适位置。此事件没有匹配器。

#### PostToolBatch 输入

除了[通用输入字段](#通用输入字段)外，PostToolBatch 钩子接收 `tool_calls`，这是一个描述批次中每个工具调用的数组：
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolBatch",
  "tool_calls": [
    {
      "tool_name": "Read",
      "tool_input": {"file_path": "/.../ledger/accounts.py"},
      "tool_use_id": "toolu_01...",
      "tool_response": "     1\tfrom __future__ import annotations\n     2\t..."
    },
    {
      "tool_name": "Read",
      "tool_input": {"file_path": "/.../ledger/transactions.py"},
      "tool_use_id": "toolu_02...",
      "tool_response": "     1\tfrom __future__ import annotations\n     2\t..."
    }
  ]
}
```
`tool_response` 包含模型在对应的 `tool_result` 块中接收的相同内容。其值是一个序列化字符串或内容块数组，完全按照工具输出的格式。对于 `Read` 工具，这意味着返回的是带行号前缀的文本，而非原始文件内容。响应可能很大，因此只解析你需要的字段。

  `tool_response` 的格式与 `PostToolUse` 的不同。`PostToolUse` 传递的是工具的结构化 `Output` 对象，例如对 `Write` 工具会传递 `{filePath: "...", success: true}`；而 `PostToolBatch` 传递的是模型所看到的序列化 `tool_result` 内容。

#### PostToolBatch 决策控制

`PostToolBatch` 钩子可以为 Claude 注入上下文。除了所有钩子均可使用的 [JSON 输出字段](#json-输出) 外，您的钩子脚本可以返回以下特定于事件的字段：

| 字段                | 描述                                                                                                                                                                                                |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `additionalContext` | 在下一次模型调用前注入一次的上下文字符串。有关传递详情、应包含的内容以及恢复的会话如何处理过往值，请参阅[为 Claude 添加上下文](#为-claude-添加上下文)。                                               |
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolBatch",
    "additionalContext": "These files are part of the ledger module. Run pytest before marking the task complete."
  }
}
```
返回 `decision: "block"` 或 `continue: false` 会在下一次模型调用前停止智能体循环。

### PermissionDenied

当 [自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode) 分类器拒绝工具调用时运行。此钩子仅在自动模式下触发：当您手动拒绝权限对话框、当 `PreToolUse` 钩子阻止调用或当匹配到 `deny` 规则时，它不会运行。用它来记录分类器的拒绝、调整配置，或告知模型可以重试该工具调用。

基于工具名称进行匹配，取值与 PreToolUse 相同。

#### PermissionDenied 输入

除了[通用输入字段](#通用输入字段)，PermissionDenied 钩子还接收 `tool_name`、`tool_input`、`tool_use_id` 和 `reason`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "auto",
  "hook_event_name": "PermissionDenied",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/build",
    "description": "Clean build directory"
  },
  "tool_use_id": "toolu_01ABC123...",
  "reason": "Auto mode denied: command targets a path outside the project"
}
```
| 字段     | 描述                                             |
| :------- | :----------------------------------------------- |
| `reason` | 分类器解释该工具调用被拒绝的原因 |

#### 权限拒绝决策控制

权限拒绝钩子可以告知模型它或许可以重试被拒绝的工具调用。返回一个 JSON 对象，并将 `hookSpecificOutput.retry` 设置为 `true`：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionDenied",
    "retry": true
  }
}
```
当 `retry` 设为 `true` 时，Claude Code 会向对话添加一条消息，告知模型可以重试工具调用。但拒绝本身不会被撤销。若您的钩子未返回 JSON 或返回 `retry: false`，则拒绝维持不变，模型将收到原始拒绝消息。

### 通知类型

当 Claude Code 发送通知时触发。根据通知类型匹配：`permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`、`elicitation_complete`、`elicitation_response`。省略匹配器则会对所有通知类型执行钩子。

可使用独立匹配器根据不同通知类型运行不同处理程序。以下配置会在 Claude 需要权限审批时触发特定权限的警报脚本，并在 Claude 空闲时触发不同的通知：
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/permission-alert.sh"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/idle-notification.sh"
          }
        ]
      }
    ]
  }
}
```
#### 通知输入

除了[通用输入字段](#通用输入字段)外，通知钩子会接收包含通知文本的 `message`、可选的 `title`，以及指示触发类型的 `notification_type`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission",
  "title": "Permission needed",
  "notification_type": "permission_prompt"
}
```
通知钩子无法阻断或修改通知。它们主要用于实现副作用，例如将通知转发至外部服务。[通用 JSON 输出字段](#json-输出)（如 `systemMessage`）在此适用。

### SubagentStart

当通过 Agent 工具生成 Claude Code 子代理时触发。支持匹配器按代理类型名称进行过滤。对于内置代理，此为代理名称（如 `general-purpose`、`Explore` 或 `Plan`）。对于[自定义子代理](/zh/sub-agents)，此为代理 frontmatter 中的 `name` 字段，而非文件名。

#### SubagentStart 输入

除了[通用输入字段](#通用输入字段)外，SubagentStart 钩子会接收包含子代理唯一标识符的 `agent_id`，以及包含代理名称的 `agent_type`（内置代理如 `"general-purpose"`、`"Explore"`、`"Plan"`，或自定义代理名称）。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SubagentStart",
  "agent_id": "agent-abc123",
  "agent_type": "Explore"
}
```
SubagentStart钩子不能阻止子代理的创建，但可以为子代理注入上下文。除了所有钩子都可用的[JSON输出字段](#json-输出)外，你还可以返回：

| 字段                | 描述                                                                                                                                                   |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `additionalContext` | 在子代理对话开始时、首次提示词之前添加到子代理上下文中的字符串。详见[为Claude添加上下文](#为-claude-添加上下文)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Follow security guidelines for this task"
  }
}
```
### 子代理停止

当 Claude Code 子代理完成响应时运行。根据代理类型进行匹配，值与子代理启动时相同。

#### 子代理停止输入

除了[通用输入字段](#通用输入字段)外，子代理停止钩子还会接收 `stop_hook_active`、`agent_id`、`agent_type`、`agent_transcript_path` 和 `last_assistant_message`。`agent_type` 字段是用于匹配器过滤的值。`transcript_path` 是主会话的记录，而 `agent_transcript_path` 是子代理自身的记录，存储在嵌套的 `subagents/` 文件夹中。`last_assistant_message` 字段包含子代理最终响应的文本内容，因此钩子可以访问它而无需解析记录文件。

子代理停止钩子还会接收在[停止输入](#停止输入)中描述的 `background_tasks` 和 `session_crons` 数组，在 Claude Code v2.1.145 或更高版本中可用。这两个数组的作用域是父会话，而非子代理。
```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl",
  "last_assistant_message": "Analysis complete. Found 3 potential issues...",
  "background_tasks": [],
  "session_crons": []
}
```
子代理停止钩子使用与[停止钩子](#停止决策控制)相同的决策控制格式。它们不支持 `additionalContext`。返回 `decision: "block"` 配合 `reason` 会保持子代理运行，并将 `reason` 作为下一条指令传递给子代理。要在子代理返回后向父会话注入上下文，应改为使用 `Agent` 工具上的 [`PostToolUse`](#posttooluse) 钩子。

### TaskCreated

在通过 `TaskCreate` 工具创建任务时运行。可用于强制执行命名规范、要求任务描述或阻止创建特定任务。

当 `TaskCreated` 钩子以代码 2 退出时，任务不会被创建，且 stderr 消息将作为反馈提供给模型。要完全停止队友而非重新运行，需返回 JSON `{"continue": false, "stopReason": "..."}`。TaskCreated 钩子不支持匹配器，且每次触发都会执行。

#### TaskCreated 输入

除了[通用输入字段](#通用输入字段)外，TaskCreated 钩子还会接收 `task_id`、`task_subject`，以及可选的 `task_description`、`teammate_name` 和 `team_name`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCreated",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```
| 字段                 | 描述                                           |
| :----------------- | :---------------------------------------------------- |
| `task_id`          | 正在创建的任务的标识符                  |
| `task_subject`     | 任务标题                                     |
| `task_description` | 任务的详细描述。可能不存在       |
| `teammate_name`    | 创建任务的队友姓名。可能不存在 |
| `team_name`        | 团队名称。可能不存在                       |

#### TaskCreated 决策控制

TaskCreated 钩子支持两种控制任务创建的方式：

* **退出码 2**：任务不会被创建，并且标准错误输出消息会作为反馈提供给模型。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止队友，匹配 `Stop` 钩子行为。`stopReason` 会显示给用户。

此示例会阻止那些主题不符合所需格式的任务：
```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if [[ ! "$TASK_SUBJECT" =~ ^\[TICKET-[0-9]+\] ]]; then
  echo "Task subject must start with a ticket number, e.g. '[TICKET-123] Add feature'" >&2
  exit 2
fi

exit 0
```
### TaskCompleted

当任务被标记为完成时运行。此钩子在两种情况下触发：当任何代理通过 TaskUpdate 工具显式标记任务为完成时，或当某个[代理团队](/zh/agent-teams)成员在其回合中仍有进行中任务但回合结束时。使用此钩子可在任务关闭前强制执行完成标准，例如通过测试或代码检查。

当 `TaskCompleted` 钩子以代码 2 退出时，任务不会被标记为完成，且 stderr 消息将作为反馈提供给模型。若要停止队友而不是重新运行，请返回包含 `{"continue": false, "stopReason": "..."}` 的 JSON。TaskCompleted 钩子不支持匹配器，且在每次发生时触发。

#### TaskCompleted 输入

除了[通用输入字段](#通用输入字段)外，TaskCompleted 钩子还会接收 `task_id`、`task_subject`，以及可选的 `task_description`、`teammate_name` 和 `team_name`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```
| Field              | Description                                             |
| :----------------- | :------------------------------------------------------ |
| `task_id`          | 正在完成的任务的标识符                                   |
| `task_subject`     | 任务的标题                                              |
| `task_description` | 任务的详细描述。可能不存在                               |
| `teammate_name`    | 完成任务的队友名称。可能不存在                           |
| `team_name`        | 团队名称。可能不存在                                     |

#### TaskCompleted 决策控制

TaskCompleted 钩子支持两种控制任务完成的方式：

* **退出码 2**：任务不会被标记为完成，并且标准错误消息会作为反馈提供给模型。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止队友，匹配 `Stop` 钩子行为。`stopReason` 会显示给用户。

这个示例运行测试，并在失败时阻止任务完成：
```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

# Run the test suite
if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi

exit 0
```
### 停止

当主 Claude Code 代理完成响应时运行。如果停止是由用户中断引起的，则不会运行。API 错误会触发 [StopFailure] 钩子。

  [`/goal`](/zh/goal) 命令是一个内置快捷命令，用于在会话作用域内基于提示词的停止钩子。当您希望 Claude 在条件满足前持续工作且无需编写钩子配置时，可以使用它。

#### 停止输入

除了[通用输入字段](#通用输入字段)外，停止钩子还会接收 `stop_hook_active`、`last_assistant_message`、`background_tasks` 和 `session_crons`。当 Claude Code 已经因为一个停止钩子而继续运行时，`stop_hook_active` 字段为 `true`。请检查此值或处理会话记录，以避免在一个永远无法满足的条件上阻塞。在连续 8 次阻塞后，Claude Code 会覆盖钩子并结束本轮。

`last_assistant_message` 字段包含 Claude 最终响应的文本内容，因此钩子无需解析会话记录文件即可访问它。

`background_tasks` 和 `session_crons` 数组（在 Claude Code v2.1.145 或更高版本中可用）让钩子能够区分"会话已完成"和"会话已暂停，等待后台工作将其唤醒"。当任务注册表可访问时，这两个数组都存在；当没有正在进行或已计划的任务时，它们为空。

`background_tasks` 中的每个条目描述一个正在运行的任务，使用以下字段：

| 字段          | 描述                                                                                                                                                                                                                                              |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | 任务标识符                                                                                                                                                                                                                                        |
| `type`        | 友好的任务类型标签，例如 `shell`、`subagent`、`monitor`、`workflow`、`teammate`、`cloud session` 或 `MCP task`。每个标签标识了创建该任务的 Claude Code 功能。对于无法识别的类型，则回退到原始判别值 |
| `status`      | 当前任务状态                                                                                                                                                                                                                                      |
| `description` | 自由文本描述，上限为 1000 个字符，截断时会在字符串内显示 `… [+N chars]` 标记                                                                                                                                                                      |
| `command`     | Shell 命令行，上限为 1000 个字符。仅适用于 `shell` 任务                                                                                                                                                                                           |
| `agent_type`  | 子代理类型名称。仅适用于 `subagent` 任务                                                                                                                                                                                                          |
| `server`      | MCP 服务器名称。仅适用于 `monitor` 和 `MCP task` 任务                                                                                                                                                                                             |
| `tool`        | MCP 工具名称。仅适用于 `monitor` 和 `MCP task` 任务                                                                                                                                                                                               |
| `name`        | 工作流名称。仅适用于 `workflow` 任务                                                                                                                                                                                                              |

`session_crons` 中的每个条目描述一个会话范围内的计划唤醒，来源为 `CronCreate`、`ScheduleWakeup` 和 `/loop`：

| 字段        | 描述                                                                                                    |
| :---------- | :------------------------------------------------------------------------------------------------------ |
| `id`        | Cron 任务标识符                                                                                         |
| `schedule`  | Cron 表达式，例如 `0 9 * * 1-5`                                                                         |
| `recurring` | 对于计划仅执行一次的唤醒，其值为 `false`；对于每次匹配都重新触发的任务，其值为 `true`                     |
| `prompt`    | Cron 触发时提交的提示词，上限为 1000 个字符，使用相同的 `… [+N chars]` 标记                               |

此示例展示了一个包含一个正在运行的 shell 任务和一个循环 cron 的停止输入：
```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true,
  "last_assistant_message": "I've completed the refactoring. Here's a summary...",
  "background_tasks": [
    {
      "id": "task-001",
      "type": "shell",
      "status": "running",
      "description": "tail logs",
      "command": "tail -f /var/log/syslog"
    }
  ],
  "session_crons": [
    {
      "id": "cron-001",
      "schedule": "0 9 * * 1-5",
      "recurring": true,
      "prompt": "check the build"
    }
  ]
}
```
#### 停止决策控制

`Stop` 和 `SubagentStop` 钩子可以控制 Claude 是否继续。除了所有钩子都可用的 [JSON 输出字段](#json-输出) 之外，您的钩子脚本还可以返回这些特定于事件的字段：

| 字段       | 描述                                                                |
| :--------- | :------------------------------------------------------------------------- |
| `decision` | `"block"` 会阻止 Claude 停止。省略则允许 Claude 停止。      |
| `reason`   | 当 `decision` 为 `"block"` 时必填。告知 Claude 为何应继续。 |
```json
{
  "decision": "block",
  "reason": "Must be provided when Claude is blocked from stopping"
}
```
### StopFailure

当轮次因 API 错误而结束时，会运行此钩子而非 [Stop](#停止)。输出和退出代码会被忽略。当 Claude 因速率限制、身份验证问题或其他 API 错误无法完成响应时，可使用此钩子来记录失败、发送警报或采取恢复操作。

#### StopFailure 输入

除了[通用输入字段](#通用输入字段)之外，StopFailure 钩子还会接收 `error`、可选的 `error_details` 以及可选的 `last_assistant_message`。`error` 字段标识错误类型，用于匹配过滤。

| 字段                     | 描述                                                                                                                                                                                                                                       |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`                  | 错误类型：`rate_limit`、`authentication_failed`、`oauth_org_not_allowed`、`billing_error`、`invalid_request`、`model_not_found`、`server_error`、`max_output_tokens` 或 `unknown`                                                              |
| `error_details`          | 关于错误的附加详情（如有）                                                                                                                                                                                                              |
| `last_assistant_message` | 对话中显示的已渲染错误文本。与 `Stop` 和 `SubagentStop` 钩子（此字段包含 Claude 的对话输出）不同，对于 `StopFailure`，它包含的是 API 错误字符串本身，例如 `"API Error: Rate limit reached"`                                                |
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "StopFailure",
  "error": "rate_limit",
  "error_details": "429 Too Many Requests",
  "last_assistant_message": "API Error: Rate limit reached"
}
```
停止失败钩子不具备决策控制能力，它们仅用于通知和日志记录目的。

### TeammateIdle

当[代理团队](/zh/agent-teams)中的团队成员在完成其轮次后即将进入空闲状态时触发。可用于在团队成员停止工作前实施质量门控，例如要求通过 lint 检查或验证输出文件是否存在。

当 `TeammateIdle` 钩子以退出码 2 退出时，团队成员将收到标准错误消息作为反馈，并继续工作而非进入空闲状态。若要彻底停止团队成员而非重新运行，可返回包含 `{"continue": false, "stopReason": "..."}` 的 JSON。TeammateIdle 钩子不支持匹配器，会在每次事件发生时触发。

#### TeammateIdle 输入

除了[通用输入字段](#通用输入字段)外，TeammateIdle 钩子还会接收 `teammate_name` 和 `team_name`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project"
}
```
| 字段            | 描述                               |
| :-------------- | :--------------------------------- |
| `teammate_name` | 即将进入闲置状态的队友名称         |
| `team_name`     | 团队名称                           |

#### TeammateIdle 决策控制

TeammateIdle 钩子支持两种控制队友行为的方式：

* **退出代码 2**：队友将标准错误消息作为反馈接收，并继续工作而非进入闲置状态。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止该队友，行为与 `Stop` 钩子相同。`stopReason` 会显示给用户。

以下示例会在允许队友进入闲置状态前，检查是否存在构建产物：
```bash
#!/bin/bash

if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi

exit 0
```
### 配置更改

当会话期间配置文件发生变化时触发。可用于审计设置变更、强制执行安全策略，或阻止对配置文件的未授权修改。

配置更改钩子会在设置文件、托管策略设置和技能文件发生变更时触发。输入中的 `source` 字段表明变更的配置类型，可选的 `file_path` 字段提供被修改文件的路径。

匹配器根据配置来源进行过滤：

| 匹配器               | 触发时机                              |
| :------------------- | :------------------------------------ |
| `user_settings`      | `~/.claude/settings.json` 发生变更    |
| `project_settings`   | `.claude/settings.json` 发生变更      |
| `local_settings`     | `.claude/settings.local.json` 发生变更 |
| `policy_settings`    | 托管策略设置发生变更                   |
| `skills`             | `.claude/skills/` 中的技能文件发生变更 |

此示例记录所有配置变更以用于安全审计：
```json
{
  "hooks": {
    "ConfigChange": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/audit-config-change.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```
#### ConfigChange 输入

除了[通用输入字段](#通用输入字段)外，ConfigChange 钩子还会接收 `source` 字段，并可选地接收 `file_path` 字段。`source` 字段指明哪种配置类型发生了更改，`file_path` 则提供了被修改的具体文件路径。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "ConfigChange",
  "source": "project_settings",
  "file_path": "/Users/.../my-project/.claude/settings.json"
}
```
#### ConfigChange 决策控制

ConfigChange 钩子可以阻止配置变更生效。使用退出码 2 或 JSON `decision` 可以阻止变更。当被阻止时，新的设置不会应用到运行中的会话。

| 字段       | 描述                                                                                   |
| :--------- | :------------------------------------------------------------------------------------- |
| `decision` | `"block"` 会阻止配置变更被应用。省略此字段则允许变更生效                               |
| `reason`   | 当 `decision` 为 `"block"` 时，会向用户显示此解释                                      |
```json
{
  "decision": "block",
  "reason": "Configuration changes to project settings require admin approval"
}
```
`policy_settings` 的变更无法被拦截。钩子仍会为 `policy_settings` 来源触发，因此您可以将其用于审计日志记录，但任何拦截决定都会被忽略。这确保了企业托管的设置始终生效。

### CwdChanged

当会话期间工作目录发生变化时运行（例如，当 Claude 执行 `cd` 命令时）。利用此钩子可对目录变更做出响应：重新加载环境变量、激活特定项目的工具链，或自动运行设置脚本。它可与 [FileChanged](#filechanged) 配合使用，适用于诸如 [direnv](https://direnv.net/) 这类管理按目录划分的环境的工具。

CwdChanged 钩子可以访问 `CLAUDE_ENV_FILE`。写入该文件的变量会在该会话后续的 Bash 命令中持续存在，正如 [SessionStart 钩子](#持久化环境变量) 中一样。

CwdChanged 不支持匹配器，并且会在每次目录变更时触发。

#### CwdChanged 输入

除了[通用输入字段](#通用输入字段)外，CwdChanged 钩子还会接收 `old_cwd` 和 `new_cwd`。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project/src",
  "hook_event_name": "CwdChanged",
  "old_cwd": "/Users/my-project",
  "new_cwd": "/Users/my-project/src"
}
```
#### CwdChanged 输出

除了所有钩子都可用的 [JSON 输出字段](#json-输出) 外，CwdChanged 钩子还可以返回 `watchPaths` 以动态设置 [FileChanged](#filechanged) 监视的文件路径：

| 字段         | 描述                                                                                                                                       |
| :----------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `watchPaths` | 绝对路径数组。将替换当前的动态监视列表（来自您 `matcher` 配置的路径将始终被监视）。返回一个空数组将清空动态列表，这通常在进入新目录时进行 |

CwdChanged 钩子没有决策控制。它们无法阻止目录更改。

### FileChanged

当被监视的文件在磁盘上发生更改时运行。当项目配置文件被修改时，此功能可用于重新加载环境变量。

此事件的 `matcher` 具有两个作用：

* **构建监视列表**：该值按 `|` 分割，每段都作为工作目录中的一个字面文件名被注册，因此 `".envrc|.env"` 会精确监视这两个文件。正则表达式模式在此处没有用：像 `^\.env` 这样的值会监视一个字面上名为 `^\.env` 的文件。
* **过滤运行的钩子**：当被监视的文件发生更改时，相同的值会使用标准的 [匹配器规则](#匹配器模式) 针对被更改文件的基名来过滤哪些钩子组运行。

FileChanged 钩子可以访问 `CLAUDE_ENV_FILE`。写入该文件的变量将持久保存到会话后续的 Bash 命令中，就像在 [SessionStart 钩子](#持久化环境变量) 中一样。

#### FileChanged 输入

除了 [公共输入字段](#通用输入字段) 外，FileChanged 钩子还会接收 `file_path` 和 `event`。

| 字段        | 描述                                                                                         |
| :---------- | :------------------------------------------------------------------------------------------- |
| `file_path` | 发生更改的文件的绝对路径                                                                     |
| `event`     | 发生了什么：`"change"`（文件已修改）、`"add"`（文件已创建）或 `"unlink"`（文件已删除）       |
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "FileChanged",
  "file_path": "/Users/my-project/.envrc",
  "event": "change"
}
```
#### FileChanged 输出

除了所有钩子通用的 [JSON 输出字段](#json-输出) 之外，FileChanged 钩子可以返回 `watchPaths` 来动态更新受监视的文件路径：

| 字段         | 描述                                                                                                                                                                                                                        |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `watchPaths` | 绝对路径数组。这将替换当前的动态监视列表（来自 `matcher` 配置的路径将始终被监视）。当你的钩子脚本根据已更改的文件发现需要额外监视的文件时，请使用此功能 |

FileChanged 钩子没有决策控制权。它们无法阻止文件变更的发生。

### WorktreeCreate

当你运行 `claude --worktree` 或[子代理使用 `isolation: "worktree"`](/zh/sub-agents#choose-the-subagent-scope) 时，Claude Code 会使用 `git worktree` 创建一个隔离的工作副本。如果你配置了 WorktreeCreate 钩子，它会替换默认的 git 行为，让你可以使用其他版本控制系统，如 SVN、Perforce 或 Mercurial。

由于钩子完全替换了默认行为，[`.worktreeinclude`](/zh/worktrees#copy-gitignored-files-into-worktrees) 不会被处理。如果你需要将 `.env` 等本地配置文件复制到新的工作树中，请在你的钩子脚本内完成此操作。

钩子必须返回创建的工作树目录的绝对路径。Claude Code 将此路径用作隔离会话的工作目录。命令钩子在标准输出上打印该路径；HTTP 钩子通过 `hookSpecificOutput.worktreePath` 返回该路径。

此示例创建一个 SVN 工作副本并打印路径供 Claude Code 使用。请将仓库 URL 替换为你自己的：
```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```
钩子从标准输入的JSON输入中读取工作树 `name`，将其检出到新目录，并输出该目录路径。最后一行的 `echo` 内容是Claude Code读取的工作树路径。请将其他输出重定向到标准错误，以免干扰路径读取。

#### WorktreeCreate输入

除[公共输入字段](#通用输入字段)外，WorktreeCreate钩子还会接收 `name` 字段。这是新工作树的短标识符，可由用户指定或自动生成（例如 `bold-oak-a3f2`）。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeCreate",
  "name": "feature-auth"
}
```
#### WorktreeCreate 输出

WorktreeCreate 钩子不使用标准的允许/阻止决策模型。相反，钩子的成功或失败决定了结果。钩子必须返回所创建工作树目录的绝对路径：

* **命令钩子** (`type: "command"`): 在标准输出中打印路径。
* **HTTP 钩子** (`type: "http"`): 在响应体中返回 `{ "hookSpecificOutput": { "hookEventName": "WorktreeCreate", "worktreePath": "/absolute/path" } }`。

如果钩子失败或未产生路径，工作树创建将失败并报错。

### WorktreeRemove

这是 [WorktreeCreate](#worktreecreate) 的清理对应项。当一个工作树正在被移除时——无论是在退出 `--worktree` 会话时选择移除它，还是在使用 `isolation: "worktree"` 的子代理完成后——此钩子都会触发。对于基于 git 的工作树，Claude 会自动使用 `git worktree remove` 进行清理。如果你为非 git 版本控制系统配置了 WorktreeCreate 钩子，请将其与 WorktreeRemove 钩子配对以处理清理。如果没有 WorktreeRemove 钩子，工作树目录将留在磁盘上。

Claude Code 将 WorktreeCreate 返回的路径作为钩子输入中的 `worktree_path` 传递。此示例读取该路径并移除目录：
```json
{
  "hooks": {
    "WorktreeRemove": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'jq -r .worktree_path | xargs rm -rf'"
          }
        ]
      }
    ]
  }
}
```
#### WorktreeRemove 输入

除了[通用输入字段](#通用输入字段)外，WorktreeRemove 钩子还会接收 `worktree_path` 字段，该字段是被移除的工作树的绝对路径。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeRemove",
  "worktree_path": "/Users/.../my-project/.claude/worktrees/feature-auth"
}
```
WorktreeRemove 钩子没有决策控制权。它们无法阻止工作树的移除，但可以执行清理任务，例如移除版本控制状态或归档变更。钩子失败仅在调试模式下记录。

### PreCompact

在 Claude Code 即将执行紧凑操作之前运行。

匹配器值指示紧凑操作是手动触发还是自动触发：

| 匹配器   | 触发时机                                |
| :------- | :------------------------------------------- |
| `manual` | 执行 `/compact` 命令时                                   |
| `auto`   | 当上下文窗口满时自动进行紧凑操作 |

以代码 2 退出可阻止紧凑操作。对于手动的 `/compact` 命令，标准错误消息将显示给用户。您也可以通过返回包含 `"decision": "block"` 的 JSON 来阻止。

阻止自动紧凑操作的效果取决于其触发时间。如果在达到上下文限制之前主动触发了紧凑操作，Claude Code 将跳过它，对话将继续且不进行紧凑。如果紧凑操作是在 API 已返回上下文限制错误后为恢复而触发的，则底层错误将浮出水面，当前请求将失败。

#### PreCompact 输入

除了[通用输入字段](#通用输入字段)外，PreCompact 钩子还会接收 `trigger` 和 `custom_instructions`。对于 `manual` 类型，`custom_instructions` 包含用户传入 `/compact` 的内容。对于 `auto` 类型，`custom_instructions` 为空。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PreCompact",
  "trigger": "manual",
  "custom_instructions": ""
}
```
### PostCompact

在 Claude Code 完成压缩操作后运行。可使用此事件响应新的压缩状态，例如记录生成的摘要或更新外部状态。

匹配值与 `PreCompact` 相同：

| 匹配器   | 触发时机                   |
| :------- | :------------------------- |
| `manual` | 执行 `/compact` 命令后     |
| `auto`   | 上下文窗口满时自动压缩后 |

#### PostCompact 输入

除[通用输入字段](#通用输入字段)外，PostCompact 钩子还接收 `trigger` 和 `compact_summary`。`compact_summary` 字段包含压缩操作生成的对话摘要。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PostCompact",
  "trigger": "manual",
  "compact_summary": "Summary of the compacted conversation..."
}
```
PostCompact 钩子不具备决策控制权。它们无法影响压缩结果，但可执行后续任务。

### SessionEnd

在 Claude Code 会话结束时运行。适用于清理任务、记录会话统计信息或保存会话状态。支持通过匹配器按退出原因进行筛选。

钩子输入中的 `reason` 字段表示会话结束的原因：

| 原因                        | 描述                                |
| :---------------------------- | :----------------------------------------- |
| `clear`                       | 通过 `/clear` 命令清除会话      |
| `resume`                      | 通过交互式 `/resume` 切换会话 |
| `logout`                      | 用户已登出                            |
| `prompt_input_exit`           | 用户在提示词输入可见时退出 |
| `bypass_permissions_disabled` | 绕过权限模式已禁用       |
| `other`                       | 其他退出原因                         |

#### SessionEnd 输入

除[通用输入字段](#通用输入字段)外，SessionEnd 钩子还会接收一个 `reason` 字段，指示会话结束的原因。所有可能的值请参阅上方的[原因表](#sessionend)。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```
SessionEnd 钩子没有决策控制权。它们无法阻止会话终止，但可以执行清理任务。

SessionEnd 钩子的默认超时时间为 1.5 秒。此设置适用于会话退出、`/clear` 命令执行以及通过交互式 `/resume` 切换会话的场景。如果钩子需要更长时间，可在钩子配置中为单个钩子设置 `timeout`。总预算将自动提升至配置文件中设置的单个钩子最大超时值，最高不超过 60 秒。插件提供的钩子设置的超时不会提升总预算。要显式覆盖预算，请设置环境变量 `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS`（单位：毫秒）。
```bash
CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=5000 claude
```
### 信息获取

在MCP服务器于任务中途请求用户输入时运行。默认情况下，Claude Code会显示一个交互式对话框供用户响应。钩子可以拦截此请求并以程序化方式响应，从而完全跳过对话框。

匹配器字段与MCP服务器名称进行匹配。

#### 信息获取输入

除了[通用输入字段](#通用输入字段)外，信息获取钩子还会接收到`mcp_server_name`、`message`，以及可选的`mode`、`url`、`elicitation_id`和`requested_schema`字段。

对于表单模式的信息获取（最常见的情况）：
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please provide your credentials",
  "mode": "form",
  "requested_schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "title": "Username" }
    }
  }
}
```
对于URL模式引导（基于浏览器的认证）：
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please authenticate",
  "mode": "url",
  "url": "https://auth.example.com/login"
}
```
#### 引出输出

若要以编程方式响应而不显示对话框，请返回包含 `hookSpecificOutput` 的 JSON 对象：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "Elicitation",
    "action": "accept",
    "content": {
      "username": "alice"
    }
  }
}
```
| 字段        | 值                          | 描述                                                                 |
| :---------- | :-------------------------- | :------------------------------------------------------------------- |
| `action`    | `accept`, `decline`, `cancel` | 是接受、拒绝还是取消请求                                             |
| `content`   | object                      | 要提交的表单字段值。仅在 `action` 为 `accept` 时使用                 |

退出码 2 拒绝该征询并向用户显示标准错误。

### ElicitationResult

在用户响应 MCP 征询后运行。钩子可以观察、修改或阻止该响应，然后将其发送回 MCP 服务器。

匹配器字段会与 MCP 服务器名称进行匹配。

#### ElicitationResult 输入

除了[公共输入字段](#通用输入字段)外，ElicitationResult 钩子会接收 `mcp_server_name`、`action`，以及可选的 `mode`、`elicitation_id` 和 `content` 字段。
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "ElicitationResult",
  "mcp_server_name": "my-mcp-server",
  "action": "accept",
  "content": { "username": "alice" },
  "mode": "form",
  "elicitation_id": "elicit-123"
}
```
#### ElicitationResult 输出

要覆盖用户的响应，请返回一个包含 `hookSpecificOutput` 的 JSON 对象：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "ElicitationResult",
    "action": "decline",
    "content": {}
  }
}
```
| 字段      | 值                            | 描述                                                                   |
| :-------- | :---------------------------- | :--------------------------------------------------------------------- |
| `action`  | `accept`、`decline`、`cancel` | 覆盖用户的操作                                                         |
| `content` | object                        | 覆盖表单字段值。仅在 `action` 为 `accept` 时有效                        |

退出代码 2 会阻断响应，将有效操作更改为 `decline`。

## 基于提示词的钩子

除了命令、HTTP 和 MCP 工具钩子外，Claude Code 还支持使用 LLM 来评估是否允许或阻止操作的基于提示词的钩子（`type: "prompt"`），以及生成具有工具访问权限的代理验证器的代理钩子（`type: "agent"`）。并非所有事件都支持每种钩子类型。

支持全部五种钩子类型（`command`、`http`、`mcp_tool`、`prompt` 和 `agent`）的事件：

* `PermissionDenied`
* `PermissionRequest`
* `PostToolBatch`
* `PostToolUse`
* `PostToolUseFailure`
* `PreToolUse`
* `Stop`
* `SubagentStop`
* `TaskCompleted`
* `TaskCreated`
* `TeammateIdle`
* `UserPromptExpansion`
* `UserPromptSubmit`

支持 `command`、`http` 和 `mcp_tool` 钩子，但不支持 `prompt` 或 `agent` 钩子的事件：

* `ConfigChange`
* `CwdChanged`
* `Elicitation`
* `ElicitationResult`
* `FileChanged`
* `InstructionsLoaded`
* `Notification`
* `PostCompact`
* `PreCompact`
* `SessionEnd`
* `StopFailure`
* `SubagentStart`
* `WorktreeCreate`
* `WorktreeRemove`

`SessionStart` 和 `Setup` 支持 `command` 和 `mcp_tool` 钩子。它们不支持 `http`、`prompt` 或 `agent` 钩子。

### 基于提示词的钩子如何工作

基于提示词的钩子不执行 Bash 命令，而是：

1.  将钩子输入和您的提示词发送到一个 Claude 模型（默认为 Haiku）
2.  LLM 返回包含决策的结构化 JSON
3.  Claude Code 自动处理该决策

### 提示词钩子配置

将 `type` 设置为 `"prompt"` 并提供 `prompt` 字符串，而不是 `command`。使用 `$ARGUMENTS` 占位符将钩子的 JSON 输入数据注入到您的提示词文本中。Claude Code 将组合后的提示词和输入发送给一个快速的 Claude 模型，该模型返回一个 JSON 决策。

这个 `Stop` 钩子要求 LLM 在允许 Claude 完成之前评估所有任务是否完成：
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete."
          }
        ]
      }
    ]
  }
}
```
| 字段              | 必需 | 描述                                                                                                                                                                                                                                                                                                                                 |
| :---------------- | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | 是   | 必须为 `"prompt"`                                                                                                                                                                                                                                                                                                                    |
| `prompt`          | 是   | 发送给 LLM 的提示词文本。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符。如果未使用 `$ARGUMENTS`，输入 JSON 将附加到提示词末尾。                                                                                                                                                                                                         |
| `model`           | 否   | 用于评估的模型。默认为一个快速模型。                                                                                                                                                                                                                                                                                                 |
| `timeout`         | 否   | 超时时间（秒）。默认值：30                                                                                                                                                                                                                                                                                                           |
| `continueOnBlock` | 否   | 当提示词返回 `ok: false` 时，将原因反馈给 Claude 并继续当前轮次，而不是停止。默认值：`false`。实现方式是在产生的 `decision: "block"` 结果中添加 `continue: true`。具体事件行为请参见[响应模式](#响应模式)。                                                                                                                              |

### 响应模式

LLM 必须用包含以下内容的 JSON 进行响应：
```json
{
  "ok": true | false,
  "reason": "Explanation for the decision"
}
```
| 字段     | 描述                                                                                      |
| :------- | :---------------------------------------------------------------------------------------- |
| `ok`     | `true` 表示允许。`false` 会产生 `decision: "block"`。请参阅下文针对各事件的具体行为         |
| `reason` | 当 `ok` 为 `false` 时必填。用作阻止原因                                                     |

`ok: false` 的具体行为取决于事件类型：

* `Stop` 和 `SubagentStop`：原因会作为后续指令反馈给 Claude，对话轮次将继续
* `PreToolUse`：工具调用被拒绝，原因作为工具错误返回给 Claude，等同于命令钩子的 `permissionDecision: "deny"`
* `PostToolUse`：默认情况下对话轮次结束，原因以警告行形式出现在聊天中。设置 `continueOnBlock: true` 可将原因反馈给 Claude 并继续对话轮次
* `PostToolBatch`、`UserPromptSubmit` 和 `UserPromptExpansion`：对话轮次结束，原因以警告行形式出现。这些事件在 `decision: "block"` 时会结束对话轮次，无论 `continue` 设置如何
* `PostToolUseFailure`、`TaskCreated` 和 `TaskCompleted`：原因作为工具错误返回给 Claude，类似于 `PreToolUse`
* `TeammateIdle`：默认情况下队友停止工作，原因以警告行形式出现。设置 `continueOnBlock: true` 可将原因反馈给队友并让其继续工作
* `PermissionRequest`：`ok: false` 无效。要拒绝钩子的批准，需使用[命令钩子](#命令钩子字段)并返回 `hookSpecificOutput.decision.behavior: "deny"`
* `PermissionDenied`：`ok: false` 无效，因为拒绝已发生。此事件唯一读取的输出是 `hookSpecificOutput.retry`，提示词和代理钩子无法设置此项——它们在此事件上运行，但输出会被丢弃。请使用[命令钩子](#命令钩子字段)返回 `retry`

如需对任何事件进行更精细的控制，请使用包含[决策控制](#决策控制)中描述的针对各事件字段的[命令钩子](#命令钩子字段)。

### 示例：多条件停止钩子

此 `Stop` 钩子使用详细的提示词来检查三个条件，然后才允许 Claude 停止。如果 `"ok"` 为 `false`，Claude 将以提供的原因作为后续指令继续工作。`SubagentStop` 钩子使用相同格式来评估[子代理](/zh/sub-agents)是否应停止：
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should stop working. Context: $ARGUMENTS\n\nAnalyze the conversation and determine if:\n1. All user-requested tasks are complete\n2. Any errors need to be addressed\n3. Follow-up work is needed\n\nRespond with JSON: {\"ok\": true} to allow stopping, or {\"ok\": false, \"reason\": \"your explanation\"} to continue working.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```
## 基于代理的钩子

  Agent hooks 是实验性功能。其行为和配置可能在未来版本中发生变化。对于生产工作流，建议使用[命令钩子](#命令钩子字段)。

基于代理的钩子 (`type: "agent"`) 与基于提示词的钩子类似，但具备多轮工具访问能力。代理钩子并非仅执行单次 LLM 调用，而是会启动一个子代理，该子代理可以读取文件、搜索代码并检查代码库以验证条件。代理钩子支持与基于提示词的钩子相同的事件。

### 代理钩子的工作原理

当代理钩子被触发时：

1. Claude Code 会根据您的提示词和该钩子的 JSON 输入生成一个子代理。
2. 该子代理可以使用 `Read`、`Grep` 和 `Glob` 等工具进行调查。
3. 经过最多 50 轮交互后，子代理会返回一个结构化的 `{ "ok": true/false }` 决策。
4. Claude Code 以处理提示词钩子相同的方式处理该决策。

当验证过程需要检查实际文件或测试输出，而不仅仅是单独评估钩子输入数据时，代理钩子非常有用。

### 代理钩子配置

将 `type` 设置为 `"agent"` 并提供一个 `prompt` 字符串。其配置字段与[提示词钩子](#提示词钩子配置)相同，但默认超时时间更长：

| 字段      | 必需 | 描述                                                                                         |
| :-------- | :--- | :------------------------------------------------------------------------------------------- |
| `type`    | 是   | 必须为 `"agent"`                                                                             |
| `prompt`  | 是   | 描述需要验证内容的提示词。使用 `$ARGUMENTS` 作为钩子输入 JSON 的占位符                        |
| `model`   | 否   | 要使用的模型。默认为一个快速模型                                                               |
| `timeout` | 否   | 超时时间（秒）。默认值：60                                                                     |

响应模式与提示词钩子相同：返回 `{ "ok": true }` 表示允许，返回 `{ "ok": false, "reason": "..." }` 表示阻止。

这个 `Stop` 钩子会在允许 Claude 完成之前验证所有单元测试是否通过：
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
## 在后台运行钩子

默认情况下，钩子会阻塞 Claude 的执行直至完成。对于如部署、测试套件或外部 API 调用等长时间运行的任务，可设置 `"async": true` 使钩子在后台运行，同时 Claude 继续执行。异步钩子无法阻塞或控制 Claude 的行为：响应字段如 `decision`、`permissionDecision` 和 `continue` 均不生效，因为它们原本要控制的动作已经完成。

### 配置异步钩子

在命令钩子的配置中添加 `"async": true` 即可使其在后台运行而不阻塞 Claude。此字段仅适用于 `type: "command"` 的钩子。

此钩子会在每次 `Write` 工具调用后运行测试脚本。Claude 会立即继续工作，而 `run-tests.sh` 将执行长达 120 秒。当脚本执行完毕后，其输出将在下一次对话轮次中传递：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "./run-tests.sh",
            "timeout": 120,
            "async": true
          }
        ]
      }
    ]
  }
}
```
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/run-tests.sh",
            "async": true,
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```
`timeout` 字段设置后台进程的最大运行时间（以秒为单位）。如果未指定，异步钩子将使用与同步钩子相同的 10 分钟默认值。

### 异步钩子如何执行

当异步钩子被触发时，Claude Code 会启动钩子进程并立即继续执行，而不等待其完成。钩子通过 stdin 接收与同步钩子相同的 JSON 输入。

后台进程退出后，如果钩子生成的 JSON 响应中包含 `additionalContext` 字段，该内容将在下一轮对话中作为上下文提供给 Claude。`systemMessage` 字段会显示给你，而非 Claude。

异步钩子的完成通知默认会被静默。要查看这些通知，请使用 `Ctrl+O` 启用详细模式，或启动 Claude Code 时使用 `--verbose`。

### 示例：文件更改后运行测试

每当 Claude 写入文件时，此钩子会在后台启动一个测试套件，并在测试完成后将结果报告回 Claude。将此脚本保存到项目的 `.claude/hooks/run-tests-async.sh` 中，并使用 `chmod +x` 使其可执行：
```bash
#!/bin/bash
# run-tests-async.sh

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tests for source files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

# Run tests and report results to Claude via additionalContext
RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  MSG="Tests passed after editing $FILE_PATH"
else
  MSG="Tests failed after editing $FILE_PATH: $RESULT"
fi
jq -nc --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $msg}}'
```
然后在项目根目录的 `.claude/settings.json` 中添加此配置。`async: true` 标志允许 Claude 在测试运行的同时继续工作：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/run-tests-async.sh",
            "args": [],
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```
### 限制

与同步钩子相比，异步钩子存在一些约束条件：

*   仅 `type: "command"` 类型的钩子支持 `async`。基于提示词的钩子无法异步运行。
*   异步钩子无法阻止工具调用或返回决策。当钩子执行完毕时，触发它的操作往往已经继续进行了。
*   钩子的输出将在下一个对话轮次中送达。如果当前会话处于空闲状态，响应将等到下一次用户交互时才会发出。例外情况：一个以代码 2 退出的 `asyncRewake` 钩子可以立即唤醒 Claude，即使会话处于空闲状态。
*   每次执行都会创建一个独立的后台进程。同一个异钩子的多次触发之间不会进行去重处理。

## 安全考虑

### 免责声明

命令钩子以您系统用户的完全权限运行。

  命令钩子以您的完全用户权限执行shell命令。它们可以修改、删除或访问用户账户有权访问的任何文件。在将钩子命令添加到配置前，请务必进行审查和测试。

### 安全最佳实践

编写钩子时请牢记以下实践：

* **验证并清理输入数据**：切勿盲目信任输入数据
* **始终对 shell 变量加引号**：使用 `"$VAR"` 而非 `$VAR`
* **阻止路径遍历**：检查文件路径中是否包含 `..`
* **使用绝对路径**：为脚本指定完整路径。在 exec 形式中，使用 `${CLAUDE_PROJECT_DIR}` 且路径无需加引号。在 shell 形式中，用双引号包裹整个路径
* **跳过敏感文件**：避免处理 `.env`、`.git/`、密钥等文件

## Windows PowerShell 工具

在 Windows 系统上，您可以通过在命令钩子上设置 `"shell": "powershell"` 来使用 PowerShell 运行单个钩子。钩子会直接启动 PowerShell，因此无论是否设置了 `CLAUDE_CODE_USE_POWERSHELL_TOOL` 环境变量，此功能都有效。Claude Code 会自动检测 `pwsh.exe`（PowerShell 7+），若未找到则回退到 `powershell.exe`（5.1）。
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "shell": "powershell",
            "command": "Write-Host 'File written'"
          }
        ]
      }
    ]
  }
}
```
## 调试钩子

Hook 的执行细节，包括匹配的钩子、退出码以及完整的 stdout 和 stderr 输出，都会写入调试日志文件。使用 `claude --debug-file <path>` 启动 Claude Code 可将日志写入指定路径，或运行 `claude --debug` 后在 `~/.claude/debug/<session-id>.txt` 读取日志。`--debug` 标志不会在终端中打印输出。
```text
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <Your command> with timeout 600000ms
[DEBUG] Hook command completed with status 0: <Your stdout>
```
要获取更细粒度的钩子匹配详情，请设置 `CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose`，这样能看到额外的日志行，例如钩子匹配计数和查询匹配情况。

若要排查常见问题（如钩子未触发、停止钩子持续阻塞或配置错误），请参阅指南中的[限制与故障排查](/zh/hooks-guide#limitations-and-troubleshooting)。要了解涵盖 `/context`、`/doctor` 和设置优先级的更全面诊断流程，请参阅[调试配置](/zh/debug-your-config)。