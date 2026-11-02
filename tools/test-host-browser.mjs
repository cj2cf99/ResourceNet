// Main-project integration rehearsal: temporary in-memory D1 and test-only signed Access JWT.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const host=resolve(process.env.MYNET_HOST_ROOT||'G:/cloudflare/myapp');
const {worker,fixture}=await import(pathToFileURL(resolve(host,'tests/helpers/worker.mjs')).href);
const {signMockAccessJwt,MOCK_CLAIMS}=await import(pathToFileURL(resolve(host,'tests/helpers/expenses/mock-access.mjs')).href);
const {chromium}=await import(process.env.MYNET_PLAYWRIGHT_MODULE?pathToFileURL(process.env.MYNET_PLAYWRIGHT_MODULE).href:'playwright');
const local=fixture();const db=local.env.mymaindb;local.sqlite.exec(readFileSync(resolve(host,'migrations/0013_mynet.sql'),'utf8'));
const jwt=await signMockAccessJwt();
const env={...local.env,mymaindb:db,APP_ENV:'test',ACCESS_MODE:'mock',ACCESS_ISSUER:MOCK_CLAIMS.iss,ACCESS_AUD:MOCK_CLAIMS.aud,ACCESS_JWKS_URL:MOCK_CLAIMS.iss+'/cdn-cgi/access/certs',ALLOWED_OWNER_SUBS:MOCK_CLAIMS.sub,STOCKCHECK_ASSETS:{fetch:async request=>{
 const path=new URL(request.url).pathname;
 if(!/^\/mynet\/(starmap\.html|manage\.html|data\.js|storage\.js)$/.test(path))return new Response(null,{status:404});
 return new Response(readFileSync(resolve(host,'public'+path)),{headers:{'Content-Type':path.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8'}});
}}};
let base,browser;
const server=createServer(async(req,res)=>{
 try{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const headers=new Headers();for(const[k,v]of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(','):v);
  headers.set('Cf-Access-Jwt-Assertion',jwt);
  const request=new Request(base+req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await worker.fetch(request,env,{waitUntil(){}});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('test harness error')}
});
const results=[];
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;env.PUBLIC_ORIGIN=base;
 browser=await chromium.launch({headless:true,...(process.env.MYNET_CHROME?{executablePath:process.env.MYNET_CHROME}:{})});
 for(const width of [1440,768,375]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<1000});
  await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>{if(page.url().includes('/mynet/'))errors.push(e.message)});
  for(const url of ['/mynet/manage.html#d=skill&s=s_english','/mynet/starmap.html#d=skill&f=s_english&s=s_english']){
   await page.goto('about:blank');await page.goto(base+url);await page.locator('#domains button').first().waitFor();
   assert.equal(await page.locator('.unified-header').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);
   const home=page.getByRole('link',{name:'返回首页',exact:true});await home.waitFor({state:'visible'});
   if(url.includes('/manage')){
    await page.locator('[data-f="desc"]').fill('主站临时库跨屏验收 '+width);await page.locator('#newAttr').click();await page.waitForFunction(()=>document.querySelector('#saved').textContent==='已保存');await page.reload();await page.locator('[data-f="desc"]').waitFor();assert.equal(await page.locator('[data-f="desc"]').inputValue(),'主站临时库跨屏验收 '+width);
   }else{
    if(width<1000){await page.locator('#cameraPan').tap();await page.locator('#cameraIn').tap();}else{await page.locator('#cameraPan').click();await page.locator('#cameraIn').click();}
    assert.equal(await page.locator('#cameraPan').getAttribute('aria-pressed'),'true');
   }
   if(width<1000)await home.tap();else{await home.focus();await home.press('Enter');}
   await page.waitForURL(base+'/');assert.equal(new URL(page.url()).pathname,'/');
  }
  assert.deepEqual(errors,[]);results.push({width,pages:2,independentHeader:true,overflow:false,saveRefresh:true,homeActivation:width<1000?'tap':'Enter',javascriptErrors:0});await context.close();
 }
 mkdirSync('.integration',{recursive:true});writeFileSync('.integration/host-browser-verification.json',JSON.stringify({date:'2026-11-02',temporaryDatabase:true,mockSignedAccess:true,productionAccessTested:false,results},null,2)+'\n');
 console.log('主项目真实路由 + 签名测试 JWT + 临时 D1：1440/768/375 双页、保存刷新、独立页头、首页跳转和触屏控件均通过。');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));local.close()}
