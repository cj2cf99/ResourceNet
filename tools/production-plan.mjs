import {isDeepStrictEqual as same} from 'node:util';
export function assertAppendOnly(before,after){
 if(!same(Object.keys(before).sort(),Object.keys(after).sort()))throw Error('Domain drift');
 for(const [key,d]of Object.entries(before)){const a=after[key];for(const field of Object.keys(d).filter(x=>!['elements','relations'].includes(x)))if(!same(d[field],a[field]))throw Error('Metadata drift');for(const field of ['elements','relations'])if(!same(a[field].slice(0,d[field].length),d[field]))throw Error('Old record changed');}
}
export function planProductionImport({row,snapshots,requests,before,after,now}){
 assertAppendOnly(before,after);
 if(!row||row.id!==1||!Number.isSafeInteger(row.revision)||row.revision<0)throw Error('Invalid state');
 if(row.revision===0){if(row.data!==null||snapshots.length||requests.length)throw Error('Initial state drift');}
 else if(!same(JSON.parse(row.data),before))throw Error('Production content drift');
 if(row.revision>=Number.MAX_SAFE_INTEGER)throw Error('Revision overflow');
 const revision=row.revision+1,data=JSON.stringify(after),id='release_20261103_mynet_ai';
 if(requests.some(r=>r.id===id)||snapshots.some(r=>r.revision===revision))throw Error('Already applied/conflict');
 const guard=(condition,params=[])=>({sql:'SELECT CASE WHEN ('+condition+") THEN 1 ELSE json('precondition_failed') END AS ok;",params});
 const tables={mynet_state:[row],mynet_snapshots:snapshots,mynet_requests:requests};const guards=[];
 for(const [table,rows]of Object.entries(tables)){guards.push(guard('(SELECT count(*) FROM '+table+')=?',[rows.length]));for(const r of rows)guards.push(guard('EXISTS(SELECT 1 FROM '+table+' WHERE '+Object.keys(r).map(k=>k+' IS ?').join(' AND ')+')',Object.values(r)));}
 const newState={id:1,revision,data,updated_at:now};const snapshot={revision,data,created_at:now};
 const statements=[...guards,{sql:'UPDATE mynet_state SET revision=?,data=?,updated_at=? WHERE id=1 AND revision=?;',params:[revision,data,now,row.revision]},{sql:'INSERT INTO mynet_snapshots(revision,data,created_at) VALUES(?,?,?);',params:[revision,data,now]}];
 return {guards,statements,expectations:[{table:'mynet_state',row:newState},...snapshots.map(row=>({table:'mynet_snapshots',row})),{table:'mynet_snapshots',row:snapshot},...requests.map(row=>({table:'mynet_requests',row}))],expectedCounts:{mynet_state:1,mynet_snapshots:snapshots.length+1,mynet_requests:requests.length},revision};
}
