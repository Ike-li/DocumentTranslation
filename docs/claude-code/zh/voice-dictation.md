> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进一步探索。

# 语音听写

> 在 Claude Code CLI 中使用按住录音或点击录音的语音听写功能来口述你的提示词。

在 Claude Code CLI 中口述提示词，无需手动输入。你的语音会被实时转录到提示词输入框中，因此你可以在同一条消息中混合语音和打字。通过 `/voice` 启用听写，然后按住按键说话或点击一次开始、再次点击发送。

**注意**
  语音听写需要 Claude Code v2.1.69 或更高版本。点击模式需要 v2.1.116 或更高版本。使用 `claude --version` 检查你的版本。

## 前提条件

语音听写会将录制的音频流式传输到 Anthropic 的服务器进行转录。音频不会在本地处理。语音转文本服务仅在你使用 Claude.ai 账户认证时可用，当 Claude Code 配置为直接使用 Anthropic API 密钥、Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 时不可用。当你的组织启用了 HIPAA 合规性时，语音听写也不可用。转录不会消耗 Claude 消息或 token，也不会计入 `/usage` 中显示的限制。有关 Anthropic 如何处理你的数据，请参阅[数据使用](/zh/data-usage)。

语音听写还需要本地麦克风访问权限，因此在远程环境中无法使用，例如 [Web 版 Claude Code](/zh/claude-code-on-the-web) 或 SSH 会话。在 WSL 中，语音听写需要 WSLg 才能访问音频。在 Windows 10 或 11 上从 Microsoft Store 安装的 WSL2 自带 WSLg。如果 WSLg 不可用（例如 WSL1），请改为在原生 Windows 中运行 Claude Code。

音频录制在 macOS、Linux 和 Windows 上使用内置的原生模块。在 Linux 上，如果原生模块无法加载，Claude Code 会回退到 ALSA 工具的 `arecord` 或 SoX 的 `rec`。如果两者都不可用，`/voice` 会为你的包管理器打印一条安装命令。

Claude Code [VS Code 扩展](/zh/vs-code)也支持语音听写，同样需要 Claude.ai 账户。它在 VS Code 远程会话中不可用，包括 SSH、Dev Containers 和 Codespaces，因为麦克风在你的本地机器上，而扩展运行在远程主机上。

## 启用语音听写

运行 `/voice` 启用听写。首次启用时，Claude Code 会运行麦克风检查。在 macOS 上，如果你的终端从未被授予麦克风权限，这会触发系统麦克风权限提示。

```
/voice
Voice mode enabled (hold). Hold Space to record. Dictation language: en (/config to change).
```

`/voice` 接受一个可选的模式参数：

| 命令          | 效果                                         |
| :------------ | :------------------------------------------- |
| `/voice`      | 开关切换，保持当前模式                       |
| `/voice hold` | 以[按住模式](#按住录音)启用                  |
| `/voice tap`  | 以[点击模式](#点击录音并发送)启用            |
| `/voice off`  | 禁用                                         |

语音听写在会话间保持持久化。你也可以直接在[用户设置文件](/zh/settings)中设置，而不是运行 `/voice`：

```json
{
  "voice": {
    "enabled": true,
    "mode": "tap"
  }
}
```

启用语音听写后，当提示词为空时，输入区域底部会显示 `hold Space to speak` 提示。该提示反映你当前的 `voice:pushToTalk` 绑定，如果你[重新绑定听写按键](#重新绑定听写按键)，提示会随之更新。两种模式下的提示文本相同，如果你配置了[自定义状态行](/zh/statusline)，则不会显示。

两种模式的转录都针对编程词汇进行了优化。常见的开发术语如 `regex`、`OAuth`、`JSON` 和 `localhost` 都能被正确识别，你当前的项目名称和 git 分支名称会自动添加为识别提示。

## 按住录音

按住模式是按键通话：按住按键时录音，松开时停止。这是默认模式。

按住 `Space` 开始录音。Claude Code 通过监听终端的快速按键重复事件来检测按住的按键，因此在录音开始前有一个短暂的预热过程。预热期间底部显示 `keep holding…`，录音激活后切换为实时波形。

预热期间前几个按键重复字符会输入到输入框中，录音激活后会自动移除。单次点击 `Space` 仍然会输入空格，因为按住检测只在快速重复时触发。

**提示**
  要跳过预热，请使用 `/voice tap` 切换到[点击模式](#点击录音并发送)，或[重新绑定为修饰键组合](#重新绑定听写按键)如 `meta+k`。修饰键组合在第一次按键时即开始录音。

你说话时，语音会实时出现在提示词中，在转录最终确定前以淡化显示。松开 `Space` 停止录音并最终确定文本。转录内容会插入到光标位置，光标停留在插入文本的末尾，因此你可以按任意顺序混合打字和听写。再次按住 `Space` 追加另一段录音，或先移动光标将语音插入到提示词的其他位置：

```
> refactor the auth middleware to ▮
  # hold Space, speak "use the new token validation helper"
> refactor the auth middleware to use the new token validation helper▮
```

默认情况下，松开按键会插入转录内容并等待你按 `Enter`。在 `voice` 设置对象中设置 `"autoSubmit": true`，可以在松开按键时自动发送提示词，前提是转录内容至少有三个单词。

## 点击录音并发送

点击模式通过单次按键切换录音：点击一次开始，说话，然后再次点击发送提示词。没有预热过程，你也不需要持续按住按键。

使用 `/voice tap` 启用点击模式。当提示词输入为空时，点击 `Space` 开始录音。录音期间底部显示实时波形。再次点击 `Space` 停止。当转录内容至少有三个单词时，Claude Code 会插入转录内容并自动提交提示词。较短的转录内容会被插入但不会提交，因此误触不会发送无意义的单词。

第一次点击仅在提示词输入为空时才开始录音，因此你在编写消息时仍可正常输入空格。第二次点击无论输入内容如何都会停止录音。在静默 15 秒或总时长达到两分钟后，录音也会自动停止。

## 更改听写语言

语音听写使用与控制 Claude 响应语言相同的 [`language` 设置](/zh/settings)。如果该设置为空，听写默认使用英语。在 VS Code 扩展中，如果 `language` 为空，听写会使用 VS Code 的 `accessibility.voice.speechLanguage` 设置，然后再默认使用英语。

**支持的听写语言**

  | 语言       | 代码 |
  | :--------- | :--- |
  | 捷克语     | `cs` |
  | 丹麦语     | `da` |
  | 荷兰语     | `nl` |
  | 英语       | `en` |
  | 法语       | `fr` |
  | 德语       | `de` |
  | 希腊语     | `el` |
  | 印地语     | `hi` |
  | 印尼语     | `id` |
  | 意大利语   | `it` |
  | 日语       | `ja` |
  | 韩语       | `ko` |
  | 挪威语     | `no` |
  | 波兰语     | `pl` |
  | 葡萄牙语   | `pt` |
  | 俄语       | `ru` |
  | 西班牙语   | `es` |
  | 瑞典语     | `sv` |
  | 土耳其语   | `tr` |
  | 乌克兰语   | `uk` |

在 `/config` 或直接在设置中设置语言。你可以使用 [BCP 47 语言代码](https://en.wikipedia.org/wiki/IETF_language_tag)或语言名称：

```json
{
  "language": "japanese"
}
```

如果你的 `language` 设置不在支持列表中，`/voice` 会在启用时发出警告，并在听写时回退到英语。Claude 的文本响应不受此回退影响。

## 重新绑定听写按键

听写按键绑定在 `Chat` 上下文中的 `voice:pushToTalk`，默认为 `Space`。同一个绑定同时控制按住模式和点击模式。在 [`~/.claude/keybindings.json`](/zh/keybindings) 中重新绑定：

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "meta+k": "voice:pushToTalk",
        "space": null
      }
    }
  ]
}
```

`voice:pushToTalk` 操作一次使用一个按键。当你绑定自定义按键时，它会替换默认的 `Space` 绑定而不是添加第二个触发器，因此本例中的 `"space": null` 行只是为了清晰起见，省略后不会改变行为。

在按住模式下，避免绑定单纯的字母键如 `v`，因为按住检测依赖于按键重复，而字母会在预热期间输入到提示词中。使用 `Space`，或使用修饰键组合如 `meta+k`，在第一次按键时即开始录音，无需预热。点击模式没有预热，因此大多数按键都可以使用。

某些按键不会传递给终端应用程序，根本无法绑定。例如，尝试绑定 `Caps Lock` 会显示错误。有关完整的按键绑定语法和保留快捷键列表，请参阅[自定义键盘快捷键](/zh/keybindings)。

## 故障排除

语音听写无法激活或录制时的常见问题：

* **`Voice mode requires a Claude.ai account`**：你使用的是 API 密钥或第三方提供商认证。运行 `/login` 使用 Claude.ai 账户登录。
* **`Microphone access is denied`**：在系统设置中授予终端麦克风权限。在 macOS 上，前往系统设置 → 隐私与安全性 → 麦克风，启用你的终端应用，然后重新运行 `/voice`。在 Windows 上，前往设置 → 隐私和安全性 → 麦克风，为桌面应用开启麦克风访问，然后重新运行 `/voice`。如果你的终端未出现在 macOS 设置中，请参阅[终端未出现在 macOS 麦克风设置中](#终端未出现在-macos-麦克风设置中)。
* **Linux 上 `No audio recording tool found`**：原生音频模块无法加载且未安装回退工具。使用错误消息中显示的命令安装 SoX，例如 `sudo apt-get install sox`。
* **`Voice mode could not find a working audio recorder in WSL`**：WSLg 通过 PulseAudio 而非 ALSA 设备路由音频，因此 SoX 需要显式安装 PulseAudio 后端。运行 `sudo apt install sox libsox-fmt-pulse`。单独安装 `sox` 会引入 ALSA 后端，该后端在 WSL 上无法录音，因为没有 `/dev/snd` 设备。
* **`Voice input is failing repeatedly and has been paused`**：语音听写连续遇到多次启动失败，已停止尝试新会话直到成功。这通常意味着此主机上的麦克风或音频栈无法捕获音频，例如无头服务器、没有音频透传的远程 shell 或麦克风权限被拒绝。确认输入设备正常工作，根据上述条目修复根本原因，然后再次触发语音。
* **在按住模式下按住 `Space` 无反应**：按住时观察提示词输入框。如果空格持续累积，语音听写可能已关闭；运行 `/voice hold` 启用它。如果只出现一两个空格然后没有反应，语音听写已启用但按住检测未触发。按住检测需要终端发送按键重复事件，因此如果操作系统级别禁用了按键重复，它无法检测到按住的按键。使用 `/voice tap` 切换到点击模式以避免按键重复要求。
* **在点击模式下点击 `Space` 输入空格而非录音**：第一次点击仅在提示词输入为空时才开始录音。先清空输入，或运行 `/voice tap` 确认你处于点击模式。
* **`No audio detected from microphone`**：录音已开始但捕获的是静音。确认正确的输入设备已设置为系统默认，且其输入级别未被静音或接近零。在 Windows 上，打开设置 → 系统 → 声音 → 输入，选择你的麦克风。在 macOS 上，打开系统设置 → 声音 → 输入。
* **`No speech detected`**：音频已到达转录服务但未识别到任何单词。靠近麦克风说话，减少背景噪音，并确认你的[听写语言](#更改听写语言)与你说的语言匹配。
* **转录乱码或语言错误**：听写默认使用英语。如果你使用其他语言听写，请先在 `/config` 中设置。参阅[更改听写语言](#更改听写语言)。

### 终端未出现在 macOS 麦克风设置中

如果你的终端应用未出现在系统设置 → 隐私与安全性 → 麦克风中，则没有可启用的开关。重置终端的权限状态，以便下次运行 `/voice` 时触发新的 macOS 权限提示。

1. **重置终端的麦克风权限**

    运行 `tccutil reset Microphone <bundle-id>`，将 `<bundle-id>` 替换为你的终端标识符：内置终端为 `com.apple.Terminal`，iTerm2 为 `com.googlecode.iterm2`。对于其他终端，使用 `osascript -e 'id of app "AppName"'` 查找标识符。

    > **警告**
    > 你可以运行 `tccutil reset Microphone` 而不指定 bundle ID，但这会撤销你 Mac 上所有应用的麦克风访问权限，包括 Zoom 或 Slack 等应用。每个应用需要在下次使用时重新请求访问权限，因此不要在通话过程中运行此命令。

2. **退出并重新启动终端**

    macOS 不会重新提示已经运行的进程。使用 Cmd+Q 退出终端应用（而不是仅关闭其窗口），然后重新打开。

3. **触发新的提示**

    启动 Claude Code 并运行 `/voice`。macOS 会提示麦克风访问权限；允许它。

## 另请参阅

* [自定义键盘快捷键](/zh/keybindings)：重新绑定 `voice:pushToTalk` 和其他 CLI 键盘操作
* [配置设置](/zh/settings)：`voice`、`language` 和其他设置键的完整参考
* [交互模式](/zh/interactive-mode)：键盘快捷键、输入模式和会话控制
* [命令](/zh/commands)：`/voice`、`/config` 和所有其他命令的参考
