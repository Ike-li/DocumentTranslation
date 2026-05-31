> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索前发现所有可用页面。

# 配置权限

> 通过权限模式、钩子和声明式允许/拒绝规则，控制您的智能体如何使用工具。

Claude Agent SDK 提供权限控制功能，用于管理 Claude 使用工具的方式。使用权限模式和规则来定义哪些操作是自动允许的，并使用 [`canUseTool` 回调](/en/agent-sdk/user-input) 来处理运行时的其他所有情况。

  本页面涵盖权限模式与规则。如需构建交互式审批流程（运行时用户批准或拒绝工具请求），请参阅[处理审批与用户输入](/en/agent-sdk/user-input)。

## 权限如何评估

当 Claude 请求使用工具时，SDK 会按以下顺序检查权限：


    首先运行[钩子](/en/agent-sdk/hooks)。钩子可以直接拒绝调用，也可以将调用传递给后续规则。返回 `allow` 的钩子并不会跳过下方的拒绝和询问规则；无论钩子结果如何，这些规则都会被评估。



    检查 `deny` 规则（来自 `disallowed_tools` 和 [settings.json](/en/settings#permission-settings)）。如果匹配到 deny 规则，即使处于 `bypassPermissions` 模式，该工具也会被阻止。像 `Bash` 这样的裸名称 deny 规则会在此评估开始之前就将工具从 Claude 的上下文中移除，因此在此步骤中只会检查带作用域的规则，如 `Bash(rm *)`。



    应用当前活动的[权限模式](#permission-modes)。`bypassPermissions` 会批准所有到达此步骤的操作。`acceptEdits` 会批准文件操作。其他模式则会放行。



    检查 `allow` 规则（来自 `allowed_tools` 和 settings.json）。如果规则匹配，则该工具被批准。



    若以上方法均未解决，请调用你的 [`canUseTool回调`](/en/agent-sdk/user-input) 以做出决定。在 `dontAsk` 模式下，此步骤将被跳过且该工具会被拒绝。


<img src="https://mintcdn.com/claude-code/FEspvVUyRuaWjm0s/images/agent-sdk/permissions-flow.svg?fit=max&auto=format&n=FEspvVUyRuaWjm0s&q=85&s=a1759b0cf4541281a9fdd8f5348228e8" alt="权限评估流程图" width="920" height="260" data-path="images/agent-sdk/permissions-flow.svg" />

本页重点介绍**允许与拒绝规则**以及**权限模式**。关于其他步骤：

* **钩子**：运行自定义代码来允许、拒绝或修改工具请求。请参阅[通过钩子控制执行](/zh/agent-sdk/hooks)。
* **canUseTool 回调**：在运行时提示用户批准。请参阅[处理批准与用户输入](/zh/agent-sdk/user-input)。

## 允许与拒绝规则

`allowed_tools` 和 `disallowed_tools`（TypeScript 中为 `allowedTools` / `disallowedTools`）会向上面评估流程中的允许和拒绝规则列表添加条目。允许规则仅影响批准流程：未在 `allowed_tools` 中列出的工具对 Claude 仍然可用，并转入权限模式处理。拒绝规则的行为则有所不同，取决于它们是指名了一个工具还是对其中某个模式进行了限定。

| 选项                               | 效果                                                                                                 |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `allowed_tools=["Read", "Grep"]`   | `Read` 和 `Grep` 被自动批准。未在此列出的工具仍然存在，会转入权限模式和 `canUseTool` 处理。            |
| `disallowed_tools=["Bash"]`        | `Bash` 工具的定义会从请求中移除。Claude 看不到该工具，因此无法尝试调用。                                |
| `disallowed_tools=["Bash(rm *)"]` | `Bash` 仍然可用。匹配 `rm *` 的调用在所有权限模式下（包括 `bypassPermissions`）都会被拒绝。其他 `Bash` 调用会转入权限模式处理。 |

要构建一个严格受限的代理，可将 `allowedTools` 与 `permissionMode: "dontAsk"` 配合使用。列出的工具将被批准；其他任何工具将直接被拒绝，而不是进行提示：
```typescript
const options = {
  allowedTools: ["Read", "Glob", "Grep"],
  permissionMode: "dontAsk"
};
```


  **`allowed_tools` 不会限制 `bypassPermissions`。** `allowed_tools` 仅会预先批准您列出的工具。未列出的工具不会匹配任何允许规则，将进入权限模式，而 `bypassPermissions` 会批准它们。将 `allowed_tools=["Read"]` 与 `permission_mode="bypassPermissions"` 一起设置，仍会批准所有工具，包括 `Bash`、`Write` 和 `Edit`。若需要使用 `bypassPermissions` 但希望阻止特定工具，请使用 `disallowed_tools`。

你还可以在 `.claude/settings.json` 中声明式地配置允许、拒绝和询问规则。当启用 `project` 设置源时（在默认的 `query()` 选项中已启用），这些规则将被读取。如果你显式设置了 `setting_sources`（TypeScript：`settingSources`），请包含 `"project"` 以使这些规则生效。有关规则语法，请参阅[权限设置](/zh/settings#permission-settings)。

## 权限模式

权限模式提供了对 Claude 如何使用工具的全局控制。你可以在调用 `query()` 时设置权限模式，或在流式会话期间动态更改它。

### 可用模式

SDK 支持以下权限模式：

| 模式                     | 描述                  | 工具行为                                                                                                                                 |
| :----------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`                | 标准权限行为 | 无自动批准；未匹配的工具会触发你的 `canUseTool` 回调                                                                         |
| `dontAsk`                | 拒绝而不是提示    | 任何未被 `allowed_tools` 或规则预先批准的操作都将被拒绝；`canUseTool` 永远不会被调用                                                 |
| `acceptEdits`            | 自动接受文件编辑       | 文件编辑和[文件系统操作](#accept-edits-mode-acceptedits)（`mkdir`、`rm`、`mv` 等）将被自动批准                 |
| `bypassPermissions`      | 绕过所有权限检查 | 所有工具无需权限提示即可运行（请谨慎使用）                                                                                   |
| `plan`                   | 规划模式                | 只读工具运行；Claude 进行分析和规划，但不编辑你的源文件                                                              |
| `auto` (仅限 TypeScript) | 模型分类的批准   | 模型分类器批准或拒绝每个工具调用。有关可用性，请参阅[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode) |

  **子代理继承规则：** 当父代理使用 `bypassPermissions`、`acceptEdits` 或 `auto` 模式时，所有子代理将继承该模式，且无法针对单个子代理进行覆盖。子代理可能拥有与主代理不同的系统提示词，且行为约束更少。因此，继承 `bypassPermissions` 模式将赋予子代理完全自主的系统访问权限，无需任何审批提示。

### 设置权限模式

您可以在启动查询时一次性设置权限模式，或在会话活跃期间动态更改。


    创建查询时传入 `permission_mode` (Python) 或 `permissionMode` (TypeScript)。此模式将应用于整个会话，除非动态更改。

      ```python Python
      import asyncio
      from claude_agent_sdk import query, ClaudeAgentOptions


      async def main():
          async for message in query(
              prompt="Help me refactor this code",
              options=ClaudeAgentOptions(
                  permission_mode="default",  # Set the mode here
              ),
          ):
              if hasattr(message, "result"):
                  print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      async function main() {
        for await (const message of query({
          prompt: "Help me refactor this code",
          options: {
            permissionMode: "default" // Set the mode here
          }
        })) {
          if ("result" in message) {
            console.log(message.result);
          }
        }
      }

      main();
      ```




    调用 `set_permission_mode()`（Python）或 `setPermissionMode()`（TypeScript）可在会话中更改模式。新模式将对所有后续工具请求立即生效。这允许您以限制性模式启动，并随着信任建立逐步放宽权限，例如在审查 Claude 的初始方案后切换到 `acceptEdits` 模式。

      ```python Python
      import asyncio
      from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions


      async def main():
          async with ClaudeSDKClient(
              options=ClaudeAgentOptions(
                  permission_mode="default",  # Start in default mode
              )
          ) as client:
              await client.query("Help me refactor this code")

              # Change mode dynamically mid-session
              await client.set_permission_mode("acceptEdits")

              # Process messages with the new permission mode
              async for message in client.receive_response():
                  if hasattr(message, "result"):
                      print(message.result)


      asyncio.run(main())
      ```

      ```typescript TypeScript
      import { query } from "@anthropic-ai/claude-agent-sdk";

      async function main() {
        const q = query({
          prompt: "Help me refactor this code",
          options: {
            permissionMode: "default" // Start in default mode
          }
        });

        // Change mode dynamically mid-session
        await q.setPermissionMode("acceptEdits");

        // Process messages with the new permission mode
        for await (const message of q) {
          if ("result" in message) {
            console.log(message.result);
          }
        }
      }

      main();
      ```



### 模式详情

#### 接受编辑模式 (`acceptEdits`)

自动批准文件操作，以便 Claude 能够在无需提示的情况下编辑代码。其他工具（如非文件系统操作的 Bash 命令）仍需要正常的权限。

**自动批准的操作：**

* 文件编辑（Edit、Write 工具）
* 文件系统命令：`mkdir`、`touch`、`rm`、`rmdir`、`mv`、`cp`、`sed`

两者仅适用于工作目录或 `additionalDirectories` 内部的路径。超出此范围或向受保护路径写入的路径仍会提示。

**适用于：** 你信任 Claude 的编辑并希望进行更快迭代的情况，例如原型设计期间或在隔离目录中工作时。

#### 不询问模式 (`dontAsk`)

将任何权限提示转换为拒绝。由 `allowed_tools`、`settings.json` 允许规则预批准的工具或钩子运行照常执行。其他所有操作都会被拒绝，且不会调用 `canUseTool`。

**适用于：** 你希望为无头代理提供固定的、明确的工具接口，并倾向于硬拒绝而非静默依赖 `canUseTool` 不存在。

#### 绕过权限模式 (`bypassPermissions`)

自动批准所有工具的使用，无需提示。钩子仍会执行，并可在需要时阻止操作。

  请极度谨慎使用。在此模式下 Claude 拥有完整的系统访问权限。仅在您信任所有可能操作的受控环境中使用。

  `allowed_tools` 不会限制此模式。每个工具都会被批准，而不仅仅是您列出的那些。拒绝规则（`disallowed_tools`）、显式 `ask` 规则和钩子会在模式检查之前进行评估，并且仍然可以阻止工具。

#### 计划模式 (`plan`)

将Claude限制为只读工具。Claude可以读取文件并运行只读的shell命令来探索代码库，但不会编辑您的源文件。Claude可能会在最终确定计划前使用 `AskUserQuestion` 来澄清需求。请参阅[处理审批和用户输入](/en/agent-sdk/user-input#handle-clarifying-questions)了解如何处理这些提示。

**适用场景：** 当您希望Claude提出变更建议而不执行时，例如在代码审查期间，或者在需要批准变更后才能执行时。

## 相关资源

关于权限评估流程中的其他步骤：

* [处理审批和用户输入](/en/agent-sdk/user-input)：交互式审批提示和澄清性问题
* [钩子指南](/en/agent-sdk/hooks)：在代理生命周期的关键点运行自定义代码
* [权限规则](/en/settings#permission-settings)：在 `settings.json` 中声明允许/拒绝规则