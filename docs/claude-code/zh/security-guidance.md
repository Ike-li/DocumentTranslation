> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 在 Claude 编写代码时捕获安全问题

> 安装 security-guidance 插件，让 Claude 在同一会话中审查自己的代码变更并修复漏洞。

security guidance 插件让 Claude 在工作时自动审查自身代码变更中的常见漏洞，并在同一会话中修复发现的问题。该插件在代码到达拉取请求之前捕获注入、不安全反序列化和不安全 DOM API 等问题，减少人工审查者在下游需要承担的安全审查工作量。

安装后，插件会自动运行。无需调用任何命令，也不需要记住单独的指令。

该插件是 [Code Review](/zh/code-review) 的会话内伴侣，后者在拉取请求上运行。本插件减少到达 PR 的问题，Code Review 捕获到达的问题。关于该插件如何与按需审查和 CI 扫描配合使用，请参阅[与其他安全工具的配合](#与其他安全工具的配合)。

## 前提条件

* Claude Code CLI 2.1.144 或更高版本
* `PATH` 中有 Python 3.8 或更高版本。插件按 `python3`、`python`、`py -3` 的顺序尝试
* 工作目录是一个 git 仓库。回合结束和提交审查会对比 git 状态，在仓库外会静默跳过。逐次编辑的模式检查在任何地方都可以工作

首次运行时，插件会在 `~/.claude/security/` 下创建虚拟环境并安装 Claude Agent SDK，这需要 `pip` 和网络访问。如果安装失败，提交审查将回退为单次审查而非代理式审查。在 Windows 上会跳过虚拟环境步骤，因此代理式提交审查仅在 `claude-agent-sdk` 已可导入时运行，否则同样回退。

## 安装插件

在 Claude Code 会话中，从[官方 Anthropic 市场](/zh/discover-plugins#official-anthropic-marketplace)安装：

```text
/plugin install security-guidance@claude-plugins-official
```

安装时会提示选择作用域。选择用户作用域将插件写入用户设置，使其在本机上启动的每个新本地会话中加载。如果 Claude Code 报告找不到市场，请先运行 `/plugin marketplace add anthropics/claude-plugins-official`，然后重试安装。

然后在当前会话中使用 `/reload-plugins` 激活它，该命令无需重启即可应用待处理的插件更改：

```text
/reload-plugins
```

### 在云端会话和共享仓库中启用

用户作用域的插件不会带入 [Claude Code 网页版](/zh/claude-code-on-the-web)，因为这些会话运行在 Anthropic 基础设施上而非您的机器上。要在那里启用插件，或为克隆仓库的每个人启用它，请在项目的已提交设置中声明：

```json .claude/settings.json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true
  }
}
```

管理员可以通过在[托管设置](/zh/admin-setup)中设置 [`enabledPlugins`](/zh/settings#plugin-settings) 来组织范围启用插件。

## 插件检查内容

插件在三个时间点审查 Claude 的工作，每个时间点的深度不同：

* [每次文件编辑时]：快速模式匹配风险调用，无模型调用
* [每个回合结束时](#每个回合结束时)：后台模型审查该回合所有更改
* [Claude 每次提交或推送时](#claude-每次提交或推送时)：更深入的代理式审查，读取周围代码

您可以通过[添加自己的规则](#添加自己的规则)来扩展每一层。内置检查无法单独移除，但可以[独立禁用每一层](#禁用或卸载)。

### 每次文件编辑时

当 Claude 写入文件时，插件会扫描新内容中的已知风险模式。这是无模型调用的模式匹配，不会增加使用成本。

示例模式类别：

* 动态代码执行：`eval(`、`new Function`、`os.system`、`child_process.exec`
* 不安全反序列化：`pickle`
* DOM 注入：`dangerouslySetInnerHTML`、`.innerHTML =`、`document.write`
* 工作流文件：对 `.github/workflows/` 下的编辑，可能授予仓库级权限

检查在编辑落地后运行，并将警告附加到 Claude 下一步的上下文中。每个警告在同一会话中每个文件每个模式只触发一次，因此同一文件中的重复匹配不会淹没对话。

您可以使用 `security-patterns.yaml` 文件为此层[添加自己的模式](#添加自定义逐次编辑模式)。

### 每个回合结束时

一个回合是 Claude 响应的一轮：您发送消息，Claude 工作并回复，回合结束。每个回合结束后，插件计算工作树中该回合所有更改的 git diff，包括 Claude 的编辑工具、Bash 命令和子代理的更改，并将其发送给专注于安全的单独 Claude 审查。审查在后台运行，不会延迟 Claude 的回复。如果审查发现问题，Claude 会收到发现结果的重新提示并作为后续处理。

这能捕获字符串匹配无法发现的问题，例如：

* 授权绕过
* 不安全的直接对象引用
* 注入
* 服务端请求伪造
* 弱加密

您可以在会话中直接看到发现结果和 Claude 的解决方案。审查覆盖每个回合最多 30 个更改文件，连续触发最多三次后交还给您。

### Claude 每次提交或推送时

当 Claude 通过其 Bash 工具运行 `git commit` 或 `git push` 时，插件会在后台对变更运行更深入的代理式审查。该审查读取周围代码，包括调用方、清理函数和相关文件，在报告之前判断发现是否真实。额外的上下文使那些在隔离环境中看起来危险但在您的代码库中安全的模式的误报率保持较低。

此层仅在 Claude 通过其 Bash 工具进行的提交和推送时触发。您从自己的 shell 运行的提交，包括会话内的 `!` shell 转义，不会被审查。提交和推送审查在滚动一小时内上限为 20 次。如果提交审查的发现与回合结束审查已报告的内容重复，Claude 不会收到重新提示，因此干净的提交不会产生此层的可见输出。

### 审查独立性和限制

该插件不会让编写代码的同一个 Claude 实例给自己评分。逐次编辑检查是确定性字符串匹配，不涉及模型。回合结束和提交审查作为单独的 Claude 调用运行，具有全新上下文和安全专用提示词：审查者从 diff 开始，对原始方法没有参与感，只被指示发现问题。

任何层都不会阻止写入或提交。发现结果作为指令传递给编写 Claude，Claude 在对话中处理它们，审查模型可能会遗漏问题。将该插件视为纵深防御中的一层，而非完整的安全解决方案。请参阅[与其他安全工具的配合](#与其他安全工具的配合)。

## 添加自己的规则

该插件有两个扩展点：一个用于模型审查的 Markdown 指导文件，一个用于逐次编辑字符串匹配的 YAML 或 JSON 模式文件。两者都是累加的。您可以添加检查，但无法从这些文件中禁用内置检查。

### 为模型审查添加指导

在项目中创建 `.claude/claude-security-guidance.md`，用自然语言描述您的威胁模型和审查清单。模型审查会将其作为额外上下文加载，与内置漏洞清单一起使用。

以下示例适用于具有角色控制的管理路由和客户数据日志策略的 Web 服务：

```markdown .claude/claude-security-guidance.md
# Security guidance for this repo

- Do not log `customer_id` or `account_number` at INFO level or above.
- All routes under `/admin` must call `require_role("admin")` before any database read.
- Use `crypto.timingSafeEqual` for token comparison instead of `===`.
```

这些规则是审查者的指导，而非确定性防护栏。插件将违规作为发现结果呈现给 Claude 修复，但不会阻止写入或保证捕获每个违规。指导仅是累加的：忽略某个漏洞类别的规则不会抑制这些发现。要强制执行，请将插件与[阻止编辑的钩子](/zh/hooks-guide#block-edits-to-protected-files)或 CI 检查配合使用。

### 添加自定义逐次编辑模式

创建 `.claude/security-patterns.yaml` 为[逐次编辑模式检查]添加正则表达式或子字符串规则。这些规则作为确定性字符串匹配与内置模式一起运行：

```yaml .claude/security-patterns.yaml
patterns:
  - rule_name: internal_api_key
    substrings: ["sk_live_", "AKIA"]
    reminder: "Hardcoded API key prefix. Load credentials from the secret manager."
  - rule_name: tenant_unfiltered_query
    regex: "\\.objects\\.all\\(\\)"
    paths: ["**/src/tenants/**"]
    reminder: "Multi-tenant code must filter by org_id."
```

| 字段            | 类型   | 描述                                                                                                         |
| :-------------- | :----- | :----------------------------------------------------------------------------------------------------------- |
| `rule_name`     | string | 警告中显示的标识符                                                                                           |
| `reminder`      | string | 附加到 Claude 上下文的警告文本，上限 1 KB                                                                    |
| `regex`         | string | 针对编辑内容匹配的 Python 正则表达式                                                                         |
| `substrings`    | list   | 字面子字符串；提供此字段或 `regex`                                                                           |
| `paths`         | list   | 可选的 glob 模式；规则仅适用于匹配的文件。glob 匹配完整文件路径，因此项目相对模式需以 `**/` 开头             |
| `exclude_paths` | list   | 可选的跳过 glob 模式；匹配方式与 `paths` 相同                                                               |

该插件也读取 `.claude/security-patterns.yml` 和 `.claude/security-patterns.json`，使用相同的 schema。JSON 在任何 Python 安装上都可以工作。YAML 形式需要 PyYAML 可导入，插件不会为您安装。插件最多加载 50 个自定义规则，并跳过看起来容易导致灾难性回溯的正则表达式。

### 规则文件查找位置

该插件在相同位置查找 `claude-security-guidance.md` 和 `security-patterns.yaml`，与插件的启用方式无关：

| 作用域       | 路径                                        | 说明                                 |
| :----------- | :------------------------------------------ | :----------------------------------- |
| 用户         | `~/.claude/claude-security-guidance.md`     | 适用于本机上的每个项目               |
| 项目         | `.claude/claude-security-guidance.md`       | 随仓库一起提交                       |
| 项目本地     | `.claude/claude-security-guidance.local.md` | 被 gitignore，用于个人覆盖           |

插件加载所有存在的位置并拼接它们，指导文件的合并上限为 8 KB。管理员可以通过设备管理将用户作用域文件推送到 `~/.claude/` 来分发组织范围的规则。相同的路径适用于 `security-patterns.yaml`。

## 使用成本

[逐次编辑模式检查]不进行模型调用，不增加成本。[回合结束](#每个回合结束时)和[提交](#claude-每次提交或推送时)审查各自产生额外的模型使用量，与其他 Claude 请求一样计入您的[使用量](/zh/costs)。提交审查是代理式的，每次提交可能需要多个模型回合，滚动一小时内上限为 20 次审查。预计每个更改文件的回合大约一次审查调用，每次提交一次更深入的审查，均受上述上限约束。

两个模型审查默认使用 Claude Opus 4.7。设置 `SECURITY_REVIEW_MODEL` 可为回合结束审查选择不同模型，设置 `SG_AGENTIC_MODEL` 可为提交审查选择不同模型。

该插件在所有方案上都可用。

## 禁用或卸载

要关闭个别层同时保留其余层，设置相应的环境变量：

| 变量                            | 效果                                                   |
| :------------------------------ | :----------------------------------------------------- |
| `ENABLE_PATTERN_RULES=0`        | 禁用[逐次编辑模式检查]               |
| `ENABLE_STOP_REVIEW=0`          | 禁用[回合结束 diff 审查](#每个回合结束时)              |
| `ENABLE_COMMIT_REVIEW=0`        | 禁用[提交和推送审查](#claude-每次提交或推送时)         |
| `ENABLE_CODE_SECURITY_REVIEW=0` | 一次性禁用所有模型审查                                 |
| `SECURITY_GUIDANCE_DISABLE=1`   | 完全禁用插件而不卸载                                   |

要在用户作用域暂停插件：

```text
/plugin disable security-guidance@claude-plugins-official
```

要从用户作用域移除它：

```text
/plugin uninstall security-guidance@claude-plugins-official
```

如果插件是通过项目的 `.claude/settings.json` 启用的，从 `/plugin` 禁用它会将覆盖写入您的 `.claude/settings.local.json`，而不是编辑已提交的文件，因此插件对您保持关闭而队友不受影响。如果它是通过[托管设置](/zh/admin-setup)启用的，只有管理员才能禁用它。

## 插件如何与 Claude Code 集成

该插件完全基于[钩子](/zh/hooks)构建，钩子是在 Claude 循环的特定点运行自定义代码的机制。它注册了：

| 钩子事件                                                           | 用途                                                       |
| :----------------------------------------------------------------- | :--------------------------------------------------------- |
| `SessionStart`                                                     | 引导插件的 Python 环境                                     |
| `UserPromptSubmit`                                                 | 捕获回合结束审查对比的工作树基线                           |
| `PostToolUse` on `Edit`、`Write` 和 `NotebookEdit`                 | 逐次编辑模式匹配                                           |
| `Stop`                                                             | 回合结束 diff 审查，在后台运行                             |
| `PostToolUse` on `Bash`，过滤为 `git commit` 和 `git push`         | 提交和推送审查，在后台运行                                 |

如果您构建自己的钩子，[插件源码](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance)是从钩子运行单独模型调用并将结果反馈给会话的工作示例。

## 与其他安全工具的配合

该插件是纵深防御方法中的一层。它在最早期捕获问题——代码仍在编辑器中时——但它不是保证，也不能替代后续检查。典型的技术栈：

| 阶段       | 工具                                                        | 覆盖内容                                                                                   |
| :--------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| 会话内     | Security guidance 插件                                      | Claude 编写代码中的常见漏洞，在同一会话中修复                                              |
| 按需       | [`/security-review`](/zh/commands#all-commands)             | 对当前分支的一次性安全检查，在您要求时运行                                                 |
| 拉取请求时 | [Code Review](/zh/code-review)，Team 和 Enterprise 方案     | 具有完整代码库上下文的多代理正确性和安全审查                                               |
| CI 中      | 您现有的静态分析和依赖扫描器                                | 插件不尝试的语言特定规则、供应链检查和策略执行                                             |

每个后续阶段捕获前面阶段遗漏的内容。该插件的价值在于减少到达它们的数量，而非消除对它们的需求。

## 故障排除

该插件将运行时诊断写入 `~/.claude/security/log.txt`。如果审查未出现，请先检查那里。

审查层在对话中没有消息的情况下跳过的常见原因：

* 目录不是 git 仓库：回合结束和提交审查需要 git 状态，在仓库外会跳过
* 会话没有 Anthropic 认证：模型审查跳过，仅运行逐次编辑模式检查
* 存在 `security-patterns.yaml` 文件但 PyYAML 不可导入：文件被忽略。请改用 `security-patterns.json`

## 相关资源

深入了解本页面涉及的内容：

* [Code Review](/zh/code-review)：设置 PR 时的多代理审查
* [使用钩子自动化工作流](/zh/hooks-guide)：在相同的生命周期点构建自己的检查
* [发现和安装插件](/zh/discover-plugins#official-anthropic-marketplace)：浏览其他官方插件
