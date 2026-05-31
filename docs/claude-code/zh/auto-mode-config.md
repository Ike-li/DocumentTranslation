> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 配置自动模式

> 告知自动模式分类器您的组织信任哪些仓库、存储桶和域名。设置环境上下文，覆盖默认的阻止和允许规则，并通过自动模式 CLI 子命令检查您的有效配置。

[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode) 允许 Claude Code 在无需权限提示的情况下运行，它通过分类器路由每个工具调用，该分类器会阻止任何不可逆、具有破坏性或针对您环境外部的操作。使用 `autoMode` 设置块告知该分类器您的组织信任哪些仓库、存储桶和域名，以便其停止阻止常规的内部操作。

  自动模式对所有 Anthropic API 用户开放。该功能不适用于 Bedrock、Vertex 或 Foundry。如果 Claude Code 提示您的账户无法使用自动模式，请查阅[完整要求](/zh/permission-modes#eliminate-prompts-with-auto-mode)，其中也涵盖了支持的模型以及团队版和企业版计划中的管理员启用方式。

默认情况下，分类器仅信任工作目录和当前仓库配置的远程源。像推送到公司源码管理组织或写入团队云存储桶这类操作，在添加到 `autoMode.environment` 之前会被阻止。

关于如何启用自动模式及其默认拦截内容，请参阅[权限模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)。本页面是配置参考。

本页面涵盖以下内容：

* [选择配置规则的设置位置](#分类器读取配置的位置)（跨 CLAUDE.md、用户设置和托管设置）
* [定义可信基础设施](#定义受信任的基础设施)（使用 `autoMode.environment`）
* [覆盖拦截与允许规则](#覆盖阻止和允许规则)（当默认值不适合您的流程时）
* [检查您的有效配置](#检查默认值和你的有效配置)（使用 `claude auto-mode` 子命令）
* [查看拒绝记录](#审查拒绝记录)（以便了解下一步需要添加什么）

## 分类器读取配置的位置

分类器读取的内容与 Claude 自身加载的 [CLAUDE.md](/zh/memory) 相同。因此，在项目 CLAUDE.md 中设置的指令（例如“禁止强制推送”）会同时指导 Claude 和分类器的行为。建议从此处开始设置项目约定和行为规则。

对于跨项目适用的规则（例如可信基础设施或组织范围的拒绝规则），请使用 `autoMode` 设置块。分类器从以下作用域读取 `autoMode`：

| 作用域                         | 文件                                            | 用途                                         |
| :----------------------------- | :---------------------------------------------- | :------------------------------------------- |
| 单个开发者                     | `~/.claude/settings.json`                       | 个人可信基础设施                             |
| 单个项目、单个开发者           | `.claude/settings.local.json`                   | 按项目设置的可信存储桶或服务（已忽略 git）   |
| 组织范围                       | [托管设置](/zh/server-managed-settings)         | 分发给所有开发者的可信基础设施               |
| `--settings` 标志或 Agent SDK  | 行内 JSON                                       | 用于自动化的每次调用覆盖设置                 |

分类器不读取 `.claude/settings.json` 中共享项目设置的 `autoMode`，因此已提交的仓库无法注入自己的允许规则。

每个作用域的条目会合并。开发者可以添加个人条目来扩展 `environment`、`allow`、`soft_deny` 和 `hard_deny`，但不能移除托管设置提供的条目。由于允许规则在分类器内部充当软拦截规则的例外，开发者添加的 `allow` 条目可以覆盖组织的 `soft_deny` 条目：组合是叠加式的，而非硬性的策略边界。

  分类器是运行在[权限系统](/zh/permissions)之后的第二道关卡。对于无论用户意图或分类器配置如何都绝不能执行的操作，请在托管设置中使用 `permissions.deny`，该配置会在分类器介入前阻止该操作且无法被覆盖。

## 定义受信任的基础设施

对于大多数组织，`autoMode.environment` 是您唯一需要设置的字段。它告知分类器哪些仓库、存储桶和域名是受信任的：分类器借此判断何为"外部"，因此任何未列出的目标都可能是数据泄露的潜在目标。

默认的环境列表信任当前工作仓库及其已配置的远程仓库。要在默认列表基础上添加自定义条目，请在数组中包含字面字符串 `"$defaults"`。默认条目将在此位置插入，这样您的自定义条目可以放在它们之前或之后。
```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Source control: github.example.com/acme-corp and all repos under it",
      "Trusted cloud buckets: s3://acme-build-artifacts, gs://acme-ml-datasets",
      "Trusted internal domains: *.corp.example.com, api.internal.example.com",
      "Key internal services: Jenkins at ci.example.com, Artifactory at artifacts.example.com"
    ]
  }
}
```
条目是描述性文字，而非正则表达式或工具模式。分类器会将其作为自然语言规则来解读。请以向新工程师描述基础设施的方式来撰写。一个全面的环境部分应包括：

* **组织**：您的公司名称以及 Claude Code 的主要用途，例如软件开发、基础设施自动化或数据工程
* **源代码管理**：您的开发人员推送代码所使用的所有 GitHub、GitLab 或 Bitbucket 组织
* **云提供商和受信任的存储桶**：Claude 应能读取和写入的存储桶名称或前缀
* **受信任的内部域名**：您网络内部 API、仪表盘和服务的主机名，例如 `*.internal.example.com`
* **关键内部服务**：CI、构件仓库、内部包索引、事件处理工具
* **附加上下文**：影响分类器风险判断的受监管行业限制、多租户基础设施或合规性要求

一个实用的起步模板：填写括号内的字段，并删除所有不适用的行。
```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Organization: {COMPANY_NAME}. Primary use: {PRIMARY_USE_CASE, e.g. software development, infrastructure automation}",
      "Source control: {SOURCE_CONTROL, e.g. GitHub org github.example.com/acme-corp}",
      "Cloud provider(s): {CLOUD_PROVIDERS, e.g. AWS, GCP, Azure}",
      "Trusted cloud buckets: {TRUSTED_BUCKETS, e.g. s3://acme-builds, gs://acme-datasets}",
      "Trusted internal domains: {TRUSTED_DOMAINS, e.g. *.internal.example.com, api.example.com}",
      "Key internal services: {SERVICES, e.g. Jenkins at ci.example.com, Artifactory at artifacts.example.com}",
      "Additional context: {EXTRA, e.g. regulated industry, multi-tenant infrastructure, compliance requirements}"
    ]
  }
}
```
提供越具体的上下文，分类器越能更好地区分常规内部操作和数据泄露尝试。

您无需一次性填写所有内容。合理的部署方式是：先使用默认值，然后添加您的源代码管理组织和关键内部服务，这能解决最常见的误报情况（例如推送到您自己的仓库）。接着添加受信任的域名和云存储桶。其余内容则可随着问题的出现逐步补充。

## 覆盖阻止和允许规则

另外三个字段可让您替换分类器的内置规则列表：`autoMode.hard_deny` 用于无条件的安全边界，`autoMode.soft_deny` 用于用户意图可解除的破坏性操作，`autoMode.allow` 用于例外情况。每个字段都是一个描述性文本数组，作为自然语言规则解读。对于在分类器之前运行的、基于工具模式的硬性阻止，请使用 [`permissions.deny`](/zh/permissions)。

在分类器内部，优先级按四个层级运作：

*   `hard_deny` 规则无条件阻止。用户意图和 `allow` 例外均不适用。
*   `soft_deny` 规则次之。用户意图和 `allow` 例外可以覆盖这些规则。
*   `allow` 规则随后作为例外，覆盖匹配的 `soft_deny` 规则。
*   明确的用户意图覆盖剩余的软性阻止：如果用户的消息直接且具体地描述了 Claude 即将执行的确切操作，即使匹配了 `soft_deny` 规则，分类器也会允许它。

笼统的请求不算是明确意图。要求 Claude "清理仓库" 并不授权进行强制推送，但要求 Claude "强制推送这个分支" 则是明确意图。

要放宽限制，可在分类器反复标记默认例外未涵盖的常规模式时，添加到 `allow`。要收紧限制，可将您环境中特有但默认规则遗漏的破坏性风险添加到 `soft_deny`，或将绝对不可逾越的安全边界添加到 `hard_deny`。要在保留内置规则的同时添加自定义规则，请在数组中包含字面字符串 `"$defaults"`。默认规则将在该位置被插入，因此您的自定义规则可以放在其前或其后，并且随着内置规则列表在不同版本中的更新，您将继续继承这些更新。
```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Source control: github.example.com/acme-corp and all repos under it"
    ],
    "allow": [
      "$defaults",
      "Deploying to the staging namespace is allowed: staging is isolated from production and resets nightly",
      "Writing to s3://acme-scratch/ is allowed: ephemeral bucket with a 7-day lifecycle policy"
    ],
    "soft_deny": [
      "$defaults",
      "Never run database migrations outside the migrations CLI, even against dev databases",
      "Never modify files under infra/terraform/prod/: production infrastructure changes go through the review workflow"
    ],
    "hard_deny": [
      "$defaults",
      "Never send repository contents to third-party code-review APIs"
    ]
  }
}
```


  设置 `environment`、`allow`、`soft_deny` 或 `hard_deny` 中的任意一项而不带 `"$defaults"` 时，会替换该部分的整个默认列表。不带 `"$defaults"` 的 `soft_deny` 数组会丢弃所有内置的软阻止规则，包括强制推送、`curl | bash` 和生产环境部署。不带 `"$defaults"` 的 `hard_deny` 数组会丢弃内置的数据渗出和自动模式绕过规则。

每个部分都是独立评估的，因此单独设置 `environment` 会保留默认的 `allow`、`soft_deny` 和 `hard_deny` 列表不变。只有当你打算完全接管列表时，才需要省略 `"$defaults"`。为了安全地做到这一点，请运行 `claude auto-mode defaults` 来打印内置规则，将它们复制到你的设置文件中，然后根据你自己的流程和风险承受能力审查每条规则。

## 检查默认值和你的有效配置

三个CLI子命令帮助你检查和验证你的配置。

以JSON格式打印内置的 `environment`、`allow`、`soft_deny` 和 `hard_deny` 规则：
```bash
claude auto-mode defaults
```
```json
{
  "classifier": "CodeClassifier",
  "version": "1.0",
  "settings": {
    "enabled": true,
    "confidence_threshold": 0.75,
    "max_tokens": 4096,
    "model": "gpt-4-turbo",
    "temperature": 0.3,
    "streaming": true,
    "context_window": 128000,
    "stop_sequences": ["```", "---"],
    "top_p": 0.9,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "allowed_languages": ["python", "javascript", "typescript", "java", "go", "rust", "c", "cpp"],
    "blocked_paths": [".env", "*.pem", "*.key", "**/node_modules/**"],
    "max_file_size_mb": 10,
    "checkpoints": {
      "enabled": true,
      "interval": "5m",
      "max_history": 10
    },
    "sandbox": {
      "enabled": true,
      "timeout": "30s",
      "memory_limit": "512MB",
      "network_access": false
    },
    "permissions": {
      "read": true,
      "write": false,
      "execute": false,
      "network": false
    },
    "hooks": {
      "pre_process": ["strip_comments", "normalize_whitespace"],
      "post_process": ["add_line_numbers", "enforce_max_length"]
    },
    "subagent": {
      "max_concurrent": 5,
      "task_timeout": "2m",
      "memory_per_agent": "100MB"
    }
  },
  "defaults": {
    "enabled": false,
    "confidence_threshold": 0.5,
    "max_tokens": 2048,
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "streaming": false,
    "context_window": 16000,
    "stop_sequences": [],
    "top_p": 1.0,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "allowed_languages": [],
    "blocked_paths": ["**/.git/**"],
    "max_file_size_mb": 1,
    "checkpoints": {
      "enabled": false,
      "interval": "10m",
      "max_history": 5
    },
    "sandbox": {
      "enabled": false,
      "timeout": "60s",
      "memory_limit": "256MB",
      "network_access": true
    },
    "permissions": {
      "read": true,
      "write": false,
      "execute": false,
      "network": false
    },
    "hooks": {
      "pre_process": [],
      "post_process": []
    },
    "subagent": {
      "max_concurrent": 1,
      "task_timeout": "5m",
      "memory_per_agent": "50MB"
    }
  },
  "applied_config": {
    "enabled": true,
    "confidence_threshold": 0.75,
    "max_tokens": 4096,
    "model": "gpt-4-turbo",
    "temperature": 0.3,
    "streaming": true,
    "context_window": 128000,
    "stop_sequences": ["```", "---"],
    "top_p": 0.9,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "allowed_languages": ["python", "javascript", "typescript", "java", "go", "rust", "c", "cpp"],
    "blocked_paths": [".env", "*.pem", "*.key", "**/node_modules/**"],
    "max_file_size_mb": 10,
    "checkpoints": {
      "enabled": true,
      "interval": "5m",
      "max_history": 10
    },
    "sandbox": {
      "enabled": true,
      "timeout": "30s",
      "memory_limit": "512MB",
      "network_access": false
    },
    "permissions": {
      "read": true,
      "write": false,
      "execute": false,
      "network": false
    },
    "hooks": {
      "pre_process": ["strip_comments", "normalize_whitespace"],
      "post_process": ["add_line_numbers", "enforce_max_length"]
    },
    "subagent": {
      "max_concurrent": 5,
      "task_timeout": "2m",
      "memory_per_agent": "100MB"
    }
  }
}
```
```bash
claude auto-mode config
```
获取AI对您的自定义 `allow`、`soft_deny` 和 `hard_deny` 规则的反馈：
```bash
claude auto-mode critique
```
运行 `claude auto-mode config` 保存设置后，确认生效规则是否符合预期，`"$defaults"` 会被展开显示。如果你编写了自定义规则，`claude auto-mode critique` 会审查它们，并标记出模糊、冗余或可能导致误报的条目。若需移除或重写内置规则而非追加，可将 `claude auto-mode defaults` 的输出保存至文件，编辑列表后将结果粘贴到设置文件中替换 `"$defaults"`。

## 审查拒绝记录

当自动模式拒绝工具调用时，该拒绝记录会保存在 `/permissions` 的“最近拒绝”标签页下。在被拒绝的操作上按 `r` 键可标记为重试：退出对话框时，Claude Code 会发送消息告知模型可重试该工具调用并恢复对话。

针对同一目标的重复拒绝通常意味着分类器缺少上下文。请将该目标添加到 `autoMode.environment`，然后运行 `claude auto-mode config` 确认生效。

若需编程方式响应拒绝操作，请使用 [`PermissionDenied` 钩子](/zh/hooks#permissiondenied)。

## 另请参阅

* [权限模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)：了解自动模式的功能、默认拦截规则及启用方式
* [托管设置](/zh/server-managed-settings)：在组织内部署 `autoMode` 配置
* [权限](/zh/permissions)：分类器运行前生效的允许、询问与拒绝规则
* [设置](/zh/settings)：包含 `autoMode` 键在内的完整设置参考文档