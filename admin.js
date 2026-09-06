let adminKey='',households=[],visibleRows=[],editing=null,editingDirty=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').trim().replace(/\s+/g,' ').toLowerCase();
const labelStatus=s=>({yes:'Attending',no:'Declined',maybe:'Undecided',awaiting:'Awaiting response'})[s]||s;
const busLabel=s=>({yes:'Yes',no:'No',unknown:'Undecided'})[s]||'Undecided';
async function api(route,data={}){
  const r=await fetch(window.RSVP_API_URL.replace(/\/$/,'')+'/admin/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+adminKey},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new Error(r.status===401?'Administrator key not accepted.':r.status===409?'Someone changed this household. Close and refresh before editing again.':r.status===400?'Please check the household names and fields.':'Unable to connect. Please try again.');
  return r.json();
}
function guestRows(h){
  const r=h.response,p=h.plan||{},who=r?`${r.firstName} ${r.surname}`:JSON.parse(h.key).join(' ');
  let members=r?.members;
  if(!members?.length)members=r?(r.attendance==='no'&&p.invited?.length?p.invited:Array.from({length:Math.max(1,r.guestCount)},(_,i)=>({id:'legacy-'+i,name:i===0?who:'Name to confirm',kind:'unknown',dietary:i===0?r.dietary:''}))):p.invited||[];
  return members.map(g=>({key:h.key,id:g.id,household:p.label||who,name:g.name,attendance:r?.attendance||'awaiting',kind:g.kind,dietary:g.dietary||'',hotel:r?.hotel||'Not confirmed',church:r?.transport?.church||'unknown',venue:r?.transport?.venue||'unknown',return:r?.transport?.return||'unknown',legacyBus:r?.transport?'':r?.bus||'',group:p.group||'Ungrouped',table:p.tables?.[g.id]||p.tables?.[p.invited?.find(i=>norm(i.name)===norm(g.name))?.id]||'',notes:p.notes||'',message:r?.message||'',legacyNames:r?.members?'':r?.guestNames||'',updated:h.updatedAt||'',unmatched:!p.invited?.length}));
}
function allRows(){return households.flatMap(guestRows);}
function renderList(){
  const rows=allRows();const count=s=>rows.filter(r=>r.attendance===s).length;
  const confirmed=households.reduce((n,h)=>n+(h.response?.attendance==='yes'?h.response.guestCount:0),0);
  $('stats').innerHTML=[[households.reduce((n,h)=>n+(h.plan?.invited?.length||0),0),'On invitation list'],[confirmed,'Confirmed attending'],[count('awaiting'),'Awaiting reply'],[households.filter(h=>h.response?.attendance==='no').length,'Declined households'],[rows.filter(r=>r.attendance==='yes'&&r.kind==='child').length,'Confirmed children'],[rows.filter(r=>r.attendance==='yes'&&r.dietary).length,'Dietary notes']].map(([n,label])=>`<div class="stat"><strong>${n}</strong><span>${label}</span></div>`).join('');
  for(const field of ['group','hotel']){const selected=$(field).value;$(field).innerHTML=`<option value="">All ${field==='group'?'groups':'hotels'}</option>`+[...new Set(rows.map(r=>r[field]))].sort().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');$(field).value=selected;}
  filterRows();
}
function filterRows(){
  const q=norm($('search').value),status=$('attendance').value,group=$('group').value,hotel=$('hotel').value,need=$('needs').value;
  visibleRows=allRows().filter(r=>(!q||norm([r.name,r.household,r.hotel,r.group].join(' ')).includes(q))&&(!status||r.attendance===status)&&(!group||r.group===group)&&(!hotel||r.hotel===hotel)&&(!need||(need==='dietary'&&r.dietary)||(need==='bus'&&[r.church,r.venue,r.return,r.legacyBus].includes('yes'))||(need==='table'&&r.attendance==='yes'&&!r.table)||(need==='unmatched'&&r.unmatched)));
  visibleRows.sort((a,b)=>a.household.localeCompare(b.household)||a.name.localeCompare(b.name));
  $('result-count').textContent=`${visibleRows.length} guest rows · ${new Set(visibleRows.map(r=>r.key)).size} households`;
  $('rows').innerHTML=visibleRows.length?visibleRows.map((r,i)=>`<tr><td>${esc(r.household)}${r.unmatched?'<small>Not on invitation list</small>':''}</td><td>${esc(r.name)}</td><td>${labelStatus(r.attendance)}</td><td>${esc(r.kind)}</td><td>${esc(r.dietary||'—')}</td><td>${esc(r.hotel)}</td><td>${[r.church,r.venue,r.return].map(busLabel).join(' / ')}${r.legacyBus?`<small>Earlier general answer: ${busLabel(r.legacyBus)}</small>`:''}</td><td>${esc(r.group)}</td><td>${esc(r.table||'—')}</td><td><button class="button secondary" data-edit="${i}">Organise</button></td></tr>`).join(''):'<tr><td colspan="10">No guests match this view. Add an invited household to get started.</td></tr>';
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(households.find(h=>h.key===visibleRows[Number(b.dataset.edit)].key)));
}
async function refresh(){const data=await api('list');households=data.households;renderList();}
function openEditor(h){
  editing=h||null;editingDirty=false;const p=h?.plan||{};const form=$('plan-form');form.reset();
  $('new-identity').hidden=!!h;for(const input of $('new-identity').querySelectorAll('input'))input.required=!h;
  for(const field of ['label','group','notes'])form.elements[field].value=p[field]||'';
  $('invited-fields').hidden=false;
  form.elements.invited.required=!h?.response;
  form.elements.invited.value=(p.invited||[]).map(g=>g.name).join('\n');
  $('table-fields').innerHTML=h?'<h3>Table assignments</h3>'+guestRows(h).map((r,i)=>`<label class="table-field">${esc(r.name)}<input data-table="${esc(r.id)}" maxlength="80" value="${esc(r.table)}" aria-label="Table for ${esc(r.name)}"></label>`).join(''):'';
  $('guest-message').textContent=h?.response?`Guest message: ${h.response.message||'—'}${h.response.guestNames&&!h.response.members?'\nOriginal guest names: '+h.response.guestNames:''}`:'';
  $('editor-status').textContent='';$('editor').showModal();
}
function closeEditor(){if(editingDirty&&!confirm('Discard unsaved planning changes?'))return;$('editor').close();editingDirty=false;}
$('plan-form').addEventListener('input',()=>editingDirty=true);
$('close-editor').onclick=closeEditor;
$('editor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
$('plan-form').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget;const existing=editing?.plan||{};
  const key=editing?.key||JSON.stringify([norm(form.elements.firstName.value),norm(form.elements.surname.value)]);
  const names=form.elements.invited.value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(!editing?.response&&(!names.length||names.length>20)){ $('editor-status').textContent='Enter between 1 and 20 invited names.';return;}
  if(names.length>20){$('editor-status').textContent='Maximum 20 invited people per household.';return;}
  const invited=names.map(name=>existing.invited?.find(g=>g.name===name)||{id:crypto.randomUUID(),name,kind:'adult'});
  const tables={...existing.tables};document.querySelectorAll('[data-table]').forEach(el=>tables[el.dataset.table]=el.value);
  $('save-plan').disabled=true;
  try{await api('plan',{key,version:editing?.planVersion||0,plan:{label:form.elements.label.value,group:form.elements.group.value,notes:form.elements.notes.value,invited,tables}});editingDirty=false;$('editor').close();await refresh();$('status').textContent='Planning saved.';}catch(err){$('editor-status').textContent=err.message;}finally{$('save-plan').disabled=false;}
};
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCsv(){
  const kind=$('export-kind').value;
  const fields=kind==='catering'?['household','name','kind','dietary','table']:kind==='transport'?['household','name','hotel','church','venue','return','legacyBus']:['household','name','attendance','kind','dietary','hotel','church','venue','return','legacyBus','group','table','notes','message','legacyNames','updated'];
  const rows=kind==='full'?visibleRows:visibleRows.filter(r=>r.attendance==='yes');
  const csv='\uFEFF'+[fields.map(csvCell).join(','),...rows.map(r=>fields.map(f=>csvCell(r[f])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='guest-list-'+kind+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('login-form').onsubmit=async e=>{e.preventDefault();adminKey=$('key').value;$('status').textContent='Loading…';try{await refresh();$('key').value='';$('login').hidden=true;$('dashboard').hidden=false;$('status').textContent='';}catch(err){adminKey='';$('status').textContent=err.message;}};
$('logout').onclick=()=>{adminKey='';households=[];visibleRows=[];editing=null;$('rows').innerHTML='';$('stats').innerHTML='';$('plan-form').reset();$('guest-message').textContent='';$('table-fields').innerHTML='';$('editor').close();$('dashboard').hidden=true;$('login').hidden=false;$('status').textContent='Signed out.';};
$('refresh').onclick=()=>refresh().then(()=>$('status').textContent='Updated.').catch(e=>$('status').textContent=e.message);
$('add').onclick=()=>openEditor(null);$('export').onclick=exportCsv;
for(const id of ['search','attendance','group','hotel','needs'])$(id).addEventListener('input',filterRows);
window.addEventListener('beforeunload',e=>{if(editingDirty){e.preventDefault();e.returnValue='';}});
if(!window.RSVP_API_URL){$('login-form').hidden=true;$('local-note').textContent='Online management is not connected yet. Use the local preview for now.';}
else if(window.RSVP_API_URL==='/api')$('local-note').textContent='Local planning database. Your administrator key is in WEBSITE_DATA/admin-key.txt, outside the website folder.';
