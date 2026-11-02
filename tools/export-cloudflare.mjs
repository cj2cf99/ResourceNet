import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {validate} from '../lib/model.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'.integration/mynet');
mkdirSync(resolve(out,'public'),{recursive:true});mkdirSync(resolve(out,'feature'),{recursive:true});
const sha=body=>createHash('sha256').update(body).digest('hex');
const copied=[];
const manifest={module:'mynet',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),apiBase:'/api/mynet',files:[]};
for(const file of ['starmap.html','manage.html','data.js','storage.js']){
  let content=readFileSync(resolve(root,file),'utf8');
  if(file.endsWith('.html'))content=content.replace(/<script src="storage.js\?v=([^"]+)"><\/script>/,'<script src="storage.js?v=$1" data-api-base="/api/mynet"></script>');
  const item={path:file,sha256:sha(content)};
  if(file.endsWith('.html')){
    if(!content.includes('aria-label="返回首页"'))throw Error('缺少返回首页按钮');
    if(!content.includes('data-api-base="/api/mynet"'))throw Error('API 基址注入失败');
    const hashes=[...content.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>`'sha256-${createHash('sha256').update(m[1].replace(/\r\n?/g,'\n')).digest('base64')}'`).join(' ');
    item.csp=`default-src 'self'; script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`;
  }
  writeFileSync(resolve(out,'public',file),content);manifest.files.push(item);copied.push({source:file,target:'public/'+file,sha256:item.sha256});
}
const sandbox={window:{},localStorage:{getItem:()=>null}};vm.runInNewContext(readFileSync(resolve(root,'data.js'),'utf8'),sandbox);
const seed=JSON.parse(JSON.stringify(sandbox.window.MyNet.defaults()));validate(seed);
writeFileSync(resolve(out,'feature/seed.json'),JSON.stringify(seed));
for(const [source,target] of [['cloudflare/routes.mjs','routes.mjs'],['lib/model.mjs','model.mjs']]){
  const bytes=readFileSync(resolve(root,source));writeFileSync(resolve(out,'feature',target),bytes);copied.push({source,target:'feature/'+target,sha256:sha(bytes)});
}
copied.push({source:'data.js defaults()',target:'feature/seed.json',sha256:sha(JSON.stringify(seed))});
writeFileSync(resolve(out,'feature/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(resolve(out,'source.json'),JSON.stringify({sourceCommit:manifest.sourceCommit,files:copied},null,2)+'\n');
console.log('Cloudflare 集成包已生成：.integration/mynet（4 个白名单资源、D1 处理器及种子）；未改写主项目或数据库。');
