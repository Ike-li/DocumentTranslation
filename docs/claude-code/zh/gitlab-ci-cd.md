> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# Claude Code GitLab CI/CD

> 了解如何通过 GitLab CI/CD 将 Claude Code 集成到你的开发工作流中

Claude Code for GitLab CI/CD 目前处于测试阶段。随着我们不断完善体验，功能可能会有所变化。

此集成由 GitLab 维护。如需支持，请参阅以下 [GitLab issue](https://gitlab.com/gitlab-org/gitlab/-/issues/573776)。

此集成基于 [Claude Code CLI 和 Agent SDK](/zh/agent-sdk/overview) 构建，支持在 CI/CD 任务和自定义自动化工作流中以编程方式使用 Claude。

## 为什么将 Claude Code 与 GitLab 配合使用？

* **即时创建 MR**：描述你的需求，Claude 会提出包含更改和说明的完整 MR
* **自动化实现**：通过一条命令或提及将 issue 转化为可运行的代码
* **项目感知**：Claude 遵循你的 `CLAUDE.md` 指导方针和现有代码模式
* **设置简单**：向 `.gitlab-ci.yml` 添加一个任务并设置一个受掩码保护的 CI/CD 变量
* **企业就绪**：可选择 Claude API、Amazon Bedrock 或 Google Vertex AI 以满足数据驻留和采购需求
* **默认安全**：在你的 GitLab Runner 中运行，遵循你的分支保护和审批规则

## 工作原理

Claude Code 使用 GitLab CI/CD 在隔离的任务中运行 AI 任务，并通过 MR 将结果提交回仓库：

1. **事件驱动的编排**：GitLab 监听你选择的触发器（例如，在 issue、MR 或评审线程中提及 `@claude` 的评论）。任务从线程和仓库中收集上下文，根据该输入构建提示词，并运行 Claude Code。

2. **提供者抽象**：使用适合你环境的提供者：
   * Claude API（SaaS）
   * Amazon Bedrock（基于 IAM 的访问，跨区域选项）
   * Google Vertex AI（GCP 原生，Workload Identity Federation）

3. **沙箱执行**：每次交互都在具有严格网络和文件系统规则的容器中运行。Claude Code 强制执行工作区范围的权限来限制写入。所有更改都通过 MR 流转，以便审查者查看差异并应用审批。

选择区域端点以降低延迟并满足数据主权要求，同时使用现有的云协议。

## Claude 能做什么？

Claude Code 支持强大的 CI/CD 工作流，改变你与代码协作的方式：

* 根据 issue 描述或评论创建和更新 MR
* 分析性能回退并提出优化建议
* 直接在分支中实现功能，然后打开 MR
* 修复由测试或评论发现的 bug 和回退
* 回复后续评论以迭代所请求的更改

## 设置

### 快速设置

最快的入门方式是向 `.gitlab-ci.yml` 添加一个最小任务，并将 API 密钥设置为受掩码保护的变量。

1. **添加受掩码保护的 CI/CD 变量**
   * 前往 **Settings** → **CI/CD** → **Variables**
   * 添加 `ANTHROPIC_API_KEY`（掩码保护，根据需要设置保护）

2. **向 `.gitlab-ci.yml` 添加 Claude 任务**

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  # 调整规则以适应你想要的触发方式：
  # - 手动运行
  # - 合并请求事件
  # - 当评论包含 '@claude' 时通过 web/API 触发
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
  script:
    # 可选：如果你的设置提供了 GitLab MCP 服务器，则启动它
    - /bin/gitlab-mcp-server || true
    # 通过 web/API 触发器调用时，使用 AI_FLOW_* 变量传递上下文载荷
    - echo "$AI_FLOW_INPUT for $AI_FLOW_CONTEXT on $AI_FLOW_EVENT"
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Review this MR and implement the requested changes'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
```

添加任务和 `ANTHROPIC_API_KEY` 变量后，从 **CI/CD** → **Pipelines** 手动运行任务进行测试，或从 MR 触发它，让 Claude 在分支中提出更新并在需要时打开 MR。

要在 Amazon Bedrock 或 Google Vertex AI 上运行而不是使用 Claude API，请参阅下面的[使用 Amazon Bedrock 和 Google Vertex AI](#使用-amazon-bedrock-和-google-vertex-ai) 部分了解身份验证和环境设置。

### 手动设置（推荐用于生产环境）

如果你需要更受控的设置或需要企业级提供者：

1. **配置提供者访问**：
   * **Claude API**：创建 `ANTHROPIC_API_KEY` 并将其存储为受掩码保护的 CI/CD 变量
   * **Amazon Bedrock**：**配置 GitLab** → **AWS OIDC** 并为 Bedrock 创建 IAM 角色
   * **Google Vertex AI**：**为 GitLab** → **GCP 配置 Workload Identity Federation**

2. **为 GitLab API 操作添加项目凭据**：
   * 默认使用 `CI_JOB_TOKEN`，或创建具有 `api` 范围的项目访问令牌
   * 如果使用 PAT，则存储为 `GITLAB_ACCESS_TOKEN`（掩码保护）

3. **向 `.gitlab-ci.yml` 添加 Claude 任务**（参见下面的示例）

4. **（可选）启用提及驱动的触发器**：
   * 为你的事件监听器（如果使用的话）添加"Comments (notes)"项目 webhook
   * 当评论包含 `@claude` 时，让监听器使用 `AI_FLOW_INPUT` 和 `AI_FLOW_CONTEXT` 等变量调用管道触发 API

## 使用示例

### 将 issue 转化为 MR

在 issue 评论中：

```text
@claude implement this feature based on the issue description
```

Claude 分析 issue 和代码库，在分支中编写更改，并打开 MR 以供评审。

### 获取实现帮助

在 MR 讨论中：

```text
@claude suggest a concrete approach to cache the results of this API call
```

Claude 提出更改建议，添加具有适当缓存的代码，并更新 MR。

### 快速修复 bug

在 issue 或 MR 评论中：

```text
@claude fix the TypeError in the user dashboard component
```

Claude 定位 bug，实施修复，并更新分支或打开新的 MR。

## 使用 Amazon Bedrock 和 Google Vertex AI

对于企业环境，你可以在云基础设施上完全运行 Claude Code，同时保持相同的开发者体验。

#### Amazon Bedrock

### 前提条件

在使用 Amazon Bedrock 设置 Claude Code 之前，你需要：

1. 一个具有 Amazon Bedrock 访问权限的 AWS 帐户，可访问所需的 Claude 模型
2. GitLab 配置为 AWS IAM 中的 OIDC 身份提供者
3. 具有 Bedrock 权限的 IAM 角色，且信任策略限制为你的 GitLab 项目/refs
4. 用于角色假设的 GitLab CI/CD 变量：
   * `AWS_ROLE_TO_ASSUME`（角色 ARN）
   * `AWS_REGION`（Bedrock 区域）

### 设置说明

配置 AWS 以允许 GitLab CI 任务通过 OIDC 假设 IAM 角色（无需静态密钥）。

**必需的设置：**

1. 启用 Amazon Bedrock 并请求访问目标 Claude 模型
2. 如果尚未存在，为 GitLab 创建 IAM OIDC 提供者
3. 创建受 GitLab OIDC 提供者信任的 IAM 角色，限制为你的项目和受保护的 refs
4. 附加 Bedrock 调用 API 的最小权限

**需要存储在 CI/CD 变量中的值：**

* `AWS_ROLE_TO_ASSUME`
* `AWS_REGION`

在 Settings → CI/CD → Variables 中添加变量：

```yaml
# 对于 Amazon Bedrock：
- AWS_ROLE_TO_ASSUME
- AWS_REGION
```

使用上面的 Amazon Bedrock 任务示例，在运行时将 GitLab 任务令牌交换为临时 AWS 凭据。

#### Google Vertex AI

### 前提条件

在使用 Google Vertex AI 设置 Claude Code 之前，你需要：

1. 一个 Google Cloud 项目，包含：
   * 启用的 Vertex AI API
   * 配置为信任 GitLab OIDC 的 Workload Identity Federation
2. 仅具有所需 Vertex AI 角色的专用服务帐户
3. 用于 WIF 的 GitLab CI/CD 变量：
   * `GCP_WORKLOAD_IDENTITY_PROVIDER`（完整资源名称）
   * `GCP_SERVICE_ACCOUNT`（服务帐户电子邮件）

### 设置说明

配置 Google Cloud 以允许 GitLab CI 任务通过 Workload Identity Federation 模拟服务帐户。

**必需的设置：**

1. 启用 IAM Credentials API、STS API 和 Vertex AI API
2. 为 GitLab OIDC 创建 Workload Identity Pool 和提供者
3. 创建具有 Vertex AI 角色的专用服务帐户
4. 授予 WIF 主体模拟服务帐户的权限

**需要存储在 CI/CD 变量中的值：**

* `GCP_WORKLOAD_IDENTITY_PROVIDER`
* `GCP_SERVICE_ACCOUNT`

在 Settings → CI/CD → Variables 中添加变量：

```yaml
# 对于 Google Vertex AI：
- GCP_WORKLOAD_IDENTITY_PROVIDER
- GCP_SERVICE_ACCOUNT
- CLOUD_ML_REGION（例如 us-east5）
```

使用上面的 Google Vertex AI 任务示例，无需存储密钥即可进行身份验证。

## 配置示例

以下是可直接使用的代码片段，你可以根据自己的管道进行调整。

### 基本 .gitlab-ci.yml（Claude API）

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
  script:
    - /bin/gitlab-mcp-server || true
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Summarize recent changes and suggest improvements'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  # Claude Code 将使用 CI/CD 变量中的 ANTHROPIC_API_KEY
```

### Amazon Bedrock 任务示例（OIDC）

**前提条件：**

* 启用 Amazon Bedrock 并可访问你选择的 Claude 模型
* 在 AWS 中配置 GitLab OIDC，具有信任你的 GitLab 项目和 refs 的角色
* 具有 Bedrock 权限的 IAM 角色（建议最小权限）

**必需的 CI/CD 变量：**

* `AWS_ROLE_TO_ASSUME`：用于 Bedrock 访问的 IAM 角色 ARN
* `AWS_REGION`：Bedrock 区域（例如 `us-west-2`）

```yaml
claude-bedrock:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apk add --no-cache bash curl jq git python3 py3-pip
    - pip install --no-cache-dir awscli
    - curl -fsSL https://claude.ai/install.sh | bash
    # 将 GitLab OIDC 令牌交换为 AWS 凭据
    - export AWS_WEB_IDENTITY_TOKEN_FILE="${CI_JOB_JWT_FILE:-/tmp/oidc_token}"
    - if [ -n "${CI_JOB_JWT_V2}" ]; then printf "%s" "$CI_JOB_JWT_V2" > "$AWS_WEB_IDENTITY_TOKEN_FILE"; fi
    - >
      aws sts assume-role-with-web-identity
      --role-arn "$AWS_ROLE_TO_ASSUME"
      --role-session-name "gitlab-claude-$(date +%s)"
      --web-identity-token "file://$AWS_WEB_IDENTITY_TOKEN_FILE"
      --duration-seconds 3600 > /tmp/aws_creds.json
    - export AWS_ACCESS_KEY_ID="$(jq -r .Credentials.AccessKeyId /tmp/aws_creds.json)"
    - export AWS_SECRET_ACCESS_KEY="$(jq -r .Credentials.SecretAccessKey /tmp/aws_creds.json)"
    - export AWS_SESSION_TOKEN="$(jq -r .Credentials.SessionToken /tmp/aws_creds.json)"
  script:
    - /bin/gitlab-mcp-server || true
    - >
      claude
      -p "${AI_FLOW_INPUT:-'Implement the requested changes and open an MR'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    AWS_REGION: "us-west-2"
```

Bedrock 的模型 ID 包含区域特定的前缀（例如 `us.anthropic.claude-sonnet-4-6`）。如果你的工作流支持，可以通过任务配置或提示词传递所需的模型。

### Google Vertex AI 任务示例（Workload Identity Federation）

**前提条件：**

* 在你的 GCP 项目中启用 Vertex AI API
* 配置为信任 GitLab OIDC 的 Workload Identity Federation
* 具有 Vertex AI 权限的服务帐户

**必需的 CI/CD 变量：**

* `GCP_WORKLOAD_IDENTITY_PROVIDER`：完整的提供者资源名称
* `GCP_SERVICE_ACCOUNT`：服务帐户电子邮件
* `CLOUD_ML_REGION`：Vertex 区域（例如 `us-east5`）

```yaml
claude-vertex:
  stage: ai
  image: gcr.io/google.com/cloudsdktool/google-cloud-cli:slim
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apt-get update && apt-get install -y git && apt-get clean
    - curl -fsSL https://claude.ai/install.sh | bash
    # 通过 WIF 身份验证到 Google Cloud（无需下载密钥）
    - >
      gcloud auth login --cred-file=<(cat <<EOF
      {
        "type": "external_account",
        "audience": "${GCP_WORKLOAD_IDENTITY_PROVIDER}",
        "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
        "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT}:generateAccessToken",
        "token_url": "https://sts.googleapis.com/v1/token"
      }
      EOF
      )
    - gcloud config set project "$(gcloud projects list --format='value(projectId)' --filter="name:${CI_PROJECT_NAMESPACE}" | head -n1)" || true
  script:
    - /bin/gitlab-mcp-server || true
    - >
      CLOUD_ML_REGION="${CLOUD_ML_REGION:-us-east5}"
      claude
      -p "${AI_FLOW_INPUT:-'Review and update code as requested'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    CLOUD_ML_REGION: "us-east5"
```

使用 Workload Identity Federation 时，你无需存储服务帐户密钥。请使用仓库特定的信任条件和最小权限服务帐户。

## 最佳实践

### CLAUDE.md 配置

在仓库根目录创建 `CLAUDE.md` 文件，定义编码标准、评审标准和项目特定规则。Claude 在运行期间读取此文件，并在提出更改时遵循你的约定。

### 安全注意事项

**切勿将 API 密钥或云凭据提交到你的仓库**。始终使用 GitLab CI/CD 变量：

* 将 `ANTHROPIC_API_KEY` 添加为受掩码保护的变量（根据需要进行保护）
* 尽可能使用提供者特定的 OIDC（无长期密钥）
* 限制任务权限和网络出口
* 像审查任何其他贡献者一样审查 Claude 的 MR

### 优化性能

* 保持 `CLAUDE.md` 简洁聚焦
* 提供清晰的 issue/MR 描述以减少迭代
* 配置合理的任务超时以避免失控运行
* 尽可能在 Runner 中缓存 npm 和包安装

### CI 成本

在使用 Claude Code 与 GitLab CI/CD 时，请注意相关成本：

* **GitLab Runner 时间**：
  * Claude 在你的 GitLab Runner 上运行并消耗计算分钟数
  * 详情请参阅你的 GitLab 计划的 Runner 计费

* **API 成本**：
  * 每次 Claude 交互都会根据提示词和响应大小消耗 token
  * token 使用量因任务复杂度和代码库大小而异
  * 详情请参阅 [Anthropic 定价](https://platform.claude.com/docs/en/about-claude/pricing)

* **成本优化提示**：
  * 使用具体的 `@claude` 命令以减少不必要的轮次
  * 设置适当的 `max_turns` 和任务超时值
  * 限制并发以控制并行运行

## 安全与治理

* 每个任务都在具有受限网络访问权限的隔离容器中运行
* Claude 的更改通过 MR 流转，以便审查者查看每个差异
* 分支保护和审批规则适用于 AI 生成的代码
* Claude Code 使用工作区范围的权限来限制写入
* 成本由你控制，因为你使用自己的提供者凭据

## 故障排除

### Claude 未响应 @claude 命令

* 验证你的管道是否正在被触发（手动、MR 事件或通过 note 事件监听器/webhook）
* 确保 CI/CD 变量（`ANTHROPIC_API_KEY` 或云提供者设置）存在且未被掩码
* 检查评论是否包含 `@claude`（而不是 `/claude`），以及你的提及触发器是否已配置

### 任务无法写入评论或打开 MR

* 确保 `CI_JOB_TOKEN` 对项目具有足够的权限，或使用具有 `api` 范围的项目访问令牌
* 检查 `--allowedTools` 中是否启用了 `mcp__gitlab` 工具
* 确认任务在 MR 上下文中运行，或通过 `AI_FLOW_*` 变量具有足够的上下文

### 身份验证错误

* **对于 Claude API**：确认 `ANTHROPIC_API_KEY` 有效且未过期
* **对于 Bedrock/Vertex**：验证 OIDC/WIF 配置、角色模拟和密钥名称；确认区域和模型可用性

## 高级配置

### 常用参数和变量

Claude Code 支持以下常用输入：

* `prompt` / `prompt_file`：通过内联（`-p`）或文件提供指令
* `max_turns`：限制来回迭代次数
* `timeout_minutes`：限制总执行时间
* `ANTHROPIC_API_KEY`：Claude API 所需（Bedrock/Vertex 不使用）
* 提供者特定的环境变量：`AWS_REGION`、Vertex 的项目/区域变量

确切的标志和参数可能因 `@anthropic-ai/claude-code` 的版本而异。在你的任务中运行 `claude --help` 以查看支持的选项。

### 自定义 Claude 的行为

你可以通过两种主要方式指导 Claude：

1. **CLAUDE.md**：定义编码标准、安全要求和项目约定。Claude 在运行期间读取此文件并遵循你的规则。
2. **自定义提示词**：通过任务中的 `prompt`/`prompt_file` 传递特定任务的指令。为不同的任务使用不同的提示词（例如评审、实现、重构）。
