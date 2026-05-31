> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件在深入探索前发现所有可用页面。

# 通过市场发现并安装预构建插件

> 从市场中查找并安装插件，为 Claude Code 扩展新技能、代理和功能。

插件通过技能、代理、钩子和 MCP 服务器扩展 Claude Code。插件市场是帮助您发现和安装这些扩展的目录，无需自行构建。

希望创建和分发自己的市场？请参阅[创建和分发插件市场](/zh/plugin-marketplaces)。

## 市场如何运作

市场是他人创建和共享的插件目录。使用市场是一个两步过程：


    这将把目录注册到 Claude Code，以便您可以浏览可用内容。目前尚未安装任何插件。



    浏览目录并安装所需插件。


你可以把它想象成增加一个应用商店：添加商店让你能浏览其应用集合，但仍需单独选择要安装哪些应用。

## Anthropic 官方市场

启动 Claude Code 时，Anthropic 官方市场 (`claude-plugins-official`) 会自动可用。运行 `/plugin` 命令并前往 **Discover** 标签页以浏览可用内容，或在 [claude.com/plugins](https://claude.com/plugins) 查看目录。

要从官方市场安装插件，请使用 `/plugin install <name>@claude-plugins-official`。例如，安装 GitHub 集成：
```shell
/plugin install github@claude-plugins-official
```
如果 Claude Code 报告在任何插件市场中都找不到该插件，说明您的插件市场可能缺失或已过时。请运行 `/plugin marketplace update claude-plugins-official` 来刷新它，或者如果尚未添加，则运行 `/plugin marketplace add anthropics/claude-plugins-official`。然后重试安装。

  官方市场由 Anthropic 策划管理，是否收录由 Anthropic 自行决定。应用内的提交表单会将插件添加至[社区市场](#社区市场)，而非官方市场。若要独立分发插件，请[创建您自己的市场](/zh/plugin-marketplaces)并与用户分享。

官方插件市场包含以下几类插件：

### 代码智能插件

代码智能插件能够启用 Claude Code 内置的 LSP 工具，使 Claude 具备在编辑后立即跳转到定义、查找引用以及查看类型错误的能力。这些插件配置了[语言服务器协议](https://microsoft.github.io/language-server-protocol/)连接，与驱动 VS Code 代码智能的技术相同。

这些插件要求您的系统上已安装对应的语言服务器二进制文件。如果您已安装语言服务器，当您打开项目时，Claude 可能会提示您安装相应的插件。

| 语言        | 插件                | 需要的二进制文件               |
| :---------- | :------------------ | :----------------------------- |
| C/C++       | `clangd-lsp`        | `clangd`                       |
| C#          | `csharp-lsp`        | `csharp-ls`                    |
| Go          | `gopls-lsp`         | `gopls`                        |
| Java        | `jdtls-lsp`         | `jdtls`                        |
| Kotlin      | `kotlin-lsp`        | `kotlin-language-server`       |
| Lua         | `lua-lsp`           | `lua-language-server`          |
| PHP         | `php-lsp`           | `intelephense`                 |
| Python      | `pyright-lsp`       | `pyright-langserver`           |
| Rust        | `rust-analyzer-lsp` | `rust-analyzer`                |
| Swift       | `swift-lsp`         | `sourcekit-lsp`                |
| TypeScript  | `typescript-lsp`    | `typescript-language-server`   |

您也可以为其他语言[创建自定义 LSP 插件](/zh/plugins-reference#lsp-servers)。

  如果你在安装插件后在 `/plugin` 错误标签中看到 `Executable not found in $PATH`，请从上表安装所需的二进制文件。

#### 代码智能插件为 Claude 带来的功能

一旦安装代码智能插件且其语言服务器二进制文件可用，Claude 将获得两项能力：

* **自动诊断**：在 Claude 每次编辑文件后，语言服务器会自动分析更改并向后报告错误和警告。Claude 无需运行编译器或 linter 就能看到类型错误、缺少的导入和语法问题。如果 Claude 引入了错误，它会在同一轮次中注意到并修复该问题。除了安装插件外，无需任何配置。当出现“发现诊断”指示时，按 **Ctrl+O** 可以查看内联诊断信息。
* **代码导航**：Claude 可以使用语言服务器跳转到定义、查找引用、悬停查看类型信息、列出符号、查找实现以及追踪调用层级。这些操作为 Claude 提供了比基于 grep 的搜索更精确的导航，不过可用性可能因语言和环境而异。

如果遇到问题，请参阅[代码智能故障排除]。

### 外部集成

这些插件捆绑了预配置的 [MCP 服务器](/zh/mcp)，因此您可以将 Claude 连接到外部服务，无需手动设置：

* **源代码控制**：`github`、`gitlab`
* **项目管理**：`atlassian` (Jira/Confluence)、`asana`、`linear`、`notion`
* **设计**：`figma`
* **基础设施**：`vercel`、`firebase`、`supabase`
* **通信**：`slack`
* **监控**：`sentry`

### 自动安全审查

`security-guidance` 插件会审查 Claude 所做的每项更改，查找常见漏洞，并指导 Claude 在同一会话中修复发现的问题。有关检查内容和如何添加项目特定规则的信息，请参阅[在 Claude 编写代码时捕获安全问题](/zh/security-guidance)。

### 开发工作流

为常见开发任务添加技能和代理的插件：

* **commit-commands**：Git 提交工作流，包括提交、推送和创建 PR
* **pr-review-toolkit**：用于审查拉取请求的专用代理
* **agent-sdk-dev**：使用 Claude Agent SDK 构建的工具
* **plugin-dev**：用于创建您自己插件的工具包

### 输出样式

自定义 Claude 的响应方式：

* **explanatory-output-style**：关于实现选择的教育性见解
* **learning-output-style**：用于技能构建的交互式学习模式

## 社区市场

位于 [`anthropics/claude-plugins-community`](https://github.com/anthropics/claude-plugins-community) 的社区市场托管已通过 Anthropic 自动验证和安全筛选的第三方插件。每个插件在目录中都固定到一个特定的提交 SHA。与官方市场不同，您需要手动添加它：
```shell
/plugin marketplace add anthropics/claude-plugins-community
```
然后使用 `claude-community` 市场名称从中安装插件：
```shell
/plugin install <plugin-name>@claude-community
```
要将您自己的插件提交到社区市场，请参阅创建插件指南中的[将插件提交到社区市场](/zh/plugins#submit-your-plugin-to-the-community-marketplace)。

## 尝试一下：添加演示市场

Anthropic 还维护着一个[演示插件市场](https://github.com/anthropics/claude-code/tree/main/plugins)（`claude-code-plugins`），其中包含展示插件系统功能的示例插件。与官方市场不同，您需要手动添加此市场。


    在 Claude Code 内部，为 `anthropics/claude-code` 仓库运行 `plugin marketplace add` 命令：
    ```shell
    /plugin marketplace add anthropics/claude-code
    ```
    这会下载市场目录并使其中的插件可供您使用。



    运行 `/plugin` 打开插件管理器。这将打开一个带有四个标签页的界面，您可以使用 **Tab** 键（或 **Shift+Tab** 向后）切换浏览：

    * **发现**：浏览来自所有市场的可用插件
    * **已安装**：查看和管理您已安装的插件
    * **市场**：添加、移除或更新您已添加的市场
    * **错误**：查看任何插件加载错误

    转到 **发现** 标签页以查看您刚添加的市场中的插件。标记为与您当前工作目录相关的插件会被置顶，并带有 **为此目录建议** 标签。



    选择一个插件以查看详情。详情面板会显示插件包含的内容及其成本：

    * 一项**上下文成本**估算，让你了解该插件在每轮对话中会为你的[上下文窗口](/zh/features-overview#understand-context-costs)增加多少 token（Claude Code v2.1.143 及更高版本）
    * 插件的**最后更新时间**（v2.1.144 及更高版本）
    * 一个**将安装**部分，列出该插件的命令、代理、技能、钩子以及 MCP 和 LSP 服务器，以便你在安装前能准确了解它添加的内容（v2.1.145 及更高版本）

    选择一个安装范围：

    * **用户范围**：为你自己安装，适用于所有项目
    * **项目范围**：为此仓库的所有协作者安装
    * **本地范围**：仅在此仓库中为你自己安装

    例如，选择 **commit-commands**（一个添加 git 工作流技能的插件），并将其安装到你的用户范围。

    你也可以直接从命令行安装：
    ```shell
    /plugin install commit-commands@claude-code-plugins
    ```
    参见[配置作用域](/zh/settings#configuration-scopes)了解有关作用域的更多信息。



    安装完成后，请运行斜杠命令 `/reload-plugins` 以激活插件。插件技能以插件名作为命名空间，因此 **commit-commands** 会提供如斜杠命令 `/commit-commands:commit` 这样的技能。

    您可以尝试修改文件并运行以下命令来体验：
    ```
    ```shell
    /commit-commands:commit
    ```
    此操作会暂存你的更改，生成提交信息，并创建提交。

    每个插件的工作方式不同。查看 **Discover** 标签页中插件的详情，了解其提供的命令和技能，或访问其主页获取使用指南。


本指南的剩余部分将涵盖添加市场、安装插件以及管理配置的所有方法。

## 添加市场

使用 `添加 / 插件市场` 命令从不同来源添加市场。

  **快捷方式**：您可以使用 `/plugin market` 代替 `/plugin marketplace`，使用 `rm` 代替 `remove`。

* **GitHub 仓库**：`owner/repo` 格式（例如，`anthropics/claude-code`）
* **Git URL**：任何 Git 仓库 URL（GitLab、Bitbucket、自建服务）
* **本地路径**：目录或直接指向 `marketplace.json` 文件的路径
* **远程 URL**：指向托管 `marketplace.json` 文件的直接 URL

### 从 GitHub 添加

添加一个包含 `.claude-plugin/marketplace.json` 文件的 GitHub 仓库，使用 `owner/repo` 格式——其中 `owner` 是 GitHub 用户名或组织，`repo` 是仓库名称。

例如，`anthropics/claude-code` 指的是由 `anthropics` 所拥有的 `claude-code` 仓库。
```shell
/plugin marketplace add anthropics/claude-code
```
### 从其他 Git 主机添加

通过提供完整 URL 来添加任何 Git 仓库。这适用于任何 Git 主机，包括 GitLab、Bitbucket 和自托管服务器。请包含 `.git` 后缀，这样 Claude Code 将会克隆该仓库，而不是将 URL 视为指向已托管的 `marketplace.json` 文件的直接链接。

使用 HTTPS：
```shell
/plugin marketplace add https://gitlab.com/company/plugins.git
```
使用SSH：
```shell
/plugin marketplace add git@gitlab.com:company/plugins.git
```
要添加特定分支或标签，请附加`#`后跟引用名称：
```shell
/plugin marketplace add https://gitlab.com/company/plugins.git#v1.0.0
```
### 从本地路径添加

添加一个包含 `.claude-plugin/marketplace.json` 文件的本地目录：
```shell
/plugin marketplace add ./my-marketplace
```
您也可以为 `marketplace.json` 文件添加一个直接路径：
```shell
/plugin marketplace add ./path/to/marketplace.json
```
### 从远程 URL 添加

通过 URL 添加一个远程的 `marketplace.json` 文件：
```shell
/plugin marketplace add https://example.com/marketplace.json
```


  与Git型市场相比，URL型市场有一些限制。如果您在安装插件时遇到"路径未找到"错误，请参阅[故障排除](/zh/plugin-marketplaces#plugins-with-relative-paths-fail-in-url-based-marketplaces)。

## 安装插件

添加市场后，您可以直接安装插件（默认安装到用户范围）：
```shell
/plugin install plugin-name@marketplace-name
```
要选择不同的[安装范围](/zh/settings#configuration-scopes)，请使用交互式界面：运行`/plugin`，切换到**Discover**选项卡，在插件上按**Enter**。您将看到以下选项：

* **用户范围**（默认）：为个人所有项目安装
* **项目范围**：为此仓库的所有协作者安装（将添加到`.claude/settings.json`）
* **本地范围**：仅为此仓库的个人安装（不与协作者共享）

您可能还会看到具有**托管**范围的插件——这些由管理员通过[托管设置](/zh/settings#settings-files)安装，无法修改。

  在安装插件前请确保信任该插件。Anthropic 无法控制插件中包含的 MCP 服务器、文件或其他软件，也无法保证其按预期工作。请查阅各插件的官方主页获取更多信息。

## 管理已安装的插件

运行 `/plugin` 并转到 **Installed** 标签页，以查看、启用、禁用或卸载你的插件。列表按作用域分组并排序，因此你会首先看到问题：出现加载错误或未解决依赖的插件会显示在顶部，其次是你的收藏夹，被禁用的插件则折叠在底部一个可展开的标题下。

从列表中你可以：

* 按 `f` 键收藏或取消收藏所选插件
* 输入以按插件名称或描述进行筛选
* 按 Enter 键打开插件的详情视图，并启用、禁用或卸载它

当你安装一个声明了依赖项的插件时，安装输出会列出哪些依赖项随其自动安装。

你也可以通过直接命令管理插件。

禁用插件而不卸载：
```shell
/plugin disable plugin-name@marketplace-name
```
重新启用已禁用的插件：
```shell
/plugin enable plugin-name@marketplace-name
```
完全移除一个插件：
```shell
/plugin uninstall plugin-name@marketplace-name
```
`--scope`选项允许你针对特定的作用范围使用CLI命令：
```shell
claude plugin install formatter@your-org --scope project
claude plugin uninstall formatter@your-org --scope project
```
### 应用插件更改无需重启

当您在会话期间安装、启用或禁用插件时，运行 `/reload-plugins` 即可应用所有更改，无需重启：
```shell
/reload-plugins
```
Claude Code 会重新加载所有活动插件，并显示插件、技能、代理、钩子、插件 MCP 服务器和插件 LSP 服务器的计数。

## 管理市场

您可以通过交互式 `/plugin` 界面或使用 CLI 命令来管理市场。

### 使用交互式界面

运行 `/plugin` 并转到 **市场** 标签页以：

* 查看所有已添加的市场及其来源和状态
* 添加新市场
* 更新市场列表以获取最新的插件
* 移除不再需要的市场

### 使用 CLI 命令

您也可以使用直接命令管理市场。

列出所有已配置的市场：
```shell
/plugin marketplace list
```
从市场刷新插件列表：
```shell
/plugin marketplace update marketplace-name
```
移除市场：
```shell
/plugin marketplace remove marketplace-name
```


  移除应用市场将卸载您从中安装的所有插件。

### 配置自动更新

Claude Code 可以在启动时自动更新市场及其已安装的插件。当为某个市场启用自动更新后，Claude Code 会刷新该市场数据并更新已安装的插件至最新版本。如果任何插件被更新，您将看到一个通知，提示您运行 `/reload-plugins`。

通过用户界面为单个市场切换自动更新：

1.  运行 `/plugin` 打开插件管理器
2.  选择 **市场**
3.  从列表中选择一个市场
4.  选择 **启用自动更新** 或 **禁用自动更新**

Anthropic 官方市场默认启用自动更新。第三方和本地开发市场默认禁用自动更新。

管理员还可以在管理设置中的每个 [`extraKnownMarketplaces`](/zh/settings#extraknownmarketplaces) 条目上设置 `"autoUpdate": true`，以无需每个用户手动切换即为组织市场启用自动更新。

要完全禁用 Claude Code 和所有插件的所有自动更新，请设置 `DISABLE_AUTOUPDATER` 环境变量。详见[自动更新](/zh/setup#auto-updates)。

要在禁用 Claude Code 自动更新的同时保持插件自动更新启用，请设置 `FORCE_AUTOUPDATE_PLUGINS=1` 并同时设置 `DISABLE_AUTOUPDATER`：
```bash
export DISABLE_AUTOUPDATER=1
export FORCE_AUTOUPDATE_PLUGINS=1
```
当你希望手动管理 Claude Code 更新但仍想接收自动插件更新时，此功能非常有用。

## 配置团队市场

团队管理员可以通过在 `.claude/settings.json` 中添加市场配置来为项目设置自动的市场安装。当团队成员信任该仓库文件夹时，Claude Code 会提示他们安装这些市场和插件。

在你项目的 `.claude/settings.json` 中添加 `extraKnownMarketplaces`：
```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```
有关完整配置选项（包括 `extraKnownMarketplaces` 和 `enabledPlugins`），请参阅 [插件设置](/zh/settings#plugin-settings)。

## 安全性

插件和市场是高度可信的组件，可以以您的用户权限在您的机器上执行任意代码。请仅从您信任的来源安装插件和添加市场。组织可以使用 [托管市场限制](/zh/plugin-marketplaces#managed-marketplace-restrictions) 来限制用户允许添加哪些市场。

## 故障排除

### /plugin 命令未识别

如果看到“未知命令”或 `/plugin` 命令未出现：

1.  **检查您的版本**：运行 `claude --version` 查看已安装的版本。
2.  **更新 Claude Code**：
    *   **Homebrew**：`brew upgrade claude-code`（如果您安装的是该 cask，则使用 `brew upgrade claude-code@latest`）
    *   **npm**：`npm install -g @anthropic-ai/claude-code@latest`
    *   **原生安装程序**：重新运行 [设置](/zh/setup) 中的安装命令。
3.  **重启 Claude Code**：更新后，重启终端并再次运行 `claude`。

### 常见问题

*   **市场无法加载**：验证 URL 是否可访问，并且路径下存在 `.claude-plugin/marketplace.json`。
*   **插件安装失败**：检查插件源 URL 是否可访问，并且仓库是公开的（或您有权访问）。
*   **安装后找不到文件**：插件被复制到缓存中，因此引用插件目录外部文件的路径将无法工作。
*   **插件技能未出现**：使用 `rm -rf ~/.claude/plugins/cache` 清除缓存，重启 Claude Code，然后重新安装插件。

有关详细的故障排除解决方案，请参阅市场指南中的 [故障排除](/zh/plugin-marketplaces#troubleshooting)。关于调试工具，请参阅 [调试和开发工具](/zh/plugins-reference#debugging-and-development-tools)。

### 代码智能问题

*   **语言服务器未启动**：验证二进制文件已安装并在您的 `$PATH` 中可用。检查 `/plugin` 的错误选项卡了解详情。
*   **高内存使用率**：像 `rust-analyzer` 和 `pyright` 这样的语言服务器在大型项目上可能会消耗大量内存。如果遇到内存问题，使用 `/plugin disable <plugin-name>` 禁用插件，并转而依赖 Claude 的内置搜索工具。
*   **在 monorepo 中出现误报诊断**：如果工作区未正确配置，语言服务器可能会报告内部包的未解析导入错误。这些不影响 Claude 编辑代码的能力。

## 后续步骤

*   **构建您自己的插件**：请参阅 [插件](/zh/plugins) 来创建技能、代理和钩子。
*   **创建市场**：请参阅 [创建插件市场](/zh/plugin-marketplaces) 来将插件分发给您的团队或社区。
*   **技术参考**：请参阅 [插件参考](/zh/plugins-reference) 获取完整规范。