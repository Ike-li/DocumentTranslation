# Codex GitHub Action

使用 Codex GitHub Action (`openai/codex-action@v1`) 在 CI/CD 作业中运行 Codex，应用补丁，或通过 GitHub Actions 工作流发布评审意见。
该 Action 会安装 Codex CLI，在你提供 API 密钥时启动 Responses API 代理，并在你指定的权限下运行 `codex exec`。

在以下场景中可以使用该 Action：

- 自动化 Codex 对 Pull Request 或发布的反馈，无需自行管理 CLI。
- 在 CI 流水线中将 Codex 驱动的质量检查作为变更门控。
- 从工作流文件中运行可重复的 Codex 任务（代码评审、发布准备、迁移等）。

有关 CI 示例，请参阅[非交互模式](https://developers.openai.com/codex/noninteractive)，并浏览 [openai/codex-action 仓库](https://github.com/openai/codex-action)中的源码。

## 前置条件

- 将你的 OpenAI 密钥存储为 GitHub Secret（例如 `OPENAI_API_KEY`），并在工作流中引用它。
- 在 Linux 或 macOS 运行器上运行作业。对于 Windows，请设置 `safety-strategy: unsafe`。
- 在调用 Action 之前检出代码，以便 Codex 能读取仓库内容。
- 决定你要运行的提示词。你可以通过 `prompt` 提供内联文本，或通过 `prompt-file` 指向仓库中已提交的文件。

## 示例工作流

以下示例工作流会对新的 Pull Request 进行评审，捕获 Codex 的响应，并将其回复到 PR 上。

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge
          persist-credentials: false

      - name: Pre-fetch base and head refs
        env:
          PR_BASE_REF: ${{ github.event.pull_request.base.ref }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          git fetch --no-tags origin \
            "$PR_BASE_REF" \
            "+refs/pull/$PR_NUMBER/head"

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          output-file: codex-output.md

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write
    steps:
      - name: Post Codex feedback
        uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            })
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
```

将 `.github/codex/prompts/review.md` 替换为你自己的提示词文件，或使用 `prompt` 输入内联文本。该示例还将 Codex 的最终消息写入 `codex-output.md`，以便后续检查或上传为制品。

## 配置 `codex exec`

通过设置映射到 `codex exec` 选项的 Action 输入来微调 Codex 的运行方式：

- `prompt` 或 `prompt-file`（二选一）：内联指令，或指向包含你任务的 Markdown 或文本的仓库路径。建议将提示词存储在 `.github/codex/prompts/` 中。
- `codex-args`：额外的 CLI 标志。提供 JSON 数组（例如 `["--ephemeral"]`）或 Shell 字符串（`--profile ci`）来配置会话、配置文件或 MCP 设置。
- `model` 和 `effort`：选择你想要的 Codex 代理配置；留空则使用默认值。
- `sandbox`：将沙箱模式（`workspace-write`、`read-only`、`danger-full-access`）与 Codex 运行期间所需的权限相匹配。
- `output-file`：将 Codex 的最终消息保存到磁盘，以便后续步骤上传或进行差异比较。
- `codex-version`：固定特定的 CLI 版本。留空则使用最新发布的版本。
- `codex-home`：指向共享的 Codex 主目录，以便跨步骤复用配置文件或 MCP 设置。

## 管理权限

在 GitHub 托管的运行器上，Codex 拥有广泛的访问权限，除非你对其进行限制。使用以下输入来控制暴露范围：

- `safety-strategy`（默认为 `drop-sudo`）在运行 Codex 之前移除 `sudo`。这对作业来说是不可逆的，可以保护内存中的密钥。在 Windows 上，你必须设置 `safety-strategy: unsafe`。
- `unprivileged-user` 将 `safety-strategy: unprivileged-user` 与 `codex-user` 配合使用，以特定账户运行 Codex。确保该用户可以读写仓库检出内容（请参阅 [`unprivileged-user` 示例](https://github.com/openai/codex-action/blob/main/examples/unprivileged-user.yml)了解所有权修复方法）。
- `read-only` 阻止 Codex 修改文件或使用网络，但仍以提升的权限运行。不要仅依赖 `read-only` 来保护密钥。
- `sandbox` 在 Codex 内部限制文件系统和网络访问。选择仍能完成任务的最小权限选项。
- `allow-users` 和 `allow-bots` 限制谁可以触发工作流。默认情况下，只有具有写权限的用户才能运行该 Action；显式列出额外的受信账户，或留空使用默认行为。

## 捕获输出

该 Action 通过 `final-message` 输出发出 Codex 的最后一条消息。将其映射到作业输出（如上所示）或在后续步骤中直接处理。如果你更喜欢从运行器收集完整记录，可以将 `output-file` 与上传制品功能结合使用。当你需要结构化数据时，通过 `codex-args` 传递 `--output-schema` 来强制 JSON 格式。

## 安全检查清单

- 限制谁可以启动工作流。优先使用受信事件或显式批准，而不是允许所有人对你的仓库运行 Codex。
- 对来自 Pull Request、提交消息或 Issue 正文的提示词输入进行清理，以避免提示词注入。在将 HTML 注释或隐藏文本提供给 Codex 之前，请先进行审查。
- 通过保持 `safety-strategy` 为 `drop-sudo` 或将 Codex 移至非特权用户来保护你的 `OPENAI_API_KEY`。切勿在多租户运行器上将 Action 留在 `unsafe` 模式。
- 将 Codex 作为作业中的最后一步运行，以避免后续步骤继承任何意外的状态变更。
- 如果你怀疑代理日志或 Action 输出暴露了密钥材料，请立即轮换密钥。

## 故障排除

- **你同时设置了 prompt 和 prompt-file**：移除重复的输入，确保只提供一个来源。
- **responses-api-proxy 未写入服务器信息**：确认 API 密钥存在且有效；代理仅在你提供 `openai-api-key` 时才会启动。
- **期望移除 `sudo`，但 `sudo` 执行成功**：确保之前的步骤没有恢复 `sudo`，且运行器操作系统为 Linux 或 macOS。使用全新的作业重新运行。
- **`drop-sudo` 后出现权限错误**：在 Action 运行之前授予写入权限（例如使用 `chmod -R g+rwX "$GITHUB_WORKSPACE"` 或使用非特权用户模式）。
- **未授权的触发被阻止**：如果你需要允许默认写入协作者之外的服务账户，请调整 `allow-users` 或 `allow-bots` 输入。
