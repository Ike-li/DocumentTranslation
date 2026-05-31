> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进行深入探索。

# 在网页上开始使用 Claude Code

> 从浏览器或手机在云端运行 Claude Code。连接 GitHub 仓库，提交任务，审查 PR，无需本地配置。

网页版 Claude Code 目前处于研究预览阶段，面向 Pro、Max 和 Team 用户，以及拥有高级席位或 Chat + Claude Code 席位的企业用户开放。

网页版 Claude Code 运行在 Anthropic 管理的云基础设施上，而非你的本地机器。在浏览器中访问 [claude.ai/code](https://claude.ai/code) 或使用 Claude 移动应用提交任务。

你需要一个 GitHub 仓库才能[开始使用](#连接-github-并创建环境)。Claude 会将其克隆到一个隔离的虚拟机中，进行修改，然后推送一个分支供你审查。会话会跨设备保持，因此你在笔记本电脑上启动的任务可以稍后在手机上审查。

网页版 Claude Code 适用于以下场景：

* **并行任务**：同时运行多个独立任务，每个任务在自己的会话和分支中，无需管理多个工作树
* **本地没有的仓库**：Claude 每次会话都会重新克隆仓库，因此你不需要本地检出
* **不需要频繁指导的任务**：提交一个明确定义的任务，去做其他事情，完成后审查结果
* **代码问题和探索**：理解代码库或追踪功能实现，无需本地检出

对于需要本地配置、工具或环境的工作，本地运行 Claude Code 或使用[远程控制](/zh/remote-control)更合适。

## 会话如何运行

当你提交任务时：

1. **克隆和准备**：你的仓库被克隆到 Anthropic 管理的虚拟机上，如果配置了[启动脚本](/zh/claude-code-on-the-web#setup-scripts)，则会运行。
2. **配置网络**：根据你环境的[访问级别](/zh/claude-code-on-the-web#access-levels)设置互联网访问。
3. **工作**：Claude 分析代码、进行修改、运行测试并检查其工作。你可以全程观察和指导，或者离开并在完成时回来。
4. **推送分支**：当 Claude 达到一个停止点时，它会将分支推送到 GitHub。你审查差异、留下行内评论、创建 PR，或发送另一条消息继续工作。

当分支推送后，会话不会关闭。PR 创建和后续编辑都在同一个对话中进行。

## 比较 Claude Code 的运行方式

Claude Code 在各处的行为相同。变化的是代码执行的位置以及你的本地配置是否可用。桌面应用同时提供本地和云端会话，因此以下答案取决于你选择哪种方式：

|                                              | 网页版                                                                                                          | 远程控制                     | 终端 CLI               | 桌面应用                    |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------- | :--------------------- | :-------------------------- |
| **代码运行在**                               | Anthropic 云端虚拟机                                                                                            | 你的机器                     | 你的机器               | 你的机器或云端虚拟机        |
| **你从哪里聊天**                             | claude.ai 或移动应用                                                                                            | claude.ai 或移动应用         | 你的终端               | 桌面 UI                     |
| **使用本地配置**                             | 否，仅仓库                                                                                                      | 是                           | 是                     | 本地是，云端否              |
| **需要 GitHub**                              | 是，或通过 `--remote` [打包本地仓库](/zh/claude-code-on-the-web#send-local-repositories-without-github)         | 否                           | 否                     | 仅云端会话需要              |
| **断开连接后继续运行**                       | 是                                                                                                              | 终端保持打开时               | 否                     | 取决于会话类型              |
| **[权限模式](/zh/permission-modes)**         | 自动接受编辑、计划                                                                                              | 询问、自动接受编辑、计划     | 所有模式               | 取决于会话类型              |
| **网络访问**                                 | 按环境可配置                                                                                                    | 你的机器网络                 | 你的机器网络           | 取决于会话类型              |

请参阅[终端快速入门](/zh/quickstart)、[桌面应用](/zh/desktop)或[远程控制](/zh/remote-control)文档来设置这些方式。

## 连接 GitHub 并创建环境

设置是一次性过程。如果你已经在使用 GitHub CLI，可以[从终端完成](#从终端连接)而不是浏览器。

1. **访问 claude.ai/code**：前往 [claude.ai/code](https://claude.ai/code) 并使用你的 Anthropic 账户登录。

2. **安装 Claude GitHub 应用**：登录后，claude.ai/code 会提示你连接 GitHub。按照提示安装 Claude GitHub 应用并授予其对仓库的访问权限。云端会话与现有 GitHub 仓库配合使用，因此要开始新项目，请先[在 GitHub 上创建一个空仓库](https://github.com/new)。

3. **创建你的环境**：连接 GitHub 后，系统会提示你创建云端环境。环境控制 Claude 在会话期间的网络访问权限以及创建新会话时运行的内容。请参阅[已安装工具](/zh/claude-code-on-the-web#installed-tools)了解无需任何配置即可使用的工具。

   表单包含以下字段：

   * **名称**：显示标签。当你为不同项目或访问级别拥有多个环境时很有用。
   * **网络访问**：控制会话可以访问互联网的哪些内容。默认值 `Trusted` 允许连接到 [npm、PyPI 和 RubyGems 等常用包注册表](/zh/claude-code-on-the-web#default-allowed-domains)，同时阻止一般互联网访问。
   * **环境变量**：可选变量，在每个会话中可用，`.env` 格式。不要用引号包裹值，因为引号会作为值的一部分存储。这些变量对任何可以编辑此环境的人可见。
   * **启动脚本**：在 Claude Code 启动前运行的可选 Bash 脚本。用于安装云虚拟机未包含的系统工具，如 `apt install -y gh`。结果会被[缓存](/zh/claude-code-on-the-web#environment-caching)，因此脚本不会在每次会话时重新运行。请参阅[启动脚本](/zh/claude-code-on-the-web#setup-scripts)获取示例和调试技巧。

   对于第一个项目，保留默认值并点击**创建环境**。你可以[稍后编辑或创建额外的环境](/zh/claude-code-on-the-web#configure-your-environment)用于不同项目。

### 从终端连接

如果你已经在使用 GitHub CLI (`gh`)，可以在不打开浏览器的情况下设置网页版 Claude Code。这需要 [Claude Code CLI](/zh/quickstart)。`/web-setup` 读取你本地的 `gh` 令牌，将其链接到你的 Claude 账户，并在你没有云端环境时创建一个默认的云端环境。

启用了[零数据保留](/zh/zero-data-retention)的组织不能使用 `/web-setup` 或其他云端会话功能。如果 GitHub CLI 未安装或未认证，`/web-setup` 会打开浏览器引导流程。

1. **使用 GitHub CLI 认证**：在你的 shell 中，如果尚未认证 GitHub CLI，请先进行认证：

   ```bash
   gh auth login
   ```

2. **登录 Claude**：在 Claude Code CLI 中，运行 `/login` 使用你的 claude.ai 账户登录。如果已登录则跳过此步骤。

3. **运行 /web-setup**：在 Claude Code CLI 中，运行：

   ```text
   /web-setup
   ```

   这会将你的 `gh` 令牌同步到 Claude 账户。如果你还没有云端环境，`/web-setup` 会创建一个具有 Trusted 网络访问权限且无启动脚本的环境。你可以[稍后编辑环境或添加变量](/zh/claude-code-on-the-web#configure-your-environment)。完成后，你可以使用 [`--remote`](/zh/claude-code-on-the-web#from-terminal-to-web) 从终端启动云端会话，或使用 [`/schedule`](/zh/routines) 设置定期任务。

## 启动任务

连接 GitHub 并创建环境后，你就可以提交任务了。

1. **选择仓库和分支**：从 [claude.ai/code](https://claude.ai/code) 或 Claude 移动应用的 Code 标签页，点击输入框下方的仓库选择器，选择一个仓库让 Claude 在其中工作。每个仓库显示一个分支选择器。更改它以从功能分支而不是默认分支启动 Claude。你可以添加多个仓库在一个会话中跨仓库工作。

2. **选择权限模式**：输入框旁边的模式下拉菜单默认为**自动接受编辑**，Claude 会进行修改并推送分支，无需停下来等待批准。如果你想让 Claude 提出方案并在编辑文件前等待你的确认，请切换到**计划模式**。云端会话不提供询问权限、自动模式或绕过权限。请参阅[权限模式](/zh/permission-modes)了解完整列表。

3. **描述任务并提交**：输入你想要的描述并按 Enter。请具体：

   * 指定文件或函数名："添加一个包含设置说明的 README" 或 "修复 `tests/test_auth.py` 中失败的认证测试" 比 "修复测试" 更好
   * 如果有错误输出，请粘贴
   * 描述预期行为，而不仅仅是症状

   Claude 克隆仓库，如果配置了启动脚本则运行，然后开始工作。每个任务都有自己的会话和分支，因此你不需要等待一个完成后再开始另一个。

## 预填充会话

你可以通过在 [claude.ai/code](https://claude.ai/code) URL 中添加查询参数来预填充新会话的提示词、仓库和环境。可以用此来构建集成，例如在问题跟踪器中创建一个按钮，点击后打开 Claude Code 并将问题描述作为提示词。

| 参数           | 描述                                                                                                                                                             |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`       | 在输入框中预填充的提示词文本。也接受别名 `q`。                                                                                                                   |
| `prompt_url`   | 从中获取提示词文本的 URL，适用于太长而无法嵌入查询字符串的提示词。该 URL 必须允许跨域请求。当同时设置了 `prompt` 时会被忽略。                                      |
| `repositories` | 逗号分隔的 `owner/repo` 列表，用于预选。也接受别名 `repo`。                                                                                                       |
| `environment`  | 要预选的[环境](#连接-github-并创建环境)的名称或 ID。                                                                                                             |

对每个值进行 URL 编码。以下示例打开表单时已预选了提示词和仓库：

```text
https://claude.ai/code?prompt=Fix%20the%20login%20bug&repositories=acme/webapp
```

## 审查和迭代

Claude 完成后，审查更改，在特定行留下反馈，继续迭代直到差异看起来正确。

1. **打开差异视图**：差异指示器显示会话中添加和删除的行，例如 `+42 -18`。选择它打开差异视图，左侧是文件列表，右侧是更改。

2. **留下行内评论**：选择差异中的任意行，输入你的反馈，然后按 Enter。评论会排队等待，直到你发送下一条消息，然后它们会一起打包发送。Claude 会看到 "在 `src/auth.ts:47`，不要在这里捕获错误" 以及你的主要指令，因此你不必描述问题所在。

3. **创建拉取请求**：当差异看起来正确时，在差异视图顶部选择**创建 PR**。你可以将其作为完整 PR、草稿打开，或跳转到 GitHub 的编写页面，其中包含生成的标题和描述。

4. **PR 后继续迭代**：创建 PR 后会话仍然活跃。将 CI 失败输出或审查者评论粘贴到聊天中，要求 Claude 处理。要让 Claude 自动监控 PR，请参阅[自动修复拉取请求](/zh/claude-code-on-the-web#auto-fix-pull-requests)。

## 故障排除

### 连接 GitHub 后没有显示仓库

云端会话可以使用连接的 GitHub 账户能看到的任何仓库，无论 Claude GitHub 应用安装在哪些仓库上。如果缺少某个仓库，请验证连接的 GitHub 账户在 GitHub 上是否有访问权限。如果你还想为某个仓库启用[自动修复](/zh/claude-code-on-the-web#auto-fix-pull-requests)，请在 github.com 上打开 **Settings -> Applications -> Claude -> Configure** 并验证该仓库是否列在 **Repository access** 下。私有仓库需要与公共仓库相同的授权。

### 页面只显示 GitHub 登录按钮

云端会话需要连接的 GitHub 账户。通过上述浏览器流程连接，或者如果你使用 GitHub CLI，请从终端运行 `/web-setup`。如果你根本不想连接 GitHub，请参阅[远程控制](/zh/remote-control)在你自己的机器上运行 Claude Code 并从网页监控。

### "Not available for the selected organization"

企业组织可能需要管理员启用网页版 Claude Code。请联系你的 Anthropic 客户团队。

### `/web-setup` 返回 "Unknown command"

`/web-setup` 在 Claude Code CLI 内运行，而不是在你的 shell 中。先启动 `claude`，然后在提示符下输入 `/web-setup`。

如果你在 Claude Code 内输入后仍然看到错误，你的 CLI 版本低于 v2.1.80，或者你使用 API 密钥或第三方提供商认证，而不是 claude.ai 订阅。运行 `claude update`，然后 `/login` 使用你的 claude.ai 账户登录。

### 使用 `--remote` 或 ultraplan 时出现 "Could not create a cloud environment" 或 "No cloud environment available"

远程会话功能在你没有云端环境时会自动创建一个默认的云端环境。如果你看到 "Could not create a cloud environment"，说明自动创建失败了。{/* max-version: 2.1.100 */}如果你看到 "No cloud environment available"，说明你的 CLI 版本早于自动创建功能。无论哪种情况，请在 Claude Code CLI 中运行 `/web-setup` 手动创建一个，或访问 [claude.ai/code](https://claude.ai/code) 并按照上述**创建你的环境**步骤操作。

### 启动脚本失败

启动脚本以非零状态退出，阻止了会话启动。常见原因：

* 包安装失败，因为注册表不在你的[网络访问级别](/zh/claude-code-on-the-web#access-levels)内。`Trusted` 覆盖大多数包管理器；`None` 阻止所有。
* 脚本引用了新克隆中不存在的文件或路径。
* 在本地工作的命令在 Ubuntu 上需要不同的调用方式。

要调试，请在脚本顶部添加 `set -x` 以查看哪个命令失败了。对于非关键命令，附加 `|| true` 使其不会阻止会话启动。

### 新会话在设置期间挂起或超时

如果新会话在启动脚本步骤停滞，或在脚本完成前因通用容器错误而失败，脚本可能超过了大约五分钟的[环境缓存](/zh/claude-code-on-the-web#environment-caching)构建时间预算。拉取大型 Docker 镜像、同步完整依赖树或下载模型权重等重量级步骤经常使总时间超出限制，尤其是在它们一个接一个运行时。

要解决此问题，请精简脚本使其可靠地在五分钟内完成：

* 使用 `&` 和最后的 `wait` 并行运行独立安装，而不是串行运行。
* 将最大的下载从启动脚本移到 [SessionStart 钩子](/zh/claude-code-on-the-web#setup-scripts-vs-sessionstart-hooks)中，在后台启动它们，这样会话在它们完成时就可用。
* 从启动脚本中移除长时间的重试等待，因为停滞的重试循环会占用时间预算。

### 关闭标签页后会话继续运行

这是设计如此。关闭标签页或导航离开不会停止会话。它会在后台继续运行，直到 Claude 完成当前任务，然后空闲。从侧边栏，你可以[归档会话](/zh/claude-code-on-the-web#archive-sessions)将其从列表中隐藏，或[删除会话](/zh/claude-code-on-the-web#delete-sessions)永久移除。

## 后续步骤

现在你可以提交和审查任务了，这些页面涵盖了接下来的内容：从终端启动云端会话、安排定期工作以及给 Claude 常驻指令。

* [使用网页版 Claude Code](/zh/claude-code-on-the-web)：完整参考，包括将会话传送到终端、启动脚本、环境变量和网络配置
* [例程](/zh/routines)：通过计划、API 调用或响应 GitHub 事件来自动化工作
* [CLAUDE.md](/zh/memory)：给 Claude 持久指令和上下文，在每次会话开始时加载
* 安装 Claude 移动应用 [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) 或 [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)，从手机监控会话。在 Claude Code CLI 中，`/mobile` 显示二维码。
