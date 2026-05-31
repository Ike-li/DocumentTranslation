# 工作流

Codex 在你把它当作一个拥有明确上下文和清晰"完成"定义的队友时效果最佳。
本页提供了 Codex IDE 扩展、Codex CLI 和 Codex 云端的端到端工作流示例。

如果你是 Codex 新手，请先阅读[提示词指南](https://developers.openai.com/codex/prompting)，然后回到这里获取具体的操作方案。

## 如何阅读这些示例

每个工作流包括：

- **适用场景**以及最适合的 Codex 使用方式（IDE、CLI 或云端）。
- **步骤**及示例用户提示词。
- **上下文说明**：Codex 自动获取的内容 vs 你需要附加的内容。
- **验证方法**：如何检查输出结果。

**注意：** IDE 扩展会自动将你打开的文件作为上下文。在 CLI 中，你通常需要显式提及文件路径（或使用 `/mention` 和 `@` 路径自动补全来附加文件）。

---

## 解释代码库

当你刚入职、接手一个服务，或者试图理解某个协议、数据模型或请求流程时，可以使用此工作流。

### IDE 扩展工作流（本地探索最快）

1. 打开最相关的文件。
2. 选中你关心的代码（可选但推荐）。
3. 向 Codex 提示：

   ```text
   Explain how the request flows through the selected code.

   Include:
   - a short summary of the responsibilities of each module involved
   - what data is validated and where
   - one or two "gotchas" to watch for when changing this
   ```

验证：

- 要求一个可以快速验证的图表或清单：

```text
Summarize the request flow as a numbered list of steps. Then list the files involved.
```

### CLI 工作流（适合需要记录 + shell 命令的场景）

1. 启动交互式会话：

   ```bash
   codex
   ```

2. 附加文件（可选）并提示：

   ```text
   I need to understand the protocol used by this service. Read @foo.ts @schema.ts and explain the schema and request/response flow. Focus on required vs optional fields and backward compatibility rules.
   ```

上下文说明：

- 你可以在编辑器中使用 `@` 从工作区插入文件路径，或使用 `/mention` 附加特定文件。

---

## 修复 bug

当你有一个可以在本地复现的失败行为时，可以使用此工作流。

### CLI 工作流（复现和验证的紧密循环）

1. 在仓库根目录启动 Codex：

   ```bash
   codex
   ```

2. 给 Codex 提供复现步骤以及你怀疑的文件：

   ```text
   Bug: Clicking "Save" on the settings screen sometimes shows "Saved" but doesn't persist the change.

   Repro:
   1) Start the app: npm run dev
   2) Go to /settings
   3) Toggle "Enable alerts"
   4) Click Save
   5) Refresh the page: the toggle resets

   Constraints:
   - Do not change the API shape.
   - Keep the fix minimal and add a regression test if feasible.

   Start by reproducing the bug locally, then propose a patch and run checks.
   ```

上下文说明：

- 由你提供：复现步骤和约束条件（这些比高层描述更重要）。
- 由 Codex 提供：命令输出、发现的调用点以及它触发的任何堆栈跟踪。

验证：

- Codex 应在修复后重新运行复现步骤。
- 如果你有标准的检查流水线，要求它运行：

```text
After the fix, run lint + the smallest relevant test suite. Report the commands and results.
```

### IDE 扩展工作流

1. 打开你认为存在 bug 的文件及其最近的调用方。
2. 向 Codex 提示：

   ```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
   ```

---

## 编写测试

当你想非常明确地指定测试范围时，可以使用此工作流。

### IDE 扩展工作流（基于选中内容）

1. 打开包含该函数的文件。
2. 选中定义该函数的行。从命令面板中选择"Add to Codex Thread"将这些行添加到上下文中。
3. 向 Codex 提示：

   ```text
   Write a unit test for this function. Follow conventions used in other tests.
   ```

上下文说明：

- 由"Add to Codex Thread"命令提供：选中的行（即"行号"范围）以及打开的文件。

### CLI 工作流（在提示词中描述路径 + 行范围）

1. 启动 Codex：

   ```bash
   codex
   ```

2. 使用函数名提示：

   ```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
   ```

---

## 从截图创建原型

当你有一个设计稿、截图或 UI 参考，并希望快速获得一个可运行的原型时，可以使用此工作流。

### CLI 工作流（图片 + 提示词）

1. 将截图保存到本地（例如 `./specs/ui.png`）。
2. 运行 Codex：

   ```bash
   codex
   ```

3. 将图片文件拖拽到终端以附加到提示词中。

4. 补充约束条件和结构：

   ```text
   Create a new dashboard based on this image.

   Constraints:
   - Use react, vite, and tailwind. Write the code in typescript.
   - Match spacing, typography, and layout as closely as possible.

   Deliverables:
   - A new route/page that renders the UI
   - Any small components needed
   - README.md with instructions to run it locally
   ```

上下文说明：

- 图片提供了视觉需求，但你仍然需要指定实现约束（框架、路由、组件样式）。
- 为获得最佳效果，请用文字说明任何非显而易见的行为（悬停状态、验证规则、键盘交互）。

验证：

- 要求 Codex 运行开发服务器（如果允许）并告诉你具体查看位置：

```text
Start the dev server and tell me the local URL/route to view the prototype.
```

### IDE 扩展工作流（图片 + 已有文件）

1. 在 Codex 聊天中附加图片（拖拽或粘贴）。
2. 向 Codex 提示：

   ```text
   Create a new settings page. Use the attached screenshot as the target UI.
   Follow design and visual patterns from other files in this project.
   ```

---

## 通过实时更新迭代 UI

当你希望在 Codex 编辑代码时实现紧密的"设计 → 调整 → 刷新 → 调整"循环时，可以使用此工作流。

### CLI 工作流（运行 Vite，然后用简短提示词迭代）

1. 启动 Codex：

   ```bash
   codex
   ```

2. 在单独的终端窗口中启动开发服务器：

   ```bash
   npm run dev
   ```

3. 向 Codex 提示进行更改：

   ```text
   Propose 2-3 styling improvements for the landing page.
   ```

4. 选择一个方向，用简短、具体的提示词迭代：

   ```text
   Go with option 2.

   Change only the header:
   - make the typography more editorial
   - increase whitespace
   - ensure it still looks good on mobile
   ```

5. 用有针对性的请求重复：

   ```text
   Next iteration: reduce visual noise.
   Keep the layout, but simplify colors and remove any redundant borders.
   ```

验证：

- 在浏览器中"实时"查看代码更新后的变化。
- 提交你喜欢的更改，还原不喜欢的。
- 如果你还原或修改了某个更改，告诉 Codex，以免它在处理下一个提示词时覆盖该更改。

---

## 将重构委派到云端

当你想在本地仔细设计（本地上下文、快速检查），然后将冗长的实现外包给可以并行运行的云端任务时，可以使用此工作流。

### 本地规划（IDE）

1. 确保你当前的工作已提交或至少已暂存，以便可以清晰地比较更改。
2. 要求 Codex 生成重构计划。如果你有 `$plan` 技能可用，显式调用它：

   ```text
   $plan

   We need to refactor the auth subsystem to:
   - split responsibilities (token parsing vs session loading vs permissions)
   - reduce circular imports
   - improve testability

   Constraints:
   - No user-visible behavior changes
   - Keep public APIs stable
   - Include a step-by-step migration plan
   ```

3. 审查计划并协商更改：

   ```text
   Revise the plan to:
   - specify exactly which files move in each milestone
   - include a rollback strategy
   ```

上下文说明：

- 当 Codex 能在本地扫描当前代码（入口点、模块边界、依赖图提示）时，规划效果最佳。

### 云端委派（IDE → 云端）

1. 如果你还没有设置，请先设置 [Codex 云端环境](https://developers.openai.com/codex/cloud/environments)。
2. 点击提示词编辑器下方的云图标，选择你的云端环境。
3. 当你输入下一个提示词时，Codex 会在云端创建一个新线程，该线程会继承现有线程的上下文（包括计划和任何本地源代码更改）。

   ```text
   Implement Milestone 1 from the plan.
   ```

4. 审查云端 diff，如有需要则迭代。
5. 直接从云端创建 PR，或将更改拉取到本地进行测试和收尾。
6. 对计划的其他里程碑进行迭代。

---

## 进行本地代码审查

当你希望在提交或创建 PR 之前获得第二双眼睛时，可以使用此工作流。

### CLI 工作流（审查你的工作树）

1. 启动 Codex：

   ```bash
   codex
   ```

2. 运行审查命令：

   ```text
   /review
   ```

3. 可选：提供自定义关注指令：

   ```text
   /review Focus on edge cases and security issues
   ```

验证：

- 根据审查反馈应用修复，然后重新运行 `/review` 以确认问题已解决。

---

## 审查 GitHub Pull Request

当你希望无需将分支拉取到本地即可获得审查反馈时，可以使用此工作流。

使用此功能前，请在你的仓库上启用 Codex **代码审查**。参见[代码审查](https://developers.openai.com/codex/integrations/github)。

### GitHub 工作流（评论驱动）

1. 在 GitHub 上打开 Pull Request。
2. 留下评论，用明确的关注领域标记 Codex：

   ```text
   @codex review
   ```

3. 可选：提供更明确的指令。

   ```text
   @codex review for security vulnerabilities and security concerns
   ```

---

## 更新文档

当你需要一个准确且清晰的文档更改时，可以使用此工作流。

### IDE 或 CLI 工作流（本地编辑 + 本地验证）

1. 确定要更改的文档文件并打开它们（IDE）或用 `@` 提及它们（IDE 或 CLI）。
2. 向 Codex 提示范围和验证要求：

   ```text
   Update the "advanced features" documentation to provide authentication troubleshooting guidance. Verify that all links are valid.
   ```

3. Codex 起草更改后，审查文档并根据需要迭代。

验证：

- 阅读渲染后的页面。
