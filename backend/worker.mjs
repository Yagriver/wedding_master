// Name-only access is intentional: this is lookup, not identity verification.
export const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
function text(value, max, required=false) {
  if(typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('INVALID');
  return value.trim();
}
export function identity(body) {
  const firstName=text(body.firstName,80,true), surname=text(body.surname,80,true);
  return {firstName,surname,key:JSON.stringify([normalize(firstName),normalize(surname)])};
}
export function validate(body) {
  const who=identity(body);
  if(!['yes','no','maybe'].includes(body.attendance)) throw new Error('INVALID');
  if(!['yes','no','unknown'].includes(body.bus)) throw new Error('INVALID');
  if(!Number.isInteger(body.guestCount) || body.guestCount<0 || body.guestCount>20) throw new Error('INVALID');
  if(body.attendance==='yes' && body.guestCount<1) throw new Error('INVALID');
  if(body.attendance==='no' && body.guestCount!==0) throw new Error('INVALID');
  return {firstName:who.firstName,surname:who.surname,attendance:body.attendance,guestCount:body.guestCount,
    guestNames:text(body.guestNames,1000),hotel:text(body.hotel,200),dietary:text(body.dietary,1000),
    bus:body.bus,message:text(body.message,1000)};
}
export async function handle(request,env) {
  const origin=request.headers.get('Origin');
  const allowed=(env.ALLOWED_ORIGINS||'https://yagriver.github.io').split(',');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(origin && !allowed.includes(origin)) return new Response(JSON.stringify({error:'ORIGIN'}),{status:403,headers});
  if(origin) Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers});
  const route=new URL(request.url).pathname.replace(/^\/api/,'');
  if(!['/lookup','/save'].includes(route)) return reply({error:'NOT_FOUND'},404);
  if(request.method!=='POST') return reply({error:'METHOD'},405);
  if(!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({error:'INVALID'},415);
  try {
    if(Number(request.headers.get('Content-Length'))>12000) return reply({error:'INVALID'},413);
    const raw=await request.text();
    if(raw.length>12000) return reply({error:'INVALID'},413);
    let body; try {body=JSON.parse(raw);} catch {return reply({error:'INVALID'},400);}
    if(!body || typeof body!=='object' || Array.isArray(body)) return reply({error:'INVALID'},400);
    let who; try {who=identity(body);} catch {return reply({error:'INVALID'},400);}
    if(route==='/lookup') {
      const row=await env.DB.prepare('SELECT payload, version FROM responses WHERE lookup_key = ?').bind(who.key).first();
      return reply(row?{found:true,data:JSON.parse(row.payload),version:row.version}:{found:false});
    }
    let data; try {data=validate(body);if(!Number.isInteger(body.version)||body.version<0)throw new Error();} catch {return reply({error:'INVALID'},400);}
    const updated=new Date().toISOString();
    let result;
    if(body.version===0) result=await env.DB.prepare('INSERT INTO responses (lookup_key,payload,version,updated_at) VALUES (?,?,1,?) ON CONFLICT(lookup_key) DO NOTHING').bind(who.key,JSON.stringify(data),updated).run();
    else result=await env.DB.prepare('UPDATE responses SET payload=?, version=version+1, updated_at=? WHERE lookup_key=? AND version=?').bind(JSON.stringify(data),updated,who.key,body.version).run();
    if(result.meta.changes!==1) return reply({error:'CONFLICT'},409);
    return reply({saved:true,data,version:body.version+1});
  } catch {
    // Never log submitted names or answers.
    return reply({error:'UNAVAILABLE'},503);
  }
}
export default {fetch:handle};
