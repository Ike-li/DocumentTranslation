> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 模型配置

> 了解 Claude Code 的模型配置，包括 `opusplan` 等模型别名

## 可用模型

对于 Claude Code 中的 `model` 设置，你可以配置以下任一项：

* **模型别名**
* **模型名称**
  * Anthropic API：完整的 **[模型名称](https://platform.claude.com/docs/en/about-claude/models/overview)**
  * Bedrock：推理配置文件 ARN
  * Foundry：部署名称
  * Vertex：版本名称

> `ANTHROPIC_BASE_URL` 更改请求的发送目标，而非应答模型。要通过 LLM 网关路由 Claude，请参阅 [LLM 网关配置](/zh/llm-gateway)。

### 模型别名

模型别名提供了一种便捷方式来选择模型设置，无需记住确切的版本号：

| 模型别名         | 行为                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`default`**    | 特殊值，清除所有模型覆盖并恢复为适合你账户类型的推荐模型。本身不是模型别名                                                                                              |
| **`best`**       | 使用最强大的可用模型，当前等同于 `opus`                                                                                                                                |
| **`sonnet`**     | 使用最新的 Sonnet 模型处理日常编码任务                                                                                                                                  |
| **`opus`**       | 使用最新的 Opus 模型处理复杂推理任务                                                                                                                                    |
| **`haiku`**      | 使用快速高效的 Haiku 模型处理简单任务                                                                                                                                   |
| **`sonnet[1m]`** | 使用带有 [100 万 token 上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window) 的 Sonnet，适用于长会话             |
| **`opus[1m]`**   | 使用带有 [100 万 token 上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window) 的 Opus，适用于长会话               |
| **`opusplan`**   | 特殊模式，在计划模式下使用 `opus`，然后切换到 `sonnet` 执行                                                                                                            |

在 Anthropic API 上，`opus` 解析为 Opus 4.8，`sonnet` 解析为 Sonnet 4.6。在 [Claude Platform on AWS](/zh/claude-platform-on-aws) 上，`opus` 解析为 Opus 4.7，`sonnet` 解析为 Sonnet 4.6。在 Bedrock、Vertex 和 Foundry 上，`opus` 解析为 Opus 4.6，`sonnet` 解析为 Sonnet 4.5；通过显式选择完整模型名称或设置 `ANTHROPIC_DEFAULT_OPUS_MODEL` 或 `ANTHROPIC_DEFAULT_SONNET_MODEL`，可在这些提供商上使用更新的模型。

别名指向适合你提供商的推荐版本，并会随时间更新。要固定到特定版本，请使用完整模型名称（例如 `claude-opus-4-8`）或设置相应的环境变量，如 `ANTHROPIC_DEFAULT_OPUS_MODEL`。

> Opus 4.8 需要 Claude Code v2.1.154 或更高版本。运行 `claude update` 进行升级。

### 设置模型

你可以通过以下几种方式配置模型，按优先级排列：

1. **在会话中** - 使用 `/model <别名|名称>` 立即切换，或运行不带参数的 `/model` 打开选择器。当对话已有先前输出时，选择器会要求确认，因为下一次响应将重新读取完整历史记录且不使用缓存上下文
2. **启动时** - 使用 `claude --model <别名|名称>` 启动
3. **环境变量** - 设置 `ANTHROPIC_MODEL=<别名|名称>`
4. **设置文件** - 在设置文件中使用 `model` 字段进行永久配置

从 v2.1.153 起，`/model` 会将你的选择写入用户设置的 `model` 字段，作为新会话的默认值。在选择器中：

* `Enter`：切换模型并保存为默认值
* `s`：仅对当前会话切换模型

直接输入 `/model <名称>` 的行为等同于按 `Enter`。项目设置和托管设置仍然优先，并在下次启动时重新应用。

在 v2.1.144 到 v2.1.152 中，`/model` 仅应用于当前会话，选择器中的 `d` 用于保存默认值。

`--model` 标志和 `ANTHROPIC_MODEL` 环境变量仅应用于你启动时的会话。要在不同终端同时运行不同模型，请使用各自的 `--model` 标志启动，而不是使用 `/model` 切换。

使用 `claude --resume`、`--continue` 或 `/resume` 选择器恢复的会话会保留保存记录时使用的模型，与当前 `model` 设置无关。如果该模型已停用，会话将按正常优先级顺序回退。这防止了其他会话的 `/model` 选择影响恢复会话的模型。

当启动时的活动模型来自项目或托管设置而非你自己的选择时，启动头部会显示是哪个设置文件设置了它。运行 `/model` 进行覆盖；项目或托管设置会在下次启动时重新应用。

示例用法：

```bash
# 使用 Opus 启动
claude --model opus

# 在会话中切换到 Sonnet
/model sonnet
```

示例设置文件：

```json
{
    "permissions": {
        ...
    },
    "model": "opus"
}
```

## 限制模型选择

企业管理员可以在[托管或策略设置](/zh/settings#settings-files)中使用 `availableModels` 来限制用户可选择的模型。

设置 `availableModels` 后，用户无法通过 `/model`、`--model` 标志或 `ANTHROPIC_MODEL` 环境变量切换到列表之外的模型。

```json
{
  "availableModels": ["sonnet", "haiku"]
}
```

### 默认模型行为

模型选择器中的"默认"选项不受 `availableModels` 影响。它始终可用，代表系统基于[用户订阅层级](#default-模型设置)的运行时默认值。

即使设置 `availableModels: []`，用户仍可使用默认模型对应的层级来使用 Claude Code。

### 控制用户运行的模型

`model` 设置是初始选择，而非强制执行。它设置会话启动时的活动模型，但用户仍可打开 `/model` 选择"默认"，该选项会解析为系统默认值，不受 `model` 设置影响。

要完全控制模型体验，请组合使用三个设置：

* **`availableModels`**：限制用户可切换到的命名模型
* **`model`**：设置会话启动时的初始模型选择
* **`ANTHROPIC_DEFAULT_SONNET_MODEL`** / **`ANTHROPIC_DEFAULT_OPUS_MODEL`** / **`ANTHROPIC_DEFAULT_HAIKU_MODEL`**：控制"默认"选项以及 `sonnet`、`opus` 和 `haiku` 别名的解析目标

以下示例让用户以 Sonnet 4.5 启动，将选择器限制为 Sonnet 和 Haiku，并将"默认"固定为 Sonnet 4.5 而非最新版本：

```json
{
  "model": "claude-sonnet-4-5",
  "availableModels": ["claude-sonnet-4-5", "haiku"],
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-5"
  }
}
```

如果没有 `env` 块，用户在选择器中选择"默认"时将获得最新的 Sonnet 版本，绕过 `model` 和 `availableModels` 中的版本固定。

### 合并行为

当 `availableModels` 在多个层级设置（如用户设置和项目设置）时，数组会合并并去重。要强制执行严格的允许列表，请在托管或策略设置中设置 `availableModels`，这些设置具有最高优先级。

### Mantle 模型 ID

当启用 [Bedrock Mantle 端点](/zh/amazon-bedrock#use-the-mantle-endpoint)时，`availableModels` 中以 `anthropic.` 开头的条目会作为自定义选项添加到 `/model` 选择器中，并路由到 Mantle 端点。这是[为第三方部署固定模型](#为第三方部署固定模型)中描述的仅别名匹配的例外。该设置仍将选择器限制为列出的条目，因此请在任何 Mantle ID 旁边包含标准别名。

## 特殊模型行为

### `default` 模型设置

`default` 的行为取决于你的账户类型：

* **Max、Team Premium、企业按量付费和 Anthropic API**：默认为 Opus 4.8
* **Claude Platform on AWS**：默认为 Opus 4.7
* **Pro、Team Standard 和企业订阅席位**：默认为 Sonnet 4.6
* **Bedrock、Vertex 和 Foundry**：默认为 Sonnet 4.5

企业按量付费是指企业组织按使用量计费，而非按订阅席位计费。

如果你使用 Opus 达到使用阈值，Claude Code 可能会自动回退到 Sonnet。

### `opusplan` 模型设置

`opusplan` 模型别名提供自动混合方式：

* **在计划模式下** - 使用 `opus` 进行复杂推理和架构决策
* **在执行模式下** - 自动切换到 `sonnet` 进行代码生成和实现

这让你兼得两者之长：Opus 出色的推理能力用于规划，Sonnet 的高效用于执行。

计划模式的 Opus 阶段使用标准 200K 上下文窗口运行。[扩展上下文](#扩展上下文)中描述的自动 1M 升级适用于 `opus` 模型设置，不适用于 `opusplan`。

### 调整努力级别

[努力级别](https://platform.claude.com/docs/en/build-with-claude/effort)控制自适应推理，让模型根据任务复杂度决定是否思考以及思考多少。较低的努力级别对于简单任务更快更便宜，而较高的努力级别为复杂问题提供更深入的推理。

可用的努力级别取决于模型。此处未列出的模型不支持努力级别：

| 模型                    | 级别                                    |
| :---------------------- | :-------------------------------------- |
| Opus 4.8 和 Opus 4.7    | `low`、`medium`、`high`、`xhigh`、`max` |
| Opus 4.6 和 Sonnet 4.6  | `low`、`medium`、`high`、`max`          |

如果你设置的级别不被活动模型支持，Claude Code 会回退到你所设级别以下的最高支持级别。例如，`xhigh` 在 Opus 4.6 上会以 `high` 运行。

默认努力级别在 Opus 4.8、Opus 4.6 和 Sonnet 4.6 上为 `high`，在 Opus 4.7 上为 `xhigh`。

首次运行 Opus 4.8 或 Opus 4.7 时，即使你之前为其他模型设置了不同级别，Claude Code 也会应用该模型的默认努力级别：Opus 4.8 为 `high`，Opus 4.7 为 `xhigh`。切换后再次运行 `/effort` 可选择不同级别。

`low`、`medium`、`high` 和 `xhigh` 跨会话持久保存。`max` 提供最深入的推理，不受 token 消耗限制，仅应用于当前会话（通过 `CLAUDE_CODE_EFFORT_LEVEL` 环境变量设置时除外）。

`/effort` 菜单还提供 `ultracode`。Ultracode 是 Claude Code 设置而非模型努力级别：它向模型发送 `xhigh`，并额外让 Claude 为实质性任务编排[动态工作流](/zh/workflows)。它仅应用于当前会话。通过 `/effort` 设置，或通过 `--settings` 或 Agent SDK 控制请求传递 `"ultracode": true`。它不属于 `effortLevel` 设置、`--effort` 标志或 `CLAUDE_CODE_EFFORT_LEVEL`。

#### 选择努力级别

每个级别在 token 消耗和能力之间进行权衡。默认值适合大多数编码任务；当你需要不同的平衡时进行调整。

| 级别        | 使用场景                                                                                                                                    |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `low`**     | 保留用于短小、范围明确、对延迟敏感且非智能敏感的任务                                                                                         |
| `medium`    | 降低 token 使用量，适合对成本敏感且可牺牲部分智能的工作                                                                                      |
| `high`      | 平衡 token 使用量和智能。Opus 4.8、Opus 4.6 和 Sonnet 4.6 的默认值                                                                          |
| `xhigh`     | 更深入的推理，token 消耗更高。Opus 4.7 的默认值                                                                                              |
| `max`**     | 可改善高要求任务的表现，但可能出现收益递减且容易过度思考。广泛采用前请先测试                                                                 |
| `ultracode` | Claude Code 设置，为每个实质性任务规划[动态工作流](/zh/workflows)，每条消息使用 `xhigh` 推理。仅限当前会话                                   |

努力级别按模型校准，因此相同的级别名称在不同模型间不代表相同的底层值。

#### 使用 ultrathink 进行一次性深度推理

在提示词中任意位置包含 `ultrathink`，可在该轮请求更深入的推理，而不更改会话的努力设置。Claude Code 会识别该关键字并添加上下文指令。发送到 API 的努力级别不变。其他短语如 "think"、"think hard" 和 "think more" 会作为普通提示词文本传递，不会被识别为关键字。

#### 设置努力级别

你可以通过以下任一方式更改努力级别：

* **`/effort`**：不带参数运行 `/effort` 打开交互式滑块，`/effort` 后跟级别名称直接设置，或 `/effort auto` 重置为模型默认值
* **在 `/model` 中**：选择模型时使用左右方向键调整努力滑块
* **`--effort` 标志**：启动 Claude Code 时传递级别名称，为单个会话设置
* **环境变量**：设置 `CLAUDE_CODE_EFFORT_LEVEL` 为级别名称或 `auto`
* **设置文件**：在设置文件中将 `effortLevel` 设置为 `low`、`medium`、`high` 或 `xhigh`。`max` 和 `ultracode` 为[会话级别](#调整努力级别)，此处不接受
* **技能和子代理 frontmatter**：在[技能](/zh/skills#frontmatter-reference)或[子代理](/zh/sub-agents#supported-frontmatter-fields)的 markdown 文件中设置 `effort`，以在该技能或子代理运行时覆盖努力级别

环境变量优先于所有其他方式，其次是已配置的级别，最后是模型默认值。Frontmatter 努力级别在该技能或子代理活动时应用，覆盖会话级别但不覆盖环境变量。

努力滑块在选择支持的模型时出现在 `/model` 中。当前努力级别也会显示在 logo 和加载指示器旁边，例如 "with low effort"，这样你无需打开 `/model` 即可确认哪个设置处于活动状态。

#### 自适应推理和固定思考预算

自适应推理使思考在每一步都是可选的，因此 Claude 可以更快地响应常规提示词，并为受益于深度思考的步骤保留更深入的思考。如果你希望 Claude 比当前级别更频繁或更少地思考，可以直接在提示词或 `CLAUDE.md` 中说明；模型会在其努力设置范围内响应该指导。

Opus 4.7 及更高版本始终使用自适应推理。固定思考预算模式和 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` 不适用于它们。

在 Opus 4.6 和 Sonnet 4.6 上，你可以设置 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` 以恢复到由 `MAX_THINKING_TOKENS` 控制的先前固定思考预算。请参阅[环境变量](/zh/env-vars)。

### 扩展思考

扩展思考是 Claude 在响应前发出的推理过程。在支持[自适应推理](#调整努力级别)的模型上，努力级别是控制思考量的主要手段；以下设置用于开启或关闭思考以及控制其显示方式。

| 控制方式                       | 设置方法                                                                                                                                          |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| 为当前会话切换                 | 在 macOS 上按 `Option+T`，在 Windows 和 Linux 上按 `Alt+T`                                                                                        |
| 设置全局默认值                 | 运行 `/config` 并切换思考模式。保存为 `~/.claude/settings.json` 中的 `alwaysThinkingEnabled`                                                      |
| 无论努力级别如何都禁用         | 设置 [`MAX_THINKING_TOKENS=0`](/zh/env-vars)。其他值仅在[固定思考预算](#自适应推理和固定思考预算)模式下适用                   |

思考输出默认折叠。按 `Ctrl+O` 切换详细模式，以灰色斜体文字查看推理过程。Anthropic API 上的交互式会话默认接收脱敏的思考块，因此如果你希望展开时可查看完整摘要，请在[设置](/zh/settings)中设置 `showThinkingSummaries: true`。即使思考被折叠或脱敏，你仍需为所有生成的思考 token 付费。

### 扩展上下文

Opus 4.6 及更高版本以及 Sonnet 4.6 支持 [100 万 token 上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)，适用于具有大型代码库的长会话。

可用性因模型和计划而异。在 Max、Team 和 Enterprise 计划中，Opus 会自动升级到 1M 上下文，无需额外配置。这适用于 Team Standard 和 Team Premium 席位。1M 上下文的 Sonnet 不属于自动升级范围，在每个订阅计划（包括 Max）中都需要[使用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)。

| 计划                      | 1M 上下文的 Opus                                                                                            | 1M 上下文的 Sonnet                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Max、Team 和 Enterprise   | 包含在订阅中                                                                                                | 需要[使用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)            |
| Pro                       | 需要[使用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)            | 需要[使用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)            |
| API 和按量付费            | 完全访问                                                                                                    | 完全访问                                                                                                    |

要完全禁用 1M 上下文，请设置 `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`。这会从模型选择器中移除 1M 模型变体。请参阅[环境变量](/zh/env-vars)。

1M 上下文窗口使用标准模型定价，超过 200K 的 token 不额外收费。对于扩展上下文包含在订阅中的计划，使用量仍由订阅覆盖。对于通过使用额度访问扩展上下文的计划，token 将从使用额度中扣除。

如果你的账户支持 1M 上下文，该选项会出现在最新版本 Claude Code 的模型选择器（`/model`）中。如果未看到，请尝试重启会话。

你也可以在模型别名或完整模型名称后使用 `[1m]` 后缀：

```bash
# 使用 opus[1m] 或 sonnet[1m] 别名
/model opus[1m]
/model sonnet[1m]

# 或在完整模型名称后附加 [1m]
/model claude-opus-4-8[1m]
```

## 检查当前模型

你可以通过以下几种方式查看当前使用的模型：

1. 在[状态栏](/zh/statusline)中（如果已配置）
2. 在 `/status` 中，同时显示你的账户信息

## 添加自定义模型选项

使用 `ANTHROPIC_CUSTOM_MODEL_OPTION` 向 `/model` 选择器添加单个自定义条目，而不替换内置别名。这对于测试 Claude Code 默认未列出的模型 ID 很有用。对于 LLM 网关部署，当设置 `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1` 时，Claude Code 可以从网关的 `/v1/models` 端点填充选择器，因此仅在发现被禁用或未返回你所需模型时才需要此变量。请参阅 [LLM 网关模型选择](/zh/llm-gateway#model-selection)。

以下示例设置所有三个变量以使网关路由的 Opus 部署可选择：

```bash
export ANTHROPIC_CUSTOM_MODEL_OPTION="my-gateway/claude-opus-4-7"
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME="Opus via Gateway"
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION="Custom deployment routed through the internal LLM gateway"
```

自定义条目出现在 `/model` 选择器底部。`ANTHROPIC_CUSTOM_MODEL_OPTION_NAME` 和 `ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION` 是可选的。如果省略，模型 ID 用作名称，描述默认为 `Custom model (<model-id>)`。

Claude Code 跳过对 `ANTHROPIC_CUSTOM_MODEL_OPTION` 中设置的模型 ID 的验证，因此你可以使用 API 端点接受的任何字符串。

## 环境变量

你可以使用以下环境变量（必须是完整的**模型名称**或适用于你 API 提供商的等效名称）来控制别名映射到的模型名称。

| 环境变量                         | 描述                                                                                                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL`   | 用于 `opus` 的模型，或在计划模式活动时用于 `opusplan` 的模型。                                                                                                                                                                                                        |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 用于 `sonnet` 的模型，或在计划模式未活动时用于 `opusplan` 的模型。                                                                                                                                                                                                    |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL`  | 用于 `haiku` 的模型，或用于[后台功能](/zh/costs#background-token-usage)                                                                                                                                                                                               |
| `CLAUDE_CODE_SUBAGENT_MODEL`     | 用于所有[子代理](/zh/sub-agents#choose-a-model)和[代理团队](/zh/agent-teams)的模型。覆盖每次调用的 `model` 参数和子代理定义的 `model` frontmatter。设置为 `inherit` 以使用正常的模型解析方式                                                                          |

注意：`ANTHROPIC_SMALL_FAST_MODEL` 已弃用，请使用 `ANTHROPIC_DEFAULT_HAIKU_MODEL`。

### 为第三方部署固定模型

通过 [Bedrock](/zh/amazon-bedrock)、[Vertex AI](/zh/google-vertex-ai)、[Foundry](/zh/microsoft-foundry) 或 [Claude Platform on AWS](/zh/claude-platform-on-aws) 部署 Claude Code 时，请在向用户推出前固定模型版本。

如果不固定，Claude Code 使用模型别名（`sonnet`、`opus`、`haiku`）解析为最新版本。当 Anthropic 发布尚未在用户账户中启用的新模型时，Bedrock 和 Vertex AI 用户会看到通知并在该会话中回退到先前版本，而 Foundry 用户会看到错误，因为 Foundry 没有等效的启动检查。

> 作为初始设置的一部分，请将所有三个模型环境变量设置为特定版本 ID。固定让你控制用户何时迁移到新模型。

使用以下环境变量为你的提供商设置特定版本的模型 ID：

| 提供商    | 示例                                                                 |
| :-------- | :------------------------------------------------------------------- |
| Bedrock   | `export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-8'` |
| Vertex AI | `export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-8'`              |
| Foundry   | `export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-8'`              |

对 `ANTHROPIC_DEFAULT_SONNET_MODEL` 和 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 应用相同模式。有关所有提供商的当前和旧版模型 ID，请参阅[模型概述](https://platform.claude.com/docs/en/about-claude/models/overview)。要将用户升级到新模型版本，请更新这些环境变量并重新部署。

要为固定模型启用[扩展上下文](#扩展上下文)，请在 `ANTHROPIC_DEFAULT_OPUS_MODEL` 或 `ANTHROPIC_DEFAULT_SONNET_MODEL` 中的模型 ID 后附加 `[1m]`：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-8[1m]'
```

`[1m]` 后缀将 1M 上下文窗口应用于该别名的所有使用，包括 `opusplan`。

* Claude Code 在将模型 ID 发送到提供商之前会去除该后缀。
* 仅在底层模型[支持 1M 上下文](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)时才附加 `[1m]`。
* 后缀按变量读取，而非按模型。在 Bedrock、Vertex 和 Foundry 上，一个变量中不含 `[1m]` 的模型 ID 使用 200K 上下文，即使另一个变量为同一模型设置了后缀。

> 使用第三方提供商时，`settings.availableModels` 允许列表仍然适用。过滤匹配的是模型别名（`opus`、`sonnet`、`haiku`），而非提供商特定的模型 ID。

### 自定义固定模型的显示和功能

在第三方提供商上固定模型时，提供商特定的 ID 会按原样出现在 `/model` 选择器中，Claude Code 可能无法识别该模型支持哪些功能。你可以使用每个固定模型的配套环境变量来覆盖显示名称并声明功能。

这些变量在 Bedrock、Vertex AI 和 Foundry 等第三方提供商上生效。当 `ANTHROPIC_BASE_URL` 指向 [LLM 网关](/zh/llm-gateway)时，`_NAME` 和 `_DESCRIPTION` 变量也会生效。直接连接到 `api.anthropic.com` 时无效。

| 环境变量                                                  | 描述                                                                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_NAME`                   | `/model` 选择器中固定 Opus 模型的显示名称。未设置时默认为模型 ID                                             |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION`            | `/model` 选择器中固定 Opus 模型的显示描述。未设置时默认为 `Custom Opus model`                                |
| `ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES` | 固定 Opus 模型支持的功能逗号分隔列表                                                                        |

相同的 `_NAME`、`_DESCRIPTION` 和 `_SUPPORTED_CAPABILITIES` 后缀也适用于 `ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_HAIKU_MODEL` 和 `ANTHROPIC_CUSTOM_MODEL_OPTION`。

Claude Code 通过将模型 ID 与已知模式匹配来启用[努力级别](#调整努力级别)和[扩展思考](#扩展思考)等功能。提供商特定的 ID（如 Bedrock ARN 或自定义部署名称）通常不匹配这些模式，导致支持的功能被禁用。设置 `_SUPPORTED_CAPABILITIES` 以告知 Claude Code 该模型实际支持哪些功能：

| 功能值                   | 启用                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| `effort`               | [努力级别](#调整努力级别)和 `/effort` 命令                               |
| `xhigh_effort`         | {/* min-version: 2.1.111 */}`xhigh` 努力级别                                    |
| `max_effort`           | `max` 努力级别                                                                  |
| `thinking`             | [扩展思考](#扩展思考)                                                  |
| `adaptive_thinking`    | 基于任务复杂度动态分配思考的自适应推理                                           |
| `interleaved_thinking` | 工具调用之间的思考                                                               |

设置 `_SUPPORTED_CAPABILITIES` 后，列出的功能会为匹配的固定模型启用，未列出的功能会被禁用。未设置该变量时，Claude Code 回退到基于模型 ID 的内置检测。

以下示例将 Opus 固定到 Bedrock 自定义模型 ARN，设置友好名称并声明其功能：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='arn:aws:bedrock:us-east-1:123456789012:custom-model/abc'
export ANTHROPIC_DEFAULT_OPUS_MODEL_NAME='Opus via Bedrock'
export ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION='Opus 4.7 routed through a Bedrock custom endpoint'
export ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES='effort,xhigh_effort,max_effort,thinking,adaptive_thinking,interleaved_thinking'
```

### 按版本覆盖模型 ID

上述族级环境变量为每个族别名配置一个模型 ID。如果你需要将同一族中的多个版本映射到不同的提供商 ID，请改用 `modelOverrides` 设置。

`modelOverrides` 将单个 Anthropic 模型 ID 映射到 Claude Code 发送到提供商 API 的提供商特定字符串。当用户在 `/model` 选择器中选择已映射的模型时，Claude Code 使用你配置的值而非内置默认值。

这让企业管理员可以将每个模型版本路由到特定的 Bedrock 推理配置文件 ARN、Vertex AI 版本名称或 Foundry 部署名称，以实现治理、成本分配或区域路由。

在[设置文件](/zh/settings#settings-files)中设置 `modelOverrides`：

```json
{
  "modelOverrides": {
    "claude-opus-4-7": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-prod",
    "claude-opus-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-46-prod",
    "claude-sonnet-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/sonnet-prod"
  }
}
```

键必须是[模型概述](https://platform.claude.com/docs/en/about-claude/models/overview)中列出的 Anthropic 模型 ID。对于带日期的模型 ID，请完全按照其中显示的格式包含日期后缀。未知键会被忽略。

覆盖替换支持 `/model` 选择器中每个条目的内置模型 ID。在 Bedrock 上，覆盖优先于 Claude Code 在启动时自动发现的任何推理配置文件。你通过 `ANTHROPIC_MODEL`、`--model` 或 `ANTHROPIC_DEFAULT_*_MODEL` 环境变量直接提供的值会按原样传递给提供商，不会被 `modelOverrides` 转换。

`modelOverrides` 与 `availableModels` 配合使用。允许列表针对 Anthropic 模型 ID 进行评估，而非覆盖值，因此 `availableModels` 中的 `"opus"` 等条目即使 Opus 版本映射到 ARN 也会继续匹配。

### 提示词缓存配置

Claude Code 自动使用[提示词缓存](/zh/prompt-caching)来优化性能和降低成本。你可以全局或针对特定模型层级禁用提示词缓存：

| 环境变量                         | 描述                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `DISABLE_PROMPT_CACHING`        | 设置为 `1` 以禁用所有模型的提示词缓存。优先于按模型的设置                               |
| `DISABLE_PROMPT_CACHING_HAIKU`  | 设置为 `1` 以仅禁用 Haiku 模型的提示词缓存                                             |
| `DISABLE_PROMPT_CACHING_SONNET` | 设置为 `1` 以仅禁用 Sonnet 模型的提示词缓存                                            |
| `DISABLE_PROMPT_CACHING_OPUS`   | 设置为 `1` 以仅禁用 Opus 模型的提示词缓存                                              |

要更改缓存 TTL 或了解什么会触发缓存未命中，请参阅 [Claude Code 如何使用提示词缓存](/zh/prompt-caching)。
