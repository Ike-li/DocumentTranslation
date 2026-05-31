> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 自定义状态栏

> 在 Claude Code 中配置自定义状态栏，以监控上下文窗口使用量、费用和 git 状态

状态栏是 Claude Code 底部的可自定义栏，可运行你配置的任意 shell 脚本。它通过 stdin 接收 JSON 会话数据，并显示脚本输出的任何内容，让你随时一目了然地查看上下文使用量、费用、git 状态或任何你想跟踪的信息。

状态栏在以下场景中非常有用：

* 想在工作时监控上下文窗口使用量
* 需要跟踪会话费用
* 在多个会话之间工作，需要区分它们
* 希望 git 分支和状态始终可见

这是一个[多行状态栏](#显示多行)的示例，第一行显示 git 信息，第二行显示带颜色编码的上下文进度条。

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-multiline.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=60f11387658acc9ff75158ae85f2ac87" alt="A multi-line status line showing model name, directory, git branch on the first line, and a context usage progress bar with cost and duration on the second line" width="776" height="212" data-path="images/statusline-multiline.png" />
</Frame>

本页面将介绍如何[设置基本状态栏](#设置状态栏)、解释[数据如何流动](#状态栏的工作原理)（从 Claude Code 到你的脚本）、列出[所有可显示的字段](#可用数据)，并提供[即用示例](#示例)，涵盖 git 状态、费用跟踪和进度条等常见模式。

## 设置状态栏

使用 [`/statusline` 命令](#使用-statusline-命令)让 Claude Code 为你生成脚本，或[手动创建脚本](#手动配置状态栏)并添加到设置中。

### 使用 /statusline 命令

`/statusline` 命令接受自然语言指令，描述你想显示的内容。Claude Code 会在 `~/.claude/` 中生成脚本文件并自动更新你的设置：

```text
/statusline show model name and context percentage with a progress bar
```

### 手动配置状态栏

在用户设置（`~/.claude/settings.json`，其中 `~` 是你的主目录）或[项目设置](/zh/settings#settings-files)中添加 `statusLine` 字段。将 `type` 设为 `"command"`，并将 `command` 指向脚本路径或内联 shell 命令。有关创建脚本的完整教程，请参阅[逐步构建状态栏](#逐步构建状态栏)。

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 2
  }
}
```

`command` 字段在 shell 中运行，因此你也可以使用内联命令代替脚本文件。此示例使用 `jq` 解析 JSON 输入，并显示模型名称和上下文百分比：

```json
{
  "statusLine": {
    "type": "command",
    "command": "jq -r '\"[\\(.model.display_name)] \\(.context_window.used_percentage // 0)% context\"'"
  }
}
```

可选的 `padding` 字段为状态栏内容添加额外的水平间距（以字符为单位）。默认为 `0`。此内边距是在界面内置间距的基础上额外添加的，因此它控制的是相对缩进而非与终端边缘的绝对距离。

可选的 `refreshInterval` 字段除了[事件驱动更新](#状态栏的工作原理)外，还会每隔 N 秒重新运行你的命令。最小值为 `1`。当状态栏显示基于时间的数据（如时钟），或当后台子代理在主会话空闲时更改了 git 状态时，请设置此项。不设置则仅在事件触发时运行。

可选的 `hideVimModeIndicator` 字段会抑制提示词下方内置的 `-- INSERT --` 文本。当你的脚本自行渲染 [`vim.mode`](#可用数据) 时，将其设为 `true`，以避免模式被显示两次。

### 禁用状态栏

运行 `/statusline` 并要求它移除或清除状态栏（例如 `/statusline delete`、`/statusline clear`、`/statusline remove it`）。你也可以手动从 settings.json 中删除 `statusLine` 字段。

## 逐步构建状态栏

本教程通过手动创建一个显示当前模型、工作目录和上下文窗口使用百分比的状态栏，展示底层的工作原理。

运行带有描述的 [`/statusline`](#使用-statusline-命令) 会自动为你配置所有这些。

这些示例使用 Bash 脚本，适用于 macOS 和 Linux。在 Windows 上，请参阅 [Windows 配置](#windows-配置)了解 PowerShell 和 Git Bash 示例。

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-quickstart.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=696445e59ca0059213250651ad23db6b" alt="A status line showing model name, directory, and context percentage" width="726" height="164" data-path="images/statusline-quickstart.png" />
</Frame>

**第一步：创建读取 JSON 并输出的脚本**

Claude Code 通过 stdin 向你的脚本发送 JSON 数据。此脚本使用 [`jq`](https://jqlang.github.io/jq/)（你可能需要安装的命令行 JSON 解析器）来提取模型名称、目录和上下文百分比，然后打印格式化的一行。

将以下内容保存到 `~/.claude/statusline.sh`（其中 `~` 是你的主目录，例如 macOS 上的 `/Users/username` 或 Linux 上的 `/home/username`）：

```bash
#!/bin/bash
# Read JSON data that Claude Code sends to stdin
input=$(cat)

# Extract fields using jq
MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
# The "// 0" provides a fallback if the field is null
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Output the status line - ${DIR##*/} extracts just the folder name
echo "[$MODEL] 📁 ${DIR##*/} | ${PCT}% context"
```

**第二步：使其可执行**

将脚本标记为可执行，以便你的 shell 可以运行它：

```bash
chmod +x ~/.claude/statusline.sh
```

**第三步：添加到设置**

告诉 Claude Code 将你的脚本作为状态栏运行。将以下配置添加到 `~/.claude/settings.json`，将 `type` 设为 `"command"`（意为"运行此 shell 命令"），并将 `command` 指向你的脚本：

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

你的状态栏将出现在界面底部。设置会自动重新加载，但更改要到你下次与 Claude Code 交互时才会显示。

## 状态栏的工作原理

Claude Code 运行你的脚本，并通过 stdin 将 [JSON 会话数据](#可用数据)传送给它。你的脚本读取 JSON，提取所需内容，并将文本输出到 stdout。Claude Code 显示脚本输出的任何内容。

**何时更新**

你的脚本在每次新的助手消息后、`/compact` 完成后、权限模式更改时或 vim 模式切换时运行。更新有 300ms 的防抖延迟，这意味着快速变化会批量处理，脚本会在稳定后运行一次。如果在脚本仍在运行时触发了新的更新，正在执行的脚本会被取消。如果你编辑了脚本，更改要到下次与 Claude Code 交互触发更新时才会生效。

当主会话空闲时（例如协调器等待后台子代理时），这些触发器可能会静默。为了在空闲期间保持基于时间或外部来源的段是最新的，请设置 [`refreshInterval`](#手动配置状态栏)以在固定定时器上重新运行命令。

**脚本可以输出什么**

* **多行**：每个 `echo` 或 `print` 语句显示为单独的一行。参见[多行示例](#显示多行)。
* **颜色**：使用 [ANSI 转义码](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)，如 `\033[32m` 表示绿色（终端必须支持它们）。参见 [git 状态示例](#带颜色的-git-状态)。
* **链接**：使用 [OSC 8 转义序列](https://en.wikipedia.org/wiki/ANSI_escape_code#OSC)使文本可点击（macOS 上 Cmd+点击，Windows/Linux 上 Ctrl+点击）。需要支持超链接的终端，如 iTerm2、Kitty 或 WezTerm。参见[可点击链接示例](#可点击链接)。

**根据终端调整输出大小**

Claude Code 会捕获脚本的输出而不是将其直接连接到终端，因此 `tput cols` 和语言级别的宽度检测无法在脚本内部读取终端大小。请改为读取 `COLUMNS` 和 `LINES` 环境变量。Claude Code 会在运行脚本之前将它们设置为当前终端尺寸。需要 Claude Code v2.1.153 或更高版本。

状态栏在本地运行，不会消耗 API token。它在某些 UI 交互期间会暂时隐藏，包括自动补全建议、帮助菜单和权限提示。

## 可用数据

Claude Code 通过 stdin 向你的脚本发送以下 JSON 字段：

| 字段 | 描述 |
| --- | --- |
| `model.id`、`model.display_name` | 当前模型标识符和显示名称 |
| `cwd`、`workspace.current_dir` | 当前工作目录。两个字段包含相同的值；推荐使用 `workspace.current_dir` 以与 `workspace.project_dir` 保持一致 |
| `workspace.project_dir` | Claude Code 启动时的目录，如果会话期间工作目录发生变化，可能与 `cwd` 不同 |
| `workspace.added_dirs` | 通过 `/add-dir` 或 `--add-dir` 添加的额外目录。如果没有添加则为空数组 |
| `workspace.git_worktree` | 当当前目录位于使用 `git worktree add` 创建的链接工作树内部时的 Git 工作树名称。在主工作树中不存在。适用于任何 git 工作树，与仅适用于 `--worktree` 会话的 `worktree.*` 不同 |
| `workspace.repo.host`、`workspace.repo.owner`、`workspace.repo.name` | 从 `origin` 远程解析的仓库标识，例如 `"github.com"`、`"anthropics"`、`"claude-code"`。在 git 仓库外部或未配置 `origin` 远程时不存在 |
| `cost.total_cost_usd` | 估算的会话费用（美元），由客户端计算。可能与实际账单不同 |
| `cost.total_duration_ms` | 自会话开始以来的总挂钟时间（毫秒） |
| `cost.total_api_duration_ms` | 等待 API 响应的总时间（毫秒） |
| `cost.total_lines_added`、`cost.total_lines_removed` | 更改的代码行数 |
| `context_window.total_input_tokens`、`context_window.total_output_tokens` | 当前上下文窗口中的 token 计数，来自最近一次 API 响应。输入包括缓存读取和写入。在 v2.1.132 之前，这些是会话累计总数 |
| `context_window.context_window_size` | 最大上下文窗口大小（以 token 为单位）。默认为 200000，扩展上下文模型为 1000000 |
| `context_window.used_percentage` | 预计算的上下文窗口使用百分比 |
| `context_window.remaining_percentage` | 预计算的上下文窗口剩余百分比 |
| `context_window.current_usage` | 来自最近一次 API 调用的 token 计数，详见[上下文窗口字段](#上下文窗口字段) |
| `exceeds_200k_tokens` | 最近一次 API 响应的总 token 数（输入、缓存和输出 token 之和）是否超过 200k。这是固定阈值，与实际上下文窗口大小无关 |
| `effort.level` | 当前推理努力程度（`low`、`medium`、`high`、`xhigh` 或 `max`）。反映实时会话值，包括会话中的 `/effort` 更改。Ultracode 不是独立级别，报告为 `xhigh`。当当前模型不支持 effort 参数时不存在 |
| `thinking.enabled` | 会话是否启用了扩展思考 |
| `rate_limits.five_hour.used_percentage`、`rate_limits.seven_day.used_percentage` | 5 小时或 7 天速率限制已消耗的百分比，从 0 到 100 |
| `rate_limits.five_hour.resets_at`、`rate_limits.seven_day.resets_at` | 5 小时或 7 天速率限制窗口重置的 Unix 纪元秒数 |
| `session_id` | 唯一会话标识符 |
| `session_name` | 通过 `--name` 标志或 `/rename` 设置的自定义会话名称。如果未设置自定义名称则不存在 |
| `transcript_path` | 对话记录文件路径 |
| `version` | Claude Code 版本 |
| `output_style.name` | 当前输出样式的名称 |
| `vim.mode` | 启用 [vim 模式](/zh/interactive-mode#vim-editor-mode)时的当前 vim 模式（`NORMAL`、`INSERT`、`VISUAL` 或 `VISUAL LINE`） |
| `agent.name` | 使用 `--agent` 标志或配置了 agent 设置时的 agent 名称 |
| `pr.number`、`pr.url` | 当前分支的打开的拉取请求。与底部状态栏中的 PR 徽章一致。在找到 PR 之前、不在 git 仓库中或 PR 合并/关闭后不存在 |
| `pr.review_state` | 打开的 PR 的审查状态：`approved`、`pending`、`changes_requested` 或 `draft`。即使 `pr` 存在也可能独立不存在 |
| `worktree.name` | 活动工作树的名称。仅在 `--worktree` 会话期间存在 |
| `worktree.path` | 工作树目录的绝对路径 |
| `worktree.branch` | 工作树的 git 分支名称（例如 `"worktree-my-feature"`）。基于钩子的工作树不存在此字段 |
| `worktree.original_cwd` | Claude 进入工作树之前所在的目录 |
| `worktree.original_branch` | 进入工作树之前签出的 git 分支。基于钩子的工作树不存在此字段 |

**完整 JSON 模式**

你的状态栏命令通过 stdin 接收以下 JSON 结构：

```json
{
  "cwd": "/current/working/directory",
  "session_id": "abc123...",
  "session_name": "my-session",
  "transcript_path": "/path/to/transcript.jsonl",
  "model": {
    "id": "claude-opus-4-8",
    "display_name": "Opus"
  },
  "workspace": {
    "current_dir": "/current/working/directory",
    "project_dir": "/original/project/directory",
    "added_dirs": [],
    "git_worktree": "feature-xyz",
    "repo": {
      "host": "github.com",
      "owner": "anthropics",
      "name": "claude-code"
    }
  },
  "version": "2.1.90",
  "output_style": {
    "name": "default"
  },
  "cost": {
    "total_cost_usd": 0.01234,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15500,
    "total_output_tokens": 1200,
    "context_window_size": 200000,
    "used_percentage": 8,
    "remaining_percentage": 92,
    "current_usage": {
      "input_tokens": 8500,
      "output_tokens": 1200,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 2000
    }
  },
  "exceeds_200k_tokens": false,
  "effort": {
    "level": "high"
  },
  "thinking": {
    "enabled": true
  },
  "rate_limits": {
    "five_hour": {
      "used_percentage": 23.5,
      "resets_at": 1738425600
    },
    "seven_day": {
      "used_percentage": 41.2,
      "resets_at": 1738857600
    }
  },
  "vim": {
    "mode": "NORMAL"
  },
  "agent": {
    "name": "security-reviewer"
  },
  "pr": {
    "number": 1234,
    "url": "https://github.com/anthropics/claude-code/pull/1234",
    "review_state": "pending"
  },
  "worktree": {
    "name": "my-feature",
    "path": "/path/to/.claude/worktrees/my-feature",
    "branch": "worktree-my-feature",
    "original_cwd": "/path/to/project",
    "original_branch": "main"
  }
}
```

**可能不存在的字段**（不在 JSON 中）：

* `session_name`：仅在通过 `--name` 或 `/rename` 设置了自定义名称时出现
* `workspace.git_worktree`：仅当当前目录位于链接的 git 工作树内部时出现
* `workspace.repo`：仅在配置了 `origin` 远程的 git 仓库内部出现
* `effort`：仅当当前模型支持推理努力参数时出现
* `vim`：仅在启用 vim 模式时出现
* `agent`：仅在使用 `--agent` 标志或配置了 agent 设置时出现
* `pr`：仅在当前分支找到打开的 PR 时出现，PR 合并或关闭后会被移除。`pr.review_state` 可能独立不存在
* `worktree`：仅在 `--worktree` 会话期间存在。存在时，基于钩子的工作树的 `branch` 和 `original_branch` 也可能不存在
* `rate_limits`：仅对 Claude.ai 订阅者（Pro/Max）在会话中首次 API 响应后出现。每个窗口（`five_hour`、`seven_day`）可能独立不存在。使用 `jq -r '.rate_limits.five_hour.used_percentage // empty'` 优雅地处理缺失情况。

**可能为 `null` 的字段**：

* `context_window.current_usage`：在会话中首次 API 调用之前为 `null`，在 `/compact` 之后直到下一次 API 调用重新填充之前也为 `null`
* `context_window.used_percentage`、`context_window.remaining_percentage`：在会话早期可能为 `null`

在脚本中使用条件访问处理缺失字段，使用回退默认值处理 null 值。

### 上下文窗口字段

`context_window` 对象描述来自最近一次 API 响应的实时上下文窗口。从 v2.1.132 开始，`total_input_tokens` 和 `total_output_tokens` 反映当前上下文使用量，而非会话累计总数。

* **合并总计**（`total_input_tokens`、`total_output_tokens`）：当前上下文窗口中的 token 数。`total_input_tokens` 是 `input_tokens`、`cache_creation_input_tokens` 和 `cache_read_input_tokens` 的总和；`total_output_tokens` 是最近一次响应的输出 token。两者在首次 API 响应之前均为 `0`。
* **按组件使用量**（`current_usage`）：按类别细分的相同 token 计数。当你需要将缓存命中与新输入分开时使用此项。

`current_usage` 对象包含：

* `input_tokens`：当前上下文中的输入 token
* `output_tokens`：生成的输出 token
* `cache_creation_input_tokens`：写入缓存的 token
* `cache_read_input_tokens`：从缓存读取的 token

有关缓存字段的含义及其计费方式，请参阅[检查缓存性能](/zh/prompt-caching#check-cache-performance)。

`used_percentage` 字段仅从输入 token 计算：`input_tokens + cache_creation_input_tokens + cache_read_input_tokens`。它不包括 `output_tokens`。

如果你从 `current_usage` 手动计算上下文百分比，请使用相同的仅输入公式以匹配 `used_percentage`。

`current_usage` 对象在会话中首次 API 调用之前为 `null`，在 `/compact` 之后直到下一次 API 调用重新填充之前也为 `null`。

## 示例

这些示例展示了常见的状态栏模式。使用任何示例：

1. 将脚本保存到文件，如 `~/.claude/statusline.sh`（或 `.py`/`.js`）
2. 使其可执行：`chmod +x ~/.claude/statusline.sh`
3. 将路径添加到你的[设置](#手动配置状态栏)

Bash 示例使用 [`jq`](https://jqlang.github.io/jq/) 解析 JSON。Python 和 Node.js 有内置的 JSON 解析。

### 上下文窗口使用量

显示当前模型和上下文窗口使用量，并带有可视化进度条。每个脚本从 stdin 读取 JSON，提取 `used_percentage` 字段，并构建一个 10 字符的进度条，其中填充块（▓）表示使用量：

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-context-window-usage.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=15b58ab3602f036939145dde3165c6f7" alt="A status line showing model name and a progress bar with percentage" width="448" height="152" data-path="images/statusline-context-window-usage.png" />
</Frame>

**Bash**

```bash
#!/bin/bash
# Read all of stdin into a variable
input=$(cat)

# Extract fields with jq, "// 0" provides fallback for null
MODEL=$(echo "$input" | jq -r '.model.display_name')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Build progress bar: printf -v creates a run of spaces, then
# ${var// /▓} replaces each space with a block character
BAR_WIDTH=10
FILLED=$((PCT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /▓}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /░}"

echo "[$MODEL] $BAR $PCT%"
```

**Python**

```python
#!/usr/bin/env python3
import json, sys

# json.load reads and parses stdin in one step
data = json.load(sys.stdin)
model = data['model']['display_name']
# "or 0" handles null values
pct = int(data.get('context_window', {}).get('used_percentage', 0) or 0)

# String multiplication builds the bar
filled = pct * 10 // 100
bar = '▓' * filled + '░' * (10 - filled)

print(f"[{model}] {bar} {pct}%")
```

**Node.js**

```javascript
#!/usr/bin/env node
// Node.js reads stdin asynchronously with events
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    // Optional chaining (?.) safely handles null fields
    const pct = Math.floor(data.context_window?.used_percentage || 0);

    // String.repeat() builds the bar
    const filled = Math.floor(pct * 10 / 100);
    const bar = '▓'.repeat(filled) + '░'.repeat(10 - filled);

    console.log(`[${model}] ${bar} ${pct}%`);
});
```

### 带颜色的 git 状态

显示 git 分支，并用颜色编码的指示器标记已暂存和已修改的文件。此脚本使用 [ANSI 转义码](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)实现终端颜色：`\033[32m` 为绿色，`\033[33m` 为黄色，`\033[0m` 重置为默认。

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-git-context.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=e656f34f90d1d9a1d0e220988914345f" alt="A status line showing model, directory, git branch, and colored indicators for staged and modified files" width="742" height="178" data-path="images/statusline-git-context.png" />
</Frame>

每个脚本检查当前目录是否为 git 仓库，计算已暂存和已修改的文件数量，并显示颜色编码的指示器：

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')

GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    STAGED=$(git diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
    MODIFIED=$(git diff --numstat 2>/dev/null | wc -l | tr -d ' ')

    GIT_STATUS=""
    [ "$STAGED" -gt 0 ] && GIT_STATUS="${GREEN}+${STAGED}${RESET}"
    [ "$MODIFIED" -gt 0 ] && GIT_STATUS="${GIT_STATUS}${YELLOW}~${MODIFIED}${RESET}"

    echo -e "[$MODEL] 📁 ${DIR##*/} | 🌿 $BRANCH $GIT_STATUS"
else
    echo "[$MODEL] 📁 ${DIR##*/}"
fi
```

**Python**

```python
#!/usr/bin/env python3
import json, sys, subprocess, os

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])

GREEN, YELLOW, RESET = '\033[32m', '\033[33m', '\033[0m'

try:
    subprocess.check_output(['git', 'rev-parse', '--git-dir'], stderr=subprocess.DEVNULL)
    branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip()
    staged_output = subprocess.check_output(['git', 'diff', '--cached', '--numstat'], text=True).strip()
    modified_output = subprocess.check_output(['git', 'diff', '--numstat'], text=True).strip()
    staged = len(staged_output.split('\n')) if staged_output else 0
    modified = len(modified_output.split('\n')) if modified_output else 0

    git_status = f"{GREEN}+{staged}{RESET}" if staged else ""
    git_status += f"{YELLOW}~{modified}{RESET}" if modified else ""

    print(f"[{model}] 📁 {directory} | 🌿 {branch} {git_status}")
except:
    print(f"[{model}] 📁 {directory}")
```

**Node.js**

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);

    const GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RESET = '\x1b[0m';

    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        const staged = execSync('git diff --cached --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
        const modified = execSync('git diff --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;

        let gitStatus = staged ? `${GREEN}+${staged}${RESET}` : '';
        gitStatus += modified ? `${YELLOW}~${modified}${RESET}` : '';

        console.log(`[${model}] 📁 ${dir} | 🌿 ${branch} ${gitStatus}`);
    } catch {
        console.log(`[${model}] 📁 ${dir}`);
    }
});
```

### 费用和时长跟踪

跟踪会话的 API 费用和经过时间。`cost.total_cost_usd` 字段累计当前会话中所有 API 调用的估算费用。`cost.total_duration_ms` 字段测量自会话开始以来的总经过时间，而 `cost.total_api_duration_ms` 仅跟踪等待 API 响应的时间。

每个脚本将费用格式化为货币，并将毫秒转换为分钟和秒：

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-cost-tracking.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=e3444a51fe6f3440c134bd5f1f08ad29" alt="A status line showing model name, session cost, and duration" width="588" height="180" data-path="images/statusline-cost-tracking.png" />
</Frame>

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

COST_FMT=$(printf '$%.2f' "$COST")
DURATION_SEC=$((DURATION_MS / 1000))
MINS=$((DURATION_SEC / 60))
SECS=$((DURATION_SEC % 60))

echo "[$MODEL] 💰 $COST_FMT | ⏱️ ${MINS}m ${SECS}s"
```

**Python**

```python
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
model = data['model']['display_name']
cost = data.get('cost', {}).get('total_cost_usd', 0) or 0
duration_ms = data.get('cost', {}).get('total_duration_ms', 0) or 0

duration_sec = duration_ms // 1000
mins, secs = duration_sec // 60, duration_sec % 60

print(f"[{model}] 💰 ${cost:.2f} | ⏱️ {mins}m {secs}s")
```

**Node.js**

```javascript
#!/usr/bin/env node
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const cost = data.cost?.total_cost_usd || 0;
    const durationMs = data.cost?.total_duration_ms || 0;

    const durationSec = Math.floor(durationMs / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;

    console.log(`[${model}] 💰 $${cost.toFixed(2)} | ⏱️ ${mins}m ${secs}s`);
});
```

### 显示多行

你的脚本可以输出多行以创建更丰富的显示。每个 `echo` 语句在状态区域中产生单独的一行。

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-multiline.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=60f11387658acc9ff75158ae85f2ac87" alt="A multi-line status line showing model name, directory, git branch on the first line, and a context usage progress bar with cost and duration on the second line" width="776" height="212" data-path="images/statusline-multiline.png" />
</Frame>

此示例结合了多种技术：基于阈值的颜色（低于 70% 为绿色，70-89% 为黄色，90%+ 为红色）、进度条和 git 分支信息。每个 `print` 或 `echo` 语句创建单独的一行：

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

CYAN='\033[36m'; GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; RESET='\033[0m'

# Pick bar color based on context usage
if [ "$PCT" -ge 90 ]; then BAR_COLOR="$RED"
elif [ "$PCT" -ge 70 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$GREEN"; fi

FILLED=$((PCT / 10)); EMPTY=$((10 - FILLED))
printf -v FILL "%${FILLED}s"; printf -v PAD "%${EMPTY}s"
BAR="${FILL// /█}${PAD// /░}"

MINS=$((DURATION_MS / 60000)); SECS=$(((DURATION_MS % 60000) / 1000))

BRANCH=""
git rev-parse --git-dir > /dev/null 2>&1 && BRANCH=" | 🌿 $(git branch --show-current 2>/dev/null)"

echo -e "${CYAN}[$MODEL]${RESET} 📁 ${DIR##*/}$BRANCH"
COST_FMT=$(printf '$%.2f' "$COST")
echo -e "${BAR_COLOR}${BAR}${RESET} ${PCT}% | ${YELLOW}${COST_FMT}${RESET} | ⏱️ ${MINS}m ${SECS}s"
```

**Python**

```python
#!/usr/bin/env python3
import json, sys, subprocess, os

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])
cost = data.get('cost', {}).get('total_cost_usd', 0) or 0
pct = int(data.get('context_window', {}).get('used_percentage', 0) or 0)
duration_ms = data.get('cost', {}).get('total_duration_ms', 0) or 0

CYAN, GREEN, YELLOW, RED, RESET = '\033[36m', '\033[32m', '\033[33m', '\033[31m', '\033[0m'

bar_color = RED if pct >= 90 else YELLOW if pct >= 70 else GREEN
filled = pct // 10
bar = '█' * filled + '░' * (10 - filled)

mins, secs = duration_ms // 60000, (duration_ms % 60000) // 1000

try:
    branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True, stderr=subprocess.DEVNULL).strip()
    branch = f" | 🌿 {branch}" if branch else ""
except:
    branch = ""

print(f"{CYAN}[{model}]{RESET} 📁 {directory}{branch}")
print(f"{bar_color}{bar}{RESET} {pct}% | {YELLOW}${cost:.2f}{RESET} | ⏱️ {mins}m {secs}s")
```

**Node.js**

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);
    const cost = data.cost?.total_cost_usd || 0;
    const pct = Math.floor(data.context_window?.used_percentage || 0);
    const durationMs = data.cost?.total_duration_ms || 0;

    const CYAN = '\x1b[36m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RED = '\x1b[31m', RESET = '\x1b[0m';

    const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
    const filled = Math.floor(pct / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);

    let branch = '';
    try {
        branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        branch = branch ? ` | 🌿 ${branch}` : '';
    } catch {}

    console.log(`${CYAN}[${model}]${RESET} 📁 ${dir}${branch}`);
    console.log(`${barColor}${bar}${RESET} ${pct}% | ${YELLOW}$${cost.toFixed(2)}${RESET} | ⏱️ ${mins}m ${secs}s`);
});
```

### 可点击链接

此示例创建指向 GitHub 仓库的可点击链接。它读取 git 远程 URL，使用 `sed` 将 SSH 格式转换为 HTTPS，并用 OSC 8 转义码包裹仓库名称。按住 Cmd（macOS）或 Ctrl（Windows/Linux）并点击以在浏览器中打开链接。

<Frame>
  <img src="https://mintcdn.com/claude-code/nibzesLaJVh4ydOq/images/statusline-links.png?fit=max&auto=format&n=nibzesLaJVh4ydOq&q=85&s=4bcc6e7deb7cf52f41ab85a219b52661" alt="A status line showing a clickable link to a GitHub repository" width="726" height="198" data-path="images/statusline-links.png" />
</Frame>

每个脚本获取 git 远程 URL，将 SSH 格式转换为 HTTPS，并用 OSC 8 转义码包裹仓库名称。Bash 版本使用 `printf '%b'`，它在不同 shell 之间比 `echo -e` 更可靠地解释反斜杠转义：

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')

# Convert git SSH URL to HTTPS
REMOTE=$(git remote get-url origin 2>/dev/null | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')

if [ -n "$REMOTE" ]; then
    REPO_NAME=$(basename "$REMOTE")
    # OSC 8 format: \e]8;;URL\a then TEXT then \e]8;;\a
    # printf %b interprets escape sequences reliably across shells
    printf '%b' "[$MODEL] 🔗 \e]8;;${REMOTE}\a${REPO_NAME}\e]8;;\a\n"
else
    echo "[$MODEL]"
fi
```

**Python**

```python
#!/usr/bin/env python3
import json, sys, subprocess, re, os

data = json.load(sys.stdin)
model = data['model']['display_name']

# Get git remote URL
try:
    remote = subprocess.check_output(
        ['git', 'remote', 'get-url', 'origin'],
        stderr=subprocess.DEVNULL, text=True
    ).strip()
    # Convert SSH to HTTPS format
    remote = re.sub(r'^git@github\.com:', 'https://github.com/', remote)
    remote = re.sub(r'\.git$', '', remote)
    repo_name = os.path.basename(remote)
    # OSC 8 escape sequences
    link = f"\033]8;;{remote}\a{repo_name}\033]8;;\a"
    print(f"[{model}] 🔗 {link}")
except:
    print(f"[{model}]")
```

**Node.js**

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;

    try {
        let remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        // Convert SSH to HTTPS format
        remote = remote.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
        const repoName = path.basename(remote);
        // OSC 8 escape sequences
        const link = `\x1b]8;;${remote}\x07${repoName}\x1b]8;;\x07`;
        console.log(`[${model}] 🔗 ${link}`);
    } catch {
        console.log(`[${model}]`);
    }
});
```

### 速率限制使用量

在状态栏中显示 Claude.ai 订阅速率限制使用量。`rate_limits` 对象包含 `five_hour`（5 小时滚动窗口）和 `seven_day`（每周）窗口。每个窗口提供 `used_percentage`（0-100）和 `resets_at`（窗口重置的 Unix 纪元秒数）。

此字段仅对 Claude.ai 订阅者（Pro/Max）在首次 API 响应后出现。每个脚本优雅地处理字段缺失的情况：

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
# "// empty" produces no output when rate_limits is absent
FIVE_H=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
WEEK=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')

LIMITS=""
[ -n "$FIVE_H" ] && LIMITS="5h: $(printf '%.0f' "$FIVE_H")%"
[ -n "$WEEK" ] && LIMITS="${LIMITS:+$LIMITS }7d: $(printf '%.0f' "$WEEK")%"

[ -n "$LIMITS" ] && echo "[$MODEL] | $LIMITS" || echo "[$MODEL]"
```

**Python**

```python
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
model = data['model']['display_name']

parts = []
rate = data.get('rate_limits', {})
five_h = rate.get('five_hour', {}).get('used_percentage')
week = rate.get('seven_day', {}).get('used_percentage')

if five_h is not None:
    parts.append(f"5h: {five_h:.0f}%")
if week is not None:
    parts.append(f"7d: {week:.0f}%")

if parts:
    print(f"[{model}] | {' '.join(parts)}")
else:
    print(f"[{model}]")
```

**Node.js**

```javascript
#!/usr/bin/env node
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;

    const parts = [];
    const fiveH = data.rate_limits?.five_hour?.used_percentage;
    const week = data.rate_limits?.seven_day?.used_percentage;

    if (fiveH != null) parts.push(`5h: ${Math.round(fiveH)}%`);
    if (week != null) parts.push(`7d: ${Math.round(week)}%`);

    console.log(parts.length ? `[${model}] | ${parts.join(' ')}` : `[${model}]`);
});
```

### 缓存耗时操作

你的状态栏脚本在活跃会话期间运行频繁。`git status` 或 `git diff` 等命令可能很慢，尤其是在大型仓库中。此示例将 git 信息缓存到临时文件，并仅每 5 秒刷新一次。

缓存文件名需要在会话内的状态栏调用之间保持稳定，但在不同会话之间唯一，以避免不同仓库中的并发会话读取彼此缓存的 git 状态。基于进程的标识符如 `$$`、`os.getpid()` 或 `process.pid` 在每次调用时都会变化，会使缓存失效。请改用 JSON 输入中的 `session_id`：它在会话生命周期内稳定且每个会话唯一。

每个脚本在运行 git 命令之前检查缓存文件是否缺失或超过 5 秒：

**Bash**

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
SESSION_ID=$(echo "$input" | jq -r '.session_id')

CACHE_FILE="/tmp/statusline-git-cache-$SESSION_ID"
CACHE_MAX_AGE=5  # seconds

cache_is_stale() {
    [ ! -f "$CACHE_FILE" ] || \
    # stat -f %m is macOS, stat -c %Y is Linux
    [ $(($(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0))) -gt $CACHE_MAX_AGE ]
}

if cache_is_stale; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        BRANCH=$(git branch --show-current 2>/dev/null)
        STAGED=$(git diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
        MODIFIED=$(git diff --numstat 2>/dev/null | wc -l | tr -d ' ')
        echo "$BRANCH|$STAGED|$MODIFIED" > "$CACHE_FILE"
    else
        echo "||" > "$CACHE_FILE"
    fi
fi

IFS='|' read -r BRANCH STAGED MODIFIED < "$CACHE_FILE"

if [ -n "$BRANCH" ]; then
    echo "[$MODEL] 📁 ${DIR##*/} | 🌿 $BRANCH +$STAGED ~$MODIFIED"
else
    echo "[$MODEL] 📁 ${DIR##*/}"
fi
```

**Python**

```python
#!/usr/bin/env python3
import json, sys, subprocess, os, time

data = json.load(sys.stdin)
model = data['model']['display_name']
directory = os.path.basename(data['workspace']['current_dir'])
session_id = data['session_id']

CACHE_FILE = f"/tmp/statusline-git-cache-{session_id}"
CACHE_MAX_AGE = 5  # seconds

def cache_is_stale():
    if not os.path.exists(CACHE_FILE):
        return True
    return time.time() - os.path.getmtime(CACHE_FILE) > CACHE_MAX_AGE

if cache_is_stale():
    try:
        subprocess.check_output(['git', 'rev-parse', '--git-dir'], stderr=subprocess.DEVNULL)
        branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip()
        staged = subprocess.check_output(['git', 'diff', '--cached', '--numstat'], text=True).strip()
        modified = subprocess.check_output(['git', 'diff', '--numstat'], text=True).strip()
        staged_count = len(staged.split('\n')) if staged else 0
        modified_count = len(modified.split('\n')) if modified else 0
        with open(CACHE_FILE, 'w') as f:
            f.write(f"{branch}|{staged_count}|{modified_count}")
    except:
        with open(CACHE_FILE, 'w') as f:
            f.write("||")

with open(CACHE_FILE) as f:
    branch, staged, modified = f.read().strip().split('|')

if branch:
    print(f"[{model}] 📁 {directory} | 🌿 {branch} +{staged} ~{modified}")
else:
    print(f"[{model}] 📁 {directory}")
```

**Node.js**

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);
    const sessionId = data.session_id;

    const CACHE_FILE = `/tmp/statusline-git-cache-${sessionId}`;
    const CACHE_MAX_AGE = 5; // seconds

    const cacheIsStale = () => {
        if (!fs.existsSync(CACHE_FILE)) return true;
        return (Date.now() / 1000) - fs.statSync(CACHE_FILE).mtimeMs / 1000 > CACHE_MAX_AGE;
    };

    if (cacheIsStale()) {
        try {
            execSync('git rev-parse --git-dir', { stdio: 'ignore' });
            const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            const staged = execSync('git diff --cached --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
            const modified = execSync('git diff --numstat', { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
            fs.writeFileSync(CACHE_FILE, `${branch}|${staged}|${modified}`);
        } catch {
            fs.writeFileSync(CACHE_FILE, '||');
        }
    }

    const [branch, staged, modified] = fs.readFileSync(CACHE_FILE, 'utf8').trim().split('|');

    if (branch) {
        console.log(`[${model}] 📁 ${dir} | 🌿 ${branch} +${staged} ~${modified}`);
    } else {
        console.log(`[${model}] 📁 ${dir}`);
    }
});
```

### Windows 配置

在 Windows 上，当安装了 Git Bash 时，Claude Code 通过 Git Bash 运行状态栏命令；当没有 Git Bash 时，通过 PowerShell 运行。

Git Bash 将未引用的反斜杠视为转义字符，因此 Windows 风格的路径如 `C:\Users\username\script.mjs` 到达脚本运行器时分隔符会被移除，命令会无声地失败。在 `command` 字符串中使用正斜杠编写文件路径，如下例所示。`~` 简写也有效，会展开为你的 Windows 主目录。

要将 PowerShell 脚本作为状态栏运行，通过 `powershell` 调用它。无论 Claude Code 是通过 Git Bash 还是 PowerShell 路由命令，这都有效：

**settings.json**

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -File C:/Users/username/.claude/statusline.ps1"
  }
}
```

**statusline.ps1**

```powershell
$input_json = $input | Out-String | ConvertFrom-Json
$cwd = $input_json.cwd
$model = $input_json.model.display_name
$used = $input_json.context_window.used_percentage
$dirname = Split-Path $cwd -Leaf

if ($used) {
    Write-Host "$dirname [$model] ctx: $used%"
} else {
    Write-Host "$dirname [$model]"
}
```

或者，当安装了 Git Bash 时，直接运行 Bash 脚本：

**settings.json**

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

**statusline.sh**

```bash
#!/usr/bin/env bash
input=$(cat)
cwd=$(echo "$input" | grep -o '"cwd":"[^"]*"' | cut -d'"' -f4)
model=$(echo "$input" | grep -o '"display_name":"[^"]*"' | cut -d'"' -f4)
dirname="${cwd##*[/\\]}"
echo "$dirname [$model]"
```

## 子代理状态栏

`subagentStatusLine` 设置为提示词下方 agent 面板中显示的每个[子代理](/zh/sub-agents)渲染自定义行主体。用它来替换默认的 `name · description · token count` 行，使用你自己的格式。

```json
{
  "subagentStatusLine": {
    "type": "command",
    "command": "~/.claude/subagent-statusline.sh"
  }
}
```

该命令在每次刷新时运行一次，所有可见的子代理行作为单个 JSON 对象通过 stdin 传入。输入包括[基础钩子字段](/zh/hooks#common-input-fields)加上 `columns`（可用行宽度）和一个 `tasks` 数组，其中每个任务有 `id`、`name`、`type`、`status`、`description`、`label`、`startTime`、`tokenCount`、`tokenSamples` 和 `cwd`。

为你想覆盖的每一行向 stdout 写入一行 JSON，格式为 `{"id": "<task id>", "content": "<row body>"}`。`content` 字符串按原样渲染，包括 ANSI 颜色和 OSC 8 超链接。省略任务的 `id` 以保持该行的默认渲染；输出空的 `content` 字符串以隐藏它。

适用于 `statusLine` 的相同信任和 `disableAllHooks` 门控也适用于此处。插件可以在其 [`settings.json`](/zh/plugins-reference#standard-plugin-layout) 中提供默认的 `subagentStatusLine`。

## 提示

* **使用模拟输入测试**：`echo '{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/home/user/project"},"context_window":{"used_percentage":25},"session_id":"test-session-abc"}' | ./statusline.sh`
* **保持输出简短**：状态栏宽度有限，过长的输出可能被截断或换行不美观
* **缓存耗时操作**：你的脚本在活跃会话期间运行频繁，因此 `git status` 等命令可能导致延迟。参见[缓存示例](#缓存耗时操作)了解如何处理。

社区项目如 [ccstatusline](https://github.com/sirmalloc/ccstatusline) 和 [starship-claude](https://github.com/martinemde/starship-claude) 提供了带有主题和额外功能的预构建配置。

## 故障排除

**状态栏不显示**

* 验证你的脚本是否可执行：`chmod +x ~/.claude/statusline.sh`
* 检查脚本是否输出到 stdout 而非 stderr
* 手动运行脚本以验证它能产生输出
* 在安装了 Git Bash 的 Windows 上，`command` 路径中的反斜杠可能在脚本运行前被当作转义字符消耗。在路径中使用正斜杠。参见 [Windows 配置](#windows-配置)。
* 如果设置中 `disableAllHooks` 设为 `true`，状态栏也会被禁用。移除此设置或将其设为 `false` 以重新启用。
* 运行 `claude --debug` 以在会话中首次状态栏调用时记录退出代码和 stderr
* 让 Claude 读取你的设置文件并直接执行 `statusLine` 命令以暴露错误

**状态栏显示 `--` 或空值**

* 字段可能在首次 API 响应完成之前为 `null`
* 在脚本中使用回退值处理 null 值，如 jq 中的 `// 0`
* 如果多条消息后值仍为空，请重启 Claude Code

**上下文百分比显示异常值**

* 使用 `used_percentage` 获取最简单的准确上下文状态
* 上下文百分比可能因计算时机不同而与 `/context` 输出不同

**OSC 8 链接不可点击**

* 验证你的终端是否支持 OSC 8 超链接（iTerm2、Kitty、WezTerm）

* Terminal.app 不支持可点击链接

* 如果链接文本显示但不可点击，Claude Code 可能未检测到终端的超链接支持。这通常影响 Windows Terminal 和不在自动检测列表中的其他模拟器。在启动 Claude Code 前设置 `FORCE_HYPERLINK` 环境变量以覆盖检测：

  ```bash
  FORCE_HYPERLINK=1 claude
  ```

  在 PowerShell 中，先在当前会话中设置变量：

  ```powershell
  $env:FORCE_HYPERLINK = "1"; claude
  ```

* SSH 和 tmux 会话可能会根据配置剥离 OSC 序列

* 如果转义序列显示为字面文本如 `\e]8;;`，请使用 `printf '%b'` 代替 `echo -e` 以获得更可靠的转义处理

**转义序列显示异常**

* 复杂的转义序列（ANSI 颜色、OSC 8 链接）偶尔在与其他 UI 更新重叠时可能导致输出乱码
* 如果看到损坏的文本，请尝试将脚本简化为纯文本输出
* 带转义码的多行状态栏比单行纯文本更容易出现渲染问题

**需要工作区信任**

* 状态栏命令仅在你接受了当前目录的工作区信任对话框后才会运行。因为 `statusLine` 执行 shell 命令，所以它需要与钩子和其他 shell 执行设置相同的信任接受。
* 如果未接受信任，你会看到通知 `statusline skipped · restart to fix` 而非状态栏输出。重启 Claude Code 并接受信任提示以启用它。

**脚本错误或挂起**

* 以非零代码退出或不产生输出的脚本会导致状态栏变空白
* 慢脚本会阻止状态栏更新直到完成。保持脚本快速以避免输出过时。
* 如果在慢脚本运行时触发了新的更新，正在执行的脚本会被取消
* 在配置前使用模拟输入独立测试脚本

**通知共享状态栏行**

* MCP 服务器错误和自动更新等系统通知显示在状态栏所在行的右侧。上下文过低警告等瞬态通知也会在此区域轮换显示。
* 启用详细模式会在此区域添加 token 计数器
* 在窄终端上，这些通知可能会截断你的状态栏输出
