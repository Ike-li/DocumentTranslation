> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 在 Google Vertex AI 上使用 Claude Code

> 了解如何通过 Google Vertex AI 配置 Claude Code，包括设置、IAM 配置和故障排除。

## 前提条件

在通过 Vertex AI 配置 Claude Code 之前，请确保你已具备：

* 一个已启用计费的 Google Cloud Platform (GCP) 账户
* 一个已启用 Vertex AI API 的 GCP 项目
* 访问所需 Claude 模型的权限（例如 Claude Sonnet 4.6）
* 已安装并配置 Google Cloud SDK (`gcloud`)
* 在所需 GCP 区域中已分配配额

要使用你自己的 Vertex AI 凭据登录，请参阅下方的[使用 Vertex AI 登录](#在-google-vertex-ai-上使用-claude-code)。要在团队中部署 Claude Code，请使用[手动设置](#手动设置)步骤，并在推出前[固定你的模型版本](#5-固定模型版本)。

## 使用 Vertex AI 登录

如果你拥有 Google Cloud 凭据并想开始通过 Vertex AI 使用 Claude Code，登录向导会引导你完成操作。你只需为每个项目完成一次 GCP 端的前提条件；向导会处理 Claude Code 端的配置。

Vertex AI 设置向导需要 Claude Code v2.1.98 或更高版本。运行 `claude --version` 进行检查。

1. 在你的 GCP 项目中启用 Claude 模型：为你的项目[启用 Vertex AI API](#1-启用-vertex-ai-api)，然后在 [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) 中请求访问你想要的 Claude 模型。有关你的账户所需的权限，请参阅 [IAM 配置](#iam-配置)。

2. 启动 Claude Code 并选择 Vertex AI：运行 `claude`。在登录提示中，选择 **3rd-party platform**，然后选择 **Google Vertex AI**。

3. 按照向导提示操作：选择你向 Google Cloud 进行身份验证的方式：来自 `gcloud` 的 Application Default Credentials、服务账号密钥文件，或你环境中已有的凭据。向导会检测你的项目和区域，验证你的项目可以调用哪些 Claude 模型，并让你固定它们。结果会保存到你的[用户设置文件](/zh/settings)的 `env` 块中，因此你无需自行导出环境变量。

登录后，随时运行 `/setup-vertex` 可重新打开向导，更改你的凭据、项目、区域或模型固定。

## 区域配置

Claude Code 支持 Vertex AI [全球](https://cloud.google.com/blog/products/ai-machine-learning/global-endpoint-for-claude-models-generally-available-on-vertex-ai)、多区域和区域端点。将 `CLOUD_ML_REGION` 设置为 `global`、多区域位置（如 `eu` 或 `us`），或特定区域（如 `us-east5`）。Claude Code 会为每种形式选择正确的 Vertex AI 主机名，包括多区域位置的 `aiplatform.eu.rep.googleapis.com` 和 `aiplatform.us.rep.googleapis.com` 主机。

Vertex AI 可能并非在每种端点类型上都支持 Claude Code 的默认模型。模型可用性因[特定区域](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#genai-partner-models)、多区域位置和[全球端点](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-partner-models#supported_models)而异。你可能需要切换到受支持的位置或指定受支持的模型。

## 手动设置

要通过环境变量（而非向导）配置 Vertex AI，例如在 CI 或脚本化的企业部署中，请按照以下步骤操作。

### 1. 启用 Vertex AI API

在你的 GCP 项目中启用 Vertex AI API：

```bash
# Set your project ID
gcloud config set project YOUR-PROJECT-ID

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

### 2. 请求模型访问权限

在 Vertex AI 中请求访问 Claude 模型：

1. 导航到 [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. 搜索 "Claude" 模型
3. 请求访问所需的 Claude 模型（例如 Claude Sonnet 4.6）
4. 等待批准（可能需要 24-48 小时）

### 3. 配置 GCP 凭据

Claude Code 使用标准的 Google Cloud 身份验证。

有关更多信息，请参阅 [Google Cloud 身份验证文档](https://cloud.google.com/docs/authentication)。

Claude Code v2.1.121 或更高版本支持通过同一 Application Default Credentials 链进行[基于 X.509 证书的 Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation-with-x509-certificates)。将 `GOOGLE_APPLICATION_CREDENTIALS` 设置为你的凭据配置文件路径。

Claude Code 使用 `ANTHROPIC_VERTEX_PROJECT_ID` 作为 Vertex AI 请求的项目 ID。`GCLOUD_PROJECT` 和 `GOOGLE_CLOUD_PROJECT` 环境变量以及 `GOOGLE_APPLICATION_CREDENTIALS` 引用的凭据文件优先于它。如果这些都未设置，项目 ID 将从你的 `gcloud` 配置或附加的服务账号中解析。

#### 高级凭据配置

Claude Code 通过 `gcpAuthRefresh` 设置支持 GCP 的自动凭据刷新。当 Claude Code 检测到你的 GCP 凭据已过期或无法加载时，它会运行配置的命令来获取新凭据，然后重试请求。

```json
{
  "gcpAuthRefresh": "gcloud auth application-default login",
  "env": {
    "ANTHROPIC_VERTEX_PROJECT_ID": "your-project-id"
  }
}
```

命令的输出会显示给用户，但不支持交互式输入。这非常适合基于浏览器的身份验证流程，CLI 显示一个 URL，你在浏览器中完成身份验证。如果身份验证未完成，刷新命令会在三分钟后超时。如果你在项目设置（如 `.claude/settings.json`）中设置了 `gcpAuthRefresh`，该命令仅在你接受工作区信任提示后才会运行。

### 4. 配置 Claude Code

设置以下环境变量：

```bash
# Enable Vertex AI integration
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# Optional: Override the Vertex endpoint URL for custom endpoints or gateways
# export ANTHROPIC_VERTEX_BASE_URL=https://aiplatform.googleapis.com

# Optional: Disable prompt caching if needed
export DISABLE_PROMPT_CACHING=1

# Optional: Request 1-hour prompt cache TTL instead of the 5-minute default
export ENABLE_PROMPT_CACHING_1H=1

# When CLOUD_ML_REGION=global, override region for models that don't support global endpoints
export VERTEX_REGION_CLAUDE_HAIKU_4_5=us-east5
export VERTEX_REGION_CLAUDE_4_6_SONNET=europe-west1
```

大多数模型版本都有对应的 `VERTEX_REGION_CLAUDE_*` 变量。完整列表请参阅[环境变量参考](/zh/env-vars)。请查看 [Vertex Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) 以确定哪些模型支持全球端点，哪些仅支持区域端点。

[提示词缓存](/zh/prompt-caching)默认启用。要禁用它，请设置 `DISABLE_PROMPT_CACHING=1`。要请求 1 小时的缓存 TTL（而非默认的 5 分钟），请设置 `ENABLE_PROMPT_CACHING_1H=1`；1 小时 TTL 的缓存写入按更高的费率计费。如需提高速率限制，请联系 Google Cloud 支持。使用 Vertex AI 时，`/logout` 命令不可用，因为身份验证通过 Google Cloud 凭据处理。

Claude Code 默认在 Vertex AI 上禁用 [MCP 工具搜索](/zh/mcp#scale-with-mcp-tool-search)，因此 MCP 工具定义会预先加载。Vertex AI 支持 Claude Sonnet 4.5 及更高版本和 Claude Opus 4.5 及更高版本的工具搜索。设置 `ENABLE_TOOL_SEARCH=true` 可在这些模型上启用它。Vertex AI 上的早期模型不接受所需的 beta 头，如果对它们启用工具搜索，请求会失败。

### 5. 固定模型版本

部署给多个用户时，请固定特定的模型版本。如果不固定，`sonnet` 和 `opus` 等模型别名会解析为最新版本，当 Anthropic 发布更新时，该版本可能尚未在你的 Vertex AI 项目中启用。Claude Code 在启动时如果最新版本不可用会[回退](#启动模型检查)到上一版本，但固定版本可以让你控制用户何时迁移到新模型。

将这些环境变量设置为特定的 Vertex AI 模型 ID。

如果不设置 `ANTHROPIC_DEFAULT_OPUS_MODEL`，Vertex 上的 `opus` 别名会解析为 Opus 4.6。将其设置为 Opus 4.8 ID 即可使用最新模型：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-8'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

有关当前和旧版模型 ID，请参阅[模型概览](https://platform.claude.com/docs/en/about-claude/models/overview)。完整环境变量列表请参阅[模型配置](/zh/model-config#pin-models-for-third-party-deployments)。

未设置固定变量时，Claude Code 使用以下默认模型：

| 模型类型 | 默认值 |
| :--------------- | :--------------------------- |
| 主要模型 | `claude-sonnet-4-5@20250929` |
| 小型/快速模型 | 与主要模型相同 |

会话标题生成等后台任务使用小型/快速模型，通常是 Haiku 级模型。在 Vertex AI 上，Claude Code 默认将其设为主要模型，因为 Haiku 可能未在每个项目或区域中启用。要在后台任务中使用 Haiku，请将 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 设置为你的项目中可用的模型 ID。

要进一步自定义模型：

```bash
export ANTHROPIC_MODEL='claude-opus-4-8'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

## 启动模型检查

当 Claude Code 在配置了 Vertex AI 的情况下启动时，它会验证其打算使用的模型是否可在你的项目中访问。此检查需要 Claude Code v2.1.98 或更高版本。

如果你固定的模型版本早于当前 Claude Code 默认版本，且你的项目可以调用较新版本，Claude Code 会提示你更新固定。接受后，新的模型 ID 会写入你的[用户设置文件](/zh/settings)并重启 Claude Code。拒绝后会一直记住，直到下一个默认版本更改。

如果你未固定模型且当前默认版本在你的项目中不可用，Claude Code 会在当前会话中回退到上一版本并显示通知。该回退不会持久化。在 [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) 中启用较新版本或[固定版本](#5-固定模型版本)可使选择永久生效。

## IAM 配置

分配所需的 IAM 权限：

`roles/aiplatform.user` 角色包含所需的权限：

* `aiplatform.endpoints.predict` - 模型调用和 token 计数所需

如需更严格的权限，请创建仅包含上述权限的自定义角色。

有关详情，请参阅 [Vertex IAM 文档](https://cloud.google.com/vertex-ai/docs/general/access-control)。

为 Claude Code 创建专用的 GCP 项目，以简化成本跟踪和访问控制。

## 1M token 上下文窗口

Claude Opus 4.6 及更高版本以及 Sonnet 4.6 在 Vertex AI 上支持 [1M token 上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)。当你选择 1M 模型变体时，Claude Code 会自动启用扩展上下文窗口。

[设置向导](#在-google-vertex-ai-上使用-claude-code)在固定模型时会提供 1M 上下文选项。要为手动固定的模型启用它，请在模型 ID 后附加 `[1m]`。有关详情，请参阅[为第三方部署固定模型](/zh/model-config#pin-models-for-third-party-deployments)。

## 故障排除

如果你遇到 "Could not load the default credentials" 错误：

* 运行 `gcloud auth application-default login` 设置 Application Default Credentials
* 将 `GOOGLE_APPLICATION_CREDENTIALS` 设置为服务账号密钥文件路径
* 有关所有选项，请参阅[配置 GCP 凭据](#3-配置-gcp-凭据)

如果你遇到配额问题：

* 通过 [Cloud Console](https://cloud.google.com/docs/quotas/view-manage) 检查当前配额或请求增加配额

如果你遇到 "model not found" 404 错误：

* 确认模型已在 [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) 中启用
* 验证模型在你指定的位置可用。某些模型仅在 `global` 或多区域位置（如 `eu` 和 `us`）提供，而非特定区域
* 如果使用 `CLOUD_ML_REGION=global`，请在 [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) 的"Supported features"下检查你的模型是否支持全球端点。对于不支持全球端点的模型，可以：
  * 通过 `ANTHROPIC_MODEL` 或 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 指定受支持的模型，或
  * 使用 `VERTEX_REGION_<MODEL_NAME>` 环境变量设置区域或多区域位置

如果你遇到 429 错误：

* 对于区域端点，请确保主要模型和小型/快速模型在你选择的区域中受支持
* 考虑切换到 `CLOUD_ML_REGION=global` 以获得更好的可用性

## 其他资源

* [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
* [Vertex AI 定价](https://cloud.google.com/vertex-ai/pricing)
* [Vertex AI 配额和限制](https://cloud.google.com/vertex-ai/docs/quotas)
