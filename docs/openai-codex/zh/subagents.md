# 子代理

Codex 可以通过并行生成专用代理并收集它们的结果到一个响应中来运行子代理工作流。这对于高度并行的复杂任务特别有帮助，例如代码库探索或多步骤功能计划的实现。

通过子代理工作流，你还可以根据任务定义具有不同模型配置和指令的自定义代理。

关于子代理工作流背后的概念和权衡，包括上下文污染、上下文退化以及模型选择指南，请参阅[子代理概念](https://developers.openai.com/codex/concepts/subagents)。

## 可用性

当前的 Codex 版本默认启用子代理工作流。

子代理活动目前在 Codex 应用和 CLI 中可见。IDE 扩展中的可见性即将推出。

Codex 仅在你明确要求时才会生成子代理。因为每个子代理都有自己的模型和工具工作，子代理工作流比同等的单代理运行消耗更多 token。

## 典型工作流

Codex 处理跨代理的编排，包括生成新子代理、路由后续指令、等待结果以及关闭代理线程。

当多个代理正在运行时，Codex 会等待所有请求的结果可用，然后返回整合后的响应。

Codex 仅在你明确要求时才会生成新代理。

要在实际中查看效果，请在你的项目上尝试以下提示词：

```text
I would like to review the following points on the current PR (this branch vs main). Spawn one agent per point, wait for all of them, and summarize the result for each point.
1. Security issue
2. Code quality
3. Bugs
4. Race
5. Test flakiness
6. Maintainability of the code
```

## 管理子代理

- 在 CLI 中使用 `/agent` 切换活动代理线程并检查正在进行的线程。
- 直接要求 Codex 引导运行中的子代理、停止它或关闭已完成的代理线程。

## 审批和沙箱控制

子代理继承你当前的沙箱策略。

在交互式 CLI 会话中，即使你正在查看主线程，审批请求也可能从非活动代理线程中弹出。审批覆盖层会显示源线程标签，你可以在审批、拒绝或回答请求之前按 `o` 打开该线程。

在非交互式流程中，或者当运行无法弹出新审批时，需要新审批的操作会失败，Codex 会将错误反馈给父工作流。

Codex 在生成子代理时还会重新应用父轮次的实时运行时覆盖。这包括你在会话期间交互式设置的沙箱和审批选项，例如 `/permissions` 更改或 `--yolo`，即使选定的自定义代理文件设置了不同的默认值。

你还可以为各个[自定义代理](#自定义代理)覆盖沙箱配置，例如明确将某个代理标记为只读模式。

## 自定义代理

Codex 内置了以下代理：

- `default`：通用回退代理。
- `worker`：专注于执行的代理，用于实现和修复。
- `explorer`：以读取为主的代码库探索代理。

要定义你自己的自定义代理，请在 `~/.codex/agents/` 下添加独立的 TOML 文件（个人代理）或在 `.codex/agents/` 下添加（项目级代理）。

每个文件定义一个自定义代理。Codex 将这些文件作为生成会话的配置层加载，因此自定义代理可以覆盖与普通 Codex 会话配置相同的设置。这可能比专用代理清单更重，随着编写和共享的成熟，格式可能会演进。

每个独立的自定义代理文件必须定义：

- `name`
- `description`
- `developer_instructions`

可选字段如 `nickname_candidates`、`model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config` 在省略时会从父会话继承。

### 全局设置

全局子代理设置仍然位于你[配置](https://developers.openai.com/codex/config-basic#configuration-precedence)中的 `[agents]` 下。

| 字段                             | 类型   | 必填 | 用途                                             |
| -------------------------------- | ------ | :--: | ------------------------------------------------ |
| `agents.max_threads`             | number |  否  | 并发打开的代理线程上限。                         |
| `agents.max_depth`               | number |  否  | 生成的代理嵌套深度（根会话从 0 开始）。          |
| `agents.job_max_runtime_seconds` | number |  否  | `spawn_agents_on_csv` 作业每个 worker 的默认超时。|

**说明：**

- 当未设置时，`agents.max_threads` 默认为 `6`。
- `agents.max_depth` 默认为 `1`，允许生成直接子代理但防止更深的嵌套。除非你特别需要递归委托，否则请保持默认值。提高此值可能会将广泛的委托指令变成重复的扇出，从而增加 token 使用量、延迟和本地资源消耗。`agents.max_threads` 仍然限制并发打开的线程数，但不会消除更深层递归的成本和可预测性风险。
- `agents.job_max_runtime_seconds` 是可选的。未设置时，`spawn_agents_on_csv` 会回退到每个 worker 1800 秒的单次调用默认超时。
- 如果自定义代理名称与内置代理（如 `explorer`）匹配，你的自定义代理优先。

### 自定义代理文件 schema

| 字段                     | 类型     | 必填 | 用途                                             |
| ------------------------ | -------- | :--: | ------------------------------------------------ |
| `name`                   | string   |  是  | Codex 在生成或引用此代理时使用的代理名称。       |
| `description`            | string   |  是  | 面向人类的指导，说明 Codex 何时应使用此代理。    |
| `developer_instructions` | string   |  是  | 定义代理行为的核心指令。                         |
| `nickname_candidates`    | string[] |  否  | 生成代理的可选显示昵称池。                       |

你还可以在自定义代理文件中包含其他支持的 `config.toml` 键，例如 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config`。

Codex 通过 `name` 字段识别自定义代理。将文件名与代理名称匹配是最简单的约定，但 `name` 字段才是真实来源。

### 显示昵称

当你希望 Codex 为生成的代理分配更具可读性的显示名称时，请使用 `nickname_candidates`。当你运行同一自定义代理的多个实例并希望 UI 显示不同的标签而非重复相同的代理名称时，这尤其有用。

昵称仅用于展示。Codex 仍然通过 `name` 识别和生成代理。

昵称候选项必须是非空的唯一名称列表。每个昵称可以使用 ASCII 字母、数字、空格、连字符和下划线。

示例：

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
"""
nickname_candidates = ["Atlas", "Delta", "Echo"]
```

在实践中，Codex 应用和 CLI 可以在代理活动出现的地方显示昵称，而底层代理类型仍为 `reviewer`。

### 自定义代理示例

最好的自定义代理是专注且有主见的。为每个代理提供明确的工作、与该工作匹配的工具表面，以及防止其偏离到相邻工作的指令。

#### 示例 1：PR 审查

此模式将审查拆分为三个专注的自定义代理：

- `pr_explorer` 映射代码库并收集证据。
- `reviewer` 查找正确性、安全性和测试风险。
- `docs_researcher` 通过专用 MCP 服务器检查框架或 API 文档。

项目配置（`.codex/config.toml`）：

```toml
[agents]
max_threads = 6
max_depth = 1
```

`.codex/agents/pr-explorer.toml`：

```toml
name = "pr_explorer"
description = "Read-only codebase explorer for gathering evidence before changes are proposed."
model = "gpt-5.3-codex-spark"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Stay in exploration mode.
Trace the real execution path, cite files and symbols, and avoid proposing fixes unless the parent agent asks for them.
Prefer fast search and targeted file reads over broad scans.
"""
```

`.codex/agents/reviewer.toml`：

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
Lead with concrete findings, include reproduction steps when possible, and avoid style-only comments unless they hide a real bug.
"""
```

`.codex/agents/docs-researcher.toml`：

```toml
name = "docs_researcher"
description = "Documentation specialist that uses the docs MCP server to verify APIs and framework behavior."
model = "gpt-5.4-mini"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Use the docs MCP server to confirm APIs, options, and version-specific behavior.
Return concise answers with links or exact references when available.
Do not make code changes.
"""

[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
```

此设置适用于以下提示词：

```text
Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.
```

## 使用子代理处理 CSV 批量任务（实验性）

此工作流是实验性的，可能会随着子代理支持的演进而变化。当你有许多相似的任务且每个工作项对应一行时，请使用 `spawn_agents_on_csv`。Codex 读取 CSV，为每一行生成一个 worker 子代理，等待整个批次完成，然后将组合结果导出为 CSV。

这适用于重复审计，例如：

- 每行审查一个文件、包或服务
- 检查事件列表、PR 或迁移目标
- 为许多相似输入生成结构化摘要

该工具接受：

- `csv_path`：源 CSV
- `instruction`：worker 提示词模板，使用 `{column_name}` 占位符
- `id_column`：当你希望从特定列获取稳定的项目 ID 时
- `output_schema`：当每个 worker 应返回固定形状的 JSON 对象时
- `output_csv_path`、`max_concurrency` 和 `max_runtime_seconds`：用于作业控制

每个 worker 必须恰好调用一次 `report_agent_job_result`。如果 worker 在未报告结果的情况下退出，Codex 会在导出的 CSV 中将该行标记为错误。

示例提示词：

```text
Create /tmp/components.csv with columns path,owner and one row per frontend component.

Then call spawn_agents_on_csv with:
- csv_path: /tmp/components.csv
- id_column: path
- instruction: "Review {path} owned by {owner}. Return JSON with keys path, risk, summary, and follow_up via report_agent_job_result."
- output_csv_path: /tmp/components-review.csv
- output_schema: an object with required string fields path, risk, summary, and follow_up
```

当你通过 `codex exec` 运行此命令时，Codex 在批次运行期间在 `stderr` 上显示单行进度更新。导出的 CSV 包含原始行数据加上元数据，如 `job_id`、`item_id`、`status`、`last_error` 和 `result_json`。

相关运行时设置：

- `agents.max_threads` 限制可以同时保持打开的代理线程数。
- `agents.job_max_runtime_seconds` 设置 CSV 扇出作业每个 worker 的默认超时。单次调用的 `max_runtime_seconds` 覆盖优先。
- `sqlite_home` 控制 Codex 存储用于代理作业及其导出结果的 SQLite 支持状态的位置。

#### 示例 2：前端集成调试

此模式适用于 UI 回归、不稳定的浏览器流程或跨越应用代码和运行产品的集成缺陷。

项目配置（`.codex/config.toml`）：

```toml
[agents]
max_threads = 6
max_depth = 1
```

`.codex/agents/code-mapper.toml`：

```toml
name = "code_mapper"
description = "Read-only codebase explorer for locating the relevant frontend and backend code paths."
model = "gpt-5.4-mini"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Map the code that owns the failing UI flow.
Identify entry points, state transitions, and likely files before the worker starts editing.
"""
```

`.codex/agents/browser-debugger.toml`：

```toml
name = "browser_debugger"
description = "UI debugger that uses browser tooling to reproduce issues and capture evidence."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
developer_instructions = """
Reproduce the issue in the browser, capture exact steps, and report what the UI actually does.
Use browser tooling for screenshots, console output, and network evidence.
Do not edit application code.
"""

[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
startup_timeout_sec = 20
```

`.codex/agents/ui-fixer.toml`：

```toml
name = "ui_fixer"
description = "Implementation-focused agent for small, targeted fixes after the issue is understood."
model = "gpt-5.3-codex-spark"
model_reasoning_effort = "medium"
developer_instructions = """
Own the fix once the issue is reproduced.
Make the smallest defensible change, keep unrelated files untouched, and validate only the behavior you changed.
"""

[[skills.config]]
path = "/Users/me/.agents/skills/docs-editor/SKILL.md"
enabled = false
```

此设置适用于以下提示词：

```text
Investigate why the settings modal fails to save. Have browser_debugger reproduce it, code_mapper trace the responsible code path, and ui_fixer implement the smallest fix once the failure mode is clear.
```
