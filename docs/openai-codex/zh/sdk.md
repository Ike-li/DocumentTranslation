# Codex SDK

如果你通过 Codex CLI、IDE 扩展或 Codex Web 使用 Codex，也可以通过编程方式对其进行控制。

在以下场景中可以使用 SDK：

- 将 Codex 作为 CI/CD 流水线的一部分进行控制
- 创建自己的代理，与 Codex 协作完成复杂的工程任务
- 将 Codex 集成到你自己的内部工具和工作流中
- 将 Codex 嵌入到你自己的应用程序中

## TypeScript 库

TypeScript 库提供了一种比非交互模式更全面、更灵活的方式来从应用程序中控制 Codex。

请在服务端使用该库；它需要 Node.js 18 或更高版本。

### 安装

首先，使用 `npm` 安装 Codex SDK：

```bash
npm install @openai/codex-sdk
```

### 用法

启动一个与 Codex 的线程，并使用你的提示词运行它。

```ts


const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

console.log(result);
```

再次调用 `run()` 可以继续同一线程，也可以通过提供线程 ID 恢复之前的线程。

```ts
// 运行同一线程
const result = await thread.run("Implement the plan");

console.log(result);

// 恢复之前的线程

const threadId = "<thread-id>";
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Pick up where you left off");

console.log(result2);
```

更多详情请查看 [TypeScript 仓库](https://github.com/openai/codex/tree/main/sdk/typescript)。

## Python 库

Python SDK 目前处于实验阶段，通过 JSON-RPC 控制本地 Codex 应用服务器。它需要 Python 3.10 或更高版本，以及本地签出的开源 Codex 仓库。

### 安装

在 Codex 仓库根目录下，以可编辑模式安装 SDK：

```bash
cd sdk/python
python -m pip install -e .
```

如需手动本地使用 SDK，可传入 `AppServerConfig(codex_bin=...)` 指向本地 `codex` 二进制文件，或使用仓库中的示例和 notebook 引导脚本。

### 用法

启动 Codex，创建线程并运行提示词：

```python
from codex_app_server import Codex

with Codex() as codex:
    thread = codex.thread_start(model="gpt-5.4")
    result = thread.run("Make a plan to diagnose and fix the CI failures")
    print(result.final_response)
```

当你的应用已经是异步的，可以使用 `AsyncCodex`：

```python
import asyncio

from codex_app_server import AsyncCodex


async def main() -> None:
    async with AsyncCodex() as codex:
        thread = await codex.thread_start(model="gpt-5.4")
        result = await thread.run("Implement the plan")
        print(result.final_response)


asyncio.run(main())
```

更多详情请查看 [Python 仓库](https://github.com/openai/codex/tree/main/sdk/python)。
