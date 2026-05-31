> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 企业部署概览

> 了解 Claude Code 如何与各种第三方服务和基础设施集成，以满足企业部署需求。

Organizations can deploy Claude Code through Anthropic directly or through a cloud provider. This page helps you choose the right configuration.

## 比较部署选项

对于大多数组织，Claude for Teams 或 Claude for Enterprise 提供最佳体验。团队成员可以通过单一订阅同时访问 Claude Code 和网页版 Claude，集中计费，无需基础设施设置。

**Claude for Teams** 支持自助服务，包含协作功能、管理工具和计费管理。适合需要快速上手的小型团队。

**Claude for Enterprise** 在此基础上增加了 SSO 和域捕获、基于角色的权限、合规 API 访问，以及用于组织范围内部署 Claude Code 配置的托管策略设置。适合有安全和合规需求的大型组织。

了解有关 [Team 计划](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) 和 [Enterprise 计划](https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan) 的更多信息。

如果你的组织有特定的基础设施需求，请比较以下选项：

<table>
  <thead>
    <tr>
      <th>功能</th>
      <th>Claude for Teams/Enterprise</th>
      <th>Anthropic Console</th>
      <th>Amazon Bedrock</th>
      <th>Claude Platform on AWS</th>
      <th>Google Vertex AI</th>
      <th>Microsoft Foundry</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>最适合</td>
      <td>大多数组织（推荐）</td>
      <td>个人开发者</td>
      <td>AWS 原生部署</td>
      <td>AWS Marketplace 计费与 Claude API 功能</td>
      <td>GCP 原生部署</td>
      <td>Azure 原生部署</td>
    </tr>

    <tr>
      <td>计费</td>
      <td><strong>Teams：</strong> \$150/席位（Premium），支持 PAYG<br /><strong>Enterprise：</strong> <a href="https://claude.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=third_party_enterprise">联系销售</a></td>
      <td>PAYG</td>
      <td>通过 AWS PAYG</td>
      <td>通过 AWS Marketplace PAYG</td>
      <td>通过 GCP PAYG</td>
      <td>通过 Azure PAYG</td>
    </tr>

    <tr>
      <td>区域</td>
      <td>支持的[国家/地区](https://www.anthropic.com/supported-countries)</td>
      <td>支持的[国家/地区](https://www.anthropic.com/supported-countries)</td>
      <td>多个 AWS [区域](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)</td>
      <td>多个 AWS 区域</td>
      <td>多个 GCP [区域](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations)</td>
      <td>多个 Azure [区域](https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/)</td>
    </tr>

    <tr>
      <td>提示词缓存</td>
      <td>默认启用</td>
      <td>默认启用</td>
      <td>默认启用</td>
      <td>默认启用</td>
      <td>默认启用</td>
      <td>默认启用</td>
    </tr>

    <tr>
      <td>认证</td>
      <td>Claude.ai SSO 或邮箱</td>
      <td>API 密钥</td>
      <td>API 密钥或 AWS 凭证</td>
      <td>API 密钥或 AWS 凭证</td>
      <td>GCP 凭证</td>
      <td>API 密钥或 Microsoft Entra ID</td>
    </tr>

    <tr>
      <td>成本跟踪</td>
      <td>使用量仪表板</td>
      <td>使用量仪表板</td>
      <td>AWS Cost Explorer</td>
      <td>AWS Cost Explorer</td>
      <td>GCP Billing</td>
      <td>Azure Cost Management</td>
    </tr>

    <tr>
      <td>包含网页版 Claude</td>
      <td>是</td>
      <td>否</td>
      <td>否</td>
      <td>否</td>
      <td>否</td>
      <td>否</td>
    </tr>

    <tr>
      <td>企业功能</td>
      <td>团队管理、SSO、使用量监控</td>
      <td>无</td>
      <td>IAM 策略、CloudTrail</td>
      <td>IAM 策略、CloudTrail</td>
      <td>IAM 角色、Cloud Audit Logs</td>
      <td>RBAC 策略、Azure Monitor</td>
    </tr>
  </tbody>
</table>

选择部署选项以查看设置说明：

* [Claude for Teams 或 Enterprise](/zh/authentication#claude-for-teams-or-enterprise)
* [Anthropic Console](/zh/authentication#claude-console-authentication)
* [Amazon Bedrock](/zh/amazon-bedrock)
* [Claude Platform on AWS](/zh/claude-platform-on-aws)
* [Google Vertex AI](/zh/google-vertex-ai)
* [Microsoft Foundry](/zh/microsoft-foundry)

## 配置代理和网关

大多数组织可以直接使用云提供商，无需额外配置。但是，如果你的组织有特定的网络或管理需求，你可能需要配置企业代理或 LLM 网关。这些是不同的配置，可以一起使用：

* **企业代理**：通过 HTTP/HTTPS 代理路由流量。如果你的组织要求所有出站流量通过代理服务器进行安全监控、合规或网络策略执行，请使用此选项。通过 `HTTPS_PROXY` 或 `HTTP_PROXY` 环境变量配置。在[企业网络配置](/zh/network-config)中了解更多信息。
* **LLM 网关**：位于 Claude Code 和云提供商之间的服务，用于处理认证和路由。如果你需要跨团队的集中使用量跟踪、自定义速率限制或预算，或集中认证管理，请使用此选项。通过 `ANTHROPIC_BASE_URL`、`ANTHROPIC_BEDROCK_BASE_URL`、`ANTHROPIC_AWS_BASE_URL` 或 `ANTHROPIC_VERTEX_BASE_URL` 环境变量配置。在 [LLM 网关配置](/zh/llm-gateway)中了解更多信息。

以下示例展示了在 shell 或 shell 配置文件（`.bashrc`、`.zshrc`）中设置的环境变量。有关其他配置方法，请参阅[设置](/zh/settings)。

### Amazon Bedrock

通过以下[环境变量](/zh/env-vars)配置 Bedrock：

```bash
# Enable Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Configure corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'
```

通过以下[环境变量](/zh/env-vars)将 Bedrock 流量路由到你的 LLM 网关：

```bash
# Enable Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# Configure LLM gateway
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # If gateway handles AWS auth
```

### Microsoft Foundry

通过以下[环境变量](/zh/env-vars)配置 Foundry：

```bash
# Enable Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key  # Or omit for Entra ID auth

# Configure corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'
```

通过以下[环境变量](/zh/env-vars)将 Foundry 流量路由到你的 LLM 网关：

```bash
# Enable Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1

# Configure LLM gateway
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1  # If gateway handles Azure auth
```

### Google Vertex AI

通过以下[环境变量](/zh/env-vars)配置 Vertex AI：

```bash
# Enable Vertex
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Configure corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'
```

通过以下[环境变量](/zh/env-vars)将 Vertex AI 流量路由到你的 LLM 网关：

```bash
# Enable Vertex
export CLAUDE_CODE_USE_VERTEX=1

# Configure LLM gateway
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1  # If gateway handles GCP auth
```

在 Claude Code 中使用 `/status` 验证代理和网关配置是否正确应用。

## 组织最佳实践

### 投资文档和记忆

我们强烈建议投资文档建设，以便 Claude Code 理解你的代码库。组织可以在多个层级部署 CLAUDE.md 文件：

* **组织范围**：部署到系统目录，如 `/Library/Application Support/ClaudeCode/CLAUDE.md`（macOS），用于公司范围的标准
* **仓库级别**：在仓库根目录创建 `CLAUDE.md` 文件，包含项目架构、构建命令和贡献指南。将这些文件纳入版本控制，以便所有用户受益

在[记忆和 CLAUDE.md 文件](/zh/memory)中了解更多信息。

### 简化部署

如果你有自定义开发环境，我们发现创建"一键式"安装 Claude Code 的方式对于在组织内推广采用至关重要。

### 从引导式使用开始

鼓励新用户尝试使用 Claude Code 进行代码库问答，或用于较小的 bug 修复或功能请求。让 Claude Code 制定计划。检查 Claude 的建议，如果偏离方向请提供反馈。随着时间的推移，当用户更好地理解这种新范式时，他们将更有效地让 Claude Code 以更自主的方式运行。

### 为云提供商固定模型版本

如果你通过 [Bedrock](/zh/amazon-bedrock)、[Vertex AI](/zh/google-vertex-ai)、[Foundry](/zh/microsoft-foundry) 或 [Claude Platform on AWS](/zh/claude-platform-on-aws) 部署，请使用 `ANTHROPIC_DEFAULT_OPUS_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL` 和 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 固定特定模型版本。如果不固定，模型别名会解析到最新版本，当 Anthropic 发布更新时，该版本可能尚未在你的账户中启用。固定版本可以让你控制用户何时迁移到新模型。有关当最新版本不可用时各提供商的行为，请参阅[模型配置](/zh/model-config#pin-models-for-third-party-deployments)。

### 配置安全策略

安全团队可以配置托管权限，定义 Claude Code 允许和不允许执行的操作，这些配置无法被本地配置覆盖。[了解更多](/zh/security)。

### 利用 MCP 进行集成

MCP 是为 Claude Code 提供更多信息的好方法，例如连接到工单管理系统或错误日志。我们建议由一个中心团队配置 MCP 服务器并将 `.mcp.json` 配置签入代码库，以便所有用户受益。[了解更多](/zh/mcp)。

在 Anthropic，我们信任 Claude Code 为所有 Anthropic 代码库的开发提供支持。希望你和我们一样享受使用 Claude Code。

## 后续步骤

选择部署选项并为团队配置访问权限后：

1. **向团队推广**：分享安装说明，让团队成员[安装 Claude Code](/zh/setup) 并使用其凭证进行认证。
2. **设置共享配置**：在仓库中创建 [CLAUDE.md 文件](/zh/memory)，帮助 Claude Code 理解你的代码库和编码标准。
3. **配置权限**：查看[安全设置](/zh/security)，定义 Claude Code 在你的环境中可以做什么和不能做什么。
