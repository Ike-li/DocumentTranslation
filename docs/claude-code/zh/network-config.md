> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 企业网络配置

> 为使用代理服务器、自定义证书颁发机构 (CA) 和双向 TLS (mTLS) 认证的企业环境配置 Claude Code。

Claude Code 通过环境变量支持各种企业网络和安全配置。包括通过企业代理服务器路由流量、信任自定义证书颁发机构 (CA)，以及使用双向 TLS (mTLS) 证书进行身份验证以增强安全性。

本页显示的所有环境变量也可以在 [`settings.json`](/zh/settings) 中配置。

## 代理配置

### 环境变量

Claude Code 遵循标准代理环境变量：

```bash
# HTTPS 代理（推荐）
export HTTPS_PROXY=https://proxy.example.com:8080

# HTTP 代理（如果 HTTPS 不可用）
export HTTP_PROXY=http://proxy.example.com:8080

# 绕过特定请求的代理 - 空格分隔格式
export NO_PROXY="localhost 192.168.1.1 example.com .example.com"
# 绕过特定请求的代理 - 逗号分隔格式
export NO_PROXY="localhost,192.168.1.1,example.com,.example.com"
# 绕过所有请求的代理
export NO_PROXY="*"
```

Claude Code 不支持 SOCKS 代理。

### 基本身份验证

如果您的代理需要基本身份验证，请在代理 URL 中包含凭据：

```bash
export HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

避免在脚本中硬编码密码。请使用环境变量或安全凭据存储代替。

对于需要高级身份验证（NTLM、Kerberos 等）的代理，请考虑使用支持您身份验证方法的 LLM 网关服务。

## CA 证书存储

默认情况下，Claude Code 信任其捆绑的 Mozilla CA 证书和操作系统的证书存储。企业 TLS 检查代理（如 CrowdStrike Falcon 和 Zscaler）在将其根证书安装到操作系统信任存储中后，无需额外配置即可工作。

`CLAUDE_CODE_CERT_STORE` 接受逗号分隔的来源列表。可识别的值包括 `bundled`（表示 Claude Code 附带的 Mozilla CA 集）和 `system`（表示操作系统信任存储）。默认值为 `bundled,system`。

仅信任捆绑的 Mozilla CA 集：

```bash
export CLAUDE_CODE_CERT_STORE=bundled
```

仅信任操作系统证书存储：

```bash
export CLAUDE_CODE_CERT_STORE=system
```

`CLAUDE_CODE_CERT_STORE` 没有专用的 `settings.json` schema 键。通过 `~/.claude/settings.json` 中的 `env` 块或直接在进程环境中设置。

## 自定义 CA 证书

如果您的企业环境使用自定义 CA，请配置 Claude Code 直接信任它：

```bash
export NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem
```

## mTLS 身份验证

对于需要客户端证书身份验证的企业环境：

```bash
# 用于身份验证的客户端证书
export CLAUDE_CODE_CLIENT_CERT=/path/to/client-cert.pem

# 客户端私钥
export CLAUDE_CODE_CLIENT_KEY=/path/to/client-key.pem

# 可选：加密私钥的密码短语
export CLAUDE_CODE_CLIENT_KEY_PASSPHRASE="your-passphrase"
```

## 网络访问要求

Claude Code 需要访问以下 URL。请在代理配置和防火墙规则中将这些 URL 加入白名单，尤其是在容器化或受限网络环境中。

| URL                            | 用途                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `api.anthropic.com`            | Claude API 请求                                                                                                                   |
| `claude.ai`                    | claude.ai 账户认证                                                                                                                |
| `platform.claude.com`          | Anthropic Console 账户认证                                                                                                        |
| `downloads.claude.ai`          | 插件可执行文件下载；原生安装程序和原生自动更新器                                                                                     |
| `storage.googleapis.com`       | 2.1.116 之前版本的原生安装程序和原生自动更新器                                                                                      |
| `bridge.claudeusercontent.com` | [Claude in Chrome](/zh/chrome) 扩展 WebSocket 桥接                                                                                 |
| `raw.githubusercontent.com`    | [`/release-notes`](/zh/commands) 的更新日志源和更新后显示的版本说明；插件市场安装计数                                                 |

如果您通过 npm 安装 Claude Code 或自行管理二进制分发，最终用户可能不需要访问 `downloads.claude.ai` 或 `storage.googleapis.com`。

Claude Code 默认还会发送可选的运营遥测数据，您可以通过环境变量禁用它。有关在最终确定白名单之前如何禁用它，请参阅[遥测服务](/zh/data-usage#telemetry-services)。

使用 [Amazon Bedrock](/zh/amazon-bedrock)、[Google Vertex AI](/zh/google-vertex-ai) 或 [Microsoft Foundry](/zh/microsoft-foundry) 时，模型流量和身份验证会转到您的提供商，而不是 `api.anthropic.com`、`claude.ai` 或 `platform.claude.com`。WebFetch 工具仍会调用 `api.anthropic.com` 进行其[域安全检查](/zh/data-usage#webfetch-domain-safety-check)，除非您在[设置](/zh/settings)中设置 `skipWebFetchPreflight: true`。

[Claude Code 网页版](/zh/claude-code-on-the-web)和[代码审查](/zh/code-review)从 Anthropic 管理的基础设施连接到您的仓库。如果您的 GitHub Enterprise Cloud 组织按 IP 地址限制访问，请启用[已安装 GitHub 应用的 IP 允许列表继承](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization#allowing-access-by-github-apps)。Claude GitHub App 注册了其 IP 范围，因此启用此设置后无需手动配置即可访问。要[手动将范围添加到允许列表](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization#adding-an-allowed-ip-address)，或配置其他防火墙，请参阅 [Anthropic API IP 地址](https://platform.claude.com/docs/en/api/ip-addresses)。

对于防火墙后面的自托管 [GitHub Enterprise Server](/zh/github-enterprise-server) 实例，请将相同的 [Anthropic API IP 地址](https://platform.claude.com/docs/en/api/ip-addresses)加入白名单，以便 Anthropic 基础设施能够访问您的 GHES 主机以克隆仓库和发布审查评论。

## 其他资源

* [Claude Code 设置](/zh/settings)
* [环境变量参考](/zh/env-vars)
* [故障排除指南](/zh/troubleshooting)
