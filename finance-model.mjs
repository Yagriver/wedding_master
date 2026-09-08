// Monetary input is stored in cents; rates in hundredths of one percent.
export const statuses=['quote','contracted','completed','declined','cancelled'];
export function cents(value){
  if(!/^\d{1,8}(\.\d{1,2})?$/.test(String(value)))throw new Error('Enter a positive amount with at most two decimals.');
  return Math.round(Number(value)*100);
}
export function lineTotals(line){
  const net=line.basis==='net'?line.amount:Math.round(line.amount*10000/(10000+line.rate));
  const tax=line.basis==='net'?Math.round(net*line.rate/10000):line.amount-net;
  return {net,tax,total:net+tax};
}
export function totals(record){
  const sum=record.lines.reduce((a,l)=>{const t=lineTotals(l);for(const k of ['net','tax','total'])a[k]+=t[k];return a;},{net:0,tax:0,total:0});
  sum.paid=record.payments.reduce((n,p)=>n+(p.kind==='refund'?-p.amount:p.amount),0);
  sum.balance=sum.total-sum.paid;
  sum.netPaid=0;sum.taxPaid=0;sum.unallocatedPaid=0;sum.unallocatedCount=0;
  for(const p of record.payments){
    const sign=p.kind==='refund'?-1:1;
    if(p.netAmount===undefined||p.taxAmount===undefined){sum.unallocatedPaid+=sign*p.amount;sum.unallocatedCount++;}
    else{sum.netPaid+=sign*p.netAmount;sum.taxPaid+=sign*p.taxAmount;}
  }
  sum.netBalance=sum.net-sum.netPaid;
  sum.taxBalance=sum.tax-sum.taxPaid;
  return sum;
}
export function paymentSplit(amount,mode,rate){
  if(!Number.isSafeInteger(amount)||amount<0||amount>9999999999)throw new Error('INVALID');
  if(!['with','without'].includes(mode))throw new Error('INVALID');
  if(mode==='without')return {netAmount:amount,taxAmount:0};
  if(!Number.isInteger(rate)||rate<0||rate>10000)throw new Error('INVALID');
  const netAmount=Math.round(amount*10000/(10000+rate));
  return {netAmount,taxAmount:amount-netAmount};
}
export function dueAmount(record,milestone){
  return Math.max(0,milestone.amount-record.payments.filter(p=>p.milestone===milestone.id).reduce((n,p)=>n+(p.kind==='refund'?-p.amount:p.amount),0));
}
export function validateFinance(input){
  const str=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new Error('INVALID');return v.trim();};
  const amount=v=>{if(!Number.isSafeInteger(v)||v<0||v>9999999999)throw new Error('INVALID');return v;};
  const date=(v,required=false)=>{v=str(v,10,required);if(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw new Error('INVALID');return v;};
  const list=(v,max)=>{if(!Array.isArray(v)||v.length>max)throw new Error('INVALID');return v;};
  if(!input||!statuses.includes(input.status))throw new Error('INVALID');
  const record={supplier:str(input.supplier,160,true),category:str(input.category,100,true),title:str(input.title,160,true),reference:str(input.reference,160),status:input.status,currency:'EUR',quoteDate:date(input.quoteDate),notes:str(input.notes,2000),document:str(input.document,1000)};
  if(input.currency!=='EUR')throw new Error('INVALID');
  if(record.document){const u=new URL(record.document);if(!['https:','http:'].includes(u.protocol))throw new Error('INVALID');}
  record.lines=list(input.lines,60).map(l=>{
    if(!['net','gross'].includes(l.basis)||!Number.isInteger(l.rate)||l.rate<0||l.rate>10000)throw new Error('INVALID');
    return {description:str(l.description,200,true),amount:amount(l.amount),basis:l.basis,rate:l.rate,taxNote:str(l.taxNote,200)};
  });
  if(!record.lines.length)throw new Error('INVALID');
  record.milestones=list(input.milestones,40).map(m=>({id:str(m.id,80,true),label:str(m.label,160,true),date:date(m.date,true),amount:amount(m.amount)}));
  if(new Set(record.milestones.map(m=>m.id)).size!==record.milestones.length)throw new Error('INVALID');
  record.payments=list(input.payments,80).map(p=>{
    if(!['payment','refund'].includes(p.kind))throw new Error('INVALID');
    const milestone=str(p.milestone,80);if(milestone&&!record.milestones.some(m=>m.id===milestone))throw new Error('INVALID');
    const value=amount(p.amount);if(!value)throw new Error('INVALID');
    const split={};
    if(p.paymentMode!==undefined){
      Object.assign(split,paymentSplit(value,p.paymentMode,p.ivaRate),{paymentMode:p.paymentMode,ivaRate:p.paymentMode==='with'?p.ivaRate:0});
    }else if(p.netAmount!==undefined||p.taxAmount!==undefined){
      split.netAmount=amount(p.netAmount);split.taxAmount=amount(p.taxAmount);
      if(split.netAmount+split.taxAmount!==value)throw new Error('INVALID');
    }
    return {date:date(p.date,true),amount:value,...split,kind:p.kind,method:str(p.method,80),reference:str(p.reference,200),milestone};
  });
  return record;
}
