import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { validate } from './lib/model.mjs';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(process.env.MYNET_DB || resolve(root, '.local/mynet.sqlite'));
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
if (db.prepare('PRAGMA user_version').get().user_version > 1) throw new Error('数据库版本高于当前程序，请使用匹配版本');
if (db.prepare("SELECT name FROM sqlite_master WHERE name='snapshots'").get() && db.prepare('PRAGMA user_version').get().user_version === 0) {
  db.prepare('VACUUM INTO ?').run(dbPath + '.before-v1-' + Date.now());
}
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
BEGIN IMMEDIATE;
CREATE TABLE IF NOT EXISTS snapshots (revision INTEGER PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, digest TEXT NOT NULL, revision INTEGER NOT NULL);
PRAGMA user_version=1;
COMMIT;`);
const sandbox = { window: {}, localStorage: { getItem: () => null } };
vm.runInNewContext(readFileSync(resolve(root, 'data.js'), 'utf8'), sandbox);
const defaults = () => validate(JSON.parse(JSON.stringify(sandbox.window.MyNet.defaults())));
const latest = () => db.prepare('SELECT revision, data, created_at FROM snapshots ORDER BY revision DESC LIMIT 1').get();
db.exec('BEGIN IMMEDIATE');
try {
  if (!latest()) db.prepare('INSERT INTO snapshots(revision,data) VALUES (1,?)').run(JSON.stringify(defaults()));
  validate(JSON.parse(latest().data));
  db.exec('COMMIT');
} catch (error) { db.exec('ROLLBACK'); throw new Error('数据库内容校验失败，请先保留数据库并从备份恢复：' + error.message); }
const keep = Number(process.env.MYNET_HISTORY_LIMIT || 200);
if (!Number.isSafeInteger(keep) || keep < 2 || keep > 10000) throw new Error('MYNET_HISTORY_LIMIT 必须在 2—10000 之间');
const files = new Map([
  ['/', ['starmap.html', 'text/html']], ['/starmap.html', ['starmap.html', 'text/html']],
  ['/manage.html', ['manage.html', 'text/html']], ['/data.js', ['data.js', 'text/javascript']],
  ['/storage.js', ['storage.js', 'text/javascript']]
]);
const server = http.createServer(async (req, res) => {
  const send = (status, payload) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(payload)); };
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  try {
    if (req.headers.host !== `127.0.0.1:${server.address().port}`) return send(403, { error: '只允许本机访问' });
    const origin = `http://${req.headers.host}`;
    if (req.headers.origin && req.headers.origin !== origin) return send(403, { error: '不允许跨站请求' });
    const path = new URL(req.url, origin).pathname;
    if (req.method === 'GET' && path === '/api/revision') {
      const row = latest(); return send(200, { revision:row.revision, updatedAt:row.created_at });
    }
    if (req.method === 'GET' && (path === '/api/state' || path === '/api/export')) {
      const row = latest();
      if (path === '/api/export') res.setHeader('Content-Disposition', 'attachment; filename="mynet-backup.json"');
      return send(200, { revision: row.revision, updatedAt: row.created_at, domains: JSON.parse(row.data) });
    }
    if (req.method === 'PUT' && path === '/api/state') {
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: '需要 JSON 数据' });
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8 * 1024 * 1024) return send(413, { error: '数据超过 8 MB' });
        chunks.push(chunk);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'JSON 格式错误' }); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['revision','domains','requestId'].includes(k)) || !Number.isSafeInteger(body.revision) || body.revision < 1 || (body.requestId !== undefined && (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.requestId)))) return send(400, {error:'请求体或版本格式错误'});
      validate(body.domains);
      const digest = createHash('sha256').update(JSON.stringify({revision:body.revision,domains:body.domains})).digest('hex');
      db.exec('BEGIN IMMEDIATE');
      try {
        const prior = body.requestId && db.prepare('SELECT digest,revision FROM requests WHERE id=?').get(body.requestId);
        if (prior) { db.exec('ROLLBACK'); return send(prior.digest === digest ? 200 : 409, prior.digest === digest ? {revision:prior.revision,replayed:true} : {error:'请求标识已用于其他内容'}); }
        const row = latest();
        if (body.revision !== row.revision) { db.exec('ROLLBACK'); return send(409, { error: '数据已由另一页面更新，请刷新后重试', revision: row.revision }); }
        const revision = row.revision + 1;
        db.prepare('INSERT INTO snapshots(revision,data) VALUES (?,?)').run(revision, JSON.stringify(body.domains));
        if (body.requestId) db.prepare('INSERT INTO requests(id,digest,revision) VALUES (?,?,?)').run(body.requestId,digest,revision);
        db.prepare('DELETE FROM snapshots WHERE revision <= ?').run(revision-keep);
        db.prepare('DELETE FROM requests WHERE revision <= ?').run(revision-keep);
        db.exec('COMMIT');
        return send(200, { revision });
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    }
    if (req.method === 'GET' && files.has(path)) {
      const [file, type] = files.get(path);
      const content=readFileSync(resolve(root,file));
      if(type==='text/html') {
        const hashes=[...content.toString('utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>`'sha256-${createHash('sha256').update(m[1].replace(/\r\n?/g,'\n')).digest('base64')}'`).join(' ');
        res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
      }
      res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
      return res.end(content);
    }
    return send(404, { error: '未找到资源' });
  } catch (e) { send(e.status || 500, { error: e.status ? e.message : '服务暂时无法处理请求' }); }
});
const port = Number(process.env.PORT || 8765);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT 无效');
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, '127.0.0.1', () => console.log(`MyNet: http://127.0.0.1:${server.address().port} (SQLite)`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
