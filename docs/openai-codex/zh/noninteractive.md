# 非交互模式

非交互模式允许你从脚本中运行 Codex（例如持续集成（CI）任务），无需打开交互式 TUI。
通过 `codex exec` 调用。

有关标志级别的详细信息，请参阅 [`codex exec`](https://developers.openai.com/codex/cli/reference#codex-exec)。

## 何时使用 `codex exec`

在以下场景中使用 `codex exec`：

- 作为流水线的一部分运行（CI、合并前检查、定时任务）。
- 生成可管道传输到其他工具的输出（例如生成发布说明或摘要）。
- 自然融入 CLI 工作流，将命令输出传递给 Codex，再将 Codex 输出传递给其他工具。
- 使用明确的、预设的沙箱和审批设置运行。

## 基本用法

将任务提示词作为单个参数传入：

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

`codex exec` 运行期间，Codex 会将进度流式输出到 `stderr`，仅将最终的代理消息打印到 `stdout`。这使得重定向或管道传输最终结果变得简单：

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
```

当你不希望将会话回放文件持久化到磁盘时，使用 `--ephemeral`：

```bash
codex exec --ephemeral "triage this repository and suggest next steps"
```

如果 stdin 通过管道传入且你同时提供了提示词参数，Codex 会将提示词视为指令，将管道内容视为额外上下文。

这使得用一条命令生成输入并直接传递给 Codex 变得很容易：

```bash
curl -s https://jsonplaceholder.typicode.com/comments \
  | codex exec "format the top 20 items into a markdown table" \
  > table.md
```

有关更高级的 stdin 管道模式，请参阅[高级 stdin 管道](#高级-stdin-管道)。

## 权限与安全

默认情况下，`codex exec` 在只读沙箱中运行。在自动化场景中，设置工作流所需的最小权限：

- 允许编辑：`codex exec --sandbox workspace-write "<task>"`
- 允许更广泛的访问：`codex exec --sandbox danger-full-access "<task>"`

仅在受控环境中使用 `danger-full-access`（例如隔离的 CI 运行器或容器）。

Codex 保留了 `codex exec --full-auto` 作为已弃用的兼容性标志，并会打印警告。在新脚本中建议使用明确的 `--sandbox workspace-write` 标志。

当你需要不加载 `$CODEX_HOME/config.toml` 的运行时，使用 `--ignore-user-config`；当你需要在受控自动化环境中跳过用户和项目 execpolicy `.rules` 文件时，使用 `--ignore-rules`。

如果你配置了一个 `required = true` 的已启用 MCP 服务器，且该服务器初始化失败，`codex exec` 会以错误退出，而不是在没有该服务器的情况下继续运行。

## 使输出可被机器读取

要在脚本中处理 Codex 输出，使用 JSON Lines 输出：

```bash
codex exec --json "summarize the repo structure" | jq
```

启用 `--json` 后，`stdout` 变为 JSON Lines（JSONL）流，你可以捕获 Codex 运行时发出的每个事件。事件类型包括 `thread.started`、`turn.started`、`turn.completed`、`turn.failed`、`item.*` 和 `error`。

项目类型包括代理消息、推理、命令执行、文件变更、MCP 工具调用、Web 搜索和计划更新。

示例 JSON 流（每行是一个 JSON 对象）：

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

如果你只需要最终消息，使用 `-o <path>`/`--output-last-message <path>` 将其写入文件。这会将最终消息写入文件，同时仍然打印到 `stdout`（详见 [`codex exec`](https://developers.openai.com/codex/cli/reference#codex-exec)）。

## 使用 Schema 创建结构化输出

如果下游步骤需要结构化数据，使用 `--output-schema` 请求符合 JSON Schema 的最终响应。
这对于需要稳定字段的自动化工作流非常有用（例如任务摘要、风险报告或发布元数据）。

`schema.json`

```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

使用该 Schema 运行 Codex，并将最终 JSON 响应写入磁盘：

```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

最终输出示例（stdout）：

```json
{
  "project_name": "Codex CLI",
  "programming_languages": ["Rust", "TypeScript", "Shell"]
}
```

## 在自动化中进行身份验证

`codex exec` 默认复用已保存的 CLI 身份验证。在 CI 中，通常需要显式提供凭据：

### 使用 API 密钥认证

对于 GitHub Actions，请使用 [Codex GitHub Action](https://developers.openai.com/codex/github-action)，而不是自行安装和认证 CLI。该 Action 旨在通过安装 Codex、启动 Responses API 代理并使用可配置的安全策略运行 Codex 来减少 API 密钥暴露。

不要在检出或运行仓库控制代码的工作流中将 `OPENAI_API_KEY` 或 `CODEX_API_KEY` 设置为任务级环境变量。同一任务中的构建脚本、测试、依赖生命周期钩子或被入侵的 Action 可以读取这些环境变量。

对于其他自动化环境，仅在单次 `codex exec` 调用时设置 `CODEX_API_KEY`，并确保没有不受信任的代码在同一进程环境中运行。

要在单次运行中使用不同的 API 密钥，内联设置 `CODEX_API_KEY`：

```bash
CODEX_API_KEY=<api-key> codex exec --json "triage open bug reports"
```

`CODEX_API_KEY` 仅在 `codex exec` 中受支持。

<ToggleSection title="在 CI/CD 中使用 ChatGPT 托管认证（高级）">
如果你需要使用 Codex 用户账户（而非 API 密钥）运行 CI/CD 作业，请阅读此部分。适用于企业团队在受信运行器上使用 ChatGPT 托管的 Codex 访问，或需要 ChatGPT/Codex 速率限制而非 API 密钥用量的用户。

API 密钥是自动化的正确默认选择，因为它们更易于配置和轮换。仅在确实需要以你的 Codex 账户运行时才使用此路径。

将 `~/.codex/auth.json` 视为密码：它包含访问令牌。不要提交它、粘贴到工单中或在聊天中分享。

不要将此工作流用于公共或开源仓库。如果运行器上无法执行 `codex login`，通过安全存储注入 `auth.json`，在运行器上运行 Codex 使其就地刷新，并在运行之间持久化更新后的文件。

参见[在 CI/CD 中维护 Codex 账户认证（高级）](https://developers.openai.com/codex/auth/ci-cd-auth)。

</ToggleSection>

## 恢复非交互式会话

如果需要继续之前的运行（例如两阶段流水线），使用 `resume` 子命令：

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
```

你也可以通过 `codex exec resume <SESSION_ID>` 指定特定的会话 ID。

## 需要 Git 仓库

Codex 要求命令在 Git 仓库内运行，以防止破坏性更改。如果你确定环境是安全的，可以使用 `codex exec --skip-git-repo-check` 跳过此检查。

## 常见自动化模式

### 示例：在 GitHub Actions 中自动修复 CI 失败

对于 GitHub Actions 工作流，请使用 [`openai/codex-action`](https://github.com/openai/codex-action)，而不是安装 Codex 并将 API 密钥传递给 shell 步骤。该 Action 会为 OpenAI API 密钥启动安全代理。

你可以使用 Codex 在 CI 工作流失败时自动提出修复方案。模式如下：

1. 当主 CI 工作流以错误完成时，触发后续工作流。
2. 以只读仓库权限检出失败的提交。
3. 在 Codex 之前运行设置命令，不将 OpenAI API 密钥暴露给这些步骤。
4. 运行 Codex GitHub Action。
5. 将 Codex 的本地更改保存为补丁制品。
6. 在单独的任务中，应用补丁并创建拉取请求。

下面的 Codex 任务仅有 `contents: read` 权限。Codex 运行后，仅将差异序列化为制品。`open_pr` 任务获得仓库写权限，但不会获得 `OPENAI_API_KEY`。

此示例假设为 Node.js 项目。请根据你的技术栈调整设置和测试命令。

有关更深入的安全检查清单，请参阅 [Codex GitHub Action 安全指南](https://github.com/openai/codex-action/blob/main/docs/security.md)。

```yaml
name: Codex auto-fix on CI failure

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  generate_fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      has_patch: ${{ steps.diff.outputs.has_patch }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; fi

      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: |
            The CI workflow "${{ github.event.workflow_run.name }}" failed for commit
            ${{ github.event.workflow_run.head_sha }}.

            Run `npm test --silent` to reproduce the failure. Identify the minimal
            change needed to make the tests pass, implement only that change, and
            run `npm test --silent` again.

            Do not refactor unrelated files.

      - name: Create patch artifact
        id: diff
        run: |
          git add -N .
          git diff --binary HEAD > codex.patch
          if [ -s codex.patch ]; then
            echo "has_patch=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_patch=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload patch artifact
        if: steps.diff.outputs.has_patch == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: codex-fix-patch
          path: codex.patch
          if-no-files-found: error

  open_pr:
    runs-on: ubuntu-latest
    needs: generate_fix
    if: needs.generate_fix.outputs.has_patch == 'true'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: codex-fix-patch

      - name: Apply Codex patch
        run: git apply --index codex.patch

      - name: Open pull request
        env:
          GH_TOKEN: ${{ github.token }}
          FAILED_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          FAILED_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.run_id }}
        run: |
          branch="codex/auto-fix-$RUN_ID"

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -m "Auto-fix failing CI via Codex"
          git push origin "$branch"

          {
            echo "Codex generated this patch after CI failed for \`$FAILED_HEAD_SHA\`."
            echo
            echo "Review the changes before merging."
          } > pr-body.md

          gh pr create \
            --base "$FAILED_HEAD_BRANCH" \
            --head "$branch" \
            --title "Auto-fix failing CI via Codex" \
            --body-file pr-body.md
```

## 高级 stdin 管道

当另一个命令为 Codex 生成输入时，根据指令的来源选择 stdin 模式。当你已知指令并希望将管道输出作为上下文传入时，使用提示词加 stdin 模式。当 stdin 应成为完整提示词时，使用 `codex exec -`。

### 使用提示词加 stdin 模式

当另一个命令已生成你希望 Codex 检查的数据时，提示词加 stdin 模式非常有用。在此模式下，你自己编写指令并将输出作为上下文管道传入，这使其非常适合围绕命令输出、日志和生成数据构建的 CLI 工作流。

```bash
npm test 2>&1 \
  | codex exec "summarize the failing tests and propose the smallest likely fix" \
  | tee test-summary.md
```

<ToggleSection title="更多提示词加 stdin 示例">

### 摘要日志

```bash
tail -n 200 app.log \
  | codex exec "identify the likely root cause, cite the most important errors, and suggest the next three debugging steps" \
  > log-triage.md
```

### 检查 TLS 或 HTTP 问题

```bash
curl -vv https://api.example.com/health 2>&1 \
  | codex exec "explain the TLS or HTTP failure and suggest the most likely fix" \
  > tls-debug.md
```

### 准备 Slack 就绪的更新

```bash
gh run view 123456 --log \
  | codex exec "write a concise Slack-ready update on the CI failure, including the likely cause and next step" \
  | pbcopy
```

### 从 CI 日志起草拉取请求评论

```bash
gh run view 123456 --log \
  | codex exec "summarize the failure in 5 bullets for the pull request thread" \
  | gh pr comment 789 --body-file -
```

</ToggleSection>

### 当 stdin 为提示词时使用 `codex exec -`

如果省略提示词参数，Codex 会从 stdin 读取提示词。当你希望明确强制此行为时，使用 `codex exec -`。

当另一个命令或脚本动态生成整个提示词时，`-` 哨兵值非常有用。当你将提示词存储在文件中、用 shell 脚本组装提示词，或在将完整提示词交给 Codex 之前将实时命令输出与指令组合时，这是一个很好的选择。

```bash
cat prompt.txt | codex exec -
```

```bash
printf "Summarize this error log in 3 bullets:\n\n%s\n" "$(tail -n 200 app.log)" \
  | codex exec -
```

```bash
generate_prompt.sh | codex exec - --json > result.jsonl
```
