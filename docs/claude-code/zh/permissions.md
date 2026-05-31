> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 配置权限

> 通过细粒度的权限规则、模式和托管策略，控制 Claude Code 可以访问和执行的操作。

Claude Code 支持细粒度的权限控制，让你可以精确指定代理被允许执行和禁止执行的操作。权限设置可以提交到版本控制系统并分发给组织中的所有开发者，也可以由个别开发者自行定制。

## 权限系统

Claude Code 使用分层权限系统来平衡能力与安全：

| 工具类型         | 示例          | 需要审批 | "是，不再询问" 行为               |
| :---------------- | :--------------- | :---------------- | :-------------------------------------------- |
| 只读         | 文件读取、Grep | 否                | 不适用                                           |
| Bash 命令     | Shell 执行  | 是               | 按项目目录和命令永久生效 |
| 文件修改 | 编辑/写入文件 | 是               | 直到会话结束                             |

## 管理权限

你可以通过 `/permissions` 查看和管理 Claude Code 的工具权限。此界面列出了所有权限规则及其来源的 settings.json 文件。

* **Allow** 规则允许 Claude Code 无需手动审批即可使用指定工具。
* **Ask** 规则在 Claude Code 尝试使用指定工具时提示确认。
* **Deny** 规则阻止 Claude Code 使用指定工具。

规则按顺序评估：**deny -> ask -> allow**。第一个匹配的规则生效，因此 deny 规则始终优先。

Deny 规则根据其指定的是工具名称还是工具内的模式而有不同的行为。像 `Bash` 这样的裸工具名称会将该工具从 Claude 的上下文中完全移除，因此 Claude 永远看不到它。像 `Bash(rm *)` 这样的限定范围规则会保留工具可用，但在 Claude 尝试调用时阻止匹配的操作。

权限规则由 Claude Code 强制执行，而非由模型执行。你的提示词或 `CLAUDE.md` 中的指令会影响 Claude 尝试执行的操作，但不会改变 Claude Code 允许的操作。要授予或撤销权限，请使用 `/permissions`、此处描述的规则、[权限模式](/zh/permission-modes) 或 [PreToolUse 钩子](#通过钩子扩展权限)。

## 权限模式

Claude Code 支持多种权限模式来控制工具的审批方式。参阅[权限模式](/zh/permission-modes)了解各模式的适用场景。在[设置文件](/zh/settings#settings-files)中设置 `defaultMode`：

| 模式                | 描述                                                                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`           | 标准行为：首次使用每个工具时提示授权                                                                                                |
| `acceptEdits`       | 自动接受工作目录或 `additionalDirectories` 中路径的文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等） |
| `plan`              | 计划模式：Claude 读取文件并运行只读 Shell 命令进行探索，但不编辑源文件                                                     |
| `auto`              | 自动审批工具调用，并通过后台安全检查验证操作是否与你的请求一致。目前为研究预览版                                   |
| `dontAsk`           | 除非通过 `/permissions` 或 `permissions.allow` 规则预先批准，否则自动拒绝工具                                                                              |
| `bypassPermissions` | 跳过所有权限提示。针对根目录和主目录的删除操作（如 `rm -rf /`）仍会作为断路器提示                                                |

`bypassPermissions` 模式会跳过所有权限提示，包括对 `.git`、`.claude`、`.vscode`、`.idea`、`.husky` 和 `.cargo` 的写入。针对文件系统根目录或主目录的删除操作（如 `rm -rf /` 和 `rm -rf ~`）仍会作为防止模型错误的断路器提示。仅在 Claude Code 无法造成损害的隔离环境（如容器或虚拟机）中使用此模式。管理员可以通过在[托管设置](#托管设置)中将 `permissions.disableBypassPermissionsMode` 设置为 `"disable"` 来禁止此模式。

要阻止使用 `bypassPermissions` 或 `auto` 模式，请在任意[设置文件](/zh/settings#settings-files)中将 `permissions.disableBypassPermissionsMode` 或 `permissions.disableAutoMode` 设置为 `"disable"`。这在无法被覆盖的[托管设置](#托管设置)中最为有用。

## 权限规则语法

权限规则遵循 `Tool` 或 `Tool(specifier)` 格式。

### 匹配工具的所有使用

要匹配工具的所有使用，仅使用工具名称而不带括号：

| 规则       | 效果                         |
| :--------- | :----------------------------- |
| `Bash`     | 匹配所有 Bash 命令      |
| `WebFetch` | 匹配所有网页获取请求 |
| `Read`     | 匹配所有文件读取         |

`Bash(*)` 等同于 `Bash`，匹配所有 Bash 命令。作为 deny 规则时，两种形式都会将该工具从 Claude 的上下文中移除。

### 使用限定符进行细粒度控制

在括号中添加限定符以匹配特定的工具使用：

| 规则                           | 效果                                                   |
| :----------------------------- | :------------------------------------------------------- |
| `Bash(npm run build)`          | 匹配精确命令 `npm run build`                |
| `Read(./.env)`                 | 匹配读取当前目录中的 `.env` 文件 |
| `WebFetch(domain:example.com)` | 匹配对 example.com 的获取请求                    |

### 通配符模式

Bash 规则支持使用 `*` 的 glob 模式。通配符可以出现在命令的任意位置。以下配置允许 npm 和 git commit 命令，同时阻止 git push：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Bash(git * main)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "deny": [
      "Bash(git push *)"
    ]
  }
}
```

`*` 前面的空格很重要：`Bash(ls *)` 匹配 `ls -la` 但不匹配 `lsof`，而 `Bash(ls*)` 同时匹配两者。`:*` 后缀是尾部通配符的等效写法，因此 `Bash(ls:*)` 与 `Bash(ls *)` 匹配相同的命令。

当你为命令前缀选择"是，不再询问"时，权限对话框会写入空格分隔的形式。`:*` 形式仅在模式末尾被识别。在 `Bash(git:* push)` 这样的模式中，冒号被视为字面字符，不会匹配 git 命令。

## 工具特定的权限规则

### Bash

Bash 权限规则支持使用 `*` 的通配符匹配。通配符可以出现在命令的任意位置，包括开头、中间或末尾：

* `Bash(npm run build)` 匹配精确的 Bash 命令 `npm run build`
* `Bash(npm run test *)` 匹配以 `npm run test` 开头的 Bash 命令
* `Bash(npm *)` 匹配以 `npm ` 开头的任何命令
* `Bash(* install)` 匹配以 ` install` 结尾的任何命令
* `Bash(git * main)` 匹配类似 `git checkout main` 和 `git log --oneline main` 的命令

单个 `*` 匹配包括空格在内的任意字符序列，因此一个通配符可以跨越多个参数。`Bash(git *)` 匹配 `git log --oneline --all`，`Bash(git * main)` 匹配 `git push origin main` 以及 `git merge main`。

当 `*` 出现在末尾且前面有空格时（如 `Bash(ls *)`），它会强制执行单词边界，要求前缀后跟空格或字符串结尾。例如，`Bash(ls *)` 匹配 `ls -la` 但不匹配 `lsof`。相比之下，没有空格的 `Bash(ls*)` 同时匹配 `ls -la` 和 `lsof`，因为没有单词边界约束。

#### 复合命令

Claude Code 能识别 Shell 运算符，因此像 `Bash(safe-cmd *)` 这样的规则不会授予运行 `safe-cmd && other-cmd` 命令的权限。可识别的命令分隔符包括 `&&`、`||`、`;`、`|`、`|&`、`&` 和换行符。规则必须独立匹配每个子命令。

当你使用"是，不再询问"审批复合命令时，Claude Code 会为每个需要审批的子命令保存单独的规则，而不是为整个复合字符串保存单一规则。例如，审批 `git status && npm test` 会为 `npm test` 保存规则，因此未来的 `npm test` 调用无论前面是什么都会被识别。像 `cd` 进入子目录这样的子命令会为该路径生成自己的 Read 规则。单个复合命令最多可保存 5 条规则。

#### 进程包装器

在匹配 Bash 规则之前，Claude Code 会剥离一组固定的进程包装器，因此像 `Bash(npm test *)` 这样的规则也能匹配 `timeout 30 npm test`。可识别的包装器包括 `timeout`、`time`、`nice`、`nohup` 和 `stdbuf`。

裸 `xargs` 也会被剥离，因此 `Bash(grep *)` 匹配 `xargs grep pattern`。剥离仅在 `xargs` 没有标志时适用：像 `xargs -n1 grep pattern` 这样的调用会作为 `xargs` 命令匹配，因此为内部命令编写的规则不会覆盖它。

此包装器列表是内置的，不可配置。开发环境运行器如 `direnv exec`、`devbox run`、`mise exec`、`npx` 和 `docker exec` 不在列表中。因为这些工具将其参数作为命令执行，像 `Bash(devbox run *)` 这样的规则会匹配 `run` 后面的任何内容，包括 `devbox run rm -rf .`。要审批环境运行器内的操作，请编写包含运行器和内部命令的特定规则，如 `Bash(devbox run npm test)`。为你想允许的每个内部命令添加一条规则。

Exec 包装器如 `watch`、`setsid`、`ionice` 和 `flock` 始终提示，无法通过前缀规则如 `Bash(watch *)` 自动审批。带 `-exec` 或 `-delete` 的 `find` 同样如此：`Bash(find *)` 规则不覆盖这些形式。要审批特定调用，请为完整命令字符串编写精确匹配规则。

#### 只读命令

Claude Code 将一组内置的 Bash 命令识别为只读命令，在任何模式下都无需权限提示即可运行。包括 `ls`、`cat`、`echo`、`pwd`、`head`、`tail`、`grep`、`find`、`wc`、`which`、`diff`、`stat`、`du`、`cd` 以及只读形式的 `git`。该集合不可配置；要对这些命令要求提示，请为其添加 `ask` 或 `deny` 规则。

对于每个标志都是只读的命令，允许使用未引用的 glob 模式，因此 `ls *.ts` 和 `wc -l src/*.py` 无需提示即可运行。对于具有写入能力或执行能力标志的命令（如 `find`、`sort`、`sed` 和 `git`），当存在未引用的 glob 时仍会提示，因为 glob 可能展开为像 `-delete` 这样的标志。

`cd` 进入工作目录或[附加目录](#工作目录)内的路径也是只读的。当每个部分单独符合要求时，像 `cd packages/api && ls` 这样的复合命令无需提示即可运行。在一个复合命令中组合 `cd` 和 `git` 始终会提示，无论目标目录如何。

Bash 权限模式尝试约束命令参数是脆弱的。例如，`Bash(curl http://github.com/ *)` 旨在将 curl 限制为 GitHub URL，但不会匹配以下变体：

* 选项在 URL 前：`curl -X GET http://github.com/...`
* 不同协议：`curl https://github.com/...`
* 重定向：`curl -L http://bit.ly/xyz`（重定向到 github）
* 变量：`URL=http://github.com && curl $URL`
* 多余空格：`curl  http://github.com`

为了更可靠的 URL 过滤，考虑：

* **限制 Bash 网络工具**：使用 deny 规则阻止 `curl`、`wget` 和类似命令，然后使用 WebFetch 工具配合 `WebFetch(domain:github.com)` 权限来允许特定域名
* **使用 PreToolUse 钩子**：实现一个钩子来验证 Bash 命令中的 URL 并阻止不允许的域名
* **添加 CLAUDE.md 指引**：在 `CLAUDE.md` 中描述你允许的 curl 模式。这会影响 Claude 尝试的操作但不强制执行边界，因此请与上述选项之一配合使用

注意，仅使用 WebFetch 不能阻止网络访问。如果 Bash 被允许，Claude 仍然可以使用 `curl`、`wget` 或其他工具访问任何 URL。

### PowerShell

PowerShell 权限规则与 Bash 规则使用相同的格式。使用 `*` 的通配符匹配任意位置，`:*` 后缀等同于尾部 ` *`，裸 `PowerShell` 或 `PowerShell(*)` 匹配所有命令。以下配置允许 `Get-ChildItem` 和 `git commit` 命令，同时阻止 `Remove-Item`：

```json
{
  "permissions": {
    "allow": [
      "PowerShell(Get-ChildItem *)",
      "PowerShell(git commit *)"
    ],
    "deny": [
      "PowerShell(Remove-Item *)"
    ]
  }
}
```

常用别名在匹配前会被规范化。为 cmdlet 名称编写的规则也会匹配其别名，因此 `PowerShell(Get-ChildItem *)` 同时匹配 `gci`、`ls` 和 `dir`。匹配不区分大小写。

Claude Code 解析 PowerShell AST 并独立检查复合命令中的每个命令。管道运算符 `|`、语句分隔符 `;` 以及 PowerShell 7+ 中的链式运算符 `&&` 和 `||` 将复合命令拆分为子命令。规则必须匹配每个子命令才能允许复合命令。

### Read 和 Edit

`Edit` 规则适用于所有编辑文件的内置工具。Claude 尽最大努力将 `Read` 规则应用于所有读取文件的内置工具（如 Grep 和 Glob）、提示词中的 `@file` 提及，以及连接的 [IDE](/zh/vs-code#built-in-ide-mcp-server) 与 Claude 共享的选择和打开文件上下文。

Read 和 Edit 的 deny 规则适用于 Claude 的内置文件工具以及 Claude Code 在 Bash 中识别的文件命令（如 `cat`、`head`、`tail` 和 `sed`）。它们不适用于间接读取或写入文件的任意子进程，如自行打开文件的 Python 或 Node 脚本。要进行操作系统级别的强制执行以阻止所有进程访问路径，请[启用沙箱](/zh/sandboxing)。

Read 和 Edit 规则都遵循 [gitignore](https://git-scm.com/docs/gitignore) 规范，包含四种不同的模式类型：

| 模式            | 含义                                | 示例                          | 匹配                        |
| ------------------ | -------------------------------------- | -------------------------------- | ------------------------------ |
| `//path`           | **绝对路径**（从文件系统根目录） | `Read(//Users/alice/secrets/**)` | `/Users/alice/secrets/**`      |
| `~/path`           | 从**主目录**开始的路径           | `Read(~/Documents/*.pdf)`        | `/Users/alice/Documents/*.pdf` |
| `/path`            | 相对于**项目根目录**的路径      | `Edit(/src/**/*.ts)`             | `<project root>/src/**/*.ts`   |
| `path` 或 `./path` | 相对于**当前目录**的路径 | `Read(*.env)`                    | `<cwd>/*.env`                  |

像 `/Users/alice/file` 这样的模式不是绝对路径。它相对于项目根目录。请使用 `//Users/alice/file` 表示绝对路径。

在 Windows 上，路径在匹配前会被规范化为 POSIX 格式。`C:\Users\alice` 变为 `/c/Users/alice`，因此使用 `//c/**/.env` 匹配该驱动器上任何位置的 `.env` 文件。要匹配所有驱动器，请使用 `//**/.env`。

示例：

* `Edit(/docs/**)`：编辑 `<project>/docs/` 中的文件（不是 `/docs/` 也不是 `<project>/.claude/docs/`）
* `Read(~/.zshrc)`：读取主目录的 `.zshrc`
* `Edit(//tmp/scratch.txt)`：编辑绝对路径 `/tmp/scratch.txt`
* `Read(src/**)`：读取 `<current-directory>/src/` 中的文件

规则仅匹配其锚点下的文件，因此锚点决定了 deny 规则的覆盖范围。裸文件名遵循 gitignore 语义，在任意深度匹配，因此 `Read(.env)` 和 `Read(**/.env)` 是等效的：

| Deny 规则                       | 阻止                                       | 不阻止                                       |
| ------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `Read(.env)` 或 `Read(**/.env)` | 当前目录下或子目录中的任何 `.env` | 父目录或其他项目中的 `.env`      |
| `Read(//**/.env)`               | 文件系统上任何位置的 `.env`        | 无；规则锚定在文件系统根目录 |

在 gitignore 模式中，`*` 匹配单个目录中的文件，而 `**` 跨目录递归匹配。要允许所有文件访问，仅使用工具名称而不带括号：`Read`、`Edit` 或 `Write`。

当 Claude 访问符号链接时，权限规则会检查两个路径：符号链接本身和它解析到的文件。Allow 和 deny 规则对该对路径的处理方式不同：allow 规则会回退到提示你，而 deny 规则直接阻止。

* **Allow 规则**：仅在符号链接路径及其目标都匹配时适用。指向允许目录外部的符号链接仍会提示你。
* **Deny 规则**：在符号链接路径或其目标任一匹配时适用。指向被拒绝文件的符号链接本身也会被拒绝。

例如，当 `Read(./project/**)` 被允许且 `Read(~/.ssh/**)` 被拒绝时，指向 `~/.ssh/id_rsa` 的符号链接 `./project/key` 会被阻止：目标不满足 allow 规则且匹配 deny 规则。

### WebFetch

* `WebFetch(domain:example.com)` 匹配对 example.com 的获取请求

### MCP

* `mcp__puppeteer` 匹配 `puppeteer` 服务器提供的任何工具（在 Claude Code 中配置的名称）
* `mcp__puppeteer__*` 通配符语法，同样匹配 `puppeteer` 服务器的所有工具
* `mcp__puppeteer__puppeteer_navigate` 匹配 `puppeteer` 服务器提供的 `puppeteer_navigate` 工具

### Agent（子代理）

使用 `Agent(AgentName)` 规则控制 Claude 可以使用哪些[子代理](/zh/sub-agents)：

* `Agent(Explore)` 匹配 Explore 子代理
* `Agent(Plan)` 匹配 Plan 子代理
* `Agent(my-custom-agent)` 匹配名为 `my-custom-agent` 的自定义子代理

将这些规则添加到设置中的 `deny` 数组，或使用 `--disallowedTools` CLI 标志禁用特定代理。要禁用 Explore 代理：

```json
{
  "permissions": {
    "deny": ["Agent(Explore)"]
  }
}
```

## 通过钩子扩展权限

[Claude Code 钩子](/zh/hooks-guide)提供了一种注册自定义 Shell 命令在运行时执行权限评估的方式。当 Claude Code 发起工具调用时，PreToolUse 钩子在权限提示之前运行。钩子输出可以拒绝工具调用、强制提示或跳过提示让调用继续执行。

钩子决策不会绕过权限规则。Deny 和 ask 规则无论 PreToolUse 钩子返回什么都会被评估，因此匹配的 deny 规则会阻止调用，匹配的 ask 规则即使钩子返回 `"allow"` 或 `"ask"` 仍会提示。这保留了[管理权限](#管理权限)中描述的 deny 优先级，包括托管设置中设置的 deny 规则。

阻塞钩子也优先于 allow 规则。以退出码 2 退出的钩子会在权限规则评估之前停止工具调用，因此即使 allow 规则允许调用继续，阻塞仍然适用。要在无提示的情况下运行所有 Bash 命令但阻止少数特定命令，请将 `"Bash"` 添加到你的 allow 列表，并注册一个 PreToolUse 钩子来拒绝那些特定命令。参阅[阻止编辑受保护文件](/zh/hooks-guide#block-edits-to-protected-files)获取可适配的钩子脚本。

## 工作目录

默认情况下，Claude 可以访问其启动目录中的文件。你可以扩展此访问范围：

* **启动时**：使用 `--add-dir <path>` CLI 参数
* **会话中**：使用 `/add-dir` 命令
* **持久配置**：在[设置文件](/zh/settings#settings-files)中添加 `additionalDirectories`

附加目录中的文件遵循与原始工作目录相同的权限规则：无需提示即可读取，文件编辑权限遵循当前权限模式。

### 附加目录授予文件访问权限，而非配置

添加目录扩展了 Claude 可以读取和编辑文件的位置。它不会使该目录成为完整的配置根目录：大多数 `.claude/` 配置不会从附加目录发现，尽管少数类型作为例外会被加载。

这些例外仅适用于通过 `--add-dir` 标志或 `/add-dir` 命令添加的目录。设置文件中 `permissions.additionalDirectories` 列出的目录仅授予文件访问权限，不加载以下任何配置。

以下配置类型从 `--add-dir` 目录加载：

| 配置                                                          | 从 `--add-dir` 加载                                                                                                                                            |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/` 中的[技能](/zh/skills)                              | 是，支持实时重载                                                                                                                                              |
| `.claude/settings.json` 中的插件设置                             | 仅 `enabledPlugins` 和 `extraKnownMarketplaces`                                                                                                                 |
| [CLAUDE.md](/zh/memory) 文件、`.claude/rules/` 和 `CLAUDE.local.md` | 仅在设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` 时。`CLAUDE.local.md` 还需要 `local` 设置源，默认已启用 |

子代理、命令和输出样式从当前工作目录及其父目录、用户目录 `~/.claude/` 以及托管设置中发现。钩子和其他 `settings.json` 键从当前工作目录的 `.claude/` 文件夹加载，不回退到父目录，同时加载用户 `~/.claude/settings.json` 和托管设置。要在项目间共享该配置，请使用以下方法之一：

* **用户级配置**：将文件放在 `~/.claude/agents/`、`~/.claude/output-styles/` 或 `~/.claude/settings.json` 中，使其在每个项目中可用
* **插件**：将配置打包并分发为团队可以安装的[插件](/zh/plugins)
* **从配置目录启动**：从包含你想要的 `.claude/` 配置的目录运行 Claude Code

## 权限与沙箱的交互

权限和[沙箱](/zh/sandboxing)是互补的安全层：

* **权限**控制 Claude Code 可以使用哪些工具以及可以访问哪些文件或域名。它们适用于所有工具（Bash、Read、Edit、WebFetch、MCP 等）。
* **沙箱**提供操作系统级别的强制执行，限制 Bash 工具的文件系统和网络访问。它仅适用于 Bash 命令及其子进程。

两者结合使用实现纵深防御：

* 权限 deny 规则阻止 Claude 甚至尝试访问受限资源
* 沙箱限制防止 Bash 命令访问定义边界之外的资源，即使提示词注入绕过了 Claude 的决策
* 沙箱中的文件系统限制将 [`sandbox.filesystem`](/zh/sandboxing) 设置与 Read 和 Edit deny 规则结合；两者合并为最终的沙箱边界
* 网络限制将 WebFetch 权限规则与沙箱的 `allowedDomains` 和 `deniedDomains` 列表结合

当启用沙箱且 `autoAllowBashIfSandboxed: true`（默认值）时，即使你的权限包含 `ask: Bash(*)`，沙箱化的 Bash 命令也会无提示运行。沙箱边界替代了每条命令的提示。显式 deny 规则仍然适用，针对 `/`、主目录或其他关键系统路径的 `rm` 或 `rmdir` 命令仍会触发提示。参阅[沙箱模式](/zh/sandboxing#sandbox-modes)更改此行为。

## 托管设置

对于需要集中控制 Claude Code 配置的组织，管理员可以部署无法被用户或项目设置覆盖的托管设置。这些策略设置遵循与常规设置文件相同的格式，可通过 MDM/操作系统级策略、托管设置文件或[服务器托管设置](/zh/server-managed-settings)分发。参阅[设置文件](/zh/settings#settings-files)了解分发机制和文件位置。

### 仅限托管的设置

以下设置仅从托管设置读取。将其放在用户或项目设置文件中无效。

| 设置                                        | 描述                                                                                                                                                                                                                                                                                                             |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowAllClaudeAiMcps`                         | 为 `true` 时，claude.ai 连接器随部署的 `managed-mcp.json` 一起加载，而非被其独占控制抑制。参阅[托管 MCP 配置](/zh/managed-mcp)                                                                                                                                   |
| `allowedChannelPlugins`                        | 允许推送消息的频道插件白名单。设置后替换默认的 Anthropic 白名单。需要 `channelsEnabled: true`。参阅[限制可运行的频道插件](/zh/channels#restrict-which-channel-plugins-can-run)                                                                             |
| `allowManagedHooksOnly`                        | 为 `true` 时，仅加载托管钩子、SDK 钩子和在托管设置 `enabledPlugins` 中强制启用的插件钩子。用户、项目和所有其他插件钩子被阻止                                                                                                                                 |
| `allowManagedMcpServersOnly`                   | 为 `true` 时，仅遵循托管设置中的 `allowedMcpServers`。`deniedMcpServers` 仍从所有来源合并。参阅[托管 MCP 配置](/zh/managed-mcp)                                                                                                                                           |
| `allowManagedPermissionRulesOnly`              | 为 `true` 时，阻止用户和项目设置定义 `allow`、`ask` 或 `deny` 权限规则。仅托管设置中的规则适用。不影响 MCP 服务器白名单；为此请设置 `allowManagedMcpServersOnly`                                                                                    |
| `blockedMarketplaces`                          | 市场来源的阻止列表。被阻止的来源在下载前检查，因此不会触及文件系统。参阅[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions)                                                                                                  |
| `channelsEnabled`                              | 为组织启用[频道](/zh/channels)。参阅各计划的[企业控制](/zh/channels#enterprise-controls)默认值                                                                                                                                                                           |
| `forceRemoteSettingsRefresh`                   | 为 `true` 时，阻止 CLI 启动直到远程托管设置被全新获取，获取失败则退出。参阅[失败关闭强制执行](/zh/server-managed-settings#enforce-fail-closed-startup)                                                                                                                  |
| `pluginTrustMessage`                           | 追加到安装前显示的插件信任警告的自定义消息                                                                                                                                                                                                                                           |
| `sandbox.filesystem.allowManagedReadPathsOnly` | 为 `true` 时，仅遵循托管设置中的 `filesystem.allowRead` 路径。`denyRead` 仍从所有来源合并                                                                                                                                                                                            |
| `sandbox.network.allowManagedDomainsOnly`      | 为 `true` 时，仅遵循托管设置中的 `allowedDomains` 和 `WebFetch(domain:...)` allow 规则。非允许域名自动阻止，不提示用户。被拒绝的域名仍从所有来源合并                                                                                    |
| `strictKnownMarketplaces`                      | 控制用户可以从哪些插件市场来源添加和安装插件。参阅[托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions)                                                                                                                                      |
| `strictPluginOnlyCustomization`                | 阻止来自用户和项目来源的技能、代理、钩子和 MCP 服务器，使其只能来自插件或托管设置。`true` 锁定所有四个层面；数组如 `["skills", "hooks"]` 仅锁定指定的。参阅 [`strictPluginOnlyCustomization`](/zh/settings#strictpluginonlycustomization) |
| `wslInheritsWindowsSettings`                   | 在 Windows HKLM 注册表键或 `C:\Program Files\ClaudeCode\managed-settings.json` 中为 `true` 时，WSL 除从 `/etc/claude-code` 外还从 Windows 策略链读取托管设置。参阅[设置文件](/zh/settings#settings-files)                                                                      |

`disableBypassPermissionsMode` 通常放在托管设置中以强制执行组织策略，但它在任何范围都有效。用户可以在自己的设置中设置它来锁定自己退出 bypass 模式。

在 Team 和 Enterprise 计划中，管理员可以在 [Claude Code 管理设置](https://claude.ai/admin-settings/claude-code)中组织范围地启用或禁用[远程控制](/zh/remote-control)和[网络会话](/zh/claude-code-on-the-web)。远程控制还可以通过 [`disableRemoteControl`](/zh/settings#available-settings) 托管设置按设备禁用。网络会话没有按设备的托管设置键。

## 设置优先级

权限规则遵循与所有其他 Claude Code 设置相同的[设置优先级](/zh/settings#settings-precedence)：

1. **托管设置**：无法被任何其他级别覆盖，包括命令行参数
2. **命令行参数**：临时会话覆盖
3. **本地项目设置**（`.claude/settings.local.json`）
4. **共享项目设置**（`.claude/settings.json`）
5. **用户设置**（`~/.claude/settings.json`）

如果工具在任何级别被拒绝，其他级别无法允许它。例如，托管设置的 deny 无法被 `--allowedTools` 覆盖，`--disallowedTools` 可以在托管设置定义之外添加限制。

嵌入主机可以在 [`parentSettingsBehavior`](/zh/settings#settings-precedence) 设置为 `"merge"` 时通过 SDK `managedSettings` 选项提供额外的托管策略；嵌入器的值可以收紧策略但不能放松。

例如，如果用户设置允许某权限而项目设置拒绝它，deny 规则会阻止它。反之亦然：用户级别的 deny 会阻止项目级别的 allow，因为任何范围的 deny 规则都在 allow 规则之前评估。

## 示例配置

此[仓库](https://github.com/anthropics/claude-code/tree/main/examples/settings)包含常见部署场景的入门设置配置。将这些作为起点并根据需要调整。

## 另请参阅

* [设置](/zh/settings)：完整的配置参考，包括权限设置表
* [配置 auto 模式](/zh/auto-mode-config)：告知 auto 模式分类器你的组织信任哪些基础设施
* [沙箱](/zh/sandboxing)：Bash 命令的操作系统级文件系统和网络隔离
* [身份验证](/zh/authentication)：设置用户对 Claude Code 的访问
* [安全](/zh/security)：安全保障和最佳实践
* [钩子](/zh/hooks-guide)：自动化工作流和扩展权限评估
