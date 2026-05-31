> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索前发现所有可用页面。

# 使用检查点回溯文件更改

> 在代理会话期间跟踪文件更改，并将文件恢复到任何先前状态

文件检查点跟踪代理会话期间通过 Write、Edit 和 NotebookEdit 工具所做的文件修改，允许您将文件回溯到任何先前状态。想要尝试一下？跳转到[交互示例](#try-it-out)。

使用检查点，您可以：

* **撤销不需要的更改**：将文件恢复到已知的良好状态
* **尝试不同方案**：恢复到某个检查点并尝试不同的方法
* **从错误中恢复**：当代理进行不正确的修改时

  仅通过 Write、Edit 和 NotebookEdit 工具所做的更改会被跟踪。而通过 Bash 命令（如 `echo > file.txt` 或 `sed -i`）进行的更改不会被检查点系统捕获。

## 检查点工作原理

当您启用文件检查点功能时，SDK 会在通过 Write、Edit 或 NotebookEdit 工具修改文件前创建备份。响应流中的用户消息会包含一个检查点 UUID，您可用它作为恢复点。

检查点适用于智能体用于修改文件的以下内置工具：

| 工具         | 描述                                                             |
| ------------ | ---------------------------------------------------------------- |
| Write        | 创建新文件或用新内容覆盖现有文件                                 |
| Edit         | 对现有文件的特定部分进行定向编辑                                 |
| NotebookEdit | 修改 Jupyter 笔记本（`.ipynb` 文件）中的单元格                   |

  文件回滚会将磁盘上的文件恢复到之前的状态。它不会回滚对话本身。调用 `rewindFiles()`（TypeScript）或 `rewind_files()`（Python）后，对话历史和上下文将保持不变。

检查点系统跟踪以下内容：

* 会话期间创建的文件
* 会话期间修改的文件
* 已修改文件的原始内容

当您回滚到检查点时，已创建的文件将被删除，已修改的文件将恢复到该检查点时刻的内容。

## 实现检查点功能

要使用文件检查点功能，请在选项中启用它，从响应流中捕获检查点 UUID，然后在需要恢复时调用 `rewindFiles()`（TypeScript）或 `rewind_files()`（Python）。

以下示例展示了完整流程：启用检查点功能，从响应流中捕获检查点 UUID 和会话 ID，然后稍后恢复会话以回滚文件。每个步骤将在下文详细说明。

  ```python Python
  import asyncio
  from claude_agent_sdk import (
      ClaudeSDKClient,
      ClaudeAgentOptions,
      UserMessage,
      ResultMessage,
  )


  async def main():
      # Step 1: Enable checkpointing
      options = ClaudeAgentOptions(
          enable_file_checkpointing=True,
          permission_mode="acceptEdits",  # Auto-accept file edits without prompting
          extra_args={
              "replay-user-messages": None
          },  # Required to receive checkpoint UUIDs in the response stream
      )

      checkpoint_id = None
      session_id = None

      # Run the query and capture checkpoint UUID and session ID
      async with ClaudeSDKClient(options) as client:
          await client.query("Refactor the authentication module")

          # Step 2: Capture checkpoint UUID from the first user message
          async for message in client.receive_response():
              if isinstance(message, UserMessage) and message.uuid and not checkpoint_id:
                  checkpoint_id = message.uuid
              if isinstance(message, ResultMessage) and not session_id:
                  session_id = message.session_id

      # Step 3: Later, rewind by resuming the session with an empty prompt
      if checkpoint_id and session_id:
          async with ClaudeSDKClient(
              ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
          ) as client:
              await client.query("")  # Empty prompt to open the connection
              async for message in client.receive_response():
                  await client.rewind_files(checkpoint_id)
                  break
          print(f"Rewound to checkpoint: {checkpoint_id}")


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  async function main() {
    // Step 1: Enable checkpointing
    const opts = {
      enableFileCheckpointing: true,
      permissionMode: "acceptEdits" as const, // Auto-accept file edits without prompting
      extraArgs: { "replay-user-messages": null } // Required to receive checkpoint UUIDs in the response stream
    };

    const response = query({
      prompt: "Refactor the authentication module",
      options: opts
    });

    let checkpointId: string | undefined;
    let sessionId: string | undefined;

    // Step 2: Capture checkpoint UUID from the first user message
    for await (const message of response) {
      if (message.type === "user" && message.uuid && !checkpointId) {
        checkpointId = message.uuid;
      }
      if ("session_id" in message && !sessionId) {
        sessionId = message.session_id;
      }
    }

    // Step 3: Later, rewind by resuming the session with an empty prompt
    if (checkpointId && sessionId) {
      const rewindQuery = query({
        prompt: "", // Empty prompt to open the connection
        options: { ...opts, resume: sessionId }
      });

      for await (const msg of rewindQuery) {
        await rewindQuery.rewindFiles(checkpointId);
        break;
      }
      console.log(`Rewound to checkpoint: ${checkpointId}`);
    }
  }

  main();
  ```




    配置你的 SDK 选项以启用检查点并接收检查点 UUID：

    | 选项                 | Python                                      | TypeScript                                    | 描述                                       |
    | -------------------- | ------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
    | 启用检查点           | `enable_file_checkpointing=True`            | `enableFileCheckpointing: true`               | 跟踪文件更改以便回滚                       |
    | 接收检查点 UUID      | `extra_args={"replay-user-messages": None}` | `extraArgs: { 'replay-user-messages': null }` | 在流中获取用户消息 UUID 所必需             |

      ```python Python
      options = ClaudeAgentOptions(
          enable_file_checkpointing=True,
          permission_mode="acceptEdits",
          extra_args={"replay-user-messages": None},
      )

      async with ClaudeSDKClient(options) as client:
          await client.query("Refactor the authentication module")
      ```

      ```typescript TypeScript
      const response = query({
        prompt: "Refactor the authentication module",
        options: {
          enableFileCheckpointing: true,
          permissionMode: "acceptEdits" as const,
          extraArgs: { "replay-user-messages": null }
        }
      });
      ```




    设置了 `replay-user-messages` 选项后（如上所示），响应流中的每个用户消息都会附带一个用作检查点的 UUID。

    对于大多数使用场景，只需捕获第一个用户消息的 UUID（`message.uuid`）；回溯至此可将所有文件恢复到原始状态。如需存储多个检查点并回溯至中间状态，请参阅[多个恢复点](#multiple-restore-points)。

    捕获会话 ID（`message.session_id`）是可选的；仅当您希望在流处理完成后稍后回溯时才需要它。如果您在仍在处理消息时就立即调用 `rewindFiles()`（如[在风险操作前设置检查点](#checkpoint-before-risky-operations)中的示例所示），则可以跳过捕获会话 ID。

      ```python Python
      checkpoint_id = None
      session_id = None

      async for message in client.receive_response():
          # Update checkpoint on each user message (keeps the latest)
          if isinstance(message, UserMessage) and message.uuid:
              checkpoint_id = message.uuid
          # Capture session ID from the result message
          if isinstance(message, ResultMessage):
              session_id = message.session_id
      ```

      ```typescript TypeScript
      let checkpointId: string | undefined;
      let sessionId: string | undefined;

      for await (const message of response) {
        // Update checkpoint on each user message (keeps the latest)
        if (message.type === "user" && message.uuid) {
          checkpointId = message.uuid;
        }
        // Capture session ID from any message that has it
        if ("session_id" in message) {
          sessionId = message.session_id;
        }
      }
      ```




    要在流完成之后进行回退，请使用空提示词恢复会话，并使用您的检查点 UUID 调用 `rewind_files()`（Python）或 `rewindFiles()`（TypeScript）。您也可以在流进行过程中进行回退；请参阅[在风险操作前设置检查点](#checkpoint-before-risky-operations)了解相关模式。

      ```python Python
      async with ClaudeSDKClient(
          ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
      ) as client:
          await client.query("")  # Empty prompt to open the connection
          async for message in client.receive_response():
              await client.rewind_files(checkpoint_id)
              break
      ```

      ```typescript TypeScript
      const rewindQuery = query({
        prompt: "", // Empty prompt to open the connection
        options: { ...opts, resume: sessionId }
      });

      for await (const msg of rewindQuery) {
        await rewindQuery.rewindFiles(checkpointId);
        break;
      }
      ```

    如果你捕获了会话ID和检查点ID，也可以从CLI进行回溯：
    ```bash
    claude -p --resume <session-id> --rewind-files <checkpoint-uuid>
    ```


## 常见模式

这些模式展示了根据你的使用场景捕获和使用检查点UUID的不同方法。

### 在高风险操作前设置检查点

此模式仅保留最近的检查点UUID，在每次代理轮次前更新它。如果在处理过程中出现问题，你可以立即回退到上一个安全状态并跳出循环。

  ```python Python
  import asyncio
  from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, UserMessage


  async def main():
      options = ClaudeAgentOptions(
          enable_file_checkpointing=True,
          permission_mode="acceptEdits",
          extra_args={"replay-user-messages": None},
      )

      safe_checkpoint = None

      async with ClaudeSDKClient(options) as client:
          await client.query("Refactor the authentication module")

          async for message in client.receive_response():
              # Update checkpoint before each agent turn starts
              # This overwrites the previous checkpoint. Only keep the latest
              if isinstance(message, UserMessage) and message.uuid:
                  safe_checkpoint = message.uuid

              # Decide when to revert based on your own logic
              # For example: error detection, validation failure, or user input
              if your_revert_condition and safe_checkpoint:
                  await client.rewind_files(safe_checkpoint)
                  # Exit the loop after rewinding, files are restored
                  break


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  async function main() {
    const response = query({
      prompt: "Refactor the authentication module",
      options: {
        enableFileCheckpointing: true,
        permissionMode: "acceptEdits" as const,
        extraArgs: { "replay-user-messages": null }
      }
    });

    let safeCheckpoint: string | undefined;

    for await (const message of response) {
      // Update checkpoint before each agent turn starts
      // This overwrites the previous checkpoint. Only keep the latest
      if (message.type === "user" && message.uuid) {
        safeCheckpoint = message.uuid;
      }

      // Decide when to revert based on your own logic
      // For example: error detection, validation failure, or user input
      if (yourRevertCondition && safeCheckpoint) {
        await response.rewindFiles(safeCheckpoint);
        // Exit the loop after rewinding, files are restored
        break;
      }
    }
  }

  main();
  ```

### 多个恢复点

如果Claude跨多个回合进行了修改，您可能希望回退到特定时间点，而非完全回退。例如，若Claude在第一回合重构了文件，在第二回合添加了测试，您可能希望保留重构操作但撤销测试。

此模式将所有检查点UUID及其元数据存储在一个数组中。会话结束后，您可以回退至任意先前检查点：

  ```python Python
  import asyncio
  from dataclasses import dataclass
  from datetime import datetime
  from claude_agent_sdk import (
      ClaudeSDKClient,
      ClaudeAgentOptions,
      UserMessage,
      ResultMessage,
  )


  # Store checkpoint metadata for better tracking
  @dataclass
  class Checkpoint:
      id: str
      description: str
      timestamp: datetime


  async def main():
      options = ClaudeAgentOptions(
          enable_file_checkpointing=True,
          permission_mode="acceptEdits",
          extra_args={"replay-user-messages": None},
      )

      checkpoints = []
      session_id = None

      async with ClaudeSDKClient(options) as client:
          await client.query("Refactor the authentication module")

          async for message in client.receive_response():
              if isinstance(message, UserMessage) and message.uuid:
                  checkpoints.append(
                      Checkpoint(
                          id=message.uuid,
                          description=f"After turn {len(checkpoints) + 1}",
                          timestamp=datetime.now(),
                      )
                  )
              if isinstance(message, ResultMessage) and not session_id:
                  session_id = message.session_id

      # Later: rewind to any checkpoint by resuming the session
      if checkpoints and session_id:
          target = checkpoints[0]  # Pick any checkpoint
          async with ClaudeSDKClient(
              ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
          ) as client:
              await client.query("")  # Empty prompt to open the connection
              async for message in client.receive_response():
                  await client.rewind_files(target.id)
                  break
          print(f"Rewound to: {target.description}")


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Store checkpoint metadata for better tracking
  interface Checkpoint {
    id: string;
    description: string;
    timestamp: Date;
  }

  async function main() {
    const opts = {
      enableFileCheckpointing: true,
      permissionMode: "acceptEdits" as const,
      extraArgs: { "replay-user-messages": null }
    };

    const response = query({
      prompt: "Refactor the authentication module",
      options: opts
    });

    const checkpoints: Checkpoint[] = [];
    let sessionId: string | undefined;

    for await (const message of response) {
      if (message.type === "user" && message.uuid) {
        checkpoints.push({
          id: message.uuid,
          description: `After turn ${checkpoints.length + 1}`,
          timestamp: new Date()
        });
      }
      if ("session_id" in message && !sessionId) {
        sessionId = message.session_id;
      }
    }

    // Later: rewind to any checkpoint by resuming the session
    if (checkpoints.length > 0 && sessionId) {
      const target = checkpoints[0]; // Pick any checkpoint
      const rewindQuery = query({
        prompt: "", // Empty prompt to open the connection
        options: { ...opts, resume: sessionId }
      });

      for await (const msg of rewindQuery) {
        await rewindQuery.rewindFiles(target.id);
        break;
      }
      console.log(`Rewound to: ${target.description}`);
    }
  }

  main();
  ```

## 尝试一下

这个完整示例会创建一个小型工具文件，让代理添加文档注释，向您展示更改内容，然后询问您是否要回退。

在开始之前，请确保您已安装 [Claude Agent SDK](/en/agent-sdk/quickstart)。


    创建一个名为 `utils.py` (Python) 或 `utils.ts` (TypeScript) 的新文件，并粘贴以下代码：

      ```python utils.py
      def add(a, b):
          return a + b


      def subtract(a, b):
          return a - b


      def multiply(a, b):
          return a * b


      def divide(a, b):
          if b == 0:
              raise ValueError("Cannot divide by zero")
          return a / b
      ```

      ```typescript utils.ts
      export function add(a: number, b: number): number {
        return a + b;
      }

      export function subtract(a: number, b: number): number {
        return a - b;
      }

      export function multiply(a: number, b: number): number {
        return a * b;
      }

      export function divide(a: number, b: number): number {
        if (b === 0) {
          throw new Error("Cannot divide by zero");
        }
        return a / b;
      }
      ```




    在与您的工具文件相同的目录中创建一个名为 `try_checkpointing.py`（Python）或 `try_checkpointing.ts`（TypeScript）的新文件，并粘贴以下代码。

    此脚本会要求 Claude 为您的工具文件添加文档注释，然后为您提供回退并恢复原始内容的选项。

      ```python try_checkpointing.py
      import asyncio
      from claude_agent_sdk import (
          ClaudeSDKClient,
          ClaudeAgentOptions,
          UserMessage,
          ResultMessage,
      )


      async def main():
          # Configure the SDK with checkpointing enabled
          # - enable_file_checkpointing: Track file changes for rewinding
          # - permission_mode: Auto-accept file edits without prompting
          # - extra_args: Required to receive user message UUIDs in the stream
          options = ClaudeAgentOptions(
              enable_file_checkpointing=True,
              permission_mode="acceptEdits",
              extra_args={"replay-user-messages": None},
          )

          checkpoint_id = None  # Store the user message UUID for rewinding
          session_id = None  # Store the session ID for resuming

          print("Running agent to add doc comments to utils.py...\n")

          # Run the agent and capture checkpoint data from the response stream
          async with ClaudeSDKClient(options) as client:
              await client.query("Add doc comments to utils.py")

              async for message in client.receive_response():
                  # Capture the first user message UUID - this is our restore point
                  if isinstance(message, UserMessage) and message.uuid and not checkpoint_id:
                      checkpoint_id = message.uuid
                  # Capture the session ID so we can resume later
                  if isinstance(message, ResultMessage):
                      session_id = message.session_id

          print("Done! Open utils.py to see the added doc comments.\n")

          # Ask the user if they want to rewind the changes
          if checkpoint_id and session_id:
              response = input("Rewind to remove the doc comments? (y/n): ")

              if response.lower() == "y":
                  # Resume the session with an empty prompt, then rewind
                  async with ClaudeSDKClient(
                      ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
                  ) as client:
                      await client.query("")  # Empty prompt opens the connection
                      async for message in client.receive_response():
                          await client.rewind_files(checkpoint_id)  # Restore files
                          break

                  print(
                      "\n✓ File restored! Open utils.py to verify the doc comments are gone."
                  )
              else:
                  print("\nKept the modified file.")


      asyncio.run(main())
      ```

      ```typescript try_checkpointing.ts
      import { query } from "@anthropic-ai/claude-agent-sdk";
      import * as readline from "readline";

      async function main() {
        // Configure the SDK with checkpointing enabled
        // - enableFileCheckpointing: Track file changes for rewinding
        // - permissionMode: Auto-accept file edits without prompting
        // - extraArgs: Required to receive user message UUIDs in the stream
        const opts = {
          enableFileCheckpointing: true,
          permissionMode: "acceptEdits" as const,
          extraArgs: { "replay-user-messages": null }
        };

        let sessionId: string | undefined; // Store the session ID for resuming
        let checkpointId: string | undefined; // Store the user message UUID for rewinding

        console.log("Running agent to add doc comments to utils.ts...\n");

        // Run the agent and capture checkpoint data from the response stream
        const response = query({
          prompt: "Add doc comments to utils.ts",
          options: opts
        });

        for await (const message of response) {
          // Capture the first user message UUID - this is our restore point
          if (message.type === "user" && message.uuid && !checkpointId) {
            checkpointId = message.uuid;
          }
          // Capture the session ID so we can resume later
          if ("session_id" in message) {
            sessionId = message.session_id;
          }
        }

        console.log("Done! Open utils.ts to see the added doc comments.\n");

        // Ask the user if they want to rewind the changes
        if (checkpointId && sessionId) {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question("Rewind to remove the doc comments? (y/n): ", resolve);
          });
          rl.close();

          if (answer.toLowerCase() === "y") {
            // Resume the session with an empty prompt, then rewind
            const rewindQuery = query({
              prompt: "", // Empty prompt opens the connection
              options: { ...opts, resume: sessionId }
            });

            for await (const msg of rewindQuery) {
              await rewindQuery.rewindFiles(checkpointId); // Restore files
              break;
            }

            console.log("\n✓ File restored! Open utils.ts to verify the doc comments are gone.");
          } else {
            console.log("\nKept the modified file.");
          }
        }
      }

      main();
      ```

    此示例展示了完整的检查点工作流程：

    1. **启用检查点**：将 SDK 配置为 `enable_file_checkpointing=True` 和 `permission_mode="acceptEdits"` 以自动批准文件编辑
    2. **捕获检查点数据**：随着代理运行，存储首个用户消息的 UUID（作为恢复点）和会话 ID
    3. **提示回退**：代理执行完毕后，检查工具文件中的文档注释，决定是否撤回更改
    4. **恢复并回退**：如果需要，使用空提示词恢复会话并调用 `rewind_files()` 以还原原始文件



    从与你的实用程序文件相同的目录运行脚本。

      在运行脚本前，请在 IDE 或编辑器中打开工具文件（`utils.py` 或 `utils.ts`）。您将看到文件实时更新，因为代理会添加文档注释；当您选择回退时，文件将还原为原状。




        ```bash
        python try_checkpointing.py
        ```



        ```bash
        npx tsx try_checkpointing.ts
        ```


    你会看到代理添加文档注释，随后出现询问是否回退的提示词。如果选择是，文件将恢复至原始状态。


## 限制

文件检查点具有以下限制：

| 限制                             | 描述                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| 仅限 Write/Edit/NotebookEdit 工具 | 通过 Bash 命令所做的更改不会被追踪                            |
| 同一会话内                         | 检查点与创建它们的会话绑定                                   |
| 仅限文件内容                       | 创建、移动或删除目录的操作无法通过回滚撤销                   |
| 仅限本地文件                       | 不追踪远程或网络文件                                         |

## 故障排查

### 检查点选项未识别

如果 `enableFileCheckpointing` 或 `rewindFiles()` 不可用，您可能使用的是较旧版本的 SDK。

**解决方案**：更新到最新 SDK 版本：

* **Python**：`pip install --upgrade claude-agent-sdk`
* **TypeScript**：`npm install @anthropic-ai/claude-agent-sdk@latest`

### 用户消息没有 UUID

如果 `message.uuid` 是 `undefined` 或缺失，表示您未接收检查点 UUID。

**原因**：`replay-user-messages` 选项未设置。

**解决方案**：在选项中添加 `extra_args={"replay-user-messages": None}`（Python）或 `extraArgs: { 'replay-user-messages': null }`（TypeScript）。

### “No file checkpoint found for message”错误

当指定的用户消息 UUID 的检查点数据不存在时，会出现此错误。

**常见原因**：

* 原始会话未启用文件检查点（`enable_file_checkpointing` 或 `enableFileCheckpointing` 未设置为 `true`）
* 在尝试恢复和回滚之前，会话未正确完成

**解决方案**：确保在原始会话上设置了 `enable_file_checkpointing=True`（Python）或 `enableFileCheckpointing: true`（TypeScript），然后使用示例中展示的模式：捕获第一个用户消息 UUID，完整完成会话，接着用空提示词恢复，并调用一次 `rewindFiles()`。

### “ProcessTransport is not ready for writing”错误

当您在完成响应迭代后调用 `rewindFiles()` 或 `rewind_files()` 时，会发生此错误。循环完成时，与 CLI 进程的连接会关闭。

**解决方案**：用空提示词恢复会话，然后在新查询上调用回滚：

  ```python Python
  # Resume session with empty prompt, then rewind
  async with ClaudeSDKClient(
      ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
  ) as client:
      await client.query("")
      async for message in client.receive_response():
          await client.rewind_files(checkpoint_id)
          break
  ```

  ```typescript TypeScript
  // Resume session with empty prompt, then rewind
  const rewindQuery = query({
    prompt: "",
    options: { ...opts, resume: sessionId }
  });

  for await (const msg of rewindQuery) {
    await rewindQuery.rewindFiles(checkpointId);
    break;
  }
  ```

## 后续步骤

* **[会话](/en/agent-sdk/sessions)**：了解如何恢复会话，这是流式传输完成后进行回溯所必需的操作。涵盖会话 ID、会话恢复及会话分叉等内容。
* **[权限](/en/agent-sdk/permissions)**：配置 Claude 可以使用哪些工具以及如何批准文件修改。当您希望更精细地控制编辑发生时机时，此功能非常实用。
* **[TypeScript SDK 参考](/en/agent-sdk/typescript)**：完整的 API 参考文档，包括 `query()` 和 `rewindFiles()` 方法的所有选项。
* **[Python SDK 参考](/en/agent-sdk/python)**：完整的 API 参考文档，包括 `ClaudeAgentOptions` 和 `rewind_files()` 方法的所有选项。