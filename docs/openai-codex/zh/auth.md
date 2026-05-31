# 认证

## OpenAI 认证

使用 OpenAI 模型时，Codex 支持两种登录方式：

- 通过 ChatGPT 登录以获取订阅访问权限
- 通过 API key 登录以获取按量计费访问权限

Codex 云要求通过 ChatGPT 登录。Codex CLI 和 IDE 扩展支持两种登录方式。

你的登录方式也决定了哪些管理控制和数据处理策略适用。

- 通过 ChatGPT 登录时，Codex 的使用遵循你的 ChatGPT 工作区权限、RBAC 以及 ChatGPT Enterprise 的数据保留和数据驻留设置
- 通过 API key 登录时，其使用遵循你的 API 组织的数据保留和数据共享设置

对于 CLI，当没有可用的有效会话时，通过 ChatGPT 登录是默认的认证路径。

### 通过 ChatGPT 登录

从 Codex 应用、CLI 或 IDE 扩展通过 ChatGPT 登录时，Codex 会打开一个浏览器窗口供你完成登录流程。登录后，浏览器会将访问令牌返回给 CLI 或 IDE 扩展。

如果你的环境已经提供了 ChatGPT 访问令牌，CLI 可以从 stdin 读取：

```shell
printenv CODEX_ACCESS_TOKEN | codex login --with-access-token
```

### 通过 API key 登录

你也可以使用 API key 登录 Codex 应用、CLI 或 IDE 扩展。从 [OpenAI 控制面板](https://platform.openai.com/api-keys) 获取你的 API key。

OpenAI 通过你的 OpenAI Platform 账户按标准 API 费率对 API key 使用进行计费。参阅 [API 定价页面](https://openai.com/api/pricing/)。

依赖 ChatGPT 额度的功能（如[快速模式](https://developers.openai.com/codex/speed)）仅在通过 ChatGPT 登录时可用。如果你通过 API key 登录，Codex 将使用标准 API 定价。

我们建议在程序化的 Codex CLI 工作流（如 CI/CD 任务）中使用 API key 认证。不要在不受信任或公开的环境中暴露 Codex 执行。

### 使用 Codex 访问令牌进行企业自动化

在 ChatGPT Enterprise 工作区中，管理员可以允许被授权成员创建 Codex 访问令牌，用于受信任的、非交互式的 Codex 本地工作流。当自动化需要访问 ChatGPT 工作区、ChatGPT 管理的 Codex 权益或企业工作区控制，且无需浏览器登录时，可以使用访问令牌。

访问令牌适用于受信任的脚本、调度器和私有 CI 运行器。对于通用 OpenAI API 调用，请继续使用 Platform API key。

有关设置步骤、权限、轮换和撤销指南，请参阅[访问令牌](https://developers.openai.com/codex/enterprise/access-tokens)。

## 保护你的 Codex 云账户

Codex 云直接与你的代码库交互，因此它需要比许多其他 ChatGPT 功能更强的安全性。请启用多因素认证（MFA）。

如果你使用社交登录提供商（Google、Microsoft、Apple），你不需要在 ChatGPT 账户上启用 MFA，但你可以在社交登录提供商处进行设置。

设置说明请参阅：

- [Google](https://support.google.com/accounts/answer/185839)
- [Microsoft](https://support.microsoft.com/en-us/topic/what-is-multifactor-authentication-e5e39437-121c-be60-d123-eda06bddf661)
- [Apple](https://support.apple.com/en-us/102660)

如果你通过单点登录（SSO）访问 ChatGPT，你的组织 SSO 管理员应为所有用户强制启用 MFA。

如果你使用电子邮件和密码登录，你必须在访问 Codex 云之前在账户上设置 MFA。

如果你的账户支持多种登录方式且其中一种是电子邮件和密码，即使你使用其他方式登录，你也必须在访问 Codex 之前设置 MFA。

## 登录缓存

当你使用 ChatGPT 或 API key 登录 Codex 应用、CLI 或 IDE 扩展时，Codex 会缓存你的登录详情，并在下次启动 CLI 或扩展时复用。CLI 和扩展共享相同的缓存登录详情。如果你从其中任何一个退出登录，下次启动 CLI 或扩展时需要重新登录。

Codex 将登录详情以明文文件形式缓存在本地 `~/.codex/auth.json` 或你操作系统的凭据存储中。

对于通过 ChatGPT 的会话登录，Codex 会在使用期间自动刷新即将过期的令牌，因此活跃会话通常无需再次进行浏览器登录即可继续。

## 凭据存储

使用 `cli_auth_credentials_store` 控制 Codex CLI 存储缓存凭据的位置：

```toml
# file | keyring | auto
cli_auth_credentials_store = "keyring"
```

- `file` 将凭据存储在 `CODEX_HOME` 下的 `auth.json` 中（默认为 `~/.codex`）。
- `keyring` 将凭据存储在操作系统凭据存储中。
- `auto` 在可用时使用操作系统凭据存储，否则回退到 `auth.json`。

如果使用基于文件的存储，请像对待密码一样对待 `~/.codex/auth.json`：它包含访问令牌。不要将其提交到版本控制、粘贴到工单中或在聊天中分享。

## 强制登录方式或工作区

在托管环境中，管理员可以限制用户允许使用的认证方式：

```toml
# 仅允许 ChatGPT 登录或仅允许 API key 登录。
forced_login_method = "chatgpt" # 或 "api"

# 使用 ChatGPT 登录时，将用户限制在特定工作区。
forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"
```

如果当前凭据与配置的限制不匹配，Codex 会将用户退出登录并退出。

这些设置通常通过托管配置而非逐用户设置来应用。参阅[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)。

## 登录诊断

直接运行 `codex login` 会在你配置的日志目录下写入专门的 `codex-login.log` 文件。当你需要调试浏览器登录或设备代码失败，或者支持团队要求提供登录专用日志时，可以使用它。

## 自定义 CA 证书包

如果你的网络使用企业 TLS 代理或私有根 CA，请在登录前将 `CODEX_CA_CERTIFICATE` 设置为 PEM 证书包。当 `CODEX_CA_CERTIFICATE` 未设置时，Codex 回退到 `SSL_CERT_FILE`。相同的自定义 CA 设置适用于登录、普通 HTTPS 请求和安全 WebSocket 连接。

```shell
export CODEX_CA_CERTIFICATE=/path/to/corporate-root-ca.pem
codex login
```

## 在无头设备上登录

如果你使用 Codex CLI 登录 ChatGPT，某些情况下基于浏览器的登录界面可能无法工作：

- 你在远程或无头环境中运行 CLI。
- 你的本地网络配置阻止了 Codex 在登录后用于将 OAuth 令牌返回给 CLI 的 localhost 回调。

在这些情况下，建议使用设备代码认证（测试版）。在交互式登录界面中，选择**通过设备代码登录**，或直接运行 `codex login --device-auth`。如果设备代码认证在你的环境中无法工作，请使用以下备用方法之一。

### 首选：设备代码认证（测试版）

1. 在你的 ChatGPT 安全设置（个人账户）或 ChatGPT 工作区权限（工作区管理员）中启用设备代码登录。
2. 在运行 Codex 的终端中，选择以下选项之一：
   - 在交互式登录界面中，选择**通过设备代码登录**。
   - 运行 `codex login --device-auth`。
3. 在浏览器中打开链接，登录，然后输入一次性代码。

如果服务器未启用设备代码登录，Codex 会回退到标准的基于浏览器的登录流程。

### 备用方案：在本地认证并复制认证缓存

如果你能在有浏览器的机器上完成登录流程，可以将缓存凭据复制到无头机器上。

1. 在可以使用基于浏览器登录流程的机器上，运行 `codex login`。
2. 确认登录缓存存在于 `~/.codex/auth.json`。
3. 将 `~/.codex/auth.json` 复制到无头机器上的 `~/.codex/auth.json`。

像对待密码一样对待 `~/.codex/auth.json`：它包含访问令牌。不要将其提交到版本控制、粘贴到工单中或在聊天中分享。

如果你的操作系统将凭据存储在凭据存储中而非 `~/.codex/auth.json`，此方法可能不适用。参阅[凭据存储](#凭据存储)了解如何配置基于文件的存储。

通过 SSH 复制到远程机器：

```shell
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

或使用避免 `scp` 的单行命令：

```shell
ssh user@remote 'mkdir -p ~/.codex && cat > ~/.codex/auth.json' < ~/.codex/auth.json
```

复制到 Docker 容器：

```shell
# 将 MY_CONTAINER 替换为你的容器名称或 ID。
CONTAINER_HOME=$(docker exec MY_CONTAINER printenv HOME)
docker exec MY_CONTAINER mkdir -p "$CONTAINER_HOME/.codex"
docker cp ~/.codex/auth.json MY_CONTAINER:"$CONTAINER_HOME/.codex/auth.json"
```

有关在受信任的 CI/CD 运行器上使用此模式的更高级版本，请参阅[在 CI/CD 中维护 Codex 账户认证（高级）](https://developers.openai.com/codex/auth/ci-cd-auth)。该指南介绍了如何让 Codex 在正常运行期间刷新 `auth.json` 并将更新后的文件保留给下一个任务。API key 仍然是自动化的推荐默认方式。

### 备用方案：通过 SSH 转发 localhost 回调

如果你能在本地机器和远程主机之间转发端口，可以通过隧道转发 Codex 的本地回调服务器（默认 `localhost:1455`）来使用标准的基于浏览器的流程。

1. 从本地机器开始端口转发：

```shell
ssh -L 1455:localhost:1455 user@remote
```

2. 在该 SSH 会话中，运行 `codex login` 并在本地机器上访问打印的地址。

## 替代模型提供商

当你在配置文件中定义[自定义模型提供商](https://developers.openai.com/codex/config-advanced#custom-model-providers)时，可以选择以下认证方式之一：

- **OpenAI 认证**：设置 `requires_openai_auth = true` 以使用 OpenAI 认证。然后你可以通过 ChatGPT 或 API key 登录。当你通过 LLM 代理服务器访问 OpenAI 模型时，这很有用。当 `requires_openai_auth = true` 时，Codex 忽略 `env_key`。
- **环境变量认证**：设置 `env_key = "<ENV_VARIABLE_NAME>"` 以使用来自本地环境变量 `<ENV_VARIABLE_NAME>` 的提供商专用 API key。
- **无认证**：如果你未设置 `requires_openai_auth`（或将其设置为 `false`）且未设置 `env_key`，Codex 假定提供商不需要认证。这对本地模型很有用。
