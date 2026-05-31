> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 输出风格

> 使 Claude Code 适用于软件工程之外的场景

输出风格改变的是 Claude 的回应方式，而非 Claude 所掌握的知识。它们通过修改系统提示词来设定角色、语气和输出格式。当你发现自己每轮对话都要重复提示相同的语气或格式，或者希望 Claude 扮演软件工程师以外的角色时，可以使用输出风格。

自定义输出风格会将你的指令添加到系统提示词中，并让你选择是否保留 Claude Code 内置的软件工程指令。如果你只是改变 Claude 的沟通方式但仍需要编码功能，比如要求始终用图表回答问题，则保留内置指令。如果 Claude 完全不从事软件工程工作，比如作为写作助手或数据分析师使用，则不保留内置指令。

关于项目、约定或代码库的说明，请改用 [CLAUDE.md](/zh/memory)。

## 内置输出风格

Claude Code 的**默认**输出风格是现有的系统提示词，旨在帮助你高效完成软件工程任务。

还有三个额外的内置输出风格：

* **主动式（Proactive）**：Claude 立即执行，对常规决策做出合理假设而非停下来询问，并优先采取行动而非规划。这比 [auto 模式](/zh/permission-modes#eliminate-prompts-with-auto-mode) 提供的自主执行指导更强，且无需更改权限模式，因此在工具运行前你仍会看到权限提示。

* **解释式（Explanatory）**：在帮助你完成软件工程任务的过程中提供教育性的"洞见"。帮助你理解实现选择和代码库模式。

* **学习式（Learning）**：协作式的边做边学模式，Claude 不仅会在编码时分享"洞见"，还会请你亲自贡献一些小而关键的代码片段。Claude Code 会在你的代码中添加 `TODO(human)` 标记供你实现。

## 更改输出风格

运行 `/config` 并选择 **Output style**，从菜单中选择一个风格。你的选择会保存到[本地项目级别](/zh/settings)的 `.claude/settings.local.json` 中。

独立的 `/output-style` 命令已在 v2.1.73 中弃用，并在 v2.1.91 中移除。请使用 `/config` 或直接编辑 `outputStyle` 设置。

要不通过菜单直接设置风格，可以在设置文件中直接编辑 `outputStyle` 字段：

```json
{
  "outputStyle": "Explanatory"
}
```

输出风格是系统提示词的一部分，Claude Code 在会话开始时读取一次。更改在执行 `/clear` 或开启新会话后生效。参见 [Claude Code 如何使用提示词缓存](/zh/prompt-caching#changing-output-style)了解输出风格更改对缓存的影响。

## 创建自定义输出风格

自定义输出风格是一个 Markdown 文件：frontmatter 用于元数据，之后是要添加到系统提示词的指令。

1. **创建 Markdown 文件**

   将其保存在以下三个级别之一。文件名将成为风格名称，除非你在 frontmatter 中设置了 `name`。

   * 用户级别：`~/.claude/output-styles`
   * 项目级别：`.claude/output-styles`
   * 托管策略级别：[托管设置目录](/zh/settings#settings-files)内的 `.claude/output-styles`

2. **添加 frontmatter 和指令**

   决定是否保留 Claude Code 的软件工程指令。如果你只是改变 Claude 的沟通方式但仍希望它以相同方式编码，设置 `keep-coding-instructions: true`。如果 Claude 不从事软件工程工作，则不设置。

   以下示例在保留 Claude 编码行为的同时，要求每个解释都以图表开头：

   ```markdown
   ---
   name: Diagrams first
   description: Lead every explanation with a diagram
   keep-coding-instructions: true
   ---

   When explaining code, architecture, or data flow, start with a Mermaid diagram showing the structure, then explain in prose.

   ## Diagram conventions

   Use `flowchart TD` for control flow and `sequenceDiagram` for request paths. Keep diagrams under 15 nodes.
   ```

3. **切换到你的风格**

   运行 `/config` 并在 **Output style** 下选择你的风格。更改在 `/clear` 后或下次启动会话时生效。

[插件](/zh/plugins-reference) 也可以在 `output-styles/` 目录中提供输出风格。

### Frontmatter

输出风格文件支持以下 frontmatter 字段：

| Frontmatter                | 用途                                                                                                                                                                                                                                                  | 默认值                 |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `name`                     | 输出风格的名称（如果不是文件名）                                                                                                                                                                                                                         | 从文件名继承            |
| `description`              | 输出风格的描述，显示在 `/config` 选择器中                                                                                                                                                                                                                | 无                     |
| `keep-coding-instructions` | 保留 Claude Code 内置的软件工程指令                                                                                                                                                                                                                     | `false`                |
| `force-for-plugin`         | 仅限插件输出风格：当插件启用时自动应用此风格，无需用户选择。会覆盖用户的 `outputStyle` 设置。如果多个启用的插件设置了此项，Claude Code 使用第一个加载的。                                                                                                        | `false`                |

## 输出风格的工作原理

输出风格直接修改 Claude Code 的系统提示词。

* 所有输出风格都有自己的自定义指令，添加到系统提示词的末尾。
* 所有输出风格都会在对话过程中触发提醒，让 Claude 遵守输出风格指令。
* 自定义输出风格会省略 Claude Code 内置的软件工程指令，例如如何界定变更范围、编写注释和验证工作，除非 `keep-coding-instructions` 设置为 `true`。

Token 用量取决于风格。向系统提示词添加指令会增加输入 token，尽管提示词缓存在会话中首次请求后会降低此成本。内置的解释式和学习式风格默认产生比默认风格更长的回复，这会增加输出 token。对于自定义风格，输出 token 用量取决于你的指令要求 Claude 生成什么内容。

## 与其他相关功能的比较

有多个功能可以自定义 Claude Code 的行为。输出风格直接修改系统提示词并应用于每个回复。其他功能在不更改默认系统提示词的情况下添加指令，或将指令限定在特定任务范围内。

| 功能                       | 工作方式                                                     | 适用场景                                                             |
| :------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------- |
| 输出风格                    | 修改系统提示词                                                | 你希望每轮对话有不同的角色、语气或默认回复格式                           |
| [CLAUDE.md](/zh/memory)    | 在系统提示词之后添加用户消息                                    | Claude 应该始终了解你的项目约定和代码库上下文                            |
| `--append-system-prompt`   | 追加到系统提示词而不删除任何内容                                | 你希望为单次调用进行一次性补充                                         |
| [代理](/zh/sub-agents)     | 使用独立的系统提示词、模型和工具运行子代理                       | 你需要一个独立范围的助手来处理专注的任务                                |
| [技能](/zh/skills)         | 在被调用或相关时加载特定任务的指令                               | 你有一个可复用的工作流程                                              |

## 相关资源

* [设置](/zh/settings)：`outputStyle` 字段所在位置及设置优先级的工作方式
* [权限模式](/zh/permission-modes)：主动式风格与 auto 模式的对比
* [插件](/zh/plugins)：将输出风格与技能、钩子和代理一起打包和分发
* [调试配置](/zh/debug-your-config)：诊断输出风格未生效的原因
