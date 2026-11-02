// MyNet 星图数据校验 / 清单 / 导出
// 用法（在 MyNet 目录下）：
//   node tools/validate-data.mjs            校验 data.js，有错误时退出码为 1
//   node tools/validate-data.mjs --list docs/data-inventory.md   额外把要素清单写成 Markdown（省略文件名则输出到终端）
//   node tools/validate-data.mjs --json out.json   额外把初始数据导出为 JSON 快照
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'data.js'), 'utf8');
const sandbox = { window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.runInNewContext(src, sandbox, { filename: 'data.js' });
const MyNet = sandbox.window.MyNet;
const D = MyNet.defaults();
const args = process.argv.slice(2);

const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);
const ID = /^[a-z][a-z0-9_]*$/;
const PREFIX = { skill: 's', idea: 'i', res: '', proj: 'p' };

const allIds = new Map();
for (const [k, d] of Object.entries(D)) {
  for (const f of ['name', 'short', 'en', 'focus', 'labels', 'relColors', 'elements', 'relations'])
    if (d[f] === undefined) err(`${k}: 缺少星域字段 ${f}`);
  const m = new Map();
  for (const e of d.elements) {
    if (m.has(e.id)) err(`${k}: 重复 id ${e.id}`);
    m.set(e.id, e);
    if (allIds.has(e.id)) warn(`${k}: id ${e.id} 与星域 ${allIds.get(e.id)} 重名（允许，但建议避免）`);
    allIds.set(e.id, k);
    if (!ID.test(e.id)) err(`${k}: id 只能用小写字母、数字、下划线：${e.id}`);
    if (PREFIX[k] && !e.id.startsWith(PREFIX[k] + '_')) warn(`${k}: id 建议以 ${PREFIX[k]}_ 开头：${e.id}`);
    if (!['node', 'attr'].includes(e.state)) err(`${k}: ${e.id} 的 state 只能是 node / attr`);
    if (!e.name || !e.name.trim()) err(`${k}: ${e.id} 缺少名称`);
    if (!e.fn || !e.fn.trim()) err(`${k}: ${e.id}「${e.name}」缺少功能简述 fn`);
    else if ([...e.fn].length > 40) err(`${k}: ${e.id} 的 fn 超过 40 字`);
    else if ([...e.fn].length > 24) warn(`${k}: ${e.id} 的 fn 偏长（${[...e.fn].length} 字），建议 ≤ 20`);
  }
  for (const e of d.elements) {
    if (e.parent && !m.has(e.parent)) err(`${k}: ${e.id} 的隶属父节点 ${e.parent} 不存在`);
    if (e.state === 'attr' && !e.parent) err(`${k}: 属性 ${e.id} 必须有所属节点`);
    if (e.parent && m.get(e.parent)?.state === 'attr') err(`${k}: ${e.id} 隶属于属性 ${e.parent}（属性不能拥有下级，应先升格为节点）`);
    let p = e, seen = new Set();
    while (p && p.parent) { if (seen.has(p.id)) { err(`${k}: ${e.id} 的隶属形成环`); break } seen.add(p.id); p = m.get(p.parent) }
  }
  const relKey = new Set();
  for (const r of d.relations) {
    if (!m.has(r.from)) err(`${k}: 关系起点 ${r.from} 不存在`);
    const t = m.get(r.to);
    if (!t) err(`${k}: 关系目标 ${r.to} 不存在（跨星域参照尚未定义，目标必须在同一星域）`);
    else if (t.state !== 'node') err(`${k}: 关系目标 ${r.to} 是属性；被选为关联目标的要素必须升格为节点（state:'node'）`);
    if (r.from === r.to) err(`${k}: 关系起点与目标相同 ${r.from}`);
    if (!d.relColors[r.type]) err(`${k}: 关系类型「${r.type}」不在该星域模板 relColors 中`);
    const key = `${r.from}|${r.type}|${r.to}`;
    if (relKey.has(key)) err(`${k}: 重复关系 ${key}`);
    relKey.add(key);
  }
  const f = m.get(d.focus);
  if (!f || f.state !== 'node') err(`${k}: 默认焦点 ${d.focus} 不存在或不是节点`);
}

// 敏感信息：不得写入账号 ID、密钥、令牌、邮箱、内部地址
const SENSITIVE = [
  [/account_id/i, '账号 ID 字段'], [/\b[0-9a-f]{32}\b/i, '32 位十六进制 ID'], [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, 'UUID'],
  [/workers\.dev/i, 'workers.dev 地址'], [/cloudflareaccess\.com/i, 'Access 团队域名'], [/(token|secret|password|api[_-]?key)\s*[:=]/i, '凭据赋值'],
  [/[\w.+-]+@[\w-]+\.[\w.]+/, '邮箱地址'], [/https?:\/\//i, '网址'], [/[A-Za-z]:\\/, '本机路径（注释除外请勿写入数据）'], [/3MVG[\w.]{10,}/, 'Salesforce 客户端 ID'],
];
const dataText = JSON.stringify(D);
for (const [re, label] of SENSITIVE) if (re.test(dataText)) err(`数据中出现疑似敏感内容：${label}（${re}）`);

// 统计
const summary = ['MyNet 数据校验 · 存储键 ' + MyNet.KEY];
for (const [k, d] of Object.entries(D)) {
  const n = d.elements.filter(e => e.state === 'node').length;
  summary.push(`  ${k.padEnd(5)} ${d.name}：根节点 ${d.elements.filter(e => !e.parent).length} · 节点 ${n} · 属性 ${d.elements.length - n} · 关系 ${d.relations.length}`);
}
warns.forEach(w => summary.push('  提示 ' + w));
errors.forEach(e => summary.push('  错误 ' + e));
summary.push(errors.length ? `校验失败：${errors.length} 个错误` : `校验通过（${warns.length} 条提示）`);
summary.forEach(l => console.log(l));

// 清单：--list 后跟文件名时写入该文件，否则输出到终端
const li = args.indexOf('--list');
if (li >= 0) {
  const lines = [
    '# MyNet 星图 · 数据清单\n',
    '> 由 `node tools/validate-data.mjs --list docs/data-inventory.md` 生成，请勿手工编辑；修改 data.js 后重新生成。● 节点　· 属性\n',
    '```text\n' + summary.join('\n') + '\n```',
  ];
  for (const [k, d] of Object.entries(D)) {
    lines.push(`\n## ${d.name}（${k}）\n`);
    const m = new Map(d.elements.map(e => [e.id, e]));
    const kids = id => d.elements.filter(e => e.parent === id);
    const walk = (e, dep) => {
      lines.push(`${'  '.repeat(dep)}- ${e.state === 'attr' ? '·' : '●'} ${e.name} \`${e.id}\` — ${e.fn}`);
      kids(e.id).filter(c => c.state === 'attr').forEach(c => walk(c, dep + 1));
      kids(e.id).filter(c => c.state === 'node').forEach(c => walk(c, dep + 1));
    };
    d.elements.filter(e => !e.parent).forEach(r => walk(r, 0));
    if (d.relations.length) {
      lines.push('\n关系：\n');
      d.relations.forEach(r => lines.push(`- ${m.get(r.from)?.name} \`${r.from}\` —${r.type}→ ${m.get(r.to)?.name} \`${r.to}\``));
    }
  }
  const out = args[li + 1] && !args[li + 1].startsWith('--') ? args[li + 1] : null;
  if (out) { writeFileSync(out, lines.join('\n') + '\n'); console.log('已写入', out) }
  else console.log(lines.join('\n'));
}
const ji = args.indexOf('--json');
if (ji >= 0) {
  const out = args[ji + 1] || 'data-snapshot.json';
  writeFileSync(out, JSON.stringify({ exportedAt: new Date().toISOString(), storageKey: MyNet.KEY, domains: D }, null, 2) + '\n');
  console.log('已导出', out);
}
process.exit(errors.length ? 1 : 0);
