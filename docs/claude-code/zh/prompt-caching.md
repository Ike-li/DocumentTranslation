> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# Claude Code 如何使用提示词缓存

> Claude Code 自动管理提示词缓存。了解为什么切换模型会触发缓慢的未缓存轮次、`/compact` 的代价、为什么 CLAUDE.md 编辑不会在会话中途生效，以及如何检查缓存命中率。

提示词缓存使 Claude Code 更快、更具成本效益。如果没有缓存，API 会在每个轮次重新处理你的完整历史记录。有了缓存，它会复用已处理的内容，仅为变化的部分执行新工作。

Claude Code 会为你处理提示词缓存，除非你[禁用它](#禁用提示词缓存)。了解提示词缓存的工作原理仍然很有用，因为某些操作会使缓存失效，导致下一个响应变慢且更昂贵（需要重建缓存）。本页涵盖哪些操作会导致这种情况、为什么某些设置需要重启才能生效，以及当使用量看起来偏高时如何检查缓存性能。

## 缓存的组织方式

每次你在 Claude Code 中发送消息时，它都会发起一个新的 API 请求。模型在请求之间不会记住任何内容，因此 Claude Code 会重新发送完整上下文：系统提示词、你的项目上下文、所有之前的消息和工具结果，以及你的新消息。新内容追加在末尾，这意味着每个请求的大部分内容与前一个请求相同。提示词缓存就是 API 避免重新处理未变化部分的方式。

API 通过将每个请求的开头（称为前缀）与最近处理过的内容进行匹配来实现缓存。在正常轮次中，前缀是整个前一个请求，只有最新的交换是新的。匹配是精确的，因此前缀中任何位置的更改都会重新计算其后的所有内容。不存在按文件或按片段的缓存。有关底层机制，请参阅 API 参考中的[提示词缓存工作原理](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#how-prompt-caching-works)。

<img src="https://mintcdn.com/claude-code/VbDJw--l6T9a9Wvm/images/prompt-caching-prefix.svg?fit=max&auto=format&n=VbDJw--l6T9a9Wvm&q=85&s=f2e8f0b8298a50305fe428ca3f1d1594" className="dark:hidden" alt="四个轮次显示为不断增长的水平条。每个轮次的请求包含前一个轮次的所有内容加上末尾追加的最新交换。在第二和第三轮次中，未变化的前缀从缓存读取，只有新交换被处理。在第四轮次中，系统提示词发生变化，前缀不再匹配，整个请求被重新处理和写入。" width="720" height="454" data-path="images/prompt-caching-prefix.svg" />

<img src="https://mintcdn.com/claude-code/VbDJw--l6T9a9Wvm/images/prompt-caching-prefix-dark.svg?fit=max&auto=format&n=VbDJw--l6T9a9Wvm&q=85&s=7434a04e08187edd26ec6c3dd332f624" className="hidden dark:block" alt="四个轮次显示为不断增长的水平条。每个轮次的请求包含前一个轮次的所有内容加上末尾追加的最新交换。在第二和第三轮次中，未变化的前缀从缓存读取，只有新交换被处理。在第四轮次中，系统提示词发生变化，前缀不再匹配，整个请求被重新处理和写入。" width="720" height="454" data-path="images/prompt-caching-prefix-dark.svg" />

为了最大限度地利用前缀匹配，Claude Code 会排列每个请求，使轮次之间很少变化的内容排在前面：

| 层级           | 内容                                           | 变更时机                                                      |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 系统提示词   | 核心指令、工具定义、输出风格 | MCP 服务器连接或断开，或 Claude Code 升级 |
| 项目上下文 | CLAUDE.md、自动记忆、无范围规则            | 会话开始，或 `/clear` 或 `/compact` 之后                   |
| 对话    | 你的消息、Claude 的响应、工具结果   | 每个轮次                                                        |

对话层的变更会保留系统提示词和项目上下文的缓存。系统提示词的变更会使所有内容失效，因为后续所有内容现在位于不同的前缀之后。第三列给出的是常见触发因素而非详尽列表，下面的章节涵盖了完整集合，包括输出风格等在会话开始时固定的内容。

前缀匹配规则解释了本页大部分行为。例如，[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)和[技能加载](/zh/skills)将它们的指令作为对话消息追加，因此缓存的前缀保持完整。

有两个设置不属于提示词文本，因此不出现在层级表中，但两者都是缓存键的一部分：

* **模型**：每个模型有独立的缓存。切换模型会重新计算整个请求，即使内容相同。参见下面的[切换模型](#切换模型)。
* **努力级别**：同一模型的每个努力级别有独立的缓存。在会话中途更改会重新计算整个请求，Claude Code 会在应用更改前要求你确认。参见下面的[更改努力级别](#更改努力级别)。

**提示**：在会话开始时选择好你的模型、努力级别和 MCP 服务器，然后在任务之间的自然断点使用 `/compact`。中途更改越少，缓存命中率越高。

### 缓存的位置

缓存发生在服务器端，在提供模型的基础设施中。具体位置取决于你的认证方式：

* **API 密钥、Claude 订阅或 [Claude Platform on AWS](/zh/claude-platform-on-aws)**：缓存位于 Anthropic 的基础设施中，通过 [Claude API](https://platform.claude.com/docs) 访问
* **Bedrock 或 Vertex AI**：缓存位于你的云提供商的服务基础设施中
* **Foundry**：请求路由到 Anthropic 的基础设施
* **自定义 `ANTHROPIC_BASE_URL` 或 [LLM 网关](/zh/llm-gateway)**：缓存位于你的请求被转发到的地方，缓存是否有效取决于网关

有关每个提供商存储和处理的内容，请参阅[数据使用](/zh/data-usage)。无论缓存在哪里，条目在一段时间不活动后会过期，下面的[缓存生存时间](#缓存生存时间)涵盖了 TTL 以及如何延长它。

## 使缓存失效的操作

这些操作会导致下一个请求部分或全部错过缓存。你会看到一次性的更慢、更昂贵的轮次，之后新的前缀被缓存。一旦你了解它们的代价，其中大多数在任务中途是可以避免的。切换模型或 MCP 重新连接可能感觉没有代价，直到你注意到随之而来的较慢轮次。

* [切换模型](#切换模型)
* [更改努力级别](#更改努力级别)
* [连接或断开 MCP 服务器](#连接或断开-mcp-服务器)
* [拒绝整个工具](#拒绝整个工具)
* [压缩对话](#压缩对话)
* [升级 Claude Code](#升级-claude-code)

### 切换模型

每个模型有独立的缓存。使用 [`/model`](/zh/model-config#setting-your-model) 切换意味着下一个请求读取整个对话历史时没有任何缓存命中，即使内容相同。

[`opusplan` 模型设置](/zh/model-config#opusplan-model-setting)在计划模式下解析为 Opus，在执行模式下解析为 Sonnet，因此每次计划模式切换都是一次模型切换并启动全新的缓存。

### 更改努力级别

缓存的键包括[努力级别](/zh/model-config#adjust-effort-level)和模型，因此使用 `/effort` 切换意味着下一个请求读取整个对话历史时没有任何缓存命中。对话开始后，Claude Code 会在应用会使缓存失效的努力级别更改前显示确认对话框。如果更改解析为已生效的相同级别（例如显式设置模型的默认值），则跳过对话框并保留缓存。

### 连接或断开 MCP 服务器

工具定义位于系统提示词层，因此当 Claude 可用的 MCP 工具集在轮次之间发生变化时，缓存会失效。最常见的原因是 [MCP 服务器](/zh/mcp)在会话中途连接或断开，这可能无需你任何操作就会发生：stdio 服务器的进程退出、HTTP 会话过期，或服务器在[瞬时故障后自动重新连接](/zh/mcp#automatic-reconnection)。已连接的服务器也可以推送[动态工具更新](/zh/mcp#dynamic-tool-updates)来更改其工具列表。

编辑 MCP 配置本身不会更改缓存。新配置仅在重启后生效，即服务器连接或断开时。

[MCP 工具搜索](/zh/mcp#scale-with-mcp-tool-search)通过延迟加载完整工具定义来减少每个工具对前缀的贡献，但工具名称集仍需保持稳定才能使缓存保持有效。

### 拒绝整个工具

将裸工具名（如 `Bash` 或 `WebFetch`）添加为[拒绝规则](/zh/permissions#manage-permissions)会从 Claude 的上下文中完全移除该工具。工具定义位于系统提示词层，因此在会话中途添加或移除此类规则会使缓存失效，方式与 MCP 服务器连接或断开相同。无论你通过 `/permissions` 还是[直接编辑设置文件](/zh/settings#when-edits-take-effect)添加，更改在下一个轮次生效。

只有裸工具名或等效的 `Bash(*)` 形式才会有此效果。有范围的拒绝规则（如 `Bash(rm *)`）以及所有允许和询问规则不会更改 Claude 看到的工具。Claude Code 在 Claude 尝试调用时检查它们，保持前缀完整。

### 压缩对话

[压缩](/zh/context-window#what-survives-compaction)用摘要替换你的消息历史。按设计，这会使对话层失效，因为下一个请求有新的、更短的历史，不与旧历史共享前缀。Claude Code 复用系统提示词层并从磁盘重新加载项目上下文，这仅在 CLAUDE.md 和记忆自会话开始以来未更改时才会缓存命中。

为了生成摘要，Claude Code 发送一个一次性请求，使用与你的对话相同的系统提示词、工具和历史，加上作为最终用户消息追加的摘要指令。由于它共享你的前缀，该请求读取现有缓存而不是重新处理完整历史。压缩的大部分时间用于生成摘要，而不是缓存未命中。之后的轮次仅为短得多的摘要重建对话缓存，因此压缩后的轮次不是慢的部分。

**提示**：当你丢弃的上下文是你不再需要的内容时，压缩对你有利。要选择其开销发生的时机，在工作的自然断点（如任务之间）运行 `/compact`，而不是等待自动压缩在任务中途触发。如果你走了一条想完全放弃的路径，使用 [`/rewind`](#回退对话) 回到更早的轮次。回退会截断到已缓存的前缀，而不是像压缩那样构建新的前缀。

### 升级 Claude Code

新版本的 Claude Code 通常会更新系统提示词或工具定义，因此升级后的第一个请求会从头重建缓存。[自动更新](/zh/setup#auto-updates)在后台下载新版本，但在下次启动时应用，永远不会在会话中途应用，因此你会在重启后看到未缓存的首个轮次，而不是会话中的意外。设置 `DISABLE_AUTOUPDATER=1` 以控制升级应用的时机。

**注意**：升级后[恢复会话](/zh/sessions#resume-a-session)会重新处理整个对话历史且没有缓存命中，因为历史现在位于不同的系统提示词之后。代价与恢复的对话长度成正比，因此回到长会话的第一个轮次可能是你发送的最昂贵的请求。

## 保持缓存的操作

这些操作要么追加到对话末尾，要么根本不触及请求。其中一些（如编辑 CLAUDE.md 或更改输出风格）也是设置更改需要重启才能生效的原因。

* [编辑仓库中的文件](#编辑仓库中的文件)
* [在会话中途编辑 CLAUDE.md](#在会话中途编辑-claudemd)
* [更改输出风格](#更改输出风格)
* [更改权限模式](#更改权限模式)
* [调用技能和命令](#调用技能和命令)
* [运行 `/recap`](#运行-recap)
* [回退对话](#回退对话)
* [生成子代理](#子代理与缓存)

### 编辑仓库中的文件

文件内容仅在 Claude 读取时进入上下文，而读取操作追加到对话中。编辑 Claude 之前读取的文件不会追溯更改历史中的早期读取。相反，Claude Code 追加一个 `<system-reminder>` 说明文件已更改，Claude 在需要时会重新读取它。

### 在会话中途编辑 CLAUDE.md

你的项目根目录和用户级 CLAUDE.md 文件在会话开始时读取一次并保存在内存中。在会话中途编辑它们不会使缓存失效，但编辑也不会生效。Claude 继续使用会话开始时加载的版本。新内容在下次 `/clear`、`/compact` 或重启时加载。

[子目录中的嵌套 CLAUDE.md 文件](/zh/memory)和[带有 `paths:` frontmatter 的规则](/zh/memory#path-specific-rules)在 Claude 首次读取匹配文件时延迟加载。在加载前编辑它们确实会生效。加载后，内容成为对话历史的一部分，因此会话中途的编辑不会追溯更改它。

### 更改输出风格

[输出风格](/zh/output-styles)是系统提示词的一部分，Claude Code 在会话开始时读取一次。在会话中途通过 `/config` 或 `outputStyle` 设置更改不会使缓存失效，但更改也不会生效。Claude 继续使用会话开始时加载的风格。新风格在下次 `/clear` 或重启时加载。

### 更改权限模式

在[权限模式](/zh/permission-modes)之间切换（例如从默认到接受编辑）不会更改系统提示词或工具定义，因此模式更改是缓存安全的。例外是使用 [`opusplan`](/zh/model-config#opusplan-model-setting) 模型设置的计划模式，它会在你进入或离开计划模式时在 Opus 和 Sonnet 之间切换模型。这使得模式切换成为一次[模型切换](#切换模型)。

### 调用技能和命令

[技能](/zh/skills)和[命令](/zh/commands)在调用点将其指令作为用户消息注入。对话中更早的内容不会改变。

### 运行 `/recap`

[`/recap`](/zh/interactive-mode#session-recap) 生成在终端中显示的摘要。与 `/compact` 不同，它将摘要作为命令输出追加，而不是替换你的消息历史，因此缓存的前缀保持完整。

### 回退对话

[`/rewind`](/zh/checkpointing) 将你的对话截断回更早的轮次。剩余的历史与缓存在该点构建时的内容相同，系统提示词和项目上下文层未更改，因此下一个请求命中更早的缓存条目。此后每个轮次都读取了该前缀，即使原始轮次比 TTL 更久远，也保持了条目的热度。

随对话恢复文件检查点对缓存没有单独影响。文件内容仅在 Claude 读取时进入上下文，与[编辑仓库中的文件](#编辑仓库中的文件)相同。

## 缓存生存时间

缓存的前缀在一段时间不活动后过期。每个命中缓存的请求都会重置计时器，因此只要你持续工作，缓存就保持热度。在足够长的间隔后，下一个请求会重新计算完整输入并重新建立缓存，这就是为什么离开后返回的第一个轮次可能会明显变慢。

生存时间 (TTL) 控制缓存能存活多长的间隔。API 提供两种：五分钟 TTL，和[一小时 TTL](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#1-hour-cache-duration)（在较长休息期间保持缓存热度，但[缓存写入按更高费率计费](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#pricing)）。Claude Code 根据你的认证方式为你选择 TTL，你可以用环境变量覆盖它。

### Claude 订阅

在 Claude 订阅上，Claude Code 自动请求一小时 TTL。使用量包含在你的计划中，而不是按 token 计费，因此更长的 TTL 不会额外花费你任何费用，只影响缓存保持热度的时间。

如果你超出了计划的使用限额，Claude Code 正在使用[使用额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)，则需要为该使用量付费，因此 Claude Code 会自动将 TTL 降至五分钟。

### API 密钥或第三方提供商

在 API 密钥、Bedrock、Vertex、Foundry 或 Claude Platform on AWS 上，你按 token 费率付费，因此 TTL 默认保持在更便宜的五分钟。要选择加入[一小时 TTL](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#1-hour-cache-duration)，设置 `ENABLE_PROMPT_CACHING_1H=1`。

在 Bedrock 上，提示词缓存支持、最小可缓存前缀长度和一小时 TTL 可用性因模型而异。如果缓存 token 计数保持为零，请查看 Bedrock 文档中的[支持的模型、区域和限制](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html#prompt-caching-models)。

### 覆盖 TTL

设置 `FORCE_PROMPT_CACHING_5M=1` 以强制使用五分钟 TTL，无论认证方式如何。当你调试缓存行为、比较两种 TTL 或覆盖在[托管设置](/zh/settings#settings-files)中设置的 `ENABLE_PROMPT_CACHING_1H` 时，这很有用。

## 缓存范围

在 Claude Code 中，缓存实际上限定到一台机器和一个目录。系统提示词嵌入了工作目录、平台、shell、操作系统版本和自动记忆路径，因此在不同目录中的两个会话构建不同的前缀并会错过彼此的缓存。这包括同一仓库的工作树，因为每个工作树有自己的工作目录。

在相同目录中并行运行的会话构建匹配的前缀并读取彼此的缓存。顺序会话仅在启动时的 git 状态快照匹配时共享前缀，因为系统提示词还捕获分支和最近的提交。

底层 API 缓存范围更广。缓存在组织之间隔离，在某些提供商上，[组织内的工作空间之间也隔离](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-storage-and-sharing)。在这些边界内，任何两个具有相同模型和前缀的请求读取相同的缓存。对于运行自动化流程集群的 Agent SDK 调用者，请参阅[跨用户和机器改善提示词缓存](/zh/agent-sdk/modifying-system-prompts#improve-prompt-caching-across-users-and-machines)以抑制系统提示词中每台机器的部分并在机器之间共享缓存。

## 检查缓存性能

缓存性能表现为 API 在每个响应中报告的两个 token 计数。实时监控它们最直接的方式是读取 `current_usage` 对象的[状态栏脚本](/zh/statusline)：

| 字段                         | 含义                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `cache_creation_input_tokens` | 本轮写入缓存的 token，按缓存写入费率计费                |
| `cache_read_input_tokens`     | 本轮从缓存提供的 token，按大约标准输入费率的 10% 计费 |

高读取与创建比率意味着缓存工作良好。如果创建量在每个轮次都很高，说明你的前缀中有什么在变化。[使缓存失效的操作](#使缓存失效的操作)一节列出了常见原因。

对于跨组织的可见性，OpenTelemetry 导出器按用户和会话报告缓存读取和创建 token。有关指标和事件属性参考，请参阅[监控使用量](/zh/monitoring-usage)。

## 子代理与缓存

[子代理](/zh/sub-agents)以自己的系统提示词和工具集开始独立的对话，与父级分开。它构建自己的缓存，首次调用时没有任何缓存命中，并在自己的轮次中逐渐预热。即使在订阅上，子代理也使用五分钟 TTL，因为自动一小时 TTL 仅适用于主对话。

父级的缓存不受影响。从父级的角度看，子代理的调用和结果追加到对话中，保持父级的前缀完整。

相比之下，[分支](/zh/sub-agents#fork-the-current-conversation)完全继承父级的系统提示词、工具和对话历史，因此其第一个请求读取父级的缓存。[压缩对话](#压缩对话)中描述的压缩摘要调用使用相同的前缀共享方法。

## 禁用提示词缓存

在调试特定模型或提供商的缓存行为时，禁用缓存偶尔很有用。要关闭它，将以下环境变量之一设置为 `1`：

| 变量                        | 效果                  |
| ------------------------------- | ----------------------- |
| `DISABLE_PROMPT_CACHING`        | 对所有模型禁用  |
| `DISABLE_PROMPT_CACHING_HAIKU`  | 仅对 Haiku 禁用  |
| `DISABLE_PROMPT_CACHING_SONNET` | 仅对 Sonnet 禁用 |
| `DISABLE_PROMPT_CACHING_OPUS`   | 仅对 Opus 禁用   |

要跨组织设置缓存策略，将这些变量或 [TTL 变量](#缓存生存时间)放入[托管设置](/zh/settings#settings-files)的 `env` 块中。正常使用时，保持缓存启用。

## 相关资源

* [构建 Claude Code 的经验：提示词缓存就是一切](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)：计划模式、延迟工具加载和压缩的设计原理
* [探索上下文窗口](/zh/context-window)：什么加载到上下文中以及何时加载
* [减少 token 使用量](/zh/costs#reduce-token-usage)：缓存之外管理上下文大小的策略
* [跟踪和降低成本](/zh/agent-sdk/cost-tracking)：Agent SDK 调用者的缓存 token 跟踪和 TTL 配置
* [提示词缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)：底层 API 机制、断点和定价
