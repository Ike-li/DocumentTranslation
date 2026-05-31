# OpenAI Codex 定价

## 定价方案

### 个人版

| 方案 | 价格 | 特点 | 操作 |
|------|------|------|------|
| Free | $0/月 | 探索 OpenAI Codex 在快速编码任务上的能力。 | [获取 Free](https://chatgpt.com/plans/free/) |
| Go | $8/月 | 使用 OpenAI Codex 完成轻量级编码任务。 | [获取 Go](https://chatgpt.com/plans/go) |
| Plus | $20/月 | 每周支持数次专注的编码会话。 | [获取 Plus](https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex) |
| Pro | $100起/月 | 选择比 Plus 高 5 倍或 20 倍的速率限制。 | [获取 Pro](https://chatgpt.com/explore/pro?utm_internal_source=openai_developers_codex) |
| API Key | — | 非常适合在 CI 等共享环境中进行自动化。 | [了解更多](/codex/auth) |

**Plus 方案包含：**

- OpenAI Codex 在网页端、CLI、IDE 扩展和 iOS 上可用
- 基于云的集成，如自动代码审查和 Slack 集成
- 最新模型，包括 GPT-5.5、GPT-5.4 和 GPT-5.3-Codex
- GPT-5.4-mini 用于日常本地消息的更高使用限额
- 使用 [ChatGPT 积分]灵活扩展用量
- 其他 [ChatGPT 功能](https://chatgpt.com/pricing)作为 Plus 方案的一部分

**Pro 方案包含 Plus 全部内容，以及：**

**在 2026 年 5 月 31 日前，$100/月档位的 OpenAI Codex 用量翻倍。**

- 访问 GPT-5.3-Codex-Spark（研究预览），一个用于日常编码任务的快速 OpenAI Codex 模型
- ~~5 倍~~ 10 倍或 20 倍于 Plus 的 OpenAI Codex 用量*
- 其他 [ChatGPT 功能](https://chatgpt.com/pricing)作为 Pro 方案的一部分

*了解两个档位的限制和促销活动。详见 [Pro 方案说明](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans)。

**API Key 方案包含：**

- OpenAI Codex 在 CLI、SDK 或 IDE 扩展中可用
- 无基于云的功能（GitHub 代码审查、Slack 等）
- 延迟访问新模型，如 GPT-5.3-Codex 和 GPT-5.3-Codex-Spark
- 仅按 OpenAI Codex 使用的 token 计费，基于 [API 定价](https://platform.openai.com/docs/pricing)

### 商业版 / 企业版

| 方案 | 价格 | 特点 | 操作 |
|------|------|------|------|
| Business | 按量付费 | 将 OpenAI Codex 引入您的初创企业或成长型企业。 | [获取 Business](https://chatgpt.com/codex/team/start) |
| Enterprise & Edu | — | 为企业级功能为整个组织解锁 OpenAI Codex。 | [联系销售](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex) |
| API Key | — | 非常适合在 CI 等共享环境中进行自动化。 | [了解更多](/codex/auth) |

**Business 方案包含 Plus 全部内容，以及：**

- 根据团队需求分配标准或按用量计费的 OpenAI Codex 席位。[了解更多](https://help.openai.com/en/articles/8792828-what-is-chatgpt-business)
- 更大的虚拟机以更快运行云端任务
- 使用 [ChatGPT 积分]灵活扩展用量
- 安全的专用工作区，包含基本管理控制、SAML SSO 和 MFA
- 默认不使用您的业务数据进行训练。[了解更多](https://openai.com/business-data/)
- 其他 [ChatGPT 功能](https://chatgpt.com/pricing)作为 Business 方案的一部分

**Enterprise & Edu 方案包含 Business 全部内容，以及：**

- 优先请求处理
- 企业级安全和控制，包括 SCIM、EKM、用户分析、域名验证和基于角色的访问控制（[RBAC](https://help.openai.com/en/articles/11750701-rbac)）
- 通过 [Compliance API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks) 提供审计日志和用量监控
- 数据保留和数据驻留控制
- 其他 [ChatGPT 功能](https://chatgpt.com/pricing)作为 Enterprise 方案的一部分

**API Key 方案包含：**

- OpenAI Codex 在 CLI、SDK 或 IDE 扩展中可用
- 无基于云的功能（GitHub 代码审查、Slack 等）
- 延迟访问新模型，如 GPT-5.3-Codex 和 GPT-5.3-Codex-Spark
- 仅按 OpenAI Codex 使用的 token 计费，基于 [API 定价](https://platform.openai.com/docs/pricing)

## 常见问题

### 我的方案使用限额是多少？

您可以发送的 OpenAI Codex 消息数量取决于所使用的模型、编码任务的大小和复杂度，以及您是在本地还是在云端运行它们。小型脚本或常规函数可能只消耗您配额的一小部分，而较大的代码库、长时间运行的任务或需要 OpenAI Codex 保持更多上下文的扩展会话将每条消息消耗显著更多的配额。

GPT-5.5 使用显著更少的 token 即可达到与 GPT-5.4 相当的结果。其 OpenAI Codex 配置运行更快，并为大多数用户提供更高质量的结果。尽管 GPT-5.5 是一个功能显著更强的模型，但这些效率提升仍然支持慷慨的使用限额。

#### Plus 使用限额（每 5 小时）

| 模型 | 本地消息* | 云端任务* | 代码审查 |
|------|-----------|-----------|----------|
| GPT-5.5 | 15-80 | 不可用 | 不可用 |
| GPT-5.4 | 20-100 | 不可用 | 不可用 |
| GPT-5.4-mini | 60-350 | 不可用 | 不可用 |
| GPT-5.3-Codex | 30-150 | 10-60 | 20-50 |

*本地消息和云端任务的使用限额共享**五小时窗口**。可能适用额外的每周限制。

对于 Enterprise/Edu 用户，没有固定的速率限制——使用量随[积分]扩展。

没有灵活定价的 Enterprise 和 Edu 方案在大多数功能上与 Plus 具有相同的每席位使用限额。

#### Pro 5x 使用限额（每 5 小时）

| 模型 | 本地消息* | 云端任务* | 代码审查 |
|------|-----------|-----------|----------|
| GPT-5.5 | 80-400 | 不可用 | 不可用 |
| GPT-5.4 | 100-500 | 不可用 | 不可用 |
| GPT-5.4-mini | 300-1750 | 不可用 | 不可用 |
| GPT-5.3-Codex | 150-750 | 50-300 | 100-250 |

*本地消息和云端任务的使用限额共享**五小时窗口**。可能适用额外的每周限制。

Pro $100 在 2026 年 5 月 31 日前获得上述用量的 2 倍。

对于 Enterprise/Edu 用户，没有固定的速率限制——使用量随[积分]扩展。

没有灵活定价的 Enterprise 和 Edu 方案在大多数功能上与 Plus 具有相同的每席位使用限额。

#### Pro 20x 使用限额（每 5 小时）

| 模型 | 本地消息* | 云端任务* | 代码审查 |
|------|-----------|-----------|----------|
| GPT-5.5 | 300-1600 | 不可用 | 不可用 |
| GPT-5.4 | 400-2000 | 不可用 | 不可用 |
| GPT-5.4-mini | 1200-7000 | 不可用 | 不可用 |
| GPT-5.3-Codex | 600-3000 | 200-1200 | 400-1000 |

*本地消息和云端任务的使用限额共享**五小时窗口**。可能适用额外的每周限制。

Pro $200 在 2026 年 5 月 31 日前获得上述用量的提升。[了解更多](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans)。

对于 Enterprise/Edu 用户，没有固定的速率限制——使用量随[积分]扩展。

没有灵活定价的 Enterprise 和 Edu 方案在大多数功能上与 Plus 具有相同的每席位使用限额。

#### Business 使用限额（每 5 小时）

| 模型 | 本地消息* | 云端任务* | 代码审查 |
|------|-----------|-----------|----------|
| GPT-5.5 | 15-80 | 不可用 | 不可用 |
| GPT-5.4 | 20-100 | 不可用 | 不可用 |
| GPT-5.4-mini | 60-350 | 不可用 | 不可用 |
| GPT-5.3-Codex | 30-150 | 10-60 | 20-50 |

*本地消息和云端任务的使用限额共享**五小时窗口**。可能适用额外的每周限制。

对于 Enterprise/Edu 用户，没有固定的速率限制——使用量随[积分]扩展。

没有灵活定价的 Enterprise 和 Edu 方案在大多数功能上与 Plus 具有相同的每席位使用限额。

#### API Key 使用限额（每 5 小时）

| 模型 | 本地消息* | 云端任务* | 代码审查 |
|------|-----------|-----------|----------|
| GPT-5.5 | 不可用 | 不可用 | 不可用 |
| GPT-5.4 | [按用量计费](https://platform.openai.com/docs/pricing) | 不可用 | 不可用 |
| GPT-5.4-mini | [按用量计费](https://platform.openai.com/docs/pricing) | 不可用 | 不可用 |
| GPT-5.3-Codex | [按用量计费](https://platform.openai.com/docs/pricing) | 不可用 | 不可用 |

*本地消息和云端任务的使用限额共享**五小时窗口**。可能适用额外的每周限制。

对于 Enterprise/Edu 用户，没有固定的速率限制——使用量随[积分]扩展。

没有灵活定价的 Enterprise 和 Edu 方案在大多数功能上与 Plus 具有相同的每席位使用限额。

OpenAI Codex 使用限额与其他代理功能共享，一旦这些功能的定价生效。目前这包括 Plus 和 Pro 上的 [ChatGPT for Excel](https://help.openai.com/articles/20001063)。

速度配置会增加所有适用模型的积分消耗，因此也会更快地使用包含的限额。快速模式对支持的模型以更高的速率消耗积分。有关支持的模型和费率，请参阅[速度](https://developers.openai.com/codex/speed)。图像生成也会平均快约 3-5 倍地使用包含的限额，具体取决于图像质量和大小。GPT-5.3-Codex-Spark 目前仅供 ChatGPT Pro 用户研究预览，发布时不可在 API 中使用。由于它运行在专用的低延迟硬件上，使用量受单独的使用限额管理，该限额可能根据需求进行调整。

### 达到使用限额后会发生什么？

达到使用限额的 ChatGPT Plus 和 Pro 用户可以购买额外的积分继续工作，无需升级现有方案。

具有[灵活定价](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)的 Business、Edu 和 Enterprise 方案可以购买额外的工作区积分继续使用 OpenAI Codex。

如果您接近使用限额，也可以切换到较小的模型以延长使用限额。

所有用户还可以使用 API key 运行额外的本地任务，使用量按[标准 API 费率](https://platform.openai.com/docs/pricing)计费。

### 图像生成如何计入使用限额？

图像生成与本地消息和云端任务计入相同的通用 OpenAI Codex 使用限额。图像生成平均比不含图像生成的类似对话快 3-5 倍地使用包含的限额，具体取决于图像质量和大小。达到包含的限额后，图像生成也会从[积分]中扣除。

Free 方案不支持图像生成。使用 API key 的 OpenAI Codex，图像生成适用 API 定价而非包含的 ChatGPT 使用限额。

### 当前 Pro 上的 OpenAI Codex 使用促销是什么？

我们目前在两个 Pro 档位上提供额外的 OpenAI Codex 用量。

**Pro $100**，为庆祝发布，您将在 2026 年 5 月 31 日前获得 **2 倍 OpenAI Codex 用量**。这意味着 10 倍用量而非标准的 5 倍。

**Pro $200**，作为对我们最忠诚客户的感谢，我们延续了之前 2 倍促销的福利，这意味着 Pro $200 现在持续包含 20 倍于 Plus 的用量。此外，我们在有限时间内继续提供更高的 5 小时 OpenAI Codex 限额，因此这些限额在 2026 年 5 月 31 日前保持在 25 倍于 Plus，而非标准的 20 倍于 Plus。

### 在哪里查看我当前的使用限额？

您可以在 [OpenAI Codex 使用量仪表板](https://chatgpt.com/codex/settings/usage)中找到当前限额。如果您想在活跃的 OpenAI Codex CLI 会话期间查看剩余限额，可以使用 `/status`。

### 积分如何运作？

积分让您在达到包含的使用限额后继续使用 OpenAI Codex。使用量根据您使用的模型和功能从可用积分中扣除，让您无需中断即可继续工作。

自 4 月 2 日起，我们将定价转为基于 API token 的费率。积分仍然是客户购买和消耗的核心定价单位，但使用量基于消耗的 token，按每百万输入 token、缓存输入 token 和工作区消耗的输出 token 的积分计算。在此处了解关于 [token](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) 的信息。

此格式将方案中每条消息的平均估算替换为 token 使用量与积分之间的直接映射。当您想更清楚地了解输入、缓存输入和输出如何影响积分消耗时，这最为有用。

在此模型下，实际积分使用量取决于每个任务中输入、缓存输入和输出 token 的组合。新的费率卡显示在下表中，目前适用于**新的和现有的 Business 客户以及新的 Enterprise 客户**。

**所有其他方案类型上的新旧客户**应继续使用先前基于消息的费率卡，直到我们在未来几周内将您迁移到新费率。

在下表中选择您的方案类型以查看费率。

#### Business 和新 Enterprise 客户

| 每百万 token 积分 | 输入 Token | 缓存输入 token | 输出 Token |
|-------------------|------------|----------------|------------|
| GPT-5.5 | 125 积分 | 12.50 积分 | 750 积分 |
| GPT-5.4 | 62.50 积分 | 6.250 积分 | 375 积分 |
| GPT-5.4-mini | 18.75 积分 | 1.875 积分 | 113 积分 |
| GPT-5.3-Codex | 43.75 积分 | 4.375 积分 | 350 积分 |
| GPT-5.2 | 43.75 积分 | 4.375 积分 | 350 积分 |
| GPT-5.3-Codex-Spark | 研究预览 |||
| GPT-Image-2（图像） | 200 积分 | 50 积分 | 750 积分 |
| GPT-Image-2（文本） | 125 积分 | 31.25 积分 | 250 积分 |

快速模式对支持的模型以更高的速率消耗积分。有关费率，请参阅[速度](/codex/speed)。

云端任务和代码审查运行在 GPT-5.3-Codex 上。

#### Plus、Pro、现有 Enterprise/Edu 和新 Edu

| | 单位 | GPT-5.5 | GPT-5.4 | GPT-5.3-Codex | GPT-5.4-mini |
|---|------|---------|---------|----------------|--------------|
| 本地任务 | 1 条消息 | \~14 积分 | \~7 积分 | \~5 积分 | \~2 积分 |
| 云端任务 | 1 条消息 | 不可用 | 不可用 | \~25 积分 | 不可用 |
| 代码审查 | 1 个 PR | 不可用 | 不可用 | \~25 积分 | 不可用 |
| 图像生成 | 1 张图 (1024px &times; 1024px) | \~5-6 积分 ||||
| 图像生成 | 1 张图 (1024px &times; 1536px) | \~7-8 积分 ||||

快速模式对支持的模型以更高的速率消耗积分。有关费率，请参阅[速度](/codex/speed)。

这些平均值同样适用于 GPT-5.2。

速度配置会增加所有适用模型的积分消耗。快速模式对支持的模型以更高的速率消耗积分。有关支持的模型和费率，请参阅[速度](https://developers.openai.com/codex/speed)。

[了解更多关于 ChatGPT Plus 和 Pro 中积分的信息。](https://help.openai.com/en/articles/12642688)

[了解更多关于 ChatGPT Business、Enterprise 和 Edu 中积分的信息。](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)

### 什么算作代码审查使用量？

代码审查使用量仅在 OpenAI Codex 通过 GitHub 运行审查时适用——例如，当您在 PR 中标记 `@Codex` 进行审查或在仓库上启用自动审查时。在本地或 GitHub 之外运行的审查计入您的通用使用限额。

### 如何延长我的使用限额？

上述使用限额和积分是平均费率。您可以尝试以下提示来最大化您的限额：

- **控制提示词的大小。** 对您给予 OpenAI Codex 的指令要精确，但删除不必要的上下文。
- **减小 AGENTS.md 的大小。** 如果您在较大的项目上工作，可以通过[在仓库中嵌套 AGENTS.md 文件](https://developers.openai.com/codex/guides/agents-md#layer-project-instructions)来控制通过 AGENTS.md 注入的上下文量。
- **限制使用的 MCP 服务器数量。** 每个添加到 OpenAI Codex 的 [MCP](https://developers.openai.com/codex/mcp) 都会为您的消息添加更多上下文并使用更多限额。不需要时禁用 MCP 服务器。
- **为常规任务切换到较小的模型。** 使用 GPT-5.4 或 GPT-5.4-mini 可以延长您的本地消息使用限额，具体取决于您切换的模型。
