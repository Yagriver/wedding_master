import {lineTotals,validateFinance} from './finance-model.mjs';
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function effectiveStatus(r){return ['contracted','completed'].includes(r.status)?(r.items.length>0&&r.items.every(i=>i.paid)?'completed':'contracted'):'quote';}
export function summary(r){
 const t={net:0,tax:0,total:0,paid:0,netPaid:0,taxPaid:0};
 for(const i of r.items){const v=lineTotals(i);t.net+=v.net;t.tax+=v.tax;t.total+=v.total;if(i.paid){t.paid+=v.total;t.netPaid+=v.net;t.taxPaid+=v.tax;}}
 return {...t,balance:t.total-t.paid,netBalance:t.net-t.netPaid,taxBalance:t.tax-t.taxPaid};
}
export function events(records){const out=[];for(const r of records){const accepted=effectiveStatus(r)!=='quote';for(const i of r.items){const t=lineTotals(i),event={supplier:r.supplier,label:i.description,amount:t.total,net:t.net,tax:t.tax,rate:i.rate};if(i.paid)out.push({...event,date:i.paidDate,kind:'paid'});else if(accepted&&i.deadline)out.push({...event,date:i.deadline,kind:'deadline'});}}return out.sort((a,b)=>a.date.localeCompare(b.date));}
export function remainingMonth(records,month){return events(records).filter(e=>e.kind==='deadline'&&e.date.slice(0,7)===month).reduce((a,e)=>({total:a.total+e.amount,net:a.net+e.net,tax:a.tax+e.tax,count:a.count+1}),{total:0,net:0,tax:0,count:0});}

export const paymentSymbol=rate=>rate>=800?'💳':'$';

export function monthCompleted(records,month){const items=records.filter(r=>effectiveStatus(r)!=='quote').flatMap(r=>r.items).filter(i=>i.deadline&&i.deadline.slice(0,7)===month);return items.length>0&&items.every(i=>i.paid);}

export function validateItems(input){
 if(!input||input.schemaVersion!==2||!['quote','contracted','completed'].includes(input.status)||!Array.isArray(input.items)||input.items.length<1||input.items.length>60)throw Error('INVALID');
 const date=(v)=>{if(typeof v!=='string'||(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)))throw Error('INVALID');return v;};
 const base=validateFinance({...input,lines:input.items.map(i=>({...i,taxNote:i.taxNote??''})),milestones:[],payments:[]});
 const items=input.items.map((i,n)=>{if(typeof i.id!=='string'||!/^[-\w]{1,80}$/.test(i.id)||typeof i.paid!=='boolean')throw Error('INVALID');const deadline=date(i.deadline),paidDate=date(i.paidDate);if(i.paid&&!paidDate)throw Error('INVALID');return {...base.lines[n],id:i.id,deadline,paid:i.paid,paidDate:i.paid?paidDate:''};});
 if(new Set(items.map(i=>i.id)).size!==items.length)throw Error('INVALID');
 const {lines,milestones,payments,...details}=base;
 const result={...details,schemaVersion:2,items};result.status=effectiveStatus(result);return result;
}
// Only production quotation lines and supplier details are migrated. No old payment dates or amounts are imported.
export function migrateFinance(r){
 if(r.schemaVersion===2)return validateItems(r);
 return validateItems({...r,schemaVersion:2,status:['contracted','completed'].includes(r.status)?'contracted':'quote',items:r.lines.map((line,n)=>({...line,id:'item-'+n,deadline:'',paid:false,paidDate:''}))});
}
