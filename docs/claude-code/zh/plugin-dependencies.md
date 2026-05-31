> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 约束插件依赖版本

> 声明插件依赖的版本约束，使上游插件发布破坏性变更时你的插件仍能正常工作。

插件可以通过在 `plugin.json` 或其市场条目中列出其他插件来声明依赖。默认情况下，依赖会跟踪最新可用版本，因此上游发布可能会在没有警告的情况下更改你插件的依赖。版本约束让你可以将依赖固定在经过测试的版本范围内，直到你选择升级。

当你安装一个声明了依赖的插件时，Claude Code 会自动解析并安装它们，并在安装输出的末尾列出已添加的依赖。如果某个依赖后来丢失，`/reload-plugins` 和后台插件自动更新会重新安装它，前提是其市场已在你配置的市场列表中。对依赖插件重新运行 `claude plugin install`，或使用 `claude plugin marketplace add` 添加市场，也会解决任何未处理的缺失依赖。来自你未添加的市场的依赖将保持未解析状态。

本指南面向在 `plugin.json` 中声明依赖的插件作者以及为发布打标签的市场维护者。要安装具有依赖的插件，请参阅[发现和安装插件](/zh/discover-plugins)。有关完整的清单架构，请参阅[插件参考](/zh/plugins-reference)。

**注意：** 依赖版本约束需要 Claude Code v2.1.110 或更高版本。

## 为什么要约束依赖版本

考虑一个内部市场，其中两个团队发布插件。平台团队维护 `secrets-vault`，这是一个封装密钥后端的 MCP 服务器。部署团队维护 `deploy-kit`，它在部署过程中调用 `secrets-vault` 来获取凭据。

`deploy-kit` 是针对 `secrets-vault` v2.1.0 测试的。如果没有版本约束，当平台团队标记一个重命名了某个 MCP 工具的发布时，自动更新会将每个工程师的 `secrets-vault` 移动到新版本，而 `deploy-kit` 就会出错。

有了版本约束，`deploy-kit` 声明它需要 `~2.1.0` 范围内的 `secrets-vault`。安装了 `deploy-kit` 的工程师会保持在最高匹配的 `2.1.x` 补丁版本上。部署团队可以通过发布带有更宽约束的新 `deploy-kit` 版本，按自己的计划进行升级。

## 声明带版本约束的依赖

在你的插件的 `.claude-plugin/plugin.json` 的 `dependencies` 数组中列出依赖。每个条目可以是插件名称，也可以是带有版本约束的对象。

以下清单声明了一个无版本依赖和一个有约束的依赖：

```json .claude-plugin/plugin.json
{
  "name": "deploy-kit",
  "version": "3.1.0",
  "dependencies": [
    "audit-logger",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

条目可以是仅包含插件名称的纯字符串，如上面示例中的 `"audit-logger"`，它依赖于该插件市场提供的任何版本。如需更多控制，请使用包含以下字段的对象：

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `name` | string | 插件名称。在声明插件所在的同一市场中解析。必填。 |
| `version` | string | [semver 范围](https://github.com/npm/node-semver#ranges)，如 `~2.1.0`、`^2.0`、`>=1.4` 或 `=2.1.0`。依赖将获取满足此范围的最高标签版本。 |
| `marketplace` | string | 用于解析 `name` 的不同市场。除非目标市场列在根市场的 `marketplace.json` 中的 [`allowCrossMarketplaceDependenciesOn`](#依赖来自其他市场的插件) 中，否则跨市场依赖将被阻止。 |

`version` 字段接受 Node 的 `semver` 包支持的任何表达式，包括脱字号、波浪号、连字符和比较器范围。预发布版本（如 `2.0.0-beta.1`）默认被排除，除非你的范围使用预发布后缀（如 `^2.0.0-0`）来包含它们。

## 依赖来自其他市场的插件

默认情况下，Claude Code 拒绝自动安装位于不同市场（与声明它的插件不同的市场）中的依赖。这可以防止一个市场悄悄引入你未审查过的来源的插件。

要允许此行为，根市场的维护者需要在 `marketplace.json` 的 `allowCrossMarketplaceDependenciesOn` 中添加目标市场名称。根市场是托管用户正在安装的插件的市场；只有其允许列表会被检查，因此信任不会通过中间市场链式传递。

以下 `marketplace.json` 允许 `deploy-kit` 依赖来自 `acme-shared` 的插件：

```json .claude-plugin/marketplace.json
{
  "name": "acme-tools",
  "owner": { "name": "Acme" },
  "allowCrossMarketplaceDependenciesOn": ["acme-shared"],
  "plugins": [
    {
      "name": "deploy-kit",
      "source": "./deploy-kit",
      "dependencies": [
        { "name": "audit-logger", "marketplace": "acme-shared" }
      ]
    }
  ]
}
```

如果该字段缺失或不包含目标市场，安装将失败并显示 `cross-marketplace` 错误，指出需要设置的字段。用户仍然可以先手动安装依赖，这样无需更改允许列表即可满足约束。

## 为版本解析标记插件发布

版本约束针对市场仓库的 git 标签进行解析。为了让 Claude Code 找到依赖的可用版本，上游插件的发布必须使用特定的命名约定进行标记。

将每个发布标记为 `{plugin-name}--v{version}`，其中 `{version}` 与该提交的 `plugin.json` 中的 `version` 字段匹配。在插件目录中运行：

```bash
claude plugin tag --push
```

`claude plugin tag` 命令从插件清单和所在的市场条目派生标签名称。在创建标签之前，它会验证插件内容、检查 `plugin.json` 和市场条目中的版本是否一致、要求插件目录下的工作树是干净的，并在标签已存在时拒绝创建。添加 `--dry-run` 可以查看将要标记的内容而不实际创建。如果你自己保持 `plugin.json` 和市场条目同步，直接运行 `git tag secrets-vault--v2.1.0` 也是等效的。

插件名称前缀允许一个市场仓库托管多个具有独立版本线的插件。`--v` 分隔符作为完整插件名称的前缀匹配进行解析，因此包含连字符的插件名称也能正确处理。

当你安装一个声明了 `{ "name": "secrets-vault", "version": "~2.1.0" }` 的插件时，Claude Code 会列出市场的标签，过滤出以 `secrets-vault--v` 开头的标签，并获取满足 `~2.1.0` 的最高版本。如果没有匹配的标签，依赖插件将被禁用，并显示一个列出可用版本的错误。

已解析标签的 semver 与 `plugin.json` 的 `version` 分开记录，因此约束检查使用实际获取的标签，即使该提交中的 `plugin.json` 有陈旧的值。标签解析安装的缓存目录名称包含 12 个字符的提交 SHA 后缀，因此如果维护者将标签强制移动到不同的提交，下次安装会获得新的缓存目录，而不是重用陈旧的内容。

**注意：** 对于 `npm` 市场源，约束不会控制获取哪个版本，因为基于标签的解析仅适用于 git 支持的源。约束仍会在加载时进行检查，如果已安装版本不满足约束，依赖插件将被禁用并显示 `dependency-version-unsatisfied`。

## 约束如何交互

当多个已安装的插件约束同一个依赖时，Claude Code 会取它们范围的交集，并将依赖解析为满足所有约束的最高版本。下表展示了常见组合的解析方式。

| 插件 A 要求 | 插件 B 要求 | 结果 |
| :--- | :--- | :--- |
| `^2.0` | `>=2.1` | 安装 `2.1.0` 或更高的最高 `2.x` 标签版本。两个插件都加载。 |
| `~2.1` | `~3.0` | 插件 B 安装失败，显示 `range-conflict`。插件 A 和依赖保持原状。 |
| `=2.1.0` | 无 | 依赖保持在 `2.1.0`。在插件 A 安装期间，自动更新跳过更新的版本。 |

自动更新获取满足所有已安装插件范围的最高 git 标签版本，而不是市场的最新版本，因此依赖在其允许范围内继续接收更新。如果没有标签满足所有范围，更新将被跳过，跳过信息会出现在 `/doctor` 和 `/plugin` 错误标签页中，并指出约束插件。

当你卸载最后一个约束某个依赖的插件时，该依赖不再被固定，并在下次更新时恢复跟踪其市场条目。

## 启用或禁用具有依赖的插件

启用插件也会启用它所依赖的插件，而如果另一个已启用的插件仍然需要它，则禁用插件将被阻止。这两种行为都需要 Claude Code v2.1.143 或更高版本。早期版本仅启用或禁用指定的插件，并在下次加载时显示 `dependency-unsatisfied` 错误。

当你启用一个插件时，Claude Code 也会在同一作用域内启用其依赖。如果依赖有自己的依赖，Claude Code 也会启用它们。成功消息会列出随你指定的插件一起启用的其他内容。如果某个依赖无法启用，命令将拒绝并告知你是什么阻止了它以及如何修复：

| 条件 | 结果 |
| :--- | :--- |
| 依赖未安装 | 启用失败并打印每个缺失依赖的 `claude plugin install` 命令。 |
| 依赖被组织的插件策略阻止 | 启用失败并指出被阻止的依赖。 |
| 依赖在比目标作用域更高优先级的作用域中设置为 `false` | 启用失败。在该作用域启用依赖，或传递 `--scope` 以写入该处。 |
| 所有依赖已安装且允许 | 启用成功，并为插件和每个尚未在目标作用域启用的依赖写入 `true`。 |

即使依赖在其清单中设置了 [`defaultEnabled: false`](/zh/plugins-reference#default-enablement)，这也是如此，因为 Claude Code 会为其写入显式的 `true`。在安装时也是如此：为了满足活动插件而引入的依赖会以 `true` 安装，无论其自身的默认值如何。

当你禁用一个插件时，如果另一个已启用的插件仍然依赖它，Claude Code 会拒绝。错误会指出依赖它的插件，并给你一个链式命令来按正确顺序禁用它们，最后是你要求禁用的那个。

例如，如果 `deploy-kit` 依赖 `secrets-vault`，单独禁用 `secrets-vault` 会失败，输出类似如下：

```text
secrets-vault is still required by deploy-kit. Disable that plugin first, or
disable everything together: claude plugin disable deploy-kit@acme-tools && claude plugin disable secrets-vault@acme-tools
```

从错误中复制链式命令，一步禁用整个集合。

## 移除孤立的自动安装依赖

自动安装的依赖在安装它们的插件被卸载后仍保留在磁盘上，以防你重新安装依赖插件或想继续直接使用该依赖。要清理它们，运行 `claude plugin prune` 来列出不再有任何已安装插件需要的自动安装依赖，并在确认提示后移除它们。这需要 Claude Code v2.1.121 或更高版本。

```bash
claude plugin prune
```

默认情况下，prune 在用户作用域下运行。使用 `--scope project` 或 `--scope local` 来针对不同的作用域。传递 `--dry-run` 来列出将要移除的内容而不实际更改。传递 `-y` 跳过确认提示。当 stdin 或 stdout 不是终端时，prune 列出孤立项并退出，除非传递了 `-y`。

要在卸载时进行清理，向 `claude plugin uninstall` 传递 `--prune`。移除指定插件后，Claude Code 会扫描并移除任何现在已孤立的自动安装依赖。你手动安装的插件永远不会被清理，只有通过其他插件的 `dependencies` 数组自动安装的才会被清理。

例如，卸载 `deploy-kit` 并清理它留下的依赖：

```bash
claude plugin uninstall deploy-kit --prune
```

## 解决依赖错误

依赖问题会在 `claude plugin list`、`/plugin` 界面和 `/doctor` 中显示。受影响的插件将被禁用，直到你解决错误。以下列出了最常见的错误及其修复方法。

| 错误 | 含义 | 解决方法 |
| :--- | :--- | :--- |
| `dependency-unsatisfied` | 声明的依赖未安装，或已安装但被禁用。 | 运行错误消息中显示的 `claude plugin install` 命令。如果依赖的市场尚未配置，请使用 `claude plugin marketplace add` 添加它，Claude Code 会自动解析依赖。如果依赖被禁用，请启用它。 |
| `range-conflict` | 依赖的版本要求无法组合。错误消息指明原因：没有版本满足所有范围、范围不是有效的 semver 语法，或组合的范围太复杂无法取交集。 | 卸载或更新其中一个冲突的插件，修复任何无效的 `version` 字符串，简化过长的 `\|\|` 链，或要求上游作者放宽其约束。 |
| `dependency-version-unsatisfied` | 已安装依赖的版本超出此插件声明的范围。 | 运行 `claude plugin install <dependency>@<marketplace>` 以针对所有当前约束重新解析依赖。 |
| `no-matching-tag` | 依赖的仓库没有满足范围的 `{name}--v*` 标签。 | 检查上游是否使用上述约定标记了发布，或放宽你的范围。 |

要以编程方式检查这些错误，运行 `claude plugin list --json` 并读取每个插件的 `errors` 字段。

## 另请参阅

* [创建插件](/zh/plugins)：使用技能、代理和钩子构建插件
* [创建和分发插件市场](/zh/plugin-marketplaces)：为你的团队托管插件
* [插件参考](/zh/plugins-reference#plugin-manifest-schema)：完整的 `plugin.json` 架构
* [版本管理](/zh/plugins-reference#version-management)：插件自身版本如何解析并用作缓存键
