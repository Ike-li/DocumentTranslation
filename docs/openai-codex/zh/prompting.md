# 提示词

## 提示词

你通过发送提示词（用户消息）来与 Codex 交互，描述你希望它执行的操作。

提示词示例：

```text
Explain how the transform module works and how other modules use it.
```

```text
Add a new command-line option `--json` that outputs JSON.
```

当你提交提示词后，Codex 会进入循环工作模式：调用模型，然后执行模型输出所指示的操作，例如读取文件、编辑文件和工具调用。当任务完成或你取消时，此过程结束。

与 ChatGPT 类似，Codex 的效果取决于你给出的指令质量。以下是我们发现的一些有助于提示 Codex 的技巧：

- 当 Codex 能够验证自己的工作时，它会产生更高质量的输出。请包含复现问题、验证功能以及运行代码检查和预提交检查的步骤。
- 当你将复杂工作拆分为更小、更聚焦的步骤时，Codex 能更好地处理。较小的任务更容易让 Codex 测试，也更容易让你审查。如果你不确定如何拆分任务，可以让 Codex 提出一个计划。

有关提示 Codex 的更多思路，请参考[工作流](https://developers.openai.com/codex/workflows)。

## 线程

线程是一个单独的会话：你的提示词加上模型输出和后续的工具调用。一个线程可以包含多个提示词。例如，你的第一个提示词可能要求 Codex 实现一个功能，后续提示词可能要求它添加测试。

当 Codex 正在积极处理线程时，该线程处于"运行中"状态。你可以同时运行多个线程，但应避免让两个线程修改相同的文件。你也可以稍后通过继续发送提示词来恢复线程。

线程可以在本地或云端运行：

- **本地线程**在你的机器上运行。Codex 可以读取和编辑你的文件并运行命令，因此你可以看到变更内容并使用现有工具。为降低工作区外发生意外更改的风险，本地线程在[沙箱](https://developers.openai.com/codex/agent-approvals-security)中运行。
- **云端线程**在隔离的[环境](https://developers.openai.com/codex/cloud/environments)中运行。Codex 会克隆你的仓库并检出正在处理的分支。当你想并行运行工作或从其他设备委派任务时，云端线程非常有用。要将云端线程与你的仓库配合使用，请先将代码推送到 GitHub。你也可以[从本地机器委派任务](https://developers.openai.com/codex/ide/cloud-tasks)，这会包含你当前的工作状态。

在 Codex 应用中，你也可以在不选择项目的情况下开始聊天。聊天不绑定到已保存的仓库或项目文件夹。将它们用于研究、规划、连接工具的工作流，或其他 Codex 不应从代码库开始的工作。聊天使用 Codex 主目录下的 Codex 管理的 `threads` 目录作为工作位置。默认情况下，该位置为 `~/.codex/threads`。要更改此状态的基础位置，请设置 `CODEX_HOME`；参见[配置和状态位置](https://developers.openai.com/codex/config-advanced#config-and-state-locations)。

## 上下文

当你提交提示词时，请包含 Codex 可以使用的上下文，例如对相关文件和图片的引用。Codex IDE 扩展会自动包含打开的文件列表和选定的文本范围作为上下文。

当代理工作时，它还会从文件内容、工具输出以及已完成和仍需完成的工作记录中收集上下文。

线程中的所有信息必须适合模型的**上下文窗口**，其大小因模型而异。Codex 会监控并报告剩余空间。对于较长的任务，Codex 可能会自动**压缩**上下文，总结相关信息并丢弃不太相关的细节。通过反复压缩，Codex 可以在多个步骤中继续处理复杂任务。

## 目标模式

目标模式为 Codex 提供了一个持久的目标，以便在较长时间的任务中持续推进。当工作可能需要多个步骤，或者当 Codex 需要一个清晰的完成定义以便在工作中持续检查时，请使用此模式。

<CodexScreenshot
  alt="Codex app goal progress controls above the composer"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/>

当你设置目标时，目标文本既作为起始提示词，也作为完成标准。Codex 使用它来决定下一步做什么以及任务是否已完成。在 [Codex 应用](https://developers.openai.com/codex/app/commands#set-or-manage-a-goal-with-goal)、[IDE 扩展](https://developers.openai.com/codex/ide/slash-commands)或 [CLI](https://developers.openai.com/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal) 中使用 `/goal` 启动目标模式。

如果 `/goal` 未出现在斜杠命令列表中，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals` 或让 Codex 运行它。在 Codex 应用中，进度会显示在编辑器上方，并提供暂停、恢复、编辑或清除目标的控件。

编写目标时，应让 Codex 能够判断是否已成功。好的目标包含具体的成果、可衡量的指标或测试标准。例如：

```text
Migrate this codebase from JavaScript to TypeScript. The app should compile in
strict mode without explicit `any` type definitions.
```

```text
Reduce the time to interactive of the home page to below 1 second.
```

如果目标难以预先定义，可以先使用 `/plan` 并让 Codex 在实现前帮助塑造目标。你也可以让 Codex 向你提问并起草一个具有明确成功标准的目标。

在目标启动后，你可以继续引导 Codex。发送后续消息以调整约束条件，例如要求 Codex 使用特定库或避免某种方法。当你想要状态回顾或解释而不中断主任务时，可以使用旁路聊天。对于长时间运行的工作，在失去连接前暂停目标，准备好继续时再恢复或编辑它。
