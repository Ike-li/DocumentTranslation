> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进一步探索。

# 使用工作树运行并行会话

> 在独立的 git 工作树中隔离并行 Claude Code 会话，避免变更冲突。涵盖 `--worktree` 标志、子代理隔离、`.worktreeinclude`、清理以及非 git VCS 钩子。

[Git 工作树](https://git-scm.com/docs/git-worktree)是一个独立的工作目录，拥有自己的文件和分支，与主检出共享相同的仓库历史和远程。在各自的工作树中运行每个 Claude Code 会话意味着一个会话中的编辑永远不会影响另一个会话的文件，因此你可以让 Claude 在一个终端中构建功能，同时在另一个终端中修复 bug。

本页介绍 CLI 中的工作树隔离。以下内容均假设使用 git 仓库。对于其他版本控制系统，请参阅[非 git 版本控制](#非-git-版本控制)。[桌面应用](/zh/desktop#work-in-parallel-with-sessions)会为每个新会话自动创建工作树。

工作树是并行运行 Claude 的几种方式之一。它们隔离文件编辑，而[子代理](/zh/sub-agents)和[代理团队](/zh/agent-teams)则协调工作本身。请参阅[并行运行代理](/zh/agents)以比较各方法，或直接跳转到[使用工作树隔离子代理]以将工作树和子代理结合使用。

## 在工作树中启动 Claude

传递 `--worktree` 或 `-w` 来创建隔离的工作树并在其中启动 Claude。默认情况下，工作树创建在仓库根目录下的 `.claude/worktrees/<值>/`，位于名为 `worktree-<值>` 的新分支上：

```bash
claude --worktree feature-auth
```

要将工作树放在其他位置，请配置 [`WorktreeCreate` 钩子](#非-git-版本控制)。在另一个终端中使用不同名称再次运行该命令即可启动第二个隔离会话：

```bash
claude --worktree bugfix-123
```

如果省略名称，Claude 会生成一个类似 `bright-running-fox` 的名称：

```bash
claude --worktree
```

你也可以在会话期间让 Claude "在工作树中工作"，它会使用 [`EnterWorktree`](/zh/tools-reference) 工具创建一个。进入工作树后，Claude 可以通过调用 `EnterWorktree` 并指定目标路径直接切换到 `.claude/worktrees/` 下的另一个工作树。之前的工作树会保留在磁盘上不受影响。

首次在目录中使用 `--worktree` 之前，请先在该目录中运行一次 `claude` 以接受工作区信任对话框。如果尚未接受信任，`--worktree` 会报错退出并提示你先在该目录中运行 `claude`，包括与 `-p` 组合使用时。

**提示**：将 `.claude/worktrees/` 添加到 `.gitignore`，这样工作树内容不会作为未跟踪文件出现在主检出中。

### 选择基础分支

工作树从仓库的默认分支 `origin/HEAD` 创建分支，因此它们从与远程匹配的干净树开始。如果未配置远程或获取失败，工作树会回退到当前本地 `HEAD`。要始终从本地 `HEAD` 创建分支，请在[设置](/zh/settings#worktree-settings)中将 `worktree.baseRef` 设为 `"head"`。将 `baseRef` 设为 `"head"` 会使新工作树携带你未推送的提交和功能分支状态，这对于隔离需要处理进行中工作的子代理很有用。该设置仅接受 `"fresh"` 或 `"head"`，不接受任意 git 引用：

```json
{
  "worktree": {
    "baseRef": "head"
  }
}
```

要从特定拉取请求创建分支，请传递以 `#` 为前缀的 PR 编号，或完整的 GitHub 拉取请求 URL。Claude Code 会从 `origin` 获取 `pull/<number>/head` 并在 `.claude/worktrees/pr-<number>` 创建工作树：

```bash
claude --worktree "#1234"
```

要完全控制工作树的创建方式，请配置 [`WorktreeCreate` 钩子](/zh/hooks#worktreecreate)，它会完全替换默认的 `git worktree` 逻辑。

## 将 gitignore 文件复制到工作树

工作树是全新的检出，因此主仓库中的未跟踪文件（如 `.env` 或 `.env.local`）不会存在。要在 Claude 创建工作树时自动复制它们，请在项目根目录添加 `.worktreeinclude` 文件。

该文件使用 `.gitignore` 语法。只有匹配模式且被 gitignore 的文件才会被复制，因此已跟踪的文件不会被重复。

以下 `.worktreeinclude` 会将两个 env 文件和一个密钥配置复制到每个新工作树：

```text .worktreeinclude
.env
.env.local
config/secrets.json
```

这适用于通过 `--worktree` 创建的工作树、[子代理工作树]以及[桌面应用](/zh/desktop#work-in-parallel-with-sessions)中的并行会话。

## 使用工作树隔离子代理

子代理可以在自己的工作树中运行，这样并行编辑不会冲突。让 Claude "为你的代理使用工作树"，或通过在[自定义子代理](/zh/sub-agents#supported-frontmatter-fields)的 frontmatter 中添加 `isolation: worktree` 来永久设置。每个子代理获得一个临时工作树，当子代理完成且没有变更时会自动移除。

子代理工作树使用与 `--worktree` 相同的[基础分支](#选择基础分支)，因此除非 `worktree.baseRef` 设为 `"head"`，否则它们从仓库的默认分支创建分支。

## 清理工作树

当你退出工作树会话时，清理取决于你是否进行了变更：

* **没有未提交的更改、没有未跟踪的文件、也没有新的提交**：工作树及其分支会被自动移除。如果会话有[名称](/zh/sessions#name-your-sessions)，Claude 会提示你以便保留工作树供后续使用
* **存在未提交的更改、未跟踪的文件或新的提交**：Claude 会提示你保留或移除工作树。保留会保留目录和分支以便你稍后返回。移除会删除工作树目录及其分支，丢弃任何未提交的更改、未跟踪的文件和提交
* **非交互式运行**：通过 `--worktree` 与 `-p` 一起创建的工作树不会自动清理，因为没有退出提示。使用 `git worktree remove` 手动移除它们

Claude 为子代理和[后台会话](/zh/agent-view#how-file-edits-are-isolated)创建的工作树在超过你的 [`cleanupPeriodDays`](/zh/settings#available-settings) 设置后会被自动移除，前提是它们没有未提交的更改、未跟踪的文件和未推送的提交。你通过 `--worktree` 创建的工作树不会被此扫描移除。

## 手动管理工作树

要完全控制工作树位置和分支配置，可以直接使用 Git 创建工作树。当你需要检出特定的现有分支或将工作树放在仓库外部时很有用。

在新分支上创建工作树：

```bash
git worktree add ../project-feature-a -b feature-a
```

从现有分支创建工作树：

```bash
git worktree add ../project-bugfix bugfix-123
```

在工作树中启动 Claude：

```bash
cd ../project-feature-a && claude
```

列出你的工作树：

```bash
git worktree list
```

完成后移除：

```bash
git worktree remove ../project-feature-a
```

完整命令参考请参阅 [Git 工作树文档](https://git-scm.com/docs/git-worktree)。记住在每个新工作树中初始化开发环境：安装依赖、设置虚拟环境，或运行项目设置所需的任何操作。

## 非 git 版本控制

工作树隔离默认使用 git。对于 SVN、Perforce、Mercurial 或其他系统，请配置 [`WorktreeCreate` 和 `WorktreeRemove` 钩子](/zh/hooks#worktreecreate)以提供自定义创建和清理逻辑。由于钩子替换默认的 git 行为，使用 `--worktree` 时不会处理 [`.worktreeinclude`](#将-gitignore-文件复制到工作树)。请在钩子脚本中复制任何本地配置文件。

以下 `WorktreeCreate` 钩子从 stdin 读取工作树名称，检出全新的 SVN 工作副本，并打印目录路径以便 Claude Code 将其用作会话的工作目录：

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```

配合 `WorktreeRemove` 钩子在会话结束时进行清理。输入架构和移除示例请参阅[钩子参考](/zh/hooks#worktreecreate)。

## 另请参阅

工作树处理文件隔离。以下相关页面介绍如何将工作委托到这些隔离的检出中以及在你创建的会话之间切换：

* [子代理](/zh/sub-agents)：将工作委托给会话内的隔离代理
* [代理团队](/zh/agent-teams)：自动协调多个 Claude 会话
* [管理会话](/zh/sessions)：命名、恢复和切换对话
* [桌面并行会话](/zh/desktop#work-in-parallel-with-sessions)：桌面应用中基于工作树的会话
