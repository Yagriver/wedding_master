import {cents,paymentSplit,lineTotals,totals,dueAmount,validateFinance} from './finance-model.mjs';
const $=id=>document.getElementById(id),form=$('finance-form');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(n/100);
const decimal=n=>(n/100).toFixed(2),today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
let key='',records=[],editing=null,dirty=false,saving=false;
let calendarMonth=today().slice(0,7),calendarSelected=today();
function renderCalendar(){
  const events=new Map();
  const add=(date,event)=>{if(!events.has(date))events.set(date,[]);events.get(date).push(event);};
  for(const r of records){
    if(['contracted','completed'].includes(r.status))for(const m of r.milestones){const amount=dueAmount(r,m);if(amount>0)add(m.date,{kind:'deadline',text:`Deadline · ${r.supplier} · ${m.label} · ${money(amount)} unpaid`});}
    for(const p of r.payments)if(p.kind==='payment')add(p.date,{kind:'paid',text:`Payment made · ${r.supplier} · ${money(p.amount)}${p.reference?' · '+p.reference:''}`});
  }
  const [year,month]=calendarMonth.split('-').map(Number),first=new Date(year,month-1,1);
  $('calendar-month').textContent=first.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const offset=(first.getDay()+6)%7,count=new Date(year,month,0).getDate();
  let html=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span class="weekday">${d}</span>`).join('');
  html+='<span aria-hidden="true"></span>'.repeat(offset);
  for(let day=1;day<=count;day++){
    const date=`${calendarMonth}-${String(day).padStart(2,'0')}`,items=events.get(date)||[],deadline=items.some(e=>e.kind==='deadline'),paid=items.some(e=>e.kind==='paid');
    html+=`<button type="button" data-date="${date}" class="calendar-day${deadline?' has-deadline':''}${paid?' has-paid':''}" aria-label="${date}${deadline?', unpaid deadline':''}${paid?', payment made':''}" aria-pressed="${date===calendarSelected}" ${date===today()?'aria-current="date"':''}><span>${day}</span><span class="day-markers" aria-hidden="true">${deadline?'<i class="deadline-dot"></i>':''}${paid?'<i class="paid-dot"></i>':''}</span></button>`;
  }
  $('calendar-days').innerHTML=html;
  $('calendar-days').querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{calendarSelected=b.dataset.date;renderCalendar();$('calendar-days').querySelector(`[data-date="${calendarSelected}"]`).focus();});
  const selected=events.get(calendarSelected)||[];
  $('calendar-events').innerHTML=`<h3>${esc(calendarSelected)}</h3>`+(selected.length?selected.map(e=>`<p class="${e.kind}-label">${esc(e.text)}</p>`).join(''):'<p>No unpaid deadlines or payments on this day.</p>');
}
function moveCalendar(delta){const [year,month]=calendarMonth.split('-').map(Number),d=new Date(year,month-1+delta,1);calendarMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;calendarSelected=calendarMonth+'-01';renderCalendar();}
$('calendar-prev').onclick=()=>moveCalendar(-1);
$('calendar-next').onclick=()=>moveCalendar(1);
$('calendar-today').onclick=()=>{calendarSelected=today();calendarMonth=calendarSelected.slice(0,7);renderCalendar();};
async function api(route,body={}){const r=await fetch(window.RSVP_API_URL.replace(/\/$/,'')+'/admin/finance/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(r.status===409?'This record changed on another device. Copy your changes, close this editor, and refresh before trying again.':r.status===401?'Administrator key not accepted.':r.status===400?'Check the fields, dates and amounts.':r.status===413?'This record is too large. Shorten the notes or split it into separate quotes.':'Finance storage is unavailable. Check the connection and that the finance migration has been applied.');return r.json();}
function render(){
  renderCalendar();
  const accepted=records.filter(r=>['contracted','completed'].includes(r.status));
  const total=accepted.reduce((a,r)=>{const t=totals(r);a.net+=t.net;a.tax+=t.tax;a.total+=t.total;a.balance+=Math.max(0,t.balance);a.netBalance+=Math.max(0,t.netBalance);a.taxBalance+=Math.max(0,t.taxBalance);return a;},{net:0,tax:0,total:0,balance:0,netBalance:0,taxBalance:0});
  const paid=records.reduce((n,r)=>n+totals(r).paid,0);
  const netPaid=records.reduce((n,r)=>n+totals(r).netPaid,0),taxPaid=records.reduce((n,r)=>n+totals(r).taxPaid,0);
  const unallocated=records.reduce((n,r)=>n+totals(r).unallocatedCount,0);
  $('allocation-note').textContent=unallocated?`${unallocated} payment/refund entries still need a net / IVA split. They count toward total paid, but are excluded from net paid and IVA paid. Component balances are provisional until allocated.`:'';
  $('stats').innerHTML=[
    ['committed','Committed including IVA',total.total,total.net,total.tax],
    ['paid','Total paid',paid,netPaid,taxPaid],
    ['outstanding','Outstanding including IVA',total.balance,total.netBalance,total.taxBalance]
  ].map(([style,label,amount,net,tax])=>`<div class="finance-card ${style}"><h2>${label}</h2><strong>${money(amount)}</strong><div class="card-details"><span>Before IVA <b>${money(net)}</b></span><span>IVA <b>${money(tax)}</b></span></div></div>`).join('');
  const due=accepted.flatMap(r=>r.milestones.map(m=>({r,m,amount:dueAmount(r,m)}))).filter(x=>x.amount>0).sort((a,b)=>a.m.date.localeCompare(b.m.date));
  $('upcoming').innerHTML=due.length?due.map(({r,m,amount})=>`<p class="${m.date<today()?'overdue':''}">${esc(m.date)} · ${esc(r.supplier)} · ${esc(m.label)} · ${money(amount)}${m.date<today()?' — overdue':''}</p>`).join(''):'<p>No unpaid deadlines on accepted contracts.</p>';
  const q=$('search').value.toLowerCase(),status=$('filter').value;
  const visible=records.filter(r=>(!status||r.status===status)&&[r.supplier,r.title,r.category,r.reference].join(' ').toLowerCase().includes(q));
  $('rows').innerHTML=visible.length?visible.map(r=>{const t=totals(r);return `<tr><td>${esc(r.supplier)}<small>${esc(r.title)} · ${esc(r.category)}</small><small>${esc(r.reference)}</small></td><td>${esc(r.status)}</td><td>${money(t.net)}</td><td>${money(t.tax)}</td><td>${money(t.total)}</td><td>${money(t.paid)}<small>Net ${money(t.netPaid)} · IVA ${money(t.taxPaid)}</small>${t.unallocatedCount?`<small>Split pending: ${money(t.unallocatedPaid)} (${t.unallocatedCount} entries)</small>`:''}</td><td><small>Net ${money(t.netBalance)} · IVA ${money(t.taxBalance)}${t.unallocatedCount?' (provisional)':''}</small>${money(Math.abs(t.balance))}${t.balance<0?' credit':r.status==='quote'?' estimated':''}</td><td><button class="button secondary" data-edit="${esc(r.id)}">Manage</button></td></tr>`;}).join(''):'<tr><td colspan="8">No records yet or no matching results. Add a quote to get started.</td></tr>';
  $('rows').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>open(records.find(r=>r.id===b.dataset.edit)));
}
async function refresh(){const data=await api('list');records=data.records;render();}
const input=(label,field,value='',type='text',extra='')=>`<label>${label}<input data-field="${field}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const select=(label,field,value,options)=>`<label>${label}<select data-field="${field}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
function append(container,html,id=''){
  const el=document.createElement('div');el.className='entry';el.dataset.id=id;el.innerHTML=html+'<button type="button" class="button secondary remove">Remove</button>';
  el.querySelector('.remove').onclick=()=>{if(saving)return;if(container==='milestones'&&[...$('payments').children].some(p=>p.querySelector('[data-field="milestone"]').value===id)){$('editor-status').textContent='Reassign linked payments before removing this deadline.';return;}if(!confirm('Remove this entry? This takes effect when you save.'))return;el.remove();dirty=true;updateMilestones();preview();};
  $(container).append(el);
}
function addLine(l={description:'',amount:0,basis:'net',rate:'',taxNote:''}){append('lines',input('Description','description',l.description,'text','required maxlength="200"')+input('Item amount (EUR)','amount',decimal(l.amount),'number','required min="0" max="99999999.99" step="0.01"')+select('Amount is','basis',l.basis,[['net','Before IVA'],['gross','Including IVA']])+input('IVA rate (%)','rate',l.rate===''?'':decimal(l.rate),'number','required min="0" max="100" step="0.01"')+input('Tax note / exemption reason','taxNote',l.taxNote,'text','maxlength="200"'));}
function addMilestone(m={id:crypto.randomUUID(),label:'',date:'',amount:0}){append('milestones',input('Deadline label','label',m.label,'text','required maxlength="160"')+input('Due date','date',m.date,'date','required')+input('Amount incl. IVA (EUR)','amount',decimal(m.amount),'number','required min="0" max="99999999.99" step="0.01"'),m.id);updateMilestones();}
function milestoneOptions(){return [['','Unassigned'],...[...$('milestones').children].map(el=>[el.dataset.id,el.querySelector('[data-field="label"]').value||'Untitled deadline'])];}
function updateMilestones(){for(const el of $('payments').querySelectorAll('[data-field="milestone"]')){const value=el.value;el.innerHTML=milestoneOptions().map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');el.value=value;}}
function addPayment(p={date:today(),amount:0,kind:'payment',method:'',reference:'',milestone:''}){
  const existing=Object.hasOwn(p,'netAmount')||p.amount>0;
  const mode=p.paymentMode||(existing?'legacy':'with');
  const rates=[...new Set([...$('lines').querySelectorAll('[data-field="rate"]')].map(el=>el.value).filter(v=>v!==''))];
  const rate=p.ivaRate!==undefined?decimal(p.ivaRate):rates.length===1?rates[0]:'';
  append('payments',select('Type','kind',p.kind,[['payment','Payment'],['refund','Refund received']])+input('Date paid / refunded','date',p.date,'date','required')+
    input('Amount actually paid / refunded (EUR)','amount',decimal(p.amount),'number','required min="0.01" max="99999999.99" step="0.01"')+
    select('Payment includes','paymentMode',mode,[['with','With IVA (included in amount)'],['without','Without IVA (net only)'],...(existing?[['legacy','Keep existing allocation']]:[])])+
    input('IVA rate (%)','ivaRate',rate,'number','min="0" max="100" step="0.01"')+
    '<p class="payment-breakdown" aria-live="polite"></p>'+
    select('Applies to deadline','milestone',p.milestone,milestoneOptions())+input('Payment method','method',p.method,'text','maxlength="80" placeholder="Bank transfer, card, cash…"')+input('Receipt / invoice / bank reference','reference',p.reference,'text','maxlength="200"'));
  $('payments').lastElementChild.dataset.original=JSON.stringify(p);
  updatePaymentControls();
}
function updatePaymentControls(){
  for(const el of $('payments').children){
    const mode=el.querySelector('[data-field="paymentMode"]').value;
    const rate=el.querySelector('[data-field="ivaRate"]');
    rate.required=mode==='with';rate.disabled=mode!=='with';rate.closest('label').hidden=mode!=='with';
    el.querySelector('[data-field="amount"]').readOnly=mode==='legacy';
  }
}
function entries(id){return [...$(id).children].map(el=>{
  const row=Object.fromEntries([...el.querySelectorAll('[data-field]')].map(i=>[i.dataset.field,i.value]));
  if(el.dataset.id)row.id=el.dataset.id;
  row.amount=cents(row.amount);
  if(id==='payments'){
    if(row.paymentMode==='legacy'){
      const original=JSON.parse(el.dataset.original);row.amount=original.amount;
      el.querySelector('[data-field="amount"]').value=decimal(row.amount);
      if(original.netAmount!==undefined){row.netAmount=original.netAmount;row.taxAmount=original.taxAmount;}
      delete row.paymentMode;delete row.ivaRate;
    }else{
      row.ivaRate=row.paymentMode==='with'?cents(row.ivaRate):0;
      Object.assign(row,paymentSplit(row.amount,row.paymentMode,row.ivaRate));
    }
    el.querySelector('.payment-breakdown').textContent=row.netAmount===undefined?'Existing payment: allocation pending. Choose with or without IVA to calculate it.':`Net ${money(row.netAmount)} · IVA ${money(row.taxAmount)} · Total ${money(row.amount)}`;
  }
  if(id==='lines')row.rate=cents(row.rate);
  return row;
});}
function collect(){return {...Object.fromEntries(['supplier','title','category','status','reference','quoteDate','document','notes'].map(n=>[n,form.elements[n].value])),currency:'EUR',lines:entries('lines'),milestones:entries('milestones'),payments:entries('payments')};}
function preview(){try{const r=collect(),t=totals(r),scheduled=r.milestones.reduce((n,m)=>n+m.amount,0);$('totals').textContent=`Net ${money(t.net)} · IVA ${money(t.tax)} · Total ${money(t.total)} · Net paid ${money(t.netPaid)} / remaining ${money(t.netBalance)} · IVA paid ${money(t.taxPaid)} / remaining ${money(t.taxBalance)} · Total paid ${money(t.paid)} · ${t.balance<0?'Credit':'Balance'} ${money(Math.abs(t.balance))}${t.unallocatedCount?' · Split pending: component balances are provisional.':''}`+(scheduled>t.total?' · Deadlines exceed the quote total.':'');}catch{$('totals').textContent='Enter valid amounts to calculate totals.';}}
function open(r){editing=r?structuredClone(r):{id:crypto.randomUUID(),version:0};form.reset();for(const n of ['supplier','title','category','status','reference','quoteDate','document','notes'])form.elements[n].value=r?.[n]||(n==='status'?'quote':'');for(const id of ['lines','milestones','payments'])$(id).innerHTML='';(r?.lines||[{description:'',amount:0,basis:'net',rate:'',taxNote:''}]).forEach(addLine);(r?.milestones||[]).forEach(addMilestone);(r?.payments||[]).forEach(addPayment);dirty=false;$('delete-record').hidden=!r;$('editor-status').textContent='';preview();$('editor').showModal();}
function close(){if(saving)return;if(dirty&&!confirm('Discard unsaved finance changes?'))return;dirty=false;$('editor').close();}
form.addEventListener('input',e=>{dirty=true;updatePaymentControls();if(e.target.dataset.field==='label')updateMilestones();preview();});
$('delete-record').onclick=async()=>{
  if(saving||!editing?.version)return;
  if(!confirm(`Permanently delete "${editing.title}" from ${editing.supplier}? This also removes its payments, deadlines and notes. This cannot be undone.`))return;
  saving=true;const controls=[...form.querySelectorAll('input,select,textarea,button')];controls.forEach(el=>el.disabled=true);
  try{
    await api('delete',{id:editing.id,version:editing.version});
    records=records.filter(r=>r.id!==editing.id);dirty=false;editing=null;$('editor').close();render();$('status').textContent='Quote / contract deleted.';
  }catch(err){$('editor-status').textContent=err.message;}
  finally{saving=false;controls.forEach(el=>el.disabled=false);updatePaymentControls();}
};
$('close').onclick=close;$('editor').addEventListener('cancel',e=>{e.preventDefault();close();});
for(const [id,fn] of [['add-line',addLine],['add-milestone',addMilestone],['add-payment',addPayment]])$(id).onclick=()=>{fn();dirty=true;preview();};
form.onsubmit=async e=>{e.preventDefault();if(saving)return;let record;try{record=validateFinance(collect());}catch{$('editor-status').textContent='Complete required fields and check amounts, dates, IVA rates and document URL (http or https).';return;}saving=true;const controls=[...form.querySelectorAll('input,select,textarea,button')];controls.forEach(el=>el.disabled=true);try{await api('save',{id:editing.id,version:editing.version,record});dirty=false;$('editor').close();$('status').textContent='Finance record saved.';try{await refresh();}catch{$('status').textContent='Saved successfully. Refresh to reload the latest list.';}}catch(err){$('editor-status').textContent=err.message;}finally{saving=false;controls.forEach(el=>el.disabled=false);updatePaymentControls();}};
$('login-form').onsubmit=async e=>{e.preventDefault();key=$('key').value;$('status').textContent='Loading finances…';try{await refresh();$('key').value='';$('login').hidden=true;$('dashboard').hidden=false;$('status').textContent='';}catch(err){key='';$('status').textContent=err.message;}};
$('logout').onclick=()=>{key='';records=[];editing=null;dirty=false;calendarSelected=today();calendarMonth=calendarSelected.slice(0,7);form.reset();for(const id of ['rows','stats','upcoming','calendar-days','calendar-events','calendar-month','lines','payments','milestones','totals','editor-status','allocation-note'])$(id).innerHTML='';$('editor').close();$('dashboard').hidden=true;$('login').hidden=false;$('status').textContent='Signed out.';};
$('add').onclick=()=>open();$('refresh').onclick=()=>refresh().then(()=>$('status').textContent='Updated.').catch(e=>$('status').textContent=e.message);$('search').oninput=render;$('filter').onchange=render;
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function csv(name,fields,rows){const cell=v=>'"'+(/^[\s]*[=+\-@]/.test(String(v??''))?"'":'')+String(v??'').replace(/"/g,'""')+'"';const data='\uFEFF'+[fields,...rows].map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>{
  if($('export-kind').value==='contracts')csv('wedding-contracts',['ID','Supplier','Title','Category','Status','Currency','Reference','Quote date','Net','IVA','Total','Paid','Balance','Net paid','IVA paid','Net balance','IVA balance','Unallocated paid','Unallocated entries','Document','Notes'],records.map(r=>{const t=totals(r);return [r.id,r.supplier,r.title,r.category,r.status,'EUR',r.reference,r.quoteDate,...['net','tax','total','paid','balance','netPaid','taxPaid','netBalance','taxBalance','unallocatedPaid'].map(k=>decimal(t[k])),t.unallocatedCount,r.document,r.notes];}));
  if($('export-kind').value==='items')csv('wedding-quote-items',['Contract ID','Supplier','Description','Input amount','Basis','IVA %','Net','IVA','Total','Tax note'],records.flatMap(r=>r.lines.map(l=>{const t=lineTotals(l);return [r.id,r.supplier,l.description,decimal(l.amount),l.basis,decimal(l.rate),decimal(t.net),decimal(t.tax),decimal(t.total),l.taxNote];})));
  if($('export-kind').value==='payments')csv('wedding-payments',['Contract ID','Supplier','Date','Type','Amount EUR','Net EUR','IVA EUR','Allocation','Payment IVA mode','Payment IVA rate %','Method','Reference','Deadline'],records.flatMap(r=>r.payments.map(p=>[r.id,r.supplier,p.date,p.kind,decimal(p.amount),p.netAmount===undefined?'':decimal(p.netAmount),p.taxAmount===undefined?'':decimal(p.taxAmount),p.netAmount===undefined?'Split pending':'Allocated',p.paymentMode||'Legacy',p.ivaRate===undefined?'':decimal(p.ivaRate),p.method,p.reference,r.milestones.find(m=>m.id===p.milestone)?.label||'Unassigned'])));
  if($('export-kind').value==='deadlines')csv('wedding-deadlines',['Contract ID','Supplier','Label','Date','Amount EUR','Unpaid EUR'],records.flatMap(r=>r.milestones.map(m=>[r.id,r.supplier,m.label,m.date,decimal(m.amount),decimal(dueAmount(r,m))])));
};
if(!window.RSVP_API_URL){$('login-form').hidden=true;$('status').textContent='The management API is not configured.';}
