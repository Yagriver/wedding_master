import {validateFinance} from '../finance-model.mjs';
export async function finance(env,route,body,reply){
  if(route==='/admin/finance/list'){
    const rows=await env.DB.prepare('SELECT id,payload,version,updated_at FROM finances ORDER BY updated_at DESC').bind().all();
    return reply({records:rows.results.map(r=>({id:r.id,version:r.version,updatedAt:r.updated_at,...JSON.parse(r.payload)}))});
  }
  let record;
  try{
    if(typeof body.id!=='string'||!/^[-\w]{1,80}$/.test(body.id)||!Number.isInteger(body.version)||body.version<0)throw new Error();
    if(route!=='/admin/finance/delete')record=validateFinance(body.record);
  }catch{return reply({error:'INVALID'},400);}
  if(route==='/admin/finance/delete'){
    if(body.version<1)return reply({error:'INVALID'},400);
    const result=await env.DB.prepare('DELETE FROM finances WHERE id=? AND version=?').bind(body.id,body.version).run();
    if(result.meta.changes!==1)return reply({error:'CONFLICT'},409);
    return reply({deleted:true});
  }
  const timestamp=new Date().toISOString(),payload=JSON.stringify(record);
  const result=body.version===0?
    await env.DB.prepare('INSERT INTO finances(id,payload,version,updated_at) VALUES(?,?,1,?) ON CONFLICT(id) DO NOTHING').bind(body.id,payload,timestamp).run():
    await env.DB.prepare('UPDATE finances SET payload=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(payload,timestamp,body.id,body.version).run();
  if(result.meta.changes!==1)return reply({error:'CONFLICT'},409);
  return reply({saved:true,version:body.version+1});
}
