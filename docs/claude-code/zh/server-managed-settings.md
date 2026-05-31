> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# 配置服务器托管设置

> 通过服务器下发设置，为您的组织集中配置 Claude Code，无需设备管理基础设施。

服务器托管设置允许管理员通过 Claude.ai 上的基于 Web 的界面集中配置 Claude Code。当用户使用其组织凭据进行身份验证时，Claude Code 客户端会自动接收这些设置。

此方法适用于尚未部署设备管理基础设施的组织，或需要在非托管设备上为用户管理设置的组织。

服务器托管设置适用于 [Claude for Teams](https://claude.com/pricing?utm_source=claude_code\&utm_medium=docs\&utm_content=server_settings_teams#team-&-enterprise) 和 [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code\&utm_medium=docs\&utm_content=server_settings_enterprise) 客户。

## 要求

要使用服务器托管设置，您需要：

* Claude for Teams 或 Claude for Enterprise 计划
* Claude for Teams 需要 Claude Code 2.1.38 或更高版本，Claude for Enterprise 需要 2.1.30 或更高版本
* 能够访问 `api.anthropic.com` 的网络

## 选择服务器托管还是端点托管设置

Claude Code 支持两种集中配置方式。服务器托管设置从 Anthropic 的服务器下发配置。[端点托管设置](/zh/settings#settings-files)通过原生操作系统策略（macOS 托管偏好设置、Windows 注册表）或托管设置文件直接部署到设备。

| 方式                                                         | 适用场景                                                   | 安全模型                                                                                                  |
| :----------------------------------------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **服务器托管设置**                                              | 没有 MDM 的组织，或非托管设备上的用户                      | 在身份验证时从 Anthropic 的服务器下发设置                                                                   |
| **[端点托管设置](/zh/settings#settings-files)**                 | 拥有 MDM 或端点管理的组织                                  | 通过 MDM 配置文件、注册表策略或托管设置文件将设置部署到设备                                                    |

如果您的设备已注册到 MDM 或端点管理解决方案中，端点托管设置提供更强的安全保障，因为设置文件可以在操作系统级别防止用户修改。

## 配置服务器托管设置

1. **打开管理控制台**

   在 [Claude.ai](https://claude.ai) 中，导航到 **Admin Settings > Claude Code > Managed settings**。

2. **定义您的设置**

   以 JSON 格式添加您的配置。除限制为操作系统级别策略下发的设置外，[`settings.json` 中可用的所有设置](/zh/settings#available-settings)均受支持；详见[当前限制](#当前限制)。这包括[钩子](/zh/hooks)、[环境变量](/zh/env-vars)和[仅限托管设置](/zh/permissions#managed-only-settings)，如 `allowManagedPermissionRulesOnly`。

   以下示例强制执行权限拒绝列表，防止用户绕过权限，并将权限规则限制为托管设置中定义的规则：

   ```json
   {
     "permissions": {
       "deny": [
         "Bash(curl *)",
         "Read(./.env)",
         "Read(./.env.*)",
         "Read(./secrets/**)"
       ],
       "disableBypassPermissionsMode": "disable"
     },
     "allowManagedPermissionRulesOnly": true
   }
   ```

   钩子使用与 `settings.json` 中相同的格式。

   以下示例在整个组织中每次文件编辑后运行审计脚本：

   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [
             { "type": "command", "command": "/usr/local/bin/audit-edit.sh" }
           ]
         }
       ]
     }
   }
   ```

   要配置[自动模式](/zh/permission-modes#eliminate-prompts-with-auto-mode)分类器，使其了解您的组织信任哪些仓库、存储桶和域名：

   ```json
   {
     "autoMode": {
       "environment": [
         "Source control: github.example.com/acme-corp and all repos under it",
         "Trusted cloud buckets: s3://acme-build-artifacts, gs://acme-ml-datasets",
         "Trusted internal domains: *.corp.example.com"
       ]
     }
   }
   ```

   由于钩子会执行 shell 命令，用户在应用之前会看到[安全审批对话框](#安全审批对话框)。有关 `autoMode` 条目如何影响分类器的阻止行为，以及 `environment`、`allow`、`soft_deny` 和 `hard_deny` 字段的重要警告，请参阅[配置自动模式](/zh/auto-mode-config)。

3. **保存并部署**

   保存更改。Claude Code 客户端会在下次启动或每小时轮询周期时接收更新的设置。

### 验证设置下发

要确认设置已生效，请让用户重启 Claude Code。如果配置包含触发[安全审批对话框](#安全审批对话框)的设置，用户会在启动时看到描述托管设置的提示。您还可以让用户运行 `/permissions` 查看其有效权限规则，以验证托管权限规则是否已激活。

### 访问控制

以下角色可以管理服务器托管设置：

* **主要所有者**
* **所有者**

请将访问权限限制给受信任的人员，因为设置更改会应用于组织中的所有用户。

### 仅限托管设置

大多数[设置键](/zh/settings#available-settings)在任何作用域下都有效。少数键仅从托管设置中读取，放在用户或项目设置文件中不起作用。完整列表请参阅[仅限托管设置](/zh/permissions#managed-only-settings)。不在该列表上的设置仍然可以放在托管设置中，并具有最高优先级。

### 当前限制

服务器托管设置有以下限制：

* 设置统一应用于组织中的所有用户。尚不支持按组配置。
* [`managed-mcp.json`](/zh/managed-mcp) 文件无法通过服务器托管设置分发。请改为在其中下发 `allowedMcpServers` 和 `deniedMcpServers` 策略键。
* 限制为操作系统级别策略源的设置（如 `policyHelper` 和 `wslInheritsWindowsSettings`）不会被接受。请通过 MDM 或系统 `managed-settings.json` 文件部署这些设置。

## 设置下发

### 设置优先级

服务器托管设置和[端点托管设置](/zh/settings#settings-files)都处于 Claude Code [设置层级](/zh/settings#settings-precedence)的最高层。没有其他设置级别可以覆盖它们，包括命令行参数。

在托管层中，第一个下发非空配置的源生效。服务器托管设置首先检查，然后是端点托管设置。源之间不会合并：如果服务器托管设置下发了任何键，端点托管设置将被完全忽略。如果服务器托管设置未下发任何内容，则端点托管设置生效。

如果您在管理控制台中清除服务器托管配置，意图回退到端点托管的 plist 或注册表策略，请注意[缓存的设置](#获取和缓存行为)会在客户端机器上持续存在，直到下次成功获取。运行 `/status` 查看当前活动的托管源。

### 获取和缓存行为

Claude Code 在启动时从 Anthropic 的服务器获取设置，并在活动会话期间每小时轮询更新。

**首次启动时无缓存设置：**

* Claude Code 异步获取设置
* 如果获取失败，Claude Code 在没有托管设置的情况下继续运行
* 在设置加载之前有一个短暂的窗口，限制尚未生效

**后续启动时有缓存设置：**

* 缓存的设置在启动时立即生效
* Claude Code 在后台获取新的设置
* 缓存的设置在网络故障期间持续存在

Claude Code 无需重启即可自动应用设置更新，但 OpenTelemetry 配置等高级设置除外，这些设置需要完全重启才能生效。

### 强制故障关闭启动

默认情况下，如果在启动时远程设置获取失败，CLI 会在没有托管设置的情况下继续运行。对于这种短暂的未强制窗口不可接受的环境，请在托管设置中设置 `forceRemoteSettingsRefresh: true`。

当此设置激活时，CLI 在启动时会阻塞，直到远程设置被最新获取。如果获取失败，CLI 会退出而不是在没有策略的情况下继续运行。此设置会自我延续：一旦从服务器下发，它也会在本地缓存，这样后续启动即使在新会话的首次成功获取之前也会强制执行相同的行为。

要启用此功能，请将该键添加到您的托管设置配置中：

```json
{
  "forceRemoteSettingsRefresh": true
}
```

在启用此设置之前，请确保您的网络策略允许连接到 `api.anthropic.com`。如果该端点不可达，CLI 将在启动时退出，用户无法启动 Claude Code。

从 v2.1.139 起，`claude auth` 子命令（如 `claude auth login`）不受此检查限制，因此用户可以在凭据过期导致设置获取失败时重新进行身份验证。

### 安全审批对话框

某些可能带来安全风险的设置需要用户明确批准后才能应用：

* **Shell 命令设置**：执行 shell 命令的设置
* **自定义环境变量**：不在已知安全允许列表中的变量
* **钩子配置**：任何钩子定义

当这些设置存在时，用户会看到一个安全对话框，解释正在配置的内容。用户必须批准才能继续。如果用户拒绝设置，Claude Code 将退出。

在使用 `-p` 标志的非交互模式下，Claude Code 会跳过安全对话框，无需用户批准即可应用设置。

## 平台可用性

服务器托管设置需要直接连接到 `api.anthropic.com`，在使用第三方模型提供商时不可用：

* Amazon Bedrock
* Google Vertex AI
* Microsoft Foundry
* 通过 `ANTHROPIC_BASE_URL` 或 [LLM 网关](/zh/llm-gateway)使用自定义 API 端点

## 审计日志

设置更改的审计日志事件可通过合规 API 或审计日志导出获取。请联系您的 Anthropic 客户团队获取访问权限。

审计事件包括执行的操作类型、执行操作的账户和设备，以及对旧值和新值的引用。

## 安全注意事项

服务器托管设置提供集中策略执行，但它们作为客户端控制运行。在非托管设备上，具有管理员或 sudo 访问权限的用户可以修改 Claude Code 二进制文件、文件系统或网络配置。

| 场景                                                                  | 行为                                                                                                                                                                                                                                                                |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 用户编辑缓存的设置文件                                                    | 被篡改的文件在启动时应用，但正确的设置会在下次服务器获取时恢复                                                                                                                                                                                                            |
| 用户删除缓存的设置文件                                                    | 发生首次启动行为：设置异步获取，有一个短暂的未强制窗口                                                                                                                                                                                                                     |
| API 不可用                                                              | 如果可用则应用缓存的设置，否则托管设置在下次成功获取之前不会生效。设置 `forceRemoteSettingsRefresh: true` 时，CLI 会退出而不是继续运行，[`claude auth` 子命令](#强制故障关闭启动)除外                                                                         |
| 用户使用不同的组织进行身份验证                                               | 不会为托管组织以外的账户下发设置                                                                                                                                                                                                                                        |
| 用户配置了[第三方模型提供商](#平台可用性)                        | 服务器托管设置被绕过。这包括设置 `CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_USE_MANTLE`、`CLAUDE_CODE_USE_VERTEX`、`CLAUDE_CODE_USE_FOUNDRY` 或非默认的 `ANTHROPIC_BASE_URL`                                                                                              |

要检测运行时配置更改，请使用 [`ConfigChange` 钩子](/zh/hooks#configchange)记录修改或在未授权更改生效之前阻止它们。

要获得更强的执行保障，请在注册到 MDM 解决方案的设备上使用[端点托管设置](/zh/settings#settings-files)。

## 另请参阅

管理 Claude Code 配置的相关页面：

* [设置](/zh/settings)：包含所有可用设置的完整配置参考
* [端点托管设置](/zh/settings#settings-files)：由 IT 部署到设备的托管设置
* [身份验证](/zh/authentication)：设置用户对 Claude Code 的访问
* [安全性](/zh/security)：安全保障和最佳实践
