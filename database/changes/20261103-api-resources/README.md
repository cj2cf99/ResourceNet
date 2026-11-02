# API 凭证元数据与对应网站追加

用户要求将 API Key 及对应网站作为资源加入。只登记凭证元数据，未读取凭证实物，
不包含密钥正文、私人分享链接、账号标识、有效令牌或签名网址。

基线为上一轮本地 revision 2（303 要素、73 关系）。本轮只增加资源星域的
36 个要素和 10 条保管平台关联，所有已有字段、顺序与其他星域保持不变。
其中包含 10 个凭证节点、20 个官网/保管属性、2 个行情 API 服务节点和
4 个既有模型服务的官方文档属性。GitHub 两项凭证按用途分别登记。

只读提取 informationManage 既有台账的 service_name、credential_type、purpose、
storage_provider、status 白名单元数据。台账 status 只表示登记值，不代表本次测试有效。
公开网站经官方文档核对；URL 只允许进入资源 desc 的明确白名单，
禁止 query、hash、userinfo、私人云盘链接及未审核地址。

执行步骤与前一变更相同：

1. `node tools/refresh-knowledge.mjs prepare 20261103-api-resources`，保存 SQLite Backup API 旧库备份和加密参数。
2. 单独提交本目录 SQL、additions.json 与加密备份至用户已授权的 ResourceNet `db-snapshots/mynet-content`；密钥不上传。
3. 从远端全新克隆，运行 `tools/verify-content-backup.mjs <快照archive目录> <远端完整commit>`。
4. 验证通过后，`node tools/refresh-knowledge.mjs apply 20261103-api-resources`；事务内比对旧版本和摘要，新增本地快照，保留旧记录。

03-data.sql 的完整绑定参数为加密附件 after-domains.json.enc。失败停止；
恢复时先在隔离库检查旧快照，不能删除后续数据或覆盖生产。
无 DDL、生产 D1 写入、部署或主项目集成。完整说明见 docs/API_RESOURCE_REFRESH_20261103.md。
