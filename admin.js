import {emptyState, normalize, members, answers, personView, suggestions, linkId, fingerprint} from './guest-model.mjs?v=guests-20261019';
let adminKey='', state=emptyState(), responses=[], version=0, busy=false, dirty=false, tab='invited';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabel=s=>({yes:'Attending',no:'Declined',maybe:'Undecided',awaiting:'Awaiting reply',review:'Response changed',conflict:'Conflicting answers'})[s]||s;
const badge=s=>`<span class="badge ${esc(s)}">${esc(statusLabel(s))}</span>`;
const option=(value,label,selected)=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(label)}</option>`;
const uid=()=>crypto.randomUUID();
const personLabel=p=>`${p.name} · ${state.parties.find(x=>x.id===p.partyId)?.label || ''} (${state.parties.find(x=>x.id===p.partyId)?.group || 'Ungrouped'})`;
const sortedPeople=()=>[...state.people].sort((a,b)=>a.name.localeCompare(b.name));
const views=()=>state.people.map(p=>personView(p,state,responses));
const tableOptions=id=>option('','Unassigned',id)+state.tables.map(t=>option(t.id,t.name,id)).join('');
function ignored(r){return state.ignored.some(i=>i.key===r.key&&i.version===r.version);}
function reviewed(r){const links=state.links.filter(l=>l.responseKey===r.key&&l.responseVersion===r.version);return members(r.response).every(m=>links.some(l=>l.memberId===m.id));}
function needsReview(r){return !ignored(r)&&(!reviewed(r)||state.links.some(l=>l.responseKey===r.key&&personView(state.people.find(p=>p.id===l.personId),state,responses).conflict));}
async function api(route,body={}){
  const r=await fetch(window.RSVP_API_URL.replace(/\/$/,'')+'/admin/guests/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+adminKey},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error(r.status===401?'Administrator key not accepted.':r.status===409?'Planning changed on another device. Refresh before trying again; your changes have not been saved.':r.status===400?'Some details could not be saved. Refresh if a response has changed, then try again.':'Unable to connect. Please try again.');
  return r.json();
}
async function refresh(){const data=await api('list');state=data.state;responses=data.responses;version=data.version;dirty=false;render();}
async function save(change,message='Saved.'){
  if(busy)return false;
  busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);
  const next=structuredClone(state);
  try{change(next);const result=await api('save',{state:next,version});state=next;version=result.version;dirty=false;render();$('status').textContent=message;return true;}
  catch(e){$('status').textContent=e.message;for(const el of document.querySelectorAll('dialog[open] .form-status'))el.textContent=e.message;return false;}
  finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
function render(){
  const rows=views(), awaiting=rows.filter(p=>p.attendance==='awaiting').length;
  $('stats').innerHTML=[[rows.length,'Guest places'],[rows.filter(p=>p.attendance==='yes').length,'Confirmed attending'],[awaiting,'Awaiting reply'],[responses.filter(needsReview).length,'Responses to review'],[rows.filter(p=>p.tentative).length,'Tentative places']].map(([n,s])=>`<div class="stat"><strong>${n}</strong><span>${s}</span></div>`).join('');
  $('review-count').textContent=responses.filter(needsReview).length||'';
  const group=$('group').value,groups=[...new Set(state.parties.map(p=>p.group).filter(Boolean))].sort();
  $('group').innerHTML=option('','All groups',group)+groups.map(g=>option(g,g,group)).join('');
  $('group-names').innerHTML=groups.map(g=>`<option value="${esc(g)}">`).join('');
  renderPeople();renderResponses();renderTables();
}
function visiblePeople(){const q=normalize($('search').value),group=$('group').value,filter=$('attendance').value;return views().filter(p=>(!q||normalize([p.name,p.party?.label,p.party?.group,...p.aliases].join(' ')).includes(q))&&(!group||p.party?.group===group)&&(!filter||(filter==='placeholder'?p.placeholder:filter==='tentative'?p.tentative:p.attendance===filter)));}
function renderPeople(){
  const rows=visiblePeople();$('result-count').textContent=`${rows.length} people · ${new Set(rows.map(p=>p.partyId)).size} parties / families`;
  $('people-rows').innerHTML=rows.map(p=>`<tr><td><strong>${esc(p.name)}</strong>${p.placeholder?'<small>Name to confirm</small>':''}${p.tentative?'<small>Tentative invitation</small>':''}${p.links.length>1?`<small>${p.links.length} linked RSVP entries · counted once</small>`:''}</td><td>${esc(p.party?.label)}${p.party?.room?`<small>Excel label: ${esc(p.party.room)}</small>`:''}</td><td>${esc(p.party?.group||'Ungrouped')}</td><td>${badge(p.attendance)}</td><td>${esc(p.table?.name||'—')}</td><td><button class="button secondary" data-person="${esc(p.id)}">Details</button></td></tr>`).join('')||'<tr><td colspan="6">No guests in this view.</td></tr>';
  document.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>openPerson(b.dataset.person));
}
function responseSummary(r,m){const a=answers(r,m);return `Dietary: ${a.dietary||'None stated'} · Hotel: ${a.hotel||'Not stated'} · Buses (church / venue / return): ${a.church} / ${a.venue} / ${a.return}`;}
function renderResponses(){
  const filter=$('response-filter').value;
  const shown=responses.filter(r=>filter==='all'||(filter==='review'&&needsReview(r))||(filter==='matched'&&reviewed(r)&&!needsReview(r)&&!ignored(r))||(filter==='ignored'&&ignored(r)));
  $('response-cards').innerHTML=shown.map(r=>{
    const index=responses.indexOf(r), links=state.links.filter(l=>l.responseKey===r.key), decline=r.response.attendance==='no';
    const hasChanged=links.some(l=>l.responseVersion!==r.version);
    const conflicts=[...new Set(links.map(l=>l.personId))].map(id=>state.people.find(p=>p.id===id)).filter(p=>personView(p,state,responses).conflict);
    return `<article class="card" data-response="${index}"><div class="toolbar"><div><h3>${esc(r.response.firstName+' '+r.response.surname)}</h3><small class="muted">${esc(new Date(r.updatedAt).toLocaleString())} · Response ${r.version}</small></div>${badge(r.response.attendance)}</div>${hasChanged?'<p class="warning">This response changed after matching. Review and confirm it again.</p>':''}${conflicts.length?`<p class="warning">Answers disagree for ${conflicts.map(p=>`<button class="button secondary" data-conflict="${esc(p.id)}">${esc(p.name)}</button>`).join(' ')}. Open their details to choose which response to use.</p>`:''}
      ${decline?`<p>Select everyone covered by this decline. It can link to several people in your list.</p><label>Find an invited person<input class="decline-search" placeholder="Filter names or parties"></label><div class="decline-list">${sortedPeople().map(p=>`<label class="check" data-label="${esc(normalize(personLabel(p)))}"><input type="checkbox" data-decline="${esc(p.id)}" ${links.some(l=>l.personId===p.id)?'checked':''}>${esc(personLabel(p))}</label>`).join('')}</div><p class="answers">${esc(responseSummary(r.response,members(r.response)[0]))}</p>`:
        members(r.response).map((m,i)=>{const linked=links.find(l=>l.memberId===m.id);const suggested=suggestions(m,state,r.response);return `<div class="match-row"><div><strong>${esc(m.name)}</strong><small>${esc(m.kind)}</small><p class="answers">${esc(responseSummary(r.response,m))}</p></div><div><label>Link to your invitation list<select data-member="${i}">${option('','Choose a person…',linked?.personId)}${sortedPeople().map(p=>option(p.id,personLabel(p),linked?.personId)).join('')}</select></label>${suggested.length?`<p class="suggestion">Possible match${suggested.length>1?'es':''}: ${suggested.map(s=>`<button type="button" class="button secondary" data-suggest="${esc(s.person.id)}" data-slot="${i}">${esc(s.person.name)}</button>`).join(' ')}</p>`:'<p class="suggestion">Choose a partner placeholder manually, or add a new invited guest.</p>'}<button class="button secondary" data-new-member="${i}">Add as new guest</button>${linked?`<small class="muted">Confirmed at response ${linked.responseVersion}</small>`:''}</div></div>`;}).join('')}
      ${r.response.guestNames?`<details><summary>Original names entered</summary><p class="answers">${esc(r.response.guestNames)}</p></details>`:''}${r.response.message?`<p class="answers">Message: ${esc(r.response.message)}</p>`:''}
      <div class="response-actions"><button class="button" data-confirm>Confirm selected matches</button>${links.length?'<button class="button secondary" data-unlink>Undo all matches</button>':''}<button class="button secondary" data-ignore>${ignored(r)?'Return to review':'Set aside'}</button></div><p class="note">Set aside keeps the submission without adding guests. Matched people remain linked until you undo their matches.</p></article>`;
  }).join('')||'<div class="empty">No responses in this view. New replies will appear here.</div>';
  document.querySelectorAll('[data-response]').forEach(card=>{
    const r=responses[Number(card.dataset.response)],ms=members(r.response);
    card.querySelectorAll('select,input').forEach(el=>el.onchange=()=>dirty=true);
    card.querySelector('.decline-search')?.addEventListener('input',e=>card.querySelectorAll('[data-label]').forEach(el=>el.hidden=!el.dataset.label.includes(normalize(e.target.value))));
    card.querySelectorAll('[data-suggest]').forEach(b=>b.onclick=()=>{card.querySelector(`[data-member="${b.dataset.slot}"]`).value=b.dataset.suggest;dirty=true;});
    card.querySelectorAll('[data-new-member]').forEach(b=>b.onclick=()=>openPerson(null,ms[Number(b.dataset.newMember)].name));
    card.querySelectorAll('[data-conflict]').forEach(b=>b.onclick=()=>openPerson(b.dataset.conflict));
    card.querySelector('[data-confirm]').onclick=async()=>{
      const selected=r.response.attendance==='no'?[...card.querySelectorAll('[data-decline]:checked')].map(el=>({personId:el.dataset.decline,member:ms[0]})):[...card.querySelectorAll('[data-member]')].filter(el=>el.value).map(el=>({personId:el.value,member:ms[Number(el.dataset.member)]}));
      if(!selected.length){$('status').textContent='Choose at least one invited person before confirming.';return;}
      await save(next=>{next.links=next.links.filter(l=>l.responseKey!==r.key);for(const {personId,member} of selected)next.links.push({responseKey:r.key,memberId:member.id,personId,responseVersion:r.version,answers:answers(r.response,member)});next.ignored=next.ignored.filter(i=>i.key!==r.key);},'Selected matches confirmed. Each invited person is counted once.');
    };
    card.querySelector('[data-unlink]')?.addEventListener('click',()=>{if(confirm('Undo the links for this response? The original response and invited guests will remain.'))save(next=>{next.links=next.links.filter(l=>l.responseKey!==r.key);},'Matches removed.');});
    card.querySelector('[data-ignore]').onclick=()=>save(next=>{next.ignored=next.ignored.filter(i=>i.key!==r.key);if(!ignored(r))next.ignored.push({key:r.key,version:r.version});},ignored(r)?'Returned to review.':'Response set aside.');
  });
}
function openPerson(id,name=''){
  if(dirty&&!confirm('Discard unsaved selections before opening guest details?'))return;
  dirty=false;
  const p=state.people.find(p=>p.id===id),party=state.parties.find(x=>x.id===p?.partyId),f=$('person-form');f.reset();f.elements.id.value=id||'';
  f.elements.name.value=p?.name||name;f.elements.partyId.innerHTML=option('','Create a new party',p?.partyId)+state.parties.map(x=>option(x.id,`${x.label} (${x.group||'Ungrouped'})`,p?.partyId)).join('');
  for(const field of ['group','room'])f.elements[field].value=party?.[field]||'';
  f.elements.partyLabel.value=party?.label||'';f.elements.partyNotes.value=party?.notes||'';f.elements.notes.value=p?.notes||'';f.elements.kind.value=p?.kind||'unknown';f.elements.placeholder.checked=p?.placeholder||false;f.elements.tentative.checked=p?.tentative||false;f.elements.tableId.innerHTML=tableOptions(p?.tableId||'');
  $('source-note').textContent=p?.source?`Original source: ${p.source}`:'';$('editor-title').textContent=p?'Guest details':'Add invited guest';
  $('merge-section').hidden=!p;$('merge-target').innerHTML=option('','Choose the entry to keep','')+sortedPeople().filter(x=>x.id!==id).map(x=>option(x.id,personLabel(x))).join('');
  const v=p&&personView(p,state,responses);
  $('linked-answers').innerHTML=v?.links.length?`<h3>Linked responses</h3>${v.stale?'<p class="warning">A response changed. Reconfirm its matches in Responses before using these answers.</p>':''}${v.conflict?'<p class="warning">These responses disagree. Select the response to use for this person. Other submissions remain available.</p>':''}${v.links.map((l,i)=>{const r=responses.find(r=>r.key===l.responseKey),m=members(r.response).find(m=>m.id===l.memberId);return `<div class="answer-choice"><strong>${esc(r.response.firstName+' '+r.response.surname)}</strong> ${badge(l.answers.attendance)}<p class="answers">${esc(`Dietary: ${l.answers.dietary || 'None stated'} · Hotel: ${l.answers.hotel || 'Not stated'} · Buses (church / venue / return): ${l.answers.church} / ${l.answers.venue} / ${l.answers.return}`)}</p>${p.placeholder&&m?`<button type="button" class="button secondary" data-adopt="${esc(m.name)}">Use name: ${esc(m.name)}</button>`:''}<button type="button" class="button secondary" data-use-answer="${i}" ${v.stale?'disabled':''}>Use this response</button> <button type="button" class="button secondary" data-remove-link="${i}">Unlink this entry</button></div>`;}).join('')}`:'';
  $('linked-answers').querySelectorAll('[data-adopt]').forEach(b=>b.onclick=()=>{f.elements.name.value=b.dataset.adopt;f.elements.placeholder.checked=false;dirty=true;});
  $('linked-answers').querySelectorAll('[data-use-answer]').forEach(b=>b.onclick=async()=>{if(v.stale)return;if(dirty&&!confirm('Discard unsaved guest edits and select this response?'))return;const link=v.links[Number(b.dataset.useAnswer)];if(await save(next=>{next.people.find(x=>x.id===id).resolution={source:linkId(link),fingerprint:fingerprint(v.links)};},'Response selected for this person.'))openPerson(id);});
  $('linked-answers').querySelectorAll('[data-remove-link]').forEach(b=>b.onclick=async()=>{if(dirty&&!confirm('Discard unsaved guest edits and unlink this entry?'))return;if(await save(next=>{next.links=next.links.filter(l=>linkId(l)!==linkId(v.links[Number(b.dataset.removeLink)]));},'Entry unlinked.'))openPerson(id);});
  f.querySelector('.form-status').textContent='';$('editor').showModal();
}
$('person-form').elements.partyId.onchange=e=>{const party=state.parties.find(p=>p.id===e.target.value);for(const field of ['group','room'])$('person-form').elements[field].value=party?.[field]||'';$('person-form').elements.partyLabel.value=party?.label||'';$('person-form').elements.partyNotes.value=party?.notes||'';};
$('person-form').onsubmit=async e=>{
  e.preventDefault();const f=e.currentTarget,id=f.elements.id.value||uid();
  const ok=await save(next=>{let partyId=f.elements.partyId.value;
    if(!partyId){partyId=uid();next.parties.push({id:partyId,label:f.elements.newParty.value.trim()||f.elements.name.value.trim(),group:'',room:'',notes:'',source:''});}
    const party=next.parties.find(p=>p.id===partyId);party.label=f.elements.partyLabel.value.trim()||party.label;party.group=f.elements.group.value.trim();party.room=f.elements.room.value.trim();party.notes=f.elements.partyNotes.value.trim();
    let p=next.people.find(p=>p.id===id);if(!p){p={id,aliases:[],source:''};next.people.push(p);}
    if(p.name&&p.name!==f.elements.name.value.trim()&&!p.aliases.includes(p.name))p.aliases.push(p.name);
    Object.assign(p,{name:f.elements.name.value.trim(),partyId,kind:f.elements.kind.value,placeholder:f.elements.placeholder.checked,tentative:f.elements.tentative.checked,notes:f.elements.notes.value.trim(),tableId:f.elements.tableId.value});
  },'Guest saved.');if(ok)$('editor').close();
};
$('merge-person').onclick=async()=>{const from=$('person-form').elements.id.value,to=$('merge-target').value;if(!to)return;const source=state.people.find(p=>p.id===from),target=state.people.find(p=>p.id===to);if(!confirm(`Combine ${source.name} into ${target.name}? This removes one invitation place and keeps all response links. The retained entry's group and table take priority.`))return;
  if(await save(next=>{const a=next.people.find(p=>p.id===from),b=next.people.find(p=>p.id===to);b.aliases=[...new Set([...b.aliases,a.name,...a.aliases])].slice(0,20);b.notes=[b.notes,a.notes].filter(Boolean).join('\n').slice(0,2000);b.tableId=b.tableId||a.tableId;delete b.resolution;next.people=next.people.filter(p=>p.id!==from);next.links=next.links.map(l=>l.personId===from?{...l,personId:to}:l).filter((l,i,all)=>all.findIndex(x=>linkId(x)===linkId(l))===i);},'Duplicate invitation entries combined.'))$('editor').close();};
function renderTables(){
  const all=views(),filter=$('seating-filter').value,rows=all.filter(p=>p.attendance!=='no'&&(filter!=='yes'||p.attendance==='yes'));
  const cards=[{id:'',name:'Unassigned'},...state.tables];
  $('seating-board').innerHTML=cards.map(t=>{const seated=all.filter(p=>p.tableId===t.id),visible=rows.filter(p=>p.tableId===t.id),active=seated.filter(p=>p.attendance!=='no'),yes=active.filter(p=>p.attendance==='yes').length;return `<article class="table-card ${t.id&&active.length>t.capacity?'over':''}"><div class="toolbar"><div><h3>${esc(t.name)}</h3><p>${t.id?`${yes} confirmed · ${active.length-yes} provisional / ${t.capacity} seats`:`${active.length} awaiting a table`}</p></div>${t.id?`<button class="button secondary" data-edit-table="${esc(t.id)}">Edit</button>`:''}</div>${t.id&&active.length>t.capacity?`<p class="warning">${active.length-t.capacity} over capacity</p>`:''}${seated.some(p=>p.attendance==='no')?'<p class="warning">A declined guest still has this table assignment. Open their details to clear it.</p>':''}<div class="seat-list">${visible.map(p=>`<div class="seat"><strong>${esc(p.name)}</strong> ${badge(p.attendance)}<small>${esc(p.party?.label)} · ${esc(p.party?.group||'Ungrouped')}${p.tentative?' · Tentative invitation':''}</small><label>Move guest<select data-seat="${esc(p.id)}">${tableOptions(p.tableId)}</select></label></div>`).join('')||'<p>No guests in this view.</p>'}</div><div class="party-move"><label>Move a party ${t.id?'to this table':'to Unassigned'}<select data-party-destination="${esc(t.id)}"><option value="">Choose party…</option>${state.parties.filter(p=>all.some(g=>g.partyId===p.id)).map(p=>option(p.id,`${p.label} (${p.group||'Ungrouped'})`)).join('')}</select></label></div></article>`;}).join('');
  document.querySelectorAll('[data-seat]').forEach(el=>el.onchange=async()=>{const id=el.dataset.seat,tableId=el.value;if(!await save(next=>{next.people.find(p=>p.id===id).tableId=tableId;},'Table assignment saved.'))renderTables();});
  document.querySelectorAll('[data-party-destination]').forEach(el=>el.onchange=async()=>{if(!el.value)return;const partyId=el.value,tableId=el.dataset.partyDestination;if(!await save(next=>{for(const p of next.people)if(p.partyId===partyId&&personView(p,next,responses).attendance!=='no')p.tableId=tableId;},'Party moved together.'))renderTables();});
  document.querySelectorAll('[data-edit-table]').forEach(b=>b.onclick=()=>openTable(b.dataset.editTable));
}
function openTable(id){const t=state.tables.find(t=>t.id===id),f=$('table-form');f.reset();f.elements.id.value=id||'';f.elements.name.value=t?.name||`Table ${state.tables.length+1}`;f.elements.capacity.value=t?.capacity||8;$('remove-table').hidden=!t;f.querySelector('.form-status').textContent='';$('table-editor').showModal();}
$('table-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget;if(await save(next=>{const t={id:f.elements.id.value||uid(),name:f.elements.name.value.trim(),capacity:Number(f.elements.capacity.value)};const index=next.tables.findIndex(x=>x.id===t.id);if(index<0)next.tables.push(t);else next.tables[index]=t;},'Table saved.'))$('table-editor').close();};
$('remove-table').onclick=async()=>{const id=$('table-form').elements.id.value;if(confirm('Remove this table and return its guests to Unassigned?')&&await save(next=>{next.tables=next.tables.filter(t=>t.id!==id);next.people.forEach(p=>{if(p.tableId===id)p.tableId='';});},'Table removed.'))$('table-editor').close();};
function exportCsv(seating=false){const fields=seating?['name','party','group','attendance','table','kind','dietary']:['name','party','group','attendance','table','kind','dietary','hotel','church','venue','return','tentative','placeholder','notes'];const rows=(seating?views():visiblePeople()).map(p=>({...p,party:p.party?.label,group:p.party?.group,table:p.table?.name}));const cell=v=>'"'+String(v??'').replace(/^[\s]*[=+\-@]/,"'$&").replace(/"/g,'""')+'"';const csv='\uFEFF'+[fields,...rows.map(p=>fields.map(f=>p[f]))].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=seating?'wedding-seating.csv':'invitati.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(dirty&&!confirm('Discard the unconfirmed selections on this page?'))return;dirty=false;tab=b.dataset.tab;for(const name of ['invited','responses','tables'])$(name+'-panel').hidden=name!==tab;document.querySelectorAll('[data-tab]').forEach(x=>{if(x===b)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});render();});
for(const id of ['search','group','attendance'])$(id).oninput=renderPeople;$('response-filter').onchange=()=>{if(dirty&&!confirm('Discard unconfirmed selections?'))return;dirty=false;renderResponses();};$('seating-filter').onchange=renderTables;
document.querySelectorAll('dialog').forEach(d=>{const close=()=>{if(!dirty||confirm('Discard unsaved changes?')){d.close();dirty=false;}};d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});d.addEventListener('input',()=>dirty=true);});
$('add-person').onclick=()=>openPerson();$('add-table').onclick=()=>openTable();$('export').onclick=()=>exportCsv();$('export-tables').onclick=()=>exportCsv(true);
$('login-form').onsubmit=async e=>{e.preventDefault();adminKey=$('key').value;$('status').textContent='Loading your guests…';try{await refresh();$('key').value='';$('login').hidden=true;$('dashboard').hidden=false;$('status').textContent='';}catch(e){adminKey='';$('status').textContent=e.message;}};
$('refresh').onclick=async()=>{if(dirty&&!confirm('Discard unsaved changes and refresh?'))return;try{await refresh();$('status').textContent='Up to date.';}catch(e){$('status').textContent=e.message;}};
$('logout').onclick=()=>{if(dirty&&!confirm('Discard unsaved changes and sign out?'))return;adminKey='';state=emptyState();responses=[];version=0;dirty=false;for(const id of ['people-rows','response-cards','seating-board','stats','linked-answers','merge-target','group-names'])$(id).innerHTML='';document.querySelectorAll('dialog').forEach(d=>{d.close();d.querySelector('form').reset();});$('dashboard').hidden=true;$('login').hidden=false;$('status').textContent='Signed out.';};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
if(!window.RSVP_API_URL){$('login-form').hidden=true;$('status').textContent='The guest-management API is not configured.';}
