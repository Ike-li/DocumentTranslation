> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 法律与合规

> Claude Code 的法律协议、合规认证和安全信息。

**注意**：自 2026 年 6 月 15 日起，订阅计划上的 Agent SDK 和 `claude -p` 使用将从新的每月 Agent SDK 额度中扣除，与您的交互使用限制分开计算。详见[在 Claude 计划中使用 Claude Agent SDK](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)。

## 法律协议

### 许可证

您对 Claude Code 的使用受以下条款约束：

* [商业条款](https://www.anthropic.com/legal/commercial-terms) - 适用于 Team、Enterprise 和 Claude API 用户
* [消费者服务条款](https://www.anthropic.com/legal/consumer-terms) - 适用于 Free、Pro 和 Max 用户

### 商业协议

无论您是直接使用 Claude API（第一方）还是通过 Amazon Bedrock 或 Google Vertex（第三方）访问，您现有的商业协议都将适用于 Claude Code 的使用，除非双方另有约定。

## 合规

### 医疗合规（BAA）

如果客户与我们签订了商业伙伴协议（BAA）并希望使用 Claude Code，只要客户已签署 BAA 且已激活[零数据保留（ZDR）](/zh/zero-data-retention)，BAA 将自动扩展以覆盖 Claude Code。BAA 将适用于该客户通过 Claude Code 流转的 API 流量。ZDR 按组织启用，因此每个组织必须单独启用 ZDR 才能被 BAA 覆盖。

## 使用政策

### 可接受使用

Claude Code 的使用受 [Anthropic 使用政策](https://www.anthropic.com/legal/aup)约束。Pro 和 Max 计划的宣传使用限制假设为 Claude Code 和 Agent SDK 的普通个人使用。

### 身份验证和凭据使用

Claude Code 使用 OAuth 令牌或 API 密钥向 Anthropic 的服务器进行身份验证。这些身份验证方式用途不同：

* **OAuth 身份验证**专供 Claude Free、Pro、Max、Team 和 Enterprise 订阅计划购买者使用，旨在支持 Claude Code 和其他 Anthropic 原生应用的正常使用。有关用户如何使用 OAuth 令牌进行身份验证的更多信息，请参阅[登录您的 Claude 账户](https://support.claude.com/en/articles/13189465-logging-in-to-your-claude-account)。
* **开发者**构建与 Claude 功能交互的产品或服务（包括使用 [Agent SDK](/zh/agent-sdk/overview) 的开发者）应通过 [Claude Console](https://platform.claude.com/) 或受支持的云提供商使用 API 密钥身份验证。Anthropic 不允许第三方开发者提供 Claude.ai 登录或代表其用户通过 Free、Pro 或 Max 计划凭据路由请求。

Anthropic 保留采取措施执行这些限制的权利，且可能在不事先通知的情况下执行。

有关您使用场景的允许身份验证方式的疑问，请[联系销售](https://www.anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=legal_compliance_contact_sales)。

## 安全与信任

### 信任与安全

您可以在 [Anthropic 信任中心](https://trust.anthropic.com)和[透明度中心](https://www.anthropic.com/transparency)找到更多信息。

### 安全漏洞报告

Anthropic 通过 HackerOne 管理我们的安全计划。[使用此表格报告漏洞](https://hackerone.com/4f1f16ba-10d3-4d09-9ecc-c721aad90f24/embedded_submissions/new)。

***

© Anthropic PBC. 保留所有权利。使用受适用的 Anthropic 服务条款约束。
