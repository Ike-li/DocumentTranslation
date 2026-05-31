> ## 文档索引
> 获取完整文档索引请访问：https://code.claude.com/docs/llms.txt
> 在进一步探索之前，请使用此文件了解所有可用页面。

# 迁移至 Claude Agent SDK

> 将 Claude Code TypeScript 和 Python SDK 迁移至 Claude Agent SDK 的指南

## 概述

Claude Code SDK 已更名为 **Claude Agent SDK**，其文档也已重组。此变更反映了该 SDK 在构建超越单纯编码任务的 AI 智能体方面更广泛的能力。

## 有何变化

| 方面                     | 旧版                        | 新版                             |
| :----------------------- | :-------------------------- | :------------------------------- |
| **包名称 (TS/JS)**       | `@anthropic-ai/claude-code` | `@anthropic-ai/claude-agent-sdk` |
| **Python 包**            | `claude-code-sdk`           | `claude-agent-sdk`               |
| **文档位置**             | Claude Code 文档            | API 指南 → Agent SDK 部分        |

  **文档变更：** Agent SDK 文档已从 Claude Code 文档迁移至 API 指南下的专门部分 [Agent SDK](/en/agent-sdk/overview)。Claude Code 文档现在专注于 CLI 工具和自动化功能。

## 迁移步骤

### 针对 TypeScript/JavaScript 项目

**1. 卸载旧包：**
```bash
npm uninstall @anthropic-ai/claude-code
```
**2. 安装新包：**
```bash
npm install @anthropic-ai/claude-agent-sdk
```
**3. 更新您的导入：**

将所有导入从 `@anthropic-ai/claude-code` 更改为 `@anthropic-ai/claude-agent-sdk`：
```typescript
// Before
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-code";

// After
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
```
**4. 更新 package.json 依赖项：**

如果你的 `package.json` 中列出了该包，请进行更新：

之前：
```json
{
  "dependencies": {
    "@anthropic-ai/claude-code": "^0.0.42"
  }
}
```
之后：
```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.0"
  }
}
```
就是这样！不需要进行其他代码修改。

### 针对 Python 项目

**1. 卸载旧包：**
```bash
pip uninstall claude-code-sdk
```
**2. 安装新包：**
```bash
pip install claude-agent-sdk
```
**3. 更新导入语句：**

将所有从 `claude_code_sdk` 到 `claude_agent_sdk` 的导入语句进行更新：
```python
# Before
from claude_code_sdk import query, ClaudeCodeOptions

# After
from claude_agent_sdk import query, ClaudeAgentOptions
```
**4. 更新类型名称：**

将 `ClaudeCodeOptions` 更改为 `ClaudeAgentOptions`：
```python
# Before
from claude_code_sdk import query, ClaudeCodeOptions

options = ClaudeCodeOptions(model="claude-opus-4-7")

# After
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(model="claude-opus-4-7")
```
**5. 审查[破坏性变更](#breaking-changes)**

完成迁移所需的代码更改。

  为提升隔离性和显式配置，Claude Agent SDK v0.1.0 为从 Claude Code SDK 迁移的用户引入了重大变更。请在迁移前仔细阅读本节内容。

### Python: ClaudeCodeOptions 重命名为 ClaudeAgentOptions

**变更内容：** Python SDK 中的类型 `ClaudeCodeOptions` 已重命名为 `ClaudeAgentOptions`。

**迁移步骤：**
```python
# BEFORE (claude-code-sdk)
from claude_code_sdk import query, ClaudeCodeOptions

options = ClaudeCodeOptions(model="claude-opus-4-7", permission_mode="acceptEdits")

# AFTER (claude-agent-sdk)
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(model="claude-opus-4-7", permission_mode="acceptEdits")
```
**之所以更改：** 现在类型名称与"Claude Agent SDK"品牌保持一致，并统一了SDK的命名规范。

### 系统提示词不再作为默认值

**变更内容：** SDK现在默认不再使用Claude Code的系统提示词。

**迁移：**

  ```typescript TypeScript
  // BEFORE (v0.0.x) - Used Claude Code's system prompt by default
  const result = query({ prompt: "Hello" });

  // AFTER (v0.1.0) - Uses minimal system prompt by default
  // To get the old behavior, explicitly request Claude Code's preset:
  const result = query({
    prompt: "Hello",
    options: {
      systemPrompt: { type: "preset", preset: "claude_code" }
    }
  });

  // Or use a custom system prompt:
  const result = query({
    prompt: "Hello",
    options: {
      systemPrompt: "You are a helpful coding assistant"
    }
  });
  ```

  ```python Python
  # BEFORE (v0.0.x) - Used Claude Code's system prompt by default
  async for message in query(prompt="Hello"):
      print(message)

  # AFTER (v0.1.0) - Uses minimal system prompt by default
  # To get the old behavior, explicitly request Claude Code's preset:
  from claude_agent_sdk import query, ClaudeAgentOptions

  async for message in query(
      prompt="Hello",
      options=ClaudeAgentOptions(
          system_prompt={"type": "preset", "preset": "claude_code"}  # Use the preset
      ),
  ):
      print(message)

  # Or use a custom system prompt:
  async for message in query(
      prompt="Hello",
      options=ClaudeAgentOptions(system_prompt="You are a helpful coding assistant"),
  ):
      print(message)
  ```

**变更原因：** 为SDK应用程序提供更好的控制和隔离性。您现在可以构建具有自定义行为的代理，而无需继承Claude Code专注于CLI的指令。

### 设置源默认值

此默认值在v0.1.0中曾短暂更改，随后已恢复，因此无需进行迁移操作。

**当前行为：** 在`query()`中省略`settingSources`会加载用户、项目和本地文件系统设置，与CLI行为一致。这包括`~/.claude/settings.json`、`.claude/settings.json`、`.claude/settings.local.json`、CLAUDE.md文件和自定义命令。

要隔离于文件系统设置运行，请传入一个空数组：

  ```typescript TypeScript
  const result = query({
    prompt: "Hello",
    options: {
      settingSources: [] // No filesystem settings loaded
    }
  });

  // Or load only specific sources:
  const result = query({
    prompt: "Hello",
    options: {
      settingSources: ["project"] // Only project settings
    }
  });
  ```

  ```python Python
  from claude_agent_sdk import query, ClaudeAgentOptions

  async for message in query(
      prompt="Hello",
      options=ClaudeAgentOptions(setting_sources=[]),  # No filesystem settings loaded
  ):
      print(message)

  # Or load only specific sources:
  async for message in query(
      prompt="Hello",
      options=ClaudeAgentOptions(
          setting_sources=["project"]  # Only project settings
      ),
  ):
      print(message)
  ```

隔离性尤为重要，因为它涉及CI/CD流水线、已部署的应用程序、测试环境以及多租户系统，这些场景中不应让本地自定义设置泄露进入。

  SDK v0.1.0 曾短暂地默认不加载任何设置；此行为在后续版本中已恢复。Python SDK 0.1.59 及更早版本将空列表视为与省略该选项相同，因此在依赖 `setting_sources=[]` 前请先升级。有关即使 `settingSources` 设置为 `[]` 仍会被读取的输入项，请参阅 [What settingSources does not control](/en/agent-sdk/claude-code-features#what-settingsources-does-not-control)。

## 更名原因

Claude Code SDK 最初为编码任务设计，但现已演变为用于构建各类 AI 代理的强大框架。新名称 "Claude Agent SDK" 更能体现其功能范围：

*   构建业务代理（法律助手、财务顾问、客户支持）
*   创建专业编码代理（SRE 机器人、安全审查员、代码审查代理）
*   开发适用于任何领域的自定义代理，支持工具使用、MCP 集成等

## 获取帮助

若在迁移过程中遇到问题：

**针对 TypeScript/JavaScript：**

1.  检查所有导入是否已更新为使用 `@anthropic-ai/claude-agent-sdk`
2.  确认 `package.json` 中包含新包名
3.  运行 `npm install` 以确保依赖已更新

**针对 Python：**

1.  检查所有导入是否已更新为使用 `claude_agent_sdk`
2.  确认 `requirements.txt` 或 `pyproject.toml` 中包含新包名
3.  运行 `pip install claude-agent-sdk` 以确保已安装该包

## 后续步骤

*   查阅 [Agent SDK 概览](/en/agent-sdk/overview) 了解可用功能
*   查看 [TypeScript SDK 参考文档](/en/agent-sdk/typescript) 获取详细的 API 文档
*   查阅 [Python SDK 参考文档](/en/agent-sdk/python) 获取 Python 专属文档
*   了解[自定义工具](/en/agent-sdk/custom-tools) 和 [MCP 集成](/en/agent-sdk/mcp)