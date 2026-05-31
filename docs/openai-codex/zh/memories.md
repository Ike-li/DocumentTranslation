# 记忆

默认情况下记忆功能是关闭的，并且在欧洲经济区、英国或瑞士上线时不可用。可在 Codex 设置中启用此功能，或在 `~/.codex/config.toml` 文件的 `[features]` 表中设置 `memories = true`。

记忆功能允许 Codex 将早期对话中的有用上下文带入到后续工作中。启用记忆后，Codex 可以记住稳定的偏好设置、重复的工作流程、技术栈、项目规范以及已知的注意事项，这样您无需在每个对话中重复说明相同的背景信息。

请将必需的团队指南保存在 `AGENTS.md` 或已签入的文档中。将记忆视为有帮助的本地回忆层，而非必须始终适用的规则的唯一来源。

[Chronicle](https://developers.openai.com/codex/memories/chronicle) 可帮助 Codex 从您的屏幕中恢复近期的工作上下文，以构建记忆。

## 启用记忆

在 Codex 应用中，在设置里启用记忆功能。

若通过配置方式设置，请在 `config.toml` 中添加功能标志：
```toml
[features]
memories = true
```
参阅[配置基础](https://developers.openai.com/codex/config-basic)了解 Codex 在何处存储用户级配置，以及 Codex 如何加载 `~/.codex/config.toml`。

## 记忆功能的工作原理

启用记忆功能后，Codex 可以将符合条件的先前线程中的有用上下文转换为本地记忆文件。Codex 会跳过活跃或短期的会话，对生成的记忆字段中的秘密信息进行脱敏处理，并在后台更新记忆，而不是在每个线程结束时立即更新。

在线程结束时，记忆可能不会立即更新。Codex 会等待线程闲置足够长的时间，以避免对仍在进行的工作进行总结。

当您的 Codex 速率限制剩余百分比低于配置阈值时，记忆生成也会跳过后台处理，从而避免在接近限制时消耗配额。

## 记忆存储

Codex 将记忆存储在您的 Codex 主目录下。默认情况下，该目录为 `~/.codex`。请参阅[配置与状态位置](https://developers.openai.com/codex/config-advanced#config-and-state-locations)了解 Codex 如何使用 `CODEX_HOME`。

主要的记忆文件位于 `~/.codex/memories/` 下，包括摘要、持久条目、最近输入以及来自先前线程的支撑证据。

请将这些文件视为生成的状态。在故障排除或共享您的 Codex 主目录之前可以检查它们，但不要将其作为主要的控制面来手动编辑。

## 按线程控制记忆

在 Codex 应用程序和 Codex TUI 中，使用 `/memories` 控制当前线程的记忆行为。线程级别的选择允许您决定当前线程是否可以使用现有记忆，以及 Codex 是否可以使用该线程生成未来的记忆。

线程级别的选择不会改变您的全局记忆设置。

## 配置

在 Codex 应用程序设置中启用记忆，或在 `config.toml` 的 `[features]` 部分设置 `memories = true`。

有关配置文件位置和完整的记忆相关设置列表，请参阅[配置参考](https://developers.openai.com/codex/config-reference)。

常见的记忆相关设置包括：

- `memories.generate_memories`：控制新创建的线程是否可作为记忆生成的输入存储。
- `memories.use_memories`：控制 Codex 是否将现有记忆注入到未来的会话中。
- `memories.disable_on_external_context`：当为 `true` 时，阻止使用了外部上下文（如 MCP 工具调用、网络搜索或工具搜索）的线程参与记忆生成。旧的 `memories.no_memories_if_mcp_or_web_search` 键仍可作为别名使用。
- `memories.min_rate_limit_remaining_percent`：控制开始记忆生成所需的最低 Codex 速率限制剩余百分比。
- `memories.extract_model`：覆盖用于每个线程记忆提取的模型。
- `memories.consolidation_model`：覆盖用于全局记忆整合的模型。

## 检查记忆

切勿在记忆中存储秘密信息。Codex 会对生成的记忆字段中的秘密信息进行脱敏处理，但在共享您的 Codex 主目录或生成的记忆产物之前，您仍应检查记忆文件。