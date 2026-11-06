# MyNet 星图 · 交接入口

归档日期：2026-11-02（Asia/Tokyo）
用途：让另一个 AI 读懂现有设计，并在不破坏结构规则的前提下补充星图数据。

开发更新（2026-11-02）：已在原型基础上实现独立 Node.js + SQLite 应用。现在用 `npm start` 启动，运行与备份说明以 [README.md](../../README.md) 为准；下文关于纯浏览器存储、静态服务和仅补数据的说明为原型阶段记录。后续数据补充仍遵守 DATA_GUIDE；应用开发已由用户另行授权。

## 先读

应用开发审核另先读 [DEVELOPMENT_REVIEW.md](../../DEVELOPMENT_REVIEW.md) 与 [docs/IMPLEMENTATION.md](../IMPLEMENTATION.md)，其中列明当前实现边界、风险、测试证据与代码摘要。

1. [REQUIREMENTS.md](../../REQUIREMENTS.md)：用户需求基线（星域 / 星系 / 节点 / 属性、单一隶属、自动升格、焦点距离）。
2. [docs/DATA_GUIDE.md](../DATA_GUIDE.md)：**数据结构、规则、命名、关系用词、安全要求、来源与待补方向**。补数据以此为准。
3. [docs/DESIGN.md](../DESIGN.md)：两个页面如何使用数据（三层星图、过渡、视觉语言、管理台规则、页面通道）。
4. [docs/data-inventory.md](../data-inventory.md)：当前全部要素与关系的树形清单（脚本生成）。

## 现状

- 可运行原型：`starmap.html`（星图）、`manage.html`（管理台）、`data.js`（共享数据）。没有构建步骤与第三方依赖。
- 数据：技能、创意、资源、项目四个星域，共 49 个星系、262 个要素、58 条关系，均有功能简述。最近数据版本为 2026-11-02e；新增来源与状态边界见 DATA_GUIDE 第 11、12 节。
- 已初始化本地 Git，未部署；服务模式使用独立本地 SQLite，浏览器旧数据需主动导入。当前修复版 0.1.1 的状态与复测见 DEVELOPMENT_REVIEW 和 docs/reviews/FIX_REVIEW_2026-11-02.md。

## 补充数据的任务边界

- 只修改 `data.js`，按 DATA_GUIDE 第 1 节的步骤完成校验、改版本号、重新生成清单与快照、写变更记录。
- 不修改页面代码；发现页面问题时记录在交付说明中。
- 只读其他目录中的项目文档；不修改、不提交、不部署任何其他仓库；不调用外部服务写入数据。
- 不写入任何账号 ID、密钥、令牌、邮箱、网址或本机路径；不读取含密钥或私人资料的目录（见 DATA_GUIDE 第 6 节）。
- 计划、创意、未验证的事项不要写成已完成；用户的判断（DATA_GUIDE 第 8 节末）不要擅自改变。

## 常用命令（在本目录执行）

```bash
node tools/validate-data.mjs
```

```bash
node tools/validate-data.mjs --list docs/data-inventory.md
```

```bash
node tools/validate-data.mjs --json docs/data-snapshot.json
```

```bash
python -m http.server 8765 --bind 127.0.0.1
```

浏览 `http://127.0.0.1:8765/manage.html` 检查表格与编辑器，`starmap.html` 检查显示。若浏览器里曾保存过旧数据，在管理台右上角点「恢复初始数据」再查看。

## 交付时说明

- 新增 / 修改了哪些要素与关系（可贴 `--list` 输出的差异）。
- 每条新事实的来源文件。
- 仍需用户确认的判断与未能核实的内容。
- 校验命令的实际输出。
