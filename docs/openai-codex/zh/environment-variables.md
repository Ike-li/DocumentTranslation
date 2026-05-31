# 环境变量

Codex 使用 `config.toml` 进行持久化配置。环境变量适用于 shell 范围的覆盖、自动化密钥、安装器行为或诊断。

本页列出了 Codex 直接读取的稳定公开环境变量。不包含内部开发变量、测试变量或你通过
[`env_key`](https://developers.openai.com/codex/config-advanced#custom-model-providers) 自行选择的特定提供商密钥名称。

## 核心路径

| 变量                | 使用范围                                   | 默认值       | 说明                                                                                                                                                             |
| ------------------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI、IDE 扩展、应用服务器、安装器           | `~/.codex`   | 设置 Codex 状态的根目录，包括配置、认证、日志、会话、技能和独立包元数据。设置后该目录必须已存在。                                                                   |
| `CODEX_SQLITE_HOME` | CLI 和应用服务器状态                        | `CODEX_HOME` | 设置 SQLite 存储状态的位置。`sqlite_home` 配置选项优先级更高。相对路径基于当前工作目录解析。                                                                       |

关于 `CODEX_HOME` 下存储的文件，参见
[配置和状态路径](https://developers.openai.com/codex/config-advanced#config-and-state-locations)。

## 安装器变量

这些变量适用于从 `https://chatgpt.com/codex/install.sh` 和
`https://chatgpt.com/codex/install.ps1` 提供的独立安装脚本。

| 变量                    | 默认值                                                                                 | 说明                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_NON_INTERACTIVE` | `false`                                                                                | 设置为 `1`、`true` 或 `yes` 可跳过安装器提示。提示将使用默认响应，因此适用于脚本化安装和更新，而非首次运行设置。                                                   |
| `CODEX_INSTALL_DIR`     | macOS/Linux 上为 `~/.local/bin`；Windows 上为 `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` | 更改可见的 `codex` 命令安装位置。独立包缓存仍位于 `CODEX_HOME/packages/standalone` 下。                                                                            |

进行无人值守安装时，在运行下载安装器的 shell 上设置 `CODEX_NON_INTERACTIVE=1`：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
```

```powershell
$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
```

## 认证和网络

| 变量                   | 使用范围                            | 说明                                                                                                                                                               |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CODEX_API_KEY`        | `codex exec`                        | 为单次非交互式运行提供 API 密钥。仅在 `codex exec` 中受支持；运行仓库控制的代码时应内联设置而非作业范围设置。                                                        |
| `CODEX_ACCESS_TOKEN`   | CLI、应用服务器、受信自动化          | 为受信自动化提供 ChatGPT 或 Codex 访问令牌。如需持久化登录，将其管道传输到 `codex login --with-access-token`。                                                       |
| `CODEX_CA_CERTIFICATE` | HTTPS、登录和 WebSocket 客户端      | 指向 PEM CA 证书包，用于企业 TLS 拦截或私有根 CA 环境。优先级高于 `SSL_CERT_FILE`。                                                                                 |
| `SSL_CERT_FILE`        | HTTPS、登录和 WebSocket 客户端      | 未设置 `CODEX_CA_CERTIFICATE` 时的备选 PEM CA 证书包路径。                                                                                                           |

关于提供商 API 密钥，在模型提供商配置中设置
[`env_key`](https://developers.openai.com/codex/config-advanced#custom-model-providers)。Codex 读取该配置指定的变量名，因此变量名本身不是固定的 Codex 环境变量。

关于自动化密钥处理，参见
[使用 API 密钥认证](https://developers.openai.com/codex/noninteractive#use-api-key-auth)。
关于访问令牌设置，参见[访问令牌](https://developers.openai.com/codex/enterprise/access-tokens)。

## 诊断

| 变量       | 使用范围           | 说明                                                                                                                |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `RUST_LOG` | CLI 和应用服务器    | 控制 Rust 日志过滤和详细程度。`codex exec` 默认输出 `error` 级别，除非设置更详细的值。                                |

`RUST_LOG` 接受 `error`、`warn`、`info`、`debug` 和 `trace` 等值。也接受更精确的 Rust 日志过滤器，如
`codex_core=debug,codex_tui=debug`。

交互式 CLI 默认将诊断记录在有限的本地存储中，但明文 `codex-tui.log` 文件需要手动启用。需要明文日志进行故障排除时，请显式设置 `log_dir`：

```bash
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

在非交互模式下，`codex exec` 将消息直接内联打印，而非写入单独的 TUI 日志文件。
