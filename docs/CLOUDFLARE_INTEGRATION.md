# MyNet 接入 cloudflaremyapp

日期：2026-11-02。用户要求：合并主项目，MyNet 不使用统一页头菜单，须有返回首页按钮。来源先开发测试，再同步主项目；当前为本地集成候选，未发布。

## 页面与入口

主站入口 `/mynet/` 展示原 Canvas 星图，`/mynet/manage.html` 展示管理台，两页保留 MyNet 独立页头、星域切换及页内导航，不经过主站 shell。两页的“← 首页”原生链接指向 `/`。主站首页与自身导航可提供 MyNet 入口，不表示给 MyNet 注入主站导航。

源页增加手机断点布局，验证 1440/768/375 无页面级横向溢出，品牌与页内导航不重叠。星图增加显式平移模式、放大/缩小按钮和 touch-action，触屏无需右键或滚轮也能调整相机。原有焦点距离与业务规则保持。

## 分层与导出

`cloudflare/routes.mjs` 是本项目维护的 D1/页面路由业务适配；复用 `lib/model.mjs`，本项目的 Node SQLite 服务仍可独立运行。`npm run export:cloudflare` 生成被忽略的 `.integration/mynet`：4 个白名单静态资源、业务处理器、共享校验器、默认种子、CSP 与来源摘要。导出器只对 HTML 的存储脚本注入 `/api/mynet` 基址，不改页面视觉。

主项目仅接线：将来源 feature 包同步到 `src/features/mynet`，资源放 `public/mynet`，用 host.js 接入既有 Access JWT 与允许身份校验；router、首页卡片与主站导航增加入口。MyNet 路由在统一 shell 之前返回原始资源。所有 MyNet HTML、JS、API 都要求验证身份，来源子项目不实现绕过鉴权的生产分支。

## D1 设计

复用主站既有 `mymaindb`，新增独立前缀的 `mynet_state/mynet_snapshots/mynet_requests`，不复用其他业务表，不新增绑定、KV、R2 或定时任务。正式迁移文件由主项目分配编号，源 SQL 为 cloudflare/schema.sql。

state 单行保存当前快照和版本，snapshots 保存最近 200 份历史，requests 保存幂等请求。迁移只创建新表并插入 revision=0、data=NULL 的初始化状态，不把整个本地 SQLite 数据库拷贝到生产。

未首次保存时，GET 返回虚拟默认种子与 revision 0，不在读请求中写入种子。首次页面保存写 revision 1。此处默认种子与来源 data.js 一致，不自动导入桌面 SQLite 或旧浏览器中的私人编辑。需要迁移这类编辑时应单独导出、比对并经过数据写入门禁。

PUT `/api/mynet/state` 要求已验证 Access、请求 URL 与配置 PUBLIC_ORIGIN 一致，且必须有完全相同 Origin；缺少 Origin 的写请求也被拒绝。请求需 JSON、正好允许字段、有效模型及必需 requestId。上限为 1,000,000 字节，低于 D1 当前 2,000,000 字节字符串/行上限；初始数据能容纳，未来更大内容会明确拒绝，不静默截断。

通过一次 `D1.batch` 原子提交：条件插入请求记录作为 CAS 门禁；按原版本与该请求更新 state；保存历史；清理保留窗口；读取请求结果。旧版本不同请求不能修改 state；相同请求/摘要可重放；同 ID 不同内容拒绝；其中任何 SQL 失败则整组回滚。接口保留 state/revision/export，前端保存队列、失败草稿、超时与幂等机制沿用修复版。

官方设计依据：[D1 batch 事务](https://developers.cloudflare.com/d1/worker-api/d1-database/)、[预处理参数](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)、[D1 限制](https://developers.cloudflare.com/d1/platform/limits/)，本轮已检索。原子性还以临时 SQLite 的 D1 接口夹具测试，不将本地演练称为已验证生产 D1。

## 检测与发布门禁

来源 `npm test` 共 7 项通过，包括 D1 CAS、重复 ID、并发冲突、注入失败回滚、身份门禁、同源与请求上限；`npm run test:browser` 包含原审核回归及新增三种宽度、首页链接和触屏控件检查，全部通过。

生产备份命令曾被自动审批拒绝：备份会只读导出生产敏感业务内容，再加密提交并推送 origin 的 db-snapshots/production 分支；审批认为尚无该具体 payload/目的地明确授权。未重试绕过，未获取生产业务数据、未执行迁移或部署。后续先取得明确备份许可、完成可恢复验证，再申请本次迁移及部署确认。代码准备不代表数据库已合并。

主项目需保留 SQL 变更包、总账、根目录 RELEASE_REVIEW 和历史发布记录。发布顺序为备份验证、数据库前检、迁移及后检、代码部署、登录与保存验证。数据迁移失败时不得发布依赖该结构的代码。回滚优先停止新入口/回退代码，保留新表数据；不得直接删表或用全库恢复覆盖其他模块后续写入。
