> ## 文档索引
> 在 https://code.claude.com/docs/llms.txt 获取完整文档索引
> 使用此文件发现所有可用页面，再进一步探索。

# 快速入门

> 使用 Python 或 TypeScript 的 Agent SDK 构建自主工作的 AI 代理

使用 Agent SDK 构建一个 AI 代理，它可以读取你的代码、查找并修复错误，全程无需人工干预。

**你将要做的事情：**

1. 使用 Agent SDK 设置项目
2. 创建一个包含错误代码的文件
3. 运行一个能自动查找并修复错误的代理

## 先决条件

* **Node.js 18+** 或 **Python 3.10+**
* 一个 **Anthropic 账户** ([在此注册](https://platform.claude.com/))

## 设置


    为此快速入门创建一个新目录：
    ```bash
    mkdir my-agent
    cd my-agent
    ```
    对于你自己的项目，你可以在任何文件夹中运行 SDK；默认情况下，它能够访问该目录及其子目录中的文件。



    为你的编程语言安装 Agent SDK 包：


        ```bash
        npm install @anthropic-ai/claude-agent-sdk
        ```



        [uv](https://docs.astral.sh/uv/) 是一个快速 Python 包管理器，可自动处理虚拟环境：
        ```bash
        uv init
        uv add claude-agent-sdk
        ```



        创建并激活一个虚拟环境，然后安装该软件包。

        在 macOS 或 Linux 上：
        ```bash
        python3 -m venv .venv
        source .venv/bin/activate
        pip install claude-agent-sdk
        ```
        在Windows上：
        ```powershell
        py -m venv .venv
        .venv\Scripts\Activate.ps1
        pip install claude-agent-sdk
        ```
        如果 PowerShell 因执行策略错误阻止了 `Activate.ps1`，请先运行 `Set-ExecutionPolicy -Scope Process RemoteSigned`。




      TypeScript SDK 捆绑了适用于您平台的原生 Claude Code 二进制文件作为可选依赖项，因此您无需单独安装 Claude Code。




    从 [Claude 控制台](https://platform.claude.com/) 获取一个 API 密钥，然后在你的项目目录中创建一个 `.env` 文件：
    ```bash
    ANTHROPIC_API_KEY=your-api-key
    ```
    该 SDK 还支持通过第三方 API 提供商进行身份验证：

    * **Amazon Bedrock**：设置环境变量 `CLAUDE_CODE_USE_BEDROCK=1` 并配置 AWS 凭据
    * **Claude Platform on AWS**：设置 `CLAUDE_CODE_USE_ANTHROPIC_AWS=1` 和 `ANTHROPIC_AWS_WORKSPACE_ID`，然后配置 AWS 凭据
    * **Google Vertex AI**：设置环境变量 `CLAUDE_CODE_USE_VERTEX=1` 并配置 Google Cloud 凭据
    * **Microsoft Azure**：设置环境变量 `CLAUDE_CODE_USE_FOUNDRY=1` 并配置 Azure 凭据

    详情请参阅 [Bedrock](/zh/amazon-bedrock)、[Claude Platform on AWS](/zh/claude-platform-on-aws)、[Vertex AI](/zh/google-vertex-ai) 或 [Azure AI Foundry](/zh/microsoft-foundry) 的配置指南。

      除非事先获得批准，Anthropic 不允许第三方开发者为其产品提供 claude.ai 登录或速率限制，包括基于 Claude Agent SDK 构建的代理。请使用本文档中描述的 API key 认证方法。



## 创建包含错误的文件

这份快速入门指南将引导你构建一个能够发现并修复代码中 bug 的 agent。首先，你需要一个包含故意错误的文件供 agent 修复。在 `my-agent` 目录下创建 `utils.py` 文件，并粘贴以下代码：
```python
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)


def get_user_name(user):
    return user["name"].upper()
```
这段代码有两个 bug：

1. `calculate_average([])` 会因除零错误而崩溃
2. `get_user_name(None)` 会因 TypeError 而崩溃

## 构建一个能发现和修复 bug 的代理

如果你使用 Python SDK，请创建 `agent.py`；如果使用 TypeScript，请创建 `agent.ts`：

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage


  async def main():
      # Agentic loop: streams messages as Claude works
      async for message in query(
          prompt="Review utils.py for bugs that would cause crashes. Fix any issues you find.",
          options=ClaudeAgentOptions(
              allowed_tools=["Read", "Edit", "Glob"],  # Auto-approve these tools
              permission_mode="acceptEdits",  # Auto-approve file edits
          ),
      ):
          # Print human-readable output
          if isinstance(message, AssistantMessage):
              for block in message.content:
                  if hasattr(block, "text"):
                      print(block.text)  # Claude's reasoning
                  elif hasattr(block, "name"):
                      print(f"Tool: {block.name}")  # Tool being called
          elif isinstance(message, ResultMessage):
              print(f"Done: {message.subtype}")  # Final result


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Agentic loop: streams messages as Claude works
  for await (const message of query({
    prompt: "Review utils.py for bugs that would cause crashes. Fix any issues you find.",
    options: {
      allowedTools: ["Read", "Edit", "Glob"], // Auto-approve these tools
      permissionMode: "acceptEdits" // Auto-approve file edits
    }
  })) {
    // Print human-readable output
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text); // Claude's reasoning
        } else if ("name" in block) {
          console.log(`Tool: ${block.name}`); // Tool being called
        }
      }
    } else if (message.type === "result") {
      console.log(`Done: ${message.subtype}`); // Final result
    }
  }
  ```

这段代码主要包含三个部分：

1. **`query`**：这是创建智能体循环的主入口点。它返回一个异步迭代器，因此你可以使用 `async for` 在 Claude 工作时流式获取消息。完整的 API 请参阅 [Python](/zh/agent-sdk/python#query) 或 [TypeScript](/zh/agent-sdk/typescript#query) 的 SDK 参考文档。

2. **`prompt`**：这是你希望 Claude 执行的任务。Claude 会根据任务内容自行判断需要使用哪些工具。

3. **`options`**：这是智能体的配置项。本例使用 `allowedTools` 预先批准了 `Read`、`Edit` 和 `Glob` 工具，并设置 `permissionMode: "acceptEdits"` 以自动批准文件更改。其他选项包括 `systemPrompt`、`mcpServers` 等。更多选项请查阅 [Python](/zh/agent-sdk/python#claudeagentoptions) 或 [TypeScript](/zh/agent-sdk/typescript#options) 的文档。

`async for` 循环会在 Claude 思考、调用工具、观察结果并决定下一步行动时持续运行。每次迭代都会产生一条消息：可能是 Claude 的推理过程、一次工具调用、一个工具结果或最终输出。SDK 负责处理编排工作（工具执行、上下文管理、重试机制），你只需消费流式数据。当 Claude 完成任务或遇到错误时，循环便会结束。

循环内部的消息处理会筛选出人类可读的输出。若不进行过滤，你会看到原始消息对象，包括系统初始化信息和内部状态——这对调试很有用，但在其他情况下则显得冗余。

  此示例使用流式功能实时显示进度。如果您不需要实时输出（例如用于后台任务或CI流水线），可以一次性收集所有消息。详情请参阅[流式模式与单次模式](/zh/agent-sdk/streaming-vs-single-mode)。

### 运行您的代理

您的代理已准备就绪。请使用以下命令运行它：


    ```bash
    python3 agent.py
    ```



    ```bash
    npx tsx agent.ts
    ```


运行后，检查 `utils.py`，你会看到处理空列表和空用户的防御性代码。你的代理自主完成了以下操作：

1. **读取** `utils.py` 以理解代码
2. **分析** 逻辑并识别会导致崩溃的边界情况
3. **编辑** 文件以添加适当的错误处理

这正是 Agent SDK 的独特之处：Claude 直接执行工具，而不是要求你来实现它们。

  如果看到"找不到API密钥"提示，请确认您已在 `.env` 文件或 shell 环境中设置了 `ANTHROPIC_API_KEY` 环境变量。更多帮助请参阅[完整故障排除指南](/zh/troubleshooting)。

### 尝试其他提示词

现在您的代理已经设置完成，可以尝试一些不同的提示词：

* `"Add docstrings to all functions in utils.py"`
* `"Add type hints to all functions in utils.py"`
* `"Create a README.md documenting the functions in utils.py"`

### 自定义代理

您可以通过更改选项来修改代理的行为。以下是一些示例：

**添加网络搜索功能：**

  ```python Python
  options = ClaudeAgentOptions(
      allowed_tools=["Read", "Edit", "Glob", "WebSearch"], permission_mode="acceptEdits"
  )
  ```

  ```typescript TypeScript hidelines={1,-1}
  const _ = {
    options: {
      allowedTools: ["Read", "Edit", "Glob", "WebSearch"],
      permissionMode: "acceptEdits"
    }
  };
  ```

**为Claude提供自定义系统提示词：**

  ```python Python
  options = ClaudeAgentOptions(
      allowed_tools=["Read", "Edit", "Glob"],
      permission_mode="acceptEdits",
      system_prompt="You are a senior Python developer. Always follow PEP 8 style guidelines.",
  )
  ```

  ```typescript TypeScript hidelines={1,-1}
  const _ = {
    options: {
      allowedTools: ["Read", "Edit", "Glob"],
      permissionMode: "acceptEdits",
      systemPrompt: "You are a senior Python developer. Always follow PEP 8 style guidelines."
    }
  };
  ```

**在终端中运行命令：**

  ```python Python
  options = ClaudeAgentOptions(
      allowed_tools=["Read", "Edit", "Glob", "Bash"], permission_mode="acceptEdits"
  )
  ```

  ```typescript TypeScript hidelines={1,-1}
  const _ = {
    options: {
      allowedTools: ["Read", "Edit", "Glob", "Bash"],
      permissionMode: "acceptEdits"
    }
  };
  ```

在启用 `Bash` 后，可以尝试：`"为 utils.py 编写单元测试，运行它们，并修复所有失败"`

## 核心概念

**工具** 控制了你的代理能够执行的操作：

| 工具                                   | 代理能做什么       |
| -------------------------------------- | ------------------ |
| `Read`、`Glob`、`Grep`                 | 只读分析           |
| `Read`、`Edit`、`Glob`                 | 分析并修改代码     |
| `Read`、`Edit`、`Bash`、`Glob`、`Grep` | 完全自动化         |

**权限模式** 控制你希望的人工监督程度：

| 模式                     | 行为                                                                      | 使用场景                               |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------- |
| `acceptEdits`            | 自动批准文件编辑和常见的文件系统命令，其他操作会询问                      | 可信的开发工作流                       |
| `dontAsk`                | 拒绝任何不在 `allowedTools` 中的操作                                      | 封闭的无人值守代理                     |
| `auto` (仅限 TypeScript) | 由模型分类器批准或拒绝每个工具调用                                        | 带安全防护的自主代理                   |
| `bypassPermissions`      | 运行每个工具时都不会提示                                                  | 沙箱化的 CI、完全受信环境              |
| `default`                | 需要一个 `canUseTool` 回调来处理批准                                       | 自定义批准流程                         |

上面的例子使用 `acceptEdits` 模式，该模式会自动批准文件操作，因此代理可以在没有交互提示的情况下运行。如果你想在批准前提示用户，请使用 `default` 模式并提供一个收集用户输入的 [`canUseTool` 回调](/zh/agent-sdk/user-input)。如需更细粒度的控制，请参阅[权限](/zh/agent-sdk/permissions)。

## 故障排除

### API 错误 `thinking.type.enabled` 不被此模型支持

Claude Opus 4.7 用 `thinking.type.adaptive` 取代了 `thinking.type.enabled`。当您选择 `claude-opus-4-7` 时，较旧版本的 Agent SDK 会因以下 API 错误而失败：
```text
API Error: 400 {"type":"invalid_request_error","message":"\"thinking.type.enabled\" is not supported for this model. Use \"thinking.type.adaptive\" and \"output_config.effort\" to control thinking behavior."}
```
升级至 Agent SDK v0.2.111 或更高版本以使用 Opus 4.7。

## 后续步骤

既然您已创建首个代理，接下来可了解如何扩展其功能并适配您的具体用例：

* **[权限](/zh/agent-sdk/permissions)**：控制代理的操作范围及需要审批的时机
* **[钩子](/zh/agent-sdk/hooks)**：在工具调用前后执行自定义代码
* **[会话](/zh/agent-sdk/sessions)**：构建保持上下文的多轮会话代理
* **[MCP 服务器](/zh/agent-sdk/mcp)**：连接数据库、浏览器、API 及其他外部系统
* **[托管](/zh/agent-sdk/hosting)**：将代理部署至 Docker、云平台和 CI/CD 环境
* **[示例代理](https://github.com/anthropics/claude-agent-sdk-demos)**：查看完整示例：邮件助手、研究代理等