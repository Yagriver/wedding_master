const memberCopy={
  en:{person:'Guest',name:'Full name',kind:'Adult or child',adult:'Adult',child:'Child',diet:'Dietary needs (optional)',church:'Bus: hotel → church',venue:'Bus: church → venue',return:'Bus: night return',legacy:'Earlier guest names (please place each person below): '},
  es:{person:'Invitado',name:'Nombre completo',kind:'Adulto o niño',adult:'Adulto',child:'Niño',diet:'Necesidades alimentarias (opcional)',church:'Autobús: hotel → iglesia',venue:'Autobús: iglesia → villa',return:'Autobús: regreso nocturno',legacy:'Nombres anteriores (añade cada persona abajo): '},
  it:{person:'Invitato',name:'Nome completo',kind:'Adulto o bambino',adult:'Adulto',child:'Bambino',diet:'Esigenze alimentari (facoltativo)',church:'Autobus: hotel → chiesa',venue:'Autobus: chiesa → villa',return:'Autobus: rientro notturno',legacy:'Nomi precedenti (inserisci ogni persona qui sotto): '}
};
function ensureMembers(){
  const d=rsvpState.data;d.members??=[];d.transport??={church:'unknown',venue:'unknown',return:'unknown'};
  for(let i=d.members.length;i<Math.min(20,Math.max(1,d.guestCount));i++)d.members.push({id:crypto.randomUUID(),name:i===0?`${d.firstName} ${d.surname}`:'',kind:'adult',dietary:''});
}
function memberFields(lang){
  ensureMembers();const d=rsvpState.data,t=memberCopy[lang];
  return `${d.guestNames?`<p class="note">${t.legacy}${escapeRsvp(d.guestNames)}</p>`:''}<div id="member-rows">${d.members.slice(0,d.guestCount).map((m,i)=>`<fieldset class="member-row"><legend>${t.person} ${i+1}</legend><label>${t.name}<input data-member="${i}" data-field="name" value="${escapeRsvp(m.name)}" maxlength="160" required></label><label>${t.kind}<select data-member="${i}" data-field="kind"><option value="adult" ${m.kind==='adult'?'selected':''}>${t.adult}</option><option value="child" ${m.kind==='child'?'selected':''}>${t.child}</option></select></label><label>${t.diet}<input data-member="${i}" data-field="dietary" value="${escapeRsvp(m.dietary)}" maxlength="500"></label></fieldset>`).join('')}</div>`;
}
function transportFields(lang){
  ensureMembers();const t=memberCopy[lang],r=rsvpCopy[lang];
  return ['church','venue','return'].map(leg=>`<label>${t[leg]}<select data-transport="${leg}">${[['unknown',r.maybe],['yes',r.yes],['no',r.no]].map(([v,label])=>`<option value="${v}" ${rsvpState.data.transport[leg]===v?'selected':''}>${label}</option>`).join('')}</select></label>`).join('');
}
