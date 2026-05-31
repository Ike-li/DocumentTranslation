> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 选择权限模式

> 控制 Claude 在编辑文件或运行命令前是否需要确认。在 CLI 中按 Shift+Tab 切换模式，或在 VS Code、Desktop 和 claude.ai 中使用模式选择器。

当 Claude 想要编辑文件、运行 shell 命令或发起网络请求时，它会暂停并请求你批准该操作。权限模式控制暂停发生的频率。你选择的模式决定了会话的流程：默认模式让你逐一审查每个操作，而更宽松的模式让 Claude 进行更长的不间断工作段并在完成后汇报。对于敏感工作选择更多监督，或者在你信任方向时减少中断。

## 可用模式

每种模式在便利性和监督之间做出不同的权衡。下表显示了在每种模式下 Claude 无需权限提示即可执行的操作。

| 模式                                                                | 无需询问即可运行的内容                                                               | 适用场景                                |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------- | :-------------------------------------- |
| `default`                                                           | 仅读取                                                                             | 入门、敏感工作         |
| [`acceptEdits`](#使用-acceptedits-模式自动批准文件编辑)     | 读取、文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等） | 审查代码时的迭代      |
| [`plan`](#使用-plan-模式先分析再编辑)                   | 仅读取                                                                             | 在修改前探索代码库 |
| [`auto`](#使用-auto-模式消除提示)                         | 所有操作，附带后台安全检查                                              | 长任务、减少提示疲劳     |
| [`dontAsk`](#使用-dontask-模式仅允许预批准的工具)       | 仅预批准的工具                                                                | 锁定的 CI 和脚本              |
| [`bypassPermissions`](#使用-bypasspermissions-模式跳过所有检查) | 所有操作                                                                             | 仅限隔离容器和虚拟机        |

在除 `bypassPermissions` 之外的所有模式中，写入[受保护路径](#受保护路径)永远不会被自动批准，以保护仓库状态和 Claude 自身的配置免受意外损坏。

模式设定基线。在任何模式（`bypassPermissions` 除外，它完全跳过权限层）中，都可以通过[权限规则](/zh/permissions#管理权限)叠加来预先批准或阻止特定工具。

## 切换权限模式

你可以在会话中途、启动时或作为持久默认值切换模式。模式通过这些控件设置，而不是在聊天中询问 Claude。选择你的界面查看如何更改。

#### CLI

**会话期间**：按 `Shift+Tab` 循环切换 `default` → `acceptEdits` → `plan`。当前模式显示在状态栏中。并非所有模式都在默认循环中：

* `auto`：当你的帐户满足 [auto 模式要求](#使用-auto-模式消除提示)时出现；循环到 auto 会显示选择加入提示，直到你接受它，或选择 **No, don't ask again** 从循环中移除 auto
* `bypassPermissions`：在你使用 `--permission-mode bypassPermissions`、`--dangerously-skip-permissions` 或 `--allow-dangerously-skip-permissions` 启动后出现；`--allow-` 变体将该模式添加到循环中但不激活它
* `dontAsk`：永远不会出现在循环中；使用 `--permission-mode dontAsk` 设置

启用的可选模式排在 `plan` 之后，`bypassPermissions` 在前，`auto` 在后。如果两者都启用，你将在前往 `auto` 的途中经过 `bypassPermissions`。

**启动时**：将模式作为标志传递。

```bash
claude --permission-mode plan
```

**作为默认值**：在[设置](/zh/设置#设置文件)中设置 `defaultMode`。

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

相同的 `--permission-mode` 标志可用于 `-p` 进行[非交互式运行](/zh/headless)。

#### VS Code

**会话期间**：点击提示框底部的模式指示器。

**作为默认值**：在 VS Code 设置中设置 `claudeCode.initialPermissionMode`，或使用 Claude Code 扩展设置面板。

模式指示器显示以下标签，映射到每个标签应用的模式：

| UI 标签           | 模式                |
| :----------------- | :------------------ |
| Ask before edits   | `default`           |
| Edit automatically | `acceptEdits`       |
| Plan mode          | `plan`              |
| Auto mode          | `auto`              |
| Bypass permissions | `bypassPermissions` |

当你的帐户满足 [auto 模式部分](#使用-auto-模式消除提示)中列出的每个要求时，Auto 模式会出现在模式指示器中。`claudeCode.initialPermissionMode` 设置不接受 `auto`。要在默认情况下以 auto 模式启动，请改为在你的[用户设置](/zh/设置#设置文件)中设置 `defaultMode`。Claude Code 会忽略项目和本地设置中的 `defaultMode: "auto"`。

Bypass permissions 需要在扩展设置中启用 **Allow dangerously skip permissions** 开关后才会出现在模式指示器中。

有关扩展特定详情，请参阅 [VS Code 指南](/zh/vs-code)。

#### JetBrains

JetBrains 插件在 IDE 终端中运行 Claude Code，因此切换模式与 CLI 相同：按 `Shift+Tab` 循环切换，或在启动时传递 `--permission-mode`。

#### Desktop

使用发送按钮旁边的模式选择器。Auto 和 Bypass permissions 仅在你在 Desktop 设置中启用它们后才会出现。请参阅 [Desktop 指南](/zh/desktop#选择权限模式)。

#### Web 和移动端

在 [claude.ai/code](https://claude.ai/code) 或移动应用中使用提示框旁边的模式下拉菜单。权限提示会出现在 claude.ai 中供批准。出现哪些模式取决于会话运行的位置：

* [Web 上的 Claude Code](/zh/claude-code-on-the-web) 上的**云会话**：Auto accept edits 和 Plan mode。Ask permissions、Auto 和 Bypass permissions 不可用。
* 你本地机器上的 **[远程控制](/zh/remote-control) 会话**：Ask permissions、Auto accept edits 和 Plan mode。Auto 和 Bypass permissions 不可用。

对于远程控制，你也可以在启动主机时设置起始模式：

```bash
claude remote-control --permission-mode acceptEdits
```

## 使用 acceptEdits 模式自动批准文件编辑

`acceptEdits` 模式让 Claude 无需提示即可在你的工作目录中创建和编辑文件。此模式激活时，状态栏显示 `⏵⏵ accept edits on`。

除了文件编辑外，`acceptEdits` 模式还自动批准常用文件系统 Bash 命令：`mkdir`、`touch`、`rm`、`rmdir`、`mv`、`cp` 和 `sed`。这些命令在以安全环境变量（如 `LANG=C` 或 `NO_COLOR=1`）或进程包装器（如 `timeout`、`nice` 或 `nohup`）为前缀时也会被自动批准。与文件编辑一样，自动批准仅适用于工作目录或 `additionalDirectories` 内的路径。超出该范围的路径、写入[受保护路径](#受保护路径)以及所有其他 Bash 命令仍会提示。

当启用 [PowerShell 工具](/zh/tools-reference#powershell-tool)时，`acceptEdits` 模式还会自动批准范围内路径上的 `Set-Content`、`Add-Content`、`Clear-Content` 和 `Remove-Item` 及其常用别名。相同的范围和受保护路径规则适用。

当你想在编辑器中或通过 `git diff` 事后审查更改，而不是在每次编辑时在线批准时，请使用 `acceptEdits`。从默认模式按一次 `Shift+Tab` 进入，或直接启动：

```bash
claude --permission-mode acceptEdits
```

## 使用 plan 模式先分析再编辑

Plan 模式让 Claude 研究和提出更改而不执行它们。Claude 读取文件、运行 shell 命令进行探索并编写计划，但不编辑你的源代码。权限提示仍与默认模式相同。

按 `Shift+Tab` 或在单个提示前加 `/plan` 前缀进入 plan 模式。你也可以从 CLI 启动 plan 模式：

```bash
claude --permission-mode plan
```

再次按 `Shift+Tab` 可在不批准计划的情况下退出 plan 模式。

### 审查和批准计划

当计划准备好时，Claude 会呈现它并询问如何继续。从该提示中你可以：

* 批准并以 auto 模式开始
* 批准并接受编辑
* 批准并手动审查每个编辑
* 继续规划并提供反馈
* 使用 [Ultraplan](/zh/ultraplan) 进行基于浏览器的审查

批准计划会退出 plan 模式并将会话切换到每个批准选项描述的权限模式，这样 Claude 开始编辑。要再次规划，使用 `Shift+Tab` 循环回到 plan 模式，或在下一个提示前加 `/plan` 前缀。

按 `Ctrl+G` 在默认文本编辑器中打开提议的计划，可在 Claude 继续之前直接编辑。当启用 [`showClearContextOnPlanAccept`](/zh/设置#可用设置)时，每个批准选项还会提供先清除规划上下文的选项。

接受计划还会自动根据计划内容命名会话，除非你已使用 `--name` 或 `/rename` 设置了名称。

### 将 plan 模式设为默认值

要将 plan 模式设为项目的默认值，在 `.claude/settings.json` 中设置 `defaultMode`：

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

## 使用 auto 模式消除提示

Auto 模式需要 Claude Code v2.1.83 或更高版本。

Auto 模式让 Claude 无需权限提示即可执行。一个单独的分类器模型在操作运行前审查它们，阻止任何超出你请求范围、针对未识别基础设施或看起来由 Claude 读取的恶意内容驱动的操作。

Auto 模式还会促使 Claude 持续工作而不因澄清问题而停止，但当你的提示或技能明确依赖它时，Claude 仍会询问。要获得更强的自主行为同时保留权限提示，请改为设置[主动输出风格](/zh/output-styles)。

Auto 模式是一项研究预览。它减少提示但不保证安全。将其用于你信任总体方向的任务，而不是替代敏感操作的审查。

Auto 模式仅在你的帐户满足以下所有要求时可用：

* **计划**：所有计划。
* **管理员**：在 Team 和 Enterprise 上，管理员必须在 [Claude Code 管理设置](https://claude.ai/admin-settings/claude-code)中启用它，用户才能开启。管理员还可以通过在[托管设置](/zh/permissions#托管设置)中将 `permissions.disableAutoMode` 设置为 `"disable"` 来锁定关闭它。
* **模型**：Claude Opus 4.6 或更高版本，或 Sonnet 4.6。旧模型（包括 Sonnet 4.5、Opus 4.5、Haiku 和 claude-3 模型）不受支持。
* **提供商**：仅限 Anthropic API。在 Bedrock、Vertex 或 Foundry 上不可用。

如果 Claude Code 报告 auto 模式不可用，则其中一项要求未满足；这不是临时中断。一条命名模型并说 auto 模式"无法确定操作安全性"的消息是临时分类器中断；请参阅[错误参考](/zh/errors#auto-模式无法确定操作的安全性)。

如果你在[设置](/zh/设置#可用设置)中设置 `defaultMode: "auto"` 而会话以 `default` 模式启动且没有错误，则该设置可能在 `.claude/settings.json` 或 `.claude/settings.local.json` 中。Claude Code 忽略这些文件中的 `auto`，这样仓库不能给自己授予 auto 模式。将其移到 `~/.claude/settings.json`。

### 分类器默认阻止的内容

分类器信任你的工作目录和仓库配置的远程仓库。其他所有内容都被视为外部内容，直到你[配置受信任基础设施](/zh/auto-mode-config)。

**默认阻止**：

* 下载并执行代码，如 `curl | bash`
* 将敏感数据发送到外部端点
* 生产部署和迁移
* 云存储上的批量删除
* 授予 IAM 或仓库权限
* 修改共享基础设施
* 不可逆地销毁会话之前存在的文件
* 强制推送或直接推送到 `main`

**默认允许**：

* 工作目录中的本地文件操作
* 安装在锁文件或清单中声明的依赖项
* 读取 `.env` 并将凭据发送到其匹配的 API
* 只读 HTTP 请求
* 推送到你开始的分支或 Claude 创建的分支

沙箱网络访问请求通过分类器路由，而不是默认允许。运行 `claude auto-mode defaults` 查看完整规则列表。如果常规操作被阻止，管理员可以通过 `autoMode.environment` 设置添加受信任的仓库、存储桶和服务：请参阅[配置 auto 模式](/zh/auto-mode-config)。

### 你在对话中声明的边界

分类器将你在对话中声明的边界视为阻止信号。如果你告诉 Claude"不要推送"或"等我审查后再部署"，即使默认规则允许，分类器也会阻止匹配的操作。边界在你在后续消息中解除之前一直有效。Claude 自己判断条件已满足不会解除它。

边界不会作为规则存储。分类器在每次检查时从对话记录中重新读取它们，因此如果[上下文压缩](/zh/成本#减少-token-使用)移除了声明边界的消息，边界可能会丢失。要获得硬保证，请改为添加[拒绝规则](/zh/permissions#权限规则语法)。

### auto 模式回退时

每个被拒绝的操作显示通知并出现在 `/permissions` 的"最近拒绝"标签下，你可以按 `r` 用手动批准重试。

如果分类器连续 3 次或总共 20 次阻止操作，auto 模式暂停，Claude Code 恢复提示。批准被提示的操作会恢复 auto 模式。这些阈值不可配置。任何允许的操作重置连续计数器，而总计数器在会话期间持续存在，仅在达到自身限制触发回退时重置。

在带 `-p` 标志的[非交互式模式](/zh/headless)中，重复阻止会中止会话，因为没有用户可提示。

重复阻止通常意味着分类器缺少关于你的基础设施的上下文。使用 `/feedback` 报告误报，或让管理员[配置受信任基础设施](/zh/auto-mode-config)。

**分类器如何评估操作**

每个操作经过固定的决策顺序。第一个匹配的步骤生效：

1. 与你的[允许或拒绝规则](/zh/permissions#管理权限)匹配的操作立即解析
2. 只读操作和工作目录中的文件编辑被自动批准，写入[受保护路径](#受保护路径)的除外
3. 其他所有操作交给分类器
4. 如果分类器阻止，Claude 收到原因并尝试替代方案

进入 auto 模式时，授予任意代码执行的宽泛允许规则会被丢弃：

* 全包式 `Bash(*)` 或 `PowerShell(*)`
* 带通配符的解释器如 `Bash(python*)`
* 包管理器运行命令
* `Agent` 允许规则

像 `Bash(npm test)` 这样的窄规则会保留。离开 auto 模式时，被丢弃的规则会被恢复。

分类器看到用户消息、工具调用和你的 CLAUDE.md 内容。工具结果被剥离，因此文件或网页中的恶意内容不能直接操纵它。一个单独的服务端探针扫描传入的工具结果并在 Claude 读取之前标记可疑内容。有关这些层如何协同工作的更多信息，请参阅 [auto 模式公告](https://claude.com/blog/auto-mode)和[工程深入解析](https://www.anthropic.com/engineering/claude-code-auto-mode)。

**auto 模式如何处理子代理**

分类器在三个点检查[子代理](/zh/sub-agents)工作：

1. 在子代理启动之前，评估委托的任务描述，因此看起来危险的任务在生成时就被阻止。
2. 子代理运行时，其每个操作都通过分类器，使用与父会话相同的规则，子代理 frontmatter 中的任何 `permissionMode` 都被忽略。
3. 子代理完成时，分类器审查其完整操作历史；如果返回检查标记了问题，安全警告会被前置到子代理的结果中。

**成本和延迟**

分类器在服务器配置的模型上运行，与你的 `/model` 选择无关，因此切换模型不会改变分类器可用性。分类器调用计入你的 token 使用量。每次检查发送部分对话记录加上待处理的操作，在执行前增加一个往返。受保护路径之外的读取和工作目录编辑跳过分类器，因此开销主要来自 shell 命令和网络操作。

## 使用 dontAsk 模式仅允许预批准的工具

`dontAsk` 模式自动拒绝每个原本会提示的工具调用。只有与你的 `permissions.allow` 规则和[只读 Bash 命令](/zh/permissions#只读命令)匹配的操作才能执行；显式 `ask` 规则被拒绝而不是提示。这使得该模式对 CI 管道或受限环境完全非交互式，你可以预先定义 Claude 可以执行的操作。

在启动时使用标志设置：

```bash
claude --permission-mode dontAsk
```

## 使用 bypassPermissions 模式跳过所有检查

`bypassPermissions` 模式禁用权限提示和安全检查，以便工具调用立即执行。从 v2.1.126 开始，这包括写入[受保护路径](#受保护路径)，早期版本仍会提示。针对文件系统根目录或主目录的删除（如 `rm -rf /` 和 `rm -rf ~`）仍会提示，作为防止模型错误的断路器。仅在隔离环境（如容器、虚拟机或没有互联网访问的开发容器）中使用此模式，这样 Claude Code 无法损坏你的主机系统。

你无法从未使用启用标志之一启动的会话进入 `bypassPermissions`；请使用其中一个重新启动以启用：

```bash
claude --permission-mode bypassPermissions
```

`--dangerously-skip-permissions` 标志等效。

在 Linux 和 macOS 上，当以 root 或 `sudo` 运行时，Claude Code 拒绝以该模式启动：

```text
--dangerously-skip-permissions cannot be used with root/sudo privileges for security reasons
```

在已识别的沙箱内自动跳过该检查。要在容器中自主运行，请使用[开发容器](/zh/devcontainer)配置，它以非 root 用户运行 Claude Code。

`bypassPermissions` 不提供对提示注入或意外操作的保护。要获得无提示的后台安全检查，请改为使用 [auto 模式](#使用-auto-模式消除提示)。管理员可以通过在[托管设置](/zh/permissions#托管设置)中将 `permissions.disableBypassPermissionsMode` 设置为 `"disable"` 来阻止此模式。

## 受保护路径

在除 `bypassPermissions` 之外的每种模式中，写入一小组路径永远不会被自动批准。这可以防止仓库状态和 Claude 自身配置的意外损坏。在 `default`、`acceptEdits` 和 `plan` 中，这些写入会提示；在 `auto` 中，它们路由到分类器；在 `dontAsk` 中，它们被拒绝；在 `bypassPermissions` 中，它们被允许。

受保护目录：

* `.git`
* `.vscode`
* `.idea`
* `.husky`
* `.cargo`
* `.claude`，但 `.claude/commands`、`.claude/agents`、`.claude/skills` 和 `.claude/worktrees` 除外，Claude 在这些目录中常规创建内容

受保护文件：

* `.gitconfig`、`.gitmodules`
* `.bashrc`、`.bash_profile`、`.zshrc`、`.zprofile`、`.profile`
* `.ripgreprc`
* `.mcp.json`、`.claude.json`

## 另请参阅

* [权限](/zh/permissions)：允许、询问和拒绝规则；托管策略
* [配置 auto 模式](/zh/auto-mode-config)：告诉分类器你的组织信任哪些基础设施
* [钩子](/zh/hooks)：通过 `PreToolUse` 和 `PermissionRequest` 钩子自定义权限逻辑
* [Ultraplan](/zh/ultraplan)：在 Web 会话中的 Claude Code 运行 plan 模式并进行基于浏览器的审查
* [安全](/zh/security)：保障措施和最佳实践
* [沙箱](/zh/sandboxing)：Bash 命令的文件系统和网络隔离
* [非交互式模式](/zh/headless)：使用 `-p` 标志运行 Claude Code
