> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# 有效管理成本

> 通过上下文管理、模型选择、扩展思考设置和预处理钩子，跟踪token使用情况、设置团队支出限额并降低Claude Code成本。

Claude Code按API token消耗量计费。关于订阅计划定价（Pro、Max、Team、Enterprise），请参见[claude.com/pricing](https://claude.com/pricing)。每位开发者的成本因模型选择、代码库大小以及使用模式（如运行多个实例或自动化）而差异巨大。

在企业部署中，平均成本约为每位开发者每个活跃日13美元，每月150至250美元，90%的用户成本保持在每个活跃日30美元以下。若要估算您团队的支出，可以从一个小型试点小组开始，并使用下方的跟踪工具建立基线，然后再进行更广泛的推广。

本页介绍如何[跟踪您的成本](#跟踪您的成本)、[管理团队成本]以及[减少token使用量]。

## 跟踪您的成本

### 使用 `/usage` 命令

  `/usage` 中的会话区块显示 API token 用量，主要面向 API 用户。Claude Max 和 Pro 订阅者的订阅已包含用量，因此会话费用数字不用于计费目的。订阅用户在同一界面可以看到套餐用量条、活动统计和用量明细。

`/usage` 页面顶部的会话区块显示当前会话的详细 token 使用统计数据。所示金额是根据 token 计数本地估算的数值，可能与您的实际账单存在差异。如需查看权威账单信息，请访问 [Claude Console](https://platform.claude.com/usage) 中的 Usage 页面。
```text
Total cost:            $0.55
Total duration (API):  6m 19.7s
Total duration (wall): 6h 33m 10.2s
Total code changes:    0 lines added, 0 lines removed
```
在 Pro、Max、Team 或 Enterprise 计划中，`/usage` 还会显示哪些内容计入您的计划限额的分解统计。它将近期使用量按技能、子代理、插件和各个 MCP 服务器进行归因，每项都显示为占总使用量的百分比。按 `d` 或 `w` 可切换显示最近 24 小时或最近 7 天的数据。这些数据是大致的，并根据本机的本地会话历史记录计算，因此不包含来自其他设备或 claude.ai 的使用量。

## 团队费用管理

使用 Claude API 时，您可以[设置工作区支出限额](https://platform.claude.com/docs/en/build-with-claude/workspaces#workspace-limits)，以限制 Claude Code 工作区的总支出。管理员可以在控制台中[查看费用和使用报告](https://platform.claude.com/docs/en/build-with-claude/workspaces#usage-and-cost-tracking)。

在 Pro 和 Max 计划中，您可以使用 `/usage-credits` 命令设置每月使用额度支出限额。如果您在仍有可用额度的情况下达到该限额，Claude Code 会提示您提高或移除该限额，以便您可以继续使用而不必退出 CLI。更改限额需要账户的计费访问权限。

  当你首次使用 Claude Console 账户认证 Claude Code 时，系统会自动为你创建一个名为 "Claude Code" 的工作区。此工作区为组织内所有 Claude Code 使用提供集中成本追踪与管理功能。该工作区无法创建 API 密钥；它专门用于 Claude Code 的认证和使用。

  对于自定义速率限制的组织，此工作区的 Claude Code 流量会计入组织的整体 API 速率限制。你可以在 Claude Console 中此工作区的"限制"页面设置[工作区速率限制](https://platform.claude.com/docs/en/api/rate-limits#setting-lower-limits-for-workspaces)，以限制 Claude Code 的使用配额，从而保护其他生产工作负载。

在 Bedrock、Vertex 和 Foundry 上，Claude Code 不会从您的云端发送指标。为了获取成本指标，多家大型企业报告使用了 [LiteLLM](/zh/llm-gateway#litellm-configuration)，这是一个开源工具，可帮助企业[按密钥跟踪支出](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend)。该项目与 Anthropic 无关，且未经过安全审计。

### 速率限制建议

为团队设置 Claude Code 时，请根据组织规模参考以下每用户每分钟 Token 数 (TPM) 和每分钟请求数 (RPM) 建议：

| 团队规模      | 每用户 TPM | 每用户 RPM |
| ------------- | ---------- | ---------- |
| 1-5 用户      | 200k-300k  | 5-7        |
| 5-20 用户     | 100k-150k  | 2.5-3.5    |
| 20-50 用户    | 50k-75k    | 1.25-1.75  |
| 50-100 用户   | 25k-35k    | 0.62-0.87  |
| 100-500 用户  | 15k-20k    | 0.37-0.47  |
| 500+ 用户     | 10k-15k    | 0.25-0.35  |

例如，如果您有 200 名用户，您可以为每位用户申请 20k TPM，即总计 400 万 TPM（200*20,000 = 400 万）。

随着团队规模扩大，每用户的 TPM 会减少，因为在大型组织中，同时使用 Claude Code 的用户比例通常较低。这些速率限制在组织级别生效，而非针对单个用户，这意味着当其他人不活跃使用服务时，单个用户可以暂时消耗超过其计算份额的资源。

  如果您预计会遇到异常高的并发使用场景（例如大规模团队现场培训），可能需要为每位用户分配更高的每分钟token数（TPM）。

### 代理团队 token 成本

[代理团队](/zh/agent-teams) 会生成多个 Claude Code 实例，每个实例拥有自己的上下文窗口。Token 使用量随活动队友数量及每个实例的运行时长而增长。

为控制代理团队成本：

* 为队友使用 Sonnet 模型。它在协调任务的能力与成本间取得良好平衡。
* 保持团队精简。每个队友运行独立的上下文窗口，因此 token 使用量大致与团队规模成正比。
* 使生成提示词聚焦。队友会自动加载 CLAUDE.md、MCP 服务器和技能，但生成提示词中的所有内容都会从一开始就加入其上下文。
* 工作完成后清理团队。活动的队友即使处于空闲状态也会持续消耗 token。
* 代理团队默认处于禁用状态。在你的 [settings.json](/zh/settings) 或环境变量中设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 以启用它们。参见 [启用代理团队](/zh/agent-teams#enable-agent-teams)。

## 减少 token 使用量

Token 成本随上下文大小增长：Claude 处理的上下文越多，消耗的 token 越多。Claude Code 通过 [提示词缓存](/zh/prompt-caching) 自动优化成本，这减少了系统提示等重复内容的费用，并通过自动压缩在接近上下文限制时总结对话历史。

以下策略有助于保持上下文精简并降低每条消息的成本。

### 主动管理上下文

使用 `/usage` 检查当前的 token 使用量，或[配置你的状态行](/zh/statusline#context-window-usage) 以持续显示。

* **任务间清除上下文**：切换到无关工作时使用 `/clear` 以全新状态开始。陈旧的上下文会在后续每条消息上浪费 token。清除前使用 `/rename` 以便稍后轻松找到该会话，然后使用 `/resume` 返回。
* **添加自定义压缩指令**：`/compact Focus on code samples and API usage` 告诉 Claude 在总结时应保留什么。

你也可以在 CLAUDE.md 中自定义压缩行为：
```markdown
# Compact instructions

When you are using compact, please focus on test output and code changes
```
### 选择合适的模型

Sonnet 能很好地处理大多数编码任务，且成本低于 Opus。对于复杂的架构决策或多步骤推理，请保留使用 Opus。使用 `/model` 在会话中途切换模型，或在 `/config` 中设置默认模型。对于简单的子代理任务，请在你的[子代理配置](/zh/sub-agents#choose-a-model)中指定 `model: haiku`。

### 减少 MCP 服务器开销

MCP 工具定义默认是[延迟加载](/zh/mcp#scale-with-mcp-tool-search)的，因此只有工具名称会进入上下文，直到 Claude 使用特定工具时才会加载完整定义。运行 `/context` 可查看哪些内容占据了空间。

* **尽可能优先使用命令行工具**：像 `gh`、`aws`、`gcloud` 和 `sentry-cli` 这样的工具在上下文效率上仍优于 MCP 服务器，因为它们不会增加任何每个工具的条目。Claude 可以直接运行命令行命令。
* **禁用未使用的服务器**：运行 `/mcp` 查看已配置的服务器，并禁用那些你当前未在使用的服务器。

### 为类型化语言安装代码智能插件

[代码智能插件](/zh/discover-plugins#code-intelligence)能让 Claude 精确地进行符号导航，而不是基于文本的搜索，从而减少在探索不熟悉代码时的不必要文件读取。一次“转到定义”的调用就能替代可能需要先进行 grep 搜索再读取多个候选文件的过程。安装的语言服务器在编辑后也会自动报告类型错误，这样 Claude 无需运行编译器就能发现错误。

### 将处理卸载给钩子和技能

自定义[钩子](/zh/hooks)可以在 Claude 看到数据前对其进行预处理。例如，让一个钩子去 grep `ERROR` 并只返回匹配行，而不是让 Claude 读取一个 10,000 行的日志文件来查找错误，这样可以将上下文从数万个 token 减少到数百个。

一个[技能](/zh/skills)可以赋予 Claude 领域知识，使其无需进行探索。例如，一个“代码库概览”技能可以描述你项目的架构、关键目录和命名约定。当 Claude 调用该技能时，它能立即获得这些上下文，而不是花费 token 去读取多个文件来理解结构。

例如，以下 PreToolUse 钩子过滤测试输出以仅显示失败项：


    将以下内容添加到你的 [settings.json](/zh/settings#settings-files) 中，以在每次 Bash 命令前运行钩子：
    ```json
    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "Bash",
            "hooks": [
              {
                "type": "command",
                "command": "~/.claude/hooks/filter-test-output.sh"
              }
            ]
          }
        ]
      }
    }
    ```



    钩子会调用此脚本，该脚本检查命令是否为测试运行器，并对其进行修改以仅显示失败项。
    ```bash
    #!/bin/bash
    input=$(cat)
    cmd=$(echo "$input" | jq -r '.tool_input.command')

    # If running tests, filter to show only failures
    if [[ "$cmd" =~ ^(npm test|pytest|go test) ]]; then
      filtered_cmd="$cmd 2>&1 | grep -A 5 -E '(FAIL|ERROR|error:)' | head -100"
      echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\",\"updatedInput\":{\"command\":\"$filtered_cmd\"}}}"
    else
      echo "{}"
    fi
    ```


### 将指令从 CLAUDE.md 迁移至技能

您的 [CLAUDE.md](/zh/memory) 文件会在会话启动时加载到上下文中。如果它包含针对特定工作流程（如PR审查或数据库迁移）的详细指令，即使您在进行不相关的工作，这些token也会存在。[技能](/zh/skills) 仅在被调用时按需加载，因此将专门性指令移入技能可保持您的基础上下文更精简。目标是将 CLAUDE.md 控制在200行以内，仅包含核心内容。

### 调整扩展思考

默认启用扩展思考，因为它能显著提升复杂规划和推理任务的性能。思考token按输出token计费，根据模型不同，默认预算可能高达每请求数万token。对于无需深度推理的简单任务，您可以通过 `/effort` 或在 `/model` 中降低[努力等级](/zh/model-config#adjust-effort-level)，在 `/config` 中禁用思考，或通过 `MAX_THINKING_TOKENS=8000` 降低预算来减少成本。

### 将冗长操作委托给子代理

运行测试、获取文档或处理日志文件可能会消耗大量上下文。请将这些任务委托给[子代理](/zh/sub-agents#isolate-high-volume-operations)，以便冗长的输出保留在子代理的上下文中，而只有摘要返回到您的主对话中。

### 管理代理团队成本

当队友在计划模式下运行时，代理团队使用的token大约是标准会话的7倍，因为每个队友都维护自己的上下文窗口并作为独立的Claude实例运行。保持团队任务小型且自包含，以限制每个队友的token使用量。详情请参阅[代理团队](/zh/agent-teams)。

### 编写具体的提示词

模糊的请求（如“改进此代码库”）会触发广泛的扫描。具体的请求（如“在 auth.ts 中的登录函数添加输入验证”）能让Claude高效工作，只需最少的文件读取。

### 高效处理复杂任务

对于更长或更复杂的工作，以下习惯有助于避免因走错方向而浪费token：

* **对复杂任务使用计划模式**：在实施前按 Shift+Tab 进入[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)。Claude会探索代码库并提出方案供您批准，当初始方向错误时，可以防止代价高昂的返工。
* **及早纠正方向**：如果Claude开始走错方向，立即按Escape停止。使用 `/rewind` 或双击Escape来恢复对话和代码到之前的[检查点](/zh/skills#checkpoints)。
* **提供验证目标**：在提示词中包含测试用例、粘贴截图或定义预期输出。当Claude能验证自己的工作时，可以在您要求修复之前就发现问题。
* **增量测试**：编写一个文件，测试它，然后继续。这样可以在问题修复成本较低时及早发现它们。

## 后台token使用

Claude Code在空闲时也会为一些后台功能使用token：

* **对话摘要**：为 `claude --resume` 功能总结先前对话的后台任务
* **命令处理**：某些命令（如 `/usage`）可能会生成检查状态的请求

这些后台进程即使在没有活跃交互的情况下，也会消耗少量的token（通常每会话低于 $0.04）。

## 理解 Claude Code 行为的变化

Claude Code 会定期接收更新，这些更新可能会改变功能的工作方式，包括成本报告。运行 `claude --version` 以检查您的当前版本。如有具体计费问题，请通过您的[控制台账户](https://platform.claude.com/login)联系Anthropic支持。