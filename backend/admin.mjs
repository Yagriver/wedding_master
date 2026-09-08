import {finance} from './finance.mjs';
async function authorized(request,env) {
  if(!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length<24)return false;
  const received=request.headers.get('Authorization')||'';
  const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [a,b]=await Promise.all([digest(received),digest('Bearer '+env.ADMIN_PASSWORD)]);
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export async function admin(request,env,route,body,reply){
  if(!await authorized(request,env))return reply({error:'UNAUTHORIZED'},401);
  if(route.startsWith('/admin/finance/'))return finance(env,route,body,reply);
  if(route==='/admin/list'){
    const responses=await env.DB.prepare('SELECT lookup_key,payload,version,updated_at FROM responses').bind().all();
    const plans=await env.DB.prepare('SELECT lookup_key,payload,version FROM planning').bind().all();
    const households=new Map();
    for(const r of responses.results)households.set(r.lookup_key,{key:r.lookup_key,response:JSON.parse(r.payload),responseVersion:r.version,updatedAt:r.updated_at});
    for(const p of plans.results){const h=households.get(p.lookup_key)||{key:p.lookup_key};Object.assign(h,{plan:JSON.parse(p.payload),planVersion:p.version});households.set(p.lookup_key,h);}
    return reply({households:[...households.values()]});
  }
  if(route==='/admin/plan'){
    const str=(v,max)=>{if(typeof v!=='string'||v.length>max)throw new Error();return v.trim();};
    let p,key;
    try{
      key=str(body.key,400);const parts=JSON.parse(key);if(!Array.isArray(parts)||parts.length!==2||parts.some(x=>typeof x!=='string'||!x||x.length>160))throw new Error();
      if(!Number.isInteger(body.version)||body.version<0)throw new Error();
      p=body.plan;
      if(!p||!Array.isArray(p.invited)||p.invited.length>20||!p.tables||typeof p.tables!=='object'||Array.isArray(p.tables))throw new Error();
      const invited=p.invited.map(g=>({id:str(g.id,80),name:str(g.name,160),kind:['adult','child'].includes(g.kind)?g.kind:'adult'}));
      if(invited.some(g=>!g.id||!g.name)||new Set(invited.map(g=>g.id)).size!==invited.length)throw new Error();
      if(Object.keys(p.tables).length>50)throw new Error();
      const tables=Object.fromEntries(Object.entries(p.tables).map(([id,v])=>[str(id,80),str(v,80)]));
      p={label:str(p.label,160),group:str(p.group,100),notes:str(p.notes,2000),invited,tables};
    }catch{return reply({error:'INVALID'},400);}
    const payload=JSON.stringify(p);
    const result=body.version===0?
      await env.DB.prepare('INSERT INTO planning(lookup_key,payload,version) VALUES(?,?,1) ON CONFLICT(lookup_key) DO NOTHING').bind(key,payload).run():
      await env.DB.prepare('UPDATE planning SET payload=?,version=version+1 WHERE lookup_key=? AND version=?').bind(payload,key,body.version).run();
    if(result.meta.changes!==1)return reply({error:'CONFLICT'},409);
    return reply({saved:true,version:body.version+1});
  }
  return reply({error:'NOT_FOUND'},404);
}
