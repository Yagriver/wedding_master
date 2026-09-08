import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {handle} from './worker.mjs';
import {cents,paymentSplit,lineTotals,totals,dueAmount,validateFinance} from '../finance-model.mjs';
const sample=()=>({supplier:'Example supplier',category:'Catering',title:'Wedding dinner',reference:'Q-1',status:'contracted',currency:'EUR',quoteDate:'2026-09-08',notes:'Private contract note',document:'https://example.com/quote',lines:[{description:'Food',amount:100000,basis:'net',rate:1000,taxNote:''},{description:'Equipment',amount:24400,basis:'gross',rate:2200,taxNote:''}],milestones:[{id:'deposit',label:'Deposit',date:'2027-01-10',amount:30000}],payments:[{date:'2026-09-08',amount:10000,kind:'payment',method:'Transfer',reference:'TX1',milestone:'deposit'}]});
test('mixed IVA, inclusive prices, cent rounding, partial payments and refunds',()=>{
  assert.equal(cents('0.29'),29);assert.throws(()=>cents('1.001'));assert.throws(()=>cents('-1'));
  assert.deepEqual(lineTotals({amount:12200,basis:'gross',rate:2200}),{net:10000,tax:2200,total:12200});
  assert.deepEqual(lineTotals({amount:5,basis:'net',rate:1000}),{net:5,tax:1,total:6});
  assert.deepEqual(lineTotals({amount:12345,basis:'gross',rate:0}),{net:12345,tax:0,total:12345});
  const r=sample();assert.deepEqual(totals(r),{net:120000,tax:14400,total:134400,paid:10000,balance:124400,netPaid:0,taxPaid:0,unallocatedPaid:10000,unallocatedCount:1,netBalance:120000,taxBalance:14400});
  assert.equal(dueAmount(r,r.milestones[0]),20000);
  r.payments.push({...r.payments[0],kind:'refund',amount:5000});assert.equal(totals(r).paid,5000);assert.equal(dueAmount(r,r.milestones[0]),25000);
  r.payments.push({...r.payments[0],milestone:'',amount:200000});assert.equal(dueAmount(r,r.milestones[0]),25000);assert(totals(r).balance<0);
});
test('server validates rates, dates, precision, lengths, links and deadline references',()=>{
  assert.deepEqual(validateFinance(sample()),sample());
  for(const modify of [r=>r.lines[0].rate=-1,r=>r.lines[0].rate=10001,r=>r.lines[0].amount=1.5,r=>r.lines=[],r=>r.quoteDate='2026-02-30',r=>r.payments[0].amount=0,r=>r.payments[0].milestone='missing',r=>r.document='javascript:alert(1)',r=>r.status='unknown',r=>r.currency='CHF',r=>r.supplier='',r=>r.milestones.push(r.milestones[0])]){const r=sample();modify(r);assert.throws(()=>validateFinance(r));}
});
test('private finance CRUD, stale writes and migration preserve guest tables',async()=>{
  const db=new DatabaseSync(':memory:');
  for(const file of ['schema.sql','migrations/002_planning.sql','migrations/003_finances.sql','migrations/003_finances.sql'])db.exec(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
  const DB={prepare(sql){return{bind(...args){return{first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})};}};}};
  const secret='test-finance-administrator-key-only';
  const request=async(route,body={},key=secret)=>{const r=await handle(new Request('https://example.test/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body)}),{DB,ADMIN_PASSWORD:secret});return{status:r.status,body:await r.json()};};
  assert.equal((await request('admin/finance/list',{},'')).status,401);
  assert.equal((await request('admin/finance/save',{id:'x',version:0,record:sample()},'wrong')).status,401);
  const create={id:'quote-1',version:0,record:sample()};assert.equal((await request('admin/finance/save',create)).status,200);
  assert.equal((await request('admin/finance/save',create)).status,409);
  const list=await request('admin/finance/list');assert.equal(list.body.records.length,1);assert.equal(list.body.records[0].notes,'Private contract note');
  assert.equal((await request('admin/finance/save',{...create,version:1,record:{...sample(),status:'completed'}})).body.version,2);
  assert.equal((await request('admin/finance/save',{...create,version:1})).status,409);
  assert.equal((await request('admin/finance/save',{...create,version:2,record:{...sample(),lines:[]}})).status,400);
  assert.equal((await request('lookup',{firstName:'Example',surname:'Supplier'})).body.found,false);
  assert.equal((await request('admin/list')).body.households.length,0);
  assert.equal((await request('admin/finance/unknown')).status,404);
  assert.equal((await request('admin/finance/list')).body.records[0].status,'completed');
  assert.equal((await request('admin/finance/delete',{id:'quote-1',version:2},'wrong')).status,401);
  assert.equal((await request('admin/finance/delete',{id:'quote-1',version:1})).status,409);
  assert.equal((await request('admin/finance/delete',{id:'quote-1',version:0})).status,400);
  assert.equal((await request('admin/finance/list')).body.records.length,1);
  assert.equal((await request('admin/finance/delete',{id:'quote-1',version:2})).body.deleted,true);
  assert.equal((await request('admin/finance/list')).body.records.length,0);
  assert.equal((await request('admin/finance/delete',{id:'quote-1',version:2})).status,409);
  db.close();
});

test('net-only, IVA-only, mixed payments, component refunds and overpayments stay independent',()=>{
  const r=sample();
  r.payments=[{...r.payments[0],amount:100000,netAmount:100000,taxAmount:0}];
  let t=totals(r);assert.equal(t.netBalance,20000);assert.equal(t.taxBalance,14400);
  r.payments.push({...r.payments[0],amount:10000,netAmount:0,taxAmount:10000});
  t=totals(r);assert.equal(t.netBalance,20000);assert.equal(t.taxBalance,4400);
  r.payments.push({...r.payments[0],amount:24400,netAmount:20000,taxAmount:4400});
  t=totals(r);assert.equal(t.balance,0);assert.equal(t.netBalance,0);assert.equal(t.taxBalance,0);
  r.payments.push({...r.payments[0],kind:'refund',amount:1000,netAmount:0,taxAmount:1000});
  t=totals(r);assert.equal(t.netBalance,0);assert.equal(t.taxBalance,1000);assert.equal(t.balance,1000);
  r.payments.push({...r.payments[0],amount:2000,netAmount:2000,taxAmount:0});
  t=totals(r);assert.equal(t.netBalance,-2000);assert.equal(t.taxBalance,1000);assert.equal(t.balance,-1000);
  assert.equal(t.paid,t.netPaid+t.taxPaid);assert.equal(t.unallocatedCount,0);
  assert.deepEqual(validateFinance(r),r);
});
test('split validation rejects incomplete, negative, fractional and mismatched components',()=>{
  for(const split of [{netAmount:9000},{taxAmount:1000},{netAmount:-1,taxAmount:10001},{netAmount:9000.5,taxAmount:999.5},{netAmount:9000,taxAmount:0},{netAmount:null,taxAmount:10000}]){
    const r=sample();Object.assign(r.payments[0],split);assert.throws(()=>validateFinance(r));
  }
  const r=sample();r.payments.push({...r.payments[0],kind:'refund'});
  const t=totals(r);assert.equal(t.unallocatedPaid,0);assert.equal(t.unallocatedCount,2);
  assert.equal(t.netPaid,0);assert.equal(t.taxPaid,0);
});
test('payment split survives API save and reload',async()=>{
  const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(new URL('migrations/003_finances.sql',import.meta.url),'utf8'));
  const DB={prepare(sql){return{bind(...args){return{all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})};}};}};
  const secret='finance-split-test-key-32-characters';
  const request=async(route,body)=>{const response=await handle(new Request('https://example.test/admin/finance/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+secret},body:JSON.stringify(body)}),{DB,ADMIN_PASSWORD:secret});assert.equal(response.status,200);return response.json();};
  const r=sample();Object.assign(r.payments[0],{netAmount:9000,taxAmount:1000});
  await request('save',{id:'split',version:0,record:r});
  const saved=(await request('list',{})).records[0];
  assert.deepEqual(saved.payments,r.payments);assert.equal(totals(saved).taxPaid,1000);
  db.close();
});

test('payment IVA mode calculates inclusive amounts on the server',()=>{
  assert.deepEqual(paymentSplit(11000,'with',1000),{netAmount:10000,taxAmount:1000});
  assert.deepEqual(paymentSplit(12200,'with',2200),{netAmount:10000,taxAmount:2200});
  assert.deepEqual(paymentSplit(11000,'without',1000),{netAmount:11000,taxAmount:0});
  assert.deepEqual(paymentSplit(100,'with',0),{netAmount:100,taxAmount:0});
  assert.deepEqual(paymentSplit(100,'with',2200),{netAmount:82,taxAmount:18});
  assert.throws(()=>paymentSplit(100,'with',undefined));
  assert.throws(()=>paymentSplit(100,'with',10001));
  const r=sample();Object.assign(r.payments[0],{amount:11000,paymentMode:'with',ivaRate:1000,netAmount:1,taxAmount:1});
  const saved=validateFinance(r);
  assert.equal(saved.payments[0].netAmount,10000);assert.equal(saved.payments[0].taxAmount,1000);
  assert.equal(saved.payments[0].ivaRate,1000);assert.equal(saved.payments[0].paymentMode,'with');
  r.payments[0].paymentMode='without';const netOnly=validateFinance(r);
  assert.equal(netOnly.payments[0].taxAmount,0);assert.equal(netOnly.payments[0].netAmount,11000);
});
