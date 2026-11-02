import { readFileSync } from 'node:fs';
import { validate } from '../lib/model.mjs';
import { randomUUID } from 'node:crypto';
try {
const file = process.argv[2];
if (!file) { console.error('用法：node tools/restore-data.mjs <备份.json> [本地端口]'); process.exit(1); }
const port = Number(process.argv[3] || 8765);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口无效');
const backup = JSON.parse(readFileSync(file, 'utf8'));
const domains = validate(backup.domains);
const url = `http://127.0.0.1:${port}/api/state`;
const response = await fetch(url,{signal:AbortSignal.timeout(8000)});
if (!response.ok) throw new Error('无法读取本地数据库版本');
const current = await response.json();
const result = await fetch(url, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:current.revision,domains,requestId:randomUUID()}),signal:AbortSignal.timeout(8000)});
if (!result.ok) throw new Error((await result.json()).error);
console.log('已恢复备份；恢复前版本仍保存在 SQLite 快照表中。请刷新页面。');
} catch(error) { console.error('恢复失败：'+error.message+'。未确认结果时请先查看当前数据库，不要直接重复覆盖。');process.exitCode=1; }
