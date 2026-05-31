# 远程连接

import {
  Desktop,
  Storage,
  Terminal,
} from "@components/react/oai/platform/ui/Icon.react";

远程连接让你可以从另一台设备或另一台机器使用 Codex。在 ChatGPT 移动应用中使用 Codex 来操控已连接的 Mac 或 Windows 设备上的 Codex，从另一台支持的 Codex 应用设备继续工作，或将 Codex 应用连接到 SSH 主机上的项目。

远程访问使用已连接主机的项目、线程、文件、凭据、权限、插件、Computer Use、浏览器设置和本地工具。

## 远程可执行的操作

- 在主机上的项目中启动新线程，或继续现有线程。
- 发送后续指令、回答问题并引导正在进行的工作。
- 批准命令和其他操作。
- 查看输出、差异、测试结果、终端输出和截图。
- 当 Codex 完成任务或需要你关注时收到通知。
- 在已连接的主机和线程之间切换。

以下各节介绍在 ChatGPT 移动应用中使用 Codex 控制 Codex 应用主机。要将 Codex 连接到 SSH 主机上的项目，请参阅[连接到 SSH 主机](#连接到-ssh-主机)。

<div class="not-prose my-6 max-w-4xl rounded-xl bg-[url('/images/codex/codex-wallpaper-1.webp')] bg-cover bg-center p-4 md:p-8">
  <CodexScreenshot
    alt="Codex mobile setup screen alongside the ChatGPT mobile Codex project list"
    lightSrc="/images/codex/app/mobile-setup-light.webp"
    darkSrc="/images/codex/app/mobile-setup-dark.webp"
    variant="no-wallpaper"
    maxHeight="none"
    maxWidth="420px"
  />
</div>

## 设置移动访问前的准备

Codex 移动设置支持 macOS 和 Windows 上的 Codex 应用主机。你可以从 iOS 或 Android 上的 ChatGPT 或从运行 Codex 的 Mac 控制 Windows 主机。Windows 目前无法从 Codex 应用控制另一台电脑。

确保你已具备：

- 在你要使用的 ChatGPT 账户和工作区中拥有 Codex 访问权限。
- 在 iOS 或 Android 设备上安装最新版 ChatGPT 移动应用。如果在 ChatGPT 移动应用中看不到 Codex，请先更新 ChatGPT。
- 在处于唤醒、在线状态且已登录同一账户和工作区的主机上运行最新版 Codex 应用（macOS 或 Windows）。移动设置从 Codex 应用启动；无法从 Codex CLI 或 IDE 扩展进行设置。
- 该账户或工作区所需的任何多因素认证、SSO 或通行密钥配置。

如果你通过 ChatGPT 工作区使用 Codex，你的管理员可能需要先启用远程控制访问权限，你才能从手机连接。

## 设置移动访问

从你要连接的主机上的 Codex 应用开始。设置流程会为该主机启用远程访问，然后显示一个二维码供你用手机扫描。

1. 启动 Codex 移动设置。

   在主机上打开 Codex 并在侧边栏中选择 **Set up Codex mobile**。

2. 扫描二维码。

   用手机扫描 Codex 显示的二维码。该二维码会打开 ChatGPT，以便你完成移动应用与主机的连接。

3. 在 ChatGPT 中完成设置。

   ChatGPT 会打开 Codex 移动设置流程。确认相同的 ChatGPT 账户和工作区，然后完成所需的多因素认证、SSO 或通行密钥步骤。设置成功后，主机会出现在手机上的 Codex 中。

4. 检查主机设置。

   在主机上的 Codex 中，使用 **Settings > Connections** 管理已连接的设备。你还可以选择是否保持电脑唤醒、启用 Computer Use 或安装 Chrome 扩展。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Connections settings showing devices that can control this host and remote access settings"
    lightSrc="/images/codex/app/mobile-control-this-mac-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-this-mac-framed-dark.webp"
    maxHeight="480px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  />
</div>

## 选择连接对象

从你已经在使用 Codex 的笔记本电脑或台式机开始。当你需要持续访问或不同环境时，再添加一台常开电脑或 SSH 主机。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Desktop width={17} height={17} /></span><span>你的笔记本电脑或台式机</span></span>

连接你日常运行 Codex 的 Mac 或 Windows PC。这样可以远程访问你已在使用的相同项目、线程、凭据、插件和本地设置。

如果该电脑进入睡眠、失去网络连接或关闭了 Codex，远程访问将停止，直到它恢复可用。如果你将这台电脑用作主机设备，请保持电源连接，并在可用时使用主机的连接设置保持唤醒状态。

在 Mac 笔记本上，远程访问可以在开盖并连接电源的情况下保持可用。合盖时，还需连接外接显示器。选择**睡眠**仍会停止远程访问。

在 Windows 主机上，保持会话解锁并可用于使用 [Computer Use](https://developers.openai.com/codex/app/computer-use) 的任务。Windows 上的 Computer Use 在前台运行，因此远程控制最适合在你将主机桌面专门用于任务时启动或检查工作。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Storage width={17} height={17} /></span><span>专用的常开电脑</span></span>

当你希望 Codex 在较长时间运行的工作中保持可达时，使用一台专用的常开 Mac 或 Windows PC。

在该机器上安装 Codex 需要使用的项目、凭据、插件、MCP 服务器和工具。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Terminal width={17} height={17} /></span><span>远程开发环境</span></span>

当项目已经存在于远程环境中时，使用 SSH 主机或托管的远程开发环境。先将 Codex 应用主机连接到该环境；你的手机仍然连接到 Codex 应用主机，而 Codex 在远程环境中使用其依赖项、安全策略和计算资源进行工作。

有关 SSH 设置详情，请参阅[连接到 SSH 主机](#连接到-ssh-主机)。

对于在常开电脑或远程主机上的浏览器或桌面任务，请在该主机上启用 Computer Use 并安装 Chrome 扩展。

## 来自已连接主机的内容

你的手机向 Codex 发送提示词、批准和后续消息。已连接的主机提供 Codex 使用的环境。

这意味着：

- 仓库文件和本地文档来自已连接的主机。
- Shell 命令在该主机或远程环境上运行。
- 在该主机上安装的任何插件在你远程使用 Codex 时都可用。
- MCP 服务器、技能、浏览器访问和 Computer Use 来自该主机的配置。
- 已登录的网站和桌面应用仅在主机能够访问它们时才可用。
- 沙箱设置、安全控制和操作审批仍然适用于已连接的会话。

Codex 使用安全中继层使受信任的机器可在你授权的 ChatGPT 设备之间可达，而无需将它们直接暴露到公共互联网。

## 从另一台设备继续工作

你可以从另一台已登录的支持远程控制的 Codex 应用设备继续工作。例如，如果你的笔记本电脑不可用，你可以从手机在一台常开主机上启动一个线程，然后稍后在笔记本电脑上打开 Codex 并继续该线程。

在 Mac 上的 Codex 中，使用 **Settings > Connections > Control other devices** 添加另一台主机。一台设备可以同时允许远程访问和控制另一台设备。你可以从 Mac 或 iOS/Android 上的 ChatGPT 控制 Windows 主机，但不能使用 Windows 控制另一台电脑。例如，你可以从 Mac 或手机控制 Windows 设备，但不能使用 Windows 设备控制另一台 Windows 设备。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Connections settings showing another device available under Control other devices"
    lightSrc="/images/codex/app/mobile-control-other-devices-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-other-devices-framed-dark.webp"
    maxHeight="360px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  />
</div>

## 连接到 SSH 主机

在 Codex 应用中，从 SSH 主机添加远程项目，并针对远程文件系统和 shell 运行线程。远程项目线程在远程主机上运行命令、读取文件和写入更改。

保持远程主机按照你正常使用 SSH 访问时相同的安全预期进行配置：受信任的密钥、最小权限账户和无未认证的公共监听。

1. 将主机添加到你的 SSH 配置中，以便 Codex 可以自动发现它。

   ```text
   Host devbox
     HostName devbox.example.com
     User you
     IdentityFile ~/.ssh/id_ed25519
   ```

   Codex 从 `~/.ssh/config` 读取具体主机别名，使用 OpenSSH 解析它们，并忽略仅包含模式的主机。

2. 确认你可以从运行 Codex 应用的机器 SSH 到该主机。

   ```bash
   ssh devbox
   ```

3. 在远程主机上安装并认证 Codex。

   应用通过 SSH 使用远程用户的登录 shell 启动远程 Codex 应用服务器。确保 `codex` 命令在该 shell 的远程主机 `PATH` 中可用。

4. 在 Codex 应用中，打开 **Settings > Connections**，添加或启用 SSH 主机，然后选择远程项目文件夹。

<CodexScreenshot
  alt="Codex app settings showing SSH remote connections"
  lightSrc="/images/codex/app/remote-connections-light.webp"
  darkSrc="/images/codex/app/remote-connections-dark.webp"
  maxHeight="420px"
  class="p-3 sm:p-4"
  imageClass="rounded-xl"
/>

## 认证和网络暴露

远程连接使用 SSH 来启动和管理远程 Codex 应用服务器。不要在共享或公共网络上直接暴露应用服务器传输层。

如果你需要访问当前网络之外的远程机器，请使用 VPN 或网格联网工具，而不是将应用服务器直接暴露到互联网。

## 故障排除

### 手机上看不到主机

确认 Codex 应用正在主机上运行，你已启用 **Allow other devices to connect**，且两台设备使用相同的 ChatGPT 账户和工作区。

### 审批请求未出现

在 ChatGPT 移动应用中打开 Codex。确认手机和主机使用相同的 ChatGPT 账户和工作区，然后再次扫描二维码或从主机重新启动设置。如果你使用 ChatGPT 工作区，请让管理员确认他们已启用远程控制访问权限。

### 远程会话断开连接

检查主机是否进入睡眠、失去网络连接或关闭了 Codex。在 Codex 工作期间保持主机唤醒和连接。

### 认证阻止设置

完成设置过程中显示的账户或工作区认证提示。如果你的组织要求 SSO、多因素认证或通行密钥，请在重试之前完成该流程。如果设置仍然失败，请让工作区管理员确认他们已启用远程控制访问权限。

## 另请参阅

- [Codex App](https://developers.openai.com/codex/app)
- [Codex App features](https://developers.openai.com/codex/app/features)
- [Codex App settings](https://developers.openai.com/codex/app/settings)
- [Computer Use](https://developers.openai.com/codex/app/computer-use)
- [Chrome extension](https://developers.openai.com/codex/app/chrome-extension)
- [Command line options](https://developers.openai.com/codex/cli/reference)
- [Authentication](https://developers.openai.com/codex/auth)
