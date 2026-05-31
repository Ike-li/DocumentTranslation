# 快速入门

每个 ChatGPT 套餐都包含 Codex。

你也可以使用 OpenAI API 密钥登录，通过 API 额度使用 Codex。

## 设置

### 应用

Codex 应用支持 macOS 和 Windows。

大多数 Codex 应用功能在两个平台上均可使用。平台相关的差异会在相应文档中注明。

1. 下载并安装 Codex 应用

    下载适用于 macOS 或 Windows 的 Codex 应用。如果你使用的是 Intel 芯片的 Mac，请选择 Intel 版本。

    <CodexAppDownloadCta client:load className="mb-4" />

    <div class="text-sm">
      [获取 Linux 版通知](https://openai.com/form/codex-app/)
    </div>

2. 打开 Codex 并登录

   下载并安装 Codex 应用后，打开它并使用你的 ChatGPT 账户或 OpenAI API 密钥登录。

   如果使用 OpenAI API 密钥登录，部分功能（如[云端线程](https://developers.openai.com/codex/prompting#threads)）可能不可用。

3. 选择项目

   选择你希望 Codex 工作的项目文件夹。

    如果你之前使用过 Codex 应用、CLI 或 IDE 扩展，你会看到之前处理过的项目。

4. 发送你的第一条消息

   选择项目后，确保选中 **Local**，让 Codex 在你的机器上工作，然后发送你的第一条消息。

   你可以向 Codex 询问关于项目或你计算机的任何问题。以下是一些示例：

   <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="snake-game"
       shortDescription="Build a classic Snake game in this repo."
       prompt={[
         "Build a classic Snake game in this repo.",
         "",
         "Scope & constraints:",
         "- Implement ONLY the classic Snake loop: grid movement, growing snake, food spawn, score, game-over, restart.",
         "- Reuse existing project tooling/frameworks; do NOT add new dependencies unless truly required.",
         "- Keep UI minimal and consistent with the repo's existing styles (no new design systems, no extra animations).",
         "",
         "Implementation plan:",
         "1) Inspect the repo to find the right place to add a small interactive game (existing pages/routes/components).",
         "2) Implement game state (snake positions, direction, food, score, tick timer) with deterministic, testable logic.",
         "3) Render: simple grid + snake + food; support keyboard controls (arrow keys/WASD) and on-screen controls if mobile is present in the repo.",
         "4) Add basic tests for the core game logic (movement, collisions, growth, food placement) if the repo has a test runner.",
         "",
         "Deliverables:",
         "- A small set of files/changes with clear names.",
         "- Short run instructions (how to start dev server + where to navigate).",
         "- A brief checklist of what to manually verify (controls, pause/restart, boundaries).",
       ].join("\n")}
       iconName="gamepad"
     />
     <ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="Find and fix bugs in my codebase with minimal, high-confidence changes."
       prompt={[
         "Find and fix bugs in my codebase with minimal, high-confidence changes.",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce: run tests/lint/build (or follow the existing repo scripts). If I provided an error, reproduce that exact failure.",
         "2) Localize: identify the smallest set of files/lines involved (stack traces, failing tests, logs).",
         "3) Fix: implement the minimal change that resolves the issue without refactors or unrelated cleanup.",
         "4) Prove: add/update a focused test (or a tight repro) that fails before and passes after.",
         "",
         "Constraints:",
         "- Do NOT invent errors or pretend to run commands you cannot run.",
         "- No scope drift: no new features, no UI embellishments, no style overhauls.",
         "- If information is missing, state what you can confirm from the repo and what remains unknown.",
         "",
         "Output:",
         "- Summary (3–6 sentences max): what was broken, why, and the fix.",
         "- Then ≤5 bullets: What changed, Where (paths), Evidence (tests/logs), Risks, Next steps.",
       ].join("\n")}
       iconName="search"
     />
   </ExampleGallery>

   如果需要更多灵感，请探索 [Codex 使用场景](https://developers.openai.com/codex/use-cases)。
   如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

### IDE 扩展

为你的 IDE 安装 Codex 扩展。

1. 安装 Codex 扩展

    为你的编辑器下载扩展：

    - [下载 Visual Studio Code 版](vscode:extension/openai.chatgpt)
    - [下载 Cursor 版](cursor:extension/openai.chatgpt)
    - [下载 Windsurf 版](windsurf:extension/openai.chatgpt)
    - [下载 Visual Studio Code Insiders 版](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

2. 打开 Codex 面板

    安装后，Codex 扩展会与其他扩展一起出现在侧边栏中。它可能隐藏在折叠区域。如果你愿意，可以将 Codex 面板移到编辑器右侧。

3. 登录并开始你的第一个任务

    使用你的 ChatGPT 账户或 API 密钥登录即可开始使用。

    Codex 默认以代理模式启动，可以读取文件、运行命令并在你的项目目录中写入更改。

    <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="snake-game"
       shortDescription="Build a classic Snake game in this repo."
       prompt={[
         "Build a classic Snake game in this repo.",
         "",
         "Scope & constraints:",
         "- Implement ONLY the classic Snake loop: grid movement, growing snake, food spawn, score, game-over, restart.",
         "- Reuse existing project tooling/frameworks; do NOT add new dependencies unless truly required.",
         "- Keep UI minimal and consistent with the repo's existing styles (no new design systems, no extra animations).",
         "",
         "Implementation plan:",
         "1) Inspect the repo to find the right place to add a small interactive game (existing pages/routes/components).",
         "2) Implement game state (snake positions, direction, food, score, tick timer) with deterministic, testable logic.",
         "3) Render: simple grid + snake + food; support keyboard controls (arrow keys/WASD) and on-screen controls if mobile is present in the repo.",
         "4) Add basic tests for the core game logic (movement, collisions, growth, food placement) if the repo has a test runner.",
         "",
         "Deliverables:",
         "- A small set of files/changes with clear names.",
         "- Short run instructions (how to start dev server + where to navigate).",
         "- A brief checklist of what to manually verify (controls, pause/restart, boundaries).",
       ].join("\n")}
       iconName="gamepad"
     />
     <ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="Find and fix bugs in my codebase with minimal, high-confidence changes."
       prompt={[
         "Find and fix bugs in my codebase with minimal, high-confidence changes.",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce: run tests/lint/build (or follow the existing repo scripts). If I provided an error, reproduce that exact failure.",
         "2) Localize: identify the smallest set of files/lines involved (stack traces, failing tests, logs).",
         "3) Fix: implement the minimal change that resolves the issue without refactors or unrelated cleanup.",
         "4) Prove: add/update a focused test (or a tight repro) that fails before and passes after.",
         "",
         "Constraints:",
         "- Do NOT invent errors or pretend to run commands you cannot run.",
         "- No scope drift: no new features, no UI embellishments, no style overhauls.",
         "- If information is missing, state what you can confirm from the repo and what remains unknown.",
         "",
         "Output:",
         "- Summary (3–6 sentences max): what was broken, why, and the fix.",
         "- Then ≤5 bullets: What changed, Where (paths), Evidence (tests/logs), Risks, Next steps.",
       ].join("\n")}
       iconName="search"
     />
   </ExampleGallery>

4. 使用 Git 检查点

    Codex 可以修改你的代码库，因此建议在每个任务前后创建 Git 检查点，以便在需要时轻松回滚更改。
    如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

    <CtaPillLink href="/codex/ide" label="Learn more about the Codex IDE extension" class="mt-8" />

### CLI

Codex CLI 支持 macOS、Windows 和 Linux。

1. 安装 Codex CLI

    在 macOS 或 Linux 上，使用独立安装程序：

    ```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | sh
    ```

    在 Windows 上，运行：

    ```powershell
    powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
    ```

    对于无人值守安装，请在运行下载安装程序的 shell 中设置 `CODEX_NON_INTERACTIVE=1`。详情请参阅
    [环境变量](https://developers.openai.com/codex/environment-variables#installer-variables)。

    ```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
    ```

    ```powershell
    $env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
    ```

    你也可以使用 npm 或 Homebrew 安装 Codex CLI：

    ```bash
    npm install -g @openai/codex
    ```

    ```bash
    brew install --cask codex
    ```

2. 运行 `codex` 并登录

    在终端中运行 `codex` 即可开始使用。系统会提示你使用 ChatGPT 账户或 API 密钥登录。

3. 让 Codex 在当前目录中工作

    认证后，你可以让 Codex 在当前目录中执行任务。

    <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="snake-game"
       shortDescription="Build a classic Snake game in this repo."
       prompt={[
         "Build a classic Snake game in this repo.",
         "",
         "Scope & constraints:",
         "- Implement ONLY the classic Snake loop: grid movement, growing snake, food spawn, score, game-over, restart.",
         "- Reuse existing project tooling/frameworks; do NOT add new dependencies unless truly required.",
         "- Keep UI minimal and consistent with the repo's existing styles (no new design systems, no extra animations).",
         "",
         "Implementation plan:",
         "1) Inspect the repo to find the right place to add a small interactive game (existing pages/routes/components).",
         "2) Implement game state (snake positions, direction, food, score, tick timer) with deterministic, testable logic.",
         "3) Render: simple grid + snake + food; support keyboard controls (arrow keys/WASD) and on-screen controls if mobile is present in the repo.",
         "4) Add basic tests for the core game logic (movement, collisions, growth, food placement) if the repo has a test runner.",
         "",
         "Deliverables:",
         "- A small set of files/changes with clear names.",
         "- Short run instructions (how to start dev server + where to navigate).",
         "- A brief checklist of what to manually verify (controls, pause/restart, boundaries).",
       ].join("\n")}
       iconName="gamepad"
     />
     <ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="Find and fix bugs in my codebase with minimal, high-confidence changes."
       prompt={[
         "Find and fix bugs in my codebase with minimal, high-confidence changes.",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce: run tests/lint/build (or follow the existing repo scripts). If I provided an error, reproduce that exact failure.",
         "2) Localize: identify the smallest set of files/lines involved (stack traces, failing tests, logs).",
         "3) Fix: implement the minimal change that resolves the issue without refactors or unrelated cleanup.",
         "4) Prove: add/update a focused test (or a tight repro) that fails before and passes after.",
         "",
         "Constraints:",
         "- Do NOT invent errors or pretend to run commands you cannot run.",
         "- No scope drift: no new features, no UI embellishments, no style overhauls.",
         "- If information is missing, state what you can confirm from the repo and what remains unknown.",
         "",
         "Output:",
         "- Summary (3–6 sentences max): what was broken, why, and the fix.",
         "- Then ≤5 bullets: What changed, Where (paths), Evidence (tests/logs), Risks, Next steps.",
       ].join("\n")}
       iconName="search"
     />
   </ExampleGallery>

4. 使用 Git 检查点

    Codex 可以修改你的代码库，因此建议在每个任务前后创建 Git 检查点，以便在需要时轻松回滚更改。
    如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

    <CtaPillLink href="/codex/cli" label="Learn more about the Codex CLI" class="mt-8" />

### 云端

在 [chatgpt.com/codex](https://chatgpt.com/codex) 使用云端 Codex。

1. 在浏览器中打开 Codex

    前往 [chatgpt.com/codex](https://chatgpt.com/codex)。你也可以在 GitHub 拉取请求评论中通过 `@codex` 标签将任务委派给 Codex（需要登录 ChatGPT）。

2. 设置环境

    在开始第一个任务之前，为 Codex 设置一个环境。打开 [chatgpt.com/codex](https://chatgpt.com/codex/settings/environments) 的环境设置，按照步骤连接 GitHub 仓库。

3. 启动任务并监控进度

    环境准备就绪后，从 [Codex 界面](https://chatgpt.com/codex)启动编码任务。你可以通过查看日志实时监控进度，或让任务在后台运行。

    <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="architecture-failure-modes"
       shortDescription="Explain the top failure modes of my application's architecture."
       prompt={[
         "Explain the top failure modes of my application's architecture.",
         "",
         "Approach:",
         "- Derive the architecture from repo evidence (services, DBs, queues, network calls, critical paths).",
         "- Identify realistic failure modes (availability, data loss, latency, scaling, consistency, security, dependency outages).",
         "",
         "Output:",
         "- 1 short overview paragraph.",
         "- Then ≤5 bullets: Failure mode, Trigger, Symptoms, Detection, Mitigation.",
         "- If key architecture details are missing, state what you inferred vs. what you confirmed.",
       ].join("\n")}
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="Find and fix bugs in my codebase with minimal, high-confidence changes."
       prompt={[
         "Find and fix bugs in my codebase with minimal, high-confidence changes.",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce: run tests/lint/build (or follow the existing repo scripts). If I provided an error, reproduce that exact failure.",
         "2) Localize: identify the smallest set of files/lines involved (stack traces, failing tests, logs).",
         "3) Fix: implement the minimal change that resolves the issue without refactors or unrelated cleanup.",
         "4) Prove: add/update a focused test (or a tight repro) that fails before and passes after.",
         "",
         "Constraints:",
         "- Do NOT invent errors or pretend to run commands you cannot run.",
         "- No scope drift: no new features, no UI embellishments, no style overhauls.",
         "- If information is missing, state what you can confirm from the repo and what remains unknown.",
         "",
         "Output:",
         "- Summary (3–6 sentences max): what was broken, why, and the fix.",
         "- Then ≤5 bullets: What changed, Where (paths), Evidence (tests/logs), Risks, Next steps.",
       ].join("\n")}
       iconName="search"
     />
   </ExampleGallery>

4. 审查更改并创建拉取请求

    任务完成后，在差异视图中审查提议的更改。你可以对结果进行迭代，或直接在 GitHub 仓库中创建拉取请求。

    Codex 还提供更改预览。你可以直接接受 PR，或在本地检出分支来测试更改：

    ```bash
    git fetch
    git checkout <branch-name>
    ```

    <CtaPillLink href="/codex/cloud" label="Learn more about Codex cloud" class="mt-8" />

<div class="h-6" aria-hidden="true"></div>

## 后续步骤

[<IconItem title="Learn more about the Codex app" className="mt-2">
    <span slot="icon">
      <OpenBook />
    </span>
    使用 Codex 应用处理你的本地项目。
  </IconItem>](https://developers.openai.com/codex/app)

[<IconItem title="Migrate to Codex" className="mt-2">
    <span slot="icon">
      <CompareArrows />
    </span>
    将支持的指令文件、MCP 服务器配置、技能和子代理迁移到 Codex。
  </IconItem>](https://developers.openai.com/codex/migrate)
