# Codex 应用

Codex 应用是一款专注的桌面体验，可并行处理 Codex 线程，内置工作树支持、自动化功能和 Git 操作。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 套餐均包含 Codex。了解[更多详情](https://developers.openai.com/codex/pricing)。

<PlatformSpecificContent>
  <CodexScreenshot
    slot="windows"
    alt="Codex app for Windows showing a project sidebar, active thread, and review pane"
    lightSrc="/images/codex/windows/codex-windows-light.webp"
    darkSrc="/images/codex/windows/codex-windows-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
  <CodexScreenshot
    alt="Codex app window with a project sidebar, active thread, and review pane"
    lightSrc="/images/codex/app/app-screenshot-light.webp"
    darkSrc="/images/codex/app/app-screenshot-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
</PlatformSpecificContent>

## 快速开始

Codex 应用支持 macOS 和 Windows 平台。

Codex 应用的大部分功能在两个平台上均可使用。平台特定的例外情况会在相关文档中注明。

<WorkflowSteps variant="headings">
1. 下载并安装 Codex 应用

    下载适用于 macOS 或 Windows 的 Codex 应用。如果你使用的是 Intel 芯片的 Mac，请选择 Intel 版本。

    <CodexAppDownloadCta client:load className="mb-4" />

    <div class="text-sm">
      [获取 Linux 通知](https://openai.com/form/codex-app/)
    </div>

2. 打开 Codex 并登录

   下载并安装 Codex 应用后，打开它并使用你的 ChatGPT 账户或 OpenAI API 密钥登录。

   如果你使用 OpenAI API 密钥登录，某些功能（如[云线程](https://developers.openai.com/codex/prompting#threads)）可能不可用。

3. 选择项目

   选择你希望 Codex 工作的项目文件夹。

如果你之前使用过 Codex 应用、CLI 或 IDE 扩展，你将看到之前使用过的项目。

4. 发送你的第一条消息

   选择项目后，确保选中**本地**以让 Codex 在你的机器上工作，然后向 Codex 发送你的第一条消息。

   你可以向 Codex 提问关于项目或你电脑的任何问题。以下是一些示例：

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

   如果你需要更多灵感，请探索 [Codex 用例](https://developers.openai.com/codex/use-cases)。
   如果你是 Codex 新手，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

</WorkflowSteps>

---

## 使用 Codex 应用

<BentoContainer class="mt-6">
  <BentoContent href="/codex/app/features#multitask-across-projects">

### 跨项目多任务处理

并行运行项目线程并在它们之间快速切换。

  </BentoContent>
  <BentoContent href="/codex/app/worktrees">

### 工作树

通过内置的 Git 工作树支持，隔离并行的代码更改。

  </BentoContent>
  <BentoContent href="/codex/remote-connections">

### 远程连接

使用 ChatGPT 移动应用在已连接的主机上启动、引导、批准和审查 Codex 工作。

  </BentoContent>
  <BentoContent href="/codex/app/computer-use">

### 计算机使用

让 Codex 使用 macOS 应用执行 GUI 任务、浏览器流程和原生应用测试。

  </BentoContent>
  <BentoContent href="/codex/appshots">

### 应用截图

将 Mac 最前面的应用窗口截图和可用文本发送给 Codex。

  </BentoContent>
  <BentoContent href="/codex/app/review">

### 审查并发布更改

检查差异、处理 PR 反馈、暂存文件、提交和推送。

  </BentoContent>
  <BentoContent href="/codex/app/features#integrated-terminal">

### 终端和操作

在每个线程中运行命令并启动可重复的项目操作。

  </BentoContent>
  <BentoContent href="/codex/app/browser">

### 应用内浏览器

打开渲染的页面、添加评论，或让 Codex 操作本地浏览器流程。

  </BentoContent>
  <BentoContent href="/codex/app/chrome-extension">

### Chrome 扩展

添加 Chrome 插件，让 Codex 可以使用 Chrome 执行已登录的浏览器任务，同时你可以管理网站批准。

  </BentoContent>
  <BentoContent href="/codex/app/features#image-generation">

### 图像生成

在线程中生成或编辑图像，同时处理周围的代码和资源。

  </BentoContent>
  <BentoContent href="/codex/app/automations">

### 自动化

调度定期任务，或唤醒同一线程进行持续检查。

  </BentoContent>
  <BentoContent href="/codex/app/features#skills-support">

### 技能

跨应用、CLI 和 IDE 扩展复用指令和工作流。

  </BentoContent>
  <BentoContent href="/codex/app/features#richer-outputs-and-artifacts">

### 侧边栏和制品

跟踪计划、来源、任务摘要和生成的文件预览。

  </BentoContent>
  <BentoContent href="/codex/plugins">

### 插件

连接应用、技能和 MCP 服务器以扩展 Codex 的功能。

  </BentoContent>
  <BentoContent href="/codex/app/features#sync-with-the-ide-extension">

### IDE 扩展同步

跨应用和 IDE 会话共享 Auto Context 和活动线程。

  </BentoContent>
</BentoContainer>

---

需要帮助？请访问[故障排除指南](https://developers.openai.com/codex/app/troubleshooting)。