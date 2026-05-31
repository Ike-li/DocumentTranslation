# Claude Code GitHub Actions

> 了解如何通过 Claude Code GitHub Actions 将 Claude Code 集成到你的开发工作流中

Claude Code GitHub Actions 将 AI 驱动的自动化引入你的 GitHub 工作流。只需在任何 PR 或 issue 中简单提及 `@claude`，Claude 就能分析你的代码、创建拉取请求、实现功能和修复错误——同时遵循你项目的规范。如需在每个 PR 上自动发布审查而无需触发，请参阅 [GitHub 代码审查](/zh/code-review)。

Claude Code GitHub Actions 基于 [Claude Agent SDK](/zh/agent-sdk/overview) 构建，该 SDK 支持将 Claude Code 以编程方式集成到你的应用中。你可以使用 SDK 构建超越 GitHub Actions 的自定义自动化工作流。

**Claude Opus 4.8 现已推出。** Claude Code GitHub Actions 默认使用 Sonnet。要使用 Opus 4.8，请将 [model 参数](#破坏性变更参考) 配置为 `claude-opus-4-8`。

## 为什么要使用 Claude Code GitHub Actions？

* **即时创建 PR**：描述你的需求，Claude 就能创建包含所有必要更改的完整 PR
* **自动化代码实现**：一条命令即可将 issue 转化为可运行的代码
* **遵循你的规范**：Claude 遵守你的 `CLAUDE.md` 指南和现有代码模式
* **设置简单**：通过安装程序和 API 密钥，几分钟即可开始使用
* **默认安全**：你的代码保留在 GitHub 的运行器上

## Claude 能做什么？

Claude Code 提供了一个强大的 GitHub Action，改变了你与代码协作的方式：

### Claude Code Action

此 GitHub Action 允许你在 GitHub Actions 工作流中运行 Claude Code。你可以基于 Claude Code 构建任何自定义工作流。

[查看仓库 ->](https://github.com/anthropics/claude-code-action)

## 设置

## 快速设置

设置此 action 最简单的方式是通过终端中的 Claude Code。只需打开 claude 并运行 `/install-github-app`。

此命令将引导你完成 GitHub 应用和所需密钥的设置。

* 你必须是仓库管理员才能安装 GitHub 应用和添加密钥
* GitHub 应用将请求 Contents、Issues 和 Pull requests 的读写权限
* 此快速入门方法仅适用于直接 Claude API 用户。如果你使用的是 Amazon Bedrock 或 Google Vertex AI，请参阅[与 Amazon Bedrock 和 Google Vertex AI 配合使用](#与-amazon-bedrock-和-google-vertex-ai-配合使用)部分。

## 手动设置

如果 `/install-github-app` 命令失败或你更喜欢手动设置，请按照以下手动设置说明操作：

1. **安装 Claude GitHub 应用**到你的仓库：[https://github.com/apps/claude](https://github.com/apps/claude)

   Claude GitHub 应用需要以下仓库权限：

   * **Contents**：读写（用于修改仓库文件）
   * **Issues**：读写（用于回复 issue）
   * **Pull requests**：读写（用于创建 PR 和推送更改）

   有关安全和权限的更多详情，请参阅[安全文档](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)。

2. **将 ANTHROPIC\_API\_KEY 添加到仓库密钥**（[了解如何在 GitHub Actions 中使用密钥](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)）

3. **从 [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml) 复制工作流文件**到你仓库的 `.github/workflows/` 目录

完成快速入门或手动设置后，在 issue 或 PR 评论中标记 `@claude` 来测试此 action。

## 从 Beta 版升级

Claude Code GitHub Actions v1.0 引入了破坏性变更，从 Beta 版升级到 v1.0 需要更新你的工作流文件。

如果你目前正在使用 Claude Code GitHub Actions 的 Beta 版本，我们建议你更新工作流以使用正式版。新版本简化了配置，同时添加了强大的新功能，如自动模式检测。

### 关键变更

所有 Beta 用户必须对工作流文件进行以下更改才能升级：

1. **更新 action 版本**：将 `@beta` 更改为 `@v1`
2. **移除模式配置**：删除 `mode: "tag"` 或 `mode: "agent"`（现在自动检测）
3. **更新提示词输入**：将 `direct_prompt` 替换为 `prompt`
4. **移动 CLI 选项**：将 `max_turns`、`model`、`custom_instructions` 等转换到 `claude_args`

### 破坏性变更参考

| 旧版 Beta 输入            | 新版 v1.0 输入                            |
| ------------------------- | ----------------------------------------- |
| `mode`                    | *（已移除 - 自动检测）*                   |
| `direct_prompt`           | `prompt`                                  |
| `override_prompt`         | `prompt` 配合 GitHub 变量                 |
| `custom_instructions`     | `claude_args: --append-system-prompt`     |
| `max_turns`               | `claude_args: --max-turns`                |
| `model`                   | `claude_args: --model`                    |
| `allowed_tools`           | `claude_args: --allowedTools`             |
| `disallowed_tools`        | `claude_args: --disallowedTools`          |
| `claude_env`              | `settings` JSON 格式                      |

### 前后对比示例

**Beta 版本：**

```yaml
- uses: anthropics/claude-code-action@beta
  with:
    mode: "tag"
    direct_prompt: "Review this PR for security issues"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    custom_instructions: "Follow our coding standards"
    max_turns: "10"
    model: "claude-sonnet-4-6"
```

**正式版 (v1.0)：**

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    prompt: "Review this PR for security issues"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    claude_args: |
      --append-system-prompt "Follow our coding standards"
      --max-turns 10
      --model claude-sonnet-4-6
```

该 action 现在会根据你的配置自动检测是运行在交互模式（响应 `@claude` 提及）还是自动化模式（使用提示词立即运行）。

## 示例用例

Claude Code GitHub Actions 可以帮助你完成各种任务。[示例目录](https://github.com/anthropics/claude-code-action/tree/main/examples)包含针对不同场景的即用型工作流。

### 基本工作流

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # 响应评论中的 @claude 提及
```

### 使用技能

`prompt` 输入接受[技能](/zh/skills)调用以及纯文本：

* 对于仓库 `.claude/skills/` 目录中的技能，在 action 步骤之前运行 `actions/checkout` 并传递 `/skill-name`。
* 对于插件中打包的技能，使用 `plugin_marketplaces` 和 `plugins` 输入安装插件并传递带命名空间的 `/plugin-name:skill-name`。

以下工作流安装 `code-review` 插件，并在每个新建或更新的拉取请求上运行其技能：

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          plugin_marketplaces: "https://github.com/anthropics/claude-code.git"
          plugins: "code-review@claude-code-plugins"
          prompt: "/code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
```

### 使用提示词进行自定义自动化

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: "--model opus"
```

### 常见用例

在 issue 或 PR 评论中：

```text
@claude implement this feature based on the issue description
@claude how should I implement user authentication for this endpoint?
@claude fix the TypeError in the user dashboard component
```

Claude 会自动分析上下文并做出适当响应。

## 最佳实践

### CLAUDE.md 配置

在仓库根目录创建 `CLAUDE.md` 文件，定义代码风格指南、审查标准、项目特定规则和首选模式。此文件指导 Claude 理解你的项目标准。

### 安全注意事项

切勿将 API 密钥直接提交到仓库。

有关包含权限、认证和最佳实践的全面安全指导，请参阅 [Claude Code Action 安全文档](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)。

始终使用 GitHub Secrets 存储 API 密钥：

* 将 API 密钥添加为名为 `ANTHROPIC_API_KEY` 的仓库密钥
* 在工作流中引用：`anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`
* 将 action 权限限制为仅必要的范围
* 合并前审查 Claude 的建议

始终使用 GitHub Secrets（例如 `${{ secrets.ANTHROPIC_API_KEY }}`），而不是在工作流文件中直接硬编码 API 密钥。

### 优化性能

使用 issue 模板提供上下文，保持 `CLAUDE.md` 简洁聚焦，并为工作流配置适当的超时时间。

### CI 成本

使用 Claude Code GitHub Actions 时，请注意相关成本：

**GitHub Actions 成本：**

* Claude Code 运行在 GitHub 托管的运行器上，会消耗你的 GitHub Actions 分钟数
* 详细定价和分钟数限制请参阅 [GitHub 计费文档](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)

**API 成本：**

* 每次 Claude 交互根据提示词和响应的长度消耗 API token
* token 用量因任务复杂度和代码库大小而异
* 当前 token 费率请参阅 [Claude 定价页面](https://claude.com/platform/api)

**成本优化建议：**

* 使用具体的 `@claude` 命令减少不必要的 API 调用
* 在 `claude_args` 中配置适当的 `--max-turns` 以防止过多迭代
* 设置工作流级别的超时以避免失控任务
* 考虑使用 GitHub 的并发控制来限制并行运行

## 配置示例

Claude Code Action v1 通过统一参数简化了配置：

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Your instructions here" # 可选
    claude_args: "--max-turns 5" # 可选 CLI 参数
```

主要特性：

* **统一提示词界面** - 使用 `prompt` 传递所有指令
* **技能** - 从提示词中直接调用已安装的[技能](/zh/skills)
* **CLI 透传** - 通过 `claude_args` 传递任何 Claude Code CLI 参数
* **灵活触发** - 适用于任何 GitHub 事件

访问[示例目录](https://github.com/anthropics/claude-code-action/tree/main/examples)获取完整的工作流文件。

响应 issue 或 PR 评论时，Claude 会自动响应 @claude 提及。对于其他事件，请使用 `prompt` 参数提供指令。

## 与 Amazon Bedrock 和 Google Vertex AI 配合使用

对于企业环境，你可以将 Claude Code GitHub Actions 与自己的云基础设施配合使用。这种方式让你在保持相同功能的同时，控制数据驻留和计费。

### 前提条件

在使用云提供商设置 Claude Code GitHub Actions 之前，你需要：

#### Google Cloud Vertex AI：

1. 一个启用了 Vertex AI 的 Google Cloud 项目
2. 为 GitHub Actions 配置了 Workload Identity Federation
3. 一个具有所需权限的服务账号
4. 一个 GitHub App（推荐）或使用默认 GITHUB\_TOKEN

#### Amazon Bedrock：

1. 一个启用了 Amazon Bedrock 的 AWS 账户
2. 在 AWS 中配置了 GitHub OIDC 身份提供商
3. 一个具有 Bedrock 权限的 IAM 角色
4. 一个 GitHub App（推荐）或使用默认 GITHUB\_TOKEN

**步骤 1：创建自定义 GitHub App（第三方提供商推荐）**

使用 Vertex AI 或 Bedrock 等第三方提供商时，为获得最佳控制和安全性，我们建议创建你自己的 GitHub App：

1. 前往 [https://github.com/settings/apps/new](https://github.com/settings/apps/new)
2. 填写基本信息：
   * **GitHub App 名称**：选择一个唯一名称（例如 "YourOrg Claude Assistant"）
   * **主页 URL**：你的组织网站或仓库 URL
3. 配置应用设置：
   * **Webhooks**：取消选中 "Active"（此集成不需要）
4. 设置所需权限：
   * **仓库权限**：
     * Contents：读写
     * Issues：读写
     * Pull requests：读写
5. 点击 "Create GitHub App"
6. 创建后，点击 "Generate a private key" 并保存下载的 `.pem` 文件
7. 在应用设置页面记下你的 App ID
8. 将应用安装到你的仓库：
   * 在应用设置页面，点击左侧边栏的 "Install App"
   * 选择你的账户或组织
   * 选择 "Only select repositories" 并选择特定仓库
   * 点击 "Install"
9. 将私钥作为密钥添加到仓库：
   * 前往仓库的 Settings -> Secrets and variables -> Actions
   * 创建名为 `APP_PRIVATE_KEY` 的新密钥，内容为 `.pem` 文件的内容
10. 将 App ID 添加为密钥：
    * 创建名为 `APP_ID` 的新密钥，内容为你的 GitHub App ID

此应用将与 [actions/create-github-app-token](https://github.com/actions/create-github-app-token) action 配合使用，在工作流中生成认证 token。

**Claude API 替代方案，或不想设置自己的 GitHub App**：使用官方 Anthropic 应用：

1. 从以下地址安装：[https://github.com/apps/claude](https://github.com/apps/claude)
2. 无需额外配置认证

**步骤 2：配置云提供商认证**

选择你的云提供商并设置安全认证：

**Amazon Bedrock**

**配置 AWS 以允许 GitHub Actions 在不存储凭据的情况下安全认证。**

> **安全提示**：使用仓库特定配置并仅授予最低所需权限。

**必需设置**：

1. **启用 Amazon Bedrock**：
   * 在 Amazon Bedrock 中请求访问 Claude 模型
   * 对于跨区域模型，在所有必需区域请求访问

2. **设置 GitHub OIDC 身份提供商**：
   * Provider URL：`https://token.actions.githubusercontent.com`
   * Audience：`sts.amazonaws.com`

3. **为 GitHub Actions 创建 IAM 角色**：
   * 受信实体类型：Web identity
   * 身份提供商：`token.actions.githubusercontent.com`
   * 权限：`AmazonBedrockFullAccess` 策略
   * 为你的特定仓库配置信任策略

**必需值**：

设置完成后，你需要：

* **AWS\_ROLE\_TO\_ASSUME**：你创建的 IAM 角色的 ARN

OIDC 比使用静态 AWS 访问密钥更安全，因为凭据是临时的并自动轮换。

详细 OIDC 设置说明请参阅 [AWS 文档](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)。

**Google Vertex AI**

**配置 Google Cloud 以允许 GitHub Actions 在不存储凭据的情况下安全认证。**

> **安全提示**：使用仓库特定配置并仅授予最低所需权限。

**必需设置**：

1. 在 Google Cloud 项目中 **启用 API**：
   * IAM Credentials API
   * Security Token Service (STS) API
   * Vertex AI API

2. **创建 Workload Identity Federation 资源**：
   * 创建 Workload Identity Pool
   * 添加 GitHub OIDC 提供商：
     * Issuer：`https://token.actions.githubusercontent.com`
     * 仓库和所有者的属性映射
     * **安全建议**：使用仓库特定的属性条件

3. **创建服务账号**：
   * 仅授予 `Vertex AI User` 角色
   * **安全建议**：为每个仓库创建专用服务账号

4. **配置 IAM 绑定**：
   * 允许 Workload Identity Pool 模拟服务账号
   * **安全建议**：使用仓库特定的 principal sets

**必需值**：

设置完成后，你需要：

* **GCP\_WORKLOAD\_IDENTITY\_PROVIDER**：完整的提供商资源名称
* **GCP\_SERVICE\_ACCOUNT**：服务账号电子邮件地址

Workload Identity Federation 消除了对可下载服务账号密钥的需求，提高了安全性。

详细设置说明请参阅 [Google Cloud Workload Identity Federation 文档](https://cloud.google.com/iam/docs/workload-identity-federation)。

**步骤 3：添加必需的密钥**

将以下密钥添加到你的仓库（Settings -> Secrets and variables -> Actions）：

#### Claude API（直接访问）：

1. **API 认证**：
   * `ANTHROPIC_API_KEY`：来自 [console.anthropic.com](https://console.anthropic.com) 的 Claude API 密钥

2. **GitHub App（如果使用自己的应用）**：
   * `APP_ID`：你的 GitHub App ID
   * `APP_PRIVATE_KEY`：私钥 (.pem) 内容

#### Google Cloud Vertex AI

1. **GCP 认证**：
   * `GCP_WORKLOAD_IDENTITY_PROVIDER`
   * `GCP_SERVICE_ACCOUNT`

2. **GitHub App（如果使用自己的应用）**：
   * `APP_ID`：你的 GitHub App ID
   * `APP_PRIVATE_KEY`：私钥 (.pem) 内容

#### Amazon Bedrock

1. **AWS 认证**：
   * `AWS_ROLE_TO_ASSUME`

2. **GitHub App（如果使用自己的应用）**：
   * `APP_ID`：你的 GitHub App ID
   * `APP_PRIVATE_KEY`：私钥 (.pem) 内容

**步骤 4：创建工作流文件**

创建与你的云提供商集成的 GitHub Actions 工作流文件。以下示例展示了 Amazon Bedrock 和 Google Vertex AI 的完整配置：

**Amazon Bedrock 工作流**

**前提条件：**

* 已启用 Amazon Bedrock 并具有 Claude 模型权限
* GitHub 已在 AWS 中配置为 OIDC 身份提供商
* 具有 Bedrock 权限且信任 GitHub Actions 的 IAM 角色

**必需的 GitHub 密钥：**

| 密钥名称              | 描述                                       |
| --------------------- | ------------------------------------------ |
| `AWS_ROLE_TO_ASSUME`  | 用于 Bedrock 访问的 IAM 角色 ARN           |
| `APP_ID`              | 你的 GitHub App ID（来自应用设置）          |
| `APP_PRIVATE_KEY`     | 为 GitHub App 生成的私钥                    |

```yaml
name: Claude PR Action

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-pr:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    env:
      AWS_REGION: us-west-2
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-west-2

      - uses: anthropics/claude-code-action@v1
        with:
          github_token: ${{ steps.app-token.outputs.token }}
          use_bedrock: "true"
          claude_args: '--model us.anthropic.claude-sonnet-4-6 --max-turns 10'
```

Bedrock 的模型 ID 格式包含区域前缀（例如 `us.anthropic.claude-sonnet-4-6`）。

**Google Vertex AI 工作流**

**前提条件：**

* GCP 项目中已启用 Vertex AI API
* 已为 GitHub 配置 Workload Identity Federation
* 具有 Vertex AI 权限的服务账号

**必需的 GitHub 密钥：**

| 密钥名称                          | 描述                                       |
| --------------------------------- | ------------------------------------------ |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`  | Workload Identity Provider 资源名称         |
| `GCP_SERVICE_ACCOUNT`             | 具有 Vertex AI 访问权限的服务账号邮箱       |
| `APP_ID`                          | 你的 GitHub App ID（来自应用设置）          |
| `APP_PRIVATE_KEY`                 | 为 GitHub App 生成的私钥                    |

```yaml
name: Claude PR Action

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-pr:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - name: Authenticate to Google Cloud
        id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - uses: anthropics/claude-code-action@v1
        with:
          github_token: ${{ steps.app-token.outputs.token }}
          trigger_phrase: "@claude"
          use_vertex: "true"
          claude_args: '--model claude-sonnet-4-5@20250929 --max-turns 10'
        env:
          ANTHROPIC_VERTEX_PROJECT_ID: ${{ steps.auth.outputs.project_id }}
          CLOUD_ML_REGION: us-east5
          VERTEX_REGION_CLAUDE_4_5_SONNET: us-east5
```

项目 ID 会从 Google Cloud 认证步骤中自动获取，因此你不需要硬编码它。

## 故障排除

### Claude 未响应 @claude 命令

验证 GitHub App 是否正确安装，检查工作流是否已启用，确保 API 密钥已在仓库密钥中设置，并确认评论中包含 `@claude`（而非 `/claude`）。

### CI 未在 Claude 的提交上运行

确保你使用的是 GitHub App 或自定义应用（而非 Actions 用户），检查工作流触发器是否包含必要事件，并验证应用权限包含 CI 触发器。

### 认证错误

确认 API 密钥有效且具有足够权限。对于 Bedrock/Vertex，请检查凭据配置并确保密钥在工作流中命名正确。

## 高级配置

### Action 参数

Claude Code Action v1 使用简化的配置：

| 参数                  | 描述                                                           | 必需     |
| --------------------- | -------------------------------------------------------------- | -------- |
| `prompt`              | 给 Claude 的指令（纯文本或[技能](/zh/skills)名称）              | 否\*     |
| `claude_args`         | 传递给 Claude Code 的 CLI 参数                                  | 否       |
| `plugin_marketplaces` | 换行分隔的插件市场 Git URL 列表                                 | 否       |
| `plugins`             | 执行前安装的换行分隔插件名称列表                                | 否       |
| `anthropic_api_key`   | Claude API 密钥                                                 | 是\*\*   |
| `github_token`        | 用于 API 访问的 GitHub token                                    | 否       |
| `trigger_phrase`      | 自定义触发短语（默认："@claude"）                               | 否       |
| `use_bedrock`         | 使用 Amazon Bedrock 而非 Claude API                             | 否       |
| `use_vertex`          | 使用 Google Vertex AI 而非 Claude API                           | 否       |

\*prompt 是可选的——对于 issue/PR 评论省略时，Claude 会响应触发短语
\*\*直接 Claude API 必需，Bedrock/Vertex 不需要

#### 传递 CLI 参数

`claude_args` 参数接受任何 Claude Code CLI 参数：

```yaml
claude_args: "--max-turns 5 --model claude-sonnet-4-6 --mcp-config /path/to/config.json"
```

常用参数：

* `--max-turns`：最大对话轮数（默认：10）
* `--model`：使用的模型（例如 `claude-sonnet-4-6`）
* `--mcp-config`：MCP 配置路径
* `--allowedTools`：逗号分隔的允许工具列表。`--allowed-tools` 别名同样有效。
* `--debug`：启用调试输出

### 替代集成方式

虽然 `/install-github-app` 命令是推荐的方式，但你也可以：

* **自定义 GitHub App**：适用于需要品牌用户名或自定义认证流程的组织。使用所需权限（contents、issues、pull requests）创建你自己的 GitHub App，并使用 actions/create-github-app-token action 在工作流中生成 token。
* **手动 GitHub Actions**：直接工作流配置，提供最大灵活性
* **MCP 配置**：动态加载 Model Context Protocol 服务器

有关认证、安全和高级配置的详细指南，请参阅 [Claude Code Action 文档](https://github.com/anthropics/claude-code-action/blob/main/docs)。

### 自定义 Claude 的行为

你可以通过两种方式配置 Claude 的行为：

1. **CLAUDE.md**：在仓库根目录的 `CLAUDE.md` 文件中定义编码标准、审查标准和项目特定规则。Claude 在创建 PR 和响应请求时会遵循这些指南。更多详情请查看我们的[记忆文档](/zh/memory)。
2. **自定义提示词**：在工作流文件中使用 `prompt` 参数提供工作流特定的指令。这允许你为不同的工作流或任务自定义 Claude 的行为。

Claude 在创建 PR 和响应请求时会遵循这些指南。
