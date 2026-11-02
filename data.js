/* MyNet 星图 · 共享数据层
   星图页（starmap.html）与管理台（manage.html）共用：初始数据 + 浏览器本地存储读写。
   创意星域另含 cloudflaremyapp 的创意暂存清单（docs/personal-site-idea-backlog-2026-11-02.md）。
   初始数据按 2026-11-02 本机各项目仓库（G:\selftool、G:\cloudflare、G:\stockcheck、G:\beffetindex）的
   README / 设计文档 / 配置整理；只记录名称、职责与状态，不写入账号 ID、密钥、令牌或内部地址。 */
(function(){
/* 要素 state: 'node' | 'attr'；parent 即唯一隶属。关系 from 可为属性或节点，to 必须是节点。 */
const N=(id,name,parent,desc='')=>({id,name,parent,state:'node',desc});
const A=(id,name,parent,desc='')=>({id,name,parent,state:'attr',desc});
const R=(from,type,to)=>({from,type,to});

const DOMAINS={
  skill:{name:'技能管理星域',short:'技能',en:'SKILLS',focus:'s_web',
    labels:{root:'核心技能',node:'子技能',attr:'技能场景'},
    relColors:{'帮助':'#5cf2ff','促进':'#6dff9c','诱发':'#ff6bd5'},
    elements:[
      N('s_web','全栈 Web 开发',null,'零构建网页、Node.js 本地服务与图形可视化，是各子项目的共同基础。'),
      N('s_web_js','原生 JavaScript','s_web','ES Modules、无框架单页应用。'),
      A('s_web_js_idb','离线队列与 IndexedDB','s_web_js','保存队列、幂等重试与离线草稿副本（知序考证）。'),
      N('s_web_node','Node.js 服务端','s_web','本地 HTTP 服务、node:sqlite 兼容层、esbuild 打包。'),
      N('s_web_viz','图形与可视化','s_web','Canvas、WebGL2 与 SVG 图表。'),
      A('s_web_viz_resp','响应式验收','s_web_viz','1366 / 768 / 375 等宽度无横向溢出。'),
      N('s_csharp','C# 开发',null,'此前从事 C# 开发 5 年以上（用户自述，2026-11-02）；具体框架、业务方向与当前熟练程度尚未细化。'),
      N('s_cf','Cloudflare 平台开发',null,'Workers、D1、KV、R2 与 Access 组成的个人工作台。'),
      N('s_cf_worker','Workers 开发','s_cf','路由、定时任务与静态资源绑定。'),
      N('s_cf_db','D1 / SQLite 数据库','s_cf','结构同步、迁移、补偿 SQL 与快照留痕。'),
      A('s_cf_access','Access 鉴权接入','s_cf','访问边界与身份校验。'),
      N('s_data','数据工程',null,'定时采集、同步与发布的数据管线。'),
      N('s_data_pipe','采集流水线','s_data','GitHub Actions 定时采集，白名单后发布公开镜像。'),
      N('s_data_py','Python 数据处理','s_data','采集、估值构建脚本与 pytest 测试。'),
      N('s_data_sf','Salesforce 集成','s_data','以只读方式把消费记录同步到工作台。'),
      N('s_inv','投资研究',null,'个股估值与长期市场指标。'),
      N('s_inv_val','估值建模','s_inv','四情景 DCF 与 PE Band。'),
      N('s_inv_macro','长期指标分析','s_inv','巴菲特指数、标普 500、日经 225 的去趋势与 Z-score。'),
      N('s_eng','软件工程流程',null,'测试、发布审核与 AI 协作开发。'),
      N('s_eng_test','自动化测试','s_eng','单元测试与 Playwright 浏览器回归。'),
      N('s_eng_rel','发布审核','s_eng','RELEASE_REVIEW 记录、本次部署确认、可追溯提交与推送。'),
      N('s_eng_ai','AI 协作开发','s_eng','Codex 开发、Claude 审核、人工确认的分工与交接文档。'),
      N('s_jp','日语',null,'生活与职场场景中的日语表达。'),
      N('s_jp_conv','情景会话','s_jp','做客、同事协作、客户活动安排等情景。'),
      A('s_jp_level','N2 / N1 表达','s_jp','练习默认 N2，可选 N1。'),
      N('s_english','英语',null,'会英语（用户自述，2026-11-02）；具体使用场景与熟练程度尚未细化。'),
      N('s_anim','2D 角色动画',null,'参数化动作与简单角色扮演。'),
      N('s_anim_rig','骨骼绑定与 IK','s_anim','Rigby2D 绑定、时间轴与裙摆网格。'),
      N('s_piano','钢琴',null,'自学过一点钢琴，记录少量自学经历（用户自述，2026-11-02）。'),
      N('s_violin','小提琴',null,'自学过一点小提琴，记录少量自学经历（用户自述，2026-11-02）。'),
      A('s_web_js_conflict','版本冲突保护','s_web_js','项目实践场景：工作台日记以内容版本避免旧编辑覆盖新内容；记录代码使用场景，不评价个人熟练度。'),
      A('s_data_pipe_contract','行情消费契约','s_data_pipe','项目实践场景：区分静态研究快照与动态行情，按证券身份、数据来源和时间字段消费；不把采集时间当成交时间。'),
      A('s_eng_test_data','结构与脱敏校验','s_eng_test','项目实践场景：MyNet 校验唯一隶属、关系目标、重复连线、功能简述和常见敏感信息；不代表其他项目已通过同样检查。'),
      A('s_inv_macro_window','指标独立更新窗口','s_inv_macro','长期指标文档中的维护场景：巴菲特与标普使用独立近期窗口和审计，更新历史数据需显式采纳；不记录个人投资结论。'),
    ],
relations:[R('s_data_py','帮助','s_inv_val'),R('s_inv_val','诱发','s_data_pipe'),R('s_web_viz','帮助','s_inv_macro'),
      R('s_cf_db','帮助','s_data_sf'),R('s_cf_worker','帮助','s_data_pipe'),R('s_eng_test','促进','s_eng_rel'),
      R('s_eng_ai','促进','s_web'),R('s_web_viz_resp','帮助','s_eng_test'),R('s_anim_rig','诱发','s_jp_conv'),
      R('s_eng_test_data','促进','s_eng_rel')]
  },
  idea:{name:'创意管理星域',short:'创意',en:'IDEAS',focus:'i_quote',
    labels:{root:'核心创意',node:'子创意',attr:'应用场景'},
    relColors:{'引发':'#ff6bd5','启发':'#ffe066','参考':'#5cf2ff'},
    elements:[
      N('i_quote','主站同源行情 API',null,'计划由工作台读取公开行情镜像并提供同源只读接口；据行情交接仍待接入与真实链路验收，本次未核验生产状态。'),
      N('i_quote_latest','最新数据分区接入','i_quote','最新分区在采集项目本地实现但未发布；Cloudflare 定时或手动同步及页面接入仍待实现。'),
      A('i_quote_list','名单自动同步打通','i_quote','补齐私库读取授权，让 StockCheck 名单增删自动生效。'),
      N('i_lang_ai','语言练习接入 AI',null,'真实模型接入与工作台上线仍待实施；当前语言练习为本地 mock 与离线模式，角色动画暂停决定保持不变。'),
      N('i_lang_ai_free','免费模型优先','i_lang_ai','候选包括 Gemini、Groq、Workers AI、OpenRouter、Mistral；需逐家复核官方免费条件及计费风险，尚未接入。'),
      N('i_lang_ai_deploy','上线工作台','i_lang_ai','Worker / D1、Access 保护、正式安全测试与学习数据迁移。'),
      A('i_lang_ai_offline','额度耗尽离线重演','i_lang_ai','模型额度用完时自动切到离线重演。'),
      N('i_plan','计划中心联动',null,'学习类项目把目标与结果交给长期计划中心统一安排。'),
      N('i_plan_lang','练习结果接口','i_plan','语言练习只暴露练习目标、训练结果与完成情况。'),
      A('i_plan_exam','题库达标联动','i_plan','考证题库的达标进度进入长期计划。'),
      N('i_holiday','假期与生日设置',null,'连续休假、生日等设置进入日历；需求已归档，界面原型已交接。'),
      N('i_health','身体手记并入工作台',null,'按主站数据库变更流程迁入 D1，统一入口并受 Access 保护。'),
      N('i_mynet','MyNet 星图扩展',null,'在现有结构规则上继续扩展。'),
      N('i_mynet_people','人际关系星域','i_mynet','节点命名、属性模板与关系类型尚未定义。'),
      A('i_mynet_cross','跨星域参照','i_mynet','范围、导航方式与跨方向移动规则待定。'),
      A('i_mynet_trash','删除与回收站规则','i_mynet','删除、撤销、恢复与手动降格的具体行为待定。'),
      // 以下来自 cloudflaremyapp 创意暂存清单（2026-11-02）：均为待调查 / 待设计，不代表已确认开发
      N('i_garden','数字生态花园',null,'待调查与待设计（2026-11-02）：以花园表达资源拓扑和真实状态。MyNet 是用户指定的直接实现；当前原型已展示拓扑，真实监控尚未接入。'),
      N('i_garden_meta','拓扑隐喻','i_garden','用自然物表达平台、服务、采集与同步关系。'),
      A('i_garden_meta_flower','花簇与花朵','i_garden_meta','一簇花 = 云平台，单朵花 = 服务，开合与萎蔫 = 健康状态。'),
      A('i_garden_meta_bee','蜜蜂','i_garden_meta','爬虫或 API 采集任务；灌木 = 外部 API、网站与数据源。'),
      A('i_garden_meta_ant','蚂蚁与蚁路','i_garden_meta','持续存储与数据同步关系。'),
      A('i_garden_event','真实事件驱动','i_garden','动画依据真实事件；未知或监控失联不得误报故障，装饰动画不得伪装成实时事件。'),
      A('i_garden_table','排障表格视图','i_garden','保留精确的普通监控表格。'),
      A('i_garden_impl','实现：MyNet 星图','i_garden','项目星域中的「MyNet 星图」是这个创意的直接实现。'),
      N('i_graph','个人属性知识图谱',null,'待调查与待设计（2026-11-02）：以实体、属性和有类型的关系组织内容。MyNet 兼顾此方向，时间轴、关系权重及路径分析不视为已实现。'),
      A('i_graph_identity','身份与位置分离','i_graph','同一节点可出现在多个视图中，实体身份与画布位置分离。'),
      A('i_graph_views','多视图','i_graph','关系图、树状图、表格、时间轴。'),
      A('i_graph_query','路径与结构分析','i_graph','路径查询、孤立节点与循环依赖分析。'),
      A('i_graph_tech','待评估技术','i_graph','React Flow、Cytoscape.js、AntV G6、D1/SQLite、JSON Schema，不预先锁定。'),
      N('i_ops','简易项目管理与运维中心',null,'待调查与待设计（2026-11-02）：项目状态、GitHub 变更、部署和故障管理。MyNet 兼顾此方向，实时同步和监控尚未接入。'),
      A('i_ops_gh','只读 GitHub 同步','i_ops','第一版以只读同步和本地任务记录为主，支持非 GitHub 项目手工登记。'),
      A('i_ops_flow','开发审核工作流','i_ops','可表达 Codex 开发 → Claude 审核 → 人工确认 → 部署。'),
      N('i_sub','个人会员与订阅管理中心',null,'待调查与待设计（2026-11-02）：结合消费记录与支付通知识别周期扣款；与 sfpaylogandbi 相关，原始流水保持不变。'),
      A('i_sub_detect','周期扣款识别','i_sub','不确定的匹配需人工确认，避免重复记账。'),
      A('i_sub_ledger','订阅台账','i_sub','服务、套餐、币种、金额、周期、支付方式、续费日、取消入口、试用期限。'),
      A('i_sub_alert','续费与异常提醒','i_sub','续费 / 试用到期、重复扣款、涨价、长期闲置。'),
      A('i_sub_raw','原始流水不变','i_sub','订阅模型独立存储；数据来源与权限待设计。'),
      N('i_lab','三大云交互式考试训练实验室',null,'待调查与待设计（2026-11-02）：模拟云控制台配置与考点训练；与知序题库相关，默认虚拟，不创建真实云资源。'),
      N('i_lab_train','虚拟控制台训练','i_lab','教官提出需求 → 亲手配置 → 规则引擎验收 → 分级提示 → 修改重试。'),
      A('i_lab_train_exam','覆盖考试','i_lab_train','AWS CLF / SAA、Azure AZ-900 / AZ-104、Google Cloud Digital Leader / ACE。'),
      A('i_lab_train_virtual','默认全部虚拟','i_lab_train','不创建真实云资源；标记模拟可信度。'),
      N('i_lab_sim','模拟器调研','i_lab','核实许可证、维护状态、控制台 UI、API / CLI 与验收覆盖度。'),
      A('i_lab_sim_aws','AWS 候选待核验','i_lab_sim','已列出若干开源 / 在线模拟器候选。'),
      A('i_lab_sim_other','Azure / Google Cloud 待调查','i_lab_sim','不预设已找到等价项目。'),
      N('i_maic','语言学习改进候选：OpenMAIC',null,'待调查与待设计（2026-11-02）：参考多智能体课堂改善语言学习辅助页；不表示已接入，也不恢复暂停的角色动画。'),
      A('i_maic_role','教学角色交互','i_maic','课程 / 场景生成、测验、项目式学习与教学反馈，不必复制完整架构。'),
      A('i_maic_rule','保持现有约束','i_maic','保留最终手动输入规则与免费 API 成本约束；已暂停的双角色动画不因此恢复。'),
      N('i_feed','信息源转换器与 RSS 爬虫调度',null,'待调查与待设计（2026-11-02）：把信息源转换为 Feed 并驱动采集；按用户说明关联 StockCheck 与 BuffettChart，尚未实施。'),
      N('i_feed_conv','信息源转换器','i_feed','网页特定内容、JSON / API、邮件订阅 → RSS / Atom / JSON Feed。'),
      N('i_feed_sched','RSS 驱动调度','i_feed','GitHub Actions 轮询 RSS → 判重 → 任务登记 → 按目标触发爬虫 → 统一 API 归档。'),
      A('i_feed_sched_once','共享 Feed 只轮询一次','i_feed_sched','降低重复访问；关键数据源仍定期核对。'),
      A('i_feed_sched_retry','可靠重试','i_feed_sched','Webhook / 队列通知，游标、幂等 ID、有限重试与缺口标记。'),
      A('i_feed_bus','个人事件总线（后续）','i_feed','可扩展，但不是首期必须实现的基础设施。'),
      N('i_capital','全球资本流动地图',null,'待调查与待设计（2026-11-02）：展示市场状态及有证据支持的资金流向，支持历史回放；数据来源与再分发条件尚待核验。'),
      A('i_capital_layer','数据分层','i_capital','L1 市场状态、L2 资金流代理、L3 可核实的跨境证券投资流量。'),
      A('i_capital_rule','不冒充真实流向','i_capital','箭头需有来源、方向、口径、周期与可信度；公开来源与再分发许可待调查。'),
      N('i_timeline','个人时光轴',null,'待调查与待设计（2026-11-02）：整理人生事件、人物、地点与成就，支持筛选回顾；本星图不录入实际日记或个人经历正文。'),
      A('i_timeline_filter','筛选与回顾','i_timeline','年份 / 主题 / 事件类型筛选、搜索与年度回顾。'),
      A('i_timeline_privacy','隐私与备份','i_timeline','不强制依附日历或日记；重视长期导出与备份。'),
      N('i_pool','免费 AI API 资源池',null,'需求登记，待验证（2026-11-02）：为语言练习统一接入候选模型，按质量、配额与健康选路；未注册或启用新服务。'),
      N('i_pool_candidates','供应商候选核验','i_pool','待调查（2026-11-02）：逐家核对官方免费条件、地区、结构化输出、日语质量与计费风险；未核验不得启用。'),
      A('i_pool_candidates_first','首批模型候选','i_pool_candidates','待核验：Gemini、GroqCloud、Workers AI、OpenRouter 免费模型、Mistral；这里只登记候选名称，不宣称免费政策已确认。'),
      A('i_pool_candidates_next','扩展模型候选','i_pool_candidates','待核验：SambaNova、Z.AI、Cohere、Ollama Cloud、OVHcloud AI Endpoints、Hugging Face Inference Providers、Typhoon。'),
      N('i_pool_adapter','统一模型适配','i_pool','待设计（2026-11-02）：供应商适配器统一输入输出契约，浏览器不持有模型凭据。'),
      A('i_pool_adapter_round','单次生成教学结果','i_pool_adapter','待设计：每轮尽可能一次生成对话、教师解释、评分与下一题，前端教学角色不分别发起专用模型请求。'),
      N('i_pool_route','配额与健康选路','i_pool','待设计（2026-11-02）：结合教学质量、健康状态、用量与冷却选路；配额未知不能视作无限。'),
      A('i_pool_route_retry','有界故障切换','i_pool_route','待设计：遇限流、超时、服务错误或无效结构化输出时有限重试与切换，并保留教学上下文。'),
      A('i_pool_route_free','禁止付费回退','i_pool_route','已登记约束：只启用经核验的免费模型；全部不可用时暂停或明确失败，不自动切换付费服务。'),
      A('i_pool_privacy','最小化日志内容','i_pool','待设计：日志默认不记录完整练习输入、凭据或敏感内容，启用前核对供应商数据使用政策。'),
      N('i_distributed','跨平台免费资源协作',null,'资源线索与架构设想登记，待考察（2026-11-02）；不代表已开通新平台或确认免费额度。'),
      A('i_distributed_contract','版本化协作契约','i_distributed','待设计：模块以版本化 REST、JSON Schema、任务标识、幂等写入和有限重试协作。'),
      A('i_distributed_owner','权威写入端','i_distributed','待设计：保留统一入口与身份验证，由明确的权威写入端维护敏感业务数据，公共镜像仅接收非敏感快照。'),
      A('i_distributed_candidates','平台候选分类','i_distributed','待考察：计算托管、数据库与对象存储、队列调度、监控通知分开登记；按实际瓶颈验证，不将候选写成已用资源。'),
      A('i_distributed_cost','免费条件与费用边界','i_distributed','待核验：配额归属、是否绑卡、超额计费与硬停机能力；预算提醒不能替代费用硬上限。'),
      N('i_crawl','分布式免费采集集群',null,'需求与架构设想登记，尚未实施（2026-11-02）：按数据源及计算能力分配采集任务，统一汇入权威数据层。'),
      A('i_crawl_dispatch','按任务能力分配','i_crawl','待设计：依据轻量请求或浏览器渲染需求、运行资源、剩余额度与成功率分配任务。'),
      N('i_crawl_ingest','统一接收与校验','i_crawl','待设计（2026-11-02）：通过认证接收数据，校验结构、时间、单位、完整性、异常与重复，再统一入库。'),
      A('i_crawl_ingest_trace','来源与幂等追踪','i_crawl_ingest','待设计：保留来源、任务标识、抓取时间和内容哈希，实施去重、有限重试与退避。'),
      A('i_crawl_storage','原始与标准化分层','i_crawl','待设计：原始材料进入私有对象存储，标准化结果与任务状态进入数据库，白名单快照再进入公共镜像。'),
      A('i_crawl_rollout','分阶段验证','i_crawl','待实施：先验证数据契约和统一接收，再复用现有采集链路；有实际瓶颈后才评估额外计算节点。'),
      N('i_cloud','个人云资源中心',null,'跨项目运维模块需求登记，待规划（2026-11-02）：统一资源台账、监控、配额与依赖展示；未创建页面、数据库或监控任务。'),
      N('i_cloud_ledger','资源与配额台账','i_cloud','待设计（2026-11-02）：记录用途、关联模块、免费条件、状态与有效期；秘密只保留受控引用，不展示原值。'),
      A('i_cloud_ledger_measure','测量可信等级','i_cloud_ledger','待设计：明确区分官方精确值、本地估算与未知，并记录采样时间和统计延迟；不展示伪精确额度。'),
      A('i_cloud_ledger_cost','费用风险提示','i_cloud_ledger','待核验：是否自动计费、能否硬停止以及续期条件；现有数据不填未经核实的套餐、金额或额度。'),
      N('i_cloud_monitor','独立主备监控','i_cloud','待设计（2026-11-02）：GitHub Actions 主监控与独立平台看门狗分工，Cloudflare 接收与展示结果；不宣称已实现高可用。'),
      A('i_cloud_monitor_lease','接管与补传','i_cloud_monitor','待设计：用租约、唯一任务和幂等写入控制接管；接收端不可用时暂存结果，恢复后补传。'),
      A('i_cloud_monitor_state','区分失联与故障','i_cloud_monitor','待设计：分别记录监控心跳、资源最近成功与数据观测时间，区分资源异常、监控失联、额度未知和数据过期。'),
      A('i_cloud_readonly','只读状态展示','i_cloud','待设计：页面读取已有快照或缓存，不在打开页面时同步遍历第三方服务。'),
      A('i_cloud_alert','提醒联动','i_cloud','待设计：用量、有效期、连续失败与数据过期可与已有提醒和日历联动，尚未配置任务或通知。'),
    ],
relations:[R('i_lang_ai','引发','i_plan'),R('i_holiday','启发','i_plan'),R('i_health','参考','i_lang_ai_deploy'),
      R('i_quote_list','参考','i_quote_latest'),
      R('i_mynet','参考','i_garden'),R('i_mynet','参考','i_graph'),R('i_mynet','参考','i_ops'),
      R('i_ops','参考','i_garden'),R('i_maic','参考','i_lang_ai'),R('i_feed_sched','启发','i_quote'),
      R('i_lang_ai_free','参考','i_pool'),R('i_crawl','参考','i_distributed'),R('i_cloud','参考','i_distributed'),R('i_garden','参考','i_cloud'),R('i_ops','参考','i_cloud')]
  },
  res:{name:'网络资源管理星域',short:'资源',en:'RESOURCES',focus:'cf',
    labels:{root:'平台',node:'服务',attr:'能力'},
    relColors:{'读取自':'#5cf2ff','写入':'#6dff9c','提供接口给':'#b98cff','调用':'#ff6bd5','依赖':'#ffb547','保护':'#ffe066'},
    elements:[
      N('cf','Cloudflare',null,'个人工作台 myapp 的运行平台：Worker、D1、KV、R2 与访问控制。'),
      N('cf_worker','Worker · myapp','cf','个人工作台：页面、业务 API、子项目集成路由与静态展示包的统一入口。'),
      A('cf_worker_cron','定时触发','cf_worker','每小时及每日数次：消费同步、缴费提醒回填、读取 PE 版本等。'),
      A('cf_worker_assets','静态资源绑定','cf_worker','导入的 StockCheck 研究包、长期指标页等只读展示内容。'),
      A('cf_worker_logs','可观测日志','cf_worker','请求日志持久化，用于发布后核验。'),
      N('cf_d1','D1 · 工作台主库','cf','正式业务记录：待办与处理记录、提醒、日记、消费快照等。'),
      N('cf_kv','KV','cf','日记草稿、图表偏好等轻量键值。'),
      N('cf_r2','R2 · 对象存储','cf','PE 版本等私有传输对象，由工作台定时读取。'),
      N('cf_access','Access 访问控制','cf','保护整个工作台的登录与鉴权。'),
      N('gh','GitHub',null,'代码托管与自动化。'),
      N('gh_private','私有仓库','gh','cloudflaremyapp、stockcheck、catchStockData、BuffettChart 等源码与数据。'),
      N('gh_actions','Actions','gh','定时采集、同步与发布任务。'),
      A('gh_act_quote','行情采集任务','gh_actions','据 2026-10-31 行情交接：个股与板块指标分任务、按市场时段调度；采集时刻不等于已确认成交或收盘时刻。'),
      A('gh_act_list','名单同步任务','gh_actions','下载 StockCheck 名单并提取 watchlist；私库读取授权待补，失败时保留旧名单。'),
      A('gh_act_mirror','镜像发布任务','gh_actions','把白名单后的最新行情推送到公开镜像。'),
      A('gh_act_pe','PE 每周重算','gh_actions','StockCheck 每周日重算 PE，写入私有传输。'),
      N('gh_mirror','公开行情镜像','gh','可匿名读取的最新行情 JSON；不含持仓、估值与审批。'),
      N('gg','自用谷歌服务',null,'邮件通知与历史资料来源。'),
      N('gg_gmail','Gmail','gg','日股 / 美股自动日报的收件通道。'),
      N('gg_drive','Google Drive','gg','StockCheck、BuffettChart 原始资料的历史来源；已迁移为本地维护，未自动写回。'),
      N('sf','Salesforce',null,'消费记录的原始账本，工作台只读同步。'),
      A('sf_api','消费记录只读接口','sf','每天单向同步到工作台 D1 快照。'),
      N('mk','行情数据源',null,'外部市场数据，仅由采集任务读取。'),
      N('mk_tv','TradingView','mk','个股与板块行情来源。'),
      N('mk_jpx','JPX 日本交易所','mk','日股相关公开数据来源。'),
      N('ai','AI 开发助手',null,'参与开发、审核与交接的 AI 工具。'),
      N('ai_claude','Claude Code','ai','开发与审核助手。'),
      N('ai_codex','Codex','ai','编码与交接。'),
      A('ai_models','语言练习候选模型','ai','Gemini、Groq、Workers AI、OpenRouter、Mistral 等仅为语言练习候选；未接入，免费条件和额度须在启用前核验。'),
      N('dev','本机开发环境',null,'各项目本地开发、测试与发布工具。'),
      A('dev_node','Node.js 24','dev','各子项目本地运行与测试。'),
      A('dev_python','Python','dev','行情采集与估值构建脚本。'),
      A('dev_wrangler','Wrangler CLI','dev','构建检查、D1 结构同步，以及确认后的部署。'),
      A('dev_playwright','Playwright','dev','多宽度浏览器回归测试。'),
      A('cf_worker_assets_scope','静态资源白名单','cf_worker','架构文档登记：浏览器资源显式登记，研究展示包独立分发；后端脚本、设计文档和内部路径不作为公开资源。'),
      A('cf_kv_drafts','日记草稿暂存','cf_kv','存储契约登记：草稿与正式日记分开；正式保存后按草稿修订版本清理，避免删除较新的草稿。'),
      A('cf_kv_prefs','界面偏好','cf_kv','存储文档登记：保存图表等界面偏好；此处不记录实际用户偏好值。'),
      A('gh_mirror_scope','公开字段白名单','gh_mirror','行情交接文档登记：公开镜像只发布白名单行情；私有研究、审批、持有信息与原始归档不进入镜像。'),
      A('gh_mirror_time','采集时间边界','gh_mirror','据 2026-10-31 行情交接：采集时间与成交时间分开，解析完整不代表确认收盘；本次未核验线上数据。'),
      N('mk_multpl','Multpl 与 Shiller','mk','长期指标文档登记的标普月均历史来源，不表示即时行情接口；实际使用范围以指标维护文档为准。'),
      N('mk_ecb','ECB 与 DataStream','mk','长期指标文档登记的日经月均历史来源；文档限定受控个人工作台使用，来源与许可需随实际使用复核。'),
    ],
relations:[R('cf_worker','读取自','cf_d1'),R('cf_worker','读取自','cf_kv'),R('cf_worker_cron','读取自','cf_r2'),
      R('cf_access','保护','cf_worker'),R('sf_api','提供接口给','cf_worker'),R('gh_act_pe','写入','cf_r2'),
      R('gh_act_mirror','写入','gh_mirror'),R('gh_act_list','读取自','gh_private'),R('gh_act_quote','读取自','mk_tv'),
      R('gh_act_quote','读取自','mk_jpx'),R('gg_gmail','读取自','gh_mirror'),R('dev_wrangler','调用','cf_worker'),
      R('cf_worker','写入','cf_d1'),R('cf_worker','写入','cf_kv')]
  },
  proj:{name:'项目管理星域',short:'项目',en:'PROJECTS',focus:'p_myapp',
    labels:{root:'项目',node:'功能',attr:'特征'},
    relColors:{'集成':'#ffb547','使用':'#6dff9c','读取':'#5cf2ff','参考':'#b98cff'},
    elements:[
      N('p_myapp','个人工作台 myapp',null,'cloudflaremyapp：负责导航、访问边界、D1/KV 与最终部署；业务功能在子项目开发后合并。'),
      N('p_myapp_aim','待办与处理记录','p_myapp','三状态待办与阶段处理记录。'),
      N('p_myapp_rem','事项提醒','p_myapp','提醒与事项面板：循环规则、置顶、改期。'),
      N('p_myapp_diary','日记与草稿','p_myapp','日记入 D1，草稿暂存 KV。'),
      N('p_myapp_int','集成与发布','p_myapp','子项目合并、展示包导入、路由白名单与发布审核。'),
      A('p_myapp_int_flow','发布流程','p_myapp_int','子项目开发检测 → 合并主站验证 → 本次部署确认 → 部署 → 提交推送。'),
      A('p_myapp_int_review','发布审核记录','p_myapp_int','每次部署前在项目根目录更新 RELEASE_REVIEW.md。'),
      N('p_rem','事项提醒子项目',null,'reminders-app：提醒模块的独立开发仓库，不独立部署，完成后同步到主站。'),
      A('p_rem_drag','拖拽改期','p_rem','桌面拖拽与触屏 / 键盘按钮，今天 / 明天立即改期。'),
      N('p_sc','StockCheck 个股监察',null,'个股名单、财报、估值与研究审核的权威来源；导出只读研究包到工作台。'),
      N('p_sc_list','监察名单','p_sc','证券身份与 scope 的权威名单（2026-10-31：正式 watchlist 122 条，JP 67 / US 54 / DE 1）。'),
      N('p_sc_val','四情景估值','p_sc','四档估值、研究版本与采纳记录。'),
      A('p_sc_val_dcf','DCF','p_sc_val','四情景现金流折现。'),
      A('p_sc_val_pe','PE Band','p_sc_val','正式与近似 PE 均可绘制，近似明确标记风险。'),
      N('p_sc_pe','PE 每周刷新','p_sc','周日重算，经私有传输供工作台每日读取（2026-10-31 已部署）。'),
      N('p_sc_pkg','研究展示包','p_sc','白名单导出的网页与研究摘要，排除持仓与审批原话。'),
      A('p_sc_idea','相关创意：信息转换器与 RSS 爬虫','p_sc','以 RSS 驱动的采集调度补充个股页面数据。'),
      N('p_cs','catchStockData 行情采集',null,'日美德个股行情与板块 / 宏观采集，生成公开镜像。'),
      N('p_cs_quote','行情采集','p_cs','据 2026-10-31 行情交接：按各市场时段采集名单内报价；休市与提前收盘过滤尚待补充，本次未重新核验线上任务。'),
      N('p_cs_sync','名单同步','p_cs','从 StockCheck 下载名单提取 watchlist；私库读取授权待补，失败保留旧名单。'),
      N('p_cs_mirror','公开镜像发布','p_cs','最新行情 JSON 推送到公开仓库。'),
      A('p_cs_latest','最新数据分区','p_cs','新增 updates JSON（本地实现，未发布）；工作台同步与页面接入待实现。'),
      A('p_cs_mail','日报邮件消费','p_cs','据 2026-10-31 交接：独立日报任务读取按市场保留的私有收盘候选并核验交易日；周月报尚未统一契约，持续运行仍待验收。'),
      N('p_bc','BuffettChart 长期指标',null,'巴菲特指数、标普 500、日经 225 的长期价格与去趋势图。'),
      N('p_bc_buffett','巴菲特指数','p_bc','标准指数、去趋势偏离与 Z-score。'),
      N('p_bc_sp','标普 500','p_bc','月度数据与独立模型。'),
      N('p_bc_nk','日经 225','p_bc','月度数据与独立模型。'),
      N('p_bc_build','构建与集成','p_bc','生成发布清单与哈希资源，由工作台校验接入。'),
      A('p_bc_idea','相关创意：信息转换器与 RSS 爬虫','p_bc','以 RSS 驱动的采集调度补充长期指标页数据。'),
      N('p_sf','sfpaylogandbi 消费记录',null,'消费记录、消费 Dashboard 与周期缴费监控；最终合并进工作台。'),
      N('p_sf_sync','消费同步','p_sf','Salesforce 每天单向只读同步到 D1 快照。'),
      N('p_sf_dash','消费 Dashboard','p_sf','消费图表，偏好保存在 KV。'),
      N('p_sf_bill','周期缴费监控','p_sf','缴费计划与状态，提前 3 个日本自然日写入已有事项。'),
      A('p_sf_idea','相关创意：会员与订阅','p_sf','个人会员与订阅管理中心，识别周期扣款。'),
      N('p_cal','日历与长期计划中心',null,'calendarAndPlanner：P1 日历、P2 长期计划；已集成主站源码，尚未执行生产迁移与部署。'),
      N('p_cal_p1','P1 日历','p_cal','日历与首页日程卡。'),
      N('p_cal_p2','P2 长期计划','p_cal','计划、阶段、任务、里程碑独立存储，提醒复用既有功能。'),
      A('p_cal_p2_gantt','甘特 / 依赖 / 基线','p_cal_p2','含实际记录与执行时间块。'),
      A('p_cal_p2_cap','全局容量与重排预览','p_cal_p2','重排需预览确认。'),
      A('p_cal_p2_exam','题库达标快照','p_cal_p2','计划中显示题库达标进度。'),
      A('p_cal_holiday','假期与生日设置','p_cal','需求归档与界面原型交接（2026-11-02）。'),
      N('p_exam','知序 · 考证学习',null,'selfexamsystem：多题库刷题与模拟考，v0.1 本地可运行；提供 Worker + D1 入口，未部署。'),
      N('p_exam_bank','题库管理','p_exam','多题库、两级标签、手工录题与 JSON / ZIP 导入。'),
      N('p_exam_mock','模拟考试','p_exam','60 分钟、随机最多 70 题、90% 合格线，服务端判分。'),
      N('p_exam_master','错题与掌握','p_exam','不同轮次连续正确 3 次视为掌握。'),
      A('p_exam_img','图片引用','p_exam','登记 Git / Drive / R2 图片引用。'),
      A('p_exam_idea','相关创意：云交互试验室','p_exam','三大云交互式考试训练实验室。'),
      N('p_health','身体手记',null,'私人身体状况记录：用人体定位与症状按钮减少输入；计划集成到工作台。'),
      N('p_health_sym','症状登记','p_health','一次登记多个病痛，分别描述并回看变化。'),
      N('p_health_body','体重与腰围','p_health','核心关注项，独立快速登记并查看趋势。'),
      N('p_lang','LanguageStudy 语言练习',null,'日语情景对话练习；本地 mock 版，未连接真实 AI，未部署。'),
      N('p_lang_bank','情景题库','p_lang','13 类、35 主题、44 场景、512 题。'),
      N('p_lang_mode','应对方式','p_lang','拼词组句（默认 N2，可选 N1）与自由应对。'),
      N('p_lang_char','角色动作','p_lang','双角色动画子模块，目前已暂停开发。'),
      A('p_lang_plan','计划中心接口（预留）','p_lang','只暴露练习目标、训练结果与完成情况。'),
      A('p_lang_ai','教师点评','p_lang','当前为本地模拟教师点评与日语例句；真实 AI 未接入，额度或服务不可用时采用离线重演方案。'),
      A('p_lang_idea','改进候选：OpenMAIC','p_lang','多智能体互动课堂，作为语言学习辅助页的改进参考。'),
      N('p_wc','WebCharacter 网页角色',null,'零构建 2D 角色原型：Rigby2D、WebGL2 与 Canvas。'),
      N('p_wc_rig','绑定与 IK','p_wc','时间轴、IK、裙摆网格与绑定生成器。'),
      A('p_wc_apple','苹果小剧场','p_wc','双角色递苹果的动作演示。'),
      A('p_wc_magic','魔法书与扫帚','p_wc','拾书、收纳、侧坐飞走的动作演示。'),
      N('p_mynet','MyNet 星图',null,'数字生态花园的直接实现，兼顾个人属性知识图谱与简易项目运维管理：星图展示与管理台。'),
      N('p_mynet_map','星图展示','p_mynet','顶级总览、星团总览与焦点星图。'),
      N('p_mynet_mgr','管理台','p_mynet','表格查找与编辑，遵循单一隶属与自动升格规则。'),
      N('p_mynet_data','共享数据层','p_mynet','两页共用，保存在浏览器本地。'),
      A('p_mynet_idea','实现的创意','p_mynet','数字生态花园（直接实现）、个人属性知识图谱、简易项目管理与运维中心。'),
      N('p_myapp_home','首页总览','p_myapp','页面文档登记：只读汇总待办状态和近期提醒摘要，快捷入口复用原模块；本次未重新验收生产页面。'),
      A('p_myapp_nav','共享导航','p_myapp','页面文档登记：统一生成本地模块与研究页面入口，窄屏使用可展开导航。'),
      A('p_myapp_diary_draft','草稿恢复','p_myapp_diary','页面文档登记：暂存与正式日记分开；恢复前确认，正式保存后仅清理匹配的草稿版本。'),
      A('p_myapp_diary_version','乐观锁保护','p_myapp_diary','页面文档登记：保存和删除携带读取版本；冲突保留当前输入，先暂存再处理合并。'),
      N('p_myapp_study','考证模块接线','p_myapp','据当前页面文档：学习页面与接口已在本地接入主站路由；结构迁移待应用，候选数据导入仍阻断，不能视为已上线。'),
      A('p_rem_cycle','循环与分组','p_rem','主站页面文档登记：循环提醒支持间隔、相对定时与年度日期，按状态分组并提供列表和看板。'),
      A('p_rem_guard','改期写入边界','p_rem','子项目回执登记（2026-10-31）：同日期操作不写入，旧记录冲突拒绝，已完成事项禁止拖拽；本次未执行线上改期。'),
      N('p_sc_fin','季度财报归档','p_sc','项目文档登记：按公司与期间保存独立财报、来源与附件，保留币种和单位；录入财报不自动改写估值。'),
      A('p_sc_fin_import','报表去重与修订','p_sc_fin','相同内容导入返回既有对象；更正报表新增版本并指向旧记录，不覆盖历史报表。'),
      A('p_sc_fin_parse','下载与解析分离','p_sc_fin','文档登记：官方披露获取与财务指标解析分开；已登记的获取能力不代表所有公司自动更新，也不等于财务审计完成。'),
      A('p_sc_compare','逐股情景对比','p_sc','页面文档登记：每行使用独立价格轴，缺档不补点；报价变化不自动重估，也不构成交易指令。'),
      A('p_cs_quote_time','行情可信度','p_cs_quote','据 2026-10-31 交接：解析完整性与确认收盘分开，保留各市场上次有效采集时间；休市及提前收盘过滤仍待补充。'),
      A('p_bc_buffett_cycle','维护周期','p_bc_buffett','指标文档登记：每六个月维护，提前三十天进入提醒窗口；构建不会重置数据日期。'),
      A('p_bc_sp_window','月度更新窗口','p_bc_sp','指标文档登记：最近二十四个月作为更新窗口，旧月移入固定历史；修订需显式采纳及原因。'),
      A('p_bc_sp_cycle','维护周期','p_bc_sp','指标文档登记：每两个月维护，提前十四天提醒；提醒按来源项目规定的日历日期计算。'),
      A('p_bc_nk_cycle','维护周期','p_bc_nk','指标文档登记：每两个月维护，提前十四天提醒；保持独立月均序列及全历史模型。'),
      A('p_bc_nk_scope','来源使用边界','p_bc_nk','指标文档限定当前受控个人工作台使用；不将第三方历史序列自动公开再分发。'),
      A('p_bc_export','图表与快照下载','p_bc','指标文档登记：分别下载各指标的两张 SVG 与完整快照，读取失败互不阻塞，不自动上传云盘。'),
      N('p_exam_import','题库导入预览','p_exam','本地初版已实现（据 README）：JSON 或 ZIP 预览逐行错误和重复差异，显式导入有效行，并支持分批续传。'),
      N('p_exam_session','会话与保存屏障','p_exam','本地初版已实现（据 README）：唯一活跃会话、暂停恢复、服务端判分与跨页保存屏障；远端竞争仍待验证。'),
      A('p_exam_session_queue','离线保存队列','p_exam_session','本地实现使用 IndexedDB 队列、幂等重试和版本校验；不等于已完成完全离线首次开站。'),
      N('p_exam_review','统计与考后复盘','p_exam','本地初版已实现（据 README）：首答、近期、考试及重复统计，父标签去重，并保留历史成绩与考后复盘。'),
      N('p_exam_ai','外部 AI 资料交换','p_exam','本地初版提供资料模板、分析包和 Markdown 报告回存；项目本身不调用模型，缺失图片的分析包会标为不完整。'),
      N('p_exam_backup','结构化备份恢复','p_exam','本地初版支持结构化备份及恢复到新数据库文件；在线替换恢复尚未提供，本次未读取任何用户题库或作答数据。'),
      A('p_lang_mode_hand','最终完整手打','p_lang_mode','既有学习约束：词块排序保留参考，最终答案必须完整手动输入，不以点击、拖动或粘贴替代。'),
      A('p_lang_offline','本地离线训练','p_lang','README 登记本地离线情景训练，不依赖外部模型；本地服务仍需运行，未接入真实 AI 或部署。'),
      A('p_lang_resume','中断恢复与记录交换','p_lang','README 登记：刷新或关闭练习后可继续或结束结算，练习记录支持本地 JSON 导入导出。'),
      A('p_mynet_map_distance','焦点距离探索','p_mynet_map','当前原型：无向最短路径，范围一至五；属性与所属节点同距离，边界提示未展开的邻居。'),
      A('p_mynet_map_layers','三层总览过渡','p_mynet_map','当前原型：星域总览、星团总览、焦点视图以连续相机过渡连接；总览是导航层，局部探索使用焦点。'),
      A('p_mynet_mgr_promote','自动升格与防环','p_mynet_mgr','当前原型：属性被引用或添加下级时自动升格；移动隶属排除自身与后代，并在提交前校验。'),
      A('p_mynet_data_validate','数据校验与清单','p_mynet_data','当前工具校验结构、端点、关系用词及常见敏感信息，并生成清单和快照；不能替代人工事实核对。'),
      A('p_mynet_data_local','本地编辑优先','p_mynet_data','当前原型优先读取浏览器已保存数据；更新初始数据不覆盖本地编辑，未提供服务端同步。'),
    ],
relations:[R('p_myapp_rem','集成','p_rem'),R('p_myapp_int','集成','p_sc_pkg'),R('p_myapp_int','集成','p_bc_build'),
      R('p_myapp','集成','p_cal'),R('p_myapp','集成','p_sf'),R('p_myapp','集成','p_health'),
      R('p_cs_sync','读取','p_sc_list'),R('p_cs_mail','读取','p_cs_mirror'),R('p_sf_bill','使用','p_myapp_rem'),
      R('p_lang_plan','参考','p_cal'),R('p_lang_char','使用','p_wc'),
      R('p_myapp_study','集成','p_exam'),R('p_sc_val','读取','p_sc_fin'),R('p_exam_import','使用','p_exam_bank'),R('p_exam_ai','读取','p_exam_bank'),R('p_mynet_mgr','使用','p_mynet_data'),R('p_mynet_map','使用','p_mynet_data'),R('p_myapp_home','使用','p_myapp_rem'),R('p_myapp_home','使用','p_myapp_aim')]
  }
};

/* 功能简述（fn）：一句话说明该要素“做什么”；说明（desc）保留细节与状态 */
const FN={
  // —— 技能
  s_web:'构建并维护各个人站点与工具页面',
  s_web_js:'不依赖框架编写浏览器端交互',
  s_web_js_idb:'断网时暂存数据，恢复后可靠重传',
  s_web_node:'用 Node.js 提供本地服务、数据库与打包',
  s_web_viz:'把数据与角色绘制成图表和动画',
  s_web_viz_resp:'确保页面在桌面、平板、手机上都可用',
  s_csharp:'使用 C# 开发软件',
  s_cf:'在 Cloudflare 上搭建与运维个人工作台',
  s_cf_worker:'编写运行在边缘的页面与 API',
  s_cf_db:'设计、迁移并安全变更业务数据库',
  s_cf_access:'为站点加上登录保护与身份校验',
  s_data:'让数据定时、可靠地流动和归档',
  s_data_pipe:'定时抓取行情并发布为可读数据',
  s_data_py:'用 Python 编写采集与计算脚本',
  s_data_sf:'把 Salesforce 账本只读同步到工作台',
  s_inv:'研究个股价值与市场长期位置',
  s_inv_val:'用 DCF 与 PE 区间估算个股价值',
  s_inv_macro:'判断大盘相对长期趋势的高低',
  s_eng:'保证改动可验证、可审核、可回溯',
  s_eng_test:'用自动测试守住功能与界面',
  s_eng_rel:'在部署前记录变更并取得确认',
  s_eng_ai:'让多个 AI 分工开发、审核与交接',
  s_jp:'在日本生活与工作中用日语沟通',
  s_jp_conv:'应对做客、协作、客户安排等场景',
  s_jp_level:'按 N2 / N1 难度组织表达',
  s_english:'使用英语理解与表达',
  s_anim:'制作可参数化控制的 2D 角色动作',
  s_anim_rig:'给角色拆层、绑骨并驱动关节',
  s_piano:'学习钢琴演奏',
  s_violin:'学习小提琴演奏',
  // —— 创意
  i_quote:'让工作台直接提供只读行情数据',
  i_quote_latest:'把最新行情分区同步进工作台页面',
  i_quote_list:'让个股名单变化自动进入采集',
  i_lang_ai:'用真实 AI 生成点评与对话',
  i_lang_ai_free:'先用免费模型控制成本',
  i_lang_ai_deploy:'把语言练习部署到工作台并加保护',
  i_lang_ai_offline:'额度用完时改用离线重演',
  i_plan:'用计划中心统一安排各类学习目标',
  i_plan_lang:'把练习目标与结果提供给计划中心',
  i_plan_exam:'让题库达标进度进入长期计划',
  i_holiday:'在日历中管理连续休假与生日',
  i_health:'把身体手记纳入工作台统一入口',
  i_mynet:'继续扩展星图的管理方向与规则',
  i_mynet_people:'用星图管理人际关系',
  i_mynet_cross:'允许不同星域之间互相参照',
  i_mynet_trash:'定义删除、撤销与恢复的行为',
  i_garden:'把云资源监控变成可交互的花园',
  i_garden_meta:'用花、蜜蜂、蚂蚁表达资源拓扑',
  i_garden_meta_flower:'表示平台、服务及其健康状态',
  i_garden_meta_bee:'表示采集任务与外部数据源',
  i_garden_meta_ant:'表示存储与数据同步关系',
  i_garden_event:'只按真实事件改变画面状态',
  i_garden_table:'提供精确的表格用于排障',
  i_garden_impl:'由 MyNet 星图直接实现',
  i_graph:'以实体和带属性的关系组织个人知识',
  i_graph_identity:'同一实体可出现在多个视图中',
  i_graph_views:'在关系图、树、表格、时间轴间切换',
  i_graph_query:'查询路径并发现孤立节点与循环',
  i_graph_tech:'列出待评估的图谱技术方案',
  i_ops:'一处查看项目进度、部署与故障',
  i_ops_gh:'只读同步 GitHub 提交、PR 与发布',
  i_ops_flow:'表达开发、审核、确认、部署的流程',
  i_sub:'管理所有会员订阅与续费',
  i_sub_detect:'从消费记录中找出周期扣款',
  i_sub_ledger:'记录每项订阅的套餐、金额与续费日',
  i_sub_alert:'提醒续费、试用到期与异常扣款',
  i_sub_raw:'订阅数据独立存放，不改原始流水',
  i_lab:'在虚拟控制台中练习云认证考点',
  i_lab_train:'按教官需求亲手配置并自动验收',
  i_lab_train_exam:'覆盖 AWS、Azure、GCP 认证考试',
  i_lab_train_virtual:'只模拟，不创建真实云资源',
  i_lab_sim:'挑选可复用的云模拟器',
  i_lab_sim_aws:'核验 AWS 模拟器候选',
  i_lab_sim_other:'寻找 Azure 与 GCP 的模拟器',
  i_maic:'借鉴多智能体课堂改进语言练习',
  i_maic_role:'让 AI 扮演教师与同学参与对话',
  i_maic_rule:'不破坏手动输入与免费成本约束',
  i_feed:'把各类信息源变成 Feed 并驱动采集',
  i_feed_conv:'把网页、API、邮件转成订阅 Feed',
  i_feed_sched:'发现新条目后触发对应爬虫',
  i_feed_sched_once:'多目标共用 Feed，只抓一次',
  i_feed_sched_retry:'失败可重试且不重复处理',
  i_feed_bus:'后续统一分发个人事件',
  i_capital:'在世界地图上展示资金流动',
  i_capital_layer:'按可信度分层组织市场与资金数据',
  i_capital_rule:'只画有证据支持的流向',
  i_timeline:'把人生经历整理成可缩放时间轴',
  i_timeline_filter:'按年份、主题筛选并做年度回顾',
  i_timeline_privacy:'保护隐私并支持长期导出备份',
  // —— 资源
  cf:'托管个人工作台的云平台',
  cf_worker:'运行工作台的页面与业务 API',
  cf_worker_cron:'按计划自动执行同步与提醒',
  cf_worker_assets:'提供导入的静态展示页面',
  cf_worker_logs:'记录请求日志以便核验',
  cf_d1:'保存工作台的正式业务数据',
  cf_kv:'保存草稿与偏好等小数据',
  cf_r2:'存放私有传输的数据文件',
  cf_access:'只允许本人登录访问工作台',
  gh:'托管代码并运行自动化任务',
  gh_private:'保存不公开的源码与数据',
  gh_actions:'按计划运行采集、同步与发布',
  gh_act_quote:'按市场任务采集报价与指标',
  gh_act_list:'同步最新的个股监察名单',
  gh_act_mirror:'把行情发布到公开镜像',
  gh_act_pe:'每周重算 PE 并写入私有传输',
  gh_mirror:'对外提供可匿名读取的最新行情',
  gg:'提供邮件与云盘服务',
  gg_gmail:'接收自动行情日报',
  gg_drive:'保存早期原始资料',
  sf:'记录消费原始账本',
  sf_api:'向工作台提供只读消费记录',
  mk:'提供外部市场行情',
  mk_tv:'提供个股与板块行情',
  mk_jpx:'提供日股公开数据',
  ai:'协助编写、审核与交接代码',
  ai_claude:'协助开发与审核改动',
  ai_codex:'协助编码与整理交接',
  ai_models:'语言练习可选用的 AI 模型',
  dev:'在本机开发、测试与部署',
  dev_node:'运行各项目的本地服务与测试',
  dev_python:'运行采集与估值脚本',
  dev_wrangler:'检查、同步并部署 Cloudflare 项目',
  dev_playwright:'在真实浏览器中自动回归页面',
  // —— 项目
  p_myapp:'个人工作台：统一入口、登录与部署',
  p_myapp_aim:'管理待办及其处理过程',
  p_myapp_rem:'提醒到期事项并支持改期',
  p_myapp_diary:'书写并保存日记',
  p_myapp_int:'接入子项目并安全发布',
  p_myapp_int_flow:'规定从开发到部署的步骤',
  p_myapp_int_review:'为每次发布留下可审核记录',
  p_rem:'独立开发提醒模块后同步主站',
  p_rem_drag:'拖动提醒即可改到今天或明天',
  p_sc:'监察个股并给出估值研究',
  p_sc_list:'维护需要监察的证券名单',
  p_sc_val:'按四种情景估算个股价值',
  p_sc_val_dcf:'用现金流折现估值',
  p_sc_val_pe:'用历史 PE 区间判断估值高低',
  p_sc_pe:'每周更新 PE 数据供页面读取',
  p_sc_pkg:'把研究结果打包给工作台展示',
  p_sc_idea:'用 RSS 驱动的采集补充个股数据',
  p_cs:'自动采集行情并发布公开镜像',
  p_cs_quote:'按市场时段采集名单内报价',
  p_cs_sync:'从 StockCheck 获取最新名单',
  p_cs_mirror:'把最新行情推送到公开仓库',
  p_cs_latest:'提供最新数据的分区读取',
  p_cs_mail:'用镜像数据生成每日行情邮件',
  p_bc:'展示大盘长期估值指标',
  p_bc_buffett:'用市值与 GDP 之比看整体估值',
  p_bc_sp:'展示标普 500 长期趋势与偏离',
  p_bc_nk:'展示日经 225 长期趋势与偏离',
  p_bc_build:'构建图表页面并接入工作台',
  p_bc_idea:'用 RSS 驱动的采集补充指标数据',
  p_sf:'记录消费并监控周期缴费',
  p_sf_sync:'每天把 Salesforce 消费同步进来',
  p_sf_dash:'用图表查看消费结构与趋势',
  p_sf_bill:'跟踪周期缴费并提前提醒',
  p_sf_idea:'扩展为会员与订阅管理',
  p_cal:'管理日程与长期计划',
  p_cal_p1:'查看与安排日程',
  p_cal_p2:'拆解长期计划并跟踪执行',
  p_cal_p2_gantt:'用甘特图管理依赖与基线',
  p_cal_p2_cap:'按可用时间重排计划',
  p_cal_p2_exam:'在计划中显示题库达标进度',
  p_cal_holiday:'设置休假与生日',
  p_exam:'备考刷题与模拟考试',
  p_exam_bank:'录入、分类并导入试题',
  p_exam_mock:'限时模拟正式考试并判分',
  p_exam_master:'跟踪错题直到真正掌握',
  p_exam_img:'登记题目图片的存放位置',
  p_exam_idea:'扩展为云认证交互实验室',
  p_health:'记录身体状况与变化',
  p_health_sym:'快速登记多处不适',
  p_health_body:'记录体重与腰围并看趋势',
  p_lang:'练习日语情景对话',
  p_lang_bank:'提供分类的情景对话题目',
  p_lang_mode:'用拼词或自由回答应对对话',
  p_lang_char:'用角色动画演示对话情景',
  p_lang_plan:'向计划中心提供练习结果',
  p_lang_ai:'点评回答并给出日语例句',
  p_lang_idea:'参考多智能体课堂改进练习',
  p_wc:'制作网页中的 2D 角色动画',
  p_wc_rig:'为角色绑骨并驱动动作',
  p_wc_apple:'演示双角色递苹果',
  p_wc_magic:'演示拾书骑扫帚飞走',
  p_mynet:'以星图组织并管理个人内容',
  p_mynet_map:'以焦点和距离探索内容关系',
  p_mynet_mgr:'用表格查找并编辑内容',
  p_mynet_data:'让星图与管理台共用同一份数据',
  p_mynet_idea:'实现数字花园、知识图谱与运维中心',
  // 2026-11-02 文档核对补充
  s_web_js_conflict:'避免旧编辑覆盖新版内容',
  s_data_pipe_contract:'按身份与时间契约消费行情',
  s_eng_test_data:'校验内容结构并拦截敏感信息',
  s_inv_macro_window:'按独立窗口维护长期指标',
  i_pool:'统一管理语言练习的模型接口',
  i_pool_candidates:'核验模型供应商的使用条件',
  i_pool_candidates_first:'登记首批模型候选',
  i_pool_candidates_next:'登记扩展模型候选',
  i_pool_adapter:'统一不同模型的输入输出',
  i_pool_adapter_round:'合并一轮对话与教学反馈',
  i_pool_route:'按质量与可用配额选择模型',
  i_pool_route_retry:'限制失败重试并切换模型',
  i_pool_route_free:'在免费资源不可用时停止调用',
  i_pool_privacy:'减少调用日志中的私人内容',
  i_distributed:'规划跨平台的功能协作',
  i_distributed_contract:'约定模块间的数据交换规则',
  i_distributed_owner:'明确各类数据的权威写入端',
  i_distributed_candidates:'分类登记待考察的平台能力',
  i_distributed_cost:'核对免费条件和超额行为',
  i_crawl:'协调多个节点执行采集任务',
  i_crawl_dispatch:'匹配采集任务与执行节点',
  i_crawl_ingest:'校验采集结果并统一入库',
  i_crawl_ingest_trace:'追踪采集来源并避免重复处理',
  i_crawl_storage:'分开保存原始材料与标准化结果',
  i_crawl_rollout:'按验证结果逐步扩展采集节点',
  i_cloud:'集中登记云资源与运行状态',
  i_cloud_ledger:'登记资源用途及使用条件',
  i_cloud_ledger_measure:'区分官方用量与本地估算',
  i_cloud_ledger_cost:'提示资源使用的费用边界',
  i_cloud_monitor:'用独立节点监测资源状态',
  i_cloud_monitor_lease:'控制监控接管并补传结果',
  i_cloud_monitor_state:'区分监控失联与资源故障',
  i_cloud_readonly:'从已采集快照展示资源状态',
  i_cloud_alert:'提醒资源到期及连续异常',
  cf_worker_assets_scope:'按白名单分发浏览器资源',
  cf_kv_drafts:'暂存并恢复未正式保存的日记',
  cf_kv_prefs:'保存图表等界面偏好',
  gh_mirror_scope:'限定公共镜像的发布字段',
  gh_mirror_time:'保留行情时间与可信度边界',
  mk_multpl:'提供标普月均历史资料',
  mk_ecb:'提供日经月均历史资料',
  p_myapp_home:'汇总待办与近期提醒',
  p_myapp_nav:'统一各模块的页面入口',
  p_myapp_diary_draft:'暂存并恢复未完成的日记',
  p_myapp_diary_version:'阻止旧版本覆盖新日记',
  p_myapp_study:'接入考证页面与业务接口',
  p_rem_cycle:'按循环规则与状态组织提醒',
  p_rem_guard:'避免无效改期和旧记录覆盖',
  p_sc_fin:'归档季度财报与原始附件',
  p_sc_fin_import:'去重财报并保留修订历史',
  p_sc_fin_parse:'区分附件获取与指标解析',
  p_sc_compare:'对比逐股情景值与报价',
  p_cs_quote_time:'区分采集成功与收盘确认',
  p_bc_buffett_cycle:'按维护周期提醒更新巴菲特指标',
  p_bc_sp_window:'维护标普近期窗口与固定历史',
  p_bc_sp_cycle:'按维护周期提醒更新标普指标',
  p_bc_nk_cycle:'按维护周期提醒更新日经指标',
  p_bc_nk_scope:'保留日经来源的使用边界',
  p_bc_export:'导出指标图表与数据快照',
  p_exam_import:'预览题库差异并分批导入',
  p_exam_session:'保护考试会话与作答保存',
  p_exam_session_queue:'暂存作答并可靠重试保存',
  p_exam_review:'统计学习表现并回顾考试',
  p_exam_ai:'导出分析资料并接收外部报告',
  p_exam_backup:'备份学习数据并恢复到新库',
  p_lang_mode_hand:'通过完整手打提交最终答案',
  p_lang_offline:'在无外部模型时练习情景对话',
  p_lang_resume:'恢复中断练习并交换本地记录',
  p_mynet_map_distance:'按焦点距离逐步探索关系',
  p_mynet_map_layers:'在总览与焦点之间连续导航',
  p_mynet_mgr_promote:'升格内容并防止隶属成环',
  p_mynet_data_validate:'校验初始数据并生成交接清单',
  p_mynet_data_local:'保留浏览器中的已有编辑',
};

/* 20261103-knowledge-refresh: additive project evidence, original entries retained. */
const REFRESH_20261103={
  "skill": {
    "elements": [
      {
        "id": "s_cf_db_backup",
        "name": "数据库备份与恢复验证",
        "parent": "s_cf_db",
        "state": "node",
        "fn": "备份数据库并验证远端可恢复",
        "desc": "项目实践积累（2026-11-03）：SQLite Backup API、生产逻辑导出、独立快照分支及全新克隆恢复检查；不据此推断个人熟练等级。"
      },
      {
        "id": "s_cf_db_backup_crypto",
        "name": "加密快照与密钥分离",
        "parent": "s_cf_db_backup",
        "state": "attr",
        "fn": "加密备份并独立保管恢复密钥",
        "desc": "项目采用 AES-256-GCM、摘要回读和密钥外置；星图只记录方法，不保存凭据或业务备份内容。"
      },
      {
        "id": "s_cf_db_atomic",
        "name": "事务与幂等写入",
        "parent": "s_cf_db",
        "state": "node",
        "fn": "用事务和请求身份保护重复写入",
        "desc": "MyNet D1 适配实践：条件版本写入、请求重放、原子批次和冲突检测；与原有浏览器版本冲突场景互补。"
      },
      {
        "id": "s_web_api_adapter",
        "name": "多供应商接口适配",
        "parent": "s_web",
        "state": "node",
        "fn": "统一模型接口与安全错误分类",
        "desc": "语言项目已有多供应商适配和固定模型探测代码；实现存在不等于每个账户已连通、免费额度持续有效或已掌握所有供应商。"
      },
      {
        "id": "s_web_api_adapter_boundary",
        "name": "调用与费用边界",
        "parent": "s_web_api_adapter",
        "state": "attr",
        "fn": "限制请求并阻止隐式费用扩张",
        "desc": "近期实践包含超时、响应长度约束、禁止重定向、不自动重试或付费回退，以及不输出上游原始错误。"
      },
      {
        "id": "s_eng_test_fault",
        "name": "故障注入与恢复测试",
        "parent": "s_eng_test",
        "state": "node",
        "fn": "验证失败重试和事务回滚行为",
        "desc": "项目验证覆盖响应丢失、重复提交、旧读取晚到、版本冲突和批次失败回滚；本地合成验证与线上效果分别记录。"
      },
      {
        "id": "s_eng_source_sync",
        "name": "子项目来源追踪",
        "parent": "s_eng",
        "state": "node",
        "fn": "按来源提交和摘要集成功能",
        "desc": "实践约束：业务先在子项目开发检测，主项目负责接线；以来源提交、文件摘要及差异记录防止遗漏或覆盖其他工作。"
      },
      {
        "id": "s_eng_rel_access",
        "name": "Access 项目验收边界",
        "parent": "s_eng_rel",
        "state": "attr",
        "fn": "由用户确认受控项目线上效果",
        "desc": "用户规则（2026-11-02）：不代理登录、不复用 Access 会话、不绕过控制；线上页面效果由用户自行操作并提供截图确认。"
      }
    ],
    "relations": [
      {
        "id": "skill_refresh_20261103_1",
        "from": "s_cf_db_backup_crypto",
        "type": "帮助",
        "to": "s_eng_rel"
      },
      {
        "id": "skill_refresh_20261103_2",
        "from": "s_eng_test_fault",
        "type": "促进",
        "to": "s_cf_db_atomic"
      },
      {
        "id": "skill_refresh_20261103_3",
        "from": "s_eng_source_sync",
        "type": "帮助",
        "to": "s_eng_rel"
      },
      {
        "id": "skill_refresh_20261103_4",
        "from": "s_web_api_adapter_boundary",
        "type": "诱发",
        "to": "s_eng_test_fault"
      }
    ]
  },
  "idea": {
    "elements": [
      {
        "id": "i_mynet_append",
        "name": "星图增量积累",
        "parent": "i_mynet",
        "state": "node",
        "fn": "在保留已有内容的基础上持续追加",
        "desc": "用户明确方向（2026-11-03）：根据新的知识、技能和项目积累刷新星图，尽量保持原有数据，只追加新内容；短期内不在线上编辑。"
      },
      {
        "id": "i_mynet_append_baseline",
        "name": "正式基线与本地追加",
        "parent": "i_mynet_append",
        "state": "attr",
        "fn": "以确认后的正式内容作为追加起点",
        "desc": "本次正式基线由用户确认是初始内容；生产尚未保存时不把空数据库误当作空星图。后续本地修改与发布分开处理。"
      },
      {
        "id": "i_graph_evidence",
        "name": "能力证据与状态分层",
        "parent": "i_graph",
        "state": "node",
        "fn": "为能力与积累保留事实依据",
        "desc": "待设计：区分用户自述、项目代码实践、本地测试、已部署和用户效果确认，避免把代理完成的实现直接当作个人熟练度。"
      },
      {
        "id": "i_pool_probe_first",
        "name": "探测后再编排",
        "parent": "i_pool",
        "state": "attr",
        "fn": "先验证单模型再设计资源池调度",
        "desc": "候选推进方式：已有连通性探测与安全适配可作为前置证据；自动选路、跨供应商配额管理和故障切换仍不能视为已实现。"
      },
      {
        "id": "i_cloud_credential_location",
        "name": "凭证位置与用途分离",
        "parent": "i_cloud",
        "state": "attr",
        "fn": "登记凭证位置而不复制密钥正文",
        "desc": "由会员管理实践启发：资源台账记录用途、位置与有效期，密钥实物独立保管；星图只保留非敏感能力与联系。"
      }
    ],
    "relations": [
      {
        "id": "idea_refresh_20261103_1",
        "from": "i_mynet_append_baseline",
        "type": "启发",
        "to": "i_graph_evidence"
      },
      {
        "id": "idea_refresh_20261103_2",
        "from": "i_pool_probe_first",
        "type": "参考",
        "to": "i_pool_adapter"
      },
      {
        "id": "idea_refresh_20261103_3",
        "from": "i_cloud_credential_location",
        "type": "启发",
        "to": "i_sub"
      }
    ]
  },
  "res": {
    "elements": [
      {
        "id": "cf_worker_subscriptions",
        "name": "会员独立 API Worker",
        "parent": "cf",
        "state": "node",
        "fn": "为会员资源管理提供独立接口",
        "desc": "项目已有独立 REST API Worker 与共享 D1 接线；此处登记资源职责，不断言当前启用配置或线上可用性。"
      },
      {
        "id": "cf_ai",
        "name": "Workers AI 模型接口",
        "parent": "cf",
        "state": "node",
        "fn": "提供 Cloudflare 托管模型调用入口",
        "desc": "语言项目已有固定模型探测适配；具体型号、计费和账户可用性须另行核验，不在星图写死免费承诺。"
      },
      {
        "id": "gg_gemini",
        "name": "Gemini 模型接口",
        "parent": "gg",
        "state": "node",
        "fn": "提供语言模型探测候选入口",
        "desc": "项目已有 Gemini 适配及不可用型号错误处理；模型更换与真实连通验证分别记录，不推定持续免费。"
      },
      {
        "id": "gh_backup",
        "name": "加密数据库快照分支",
        "parent": "gh",
        "state": "node",
        "fn": "保存加密快照及恢复证据",
        "desc": "既有项目流程使用专用备份分支保存加密快照，并从远端全新克隆验证恢复；不存明文业务资料。"
      },
      {
        "id": "gg_drive_key_custody",
        "name": "备份密钥独立保管",
        "parent": "gg_drive",
        "state": "attr",
        "fn": "独立保存用于解密备份的密钥",
        "desc": "既有流程将主密钥实物保存在专用云盘位置；此处不记录密钥正文、位置链接或账户信息。"
      },
      {
        "id": "groq",
        "name": "Groq",
        "parent": null,
        "state": "node",
        "fn": "提供项目已接入的模型接口",
        "desc": "用户在近期项目反馈中确认过测试成功；这不代表全部模型、账户额度或后续稳定性均已验证。"
      },
      {
        "id": "deepseek",
        "name": "DeepSeek",
        "parent": null,
        "state": "node",
        "fn": "提供项目已接入的模型接口",
        "desc": "用户在近期项目反馈中确认过测试成功；保留已有调用边界，不据此承诺持续免费。"
      },
      {
        "id": "plamo",
        "name": "PLaMo",
        "parent": null,
        "state": "node",
        "fn": "提供语言项目的模型适配入口",
        "desc": "近期代码已登记固定模型探测适配；账户配额、实际启用与连通状态需分别验证。"
      },
      {
        "id": "bigmodel",
        "name": "BigModel",
        "parent": null,
        "state": "node",
        "fn": "提供语言项目的模型适配入口",
        "desc": "项目按独立供应商登记适配，不与 Z.ai 的账户、额度或错误状态混为一谈。"
      },
      {
        "id": "zai",
        "name": "Z.ai",
        "parent": null,
        "state": "node",
        "fn": "提供模型探测及限流诊断入口",
        "desc": "近期实现包含供应商专属错误码白名单分类；不把通用 HTTP 429 直接判定为账户根因。"
      },
      {
        "id": "siliconflow",
        "name": "SiliconFlow",
        "parent": null,
        "state": "node",
        "fn": "提供语言项目的模型适配入口",
        "desc": "已有固定模型探测代码；适配存在不代表真实账户测试通过或永久免费。"
      },
      {
        "id": "sakura",
        "name": "Sakura AI Engine",
        "parent": null,
        "state": "node",
        "fn": "提供近期新增的模型适配入口",
        "desc": "2026-11-03 项目已增加单模型探测适配；真实连通、配置和效果以各自回执为准，不写入密钥或账户信息。"
      }
    ],
    "relations": [
      {
        "id": "res_refresh_20261103_1",
        "from": "cf_worker_subscriptions",
        "type": "依赖",
        "to": "cf_d1"
      },
      {
        "id": "res_refresh_20261103_2",
        "from": "cf_access",
        "type": "保护",
        "to": "cf_worker_subscriptions"
      },
      {
        "id": "res_refresh_20261103_3",
        "from": "gh_backup",
        "type": "依赖",
        "to": "gg_drive"
      }
    ]
  },
  "proj": {
    "elements": [
      {
        "id": "p_info",
        "name": "定远会员资源管理",
        "parent": null,
        "state": "node",
        "fn": "管理会员订阅和资源账户资料",
        "desc": "informationManage 项目已具备会员、手机号及凭证位置管理页面与独立 API；登记实现职责，不依据旧文档推定当前生产开关。相关创意：个人会员与订阅管理中心。"
      },
      {
        "id": "p_info_ledger",
        "name": "会员与资源台账",
        "parent": "p_info",
        "state": "node",
        "fn": "查询和维护分类资源资料",
        "desc": "实现包含搜索、筛选、新增和编辑；个人初始资料和凭据正文不进入星图。"
      },
      {
        "id": "p_info_api",
        "name": "独立 REST API",
        "parent": "p_info",
        "state": "node",
        "fn": "提供受控的资料读写接口",
        "desc": "采用独立接口职责及共享 D1；禁止删除、保留审计及幂等身份；跨域配置是否生效不由本条断言。"
      },
      {
        "id": "p_info_api_replay",
        "name": "请求重放与内容冲突",
        "parent": "p_info_api",
        "state": "attr",
        "fn": "区分同内容重试和冲突提交",
        "desc": "近期修复对相同显式标识的同内容请求返回已有结果，不同内容返回冲突；避免响应丢失后重复新增。"
      },
      {
        "id": "p_info_secret_position",
        "name": "凭据位置登记",
        "parent": "p_info_ledger",
        "state": "attr",
        "fn": "记录凭据位置和用途而不存正文",
        "desc": "记录范围为位置、周期等管理元数据；不将密钥、账户值或个人台账复制进星图。"
      },
      {
        "id": "p_cal_matrix",
        "name": "艾森豪威尔矩阵",
        "parent": "p_cal_p1",
        "state": "node",
        "fn": "按重要度与紧急度组织事项",
        "desc": "近期已统一视图名称及五级配色；提醒默认映射为高 4、中 2、低 1，原始等级不回写，既有手动覆盖优先。"
      },
      {
        "id": "p_cal_special_projection",
        "name": "特殊日期投影",
        "parent": "p_cal_p1",
        "state": "node",
        "fn": "在日历和首页显示特殊日期",
        "desc": "已有特殊日期设置的配套实现：日历标记、首页只读提示、局部失败降级与跨页更新通知；不复制生日或假期个人内容。"
      },
      {
        "id": "p_cal_special_yearly",
        "name": "年度资料修订更新",
        "parent": "p_cal_special_projection",
        "state": "attr",
        "fn": "按修订维护年度官方日期资料",
        "desc": "项目实现按年度和修订号更新资料，并保护较新版本；实际定时运行与具体年份资料完整性仍需独立验证。"
      },
      {
        "id": "p_lang_probe",
        "name": "模型连通性探测",
        "parent": "p_lang",
        "state": "node",
        "fn": "用受限单次请求检查模型接入",
        "desc": "近期加入多供应商固定模型探测入口，与正式教师点评和自动模型资源池是不同阶段；不自动重试或故障切换。"
      },
      {
        "id": "p_lang_probe_errors",
        "name": "安全错误与限流分类",
        "parent": "p_lang_probe",
        "state": "attr",
        "fn": "用安全错误说明探测失败原因",
        "desc": "实现包括型号不可用、配额与限流等安全分类；不显示上游原始响应、密钥或思考内容。"
      },
      {
        "id": "p_lang_probe_sakura",
        "name": "Sakura 适配增量",
        "parent": "p_lang_probe",
        "state": "attr",
        "fn": "增加固定模型的单次探测适配",
        "desc": "2026-11-03 已有实现和集成来源回执；不将代码存在视为真实调用验证完成。"
      },
      {
        "id": "p_mynet_data_store",
        "name": "SQLite 与 D1 持久化",
        "parent": "p_mynet_data",
        "state": "node",
        "fn": "分别保存本地和生产星图内容",
        "desc": "本地 SQLite 与生产 D1 共用领域校验；保存采用版本检查、请求幂等和历史快照。生产未保存时返回内置初始数据。"
      },
      {
        "id": "p_mynet_data_store_baseline",
        "name": "初始内容作为追加基线",
        "parent": "p_mynet_data_store",
        "state": "attr",
        "fn": "以确认过的正式初始数据继续追加",
        "desc": "用户于 2026-11-03 确认生产内容即初始数据，短期不在线上编辑；追加前本地内容与集成初始内容完全一致，旧库已保留。"
      },
      {
        "id": "p_mynet_host",
        "name": "主站独立页头接线",
        "parent": "p_mynet",
        "state": "node",
        "fn": "接入工作台并保留返回首页入口",
        "desc": "MyNet 按用户要求保留自身页头与星图交互，通过返回首页按钮回到工作台；不强制套用主站统一菜单。"
      },
      {
        "id": "p_myapp_int_provenance",
        "name": "来源摘要与隔离合并",
        "parent": "p_myapp_int",
        "state": "attr",
        "fn": "核对来源并保留其他未完成工作",
        "desc": "近期集成按来源提交和文件摘要同步，避免把其他项目尚未完成的变更混入本次发布。"
      },
      {
        "id": "p_myapp_int_restore",
        "name": "生产快照恢复门禁",
        "parent": "p_myapp_int",
        "state": "attr",
        "fn": "在数据库调整前验证备份可恢复",
        "desc": "既有流程要求加密快照单独提交推送并全新克隆恢复验证；本地测试、Git 同步和生产发布分别留痕。"
      }
    ],
    "relations": [
      {
        "id": "proj_refresh_20261103_1",
        "from": "p_myapp",
        "type": "集成",
        "to": "p_info"
      },
      {
        "id": "proj_refresh_20261103_2",
        "from": "p_myapp",
        "type": "集成",
        "to": "p_mynet_host"
      },
      {
        "id": "proj_refresh_20261103_3",
        "from": "p_info_ledger",
        "type": "使用",
        "to": "p_info_api"
      },
      {
        "id": "proj_refresh_20261103_4",
        "from": "p_info_secret_position",
        "type": "参考",
        "to": "p_lang_probe"
      },
      {
        "id": "proj_refresh_20261103_5",
        "from": "p_mynet_data_store",
        "type": "参考",
        "to": "p_myapp_int"
      }
    ]
  }
};
for(const [key,entry] of Object.entries(REFRESH_20261103)){
  DOMAINS[key].elements.push(...entry.elements.map(({fn,...element})=>{FN[element.id]=fn;return element}));
  DOMAINS[key].relations.push(...entry.relations);
}

/* 20261103-api-resources: additive project evidence, original entries retained. */
const REFRESH_20261103_api_resources={
  "skill": {
    "elements": [],
    "relations": []
  },
  "idea": {
    "elements": [],
    "relations": []
  },
  "res": {
    "elements": [
      {
        "id": "mk_irbank",
        "name": "IRBANK Connect",
        "parent": "mk",
        "state": "node",
        "fn": "提供日本上市公司数据接口",
        "desc": "现有凭证台账登记的服务，用于日本上市公司估值研究；本轮未实际调用或确认额度。"
      },
      {
        "id": "mk_tgm",
        "name": "TGMCharts Developer API",
        "parent": "mk",
        "state": "node",
        "fn": "提供美股研究的数据与图表接口",
        "desc": "现有凭证台账登记的服务；本轮核对官方开发文档，不代表已接入现有采集链路。"
      },
      {
        "id": "mk_irbank_key",
        "name": "IRBANK API Key",
        "parent": "mk_irbank",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：provider_api_key。用途：日本上市公司 PE/PER 等估值分析。 台账状态：active（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "mk_irbank_key_website",
        "name": "官网与开发入口",
        "parent": "mk_irbank_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://app.irbank.net/"
      },
      {
        "id": "mk_irbank_key_custody",
        "name": "Google Drive 保管",
        "parent": "mk_irbank_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "mk_tgm_key",
        "name": "TGMCharts API Key",
        "parent": "mk_tgm",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：provider_api_key。用途：美股基础数据和历史估值研究。 台账状态：active（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "mk_tgm_key_website",
        "name": "官网与开发入口",
        "parent": "mk_tgm_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://tgmcharts.com/developers"
      },
      {
        "id": "mk_tgm_key_custody",
        "name": "Google Drive 保管",
        "parent": "mk_tgm_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "cf_access_service_credential",
        "name": "Access 服务凭证",
        "parent": "cf_access",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：cloudflare_access_service_token。用途：订阅管理 API 的服务间认证；此用途登记不代表允许代理登录或代验收受控页面。 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "cf_access_service_credential_website",
        "name": "官网与开发入口",
        "parent": "cf_access_service_credential",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/"
      },
      {
        "id": "cf_access_service_credential_custody",
        "name": "Google Drive 保管",
        "parent": "cf_access_service_credential",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "gh_key_mirror",
        "name": "镜像自动化凭证",
        "parent": "gh",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：github_token。用途：供 PublicMarketMirrorWriter 相关自动化使用；仓库权限范围待核实。 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "gh_key_mirror_website",
        "name": "官网与开发入口",
        "parent": "gh_key_mirror",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://github.com/settings/tokens"
      },
      {
        "id": "gh_key_mirror_custody",
        "name": "Google Drive 保管",
        "parent": "gh_key_mirror",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "gh_key_peband",
        "name": "PE Band 读取凭证",
        "parent": "gh",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：github_token。用途：读取 Cloudflare PE Band 相关仓库；目标仓库和权限范围待核实。 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "gh_key_peband_website",
        "name": "官网与开发入口",
        "parent": "gh_key_peband",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://github.com/settings/tokens"
      },
      {
        "id": "gh_key_peband_custody",
        "name": "Google Drive 保管",
        "parent": "gh_key_peband",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "plamo_key",
        "name": "PLaMo API Key",
        "parent": "plamo",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：API Key。用途：语言学习AI单次连通检查 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "plamo_key_website",
        "name": "官网与开发入口",
        "parent": "plamo_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://plamo.preferredai.jp/"
      },
      {
        "id": "plamo_key_custody",
        "name": "Google Drive 保管",
        "parent": "plamo_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "bigmodel_key",
        "name": "BigModel API Key",
        "parent": "bigmodel",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：API Key。用途：语言学习AI单次连通检查 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "bigmodel_key_website",
        "name": "官网与开发入口",
        "parent": "bigmodel_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://docs.bigmodel.cn/"
      },
      {
        "id": "bigmodel_key_custody",
        "name": "Google Drive 保管",
        "parent": "bigmodel_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "zai_key",
        "name": "Z.ai API Key",
        "parent": "zai",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：API Key。用途：语言学习AI单次连通检查 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "zai_key_website",
        "name": "官网与开发入口",
        "parent": "zai_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://docs.z.ai/guides/overview/quick-start"
      },
      {
        "id": "zai_key_custody",
        "name": "Google Drive 保管",
        "parent": "zai_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "siliconflow_key",
        "name": "SiliconFlow API Key",
        "parent": "siliconflow",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：API Key。用途：语言学习AI单次连通检查 台账状态：unknown（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "siliconflow_key_website",
        "name": "官网与开发入口",
        "parent": "siliconflow_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://www.siliconflow.cn/"
      },
      {
        "id": "siliconflow_key_custody",
        "name": "Google Drive 保管",
        "parent": "siliconflow_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "sakura_key",
        "name": "Sakura 账户令牌",
        "parent": "sakura",
        "state": "node",
        "fn": "登记凭证类型、用途与保管方式",
        "desc": "凭证元数据，非密钥正文。类型：Bearer Token。用途：AI连通测试；固定模型gpt-oss-120b 台账状态：active（仅原台账标记，本轮未验证有效性、权限或到期日）。"
      },
      {
        "id": "sakura_key_website",
        "name": "官网与开发入口",
        "parent": "sakura_key",
        "state": "attr",
        "fn": "定位凭证所属服务的公开网站",
        "desc": "公开入口：https://ai.sakura.ad.jp/sakura-ai/ai-engine/"
      },
      {
        "id": "sakura_key_custody",
        "name": "Google Drive 保管",
        "parent": "sakura_key",
        "state": "attr",
        "fn": "查找凭证的保管平台与资料台账",
        "desc": "凭证实物保存在 Google Drive，具体位置在定远会员资源管理的凭证台账查找；星图不保存私人分享链接、文件标识或密钥正文。"
      },
      {
        "id": "groq_website",
        "name": "Groq 官方开发文档",
        "parent": "groq",
        "state": "attr",
        "fn": "查阅模型服务的官方接入资料",
        "desc": "公开入口：https://console.groq.com/docs/quickstart"
      },
      {
        "id": "deepseek_website",
        "name": "DeepSeek 官方开发文档",
        "parent": "deepseek",
        "state": "attr",
        "fn": "查阅模型服务的官方接入资料",
        "desc": "公开入口：https://api-docs.deepseek.com/"
      },
      {
        "id": "gg_gemini_website",
        "name": "Gemini 官方开发文档",
        "parent": "gg_gemini",
        "state": "attr",
        "fn": "查阅模型服务的官方接入资料",
        "desc": "公开入口：https://ai.google.dev/gemini-api/docs"
      },
      {
        "id": "cf_ai_website",
        "name": "Workers AI 官方文档",
        "parent": "cf_ai",
        "state": "attr",
        "fn": "查阅模型服务的官方接入资料",
        "desc": "公开入口：https://developers.cloudflare.com/workers-ai/"
      }
    ],
    "relations": [
      {
        "id": "res_api_20261103_0",
        "from": "mk_irbank_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_1",
        "from": "mk_tgm_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_2",
        "from": "cf_access_service_credential_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_3",
        "from": "gh_key_mirror_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_4",
        "from": "gh_key_peband_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_5",
        "from": "plamo_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_6",
        "from": "bigmodel_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_7",
        "from": "zai_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_8",
        "from": "siliconflow_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      },
      {
        "id": "res_api_20261103_9",
        "from": "sakura_key_custody",
        "type": "依赖",
        "to": "gg_drive"
      }
    ]
  },
  "proj": {
    "elements": [],
    "relations": []
  }
};
for(const [key,entry] of Object.entries(REFRESH_20261103_api_resources)){
  DOMAINS[key].elements.push(...entry.elements.map(({fn,...element})=>{FN[element.id]=fn;return element}));
  DOMAINS[key].relations.push(...entry.relations);
}

/* 浏览器本地存储：v2 起为真实初始数据，v3 补充 cloudflaremyapp 创意清单；旧版本键不再读取（也不删除） */
const KEY='mynet.data.v3';
const clone=o=>JSON.parse(JSON.stringify(o));
// 关系补上稳定 id；要素补上功能简述（已保存的数据缺少该字段时，用初始简述补齐，不覆盖已有内容）
function withIds(d){for(const k in d){
  d[k].relations.forEach((r,i)=>{if(!r.id)r.id=k+'_r'+i});
  d[k].elements.forEach(e=>{if(typeof e.fn!=='string')e.fn=FN[e.id]||''});
}return d}
window.MyNet={
  KEY,
  defaults:()=>withIds(clone(DOMAINS)),
  load(){
    try{const s=localStorage.getItem(KEY);if(s){const d=JSON.parse(s);if(d&&Object.keys(DOMAINS).every(k=>d[k]&&Array.isArray(d[k].elements)))return withIds(d)}}catch(e){}
    return this.defaults();
  },
  save(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}},
  reset(){try{localStorage.removeItem(KEY)}catch(e){}return this.defaults()},
  uid:(p='e')=>p+Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,6),
  // 星系配色：项目星域根节点较多，提供 12 种可区分的颜色
  PALETTE:['#5cf2ff','#ffb547','#b98cff','#6dff9c','#ff6b9d','#7aa2ff','#ffe066','#ff8f5c','#4fe0c0','#e08cff','#a8d86b','#ff7aa8']
};
})();
