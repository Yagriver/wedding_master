import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {handle} from './worker.mjs';
import {validateItems,migrateFinance,summary,effectiveStatus,events,remainingMonth,monthCompleted,paymentSymbol} from '../finance-items.mjs';
const sample=()=>({schemaVersion:2,supplier:'Test supplier',category:'Catering',title:'Dinner',reference:'Q-1',status:'contracted',currency:'EUR',quoteDate:'2026-09-19',notes:'Private note',document:'https://example.com/quote',items:[{id:'one',description:'Food',amount:10000,basis:'net',rate:1000,taxNote:'',deadline:'2027-06-01',paid:false,paidDate:''},{id:'two',description:'Equipment',amount:12200,basis:'gross',rate:2200,taxNote:'',deadline:'2027-06-30',paid:false,paidDate:''}]});
test('IVA parts, paid parts, completion, calendar and month totals stay consistent',()=>{
 const r=sample();assert.deepEqual(summary(r),{net:20000,tax:3200,total:23200,paid:0,netPaid:0,taxPaid:0,balance:23200,netBalance:20000,taxBalance:3200});
 r.items[0].paid=true;r.items[0].paidDate='2026-09-19';assert.equal(summary(r).netPaid,10000);assert.equal(summary(r).taxPaid,1000);assert.equal(effectiveStatus(r),'contracted');assert.deepEqual(remainingMonth([r],'2027-06'),{total:12200,net:10000,tax:2200,count:1});
 r.items[1].paid=true;r.items[1].paidDate='2026-09-19';assert.equal(validateItems(r).status,'completed');assert.equal(monthCompleted([r],'2027-06'),true);assert.equal(monthCompleted([r],'2027-07'),false);assert.equal(summary(r).balance,0);
 r.items[0].paid=false;assert.equal(validateItems({...r,status:'completed'}).status,'contracted');assert.equal(monthCompleted([r],'2027-06'),false);
 r.status='quote';assert.equal(events([r]).filter(e=>e.kind==='deadline').length,0);assert.equal(monthCompleted([r],'2027-06'),false);
 assert.equal(paymentSymbol(799),'$');assert.equal(paymentSymbol(800),'💳');
});
test('validation blocks stale schemas and invalid values; canonicalizes item metadata',()=>{
 assert.deepEqual(validateItems(sample()),sample());
 for(const modify of [r=>delete r.schemaVersion,r=>r.status='declined',r=>r.currency='USD',r=>r.items=[],r=>r.items[0].amount=-1,r=>r.items[0].amount=1.5,r=>r.items[0].rate=10001,r=>r.items[0].deadline='2027-02-30',r=>r.items[0].paid=true,r=>r.items[0].paid='yes',r=>r.items[0].id='',r=>r.items.push(r.items[0]),r=>r.document='javascript:alert(1)']){const r=sample();modify(r);assert.throws(()=>validateItems(r));}
 const r=sample();r.original={private:'legacy'};r.payments=[{amount:1}];r.items[0].historical=true;r.items[0].paidDate='2026-01-01';const result=validateItems(r);assert.equal(result.original,undefined);assert.equal(result.payments,undefined);assert.equal(result.items[0].historical,undefined);assert.equal(result.items[0].paidDate,'');
});
test('migration preserves quote details and exact prices while removing old schedules and payments',()=>{
 const s=sample();const {schemaVersion,items,...base}=s;const old={...base,lines:items.map(({id,deadline,paid,paidDate,...line})=>line),milestones:[{date:'2027-01-01',amount:900}],payments:[{amount:800}],status:'completed'};
 const r=migrateFinance(old);assert.equal(r.status,'contracted');assert.equal(r.items.length,2);assert.equal(r.reference,old.reference);assert.equal(r.notes,old.notes);assert.equal(r.document,old.document);assert.equal(summary(r).total,23200);assert.equal(summary(r).paid,0);assert(r.items.every(i=>!i.paid&&!i.deadline&&!i.paidDate));assert(!('payments' in r));assert(!('milestones' in r));assert.deepEqual(migrateFinance(r),r);
});
test('authenticated finance CRUD, stale writes, schema rejection and guest isolation',async()=>{
 const db=new DatabaseSync(':memory:');for(const f of ['schema.sql','migrations/002_planning.sql','migrations/003_finances.sql'])db.exec(fs.readFileSync(new URL(f,import.meta.url),'utf8'));
 db.prepare('INSERT INTO responses(lookup_key,payload,version,updated_at) VALUES(?,?,1,?)').run('["guest","test"]','{"kept":true}','2026-09-19');
 const DB={prepare(sql){return{bind(...args){return{first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})};}};}};
 const secret='test-only-key-at-least-24-characters';
 const req=async(route,body={},key=secret,origin)=>{const res=await handle(new Request('https://example.test/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key,...(origin?{Origin:origin}:{})},body:JSON.stringify(body)}),{DB,ADMIN_PASSWORD:secret});return{status:res.status,data:await res.json()};};
 const body={id:'test',version:0,record:sample()};assert.equal((await req('admin/finance/list',{},'')).status,401);assert.equal((await req('admin/finance/save',body,'wrong')).status,401);assert.equal((await req('admin/finance/save',body,secret,'https://evil.test')).status,403);
 assert.equal((await req('admin/finance/save',body)).status,200);assert.equal((await req('admin/finance/save',body)).status,409);
 const items=(await req('admin/finance/list')).data.records[0];assert.equal(items.version,1);assert.deepEqual(items.items,sample().items);
 const paid=sample();paid.items.forEach(i=>{i.paid=true;i.paidDate='2026-09-19';});assert.equal((await req('admin/finance/save',{...body,version:1,record:paid})).data.version,2);assert.equal((await req('admin/finance/list')).data.records[0].status,'completed');
 assert.equal((await req('admin/finance/save',{...body,version:1})).status,409);
 assert.equal((await req('admin/finance/save',{...body,version:2,record:{...sample(),schemaVersion:1}})).status,400);
 assert.equal((await req('admin/finance/delete',{id:'test',version:1})).status,409);assert.equal((await req('admin/finance/delete',{id:'test',version:2},'wrong')).status,401);assert.equal((await req('admin/finance/delete',{id:'test',version:2})).status,200);assert.equal((await req('admin/finance/list')).data.records.length,0);
 assert.equal(db.prepare('SELECT payload FROM responses').get().payload,'{"kept":true}');db.close();
});
