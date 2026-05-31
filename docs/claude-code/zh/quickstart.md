> ## 文档索引
> 完整文档索引请访问：https://code.claude.com/docs/llms.txt
> 使用此文件可发现所有可用页面，再进行深入探索。

# 快速入门

> 欢迎使用 Claude Code！

本快速入门指南将帮助您在几分钟内开始使用AI编程辅助。阅读完毕后，您将了解如何运用Claude Code处理常见的开发任务。

## 开始之前

请确保您已具备：

* 一个已打开的终端或命令提示符
  * 如果您从未使用过终端，请查阅[终端使用指南](/en/终端指南)
* 一个可操作的代码项目
* [Claude订阅](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=quickstart_prereq)（Pro、Max、Team或Enterprise版本）、[Claude控制台](https://console.anthropic.com/)账户，或通过[支持的云服务商](/en/third-party-integrations)获得访问权限

  本指南涵盖终端命令行。Claude Code 也可在[网页版](https://claude.ai/code)、[桌面应用程序](/en/desktop)、[VS Code](/en/vs-code) 和 [JetBrains IDE](/en/jetbrains) 中使用，支持 [Slack](/en/slack) 集成，并可通过 [GitHub Actions](/en/github-actions) 和 [GitLab](/en/gitlab-ci-cd) 集成至 CI/CD 流程。查看[所有可用界面](/en/overview#use-claude-code-everywhere)。

## 步骤 1：安装 Claude Code

要安装 Claude Code，请使用以下任一方法：


    **macOS、Linux、WSL：**
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```
    **Windows PowerShell：**
    ```powershell
    irm https://claude.ai/install.ps1 | iex
    ```
    **Windows CMD:**
    ```batch
    curl -L https://claude.ai/install.sh -o install-claude-code.bat && call install-claude-code.bat
    ```
    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```
    如果你看到 `The token '&&' is not a valid statement separator`，说明你正在 PowerShell 环境中，而非 CMD。如果你看到 `'irm' is not recognized as an internal or external command`，则说明你正在 CMD 环境中，而非 PowerShell。当你在 PowerShell 中时，提示符会显示 `PS C:\`，而在 CMD 中则只显示 `C:\` 且没有 `PS`。

    在原生 Windows 系统上，推荐安装 [Git for Windows](https://git-scm.com/downloads/win)，这样 Claude Code 就可以使用 Bash 工具。如果未安装 Git for Windows，Claude Code 将会使用 PowerShell 作为 Shell 工具。WSL 环境不需要安装 Git for Windows。

      原生安装会在后台自动更新，以确保您始终使用最新版本。




    ```bash
    brew install --cask claude-code
    ```
    Homebrew 提供两种安装包。`claude-code` 追踪稳定发布渠道，该渠道通常会滞后约一周，并跳过存在重大回归问题的版本。`claude-code@latest` 追踪最新发布渠道，新版本发布后立即获得。

      Homebrew 安装不会自动更新。请根据您安装的 cask 版本运行 `brew upgrade claude-code` 或 `brew upgrade claude-code@latest`，以获取最新功能和安全修复。




    ```powershell
    winget install Anthropic.ClaudeCode
    ```


      WinGet 安装不会自动更新。请定期运行 `winget upgrade Anthropic.ClaudeCode` 以获取最新功能和安全修复。



您也可以在Debian、Fedora、RHEL和Alpine系统上通过 [apt, dnf 或 apk](/en/setup#install-with-linux-package-managers) 安装。

## 步骤二：登录您的账户

使用Claude Code需要账户。通过 `claude` 命令启动一个交互式会话，首次使用时会提示您登录：
```bash
claude
```
对于Claude订阅账户或Console账户，请在浏览器中按照提示完成认证。若需后续切换账户或重新认证，请在运行中的会话内输入 `/login`：
```text
/login
```
您可以使用以下任意账户类型登录：

* [Claude Pro、Max、Team 或 Enterprise](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=quickstart_login)（推荐）
* [Claude Console](https://console.anthropic.com/)（使用预付费额度的API访问）。首次登录时，系统会自动在 Console 中创建一个“Claude Code”工作区，用于集中成本跟踪。
* [Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry](/en/third-party-integrations)（企业级云服务提供商）

登录后，您的凭据将被保存，无需再次登录。

## 步骤 3：开始您的首次会话

在任意项目目录下打开终端，并启动 Claude Code：
```bash
cd /path/to/your/project
claude
```
您将看到Claude Code的欢迎界面，其中包含您的会话信息、最近对话和最新更新。输入 `/help` 查看可用命令，或输入 `/resume` 继续之前的对话。

  登录后（步骤 2），您的凭据会存储在您的系统上。更多信息请参阅[凭据管理](/en/authentication#credential-management)。

## 第四步：提出你的第一个问题

让我们从理解你的代码库开始。尝试以下命令之一：
```text
what does this project do?
```
Claude 将分析您的文件并提供摘要。您也可以提出更具体的问题：
```text
what technologies does this project use?
```

```text
where is the main entry point?
```

```text
explain the folder structure
```
此外，您可以向Claude询问其自身能力。
```text
what can Claude Code do?
```

```text
how do I create custom skills in Claude Code?
```

```text
can Claude Code work with Docker?
```


  Claude Code 根据需要读取项目文件。您无需手动添加上下文。

## 第五步：进行首次代码更改

现在让我们让 Claude Code 编写一些实际的代码。尝试一个简单的任务：
```text
add a hello world function to the main file
```
Claude Code 将：

1. 查找相关文件
2. 向您展示建议的修改
3. 征求您的批准
4. 执行编辑

  Claude Code 在修改文件前总会请求权限。您可以逐个批准更改，或为会话启用“全部接受”模式。

## 步骤 6：在 Claude Code 中使用 Git

Claude Code 让 Git 操作变得对话化：
```text
what files have I changed?
```

```text
commit my changes with a descriptive message
```
你也可以提示词进行更复杂的 Git 操作：
```text
create a new branch called feature/quickstart
```

```text
show me the last 5 commits
```

```text
help me resolve merge conflicts
```
## 步骤 7：修复错误或添加功能

Claude 擅长调试和功能实现。

请用自然语言描述您的需求：
```text
add input validation to the user registration form
```
或修复现有问题：
```text
there's a bug where users can submit empty forms - fix it
```
Claude Code 将会：

* 定位相关代码
* 理解上下文
* 实现解决方案
* 如有可用测试则运行测试

## 步骤 8: 尝试其他常见工作流程

有多种方式可以与 Claude 协作：

**重构代码**
```text
refactor the authentication module to use async/await instead of callbacks
```
**编写测试**
```text
write unit tests for the calculator functions
```
**更新文档**
```text
update the README with installation instructions
```
**代码审查**
```text
review my changes and suggest improvements
```


  像与一位有用的同事交谈一样与 Claude 交流。描述你想实现的目标，它会帮助你达成。

## 基础命令

以下是日常使用中最重要的一些命令：

| 命令                | 功能                                            | 示例                                |
| ------------------- | ----------------------------------------------- | ----------------------------------- |
| `claude`            | 启动交互模式                                    | `claude`                            |
| `claude "task"`     | 运行一次性任务                                  | `claude "fix the build error"`      |
| `claude -p "query"` | 运行一次性查询，然后退出                        | `claude -p "explain this function"` |
| `claude -c`         | 在当前目录中继续最近一次对话                    | `claude -c`                         |
| `claude -r`         | 恢复之前的对话                                  | `claude -r`                         |
| `/clear`            | 清空对话历史                                    | `/clear`                            |
| `/help`             | 显示可用命令                                    | `/help`                             |
| `exit` 或 Ctrl+D    | 退出 Claude Code                                | `exit`                              |

查看[命令行参考](/en/cli-reference)获取完整的命令列表。

## 给新手的实用技巧

更多内容，请参见[最佳实践](/en/best-practices)和[常见工作流](/en/common-workflows)。


    改为："修复登录 bug，即用户输入错误凭据后看到白屏"



    将复杂任务分解为步骤：

    1.  **分析规划**：首先明确最终目标，识别任务的核心组成部分，并将其拆解为一系列更小、更易于管理的子任务或里程碑。
    2.  **分步执行**：按顺序或优先级逐一处理这些子任务。每个步骤应专注于达成一个明确的、可衡量的结果。
    3.  **验证调整**：在完成每个主要步骤后，检查结果是否符合预期。根据需要进行调整，确保整体任务朝正确方向推进。
    ```text
    1. create a new database table for user profiles
    2. create an API endpoint to get and update user profiles
    3. build a webpage that allows users to see and edit their information
    ```



    在进行修改之前，请让Claude理解您的代码：
    ```text
    analyze the database schema
    ```

    ```text
    build a dashboard showing products that are most frequently returned by our UK customers
    ```



    * 输入 `/` 查看所有命令和技能
    * 使用 Tab 进行命令补全
    * 按 ↑ 浏览命令历史
    * 按 `Shift+Tab` 切换权限模式


## 下一步做什么？

现在你已经掌握了基础，探索更多高级功能：


    理解代理循环、内置工具以及 Claude Code 如何与您的项目交互



    ## 通过有效提示词和正确设置项目获得更好结果



    常见任务的逐步指南



    # 使用 CLAUDE.md、技能、钩子、MCP 等进行自定义


## 获取帮助

* **在 Claude Code 中**：输入 `/help` 或提问"如何..."
* **文档**：您正在这里！浏览其他指南
* **社区**：加入我们的 [Discord](https://www.anthropic.com/discord) 获取技巧与支持