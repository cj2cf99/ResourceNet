// Verify only a fresh-cloned backup package. Never prints plaintext data or keys.
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash,createDecipheriv} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {isDeepStrictEqual} from 'node:util';
import {validate} from '../lib/model.mjs';
const [archive,commit]=process.argv.slice(2);
if(!archive||!/^[0-9a-f]{40}$/.test(commit||''))throw Error('需要远端新克隆中的快照路径和提交标识');
const dir=resolve(import.meta.dirname,'../.local/20261103-knowledge-refresh');
const raw=readFileSync(join(archive,'manifest.json')),m=JSON.parse(raw);
const key=readFileSync('G:/cloudflare/myapp/.cloudflare-backup/keys/db-snapshot-production-master.key');
const sha=b=>createHash('sha256').update(b).digest('hex');
if(sha(key).slice(0,16)!==m.encryption.key_fingerprint)throw Error('密钥指纹不一致');
const plain={};
for(const[name,hashes]of Object.entries(m.files)){
  const bytes=readFileSync(join(archive,name));if(sha(bytes)!==hashes.encrypted_sha256)throw Error('密文摘要不一致');
  const e=JSON.parse(bytes),d=createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64'));d.setAuthTag(Buffer.from(e.tag,'base64'));
  const result=Buffer.concat([d.update(Buffer.from(e.ciphertext,'base64')),d.final()]);
  if(sha(result)!==hashes.plaintext_sha256)throw Error('明文摘要不一致');plain[name]=result;
}
const temp=join(dir,'remote-restore-verification');mkdirSync(temp,{recursive:true});
try{
  const file=join(temp,'local-before.sqlite');writeFileSync(file,plain['local-before.sqlite.enc']);
  const db=new DatabaseSync(file,{readOnly:true});
  try{
    if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('备份库完整性校验失败');
    const row=db.prepare('SELECT revision,data FROM snapshots ORDER BY revision DESC LIMIT 1').get();
    if(row.revision!==m.localBeforeRevision||sha(row.data)!==m.localBeforeDataSha256)throw Error('备份内容与基线不一致');
    const before=validate(JSON.parse(plain['before-domains.json.enc'])),after=validate(JSON.parse(plain['after-domains.json.enc']));
    if(!isDeepStrictEqual(JSON.parse(row.data),before)||sha(JSON.stringify(after))!==m.afterDataSha256)throw Error('绑定参数或基线不一致');
    for(const k of Object.keys(before)){
      for(const prop of ['elements','relations'])if(!isDeepStrictEqual(before[k][prop],after[k][prop].slice(0,before[k][prop].length)))throw Error('追加改动覆盖原数据');
    }
  }finally{db.close();}
  const prod=new DatabaseSync(':memory:');
  try{prod.exec(plain['production-mynet.sql.enc'].toString('utf8'));if(prod.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('生产导出恢复失败');}finally{prod.close();}
}finally{rmSync(temp,{recursive:true,force:true});}
for(const[name,expected]of Object.entries(m.sql)){
  if(sha(readFileSync(resolve(archive,'../../../../changes/20261103-knowledge-refresh',name)))!==expected)throw Error('归档 SQL 摘要不一致');
}
const receipt={verified:true,verifiedAt:new Date().toISOString(),commit,ref:m.backupRef,manifestSha256:sha(raw),checks:'fresh clone; four envelopes decrypted; all hashes match; SQLite integrity/FK; baseline and additive parameters verified; production export restored; SQL hashes match'};
writeFileSync(join(dir,'remote-backup-receipt.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
