> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# LLM 网关配置

> 了解如何配置 Claude Code 以使用 LLM 网关解决方案。涵盖网关要求、认证配置、模型选择以及特定提供商的端点设置。

LLM 网关在 Claude Code 和模型提供商之间提供了一个集中式代理层，通常提供：

* **集中式认证** - API 密钥管理的单一入口
* **用量跟踪** - 跨团队和项目监控使用情况
* **成本控制** - 实施预算和速率限制
* **审计日志** - 跟踪所有模型交互以满足合规要求
* **模型路由** - 无需更改代码即可在提供商之间切换

## 网关要求

LLM 网关要与 Claude Code 配合使用，必须满足以下要求：

**API 格式**

网关必须向客户端暴露以下至少一种 API 格式：

1. **Anthropic Messages**：`/v1/messages`、`/v1/messages/count_tokens`
   * 必须转发请求头：`anthropic-beta`、`anthropic-version`

2. **Bedrock InvokeModel**：`/invoke`、`/invoke-with-response-stream`
   * 必须保留请求体字段：`anthropic_beta`、`anthropic_version`

3. **Vertex rawPredict**：`:rawPredict`、`:streamRawPredict`、`/count-tokens:rawPredict`
   * 必须转发请求头：`anthropic-beta`、`anthropic-version`

未能转发请求头或保留请求体字段可能导致功能受限或无法使用 Claude Code 功能。

**注意**：Claude Code 根据 API 格式决定启用哪些功能。当使用 Anthropic Messages 格式配合 Bedrock 或 Vertex 时，可能需要设置环境变量 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`。

**请求头**

Claude Code 在 API 请求中包含以下请求头：

| 请求头 | 描述 |
| :------ | :------ |
| `X-Claude-Code-Session-Id` | 当前 Claude Code 会话的唯一标识符。代理可以使用它来聚合单个会话中的所有 API 请求，而无需解析请求体。 |
| `X-Claude-Code-Agent-Id` | 发出请求的子代理或队友的标识符。你的代理可以使用它将 API 成本归因到会话内的各个并行子代理，而无需解析请求体。仅在由进程内子代理或队友发出的请求中存在。 |
| `X-Claude-Code-Parent-Agent-Id` | 生成当前请求代理的父代理标识符。与 `X-Claude-Code-Agent-Id` 配合使用，可在你的代理中跨嵌套代理归因 API 成本。仅在请求代理本身由另一个代理生成时存在。 |

两个代理 ID 请求头都是每次生成时的临时标识符，不是持久的用户或设备 ID。

Claude Code 还会在系统提示词前添加一个简短的归因信息块，包含客户端版本和从对话中派生的指纹。Anthropic API 在处理前会剥离此信息块，因此它不会影响一方提示词缓存。如果你的网关基于完整请求体实现了自己的提示词缓存，请设置 [`CLAUDE_CODE_ATTRIBUTION_HEADER=0`](/zh/env-vars) 以省略它。

## 配置

### 模型选择

默认情况下，Claude Code 使用所选 API 格式的标准模型名称。

当 `ANTHROPIC_BASE_URL` 指向暴露 Anthropic Messages 格式的网关时，Claude Code 可以在启动时查询网关的 `/v1/models` 端点，并将返回的模型添加到 `/model` 选择器中。设置 `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1` 以启用此功能。发现功能默认关闭，以免使用共享 API 密钥的网关向每个用户暴露该密钥可访问的所有模型。每个发现的条目标记为"From gateway"，并在提供时使用响应中的 `display_name` 字段。这需要 Claude Code v2.1.129 或更高版本。

发现功能仅适用于 Anthropic Messages 格式。它不会为 Bedrock 或 Vertex 直通端点运行，也不会在 `ANTHROPIC_BASE_URL` 未设置或指向 `api.anthropic.com` 时运行。

发现请求使用与推理请求相同的认证方式：它发送 `ANTHROPIC_AUTH_TOKEN` 作为 Bearer 令牌，或在未设置认证令牌时发送 `ANTHROPIC_API_KEY` 作为 `x-api-key` 请求头，以及来自 `ANTHROPIC_CUSTOM_HEADERS` 的任何请求头。只有 ID 以 `claude` 或 `anthropic` 开头的模型才会被添加到选择器中。结果缓存到 `~/.claude/cache/gateway-models.json` 并在每次启动时刷新。如果请求失败或网关未实现 `/v1/models`，选择器将回退到上一次启动时的缓存列表或内置模型列表。

如果你的网关使用的模型名称与发现过滤器不匹配，请使用[模型配置](/zh/model-config)中记录的环境变量手动添加。

## LiteLLM 配置

**警告**：LiteLLM PyPI 版本 1.82.7 和 1.82.8 被植入了窃取凭证的恶意软件。不要安装这些版本。如果你已经安装了它们：

* 移除该包
* 在受影响的系统上轮换所有凭证
* 按照 [BerriAI/litellm#24518](https://github.com/BerriAI/litellm/issues/24518) 中的修复步骤操作

LiteLLM 是第三方代理服务。Anthropic 不认可、维护或审计 LiteLLM 的安全性或功能。本指南仅供参考，可能会过时。请自行判断使用。

### 前提条件

* Claude Code 已更新到最新版本
* LiteLLM 代理服务器已部署且可访问
* 通过你选择的提供商访问 Claude 模型

### 基本 LiteLLM 设置

**配置 Claude Code**：

#### 认证方式

##### 静态 API 密钥

使用固定 API 密钥的最简单方法：

```bash
# 在环境中设置
export ANTHROPIC_AUTH_TOKEN=sk-litellm-static-key

# 或在 Claude Code 设置中
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-litellm-static-key"
  }
}
```

此值将作为 `Authorization` 请求头发送。

##### 使用助手的动态 API 密钥

用于密钥轮换或按用户认证：

1. 创建 API 密钥助手脚本：

```bash
#!/bin/bash
# ~/bin/get-litellm-key.sh

# 示例：从 vault 获取密钥
vault kv get -field=api_key secret/litellm/claude-code

# 示例：生成 JWT 令牌
jwt encode \
  --secret="${JWT_SECRET}" \
  --exp="+1h" \
  '{"user":"'${USER}'","team":"engineering"}'
```

2. 配置 Claude Code 设置以使用助手：

```json
{
  "apiKeyHelper": "~/bin/get-litellm-key.sh"
}
```

3. 设置令牌刷新间隔：

```bash
# 每小时刷新一次（3600000 毫秒）
export CLAUDE_CODE_API_KEY_HELPER_TTL_MS=3600000
```

此值将作为 `Authorization` 和 `X-Api-Key` 请求头发送。`apiKeyHelper` 的优先级低于 `ANTHROPIC_AUTH_TOKEN` 或 `ANTHROPIC_API_KEY`。

#### 统一端点（推荐）

使用 LiteLLM 的 [Anthropic 格式端点](https://docs.litellm.ai/docs/anthropic_unified)：

```bash
export ANTHROPIC_BASE_URL=https://litellm-server:4000
```

**统一端点相比直通端点的优势：**

* 负载均衡
* 故障转移
* 统一支持成本跟踪和终端用户跟踪

#### 特定提供商的直通端点（备选）

##### 通过 LiteLLM 使用 Claude API

使用[直通端点](https://docs.litellm.ai/docs/pass_through/anthropic_completion)：

```bash
export ANTHROPIC_BASE_URL=https://litellm-server:4000/anthropic
```

##### 通过 LiteLLM 使用 Amazon Bedrock

使用[直通端点](https://docs.litellm.ai/docs/pass_through/bedrock)：

```bash
export ANTHROPIC_BEDROCK_BASE_URL=https://litellm-server:4000/bedrock
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1
export CLAUDE_CODE_USE_BEDROCK=1
```

##### 通过 LiteLLM 使用 Google Vertex AI

使用[直通端点](https://docs.litellm.ai/docs/pass_through/vertex_ai)：

```bash
export ANTHROPIC_VERTEX_BASE_URL=https://litellm-server:4000/vertex_ai/v1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project-id
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
```

##### 通过网关使用 Claude Platform on AWS

路由到转发 [Claude Platform on AWS](/zh/claude-platform-on-aws) 端点的网关：

```bash
export ANTHROPIC_AWS_BASE_URL=https://litellm-server:4000/anthropic-aws
export ANTHROPIC_AWS_WORKSPACE_ID=wrkspc_01ABCDEFGHIJKLMN
export CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH=1
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
```

更多详细信息，请参阅 [LiteLLM 文档](https://docs.litellm.ai/)。

## 其他资源

* [LiteLLM 文档](https://docs.litellm.ai/)
* [Claude Code 设置](/zh/settings)
* [企业网络配置](/zh/network-config)
* [第三方集成概览](/zh/third-party-integrations)
