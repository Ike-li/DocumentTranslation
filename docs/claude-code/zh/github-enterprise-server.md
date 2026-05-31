> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 与 GitHub Enterprise Server

> 将 Claude Code 连接到你的自托管 GitHub Enterprise Server 实例，以使用 Web 会话、代码审查和插件市场功能。

GitHub Enterprise Server 支持适用于 Team 和 Enterprise 计划。

GitHub Enterprise Server (GHES) 支持让你的组织可以使用 Claude Code 连接到自托管的 GitHub 实例上的仓库，而非 github.com。管理员连接 GHES 实例后，开发者即可运行 Web 会话、获取自动代码审查，并从内部市场安装插件，无需逐个仓库进行配置。

有关 github.com 上的仓库，请参阅 [Claude Code Web 版](/zh/claude-code-on-the-web) 和 [代码审查](/zh/code-review)。如需在自有 CI 基础设施中运行 Claude，请参阅 [GitHub Actions](/zh/github-actions)。

## GitHub Enterprise Server 支持的功能

下表展示了哪些 Claude Code 功能支持 GHES，以及与 github.com 行为的差异。

| 功能                   | GHES 支持       | 说明                                                                                                                          |
| :--------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Claude Code Web 版     | ✅ 支持         | 管理员只需连接一次 GHES 实例；开发者照常使用 `claude --remote` 或 [claude.ai/code](https://claude.ai/code)                     |
| 代码审查               | ✅ 支持         | 与 github.com 相同的自动化 PR 审查                                                                                           |
| Claude Security        | ✅ 支持         | 在 Enterprise 计划中以公开测试版提供，访问 [claude.ai/security](https://claude.ai/security)                                   |
| Teleport 会话          | ✅ 支持         | 使用 `--teleport` 在 Web 和终端之间迁移会话                                                                                  |
| 插件市场               | ✅ 支持         | 使用完整的 git URL 代替 `owner/repo` 简写                                                                                    |
| 贡献指标               | ✅ 支持         | 通过 webhook 推送至[分析仪表盘](/zh/analytics)                                                                               |
| GitHub Actions         | ✅ 支持         | 需要手动设置 workflow；`/install-github-app` 仅限 github.com                                                                  |
| GitHub MCP 服务器       | ❌ 不支持       | GitHub MCP 服务器不支持 GHES 实例                                                                                             |

## 管理员设置

管理员只需将 GHES 实例连接到 Claude Code 一次。之后，组织中的开发者即可使用 GHES 仓库，无需额外配置。你需要拥有 Claude 组织的管理员权限以及在 GHES 实例上创建 GitHub App 的权限。

引导式设置会生成 GitHub App 清单，并将你重定向到 GHES 实例以一键创建应用。如果你的环境阻止了重定向流程，可以使用[替代手动设置](#手动设置)。

1. **打开 Claude Code 管理员设置** -- 前往 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)，找到 GitHub Enterprise Server 部分。

2. **开始引导式设置** -- 点击 **Connect**。输入连接的显示名称和 GHES 主机名，例如 `github.example.com`。如果你的 GHES 实例使用自签名或私有证书颁发机构，请在可选字段中粘贴 CA 证书。

3. **创建 GitHub App** -- 点击 **Continue to GitHub Enterprise**。浏览器将重定向到你的 GHES 实例，并带有预填充的应用清单。检查配置后点击 **Create GitHub App**。GHES 会将你重定向回 Claude，应用凭据将自动保存。

4. **在仓库上安装应用** -- 在 GHES 实例的 GitHub App 页面上，将应用安装到你希望 Claude 访问的仓库或组织。你可以先选择部分仓库，之后再添加更多。

5. **启用功能** -- 返回 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)，使用与 github.com 相同的配置为 GHES 仓库启用[代码审查](/zh/code-review#set-up-code-review)、Claude Security 和[贡献指标](/zh/analytics#enable-contribution-metrics)。

### GitHub App 权限

清单为 GitHub App 配置了 Claude 在 Web 会话、代码审查、Claude Security 和贡献指标中所需的权限和 webhook 事件：

| 权限             | 访问级别       | 用途                                       |
| :--------------- | :------------- | :----------------------------------------- |
| Contents         | 读写           | 克隆仓库和推送分支                          |
| Pull requests    | 读写           | 创建 PR 和发布审查评论                      |
| Issues           | 读写           | 响应 issue 提及                             |
| Checks           | 读写           | 发布代码审查检查运行                        |
| Actions          | 只读           | 读取 CI 状态以进行自动修复                  |
| Repository hooks | 读写           | 接收 webhook 以获取贡献指标                 |
| Metadata         | 只读           | GitHub 所有应用的必需权限                   |

应用订阅 `pull_request`、`issue_comment`、`pull_request_review_comment`、`pull_request_review` 和 `check_run` 事件。

### 手动设置

如果你的网络配置阻止了引导式重定向流程，请点击 **Add manually** 而非 Connect。在 GHES 实例上创建一个具有[上述权限和事件](#github-app-权限)的 GitHub App，然后在表单中输入应用凭据：主机名、OAuth 客户端 ID 和密钥、GitHub App ID、客户端 ID、客户端密钥、webhook 密钥和私钥。

### 网络要求

你的 GHES 实例必须能被 Anthropic 基础设施访问，以便 Claude 能够克隆仓库和发布审查评论。如果你的 GHES 实例位于防火墙后面，请将 [Anthropic API IP 地址](https://platform.claude.com/docs/en/api/ip-addresses)加入白名单。

## 开发者工作流

管理员连接 GHES 实例后，开发者无需任何配置。Claude Code 会自动从工作目录中的 git remote 检测 GHES 主机名。

照常从 GHES 实例克隆仓库：

```bash
git clone git@github.example.com:platform/api-service.git
cd api-service
```

然后启动 Web 会话。Claude 从 git remote 检测 GHES 主机，并通过组织配置的实例路由会话：

```bash
claude --remote "Add retry logic to the payment webhook handler"
```

会话在 Anthropic 基础设施上运行，从 GHES 克隆你的仓库，并将更改推送回分支。使用 `/tasks` 或在 [claude.ai/code](https://claude.ai/code) 上监控进度。完整的远程会话工作流（包括 diff 审查、自动修复和例程）请参阅 [Claude Code Web 版](/zh/claude-code-on-the-web)。

### 将会话 Teleport 到终端

使用 `claude --teleport` 将 Web 会话拉取到本地终端。Teleport 会验证你是否在同一 GHES 仓库的检出中，然后获取分支并加载会话历史。详情请参阅 [teleport 要求](/zh/claude-code-on-the-web#teleport-requirements)。

## GHES 上的插件市场

在 GHES 实例上托管插件市场，为组织分发内部工具。市场结构与 github.com 托管的市场完全相同；唯一的区别在于引用方式。

### 添加 GHES 市场

`owner/repo` 简写始终解析到 github.com。对于 GHES 托管的市场，请使用完整的 git URL：

```bash
/plugin marketplace add git@github.example.com:platform/claude-plugins.git
```

HTTPS URL 同样适用：

```bash
/plugin marketplace add https://github.example.com/platform/claude-plugins.git
```

完整的市场构建指南请参阅[创建和分发插件市场](/zh/plugin-marketplaces)。

### 在托管设置中为 GHES 市场添加白名单

如果你的组织使用[托管设置](/zh/settings)限制开发者可添加的市场，可使用 `hostPattern` 源类型允许 GHES 实例上的所有市场，无需逐一列举每个仓库：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

你还可以为开发者预注册市场，使其无需手动设置即可显示。以下示例使内部工具市场在整个组织范围内可用：

```json
{
  "extraKnownMarketplaces": {
    "internal-tools": {
      "source": {
        "source": "git",
        "url": "git@github.example.com:platform/claude-plugins.git"
      }
    }
  }
}
```

完整的 schema 请参阅 [strictKnownMarketplaces](/zh/settings#strictknownmarketplaces) 和 [extraKnownMarketplaces](/zh/settings#extraknownmarketplaces) 设置参考。

## 限制

部分功能在 GHES 上的行为与 github.com 不同。[功能表](#github-enterprise-server-支持的功能)总结了支持情况；本节介绍变通方法。

* **`/install-github-app` 命令**：请改用 claude.ai 上的[管理员设置](#管理员设置)流程。如果你还需要在 GHES 上使用 GitHub Actions workflow，请手动适配[示例 workflow](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml)。
* **GitHub MCP 服务器**：请改用为 GHES 主机配置的 `gh` CLI。运行 `gh auth login --hostname github.example.com` 进行身份验证，然后 Claude 即可在会话中使用 `gh` 命令。

## 故障排除

### Web 会话克隆仓库失败

如果 `claude --remote` 因克隆错误而失败，请确认管理员已为 GHES 实例完成设置，且 GitHub App 已安装在你当前工作的仓库上。与管理员确认 Claude 设置中注册的实例主机名与 git remote 中的主机名一致。

### 添加市场时出现策略错误

如果 `/plugin marketplace add` 因你的 GHES URL 而被阻止，说明你的组织限制了市场来源。请让管理员在[托管设置](#在托管设置中为-ghes-市场添加白名单)中为你的 GHES 主机名添加 `hostPattern` 条目。

### GHES 实例不可达

如果审查或 Web 会话超时，可能是你的 GHES 实例无法从 Anthropic 基础设施访问。请确认防火墙允许来自 [Anthropic API IP 地址](https://platform.claude.com/docs/en/api/ip-addresses)的入站连接。

## 相关资源

以下页面更深入地介绍了本指南中引用的功能：

* [Claude Code Web 版](/zh/claude-code-on-the-web)：在云基础设施上运行 Claude Code 会话
* [代码审查](/zh/code-review)：自动化 PR 审查
* [插件市场](/zh/plugin-marketplaces)：构建和分发插件目录
* [分析](/zh/analytics)：跟踪使用情况和贡献指标
* [托管设置](/zh/settings)：组织范围的策略配置
* [网络配置](/zh/network-config)：防火墙和 IP 白名单要求
