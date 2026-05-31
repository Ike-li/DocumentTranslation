> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 使用例行程序自动化工作

> 让 Claude Code 进入自动驾驶模式。定义例行程序，按计划运行、通过 API 调用触发，或响应来自 Anthropic 托管云基础设施的 GitHub 事件。

例行程序目前处于研究预览阶段。行为、限制和 API 接口可能会发生变化。

例行程序是一个保存的 Claude Code 配置：一条提示词、一个或多个代码仓库，以及一组[连接器](/zh/mcp)，打包一次后自动运行。例行程序在 Anthropic 托管的云基础设施上执行，因此即使你的笔记本电脑关机也能持续工作。

每个例行程序可以关联一个或多个触发器：

* **定时**：按定期频率运行，如每小时、每晚或每周，或在未来某个特定时间运行一次
* **API**：通过向每个例行程序的端点发送带 Bearer 令牌的 HTTP POST 请求来按需触发
* **GitHub**：自动响应仓库事件（如 Pull Request 或发布）运行

单个例行程序可以组合多种触发器。例如，一个 PR 审查例行程序可以每晚运行、由部署脚本触发，同时响应每个新的 PR。

例行程序适用于 Pro、Max、Team 和 Enterprise 套餐，需启用 [Claude Code 网页版](/zh/claude-code-on-the-web)。可在 [claude.ai/code/routines](https://claude.ai/code/routines) 创建和管理，也可在 CLI 中使用 `/schedule` 命令。

Team 和 Enterprise 管理员可以在 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 的 Routines 开关中为所有成员禁用例行程序。禁用后，现有例行程序停止运行，成员也无法创建新的例行程序。

本页涵盖创建例行程序、配置各触发器类型、管理运行记录，以及使用限制的说明。

## 使用示例

以下示例将触发器类型与例行程序适合的工作类型配对：无人值守、可重复、且与明确的结果挂钩。

**待办事项维护。** 定时触发器每个工作日晚上通过连接器对你的问题跟踪器运行。例行程序读取自上次运行以来创建的问题，根据引用的代码区域添加标签、分配负责人，并将摘要发布到 Slack，让团队每天从一个已整理的队列开始。

**告警分流。** 当错误阈值被触发时，你的监控工具调用例行程序的 API 端点，将告警正文作为 `text` 传入。例行程序拉取堆栈跟踪，与仓库中的最近提交进行关联，并创建一个包含修复方案的 PR 草稿，同时附上告警链接。值班人员可以直接审查 PR，而无需从空白终端开始排查。

**定制代码审查。** GitHub 触发器在 `pull_request.opened` 时运行。例行程序应用你团队自己的审查检查清单，针对安全、性能和风格问题留下行内评论，并添加摘要评论，让人工审查者可以专注于设计而非机械性检查。

**部署验证。** 你的 CD 流水线在每次生产部署后调用例行程序的 API 端点。例行程序对新构建运行冒烟测试，扫描错误日志中的回归问题，并在部署窗口关闭前向发布频道发送通过或不通过的信号。

**文档漂移。** 定时触发器每周运行。例行程序扫描自上次运行以来合并的 PR，标记引用了已变更 API 的文档，并在文档仓库中创建更新 PR 供编辑审查。

**库移植。** GitHub 触发器在 `pull_request.closed` 时运行，过滤为某个 SDK 仓库中已合并的 PR。例行程序将变更移植到另一种语言的平行 SDK 中，并创建对应的 PR，保持两个库同步，无需人工重新实现每个变更。

以下各节将逐步介绍创建例行程序和配置各触发器类型。

## 创建例行程序

可以从网页端 [claude.ai/code/routines](https://claude.ai/code/routines)、桌面应用或 CLI 创建例行程序。这三种方式写入同一个云端账户，因此你在其中一处创建的例行程序会立即出现在其他地方。在桌面应用中，点击侧边栏的 **Routines**，然后点击 **New routine**，选择 **Remote**；如果选择 **Local** 则会创建一个[桌面定时任务](/zh/desktop-scheduled-tasks)，它在你的本地机器上运行而非云端。

创建表单用于设置例行程序的提示词、仓库、环境、连接器和触发器。

例行程序作为完整的 Claude Code 云会话自主运行：没有权限模式选择器，运行期间也没有审批提示。会话可以运行 shell 命令、使用已克隆仓库中提交的[技能](/zh/skills)，以及调用你包含的任何连接器。例行程序能访问的内容取决于你选择的仓库及其分支推送设置、[环境](/zh/claude-code-on-the-web#the-cloud-environment)的网络访问和变量，以及你包含的连接器。请将每个部分的范围限制为例行程序实际需要的内容。

例行程序属于你的个人 claude.ai 账户。它们不会与团队成员共享，并计入你账户的每日运行配额。例行程序通过你关联的 GitHub 身份或连接器执行的所有操作都以你的名义进行：提交和 PR 使用你的 GitHub 用户名，Slack 消息、Linear 工单或其他连接器操作使用你关联的对应服务账户。

### 从网页端创建

1. **打开创建表单**
   访问 [claude.ai/code/routines](https://claude.ai/code/routines) 并点击 **New routine**。

2. **命名例行程序并编写提示词**
   为例行程序提供一个描述性名称，并编写每次 Claude 运行时使用的提示词。提示词是最重要的部分：例行程序自主运行，因此提示词必须自包含且明确说明要做什么以及成功的标准。

   提示词输入框包含模型选择器。Claude 每次运行时使用所选模型。

3. **选择仓库**
   添加一个或多个 GitHub 仓库供 Claude 在其中工作。每个仓库在运行开始时克隆，从默认分支开始。Claude 为其变更创建以 `claude/` 为前缀的分支。

4. **选择环境**
   为例行程序选择一个[云环境](/zh/claude-code-on-the-web#the-cloud-environment)。环境控制云会话的访问权限：

   * **网络访问**：设置每次运行期间可用的互联网访问级别
   * **环境变量**：提供 Claude 可以使用的 API 密钥、令牌或其他密钥
   * **设置脚本**：安装例行程序所需的依赖和工具。结果会被[缓存](/zh/claude-code-on-the-web#environment-caching)，因此脚本不会在每个会话中重新运行

   提供了一个 **Default** 环境，具有 **Trusted** 网络访问权限，允许访问[默认列表](/zh/claude-code-on-the-web#default-allowed-domains)中的包注册中心、云服务商 API、容器注册中心和常用开发域名，但会阻止其他所有访问。如果你的例行程序需要访问你自己的服务或该列表之外的域名，请在运行前编辑环境的[网络访问](/zh/claude-code-on-the-web#network-access)设置。要使用单独的环境，请先[创建一个](/zh/claude-code-on-the-web#configure-your-environment)。

5. **选择触发器**
   在 **Select a trigger** 下，选择例行程序如何启动。可以选择一种触发器类型或组合多种。

   **定时**
   选择预设频率进行定期运行，或在特定时间戳安排一次性运行。有关时区处理、错峰、自定义 cron 间隔和一次性运行，请参阅[添加定时触发器](#添加定时触发器)。

   **GitHub 事件**
   选择仓库、要响应的事件以及可选过滤器。有关支持的事件和过滤字段的完整列表，请参阅[添加 GitHub 触发器](#添加-github-触发器)。

   **API**
   选择 **API**，然后保存例行程序。URL 和令牌在例行程序保存后生成，因为它们依赖于例行程序 ID。有关复制 URL 和生成令牌，请参阅[添加 API 触发器](#添加-api-触发器)。

6. **审查连接器和权限**
   表单底部的 **Connectors** 和 **Permissions** 选项卡控制例行程序可以访问的内容。

   在 Connectors 下，默认包含你所有已连接的 [MCP 连接器](/zh/mcp)。移除例行程序不需要的连接器。Claude 可以使用已包含连接器的每个工具（包括写入操作），运行期间无需请求权限。

   在 Permissions 下，为任何需要 Claude 推送到现有分支（而非仅限 `claude/` 前缀分支）的仓库启用 **Allow unrestricted branch pushes**。

7. **创建例行程序**
   点击 **Create**。例行程序出现在列表中，并在下次触发器匹配时运行。要立即开始运行，请在例行程序详情页点击 **Run now**。

   每次运行都会在你的其他会话旁边创建一个新会话，你可以在其中查看 Claude 做了什么、审查变更并创建 Pull Request。

### 从 CLI 创建

在任何会话中运行 `/schedule`，以对话方式创建定时例行程序。你也可以直接传递描述，如定期例行程序 `/schedule daily PR review at 9am`，或一次性例行程序 `/schedule clean up feature flag in one week`。Claude 会逐步收集与网页表单相同的信息，然后将例行程序保存到你的账户。

CLI 中的 `/schedule` 仅创建定时例行程序。要添加 API 或 GitHub 触发器，请在网页端 [claude.ai/code/routines](https://claude.ai/code/routines) 编辑例行程序。

CLI 还支持管理现有例行程序。运行 `/schedule list` 查看所有例行程序，`/schedule update` 修改例行程序，或 `/schedule run` 立即触发运行。

## 配置触发器

当例行程序的触发器匹配时即会启动。你可以在同一个例行程序上附加任意组合的定时、API 和 GitHub 触发器，并随时在例行程序编辑表单的 **Select a trigger** 部分添加或移除。

### 添加定时触发器

定时触发器按定期频率或在特定未来时间运行例行程序。在 **Select a trigger** 部分选择预设频率：每小时、每天、工作日或每周。时间按你的本地时区输入并自动转换，因此无论云基础设施位于何处，例行程序都会在该时间运行。

运行可能会因错峰而在预定时间后几分钟开始。每个例行程序的偏移量是固定的。

对于自定义间隔（如每两小时或每月第一天），在表单中选择最接近的预设，然后在 CLI 中运行 `/schedule update` 设置特定的 cron 表达式。最小间隔为一小时；更频繁的表达式会被拒绝。

#### 安排一次性运行

一次性定时在特定时间戳触发例行程序一次。用于稍后提醒自己、在上线完成后创建清理 PR，或在上游变更落地后启动后续任务。例行程序触发后会自动禁用，网页 UI 将其标记为 **Ran**。要再次运行，请编辑例行程序并设置新的一次性时间。

通过 CLI 以自然语言描述时间来创建一次性运行。Claude 会根据当前时间解析该短语，并在保存前确认绝对时间戳。

```text
/schedule tomorrow at 9am, summarize yesterday's merged PRs
```

```text
/schedule in 2 weeks, open a cleanup PR that removes the feature flag
```

一次性时间戳适用与定期定时相同的本地时间到 UTC 的转换规则。

一次性运行不计入每日例行程序运行上限。它们像其他会话一样消耗你套餐的常规订阅用量。详情请参阅[用量和限制](#用量和限制)。

### 添加 API 触发器

API 触发器为例行程序提供专用的 HTTP 端点。使用例行程序的 Bearer 令牌向端点发送 POST 请求即可启动新会话并返回会话 URL。这可以将 Claude Code 连接到告警系统、部署流水线、内部工具，或任何你能发送已认证 HTTP 请求的地方。

API 触发器从网页端添加到现有例行程序。CLI 目前无法创建或撤销令牌。

1. **打开例行程序进行编辑**
   前往 [claude.ai/code/routines](https://claude.ai/code/routines)，点击要通过 API 触发的例行程序，然后点击铅笔图标打开 **Edit routine**。

2. **添加 API 触发器**
   滚动到 **Instructions** 框下方的 **Select a trigger** 部分，点击 **Add another trigger**，选择 **API**。

3. **复制 URL 并生成令牌**
   弹窗会显示该例行程序的 URL 和示例 curl 命令。复制 URL，然后点击 **Generate token** 并立即复制令牌。令牌只显示一次且无法后续获取，请将其存储在安全的地方，如告警工具的密钥库中。

4. **调用端点**
   向 URL 发送 POST 请求时，在 `Authorization: Bearer` 头中发送令牌。下面的[触发例行程序](#触发例行程序)部分有完整示例。

每个例行程序有自己的令牌，仅限触发该例行程序。要轮换或撤销令牌，请返回同一弹窗点击 **Regenerate** 或 **Revoke**。

#### 触发例行程序

向 `/fire` 端点发送 POST 请求，在 `Authorization` 头中包含 Bearer 令牌。请求体接受可选的 `text` 字段，用于特定于运行的上下文（如告警正文或失败日志），与例行程序的已保存提示词一起传递给例行程序。该值为自由格式文本，不会被解析：如果你发送 JSON 或其他结构化载荷，例行程序会将其作为字面字符串接收。

以下示例从 shell 触发例行程序：

```bash
curl -X POST https://api.anthropic.com/v1/claude_code/routines/trig_01ABCDEFGHJKLMNOPQRSTUVW/fire \
  -H "Authorization: Bearer sk-ant-oat01-xxxxx" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "Sentry alert SEN-4521 fired in prod. Stack trace attached."}'
```

成功的请求返回包含新会话 ID 和 URL 的 JSON 响应：

```json
{
  "type": "routine_fire",
  "claude_code_session_id": "session_01HJKLMNOPQRSTUVWXYZ",
  "claude_code_session_url": "https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ"
}
```

在浏览器中打开会话 URL 可实时观看运行过程、审查变更或手动继续对话。

> `/fire` 端点使用 `experimental-cc-routine-2026-04-01` beta 头发布。在研究预览期间，请求和响应格式、速率限制及令牌语义可能会发生变化。破坏性变更会使用新的日期 beta 头版本发布，最近两个之前的头版本会继续工作，以便调用者有时间迁移。

#### API 参考

有关完整的 API 参考，包括所有错误响应、验证规则和字段限制，请参阅 Claude Platform 文档中的[通过 API 触发例行程序](https://platform.claude.com/docs/en/api/claude-code/routines-fire)。

`/fire` 端点仅面向 claude.ai 用户，不属于 Claude Platform API 的一部分。

### 添加 GitHub 触发器

GitHub 触发器在连接的仓库上发生匹配事件时自动启动新会话。每个匹配事件启动独立的会话。

在研究预览期间，GitHub webhook 事件受每例行程序和每账户的每小时上限限制。超出限制的事件会被丢弃，直到窗口重置。请在 [claude.ai/code/routines](https://claude.ai/code/routines) 查看你当前的限制。

GitHub 触发器仅从网页 UI 配置。

1. **打开例行程序进行编辑**
   前往 [claude.ai/code/routines](https://claude.ai/code/routines)，点击例行程序，然后点击铅笔图标打开 **Edit routine**。

2. **添加 GitHub 事件触发器**
   滚动到 **Select a trigger** 部分，点击 **Add another trigger**，选择 **GitHub event**。

3. **安装 Claude GitHub App**
   Claude GitHub App 必须安装在你要订阅的仓库上。如果尚未安装，触发器设置会提示你安装。

   在 CLI 中运行 `/web-setup` 可以授予仓库的克隆访问权限，但它不会安装 Claude GitHub App，也不会启用 webhook 投递。GitHub 触发器需要安装 Claude GitHub App，触发器设置会提示你完成安装。

4. **配置触发器**
   选择仓库，从[支持的事件](#支持的事件)列表中选择事件，并可选添加过滤器。保存触发器。

#### 支持的事件

GitHub 触发器可以订阅以下任一事件类别。在每个类别中，你可以选择特定操作（如 `pull_request.opened`），或响应类别中的所有操作。

| 事件 | 触发时机 |
| :----------- | :---------------------------------------------------------------------------- |
| Pull request | PR 被打开、关闭、分配、标记标签、同步或其他更新 |
| Release | 发布被创建、发布、编辑或删除 |

#### 过滤 Pull Request

使用过滤器限定哪些 Pull Request 会启动新会话。所有过滤条件必须全部匹配，例行程序才会触发。可用的过滤字段为：

| 过滤器 | 匹配内容 |
| :---------- | :------------------------------- |
| Author | PR 作者的 GitHub 用户名 |
| Title | PR 标题文本 |
| Body | PR 描述文本 |
| Base branch | PR 目标分支 |
| Head branch | PR 来源分支 |
| Labels | PR 上的标签 |
| Is draft | PR 是否为草稿状态 |
| Is merged | PR 是否已合并 |

每个过滤器将字段与运算符配对：equals、contains、starts with、is one of、is not one of 或 matches regex。

`matches regex` 运算符测试整个字段值，而非其中的子字符串。要匹配包含 `hotfix` 的任何标题，请写 `.*hotfix.*`。如果没有周围的 `.*`，过滤器仅匹配完全为 `hotfix` 且前后无其他内容的标题。如果需要字面子字符串匹配（无需正则语法），请改用 `contains` 运算符。

一些过滤器组合示例：

* **认证模块审查**：base branch 为 `main`，head branch 包含 `auth-provider`。将涉及身份验证的 PR 发送给专门的审查者。
* **仅限待审查**：is draft 为 `false`。跳过草稿，使例行程序仅在 PR 准备好审查时运行。
* **标签控制的移植**：labels 包含 `needs-backport`。仅在维护者标记 PR 时触发移植到其他分支的例行程序。

#### 会话与事件的映射关系

每个匹配的 GitHub 事件启动一个新会话。GitHub 触发的例行程序不支持跨事件复用会话，因此两次 PR 更新会产生两个独立的会话。

## 管理例行程序

点击列表中的例行程序打开其详情页。详情页显示例行程序的仓库、连接器、提示词、定时计划、API 令牌、GitHub 触发器以及历史运行列表。

### 查看和交互运行记录

点击任何运行记录可将其作为完整会话打开。你可以在其中查看 Claude 做了什么、审查变更、创建 Pull Request 或继续对话。每个运行会话与任何其他会话一样工作：使用会话标题旁的下拉菜单重命名、归档或删除它。

运行列表中的绿色状态表示会话已启动且未因基础设施错误而退出。它并不意味着你提示词中的任务已成功。请打开运行记录查看转录内容，确认 Claude 实际做了什么。被阻止的网络请求、缺失的连接器工具和任务级失败都在那里呈现，而非在状态指示器中。

### 编辑和控制例行程序

在例行程序详情页，你可以：

* 点击 **Run now** 立即开始运行，无需等待下一个预定时间。
* 使用 **Repeats** 部分的开关暂停或恢复定时计划。暂停的例行程序保留其配置，但直到你重新启用才会运行。
* 点击铅笔图标打开 **Edit routine**，修改名称、提示词、仓库、环境、连接器或例行程序的任何触发器。**Select a trigger** 部分用于添加或移除定时计划、API 令牌和 GitHub 事件触发器。
* 点击删除图标移除例行程序。例行程序创建的历史会话仍保留在你的会话列表中。

### 仓库和分支权限

例行程序需要 GitHub 访问权限来克隆仓库。当你使用 CLI 的 `/schedule` 创建例行程序时，Claude 会检查你的账户是否已连接 GitHub，如果未连接会提示你运行 `/web-setup`。有关授予访问权限的两种方式，请参阅 [GitHub 认证选项](/zh/claude-code-on-the-web#github-authentication-options)。

你添加的每个仓库在每次运行时都会被克隆。Claude 从仓库的默认分支开始，除非你的提示词另有指定。

默认情况下，Claude 只能推送到以 `claude/` 为前缀的分支。这可以防止例行程序意外修改受保护或长期存在的分支。要为特定仓库移除此限制，请在创建或编辑例行程序时为该仓库启用 **Allow unrestricted branch pushes**。

### 连接器

例行程序可以使用你已连接的 MCP 连接器在每次运行期间读取和写入外部服务。例如，一个分流支持请求的例行程序可能会从 Slack 频道读取内容并在 Linear 中创建工单。

连接器是你账户上的 [claude.ai 集成](/zh/mcp#use-mcp-servers-from-claude-ai)。你在 CLI 中使用 `claude mcp add` 本地添加的 MCP 服务器存储在你的机器上而非 claude.ai 账户上，因此不会出现在连接器列表中。要在例行程序中使用这些服务器之一，请在 [claude.ai/customize/connectors](https://claude.ai/customize/connectors) 将其添加为连接器，或在已提交的 [`.mcp.json`](/zh/mcp#project-scope) 中声明，使其成为克隆仓库的一部分。

创建例行程序时，默认包含你当前所有已连接的连接器。移除不需要的连接器以限制 Claude 在运行期间可以访问的工具。你也可以直接从例行程序表单添加连接器。

要在例行程序表单之外管理或添加连接器，请访问 claude.ai 上的 **Settings > Connectors** 或在 CLI 中使用 `/schedule update`。

### 环境和网络访问

每个例行程序在控制网络访问、环境变量和设置脚本的[云环境](/zh/claude-code-on-the-web#the-cloud-environment)中运行。例行程序在每次运行时继承环境的网络策略。

**Default** 环境使用 **Trusted** 网络访问权限：可以访问[默认允许列表](/zh/claude-code-on-the-web#default-allowed-domains)中的包注册中心、云服务商 API、容器注册中心和常用开发域名，但无法访问任意域名。对其他主机的出站请求会返回 `403` 和 `x-deny-reason: host_not_allowed` 错误。MCP 连接器流量通过 Anthropic 的服务器路由，因此你添加到例行程序的连接器无需将其主机添加到 **Allowed domains** 即可工作。在[连接器](#连接器)部分移除不需要的连接器。

要允许额外的域名：

1. **打开例行程序进行编辑**
   在例行程序详情页，点击铅笔图标打开 **Edit routine**。

2. **打开环境选择器**
   在 **Instructions** 框下方，选择显示你环境名称的云图标，如 **Default**。

3. **打开环境设置**
   将鼠标悬停在列表中的环境上，点击右侧出现的设置图标。

4. **更改网络访问级别**
   在 **Update cloud environment** 对话框中，将 **Network access** 更改为 **Custom**，并在 **Allowed domains** 中输入你的域名。勾选 **Also include default list of common package managers** 以在自定义域名旁保留[默认允许列表](/zh/claude-code-on-the-web#default-allowed-domains)。选择 **Full** 则获得不受限制的访问权限。

5. **保存**
   点击 **Save changes**。新策略从下次运行开始生效。

有关访问级别和默认允许列表的详情，请参阅[网络访问](/zh/claude-code-on-the-web#network-access)。

## 用量和限制

例行程序与交互式会话以相同方式消耗订阅用量。除了标准订阅限额外，例行程序还有每账户每日运行次数上限。请在 [claude.ai/code/routines](https://claude.ai/code/routines) 或 [claude.ai/settings/usage](https://claude.ai/settings/usage) 查看你当前的消耗量和剩余每日例行程序运行次数。

当例行程序达到每日上限或你的订阅用量限制时，启用了用量额度的组织可以在计量超额模式下继续运行例行程序。未启用用量额度时，额外的运行会被拒绝，直到窗口重置。在 claude.ai 的 **Settings > Billing** 中开启用量额度。

一次性运行不计入每日例行程序上限。它们像其他会话一样消耗你的常规订阅用量，但不计入每账户每日例行程序运行配额。

## 故障排除

### `/schedule` 返回 "Unknown command"

当 `/schedule` 的某个要求未满足时，CLI 会隐藏该命令。原因通常是以下之一：

* 你使用的是 Console API 密钥或云服务商（如 Bedrock、Vertex 或 Foundry）进行身份验证。`/schedule` 需要 claude.ai 订阅登录。如果你的 shell 中设置了 `ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`，或在 `settings.json` 中设置了 `apiKeyHelper`，请先移除它们，因为这些优先于 claude.ai 登录。
* 你的 shell 环境或 [`settings.json` 文件](/zh/settings#available-settings)的 `env` 块中设置了 `DISABLE_TELEMETRY`、`DO_NOT_TRACK`、`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 或 `DISABLE_GROWTHBOOK`。这些会禁用特性标志获取，而 `/schedule` 依赖于此。
* 你正在 Claude Code 网页版会话中。请从[网页 UI](https://claude.ai/code/routines) 管理例行程序。
* {/* min-version: 2.1.81 */}你的 CLI 版本低于 v2.1.81。运行 `claude update`。

无论 CLI 如何配置，你始终可以在 [claude.ai/code/routines](https://claude.ai/code/routines) 创建和管理例行程序。

### "Routines are disabled by your organization's policy"

你的 Team 或 Enterprise 管理员可能已在 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 关闭了 **Routines** 开关。这是服务端的组织设置，无法从本地配置覆盖。请联系你的管理员请求为你的组织启用例行程序。

## 相关资源

* [`/loop` 和会话内定时任务](/zh/scheduled-tasks)：在打开的 CLI 会话中安排本地任务
* [桌面定时任务](/zh/desktop-scheduled-tasks)：在你的机器上运行的本地定时任务，可访问本地文件
* [云环境](/zh/claude-code-on-the-web#the-cloud-environment)：为云会话配置运行时环境
* [MCP 连接器](/zh/mcp)：连接 Slack、Linear 和 Google Drive 等外部服务
* [GitHub Actions](/zh/github-actions)：在你的 CI 流水线中基于仓库事件运行 Claude
