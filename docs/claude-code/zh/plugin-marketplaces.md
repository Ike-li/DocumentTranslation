> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 创建和分发插件市场

> 构建和托管插件市场，以便在团队和社区中分发 Claude Code 扩展。

**插件市场**是一个目录，允许你向他人分发插件。市场提供集中式发现、版本跟踪、自动更新，并支持多种来源类型（git 仓库、本地路径等）。本指南展示如何创建自己的市场来与团队或社区共享插件。

想要从现有市场安装插件？请参阅[发现和安装预构建插件](/zh/discover-plugins)。

## 概述

创建和分发市场包括：

1. **创建插件**：构建一个或多个包含技能、代理、钩子、MCP 服务器或 LSP 服务器的插件。本指南假设你已有待分发的插件；详情请参阅[创建插件](/zh/plugins)。
2. **创建市场文件**：定义一个 `marketplace.json`，列出你的插件及其查找位置（参见[创建市场文件](#创建市场文件)）。
3. **托管市场**：推送到 GitHub、GitLab 或其他 git 托管平台（参见[托管和分发市场](#托管和分发市场)）。
4. **与用户共享**：用户通过 `/plugin marketplace add` 添加你的市场并安装各个插件（参见[发现和安装插件](/zh/discover-plugins)）。

市场上线后，你可以通过推送更改到仓库来更新它。用户使用 `/plugin marketplace update` 刷新本地副本。

## 演练：创建本地市场

此示例创建一个包含一个插件的市场：用于代码审查的 `quality-review` 技能。你将创建目录结构、添加技能、创建插件清单和市场目录，然后安装并测试。

创建目录结构：

```bash
mkdir -p my-marketplace/.claude-plugin
mkdir -p my-marketplace/plugins/quality-review-plugin/.claude-plugin
mkdir -p my-marketplace/plugins/quality-review-plugin/skills/quality-review
```

创建技能：

创建一个 `SKILL.md` 文件，定义 `quality-review` 技能的功能。

```markdown my-marketplace/plugins/quality-review-plugin/skills/quality-review/SKILL.md
---
description: Review code for bugs, security, and performance
disable-model-invocation: true
---

Review the code I've selected or the recent changes for:
- Potential bugs or edge cases
- Security concerns
- Performance issues
- Readability improvements

Be concise and actionable.
```

创建插件清单：

创建一个 `plugin.json` 文件来描述插件。清单放在 `.claude-plugin/` 目录中。

```json my-marketplace/plugins/quality-review-plugin/.claude-plugin/plugin.json
{
  "name": "quality-review-plugin",
  "description": "Adds a quality-review skill for quick code reviews",
  "version": "1.0.0"
}
```

设置 `version` 意味着用户仅在此字段更改时才会收到更新，因此每次发布时都要递增版本号。如果省略 `version` 且将此市场托管在 git 中，则每次提交都自动算作新版本。请参阅[版本解析](#版本解析和发布渠道)以选择合适的方法。

创建市场文件：

创建列出你的插件的市场目录。

```json my-marketplace/.claude-plugin/marketplace.json
{
  "name": "my-plugins",
  "owner": {
    "name": "Your Name"
  },
  "plugins": [
    {
      "name": "quality-review-plugin",
      "source": "./plugins/quality-review-plugin",
      "description": "Adds a quality-review skill for quick code reviews"
    }
  ]
}
```

添加并安装：

添加市场并安装插件。

```shell
/plugin marketplace add ./my-marketplace
/plugin install quality-review-plugin@my-plugins
```

试试看：

在编辑器中选择一些代码并运行你的新技能。插件技能使用插件名称作为命名空间。

```shell
/quality-review-plugin:quality-review
```

要了解更多插件功能，包括钩子、代理、MCP 服务器和 LSP 服务器，请参阅[插件](/zh/plugins)。

**插件安装方式**：用户安装插件时，Claude Code 会将插件目录复制到缓存位置。这意味着插件无法使用 `../shared-utils` 等路径引用其目录外部的文件，因为这些文件不会被复制。

如果需要在插件之间共享文件，请使用符号链接。详情请参阅[插件缓存和文件解析](/zh/plugins-reference#plugin-caching-and-file-resolution)。

## 创建市场文件

在仓库根目录创建 `.claude-plugin/marketplace.json`。此文件定义市场的名称、所有者信息以及带有来源的插件列表。

每个插件条目至少需要 `name` 和 `source`（从何处获取）。有关所有可用字段，请参阅下方的[完整 schema](#市场-schema)。

```json
{
  "name": "company-tools",
  "owner": {
    "name": "DevTools Team",
    "email": "devtools@example.com"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "Automatic code formatting on save",
      "version": "2.1.0",
      "author": {
        "name": "DevTools Team"
      }
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "Deployment automation tools"
    }
  ]
}
```

## 市场 schema

### 必填字段

| 字段 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `name` | string | 市场标识符（kebab-case，无空格）。这是面向用户的：用户在安装插件时会看到它（例如 `/plugin install my-tool@your-marketplace`）。每个用户每个名称只能注册一个市场：添加同名的第二个市场会替换第一个。要在一个市场名称下发布多个插件，请将它们全部列在[单个 `marketplace.json`](#创建市场文件) 中。 | `"acme-tools"` |
| `owner` | object | 市场维护者信息（[参见下方字段](#所有者字段)） | |
| `plugins` | array | 可用插件列表 | 参见下方 |

**保留名称**：以下市场名称保留给 Anthropic 官方使用，第三方市场不得使用：`claude-code-marketplace`、`claude-code-plugins`、`claude-plugins-official`、`anthropic-marketplace`、`anthropic-plugins`、`agent-skills`、`anthropic-agent-skills`、`knowledge-work-plugins`、`life-sciences`、`claude-for-legal`、`claude-for-financial-services`、`financial-services-plugins`。冒充官方市场的名称（如 `official-claude-plugins` 或 `anthropic-tools-v2`）也会被阻止。

### 所有者字段

| 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `name` | string | 是 | 维护者或团队名称 |
| `email` | string | 否 | 维护者联系邮箱 |

### 可选字段

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `$schema` | string | 用于编辑器自动完成和验证的 JSON Schema URL。Claude Code 在加载时忽略此字段。 |
| `description` | string | 市场简要描述 |
| `version` | string | 市场清单版本 |
| `metadata.pluginRoot` | string | 添加到相对插件源路径之前的基础目录（例如 `"./plugins"` 允许你写 `"source": "formatter"` 而不是 `"source": "./plugins/formatter"`） |
| `allowCrossMarketplaceDependenciesOn` | array | 此市场中的插件可以依赖的其他市场。此处未列出的市场中的依赖项在安装时会被阻止。参见[依赖另一个市场的插件](/zh/plugin-dependencies#depend-on-a-plugin-from-another-marketplace)。 |

`description` 和 `version` 也可在 `metadata` 下使用，以保持向后兼容。

## 插件条目

`plugins` 数组中的每个插件条目描述一个插件及其查找位置。你可以包含[插件清单 schema](/zh/plugins-reference#plugin-manifest-schema) 中的任何字段（如 `description`、`version`、`author`、`commands`、`hooks` 等），以及这些市场特定字段：`source`、`category`、`tags` 和 `strict`。

### 必填字段

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `name` | string | 插件标识符（kebab-case，无空格）。这是面向用户的：用户在安装时会看到它（例如 `/plugin install my-plugin@marketplace`）。 |
| `source` | string\|object | 从何处获取插件（参见下方[插件来源](#插件来源)） |

### 可选插件字段

**标准元数据字段：**

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `displayName` | string | {/* min-version: 2.1.143 */}在 UI 界面中显示的可读名称。省略时回退到 `name`。可包含空格和任意大小写。不用于命名空间或查找。需要 Claude Code v2.1.143 或更高版本。 |
| `description` | string | 插件简要描述 |
| `version` | string | 插件版本。如果在此处或 `plugin.json` 中设置，插件将固定到此字符串，用户仅在更改时收到更新。省略则回退到 git 提交 SHA。参见[版本解析](#版本解析和发布渠道)。 |
| `author` | object | 插件作者信息（`name` 必填，`email` 可选） |
| `homepage` | string | 插件主页或文档 URL |
| `repository` | string | 源代码仓库 URL |
| `license` | string | SPDX 许可证标识符（例如 MIT、Apache-2.0） |
| `keywords` | array | 用于插件发现和分类的标签 |
| `category` | string | 插件分类 |
| `tags` | array | 用于搜索的标签 |
| `strict` | boolean | 控制 `plugin.json` 是否是组件定义的权威来源（默认：true）。参见下方[严格模式](#严格模式)。 |
| `defaultEnabled` | boolean | {/* min-version: 2.1.154 */}安装后是否启用插件（默认：true）。设为 `false` 可在用户选择加入之前以禁用状态安装插件。优先于插件 `plugin.json` 中的同名字段。参见[默认启用](/zh/plugins-reference#default-enablement)。需要 Claude Code v2.1.154 或更高版本。 |

**组件配置字段：**

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `skills` | string\|array | 包含 `<name>/SKILL.md` 的技能目录的自定义路径 |
| `commands` | string\|array | 平铺 `.md` 技能文件或目录的自定义路径 |
| `agents` | string\|array | 代理文件的自定义路径 |
| `hooks` | string\|object | 自定义钩子配置或钩子文件路径 |
| `mcpServers` | string\|object | MCP 服务器配置或 MCP 配置路径 |
| `lspServers` | string\|object | LSP 服务器配置或 LSP 配置路径 |

## 插件来源

插件来源告诉 Claude Code 从何处获取市场中列出的各个插件。这些在 `marketplace.json` 中每个插件条目的 `source` 字段中设置。

插件克隆或复制到本地机器后，会被复制到 `~/.claude/plugins/cache` 的本地版本化插件缓存中。

| 来源 | 类型 | 字段 | 备注 |
| --- | --- | --- | --- |
| 相对路径 | `string`（如 `"./my-plugin"`） | 无 | 市场仓库内的本地目录。必须以 `./` 开头。相对于市场根目录解析，而非 `.claude-plugin/` 目录 |
| `github` | object | `repo`、`ref?`、`sha?` | |
| `url` | object | `url`、`ref?`、`sha?` | Git URL 来源 |
| `git-subdir` | object | `url`、`path`、`ref?`、`sha?` | git 仓库内的子目录。使用稀疏克隆以最小化大型 monorepo 的带宽 |
| `npm` | object | `package`、`version?`、`registry?` | 通过 `npm install` 安装 |

**市场来源与插件来源**：这是控制不同事物的不同概念。

* **市场来源** — 从何处获取 `marketplace.json` 目录本身。在用户运行 `/plugin marketplace add` 时设置，或在 `extraKnownMarketplaces` 设置中设置。支持 `ref`（分支/标签）但不支持 `sha`。
* **插件来源** — 从何处获取市场中列出的各个插件。在 `marketplace.json` 中每个插件条目的 `source` 字段中设置。同时支持 `ref`（分支/标签）和 `sha`（精确提交）。

例如，托管在 `acme-corp/plugin-catalog`（市场来源）的市场可以列出从 `acme-corp/code-formatter`（插件来源）获取的插件。市场来源和插件来源指向不同的仓库，并独立固定。

### 相对路径

对于同一仓库中的插件，使用以 `./` 开头的路径：

```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin"
}
```

路径相对于市场根目录解析，即包含 `.claude-plugin/` 的目录。在上面的示例中，`./plugins/my-plugin` 指向 `<repo>/plugins/my-plugin`，即使 `marketplace.json` 位于 `<repo>/.claude-plugin/marketplace.json`。不要使用 `../` 引用市场根目录之外的路径。

相对路径仅在用户通过 Git（GitHub、GitLab 或 git URL）添加市场时有效。如果用户通过 `marketplace.json` 文件的直接 URL 添加市场，相对路径将无法正确解析。对于基于 URL 的分发，请改用 GitHub、npm 或 git URL 来源。详情请参阅[故障排除](#基于-url-的市场中相对路径插件失败)。

### GitHub 仓库

```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo"
  }
}
```

你可以固定到特定分支、标签或提交：

```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `repo` | string | 必填。GitHub 仓库，格式为 `owner/repo` |
| `ref` | string | 可选。Git 分支或标签（默认为仓库默认分支） |
| `sha` | string | 可选。完整的 40 字符 git 提交 SHA，用于固定到精确版本 |

### Git 仓库

```json
{
  "name": "git-plugin",
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git"
  }
}
```

你可以固定到特定分支、标签或提交：

```json
{
  "name": "git-plugin",
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `url` | string | 必填。完整 git 仓库 URL（`https://` 或 `git@`）。`.git` 后缀是可选的，因此没有此后缀的 Azure DevOps 和 AWS CodeCommit URL 也可以使用 |
| `ref` | string | 可选。Git 分支或标签（默认为仓库默认分支） |
| `sha` | string | 可选。完整的 40 字符 git 提交 SHA，用于固定到精确版本 |

### Git 子目录

使用 `git-subdir` 指向位于 git 仓库子目录中的插件。Claude Code 使用稀疏部分克隆仅获取该子目录，最小化大型 monorepo 的带宽。

```json
{
  "name": "my-plugin",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/acme-corp/monorepo.git",
    "path": "tools/claude-plugin"
  }
}
```

你可以固定到特定分支、标签或提交：

```json
{
  "name": "my-plugin",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/acme-corp/monorepo.git",
    "path": "tools/claude-plugin",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

`url` 字段也接受 GitHub 简写（`owner/repo`）或 SSH URL（`git@github.com:owner/repo.git`）。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `url` | string | 必填。Git 仓库 URL、GitHub `owner/repo` 简写或 SSH URL |
| `path` | string | 必填。仓库中包含插件的子目录路径（例如 `"tools/claude-plugin"`） |
| `ref` | string | 可选。Git 分支或标签（默认为仓库默认分支） |
| `sha` | string | 可选。完整的 40 字符 git 提交 SHA，用于固定到精确版本 |

### npm 包

作为 npm 包分发的插件使用 `npm install` 安装。这适用于公共 npm 注册表或你的团队托管的私有注册表上的任何包。

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin"
  }
}
```

要固定到特定版本，添加 `version` 字段：

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin",
    "version": "2.1.0"
  }
}
```

要从私有或内部注册表安装，添加 `registry` 字段：

```json
{
  "name": "my-npm-plugin",
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin",
    "version": "^2.0.0",
    "registry": "https://npm.example.com"
  }
}
```

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `package` | string | 必填。包名或作用域包（例如 `@org/plugin`） |
| `version` | string | 可选。版本或版本范围（例如 `2.1.0`、`^2.0.0`、`~1.5.0`） |
| `registry` | string | 可选。自定义 npm 注册表 URL。默认为系统 npm 注册表（通常为 npmjs.org） |

### 高级插件条目

此示例展示了一个使用许多可选字段的插件条目，包括命令、代理、钩子和 MCP 服务器的自定义路径：

```json
{
  "name": "enterprise-tools",
  "source": {
    "source": "github",
    "repo": "company/enterprise-plugin"
  },
  "description": "Enterprise workflow automation tools",
  "version": "2.1.0",
  "author": {
    "name": "Enterprise Team",
    "email": "enterprise@example.com"
  },
  "homepage": "https://docs.example.com/plugins/enterprise-tools",
  "repository": "https://github.com/company/enterprise-plugin",
  "license": "MIT",
  "keywords": ["enterprise", "workflow", "automation"],
  "category": "productivity",
  "commands": [
    "./commands/core/",
    "./commands/enterprise/",
    "./commands/experimental/preview.md"
  ],
  "agents": ["./agents/security-reviewer.md", "./agents/compliance-checker.md"],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "enterprise-db": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  },
  "strict": false
}
```

关键要点：

* **`commands` 和 `agents`**：你可以指定多个目录或单个文件。路径相对于插件根目录。
* **`${CLAUDE_PLUGIN_ROOT}`**：在钩子和 MCP 服务器配置中使用此变量引用插件安装目录内的文件。这是必要的，因为插件在安装时会被复制到缓存位置。对于应在插件更新后保留的依赖项或状态，请改用 [`${CLAUDE_PLUGIN_DATA}`](/zh/plugins-reference#persistent-data-directory)。
* **`strict: false`**：由于设为 false，插件不需要自己的 `plugin.json`。市场条目定义所有内容。参见下方[严格模式](#严格模式)。

### 严格模式

`strict` 字段控制 `plugin.json` 是否是组件定义（技能、代理、钩子、MCP 服务器、输出样式）的权威来源。

| 值 | 行为 |
| :--- | :--- |
| `true`（默认） | `plugin.json` 是权威来源。市场条目可以用额外组件补充它，两个来源会合并。 |
| `false` | 市场条目就是完整定义。如果插件还有声明组件的 `plugin.json`，则产生冲突，插件加载失败。 |

**何时使用每种模式：**

* **`strict: true`**：插件有自己的 `plugin.json` 并管理自己的组件。市场条目可以在其上添加额外的技能或钩子。这是默认值，适用于大多数插件。
* **`strict: false`**：市场运营者希望完全控制。插件仓库提供原始文件，市场条目定义哪些文件作为技能、代理、钩子等暴露。当市场以不同于插件作者预期的方式重组或策划插件组件时很有用。

## 托管和分发市场

### 在 GitHub 上托管（推荐）

GitHub 提供最简单的分发方法：

1. **创建仓库**：为你的市场设置新仓库
2. **添加市场文件**：创建包含插件定义的 `.claude-plugin/marketplace.json`
3. **与团队共享**：用户通过 `/plugin marketplace add owner/repo` 添加你的市场

**优势**：内置版本控制、问题跟踪和团队协作功能。

### 在其他 git 服务上托管

任何 git 托管服务都可以，如 GitLab、Bitbucket 和自托管服务器。用户使用完整仓库 URL 添加：

```shell
/plugin marketplace add https://gitlab.com/company/plugins.git
```

### 私有仓库

Claude Code 支持从私有仓库安装插件。对于手动安装和更新，Claude Code 使用你现有的 git 凭证助手，因此通过 `gh auth login`、macOS 钥匙串或 `git-credential-store` 的 HTTPS 访问与在终端中的工作方式相同。SSH 访问要求主机已在你的 `known_hosts` 文件中且密钥已加载到 `ssh-agent` 中，因为 Claude Code 会抑制主机指纹和密钥密码的交互式 SSH 提示。

后台自动更新在启动时运行，不使用凭证助手，因为交互式提示会阻止 Claude Code 启动。要为私有市场启用自动更新，请在环境中设置相应的认证令牌：

| 提供商 | 环境变量 | 备注 |
| :--- | :--- | :--- |
| GitHub | `GITHUB_TOKEN` 或 `GH_TOKEN` | 个人访问令牌或 GitHub App 令牌 |
| GitLab | `GITLAB_TOKEN` 或 `GL_TOKEN` | 个人访问令牌或项目令牌 |
| Bitbucket | `BITBUCKET_TOKEN` | 应用密码或仓库访问令牌 |

在 shell 配置（例如 `.bashrc`、`.zshrc`）中设置令牌，或在运行 Claude Code 时传入：

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

对于 CI/CD 环境，请将令牌配置为密钥环境变量。GitHub Actions 会自动为同一组织中的仓库提供 `GITHUB_TOKEN`。

### 分发前本地测试

在共享前本地测试你的市场：

```shell
/plugin marketplace add ./my-local-marketplace
/plugin install test-plugin@my-local-marketplace
```

有关所有添加命令（GitHub、Git URL、本地路径、远程 URL），请参阅[添加市场](/zh/discover-plugins#add-marketplaces)。

### 为团队要求市场

你可以配置仓库，使团队成员在信任项目文件夹时自动被提示安装你的市场。将你的市场添加到 `.claude/settings.json`：

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```

你还可以指定默认启用哪些插件：

```json
{
  "enabledPlugins": {
    "code-formatter@company-tools": true,
    "deployment-tools@company-tools": true
  }
}
```

有关完整配置选项，请参阅[插件设置](/zh/settings#plugin-settings)。

如果你使用带相对路径的本地 `directory` 或 `file` 来源，路径会相对于仓库的主检出目录解析。当你从 git 工作树运行 Claude Code 时，路径仍指向主检出目录，因此所有工作树共享相同的市场位置。市场状态按用户存储在 `~/.claude/plugins/known_marketplaces.json` 中，而非按项目。

### 为容器预填充插件

对于容器镜像和 CI 环境，你可以在构建时预填充插件目录，使 Claude Code 启动时市场和插件已可用，无需在运行时克隆任何内容。将 `CLAUDE_CODE_PLUGIN_SEED_DIR` 环境变量设为指向此目录。

要分层多个种子目录，在 Unix 上用 `:` 分隔路径，在 Windows 上用 `;`。Claude Code 按顺序搜索每个目录，第一个包含给定市场或插件缓存的种子优先。

种子目录镜像 `~/.claude/plugins` 的结构：

```
$CLAUDE_CODE_PLUGIN_SEED_DIR/
  known_marketplaces.json
  marketplaces/<name>/...
  cache/<marketplace>/<plugin>/<version>/...
```

要构建种子目录，在镜像构建期间运行一次 Claude Code，安装所需的插件，然后将生成的 `~/.claude/plugins` 目录复制到镜像中并将 `CLAUDE_CODE_PLUGIN_SEED_DIR` 指向它。

要跳过复制步骤，在构建期间将 `CLAUDE_CODE_PLUGIN_CACHE_DIR` 设为目标种子路径，使插件直接安装到那里：

```bash
CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed claude plugin marketplace add your-org/plugins
CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed claude plugin install my-tool@your-plugins
```

然后在容器的运行时环境中设置 `CLAUDE_CODE_PLUGIN_SEED_DIR=/opt/claude-seed`，使 Claude Code 在启动时从种子读取。

启动时，Claude Code 将种子 `known_marketplaces.json` 中发现的市场注册到主配置中，并使用 `cache/` 下找到的插件缓存而不重新克隆。这在交互模式和使用 `-p` 标志的非交互模式下都有效。

行为详情：

* **只读**：种子目录永远不会被写入。种子市场的自动更新被禁用，因为 git pull 在只读文件系统上会失败。
* **种子条目优先**：种子中声明的市场在每次启动时覆盖用户配置中的任何匹配条目。要退出种子插件，请使用 `/plugin disable` 而不是移除市场。
* **路径解析**：Claude Code 通过在运行时探测 `$CLAUDE_CODE_PLUGIN_SEED_DIR/marketplaces/<name>/` 来定位市场内容，而不是信任种子 JSON 中存储的路径。这意味着即使种子挂载在与构建时不同的路径下也能正常工作。
* **变更被阻止**：对种子管理的市场运行 `/plugin marketplace remove` 或 `/plugin marketplace update` 会失败，并提示你要求管理员更新种子镜像。
* **与设置组合**：如果 `extraKnownMarketplaces` 或 `enabledPlugins` 声明了种子中已存在的市场，Claude Code 使用种子副本而不是克隆。

### 托管市场限制

对于需要严格控制插件来源的组织，管理员可以使用托管设置中的 [`strictKnownMarketplaces`](/zh/settings#strictknownmarketplaces) 设置限制用户允许添加哪些插件市场。

当在托管设置中配置 `strictKnownMarketplaces` 时，限制行为取决于值：

| 值 | 行为 |
| --- | --- |
| 未定义（默认） | 无限制。用户可以添加任何市场 |
| 空数组 `[]` | 完全锁定。用户不能添加任何新市场 |
| 来源列表 | 用户只能添加与允许列表完全匹配的市场 |

#### 常见配置

禁用所有市场添加：

```json
{
  "strictKnownMarketplaces": []
}
```

仅允许特定市场：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme-corp/approved-plugins"
    },
    {
      "source": "github",
      "repo": "acme-corp/security-tools",
      "ref": "v2.0"
    },
    {
      "source": "url",
      "url": "https://plugins.example.com/marketplace.json"
    }
  ]
}
```

允许内部 git 服务器上的所有市场，使用对主机的正则表达式模式匹配。这是 [GitHub Enterprise Server](/zh/github-enterprise-server#plugin-marketplaces-on-ghes) 或自托管 GitLab 实例的推荐方法：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

允许来自特定目录的基于文件系统的市场，使用对路径的正则表达式模式匹配：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "pathPattern",
      "pathPattern": "^/opt/approved/"
    }
  ]
}
```

使用 `".*"` 作为 `pathPattern` 可允许任何文件系统路径，同时仍用 `hostPattern` 控制网络来源。

`strictKnownMarketplaces` 限制用户可以添加的内容，但不会自行注册市场。要使允许的市场无需用户运行 `/plugin marketplace add` 即可自动可用，请在同一 `managed-settings.json` 中将其与 [`extraKnownMarketplaces`](/zh/settings#extraknownmarketplaces) 配对使用。参见[同时使用两者](/zh/settings#strictknownmarketplaces)。

#### 限制如何工作

限制在任何网络或文件系统操作之前检查。检查在市场添加以及插件安装、更新、刷新和自动更新时运行。如果市场在策略配置之前添加且其来源不再匹配允许列表，Claude Code 拒绝从中安装或更新插件。相同的执行适用于 `blockedMarketplaces`。

允许列表对大多数来源类型使用精确匹配。要允许市场，所有指定字段必须完全匹配：

* 对于 GitHub 来源：`repo` 是必填的，如果允许列表中指定了 `ref` 或 `path`，它们也必须匹配
* 对于 URL 来源：完整 URL 必须完全匹配
* 对于 `hostPattern` 来源：市场主机与正则表达式模式匹配
* 对于 `pathPattern` 来源：市场的文件系统路径与正则表达式模式匹配

精确匹配不标准化 URL：尾部斜杠、`.git` 后缀或 `ssh://` 与 `https://` 形式被视为不同值。如果你的组织的市场可以通过多种 URL 形式克隆，优先使用 `hostPattern` 条目而非字面 URL，以便所有形式都匹配。

由于 `strictKnownMarketplaces` 在[托管设置](/zh/settings#settings-files)中设置，个人用户和项目配置无法覆盖这些限制。

有关完整配置详情，包括所有支持的来源类型以及与 `extraKnownMarketplaces` 的比较，请参阅 [strictKnownMarketplaces 参考](/zh/settings#strictknownmarketplaces)。

### 版本解析和发布渠道

插件版本决定缓存路径和更新检测：如果解析的版本与用户已有的版本匹配，`/plugin update` 和自动更新会跳过该插件。

Claude Code 从以下按优先级设置的第一个来解析插件版本：

1. 插件 `plugin.json` 中的 `version`
2. 插件市场条目中的 `version`
3. 插件来源的 git 提交 SHA

对于基于 git 的来源类型 `github`、`url`、`git-subdir` 以及 git 托管市场内的相对路径，你可以完全省略 `version`，每个新提交都被视为新版本。这是内部或积极开发的插件的最简单设置。

设置 `version` 会固定插件。如果 `plugin.json` 声明 `"version": "1.0.0"`，推送新提交而不更改该字符串对现有用户不起作用，因为 Claude Code 看到相同版本并保留缓存副本。每次发布时递增该字段，或省略以使用提交 SHA。

避免在 `plugin.json` 和市场条目中同时设置 `version`。`plugin.json` 的值总是静默胜出，因此过时的清单版本可能掩盖你在 `marketplace.json` 中设置的版本。

#### 设置发布渠道

要为插件支持"稳定"和"最新"发布渠道，你可以设置两个指向同一仓库的不同 ref 或 SHA 的市场。然后可以通过[托管设置](/zh/settings#settings-files)将两个市场分配给不同的用户组。

每个渠道必须解析为不同的版本。如果使用显式版本，`plugin.json` 必须在每个固定的 ref 声明不同的 `version`。如果省略 `version`，不同的提交 SHA 已经区分了渠道。如果两个 ref 解析为相同的版本字符串，Claude Code 将它们视为相同并跳过更新。

##### 示例

```json
{
  "name": "stable-tools",
  "plugins": [
    {
      "name": "code-formatter",
      "source": {
        "source": "github",
        "repo": "acme-corp/code-formatter",
        "ref": "stable"
      }
    }
  ]
}
```

```json
{
  "name": "latest-tools",
  "plugins": [
    {
      "name": "code-formatter",
      "source": {
        "source": "github",
        "repo": "acme-corp/code-formatter",
        "ref": "latest"
      }
    }
  ]
}
```

##### 将渠道分配给用户组

通过托管设置将每个市场分配给适当的用户组。例如，稳定组接收：

```json
{
  "extraKnownMarketplaces": {
    "stable-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/stable-tools"
      }
    }
  }
}
```

抢先体验组接收 `latest-tools`：

```json
{
  "extraKnownMarketplaces": {
    "latest-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/latest-tools"
      }
    }
  }
}
```

#### 固定依赖版本

插件可以将其依赖项约束到 semver 范围，以便依赖项的更新不会破坏依赖插件。参见[约束插件依赖版本](/zh/plugin-dependencies)了解 `{plugin-name}--v{version}` git 标签约定、范围语法以及如何组合同一依赖项的多个约束。

## 验证和测试

在共享前测试你的市场。

验证你的市场 JSON 语法：

```bash
claude plugin validate .
```

或在 Claude Code 内部：

```shell
/plugin validate .
```

添加市场进行测试：

```shell
/plugin marketplace add ./path/to/marketplace
```

安装测试插件以验证一切正常：

```shell
/plugin install test-plugin@marketplace-name
```

有关完整的插件测试工作流，请参阅[本地测试插件](/zh/plugins#test-your-plugins-locally)。有关技术故障排除，请参阅[插件参考](/zh/plugins-reference)。

## 从 CLI 管理市场

Claude Code 提供非交互式 `claude plugin marketplace` 子命令，用于脚本和自动化。这些等同于交互式会话中可用的 `/plugin marketplace` 命令。

### Plugin marketplace add

从 GitHub 仓库、git URL、远程 URL 或本地路径添加市场。

```bash
claude plugin marketplace add <source> [options]
```

**参数：**

* `<source>`：GitHub `owner/repo` 简写、git URL、指向 `marketplace.json` 文件的远程 URL 或本地目录路径。要固定到分支或标签，在 GitHub 简写后附加 `@ref` 或在 git URL 后附加 `#ref`

**选项：**

| 选项 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--scope <scope>` | 在何处声明市场：`user`、`project` 或 `local`。参见[插件安装范围](/zh/plugins-reference#plugin-installation-scopes) | `user` |
| `--sparse <paths...>` | 通过 git sparse-checkout 将检出限制到特定目录。适用于 monorepo | |

使用 `owner/repo` 简写从 GitHub 添加市场：

```bash
claude plugin marketplace add acme-corp/claude-plugins
```

使用 `@ref` 固定到特定分支或标签：

```bash
claude plugin marketplace add acme-corp/claude-plugins@v2.0
```

从非 GitHub 主机的 git URL 添加：

```bash
claude plugin marketplace add https://gitlab.example.com/team/plugins.git
```

从直接提供 `marketplace.json` 文件的远程 URL 添加：

```bash
claude plugin marketplace add https://example.com/marketplace.json
```

从本地目录添加以进行测试：

```bash
claude plugin marketplace add ./my-marketplace
```

在项目范围声明市场，以便通过 `.claude/settings.json` 与团队共享：

```bash
claude plugin marketplace add acme-corp/claude-plugins --scope project
```

对于 monorepo，将检出限制到包含插件内容的目录：

```bash
claude plugin marketplace add acme-corp/monorepo --sparse .claude-plugin plugins
```

### Plugin marketplace list

列出所有已配置的市场。

```bash
claude plugin marketplace list [options]
```

**选项：**

| 选项 | 描述 |
| :--- | :--- |
| `--json` | 以 JSON 输出 |

使用 `--json` 时，每个条目包含 `name`、`source` 和来源特定字段：GitHub 来源的 `repo`、git 和 URL 来源的 `url`、本地来源的 `path`。当市场以固定的分支或标签添加时，GitHub 和 git 来源还包含 `ref` 字段。

### Plugin marketplace remove

移除已配置的市场。别名 `rm` 也可用。

```bash
claude plugin marketplace remove <name> [options]
```

**参数：**

* `<name>`：要移除的市场名称，如 `claude plugin marketplace list` 所示。这是 `marketplace.json` 中的 `name`，而不是你传给 `add` 的来源

**选项：**

| 选项 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--scope <scope>` | 将移除限制到单个设置范围：`user`、`project` 或 `local`。参见[插件安装范围](/zh/plugins-reference#plugin-installation-scopes)。省略时，声明从每个可编辑范围移除。给定时，仅移除该范围的声明；当市场仍在另一个范围声明时，共享状态、缓存和已安装的插件数据被保留 | （所有范围） |

从最后一个剩余范围移除市场也会卸载你从中安装的所有插件。要在不丢失已安装插件的情况下刷新市场，请改用 `claude plugin marketplace update`。

### Plugin marketplace update

从来源刷新市场以获取新插件和版本变更。

```bash
claude plugin marketplace update [name]
```

**参数：**

* `[name]`：要更新的市场名称，如 `claude plugin marketplace list` 所示。省略时更新所有市场

`remove` 和 `update` 在对种子管理的市场运行时都会失败，因为它是只读的。更新所有市场时，种子管理的条目会被跳过，其他市场仍会更新。要更改种子提供的插件，请要求管理员更新种子镜像。参见[为容器预填充插件](#为容器预填充插件)。

## 故障排除

### 市场未加载

**症状**：无法添加市场或看不到其中的插件

**解决方案**：

* 验证市场 URL 可访问
* 检查 `.claude-plugin/marketplace.json` 是否存在于指定路径
* 使用 `claude plugin validate` 或 `/plugin validate` 确保 JSON 语法有效。要检查技能、代理和命令的 frontmatter，请对每个插件目录运行该命令
* 对于私有仓库，确认你有访问权限

### 市场验证错误

从市场目录运行 `claude plugin validate .` 或 `/plugin validate .` 以检查问题。当指向市场目录时，验证器仅检查 `marketplace.json`：schema、重复插件名称、源路径遍历以及与每个引用的 `plugin.json` 的版本不匹配。

要验证单个插件的 `plugin.json` 及其技能、代理、命令和钩子文件，请对插件目录本身运行该命令，例如 `claude plugin validate ./plugins/my-plugin`。常见错误：

| 错误 | 原因 | 解决方案 |
| :--- | :--- | :--- |
| `File not found: .claude-plugin/marketplace.json` | 缺少清单 | 创建包含必填字段的 `.claude-plugin/marketplace.json` |
| `Invalid JSON syntax: Unexpected token...` | marketplace.json 中的 JSON 语法错误 | 检查缺少逗号、多余逗号或未引用的字符串 |
| `Duplicate plugin name "x" found in marketplace` | 两个插件同名 | 给每个插件唯一的 `name` 值 |
| `plugins[0].source: Path contains ".."` | 源路径包含 `..` | 使用相对于市场根目录且不含 `..` 的路径。参见[相对路径](#相对路径) |
| `YAML frontmatter failed to parse: ...` | 技能、代理或命令文件中的 YAML 无效 | 修复 frontmatter 块中的 YAML 语法。运行时此文件加载时无元数据。仅在验证插件目录时报告 |
| `Invalid JSON syntax: ...`（hooks.json） | 格式错误的 `hooks/hooks.json` | 修复 JSON 语法。格式错误的 `hooks/hooks.json` 会阻止整个插件加载。仅在验证插件目录时报告 |

**警告**（非阻塞）：

* `Marketplace has no plugins defined`：向 `plugins` 数组添加至少一个插件
* `No marketplace description provided`：添加顶层 `description` 以帮助用户了解你的市场
* `Plugin name "x" is not kebab-case`：插件名称包含大写字母、空格或特殊字符。重命名为仅小写字母、数字和连字符（例如 `my-plugin`）。Claude Code 接受其他形式，但 Claude.ai 市场同步会拒绝它们。

### 插件安装失败

**症状**：市场出现但插件安装失败

**解决方案**：

* 验证插件源 URL 可访问
* 检查插件目录是否包含必需文件
* 对于 GitHub 来源，确保仓库是公开的或你有访问权限
* 通过克隆/下载手动测试插件来源

### 私有仓库认证失败

**症状**：从私有仓库安装插件时出现认证错误

**解决方案**：

对于手动安装和更新：

* 验证你已通过 git 提供商认证（例如，对 GitHub 运行 `gh auth status`）
* 检查凭证助手是否正确配置：`git config --global credential.helper`
* 尝试手动克隆仓库以验证你的凭证是否有效

对于后台自动更新：

* 在环境中设置适当的令牌：`echo $GITHUB_TOKEN`
* 检查令牌是否具有所需权限（仓库的读取访问权限）
* 对于 GitHub，确保令牌具有私有仓库的 `repo` 范围
* 对于 GitLab，确保令牌至少具有 `read_repository` 范围
* 验证令牌是否未过期

### 离线环境中市场更新失败

**症状**：市场 `git pull` 失败，Claude Code 清除现有缓存，导致插件不可用。

**原因**：默认情况下，当 `git pull` 失败时，Claude Code 移除过时的克隆并尝试重新克隆。在离线或隔离环境中，重新克隆同样失败，使市场目录为空。

**解决方案**：设置 `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE=1` 以在拉取失败时保留现有缓存，而不是清除它：

```bash
export CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE=1
```

设置此变量后，Claude Code 在 `git pull` 失败时保留过时的市场克隆，并继续使用最后已知的良好状态。对于仓库永远不可达的完全离线部署，请改用 [`CLAUDE_CODE_PLUGIN_SEED_DIR`](#为容器预填充插件) 在构建时预填充插件目录。

### Git 操作超时

**症状**：插件安装或市场更新失败，出现超时错误，如 "Git clone timed out after 120s" 或 "Git pull timed out after 120s"。

**原因**：Claude Code 对所有 git 操作使用 120 秒超时，包括克隆插件仓库和拉取市场更新。大型仓库或慢速网络连接可能超过此限制。

**解决方案**：使用 `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` 环境变量增加超时。值以毫秒为单位：

```bash
export CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS=300000  # 5 分钟
```

### 基于 URL 的市场中相对路径插件失败

**症状**：通过 URL 添加了市场（如 `https://example.com/marketplace.json`），但具有相对路径来源（如 `"./plugins/my-plugin"`）的插件安装失败，出现 "path not found" 错误。

**原因**：基于 URL 的市场仅下载 `marketplace.json` 文件本身。它们不从服务器下载插件文件。市场条目中的相对路径引用了未下载的远程服务器上的文件。

**解决方案**：

* **使用外部来源**：将插件条目更改为使用 GitHub、npm 或 git URL 来源，而不是相对路径：
  ```json
  { "name": "my-plugin", "source": { "source": "github", "repo": "owner/repo" } }
  ```
* **使用基于 Git 的市场**：在 Git 仓库中托管你的市场，并使用 git URL 添加它。基于 Git 的市场克隆整个仓库，使相对路径正常工作。

### 安装后文件未找到

**症状**：插件安装成功但引用文件失败，尤其是插件目录外部的文件

**原因**：插件被复制到缓存目录而非就地使用。引用插件目录外部文件的路径（如 `../shared-utils`）将不起作用，因为这些文件未被复制。

**解决方案**：参见[插件缓存和文件解析](/zh/plugins-reference#plugin-caching-and-file-resolution)了解包括符号链接和目录重组的解决方法。

有关额外的调试工具和常见问题，请参阅[调试和开发工具](/zh/plugins-reference#debugging-and-development-tools)。

## 另请参阅

* [发现和安装预构建插件](/zh/discover-plugins) - 从现有市场安装插件
* [插件](/zh/plugins) - 创建你自己的插件
* [插件参考](/zh/plugins-reference) - 完整技术规范和 schema
* [插件设置](/zh/settings#plugin-settings) - 插件配置选项
* [strictKnownMarketplaces 参考](/zh/settings#strictknownmarketplaces) - 托管市场限制
