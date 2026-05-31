# Codex 模型

## 推荐模型

<div class="not-prose grid gap-6 md:grid-cols-2 xl:grid-cols-3">

**gpt-5.5**
OpenAI 最新的前沿模型，适用于 Codex 中的复杂编码、计算机操作、知识工作和研究工作流。

- **能力**：★★★★★
- **速度**：★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：不支持
- ChatGPT 积分：支持
- API 访问：支持

**gpt-5.4**
旗舰前沿模型，适用于专业工作，将 GPT-5.3-Codex 行业领先的编码能力与更强的推理、工具使用和智能体工作流相结合。

- **能力**：★★★★★
- **速度**：★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：不支持
- ChatGPT 积分：支持
- API 访问：支持

**gpt-5.4-mini**
快速、高效的迷你模型，适用于响应式编码任务和子代理。

- **能力**：★★★
- **速度**：★★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：不支持
- ChatGPT 积分：支持
- API 访问：支持

**gpt-5.3-codex**
行业领先的编码模型，适用于复杂软件工程。其编码能力现在也为 GPT-5.4 提供支持。

- **能力**：★★★★★
- **速度**：★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：支持
- ChatGPT 积分：支持
- API 访问：支持

**gpt-5.3-codex-spark**
纯文本研究预览模型，针对近乎即时的实时编码迭代进行了优化。面向 ChatGPT Pro 用户开放。

- **能力**：★★★
- **速度**：★★★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：不支持
- ChatGPT 积分：不支持
- API 访问：不支持

</div>

在 Codex 中执行大多数任务时，建议从 `gpt-5.5` 开始。它在复杂编码、计算机操作、知识工作和研究工作流方面表现最强。GPT-5.5 目前在 Codex 中可通过 ChatGPT 登录或 API 密钥认证使用。当你需要更快速、更低成本的选项来处理较轻的编码任务或子代理时，请使用 `gpt-5.4-mini`。`gpt-5.3-codex-spark` 模型目前作为研究预览面向 ChatGPT Pro 订阅用户开放，针对近乎即时的实时编码迭代进行了优化。

## 备选模型

<div class="not-prose grid gap-4 md:grid-cols-2 xl:grid-cols-3">

**gpt-5.2**
上一代通用模型，适用于编码和智能体任务，包括需要更深入推理的复杂调试任务。

- **能力**：★★★★
- **速度**：★★★
- Codex CLI & SDK：支持
- Codex 应用 & IDE 扩展：支持
- Codex Cloud：不支持
- ChatGPT 积分：支持
- API 访问：支持

</div>

## 其他模型

使用 ChatGPT 登录时，Codex 与上述列出的模型配合使用效果最佳。

你也可以将 Codex 指向任何支持 [Chat Completions](https://platform.openai.com/docs/api-reference/chat) 或 [Responses API](https://platform.openai.com/docs/api-reference/responses) 的模型和提供商，以满足你的特定用例。

Chat Completions API 的支持已被弃用，将在未来的 Codex 版本中移除。

## 配置模型

### 配置默认本地模型

Codex CLI 和 IDE 扩展使用相同的 `config.toml` [配置文件](https://developers.openai.com/codex/config-basic)。要指定模型，请在配置文件中添加 `model` 条目。如果未指定模型，Codex 应用、CLI 或 IDE 扩展将默认使用推荐模型。

```toml
model = "gpt-5.5"
```


### 临时选择不同的本地模型

在 Codex CLI 中，你可以在活跃会话期间使用 `/model` 命令切换模型。在 IDE 扩展中，你可以使用输入框下方的模型选择器来选择模型。

要使用特定模型启动新的 Codex CLI 会话，或为 `codex exec` 指定模型，可以使用 `--model`/`-m` 标志：

```bash
codex -m gpt-5.5
```


### 为云端任务选择模型

目前，你无法更改 Codex 云端任务的默认模型。
