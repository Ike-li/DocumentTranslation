> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面后再进行深入查阅。

# 处理审批与用户输入

> 将Claude的审批请求和澄清问题呈现给用户，然后将用户的决定返回给SDK。

在处理任务时，Claude有时需要与用户确认。它可能在删除文件前需要获得许可，或者需要询问新项目应使用哪个数据库。您的应用程序需要将这些请求呈现给用户，以便Claude能够根据用户的输入继续操作。

Claude在两种情况下会请求用户输入：当它需要**使用工具的权限**时（例如删除文件或运行命令），以及当它有**澄清问题**时（通过`AskUserQuestion`工具）。这两种情况都会触发您的`canUseTool`回调函数，该函数会暂停执行直到您返回响应。这与普通的对话轮次不同，后者是Claude完成操作并等待您的下一条消息。

对于澄清问题，Claude会生成问题和选项。您的角色是将其呈现给用户并返回用户的选择。您不能在此流程中添加自己的问题；如果您需要自行询问用户一些事情，请在应用程序逻辑中单独进行。

回调函数可以无限期地保持挂起状态。执行将保持暂停，直到您的回调返回，SDK只有在查询本身被取消时才会取消等待。如果用户可能需要较长时间才能响应，而您的进程无法合理地保持运行状态，请返回[`defer`钩子决定](/zh/hooks#defer-a-tool-call-for-later)，这允许进程退出并稍后从持久化的会话中恢复。

本指南向您展示了如何检测每种类型的请求并做出适当响应。

## 检测Claude何时需要输入

在查询选项中传入一个`canUseTool`回调函数。每当Claude需要用户输入时，该回调函数就会触发，接收工具名称和输入作为参数：

  ```python Python
  async def handle_tool_request(tool_name, input_data, context):
      # Prompt user and return allow or deny
      ...


  options = ClaudeAgentOptions(can_use_tool=handle_tool_request)
  ```

  ```typescript TypeScript
  async function handleToolRequest(toolName, input, options) {
    // options includes { signal: AbortSignal, suggestions?: PermissionUpdate[] }
    // Prompt user and return allow or deny
  }

  const options = { canUseTool: handleToolRequest };
  ```

该回调在以下两种情况下触发：

1. **工具需要批准**：Claude 想要使用未通过[权限规则](/zh/agent-sdk/permissions)或模式自动批准的工具。请检查 `tool_name` 字段以确定具体工具（例如 `"Bash"`、`"Write"`）。
2. **Claude 提出问题**：Claude 调用了 `AskUserQuestion` 工具。通过检查 `tool_name == "AskUserQuestion"` 可进行差异化处理。若指定了 `tools` 数组，需包含 `AskUserQuestion` 才能使此功能生效。详见[处理澄清问题](#处理澄清问题)部分。

  若要自动批准或拒绝工具使用而不提示用户，请改用[钩子](/zh/agent-sdk/hooks)。钩子会在 `canUseTool` 之前执行，并可基于您自定义的逻辑批准、拒绝或修改请求。您还可以使用 [`PermissionRequest` 钩子](/zh/agent-sdk/hooks#available-hooks) 在 Claude 等待审批时发送外部通知（如 Slack、邮件或推送消息）。

## 处理工具审批请求

当您在查询选项中传入 `canUseTool` 回调后，该回调会在Claude希望使用未经自动批准的工具时触发。您的回调将接收三个参数：

| 参数                               | 描述                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolName`                         | Claude希望使用的工具名称（例如 `"Bash"`、`"Write"`、`"Edit"`）                                                                                                                                                                                                                                                                  |
| `input`                            | Claude传递给工具的参数。内容因工具而异。                                                                                                                                                                                                                                                                                        |
| `options`（TS）/ `context`（Python） | 额外上下文，包含可选的 `suggestions`（为避免重复提示而提出的 `PermissionUpdate` 条目）和取消信号。在TypeScript中，`signal` 是 `AbortSignal`；在Python中，signal字段保留供将来使用。详情请参阅Python的 [`ToolPermissionContext`](/zh/agent-sdk/python#toolpermissioncontext)。 |

`input` 对象包含工具特定的参数。常见示例：

| 工具     | 输入字段                               |
| -------- | -------------------------------------- |
| `Bash`   | `command`、`description`、`timeout`    |
| `Write`  | `file_path`、`content`                 |
| `Edit`   | `file_path`、`old_string`、`new_string` |
| `Read`   | `file_path`、`offset`、`limit`         |

完整的输入模式请参阅SDK参考文档：[Python](/zh/agent-sdk/python#tool-input%2Foutput-types) | [TypeScript](/zh/agent-sdk/typescript#tool-input-types)。

您可以向用户显示此信息，以便他们决定是否允许或拒绝该操作，然后返回相应的响应。

以下示例要求Claude创建并删除一个测试文件。当Claude尝试执行每个操作时，回调会将工具请求打印到终端，并提示用户输入 y/n 进行审批。

  ```python Python
  import asyncio

  from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
  from claude_agent_sdk.types import (
      HookMatcher,
      PermissionResultAllow,
      PermissionResultDeny,
      ToolPermissionContext,
  )


  async def can_use_tool(
      tool_name: str, input_data: dict, context: ToolPermissionContext
  ) -> PermissionResultAllow | PermissionResultDeny:
      # Display the tool request
      print(f"\nTool: {tool_name}")
      if tool_name == "Bash":
          print(f"Command: {input_data.get('command')}")
          if input_data.get("description"):
              print(f"Description: {input_data.get('description')}")
      else:
          print(f"Input: {input_data}")

      # Get user approval
      response = input("Allow this action? (y/n): ")

      # Return allow or deny based on user's response
      if response.lower() == "y":
          # Allow: tool executes with the original (or modified) input
          return PermissionResultAllow(updated_input=input_data)
      else:
          # Deny: tool doesn't execute, Claude sees the message
          return PermissionResultDeny(message="User denied this action")


  # Required workaround: dummy hook keeps the stream open for can_use_tool
  async def dummy_hook(input_data, tool_use_id, context):
      return {"continue_": True}


  async def prompt_stream():
      yield {
          "type": "user",
          "message": {
              "role": "user",
              "content": "Create a test file in /tmp and then delete it",
          },
      }


  async def main():
      async for message in query(
          prompt=prompt_stream(),
          options=ClaudeAgentOptions(
              can_use_tool=can_use_tool,
              hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
          ),
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";
  import * as readline from "readline";

  // Helper to prompt user for input in the terminal
  function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) =>
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      })
    );
  }

  for await (const message of query({
    prompt: "Create a test file in /tmp and then delete it",
    options: {
      canUseTool: async (toolName, input) => {
        // Display the tool request
        console.log(`\nTool: ${toolName}`);
        if (toolName === "Bash") {
          console.log(`Command: ${input.command}`);
          if (input.description) console.log(`Description: ${input.description}`);
        } else {
          console.log(`Input: ${JSON.stringify(input, null, 2)}`);
        }

        // Get user approval
        const response = await prompt("Allow this action? (y/n): ");

        // Return allow or deny based on user's response
        if (response.toLowerCase() === "y") {
          // Allow: tool executes with the original (or modified) input
          return { behavior: "allow", updatedInput: input };
        } else {
          // Deny: tool doesn't execute, Claude sees the message
          return { behavior: "deny", message: "User denied this action" };
        }
      }
    }
  })) {
    if ("result" in message) console.log(message.result);
  }
  ```



  在 Python 中，`can_use_tool` 需要启用[流式模式](/zh/agent-sdk/streaming-vs-single-mode)并配合一个 `PreToolUse` 钩子，该钩子需返回 `{"continue_": True}` 以保持数据流处于开放状态。如果缺少该钩子，数据流会在权限回调被触发前关闭。

此示例使用 `y/n` 流程，其中除 `y` 以外的任何输入均视为拒绝。在实际应用中，您可以构建更丰富的界面，允许用户修改请求、提供反馈或完全重定向 Claude。有关所有响应方式，请参阅[响应工具请求](#响应工具请求)。

### 响应工具请求

您的回调函数返回以下两种响应类型之一：

| 响应    | Python                                     | TypeScript                            |
| ------- | ------------------------------------------ | ------------------------------------- |
| **允许** | `PermissionResultAllow(updated_input=...)` | `{ behavior: "allow", updatedInput }` |
| **拒绝** | `PermissionResultDeny(message=...)`        | `{ behavior: "deny", message }`       |

允许时，请传递工具输入（原始或修改后的版本）。拒绝时，请提供消息说明原因。Claude 会看到此消息并可能调整其处理方式。

  ```python Python
  from claude_agent_sdk.types import PermissionResultAllow, PermissionResultDeny

  # Allow the tool to execute
  return PermissionResultAllow(updated_input=input_data)

  # Block the tool
  return PermissionResultDeny(message="User rejected this action")
  ```

  ```typescript TypeScript
  // Allow the tool to execute
  return { behavior: "allow", updatedInput: input };

  // Block the tool
  return { behavior: "deny", message: "User rejected this action" };
  ```

除了允许或拒绝，你还可以修改工具的输入或提供有助于 Claude 调整其方法的上下文：

* **批准**：让工具按 Claude 请求执行
* **带修改批准**：执行前修改输入（例如：清理路径、添加约束）
* **批准并记住**：回传建议的权限规则，以便匹配的调用下次跳过提示
* **拒绝**：阻止工具并告知 Claude 原因
* **建议替代方案**：阻止但引导 Claude 转向用户所需的替代方案
* **完全重定向**：使用[流式输入](/zh/agent-sdk/streaming-vs-single-mode)向 Claude 发送全新的指令


    用户原样批准了该操作。将来自你回调函数的 `input` 原样传递，工具将完全按照 Claude 的请求执行。

      ```python Python
      async def can_use_tool(tool_name, input_data, context):
          print(f"Claude wants to use {tool_name}")
          approved = await ask_user("Allow this action?")

          if approved:
              return PermissionResultAllow(updated_input=input_data)
          return PermissionResultDeny(message="User declined")
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input) => {
        console.log(`Claude wants to use ${toolName}`);
        const approved = await askUser("Allow this action?");

        if (approved) {
          return { behavior: "allow", updatedInput: input };
        }
        return { behavior: "deny", message: "User declined" };
      };
      ```




    用户批准请求但希望先进行修改。你可以在工具执行前变更输入内容。Claude 会看到结果但不会被告知你做了修改。适用于清理参数、添加约束条件或限制访问范围。

      ```python Python
      async def can_use_tool(tool_name, input_data, context):
          if tool_name == "Bash":
              # User approved, but scope all commands to sandbox
              sandboxed_input = {**input_data}
              sandboxed_input["command"] = input_data["command"].replace(
                  "/tmp", "/tmp/sandbox"
              )
              return PermissionResultAllow(updated_input=sandboxed_input)
          return PermissionResultAllow(updated_input=input_data)
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input) => {
        if (toolName === "Bash") {
          // User approved, but scope all commands to sandbox
          const sandboxedInput = {
            ...input,
            command: input.command.replace("/tmp", "/tmp/sandbox")
          };
          return { behavior: "allow", updatedInput: sandboxedInput };
        }
        return { behavior: "allow", updatedInput: input };
      };
      ```




    用户批准且不希望再次被询问此类调用。第三个回调参数携带 `suggestions`，一个由现成的 [`PermissionUpdate`](/zh/agent-sdk/typescript#permissionupdate) 条目组成的数组。在 `updatedPermissions` 中回显一条以应用它。带有 `localSettings` 目标的建议会将规则写入 `.claude/settings.local.json`，以便未来的会话跳过对匹配调用的提示。

    Python 示例需要 `claude-agent-sdk` 0.1.80 或更高版本。

      ```python Python
      async def can_use_tool(tool_name, input_data, context):
          choice = await ask_user(f"Allow {tool_name}?", ["once", "always", "no"])

          if choice == "always":
              persist = [
                  s for s in context.suggestions if s.destination == "localSettings"
              ]
              return PermissionResultAllow(
                  updated_input=input_data, updated_permissions=persist
              )
          if choice == "once":
              return PermissionResultAllow(updated_input=input_data)
          return PermissionResultDeny(message="User declined")
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input, { suggestions = [] }) => {
        const choice = await askUser(`Allow ${toolName}?`, ["once", "always", "no"]);

        if (choice === "always") {
          const persist = suggestions.filter(
            (s) => s.destination === "localSettings"
          );
          return {
            behavior: "allow",
            updatedInput: input,
            updatedPermissions: persist
          };
        }
        if (choice === "once") {
          return { behavior: "allow", updatedInput: input };
        }
        return { behavior: "deny", message: "User declined" };
      };
      ```




    用户不希望执行此操作。阻止工具并提供解释原因的消息。Claude 看到此消息后可能会尝试不同的方法。

      ```python Python
      async def can_use_tool(tool_name, input_data, context):
          approved = await ask_user(f"Allow {tool_name}?")

          if not approved:
              return PermissionResultDeny(message="User rejected this action")
          return PermissionResultAllow(updated_input=input_data)
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input) => {
        const approved = await askUser(`Allow ${toolName}?`);

        if (!approved) {
          return {
            behavior: "deny",
            message: "User rejected this action"
          };
        }
        return { behavior: "allow", updatedInput: input };
      };
      ```




    用户不需要执行此特定操作，但有其他想法。请阻止该工具并在消息中包含指导说明。Claude 将阅读此内容并根据您的反馈决定如何继续。

      ```python Python
      async def can_use_tool(tool_name, input_data, context):
          if tool_name == "Bash" and "rm" in input_data.get("command", ""):
              # User doesn't want to delete, suggest archiving instead
              return PermissionResultDeny(
                  message="User doesn't want to delete files. They asked if you could compress them into an archive instead."
              )
          return PermissionResultAllow(updated_input=input_data)
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input) => {
        if (toolName === "Bash" && input.command.includes("rm")) {
          // User doesn't want to delete, suggest archiving instead
          return {
            behavior: "deny",
            message:
              "User doesn't want to delete files. They asked if you could compress them into an archive instead."
          };
        }
        return { behavior: "allow", updatedInput: input };
      };
      ```




    要完全改变方向（而非微调），请使用[流式输入](/zh/agent-sdk/streaming-vs-single-mode)直接向Claude发送新指令。这将绕过当前工具请求，并让Claude遵循全新的指令。


## 处理澄清问题

当Claude在执行任务时遇到多种可行方案且需要更多指引，它会调用 `AskUserQuestion` 工具。这会触发你的 `canUseTool` 回调，其中 `toolName` 设为 `AskUserQuestion`。输入内容包含Claude提出的问题（以多选题选项形式），你需要将这些选项展示给用户，并返回他们的选择。

  澄清问题在 [`plan` 模式](/zh/agent-sdk/permissions#plan-mode-plan) 中尤为常见，在该模式下 Claude 会先探索代码库并提出问题，然后才提出计划。这使得计划模式非常适合交互式工作流，让您可以在让 Claude 进行更改之前先收集需求。

以下步骤展示如何处理澄清问题：


    在查询选项中传入一个 `canUseTool` 回调。默认情况下，`AskUserQuestion` 是可用的。如果你指定 `tools` 数组来限制 Claude 的能力（例如，一个只包含 `Read`、`Glob` 和 `Grep` 的只读代理），请将 `AskUserQuestion` 包含在该数组中。否则，Claude 将无法提出澄清问题。

      ```python Python
      async for message in query(
          prompt="Analyze this codebase",
          options=ClaudeAgentOptions(
              # Include AskUserQuestion in your tools list
              tools=["Read", "Glob", "Grep", "AskUserQuestion"],
              can_use_tool=can_use_tool,
          ),
      ):
          print(message)
      ```

      ```typescript TypeScript
      for await (const message of query({
        prompt: "Analyze this codebase",
        options: {
          // Include AskUserQuestion in your tools list
          tools: ["Read", "Glob", "Grep", "AskUserQuestion"],
          canUseTool: async (toolName, input) => {
            // Handle clarifying questions here
          }
        }
      })) {
        console.log(message);
      }
      ```




    在你的回调中，检查 `toolName` 是否等于 `AskUserQuestion`，以便对其与其他工具进行特殊处理：

      ```python Python
      async def can_use_tool(tool_name: str, input_data: dict, context):
          if tool_name == "AskUserQuestion":
              # Your implementation to collect answers from the user
              return await handle_clarifying_questions(input_data)
          # Handle other tools normally
          return await prompt_for_approval(tool_name, input_data)
      ```

      ```typescript TypeScript
      canUseTool: async (toolName, input) => {
        if (toolName === "AskUserQuestion") {
          // Your implementation to collect answers from the user
          return handleClarifyingQuestions(input);
        }
        // Handle other tools normally
        return promptForApproval(toolName, input);
      };
      ```




    输入内容包含一个 `questions` 数组，其中是 Claude 的问题。每个问题包含 `question`（要显示的文本）、`options`（选项）和 `multiSelect`（是否允许多选）：
    ```json
    {
      "questions": [
        {
          "question": "How should I format the output?",
          "header": "Format",
          "options": [
            { "label": "Summary", "description": "Brief overview" },
            { "label": "Detailed", "description": "Full explanation" }
          ],
          "multiSelect": false
        },
        {
          "question": "Which sections should I include?",
          "header": "Sections",
          "options": [
            { "label": "Introduction", "description": "Opening context" },
            { "label": "Conclusion", "description": "Final summary" }
          ],
          "multiSelect": true
        }
      ]
    }
    ```
    参见[问题格式](#问题格式)了解完整字段描述。



    向用户展示问题并收集他们的选择。具体实现方式取决于您的应用程序：可以是终端提示符、网页表单、移动端对话框等。



    构建 `answers` 对象，将其作为记录（record），其中每个键（key）是 `question` 文本，每个值（value）是所选选项的 `label`：

    | 来自问题对象                                       | 用作   |
    | -------------------------------------------------- | ------ |
    | `question` 字段（例如：`"How should I format the output?"`） | 键（Key） |
    | 所选选项的 `label` 字段（例如：`"Summary"`）            | 值（Value） |

    对于多选题，传递一个标签数组或用 `", "` 连接它们。如果你[支持自由文本输入](#支持自由文本输入)，则使用用户的自定义文本作为值。

      ```python Python
      return PermissionResultAllow(
          updated_input={
              "questions": input_data.get("questions", []),
              "answers": {
                  "How should I format the output?": "Summary",
                  "Which sections should I include?": ["Introduction", "Conclusion"],
              },
          }
      )
      ```

      ```typescript TypeScript
      return {
        behavior: "allow",
        updatedInput: {
          questions: input.questions,
          answers: {
            "How should I format the output?": "Summary",
            "Which sections should I include?": "Introduction, Conclusion"
          }
        }
      };
      ```



### 问题格式

输入包含一个 `questions` 数组，其中是 Claude 生成的问题。每个问题具有以下字段：

| 字段          | 描述                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `question`    | 要显示的完整问题文本                                                                                                                    |
| `header`      | 问题的简短标签（最多12个字符）                                                                                                          |
| `options`     | 包含2-4个选项的数组，每个选项包含 `label` 和 `description`。在TypeScript中：可选地包含 `preview`（参见[下文]） |
| `multiSelect` | 如果为 `true`，用户可以选择多个选项                                                                                                     |

您的回调函数接收到的结构是：
```json
{
  "questions": [
    {
      "question": "How should I format the output?",
      "header": "Format",
      "options": [
        { "label": "Summary", "description": "Brief overview of key points" },
        { "label": "Detailed", "description": "Full explanation with examples" }
      ],
      "multiSelect": false
    }
  ]
}
```
#### 选项预览 (TypeScript)

`toolConfig.askUserQuestion.previewFormat` 为每个选项添加了一个 `preview` 字段，以便您的应用可以显示视觉模型预览。若未设置此选项，Claude 不会生成预览，且该字段将不存在。

| `previewFormat` | `preview` 包含的内容                                                                                               |
| :-------------- | :--------------------------------------------------------------------------------------------------------------- |
| 未设置（默认）    | 字段不存在。Claude 不会生成预览。                                                                                   |
| `"markdown"`    | ASCII 艺术和代码围栏块                                                                                              |
| `"html"`        | 一个带样式的 `<div>` 片段（SDK 会在您的回调运行前拒绝 `<script>`、`<style>` 和 `<!DOCTYPE>`）                               |

此格式适用于会话中的所有问题。Claude 会在视觉对比有帮助的选项（如布局选择、色彩方案）上包含 `preview`，而在无需视觉对比的选项（如是/否确认、纯文本选择）上省略它。在渲染前请检查是否为 `undefined`。
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Help me choose a card layout",
  options: {
    toolConfig: {
      askUserQuestion: { previewFormat: "html" }
    },
    canUseTool: async (toolName, input) => {
      // input.questions[].options[].preview is an HTML string or undefined
      return { behavior: "allow", updatedInput: input };
    }
  }
})) {
  // ...
}
```
带HTML预览的选项：
```json
{
  "label": "Compact",
  "description": "Title and metric value only",
  "preview": "<div style=\"padding:12px;border:1px solid #ddd;border-radius:8px\"><div style=\"font-size:12px;color:#666\">Active users</div><div style=\"font-size:28px;font-weight:600\">1,284</div></div>"
}
```
### 响应格式

返回一个 `answers` 对象，将每个问题的 `question` 字段映射到所选选项的 `label`：

| 字段        | 描述                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| `questions` | 传入原始的问题数组（工具处理所必需）                                                     |
| `answers`   | 对象，其中键是问题文本，值是所选标签                                                     |
| `response`  | 可选的自由格式回复，是用户输入的而非回答结构化问题的内容                                 |

对于多选问题，请传入一个标签数组或用 `, ` 连接它们。对于诸如“其他”选项之类的每题自由文本，请将用户输入的文本放在 `answers[question]` 中，如[支持自由文本输入](#支持自由文本输入)所示。仅当您的界面允许用户跳过问题卡片并输入非特定问题答案的一般性回复时，才设置 `response`。当设置了 `response` 时，Claude 会收到“The user responded: …”而不是按问题划分的答案列表。
```json
{
  "questions": [
    // ...
  ],
  "answers": {
    "How should I format the output?": "Summary",
    "Which sections should I include?": ["Introduction", "Conclusion"]
  }
}
```
#### 支持自由文本输入

Claude 的预设选项不会总能满足用户需求。要让用户输入自己的回答：

* 在 Claude 的选项后额外显示一个接受文本输入的 "Other" 选项
* 将用户的自定义文本作为回答值（而非单词 "Other"）

完整实现请参见下方[完整示例](#完整示例)。

### 完整示例

当需要用户输入才能继续时，Claude 会提出澄清性问题。例如，当被要求帮助决定移动应用的技术栈时，Claude 可能会询问跨平台与原生开发、后端偏好或目标平台等问题。这些问题帮助 Claude 做出符合用户偏好的决策，而不是猜测。

此示例在终端应用程序中处理这些问题。以下是每个步骤的执行过程：

1. **路由请求**：`canUseTool` 回调检查工具名称是否为 `"AskUserQuestion"`，并路由到专用处理程序
2. **显示问题**：处理程序循环遍历 `questions` 数组，打印每个问题及其带编号的选项
3. **收集输入**：用户可以输入数字选择选项，或直接输入自由文本（例如 "jquery"、"i don't know"）
4. **映射答案**：代码检查输入是数字（使用选项的标签）还是自由文本（直接使用文本）
5. **返回给 Claude**：响应包含原始的 `questions` 数组和 `answers` 映射

  ```python Python
  import asyncio

  from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
  from claude_agent_sdk.types import HookMatcher, PermissionResultAllow


  def parse_response(response: str, options: list) -> str:
      """Parse user input as option number(s) or free text."""
      try:
          indices = [int(s.strip()) - 1 for s in response.split(",")]
          labels = [options[i]["label"] for i in indices if 0 <= i < len(options)]
          return ", ".join(labels) if labels else response
      except ValueError:
          return response


  async def handle_ask_user_question(input_data: dict) -> PermissionResultAllow:
      """Display Claude's questions and collect user answers."""
      answers = {}

      for q in input_data.get("questions", []):
          print(f"\n{q['header']}: {q['question']}")

          options = q["options"]
          for i, opt in enumerate(options):
              print(f"  {i + 1}. {opt['label']} - {opt['description']}")
          if q.get("multiSelect"):
              print("  (Enter numbers separated by commas, or type your own answer)")
          else:
              print("  (Enter a number, or type your own answer)")

          response = input("Your choice: ").strip()
          answers[q["question"]] = parse_response(response, options)

      return PermissionResultAllow(
          updated_input={
              "questions": input_data.get("questions", []),
              "answers": answers,
          }
      )


  async def can_use_tool(
      tool_name: str, input_data: dict, context
  ) -> PermissionResultAllow:
      # Route AskUserQuestion to our question handler
      if tool_name == "AskUserQuestion":
          return await handle_ask_user_question(input_data)
      # Auto-approve other tools for this example
      return PermissionResultAllow(updated_input=input_data)


  async def prompt_stream():
      yield {
          "type": "user",
          "message": {
              "role": "user",
              "content": "Help me decide on the tech stack for a new mobile app",
          },
      }


  # Required workaround: dummy hook keeps the stream open for can_use_tool
  async def dummy_hook(input_data, tool_use_id, context):
      return {"continue_": True}


  async def main():
      async for message in query(
          prompt=prompt_stream(),
          options=ClaudeAgentOptions(
              can_use_tool=can_use_tool,
              hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
          ),
      ):
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";
  import * as readline from "readline/promises";

  // Helper to prompt user for input in the terminal
  async function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(question);
    rl.close();
    return answer;
  }

  // Parse user input as option number(s) or free text
  function parseResponse(response: string, options: any[]): string {
    const indices = response.split(",").map((s) => parseInt(s.trim()) - 1);
    const labels = indices
      .filter((i) => !isNaN(i) && i >= 0 && i < options.length)
      .map((i) => options[i].label);
    return labels.length > 0 ? labels.join(", ") : response;
  }

  // Display Claude's questions and collect user answers
  async function handleAskUserQuestion(input: any) {
    const answers: Record<string, string> = {};

    for (const q of input.questions) {
      console.log(`\n${q.header}: ${q.question}`);

      const options = q.options;
      options.forEach((opt: any, i: number) => {
        console.log(`  ${i + 1}. ${opt.label} - ${opt.description}`);
      });
      if (q.multiSelect) {
        console.log("  (Enter numbers separated by commas, or type your own answer)");
      } else {
        console.log("  (Enter a number, or type your own answer)");
      }

      const response = (await prompt("Your choice: ")).trim();
      answers[q.question] = parseResponse(response, options);
    }

    // Return the answers to Claude (must include original questions)
    return {
      behavior: "allow",
      updatedInput: { questions: input.questions, answers }
    };
  }

  async function main() {
    for await (const message of query({
      prompt: "Help me decide on the tech stack for a new mobile app",
      options: {
        canUseTool: async (toolName, input) => {
          // Route AskUserQuestion to our question handler
          if (toolName === "AskUserQuestion") {
            return handleAskUserQuestion(input);
          }
          // Auto-approve other tools for this example
          return { behavior: "allow", updatedInput: input };
        }
      }
    })) {
      if ("result" in message) console.log(message.result);
    }
  }

  main();
  ```

## 局限性

* **子代理**：通过 Agent 工具生成的子代理目前尚不支持使用 `AskUserQuestion`
* **问题数量限制**：每次 `AskUserQuestion` 调用支持 1-4 个问题，每个问题可设置 2-4 个选项

## 其他获取用户输入的方式

`canUseTool` 回调和 `AskUserQuestion` 工具涵盖了大多数批准和澄清场景，但 Agent SDK 还提供了其他获取用户输入的方式：

### 流式输入

当您需要以下功能时，请使用[流式输入](/zh/agent-sdk/streaming-vs-single-mode)：

* **中断任务执行**：在 Claude 工作时发送取消信号或更改方向
* **提供额外上下文**：无需等待 Claude 提问即可添加所需信息
* **构建聊天界面**：允许用户在长时间运行的操作中发送后续消息

流式输入适用于对话式界面，用户可在整个执行过程中（而不仅仅是在批准检查点）与代理交互。

### 自定义工具

当您需要以下功能时，请使用[自定义工具](/zh/agent-sdk/custom-tools)：

* **收集结构化输入**：构建表单、向导或多步骤工作流，这些超越了 `AskUserQuestion` 的多选格式
* **集成外部审批系统**：连接现有的工单系统、工作流或审批平台
* **实现特定领域的交互**：创建针对应用程序需求的工具，例如代码审查界面或部署检查清单

自定义工具能让您完全控制交互过程，但相比使用内置的 `canUseTool` 回调，需要更多的实现工作。

## 相关资源

* [配置权限](/zh/agent-sdk/permissions)：设置权限模式和规则
* [使用钩子控制执行](/zh/agent-sdk/hooks)：在代理生命周期的关键点运行自定义代码
* [TypeScript SDK 参考文档](/zh/agent-sdk/typescript#canusetool)：完整的 canUseTool API 文档