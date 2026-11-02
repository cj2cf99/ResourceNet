/* SQLite 适配：串行提交、有限等待、幂等重试，以及每标签页的失败草稿。 */
(() => {
  const app = window.MyNet;
  const API=document.currentScript?.dataset.apiBase||'/api';
  if (location.protocol === 'file:') { app.ready = Promise.resolve(); return; }
  let cache, revision, queued = Promise.resolve(), pending = 0, draft, generation = 0;
  const copy = value => JSON.parse(JSON.stringify(value));
  const get = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const put = (key,value) => { try { localStorage.setItem(key,value); return true; } catch { return false; } };
  let tab = crypto.randomUUID();
  try { tab = sessionStorage.getItem('mynet.tab') || tab; sessionStorage.setItem('mynet.tab',tab); } catch { /* 内存草稿仍可导出 */ }
  const draftKey = `${app.KEY}.draft.${tab}`, migrationKey = `${app.KEY}.migration`;
  try { draft = JSON.parse(get(draftKey)); } catch { draft = null; }
  function message(text, actions = []) {
    let box = document.getElementById('storageStatus');
    if (!box) {
      box = document.createElement('div'); box.id = 'storageStatus';
      Object.assign(box.style, {position:'fixed',bottom:'16px',left:'16px',zIndex:100,color:'#ffe066',background:'#091321',padding:'12px',border:'1px solid #ffe066',maxWidth:'90vw'});
      box.setAttribute('role','status'); document.body.appendChild(box);
    }
    box.replaceChildren(document.createTextNode(text));
    for (const action of actions) { const button=document.createElement('button'); button.textContent=action.label; button.onclick=action.run; button.style.marginLeft='12px'; box.appendChild(button); }
  }
  function exportDraft() {
    if (!draft) return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));
    const link=document.createElement('a'); link.href=url; link.download='mynet-unsaved-draft.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function draftMessage(text) {
    message(text,[{label:'导出未保存草稿',run:exportDraft},{label:'恢复草稿到编辑器',run:()=>{
      if (!document.getElementById('saved')) { location.href='manage.html'; return; }
      if (!draft?.domains || !Number.isSafeInteger(draft.baseRevision)) return;
      revision=draft.baseRevision;
      dispatchEvent(new CustomEvent('mynet:draft-restored',{detail:copy(draft.domains)}));
    }}]);
  }
  async function request(path=API+'/state',options={}) {
    const response=await fetch(path,{cache:'no-store',...options,signal:AbortSignal.timeout(8000)});
    const result=await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || '保存失败'),{status:response.status});
    return result;
  }
  app.ready=request().then(result=>{cache=result.domains;revision=result.revision;}).catch(error=>{
    message(`无法读取数据：${error.message}`,[{label:'重新载入',run:()=>location.reload()}]); throw error;
  });
  app.load=()=>copy(cache);
  app.hasDraft=()=>Boolean(draft);
  app.save=data=>{
    const snapshot=copy(data), token=++generation;
    for(const d of Object.values(snapshot)) if(!d.elements.some(e=>e.id===d.focus&&e.state==='node')) d.focus=d.elements.find(e=>e.state==='node')?.id||null;
    draft={domains:snapshot,baseRevision:revision,createdAt:new Date().toISOString()};
    if (!put(draftKey,JSON.stringify(draft))) draftMessage('浏览器无法持久化草稿，失败时请立即导出。');
    pending++;
    const job=queued.then(async()=>{
      const body=JSON.stringify({revision,domains:snapshot,requestId:crypto.randomUUID()});
      let result;
      for(let attempt=0;attempt<2;attempt++) {
        try {result=await request(API+'/state',{method:'PUT',headers:{'Content-Type':'application/json'},body});break;}
        catch(error) {if(error.status || attempt===1) throw error;}
      }
      cache=snapshot;revision=result.revision;
      if(token===generation) {draft=null;try{localStorage.removeItem(draftKey)}catch{}document.getElementById('storageStatus')?.remove();}
      return true;
    }).catch(error=>{
      draftMessage(`未保存：${error.message}。更改仍保留为草稿；冲突请导出并对照最新数据整理。`);throw error;
    }).finally(()=>pending--);
    queued=job.catch(()=>{});return job;
  };
  app.reset=async()=>{await app.save(app.defaults());return app.load();};
  addEventListener('beforeunload',event=>{if(draft){event.preventDefault();event.returnValue='';}});
  app.ready.then(async()=>{
    const saved=document.getElementById('saved');
    if(saved){
      saved.textContent='已连接本地数据库';
      const link=document.createElement('a');link.href=API+'/export';link.textContent='导出备份';link.className='btn ghost sm';saved.after(link);
      const reset=document.getElementById('resetData');if(reset)reset.title='恢复数据库初始数据；历史版本受保留数量限制';
      const legacy=get(app.KEY);
      if(legacy){
        const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(legacy))),b=>b.toString(16).padStart(2,'0')).join('');
        if(get(migrationKey)!==digest&&!draft)message('发现尚未导入的浏览器旧数据。导入将替换当前数据库内容。',[{label:'导入旧版编辑',run:async()=>{
          if(!confirm('用本浏览器旧数据替换数据库当前内容？请先导出当前备份。'))return;
          try{await app.save(JSON.parse(legacy));put(migrationKey,digest);location.reload();}catch(error){draftMessage(`导入未完成：${error.message}`);}
        }}]);
      }
    }
    if(draft)draftMessage('发现未保存草稿，可导出或恢复到编辑器；恢复保留旧版本号以防覆盖其他页面更改。');
    setInterval(async()=>{
      if(pending||document.hidden)return;
      try{const result=await request(API+'/revision');if(result.revision!==revision&&!draft)message('另一页面已更新数据。',[{label:'刷新查看',run:()=>location.reload()}]);}catch{/* 下次重试；保存异常单独提示 */}
    },10000);
  }).catch(()=>{});
})();
