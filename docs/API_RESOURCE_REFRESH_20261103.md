# API 凭证与网站资源追加（2026-11-03）

用户要求：“把apikey及其对应网站信息也作为资源加入”。本轮只记录凭证元数据，未读取密钥实物；不写入密钥正文、账户 ID、私人分享链接、文件 ID 或签名网址。

## 资源结构

在所属平台下新增凭证节点，每个节点包含官网/开发入口和 Google Drive 保管属性。用途与凭证类型在节点说明中记录；保管属性以参照关系指向既有 Google Drive 服务。

| 平台 | 凭证条目 | 公开入口依据 |
| --- | --- | --- |
| IRBANK Connect | 日本上市公司研究 API Key | [官方快速开始](https://docs.irbank.net/getting-started/quickstart) 指向 IRBANK Connect |
| TGMCharts | Developer API Key | [官方开发文档](https://tgmcharts.com/developers/docs/authentication-and-limits) |
| Cloudflare Access | 服务认证凭证 | [官方 Service tokens 文档](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) |
| GitHub | 镜像自动化、PE Band 读取，两项分别保留 | [官方令牌管理说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) |
| PLaMo | 模型探测 API Key | [官方 API 文档](https://docs.plamo.preferredai.jp/en/api) |
| BigModel | 模型探测 API Key | 官方 docs.bigmodel.cn 域名沿用既有服务台账；未推断账户状态 |
| Z.ai | 模型探测 API Key | [官方快速开始](https://docs.z.ai/guides/overview/quick-start) |
| SiliconFlow | 模型探测 API Key | [官方快速上手](https://docs.siliconflow.cn/docs/userguide/quickstart) |
| Sakura AI Engine | 账户 Bearer Token | [官方服务介绍](https://ai.sakura.ad.jp/sakura-ai/ai-engine/) 及利用手顺 |

另给既有 Groq、DeepSeek、Gemini、Workers AI 资源补充公开官方文档入口。没有凭证台账佐证时，不凭项目支持某供应商就新增或假定存在对应 Key。

只读使用 informationManage 初始资料中 API 凭证集合的 service_name、credential_type、purpose、storage_provider、status 白名单字段；没有输出或复制手机号、会员金额、账号资料、密钥文件内容及私人存储链接。凭证台账标记 active/unknown 只代表原始登记值，本轮未验证权限、有效期或真实连通。

## 数据差异与验证

- 基线：本地 revision 2，303 个要素、73 条关系。
- 新增：2 个行情 API 服务节点、10 个凭证节点、20 个官网/保管属性、4 个既有模型服务文档属性，合计 36 个资源要素、10 条关系。
- 预期总计：339 个要素、83 条关系；资源星域 89 个要素、27 条关系；星系数量仍为 57。
- 原有全部记录及其他星域的字段、标识、顺序和配置保持不变，无升格、删除、重命名或父级调整。
- 按用户新要求，将过去“禁止所有网址”细化为允许明确审核的公开资源网址：仅资源 desc、精确 HTTPS 白名单，无查询、片段、userinfo；私人云盘地址仍拒绝。
- `node tools/validate-data.mjs --list docs/data-inventory.md --json docs/data-snapshot.json`：通过，0 提示。
- `npm.cmd test`：8/8 通过，包含公开官网及凭据/签名/私人/伪装地址拒绝测试。
- 语法和差异检查通过。两页数据缓存版本为 `2026-11-03b`，存储键不变。
- 隔离本地 Chrome 与临时 SQLite：两页在 1440/768/375 均加载 339 个要素、83 条关系，无横向溢出和脚本异常。该检查没有修改当前实际数据库。

## 数据库与备份状态

当前：**已完成源码及本地数据库追加，revision 2 → 3**。生产数据库、主项目集成及 Cloudflare 部署均无改动。

变更包位于 `database/changes/20261103-api-resources/`。旧库 Backup API 快照和前后参数已在本机加密；计划继续使用 ResourceNet 的 `db-snapshots/mynet-content` 专用分支。自动审批认为上一轮明确许可不覆盖本轮新增 API 凭证元数据负载，已拦截实际提交/推送/导入命令；本轮没有绕过拦截。

用户随后明确选择“允许本轮加密备份并继续本地追加”，授权覆盖本轮元数据负载及指定分支。实际执行：

- 加密备份与 SQL 已单独提交并推送：`e9ed0ee486ae88961148451a8e1b8edd188775c6`，目标 ResourceNet `refs/heads/db-snapshots/mynet-content`；远端 tip 与全新克隆提交一致。
- 全新克隆恢复验证通过：四个密文附件解密及明文/密文摘要一致，本地旧库 integrity/FK 通过，前后参数、原记录保留、生产初始三表导出及 SQL 摘要检查通过。密钥未上传。
- 随后在本地事务中新增 revision 3，全部旧快照保留，当前数据库与源码快照一致；资源星域为 89 个要素、27 条关系，总计 339 个要素、83 条关系。
- 实际执行及恢复回执位于被 Git 忽略的 `.local/20261103-api-resources/`，非敏感回执随备份分支继续提交推送。未推送本轮源码 main，也未上线。

本次未调用真实 API，未登录受控项目。线上效果待用户截图确认。

生产更新：已于本次联合发布灌入339要素83关系，详见根RELEASE_REVIEW.md最新回执；原“仅本地”描述保留为历史。
