> ## 文档索引
> 在以下地址获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在进一步探索之前发现所有可用页面。

# SDK 中的插件

> 通过 Agent SDK 加载自定义插件，为 Claude Code 扩展技能、代理、钩子和 MCP 服务器

插件允许您扩展 Claude Code 的自定义功能，并可在不同项目间共享。通过 Agent SDK，您可以从本地目录以编程方式加载插件，为代理会话添加技能、代理、钩子和 MCP 服务器。

## 什么是插件？

插件是 Claude Code 扩展的包，可包含：

* **技能**：Claude 自主使用的模型调用能力（也可通过 `/skill-name` 调用）
* **代理**：用于特定任务的专用子代理
* **钩子**：响应工具使用和其他事件的事件处理器
* **MCP 服务器**：通过模型上下文协议进行的外部工具集成

  `commands/` 目录是一种旧格式。新插件请使用 `skills/`。Claude Code 会继续支持这两种格式以确保向后兼容性。

有关插件结构及如何创建插件的完整信息，请参阅[插件](/zh/plugins)。

## 加载插件

通过在选项配置中提供本地文件系统路径来加载插件。`type` 字段必须设为 `"local"`，这是 SDK 接受的唯一值。若要使用通过[市场](/zh/plugin-marketplaces)或远程仓库分发的插件，请先下载并提供本地目录路径。SDK 支持从不同位置加载多个插件。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Hello",
    options: {
      plugins: [
        { type: "local", path: "./my-plugin" },
        { type: "local", path: "/absolute/path/to/another-plugin" }
      ]
    }
  })) {
    // Plugin commands, agents, and other features are now available
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions


  async def main():
      async for message in query(
          prompt="Hello",
          options=ClaudeAgentOptions(
              plugins=[
                  {"type": "local", "path": "./my-plugin"},
                  {"type": "local", "path": "/absolute/path/to/another-plugin"},
              ]
          ),
      ):
          # Plugin commands, agents, and other features are now available
          pass


  asyncio.run(main())
  ```

### 路径规范

插件路径可以是：

* **相对路径**：相对于当前工作目录解析（例如，`"./plugins/my-plugin"`）
* **绝对路径**：完整的文件系统路径（例如，`"/home/user/plugins/my-plugin"`）

  插件的路径应指向其根目录（即包含 `.claude-plugin/plugin.json` 的目录）。

## 验证插件安装

当插件加载成功时，它们会出现在系统初始化消息中。您可以验证您的插件是否可用：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Hello",
    options: {
      plugins: [{ type: "local", path: "./my-plugin" }]
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      // Check loaded plugins
      console.log("Plugins:", message.plugins);
      // Example: [{ name: "my-plugin", path: "./my-plugin" }]

      // Plugin skills appear with the plugin name as a prefix
      console.log("Skills:", message.skills);
      // Example: ["my-plugin:greet"]

      // Plugin commands use the same prefix, and skills appear here too
      console.log("Commands:", message.slash_commands);
      // Example: ["compact", "context", "my-plugin:custom-command", "my-plugin:greet"]
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


  async def main():
      async for message in query(
          prompt="Hello",
          options=ClaudeAgentOptions(
              plugins=[{"type": "local", "path": "./my-plugin"}]
          ),
      ):
          if isinstance(message, SystemMessage) and message.subtype == "init":
              # Check loaded plugins
              print("Plugins:", message.data.get("plugins"))
              # Example: [{"name": "my-plugin", "path": "./my-plugin"}]

              # Plugin skills appear with the plugin name as a prefix
              print("Skills:", message.data.get("skills"))
              # Example: ["my-plugin:greet"]

              # Plugin commands use the same prefix, and skills appear here too
              print("Commands:", message.data.get("slash_commands"))
              # Example: ["compact", "context", "my-plugin:custom-command", "my-plugin:greet"]


  asyncio.run(main())
  ```

## 使用插件技能

插件中的技能会自动以插件名称进行命名空间化以避免冲突。要直接调用某个技能，请将 `/plugin-name:skill-name` 作为提示词发送。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Load a plugin with a custom /greet skill
  for await (const message of query({
    prompt: "/my-plugin:greet", // Use plugin skill with namespace
    options: {
      plugins: [{ type: "local", path: "./my-plugin" }]
    }
  })) {
    // Claude executes the custom greeting skill from the plugin
    if (message.type === "assistant") {
      console.log(message.message.content);
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock


  async def main():
      # Load a plugin with a custom /greet skill
      async for message in query(
          prompt="/demo-plugin:greet",  # Use plugin skill with namespace
          options=ClaudeAgentOptions(
              plugins=[{"type": "local", "path": "./plugins/demo-plugin"}]
          ),
      ):
          # Claude executes the custom greeting skill from the plugin
          if isinstance(message, AssistantMessage):
              for block in message.content:
                  if isinstance(block, TextBlock):
                      print(f"Claude: {block.text}")


  asyncio.run(main())
  ```



  如果您通过 CLI 安装了插件（例如 `/plugin install my-plugin@marketplace`），您仍然可以在 SDK 中通过提供其安装路径来使用它。请查看 `~/.claude/plugins/` 目录以找到通过 CLI 安装的插件。

## 完整示例

这是一个展示插件加载和使用的完整示例：

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";
  import * as path from "path";

  async function runWithPlugin() {
    const pluginPath = path.join(__dirname, "plugins", "my-plugin");

    console.log("Loading plugin from:", pluginPath);

    for await (const message of query({
      prompt: "What custom commands do you have available?",
      options: {
        plugins: [{ type: "local", path: pluginPath }],
        maxTurns: 3
      }
    })) {
      if (message.type === "system" && message.subtype === "init") {
        console.log("Loaded plugins:", message.plugins);
        console.log("Available skills:", message.skills);
        console.log("Available commands:", message.slash_commands);
      }

      if (message.type === "assistant") {
        console.log("Assistant:", message.message.content);
      }
    }
  }

  runWithPlugin().catch(console.error);
  ```

  ```python Python
  #!/usr/bin/env python3
  """Example demonstrating how to use plugins with the Agent SDK."""

  from pathlib import Path
  import anyio
  from claude_agent_sdk import (
      AssistantMessage,
      ClaudeAgentOptions,
      SystemMessage,
      TextBlock,
      query,
  )


  async def run_with_plugin():
      """Example using a custom plugin."""
      plugin_path = Path(__file__).parent / "plugins" / "demo-plugin"

      print(f"Loading plugin from: {plugin_path}")

      options = ClaudeAgentOptions(
          plugins=[{"type": "local", "path": str(plugin_path)}],
          max_turns=3,
      )

      async for message in query(
          prompt="What custom commands do you have available?", options=options
      ):
          if isinstance(message, SystemMessage) and message.subtype == "init":
              print(f"Loaded plugins: {message.data.get('plugins')}")
              print(f"Available skills: {message.data.get('skills')}")
              print(f"Available commands: {message.data.get('slash_commands')}")

          if isinstance(message, AssistantMessage):
              for block in message.content:
                  if isinstance(block, TextBlock):
                      print(f"Assistant: {block.text}")


  if __name__ == "__main__":
      anyio.run(run_with_plugin)
  ```

## 插件结构参考

插件目录必须包含一个 `.claude-plugin/plugin.json` 清单文件。它可以可选包含：
```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Required: plugin manifest
├── skills/                   # Agent Skills (invoked autonomously or via /skill-name)
│   └── my-skill/
│       └── SKILL.md
├── commands/                 # Legacy: use skills/ instead
│   └── custom-cmd.md
├── agents/                   # Custom agents
│   └── specialist.md
├── hooks/                    # Event handlers
│   └── hooks.json
└── .mcp.json                # MCP server definitions
```
如需获取创建插件的详细信息，请参阅：

* [插件](/zh/plugins) - 完整的插件开发指南
* [插件参考](/zh/plugins-reference) - 技术规范与数据结构

## 常见用例

### 开发和测试

在开发期间无需全局安装即可加载插件：
```typescript
plugins: [{ type: "local", path: "./dev-plugins/my-plugin" }];
```
### 项目特定扩展

将插件包含在您的项目仓库中，以确保团队一致性：
```typescript
plugins: [{ type: "local", path: "./project-plugins/team-workflows" }];
```
### 多插件来源

组合来自不同位置的插件：
```typescript
plugins: [
  { type: "local", path: "./local-plugin" },
  { type: "local", path: "~/.claude/custom-plugins/shared-plugin" }
];
```
## 故障排除

### 插件未加载

如果插件未出现在初始化消息中：

1. **检查路径**：确保路径指向插件根目录（包含 `.claude-plugin/`）
2. **验证 plugin.json**：确保清单文件具有有效的 JSON 语法
3. **检查文件权限**：确保插件目录可读

### 技能未显示

如果插件技能不工作：

1. **使用命名空间**：以 `/plugin-name:skill-name` 格式调用插件技能
2. **检查初始化消息**：确认技能出现在 `skills` 列表中并具有正确的命名空间
3. **验证技能文件**：确保每个技能在其 `skills/` 下的子目录中都有一个 `SKILL.md` 文件，例如 `skills/my-skill/SKILL.md`

### 路径解析问题

如果相对路径不工作：

1. **检查工作目录**：相对路径从当前工作目录解析
2. **使用绝对路径**：为确保可靠性，考虑使用绝对路径
3. **规范化路径**：使用路径工具正确构建路径

## 另请参阅

* [插件](/zh/plugins) - 完整的插件开发指南
* [插件参考](/zh/plugins-reference) - 技术规范
* [命令](/zh/agent-sdk/slash-commands) - 在 SDK 中使用命令
* [子代理](/zh/agent-sdk/subagents) - 与专用代理协作
* [技能](/zh/agent-sdk/skills) - 使用 Agent 技能