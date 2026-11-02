import {DatabaseSync} from 'node:sqlite';
export function openD1(){
  const sqlite=new DatabaseSync(':memory:');
  const prepare=(sql,args=[])=>({sql,args,bind(...values){if(values.length>100)throw Error('D1 参数上限');return prepare(sql,values)},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return {results:sqlite.prepare(sql).all(...args)}},async run(){return {meta:sqlite.prepare(sql).run(...args)}}});
  return {sqlite,prepare,async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const out=statements.map(s=>{const p=sqlite.prepare(s.sql);return p.columns().length?{results:p.all(...s.args)}:{results:[],meta:p.run(...s.args)}});sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}},close(){sqlite.close()}};
}
