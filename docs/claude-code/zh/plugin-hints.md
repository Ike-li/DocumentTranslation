> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进一步探索。

# 从你的 CLI 推荐插件

> 从你的 CLI 发出一行标记，让 Claude Code 提示用户安装你的官方插件。

如果你维护着一个 CLI 或 SDK，并且在 Anthropic 官方市场中有插件，你的工具可以提示 Claude Code 用户安装该插件。你的 CLI 在检测到自己正在 Claude Code 内部运行时，向 stderr 写入一行标记。Claude Code 读取该标记，从输出中剥离它，并向用户显示一次性的安装提示。

Claude Code 在将命令输出发送给模型之前会剥离提示行，因此该标记永远不会出现在对话中，也不会计入 token 用量。该协议不需要额外的命令，也不会改变你的 CLI 对非 Claude Code 用户的输出内容。

本页面面向 CLI 和 SDK 维护者。如果你想安装插件，请参阅[发现和安装插件](/zh/discover-plugins)。

## 工作原理

Claude Code 为通过 Bash 和 PowerShell 工具运行的每条命令以及[钩子](/zh/hooks)命令设置 [`CLAUDECODE`](/zh/env-vars) 环境变量为 `1`。当你的 CLI 检测到该变量时，它向 stderr 写入一个自闭合的 `<claude-code-hint />` 标签。在钩子命令中，提示标签会被剥离和忽略。只有 Bash 和 PowerShell 工具的输出才会触发安装提示。

当 Claude Code 接收到命令输出时，它会：

1. 扫描提示行并在输出到达模型之前将其移除
2. 检查提示是否指向 Anthropic 官方市场中的插件
3. 检查该插件是否尚未安装且之前未被提示过
4. 向用户显示一个安装提示，标明发出提示的命令

Claude Code 永远不会自动安装插件。用户始终需要确认。

## 发出提示

根据 `CLAUDECODE` 环境变量控制是否发出提示，使标记永远不会出现在人工用户的终端中。然后将标签单独写在 stderr 的一行上。

以下示例为官方市场中名为 `example-cli` 的插件发出提示：

<CodeGroup>
  ```javascript Node.js
  if (process.env.CLAUDECODE) {
    process.stderr.write(
      '<claude-code-hint v="1" type="plugin" value="example-cli@claude-plugins-official" />\n',
    )
  }
  ```

  ```python Python
  import os, sys

  if os.environ.get("CLAUDECODE"):
      print(
          '<claude-code-hint v="1" type="plugin" value="example-cli@claude-plugins-official" />',
          file=sys.stderr,
      )
  ```

  ```go Go
  if os.Getenv("CLAUDECODE") != "" {
      fmt.Fprintln(os.Stderr,
          `<claude-code-hint v="1" type="plugin" value="example-cli@claude-plugins-official" />`)
  }
  ```

  ```shell Shell
  [ -n "$CLAUDECODE" ] &&
    printf '%s\n' '<claude-code-hint v="1" type="plugin" value="example-cli@claude-plugins-official" />' >&2
  ```
</CodeGroup>

将 `example-cli` 替换为你在官方市场中的插件名称。

## 选择发出位置

你可以控制哪些代码路径发出提示。Claude Code 会按插件去重，因此每次调用时发出提示没有任何负面影响。以下是一些效果很好的触点：

| 放置位置               | 为什么有效                                               |
| :--------------------- | :------------------------------------------------------- |
| `--help` 输出          | Claude 在探索不熟悉的 CLI 时通常会运行帮助命令           |
| 未知子命令错误         | 在 Claude 对你的接口感到困惑的时刻触达                   |
| 登录或认证成功         | 用户已处于设置心态                                       |
| 首次运行欢迎消息       | 自然的引导时刻                                           |

## 用户看到的内容

当提示通过所有检查后，Claude Code 会显示如下提示：

```text
─────────────────────────────────────────────────────────────
  插件推荐

    example-cli 命令建议安装一个插件。

    插件：example-cli
    市场：claude-plugins-official
    example-cli 部署的官方集成

    是否要安装？
    ❯ 1. 是，安装 example-cli
      2. 否
      3. 否，并且不再显示插件安装提示

─────────────────────────────────────────────────────────────
```

提示会标明产生提示的命令，以便用户发现工具与其推荐插件之间的不匹配。如果用户在 30 秒内未响应，提示将按**否**处理。

提示频率有以下限制：

* **每个插件一次**：提示显示后，Claude Code 会记录该插件，无论用户的回答如何，都永不再提示。
* **每个会话一次**：在机器上的所有 CLI 中，每个 Claude Code 会话最多出现一次提示。

选择**是**会将插件安装到用户作用域。选择**否，并且不再显示插件安装提示**会为用户禁用所有未来的提示。

## 提示格式

提示是一个带有三个必需属性的自闭合标签。

```text
<claude-code-hint v="1" type="plugin" value="example-cli@claude-plugins-official" />
```

| 属性    | 必需 | 描述                                    |
| :------ | :--- | :-------------------------------------- |
| `v`     | 是   | 协议版本。`1` 是唯一支持的值            |
| `type`  | 是   | 提示类型。`plugin` 是唯一支持的值       |
| `value` | 是   | 插件标识符，格式为 `name@marketplace`   |

属性值可以用双引号引用，也可以不引用。不引用的值不能包含空白字符。不支持转义序列。

## 要求

Claude Code 在处理提示之前会强制执行两个条件。未通过任一检查的提示会被丢弃：

* **独占一行**：标签必须独占一行。嵌入在行中的标签（例如在日志语句内）会被忽略。行首和行尾的空白字符是允许的。
* **官方市场**：`value` 必须引用 Anthropic 控制的市场中的插件，例如 `claude-plugins-official`。指向其他市场的提示会被静默丢弃。

提示行在到达模型之前始终会从输出中移除，即使版本或类型无法识别也是如此，因此标记永远不会计入 token 用量。

以下建议不是强制执行的，Claude Code 无法观察你的 CLI 是否遵循：

* **写入 stderr**：stderr 可以避免标签出现在 shell 管道中，例如 `example-cli deploy | jq`。Claude Code 会扫描两个流，因此 stdout 也可以工作。
* **基于 `CLAUDECODE` 控制**：仅在 `CLAUDECODE` 环境变量被设置时发出提示。这可以防止标记出现在直接运行你的 CLI 的用户面前。

## 将你的插件加入官方市场

提示协议仅对 Anthropic 官方市场 `claude-plugins-official` 中列出的插件生效。Anthropic 自行管理该市场的审核，应用内提交表单会将插件添加到[社区市场](/zh/plugins#submit-your-plugin-to-the-community-marketplace)，提示协议不会检查该市场。如果你正在与 Anthropic 合作伙伴联系人合作，请联系他们以协调官方市场上架。

## 另请参阅

* [创建插件](/zh/plugins)：构建你的 CLI 推荐的插件
* [创建和分发插件市场](/zh/plugin-marketplaces)：在官方市场之外托管插件
* [环境变量](/zh/env-vars)：`CLAUDECODE` 及相关变量的完整参考
