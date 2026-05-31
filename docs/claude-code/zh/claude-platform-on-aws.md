> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，再进行深入探索。

# AWS 上 Claude 平台上的 Claude Code

> 配置 Claude Code 使用由 Anthropic 运营的 Claude API，具备 AWS 认证、IAM 访问控制和 AWS Marketplace 计费功能。

export const ContactSalesCard = ({surface}) => {
  const utm = content => `utm_source=claude_code&utm_medium=docs&utm_content=${surface}_${content}`;
  const iconArrowRight = (size = 13) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>;
  const STYLES = `
.cc-cs {
  --cs-slate: #141413;
  --cs-clay: #d97757;
  --cs-clay-deep: #c6613f;
  --cs-gray-000: #ffffff;
  --cs-gray-700: #3d3d3a;
  --cs-border-default: rgba(31, 30, 29, 0.15);
  font-family: inherit;
}
.dark .cc-cs {
  --cs-slate: #f0eee6;
  --cs-gray-000: #262624;
  --cs-gray-700: #bfbdb4;
  --cs-border-default: rgba(240, 238, 230, 0.14);
}
.cc-cs-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 16px; margin: 0;
  background: var(--cs-gray-000); border: 0.5px solid var(--cs-border-default);
  border-radius: 8px; flex-wrap: wrap;
}
.cc-cs-text { font-size: 13px; color: var(--cs-gray-700); line-height: 1.5; flex: 1; min-width: 240px; }
.cc-cs-text strong { font-weight: 550; color: var(--cs-slate); }
.cc-cs-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cc-cs-btn-clay {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--cs-clay-deep); color: #fff; border: none;
  border-radius: 8px; padding: 8px 14px;
  font-size: 13px; font-weight: 500;
  transition: background-color 0.15s; white-space: nowrap;
}
.cc-cs-btn-clay:hover { background: var(--cs-clay); }
.cc-cs-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--cs-gray-700);
  border: 0.5px solid var(--cs-border-default);
  border-radius: 8px; padding: 8px 14px;
  font-size: 13px; font-weight: 500;
}
.cc-cs-btn-ghost:hover { background: rgba(0, 0, 0, 0.04); }
.dark .cc-cs-btn-ghost:hover { background: rgba(255, 255, 255, 0.04); }
@media (max-width: 720px) {
  .cc-cs-actions { width: 100%; }
}
`;
  return <div className="cc-cs not-prose">
      <style>{STYLES}</style>
      <div className="cc-cs-card">
        <div className="cc-cs-text">
          <strong>正在整个组织内部署 Claude Code？</strong> 与销售团队洽谈企业计划、SSO 和集中计费事宜。
        </div>
        <div className="cc-cs-actions">
          <a className="cc-cs-btn-ghost">
            查看计划
          </a>
          <a className="cc-cs-btn-clay">
            联系销售 {iconArrowRight()}
          </a>
        </div>
      </div>
    </div>;
};

export const Experiment = ({flag, treatment, children}) => {
  const VID_KEY = 'exp_vid';
  const CONSENT_COUNTRIES = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'RE', 'GP', 'MQ', 'GF', 'YT', 'BL', 'MF', 'PM', 'WF', 'PF', 'NC', 'AW', 'CW', 'SX', 'FO', 'GL', 'AX', 'GB', 'UK', 'AI', 'BM', 'IO', 'VG', 'KY', 'FK', 'GI', 'MS', 'PN', 'SH', 'TC', 'GG', 'JE', 'IM', 'CA', 'BR', 'IN']);
  const fnv1a = s => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  };
  const bucket = (seed, vid) => fnv1a(fnv1a(seed + vid) + '') % 10000 < 5000 ? 'control' : 'treatment';
  const [decision] = useState(() => {
    const params = new URLSearchParams(location.search);
    const preBucketed = document.documentElement.dataset['gb_' + flag.replace(/-/g, '_')];
    const force = params.get('gb-force');
    if (force) {
      for (const p of force.split(',')) {
        const [k, v] = p.split(':');
        if (k === flag) return {
          variant: v || 'treatment',
          track: false
        };
      }
    }
    if (navigator.globalPrivacyControl) {
      return {
        variant: 'control',
        track: false
      };
    }
    const prefsMatch = document.cookie.match(/(?:^|; )anthropic-consent-preferences=([^;]+)/);
    if (prefsMatch) {
      try {
        if (JSON.parse(decodeURIComponent(prefsMatch[1])).analytics !== true) {
          return {
            variant: 'control',
            track: false
          };
        }
      } catch {
        return {
          variant: 'control',
          track: false
        };
      }
    } else {
      const country = params.get('country')?.toUpperCase() || (document.cookie.match(/(?:^|; )cf_geo=([A-Z]{2})/) || [])[1];
      if (!country || CONSENT_COUNTRIES.has(country)) {
        return {
          variant: 'control',
          track: false
        };
      }
    }
    let vid;
    try {
      const ajsMatch = document.cookie.match(/(?:^|; )ajs_anonymous_id=([^;]+)/);
      if (ajsMatch) {
        vid = decodeURIComponent(ajsMatch[1]).replace(/^"|"$/g, '');
      } else {
        vid = localStorage.getItem(VID_KEY);
        if (!vid) {
          vid = crypto.randomUUID();
        }
        document.cookie = `ajs_anonymous_id=${vid}; domain=.claude.com; path=/; Secure; SameSite=Lax; max-age=31536000`;
      }
      try {
        localStorage.setItem(VID_KEY, vid);
      } catch {}
    } catch {
      return {
        variant: 'control',
        track: false
      };
    }
    const variant = preBucketed === '1' ? 'treatment' : preBucketed === '0' ? 'control' : bucket(flag, vid);
    return {
      variant,
      track: true,
      vid
    };
  });
  useEffect(() => {
    if (!decision.track) return;
    fetch('https://api.anthropic.com/api/event_logging/v2/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-name': 'claude_code_docs'
      },
      body: JSON.stringify({
        events: [{
          event_type: 'GrowthbookExperimentEvent',
          event_data: {
            device_id: decision.vid,
            anonymous_id: decision.vid,
            timestamp: new Date().toISOString(),
            experiment_id: flag,
            variation_id: decision.variant === 'treatment' ? 1 : 0,
            environment: 'production'
          }
        }]
      }),
      keepalive: true
    }).catch(() => {});
  }, []);
  return decision.variant === 'treatment' ? treatment : children;
};

AWS 上的 Claude 平台是由 Anthropic 运营的 Claude API，具备 AWS 认证、IAM 访问控制和 AWS Marketplace 计费功能。请求直接发送至 Anthropic 的 API，因此您将获得与 [Claude API](https://platform.claude.com/docs) 相同的模型和功能，并遵循相同的发布计划。您可以使用 AWS 凭证或工作区 API 密钥进行认证，并通过 AWS Marketplace 支付费用。

本指南旨在帮助您将 Claude Code 指向已通过 AWS 上的 Claude 平台预配置的工作区。有关之前的 AWS 订阅和工作区设置，请参阅 [AWS 上的 Claude 平台文档](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws)。

  通过 AWS Marketplace 订阅会创建一个新的 Anthropic 组织，该组织与您的 AWS 账户关联。此组织独立于您在 Anthropic 已有的任何组织，且凭据不会在两者之间转移。请使用与 AWS 关联的组织的 **工作区 ID** 和 **API 密钥**，而非预先存在的 Claude Console 账户。

## 前置条件

在配置 Claude Code 之前，您需要：

*   通过 AWS Marketplace 订阅一个活跃的 Claude Platform on AWS
*   在您的 AWS 关联的 Anthropic 组织中拥有一个工作区及其工作区 ID
*   拥有调用 Anthropic 服务权限的 IAM 主体，或者一个作用域限定在该工作区的 API 密钥
*   如果需要 SigV4 认证，您的环境中需具备 AWS 凭证（位于 `~/.aws/credentials`），或来自附加的 IAM 角色。AWS CLI 仅在 SSO 登录流程中需要。

## 设置

### 1. 配置 AWS 凭证

Claude Code 支持两种 Claude Platform on AWS 的认证方法。选择适合您团队访问管理方式的方法。

**选项 A：使用 SigV4 的 AWS 凭证**

Claude Code 使用标准的 AWS 凭证链对请求进行 SigV4 签名：环境变量、`~/.aws/credentials` 中的共享凭证、IAM 角色、AWS SSO 会话以及 AWS SDK 支持的任何其他来源。

对于本地使用，请在启动 Claude Code 前使用 AWS CLI 登录。下面的示例使用 SSO 配置文件，但任何能在标准位置生成凭证的方法均可。
```bash
aws sso login --profile my-profile
export AWS_PROFILE=my-profile
```
对于CI和自动化，请为运行器分配一个具有调用Anthropic服务权限的IAM角色，并设置 `AWS_REGION`。凭证链会自动获取该角色。

如果您的SSO凭证在会话过程中过期，请配置 [`awsAuthRefresh`](/zh/amazon-bedrock#advanced-credential-configuration)，以便Claude Code重新运行您的登录命令并进行重试，而不是直接失败。请将该命令添加到您的 `settings.json` 文件中：
```json
{
  "awsAuthRefresh": "aws sso login --profile my-profile"
}
```
**选项 B：工作区 API 密钥**

工作区 API 密钥是一种长效密钥，适用于不想管理联合 AWS 凭证的情况。请在 AWS 控制台的 **Claude Platform on AWS → API keys** 中生成一个，并将其设置为 `ANTHROPIC_AWS_API_KEY`：
```bash
export ANTHROPIC_AWS_API_KEY=sk-ant-xxxxx
```
密钥通过 `x-api-key` 传递且优先于 SigV4，因此您环境中的任何 AWS 凭证都会被忽略。来自其他 Claude Console 组织的 API 密钥在此处无法使用。

请将工作区 API 密钥视同其他生产环境凭证。[用户设置文件](/zh/settings) 中的 `env` 配置块是一种便捷的方式，可将密钥作用范围限定在您的机器上，而无需全局导出。

  `/login` 和 `/logout` 命令不会改变 AWS 上 Claude Platform 的认证。认证通过您的 AWS 凭证或工作区 API 密钥进行，而非通过 Claude.ai 订阅。

### 2. 配置 Claude Code

设置环境变量，将 Claude Code 通过 AWS 上的 Claude Platform 进行路由，而非使用默认的 Anthropic API。
```bash
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
export ANTHROPIC_AWS_WORKSPACE_ID=wrkspc_01ABCDEFGHIJKLMN
export AWS_REGION=us-east-1
```
`ANTHROPIC_AWS_WORKSPACE_ID` 是必需的，并且在每次请求中都会作为 `anthropic-workspace-id` 头部发送。基础 URL 根据 `AWS_REGION` 计算为 `https://aws-external-anthropic.{region}.api.aws`。要直接覆盖此 URL，请设置 `ANTHROPIC_AWS_BASE_URL`。

即使您的环境中存在 AWS 凭据，AWS 上的 Claude Platform 也需要主动启用。Bedrock 和 Foundry 在提供者路由中具有优先级，因此如果设置了 `CLAUDE_CODE_USE_BEDROCK` 和 `CLAUDE_CODE_USE_FOUNDRY`，请取消设置。

### 3. 固定模型版本

AWS 上的 Claude Platform 使用与直接 Claude API 相同的模型 ID。默认别名 `opus`、`sonnet` 和 `haiku` 会解析到您的工作区中可用的最新版本。

如果您将 Claude Code 部署给团队，请显式固定模型 ID，以避免新版本发布导致所有人同时切换：
```
```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-7
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-6
export ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-5
```
有关完整的模型 ID 和别名列表，请参阅[模型概览](https://platform.claude.com/docs/en/about-claude/models/overview)。其他模型相关变量，请参阅[模型配置](/zh/model-config)。

[提示词缓存](/zh/prompt-caching)默认自动启用。若要将缓存存活时间从默认的 5 分钟请求延长至 1 小时，请设置 `ENABLE_PROMPT_CACHING_1H=1`。API 对 1 小时缓存写入按更高费率计费。具体费率请参阅[提示词缓存定价](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#pricing)。

## 使用 Agent SDK

[Agent SDK](/zh/agent-sdk/overview) 读取与 CLI 相同的环境变量，因此任何生成 Claude Code 子进程的程序，只需在调用前导出 `CLAUDE_CODE_USE_ANTHROPIC_AWS`、`ANTHROPIC_AWS_WORKSPACE_ID` 以及 `ANTHROPIC_AWS_API_KEY` 或 AWS 凭证，即可将目标指向 AWS 上的 Claude 平台。
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

process.env.CLAUDE_CODE_USE_ANTHROPIC_AWS = "1";
process.env.ANTHROPIC_AWS_WORKSPACE_ID = "wrkspc_01ABCDEFGHIJKLMN";
process.env.AWS_REGION = "us-east-1";

for await (const msg of query({ prompt: "What's in this repo?" })) {
  console.log(msg);
}
```
本示例依赖于用于 SigV4 的环境 AWS 凭证链。若要改用工作区 API 密钥进行认证，请以同样方式设置 `ANTHROPIC_AWS_API_KEY`。如需了解更全面的 Agent SDK 功能，请参阅 [Agent SDK 概述](/zh/agent-sdk/overview)。

## 通过企业代理路由流量

要将流量路由至代理或 [LLM 网关](/zh/llm-gateway)，请将 `ANTHROPIC_AWS_BASE_URL` 设置为代理的地址。Claude Code 会向该 URL 发送请求，并附带相同的工作区和认证头信息，因此任何能够原样转发这些信息的网关均可使用。
```bash
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
export ANTHROPIC_AWS_WORKSPACE_ID=wrkspc_01ABCDEFGHIJKLMN
export ANTHROPIC_AWS_BASE_URL=https://anthropic-proxy.example.com
```
如果你的网关自行签名请求，请设置 `CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH=1`，这样 Claude Code 会发送未签名的请求，并让网关在转发到 AWS 前添加 SigV4 头。如果网关需要自己的令牌，请在 `ANTHROPIC_AUTH_TOKEN` 中进行设置。
```bash
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
export CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH=1
export ANTHROPIC_AWS_WORKSPACE_ID=wrkspc_01ABCDEFGHIJKLMN
export ANTHROPIC_AWS_BASE_URL=https://anthropic-proxy.example.com
```
## 故障排除

运行 `/status` 可查看已解析的提供程序以及任何明确配置的工作区 ID、区域、基础 URL 覆盖和认证跳过设置。这是确认 Claude Code 是否确实指向 AWS 上的 Claude Platform 的最快方式。

### 每个请求都出现 `403 Forbidden` 或 `AccessDenied`

Claude Code 解析出的 IAM 主体可能缺乏在您的工作区中调用 Anthropic 服务的权限。请检查附加到您的 AWS 配置文件或启动 Claude Code 的运行器的角色，并验证其是否拥有 [IAM 操作参考](https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions) 中记录的 `aws-external-anthropic` 操作。

如果您设置了 `ANTHROPIC_AWS_API_KEY`，该密钥将优先于 SigV4，过时的密钥也会产生相同的错误。请在 AWS 控制台的 **Claude Platform on AWS → API keys** 下重新生成密钥，或取消设置该变量以回退到您的 AWS 凭据。

### 请求因缺少工作区错误而失败

`ANTHROPIC_AWS_WORKSPACE_ID` 可能未设置或为空。每个 Claude Platform on AWS 请求都必须包含工作区 ID。它不会通过您的 AWS 凭据隐含。在 AWS 控制台服务页面下的 **Workspaces** 中找到该 ID，并在启动 Claude Code 之前将其导出。

### 请求仍然发送到 `api.anthropic.com`

`CLAUDE_CODE_USE_ANTHROPIC_AWS` 可能未设置或设置的值无法解析为真值。将其设置为 `1` 并运行 `/status` 以确认已解析的提供程序。如果同时设置了 `CLAUDE_CODE_USE_BEDROCK` 或 `CLAUDE_CODE_USE_FOUNDRY`，这些设置将优先于 AWS 上的 Claude Platform。

## 附加资源

配置 Claude Code 之前的 AWS 上的 Claude Platform 订阅、工作区和 IAM 设置已在平台文档中介绍：

* [AWS 上的 Claude Platform 概述](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws)：订阅、工作区设置和产品参考
* [IAM 操作参考](https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions)：权限和托管策略