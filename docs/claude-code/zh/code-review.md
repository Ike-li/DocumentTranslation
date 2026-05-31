> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在深入探索前，请使用此文件查阅所有可用页面。

# 代码审查

> 通过多代理分析整个代码库，设置自动化 PR 审查，捕捉逻辑错误、安全漏洞和回归问题。

  Code Review 目前处于研究预览阶段，适用于[Team 和 Enterprise](https://claude.ai/admin-settings/claude-code)订阅。对于启用了[零数据保留](/zh/zero-data-retention)的组织，此功能不可用。

Code Review 会分析您的 GitHub Pull Request，并将发现的问题以行内注释形式发布在对应代码行上。一组专门的子代理会在完整代码库的上下文中检查代码变更，寻找逻辑错误、安全漏洞、边界情况故障以及潜在的回归问题。

发现的问题会按严重性标记，不会批准或阻止您的 PR，因此现有的审查工作流程保持不变。您可以通过在仓库中添加 `CLAUDE.md` 或 `REVIEW.md` 文件来调整 Claude 的标记内容。

若要在自己的 CI 基础设施而非此托管服务中运行 Claude，请参阅 [GitHub Actions](/zh/github-actions) 或 [GitLab CI/CD](/zh/gitlab-ci-cd)。对于自托管 GitHub 实例上的仓库，请参阅 [GitHub Enterprise Server](/zh/github-enterprise-server)。

本页内容涵盖：

* [审查工作原理](#代码审查工作原理)
* [设置](#code-review-检查项)
* [手动触发审查](#手动触发审查)（使用 `@claude review` 和 `@claude review once`）
* [自定义审查](#自定义审查)（使用 `CLAUDE.md` 和 `REVIEW.md`）
* [定价](#定价)
* [故障排除](#故障排除)（运行失败和缺失注释）
* [本地审查差异](#code-review-检查项)（使用 `/code-review` 命令）

  要在不安装 GitHub App 的情况下在终端本地审查差异，请在任何 Claude Code 会话中运行 `/code-review` 斜杠命令。请参阅[在本地审查差异](#code-review-检查项)。

## 代码审查工作原理

管理员为您的组织[启用 Code Review](#code-review-检查项) 后，审查会在 PR 打开时、每次推送时或手动请求时触发，具体取决于仓库的配置行为。在任何模式下，评论 `@claude review` 都可以[在 PR 上启动审查](#手动触发审查)。

审查运行时，多个代理会在 Anthropic 基础设施上并行分析差异和周围的代码。每个代理负责查找不同类别问题，然后验证步骤会根据实际代码行为检查候选问题，以过滤掉误报。结果会被去重、按严重程度排序，并作为内联评论发布在发现问题的具体行上，审查正文中会有一个摘要。如果未发现问题，Code Review 会更新 GitHub 检查运行状态，表明未检测到问题。Claude 也可能在 PR 上发布一条简短的确认评论。

审查成本随 PR 大小和复杂度而增加，平均在 20 分钟内完成。管理员可以通过[分析仪表板](#查看使用情况)监控审查活动和支出。

### 严重等级

每个发现都标记有严重等级：

| 标记 | 严重程度     | 含义                                                    |
| :--- | :----------- | :------------------------------------------------------ |
| 🔴   | 重要         | 合并前应修复的错误                                      |
| 🟡   | 小问题       | 小问题，值得修复但不阻塞                                |
| 🟣   | 原有         | 代码库中已存在但并非由本次 PR 引入的错误                |

发现包含一个可折叠的扩展推理部分，您可以展开以了解 Claude 标记该问题的原因及其验证问题的方式。

### 对发现进行评分和回复

Claude 的每条审查评论都预置了 👍 和 👎，因此这两个按钮都会出现在 GitHub UI 中，可以一键评分。如果发现有用请点击 👍，如果发现有误或噪音过多请点击 👎。Anthropic 在 PR 合并后收集反应计数，并用其来调整审查者。反应不会触发重新审查或更改 PR 上的任何内容。

回复内联评论不会提示 Claude 响应或更新 PR。要对某个发现采取行动，请修复代码并推送。如果 PR 订阅了推送触发的审查，下次运行时，当问题被修复后，该线程会被解决。要在不推送的情况下请求重新审查，请在[PR 顶层评论](#手动触发审查)中评论 `@claude review once`。

### 检查运行输出

除了内联审查评论外，每次审查还会填充与 CI 检查一同出现的 **Claude Code Review** 检查运行。展开其**详细信息**链接，可以看到按严重程度排序的所有发现的摘要：

| 严重程度     | 文件:行                      | 问题                                                               |
| ------------ | ---------------------------- | ------------------------------------------------------------------ |
| 🔴 重要      | `src/auth/session.ts:142`   | Token 刷新与登出竞争，导致陈旧会话保持活跃                         |
| 🟡 小问题    | `src/auth/session.ts:88`    | `parseExpiry` 对格式错误的输入静默返回 0                           |

每个发现也会作为注释出现在**已更改文件**选项卡中，直接标记在相关的差异行上。重要发现用红色标记渲染，小问题用黄色警告，原有错误用灰色通知。注释和严重等级表独立于内联审查评论写入检查运行状态，因此即使 GitHub 拒绝了在已移动行上的内联评论，它们仍然可用。

检查运行总是以中性结论完成，因此它永远不会通过分支保护规则阻止合并。如果您想根据 Code Review 发现来控制合并，请在您自己的 CI 中从检查运行输出读取严重等级细分。详细信息文本的最后一行是机器可读的注释，您的工作流可以使用 `gh` 和 jq 进行解析：
```bash
gh api repos/OWNER/REPO/check-runs/CHECK_RUN_ID \
  --jq '.output.text | split("bughunter-severity: ")[1] | split(" -->")[0] | fromjson'
```
这将返回一个按严重程度统计数量的 JSON 对象，例如 `{"normal": 2, "nit": 1, "pre_existing": 0}`。`normal` 键对应重要发现的数量；如果该值非零，则表示 Claude 发现了至少一个值得在合并前修复的缺陷。

### Code Review 检查项

默认情况下，Code Review 专注于**正确性**：那些可能破坏生产环境的缺陷，而非格式偏好或测试覆盖率不足的问题。您可以通过[添加指导文件](#自定义审查)到您的仓库来扩展其检查范围。

## 设置 Code Review

管理员只需为整个组织启用一次 Code Review，并选择要包含的仓库。


    访问 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 并找到 Code Review 部分。您需要在您的 Claude 组织中拥有管理员权限，以及在您的 GitHub 组织中安装 GitHub Apps 的权限。



    点击**设置**。这将启动GitHub App安装流程。



    按照提示操作，将 Claude GitHub App 安装到您的 GitHub 组织中。该应用请求以下仓库权限：

    * **内容**：读取和写入
    * **议题**：读取和写入
    * **拉取请求**：读取和写入

    代码审查功能使用内容的读取权限和拉取请求的写入权限。更广泛的权限集也支持[GitHub Actions](/zh/github-actions)（如果之后启用）。



    选择要启用代码审查的仓库。如果未看到某个仓库，请确认在安装期间已授予 Claude GitHub App 对该仓库的访问权限。您可以稍后添加更多仓库。



    设置完成后，**代码审查**部分会以表格形式显示您的仓库。对于每个仓库，请使用 **审查行为** 下拉菜单选择何时运行审查：

    * **PR 创建后审查一次**：当 PR 被打开或标记为就绪待审时，运行一次审查
    * **每次推送后审查**：每次推送到 PR 分支时都会运行审查，在 PR 演进过程中捕获新问题，并在您修复已标记问题时自动解决相关讨论线程
    * **手动触发**：仅当有人[在 PR 上评论 `@claude review` 或 `@claude review once`](#手动触发审查) 时才开始审查；使用 `@claude review` 还会订阅该 PR 在后续推送时的审查

    每次推送都审查的模式运行的审查次数最多，成本也最高。手动模式适用于流量较大的仓库，在这些仓库中您可能希望对特定 PR 进行审查，或者仅在 PR 准备就绪后才开始审查。


仓库表格还会显示基于近期活动每个仓库的平均审查成本。使用行操作菜单可为每个仓库开启或关闭代码审查，或完全移除仓库。

要验证设置，请打开一个测试 PR。若选择自动触发，几分钟内会出现名为 **Claude Code Review** 的检查运行。若选择手动模式，在 PR 中评论 `@claude review` 以启动首次审查。若未出现检查运行，请确认该仓库已列在您的管理设置中，且 Claude GitHub App 有权访问它。

## 手动触发审查

两种评论命令可按需启动审查。无论仓库配置的触发方式如何，它们都有效，因此您可在手动模式下用它们让特定 PR 接受审查，或在其它模式下获得即时复审。

| 命令                  | 作用                                                                 |
| :-------------------- | :------------------------------------------------------------------- |
| `@claude review`      | 启动审查，并让该 PR 订阅后续推送触发的审查                           |
| `@claude review once` | 启动单次审查，而不让该 PR 订阅后续推送的审查                         |

当您希望获取对 PR 当前状态的反馈，但不希望每次后续推送都触发审查时，请使用 `@claude review once`。这对于有频繁推送的长期 PR 很有用，或者当您只想获得一次性二次意见而不改变 PR 的审查行为时也很有用。

要使任一命令触发审查：

* 将其作为 PR 的顶级评论发布，而非在差异行上的内联评论
* 将命令放在评论开头，若使用单次形式，`once` 需在同一行
* 您必须对仓库拥有所有者、成员或协作者访问权限
* PR 必须处于开放状态

与自动触发不同，手动触发可在草稿 PR 上运行，因为明确的请求表明您希望立即审查，无论是否为草稿状态。

若该 PR 已有审查正在运行，该请求将排队等待，直到进行中的审查完成。您可以通过 PR 上的检查运行来监控进度。

## 自定义审查

代码审查会读取仓库中的两个文件来指导其标记内容。它们在影响审查的程度上有所不同：

* **`CLAUDE.md`**：共享项目说明，Claude Code 将其用于所有任务，而不仅仅是审查。代码审查将其作为项目上下文读取，并将新引入的违规标记为瑕疵。
* **`REVIEW.md`**：仅用于审查的说明，作为最高优先级直接注入审查管道中的每个代理。用它来更改被标记的内容、严重程度以及报告结果的方式。

### CLAUDE.md

代码审查会读取您仓库的 `CLAUDE.md` 文件，并将新引入的违规视为[瑕疵级别]的发现。这是双向的：如果您的 PR 以使 `CLAUDE.md` 中的陈述过时的方式更改了代码，Claude 也会标记需要更新文档。

Claude 会读取目录层次结构中每一级的 `CLAUDE.md` 文件，因此子目录 `CLAUDE.md` 中的规则仅适用于该路径下的文件。有关 `CLAUDE.md` 工作原理的更多信息，请参阅[记忆文档](/zh/memory)。

对于您不希望应用于常规 Claude Code 会话的、仅针对审查的指导，请使用 [`REVIEW.md`](#code-review-检查项) 代替。

### REVIEW.md

`REVIEW.md` 是位于仓库根目录的一个文件，它会覆盖代码审查在您仓库上的行为方式。其内容作为最高优先级的指令块被逐字粘贴到审查管道中每个代理的系统提示词中，优先级高于默认审查指导。

由于是逐字粘贴，`REVIEW.md` 仅包含纯指令：不会展开 [`@` 导入语法](/zh/memory#import-additional-files)，引用的文件也不会被读入提示词。请将您想要强制执行的规则直接写在文件中。

#### 可调整内容

`REVIEW.md` 是自由格式的 Markdown，因此任何可以表达为审查指令的内容都在调整范围内。以下模式在实践中影响最大。

**严重程度**：为您的仓库重新定义 🔴 重要 意味着什么。默认校准针对生产代码；文档仓库、配置仓库或原型可能需要更窄的定义。明确说明哪些类别的发现是重要的，哪些最多是瑕疵。您也可以向另一个方向升级，例如将任何 `CLAUDE.md` 违规视为重要而非默认的瑕疵。

**瑕疵数量**：限制单次审查发布的 🟡 瑕疵 评论数量。纯文本和配置文件可以永远打磨。设置类似“最多报告五个瑕疵，其余在摘要中以数量提及”的上限，可以使审查更具可操作性。

**跳过规则**：列出 Claude 不应发布任何发现的路径、分支模式和发现类别。常见对象包括生成的代码、锁文件、供应商依赖项、机器编写的分支，以及您的 CI 已经强制执行的任何内容，如代码检查或拼写检查。对于需要一些审查但不必全面审查的路径，请设置更高的标准，而不是完全跳过：“在 `scripts/` 中，只有几乎确定且严重的才报告。”

**仓库特定检查**：添加您希望在每个 PR 上都标记的规则，例如“新 API 路由必须有集成测试”。因为 `REVIEW.md` 作为最高优先级注入，这些规则比在冗长的 `CLAUDE.md` 中的相同规则落地更可靠。

**验证标准**：在发布某类发现之前要求提供证据。例如，“行为声明需要引用源代码中的 `file:行号`，而不是从命名推断”可以减少那些否则会让作者多跑一趟的误报。

**复审收敛**：告诉 Claude 当 PR 已经被审查过时应如何表现。例如“首次审查后，抑制新的瑕疵，只发布重要发现”的规则，可以阻止一个单行修复在风格问题上反复修改到第七轮。

**摘要形式**：要求审查正文以一行统计开头，如 `2 个事实问题，4 个风格问题`，并在没有事实问题时以“无事实问题”开头。作者希望在了解细节之前先知道工作的概貌。

#### 示例

这个 `REVIEW.md` 为后端服务重新校准了严重程度，限制了瑕疵数量，跳过了生成的文件，并添加了仓库特定检查。
```markdown
# Review instructions

## What Important means here

Reserve Important for findings that would break behavior, leak data,
or block a rollback: incorrect logic, unscoped database queries, PII
in logs or error messages, and migrations that aren't backward
compatible. Style, naming, and refactoring suggestions are Nit at
most.

## Cap the nits

Report at most five Nits per review. If you found more, say "plus N
similar items" in the summary instead of posting them inline. If
everything you found is a Nit, lead the summary with "No blocking
issues."

## Do not report

- Anything CI already enforces: lint, formatting, type errors
- Generated files under `src/gen/` and any `*.lock` file
- Test-only code that intentionally violates production rules

## Always check

- New API routes have an integration test
- Log lines don't include email addresses, user IDs, or request bodies
- Database queries are scoped to the caller's tenant
```
#### 保持重点突出

长度是有代价的：冗长的 `REVIEW.md` 会稀释最重要的规则。将其限制在能改变审查行为的指令范围内，通用项目上下文则保留在 `CLAUDE.md` 中。

## 查看使用情况

前往 [claude.ai/analytics/code-review](https://claude.ai/analytics/code-review) 查看您组织内的代码审查活动。仪表板显示：

| 部分                   | 显示内容                                                                                   |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| 已审查 PR              | 所选时间范围内每日审查的拉取请求数量                                                       |
| 每周成本               | 每周代码审查花费                                                                           |
| 反馈                   | 因开发者已解决相关问题而被自动解决的审查评论数量                                           |
| 仓库细分               | 按仓库统计的已审查 PR 数量和已解决评论数量                                                 |

管理设置中的仓库表也显示了每个仓库的平均每次审查成本。仪表板成本数据是用于监控活动的估算值；要获取发票准确的支出，请参考您的 Anthropic 账单。

## 定价

代码审查根据 token 使用量计费。每次审查平均成本为 15-25 美元，具体取决于 PR 大小、代码库复杂度以及需要验证的问题数量。代码审查用量通过[用量积分](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)单独计费，不会计入您套餐的包含用量。

您选择的审查触发器会影响总成本：

* **PR 创建后一次**：每个 PR 运行一次
* **每次推送后**：在每次推送时运行，成本乘以推送次数
* **手动**：在有人评论 `@claude review` 之前不会运行审查

在任何模式下，在 PR 上评论 `@claude review` [将使该 PR 订阅推送触发的审查](#手动触发审查)，因此在该评论之后，每次推送都会产生额外成本。要运行单次审查而不订阅未来的推送，请改为评论 `@claude review once`。

无论您的组织是否将 Amazon Bedrock 或 Google Vertex AI 用于其他 Claude Code 功能，费用都会显示在您的 Anthropic 账单上。要设置代码审查的每月支出上限，请前往 [claude.ai/admin-settings/usage](https://claude.ai/admin-settings/usage) 并为 Claude Code Review 服务配置限额。

通过[使用情况](#查看使用情况)中的每周成本图表或管理设置中的每仓库平均成本列来监控支出。

## 故障排除

审查运行是尽力而为的。失败的运行不会阻塞您的 PR，但它也不会自动重试。本节介绍如何从失败的运行中恢复，以及当检查运行报告您找不到的问题时该去哪里查找。

### 重新触发失败或超时的审查

当审查基础设施遇到内部错误或超出时间限制时，检查运行会以 **Code review encountered an error** 或 **Code review timed out** 作为标题完成。结论仍然是中性的，因此不会阻塞您的合并，但不会发布任何发现。

要再次运行审查，请在 PR 上评论 `@claude review once`。这将开始一次新的审查，而不会将 PR 订阅到未来的推送。如果 PR 已订阅推送触发的审查，推送新的提交也会开始新的审查。

GitHub 检查选项卡中的 **Re-run** 按钮不会重新触发代码审查。请改用评论命令或新的推送。

### 审查未运行且 PR 显示支出上限消息

当您组织的每月支出上限达到时，代码审查会在 PR 上发布一条评论，说明审查已跳过。审查将在下一个计费周期开始时自动恢复，或者在管理员在 [claude.ai/admin-settings/usage](https://claude.ai/admin-settings/usage) 提高上限后立即恢复。

### 查找未显示为内联注释的问题

如果检查运行标题显示发现了问题，但您在差异中没有看到内联审查注释，请在以下其他位置查看发现的问题：

* **检查运行详情**：在检查选项卡中，点击 Claude Code Review 检查旁边的 **Details**。严重性表格列出了每个发现，包括其文件、行和摘要，无论内联注释是否被接受。
* **文件变更注解**：打开 PR 上的 **Files changed** 选项卡。发现的问题会作为直接附加到差异行的注解呈现，与审查评论分开。
* **审查正文**：如果您在审查运行时向 PR 推送了内容，一些发现可能引用了当前差异中已不存在的行。这些发现会出现在审查正文文本中的 **Additional findings** 标题下，而不是作为内联注释。

## 在本地审查差异

[`/code-review` 命令](/zh/commands)可在您的终端中审查差异，无需安装 GitHub App。在任何 Claude Code 会话中运行它：它会报告当前差异中的正确性错误以及 复用、简化和效率方面的清理建议。传递 `--comment` 可将发现作为内联 PR 注释发布，或传递 `--fix` 可在审查后将发现应用到您的工作树。

较低的[努力级别](/zh/model-config#adjust-effort-level)会返回更少但置信度更高的发现，而从 `high` 到 `max` 则提供更广泛的覆盖范围，并可能包括不确定的发现。如果不提供努力参数，审查将使用会话的当前努力级别。传递路径或 PR 引用可以审查特定目标，而非当前差异。

`/code-review ultra --fix` 会在云端运行更深入的 [ultrareview](/zh/ultrareview)，然后在其结果返回您的会话后，将发现应用到您的工作树。

该命令在 v2.1.147 之前名为 `/simplify`，当时它默认应用修复。从 v2.1.154 开始，`/simplify` 运行一个单独的仅清理审查，该审查会应用修复而不查找错误。如果您之前编写了 `/simplify` 脚本来查找错误，请切换到未更改的 `/code-review --fix`。

## 相关资源

代码审查设计为与 Claude Code 的其余部分协同工作。如果您想在打开 PR 之前在本地运行审查，需要自托管设置，或者想深入了解 `CLAUDE.md` 如何跨工具塑造 Claude 的行为，以下页面是不错的下一步：

* [命令](/zh/commands)：在本地 Claude Code 会话中运行 `/code-review` 以在推送前检查差异
* [GitHub Actions](/zh/github-actions)：在您自己的 GitHub Actions 工作流中运行 Claude，实现超越代码审查的自定义自动化
* [GitLab CI/CD](/zh/gitlab-ci-cd)：用于 GitLab 管道的自托管 Claude 集成
* [记忆](/zh/memory)：`CLAUDE.md` 文件如何在 Claude Code 中工作
* [分析](/zh/analytics)：跟踪代码审查之外的 Claude Code 使用情况