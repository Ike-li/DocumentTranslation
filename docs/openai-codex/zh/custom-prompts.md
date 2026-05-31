# 自定义提示词

自定义提示词已弃用。请使用[技能](https://developers.openai.com/codex/skills)来创建可复用的指令，Codex 可以显式或隐式地调用它们。

自定义提示词（已弃用）允许你将 Markdown 文件转换为可复用的提示词，并在 Codex CLI 和 Codex IDE 扩展中以斜杠命令的形式调用。

自定义提示词需要显式调用，存放在本地 Codex 主目录中（例如 `~/.codex`），因此不会通过仓库共享。如果你想共享提示词（或希望 Codex 隐式调用它），请[使用技能](https://developers.openai.com/codex/skills)。

1. 创建提示词目录：

   ```bash
   mkdir -p ~/.codex/prompts
   ```

2. 创建 `~/.codex/prompts/draftpr.md`，写入可复用的指导内容：

   ```markdown
   ---
   description: Prep a branch, commit, and open a draft PR
   argument-hint: [FILES=<paths>] [PR_TITLE="<title>"]
   ---

   Create a branch named `dev/<feature_name>` for this work.
   If files are specified, stage them first: $FILES.
   Commit the staged changes with a clear message.
   Open a draft PR on the same branch. Use $PR_TITLE when supplied; otherwise write a concise summary yourself.
   ```

3. 重启 Codex 以加载新的提示词（重启 CLI 会话，如果使用了 IDE 扩展则重新加载）。

预期效果：在斜杠命令菜单中输入 `/prompts:draftpr` 会显示你的自命令，附带 frontmatter 中的描述，并提示文件和 PR 标题为可选参数。

## 添加元数据和参数

Codex 在下次会话启动时读取提示词元数据并解析占位符。

- **描述：** 显示在命令名称下方的弹出窗口中。在 YAML frontmatter 中通过 `description:` 设置。
- **参数提示：** 使用 `argument-hint: KEY=<value>` 记录预期参数。
- **位置占位符：** `$1` 到 `$9` 会根据你在命令后提供的空格分隔参数展开。`$ARGUMENTS` 包含所有参数。
- **命名占位符：** 使用大写名称如 `$FILE` 或 `$TICKET_ID`，并以 `KEY=value` 形式提供值。带空格的值需要用引号括起来（例如 `FOCUS="loading state"`）。
- **字面美元符号：** 使用 `$$` 在展开后的提示词中输出单个 `$`。

编辑提示词文件后，重启 Codex 或打开新的聊天以加载更新。Codex 会忽略提示词目录中的非 Markdown 文件。

## 调用和管理自定义命令

1. 在 Codex（CLI 或 IDE 扩展）中，输入 `/` 打开斜杠命令菜单。
2. 输入 `prompts:` 或提示词名称，例如 `/prompts:draftpr`。
3. 提供所需参数：

   ```text
   /prompts:draftpr FILES="src/pages/index.astro src/lib/api.ts" PR_TITLE="Add hero animation"
   ```

4. 按 Enter 发送展开后的指令（不需要的参数可以省略）。

预期效果：Codex 展开 `draftpr.md` 的内容，将占位符替换为你提供的参数，然后将结果作为消息发送。

通过编辑或删除 `~/.codex/prompts/` 下的文件来管理提示词。Codex 只扫描该文件夹中的顶层 Markdown 文件，因此请将每个自定义提示词直接放在 `~/.codex/prompts/` 下，而不是放在子目录中。
