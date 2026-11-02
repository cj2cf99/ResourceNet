import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';
import { validate } from '../lib/model.mjs';

function fixture() {
  const sandbox = {window:{},localStorage:{getItem:()=>null}};
  vm.runInNewContext(readFileSync(new URL('../data.js', import.meta.url),'utf8'),sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.MyNet.defaults()));
}
test('单一隶属、升格约束、循环及多关系规则', () => {
  const data = fixture(); validate(data);
  const d = data.skill;
  d.elements.push({id:'test_a',name:'属性',parent:'s_web',state:'attr',fn:'',desc:''});
  d.relations.push({id:'test_r',from:'s_cf',type:'帮助',to:'test_a'});
  assert.throws(()=>validate(data), /升格/);
  d.elements.at(-1).state='node'; validate(data);
  d.relations.push({id:'test_r2',from:'test_a',type:'促进',to:'s_cf'}); validate(data);
  d.elements.find(e=>e.id==='s_web').parent='test_a';
  assert.throws(()=>validate(data), /成环/);
});
test('属性起点保持属性；重复、跨域、非法模板受阻', () => {
  const data = fixture(), d = data.skill;
  d.relations.push({id:'test_r',from:'s_jp_level',type:'帮助',to:'s_web'}); validate(data);
  assert.equal(d.elements.find(e=>e.id==='s_jp_level').state,'attr');
  d.relations.push({id:'test_r2',from:'s_jp_level',type:'帮助',to:'s_web'});
  assert.throws(()=>validate(data), /重复/); d.relations.pop();
  d.relations.at(-1).to='p_mynet'; assert.throws(()=>validate(data), /目标无效/);
});
test('SQLite 服务持久化、冲突保护、失败原子性和访问边界', async () => {
  const dir = mkdtempSync(join(tmpdir(),'mynet-test-'));
  let child;
  async function start() {
    child = spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',MYNET_DB:join(dir,'test.sqlite'),MYNET_HISTORY_LIMIT:'3'},stdio:['ignore','pipe','pipe']});
    let output='';
    return await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('服务启动超时')),10000);
      child.once('exit',code=>{clearTimeout(timer);reject(new Error(`服务退出 ${code}`))});
      child.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0])}});
    });
  }
  async function stop(){if(child && child.exitCode===null)await new Promise(resolve=>{child.once('exit',resolve);child.kill()})}
  try {
    let base=await start();
    const state=await (await fetch(base+'/api/state')).json();
    const update=structuredClone(state); update.domains.skill.elements[0].desc='持久化验收';
    const put = body => fetch(base+'/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:body.revision,domains:body.domains,...(body.requestId?{requestId:body.requestId}:{})})});
    assert.equal((await put(update)).status,200);
    assert.equal((await put(state)).status,409);
    const current=await (await fetch(base+'/api/state')).json();
    assert.deepEqual(await(await fetch(base+'/api/revision')).json(),{revision:current.revision,updatedAt:current.updatedAt});
    const idem={...current,requestId:'regression_request_1'};
    assert.equal((await put(idem)).status,200);
    const revisionAfter=(await(await fetch(base+'/api/state')).json()).revision;
    assert.equal((await put(idem)).status,200);
    assert.equal((await(await fetch(base+'/api/state')).json()).revision,revisionAfter);
    const different=structuredClone(idem);different.domains.skill.elements[0].desc='different';assert.equal((await put(different)).status,409);
    current.revision=revisionAfter;
    current.updatedAt=(await(await fetch(base+'/api/state')).json()).updatedAt;
    for(const bad of [null,[],{revision:'1',domains:current.domains},{revision:1,domains:current.domains,unexpected:true}])assert.equal((await fetch(base+'/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(bad)})).status,400);
    const broken=structuredClone(current);broken.domains.skill.elements[0].parent='s_web_js';
    assert.equal((await put(broken)).status,422);
    assert.deepEqual(await (await fetch(base+'/api/state')).json(),current);
    assert.equal((await fetch(base+'/api/state',{headers:{Origin:'https://untrusted.example'}})).status,403);
    assert.equal((await fetch(base+'/.local/mynet.sqlite')).status,404);
    assert.equal((await fetch(base+'/server.mjs')).status,404);
    assert.equal((await fetch(base+'/manage.html')).status,200);
    assert.deepEqual((await (await fetch(base+'/api/export')).json()).domains,current.domains);
    const backup=join(dir,'backup.json');writeFileSync(backup,JSON.stringify(current));
    const restore=spawnSync(process.execPath,['tools/restore-data.mjs',backup,new URL(base).port],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
    assert.equal(restore.status,0,restore.stderr);
    writeFileSync(backup,'{"domains":null}');
    const invalid=spawnSync(process.execPath,['tools/restore-data.mjs',backup,new URL(base).port],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
    assert.equal(invalid.status,1);assert.match(invalid.stderr,/恢复失败/);assert.doesNotMatch(invalid.stderr,/\n\s+at /);
    for(let i=0;i<4;i++){const value=await(await fetch(base+'/api/state')).json();assert.equal((await put(value)).status,200);}
    await stop(); base=await start();
    assert.equal((await (await fetch(base+'/api/state')).json()).domains.skill.elements[0].desc,'持久化验收');
    await stop();
    const inspect=new DatabaseSync(join(dir,'test.sqlite'));assert.equal(inspect.prepare('SELECT count(*) AS n FROM snapshots').get().n,3);
    inspect.exec('PRAGMA user_version=0');inspect.close();
    base=await start();assert.equal((await fetch(base+'/api/state')).status,200);
    assert.ok(readdirSync(dir).some(name=>name.includes('.before-v1-')));
  } finally { await stop(); rmSync(dir,{recursive:true,force:true}); }
});
test('严格模式拒绝模板 HTML、空父级、未知字段与畸形对象',()=>{
  for(const mutate of [d=>d.skill.en='<img src=x onerror=alert(1)>',d=>d.skill.elements[0].parent='',d=>d.skill.extra=1,d=>d.skill.elements[0].extra=1,d=>d.skill.labels=[],d=>d.skill.relColors=[],d=>d.skill.relations[0].type={},d=>d.skill.elements[0]=null]){
    const data=fixture();mutate(data);assert.throws(()=>validate(data),e=>e.status===422);
  }
});
