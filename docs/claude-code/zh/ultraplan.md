> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

# 用 ultraplan 在云端制定计划

> 从 CLI 启动一个计划，在 Claude Code on the web 上起草，然后远程执行或回到终端执行


  Ultraplan 处于研究预览阶段，需要 Claude Code v2.1.91 或更高版本。行为和能力可能会根据反馈调整。


Ultraplan 把规划任务从你的本地 CLI 交给一个运行在[计划模式](/en/permission-modes#analyze-before-you-edit-with-plan-mode)下的 [Claude Code on the web](/en/claude-code-on-the-web) 会话。Claude 在云端起草计划的同时，你可以继续在终端工作。当计划准备好后，你可以在浏览器中打开它，对特定章节发表评论、要求修订，并选择在哪里执行。

当你需要比终端更丰富的审阅界面时，这一功能很有用：

* **针对性反馈**：对计划中单个章节发表评论，而不是回复整体内容
* **无人值守起草**：计划在远程生成，你的终端可以继续做其他事
* **灵活执行**：批准在 Web 端运行计划并打开 PR，或把它发回终端

Ultraplan 需要 [Claude Code on the web](/en/claude-code-on-the-web) 账号和 GitHub 仓库。由于它运行在 Anthropic 的云基础设施上，因此使用 Amazon Bedrock、Google Cloud Vertex AI 或 Microsoft Foundry 时无法使用。云会话运行在你账号的默认[云环境](/en/claude-code-on-the-web#the-cloud-environment)中。如果你还没有云环境，ultraplan 在首次启动时会自动创建一个。

## 从 CLI 启动 ultraplan

在本地 CLI 会话中，可以通过三种方式启动 ultraplan：

* **命令**：运行 `/ultraplan`，后接你的提示词
* **关键词**：在普通提示词中任意位置包含 `ultraplan` 这个词
* **从本地计划启动**：当 Claude 完成本地计划并显示批准对话框时，选择 **No, refine with Ultraplan on Claude Code on the web**，把草稿送到云端继续迭代

例如，使用命令规划一次服务迁移：

```
/ultraplan migrate the auth service from sessions to JWTs
```

命令和关键词路径会在启动前打开一个确认对话框。本地计划路径会跳过该对话框，因为这一选择本身已经构成确认。如果 [Remote Control](/en/remote-control) 处于活动状态，ultraplan 启动时会断开连接，因为这两个功能都占用 claude.ai/code 界面，同时只能连接一个。

云会话启动后，CLI 的提示输入会显示一个状态指示器，反映远程会话的进展：

| 状态                         | 含义                                                            |
| :----------------------------- | :----------------------------------------------------------------- |
| `◇ ultraplan`                  | Claude 正在研究你的代码库并起草计划          |
| `◇ ultraplan needs your input` | Claude 有一个澄清问题；打开会话链接进行回复 |
| `◆ ultraplan ready`            | 计划已准备好，可以在浏览器中查看                        |

运行 `/tasks` 并选择 ultraplan 条目可以打开详情视图，查看会话链接、Agent 活动以及 **Stop ultraplan** 操作。停止会归档云会话并清除指示器；不会有任何内容保存到你的终端。

## 在浏览器中审阅与修订计划

当状态变为 `◆ ultraplan ready` 时，打开会话链接在 claude.ai 上查看计划。计划会出现在专门的审阅视图中：

* **行内评论**：选中任意段落留下评论，让 Claude 处理
* **Emoji 反应**：对某个章节做出反应，无需写完整评论即可表达赞同或担忧
* **大纲侧栏**：在计划的不同章节之间跳转

当你让 Claude 处理评论时，它会修订计划并提交一个更新草稿。你可以反复迭代，次数不限，直到选择在何处执行。

## 选择执行位置

当计划看起来满意时，你可以在浏览器中选择是让 Claude 在同一个云会话中实现，还是把它送回正在等待的终端。

### 在 Web 端执行

在浏览器中选择 **Approve Claude's plan and start coding**，让 Claude 在同一个 Claude Code on the web 会话中实现它。终端会显示一条确认信息，状态指示器消失，工作在云端继续。实现完成后，从 Web 界面[审阅 diff](/en/claude-code-on-the-web#review-changes) 并创建 PR。

### 把计划送回终端

在浏览器中选择 **Approve plan and teleport back to terminal**，可在本地实现计划并完整访问你的环境。当会话从 CLI 启动且终端仍在轮询时，会出现这个选项。Web 会话会被归档，避免并行继续运行。

终端会在标题为 **Ultraplan approved** 的对话框中展示计划，提供三个选项：

* **Implement here**：把计划注入当前对话，从你之前停下的位置继续
* **Start new session**：清空当前对话，仅以计划作为上下文重新开始
* **Cancel**：把计划保存到一个文件而不执行；Claude 会打印文件路径，你可以稍后回到那里

如果选择新建会话，Claude 会在顶部打印一个 `claude --resume` 命令，方便你之后回到之前的对话。

## 相关资源

* [Claude Code on the web](/en/claude-code-on-the-web)：ultraplan 运行的云基础设施
* [计划模式](/en/permission-modes#analyze-before-you-edit-with-plan-mode)：本地会话中规划的工作方式
* [用 ultrareview 找 Bug](/en/ultrareview)：与 ultraplan 互补的代码评审能力，用于在合并前发现问题
* [Remote Control](/en/remote-control)：让 claude.ai/code 界面连接到运行在你自己机器上的会话
