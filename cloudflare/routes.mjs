import {validate} from './model.mjs';
const HEADERS={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
export const MAX_BYTES=1_000_000;
const json=(body,status=200)=>Response.json(body,{status,headers:HEADERS});
const fail=(message,status)=>{throw Object.assign(new Error(message),{status});};
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
async function bodyJSON(request){
  const reader=request.body?.getReader();if(!reader)fail('缺少请求体',400);
  const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();fail('星图数据超过 1 MB，请先精简内容',413)}chunks.push(value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{fail('JSON 格式错误',400)}
}
export function createMyNetHandler({authorize,seed,manifest}){
  // All pages, assets and APIs use the host's verified Access identity; no mock bypass in this module.
  return async function handleMyNet(request,env){
    const url=new URL(request.url),path=url.pathname,api=path==='/api/mynet'||path.startsWith('/api/mynet/');
    if(path!=='/mynet'&&!path.startsWith('/mynet/')&&!api)return null;
    try{
      const identity=await authorize(request,env);
      if(!identity?.ownerId)fail('请登录后访问星图',401);
      if(!api){
        if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{...HEADERS,Allow:'GET, HEAD'}});
        if(path==='/mynet'){url.pathname='/mynet/';return Response.redirect(url.toString(),308)}
        const name=path==='/mynet/'?'starmap.html':path.slice('/mynet/'.length),asset=manifest.files.find(f=>f.path===name);
        if(!asset)return json({error:'页面不存在'},404);
        if(!env.STOCKCHECK_ASSETS?.fetch)fail('静态资源未配置',503);
        const target=new URL(request.url);target.pathname='/mynet/'+name;
        const assetRequest=new Request(target,request);assetRequest.headers.delete('If-None-Match');assetRequest.headers.delete('If-Modified-Since');
        const response=await env.STOCKCHECK_ASSETS.fetch(assetRequest);
        const headers=new Headers(response.headers);for(const[k,v]of Object.entries(HEADERS))headers.set(k,v);
        headers.delete('ETag');headers.delete('Content-Length');
        if(asset.csp)headers.set('Content-Security-Policy',asset.csp);
        return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
      }
      const endpoint=path.slice('/api/mynet/'.length);
      if(!['state','revision','export'].includes(endpoint))return json({error:'接口不存在'},404);
      if(request.method!=='GET'&&!(request.method==='PUT'&&endpoint==='state'))return new Response(null,{status:405,headers:{...HEADERS,Allow:endpoint==='state'?'GET, PUT':'GET'}});
      if(!env.mymaindb)fail('星图数据库未配置',503);
      const db=env.mymaindb;
      if(request.method==='GET'){
        const row=await db.prepare(endpoint==='revision'?'SELECT revision,updated_at FROM mynet_state WHERE id=1':'SELECT revision,data,updated_at FROM mynet_state WHERE id=1').first();
        if(!row)fail('星图数据库尚未初始化',503);
        const result={revision:row.revision,updatedAt:row.updated_at};
        if(endpoint!=='revision')result.domains=row.revision===0?seed:JSON.parse(row.data);
        const response=json(result);if(endpoint==='export')response.headers.set('Content-Disposition','attachment; filename="mynet-backup.json"');return response;
      }
      // Mutation requires a real Origin matching the configured public origin (no missing-Origin bypass).
      const expected=new URL(env.PUBLIC_ORIGIN||url.origin).origin;
      if(url.origin!==expected||request.headers.get('Origin')!==expected)fail('保存必须来自本站页面',403);
      if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')||''))fail('需要 JSON 数据',415);
      const body=await bodyJSON(request);
      if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['revision','domains','requestId'].includes(k))||!Number.isSafeInteger(body.revision)||body.revision<0||typeof body.requestId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(body.requestId))fail('请求体、版本或请求标识无效',400);
      validate(body.domains);
      const data=JSON.stringify(body.domains),hash=await digest(JSON.stringify({revision:body.revision,domains:body.domains}));
      const prior=await db.prepare('SELECT digest,revision FROM mynet_requests WHERE id=?').bind(body.requestId).first();
      if(prior){if(prior.digest!==hash)fail('请求标识已用于其他内容',409);return json({revision:prior.revision,replayed:true})}
      const next=body.revision+1,now=new Date().toISOString(),id=body.requestId;
      if(!Number.isSafeInteger(next))fail('版本超出范围',400);
      // One D1 batch is the transaction. Conditional request insertion is the CAS gate.
      const result=await db.batch([
        db.prepare('INSERT INTO mynet_requests(id,digest,revision) SELECT ?,?,revision+1 FROM mynet_state WHERE id=1 AND revision=? AND NOT EXISTS(SELECT 1 FROM mynet_requests WHERE id=?)').bind(id,hash,body.revision,id),
        db.prepare('UPDATE mynet_state SET revision=?,data=?,updated_at=? WHERE id=1 AND revision=? AND EXISTS(SELECT 1 FROM mynet_requests WHERE id=? AND digest=? AND revision=?)').bind(next,data,now,body.revision,id,hash,next),
        db.prepare('INSERT OR IGNORE INTO mynet_snapshots(revision,data,created_at) SELECT revision,data,updated_at FROM mynet_state WHERE id=1 AND revision=? AND EXISTS(SELECT 1 FROM mynet_requests WHERE id=? AND digest=? AND revision=?)').bind(next,id,hash,next),
        db.prepare('DELETE FROM mynet_snapshots WHERE revision<=? AND EXISTS(SELECT 1 FROM mynet_requests WHERE id=? AND digest=? AND revision=?)').bind(next-200,id,hash,next),
        db.prepare('DELETE FROM mynet_requests WHERE revision<=? AND EXISTS(SELECT 1 FROM mynet_requests WHERE id=? AND digest=? AND revision=?)').bind(next-200,id,hash,next),
        db.prepare('SELECT digest,revision FROM mynet_requests WHERE id=?').bind(id)
      ]);
      const saved=result.at(-1).results?.[0];
      if(!saved||saved.digest!==hash)fail('数据已被其他页面更新，请导出草稿并刷新对照',409);
      return json({revision:saved.revision});
    }catch(error){return json({error:error.status?error.message:'星图暂不可用，请确认迁移已应用并检查服务日志'},error.status||503)}
  };
}
