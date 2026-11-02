# 星图知识与项目积累追加（2026-11-03）

已完成源码初始内容和本地 SQLite 刷新。本地 revision 1 → 2。
原有 262 个要素、58 条关系的全部字段、顺序和标识保持；星域配置和存储键不变。
只新增 41 个要素、15 条关系，无删除、改名、重挂父级或属性升格。

| 星域 | 新增要素 | 新增关系 | 当前根节点 | 当前要素 | 当前关系 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 技能 | 8 | 4 | 11 | 42 | 14 |
| 创意 | 5 | 3 | 19 | 94 | 18 |
| 资源 | 12 | 3 | 14 | 53 | 17 |
| 项目 | 16 | 5 | 13 | 114 | 24 |
| 合计 | 41 | 15 | 57 | 303 | 73 |

## 追加内容与依据

1. 技能：备份恢复验证、加密与密钥分离、事务及幂等写入、多供应商适配、费用边界、故障注入、子项目来源追踪、Access 验收边界。依据近期 MyNet、主站集成、语言项目和会员项目的实现与测试记录。这些是项目实践积累，不将代理完成的代码推定为用户个人熟练等级。
2. 创意：增量积累、正式基线与本地追加、能力证据分层、先探测再编排、凭证位置与用途分离。用户明确提出的方向标注来源；由实践产生的延伸保留“待设计”或“候选”状态，不宣称已有完整产品功能。
3. 资源：会员独立 API Worker、Workers AI、Gemini、加密快照分支及密钥保管方法，以及 Groq、DeepSeek、PLaMo、BigModel、Z.ai、SiliconFlow、Sakura 的接口资源。新增供应商作为平台根节点，不改变已有平台。只记录项目接入事实，不承诺永久免费、具体额度或全部账户连通。
4. 项目：定远会员资源管理及独立 API、重放与冲突保护；日历矩阵和特殊日期投影；模型探测和安全错误；MyNet 持久化、初始基线和独立页头；主站来源摘要与恢复门禁。既有假期设置、教师点评等条目保留，新条目记录实现的不同环节。

本轮只读核对的材料：

- 当前仓库 `cloudflare/routes.mjs`、`server.mjs`、`docs/DATA_GUIDE.md` 及既有清单。
- 主项目 `docs/design/FEATURE_READINESS_20261102.md`、`SECOND_SELF_REVIEW_20261102.md`、`language/AI_FOUR_PROVIDERS_20261102.md`，以及当前根发布记录和 Git 历史。
- 主项目 `integrations/mynet/source.json`、`integrations/calendar-presentation/source.json`、`integrations/language/sakura-20261103-receipt.json`。
- informationManage 的 README，以及 CalendarAndPlanner 的 `docs/review/PROJECT_FIXES_20261102.md`。这些包含历史候选状态，只用于证明实现职责；不据旧文档断言当前生产开关或部署结果。
- 用户关于初始数据、短期本地编辑、追加原则和 Access 受控项目验收的明确说明。

英语、C# 五年以上过往开发、钢琴和小提琴少量自学经历保持原样；没有新增未经提供的等级、框架或学习计划。未读取私人账户台账、生日值、财务及健康业务内容或密钥正文作为星图内容。

## 安全备份、SQL 与执行结果

执行材料：`database/changes/20261103-knowledge-refresh/`，包含 additions.json、前检、无结构变更说明、参数化 INSERT、后检及补偿说明。
原始内容相等及追加不变性已由执行器严格比较；本次仅向 snapshots 插入一条完整的新快照，保留旧快照及所有请求记录，不做历史清理。

用户明确批准将本地旧库、追加前后参数和生产星图三表导出的 AES-256-GCM 加密备份推送至 ResourceNet 的 `db-snapshots/mynet-content`；密钥不上传，沿用既有独立保管的生产主密钥。

- 首次备份提交：`59a21ad0fb21bfb2a00769449970132894f21e58`。
- 第一次远端新克隆发现 Git 换行转换影响 SQL 摘要，导入停止；补充精确字节保留规则后重新推送与全新克隆，未绕过摘要校验。
- 最终远端备份提交：`ed7f45d9170934f0fa1c08b94b4ff7d9f0ef8707`；分支 tip 已核对一致。
- 全新克隆恢复：四个密文附件解密和摘要全部一致；SQLite integrity/FK、原始基线、追加参数、生产导出恢复及 SQL 摘要检查全部通过。
- 随后执行本地事务：revision 2，模型及完整内容回读一致，旧库及 revision 1 保留。
- 当前数据摘要：`0b5a093ab21057b4e4aeab9c37fd858ff0029d01c4844b756dbebcb2f543de13`。
- 完整回执及明文工作文件仅保存在被忽略的 `.local/20261103-knowledge-refresh/`；不将其明文推送到 Git。

## 验证与范围

- `node tools/validate-data.mjs --list docs/data-inventory.md --json docs/data-snapshot.json`：通过，0 提示，清单和源码快照已更新。
- `npm.cmd test`：7/7 通过。首次在沙箱中因本机回环请求 EACCES 失败，允许本机测试连接后重跑全部通过。
- `node --check data.js`、`node --check tools/refresh-knowledge.mjs` 和 `git diff --check`：通过。
- 两页数据缓存版本统一为 `2026-11-03a`，存储键仍为 `mynet.data.v3`。没有改变页面交互逻辑。
- 隔离本地 Chrome、临时 SQLite 的六组页面检查通过：管理台和星图在 1440/768/375 均加载 303 个要素、73 条关系和新项目根节点，无横向溢出，返回首页入口存在，未捕获脚本异常。没有使用实际数据库进行页面写入，也不是线上效果确认。
- 生产 D1 写入、Cloudflare 部署、主项目集成：均无。源码 main 的本轮提交和推送尚未执行；已推送的是专用加密备份分支。
- 线上效果：待用户截图确认；不代理登录或复用 Access 会话进行验收。

本地页面刷新后加载 revision 2。若浏览器提示此前未保存的草稿，先保留草稿，再核对新增内容，避免旧草稿覆盖新基线。以后生产发布仍需独立审核、明确确认和相应数据库流程。
