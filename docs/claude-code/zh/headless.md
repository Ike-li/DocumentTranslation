> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 以编程方式运行 Claude Code

> 使用 Agent SDK 从 CLI、Python 或 TypeScript 以编程方式运行 Claude Code。

自 2026 年 6 月 15 日起，订阅计划上的 Agent SDK 和 `claude -p` 使用将从新的每月 Agent SDK 额度中扣除，与您的交互使用限额分开。详见[在 Claude 计划中使用 Claude Agent SDK](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)。

[Agent SDK](/zh/agent-sdk/overview) 提供与 Claude Code 相同的工具、代理循环和上下文管理。它可作为 CLI 用于脚本和 CI/CD，也可作为 [Python](/zh/agent-sdk/python) 和 [TypeScript](/zh/agent-sdk/typescript) 包实现完全的编程控制。

要以非交互模式运行 Claude Code，请传入 `-p` 及您的提示词和任何 [CLI 选项](/zh/cli-reference)：

```bash
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

本页介绍通过 CLI（`claude -p`）使用 Agent SDK。如需使用 Python 和 TypeScript SDK 包获取结构化输出、工具审批回调和原生消息对象，请参阅 [Agent SDK 完整文档](/zh/agent-sdk/overview)。

## 基本用法

在任何 `claude` 命令中添加 `-p`（或 `--print`）标志即可非交互运行。所有 [CLI 选项](/zh/cli-reference) 均可与 `-p` 配合使用，包括：

* `--continue` 用于[继续对话](#继续对话)
* `--allowedTools` 用于[自动审批工具](#自动审批工具)
* `--output-format` 用于[结构化输出](#获取结构化输出)

此示例向 Claude 提问关于代码库的问题并打印响应：

```bash
claude -p "What does the auth module do?"
```

### 使用 bare 模式加快启动

添加 `--bare` 可跳过钩子、技能、插件、MCP 服务器、自动记忆和 CLAUDE.md 的自动发现，从而减少启动时间。不加此标志时，`claude -p` 会加载与交互式会话相同的[上下文](/zh/how-claude-code-works#the-context-window)，包括工作目录或 `~/.claude` 中配置的任何内容。

Bare 模式适用于 CI 和脚本场景，可确保每台机器上获得相同结果。队友 `~/.claude` 中的钩子或项目 `.mcp.json` 中的 MCP 服务器不会运行，因为 bare 模式不会读取它们。只有显式传入的标志才会生效。

此示例以 bare 模式运行一次性摘要任务，并预先批准 Read 工具，使调用无需权限提示即可完成：

```bash
claude --bare -p "Summarize this file" --allowedTools "Read"
```

在 bare 模式下，Claude 可访问 Bash、文件读取和文件编辑工具。通过标志传入所需上下文：

| 要加载的内容 | 使用方式 |
| ----------------------- | ------------------------------------------------------- |
| 系统提示词附加内容 | `--append-system-prompt`、`--append-system-prompt-file` |
| 设置 | `--settings <file-or-json>` |
| MCP 服务器 | `--mcp-config <file-or-json>` |
| 自定义代理 | `--agents <json>` |
| 插件 | `--plugin-dir <path>`、`--plugin-url <url>` |

Bare 模式会跳过 OAuth 和钥匙串读取。Anthropic 认证必须通过 `ANTHROPIC_API_KEY` 或传入 `--settings` 的 JSON 中的 `apiKeyHelper` 提供。Bedrock、Vertex 和 Foundry 使用各自常规的提供方凭据。

`--bare` 是脚本和 SDK 调用的推荐模式，未来版本中将成为 `-p` 的默认模式。

## 示例

以下示例展示了常见的 CLI 模式。对于 CI 和其他脚本调用，建议添加 [`--bare`](#使用-bare-模式加快启动)，避免加载本地碰巧配置的内容。

### 通过管道将数据传入 Claude

非交互模式会读取 stdin，因此您可以像使用其他命令行工具一样通过管道传入数据并将响应重定向输出。

此示例将构建日志通过管道传入 Claude，并将解释写入文件：

```bash
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

使用 `--output-format json` 时，响应负载包含 `total_cost_usd` 和按模型分类的费用明细，方便脚本调用方跟踪每次调用的花费，无需查看[使用量仪表板](/zh/costs)。

从 Claude Code v2.1.128 起，管道输入的 stdin 上限为 10MB。如果超出上限，Claude Code 将以明确错误和非零状态退出。如需处理更大的输入，请将内容写入文件并在提示词中引用文件路径，而非通过管道传入。

### 将 Claude 添加到构建脚本

您可以将非交互调用封装在脚本中，将 Claude 用作项目特定的代码检查工具或审查工具。

此 `package.json` 脚本将与 `main` 分支的 diff 通过管道传入 Claude，并要求它报告拼写错误。通过管道传入 diff 意味着 Claude 不需要 Bash 权限即可读取它，转义的双引号使脚本可跨平台运行：

```json
{
  "scripts": {
    "lint:claude": "git diff main | claude -p \"you are a typo linter. for each typo in this diff, report filename:line on one line and the issue on the next. return nothing else.\""
  }
}
```

### 获取结构化输出

使用 `--output-format` 控制响应返回方式：

* `text`（默认）：纯文本输出
* `json`：包含结果、会话 ID 和元数据的结构化 JSON
* `stream-json`：用于实时流式传输的换行分隔 JSON

此示例返回包含会话元数据的项目摘要 JSON，文本结果位于 `result` 字段：

```bash
claude -p "Summarize this project" --output-format json
```

要获取符合特定模式的输出，请将 `--output-format json` 与 `--json-schema` 及 [JSON Schema](https://json-schema.org/) 定义一起使用。响应包含请求的元数据（会话 ID、使用量等），结构化输出位于 `structured_output` 字段。

此示例提取函数名并以字符串数组形式返回：

```bash
claude -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

使用 [jq](https://jqlang.github.io/jq/) 等工具解析响应并提取特定字段：

```bash
# 提取文本结果
claude -p "Summarize this project" --output-format json | jq -r '.result'

# 提取结构化输出
claude -p "Extract function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

### 流式响应

使用 `--output-format stream-json` 配合 `--verbose` 和 `--include-partial-messages` 可在 token 生成时接收它们。每行是一个表示事件的 JSON 对象：

```bash
claude -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages
```

以下示例使用 [jq](https://jqlang.github.io/jq/) 过滤文本增量并仅显示流式文本。`-r` 标志输出原始字符串（无引号），`-j` 不加换行连接，使 token 连续流式输出：

```bash
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

当 API 请求因可重试错误失败时，Claude Code 会在重试前发出 `system/api_retry` 事件。您可以利用此事件展示重试进度或实现自定义退避逻辑。

| 字段 | 类型 | 描述 |
| ---------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | `"system"` | 消息类型 |
| `subtype` | `"api_retry"` | 标识此为重试事件 |
| `attempt` | integer | 当前尝试次数，从 1 开始 |
| `max_retries` | integer | 允许的总重试次数 |
| `retry_delay_ms` | integer | 距下次尝试的毫秒数 |
| `error_status` | integer 或 null | HTTP 状态码，对于无 HTTP 响应的连接错误为 `null` |
| `error` | string | 错误类别：`authentication_failed`、`oauth_org_not_allowed`、`billing_error`、`rate_limit`、`invalid_request`、`model_not_found`、`server_error`、`max_output_tokens` 或 `unknown` |
| `uuid` | string | 唯一事件标识符 |
| `session_id` | string | 事件所属会话 |

`system/init` 事件报告会话元数据，包括模型、工具、MCP 服务器和已加载的插件。它是流中的第一个事件，除非设置了 [`CLAUDE_CODE_SYNC_PLUGIN_INSTALL`](/zh/env-vars)，此时 `plugin_install` 事件会先于它。使用插件字段可在插件未加载时使 CI 失败：

| 字段 | 类型 | 描述 |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugins` | array | 成功加载的插件，每个包含 `name` 和 `path` |
| `plugin_errors` | array | 插件加载时错误，每个包含 `plugin`、`type` 和 `message`。包括未满足的依赖版本和 `--plugin-dir` 加载失败（如路径缺失或无效存档）。受影响的插件会被降级且不出现在 `plugins` 中。无错误时省略此键 |

当设置了 [`CLAUDE_CODE_SYNC_PLUGIN_INSTALL`](/zh/env-vars) 时，Claude Code 会在第一轮之前市场插件安装期间发出 `system/plugin_install` 事件。您可以在自己的界面中使用这些事件展示安装进度。

| 字段 | 类型 | 描述 |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `type` | `"system"` | 消息类型 |
| `subtype` | `"plugin_install"` | 标识此为插件安装事件 |
| `status` | `"started"`、`"installed"`、`"failed"` 或 `"completed"` | `started` 和 `completed` 标记整体安装的起止；`installed` 和 `failed` 报告各个市场 |
| `name` | string，可选 | 市场名称，出现在 `installed` 和 `failed` 中 |
| `error` | string，可选 | 失败消息，出现在 `failed` 中 |
| `uuid` | string | 唯一事件标识符 |
| `session_id` | string | 事件所属会话 |

如需使用回调和消息对象进行编程式流式传输，请参阅 Agent SDK 文档中的[实时流式响应](/zh/agent-sdk/streaming-output)。

### 自动审批工具

使用 `--allowedTools` 可让 Claude 无需提示即可使用特定工具。此示例运行测试套件并修复失败，允许 Claude 无需权限提示即可执行 Bash 命令和读取/编辑文件：

```bash
claude -p "Run the test suite and fix any failures" \
  --allowedTools "Bash,Read,Edit"
```

要为整个会话设置基准而非列出单个工具，请传入[权限模式](/zh/permission-modes)。`dontAsk` 拒绝不在 `permissions.allow` 规则或[只读命令集](/zh/permissions#read-only-commands)中的任何操作，适用于受限的 CI 运行。`acceptEdits` 允许 Claude 无需提示即可写入文件，并自动批准常用的文件系统命令如 `mkdir`、`touch`、`mv` 和 `cp`。其他 shell 命令和网络请求仍需 `--allowedTools` 条目或 `permissions.allow` 规则，否则在尝试时运行会中止：

```bash
claude -p "Apply the lint fixes" --permission-mode acceptEdits
```

### 创建提交

此示例审查暂存的更改并创建带有适当消息的提交：

```bash
claude -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

`--allowedTools` 标志使用[权限规则语法](/zh/settings#permission-rule-syntax)。尾部的 ` *` 启用前缀匹配，因此 `Bash(git diff *)` 允许以 `git diff` 开头的任何命令。`*` 前的空格很重要：不加它，`Bash(git diff*)` 也会匹配 `git diff-index`。

用户调用的[技能](/zh/skills)如 `/code-review` 和[内置命令](/zh/commands)仅在交互模式下可用。在 `-p` 模式下，请描述您想要完成的任务。

### 自定义系统提示词

使用 `--append-system-prompt` 可添加指令同时保留 Claude Code 的默认行为。此示例将 PR diff 通过管道传入 Claude 并指示其审查安全漏洞：

```bash
gh pr diff "$1" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

更多选项请参阅[系统提示词标志](/zh/cli-reference#system-prompt-flags)，包括使用 `--system-prompt` 完全替换默认提示词。

### 继续对话

使用 `--continue` 继续最近的对话，或使用 `--resume` 配合会话 ID 继续特定对话。此示例运行审查，然后发送后续提示：

```bash
# 首次请求
claude -p "Review this codebase for performance issues"

# 继续最近的对话
claude -p "Now focus on the database queries" --continue
claude -p "Generate a summary of all issues found" --continue
```

如果运行多个对话，捕获会话 ID 以恢复特定对话：

```bash
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
claude -p "Continue that review" --resume "$session_id"
```

## 后续步骤

* [Agent SDK 快速入门](/zh/agent-sdk/quickstart)：使用 Python 或 TypeScript 构建您的第一个代理
* [CLI 参考](/zh/cli-reference)：所有 CLI 标志和选项
* [GitHub Actions](/zh/github-actions)：在 GitHub 工作流中使用 Agent SDK
* [GitLab CI/CD](/zh/gitlab-ci-cd)：在 GitLab 流水线中使用 Agent SDK
