> ## 文档索引
> 在以下地址获取完整的文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件查看所有可用页面。

# Amazon Bedrock 上的 Claude Code

> 了解如何通过 Amazon Bedrock 配置 Claude Code，包括设置、IAM 配置和故障排除。

export const ContactSalesCard = ({surface}) => {
  const utm = content => `utm_source=claude_code&utm_medium=docs&utm_content=${surface}_${content}`;
  const iconArrowRight = (size = 13) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>;
  const STYLES = `
.cc-cs {
  --cs-slate: #141413;
  --cs-clay: #d97757;
  --cs-clay-deep: #c6613f;
  --cs-gray-000: #ffffff;
  --cs-gray-700: #3d3d3a;
  --cs-border-default: rgba(31, 30, 29, 0.15);
  font-family: inherit;
}
.dark .cc-cs {
  --cs-slate: #f0eee6;
  --cs-gray-000: #262624;
  --cs-gray-700: #bfbdb4;
  --cs-border-default: rgba(240, 238, 230, 0.14);
}
.cc-cs-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 16px; margin: 0;
  background: var(--cs-gray-000); border: 0.5px solid var(--cs-border-default);
  border-radius: 8px; flex-wrap: wrap;
}
.cc-cs-text { font-size: 13px; color: var(--cs-gray-700); line-height: 1.5; flex: 1; min-width: 240px; }
.cc-cs-text strong { font-weight: 550; color: var(--cs-slate); }
.cc-cs-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cc-cs-btn-clay {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--cs-clay-deep); color: #fff; border: none;
  border-radius: 8px; padding: 8px 14px;
  font-size: 13px; font-weight: 500;
  transition: background-color 0.15s; white-space: nowrap;
}
.cc-cs-btn-clay:hover { background: var(--cs-clay); }
.cc-cs-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--cs-gray-700);
  border: 0.5px solid var(--cs-border-default);
  border-radius: 8px; padding: 8px 14px;
  font-size: 13px; font-weight: 500;
}
.cc-cs-btn-ghost:hover { background: rgba(0, 0, 0, 0.04); }
.dark .cc-cs-btn-ghost:hover { background: rgba(255, 255, 255, 0.04); }
@media (max-width: 720px) {
  .cc-cs-actions { width: 100%; }
}
`;
  return <div className="cc-cs not-prose">
      <style>{STYLES}</style>
      <div className="cc-cs-card">
        <div className="cc-cs-text">
          <strong>在组织中部署 Claude Code？</strong> 与销售团队讨论企业计划、SSO 和集中计费。
        </div>
        <div className="cc-cs-actions">
          <a className="cc-cs-btn-ghost">
            查看计划
          </a>
          <a className="cc-cs-btn-clay">
            联系销售 {iconArrowRight()}
          </a>
        </div>
      </div>
    </div>;
};

## 前置条件

在将 Claude Code 与 Bedrock 配置之前，请确保您已具备：

* 拥有一个已启用 Bedrock 访问权限的 AWS 账户
* 在 Bedrock 中有权访问所需的 Claude 模型（例如，Claude Sonnet 4.6）
* 已安装并配置 AWS CLI（可选 - 仅当您没有其他获取凭证的机制时才需要）
* 拥有相应的 IAM 权限

要使用您自己的 Bedrock 凭证登录，请参阅下文[使用 Bedrock 登录](#amazon-bedrock-上的-claude-code)。要在团队中部署 Claude Code，请使用[手动设置](#手动设置)步骤，并在推广前[固定您的模型版本](#4-固定模型版本)。

## 使用 Bedrock 登录

如果您拥有 AWS 凭证并希望通过 Bedrock 开始使用 Claude Code，登录向导将引导您完成此过程。您只需为每个账户完成一次 AWS 端的先决条件设置；向导会处理 Claude Code 端的配置。


    在 [Amazon Bedrock 控制台](https://console.aws.amazon.com/bedrock/)中，打开模型目录，选择 Anthropic 模型并提交用例表单。提交后即可立即获得访问权限。有关 AWS 组织的信息，请参阅[提交用例详细信息](#1-提交使用场景详情)；有关角色所需权限的信息，请参阅 [IAM 配置](#iam-配置)。



    运行 `claude`。在登录提示处，选择**第三方平台**，然后选择 **Amazon Bedrock**。



    选择您对 AWS 的认证方式：从您的 `~/.aws` 目录中检测到的 AWS 配置文件、Bedrock API 密钥、访问密钥和密钥，或您环境中已有的凭证。该向导会自动获取您的区域信息、验证您的账户可以调用哪些 Claude 模型，并允许您固定它们。结果将保存到[用户设置文件](/zh/settings)的 `env` 块中，因此您无需自行导出环境变量。


登录后，随时可以运行 `/setup-bedrock` 重新打开向导，修改您的凭据、区域或模型固定设置。

## 手动设置

若要通过环境变量而非向导配置 Bedrock（例如在 CI 或企业批量部署场景中），请遵循以下步骤。

### 1. 提交使用场景详情

首次使用 Anthropic 模型的用户，在调用模型前需提交使用场景详情。此操作每个 AWS 账户仅需执行一次。

1. 确保您拥有下文所述的正确 IAM 权限
2. 前往 [Amazon Bedrock 控制台](https://console.aws.amazon.com/bedrock/)
3. 从**模型目录**中选择一个 Anthropic 模型
4. 填写使用场景表单。提交后即可立即获得访问权限。

若您使用 AWS 组织，可以从管理账户使用 [`PutUseCaseForModelAccess` API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_PutUseCaseForModelAccess.html) 提交一次表单。此调用需要 `bedrock:PutUseCaseForModelAccess` IAM 权限。批准会自动扩展至子账户。

### 2. 配置 AWS 凭据

Claude Code 使用默认的 AWS SDK 凭据链。请通过以下方法之一设置您的凭据：

**选项 A：AWS CLI 配置**
```bash
aws configure
```
**选项 B：环境变量（访问密钥）**
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```
**选项 C：环境变量（SSO 配置文件）**
```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name
```
**选项 D: AWS 管理控制台凭证**
```bash
aws login
```
[了解详情](https://docs.aws.amazon.com/signin/latest/userguide/command-line-sign-in.html) `aws login` 的相关信息。

**选项 E：Bedrock API 密钥**
```bash
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
```
Bedrock API 密钥提供了一种更简单的认证方法，无需完整的 AWS 凭证。[了解更多关于 Bedrock API 密钥的信息](https://aws.amazon.com/blogs/machine-learning/accelerate-ai-development-with-amazon-bedrock-api-keys/)。

#### 高级凭证配置

Claude Code 支持对 AWS SSO 和企业身份提供商进行自动凭证刷新。请将以下设置添加到你的 Claude Code 设置文件中（有关文件位置，请参见[设置](/zh/settings)）。

这两个设置有不同的触发条件：

*   **`awsAuthRefresh`**：仅在 Claude Code 检测到你的 AWS 凭证过期时运行——无论是根据时间戳本地检测，还是当 Bedrock 返回凭证错误时——然后使用刷新后的凭证重试请求。
*   **`awsCredentialExport`**：在会话启动时以及每次凭证重新加载时运行，即使你的 AWS 默认凭证提供程序链中的凭证仍然有效。当你的 Bedrock 账户需要与默认提供程序链所解析的凭证不同的跨账户凭证时，请使用此选项。

##### 配置示例
```json
{
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "env": {
    "AWS_PROFILE": "myprofile"
  }
}
```
##### 配置设置详解

**`awsAuthRefresh`**：当执行会修改 `.aws` 目录的命令时使用此选项，例如更新凭证、SSO 缓存或配置文件。命令的输出会显示给用户，但不支持交互式输入。这对于基于浏览器的 SSO 流程非常适用，即 CLI 显示一个 URL 或代码，然后您在浏览器中完成认证。

**`awsCredentialExport`**：仅当您无法修改 `.aws` 且必须直接返回凭证时才使用此选项。每当需要刷新凭证时，此命令就会运行，而不仅仅是在凭证过期时。输出会被静默捕获，不会显示给用户。命令必须输出如下格式的 JSON：
```json
{
  "Credentials": {
    "AccessKeyId": "value",
    "SecretAccessKey": "value",
    "SessionToken": "value"
  }
}
```
### 3. 配置 Claude Code

设置以下环境变量以启用 Bedrock：
```bash
# Enable Bedrock integration
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # or your preferred region

# Optional: Override the AWS region for the small/fast model (Bedrock and Mantle).
# On Bedrock, has no effect without ANTHROPIC_DEFAULT_HAIKU_MODEL
# or the deprecated ANTHROPIC_SMALL_FAST_MODEL set.
export ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION=us-west-2

# Optional: Override the Bedrock endpoint URL for custom endpoints or gateways
# export ANTHROPIC_BEDROCK_BASE_URL=https://bedrock-runtime.us-east-1.amazonaws.com
```
在为 Claude Code 启用 Bedrock 时，请注意以下几点：

* `AWS_REGION` 是必需的环境变量。Claude Code 不会通过 `.aws` 配置文件读取此设置。
* 使用 Bedrock 时，由于认证通过 AWS 凭据处理，`/logout` 命令将不可用。
* 您可以使用设置文件来配置不希望泄露给其他进程的环境变量（如 `AWS_PROFILE`）。更多信息请参阅[设置](/zh/settings)。

### 4. 固定模型版本

  部署给多个用户时固定特定的模型版本。如果不固定版本，诸如 `sonnet` 和 `opus` 等模型别名将解析为最新版本，而当 Anthropic 发布更新时，该版本可能在你的 Bedrock 账户中尚未可用。Claude Code 在启动时若发现最新版本不可用，会[回退](#启动时的模型检查)到上一个版本，但固定版本可以让你控制用户何时切换到新模型。

设置这些环境变量为特定的 Bedrock 模型 ID。

如果没有 `ANTHROPIC_DEFAULT_OPUS_MODEL`，Bedrock 上的 `opus` 别名将解析为 Opus 4.6。将其设置为 Opus 4.8 ID 以使用最新模型：
```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-8'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```
这些变量使用跨区域推理配置文件ID（带 `us.` 前缀）。如果您使用不同的区域前缀或应用程序推理配置文件，请相应调整。有关当前和旧版模型ID，请参阅[模型概述](https://platform.claude.com/docs/en/about-claude/models/overview)。环境变量的完整列表请参见[模型配置](/zh/model-config#pin-models-for-third-party-deployments)。

当未设置固定变量时，Claude Code 使用以下默认模型：

| 模型类型       | 默认值                                       |
| :------------- | :------------------------------------------- |
| 主要模型       | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| 小型/快速模型  | 与主要模型相同                               |

背景任务（如会话标题生成）使用小型/快速模型，通常是Haiku级模型。在Bedrock上，Claude Code默认将其设置为主要模型，因为Haiku可能未在所有账户或区域启用。若要为背景任务使用Haiku，请将 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 设置为您的账户中可用的模型ID。

要进一步自定义模型，请使用以下方法之一：
```bash
# Using inference profile ID
export ANTHROPIC_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# Using application inference profile ARN
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'

# Optional: Disable prompt caching if needed
export DISABLE_PROMPT_CACHING=1

# Optional: Request 1-hour prompt cache TTL instead of the 5-minute default
export ENABLE_PROMPT_CACHING_1H=1
```
1小时的缓存生命周期费率比5分钟的默认设置更高。详见[缓存生命周期](/zh/prompt-caching#cache-lifetime)。

#### 将每个模型版本映射到推理配置文件

`ANTHROPIC_DEFAULT_*_MODEL` 环境变量为每个模型系列配置一个推理配置文件。如果您的组织需要在同一模型系列的 `/model` 选择器中展示多个版本，且每个版本需路由至独立的应用推理配置文件 ARN，请改用[设置文件](/zh/settings#settings-files)中的 `modelOverrides` 设置。

此示例将四个 Opus 版本映射到不同的 ARN，使用户能在不绕过组织推理配置文件的前提下进行切换：
```json
{
  "modelOverrides": {
    "claude-opus-4-7": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-47-prod",
    "claude-opus-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-46-prod",
    "claude-opus-4-5-20251101": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-45-prod",
    "claude-opus-4-1-20250805": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-41-prod"
  }
}
```
当用户在 `/model` 中选择其中一个版本时，Claude Code 会使用映射的 ARN 调用 Bedrock。没有覆盖的版本会回退到内置的 Bedrock 模型 ID 或启动时发现的任何匹配的推理配置文件。有关覆盖如何与 `availableModels` 和其他模型设置交互的详细信息，请参阅[覆盖每个版本的模型 ID](/zh/model-config#override-model-ids-per-version)。

## 启动时的模型检查

当 Claude Code 在配置了 Bedrock 的情况下启动时，它会验证其计划使用的模型在您的账户中是否可访问。此检查需要 Claude Code v2.1.94 或更高版本。

如果您固定了一个比当前 Claude Code 默认版本更旧的模型版本，并且您的账户可以调用更新的版本，Claude Code 会提示您更新固定版本。接受将把新的模型 ID 写入您的[用户设置文件](/zh/settings)并重启 Claude Code。拒绝操作将被记住，直到下一个默认版本更改。指向[应用程序推理配置文件 ARN](#将每个模型版本映射到推理配置文件) 的固定版本会被跳过，因为这些由您的管理员管理。

如果您没有固定模型，并且当前默认模型在您的账户中不可用，Claude Code 将为当前会话回退到上一个版本并显示通知。此回退不会持久化。在您的 Bedrock 账户中启用新模型或[固定一个版本](#4-固定模型版本)以使选择永久生效。

## IAM 配置

为 Claude Code 创建一个具有所需权限的 IAM 策略：
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowModelAndInferenceProfileAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListInferenceProfiles",
        "bedrock:GetInferenceProfile"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:inference-profile/*",
        "arn:aws:bedrock:*:*:application-inference-profile/*",
        "arn:aws:bedrock:*:*:foundation-model/*"
      ]
    },
    {
      "Sid": "AllowMarketplaceSubscription",
      "Effect": "Allow",
      "Action": [
        "aws-marketplace:ViewSubscriptions",
        "aws-marketplace:Subscribe"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:CalledViaLast": "bedrock.amazonaws.com"
        }
      }
    }
  ]
}
```
若需更严格的权限控制，可以将资源限制为特定的推理配置文件 ARN。

`bedrock:GetInferenceProfile` 允许 Claude Code 将[应用程序推理配置文件 ARN](#将每个模型版本映射到推理配置文件) 解析为其支持的基础模型，从而为该模型选择正确的请求格式。

若令牌缺少此权限，Claude Code 会通过使用替代格式重试一次来自动恢复，因此请求仍会成功，但每个新模型会增加一次往返请求。授予此权限可避免重试。这种情况最常见于 `AWS_BEARER_TOKEN_BEDROCK` 部署，因为其令牌策略通常比完整的 IAM 角色更具限制性。

详情请参阅 [Bedrock IAM 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)。

  为 Claude Code 创建专用 AWS 账户，以简化成本跟踪和访问控制。

## 1M token 上下文窗口

Claude Opus 4.6 及更新版本，以及 Sonnet 4.6，支持 Amazon Bedrock 上的 [1M token 上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window)。当您选择 1M 模型变体时，Claude Code 会自动启用扩展的上下文窗口。

[设置向导](#amazon-bedrock-上的-claude-code) 在固定模型时会提供 1M 上下文选项。要为手动固定的模型启用此功能，请在模型 ID 后附加 `[1m]`。详情请参阅[为第三方部署固定模型](/zh/model-config#pin-models-for-third-party-deployments)。

## 服务层级

[Amazon Bedrock 服务层级](https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html) 让您可以在成本和延迟之间进行权衡。将 `ANTHROPIC_BEDROCK_SERVICE_TIER` 设置为 `default`、`flex` 或 `priority`：
```bash
export ANTHROPIC_BEDROCK_SERVICE_TIER=priority
```
Claude Code 在每个请求中发送此字段作为 `X-Amzn-Bedrock-Service-Tier` 头。层级可用性因模型和区域而异。预留容量使用[预配置吞吐量](https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html) ARN 作为模型 ID，而不是使用此设置。

## AWS 防护栏

[Amazon Bedrock 防护栏](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)可让您为 Claude Code 实施内容过滤。在 [Amazon Bedrock 控制台](https://console.aws.amazon.com/bedrock/) 中创建一个防护栏，发布一个版本，然后将防护栏头添加到您的[设置文件](/zh/settings)中。如果您使用跨区域推理配置文件，请在您的防护栏上启用跨区域推理。

配置示例：
```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-Amzn-Bedrock-GuardrailIdentifier: your-guardrail-id\nX-Amzn-Bedrock-GuardrailVersion: 1"
  }
}
```
## 使用 Mantle 端点

Mantle 是一个 Amazon Bedrock 端点，它通过原生 Anthropic API 形式（而非 Bedrock Invoke API）来提供 Claude 模型服务。它使用相同的 AWS 凭证、IAM 权限以及本页前面描述的 `awsAuthRefresh` 配置。

  Mantle 需要 Claude Code v2.1.94 或更高版本。运行 `claude --version` 进行检查。

### 启用 Mantle

在已配置好 AWS 凭证的情况下，将 `CLAUDE_CODE_USE_MANTLE` 设置为 `true` 以将请求路由至 Mantle 端点：
```bash
export CLAUDE_CODE_USE_MANTLE=1
export AWS_REGION=us-east-1
```
Claude Code 根据 `AWS_REGION` 构建端点 URL。若要为自定义端点或网关覆盖此设置，请设置 `ANTHROPIC_BEDROCK_MANTLE_BASE_URL`。

在 Claude Code 中运行 `/status` 进行确认。当 Mantle 激活时，提供商行会显示 `Amazon Bedrock (Mantle)`。

### 选择 Mantle 模型

Mantle 使用以 `anthropic.` 为前缀且不含版本后缀的模型 ID，例如 `anthropic.claude-haiku-4-5`。您的账户可用的模型取决于您的组织被授予的权限；其他模型 ID 列在您的 AWS 入门材料中。请联系您的 AWS 客户团队以申请访问允许列表中的模型。

使用 `--model` 标志或在 Claude Code 内使用 `/model` 设置模型：
```bash
claude --model anthropic.claude-haiku-4-5
```
### 与 Invoke API 并行运行 Mantle

Mantle 上提供的模型可能不包含您当前使用的所有模型。同时设置 `CLAUDE_CODE_USE_BEDROCK` 和 `CLAUDE_CODE_USE_MANTLE` 可以让 Claude Code 在同一会话中调用这两个端点。匹配 Mantle 格式的模型 ID 会被路由至 Mantle，而所有其他模型 ID 将转至 Bedrock Invoke API。
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export CLAUDE_CODE_USE_MANTLE=1
```
要在 `/model` 选择器中显示 Mantle 模型，请在你的[设置文件](/zh/settings)中将模型 ID 列入 `availableModels`。此设置会将选择器限定为仅显示列出的条目，因此请包含你希望保留的所有别名：
```json
{
  "availableModels": ["opus", "sonnet", "haiku", "anthropic.claude-haiku-4-5"]
}
```
带有 `anthropic.` 前缀的条目将作为自定义选择器选项添加并路由到 Mantle。请将 `anthropic.claude-haiku-4-5` 替换为您的账户已获得权限的模型 ID。关于 `availableModels` 如何与其他模型设置交互，请参阅[限制模型选择](/zh/model-config#restrict-model-selection)。

当两个提供方都处于活动状态时，`/status` 会显示 `Amazon Bedrock + Amazon Bedrock (Mantle)`。

### 通过网关路由 Mantle

如果您的组织通过一个集中的 [LLM 网关](/zh/llm-gateway) 来路由模型流量，该网关在服务端注入 AWS 凭证，请禁用客户端身份验证，以便 Claude Code 发送请求时不附带 SigV4 签名或 `x-api-key` 头：
```bash
export CLAUDE_CODE_USE_MANTLE=1
export CLAUDE_CODE_SKIP_MANTLE_AUTH=1
export ANTHROPIC_BEDROCK_MANTLE_BASE_URL=https://your-gateway.example.com
```
### Mantle 环境变量

这些变量专用于 Mantle 端点。完整列表请参见[环境变量](/zh/env-vars)。

| 变量                                    | 用途                                                              |
| :-------------------------------------- | :---------------------------------------------------------------- |
| `CLAUDE_CODE_USE_MANTLE`                | 启用 Mantle 端点。设置为 `1` 或 `true`。                           |
| `ANTHROPIC_BEDROCK_MANTLE_BASE_URL`     | 覆盖默认的 Mantle 端点 URL                                        |
| `CLAUDE_CODE_SKIP_MANTLE_AUTH`          | 为代理设置跳过客户端认证                                          |
| `ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION` | 覆盖 Haiku 级模型的 AWS 区域（与 Bedrock 共用）                    |

## 故障排除

### SSO 和企业代理的认证循环

如果使用 AWS SSO 时浏览器标签页反复弹出，请从您的[设置文件](/zh/settings)中移除 `awsAuthRefresh` 设置。当企业 VPN 或 TLS 检查代理中断 SSO 浏览器流程时，可能会出现此问题。Claude Code 会将中断的连接视为认证失败，重新运行 `awsAuthRefresh`，并导致无限循环。

如果您的网络环境干扰了自动的基于浏览器的 SSO 流程，请在启动 Claude Code 之前手动使用 `aws sso login`，而不是依赖 `awsAuthRefresh`。

### 区域问题

如果遇到区域问题：

*   检查模型可用性：`aws bedrock list-inference-profiles --region your-region`
*   切换到受支持的区域：`export AWS_REGION=us-east-1`
*   考虑使用推理配置文件进行跨区域访问

如果收到错误 "on-demand throughput isn't supported"（不支持按需吞吐量）：

*   将模型指定为[推理配置文件](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html) ID

Claude Code 使用 Bedrock [Invoke API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModelWithResponseStream.html)，不支持 Converse API。

### Mantle 端点错误

如果在设置 `CLAUDE_CODE_USE_MANTLE` 后，`/status` 未显示 `Amazon Bedrock (Mantle)`，则该变量未到达进程。请确认它已在您启动 `claude` 的 shell 中导出，或在您的[设置文件](/zh/settings)的 `env` 块中设置。

来自 Mantle 端点的 `403` 错误（凭据有效）意味着您的 AWS 账户尚未被授予对您请求的模型的访问权限。请联系您的 AWS 账户团队申请访问权限。

`400` 错误如果提及了模型 ID，则表示该模型未在 Mantle 上提供服务。Mantle 有自己独立于标准 Bedrock 目录的模型阵容，因此 `us.anthropic.claude-sonnet-4-6` 等推理配置文件 ID 将不起作用。请使用 Mantle 格式的 ID，或启用[双端点](#与-invoke-api-并行运行-mantle)，以便 Claude Code 将每个请求路由到模型可用的端点。

## 其他资源

*   [Bedrock 文档](https://docs.aws.amazon.com/bedrock/)
*   [Bedrock 定价](https://aws.amazon.com/bedrock/pricing/)
*   [Bedrock 推理配置文件](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
*   [Bedrock token 消耗和配额](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-token-burndown.html)
*   [Claude Code on Amazon Bedrock: Quick Setup Guide](https://community.aws/content/2tXkZKrZzlrlu0KfH8gST5Dkppq/claude-code-on-amazon-bedrock-quick-setup-guide)
*   [Claude Code Monitoring Implementation (Bedrock)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock/blob/main/assets/docs/MONITORING.md)