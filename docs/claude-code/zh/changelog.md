> ## 文档索引
> 获取完整文档索引请访问：https://code.claude.com/docs/llms.txt
> 使用此文件了解所有可用页面，再进一步探索。

# 更新日志

> Claude Code 的发布说明，包含按版本划分的新功能、改进和错误修复。

本页面根据 [GitHub 上的 CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) 生成。

运行 `claude --version` 检查您安装的版本。

  * 自动模式现已在 Bedrock、Vertex 和 Foundry 平台上的 Opus 4.7 和 Opus 4.8 版本中可用。通过设置 `CLAUDE_CODE_ENABLE_AUTO_MODE=1` 即可启用。



  * `.claude/skills` 目录中的插件现可自动加载，无需依赖市场
  * 新增 `claude plugin init <name>` 命令，用于在 `.claude/skills` 中搭建新插件框架
  * 为 `/plugin` 参数添加了自动补全功能：支持子命令、已安装插件名称及已知市场的插件
  * `claude agents`：现在调度的会话会遵循 `settings.json` 中的 `agent` 字段设置，可通过 `--agent <name>` 进行覆盖
  * `EnterWorktree` 现在可在会话中途切换由 Claude 管理的工作树
  * 当设置 `OTEL_LOG_TOOL_DETAILS=1` 时，`tool_decision` 遥测事件现在会包含 `tool_parameters`（bash 命令、MCP/技能名称）
  * 代理完成操作后，由 Claude 管理的工作树现在会保持解锁状态，以便 `git worktree remove`/`prune` 可以进行清理
  * 修复了通过粘贴、MCP 或对话框附加的不可处理图像（零字节、损坏）导致请求崩溃，而非显示为文本占位符的问题
  * 修复了在桌面应用、IDE 扩展或 SDK 中使用时，沙箱网络权限提示在自动和绕过权限模式下意外出现的问题
  * 修复了 `claude agents` 中已完成会话在空闲子代理仍处于驻留状态或已泄漏后台 shell 时未能正确退出的问题
  * 修复了 `claude agents` 中按 Esc 键无法取消缓慢的"正在打开…"状态，导致列表无响应的问题
  * 修复了位于 `.claude/worktrees/` 下的后台代理工作树在 30 天作业保留清理后成为孤立状态的问题
  * 修复了从睡眠/唤醒状态重新附加的后台会话未向模型告知正确日期的问题
  * 修复了在启用了 `set-clipboard on` 的 tmux 环境中，`claude agents` 的选中复制功能无法到达系统剪贴板的问题（2.1.153 版本回归）
  * 修复了 `--resume` 未能报告上一个 Claude Code 进程退出时仍在运行的后台子代理的问题
  * 修复了 `--resume` 会话选择器在全屏模式退出后将其内容留在终端上的问题
  * 修复了 `--worktree` 和 `--worktree --tmux` 返回规范仓库根目录而非当前关联工作树的问题
  * 修复了当所选模型已是其系列中最新版本时，`/model` 选择器显示不正确的"有新版本可用"提示的问题；固定模型行现在显示模型的描述而非其原始 ID
  * 修复了全屏模式下进行中的消息文本出现字面 Markdown 标记（反引号、星号）的问题
  * 修复了启动时在批准受管设置安全对话框后终端冻结的问题
  * 修复了终端 UI 重绘后回滚中偶尔出现重复行的罕见问题
  * 修复了在 VS Code、Cursor 和 Windsurf 集成终端中右键粘贴会复制剪贴板内容的问题
  * WSL：修复了图像粘贴（`alt+v` 快捷键）、Windows 11 上的截图粘贴，并添加了从 Windows 资源管理器拖拽图像的支持
  * 通过消除冗余的消息渲染重计算，提升了长时间和恢复会话的性能
  * `/terminal-setup` 现在会禁用 VS Code/Cursor/Windsurf 集成终端中的 GPU 加速，以防止文本渲染乱码
  * 本周功能学分的认领状态现在作为通知显示在状态区域，而非提示词上方的一行
  * `claude agents`：调度输入中的斜杠命令自动补全现在支持子字符串匹配
  * 移除了"bash 命令将在沙箱中运行"的启动横幅——沙箱状态仍在 `/status` 和命令被阻止时显示
  * 移除了"/ide for …"的启动提示消息
  * [IDE] 修复了在后台子代理运行时点击停止按钮实际未能停止它的问题
  * [VSCode] 修复了快速模式指示器未出现在 Opus 4.8 上的问题
  * 现在，在工作流触发关键词后立即按退格键会取消工作流请求（与 alt+w 相同），而非删除一个字符
  * 在 `/config` 中添加了"工作流关键词触发"设置，以阻止提示词中的"workflow"一词触发动态工作流



  * 修复了在使用 Opus 4.8 时，思维块被修改导致 API 错误的问题。



  * Opus 4.8 来了！现默认为高努力模式 · 用 `/effort xhigh` 处理你最棘手的任务
  * 引入动态工作流：让 Claude 创建一个工作流，它将在后台协调数十至数百个代理的工作，让你能够处理更大、更复杂的任务。运行 `/workflows` 查看你的运行记录
  * Opus 4.8 的快速模式现已以极低的成本提供：2倍标准费率换取 2.5 倍速度
  * 除 Haiku、Sonnet 以及 Opus 4.7 及更早版本外，精简系统提示词现为所有模型的默认设置
  * Claude 现在仅在其确实无法自行做出决定时，才保留多选题提示，而非在已有足够上下文可以继续时询问
  * `/simplify` 现在运行仅清理审查（复用、简化、效率、层级），并应用修复，而非运行完整的 `/code-review --fix` 错误排查审查
  * 为更清晰起见，将 `/effort` 滑块标签从“速度”/“智能”重命名为“更快”/“更智能”
  * `claude agents`：输入 `! <命令>` 以运行一个可附着和分离的后台会话中的 shell 命令。也可使用 `claude --bg --exec '<命令>'`
  * `claude agents`：`/logout` 现在会将你登出，而非发送到后台会话
  * `←←` 打开代理视图现可在 Bedrock、Vertex、Foundry 上以及遥测禁用时使用
  * Chrome 中的 Claude：通过 `/chrome` → “选择浏览器...” 选择使用哪个已连接的浏览器，或在浏览器操作运行且有多个连接时在聊天中选择
  * 插件现可在 `plugin.json` 或市场条目中声明 `defaultEnabled: false`；通过 `/plugin` 或 `claude plugin enable` 启用它们。已启用插件的依赖项仍会自动启用
  * `/plugin` 发现选项卡现会固定相关信号与当前目录匹配的插件，并标注“为此目录建议”
  * 流式工具执行现始终启用，包括遥测禁用或在 Bedrock/Vertex/Foundry 上时（此前处于功能标志之后）
  * Stdio MCP 服务器子进程现会在其环境中接收 `CLAUDE_CODE_SESSION_ID` 和 `CLAUDECODE=1`
  * `claude mcp list`/`get` 现在输出通过管道传输时，会将未批准的 `.mcp.json` 服务器显示为 `⏸ 等待批准`，而非自动批准并连接
  * `/remote-control` 自动完成现会在远程控制已激活时显示“断开远程控制”
  * 在 `/claude-api` 技能中添加了 Claude Opus 4.8 支持和 4.7 → 4.8 迁移指南
  * 废弃了 `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE`（将于 06/01 移除）。要在 Opus 4.6 上使用快速模式，请先用 `/model claude-opus-4-6[1m]` 切换，然后 `/fast on`
  * 改进了自动模式分类器对数据泄露的检测，特别是对仓库内容的批量传输
  * 修复了当 `HOME` 带有尾部斜杠时，`rm -rf $HOME` 未被阻止为危险路径的问题
  * 修复了在同一会话中，沙箱与非沙箱 Bash 命令中 `$TMPDIR` 解析为不同目录的问题
  * 修复了当 Claude Code 主题与终端背景不匹配时，`claude agents` 中不可读的高亮行文本问题
  * 修复了在某些 1M 上下文模型上，后台代理完成通知触发过早的“超出上下文”行为
  * 修复了当计划 `/command` 触发时，后台会话分类器丢失用户目标的问题
  * 修复了 Claude Code 更新后固定的后台会话每分钟重新生成，导致空闲时重复的代理启动通知和进程抖动
  * 修复了后台会话在空闲宽限期后仍停留在“已阻止”、“运行中”或“工作”状态未退出的问题
  * 修复了后台会话中的子代理绕过工作树隔离防护并写入共享检出的问题
  * 修复了在 macOS 上，守护进程退出后，孤立的 `claude --bg-pty-host` 进程以 100% CPU 空转的问题
  * 修复了选项对话框中分隔线下方显示的选项的数字键快捷键无效的问题
  * 修复了在链接的工作树内生成子代理或调用 `EnterWorktree` 时，`worktree.baseRef: "head"` 解析为主检出点的 HEAD 而非当前工作树的 HEAD
  * 修复了当前一行恰好在终端宽度结束时，换行行首出现杂散空格的问题
  * 修复了在 VS Code 中，通过限制思考旋转器产生的不同颜色数量，解决了间歇性终端渲染损坏的问题
  * 修复了当计划模式提示词以粘贴的图像或文本开头时，计划文件名包含 `[Image #N]` / `[Pasted text #N]` 占位符的问题
  * 修复了在彩色工具输出上出现幻像展开/点击提示的问题：适合屏幕显示的短 ANSI 彩色行不再显示“ctrl+o 展开”提示
  * 修复了托管设置中单个无效的 `allowedMcpServers`/`deniedMcpServers` 条目会丢弃所有托管设置策略的问题；现在坏条目会被丢弃，并显示 `claude doctor` 警告
  * 修复了在设置 `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` 时，不支持 effort 参数的模型出现 API 400 错误的问题
  * Windows：修复了因 `claude.exe` 正在使用而导致更新失败时，仅显示通用错误而未提示关闭其他会话并重试的问题
  * 移除了快捷键帮助面板中过时的“& 用于后台”提示
  * \[VSCode] 自动模式不再需要绕过权限设置即可出现在模式选择器中，新会话屏幕上的可关闭通知在首次激活时会解释自动模式
  * 修复了在仅运行工作流时，提示词下方的任务面板显示杂散的不可选择的“main”行的问题
  * 修复了当 MCP 服务器具有长或多行工具名称或长描述时，/mcp 工具列表和工具详细信息的渲染问题
  * 修复了在快速模式开启时，API（按量付费）用户的默认选项未显示快速模式定价的问题
  * 修复了当安全分类器在推理过程中耗尽输出 token 时，自动模式错误地以“无法评估此操作”阻止操作的问题



  * 为 `github`/`git` 插件市场源添加了 `skipLfs` 选项，可在克隆和更新时跳过 Git LFS 下载
  * Claude Code 现在会在你的 npm 全局安装无法自动更新时显示一次性通知；`/doctor` 会列出修复方法
  * 状态行命令现在接收 `COLUMNS` 和 `LINES` 环境变量，以便脚本根据终端宽度调整输出大小
  * `claude agents`：分派输入中的自动补全现在会建议原生斜杠命令和内置技能，而不仅仅是项目技能
  * `claude agents`：PR 列现在对单个 PR 显示 `PR #N`，对多个 PR 显示 `N PRs`
  * `claude doctor` 现在会显示你上次更新尝试的结果
  * 将 MCP 服务器和连接器分开的“需要身份验证”启动通知合并为一条消息
  * macOS：后台代理现在在隐私与安全性中显示为“Claude Code”，并在升级后保留其权限授权
  * 修复了在没有可选 GET SSE 流的情况下，有状态 MCP 服务器在 `tools/list` 上重连循环的问题（v2.1.147 中的回归）
  * 修复了自定义 API 网关可能接收用户 Anthropic OAuth 凭据而非网关自身令牌的回归问题
  * 修复了子代理（Agent 工具）前置元数据 MCP 服务器忽略 `--strict-mcp-config`、`--bare`、远程模式、企业托管 MCP 配置以及托管设置 MCP 服务器允许/拒绝策略的问题
  * `--strict-mcp-config` 不再从显式传递的代理定义（`--agents` / SDK `agents`）中剥离内联 `mcpServers`，并且被阻止的子代理 MCP 服务器现在会显示可见警告
  * 修复了 Windows PowerShell 安装程序在安装实际失败时报告“安装完成！”的问题
  * 修复了 `claude update` 对于 npm 安装，安装的是最新版本而非配置的发布渠道版本的问题
  * 修复了在存储了大量会话的机器上，通过转录文件路径恢复会话时内存使用过多（数 GB）的问题
  * 修复了 `claude agents` 和 `claude --bg` 即使在升级后仍在二进制接管支持之前启动的陈旧守护进程上运行的问题
  * 修复了在 stream-json 模式下，当 stdin 关闭而没有 EOF 时 CLI 可能无法退出的问题，这会留下陈旧的会话标记
  * 修复了 Claude 响应中格式错误的 `file://` 链接在终端中不可点击的问题
  * 修复了 `claude --help` 在宽度小于 92 列的终端上输出未换行的问题
  * 修复了 MCP 工具进度通知在折叠工具视图中不渲染的问题
  * 修复了 `subagent_type: 'claude'` 的 `Agent` 工具在未记录的临时工作树中运行的问题，这可能导致写入到 gitignore 路径的输出被静默丢弃
  * 当 Claude 正在响应时使用 `/bg` 现在会在后台会话中继续响应，而不是将其丢弃
  * 修复了在后台会话中任务运行时 `/btw` 键盘快捷键无响应的问题
  * 修复了后台会话将临时文件写入 `$CLAUDE_JOB_DIR` 触发“敏感文件”权限提示的问题
  * 修复了恢复其工作目录已被删除的后台代理时显示截断的堆栈跟踪而不是清晰错误消息的问题
  * 修复了 `EnterWorktree` 在后台会话中无法立即可用的问题（之前需要先使用 `ToolSearch`）
  * 修复了在 iTerm2/Terminal.app 中 `cmd+k` 不会重绘已附加的后台会话的问题
  * 修复了在 Windows 上已附加的后台会话中，IME 候选窗口出现在屏幕底部而非输入光标旁边的问题
  * 修复了在仅支持 256 色的终端中，从渲染了文件差异的代理附加到后台代理时背景颜色溢出的问题
  * 修复了在 tmux 内的后台会话中附加时，`/copy` 和选中复制静默更新系统剪贴板失败的问题
  * 修复了在启用远程控制的情况下打开 `claude agents`，退出后在代码选项卡上留下僵尸会话条目的问题
  * 修复了后台会话中的 `/rename` 不会立即更新会话横幅的问题
  * 修复了 Windows 更新回滚：如果 Windows 更新失败，Claude Code 现在会通过复制恢复原始可执行文件，并告诉你如何恢复
  * \[VSCode] 修复了在 Windows 上关闭 VS Code 时 Claude Code 进程未正确关闭，导致错误的“非正常退出”报告和孤立 MCP 服务器的问题
  * `/model` 现在会将你的选择保存为新会话的默认设置（与 IDE 一致）。在选择器中按 `s` 可仅切换当前会话的模型。
  * 如果你自定义了 `modelPicker:setAsDefault` 键绑定，请在 keybindings.json 中将其重命名为 `modelPicker:thisSessionOnly`（`d` 操作已被 `s` 替换）



  * `/code-review --fix` 现在会在代码审查后自动将审查发现的问题应用到您的工作树中，突出显示代码重用、简化和效率建议；`/simplify` 现在会调用 `/code-review --fix`
  * 技能和斜杠命令现在可以在 frontmatter 中设置 `disallowed-tools`，以便在技能激活期间从模型中移除相关工具
  * 新增了 `/reload-skills` 命令，可以在不重启会话的情况下重新扫描技能目录
  * `SessionStart` 钩子现在可以返回 `reloadSkills: true` 以重新扫描技能目录，使得由钩子安装的技能在同一会话中立即可用
  * `SessionStart` 钩子现在可以在启动和恢复时通过 `hookSpecificOutput.sessionTitle` 设置会话标题
  * 新增了 `MessageDisplay` 钩子事件，允许钩子在助手消息显示时对其进行转换或隐藏
  * 新增了 `pluginSuggestionMarketplaces` 托管设置：管理员可以允许列出组织的插件市场，以便通过上下文感知提示建议这些市场的插件
  * `claude plugin marketplace remove` 现在接受 `--scope user|project|local` 参数，与 `marketplace add`、`install` 和 `uninstall` 保持对称
  * Claude Code 现在会在主模型未找到时，为本次会话的剩余部分切换到您配置的 `--fallback-model`，而不是让每个请求都失败
  * 自动模式不再需要选择同意
  * Vim 模式：在 NORMAL 模式下，`/` 键现在会打开反向历史记录搜索（类似 Ctrl+R），与 bash/zsh 的 vi 模式匹配
  * `/usage` 的详细信息现在包含大型会话文件；文件会使用流式读取进行扫描，因此内存使用保持稳定
  * 折叠组中的思考摘要现在至少可读 3 秒，渲染为 markdown，并且最多显示 10 行（`Ctrl+O` 可显示完整的思考内容）
  * 在全屏模式下，“思考了 N 秒”的指示器现在会在模型思考时实时计数，并且在您中断思考时保持其值不变
  * 简化了 Workflow 工具的内联进度显示——实时代理计数现在仅显示在提示符下方的持久工作流状态行中
  * 响应后的计时器现在会在后台代理或工作流仍在运行时显示“正在等待 N 个后台代理/工作流完成”，并在其结果处理完成后报告累计时间
  * 新增了会话入口点作为 OpenTelemetry 指标属性（`app.entrypoint`，通过 `OTEL_METRICS_INCLUDE_ENTRYPOINT=true` 启用）
  * 修复了在非常长的会话中终端样式降级的问题，通过回收渲染器的样式池来实现
  * 修复了沙箱启用警告在紧凑启动模式下不显示的问题——现在它在每种布局中都会显示
  * 修复了工具运行时加载旋转器显示“仍在思考”/“即将完成思考”的问题，并在每次工具运行后将思考状态重置为“思考中”
  * 修复了焦点模式在没有隐藏活动的轮次中显示虚假的“已隐藏 N 条消息”计数的问题
  * 修复了在展开的工具结果中点击链接会导致部分折叠而不是打开链接的问题
  * 修复了 markdown 表格单元格边框继承内联代码颜色、续行换行丢失样式以及空标题单元格在窄终端堆叠布局中显示标签的问题
  * 修复了具有相同命令但不同环境变量的插件 MCP 服务器被错误去重的问题
  * 修复了 `/doctor` 对引用已删除市场或已丢弃插件的过时 `enabledPlugins` 条目报告“市场未找到”或“插件未找到”的问题
  * 修复了跟踪 git 分支的插件在插件注册表重建后不再接收更新的问题
  * 修复了在启用出口代理时，远程 MCP 服务器在 Claude Code Remote 会话中连接失败的问题
  * 修复了在对话没有消息或在解析为相同底层值的工作量级别之间切换时出现工作量切换确认对话框的问题
  * 修复了在 `--bare` 模式下运行或禁用附件时，Agent 工具描述引用了从未传递的代理列表的问题
  * 修复了在子代理被取消后接受过时的权限提示时，`claude agents` 中的后台工作进程崩溃的问题
  * 修复了当 API 仅通过嵌套的 `cache_creation` 细分报告缓存写入时，`cache_creation_input_tokens` 在转录和结果使用量中报告为 0 的问题
  * 修复了当远程控制已启用时，PushNotification 工具在 SDK 托管的会话中错误地报告“未发送移动推送（远程控制未激活）”的问题
  * 修复了当模型或登录切换在历史记录中留下过时的思考块签名时，会话卡住的问题；现在会主动剥离这些签名，并具有重试安全网



  * 内部基础设施改进（无面向用户的变化）



  * `/usage` 现在显示驱动您限制用量的逐项分类明细——包括技能、子代理、插件以及每个MCP服务器的成本
  * `/diff` 详细视图现在支持键盘滚动（方向键、`j`/`k`、`PgUp`/`PgDn`、`Space`、`Home`/`End`）
  * Markdown输出现在会渲染GFM任务列表复选框（`- [ ] 待办` / `- [x] 已完成`）而非普通项目符号
  * 企业版：新增 `allowAllClaudeAiMcps` 托管设置，可在 `managed-mcp.json` 之外加载 claude.ai 云端MCP连接器
  * 修复了PowerShell权限绕过问题：内置 `cd` 函数（`cd..`、`cd\`、`cd~`、`X:`）会在未检测的情况下更改工作目录，导致后续命令可读取工作区外部内容
  * 修复了git工作树中沙箱写允许列表覆盖整个主仓库根目录的问题，现应仅覆盖共享 `.git` 目录（其中 `hooks/` 和 `config` 仍被拒绝）
  * 修复了PowerShell前缀/通配符允许规则（例如 `PowerShell(dotnet.exe build *)`）未能预先批准原生可执行文件和脚本的问题
  * 修复了权限分析漏洞：解析器在 `cd`/`pushd`/`popd` 操作后仍信任 `PWD`/`OLDPWD`/`DIRSTACK` 的过期变量跟踪值
  * 修复了Bash工具中 `find` 命令会耗尽macOS系统文件/vnode表并在大型目录树上导致主机崩溃的问题
  * 修复了启动时接受托管设置批准对话框后终端会冻结的问题
  * 修复了当工作树无实际变更时 `/ultraplan` 和远程会话创建失败并显示“无法捕获未提交的变更”的问题
  * 修复了当脚本路径包含空格时 `otelHeadersHelper` 静默失败的问题；现助手程序的失败会在 `/doctor` 和调试日志中报告
  * 修复了思考旋转图标在跨工具调用及新思考片段时持续显示琥珀色的问题
  * 修复了折叠的Bash输出中，对于包含多行短文本的输出，隐藏行数显示不正确的问题
  * 修复了当提示溢出输入框时，斜杠命令参数提示会截断末尾输入字符的问题
  * 修复了在Tab补全一个前端元数据 `name:` 与其目录基名不同的技能后，参数提示和渐进式参数建议不出现的问题
  * 修复了状态栏显示用户基线 `/effort` 设置而非技能/代理 `effort:` 前端元数据应用的effort级别的问题
  * 修复了Ctrl+O对话记录视图在打开时即冻结而非跟踪新消息的问题
  * 修复了在编辑已调用的提示历史条目时，使用上下方向键导航会导致编辑丢失的问题
  * 修复了 `/config` 退出摘要在切换无关设置时报告对自动压缩和主题的虚假更改的问题
  * 修复了当缓存的会话元文件缺少可选字段时 `/insights` 崩溃的问题
  * 修复了格式错误且缺少输入的PowerShell和历史工具调用在对话记录折叠中被错误归类为读取操作的问题
  * 修复了从claude.ai或Claude移动应用重命名远程控制会话时，未更新本地会话名称（用于 `claude --resume`）的问题
  * 修复了一个竞态条件：刚提交的提示可能会在向上箭头历史中出现两次
  * 修复了在全屏模式下点击“跳至底部”提示条后，该提示条未立即消失的问题
  * 改进了 `/feedback` 报告，使其包含上下文压缩前发生的对话，从而更易于对长期会话中的早期问题进行分类



  * 修复了部分用户在使用 Bash 工具时每个命令都返回退出代码 127 的问题（此为 2.1.147 版本引入的回归问题）



  * 已固定的后台会话（在 `claude agents` 中使用 `Ctrl+T`）现在空闲时仍保持运行，并会原地重启以应用 Claude Code 更新，且在内存压力下仅会释放非固定会话
  * 将 `/simplify` 重命名为 `/code-review`。现在可在选定力度（例如 `/code-review high`）下报告正确性缺陷；传入 `--comment` 可将发现的问题作为行内 GitHub PR 评论发布。原有的清理与修复行为已被移除
  * 改进自动更新器：重试临时性网络故障，失败时报告具体错误类别和操作系统错误代码，并在更新失败时显示当前版本
  * 改进大型文件编辑时的差异渲染性能
  * 提示词历史不再记录连续重复条目——使用上箭头键调出并再次提交的提示词不会添加重复副本
  * 修复企业登录限制（`forceLoginOrgUUID` 和 `forceLoginMethod` 托管设置）未对第三方提供者和 API 密钥会话生效的问题
  * 修复 `!` 命令输出中的 `&` 显示为 `&amp;` 的问题，该问题导致在无头机器上从 `gcloud auth login` 等命令复制粘贴 URL 失败
  * 修复未知斜杠命令在无头/SDK 模式下静默无响应的问题——现在会显示错误消息
  * 修复 `/help` 在非全屏模式下于小终端中渲染损坏的标签头并每页仅显示一个命令的问题
  * 修复 shell 快照丢弃名称以单个下划线开头的用户函数的问题，该问题破坏了引用它们的别名
  * 修复插件代理在 `tools:` 前置元数据中声明多个 `Agent(...)` 类型时仅保留最后一个条目的问题
  * 修复钩子 `if` 条件（如 `PowerShell(git push*)`）永不匹配的问题——仅 `PowerShell(*)` 有效
  * 修复 PowerShell 工具丢弃依赖默认格式化程序的命令输出的问题
  * 修复：在 Windows 上，对 PowerShell 脚本调用选择"是，且不再询问"现在会写入在后续运行中实际匹配的规则
  * 修复通过 winget 或 Microsoft Store 安装 `pwsh` 时，PowerShell 工具在 Windows 上以退出代码 1 失败的问题
  * 修复 `/effort` 打开时滑块处于错误级别——现在从当前力度开始
  * 修复分页 MCP 服务器在第 1 页之后丢弃资源、模板和提示词的问题
  * 修复 Claude 流式传输时，附加的后台会话在 Windows 终端上全屏闪烁的问题
  * 修复：在 Windows 上，移除后台作业工作树不再跟随 NTFS 联接点进入主仓库
  * 修复 `/background` 拒绝仅有技能或自定义斜杠命令作为类型化输入的会话的问题
  * 修复自动模式在用户或技能明确依赖 `AskUserQuestion` 时抑制该问题；自动模式分类器现将用户回答视为意图信号
  * 修复 `/theme` "新建自定义主题"和颜色编辑器对话框不响应 Esc 键的问题
  * 修复通过 Agent SDK 运行时，流式会话结束时出现未捕获异常的问题
  * 修复 Windows 上等待滚动停止时出现的罕见挂起问题
  * 修复 Windows 上当后台会话结果包含宽字符（如中日韩字符）时，代理视图列表中出现陈旧行和重复行的问题
  * 修复粘贴文本作为不可读的 `[Pasted text #N]` 占位符而非实际内容传递给代理的问题
  * 修复当插件清单列出的路径与其默认目录重叠时，`claude plugin details` 和 `/plugin` 中的插件组件计数翻倍的问题
  * 修复后台会话重新提示已通过"不再询问"授予的工具权限的问题
  * 修复 GNOME 终端右键单击和中键单击粘贴不插入文本的问题
  * 修复 `CLAUDE_CODE_SUBAGENT_MODEL` 未应用于代理团队生成的团队成员进程的问题
  * 修复后跟制表符或换行符的斜杠命令被视为未知命令的问题
  * 修复 `/plugin`、`/status`、`/mobile`、`/sandbox` 和 `/permissions` 菜单中的多个间距和布局问题
  * 修复剥离的图像导致模型反复读取已不存在的媒体的问题



  * 新增 `claude agents --json` 命令，可列出活跃的 Claude 会话并以 JSON 格式输出，便于脚本处理（如 tmux-resurrect、状态栏、会话选择器）
  * 在 `claude_code.tool` OTEL 跨度中新增 `agent_id` 和 `parent_agent_id` 属性，并修正了追踪父子关系，使后台子代理跨度嵌套在派发的 Agent 工具跨度下
  * 状态行 JSON 输入在检测到 GitHub 仓库和 PR 信息时现在会包含这些内容
  * `/plugin` 的“发现”和“浏览”界面现在会在安装前显示插件的命令、代理、技能、钩子以及 MCP/LSP 服务器信息
  * `claude agents` 终端标签页标题现在会显示等待输入的计数，这样当窗口切换时您能知道何时有代理需要关注
  * 斜杠命令和 @-提及建议列表现在在全屏模式下支持鼠标悬停和点击
  * `Stop` 和 `SubagentStop` 钩子输入现在包含 `background_tasks` 和 `session_crons` 字段
  * 修复了一个权限提示绕过问题：原先在 Bash 命令中，对未列入白名单的环境变量进行的裸变量赋值会被自动批准
  * 修复了 MCP 提示斜杠命令在缺少必需参数时显示原始服务器验证错误的问题——错误信息现在会指出缺失的参数并显示预期用法
  * 修复了终端调整大小或重新获得焦点后，进度条和运行时间显示会冻结直至按键的问题
  * 修复了跨项目恢复提示在默认的 Windows PowerShell 5.1 中失败的问题——Windows 现在使用 `;` 作为命令分隔符
  * 修复了在代理视图的回复窗格中语音按键通话无法工作的问题
  * 修复了当同时创建多个任务时，任务列表会以随机顺序渲染的问题
  * 修复了当应用市场已安装时，仍会显示过时的“安装 Anthropic 市场失败”横幅的问题
  * 修复了在会话中运行 `gh pr create` 和其他改变 PR 状态的命令后，页脚中的 PR 徽章未立即更新的问题
  * 修复了 Agent Teams 中非 ASCII 名称的队友因无效的请求头编码而导致每次 API 调用都失败的问题
  * 修复了 `/review` 使用已弃用的 `projectCards` GraphQL 查询，在包含传统项目的仓库上会报错的问题
  * 修复了 `claude plugin validate` 未标记指向文件而非目录的 `skills:` 条目的问题——错误信息现在会建议使用父目录
  * 修复了一个无限循环问题：使用 `context: fork` 的技能可能会不断重复调用自身，而不是正常运行
  * 改进了 Read 工具：当读取整个文件超过 token 限制时，现在会返回截断的第一页并附带“部分视图”提示，而非直接报错



  * 为后台会话添加了 `/resume` 支持 — 通过 `claude --bg` 或代理视图启动的会话现在会与交互式会话一同显示，并带有 `bg` 标记
  * 后台子代理完成通知中增加了耗时显示（例如“代理完成 · 3小时2分5秒”）
  * `/plugin` 的浏览和发现面板现在会显示插件的最后更新时间
  * `/model` 现在仅更改当前会话的模型；在模型选择器中按 `d` 可为新会话设置默认模型
  * CLI 文本中将“额外用量”重命名为“用量额度”；`/extra-usage` 现更名为 `/usage-credits`（旧名称仍可用）
  * 修复了当 `api.anthropic.com` 无法访问时（如强制门户、防火墙、VPN 问题），启动可能挂起长达 75 秒的问题 — 侧信道 API 调用现在会在 15 秒后超时
  * 修复了窗口大小调整事件丢失后（例如拖动 VS Code 分屏分隔条）终端输出乱码的问题 — 现在会在下一帧自动修复，而无需按 Ctrl+L
  * 修复了在超长会话中可能出现的渐进式终端显示损坏（陈旧/乱码字符）问题，该问题仅在终端调整大小或重启后才会清除
  * 通过减少旋转动画颜色数量，减少了 VS Code 中的终端渲染故障
  * 修复了当项目位于受“完全磁盘访问”保护的文件夹下时，macOS 后台会话因“init 前退出 1”而崩溃的问题（2.1.143 版本回归）
  * 修复了当读取的文件其图像扩展名与内容不符（例如将 HTML 保存为 .png）时会导致对话不可恢复的问题 — 现在会回退到文本处理
  * 减少了搜索期间的虚假工具错误：`head`/`tail` 文件查看现在满足“编辑前读取”检查，且来自 `egrep`、`fgrep`、`git grep` 或 `git diff` 的“无匹配”结果（退出代码 1）不再报告为命令失败
  * 修复了进入工作树或在某些后台会话中，`/branch` 因“没有可分支的对话”而失败的问题
  * 修复了在 AskUserQuestion 的备注字段中按 Escape 会中止该轮次而不是返回到答案选择的问题
  * 修复了在启动后通过 IDE 模型选择器或 `applyFlagSettings` 更改模型选择时未生效的问题
  * 恢复的会话现在会保持其原先使用的模型，而不是采用另一个会话的 `/model` 选择
  * 修复了 Bedrock 和 Vertex 用户无法从 `/model` 选择器中选择“Opus（100 万上下文）”的问题（v2.1.129 版本回归）
  * 修复了设置了 `forceLoginMethod` 和 `forceLoginOrgUUID` 的用户在远程会话登录时出现“无法访问此组织”的失败问题
  * 修复了具有分页 `tools/list` 响应的 MCP 服务器只返回第一页，从而静默丢弃工具的问题
  * 修复了具有不支持 MIME 类型（例如 SVG）的 MCP 图像破坏对话的问题 — 现在会保存到磁盘并在工具结果中引用
  * 修复了在技能目录内运行构建时文件描述符耗尽的问题 — 非 `.md` 文件不再触发生重新加载
  * 修复了会话标题是从插件监视器输出而非用户第一个提示词生成的问题
  * 修复了技能工具在无头模式下因权限错误而失败的问题（v2.1.141 版本回归）
  * 修复了在您自己的设置中启用的插件在全新机器上首次加载后显示“未缓存”错误的问题；仅由项目的 `.claude/settings.json` 启用的插件现在会显示可操作的 `claude plugin install` 提示
  * 修复了当 `.mcp.json` 无法解析（例如使用 VS Code 的 `"servers"` 键而非 `"mcpServers"`）时，`claude mcp list` 静默报告没有服务器的问题 — 现在会显示配置错误
  * 修复了在自定义 `ANTHROPIC_BASE_URL` 设置和 Bedrock Mantle 上的后台侧查询未使用 Haiku 的问题 — 现在当配置了第一方 API 密钥或未设置 Haiku 模型时会正确回退
  * 修复了在 Windows 上附加的后台会话中的滚动问题 — PgUp/PgDn、鼠标滚轮和 Ctrl+O 转录导航现在正常工作
  * 修复了在附加到后台会话时关闭终端导致的崩溃问题
  * 修复了在 Windows 上，`claude agents` 中按 ← 键导致列表对键盘输入无响应的问题
  * 修复了在 Windows 终端中切换 CJK 内容的代理视图窗格时，左侧边缘出现幽灵字符的问题
  * `/bg` 和 `←`-分离现在会保留通过 `/add-dir` 添加的目录
  * 修复了在已就地编辑的会话分离后立即拒绝编辑/写入并提示“后台会话尚未隔离其更改”的问题
  * 修复了对已停止的后台会话执行 `claude respawn <id>` 时显示“已停止”而非正在运行的问题
  * 修复了 `/resume` 选择器不显示从后台会话派生的会话的问题
  * 修复了从 `claude agents` 打开会话或运行 `claude logs <id>` 时，当后台服务无响应导致挂起的问题 — 现在 10 秒后超时并提供恢复提示
  * 修复了由子代理生成的后台 Bash 任务在进程退出后，在 SDK 任务面板中仍显示为“正在运行”的问题
  * 修复了已完成或已停止的后台会话短暂唤醒失败后，被永久标记为启动崩溃的问题
  * 修复了 `claude agents` 附加会话中的 markdown 链接渲染为纯文本而非可点击超链接的问题
  * 修复了自定义 `spinnerVerbs` 应用于轮次后持续时间消息的问题 — 那里已恢复使用过去式的内置动词，如“工作了 5 秒”
  * `claude agents` / `--bg` 拒绝消息现在会指明具体的限制条件（非 TTY、环境变量或设置），而不是通用消息
  * `claude --bg --name <label>` 现在会在生成后确认消息中回显名称
  * `claude agents`：使用 Ctrl+R 重命名后台会话现在会立即更新附加会话的横幅
  * 后台会话工作树隔离保护现在适用于配置了 `WorktreeCreate` 钩子的非 Git 版本控制用户
  * 插件市场的添加/更新操作现在遵守 `CLAUDE_CODE_PLUGIN_PREFER_HTTPS` 设置
  * `/plugin` 现在在启用、禁用或卸载插件后会返回到“已安装”列表
  * `/doctor` 现在在命令钩子缺少 `command` 字段时会显示一个执行格式示例
  * 技能列表截断不再显示为启动通知 — 运行 `/doctor` 可查看完整明细
  * 改进了从罕见的响应前流停顿中的恢复能力 — 现在会重试一次流式传输，而不是回退到较慢的非流式请求
  * 改进了 SDK/无头 MCP 启动：预等待现在与启动重叠，而不是在第一轮之前阻塞（对于较慢的 MCP 服务器，最多可加速 2 秒）
  * 调查后的跟进提示现在会在每次非跳过的调查响应后显示，并附带上下文相关的文本，以便通过 /feedback 更轻松地分享更多详细信息。



  * 新增插件依赖强制执行：当另一个已启用的插件依赖于目标插件时，`claude plugin disable` 现在会拒绝执行（并提供可复制的禁用链提示），而 `claude plugin enable` 会强制启用传递性依赖
  * 在 `/plugin` 市场浏览面板中新增了预计上下文成本（每轮次和每次调用的 token 估算值）
  * 新增 `worktree.bgIsolation: "none"` 设置，允许后台会话直接编辑工作副本而无需使用 `EnterWorktree`，适用于不适合使用工作树的仓库
  * PowerShell 工具现在传递 `-ExecutionPolicy Bypass`。可通过设置 `CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY=1` 选择退出
  * 后台会话现在会在从空闲状态唤醒后保留您设置的模型和算力级别
  * 附加的代理会话中的 Shift+Tab 现在将自动模式纳入循环
  * 修复了当 `.credentials.json` 文件中 `scopes` 值损坏为非数组格式时，可能导致 CLI 在启动时挂起或静默中止 OAuth 令牌刷新的问题
  * 修复了在 Windows Terminal 和 WSL 中 `claude agents` 内右键粘贴失效的问题
  * 修复了阻止型钩子（stop hooks）重复阻塞导致无限循环的问题——现在连续阻塞 8 次后，轮次将以警告结束（可通过 `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` 覆盖）
  * 修复了在 Claude 处于迭代间隔空闲期间，Esc/Ctrl+C 无法取消待处理的 `/loop` 唤醒的问题
  * 修复了后台 shell 或委托的子代理仍在运行时 `/goal` 评估器即触发执行的问题
  * 修复了 settings.json 的 `env` 中 `NO_COLOR`/`FORCE_COLOR` 会剥离 Claude Code 自身 UI 颜色的问题——现在它们仅应用于子进程
  * 修复了在列出会话时，Windows 上的代理视图会反复生成 PowerShell 进程的问题
  * 修复了不带提示词的 `/bg` 命令向派生会话发送 "continue" 的问题——现在派生会话将等待输入
  * 修复了 `--agent <name>` 无法找到由插件贡献的、未带 `plugin:` 前缀的代理的问题
  * 修复了从代理视图删除会话时未删除其对话记录文件的问题
  * 修复了在 Windows Terminal 上滚动附加的后台会话时，过期片段渲染的问题
  * 修复了在主机休眠或 macOS App Nap 后，后台代理错误检测到 worker 停滞风暴的问题
  * 修复了 5xx 错误信息指向 status.claude.com 而非指定配置的网关或云提供商的问题
  * 对于 Bedrock、Vertex 和 Foundry 用户，PowerShell 工具现在默认在 Windows 上启用。可通过设置 `CLAUDE_CODE_USE_POWERSHELL_TOOL=0` 选择退出。
  * `claude agents` 现在接受 `--add-dir`、`--settings`、`--mcp-config` 和 `--plugin-dir` 参数，并将其应用于仪表板及从中派发的后台会话
  * `claude agents` 接受 `--permission-mode`、`--model`、`--effort` 和 `--dangerously-skip-permissions` 参数，以设置从该视图派发的会话的默认值
  * `claude --bg --dangerously-skip-permissions` 现在会在休眠到唤醒过程中持续生效
  * 修复了后台会话静默捕获 IDE 文件引用到热备输入中的问题，该问题会导致引用被添加到从 `claude agents` 派发的下一个提示词之前
  * 当 `git worktree remove` 失败时，工作树清理不再回退到 `rm -rf`，从而防止丢失被 gitignore 或进行中的文件
  * 修复了在 macOS 上，即使已授予完全磁盘访问权限，后台作业会话读取 `~/Documents`、`~/Desktop` 或 `~/Downloads` 下的文件时仍会出现 "Operation not permitted" 错误的问题。
  * `/bg` 现在会保留 `--mcp-config`、`--settings`、`--add-dir`、`--plugin-dir` 和 `--strict-mcp-config`，因此后台会话在重新生成后会保留其 MCP 服务器和设置。
  * 从 `claude agents` 启动的后台会话现在遵循 settings.json 中的 `permissions.defaultMode`（之前被覆盖为自动模式）
  * 修复：在 Windows 上，当响应正在流式传输时，在 `claude agents` 中按 ← 可能导致代理列表对所有输入无响应。
  * `/bg` 和 `←`-detach 现在会保留 `--fallback-model`，因此后台工作者在过载时会降级到备用模型，而不是硬性失败。
  * `/bg` 和 `←`-detach 现在会保留 `--allow-dangerously-skip-permissions`，因此派生的工作者在其 Shift+Tab 循环中保留绕过权限的选项。
  * 修复：当 `~/.local/bin/claude` 启动器缺失或不可执行时，后台守护进程生成现在会回退到运行中的二进制文件。
  * 修复了 `claude agents --allow-dangerously-skip-permissions` 默认将派发的会话设置为绕过模式，而不是将其作为权限循环中的一个可用选项的问题。



  * 新增 `claude agents` 命令标志：`--add-dir`、`--settings`、`--mcp-config`、`--plugin-dir`、`--permission-mode`、`--model`、`--effort` 和 `--dangerously-skip-permissions`，用于配置已派发的后台会话
  * 快速模式现默认使用 Opus 4.7（此前为 Opus 4.6）。设置 `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE=1` 可将快速模式固定为 Opus 4.6
  * 根目录包含 `SKILL.md` 但无 `skills/` 子目录的插件现会被识别为技能
  * `/plugin` 详情面板及 `claude plugin details` 现可显示插件提供的 LSP 服务器
  * `/web-setup` 在替换现有 GitHub App 连接前会发出警告
  * 修复了 `MCP_TOOL_TIMEOUT` 未提升远程 HTTP 和 SSE MCP 服务器的单次请求获取超时问题（原先工具调用无论配置值如何均被限制在60秒）
  * 修复了后台会话无法识别已存在的 git 工作树，导致 EnterWorktree 因拒绝创建重复项而阻塞编辑操作
  * 修复了 macOS 睡眠/唤醒后后台会话消失且守护进程重连失败的问题——守护进程现会检测时钟跳变而非将其视为空闲时间流逝
  * 修复了二进制文件升级（如 `brew upgrade`）后守护进程未正常退出，导致已派发的代理因路径失效而崩溃循环
  * 修复了当 Claude-in-Chrome 扩展在无共享标签页连接时，后台代理出现崩溃循环
  * 修复了在已附加的 `claude agents` 会话中点击链接的问题——附加期间后台工作者的无头浏览器垫片不再生效
  * 修复了 `claude agents` 中 "v to open in editor" 使用守护进程默认编辑器而非 shell 的 `$EDITOR`/`$VISUAL` 设置
  * 修复了 Windows 系统下 `claude agents` 在网络驱动器工作目录时死锁；启动期间 Ctrl+C 现可正常响应
  * 修复了从 Apple Terminal 或其他仅支持256色的终端附加 `claude agents` 会话时的背景色渗透问题
  * 修复了 `claude --bg --dangerously-skip-permissions` 设置在休眠/唤醒后未持久化
  * 修复了当首条消息为链接时会话标题错误地从 URL 生成
  * 修复了远程客户端冗余的 `set_model` 请求向对话记录注入重复的 `/model` 痕迹
  * 修复了使用 `skills: ["./"]` 的插件错误显示 "路径超出插件目录" 的问题
  * 修复了插件缓存清理在无安装元数据时错误删除活动插件版本目录
  * 修复了 `/plugin` 浏览面板对新发布插件显示 "0 installs" 的问题
  * 修复了插件公告未列出每个遮蔽默认文件夹的 `plugin.json` 键名
  * 改进响应式压缩：首次摘要尝试现基于原始请求的溢出量进行种子处理，避免浪费接近上下文满额的重试
  * 改进钩子配置错误提示：为 `SessionStart`/`Setup`/`SubagentStart` 配置提示词类型或代理类型钩子时，现显示明确的 "请改用命令类型钩子" 错误
  * 移除了使用策略拒绝消息中过时的 `/model claude-sonnet-4-20250514` 建议



  * 向钩子 JSON 输出中添加了 `terminalSequence` 字段，以便钩子可以在无控制终端的情况下发送桌面通知、窗口标题和提示音
  * 新增 `CLAUDE_CODE_PLUGIN_PREFER_HTTPS`，用于在没有 GitHub SSH 密钥的环境中，通过 HTTPS 而非 SSH 克隆 GitHub 插件源
  * 新增 `ANTHROPIC_WORKSPACE_ID` 环境变量用于工作负载身份联合 —— 当联合规则覆盖多个工作区时，可将生成的 token 范围限定到特定工作区
  * 新增 `claude agents --cwd <path>`，用于将会话列表范围限定到指定目录
  * `/feedback` 现在可以包含最近的会话（过去 24 小时或 7 天），用于解决跨越当前会话范围的问题
  * 回退菜单：新增"总结至此处"选项，用于压缩早期上下文同时保留近期对话轮次
  * 自动模式权限对话框现在会说明提示是由 `permissions.ask` 规则引发的
  * 当 IDE 连接时，恢复了文件编辑权限提示中的"在 IDE 中查看差异"选项
  * 通过 `/bg` 或 `←←` 启动的后台代理现在会保留当前权限模式，而非恢复默认值
  * `claude agents`：完成工作但留下后台 shell 运行的代理现在会移至"已完成"列表，而非停留在"运行中"
  * 改进了长时间思考期间的微调器反馈 —— 微调器现在在 10 秒后变为琥珀色，以指示 Claude 仍在工作
  * 改进了插件菜单导航：`→`/Tab 切换标签页，`↑` 移至标签页栏，在全屏模式下标签页标题和搜索框可点击
  * 修复了在未设置 `ANTHROPIC_SMALL_FAST_MODEL` 覆盖时，后台侧查询在 Bedrock/Vertex/Foundry/gateway 上发送不可用的 Haiku 模型 ID 的问题 —— 现在回退到主循环模型
  * 修复了 Windows 上 `claude daemon status` 和 `/doctor` 在守护进程管道密钥文件被锁定或无法读取时抛出错误的问题 —— 现在显示底层错误而非不透明的失败
  * 修复了通过添加标志的包装器启动时 `claude agents` 显示代理类型列表而非仪表板的问题
  * 修复了 `claude agents` 在打开已崩溃会话且工作目录被删除时触发冗余分派的问题
  * 修复了在自定义 `ANTHROPIC_BASE_URL` 网关上的后台作业未自动命名的问题 —— 命名器现在在未配置 Haiku 模型时使用主模型
  * 修复了在一个会话中的 `/model` 静默更改其他并发会话的自动压缩阈值的问题
  * 修复了在工具权限提示打开时切换权限模式，新设置允许该工具但提示未自动关闭的问题
  * 修复了在权限/对话框提示打开时按 Enter 也会提交输入框中文本的问题
  * 修复了 `EnterWorktree` 切换工作目录后钩子接收到不存在的 `transcript_path` 的问题
  * 修复了带有单元格换行的 Markdown 表格回退为垂直键值布局而非渲染为带边框网格的问题（2.1.136 中的回归）
  * 修复了取消的提示在自动恢复到输入框时被从上箭头历史记录中移除，避免了重复条目的问题
  * 修复了在收到任何响应之前通过 Ctrl+C/Esc 取消的提示被从上箭头历史记录中丢弃的问题
  * 修复了在 vim INSERT/VISUAL 模式下 Ctrl+C 无法中断正在运行的轮次的问题
  * 修复了当 `enter` 被重绑定为 `chat:newline` 时，替代的 `chat:submit` 键绑定（如 `meta+enter`、`ctrl+enter`）无法工作的问题
  * 修复了配置输出样式时提示建议被静默禁用的问题
  * 修复了 `spinnerVerbs` 设置在轮次完成消息中未被遵守的问题
  * 修复了 AskUserQuestion 弹出窗口遮挡前一个聊天内容最后一行的问题
  * 修复了当搜索返回错误时，网页搜索状态显示"执行了 0 次搜索"的问题
  * 修复了当任何行超过终端宽度时，多行状态行输出丢弃或损坏行的问题
  * 修复了 light-ansi 主题在浅色背景上对差异上下文行使用不可见的白色的问题 —— 现在使用黑色
  * 修复了错误覆盖层转储压缩后的包源代码，从而隐藏原始错误消息的问题
  * 修复了在输入反馈调查评分数字后按 Enter 将其作为聊天消息而非评分提交的问题
  * 修复了在代理面板中按 `x` 删除选定子代理时，文本被输入到提示框而非停止代理的问题
  * 修复了在用户首次提示之前，会话标题是从插件监视器通知中派生的问题
  * 修复了在已折叠的读取/搜索组下，"由 PermissionRequest 钩子允许"消息对每个工具调用重复一次的问题
  * 修复了 `/tui` 静默丢弃正在运行的后台 shell 和子代理的问题 —— 现在会拒绝并要求等待它们完成
  * 修复了在 Bedrock、Vertex、Foundry 和其他第三方提供商上，欢迎横幅显示"API 使用计费"的问题 —— 现在显示提供商名称
  * 修复了 `/mcp` 服务器列表在短终端的全屏模式下未保持焦点服务器可见的问题
  * 修复了 `/feedback` 包中的编辑对带引号的值（如会话 ID）产生无效 JSON 的问题
  * 修复了桌面和第三方提供商会话从主机托管设置中错误继承 `apiKeyHelper`/`ANTHROPIC_AUTH_TOKEN` 的问题
  * 修复了在日志记录器初始化之前触发的早期分析事件被静默丢弃的问题
  * 修复了当 `sha` 已固定且市场 `ref` 在上游不再存在时 `claude plugin install` 安装插件失败的问题
  * 修复了插件详情面板对通过 `.mcp.json` 声明 MCP 服务器的插件显示 0 个 MCP 服务器的问题
  * 修复了具有未设置配置变量的插件 MCP 服务器显示通用连接失败而非带有修复提示的"配置问题"消息的问题；格式错误的 `.mcp.json` 条目不再丢弃其他 MCP 服务器
  * 修复了使用 POSIX shell 参数扩展（如 `${var%pattern}`）的 MCP 服务器配置被错误标记为缺少环境变量的问题
  * 修复了在连接时返回 403 的 MCP HTTP/SSE 服务器显示为"失败"而非"需要认证"的问题
  * 修复了当可选的服务器事件流未能重新连接时，远程 MCP 服务器不必要地断开连接的问题 —— 工具调用通过 POST 继续
  * 修复了当工作会话 token 在会话期间轮换时，远程控制 MCP 连接器全部返回 401 失败的问题
  * 修复了当服务器拒绝过期 token 时，远程控制自动重新注册受信任设备，而非在 `/login` 中循环的问题
  * 修复了在启用 beta 跟踪的 SDK/无头模式下，早期 OTel span 可能被静默丢弃的竞态条件
  * 修复了自定义 `voice:pushToTalk` 键绑定和 `"space": null` 解除绑定被静默忽略的问题
  * 修复了当剪贴板包含屏幕截图时，Windows Alt+V 图像粘贴报告"未找到图像"的问题
  * 修复了在安装了 glibc 和 musl 平台包的 Linux 上，SDK 报告"Claude Code 原生二进制文件未找到"的问题
  * Bedrock：现在当配置了 `awsCredentialExport` 时总是运行，而非在环境 AWS 凭证解析时跳过，修复了跨账户访问的身份验证问题
  * \[VSCode] 修复了在聊天中麦克风仅产生静音时显示无反馈的问题 —— 现在显示"未检测到音频"
  * \[VSCode] 语音模式：WSL 错误现在建议 WSLg 用户安装 `sox libsox-fmt-pulse`
  * `claude agents`：当预热的后台工作者不健康时，启动会话不再失败 —— 现在回退到全新启动
  * `claude agents` 不再显示后台化全新 REPL 时留下的空占位符会话，并在通过 ← 进入且无其他代理时显示入门文本
  * 由 `←` 留下的空闲后台会话现在会在 5 分钟后被守护进程自动回收



  * 改进了代理工具 `subagent_type` 的匹配机制，现在可接受大小写和分隔符不敏感的值（例如 `"Code Reviewer"` 会被解析为 `code-reviewer`）
  * 更新了代理调色板
  * 修复了当设置 `disableAllHooks` 或 `allowManagedHooksOnly` 时，`/goal` 命令静默挂起的问题——现在会显示清晰的消息，而不是永不解决的指示器
  * 修复了设置热重载中的一个回归问题，该问题曾导致符号链接的设置文件引起事件归属错误和虚假的 `ConfigChange` 钩子
  * 修复了当后台服务即将空闲退出时，`claude --bg` 因"请求中断时连接丢失"而失败的问题
  * 通过增加等待时间，修复了在具有企业端点安全的机器上后台服务启动失败的问题
  * 修复了远程管理设置在收到 401 错误时不会重试的问题——现在会使用强制刷新的 token 重试一次
  * 修复了托管的 `extraKnownMarketplaces` 自动更新策略未持久化到 `known_marketplaces.json` 的问题
  * 修复了 `/loop` 命令为已完成通知的后台任务调度冗余唤醒的问题
  * 修复了在 Windows 上，当缺失可执行文件（例如 `gh`）在每次检查时触发同步的 `where.exe` 重新生成导致的事件循环周期性卡顿问题
  * 修复了当 `offset` 参数传递为带空格填充或以 `+` 为前缀的字符串时，`Read` 工具调用验证失败的问题
  * 修复了当终端失去焦点时，原生终端光标未能停留在输入插入符位置的问题
  * 现在，当默认组件文件夹（例如 `commands/`）因 `plugin.json` 中设置了匹配键而被静默忽略时，插件会发出警告。该警告会在 `/doctor`、`claude plugin list` 和 `/plugin` 命令中显示。



  * 新增代理视图（研究预览）：单个列表显示所有 Claude Code 会话——正在运行的、等待您处理的、或已完成的。运行 `claude agents` 即可开始使用。参见 [https://code.claude.com/docs/en/agent-view](https://code.claude.com/docs/en/agent-view)
  * 新增 `/goal` 命令：设置完成条件，Claude 会持续工作多个轮次直到满足条件。适用于交互模式、`-p` 模式和远程控制。会以覆盖面板实时显示已用时间/轮次数/token 数
  * 新增 `/scroll-speed` 命令，可调节鼠标滚轮滚动速度并实时预览
  * 新增 `claude plugin details <name>` 命令，用于显示插件的组件清单及预估的单次会话 token 成本
  * 新增转录视图导航功能：按 `?` 查看键盘快捷键，`{`/`}` 跳转至用户提示词之间，`v` 切换快捷键面板
  * 新增钩子 `args: string[]` 字段（执行形式），该字段直接启动命令无需 shell，因此路径占位符无需添加引号
  * 新增钩子 `PostToolUse` 的 `continueOnBlock` 配置选项——设为 `true` 可将钩子拒绝原因反馈给 Claude 并继续当前轮次
  * MCP stdio 服务器现在会在其环境中接收 `CLAUDE_PROJECT_DIR`，与钩子保持一致。插件配置中可在命令里引用 `${CLAUDE_PROJECT_DIR}`
  * 压缩提示词现在会要求模型保留用户的敏感指令
  * `/mcp` 重连功能现在无需重启即可识别 `.mcp.json` 的编辑，并在重连失败时显示 HTTP 状态码和 URL
  * `/context all` 中各技能的 token 估算值现在会考虑模型的分词器并显示四舍五入的数值
  * `claude plugin install <name>@<marketplace>` 现在会自动刷新插件市场并在报告插件未找到前进行重试
  * `/plugin` 已安装插件详情现在能清晰展示钩子事件名称和 MCP 服务器名称
  * `/context` 现在会为插件来源的技能显示提供该技能的插件名称
  * 所有用户现已启用远程 MCP 服务器在遭遇瞬态故障时进行重连重试的功能
  * 来自子代理的 API 请求现在会携带 `x-claude-code-agent-id` / `x-claude-code-parent-agent-id` 请求头，且 `claude_code.llm_request` OTEL span 包含 `agent_id` / `parent_agent_id` 属性
  * 当设置了 `ANTHROPIC_API_KEY` / `apiKeyHelper` / `ANTHROPIC_AUTH_TOKEN` 时（即使同时存在 Claude.ai 登录），远程控制、`/schedule`、claude.ai MCP 连接器和通知偏好设置现已禁用。取消设置 API 密钥即可使用这些功能
  * 修复了当凭证过期且 `forceRemoteSettingsRefresh` 策略设置存在时，`claude auth login`/`logout`/`status` 陷入死锁且无法恢复的问题
  * 修复了 `autoAllowBashIfSandboxed` 无法自动批准包含 shell 扩展（如 `$VAR` 和 `$(cmd)`）的命令的问题
  * 修复了钩子写入终端可能损坏屏幕上交互式提示符的错误；钩子现在运行时将不访问终端
  * 修复了当 HTTP/SSE MCP 服务器流式传输非协议数据时内存无限制增长的问题——响应体大小现在限制为每个 SSE 帧 16 MB
  * 修复了 `Skill(name *)` 权限规则——通配符形式现在作为前缀匹配工作，与 `Bash(ls *)` 行为一致
  * 修复了设置热重载无法检测到对符号链接 `~/.claude/settings.json` 进行编辑的问题
  * 修复了当插件市场键与清单名称不同时，插件详情加载失败的问题
  * 修复了 `/model` 选择器中的"默认"行未能反映 `ANTHROPIC_DEFAULT_OPUS_MODEL`/`ANTHROPIC_DEFAULT_SONNET_MODEL` 覆盖设置的问题
  * 修复了响应完成 5 分钟后出现虚假的"流空闲超时"错误，该问题由流取消时监视器计时器未被清除导致
  * 修复了当配置了 10 个以上 MCP 服务器且缓存目录不可写时静默执行 `exit 1` 的问题——错误信息现在包含根本原因
  * 修复了对话框中标签名、列表指针和选择行上闪烁的打字光标
  * 修复了鼠标点击后转录视图字母快捷键失效的问题
  * 修复了 Bash 模式下按上箭头键会重复第一条历史记录并覆盖进行中草稿的问题
  * 修复了粘贴或拖放多张图片时仅插入最后一张的问题
  * 修复了在深色主题下超链接使用难以辨别的深海军蓝色的问题——超链接现在能自适应活动主题
  * 修复了当第三方用户模型设置为 `opus` 别名时，模型选择器显示冗余"当前模型"行的问题
  * 修复了在 PAYG 第三方提供商上，旧版 Opus 选择器条目与默认条目解析为相同模型的问题
  * 修复了在 Cursor 和 VS Code 1.92–1.104 中的鼠标滚轮滚动速度；触控板现在以稳定速率滚动，鼠标滚轮保持每刻度约 3 行
  * 修复了在 Windows 终端和 VS Code 中连接到后台会话时的滚动行为
  * 修复了来自已断开连接服务器的 MCP 资源在 `@server:` 自动完成中残留的问题
  * 修复了双文件差异片段多报截断行数一行的问题
  * 修复了 Grep 结果未将 Windows 驱动器号路径相对化，以及计数模式对单文件路径报告错误总数的问题
  * 修复了由于视觉单元格宽度计算错误导致 CJK/emoji 文本在边框嵌入文本中溢出的问题
  * 修复了模糊匹配高亮在 emoji 和天域字符对中间断开的问题
  * 修复了技能参数名包含正则表达式元字符时破坏参数替换的问题
  * 修复了进度条对几乎满的分数单元格渲染完整块的问题
  * 修复了当最后一个订阅者离开时，如果正在进行的请求尚未完成，任务轮询和 `fs.watch` 被错误恢复的问题
  * 修复了当清单名称与源标识符不同时，插件依赖解析留下过时计数的问题
  * 修复了当会话包含无法解析的时间戳时，洞察力“一天中的时间”图表出现偏差的问题
  * 修复了仅使用 cmd/super/win 修饰键的键绑定被标记为无法解析的问题
  * 修复了 `claude_code.active_time.total` OpenTelemetry 指标在 `--print` 模式下未发出的问题
  * 修复了 `claude plugin update` 未能保留插件市场内跨插件符号链接的问题
  * [VSCode] 按 Cmd/Ctrl+Shift+T 可重新打开最近关闭的会话标签页，可通过 `claudeCode.enableReopenClosedSessionShortcut` 配置



  * 内部修复



  * \[VSCode] 修复了扩展在 Windows 上激活失败的问题



  * 新增 `CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL` 配置项，用于为企业通过 OpenTelemetry 捕获响应时重新启用会话质量调查
  * 新增 `settings.autoMode.hard_deny` 用于自动模式分类器规则，可无条件阻止操作，不考虑用户意图或允许的例外
  * 修复了在 VS Code 扩展、JetBrains 插件和 Agent SDK 中，通过 `/clear` 命令后，在 `.mcp.json`、插件和 claude.ai 连接器中配置的 MCP 服务器静默消失的问题
  * 修复了一个罕见的登录循环问题，该问题由并发写入凭证可能覆盖新轮换的 OAuth 令牌并强制重新登录引起
  * 修复了多个服务器并发刷新时 MCP OAuth 刷新令牌丢失的问题 —— 拥有多个远程 MCP 服务器的用户将不再需要每日重新认证
  * 修复了在工具调用后扩展思考发出已编辑的思考块时出现 API 错误 (400) 的问题
  * 修复了当项目路径包含下划线时，`--resume` / `--continue` 找不到会话的问题
  * 修复了计划模式在存在匹配的 `Edit(...)` 允许规则时仍阻止文件写入的问题
  * WSL2：现在当 xclip/wl-paste 无法读取图像数据时，通过 PowerShell 后备方式支持从 Windows 剪贴板粘贴图像
  * 修复了当缓存清理删除仍在运行会话中使用的版本时，插件的 `Stop`/`UserPromptSubmit` 钩子执行失败的问题
  * 改进了斜杠命令对话框的视觉一致性：标准化了页脚提示、对话框间距和箭头键样式，并且对话框边框现在在加载期间立即出现，而不是加载后才弹出
  * 修复了 bash 命令输出和 markdown 代码块中颜色显示位置错误的问题
  * 修复了 ReasonML 差异在字词差异边界处渲染出损坏的 "undefined" 文本伪影的问题
  * 修复了工作树退出对话框在工作树移除后对错误目录中的未提交文件发出警告的问题
  * 修复了 `@` 文件选择器在小型非 git 目录中无法匹配会话期间创建的文件的问题
  * 修复了 `@`-提及文件选择器在包含超过 100 个条目的目录中找不到文件的问题
  * 修复了在输出被截断时，失败的工具调用在全屏模式下未能通过点击展开的问题
  * 修复了在具有持久扩展键模式的终端上使用 Ctrl+G 打开外部编辑器后，Backspace 和 Ctrl+Backspace 功能互换的问题
  * 修复了 `/usage` 周重置显示一天中的时间而非日历日期的问题
  * 修复了欢迎横幅的省略号在 CJK 终端上导致列溢出的问题
  * 修复了当会话历史记录包含输入字段格式错误的工具调用时，`/insights` 崩溃的问题
  * 修复了当工具的可折叠性分类在会话中途改变时渲染器崩溃的问题
  * 修复了 `plugin.json` 中的 `skills` 条目会隐藏插件默认 `skills/` 目录的问题，现在列出文件路径将显示错误而非静默失败
  * 修复了 IDE shell 集成锁文件不遵循 `CLAUDE_CONFIG_DIR` 设置的问题
  * 修复了在流式传输期间复制的终端输出中存在尾随空格的问题
  * 修复了插件卸载和启用/禁用操作不区分大小写匹配 slug 的问题
  * 修复了工具错误截断标记对代理对字符串显示负数计数的问题
  * 修复了来自 `CLAUDE_ENV_FILE` 会话开始钩子的环境变量在 `/resume` 或 `/clear` 后过时的问题
  * 修复了 `/branch` 在给定粘贴的多行名称时保存多行会话标题的问题
  * 修复了在列边界处换行文本第二行出现杂散前导空格的问题
  * 修复了在 `/install-github-app`、`/desktop`、`/resume` 和 `/web-setup` 中按 Esc 键无法关闭对话框的问题
  * 修复了 `/doctor` MCP 架构错误未指明缺失字段或显示源文件路径的问题
  * 修复了 Bash 权限提示显示内部解析器诊断信息而非用户可读解释的问题
  * 修复了包含空格的插件斜杠命令（例如 `/myplugin review`）无法解析为其命名空间形式的问题
  * 修复了 `AskUserQuestion` 在提供数组形式的多选答案时丢弃答案的问题
  * 修复了 `/clear <name>` 未为 `/resume` 标记已清除会话的问题
  * 修复了 `CronList` 输出缺少限定符和计划提示词的问题
  * 修复了 "跳转到底部" 覆盖层在全屏模式下对 CJK 字符留下颜色伪影的问题
  * 修复了在流式传输期间，宽 markdown 表格在终端回滚中留下陈旧边框渲染的问题
  * 修复了当带有粘贴文本占位符的长提示词被自动截断时，粘贴的文本被静默丢弃的问题
  * 修复了在更改日志刷新失败后 `/release-notes` 停留在旧版本的问题
  * 修复了 `/mcp` 服务器列表在服务器数量超过终端可显示数量时无法滚动的问题
  * 修复了在输入第一个斜杠命令后，输入中斜杠命令自动补全失效的问题
  * 修复了滚动到底部时，在 `autoScrollEnabled: false` 设置下重新激活自动跟随的问题
  * 修复了提示词建议在空输入时被 Enter 键自动提交，而未要求使用 Tab 或箭头键接受的问题
  * 修复了键盘快捷键提示未反映 `keybindings.json` 中重绑定的键的问题
  * 修复了 `/settings` 语言更改在确认后按 Esc 键被撤销的问题
  * 修复了 `/terminal-setup` 在自动补全中仅当输入完全匹配名称时才出现，而非部分前缀匹配的问题
  * 修复了 `AskUserQuestion` 对话框上的 "对此聊天" 功能会擦除问题文本的问题
  * 修复了当服务器返回内容块时，MCP 工具结果不可见的问题
  * 改进了当 `--worktree` 与现有或陈旧工作树冲突时的错误信息
  * 将插件市场移除键更改为 `d`（与其他删除操作一致），以避免与重试键 `r` 冲突



  * 新增 `worktree.baseRef` 设置（`fresh` | `head`），用于选择 `--worktree`、`EnterWorktree` 及代理隔离工作树是基于 `origin/<default>` 还是本地 `HEAD` 进行分支。**注意：** 默认的 `fresh` 将 `EnterWorktree` 的基准改回了 `origin/<default>`（自 2.1.128 起其基准为本地 `HEAD`）——设置 `worktree.baseRef: "head"` 可以在新的工作树中保留未推送的提交。
  * 新增 `sandbox.bwrapPath` 和 `sandbox.socatPath` 托管设置（Linux/WSL），用于指定自定义的 bubblewrap 和 socat 二进制文件位置。
  * 新增 `parentSettingsBehavior` 管理员层级键（`'first-wins' | 'merge'`），允许管理员将 SDK `managedSettings`（父级层）纳入策略合并。
  * 钩子现在通过 `effort.level` JSON 输入字段和 `$CLAUDE_EFFORT` 环境变量接收活跃的 `effort` 级别，Bash 工具命令也可以读取 `$CLAUDE_EFFORT`。
  * 改进了焦点模式的行为。
  * 通过在内存压力下释放温备后台 worker，改善了内存使用情况。
  * 修复了在刷新 token 竞争导致共享凭据被清除后，并行会话全部在 401 处终止的问题。
  * 修复了作用域为驱动器根目录（`C:\`）或 POSIX `/` 的 `Edit`/`Write` 允许规则匹配错误并始终提示的问题。
  * 修复了当历史记录或会话日志文件锁因时钟偏移或磁盘慢而失效时，出现未处理的拒绝（`ECOMPROMISED`）错误的问题。
  * 修复了在会话压缩期间按 Esc 键会显示虚假的“压缩会话时出错”通知的问题。
  * 修复了在完整的 MCP OAuth 流程（包括发现、动态客户端注册、token 交换和 token 刷新）中未遵循 `HTTP(S)_PROXY` / `NO_PROXY` / mTLS 设置的问题。
  * 修复了通过 `--add-dir` / SDK `additionalDirectories` 传入的映射网络驱动器上，Read/Write/Edit 操作被拒绝的问题。
  * 修复了从 claude.ai 进行的远程控制停止/中断无法像本地按 Esc 键那样完全取消 CLI 会话的问题，这导致在中断了卡住的工具或提示词后，排队的消息永远不会继续处理。
  * 修复了在一个会话中使用 `/effort` 意外改变其他并发会话的 effort 级别的问题，以及一个相关的 IDE effort 更改可能被静默丢弃的问题。
  * 修复了子代理无法通过技能工具发现项目、用户或插件技能的问题。
  * `claude --help` 现在将 `--remote-control` 与 `--remote-control-session-name-prefix` 一起列出。
  * \[VSCode] 修复了当扩展构建未捆绑 Claude 二进制文件时，`claudeCode.claudeProcessWrapper` 出现“Unsupported platform”错误的问题。



  * 在 Bash 工具子进程环境中新增了 `CLAUDE_CODE_SESSION_ID` 环境变量，该变量与传递给钩子的 `session_id` 保持一致
  * 新增 `CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN=1` 环境变量，用于禁用全屏交替屏幕渲染器，使对话保留在终端原生滚动缓冲区中
  * 在从剪贴板读取 Ctrl+V 图像粘贴内容时，新增了"正在粘贴…"的底部提示
  * 修复了外部 SIGINT（如 IDE 停止按钮、`kill -INT`）未执行优雅关闭的问题——现在会恢复终端模式并显示 `--resume` 提示，而非直接异常退出
  * 修复了在原生构建版本中，终端关闭或 SSH 会话中断时出现的未捕获异常
  * 修复了当工具错误截断导致表情符号被拆分时，`--resume` 会因 `no low surrogate in string` 失败的问题；加载时会对已损坏的会话进行清理
  * 修复了通过 `-p --continue`/`--resume` 恢复计划模式会话时 `--permission-mode` 标志被忽略的问题，以及在同一会话中执行 `ExitPlanMode` 后计划模式未重新应用的问题
  * 修复了在笔记本电脑睡眠/唤醒或 Ctrl+Z/`fg` 操作后，全屏模式显示空白屏幕直到下次按键或流输出的问题
  * 修复了当印度语连字或零宽连接符表情符号跨行时，使用 Ctrl+E/A/K/U/方向键时光标停在字素中间的问题
  * 修复了 vim 操作符破坏包含分解形式（NFD）重音字符文本的问题
  * 修复了粘贴以 `/` 开头的文本时静默吞掉输入或触发未知命令回复的问题
  * 修复了当焦点事件或鼠标跟踪报告与方括号粘贴交错时，粘贴操作将杂散转义序列输入到提示符中的问题
  * 修复了由于上游 xterm.js 的漏洞，在 Cursor 和 VS Code 1.92–1.104 中鼠标滚轮滚动过快的问题
  * 修复了 JetBrains IDE 2025.2 终端中滚轮处理的问题（出现伪箭头键、事件方向错误、加速失控）
  * 修复了在 Linux/X11 上使用 `/usage` Ctrl+S 将统计截图复制到剪贴板时卡住的问题
  * 修复了 `/terminal-setup` 在 Windows Terminal 中显示矛盾错误信息的问题——该终端原生支持 Shift+Enter
  * 修复了 `/effort` 选择器未反映 `CLAUDE_CODE_EFFORT_LEVEL` 环境变量覆盖值的问题
  * 修复了 `/status` 对部分用户显示错误默认模型的问题
  * 修复了斜杠命令自动补全弹出窗口最多显示约 3-5 个可见命令而未随终端高度自适应缩放的问题
  * 修复了状态行 `context_window` token 计数显示的是累积会话总量而非当前上下文使用量的问题
  * 修复了在 macOS 终端（iTerm2、Terminal.app 默认设置）中未启用"Option as Meta"时 Alt+T（思考模式切换）无法工作的问题
  * 修复了从 `claude agents` 重新打开后台会话后，在 Windows 上键盘输入无响应的问题
  * 修复了当 stdio MCP 服务器向标准输出写入非协议数据时，内存无限制增长（RSS 超过 10GB）的问题
  * 修复了连接成功但 `tools/list` 失败的 MCP 服务器静默显示 0 个工具的问题——现在会重试一次并在 `/mcp` 中显示"已连接 · 工具获取失败"
  * 修复了未经授权的 claude.ai MCP 连接器显示为"失败"而非"需要认证"的问题，以及无头 `-p` 模式会重试非临时性 4xx 连接错误的问题
  * 改进了斜杠命令对话框以及 `/login`、`/upgrade`、`/extra-usage` 对话框的视觉一致性间距
  * 更新了 `/tui fullscreen` 启动横幅，以描述额外渲染器的优点（更低内存占用、鼠标支持、选择时自动复制）
  * 修复了设置 `ENABLE_PROMPT_CACHING_1H` 时 Bedrock 和 Vertex 出现 400 错误的问题



  * 修复了 VS Code 扩展在 Windows 上激活失败的问题，原因是捆绑 SDK 中硬编码了构建路径（`createRequire` polyfill 缺陷）
  * 修复了 Mantle 端点因缺少 `x-api-key` 请求头而导致的认证失败问题



  * 新增 `--plugin-url <url>` 参数，用于从指定 URL 获取插件 `.zip` 归档包至当前会话
  * 新增 `CLAUDE_CODE_FORCE_SYNC_OUTPUT=1` 环境变量，可在自动检测失效的终端（如 Emacs `eat`）上强制启用同步输出
  * 新增 `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE`：当在 Homebrew 或 WinGet 安装环境中设置时，Claude Code 会在后台运行升级命令并提示重启
  * 插件清单：`themes` 和 `monitors` 现在应声明在 `"experimental": { ... }` 下。顶层声明仍可用，但 `claude plugin validate` 将发出警告
  * 用于 `/model` 选择器的网关 `/v1/models` 发现功能现需通过 `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1` 手动启用（在 2.1.126–2.1.128 版本中为自动启用）
  * Ctrl+R 历史选择器现在默认搜索所有项目的所有提示词，与 2.1.124 版本之前的行为一致。按 Ctrl+S 可缩小范围至当前项目或会话
  * 第三方部署（Bedrock、Vertex、Foundry 或 `ANTHROPIC_BASE_URL` 网关）不再显示指向 Anthropic 官方界面的加载提示
  * `skillOverrides` 设置现已生效：`off` 对模型和 `/` 命令隐藏，`user-invocable-only` 仅对模型隐藏，`name-only` 折叠描述
  * `claude_code.pull_request.count` OTel 指标现在统计通过 MCP 工具创建的 PR/MR，而不仅仅是 shell 命令创建的
  * 策略拒绝错误信息现在包含 API 请求 ID，以便于支持调试
  * 修复了未识别的 400 状态码 API 错误显示原始 JSON 而非底层错误信息的问题
  * 修复了 `/clear` 在会话后未重置终端标签页标题的问题
  * 修复了当权限或其他对话框处于活动状态时，由 `/rename` 生成的会话标题标签消失的问题
  * 修复了子代理运行时，提示下方的代理面板被隐藏的问题（2.1.122 版本回归）
  * 修复了通过外部编辑器（Ctrl+G）切换时，提示上方的对话历史记录被清空的问题
  * 修复了 `/context` 将其渲染的 ASCII 可视化网格转储到对话中，每次调用浪费约 1.6k tokens 的问题
  * 修复了 `/agents` 库列表使用方向键导航时，当列表超出视口时高亮代理不可见的问题
  * 修复了 `/branch` 成功消息未包含新分支的会话 ID 以用于 `/resume` 的问题
  * 修复了在全屏模式下，包含键帽/零宽连接符/肤色表情符号的加粗标题丢失末尾字符的问题
  * 修复了服务器管理设置策略未应用于企业/团队用户的问题（其存储的 OAuth 凭据缺少 `user:inference` 范围）
  * 修复了从睡眠唤醒后 OAuth 刷新竞争条件可能导致所有运行中会话退出的问题
  * 修复了 1 小时提示词缓存 TTL 被静默降级为 5 分钟的问题
  * 修复了在更改 `/effort` 或 `/model` 后，`/clear` 或压缩后出现伪缓存未命中警告的问题
  * 修复了 `Bash(mkdir *)`、`Bash(touch *)` 及类似允许规则未适用于项目内路径的问题
  * 修复了 `deniedMcpServers` 模式中使用 `*://` 方案通配符未匹配混合大小写主机名的问题
  * 修复了在语音模式下 `--debug` 期间将无害的 WebSocket 警告记录为错误的问题
  * [VSCode] 修复了 `/clear` 未清除对话上下文和显示转录内容的问题



  * 裸执行 `/color`（无参数）现在会随机选择会话颜色
  * `/mcp` 现在显示已连接服务器的工具数量，并标记连接时工具数为0的服务器
  * `--plugin-dir` 现在除目录外还支持接受 `.zip` 插件存档
  * `--channels` 现在可与控制台（API密钥）认证配合使用——具有托管设置的控制台组织需设置 `channelsEnabled: true` 以启用
  * 更新了 `/model` 选择器：合并了重复的 Opus 4.7 条目，当前 Opus 现在显示为“Opus”而非“Opus 4.7”
  * 子进程（Bash、钩子、MCP、LSP）不再继承 `OTEL_*` 环境变量，因此通过 Bash 工具运行的 OTEL 检测应用不再获取 CLI 自身的 OTLP 端点
  * MCP：`workspace` 现在是保留的服务器名称——现有同名服务器将被跳过并发出警告
  * 重新连接 MCP 服务器时不再在每次重连时向对话中刷屏完整的工具名称列表——重新公告的工具会按服务器前缀进行摘要
  * SDK 主机现在会收到关于 Bash 权限提示的持久 `localSettings` 建议，因此“始终允许”会写入 `.claude/settings.local.json`
  * `EnterWorktree` 现在如文档所述从本地 HEAD 创建新分支，而非 `origin/<default-branch>`——未推送的提交不再被丢弃
  * 自动模式：当分类器无法评估操作时，错误信息现在包含提示（重试、`/compact` 或使用 `--debug` 运行）
  * 修复了聚焦模式在提交新提示词时短暂变暗先前响应的问题
  * 修复了在 Kitty 和其他将 OSC 9 解释为通知的终端中，每次 `/exit` 时出现杂散“4;0;”桌面通知的问题
  * 修复了远程控制在速率限制时显示空的“正在打开选项…”消息，而非可操作的升级选项
  * 修复了拖放图片上传在图片读取失败时卡在“正在粘贴文本…”的问题
  * 修复了通过 stdin 将超大输入（>10 MB）管道传输至 `claude -p` 时出现的崩溃循环
  * 修复了在全屏模式下，长 URL 在每个换行的行上无法单独点击的问题
  * 修复了 `/plugin` 组件面板为通过 `--plugin-dir` 加载的插件显示“找不到‘内联’市场”的问题
  * 修复了当服务器返回结构化内容和内容块时，MCP 工具结果丢弃图片的问题
  * 修复了列表项内的围栏代码块在复制粘贴时将前导空格带入剪贴板的问题
  * 修复了 `/config` 中的标签页导航导致焦点滞留的问题——标签页标题现在保持聚焦，以便箭头键和 Esc 键继续工作
  * 修复了在不支持 OSC 8 超链接的终端上 Markdown 链接标签丢失的问题——链接现在渲染为 `标签 (URL)` 而非仅 URL
  * 修复了在具有较小自动压缩窗口的 100 万上下文模型上，会话在达到实际 API 限制前被错误阻塞并提示“提示词过长”的问题
  * 修复了并行 Shell 工具调用：失败的只读命令（grep、git diff、ls）不再取消同级调用
  * 修复了在不支持 effort 的模型上横幅显示“使用 X effort”的问题
  * 修复了在第三方提供商上 `/fast` 模糊匹配到无关技能而非显示“不可用”的问题
  * 修复了 Bedrock 默认模型解析为 `global.*` 而非相应区域前缀的问题
  * 修复了 Vim 模式：在 NORMAL 模式下 `Space` 现在向右移动光标，符合标准 vi/vim 行为
  * 修复了终端进度指示器（OSC 9;4）在工具调用之间闪烁消失的问题——在整个回合中保持可见
  * 修复了对最后一条目为压缩边界的已恢复会话执行不带参数的 `/rename` 失败的问题
  * 修复了在 `--resume`/`--continue` 后出现先前会话的陈旧“remote-control is active”状态行的问题
  * 修复了指向已删除缓存目录的陈旧 `installed_plugins.json` 条目污染 PATH 的问题
  * 修复了当设置 `CLAUDE_CODE_SHELL_PREFIX` 且参数包含空格或 Shell 元字符时，MCP stdio 服务器接收损坏参数的问题
  * 修复了子代理进度摘要缺少提示词缓存的问题（减少约 3 倍的 `cache_creation`）
  * 修复了 `/plugin update` 从未检测到 npm 来源插件新版本的问题
  * 修复了当子代理的记录静止时子代理摘要重复触发的问题，限制了空闲子代理的最差情况 token 成本
  * 无头 `--output-format stream-json`：`init.plugin_errors` 现在除依赖降级外还包含 `--plugin-dir` 加载失败



  * 当 `ANTHROPIC_BASE_URL` 指向 Anthropic 兼容网关时，`/model` 选择器现在会列出网关 `/v1/models` 端点提供的模型列表。
  * 新增 `claude project purge [path]` 命令，用于删除项目的所有 Claude Code 状态（对话记录、任务、文件历史、配置条目）——支持 `--dry-run`、`-y/--yes`、`-i/--interactive` 和 `--all` 选项。
  * `--dangerously-skip-permissions` 现在会跳过向 `.claude/`、`.git/`、`.vscode/`、shell 配置文件及其他受保护路径写入的提示（灾难性删除命令仍会提示，作为安全网）。
  * `claude auth login` 现在支持在浏览器回调无法连接本地主机时（如 WSL2、SSH、容器环境），直接粘贴终端中的 OAuth 授权码。
  * 用户输入斜杠命令时，`claude_code.skill_activated` OpenTelemetry 事件现在会触发，并携带新的 `invocation_trigger` 属性（值为 `"user-slash"`、`"claude-proactive"` 或 `"nested-skill"`）。
  * 自动模式：当权限检查停滞时，加载指示器现在会变为红色，而非看起来像工具仍在运行。
  * 主机管理的部署（`CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST`）在 Bedrock/Vertex/Foundry 上不再自动禁用分析功能。
  * Windows：现在可检测通过 Microsoft Store 安装、无 PATH 配置的 MSI 安装或 `.NET 全局工具`方式安装的 PowerShell 7。
  * Windows：当 PowerShell 工具启用时，Claude 现在将 PowerShell 作为主 shell，而非默认使用 Bash。
  * 读取工具：移除了针对每个文件的恶意软件评估提醒，该提醒曾导致在旧模型上出现误拒和“这不是恶意软件”的评论。
  * **安全性：** 修复了当更高优先级的托管设置源缺少 `sandbox` 块时，`allowManagedDomainsOnly` / `allowManagedReadPathsOnly` 配置被忽略的问题。
  * 修复了粘贴超过 2000px 的图片导致会话中断的问题——现在粘贴时图片会自动缩小尺寸，历史记录中的超大图片也会被自动移除并重试请求。
  * 修复了显示“组织不允许 OAuth”错误时跳转到登录页的问题——现在会显示联系管理员的指引。
  * 修复了 OAuth 登录在慢速或代理连接、纯 IPv6 开发容器以及浏览器回调无法连接本地主机时出现超时失败的问题。
  * 修复了一个罕见的竞态条件，即并发写入凭据可能清除有效的 OAuth 刷新令牌。
  * 修复了 API 重试倒计时在“0s”处停滞而不进行实际倒计时的问题。
  * 修复了在请求中途从睡眠唤醒 Mac 后出现“Stream idle timeout”错误的问题。
  * 修复了后台和远程会话在模型长时间思考暂停期间误报“Stream idle timeout”错误而中止的问题。
  * 修复了一个挂起问题，即助手可能在连续空轮次后完成思考但不显示任何输出。
  * 修复了在 Cursor 和 VS Code 1.92–1.104 集成终端中触控板滚动过快的问题。
  * 修复了 claude.ai MCP 连接器被卡在“需要认证”状态的手动服务器抑制的问题。
  * 修复了在 Windows 无闪烁模式下，日语/韩语/中文文本显示为乱码的问题。
  * 修复了 `Ctrl+L` 清除提示输入的问题——现在它仅强制重绘屏幕，与 readline 行为一致。
  * 修复了延迟工具（如 WebSearch、WebFetch 等）在 `context: fork` 技能及其他子代理的首轮执行中不可用的问题。
  * 修复了通过 `--channels` 启动的交互式会话中计划模式工具不可用的问题。
  * 修复了 `/plugin` 卸载操作报告“已启用”而非“已卸载”的问题。
  * 当 linter 同时修改多个文件时，限制了文件修改提醒的总大小。
  * 修复了 `/remote-control` 重试时显示卡在“正在连接...”的问题——现在每次重试都会显示其结果。
  * 修复了远程控制初始连接失败时，失败通知未显示错误原因的问题。
  * Windows：剪贴板写入不再在 EDR/SIEM 遥测可见的进程命令行参数中暴露复制内容；同时修复了超过 22KB 的选中内容无法写入剪贴板的问题。
  * PowerShell 工具：裸露的 `--`（例如 `git diff -- file`）不再被误标记为 `--%` 停止解析令牌。
  * 修复了当模型在并行工具调用批次中输出格式错误的工具名称时，Agent SDK 挂起的问题。



  * 修复了当设置 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` 时，OAuth 认证会因 401 重试循环而失败的问题



  * 新增 `ANTHROPIC_BEDROCK_SERVICE_TIER` 环境变量以选择 Bedrock 服务层级（`default`、`flex` 或 `priority`），该值将作为 `X-Amzn-Bedrock-Service-Tier` 请求头发送
  * 现在将 PR URL 粘贴到 `/resume` 搜索框中，可找到创建该 PR 的会话（支持 GitHub、GitHub Enterprise、GitLab 和 Bitbucket）
  * `/mcp` 现在会显示被手动添加的同 URL 服务器隐藏的 claude.ai 连接器，并提示移除重复项
  * 明确了当 MCP 服务器在浏览器登录流程后仍处于未授权状态时 `/mcp` 显示的信息
  * OpenTelemetry：`api_request`/`api_error` 日志事件中的数值属性现在以数字而非字符串形式发出
  * OpenTelemetry：为 `@` 提及解析新增 `claude_code.at_mention` 日志事件
  * 修复了当源会话包含已回退时间线条目时，`/branch` 生成的分支会因“发现 tool_use ids 却无对应 tool_result 块”而失败的问题
  * 修复了 `/model` 未为 Bedrock 应用推理配置文件 ARN 显示“Effort”选项，且这些 ARN 未接收 `output_config.effort` 参数的问题
  * 修复了 Vertex AI / Bedrock 在会话标题生成及其他结构化输出查询时返回 `invalid_request_error: output_config: Extra inputs are not permitted` 错误的问题
  * 修复了代理网关后方用户访问 Vertex AI `count_tokens` 端点时返回 400 错误的问题
  * 修复了 `spinnerTipsOverride.excludeDefault` 未能抑制基于时间的旋转提示的问题
  * 修复了 ToolSearch 未包含会话启动后以非阻塞模式连接的 MCP 工具的问题
  * 修复了 bash 模式下 `!exit` / `!quit` 命令会终止 CLI 而非作为 shell 命令执行的问题
  * 修复了发送给新模型的图片被错误调整为每边 2576px 而非正确的 2000px 最大尺寸的问题
  * 修复了远程控制会话空闲状态每秒重绘两次，可能导致 `tmux -CC` 控制管道阻塞并暂停终端的问题
  * 修复了因过期的视图偏好设置导致某些会话中助手消息显示为空白的问题
  * 修复了 `settings.json` 中格式错误的钩子条目不再导致整个文件无效的问题
  * 语音模式：绑定到 Caps Lock 的快捷键现在会显示错误，因为终端无法将 Caps Lock 作为按键事件传递



  * 在 MCP 服务器配置中新增了 `alwaysLoad` 选项 —— 设置为 `true` 时，该服务器的所有工具将跳过工具搜索延迟，始终可用
  * 新增了 `claude plugin prune` 命令以移除孤立的自动安装插件依赖；`plugin uninstall --prune` 会级联处理
  * 在 `/skills` 中新增了类型过滤搜索框，无需滚动即可在长列表中查找技能
  * PostToolUse 钩子现在可以通过 `hookSpecificOutput.updatedToolOutput` 替换所有工具的输出（之前仅限 MCP 工具）
  * 全屏模式：向上滚动查看早期输出后，在提示词处输入内容不再自动跳回底部
  * 现在，终端溢出的对话框在全屏和非全屏模式下均可使用方向键、PgUp/PgDn、Home/End 和鼠标滚轮滚动
  * 在全屏模式下，点击跨行长 URL 的任意行现在会打开完整 URL
  * SDK 和 `claude -p`：`CLAUDE_CODE_FORK_SUBAGENT=1` 现在在非交互式会话中生效
  * `--dangerously-skip-permissions` 不再提示对 `.claude/skills/`、`.claude/agents/` 和 `.claude/commands/` 的写入操作
  * `/terminal-setup` 现在会启用 iTerm2 的“终端中的应用程序可访问剪贴板”设置，使 `/copy` 功能生效，包括在 tmux 中
  * 启动时遇到临时错误的 MCP 服务器现在会自动重试最多 3 次，而非保持断开状态
  * 终端标签页的会话标题现在根据您配置的 `language` 设置生成
  * 具有相同上游 URL 的 Claude.ai 连接器现在会去重，不再显示为重复项
  * Vertex AI：支持基于 X.509 证书的 Workload Identity Federation (mTLS ADC)
  * 升级后启动更快：移除了发布说明启动屏中的“近期活动”面板
  * LSP 诊断摘要现在支持点击/ctrl+o 展开，并显示展开提示
  * SDK：`mcp_authenticate` 现在支持 `redirectUri`，用于自定义方案完成和 claude.ai 连接器
  * OpenTelemetry：在 LLM 请求跨度中添加了 `stop_reason`、`gen_ai.response.finish_reasons` 和 `user_system_prompt`（受 `OTEL_LOG_USER_PROMPTS` 控制）
  * \[VSCode] 语音听写现在在未配置 Claude Code 语言时遵循 `accessibility.voice.speechLanguage` 设置
  * \[VSCode] `/context` 现在打开一个原生的 token 使用情况对话框
  * 修复了在会话中处理大量图像时内存无限制增长（多 GB RSS）的问题
  * 修复了 `/usage` 在具有大量对话历史记录的机器上泄露高达 ~2GB 内存的问题
  * 修复了长时间运行的工具未能发出明确进度事件时的内存泄漏问题
  * 修复了 Claude 启动目录在会话中被删除或移动时，Bash 工具永久不可用的问题
  * 修复了 `--resume` 在外部构建中启动时崩溃的问题
  * 修复了 `--resume` 在大型会话中因对话行被非正常关机损坏而失败的问题 —— 现在会跳过损坏行
  * 修复了使用 Bedrock 应用推理配置文件 ARN 时出现 `thinking.type.enabled is not supported` 错误
  * 修复了 Microsoft 365 MCP OAuth 因重复或不支持的 `prompt` 参数而失败的问题
  * 修复了在 tmux、GNOME Terminal、Windows Terminal 和 Konsole 的非全屏模式下，按 Ctrl+L 或触发重绘时回滚内容重复的问题
  * 修复了启动时连接器列表获取遇到临时身份验证错误时，claude.ai MCP 连接器静默消失的问题
  * 修复了远程会话中内置工具的“始终允许”规则在 worker 重启后失效的问题
  * 修复了通过 `managed-settings.json` 设置 `NO_PROXY` 时，原生构建中未被所有 HTTP 客户端遵循的问题
  * 修复了管理设置审批提示在接受后仍退出会话的问题 —— 现在会应用设置并继续
  * 修复了 `/usage` 在 OAuth token 过期后返回“速率受限”的问题 —— 现在会自动刷新
  * 修复了 `settings.json` 中无效的旧版枚举值导致整个设置文件无效的问题
  * 修复了无闪烁模式关闭时 `/usage` 对话框内容被裁剪的问题
  * 修复了全屏渲染器关闭时 `/focus` 显示“未知命令”的问题 —— 现在会说明如何启用它
  * 修复了运行中的二进制文件在会话中被删除时，嵌入式 grep/find/rg shell 包装器失败的问题 —— 现在会回退到已安装的工具
  * 减少了 Bash 工具在大型目录树中执行 `find` 时的峰值文件描述符使用量



  * Windows：Git for Windows（Git Bash）不再必须安装——当其不存在时，Claude Code 使用 PowerShell 作为 Shell 工具
  * 新增 `claude ultrareview [target]` 子命令，可从 CI 或脚本中非交互式运行 `/ultrareview` ——将发现结果打印到标准输出（使用 `--json` 获取原始输出），完成后退出代码为 0，失败则为 1
  * 技能内容现在可通过 `${CLAUDE_EFFORT}` 引用当前工作量级别
  * 为子进程设置 `AI_AGENT` 环境变量，以便 `gh` 可将流量归因于 Claude Code
  * 当您已拥有桌面应用或技能/代理时，推荐安装桌面应用或创建技能/代理的旋转提示现在会被隐藏
  * 当终端发送方向键而非滚动事件时，显示“使用 PgUp/PgDn 滚动”提示
  * 当配置了许多 claude.ai 连接器但未授权时，会话启动速度更快
  * 自动模式拒绝消息现在链接到配置文档
  * `claude plugin validate` 现在接受 `marketplace.json` 顶层的 `$schema`、`version` 和 `description`，以及 `plugin.json` 中的 `$schema`
  * 自动模式下的自动压缩现在显示 `auto`（小写，无 token 计数），而不是误导性的 token 值
  * 修复了在 stdio MCP 工具调用期间按 Esc 键会关闭整个服务器连接的问题（2.1.105 版本中的回归）
  * 修复了使用 `claude --resume` 启动后 `/rewind` 和其他交互式覆盖层不响应键盘输入的问题
  * 修复了非全屏模式下的终端回滚重复问题（调整大小、关闭对话框、长时间会话）
  * 修复了 `DISABLE_TELEMETRY` / `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 未能为 API 和企业用户抑制使用指标遥测的问题
  * 修复了在自动模式下，对于包含管道和重定向的多行 bash 命令出现误报“危险的 rm 操作”权限提示的问题
  * 修复了在全屏模式下长选择菜单裁剪到终端下方的问题——现在聚焦的选项在您滚动时会保持在屏幕上
  * 修复了全屏模式下点击“+N 行”时写入工具输出折叠而非展开的问题
  * 修复了斜杠命令选择器在输入时跳动的问题，并改进了高亮显示，仅以蓝色匹配连续的子字符串
  * 修复了当某个条目使用无法识别的源格式时 `/plugin` 应用市场加载失败的问题——该条目会显示，但安装时会提示您更新
  * \[VSCode] `/usage` 现在打开原生账户和用量对话框，而不是返回纯文本会话费用
  * \[VSCode] 语音听写现在遵循 `~/.claude/settings.json` 中的 `language` 设置
  * 修复了 Bash 工具中的 `find` 在大型目录树上耗尽打开的文件描述符，导致整个主机崩溃的问题（macOS/Linux 原生构建）



  * `/config` 设置（主题、编辑器模式、详细输出等）现在会持久化到 `~/.claude/settings.json`，并参与项目/本地/策略覆盖优先级
  * 新增 `prUrlTemplate` 设置，可将页脚的 PR 徽章指向自定义代码审查 URL 而非 github.com
  * 新增 `CLAUDE_CODE_HIDE_CWD` 环境变量，用于在启动徽标中隐藏工作目录
  * `--from-pr` 现在支持 GitLab 合并请求、Bitbucket 拉取请求和 GitHub Enterprise PR URL
  * `--print` 模式现在遵循代理的 `tools:` 和 `disallowedTools:` frontmatter，与交互模式行为一致
  * `--agent <name>` 现在遵循内置代理定义的 `permissionMode`
  * PowerShell 工具命令现在可以在权限模式下自动批准，与 Bash 行为一致
  * 钩子：`PostToolUse` 和 `PostToolUseFailure` 钩子输入现在包含 `duration_ms`（工具执行时间，不包括权限提示和 PreToolUse 钩子）
  * 子代理和 SDK MCP 服务器重新配置现在以并行而非串行方式连接服务器
  * 被其他插件版本约束固定的插件现在会自动更新到满足条件的最高 git 标签
  * Vim 模式：在插入模式下按 Esc 不再将队列消息拉回输入框；需再次按 Esc 中断
  * 斜杠命令建议现在会高亮匹配查询的字符
  * 斜杠命令选择器现在会将长描述换行显示而非截断
  * 输出中的 `owner/repo#N` 简写链接现在使用您 git 远程的主机名，而非始终指向 github.com
  * 安全：`blockedMarketplaces` 现在正确执行 `hostPattern` 和 `pathPattern` 条目
  * OpenTelemetry：`tool_result` 和 `tool_decision` 事件现在包含 `tool_use_id`；`tool_result` 还包含 `tool_input_size_bytes`
  * 状态行：stdin JSON 现在包含 `effort.level` 和 `thinking.enabled`
  * 修复粘贴 CRLF 内容（Windows 剪贴板、Xcode 控制台）时在每行之间插入额外空行的问题
  * 修复在使用方括号内粘贴的 kitty 键盘协议序列的终端中，多行粘贴丢失换行符的问题
  * 修复当通过权限拒绝 Bash 工具时，原生 macOS/Linux 构建上 Glob 和 Grep 工具消失的问题
  * 修复在全屏模式下向上滚动时，每次工具完成后会立即跳回底部的问题
  * 修复当服务器为 OAuth 发现请求返回非 JSON 主体时，MCP HTTP 连接失败并提示“Invalid OAuth error response”的问题
  * 修复回放覆盖层对带有图像附件的消息显示“(no prompt)”的问题
  * 修复自动模式通过冲突的“Execute immediately”指令覆盖计划模式的问题
  * 修复不发出响应负载的异步 `PostToolUse` 钩子向会话记录写入空条目的问题
  * 修复当子代理任务通知在队列中孤立时，加载动画持续显示的问题
  * 工具搜索在 Vertex AI 上默认禁用，以避免不支持的测试版标头错误（可通过 `ENABLE_TOOL_SEARCH` 启用）
  * 修复在斜杠命令中使用绝对路径时，`@`-file Tab 补全替换整个提示词的问题
  * 修复通过 Docker 或 SSH 在 macOS Terminal.app 中启动时提示符处出现多余 `p` 字符的问题
  * 修复 HTTP/SSE/WebSocket MCP 服务器 `headers` 中的 `${ENV_VAR}` 占位符在请求前未被替换的问题
  * 修复通过 `--client-secret` 存储的 MCP OAuth 客户端密钥在需要 `client_secret_post` 的服务器进行 token 交换时未被发送的问题
  * 修复 `/skills` 回车键关闭对话框而非在提示词中预填 `/<skill-name>` 的问题
  * 修复 `/agents` 详情视图将子代理不可用的内置工具错误标记为“Unrecognized”的问题
  * 修复当插件缓存不完整时，Windows 上插件的 MCP 服务器无法启动的问题
  * 修复 `/export` 显示当前默认模型而非会话实际使用的模型的问题
  * 修复详细输出设置在重启后不持久化的问题
  * 修复 `/usage` 进度条与其“Resets …”标签重叠的问题
  * 修复当 `${user_config.*}` 引用留空的可选字段时，插件 MCP 服务器失败的问题
  * 修复包含句末数字的列表项将数字换行到下一行的问题
  * 修复进入计划模式时 `/plan` 和 `/plan open` 未对现有计划进行操作的问题
  * 修复在自动压缩前调用的技能被重新执行以应对下一条用户消息的问题
  * 修复 `/reload-plugins` 和 `/doctor` 报告已禁用插件的加载错误的问题
  * 修复使用 `isolation: "worktree"` 的代理工具复用来自先前会话的陈旧工作树的问题
  * 修复已禁用的 MCP 服务器在 `/status` 中显示为“failed”的问题
  * 修复 `TaskList` 按任意文件系统顺序而非 ID 排序返回任务的问题
  * 修复当 `gh` 输出包含提及“rate limit”的 PR 标题时出现误导性的“GitHub API rate limit exceeded”提示的问题
  * 修复 SDK/bridge `read_file` 未正确对增长文件强制执行大小上限的问题
  * 修复在 git 工作树中工作时 PR 未关联到会话的问题
  * 修复 `/doctor` 对被更高优先级作用域覆盖的 MCP 服务器条目发出警告的问题
  * Windows：移除误报的“Windows requires 'cmd /c' wrapper”MCP 配置警告
  * \[VSCode] 修复在 macOS 上麦克风权限提示显示时，语音听写首次录制无内容的问题



  *   添加 vim 可视模式 (`v`) 和行可视模式 (`V`)，支持选择、操作和视觉反馈
  *   将 `/cost` 和 `/stats` 合并为 `/usage` —— 两者仍可作为输入快捷方式打开相关标签页
  *   通过 `/theme` 创建和切换命名的自定义主题，或在 `~/.claude/themes/` 中手动编辑 JSON 文件；插件也可通过 `themes/` 目录提供主题
  *   钩子现在可以直接通过 `type: "mcp_tool"` 调用 MCP 工具
  *   添加 `DISABLE_UPDATES` 环境变量以完全阻止所有更新路径，包括手动 `claude update` —— 比 `DISABLE_AUTOUPDATER` 更严格
  *   Windows 上的 WSL 现在可以通过 `wslInheritsWindowsSettings` 策略键继承 Windows 端的托管设置
  *   自动模式：在 `autoMode.allow`、`autoMode.soft_deny` 或 `autoMode.environment` 中包含 `"$defaults"` 以在内置列表旁添加自定义规则，而非替换它
  *   为自动模式选择加入提示添加了“不再询问”选项
  *   添加了 `claude plugin tag`，用于创建带有版本验证的插件发布 git 标签
  *   `--continue`/`--resume` 现在能找到通过 `/add-dir` 添加了当前目录的会话
  *   `/color` 现在会在远程控制连接时将会话强调色同步到 claude.ai/code
  *   `/model` 选择器现在在使用自定义 `ANTHROPIC_BASE_URL` 网关时会遵循 `ANTHROPIC_DEFAULT_*_MODEL_NAME`/`_DESCRIPTION` 覆盖设置
  *   当自动更新因另一个插件的版本约束而跳过某个插件时，该跳过记录现在会出现在 `/doctor` 和 `/plugin` 的“错误”标签页中
  *   修复了 `/mcp` 菜单对配置了 `headersHelper` 的服务器隐藏 OAuth 认证/重新认证操作的问题，以及具有自定义头的 HTTP/SSE MCP 服务器在遇到临时 401 错误后卡在“需要认证”状态的问题
  *   修复了 MCP 服务器的 OAuth 令牌响应省略 `expires_in` 导致每小时需要重新认证的问题
  *   修复了 MCP 逐步授权在服务器的 `insufficient_scope` 403 错误指定了当前令牌已具有的范围时，静默刷新而非提示重新同意的问题
  *   修复了 MCP 服务器的 OAuth 流程超时或取消时未处理的 Promise 拒绝错误
  *   修复了 MCP OAuth 刷新在存在跨进程锁竞争时仍继续进行的问题
  *   修复了 macOS 钥匙串的竞争条件，即并发的 MCP 令牌刷新可能覆盖刚刚刷新的 OAuth 令牌，导致意外出现“请运行 /login”的提示
  *   修复了服务器在本地到期时间前撤销令牌时 OAuth 令牌刷新失败的问题
  *   修复了在 Linux/Windows 上保存凭证时崩溃导致 `~/.claude/.credentials.json` 损坏的问题
  *   修复了在使用 `CLAUDE_CODE_OAUTH_TOKEN` 启动的会话中 `/login` 无效的问题 —— 现在环境变量令牌会被清除，以便磁盘凭证生效
  *   修复了“新消息”滚动胶囊和 `/plugin` 徽章中文本不可读的问题
  *   修复了在使用 `--dangerously-skip-permissions` 运行时，计划接受对话框提供“自动模式”而非“绕过权限”的问题
  *   修复了代理类型钩子在配置为 `Stop` 或 `SubagentStop` 以外事件时因“代理钩子需要消息”而失败的问题
  *   修复了 `prompt` 钩子在由代理钩子验证器子代理执行的工具调用上重复触发的问题
  *   修复了 `/fork` 在每次分叉时将整个父对话写入磁盘的问题 —— 现在改为写入指针并在读取时水合
  *   修复了 Alt+K / Alt+X / Alt+^ / Alt+_ 冻结键盘输入的问题
  *   修复了连接到远程会话时覆盖本地 `~/.claude/settings.json` 中 `model` 设置的问题
  *   修复了当粘贴以 `/` 开头的文件路径时，预先输入显示“没有匹配的命令”错误的问题
  *   修复了对已安装插件执行 `plugin install` 时未重新解析错误版本安装的依赖项的问题
  *   修复了文件监视器在无效路径或文件描述符耗尽时引发的未处理错误
  *   修复了在 JWT 刷新期间因临时 CCR 初始化问题导致远程控制会话被归档的问题
  *   修复了通过 `SendMessage` 恢复的子代理未恢复其生成时明确指定的 `cwd` 的问题



  * 通过设置 `CLAUDE_CODE_FORK_SUBAGENT=1`，现在可以在外部构建中启用派生的子代理
  * Agent frontmatter `mcpServers` 现在通过 `--agent` 为主要线程代理会话加载
  * 改进的 `/model`：选择现在即使项目固定了不同模型也会在重启后持久化，并且启动标题会显示活动模型是否来自项目或托管设置固定值
  * `/resume` 命令现在会在重新读取过时的大型会话前提供摘要选项，与现有的 `--resume` 行为一致
  * 当同时配置了本地和 claude.ai MCP 服务器时，启动速度更快（现在默认并发连接）
  * 在已安装的插件上执行 `plugin install` 现在会安装任何缺失的依赖项，而不是停在“已安装”状态
  * 插件依赖错误现在会显示“未安装”并附带安装提示，且 `claude plugin marketplace add` 现在会从配置的市场中自动解析缺失的依赖项
  * 托管设置中的 `blockedMarketplaces` 和 `strictKnownMarketplaces` 现在会在插件安装、更新、刷新和自动更新时强制执行
  * Advisor 工具（实验性）：对话现在包含“实验性”标签、了解更多链接以及启用时的启动通知；会话不再因每个提示词和 `/compact` 出现“无法处理 Advisor 工具结果内容”错误而卡住
  * `cleanupPeriodDays` 保留扫描现在还覆盖 `~/.claude/tasks/`、`~/.claude/shell-snapshots/` 和 `~/.claude/backups/`
  * OpenTelemetry：`user_prompt` 事件现在为斜杠命令包含 `command_name` 和 `command_source`；`cost.usage`、`token.usage`、`api_request` 和 `api_error` 现在在模型支持 effort 级别时包含 `effort` 属性。除非设置 `OTEL_LOG_TOOL_DETAILS=1`，否则自定义/MCP 命令名称会被编辑
  * macOS 和 Linux 上的原生构建：`Glob` 和 `Grep` 工具被嵌入的 `bfs` 和 `ugrep` 替代，通过 Bash 工具访问——搜索更快，无需单独的工具往返（Windows 和 npm 安装的构建不变）
  * Windows：缓存了每个进程的 `where.exe` 可执行文件查找，以加快子进程启动速度
  * Pro/Max 订阅者在 Opus 4.6 和 Sonnet 4.6 上的默认 effort 现在为 `high`（之前是 `medium`）
  * 修复了在访问令牌会话中期过期时，Plain-CLI OAuth 会话因“请运行 /login”而终止的问题——现在会在 401 时主动刷新令牌
  * 修复了 `WebFetch` 在非常大的 HTML 页面上挂起的问题，在 HTML 转换为 markdown 之前截断输入
  * 修复了代理返回 HTTP 204 No Content 时导致崩溃的问题——现在会显示清晰的错误而不是 `TypeError`
  * 修复了使用 `CLAUDE_CODE_OAUTH_TOKEN` 环境变量启动且该令牌过期时 `/login` 无效的问题
  * 修复了提示输入撤销（`Ctrl+_`）在输入后立即无效，以及每次撤销步骤跳过一个状态的问题
  * 修复了在 Bun 下运行时远程 API 请求不遵守 `NO_PROXY` 的问题
  * 修复了在慢速连接上按键名称作为合并文本到达时，偶尔出现虚假的 esc/return 触发问题
  * 修复了 SDK `reload_plugins` 串行重新连接所有用户 MCP 服务器的问题
  * 修复了在禁用 thinking 的 Opus 4.7 支持下，Bedrock application-inference-profile 请求因 400 失败的问题
  * 修复了在打印/SDK 模式下，当服务器在轮次中完成连接时，MCP `elicitation/create` 请求自动取消的问题
  * 修复了运行与主代理不同模型的子代理错误地将文件读取标记为恶意软件警告的问题
  * 修复了后台任务存在时的空闲重渲染循环，减少 Linux 上的内存增长
  * [VSCode] 修复了当配置多个大型市场时“管理插件”面板损坏的问题
  * 修复了 Opus 4.7 会话显示夸大的 `/context` 百分比并过早自动压缩的问题——Claude Code 之前是基于 200K 上下文窗口计算的，而不是 Opus 4.7 原生的 1M



  * `/resume` 在大型会话上显著提速（40MB 以上会话最高提升 67%），并能更高效地处理包含大量无效分支条目的会话
  * 当配置了多个 stdio 服务器时，MCP 启动速度更快；`resources/templates/list` 现在延迟到首次使用 `@` 提及时才加载
  * 在 VS Code、Cursor 和 Windsurf 终端中实现了更流畅的全屏滚动——`/terminal-setup` 现可配置编辑器的滚动灵敏度
  * 思考状态指示器现在内联显示进度（"仍在思考"、"继续思考中"、"思考接近完成"），取代了之前的单独提示行
  * `/config` 搜索现在能匹配选项值（例如搜索 "vim" 会找到编辑器模式设置）
  * `/doctor` 现在可在 Claude 响应期间打开，无需等待当前回合结束
  * `/reload-plugins` 和后台插件自动更新现在会自动从你已添加的市场安装缺失的插件依赖
  * 当 `gh` 命令触发 GitHub API 速率限制时，Bash 工具现在会显示提示，以便代理可以退避而非重试
  * 设置中的"用量"选项卡现在立即显示你的 5 小时和周用量，并在用量端点被限速时不再失败
  * 代理前置元数据 `hooks:` 现在在通过 `--agent` 作为主线程代理运行时也会触发
  * 斜杠命令菜单现在在过滤结果为空时显示"没有匹配的命令"，而不是直接消失
  * 安全性：沙箱自动允许不再绕过针对 `/`、`$HOME` 或其他关键系统目录的 `rm`/`rmdir` 危险路径安全检查
  * Claude Code 和安装程序现在使用 `https://downloads.claude.ai/claude-code-releases` 而非 `https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases`
  * 修复了天城文及其他印度文字在终端用户界面中列对齐断裂的问题
  * 修复了在使用 Kitty 键盘协议的终端（iTerm2、Ghostty、kitty、WezTerm、Windows Terminal）中 Ctrl+- 无法触发撤销的问题
  * 修复了在使用 Kitty 键盘协议的终端（Warp 全屏、kitty、Ghostty、WezTerm）中 Cmd+Left/Right 无法跳转到行首/行尾的问题
  * 修复了通过包装进程（例如 `npx`、`bun run`）启动 Claude Code 时 Ctrl+Z 导致终端挂起的问题
  * 修复了在内联模式下，终端大小调整或大量输出突发会重复先前对话历史导致的回滚内容重复问题
  * 修复了在终端高度较短时模态搜索对话框溢出屏幕、隐藏搜索框和键盘提示的问题
  * 修复了 VS Code 集成终端中滚动时出现的分散空白单元格和作曲栏边框消失问题
  * 修复了一个与缓存控制 TTL 排序相关的间歇性 API 400 错误，该错误可能在并行请求于请求设置期间完成时发生
  * 修复了 `/branch` 拒绝处理转录内容大于 50MB 的对话的问题
  * 修复了 `/resume` 在大型会话文件上静默显示空对话而非报告加载错误的问题
  * 修复了 `/plugin` 已安装选项卡在需要关注或收藏项中显示时出现同一项重复显示的问题
  * 修复了在会话中途进入工作树后 `/update` 和 `/tui` 无法工作的问题



  * 修复了当代理团队成员请求工具权限时，权限对话框崩溃的问题



  * 将命令行工具改为启动原生 Claude Code 二进制文件（通过平台相关的可选依赖），而非打包的 JavaScript
  * 新增 `sandbox.network.deniedDomains` 设置，即使更宽泛的 `allowedDomains` 通配符允许访问，也能屏蔽特定域名
  * 全屏模式：当选择扩展到可见区域边缘外时，Shift+↑/↓ 现在会滚动视口
  * `Ctrl+A` 和 `Ctrl+E` 在多行输入中现在会移动到当前逻辑行的开头/末尾，与 readline 行为一致
  * Windows：`Ctrl+Backspace` 现在会删除前一个单词
  * 响应和 bash 输出中的长 URL 在换行时（在支持 OSC 8 超链接的终端中）仍保持可点击状态
  * 改进了 `/loop`：现在按 Esc 会取消待处理的唤醒，且唤醒会显示为 "Claude resuming /loop wakeup" 以便清晰
  * `/extra-usage` 现在可从远程控制（移动端/网页）客户端使用
  * 远程控制客户端现在可以查询 `@`-文件自动补全建议
  * 改进了 `/ultrareview`：通过并行检查加速启动，在启动对话框中显示 diffstat，并添加了动画化的启动状态
  * 在流式传输中途停滞的子代理现在会在 10 分钟后因清晰的错误而失败，而不是静默挂起
  * Bash 工具：首行为注释的多行命令现在会在日志中显示完整命令，堵住 UI 欺骗漏洞
  * 运行 `cd <current-directory> && git …` 当 `cd` 是空操作时，不再触发权限提示
  * 安全：在 macOS 上，`/private/{etc,var,tmp,home}` 路径在 `Bash(rm:*)` 允许规则下现在被视为危险的删除目标
  * 安全：Bash 拒绝规则现在会匹配包裹在 `env`/`sudo`/`watch`/`ionice`/`setsid` 及类似执行包装器中的命令
  * 安全：`Bash(find:*)` 允许规则不再自动批准 `find -exec`/`-delete`
  * 修复了 MCP 并发调用超时处理中，某个工具调用的消息可能静默解除另一个调用的看门狗的问题
  * 修复了 Cmd-backspace / `Ctrl+U` 现在会再次从光标处删除到行首
  * 修复了单元格包含带管道符的内联代码块时，Markdown 表格被破坏的问题
  * 修复了在提示词中编辑未发送文本时，会话摘要自动触发的问题
  * 修复了 `/copy` "完整响应" 复制到 GitHub、Notion 或 Slack 时 Markdown 表格列未对齐的问题
  * 修复了在查看运行中的子代理时输入的消息未被记录在其日志中，且被错误归属给父级 AI 的问题
  * 修复了 Bash `dangerouslyDisableSandbox` 在沙箱外运行命令时未弹出权限提示的问题
  * 修复了 `/effort auto` 的确认消息——现在显示为 "Effort level set to max" 以匹配状态栏标签
  * 修复了 "copied N chars" 提示气泡对 emoji 和其他多编码单元字符计数过多的问题
  * 修复了 `/insights` 在 Windows 上因 `EBUSY` 崩溃的问题
  * 修复了退出确认对话框错误地将一次性定时任务标记为循环任务的问题——现在会显示倒计时
  * 修复了在全屏模式下斜杠/@ 补全菜单未紧贴提示词边框的问题
  * 修复了 `CLAUDE_CODE_EXTRA_BODY` `output_config.effort` 在子代理调用不支持 effort 的模型及 Vertex AI 时导致 400 错误的问题
  * 修复了设置 `NO_COLOR` 时提示词光标消失的问题
  * 修复了 `ToolSearch` 排名，使得粘贴的 MCP 工具名称能显示实际工具，而非描述匹配的类似工具
  * 修复了恢复长上下文会话时压缩失败并提示 "Extra usage is required for long context requests" 的问题
  * 修复了依赖版本与已安装插件冲突时 `plugin install` 仍成功的问题——现在会报告 `range-conflict`
  * 修复了 "Refine with Ultraplan" 未在日志中显示远程会话 URL 的问题
  * 修复了无法处理的 SDK 图像内容块导致会话崩溃的问题——现在会降级为文本占位符
  * 修复了远程控制会话不流式传输子代理日志的问题
  * 修复了 Claude Code 退出时远程控制会话未被归档的问题
  * 修复了通过 Bedrock Application Inference Profile ARN 使用 Opus 4.7 时出现 `thinking.type.enabled is not supported` 400 错误的问题



  * 修复了自动模式下出现的"claude-opus-4-7 is temporarily unavailable"问题



  * Claude Opus 4.7 xhigh 现已上线！使用 `/effort` 来调整速度与智能的平衡
  * 当使用 Opus 4.7 时，自动模式现对 Max 订阅用户可用
  * 为 Opus 4.7 添加了 `xhigh` 努力级别，介于 `high` 和 `max` 之间。可通过 `/effort`、`--effort` 和模型选择器使用；其他模型将回退到 `high`
  * `/effort` 现在在不带参数调用时会打开一个交互式滑块，支持用方向键在各级别间导航，按 Enter 确认
  * 添加了 "Auto (match terminal)" 主题选项，可匹配您终端的深色/浅色模式 — 从 `/theme` 中选择
  * 添加了 `/less-permission-prompts` 技能 — 扫描对话记录中的常见只读 Bash 和 MCP 工具调用，并为 `.claude/settings.json` 提出优先级允许列表
  * 添加了 `/ultrareview`，用于在云端使用并行多代理分析和批判进行综合代码审查 — 不带参数调用可审查当前分支，或使用 `/ultrareview <PR#>` 来获取并审查特定的 GitHub PR
  * 自动模式不再需要 `--enable-auto-mode`
  * Windows：PowerShell 工具正在逐步推出。使用 `CLAUDE_CODE_USE_POWERSHELL_TOOL` 来选择启用或禁用。在 Linux 和 macOS 上，通过 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` 启用（需要 `pwsh` 在 PATH 中）
  * 带有 glob 模式的只读 bash 命令（例如 `ls *.ts`）和以 `cd <project-dir> &&` 开头的命令不再触发权限提示
  * 当输入 `claude <word>` 有近似拼写错误时，会建议最匹配的子命令（例如 `claude udpate` → “您是指 `claude update` 吗？”）
  * 计划文件现在根据您的提示词命名（例如 `fix-auth-race-snug-otter.md`），而不是纯粹随机的单词
  * 改进了 `/setup-vertex` 和 `/setup-bedrock`，当设置了 `CLAUDE_CONFIG_DIR` 时显示实际的 `settings.json` 路径，在重新运行时从现有固定版本中加载模型候选项，并为支持的模型提供“带 1M 上下文”选项
  * `/skills` 菜单现在支持按预估 token 数排序 — 按 `t` 切换
  * `Ctrl+U` 现在清除整个输入缓冲区（之前：删除到行首）；按 `Ctrl+Y` 可恢复
  * `Ctrl+L` 现在除了清除提示词输入外，还会强制全屏重绘
  * 对话视图页脚现在显示 `[`（转储到滚动缓冲区）和 `v`（在编辑器中打开）快捷键
  * 截断长粘贴内容的 "+N lines" 标记现在变成了全宽分隔线，便于浏览
  * 无头模式 `--output-format stream-json` 现在在 init 事件中包含 `plugin_errors`，当插件因未满足的依赖项而被降级时
  * 添加了 `OTEL_LOG_RAW_API_BODIES` 环境变量，以将完整的 API 请求和响应体作为 OpenTelemetry 日志事件发出，用于调试
  * 抑制了在正常操作期间 TUI 中可能出现的虚假的解压、网络和瞬时错误消息
  * 撤销了 v2.1.110 对非流式回退重试的上限设置 — 该设置在 API 过载期间用更长时间的等待换来了更多彻底的失败
  * 修复了在 iTerm2 + tmux 环境中，当发送终端通知时出现的显示撕裂问题（随机字符、输入漂移）
  * 修复了在非 git 工作目录中，`@` 文件建议在每个回合都重新扫描整个项目的问题，以及在只有没有被跟踪文件的新初始化 git 仓库中仅显示配置文件的问题
  * 修复了编辑前的 LSP 诊断信息出现在编辑之后，导致模型重新读取它刚刚编辑过的文件的问题
  * 修复了制表符补全 `/resume` 会立即恢复任意标题的会话，而不是显示会话选择器的问题
  * 修复了 `/context` 网格渲染时行间出现多余空行的问题
  * 修复了 `/clear` 会丢弃由 `/rename` 设置的会话名称，导致状态栏输出丢失 `session_name` 的问题
  * 改进了插件错误处理：依赖错误现在能区分冲突、无效和过于复杂的版本要求；修复了 `plugin update` 后解析版本过时的问题；`plugin install` 现在能从之前被中断的安装中恢复
  * 修复了 Claude 调用不存在的 `commit` 技能，并向没有自定义 `/commit` 命令的用户显示 “Unknown skill: commit” 的问题
  * 修复了在 Bedrock/Vertex/Foundry 上出现的 429 速率限制错误，该错误引用了 status.claude.com（它只涵盖 Anthropic 运营的服务提供商）
  * 修复了在关闭一个反馈调查后，又紧跟着出现另一个反馈调查的问题
  * 修复了 bash/PowerShell/MCP 工具输出中的裸 URL，当终端将其换行显示时无法点击的问题
  * Windows：`CLAUDE_ENV_FILE` 和 SessionStart 钩子环境文件现在生效（之前是无效操作）
  * Windows：带有驱动器字母路径的权限规则现在能正确锚定到根目录，并且仅在驱动器字母大小写上不同的路径被识别为相同路径



  * 新增 `/tui` 命令及 `tui` 设置 — 在同一对话中运行 `/tui fullscreen` 可切换至无闪烁渲染模式
  * 新增推送通知工具 — 启用远程控制并配置“当 Claude 决定时推送”后，Claude 可发送移动端推送通知
  * 变更 `Ctrl+O` 仅切换普通与详细记录视图；聚焦视图现需通过新 `/focus` 命令独立切换
  * 新增 `autoScrollEnabled` 配置项以禁用全屏模式下的对话自动滚动
  * 新增选项：在 `Ctrl+G` 外部编辑器中将 Claude 最后回复显示为注释上下文（通过 `/config` 启用）
  * 改进 `/plugin` 已安装标签页 — 需关注项与收藏项置顶显示，禁用项折叠隐藏，按 `f` 可收藏选中项
  * 改进 `/doctor` 诊断：当 MCP 服务器在多配置范围中以不同端点定义时发出警告
  * `--resume`/`--continue` 现可恢复未过期的计划任务
  * `/context`、`/exit`、`/reload-plugins` 现已支持从远程控制（移动端/网页）客户端执行
  * 写入工具现在会通知模型：当您在 IDE 差异对比中编辑建议内容后再接受
  * Bash 工具现强制执行文档规定的最大超时值，而非接受任意大的数值
  * SDK/无头会话现从环境变量读取 `TRACEPARENT`/`TRACESTATE` 以实现分布式追踪链接
  * 会话摘要功能现已对禁用遥测的用户启用（Bedrock、Vertex、Foundry、`DISABLE_TELEMETRY`）。可通过 `/config` 或设置 `CLAUDE_CODE_ENABLE_AWAY_SUMMARY=0` 选择退出
  * 修复 SSE/HTTP 传输中 MCP 服务器连接中断时工具调用无限挂起的问题
  * 修复 API 不可达时非流式回退重试导致长达数分钟的挂起
  * 修复聚焦模式下会话摘要、本地斜杠命令输出及其他系统状态行未显示的问题
  * 修复全屏模式下工具运行时选中文本导致的高 CPU 占用
  * 修复插件安装时未遵循 `plugin.json` 中声明的依赖项问题（当市场条目遗漏时）；`/plugin` 安装现会列出自动安装的依赖项
  * 修复消息中途通过 `/<skill>` 调用带 `disable-model-invocation: true` 的技能失败的问题
  * 修复 `--resume` 有时对运行中或非正常退出的会话显示首个提示词而非 `/rename` 名称的问题
  * 修复多工具调用回合中队列消息短暂重复显示的问题
  * 修复会话清理未移除完整会话目录（包括子代理记录）的问题
  * 修复 CLI 重启后（如 `/tui`、提供商设置向导）出现的按键丢失问题
  * 修复 macOS Terminal.app 及其他不支持同步输出的终端启动渲染乱码问题
  * 加固“在编辑器中打开”操作以防御不受信任文件名导致的命令注入
  * 修复 `PermissionRequest` 钩子返回 `updatedInput` 时未重新根据 `permissions.deny` 规则检查的问题；`setMode:'bypassPermissions'` 更新现遵循 `disableBypassPermissionsMode` 设置
  * 修复 `PreToolUse` 钩子的 `additionalContext` 在工具调用失败时被丢弃的问题
  * 修复 stdio MCP 服务器向 stdout 输出无关非 JSON 行时在首条无关行即断开连接的问题（2.1.105 版本回归）
  * 修复设置 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 或 `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` 时无头/SDK 会话自动生成标题会额外触发 Haiku 请求的问题
  * 修复管道（非 TTY）Ink 输出包含单行超宽文本时潜在的内存过度分配问题
  * 修复全屏模式下 `/skills` 菜单列表溢出弹窗时无法滚动的问题
  * 修复远程控制会话过期时显示通用错误而非提示重新登录的问题
  * 修复从 claude.ai 重命名远程控制会话时标题未持久化到本地 CLI 会话的问题



  * 改进了扩展思考指示器，增加了旋转进度提示



  * 新增 `ENABLE_PROMPT_CACHING_1H` 环境变量，用于在 API key、Bedrock、Vertex 和 Foundry 上启用 1 小时提示词缓存 TTL（`ENABLE_PROMPT_CACHING_1H_BEDROCK` 已弃用但仍生效），以及 `FORCE_PROMPT_CACHING_5M` 用于强制 5 分钟 TTL
  * 新增摘要功能，在返回会话时提供上下文；可在 `/config` 中配置，也可通过 `/recap` 手动调用；若禁用遥测，可通过 `CLAUDE_CODE_ENABLE_AWAY_SUMMARY` 强制启用
  * 模型现在可通过 Skill 工具发现并调用内置斜杠命令，如 `/init`、`/review` 和 `/security-review`
  * `/undo` 现为 `/rewind` 的别名
  * 优化 `/model`，在对话中途切换模型前发出警告，因为下一次响应将重新读取完整历史记录且无法缓存
  * 优化 `/resume` 选择器，默认显示当前目录的会话；按 `Ctrl+A` 显示所有项目
  * 改进错误信息：服务器速率限制现与计划使用限制明确区分；5xx/529 错误显示指向 status.claude.com 的链接；未知斜杠命令会提示最接近的匹配项
  * 通过按需加载语言语法，降低文件读取、编辑和语法高亮的内存占用
  * 查看详细对话记录 (`Ctrl+O`) 时新增“详细模式”指示器
  * 若通过 `DISABLE_PROMPT_CACHING*` 环境变量禁用提示词缓存，启动时将显示警告
  * 修复 `/login` 代码提示中粘贴功能失效的问题（2.1.105 中的回归）
  * 修复设置了 `DISABLE_TELEMETRY` 的订阅者回退到 5 分钟提示词缓存 TTL 而非 1 小时的问题
  * 修复在安全分类器的对话记录超出其上下文窗口时，Agent 工具在自动模式下仍提示权限的问题
  * 修复当 `CLAUDE_ENV_FILE`（如 `~/.zprofile`）以 `#` 注释行结尾时，Bash 工具不产生输出的问题
  * 修复 `claude --resume <session-id>` 丢失通过 `/rename` 设置的会话自定义名称和颜色的问题
  * 修复当第一条消息是简短问候语时，会话标题显示为占位示例文本的问题
  * 修复在 `--teleport` 后，提示输入区域的终端转义码显示为乱码的问题
  * 修复 `/feedback` 重试功能：现在失败后按 Enter 重新提交无需先编辑描述
  * 修复 `--teleport` 和 `--resume <id>` 前置条件错误（如 git 工作树不干净、会话未找到）时静默退出而非显示错误信息的问题
  * 修复在 Web UI 中设置的 Remote Control 会话标题在第三条消息后被自动生成的标题覆盖的问题
  * 修复当对话记录包含自引用消息时，`--resume` 导致会话被截断的问题
  * 修复对话记录写入失败（如磁盘已满）被静默忽略而非记录日志的问题
  * 修复当配置了 `language` 设置时，响应中的变音符号（重音符号、元音变音符、软音符）被丢弃的问题
  * 修复从非首次安装项目运行时，策略管理的插件永不自动更新的问题



  * 在长操作期间更早显示思考提示



  * 为 `EnterWorktree` 工具添加了 `path` 参数，用于切换到当前仓库的现有工作树
  * 新增 PreCompact 钩子支持：钩子现在可以通过退出码 2 或返回 `{"decision":"block"}` 来阻止压缩操作
  * 新增通过顶级 `monitors` 清单键支持的插件后台监控器功能，该功能在会话启动或技能调用时自动激活
  * `/proactive` 现在是 `/loop` 的别名
  * 改进了停滞的 API 流处理：流现在会在无数据五分钟后中止，并改为重试非流式传输而非无限挂起
  * 改进了网络错误信息：连接错误现在会立即显示重试信息，而不是显示静默的加载动画
  * 改进了文件写入显示：长单行写入（例如压缩的 JSON）现在会在界面中截断显示，而不是跨多页分页
  * 改进了 `/doctor` 布局，增加状态图标；按 `f` 键可让 Claude 修复报告的问题
  * 改进了 `/config` 的标签和描述以提升清晰度
  * 改进了技能描述处理：将列出上限从 250 个字符提高到 1,536 个字符，并在描述被截断时添加启动警告
  * 改进了 `WebFetch`，从获取的页面中剥离 `<style>` 和 `<script>` 内容，以便 CSS 密集型页面在达到实际文本内容前不会耗尽内容预算
  * 改进了过期代理工作树的清理，现在会删除那些 PR 已被 squash 合并的工作树，而不是无限期保留
  * 改进了 MCP 大输出截断提示，提供特定格式的处理建议（例如 JSON 使用 `jq`，文本计算读取块大小）
  * 修复了附加到排队消息（在 Claude 工作时发送）的图片被丢弃的问题
  * 修复了在长对话中提示词输入换行到第二行时屏幕变为空白的问题
  * 修复了在全屏模式下选择多行助手回复时，开头空格被复制的问题
  * 修复了助手消息开头空格被修剪，破坏 ASCII 艺术和缩进图表的问题
  * 修复了当命令打印可点击文件链接时（例如 Python 的 `rich`/`loguru` 日志记录），bash 输出乱码的问题
  * 修复了在使用 ESC 前缀 alt 编码的终端中 alt+enter 不插入换行，以及 Ctrl+J 不插入换行（2.1.100 版本中的回归问题）
  * 修复了在 EnterWorktree/ExitWorktree 工具显示中出现重复的 "Creating worktree" 文本
  * 修复了排队的用户提示词从焦点模式中消失的问题
  * 修复了一次性计划任务在文件监视器错过触发后清理时，会重复触发的问题
  * 修复了 Team/Enterprise 用户的入站通道通知在第一条消息后被静默丢弃的问题
  * 修复了带有 `package.json` 和锁文件的市场插件在安装/更新后未自动安装依赖项的问题
  * 修复了当插件进程在更新期间保持文件打开时，市场自动更新使官方市场处于损坏状态的问题
  * 修复了通过 `/resume`、`--worktree` 或 `/branch` 退出后未打印 "Resume this session with..." 提示的问题
  * 修复了在较长提示词末尾输入时，反馈调查快捷键被触发的问题
  * 修复了 stdio MCP 服务器输出格式错误（非 JSON）导致会话挂起，而不是快速失败并提示 "Connection closed" 的问题
  * 修复了在无头/远程触发会话的第一轮中，当 MCP 服务器异步连接时 MCP 工具缺失的问题
  * 修复了在非美国地区的 AWS Bedrock 上，当推理配置文件发现仍在进行中时，`/model` 选择器会将无效的 `us.*` 模型 ID 持久化到 `settings.json` 的问题
  * 修复了 API 密钥、Bedrock 和 Vertex 用户看到 429 速率限制错误时，显示原始 JSON 转储而非清晰消息的问题
  * 修复了当会话包含格式错误的文本块时，恢复会话导致崩溃的问题
  * 修复了在终端高度较短时 `/help` 丢失标签栏、快捷键标题和页脚的问题
  * 修复了 `keybindings.json` 中格式错误的键绑定条目值被静默加载，而不是通过清晰错误拒绝的问题
  * 修复了一个项目设置中的 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 永久禁用了该机器上所有项目的使用指标的问题
  * 修复了通过 SSH/mosh 使用 Ghostty、Kitty、Alacritty、WezTerm、foot、rio 或 Contour 时，16 色调色板颜色失真的问题
  * 修复了 Bash 工具在退出计划模式会降级权限级别时，建议使用 `acceptEdits` 权限模式的问题



  * 新增 `/team-onboarding` 命令，可根据您的本地 Claude Code 使用情况生成队友上手指南
  * 默认添加操作系统 CA 证书存储信任，企业 TLS 代理无需额外配置即可工作（设置 `CLAUDE_CODE_CERT_STORE=bundled` 可仅使用内置 CA）
  * `/ultraplan` 和其他远程会话功能现在会自动创建默认云环境，无需先进行网页设置
  * 改进了简要模式，当 Claude 以纯文本而非结构化消息响应时会重试一次
  * 改进了专注模式：由于 Claude 知道您只看到其最终消息，它现在会撰写更自包含的摘要
  * 改进了工具不可用错误信息，在模型调用存在但当前上下文不可用的工具时，会解释原因及后续操作
  * 改进了速率限制重试消息，现在会显示触及的是哪项限制及其重置时间，而非不透明的秒数倒计时
  * 改进了拒绝错误消息，在可用时会包含 API 提供的解释
  * 改进了 `claude -p --resume <name>` 以接受通过 `/rename` 或 `--name` 设置的会话标题
  * 改进了设置稳定性：`settings.json` 中无法识别的钩子事件名称不再导致整个文件被忽略
  * 改进了由受管设置强制启用的插件的钩子，使其在设置 `allowManagedHooksOnly` 时也能运行
  * 改进了 `/plugin` 和 `claude plugin update`，当无法刷新市场时会显示警告，而非静默报告过时版本
  * 改进了计划模式，当用户组织或认证设置无法访问网页版 Claude Code 时，会隐藏“使用 Ultraplan 优化”选项
  * 改进了测试版追踪，以遵循 `OTEL_LOG_USER_PROMPTS`、`OTEL_LOG_TOOL_DETAILS` 和 `OTEL_LOG_TOOL_CONTENT`；除非选择加入，否则不再发出敏感的 span 属性
  * 改进了 SDK `query()`，在使用者从 `for await` 中 `break` 或使用 `await using` 时清理子进程和临时文件
  * 修复了 LSP 二进制检测中使用的 POSIX `which` 回退中的命令注入漏洞
  * 修复了长时间会话在虚拟滚动器中保留数十份历史消息列表副本的内存泄漏
  * 修复了 `--resume`/`--continue` 在大会话上，当加载器定位到死胡同分支而非活跃对话时丢失对话上下文的问题
  * 修复了 `--resume` 链恢复时，在子代理消息落入主链写入间隙附近时，误连接到不相关子代理对话的问题
  * 修复了当持久化的 Edit/Write 工具结果缺少 `file_path` 时，`--resume` 崩溃的问题
  * 修复了硬编码的 5 分钟请求超时，无论 `API_TIMEOUT_MS` 设置如何，都会中止缓慢后端（本地 LLM、扩展思考、慢速网关）
  * 修复了 `permissions.deny` 规则无法覆盖 PreToolUse 钩子的 `permissionDecision: "ask"` 的问题——之前钩子可能将拒绝降级为提示
  * 修复了 `--setting-sources` 不包含 `user` 时，后台清理忽略 `cleanupPeriodDays` 并删除超过 30 天对话历史的问题
  * 修复了当 `ANTHROPIC_AUTH_TOKEN`、`apiKeyHelper` 或 `ANTHROPIC_CUSTOM_HEADERS` 设置了 Authorization 头时，Bedrock SigV4 认证因 403 错误而失败的问题
  * 修复了在先前会话的工作树清理后留下陈旧目录时，`claude -w <name>` 因“已存在”而失败的问题
  * 修复了子代理未从动态注入的服务器继承 MCP 工具的问题
  * 修复了在隔离工作树中运行的子代理被拒绝对其自身工作树内文件进行 Read/Edit 访问的问题
  * 修复了全新启动后，沙箱中的 Bash 命令因 `mktemp: No such file or directory` 而失败的问题
  * 修复了在验证 `outputSchema` 的 MCP 客户端中，`claude mcp serve` 工具调用因“Tool execution failed”而失败的问题
  * 修复了 `RemoteTrigger` 工具的 `run` 操作发送空正文并被服务器拒绝的问题
  * 修复了多个 `/resume` 选择器问题：狭窄的默认视图隐藏了其他项目的会话、Windows 终端上无法访问预览、工作树中 cwd 不正确、会话未找到错误未显示在 stderr 中、终端标题未设置以及恢复提示与提示输入重叠
  * 修复了 Grep 工具在嵌入式 ripgrep 二进制路径陈旧（VS Code 扩展自动更新、macOS 应用转置）时出现的 ENOENT 错误；现在会回退到系统 `rg` 并在会话中自愈
  * 修复了 `/btw` 每次使用时将整个对话副本写入磁盘的问题
  * 修复了 `/context` 空闲空间和消息细分与标题百分比不一致的问题
  * 修复了多个插件问题：斜杠命令因重复的 `name:` 前置元数据而解析到错误插件、`/plugin update` 因 `ENAMETOOLONG` 而失败、Discover 显示已安装的插件、目录源插件从陈旧的版本缓存加载以及技能未遵循 `context: fork` 和 `agent` 前置元数据字段
  * 修复了 `/mcp` 菜单为配置了 `headersHelper` 的 MCP 服务器提供特定于 OAuth 的操作；现在改为提供“重新连接”以重新调用 helper 脚本
  * 修复了 `ctrl+]`、`ctrl+\` 和 `ctrl+^` 键绑定在发送原始 C0 控制字节的终端（Terminal.app、默认 iTerm2、xterm）中无法触发的问题
  * 修复了 `/login` OAuth URL 渲染时带有填充，阻碍了干净的鼠标选择的问题
  * 修复了渲染问题：当可见区域上方的内容变化时非全屏模式闪烁、长时间非全屏会话期间终端回滚被清除以及鼠标滚动转义序列偶尔泄漏到提示文本中
  * 修复了当 `settings.json` 的 env 值为数字而非字符串时崩溃的问题
  * 修复了应用内设置写入（例如 `/add-dir --remember`、`/config`）未刷新内存快照，导致会话中移除的目录未被撤销的问题
  * 修复了在 Bedrock、Vertex 和其他第三方提供商上未加载自定义键绑定（`~/.claude/keybindings.json`）的问题
  * 修复了 `claude --continue -p` 未正确继续由 `-p` 或 SDK 创建的会话的问题
  * 修复了多个远程控制问题：会话崩溃时工作树被移除、连接失败未在记录中持久化、本地会话在简要模式下错误显示“已断开连接”指示器以及当仅设置 `CLAUDE_CODE_ORGANIZATION_UUID` 时 `/remote-control` 在 SSH 上失败
  * 修复了 `/insights` 有时未在其响应中包含报告文件链接的问题
  * \[VSCode] 修复了关闭最后一个编辑器标签页时，聊天输入下方的文件附件未清除的问题



  * 在登录界面选择“第三方平台”时，新增交互式 Google Vertex AI 设置向导，引导您完成 GCP 身份验证、项目与区域配置、凭证验证和模型固定
  * 新增 `CLAUDE_CODE_PERFORCE_MODE` 环境变量：设置后，对只读文件的 Edit/Write/NotebookEdit 操作将提示 `p4 edit` 而非静默覆盖
  * 新增 Monitor 工具，用于流式传输来自后台脚本的事件
  * 当 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` 设置时，Linux 上新增子进程沙箱化（使用 PID 命名空间隔离），并新增 `CLAUDE_CODE_SCRIPT_CAPS` 环境变量以限制每会话脚本调用
  * 新增 `--exclude-dynamic-system-prompt-sections` 标志用于打印模式，以改善跨用户提示词缓存
  * 新增 `workspace.git_worktree` 到状态行 JSON 输入中，当当前目录位于链接的 git 工作树内时设置
  * 启用 OTEL 追踪时，为 Bash 工具子进程新增 W3C `TRACEPARENT` 环境变量，以便子进程跨度正确关联到 Claude Code 的追踪树
  * LSP：Claude Code 现在通过初始化请求中的 `clientInfo` 向语言服务器标识自身
  * 修复了 Bash 工具权限绕过问题：反斜杠转义的标志可能被自动允许为只读，导致任意代码执行
  * 修复了在自动和跳过权限检查模式下，复合 Bash 命令绕过强制权限提示以进行安全检查和明确询问规则
  * 修复了带有环境变量前缀的只读命令在变量未知为安全（`LANG`、`TZ`、`NO_COLOR` 等）时不会提示的问题
  * 修复了重定向到 `/dev/tcp/...` 或 `/dev/udp/...` 不会提示而是自动允许的问题
  * 修复了流式响应停滞时超时而非回退到非流式模式
  * 修复了当服务器返回较小的 `Retry-After` 值时，429 重试在约 13 秒内耗尽所有尝试——现在指数退避至少应用该值
  * 修复了重启后 token 刷新时未遵守 MCP OAuth `oauth.authServerMetadataUrl` 配置覆盖的问题，影响 ADFS 及类似 IdP
  * 修复了在 xterm 和 VS Code 集成终端中启用 kitty 键盘协议时大写字母被转为小写的问题
  * 修复了 macOS 文本替换功能删除触发词而非插入替换内容的问题
  * 修复了在通过 Bash 批准对受保护路径的写入后，`--dangerously-skip-permissions` 被静默降级为接受编辑模式的问题
  * 修复了管理员移除后托管设置允许规则在进程重启前仍保持活动状态的问题
  * 修复了 `permissions.additionalDirectories` 更改无法在会话中生效的问题——移除的目录立即失去访问权限，添加的目录无需重启即可工作
  * 修复了从 `additionalDirectories` 移除目录会撤销通过 `--add-dir` 传递的同一目录访问权限的问题
  * 修复了 `Bash(cmd:*)` 和 `Bash(git commit *)` 通配符权限规则无法匹配包含额外空格或制表符的命令的问题
  * 修复了 `Bash(...)` 拒绝规则对混合 `cd` 和其他段的管道命令降级为提示的问题
  * 修复了对 `cut -d /`、`paste -d /`、`column -s /`、`awk '{print $1}' file` 以及包含 `%` 的文件名的错误 Bash 权限提示
  * 修复了名称与 JavaScript 原型属性（例如 `toString`）匹配的权限规则导致 `settings.json` 被静默忽略的问题
  * 修复了代理团队成员在使用 `--dangerously-skip-permissions` 时未继承领导者权限模式的问题
  * 修复了在全屏模式下悬停 MCP 工具结果时崩溃的问题
  * 修复了在全屏模式下复制换行的 URL 时在换行处插入空格的问题
  * 修复了在 `--resume` 时，当编辑的文件大于 10KB 时，文件编辑差异从 UI 中消失的问题
  * 修复了多个 `/resume` 选择器问题：`--resume <name>` 打开不可编辑、过滤器重新加载清除搜索状态、空列表吞掉箭头键、跨项目过时以及临时任务状态文本替换对话摘要
  * 修复了 `/export` 不遵守绝对路径和 `~`，并静默将用户提供的扩展名重写为 `.txt` 的问题
  * 修复了对未知或未来模型 ID 拒绝 `/effort max` 的问题
  * 修复了插件前置 `name` 为 YAML 布尔关键字时斜杠命令选择器崩溃的问题
  * 修复了消息重新挂载后速率限制促销文本被隐藏的问题
  * 修复了具有 `_meta["anthropic/maxResultSizeChars"]` 的 MCP 工具未绕过基于 token 的持久化层的问题
  * 修复了在语音模式下，当上一段转录仍在处理时重新按住按键会向输入泄漏数十个空格字符的问题
  * 修复了在基于 npm 的安装中，`DISABLE_AUTOUPDATER` 未能完全抑制 npm 注册表版本检查和符号链接修改的问题
  * 修复了远程控制权限处理器条目在会话生命周期内被保留的内存泄漏问题
  * 修复了以错误失败的后台子代理未向父代理报告部分进度的问题
  * 修复了长时间会话中 prompt-type Stop/SubagentStop 钩子失败的问题，以及钩子评估器 API 错误显示“JSON 验证失败”而非真实消息的问题
  * 修复了关闭反馈调查时的渲染问题
  * 修复了 Bash `grep -f FILE` / `rg -f FILE` 在读取工作目录外的模式文件时未提示的问题
  * 修复了过时的子代理工作树清理会移除包含未跟踪文件的工作树的问题
  * 修复了 `sandbox.network.allowMachLookup` 在 macOS 上未生效的问题
  * 改进了 `/resume` 过滤器提示标签，并在过滤器指示器中添加了项目/工作树/分支名称
  * 改进了页脚指示器（焦点、通知），使其保持在模式指示器行而不是在窄终端宽度下换行
  * 改进了 `/agents` 的标签页布局：运行中标签页显示实时子代理，库标签页添加了运行代理和查看运行实例操作
  * 改进了 `/reload-plugins` 以在无需重启的情况下获取插件提供的技能
  * 改进了接受编辑模式，以自动批准带有安全环境变量或进程包装器前缀的文件系统命令
  * 改进了 Vim 模式：正常模式下的 `j`/`k` 现在导航历史记录并在输入边界选择页脚药丸
  * 改进了转录中的钩子错误，包含 stderr 的第一行以便在不使用 `--debug` 的情况下进行自我诊断
  * 改进了 OTEL 追踪：交互跨度现在正确包裹并发 SDK 调用下的完整轮次，无头轮次每轮结束跨度
  * 改进了转录条目以携带最终 token 使用情况而非流式占位符
  * 更新了 `/claude-api` 技能，除 Claude API 外还涵盖托管代理
  * \[VSCode] 修复了在 Windows 上设置 `CLAUDE_CODE_GIT_BASH_PATH` 或 Git 安装在默认位置时出现的误报“需要 git-bash”错误
  * 修复了 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 在设置时遵守 `DISABLE_COMPACT` 的问题。
  * 设置 `DISABLE_COMPACT` 时移除了 `/compact` 提示。



  * 在 `NO_FLICKER` 模式下新增焦点视图切换功能（`Ctrl+O`），可显示提示词、带编辑差异统计的一行工具摘要及最终响应
  * 新增状态行设置 `refreshInterval`，用于每 N 秒重新运行一次状态行命令
  * 新增状态行 JSON 输入字段 `workspace.git_worktree`，当当前目录位于关联的 git 工作树内时会进行设置
  * 在 `/agents` 中，为存在活跃子代理实例的代理类型新增 `● N running` 指示器
  * 新增 Cedar 策略文件（`.cedar`、`.cedarpolicy`）的语法高亮支持
  * 修复了 `--dangerously-skip-permissions` 在批准写入受保护路径后，被静默降级为接受编辑模式的问题
  * 修复并强化了 Bash 工具权限，收紧了对环境变量前缀和网络重定向的检查，并减少了常见命令的误提示
  * 修复了权限规则名称与 JavaScript 原型属性匹配（例如 `toString`）导致 `settings.json` 被静默忽略的问题
  * 修复了管理员移除托管设置允许规则后，这些规则在进程重启前仍保持活动状态的问题
  * 修复了设置中 `permissions.additionalDirectories` 的更改无法在会话中途应用的问题
  * 修复了从 `settings.permissions.additionalDirectories` 移除一个目录后，会撤销通过 `--add-dir` 传递的同一目录访问权限的问题
  * 修复了 MCP HTTP/SSE 连接在服务器重连时，每小时累积约 50 MB 未释放缓冲区的问题
  * 修复了 MCP OAuth `oauth.authServerMetadataUrl` 在重启后刷新 token 时未被遵循的问题，此修复解决了 ADFS 及类似身份提供商的问题
  * 修复了当服务器返回较小的 `Retry-After` 值时，429 重试会在约 13 秒内耗尽所有尝试次数的问题——现在指数退避将作为最小值应用
  * 修复了上下文压缩后，速率限制升级选项消失的问题
  * 修复了多个 `/resume` 选择器问题：`--resume <name>` 打开不可编辑状态、Ctrl+A 重载清除搜索、空列表吞噬导航、任务状态文本替换对话摘要以及跨项目陈旧问题
  * 修复了 `--resume` 时，当编辑的文件大于 10KB 时文件编辑差异消失的问题
  * 修复了 `--resume` 缓存未命中以及来自附件消息的中断期间输入丢失未保存到转录中的问题
  * 修复了 Claude 工作期间输入的消息未被持久化到转录中的问题
  * 修复了长时间会话中提示词类型 `Stop`/`SubagentStop` 钩子执行失败，以及钩子评估器 API 错误显示 "JSON validation failed" 而非实际消息的问题
  * 修复了使用工作树隔离或 `cwd:` 覆盖的子代理将其工作目录泄露回父会话 Bash 工具的问题
  * 修复了压缩时，在提示词过长重试期间写入重复的数 MB 子代理转录文件的问题
  * 修复了 `claude plugin update` 对基于 git 的市场插件报告 "already at the latest version"，而远程仓库实际存在更新提交的问题
  * 修复了当插件的 frontmatter `name` 是 YAML 布尔关键字时，斜杠命令选择器中断的问题
  * 修复了在 `NO_FLICKER` 模式下复制换行包裹的 URL 时，换行处插入空格的问题
  * 修复了在 zellij 内运行 `NO_FLICKER` 模式时的滚动渲染瑕疵
  * 修复了在 `NO_FLICKER` 模式下悬停 MCP 工具结果时发生的崩溃问题
  * 修复了 `NO_FLICKER` 模式下，API 重试遗留陈旧流式状态导致的内存泄漏问题
  * 修复了 Windows 终端中 `NO_FLICKER` 模式下鼠标滚轮滚动缓慢的问题
  * 修复了在终端高度小于 24 行时，自定义状态行在 `NO_FLICKER` 模式下不显示的问题
  * 修复了在 Warp 终端中使用 `NO_FLICKER` 模式时，Shift+Enter 和 Alt/Cmd+方向键快捷键不工作的问题
  * 修复了在 Windows 的无闪烁模式下复制时，韩文/日文/Unicode 文本出现乱码的问题
  * 修复了当 `AWS_BEARER_TOKEN_BEDROCK` 或 `ANTHROPIC_BEDROCK_BASE_URL` 设置为空字符串（如 GitHub Actions 对未设置输入的做法）时，Bedrock SigV4 认证失败的问题
  * 改进了接受编辑模式，现在会自动批准以安全环境变量或进程包装器为前缀的文件系统命令（例如 `LANG=C rm foo`、`timeout 5 mkdir out`）
  * 改进了自动模式和绕过权限模式，现在会自动批准沙箱网络访问提示
  * 改进了沙箱：`sandbox.network.allowMachLookup` 现在在 macOS 上生效
  * 改进了图像处理：粘贴和附加的图像现在会被压缩到与通过 Read 工具读取的图像相同的 token 预算
  * 改进了斜杠命令和 `@` 提及的补全，现在可在 CJK 句末标点后触发，因此日文/中文输入不再需要在 `/` 或 `@` 前加空格
  * 改进了 Bridge 会话，现在会在 claude.ai 会话卡片上显示本地 git 仓库、分支和工作目录
  * 改进了页脚布局：指示器（焦点、通知）现在保持在模式指示器行，而不是换行到下方
  * 改进了上下文不足警告，现在显示为临时的页脚通知，而不是持久的行
  * 改进了 markdown 块引用，在换行行上显示连续的左侧竖线
  * 通过跳过空的钩子条目和限制存储的预编辑文件副本大小，改进了会话转录文件大小
  * 改进了转录准确性：每个块的条目现在携带最终的 token 使用量，而不是流式占位符
  * 改进了 Bash 工具的 OTEL 追踪：当启用追踪时，子进程现在会继承 W3C `TRACEPARENT` 环境变量
  * 更新了 `/claude-api` 技能，使其涵盖托管代理以及 Claude API



  * 修复了当使用 `AWS_BEARER_TOKEN_BEDROCK` 或 `CLAUDE_CODE_SKIP_BEDROCK_AUTH` 时，Bedrock 请求因 `403 "Authorization header is missing"` 而失败的问题（2.1.94版本引入的回归问题）



  * 新增由 Mantle 驱动的 Amazon Bedrock 支持，设置 `CLAUDE_CODE_USE_MANTLE=1` 即可启用
  * 将 API 密钥、Bedrock/Vertex/Foundry、团队版和企业版用户的默认 effort 级别从中改为高（可通过 `/effort` 命令控制）
  * 为 Slack MCP 发送消息工具调用新增了紧凑的 `Slacked #channel` 标头，并附带可点击的频道链接
  * 新增了对插件输出样式 `keep-coding-instructions` 前置元数据字段的支持
  * 在 `UserPromptSubmit` 钩子中新增了 `hookSpecificOutput.sessionTitle`，可用于设置会话标题
  * 通过 `"skills": ["./"]` 声明的插件技能现在使用技能前置元数据中的 `name` 作为调用名称，而不是目录基名，从而在不同安装方式下保持名称稳定
  * 修复了在收到 429 速率限制响应且 Retry-After 头部较长时，代理显示卡住的问题 —— 现在错误会立即显现，而非静默等待
  * 修复了 macOS 上当登录钥匙串被锁定或其密码不同步时，控制台登录会静默失败并显示"Not logged in"的问题 —— 现在错误会显现，且 `claude doctor` 可诊断并提供修复方案
  * 修复了在 YAML 前置元数据中定义的插件技能钩子被静默忽略的问题
  * 修复了当未设置 `CLAUDE_PLUGIN_ROOT` 时，插件钩子因"No such file or directory"错误而失败的问题
  * 修复了对于本地市场插件，启动时 `${CLAUDE_PLUGIN_ROOT}` 解析为市场源目录而非已安装缓存目录的问题
  * 修复了在长时间运行的会话中，回滚显示重复的差异内容以及出现空白页的问题
  * 修复了用户多行提示词在转录记录中，换行行缩进在 `❯` 符号下而非文本下的问题
  * 修复了在搜索输入框中，Shift+Space 会插入字面单词"space"而非空格字符的问题
  * 修复了在基于 xterm.js 的终端（VS Code, Hyper, Tabby）中运行 tmux 时，点击超链接会打开两个浏览器标签页的问题
  * 修复了一个备用屏幕渲染错误，其中滚动过程中内容高度变化可能留下累积的残影
  * 修复了通过 `settings.json` `env` 设置 `FORCE_HYPERLINK` 环境变量时被忽略的问题
  * 修复了在对话框中，原生终端光标未跟踪所选标签页的问题，以便屏幕阅读器和放大镜能跟随标签导航
  * 通过使用 `us.` 推理配置文件 ID，修复了 Bedrock 调用 Sonnet 3.5 v2 的问题
  * 修复了 SDK/打印模式在流式传输中断时，未将部分助手响应保留在对话历史中的问题
  * 改进了 `--resume`，现在可直接从同一仓库的其他工作树恢复会话，而非打印 `cd` 命令
  * 修复了当块边界分割 UTF-8 序列时，流式 JSON 输入/输出中的 CJK 及其他多字节文本被 U+FFFD 损坏的问题
  * \[VSCode] 减少了启动会话时冷启动子进程的工作量
  * \[VSCode] 修复了在输入或使用箭头键时鼠标悬停在列表上时，下拉菜单选择了错误项目的问题
  * \[VSCode] 新增当 `settings.json` 文件解析失败时显示警告横幅，以便用户知晓其权限规则未被应用



  * 新增 `forceRemoteSettingsRefresh` 策略设置：启用后，CLI 将阻塞启动直至最新远程托管设置获取完毕，若获取失败则退出（失败关闭模式）
  * 新增交互式 Bedrock 设置向导，可通过登录界面选择“第三方平台”访问——引导完成 AWS 认证、区域配置、凭证验证及模型固定
  * 订阅用户使用 `/cost` 命令时新增按模型及缓存命中率明细
  * `/release-notes` 现已升级为交互式版本选择器
  * 远程控制会话名称现默认使用主机名作为前缀（例如 `myhost-graceful-unicorn`），可通过 `--remote-control-session-name-prefix` 覆盖
  * 专业版用户返回会话时，若提示词缓存已过期，界面底部将显示下次请求预计发送的未缓存 token 数量
  * 修复长时间运行会话中 tmux 窗口关闭或重编号后，子代理生成永久性报错“无法确定窗格数量”的问题
  * 修复提示词类型 Stop 钩子在小型快速模型返回 `ok:false` 时错误失败的问题，并恢复非 Stop 类型提示词钩子的 `preventContinuation:true` 语义
  * 修复流式传输将数组/对象字段作为 JSON 编码字符串输出时的工具输入验证失败问题
  * 修复扩展思考生成纯空白文本块与实际内容时可能触发的 API 400 错误
  * 修复自动飞行模式按键及连续提示词数字冲突导致意外提交反馈调查的问题
  * 修复全屏模式下处理文本选择时，“esc 中断”提示与“esc 清除”同时出现的误导性显示
  * 修复 Homebrew 安装更新提示以遵循 cask 发布渠道（`claude-code` → 稳定版，`claude-code@latest` → 最新版）
  * 修复多行提示词中光标位于行尾时 `ctrl+e` 跳至下一行末尾的问题
  * 修复全屏模式向上滚动时（iTerm2、Ghostty 及其他支持 DEC 2026 的终端）同一消息可能重复出现于两个位置的问题
  * 修复空闲返回提示“/clear 可节省 X tokens”错误显示会话累计 token 数而非当前上下文大小的问题
  * 插件 MCP 服务器在会话启动时卡在“连接中”状态的问题，该情况发生于其与未认证的 claude.ai 连接器重复时
  * 优化大文件写入工具的差异计算速度（含制表符/`&`/`$` 的文件处理速度提升 60%）
  * 移除 `/tag` 命令
  * 移除 `/vim` 命令（现可通过 `/config` → 编辑器模式切换 vim 模式）
  * Linux 沙箱现同时在 npm 和原生构建中提供 `apply-seccomp` 辅助工具，恢复对沙箱命令的 Unix 套接字阻断功能



  * 通过 `_meta["anthropic/maxResultSizeChars"]` 注解添加了 MCP 工具结果持久化覆盖（最高可达 500K），允许数据库模式等更大的结果无需截断即可传递
  * 添加了 `disableSkillShellExecution` 设置，以禁用技能、自定义斜杠命令和插件命令中的内联 shell 执行
  * 支持在 `claude-cli://open?q=` 深度链接中使用多行提示词（编码换行符 `%0A` 不再被拒绝）
  * 插件现在可以在 `bin/` 下分发可执行文件，并通过 Bash 工具作为裸命令调用
  * 修复了 `--resume` 时转录链中断的问题，该问题可能在异步转录写入静默失败时导致会话历史记录丢失
  * 修复了在 iTerm2、kitty、WezTerm、Ghostty 和 Windows Terminal 中 `cmd+delete` 无法删除到行首的问题
  * 修复了远程会话中计划模式在容器重启后丢失计划文件跟踪的问题，该问题导致计划编辑时出现权限提示和空的计划批准模态框
  * 修复了 settings.json 中 `permissions.defaultMode: "auto"` 的 JSON 模式验证问题
  * 修复了 Windows 版本清理未保护活动版本回滚副本的问题
  * `/feedback` 现在会解释不可用的原因，而不是从斜杠菜单中消失
  * 改进了 `/claude-api` 技能指南，涵盖代理设计模式，包括工具表面决策、上下文管理和缓存策略
  * 提升了性能：通过使用 `Bun.stripANSI` 路由，在 Bun 上实现了更快的 `stripAnsi` 操作
  * 编辑工具现在使用更短的 `old_string` 锚点，减少了输出 token



  * 新增 `/powerup` 功能 — 通过动画演示进行交互式教学，讲解 Claude Code 特性
  * 新增 `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE` 环境变量，当 `git pull` 失败时保留现有市场缓存，适用于离线环境
  * 将 `.husky` 添加到受保护目录（acceptEdits 模式）
  * 修复了当达到使用量限制后，速率限制选项对话框反复自动打开导致无限循环，最终使会话崩溃的问题
  * 修复了对于使用延迟工具、MCP 服务器或自定义代理的用户，`--resume` 在首次请求时会导致提示词缓存完全未命中的问题（自 v2.1.69 版本起出现的回归错误）
  * 修复了当 PostToolUse 格式化保存钩子在连续编辑之间重写文件时，`Edit`/`Write` 操作因“文件内容已更改”而失败的问题
  * 修复了向标准输出输出 JSON 并以代码 2 退出的 `PreToolUse` 钩子未能正确阻止工具调用的问题
  * 修复了在工具调用期间自动加载 CLAUDE.md 文件时，折叠的搜索/读取摘要徽章在全屏滚动回放中多次出现的问题
  * 修复了自动模式即使在操作本应被允许的情况下，也未遵循用户明确边界（如“不要推送”、“在 Y 之前等待 X”）的问题
  * 修复了在浅色终端主题下，点击展开的悬浮文本几乎不可见的问题
  * 修复了当畸形工具输入到达权限对话框时导致的 UI 崩溃问题
  * 修复了滚动 `/model`、`/config` 和其他选择界面时标题消失的问题
  * 加固了 PowerShell 工具权限检查：修复了尾部 `&` 后台作业绕过、`-ErrorAction Break` 调试器挂起、存档提取 TOCTOU 以及解析失败回退拒绝规则降级等问题
  * 性能改进：在缓存键查找时消除了每轮次的 MCP 工具模式 JSON.stringify
  * 性能改进：SSE 传输现在能以线性时间复杂度处理大型流式帧（原为二次时间复杂度）
  * 性能改进：具有长对话的 SDK 会话在写入记录时不再出现二次时间复杂度的减速
  * 改进了 `/resume` 所有项目视图，使其并行加载项目会话，提升了拥有多个项目用户的加载速度
  * 更改了 `--resume` 选择器，使其不再显示由 `claude -p` 或 SDK 调用创建的会话
  * 从自动允许列表中移除了 `Get-DnsClientCache` 和 `ipconfig /displaydns`（DNS 缓存隐私）



  * 新增 `"defer"` 权限决定至 `PreToolUse` 钩子 — 无头会话可在工具调用处暂停，并通过 `-p --resume` 恢复以让钩子重新评估
  * 新增 `CLAUDE_CODE_NO_FLICKER=1` 环境变量，可选择启用基于虚拟化滚动缓冲区的无闪烁替代屏幕渲染
  * 新增 `PermissionDenied` 钩子，在自动模式分类器拒绝后触发 — 返回 `{retry: true}` 可告知模型允许重试
  * 在 `@` 提及类型建议中新增命名子代理
  * 新增 `MCP_CONNECTION_NONBLOCKING=true` 用于 `-p` 模式，可完全跳过 MCP 连接等待，并将 `--mcp-config` 服务器连接超时限制为 5 秒，而非阻塞等待最慢的服务器
  * 自动模式：被拒绝的命令现在会显示通知，并出现在 `/permissions` → 最近选项卡中，可通过 `r` 键重试
  * 修复 `Edit(//path/**)` 和 `Read(//path/**)` 允许规则仅检查请求路径而非解析后的符号链接目标的问题
  * 修复某些修饰键组合绑定下语音按键讲话未激活，以及 Windows 上语音模式出现 "WebSocket upgrade rejected with HTTP 101" 失败的问题
  * 修复 Windows 上编辑/写入工具 CRLF 符号重复及剥离 Markdown 硬换行符（两个尾随空格）的问题
  * 修复 `StructuredOutput` 模式缓存错误导致使用多模式时约 50% 失败率的问题
  * 修复长时间运行会话中大型 JSON 输入作为 LRU 缓存键导致的内存泄漏
  * 修复从超大对话记录文件（超过 50MB）中移除消息时的崩溃问题
  * 修复 LSP 服务器崩溃后进入僵尸状态 — 现在会在下次请求时重启，而非在会话重启前持续失败
  * 修复 `~/.claude/history.jsonl` 中位于 4KB 边界的 CJK 或表情符号提示历史记录被静默丢弃的问题
  * 修复 `/stats` 统计因排除子代理使用而低估 token 用量，以及统计缓存格式变更时丢失超过 30 天历史数据的问题
  * 修复 `-p --resume` 在延迟工具输入超过 64KB 或不存在延迟标记时挂起，以及 `-p --continue` 未恢复延迟工具的问题
  * 修复 `claude-cli://` 深度链接在 macOS 上无法打开的问题
  * 修复 MCP 工具错误在服务器返回多元素错误内容时仅截断首个内容块的问题
  * 修复通过 SDK 发送带图片消息时技能提醒和其他系统上下文被丢弃的问题
  * 修复 PreToolUse/PostToolUse 钩子为写入/编辑/读取工具接收绝对路径的 `file_path`，与文档行为一致
  * 修复自动压缩抖动循环 — 现在会检测连续三次压缩后上下文是否立即回填至限制，并以可操作错误停止，而非浪费 API 调用
  * 修复因工具模式字节在会话中变更导致的长会话提示缓存未命中
  * 修复长会话中多次读取文件导致嵌套 CLAUDE.md 文件被重复注入数十次的问题
  * 修复 `--resume` 在对话记录包含旧版 CLI 工具结果或中断写入时的崩溃问题
  * 修复 API 返回权限错误时显示误导性 "Rate limit reached" 消息 — 现在显示实际错误并附可操作提示
  * 修复钩子 `if` 条件过滤不匹配复合命令（`ls && git push`）或带环境变量前缀命令（`FOO=bar git push`）的问题
  * 修复重度并行工具使用时终端滚动缓冲区中折叠的搜索/读取组徽章重复显示的问题
  * 修复通知 `invalidates` 未立即清除当前显示通知的问题
  * 修复提交后处理期间收到后台消息时提示短暂消失的问题
  * 修复梵文及其他组合标记文本在助手输出中被截断的问题
  * 修复主屏终端布局偏移后的渲染伪影
  * 修复 macOS Apple Silicon 上语音模式未请求麦克风权限的问题
  * 修复 Windows Terminal Preview 1.25 中 Shift+Enter 提交而非插入换行的问题
  * 修复 iTerm2 在 tmux 内运行时流式传输期间的周期性 UI 抖动问题
  * 修复 PowerShell 工具在 Windows PowerShell 5.1 中命令（如 `git push`）向 stderr 写入进度时错误报告失败的问题
  * 修复对超大文件（>1 GiB）使用编辑工具时潜在的内存溢出崩溃问题
  * 改进折叠工具摘要：对 `ls`/`tree`/`du` 显示 "列出 N 个目录" 而非 "读取 N 个文件"
  * 改进 Bash 工具：当格式化/检查命令修改了已读文件时发出警告，防止陈旧编辑错误
  * 改进 `@` 提及类型建议：源文件排名高于名称相似的 MCP 资源
  * 改进 PowerShell 工具提示：提供与版本匹配的语法指导（5.1 vs 7+）
  * 变更 `Edit` 现在可作用于通过 `Bash` 的 `sed -n` 或 `cat` 查看的文件，无需预先单独调用 `Read`
  * 变更超过 5 万字符的钩子输出现在保存至磁盘并提供文件路径与预览，而非直接注入上下文
  * 变更设置文件中的 `cleanupPeriodDays: 0` 现在会触发验证错误被拒绝 — 此前会静默禁用对话记录持久化
  * 变更交互式会话默认不再生成思考摘要 — 在设置文件中设置 `showThinkingSummaries: true` 可恢复此功能
  * 补充文档：`TaskCreated` 钩子事件及其阻塞行为
  * 使用 Ctrl+B 后台化运行中的命令时保留任务通知
  * Windows 上 PowerShell 工具：包含双引号和空格的外部命令参数现在会提示而非自动允许（加强 PS 5.1 参数分割安全性）
  * `/env` 现在适用于 PowerShell 工具命令（此前仅影响 Bash）
  * `/usage` 现为 Pro 和企业版计划隐藏冗余的 "当前周（仅 Sonnet）" 柱状图
  * 粘贴图片不再插入尾随空格
  * 在空提示中粘贴 `!command` 现在进入 Bash 模式，与输入 `!` 行为一致
  * `/buddy` 为四月一日而来 — 孵化一只小生物观看你编码



  * 修复了 Cowork Dispatch 中的消息未送达问题



  *   在 API 请求中添加了 `X-Claude-Code-Session-Id` 请求头，以便代理可以按会话聚合请求而无需解析请求体
  *   将 `.jj` 和 `.sl` 添加到版本控制系统目录排除列表中，这样 Grep 和文件自动补全就不会深入 Jujutsu 或 Sapling 的元数据目录
  *   修复了在 v2.1.85 之前创建的会话上使用 `--resume` 时出现“tool_use ids were found without tool\_result blocks”错误的问题
  *   修复了当配置了条件技能或规则时，对项目根目录外文件（例如 `~/.claude/CLAUDE.md`）的写入/编辑/读取操作失败的问题
  *   修复了每次调用技能时不必要的配置磁盘写入，这可能导致 Windows 上的性能问题和配置损坏
  *   修复了在包含大量转录文件的长会话中使用 `/feedback` 时可能导致内存溢出崩溃的问题
  *   修复了在交互式会话中 `--bare` 模式会丢弃 MCP 工具，并静默丢弃在对话轮次中间排队消息的问题
  *   修复了 `c` 快捷键只复制 OAuth 登录 URL 的约 20 个字符，而不是完整 URL 的问题
  *   修复了在窄终端上，当输入内容（例如 OAuth 代码粘贴）跨多行换行时，会泄露 token 开头部分的问题
  *   修复了自 v2.1.83 以来，官方市场插件脚本在 macOS/Linux 上出现“Permission denied”错误的问题
  *   修复了在运行多个 Claude Code 实例并在其中一个使用 `/model` 时，状态栏显示另一个会话模型的问题
  *   修复了在长对话底部使用鼠标滚轮滚动或点击选择后，滚动不跟随新消息的问题
  *   修复了 `/plugin` 卸载对话框的问题：现在按 `n` 可以正确卸载插件同时保留其数据目录
  *   修复了一个回归问题，即点击后按 Enter 可能会导致转录内容在响应到达前保持空白
  *   修复了删除 `ultrathink` 关键词后提示信息仍会残留的问题
  *   修复了在长会话中，由于 markdown/高亮渲染缓存保留了完整内容字符串而导致的内存增长问题
  *   减少了配置了多个 claude.ai MCP 连接器时的启动事件循环阻塞（macOS 钥匙串缓存时间从 5 秒延长至 30 秒）
  *   减少了使用 `@` 提及文件时的 token 开销——原始字符串内容不再进行 JSON 转义
  *   通过移除工具描述中的动态内容，提高了 Bedrock、Vertex 和 Foundry 用户的提示词缓存命中率
  *   在“已保存 N 条记忆”的通知中，记忆文件名现在鼠标悬停时会高亮显示，点击时会打开
  *   `/skills` 列表中的技能描述现在上限为 250 个字符，以减少上下文使用量
  *   更改 `/skills` 菜单为按字母顺序排序，以便于浏览
  *   当因计划限制而禁用时，自动模式现在显示“对您的计划不可用”（原来是“暂时不可用”）
  *   [VSCode] 修复了在长时间运行期间扩展错误显示“未响应”的问题
  *   [VSCode] 修复了在 OAuth 令牌刷新（登录后 8 小时）后，扩展会将 Max 套餐用户默认为 Sonnet 的问题
  *   读取工具现在使用紧凑的行号格式，并去除了对未更改内容的重复读取，从而减少了 token 使用量



  * 在 MCP `headersHelper` 脚本中新增 `CLAUDE_CODE_MCP_SERVER_NAME` 和 `CLAUDE_CODE_MCP_SERVER_URL` 环境变量，允许单个助手服务多个服务器
  * 为钩子新增使用权限规则语法（例如 `Bash(git *)`）的条件 `if` 字段，以过滤钩子运行时机，减少进程生成开销
  * 在记录中新增时间戳标记，当计划任务（`/loop`、`CronCreate`）触发时显示
  * 粘贴图片时，在 `[Image #N]` 占位符后添加尾随空格
  * 深度链接查询（`claude-cli://open?q=…`）现在支持最多 5,000 个字符，并对过长的预填充提示词显示“滚动查看”警告
  * MCP OAuth 现遵循 RFC 9728 保护资源元数据发现协议以查找授权服务器
  * 受组织策略（`managed-settings.json`）阻止的插件现在无法安装或启用，并在市场视图中隐藏
  * PreToolUse 钩子现在可通过返回 `updatedInput` 和 `permissionDecision: "allow"` 来满足 `AskUserQuestion`，支持通过自身用户界面收集答案的无人值守集成
  * OpenTelemetry tool\_result 事件中的 `tool_parameters` 现在需设置 `OTEL_LOG_TOOL_DETAILS=1` 才能记录
  * 修复了 `/compact` 在对话内容过大导致压缩请求本身无法容纳时，因“上下文超出限制”而失败的问题
  * 修复了当插件的安装位置与其在设置中声明的位置不同时，`/plugin enable` 和 `/plugin disable` 失败的问题
  * 修复了 `--worktree` 在非 git 仓库中，在 `WorktreeCreate` 钩子运行之前即报错退出的问题
  * 修复了 `deniedMcpServers` 设置未能阻止 claude.ai MCP 服务器的问题
  * 修复了在多显示器设置下，computer-use 工具中的 `switch_display` 返回“此会话中不可用”的问题
  * 修复了当 `OTEL_LOGS_EXPORTER`、`OTEL_METRICS_EXPORTER` 或 `OTEL_TRACES_EXPORTER` 设置为 `none` 时崩溃的问题
  * 修复了非原生构建中 diff 语法高亮失效的问题
  * 修复了存在刷新令牌时 MCP 阶梯式授权失败的问题 —— 通过 `403 insufficient_scope` 请求提升权限的服务器现在能正确触发重新授权流程
  * 修复了远程会话中流式响应中断时的内存泄漏问题
  * 修复了通过重试时使用全新 TCP 连接，解决边缘连接抖动期间持续出现的 ECONNRESET 错误
  * 修复了运行某些斜杠命令后提示词卡在队列中，且上箭头键无法检索的问题
  * 修复了 Python Agent SDK：通过 `--mcp-config` 传递的 `type:'sdk'` MCP 服务器在启动时不再被丢弃
  * 修复了通过 SSH 或在 VS Code 集成终端运行时，提示词中出现原始键序列的问题
  * 修复了权限解析后，远程控制会话状态卡在“需要操作”的问题
  * 修复了 shift+enter 和 meta+enter 被预输入建议拦截而非插入换行的问题
  * 修复了在流式传输期间向上滚动时，陈旧内容渗出的问题
  * 修复了在退出支持 Kitty 键盘协议的终端（如 Ghostty、Kitty、WezTerm 等）后，终端仍处于增强键盘模式的问题 —— 退出后 Ctrl+C 和 Ctrl+D 现在可正常工作
  * 改进了大型仓库上 @-mention 文件自动补全的性能
  * 改进了 PowerShell 危险命令检测
  * 通过将 WASM yoga-layout 替换为纯 TypeScript 实现，提升了大型记录的滚动性能
  * 减少了大型会话触发压缩时的界面卡顿



  * 为Windows新增了可选预览版的PowerShell工具。详情请访问[https://code.claude.com/docs/en/tools-reference#powershell-tool](https://code.claude.com/docs/en/tools-reference#powershell-tool)
  * 新增了 `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU}_MODEL_SUPPORTS` 环境变量，用于覆盖第三方平台（Bedrock、Vertex、Foundry）中固定默认模型的能力/思考检测，并新增了 `_MODEL_NAME`/`_DESCRIPTION` 以自定义 `/model` 选择器的标签
  * 新增了 `CLAUDE_STREAM_IDLE_TIMEOUT_MS` 环境变量，用于配置流式空闲看门狗超时阈值（默认90秒）
  * 新增了 `TaskCreated` 钩子，当通过 `TaskCreate` 创建任务时触发
  * 为 `type: "http"` 新增了 `WorktreeCreate` 钩子支持 — 可在响应JSON中通过 `hookSpecificOutput.worktreePath` 返回创建的工作树路径
  * 为团队/企业管理员新增了 `allowedChannelPlugins` 托管设置，用于定义频道插件允许列表
  * 为API请求新增了 `x-client-request-id` 头信息，用于调试超时问题
  * 新增了空闲返回提示词，当用户在75分钟以上后返回时，会提示用户使用 `/clear`，以减少陈旧会话上不必要的token重缓存
  * 深度链接（`claude-cli://`）现在会在您首选的终端中打开，而不是检测列表中恰好排在首位的终端
  * 规则和技能的 `paths:` 前置元数据现在接受YAML格式的glob列表
  * MCP工具描述和服务器说明现被限制在2KB以内，以防OpenAPI生成的服务器使上下文膨胀
  * 在本地和通过 claude.ai 连接器配置的MCP服务器现在会进行去重处理 — 以本地配置为准
  * 看起来卡在交互式提示上的后台bash任务，现在会在约45秒后显示通知
  * Token计数≥1M现在显示为"1.5m"，而不是"1512.6k"
  * 当 `ToolSearch` 启用时，包括为配置了MCP工具的用户，全局系统提示词缓存现已生效
  * 修复了语音按键通话：按住语音键时不再将字符泄露到文本输入框，且转录文本现在会插入到正确位置
  * 修复了页脚项获得焦点时，上下方向键无响应的问题
  * 修复了 `Ctrl+U`（删除至行首）在多行输入的行边界处无效的问题，因此重复按 `Ctrl+U` 现在可以跨行清除
  * 修复了将默认和弦绑定设为空（例如 `"ctrl+x ctrl+k": null`）后，仍会进入和弦等待模式，而不是释放前缀键的问题
  * 修复了鼠标事件将字面量"mouse"文本插入转录搜索输入框的问题
  * 修复了当外部会话使用 `--json-schema` 且子代理也指定了schema时，工作流子代理因API 400错误而失败的问题
  * 修复了某些终端上用户消息气泡中某些emoji背后缺少背景色的问题
  * 修复了对于拥有 `Edit(.claude)` 允许规则的用户，“允许Claude在本次会话中编辑其自身设置”的权限选项无法保持的问题
  * 修复了为大文件编辑生成附件片段时出现的挂起问题
  * 修复了服务器重连时MCP工具/资源缓存泄漏的问题
  * 修复了一个启动性能问题：部分克隆仓库（Scalar/GVFS）会触发大规模blob下载
  * 修复了原生终端光标不跟随文本输入光标的问题，因此IME合成（中日韩输入）现在会内联渲染，屏幕阅读器也能跟随输入位置
  * 修复了macOS上由瞬态钥匙串读取失败引起的误报"未登录"错误
  * 修复了一个冷启动竞争条件：核心工具可能在未激活旁路的情况下被延迟，导致Edit/Write在参数类型化时因InputValidationError失败
  * 改进了对Windows驱动器根目录（`C:\`、`C:\Windows`等）危险删除的检测
  * 通过并行运行 `setup()` 与斜杠命令和代理加载，将交互式启动时间缩短了约30毫秒
  * 改进了 `claude "prompt"` 使用MCP服务器时的启动体验 — REPL现在会立即渲染，而不是阻塞直到所有服务器连接完成
  * 改进了远程控制功能，在被阻止时显示具体原因，而不是通用的"尚未启用"消息
  * 改进了p90提示词缓存命中率
  * 通过使消息窗口不受压缩和分组更改的影响，减少了长会话中的滚动到顶部重置
  * 当动画工具进度滚动到视口上方时，减少了终端闪烁
  * 更改了issue/PR引用规则：仅当写作 `owner/repo#123` 时才会变为可点击链接 — 裸 `#123` 不再自动链接
  * 当前认证设置下不可用的斜杠命令（`/voice`、`/mobile`、`/chrome`、`/upgrade` 等）现在会被隐藏，而不是显示出来
  * \[VSCode] 新增了速率限制警告横幅，包含使用百分比和重置时间
  * 统计信息截图（在/stats中按Ctrl+S）现适用于所有构建版本，且速度提高了16倍



  * 在 `managed-settings.json` 旁新增了 `managed-settings.d/` 补充目录，允许各团队独立部署策略片段，这些片段会按字母顺序合并
  * 新增 `CwdChanged` 和 `FileChanged` 钩子事件，用于响应式环境管理（例如 direnv）
  * 新增 `sandbox.failIfUnavailable` 设置，当沙箱已启用但无法启动时，该设置会使其以错误退出，而非在非沙箱环境下运行
  * 新增 `disableDeepLinkRegistration` 设置，以防止注册 `claude-cli://` 协议处理程序
  * 新增 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` 环境变量，用于从子进程环境（Bash 工具、钩子、MCP stdio 服务器）中剥离 Anthropic 和云服务提供商凭据
  * 新增记录搜索功能 —— 在记录模式（`Ctrl+O`）下按 `/` 进行搜索，使用 `n`/`N` 切换匹配项
  * 新增 `Ctrl+X Ctrl+E` 作为打开外部编辑器的快捷键别名（readline 原生绑定；`Ctrl+G` 仍然可用）
  * 现在粘贴的图像会在光标处插入一个 `[Image #N]` 芯片，以便您在提示词中通过位置引用它们
  * 代理现在可以在 frontmatter 中声明 `initialPrompt` 以自动提交第一轮对话
  * `chat:killAgents` 和 `chat:fastMode` 现在可以通过 `~/.claude/keybindings.json` 重新绑定
  * 修复了退出后鼠标跟踪转义序列泄露到 shell 提示符的问题
  * 修复了 macOS 上 Claude Code 退出时挂起的问题
  * 修复了闲置几秒钟后屏幕闪烁变空白的问题
  * 修复了差异比较共用行极少的超大文件时挂起的问题 —— 现在差异比较会在 5 秒后超时并优雅地回退
  * 修复了启用语音输入时启动时出现 1-8 秒 UI 冻结的问题，该问题由急于加载原生音频模块引起
  * 修复了启动时的回归问题，该问题导致 Claude Code 在继续执行前等待约 3 秒以获取 claude.ai MCP 配置
  * 修复了 `--mcp-config` CLI 标志绕过 `allowedMcpServers`/`deniedMcpServers` 托管策略强制执行的问题
  * 修复了 claude.ai MCP 连接器（Slack、Gmail 等）在单轮 `--print` 模式下不可用的问题
  * 修复了 `caffeinate` 进程在 Claude Code 退出时未能正确终止，从而阻止 Mac 进入睡眠状态的问题
  * 修复了制表键接受以 `!` 为前缀的命令建议时 bash 模式未激活的问题
  * 修复了在浏览建议后，过时的斜杠命令选择显示错误高亮命令的问题
  * 修复了 `/config` 菜单同时显示搜索光标和列表选择的问题
  * 修复了后台子代理在上下文压缩后变得不可见，从而可能导致生成重复代理的问题
  * 修复了后台代理任务在清理期间 git 或 API 调用挂起时，任务状态停留在“运行中”的问题
  * 修复了升级后首次启动时 `--channels` 显示“当前通道不可用”的问题
  * 修复了未安装的插件钩子在下一个会话之前继续触发的问题
  * 修复了在流式响应期间排队命令闪烁的问题
  * 修复了在消息处理期间提交的斜杠命令被作为文本发送给模型的问题
  * 修复了当折叠的读取/搜索组在滚出屏幕后完成时，回滚跳转的问题
  * 修复了模型开始或停止思考时回滚跳转到顶部的问题
  * 修复了由于钩子进度/附件消息导致父 UUID 链分叉，从而在恢复时导致 SDK 会话历史记录丢失的问题
  * 修复了当鼠标在终端窗口外释放时，复制选择未触发的问题
  * 修复了当项目溢出时，在高度受限的列表中出现幽灵字符的问题
  * 修复了 `Ctrl+B` 在空闲提示符下干扰 readline 向后字符的问题 —— 现在仅在可以将前台任务放入后台时才触发
  * 修复了工具结果文件永不清理，忽略 `cleanupPeriodDays` 设置的问题
  * 修复了释放语音按住说话按键后，空格键被吞噬长达 3 秒的问题
  * 修复了在 Linux 上使用语音模式时，如果没有音频硬件（Docker、无头、WSL1），ALSA 库错误会破坏终端 UI 的问题
  * 修复了在 Termux/Android 上语音模式的 SoX 检测问题，其中生成 `which` 命令受到内核限制
  * 修复了远程控制会话在 Web 会话列表中显示为“空闲”，而实际上正在运行的问题
  * 修复了在配置驱动模式下，页脚导航选择了不可见的远程控制药丸的问题
  * 修复了远程会话中的内存泄漏，其中工具使用 ID 无限期累积
  * 通过将配置文件获取与其他启动工作重叠，改进了 Bedrock SDK 冷启动延迟
  * 改进了大型会话上 `--resume` 的内存使用和启动延迟
  * 改进了插件启动 —— 命令、技能和代理现在从磁盘缓存加载，无需重新获取
  * 改进了远程控制会话标题：AI 生成的标题现在在发送第一条消息后的几秒内出现
  * 改进了 `WebFetch`，使其标识为 `Claude-User`，以便站点运营商可以通过 `robots.txt` 识别并允许 Claude Code 流量
  * 减少了 `WebFetch` 对大型页面的峰值内存使用
  * 将长时间会话中的回滚重置从每轮一次减少到每约 50 条消息一次
  * 使用未认证的 HTTP/SSE MCP 服务器时，`claude -p` 启动更快（节省约 600ms）
  * Bash 幽灵文本建议现在会立即包含刚提交的命令
  * 提高了非流式回退的 token 上限（21k → 64k）和超时时间（本地 120s → 300s），因此回退请求被截断的可能性降低
  * 在收到任何响应之前中断提示词现在会自动恢复您的输入，以便您可以编辑并重新提交
  * `/status` 现在可以在 Claude 响应期间工作，而不是排队等待轮次结束
  * 重复组织管理连接器的插件 MCP 服务器现在会被抑制，而不是运行第二个连接
  * Linux：在注册 `claude-cli://` 协议处理程序时遵循 `XDG_DATA_HOME`
  * 将“停止所有后台代理”的快捷键从 `Ctrl+F` 更改为 `Ctrl+X Ctrl+K`，以停止覆盖 readline forward-char
  * 已弃用 `TaskOutput` 工具，建议使用 `Read` 访问后台任务的输出文件路径
  * 新增 `CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK` 环境变量，用于在流式失败时禁用非流式回退
  * 插件选项 (`manifest.userConfig`) 现在外部可用 —— 插件可以在启用时提示进行配置，`sensitive: true` 的值存储在钥匙串（macOS）或受保护的凭据文件（其他平台）中
  * Claude 现在可以引用剪贴板粘贴图像的磁盘路径以进行文件操作
  * `Ctrl+L` 现在会清除屏幕并强制完全重绘 —— 当 Cmd+K 导致 UI 部分空白时，使用此功能进行恢复。使用 `Ctrl+U` 或双击 Esc 清除提示输入。
  * `--bare -p`（SDK 模式）的 API 请求速度快约 14%
  * 记忆：`MEMORY.md` 索引现在在 25KB 以及 200 行处截断
  * 当 `--channels` 活动时禁用了 `AskUserQuestion` 和计划模式工具
  * 修复了在失败的工具调用期间排队粘贴图像时出现的 API 400 错误
  * 修复了当 SSE 连接在调用期间断开并耗尽其重连尝试时，MCP 工具调用无限期挂起的问题
  * 修复了当后台代理在第一条用户消息前完成时，远程控制会话标题显示原始 XML 的问题
  * 修复了由于恢复的记录链中存在进度消息间隙，容器重启后远程会话忘记对话历史记录的问题
  * 修复了远程会话在短暂的身份验证错误时要求重新登录而不是自动重试的问题
  * 修复了 `rg ... | wc -l` 及类似管道命令在 Linux 沙箱模式下挂起并返回 `0` 的问题
  * 修复了当 CJK 输入法插入全角空格时，语音输入按住说话未激活的问题
  * 修复了当工作树名称包含正斜杠时 `--worktree` 静默挂起的问题
  * \[VSCode] 当后端 60 秒未响应时，旋转器现在变为红色并显示“未响应”
  * \[VSCode] 修复了通过 URL 或重启后重新打开会话时会话历史记录未正确加载的问题
  * \[VSCode] 新增了按两次 Esc（或 `/rewind`）以打开键盘可导航的重绕选择器
  * \[VSCode] 修复了在会话缓存过期后，“从此处分叉对话”和重绕操作静默失败的问题



  * 为脚本化 `-p` 调用添加了 `--bare` 标志 — 跳过钩子、LSP、插件同步和技能目录遍历；需要通过 `--settings` 设置 `ANTHROPIC_API_KEY` 或 `apiKeyHelper`（OAuth 和钥匙串认证已禁用）；自动记忆完全禁用
  * 添加了 `--channels` 权限中继 — 声明权限能力的频道服务器可以将工具审批提示转发到您的手机
  * 修复了当一个会话刷新其 OAuth 令牌时，多个并发的 Claude Code 会话要求重复重新认证的问题
  * 修复了语音模式静默吞噬重试失败并显示误导性的“检查网络”信息而非实际错误的问题
  * 修复了当服务器静默断开 WebSocket 连接时语音模式音频无法恢复的问题
  * 修复了 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 未能抑制结构化输出 beta 头，导致转发到 Vertex/Bedrock 的代理网关出现 400 错误的问题
  * 修复了没有其他托管设置配置的 Team/Enterprise 组织的 `--channels` 绕过问题
  * 修复了 Node.js 18 上的崩溃问题
  * 修复了对字符串中包含连字符的 Bash 命令不必要的权限提示
  * 修复了当插件目录在会话中途被删除时，插件钩子阻塞提示提交的问题
  * 修复了一个竞态条件，即当后台代理任务在轮询间隔之间完成时，其输出可能会无限期挂起
  * 恢复一个在工作树中的会话现在会切换回该工作树
  * 修复了在活动响应期间使用时，`/btw` 未包含粘贴文本的问题
  * 修复了在 tmux 下，快速 Cmd+Tab 后接粘贴可能先于剪贴板复制的竞态问题
  * 修复了终端选项卡标题未使用自动生成的会话描述更新的问题
  * 修复了不可见的钩子附件在会话记录模式中虚增消息计数的问题
  * 修复了远程控制会话显示通用标题而非从第一个提示派生的问题
  * 修复了 `/rename` 未同步远程控制会话标题的问题
  * 修复了远程控制 `/exit` 未能可靠归档会话的问题
  * 改进了 MCP 读取/搜索工具调用，将其合并为单行“Queried `{server}`”（可通过 Ctrl+O 展开）
  * 改进了 `!` bash 模式的可发现性 — 当您需要运行交互式命令时，Claude 现在会建议使用它
  * 改进了插件新鲜度 — 引用跟踪的插件现在每次加载时都会重新克隆以获取上游更改
  * 改进了远程控制会话标题，在您发送第三条消息后刷新
  * 更新了 MCP OAuth 以支持客户端 ID 元数据文档（CIMD / SEP-991），适用于没有动态客户端注册的服务器
  * 更改了计划模式默认隐藏“清除上下文”选项（可通过 `"showClearContextOnPlanAccept": true` 恢复）
  * 由于渲染问题，在 Windows（包括 Windows 终端中的 WSL）上禁用了逐行响应流式传输
  * \[VSCode] 修复了使用 Git Bash 时 Bash 工具的 Windows PATH 继承问题（v2.1.78 中的回归）



  * 为状态栏脚本添加了 `rate_limits` 字段，用于显示 Claude.ai 的速率限制使用情况（包含5小时和7天窗口的 `used_percentage` 与 `resets_at`）
  * 新增了 `source: 'settings'` 插件市场来源——可在 settings.json 中内联声明插件条目
  * 插件提示中新增了命令行工具使用检测功能，补充了原有的文件模式匹配
  * 为技能和斜杠命令添加了 `effort` 前置元数据支持，可在调用时覆盖模型努力程度等级
  * 新增了 `--channels`（研究预览版）——允许 MCP 服务器向您的会话推送消息
  * 修复了 `--resume` 丢失并行工具结果的问题——包含并行工具调用的会话现在会恢复所有 tool\_use/tool\_result 对，而非显示 `[Tool result missing]` 占位符
  * 修复了由 Cloudflare 机器人检测导致语音模式 WebSocket 连接失败的问题（针对非浏览器 TLS 指纹）
  * 修复了通过 API 代理、Bedrock 或 Vertex 使用细粒度工具流时出现的 400 错误
  * 修复了 `/remote-control` 在网关及第三方供应商部署中错误显示的问题（该功能在此环境下无法运行）
  * 修复了 `/sandbox` 标签页切换不响应 Tab 或方向键的问题
  * 改进了大型 Git 仓库中 `@` 文件自动补全的响应速度
  * 改进了 `/effort` 指令，现在会显示当前自动模式的具体解析结果，与状态栏指示器保持一致
  * 改进了 `/permissions` 指令——现在在列表内部可通过 Tab 和方向键切换标签页
  * 改进了后台任务面板——左方向键现在可在列表视图中关闭面板
  * 简化了插件安装提示，现在使用单一的 `/plugin install` 命令替代原来的两步流程
  * 减少了大型仓库启动时的内存占用（在 25 万文件仓库中约节省 80 MB）
  * 修复了当 `remote-settings.json` 从上一会话缓存时，托管设置（`enabledPlugins`、`permissions.defaultMode`、策略设置的环境变量）在启动时未被应用的问题



  * 为 `claude auth login` 命令添加了 `--console` 参数，用于 Anthropic Console（API 计费）认证
  * 在 `/config` 菜单中添加了“显示轮次时长”开关
  * 修复了以子进程方式启动 `claude -p` 且未明确提供标准输入（例如 Python `subprocess.run`）时程序挂起的问题
  * 修复了 `-p`（print）模式下 Ctrl+C 无法工作的问题
  * 修复了在流式传输过程中触发 `/btw` 时，返回主代理输出而非回答旁问的问题
  * 修复了设置 `voiceEnabled: true` 后，启动时语音模式未能正确激活的问题
  * 修复了 `/permissions` 中左右箭头键切换标签导航的问题
  * 修复了 `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` 在启动时未能阻止设置终端标题的问题
  * 修复了当工作区信任阻止自定义状态行时，状态行不显示任何内容的问题
  * 修复了企业用户在遇到速率限制（429）错误时无法重试的问题
  * 修复了使用交互式 `/resume` 切换会话时 `SessionEnd` 钩子未触发的问题
  * 通过优化，所有场景下的启动内存占用减少约 18MB
  * 改进了非流式 API 回退机制，增加了每次尝试 2 分钟的超时限制，防止会话无限期挂起
  * `CLAUDE_CODE_PLUGIN_SEED_DIR` 现在支持使用平台路径分隔符（Unix 为 `:`，Windows 为 `;`）分隔的多个种子目录
  * \[VSCode] 新增了 `/remote-control` 命令——可将会话桥接到 claude.ai/code，以便通过浏览器或手机继续操作
  * \[VSCode] 会话标签页现在会根据您的第一条消息生成 AI 生成的标题
  * \[VSCode] 修复了响应完成后，思维指示条显示“思考中”而非“思考了 N 秒”的问题
  * \[VSCode] 修复了从左侧边栏打开会话时缺少会话差异按钮的问题



  * 新增 `StopFailure` 钩子事件，在轮次因 API 错误（速率限制、认证失败等）结束时触发
  * 新增 `${CLAUDE_PLUGIN_DATA}` 变量，用于存储插件持久化状态（插件更新后数据保留）；执行 `/plugin uninstall` 时会提示用户确认是否删除该数据
  * 新增插件内置代理对 `effort`、`maxTurns` 和 `disallowedTools` 前置信息的支持
  * 终端通知（iTerm2/Kitty/Ghostty 弹窗、进度条）在 tmux 内运行（需启用 `set -g allow-passthrough on`）时现在可以传递到外部终端
  * 响应文本现在会逐行流式生成
  * 修复了在 Linux 沙箱化 Bash 环境中执行 `git log HEAD` 报错“有歧义的参数”的问题，以及存根文件污染工作目录 `git status` 输出的问题
  * 修复了 `cc log` 和 `--resume` 在大型会话（使用子代理且超过 5 MB）中静默截断对话历史的问题
  * 修复了 API 错误触发停止钩子后，钩子将阻塞错误重新输入给模型导致无限循环的问题
  * 修复了 `deny: ["mcp__servername"]` 权限规则未能在发送给模型前移除 MCP 服务器工具的问题，导致模型能够查看并尝试使用被阻止的工具
  * 修复了 `sandbox.filesystem.allowWrite` 不支持绝对路径的问题（此前需要添加 `//` 前缀）
  * 修复了 `/sandbox` 依赖项选项卡在 macOS 上错误显示 Linux 先决条件信息的问题（现正确显示 macOS 相关信息）
  * **安全性**：修复了设置 `sandbox.enabled: true` 但缺失依赖时沙箱被静默禁用的问题——现在会显示醒目的启动警告
  * 修复了在 `bypassPermissions` 模式下 `.git`、`.claude` 和其他受保护目录无需提示即可写入的问题
  * 修复了普通模式下 ctrl+u 滚动页面而非执行 readline 删除行命令（ctrl+u/ctrl+d 半页滚动功能已移至仅限转录模式）
  * 修复了语音模式修饰键组合按键绑定（如 ctrl+k）需要长按而非立即激活的问题
  * 修复了 WSL2 配合 WSLg (Windows 11) 时语音模式无法工作的问题；WSL1/Win10 用户现在会看到明确错误提示
  * 修复了 `--worktree` 标志未能从工作树目录加载技能和钩子的问题
  * 修复了 `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` 和 `includeGitInstructions` 设置未能抑制系统提示中 git 状态部分的问题
  * 修复了当 VS Code 从 Dock/Spotlight 启动时，Bash 工具无法找到 Homebrew 及其他依赖 PATH 环境变量的二进制文件的问题
  * 修复了在不支持真彩色的 VS Code/Cursor/code-server 终端中 Claude 橙色显示效果不佳的问题
  * 新增 `ANTHROPIC_CUSTOM_MODEL_OPTION` 环境变量，用于向 `/model` 选择器添加自定义选项，支持使用可选的 `_NAME` 和 `_DESCRIPTION` 后缀变量控制显示名称和描述
  * 修复了使用 Haiku 模型时 `ANTHROPIC_BETAS` 环境变量被静默忽略的问题
  * 修复了队列中的提示词连接时缺少换行分隔符的问题
  * 改进了恢复大型会话时的内存使用和启动时间
  * \[VSCode] 修复了在已认证状态下打开侧边栏时短暂闪现登录界面的问题
  * \[VSCode] 修复了选择 Opus 模型时报错“API Error: Rate limit reached”的问题——模型下拉菜单不再向未知套餐层级的订阅者提供 1M 上下文选项



  * 将 Claude Opus 4.6 的默认最大输出 token 限制提升至 64k token，并将 Opus 4.6 和 Sonnet 4.6 模型的输出上限提升至 128k token
  * 新增 `allowRead` 沙箱文件系统设置，以在 `denyRead` 区域内重新允许读取访问
  * `/copy` 现在接受一个可选的索引：`/copy N` 可复制第 N 个最新的助手回复
  * 修复了复合 bash 命令（例如 `cd src && npm test`）的“始终允许”会保存针对整个字符串的单一规则，而非为每个子命令单独保存，导致规则失效和重复的权限提示
  * 修复了当斜杠命令覆盖层反复打开和关闭时，自动更新器会启动重叠的二进制下载，累积数十 GB 内存的问题
  * 修复了 `--resume` 由于内存提取写入和主记录之间的竞态条件而静默截断近期对话历史的问题
  * 修复了 PreToolUse 钩子返回 `"allow"` 会绕过 `deny` 权限规则（包括企业级管理设置）的问题
  * 修复了在覆盖 CRLF 文件或在 CRLF 目录中创建文件时，写入工具静默转换行尾符的问题
  * 修复了长时间运行的会话中，进度消息在压缩后仍保留导致内存增长的问题
  * 修复了当 API 回退到非流式模式时，成本和 token 用量未被跟踪的问题
  * 修复了 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 未移除 beta 工具架构字段，导致代理网关拒绝请求的问题
  * 修复了当系统临时目录路径包含空格时，Bash 工具会对成功的命令报告错误的问题
  * 修复了粘贴后立即输入时，粘贴内容丢失的问题
  * 修复了在 `/feedback` 文本输入中，Ctrl+D 在第二次按下时本应退出会话，但实际上执行了向前删除的问题
  * 修复了将 0 字节的图像文件拖入提示词时出现 API 错误的问题
  * 修复了 Claude Desktop 会话错误地使用终端 CLI 配置的 API 密钥而非 OAuth 的问题
  * 修复了位于同一 monorepo 提交中不同子目录的 `git-subdir` 插件在插件缓存中冲突的问题
  * 修复了有序列表编号在终端 UI 中不渲染的问题
  * 修复了一个竞态条件，其中过时的工作树清理可能会删除刚刚从上次崩溃中恢复的代理工作树
  * 修复了当代理正在运行时打开 `/mcp` 或类似对话框导致的输入死锁问题
  * 修复了 Backspace 和 Delete 键在 vim 正常模式下不起作用的问题
  * 修复了切换 vim 模式时状态行不更新的问题
  * 修复了在 VS Code、Cursor 和其他基于 xterm.js 的终端中，Cmd+点击时超链接会打开两次的问题
  * 修复了在默认配置的 tmux 内，背景色渲染为终端默认颜色的问题
  * 修复了在通过 SSH 连接的 tmux 会话内选择文本时，iTerm2 会话崩溃的问题
  * 修复了在 tmux 会话中剪贴板复制静默失败的问题；复制提示现在会指示使用 `⌘V` 还是 tmux 的 `prefix+]` 进行粘贴
  * 修复了在设置、权限和沙箱对话框中导航列表时，`←`/`→` 键意外切换标签页的问题
  * 修复了在 tmux 或 screen 内启动时，IDE 集成无法自动连接的问题
  * 修复了 CJK 字符在右侧边缘裁剪时，视觉上溢出到相邻 UI 元素的问题
  * 修复了当主窗口退出时，队友窗格未关闭的问题
  * 修复了 iTerm2 自动模式未能为原生分割窗格队友检测到 iTerm2 的问题
  * macOS 上启动速度更快（约 60 毫秒），通过并行读取钥匙串凭证和模块加载实现
  * 对于 fork 密集型和非常大的会话，`--resume` 速度更快——加载速度提升高达 45%，峰值内存减少约 100-150MB
  * 改进了使用 Esc 中止正在进行的非流式 API 请求的功能
  * 改进了 `claude plugin validate`，现在可以检查技能、代理和命令的前置元数据以及 `hooks/hooks.json`，能够捕获 YAML 解析错误和架构违规
  * 后台 bash 任务现在如果输出超过 5GB 将被终止，防止失控的进程占满磁盘
  * 当您接受一个计划时，会话现在会根据计划内容自动命名
  * 改进了无头模式下的插件安装，使其能与 `CLAUDE_CODE_PLUGIN_SEED_DIR` 正确组合
  * 当 `apiKeyHelper` 耗时超过 10 秒时显示通知，防止其阻塞主循环
  * Agent 工具不再接受 `resume` 参数——请使用 `SendMessage({to: agentId})` 来继续先前生成的代理
  * `SendMessage` 现在会自动在后台恢复已停止的代理，而不是返回错误
  * 将 `/fork` 重命名为 `/branch`（`/fork` 仍作为别名可用）
  * [VSCode] 改进了计划预览标签页的标题，现在使用计划的标题而不是“Claude's Plan”
  * [VSCode] 当 Option+点击在 macOS 上未触发原生选择时，页脚现在会指向 `macOptionClickForcesSelection` 设置



  *   添加了 MCP 引出支持 —— MCP 服务器现在可以在任务中途通过交互式对话框（表单字段或浏览器 URL）请求结构化输入。
  *   添加了新的 `Elicitation` 和 `ElicitationResult` 钩子，以在响应发送回之前拦截并覆盖它们。
  *   添加了 `-n` / `--name <name>` CLI 标志，用于在启动时为会话设置显示名称。
  *   为大型 monorepo 中的 `claude --worktree` 添加了 `worktree.sparsePaths` 设置，可通过 git 稀疏检出仅检出所需的目录。
  *   添加了 `PostCompact` 钩子，该钩子在压缩完成后触发。
  *   添加了 `/effort` 斜杠命令，用于设置模型努力程度。
  *   添加了会话质量调查 —— 企业管理员可以通过 `feedbackSurveyRate` 设置配置采样率。
  *   修复了延迟工具（通过 `ToolSearch` 加载）在对话压缩后丢失其输入模式，导致数组和数字参数因类型错误而被拒绝的问题。
  *   修复了斜杠命令显示“未知技能”的问题。
  *   修复了计划模式在计划已被接受后仍要求重新批准的问题。
  *   修复了在权限对话框或计划编辑器打开时，语音模式会吞掉按键的问题。
  *   修复了通过 npm 安装时 `/voice` 在 Windows 上不工作的问题。
  *   修复了在 100 万上下文会话中调用带有 `model:` 前置数据的技能时出现虚假的“已达到上下文限制”的问题。
  *   修复了使用非标准模型字符串时出现的“此模型不支持自适应思考”错误。
  *   修复了当带引号的参数包含 `#` 时，`Bash(cmd:*)` 权限规则不匹配的问题。
  *   修复了 Bash 权限对话框中的“不再询问”显示管道和复合命令的完整原始命令的问题。
  *   修复了自动压缩在连续失败后无限重试的问题 —— 现在断路器会在 3 次尝试后停止。
  *   修复了 MCP 重新连接旋转指示器在成功重新连接后仍然持续显示的问题。
  *   修复了当 LSP 管理器在市场协调之前初始化时，LSP 插件不注册服务器的问题。
  *   修复了通过 SSH 在 tmux 中的剪贴板复制问题 —— 现在会同时尝试直接终端写入和 tmux 剪贴板集成。
  *   修复了 `/export` 在成功消息中仅显示文件名而非完整文件路径的问题。
  *   修复了选择文本后，记录不会自动滚动到新消息的问题。
  *   修复了 Escape 键无法退出登录方法选择界面的问题。
  *   修复了多个远程控制问题：当服务器回收空闲环境时会话静默终止，快速消息排队为逐个处理而非批量处理，以及在 JWT 刷新后陈旧的工作项导致重新发送。
  *   修复了桥接会话在长时间 WebSocket 断开连接后无法恢复的问题。
  *   修复了输入软隐藏命令的精确名称时找不到斜杠命令的问题。
  *   通过直接读取 git 引用并跳过本地已有远程分支的冗余 `git fetch`，改进了 `--worktree` 启动性能。
  *   改进了后台代理行为 —— 终止后台代理现在会将其部分结果保留在对话上下文中。
  *   改进了模型回退通知 —— 现在始终可见而非隐藏在详细模式之后，并使用更友好的模型名称。
  *   提高了深色终端主题下块引用的可读性 —— 文本现在以斜体显示并带有左侧竖线，而不是暗淡显示。
  *   改进了陈旧工作树清理 —— 中断的并行运行留下的工作树现在会被自动清理。
  *   改进了远程控制会话标题 —— 现在取自您的第一个提示，而非显示“交互式会话”。
  *   改进了 `/voice`，使其在启用时显示您的听写语言，并在您的 `language` 设置不支持语音输入时发出警告。
  *   更新了 `--plugin-dir` 以仅接受一个路径以支持子命令 —— 如需多个目录，请重复使用 `--plugin-dir`。
  *   \[VSCode] 修复了包含逗号的 gitignore 模式导致 @-提及文件选择器静默排除整个文件类型的问题。



  * 默认为 Max、Team 和 Enterprise 计划添加了 100 万 token 上下文窗口（Opus 4.6），此前需要额外用量
  * 为所有用户添加了 `/color` 命令，用于设置会话的提示栏颜色
  * 使用 `/rename` 时，提示栏会显示会话名称
  * 为记忆文件添加了最后修改时间戳，帮助 Claude 区分记忆的新旧程度
  * 当钩子需要确认时，在权限提示中显示钩子来源（settings/plugin/skill）
  * 修复了全新安装时语音模式无法正确激活的问题，无需切换两次 `/voice`
  * 修复了使用 `/model` 或 Option+P 切换模型后，Claude Code 标题栏未更新显示模型名称的问题
  * 修复了当附件消息计算返回未定义值时导致会话崩溃的问题
  * 修复了 Bash 工具在管道命令中错误处理 `!` 的问题（例如，`jq 'select(.x != .y)'` 现在可正常工作）
  * 修复了受管理且已禁用的插件出现在 `/plugin` “已安装”选项卡中的问题 — 由您的组织强制禁用的插件现已隐藏
  * 修复了 thinking 和 `tool_use` 块的 token 估算过高问题，防止过早进行上下文压缩
  * 修复了损坏的市场配置路径处理问题
  * 修复了 `/resume` 在恢复分支或继续的会话后丢失会话名称的问题
  * 修复了访问“配置”选项卡后，按 Esc 键无法关闭 `/status` 对话框的问题
  * 修复了接受或拒绝计划时的输入处理问题
  * 修复了代理团队页脚提示显示“↓ to expand”而非正确的“shift + ↓ to expand”的问题
  * 通过跳过不必要的子进程生成，改善了 macOS 非 MDM 机器上的启动性能
  * 默认情况下，异步钩子完成消息不再显示（使用 `--verbose` 或转录模式时可见）
  * 破坏性变更：移除了已弃用的 Windows 托管设置回退路径 `C:\ProgramData\ClaudeCode\managed-settings.json` — 请使用 `C:\Program Files\ClaudeCode\managed-settings.json`



  * 为 `/context` 命令添加了可操作建议 — 识别上下文过重的工具、内存膨胀和容量警告，并提供具体优化建议
  * 新增 `autoMemoryDirectory` 设置，可为自动记忆存储配置自定义目录
  * 修复了流式 API 响应缓冲区在生成器提前终止时未释放导致的内存泄漏问题，该问题会导致 Node.js/npm 代码路径上 RSS 无限增长
  * 修复了托管策略 `ask` 规则被用户 `allow` 规则或技能 `allowed-tools` 绕过的问题
  * 修复了完整模型 ID（例如 `claude-opus-4-5`）在代理 frontmatter `model:` 字段和 `--agents` JSON 配置中被静默忽略的问题 — 代理现在接受与 `--model` 相同的模型值
  * 修复了当回调端口已被占用时 MCP OAuth 认证挂起的问题
  * 修复了对于返回 HTTP 200 错误（如 Slack）的 OAuth 服务器，在刷新令牌过期后 MCP OAuth 刷新永不提示重新认证的问题
  * 修复了语音模式在 macOS 原生二进制文件上对于终端从未被授予麦克风权限的用户静默失败的问题 — 该二进制文件现在包含 `audio-input` 权限，因此 macOS 能正确提示
  * 修复了 `SessionEnd` 钩子在退出时无论 `hook.timeout` 设置如何都会在 1.5 秒后被终止的问题 — 现在可通过 `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` 进行配置
  * 修复了 REPL 内部 `install` 对于具有本地源的市场插件失败的问题
  * 修复了市场更新未同步 git 子模块的问题 — 子模块中的插件源在更新后不再损坏
  * 修复了带参数的未知斜杠命令静默丢弃输入的问题 — 现在会显示您的输入作为警告
  * 修复了希伯来语、阿拉伯语及其他 RTL 文本在 Windows Terminal、conhost 和 VS Code 集成终端中渲染不正确的问题
  * 修复了由于文件 URI 格式错误导致 LSP 服务器在 Windows 上无法工作的问题
  * 更改了 `--plugin-dir` 行为，使得本地开发副本现在会覆盖同名的已安装市场插件（除非该插件被托管设置强制启用）
  * \[VSCode] 修复了未命名会话的删除按钮不起作用的问题
  * \[VSCode] 通过终端感知加速改善了集成终端中滚轮的响应速度



  * 新增 `modelOverrides` 设置，用于将模型选择器条目映射到自定义提供商模型 ID（例如 Bedrock 推理配置文件 ARN）
  * 当 OAuth 登录或连接性检查因 SSL 证书错误（企业代理、`NODE_EXTRA_CA_CERTS`）失败时，新增可操作的指导
  * 修复了复杂 bash 命令的权限提示导致的冻结和 100% CPU 循环问题
  * 修复了当多个技能文件同时更改（例如，在具有大型 `.claude/skills/` 目录的仓库中执行 `git pull` 期间）可能导致 Claude Code 死锁的问题
  * 修复了在同一项目目录中运行多个 Claude Code 会话时，Bash 工具输出丢失的问题
  * 修复了在 Bedrock、Vertex 和 Microsoft Foundry 上，子代理中指定 `model: opus`/`sonnet`/`haiku` 被静默降级到旧模型版本的问题
  * 修复了子代理生成的后台 bash 进程在代理退出时未被清理的问题
  * 修复了 `/resume` 命令在选择器中显示当前会话的问题
  * 修复了在自动安装扩展时 `/ide` 命令因 `onInstall is not defined` 而崩溃的问题
  * 修复了在 Bedrock/Vertex/Foundry 上以及禁用遥测时 `/loop` 命令不可用的问题
  * 修复了通过 `--resume` 或 `--continue` 恢复会话时，SessionStart 钩子触发两次的问题
  * 修复了 JSON 输出钩子在每一轮对话中向模型上下文注入无操作系统提醒消息的问题
  * 修复了慢速连接与新录音重叠时导致语音模式会话损坏的问题
  * 修复了原生构建中 Linux 沙箱因提示“ripgrep (rg) not found”而启动失败的问题
  * 修复了 Amazon Linux 2 和其他 glibc 2.26 系统上 Linux 原生模块无法加载的问题
  * 修复了通过 Remote Control 接收图像时出现“media\_type: Field required” API 错误的问题
  * 修复了 Windows 上当 Desktop 文件夹已存在时，`/heapdump` 命令因 `EEXIST` 错误而失败的问题
  * 改进了中断 Claude 后的向上箭头行为 — 现在可以一步恢复被中断的提示词并回退对话
  * 改进了启动时 IDE 检测速度
  * 改进了 macOS 上的剪贴板图像粘贴性能
  * 改进了 `/effort` 命令，使其在 Claude 响应期间也能工作，与 `/model` 行为一致
  * 改进了语音模式，使其在快速连续按下对讲机按钮时自动重试瞬时连接故障
  * 改进了 Remote Control 生成模式选择提示，提供更好的上下文
  * 将 Bedrock、Vertex 和 Microsoft Foundry 上的默认 Opus 模型更改为 Opus 4.6（原为 Opus 4.1）
  * 弃用 `/output-style` 命令 — 请改用 `/config`。输出样式现在在会话开始时固定，以改善提示词缓存
  * VSCode：修复了代理后用户或使用 Claude 4.5 模型的 Bedrock/Vertex 用户出现的 HTTP 400 错误



  * 修复了工具搜索功能，现在即使设置了 `ANTHROPIC_BASE_URL`，只要设置了 `ENABLE_TOOL_SEARCH`，该功能也会激活。
  * 在 `/copy` 命令中添加了 `w` 键，用于直接将聚焦选中的内容写入文件（绕过剪贴板，在通过 SSH 使用时很有用）。
  * 为 `/plan` 命令添加了可选的描述参数（例如，`/plan 修复认证漏洞`），该参数会进入计划模式并立即开始执行。
  * 添加了 `ExitWorktree` 工具，用于退出 `EnterWorktree` 会话。
  * 添加了 `CLAUDE_CODE_DISABLE_CRON` 环境变量，以在会话中立即停止计划的定时任务。
  * 将 `lsof`、`pgrep`、`tput`、`ss`、`fd` 和 `fdfind` 添加到 bash 自动批准允许列表，减少了常见只读操作的权限提示。
  * 恢复了 Agent 工具上的 `model` 参数，用于每次调用时的模型覆盖。
  * 简化了 effort 级别为 low/medium/high（移除了 max），并使用了新的符号（○ ◐ ●）和简短通知，而非持久图标。使用 `/effort auto` 可恢复为默认值。
  * 改进了 `/config` 命令——Escape 现在用于取消更改，Enter 用于保存并关闭，Space 用于切换设置。
  * 改进了上箭头键历史记录，在运行多个并发会话时，现在会优先显示当前会话的消息。
  * 改进了仓库名称和常见开发术语（regex、OAuth、JSON）的语音输入转录准确性。
  * 通过切换到原生模块改进了 bash 命令解析——初始化更快，且无内存泄漏。
  * 减少了约 510 KB 的包体积。
  * 更改了 CLAUDE.md 中的 HTML 注释（`<!-- ... -->`），使其在自动注入时对 Claude 不可见。使用 Read 工具读取时，注释仍然可见。
  * 修复了当后台任务或钩子响应缓慢时，退出过程缓慢的问题。
  * 修复了代理任务进度卡在“正在初始化...”的问题。
  * 修复了当模型调用启用钩子的技能时，技能钩子会为每个事件触发两次的问题。
  * 修复了多个语音模式问题：偶尔的输入延迟、松开按键通话后出现误报的“未检测到语音”错误，以及提交后陈旧的转录文本重新填充提示词的问题。
  * 修复了在执行 `--compact` 后，`--continue` 未能从最近的点恢复的问题。
  * 修复了 bash 安全解析的边缘情况。
  * 添加了对不带 `.git` 后缀的 marketplace git URL 的支持（Azure DevOps、AWS CodeCommit）。
  * 改进了 marketplace 克隆失败的消息，现在即使 git 未输出标准错误，也会显示诊断信息。
  * 修复了多个插件问题：在 OneDrive 文件夹中安装失败并出现 `EEXIST` 错误、存在项目范围安装时 marketplace 阻止用户范围安装、`CLAUDE_CODE_PLUGIN_CACHE_DIR` 创建字面 `~` 目录、以及包含仅限 marketplace 字段的 `plugin.json` 加载失败。
  * 修复了反馈调查在长会话中出现过于频繁的问题。
  * 修复了 `--effort` CLI 标志在启动时被不相关的设置写入重置的问题。
  * 修复了后台 Ctrl+B 查询在 `/clear` 后丢失其转录文本或损坏新对话的问题。
  * 修复了 `/clear` 命令会终止后台代理/bash 任务的问题——现在只清除前台任务。
  * 修复了工作树隔离问题：任务工具恢复时未恢复当前工作目录，以及后台任务通知缺少 `worktreePath` 和 `worktreeBranch`。
  * 修复了在 Claude 工作时运行 `/model` 不显示结果的问题。
  * 修复了在计划模式权限提示的文本输入框中，数字键选择菜单选项而非输入的问题。
  * 修复了沙箱权限问题：某些文件写入操作未经提示就被错误允许，以及输出重定向到允许列表目录（如 `/tmp/claude/`）时不必要地进行提示。
  * 改进了长会话中的 CPU 利用率。
  * 修复了 SDK `query()` 调用中的提示词缓存失效问题，可将输入 token 成本降低最多 12 倍。
  * 修复了取消查询后 Escape 键无响应的问题。
  * 修复了在后台代理或任务运行时，双击 Ctrl+C 无法退出的问题。
  * 修复了团队代理不继承领导者模型的问题。
  * 修复了“始终允许”保存了永不匹配的权限规则的问题。
  * 修复了多个钩子问题：恢复/分叉会话时 `transcript_path` 指向错误目录、每次写入设置时代理的 `prompt` 从 settings.json 中被静默删除、PostToolUse 阻止原因显示两次、异步钩子未通过 bash `read -r` 接收标准输入、以及验证错误消息显示了一个无法通过验证的示例。
  * 修复了当 Read 返回的文件包含 U+2028/U+2029 字符时，桌面/SDK 会话崩溃的问题。
  * 修复了即使设置了 `CLAUDE_CODE_DISABLE_TERMINAL_TITLE`，退出时终端标题仍被清除的问题。
  * 修复了多个权限规则匹配问题：通配符规则不匹配包含 heredocs、内嵌换行符或无参数的命令；`sandbox.excludedCommands` 在带有环境变量前缀时失败；“始终允许”为嵌套 CLI 工具建议过于宽泛的前缀；以及拒绝规则未应用于所有命令形式。
  * 修复了来自 Bash data-URL 输出的过大和被截断的图像。
  * 修复了恢复包含 Bedrock API 错误的会话时出现的崩溃。
  * 修复了 Edit、Bash 和 Grep 工具输入时出现的间歇性“期望布尔值，收到字符串”验证错误。
  * 修复了从第一条消息包含换行符的对话进行分叉时出现的多行会话标题问题。
  * 修复了排队消息不显示附带图像，以及在按下 ↑ 编辑排队消息时图像丢失的问题。
  * 修复了并行工具调用中失败的 Read/WebFetch/Glob 会取消其兄弟调用的问题——现在只有 Bash 错误会级联。
  * VSCode: 修复了集成终端中的滚动速度与原生终端不匹配的问题。
  * VSCode: 为使用旧版按键绑定的用户修复了 Shift+Enter 提交输入而非插入换行符的问题。
  * VSCode: 在输入框边框添加了 effort 级别指示器。
  * VSCode: 添加了 `vscode://anthropic.claude-code/open` URI 处理器，以编程方式打开新的 Claude Code 选项卡，支持可选的 `prompt` 和 `session` 查询参数。



  * 新增 `/loop` 命令，用于按固定时间间隔执行提示词或斜杠命令（例如 `/loop 5m 检查部署`）
  * 新增会话内循环执行提示词的定时计划工具
  * 新增 `voice:pushToTalk` 键位绑定，允许在 `keybindings.json` 中自定义语音激活按键（默认：空格键）——使用 `meta+k` 等修饰键+字母组合不会产生输入冲突
  * 将 `fmt`、`comm`、`cmp`、`numfmt`、`expr`、`test`、`printf`、`getconf`、`seq`、`tsort` 和 `pr` 添加至 bash 自动批准白名单
  * 修复长时间运行会话中键盘输入停止响应但进程仍保持活动的 stdin 冻结问题
  * 修复语音模式用户在系统唤醒后出现的 5-8 秒启动冻结，该问题由 CoreAudio 初始化阻塞主线程导致
  * 修复多个 claude.ai 代理连接器同时刷新过期 OAuth 令牌时造成的启动界面冻结
  * 修复分叉对话（`/fork`）共享同一计划文件，导致一个分叉中的计划编辑覆盖另一个分叉的问题
  * 修复图片处理失败时 Read 工具将超大图片放入上下文，破坏长图片密集型会话后续轮次的问题
  * 修复包含 heredoc 提交消息的复合 bash 命令出现误报权限提示的问题
  * 修复运行多个 Claude Code 实例时插件安装丢失的问题
  * 修复 claude.ai 连接器在 OAuth 令牌刷新后无法重新连接的问题
  * 修复 claude.ai MCP 连接器启动通知出现在所有组织配置连接器上而非仅先前已连接的连接器的问题
  * 修复后台代理完成通知缺少输出文件路径，导致父代理在上下文压缩后难以恢复代理结果的问题
  * 修复命令以非零状态退出时 Bash 工具错误消息出现重复输出的问题
  * 修复在没有本地 Chrome 的机器上运行后 Chrome 扩展自动检测永久卡在“未安装”状态的问题
  * 修复 `/plugin marketplace update` 在商城固定到分支/标签引用时因合并冲突失败的问题
  * 修复 `/plugin marketplace add owner/repo@ref` 错误解析 `@` 的问题——此前仅 `#` 可用作引用分隔符，导致 `strictKnownMarketplaces` 出现无法诊断的错误
  * 修复 `/permissions` 工作区标签中同一目录带与不带尾部斜杠添加时出现重复条目的问题
  * 修复配置团队代理时 `--print` 永久挂起的问题——退出循环不再等待长期存在的 `in_process_teammate` 任务
  * 修复每次 `ToolSearch` 调用后 REPL 中出现 "❯ Tool loaded." 提示的问题
  * 修复 Windows 上模型使用 mingw 风格路径时提示 `cd <cwd> && git ...` 的问题
  * 通过延迟原生图片处理器加载至首次使用来优化启动时间
  * 改进桥接会话重连机制，使其在笔记本电脑从睡眠唤醒后数秒内完成重连，而非最多等待 10 分钟
  * 改进 `/plugin uninstall` 功能，改为在 `.claude/settings.local.json` 中禁用项目作用域插件而非修改 `.claude/settings.json`，避免影响团队成员
  * 改进插件提供的 MCP 服务器去重逻辑——当服务器与手动配置的服务器（相同命令/URL）重复时，系统会自动跳过，避免重复连接和工具集。抑制信息显示在 `/plugin` 菜单中。
  * 更新 `/debug` 命令以在会话中途切换调试日志记录，因为调试日志不再默认写入
  * 移除未认证组织注册的 claude.ai 连接器的启动通知干扰



  * 修复了使用 `ANTHROPIC_BASE_URL` 连接第三方网关时出现的 API 400 错误 — 工具搜索现在能正确检测代理端点并禁用 `tool_reference` 块
  * 修复了使用自定义 Bedrock 推理配置文件或其他不符合标准 Claude 命名模式的模型标识符时出现的 `API Error: 400 This model does not support the effort parameter` 错误
  * 修复了 `ToolSearch` 之后立即出现的空模型响应 — 服务器在提示词末尾以系统提示词风格的标签渲染工具模式，这可能会导致模型混淆并提前停止
  * 修复了 MCP 服务器在首次轮次后连接时带 `instructions` 会导致提示词缓存失效的问题
  * 修复了通过慢速 SSH 连接输入时，回车键会插入换行符而非提交的问题
  * 修复了在 Windows/WSL 上使用 PowerShell `Set-Clipboard` 导致剪贴板损坏非 ASCII 文本（中日韩字符、表情符号）的问题
  * 修复了在 Windows 上从 VS Code 集成终端运行时，启动时会额外打开 VS Code 窗口的问题
  * 修复了 Windows 原生二进制文件上语音模式因“无法加载原生音频模块”而失败的问题
  * 修复了在设置中启用 `voiceEnabled: true` 后，会话开始时按键说话未激活的问题
  * 修复了包含 `#NNN` 引用的 markdown 链接错误指向当前仓库而非链接 URL 的问题
  * 修复了当项目的 `.claude/settings.json` 中固定了旧版 Opus 模型字符串时，反复出现“模型已更新至 Opus 4.6”通知的问题
  * 修复了插件在 `/plugin` 中显示为不准确已安装的问题
  * 修复了全新启动时插件显示“在市场中未找到”错误的问题，现在会在市场安装后自动刷新
  * 修复了 `/security-review` 命令在旧版 git 上因 `unknown option merge-base` 而失败的问题
  * 修复了 `/color` 命令无法重置回默认颜色的问题 — `/color default`、`/color gray`、`/color reset` 和 `/color none` 现在均可恢复默认设置
  * 修复了 `AskUserQuestion` 预览对话框中的性能退化问题，该问题导致在备注输入框中每次按键都会重新运行 markdown 渲染
  * 修复了启动早期读取的功能标志从不刷新其磁盘缓存，导致陈旧值在会话间持续存在的问题
  * 修复了在 Claude Code Remote 环境中，`permissions.defaultMode` 设置为 `acceptEdits` 或 `plan` 之外的值会被应用的问题 — 这些值现在会被忽略
  * 修复了每次 `--resume` 时都会重新注入技能列表的问题（每次恢复约节省 600 token）
  * 修复了 VS Code 传送会话中传送标记未渲染的问题
  * 改进了麦克风捕获到静音时的错误信息，以区分“未检测到语音”
  * 改进了压缩过程，以在摘要请求中保留图像，从而允许提示词缓存重用，使压缩更快、更省资源
  * 改进了 `/rename` 命令，使其可在 Claude 处理时工作，而非被静默排队
  * 将轮次期间的提示词输入重新渲染减少了约 74%
  * 为没有自定义 CA 证书的用户减少了约 426KB 的启动内存
  * 将已连接状态下的远程控制 `/poll` 频率降低至每 10 分钟一次（原为 1–2 秒），服务器负载减少约 300 倍。重连不受影响 — 传输丢失会立即唤醒快速轮询。
  * [VSCode] 在 VS Code 活动栏中添加了火花图标，可列出所有 Claude Code 会话，会话将以完整编辑器形式打开
  * [VSCode] 为 VS Code 中的计划添加了完整的 markdown 文档视图，支持添加评论以提供反馈
  * [VSCode] 添加了原生 MCP 服务器管理对话框 — 在聊天面板中使用 `/mcp` 可启用/禁用服务器、重新连接并管理 OAuth 认证，无需切换到终端



  * 新增 `/claude-api` 技能，用于使用 Claude API 和 Anthropic SDK 构建应用程序
  * 新增在空 bash 提示符（`!`）下使用 Ctrl+U 退出 bash 模式，与 `escape` 和 `backspace` 键功能一致
  * 新增数字键盘支持 Claude 面试问题中的选项选择（此前仅支持 QWERTY 上方的数字行）
  * 为 `/remote-control` 和 `claude remote-control` 新增可选的 `name` 参数（如 `/remote-control My Project` 或 `--name "My Project"`），用于设置在 claude.ai/code 中可见的自定义会话标题
  * 语音 STT 新增支持 10 种语言（总计 20 种）——俄语、波兰语、土耳其语、荷兰语、乌克兰语、希腊语、捷克语、丹麦语、瑞典语、挪威语
  * 在 logo 和加载指示器中新增努力级别显示（例如 "with low effort"），便于查看当前激活的设置
  * 使用 `claude --agent` 时，在终端标题中新增代理名称显示
  * 新增 `sandbox.enableWeakerNetworkIsolation` 设置（仅限 macOS），允许 `gh`、`gcloud` 和 `terraform` 等 Go 程序在使用自定义 MITM 代理（`httpProxyPort`）时验证 TLS 证书
  * 新增 `includeGitInstructions` 设置（及 `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` 环境变量），用于从 Claude 的系统提示词中移除内置的提交和 PR 工作流说明
  * 新增 `/reload-plugins` 命令，可在不重启的情况下激活待处理的插件更改
  * 新增一次性启动提示，在 macOS 和 Windows 上建议使用 Claude Code Desktop（最多显示 3 次，可关闭）
  * 新增 `${CLAUDE_SKILL_DIR}` 变量，供技能在 SKILL.md 内容中引用其自身目录
  * 新增 `InstructionsLoaded` 钩子事件，当 CLAUDE.md 或 `.claude/rules/*.md` 文件加载到上下文中时触发
  * 新增 `agent_id`（用于子代理）和 `agent_type`（用于子代理和 `--agent`）钩子事件属性
  * 在 `--worktree` 会话运行时，新增 `worktree` 字段到状态行钩子命令中，包含名称、路径、分支和原始仓库目录
  * 在托管设置中新增 `pluginTrustMessage`，用于在安装前显示的插件信任警告中附加组织特定的上下文信息
  * 新增策略限制获取（例如远程控制限制），现在适用于 Team 计划 OAuth 用户，不仅限于 Enterprise
  * 为 `strictKnownMarketplaces` 新增 `pathPattern`，用于对文件/目录市场源进行正则表达式匹配，与 `hostPattern` 限制并存
  * 新增插件源类型 `git-subdir`，用于指向 git 仓库内的子目录
  * 新增 `oauth.authServerMetadataUrl` 配置选项，供 MCP 服务器在标准发现失败时指定自定义的 OAuth 元数据发现 URL
  * 修复了嵌套技能发现可能从 `.gitignore` 忽略的目录（如 `node_modules`）加载技能的安全问题
  * 修复了首次运行时信任对话框静默启用所有 `.mcp.json` 服务器的问题。现在将按预期显示每个服务器的批准对话框
  * 修复了 `claude remote-control` 在 npm 安装时立即崩溃并显示 "bad option: --sdk-url" 的问题 (anthropics/claude-code#28334)
  * 修复了 `--model claude-opus-4-0` 和 `--model claude-opus-4-1` 解析为已弃用的 Opus 版本而非当前版本的问题
  * 修复了使用多个 OAuth MCP 服务器时 macOS 钥匙串损坏的问题。较大的 OAuth 元数据块可能溢出 `security -i` 的 stdin 缓冲区，导致静默遗留过期凭证并反复触发 `/login` 提示
  * 修复了在 token 刷新期间配置端点临时失败时，`.credentials.json` 丢失 `subscriptionType`（显示 "Claude API" 而非 "Claude Pro"/"Claude Max"）的问题 (anthropics/claude-code#30185)
  * 修复了在 Linux 上通过沙箱运行 Bash 命令后，工作目录中出现幽灵点文件（`.bashrc`、`HEAD` 等）作为未跟踪文件的问题
  * 修复了通过 SSH 在 Ghostty 中使用 Shift+Enter 会打印 `[27;2;13~` 而非插入新行的问题
  * 修复了在 Claude 工作时提交消息会清空暂存区（Ctrl+S）的问题
  * 修复了在包含大量文件编辑的长会话中，ctrl+o（切换记录视图）会冻结数秒的问题
  * 修复了计划模式反馈输入不支持多行文本输入的问题（现在反斜杠+Enter 和 Shift+Enter 可插入新行）
  * 修复了光标无法向下移动到输入框顶部的空行的问题
  * 修复了当记录文件包含缺失或格式错误的时间戳条目时，`/stats` 命令崩溃的问题
  * 修复了在长会话中流式传输错误后出现短暂挂起的问题（记录文件此前会被完整重写以删除一行；现在已改为就地截断）
  * 修复了 `--setting-sources user` 未能阻止动态发现的项目技能的问题
  * 修复了从嵌套在其主仓库内的工作树运行时（例如 `claude -w`），出现重复的 CLAUDE.md、斜杠命令、代理和规则的问题
  * 修复了在执行任何 `/plugin` 操作后，插件的 Stop/SessionEnd 等钩子未触发的问题
  * 修复了当两个插件使用相同的 `${CLAUDE_PLUGIN_ROOT}/...` 命令模板时，插件钩子被静默丢弃的问题
  * 修复了在长时间运行的 SDK/CCR 会话中，由于不必要地保留对话消息而导致的内存泄漏
  * 修复了在恢复被中断的工具批次会话时，分叉代理（自动压缩、摘要）出现 API 400 错误的问题
  * 修复了当恢复以孤立工具结果开头的对话时，出现 "unexpected tool\_use\_id found in tool\_result blocks" 错误的问题
  * 修复了队友意外地通过 Agent 工具的 `name` 参数生成嵌套队友的问题
  * 修复了在对话压缩期间忽略 `CLAUDE_CODE_MAX_OUTPUT_TOKENS` 的问题
  * 修复了在 SDK 消费端（Claude Code Remote Web UI、VSCode 扩展）中，`/compact` 摘要渲染为用户气泡的问题
  * 修复了语音空格键在语音激活失败后卡住的问题（模块加载竞争、GrowthBook 冷启动）
  * 修复了 Windows 上的工作树文件复制问题
  * 修复了 Windows 上的全局 `.claude` 文件夹检测问题
  * 修复了在 `acceptEdits` 模式下，通过符号链接父目录写入新文件可能逃逸工作目录的符号链接绕过问题
  * 修复了在托管设置中启用 `allowManagedDomainsOnly` 时，沙箱提示用户批准非允许域名的问题——现在非允许域名将被自动阻止，无法绕过
  * 修复了交互式工具（例如 `AskUserQuestion`）在技能的 `allowed-tools` 中列出时被静默自动允许的问题，绕过了权限提示并使用空答案运行
  * 修复了在提交包含大型未跟踪二进制文件时出现数 GB 内存峰值的问题
  * 修复了当输入框有草稿文本时，Escape 键无法中断正在运行的轮次的问题。使用上箭头键可将排队的消息拉回编辑，或使用 Ctrl+U 清除输入行
  * 修复了在远程控制会话中运行本地斜杠命令（`/voice`、`/cost`）时 Android 应用崩溃的问题
  * 修复了在 React Compiler `memoCache` 中旧消息数组版本在长会话中累积导致的内存泄漏
  * 修复了 REPL 渲染作用域在长会话中累积导致的内存泄漏（约 35MB / 1000 轮次）
  * 修复了进程内队友的内存保留问题，父级的完整对话历史在队友生命周期内被固定，阻止了 `/clear` 或自动压缩后的垃圾回收
  * 修复了在交互模式下，钩子事件在长会话期间无界累积导致的内存泄漏
  * 修复了当 `--mcp-config` 指向损坏文件时的挂起问题
  * 修复了当安装了大量技能/插件时启动缓慢的问题
  * 修复了 `cd <outside-dir> && <cmd>` 权限提示，现在会显示链接的命令，而非仅显示 "Yes, allow reading from `<dir>`/"
  * 修复了条件性 `.claude/rules/*.md` 文件（带有 `paths:` 前置元数据）和嵌套 CLAUDE.md 文件在打印模式（`claude -p`）下未加载的问题
  * 修复了 `/clear` 未能完全清除所有会话缓存，导致长会话内存保留增加的问题
  * 修复了由滚动回溯边界处的动画元素引起的终端闪烁
  * 修复了在 macOS 上使用带 OAuth 的 MCP 服务器时出现 UI 帧下降的问题（2.1.x 版本的回归）
  * 修复了在输入时偶发的帧卡顿，由同步调试日志刷新引起
  * 修复了 `TeammateIdle` 和 `TaskCompleted` 钩子以支持 `{"continue": false, "stopReason": "..."}` 来停止队友，与 `Stop` 钩子行为保持一致
  * 修复了 `WorktreeCreate` 和 `WorktreeRemove` 插件钩子被静默忽略的问题
  * 修复了包含冒号的技能描述（例如 "Triggers include: X, Y, Z"）从 SKILL.md 前置元数据加载失败的问题
  * 修复了没有 `description:` 前置元数据字段的项目技能未出现在 Claude 可用技能列表中的问题
  * 修复了 `/context` 显示来自同一服务器的所有 MCP 工具的 token 计数相同的问题
  * 修复了在 Git Bash 中模型使用 CMD 风格的 `2>nul` 重定向时，在 Windows 上创建字面量 `nul` 文件的问题
  * 修复了在展开的子代理记录视图（Ctrl+O）中，每个工具调用下方出现多余空行的问题
  * 修复了当 `/config` 搜索框被聚焦但为空时，Tab/方向键无法循环切换设置选项卡的问题
  * 修复了服务密钥 OAuth 会话（CCR 容器）因配置端点返回 403 错误而大量记录 `[ERROR]` 日志的问题
  * 修复了 "Remote Control active" 状态指示器颜色不一致的问题
  * 修复了在输入中途听写时，语音波形光标覆盖第一个后缀字母的问题
  * 修复了语音输入在预热期间显示所有 5 个空格而非限制在约 2 个的问题（与 "keep holding…" 提示一致）
  * 通过将 50ms 动画循环与周围 shell 隔离，改进了加载指示器性能，减少了轮次期间的渲染和 CPU 开销
  * 通过 React Compiler 改进了原生二进制文件的 UI 渲染性能
  * 通过消除启动路径上的 git 子进程，改进了 `--worktree` 启动速度
  * 通过在托管设置解析时消除冗余的设置文件重载，改进了 macOS 启动速度
  * 通过跳过不必要的钥匙串查找，改进了 macOS 上 Claude.ai 企业/团队用户的启动速度
  * 通过将 claude.ai 配置获取与本地连接管道化，并使用并发池而非顺序批处理，改进了 MCP `-p` 启动速度
  * 通过移除引起重渲染卡顿的、难以察觉的预热脉冲动画，改进了语音启动
  * 改进了 MCP 二进制内容处理：现在返回 PDF、Office 文档或音频的工具会将解码后的字节保存到磁盘并带有正确的文件扩展名，而非将原始 base64 转储到对话上下文中。WebFetch 也会在保存摘要的同时保存二进制响应。
  * 通过在消息更新间稳定 `onSubmit`，改进了长会话中的内存使用
  * 改进了 LSP 工具渲染和内存上下文构建，不再读取整个文件
  * 改进了会话上传和内存同步，在检查大小/二进制前避免将大文件读入内存
  * 通过避免在存在性检查时读取文件内容（6 处），改进了文件操作性能
  * 改进了文档，澄清 `--append-system-prompt-file` 和 `--system-prompt-file` 可在交互模式下使用（文档此前仅提及打印模式）
  * 通过延迟加载 Yoga WASM 预加载，将基础内存减少约 16MB
  * 减少了使用 stream-json 输出的 SDK 和 CCR 会话的内存占用
  * 减少了恢复大型会话（包括压缩历史）时的内存使用
  * 通过使用更简洁的子代理最终报告，减少了多代理任务的 token 使用量
  * 将 Pro/Max/Team Premium 上的 Sonnet 4.5 用户自动迁移至 Sonnet 4.6
  * 将 `/resume` 选择器更改为显示您最近的提示词，而非第一个。这也解决了一些标题显示为 `(session)` 的问题。
  * 将 claude.ai MCP 连接器失败行为更改为显示通知，而非静默从工具列表中消失
  * 将示例命令建议更改为确定性生成，而非调用 Haiku
  * 将压缩后恢复的行为更改为在继续之前不再产生序言回顾
  * [SDK] 将任务创建更改为不再要求 `activeForm` 字段——加载指示器会回退到任务主题
  * [VSCode] 新增压缩显示为可折叠的 "Compacted chat" 卡片，内部包含摘要
  * [VSCode] 权限模式选择器现在遵循您有效的 Claude Code 设置（包括托管/策略设置）中的 `permissions.disableBypassPermissionsMode`——当设置为 `disable` 时，绕过权限模式将从选择器中隐藏
  * [VSCode] 修复了聊天面板中 RTL 文本（阿拉伯语、希伯来语、波斯语）渲染反向的问题（v2.1.63 版本的回归）



  * Opus 4.6 现在默认为 Max 和 Team 订阅用户设置为中等程度。中等程度适用于大多数任务——它是速度与全面性之间的最佳平衡点。您可以随时使用 `/model` 更改此设置
  * 重新引入 "ultrathink" 关键字，用于在下一次对话中启用高程度
  * 从 Claude Code 的第一方 API 中移除了 Opus 4 和 4.1——固定使用这些模型的用户将自动迁移至 Opus 4.6



  * 减少不必要的错误日志记录



  * 新增 `/simplify` 和 `/batch` 内置斜杠命令
  * 修复本地斜杠命令（如 `/cost`）的输出在界面中显示为用户发送消息而非系统消息的问题
  * 项目配置与自动记忆现可在同一仓库的 git 工作树间共享
  * 新增 `ENABLE_CLAUDEAI_MCP_SERVERS=false` 环境变量，用于禁用 claude.ai MCP 服务器的可用性
  * 优化 `/model` 命令，在斜杠命令菜单中显示当前激活的模型
  * 新增 HTTP 钩子功能，可向 URL 发送 POST JSON 请求并接收 JSON 响应，无需执行 shell 命令
  * 修复桥接轮询循环中的监听器泄漏问题
  * 修复 MCP OAuth 流程清理时的监听器泄漏问题
  * 在 MCP OAuth 认证期间新增手动粘贴 URL 的备选方案。若自动 localhost 重定向失败，可手动粘贴回调 URL 完成认证
  * 修复导航钩子配置菜单时的内存泄漏
  * 修复自动审批期间交互式权限处理器的监听器泄漏问题
  * 修复文件计数缓存忽略 glob 忽略模式的问题
  * 修复 bash 命令前缀缓存的内存泄漏
  * 修复 MCP 工具/资源缓存在服务器重连时泄漏的问题
  * 修复 IDE 主机 IP 检测缓存在不同端口间错误共享结果的问题
  * 修复 WebSocket 监听器在传输层重连时的泄漏问题
  * 修复 git 根目录检测缓存的内存泄漏，该问题可能导致长时间运行的会话出现无限增长
  * 修复 JSON 解析缓存的内存泄漏，该问题会在长时间会话中导致缓存无限增长
  * VSCode：修复远程会话未出现在对话历史记录中的问题
  * 修复 REPL 桥接中的竞态条件——在初始连接刷新期间，新消息可能与历史消息在服务器端交错到达，导致消息顺序错乱
  * 修复长时间运行的协作者在对话压缩后仍保留所有 AppState 消息的内存泄漏问题
  * 修复 MCP 服务器断开连接时未清除获取缓存导致的内存泄漏，该问题会在频繁重连的服务器中加剧内存占用
  * 通过上下文压缩时剥离冗长的进度消息负载，优化子代理在长时间会话中的内存使用
  * 在 `/copy` 选择器中新增“始终复制完整响应”选项。勾选后，后续 `/copy` 命令将跳过代码块选择器，直接复制完整响应
  * VSCode：在会话列表中新增会话重命名与移除操作
  * 修复 `/clear` 未重置缓存技能的问题，该问题可能导致新会话中残留过时技能内容



  * 修复了降低缓存命中率的提示词建议缓存回归问题



  * 修复了Windows系统下并发写入导致配置文件损坏的问题



  * Claude 自动将有用上下文保存到自动记忆中。使用 `/memory` 管理
  * 新增 `/copy` 命令，当存在代码块时会显示交互式选择器，允许选择单个代码块或完整响应
  * 改进了复合bash命令（例如 `cd /tmp && git fetch && git push`）的"始终允许"前缀建议，改为智能计算每个子命令的前缀，而非将整个命令视为一个整体
  * 改进了短任务列表的排序
  * 通过释放已完成的子代理任务状态，改善了多代理会话的内存使用
  * 修复了多个Claude Code实例同时运行时MCP OAuth令牌刷新的竞态条件
  * 修复了工作目录被删除时shell命令未显示清晰错误信息的问题
  * 修复了多个Claude Code实例并行运行时可能导致配置文件损坏并清除认证信息的问题



  * 将远程控制功能扩展至更多用户



  * VS Code：修复了另一个导致“命令 'claude-vscode.editor.openLast' 未找到”崩溃的原因



  * 修复了 BashTool 在 Windows 上因 EINVAL 错误而失败的问题



  * 修复了提交后用户输入会短暂消失再渲染消息导致的界面闪烁问题
  * 修复了批量终止代理（Ctrl+F）现在发送单条聚合通知而非每个代理单独通知，并正确清理命令队列
  * 修复了使用远程控制时，通过并行化断开连接的网络调用，解决了优雅关闭有时遗留陈旧会话的问题
  * 修复了首次启动时`--worktree`参数有时被忽略的问题
  * 修复了Windows系统上“切换损坏值”的恐慌错误
  * 修复了在Windows上同时启动大量进程时可能发生的崩溃
  * 修复了Linux x64和Windows x64系统上WebAssembly解释器的崩溃问题
  * 修复了Windows ARM64系统上运行约2分钟后可能发生的崩溃



  * VS Code：修复了在 Windows 系统上扩展崩溃的问题（“找不到命令 'claude-vscode.editor.openLast'”）



  * 新增 `claude remote-control` 子命令用于外部构建，为所有用户启用本地环境服务。
  * 将插件市场的默认 git 超时时间从 30 秒更新为 120 秒，并添加 `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` 配置项以支持自定义设置。
  * 新增从 npm 源安装插件时对自定义 npm 注册表和特定版本固定的支持。
  * BashTool 现在在存在 shell 快照时默认跳过登录 shell（`-l` 标志），提升了命令执行性能。此前需设置 `CLAUDE_BASH_NO_LOGIN=true` 才能实现此行为。
  * 修复了在交互模式下 `statusLine` 和 `fileSuggestion` 钩子命令可能无需接受工作区信任即可执行的安全问题。
  * 超过 50K 字符的工具结果现在会持久化存储到磁盘（此前为 100K）。这减少了上下文窗口使用量并提升了对话持久性。
  * 修复了重复的 `control_response` 消息（例如来自 WebSocket 重连）可能通过向对话中推入重复的助手消息而导致 API 400 错误的问题。
  * 新增 `CLAUDE_CODE_ACCOUNT_UUID`、`CLAUDE_CODE_USER_EMAIL` 和 `CLAUDE_CODE_ORGANIZATION_UUID` 环境变量，供 SDK 调用方同步提供账户信息，消除了早期遥测事件缺失账户元数据的竞态条件。
  * 修复了当插件的 SKILL.md 描述为 YAML 数组或其他非字符串类型时斜杠命令自动补全崩溃的问题。
  * `/model` 选择器现在会显示人类可读的标签（例如 "Sonnet 4.5"），而不是固定模型版本的原始模型 ID，并在有新版本可用时显示升级提示。
  * 托管设置现在可通过 macOS plist 或 Windows 注册表进行配置。了解更多详情请访问 [https://code.claude.com/docs/en/settings#settings-files](https://code.claude.com/docs/en/settings#settings-files)



  * 为 LSP 服务器新增了 `startupTimeout` 配置支持。
  * 新增了 `WorktreeCreate` 和 `WorktreeRemove` 钩子事件，允许在代理工作树隔离创建或移除工作树时执行自定义的版本控制系统设置和清理操作。
  * 修复了一个当工作目录包含符号链接时，恢复的会话可能不可见的错误，因为会话存储路径在启动过程中被解析的时间点不同。同时修复了在 SSH 断开连接时会话数据丢失的问题，方法是将会话数据刷新操作提前到优雅关闭序列中的钩子和分析步骤之前。
  * Linux：修复了在 glibc 版本低于 2.30 的系统（例如 RHEL 8）上无法加载原生模块的问题。
  * 修复了代理团队中的内存泄漏，已完成的队友任务从未从会话状态中被垃圾回收。
  * 修复了 `CLAUDE_CODE_SIMPLE` 以完全精简技能、会话记忆、自定义代理和 CLAUDE.md 的 token 计数。
  * 修复了当指定的服务器名称不存在时，执行 `/mcp reconnect` 命令会冻结 CLI 的问题。
  * 修复了已完成的任务状态对象从未从 AppState 中移除而导致的内存泄漏。
  * 在代理定义中新增了 `isolation: worktree` 的支持，允许代理声明式地在隔离的 Git 工作树中运行。
  * `CLAUDE_CODE_SIMPLE` 模式现在也会禁用 MCP 工具、附件、钩子和 CLAUDE.md 文件加载，以实现完全精简的体验。
  * 修复了当工具搜索启用并通过启动参数传递提示词时，MCP 工具未被发现的问题。
  * 通过在压缩后清除内部缓存，改进了长时间会话期间的内存使用。
  * 新增了 `claude agents` CLI 命令，用于列出所有已配置的代理。
  * 通过在工具结果处理后清除大型工具结果，改进了长时间会话期间的内存使用。
  * 修复了 LSP 诊断数据在交付后从未被清理而导致的内存泄漏，这会在长时间会话中造成内存无限增长。
  * 修复了已完成的任务输出未从内存中释放而导致的内存泄漏，减少了长时间运行包含大量任务的会话时的内存占用。
  * 通过延迟加载 Yoga WASM 和 UI 组件导入，改进了无头模式（`-p` 标志）的启动性能。
  * 修复了导致提示词建议缓存命中率下降的缓存回归问题。
  * 通过限制文件历史快照的数量，修复了长时间会话中的内存无限增长问题。
  * 新增了 `CLAUDE_CODE_DISABLE_1M_CONTEXT` 环境变量，用于禁用 100 万 token 上下文窗口的支持。
  * Opus 4.6（快速模式）现在包含完整的 100 万 token 上下文窗口。
  * VSCode：在 VS Code 会话中新增了对 `/extra-usage` 命令的支持。
  * 修复了 TaskOutput 在清理后仍保留最近行数据导致的内存泄漏。
  * 修复了 CircularBuffer 中已清除项仍保留在后备数组中导致的内存泄漏。
  * 修复了 Shell 命令执行中，ChildProcess 和 AbortController 引用在清理后仍被保留导致的内存泄漏。



  * 改进 MCP OAuth 认证机制，支持升级认证和发现缓存功能，减少服务器连接时的冗余网络请求
  * 新增 `--worktree` (`-w`) 启动标志，支持在独立的 git 工作树中启动 Claude
  * 子代理现支持 `isolation: "worktree"` 配置，可在临时 git 工作树中执行任务
  * 新增 Ctrl+F 快捷键用于终止后台代理（需二次确认）
  * 代理定义支持 `background: true` 参数以始终作为后台任务运行
  * 插件可通过 `settings.json` 文件提供默认配置
  * 修复当模型误删仓库文件夹时，文件未找到错误将提示修正路径
  * 修复当后台代理运行且主线程空闲时 Ctrl+C 和 ESC 被静默忽略的问题，现支持在 3 秒内双击直接终止所有后台代理
  * 修复提示词建议缓存回归问题，提升缓存命中率
  * 修复当未指定 `--scope` 参数时，`plugin enable` 和 `plugin disable` 命令将自动检测正确作用域，而非默认采用用户级作用域
  * 简单模式 (`CLAUDE_CODE_SIMPLE`) 现除 Bash 工具外新增文件编辑工具，支持在该模式下直接编辑文件
  * 当安全检查触发询问响应时，权限建议现已自动填充，方便 SDK 消费者展示权限选项
  * 带 1M 上下文的 Sonnet 4.5 将从 Max 计划中移除，请切换至前沿的 Sonnet 4.6 模型（现已支持 1M 上下文），可通过 `/model` 命令切换
  * 修复通过 `/config` 切换详细模式时思考块显示未更新的问题——内存比较器现可正确检测详细模式变更
  * 通过定期重置 tree-sitter 解析器，修复长会话期间 WASM 内存无限增长问题
  * 修复因过期 yoga 布局引用可能导致的渲染异常
  * 通过跳过启动阶段非必要 API 调用，优化非交互模式 (`-p`) 性能
  * 通过缓存 HTTP 和 MCP 服务器的认证失败记录，避免重复连接需认证的服务器，提升性能
  * 修复因 Yoga WASM 线性内存无法收缩导致的长会话内存无限增长问题
  * SDK 模型信息新增 `supportsEffort`、`supportedEffortLevels` 和 `supportsAdaptiveThinking` 字段，便于消费者发现模型能力
  * 新增 `ConfigChange` 钩子事件，在会话期间配置文件变更时触发，支持企业安全审计及可选设置变更阻断
  * 通过缓存 MCP 认证失败记录避免冗余连接尝试，优化启动性能
  * 通过减少分析 token 计数的 HTTP 调用，优化启动性能
  * 通过将 MCP 工具 token 计数批量合并为单次 API 调用，优化启动性能
  * 修复 `disableAllHooks` 设置应遵循托管设置层级策略的问题——非托管设置现无法禁用策略管理的钩子（#26637）
  * 修复当会话以 `/clear` 等命令开头时，`--resume` 会话选择器显示原始 XML 标签的问题，现正确回退至会话 ID 模式
  * 优化路径安全与工作目录限制的权限提示，现将显示限制原因而非无上下文的空白提示



  * 修复了 `FileWriteTool` 的行计数问题，现在会保留意图明确的尾随空行，而不是使用 `trimEnd()` 将其去除。
  * 修复了 Windows 终端因显示代码中包含 `os.EOL` (`\r\n`) 而导致的渲染错误 —— 行数现在能正确显示，而非在 Windows 上始终显示为 1。
  * 改进了 VS Code 的计划预览：随着 Claude 的迭代自动更新；仅当计划准备好审阅时才允许评论；在拒绝时保持预览打开，以便 Claude 能够进行修改。
  * 修复了在 Windows 上，由于 `\r\n` 行尾符导致 Markdown 输出中的粗体和彩色文本可能错误地显示为其他字符的问题。
  * 修复了当对话包含大量 PDF 文档时，压缩操作失败的问题。方法是在发送到压缩 API 前，像处理图像一样剥离文档块 (anthropics/claude-code#26188)。
  * 通过在使用后释放 API 流缓冲区、代理上下文和技能状态，改进了长时间运行会话的内存使用。
  * 通过延迟执行 `SessionStart` 钩子，改进了启动性能，将交互响应时间缩短了约 500ms。
  * 修复了在使用 MSYS2 或 Cygwin shell 时，Windows 上 bash 工具输出被静默丢弃的问题。
  * 改进了 `@` 文件提及的性能 —— 通过在启动时预热索引和使用基于会话的缓存进行后台刷新，文件建议现在出现得更快。
  * 通过在任务完成后修剪代理任务消息历史，改进了内存使用。
  * 通过消除进度更新中的 O(n²) 消息累积，改进了长时间代理会话期间的内存使用。
  * 修复了 bash 权限分类器，现在会验证返回的匹配描述是否对应实际的输入规则，防止幻觉描述错误地授予权限。
  * 修复了用户定义的代理在报告 inode 为零的 NFS/FUSE 文件系统上仅加载一个文件的问题 (anthropics/claude-code#26044)。
  * 修复了当通过裸名称而非完全限定插件名引用时，插件代理技能加载失败的问题 (anthropics/claude-code#25834)。
  * 折叠工具结果中的搜索模式现在用引号显示，以提高清晰度。
  * Windows：修复了 CWD 跟踪的临时文件从未被清理，导致它们无限期累积的问题 (anthropics/claude-code#17600)。
  * 使用 `ctrl+f` 终止所有后台代理，而不是双按 ESC。现在按下 ESC 取消主线程时，后台代理会继续运行，让你对代理生命周期有更多控制。
  * 修复了在具有并发代理的会话中发生的 API 400 错误（“thinking blocks cannot be modified”），该错误由交错的流内容块阻碍正确的消息合并引起。
  * 简化了队友导航，现在仅使用 Shift+Down（带环绕），不再同时使用 Shift+Up 和 Shift+Down。
  * 修复了单个文件写入/编辑错误会中止所有其他并行文件写入/编辑操作的问题。现在，即使一个兄弟操作失败，独立的文件变更也能完成。
  * 在 `Stop` 和 `SubagentStop` 钩子输入中添加了 `last_assistant_message` 字段，提供最终的助手响应文本，以便钩子无需解析转录文件即可访问。
  * 修复了通过 `/rename` 设置的自定义会话标题在恢复对话后丢失的问题 (anthropics/claude-code#23610)。
  * 修复了折叠的读取/搜索提示文本在窄终端上溢出的问题，现在从开头进行截断。
  * 修复了包含反斜杠换行符续行（例如，用 `\` 分割的长命令）的 bash 命令会产生虚假空参数的问题，这可能会破坏命令执行。
  * 修复了当安装了大量用户技能时，内置斜杠命令 (`/help`, `/model`, `/compact` 等) 在自动完成下拉列表中被隐藏的问题 (anthropics/claude-code#22020)。
  * 修复了 MCP 服务器在延迟加载后未出现在 MCP 管理对话框中的问题。
  * 修复了在 `/clear` 命令后，会话名称仍残留在状态栏的问题 (anthropics/claude-code#26082)。
  * 修复了当 SKILL.md frontmatter 中技能的 `name` 或 `description` 是纯数字（例如 `name: 3000`）时导致崩溃的问题 —— 现在该值会被正确强制转换为字符串 (anthropics/claude-code#25837)。
  * 修复了当第一条消息超过 16KB 或使用数组格式内容时，`/resume` 静默丢弃会话的问题 (anthropics/claude-code#25721)。
  * 添加了 `chat:newline` 键绑定操作，用于可配置的多行输入 (anthropics/claude-code#26075)。
  * 在状态栏 JSON 的 `workspace` 部分添加了 `added_dirs`，将通过 `/add-dir` 添加的目录暴露给外部脚本 (anthropics/claude-code#26096)。
  * 修复了 `claude doctor` 错误地将 mise 和 asdf 管理的安装分类为本机安装的问题 (anthropics/claude-code#26033)。
  * 修复了在沙箱命令中，zsh heredoc 因“read-only file system”错误而失败的问题 (anthropics/claude-code#25990)。
  * 修复了代理进度指示器显示夸大工具使用计数的问题 (anthropics/claude-code#26023)。
  * 修复了在将图像复制为 BMP 格式的 Windows 系统的 WSL2 上，图像粘贴不起作用的问题 (anthropics/claude-code#25935)。
  * 修复了后台代理结果返回原始转录数据而非代理最终答案的问题 (anthropics/claude-code#26012)。
  * 修复了 Warp 终端在原生支持 Shift+Enter 的情况下错误提示设置该按键的问题 (anthropics/claude-code#25957)。
  * 修复了 CJK 宽字符导致 TUI 中时间戳和布局元素错位的问题 (anthropics/claude-code#26084)。
  * 修复了在生成团队队友时，`.claude/agents/*.md` 中自定义代理的 `model` 字段被忽略的问题 (anthropics/claude-code#26064)。
  * 修复了上下文压缩后计划模式丢失的问题，该问题导致模型从计划模式切换到实施模式 (anthropics/claude-code#26061)。
  * 修复了 settings.json 中设置 `alwaysThinkingEnabled: true` 无法在 Bedrock 和 Vertex 提供商上启用思考模式的问题 (anthropics/claude-code#26074)。
  * 修复了 `tool_decision` OTel 遥测事件在无头/SDK 模式下未被发出的问题 (anthropics/claude-code#26059)。
  * 修复了上下文压缩后会话名称丢失的问题 —— 重命名的会话现在能在压缩过程中保留其自定义标题 (anthropics/claude-code#26121)。
  * 将恢复选择器中的初始会话数从 10 增加到 50，以加快会话发现 (anthropics/claude-code#26123)。
  * Windows：修复了当驱动器字母大小写不同时，工作树会话匹配的问题 (anthropics/claude-code#26123)。
  * 修复了 `/resume <session-id>` 无法找到第一条消息超过 16KB 的会话的问题 (anthropics/claude-code#25920)。
  * 修复了在多行 bash 命令上选择“始终允许”会创建无效权限模式并损坏设置的问题 (anthropics/claude-code#25909)。
  * 修复了当 SKILL.md frontmatter 中技能的 `argument-hint` 使用 YAML 序列语法（例如 `[topic: foo | bar]`）时导致的 React 崩溃（错误 #31）—— 现在该值会被正确强制转换为字符串 (anthropics/claude-code#25826)。
  * 修复了在使用了网络搜索的会话上使用 `/fork` 时崩溃的问题 —— 来自转录反序列化的搜索结果中的空条目现在会被优雅处理 (anthropics/claude-code#25811)。
  * 修复了只读 git 命令在 macOS 上触发 FSEvents 文件监视器循环的问题，方法是添加 `--no-optional-locks` 标志 (anthropics/claude-code#25750)。
  * 修复了从 git 工作树运行时无法发现自定义代理和技能的问题 —— 现在包含了主仓库项目级的 `.claude/agents/` 和 `.claude/skills/` (anthropics/claude-code#25816)。
  * 修复了像 `claude doctor` 和 `claude plugin validate` 这样的非交互式子命令在嵌套的 Claude 会话中被阻塞的问题 (anthropics/claude-code#25803)。
  * Windows：修复了当路径间驱动器字母大小写不同时，同一个 CLAUDE.md 文件被加载两次的问题 (anthropics/claude-code#25756)。
  * 修复了 Markdown 中的行内代码片段被错误解析为 bash 命令的问题 (anthropics/claude-code#25792)。
  * 修复了队友加载指示器未遵循设置中自定义 `spinnerVerbs` 的问题 (anthropics/claude-code#25748)。
  * 修复了在命令删除其自身工作目录后，shell 命令永久失败的问题 (anthropics/claude-code#26136)。
  * 修复了钩子 (`PreToolUse`, `PostToolUse`) 在 Windows 上通过使用 Git Bash 而非 cmd.exe 来执行，从而避免了静默失败的问题 (anthropics/claude-code#25981)。
  * 修复了 LSP `findReferences` 和其他基于位置的操作返回来自被 gitignore 的文件（例如 `node_modules/`, `venv/`）的结果的问题 (anthropics/claude-code#26051)。
  * 将配置备份文件从主目录根目录移动到 `~/.claude/backups/`，以减少主目录的杂乱 (anthropics/claude-code#26130)。
  * 修复了首次提示词较大（>16KB）的会话从 `/resume` 列表中消失的问题 (anthropics/claude-code#26140)。
  * 修复了具有双下划线前缀的 shell 函数（例如 `__git_ps1`）无法跨 shell 会话保留的问题 (anthropics/claude-code#25824)。
  * 修复了在收到任何 token 之前，加载指示器显示 "0 tokens" 计数器的问题 (anthropics/claude-code#26105)。
  * VSCode：修复了当 AskUserQuestion 对话框打开时，对话消息显示为暗淡的问题 (anthropics/claude-code#26078)。
  * 修复了由于远程 URL 解析读取工作树特定的 gitdir 而非主仓库配置，导致后台任务在 git 工作树中失败的问题 (anthropics/claude-code#26065)。
  * 修复了在 Windows/Git Bash 终端上，右 Alt 键在输入字段中留下可见的 `[25~` 转义序列残余的问题 (anthropics/claude-code#25943)。
  * `/rename` 命令现在默认会更新终端标签页标题 (anthropics/claude-code#25789)。
  * 修复了编辑工具在编辑时，通过将 Unicode 弯引号 (\u201c\u201d \u2018\u2019) 替换为直引号，从而静默损坏这些字符的问题 (anthropics/claude-code#26141)。
  * 修复了 OSC 8 超链接仅在链接文本跨越多行终端行时，只有第一行可点击的问题。



  * 修复 macOS 终端断开连接后出现的孤立 CC 进程
  * 新增支持在 Claude Code 中使用 claude.ai 的 MCP 连接器



  * 新增对 Claude Sonnet 4.6 的支持
  * 新增从 `--add-dir` 目录读取 `enabledPlugins` 和 `extraKnownMarketplaces` 的支持
  * 新增 `spinnerTipsOverride` 设置以自定义 spinner 提示 — 可配置 `tips` 为自定义提示字符串数组，并可选设置 `excludeDefault: true` 仅显示您的自定义提示，而非内置提示
  * 在 SDK 中新增 `SDKRateLimitInfo` 和 `SDKRateLimitEvent` 类型，使消费者能够接收速率限制状态更新，包括使用率、重置时间和超额信息
  * 修复 Agent Teams 在 Bedrock、Vertex 和 Foundry 上失败的问题，方法是将 API 提供商环境变量传播到 tmux 生成的进程 (anthropics/claude-code#23561)
  * 修复在 macOS 上写入临时文件时出现沙箱 "operation not permitted" 错误的问题，通过使用正确的每用户临时目录实现 (anthropics/claude-code#21654)
  * 修复 Task 工具（后台代理）在完成时因 `ReferenceError` 崩溃的问题 (anthropics/claude-code#22087)
  * 修复在输入中粘贴图像时，自动补全建议在按 Enter 键时不被接受的问题
  * 修复由子代理调用的技能在压缩后错误地出现在主会话上下文中的问题
  * 修复每次启动时大量累积 `.claude.json.backup` 文件的问题
  * 修复插件提供的命令、代理和钩子在安装后立即不可用的问题，无需重启
  * 通过移除用于统计缓存的会话历史记录预加载，改进了启动性能
  * 改进了产生大量输出的 shell 命令的内存使用 — RSS 不再随命令输出大小无限增长
  * 改进了折叠的读取/搜索组，在活动时于摘要行下方显示当前正在处理的文件或搜索模式
  * \[VSCode] 改进了权限目标选择（项目/用户/会话），使其在会话间保持



  * 修复了深度嵌套的目录路径导致的 ENAMETOOLONG 错误
  * 修复了认证刷新错误



  * 修复了AWS认证刷新通过添加3分钟超时而无限期挂起的问题
  * 修复了`.claude/agents/`目录中非代理Markdown文件的虚假警告问题
  * 修复了在Vertex/Bedrock上无条件发送结构化输出beta标头的问题



  * 通过延迟 Zod schema 构造，改进了启动性能
  * 通过将日期移出系统提示词，提高了提示词缓存命中率
  * 面向符合条件的用户，新增了一次性 Opus 4.6 努力度提示
  * 修复了 `/resume` 会话标题显示为中断消息的问题
  * 修复了图像尺寸限制错误，现在会建议使用 `/compact`



  * 新增了在 Claude Code 会话内启动 Claude Code 的防护机制
  * 修复了 Agent Teams 为 Bedrock、Vertex 和 Foundry 客户端使用错误模型标识符的问题
  * 修复了 MCP 工具在流式处理期间返回图像内容时发生崩溃的问题
  * 修复了 `/resume` 会话预览显示原始 XML 标签而非可读命令名称的问题
  * 改进了 Bedrock/Vertex/Foundry 用户的模型错误消息，并提供回退建议
  * 修复了插件浏览页面对已安装插件显示误导性 "按空格切换" 提示的问题
  * 修复了钩子阻塞错误（退出代码 2）未向用户显示标准错误输出的问题
  * 为 OTel 事件和跟踪跨度添加了 `speed` 属性，以提升快速模式的可见性
  * 新增了 `claude auth login`、`claude auth status` 和 `claude auth logout` CLI 子命令
  * 新增了 Windows ARM64 (win32-arm64) 原生二进制文件支持
  * 改进了 `/rename`，在不带参数调用时根据对话上下文自动生成会话名称
  * 改进了狭窄终端中提示词页脚的布局
  * 修复了带有锚点片段的 @-提及（例如 `@README.md#installation`）文件解析失败的问题
  * 修复了 FileReadTool 在 FIFOs、`/dev/stdin` 和大文件上阻塞进程的问题
  * 修复了后台任务通知在流式 Agent SDK 模式下未送达的问题
  * 修复了分类规则输入时每次按键光标跳至末尾的问题
  * 修复了 Markdown 链接的显示文本因原始 URL 而丢失的问题
  * 修复了自动压缩失败的错误通知显示给用户的问题
  * 修复了权限等待时间被计入子代理耗时显示的问题
  * 修复了在规划模式下仍触发主动检查的问题
  * 修复了磁盘上设置变更时未清除过期权限规则的问题
  * 修复了钩子阻塞错误在 UI 中显示标准错误输出内容的问题



  * 改进了终端渲染性能
  * 修复了致命错误未被捕获而非显示的问题
  * 修复了会话关闭后进程挂起的问题
  * 修复了终端屏幕边界处的字符丢失问题
  * 修复了详细转录视图中的空行问题



  * 修复了在 2.1.37 版本中引入的 VS Code 终端滚动至顶部的回归问题
  * 修复了 Tab 键将斜杠命令加入队列而非自动补全的问题
  * 修复了使用环境变量包装器的命令在 bash 权限匹配时的问题
  * 修复了未使用流式传输时，工具调用之间的文本消失的问题
  * 修复了在 VS Code 扩展中恢复会话时出现重复会话的问题
  * 改进了 heredoc 分隔符解析，以防止命令注入
  * 在沙箱模式下禁止对 `.claude/skills` 目录进行写入操作



  * 修复了启用 `/extra-usage` 后 `/fast` 无法立即使用的问题



  * 快速模式现已适用于 Opus 4.6。了解更多请访问 [https://code.claude.com/docs/en/fast-mode](https://code.claude.com/docs/en/fast-mode)



  * 修复了当代理团队设置在渲染之间更改时导致崩溃的问题
  * 修复了一个bug：当启用 `autoAllowBashIfSandboxed` 时，被排除在沙箱之外的命令（通过 `sandbox.excludedCommands` 或 `dangerouslyDisableSandbox`）可以绕过 Bash 请求权限规则



  * 修复了在 tmux 中代理队友会话发送和接收消息的问题
  * 修复了关于代理团队在当前计划中不可用的警告
  * 为多代理工作流添加了 `TeammateIdle` 和 `TaskCompleted` 钩子事件
  * 添加了通过代理 "tools" 元数据中的 `Task(agent_type)` 语法限制可生成哪些子代理的支持
  * 为代理添加了 `memory` 元数据字段支持，可实现具有 `user`、`project` 或 `local` 作用域的持久化记忆
  * 将插件名称添加到技能描述和 `/skills` 菜单中，以提高可发现性
  * 修复了在模型处于扩展思考期间提交新消息会中断思考阶段的问题
  * 修复了一个在中途中止流式传输时可能发生的 API 错误，该错误中空白文本与思考块结合会绕过规范化并产生无效请求
  * 修复了 API 代理兼容性问题，其中流式端点上的 404 错误不再触发非流式回退
  * 修复了通过 `settings.json` 环境变量配置的代理设置未应用于 Node.js 构建中的 WebFetch 和其他 HTTP 请求的问题
  * 修复了 `/resume` 会话选择器显示原始 XML 标记而不是以斜杠命令启动的会话的清晰标题的问题
  * 改进了 API 连接失败的错误消息 —— 现在显示具体原因（例如 ECONNREFUSED、SSL 错误）而不是通用的“连接错误”
  * 无效托管设置的错误现在会被呈现出来
  * VSCode：添加了对远程会话的支持，允许 OAuth 用户浏览和恢复来自 claude.ai 的会话
  * VSCode：在会话选择器中添加了 git 分支和消息计数，并支持按分支名称搜索
  * VSCode：修复了初始会话加载和会话切换时滚动到底部滚动不足的问题



  * Claude Opus 4.6 现已发布！
  * 新增用于多代理协作的研究预览版代理团队功能（高 token 消耗功能，需设置 CLAUDE\_CODE\_EXPERIMENTAL\_AGENT\_TEAMS=1）
  * Claude 现在在工作时会自动记录和调用记忆
  * 在消息选择器中添加了“从此处总结”功能，允许对部分对话进行总结。
  * 现在，通过附加目录 (`--add-dir`) 定义的 `.claude/skills/` 中的技能会自动加载。
  * 修复了在子目录运行时，`@` 文件补全显示错误相对路径的问题。
  * 更新了 --resume，现在默认会重新使用之前对话中指定的 --agent 值。
  * 修复：当 heredoc 包含类似 `${index + 1}` 的 JavaScript 模板字面量时，Bash 工具不再抛出“Bad substitution”错误，此问题曾中断工具执行。
  * 技能字符预算现在根据上下文窗口大小进行缩放（占上下文的 2%），因此拥有更大上下文窗口的用户可以看到更多未被截断的技能描述。
  * 修复了输入框中泰语/老挝语间距元音（สระ า, ำ）渲染不正确的问题。
  * VSCode：修复了当输入框中存在前置文本时按下 Enter 会错误执行斜杠命令的问题。
  * VSCode：在加载历史对话列表时添加了加载指示器。



  * 在退出时添加了会话恢复提示，显示如何稍后继续对话
  * 为复选框选择添加了日语输入法全角空格的支持
  * 修复了PDF文件过大会永久锁定会话的错误，此前用户不得不开启新对话
  * 修复了启用沙箱模式时bash命令错误报告"只读文件系统"失败的问题
  * 修复了当`~/.claude.json`中的项目配置缺少默认字段时，进入计划模式后导致会话崩溃无法使用的错误
  * 修复了流式API路径中`temperatureOverride`被静默忽略的问题，此前所有流式请求都会使用默认温度(1)而忽略配置的覆盖值
  * 修复了LSP关闭/退出时与拒绝空参数的严格语言服务器的兼容性问题
  * 优化了系统提示词，更清晰地引导模型使用专用工具(Read, Edit, Glob, Grep)而非bash等效命令(`cat`, `sed`, `grep`, `find`)，减少不必要的bash命令使用
  * 改进了PDF和请求大小的错误信息，现在会显示实际限制（100页，20MB）
  * 减少了流式过程中旋转图标出现和消失时终端的布局抖动
  * 移除了模型选择器中针对第三方提供商(Bedrock, Vertex, Foundry)用户显示的误导性Anthropic API定价



  * 为读取工具新增 `pages` 参数，支持读取 PDF 特定页码范围（例如 `pages: "1-5"`）。大型 PDF（超过 10 页）在通过 `@` 提及时将返回轻量级引用，而非直接内联到上下文中。
  * 为不支持动态客户端注册的 MCP 服务器（如 Slack）添加预配置的 OAuth 客户端凭据。使用 `claude mcp add` 时可通过 `--client-id` 和 `--client-secret` 指定。
  * 新增 `/debug` 命令以帮助诊断当前会话问题
  * 在只读模式中新增对 `git log` 和 `git show` 额外标志的支持（例如 `--topo-order`、`--cherry-pick`、`--format`、`--raw`）
  * 任务工具结果中新增 token 使用量、工具调用次数及耗时指标
  * 配置中新增减少动态效果模式
  * 修复 API 对话历史中出现虚假“(无内容)”文本块的问题，减少 token 浪费和潜在模型混淆
  * 修复提示词缓存在工具描述或输入模式变更时未能正确失效（仅在工具名称变更时失效）的问题
  * 修复在对话包含思考块时执行 `/login` 后可能出现 400 错误的问题
  * 修复包含 `parentUuid` 循环的损坏转录文件导致会话恢复时挂起的问题
  * 修复当额外用量不可用时，Max 20x 用户收到错误的“/upgrade”建议的速率限制消息问题
  * 修复在主动输入时权限对话框抢夺焦点的问题
  * 修复子代理因未同步到共享应用状态而无法访问 SDK 提供的 MCP 工具的问题
  * 修复因回归导致拥有 `.bashrc` 文件的 Windows 用户无法运行 bash 命令的问题
  * 通过将会话索引替换为基于轻量级统计信息的加载和渐进式补充，改善 `--resume` 的内存使用（多会话用户减少 68%）
  * 改进 `TaskStop` 工具，在结果行中显示被停止的命令/任务描述，而非通用的“任务已停止”消息
  * 将 `/model` 改为立即执行而非排队等待
  * \[VSCode] 在问题对话框的“其他”文本输入中新增多行输入支持（使用 Shift+Enter 换行）
  * \[VSCode] 修复开始新对话时会话列表中出现重复会话的问题



  * 修复了恢复包含 `saved_hook_context` 的会话时出现的启动性能问题



  * 在调试日志中添加了工具调用失败和拒绝事件
  * 修复了网关用户的上下文管理验证错误，确保通过设置 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` 可避免该错误
  * 新增 `--from-pr` 标志，可恢复关联特定 GitHub PR 编号或 URL 的会话
  * 现在通过 `gh pr create` 创建的会话将自动关联 PR
  * 修复了 /context 命令不显示彩色输出的问题
  * 修复了当显示 PR 状态时，状态栏重复显示后台任务指示器的问题
  * Windows：修复了具有 `.bashrc` 文件的用户执行 bash 命令失败的问题
  * Windows：修复了生成子进程时控制台窗口闪烁的问题
  * VSCode：修复了扩展会话后因 OAuth 令牌过期导致的 401 错误



  * 修复了在 Bedrock 和 Vertex 上网关用户的 beta 头验证错误，确保设置 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` 可避免此错误。



  * 已添加可自定义的加载动画动词设置 (`spinnerVerbs`)
  * 已修复企业代理环境或使用客户端证书用户的 mTLS 和代理连接问题
  * 已修复多用户临时目录隔离问题，避免共享系统上的权限冲突
  * 已修复当提示词缓存作用域启用时，可能导致 400 错误的竞态条件
  * 已修复无头流式会话结束时，未取消待处理异步钩子的问题
  * 已修复接受建议时，标签页补全未更新输入字段的问题
  * 已修复 ripgrep 搜索超时后静默返回空结果而非报告错误的问题
  * 已优化屏幕数据布局，提升终端渲染性能
  * 已调整 Bash 命令显示，使其在已用时间旁同时显示超时时长
  * 已调整合并的拉取请求，在提示词栏显示紫色状态指示符
  * \[IDE] 已修复 Bedrock 用户在无头模式下模型选项显示错误区域字符串的问题



  * 修复了非交互模式(-p)下的结构化输出



  * 增加了在选项选择提示词中对日文输入法全角数字输入的支持
  * 修复了 shell 补全缓存文件在退出时被截断的问题
  * 修复了在工具执行期间被中断的会话恢复时出现 API 错误的问题
  * 修复了在具有较大输出 token 限制的模型上过早触发自动压缩的问题
  * 修复了任务 ID 在删除后可能被重用的问题
  * 修复了在 Windows 上 VS Code 扩展中文件搜索不工作的问题
  * 改进了读取/搜索进度指示器，进行中显示 "Reading…"，完成后显示 "Read"
  * 改进了 Claude 使其更倾向于使用文件操作工具（Read, Edit, Write）而非 bash 等价命令（cat, sed, awk）
  * \[VSCode] 增加了 Python 虚拟环境的自动激活功能，确保 `python` 和 `pip` 命令使用正确的解释器（可通过 `claudeCode.usePythonEnvironment` 设置配置）
  * \[VSCode] 修复了消息操作按钮背景颜色不正确的问题



  * 当光标无法继续移动时，在 vim 普通模式下添加了方向键历史导航功能
  * 在帮助菜单中添加了外部编辑器快捷键（Ctrl+G）以提高可发现性
  * 在提示词页脚添加了 PR 审查状态指示器，通过带可点击链接的彩色圆点显示当前分支的 PR 状态（已批准、已请求更改、待审核或草稿）
  * 支持从通过 `--add-dir` 标志指定的附加目录加载 `CLAUDE.md` 文件（需设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`）
  * 添加了通过 `TaskUpdate` 工具删除任务的功能
  * 修复了会话压缩问题，该问题可能导致恢复时加载完整历史记录而非压缩摘要
  * 修复了代理有时会忽略在积极处理任务期间发送的用户消息
  * 修复了宽字符（emoji、CJK）渲染瑕疵，即当被较窄字符替换时尾列未清除的问题
  * 修复了当 MCP 工具响应包含特殊 Unicode 字符时出现的 JSON 解析错误
  * 修复了多行和自动换行文本输入中上下方向键优先处理光标移动而非历史导航的问题
  * 修复了按上方向键浏览命令历史时草稿提示词丢失的问题
  * 修复了在输入中途输入斜杠命令时出现的 ghost 文本闪烁问题
  * 修复了市场来源移除时未正确删除设置的问题
  * 修复了某些命令（如 `/context`）中出现的重复输出问题
  * 修复了任务列表有时显示在主对话视图之外的问题
  * 修复了在多行结构（如 Python 文档字符串）内进行差异比对时的语法高亮问题
  * 修复了取消工具使用时的崩溃问题
  * 改进了 `/sandbox` 命令界面，在缺少依赖项时显示依赖状态及安装说明
  * 改进了思考状态文本，添加了微妙的闪烁动画
  * 改进了任务列表，使其根据终端高度动态调整可见项目数量
  * 改进了分叉对话提示，显示如何恢复原始会话
  * 变更了折叠的读取/搜索组，在进行中显示现在时（“正在读取”、“正在搜索”），完成后显示过去时（“已读取”、“已搜索”）
  * 变更了 `ToolSearch` 结果的显示方式，改为简短通知而非内联显示在对话中
  * 变更了 `/commit-push-pr` 技能，当通过 MCP 工具配置时，自动将 PR 链接发布到 Slack 频道
  * 变更了 `/copy` 命令，现在对所有用户可用
  * 变更了后台代理，在启动前提示用户授予权限
  * 变更了 `Bash(*)` 等权限规则，使其被接受并视为等同于 `Bash`
  * 变更了配置备份方式，采用带时间戳的轮转机制（保留最近 5 个）以防止数据丢失



  * 新增环境变量 `CLAUDE_CODE_ENABLE_TASKS`，设为 `false` 可临时保留旧系统
  * 新增简写 `$0`、`$1` 等，用于在自定义命令中访问各个参数
  * 修复了在不支持 AVX 指令集的处理器上发生崩溃的问题
  * 修复了终端关闭时 Claude Code 进程挂起的问题，通过捕获 `process.exit()` 抛出的 EIO 错误，并使用 SIGKILL 作为后备方案
  * 修复了从不同目录（例如 git 工作树）恢复会话时，`/rename` 和 `/tag` 未更新正确会话的问题
  * 修复了从不同目录运行时，按自定义标题恢复会话失败的问题
  * 修复了使用提示词暂存 (Ctrl+S) 并恢复时，粘贴的文本内容丢失的问题
  * 修复了对于未显式设置模型的代理，代理列表显示“Sonnet (默认)”而非“继承 (默认)”的问题
  * 修复了后台运行的钩子命令未及时返回，可能导致会话等待一个本应后台运行的进程的问题
  * 修复了文件写入预览中省略空行的问题
  * 更改了对于没有附加权限或钩子的技能，现在无需批准即可使用
  * 更改了带索引的参数语法，从 `$ARGUMENTS.0` 改为 `$ARGUMENTS[0]`（方括号语法）
  * \[SDK] 当启用 `replayUserMessages` 时，将 `queued_command` 附件消息作为 `SDKUserMessageReplay` 事件进行重放
  * \[VSCode] 为所有用户启用了会话分叉和回退功能



  * 新增可自定义键盘快捷键。可按上下文配置按键绑定、创建组合序列并个性化您的工作流。运行 `/keybindings` 开始体验。了解详情请访问 [https://code.claude.com/docs/en/keybindings](https://code.claude.com/docs/en/keybindings)



  * 修复了在不支持 AVX 指令集的处理器上发生的崩溃



  * 新增任务管理系统，包括依赖跟踪等新功能
  * [VSCode] 新增原生插件管理支持
  * [VSCode] OAuth 用户现在可以从会话对话框浏览并恢复远程 Claude 会话
  * 修复了在子代理使用频繁时恢复会话导致的内存溢出崩溃问题
  * 修复了运行 `/compact` 后“剩余上下文”警告未隐藏的问题
  * 修复了恢复屏幕上的会话标题未遵循用户语言设置的问题
  * [IDE] 修复了 Windows 系统上 Claude Code 侧边栏视图容器启动时不显示的竞争条件



  * 为 npm 安装添加了弃用通知 - 运行 `claude install` 或参阅 [https://docs.anthropic.com/en/docs/claude-code/getting-started](https://docs.anthropic.com/en/docs/claude-code/getting-started) 了解其他选项
  * 通过 React Compiler 提升了界面渲染性能
  * 修复了运行 `/compact` 后 "Context left until auto-compact" 警告未消失的问题
  * 修复了 MCP stdio 服务器超时未终止子进程可能导致界面冻结的问题



  * 在 bash 模式中添加了基于历史的自动补全（`!`） - 输入部分命令并按 Tab 键即可从 bash 命令历史中补全
  * 在已安装插件列表中添加了搜索功能 - 输入即可按名称或描述进行筛选
  * 新增了将插件固定到特定 git 提交 SHA 的支持，允许市场条目安装精确版本
  * 修复了一个回归问题，该问题导致上下文窗口阻塞限制计算过于激进，使用户在上下文使用率约为 65% 时被阻塞，而非预期的约 98%
  * 修复了在并行运行子代理时可能导致崩溃的内存问题
  * 修复了长时间运行的会话中的内存泄漏问题，即 shell 命令完成后流资源未得到清理
  * 修复了 `@` 符号在 bash 模式中错误触发文件自动补全建议的问题
  * 修复了 `@` 提及菜单中文件夹点击行为，使其改为导航进入目录而非选中目录
  * 修复了 `/feedback` 命令在描述过长时生成无效 GitHub issue URL 的问题
  * 修复了 `/context` 命令在详细模式下显示与状态栏相同的 token 计数和百分比
  * 修复了 `/config`、`/context`、`/model` 和 `/todos` 命令覆盖层可能意外关闭的问题
  * 修复了在输入相似命令（如 `/context` 与 `/compact`）时斜杠命令自动补全选择错误命令的问题
  * 修复了当仅配置一个市场时，插件市场中返回导航不一致的问题
  * 修复了 iTerm2 在退出时未正确清除进度条的问题，避免了残留指示符和提示音
  * 改进了退格键功能，现在会将粘贴的文本作为一个整体删除，而不是逐个字符删除
  * [VSCode] 添加了 `/usage` 命令以显示当前计划使用情况



  * 修复消息渲染错误



  * 修复了 HTTP/SSE 传输方式下过度请求 MCP 连接的问题



  * 已添加可通过 `--init`、`--init-only` 或 `--maintenance` CLI 标志触发的全新 `Setup` 钩子事件，用于仓库初始化和维护操作
  * 已添加键盘快捷键 'c'，用于在登录时浏览器未自动打开的情况下复制 OAuth URL
  * 已修复运行包含使用 JavaScript 模板字面量（如 `${index + 1}`）的 heredocs 的 bash 命令时发生的崩溃
  * 已改进启动过程，以捕获在 REPL 完全准备就绪前输入的按键
  * 已改进文件建议，使其在接受时显示为可移除的附件而非插入文本
  * \[VSCode] 已在插件列表中添加安装次数显示
  * \[VSCode] 已添加安装插件时的信任警告



  * 新增 `auto:N` 语法用于配置 MCP 工具搜索自动启用阈值，其中 N 表示上下文窗口百分比（0-100）
  * 新增 `plansDirectory` 设置项，用于自定义计划文件的存储位置
  * 在 AskUserQuestion 的“其他”输入字段中新增外部编辑器支持（Ctrl+G）
  * 新增会话 URL 归因功能，将 Web 会话中创建的提交和 PR 与会话关联
  * 新增对 `PreToolUse` 钩子返回 `additionalContext` 给模型的支持
  * 新增 `${CLAUDE_SESSION_ID}` 字符串替换功能，供技能访问当前会话 ID
  * 修复了在并行工具调用的长时间会话中，因孤立的 tool_result 块导致 API 错误的问题
  * 修复了当缓存的连接 Promise 永未解析时，MCP 服务器重连挂起的问题
  * 修复了在使用 Kitty 键盘协议的终端（Ghostty、iTerm2、kitty、WezTerm）中 Ctrl+Z 挂起功能失效的问题



  * 新增 `showTurnDuration` 设置以隐藏回合时长信息（例如 "Cooked for 1m 6s"）
  * 新增接受权限提示时提供反馈的功能
  * 新增在任务通知中内联显示代理最终响应的功能，无需阅读完整转录文件即可更轻松查看结果
  * 修复了通配符权限规则可能匹配包含 shell 运算符的复合命令的安全漏洞
  * 修复了在 Windows 上，当云同步工具、防病毒扫描器或 Git 仅触及文件时间戳而未更改内容时，错误报告“文件已修改”的问题
  * 修复了在流式执行过程中同级工具失败时出现孤立 tool\_result 错误的问题
  * 修复了上下文窗口阻塞限制使用完整上下文窗口（而非为最大输出 token 保留空间的有效上下文窗口）进行计算的问题
  * 修复了运行本地斜杠命令（如 `/model` 或 `/theme`）时进度条短暂闪烁的问题
  * 通过使用固定宽度的盲文字符修复了终端标题动画抖动问题
  * 修复了包含 git 子模块的插件在安装时未完全初始化的问题
  * 修复了在 Windows 上，当临时目录路径包含如 `t` 或 `n` 被误解析为转义序列的字符时，bash 命令执行失败的问题
  * 通过减少终端渲染中的内存分配开销，提升了输入响应速度
  * 默认为所有用户启用 MCP 工具搜索的自动模式。当 MCP 工具描述超过上下文窗口的 10% 时，它们将被自动延迟并通过 MCPSearch 工具进行发现，而非预先加载。这减少了配置了多个 MCP 工具的用户的上下文使用量。用户可以通过在设置中将 `MCPSearch` 添加到 `disallowedTools` 来禁用此功能。
  * 将 OAuth 和 API 控制台 URL 从 console.anthropic.com 更改为 platform.claude.com
  * \[VSCode] 修复了 `claudeProcessWrapper` 设置传递的是包装器路径而非 Claude 二进制文件路径的问题



  * 为 `/config` 命令添加了搜索功能，以便快速筛选设置项
  * 在 `/doctor` 中添加了“更新”部分，显示自动更新频道及可用的 npm 版本（稳定版/最新版）
  * 为 `/stats` 命令添加了日期范围筛选 - 按 `r` 可在“最近 7 天”、“最近 30 天”和“全部时间”之间循环切换
  * 在子目录中处理文件时，新增自动发现嵌套 `.claude/skills` 目录中的技能
  * 在状态行输入中添加了 `context_window.used_percentage` 和 `context_window.remaining_percentage` 字段，以便更轻松地显示上下文窗口使用情况
  * 当编辑器在 Ctrl+G 操作期间失败时，增加了错误显示
  * 修复了通过 shell 行续行绕过权限的问题，该问题可能允许执行被阻止的命令
  * 修复了当文件监视器触及文件但未更改内容时，错误地报告“文件已被意外修改”的问题
  * 修复了多行响应中文字样式（加粗、颜色）逐渐错位的问题
  * 修复了在描述字段中输入 'n' 时反馈面板意外关闭的问题
  * 修复了每周重置后在使用率较低时仍出现速率限制警告的问题（现在需要达到 70% 的使用率）
  * 修复了恢复上一个会话时，速率限制选项菜单错误地自动打开的问题
  * 修复了在 Kitty 键盘协议终端中，数字键盘按键输出转义序列而非字符的问题
  * 修复了在 Kitty 键盘协议终端中 Option+Return 不插入换行的问题
  * 修复了损坏的配置备份文件在主目录中不断累积的问题（现在每个配置文件只创建一个备份）
  * 修复了 `mcp list` 和 `mcp get` 命令遗留孤立的 MCP 服务器进程的问题
  * 修复了 ink2 模式下当节点通过 `display:none` 隐藏时出现的视觉伪影问题
  * 改进了外部 CLAUDE.md 文件导入批准对话框，以显示正在导入哪些文件及来源位置
  * 改进了 `/tasks` 对话框，当只有一个后台任务运行时，可直接跳转到任务详情
  * 改进了 @ 自动补全功能，为不同建议类型添加了图标，并采用单行格式化
  * 更新了“帮助改进 Claude”设置的获取逻辑，在因 OAuth 令牌过期而失败时，会刷新 OAuth 并重试
  * 更改了任务通知显示方式，当多个后台任务同时完成时，最多显示 3 行，超出部分以摘要形式呈现
  * 启动时将终端标题更改为 "Claude Code"，以便更好地识别窗口
  * 移除了通过 @提及 MCP 服务器来启用/禁用的功能 - 请改用 `/mcp enable <name>`
  * \[VSCode] 修复了手动压缩后使用率指示器未更新的问题



  新增 `CLAUDE_CODE_TMPDIR` 环境变量，用于覆盖内部临时文件使用的临时目录，适用于具有自定义临时目录要求的环境。



  * 新增 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 环境变量，可禁用所有后台任务功能，包括自动后台运行和 Ctrl+B 快捷键
  * 修复"帮助改进 Claude"设置的获取逻辑，在 OAuth 令牌因过时而失败时，会刷新 OAuth 并重试



  * 合并了斜杠命令与技能，简化心智模型，行为保持不变
  * 在 `/config` 中新增发布渠道（`stable` 或 `latest`）切换选项
  * 新增不可达权限规则的检测与警告，在 `/doctor` 和保存规则后显示警告，其中包含每条规则的来源及可操作的修复指导
  * 修复了计划文件在执行 `/clear` 命令后仍持续存在的问题，现在确保清除对话后使用全新的计划文件
  * 通过使用 64 位精度处理 inode 值，修复了在具有大 inode 的文件系统（如 ExFAT）上错误的技能重复检测问题
  * 修复了状态栏中后台任务数量与任务对话框中显示项不匹配的问题
  * 修复了子代理在对话压缩期间使用错误模型的问题
  * 修复了子代理在网页搜索时使用不正确模型的问题
  * 修复了从主目录运行时信任对话框接受后，在会话期间未启用钩子等需要信任的功能的问题
  * 通过防止不受控的写入损坏光标状态，提升了终端渲染稳定性
  * 通过将过长的描述截断为 2 行，提高了斜杠命令建议的可读性
  * 将工具钩子执行超时从 60 秒更改为 10 分钟
  * [VSCode] 为权限请求新增可点击的目标选择器，允许您选择设置保存位置（此项目、所有项目、与团队共享或仅本次会话）



  * 已为拖拽到终端中的图片添加源路径元数据，帮助 Claude 了解图片的来源
  * 已在支持 OSC 8 的终端（如 iTerm）中为工具输出的文件路径添加可点击的超链接
  * 已支持 Windows 包管理器 (winget) 安装，并提供自动检测和更新说明
  * 已在计划模式下添加 Shift+Tab 键盘快捷键，可快速选择"自动接受编辑"选项
  * 已添加 `FORCE_AUTOUPDATE_PLUGINS` 环境变量，即使主自动更新器禁用时也允许插件自动更新
  * 已在会话开始钩子输入中添加 `agent_type`，当指定 `--agent` 时会填充此字段
  * 修复了 bash 命令处理中的命令注入漏洞，该漏洞允许格式错误的输入执行任意命令
  * 修复了内存泄漏问题，即 tree-sitter 解析树未被释放，导致 WASM 内存在长时间会话中无限增长
  * 修复了在 CLAUDE.md 文件中使用 `@include` 指令时二进制文件（图像、PDF 等）被意外包含到内存中的问题
  * 修复了更新时错误提示"另一项安装正在进行中"的问题
  * 修复了当监控目录中存在套接字文件时发生的崩溃问题（针对 EOPNOTSUPP 错误的纵深防御）
  * 修复了使用 `/tasks` 命令时远程会话 URL 和传送功能失效的问题
  * 通过清理用户特定的服务器配置，修复了 MCP 工具名称在分析事件中暴露的问题
  * 改进了 macOS 上的 Option-as-Meta 提示，为 iTerm2、Kitty 和 WezTerm 等原生 CSIu 终端显示特定于终端的说明
  * 改进了通过 SSH 粘贴图片时的错误信息，建议使用 `scp` 代替无用的剪贴板快捷键提示
  * 改进了权限说明器，不再将常规开发工作流（git fetch/rebase、npm install、测试、PR）标记为中等风险
  * 已更改大型 bash 命令输出，现在保存到磁盘而非截断，允许 Claude 读取完整内容
  * 已更改大型工具输出，现在持久化到磁盘而非截断，通过文件引用提供完整的输出访问权限
  * 已更改 `/plugins` 已安装选项卡，统一显示插件和 MCP，并按作用域分组
  * 已弃用 Windows 托管设置路径 `C:\ProgramData\ClaudeCode\managed-settings.json` - 管理员应迁移到 `C:\Program Files\ClaudeCode\managed-settings.json`
  * \[SDK] 已将最低 zod 同级依赖项更改为 ^4.0.0
  * \[VSCode] 修复了手动压缩后使用量显示未更新的问题



  *   添加了技能热重载功能 - 在 `~/.claude/skills` 或 `.claude/skills` 中创建或修改的技能现在无需重启会话即可立即生效
  *   添加了在分叉的子代理上下文中运行技能和斜杠命令的支持，需在技能前置元数据中使用 `context: fork`
  *   添加了技能中 `agent` 字段的支持，用于指定执行的代理类型
  *   添加了 `language` 设置，用于配置 Claude 的响应语言（例如，language: "japanese"）
  *   变更了 Shift+Enter 在 iTerm2、WezTerm、Ghostty 和 Kitty 中默认可用，无需修改终端配置
  *   在 `settings.json` 中添加了 `respectGitignore` 支持，用于按项目控制 @-mention 文件选择器的行为
  *   添加了 `IS_DEMO` 环境变量，用于在 UI 中隐藏邮箱和组织信息，适用于流式传输或录制会话
  *   修复了敏感数据（OAuth 令牌、API 密钥、密码）可能暴露在调试日志中的安全问题
  *   修复了使用 `-c` 或 `--resume` 恢复会话时文件和技能未被正确发现的问题
  *   修复了使用上箭头或 Ctrl+R 搜索重放历史提示词时，粘贴内容丢失的问题
  *   修复了使用 Esc 键时，队列中的提示词仅被移至输入框而不会取消正在运行的任务的问题
  *   减少了复杂 bash 命令的权限提示
  *   修复了命令搜索，使其优先对命令名称进行精确和前缀匹配，而非对描述进行模糊匹配
  *   修复了 PreToolUse 钩子，在返回 `ask` 权限决策时允许 `updatedInput`，使钩子能够充当中间件同时仍请求用户同意
  *   修复了基于文件的市场来源的插件路径解析问题
  *   修复了未配置 LSP 服务器时 LSP 工具被错误启用的问题
  *   修复了名称中包含点号的仓库在后台任务中因 "git repository not found" 错误而失败的问题
  *   修复了 WSL 环境下 Chrome 中的 Claude 支持问题
  *   修复了 Windows 原生安装程序在可执行文件创建失败时静默失败的问题
  *   改进了 CLI 帮助输出，按字母顺序显示选项和子命令以便于导航
  *   为 Bash 工具权限添加了通配符模式匹配支持，可在规则中任意位置使用 `*`（例如，`Bash(npm *)`、`Bash(* install)`、`Bash(git * main)`）
  *   添加了统一的 Ctrl+B 后台化功能，同时适用于 bash 命令和代理 - 现在按 Ctrl+B 会同时将所有正在运行的前台任务后台化
  *   添加了对 MCP `list_changed` 通知的支持，允许 MCP 服务器动态更新其可用工具、提示词和资源，而无需重新连接
  *   为 claude.ai 订阅用户添加了 `/teleport` 和 `/remote-env` 斜杠命令，允许他们恢复和配置远程会话
  *   添加了在 settings.json 权限中使用 `Task(AgentName)` 语法或通过 `--disallowedTools` CLI 标志禁用特定代理的支持
  *   在代理前置元数据中添加了钩子支持，允许代理定义在其生命周期范围内生效的 PreToolUse、PostToolUse 和 Stop 钩子
  *   为技能和斜杠命令前置元数据添加了钩子支持
  *   添加了新的 Vim 动作：`;` 和 `,` 用于重复 f/F/t/T 动作，`y` 操作符用于复制（yank）并支持 `yy`/`Y`，`p`/`P` 用于粘贴，文本对象（`iw`、`aw`、`iW`、`aW`、`i"`、`a"`、`i'`、`a'`、`i(`、`a(`、`i[`、`a[`、`i{`、`a{`），`>>` 和 `<<` 用于增加/减少缩进，以及 `J` 用于合并行
  *   添加了 `/plan` 命令快捷方式，可直接从提示词处进入计划模式
  *   添加了当 `/` 出现在输入任意位置（不仅限于开头）时的斜杠命令自动补全支持
  *   在交互模式中添加了 `--tools` 标志支持，用于限制 Claude 在交互会话期间可使用的内置工具
  *   添加了 `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` 环境变量，用于覆盖默认的文件读取 token 限制
  *   为钩子添加了 `once: true` 配置支持
  *   在前置元数据的 `allowed-tools` 字段中添加了 YAML 风格列表支持，使技能声明更简洁
  *   添加了对来自插件的提示词和代理钩子类型的支持（此前仅支持命令钩子）
  *   在 iTerm2 中添加了 Cmd+V 粘贴图片的支持（映射到 Ctrl+V）
  *   添加了使用左/右箭头键在对话框中的选项卡间循环导航的功能
  *   在 Ctrl+O 转录模式中添加了实时思考块显示
  *   在后台 bash 任务详情对话框中添加了完整输出的文件路径
  *   将技能（Skills）作为上下文可视化中的一个独立类别
  *   修复了当服务器报告令牌已过期但本地过期检查结果不一致时，OAuth 令牌刷新未触发的问题
  *   修复了会话在服务器瞬时错误后持久化卡住的问题，通过在条目实际已存储时从 409 冲突中恢复
  *   修复了由并发工具执行期间孤立的工具结果导致的会话恢复失败问题
  *   修复了一个竞态条件：在并发令牌刷新尝试期间，可能从钥匙串缓存读取到过期的 OAuth 令牌
  *   修复了 AWS Bedrock 子代理未继承欧盟/亚太跨区域推理模型配置的问题，导致当 IAM 权限限定在特定区域时出现 403 错误
  *   修复了当后台任务产生大量输出时，API 上下文溢出的问题，通过截断至 30K 字符并添加文件路径引用
  *   修复了读取 FIFO 文件时挂起的问题，通过跳过特殊文件类型的符号链接解析
  *   修复了在 Ghostty、iTerm2、Kitty 和 WezTerm 中退出时终端键盘模式未重置的问题
  *   修复了 iTerm2、Ghostty、Kitty 和 WezTerm 中 Alt+B 和 Alt+F（单词导航）不起作用的问题
  *   修复了插件 `allowed-tools` 前置元数据中 `${CLAUDE_PLUGIN_ROOT}` 未被替换的问题，该问题导致工具错误地需要批准
  *   修复了 Write 工具创建的文件使用硬编码的 0o600 权限，而非遵循系统 umask 的问题
  *   修复了包含 `$()` 命令替换的命令因解析错误而失败的问题
  *   修复了包含反斜杠续行的多行 bash 命令被错误分割并标记为需要权限的问题
  *   修复了 bash 命令前缀提取，以正确识别全局选项后的子命令（例如，`git -C /path log` 现在能正确匹配 `Bash(git log:*)` 规则）
  *   修复了作为 CLI 参数传递的斜杠命令（例如，`claude /context`）未正确执行的问题
  *   修复了在 Tab 补全斜杠命令后按 Enter 会选择不同命令，而非提交已补全命令的问题
  *   修复了当输入带参数的命令时，斜杠命令参数提示闪烁且显示不一致的问题
  *   修复了 Claude 在直接运行斜杠命令时有时会冗余调用 Skill 工具的问题
  *   修复了 `/context` 中的技能 token 估算，以准确反映仅加载前置元数据的情况
  *   修复了子代理有时未默认继承父代理模型的问题
  *   修复了模型选择器对使用 `--model haiku` 的 Bedrock/Vertex 用户显示不正确选择的问题
  *   修复了在权限请求选项标签中出现重复 Bash 命令的问题
  *   修复了后台任务完成时的噪音输出 - 现在显示简洁的完成信息而非原始输出
  *   修复了后台任务完成通知，使其能主动显示并带有项目符号
  *   修复了被取消的分叉斜杠命令显示 "AbortError" 而非 "Interrupted" 信息的问题
  *   修复了关闭权限对话框后光标消失的问题
  *   修复了 `/hooks` 菜单在滚动到不同选项时选择了错误钩子类型的问题
  *   修复了当按 Esc 取消时，队列中的提示词显示为 "\[object Object]" 的问题
  *   修复了当后台化任务时排队消息中图片被静默丢弃的问题
  *   修复了大型粘贴图片因 "Image was too large" 错误而失败的问题
  *   修复了包含 CJK 字符（日文、中文、韩文）的多行提示词中出现额外空行的问题
  *   修复了当用户提示词文本换行时，ultrathink 关键字高亮错误地应用于其他字符的问题
  *   修复了折叠的 "Reading X files…" 指示器在思考块出现在流中间时错误地切换为过去时态的问题
  *   修复了 Bash 读取命令（如 `ls` 和 `cat`）未被计入折叠的读取/搜索组中，导致组错误地显示 "Read 0 files" 的问题
  *   修复了旋转 token 计数器，在执行期间未能正确累计子代理的 token
  *   修复了 git diff 解析中的内存泄漏问题，其中切片字符串保留了大型父字符串
  *   修复了一个竞态条件：LSP 工具在启动期间可能返回 "no server available"
  *   修复了网络请求超时时反馈提交无限期挂起的问题
  *   修复了在插件发现和日志选择器视图中按上箭头键会退出搜索模式的问题
  *   修复了钩子无输出时，成功信息显示尾随冒号的问题
  *   多项优化以提高启动性能
  *   改进了使用原生安装程序或 Bun 时的终端渲染性能，特别是对于包含表情符号、ANSI 码和 Unicode 字符的文本
  *   改进了读取包含大量单元格的 Jupyter notebook 时的性能
  *   改进了管道输入（如 `cat refactor.md | claude`）的可靠性
  *   改进了 AskQuestion 工具的可靠性
  *   改进了 sed 就地编辑命令，使其能作为文件编辑显示并带有差异预览
  *   改进了 Claude 在响应因输出 token 限制而被截断时，能自动继续而非显示错误信息
  *   改进了压缩的可靠性
  *   改进了子代理（Task 工具），在权限被拒绝后能继续工作，允许它们尝试替代方法
  *   改进了技能，在执行时显示进度，并在工具使用发生时即时展示
  *   改进了来自 `/skills/` 目录的技能，使其默认在斜杠命令菜单中可见（可通过前置元数据中的 `user-invocable: false` 选择退出）
  *   改进了技能建议，优先推荐最近和频繁使用的技能
  *   改进了等待第一个响应 token 时的旋转反馈
  *   改进了旋转器中的 token 计数显示，现在包含来自后台代理的 token
  *   改进了异步代理的增量输出，给予主线程更多控制权和可见性
  *   改进了权限提示 UX，Tab 提示移至页脚，更清晰的 Yes/No 输入标签并带有上下文占位符
  *   改进了 Chrome 中的 Claude 通知，缩短了帮助文本，并持续显示直到被关闭
  *   改进了 macOS 截图粘贴的可靠性，支持 TIFF 格式
  *   改进了 `/stats` 输出
  *   更新了 Atlassian MCP 集成，使用更可靠的默认配置（可流式传输的 HTTP）
  *   将 "Interrupted" 信息的颜色从红色更改为灰色，以降低警告感
  *   移除了进入计划模式时的权限提示 - 用户现在无需批准即可进入计划模式
  *   移除了图片参考链接的下划线样式
  *   \[SDK] 将最低的 zod 对等依赖项更改为 ^4.0.0
  *   \[VSCode] 在上下文菜单中添加了当前所选模型名称
  *   \[VSCode] 在自动接受权限按钮上添加了描述性标签（例如，使用 "Yes, allow npm for this project" 代替 "Yes, and don't ask again"）
  *   \[VSCode] 修复了 Markdown 内容中段落分隔未渲染的问题
  *   \[VSCode] 修复了在扩展中滚动时会意外滚动父级 iframe 的问题
  *   \[Windows] 修复了渲染不当的问题



  * 修复了在Chrome集成中使用Claude时出现的macOS代码签名警告问题



  * 小型错误修复



  * 添加了 LSP（语言服务器协议）工具以支持代码智能功能，如转到定义、查找引用和悬停文档
  * 为 Kitty、Alacritty、Zed 和 Warp 终端添加了 `/terminal-setup` 支持
  * 在 `/theme` 中添加了 Ctrl+T 快捷键以切换语法高亮的开/关
  * 为主题选择器添加了语法高亮信息
  * 当 Alt 快捷键因终端配置失效时，为 macOS 用户添加了指导
  * 修复了技能 `allowed-tools` 未应用于该技能调用的工具的问题
  * 修复了当用户已使用 Opus 时，Opus 4.5 提示信息错误显示的问题
  * 修复了语法高亮未正确初始化时可能出现的崩溃问题
  * 修复了 `/plugins discover` 中的一个视觉错误：当搜索框聚焦时，列表选择指示器仍会显示
  * 修复了 macOS 键盘快捷键显示为“opt”而非“alt”的问题
  * 改进了 `/context` 命令的可视化：按来源、斜杠命令分组显示技能和代理，并对 token 计数进行排序
  * \[Windows] 修复了渲染不正确的问题
  * \[VSCode] 为年终促销信息添加了礼品标签象形图



  * 新增可点击的 `[Image #N]` 链接，可在默认查看器中打开附件图片
  * 新增 alt-y yank-pop 功能，可在 ctrl-y 粘贴后循环切换剪贴环历史记录
  * 新增插件发现界面的搜索过滤功能（支持按名称、描述或市场分类进行输入过滤）
  * 支持在分叉会话时使用自定义会话 ID，通过 `--session-id` 结合 `--resume` 或 `--continue` 以及 `--fork-session` 实现
  * 修复了输入历史记录循环缓慢的问题，以及可能在消息提交后覆盖文本的竞争条件
  * 改进 `/theme` 命令，可直接打开主题选择器
  * 改进主题选择器用户界面
  * 通过统一的 SearchBox 组件，改进了恢复会话、权限和插件界面的搜索体验
  * \[VSCode] 新增标签页图标徽章，显示待处理权限（蓝色）和未读完成项（橙色）



  * 新增 Chrome 中的 Claude（测试版）功能，配合 Chrome 扩展程序使用（[https://claude.ai/chrome](https://claude.ai/chrome)），可让您直接从 Claude Code 控制浏览器
  * 减少终端闪烁
  * 新增可扫描二维码到移动应用提示，方便快速下载应用
  * 新增恢复会话时的加载指示器，提供更佳反馈
  * 修复了 `/context` 命令在非交互模式下不遵守自定义系统提示词的问题
  * 修复了粘贴时连续 Ctrl+K 行的顺序问题
  * 改进了 @提及文件建议的速度（在 Git 仓库中速度提升约 3 倍）
  * 改进了包含 `.ignore` 或 `.rgignore` 文件的仓库中的文件建议性能
  * 改进设置验证错误的突出显示
  * 将思维切换快捷键从 Tab 更改为 Alt+T，以避免误触发



  * 新增了 /config 开关来启用/禁用提示词建议
  * 新增了 `/settings` 作为 `/config` 命令的别名
  * 修复了光标位于路径中间时，@ 文件引用建议错误触发的问题
  * 修复了使用 `--dangerously-skip-permissions` 时，`.mcp.json` 中的 MCP 服务器无法加载的问题
  * 修复了权限规则错误拒绝包含 shell 通配符模式（例如，`ls *.txt`、`for f in *.png`）的有效 bash 命令的问题
  * Bedrock：现在已支持在 token 计数和推理配置文件列表中识别环境变量 `ANTHROPIC_BEDROCK_BASE_URL`
  * 为原生构建新增了语法高亮引擎



  * 新增回车键可立即接受并提交提示词建议（Tab 键仍可用于接受后编辑）
  * 新增通配符语法 `mcp__server__*` 用于 MCP 工具权限，可允许或拒绝某个服务器的所有工具
  * 为插件市场新增自动更新开关，支持按市场单独控制自动更新
  * 在状态行输入中新增 `current_usage` 字段，可精确计算上下文窗口使用百分比
  * 修复用户输入时处理队列命令导致输入框被清空的问题
  * 修复按 Tab 键时提示词建议替换已输入内容的问题
  * 修复终端窗口大小变化时差异视图未更新的问题
  * 大型对话场景内存占用优化 3 倍
  * 通过 Ctrl+S 复制到剪贴板的统计截图分辨率提升，图像更清晰
  * 移除 `#` 快速记忆录入快捷方式（改为让 Claude 编辑您的 CLAUDE.md 文件）
  * 修复 /config 中思考模式切换状态未能正确保存的问题
  * 改进文件创建权限对话框的界面设计



  * 小型错误修复



  * 修正了中、日、韩等语言的输入法支持，通过在光标位置正确放置组合窗口
  * 修复了模型可见已禁用 MCP 工具的错误
  * 修复了子代理工作时引导消息可能丢失的问题
  * 修正了 Option+Arrow 单词导航将整个 CJK（中日韩）文本序列视为单个单词而非按词边界导航的问题
  * 改进了计划模式退出体验：当使用空白或缺失的计划退出时，显示简化的“是/否”对话框，而不是抛出错误
  * 新增企业托管设置支持。请联系您的 Anthropic 账户团队启用此功能。



  * 思考模式现已默认为 Opus 4.5 启用
  * 思考模式配置已移至 `/config`
  * 为 `/permissions` 命令添加了搜索功能，可通过 `/` 键盘快捷键按工具名筛选规则
  * 在 `/doctor` 中显示自动更新程序被禁用的原因
  * 修复了当另一个实例已是最新版本时运行 `claude update` 出现错误提示“另一个进程正在更新 Claude”的问题
  * 修复了在非交互模式（`-p` 标志或通过管道输入）下运行时，来自 `.mcp.json` 的 MCP 服务器卡在等待状态的问题
  * 修复了在 `/permissions` 中删除权限规则后滚动位置重置的问题
  * 修复了在非拉丁文本（如西里尔文、希腊文、阿拉伯文、希伯来文、泰文和中文）中单词删除（opt+delete）和单词导航（opt+方向键）无法正常工作的问题
  * 修复了 `claude install --force` 无法绕过陈旧锁定文件的问题
  * 修复了 CLAUDE.md 中连续的 @\~/ 文件引用由于 Markdown 删除线干扰而被错误解析的问题
  * Windows：修复了插件 MCP 服务器因日志目录路径中的冒号而失败的问题



  * 新增在撰写提示词时切换模型的功能，可通过 Alt+P（Linux、Windows）或 Option+P（macOS）触发。
  * 在状态栏输入区域新增上下文窗口信息显示
  * 新增 `fileSuggestion` 设置项，用于自定义 `@` 文件搜索命令
  * 新增 `CLAUDE_CODE_SHELL` 环境变量，可覆盖自动检测的 Shell 设置（适用于登录 Shell 与实际工作 Shell 不同的场景）
  * 修复了使用 Escape 键中止查询时，提示词未保存至历史记录的问题
  * 修复了读取工具处理图片时，通过文件字节而非扩展名识别格式的问题



  * 实现自动压缩即时化
  * 代理与 bash 命令可异步执行，并向主代理发送唤醒消息
  * `/stats` 现可展示用户的 Claude Code 趣味统计，包括常用模型、用量图表和连续使用天数
  * 新增命名会话支持：使用 `/rename` 为会话命名，通过 REPL 输入 `/resume <name>` 或在终端执行 `claude --resume <name>` 即可恢复对应会话
  * 新增 `.claude/rules/` 目录支持，详见 [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)
  * 图片缩放时新增尺寸元数据，确保大图像的坐标映射准确性
  * 修复使用原生安装程序时自动加载 .env 文件的问题
  * 修复使用 `--continue` 或 `--resume` 参数时 `--system-prompt` 被忽略的问题
  * 优化 `/resume` 界面：支持分组显示衍生会话，并增加预览 (P) 和重命名 (R) 的键盘快捷键
  * VSCode 扩展：在代码块和 bash 工具输入区域新增复制到剪贴板按钮
  * VSCode 扩展：通过仿真模式回退至 x64 二进制文件，修复 Windows ARM64 系统兼容性问题
  * Bedrock：优化 token 计数效率
  * Bedrock：新增对 AWS 管理控制台 `aws login` 凭证的支持
  * 移除 AgentOutputTool 和 BashOutputTool，统一替换为新的 TaskOutputTool



  * 已为多选题添加"（推荐）"指示器，推荐选项移至列表顶部
  * 已添加 `attribution` 设置以自定义提交和PR署名（弃用 `includeCoAuthoredBy`）
  * 修复当 ~/.claude 符号链接至项目目录时出现重复斜杠命令的问题
  * 修复多个同名斜杠命令时选择功能失效的问题
  * 修复符号链接技能目录内的技能文件可能形成循环符号链接的问题
  * 修复因锁文件错误过期导致运行中版本被意外移除的问题
  * 修复IDE差异标签页在拒绝文件更改时未自动关闭的问题



  * 由于响应性问题，回滚了 VSCode 对多终端客户端的支持。



  * 新增后台代理支持。代理会在您工作时于后台运行
  * 新增 `--disable-slash-commands` CLI 标志以禁用所有斜杠命令
  * 在“Co-Authored-By”提交信息中新增模型名称
  * 启用 `/mcp enable [server-name]` 或 `/mcp disable [server-name]` 以快速切换所有服务器
  * 更新 Fetch 功能，跳过对预批准网站的摘要生成
  * VSCode: 新增支持多个终端客户端同时连接至 IDE 服务器



  * 新增 --agent CLI 参数，用于覆盖当前会话的代理设置
  * 新增 `agent` 设置，用于配置主线程以使用特定代理的系统提示词、工具限制和模型
  * VS Code：修复了从错误位置读取 .claude.json 配置文件的问题



  * Pro 用户现在可以在订阅中使用 Opus 4.5 了！
  * 修复了计时器显示时长显示为“11分60秒”而不是“12分0秒”的问题
  * Windows：托管设置现在会优先使用 `C:\Program Files\ClaudeCode`（如果存在）。对 `C:\ProgramData\ClaudeCode` 的支持将在未来版本中移除。



  * 在拒绝计划时添加了反馈输入框，允许用户告知 Claude 需要修改哪些内容
  * VSCode：新增流式消息支持，实现响应内容的实时显示



  * 新增设置以启用/禁用终端进度条 (OSC 9;4)
  * VSCode 扩展：新增对 VS Code 次级侧边栏的支持 (VS Code 1.97+)，允许 Claude Code 显示在右侧侧边栏，同时文件资源管理器保留在左侧。需要将侧边栏配置设置为首选位置。



  * 修复了代理DNS解析默认强制启用的问题。现需通过环境变量 `CLAUDE_CODE_PROXY_RESOLVES_HOSTS=true` 手动启用
  * 修复了在记忆位置选择器中长按方向键时键盘导航无响应的问题
  * 改进了 AskUserQuestion 工具，使其在最后一个问题为单选题时自动提交，简化简单问题的流程并省略额外的确认界面
  * 优化了 `@` 文件建议的模糊匹配，实现更快速、更准确的结果



  * 钩子：启用 PermissionRequest 钩子以处理“始终允许”建议并应用权限更新
  * 修复 iTerm 通知过多的问题



  * 修复了使用命令行启动 Claude 时的重复消息显示问题
  * 修复了 `/usage` 命令的进度条，使其随着使用量增加而填充（而不是显示剩余百分比）
  * 修复了在运行 Wayland 的 Linux 系统上图片粘贴无法工作的问题（当 xclip 不可用时，现回退使用 wl-paste）
  * 允许在 bash 命令中使用部分 `$!` 用法



  * 新增 Opus 4.5！[https://www.anthropic.com/news/claude-opus-4-5](https://www.anthropic.com/news/claude-opus-4-5)
  * 推出 Claude Code 桌面版：[https://claude.com/download](https://claude.com/download)
  * 为了让您有更多机会体验我们的新模型，我们更新了 Claude Code 用户的使用限额。完整详情请参阅 Claude Opus 4.5 博客
  * Pro 用户现可在 Claude Code 中购买额外用量以使用 Opus 4.5
  * 计划模式现在能构建更精确的计划并执行得更彻底
  * 使用限额通知现在更易于理解
  * 将 `/usage` 切换回 "% used"
  * 修复了处理思考错误的问题
  * 修复了性能退化问题



  * 修复了阻止调用具有嵌套引用的输入模式的 MCP 工具的 bug
  * 在升级期间静默了一个嘈杂但无害的错误
  * 改进了 ultrathink 文本显示
  * 提升了 5 小时会话限制警告信息的清晰度



  * 新增readline风格的ctrl-y功能，用于粘贴已删除文本
  * 提升了使用量限制警告消息的清晰度
  * 修复了子代理权限的处理



  * 改进了 `claude --teleport` 的错误消息和验证
  * 改进了 `/usage` 中的错误处理
  * 修复了退出时历史记录条目未被记录的竞态条件
  * 修复了 Vertex AI 配置未从 `settings.json` 应用的问题



  * 修复了当元数据无法检测格式时，图像文件报告错误媒体类型的问题



  * 新增对 Microsoft Foundry 的支持！参见 [https://code.claude.com/docs/en/azure-ai-foundry](https://code.claude.com/docs/en/azure-ai-foundry)
  * 新增 `PermissionRequest` 钩子，可通过自定义逻辑自动批准或拒绝工具权限请求
  * 通过以 `&` 开头的消息，将后台任务发送至网页版 Claude Code



  * 为自定义代理添加了 `permissionMode` 字段
  * 在 `PreToolUseHookInput` 和 `PostToolUseHookInput` 类型中新增 `tool_use_id` 字段
  * 新增技能前置元数据字段，用于声明子代理自动加载的技能
  * 新增 `SubagentStart` 钩子事件
  * 修复了在@提及文件时未加载嵌套 `CLAUDE.md` 文件的问题
  * 修复了 UI 中部分消息重复渲染的问题
  * 修复了一些视觉闪烁问题
  * 修复了当单元格 ID 符合 `cell-N` 模式时，`NotebookEdit` 工具在错误位置插入单元格的问题



  * 在 `SubagentStop` 钩子中添加了 `agent_id` 和 `agent_transcript_path` 字段。



  * 在基于提示词的停止钩子中添加了 `model` 参数，允许用户为钩子评估指定自定义模型
  * 修复了用户设置中的斜杠命令被重复加载导致的渲染问题
  * 修复了命令描述中用户设置与项目设置标签不正确的问题
  * 修复了插件命令钩子执行超时时发生的崩溃
  * 修复：Bedrock 用户使用 `--model haiku` 时，不再在 /model 选择器中看到重复的 Opus 条目
  * 修复了信任对话框和引导流程中损坏的安全文档链接
  * 修复了按 ESC 关闭差异模态框时会同时中断模型运行的问题
  * Ctrl-R 历史搜索定位到斜杠命令时不再取消搜索
  * SDK：支持钩子的自定义超时
  * 允许更多安全的 git 命令无需批准即可运行
  * 插件：新增对共享和安装输出样式的支持
  * 从网页传送会话将自动设置上游分支



  * 修复了通知空闲时间的计算方式
  * 钩子：为通知钩子事件添加了匹配器值
  * 输出样式：在 frontmatter 中添加了 `keep-coding-instructions` 选项



  * 修复：DISABLE_AUTOUPDATER 环境变量现在可以正确禁用包管理器更新通知
  * 修复了队列消息被错误地作为 bash 命令执行的问题
  * 修复了在处理队列消息时输入会丢失的问题



  * 改进了命令搜索时的模糊匹配效果
  * 优化 VS Code 扩展，使其在整个界面中尊重 `chat.fontSize` 和 `chat.fontFamily` 设置，并能立即应用字体更改无需重新加载
  * 新增 `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY` 环境变量，可在指定空闲时间后自动退出 SDK 模式，适用于自动化工作流和脚本
  * 将 `ignorePatterns` 从项目配置迁移至本地设置的拒绝权限中
  * 修复了菜单导航在遇到空字符串或其他假值项目时卡住的问题（例如在 `/hooks` 菜单中）



  * VSCode 扩展：新增设置，用于配置新会话的初始权限模式
  * 通过基于原生 Rust 的模糊查找器，提升了文件路径建议的性能
  * 修复了导致使用 OAuth 的 MCP 服务器（例如 Slack）在连接时挂起的无限 token 刷新循环
  * 修复了读写大文件（特别是 base64 编码的图片）时的内存崩溃问题



  * 原生二进制安装现在启动更快。
  * 修复了 `claude doctor` 通过正确解析符号链接来错误检测 Homebrew 与 npm-global 安装的问题。
  * 修复了 `claude mcp serve` 暴露工具时输出模式不兼容的问题。



  * 根据社区反馈取消弃用输出样式
  * 新增 `companyAnnouncements` 设置，用于在启动时显示公告
  * 修复了 `PostToolUse` 钩子执行期间钩子进度消息未正确更新的问题



  * Windows：原生安装改用 `shift+tab` 作为模式切换快捷键，替代原来的 `alt+m`
  * Vertex：为支持的模型添加了 Web 搜索功能
  * VSCode：新增 `respectGitIgnore` 配置项，用于控制文件搜索时是否包含被 `.gitignore` 忽略的文件（默认开启）
  * 修复了子代理与 MCP 服务器中与 "Tool names must be unique" 错误相关的问题
  * 修复了 `/compact` 命令因未识别现有紧凑边界而提示 `prompt_too_long` 失败的问题
  * 修复了插件卸载时未实际移除插件的问题



  * 新增实用提示：在 macOS 遇到 API 密钥错误且钥匙串锁定时，可运行 `security unlock-keychain`
  * 新增 `allowUnsandboxedCommands` 沙箱设置，可在策略层面禁用危险禁用沙箱的逃生通道
  * 为自定义代理定义新增 `disallowedTools` 字段，用于明确阻止工具使用
  * 新增基于提示词的停止钩子
  * VSCode：新增 respectGitIgnore 配置项，在文件搜索中包含 .gitignore 忽略的文件（默认为 true）
  * 在原生构建中启用 SSE MCP 服务器
  * 废弃输出样式。请在 `/output-style` 中查看选项，改用 --system-prompt-file、--system-prompt、--append-system-prompt、CLAUDE.md 或插件替代
  * 移除对自定义 ripgrep 配置的支持，解决了搜索无结果且配置发现失败的问题
  * 修复 Explore 代理在代码库探索时创建不需要的 .md 调查文件的问题
  * 修复 `/context` 偶尔因“max_tokens 必须大于 thinking.budget_tokens”错误消息而失败的问题
  * 修复 `--mcp-config` 标志无法正确覆盖基于文件的 MCP 配置的问题
  * 修复了将会话权限保存到本地设置的错误
  * 修复了 MCP 工具对子代理不可用的问题
  * 修复了使用 --dangerously-skip-permissions 标志时钩子和插件未执行的问题
  * 修复了使用箭头键浏览自动补全建议时的延迟问题
  * VSCode：恢复输入框底部的选择指示器，显示当前文件或代码选择状态



  * 计划模式：引入新的计划子代理
  * 子代理：Claude 现在可以选择恢复子代理
  * 子代理：Claude 可以动态选择其子代理使用的模型
  * SDK：添加了 `--max-budget-usd` 标志
  * 自定义斜杠命令、子代理和输出样式的发现机制不再遵循 .gitignore 规则
  * 阻止 `/terminal-setup` 在 VS Code 中为 `Shift + Enter` 添加反斜杠
  * 为基于 Git 的插件和市场添加分支与标签支持，使用片段语法（例如 `owner/repo#branch`）
  * 修复了从主目录启动时，macOS 权限提示会在初次启动时出现的错误
  * 其他错误修正



  * 权限提示的全新UI设计
  * 会话恢复界面新增当前分支过滤和搜索功能，便于导航
  * 修复因目录@提及导致的“未找到助手消息”错误
  * VSCode 扩展：新增配置选项以在文件搜索中包含.gitignore忽略的文件
  * VSCode 扩展：修复无关的‘Warmup’对话及配置/设置偶尔重置为默认值的问题



  * 已移除旧版 SDK 入口点。请迁移至 @anthropic-ai/claude-agent-sdk 以获取未来 SDK 更新：[https://platform.claude.com/docs/en/agent-sdk/migration-guide](https://platform.claude.com/docs/en/agent-sdk/migration-guide)



  * 修复了当指定 `--setting-sources 'project'` 时项目级技能未加载的问题
  * Claude Code Web：支持 Web -> CLI 的传送功能
  * 沙箱：为 Linux 和 Mac 上的 BashTool 发布沙箱模式
  * Bedrock：在需要授权时显示 `awsAuthRefresh` 输出



  * 修复滚动浏览斜杠命令时的内容布局偏移问题
  * IDE：新增切换按钮以启用/禁用思考功能
  * 修复并行工具调用导致重复权限提示的错误
  * 新增对企业级MCP允许列表和阻止列表的支持



  * 支持工具响应中的 MCP `structuredContent` 字段
  * 新增交互式提问工具
  * Claude 现在在计划模式下会更频繁地向您提问
  * 为 Pro 用户新增 Haiku 4.5 作为模型选项
  * 修复了队列命令无法访问前序消息输出的问题



  * 已新增对 Claude Skills 的支持



  * 将长时间运行的 bash 命令自动转入后台，而非终止它们。可通过 `BASH_DEFAULT_TIMEOUT_MS` 进行自定义设置。
  * 修复了在打印模式下不必要调用 Haiku 的问题。



  * 在模型选择器中新增了 Haiku 4.5！
  * Haiku 4.5 在计划模式下自动使用 Sonnet，在执行模式下使用 Haiku（默认为 SonnetPlan）
  * 第三方提供商（Bedrock 和 Vertex）尚未自动升级。可通过设置 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 手动升级
  * 推出探索子代理。由 Haiku 驱动，它将高效搜索您的代码库以节省上下文！
  * OTEL：支持 HTTP\_PROXY 和 HTTPS\_PROXY
  * `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 现在可禁用版本说明获取



  * 修复了恢复执行时，需要重新读取已创建文件才能写入的错误
  * 修复了 `-p` 模式下，@提及的文件需要重新读取才能写入的错误



  * 修复 @提及 MCP 服务器时的开关切换功能
  * 改进 bash 命令在内联环境变量中的权限检查
  * 修复 ultrathink 与 thinking 切换问题
  * 减少不必要的登录操作
  * 补充 `--system-prompt` 的文档说明
  * 多项渲染效果改进
  * 精细化插件用户界面



  * 修复了 `/plugin` 在原生构建上不工作的问题



  * **插件系统发布**：通过市场扩展 Claude Code，支持自定义命令、代理、钩子和 MCP 服务器
  * `/plugin install`、`/plugin enable/disable`、`/plugin marketplace` 命令用于插件管理
  * 通过 `extraKnownMarketplaces` 进行仓库级别的插件配置，以支持团队协作
  * `/plugin validate` 命令用于验证插件结构和配置
  * 插件发布公告博客文章位于 [https://www.anthropic.com/news/claude-code-plugins](https://www.anthropic.com/news/claude-code-plugins)
  * 插件文档可在 [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins) 查看
  * 通过 `/doctor` 命令获取全面的错误信息和诊断
  * 修复 `/model` 选择器的闪烁问题
  * 改进 `/help`
  * 避免在 `/resume` 摘要中提及钩子
  * `/config` 中 "verbose" 设置的更改现在可跨会话保持



  * 系统提示词大小减少 1.4k tokens
  * IDE：修复键盘快捷键和焦点问题以提升交互流畅度
  * 修复 Opus 回退速率限制错误误报的问题
  * 修复 `/add-dir` 命令错误选择默认标签页的问题



  * 重写了终端渲染器，使UI界面更流畅
  * 通过@提及或在 /mcp 中启用/禁用MCP服务器
  * 在bash模式下为shell命令添加了制表符补全功能
  * PreToolUse钩子现在可以修改工具输入
  * 按Ctrl-G可在系统配置的文本编辑器中编辑提示词
  * 修复了命令中包含环境变量时的bash权限检查问题



  * 修复bash后台任务功能失效的回归问题



  * 将 Bedrock 默认 Sonnet 模型更新为 `global.anthropic.claude-sonnet-4-5-20250929-v1:0`
  * IDE：为聊天中的文件和文件夹添加拖放支持
  * /context：修复思维块的计数问题
  * 改善在深色终端上使用浅色主题的用户的消息渲染效果
  * 移除已弃用的 .claude.json 中的 allowedTools、ignorePatterns、env 和 todoFeatureEnabled 配置选项（请改在 settings.json 中配置这些选项）



  * IDE：修复输入法（IME）在 Enter 和 Tab 键下意外提交消息的问题
  * IDE：在登录界面添加“在终端中打开”链接
  * 修复未处理的 OAuth 过期 401 API 错误
  * SDK：新增 `SDKUserMessageReplay.isReplay` 以防止重复消息



  * 跳过 Bedrock 和 Vertex 的 Sonnet 4.5 默认模型设置变更
  * 各类 bug 修复及展示改进



  * 新增原生 VS Code 扩展
  * 界面全面焕新
  * `/rewind` 命令可回溯对话并撤销代码修改
  * `/usage` 命令可查看计划用量限制
  * Tab 键切换思考模式（会话间保持状态）
  * Ctrl-R 搜索历史记录
  * 移除未发布的 `claude config` 命令
  * 钩子：减少出现 PostToolUse 中缺少 'tool\_result' 块的 'tool\_use' id 错误
  * SDK：Claude Code SDK 已更名为 Claude Agent SDK
  * 通过 `--agents` 参数动态添加子代理



  * 为 Bedrock 和 Vertex 启用 /context 命令
  * 为基于 HTTP 的 OpenTelemetry 导出器添加 mTLS 支持



  * 设置 `CLAUDE_BASH_NO_LOGIN` 环境变量为 1 或 true，以跳过 BashTool 的登录 shell
  * 修复 Bedrock 和 Vertex 环境变量将所有字符串评估为真值的问题
  * 当权限被拒绝时，不再向 Claude 告知允许使用的工具列表
  * 修复了 Bash 工具权限检查中的安全漏洞
  * 提升了大型文件的 VSCode 扩展性能



  * Bash 权限规则现在支持在匹配时包含输出重定向（例如，`Bash(python:*)` 匹配 `python script.py > output.txt`）
  * 修复了在否定短语（如“不要思考”）时错误触发思维模式的问题
  * 修复了在 token 流式传输期间渲染性能下降的问题
  * 新增了 SlashCommand 工具，该工具使 Claude 能够调用您的斜杠命令。[https://code.claude.com/docs/en/slash-commands#SlashCommand-tool](https://code.claude.com/docs/en/slash-commands#SlashCommand-tool)
  * 增强了 BashTool 的环境快照日志功能
  * 修复了在无头模式下恢复会话时，有时会不必要地启用思维模式的 bug
  * 将 --debug 日志迁移至文件，以便于追踪和过滤



  * 修复输入延迟问题，尤其在大型提示词输入时明显
  * 改进 VSCode 扩展命令注册表及会话对话框用户体验
  * 增强会话对话框的响应速度与视觉反馈
  * 通过移除工作树支持检查修复 IDE 兼容性问题
  * 修复安全漏洞，此前可通过前缀匹配绕过 Bash 工具权限检查



  * 修复 Windows 系统中进入交互模式时进程视觉上卡住的问题
  * 通过 `headersHelper` 配置支持 MCP 服务器的动态头部
  * 修复无头会话中思考模式不工作的问题
  * 修复斜杠命令现在正确更新允许的工具列表，而非替换它们



  * 新增 Ctrl-R 历史搜索功能，可召回先前命令（类似 bash/zsh）
  * 修复输入延迟问题，特别是在 Windows 系统上
  * 在 acceptEdits 模式下，将 sed 命令添加至自动允许的命令列表
  * 修复 Windows PATH 路径比较问题，驱动器字母现支持大小写不敏感
  * 在 `/add-dir` 输出中添加权限管理提示



  * 通过增强视觉效果改进思考模式显示
  * 在提示词中输入 /t 可临时禁用思考模式
  * 改进 glob 和 grep 工具的路径验证
  * 工具后钩子显示精简输出以减少视觉干扰
  * 修复加载状态完成时的视觉反馈
  * 提升权限请求对话框的界面一致性



  * 弃用交互模式下的管道输入
  * 将切换转录的 `Ctrl+R` 快捷键改为 `Ctrl+O`



  * 转录模式 (Ctrl+R)：新增用于生成每个助手消息的模型显示
  * 修复了部分 Claude Max 用户被错误识别为 Claude Pro 用户的问题
  * 钩子：为 SessionEnd 钩子新增 systemMessage 支持
  * 新增 `spinnerTipsEnabled` 设置项以禁用加载提示
  * IDE：多项改进与错误修复



  * `/model` 现在会验证提供的模型名称
  * 修复了由不规范的 shell 语法解析导致的 Bash 工具崩溃问题



  * /terminal-setup 命令现已支持 WezTerm
  * MCP：OAuth 令牌现在会在到期前主动刷新
  * 修复了后台 Bash 进程的可靠性问题



  * SDK：通过 `--include-partial-messages` CLI 标志新增部分消息流式传输支持



  * Windows：修复路径权限匹配问题，现在统一使用POSIX格式（例如 `Read(//c/Users/...)`）



  * 设置：`/doctor` 现在可以验证权限规则语法并建议修正



  * Vertex：为支持的模型添加全局端点支持
  * `/memory` 命令现允许直接编辑所有已导入的记忆文件
  * SDK：添加自定义工具作为回调函数
  * 新增 `/todos` 命令以列出当前待办事项



  * Windows：添加 Alt + V 快捷键用于粘贴剪贴板中的图片
  * 支持 `NO_PROXY` 环境变量以绕过指定主机名和 IP 的代理



  * 设置文件更改立即生效 - 无需重启



  * 修复了导致“当前不支持OAuth认证”的问题
  * 状态行输入现在包含 `exceeds_200k_tokens`
  * 修复了 `/cost` 中用量跟踪不正确的问题
  * 引入了 `ANTHROPIC_DEFAULT_SONNET_MODEL` 和 `ANTHROPIC_DEFAULT_OPUS_MODEL` 以控制模型别名 opusplan、opus 和 sonnet。
  * Bedrock：已将默认 Sonnet 模型更新为 Sonnet 4



  * 添加了 `/context` 命令，帮助用户自助调试上下文问题
  * SDK：为所有 SDK 消息添加了 UUID 支持
  * SDK：添加了 `--replay-user-messages` 选项，用于将用户消息回放至标准输出



  * 状态行输入现已包含会话成本信息
  * 钩子：引入了 SessionEnd 钩子



  * 修复当网络不稳定时出现的 tool\_use/tool\_result ID 不匹配错误
  * 修复 Claude 有时在任务即将完成时会忽略实时引导的问题
  * @-提及：将 \~/.claude/\* 文件添加到建议中，以便更轻松地编辑代理、输出样式和斜杠命令
  * 默认使用内置 ripgrep；如需禁用此行为，请设置 USE\_BUILTIN\_RIPGREP=0



  * @提及：支持路径中包含空格的文件
  * 新增流光旋转器



  * SDK：新增请求取消支持
  * SDK：新增 `additionalDirectories` 选项用于搜索自定义路径，优化斜杠命令处理
  * 设置：验证机制防止 `.claude/settings.json` 文件中出现无效字段
  * MCP：改善工具名称一致性
  * Bash：修复 Claude 尝试自动读取大文件时的崩溃问题



  * 发布了输出样式功能，新增"解释型"和"学习型"两种内置教育输出样式。文档：[https://code.claude.com/docs/en/output-styles](https://code.claude.com/docs/en/output-styles)
  * 代理功能：修复当代理文件无法解析时自定义代理加载的问题



  * 界面改进：修复了自定义子代理颜色的文本对比度以及旋转指示器渲染问题



  * Bash 工具：修复 heredoc 和多行字符串转义问题，改进 stderr 重定向处理
  * SDK：新增会话支持及权限拒绝追踪功能
  * 修复对话摘要中的 token 限制错误
  * Opus 计划模式：在 `/model` 中新增设置，仅在该模式下运行 Opus，否则使用 Sonnet



  * MCP：支持通过 `--mcp-config file1.json file2.json` 加载多个配置文件
  * MCP：按 Esc 键可取消 OAuth 认证流程
  * Bash：改进命令验证机制并减少误报安全警告
  * UI：增强旋转动画效果及状态行视觉层次
  * Linux：新增对 Alpine 和基于 musl 的发行版支持（需单独安装 ripgrep）



  * 请求权限：使用 `/permissions` 让 Claude Code 在调用特定工具前始终请求确认



  * 后台命令：使用 (Ctrl-b) 可在后台运行任何 Bash 命令，这样 Claude 能继续工作（非常适合开发服务器、查看日志等场景）
  * 自定义状态行：通过 /statusline 命令将您的终端提示符添加到 Claude Code 中



  * 性能：优化消息渲染以提高大型上下文环境下的性能表现
  * Windows：修复了本地文件搜索、ripgrep 和子代理功能的问题
  * 新增对斜杠命令参数中 @提及功能的支持



  * 已将 Opus 升级至 4.1 版本



  * 修正了 `/pr-comments` 等命令使用错误模型名称的问题
  * Windows：改进了允许/拒绝工具和项目信任的权限检查。这可能在 `.claude.json` 中创建新项目条目 - 如需可手动合并历史记录字段。
  * Windows：改进了子进程生成机制，消除了运行 pnpm 等命令时出现的 "No such file or directory" 错误
  * 增强了 /doctor 命令，添加了 CLAUDE.md 和 MCP 工具上下文以支持自助调试
  * SDK：新增了用于工具确认的 canUseTool 回调支持
  * 新增了 `disableAllHooks` 设置
  * 改进了大型仓库中的文件建议性能



  * IDE：已修复诊断功能的连接稳定性问题和错误处理
  * Windows：已修复针对无.bashrc文件用户的shell环境设置



  * 智能体：新增模型定制支持 - 现可指定智能体使用的具体模型
  * 智能体：修复了非预期的递归智能体工具访问问题
  * 钩子：在钩子JSON输出中新增systemMessage字段，用于显示警告与上下文信息
  * SDK：修复了跨多轮对话的用户输入跟踪问题
  * 文件搜索与@提及建议中新增隐藏文件支持



  * Windows: 修复了文件搜索、@agent提及以及自定义斜杠命令的功能



  * 为自定义代理添加了带自动补全功能的 @提及支持。使用 @`<your-custom-agent>` 进行调用
  * 钩子：新增用于新会话初始化的会话开始钩子
  * /add-dir 命令现支持目录路径的自动补全
  * 提升了网络连接检查的可靠性



  * 转录模式 (Ctrl+R)：将退出转录模式的按键更改为 Esc，而非中断
  * 设置：添加 `--settings` 标志，支持从 JSON 文件加载设置
  * 设置：修复了设置文件路径为符号链接时的解析问题
  * OTEL：修复了身份验证更改后错误上报组织信息的问题
  * 斜杠命令：修复了针对 Bash 的 allowed-tools 权限检查问题
  * IDE：在 macOS 的 VSCode 中添加了使用 ⌘+V 粘贴图片的支持
  * IDE：新增 `CLAUDE_CODE_AUTO_CONNECT_IDE=false` 选项，用于禁用 IDE 自动连接
  * 新增 `CLAUDE_CODE_SHELL_PREFIX` 环境变量，用于包装由 Claude Code 运行的 Claude 及用户提供的 shell 命令



  * 你现在可以创建专门用于特定任务的自定义子代理了！运行 `/agents` 开始使用



  * SDK: 通过 canUseTool 回调新增工具确认支持
  * SDK: 允许为派生进程指定环境变量
  * 钩子: 向钩子公开了 PermissionDecision（包含"询问"选项）
  * 钩子: UserPromptSubmit 现在支持在高级 JSON 输出中附加 additionalContext
  * 修复了部分指定使用 Opus 的 Max 用户仍会回退至 Sonnet 的问题



  * 新增了PDF文件读取支持
  * MCP：优化了 `claude mcp list` 命令中的服务器健康状态显示
  * 钩子：为钩子命令新增了 `CLAUDE_PROJECT_DIR` 环境变量



  * 新增斜杠命令支持指定模型的功能
  * 优化权限提示信息以帮助 Claude 理解可用工具
  * 修复：移除终端输出中 bash 结果的尾部换行符



  * Windows：在支持终端 VT 模式的 Node.js 版本上启用了 shift+tab 进行模式切换
  * 修复 WSL IDE 检测相关问题
  * 修复一个导致 `awsRefreshHelper` 对 `.aws` 目录的更改无法被检测到的问题



  * 明确了 Opus 4 和 Sonnet 4 模型的知识截止日期
  * Windows：修复了 Ctrl+Z 导致的崩溃问题
  * SDK：新增了捕获错误日志的功能
  * 为打印模式添加了 `--system-prompt-file` 选项以覆盖系统提示词



  * 钩子：新增 UserPromptSubmit 钩子，并在钩子输入中添加当前工作目录
  * 自定义斜杠命令：在frontmatter中增加了参数提示
  * Windows：OAuth 使用端口 45454 并正确构建浏览器 URL
  * Windows：模式切换现使用 alt + m，且规划模式渲染正常
  * Shell：切换至内存中的 shell 快照以修复文件相关错误



  * 将 @-mention 文件截断行数从 100 行更新为 2000 行
  * 为 AWS token 刷新添加辅助脚本设置：awsAuthRefresh（适用于 aws sso login 等前台操作）和 awsCredentialExport（适用于类似 STS 响应的后台操作）。



  * 新增了对 MCP 服务器指令的支持



  * 新增了原生 Windows 支持（需要安装 Git for Windows）
  * 新增了通过环境变量 AWS\_BEARER\_TOKEN\_BEDROCK 支持 Bedrock API 密钥的功能
  * 设置：现在可以通过 /doctor 命令帮助您识别和修复无效的设置文件
  * `--append-system-prompt` 现在可用于交互模式，而不仅限于 --print/-p
  * 将自动压缩警告阈值从 60% 提高至 80%
  * 修复了处理包含空格的用户目录时 shell 快照出现的问题
  * OTEL 资源现在包含 os.type、os.version、host.arch 以及 wsl.version（若在 Windows 子系统 for Linux 中运行）
  * 自定义斜杠命令：修复了子目录中的用户级命令问题
  * 计划模式：修复了子任务中被拒绝的计划会被丢弃的问题



  * 修复了 v1.0.45 中的一个 Bug，该 Bug 有时会导致应用启动时卡死
  * 为 Bash 工具添加了进度消息，基于命令输出的最后 5 行
  * 为 MCP 服务器配置添加了扩展变量支持
  * 将 shell 快照从 /tmp 移动到 \~/.claude，使 Bash 工具调用更可靠
  * 改进了 Claude Code 在 WSL 中运行时 IDE 扩展路径的处理
  * 钩子：添加了 PreCompact 钩子
  * Vim 模式：添加了 c、f/F、t/T



  * 重新设计了搜索（Grep）工具，包含新的工具输入参数和功能
  * 对笔记本文件禁用 IDE 差异比较，修复了"等待超过 1000ms 后超时"错误
  * 通过强制执行原子写入解决了配置文件损坏问题
  * 将提示词输入撤销操作更新为 Ctrl+\_ 以避免破坏现有的 Ctrl+U 行为，匹配 zsh 的撤销快捷键
  * 停止钩子：修复了 /clear 后转录路径的问题，并修复了当循环以工具调用结束时的触发问题
  * 自定义斜杠命令：恢复了基于子目录的命令名称命名空间。例如，.claude/commands/frontend/component.md 现在对应 /frontend:component，而不是 /component。



  * 新增 /export 命令，可快速导出对话内容以便分享
  * MCP：现在支持 `resource_link` 工具结果
  * MCP：工具注释和工具标题现在会在 /mcp 视图中显示
  * 将 Ctrl+Z 更改为挂起 Claude Code。运行 `fg` 命令可恢复。撤消提示词输入现改为 Ctrl+U。



  * 修复了主题选择器频繁保存的错误
  * 钩子：新增 EPIPE 系统错误处理



  * 为 `/add-dir` 命令添加了波浪号 (`~`) 扩展支持



  * 钩子：将停止钩子触发拆分为Stop和子代理停止
  * 钩子：为每个命令启用可选超时配置
  * 钩子：在钩子输入中添加"hook_event_name"字段
  * 修复了MCP工具在工具列表中显示两次的问题
  * 在`tool_decision`事件中为Bash工具新增工具参数JSON



  * 修复了一个导致API连接错误的问题，当设置 `NODE_EXTRA_CA_CERTS` 时，错误提示为 `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`。



  * OpenTelemetry 日志中的新活动时间指标



  * 发布了钩子。特别感谢社区在 [https://github.com/anthropics/claude-code/issues/712](https://github.com/anthropics/claude-code/issues/712) 提出的意见。文档：[https://code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)



  * 移除通过 `ANTHROPIC_AUTH_TOKEN` 或 `apiKeyHelper` 设置 `Proxy-Authorization` 请求头的功能



  * Web 搜索现在会考虑今天的日期作为上下文
  * 修复了 stdio MCP 服务器在退出时未正确终止的漏洞



  * 新增了对MCP OAuth授权服务器发现机制的支持



  * 修复了导致出现 MaxListenersExceededWarning 消息的内存泄漏



  * 改进日志功能，新增会话ID支持
  * 新增提示词输入撤销功能（Ctrl+Z和vim 'u'命令）
  * 计划模式优化



  * 更新了 litellm 的环回配置
  * 添加了 `forceLoginMethod` 设置以绕过登录选择界面



  * 修复了当文件包含无效 JSON 时，\~/.claude.json 会被重置的错误



  * 自定义斜杠命令：运行bash输出、@提及文件、通过思维关键词启用思考功能
  * 改进文件路径自动补全功能，支持文件名匹配
  * 在Ctrl-r模式下添加时间戳显示，并修复Ctrl-c处理逻辑
  * 增强jq正则表达式支持，可处理包含管道符和select的复杂过滤器



  * 改进了CJK字符在光标导航和渲染方面的支持



  * 斜杠命令：修复历史导航期间的选择器显示
  * 上传前调整图片尺寸以防止API尺寸限制错误
  * 为配置目录添加XDG_CONFIG_HOME支持
  * 针对内存使用的性能优化
  * OpenTelemetry日志中新增属性（terminal.type、language）



  * 现已支持可流式传输的 HTTP MCP 服务器
  * 远程 MCP 服务器（SSE 和 HTTP）现已支持 OAuth
  * 现可通过 @提及 方式使用 MCP 资源
  * 使用 /resume 斜杠命令在 Claude Code 内切换对话



  * 斜杠命令：将“project”和“user”前缀移至描述中
  * 斜杠命令：改进了命令发现的可靠性
  * 改进了对 Ghostty 的支持
  * 改进了网络搜索的可靠性



  * 改进了 /mcp 的输出
  * 修复了设置数组被覆盖而非合并的错误



  * 发布 TypeScript SDK：导入 `@anthropic-ai/claude-code` 开始使用
  * 发布 Python SDK：执行 `pip install claude-code-sdk` 开始使用



  * SDK：将 `total_cost` 重命名为 `total_cost_usd`



  * 改进了基于制表符缩进文件的编辑
  * 修复了缺少对应 tool\_result 时 tool\_use 的错误
  * 修复了退出 Claude Code 后 stdio MCP 服务器进程仍会残留的 bug



  * 新增 `--add-dir` 命令行参数，用于指定额外的工作目录
  * 新增流式输入支持，无需强制使用 `-p` 标志
  * 优化启动性能与会话存储性能
  * 新增 `CLAUDE\_BASH\_MAINTAIN\_PROJECT\_WORKING\_DIR` 环境变量，可固定 bash 命令的工作目录
  * 新增详细的 MCP 服务器工具显示功能（`/mcp`）
  * 改进 MCP 认证与权限机制
  * MCP SSE 连接断开后支持自动重连
  * 修复对话框出现时已粘贴内容丢失的问题



  * 我们现在在 `-p` 模式下会从子任务发出消息（请查找 `parent\_tool\_use\_id` 属性）
  * 修复了当 VS Code diff 工具被快速多次调用时导致的崩溃问题
  * MCP 服务器列表的界面改进
  * 将 Claude Code 进程标题更新为显示 "claude" 而非 "node"



  * Claude Code 现在也可以通过 Claude Pro 订阅使用
  * 新增 /upgrade 命令，以便更顺畅地切换到 Claude Max 计划
  * 改进了通过 API 密钥以及 Bedrock/Vertex/外部认证令牌进行身份验证的用户界面
  * 改进了 Shell 配置错误处理
  * 改进了精简过程中的待办事项列表处理



  * 增加了 Markdown 表格支持
  * 改进了流式性能



  * 修复了使用 CLOUD\_ML\_REGION 时的 Vertex AI 区域回退问题
  * 将默认 otel 间隔从 1 秒增加到 5 秒
  * 修复了未正确遵守 MCP\_TIMEOUT 和 MCP\_TOOL\_TIMEOUT 的边界情况
  * 修复了搜索工具不必要请求权限的回归问题
  * 增加了对触发非英语语言思考的支持
  * 改进了压缩界面



  * 将 `/allowed-tools` 重命名为 `/permissions`
  * 将 `allowedTools` 和 `ignorePatterns` 从 `.claude.json` 迁移到 `settings.json`
  * 废弃 `claude config` 命令，转为编辑 `settings.json`
  * 修复了 `--dangerously-skip-permissions` 在 `--print` 模式下有时不生效的 bug
  * 改进了 `/install-github-app` 的错误处理
  * Bug 修复、界面优化以及工具可靠性提升



  * 提升了对制表符缩进文件的编辑可靠性
  * 全面遵循 CLAUDE_CONFIG_DIR 环境变量
  * 减少了不必要的工具权限提示
  * 新增在 @file 类型提示中对符号链接的支持
  * 错误修复、界面优化及工具可靠性改进



  * 修复了MCP工具错误未被正确解析的问题



  * 新增 `DISABLE_INTERLEAVED_THINKING` 配置项，为用户提供退出交错思考功能的选项。
  * 改进模型命名显示，现在会展示特定于提供商的名称（例如 Bedrock 平台显示为 Sonnet 3.7，Console 平台显示为 Sonnet 4）。
  * 更新了文档链接及 OAuth 流程说明。



  * Claude Code 现已正式发布
  * Sonnet 4 与 Opus 4 模型正式推出



  * 破坏性变更：传递给 `ANTHROPIC_MODEL` 或 `ANTHROPIC_SMALL_FAST_MODEL` 的 Bedrock ARN 不应再包含转义的斜杠（应指定 `/` 而非 `%2F`）
  * 已移除 `DEBUG=true`，现采用 `ANTHROPIC_LOG=debug` 来记录所有请求



  * 重大变更：`--print` 的 JSON 输出现在返回嵌套消息对象，以便在我们引入新元数据字段时保持前向兼容性
  * 引入 `settings.cleanupPeriodDays`
  * 引入 `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 环境变量
  * 引入 `--debug` 模式



  * 现在你可以在Claude工作时实时发送消息来引导Claude
  * 新增了BASH_DEFAULT_TIMEOUT_MS和BASH_MAX_TIMEOUT_MS环境变量
  * 修复了-p模式下思考功能不工作的错误
  * 修复了/cost报告的回归问题
  * 弃用MCP向导界面，推荐使用其他MCP命令
  * 大量其他错误修复和改进



  * CLAUDE.md 文件现在可以导入其他文件。在 ./CLAUDE.md 中添加 @path/to/file.md 以在启动时加载额外文件。



  * MCP SSE 服务器配置现在支持指定自定义头部
  * 修复了 MCP 权限提示未总是正确显示的错误



  * Claude 现在可以搜索网页了
  * 系统与账户状态已移至 `/status`
  * 为 Vim 添加了单词移动快捷键
  * 优化了启动、待办工具及文件编辑的延迟表现



  * 思维触发可靠性提升
  * @提及功能在图片和文件夹方面的可靠性增强
  * 您现在可以在一个提示词中粘贴多个大段内容



  * 修复了由栈溢出错误导致的崩溃问题
  * 数据库存储改为可选；缺少数据库支持时，--continue 和 --resume 功能将被禁用



  * 修复了自动压缩功能运行两次的问题



  * Claude Code 现在也可以通过 Claude Max 订阅使用 ([https://claude.ai/upgrade](https://claude.ai/upgrade))



  * 使用 `claude --continue` 和 `claude --resume` 命令可以从您上次中断的地方恢复对话
  * Claude 现在可以访问待办事项列表，以帮助它保持专注并更有条理



  * 新增了对 `--disallowedTools` 的支持
  * 为保持一致性重命名了工具：`LSTool` -> `LS`，`View` -> `Read` 等。



  * 在 Claude 工作时按回车键可排队发送额外消息
  * 直接拖拽或复制粘贴图像文件到提示词中
  * @提及文件以直接将其添加至上下文
  * 通过 `claude --mcp-config <path-to-file>` 运行一次性 MCP 服务器
  * 改进了文件名自动补全的性能



  * Added support for refreshing dynamically generated API keys (via apiKeyHelper), with a 5 minute TTL
  * Task tool can now perform writes and run bash commands



  * 更新了加载器以显示已加载的 token 数量和工具使用情况



  * 像 curl 这样的网络命令现在可供 Claude 使用
  * Claude 现在可以并行运行多个网络查询
  * 在自动接受模式下，按一次 ESC 键会立即中断 Claude



  * 通过改进 `Select` 组件行为修复了界面小问题
  * 终端输出显示增强，采用更智能的文本截断逻辑



  * 共享项目权限规则可以保存在 .claude/settings.json 中。



  * 打印模式 (-p) 现支持通过 `--output-format=stream-json` 实现流式输出
  * 修复了粘贴操作意外触发内存或 bash 模式的问题



  修复了MCP工具被加载两次导致工具调用错误的问题。



  * 使用 vim 风格按键（j/k）或 bash/emacs 快捷键（Ctrl+n/p）浏览菜单，提升交互速度
  * 增强图像检测，提供更可靠的剪贴板粘贴功能
  * 修复了 ESC 键可能导致对话历史记录选择器崩溃的问题



  * 直接将图片复制粘贴到提示词中
  * 改进 bash 和 fetch 工具的进度指示器
  * 修复非交互模式 (-p) 的错误



  * 以 '#' 开头的消息可快速添加到记忆中
  * 按 ctrl+r 查看长工具结果的完整输出
  * 新增 MCP SSE 传输支持



  * 新增网页抓取工具，允许 Claude 查看您粘贴的 URL
  * 修复了 JPEG 检测的一个错误



  * 新的 MCP "project" 范围现在允许您将 MCP 服务器添加到 `.mcp.json` 文件中，并提交到您的仓库。



  * 之前的 MCP 服务器范围已被重命名：以前的"project"范围现在是"local"，而"global"范围现在是"user"



  * 按 Tab 键可自动完成文件和文件夹名称
  * 按 Shift + Tab 可切换文件编辑的自动接受功能
  * 自动对话压缩支持无限对话长度（通过 /config 切换）



  * 向 Claude 提问时使用思考模式：只需说 'think' 或 'think harder' 甚至 'ultrathink'



  * MCP 服务器启动超时现在可通过 `MCP_TIMEOUT` 环境变量进行配置；
  * MCP 服务器启动不再阻塞应用启动。



  * 新增 `/release-notes` 命令，可随时查看发布说明
  * `claude config add/remove` 命令现支持以逗号或空格分隔的多个值



  * 通过 `claude mcp add-from-claude-desktop` 命令从 Claude Desktop 导入 MCP 服务器
  * 使用 `claude mcp add-json <n> <json>` 命令以 JSON 字符串格式添加 MCP 服务器



  * Vim 快捷键文本输入 - 可使用 `/vim` 或 `/config` 启用



  * 交互式 MCP 设置向导：运行 `claude mcp add` 命令，通过逐步交互界面添加 MCP 服务器
  * 修复了 PersistentShell 的一些问题



  * 自定义斜杠命令：`.claude/commands/` 目录中的 Markdown 文件现在会显示为自定义斜杠命令，用于将提示词插入您的对话
  * MCP 调试模式：使用 `--mcp-debug` 标志运行可获取有关 MCP 服务器错误的更多信息



  * 新增 ANSI 颜色主题以提升终端兼容性
  * 修复斜杠命令参数未能正确发送的问题
  * (仅限 Mac) API keys 现在存储在 macOS 钥匙串中



  * 新增 /approved-tools 命令用于管理工具权限
  * 字级差异显示提升代码可读性
  * 斜杠命令的模糊匹配



  * 斜杠命令的模糊匹配

