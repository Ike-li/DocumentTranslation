> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 在 Slack 中使用 Claude Code

> 直接从 Slack 工作区委派编码任务

在 Slack 中使用 Claude Code 将 Claude Code 的强大功能直接带入你的 Slack 工作区。当你在提及 `@Claude` 并附带编码任务时，Claude 会自动检测意图并在网页端创建 Claude Code 会话，让你无需离开团队对话即可委派开发工作。

此集成基于现有的 Claude for Slack 应用构建，但增加了智能路由功能，将编码相关请求路由到网页端的 Claude Code。

## 使用场景

* **Bug 调查与修复**：在 Slack 频道中报告 Bug 后，立即请求 Claude 进行调查和修复。
* **快速代码审查与修改**：让 Claude 根据团队反馈实现小功能或重构代码。
* **协作调试**：当团队讨论提供了关键上下文（例如错误复现或用户报告）时，Claude 可以利用这些信息来指导其调试方法。
* **并行任务执行**：在 Slack 中启动编码任务，同时继续其他工作，完成后接收通知。

## 前置条件

使用 Slack 中的 Claude Code 之前，请确保满足以下条件：

| 要求                   | 详情                                                                                            |
| :--------------------- | :---------------------------------------------------------------------------------------------- |
| Claude 订阅计划        | Pro、Max、Team 或 Enterprise，且具有 Claude Code 访问权限（高级席位或 Chat + Claude Code 席位） |
| 网页端 Claude Code     | 必须启用 [网页端 Claude Code](/zh/claude-code-on-the-web) 的访问权限                            |
| GitHub 账户            | 已连接到网页端 Claude Code，且至少有一个仓库已完成认证                                           |
| Slack 认证             | 你的 Slack 账户已通过 Claude 应用与 Claude 账户关联                                              |

## 设置 Slack 中的 Claude Code

1. **在 Slack 中安装 Claude 应用**

   工作区管理员必须从 Slack 应用市场安装 Claude 应用。访问 [Slack 应用市场](https://slack.com/marketplace/A08SF47R6P4) 并点击"Add to Slack"开始安装流程。

2. **连接你的 Claude 账户**

   应用安装完成后，认证你的个人 Claude 账户：

   1. 在 Slack 的应用区域中点击"Claude"打开 Claude 应用
   2. 导航到 App Home 标签页
   3. 点击"Connect"将你的 Slack 账户与 Claude 账户关联
   4. 在浏览器中完成认证流程

3. **配置网页端 Claude Code**

   确保你的网页端 Claude Code 已正确配置：

   * 访问 [claude.ai/code](https://claude.ai/code) 并使用与 Slack 关联的同一账户登录
   * 如果尚未连接，请连接你的 GitHub 账户
   * 认证至少一个你希望 Claude 使用的仓库

4. **选择路由模式**

   连接账户后，配置 Claude 在 Slack 中处理消息的方式。导航到 Slack 中的 Claude App Home 查找 **路由模式** 设置。

   | 模式            | 行为                                                                                                                                                                                                                                 |
   | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Code only**   | Claude 将所有 @mention 路由到 Claude Code 会话。适合专门在 Slack 中使用 Claude 进行开发任务的团队。                                                                                                                                   |
   | **Code + Chat** | Claude 分析每条消息并智能路由到 Claude Code（用于编码任务）或 Claude Chat（用于写作、分析和一般问题）。适合希望通过单一 @Claude 入口处理所有类型工作的团队。                                                                            |

   在 Code + Chat 模式下，如果 Claude 将消息路由到 Chat 但你需要编码会话，可以点击"Retry as Code"来创建 Claude Code 会话。同样，如果路由到 Code 但你需要 Chat 会话，可以在该线程中选择该选项。

5. **将 Claude 添加到频道**

   安装后 Claude 不会自动添加到任何频道。要在某个频道中使用 Claude，请在该频道中输入 `/invite @Claude` 进行邀请。Claude 只能在已添加的频道中响应 @mention。

## 工作原理

### 自动检测

当你在 Slack 频道或线程中提及 @Claude 时，Claude 会自动分析你的消息以判断是否为编码任务。如果检测到编码意图，Claude 会将请求路由到网页端的 Claude Code，而不是作为普通聊天助手回复。

你也可以明确告诉 Claude 将请求作为编码任务处理，即使它没有自动检测到。

Slack 中的 Claude Code 仅在频道（公开或私有）中有效。不适用于私信（DM）。

### 上下文收集

**从线程中**：当你在线程中 @mention Claude 时，它会收集该线程中所有消息的上下文，以理解完整的对话。

**从频道中**：当直接在频道中提及时，Claude 会查看频道的近期消息以获取相关上下文。

这些上下文帮助 Claude 理解问题、选择合适的仓库，并指导其完成任务的方法。

当在 Slack 中调用 @Claude 时，Claude 可以访问对话上下文以更好地理解你的请求。Claude 可能会遵循上下文中其他消息的指示，因此用户应确保仅在受信任的 Slack 对话中使用 Claude。

### 会话流程

1. **发起**：你 @mention Claude 并附带编码请求
2. **检测**：Claude 分析你的消息并检测编码意图
3. **会话创建**：在 claude.ai/code 上创建新的 Claude Code 会话
4. **进度更新**：Claude 在工作进行中向你的 Slack 线程发布状态更新
5. **完成**：完成后，Claude @mention 你并附带摘要和操作按钮
6. **审查**：点击"View Session"查看完整记录，或点击"Create PR"创建拉取请求

## 用户界面元素

### App Home

App Home 标签页显示你的连接状态，并允许你连接或断开 Claude 账户与 Slack 的关联。

### 消息操作

* **View Session**：在浏览器中打开完整的 Claude Code 会话，你可以查看所有执行的工作、继续会话或提出额外请求。
* **Create PR**：直接从会话的更改中创建拉取请求。
* **Retry as Code**：如果 Claude 最初以聊天助手方式回复但你需要编码会话，点击此按钮将请求作为 Claude Code 任务重试。
* **Change Repo**：如果 Claude 选择了错误的仓库，允许你选择其他仓库。

### 仓库选择

Claude 根据 Slack 对话的上下文自动选择仓库。如果可能匹配多个仓库，Claude 可能会显示下拉菜单让你选择正确的仓库。

## 访问与权限

### 用户级别访问

| 访问类型             | 要求                                                        |
| :------------------- | :---------------------------------------------------------- |
| Claude Code 会话     | 每个用户在自己的 Claude 账户下运行会话                      |
| 用量与速率限制       | 会话计入个人用户的订阅计划限制                              |
| 仓库访问             | 用户只能访问其个人连接的仓库                                |
| 会话历史             | 会话出现在 claude.ai/code 的 Claude Code 历史记录中         |

### 工作区级别访问

Slack 工作区管理员控制 Claude 应用是否在其工作区中可用：

| 控制项                     | 描述                                                                                                    |
| :------------------------- | :------------------------------------------------------------------------------------------------------ |
| 应用安装                   | 工作区管理员决定是否从 Slack 应用市场安装 Claude 应用                                                   |
| Enterprise Grid 分发       | 对于 Enterprise Grid 组织，组织管理员可以控制哪些工作区可以访问 Claude 应用                             |
| 应用移除                   | 从工作区移除应用会立即撤销该工作区所有用户的访问权限                                                    |

### 基于频道的访问控制

安装后 Claude 不会自动添加到任何频道。用户必须明确邀请 Claude 到他们想要使用的频道：

* **需要邀请**：在任何频道中输入 `/invite @Claude` 将 Claude 添加到该频道
* **频道成员资格控制访问**：Claude 只能在已添加的频道中响应 @mention
* **通过频道进行访问限制**：管理员可以通过管理 Claude 被邀请到哪些频道以及谁有权访问这些频道来控制谁使用 Claude Code
* **支持私有频道**：Claude 在公开和私有频道中均可工作，为团队提供控制可见性的灵活性

这种基于频道的模型允许团队将 Claude Code 的使用限制在特定频道中，在工作区级别权限之外提供额外的访问控制层。

## 各端可访问内容

**在 Slack 中**：你会看到状态更新、完成摘要和操作按钮。完整记录被保留且始终可访问。

**在网页端**：完整的 Claude Code 会话，包含完整的对话历史、所有代码更改、文件操作，以及继续会话或创建拉取请求的能力。

对于 Enterprise 和 Team 账户，从 Slack 中的 Claude 创建的会话会自动对组织可见。详见 [网页端 Claude Code 会话共享](/zh/claude-code-on-the-web#share-sessions)。

## 最佳实践

### 编写有效的请求

* **具体明确**：在相关时包含文件名、函数名或错误消息。
* **提供上下文**：如果从对话中不明显，请提及仓库或项目。
* **定义成功标准**：说明"完成"是什么样子——Claude 是否应该编写测试？更新文档？创建 PR？
* **使用线程**：在讨论 Bug 或功能时在线程中回复，以便 Claude 收集完整上下文。

### 何时使用 Slack 与网页端

**使用 Slack 的场景**：上下文已存在于 Slack 讨论中，你想异步启动任务，或与需要可见性的团队成员协作。

**直接使用网页端的场景**：需要上传文件、希望在开发过程中进行实时交互，或处理较长、较复杂的任务。

## 故障排除

### 会话无法启动

1. 验证你的 Claude 账户已在 Claude App Home 中连接
2. 检查你是否已启用网页端 Claude Code 访问权限
3. 确保你至少有一个 GitHub 仓库已连接到 Claude Code

### 仓库未显示

1. 在网页端 [claude.ai/code](https://claude.ai/code) 的 Claude Code 中连接仓库
2. 验证你对该仓库的 GitHub 权限
3. 尝试断开并重新连接你的 GitHub 账户

### 选择了错误的仓库

1. 点击"Change Repo"按钮选择其他仓库
2. 在请求中包含仓库名称以获得更准确的选择

### 认证错误

1. 在 App Home 中断开并重新连接你的 Claude 账户
2. 确保你在浏览器中登录了正确的 Claude 账户
3. 检查你的 Claude 订阅计划是否包含 Claude Code 访问权限

### 会话过期

1. 会话在网页端的 Claude Code 历史记录中仍然可访问
2. 你可以从 [claude.ai/code](https://claude.ai/code) 继续或引用过去的会话

## 当前限制

* **仅支持 GitHub**：目前仅支持 GitHub 上的仓库。
* **每次会话一个 PR**：每个会话只能创建一个拉取请求。
* **速率限制适用**：会话使用你个人 Claude 订阅计划的速率限制。
* **需要网页访问权限**：用户必须拥有网页端 Claude Code 访问权限；没有该权限的用户将只获得标准 Claude 聊天回复。

## 相关资源

<CardGroup>
  <Card title="网页端 Claude Code" icon="globe" href="/zh/claude-code-on-the-web">
    了解更多关于网页端 Claude Code
  </Card>

  <Card title="Claude for Slack" icon="slack" href="https://claude.com/claude-and-slack">
    Claude for Slack 通用文档
  </Card>

  <Card title="Slack 应用市场" icon="store" href="https://slack.com/marketplace/A08SF47R6P4">
    从 Slack 市场安装 Claude 应用
  </Card>

  <Card title="Claude 帮助中心" icon="circle-question" href="https://support.claude.com">
    获取更多支持
  </Card>
</CardGroup>
