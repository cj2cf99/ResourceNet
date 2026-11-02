import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createMyNetHandler,MAX_BYTES} from '../cloudflare/routes.mjs';
import {openD1} from './helpers/d1.mjs';
const sandbox={window:{},localStorage:{getItem:()=>null}};vm.runInNewContext(readFileSync(new URL('../data.js',import.meta.url),'utf8'),sandbox);
const seed=JSON.parse(JSON.stringify(sandbox.window.MyNet.defaults()));
const manifest={files:[{path:'starmap.html',csp:"script-src 'self'"},{path:'manage.html'},{path:'data.js'},{path:'storage.js'}]};
function setup(){const db=openD1();db.sqlite.exec(readFileSync(new URL('../cloudflare/schema.sql',import.meta.url),'utf8'));const handler=createMyNetHandler({seed,manifest,authorize:async request=>{if(request.headers.get('x-test-auth')!=='yes')throw Object.assign(Error('登录失败'),{status:401});return {ownerId:'verified-owner'}}});return {db,handler,env:{mymaindb:db,PUBLIC_ORIGIN:'https://site.test',STOCKCHECK_ASSETS:{fetch:async req=>new Response('asset '+new URL(req.url).pathname)}}};}
const request=(path,body,headers={})=>new Request('https://site.test'+path,{method:body===undefined?'GET':'PUT',headers:{'x-test-auth':'yes',...(body===undefined?{}:{Origin:'https://site.test','Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
test('Cloudflare pages, source assets and API require verified identity; no shared shell',async()=>{
  const {db,handler,env}=setup();try{
    assert.equal(await handler(new Request('https://site.test/'),env),null);
    for(const path of ['/mynet/','/mynet/data.js','/api/mynet/state'])assert.equal((await handler(request(path,undefined,{'x-test-auth':'no'}),env)).status,401);
    assert.equal((await handler(request('/mynet'),env)).status,308);
    const result=await handler(request('/mynet/'),env);assert.equal(result.status,200);assert.match(await result.text(),/starmap.html/);assert.ok(result.headers.has('Content-Security-Policy'));
    assert.equal((await handler(request('/mynet/schema.sql'),env)).status,404);
    const before=db.sqlite.prepare('SELECT count(*) n FROM mynet_snapshots').get().n;
    const state=await(await handler(request('/api/mynet/state'),env)).json();assert.equal(state.revision,0);assert.deepEqual(state.domains,seed);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM mynet_snapshots').get().n,before);
  }finally{db.close()}
});
test('D1 batch CAS, idempotency, race and rollback',async()=>{
  const {db,handler,env}=setup();try{
    const body={revision:0,domains:seed,requestId:'initial_request'};
    assert.throws(()=>db.sqlite.exec('UPDATE mynet_state SET revision=1,data=NULL'),/CHECK/);
    assert.equal((await handler(request('/api/mynet/state',body),env)).status,200);
    assert.equal((await handler(request('/api/mynet/state',body),env)).status,200);
    assert.equal(db.sqlite.prepare('SELECT count(*) n FROM mynet_snapshots').get().n,1);
    assert.equal((await handler(request('/api/mynet/state',{...body,requestId:'stale_request'}),env)).status,409);
    const changed=structuredClone(body);changed.domains.skill.elements[0].name='不同内容';assert.equal((await handler(request('/api/mynet/state',changed),env)).status,409);
    const race=await Promise.all(['racing_req_1','racing_req_2'].map(requestId=>handler(request('/api/mynet/state',{revision:1,domains:seed,requestId}),env)));assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
    db.sqlite.exec("CREATE TRIGGER block_mynet_snapshot BEFORE INSERT ON mynet_snapshots BEGIN SELECT RAISE(ABORT,'injected'); END");
    assert.equal((await handler(request('/api/mynet/state',{revision:2,domains:seed,requestId:'rollback_request'}),env)).status,503);
    assert.equal(db.sqlite.prepare('SELECT revision FROM mynet_state').get().revision,2);assert.equal(db.sqlite.prepare("SELECT count(*) n FROM mynet_requests WHERE id='rollback_request'").get().n,0);
  }finally{db.close()}
});
test('D1 writes reject missing/cross origin, malformed data and oversized bodies',async()=>{
  const {db,handler,env}=setup();try{
    const body={revision:0,domains:seed,requestId:'valid_request'};
    for(const origin of ['', 'https://other.test'])assert.equal((await handler(request('/api/mynet/state',body,{Origin:origin}),env)).status,403);
    assert.equal((await handler(request('/api/mynet/state',null),env)).status,400);
    const invalid=structuredClone(body);invalid.domains.skill.elements[0].parent='';assert.equal((await handler(request('/api/mynet/state',invalid),env)).status,422);
    assert.equal((await handler(request('/api/mynet/state',{...body,padding:'x'.repeat(MAX_BYTES)}),env)).status,413);
    assert.equal((await handler(request('/api/mynet/state',body,{'Content-Type':'text/plain'}),env)).status,415);
    assert.equal(db.sqlite.prepare('SELECT revision FROM mynet_state').get().revision,0);
  }finally{db.close()}
});
