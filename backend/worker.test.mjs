import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {handle} from './worker.mjs';
test('create, name normalization, retrieve, update, conflicts, decline, validation and origin protection',async()=>{
  const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
  db.exec(fs.readFileSync(new URL('./migrations/002_planning.sql',import.meta.url),'utf8'));
const DB = { prepare(sql) { return { bind(...args) { return {
  first: async () => db.prepare(sql).get(...args),
  all: async () => ({results:db.prepare(sql).all(...args)}),
  run: async () => ({meta: {changes: Number(db.prepare(sql).run(...args).changes)}})
}; } }; } };
  const request=async(route,body,origin='https://yagriver.github.io')=>{const r=await handle(new Request('https://example.test/'+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)}),{DB});return {status:r.status,body:await r.json(),headers:r.headers};};
  const data={firstName:'Tést',surname:'Guest',attendance:'yes',guestCount:2,guestNames:'Test Guest, Example Guest',hotel:'Not booked',dietary:'',bus:'unknown',message:'',version:0};
  assert.equal((await request('lookup',data)).body.found,false);
  const create=await request('save',data);assert.equal(create.status,200);assert.equal(create.body.version,1);
  const found=await request('lookup',{firstName:'  TEST ',surname:' guest '});assert.equal(found.body.data.guestCount,2);assert.equal(found.body.version,1);assert.equal(found.headers.get('Cache-Control'),'no-store');
  assert.equal((await request('save',data)).status,409);
  assert.equal((await request('save',{...data,version:1,hotel:'Example hotel'})).body.version,2);
  assert.equal((await request('save',{...data,version:1})).status,409);
  const decline=await request('save',{...data,version:2,attendance:'no',guestCount:0});assert.equal(decline.status,200);
  assert.equal((await request('lookup',data)).body.data.attendance,'no');
  assert.equal((await request('save',{...data,guestCount:-1})).status,400);
  assert.equal((await request('save',{...data,guestCount:1.5})).status,400);
  assert.equal((await request('save',{...data,attendance:'no',guestCount:2})).status,400);
  assert.equal((await request('lookup',{firstName:'',surname:'Guest'})).status,400);
  assert.equal((await request('lookup',data,'https://unrelated.example')).status,403);
  assert.equal((await request('lookup',{firstName:'Other',surname:'Guest'})).body.found,false);
  assert.equal((await request('lookup',{firstName:"'; DROP TABLE responses;--",surname:'Guest'})).body.found,false);
  assert.equal(db.prepare('SELECT count(*) AS n FROM responses').get().n,1);
  const secret='test-only-administrator-key-32-chars';
  const adminRequest=async(route,body={},key=secret)=>{
    const response=await handle(new Request('https://example.test/admin/'+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://yagriver.github.io',Authorization:'Bearer '+key},body:JSON.stringify(body)}),{DB,ADMIN_PASSWORD:secret});
    return {status:response.status,body:await response.json()};
  };
  assert.equal((await adminRequest('list',{},'wrong')).status,401);
  assert.equal((await request('admin/list',{})).status,401);
  const lookupKey=JSON.stringify(['test','guest']);
  const plan={label:'Test family',group:'Family',notes:'Private planning note',invited:[{id:'invite-1',name:'Test Guest',kind:'adult'}],tables:{'invite-1':'4'}};
  assert.equal((await adminRequest('plan',{key:lookupKey,version:0,plan})).status,200);
  assert.equal((await adminRequest('plan',{key:lookupKey,version:0,plan})).status,409);
  const list=await adminRequest('list');assert.equal(list.body.households.length,1);assert.equal(list.body.households[0].plan.notes,'Private planning note');
  const guest=await request('lookup',data);assert(!JSON.stringify(guest.body).includes('Private planning note'));assert(!('plan' in guest.body));
  const updatedResponse={...data,version:3,members:[{id:'a',name:'Test Guest',kind:'adult',dietary:'Vegetarian'},{id:'b',name:'Example Guest',kind:'child',dietary:''}],transport:{church:'yes',venue:'yes',return:'no'}};
  assert.equal((await request('save',updatedResponse)).status,200);
  assert.equal((await adminRequest('list')).body.households[0].plan.tables['invite-1'],'4');
  assert.equal((await request('save',{...updatedResponse,version:4,members:[]})).status,400);
  assert.equal((await request('save',{...updatedResponse,version:4,members:[updatedResponse.members[0],updatedResponse.members[0]]})).status,400);
  assert.equal((await request('save',{...updatedResponse,version:4,transport:{church:'bad'}})).status,400);
  const pendingKey=JSON.stringify(['another','guest']);
  assert.equal((await adminRequest('plan',{key:pendingKey,version:0,plan})).status,200);
  const pending=(await adminRequest('list')).body.households.find(h=>h.key===pendingKey);assert(!pending.response);assert.equal(pending.plan.invited.length,1);
  db.close();
});
