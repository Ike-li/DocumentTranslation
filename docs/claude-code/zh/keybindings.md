> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 自定义键盘快捷键

> 使用快捷键配置文件自定义 Claude Code 中的键盘快捷键。

自定义键盘快捷键需要 Claude Code v2.1.18 或更高版本。使用 `claude --version` 检查你的版本。

Claude Code 支持自定义键盘快捷键。运行 `/keybindings` 创建或打开你的配置文件 `~/.claude/keybindings.json`。

## 配置文件

快捷键配置文件是一个包含 `bindings` 数组的对象。每个块指定一个上下文以及按键到操作的映射。

对快捷键文件的更改会自动检测并应用，无需重启 Claude Code。

| 字段       | 描述                           |
| :--------- | :----------------------------- |
| `$schema`  | 可选的 JSON Schema URL，用于编辑器自动补全 |
| `$docs`    | 可选的文档 URL                 |
| `bindings` | 按上下文分组的绑定块数组       |

此示例将 `Ctrl+E` 绑定为在聊天上下文中打开外部编辑器，并解除 `Ctrl+U` 的绑定：

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

## 上下文

每个绑定块指定一个**上下文**，绑定在该上下文中生效：

| 上下文            | 描述                                         |
| :---------------- | :------------------------------------------- |
| `Global`          | 应用于应用中的所有位置                       |
| `Chat`            | 主聊天输入区域                               |
| `Autocomplete`    | 自动补全菜单打开时                           |
| `Settings`        | 设置菜单                                     |
| `Confirmation`    | 权限和确认对话框                             |
| `Tabs`            | 标签页导航组件                               |
| `Help`            | 帮助菜单可见时                               |
| `Transcript`      | 会话记录查看器                               |
| `HistorySearch`   | 历史搜索模式（Ctrl+R）                       |
| `Task`            | 后台任务运行时                               |
| `ThemePicker`     | 主题选择器对话框                             |
| `Attachments`     | 选择对话框中的图片附件导航                   |
| `Footer`          | 页脚指示器导航（任务、团队、差异）           |
| `MessageSelector` | 回退和总结对话框的消息选择                   |
| `DiffDialog`      | 差异查看器导航                               |
| `ModelPicker`     | 模型选择器努力程度                           |
| `Select`          | 通用选择/列表组件                            |
| `Plugin`          | 插件对话框（浏览、发现、管理）               |
| `Scroll`          | 全屏模式下的会话滚动和文本选择               |
| `Doctor`          | `/doctor` 诊断屏幕                           |

## 可用操作

操作遵循 `namespace:action` 格式，例如 `chat:submit` 用于发送消息，`app:toggleTodos` 用于显示任务列表。每个上下文有特定的可用操作。

### 应用操作

在 `Global` 上下文中可用的操作：

| 操作                   | 默认值    | 描述                 |
| :--------------------- | :-------- | :------------------- |
| `app:interrupt`        | Ctrl+C    | 取消当前操作         |
| `app:exit`             | Ctrl+D    | 退出 Claude Code     |
| `app:redraw`           | （未绑定）| 强制终端重绘         |
| `app:toggleTodos`      | Ctrl+T    | 切换任务列表可见性   |
| `app:toggleTranscript` | Ctrl+O    | 切换详细会话记录     |

### 历史记录操作

用于导航命令历史的操作：

| 操作                 | 默认值 | 描述           |
| :------------------- | :----- | :------------- |
| `history:search`     | Ctrl+R | 打开历史搜索   |
| `history:previous`   | Up     | 上一条历史记录 |
| `history:next`       | Down   | 下一条历史记录 |

### 聊天操作

在 `Chat` 上下文中可用的操作：

| 操作                    | 默认值                            | 描述                                                                                                                                                           |
| :---------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat:cancel`           | Escape                            | 取消当前输入                                                                                                                                                   |
| `chat:clearInput`       | Ctrl+L                            | 强制全屏重绘，保留输入。在[全屏渲染](/zh/fullscreen#清除会话)模式下，两秒内按两次运行 `/clear`                                                                |
| `chat:clearScreen`      | Cmd+K                             | 在[全屏渲染](/zh/fullscreen#清除会话)模式下，两秒内按两次运行 `/clear`                                                                                        |
| `chat:killAgents`       | Ctrl+X Ctrl+K                     | 终止此会话中所有正在运行的[后台子代理](/zh/sub-agents#在前台或后台运行子代理)                                                                                  |
| `chat:cycleMode`        | Shift+Tab\*                       | 循环切换权限模式                                                                                                                                               |
| `chat:modelPicker`      | Meta+P                            | 打开模型选择器                                                                                                                                                 |
| `chat:fastMode`         | Meta+O                            | 切换快速模式                                                                                                                                                   |
| `chat:thinkingToggle`   | Meta+T                            | 切换扩展思考                                                                                                                                                   |
| `chat:submit`           | Enter                             | 提交消息                                                                                                                                                       |
| `chat:newline`          | Ctrl+J                            | 插入换行而不提交                                                                                                                                               |
| `chat:undo`             | Ctrl+\_, Ctrl+Shift+-             | 撤销上一操作                                                                                                                                                   |
| `chat:externalEditor`   | Ctrl+G, Ctrl+X Ctrl+E             | 在外部编辑器中打开                                                                                                                                             |
| `chat:stash`            | Ctrl+S                            | 暂存当前提示词                                                                                                                                                 |
| `chat:imagePaste`       | Ctrl+V（Windows 和 WSL 上为 Alt+V）| 从剪贴板粘贴图片。在 WSL 上，两个快捷键默认都已绑定                                                                                                           |

\*在没有 VT 模式的 Windows 上（Node \<24.2.0/\<22.17.0，Bun \<1.2.23），默认为 Meta+M。

### 自动补全操作

在 `Autocomplete` 上下文中可用的操作：

| 操作                    | 默认值 | 描述             |
| :---------------------- | :----- | :--------------- |
| `autocomplete:accept`   | Tab    | 接受建议         |
| `autocomplete:dismiss`  | Escape | 关闭菜单         |
| `autocomplete:previous` | Up     | 上一个建议       |
| `autocomplete:next`     | Down   | 下一个建议       |

### 确认操作

在 `Confirmation` 上下文中可用的操作：

| 操作                        | 默认值    | 描述                   |
| :-------------------------- | :-------- | :--------------------- |
| `confirm:yes`               | Y, Enter  | 确认操作               |
| `confirm:no`                | N, Escape | 拒绝操作               |
| `confirm:previous`          | Up        | 上一个选项             |
| `confirm:next`              | Down      | 下一个选项             |
| `confirm:nextField`         | Tab       | 下一个字段             |
| `confirm:previousField`     | （未绑定）| 上一个字段             |
| `confirm:toggle`            | Space     | 切换选择               |
| `confirm:cycleMode`         | Shift+Tab | 循环切换权限模式       |
| `confirm:toggleExplanation` | Ctrl+E    | 切换权限说明           |

### 权限操作

在 `Confirmation` 上下文中用于权限对话框的操作：

| 操作                     | 默认值    | 描述                                                                                                     |
| :----------------------- | :-------- | :------------------------------------------------------------------------------------------------------- |
| `permission:toggleDebug` | （未绑定）| 切换权限调试信息。之前的默认值 Ctrl+D 在 v2.1.146 中被移除，因为它与 `app:exit` 冲突                   |

### 会话记录操作

在 `Transcript` 上下文中可用的操作：

| 操作                       | 默认值            | 描述                 |
| :------------------------- | :---------------- | :------------------- |
| `transcript:toggleShowAll` | Ctrl+E            | 切换显示所有内容     |
| `transcript:exit`          | q, Ctrl+C, Escape | 退出会话记录视图     |

### 历史搜索操作

在 `HistorySearch` 上下文中可用的操作：

| 操作                       | 默认值      | 描述                                    |
| :------------------------- | :---------- | :-------------------------------------- |
| `historySearch:next`       | Ctrl+R      | 下一个匹配项                            |
| `historySearch:accept`     | Escape, Tab | 接受选择                                |
| `historySearch:cancel`     | Ctrl+C      | 取消搜索                                |
| `historySearch:execute`    | Enter       | 执行选中的命令                          |
| `historySearch:cycleScope` | Ctrl+S      | 循环切换范围：会话、项目、所有位置      |

### 任务操作

在 `Task` 上下文中可用的操作：

| 操作              | 默认值 | 描述                 |
| :---------------- | :----- | :------------------- |
| `task:background` | Ctrl+B | 将当前任务移到后台   |

### 主题操作

在 `ThemePicker` 上下文中可用的操作：

| 操作                             | 默认值 | 描述                   |
| :------------------------------- | :----- | :--------------------- |
| `theme:toggleSyntaxHighlighting` | Ctrl+T | 切换语法高亮           |

### 帮助操作

在 `Help` 上下文中可用的操作：

| 操作           | 默认值 | 描述         |
| :------------- | :----- | :----------- |
| `help:dismiss` | Escape | 关闭帮助菜单 |

### 标签页操作

在 `Tabs` 上下文中可用的操作：

| 操作            | 默认值          | 描述         |
| :-------------- | :-------------- | :----------- |
| `tabs:next`     | Tab, Right      | 下一个标签页 |
| `tabs:previous` | Shift+Tab, Left | 上一个标签页 |

### 附件操作

在 `Attachments` 上下文中可用的操作：

| 操作                   | 默认值            | 描述                   |
| :--------------------- | :---------------- | :--------------------- |
| `attachments:next`     | Right             | 下一个附件             |
| `attachments:previous` | Left              | 上一个附件             |
| `attachments:remove`   | Backspace, Delete | 移除选中的附件         |
| `attachments:exit`     | Down, Escape      | 退出附件导航           |

### 页脚操作

在 `Footer` 上下文中可用的操作：

| 操作                    | 默认值 | 描述                                   |
| :---------------------- | :----- | :------------------------------------- |
| `footer:next`           | Right  | 下一个页脚项                           |
| `footer:previous`       | Left   | 上一个页脚项                           |
| `footer:up`             | Up     | 在页脚中向上导航（顶部时取消选择）     |
| `footer:down`           | Down   | 在页脚中向下导航                       |
| `footer:openSelected`   | Enter  | 打开选中的页脚项                       |
| `footer:clearSelection` | Escape | 清除页脚选择                           |

### 消息选择器操作

在 `MessageSelector` 上下文中可用的操作：

| 操作                     | 默认值                                    | 描述             |
| :----------------------- | :---------------------------------------- | :--------------- |
| `messageSelector:up`     | Up, K, Ctrl+P                             | 在列表中上移     |
| `messageSelector:down`   | Down, J, Ctrl+N                           | 在列表中下移     |
| `messageSelector:top`    | Ctrl+Up, Shift+Up, Meta+Up, Shift+K       | 跳转到顶部       |
| `messageSelector:bottom` | Ctrl+Down, Shift+Down, Meta+Down, Shift+J | 跳转到底部       |
| `messageSelector:select` | Enter                                     | 选择消息         |

### 差异操作

在 `DiffDialog` 上下文中可用的操作：

| 操作                  | 默认值             | 描述                                                          |
| :-------------------- | :----------------- | :------------------------------------------------------------ |
| `diff:dismiss`        | Escape             | 关闭差异查看器                                                |
| `diff:previousSource` | Left               | 上一个差异源                                                  |
| `diff:nextSource`     | Right              | 下一个差异源                                                  |
| `diff:previousFile`   | Up, K              | 文件列表中的上一个文件；在详情视图中向上滚动一行              |
| `diff:nextFile`       | Down, J            | 文件列表中的下一个文件；在详情视图中向下滚动一行              |
| `diff:viewDetails`    | Enter              | 查看差异详情                                                  |
| `diff:back`           | （上下文相关）     | 在差异查看器中返回                                            |

差异详情视图还将分页器风格的按键绑定到标准的[滚动操作](#滚动操作)。这些绑定属于 `DiffDialog` 上下文，仅在详情视图中生效；[滚动操作](#滚动操作)下列出的 `Scroll` 上下文默认值不受影响。

| 操作                  | 默认值         | 描述                   |
| :-------------------- | :------------- | :--------------------- |
| `scroll:pageUp`       | PageUp         | 向上滚动半屏           |
| `scroll:pageDown`     | PageDown       | 向下滚动半屏           |
| `scroll:fullPageUp`   | Shift+Space, B | 向上滚动整屏           |
| `scroll:fullPageDown` | Space          | 向下滚动整屏           |
| `scroll:top`          | G, Home        | 跳转到顶部             |
| `scroll:bottom`       | Shift+G, End   | 跳转到底部             |

### 模型选择器操作

在 `ModelPicker` 上下文中可用的操作：

| 操作                          | 默认值 | 描述                               |
| :---------------------------- | :----- | :--------------------------------- |
| `modelPicker:decreaseEffort`  | Left   | 降低努力程度                       |
| `modelPicker:increaseEffort`  | Right  | 提高努力程度                       |
| `modelPicker:thisSessionOnly` | s      | 仅将高亮的模型应用到当前会话       |

### 选择操作

在 `Select` 上下文中可用的操作：

| 操作              | 默认值          | 描述         |
| :---------------- | :-------------- | :----------- |
| `select:next`     | Down, J, Ctrl+N | 下一个选项   |
| `select:previous` | Up, K, Ctrl+P   | 上一个选项   |
| `select:accept`   | Enter           | 接受选择     |
| `select:cancel`   | Escape          | 取消选择     |

### 插件操作

在 `Plugin` 上下文中可用的操作：

| 操作              | 默认值 | 描述                                                           |
| :---------------- | :----- | :------------------------------------------------------------- |
| `plugin:toggle`   | Space  | 切换插件选择                                                   |
| `plugin:install`  | I      | 安装选中的插件                                                 |
| `plugin:favorite` | F      | 收藏选中的插件，使其在已安装标签页中排序靠前                   |

### 设置操作

在 `Settings` 上下文中可用的操作：

| 操作              | 默认值 | 描述                                                                |
| :---------------- | :----- | :------------------------------------------------------------------ |
| `settings:search` | /      | 进入搜索模式                                                        |
| `settings:retry`  | R      | 重试加载使用数据（出错时）                                          |
| `settings:close`  | Enter  | 保存更改并关闭配置面板。Escape 放弃更改并关闭                       |

### 诊断操作

在 `Doctor` 上下文中可用的操作：

| 操作         | 默认值 | 描述                                                                                       |
| :----------- | :----- | :----------------------------------------------------------------------------------------- |
| `doctor:fix` | F      | 将诊断报告发送给 Claude 以修复报告的问题。仅在发现问题时激活                               |

### 语音操作

在 `Chat` 上下文中启用[语音听写](/zh/voice-dictation)时可用的操作：

| 操作               | 默认值 | 描述                                                  |
| :----------------- | :----- | :---------------------------------------------------- |
| `voice:pushToTalk` | Space  | 听写提示词。根据 `/voice` 模式长按或点按             |

### 滚动操作

在 `Scroll` 上下文中启用[全屏渲染](/zh/fullscreen)时可用的操作：

| 操作                        | 默认值               | 描述                                                                                          |
| :------------------------- | :------------------- | :-------------------------------------------------------------------------------------------- |
| `scroll:lineUp`            | （未绑定）           | 向上滚动一行。鼠标滚轮滚动会触发此操作                                                        |
| `scroll:lineDown`          | （未绑定）           | 向下滚动一行。鼠标滚轮滚动会触发此操作                                                        |
| `scroll:pageUp`            | PageUp               | 向上滚动半屏高度                                                                              |
| `scroll:pageDown`          | PageDown             | 向下滚动半屏高度                                                                              |
| `scroll:top`               | Ctrl+Home            | 跳转到会话开头                                                                                |
| `scroll:bottom`            | Ctrl+End             | 跳转到最新消息并重新启用自动跟随                                                              |
| `scroll:halfPageUp`        | （未绑定）           | 向上滚动半屏高度。与 `scroll:pageUp` 行为相同，为 vi 风格重绑定提供                          |
| `scroll:halfPageDown`      | （未绑定）           | 向下滚动半屏高度。与 `scroll:pageDown` 行为相同，为 vi 风格重绑定提供                         |
| `scroll:fullPageUp`        | （未绑定）           | 向上滚动整屏高度                                                                              |
| `scroll:fullPageDown`      | （未绑定）           | 向下滚动整屏高度                                                                              |
| `selection:copy`           | Ctrl+Shift+C / Cmd+C | 将选中的文本复制到剪贴板                                                                      |
| `selection:clear`          | （未绑定）           | 清除活动文本选择                                                                              |
| `selection:extendLeft`     | Shift+Left           | 将活动选择向左扩展一列                                                                        |
| `selection:extendRight`    | Shift+Right          | 将活动选择向右扩展一列                                                                        |
| `selection:extendUp`       | Shift+Up             | 将活动选择向上扩展一行。当选择到达顶部边缘时滚动视口                                          |
| `selection:extendDown`     | Shift+Down           | 将活动选择向下扩展一行。当选择到达底部边缘时滚动视口                                          |
| `selection:extendLineStart`| Shift+Home           | 将活动选择扩展到行首                                                                          |
| `selection:extendLineEnd`  | Shift+End            | 将活动选择扩展到行尾                                                                          |

## 按键语法

### 修饰键

使用 `+` 分隔符组合修饰键：

* `ctrl` 或 `control` - Control 键
* `shift` - Shift 键
* `alt`、`opt`、`option` 或 `meta` - Windows 和 Linux 上为 Alt 键，macOS 上为 Option 键
* `cmd`、`command`、`super` 或 `win` - macOS 上为 Command 键，Windows 上为 Windows 键，Linux 上为 Super 键

`cmd` 组仅在报告 Super 修饰键的终端中检测到，例如支持 Kitty 键盘协议或 xterm 的 `modifyOtherKeys` 模式的终端。大多数终端不会发送它，因此对于你希望在所有地方都生效的绑定，请使用 `ctrl` 或 `meta`。

例如：

```text
ctrl+k          Ctrl + K
shift+tab       Shift + Tab
meta+p          Option + P on macOS, Alt + P elsewhere
ctrl+shift+c    Multiple modifiers
```

### 大写字母

单独的大写字母隐含 Shift。例如，`K` 等同于 `shift+k`。这对于 vim 风格的绑定很有用，其中大写和小写键有不同的含义。

带修饰键的大写字母（例如 `ctrl+K`）被视为风格化，**不**隐含 Shift：`ctrl+K` 与 `ctrl+k` 相同。

### 组合键

组合键是用空格分隔的按键序列：

```text
ctrl+k ctrl+s   Press Ctrl+K, release, then Ctrl+S
```

### 特殊键

* `escape` 或 `esc` - Escape 键
* `enter` 或 `return` - Enter 键
* `tab` - Tab 键
* `space` - 空格键
* `up`、`down`、`left`、`right` - 方向键
* `backspace`、`delete` - 删除键

## 解除默认快捷键绑定

将操作设置为 `null` 以解除默认快捷键绑定：

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+s": null
      }
    }
  ]
}
```

这也适用于组合键绑定。解除共享前缀的所有组合键绑定可以释放该前缀用于单键绑定：

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+x ctrl+k": null,
        "ctrl+x ctrl+e": null,
        "ctrl+x": "chat:newline"
      }
    }
  ]
}
```

如果你只解除了部分前缀组合键绑定，按下前缀仍会进入组合键等待模式以处理剩余的绑定。

## 保留快捷键

以下快捷键无法重新绑定：

| 快捷键    | 原因                                       |
| :-------- | :----------------------------------------- |
| Ctrl+C    | 硬编码的中断/取消                          |
| Ctrl+D    | 硬编码的退出                               |
| Ctrl+M    | 在终端中与 Enter 相同（两者都发送 CR）     |
| Caps Lock | 不会传递给终端应用                         |

## 终端冲突

某些快捷键可能与终端复用器冲突：

| 快捷键  | 冲突                              |
| :------ | :-------------------------------- |
| Ctrl+B  | tmux 前缀（按两次发送）           |
| Ctrl+A  | GNU screen 前缀                   |
| Ctrl+Z  | Unix 进程挂起（SIGTSTP）          |

## Vim 模式交互

当通过 `/config` -> Editor mode 启用 vim 模式时，快捷键和 vim 模式独立运行：

* **Vim 模式**在文本输入级别处理输入（光标移动、模式、动作）
* **快捷键**在组件级别处理操作（切换任务列表、提交等）
* Vim 模式中的 Escape 键将 INSERT 模式切换为 NORMAL 模式；不会触发 `chat:cancel`
* 大多数 Ctrl+按键快捷键会穿过 vim 模式传递到快捷键系统
* 在 vim NORMAL 模式下，`?` 显示帮助菜单（vim 行为）
* 在 vim NORMAL 模式下，`/` 打开历史搜索，与标准模式下的 Ctrl+R 相同

## 验证

Claude Code 会验证你的快捷键并在以下情况下显示警告：

* 解析错误（无效的 JSON 或结构）
* 无效的上下文名称
* 保留快捷键冲突
* 终端复用器冲突
* 同一上下文中的重复绑定

运行 `/doctor` 查看所有快捷键警告。
