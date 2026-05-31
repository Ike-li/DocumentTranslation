> ## 文档索引
> 获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件可发现所有可用页面，然后再进行深入探索。

# 在网页上使用 Claude Code

> 配置云环境、设置脚本、网络访问以及在 Anthropic 的沙箱中设置 Docker。使用 `--remote` 和 `--teleport` 在网页和终端之间转移会话。

  Claude Code 网页端目前处于研究预览阶段，面向 Pro、Max 和 Team 用户，以及拥有高级席位或 Chat + Claude Code 席位的企业用户开放。

Claude Code 网页版在 [claude.ai/code](https://claude.ai/code) 地址基于 Anthropic 托管的云基础设施运行任务。会话在您关闭浏览器后仍会保持，您可以通过 Claude 移动应用进行监控。

  初次接触网页版 Claude Code？请先查看[入门指南](/en/web-quickstart)以连接您的 GitHub 账户并提交第一个任务。

本页涵盖：

* [GitHub 认证选项](#github-authentication-options)：两种连接 GitHub 的方式
* [云端环境](#the-cloud-environment)：哪些配置会保留、预装了哪些工具，以及如何配置环境
* [设置脚本](#setup-scripts)与依赖管理
* [网络访问](#network-access)：访问级别、代理与默认允许列表
* [在网页端与终端间迁移任务](#move-tasks-between-web-and-terminal)：使用 `--remote` 和 `--teleport` 参数
* [处理会话](#work-with-sessions)：查看、共享、归档、删除
* [自动修复 Pull Request](#auto-fix-pull-requests)：自动响应 CI 失败与评审意见
* [安全与隔离](#security-and-isolation)：会话如何实现隔离
* [限制](#limitations)：速率限制与平台约束

## GitHub 认证选项

云端会话需要访问您的 GitHub 仓库以克隆代码和推送分支。您可以通过两种方式授权：

| 方法             | 工作原理                                                                                   | 适用场景                                                               |
| :--------------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **GitHub App**   | 在[网页端引导流程](/en/web-quickstart)中授权 Claude GitHub App。                           | 浏览器引导场景；希望使用[自动修复](#auto-fix-pull-requests)功能的团队 |
| **`/web-setup`** | 在终端运行 `/web-setup` 命令，将本地 `gh` CLI 的令牌同步至您的 Claude 账户。              | 已在使用 `gh` CLI 的个人开发者                                         |

  无论使用哪种方法，云会话均可访问连接 GitHub 账户能看到的所有仓库，而不仅限于安装了 Claude GitHub App 的仓库。应用安装仅用于启用 [Auto-fix](#auto-fix-pull-requests) 的 PR 网络钩子，并非会话级别的访问控制。若要限制团队通过云会话可访问的仓库范围，请直接在 GitHub 上进行权限设置，例如限制已连接 GitHub 账户的团队成员身份或仓库成员权限。

两种方式均可。[`/schedule`](/en/routines) 会检查两种访问方式，如果均未配置，会提示您运行 `/web-setup`。关于 `/web-setup` 的操作指南，请参阅[从终端连接](/en/web-quickstart#connect-from-your-terminal)。

GitHub App 是[自动修复](#auto-fix-pull-requests)功能所必需的，该功能通过此 App 接收 PR webhook。若您通过 `/web-setup` 连接，之后又需要自动修复功能，请在相关仓库安装该 App。

团队和企业管理员可在 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 页面的“快速 Web 设置”开关处禁用 `/web-setup`。

  启用了[零数据保留](/en/zero-data-retention)功能的组织无法使用 `/web-setup` 或其他云会话功能。

## 云环境

每个会话都运行在一个全新的、由 Anthropic 管理的虚拟机中，并克隆了你的仓库。本节介绍了会话启动时可用的内容以及如何进行自定义。

### 云会话中的可用内容

云会话从你仓库的全新克隆开始。任何已提交到仓库的内容都是可用的。任何仅在你本地机器上安装或配置的内容则不可用。

| | 云会话中可用 | 原因 |
| :--- | :--- | :--- |
| 你仓库的 `CLAUDE.md` | 是 | 克隆的一部分 |
| 你仓库的 `.claude/settings.json` 钩子 | 是 | 克隆的一部分 |
| 你仓库的 `.mcp.json` MCP 服务器 | 是 | 克隆的一部分 |
| 你仓库的 `.claude/rules/` | 是 | 克隆的一部分 |
| 你仓库的 `.claude/skills/`、`.claude/agents/`、`.claude/commands/` | 是 | 克隆的一部分 |
| 在 `.claude/settings.json` 中声明的插件 | 是 | 在会话开始时从你声明的[市场](/en/plugin-marketplaces)安装。需要网络访问以连接市场源 |
| 你的用户 `~/.claude/CLAUDE.md` | 否 | 存放在你的本地机器上，不在仓库中 |
| 仅在用户设置中启用的插件 | 否 | 用户作用域的 `enabledPlugins` 存放在 `~/.claude/settings.json` 中。应改为在仓库的 `.claude/settings.json` 中声明它们 |
| 使用 `claude mcp add` 添加的 MCP 服务器 | 否 | 这些命令会写入你的本地用户配置，而不是仓库。应在 [`.mcp.json`](/en/mcp#project-scope) 中声明服务器 |
| 静态 API 令牌和凭据 | 否 | 尚无专用的密钥存储。详见下文 |
| 交互式认证（如 AWS SSO） | 否 | 不支持。SSO 需要基于浏览器的登录，无法在云会话中运行 |

要使配置在云会话中可用，请将其提交到仓库。目前尚无专用的密钥存储。环境变量和设置脚本都存储在环境配置中，任何有权编辑该环境的人都可以看到。如果你需要在云会话中使用密钥，请将其作为环境变量添加，并注意其可见性。

### 已安装的工具

云会话预先安装了常用的语言运行时、构建工具和数据库。下表按类别概述了包含的内容。

| 类别 | 已包含 |
| :--- | :--- |
| **Python** | Python 3.x（包含 pip、poetry、uv、black、mypy、pytest、ruff） |
| **Node.js** | 通过 nvm 提供的 20、21 和 22 版本（包含 npm、yarn、pnpm、bun¹、eslint、prettier、chromedriver） |
| **Ruby** | 3.1、3.2、3.3（包含 gem、bundler、rbenv） |
| **PHP** | 8.4（包含 Composer） |
| **Java** | OpenJDK 21（包含 Maven 和 Gradle） |
| **Go** | 最新稳定版（支持模块） |
| **Rust** | rustc 和 cargo |
| **C/C++** | GCC、Clang、cmake、ninja、conan |
| **Docker** | docker、dockerd、docker compose |
| **数据库** | PostgreSQL 16、Redis 7.0 |
| **实用工具** | git、jq、yq、ripgrep、tmux、vim、nano |

¹ Bun 已安装，但在获取包时存在已知的[代理兼容性问题](#install-dependencies-with-a-sessionstart-hook)。

要获取确切版本，请在云会话中让 Claude 运行 `check-tools`。此命令仅存在于云会话中。

### 处理 GitHub 问题和拉取请求

云会话包含内置的 GitHub 工具，允许 Claude 读取问题、列出拉取请求、获取差异和发布评论，无需任何设置。这些工具通过 [GitHub 代理](#github-proxy)进行认证，使用你在 [GitHub 认证选项](#github-authentication-options)下配置的方法，因此你的令牌不会进入容器。

`gh` 命令行工具未预装。如果你需要使用内置工具未涵盖的 `gh` 命令，例如 `gh release` 或 `gh workflow run`，请自行安装并进行认证。


    在[安装脚本](#setup-scripts)中添加 `apt update && apt install -y gh`。



    在[环境设置](#configure-your-environment)中添加一个 `GH_TOKEN` 环境变量，并设置为 GitHub 个人访问令牌。`gh` 会自动读取 `GH_TOKEN`，因此无需 `gh auth login` 步骤。


### 将工件链接回会话

每个云端会话在 claude.ai 上都有一个记录 URL，且会话可以通过 `CLAUDE_CODE_REMOTE_SESSION_ID` 环境变量读取自身的 ID。利用此 ID 可在 PR 正文、提交信息、Slack 帖子或生成的报告中放入可追溯的链接，以便审阅者能直接打开产生这些内容的运行记录。

该变量的值使用 `cse_` 前缀，而记录 URL 路径则采用相同的 ID 但使用 `session_` 前缀。构建链接时需替换此前缀。以下命令可打印该 URL：
```bash
echo "https://claude.ai/code/${CLAUDE_CODE_REMOTE_SESSION_ID/#cse_/session_}"
```
### 运行测试、启动服务和添加包

Claude 在处理任务时会运行测试。您可以在提示词中要求它执行，例如“修复 `tests/` 中失败的测试”或“每次更改后运行 pytest”。像 pytest、jest 和 cargo test 这样的测试运行程序预装后即可开箱即用。

PostgreSQL 和 Redis 预装但默认不运行。您可以要求 Claude 在会话期间分别启动它们：
```bash
service postgresql start
```

```bash
service redis-server start
```
Docker 可用于运行容器化服务。要求 Claude 运行 `docker compose up` 即可启动项目的服务。拉取镜像的网络访问权限遵循您环境的[访问级别](#access-levels)，且[可信默认配置](#default-allowed-domains)包含 Docker Hub 及其他常用注册表。

如果镜像体积较大或拉取缓慢，请将 `docker compose pull` 或 `docker compose build` 添加到[设置脚本](#setup-scripts)中。拉取的镜像会保存在[缓存环境](#environment-caching)中，因此每个新会话在磁盘上都有这些镜像。缓存仅存储文件，不保存运行中的进程，因此 Claude 仍需在每次会话中启动容器。

要添加未预装的软件包，请使用[设置脚本](#setup-scripts)。脚本的输出会被[缓存](#environment-caching)，因此在其中安装的软件包可在每次会话开始时直接使用，无需重复安装。您也可以要求 Claude 在会话中途中安装软件包，但这些安装不会延续到其他会话。

### 资源限制

云会话运行时具有可能随时间变化的近似资源上限：

* 4 个 vCPU
* 16 GB 内存
* 30 GB 磁盘

需要显著更多内存的任务（例如大型构建作业或内存密集型测试）可能会失败或被终止。对于超出这些限制的工作负载，请使用[远程控制](/en/remote-control)在您自己的硬件上运行 Claude Code。

### 配置您的环境

环境控制[网络访问](#network-access)、环境变量以及在会话开始前运行的[设置脚本](#setup-scripts)。请参阅[已安装工具](#installed-tools)了解无需任何配置即可使用的工具。您可以通过网络界面或终端管理环境：

| 操作                             | 方法                                                                                                                                                                                                                      |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 添加环境                         | 选择当前环境以打开选择器，然后选择 **添加环境**。对话框包含名称、网络访问级别、环境变量和设置脚本。                                                                                                            |
| 编辑环境                         | 选择显示当前环境名称的云图标以打开选择器，将鼠标悬停在某个环境上，然后单击右侧出现的设置图标。                                                                                                                     |
| 归档环境                         | 打开环境进行编辑，然后选择 **归档**。已归档的环境会从选择器中隐藏，但现有会话会继续运行。                                                                                          |
| 设置 `--remote` 的默认值 | 在终端中运行 `/remote-env`。如果您只有一个环境，此命令会显示当前配置。`/remote-env` 仅选择默认值；请通过网络界面添加、编辑和归档环境。 |

环境变量使用 `.env` 格式，每行一个 `KEY=value` 对。不要在值周围添加引号，因为引号会作为值的一部分存储。
```text
NODE_ENV=development
LOG_LEVEL=debug
DATABASE_URL=postgres://localhost:5432/myapp
```
## 设置脚本

设置脚本是在新的云会话启动时、Claude Code 启动之前运行的 Bash 脚本。使用设置脚本来安装依赖项、配置工具，或获取会话所需但未预装的任何内容。

脚本以 root 用户身份在 Ubuntu 24.04 上运行，因此 `apt install` 和大多数语言包管理器均可使用。

要添加设置脚本，请打开环境设置对话框，并在 **Setup script** 字段中输入您的脚本。

此示例安装了未预装的 `gh` CLI：
```bash
#!/bin/bash
apt update && apt install -y gh
```
如果脚本以非零值退出，会话将无法启动。在非关键命令后追加 `|| true`，可避免间歇性安装失败导致会话阻塞。

请将脚本总运行时间控制在大约五分钟内，以便[环境缓存](#environment-caching)能够建立。使用 `&` 和 `wait` 并行执行独立的安装任务。如果单个下载无法在五分钟限制内完成，请将其移至[会话启动钩子](#setup-scripts-vs-sessionstart-hooks)中后台启动。

  安装软件包的脚本需要网络访问权限以连接仓库。默认的**受信任**网络访问允许连接至[常见包仓库](#default-allowed-domains)，包括 npm、PyPI、RubyGems 和 crates.io。如果您的环境使用**无**网络访问权限，脚本将无法安装软件包。

### 环境缓存

设置脚本会在您首次在环境中启动会话时运行。完成运行后，Anthropic 会创建文件系统的快照，并将其重用为后续会话的起点。新会话启动时，您的依赖项、工具和 Docker 镜像已预先存在于磁盘上，设置脚本步骤将被跳过。这确保了即使脚本安装了大型工具链或拉取容器镜像，启动速度依然很快。

缓存捕获的是文件，而非正在运行的进程。设置脚本写入磁盘的任何内容都会被保留。它启动的服务或容器不会被保留，因此请通过要求 Claude 或使用[会话开始钩子](#setup-scripts-vs-sessionstart-hooks)在每个会话中启动它们。

当您更改环境的设置脚本或允许的网络主机，以及缓存大约在七天后达到过期时间时，设置脚本会重新运行以重建缓存。恢复现有会话时不会重新运行设置脚本。

您无需自行启用缓存或管理快照。

### 设置脚本与会话开始钩子

使用设置脚本来安装云环境需要但您本地笔记本已具备的东西，例如语言运行时或 CLI 工具。使用[会话开始钩子](/en/hooks#sessionstart)进行应在所有环境（云环境和本地）运行的项目设置，例如 `npm install`。

两者都在会话开始时运行，但它们属于不同的位置：

|               | 设置脚本                                                                                     | 会话开始钩子                                                  |
| ------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 附加到        | 云环境                                                                                       | 您的仓库                                                       |
| 配置位置      | 云环境 UI                                                                                    | 您仓库中的 `.claude/settings.json`                             |
| 运行时机      | Claude Code 启动前，且无[缓存环境](#environment-caching)可用时 | Claude Code 启动后，包括恢复的会话在内的每次会话 |
| 作用范围      | 仅限云环境                                                                                   | 本地和云环境均适用                                             |

会话开始钩子也可以在您本地的用户级 `~/.claude/settings.json` 中定义，但用户级设置不会同步到云会话。在云环境中，只有提交到仓库的钩子才会运行。

### 使用会话开始钩子安装依赖项

若要仅在云会话中安装依赖项，请在您仓库的 `.claude/settings.json` 中添加一个会话开始钩子：
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh"
          }
        ]
      }
    ]
  }
}
```
在 `scripts/install_pkgs.sh` 创建脚本，并使用 `chmod +x` 将其设置为可执行。在云会话中，环境变量 `CLAUDE_CODE_REMOTE` 已设置为 `true`，因此您可以使用它来跳过本地执行：
```bash
#!/bin/bash

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

npm install
pip install -r requirements.txt
exit 0
```
SessionStart 钩子在云会话中存在一些限制：

* **无纯云端作用域**：钩子在本地和云端会话中均会运行。如需跳过本地执行，请按上文所示检查 `CLAUDE_CODE_REMOTE` 环境变量。
* **需要网络访问**：安装命令需要连接包注册表。若您的环境使用 **None** 网络访问级别，这些钩子将失败。**Trusted** 级别的[默认允许列表](#default-allowed-domains)涵盖了 npm、PyPI、RubyGems 和 crates.io。
* **代理兼容性**：所有出站流量均通过[安全代理](#security-proxy)。部分包管理器与此代理存在兼容性问题，Bun 即为已知案例。
* **增加启动延迟**：钩子会在每次会话启动或恢复时运行，这与可受益于[环境缓存](#environment-caching)的设置脚本不同。通过检查依赖项是否已存在再行安装，可保持安装脚本高效运行。

若要为后续的 Bash 命令持久化环境变量，请写入 `$CLAUDE_ENV_FILE` 文件。详情请参阅 [SessionStart 钩子](/en/hooks#sessionstart)。

目前尚不支持将基础镜像替换为您自定义的 Docker 镜像。请使用设置脚本在[提供的镜像](#installed-tools)基础上安装所需内容，或通过 `docker compose` 将您的镜像作为容器与 Claude 并行运行。

## 网络访问

网络访问控制云环境的出站连接。每个环境指定一个访问级别，您可通过自定义允许域名进行扩展。默认级别为 **Trusted**，允许包注册表及其他[已列入白名单的域名](#default-allowed-domains)。

如需更改环境的网络访问设置，请[打开编辑界面](#configure-your-environment)并在对话框中使用 **Network access** 选择器。没有单独的“环境”页面。云图标会出现在您启动云会话或配置[例程](/en/routines#environments-and-network-access)的任何位置。

  MCP 连接器的流量通过 Anthropic 的服务器进行路由，因此你在会话或例行程序中启用的连接器无需将这些主机添加到 **Allowed domains** 即可正常工作。连接器按会话或例行程序配置；移除任何不需要的连接器，以限制 Claude 可访问的工具范围。此功能依赖于 [安全与隔离](#security-and-isolation) 部分提到的同一 Anthropic 绑定通道。

### 访问级别

创建或编辑环境时选择一个访问级别：

| 级别       | 出站连接                                                                         |
| :---------- | :------------------------------------------------------------------------------------------- |
| **无**    | 无出站网络访问权限                                                                   |
| **受信任** | 仅允许[默认允许的域名](#default-allowed-domains)：软件包注册表、GitHub、云SDK |
| **完全**    | 任何域名                                                                                   |
| **自定义**  | 您自己的允许列表，可选择包含默认域名                                        |

GitHub 操作使用独立于此设置的[单独代理](#github-proxy)。

### 允许特定域名

要允许不在受信任列表中的域名，请在环境的网络访问设置中选择**自定义**。将出现一个**允许的域名**字段。每行输入一个域名：
```text
api.example.com
*.internal.example.com
registry.example.com
```
使用 `*` 进行通配符子域名匹配。勾选 **同时包含默认常用包管理器列表** 以在自定义条目旁保留[可信域名](#default-allowed-domains)，或取消勾选仅允许您列出的域名。

### GitHub 代理

出于安全考虑，所有 GitHub 操作均通过专用代理服务进行，该服务透明处理所有 git 交互。在沙箱内，git 客户端使用自定义构建的范围限定凭据进行身份验证。此代理：

*   安全管理 GitHub 身份验证：git 客户端在沙箱内使用范围限定凭据，代理验证该凭据并将其转换为您的实际 GitHub 身份验证令牌
*   为安全起见，限制 git 推送操作仅针对当前工作分支
*   启用克隆、获取和拉取请求操作，同时维护安全边界

### 安全代理

环境运行在 HTTP/HTTPS 网络代理之后，以确保安全和防止滥用。所有出站互联网流量都通过此代理，它提供：

*   防止恶意请求
*   速率限制和滥用预防
*   内容过滤以增强安全性

### 默认允许的域名

使用 **可信** 网络访问时，默认允许以下域名。标有 `*` 的域名表示通配符子域名匹配，因此 `*.gcr.io` 允许 `gcr.io` 的任何子域名。


    * api.anthropic.com
    * statsig.anthropic.com
    * docs.claude.com
    * platform.claude.com
    * code.claude.com
    * claude.ai



    * github.com
    * [www.github.com](http://www.github.com)
    * api.github.com
    * npm.pkg.github.com
    * raw.githubusercontent.com
    * pkg-npm.githubusercontent.com
    * objects.githubusercontent.com
    * release-assets.githubusercontent.com
    * codeload.github.com
    * avatars.githubusercontent.com
    * camo.githubusercontent.com
    * gist.github.com
    * gitlab.com
    * [www.gitlab.com](http://www.gitlab.com)
    * registry.gitlab.com
    * bitbucket.org
    * [www.bitbucket.org](http://www.bitbucket.org)
    * api.bitbucket.org



    * registry-1.docker.io
    * auth.docker.io
    * index.docker.io
    * hub.docker.com
    * [www.docker.com](http://www.docker.com)
    * production.cloudflare.docker.com
    * download.docker.com
    * gcr.io
    * \*.gcr.io
    * ghcr.io
    * mcr.microsoft.com
    * \*.data.mcr.microsoft.com
    * public.ecr.aws



    * cloud.google.com
    * accounts.google.com
    * gcloud.google.com
    * \*.googleapis.com
    * storage.googleapis.com
    * compute.googleapis.com
    * container.googleapis.com
    * azure.com
    * portal.azure.com
    * microsoft.com
    * [www.microsoft.com](http://www.microsoft.com)
    * \*.microsoftonline.com
    * packages.microsoft.com
    * dotnet.microsoft.com
    * dot.net
    * visualstudio.com
    * dev.azure.com
    * \*.amazonaws.com
    * \*.api.aws
    * oracle.com
    * [www.oracle.com](http://www.oracle.com)
    * java.com
    * [www.java.com](http://www.java.com)
    * java.net
    * [www.java.net](http://www.java.net)
    * download.oracle.com
    * yum.oracle.com



    * npmjs.org注册表
    * [www.npmjs.com](http://www.npmjs.com)
    * [www.npmjs.org](http://www.npmjs.org)
    * npmjs.com
    * npmjs.org
    * yarnpkg.com
    * yarnpkg.com注册表



    * pypi.org
    * [www.pypi.org](http://www.pypi.org)
    * files.pythonhosted.org
    * pythonhosted.org
    * test.pypi.org
    * pypi.python.org
    * pypa.io
    * [www.pypa.io](http://www.pypa.io)



    * rubygems.org
    * [www.rubygems.org](http://www.rubygems.org)
    * api.rubygems.org
    * index.rubygems.org
    * ruby-lang.org
    * [www.ruby-lang.org](http://www.ruby-lang.org)
    * rubyforge.org
    * [www.rubyforge.org](http://www.rubyforge.org)
    * rubyonrails.org
    * [www.rubyonrails.org](http://www.rubyonrails.org)
    * rvm.io
    * get.rvm.io



    * crates.io
    * [crates.io网站](http://www.crates.io)
    * crates.io索引
    * crates.io静态资源
    * rustup.rs
    * Rust静态资源
    * [Rust官方网站](http://www.rust-lang.org)



    * proxy.golang.org
    * sum.golang.org
    * index.golang.org
    * golang.org
    * [www.golang.org](http://www.golang.org)
    * goproxy.io
    * pkg.go.dev



    * maven.org
    * repo.maven.org
    * central.maven.org
    * repo1.maven.org
    * repo.maven.apache.org
    * jcenter.bintray.com
    * gradle.org
    * [www.gradle.org](http://www.gradle.org)
    * services.gradle.org
    * plugins.gradle.org
    * kotlinlang.org
    * [www.kotlinlang.org](http://www.kotlinlang.org)
    * spring.io
    * repo.spring.io



    * packagist.org (PHP Composer)
    * [www.packagist.org](http://www.packagist.org)
    * repo.packagist.org
    * nuget.org (.NET NuGet)
    * [www.nuget.org](http://www.nuget.org)
    * api.nuget.org
    * pub.dev (Dart/Flutter)
    * api.pub.dev
    * hex.pm (Elixir/Erlang)
    * [www.hex.pm](http://www.hex.pm)
    * cpan.org (Perl CPAN)
    * [www.cpan.org](http://www.cpan.org)
    * metacpan.org
    * [www.metacpan.org](http://www.metacpan.org)
    * api.metacpan.org
    * cocoapods.org (iOS/macOS)
    * [www.cocoapods.org](http://www.cocoapods.org)
    * cdn.cocoapods.org
    * haskell.org
    * [www.haskell.org](http://www.haskell.org)
    * hackage.haskell.org
    * swift.org
    * [www.swift.org](http://www.swift.org)



    * archive.ubuntu.com
    * security.ubuntu.com
    * ubuntu.com
    * [www.ubuntu.com](http://www.ubuntu.com)
    * \*.ubuntu.com
    * ppa.launchpad.net
    * launchpad.net
    * [www.launchpad.net](http://www.launchpad.net)
    * \*.nixos.org



    * dl.k8s.io (Kubernetes)
    * pkgs.k8s.io
    * k8s.io
    * [www.k8s.io](http://www.k8s.io)
    * releases.hashicorp.com (HashiCorp)
    * apt.releases.hashicorp.com
    * rpm.releases.hashicorp.com
    * archive.releases.hashicorp.com
    * hashicorp.com
    * [www.hashicorp.com](http://www.hashicorp.com)
    * repo.anaconda.com (Anaconda/Conda)
    * conda.anaconda.org
    * anaconda.org
    * [www.anaconda.com](http://www.anaconda.com)
    * anaconda.com
    * continuum.io
    * apache.org (Apache)
    * [www.apache.org](http://www.apache.org)
    * archive.apache.org
    * downloads.apache.org
    * eclipse.org (Eclipse)
    * [www.eclipse.org](http://www.eclipse.org)
    * download.eclipse.org
    * nodejs.org (Node.js)
    * [www.nodejs.org](http://www.nodejs.org)
    * developer.apple.com
    * developer.android.com
    * pkg.stainless.com
    * binaries.prisma.sh



    * statsig.com
    * [www.statsig.com](http://www.statsig.com)
    * api.statsig.com
    * sentry.io
    * \*.sentry.io
    * downloads.sentry-cdn.com
    * http-intake.logs.datadoghq.com
    * \*.datadoghq.com
    * \*.datadoghq.eu
    * api.honeycomb.io



    * sourceforge.net 网站
    * \*.sourceforge.net 子域名
    * packagecloud.io 网站
    * \*.packagecloud.io 子域名
    * fonts.googleapis.com
    * fonts.gstatic.com



    * json-schema.org
    * [www.json-schema.org](http://www.json-schema.org)
    * json.schemastore.org
    * [www.schemastore.org](http://www.schemastore.org)



    * \*.modelcontextprotocol.io


## 在网页与终端间移动任务

这些工作流程需要 [Claude Code CLI](/en/quickstart) 登录同一个 claude.ai 账户。您可以从终端启动新的云端会话，或将云端会话拉取至本地终端继续操作。即使合上笔记本电脑，云端会话也会持续运行，您还可以从任何地方监控它们，包括通过 Claude 移动应用。

  从命令行界面来看，会话传输是单向的：您可以使用 `--teleport` 将云端会话拉取到本地终端，但无法将现有终端会话推送到网页端。`--remote` 标志会为当前仓库创建一个新的云端会话。桌面应用提供了「继续在...」菜单，可将本地会话发送至网页端。

### 从终端到网页

使用 `--remote` 标志从命令行启动云会话：
```bash
claude --remote "Fix the authentication bug in src/auth/login.ts"
```
这会在 claude.ai 上创建一个新的云会话。该会话将克隆您当前目录所在 GitHub 远程仓库的当前分支，因此如果您有本地提交，请先推送，因为虚拟机将从 GitHub 而非您的机器进行克隆。`--remote` 一次仅适用于单个仓库。任务将在云端运行，而您可继续在本地工作。

  `--remote` 创建云端会话。`--remote-control` 则无关：它将本地CLI会话暴露出来，以便从Web端监控。详见 [远程控制](/en/remote-control)。

使用 Claude Code CLI 中的 `/tasks` 命令来检查进度，或在 claude.ai 或 Claude 移动应用上打开会话进行直接交互。在那里，您可以像进行其他任何对话一样引导 Claude、提供反馈或回答问题。

#### 云端任务小技巧

**本地规划，远程执行**：对于复杂任务，请以计划模式启动 Claude 来协作制定方案，然后将工作发送到云端：
```bash
claude --permission-mode plan
```
在计划模式下，Claude 会读取文件、运行命令进行探索，并提出计划而不编辑源代码。确认满意后，将计划保存到代码库，提交并推送，以便云虚拟机可以克隆它。然后启动云会话进行自主执行：
```bash
claude --remote "Execute the migration plan in docs/migration-plan.md"
```
这种模式让您掌控策略制定，同时允许Claude在云端自主执行。

**使用ultraplan在云端规划**：若需在网页会话中起草和审阅计划本身，请使用[ultraplan](/en/ultraplan)。Claude会在网页版Claude Code上生成计划，而您可以继续工作，随后在浏览器中对各部分添加评论，选择远程执行或将计划发回终端。

**并行运行任务**：每个 `--remote` 命令都会创建独立运行的云端会话。您可以启动多个任务，它们将在各自独立的会话中同时运行：
```bash
claude --remote "Fix the flaky test in auth.spec.ts"
claude --remote "Update the API documentation"
claude --remote "Refactor the logger to use structured output"
```
通过 Claude Code CLI 中的 `/tasks` 命令监控所有会话。当会话完成后，您可以从网页界面创建 PR 或将会话[传送](#from-web-to-terminal)到终端继续工作。

#### 在没有 GitHub 的情况下发送本地仓库

当您在未连接 GitHub 的仓库中运行 `claude --remote` 时，Claude Code 会打包您的本地仓库并直接上传到云端会话。此打包文件包含您所有分支的完整仓库历史记录，以及跟踪文件的所有未提交更改。

当 GitHub 访问不可用时，此备用方案会自动激活。即使已连接 GitHub 也想强制使用此功能，请设置环境变量 `CCR_FORCE_BUNDLE=1`：
```bash
CCR_FORCE_BUNDLE=1 claude --remote "Run the test suite and fix any failures"
```
打包仓库必须满足以下限制：

*   目录必须是一个至少包含一次提交的 Git 仓库。
*   打包仓库大小必须低于 100 MB。更大的仓库会退回到仅打包当前分支，然后是单次压缩的工作树快照，只有在快照仍然太大时才会失败。
*   未跟踪的文件不会被包含；请在希望云端会话看到的文件上运行 `git add`。
*   从打包创建的会话无法推送到远程仓库，除非您同时配置了 [GitHub 认证](#github-authentication-options)。

### 从网页到终端

使用以下任一方式将云端会话拉取到您的终端：

*   **使用 `--teleport`**：在命令行中，运行 `claude --teleport` 打开交互式会话选择器，或运行 `claude --teleport <session-id>` 直接恢复特定会话。如果您有未提交的更改，系统将提示您先暂存。
*   **使用 `/teleport`**：在现有的 CLI 会话内部，运行 `/teleport`（或 `/tp`）可以在不重启 Claude Code 的情况下打开相同的会话选择器。
*   **从 `/tasks`**：运行 `/tasks` 查看您的后台会话，然后按 `t` 传送到其中一个会话。
*   **从网页界面**：选择 **在 CLI 中打开** 以复制一个命令，您可以将其粘贴到终端中。

当您传送一个会话时，Claude 会验证您是否在正确的仓库中，从云端会话获取并签出分支，并将完整的对话历史记录加载到您的终端。

`--teleport` 与 `--resume` 不同。`--resume` 重新打开本机本地历史记录中的对话，不列出云端会话；`--teleport` 则拉取云端会话及其分支。

#### 传送要求

传送会在恢复会话前检查这些要求。如果任何要求未满足，您将看到错误或被提示解决问题。

| 要求             | 详情                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 干净的 Git 状态  | 您的工作目录必须没有未提交的更改。传送会在需要时提示您暂存更改。                                                              |
| 正确的仓库       | 您必须从同一仓库（而非分支）的检出中运行 `--teleport`。                                                                       |
| 分支可用         | 来自云端会话的分支必须已推送到远程。传送会自动获取并签出它。                                                                  |
| 相同的账户       | 您必须使用与云端会话中使用的相同 claude.ai 账户进行认证。                                                                     |

#### `--teleport` 不可用

传送需要 claude.ai 订阅认证。如果您通过 API 密钥、Bedrock、Vertex AI 或 Microsoft Foundry 进行认证，请运行 `/login` 以改用您的 claude.ai 账户登录。如果您已通过 claude.ai 登录且 `--teleport` 仍不可用，您的组织可能已禁用云端会话。

## 处理会话

会话显示在 claude.ai/code 的侧边栏中。您可以在那里审阅更改、与队友共享、归档已完成的工作或永久删除会话。

### 管理上下文

云端会话支持产生文本输出的[内置命令](/en/commands)。打开交互式终端选择器的命令（如 `/model` 或 `/config`）不可用。

针对上下文管理：

| 命令       | 在云端会话中可用 | 备注                                                                                                                         |
| :--------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `/compact` | 是               | 总结对话以释放上下文。可接受可选的聚焦说明，例如 `/compact keep the test output`。                                               |
| `/context` | 是               | 显示当前上下文窗口中的内容。                                                                                                   |
| `/clear`   | 否               | 请改为从侧边栏开始新会话。                                                                                                     |

当上下文窗口接近容量时，自动压缩会自动运行，与 CLI 中相同。要更早触发，请在您的[环境变量](#configure-your-environment)中设置 [`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`](/en/env-vars)。例如，`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` 会在 70% 容量时压缩，而不是默认的约 95%。要更改压缩计算的有效窗口大小，请使用 [`CLAUDE_CODE_AUTO_COMPACT_WINDOW`](/en/env-vars)。

[子代理](/en/sub-agents)的工作方式与本地相同。Claude 可以使用 Task 工具生成子代理，将研究或并行工作卸载到单独的上下文窗口中，使主对话保持轻量。您仓库的 `.claude/agents/` 中定义的子代理会自动被识别。[代理团队](/en/agent-teams)默认禁用，但可以通过在您的[环境变量](#configure-your-environment)中添加 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 来启用。

### 审阅更改

每个会话都会显示一个差异指示器，显示添加和删除的行数，例如 `+42 -18`。选择它可打开差异视图，对特定行留下内联评论，并在下一条消息中发送给 Claude。有关包含 PR 创建的完整演练，请参阅[审阅与迭代](/en/web-quickstart#review-and-iterate)。要让 Claude 自动监控 PR 的 CI 失败和审阅评论，请参阅[自动修复拉取请求](#auto-fix-pull-requests)。

### 共享会话

要共享一个会话，请根据以下账户类型切换其可见性设置。之后，直接分享会话链接。收件人打开链接时会看到最新状态，但他们的视图不会实时更新。

#### 从企业或团队账户共享

对于企业和团队账户，两个可见性选项是**私有**和**团队**。团队可见性使会话对您 claude.ai 组织的其他成员可见。默认启用仓库访问验证，基于连接到收件人账户的 GitHub 账户。您的账户显示名称对所有有访问权限的收件人可见。[Slack 中的 Claude](/en/slack) 会话会自动以团队可见性共享。

#### 从 Max 或 Pro 账户共享

对于 Max 和 Pro 账户，两个可见性选项是**私有**和**公开**。公开可见性使会话对任何登录到 claude.ai 的用户可见。

共享前请检查您的会话是否包含敏感内容。会话可能包含来自私有 GitHub 仓库的代码和凭据。默认不启用仓库访问验证。

要要求收件人拥有仓库访问权限，或在共享会话中隐藏您的姓名，请前往设置 > Claude Code > 共享设置。

### 归档会话

您可以归档会话以保持会话列表有序。归档的会话会从默认会话列表中隐藏，但可以通过筛选归档会话来查看。

要归档一个会话，请将鼠标悬停在侧边栏中的会话上，然后选择归档图标。

### 删除会话

删除会话会永久移除该会话及其数据。此操作无法撤消。您可以通过两种方式删除会话：

*   **从侧边栏**：筛选归档会话，然后将鼠标悬停在要删除的会话上，选择删除图标。
*   **从会话菜单**：打开一个会话，选择会话标题旁边的下拉菜单，然后选择**删除**。

在删除会话之前，系统会要求您确认。

## 自动修复拉取请求

Claude 可以监控拉取请求并自动响应 CI 失败和审阅评论。Claude 会订阅 PR 上的 GitHub 活动，当检查失败或审阅者留下评论时，Claude 会进行调查，如果有明确的修复方案则推送修复。

  自动修复功能需要将Claude GitHub App安装到您的仓库中。如果尚未安装，请从[GitHub App页面](https://github.com/apps/claude)进行安装，或在[设置](/en/web-quickstart#connect-github-and-create-an-environment)过程中根据提示完成安装。

根据 PR 来源和所用设备的不同，有几种方式可以开启自动修复：

*   **在网络端 Claude Code 中创建的 PR**：打开 CI 状态栏，然后选择 **Auto-fix**
*   **在您的终端**：在 PR 的分支上运行 [`/autofix-pr`](/en/commands)。Claude Code 会使用 `gh` 检测到打开的 PR，启动网页会话，并一步到位地开启自动修复。
*   **在移动端应用**：告诉 Claude 自动修复该 PR，例如 "监控这个 PR 并修复任何 CI 失败或审查评论"。
*   **任何已存在的 PR**：将 PR URL 粘贴到会话中，并告诉 Claude 自动修复它。

自动修复是针对每个 PR 的开关。要停止监控，请在网络会话中打开 CI 状态栏并关闭 **Auto-fix** 开关，或告诉 Claude 停止监控该 PR。

### Claude 如何响应 PR 活动

当自动修复处于活动状态时，Claude 会接收该 PR 的 GitHub 事件，包括新的审查评论和 CI 检查失败。对于每个事件，Claude 会进行调查并决定如何进行：

*   **明确修复**：如果 Claude 对修复有信心且不与之前的指令冲突，Claude 会进行更改，推送，并在会话中解释所做操作。
*   **模糊请求**：如果审查者的评论可能有多种解释或涉及架构上的重要问题，Claude 会在行动前先询问您。
*   **重复或无需操作的事件**：如果事件是重复的或不需要更改，Claude 会在会话中记录并继续处理其他事件。

作为解决过程的一部分，Claude 可能会在 GitHub 上回复审查评论线程。这些回复是使用您的 GitHub 账户发布的，因此会显示在您的用户名下，但每条回复都会标记为来自 Claude Code，以便审查者知道这是由代理撰写的，而非您本人。

  如果你的代码仓库使用基于评论触发的自动化工具，如 Atlantis、Terraform Cloud 或在 `issue_comment` 事件上运行的自定义 GitHub Actions，请注意 Claude 可能会代表你进行回复，从而触发这些工作流。启用自动修复前请审查你代码仓库的自动化设置，并考虑在 PR 评论可能部署基础设施或执行特权操作的代码仓库中禁用自动修复。

## 安全性与隔离性

每个云会话通过多层机制与您的机器及其他会话实现隔离：

* **隔离虚拟机**：每个会话运行在隔离的、由 Anthropic 管理的虚拟机中
* **网络访问控制**：默认限制网络访问，且可被禁用。当禁用网络访问运行时，Claude Code 仍能与 Anthropic API 通信，这可能允许数据离开虚拟机。
* **凭证保护**：敏感凭证（如 git 凭证或签名密钥）绝不会存放在包含 Claude Code 的沙箱内。身份验证通过使用具有作用域限定凭证的安全代理来处理。
* **安全分析**：代码在创建 PR 前，会在隔离虚拟机内进行分析和修改

## 故障排除

对于会话中出现的运行时 API 错误，如 `API Error: 500`、`529 Overloaded`、`429` 或 `Prompt is too long`，请参阅 [错误参考](/en/errors)。这些错误及其修复方法与 CLI 和桌面应用程序通用。以下部分涵盖云会话特有的问题。

### 会话创建失败

如果新会话因 `Session creation failed` 启动失败或卡在配置阶段，则表明 Claude Code 无法分配云环境。

* 检查 [status.claude.com](https://status.claude.com) 了解云会话事件
* 一分钟后重试，因为容量是按需配置的
* 确认您的仓库可访问。连接的 GitHub 账户必须有权访问 GitHub 上的仓库，这可以通过 Claude GitHub App 授权或通过 `/web-setup` 同步的 `gh` 令牌实现——无需在仓库上安装该 App。请参阅 [GitHub 身份验证选项](#github-authentication-options)。

### 远程控制会话过期或访问被拒绝

`--teleport` 通过与云会话使用的相同远程控制会话基础架构进行连接，因此身份验证和会话过期错误会以远程控制相关的措辞显示。您可能会看到 `Remote Control session expired` 或 `Access denied`。连接令牌是短期的，并且仅限于您的账户范围。

* 在本地运行 `/login` 以刷新您的凭证，然后重新连接
* 确认您已登录到拥有该会话的同一账户
* 如果看到 `Remote Control may not be available for this organization`，说明您的管理员尚未为您的计划启用远程会话

### 环境已过期

云会话在一段时间不活动后会停止，且其底层环境会被回收。从本地终端来看，这会显示为 `Could not resume session ... its environment has expired. Creating a fresh session instead.`。在网页端，会话列表中会将该会话标记为已过期。

从 [claude.ai/code](https://claude.ai/code) 重新打开会话，即可配置一个新的环境，同时恢复您的对话历史记录。

## 限制条件

在依赖云会话完成工作流之前，请考虑以下限制：

* **速率限制**：网页版 Claude Code 与您账户内的所有其他 Claude 和 Claude Code 使用共享速率限制。并行运行多个任务会按比例消耗更多速率限制。云虚拟机没有单独的计算费用。
* **仓库身份验证**：仅当您向同一账户进行身份验证时，才能将会话从网页端迁移到本地。
* **平台限制**：仓库克隆和拉取请求创建需要 GitHub。团队和企业计划支持自托管的 [GitHub Enterprise Server](/en/github-enterprise-server) 实例。GitLab、Bitbucket 和其他非 GitHub 仓库可以作为[本地捆绑包](#send-local-repositories-without-github)发送至云会话，但会话无法将结果推送回远程。
* **组织 IP 允许列表**：云会话从 Anthropic 管理的基础设施（而非您的网络）调用 Anthropic API。如果您的组织启用了 [IP 允许列表](https://support.claude.com/en/articles/13200993-restrict-access-to-claude-with-ip-allowlisting)，每个云会话都会因身份验证错误而失败。[代码审查](/en/code-review)和[例程](/en/routines)同样适用此规则。请联系 [Anthropic 支持](https://support.claude.com/)，将 Anthropic 托管的服务从您组织的 IP 允许列表中豁免。

## 相关资源

* [Ultraplan](/en/ultraplan)：在云会话中起草计划并在浏览器中审阅
* [Ultrareview](/en/ultrareview)：在云沙箱中运行深度多代理代码审查
* [Routines](/en/routines)：通过 API 调用或响应 GitHub 事件按计划自动执行工作
* [钩子配置](/en/hooks)：在会话生命周期事件时运行脚本
* [设置参考](/en/settings)：所有配置选项
* [安全性](/en/security)：隔离保证和数据处理
* [数据使用](/en/data-usage)：Anthropic 从云会话中保留的内容