# 配置基础

Codex 从多个位置读取配置详情。你的个人默认配置保存在 `~/.codex/config.toml` 中，你还可以通过 `.codex/config.toml` 文件添加项目级覆盖配置。出于安全考虑，Codex 仅在你信任该项目时才会加载项目的 `.codex/` 层。

## Codex 配置文件

Codex 将用户级配置存储在 `~/.codex/config.toml`。要将设置限定在特定项目或子文件夹，请在你的仓库中添加 `.codex/config.toml` 文件。

要从 Codex IDE 扩展中打开配置文件，请点击右上角的齿轮图标，然后选择 **Codex Settings > Open config.toml**。

CLI 和 IDE 扩展共享相同的配置层。你可以使用它们来：

- 设置默认模型和提供商。
- 配置[审批策略和沙箱设置](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)。
- 配置 [MCP 服务器](https://developers.openai.com/codex/mcp)。

## 配置优先级

Codex 按以下顺序解析值（优先级从高到低）：

1. CLI 标志和 `--config` 覆盖
2. 项目配置文件：`.codex/config.toml`，从项目根目录向下到当前工作目录排序（最近的优先；仅限受信任的项目）
3. 通过 `--profile profile-name` 选择的[配置文件](https://developers.openai.com/codex/config-advanced#profiles)（`~/.codex/profile-name.config.toml`）
4. 用户配置：`~/.codex/config.toml`
5. 系统配置（如存在）：Unix 上的 `/etc/codex/config.toml`
6. 内置默认值

利用此优先级在 `config.toml` 中设置共享默认值，并将[配置文件](https://developers.openai.com/codex/config-advanced#profiles)专注于那些不同的值。

如果你将项目标记为不受信任，Codex 会跳过项目级 `.codex/` 层，包括项目本地配置、钩子和规则。用户和系统配置仍然会加载，包括用户/全局钩子和规则。

有关通过 `-c`/`--config` 进行一次性覆盖（包括 TOML 引用规则），请参阅[高级配置](https://developers.openai.com/codex/config-advanced#one-off-overrides-from-the-cli)。

在托管机器上，你的组织可能还会通过 `requirements.toml` 强制执行约束（例如，禁止 `approval_policy = "never"` 或 `sandbox_mode = "danger-full-access"`）。请参阅[托管配置](https://developers.openai.com/codex/enterprise/managed-configuration)和[管理员强制要求](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

## 常用配置选项

以下是用户最常修改的一些选项：

#### 默认模型

选择 Codex 在 CLI 和 IDE 中默认使用的模型。

```toml
model = "gpt-5.5"
```


#### 审批提示

控制 Codex 在运行生成的命令前何时暂停请求确认。

```toml
approval_policy = "on-request"
```

有关 `untrusted`、`on-request` 和 `never` 之间的行为差异，请参阅[无审批提示运行](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts)和[常用沙箱和审批组合](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)。

#### 沙箱级别

调整 Codex 在执行命令时拥有的文件系统和网络访问权限。

```toml
sandbox_mode = "workspace-write"
```

有关各模式的行为（包括受保护的 `.git`/`.codex` 路径和网络默认值），请参阅[沙箱和审批](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)、[可写根目录中的受保护路径](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots)和[网络访问](https://developers.openai.com/codex/agent-approvals-security#network-access)。

#### 权限配置文件

Codex 还支持命名权限配置文件，用于可复用的文件系统和网络策略。内置配置文件有 `:read-only`、`:workspace` 和 `:danger-full-access`。自定义配置文件使用 `[permissions.<name>]` 表和匹配的 `default_permissions` 值。请参阅[权限](https://developers.openai.com/codex/permissions)。

#### Windows 沙箱模式

在 Windows 上原生运行 Codex 时，请在 `windows` 表中将原生沙箱模式设置为 `elevated`。仅在没有管理员权限或提权设置失败时才使用 `unelevated`。

```toml
[windows]
sandbox = "elevated"   # 推荐
# sandbox = "unelevated" # 当管理员权限/设置不可用时的备选方案
```

#### 网页搜索模式

Codex 默认为本地任务启用网页搜索，并从网页搜索缓存中提供结果。该缓存是 OpenAI 维护的网页结果索引，因此缓存模式返回的是预索引结果而非实时抓取页面。这减少了来自任意实时内容的提示词注入风险，但你仍应将网页结果视为不受信任的。如果你使用 `--yolo` 或其他[完全访问沙箱设置](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)，网页搜索默认为实时结果。使用 `web_search` 选择模式：

- `"cached"`（默认）从网页搜索缓存中提供结果。
- `"live"` 从网络获取最新数据（与 `--search` 相同）。
- `"disabled"` 关闭网页搜索工具。

```toml
web_search = "cached"  # 默认；从网页搜索缓存中提供结果
# web_search = "live"  # 从网络获取最新数据（与 --search 相同）
# web_search = "disabled"
```

#### 推理力度

调整模型在支持时应用的推理力度。

```toml
model_reasoning_effort = "high"
```

#### 沟通风格

为支持的模型设置默认沟通风格。

```toml
personality = "friendly" # 或 "pragmatic" 或 "none"
```

你可以在活跃会话中稍后使用 `/personality` 覆盖此设置，或在使用应用服务器 API 时按线程/轮次设置。

#### TUI 键位映射

在 `tui.keymap` 下自定义终端快捷键。上下文特定的绑定会覆盖 `tui.keymap.global`，空列表会取消该操作的绑定。

```toml
[tui.keymap.global]
open_transcript = "ctrl-t"

[tui.keymap.composer]
submit = ["enter", "ctrl-m"]
```

#### 命令环境

控制 Codex 向生成的命令转发哪些环境变量。

```toml
[shell_environment_policy]
include_only = ["PATH", "HOME"]
```

#### 日志目录

覆盖 Codex 写入本地日志文件的位置。显式设置 `log_dir` 还会在该目录中启用可选的明文 TUI 日志 `codex-tui.log`。

```toml
log_dir = "/absolute/path/to/codex-logs"
```

对于一次性运行，你也可以从 CLI 设置：

```bash
codex -c log_dir=./.codex-log
```

## 功能标志

使用 `config.toml` 中的 `[features]` 表来切换可选和实验性功能。

```toml
[features]
shell_snapshot = true           # 加速重复命令
```

### 支持的功能

| 键                   |        默认值         | 成熟度       | 描述                                                                                     |
| -------------------- | :-------------------: | ------------ | ---------------------------------------------------------------------------------------- |
| `apps`               |         false         | 实验性       | 启用 ChatGPT 应用/连接器支持                                                             |
| `codex_git_commit`   |         false         | 实验性       | 启用 Codex 生成的 git 提交和提交归属标记                                                  |
| `hooks`              |         true          | 稳定         | 启用来自 `hooks.json` 或内联 `[hooks]` 的生命周期钩子。请参阅[钩子](https://developers.openai.com/codex/hooks)。 |
| `fast_mode`          |         true          | 稳定         | 启用快速模式选择和 `service_tier = "fast"` 路径                                           |
| `memories`           |         false         | 稳定         | 启用[记忆](https://developers.openai.com/codex/memories)                                 |
| `multi_agent`        |         true          | 稳定         | 启用子代理协作工具                                                                        |
| `personality`        |         true          | 稳定         | 启用沟通风格选择控件                                                                      |
| `shell_snapshot`     |         true          | 稳定         | 快照你的 shell 环境以加速重复命令                                                         |
| `shell_tool`         |         true          | 稳定         | 启用默认的 `shell` 工具                                                                   |
| `unified_exec`       |  `true`（Windows 除外）| 稳定        | 使用统一的 PTY 支持的 exec 工具                                                           |
| `undo`               |         false         | 稳定         | 通过每轮 git 幽灵快照启用撤销功能                                                         |
| `web_search`         |         true          | 已弃用       | 旧版切换；建议使用顶层 `web_search` 设置                                                  |
| `web_search_cached`  |         false         | 已弃用       | 旧版切换，未设置时映射为 `web_search = "cached"`                                          |
| `web_search_request` |         false         | 已弃用       | 旧版切换，未设置时映射为 `web_search = "live"`                                            |

成熟度列使用功能成熟度标签，如实验性、Beta 和稳定。请参阅[功能成熟度](https://developers.openai.com/codex/feature-maturity)了解如何解读这些标签。

省略功能键以保持其默认值。

有关生命周期钩子配置，请参阅[钩子](https://developers.openai.com/codex/hooks)。

### 启用功能

- 在 `config.toml` 的 `[features]` 下添加 `feature_name = true`。
- 从 CLI 运行 `codex --enable feature_name`。
- 要启用多个功能，运行 `codex --enable feature_a --enable feature_b`。
- 要禁用功能，在 `config.toml` 中将该键设置为 `false`。
