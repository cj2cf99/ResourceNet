import {DatabaseSync,backup} from 'node:sqlite';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import vm from 'node:vm';
import {validate} from '../lib/model.mjs';

const root=resolve(import.meta.dirname,'..'),change=process.argv[3]||'20261103-knowledge-refresh';
if(!/^[a-z0-9-]+$/.test(change))throw Error('变更名称无效');
const dir=join(root,'.local',change),pkg=join(root,'database/changes',change);
const localFile=join(root,'.local/mynet.sqlite');
const sha=b=>createHash('sha256').update(b).digest('hex');
const latest=db=>db.prepare('SELECT revision,data FROM snapshots ORDER BY revision DESC LIMIT 1').get();
const check=db=>{if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('数据库完整性检查失败');};
const defaults=()=>{
  const context={window:{},localStorage:{getItem:()=>null}};
  vm.runInNewContext(readFileSync(join(root,'data.js'),'utf8'),context);
  return validate(JSON.parse(JSON.stringify(context.window.MyNet.defaults())));
};
const assertAppend=(before,after)=>{
  validate(after);
  for(const key of Object.keys(before)){
    const a=before[key],b=after[key];
    for(const prop of Object.keys(a).filter(k=>!['elements','relations'].includes(k)))if(!isDeepStrictEqual(a[prop],b[prop]))throw Error('星域配置被改动：'+key+'/'+prop);
    for(const prop of ['elements','relations'])if(!isDeepStrictEqual(a[prop],b[prop].slice(0,a[prop].length)))throw Error('原有内容被修改或重排：'+key+'/'+prop);
  }
};
const counts=d=>Object.fromEntries(Object.entries(d).map(([k,v])=>[k,{roots:v.elements.filter(e=>e.parent===null).length,elements:v.elements.length,relations:v.relations.length}]));
const sqlHashes=()=>Object.fromEntries(['01-precheck.sql','02-schema.sql','03-data.sql','04-verify.sql','05-compensate.sql'].map(n=>[n,sha(readFileSync(join(pkg,n)))]));

if(process.argv[2]==='prepare'){
  if(existsSync(join(dir,'manifest.json')))throw Error('计划已存在，拒绝重复准备');
  mkdirSync(dir,{recursive:true});
  const before=defaults(),additions=JSON.parse(readFileSync(join(pkg,'additions.json')));
  const after=structuredClone(before);
  for(const[k,v]of Object.entries(additions)){after[k].elements.push(...v.elements);after[k].relations.push(...v.relations);}
  assertAppend(before,after);
  const db=new DatabaseSync(localFile,{readOnly:true});check(db);
  const row=latest(db);
  if(!isDeepStrictEqual(JSON.parse(row.data),before))throw Error('本地已偏离初始基线，停止以免覆盖用户编辑');
  await backup(db,join(dir,'local-before.sqlite'));db.close();
  const copy=new DatabaseSync(join(dir,'local-before.sqlite'),{readOnly:true});check(copy);
  if(latest(copy).data!==row.data)throw Error('旧库备份回读不一致');copy.close();
  writeFileSync(join(dir,'before-domains.json'),JSON.stringify(before));
  writeFileSync(join(dir,'after-domains.json'),JSON.stringify(after));
  const archive=join(dir,'archive');mkdirSync(archive);
  const key=readFileSync('G:/cloudflare/myapp/.cloudflare-backup/keys/db-snapshot-production-master.key');
  if(key.length!==32)throw Error('主密钥格式错误');
  const files={};
  for(const[name,source]of [['local-before.sqlite',join(dir,'local-before.sqlite')],['before-domains.json',join(dir,'before-domains.json')],['after-domains.json',join(dir,'after-domains.json')],['production-mynet.sql',join(root,'.local/production-sync-20261103/production-mynet.sql')]]){
    const plain=readFileSync(source),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    const cipherText=Buffer.concat([cipher.update(plain),cipher.final()]);
    const envelope=JSON.stringify({version:1,algorithm:'AES-256-GCM',iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:cipherText.toString('base64')});
    writeFileSync(join(archive,name+'.enc'),envelope,{flag:'wx'});
    const dec=createDecipheriv('aes-256-gcm',key,iv);dec.setAuthTag(cipher.getAuthTag());
    if(sha(Buffer.concat([dec.update(cipherText),dec.final()]))!==sha(plain))throw Error('加密恢复检查失败');
    files[name+'.enc']={plaintext_sha256:sha(plain),encrypted_sha256:sha(envelope)};
  }
  const manifest={change,preparedAt:new Date().toISOString(),target:'MyNet local SQLite only',sourceBaseline:'ResourceNet eb807265fe1ecea8a2d21340d955dcc0c37b4885; user confirmed initial production content',localBeforeRevision:row.revision,localBeforeDataSha256:sha(row.data),afterDataSha256:sha(JSON.stringify(after)),beforeCounts:counts(before),afterCounts:counts(after),originalElementsAndRelations:'unchanged, including IDs, order and all fields',sql:sqlHashes(),files,encryption:{algorithm:'AES-256-GCM',key_ref:'existing production master registered in Google Drive; key not included',key_fingerprint:sha(key).slice(0,16)},backupRemote:'https://github.com/cj2cf99/ResourceNet.git',backupRef:'refs/heads/db-snapshots/mynet-content',productionWrites:0,status:'PREPARED; remote fresh-clone restore required before local apply'};
  writeFileSync(join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
  writeFileSync(join(archive,'manifest.json'),JSON.stringify(manifest,null,2));
  const marker='/* 浏览器本地存储：';
  const source=readFileSync(join(root,'data.js'),'utf8');
  const symbol='REFRESH_'+change.replaceAll('-','_');
  const block=`/* ${change}: additive project evidence, original entries retained. */\nconst ${symbol}=${JSON.stringify(additions,null,2)};\nfor(const [key,entry] of Object.entries(${symbol})){\n  DOMAINS[key].elements.push(...entry.elements.map(({fn,...element})=>{FN[element.id]=fn;return element}));\n  DOMAINS[key].relations.push(...entry.relations);\n}\n\n`;
  if(!source.includes(marker)||source.includes('const '+symbol+'='))throw Error('源码标记异常');
  writeFileSync(join(root,'data.js'),source.replace(marker,block+marker));
  if(!isDeepStrictEqual(defaults(),after))throw Error('生成初始数据与计划不一致');
  for(const name of ['starmap.html','manage.html']){
    const file=join(root,name),text=readFileSync(file,'utf8');
    writeFileSync(file,text.replace(/data\.js\?v=[^"']+/,change==='20261103-api-resources'?'data.js?v=2026-11-03b':'data.js?v=2026-11-03a'));
  }
  console.log(JSON.stringify({status:'PREPARED',before:manifest.beforeCounts,after:manifest.afterCounts,originalContent:'unchanged',localDatabaseWrites:0},null,2));
}else if(process.argv[2]==='apply'){
  const manifest=JSON.parse(readFileSync(join(dir,'manifest.json')));
  const receipt=JSON.parse(readFileSync(join(dir,'remote-backup-receipt.json')));
  if(!receipt.verified||!receipt.commit||receipt.ref!==manifest.backupRef||receipt.manifestSha256!==sha(readFileSync(join(dir,'archive/manifest.json'))))throw Error('缺少匹配的远端恢复回执');
  if(!isDeepStrictEqual(sqlHashes(),manifest.sql))throw Error('SQL 与已归档计划不一致');
  const before=JSON.parse(readFileSync(join(dir,'before-domains.json'))),after=JSON.parse(readFileSync(join(dir,'after-domains.json')));
  assertAppend(before,after);
  if(!isDeepStrictEqual(defaults(),after))throw Error('源码与数据库计划不一致');
  const data=JSON.stringify(after);if(sha(data)!==manifest.afterDataSha256)throw Error('参数摘要不一致');
  const db=new DatabaseSync(localFile);db.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE;');
  let revision;
  try{
    const row=latest(db);
    if(row.revision!==manifest.localBeforeRevision||sha(row.data)!==manifest.localBeforeDataSha256)throw Error('备份后本地已变更，停止导入');
    revision=row.revision+1;db.prepare(readFileSync(join(pkg,'03-data.sql'),'utf8')).run(revision,data);
    check(db);if(latest(db).data!==data)throw Error('数据库回读不一致');
    db.exec('COMMIT;');
  }catch(e){db.exec('ROLLBACK');throw e;}finally{db.close();}
  const receiptOut={status:'APPLIED_LOCAL_ONLY',completedAt:new Date().toISOString(),revision,counts:counts(after),originalContent:'unchanged',backupCommit:receipt.commit,backupRef:receipt.ref,productionWrites:0};
  writeFileSync(join(dir,'result.json'),JSON.stringify(receiptOut,null,2));console.log(JSON.stringify(receiptOut,null,2));
}else throw Error('用法：node tools/refresh-knowledge.mjs prepare|apply');
