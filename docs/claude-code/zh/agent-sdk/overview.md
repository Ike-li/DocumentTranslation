> ## 文档索引
> 请查阅完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# Agent SDK 概述

> 使用 Claude Code 库构建生产级 AI 智能体

  自2026年6月15日起，订阅方案中使用Agent SDK和`claude -p`将从新的每月Agent SDK额度中扣除，该额度独立于您的交互使用限额。详见[将Claude Agent SDK与您的Claude计划配合使用](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)。

构建能够自主读取文件、运行命令、搜索网页、编辑代码等的 AI 代理。Agent SDK 为您提供了与 Claude Code 相同的工具、代理循环和上下文管理能力，并支持使用 Python 和 TypeScript 进行编程。

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions


  async def main():
      async for message in query(
          prompt="Find and fix the bug in auth.py",
          options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
      ):
          print(message)  # Claude reads the file, finds the bug, edits it


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Find and fix the bug in auth.ts",
    options: { allowedTools: ["Read", "Edit", "Bash"] }
  })) {
    console.log(message); // Claude reads the file, finds the bug, edits it
  }
  ```

Agent SDK 包含内置工具用于读取文件、运行命令和编辑代码，因此您的代理可以立即开始工作，无需您实现工具执行。深入了解快速入门或探索使用该 SDK 构建的真实代理：


    # 几分钟内构建一个修复错误的智能体



    电子邮件助手、研究代理等


## 开始使用




        ```bash
        npm install @anthropic-ai/claude-agent-sdk
        ```



        ```bash
        pip install claude-agent-sdk
        ```
        该 Python 包需要 Python 3.10 或更高版本。如果 pip 报告 `No matching distribution found for claude-agent-sdk`，说明你的解释器版本低于 3.10。请在 macOS 或 Linux 上运行 `python3 --version`，或在 Windows 上运行 `py --version` 进行检查。




      TypeScript SDK 捆绑了适用于您平台的原生 Claude Code 二进制文件作为可选依赖项，因此您无需单独安装 Claude Code。




    从[控制台](https://platform.claude.com/)获取一个 API 密钥，然后将其设置为环境变量：
    ```bash
    export ANTHROPIC_API_KEY=your-api-key
    ```
    该 SDK 还支持通过第三方 API 提供商进行身份验证：

    * **Amazon Bedrock**：设置环境变量 `CLAUDE_CODE_USE_BEDROCK=1` 并配置 AWS 凭据
    * **Claude Platform on AWS**：设置 `CLAUDE_CODE_USE_ANTHROPIC_AWS=1` 和 `ANTHROPIC_AWS_WORKSPACE_ID`，然后配置 AWS 凭据
    * **Google Vertex AI**：设置环境变量 `CLAUDE_CODE_USE_VERTEX=1` 并配置 Google Cloud 凭据
    * **Microsoft Azure**：设置环境变量 `CLAUDE_CODE_USE_FOUNDRY=1` 并配置 Azure 凭据

    详情请参阅 [Bedrock](/zh/amazon-bedrock)、[Claude Platform on AWS](/zh/claude-platform-on-aws)、[Vertex AI](/zh/google-vertex-ai) 或 [Azure AI Foundry](/zh/microsoft-foundry) 的配置指南。

      除非事先获得批准，Anthropic 不允许第三方开发者为其产品提供 claude.ai 登录或速率限制，包括基于 Claude Agent SDK 构建的代理。请使用本文档中描述的 API key 认证方法。




    此示例创建了一个使用内置工具列出当前目录文件的代理。

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions


      async def main():
          async for message in query(
              prompt="What files are in this directory?",
              options=ClaudeAgentOptions(allowed_tools=["Bash", "Glob"]),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      for await (const message of query({
        prompt: "What files are in this directory?",
        options: { allowedTools: ["Bash", "Glob"] }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```



**准备好开始构建？** 请参阅[快速入门](/zh/agent-sdk/quickstart)，创建一个能在几分钟内查找并修复错误的代理。

## 功能

使 Claude Code 强大的所有功能都可在 SDK 中使用：


    您的代理可开箱即用地读取文件、运行命令和搜索代码库。关键工具包括：

    | 工具                                                                        | 功能描述                                                            |
    | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
    | **Read**                                                                    | 读取工作目录中的任何文件                                            |
    | **Write**                                                                   | 创建新文件                                                          |
    | **Edit**                                                                    | 对现有文件进行精确编辑                                              |
    | **Bash**                                                                    | 运行终端命令、脚本和 git 操作                                       |
    | **Monitor**                                                                 | 监视后台脚本，并对每一行输出作为事件做出反应                        |
    | **Glob**                                                                    | 按模式查找文件（`**/*.ts`、`src/**/*.py`）                           |
    | **Grep**                                                                    | 使用正则表达式搜索文件内容                                          |
    | **WebSearch**                                                               | 在网络上搜索最新信息                                                |
    | **WebFetch**                                                                | 获取并解析网页内容                                                  |
    | **[AskUserQuestion](/zh/agent-sdk/user-input#handle-clarifying-questions)** | 使用多选项向用户提出澄清性问题                                      |

    此示例创建了一个代理，用于在您的代码库中搜索 TODO 注释：

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions


      async def main():
          async for message in query(
              prompt="Find all TODO comments and create a summary",
              options=ClaudeAgentOptions(allowed_tools=["Read", "Glob", "Grep"]),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      for await (const message of query({
        prompt: "Find all TODO comments and create a summary",
        options: { allowedTools: ["Read", "Glob", "Grep"] }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```




    在代理生命周期的关键节点运行自定义代码。SDK 钩子使用回调函数来验证、记录、阻止或转换代理行为。

    **可用钩子：** `PreToolUse`、`PostToolUse`、`Stop`、`SessionStart`、`SessionEnd`、`UserPromptSubmit` 等。

    此示例将所有文件变更记录到审计文件中：

      ```python Python
      import asyncio
      from datetime import datetime
      from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher


      async def log_file_change(input_data, tool_use_id, context):
          file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
          with open("./audit.log", "a") as f:
              f.write(f"{datetime.now()}: modified {file_path}\n")
          return {}


      async def main():
          async for message in query(
              prompt="Refactor utils.py to improve readability",
              options=ClaudeAgentOptions(
                  permission_mode="acceptEdits",
                  hooks={
                      "PostToolUse": [
                          HookMatcher(matcher="Edit|Write", hooks=[log_file_change])
                      ]
                  },
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query, HookCallback } from "@anthropic-ai/claude-agent-sdk";
      import { appendFile } from "fs/promises";

      const logFileChange: HookCallback = async (input) => {
        const filePath = (input as any).tool_input?.file_path ?? "unknown";
        await appendFile("./audit.log", `${new Date().toISOString()}: modified ${filePath}\n`);
        return {};
      };

      for await (const message of query({
        prompt: "Refactor utils.py to improve readability",
        options: {
          permissionMode: "acceptEdits",
          hooks: {
            PostToolUse: [{ matcher: "Edit|Write", hooks: [logFileChange] }]
          }
        }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```

    [了解更多关于钩子 →](/zh/agent-sdk/hooks)



    创建专门代理来处理聚焦子任务。你的主代理负责分配工作，子代理则上报结果。

    定义带有专门指令的自定义代理。子代理通过 Agent 工具调用，因此需在 `allowedTools` 中包含 `Agent` 以自动批准这些调用：

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


      async def main():
          async for message in query(
              prompt="Use the code-reviewer agent to review this codebase",
              options=ClaudeAgentOptions(
                  allowed_tools=["Read", "Glob", "Grep", "Agent"],
                  agents={
                      "code-reviewer": AgentDefinition(
                          description="Expert code reviewer for quality and security reviews.",
                          prompt="Analyze code quality and suggest improvements.",
                          tools=["Read", "Glob", "Grep"],
                      )
                  },
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      for await (const message of query({
        prompt: "Use the code-reviewer agent to review this codebase",
        options: {
          allowedTools: ["Read", "Glob", "Grep", "Agent"],
          agents: {
            "code-reviewer": {
              description: "Expert code reviewer for quality and security reviews.",
              prompt: "Analyze code quality and suggest improvements.",
              tools: ["Read", "Glob", "Grep"]
            }
          }
        }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```

    来自子代理上下文内的消息包含一个 `parent_tool_use_id` 字段，让您能够追踪哪些消息属于哪个子代理执行过程。

    [了解更多关于子代理 →](/zh/agent-sdk/subagents)



    通过模型上下文协议连接外部系统：数据库、浏览器、API 以及[更多系统](https://github.com/modelcontextprotocol/servers)。

    此示例连接了 [Playwright MCP 服务器](https://github.com/microsoft/playwright-mcp)，为您的代理提供浏览器自动化能力：

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions


      async def main():
          async for message in query(
              prompt="Open example.com and describe what you see",
              options=ClaudeAgentOptions(
                  mcp_servers={
                      "playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}
                  }
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      for await (const message of query({
        prompt: "Open example.com and describe what you see",
        options: {
          mcpServers: {
            playwright: { command: "npx", args: ["@playwright/mcp@latest"] }
          }
        }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```

    [了解更多关于MCP →](/zh/agent-sdk/mcp)



    精确控制您的代理可以使用哪些工具。允许安全操作，阻止危险操作，或要求对敏感操作进行审批。

      对于交互式审批提示词和 `AskUserQuestion` 工具，请参阅 [处理审批和用户输入](/zh/agent-sdk/user-input)。

    此示例创建了一个只读代理，可以分析代码但不能修改。`allowed_tools` 预先批准了 `Read`、`Glob` 和 `Grep`。

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions


      async def main():
          async for message in query(
              prompt="Review this code for best practices",
              options=ClaudeAgentOptions(
                  allowed_tools=["Read", "Glob", "Grep"],
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      for await (const message of query({
        prompt: "Review this code for best practices",
        options: {
          allowedTools: ["Read", "Glob", "Grep"]
        }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```

    [了解更多关于权限 →](/zh/agent-sdk/permissions)



    在多个交流中保持上下文。Claude 会记住已读取的文件、已完成的分析以及对话历史。您可以稍后恢复会话，或创建分支以探索不同的方法。

    此示例从第一个查询中捕获会话 ID，然后恢复会话以保持完整的上下文：

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage, ResultMessage


      async def main():
          session_id = None

          # First query: capture the session ID
          async for message in query(
              prompt="Read the authentication module",
              options=ClaudeAgentOptions(allowed_tools=["Read", "Glob"]),
          ):
              if isinstance(message, SystemMessage) and message.subtype == "init":
                  session_id = message.data["session_id"]

          # Resume with full context from the first query
          async for message in query(
              prompt="Now find all places that call it",  # "it" = auth module
              options=ClaudeAgentOptions(resume=session_id),
          ):
              if isinstance(message, ResultMessage):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      let sessionId: string | undefined;

      // First query: capture the session ID
      for await (const message of query({
        prompt: "Read the authentication module",
        options: { allowedTools: ["Read", "Glob"] }
      })) {
        if (message.type === "system" && message.subtype === "init") {
          sessionId = message.session_id;
        }
      }

      // Resume with full context from the first query
      for await (const message of query({
        prompt: "Now find all places that call it", // "it" = auth module
        options: { resume: sessionId }
      })) {
        if ("result" in message) console.log(message.result);
      }
      ```

    [了解更多关于会话的内容 →](/zh/agent-sdk/sessions)


### Claude Code 功能特性

该 SDK 同样支持 Claude Code 基于文件系统的配置。默认情况下，SDK 会从您工作目录下的 `.claude/` 以及 `~/.claude/` 加载这些配置。若需限制加载的来源，可在选项中设置 `setting_sources`（Python）或 `settingSources`（TypeScript）。

| 功能特性                                         | 描述                                                                          | 位置                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------- |
| [技能](/zh/agent-sdk/skills)                     | Claude 自动使用或您通过 `/name` 调用的专门能力                                | `.claude/skills/*/SKILL.md`        |
| [斜杠命令](/zh/agent-sdk/slash-commands)         | 旧版格式中的自定义命令。新的自定义命令请使用技能                              | `.claude/commands/*.md`            |
| [记忆](/zh/agent-sdk/modifying-system-prompts)   | 项目上下文与指令                                                              | `CLAUDE.md` 或 `.claude/CLAUDE.md` |
| [插件](/zh/agent-sdk/plugins)                    | 通过技能、代理、钩子和 MCP 服务器进行扩展                                     | 通过编程方式使用 `plugins` 选项    |

## 对比 Agent SDK 与其他 Claude 工具

Claude 平台提供了多种方式来基于 Claude 进行构建。以下是 Agent SDK 的定位说明：


    [Anthropic Client SDK](https://platform.claude.com/docs/en/api/client-sdks) 为您提供直接 API 访问：您发送提示词并自行实现工具执行。而 **Agent SDK** 则为您提供了内置工具执行功能的 Claude。

    使用 Client SDK 时，您需要实现工具循环。使用 Agent SDK 时，Claude 会处理这一过程：

      ```python Python
      # Client SDK: You implement the tool loop
      response = client.messages.create(...)
      while response.stop_reason == "tool_use":
          result = your_tool_executor(response.tool_use)
          response = client.messages.create(tool_result=result, **params)

      # Agent SDK: Claude handles tools autonomously
      async for message in query(prompt="Fix the bug in auth.py"):
          print(message)
      ```

      ```typescript TypeScript
      // Client SDK: You implement the tool loop
      let response = await client.messages.create({ ...params });
      while (response.stop_reason === "tool_use") {
        const result = yourToolExecutor(response.tool_use);
        response = await client.messages.create({ tool_result: result, ...params });
      }

      // Agent SDK: Claude handles tools autonomously
      for await (const message of query({ prompt: "Fix the bug in auth.ts" })) {
        console.log(message);
      }
      ```




    功能相同，界面各异：

    | 使用场景               | 最佳选择 |
    | ---------------------- | -------- |
    | 交互式开发             | CLI      |
    | CI/CD 流程             | SDK      |
    | 自定义应用             | SDK      |
    | 一次性任务             | CLI      |
    | 生产环境自动化         | SDK      |

    许多团队两者兼用：日常开发使用 CLI，生产环境使用 SDK。工作流程可在两者间直接切换。



    [托管代理](https://platform.claude.com/docs/en/managed-agents/overview) 是一个托管的 REST API：由 Anthropic 运行代理和沙箱，您的应用程序发送事件并流式回传结果。**Agent SDK** 是一个库，可在您自己的进程内运行代理循环。

    |                    | Agent SDK                                                                    | 托管代理                                                                                                |
    | ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
    | **运行位置**        | 您的进程，您的基础设施                                            | Anthropic 托管的基础设施                                                                              |
    | **接口**      | Python 或 TypeScript 库                                                 | REST API                                                                                                      |
    | **代理操作对象** | 您基础设施上的文件                                                 | 每个会话一个托管沙箱                                                                                 |
    | **会话状态**  | 您文件系统上的 JSONL                                                     | Anthropic 托管的事件日志                                                                                    |
    | **自定义工具**   | 进程内 Python 或 TypeScript 函数                                    | Claude 触发工具；您执行并返回结果                                                      |
    | **最适合**       | 本地原型开发、直接在您的文件系统和服务上工作的代理 | 无需运维沙箱或会话基础设施的生产环境代理、长时间运行和异步会话 |

    常见路径是在本地使用 Agent SDK 进行原型开发，然后迁移到托管代理用于生产环境。


## 更新日志

查看完整的更新日志以获取 SDK 更新、错误修复和新功能：

* **TypeScript SDK**：[查看 CHANGELOG.md](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
* **Python SDK**：[查看 CHANGELOG.md](https://github.com/anthropics/claude-agent-sdk-python/blob/main/CHANGELOG.md)

## 报告错误

如果您在使用 Agent SDK 时遇到错误或问题：

* **TypeScript SDK**：[在 GitHub 上报告问题](https://github.com/anthropics/claude-agent-sdk-typescript/issues)
* **Python SDK**：[在 GitHub 上报告问题](https://github.com/anthropics/claude-agent-sdk-python/issues)

## 品牌使用指南

对于集成 Claude Agent SDK 的合作伙伴，使用 Claude 品牌标识是可选的。在您的产品中提及 Claude 时：

**允许：**

* "Claude Agent"（推荐用于下拉菜单）
* "Claude"（当菜单已标记为"代理"时）
* "{您的代理名称} Powered by Claude"（如果您已有代理名称）

**不允许：**

* "Claude Code" 或 "Claude Code Agent"
* 模仿 Claude Code 的 Claude Code 品牌 ASCII 艺术或视觉元素

您的产品应保持自身的品牌标识，不应看起来像 Claude Code 或任何 Anthropic 产品。有关品牌合规性的问题，请联系 Anthropic [销售团队](https://www.anthropic.com/contact-sales)。

## 许可条款

Claude Agent SDK 的使用受 [Anthropic 商业服务条款](https://www.anthropic.com/legal/commercial-terms) 管辖，包括当您使用它来驱动您提供给自己客户和最终用户的产品和服务时，除非某个特定组件或依赖项受该组件 LICENSE 文件中注明的不同许可约束。

## 后续步骤


    构建一个能在几分钟内发现并修复错误的智能代理



    电子邮件助手、研究代理等



    完整TypeScript API参考文档及示例



    完整的 Python API 参考与示例


