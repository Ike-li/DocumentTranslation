# 在 monorepo 或大型代码库中设置 Claude Code

> 为 monorepo 和大型单体代码库配置 Claude Code，利用嵌套 CLAUDE.md 文件、稀疏工作树、代码智能和按包加载的技能，让 Claude 专注于你正在处理的代码。

大型代码库可以是一个包含数百万行代码的仓库，也可以是一个包含许多包的 monorepo。Claude Code 可以在任何规模下工作，但随着代码库增长，为较小项目调优的默认设置可能会用与任务无关的指令和文件读取填满上下文窗口，消耗 token 并降低 Claude 的性能。

本指南面向个人开发者和工程团队，展示如何将 Claude 的范围限定在任务涉及的代码库部分。每个章节都会注明该设置是仅适用于本地机器还是需要提交到仓库。

## 本指南涵盖的内容

[下方表格](#本页设置一览)列出了每项设置及其作用。其后的[文件树](#示例-monorepo)是本页所有代码示例所引用的 monorepo 示例。

### 本页设置一览

以下每项设置都是独立的。它们是叠加关系而非相互替代，因此请选择适合你仓库的配置。[选择启动 Claude 的位置](#选择启动-claude-的位置)决定了设置文件的存放位置，请先阅读该节。[综合运用]展示了所有配置的组合效果。

| 我希望                                                                                               | 使用                                                                                       |
| :-------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| 只加载你接触的代码的约定，而非一个覆盖所有子系统的根文件                                                   | 按目录分层的 [CLAUDE.md 文件](#按目录分层-claudemd-文件)                                    |
| 排除你从不工作的包的 CLAUDE.md 文件                                                                     | [`claudeMdExcludes`](#排除无关的-claudemd-文件)                                            |
| 阻止 Claude 打开构建输出、生成代码和供应商依赖                                                           | `permissions.deny` 中的 [`Read` 拒绝规则]                      |
| 通过语言服务器查找符号的定义或调用者，而不是扫描文件                                                       | [代码智能插件](#通过代码智能减少文件读取)                                                     |
| Claude 创建工作树时只检出任务需要的目录                                                                  | [`worktree.sparsePaths`](#只检出需要的目录)                                                 |
| 从同一会话中读取和编辑同级包或另一个仓库                                                                  | [`--add-dir`](#跨包或跨仓库授予访问权限) 或 `additionalDirectories`                         |
| 给 Claude 特定于某个区域的流程，仅在相关时加载                                                            | 按目录的[技能](#添加按目录的技能)                                                           |
| 用所有人都安装的一组约定替代大量按目录的 CLAUDE.md 文件                                                    | 内部市场中的[插件]                                              |

> **提示**
> 关于在任何仓库中保持上下文精简的工作流技巧（例如[在子代理中运行探索](/zh/best-practices#use-subagents-for-investigation)以避免文件读取进入主对话），请参阅 [Claude Code 最佳实践](/zh/best-practices)。要为组织中的每位开发者推广基线配置，请参阅[为组织设置 Claude Code](/zh/admin-setup)。

### 示例 monorepo

本页的示例引用了一个包含三个包的 monorepo。同样的模式也适用于大型单体代码库：当示例使用 `packages/api/` 时，请替换为你自己的子系统目录，例如 `src/backend/` 或 `lib/core/`。

```text
monorepo/
  CLAUDE.md                     # root instructions
  packages/
    api/
      CLAUDE.md                 # API-specific instructions
      .claude/skills/
      src/
    web/
      CLAUDE.md                 # frontend-specific instructions
      .claude/skills/
      src/
    shared/
      CLAUDE.md                 # shared library instructions
      src/
```

## 选择启动 Claude 的位置

你启动 `claude` 的位置决定了 Claude 无需额外权限授予即可读取和编辑哪些文件、启动时加载哪些 CLAUDE.md 文件到上下文中，以及应用哪些项目设置。

| 从哪里启动    | 文件访问权限                           | 启动时加载的 CLAUDE.md                                               | 适用场景                                   |
| :------------ | :-------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------- |
| 仓库根目录    | 所有文件                                | 仅根目录；子目录文件在 Claude 读取该目录时按需加载                      | 任务跨越多个包或子系统                      |
| 子目录        | 仅该子树，直到你授予更多权限             | 该目录及其所有祖先目录的文件                                           | 工作范围限定在一个包或子系统内              |

`.claude/settings.json` 中的项目设置仅从你的启动目录加载，不会像 CLAUDE.md 文件那样从父目录继承：仓库根目录的 `.claude/settings.json` 仅在你从根目录启动时才生效。

以下各节会说明其设置文件应放在仓库根目录还是你启动的子目录中，以及是提交还是保持本地。

## 按目录分层 CLAUDE.md 文件

在大型代码库中，仓库根目录的单个 CLAUDE.md 往往会膨胀到覆盖每个子系统的约定，消耗与当前任务无关的指令上下文，或者过于泛泛而失去实用价值。将指令分散到按目录的文件中意味着 Claude 会加载仓库范围的规则以及你正在处理的代码的约定。

Claude Code 会在启动时加载你工作目录及每个父目录中的所有 [CLAUDE.md](/zh/memory) 文件，然后在读取子目录中的文件时按需加载该子目录的文件。根文件设置仓库范围的规则，每个子目录添加自己的规则。

常见的分层方式是两级：

* **根目录 `CLAUDE.md`**：适用于所有地方的指令，例如编码标准、提交约定和仓库布局
* **每个子目录的 `CLAUDE.md`**：特定于该区域技术栈的约定。在 monorepo 中是每个包一个。在大型单体代码库中是每个子系统一个，例如 `src/db/` 或 `src/api/`

将这些文件提交到仓库，以便团队成员继承它们。每个目录的负责人通常维护其文件。

根目录 `CLAUDE.md` 帮助 Claude 了解仓库结构：

```markdown CLAUDE.md
This is a monorepo with three packages under packages/:

- packages/api: Node.js REST API with Express, TypeScript, and PostgreSQL
- packages/web: React frontend with Vite, TypeScript, and TailwindCSS
- packages/shared: shared TypeScript utilities used by both api and web

Run commands from the package directory, not the monorepo root.
Each package has its own tsconfig.json, package.json, and test suite.
```

每个子目录的 `CLAUDE.md`（此处为 `packages/api/CLAUDE.md`）添加特定于该区域技术栈的上下文：

```markdown packages/api/CLAUDE.md
This package is the REST API server.

- Run tests: `npm test` (uses Vitest)
- Run dev server: `npm run dev` (port 3001)
- Database migrations: `npm run migrate`
- Environment variables: copy `.env.example` to `.env`

API routes are in src/routes/. Each route file exports an Express router.
Database queries use Knex in src/db/. Never write raw SQL strings in route handlers.
```

当你从 `packages/api/` 启动 Claude 时，它会同时加载 `packages/api/CLAUDE.md` 和根目录 `CLAUDE.md`。Claude 会看到本地指令和仓库范围的规则，而不会在上下文中包含 `packages/web/` 的指令。非 monorepo 树中的任何子目录也是如此。

保持文件与代码库和模型变化同步的几种方法：

* **在 pull request 中审查**：将 CLAUDE.md 编辑视为其他文档变更，使约定与代码保持同步
* **在重大模型发布后重新审视**：针对旧模型限制编写的指令在新模型能自行处理该情况后可能变成开销。例如，一旦限制消失，强制单文件重构的规则就可以删除
* **添加一个 Stop 钩子来建议更新**：[`Stop` 钩子](/zh/hooks#stop)会在 Claude 完成响应时接收会话记录的路径，因此脚本可以在暴露出的差距还新鲜时审查会话并建议 CLAUDE.md 更新

有关 CLAUDE.md 文件如何加载和交互的更多信息，请参阅[记忆和项目指令](/zh/memory)。

### 选择按目录 CLAUDE.md 还是路径作用域规则

按目录的 `CLAUDE.md` 文件和 `.claude/rules/` 下的[路径作用域规则](/zh/memory#path-specific-rules)都可以让你将指令定向到树的特定部分。它们的区别在于文件存放位置和加载时机。

| 方式                                   | 文件位置                                 | 加载时机                                                                                   | 适用场景                                                                                     |
| :------------------------------------- | :--------------------------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| 按目录的 `CLAUDE.md`                   | 目录内，与代码并列                        | 从该目录启动时在启动时加载，或 Claude 读取该目录中的文件时按需加载                              | 目录负责人维护自己的约定；指令随代码一起版本控制                                                |
| `.claude/rules/` 中的路径作用域规则     | 仓库根目录的中央 `.claude/`              | Claude 处理匹配规则 `paths:` glob 的文件时                                                  | 你希望所有约定集中在一处，或同一规则适用于多个分散路径                                          |

有关包含技能在内的功能对比，请参阅[比较类似功能](/zh/features-overview#compare-similar-features)。

### 排除无关的 CLAUDE.md 文件

当你从仓库根目录启动 Claude 时，每个子目录的 CLAUDE.md 会在 Claude 读取该目录中的文件时加载。`claudeMdExcludes` 设置通过路径或 glob 模式跳过特定文件，使其永远不会加载。

将其用于你从不工作的目录，例如其他团队的包、遗留代码或供应商子树。排除列表是静态的，不是按任务切换的。如果你想今天专注于一个包，明天专注于另一个包，请[从该包的目录启动 Claude](#选择启动-claude-的位置)而不是编辑排除规则。

如果你只想对自己应用这些排除规则，请将设置放在 `.claude/settings.local.json` 中，该文件已被 gitignore 不会被提交。模式使用 glob 语法匹配绝对文件路径，因此请以 `**/` 开头的相对风格模式来匹配树中的任何位置。以下示例排除了其他团队拥有的包：

```json .claude/settings.local.json
{
  "claudeMdExcludes": [
    "**/packages/admin-dashboard/**",
    "**/packages/legacy-*/**"
  ]
}
```

这会跳过这些包下的所有 CLAUDE.md 和规则文件。根目录 CLAUDE.md 和你工作的包仍会正常加载。

这些模式涵盖了其他常见情况：

* `"**/packages/*/CLAUDE.md"`：排除每个包的 CLAUDE.md，同时保留根目录
* `"**/packages/web/**"`：排除 web 包下的所有内容，包括规则
* `"/home/user/monorepo/legacy/CLAUDE.md"`：通过绝对路径排除一个特定文件

托管策略 CLAUDE.md 文件无法被排除，因此组织范围的指令始终适用。你可以在任何[设置作用域](/zh/settings#configuration-scopes)中设置 `claudeMdExcludes`：用户、项目、本地或托管。数组会跨作用域合并，因此团队可以设置项目级默认值，而个人可以添加本地覆盖。

有关完整的排除文档，请参阅[排除特定 CLAUDE.md 文件](/zh/memory#exclude-specific-claude-md-files)。

## 减少 Claude 的读取量

指令只是 Claude 上下文的一部分。文件读取是另一项随代码库增长而增加的成本。以下设置阻止读取无关路径，并用语言服务器查找替代详尽的文件扫描。

### 阻止读取生成代码和供应商代码

Claude 的内容搜索默认遵守 `.gitignore`，因此已列在其中的路径（如 `node_modules/`、`dist/` 和 `build/`）无需额外配置即可排除在搜索结果之外。

对于已检入的路径，例如供应商 SDK 或已提交的生成代码，在 `permissions.deny` 中添加 `Read` 拒绝规则，以阻止 Claude 在搜索列出这些文件时打开它们。

要为仓库中的所有人应用这些排除规则，请将它们提交到 `.claude/settings.json`。要保持个人使用，请改用 `.claude/settings.local.json`。与本页的其他项目设置一样，这些文件仅从你的启动目录加载。如果你从仓库根目录启动，请将它们放在仓库根目录；如果从子目录启动，请放在每个包的 `.claude/` 中。要在每个会话中强制执行相同的拒绝规则而不受启动目录影响，请在[托管设置](/zh/settings#settings-files)中设置，用户和项目设置无法覆盖它们。

以下示例阻止了构建产物和供应商 SDK：

```json .claude/settings.json
{
  "permissions": {
    "deny": [
      "Read(./**/dist/**)",
      "Read(./**/build/**)",
      "Read(./**/*.generated.*)",
      "Read(./vendor/**)"
    ]
  }
}
```

拒绝规则覆盖 Claude 的内置文件工具和可识别的 Bash 文件命令，包括 `cat`、`head`、`grep` 和 `find`（当被拒绝的路径作为参数传递时）。它们不会从递归搜索的输出中过滤被拒绝的路径，也不会覆盖自行打开文件的任意子进程。有关完整的模式语法，请参阅 [Read 和 Edit 权限规则](/zh/permissions#read-and-edit)。

### 通过代码智能减少文件读取

在大型代码库中，查找符号的定义或使用位置可能需要大量文件读取和 grep 调用。[代码智能插件](/zh/discover-plugins#code-intelligence)将 Claude 连接到语言服务器，使其能够跳转到定义、查找引用并直接显示类型错误，而无需扫描整个树。

官方市场提供 TypeScript、Python、Go、Rust 和其他常见语言的插件。以下示例安装了 TypeScript 插件：

```shell
/plugin install typescript-lsp@claude-plugins-official
```

要为仓库中的所有人启用插件而不是自己安装，请将其添加到 [`enabledPlugins` 项目设置](/zh/settings#plugin-settings)。

代码智能插件需要每台开发者机器上有对应语言的语言服务器二进制文件。请参阅[每种语言需要哪个二进制文件](/zh/discover-plugins#code-intelligence)。从官方市场安装需要访问 GitHub 的网络，因为市场托管在 GitHub 上。在受限网络中，请改为[从内部 Git 主机或本地路径添加市场](/zh/discover-plugins#add-from-other-git-hosts)。

这与 `claudeMdExcludes` 和上述 `Read` 拒绝规则配合良好。那些规则将无关内容排除在上下文之外，而代码智能则避免 Claude 阅读剩余内容来定位定义。

## 限定工作树和文件访问范围

这些设置控制工作树中磁盘上的内容以及 Claude 在启动点之外可以读写哪些目录。

### 只检出需要的目录

`--worktree` 标志在新的 git 工作树中启动会话，使更改与你的主检出隔离。默认情况下它会检出整个仓库。在大型仓库中，`worktree.sparsePaths` 设置使用 git 稀疏检出，只将列出的目录和根级文件写入磁盘，使工作树启动更快且占用更少空间。

如果在此目录中工作的每个人都需要相同的路径，请将设置提交到 `.claude/settings.json`。要为自己添加路径，请使用 `.claude/settings.local.json`：列表会跨作用域合并，因此本地文件可以向已提交的列表添加路径但不能删除。以下示例展示了已提交的文件：

```json .claude/settings.json
{
  "worktree": {
    "sparsePaths": [
      ".claude",
      "packages/api",
      "packages/shared"
    ]
  }
}
```

当 Claude 创建工作树时，它只检出 `.claude/`、`packages/api/` 和 `packages/shared/`，而不是完整的树。`sparsePaths` 中的路径相对于仓库根目录，无论你从哪个子目录启动 Claude。任何目录路径都可以在这里使用，不限于包根目录。

这对[子代理工作树隔离](/zh/worktrees#isolate-subagents-with-worktrees)特别有用。子代理是为子任务生成的并行 Claude 实例，在工作树中运行的每个子代理都会获得一个轻量级检出而非完整树。会话中的所有工作树共享相同的 `sparsePaths`，因此如果一个子代理需要 `packages/api/` 而另一个需要 `packages/web/`，请将两者都列出。

在 `sparsePaths` 中列出目录，而不是单个文件。根级文件如 `package.json`、`tsconfig.base.json` 和锁定文件始终与你列出的目录一起检出。根级目录则不会，因此如果你想让仓库根目录的 `.claude/settings.json`、`.claude/rules/` 或 `.claude/skills/` 在工作树中可用，请在列表中包含 `.claude`。

要避免在工作树之间复制 `node_modules` 等大型目录，请在同一个 `.claude/settings.json` 中将 `sparsePaths` 与 `symlinkDirectories` 配合使用：

```json .claude/settings.json
{
  "worktree": {
    "sparsePaths": [
      ".claude",
      "packages/api",
      "packages/shared"
    ],
    "symlinkDirectories": [
      "node_modules"
    ]
  }
}
```

这会为每个工作树的 `node_modules/` 创建一个指向主仓库副本的符号链接，而不是在磁盘上复制它。

> **注意**
> `sparsePaths` 和 `symlinkDirectories` 设置在工作树创建之前从你的启动目录读取。创建后，会话的工作目录是工作树根目录，而不是你启动的子目录。因此工作树内的项目设置从工作树根目录的 `.claude/settings.json`（仓库根目录文件的检出副本）加载。将你在工作树中需要的任何其他设置（如权限规则或钩子）放在仓库根目录的 `.claude/settings.json` 中。

有关完整的工作树设置参考，请参阅[工作树设置](/zh/settings#worktree-settings)。

### 跨包或跨仓库授予访问权限

本节适用于你从子目录启动 Claude 或任务跨越多个检出的情况。如果你在单个大型树中从仓库根目录启动，Claude 已经可以访问所有文件，可以跳过本节。

当你从 `packages/api/` 启动 Claude 时，它可以读写该目录内的文件。如果任务需要跨包更改，例如更新 `api` 和 `web` 都导入的共享类型，你需要授予对同级目录的访问权限。同样的机制也可以授予对单独检出的仓库的访问权限。

`.claude/settings.json` 中的 `additionalDirectories` 设置让 Claude 可以访问工作目录之外的目录。以下示例授予了对两个同级包的访问权限：

```json .claude/settings.json
{
  "permissions": {
    "additionalDirectories": [
      "../shared",
      "../web"
    ]
  }
}
```

相对路径从你启动 Claude 的目录解析。使用此配置后，Claude 可以从 `packages/api/` 工作时读取和编辑 `packages/shared/` 和 `packages/web/` 中的文件。

你也可以在运行时通过启动 Claude 时传递 `--add-dir` 来授予访问权限，无需编辑设置：

```bash
claude --add-dir ../shared
```

无论你如何添加目录，Claude 都可以读取和编辑其中的文件。该目录的 CLAUDE.md、`.claude/rules/` 文件和技能是否也会加载取决于你添加它的方式：

| 添加方式                                | 是否加载 CLAUDE.md 和规则               | 是否加载技能  |
| :------------------------------------- | :--------------------------------------- | :----------- |
| `additionalDirectories` 设置            | 从不                                     | 从不         |
| `--add-dir` 标志或 `/add-dir` 命令      | 仅在设置以下环境变量时                    | 是           |

要从使用 `--add-dir` 或 `/add-dir` 添加的目录加载 CLAUDE.md 和规则文件，请设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` 环境变量：

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared
```

该环境变量对 `additionalDirectories` 设置中列出的目录无效。详情请参阅[从附加目录加载](/zh/memory#load-from-additional-directories)。

对于此区域中每个人都需要的同级目录，请将 `additionalDirectories` 提交到 `.claude/settings.json`。对于个人选择或一次性访问，请使用 `.claude/settings.local.json` 或在启动时传递 `--add-dir`。

## 添加按目录的技能

任何子目录都可以定义作用域于自身技术栈的[技能](/zh/skills)。技能在 Claude 确定其相关时按需加载，因此 API 专用工具不会在前端工作时消耗上下文。

技能存放在目录内的 `.claude/skills/` 下。将它们与该区域的代码一起提交，以便克隆仓库的任何人都能获得。在 monorepo 中，这可以是每个包一组技能。在大型单体代码库中，是每个子系统一组，例如 `src/db/.claude/skills/`。

在子目录中创建技能目录：

```bash
mkdir -p packages/api/.claude/skills/api-testing
```

然后在该目录中编写 `SKILL.md`，此处为 `packages/api/.claude/skills/api-testing/SKILL.md`。此示例教授 Claude API 包的测试模式：

```markdown packages/api/.claude/skills/api-testing/SKILL.md
---
name: api-testing
description: Testing patterns for the API package. Use when writing or modifying tests in packages/api/.
---

## Test structure

Tests are in `src/__tests__/` mirroring the `src/` directory structure.
Each route file has a corresponding `.test.ts` file.

## Running tests

- All tests: `npm test`
- Single file: `npm test -- src/__tests__/routes/users.test.ts`
- Watch mode: `npm test -- --watch`

## Test utilities

- `src/__tests__/helpers/db.ts`: provides `setupTestDb()` and `teardownTestDb()` for database tests
- `src/__tests__/helpers/auth.ts`: provides `createTestUser()` and `getAuthToken()` for authenticated endpoints

## Patterns

- Use `supertest` for HTTP assertions, not raw fetch
- Always wrap database tests in a transaction that rolls back
- Mock external services in `src/__tests__/mocks/`
```

不同的子目录以相同方式持有不同的技能：`packages/web/.claude/skills/component-patterns/` 描述前端的组件约定而非测试。当 Claude 处理 `packages/api/` 中的文件时，它会加载 api-testing 技能。当它在 `packages/web/` 中工作时，则加载 component-patterns。两个目录的技能不会在对方的任务中加载。

你也可以通过文件模式而非放置位置来限定技能范围。[`paths` frontmatter 字段](/zh/skills#frontmatter-reference)接受 glob 模式，Claude 仅在处理匹配文件时自动加载该技能。适用于存放在仓库根目录 `.claude/skills/` 中但仅适用于特定文件（无论它们出现在哪里）的技能，例如作用域为 `**/migrations/**` 的数据库迁移技能。

有关创建和组织技能的更多信息，请参阅[技能](/zh/skills)。

### 保持技能可发现性

当技能分散在多个目录中时，Claude 从中选择的列表可能变得很大。Claude 通过读取每个已发现技能的名称和描述来选择技能，只有被选中技能的完整内容才会加载到上下文中。本节介绍如何保持该列表精简并编写经得起缩减的描述。

哪些技能在范围内取决于你启动 Claude 的位置：

* **从子目录（如 `packages/api/`）启动**：来自该目录、向上直到仓库根目录的每个父目录以及用户和企业级别的技能
* **从仓库根目录启动**：来自会话中 Claude 接触的每个子目录的技能，可能累积到数百个
* **使用 [`--add-dir`](#跨包或跨仓库授予访问权限) 添加同级目录后**：该同级目录的技能也会加载。`additionalDirectories` 设置仅授予文件访问权限，不会加载技能

名称始终会加载，但[描述在技能数量多时会被截断](/zh/skills#skill-descriptions-are-cut-short)，这可能会删除 Claude 用于判断技能是否适用的关键词。保持描述简短，并以请求中可能包含的词语开头，例如"writing or modifying tests in `packages/api/`"。

对于多个目录共享的技能（如 PR 约定或部署清单），将它们放在仓库根目录的 `.claude/skills/` 中，以便从任何启动目录加载。当共享技能需要自己的版本历史或必须跨仓库工作时，请将它们打包为[插件](/zh/plugins)。插件技能使用 `plugin-name:skill-name` 命名空间，因此永远不会与按目录的技能冲突。平台团队可以在一处进行版本控制和更新。

要找出哪些技能未被使用，请启用 OpenTelemetry [日志导出器](/zh/monitoring-usage)并设置 `OTEL_LOG_TOOL_DETAILS=1`，以便技能名称以原文记录而非被编辑。[`skill_activated` 事件](/zh/monitoring-usage#skill-activated-event)在其 `skill.name` 属性中记录每次调用，`invocation_trigger` 记录是命令、Claude 还是嵌套技能调用了它，这告诉你该合并或淘汰什么。

## 当分层不再适用时集中管理约定

按目录的 CLAUDE.md 文件随着代码库增长可能变得难以治理。约定漂移、文件过时，没有人负责根文件。解决这个问题通常落在维护仓库 Claude Code 设置的团队身上，而不是每个在自己区域工作的开发者。

将约定和参考内容从始终加载的 CLAUDE.md 移到按需加载的机制中：

* [技能](/zh/skills)：Claude 仅在与任务相关时加载的参考资料
* [插件](/zh/plugins)：平台团队集中拥有的技能、钩子和命令的版本化包
* [MCP 服务器](/zh/mcp)：如果你的组织已经在仓库上运行代码搜索或 RAG 索引，请将其公开为 MCP 工具，让 Claude 查询它而不是直接读取文件

请参阅[服务端管理或端点管理设置](/zh/server-managed-settings#choose-between-server-managed-and-endpoint-managed-settings)了解平台团队如何集中执行这些设置。

### 在会话开始时推荐合适的插件

一旦约定存在于插件中，团队成员在不熟悉的树区域启动 Claude 时就没有关于该区域负责人维护哪些插件的信号。[`SessionStart` 钩子](/zh/hooks#sessionstart)可以弥补这一差距，因为钩子打印到 stdout 的任何内容都会在第一个提示词之前添加到 Claude 的上下文中。

例如，你可以编写一个脚本，从[钩子输入](/zh/hooks#common-input-fields)中读取启动目录，在提交到仓库的路径到插件映射中查找它，并打印推荐供 Claude 在首次回复中传递。请参阅[使用钩子自动化工作流](/zh/hooks-guide)来编写和注册钩子。

## 综合运用

以下组合配置使用了 monorepo 布局。相同的文件适用于大型单体树中的任何子目录。项目设置仅从你启动 Claude 的目录加载，因此每个子目录的 `.claude/settings.json` 必须是自包含的，而不是叠加在根文件上。

示例将 `worktree`、`additionalDirectories` 和 `Read` 拒绝规则提交到 `.claude/settings.json`，以便 `packages/api/` 中的每位开发者获得相同的同级访问权限、稀疏路径和排除规则。以下是 `packages/api/` 的已提交区域设置：

```json packages/api/.claude/settings.json
{
  "worktree": {
    "sparsePaths": [
      ".claude",
      "packages/api",
      "packages/shared"
    ],
    "symlinkDirectories": [
      "node_modules"
    ]
  },
  "permissions": {
    "additionalDirectories": [
      "../shared"
    ],
    "deny": [
      "Read(./**/dist/**)",
      "Read(./**/build/**)"
    ]
  }
}
```

因为此会话从 `packages/api/` 启动，同级包的 CLAUDE.md 文件已经不在范围内，所以这里不需要 `claudeMdExcludes`。如果你也从根目录启动会话，请改为将其添加到仓库根目录的 `.claude/settings.local.json`。

`additionalDirectories` 条目在你直接从 `packages/api/` 启动 Claude 时生效。在从此会话创建的工作树中，工作目录是工作树根目录，因此此设置文件不会加载。同级包在工作树中已经可以无需此设置即可访问，但拒绝规则需要在仓库根目录的 `.claude/settings.json` 中有第二个副本，以便工作树会话能够获取它们，如[工作树设置说明](#只检出需要的目录)所述：

```json .claude/settings.json
{
  "permissions": {
    "deny": [
      "Read(./**/dist/**)",
      "Read(./**/build/**)"
    ]
  }
}
```

设置完成后，仓库具有以下布局：

```text
monorepo/
  CLAUDE.md
  .claude/settings.json                           # deny rules for worktree sessions
  packages/
    api/
      CLAUDE.md
      .claude/settings.json                       # worktree, additionalDirectories, deny rules
      .claude/skills/api-testing/SKILL.md
    web/
      CLAUDE.md
      .claude/skills/component-patterns/SKILL.md
    shared/
      CLAUDE.md
```

使用此设置后，从 `packages/api/` 启动 Claude：

* 加载根 CLAUDE.md 和 `packages/api/CLAUDE.md`，跳过 `packages/web/CLAUDE.md`
* 可以读取和编辑 `packages/api/` 和 `packages/shared/` 中的文件
* 跳过 `packages/api/` 中 `dist/` 和 `build/` 下的构建产物读取
* 可按需使用 api-testing 技能
* 创建包含 `.claude/`、`packages/api/`、`packages/shared/` 和根级文件的工作树，拒绝规则从根设置文件应用于整个工作树

## 规划和计划跨包的更改

上述配置控制 Claude 看到的内容。当单个更改涉及多个包时（例如更新共享类型及其所有调用点），你如何限定范围和安排任务也会影响结果。

两种技巧有助于保持跨包更改的一致性：

* **在一个会话中给 Claude 完整的更改**：将共享编辑和其调用点一起交给 Claude，保持每个编辑背后的决策一致，而不是为每个包重新推导
* **在编辑前将计划保存到文件**：[先规划](/zh/best-practices#explore-first-then-plan-then-code)，让 Claude 将计划写入仓库中的 markdown 文件。长时间的跨包会话会在过程中[压缩其上下文](/zh/context-window#what-survives-compaction)，而保存的计划在对话历史可能丢失时仍然存在

## 后续步骤

配置到位后，你可以进一步优化：

* 使用[钩子](/zh/hooks-guide)在 Claude 编辑文件后运行按目录的 linter 或类型检查器
* 查看[有效管理成本](/zh/costs)了解代码库大小如何影响 token 使用量，以及如何在更广泛推广之前设置支出限制
* 阅读 Claude 博客上的 [Claude Code 如何在大型代码库中工作](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)了解组织推广模式和位于本页按仓库配置之上的所有权模型
