# MyNet 星图 · 数据结构与补充规范

归档日期：2026-11-02（Asia/Tokyo）
读者：负责补充星图数据的人或 AI。先读本文，再读 [DESIGN.md](DESIGN.md) 了解页面如何使用这些数据；结构规则的原始出处是 [../REQUIREMENTS.md](../REQUIREMENTS.md)。

## 1. 只改哪里

- **只编辑 `data.js`**：`DOMAINS`（星域、要素、关系）与 `FN`（功能简述）。不要改 `starmap.html` / `manage.html` 来补数据，也不要往浏览器本地存储里写数据当作交付。
- 改完必须：
  1. 运行 `node tools/validate-data.mjs`，退出码为 0（错误必须修完，提示尽量处理）。
  2. 把 `starmap.html`、`manage.html` 中 `data.js?v=` 后的版本改成新值（如 `2026-11-05a`），两处一致。
  3. 重新生成清单与快照：`node tools/validate-data.mjs --list docs/data-inventory.md` 和 `node tools/validate-data.mjs --json docs/data-snapshot.json`。
  4. 在本文末尾「变更记录」追加一条：日期、改了什么、依据来源。
- 是否升级存储键 `KEY`（`data.js` 末尾，当前 `mynet.data.v3`）：一般**不要**升级。用户本地若已保存过数据，会继续看到自己保存的版本，可在管理台点「恢复初始数据」载入新初始数据。只有需要强制所有浏览器立即改用新初始数据时才升级，并在变更记录中写明原因。

## 2. 数据结构

```js
DOMAINS = {
  <星域键>: {                       // skill | idea | res | proj（不要新增或改名，人际关系星域尚未定义）
    name, short, en,                // 显示名、简称、英文标签
    focus: '<要素 id>',             // 进入该星域时的默认焦点，必须是节点
    labels: { root, node, attr },   // 模板用词：根节点 / 节点 / 属性 在该星域的叫法
    relColors: { '<关系类型>': '#rrggbb', … },   // 该星域允许的关系类型及颜色
    elements: [ N(...) | A(...) ],
    relations: [ R(from, type, to) ]
  }
}
N(id, name, parent, desc)   // 节点：state 'node'
A(id, name, parent, desc)   // 属性：state 'attr'
R(from, type, to)           // 非隶属关系
FN = { '<要素 id>': '功能简述', … }   // 每个要素都必须有
```

| 字段 | 必填 | 写什么 |
| --- | --- | --- |
| `id` | 是 | 小写字母、数字、下划线；全星域内唯一；创建后不要改（地址栏和链接用它） |
| `name` | 是 | 简短名称，通常 2–12 字；英文专名保留原文 |
| `parent` | 根节点为 `null` | 唯一隶属父节点的 id |
| `fn`（在 `FN` 中） | 是 | 一句话说明它**做什么**；动宾结构，建议 ≤ 20 字，上限 40 字；不写状态、日期、数量 |
| `desc` | 否 | 细节、现状、约束、数量；带时效的事实注明日期，如「（2026-10-31）」 |

## 3. 结构规则（必须遵守）

1. 每个要素最多一个 `parent`；根节点（`parent:null`）就是一个星系，星系以根节点命名。
2. 属性必须有 `parent`，且 `parent` 必须是节点；属性不能拥有下级。需要给某个要素加下级时，先把它写成节点 `N(...)`。
3. 隶属不能成环。
4. 关系目标 `to` 必须是**节点**；起点 `from` 可以是属性或节点。被关系指向的要素请直接写成节点（等同于管理台中的自动升格）。
5. 关系类型必须在该星域 `relColors` 中；需要新类型时同时在 `relColors` 增加并选一个与现有颜色区分明显的色值。
6. 同一 `from + type + to` 不重复；起点与目标不能相同。
7. **不跨星域**：关系的两端必须在同一星域。跨星域的联系（如创意与实现它的项目）用属性文字记录，例如项目下的「实现的创意」「相关创意：…」属性。
8. 不复制对象：同一事物只在一个位置出现，其他地方用关系引用。
9. 子节点与属性的书写顺序：先写属性再写子节点（只影响阅读，不影响显示）。

## 4. 命名约定

| 星域 | id 前缀 | 示例 |
| --- | --- | --- |
| 技能 `skill` | `s_` | `s_cf_db` |
| 创意 `idea` | `i_` | `i_feed_sched` |
| 资源 `res` | 平台缩写：`cf_` `gh_` `gg_` `sf_` `mk_` `ai_` `dev_` | `gh_act_pe` |
| 项目 `proj` | `p_` | `p_sc_val_pe` |

下级 id = 上级 id + `_` + 简短词，便于看出隶属。新增资源平台时新起一个 2–4 字母的前缀。

## 5. 各星域模板与关系用词

| 星域 | 根 / 节点 / 属性 | 关系类型（方向：from → to） |
| --- | --- | --- |
| 技能 | 核心技能 / 子技能 / 技能场景 | 帮助（起点让目标更容易）、促进（起点推动目标提升）、诱发（起点引出对目标的需求） |
| 创意 | 核心创意 / 子创意 / 应用场景 | 引发（起点导致产生目标创意）、启发（起点给目标提供思路）、参考（起点借鉴或依赖目标） |
| 资源 | 平台 / 服务 / 能力 | 读取自（起点从目标读数据；实际传输方向可相反）、写入（起点把数据写进目标）、提供接口给（起点向目标暴露接口）、调用（起点触发目标运行）、依赖（起点离不开目标）、保护（起点为目标做访问控制） |
| 项目 | 项目 / 功能 / 特征 | 集成（起点把目标合并或接入自身）、使用（起点运行时用到目标）、读取（起点读取目标的数据）、参考（起点借鉴目标或为其预留接口） |

关系名表达业务含义，不自动意味着反向关系。

## 6. 安全与准确

数据会进入生产环境，以下内容**一律不写**（校验脚本会拦截常见形式）：

- 账号 ID、数据库 / 命名空间 ID、Access 团队域名与 AUD、OAuth 客户端 ID、任何密钥 / 令牌 / 密码
- 邮箱地址、网址（包括 workers.dev 等站点地址）、本机路径
- 持仓、金额明细、日记正文、健康记录内容等个人敏感数据

准确性：

- 只写来源中能核实的事实；不确定的写「待确认」，计划中的写「计划」「待实现」「待调查」，不要把计划写成已完成。
- 创意星域中来自创意清单的条目全部是「待调查 / 待设计」，不代表确认开发。
- 不要读取 `G:\deepseekapikey`、`G:\個人`、媒体文件夹（`G:\X`、`G:\teledown`）、聊天记录（`G:\chat`）等与项目无关或含敏感信息的目录。

## 7. 现有数据的来源

| 来源（只读） | 用于 |
| --- | --- |
| `G:\selftool\*\README.md`（LanguageStudy、WebCharacter、calendarAndPlanner、catchstockdata、health、selfexamsystem、sfpaylogandbi） | 项目星域各项目的职责、功能与状态；技能星域的技术栈 |
| `G:\selftool\sfpaylogandbi\docs\cloudflaremyapp-workflow.md` | 主站发布流程 |
| `G:\selftool\catchstockdata\docs\CURRENT_STATUS_AND_NEXT_STEPS.md` | 三仓库职责、名单同步状态 |
| `G:\cloudflare\README.md`、`G:\cloudflare\myapp\wrangler.jsonc`（只取绑定种类，不取 ID）、`myapp\docs\design\repository-map.md`、`data-storage-map.md` | 资源星域的 Cloudflare 服务与数据流 |
| `G:\cloudflare\reminders-app\README.md` | 事项提醒子项目 |
| `G:\stockcheck\README.md`、`G:\beffetindex\README.md` | StockCheck、BuffettChart |
| `G:\cloudflare\myapp\docs\personal-site-idea-backlog-2026-11-02.md` | 创意星域中 001–008 与 OpenMAIC |
| 用户在对话中的说明（2026-11-02） | MyNet 是数字生态花园的直接实现并兼顾知识图谱与项目运维；云交互试验室 ↔ 题库；会员与订阅 ↔ paylog；OpenMAIC ↔ 语言学习辅助页；信息转换器与 RSS 爬虫 ↔ 两个股票页面 |
| 用户补充的技能经历（2026-11-02，原话见第 12 节） | 会英语、此前做过 5 年以上 C# 开发、少量钢琴与小提琴自学经历 |

## 8. 建议补充的方向

已在本轮核对的来源与后续可补方向：

- `G:\cloudflare\myapp\docs\free-ai-api-pool-requirements.md`：本轮已登记免费 AI API 资源池、跨平台资源协作、分布式采集集群及云资源中心，全部保持待验证或待规划状态；供应商政策仍未逐家核验。
- `G:\cloudflare\myapp\docs\design\pages-and-features.md`、`architecture.md`：本轮已补充首页、共享导航、日记保存与学习模块接线；`free-api-candidates.md` 和各模块子目录仍可继续核对，不代表本轮已穷尽所有页面。
- `G:\stockcheck\docs`、`G:\beffetindex\docs`：本轮已补财报归档、逐股对比及长期指标维护窗口；其他设计、验收与后续更新仍可继续核对，未读取实际业务数据。
- 各项目 `docs/` 下的设计与验收记录：补充功能节点、状态与日期。

数据层面的已知空缺：

- 技能星域原有条目主要依据项目技术整理，不代表已确认个人熟练度；英语、C# 开发、钢琴、小提琴已按第 12 节用户自述补充。除明确提供的经历外，不推断技能等级、具体技术方向或学习计划。
- 资源星域没有记录额度、套餐、费用（来源中未核实）。
- 关系仍可继续补充：本轮增加 16 条有来源的关联；不得为增加密度而虚构用户判断或已运行的数据流。

需要用户确认的判断（补充时不要自行改变结论，可在变更记录中提出）：

- 「两个股票页面」按 StockCheck 个股监察与 BuffettChart 长期指标处理。
- 创意清单中用户未点名的「全球资本流动地图」「个人时光轴」已收录，无关联。
- 「个人工作台 集成 → 身体手记」依据身体手记文档中的集成目标填写，实际尚未集成。
- 「Gmail 读取自 公开行情镜像」表示日报任务读取镜像后经 Gmail 发送，是对数据流的简化表达。

## 9. 示例：补一个项目功能

```js
// DOMAINS.proj.elements 中，放在所属项目的其他子项之后
N('p_sc_report','财报整理','p_sc','季度财报对象与关键指标（依据：StockCheck README）。'),
A('p_sc_report_q','季度更新','p_sc_report','财报发布后更新。'),
// DOMAINS.proj.relations
R('p_sc_val','读取','p_sc_report'),
// FN
p_sc_report:'整理个股财报供估值使用',
p_sc_report_q:'在财报发布后更新数据',
```

（示例仅说明写法，不代表事实，勿直接加入。）

## 10. 当前规模（2026-11-02）

| 星域 | 星系 | 节点 | 属性 | 关系 |
| --- | --- | --- | --- | --- |
| 技能 | 11 | 26 | 8 | 10 |
| 创意 | 19 | 35 | 54 | 15 |
| 资源 | 7 | 23 | 18 | 14 |
| 项目 | 12 | 52 | 46 | 19 |

完整清单见 [data-inventory.md](data-inventory.md)（由脚本生成）。

## 11. 本轮数据补充与来源核对（2026-11-02）

### 结果与状态边界

- 新增 73 个要素、16 条关系；修改 18 个既有要素的说明或功能简述，另将 5 个属性升格为节点。原有要素 ID、隶属与关系保留。
- 四个新增星系均在创意星域：免费 AI API 资源池、跨平台免费资源协作、分布式免费采集集群、个人云资源中心。全部来自已登记需求，保持待核验或待规划状态。
- 技能只补充项目实践场景，不新增熟练度评价；未开通的云服务和模型候选保留在创意或候选说明中，不写成已启用资源。
- 原有九项创意根节点补充待调查或待设计说明。保留 MyNet 与数字生态花园、知识图谱、运维中心的用户定位；实际监控和外部同步不写成已接入。
- 语言学习角色动画保持暂停；身体手记的主站集成仍按既有目标关系表达，实际未集成的边界保持；资本流动地图、个人时光轴仍无新增关系。
- Gmail 与公开镜像的既有简化关系保留。项目中的日报说明按行情交接区分私有收盘候选、独立邮件任务及尚未统一的周月报；这不代表本次修改或重验了自动任务。
- 所有状态来自本地项目文档。部分状态快照早于本轮整理日期；本次未重新访问生产接口、验证云端部署、核验供应商免费政策或执行实际业务写入。
- 两页数据缓存版本改为 `2026-11-02d`，共享存储键保留 `mynet.data.v3`。已有浏览器数据继续优先，不自动覆盖用户编辑。恢复初始数据会清除本浏览器自定义内容，只有明确决定放弃或已保留这些编辑后才操作。

### 来源索引

以下路径仅供本地维护溯源，不进入 `DOMAINS` / `FN`、生成的数据快照或生产页面中的内容字段。只读取项目说明与实现文件，没有读取实际题库、消费、健康、日记或持仓业务数据。

| 来源 | 文件 |
| --- | --- |
| S01 | [free-ai-api-pool-requirements.md](G:/cloudflare/myapp/docs/free-ai-api-pool-requirements.md) |
| S02 | [personal-site-idea-backlog-2026-11-02.md](G:/cloudflare/myapp/docs/personal-site-idea-backlog-2026-11-02.md) |
| S03 | [pages-and-features.md](G:/cloudflare/myapp/docs/design/pages-and-features.md) |
| S04 | [architecture.md](G:/cloudflare/myapp/docs/design/architecture.md) |
| S05 | [data-storage-map.md](G:/cloudflare/myapp/docs/design/data-storage-map.md) |
| S06 | [long-term-indicators.md](G:/beffetindex/docs/long-term-indicators.md) |
| S07 | [03_季度财报.md](G:/stockcheck/docs/03_季度财报.md) |
| S08 | [05_页面与日常查看.md](G:/stockcheck/docs/05_页面与日常查看.md) |
| S09 | [README.md](G:/selftool/LanguageStudy/README.md) |
| S10 | [README.md](G:/selftool/selfexamsystem/README.md) |
| S11 | [CURRENT_STATUS_AND_NEXT_STEPS.md](G:/selftool/catchstockdata/docs/CURRENT_STATUS_AND_NEXT_STEPS.md) |
| S12 | [README.md](G:/cloudflare/reminders-app/README.md) |
| S13 | [DESIGN.md](G:/selftool/MyNet/docs/DESIGN.md) |
| S14 | [validate-data.mjs](G:/selftool/MyNet/tools/validate-data.mjs) |
| S15 | [DATA_GUIDE.md](G:/selftool/MyNet/docs/DATA_GUIDE.md) |

### 要素变更与来源

每个要素的新增细节或更新内容对应如下来源；属性升格用于承载本轮新增下级或作为关系目标，保留原有内容身份。

| 操作 | 要素 | 来源 |
| --- | --- | --- |
| 新增 | `s_web_js_conflict` 版本冲突保护 | S03、S04 |
| 新增 | `s_data_pipe_contract` 行情消费契约 | S11 |
| 新增 | `s_eng_test_data` 结构与脱敏校验 | S14 |
| 新增 | `s_inv_macro_window` 指标独立更新窗口 | S06 |
| 新增 | `i_pool` 免费 AI API 资源池 | S01 |
| 新增 | `i_pool_candidates` 供应商候选核验 | S01 |
| 新增 | `i_pool_candidates_first` 首批模型候选 | S01 |
| 新增 | `i_pool_candidates_next` 扩展模型候选 | S01 |
| 新增 | `i_pool_adapter` 统一模型适配 | S01 |
| 新增 | `i_pool_adapter_round` 单次生成教学结果 | S01 |
| 新增 | `i_pool_route` 配额与健康选路 | S01 |
| 新增 | `i_pool_route_retry` 有界故障切换 | S01 |
| 新增 | `i_pool_route_free` 禁止付费回退 | S01 |
| 新增 | `i_pool_privacy` 最小化日志内容 | S01 |
| 新增 | `i_distributed` 跨平台免费资源协作 | S01 |
| 新增 | `i_distributed_contract` 版本化协作契约 | S01 |
| 新增 | `i_distributed_owner` 权威写入端 | S01 |
| 新增 | `i_distributed_candidates` 平台候选分类 | S01 |
| 新增 | `i_distributed_cost` 免费条件与费用边界 | S01 |
| 新增 | `i_crawl` 分布式免费采集集群 | S01 |
| 新增 | `i_crawl_dispatch` 按任务能力分配 | S01 |
| 新增 | `i_crawl_ingest` 统一接收与校验 | S01 |
| 新增 | `i_crawl_ingest_trace` 来源与幂等追踪 | S01 |
| 新增 | `i_crawl_storage` 原始与标准化分层 | S01 |
| 新增 | `i_crawl_rollout` 分阶段验证 | S01 |
| 新增 | `i_cloud` 个人云资源中心 | S01 |
| 新增 | `i_cloud_ledger` 资源与配额台账 | S01 |
| 新增 | `i_cloud_ledger_measure` 测量可信等级 | S01 |
| 新增 | `i_cloud_ledger_cost` 费用风险提示 | S01 |
| 新增 | `i_cloud_monitor` 独立主备监控 | S01 |
| 新增 | `i_cloud_monitor_lease` 接管与补传 | S01 |
| 新增 | `i_cloud_monitor_state` 区分失联与故障 | S01 |
| 新增 | `i_cloud_readonly` 只读状态展示 | S01 |
| 新增 | `i_cloud_alert` 提醒联动 | S01 |
| 新增 | `cf_worker_assets_scope` 静态资源白名单 | S04 |
| 新增 | `cf_kv_drafts` 日记草稿暂存 | S03 |
| 新增 | `cf_kv_prefs` 界面偏好 | S05 |
| 新增 | `gh_mirror_scope` 公开字段白名单 | S11 |
| 新增 | `gh_mirror_time` 采集时间边界 | S11 |
| 新增 | `mk_multpl` Multpl 与 Shiller | S06 |
| 新增 | `mk_ecb` ECB 与 DataStream | S06 |
| 新增 | `p_myapp_home` 首页总览 | S03 |
| 新增 | `p_myapp_nav` 共享导航 | S03 |
| 新增 | `p_myapp_diary_draft` 草稿恢复 | S03 |
| 新增 | `p_myapp_diary_version` 乐观锁保护 | S03 |
| 新增 | `p_myapp_study` 考证模块接线 | S03 |
| 新增 | `p_rem_cycle` 循环与分组 | S03 |
| 新增 | `p_rem_guard` 改期写入边界 | S12 |
| 新增 | `p_sc_fin` 季度财报归档 | S07 |
| 新增 | `p_sc_fin_import` 报表去重与修订 | S07 |
| 新增 | `p_sc_fin_parse` 下载与解析分离 | S07 |
| 新增 | `p_sc_compare` 逐股情景对比 | S08 |
| 新增 | `p_cs_quote_time` 行情可信度 | S11 |
| 新增 | `p_bc_buffett_cycle` 维护周期 | S06 |
| 新增 | `p_bc_sp_window` 月度更新窗口 | S06 |
| 新增 | `p_bc_sp_cycle` 维护周期 | S06 |
| 新增 | `p_bc_nk_cycle` 维护周期 | S06 |
| 新增 | `p_bc_nk_scope` 来源使用边界 | S06 |
| 新增 | `p_bc_export` 图表与快照下载 | S06 |
| 新增 | `p_exam_import` 题库导入预览 | S10 |
| 新增 | `p_exam_session` 会话与保存屏障 | S10 |
| 新增 | `p_exam_session_queue` 离线保存队列 | S10 |
| 新增 | `p_exam_review` 统计与考后复盘 | S10 |
| 新增 | `p_exam_ai` 外部 AI 资料交换 | S10 |
| 新增 | `p_exam_backup` 结构化备份恢复 | S10 |
| 新增 | `p_lang_mode_hand` 最终完整手打 | S09、S01 |
| 新增 | `p_lang_offline` 本地离线训练 | S09 |
| 新增 | `p_lang_resume` 中断恢复与记录交换 | S09 |
| 新增 | `p_mynet_map_distance` 焦点距离探索 | S13 |
| 新增 | `p_mynet_map_layers` 三层总览过渡 | S13 |
| 新增 | `p_mynet_mgr_promote` 自动升格与防环 | S13 |
| 新增 | `p_mynet_data_validate` 数据校验与清单 | S14、S13 |
| 新增 | `p_mynet_data_local` 本地编辑优先 | S13、S15 |
| 更新说明 | `i_quote` 主站同源行情 API | S11 |
| 更新说明 | `i_quote_latest` 最新数据分区接入 | S11 |
| 更新说明 | `i_lang_ai` 语言练习接入 AI | S09、S01、S15 |
| 更新说明 | `i_lang_ai_free` 免费模型优先 | S01 |
| 更新说明 | `i_garden` 数字生态花园 | S02、S13、S15 |
| 更新说明 | `i_graph` 个人属性知识图谱 | S02、S13、S15 |
| 更新说明 | `i_ops` 简易项目管理与运维中心 | S02、S13、S15 |
| 更新说明 | `i_sub` 个人会员与订阅管理中心 | S02、S15 |
| 更新说明 | `i_lab` 三大云交互式考试训练实验室 | S02、S15 |
| 更新说明 | `i_maic` 语言学习改进候选：OpenMAIC | S02、S15 |
| 更新说明 | `i_feed` 信息源转换器与 RSS 爬虫调度 | S02、S15 |
| 更新说明 | `i_capital` 全球资本流动地图 | S02 |
| 更新说明 | `i_timeline` 个人时光轴 | S02 |
| 更新说明 | `ai_models` 语言练习候选模型 | S01、S09 |
| 更新说明及功能简述 | `gh_act_quote` 行情采集任务 | S11 |
| 更新说明及功能简述 | `p_cs_quote` 行情采集 | S11 |
| 更新说明 | `p_cs_mail` 日报邮件消费 | S11 |
| 更新说明 | `p_lang_ai` 教师点评 | S09 |
| 属性升格 | `p_myapp_diary` 日记与草稿 | S03 |
| 属性升格 | `p_bc_buffett` 巴菲特指数 | S06 |
| 属性升格 | `p_bc_sp` 标普 500 | S06 |
| 属性升格 | `p_bc_nk` 日经 225 | S06 |
| 属性升格 | `p_mynet_data` 共享数据层 | S13 |

### 新增关系与依据

关系全部在本星域内。能力关系表达有来源的项目工作流程，不是用户熟练度或心理联想的事实判断；创意之间的参考关系表达规划依赖，不表示已实现。

| 关系 | 来源 | 依据及边界 |
| --- | --- | --- |
| `s_eng_test_data` —促进→ `s_eng_rel` | S14、S15 | 数据发布前校验这一明确工作流程的能力联系，不作熟练度评价 |
| `i_lang_ai_free` —参考→ `i_pool` | S01 | 资源池需求的目标应用为语言练习 |
| `i_crawl` —参考→ `i_distributed` | S01 | 采集集群基于已登记的跨平台计算资源设想 |
| `i_cloud` —参考→ `i_distributed` | S01 | 资源中心登记跨平台已用与候选资源 |
| `i_garden` —参考→ `i_cloud` | S02、S01 | 数字花园展示资源监控拓扑与状态 |
| `i_ops` —参考→ `i_cloud` | S02、S01 | 运维中心明确与云资源监控关联且职责独立 |
| `cf_worker` —写入→ `cf_d1` | S04、S03 | 正式业务写入经 Worker 到 D1 |
| `cf_worker` —写入→ `cf_kv` | S04、S03 | 草稿暂存经 Worker 写入 KV |
| `p_myapp_study` —集成→ `p_exam` | S03 | 仅表示本地学习模块路由接线，迁移与上线仍未完成 |
| `p_sc_val` —读取→ `p_sc_fin` | S07 | 估值提案引用独立财报对象，采纳不自动发生 |
| `p_exam_import` —使用→ `p_exam_bank` | S10 | 题库有效行导入进入题库管理 |
| `p_exam_ai` —读取→ `p_exam_bank` | S10 | 题库提供外部分析资料，系统本身不调用模型 |
| `p_mynet_mgr` —使用→ `p_mynet_data` | S13 | 管理台读取和保存共享数据 |
| `p_mynet_map` —使用→ `p_mynet_data` | S13 | 星图读取同一份共享数据 |
| `p_myapp_home` —使用→ `p_myapp_rem` | S03 | 首页查询近期提醒并复用提醒交互 |
| `p_myapp_home` —使用→ `p_myapp_aim` | S03 | 首页只读汇总待办状态 |

### 本轮验证

- `node tools/validate-data.mjs`：通过，0 个错误、0 条提示。
- `node --check data.js`：通过。
- `node tools/validate-data.mjs --list docs/data-inventory.md --json docs/data-snapshot.json`：通过，清单与快照已重新生成。
- 与编辑前数据逐项比对：原有 ID、隶属、关联及其标识保留；修改集合与来源清单一致；五项升格符合结构规则；共享读写代码与存储键不变；已保存浏览器数据仍优先；快照与默认数据一致。
- 隔离 Chromium 桌面检查（1440 × 900）：创意与项目各一处管理台、一处焦点星图，共四个入口正常加载；无 JavaScript 异常或页面级横向溢出。使用实际本地页面与数据文件，由测试拦截器装载静态资源，所有外部请求阻断，没有改动用户浏览器存储。
- 视觉检查发现：焦点视图同时显示属性与功能文字时，部分标签仍有局部叠放；属于页面布局问题，按本轮数据任务边界记录，未修改布局代码。
- 本次未重新验证手机、Firefox、Safari、长期运行性能或真实生产服务。页面交互代码未修改，两处 HTML 仅更新数据缓存版本。

## 12. 用户补充的技能经历（2026-11-02）

### 来源与写入内容

用户原话：「我还会英语，之前做过5年以上的c#开发，自学过一点点钢琴和小提琴」。

| 新增要素 | 记录内容 | 功能简述 |
| --- | --- | --- |
| `s_english` 英语 | 会英语，未提供具体使用场景或等级 | 使用英语理解与表达 |
| `s_csharp` C# 开发 | 此前从事 C# 开发 5 年以上，未提供具体框架、业务方向或当前熟练程度 | 使用 C# 开发软件 |
| `s_piano` 钢琴 | 自学过一点钢琴，保留少量自学经历的描述 | 学习钢琴演奏 |
| `s_violin` 小提琴 | 自学过一点小提琴，保留少量自学经历的描述 | 学习小提琴演奏 |

- 四项均作为技能星域的独立根节点；没有已确认的共同隶属，因此不挂到 Web 开发或其他既有技能下。根节点用于独立收录，不表示熟练度较高；后续有明确场景或细分内容时再展开。
- 本轮新增 4 个要素、4 个星系，未新增关系；原有要素与关系保持。技能星域现有 34 个要素，四个星域合计 49 个星系、262 个要素、58 条关系。
- 数据缓存版本更新为 `2026-11-02e`，共享存储键保持 `mynet.data.v3`，已有浏览器编辑继续优先。本次仅更新本地初始数据及交接材料，未部署。

### 本轮验证

- `node tools/validate-data.mjs --list docs/data-inventory.md --json docs/data-snapshot.json`：通过，0 个错误、0 条提示；清单与快照已重新生成。
- `node --check data.js`：通过。
- 相对本轮编辑前数据逐项核对：仅新增上述 4 个技能根节点，原有要素、关系、顺序与标识保持；存储键不变；快照内容与默认数据一致；两页缓存版本一致。
- 未执行浏览器视觉回归或真实生产服务验证；两页仅修改数据缓存版本。

## 变更记录

| 日期 | 内容 | 依据 |
| --- | --- | --- |
| 2026-11-02 | 演示数据替换为四个星域的真实初始数据（存储键 v2） | 第 7 节所列来源 |
| 2026-11-02 | 补充 cloudflaremyapp 创意清单 9 项及与项目的联系；LanguageStudy 角色动作改为「已暂停」（存储键 v3） | 创意清单、用户说明 |
| 2026-11-02 | 新增功能简述字段 `fn`，为全部 185 个要素填写 | 各要素现有说明 |
| 2026-11-02 | 归档设计与数据规范，新增校验脚本 | — |
| 2026-11-02 | 按第 11 节来源新增 73 个要素和 16 条关系，更新 18 项说明或简述、升格 5 项；缓存版本 2026-11-02d，存储键 v3 保持；重新生成清单与快照 | 第 11 节逐项来源与验证 |
| 2026-11-02 | 新增英语、C# 开发、钢琴、小提琴 4 个技能根节点及功能简述；保留用户对过往开发年限与少量自学经历的表述；缓存版本 2026-11-02e，存储键 v3 保持；校验通过并重新生成清单与快照 | 第 12 节用户自述 |
