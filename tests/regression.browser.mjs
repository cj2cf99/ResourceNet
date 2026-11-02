// 运行：npm run test:browser。需可用的 Playwright；可用环境变量指定已有模块和 Chrome。
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.MYNET_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.MYNET_PLAYWRIGHT_MODULE).href : 'playwright');
const dir=mkdtempSync(join(tmpdir(),'mynet-browser-'));
const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',MYNET_DB:join(dir,'test.sqlite')},stdio:['ignore','pipe','pipe']});
let browser;
const passed=[];
try {
  const base=await new Promise((resolve,reject)=>{let s='';const timeout=setTimeout(()=>reject(Error('服务启动超时')),10000);child.stdout.on('data',c=>{s+=c;const m=s.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timeout);resolve(m[0])}});child.once('exit',code=>{clearTimeout(timeout);reject(Error('服务退出 '+code))});});
  browser=await chromium.launch({headless:true,...(process.env.MYNET_CHROME?{executablePath:process.env.MYNET_CHROME}:{})});
  const state=async()=>await(await fetch(base+'/api/state')).json();
  const write=async domains=>{const current=await state();const r=await fetch(base+'/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:current.revision,domains})});assert.equal(r.status,200);};
  async function context() {
    const c=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
    await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());return c;
  }
  async function page(c,url='/manage.html#d=skill&s=s_english') {
    const p=await c.newPage();p.on('dialog',d=>d.accept());p.on('pageerror',e=>{throw e});await p.goto(base+url);await p.locator('#domains button').first().waitFor();return p;
  }
  async function saved(p){await p.waitForFunction(()=>document.querySelector('#saved')?.textContent==='已保存');}
  // F1：模拟旧库中已经保存的恶意元数据，确保输出层也防御，而非仅依赖新写入校验。
  {
    const c=await context();
    await c.route('**/api/state',async r=>{const response=await r.fetch();const data=await response.json();const payload='<img src=x onerror="window.__injected=1">';data.domains.skill.en=payload;data.domains.skill.short=payload;await r.fulfill({response,json:data});});
    for(const url of ['/manage.html#d=skill&s=s_english','/starmap.html#d=skill&f=s_english']){
      const p=await page(c,url);assert.equal(await p.locator('#domains img').count(),0);assert.equal(await p.evaluate(()=>window.__injected),undefined);assert.match(await p.locator('#domains').innerText(),/onerror/);await p.close();
    }
    await c.close();passed.push('F1：两页旧库 HTML 元数据安全显示');
  }
  // F2：同一份旧数据只导入一次，后续新编辑不被提示再次导入。
  {
    const c=await context(), initial=await state();
    await c.addInitScript(data=>localStorage.setItem('mynet.data.v3',JSON.stringify(data)),initial.domains);
    const p=await page(c);await p.getByRole('button',{name:'导入旧版编辑',exact:true}).click();
    await p.waitForFunction(()=>Boolean(localStorage.getItem('mynet.data.v3.migration')));
    await p.waitForLoadState('load');await p.reload();await p.locator('[data-f="desc"]').waitFor();
    assert.equal(await p.getByRole('button',{name:'导入旧版编辑',exact:true}).count(),0);
    await p.locator('[data-f="desc"]').fill('导入后的新内容');await p.locator('[data-f="desc"]').press('Tab');await saved(p);
    await p.reload();await p.locator('[data-f="desc"]').waitFor();assert.equal(await p.locator('[data-f="desc"]').inputValue(),'导入后的新内容');assert.equal(await p.getByRole('button',{name:'导入旧版编辑',exact:true}).count(),0);
    await c.close();passed.push('F2：一次性旧数据导入与后续内容保留');
  }
  // F4：change 引起保存时，正在转入的新输入框不得被销毁。
  {
    const c=await context(),p=await page(c);
    await p.route('**/api/state',async r=>{if(r.request().method()==='PUT')await new Promise(resolve=>setTimeout(resolve,500));await r.continue();});
    await p.locator('[data-f="desc"]').fill('连续编辑');await p.locator('#newAttr').click();await p.locator('#newAttr').pressSequentially('new-input-kept');await saved(p);
    assert.equal(await p.locator('#newAttr').inputValue(),'new-input-kept');assert.equal(await p.evaluate(()=>document.activeElement.id),'newAttr');
    await p.locator('[data-f="name"]').fill('英语审核');await p.locator('#newAttr').click();await saved(p);assert.match(await p.locator('#table').innerText(),/英语审核/);assert.equal(await p.evaluate(()=>document.activeElement.id),'newAttr');
    await p.locator('[data-f="desc"]').fill('queued-one');await p.locator('[data-f="fn"]').click();await p.locator('[data-f="fn"]').fill('排队保存');await p.locator('#newAttr').click();await saved(p);
    const e=(await state()).domains.skill.elements.find(e=>e.id==='s_english');assert.equal(e.desc,'queued-one');assert.equal(e.fn,'排队保存');
    await c.close();passed.push('F4：保存不重绘输入框，连续编辑串行提交');
  }
  // F3：冲突保留输入与磁盘草稿，刷新后仍能导出恢复。
  {
    const c=await context(),p=await page(c), external=await state();external.domains.skill.elements.find(e=>e.id==='s_english').desc='其他页面的新内容';await write(external.domains);
    await p.locator('[data-f="desc"]').fill('不能丢的失败编辑');await p.locator('#newAttr').click();await p.waitForFunction(()=>document.querySelector('#saved').textContent.includes('保存失败'));
    assert.equal(await p.locator('[data-f="desc"]').inputValue(),'不能丢的失败编辑');
    const download=p.waitForEvent('download');await p.getByRole('button',{name:'导出未保存草稿'}).click();const artifact=await download;const draft=JSON.parse(readFileSync(await artifact.path(),'utf8'));assert.equal(draft.domains.skill.elements.find(e=>e.id==='s_english').desc,'不能丢的失败编辑');
    await p.reload();await p.getByRole('button',{name:'恢复草稿到编辑器'}).click();assert.equal(await p.locator('[data-f="desc"]').inputValue(),'不能丢的失败编辑');assert.equal((await state()).domains.skill.elements.find(e=>e.id==='s_english').desc,'其他页面的新内容');
    await c.close();passed.push('F3：冲突编辑保留、导出、刷新后恢复且未覆盖他人内容');
  }
  // F5：服务器已提交但响应丢失，重试使用同一请求 ID，不重复增加版本。
  {
    const c=await context(),p=await page(c,'/manage.html#d=skill&s=s_jp_level');
    const current=await state();await write(current.domains);
    await p.locator('#newChild').fill('未提交的升格下级');await p.locator('[data-act="addChild"]').click();
    await p.waitForFunction(()=>document.querySelector('#saved').textContent.includes('保存失败'));
    assert.match(await p.locator('#toasts').innerText(),/等待保存确认/);
    assert.match(await p.locator('#toasts').innerText(),/尚未生效/);
    assert.equal((await state()).domains.skill.elements.find(e=>e.id==='s_jp_level').state,'attr');
    await c.close();passed.push('F7：升格失败明确说明未保存，数据库仍为原属性');
  }
  // F5：服务器已提交但响应丢失，重试使用同一请求 ID，不重复增加版本。
  {
    const c=await context(),p=await page(c), before=(await state()).revision;let dropped=false;
    await p.route('**/api/state',async r=>{if(r.request().method()==='PUT'&&!dropped){dropped=true;await r.fetch();await r.abort('failed');}else await r.continue();});
    await p.locator('[data-f="desc"]').fill('响应丢失重试');await p.locator('#newAttr').click();await saved(p);assert.equal((await state()).revision,before+1);assert.equal(await p.evaluate(()=>document.body.inert),false);
    await c.close();passed.push('F5：提交响应丢失后幂等重试成功，仅增加一个版本');
  }
  // F5：请求持续挂起，两次等待均有边界；页面可继续输入，草稿可导出。
  {
    const c=await context(),p=await page(c);
    await p.route('**/api/state',async r=>{if(r.request().method()==='PUT'){await new Promise(resolve=>setTimeout(resolve,18000));await r.abort().catch(()=>{});}else await r.continue();});
    await p.locator('[data-f="desc"]').fill('超时草稿');await p.locator('#newAttr').click();await p.locator('#newAttr').fill('超时中仍可编辑');
    await p.waitForFunction(()=>document.querySelector('#saved').textContent.includes('保存失败'),{timeout:22000});
    assert.equal(await p.evaluate(()=>document.body.inert),false);assert.equal(await p.locator('[data-f="desc"]').inputValue(),'超时草稿');assert.equal(await p.getByRole('button',{name:'导出未保存草稿'}).count(),1);
    await c.close();passed.push('F5：请求挂起在有限等待后失败，输入和草稿保留');
  }
  // F10：同页 hash 导航实际切换内容。
  {
    const c=await context(),p=await page(c);await p.evaluate(()=>location.hash='d=skill&s=s_csharp');await p.waitForFunction(()=>document.querySelector('[data-f="name"]').value==='C# 开发');
    await p.goto(base+'/starmap.html#d=skill&f=s_english');await p.locator('#domains button').first().waitFor();await p.evaluate(()=>location.hash='d=skill&f=s_csharp&s=s_csharp');await p.waitForFunction(()=>document.querySelector('#hudName').textContent==='C# 开发');
    await c.close();passed.push('F10：两页 hash 导航生效');
  }
  {
    for(const width of [1440,768,375]){
      const c=await browser.newContext({viewport:{width,height:900},hasTouch:width<1000});
      await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
      for(const path of ['/manage.html#d=skill&s=s_english','/starmap.html#d=skill&f=s_english']){
        const p=await page(c,path);const home=p.getByRole('link',{name:'返回首页',exact:true});await home.waitFor({state:'visible'});assert.equal(await home.getAttribute('href'),'/');
        assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${path}`);
        const bounds=await p.evaluate(()=>{const a=document.querySelector('.brand').getBoundingClientRect(),b=document.querySelector('.views').getBoundingClientRect();return {brandRight:a.right,navLeft:b.left}});assert.ok(bounds.brandRight<=bounds.navLeft,`header overlap ${width}`);
        if(path.startsWith('/starmap')){await p.getByRole('button',{name:'拖动：旋转',exact:true}).click();assert.equal(await p.locator('#cameraPan').getAttribute('aria-pressed'),'true');await p.getByRole('button',{name:'放大视图',exact:true}).click();}
        await p.close();
      }
      await c.close();
    }
    passed.push('集成界面：1440/768/375 无横向溢出，独立页头无重叠，首页按钮与触屏视图控件可用');
  }
  console.log(passed.join('\n'));
} finally {
  if(browser)await browser.close();
  if(child.exitCode===null)await new Promise(resolve=>{child.once('exit',resolve);child.kill();});
  rmSync(dir,{recursive:true,force:true});
}
