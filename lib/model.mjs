const keys = ['skill', 'idea', 'res', 'proj'];
export function validate(data) {
  const fail = message => { throw Object.assign(new Error(message), { status: 422 }); };
  if (!data || typeof data !== 'object' || Object.keys(data).sort().join() !== [...keys].sort().join()) fail('必须包含四个既定星域');
  const text = (v, max, required = false) => typeof v === 'string' && v.length <= max && (!required || v.trim().length > 0);
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const fields = (v, allowed) => object(v) && Object.keys(v).every(k => allowed.includes(k));
  const label = (v, max) => text(v, max, true) && !/[<>\u0000-\u001f]/.test(v);
  for (const key of keys) {
    const d = data[key];
    if (!fields(d, ['name','short','en','focus','labels','relColors','elements','relations'])) fail('星域包含未知字段或格式错误');
    if (!d || !Array.isArray(d.elements) || !Array.isArray(d.relations) || d.elements.length > 10000 || d.relations.length > 50000) fail('星域数据格式或数量无效');
    if (!label(d.name, 100) || !label(d.short, 30) || !label(d.en, 30)) fail('星域名称无效');
    if (!fields(d.labels, ['root','node','attr']) || !['root','node','attr'].every(k => label(d.labels[k], 50))) fail('模板名称无效');
    if (!object(d.relColors) || Object.keys(d.relColors).length > 100 || !Object.entries(d.relColors).every(([k,v]) => label(k, 50) && !['__proto__','constructor','prototype'].includes(k) && typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v))) fail('关系类型或颜色无效');
    const elements = new Map();
    for (const e of d.elements) {
      if (!fields(e, ['id','name','parent','state','fn','desc'])) fail('要素包含未知字段或格式错误');
      if (!e || typeof e.id !== 'string' || !/^[a-z][a-z0-9_]{0,99}$/.test(e.id) || elements.has(e.id)) fail('要素标识无效或重复');
      if (!['node','attr'].includes(e.state) || !text(e.name, 200, true) || !text(e.fn, 40) || !text(e.desc, 20000)) fail('要素名称、状态或说明无效');
      if (e.parent !== null && (typeof e.parent !== 'string' || !e.parent)) fail('隶属必须是一个父节点或 null');
      elements.set(e.id, e);
    }
    for (const e of elements.values()) {
      if (e.state === 'attr' && !e.parent) fail('属性必须有所属节点');
      if (e.parent && elements.get(e.parent)?.state !== 'node') fail('隶属父级必须是本星域节点');
      const seen = new Set([e.id]);
      let parent = e.parent;
      while (parent) {
        if (seen.has(parent)) fail('隶属不能成环');
        seen.add(parent); parent = elements.get(parent)?.parent;
      }
    }
    if (d.elements.length && elements.get(d.focus)?.state !== 'node') fail('焦点必须是本星域节点');
    const triples = new Set(), ids = new Set();
    for (const r of d.relations) {
      if (!fields(r, ['id','from','type','to']) || !text(r.from,100,true) || !text(r.to,100,true) || !text(r.type,50,true)) fail('关系包含未知字段或格式错误');
      if (!r || typeof r.id !== 'string' || !/^[a-z][a-z0-9_]{0,99}$/.test(r.id) || ids.has(r.id)) fail('关系标识无效或重复');
      ids.add(r.id);
      if (!elements.has(r.from) || elements.get(r.to)?.state !== 'node' || r.from === r.to) fail('关联起点或目标无效，目标必须先升格');
      if (!Object.hasOwn(d.relColors, r.type)) fail('关系类型不在模板内');
      const triple = JSON.stringify([r.from, r.type, r.to]);
      if (triples.has(triple)) fail('相同关系不能重复');
      triples.add(triple);
    }
  }
  return data;
}
