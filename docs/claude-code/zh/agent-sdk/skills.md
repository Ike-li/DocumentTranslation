> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 请使用此文件了解所有可用页面，再进一步探索。

# SDK 中的技能

> 使用 Claude 技能 SDK 中的技能扩展 Claude 的专业能力

## 概述

技能通过专业能力扩展 Claude，Claude 会在相关情境下自主调用这些技能。技能以 `SKILL.md` 文件形式打包，包含指令、描述和可选的辅助资源。

关于技能的全面信息（包括优势、架构和编写指南），请参阅[技能概述](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)。

## 技能在 SDK 中的工作方式

使用 Claude 技能 SDK 时，技能具有以下特点：

1. **定义为文件系统工件**：在特定目录（`.claude/skills/`）中创建为 `SKILL.md` 文件
2. **从文件系统加载**：技能从受 `settingSources`（TypeScript）或 `setting_sources`（Python）控制的文件系统位置加载
3. **自动发现**：文件系统设置加载后，启动时会在用户和项目目录中发现技能元数据；触发时加载完整内容
4. **模型调用**：Claude 根据上下文自主选择何时使用它们
5. **通过 `skills` 选项过滤**：默认启用发现的技能。传入技能名称列表、`"all"` 或 `[]` 以控制会话中可用的技能

与子代理（可编程定义）不同，技能必须创建为文件系统工件。SDK 不提供用于注册技能的编程 API。

  技能通过文件系统设置源进行发现。使用默认的 `query()` 选项时，SDK 会加载用户和项目来源，因此 `~/.claude/skills/`、`<cwd>/.claude/skills/` 以及从 `<cwd>` 到仓库根目录间任何父目录中的 `.claude/skills/` 下的技能均可用。若显式设置 `settingSources`，请包含 `'user'` 或 `'project'` 以保留技能发现功能，或使用 [`plugins` 选项](/zh/agent-sdk/plugins) 从特定路径加载技能。

## 通过 SDK 使用技能

在 `query()` 上设置 `skills` 选项，以控制会话中可用的技能。如果省略该选项，则会启用已发现的技能，并且技能工具将可用，这与 CLI 行为一致。传入 `"all"` 可启用所有已发现的技能；传入技能名称列表可仅启用这些技能；传入 `[]` 可禁用所有技能。当你设置 `skills` 时，SDK 会自动启用技能工具，因此你无需在 `allowedTools` 中列出它。

配置完成后，Claude 会自动从文件系统中发现技能，并在用户请求相关时调用它们。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions


  async def main():
      options = ClaudeAgentOptions(
          cwd="/path/to/project",  # Project with .claude/skills/
          setting_sources=["user", "project"],  # Load Skills from filesystem
          skills="all",  # Enable every discovered Skill
          allowed_tools=["Read", "Write", "Bash"],
      )

      async for message in query(
          prompt="Help me process this PDF document", options=options
      ):
          print(message)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Help me process this PDF document",
    options: {
      cwd: "/path/to/project", // Project with .claude/skills/
      settingSources: ["user", "project"], // Load Skills from filesystem
      skills: "all", // Enable every discovered Skill
      allowedTools: ["Read", "Write", "Bash"]
    }
  })) {
    console.log(message);
  }
  ```

要仅启用特定的技能，请传递其名称。名称需与 `SKILL.md` 中的 `name` 字段或技能目录名匹配。对于插件提供的技能，请使用 `plugin:skill` 格式。

  ```python Python
  options = ClaudeAgentOptions(skills=["pdf", "docx"])
  ```

  ```typescript TypeScript
  const options = { skills: ["pdf", "docx"] };
  ```

`skills` 选项是一个上下文过滤器，而非沙箱。未列出的技能对模型是隐藏的，并且会被技能工具拒绝，但其文件仍保留在磁盘上，并且可通过 Read 和 Bash 工具访问。

## 技能位置

技能从文件系统目录中加载，具体取决于您的 `settingSources`/`setting_sources` 配置：

* **项目技能** (`.claude/skills/`)：通过 git 与您的团队共享 - 当 `setting_sources` 包含 `"project"` 时加载
* **用户技能** (`~/.claude/skills/`)：跨所有项目的个人技能 - 当 `setting_sources` 包含 `"user"` 时加载
* **插件技能**：随已安装的 Claude Code 插件捆绑提供

## 创建技能

技能被定义为包含 `SKILL.md` 文件的目录，该文件具有 YAML frontmatter 和 Markdown 内容。`description` 字段决定了 Claude 何时调用您的技能。

**目录结构示例**：
```bash
.claude/skills/processing-pdfs/
└── SKILL.md
```
有关创建技能的完整指南，包括 SKILL.md 结构、多文件技能及示例，请参阅：

* [Claude Code 中的代理技能](/zh/skills)：包含示例的完整指南
* [代理技能最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)：编写指南和命名约定

## 工具限制

  在SKILL.md文件中，`allowed-tools` 前置字段仅在直接使用 Claude Code CLI 时受支持。**通过 SDK 使用技能时，该字段不生效**。

  使用 SDK 时，请通过查询配置中的主 `allowedTools` 选项来控制工具访问。

在 SDK 应用程序中控制技能的工具访问权限，可使用 `allowedTools` 预先批准特定工具。若无 `canUseTool` 回调函数，则未列入列表的所有工具将被拒绝使用：

  后续代码片段均假定已包含第一个示例中的导入语句。



  ```python Python
  options = ClaudeAgentOptions(
      setting_sources=["user", "project"],  # Load Skills from filesystem
      skills="all",
      allowed_tools=["Read", "Grep", "Glob"],
  )

  async for message in query(prompt="Analyze the codebase structure", options=options):
      print(message)
  ```

  ```typescript TypeScript
  for await (const message of query({
    prompt: "Analyze the codebase structure",
    options: {
      settingSources: ["user", "project"], // Load Skills from filesystem
      skills: "all",
      allowedTools: ["Read", "Grep", "Glob"],
      permissionMode: "dontAsk" // Deny anything not in allowedTools
    }
  })) {
    console.log(message);
  }
  ```

## 发现可用技能

要查看您的 SDK 应用中有哪些可用技能，只需询问 Claude 即可：

  ```python Python
  options = ClaudeAgentOptions(
      setting_sources=["user", "project"],  # Load Skills from filesystem
      skills="all",
  )

  async for message in query(prompt="What Skills are available?", options=options):
      print(message)
  ```

  ```typescript TypeScript
  for await (const message of query({
    prompt: "What Skills are available?",
    options: {
      settingSources: ["user", "project"], // Load Skills from filesystem
      skills: "all"
    }
  })) {
    console.log(message);
  }
  ```

Claude 将根据您当前的工作目录和已安装插件列出可用的技能。

## 测试技能

通过提出与技能描述相匹配的问题来测试技能：

  ```python Python
  options = ClaudeAgentOptions(
      cwd="/path/to/project",
      setting_sources=["user", "project"],  # Load Skills from filesystem
      skills="all",
      allowed_tools=["Read", "Bash"],
  )

  async for message in query(prompt="Extract text from invoice.pdf", options=options):
      print(message)
  ```

  ```typescript TypeScript
  for await (const message of query({
    prompt: "Extract text from invoice.pdf",
    options: {
      cwd: "/path/to/project",
      settingSources: ["user", "project"], // Load Skills from filesystem
      skills: "all",
      allowedTools: ["Read", "Bash"]
    }
  })) {
    console.log(message);
  }
  ```

Claude 会根据您的请求描述自动调用相关技能。

## 故障排除

### 找不到技能

**检查设置来源配置**：技能通过 `user` 和 `project` 设置来源发现。如果您显式设置了 `settingSources`/`setting_sources` 但省略了这些来源，技能将不会被加载：

  ```python Python
  # Skills not loaded: setting_sources excludes user and project
  options = ClaudeAgentOptions(setting_sources=[], skills="all")

  # Skills loaded: user and project sources included
  options = ClaudeAgentOptions(
      setting_sources=["user", "project"],
      skills="all",
  )
  ```

  ```typescript TypeScript
  // Skills not loaded: settingSources excludes user and project
  const options = {
    settingSources: [],
    skills: "all"
  };

  // Skills loaded: user and project sources included
  const options = {
    settingSources: ["user", "project"],
    skills: "all"
  };
  ```

更多关于 `settingSources`/`setting_sources` 的详细信息，请参阅 [TypeScript SDK 参考文档](/zh/agent-sdk/typescript#settingsource) 或 [Python SDK 参考文档](/zh/agent-sdk/python#settingsource)。

**检查工作目录**：SDK 会从 `cwd` 选项指定的目录以及直至仓库根目录的每一个父目录中的 `.claude/skills/` 文件夹加载技能。请确保 `cwd` 指向包含 `.claude/skills/` 的目录或其子目录，且位于同一仓库内：

  ```python Python
  # Ensure your cwd points to the directory containing .claude/skills/
  options = ClaudeAgentOptions(
      cwd="/path/to/project",  # .claude/skills/ here or in a parent directory
      setting_sources=["user", "project"],  # Loads skills from these sources
      skills="all",
  )
  ```

  ```typescript TypeScript
  // Ensure your cwd points to the directory containing .claude/skills/
  const options = {
    cwd: "/path/to/project", // .claude/skills/ here or in a parent directory
    settingSources: ["user", "project"], // Loads skills from these sources
    skills: "all"
  };
  ```

请参阅上方的"使用技能与SDK"章节，了解完整模式。

**验证文件系统位置**：
```bash
# Check project Skills
ls .claude/skills/*/SKILL.md

# Check personal Skills
ls ~/.claude/skills/*/SKILL.md
```
### 技能未被使用

**检查 `skills` 选项**：如果你传入了 `skills` 列表，请确认该技能的名称已包含在内。传入 `[]` 将禁用所有技能。

**检查描述**：确保描述具体且包含相关关键词。关于如何撰写有效描述，请参见 [Agent 技能最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#writing-effective-descriptions)。

### 其他故障排查

关于技能的一般故障排查（YAML 语法、调试等），请参见 [Claude Code 技能故障排查部分](/zh/skills#troubleshooting)。

## 相关文档

### 技能指南

* [Claude Code 中的 Agent 技能](/zh/skills)：完整的技能指南，包含创建、示例和故障排查
* [Agent 技能概述](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)：概念性概述、优势与架构
* [Agent 技能最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)：编写高效技能的指南
* [Agent 技能示例手册](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction)：示例技能和模板

### SDK 资源

* [SDK 中的子代理](/zh/agent-sdk/subagents)：类似的基于文件系统的代理，提供编程选项
* [SDK 中的斜杠命令](/zh/agent-sdk/slash-commands)：用户调用的命令
* [SDK 概述](/zh/agent-sdk/overview)：通用 SDK 概念
* [TypeScript SDK 参考](/zh/agent-sdk/typescript)：完整的 API 文档
* [Python SDK 参考](/zh/agent-sdk/python)：完整的 API 文档