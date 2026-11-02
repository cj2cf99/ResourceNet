# MyNet 星图 · 数据清单

> 由 `node tools/validate-data.mjs --list docs/data-inventory.md` 生成，请勿手工编辑；修改 data.js 后重新生成。● 节点　· 属性

```text
MyNet 数据校验 · 存储键 mynet.data.v3
  skill 技能管理星域：根节点 11 · 节点 26 · 属性 8 · 关系 10
  idea  创意管理星域：根节点 19 · 节点 35 · 属性 54 · 关系 15
  res   网络资源管理星域：根节点 7 · 节点 23 · 属性 18 · 关系 14
  proj  项目管理星域：根节点 12 · 节点 52 · 属性 46 · 关系 19
校验通过（0 条提示）
```

## 技能管理星域（skill）

- ● 全栈 Web 开发 `s_web` — 构建并维护各个人站点与工具页面
  - ● 原生 JavaScript `s_web_js` — 不依赖框架编写浏览器端交互
    - · 离线队列与 IndexedDB `s_web_js_idb` — 断网时暂存数据，恢复后可靠重传
    - · 版本冲突保护 `s_web_js_conflict` — 避免旧编辑覆盖新版内容
  - ● Node.js 服务端 `s_web_node` — 用 Node.js 提供本地服务、数据库与打包
  - ● 图形与可视化 `s_web_viz` — 把数据与角色绘制成图表和动画
    - · 响应式验收 `s_web_viz_resp` — 确保页面在桌面、平板、手机上都可用
- ● C# 开发 `s_csharp` — 使用 C# 开发软件
- ● Cloudflare 平台开发 `s_cf` — 在 Cloudflare 上搭建与运维个人工作台
  - · Access 鉴权接入 `s_cf_access` — 为站点加上登录保护与身份校验
  - ● Workers 开发 `s_cf_worker` — 编写运行在边缘的页面与 API
  - ● D1 / SQLite 数据库 `s_cf_db` — 设计、迁移并安全变更业务数据库
- ● 数据工程 `s_data` — 让数据定时、可靠地流动和归档
  - ● 采集流水线 `s_data_pipe` — 定时抓取行情并发布为可读数据
    - · 行情消费契约 `s_data_pipe_contract` — 按身份与时间契约消费行情
  - ● Python 数据处理 `s_data_py` — 用 Python 编写采集与计算脚本
  - ● Salesforce 集成 `s_data_sf` — 把 Salesforce 账本只读同步到工作台
- ● 投资研究 `s_inv` — 研究个股价值与市场长期位置
  - ● 估值建模 `s_inv_val` — 用 DCF 与 PE 区间估算个股价值
  - ● 长期指标分析 `s_inv_macro` — 判断大盘相对长期趋势的高低
    - · 指标独立更新窗口 `s_inv_macro_window` — 按独立窗口维护长期指标
- ● 软件工程流程 `s_eng` — 保证改动可验证、可审核、可回溯
  - ● 自动化测试 `s_eng_test` — 用自动测试守住功能与界面
    - · 结构与脱敏校验 `s_eng_test_data` — 校验内容结构并拦截敏感信息
  - ● 发布审核 `s_eng_rel` — 在部署前记录变更并取得确认
  - ● AI 协作开发 `s_eng_ai` — 让多个 AI 分工开发、审核与交接
- ● 日语 `s_jp` — 在日本生活与工作中用日语沟通
  - · N2 / N1 表达 `s_jp_level` — 按 N2 / N1 难度组织表达
  - ● 情景会话 `s_jp_conv` — 应对做客、协作、客户安排等场景
- ● 英语 `s_english` — 使用英语理解与表达
- ● 2D 角色动画 `s_anim` — 制作可参数化控制的 2D 角色动作
  - ● 骨骼绑定与 IK `s_anim_rig` — 给角色拆层、绑骨并驱动关节
- ● 钢琴 `s_piano` — 学习钢琴演奏
- ● 小提琴 `s_violin` — 学习小提琴演奏

关系：

- Python 数据处理 `s_data_py` —帮助→ 估值建模 `s_inv_val`
- 估值建模 `s_inv_val` —诱发→ 采集流水线 `s_data_pipe`
- 图形与可视化 `s_web_viz` —帮助→ 长期指标分析 `s_inv_macro`
- D1 / SQLite 数据库 `s_cf_db` —帮助→ Salesforce 集成 `s_data_sf`
- Workers 开发 `s_cf_worker` —帮助→ 采集流水线 `s_data_pipe`
- 自动化测试 `s_eng_test` —促进→ 发布审核 `s_eng_rel`
- AI 协作开发 `s_eng_ai` —促进→ 全栈 Web 开发 `s_web`
- 响应式验收 `s_web_viz_resp` —帮助→ 自动化测试 `s_eng_test`
- 骨骼绑定与 IK `s_anim_rig` —诱发→ 情景会话 `s_jp_conv`
- 结构与脱敏校验 `s_eng_test_data` —促进→ 发布审核 `s_eng_rel`

## 创意管理星域（idea）

- ● 主站同源行情 API `i_quote` — 让工作台直接提供只读行情数据
  - · 名单自动同步打通 `i_quote_list` — 让个股名单变化自动进入采集
  - ● 最新数据分区接入 `i_quote_latest` — 把最新行情分区同步进工作台页面
- ● 语言练习接入 AI `i_lang_ai` — 用真实 AI 生成点评与对话
  - · 额度耗尽离线重演 `i_lang_ai_offline` — 额度用完时改用离线重演
  - ● 免费模型优先 `i_lang_ai_free` — 先用免费模型控制成本
  - ● 上线工作台 `i_lang_ai_deploy` — 把语言练习部署到工作台并加保护
- ● 计划中心联动 `i_plan` — 用计划中心统一安排各类学习目标
  - · 题库达标联动 `i_plan_exam` — 让题库达标进度进入长期计划
  - ● 练习结果接口 `i_plan_lang` — 把练习目标与结果提供给计划中心
- ● 假期与生日设置 `i_holiday` — 在日历中管理连续休假与生日
- ● 身体手记并入工作台 `i_health` — 把身体手记纳入工作台统一入口
- ● MyNet 星图扩展 `i_mynet` — 继续扩展星图的管理方向与规则
  - · 跨星域参照 `i_mynet_cross` — 允许不同星域之间互相参照
  - · 删除与回收站规则 `i_mynet_trash` — 定义删除、撤销与恢复的行为
  - ● 人际关系星域 `i_mynet_people` — 用星图管理人际关系
- ● 数字生态花园 `i_garden` — 把云资源监控变成可交互的花园
  - · 真实事件驱动 `i_garden_event` — 只按真实事件改变画面状态
  - · 排障表格视图 `i_garden_table` — 提供精确的表格用于排障
  - · 实现：MyNet 星图 `i_garden_impl` — 由 MyNet 星图直接实现
  - ● 拓扑隐喻 `i_garden_meta` — 用花、蜜蜂、蚂蚁表达资源拓扑
    - · 花簇与花朵 `i_garden_meta_flower` — 表示平台、服务及其健康状态
    - · 蜜蜂 `i_garden_meta_bee` — 表示采集任务与外部数据源
    - · 蚂蚁与蚁路 `i_garden_meta_ant` — 表示存储与数据同步关系
- ● 个人属性知识图谱 `i_graph` — 以实体和带属性的关系组织个人知识
  - · 身份与位置分离 `i_graph_identity` — 同一实体可出现在多个视图中
  - · 多视图 `i_graph_views` — 在关系图、树、表格、时间轴间切换
  - · 路径与结构分析 `i_graph_query` — 查询路径并发现孤立节点与循环
  - · 待评估技术 `i_graph_tech` — 列出待评估的图谱技术方案
- ● 简易项目管理与运维中心 `i_ops` — 一处查看项目进度、部署与故障
  - · 只读 GitHub 同步 `i_ops_gh` — 只读同步 GitHub 提交、PR 与发布
  - · 开发审核工作流 `i_ops_flow` — 表达开发、审核、确认、部署的流程
- ● 个人会员与订阅管理中心 `i_sub` — 管理所有会员订阅与续费
  - · 周期扣款识别 `i_sub_detect` — 从消费记录中找出周期扣款
  - · 订阅台账 `i_sub_ledger` — 记录每项订阅的套餐、金额与续费日
  - · 续费与异常提醒 `i_sub_alert` — 提醒续费、试用到期与异常扣款
  - · 原始流水不变 `i_sub_raw` — 订阅数据独立存放，不改原始流水
- ● 三大云交互式考试训练实验室 `i_lab` — 在虚拟控制台中练习云认证考点
  - ● 虚拟控制台训练 `i_lab_train` — 按教官需求亲手配置并自动验收
    - · 覆盖考试 `i_lab_train_exam` — 覆盖 AWS、Azure、GCP 认证考试
    - · 默认全部虚拟 `i_lab_train_virtual` — 只模拟，不创建真实云资源
  - ● 模拟器调研 `i_lab_sim` — 挑选可复用的云模拟器
    - · AWS 候选待核验 `i_lab_sim_aws` — 核验 AWS 模拟器候选
    - · Azure / Google Cloud 待调查 `i_lab_sim_other` — 寻找 Azure 与 GCP 的模拟器
- ● 语言学习改进候选：OpenMAIC `i_maic` — 借鉴多智能体课堂改进语言练习
  - · 教学角色交互 `i_maic_role` — 让 AI 扮演教师与同学参与对话
  - · 保持现有约束 `i_maic_rule` — 不破坏手动输入与免费成本约束
- ● 信息源转换器与 RSS 爬虫调度 `i_feed` — 把各类信息源变成 Feed 并驱动采集
  - · 个人事件总线（后续） `i_feed_bus` — 后续统一分发个人事件
  - ● 信息源转换器 `i_feed_conv` — 把网页、API、邮件转成订阅 Feed
  - ● RSS 驱动调度 `i_feed_sched` — 发现新条目后触发对应爬虫
    - · 共享 Feed 只轮询一次 `i_feed_sched_once` — 多目标共用 Feed，只抓一次
    - · 可靠重试 `i_feed_sched_retry` — 失败可重试且不重复处理
- ● 全球资本流动地图 `i_capital` — 在世界地图上展示资金流动
  - · 数据分层 `i_capital_layer` — 按可信度分层组织市场与资金数据
  - · 不冒充真实流向 `i_capital_rule` — 只画有证据支持的流向
- ● 个人时光轴 `i_timeline` — 把人生经历整理成可缩放时间轴
  - · 筛选与回顾 `i_timeline_filter` — 按年份、主题筛选并做年度回顾
  - · 隐私与备份 `i_timeline_privacy` — 保护隐私并支持长期导出备份
- ● 免费 AI API 资源池 `i_pool` — 统一管理语言练习的模型接口
  - · 最小化日志内容 `i_pool_privacy` — 减少调用日志中的私人内容
  - ● 供应商候选核验 `i_pool_candidates` — 核验模型供应商的使用条件
    - · 首批模型候选 `i_pool_candidates_first` — 登记首批模型候选
    - · 扩展模型候选 `i_pool_candidates_next` — 登记扩展模型候选
  - ● 统一模型适配 `i_pool_adapter` — 统一不同模型的输入输出
    - · 单次生成教学结果 `i_pool_adapter_round` — 合并一轮对话与教学反馈
  - ● 配额与健康选路 `i_pool_route` — 按质量与可用配额选择模型
    - · 有界故障切换 `i_pool_route_retry` — 限制失败重试并切换模型
    - · 禁止付费回退 `i_pool_route_free` — 在免费资源不可用时停止调用
- ● 跨平台免费资源协作 `i_distributed` — 规划跨平台的功能协作
  - · 版本化协作契约 `i_distributed_contract` — 约定模块间的数据交换规则
  - · 权威写入端 `i_distributed_owner` — 明确各类数据的权威写入端
  - · 平台候选分类 `i_distributed_candidates` — 分类登记待考察的平台能力
  - · 免费条件与费用边界 `i_distributed_cost` — 核对免费条件和超额行为
- ● 分布式免费采集集群 `i_crawl` — 协调多个节点执行采集任务
  - · 按任务能力分配 `i_crawl_dispatch` — 匹配采集任务与执行节点
  - · 原始与标准化分层 `i_crawl_storage` — 分开保存原始材料与标准化结果
  - · 分阶段验证 `i_crawl_rollout` — 按验证结果逐步扩展采集节点
  - ● 统一接收与校验 `i_crawl_ingest` — 校验采集结果并统一入库
    - · 来源与幂等追踪 `i_crawl_ingest_trace` — 追踪采集来源并避免重复处理
- ● 个人云资源中心 `i_cloud` — 集中登记云资源与运行状态
  - · 只读状态展示 `i_cloud_readonly` — 从已采集快照展示资源状态
  - · 提醒联动 `i_cloud_alert` — 提醒资源到期及连续异常
  - ● 资源与配额台账 `i_cloud_ledger` — 登记资源用途及使用条件
    - · 测量可信等级 `i_cloud_ledger_measure` — 区分官方用量与本地估算
    - · 费用风险提示 `i_cloud_ledger_cost` — 提示资源使用的费用边界
  - ● 独立主备监控 `i_cloud_monitor` — 用独立节点监测资源状态
    - · 接管与补传 `i_cloud_monitor_lease` — 控制监控接管并补传结果
    - · 区分失联与故障 `i_cloud_monitor_state` — 区分监控失联与资源故障

关系：

- 语言练习接入 AI `i_lang_ai` —引发→ 计划中心联动 `i_plan`
- 假期与生日设置 `i_holiday` —启发→ 计划中心联动 `i_plan`
- 身体手记并入工作台 `i_health` —参考→ 上线工作台 `i_lang_ai_deploy`
- 名单自动同步打通 `i_quote_list` —参考→ 最新数据分区接入 `i_quote_latest`
- MyNet 星图扩展 `i_mynet` —参考→ 数字生态花园 `i_garden`
- MyNet 星图扩展 `i_mynet` —参考→ 个人属性知识图谱 `i_graph`
- MyNet 星图扩展 `i_mynet` —参考→ 简易项目管理与运维中心 `i_ops`
- 简易项目管理与运维中心 `i_ops` —参考→ 数字生态花园 `i_garden`
- 语言学习改进候选：OpenMAIC `i_maic` —参考→ 语言练习接入 AI `i_lang_ai`
- RSS 驱动调度 `i_feed_sched` —启发→ 主站同源行情 API `i_quote`
- 免费模型优先 `i_lang_ai_free` —参考→ 免费 AI API 资源池 `i_pool`
- 分布式免费采集集群 `i_crawl` —参考→ 跨平台免费资源协作 `i_distributed`
- 个人云资源中心 `i_cloud` —参考→ 跨平台免费资源协作 `i_distributed`
- 数字生态花园 `i_garden` —参考→ 个人云资源中心 `i_cloud`
- 简易项目管理与运维中心 `i_ops` —参考→ 个人云资源中心 `i_cloud`

## 网络资源管理星域（res）

- ● Cloudflare `cf` — 托管个人工作台的云平台
  - ● Worker · myapp `cf_worker` — 运行工作台的页面与业务 API
    - · 定时触发 `cf_worker_cron` — 按计划自动执行同步与提醒
    - · 静态资源绑定 `cf_worker_assets` — 提供导入的静态展示页面
    - · 可观测日志 `cf_worker_logs` — 记录请求日志以便核验
    - · 静态资源白名单 `cf_worker_assets_scope` — 按白名单分发浏览器资源
  - ● D1 · 工作台主库 `cf_d1` — 保存工作台的正式业务数据
  - ● KV `cf_kv` — 保存草稿与偏好等小数据
    - · 日记草稿暂存 `cf_kv_drafts` — 暂存并恢复未正式保存的日记
    - · 界面偏好 `cf_kv_prefs` — 保存图表等界面偏好
  - ● R2 · 对象存储 `cf_r2` — 存放私有传输的数据文件
  - ● Access 访问控制 `cf_access` — 只允许本人登录访问工作台
- ● GitHub `gh` — 托管代码并运行自动化任务
  - ● 私有仓库 `gh_private` — 保存不公开的源码与数据
  - ● Actions `gh_actions` — 按计划运行采集、同步与发布
    - · 行情采集任务 `gh_act_quote` — 按市场任务采集报价与指标
    - · 名单同步任务 `gh_act_list` — 同步最新的个股监察名单
    - · 镜像发布任务 `gh_act_mirror` — 把行情发布到公开镜像
    - · PE 每周重算 `gh_act_pe` — 每周重算 PE 并写入私有传输
  - ● 公开行情镜像 `gh_mirror` — 对外提供可匿名读取的最新行情
    - · 公开字段白名单 `gh_mirror_scope` — 限定公共镜像的发布字段
    - · 采集时间边界 `gh_mirror_time` — 保留行情时间与可信度边界
- ● 自用谷歌服务 `gg` — 提供邮件与云盘服务
  - ● Gmail `gg_gmail` — 接收自动行情日报
  - ● Google Drive `gg_drive` — 保存早期原始资料
- ● Salesforce `sf` — 记录消费原始账本
  - · 消费记录只读接口 `sf_api` — 向工作台提供只读消费记录
- ● 行情数据源 `mk` — 提供外部市场行情
  - ● TradingView `mk_tv` — 提供个股与板块行情
  - ● JPX 日本交易所 `mk_jpx` — 提供日股公开数据
  - ● Multpl 与 Shiller `mk_multpl` — 提供标普月均历史资料
  - ● ECB 与 DataStream `mk_ecb` — 提供日经月均历史资料
- ● AI 开发助手 `ai` — 协助编写、审核与交接代码
  - · 语言练习候选模型 `ai_models` — 语言练习可选用的 AI 模型
  - ● Claude Code `ai_claude` — 协助开发与审核改动
  - ● Codex `ai_codex` — 协助编码与整理交接
- ● 本机开发环境 `dev` — 在本机开发、测试与部署
  - · Node.js 24 `dev_node` — 运行各项目的本地服务与测试
  - · Python `dev_python` — 运行采集与估值脚本
  - · Wrangler CLI `dev_wrangler` — 检查、同步并部署 Cloudflare 项目
  - · Playwright `dev_playwright` — 在真实浏览器中自动回归页面

关系：

- Worker · myapp `cf_worker` —读取自→ D1 · 工作台主库 `cf_d1`
- Worker · myapp `cf_worker` —读取自→ KV `cf_kv`
- 定时触发 `cf_worker_cron` —读取自→ R2 · 对象存储 `cf_r2`
- Access 访问控制 `cf_access` —保护→ Worker · myapp `cf_worker`
- 消费记录只读接口 `sf_api` —提供接口给→ Worker · myapp `cf_worker`
- PE 每周重算 `gh_act_pe` —写入→ R2 · 对象存储 `cf_r2`
- 镜像发布任务 `gh_act_mirror` —写入→ 公开行情镜像 `gh_mirror`
- 名单同步任务 `gh_act_list` —读取自→ 私有仓库 `gh_private`
- 行情采集任务 `gh_act_quote` —读取自→ TradingView `mk_tv`
- 行情采集任务 `gh_act_quote` —读取自→ JPX 日本交易所 `mk_jpx`
- Gmail `gg_gmail` —读取自→ 公开行情镜像 `gh_mirror`
- Wrangler CLI `dev_wrangler` —调用→ Worker · myapp `cf_worker`
- Worker · myapp `cf_worker` —写入→ D1 · 工作台主库 `cf_d1`
- Worker · myapp `cf_worker` —写入→ KV `cf_kv`

## 项目管理星域（proj）

- ● 个人工作台 myapp `p_myapp` — 个人工作台：统一入口、登录与部署
  - · 共享导航 `p_myapp_nav` — 统一各模块的页面入口
  - ● 待办与处理记录 `p_myapp_aim` — 管理待办及其处理过程
  - ● 事项提醒 `p_myapp_rem` — 提醒到期事项并支持改期
  - ● 日记与草稿 `p_myapp_diary` — 书写并保存日记
    - · 草稿恢复 `p_myapp_diary_draft` — 暂存并恢复未完成的日记
    - · 乐观锁保护 `p_myapp_diary_version` — 阻止旧版本覆盖新日记
  - ● 集成与发布 `p_myapp_int` — 接入子项目并安全发布
    - · 发布流程 `p_myapp_int_flow` — 规定从开发到部署的步骤
    - · 发布审核记录 `p_myapp_int_review` — 为每次发布留下可审核记录
  - ● 首页总览 `p_myapp_home` — 汇总待办与近期提醒
  - ● 考证模块接线 `p_myapp_study` — 接入考证页面与业务接口
- ● 事项提醒子项目 `p_rem` — 独立开发提醒模块后同步主站
  - · 拖拽改期 `p_rem_drag` — 拖动提醒即可改到今天或明天
  - · 循环与分组 `p_rem_cycle` — 按循环规则与状态组织提醒
  - · 改期写入边界 `p_rem_guard` — 避免无效改期和旧记录覆盖
- ● StockCheck 个股监察 `p_sc` — 监察个股并给出估值研究
  - · 相关创意：信息转换器与 RSS 爬虫 `p_sc_idea` — 用 RSS 驱动的采集补充个股数据
  - · 逐股情景对比 `p_sc_compare` — 对比逐股情景值与报价
  - ● 监察名单 `p_sc_list` — 维护需要监察的证券名单
  - ● 四情景估值 `p_sc_val` — 按四种情景估算个股价值
    - · DCF `p_sc_val_dcf` — 用现金流折现估值
    - · PE Band `p_sc_val_pe` — 用历史 PE 区间判断估值高低
  - ● PE 每周刷新 `p_sc_pe` — 每周更新 PE 数据供页面读取
  - ● 研究展示包 `p_sc_pkg` — 把研究结果打包给工作台展示
  - ● 季度财报归档 `p_sc_fin` — 归档季度财报与原始附件
    - · 报表去重与修订 `p_sc_fin_import` — 去重财报并保留修订历史
    - · 下载与解析分离 `p_sc_fin_parse` — 区分附件获取与指标解析
- ● catchStockData 行情采集 `p_cs` — 自动采集行情并发布公开镜像
  - · 最新数据分区 `p_cs_latest` — 提供最新数据的分区读取
  - · 日报邮件消费 `p_cs_mail` — 用镜像数据生成每日行情邮件
  - ● 行情采集 `p_cs_quote` — 按市场时段采集名单内报价
    - · 行情可信度 `p_cs_quote_time` — 区分采集成功与收盘确认
  - ● 名单同步 `p_cs_sync` — 从 StockCheck 获取最新名单
  - ● 公开镜像发布 `p_cs_mirror` — 把最新行情推送到公开仓库
- ● BuffettChart 长期指标 `p_bc` — 展示大盘长期估值指标
  - · 相关创意：信息转换器与 RSS 爬虫 `p_bc_idea` — 用 RSS 驱动的采集补充指标数据
  - · 图表与快照下载 `p_bc_export` — 导出指标图表与数据快照
  - ● 巴菲特指数 `p_bc_buffett` — 用市值与 GDP 之比看整体估值
    - · 维护周期 `p_bc_buffett_cycle` — 按维护周期提醒更新巴菲特指标
  - ● 标普 500 `p_bc_sp` — 展示标普 500 长期趋势与偏离
    - · 月度更新窗口 `p_bc_sp_window` — 维护标普近期窗口与固定历史
    - · 维护周期 `p_bc_sp_cycle` — 按维护周期提醒更新标普指标
  - ● 日经 225 `p_bc_nk` — 展示日经 225 长期趋势与偏离
    - · 维护周期 `p_bc_nk_cycle` — 按维护周期提醒更新日经指标
    - · 来源使用边界 `p_bc_nk_scope` — 保留日经来源的使用边界
  - ● 构建与集成 `p_bc_build` — 构建图表页面并接入工作台
- ● sfpaylogandbi 消费记录 `p_sf` — 记录消费并监控周期缴费
  - · 相关创意：会员与订阅 `p_sf_idea` — 扩展为会员与订阅管理
  - ● 消费同步 `p_sf_sync` — 每天把 Salesforce 消费同步进来
  - ● 消费 Dashboard `p_sf_dash` — 用图表查看消费结构与趋势
  - ● 周期缴费监控 `p_sf_bill` — 跟踪周期缴费并提前提醒
- ● 日历与长期计划中心 `p_cal` — 管理日程与长期计划
  - · 假期与生日设置 `p_cal_holiday` — 设置休假与生日
  - ● P1 日历 `p_cal_p1` — 查看与安排日程
  - ● P2 长期计划 `p_cal_p2` — 拆解长期计划并跟踪执行
    - · 甘特 / 依赖 / 基线 `p_cal_p2_gantt` — 用甘特图管理依赖与基线
    - · 全局容量与重排预览 `p_cal_p2_cap` — 按可用时间重排计划
    - · 题库达标快照 `p_cal_p2_exam` — 在计划中显示题库达标进度
- ● 知序 · 考证学习 `p_exam` — 备考刷题与模拟考试
  - · 图片引用 `p_exam_img` — 登记题目图片的存放位置
  - · 相关创意：云交互试验室 `p_exam_idea` — 扩展为云认证交互实验室
  - ● 题库管理 `p_exam_bank` — 录入、分类并导入试题
  - ● 模拟考试 `p_exam_mock` — 限时模拟正式考试并判分
  - ● 错题与掌握 `p_exam_master` — 跟踪错题直到真正掌握
  - ● 题库导入预览 `p_exam_import` — 预览题库差异并分批导入
  - ● 会话与保存屏障 `p_exam_session` — 保护考试会话与作答保存
    - · 离线保存队列 `p_exam_session_queue` — 暂存作答并可靠重试保存
  - ● 统计与考后复盘 `p_exam_review` — 统计学习表现并回顾考试
  - ● 外部 AI 资料交换 `p_exam_ai` — 导出分析资料并接收外部报告
  - ● 结构化备份恢复 `p_exam_backup` — 备份学习数据并恢复到新库
- ● 身体手记 `p_health` — 记录身体状况与变化
  - ● 症状登记 `p_health_sym` — 快速登记多处不适
  - ● 体重与腰围 `p_health_body` — 记录体重与腰围并看趋势
- ● LanguageStudy 语言练习 `p_lang` — 练习日语情景对话
  - · 计划中心接口（预留） `p_lang_plan` — 向计划中心提供练习结果
  - · 教师点评 `p_lang_ai` — 点评回答并给出日语例句
  - · 改进候选：OpenMAIC `p_lang_idea` — 参考多智能体课堂改进练习
  - · 本地离线训练 `p_lang_offline` — 在无外部模型时练习情景对话
  - · 中断恢复与记录交换 `p_lang_resume` — 恢复中断练习并交换本地记录
  - ● 情景题库 `p_lang_bank` — 提供分类的情景对话题目
  - ● 应对方式 `p_lang_mode` — 用拼词或自由回答应对对话
    - · 最终完整手打 `p_lang_mode_hand` — 通过完整手打提交最终答案
  - ● 角色动作 `p_lang_char` — 用角色动画演示对话情景
- ● WebCharacter 网页角色 `p_wc` — 制作网页中的 2D 角色动画
  - · 苹果小剧场 `p_wc_apple` — 演示双角色递苹果
  - · 魔法书与扫帚 `p_wc_magic` — 演示拾书骑扫帚飞走
  - ● 绑定与 IK `p_wc_rig` — 为角色绑骨并驱动动作
- ● MyNet 星图 `p_mynet` — 以星图组织并管理个人内容
  - · 实现的创意 `p_mynet_idea` — 实现数字花园、知识图谱与运维中心
  - ● 星图展示 `p_mynet_map` — 以焦点和距离探索内容关系
    - · 焦点距离探索 `p_mynet_map_distance` — 按焦点距离逐步探索关系
    - · 三层总览过渡 `p_mynet_map_layers` — 在总览与焦点之间连续导航
  - ● 管理台 `p_mynet_mgr` — 用表格查找并编辑内容
    - · 自动升格与防环 `p_mynet_mgr_promote` — 升格内容并防止隶属成环
  - ● 共享数据层 `p_mynet_data` — 让星图与管理台共用同一份数据
    - · 数据校验与清单 `p_mynet_data_validate` — 校验初始数据并生成交接清单
    - · 本地编辑优先 `p_mynet_data_local` — 保留浏览器中的已有编辑

关系：

- 事项提醒 `p_myapp_rem` —集成→ 事项提醒子项目 `p_rem`
- 集成与发布 `p_myapp_int` —集成→ 研究展示包 `p_sc_pkg`
- 集成与发布 `p_myapp_int` —集成→ 构建与集成 `p_bc_build`
- 个人工作台 myapp `p_myapp` —集成→ 日历与长期计划中心 `p_cal`
- 个人工作台 myapp `p_myapp` —集成→ sfpaylogandbi 消费记录 `p_sf`
- 个人工作台 myapp `p_myapp` —集成→ 身体手记 `p_health`
- 名单同步 `p_cs_sync` —读取→ 监察名单 `p_sc_list`
- 日报邮件消费 `p_cs_mail` —读取→ 公开镜像发布 `p_cs_mirror`
- 周期缴费监控 `p_sf_bill` —使用→ 事项提醒 `p_myapp_rem`
- 计划中心接口（预留） `p_lang_plan` —参考→ 日历与长期计划中心 `p_cal`
- 角色动作 `p_lang_char` —使用→ WebCharacter 网页角色 `p_wc`
- 考证模块接线 `p_myapp_study` —集成→ 知序 · 考证学习 `p_exam`
- 四情景估值 `p_sc_val` —读取→ 季度财报归档 `p_sc_fin`
- 题库导入预览 `p_exam_import` —使用→ 题库管理 `p_exam_bank`
- 外部 AI 资料交换 `p_exam_ai` —读取→ 题库管理 `p_exam_bank`
- 管理台 `p_mynet_mgr` —使用→ 共享数据层 `p_mynet_data`
- 星图展示 `p_mynet_map` —使用→ 共享数据层 `p_mynet_data`
- 首页总览 `p_myapp_home` —使用→ 事项提醒 `p_myapp_rem`
- 首页总览 `p_myapp_home` —使用→ 待办与处理记录 `p_myapp_aim`
