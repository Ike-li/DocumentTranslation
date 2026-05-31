> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，再深入探索。

# 编排 Claude Code 会话团队

> 协调多个 Claude Code 实例作为团队协同工作，支持共享任务、代理间通信和集中化管理。

  Agent 团队是实验性功能，默认处于禁用状态。要启用该功能，请在您的 [settings.json](/en/settings) 或环境变量中添加 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`。Agent 团队在会话恢复、任务协调和关闭行为方面存在[已知限制](#limitations)。

代理团队让你可以协调多个 Claude Code 实例协同工作。其中一个会话作为团队主管，负责协调工作、分配任务和整合结果。团队成员独立工作，各自拥有独立的上下文窗口，并且可以直接相互沟通。

不同于 [子代理](/en/sub-agents)（它们运行在单一会话中且只能向主代理汇报），你也可以直接与个别团队成员互动，而无需通过主管。

  代理团队需要 Claude Code v2.1.32 或更高版本。使用 `claude --version` 命令检查您的版本。

本页涵盖：

* [何时使用代理团队](#when-to-use-agent-teams)，包括最佳使用场景及与子代理的对比
* [创建团队](#start-your-first-agent-team)
* [控制团队成员](#control-your-agent-team)，包括显示模式、任务分配与委派
* [并行工作的最佳实践](#best-practices)

## 何时使用代理团队

代理团队在需要并行探索能带来实际价值的任务中最为有效。完整场景请参阅[使用案例示例](#use-case-examples)。最佳使用场景包括：

* **研究与审查**：多个团队成员可以同时研究问题的不同方面，然后分享并相互验证发现
* **新模块或功能**：团队成员可以各自负责独立部分，互不干扰
* **竞争性假设调试**：团队成员并行测试不同理论，更快地找到答案
* **跨层协调**：涉及前端、后端和测试的变更，分别由不同团队成员负责

代理团队会增加协调开销，并比单次会话消耗显著更多的 token。当团队成员能够独立工作时效果最佳。对于顺序任务、同一文件编辑或具有众多依赖的工作，单次会话或[子代理](/en/sub-agents)更为有效。

### 与子代理对比

代理团队和[子代理](/en/sub-agents)都允许您并行化工作，但它们的运作方式不同。根据工作人员是否需要相互沟通来选择：

  <img src="https://mintcdn.com/claude-code/nsvRFSDNfpSU5nT7/images/subagents-vs-agent-teams-light.png?fit=max&auto=format&n=nsvRFSDNfpSU5nT7&q=85&s=2f8db9b4f3705dd3ab931fbe2d96e42a" className="dark:hidden" alt="对比子代理与代理团队架构的示意图。子代理由主代理生成，执行工作并回报结果。代理团队通过共享任务列表进行协调，团队成员之间直接沟通。" width="4245" height="1615" data-path="images/subagents-vs-agent-teams-light.png" />

  <img src="https://mintcdn.com/claude-code/nsvRFSDNfpSU5nT7/images/subagents-vs-agent-teams-dark.png?fit=max&auto=format&n=nsvRFSDNfpSU5nT7&q=85&s=d573a037540f2ada6a9ae7d8285b46fd" className="hidden dark:block" alt="对比子代理与代理团队架构的示意图。子代理由主代理生成，执行工作并回报结果。代理团队通过共享任务列表进行协调，团队成员之间直接沟通。" width="4245" height="1615" data-path="images/subagents-vs-agent-teams-dark.png" />

|                   | 子代理                                          | 代理团队                                          |
| :---------------- | :----------------------------------------------- | :-------------------------------------------------- |
| **上下文**       | 拥有独立上下文窗口；结果返回给调用方               | 拥有独立上下文窗口；完全独立                          |
| **沟通**         | 仅向主代理报告结果                               | 团队成员之间直接互相发送消息                          |
| **协调**         | 主代理管理所有工作                               | 共享任务列表，具备自我协调能力                        |
| **最适合**       | 仅关注结果的专注型任务                           | 需要讨论与协作的复杂工作                              |
| **Token 成本**   | 较低：结果汇总至主上下文                         | 较高：每个团队成员都是独立的 Claude 实例               |

当您需要快速、专注的执行者并报告结果时，请使用子代理。当团队成员需要共享发现、相互挑战并自行协调时，请使用代理团队。

## 启用代理团队

代理团队默认处于禁用状态。通过在您的 shell 环境或 [settings.json](/en/settings) 中将环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 设置为 `1` 来启用它们。
```json settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
## 启动你的第一个代理团队

启用代理团队后，用自然语言告诉Claude创建一个代理团队，并描述您想要的任务和团队结构。Claude会根据您的提示词创建团队、生成团队成员并协调工作。

这个例子效果很好，因为三个角色是独立的，可以在不互相等待的情况下探索问题：
```text
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```
从这里开始，Claude 会创建一个具有[共享任务列表](/en/interactive-mode#task-list)的团队，为每个视角生成子代理，让子代理们探索问题，综合发现，并在完成时尝试[清理团队](#clean-up-the-team)。

主代理的终端会列出所有子代理及其正在处理的任务。使用 Shift+Down 循环切换子代理，并直接向他们发送消息。在最后一个子代理之后，Shift+Down 会循环回主代理。

如果你希望每个子代理都拥有自己的分屏面板，请参阅[选择显示模式](#choose-a-display-mode)。

## 控制你的代理团队

用自然语言告诉主代理你的需求。它会根据你的指示处理团队协调、任务分配和委派。

### 选择显示模式

代理团队支持两种显示模式：

* **进程内**：所有子代理都在你的主终端内运行。使用 Shift+Down 循环切换子代理并直接输入消息。适用于任何终端，无需额外设置。
* **分屏面板**：每个子代理都有自己独立的面板。你可以同时看到所有人的输出，并点击进入某个面板直接进行交互。需要 tmux 或 iTerm2。

  `tmux` 在某些操作系统上存在已知限制，并且历来在 macOS 上表现最佳。在 iTerm2 中使用 `tmux -CC` 是推荐的 `tmux` 启动方式。

默认值为 `"auto"`，表示如果已在 tmux 会话中运行则使用分屏模式，否则在进程内运行。设置为 `"tmux"` 时将启用分屏模式，并根据你的终端模拟器自动选择使用 tmux 或 iTerm2。如需覆盖默认行为，可在 `~/.claude/settings.json` 文件中设置 [`teammateMode`](/en/settings#available-settings) 参数。
```json
{
  "teammateMode": "in-process"
}
```
要为单个会话强制使用进程内模式，请将其作为标志传递：
```bash
claude --teammate-mode in-process
```
分屏模式需要 [tmux](https://github.com/tmux/tmux/wiki) 或安装了 [`it2` CLI](https://github.com/mkusaka/it2) 的 iTerm2。手动安装方法如下：

* **tmux**：通过系统包管理器安装。具体平台指令请参考 [tmux wiki](https://github.com/tmux/tmux/wiki/Installing)。
* **iTerm2**：安装 [`it2` CLI](https://github.com/mkusaka/it2)，然后在 **iTerm2 → Settings → General → Magic → Enable Python API** 中启用 Python API。

### 指定队友与模型

Claude 会根据任务自动决定生成的队友数量，您也可以精确指定需求：
```text
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```
队友默认不会继承领队的 `/model` 选择。若要更改提示词未指定时使用的模型，请在 `/config` 中设置**默认队友模型**。选择 **Default (leader's model)** 可使队友跟随领队当前的模型。

### 要求队友规划审批

对于复杂或高风险的任务，您可以要求队友在实施前进行规划。队友将在只读的规划模式下工作，直到领队批准其方案：
```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```
当队友完成规划后，会向主管发送计划审批请求。主管审核计划，可以选择批准或附上反馈驳回。若被驳回，队友将停留在规划模式，根据反馈修订后重新提交。一旦获批，队友即退出规划模式并开始执行。

主管自主做出审批决策。若想影响主管的判断，可在提示词中设定标准，例如"仅批准包含测试覆盖的计划"或"驳回修改数据库架构的计划"。

### 直接与队友沟通

每位队友都是独立完整的 Claude Code 会话。你可以直接向任意队友发送消息，以补充说明、追问后续问题或调整其执行方向。

* **进程内模式**：使用 Shift+Down 切换队友，输入内容即可发送消息。按 Enter 查看队友的会话，按 Escape 中断其当前执行回合。按 Ctrl+T 可切换任务列表视图。
* **分屏模式**：直接点击队友的窗格即可与其会话交互。每位队友都拥有独立完整的终端视图。

### 分配与认领任务

共享任务列表用于协调团队整体工作。主管创建任务后，队友们逐项完成。任务包含三种状态：待处理、进行中和已完成。任务之间可设置依赖关系：存在未解决依赖项的待处理任务，在依赖项完成前无法被认领。

主管可以明确指派任务，队友也可自主认领：

* **主管指派**：告知主管将特定任务分配给指定队友
* **自主认领**：完成后一项任务后，队友自动从列表中选取下一个未分配且无阻塞的任务

任务认领机制采用文件锁定技术，防止多位队友同时尝试认领同一任务时产生竞争条件。

### 关闭队友会话

要优雅地结束队友的会话：
```text
Ask the researcher teammate to shut down
```
领导会发送关闭请求。队友可以批准该请求以正常退出，也可以拒绝并说明原因。

### 清理团队资源

完成操作后，请领导进行清理：
```text
Clean up the team
```
这将移除共享的团队资源。当领导运行清理程序时，会检查是否有活跃的队友仍在运行，若有则清理失败，因此请先关闭他们。

  务必使用主节点进行清理。团队成员不应执行清理操作，因为他们的团队上下文可能无法正确解析，可能导致资源处于不一致状态。

### 使用钩子执行质量门禁

使用[钩子](/en/hooks)在队友完成工作或任务被创建、完成时执行规则：

* [`TeammateIdle`](/en/hooks#teammateidle)：当队友即将空闲时运行。以退出码2退出可发送反馈并让队友继续工作。
* [`TaskCreated`](/en/hooks#taskcreated)：当任务正在被创建时运行。以退出码2退出可阻止创建并发送反馈。
* [`TaskCompleted`](/en/hooks#taskcompleted)：当任务被标记完成时运行。以退出码2退出可阻止完成并发送反馈。

## 代理团队的工作原理

本节介绍代理团队背后的架构和机制。如果您想开始使用它们，请参阅上方的[控制您的代理团队](#control-your-agent-team)。

### Claude 如何启动代理团队

代理团队有两种启动方式：

* **您请求团队**：给Claude一个适合并行处理的任务，并明确要求一个代理团队。Claude会根据您的指示创建一个。
* **Claude提议团队**：如果Claude判断您的任务适合并行处理，它可能会建议创建一个团队。您需要确认后，它才会继续。

在两种情况下，您都保持控制。未经您的批准，Claude不会创建团队。

### 架构

一个代理团队包含：

| 组件        | 角色                                                                                       |
| :---------- | :----------------------------------------------------------------------------------------- |
| **团队负责人** | 创建团队、生成队友并协调工作的主要Claude Code会话 |
| **队友**       | 各自处理分配任务的独立Claude Code实例                  |
| **任务列表**   | 队友认领并完成的工作项共享列表                                    |
| **邮箱**       | 用于代理间通信的消息传递系统                                              |

显示配置选项请参阅[选择显示模式](#choose-a-display-mode)。队友消息会自动发送到负责人。

系统会自动管理任务依赖关系。当一个队友完成了其他任务所依赖的任务时，被阻塞的任务会自动解除阻塞，无需手动干预。

团队和任务存储在本地：

* **团队配置**：`~/.claude/teams/{team-name}/config.json`
* **任务列表**：`~/.claude/tasks/{team-name}/`

当您创建团队时，Claude Code会自动生成这两项，并在队友加入、空闲或离开时更新它们。团队配置包含运行时状态，如会话ID和tmux窗格ID，因此请勿手动编辑或预先授权：您的更改会在下次状态更新时被覆盖。

要定义可重用的队友角色，请使用[子代理定义](#use-subagent-definitions-for-teammates)。

团队配置包含一个 `members` 数组，其中记录了每个队友的名称、代理ID和代理类型。队友可以读取此文件以发现其他团队成员。

不存在项目级别的团队配置等价物。您项目目录中的类似 `.claude/teams/teams.json` 的文件不会被识别为配置；Claude会将其视为普通文件。

### 为队友使用子代理定义

在生成队友时，您可以引用任何[子代理](/en/sub-agents)范围（项目、用户、插件或CLI定义的）中的一个[子代理](/en/sub-agents)类型。这允许您定义一个角色一次，例如安全审查员或测试运行器，并将其既作为委托的子代理又作为代理团队的队友重用。

要使用子代理定义，请在要求Claude生成队友时通过名称提及它：
```text
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```
队友会遵循该定义的`tools`允许列表和`model`设置，且该定义的内容会作为附加指令被追加到队友的系统提示词中，而非覆盖原有提示词。团队协调工具（如`SendMessage`及任务管理工具）对队友始终可用，即使`tools`限制了其他工具。

  当子代理定义作为队友运行时，其 `skills` 和 `mcpServers` frontmatter 字段不会被应用。队友会从你的项目和用户设置中加载技能与 MCP 服务器，这与常规会话的加载方式相同。

### 权限

队友默认继承主导者的权限设置。若主导者使用 `--dangerously-skip-permissions` 运行，所有队友亦会如此。生成后可单独修改队友的模式，但无法在生成时为队友预设不同模式。

### 上下文与通信

每位队友拥有独立的上下文窗口。生成时，队友会加载与常规会话相同的项目上下文：CLAUDE.md、MCP 服务器及技能。同时会收到主导者发出的生成提示词，但不会继承主导者的对话历史。

**队友间信息共享机制：**

* **自动消息传递**：队友发送的消息会自动送达接收方，主导者无需轮询更新。
* **空闲通知**：队友完成任务停止运行时，会自动通知主导者。
* **共享任务列表**：所有代理均可查看任务状态并认领可执行的工作。
* **队友间消息传递**：可通过名称向特定队友发送消息。若需联系所有成员，需逐个发送消息。

主导者在生成队友时会为其分配名称，任何队友均可通过该名称向其他队友发送消息。为使名称可预测以便后续提示词引用，可在生成指令中明确每位队友的称谓。

### Token 用量

代理团队的 token 消耗远高于单会话模式。每位队友拥有独立上下文窗口，token 用量随活跃队友数量增长。对于研究、评审及新功能开发任务，额外 token 投入通常物有所值；而常规任务中，单会话模式更具成本效益。详见 [代理团队 token 成本](/en/costs#agent-team-token-costs) 的使用指南。

## 应用案例示例

以下案例展示代理团队如何处理并行探索能创造价值的任务。

### 并行代码审查

单人审查易倾向于聚焦某类问题。将审查标准划分为独立领域，可使安全性、性能和测试覆盖率等维度同步获得深入检视。通过提示词为每位队友分配不同的审查视角以避免重叠：
```text
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```
每位审查员基于相同的 PR 工作，但应用不同的过滤器。领队在所有人完成后综合三方的发现。

### 使用竞争假设进行调查

当根本原因不明时，单一智能体往往倾向于找到一个看似合理的解释就停止探究。该提示词通过使队友明确采取对抗姿态来对抗这种倾向：每个人的任务不仅是调查自己的理论，还要挑战他人的理论。
```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```
辩论结构是此处的关键机制。顺序调查会受到锚定效应的影响：一旦某个理论被探索，后续的调查就会对其产生偏向。

当多个独立调查者积极尝试相互证伪时，存活下来的理论更有可能是真正的根本原因。

## 最佳实践

### 为队友提供足够的上下文

队友会自动加载项目上下文，包括 CLAUDE.md、MCP 服务器和技能，但他们不会继承负责人的对话历史。详情请参阅 [上下文与沟通](#context-and-communication)。请在生成提示词中包含任务特定的细节：
```text
Spawn a security reviewer teammate with the prompt: "Review the authentication module
at src/auth/ for security vulnerabilities. Focus on token handling, session
management, and input validation. The app uses JWT tokens stored in
httpOnly cookies. Report any issues with severity ratings."
```
### 选择合适的团队规模

团队成员数量没有硬性限制，但存在实际约束：

* **Token 成本线性增长**：每个成员拥有独立上下文窗口并消耗 token。详见 [代理团队 token 成本](/en/costs#agent-team-token-costs)。
* **协调开销增加**：更多成员意味着更多沟通、任务协调和潜在冲突
* **收益递减**：超过某个临界点后，新增成员无法按比例提升工作效率

大多数工作流建议从 3-5 名成员开始，这能平衡并行工作与协调管理。本指南示例均采用 3-5 名成员规模，该范围适用于不同任务类型。

每个成员分配 5-6 个[任务](/en/agent-teams#architecture)可保持高效产出，避免频繁上下文切换。若有 15 个独立任务，3 名成员是理想的起步配置。

仅在工作确实需要成员同步开展时才扩大团队规模。三个专注的成员往往比五个分散的成员更高效。

### 合理划分任务规模

* **过小**：协调开销超过实际收益
* **过大**：成员长时间缺乏同步，增加无效工作风险
* **适中**：形成可产出明确交付物的独立单元（如函数、测试文件或评审内容）

  主代理会自动将工作拆分为任务并分配给团队成员。如果生成的任务不够多，请要求它将工作拆分成更小的部分。每位团队成员分配 5-6 个任务可以保持每个人的工作效率，并让主代理能够在有人遇到困难时重新分配工作。

### 等待队友完成

有时负责人会开始亲自实施任务，而不是等待队友。如果你注意到这种情况：
```text
Wait for your teammates to complete their tasks before proceeding
```
### 从研究与审查开始

如果你刚接触代理团队，请从具有清晰边界且无需编写代码的任务开始：例如审查 PR、研究库文件或调查 Bug。这些任务能展示并行探索的价值，同时避免了并行实现带来的协调挑战。

### 避免文件冲突

两位团队成员编辑同一文件会导致覆盖问题。将工作拆分，让每位成员负责不同的文件集。

### 监控与引导

定期检查团队成员的进度，对无效方法进行调整，并随着进展综合汇总发现。让团队长时间无人监管会增加无效工作的风险。

## 故障排查

### 团队成员未显示

如果在要求 Claude 创建团队后，团队成员未出现：

* 在进程内模式中，团队成员可能已在运行但不可见。按 `Shift+Down` 可切换显示活动中的团队成员。
* 检查分配给 Claude 的任务是否足够复杂，需要组建团队。Claude 会根据任务决定是否生成团队成员。
* 如果明确请求了分屏界面，请确保系统已安装 tmux 且其在您的 PATH 环境变量中可用：
  ```bash
  which tmux
  ```
* 对于 iTerm2，请确认 `it2` 命令行工具已安装，并在 iTerm2 的偏好设置中启用 Python API。

### 权限提示过多
队友的权限请求会汇总至负责人，这可能造成协作阻碍。建议在生成队友前，于[权限设置](/zh/permissions)中预批准常规操作，以减少中断。

### 队友因错误停止
队友遇到错误时可能会停止工作而非尝试恢复。可通过以下方式检查其输出：在进程内模式使用 Shift+Down 快捷键，或在分屏模式下点击对应窗格，随后：

* 直接向其下达补充指令
* 生成替代队友继续工作

### 负责人提前终止任务
负责人可能在所有任务实际完成前判定团队工作已结束。若发生此情况，可指示其继续执行。若负责人未委派任务而自行开始工作，亦可要求其等待队友完成后再继续。

### 孤立的 tmux 会话
若团队结束后 tmux 会话仍然存在，可能未被完全清理。请列出所有会话并终止由团队创建的那个：
```bash
tmux ls
tmux kill-session -t [会话ID]
```
```bash
tmux ls
tmux kill-session -t <session-name>
```
## 限制

Agent 团队处于实验阶段。需要注意以下当前限制：

* **无法通过进程内队友恢复会话**：`/resume` 和 `/rewind` 不会恢复进程内队友。恢复会话后，负责人可能会尝试联系已不存在的队友。若发生此情况，请告知负责人创建新队友。
* **任务状态可能滞后**：队友有时未能将任务标记为完成，这可能会阻碍依赖任务。若任务看似卡住，请检查工作是否实际完成，然后手动更新任务状态或告知负责人敦促该队友。
* **关闭可能较慢**：队友会在关闭前完成当前请求或工具调用，这可能需要一些时间。
* **同一时间只能管理一个团队**：一个负责人只能管理一个团队。在创建新团队前，请清理当前团队。
* **不支持嵌套团队**：队友无法创建自己的团队或队友。只有负责人可以管理团队。
* **负责人固定**：创建团队的会话在其生命周期内始终是负责人。您无法将队友提升为负责人或转移领导权。
* **权限在创建时设置**：所有队友在创建时均继承负责人的权限模式。创建后您可以更改单个队友的模式，但无法在创建时设置每个队友的特定模式。
* **分屏窗格需要 tmux 或 iTerm2**：默认的进程内模式适用于任何终端。分屏模式在 VS Code 的集成终端、Windows Terminal 或 Ghostty 中不受支持。

  **`CLAUDE.md` 工作正常**：团队成员会从他们的工作目录中读取 `CLAUDE.md` 文件。利用此机制可以为所有团队成员提供项目特定的指导。

## 后续步骤

探索并行工作和委托的相关方法：

* **轻量级委托**：[子代理](/en/sub-agents)可在您的会话中派生辅助代理用于研究或验证，更适合不需要代理间协调的任务
* **手动并行会话**：[Git 工作树](/en/worktrees)让您自行运行多个 Claude Code 会话，无需自动化团队协调
* **方法比较**：查看[子代理与代理团队](/en/features-overview#compare-similar-features)对比，获取并排分析说明