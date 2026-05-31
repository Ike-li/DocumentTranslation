# 迁移到 Codex

使用导入流程将你的指令、配置、技能、MCP
服务器、钩子、子代理以及最近的会话从另一个代理迁移到 Codex。
Codex 会直接迁移它可以处理的部分，并可以打开一个后续对话线程来帮助迁移剩余内容。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Import from another agent in General settings"
    lightSrc="/images/codex/migrate/import-flow-light.png"
    darkSrc="/images/codex/migrate/import-flow-dark.png"
    maxHeight="520px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  />
</div>

## 开始迁移

1. 在 Codex 应用中打开 **Settings**。
2. 在 **General** 页面上，找到 **Import other agent setup**。
3. 选择 **Import** 或 **Import again**。
4. 查看 Codex 发现的内容，选择要导入的项目，然后选择 **Import**。
5. 导入完成后，如果你想检查结果，可以选择 **View imported files**。

## 迁移的工作原理

Codex 会同时检查你的用户级设置和当前项目。用户级设置来自你机器上的文件；项目级设置来自你打开的仓库中的文件。

当你导入时，Codex：

1. 检测它可以找到的设置。
2. 导入它可以直接迁移的选定项目。
3. 在导入完成后再次检查。
4. 如果仍有任何内容需要后续处理，会在新线程中提供继续迁移的选项。

## Codex 可以导入的内容

| 检测到的设置                           | Codex 目标                              |
| ------------------------------------- | --------------------------------------- |
| 指令文件                               | [`AGENTS.md`](https://developers.openai.com/codex/guides/agents-md) |
| `settings.json`                       | [`config.toml`](https://developers.openai.com/codex/config-basic)   |
| 技能                                  | [Codex 技能](https://developers.openai.com/codex/skills)            |
| 最近 30 天的会话                        | Codex 线程和项目                         |
| MCP 服务器配置                          | [Codex MCP 配置](https://developers.openai.com/codex/mcp)           |
| 钩子                                  | [Codex 钩子](https://developers.openai.com/codex/hooks)             |
| 斜杠命令                               | [Codex 技能](https://developers.openai.com/codex/skills)            |
| 子代理                                 | [Codex 代理](https://developers.openai.com/codex/subagents)         |

## 在新线程中完成剩余设置

某些检测到的设置没有直接的一对一映射到 Codex。对于这些项目，Codex 可以使用
[`migrate-to-codex`](https://github.com/openai/skills/tree/main/skills/.curated/migrate-to-codex)
技能打开一个新线程来帮助完成迁移。

当这种情况发生时，Codex 会显示剩余的设置并提供 **Continue in
Codex** 选项。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Additional setup found after import"
    lightSrc="/images/codex/migrate/additional-setup-light.png"
    darkSrc="/images/codex/migrate/additional-setup-dark.png"
    maxHeight="520px"
    class="p-6 sm:p-8"
    imageClass="!w-auto rounded-xl"
  />
</div>

如果你选择继续，Codex 会打开一个新线程，其中已填入剩余的工作。该线程将用户级设置与项目级设置分开，以便你查看每个剩余项目所属的位置。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Follow-up migration task in Codex"
    lightSrc="/images/codex/migrate/continue-with-codex-light.png"
    darkSrc="/images/codex/migrate/continue-with-codex-dark.png"
    maxHeight="320px"
    class="p-6 sm:p-8"
    imageClass="rounded-xl"
  />
</div>

## 导入后需要检查的内容

在依赖迁移的设置之前，请先检查以下内容，尤其是：

- 导入的技能和代理中的工具限制或权限。
- 使用自定义认证、头部、环境变量或传输方式的 MCP 服务器设置。
- 在 Codex 中行为可能不同的钩子。
- 需要手动后续处理的插件、市场或其他剩余设置。
- 依赖于参数、shell 插值或文件路径占位符的提示词模板或命令式提示词。

## 切换之后

导入完成后，打开你迁移的项目之一并从那里继续。如果你是 Codex 新手，请参阅[快速入门](https://developers.openai.com/codex/quickstart)了解其余设置流程。
