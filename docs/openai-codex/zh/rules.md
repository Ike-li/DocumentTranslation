# 规则

使用规则来控制 Codex 可以在沙箱之外运行哪些命令。

规则是实验性的，可能会发生变化。

## 创建规则文件

1. 在活动配置层旁边的 `rules/` 文件夹下创建一个 `.rules` 文件（例如 `~/.codex/rules/default.rules`）。
2. 添加一条规则。以下示例在允许 `gh pr view` 在沙箱之外运行之前会进行提示。

   ```python
   # 在沙箱外运行以 `gh pr view` 为前缀的命令之前进行提示。
   prefix_rule(
       # 要匹配的前缀。
       pattern = ["gh", "pr", "view"],

       # Codex 请求运行匹配命令时要采取的操作。
       decision = "prompt",

       # 此规则存在的可选理由。
       justification = "Viewing PRs is allowed with approval",

       # `match` 和 `not_match` 是可选的"内联单元测试"，你可以
       # 提供应该（或不应该）匹配此规则的命令示例。
       match = [
           "gh pr view 7888",
           "gh pr view --repo openai/codex",
           "gh pr view 7888 --json title,body,comments",
       ],
       not_match = [
           # 不匹配，因为 `pattern` 必须是精确前缀。
           "gh pr --repo openai/codex view 7888",
       ],
   )
   ```

3. 重启 Codex。

Codex 在启动时会扫描每个活动配置层下的 `rules/`，包括[团队配置](https://developers.openai.com/codex/enterprise/admin-setup#team-config)位置和用户层的 `~/.codex/rules/`。项目本地规则（位于 `<repo>/.codex/rules/` 下）仅在项目 `.codex/` 层受信任时才会加载。

当你在 TUI 中将命令添加到允许列表时，Codex 会写入用户层的 `~/.codex/rules/default.rules`，以便后续运行可以跳过提示。

当智能批准功能启用时（默认启用），Codex 可能会在升级请求期间为你建议一个 `prefix_rule`。在接受之前请仔细审查建议的前缀。

管理员还可以通过 [`requirements.toml`](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 强制执行限制性的 `prefix_rule` 条目。

## 理解规则字段

`prefix_rule()` 支持以下字段：

- `pattern` **（必需）**：一个非空列表，定义要匹配的命令前缀。每个元素可以是：
  - 字面量字符串（例如 `"pr"`）。
  - 字面量的联合（例如 `["view", "list"]`），用于匹配该参数位置的多个选项。
- `decision` **（默认为 `"allow"`）**：规则匹配时要采取的操作。当多条规则匹配时，Codex 会应用最严格的决策（`forbidden` > `prompt` > `allow`）。
  - `allow`：在沙箱外运行命令，无需提示。
  - `prompt`：每次匹配的调用前都进行提示。
  - `forbidden`：阻止请求，无需提示。
- `justification` **（可选）**：规则的非空、人类可读的理由。Codex 可能会在批准提示或拒绝消息中展示它。当你使用 `forbidden` 时，请在理由中包含推荐的替代方案（例如 `"Use \`rg\` instead of \`grep\`."`）。
- `match` 和 `not_match` **（默认为 `[]`）**：Codex 在加载规则时会验证的示例。使用这些示例可以在规则生效前捕获错误。

当 Codex 考虑运行某个命令时，它会将命令的参数列表与 `pattern` 进行比较。在内部，Codex 将命令视为参数列表（类似于 `execvp(3)` 接收的内容）。

## Shell 包装器和复合命令

一些工具会将多个 shell 命令包装到单次调用中，例如：

```text
["bash", "-lc", "git add . && rm -rf /"]
```

由于这类命令可以在一个字符串中隐藏多个操作，Codex 会特殊处理 `bash -lc`、`bash -c` 以及它们的 `zsh` / `sh` 等价形式。

### 当 Codex 可以安全拆分脚本时

如果 shell 脚本是仅由以下内容组成的线性命令链：

- 纯单词（无变量展开、无 `VAR=...`、`$FOO`、`*` 等）
- 通过安全运算符（`&&`、`||`、`;` 或 `|`）连接

则 Codex 会解析它（使用 tree-sitter）并在应用规则之前将其拆分为单独的命令。

上面的脚本被视为两个单独的命令：

- `["git", "add", "."]`
- `["rm", "-rf", "/"]`

Codex 然后根据你的规则评估每个命令，最严格的结果生效。

即使你允许 `pattern=["git", "add"]`，Codex 也不会自动允许 `git add . && rm -rf /`，因为 `rm -rf /` 部分会被单独评估，并阻止整个调用被自动允许。

这可以防止危险命令被夹带在安全命令中。

### 当 Codex 不拆分脚本时

如果脚本使用更高级的 shell 功能，例如：

- 重定向（`>`、`>>`、`<`）
- 替换（`$(...)`、`` `...` ``）
- 环境变量（`FOO=bar`）
- 通配符模式（`*`、`?`）
- 控制流（`if`、`for`、带赋值的 `&&` 等）

则 Codex 不会尝试解释或拆分它。

在这些情况下，整个调用被视为：

```text
["bash", "-lc", "<full script>"]
```

你的规则将应用于该**单次**调用。

通过这种处理方式，当安全时你可以获得逐命令评估的安全性，当不安全时则采用保守行为。

## 测试规则文件

使用 `codex execpolicy check` 来测试你的规则如何应用于某个命令：

```shell
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

该命令会输出 JSON，显示最严格的决策和所有匹配的规则，包括匹配规则中的任何 `justification` 值。使用多个 `--rules` 标志可以组合文件，添加 `--pretty` 可以格式化输出。

## 理解规则语言

`.rules` 文件格式使用 `Starlark`（参见[语言规范](https://github.com/bazelbuild/starlark/blob/master/spec.md)）。其语法类似 Python，但被设计为可以安全运行：规则引擎可以无副作用地运行它（例如不会触及文件系统）。
