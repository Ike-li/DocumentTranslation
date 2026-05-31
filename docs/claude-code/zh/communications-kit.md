> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件查看所有可用页面。

# 通讯工具包

> 将 Claude Code 推行到您的工程团队时所需的发布公告、滴灌式营销消息及常见问题解答。

本页面面向正在将 Claude Code 推行给团队的管理人员和工程主管。它提供了现成的发布公告、技巧与窍门滴灌式营销活动，以及针对您最常被问到问题的单行常见问题解答。

  将此处所有内容视为草稿而非终稿。请用贵公司的风格重写每条信息，将示例任务替换为你们代码库中实际存在的缺陷和模块，并在发送前替换所有`[方括号占位符]`。能真正推动采纳率的公告，应该读起来就像出自贵公司员工之手。

## 发布沟通

一份公告的两种格式，外加两个可选变体。选择最适合您推出计划的版本，并在此基础上进行改写。

### 发送前

在公告发出前，请核对这份清单。每一项都消除了一个潜在问题，否则它们会在发布当天变成支持工单。

| 检查项                                                                                               | 重要性                                                                              |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `#claude-code` 频道已创建并在消息中链接                                                                 | 为问题提供了一个统一的落点                                                   |
| 安装命令已在您的环境中至少一台机器上测试过                                                               | 在所有人同时遇到之前，捕获代理或防火墙问题                  |
| 安全和数据处理链接已准备就绪（[数据使用](/zh/data-usage) 或您的内部等效页面） | “我的代码去了哪里？”将会是第一个回复                                    |
| 选择了一个具体的第一个任务，您代码库中的一个真实错误或文件                              | 通用示例无法促成转换；“修复 `auth_test.go` 中不稳定的测试”则可以         |
| 前48小时有一个指定的频道负责人                                             | 发布当天无人回答的问题会扼杀动力                                       |
| 已安排一位C级高管赞助人发送或联合署名该公告                                   | 由高管发送的发布，其首周采用率一直高于由管理员发送的版本 |


    ```text
    Subject: Claude Code is live for [Engineering / your team]

    Team,

    As of today you have access to Claude Code, an AI coding agent that runs in
    your terminal, reads your actual codebase, and works through real tasks end
    to end: debugging, refactors, tests, PRs. It is not autocomplete and it is
    not a chat window. It edits files, runs your commands, and asks permission
    before anything risky.

    Get running in two minutes:

        curl -fsSL https://claude.ai/install.sh | bash
        cd <your-repo>
        claude

    Then run /init once. Claude reads your project and writes a CLAUDE.md with
    your build commands and conventions, so you stop re-explaining the basics.

    Then try one of these on the repo you are already in:

      - "The test in [file] is flaky. Figure out why and fix it"
      - "Walk me through how [module] handles [X]"
      - "Look at my working diff and tell me what's risky before I push"

    Where your code goes: Claude Code runs in your terminal and talks directly
    to Anthropic's API, with no third-party servers in the loop. It asks before
    editing files or running commands. Under our Enterprise agreement, Anthropic
    does not use your code or prompts to train its models.
    Details: https://code.claude.com/docs/en/data-usage
             https://code.claude.com/docs/en/security

    Where to go with questions: #claude-code. [Owner name] is watching it
    this week.

    - [Name]

    P.S. Prefer your editor? There is a VS Code extension and a JetBrains
    plugin. Same agent, no terminal required.
    ```



    ```markdown
    🚀 *Claude Code is live for [team]*

    AI coding agent, runs in your terminal, reads your repo, does real work:
    bugs, refactors, tests, PRs. Asks before it touches anything.

    `curl -fsSL https://claude.ai/install.sh | bash` → `cd your-repo` → `claude`

    *First thing to try* → run `/init`, then: "the test in [file] is flaky,
    figure out why and fix it."

    🔒 Runs in your terminal, talks only to Anthropic's API. Under our
    Enterprise plan your code and prompts are not used to train models.
    Data usage → https://code.claude.com/docs/en/data-usage

    📚 Quickstart · VS Code · Free 1-hr course
       https://code.claude.com/docs/en/quickstart
       https://code.claude.com/docs/en/vs-code
       https://anthropic.skilljar.com/claude-code-in-action

    Questions → this thread. [Owner] is on point.
    ```


### 高管发起人版本

请以赞助高管的名义发送此信息，例如首席技术官、首席信息官或工程高级副总裁，使用其姓名和账户。以高管名义发出的启动公告，其打开率和首周激活速度始终优于来自管理员或工具团队的相同消息。这标志着公司优先事项，而非可选实验。

此版本被刻意精简为一个核心要求：安装它并在一个真实任务上运行。高管的职责是确保此要求落地；标准公告和 `#claude-code` 处理具体操作方式。


    ```text
    Subject: One thing I'd like every engineer to try this week

    Team,

    We have turned on Claude Code for all of engineering. It is an AI agent
    that works directly in your terminal, on your actual codebase, and the
    early results from teams already using it are strong enough that I want
    everyone on it this week.

    I am asking for ten minutes:

        curl -fsSL https://claude.ai/install.sh | bash
        cd <your-repo>
        claude

    Then hand it one real task: the bug you have been putting off, or "walk me
    through how [module] works."

    That is the whole ask. [Owner name] and team are in #claude-code for
    anything you hit along the way.

    - [Exec Name]
      [Title]
    ```



    ```markdown
    📣 *From [Exec Name]: one thing to try this week*

    We have turned on *Claude Code* for all of engineering. Early results are
    strong enough that I am asking everyone to give it ten minutes on real
    work this week.

    `curl -fsSL https://claude.ai/install.sh | bash` → `cd your-repo` →
    `claude` → hand it one real task.

    That's it. Questions → #claude-code.
    ```


### 试点小组变体

用于分阶段发布。仅发送给试点小组。
```text
Subject: You're in the Claude Code pilot

[Name / team],

You are in the first wave of Claude Code at [company]. We picked this group
because you will put it on real problems and tell us the truth about it.

The ask: use it on at least one real task this week, then drop a note in
#claude-code-pilot covering what worked, what was annoying, and what
surprised you. That feedback decides how we roll it out to everyone else.

[Continue with "Get running in two minutes" from the standard announcement]

One extra thing for pilots: on your first multi-file change, press Shift+Tab
until you see "plan". Claude will lay out exactly what it intends to do
before it touches a file. It is the fastest way to calibrate how much to
trust it.
```
### 冠军招募私信

上线后，私信在 `#claude-code` 频道中最为活跃的两三个人。
```text
Hey [name], your #claude-code posts are doing more for adoption than my
announcement did. A couple of people told me your [thread / screenshot]
was why they actually tried it.

Want to make that semi-official? Low lift: mostly keep posting what you
are posting, plus first crack at new features and a direct line to the
Anthropic team. I can share a short playbook if you're in.
```
## 小技巧活动

可直接粘贴到 Slack 或 Teams 的消息，旨在推动功能在发布后的激活。每条消息遵循相同模式：一个钩子、价值展示、"立即试试"的提示词以及文档链接。每周在 `#claude-code` 频道发布一两条，或选择与团队需求匹配的几条。这些消息相互独立，无需按特定顺序使用。

直接从每个消息块复制正文，粘贴到 Slack 或 Teams。发送前请替换 `[方括号内的占位符]`。

### 开始使用

**选择正确的模型**
```markdown
🎯 *Tip: Match the model to the moment*

Using Opus to fix a typo burns compute. Using Haiku for a 12-file refactor
is asking for a re-do.

Claude Code runs on the same models as the Claude app, and you can switch
mid-session. *Sonnet* is the workhorse default for everyday feature work,
bugs, tests, and reviews. Reach for *Opus* on large refactors, gnarly
debugging, or anything high-stakes. Drop to *Haiku* for quick questions,
formatting, and mechanical edits where speed wins.

*Try it now:* type `/model` and pick Sonnet if you haven't already. It is
the right default for most tasks.

📖 Model configuration → https://code.claude.com/docs/en/model-config
```
| 模型   | 最佳适用场景                                                                             |
| ------ | --------------------------------------------------------------------------------------- |
| Opus   | 大规模重构、复杂调试、架构决策、高风险变更                                               |
| Sonnet | 日常功能开发、缺陷修复、测试、文档编写、代码审查。推荐作为默认选项。                     |
| Haiku  | 快速提问、格式化、机械性编辑、快速迭代                                                  |

**首先尝试的速赢技巧**
```markdown
🚀 *Tip: Three things to try in your first 10 minutes*

Installed Claude Code but not sure what to actually ask it? Start with the
stuff that has been bugging you all week.

  - Fix something annoying: "the test in [file] is flaky, figure out why"
  - Get oriented in code you didn't write: "walk me through how [module] works"
  - Sanity-check before you push: "look at my working diff and tell me what
    looks risky"

None of these need setup. Just `cd` into your repo and run `claude`.

*Try it now:* pick the bug you have been avoiding and paste the error
message in.

📖 Quickstart → https://code.claude.com/docs/en/quickstart
```
### 项目记忆

**`/init` 和 CLAUDE.md**
```markdown
📁 *Tip: Stop re-explaining your repo every session*

Telling Claude "we use pnpm, not npm" for the fifth time? There is a
one-time fix.

Run `/init` once per repo. Claude reads your project structure and writes a
CLAUDE.md file with your build commands, architecture, and conventions.
Every future session in that repo starts from this file automatically. Keep
it under two screens. It is a cheat sheet, not documentation.

*Try it now:* open your main repo, run `claude`, type `/init`. Thirty
seconds, pays off every session after.

📖 CLAUDE.md and project memory → https://code.claude.com/docs/en/memory
```
**@引用**
```markdown
📎 *Tip: Stop pasting file contents into the chat*

Copying 200 lines of a component into your prompt so Claude can "see" it?
You don't have to.

Type `@` then a file path. Claude pulls the file directly into context.
Works for whole directories too.

> the styles in @src/components/Button.tsx look off, check against
> @docs/design-system.md

*Try it now:* type `@` then Tab. Autocomplete shows you every file in reach.

📖 Referencing files → https://code.claude.com/docs/en/common-workflows
```
### 控制与安全

**权限模式**
```markdown
🛡️ *Tip: One keystroke between "look but don't touch" and "just do it"*

Sometimes you want Claude to ask before every edit. Sometimes you just want
it to ship. You shouldn't have to pick one forever.

*Shift+Tab* cycles through how much leash Claude gets: *default* asks before
risky stuff, *acceptEdits* lets file edits and common filesystem commands
flow through while still checking before other shell commands, and *plan*
proposes changes for your approval before anything is touched. Plan mode is
the trust-builder, so start there for anything touching multiple files.

*Try it now:* on your next refactor, hit Shift+Tab until you see "plan",
then describe the change. You'll get a full proposal before a single file
moves.

📖 Permission modes → https://code.claude.com/docs/en/permissions
```
**检查点与 `/rewind`**
```markdown
⏪ *Tip: There is an undo button for the whole conversation*

Claude went down the wrong path three turns ago and now you're untangling
it? You don't have to fix forward.

`/rewind` rolls back to an earlier point in the conversation, including the
file changes Claude made along the way. Checkpointing is automatic; you
don't set anything up.

*Try it now:* press *Esc* twice to open the rewind menu, or type `/rewind`.
Pick the point before things went sideways.

📖 Checkpointing → https://code.claude.com/docs/en/checkpointing
```
### 连接你的工具

**MCP连接器**
```markdown
🔌 *Tip: Let Claude read your issue tracker so you don't have to paste tickets*

Copy-pasting Jira tickets into the terminal feels like a step backward.
It is.

One config file (`.mcp.json` at your project root) wires Claude into GitHub,
Jira, Linear, or whatever tracker you use. Then "what's the top-priority
issue assigned to me?" and "go ahead and fix it" happen in the same
conversation.

*Try it now:* ask Claude "set up an MCP connector for [GitHub/Jira/Linear]
in this repo". It will write the config for you.

📖 MCP connectors → https://code.claude.com/docs/en/mcp
```
### 自动化你的工作流

**技能**
```markdown
⚡ *Tip: Turn that prompt you keep retyping into a command*

Typed "summarize what I worked on today from git log, format it for standup"
three times this week? That's a slash command waiting to happen.

A SKILL.md file in `.claude/skills/<name>/` becomes a reusable prompt; type
`/name` to run it. Make one the second time you type a multi-step prompt
you've typed before. Easiest path: ask Claude to make it for you.

*Try it now:* type "make me a /standup skill that summarizes what I worked
on today from git log", then run `/standup` tomorrow morning.

📖 Skills → https://code.claude.com/docs/en/skills
```
**钩子**
```markdown
🔔 *Tip: Get pinged when your refactor finishes*

Sitting at your desk watching Claude work through a long task? You've got
better things to do for those eight minutes.

Hooks are shell commands that fire on Claude Code events. A Stop hook that
sends a desktop notification means you can kick off a long refactor, walk
away, and get pinged the moment it's done.

*Try it now:* ask Claude "add a Stop hook that sends a desktop notification
when you finish". It will write the script and wire it up.

📖 Hooks guide → https://code.claude.com/docs/en/hooks-guide
```
### 日常开发

**截图与图片**
```markdown
📸 *Tip: Stop describing the error dialog. Just show it.*

Typing out "there's a red box that says something about a null reference
and it's pointing at line 47-ish"? Screenshot it.

Drag a screenshot straight into the terminal and Claude sees it: error
dialogs, UI mockups, whiteboard photos, Figma exports. *Ctrl+V* pastes from
clipboard (use Ctrl+V on macOS too, not Cmd+V).

*Try it now:* next time something visual breaks, screenshot it and paste it
right into the prompt. Then just type "what's wrong here?"

📖 Working with images → https://code.claude.com/docs/en/common-workflows
```
**Git 工作流**
```markdown
🌿 *Tip: Hand off the whole git ceremony*

The fix took 5 minutes. The commit message, branch, and PR description
took 15. That ratio is wrong.

Claude handles the full git flow: commits with conventional messages,
branches, PRs with proper summaries. One ask: "fix the off-by-one, commit
with a conventional commit message, and open a PR." Reviewing someone
else's work? Paste the PR URL and ask Claude to walk you through the diff.

*Try it now:* after your next fix, instead of switching to your git client,
just type "commit this with a good message and open a PR".

📖 Creating pull requests → https://code.claude.com/docs/en/common-workflows
```
### 共享与扩展

**插件**
```markdown
📦 *Tip: Someone probably already built that skill*

About to spend an hour building a `/deploy` command? Check if it
already exists.

Skills get bundled and shared as plugins. `/plugin` browses what's
available and installs in one step. Five minutes of browsing can save an
hour of building.

*Try it now:* type `/plugin` and scroll through. You'll find at least one
thing you didn't know you wanted.

📖 Plugins → https://code.claude.com/docs/en/plugins
```
### 安全与管理

**安全架构**
```markdown
🔐 *Tip: The answer to "is this safe?" for the next time you're asked*

Someone on your team is going to ask "wait, where does my code go?"
Here's the short version you can paste.

Permission-first by design. Every file edit, shell command, and external
call is gated by your approval. The CLI runs in your terminal and talks
directly to Anthropic's API, with no third-party servers, and supports
optional OS-level sandboxing for shell commands. Under our Enterprise plan,
Anthropic does not use your code or prompts to train its models.

*Try it now:* save these two links for the next time the question comes up.
They answer most security-review questions.

📖 https://code.claude.com/docs/en/security
📖 https://code.claude.com/docs/en/data-usage
```
**最佳实践**
```markdown
✅ *Tip: The 4 habits that separate "tried it once" from "use it daily"*

Most people who bounce off Claude Code skipped one of these. Most people
who stick did all four in week one.

  - Start in plan mode for anything touching multiple files
  - Run /init early; context compounds
  - Review diffs before committing; Claude can be confidently wrong
  - Verify changes that touch critical paths; treat it like a sharp
    junior, not an oracle

*Try it now:* if you've only done one or two of these, pick the one you're
missing and do it on your next task. Post what changed in #claude-code.

📖 Best practices → https://code.claude.com/docs/en/best-practices
```
## 快速参考

### 常见问题解答

你最常被问到的问题的简要回答。

| 问题                                 | 回答                                                                                                                                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “它在 VS Code 里能用吗？”               | 能用。有一个 VS Code 扩展和一个 JetBrains 插件，功能相同，嵌入在你的编辑器中。[VS Code →](/zh/vs-code)                                                                                            |
| “我需要先配置什么吗？” | 不需要。安装后，在任何仓库里运行 `claude` 即可。运行一次 `/init` 就搞定了。[快速入门 →](/zh/quickstart)                                                                                                                   |
| “我的代码去了哪里？”                 | 该 CLI 在你的终端中运行，并将上下文发送到 Anthropic 的 API 进行推理，无第三方服务器。根据你的企业计划，你的代码和提示词不会用于训练模型。[数据使用 →](/zh/data-usage) |
| “它能看到我的整个仓库吗？”              | 它会读取你授权它访问的内容。在你工作目录内的文件读取不会提示；权限提示会管控编辑、Shell 命令以及该目录之外的任何操作。[权限 →](/zh/permissions)              |
| “这与 Copilot 有什么不同？”    | Copilot 自动补全代码行。Claude Code 是一个能读取文件、运行命令和进行多文件编辑的代理。[概览 →](/zh/overview)                                                                                  |
| “我应该先试试什么？”               | 一个你因为繁琐而一直搁置的 bug。例如：“\[文件] 里的测试不稳定，找出原因。”[快速入门 →](/zh/quickstart)                                                                                            |

### 提示词模板

将这些入门提示词分享给已安装但不确定该问什么的工程师。每个提示词都按照在真实会话中输入的方式编写；将方括号中的内容替换为你自己仓库的文件。

| 任务                 | 提示词                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| 修复 bug            | "\[文件] 中的测试失败了，找出原因并修复"                |
| 理解代码      | "详细讲解 \[模块] 是如何工作的，然后告诉我入口点在哪里" |
| 安全重构        | "将 \[模块] 重构为 \[目标]，使用计划模式以便我先进行审核"         |
| 编写测试          | "为 \[文件] 编写测试，覆盖 \[场景] 相关的边界情况"       |
| 提交前审查 | "看看我的工作区 diff，告诉我哪些看起来有风险"                       |
| 创建 PR            | "修复 \[问题]，写一个常规提交，并创建一个带摘要的 PR"    |
| 创建技能         | "为我创建一个 /ship 技能，在提交前运行测试和 lint 检查"               |
| 调试堆栈跟踪  | "这是堆栈跟踪，找出根本原因，不要只是表面修补"      |

  Claude Code 更新频繁。在内部分发前，请对照[文档首页](/zh/overview)核实版本特定细节。

