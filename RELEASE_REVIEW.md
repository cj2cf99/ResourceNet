

## 2026-11-03 联合生产发布：MyNet内容及AI练习/配置
用户明确要求带MyNet数据、新增API管理记录及Secret，全局提交后部署；随后确认Key范围仅现有清单。目标myapp生产Worker与stockanalysis D1。
来源：MyNet eb807265fe1ecea8a2d21340d955dcc0c37b4885；LanguageStudy 0556dd9；主站 f30647b。使用git diff这些基线及未跟踪文件、integrations/mynet/20261103-refresh-receipt.json与语言回执审查。
MyNet新增77要素25关系，总339要素83关系；data.js与seed.json更新，两页只改data.js缓存版本，主站页头/样式/路由保留。原内容逐字段前缀比较通过；数据库计划CAS初始化/追加版本并保留快照与请求记录，生产初始状态须重新核实。来源两批database/changes为本地已应用历史，生产使用新独立变更包20261103-mynet-ai-release，不重跑旧SQL。
AI包含前述自由生成/合并调用/省流开关与两轮自审修正、固定免费优先级和Z.ai4.5；ZAI_API_KEY安全读取云盘更新。其余新增供应商Secret和会员记录先核对已部署回执与生产快照，存在则保留不重复写入。无DDL、无KV迁移、无新计费服务。
实际验证：MyNet npm test 8/8、check:data通过0提示、export:cloudflare完成；语言185/185；主站546/546和dry-run此前通过，合并后重新检测。真实AI调用0。
发布前：完成当前合并检查及全局相关Git提交；新生产备份专用分支单独推送并全新克隆恢复；提交最终SQL/加密参数并演练CAS、重复拒绝和失败回滚；先数据后配置/代码，--keep-vars部署；控制面核对版本与Secret名称。线上效果待用户截图，不代理登录。
风险：生产数据漂移则停止重规划，数据失败不部署；新数据与旧代码兼容。代码可回滚旧版本，数据需前向补偿、禁止旧快照覆盖全库；Secret不可读回，仅使用云盘确认版本。第三方审核未执行；用户本次明确部署指令已收到，范围以本节及后续实际回执为准。备份/生产写入/部署/Git同步在本节编写时尚未完成。

发布前核验：主站合并后 npm.cmd test 546/546、npm.cmd run check dry-run通过；db:sync-schema首次认证失败，Wrangler whoami刷新OAuth后重试通过，新增结构0。生产控制面确认8个AI API Secret均存在，本次无须重复新增Secret，仅更新ZAI_API_KEY。会员记录以新备份逐项核对，存在则不重复写入。用户已确认Key范围“就这些”。


### 2026-11-03 联合发布最终数据/配置核对
备份 db1ac51edad833c90ca625beda93760bcf52fe52 已单独push至db-snapshots/production并全新克隆恢复79/79表通过。MyNet生产revision 0，原始seed与追加前基线一致；17语句原子包准备为revision 1及一份快照，原历史和请求保留，新增77要素25关系。10条API管理记录全部已存在，包含PLaMo/BigModel/Z.ai/SiliconFlow/Sakura，本次无需重复灌入；逐字段守卫及后检保护。8个API Secret均存在，只更新ZAI_API_KEY。
离线真实备份演练：旧行保留、重复拒绝、故障回滚、FK通过；MyNet新增执行计划回归后9/9。脚本/SQL/参数/回执见database/changes/20261103-mynet-ai-release、scripts/apply-mynet-release.mjs、scripts/configure-zai-secret.mjs及integrations/mynet/production-plan.mjs。生产实际DML、Secret刷新和代码部署尚未执行，随后追加回执。用户本次部署授权覆盖此核实后的范围，无额外新增服务。
