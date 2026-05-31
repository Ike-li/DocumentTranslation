> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入探索。

# 为 Claude Code 配置终端

> 修复 Shift+Enter 换行问题、在 Claude 完成时获得终端响铃、配置 tmux、匹配颜色主题，以及在 Claude Code CLI 中启用 Vim 模式。

Claude Code 无需配置即可在任何终端中工作。本页面适用于某些特定功能未按预期运行的情况。请在下方找到你的症状。如果一切正常，你不需要本页面。

* [Shift+Enter 提交而非插入换行](#输入多行提示词)
* [Option 键快捷方式在 macOS 上无效](#在-macos-上启用-option-键快捷方式)
* [Claude 完成时没有声音或提醒](#获取终端响铃或通知)
* [你在 tmux 内运行 Claude Code]
* [显示闪烁或回滚跳动](#切换到全屏渲染)
* [你想在提示词中使用 Vim 按键](#使用-vim-按键绑定编辑提示词)

本页面介绍如何让终端向 Claude Code 发送正确的信号。要更改 Claude Code 本身响应的按键，请参阅[按键绑定](/zh/keybindings)。

## 输入多行提示词

按下 Enter 会提交你的消息。要插入换行而不提交，请按 Ctrl+J，或输入 `\` 然后按 Enter。这两种方法在任何终端中都无需设置即可使用。

在大多数终端中，你也可以按 Shift+Enter，但支持程度因终端模拟器而异：

| 终端                                                                | Shift+Enter 换行支持                        |
| :---------------------------------------------------------------------- | :------------------------------------------ |
| Ghostty、Kitty、iTerm2、WezTerm、Warp、Apple Terminal、Windows Terminal | 无需设置即可使用                         |
| VS Code、Cursor、Windsurf、Alacritty、Zed                               | 运行一次 `/terminal-setup` 即可                  |
| gnome-terminal、JetBrains IDE（如 PyCharm 和 Android Studio）       | 不可用；请使用 Ctrl+J 或 `\` 然后按 Enter |

对于 VS Code、Cursor、Windsurf、Alacritty 和 Zed，`/terminal-setup` 会将 Shift+Enter 和其他按键绑定写入终端的配置文件。现有绑定会被保留；如果你看到类似 `VSCode terminal Shift+Enter key binding already configured` 的消息，则表示未做任何更改。请在宿主终端中直接运行 `/terminal-setup`，而不是在 tmux 或 screen 内运行，因为它需要写入宿主终端的配置。

在 VS Code、Cursor 和 Windsurf 中，`/terminal-setup` 还会更新两个编辑器设置：将 `terminal.integrated.gpuAcceleration` 设置为 `"off"` 以防止集成终端中的文本乱码，并设置 `terminal.integrated.mouseWheelScrollSensitivity` 以在[全屏模式](/zh/fullscreen)下获得更流畅的滚动。要撤消 GPU 加速更改，请将其改回 `"auto"` 并重新加载编辑器窗口。

如果你在 tmux 内运行，即使外部终端支持 Shift+Enter，也需要下面的 [tmux 配置]。

要将换行绑定到其他按键，或交换行为使 Enter 插入换行而 Shift+Enter 提交，请在你的[按键绑定文件](/zh/keybindings)中映射 `chat:newline` 和 `chat:submit` 操作。

## 在 macOS 上启用 Option 键快捷方式

某些 Claude Code 快捷方式使用 Option 键，例如 Option+Enter 用于换行或 Option+P 用于切换模型。在 macOS 上，大多数终端默认不将 Option 作为修饰键发送，因此这些快捷方式在启用之前不会生效。此终端设置通常标记为"将 Option 用作 Meta 键"；Meta 是 Unix 中对该键的历史名称，现在标记为 Option 或 Alt。

  **Apple Terminal**
    
    打开"设置 → 配置文件 → 键盘"并勾选"将 Option 用作 Meta 键"。

    如果你在 Claude Code 首次运行时接受了"Option+Enter 用于换行和视觉响铃"的提示，则此设置已完成。该提示会为你运行 `/terminal-setup`，它会启用 Option 作为 Meta 并将音频响铃切换为 Apple Terminal 配置文件中的视觉屏幕闪烁。
  

  **iTerm2**
    
    打开"设置 → 配置文件 → 按键 → 通用"，将左侧 Option 键和右侧 Option 键设置为"Esc+"。

    在 iTerm2 中运行 `/terminal-setup` 会在"设置 → 通用 → 选择"中启用"终端中的应用程序可以访问剪贴板"，以便 `/copy` 命令可以写入系统剪贴板。该命令即使在 tmux 内运行也能检测到 iTerm2。重新启动 iTerm2 以使更改生效。
  

  **VS Code**
    
    在 VS Code 设置中添加 `"terminal.integrated.macOptionIsMeta": true`。
  

对于 Ghostty、Kitty 和其他终端，请在终端的配置文件中查找 Option-as-Alt 或 Option-as-Meta 设置。

## 获取终端响铃或通知

当 Claude 完成任务或暂停等待权限提示时，它会触发通知事件。将其显示为终端响铃或桌面通知可以让你在长时间任务运行时切换到其他工作。

默认情况下，Claude Code 仅在 Ghostty、Kitty 和 iTerm2 中发送桌面通知。在其他终端中，将 [`preferredNotifChannel`](/zh/settings#available-settings) 设置为 `"terminal_bell"` 以改为触发终端响铃，或配置[通知钩子](#使用通知钩子播放声音)以使用自定义声音或命令。

桌面通知通过 SSH 到达你的本地机器，因此远程会话仍然可以提醒你。Ghostty 和 Kitty 无需进一步设置即可将其转发到操作系统通知中心。iTerm2 需要你启用转发：

  **打开 iTerm2 通知设置**
    
    前往"设置 → 配置文件 → 终端"。
  

  **启用提醒**
    
    勾选"通知中心提醒"，然后点击"过滤提醒"并启用"发送转义序列生成的提醒"。
  


如果通知仍未出现，请确认你的终端应用程序在操作系统设置中具有通知权限，如果你在 tmux 内运行，请[启用透传]。

### 使用通知钩子播放声音

在任何终端中，你可以配置[通知钩子](/zh/hooks-guide#get-notified-when-claude-needs-input)来播放声音或在 Claude 需要你关注时运行自定义命令。钩子与内置通知一起运行，而不是替代它，因此未收到桌面通知的终端（如 Warp 或 VS Code 集成终端）可以使用钩子或设置 `preferredNotifChannel` 为 `"terminal_bell"`。

以下示例在 macOS 上播放系统声音。链接的指南包含 macOS、Linux 和 Windows 的桌面通知命令。

```json ~/.claude/settings.json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [{ "type": "command", "command": "afplay /System/Library/Sounds/Glass.aiff" }]
      }
    ]
  }
}
```

## 配置 tmux

当 Claude Code 在 tmux 内运行时，默认会有两个问题：Shift+Enter 提交而非插入换行，以及桌面通知和[进度条](/zh/settings#available-settings)永远无法到达外部终端。将以下行添加到 `~/.tmux.conf`，然后运行 `tmux source-file ~/.tmux.conf` 以将其应用到正在运行的服务器：

```bash ~/.tmux.conf
set -g allow-passthrough on
set -s extended-keys on
set -as terminal-features 'xterm*:extkeys'
```

`allow-passthrough` 行让通知和进度更新到达外部终端，而不是被 tmux 吞掉。`extended-keys` 行让 tmux 区分 Shift+Enter 和普通 Enter，使换行快捷方式正常工作。

## 匹配颜色主题

使用 `/theme` 命令或 `/config` 中的主题选择器来选择与你的终端匹配的 Claude Code 主题。选择自动选项会检测终端的亮色或暗色背景，因此主题会随操作系统外观变化而变化。Claude Code 不控制终端自身的配色方案，配色方案由终端应用程序设置。

要自定义界面底部显示的内容，请配置[自定义状态行](/zh/statusline)以显示当前模型、工作目录、git 分支或其他上下文。

### 创建自定义主题

自定义主题需要 Claude Code v2.1.118 或更高版本。

除了内置预设之外，`/theme` 还会列出你定义的任何自定义主题以及已安装[插件](/zh/plugins-reference#themes)贡献的任何主题。选择列表末尾的**新建自定义主题...**以交互方式创建主题：你为主题命名，然后选择要覆盖的各个颜色标记。在自定义主题高亮时按 `Ctrl+E` 可编辑它。

每个自定义主题是 `~/.claude/themes/` 中的一个 JSON 文件。不带 `.json` 扩展名的文件名是主题的 slug，选择主题会将 `custom:<slug>` 存储为你的主题偏好。该文件有三个可选字段：

| 字段       | 类型   | 描述                                                                                                                                     |
| :---------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | string | `/theme` 中显示的标签。默认为文件名 slug                                                                                  |
| `base`      | string | 主题的起始内置预设：`dark`、`light`、`dark-daltonized`、`light-daltonized`、`dark-ansi` 或 `light-ansi`。默认为 `dark` |
| `overrides` | object | 颜色标记名称到颜色值的映射。未在此列出的标记会回退到基础预设                                                |

颜色值接受 `#rrggbb`、`#rgb`、`rgb(r,g,b)`、`ansi256(n)` 或 `ansi:<name>`，其中 `<name>` 是 16 个标准 ANSI 颜色名称之一，如 `red` 或 `cyanBright`。未知标记和无效颜色值会被忽略，因此拼写错误不会破坏渲染。

以下示例定义了一个保持暗色预设但重新着色提示词强调色、错误文本和成功文本的主题：

```json ~/.claude/themes/dracula.json
{
  "name": "Dracula",
  "base": "dark",
  "overrides": {
    "claude": "#bd93f9",
    "error": "#ff5555",
    "success": "#50fa7b"
  }
}
```

Claude Code 监视 `~/.claude/themes/` 并在文件更改时重新加载，因此在编辑器中所做的编辑会应用到正在运行的会话，无需重启。

以下参考涵盖了你可以在 `overrides` 中设置的标记。`/theme` 中的交互式编辑器会显示相同的标记并提供实时预览，以及一些此处省略的单一用途强调色（如引导屏幕颜色）。

  以下示例组合了下面几组中的标记：品牌强调色、计划模式边框、diff 背景以及全屏消息背景。

  ```json ~/.claude/themes/midnight.json
  {
    "name": "Midnight",
    "base": "dark",
    "overrides": {
      "claude": "#a78bfa",
      "planMode": "#38bdf8",
      "diffAdded": "#14532d",
      "diffRemoved": "#7f1d1d",
      "userMessageBackground": "#1e1b4b"
    }
  }
  ```

  #### 文本和强调色

  控制界面中使用的主要品牌强调色和前景文本色调。

  | 标记         | 控制内容                                                         |
  | :------------ | :--------------------------------------------------------------- |
  | `claude`      | 主要品牌强调色，用于旋转加载指示器和助手标签   |
  | `text`        | 默认前景文本                                          |
  | `inverseText` | 在彩色背景上绘制的文本，如状态徽章 |
  | `inactive`    | 次要文本，如提示、时间戳和禁用项     |
  | `subtle`      | 微妙的边框和去强调的次要文本                   |
  | `suggestion`  | 自动补全建议和选择器中的选择高亮      |
  | `permission`  | 对话框边框，包括权限提示和选择器         |
  | `remember`    | 记忆和 `CLAUDE.md` 指示器                                |

  #### 状态颜色

  在消息和指示器中表示成功、失败和警告状态。

  | 标记     | 控制内容                                             |
  | :-------- | :--------------------------------------------------- |
  | `success` | 成功消息和通过的检查                  |
  | `error`   | 错误消息和失败                          |
  | `warning` | 警告、注意消息和自动模式边框 |
  | `merged`  | 已合并的拉取请求状态                           |

  #### 输入框和模式指示器

  设置输入框边框颜色以及权限模式或指示器激活时显示的强调色。

  | 标记          | 控制内容                                           |
  | :------------- | :------------------------------------------------- |
  | `promptBorder` | 默认权限模式下的输入框边框    |
  | `planMode`     | 计划模式强调色和边框                        |
  | `autoAccept`   | 接受编辑模式强调色和边框                |
  | `bashBorder`   | 输入 `!` shell 命令时的输入框边框 |
  | `ide`          | IDE 连接指示器                           |
  | `fastMode`     | 快速模式指示器                                |

  #### Diff 渲染

  为文件编辑和审查中的添加和删除代码着色。

  | 标记               | 控制内容                                           |
  | :------------------ | :------------------------------------------------- |
  | `diffAdded`         | 添加行的背景                          |
  | `diffRemoved`       | 删除行的背景                        |
  | `diffAddedDimmed`   | 添加行附近未更改上下文的背景   |
  | `diffRemovedDimmed` | 删除行附近未更改上下文的背景 |
  | `diffAddedWord`     | 添加行内的词级高亮          |
  | `diffRemovedWord`   | 删除行内的词级高亮         |

  #### 全屏模式

  仅在[全屏渲染模式](/zh/fullscreen)下应用，消息在此模式下有背景填充。

  | 标记                        | 控制内容                                                           |
  | :--------------------------- | :----------------------------------------------------------------- |
  | `userMessageBackground`      | 转录中你的消息背后的背景                  |
  | `userMessageBackgroundHover` | 消息悬停或展开时的背景              |
  | `messageActionsBackground`   | 操作栏打开时选中消息背后的背景 |
  | `bashMessageBackgroundColor` | 转录中 `!` shell 命令条目背后的背景      |
  | `memoryBackgroundColor`      | 转录中 `#` 记忆条目背后的背景             |
  | `selectionBg`                | 鼠标选中文本的背景                         |

  #### 用量计和说话者标签

  调整 `/usage` 视图中显示的条形图以及区分你的消息和 Claude 消息的标签。

  | 标记              | 控制内容                                          |
  | :----------------- | :------------------------------------------------ |
  | `rate_limit_fill`  | 用量计的已填充部分                 |
  | `rate_limit_empty` | 用量计的未填充部分               |
  | `briefLabelYou`    | 你的消息上 `You` 标签的颜色         |
  | `briefLabelClaude` | 助手消息上 `Claude` 标签的颜色 |

  #### 闪光变体和子代理颜色

  多个标记有配对的闪光变体，为旋转加载指示器的动画渐变提供较浅的颜色。如果动画看起来不匹配，请在其基础标记旁边覆盖闪光变体。

  * `claude` 和 `claudeShimmer`
  * `warning` 和 `warningShimmer`
  * `permission` 和 `permissionShimmer`
  * `promptBorder` 和 `promptBorderShimmer`
  * `inactive` 和 `inactiveShimmer`
  * `fastMode` 和 `fastModeShimmer`

  每个[子代理](/zh/sub-agents)和并行任务都以八种命名颜色之一显示，以便你在转录中区分它们。标记名称遵循 `<color>_FOR_SUBAGENTS_ONLY` 模式，其中 `<color>` 是 `red`、`blue`、`green`、`yellow`、`purple`、`orange`、`pink` 或 `cyan`。覆盖这些可以更改每种命名颜色的外观。例如，在定义中设置了 `color: blue` 的子代理使用 `blue_FOR_SUBAGENTS_ONLY` 值绘制。

  提示词输入中的 [`ultrathink`](/zh/model-config#use-ultrathink-for-one-off-deep-reasoning) 和 [`ultraplan`](/zh/ultraplan) 关键字使用七色彩虹渐变渲染。标记名称遵循 `rainbow_<color>` 和 `rainbow_<color>_shimmer` 模式，其中 `<color>` 是 `red`、`orange`、`yellow`、`green`、`blue`、`indigo` 或 `violet`。

## 切换到全屏渲染

如果在 Claude 工作时显示闪烁或滚动位置跳动，请切换到[全屏渲染模式](/zh/fullscreen)。它会绘制到终端为全屏应用保留的独立屏幕，而不是追加到你的正常回滚缓冲区，这使内存使用保持平稳，并增加了鼠标滚动和选择支持。在此模式下，你在 Claude Code 内使用鼠标或 PageUp 滚动，而不是使用终端的原生回滚；请参阅[全屏页面](/zh/fullscreen#search-and-review-the-conversation)了解如何搜索和复制。

运行 `/tui fullscreen` 可在当前会话中切换并保留对话内容。要将其设为默认值，请在启动 Claude Code 前设置 `CLAUDE_CODE_NO_FLICKER` 环境变量：

  ```bash Bash and Zsh
  CLAUDE_CODE_NO_FLICKER=1 claude
  ```

  ```powershell PowerShell
  $env:CLAUDE_CODE_NO_FLICKER = "1"; claude
  ```

  ```json ~/.claude/settings.json
  {
    "env": {
      "CLAUDE_CODE_NO_FLICKER": "1"
    }
  }
  ```

## 粘贴大量内容

当你向提示词中粘贴超过 10,000 个字符时，Claude Code 会将输入折叠为 `[Pasted text]` 占位符，以保持输入框可用。完整内容仍会在你提交时发送给 Claude。

VS Code 集成终端可能会在非常大的粘贴内容到达 Claude Code 之前丢弃字符，因此建议在该环境中使用基于文件的工作流。对于非常大的输入（如整个文件或长日志），请将内容写入文件并要求 Claude 读取它，而不是粘贴。这使对话转录保持可读性，并让 Claude 在后续轮次中通过路径引用该文件。

## 使用 Vim 按键绑定编辑提示词

Claude Code 包含用于提示词输入的 Vim 风格编辑模式。通过 `/config` → 编辑器模式启用，或在 `~/.claude/settings.json` 中将 [`editorMode`](/zh/settings#available-settings) 设置为 `"vim"`。将编辑器模式改回 `normal` 即可关闭。

Vim 模式支持 NORMAL 和 VISUAL 模式下的部分移动和操作命令，例如 `hjkl` 导航、`v`/`V` 选择以及 `d`/`c`/`y` 配合文本对象。请参阅 [Vim 编辑器模式参考](/zh/interactive-mode#vim-editor-mode)获取完整按键表。Vim 移动命令无法通过按键绑定文件重新映射。

与标准 Vim 不同，在 INSERT 模式下按 Enter 仍会提交提示词。在 NORMAL 模式下使用 `o` 或 `O`，或使用 Ctrl+J 来插入换行。

## 相关资源

* [交互模式](/zh/interactive-mode)：完整的键盘快捷键参考和 Vim 按键表
* [按键绑定](/zh/keybindings)：重新映射任何 Claude Code 快捷方式，包括 Enter 和 Shift+Enter
* [全屏渲染](/zh/fullscreen)：全屏模式下的滚动、搜索和复制详情
* [钩子指南](/zh/hooks-guide)：适用于 Linux 和 Windows 的更多通知钩子示例
* [故障排除](/zh/troubleshooting)：终端配置之外问题的修复方法
