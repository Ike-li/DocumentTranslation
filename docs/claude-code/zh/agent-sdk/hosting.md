> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，再进一步探索。

# 托管 Agent SDK

> 在生产环境中部署 Agent SDK：Docker、Kubernetes 和沙箱提供者的子进程架构、会话持久化、扩展性、可观测性以及多租户隔离。

Agent SDK 会生成并监督一个拥有 shell、工作目录和磁盘会话文件的 `claude` CLI 子进程。托管它不同于托管一个无状态的 API 包装器。每个运行的代理都是一个与本地状态绑定的长时进程，这决定了你如何分配资源、持久化会话以及跨租户进行扩展。

本页面涵盖了在您自己的基础设施上进行自托管的内容：了解[子进程模型](#the-subprocess-model)，[选择会话模式](#choose-a-session-pattern)，[配置容器](#provision-the-container)，并处理如持久化、可观测性、认证和多租户隔离等[生产环境问题](#handle-production-concerns)。如需可部署的 Dockerfile 和 Kubernetes 清单，请参阅[托管食谱](https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/hosting)。

如果您不需要基础设施控制、自定义隔离或您自己的数据层，可以考虑使用 [托管代理](https://platform.claude.com/docs/en/managed-agents/overview)：这是一个托管的 REST API，由 Anthropic 运行代理和沙箱，您的应用程序发送事件并流式回传结果，无需操作任何托管基础设施。

  关于超越基本沙箱化的安全加固，包括网络控制、凭证管理和隔离选项，请参阅 [Secure Deployment](/en/agent-sdk/secure-deployment)。

## 子进程模型

本页所有主机部署决策都源于 SDK 运行代理的方式。当您的代码调用 `query()` 时，SDK 会生成一个独立的 `claude` 命令行进程，并通过 stdio 与之通信。该子进程拥有本地磁盘上的 Shell、工作目录和 JSONL 会话记录。

<img src="https://mintcdn.com/claude-code/Akpoo6g0xDlAmvHv/images/agent-sdk/hosting-subprocess.svg?fit=max&auto=format&n=Akpoo6g0xDlAmvHv&q=85&s=d348cc9687d47e0bc954075fd88d0e60" alt="请求流程：客户端到您的应用程序，该程序在容器内通过 stdio 生成一个 claude CLI 子进程；子进程写入本地磁盘并通过 HTTPS 调用 api.anthropic.com" width="920" height="220" data-path="images/agent-sdk/hosting-subprocess.svg" />

一个代理会话对应一个子进程。运行 N 个并发会话意味着 N 个子进程，每个子进程都有自己的进程树和记录文件。默认情况下，它们都会继承应用程序的工作目录，因此当会话需要独立的文件系统时，请在每次 `query()` 调用时传递 `cwd` 参数：

  ```typescript TypeScript
  query({ prompt, options: { cwd: "/work/session-a" } })
  ```

  ```python Python
  query(prompt=prompt, options=ClaudeAgentOptions(cwd="/work/session-a"))
  ```

### 存储在本地磁盘的状态

默认情况下，有三种代理状态存储在容器的文件系统中。它们都不会在容器重启、缩减或迁移到其他节点时保留。

| 状态                   | 默认位置                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| 会话记录               | `~/.claude/projects/`，或者如果设置了 `CLAUDE_CONFIG_DIR`，则在其下的 `projects/` 目录中         |
| `CLAUDE.md` 记忆文件   | `~/.claude/CLAUDE.md`（用户层级），以及会话的工作目录（项目层级）                                |
| 工作目录产物           | 会话的工作目录                                                                                   |

要在不同主机间持久化会话记录，请配置一个 [`SessionStore` 适配器](/en/agent-sdk/session-storage)。记忆文件和其他工作目录产物需要它们自己的存储策略，例如挂载卷或对象存储同步。

关于 API 层面会话、恢复和分叉如何工作，请参阅[会话](/en/agent-sdk/sessions)。

## 选择会话模式

这四种模式涵盖了会话生命周期：容器生存时长与其服务的会话之间的关系。关于容器运行的位置，[托管指南](https://github.com/anthropics/claude-cookbooks/blob/main/claude_agent_sdk/07_Hosting_the_agent.ipynb)中提供了针对本地 Docker、Modal 和 Kubernetes 的[可部署代码](https://github.com/anthropics/claude-cookbooks/tree/main/claude_agent_sdk/hosting)。在此选择会话模式，并从指南中选择部署目标。

### 临时会话

为每个用户任务创建一个容器，并在任务完成后销毁它。最适合一次性任务。在任务完成过程中，用户仍可与 AI 交互，但任务完成后容器将被销毁。

示例工作负载包括 Bug 调查与修复、发票与收据提取、文档翻译和媒体转换。

容器运行一个一次性入口点，该入口点调用 SDK 然后退出。下面的示例展示了一个最简单的 TypeScript 版本。将其保存为 `entrypoint.mts`，或者在 `package.json` 中设置 `"type": "module"`，以便使用顶层 `await`。
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt = process.env.TASK_PROMPT!;
for await (const message of query({ prompt, options: { maxTurns: 20 } })) {
  console.log(message);
}
```
### 长期会话

运行持久化容器实例，每个容器通常托管多个 SDK 进程以处理持续任务。最适合执行自主操作、提供内容或处理大量消息流的代理。

示例工作负载包括：对收发邮件进行分类和响应的邮件代理、通过容器端口为每位用户托管可编辑站点的站点构建器，以及处理来自 Slack 等平台持续流量的聊天机器人。

该容器暴露 HTTP 或 WebSocket 端点，并将每个活跃会话映射到一个长期存在的查询及其背后的子进程。在 TypeScript 中，使用 [`streamInput()`](/en/agent-sdk/typescript#query-object) 向活跃会话添加轮次，并使用 [`startup()`](/en/agent-sdk/typescript#startup) 在接收流量前预热子进程。在 Python 中，使用 [`ClaudeSDKClient`](/en/agent-sdk/python#claudesdkclient) 保持会话在多个轮次间处于打开状态。请调整容器大小，使其能够容纳内存中的最大并发会话数。

### 混合会话

临时容器在启动时从 [`SessionStore`](/en/agent-sdk/session-storage) 加载数据，并将更新持久化回存储。最适合交互次数较多但在交互间处于空闲状态的会话。容器会在空闲期间自动关闭，并在用户返回时重新启动。

示例工作负载包括：需要间歇性检查的个人项目管理器、跨数小时暂停和恢复的深度研究，以及加载跨交互工单历史的客户支持代理。

根据您预期的用户返回频率，调整您服务提供商的闲置超时时间。如果未配置 `SessionStore` 就关闭容器，会话记录将随之丢失，因此对于此模式而言，存储是必需而非可选的。

该模式的核心是通过附着共享存储来按 ID 恢复会话：

  ```typescript TypeScript
  import { query, type SessionStore } from "@anthropic-ai/claude-agent-sdk";

  declare const userInput: string;
  declare const sessionId: string;          // looked up from your database by user
  declare const sessionStore: SessionStore; // S3, Redis, Postgres, or your own adapter

  for await (const message of query({
    prompt: userInput,
    options: { resume: sessionId, sessionStore },
  })) {
    // ...
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  async for message in query(
      prompt=user_input,
      options=ClaudeAgentOptions(
          resume=session_id,            # looked up from your database by user
          session_store=session_store,  # S3, Redis, Postgres, or your own adapter
      ),
  ):
      ...
  ```

请参阅 [会话存储](/en/agent-sdk/session-storage) 以获取完整的 `SessionStore` 接口和参考适配器。

### 多代理容器

在一个容器内运行多个 SDK 子进程。最适合需要紧密协作的代理，例如在共享环境中相互交互的多代理模拟。

为每个代理分配自己的工作目录，以避免它们相互覆盖文件，并隔离设置加载，使得每个代理的 `CLAUDE.md` 文件不会跨代理泄露。有关具体选项，请参阅 [多租户隔离](#multi-tenant-isolation)。

## 配置容器

### 基于容器的沙箱

在沙箱容器内运行 SDK，以实现进程隔离、资源限制、网络控制和临时文件系统。多家提供商专门提供适合 Agent SDK 模型的沙箱容器环境。

选择提供商时需要回答的问题：

* **谁运行沙箱**：沙箱即服务提供商为您运营基础设施，而自托管选项为您提供自行运行的软件。
* **冷启动延迟**：从“创建沙箱”到“准备好接受第一个请求”需要多长时间。临时模式需要亚秒级启动。长期运行模式可以容忍更长的时间。
* **持久存储**：提供商是否提供持久卷还是仅提供临时磁盘。混合模式需要在某处（沙箱内或旁边）拥有持久存储。
* **定价模式**：按秒、按请求或按小时统一计费。按秒计费适合突发性的临时工作负载。按小时计费适合长期运行的会话。
* **网络**：支持自定义出口规则、出站代理以及用于受监管环境的私有 VPC 对等连接。

待评估的提供商：

* [Modal Sandbox](https://modal.com/docs/guide/sandbox)，附带 [演示实现](https://modal.com/docs/examples/claude-slack-gif-creator)
* [Cloudflare Sandboxes](https://github.com/cloudflare/sandbox-sdk)
* [Daytona](https://www.daytona.io/)
* [E2B](https://e2b.dev/)
* [Fly Machines](https://fly.io/docs/machines/)
* [Vercel Sandbox](https://vercel.com/docs/functions/sandbox)

关于自托管选项（如 Docker、gVisor 和 Firecracker）以及详细的隔离配置，请参阅 [隔离技术](/en/agent-sdk/secure-deployment#isolation-technologies)。

### 运行时依赖

容器仅需您 SDK 的语言运行时：

* Python SDK 需要 Python 3.10+，TypeScript SDK 需要 Node.js 18+
* 两个 SDK 包都捆绑了适用于主机平台的原生 Claude Code 二进制文件，因此生成的 CLI 不需要单独安装 Claude Code 或 Node.js

捆绑的二进制文件与 SDK 包版本绑定，因此更新 SDK 就是更新 CLI 的方式。SDK 遵循语义化版本控制：持续应用补丁版本，并在应用次要版本前查阅 [TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md) 或 [Python](https://github.com/anthropics/claude-agent-sdk-python/blob/main/CHANGELOG.md) 的变更日志。

### 资源

对于一个新启动的实例，每个代理 1 GiB 内存、5 GiB 磁盘和 1 个 CPU 是一个合理的起点。内存使用量会随着会话长度和工具活动而增长，因此请根据您实际需要的会话长度和并发数来规划资源，而不是基于空闲基准。有关如何计算每个主机的代理数量，请参阅 [扩展和并发](#scaling-and-concurrency)。

### 网络

SDK 需要出站 HTTPS 连接到 `api.anthropic.com`，或者在 Bedrock 或 Vertex 上运行时连接到您提供商的区域端点。如果您的代理使用 [MCP 服务器](/en/agent-sdk/mcp) 或外部工具，它们也需要出站访问这些端点。对于生产环境，通过强制实施域白名单、注入凭证和记录请求的出口代理来路由出站流量。有关完整模式，请参阅 [安全部署](/en/agent-sdk/secure-deployment)。

对于入站流量，请在容器上暴露一个 HTTP 或 WebSocket 端口。您的应用程序在该端口上处理客户端请求，并在内部调用 SDK；子进程本身不监听网络。

## 处理生产问题

在部署自托管代理之前，请仔细考虑以下决策。

### 会话和状态持久化

默认的本地磁盘在重启、缩容或迁移到不同节点时会丢失。对于用户期望恢复的任何会话，请使用 [`SessionStore` 适配器](/en/agent-sdk/session-storage) 将对话记录镜像到持久存储。有关 S3、Redis 和 Postgres 适配器以及用于自行实现的合规性套件，请参阅 [参考实现](/en/agent-sdk/session-storage#reference-implementations)。

关于 `SessionStore` 行为的三件事需要了解：

* **仅镜像对话记录**：`SessionStore` 仅镜像对话记录，不镜像 `CLAUDE.md` 记忆文件或其他工作目录工件。请挂载共享卷或单独同步这些文件。
* **镜像，非替换**：子进程首先写入本地磁盘，存储库接收每一批次的副本。本地写入仍然是权威的。
* **`mirror_error` 消息**：如果存储库拒绝或超时，SDK 会发出一条 `{ type: "system", subtype: "mirror_error" }` 消息，并继续查询而不重试。如果存储持久性很重要，请对此类消息设置警报。

### 可观测性

Agent SDK 代理是长时间运行的进程，会在多个 API 往返中生成工具调用。没有遥测数据，您无法看到哪些工具运行了、它们花费了多长时间，或者会话在何处停滞。

SDK 从环境中继承 OpenTelemetry 配置。在容器或编排器级别设置 OTEL 环境变量，以便每次 `query()` 调用都将 span、指标和日志事件导出到您的收集器。以下示例为所有三个信号启用了 OTLP 导出。`CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` 仅对跟踪是必需的；如果您只导出指标和日志，则可以省略它。
```bash title=".env"
CLAUDE_CODE_ENABLE_TELEMETRY=1
CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```
导出默认不包含提示词文本和工具输入。请参阅 [控制导出中的敏感数据](/en/agent-sdk/observability#control-sensitive-data-in-exports) 了解可选标志，并参阅 [可观测性](/en/agent-sdk/observability) 获取完整的信号目录。

### 认证与机密

托管时需关注三个认证要点：

* **Anthropic API**：子进程从其环境读取 `ANTHROPIC_API_KEY`。请从您的密钥管理器中提供，或设置 `ANTHROPIC_BASE_URL` 以通过在容器外注入密钥的代理路由模型调用。有关代理模式，请参阅 [凭证管理](/en/agent-sdk/secure-deployment#credential-management)；有关支持的认证方法，请参阅 [SDK 概述](/en/agent-sdk/overview#get-started)。
* **入站请求**：在代理容器前端的网关处进行认证。代理应接收已预先认证的请求，不应成为验证用户 token 的组件。
* **出站工具**：将工具凭证置于代理环境之外。通过代理路由出站调用，在请求离开容器后注入 API 密钥。代理执行调用；代理添加凭证。

### 扩展与并发

每个会话在其自己的子进程中运行，因此主机上的并发性受限于其内存可容纳的子进程数量。

使用以下公式为主机配置容量：
```text
agents per host = (host RAM - overhead) / (per-session RAM ceiling)
```
通过运行一个符合预期工具负载的目标长度会话来测量每个会话的资源上限，并记录峰值RSS。[资源](#resources)部分提到的1 GiB起始值是下限，而非上限。

水平扩展路由取决于您的模式。对于长期运行的会话（容器承载多个会话的情况），可在负载均衡器后运行容器池，并通过对 `sessionId` 进行一致哈希来将会话固定到特定容器。固定会话将持续命中同一容器，因此也固定在同一运行子进程上，直到会话被驱逐或容器重启。

单一会话中大规模并发[子代理](/en/agent-sdk/subagents)可能触发API速率限制。请将任务拆分为更小批次，而非一次性广泛派发。

### 成本

Anthropic token成本通常比容器基础设施成本高出一个数量级甚至更多。最低配置的容器每小时运行成本约0.05美元，而单次长时间的代理会话可能消耗数美元的token。请参阅[成本跟踪](/en/agent-sdk/cost-tracking)了解按会话计费的token统计。

### 多租户隔离

SDK默认行为从文件系统读取设置和 `CLAUDE.md` 记忆文件。在服务多租户的共享容器中，这些文件可能将一个租户的上下文泄露到另一个租户的会话中。

要在共享容器内隔离租户：

*   在TypeScript中传递 `settingSources: []` 或在Python中传递 `setting_sources=[]`，以避免加载文件系统设置。
*   在 `env` 中设置 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`。`~/.claude/projects/<project>/memory/` 下的[自动记忆](/en/memory#auto-memory)无论如何都会加载到系统提示词中，不受 `settingSources` 控制。请参阅[settingSources 不控制的内容](/en/agent-sdk/claude-code-features#what-settingsources-does-not-control)了解其他无条件加载的输入。
*   将 `CLAUDE_CONFIG_DIR` 指向每个租户的专用目录，确保租户不共享 `~/.claude.json` 全局配置。
*   使用每个租户的工作目录。在每次 `query()` 调用中显式传递 `cwd`。
*   在代理层应用每个租户的出站规则，例如不同的出站IP、凭据或域名白名单，防止受损租户通过其他租户的出站策略窃取数据。

以下示例综合应用了四个SDK级别选项。构造 `tenantDir` 和 `configDir` 以确保每个租户获得其他租户无法读取的路径。在TypeScript中，`env` 会替换子进程环境，因此需展开 `...process.env` 以保留 `PATH` 和 `ANTHROPIC_API_KEY` 等继承变量。在Python中，`env` 会与继承的环境合并。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  declare const prompt: string;
  declare const tenantDir: string;
  declare const configDir: string;

  for await (const message of query({
    prompt,
    options: {
      cwd: tenantDir,
      settingSources: [],
      env: {
        ...process.env,
        CLAUDE_CONFIG_DIR: configDir,
        CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1",
      },
    },
  })) {
    // ...
  }
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  async for message in query(
      prompt=prompt,
      options=ClaudeAgentOptions(
          cwd=tenant_dir,
          setting_sources=[],
          env={
              "CLAUDE_CONFIG_DIR": config_dir,
              "CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1",
          },
      ),
  ):
      ...
  ```

关于租户级别的网络控制，请参阅[安全部署](/en/agent-sdk/secure-deployment)。

## 已知限制

在部署设计时请考虑这些限制因素。

| 限制                                                | 应对措施                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 无顶层会话超时                                      | 会话不会自动超时。在 `Options` 中设置 `maxTurns` 来限制代理在停止前进行的工具使用轮次。                                                                                                                                                                                                     |
| 长会话期间内存增长                                  | 限制会话长度或定期回收子进程。参见[扩展与并发](#扩展与并发)。                                                                                                                                                                                                                                 |
| 大规模并行子代理扇出可能触发速率限制                | 将工作分解为更小的批次，而不是进行一次性大范围分派。                                                                                                                                                                                                                                           |
| 无子代理挂钟截止时间                                | 在每个[子代理](/en/agent-sdk/subagents)的 `AgentDefinition` 中使用 `maxTurns` 进行限制。仅对后台子代理，`CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS` 设置一个停滞监视器，当 `run_in_background` 的子代理停止产生输出时会触发；这并非总运行时间截止时间。 |

## 后续步骤

* [托管实战指南](https://github.com/anthropics/claude-cookbooks/blob/main/claude_agent_sdk/07_Hosting_the_agent.ipynb)：包含可部署代码（用于 Docker、Modal 和 Kubernetes）的笔记本教程。
* [会话存储](/en/agent-sdk/session-storage)：通过 `SessionStore` 适配器在不同主机间持久化对话记录。
* [可观测性](/en/agent-sdk/observability)：将 OTEL 追踪、指标和日志导出到你的收集器。
* [安全部署](/en/agent-sdk/secure-deployment)：网络控制、凭证管理和隔离加固。
* [成本追踪](/en/agent-sdk/cost-tracking)：按会话进行 token 和成本核算。