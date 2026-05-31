> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用 ultrareview 查找 bug

> 通过 /code-review ultra 在云端运行深度多代理代码审查，在合并前查找并验证 bug。

Ultrareview 是一项在 Claude Code v2.1.86 及更高版本中提供的研究预览功能。该功能、定价和可用性可能会根据反馈进行调整。该命令现在通过 `/code-review ultra` 调用，`/ultrareview` 作为别名保留。

Ultrareview 是一种运行在 Claude Code 网页版基础设施上的深度代码审查。当你运行 `/code-review ultra` 时，Claude Code 会在远程沙箱中启动一组审查代理，查找你的分支或拉取请求中的 bug。

与本地 `/review` 相比，ultrareview 提供：

* **更高的信噪比**：每个报告的发现都经过独立复现和验证，因此结果专注于真正的 bug 而非风格建议
* **更广的覆盖面**：多个审查代理并行探索变更，能够发现单次审查可能遗漏的问题
* **不占用本地资源**：审查完全在远程沙箱中运行，运行期间你的终端可以自由处理其他工作

Ultrareview 需要使用 Claude.ai 账户认证，因为它运行在 Claude Code 网页版基础设施上。如果你仅使用 API 密钥登录，请先运行 `/login` 并使用 Claude.ai 认证。在使用 Claude Code 搭配 Amazon Bedrock、Google Cloud Vertex AI 或 Microsoft Foundry 时，ultrareview 不可用；启用了零数据保留的组织也无法使用。

## 从 CLI 运行 ultrareview

从任意 git 仓库的 Claude Code CLI 中启动审查。

```text
/code-review ultra
```

不带参数时，ultrareview 会审查当前分支与默认分支之间的差异，包括工作树中未提交和已暂存的变更。Claude Code 会打包仓库状态并上传到远程沙箱进行审查。

要审查 GitHub 拉取请求，请传入 PR 编号。

```text
/code-review ultra 1234
```

在 PR 模式下，远程沙箱直接从主机克隆拉取请求，而不是打包你的本地工作树。PR 模式支持 `github.com` 上的仓库以及管理员已连接到 Claude Code 的 [GitHub Enterprise Server](/zh/github-enterprise-server) 实例上的仓库。

> **提示**
> 如果你的仓库太大无法打包，Claude Code 会提示你改用 PR 模式。推送你的分支并创建一个草稿 PR，然后运行 `/code-review ultra <PR 编号>`。

启动前，Claude Code 会显示确认对话框，其中包含审查范围（审查分支时会显示文件数和行数）、剩余的免费运行次数以及预估费用。确认后，审查将在后台继续进行，你可以继续使用当前会话。该命令仅在你使用 `/code-review ultra` 调用时运行；Claude 不会自行启动 ultrareview。

## 定价和免费运行次数

Ultrareview 是一项高级功能，从用量额度中扣费，而非使用套餐包含的用量。

| 套餐                | 包含的免费运行次数 | 免费运行次数用完后                                                                                             |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Pro                 | 3 次免费运行       | 按 [用量额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 计费        |
| Max                 | 3 次免费运行       | 按 [用量额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 计费        |
| Team 和 Enterprise  | 无                 | 按 [用量额度](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans) 计费        |

Pro 和 Max 订阅者可获得三次免费 ultrareview 运行次数来试用该功能。这三次运行次数是每个账户的一次性配额，不会刷新。用完三次后，或免费运行期结束后，每次审查将从用量额度中扣费，费用通常为 \$5 到 \$20，具体取决于变更大小。远程会话启动即计为一次运行，因此你提前停止或未完成的审查仍会消耗一次免费运行次数。对于付费审查，仅对实际运行的部分扣费。

由于 ultrareview 在免费运行次数之外始终从用量额度中扣费，你的账户或组织必须在启动付费审查前开启用量额度。如果未开启用量额度，Claude Code 会阻止启动并引导你前往账单设置页面开启。你也可以运行 `/usage-credits` 来查看或更改当前设置。

## 跟踪正在运行的审查

审查通常需要 5 到 10 分钟。审查作为后台任务运行，因此你可以继续在会话中工作、启动其他命令或完全关闭终端。

使用 `/tasks` 查看正在运行和已完成的审查、打开审查的详情视图或停止正在进行的审查。停止审查会归档云端会话，且不会返回部分发现。审查完成后，已验证的发现将以通知形式出现在你的会话中。每个发现都包含文件位置和问题说明，你可以直接让 Claude 修复它。

## 以非交互方式运行 ultrareview

使用 `claude ultrareview` 子命令从 CI 或脚本中启动 ultrareview，无需交互式会话。该子命令启动与 `/code-review ultra` 相同的审查，阻塞直到远程审查完成，将发现输出到 stdout，成功时以退出码 0 退出，失败时以退出码 1 退出。

```bash
claude ultrareview
claude ultrareview 1234
claude ultrareview origin/main
```

不带参数时，该子命令审查当前分支与默认分支之间的差异。传入 PR 编号来审查拉取请求，或传入基准分支来审查与该分支之间的差异。调用该子命令等同于同意交互式命令显示的计费和条款提示。

进度消息和实时会话 URL 输出到 stderr，以便 stdout 保持可解析状态。使用以下标志控制输出和超时：

| 标志                  | 说明                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `--json`              | 输出原始 `bugs.json` 负载，而非格式化的发现                      |
| `--timeout <分钟>`    | 等待审查完成的最大分钟数。默认为 30                               |

运行 `claude ultrareview` 需要与 `/code-review ultra` 相同的认证和用量额度配置。审查完成时（无论是否有发现）该子命令以退出码 0 退出；审查启动失败、远程会话出错或超时时以退出码 1 退出；通过 Ctrl-C 中断时以退出码 130 退出。如果你中断子命令，远程审查会继续运行；请访问输出到 stderr 的会话 URL 在浏览器中查看。

对于 GitHub 拉取请求的自动审查，[代码审查](/zh/code-review) 直接与你的仓库集成，将发现作为内联 PR 评论发布，无需 CLI 步骤。

## ultrareview 与 /review 的对比

两个命令都审查代码，但针对工作流程的不同阶段。

|          | `/review`                      | `/code-review ultra`                                            |
| -------- | ------------------------------ | --------------------------------------------------------------- |
| 运行位置 | 本地会话中                     | 远程云端沙箱中                                                   |
| 深度     | 单次审查                       | 多代理集群，独立验证                                              |
| 耗时     | 秒级到几分钟                   | 大约 5 到 10 分钟                                                |
| 费用     | 计入常规用量                   | 免费运行次数，之后每次审查约 \$5 到 \$20，从用量额度扣费           |
| 适用场景 | 迭代过程中的快速反馈            | 合并重大变更前的深度审查                                          |

在工作过程中使用 `/review` 获取快速反馈。在合并重大变更前使用 `/code-review ultra` 进行更深入的审查，捕获单次审查可能遗漏的问题。

## 相关资源

* [Claude Code 网页版](/zh/claude-code-on-the-web)：了解远程会话和云端沙箱的工作原理
* [使用 ultraplan 规划复杂变更](/zh/ultraplan)：ultrareview 的规划对应功能，用于前期设计工作
* [有效管理费用](/zh/costs)：跟踪用量并设置支出上限
