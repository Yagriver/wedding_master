const rsvpCopy={
  en:{name:'First name',surname:'First surname',find:'Find my response',intro:'Enter the same first name and first surname each time to create or update your household’s response.',privacy:'Access uses your name only. Anyone who knows it can view or change these answers. Share only the details you are comfortable including.',offline:'Online registration is not open yet. The form will be available once storage is connected.',local:'Local test version — responses here are not sent to the couple’s online guest list. Please use fictional details.',new:'No response found. Would you like to register?',register:'Create a response',found:'Your saved response',form:'Your plans',attendance:'Will you attend?',yes:'Yes',no:'No',maybe:'Not sure yet',choose:'Please choose',count:'How many people, including you?',countHelp:'Total attending from your household, including children. For this first version: up to 20.',guests:'Names of the people attending',hotel:'Where will you stay?',hotelHelp:'Leave blank if not booked yet.',diet:'Dietary requirements (optional)',dietHelp:'Include the person’s name for each requirement. Avoid unnecessary medical details.',bus:'Would you use the arranged buses?',message:'A message for us (optional)',save:'Save response',edit:'Edit response',saved:'Your response has been saved. Return with the same name and first surname to view or change it.',back:'Use another name',loading:'Please wait…',error:'We couldn’t connect. Your entries are still here; please try again.',invalid:'Please check the required answers and guest count.',conflict:'This response changed in another session. Retrieve it again before saving. Your current entries are still shown.',reload:'Retrieve latest response',same:'If this is not your response, or someone shares your name, please contact the couple before changing it.',optional:'Optional',decline:'Thank you for letting us know.',unsaved:'You have unsaved changes. Leave without saving?'},
  es:{name:'Nombre',surname:'Primer apellido',find:'Buscar mi respuesta',intro:'Introduce el mismo nombre y primer apellido cada vez para crear o modificar la respuesta de tu familia.',privacy:'El acceso se realiza solo con tu nombre. Cualquiera que lo conozca puede ver o cambiar estas respuestas. Comparte solo los detalles que quieras incluir.',offline:'Las confirmaciones en línea todavía no están abiertas. El formulario estará disponible cuando conectemos el almacenamiento.',local:'Versión de prueba local: estas respuestas no se envían a la lista de invitados en línea. Utiliza datos ficticios.',new:'No hemos encontrado una respuesta. ¿Quieres registrarte?',register:'Crear una respuesta',found:'Tu respuesta guardada',form:'Tus planes',attendance:'¿Asistirás?',yes:'Sí',no:'No',maybe:'Aún no lo sé',choose:'Selecciona una opción',count:'¿Cuántas personas, incluyéndote?',countHelp:'Total de asistentes de tu familia, incluidos los niños. En esta primera versión: hasta 20.',guests:'Nombres de las personas que asistirán',hotel:'¿Dónde te alojarás?',hotelHelp:'Déjalo en blanco si aún no has reservado.',diet:'Necesidades alimentarias (opcional)',dietHelp:'Indica el nombre de cada persona y su necesidad. Evita detalles médicos innecesarios.',bus:'¿Utilizarías los autobuses organizados?',message:'Un mensaje para nosotros (opcional)',save:'Guardar respuesta',edit:'Modificar respuesta',saved:'Tu respuesta se ha guardado. Vuelve con el mismo nombre y primer apellido para consultarla o modificarla.',back:'Usar otro nombre',loading:'Un momento…',error:'No hemos podido conectar. Tus datos siguen aquí; inténtalo de nuevo.',invalid:'Revisa las respuestas obligatorias y el número de personas.',conflict:'Esta respuesta ha cambiado en otra sesión. Recupérala de nuevo antes de guardar. Tus datos actuales siguen visibles.',reload:'Recuperar la última respuesta',same:'Si esta no es tu respuesta o alguien tiene tu mismo nombre, contacta con los novios antes de modificarla.',optional:'Opcional',decline:'Gracias por avisarnos.',unsaved:'Tienes cambios sin guardar. ¿Quieres salir sin guardarlos?'},
  it:{name:'Nome',surname:'Primo cognome',find:'Trova la mia risposta',intro:'Inserisci sempre lo stesso nome e primo cognome per creare o modificare la risposta della tua famiglia.',privacy:'L’accesso avviene solo con il nome. Chi lo conosce può vedere o modificare queste risposte. Condividi solo i dettagli che desideri includere.',offline:'Le conferme online non sono ancora aperte. Il modulo sarà disponibile quando collegheremo l’archivio delle risposte.',local:'Versione di prova locale: queste risposte non vengono inviate alla lista degli invitati online. Usa dati fittizi.',new:'Non abbiamo trovato una risposta. Vuoi registrarti?',register:'Crea una risposta',found:'La tua risposta salvata',form:'I tuoi programmi',attendance:'Parteciperai?',yes:'Sì',no:'No',maybe:'Non lo so ancora',choose:'Scegli un’opzione',count:'Quante persone, te compreso?',countHelp:'Totale dei partecipanti della tua famiglia, bambini compresi. In questa prima versione: fino a 20.',guests:'Nomi delle persone che parteciperanno',hotel:'Dove alloggerai?',hotelHelp:'Lascia vuoto se non hai ancora prenotato.',diet:'Esigenze alimentari (facoltativo)',dietHelp:'Indica il nome di ogni persona e la sua esigenza. Evita dettagli medici non necessari.',bus:'Useresti gli autobus organizzati?',message:'Un messaggio per noi (facoltativo)',save:'Salva la risposta',edit:'Modifica la risposta',saved:'La tua risposta è stata salvata. Torna con lo stesso nome e primo cognome per consultarla o modificarla.',back:'Usa un altro nome',loading:'Un momento…',error:'Impossibile connettersi. I dati sono ancora qui; riprova.',invalid:'Controlla le risposte obbligatorie e il numero di persone.',conflict:'Questa risposta è cambiata in un’altra sessione. Recuperala di nuovo prima di salvare. I dati attuali sono ancora visibili.',reload:'Recupera l’ultima risposta',same:'Se questa non è la tua risposta o qualcuno ha il tuo stesso nome, contatta gli sposi prima di modificarla.',optional:'Facoltativo',decline:'Grazie per averci avvisato.',unsaved:'Hai modifiche non salvate. Vuoi uscire senza salvarle?'}
};
const blankRsvp=()=>({firstName:'',surname:'',attendance:'',guestCount:1,guestNames:'',hotel:'',dietary:'',bus:'unknown',message:''});
const rsvpState={step:'lookup',data:blankRsvp(),version:0,busy:false,status:'',dirty:false};
const escapeRsvp=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rsvpView(lang){
  const t=rsvpCopy[lang],s=rsvpState,d=s.data;
  const note=window.RSVP_API_URL==='/api'?`<p class="notice">${t.local}</p>`:'';
  if(!window.RSVP_API_URL)return `<p class="notice">${t.offline}</p>`;
  const input=(key,label,max=200,help='',type='text')=>`<label>${label}<input name="${key}" type="${type}" maxlength="${max}" value="${escapeRsvp(d[key])}" ${['firstName','surname'].includes(key)?'required autocomplete="off"':''}>${help?`<span class="help">${help}</span>`:''}</label>`;
  const area=(key,label,help='')=>`<label>${label}<textarea name="${key}" maxlength="1000">${escapeRsvp(d[key])}</textarea>${help?`<span class="help">${help}</span>`:''}</label>`;
  const select=(key,label,options)=>`<label>${label}<select name="${key}" required>${options.map(([value,text])=>`<option value="${value}" ${d[key]===value?'selected':''}>${text}</option>`).join('')}</select></label>`;
  const status=`<p class="rsvp-status" role="status" aria-live="polite">${t[s.busy?'loading':s.status]||''}</p>`;
  if(s.step==='lookup')return `${note}<form class="rsvp-form" id="rsvp-lookup"><p>${t.intro}</p><div class="rsvp-fields">${input('firstName',t.name,80)}${input('surname',t.surname,80)}</div><p class="note">${t.privacy}</p><button class="button" ${s.busy?'disabled':''}>${t.find}</button>${status}</form>`;
  const who=`<p class="rsvp-identity">${escapeRsvp(d.firstName)} ${escapeRsvp(d.surname)}</p>`;
  if(s.step==='new')return `${note}<div class="rsvp-form">${who}<p>${t.new}</p><div class="rsvp-actions"><button class="button" data-rsvp="register">${t.register}</button><button class="button secondary" data-rsvp="reset">${t.back}</button></div></div>`;
  const readonly=s.step==='saved';
  return `${note}<form class="rsvp-form" id="rsvp-answer">${who}<p class="note">${t.same}</p>${readonly?`<p class="notice" role="status">${t.saved}</p>`:''}<fieldset ${readonly?'disabled':''}><legend>${t.form}</legend>${select('attendance',t.attendance,[['',t.choose],['yes',t.yes],['no',t.no],['maybe',t.maybe]])}<div id="rsvp-attending" ${d.attendance==='no'?'hidden':''}><label>${t.count}<input name="guestCount" type="number" min="${d.attendance==='yes'?1:0}" max="20" step="1" value="${d.guestCount}" required><span class="help">${t.countHelp}</span></label>${area('guestNames',t.guests)}${input('hotel',t.hotel,200,t.hotelHelp)}${area('dietary',t.diet,t.dietHelp)}${select('bus',t.bus,[['unknown',t.maybe],['yes',t.yes],['no',t.no]])}</div>${area('message',t.message)}</fieldset><div class="rsvp-actions">${readonly?`<button type="button" class="button" data-rsvp="edit">${t.edit}</button>`:`<button class="button" ${s.busy?'disabled':''}>${t.save}</button>`}<button type="button" class="button secondary" data-rsvp="reset" ${s.busy?'disabled':''}>${t.back}</button>${s.status==='conflict'?`<button type="button" class="button secondary" data-rsvp="reload">${t.reload}</button>`:''}</div>${status}</form>`;
}
async function rsvpRequest(action,body){
  const response=await fetch(window.RSVP_API_URL.replace(/\/$/,'')+'/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(response.status===409?'conflict':response.status===400?'invalid':'error');
  return response.json();
}
async function lookupRsvp(){
  const s=rsvpState;s.busy=true;s.status='';render();
  try{const result=await rsvpRequest('lookup',{firstName:s.data.firstName,surname:s.data.surname});s.version=result.found?result.version:0;if(result.found){s.data=result.data;s.step='edit';}else s.step='new';s.dirty=false;}
  catch(e){s.status=['conflict','invalid'].includes(e.message)?e.message:'error';}
  finally{s.busy=false;render();}
}
function bindRsvp(){
  const s=rsvpState;
  if(s.busy)document.querySelectorAll('.rsvp-form input,.rsvp-form select,.rsvp-form textarea').forEach(el=>el.disabled=true);
  document.querySelectorAll('.rsvp-form input,.rsvp-form select,.rsvp-form textarea').forEach(el=>el.addEventListener('input',()=>{
    s.data[el.name]=el.name==='guestCount'?Number(el.value):el.value;s.dirty=s.step==='edit';s.status='';
    if(el.name==='attendance'){
      if(el.value==='no')s.data.guestCount=0;else if(s.data.guestCount===0)s.data.guestCount=1;
      const box=document.querySelector('#rsvp-attending');box.hidden=el.value==='no';
      const count=box.querySelector('[name="guestCount"]');count.value=s.data.guestCount;count.min=el.value==='yes'?1:0;
    }
  }));
  document.querySelector('#rsvp-lookup')?.addEventListener('submit',event=>{event.preventDefault();if(!s.busy)lookupRsvp();});
  document.querySelector('#rsvp-answer')?.addEventListener('submit',async event=>{
    event.preventDefault();if(s.busy||s.step==='saved')return;
    s.busy=true;s.status='';render();
    const data={...s.data};if(data.attendance==='no')Object.assign(data,{guestCount:0,guestNames:'',hotel:'',dietary:'',bus:'unknown'});
    try{const result=await rsvpRequest('save',{...data,version:s.version});s.data=result.data;s.version=result.version;s.step='saved';s.dirty=false;}
    catch(e){s.status=['conflict','invalid'].includes(e.message)?e.message:'error';}
    finally{s.busy=false;render();}
  });
  document.querySelectorAll('[data-rsvp]').forEach(el=>el.addEventListener('click',()=>{
    if(s.busy)return;
    const action=el.dataset.rsvp;
    if(['reset','reload'].includes(action)&&s.dirty&&!window.confirm(rsvpCopy[language].unsaved))return;
    if(action==='reset')Object.assign(s,{step:'lookup',data:blankRsvp(),version:0,status:'',dirty:false});
    if(action==='register'||action==='edit')s.step='edit';
    if(action==='reload'){lookupRsvp();return;}render();
  }));
}
window.addEventListener('beforeunload',event=>{if(rsvpState.dirty){event.preventDefault();event.returnValue='';}});
