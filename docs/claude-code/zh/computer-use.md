> ## 文档索引
> 在此处获取完整文档索引：https://code.claude.com/docs/llms.txt
> 请先使用此文件查看所有可用页面，再进一步探索。

# 让 Claude 通过 CLI 使用您的电脑

> 在 Claude Code CLI 中启用电脑使用功能，让 Claude 能够在 macOS 上打开应用、点击、输入以及查看您的屏幕。无需离开终端，即可测试原生应用、调试可视化问题并自动化仅限图形界面的工具。



  计算机使用功能是在 macOS 上的一项研究预览，需要 Pro 或 Max 计划。该功能不适用于团队或企业计划。它要求 Claude Code v2.1.85 或更高版本以及交互式会话，因此无法在使用 `-p` 标志的非交互模式下使用。

计算机使用功能让 Claude 能够像您一样打开应用程序、控制屏幕并在您的机器上工作。在命令行界面中，Claude 可以编译 Swift 应用程序、启动它、点击每个按钮并截取结果截图，这一切都发生在它编写代码的同一对话中。

本页面介绍了命令行界面中计算机使用功能的工作方式。对于 macOS 或 Windows 上的桌面应用程序，请参阅[桌面版计算机使用功能](/zh/desktop#let-claude-use-your-computer)。

## 计算机使用功能可以做什么

计算机使用功能处理需要图形用户界面的任务：任何您通常需要离开终端手动完成的操作。

* **构建和验证原生应用程序**：让 Claude 构建一个 macOS 菜单栏应用程序。Claude 会编写 Swift 代码、编译它、启动它，并点击遍历每个控件以验证其功能，这一切都发生在您打开应用程序之前。
* **端到端 UI 测试**：将本地 Electron 应用程序指向 Claude 并说“测试入职流程”。Claude 会打开应用程序，点击完成注册流程，并截取每个步骤的截图。无需 Playwright 配置，无需测试工具。
* **调试视觉和布局问题**：告诉 Claude “模态框在较小窗口上被裁剪了”。Claude 会调整窗口大小，重现错误，截取截图，修补 CSS 并验证修复。Claude 看到的和您看到的一样。
* **驱动仅限图形界面的工具**：与设计工具、硬件控制面板、iOS 模拟器或没有命令行界面或应用程序编程接口的专有应用程序进行交互。

## 何时应用计算机使用功能

Claude 有多种与应用程序或服务交互的方式。计算机使用功能是最广泛但也最慢的，因此 Claude 会首先尝试最精确的工具：

* 如果您为该服务设置了 [MCP 服务器](/zh/mcp)，Claude 会使用该服务器。
* 如果任务是 Shell 命令，Claude 会使用 Bash。
* 如果任务是浏览器工作并且您已设置 [Chrome 中的 Claude](/zh/chrome)，Claude 会使用该功能。
* 如果以上都不适用，Claude 会使用计算机使用功能。

屏幕控制保留给其他方式无法触及的情况：原生应用程序、模拟器以及没有应用程序编程接口的工具。

## 启用计算机使用功能

计算机使用功能作为名为 `computer-use` 的内置 MCP 服务器提供。默认情况下它是关闭的，直到您启用它。


    在交互式 Claude Code 会话中，运行：
    ```text
    /mcp
    ```
    在服务器列表中查找 `computer-use`。它显示为已禁用。



    选择 `computer-use` 并点击 **启用**。该设置会为每个项目保留，因此对于需要使用此功能的每个项目，您只需执行一次操作。



    首次尝试使用你的电脑时，Claude 会弹出提示要求授予两项 macOS 权限：

    * **辅助功能**：允许 Claude 执行点击、输入和滚动操作
    * **屏幕录制**：允许 Claude 查看你的屏幕内容

    提示中包含打开相关系统设置面板的链接。请授予这两项权限，然后在提示中选择 **重试**。授予屏幕录制权限后，macOS 可能要求重新启动 Claude Code。


设置完成后，让Claude执行需要图形用户界面（GUI）的任务：
```text
Build the app target, launch it, and click through each tab to make
sure nothing crashes. Screenshot any error states you find.
```
## 按会话批准应用

启用 `computer-use` 服务器并不会授予 Claude 访问您机器上所有应用的权限。当 Claude 在一个会话中首次需要使用某个特定应用时，您的终端会显示一个提示，其中包含：

*   Claude 希望控制哪些应用
*   请求的任何额外权限，例如剪贴板访问
*   Claude 工作期间将有多少其他应用被隐藏

选择 **允许用于此会话** 或 **拒绝**。批准在当前会话期间有效。当 Claude 同时请求多个应用时，您可以一次性批准。

具有广泛访问权限的应用在提示中会显示额外警告，让您知道批准它们意味着什么：

| 警告                       | 适用于                                                       |
| :------------------------- | :----------------------------------------------------------- |
| 等同于 Shell 访问          | 终端、iTerm、VS Code、Warp 以及其他终端和 IDE               |
| 可读写任何文件             | 访达                                                         |
| 可以更改系统设置           | 系统设置                                                     |

这些应用不会被阻止。警告是为了让您判断当前任务是否需要该级别的访问权限。

Claude 的控制级别也因应用类别而异：浏览器和交易平台是仅查看，终端和 IDE 是仅点击，其他所有应用则获得完全控制。请参阅 [桌面版中的应用权限](/zh/desktop#app-permissions) 了解完整的级别划分。

## Claude 如何在您的屏幕上工作

了解其工作流程有助于您预判 Claude 将要执行的操作以及如何进行干预。

### 一次仅一个会话

计算机使用功能在活动时会持有机器范围的锁定。如果另一个 Claude Code 会话已在使用您的计算机，新的尝试将失败，并显示一条消息告知您哪个会话持有该锁。请先完成或退出该会话。

### Claude 工作时应用会被隐藏

当 Claude 开始控制您的屏幕时，其他可见的应用会被隐藏，这样 Claude 只能与已批准的应用进行交互。您的终端窗口会保持可见，并且被排除在截图之外，因此您可以观察会话，而 Claude 永远看不到它自己的输出。

当 Claude 完成当前轮次后，隐藏的应用会自动恢复。

### 截图会自动降低分辨率

Claude Code 在将截图发送给模型之前会自动降低其分辨率。您无需降低显示分辨率或在 Retina 或其他高分辨率显示器上调整窗口大小。一台以原始 Retina 分辨率运行的 16 英寸 MacBook Pro 截图分辨率为 3456×2234，会降低到大约 1372×887，同时保持宽高比。

没有设置可以更改目标大小。如果降低分辨率后，屏幕上的文本或控件对 Claude 来说太小而无法读取，请在应用程序中增大它们的尺寸，而不是更改您的显示分辨率。

### 随时停止

当 Claude 获取锁时，会出现一个 macOS 通知：“Claude 正在使用您的计算机 · 按 Esc 键停止。”在任何地方按 `Esc` 键可立即中止当前操作，或在终端中按 `Ctrl+C`。无论哪种方式，Claude 都会释放锁定、取消隐藏您的应用并将控制权交还给您。

当 Claude 完成后，会出现第二个通知。

## 安全与信任边界

  与[沙箱化的Bash工具](/zh/sandboxing)不同，computer use在您实际桌面上运行，可访问您授权的应用程序。Claude会检查每个操作并标记来自屏幕内容的潜在提示词注入，但信任边界有所不同。最佳实践请参阅[computer use安全指南](https://support.claude.com/en/articles/14128542)。

内置防护措施无需配置即可降低风险：

* **逐应用审批**：Claude 仅能控制您在当前会话中已批准的应用。
* **哨兵警告**：在您批准前，会标记出授予 shell、文件系统或系统设置访问权限的应用。
* **终端排除在截图之外**：Claude 永远看不到您的终端窗口，因此您会话中的屏幕提示不会反馈到模型。
* **全局退出**：`Esc` 键可在任何地方中止计算机使用，且按键会被消耗，因此提示词注入无法利用它来关闭对话框。
* **锁文件**：同一时间只能有一个会话控制您的机器。

## 示例工作流

这些示例展示了将计算机使用与编码任务结合的常见方法。

### 验证原生构建

在更改 macOS 或 iOS 应用后，让 Claude 一次性编译并验证：
```text
Build the MenuBarStats target, launch it, open the preferences window,
and verify the interval slider updates the label. Screenshot the
preferences window when you're done.
```
Claude 运行 `xcodebuild`，启动应用，与界面交互，并报告发现的问题。

### 复现布局错误

当视觉错误仅在特定窗口大小出现时，让 Claude 来定位它：
```text
The settings modal clips its footer on narrow windows. Resize the app
window down until you can reproduce it, screenshot the clipped state,
then check the CSS for the modal container.
```
Claude 调整窗口大小，捕获损坏状态，并读取相关样式表。

### 测试模拟器流程

无需编写 XCTest 即可驱动 iOS Simulator：
```text
Open the iOS Simulator, launch the app, tap through the onboarding
screens, and tell me if any screen takes more than a second to load.
```
Claude 使用模拟器的方式与您使用鼠标的方式相同。

## 与桌面应用的差异

命令行界面和桌面端共享相同的计算机使用引擎，但存在一些差异：

| 功能                 | 桌面端                                                        | 命令行界面                      |
| :------------------- | :------------------------------------------------------------ | :------------------------------ |
| 支持平台             | macOS 和 Windows                                              | 仅 macOS                        |
| 启用方式             | 在**设置 > 通用**（**桌面应用**下）切换                        | 在 `/mcp` 中启用 `computer-use` |
| 禁止应用列表         | 可在设置中配置                                                | 尚未提供                        |
| 自动取消隐藏切换     | 可选                                                          | 始终开启                        |
| Dispatch 集成        | Dispatch 启动的会话可以使用计算机使用功能                      | 不适用                          |

## 故障排除

### “计算机使用正被另一个 Claude 会话占用”

另一个 Claude Code 会话持有锁定。请在该会话中完成任务或退出该会话。如果另一个会话崩溃，当 Claude 检测到进程不再运行时，锁定会自动释放。

### macOS 权限提示反复出现

macOS 有时会在您授予屏幕录制权限后要求重启请求进程。请完全退出 Claude Code 并开始新的会话。如果提示仍然存在，请打开**系统设置 > 隐私与安全性 > 屏幕录制**，确认您的终端应用已列出并启用。

### `computer-use` 未出现在 `/mcp` 中

此服务器仅在符合条件的系统上出现。请检查：

*   您使用的是 macOS。CLI 中的计算机使用功能在 Linux 或 Windows 上不可用。在 Windows 上，请改用[桌面端中的计算机使用功能](/zh/desktop#let-claude-use-your-computer)。
*   您运行的是 Claude Code v2.1.85 或更高版本。运行 `claude --version` 进行检查。
*   您拥有 Pro 或 Max 计划。运行 `/status` 确认您的订阅状态。
*   您通过 claude.ai 进行身份验证。计算机使用功能不适用于第三方提供商，如 Amazon Bedrock、Google Cloud Vertex AI 或 Microsoft Foundry。如果您仅通过第三方提供商访问 Claude，则需要单独的 claude.ai 账户才能使用此功能。
*   您处于交互式会话中。计算机使用功能在带有 `-p` 标志的非交互模式下不可用。

## 另请参阅

*   [桌面端中的计算机使用功能](/zh/desktop#let-claude-use-your-computer)：相同的功能，配有图形设置页面
*   [Chrome 中的 Claude](/zh/chrome)：用于基于网络任务的浏览器自动化
*   [MCP](/zh/mcp)：将 Claude 连接到结构化工具和 API
*   [沙箱化](/zh/sandboxing)：Claude 的 Bash 工具如何隔离文件系统和网络访问
*   [计算机使用安全指南](https://support.claude.com/en/articles/14128542)：安全使用计算机的最佳实践