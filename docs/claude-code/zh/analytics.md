> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件探索所有可用页面，再深入查阅。

# 使用分析跟踪团队使用情况

> 在分析仪表板中查看 Claude Code 使用指标、跟踪采用率并衡量工程速度。

Claude Code 提供分析仪表板，帮助组织了解开发者的使用模式、跟踪贡献指标，并衡量 Claude Code 如何影响工程速度。请根据您的方案访问相应仪表板：

| 方案                     | 仪表板地址                                                                 | 包含内容                                                                          | 了解更多                                           |
| ------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| Claude for Teams / 企业版 | [claude.ai/analytics/claude-code](https://claude.ai/analytics/claude-code) | 使用指标、与 GitHub 集成的贡献指标、排行榜、数据导出                               | [详情](#访问团队和企业版分析) |
| API (Claude Console)     | [platform.claude.com/claude-code](https://platform.claude.com/claude-code) | 使用指标、花费跟踪、团队洞察                                                      | [详情](#查看团队洞察)       |

## 访问团队和企业版分析

前往 [claude.ai/analytics/claude-code](https://claude.ai/analytics/claude-code)。管理员和所有者可查看仪表板。

团队和企业版仪表板包括：

*   **使用指标**：已接受的代码行数、建议接受率、每日活跃用户和会话数
*   **贡献指标**：在 Claude Code 辅助下提交的 PR 和代码行数，包含 [GitHub 集成](#启用贡献指标)
*   **排行榜**：按 Claude Code 使用量排名的顶级贡献者
*   **数据导出**：将贡献数据下载为 CSV 格式，用于自定义报告

要获取每位用户的 token 计数和成本估算，请配置 [OpenTelemetry 导出](/zh/monitoring-usage)。

### 启用贡献指标

  贡献指标处于公开测试版，适用于 Claude for Teams 和 Claude for Enterprise 计划。这些指标仅涵盖您在 claude.ai 组织内的用户。通过 Claude Console API 或第三方集成进行的使用不包含在内。

所有 Claude for Teams 和 Claude for Enterprise 账户均可访问使用和采纳数据。若需连接您的 GitHub 组织以获取贡献指标，需进行额外设置。

您需要拥有所有者角色才能配置分析设置。GitHub 管理员必须安装 GitHub 应用。

  对于启用了[零数据保留](/zh/zero-data-retention)的组织，贡献指标不可用。分析仪表板将仅显示使用指标。




    GitHub 管理员在您的组织的 GitHub 账户上安装 Claude GitHub 应用，地址为 [github.com/apps/claude](https://github.com/apps/claude)。



    Claude所有者导航至 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) 并启用Claude Code分析功能。



    在同一个页面上，启用“GitHub analytics”开关。



    完成GitHub认证流程并选择要纳入分析的GitHub组织。

    1.  完成GitHub账户的登录与授权。
    2.  在你的账户设置中，管理并选择要让Claude Code分析的GitHub组织范围。


数据通常在启用后 24 小时内出现，并进行每日更新。如果没有看到数据，您可能会看到以下信息：

* **“需要 GitHub 应用”**：请安装 GitHub 应用以查看贡献指标
* **“数据处理中”**：如果几天后仍未出现数据，请稍后再试，并确认已安装 GitHub 应用

贡献指标支持 GitHub Cloud 和 GitHub 企业版服务器。

### 审阅摘要指标

  这些指标有意设定得比较保守，代表了对Claude Code实际贡献的低估。仅当对Claude Code的参与有高度确信时，才会统计相关的代码行和PRs。

仪表盘顶部显示以下汇总指标：

* **包含CC的PR**：合并的拉取请求总数，其中至少包含一行使用Claude Code编写的代码
* **使用CC编写的代码行数**：所有合并PR中在Claude Code协助下编写的代码总行数。仅计算“有效行”：标准化后超过3个字符的行，不包括空行和仅包含括号或无意义标点的行。
* **包含Claude Code的PR占比(%)**：包含Claude Code辅助代码的合并PR在所有合并PR中所占的百分比
* **建议接受率**：用户接受Claude Code代码编辑建议（包括Edit、Write和NotebookEdit工具使用）的百分比
* **已接受的代码行数**：用户在其会话中接受的Claude Code编写的代码总行数。这不包括被拒绝的建议，也不追踪后续删除的情况。

### 探索图表

仪表盘包含多个图表，用于可视化时间趋势。

#### 跟踪采用情况

采用情况图表显示每日使用趋势：

* **用户**：每日活跃用户数
* **会话**：每日活跃的Claude Code会话数

#### 衡量每位用户的PR数

此图表显示随时间变化的开发者个人活动：

* **每位用户的PR数**：每日合并的PR总数除以每日活跃用户数
* **用户**：每日活跃用户数

通过此图表了解随着Claude Code采用率的增加，个人生产力如何变化。

#### 查看拉取请求细分

拉取请求图表显示合并PR的每日细分：

* **包含CC的PR**：包含Claude Code辅助代码的拉取请求
* **不包含CC的PR**：不包含Claude Code辅助代码的拉取请求

切换到**代码行数**视图，可按代码行数而非PR数量查看相同的细分情况。

#### 查找顶级贡献者

排行榜显示按贡献量排名的前10名用户。可在以下选项间切换：

* **拉取请求**：显示每位用户的包含Claude Code的PR与所有PR的对比
* **代码行数**：显示每位用户使用Claude Code的代码行数与所有代码行数的对比

点击**导出所有用户**可下载所有用户的完整贡献数据为CSV文件。导出内容包含所有用户，而不仅仅是显示的前10名。

### PR归属

启用贡献指标后，Claude Code会分析合并的拉取请求，以确定哪些代码是在Claude Code协助下编写的。这是通过将Claude Code会话活动与每个PR中的代码进行匹配来实现的。

#### 标记标准

如果PR包含至少一行在Claude Code会话期间编写的代码，则会被标记为“包含Claude Code”。系统采用保守匹配：只有高度确信由Claude Code参与的代码才会计入辅助范围。

#### 归属流程

当拉取请求合并时：

1. 从PR差异中提取新增行
2. 识别在时间窗口内编辑了匹配文件的Claude Code会话
3. 使用多种策略将PR行与Claude Code输出进行匹配
4. 计算AI辅助行和总行数的指标

在比较之前，行会进行标准化处理：修剪空白、合并多个空格、标准化引号，并将文本转换为小写。

在GitHub中，包含Claude Code辅助行的合并拉取请求会被标记为 `claude-code-assisted`。

#### 时间窗口

考虑进行归属匹配的时间窗口为PR合并日期前21天至后2天。

#### 排除的文件

某些文件因自动生成而被自动排除在分析之外：

* 锁文件：package-lock.json、yarn.lock、Cargo.lock等类似文件
* 生成的代码：Protobuf输出、构建产物、压缩文件
* 构建目录：dist/、build/、node\_modules/、target/
* 测试夹具：快照、记录数据、模拟数据
* 超过1000字符的行，可能是压缩或生成的

#### 归属说明

在解读归属数据时，请牢记以下补充细节：

* 被开发人员大幅重写（差异超过20%）的代码不会归属于Claude Code
* 21天窗口之外的会话不被考虑
* 算法在执行归属时不考虑PR的源分支或目标分支

### 充分利用分析数据

利用贡献指标来展示投资回报率、识别采用模式，并找到可以帮助其他成员入门的团队成员。

#### 监控采用情况

跟踪采用情况图表和用户计数，以识别：

* 可以分享最佳实践的活跃用户
* 整个组织的整体采用趋势
* 可能表示存在摩擦或问题的使用量下降

#### 衡量投资回报率

贡献指标有助于使用来自您自己代码库的数据回答“此工具是否值得投资？”：

* 随着采用率的增加，跟踪每位用户的PR数随时间的变化
* 比较使用Claude Code与不使用Claude Code所提交的PR和代码行数
* 与[DORA指标](https://dora.dev/)、冲刺速度或其他工程关键绩效指标结合使用，以了解采用Claude Code带来的变化

#### 识别高阶用户

排行榜帮助您找到对Claude Code采用率高的团队成员，他们可以：

* 与团队分享提示技巧和工作流程
* 提供有关哪些方面运作良好的反馈
* 帮助新用户上手

### 通过API访问分析数据

使用Claude控制台的API客户可以在 [platform.claude.com/claude-code](https://platform.claude.com/claude-code) 访问分析数据。您需要UsageView权限才能访问仪表盘，该权限已授予Developer、Billing、Admin、Owner和Primary Owner角色。

  集成了 GitHub 的贡献指标目前不适用于 API 客户。控制台仪表板仅显示使用指标和支出指标。

控制台仪表板显示：

* **接受的代码行数**：用户在其会话中接受的、由Claude Code编写的代码总行数。这不包括被拒绝的建议，且不跟踪后续删除的代码。
* **建议接受率**：用户接受代码编辑工具（包括Edit、Write和NotebookEdit工具）使用请求的百分比。
* **活动**：图表上显示的每日活跃用户和会话数量。
* **费用**：以美元计的每日API费用以及用户数量。

### 查看团队洞察

团队洞察表格显示每用户指标：

* **成员**：所有已通过身份验证的Claude Code用户。API密钥用户按密钥标识符显示，OAuth用户按电子邮件地址显示。
* **本月费用**：当前月份每用户的总API费用。
* **本月代码行数**：当前月份每用户被接受的代码总行数。

  控制台仪表板中的支出数据为估算值，仅用于分析目的。实际费用请参考您的账单页面。

## 相关资源

* [使用 OpenTelemetry 进行监控](/zh/monitoring-usage)：将实时指标和事件导出到您的可观测性技术栈
* [有效管理成本](/zh/costs)：设置支出限制并优化 token 使用量
* [权限](/zh/permissions)：配置角色与权限