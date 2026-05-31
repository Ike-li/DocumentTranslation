> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 代理循环如何运作

> 理解消息生命周期、工具执行、上下文窗口以及驱动您 SDK 代理的架构。

Agent SDK 让您能够将 Claude Code 的自主代理循环嵌入到自己的应用程序中。该 SDK 是一个独立的包，可让您对工具、权限、成本限制和输出进行编程控制。使用它无需安装 Claude Code CLI。

当您启动一个代理时，SDK 会运行与[驱动 Claude Code 的相同执行循环](/en/how-claude-code-works#the-agentic-loop)：Claude 评估您的提示词，调用工具执行操作，接收结果，并重复此过程直到任务完成。本页面解释了该循环内部发生的事情，以便您能够有效地构建、调试和优化您的代理。

## 循环概览

每个代理会话都遵循相同的周期：

<img src="https://mintcdn.com/claude-code/gvy2DIUELtNA8qD3/images/agent-loop-diagram.svg?fit=max&auto=format&n=gvy2DIUELtNA8qD3&q=85&s=192e1bd6c8a2950a16e5ee0b94e27e26" alt="代理循环：提示词输入，Claude 评估，分支到工具调用或最终答案" width="680" height="150" data-path="images/agent-loop-diagram.svg" />

1.  **接收提示词。** Claude 接收您的提示词，以及系统提示词、工具定义和对话历史。SDK 会生成一个包含会话元数据的 [`SystemMessage`](#消息类型)（子类型为 `"init"`）。
2.  **评估并响应。** Claude 评估当前状态并决定如何进行。它可能回复文本、请求一个或多个工具调用，或两者兼有。SDK 会生成一个包含文本和任何工具调用请求的 [`AssistantMessage`](#消息类型)。
3.  **执行工具。** SDK 运行每个请求的工具并收集结果。每组工具结果都会反馈给 Claude 以进行下一步决策。您可以使用[钩子](/en/agent-sdk/hooks)在工具运行前拦截、修改或阻止工具调用。
4.  **重复。** 步骤 2 和 3 作为一个循环重复。每个完整循环即为一个轮次。Claude 持续调用工具并处理结果，直到生成一个不包含工具调用的响应。
5.  **返回结果。** SDK 生成最终的 [`AssistantMessage`](#消息类型)，其中包含文本响应（无工具调用），然后生成一个 [`ResultMessage`](#消息类型)，其中包含最终文本、token 使用量、成本和会话 ID。

一个快速的问题（“这里有哪些文件？”）可能只需要调用 `Glob` 并响应结果的一两个轮次。一个复杂的任务（“重构 auth 模块并更新测试”）可以在多个轮次中链接数十个工具调用，读取文件、编辑代码和运行测试，Claude 会根据每个结果调整其方法。

## 轮次与消息

一个轮次是循环内部的一次往返：Claude 生成包含工具调用的输出，SDK 执行这些工具，并将结果自动反馈给 Claude。此过程不会将控制权交还给您的代码。轮次会持续进行，直到 Claude 生成不包含工具调用的输出，此时循环结束，最终结果被交付。

考虑一下针对提示词“修复 auth.ts 中失败的测试”的完整会话可能是什么样子。

首先，SDK 将您的提示词发送给 Claude，并生成一个包含会话元数据的 [`SystemMessage`](#消息类型)。然后循环开始：

1.  **轮次 1：** Claude 调用 `Bash` 来运行 `npm test`。SDK 生成一个包含工具调用的 [`AssistantMessage`](#消息类型)，执行命令，然后生成一个包含输出（三个失败）的 [`UserMessage`](#消息类型)。
2.  **轮次 2：** Claude 对 `auth.ts` 和 `auth.test.ts` 调用 `Read`。SDK 返回文件内容并生成一个 `AssistantMessage`。
3.  **轮次 3：** Claude 调用 `Edit` 修复 `auth.ts`，然后调用 `Bash` 重新运行 `npm test`。所有三个测试都通过了。SDK 生成一个 `AssistantMessage`。
4.  **最终轮次：** Claude 生成一个不包含工具调用的纯文本响应：“已修复 auth 错误，现在所有三个测试都通过了。” SDK 生成一个包含此文本的最终 `AssistantMessage`，然后生成一个包含相同文本以及成本和用量信息的 [`ResultMessage`](#消息类型)。

这是四个轮次：三个包含工具调用，一个是最终的纯文本响应。

您可以使用 `max_turns` / `maxTurns` 来限制循环，该参数仅计算使用工具的轮次。例如，上面循环中的 `max_turns=2` 会在编辑步骤之前停止。您也可以使用 `max_budget_usd` / `maxBudgetUsd` 来基于支出阈值限制轮次。

如果没有限制，循环会运行直到 Claude 自行完成，这对于范围明确的任务是可以的，但在开放式提示（“改进这个代码库”）上可能会运行很长时间。为生产代理设置预算通常是一个好的默认做法。有关选项参考，请参阅下面的[轮次与预算](#轮次与预算)部分。

## 消息类型

循环运行时，SDK 会生成一个消息流。每条消息都携带一个类型，告诉您它来自循环的哪个阶段。五种核心类型是：

*   **`SystemMessage`：** 会话生命周期事件。`subtype` 字段区分它们：`"init"` 是第一条消息（会话元数据），`"compact_boundary"` 在[压缩](#自动压缩)后触发。在 TypeScript 中，压缩边界是其自己的 [`SDKCompactBoundaryMessage`](/en/agent-sdk/typescript#sdkcompactboundarymessage) 类型，而不是 `SDKSystemMessage` 的子类型。
*   **`AssistantMessage`：** 在每次 Claude 响应后发出，包括最终的纯文本响应。包含该轮次的文本内容块和工具调用块。
*   **`UserMessage`：** 在每次工具执行后发出，包含反馈给 Claude 的工具结果内容。对于您在循环中流式传输的任何用户输入也会发出。
*   **`StreamEvent`：** 仅在启用部分消息时发出。包含原始 API 流式事件（文本增量、工具输入块）。请参阅[流式传输响应](/en/agent-sdk/streaming-output)。
*   **`ResultMessage`：** 标记代理循环的结束。包含最终文本结果、token 使用量、成本和会话 ID。检查 `subtype` 字段以确定任务是成功完成还是达到了限制。一小部分尾随系统事件（如 `prompt_suggestion`）可能会在它之后到达，因此请迭代流直到完成，而不是在结果处中断。请参阅[处理结果](#处理结果)。

这五种类型涵盖了两个 SDK 中完整的代理循环生命周期。TypeScript SDK 还会生成额外的可观察性事件（钩子事件、工具进度、速率限制、任务通知），这些事件提供了额外的细节，但不是驱动循环所必需的。有关完整列表，请参阅 [Python 消息类型参考](/en/agent-sdk/python#message-types)和 [TypeScript 消息类型参考](/en/agent-sdk/typescript#message-types)。

### 处理消息

您处理哪些消息取决于您正在构建的内容：

*   **仅处理最终结果：** 处理 `ResultMessage` 以获取输出、成本以及任务是成功完成还是达到限制。
*   **进度更新：** 处理 `AssistantMessage` 以查看 Claude 每个轮次的操作，包括它调用了哪些工具。
*   **实时流式传输：** 启用部分消息（Python 中为 `include_partial_messages`，TypeScript 中为 `includePartialMessages`）以实时获取 `StreamEvent` 消息。请参阅[实时流式传输响应](/en/agent-sdk/streaming-output)。

如何检查消息类型取决于 SDK：

*   **Python：** 使用 `isinstance()` 检查从 `claude_agent_sdk` 导入的类（例如，`isinstance(message, ResultMessage)`）。
*   **TypeScript：** 检查 `type` 字符串字段（例如，`message.type === "result"`）。`AssistantMessage` 和 `UserMessage` 将原始 API 消息包装在 `.message` 字段中，因此内容块位于 `message.message.content`，而不是 `message.content`。


    ```python Python
    from claude_agent_sdk import query, AssistantMessage, ResultMessage

    async for message in query(prompt="Summarize this project"):
        if isinstance(message, AssistantMessage):
            print(f"Turn completed: {len(message.content)} content blocks")
        if isinstance(message, ResultMessage):
            if message.subtype == "success":
                print(message.result)
            else:
                print(f"Stopped: {message.subtype}")
    ```

    ```typescript TypeScript
    import { query } from "@anthropic-ai/claude-agent-sdk";

    for await (const message of query({ prompt: "Summarize this project" })) {
      if (message.type === "assistant") {
        console.log(`Turn completed: ${message.message.content.length} content blocks`);
      }
      if (message.type === "result") {
        if (message.subtype === "success") {
          console.log(message.result);
        } else {
          console.log(`Stopped: ${message.subtype}`);
        }
      }
    }
    ```


## 工具执行

工具赋予你的代理执行操作的能力。没有工具，Claude 只能通过文本进行响应。有了工具，Claude 就可以读取文件、运行命令、搜索代码以及与外部服务进行交互。

### 内置工具

SDK 包含了驱动 Claude Code 的相同工具：

| 类别                | 工具                                                              | 功能                                                                                           |
| :------------------ | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **文件操作**        | `Read`、`Edit`、`Write`                                           | 读取、修改和创建文件                                                                           |
| **搜索**            | `Glob`、`Grep`                                                    | 按模式查找文件、用正则表达式搜索内容                                                           |
| **执行**            | `Bash`                                                            | 运行 Shell 命令、脚本、Git 操作                                                                |
| **网络**            | `WebSearch`、`WebFetch`                                           | 搜索网络、获取并解析页面                                                                       |
| **发现**            | `ToolSearch`                                                      | 按需动态查找和加载工具，而不是预加载全部工具                                                   |
| **编排**            | `Agent`、`Skill`、`AskUserQuestion`、`TaskCreate`、`TaskUpdate`    | 生成子代理、调用技能、向用户提问、跟踪任务                                                     |

除了内置工具，你还可以：

*   通过 [MCP 服务器](/en/agent-sdk/mcp) **连接外部服务**（数据库、浏览器、API）
*   通过[自定义工具处理器](/en/agent-sdk/custom-tools) **定义自定义工具**
*   通过[设置源](/en/agent-sdk/claude-code-features) **加载项目技能**，用于可复用的工作流程

### 工具权限

Claude 根据任务决定调用哪些工具，但你可以控制这些调用是否被允许执行。你可以自动批准特定工具，完全阻止其他工具，或者要求所有操作都经过批准。有三个选项共同决定哪些操作可以运行：

*   **`allowed_tools` / `allowedTools`** 自动批准列出的工具。一个在其允许工具列表中设置了 `["Read", "Glob", "Grep"]` 的只读代理将无需提示即可运行这些工具。未列出的工具仍然可用，但需要权限。
*   **`disallowed_tools` / `disallowedTools`** 阻止列出的工具，无论其他设置如何。有关工具运行前规则检查的顺序，请参见[权限](/en/agent-sdk/permissions)。
*   **`permission_mode` / `permissionMode`** 控制不属于允许或拒绝规则覆盖范围的工具会发生什么情况。有关可用模式，请参见[权限模式](#permission-mode)。

你也可以使用规则（如 `"Bash(npm *)"`）来限定单个工具的范围，只允许特定命令。完整的规则语法请参见[权限](/en/agent-sdk/permissions)。

当工具被拒绝时，Claude 会收到一条拒绝消息作为工具结果，并通常会尝试不同的方法或报告无法继续。

### 并行工具执行

当 Claude 在单个回合中请求多个工具调用时，两个 SDK 都可以并发或顺序运行它们，具体取决于工具。只读工具（如 `Read`、`Glob`、`Grep` 以及标记为只读的 MCP 工具）可以并发运行。会修改状态的工具（如 `Edit`、`Write` 和 `Bash`）则顺序运行以避免冲突。

自定义工具默认顺序执行。要为自定义工具启用并行执行，请在其注解中设置 `readOnlyHint`。[TypeScript](/en/agent-sdk/typescript#tool) 和 [Python](/en/agent-sdk/python#tool) SDK 都使用这个来自 MCP SDK 的字段名。

## 控制循环如何运行

你可以限制循环进行的轮次、花费的成本、Claude 的推理深度，以及工具运行前是否需要批准。所有这些都是 [`ClaudeAgentOptions`](/en/agent-sdk/python#claudeagentoptions)（Python）/ [`Options`](/en/agent-sdk/typescript#options)（TypeScript）上的字段。

### 轮次与预算

| 选项                                           | 控制内容                | 默认值   |
| :--------------------------------------------- | :---------------------- | :------- |
| 最大轮次 (`max_turns` / `maxTurns`)            | 工具使用的最大往返次数  | 无限制   |
| 最大预算 (`max_budget_usd` / `maxBudgetUsd`)   | 停止前的最大成本        | 无限制   |

当任一限制被触发时，SDK 会返回一个带有相应错误子类型（`error_max_turns` 或 `error_max_budget_usd`）的 `ResultMessage`。如何检查这些子类型请参见[处理结果](#handle-the-result)，语法请参见 [`ClaudeAgentOptions`](/en/agent-sdk/python#claudeagentoptions) / [`Options`](/en/agent-sdk/typescript#options)。

### 努力级别

`effort` 选项控制 Claude 应用多少推理能力。较低的努力级别每轮使用的 token 更少，成本更低。并非所有模型都支持 effort 参数。哪些模型支持请参见[努力级别](https://platform.claude.com/docs/en/build-with-claude/effort)。

| 级别       | 行为                           | 适用于                                   |
| :--------- | :----------------------------- | :--------------------------------------- |
| `"low"`    | 最少推理，快速响应             | 文件查找、列出目录                       |
| `"medium"` | 平衡推理                       | 常规编辑、标准任务                       |
| `"high"`   | 彻底分析                       | 重构、调试                               |
| `"xhigh"`  | 扩展推理深度                   | 编码和智能体任务；推荐在 Opus 4.7 上使用 |
| `"max"`    | 最大推理深度                   | 需要深度分析的多步骤问题                 |

如果你不设置 `effort`，Python SDK 将不设置该参数，交由模型的默认行为决定。TypeScript SDK 默认为 `"high"`。

  `effort` 参数在每次响应中平衡推理深度与延迟和 token 成本。[扩展思考](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) 是一项独立功能，会在输出中生成可见的思维链块。两者相互独立：你可以设置 `effort: "low"` 同时启用扩展思考，也可以设置 `effort: "max"` 而不启用它。

为执行简单且范围明确的任务（如列出文件或运行单次 `grep`）的代理设置较低 `effort` 值，以降低成本和延迟。在顶层 `query()` 选项中为整个会话设置 `effort`，或通过 `AgentDefinition` 的 `effort` 字段为每个子代理单独设置以覆盖会话级别。

### 权限模式

权限模式选项（Python 中为 `permission_mode`，TypeScript 中为 `permissionMode`）控制代理在使用工具前是否请求批准：

| 模式                         | 行为                                                                                                                                                                                   |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"default"`                  | 未被允许规则覆盖的工具会触发您的批准回调；无回调则视为拒绝                                                                                                                              |
| `"acceptEdits"`              | 自动批准文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等）；其他 Bash 命令遵循默认规则                                                                                          |
| `"plan"`                     | 只读工具可运行；Claude 探索并制定计划，而不编辑您的源文件                                                                                                                                |
| `"dontAsk"`                  | 永不提示。经[权限规则](/en/settings#permission-settings)预批准的工具可运行，其他一概拒绝                                                                                                 |
| `"auto"`（仅 TypeScript）    | 使用模型分类器批准或拒绝每次工具调用。参见[自动模式](/en/permission-modes#eliminate-prompts-with-auto-mode)了解可用性和行为                                                                |
| `"bypassPermissions"`        | 运行所有允许的工具，无需询问。在 Unix 上以 root 身份运行时不可用。仅在隔离环境中使用，此时代理的操作不会影响您关心的系统                                                                 |

对于交互式应用，使用 `"default"` 并配合工具批准回调来显示批准提示。对于开发机器上的自主代理，`"acceptEdits"` 会自动批准文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等），同时仍通过允许规则限制其他 `Bash` 命令。将 `"bypassPermissions"` 保留用于 CI、容器或其他隔离环境。完整详情请参阅[权限](/en/agent-sdk/permissions)。

### 模型

如果您未设置 `model`，SDK 将使用 Claude Code 的默认值，这取决于您的认证方法和订阅。请明确设置（例如 `model="claude-sonnet-4-6"`）以固定特定模型或使用更小、更快、更便宜的模型用于代理。可用 ID 请参阅[模型](https://platform.claude.com/docs/en/about-claude/models)。

## 上下文窗口

上下文窗口是会话期间 Claude 可用的总信息量。它在会话内的轮次之间不会重置。所有内容都会累积：系统提示词、工具定义、对话历史、工具输入和工具输出。跨轮次保持不变的内容（系统提示词、工具定义、CLAUDE.md）会自动进行[提示词缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)，从而降低重复前缀的成本和延迟。

### 什么消耗上下文

以下是 SDK 中各组成部分如何影响上下文：

| 来源                   | 加载时机                                                             | 影响                                                                                                                                                                                                                                                                                                                  |
| :--------------------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **系统提示词**         | 每次请求                                                             | 固定小成本，始终存在                                                                                                                                                                                                                                                                                                    |
| **CLAUDE.md 文件**     | 会话开始时，通过 [`settingSources`](/en/agent-sdk/claude-code-features) | 每次请求包含完整内容（但已进行提示词缓存，因此仅首次请求支付完整成本）                                                                                                                                                                                                                                                  |
| **工具定义**           | 每次请求；MCP 架构默认延迟加载                                        | 内置工具架构每次请求加载。[工具搜索](/en/agent-sdk/mcp#mcp-tool-search) 默认延迟 MCP 工具架构，在 Vertex AI 或非第一方 `ANTHROPIC_BASE_URL` 上回退到预先加载。完整矩阵请参阅[配置工具搜索](/en/agent-sdk/tool-search#configure-tool-search)                                                                                    |
| **对话历史**           | 跨轮次累积                                                           | 随每轮增长：提示词、响应、工具输入、工具输出                                                                                                                                                                                                                                                                            |
| **技能描述**           | 会话开始时，通过设置源                                                | 简短摘要；仅在调用时加载完整内容                                                                                                                                                                                                                                                                                        |

大型工具输出会消耗大量上下文。读取大文件或运行输出详细的命令可能在单轮内使用数千个 token。上下文跨轮次累积，因此具有许多工具调用的较长会话会比短会话积累明显更多的上下文。

### 自动压缩

当上下文窗口接近其限制时，SDK 会自动压缩对话：它将总结较旧的历史记录以释放空间，同时保持您最近的交流和关键决策不变。发生这种情况时，SDK 会在流中发出一条 `type: "system"` 且 `subtype: "compact_boundary"` 的消息（在 Python 中是 `SystemMessage`；在 TypeScript 中是单独的 `SDKCompactBoundaryMessage` 类型）。

压缩会用摘要替换较旧的消息，因此对话早期的具体指令可能无法保留。持久规则应放在 CLAUDE.md（通过 [`settingSources`](/en/agent-sdk/claude-code-features) 加载）中，而不是初始提示词中，因为 CLAUDE.md 内容会在每次请求时重新注入。

您可以通过几种方式自定义压缩行为：

* **CLAUDE.md 中的总结指令：** 压缩器像读取任何其他上下文一样读取您的 CLAUDE.md，因此您可以添加一个部分，告知它在总结时应保留什么。该部分标题是自由形式的（不是魔法字符串）；压缩器根据意图进行匹配。
* **`PreCompact` 钩子：** 在压缩发生前运行自定义逻辑，例如归档完整的对话记录。该钩子接收一个 `trigger` 字段（`manual` 或 `auto`）。参见[钩子](/en/agent-sdk/hooks)。
* **手动压缩：** 发送 `/compact` 作为提示字符串以按需触发压缩。以这种方式发送的命令是 SDK 输入，而非仅限 CLI 的快捷方式。参见 [SDK 中的命令](/en/agent-sdk/slash-commands)。

  在项目的 CLAUDE.md 中添加一个部分，告诉压缩器需要保留哪些内容。标题名称不固定；使用任何清晰的标签即可。
  ```markdown CLAUDE.md
  # Summary instructions

  When summarizing this conversation, always preserve:
  - The current task objective and acceptance criteria
  - File paths that have been read or modified
  - Test results and error messages
  - Decisions made and the reasoning behind them
  ```

### 保持上下文高效

针对长时间运行的代理的一些策略：

* **对子任务使用子代理。** 每个子代理都从一个全新的对话开始（没有先前的消息历史，不过它确实会加载自己的系统提示和项目级上下文，如 CLAUDE.md）。它看不到父代理的轮次，只有其最终响应会作为工具结果返回给父代理。主代理的上下文仅增加该摘要内容，而非完整的子任务记录。详情请参见 [子代理继承了什么](/en/agent-sdk/subagents#what-subagents-inherit)。
* **有选择地使用工具。** 每个工具定义都会占用上下文空间。使用 [`AgentDefinition`](/en/agent-sdk/subagents#agentdefinition-configuration) 上的 `tools` 字段来将子代理限定在它们所需的最小工具集范围内。
* **注意 MCP 服务器成本。** [MCP 工具搜索](/en/agent-sdk/mcp#mcp-tool-search) 默认会延迟加载 MCP 工具的模式，并按需加载它们。当工具搜索关闭、使用 Vertex AI 或通过非第一方的 `ANTHROPIC_BASE_URL` 访问时，每个 MCP 服务器都会将其所有工具模式添加到每个请求中，因此少数拥有大量工具的服务器可能会在代理执行任何工作之前就消耗掉大量上下文。
* **对常规任务使用较低的 effort 设置。** 对于仅需读取文件或列出目录的代理，将 [effort](#effort-level) 设置为 `"low"`。这可以减少 token 使用量和成本。

有关各功能上下文成本的详细分解，请参见 [理解上下文成本](/en/features-overview#understand-context-costs)。

## 会话与连续性

与 SDK 的每次交互都会创建或继续一个会话。从 `ResultMessage.session_id`（两个 SDK 中均可用）捕获会话 ID 以便稍后恢复。TypeScript SDK 也将其作为初始化 `SystemMessage` 上的直接字段暴露；在 Python 中，它嵌套在 `SystemMessage.data` 中。

当您恢复时，先前轮次的完整上下文将被恢复：已读取的文件、已执行的分析以及已采取的操作。您也可以分叉一个会话，以分支到不同的方法，而不会修改原始会话。

有关恢复、继续和分叉模式的完整指南，请参见 [会话管理](/en/agent-sdk/sessions)。

  在 Python 中，`ClaudeSDKClient` 在多次调用中会自动处理会话 ID。详见 [Python SDK 参考文档](/en/agent-sdk/python#choosing-between-query-and-claudesdkclient)。

## 处理结果

循环结束时，`ResultMessage` 会告知您发生了什么并给出输出结果。`subtype` 字段（两个 SDK 中均可用）是检查终止状态的主要方式。

| 结果子类型                            | 发生情况                                                                   | `result` 字段是否可用 |
| :------------------------------------ | :------------------------------------------------------------------------- | :-------------------: |
| `success`                             | Claude 正常完成任务                                                        |          是           |
| `error_max_turns`                     | 在完成前达到 `maxTurns` 限制                                               |          否           |
| `error_max_budget_usd`                | 在完成前达到 `maxBudgetUsd` 限制                                           |          否           |
| `error_during_execution`              | 循环被错误中断（例如，API 故障或请求取消）                                 |          否           |
| `error_max_structured_output_retries` | 结构化输出验证在配置的重试限制后失败                                       |          否           |

`result` 字段（最终的文本输出）仅存在于 `success` 变体中，因此在读取它之前始终检查子类型。所有结果子类型都携带 `total_cost_usd`、`usage`、`num_turns` 和 `session_id`，以便您跟踪成本并在错误后恢复。在 Python 中，`total_cost_usd` 和 `usage` 被键入为可选类型，在某些错误路径上可能为 `None`，因此在格式化它们之前请进行保护。有关解释 `usage` 字段的详细信息，请参阅 [跟踪成本和使用情况](/en/agent-sdk/cost-tracking)。

结果还包含一个 `stop_reason` 字段（在 TypeScript 中为 `string | null`，在 Python 中为 `str | None`），指示模型在最后一轮停止生成的原因。常见值有 `end_turn`（模型正常完成）、`max_tokens`（达到输出 token 限制）和 `refusal`（模型拒绝了请求）。在错误结果子类型上，`stop_reason` 携带循环结束前最后一次助理响应的值。要检测拒绝，请检查 `stop_reason === "refusal"`（TypeScript）或 `stop_reason == "refusal"`（Python）。有关完整类型，请参阅 [`SDKResultMessage`](/en/agent-sdk/typescript#sdkresultmessage)（TypeScript）或 [`ResultMessage`](/en/agent-sdk/python#resultmessage)（Python）。

## 钩子

[钩子](/en/agent-sdk/hooks) 是在循环中的特定点触发的回调：在工具运行之前、工具返回之后、当代理完成时，等等。一些常用的钩子包括：

| 钩子                             | 触发时机                       | 常用场景                                |
| :------------------------------- | :----------------------------- | :-------------------------------------- |
| `PreToolUse`                     | 工具执行之前                   | 验证输入，阻止危险命令                  |
| `PostToolUse`                    | 工具返回之后                   | 审计输出，触发副作用                    |
| `UserPromptSubmit`               | 当提示词被发送时               | 向提示词注入额外上下文                  |
| `Stop`                           | 当代理完成时                   | 验证结果，保存会话状态                  |
| `SubagentStart` / `SubagentStop` | 当子代理启动或完成时           | 跟踪和聚合并行任务结果                  |
| `PreCompact`                     | 在上下文压缩之前               | 在总结之前归档完整的对话记录            |

钩子运行在您的应用程序进程中，而不是代理的上下文窗口内，因此它们不消耗上下文。钩子还可以短路循环：一个拒绝工具调用的 `PreToolUse` 钩子会阻止其执行，并且 Claude 会收到拒绝消息。

两个 SDK 都支持上述所有事件。TypeScript SDK 包含 Python 尚不支持的其他事件。有关完整的事件列表、每个 SDK 的可用性以及完整的回调 API，请参阅 [使用钩子控制执行](/en/agent-sdk/hooks)。

## 综合应用

此示例将本页的关键概念组合成一个用于修复失败测试的代理。它使用允许的工具（自动批准，以便代理自主运行）、项目设置以及对轮次和推理努力程度的安全限制来配置代理。随着循环运行，它会捕获会话 ID 以便潜在恢复，处理最终结果，并打印总成本。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def run_agent():
      session_id = None

      async for message in query(
          prompt="Find and fix the bug causing test failures in the auth module",
          options=ClaudeAgentOptions(
              allowed_tools=[
                  "Read",
                  "Edit",
                  "Bash",
                  "Glob",
                  "Grep",
              ],  # Listing tools here auto-approves them (no prompting)
              setting_sources=[
                  "project"
              ],  # Load CLAUDE.md, skills, hooks from current directory
              max_turns=30,  # Prevent runaway sessions
              effort="high",  # Thorough reasoning for complex debugging
          ),
      ):
          # Handle the final result
          if isinstance(message, ResultMessage):
              session_id = message.session_id  # Save for potential resumption

              if message.subtype == "success":
                  print(f"Done: {message.result}")
              elif message.subtype == "error_max_turns":
                  # Agent ran out of turns. Resume with a higher limit.
                  print(f"Hit turn limit. Resume session {session_id} to continue.")
              elif message.subtype == "error_max_budget_usd":
                  print("Hit budget limit.")
              else:
                  print(f"Stopped: {message.subtype}")
              if message.total_cost_usd is not None:
                  print(f"Cost: ${message.total_cost_usd:.4f}")


  asyncio.run(run_agent())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  let sessionId: string | undefined;

  for await (const message of query({
    prompt: "Find and fix the bug causing test failures in the auth module",
    options: {
      allowedTools: ["Read", "Edit", "Bash", "Glob", "Grep"], // Listing tools here auto-approves them (no prompting)
      settingSources: ["project"], // Load CLAUDE.md, skills, hooks from current directory
      maxTurns: 30, // Prevent runaway sessions
      effort: "high" // Thorough reasoning for complex debugging
    }
  })) {
    // Save the session ID to resume later if needed
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }

    // Handle the final result
    if (message.type === "result") {
      if (message.subtype === "success") {
        console.log(`Done: ${message.result}`);
      } else if (message.subtype === "error_max_turns") {
        // Agent ran out of turns. Resume with a higher limit.
        console.log(`Hit turn limit. Resume session ${sessionId} to continue.`);
      } else if (message.subtype === "error_max_budget_usd") {
        console.log("Hit budget limit.");
      } else {
        console.log(`Stopped: ${message.subtype}`);
      }
      console.log(`Cost: $${message.total_cost_usd.toFixed(4)}`);
    }
  }
  ```

## 后续步骤

既然您已了解该循环流程，接下来可根据您的构建目标选择相应路径：

* **尚未运行过智能体？** 请先从[快速入门](/en/agent-sdk/quickstart)开始，安装 SDK 并查看完整的端到端运行示例。
* **准备将智能体集成到项目中？** [加载 CLAUDE.md、技能和文件系统钩子](/en/agent-sdk/claude-code-features)，使智能体自动遵循您的项目规范。
* **正在构建交互式界面？** 启用[流式输出](/en/agent-sdk/streaming-output)，在循环运行时实时显示文本和工具调用。
* **需要更精细地控制智能体行为？** 使用[权限](/en/agent-sdk/permissions)限制工具访问，并通过[钩子](/en/agent-sdk/hooks)在工具执行前进行审核、拦截或转换。
* **运行耗时较长或成本较高的任务？** 将独立工作分流至[子代理](/en/agent-sdk/subagents)，保持主上下文的精简高效。

关于智能体循环的更广泛概念（非 SDK 特有），请参阅[Claude Code 工作原理](/en/how-claude-code-works)。