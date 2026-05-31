# 速度

## 快速模式

Codex 提供了提升模型速度的能力，但会消耗更多积分。

快速模式将支持的模型速度提升 1.5 倍，积分消耗率高于标准模式。目前支持 GPT-5.5 和 GPT-5.4，GPT-5.5 的积分消耗为标准模式的 2.5 倍，GPT-5.4 为标准模式的 2 倍。

在 CLI 中使用 `/fast on`、`/fast off` 或 `/fast status` 来更改或查看当前设置。你也可以在 `config.toml` 中通过 `service_tier = "fast"` 加上 `[features].fast_mode = true` 来持久化默认配置。快速模式在 Codex IDE 扩展、Codex CLI 以及使用 ChatGPT 登录时的 Codex 应用中均可使用。使用 API 密钥时，Codex 按标准 API 定价计费，无法使用快速模式积分。

/src/videos/codex/fast-mode-demo.mp4

## Codex-Spark

GPT-5.3-Codex-Spark 是一个独立的快速、能力稍弱的 Codex 模型，专为近实时的即时编码迭代而优化。与通过更高积分消耗来加速支持模型的快速模式不同，Codex-Spark 是一个独立的模型选项，拥有自己的使用限制。

在研究预览期间，Codex-Spark 仅面向 ChatGPT Pro 订阅用户开放。
