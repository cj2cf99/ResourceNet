# 2026-11-03 知识与项目积累追加

目标仅为当前 MyNet 本地 SQLite；生产 D1、主项目集成、配置和部署均无改动。
来源基线为用户确认的正式初始内容（ResourceNet eb80726）。

`additions.json` 是唯一新增内容清单，源码 `data.js` 中嵌入同一内容以供浏览器使用。
保留原有全部要素与关系、字段、顺序、星域配置和存储键。没有要素升格或删除。
`tools/refresh-knowledge.mjs prepare` 验证原始基线、用 SQLite Backup API 保存旧库，
生成完整参数，并以既有生产备份主密钥加密旧库、追加前后参数与已取得的生产星图导出。
明文只在被忽略的 `.local` 内；密钥不提交。

先将加密附件、清单和 SQL 单独提交推送至 ResourceNet 的
`refs/heads/db-snapshots/mynet-content`，再全新克隆，用
`tools/verify-content-backup.mjs <新克隆中快照目录> <远端完整提交>` 验证。
主密钥实物沿用已登记的 Google Drive 保管位置。

只有远端恢复通过后才运行 `node tools/refresh-knowledge.mjs apply`。
执行器在 BEGIN IMMEDIATE 中复核旧 revision、内容与 SQL 摘要，用绑定参数执行
03-data.sql 新增一份本地快照；保留所有旧快照和请求记录，不做历史清理。
完整性、模型及原记录不变校验失败则回滚；备份后出现本地编辑则停止。

补偿不能删除后续编辑。需要恢复时先将旧库在隔离环境回读，再将其内容保存成新版本。
实际执行结果在 `.local/20261103-knowledge-refresh/result.json`，公开摘要在
`docs/KNOWLEDGE_REFRESH_20261103.md`。SQL 摘要、精确参数和快照摘要在加密备份包的清单。
