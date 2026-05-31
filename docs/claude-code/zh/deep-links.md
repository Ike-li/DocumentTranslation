> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引。
> 使用此文件可在进一步探索前发现所有可用页面。

# 通过链接启动会话

> 从 URL 打开 Claude Code 终端会话。将 `claude-cli://` 链接嵌入操作手册、警报和仪表板，使点击操作能够在正确的仓库中打开 Claude Code 并带有正确的提示词。

深度链接是一个 `claude-cli://` URL，它会在新的终端窗口中打开 Claude Code。该 URL 可以携带工作目录和用于预填充的提示词。

这使得您可以分享一个任务的一键起点：任何安装了 Claude Code 并点击该链接的用户，都会看到一个会话被打开，其中提示词已经输入好。提示词会被填充，但直到您按下回车键才会发送。

由于深度链接是一个 URL，您可以在任何可以放置链接的地方使用它：

*   一个事件操作手册步骤，打开受影响服务的仓库并附带诊断提示词
*   一个监控警报或仪表板，链接到特定指标的调查提示词
*   一个 README 或 Wiki 页面，使用入门提示词打开项目
*   一个 CI 失败通知，预填充失败作业的名称

本页介绍了如何[构建链接](#构建链接)、[在操作手册中嵌入链接或从 shell 触发](#示例)，以及如何在每个平台上[管理或禁用处理器注册]。

  深度链接需要 Claude Code v2.1.91 或更高版本。

## 工作原理

`claude-cli://` 前缀是 Claude Code 向您的操作系统注册的自定义 URL 协议，类似于 `mailto:` 链接用于打开您的电子邮件客户端。该链接可以存在于网页、Wiki、Slack 消息或任何能够渲染链接的应用程序中。当您点击其中一个链接时：

1. 浏览器或应用程序会将 URL 传递给您的操作系统。
2. 操作系统识别 `claude-cli://` 前缀，并在您的机器上启动 Claude Code。
3. 一个新的终端窗口打开，Claude Code 在链接指定的目录中运行，并且链接的提示词文本已预先填入输入框。
4. 您阅读提示词，如需可进行编辑，然后按 Enter 键发送。

链接本身可以托管在任何地方，但会话始终在您点击的本地计算机上打开。有关每个操作系统上打开的终端模拟器，请参见[注册和支持的平台](#注册与支持平台)。

  显示该链接的平台必须允许自定义URL协议。GitHub渲染的Markdown支持`http`和`https`，但会剥离README、议题、拉取请求和维基中的`claude-cli://`等协议。此时只会显示链接文本，背后无实际链接且URL被隐藏。参见[故障排除](#链接显示为纯文本而无法点击)了解解决方法。

### 已启动会话的显示内容

深度链接本身不会执行任何操作。它仅负责选择目录并填充提示词输入框。如果你点击来自不可信页面的链接，填充的提示词仍处于待激活状态：在你阅读所填充的内容并按下回车键之前，不会有任何信息发送给模型。

当会话打开时，输入框上方的横幅会显示该会话由外部链接启动，并指明其选择的目录。对于超过 1,000 个字符的提示词，横幅会提醒你在按回车键前滚动查看完整文本，因为较长的提示词可能会将指令推离屏幕。所选目录的权限规则、`CLAUDE.md` 文件以及信任提示词的应用方式与其他任何会话相同。

## 构建链接

每个深度链接都以 `claude-cli://open` 开头，这是处理器接受的唯一路径，后面可跟随可选的查询参数。最简形式会打开 Claude Code 并定位到你的主目录，同时提示词输入框为空：
```text
claude-cli://open
```
添加参数以控制会话启动位置和提示框内容：

| 参数      | 描述                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`       | 预填入提示框的文本。请对值进行 [URL编码](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)。在多行提示词中使用 `%0A` 表示换行。最多 5,000 个字符。 |
| `cwd`     | 用作工作目录的绝对路径。网络路径和 UNC 路径将被拒绝。                                                                                                                                                          |
| `repo`    | GitHub `所有者/名称` 格式的标识符。Claude Code 会将其解析为之前克隆过的本地副本并从该位置启动。如果没有匹配的克隆，会话将在您的主目录中打开。                                                  |

`cwd` 和 `repo` 是[设置工作目录的两种方式](#选择-cwd-还是-repo)。如果同时传递两者，`cwd` 优先，`repo` 将被忽略，即使 `cwd` 路径不存在也是如此。

以下链接指向名为 `acme/payments` 的仓库，并附带两行诊断提示词。当您构建自己的链接时，请将 `acme/payments` 替换为您的仓库的 `所有者/名称` 标识符：
```text
claude-cli://open?repo=acme/payments&q=Investigate%20the%20failed%20deploy%20of%20payments-api.%0ACheck%20recent%20commits%20to%20main%20and%20the%20last%20successful%20build.
```
点击它会打开一个新的终端窗口，在本地 `acme/payments` 仓库的克隆中启动 Claude Code，并在提示框中填入解码后的文本：
```text
Investigate the failed deploy of payments-api.
Check recent commits to main and the last successful build.
```
您可以在按下回车发送前编辑提示词。如果您没有本地克隆的仓库，会话将在您的主目录中打开。当您拥有多个克隆或工作树时，请参阅[选择 `cwd` 还是 `repo`](#选择-cwd-还是-repo) 以了解如何选择本地路径。

### 选择 `cwd` 还是 `repo`

当所有点击链接的人都将项目放在相同的绝对路径（例如标准化的开发容器或虚拟机映像）时，使用 `cwd`。

当链接被共享且每个人克隆到不同位置时，使用 `repo`。Claude Code 会按以下方式将标识解析为本地路径：

*   每次您在 Git 仓库中运行 `claude` 时，该目录的文件系统路径会与仓库的 GitHub `owner/name` 标识关联记录。
*   当深度链接到达时，`repo` 会打开您最近使用过的匹配路径。多个克隆和工作树会被单独跟踪，因此它会选择您最后工作过的那个。
*   此查找仅能找到您至少运行过一次 Claude Code 的路径。
*   该链接不会改变当前检出的分支。会话将在该目录当前状态下打开。

启动的会话会显示它选择的路径以及该克隆最后一次从远程拉取的时间，因此您可以看出查看的是否是过时的代码。

## 示例

以下部分展示了使用深度链接的两种常见方式：在文档中作为 Markdown 链接，以及在脚本或 Shell 别名中作为命令。

### 在运行手册中嵌入链接

运行手册中的深度链接为负责排查问题的人员提供了一键启动调查的方式，能够在正确的仓库中使用准备好的提示词。渲染运行手册的平台必须允许自定义 URL 方案。GitHub 渲染的 Markdown 不允许使用 `claude-cli://`，因此 GitHub README、issue 或 wiki 中的深度链接仅显示其标签，没有可点击的链接。有关解决方法，请参阅[故障排除说明](#链接显示为纯文本而无法点击)。

提示词是 URL 的一部分，必须经过 URL 编码。要生成编码值，请在浏览器控制台或任何 URL 编码器中将您的提示文本通过 `encodeURIComponent` 处理。

以下示例为一个名为 `web-gateway` 的服务的事件运行手册添加了一个调查入口点：
```markdown
## High 5xx rate on web-gateway

1. Acknowledge the page in PagerDuty.
2. [Open Claude Code in the gateway repo](claude-cli://open?repo=acme/web-gateway&q=5xx%20rate%20is%20elevated%20on%20web-gateway.%20Check%20recent%20deploys%2C%20error%20logs%20from%20the%20last%2030%20minutes%2C%20and%20open%20incidents%20in%20Linear.)
3. Post initial findings in #incident.
```
要在您自己的操作手册中使用此功能，请将 `acme/web-gateway` 替换为您的服务仓库 slug。这允许安装了 Claude Code 并且本地克隆了该仓库的工程师能够点击步骤 2，并立即开始使用准备好的提示词进行调查。

### 从 shell 打开链接

您也可以通过 shell 脚本、别名或自动化流程来打开深度链接，而无需点击它。只需将链接作为参数传递给操作系统的 URL 打开命令即可。


    内置的 `open` 命令会将 URL 传递给已注册的 `claude-cli://` 处理程序。
    ```bash
    open "claude-cli://open?repo=acme/payments&q=review%20open%20PRs"
    ```



    大多数桌面环境都提供 `xdg-open`，它会将 URL 传递给已注册的处理程序：
    ```bash
    xdg-open "claude-cli://open?repo=acme/payments&q=review%20open%20PRs"
    ```



    在PowerShell中，`Start-Process` 会将URL传递给系统注册的处理程序：
    ```powershell
    Start-Process "claude-cli://open?repo=acme/payments&q=review%20open%20PRs"
    ```
    在 `cmd.exe` 中，`start` 命令会将其第一个带引号的参数视为窗口标题，因此在 URL 之前需要传递一个空标题：
    ```cmd
    start "" "claude-cli://open?repo=acme/payments&q=review%20open%20PRs"
    ```


## 注册与支持平台

Claude Code 首次在 macOS、Linux 和 Windows 上启动交互式会话时，会向操作系统注册 `claude-cli://` 处理程序。您无需运行单独的安装命令。注册仅写入用户级别的位置：

| 平台    | 处理程序位置                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| macOS   | `~/Applications/Claude Code URL Handler.app`                                                                |
| Linux   | 位于 `$XDG_DATA_HOME/applications`（默认为 `~/.local/share/applications`）下的 `claude-code-url-handler.desktop` |
| Windows | `HKEY_CURRENT_USER\Software\Classes\claude-cli`                                                             |

该处理程序在检测到的终端模拟器中启动 Claude Code。在 macOS 上，Claude Code 会记住您最近一次交互式会话使用的终端并重复使用，支持 iTerm2、Ghostty、kitty、Alacritty、WezTerm 和 Terminal.app。在 Linux 上，它会依次检查 `$TERMINAL` 环境变量、`x-terminal-emulator`，然后是一份常见模拟器列表。在 Windows 上，它优先选择 Windows Terminal，其次是 PowerShell，然后是 `cmd.exe`。

若要完全阻止注册，请在 `settings.json` 中将 [`disableDeepLinkRegistration`](/zh/settings) 设置为 `"disable"`。要在组织范围内强制执行此设置以防止用户重新启用，请改在[托管设置](/zh/server-managed-settings)中进行配置。

## 在 VS Code 标签页中打开（而非终端）

VS Code 扩展在 `vscode://anthropic.claude-code/open` 注册了自己的处理程序，它会打开一个 Claude Code 编辑器标签页，而不是终端窗口。有关该 URL 的参数，请参阅[从其他工具启动 VS Code 标签页](/zh/vs-code#launch-a-vs-code-tab-from-other-tools)。

## 故障排除

### 点击链接后无反应

处理程序可能尚未注册。在该机器上启动一次交互式 `claude` 会话，退出，然后再次尝试点击链接。如果您使用的是没有桌面环境的 Linux 系统，`xdg-open` 可能没有可调度的对象。

### 链接显示为纯文本而无法点击

某些 Markdown 渲染器只允许 `http` 和 `https` 链接，并会剥离其他 URL 协议。GitHub 在 README、议题、拉取请求和 Wiki 中就会这样：`[label](claude-cli://...)` 会渲染为仅显示 `label`，没有链接且 URL 被移除。在这些平台上，请将深度链接放在代码块中，以便读者可以看到 URL 并将其粘贴到浏览器的地址栏中。

### 会话在我的主目录而非仓库中打开

`repo` 参数仅解析为 Claude Code 已经识别过的克隆仓库。请在该克隆仓库内运行一次 `claude` 以记录其路径，或者将链接更改为使用 `cwd` 并指定绝对路径。

### 链接打开了错误的终端

在 macOS 上，在您首选的终端中启动一次 `claude`，下次深度链接将使用该终端。在 Linux 上，将 `$TERMINAL` 环境变量设置为您首选模拟器的命令名称。在 Windows 上，顺序是固定的：如果您希望链接在 Windows Terminal 中打开而不是在 PowerShell 或 `cmd.exe` 窗口中打开，请安装 Windows Terminal。

## 了解更多

以下页面介绍了启动或扩展 Claude Code 会话的相关方式：

* [技能](/zh/skills)：将长篇的运行手册提示词存储为仓库中的 `/skill`，这样深度链接的 `q` 参数只需引用其名称即可。
* [非交互模式](/zh/headless)：从脚本运行 Claude 并捕获输出，而无需打开终端。