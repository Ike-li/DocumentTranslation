> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 在 Microsoft Foundry 上使用 Claude Code

> 了解如何通过 Microsoft Foundry 配置 Claude Code，包括设置、配置和故障排除。

## 前提条件

在使用 Microsoft Foundry 配置 Claude Code 之前，请确保你已具备：

* 具有 Microsoft Foundry 访问权限的 Azure 订阅
* 具有创建 Microsoft Foundry 资源和部署的 RBAC 权限
* 已安装并配置 Azure CLI（可选 - 仅在你没有其他获取凭证的机制时需要）

如果你要将 Claude Code 部署给多个用户，请[固定你的模型版本](#4-固定模型版本)以防止 Anthropic 发布新模型时出现问题。

## 设置

### 1. 预配 Microsoft Foundry 资源

首先，在 Azure 中创建 Claude 资源：

1. 导航到 [Microsoft Foundry 门户](https://ai.azure.com/)
2. 创建新资源，记下你的资源名称
3. 为 Claude 模型创建部署：
   * Claude Opus
   * Claude Sonnet
   * Claude Haiku

### 2. 配置 Azure 凭证

Claude Code 支持两种 Microsoft Foundry 认证方法。选择最适合你安全需求的方法。

**选项 A：API 密钥认证**

1. 在 Microsoft Foundry 门户中导航到你的资源
2. 进入 **Endpoints and keys** 部分
3. 复制 **API Key**
4. 设置环境变量：

```bash
export ANTHROPIC_FOUNDRY_API_KEY=your-azure-api-key
```

**选项 B：Microsoft Entra ID 认证**

当未设置 `ANTHROPIC_FOUNDRY_API_KEY` 时，Claude Code 会自动使用 Azure SDK [默认凭证链](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/credential-chains#defaultazurecredential-overview)。
这支持多种用于本地和远程工作负载认证的方法。

在本地环境中，你通常可以使用 Azure CLI：

```bash
az login
```

使用 Microsoft Foundry 时，`/logout` 命令不可用，因为认证通过 Azure 凭证处理。

### 3. 配置 Claude Code

设置以下环境变量以启用 Microsoft Foundry：

```bash
# Enable Microsoft Foundry integration
export CLAUDE_CODE_USE_FOUNDRY=1

# Azure resource name (replace {resource} with your resource name)
export ANTHROPIC_FOUNDRY_RESOURCE={resource}
# Or provide the full base URL:
# export ANTHROPIC_FOUNDRY_BASE_URL=https://{resource}.services.ai.azure.com/anthropic
```

### 4. 固定模型版本

请为每个部署固定具体的模型版本。如果你使用模型别名（`sonnet`、`opus`、`haiku`）而不进行固定，Claude Code 可能会尝试使用你的 Foundry 账户中不可用的较新模型版本，当 Anthropic 发布更新时会导致现有用户出现问题。创建 Azure 部署时，请选择具体的模型版本，而不是"自动更新到最新版本"。

设置模型变量以匹配你在步骤 1 中创建的部署名称。

如果不设置 `ANTHROPIC_DEFAULT_OPUS_MODEL`，Foundry 上的 `opus` 别名将解析为 Opus 4.6。将其设置为 Opus 4.8 ID 以使用最新模型：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-8'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
```

会话标题生成等后台任务使用小型/快速模型，通常是 Haiku 级别模型。在 Foundry 上，Claude Code 默认将其设为主模型，因为并非每个账户都有 Haiku 部署。要将 Haiku 用于后台任务，请将 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 设置为你的账户中可用的 Haiku 部署，如上所示。

有关当前和旧版模型 ID，请参阅[模型概览](https://platform.claude.com/docs/en/about-claude/models/overview)。有关完整的环境变量列表，请参阅[模型配置](/zh/model-config#pin-models-for-third-party-deployments)。

[提示词缓存](/zh/prompt-caching)会自动启用。要请求 1 小时缓存 TTL 而不是默认的 5 分钟，请设置以下变量；1 小时 TTL 的缓存写入将以更高的费率计费：

```bash
export ENABLE_PROMPT_CACHING_1H=1
```

### 5. 运行 Claude Code

设置好环境变量后，从项目目录启动 Claude Code：

```bash
claude
```

Claude Code 从环境中读取 `CLAUDE_CODE_USE_FOUNDRY` 和其他 Foundry 变量，并在首次提示时连接到你的 Azure 资源。与 Bedrock 和 Vertex AI 不同，Foundry 没有交互式设置向导，因此步骤 3 和 4 中的环境变量是唯一的配置路径。

## Azure RBAC 配置

`Azure AI User` 和 `Cognitive Services User` 默认角色包含调用 Claude 模型所需的所有权限。

如需更严格的权限，请创建具有以下内容的自定义角色：

```json
{
  "permissions": [
    {
      "dataActions": [
        "Microsoft.CognitiveServices/accounts/providers/*"
      ]
    }
  ]
}
```

详情请参阅 [Microsoft Foundry RBAC 文档](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry)。

## 故障排除

如果你收到错误 "Failed to get token from azureADTokenProvider: ChainedTokenCredential authentication failed"：

* 在环境中配置 Entra ID，或设置 `ANTHROPIC_FOUNDRY_API_KEY`。

## 其他资源

* [Microsoft Foundry 文档](https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry)
* [Microsoft Foundry 模型](https://ai.azure.com/explore/models)
* [Microsoft Foundry 定价](https://azure.microsoft.com/en-us/pricing/details/ai-foundry/)
