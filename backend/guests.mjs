import {migratePlans, members, answers, linkId, fingerprint} from '../guest-model.mjs';
const str = (v, max=200, required=false) => {if(typeof v !== 'string' || v.length > max || (required && !v.trim())) throw Error('INVALID'); return v.trim();};
const list = (v, max) => {if(!Array.isArray(v) || v.length > max) throw Error('INVALID'); return v;};
const unique = a => {if(new Set(a.map(x => x.id)).size !== a.length) throw Error('INVALID');};
export function validateState(s, responses) {
  if(!s || typeof s !== 'object') throw Error('INVALID');
  const parties = list(s.parties,1000).map(p => ({id:str(p.id,500,true),label:str(p.label,200,true),group:str(p.group,100),room:str(p.room,80),notes:str(p.notes,2000),source:str(p.source,200)}));
  const tables = list(s.tables,200).map(t => {if(!Number.isInteger(t.capacity) || t.capacity < 1 || t.capacity > 50) throw Error('INVALID');return {id:str(t.id,100,true),name:str(t.name,80,true),capacity:t.capacity};});
  const people = list(s.people,2000).map(p => {
    if(!['adult','child','unknown'].includes(p.kind) || typeof p.placeholder !== 'boolean' || typeof p.tentative !== 'boolean') throw Error('INVALID');
    const person = {id:str(p.id,700,true),name:str(p.name,160,true),aliases:list(p.aliases,20).map(a=>str(a,160,true)),partyId:str(p.partyId,500,true),kind:p.kind,placeholder:p.placeholder,tentative:p.tentative,notes:str(p.notes,2000),tableId:str(p.tableId,100),source:str(p.source,200)};
    if(!parties.some(x=>x.id===person.partyId) || (person.tableId && !tables.some(x=>x.id===person.tableId))) throw Error('INVALID');
    if(p.resolution) person.resolution={source:str(p.resolution.source,1500,true),fingerprint:str(p.resolution.fingerprint,100000,true)};
    return person;
  });
  unique(parties);unique(tables);unique(people);
  const links = list(s.links,4000).map(l => {
    const responseKey=str(l.responseKey,400,true), memberId=str(l.memberId,80,true), personId=str(l.personId,700,true);
    const r=responses.find(r=>r.key===responseKey);
    if(!r || !people.some(p=>p.id===personId) || !Number.isInteger(l.responseVersion) || l.responseVersion<1 || l.responseVersion>r.version) throw Error('INVALID');
    const a=l.answers;
    if(!a || !['yes','no','maybe'].includes(a.attendance) || !['adult','child','unknown'].includes(a.kind)) throw Error('INVALID');
    const saved={attendance:a.attendance,kind:a.kind,dietary:str(a.dietary,1000),hotel:str(a.hotel,200)};
    for(const field of ['church','venue','return']){if(!['yes','no','unknown'].includes(a[field]))throw Error('INVALID');saved[field]=a[field];}
    // Current confirmations are always checked against the original submission.
    if(l.responseVersion===r.version){const m=members(r.response).find(m=>m.id===memberId);if(!m || JSON.stringify(saved)!==JSON.stringify(answers(r.response,m))) throw Error('INVALID');}
    return {responseKey,memberId,personId,responseVersion:l.responseVersion,answers:saved};
  });
  if(new Set(links.map(linkId)).size!==links.length) throw Error('INVALID');
  const assignments = new Map();
  for(const l of links){const key=JSON.stringify([l.responseKey,l.memberId]);const previous=assignments.get(key);if(previous && l.answers.attendance!=='no')throw Error('INVALID');assignments.set(key,l);}
  const ignored=list(s.ignored,2000).map(i=>{const key=str(i.key,400,true);if(!Number.isInteger(i.version)||i.version<1||!responses.some(r=>r.key===key&&r.version>=i.version))throw Error('INVALID');return {key,version:i.version};});
  return {people,parties,tables,links,ignored};
}
export async function guests(env,route,body,reply) {
  const rows=await env.DB.prepare('SELECT lookup_key,payload,version,updated_at FROM responses').bind().all();
  const responses=rows.results.map(r=>({key:r.lookup_key,response:JSON.parse(r.payload),version:r.version,updatedAt:r.updated_at}));
  const row=await env.DB.prepare('SELECT payload,version FROM guest_management WHERE id=1').bind().first();
  const current=row?JSON.parse(row.payload):migratePlans((await env.DB.prepare('SELECT lookup_key,payload,version FROM planning').bind().all()).results);
  if(route==='/admin/guests/list')return reply({state:current,version:row?.version||0,responses});
  if(route!=='/admin/guests/save')return reply({error:'NOT_FOUND'},404);
  if(!Number.isInteger(body.version)||body.version<0)return reply({error:'INVALID'},400);
  if(body.version!==(row?.version||0))return reply({error:'CONFLICT'},409);
  let state;
  try {
    state=validateState(body.state,responses);
    for(const link of state.links){
      const old=current.links.find(l=>linkId(l)===linkId(link));
      // A previously reviewed snapshot can survive a newer response, but cannot be invented or edited.
      if(link.responseVersion!==responses.find(r=>r.key===link.responseKey).version && JSON.stringify(link)!==JSON.stringify(old))throw Error();
    }
    for(const person of state.people)if(person.resolution){
      const links=state.links.filter(l=>l.personId===person.id);
      const old=current.people.find(p=>p.id===person.id)?.resolution;
      if(JSON.stringify(old)!==JSON.stringify(person.resolution) && (person.resolution.fingerprint!==fingerprint(links)||!links.some(l=>linkId(l)===person.resolution.source)))throw Error();
    }
  }catch{return reply({error:'INVALID'},400);}
  const payload=JSON.stringify(state);
  const result=body.version===0?await env.DB.prepare('INSERT INTO guest_management(id,payload,version) VALUES(1,?,1) ON CONFLICT(id) DO NOTHING').bind(payload).run():await env.DB.prepare('UPDATE guest_management SET payload=?,version=version+1 WHERE id=1 AND version=?').bind(payload,body.version).run();
  if(result.meta.changes!==1)return reply({error:'CONFLICT'},409);
  return reply({saved:true,version:body.version+1});
}
