> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 最新动态

> Claude Code 重要功能的每周摘要，包含代码片段、演示及功能价值说明。

每周开发摘要重点介绍最可能改变你工作方式的功能。每个条目包含可运行的代码、简短演示以及完整文档链接。有关每个 bug 修复和小幅改进，请参阅[更新日志](/zh/changelog)。

<Update label="第 20 周" description="2026 年 5 月 11–15 日" tags={["v2.1.139–v2.1.142"]}>
  **Agent 视图**：`claude agents` 打开一个统一界面，展示所有 Claude Code 会话，包括正在运行的、等待你处理的以及已完成的。

  本周还有：**`/goal`** 让 Claude 跨轮次持续工作直到满足完成条件；**快速模式**现在默认使用 Opus 4.7；**回退菜单**可通过"总结到此处"压缩之前的上下文。

  [阅读第 20 周摘要 →](/zh/whats-new/2026-w20)
</Update>

<Update label="第 19 周" description="2026 年 5 月 4–8 日" tags={["v2.1.128–v2.1.136"]}>
  **插件支持从 `.zip` 归档和 URL 加载**：`--plugin-dir` 现在接受 `.zip` 文件，`--plugin-url` 可为当前会话获取插件归档。

  本周还有：**`worktree.baseRef`** 选择新工作树是从远程默认分支还是本地 `HEAD` 创建分支；**自动模式硬拒绝规则**无条件阻止操作，无论允许例外如何；**钩子可通过 `effort.level` 和 `$CLAUDE_EFFORT` 查看当前工作强度级别**。

  [阅读第 19 周摘要 →](/zh/whats-new/2026-w19)
</Update>

<Update label="第 18 周" description="2026 年 4 月 27 日 – 5 月 1 日" tags={["v2.1.120–v2.1.126"]}>
  **无需 Git Bash 的 Windows 支持**：不再要求安装 Git for Windows，当 Bash 不可用时 Claude Code 使用 PowerShell 作为 shell 工具。

  本周还有：**`claude ultrareview`** 将云端代码审查引入 CI 和脚本；**`claude project purge`** 清理项目的本地状态；在 `/resume` 中粘贴 **PR URL** 可找到创建该 PR 的会话。

  [阅读第 18 周摘要 →](/zh/whats-new/2026-w18)
</Update>

<Update label="第 17 周" description="2026 年 4 月 20–24 日" tags={["v2.1.114–v2.1.119"]}>
  **`/ultrareview`** 以公开研究预览形式上线：一队 bug 搜索代理在云端运行，发现结果自动回到你的 CLI 或桌面端。

  本周还有：**会话回顾**展示终端失去焦点期间发生的事情；**自定义主题**允许通过 `/theme` 或插件构建和发布配色方案；**网页版 Claude Code** 重新设计，新增会话侧边栏和拖放布局。

  [阅读第 17 周摘要 →](/zh/whats-new/2026-w17)
</Update>

<Update label="第 16 周" description="2026 年 4 月 13–17 日" tags={["v2.1.105–v2.1.113"]}>
  **Claude Opus 4.7** 成为 Max 和 Team Premium 的新默认模型，新增 `xhigh` 工作强度级别作为大多数编码工作的推荐设置，并提供交互式 `/effort` 滑块进行调节。

  本周还有：网页版 Claude Code 上的**例程（Routines）**可按计划、GitHub 事件或 API 调用触发模板化云端代理；**移动端推送通知**在长时间任务完成或 Claude 需要你时通知手机；`/usage` 显示影响用量限制的因素；CLI 迁移为原生二进制文件。

  [阅读第 16 周摘要 →](/zh/whats-new/2026-w16)
</Update>

<Update label="第 15 周" description="2026 年 4 月 6–10 日" tags={["v2.1.92–v2.1.101"]}>
  **Ultraplan** 进入早期预览：从 CLI 在云端起草计划，在网页编辑器中审查和评论，然后远程运行或拉回本地。首次运行会自动为你创建云环境。

  本周还有：**Monitor** 工具将后台事件流式传输到对话中，使 Claude 可以跟踪日志并实时响应；`/loop` 在省略间隔时自动调整节奏；`/team-onboarding` 将你的设置打包为可回放的指南；`/autofix-pr` 从终端开启 PR 自动修复。

  [阅读第 15 周摘要 →](/zh/whats-new/2026-w15)
</Update>

<Update label="第 14 周" description="2026 年 3 月 30 日 – 4 月 3 日" tags={["v2.1.86–v2.1.91"]}>
  **计算机使用**以研究预览形式登陆 CLI：Claude 可以打开原生应用、点击 UI 并从终端验证更改。最适合完成只有 GUI 才能验证的闭环任务。

  本周还有：`/powerup` 交互式课程、无闪烁的备用屏幕渲染、每个工具最高 500K 的 MCP 结果大小覆盖，以及 Bash 工具 `PATH` 上的插件可执行文件。

  [阅读第 14 周摘要 →](/zh/whats-new/2026-w14)
</Update>

<Update label="第 13 周" description="2026 年 3 月 23–27 日" tags={["v2.1.83–v2.1.85"]}>
  **自动模式**以研究预览形式上线：分类器处理你的权限提示，安全操作无需中断即可执行，风险操作则被阻止。这是全部批准和 `--dangerously-skip-permissions` 之间的折中方案。

  本周还有：桌面端的计算机使用、网页端的 PR 自动修复、使用 `/` 进行转录搜索、Windows 原生 PowerShell 工具，以及条件式 `if` 钩子。

  [阅读第 13 周摘要 →](/zh/whats-new/2026-w13)
</Update>
